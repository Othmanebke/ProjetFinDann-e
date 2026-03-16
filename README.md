# 🏃 Fit & Travel — Coaching Sportif & Nutrition pour Voyageurs

Application SaaS de coaching sportif intelligent dédiée aux voyageurs. Génère des parcours sécurisés dans le monde entier, recommande des plats locaux adaptés à vos objectifs, et suit vos performances semaine après semaine.

## Concept

**Fit & Travel** résout un problème réel : maintenir sa routine sportive et nutritionnelle en voyage est difficile. Notre IA génère des parcours de course/marche/vélo personnalisés passant par les points d'intérêt locaux (musées, monuments, parcs), et recommande des restaurants locaux respectant vos macros.

## Stack Technique

- **Frontend** : Next.js 14, React 18, TailwindCSS, Zustand, SWR, Recharts
- **Backend** : Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **IA** : OpenAI GPT-4o (génération de parcours, recommandations nutrition, analyse performance)
- **Auth** : OAuth2 (Google, GitHub), JWT avec rotation des refresh tokens
- **Paiement** : Stripe (FREE / PREMIUM COACH / PASS VOYAGEUR)
- **Notifications** : SendGrid (email weekly recap), Twilio (SMS rappel run)
- **Métriques** : Prometheus + Grafana
- **Infrastructure** : Docker Compose, GitHub Actions CI/CD

## Fonctionnalités

### 🗺️ Parcours IA
- Génération de parcours de course/marche/vélo dans n'importe quelle ville
- Passage par des points d'intérêt culturels (monuments, musées, parcs)
- Score de sécurité, meilleure heure, conseils pratiques
- Niveaux : Facile / Modéré / Difficile

### 🍽️ Nutrition Intelligente
- Recommandations de plats locaux adaptés aux objectifs fitness
- Macros détaillées (protéines, glucides, lipides, calories)
- Filtre par restrictions alimentaires
- Focus sur la cuisine locale authentique

### 📊 Suivi Performance
- Tableau de bord avec graphiques semaine par semaine
- Comparaison des performances (distance, durée, calories)
- Objectif hebdomadaire avec barre de progression
- Analyse IA de la tendance de progression

### 🤖 Coach IA 24/7
- Assistant conversationnel fitness + voyage
- Génération de programmes d'entraînement pour voyageurs
- Conseils récupération, nutrition, prévention blessures

## Plans

| Fonctionnalité | FREE | PREMIUM COACH | PASS VOYAGEUR |
|---|---|---|---|
| Séances enregistrées | Illimité | Illimité | Illimité |
| Parcours IA/mois | 3 | 30 | Illimité |
| Coach IA | 5 messages | 100 messages | Illimité |
| Logs nutrition | 10 | Illimité | Illimité |
| SMS reminders | ❌ | ❌ | ✅ |

## Installation

```bash
# 1. Cloner le repo
git clone https://github.com/Othmanebke/ProjetFinDann-e.git
cd ProjetFinDann-e

# 2. Variables d'environnement
cp .env.example .env
# Remplir les clés : DATABASE_URL, OPENAI_API_KEY, STRIPE_SECRET_KEY, etc.

# 3. Lancer l'infrastructure
docker-compose up -d postgres redis

# 4. Installer les dépendances
npm install

# 5. Base de données
npx prisma migrate dev --name init
npx prisma db seed

# 6. Lancer en développement
npm run dev
# Frontend → http://localhost:3010
# Backend  → http://localhost:4000
```

## Comptes de test

- **Admin** : admin@fittravel.app / Admin@123!
- **Demo** : demo@fittravel.app / User@123!

## Architecture

```
fit-travel/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   └── backend/           # Express + TypeScript
├── packages/
│   ├── types/             # Types partagés TypeScript
│   └── shared/            # Utilitaires partagés
├── prisma/                # Schéma + migrations + seed
└── docs/                  # Documentation
```
