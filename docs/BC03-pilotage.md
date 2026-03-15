# BC03 — Pilotage Projet : SmartProject AI

**Version :** 1.0
**Date :** Mars 2026

---

## 1. Planning — Gantt 12 Semaines

| Semaine | Sprint | Objectif | Livrables |
|---------|--------|---------|-----------|
| S1 | Sprint 1 | Infrastructure & Auth | Monorepo, Docker, Prisma schema, OAuth2 |
| S2 | Sprint 1 | Backend Core | Projects + Tasks CRUD complet |
| S3 | Sprint 2 | IA & Billing | AI service (OpenAI + SSE), Stripe checkout |
| S4 | Sprint 2 | Notifications & Métriques | SendGrid, Twilio, Prometheus |
| S5 | Sprint 3 | Frontend Core | Landing, Login, Dashboard, Layout |
| S6 | Sprint 3 | Frontend Features | Projects, Tasks, Kanban |
| S7 | Sprint 4 | Frontend IA & Billing | Chat IA streaming, Pricing, Portal |
| S8 | Sprint 4 | Admin & Métriques | Admin panel, Grafana, Profil |
| S9 | Sprint 5 | Tests | Jest (backend 85%+), Cypress E2E |
| S10 | Sprint 5 | DevOps & CI/CD | GitHub Actions, Dockerfiles, scripts |
| S11 | Sprint 6 | Beta & Bugfix | Beta utilisateurs, corrections |
| S12 | Sprint 6 | Launch | Déploiement production, monitoring |

### Diagramme Gantt (ASCII)

```
Semaine:    S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12
Infrastructure: ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Auth/Backend:   ███ ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
IA/Billing:     ░░░ ░░░ ███ ██░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Notifications:  ░░░ ░░░ ░░░ ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Frontend Core:  ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░
Frontend IA:    ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░ ░░░ ░░░
Tests:          ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░
DevOps/CI:      ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ░░░ ░░░
Beta/Launch:    ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███
```

---

## 2. RACI

| Activité | Dev Backend | Dev Frontend | PM | DevOps | Designer | QA |
|----------|------------|-------------|-----|--------|----------|-----|
| Architecture | R | C | A | C | I | I |
| Prisma Schema | R | I | A | I | I | I |
| Auth Service | R | C | A | I | I | I |
| IA Service | R | I | A | I | I | I |
| Billing Service | R | C | A | I | I | I |
| Notifications | R | I | A | I | I | I |
| Frontend Layout | I | R | A | I | C | C |
| UI Components | I | R | A | I | C | C |
| Chat IA UI | C | R | A | I | C | I |
| Tests unitaires | R | R | A | I | I | C |
| Tests E2E | I | C | A | I | I | R |
| CI/CD Pipeline | I | I | A | R | I | I |
| Docker Compose | I | I | A | R | I | I |
| Monitoring | I | I | A | R | I | I |
| Documentation | C | C | R | C | I | C |
| Beta Testing | C | C | R | I | I | R |

**R = Responsable, A = Approbateur, C = Consulté, I = Informé**

---

## 3. Équipe & Rôles

| Rôle | Responsabilités | % du temps |
|------|----------------|-----------|
| **Tech Lead / Dev Backend** | Architecture, API, IA, Billing | 100% |
| **Dev Frontend** | Next.js, composants, intégrations | 100% |
| **Product Manager** | Roadmap, user stories, validation | 50% |
| **DevOps / SRE** | Docker, CI/CD, monitoring | 50% |
| **Designer UX** | Maquettes, design system (TailwindCSS) | 25% |
| **QA Engineer** | Tests E2E, validation, bug tracking | 50% |

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
| Redis (managed) | 1GB | 15€ |
| OpenAI API | GPT-4o (est. 500 users) | 200€ |
| Stripe | 2.9% + 0.30€ | Variable |
| SendGrid | Essentials 50k emails | 15€ |
| Twilio | SMS ~ 1000/mois | 20€ |
| Monitoring (Grafana Cloud) | Starter | 0€ |
| CDN + DNS | Cloudflare | 0€ |
| **Total Infra/mois** | | **~355€/mois** |

### ROI Estimé

| Mois | Users Free | Users Pro | MRR | Coûts | Profit |
|------|-----------|-----------|-----|-------|--------|
| M1 | 100 | 5 | 145€ | 355€ | -210€ |
| M3 | 500 | 30 | 870€ | 500€ | +370€ |
| M6 | 2 000 | 100 | 2 900€ | 1 200€ | +1 700€ |
| M12 | 5 000 | 400 | 11 600€ | 3 000€ | +8 600€ |

*Hypothèse : 8% conversion Free→Pro, 0.5% Pro→Enterprise*

---

## 5. Risques Projet

| Risque | Probabilité | Impact | Mitigation | Responsable |
|--------|------------|--------|------------|-------------|
| Retard développement IA | MOYENNE | HAUTE | Buffer 2 semaines S11-S12 | Tech Lead |
| Coût OpenAI dépasse budget | HAUTE | MOYENNE | Rate limiting + cache | DevOps |
| Stripe breaking change | FAIBLE | HAUTE | Pin version API Stripe | Dev Backend |
| RGPD non-conformité | FAIBLE | CRITIQUE | DPA + Data residency EU | PM |
| Équipe indisponible | FAIBLE | HAUTE | Documentation complète | PM |
| Sécurité (XSS/injection) | FAIBLE | CRITIQUE | Code review + ZAP scan | QA + Tech Lead |

---

## 6. Indicateurs de Suivi (KPIs Projet)

| KPI | Cible S8 | Cible S12 |
|-----|---------|---------|
| Couverture tests backend | 60% | 85% |
| Tests E2E passants | 8/15 | 15/15 |
| Bugs critiques ouverts | 0 | 0 |
| Performance API (p95) | < 500ms | < 200ms |
| Uptime staging | 95% | 99% |
| Documentation complète | 50% | 100% |
| Beta users | 0 | 20 |
