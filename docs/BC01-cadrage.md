# BC01 — Cadrage Produit : élan (Fit & Travel)

**Version :** 2.0
**Date :** Mars 2026
**Statut :** Approuvé

---

## 1. Vision Produit

**élan** est une plateforme SaaS B2C de coaching fitness et de voyage, enrichie par l'intelligence artificielle. Elle accompagne les sportifs nomades dans leur pratique physique où qu'ils se trouvent dans le monde, en combinant suivi d'entraînement, nutrition, génération de parcours IA et coach personnel conversationnel.

### Proposition de Valeur Unique
> "Ton coach fitness personnel qui s'adapte à chaque ville du monde."

**Différentiateurs clés :**
- Coach IA (GPT-4o) spécialisé fitness + voyage — pas un chatbot généraliste
- Génération de parcours de course/vélo adaptés à la ville où l'utilisateur se trouve
- Recommandations de restaurants calibrées sur les objectifs nutritionnels
- Suivi complet : workouts, nutrition, métriques hebdomadaires, progression
- Notifications multi-canaux : in-app, email (SendGrid), SMS (Twilio)
- Pricing adapté : Free → Premium Coach → Pass Voyageur

---

## 2. Objectifs Business

| Objectif | Indicateur | Cible 12 mois |
|----------|-----------|----------------|
| Acquisition | Utilisateurs inscrits | 10 000 |
| Conversion | Free → Premium | 10% |
| Revenus | MRR | 30 000 € |
| Rétention | Churn mensuel | < 4% |
| Satisfaction | NPS | > 55 |
| Engagement | Sessions IA/user/semaine | > 3 |

---

## 3. Personas

### Persona 1 — Théo, Runner Voyageur (utilisateur principal)
- **Profil :** 29 ans, consultant en IT, voyage 2-3 semaines/mois pour le travail
- **Problèmes :** Perd sa routine sportive en déplacement, ne connaît pas les quartiers sûrs pour courir, mange mal lors des voyages
- **Besoins :** Trouver des parcours de course adaptés à la ville, suivre sa nutrition, avoir un coach disponible 24h/24
- **Willingness to Pay :** 19€/mois Pass Voyageur
- **Déclencheur d'achat :** "L'IA m'a généré un parcours de 10km à Tokyo en 30 secondes"

### Persona 2 — Camille, Sportive Amateur (utilisatrice secondaire)
- **Profil :** 34 ans, infirmière, court 3x/semaine, veut progresser en semi-marathon
- **Problèmes :** Pas de coach abordable, mange sans tracker ses macros, manque de motivation
- **Besoins :** Analyse de ses performances hebdomadaires, conseils nutritionnels, encouragements IA
- **Willingness to Pay :** 12€/mois Premium Coach
- **Déclencheur :** "Le coach IA a analysé mes 8 dernières semaines et m'a donné un plan concret"

### Persona 3 — Lucas, Athlète Confirmé (utilisateur Free)
- **Profil :** 24 ans, étudiant en STAPS, fait de la compétition en triathlon
- **Problèmes :** Outils trop chers, veut centraliser ses données d'entraînement
- **Besoins :** CRUD workouts, stats semaine, historique nutrition
- **Willingness to Pay :** Plan Free (pourra upgrader pour le coach IA)
- **Déclencheur :** "C'est gratuit et le dashboard est propre"

---

## 4. User Stories (MVP)

### Authentification
- **US-01 :** En tant qu'utilisateur, je peux me connecter avec Google, GitHub ou Microsoft en 1 clic
- **US-02 :** En tant qu'utilisateur, ma session reste active grâce au refresh token automatique (7 jours)
- **US-03 :** En tant qu'admin, je peux voir et gérer tous les utilisateurs

### Workouts & Fitness
- **US-04 :** En tant qu'utilisateur, je peux enregistrer un workout avec distance, durée, calories, fréquence cardiaque
- **US-05 :** En tant qu'utilisateur, je vois mes stats hebdomadaires sur 8 semaines avec graphiques
- **US-06 :** En tant qu'utilisateur, je peux consulter, modifier et supprimer mes workouts
- **US-07 :** En tant qu'utilisateur, mon dashboard affiche mes KPIs de la semaine (km, calories, temps, sessions)

### Nutrition
- **US-08 :** En tant qu'utilisateur, je peux logger un repas avec nom, calories, protéines, glucides, lipides
- **US-09 :** En tant qu'utilisateur, je vois mon récap nutritionnel journalier (calories totales, macros, objectifs)
- **US-10 :** En tant qu'utilisateur Premium, l'IA me recommande des restaurants adaptés à mes objectifs

### Coach IA
- **US-11 :** En tant qu'utilisateur, je peux chatter avec le coach IA fitness/voyage en streaming SSE
- **US-12 :** En tant qu'utilisateur Premium, l'IA génère un parcours de course/vélo dans ma ville actuelle
- **US-13 :** En tant qu'utilisateur Premium, l'IA analyse mes 8 dernières semaines et identifie mes points d'amélioration
- **US-14 :** En tant qu'utilisateur, je peux retrouver l'historique de mes conversations avec le coach

### Notifications
- **US-15 :** Je reçois un email de bienvenue à l'inscription (SendGrid)
- **US-16 :** Je reçois un SMS de rappel avant ma séance de course (Twilio)
- **US-17 :** Je reçois un récap hebdomadaire par email avec mes stats
- **US-18 :** Je vois mes notifications in-app et peux les marquer comme lues

### Billing
- **US-19 :** Je peux passer au plan Premium via Stripe Checkout en 3 clics avec 14 jours d'essai
- **US-20 :** Je peux gérer mon abonnement (annuler, changer) depuis le Customer Portal Stripe
- **US-21 :** Mon plan est downgrade en Free si le paiement échoue (webhook Stripe)

### Métriques & Admin
- **US-22 :** En tant que DevOps, je peux scraper `/metrics` avec Prometheus
- **US-23 :** En tant qu'admin, je peux voir les métriques business (users, workouts, abonnements actifs)

---

## 5. Plans & Pricing

| Feature | Free | Premium Coach (12€/mois) | Pass Voyageur (19€/mois) |
|---------|------|--------------------------|--------------------------|
| Workouts CRUD | ✅ Illimité | ✅ | ✅ |
| Nutrition logging | ✅ | ✅ | ✅ |
| Dashboard KPIs | ✅ | ✅ | ✅ |
| Chat IA coach | ✅ 5/jour | ✅ Illimité | ✅ Illimité |
| Analyse performance IA | ❌ | ✅ | ✅ |
| Recommandations restaurants | ❌ | ✅ | ✅ |
| Génération parcours IA | ❌ | ❌ | ✅ |
| Accès Explorer community | ✅ | ✅ | ✅ |
| Rappels SMS | ❌ | ✅ | ✅ |

---

## 6. Roadmap Produit

### MVP v1.0 (Semaines 1-8)

| Feature | Priorité | Statut |
|---------|----------|--------|
| Auth OAuth2 (Google + GitHub + Microsoft) | P0 | ✅ Done |
| Workouts CRUD + stats | P0 | ✅ Done |
| Nutrition CRUD + macros | P0 | ✅ Done |
| Chat IA streaming (SSE) | P0 | ✅ Done |
| Stripe Billing (Free/Premium/Voyageur) | P0 | ✅ Done |
| Génération parcours IA | P1 | ✅ Done |
| Recommandations restaurants IA | P1 | ✅ Done |
| Analyse performance IA | P1 | ✅ Done |
| Notifications email (SendGrid) | P1 | ✅ Done |
| Notifications SMS (Twilio) | P1 | ✅ Done |
| Dashboard KPI + graphiques | P1 | ✅ Done |
| Métriques Prometheus | P2 | ✅ Done |

### V1.1 (Q2 2026)

| Feature | Description |
|---------|-------------|
| Mode hors-ligne | Cache local des parcours générés |
| Intégration Garmin / Strava | Import workouts automatique |
| Défis communautaires | Challenges entre utilisateurs |
| Partage de parcours | Explorer public des routes |
| Plan d'entraînement IA | Programme sur 4-12 semaines |

### V2.0 (Q4 2026)

| Feature | Description |
|---------|-------------|
| App mobile React Native | iOS + Android |
| Wearables | Apple Watch, Fitbit, Polar |
| Live tracking | Suivi GPS en temps réel |
| Coach vocal | TTS + reconnaissance vocale |
| Multi-langue | EN, ES, DE, PT |

---

## 7. Hypothèses et Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Coût OpenAI élevé | HAUTE | HAUTE | Rate limiting par plan, cache réponses IA |
| Concurrence Strava/Nike Run | HAUTE | MOYENNE | Différenciation par IA + nutrition + voyage |
| Qualité parcours générés | MOYENNE | HAUTE | Validation + fallback mock data |
| Stripe webhook failure | FAIBLE | HAUTE | Retry + alerting Prometheus |
| RGPD données GPS/santé | MOYENNE | CRITIQUE | Consentement explicite, data residency EU |
| Twilio SMS cost dépassé | FAIBLE | FAIBLE | Rate limit 1 SMS/user/jour |
