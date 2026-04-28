# SupDeVinci Travel Hub (STH)

Intégration de bases NoSQL (Redis, MongoDB, Neo4j) pour une plateforme B2C de réservation de vols, hébergements et activités touristiques.

## Architecture

```
Projet-NoSQL/
├── backend/          FastAPI/Express microservice
├── frontend/         React/Vite SPA
├── docker-compose.yml
└── README.md
```

## Stack

| Composant | Tech |
|-----------|------|
| API | FastAPI / Express |
| Cache / Sessions | Redis |
| Offres (documents) | MongoDB |
| Recommandations (graphe) | Neo4j |
| Frontend | React 18 + Vite |

## Routes API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/login` | Authentification utilisateur |
| GET | `/offers?from=PAR&to=TYO&limit=10&q=hotel` | Recherche d'offres |
| GET | `/offers/{id}` | Détails d'une offre + recommandations |
| GET | `/reco?city=PAR&k=3` | Villes recommandées (Neo4j) |
| GET | `/stats/top-destinations` | Stats destinations (extension) |
| GET | `/metrics` | Prometheus metrics (extension) |

## Démarrage local

```bash
docker-compose up
```

## Développement

### Backend
```bash
cd backend
# [Instructions spécifiques au framework]
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

## Contraintes non-fonctionnelles

- Latence /offers : 200 ms (cache hit), 700 ms (cache miss + Mongo)
- Réponses : application/json; charset=utf-8
- Conteneur unique docker-compose
