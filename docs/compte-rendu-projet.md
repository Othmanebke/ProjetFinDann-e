# Compte Rendu de Projet de Fin d'Année

**Projet :** élan — Plateforme SaaS de Coaching Fitness & Voyage
**Formation :** Développement Web & Applications
**Date :** Mars 2026
**Auteur :** [Ton prénom / groupe]

---

## Sommaire

1. [Introduction et contexte](#1-introduction-et-contexte)
2. [Présentation du projet](#2-présentation-du-projet)
3. [Architecture technique](#3-architecture-technique)
4. [BC01 — Authentification & Sécurité](#4-bc01--authentification--sécurité)
5. [BC02 — Base de données & Persistance](#5-bc02--base-de-données--persistance)
6. [BC03 — Services métier](#6-bc03--services-métier)
7. [BC04 — Frontend Next.js](#7-bc04--frontend-nextjs)
8. [Difficultés rencontrées et solutions](#8-difficultés-rencontrées-et-solutions)
9. [Bilan et résultats](#9-bilan-et-résultats)
10. [Perspectives et évolutions](#10-perspectives-et-évolutions)
11. [Conclusion](#11-conclusion)

---

## 1. Introduction et contexte

Dans le cadre de ma formation, j'ai réalisé un projet de fin d'année dont l'objectif était de concevoir et développer une application web complète en mode SaaS (Software as a Service), en intégrant l'ensemble des compétences acquises au cours de l'année : développement backend, frontend, base de données, intelligence artificielle, paiements en ligne, notifications et monitoring.

Le projet devait couvrir quatre blocs de compétences (BC01 à BC04) :
- **BC01** : Authentification et sécurité (OAuth2, JWT, RBAC, rate limiting)
- **BC02** : Base de données et persistance (PostgreSQL, Prisma, migrations, seeds)
- **BC03** : Services métier (IA, notifications multi-canaux, paiements Stripe, métriques Prometheus)
- **BC04** : Frontend moderne (Next.js 14, design responsive, intégration API)

J'ai choisi de développer **élan**, une plateforme de coaching fitness et voyage alimentée par l'intelligence artificielle, car ce domaine me tenait à cœur et permettait d'exploiter pleinement l'ensemble des technologies requises.

---

## 2. Présentation du projet

### 2.1 Idée et concept

**élan** est une application SaaS destinée aux sportifs nomades — des personnes qui pratiquent une activité physique régulière tout en voyageant fréquemment pour le travail ou les loisirs. Le défi de ces utilisateurs est de maintenir une routine sportive et nutritionnelle cohérente d'une ville à l'autre.

La plateforme répond à trois besoins principaux :

1. **Suivre ses entraînements** : enregistrer ses sessions (course, vélo, natation, etc.), visualiser ses performances sur plusieurs semaines, analyser ses progrès.
2. **Gérer sa nutrition** : logger ses repas, calculer ses macros (protéines, glucides, lipides), suivre son apport calorique journalier.
3. **Exploiter l'intelligence artificielle** : discuter avec un coach IA personnalisé, générer automatiquement des parcours de course dans n'importe quelle ville du monde, obtenir des recommandations de restaurants adaptées à ses objectifs.

### 2.2 Proposition de valeur

> "Ton coach fitness personnel qui s'adapte à chaque ville du monde."

Les différenciateurs clés par rapport aux applications existantes (Strava, Nike Run Club, MyFitnessPal) sont :
- Un **coach IA conversationnel** spécialisé fitness + voyage, pas un chatbot généraliste
- La **génération de parcours sportifs par IA** pour n'importe quelle ville à la demande
- La **combinaison fitness + nutrition** dans une interface unifiée et cohérente
- Un système de **notifications multi-canaux** (in-app, email, SMS)

### 2.3 Plans tarifaires

L'application propose trois niveaux d'accès :

| Fonctionnalité | Free | Premium Coach (12€/mois) | Pass Voyageur (19€/mois) |
|----------------|------|--------------------------|--------------------------|
| Workouts CRUD | ✅ | ✅ | ✅ |
| Nutrition logging | ✅ | ✅ | ✅ |
| Dashboard KPIs | ✅ | ✅ | ✅ |
| Chat IA (limité) | ✅ 5/jour | ✅ Illimité | ✅ Illimité |
| Analyse performance IA | ❌ | ✅ | ✅ |
| Recommandations restaurants | ❌ | ✅ | ✅ |
| Génération parcours IA | ❌ | ❌ | ✅ |
| Rappels SMS | ❌ | ✅ | ✅ |

---

## 3. Architecture technique

### 3.1 Vue d'ensemble

Le projet est organisé en **monorepo** avec Turborepo, séparant clairement le backend et le frontend :

```
élan/
├── apps/
│   ├── backend/          → API Express.js (Node.js + TypeScript)
│   └── frontend/         → Application Next.js 14
├── docs/                 → Documentation (BC01-BC04)
├── package.json          → Workspace root
└── turbo.json            → Configuration Turborepo
```

### 3.2 Stack technique

**Backend (API REST)**

| Technologie | Rôle |
|------------|------|
| Node.js 20 + TypeScript | Runtime et typage statique |
| Express.js | Framework HTTP |
| Prisma ORM | Accès base de données avec typage |
| PostgreSQL 16 | Base de données relationnelle |
| Passport.js | Stratégies OAuth2 (Google, GitHub, Microsoft) |
| JSON Web Token | Authentification stateless (access + refresh) |
| OpenAI SDK (GPT-4o) | Intelligence artificielle (chat, génération, analyse) |
| Stripe | Paiements, abonnements, webhooks |
| SendGrid | Emails transactionnels |
| Twilio | Notifications SMS |
| prom-client | Métriques Prometheus |
| Zod | Validation des entrées |
| Helmet + CORS | Sécurité HTTP |

**Frontend (Interface utilisateur)**

| Technologie | Rôle |
|------------|------|
| Next.js 14 (App Router) | Framework React avec SSR/CSR |
| TypeScript | Typage statique |
| Tailwind CSS | Styling utility-first |
| Zustand | Gestion d'état global (auth, user) |
| Axios | Client HTTP avec intercepteurs JWT |
| SWR | Data fetching et cache côté client |
| Recharts | Graphiques (dashboard, métriques) |
| Radix UI | Composants accessibles (modals, dropdowns) |

### 3.3 Schéma d'architecture

```
                    Utilisateur (navigateur)
                           │
                    ┌──────▼──────┐
                    │  Next.js    │  ← Frontend (port 3000)
                    │  App Router │    Zustand store, Axios, SWR
                    └──────┬──────┘
                           │ HTTP/SSE
                    ┌──────▼──────┐
                    │  Express    │  ← Backend API (port 4000)
                    │  REST API   │    JWT, Passport, Prisma, Zod
                    └──────┬──────┘
                           │
          ┌────────┬────────┼────────┬────────┐
          │        │        │        │        │
     ┌────▼──┐ ┌───▼──┐ ┌──▼───┐ ┌──▼──┐ ┌──▼────┐
     │Postgre│ │OpenAI│ │Stripe│ │Send │ │Twilio │
     │  SQL  │ │GPT-4o│ │      │ │Grid │ │  SMS  │
     └───────┘ └──────┘ └──────┘ └─────┘ └───────┘
```

### 3.4 Patterns d'architecture backend

J'ai appliqué une architecture en couches stricte pour garantir la maintenabilité du code :

- **Routes** : définissent les endpoints HTTP et appliquent les middlewares (authentification, rate limiting, vérification du plan)
- **Controllers** : reçoivent la requête, valident les données d'entrée (Zod), appellent les services, renvoient la réponse
- **Services** : contiennent la logique métier pure (pas de Request/Response Express)
- **Clients** : encapsulent les SDK tiers (OpenAI, Stripe, SendGrid, Twilio, Prisma)

Ce découplage facilite les tests unitaires (on teste les services indépendamment des routes HTTP).

---

## 4. BC01 — Authentification & Sécurité

### 4.1 OAuth2 avec Passport.js

J'ai implémenté l'authentification OAuth2 avec **trois fournisseurs** : Google, GitHub et Microsoft, en utilisant Passport.js. Chaque stratégie suit le même flux :

1. L'utilisateur clique sur "Se connecter avec Google"
2. Redirection vers le provider OAuth (Google)
3. L'utilisateur accepte les permissions
4. Callback vers le backend avec le code d'autorisation
5. Échange du code contre le profil utilisateur
6. Création ou mise à jour du compte en base de données
7. Génération des tokens JWT et redirection vers le frontend

```
GET /auth/google → Redirect Google → GET /auth/google/callback
→ Prisma upsert User → JWT access + refresh → Redirect frontend
```

### 4.2 JWT Access + Refresh Tokens

J'ai mis en place une stratégie de **double token** pour équilibrer sécurité et expérience utilisateur :

- **Access token** : durée de vie courte (15 minutes), envoyé dans le header `Authorization: Bearer`
- **Refresh token** : durée de vie longue (7 jours), stocké en base de données (table `RefreshToken`), permet de renouveler l'access token sans se reconnecter

La **rotation des refresh tokens** est implémentée : à chaque renouvellement, l'ancien token est révoqué et un nouveau est émis. Cela limite l'impact en cas de vol de token.

Du côté frontend, Axios gère automatiquement le renouvellement via un intercepteur de réponse : si une requête retourne une erreur 401, le token est automatiquement renouvelé avant de réessayer la requête.

### 4.3 RBAC (Role-Based Access Control)

Le système de contrôle d'accès fonctionne à deux niveaux :

- **Rôles** (`USER` / `ADMIN`) : définissent les droits administrateurs
- **Plans d'abonnement** (`FREE` / `PREMIUM_COACH` / `PASS_VOYAGEUR`) : définissent l'accès aux features premium

Deux middlewares ont été créés :
- `authenticate()` : vérifie que le JWT est valide et attache l'utilisateur à la requête
- `requirePlan(['PREMIUM_COACH', 'PASS_VOYAGEUR'])` : vérifie que l'utilisateur a le bon plan pour accéder à une feature

### 4.4 Sécurité HTTP

Plusieurs protections ont été mises en place :
- **Helmet.js** : configure automatiquement des headers de sécurité (Content-Security-Policy, X-Frame-Options, etc.)
- **CORS** : autorise uniquement le domaine frontend
- **Rate limiting** à trois niveaux :
  - Global : 200 requêtes / 15 min
  - Auth : 20 requêtes / 15 min (anti brute-force)
  - IA : 10 requêtes / min (contrôle des coûts OpenAI)
- **Zod** : validation et sanitisation de toutes les entrées utilisateur

### 4.5 Mode démo (innovation)

J'ai ajouté un **mode démo** qui permet de tester le frontend sans avoir le backend démarré. Quand l'utilisateur clique sur "Continuer avec la démo", une session est créée entièrement côté client avec un token fictif (`"demo-access-token"`). Des données mock sont utilisées pour toutes les pages. Ce mode est très utile pour les démonstrations et les présentations.

---

## 5. BC02 — Base de données & Persistance

### 5.1 Modélisation avec Prisma

J'ai utilisé **Prisma ORM** pour modéliser la base de données PostgreSQL. Le schéma compte **8 modèles principaux** avec leurs relations :

**User** — modèle central
```
User
├── id, email, name, avatarUrl, role
├── phone, timezone
├── fitnessGoal, weightKg, heightCm, weeklyTargetKm
├── currentCity, currentCountry
├── → Workout[] (ses entraînements)
├── → NutritionLog[] (ses repas)
├── → TravelRoute[] (ses parcours)
├── → FitChat[] (ses conversations IA)
├── → Subscription (son abonnement Stripe)
├── → RefreshToken[] (ses tokens de session)
└── → Notification[] (ses notifications)
```

**Workout** — enregistrement d'une session sportive
- Métriques : distanceKm, durationMin, calories, heartRateAvg, heartRateMax, paceMinPerKm, elevationM
- Localisation : city, country
- Suivi temporel : weekNumber, yearNumber (calculés automatiquement)
- Type : RUN, BIKE, SWIM, HIKE, GYM

**NutritionLog** — repas journalier
- Macros : caloriesKcal, proteinG, carbsG, fatG, fiberG
- Localisation : restaurant, city, country
- Drapeau IA : aiRecommended (si suggéré par l'IA)

**TravelRoute** — parcours sportif
- Données IA : waypoints (JSON), pointsOfInterest (JSON), aiGenerated
- Sécurité : safetyScore (1-10), safetyNotes, bestTimeOfDay
- Difficulté : EASY / MODERATE / HARD / EXPERT

**FitChat + FitMessage** — conversations avec le coach IA
- FitChat : conteneur de la conversation (titre, userId)
- FitMessage : message individuel (role: "user" | "assistant", content, metadata)

**Subscription** — abonnement Stripe
- Intégration Stripe : stripeCustomerId, stripeSubscriptionId, stripePriceId
- État : plan, status (ACTIVE, TRIALING, PAST_DUE, CANCELED)
- Dates : currentPeriodStart, currentPeriodEnd, trialEnd

**Notification** — notification in-app
- type, title, body, isRead, metadata (JSON)

**RefreshToken** — token de session
- token (UUID unique), expiresAt, revokedAt, ipAddress, userAgent

### 5.2 Migrations

Prisma génère automatiquement les scripts SQL de migration. Une migration initiale a été créée (`20260315_init`) qui contient l'ensemble du schéma. Pour les évolutions futures, chaque modification du schéma génère une nouvelle migration versionnée.

```bash
npx prisma migrate dev --name add_feature_xyz
```

### 5.3 Seed

Un script de seed a été écrit pour initialiser la base de données avec :
- Un compte administrateur (rôle ADMIN, plan PREMIUM_COACH)
- Un compte démo (rôle USER, plan FREE)
- Des parcours sportifs d'exemple (Paris, Tokyo)
- Des workouts d'exemple sur 8 semaines pour tester les graphiques

---

## 6. BC03 — Services métier

### 6.1 Fitness Tracker (Workouts)

Le service de suivi d'entraînement implémente un **CRUD complet** avec des fonctionnalités avancées :

- `GET /workouts` : liste paginée avec filtres (type, dates)
- `GET /workouts/stats?weeks=8` : agrégations hebdomadaires sur N semaines (distanceKm totale, calories, sessions, durée) pour alimenter les graphiques du dashboard
- `POST /workouts` : création avec calcul automatique du `weekNumber` et `yearNumber`
- `PATCH /workouts/:id` + `DELETE /workouts/:id` : modification et suppression avec contrôle d'accès (un utilisateur ne peut modifier que ses propres workouts)

### 6.2 Nutrition

Le service nutrition gère le logging des repas avec calcul automatique des macronutriments :

- `GET /nutrition/daily` : résumé journalier avec totaux (calories, protéines, glucides, lipides, fibres) et liste des repas
- `GET /nutrition/stats` : moyennes hebdomadaires sur plusieurs semaines
- `POST /nutrition` : création d'un log avec validation des macros (tous les champs numériques sont validés par Zod)
- `POST /nutrition/recommend` : génération IA de recommandations de restaurants (endpoint Premium)

### 6.3 Intelligence Artificielle (GPT-4o)

C'est le service le plus complexe du projet, il implémente **quatre fonctionnalités IA distinctes** :

**a) Chat streaming (SSE)**

Le coach IA est implémenté avec du streaming **Server-Sent Events** (SSE) pour une expérience temps réel : les réponses apparaissent mot par mot, comme ChatGPT. Techniquement :

```
Frontend: fetch('/ai/chats/:id/stream', { method: 'POST' })
          → ReadableStream reader → décode les chunks → affiche progressivement
Backend:  res.setHeader('Content-Type', 'text/event-stream')
          openai.chat.completions.create({ stream: true })
          → for await (const chunk of stream) → res.write(delta)
```

Le coach IA reçoit un **system prompt** qui le spécialise : il parle exclusivement de fitness, nutrition et voyage, répond en français, et s'adapte au profil de l'utilisateur (objectif fitness, ville actuelle).

**b) Génération de parcours**

À partir d'une ville, un pays, un type d'activité (RUN/BIKE/HIKE) et une distance, l'IA génère un parcours complet avec :
- Des waypoints géoréférencés (latitude/longitude)
- Des points d'intérêt (monuments, parcs, restaurants)
- Un score de sécurité (1-10)
- La meilleure heure de la journée pour pratiquer
- Le dénivelé estimé

Si la clé OpenAI n'est pas configurée, un **fallback mock** est renvoyé automatiquement pour ne pas bloquer le développement.

**c) Recommandations de restaurants**

L'IA génère des recommandations de restaurants dans une ville, calibrées sur l'objectif de l'utilisateur (endurance, prise de masse, perte de poids), son apport calorique cible et ses restrictions alimentaires. Chaque recommandation inclut une explication nutritionnelle.

**d) Analyse de performance**

À partir des données des 8 dernières semaines (distance, durée, calories, sessions), l'IA produit une analyse personnalisée avec des recommandations concrètes et une tendance globale (IMPROVING / STABLE / DECLINING).

### 6.4 Notifications multi-canaux

Trois canaux de notification ont été implémentés :

**Notifications in-app**
- Stockées en base de données (table `Notification`)
- Endpoints : liste, marquer comme lu, marquer tout comme lu
- Affichées dans la navbar avec un badge de comptage

**Email (SendGrid)**
- `sendWelcomeEmail()` : envoyé automatiquement à l'inscription, avec les liens vers les fonctionnalités clés
- `sendWeeklyRecapEmail()` : récapitulatif hebdomadaire avec les stats de la semaine (km totaux, calories, sessions)
- Templates HTML avec la charte graphique de l'application

**SMS (Twilio)**
- `sendRunReminderSMS()` : rappel de séance de course avec la ville et l'heure
- Endpoint dédié : `POST /notifications/sms-reminder`
- Vérification que l'utilisateur a un numéro de téléphone enregistré

### 6.5 Paiements Stripe

L'intégration Stripe couvre le cycle complet d'abonnement :

**Checkout** : `POST /billing/checkout` crée une session Stripe Checkout en mode abonnement avec 14 jours d'essai gratuit et codes promotionnels activés. L'utilisateur est redirigé vers la page de paiement hébergée par Stripe.

**Webhook** : `POST /billing/webhook` reçoit les événements Stripe (paiement réussi, abonnement mis à jour, paiement échoué, résiliation). La signature est vérifiée pour garantir l'authenticité. La base de données est mise à jour en conséquence (changement de plan, downgrade en Free si paiement échoué).

**Customer Portal** : `GET /billing/portal` génère un lien vers le portail Stripe qui permet à l'utilisateur de gérer son abonnement (modifier, annuler, changer de moyen de paiement) sans développement côté application.

### 6.6 Métriques Prometheus

Un middleware Express capture automatiquement les métriques HTTP et des métriques business personnalisées sont exposées sur `GET /metrics` :

- `elan_http_requests_total` : nombre de requêtes par route/method/status
- `elan_http_request_duration_seconds` : histogramme de latence
- `elan_ai_requests_total` : nombre de requêtes IA par type
- `elan_ai_request_duration_seconds` : latence des appels GPT-4o
- `elan_active_users` : utilisateurs actifs
- `elan_subscriptions` : abonnements actifs par plan
- Métriques Node.js par défaut (CPU, mémoire heap, event loop lag)

Ces métriques permettent de configurer des **alertes Prometheus** (taux d'erreur élevé, API lente, IA lente, backend down) et des **dashboards Grafana** pour le monitoring en production.

---

## 7. BC04 — Frontend Next.js

### 7.1 Choix techniques frontend

J'ai utilisé **Next.js 14** avec l'App Router, qui permet de mélanger des composants serveur (meilleurs pour le SEO et les performances) et des composants client (nécessaires pour l'interactivité). Tous les composants qui utilisent des hooks React (useState, useEffect) ou des interactions utilisateur sont marqués `'use client'`.

La gestion d'état utilise **Zustand** avec persistance localStorage : les tokens JWT et les données utilisateur survivent aux rechargements de page. Les requêtes API utilisent **SWR** pour le cache automatique et la revalidation.

### 7.2 Design system

J'ai développé un design system cohérent inspiré d'une esthétique "chaleureuse et sportive" :
- **Couleurs** : fond beige chaud `#FAF8ED`, orange vif `#EA580C` (actions primaires), emeraude `#047857` (succès/nature)
- **Typographie** : Montserrat pour les titres (sportif, moderne), system-ui pour le corps de texte
- **Composants** : cartes avec bordures subtiles, boutons avec états hover, badges de statut colorés

### 7.3 AppLayout (Sidebar + Navbar)

Un layout applicatif `AppLayout` enveloppe toutes les pages authentifiées. Il contient :
- Une **Sidebar** de navigation (240px fixe) avec les liens vers les 7 sections
- Une **Navbar** supérieure avec le titre de la page, une barre de recherche et les actions rapides
- Un **guard d'authentification** : si l'utilisateur n'est pas connecté, redirection automatique vers `/login`
- Un **état de chargement** pendant la vérification du token

### 7.4 Pages développées

**Page d'accueil** (`/`) — Landing page publique
- Navbar avec menu overlay animé
- Hero section avec proposition de valeur
- Features avec icônes
- Les liens du menu overlay pointent vers les vraies pages de l'application

**Login** (`/login`)
- Trois boutons OAuth (Google, GitHub, Microsoft)
- Bouton "Mode démo" pour tester sans compte
- Gestion des erreurs OAuth (paramètre `?error=oauth_failed`)

**Dashboard** (`/dashboard`)
- 4 KPI cards : km cette semaine, calories brûlées, temps actif, total de la semaine
- Comparaison semaine précédente avec indicateur de tendance
- Graphique d'évolution sur 8 semaines (Recharts AreaChart)
- Liste des derniers workouts avec icons par type

**Parcours** (`/routes`)
- Liste des parcours générés avec distance, difficulté, score de sécurité
- Formulaire de génération IA : ville, pays, type d'activité, distance souhaitée
- Affichage des waypoints et points d'intérêt
- Suppression des parcours existants

**Nutrition** (`/nutrition`)
- Récapitulatif journalier avec progress bars pour chaque macro (protéines, glucides, lipides)
- Formulaire d'ajout de repas avec calcul automatique des macros restantes
- Historique des repas du jour avec suppression
- Statistiques hebdomadaires

**Métriques** (`/metrics`)
- Graphiques en barres des performances sur 8 semaines
- Zones de fréquence cardiaque
- KPIs de la session la plus récente
- Objectifs hebdomadaires avec taux d'atteinte

**Coach IA** (`/ai`)
- Liste des conversations dans une sidebar gauche
- Interface de chat avec streaming SSE temps réel (les réponses s'affichent lettre par lettre)
- Suggestions de démarrage de conversation
- Mode démo avec simulation de streaming via setInterval
- Création de nouvelles conversations

**Explorer** (`/explorer`)
- Défis communautaires avec barre de progression
- Spots populaires par ville
- Feed communautaire avec système de likes
- Section "Achievements" en cours

**Workouts** (`/workouts`, `/workouts/new`)
- Liste de tous les workouts avec filtres
- Formulaire de création avec tous les champs (type, distance, durée, FC, localisation)

**Billing** (`/billing`)
- Affichage du plan actuel
- Cartes de présentation des 3 plans
- Bouton de mise à niveau vers Stripe Checkout
- Lien vers le Customer Portal

**Profil** (`/profile`)
- Informations personnelles (nom, email, avatar)
- Données fitness (objectif, poids, taille, objectif km/semaine)
- Ville actuelle et pays

---

## 8. Difficultés rencontrées et solutions

### 8.1 Streaming SSE avec Next.js et Express

**Problème** : Implémenter le streaming de la réponse IA (SSE) de bout en bout a été la partie la plus complexe. Le frontend doit maintenir une connexion longue avec le backend, lire les chunks de données au fur et à mesure et les afficher progressivement.

**Solution** : Côté backend, j'ai configuré les headers SSE (`Content-Type: text/event-stream`, `Cache-Control: no-cache`) et utilisé l'API streaming d'OpenAI avec une boucle `for await`. Côté frontend, j'ai utilisé l'API native `fetch` avec `ReadableStream` et un `TextDecoder` pour décoder les chunks, plutôt qu'EventSource (qui ne supporte pas les requêtes POST).

Pour le mode démo, j'ai simulé le streaming avec `setInterval` qui révèle le texte caractère par caractère.

### 8.2 Authentification OAuth avec callback côté frontend

**Problème** : Après le callback OAuth, le backend redirige vers le frontend avec les tokens dans l'URL. Il fallait extraire ces tokens, les stocker dans Zustand et supprimer les paramètres de l'URL (pour éviter qu'ils soient bookmarkés ou partagés).

**Solution** : Une page `/auth/callback` côté Next.js récupère les paramètres URL via `useSearchParams()`, les stocke dans le store Zustand, puis remplace l'entrée dans l'historique avec `router.replace('/dashboard')`. Le store Zustand persiste les tokens dans `localStorage`.

### 8.3 Intercepteur Axios pour le renouvellement de token

**Problème** : Quand un access token expire (après 15 min), toutes les requêtes en cours retournent 401. Il fallait intercepter ces erreurs, renouveler le token et rejouer les requêtes automatiquement, sans créer de boucle infinie.

**Solution** : L'intercepteur de réponse Axios détecte les erreurs 401, appelle `POST /auth/refresh`, met à jour le store Zustand, puis rejoue la requête originale avec le nouveau token. Un drapeau `_retry` sur la configuration de la requête évite les boucles infinies. Un cas spécial traite le mode démo (token `"demo-access-token"`) pour ne pas déclencher de renouvellement.

### 8.4 Webhook Stripe en développement local

**Problème** : Stripe envoie les webhooks vers une URL publique, mais en développement on travaille sur `localhost` qui n'est pas accessible depuis Internet.

**Solution** : En développement, on utilise `stripe listen --forward-to localhost:4000/billing/webhook` (CLI Stripe) qui crée un tunnel temporaire. En production, l'URL est l'endpoint public du serveur. La validation de la signature Stripe (`stripe.webhooks.constructEvent`) garantit que seuls les vrais événements Stripe sont traités.

### 8.5 TypeScript strict avec les tuples

**Problème** : Dans la page nutrition, j'utilisais un tableau de tuples `['P', log.proteinG, '#0E7490']` pour rendre les badges de macros. TypeScript infère le type comme `(string | number)[]` et refuse la comparaison `v > 0` (car `v` pourrait être une string).

**Solution** : Caster explicitement avec `Number(v) > 0` pour forcer la comparaison numérique.

### 8.6 Mode démo sans backend

**Problème** : Lors des démonstrations ou des présentations, le backend PostgreSQL n'est pas toujours disponible. Se connecter avec OAuth requiert le backend pour valider le code d'autorisation.

**Solution** : J'ai créé un mode démo 100% client-side : le store Zustand est initialisé directement avec un faux token et un profil utilisateur fictif. L'hook `useAuth.ts` détecte le token démo et saute l'appel à `/auth/me`. Les intercepteurs Axios ignorent les erreurs 401 pour le token démo. Toutes les pages ont des données mock de fallback.

---

## 9. Bilan et résultats

### 9.1 Fonctionnalités livrées

| Fonctionnalité | Statut | Notes |
|---------------|--------|-------|
| Auth OAuth2 (Google + GitHub + Microsoft) | ✅ Complet | 3 providers + callback frontend |
| JWT access + refresh avec rotation | ✅ Complet | 15min / 7j, révocation |
| RBAC (FREE / PREMIUM / ADMIN) | ✅ Complet | Middleware requirePlan |
| Rate limiting (3 niveaux) | ✅ Complet | Global, Auth, IA |
| Helmet + CORS | ✅ Complet | |
| PostgreSQL + Prisma (8 modèles) | ✅ Complet | Migrations + seeds |
| Workout CRUD + stats 8 semaines | ✅ Complet | |
| Nutrition CRUD + macros + résumé journalier | ✅ Complet | |
| Chat IA streaming SSE (GPT-4o) | ✅ Complet | Mode démo inclus |
| Génération de parcours IA | ✅ Complet | Fallback mock inclus |
| Recommandations restaurants IA | ✅ Complet | |
| Analyse performance IA | ✅ Complet | |
| Notifications in-app | ✅ Complet | |
| Email welcome + récap hebdo (SendGrid) | ✅ Complet | |
| SMS rappel course (Twilio) | ✅ Complet | |
| Stripe checkout + webhook + portal | ✅ Complet | |
| Métriques Prometheus | ✅ Complet | 10+ métriques |
| Dashboard KPIs + graphiques | ✅ Complet | Recharts |
| 5 pages app (Routes, Nutrition, Métriques, IA, Explorer) | ✅ Complet | |
| AppLayout (Sidebar + Navbar) | ✅ Complet | |
| Landing page + mode démo | ✅ Complet | |
| Documentation BC01-BC04 | ✅ Complet | |

**Résultat : 100% des exigences BC01-BC04 couvertes.**

### 9.2 Qualité du code

- **TypeScript strict** activé sur backend et frontend (`"strict": true` dans les deux tsconfig)
- **Zod** valide toutes les entrées utilisateur aux endpoints backend
- **Architecture en couches** (routes → controllers → services → clients) respectée sur tout le backend
- **Séparation des responsabilités** frontend : hooks custom, store Zustand, composants purs
- **Gestion d'erreurs** : middleware Express global qui transforme les AppError en réponses JSON structurées

### 9.3 Sécurité

- Aucune requête SQL manuelle : Prisma protège contre les injections SQL
- Validation Zod sur toutes les entrées : protection XSS et données malformées
- Headers de sécurité via Helmet
- Validation de signature webhook Stripe
- Rate limiting anti-brute-force sur les routes d'auth
- Isolation des données : chaque utilisateur ne peut accéder qu'à ses propres données (contrôle `userId` dans tous les services)

---

## 10. Perspectives et évolutions

### Court terme (V1.1 — Q2 2026)

- **Intégration Strava / Garmin** : import automatique des activités depuis ces plateformes (API OAuth2)
- **Mode hors-ligne** : mise en cache des parcours générés pour consultation sans connexion
- **Plan d'entraînement IA** : génération d'un programme sur 4 à 12 semaines basé sur l'historique de l'utilisateur et ses objectifs
- **Tests automatisés** : écriture des tests Jest backend (objectif 85% de couverture) et tests Cypress E2E

### Moyen terme (V2.0 — Q4 2026)

- **Application mobile** (React Native) : iOS + Android avec notifications push
- **Wearables** : connexion aux montres Fitbit, Apple Watch, Polar
- **Suivi GPS en temps réel** : carte live pendant la course avec le tracé du parcours IA
- **Multi-langue** : anglais, espagnol, allemand, portugais
- **Coach vocal** : réponses du coach IA en audio (Text-to-Speech)

---

## 11. Conclusion

Ce projet de fin d'année a été une expérience complète et ambitieuse. J'ai eu l'opportunité de concevoir et développer une application SaaS de bout en bout, depuis la modélisation de la base de données jusqu'à l'interface utilisateur, en passant par l'intégration de services tiers complexes.

**Ce que j'ai appris :**

- La **complexité réelle d'une authentification sécurisée** : OAuth2, JWT avec rotation, révocation de tokens, et la gestion des cas limites (token expiré pendant une requête, mode démo sans backend)
- L'**intégration de l'IA en production** : le streaming SSE est bien plus complexe qu'un simple appel API, mais offre une expérience utilisateur incomparablement meilleure. Gérer les cas de panne (quota OpenAI dépassé, réseau instable) avec des fallbacks gracieux est essentiel.
- La **valeur d'une architecture propre** : la séparation en couches (routes/controllers/services/clients) semble contraignante au début, mais rend le code facile à tester, à faire évoluer et à déboguer.
- La **criticité des webhooks** pour les paiements : manquer un événement Stripe peut bloquer un utilisateur dans un état incohérent. La validation de signature et la gestion des événements doivent être robustes.
- L'**importance de l'expérience développeur** : le mode démo, les données de seed, les fallbacks mock pour l'IA — ces éléments n'ajoutent pas de valeur directe pour les utilisateurs finaux, mais accélèrent considérablement le développement et les démonstrations.

Le résultat est une application fonctionnelle, sécurisée et évolutive qui couvre l'ensemble des exigences du cahier des charges. Elle constitue une base solide pour un vrai lancement commercial après quelques semaines de tests et de polissage.

---

*Document rédigé dans le cadre du projet de fin d'année — Mars 2026*
*Dépôt Git : https://github.com/Othmanebke/ProjetFinDann-e*
