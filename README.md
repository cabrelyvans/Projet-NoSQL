# Travel Aggregator API

Simple backend API for a travel aggregation app built with Node.js, Express, MongoDB, Redis, and Neo4j.

## Tech Stack

- **Express** - HTTP API
- **MongoDB** - Offer storage
- **Redis** - Caching + Pub/Sub
- **Neo4j** - Recommendation graph

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

## Running Locally

Make sure MongoDB, Redis, and Neo4j are running locally, then:

```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### 1. Search Offers

```http
GET /offers?from=PAR&to=LON&limit=10
```

**Query Parameters:**

- `from` (required) - Departure city code
- `to` (required) - Destination city code
- `limit` (optional) - Number of results (default: 10)

**Caching:** Results cached in Redis for 60 seconds

**Response:**

```json
{
  "source": "cache",
  "data": [
    {
      "_id": "...",
      "from": "PAR",
      "to": "LON",
      "departDate": "2024-05-01",
      "returnDate": "2024-05-07",
      "provider": "AirFrance",
      "price": 250,
      "currency": "EUR"
    }
  ]
}
```

### 2. Get Offer by ID

```http
GET /offers/:id
```

**Caching:** Results cached in Redis for 300 seconds

**Response:**

```json
{
  "source": "database",
  "data": {
    "_id": "...",
    "from": "PAR",
    "to": "LON",
    "price": 250,
    "relatedOffers": ["id1", "id2", "id3"]
  }
}
```

### 3. Get Recommendations

```http
GET /reco?city=PAR&k=3
```

**Query Parameters:**

- `city` (required) - City code
- `k` (optional) - Number of recommendations (default: 3)

**Response:**

```json
{
  "data": [{ "city": "LON" }, { "city": "BRU" }, { "city": "AMS" }]
}
```

### 4. Login (Simplified)

```http
POST /login
Content-Type: application/json

{
  "userId": "u42"
}
```

**Response:**

```json
{
  "token": "uuid-generated-token",
  "expires_in": 900
}
```

**Note:** Session stored in Redis with 900s TTL

### 5. Create Offer

```http
POST /offers
Content-Type: application/json

{
  "from": "PAR",
  "to": "LON",
  "departDate": "2024-05-01",
  "returnDate": "2024-05-07",
  "provider": "AirFrance",
  "price": 250,
  "currency": "EUR",
  "legs": [],
  "hotel": null,
  "activity": null
}
```

**Response:**

```json
{
  "message": "Offer created",
  "id": "..."
}
```

**Note:** Publishes event to Redis channel `offers:new`

### 6. Health Check

```http
GET /health
```

## MongoDB Data Model

Collection: `offers`

```javascript
{
  "_id": ObjectId,
  "from": String,        // City code
  "to": String,          // City code
  "departDate": String,  // ISO date
  "returnDate": String,  // ISO date
  "provider": String,
  "price": Number,
  "currency": String,
  "legs": Array,
  "hotel": Object,       // Optional
  "activity": Object     // Optional
}
```

## Neo4j Setup

Create sample city nodes and relationships:

```cypher
CREATE (paris:City {code: 'PAR', weight: 100})
CREATE (london:City {code: 'LON', weight: 90})
CREATE (brussels:City {code: 'BRU', weight: 85})
CREATE (amsterdam:City {code: 'AMS', weight: 80})

CREATE (paris)-[:NEAR]->(london)
CREATE (paris)-[:NEAR]->(brussels)
CREATE (paris)-[:NEAR]->(amsterdam)
```

## Redis Pub/Sub

Subscribe to new offers:

```bash
redis-cli
SUBSCRIBE offers:new
```

## License

MIT
