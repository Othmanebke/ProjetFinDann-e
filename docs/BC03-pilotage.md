# BC03 — Pilotage Projet : élan (Fit & Travel)

**Version :** 2.0
**Date :** Mars 2026

---

## 1. Planning — Gantt 12 Semaines

| Semaine | Sprint | Objectif | Livrables |
|---------|--------|---------|-----------|
| S1 | Sprint 1 | Infrastructure & Auth | Monorepo Turbo, Docker, Prisma schema, OAuth2 (Google + GitHub + Microsoft) |
| S2 | Sprint 1 | Backend Core | Workouts CRUD + stats hebdomadaires, Nutrition CRUD + macros |
| S3 | Sprint 2 | IA & Routes | AI service (GPT-4o + SSE), génération parcours, recommandations restaurants |
| S4 | Sprint 2 | Notifications & Métriques | SendGrid, Twilio, Prometheus, in-app notifications |
| S5 | Sprint 3 | Billing & Admin | Stripe checkout + webhook + portal, middleware requirePlan, rate limiting |
| S6 | Sprint 3 | Frontend Core | Landing page, Login OAuth, Auth callback, Dashboard KPIs |
| S7 | Sprint 4 | Frontend App | Pages Routes, Nutrition, Métriques, AppLayout Sidebar+Navbar |
| S8 | Sprint 4 | Frontend IA & Explorer | Chat IA streaming SSE, page Explorer, Billing page, Profil |
| S9 | Sprint 5 | Tests | Jest backend (85%+), Cypress E2E (15 scénarios) |
| S10 | Sprint 5 | DevOps & CI/CD | GitHub Actions, Dockerfiles, scripts de déploiement |
| S11 | Sprint 6 | Beta & Bugfix | Tests utilisateurs réels, corrections, performance |
| S12 | Sprint 6 | Launch | Déploiement production, monitoring Grafana, documentation finale |

### Diagramme Gantt (ASCII)

```
Semaine:         S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12
Infrastructure:  ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Auth/Backend:    ███ ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
IA/Routes:       ░░░ ░░░ ███ ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Billing/Notifs:  ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Frontend Core:   ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░ ░░░ ░░░ ░░░
Frontend IA:     ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░ ░░░
Tests:           ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░
DevOps/CI:       ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░
Beta/Launch:     ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███
```

---

## 2. RACI

| Activité | Dev Backend | Dev Frontend | PM | DevOps | Designer | QA |
|----------|------------|-------------|-----|--------|----------|-----|
| Architecture | R | C | A | C | I | I |
| Prisma Schema (8 modèles) | R | I | A | I | I | I |
| Auth Service (JWT + OAuth) | R | C | A | I | I | I |
| Workout Service | R | I | A | I | I | C |
| Nutrition Service | R | I | A | I | I | C |
| IA Service (GPT-4o + SSE) | R | I | A | I | I | I |
| Billing Service (Stripe) | R | C | A | I | I | I |
| Notification Service (SendGrid + Twilio) | R | I | A | I | I | C |
| Prometheus Metrics | R | I | A | C | I | I |
| Frontend Layout (AppLayout) | I | R | A | I | C | C |
| Dashboard KPIs + graphiques | I | R | A | I | C | C |
| Chat IA UI (SSE streaming) | C | R | A | I | C | I |
| Pages App (Routes, Nutrition, Métriques, Explorer) | I | R | A | I | C | C |
| Tests unitaires Jest | R | R | A | I | I | C |
| Tests E2E Cypress | I | C | A | I | I | R |
| CI/CD Pipeline GitHub Actions | I | I | A | R | I | I |
| Docker Compose | I | I | A | R | I | I |
| Documentation BC01-BC04 | C | C | R | C | I | C |
| Beta Testing | C | C | R | I | I | R |

**R = Responsable, A = Approbateur, C = Consulté, I = Informé**

---

## 3. Équipe & Rôles

| Rôle | Responsabilités | % du temps |
|------|----------------|-----------|
| **Tech Lead / Dev Backend** | Architecture Express, services métier, IA, Stripe, Prisma | 100% |
| **Dev Frontend** | Next.js 14 App Router, composants, intégrations API, Zustand | 100% |
| **Product Manager** | Roadmap, personas, user stories, validation des features | 50% |
| **DevOps / SRE** | Docker, CI/CD, Prometheus, déploiement | 50% |
| **Designer UX** | Design system Montserrat + beige chaud, maquettes, Figma | 25% |
| **QA Engineer** | Tests E2E Cypress, validation, bug tracking | 50% |

---

## 4. Budget & Charges Estimées

### Développement (12 semaines)

| Rôle | TJM | Jours | Total |
|------|-----|-------|-------|
| Tech Lead Backend | 600€ | 60 | 36 000€ |
| Dev Frontend | 500€ | 60 | 30 000€ |
| Product Manager (50%) | 700€ | 30 | 21 000€ |
| DevOps (50%) | 550€ | 30 | 16 500€ |
| Designer UX (25%) | 450€ | 15 | 6 750€ |
| QA (50%) | 400€ | 30 | 12 000€ |
| **Total Développement** | | | **122 250€** |

### Infrastructure (Mensuel en Production)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Serveur Cloud (2 instances) | vCPU 4, 8GB RAM | 80€ |
| PostgreSQL (managed) | 10GB storage | 25€ |
| OpenAI API (GPT-4o) | ~1000 users actifs | 300€ |
| Stripe | 2.9% + 0.30€ par transaction | Variable |
| SendGrid | Essentials 50k emails/mois | 15€ |
| Twilio | ~2000 SMS/mois | 35€ |
| Monitoring (Grafana Cloud) | Starter | 0€ |
| CDN + DNS (Cloudflare) | Free tier | 0€ |
| **Total Infra/mois** | | **~455€/mois** |

### ROI Estimé

| Mois | Users Free | Users Premium | Users Voyageur | MRR | Coûts | Profit |
|------|-----------|---------------|----------------|-----|-------|--------|
| M1 | 200 | 10 | 5 | 215€ | 455€ | -240€ |
| M3 | 800 | 60 | 25 | 1 195€ | 650€ | +545€ |
| M6 | 3 000 | 200 | 80 | 3 920€ | 1 500€ | +2 420€ |
| M12 | 8 000 | 600 | 300 | 12 900€ | 3 500€ | +9 400€ |

*Hypothèse : 8% conversion Free→Premium, 3% Free→Voyageur*

---

## 5. Risques Projet

| Risque | Probabilité | Impact | Mitigation | Responsable |
|--------|------------|--------|------------|-------------|
| Coût OpenAI dépasse budget | HAUTE | HAUTE | Rate limiting par plan (10 req/min), cache réponses IA | DevOps |
| Qualité des parcours générés | MOYENNE | HAUTE | Fallback mock + validation humaine des premières routes | Tech Lead |
| Stripe webhook raté | FAIBLE | HAUTE | Retry automatique + alerte Prometheus | Dev Backend |
| RGPD données de santé (GPS, FC) | MOYENNE | CRITIQUE | Consentement explicite, data residency EU, chiffrement | PM |
| Concurrence Strava / Garmin | HAUTE | MOYENNE | Différenciation IA + voyage, niche nomade | PM |
| Twilio SMS coûts imprévus | FAIBLE | FAIBLE | Limite 1 SMS/user/jour, alertes budget | DevOps |
| Équipe indisponible | FAIBLE | HAUTE | Documentation complète, bus factor ≥ 2 | PM |

---

## 6. Indicateurs de Suivi (KPIs Projet)

| KPI | Cible S8 | Cible S12 |
|-----|---------|---------|
| Couverture tests backend (Jest) | 60% | 85% |
| Tests E2E Cypress passants | 8/17 | 17/17 |
| Bugs critiques ouverts | 0 | 0 |
| Performance API (p95) | < 500ms | < 200ms |
| Performance IA génération parcours (p95) | < 8s | < 5s |
| Uptime staging | 95% | 99% |
| Documentation complète | 50% | 100% |
| Beta users | 0 | 20 |
| NPS beta | — | > 40 |

---

## 7. Stack Technique

### Backend
| Technologie | Version | Usage |
|------------|---------|-------|
| Node.js | 20 LTS | Runtime |
| TypeScript | 5.x | Typage statique |
| Express | 4.x | Framework HTTP |
| Prisma ORM | 5.x | ORM + migrations |
| PostgreSQL | 16 | Base de données |
| Passport.js | 0.7 | OAuth2 (Google, GitHub, Microsoft) |
| JSON Web Token | 9.x | Access + Refresh tokens |
| OpenAI SDK | 4.x | GPT-4o (chat + génération + analyse) |
| Stripe | 14.x | Checkout, webhooks, portal |
| @sendgrid/mail | 8.x | Emails transactionnels |
| Twilio | 5.x | SMS |
| prom-client | 15.x | Métriques Prometheus |
| Zod | 3.x | Validation des entrées |
| Winston | 3.x | Logging structuré JSON |
| Helmet | 7.x | Sécurité HTTP headers |

### Frontend
| Technologie | Version | Usage |
|------------|---------|-------|
| Next.js | 14 | App Router, SSR/CSR |
| React | 18 | UI framework |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 3.x | Styling utility-first |
| Zustand | 4.x | State management (auth, user) |
| Axios | 1.x | Client HTTP + intercepteurs JWT |
| SWR | 2.x | Data fetching + cache |
| Recharts | 2.x | Graphiques (dashboard) |
| Radix UI | 1.x | Composants accessibles |

### DevOps
| Technologie | Usage |
|------------|-------|
| Docker + Docker Compose | Conteneurisation |
| GitHub Actions | CI/CD (test → build → deploy) |
| Prometheus | Collecte métriques |
| Grafana | Dashboards monitoring |
| Turbo (Turborepo) | Monorepo build orchestration |
