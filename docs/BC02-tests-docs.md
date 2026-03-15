# BC02 — Tests & Documentation : SmartProject AI

**Version :** 1.0
**Date :** Mars 2026

---

## 1. Plan de Tests

### 1.1 Niveaux de Tests

| Niveau | Outil | Responsable | Environnement |
|--------|-------|------------|---------------|
| Unitaires | Jest (backend) | Dev | Local / CI |
| Intégration | Jest + Supertest | Dev | CI (DB real) |
| E2E | Cypress | QA / Dev | Staging |
| Performance | k6 | DevOps | Staging |
| Sécurité | OWASP ZAP | SecOps | Staging |
| Manuel | — | QA | Staging |

### 1.2 Couverture Cible

| Service | Couverture minimale |
|---------|-------------------|
| auth.service | 90% |
| projects.service | 85% |
| tasks.service | 85% |
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
| T-BE-04 | Rejeter un JWT invalide | auth.service | Erreur |
| T-BE-05 | Créer un projet | projects.service | Projet + ActivityLog créés |
| T-BE-06 | Accès refusé projet inexistant | projects.service | AppError 404 |
| T-BE-07 | Liste paginée projets | projects.service | { data, pagination } |
| T-BE-08 | Créer une tâche | tasks.service | Tâche créée + log |
| T-BE-09 | Tâche accès refusé | tasks.service | AppError 403 |
| T-BE-10 | Générer plan IA | ai.service | JSON structuré |
| T-BE-11 | IA error graceful | ai.service | Pas de crash |
| T-BE-12 | Stripe checkout URL | billing.service | URL Stripe |
| T-BE-13 | Subscription status | billing.service | { plan, status } |
| T-BE-14 | Webhook signature invalide | billing.service | AppError 400 |
| T-BE-15 | Envoyer email welcome | notification.service | SendGrid appelé |
| T-BE-16 | Email welcome fail graceful | notification.service | Pas d'erreur throw |
| T-BE-17 | Envoyer SMS deadline | notification.service | Twilio appelé |
| T-BE-18 | Créer in-app notification | notification.service | DB record créé |

### Frontend — Tests E2E Cypress

| Test ID | Description | Page | Résultat attendu |
|---------|------------|------|-----------------|
| T-FE-01 | Affichage page login | /login | Boutons Google + GitHub visibles |
| T-FE-02 | Clic login Google → OAuth | /login | Redirect vers backend/auth/google |
| T-FE-03 | Affichage erreur oauth_failed | /login?error=... | Message d'erreur visible |
| T-FE-04 | Callback missing tokens | /auth/callback | Redirect /login |
| T-FE-05 | Affichage liste projets | /projects | Projets affichés |
| T-FE-06 | Modal création projet | /projects | Modal s'ouvre |
| T-FE-07 | Créer un projet | /projects | POST /projects appelé |
| T-FE-08 | Navigation vers projet | /projects | Redirect /projects/[id] |
| T-FE-09 | Affichage chat IA | /ai | Interface chat visible |
| T-FE-10 | Suggestions IA initiales | /ai | 4 suggestions affichées |
| T-FE-11 | Clic suggestion → input | /ai | Input pré-rempli |
| T-FE-12 | Envoyer message IA | /ai | SSE streaming + réponse |
| T-FE-13 | Affichage plans billing | /billing | Free + Pro + Enterprise |
| T-FE-14 | Plan actuel mis en valeur | /billing | Badge "Plan actuel" |
| T-FE-15 | Upgrade → Stripe Checkout | /billing | Redirect Stripe |

### Tests de Sécurité

| ID | Type | Description | Statut |
|----|------|------------|--------|
| S-01 | Auth | JWT sans token → 401 | ✅ |
| S-02 | Auth | JWT expiré → 401 | ✅ |
| S-03 | AuthZ | User accède projet autre user → 404 | ✅ |
| S-04 | AuthZ | User accède admin route → 403 | ✅ |
| S-05 | Input | SQL injection via query params | ✅ Prisma protège |
| S-06 | Input | XSS via project name | ✅ Zod sanitize |
| S-07 | Rate | > 10 requêtes IA/min → 429 | ✅ |
| S-08 | Webhook | Stripe sans signature → 400 | ✅ |
| S-09 | CORS | Frontend autre domaine → bloqué | ✅ |
| S-10 | Headers | Helmet sécurise headers HTTP | ✅ |

---

## 3. Documentation API

### Base URL
```
Production: https://api.smartproject.ai
Development: http://localhost:4000
```

### Authentification
Tous les endpoints (sauf `/auth/*`, `/metrics`, `/health`, `/billing/webhook`) requièrent :
```
Authorization: Bearer <accessToken>
```

### Endpoints Auth

#### GET /auth/google
Initie le flux OAuth2 Google.
- **Response :** 302 Redirect vers Google

#### GET /auth/google/callback
Callback OAuth2 Google.
- **Response :** 302 Redirect vers `FRONTEND_URL/auth/callback?access_token=...&refresh_token=...`

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
  "name": "John Doe",
  "avatarUrl": "https://...",
  "role": "USER",
  "phone": "+33600000000",
  "timezone": "Europe/Paris",
  "subscription": {
    "plan": "PRO",
    "status": "ACTIVE",
    "currentPeriodEnd": "2026-04-15T00:00:00.000Z"
  }
}
```

### Endpoints Projects

#### GET /projects
```
Query params: page, limit, status, search
Response 200: { data: Project[], pagination: { page, limit, total, totalPages } }
```

#### POST /projects
```json
Request:
{
  "name": "Mon Projet",
  "description": "Description",
  "color": "#6366f1",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-06-30T00:00:00Z"
}
Response 201: Project
```

#### GET /projects/:id
```
Response 200: Project (avec tasks, members, _count)
Response 404: { "error": "Project not found" }
```

#### PUT /projects/:id
```json
Request: Partial<Project>
Response 200: Project updated
```

#### DELETE /projects/:id
```
Response 204: No content
Response 404: { "error": "Project not found or you are not the owner" }
```

#### GET /projects/:id/stats
```json
Response 200:
{
  "taskStats": [
    { "status": "TODO", "_count": { "id": 5 } },
    { "status": "DONE", "_count": { "id": 8 } }
  ],
  "recentActivity": [ ActivityLog... ]
}
```

### Endpoints AI

#### POST /ai/chat *(Free + Pro)*
```json
Request:
{
  "message": "Comment planifier ce sprint ?",
  "chatId": "cuid-optionnel",
  "projectId": "cuid-optionnel"
}
Response: text/event-stream (SSE)
data: {"type":"chat_id","chatId":"..."}
data: {"type":"delta","content":"..."}
data: {"type":"done"}
data: {"type":"error","message":"..."}
```

#### POST /ai/generate-plan *(Pro+)*
```json
Request: { "projectId": "cuid" }
Response 200:
{
  "phases": [{"name": "...", "duration": "2 weeks", "tasks": [...]}],
  "milestones": [{"name": "Beta launch", "date": "2026-05-01"}],
  "risks": ["Resource constraints", "..."],
  "recommendations": ["Use Scrum", "..."],
  "estimatedDuration": "3 months"
}
```

#### POST /ai/risks *(Pro+)*
```json
Request: { "projectId": "cuid" }
Response 200:
{
  "riskLevel": "MEDIUM",
  "risks": [
    {
      "title": "2 tâches urgentes en retard",
      "severity": "HIGH",
      "probability": "CERTAIN",
      "mitigation": "Allouer des ressources supplémentaires"
    }
  ],
  "overallAssessment": "Le projet présente un risque modéré..."
}
```

#### POST /ai/generate-tasks *(Pro+)*
```json
Request: { "projectId": "cuid", "context": "Développer une API REST" }
Response 200:
{
  "tasks": [
    {
      "title": "Setup Express + TypeScript",
      "description": "...",
      "priority": "HIGH",
      "estimatedHours": 4,
      "tags": ["backend", "setup"]
    }
  ]
}
```

### Endpoints Billing

#### POST /billing/checkout
```json
Request: { "priceId": "price_pro_monthly" }
Response 200: { "url": "https://checkout.stripe.com/pay/cs_..." }
Response 403: { "error": "Upgrade required" }
```

#### GET /billing/portal
```json
Response 200: { "url": "https://billing.stripe.com/session/..." }
```

#### GET /billing/subscription
```json
Response 200:
{
  "plan": "PRO",
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

## 4. Guide d'Installation

### Prérequis
- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Comptes : Google Cloud, GitHub OAuth, OpenAI, Stripe, SendGrid, Twilio

### Installation Locale (Développement)

```bash
# 1. Cloner le repo
git clone https://github.com/your-org/smartproject-ai.git
cd smartproject-ai

# 2. Copier les variables d'environnement
cp .env.example .env
# Remplir toutes les variables dans .env

# 3. Démarrer les services Docker
docker-compose up -d postgres redis prometheus grafana

# 4. Installer les dépendances
npm install

# 5. Générer le client Prisma + migrer la DB
npx prisma generate
npx prisma migrate dev --name init

# 6. Seed la base de données
npx ts-node prisma/seed.ts

# 7. Démarrer le développement
npm run dev
# Backend: http://localhost:4000
# Frontend: http://localhost:3000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

### Déploiement Production

```bash
# 1. Builder tout
npm run build

# 2. Démarrer avec Docker Compose prod
docker-compose up -d

# 3. Migrer la DB en prod
DATABASE_URL=<prod_url> npx prisma migrate deploy

# 4. Accéder aux services
# Frontend: http://your-domain:3000
# Backend API: http://your-domain:4000
# Métriques: http://your-domain:4000/metrics
```

### Configuration OAuth Google
1. Aller sur https://console.cloud.google.com
2. Créer un projet → API & Services → Credentials
3. Créer un OAuth 2.0 Client ID
4. Authorized redirect URIs : `http://localhost:4000/auth/google/callback`
5. Copier Client ID + Client Secret dans `.env`

### Configuration Stripe
1. Créer un compte sur stripe.com
2. Récupérer les clés API (test mode)
3. Créer les produits et prix (Pro, Enterprise)
4. Configurer les webhooks : `http://your-domain:4000/billing/webhook`
5. Événements à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
