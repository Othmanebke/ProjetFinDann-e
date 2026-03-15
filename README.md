# SmartProject AI 🚀

**Plateforme SaaS de gestion de projets avec automatisation IA**

Stack : Next.js 14, Node.js/Express, TypeScript, PostgreSQL, Stripe, OpenAI GPT-4o

---

## Démarrage rapide

```bash
# 1. Cloner et configurer
cp .env.example .env
# Remplir les variables dans .env

# 2. Démarrer les services
docker-compose up -d postgres redis prometheus grafana

# 3. Installer et migrer
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts

# 4. Développer
npm run dev
```

### Services disponibles
| Service | URL |
|---------|-----|
| Frontend Next.js | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API Health | http://localhost:4000/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

---

## Architecture

Voir [docs/architecture.md](docs/architecture.md) pour les diagrammes complets.

```
apps/
  frontend/    → Next.js 14 (App Router, TailwindCSS, Zustand, Recharts)
  backend/     → Express + TypeScript (Prisma, JWT, OpenAI, Stripe, Twilio)
packages/
  types/       → TypeScript interfaces partagées
  shared/      → Utilities partagées
prisma/        → Schema DB + migrations + seed
docs/          → Architecture, BC01-BC04
```

---

## Services Backend

| Service | Endpoint | Description |
|---------|----------|-------------|
| Auth | `/auth/*` | OAuth2 Google/GitHub + JWT |
| Projects | `/projects/*` | CRUD projets |
| Tasks | `/tasks/*` | CRUD tâches Kanban |
| AI | `/ai/*` | Chat + génération IA (GPT-4o) |
| Billing | `/billing/*` | Stripe Checkout + Webhooks |
| Metrics | `/metrics` | Prometheus format |
| Admin | `/admin/*` | Administration |

---

## Plans d'abonnement

| Plan | Prix | Fonctionnalités |
|------|------|----------------|
| **Free** | 0€ | 3 projets, chat IA basique (5/j) |
| **Pro** | 29€/mois | Illimité, IA avancée, 10 membres |
| **Enterprise** | 99€/mois | SSO, SLA 99.9%, membres illimités |

---

## Tests

```bash
# Tests unitaires Jest (backend)
npm run test --workspace=@smartproject/backend

# Tests E2E Cypress (frontend)
npm run test:open --workspace=@smartproject/frontend
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [BC01 — Cadrage](docs/BC01-cadrage.md) | Vision, personas, user stories, roadmap |
| [BC02 — Tests & Docs](docs/BC02-tests-docs.md) | Tests, API docs, guide installation |
| [BC03 — Pilotage](docs/BC03-pilotage.md) | Planning, RACI, budget, gantt |
| [BC04 — Maintenance](docs/BC04-maintenance.md) | Monitoring, CI/CD, backup, runbook |
| [Architecture](docs/architecture.md) | Diagrammes Mermaid, ERD, arborescence |

---

## Variables d'Environnement

Voir [.env.example](.env.example) pour la liste complète.

Variables requises minimales :
- `DATABASE_URL` — PostgreSQL
- `JWT_SECRET` + `JWT_REFRESH_SECRET` — Auth
- `GOOGLE_CLIENT_ID/SECRET` ou `GITHUB_CLIENT_ID/SECRET` — OAuth
- `OPENAI_API_KEY` — IA
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — Paiements
- `SENDGRID_API_KEY` — Emails
- `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` — SMS

---

## Licence

MIT © 2026 SmartProject AI