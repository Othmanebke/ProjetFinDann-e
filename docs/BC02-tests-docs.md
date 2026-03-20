# BC02 — Tests & Documentation : élan (Fit & Travel)

**Version :** 2.0
**Date :** Mars 2026

---

## 1. Plan de Tests

### 1.1 Niveaux de Tests

| Niveau | Outil | Responsable | Environnement |
|--------|-------|------------|---------------|
| Unitaires | Jest (backend) | Dev | Local / CI |
| Intégration | Jest + Supertest | Dev | CI (DB réelle) |
| E2E | Cypress | QA / Dev | Staging |
| Performance | k6 | DevOps | Staging |
| Sécurité | OWASP ZAP | SecOps | Staging |
| Manuel | — | QA | Staging |

### 1.2 Couverture Cible

| Service | Couverture minimale |
|---------|-------------------|
| auth.service | 90% |
| workout.service | 85% |
| nutrition.service | 85% |
| ai.service | 80% |
| billing.service | 90% |
| notification.service | 75% |
| middlewares | 85% |

---

## 2. Matrice de Tests

### Backend — Tests Unitaires Jest

| Test ID | Description | Service | Résultat attendu |
|---------|------------|---------|-----------------|
| T-BE-01 | Générer un JWT valide | auth.service | Token JWT avec sub, email, role |
| T-BE-02 | Vérifier un JWT valide | auth.service | Payload décodé correct |
| T-BE-03 | Rejeter un JWT expiré | auth.service | Erreur "jwt expired" |
| T-BE-04 | Rejeter un JWT invalide | auth.service | Erreur 401 |
| T-BE-05 | Créer un workout | workout.service | Workout + weekNumber calculé |
| T-BE-06 | Workout accès refusé (autre user) | workout.service | AppError 404 |
| T-BE-07 | Stats hebdomadaires 8 semaines | workout.service | Array de 8 objets avec totaux |
| T-BE-08 | Créer un log nutrition | nutrition.service | NutritionLog avec macros |
| T-BE-09 | Résumé journalier nutrition | nutrition.service | { totalCalories, totalProtein, ... } |
| T-BE-10 | Générer parcours IA | ai.service | JSON avec waypoints + POIs |
| T-BE-11 | IA error graceful (no OpenAI key) | ai.service | Fallback mock, pas de crash |
| T-BE-12 | Chat streaming SSE | ai.service | Headers SSE + flux de tokens |
| T-BE-13 | Analyse performance | ai.service | { analysis, recommendations } |
| T-BE-14 | Stripe checkout URL | billing.service | URL Stripe Checkout |
| T-BE-15 | Subscription status | billing.service | { plan, status } |
| T-BE-16 | Webhook signature invalide | billing.service | AppError 400 |
| T-BE-17 | Envoyer email welcome | notification.service | SendGrid appelé |
| T-BE-18 | Envoyer SMS run reminder | notification.service | Twilio appelé |
| T-BE-19 | Créer notification in-app | notification.service | DB record créé |
| T-BE-20 | Rate limit IA > 10 req/min | middleware | 429 Too Many Requests |

### Frontend — Tests E2E Cypress

| Test ID | Description | Page | Résultat attendu |
|---------|------------|------|-----------------|
| T-FE-01 | Affichage page login | /login | Boutons Google + GitHub + Microsoft visibles |
| T-FE-02 | Clic login Google → OAuth | /login | Redirect vers backend/auth/google |
| T-FE-03 | Login démo sans backend | /login | Redirect /dashboard avec user démo |
| T-FE-04 | Callback tokens valides | /auth/callback | Redirect /dashboard |
| T-FE-05 | Dashboard KPIs visibles | /dashboard | 4 KPI cards + graphiques |
| T-FE-06 | Affichage liste workouts | /workouts | Workouts listés |
| T-FE-07 | Créer un workout | /workouts/new | POST /workouts appelé |
| T-FE-08 | Affichage page nutrition | /nutrition | Macros journalières + liste repas |
| T-FE-09 | Logger un repas | /nutrition | POST /nutrition appelé |
| T-FE-10 | Affichage chat IA | /ai | Interface chat + liste conversations |
| T-FE-11 | Envoyer message IA | /ai | SSE streaming + réponse affichée |
| T-FE-12 | Affichage page routes | /routes | Liste parcours + bouton générer |
| T-FE-13 | Génération parcours (Premium) | /routes | POST /routes/generate appelé |
| T-FE-14 | Affichage métriques | /metrics | Graphiques barres + zones FC |
| T-FE-15 | Affichage plans billing | /billing | Free + Premium Coach + Pass Voyageur |
| T-FE-16 | Upgrade → Stripe Checkout | /billing | Redirect Stripe |
| T-FE-17 | Notifications in-app | /dashboard | Cloche avec badge non-lus |

### Tests de Sécurité

| ID | Type | Description | Statut |
|----|------|------------|--------|
| S-01 | Auth | JWT sans token → 401 | ✅ |
| S-02 | Auth | JWT expiré → 401 | ✅ |
| S-03 | AuthZ | User accède workout d'un autre user → 404 | ✅ |
| S-04 | AuthZ | Free user accède génération parcours → 403 | ✅ |
| S-05 | Input | SQL injection via query params | ✅ Prisma protège |
| S-06 | Input | XSS via mealName | ✅ Zod sanitize |
| S-07 | Rate | > 10 requêtes IA/min → 429 | ✅ |
| S-08 | Webhook | Stripe sans signature → 400 | ✅ |
| S-09 | CORS | Frontend autre domaine → bloqué | ✅ |
| S-10 | Headers | Helmet sécurise headers HTTP | ✅ |

---

## 3. Documentation API

### Base URL
```
Production: https://api.elan-fitness.app
Development: http://localhost:4000
```

### Authentification
Tous les endpoints (sauf `/auth/*`, `/metrics`, `/health`, `/billing/webhook`) requièrent :
```
Authorization: Bearer <accessToken>
```

---

### Endpoints Auth

#### GET /auth/google
Initie le flux OAuth2 Google.
- **Response :** 302 Redirect vers Google

#### GET /auth/github
Initie le flux OAuth2 GitHub.
- **Response :** 302 Redirect vers GitHub

#### GET /auth/microsoft
Initie le flux OAuth2 Microsoft.
- **Response :** 302 Redirect vers Microsoft

#### POST /auth/refresh
```json
Request:
{ "refreshToken": "uuid-v4-token" }

Response 200:
{
  "accessToken": "eyJ...",
  "refreshToken": "new-uuid-v4",
  "expiresIn": 900
}

Erreurs:
401 { "error": "Invalid refresh token" }
401 { "error": "Refresh token revoked" }
401 { "error": "Refresh token expired" }
```

#### POST /auth/logout
```json
Request: { "refreshToken": "uuid-v4-token" }
Response 200: { "message": "Logged out successfully" }
```

#### GET /auth/me
```json
Response 200:
{
  "id": "cuid",
  "email": "user@example.com",
  "name": "Théo Martin",
  "avatarUrl": "https://...",
  "role": "USER",
  "phone": "+33600000000",
  "timezone": "Europe/Paris",
  "fitnessGoal": "ENDURANCE",
  "weeklyTargetKm": 40,
  "currentCity": "Paris",
  "currentCountry": "France",
  "subscription": {
    "plan": "PASS_VOYAGEUR",
    "status": "ACTIVE",
    "currentPeriodEnd": "2026-04-15T00:00:00.000Z"
  }
}
```

---

### Endpoints Workouts

#### GET /workouts
```
Query params: page, limit, type, startDate, endDate
Response 200: { data: Workout[], pagination: { page, limit, total, totalPages } }
```

#### GET /workouts/stats
```json
Query params: weeks (défaut: 8)
Response 200:
[
  {
    "weekNumber": 11,
    "yearNumber": 2026,
    "distanceKm": 45.2,
    "durationMin": 280,
    "calories": 3200,
    "sessions": 4
  }
]
```

#### POST /workouts
```json
Request:
{
  "type": "RUN",
  "title": "Run matinal Bois de Boulogne",
  "distanceKm": 12.5,
  "durationMin": 68,
  "calories": 720,
  "heartRateAvg": 148,
  "heartRateMax": 172,
  "paceMinPerKm": 5.44,
  "city": "Paris",
  "country": "France",
  "completedAt": "2026-03-20T07:30:00Z"
}
Response 201: Workout
```

#### GET /workouts/:id
```
Response 200: Workout
Response 404: { "error": "Workout not found" }
```

#### PATCH /workouts/:id
```json
Request: Partial<Workout>
Response 200: Workout updated
```

#### DELETE /workouts/:id
```
Response 204: No content
```

---

### Endpoints Nutrition

#### GET /nutrition
```
Query params: page, limit, date
Response 200: { data: NutritionLog[], pagination: {...} }
```

#### GET /nutrition/daily
```json
Query params: date (YYYY-MM-DD, défaut: aujourd'hui)
Response 200:
{
  "date": "2026-03-20",
  "logs": [...],
  "summary": {
    "totalCalories": 1850,
    "totalProteinG": 145,
    "totalCarbsG": 210,
    "totalFatG": 62,
    "totalFiberG": 28,
    "mealCount": 4
  }
}
```

#### GET /nutrition/stats
```json
Query params: weeks (défaut: 4)
Response 200: [ { week, avgCalories, avgProtein, avgCarbs, avgFat } ]
```

#### POST /nutrition
```json
Request:
{
  "mealName": "Bowls de quinoa saumon",
  "caloriesKcal": 520,
  "proteinG": 38,
  "carbsG": 55,
  "fatG": 14,
  "fiberG": 6,
  "restaurant": "Cojean",
  "city": "Paris",
  "country": "France",
  "loggedAt": "2026-03-20T12:30:00Z"
}
Response 201: NutritionLog
```

#### POST /nutrition/recommend *(Premium+)*
```json
Request:
{
  "city": "Tokyo",
  "country": "Japan",
  "targetCalories": 650,
  "fitnessGoal": "ENDURANCE",
  "restrictions": ["gluten-free"]
}
Response 200:
{
  "recommendations": [
    {
      "name": "Sushi Yoshida",
      "cuisine": "Japanese",
      "estimatedCalories": 580,
      "proteinRich": true,
      "address": "...",
      "why": "Poisson riche en protéines, faible en graisses saturées"
    }
  ]
}
```

---

### Endpoints Routes (Parcours)

#### GET /routes
```
Response 200: TravelRoute[]
```

#### POST /routes/generate *(Pass Voyageur)*
```json
Request:
{
  "city": "Kyoto",
  "country": "Japan",
  "activityType": "RUN",
  "distanceKm": 10,
  "difficulty": "MODERATE"
}
Response 200:
{
  "name": "Run Temples de Kyoto",
  "description": "Parcours longeant les temples...",
  "distanceKm": 10.2,
  "estimatedMinutes": 62,
  "elevationM": 85,
  "safetyScore": 9,
  "bestTimeOfDay": "Matin (6h-9h)",
  "waypoints": [
    { "lat": 35.0116, "lng": 135.7681, "label": "Départ - Gion" }
  ],
  "pointsOfInterest": [
    { "name": "Temple Kinkaku-ji", "type": "landmark", "lat": 35.0394, "lng": 135.7292 }
  ]
}
```

#### POST /routes/restaurants *(Premium+)*
Voir `POST /nutrition/recommend` — même payload, même format de réponse.

#### DELETE /routes/:id
```
Response 204: No content
```

---

### Endpoints IA

#### GET /ai/chats
```json
Response 200: FitChat[]
```

#### POST /ai/chats
```json
Request: { "title": "Ma séance à Lisbonne" }
Response 201: { "id": "cuid", "title": "..." }
```

#### POST /ai/chats/:chatId/stream
```json
Request: { "message": "Donne-moi un plan de récupération après 15km" }
Response: text/event-stream (SSE)

data: {"type":"delta","content":"Après une longue sortie..."}
data: {"type":"delta","content":" voici mes recommandations :"}
data: {"type":"done"}
data: {"type":"error","message":"..."}
```

#### POST /ai/analyze-performance *(Premium+)*
```json
Request:
{
  "weeklyData": [
    { "weekNumber": 10, "distanceKm": 38, "durationMin": 240, "calories": 2800, "sessions": 4 }
  ],
  "fitnessGoal": "ENDURANCE",
  "weeklyTargetKm": 40
}
Response 200:
{
  "analysis": "Tu es à 95% de ton objectif hebdomadaire...",
  "recommendations": ["Augmente progressivement de 10% par semaine", "..."],
  "weeklyTrend": "IMPROVING"
}
```

---

### Endpoints Notifications

#### GET /notifications
```json
Response 200: Notification[] (50 dernières, tri desc)
```

#### PATCH /notifications/:id/read
```json
Response 200: { "ok": true }
```

#### PATCH /notifications/read-all
```json
Response 200: { "ok": true }
```

#### POST /notifications/sms-reminder
```json
Request: { "city": "Lyon", "time": "18h30" }
Response 200: { "ok": true, "message": "SMS sent to +336..." }
Erreur 400: { "error": "No phone number on your account" }
```

---

### Endpoints Billing

#### POST /billing/checkout
```json
Request: { "priceId": "price_premium_coach_monthly" }
Response 200: { "url": "https://checkout.stripe.com/pay/cs_..." }
```

#### GET /billing/portal
```json
Response 200: { "url": "https://billing.stripe.com/session/..." }
```

#### GET /billing/subscription
```json
Response 200:
{
  "plan": "PASS_VOYAGEUR",
  "status": "ACTIVE",
  "currentPeriodEnd": "2026-04-15T00:00:00.000Z",
  "cancelAtPeriodEnd": false
}
```

#### POST /billing/webhook *(Stripe)*
```
Headers: stripe-signature: <hmac>
Body: raw JSON (Stripe event)
Response 200: { "received": true }
Response 400: { "error": "Invalid webhook signature" }
```

---

### Endpoint Métriques

#### GET /metrics
```
Response 200: text/plain (format Prometheus)
Pas d'authentification requise (scraping Prometheus)
```

---

## 4. Guide d'Installation

### Prérequis
- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Comptes : Google Cloud, GitHub OAuth, Microsoft Azure, OpenAI, Stripe, SendGrid, Twilio

### Installation Locale (Développement)

```bash
# 1. Cloner le repo
git clone https://github.com/your-org/elan-fit-travel.git
cd elan-fit-travel

# 2. Copier les variables d'environnement
cp .env.example .env
# Remplir toutes les variables dans .env

# 3. Démarrer PostgreSQL via Docker
docker-compose up -d postgres

# 4. Installer les dépendances
npm install

# 5. Générer le client Prisma + migrer la DB
npx prisma generate
npx prisma migrate dev --name init

# 6. Seed la base de données (admin + démo + données d'exemple)
npx ts-node prisma/seed.ts

# 7. Démarrer le développement
npm run dev
# Backend:  http://localhost:4000
# Frontend: http://localhost:3000
```

### Variables d'Environnement Requises

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/elan

# JWT
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# IA
OPENAI_API_KEY=sk-...

# Paiements
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notifications
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=no-reply@elan-fitness.app
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...

# App
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

### Déploiement Production

```bash
# Builder
npm run build

# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d

# Migrer la DB
DATABASE_URL=<prod_url> npx prisma migrate deploy
```

### Configuration OAuth Google
1. Google Cloud Console → API & Services → Credentials
2. Créer OAuth 2.0 Client ID (type : Web application)
3. Authorized redirect URIs : `http://localhost:4000/auth/google/callback`
4. Copier Client ID + Secret dans `.env`

### Configuration Stripe
1. Créer produits + prix dans le dashboard Stripe (test mode)
2. Configurer webhook : `http://your-domain:4000/billing/webhook`
3. Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copier `STRIPE_WEBHOOK_SECRET` (`whsec_...`) dans `.env`

### Mode Démo (sans backend)
Le bouton "Continuer avec la démo" crée une session 100% client-side :
- Token : `"demo-access-token"` (stocké dans Zustand + localStorage)
- Toutes les API calls retournent des données mock
- Aucun backend nécessaire pour tester le frontend
