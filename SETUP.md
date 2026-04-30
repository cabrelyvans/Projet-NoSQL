# 🚀 GUIDE D'INSTALLATION ET DE LANCEMENT

Guide complet pour faire fonctionner le projet **SupDeVinci Travel Hub** localement.

---

## **PRÉ-REQUIS**

Avant de commencer, vérifiez que vous avez installé :

- ✅ **Node.js** (v18+) : https://nodejs.org/
- ✅ **Docker Desktop** : https://www.docker.com/products/docker-desktop
- ✅ **Git** : déjà utilisé pour le repo

**Vérification** :

```bash
node --version    # v18.x.x ou plus
docker --version  # Docker version x.x.x
git --version     # git version x.x.x
```

---

## **ÉTAPE 1 : Cloner le repo**

```bash
git clone https://github.com/cabrelyvans/Projet-NoSQL.git
cd Projet-NoSQL
```

---

## **ÉTAPE 2 : Lancer Docker (Databases)**

Les 3 bases de données tournent dans Docker.

### **Démarrer Docker Desktop**

1. Ouvre l'application **Docker Desktop** (Windows/Mac)
2. Attends que le daemon soit prêt (icône stable en bas à gauche)

### **Lancer le stack**

```bash
docker-compose up -d
```

**Vérification** : Les 3 services doivent être `healthy`

```bash
docker-compose ps
```

Expected output:

```
NAME                  STATUS
travel-redis          Up X minutes (healthy)
travel-mongo          Up X minutes (healthy)
travel-neo4j          Up X minutes (healthy)
```

---

## **ÉTAPE 3 : Lancer le Backend (Express)**

### **Installation des dépendances**

```bash
cd backend
npm install
```

### **Configuration (optionnel)**

Si tu veux utiliser des ports ou URIs différents, crée un fichier `.env` :

```bash
cp .env.example .env
```

Valeurs par défaut (dans `.env.example`) :

```
PORT=8000
MONGO_URI=mongodb://localhost:27017
MONGO_DB=travel_db
REDIS_HOST=localhost
REDIS_PORT=6379
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

### **Lancer le serveur**

```bash
npm run dev
```

Expected output:

```
✓ MongoDB connected
✓ Redis connected
✓ Neo4j connected

🚀 Server running on http://localhost:8000
```

### **Seeder les données de test** (dans un autre terminal)

```bash
npm run seed
```

Expected output:

```
Inserted 12 offers into travel_db.offers
Sample id for GET /offers/:id  →  69f09f90b8752edc8e0579dd
```

---

## **ÉTAPE 4 : Lancer le Frontend (React/Vite)**

### **Installation des dépendances**

```bash
cd frontend
npm install
```

### **Lancer le serveur de développement**

```bash
npm run dev
```

Expected output:

```
  VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

---

## **ÉTAPE 5 : Tester l'application**

### **Accès au frontend**

- Ouvre http://localhost:3001 dans ton navigateur

### **Tests**

1. **Login** → Entre un user ID (ex: `u42`)
2. **Recherche** → Cherche `PAR → LON`
3. **Détails** → Clique sur une offre
4. **Recommandations** → Cherche villes proches de `PAR`
5. **Cache** → Refais la même recherche, plus rapide la 2e fois

### **Tester l'API directement** (Postman)

Importe la collection Postman :

1. Ouvre Postman
2. **Fichier** → **Import**
3. Sélectionne `backend/postman_collection.json`
4. Teste les endpoints :
   - `POST /login`
   - `GET /offers?from=PAR&to=LON&limit=10`
   - `GET /offers/{id}`
   - `GET /reco?city=PAR&k=3`

---

## **ARRÊTER TOUS LES SERVICES**

### **Frontend**

```bash
# Dans le terminal du frontend
Ctrl+C
```

### **Backend**

```bash
# Dans le terminal du backend
Ctrl+C
```

### **Docker**

```bash
docker-compose down
```

---

## **STRUCTURE DU PROJET**

```
Projet-NoSQL/
├── README.md                 # Description du projet
├── SETUP.md                  # Ce fichier
├── PLAN_COMMITS.md           # Plan des commits pour vous 3
├── docker-compose.yml        # Configuration Docker (Redis, MongoDB, Neo4j)
│
├── backend/
│   ├── package.json          # Dépendances npm
│   ├── .env.example          # Variables d'environnement (exemple)
│   ├── server.js             # API Express (4 endpoints)
│   ├── seed-mongo.js         # Seeder avec 12 offres de test
│   └── postman_collection.json # Tests API
│
└── frontend/
    ├── package.json          # Dépendances npm
    ├── vite.config.js        # Config Vite + proxy vers backend
    ├── index.html            # HTML racine
    └── src/
        ├── main.jsx          # Point d'entrée React
        ├── App.jsx           # Routing principal
        ├── App.css           # Styling global
        ├── api/
        │   └── client.js     # Axios client avec intercepteurs
        ├── components/
        │   ├── Navbar.jsx    # Navigation + logout
        │   └── OfferCard.jsx # Carte offre
        └── pages/
            ├── LoginPage.jsx         # Authentification
            ├── SearchPage.jsx        # Recherche offres
            ├── OfferDetailPage.jsx   # Détails offre
            └── RecoPage.jsx          # Recommandations Neo4j
```

---

## **ENDPOINTS API**

| Méthode | Endpoint                           | Description                                 |
| ------- | ---------------------------------- | ------------------------------------------- |
| POST    | `/login`                           | Créer une session utilisateur               |
| GET     | `/offers?from=PAR&to=LON&limit=10` | Rechercher offres (avec cache Redis 60s)    |
| GET     | `/offers/{id}`                     | Détails d'une offre (avec cache Redis 300s) |
| GET     | `/reco?city=PAR&k=3`               | Villes recommandées (Neo4j)                 |

---

## **DÉPANNAGE**

### **"Docker daemon is not running"**

→ Lance l'application **Docker Desktop**

### **"Port 8000 already in use"**

→ Tue le processus : `lsof -ti:8000 | xargs kill -9` (Mac/Linux)
→ Ou change le PORT dans `.env`

### **"MongoDB connection refused"**

→ Vérifies que Docker est lancé : `docker ps`
→ Redémarre le stack : `docker-compose down && docker-compose up -d`

### **"Cannot find module 'express'"**

→ Relance : `npm install` dans le dossier `backend/`

### **"EADDRINUSE: address already in use :::3001"**

→ Tue le processus Vite ou change le port dans `vite.config.js`

---

## **FICHIERS DE RÉFÉRENCE**

- **Données de test** : `backend/seed-mongo.js` (12 offres)
- **Variables d'environnement** : `backend/.env.example`
- **Tests API** : `backend/postman_collection.json`
- **Architecture du projet** : `README.md`
- **Plan des commits** : `PLAN_COMMITS.md`

---

## **COMMANDES RAPIDES**

```bash
# Cloner + lancer tout
git clone https://github.com/cabrelyvans/Projet-NoSQL.git
cd Projet-NoSQL
docker-compose up -d
cd backend && npm install && npm run seed && npm run dev
# Dans un nouveau terminal :
cd frontend && npm install && npm run dev

# Ouvre http://localhost:3001
```

---

## **EN CAS DE PROBLÈME**

1. **Vérifies les logs** :

   ```bash
   docker-compose logs -f
   npm run dev  # Vois les erreurs
   ```

2. **Teste les bases directement** :

   ```bash
   # MongoDB
   mongosh mongodb://localhost:27017

   # Redis
   redis-cli

   # Neo4j (Web UI)
   http://localhost:7474
   ```

3. **Demande de l'aide** → Montre les erreurs exactes du terminal

---

## **PRÊT ? 🚀**

Une fois tout lancé, accède à http://localhost:3001 et teste l'app complète !

Bon développement ! 🎉
