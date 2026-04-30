require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const Redis = require('ioredis');
const neo4j = require('neo4j-driver');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'travel_db';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

let mongoClient;
let db;
let redis;
let neo4jDriver;

async function connectDatabases() {
  mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  db = mongoClient.db(MONGO_DB);
  console.log('✓ MongoDB connected');

  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  console.log('✓ Redis connected');

  neo4jDriver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
  );
  await neo4jDriver.verifyConnectivity();
  console.log('✓ Neo4j connected');
}

app.get('/offers', async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing required params: from, to' });
    }

    const cacheKey = `offers:${from}:${to}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ source: 'cache', data: JSON.parse(cached) });
    }

    const offers = await db
      .collection('offers')
      .find({ from, to })
      .sort({ price: 1 })
      .limit(parseInt(limit))
      .toArray();

    // TTL court : les prix bougent vite
    await redis.setex(cacheKey, 60, JSON.stringify(offers));

    res.json({ source: 'database', data: offers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid offer ID' });
    }

    const cacheKey = `offer:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ source: 'cache', data: JSON.parse(cached) });
    }

    const offer = await db.collection('offers').findOne({ _id: new ObjectId(id) });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (c:City {code: $city})-[:NEAR]->(n:City)
         RETURN n.code AS city
         ORDER BY n.weight DESC
         LIMIT 3`,
        { city: offer.to }
      );

      const nearbyCities = result.records.map(r => r.get('city'));

      const relatedOffers = await db
        .collection('offers')
        .find({
          to: { $in: nearbyCities },
          _id: { $ne: offer._id }
        })
        .limit(3)
        .toArray();

      offer.relatedOffers = relatedOffers.map(o => o._id.toString());
    } catch (neoError) {
      // Neo4j optionnel : on dégrade plutôt que de faire planter la requête
      offer.relatedOffers = [];
    } finally {
      await session.close();
    }

    await redis.setex(cacheKey, 300, JSON.stringify(offer));

    res.json({ source: 'database', data: offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/reco', async (req, res) => {
  try {
    const { city, k = 3 } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'Missing required param: city' });
    }

    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (c:City {code: $city})-[:NEAR]->(n:City)
         RETURN n.code AS city
         ORDER BY n.weight DESC
         LIMIT $k`,
        // neo4j.int() : sinon le driver envoie un float et LIMIT refuse
        { city, k: neo4j.int(parseInt(k)) }
      );

      const recommendations = result.records.map(record => ({
        city: record.get('city')
      }));

      res.json({ data: recommendations });
    } finally {
      await session.close();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const token = crypto.randomUUID();

    // Session expire au bout de 15 min d'inactivité
    await redis.setex(`session:${token}`, 900, userId);

    res.json({
      token,
      expires_in: 900
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/offers', async (req, res) => {
  try {
    const offer = req.body;

    if (!offer.from || !offer.to || !offer.price) {
      return res.status(400).json({ error: 'Missing required fields: from, to, price' });
    }

    const result = await db.collection('offers').insertOne(offer);

    // Notifie les abonnés temps réel sur le channel offers:new
    await redis.publish('offers:new', JSON.stringify({
      id: result.insertedId.toString(),
      ...offer
    }));

    res.status(201).json({
      message: 'Offer created',
      id: result.insertedId.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await connectDatabases();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Ferme les connexions DB sur SIGINT, sinon on laisse traîner des sockets ouverts
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoClient.close();
  await redis.quit();
  await neo4jDriver.close();
  process.exit(0);
});

start();
