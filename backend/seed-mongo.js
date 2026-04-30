require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'travel_db';
const RESET = process.argv.includes('--reset');

const offers = [
  // PAR -> LON
  { from: 'PAR', to: 'LON', departDate: '2026-05-01', returnDate: '2026-05-07', provider: 'AirFrance', price: 250, currency: 'EUR', legs: [], hotel: null, activity: null },
  { from: 'PAR', to: 'LON', departDate: '2026-05-03', returnDate: '2026-05-10', provider: 'EasyJet',   price: 180, currency: 'EUR', legs: [], hotel: null, activity: null },
  { from: 'PAR', to: 'LON', departDate: '2026-06-12', returnDate: '2026-06-18', provider: 'BritishAirways', price: 310, currency: 'EUR', legs: [], hotel: { name: 'Hilton London', nights: 6 }, activity: null },

  // PAR -> BRU
  { from: 'PAR', to: 'BRU', departDate: '2026-05-04', returnDate: '2026-05-08', provider: 'Thalys',    price: 95,  currency: 'EUR', legs: [], hotel: null, activity: null },
  { from: 'PAR', to: 'BRU', departDate: '2026-07-01', returnDate: '2026-07-05', provider: 'Eurostar',  price: 120, currency: 'EUR', legs: [], hotel: null, activity: { name: 'Beer tour', price: 40 } },

  // PAR -> AMS
  { from: 'PAR', to: 'AMS', departDate: '2026-05-15', returnDate: '2026-05-22', provider: 'KLM',       price: 220, currency: 'EUR', legs: [], hotel: null, activity: null },
  { from: 'PAR', to: 'AMS', departDate: '2026-06-20', returnDate: '2026-06-27', provider: 'Transavia', price: 165, currency: 'EUR', legs: [], hotel: { name: 'Mövenpick Amsterdam', nights: 7 }, activity: null },

  // LON -> PAR
  { from: 'LON', to: 'PAR', departDate: '2026-05-09', returnDate: '2026-05-14', provider: 'Eurostar',  price: 140, currency: 'EUR', legs: [], hotel: null, activity: null },
  { from: 'LON', to: 'PAR', departDate: '2026-06-05', returnDate: '2026-06-10', provider: 'AirFrance', price: 230, currency: 'EUR', legs: [], hotel: null, activity: null },

  // BRU -> PAR
  { from: 'BRU', to: 'PAR', departDate: '2026-05-20', returnDate: '2026-05-25', provider: 'Thalys',    price: 105, currency: 'EUR', legs: [], hotel: null, activity: null },

  // AMS -> LON
  { from: 'AMS', to: 'LON', departDate: '2026-06-01', returnDate: '2026-06-08', provider: 'KLM',       price: 195, currency: 'EUR', legs: [], hotel: null, activity: null },
  { from: 'AMS', to: 'LON', departDate: '2026-07-10', returnDate: '2026-07-17', provider: 'EasyJet',   price: 150, currency: 'EUR', legs: [], hotel: null, activity: null },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  const col = db.collection('offers');

  if (RESET) {
    const dropped = await col.deleteMany({});
    console.log(`Cleared offers collection (${dropped.deletedCount} removed)`);
  }

  const result = await col.insertMany(offers);
  console.log(`Inserted ${result.insertedCount} offers into ${MONGO_DB}.offers`);

  const sampleId = Object.values(result.insertedIds)[0].toString();
  console.log(`\nSample id for GET /offers/:id  →  ${sampleId}`);

  await client.close();
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
