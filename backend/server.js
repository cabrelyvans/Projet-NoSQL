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

