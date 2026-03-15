# BC01 — Cadrage Produit : SmartProject AI

**Version :** 1.0
**Date :** Mars 2026
**Statut :** Approuvé

---

## 1. Vision Produit

**SmartProject AI** est une plateforme SaaS B2B de gestion de projets enrichie par l'intelligence artificielle. Elle permet aux équipes de planifier, organiser et livrer leurs projets plus efficacement grâce à l'automatisation IA basée sur GPT-4o.

### Proposition de Valeur Unique
> "L'IA qui fait le travail de planification à votre place, pour que vous vous concentriez sur la livraison."

**Différentiateurs clés :**
- IA intégrée nativement (pas un add-on) — génération de plans, analyse de risques, création de tâches automatique
- Chat IA spécialisé en gestion de projet (pas généraliste)
- Notifications intelligentes SMS + Email sur les deadlines critiques
- Pricing transparent et accessible (Free → Pro → Enterprise)

---

## 2. Objectifs Business

| Objectif | Indicateur | Cible 12 mois |
|----------|-----------|----------------|
| Acquisition | Utilisateurs inscrits | 5 000 |
| Conversion | Free → Pro | 8% |
| Revenus | MRR | 50 000 € |
| Rétention | Churn mensuel | < 3% |
| Satisfaction | NPS | > 50 |
| Engagement | Requêtes IA/user/semaine | > 5 |

---

## 3. Personas

### Persona 1 — Sarah, Chef de Projet (utilisatrice principale)
- **Profil :** 32 ans, Chef de projet dans une startup SaaS, équipe de 6 personnes
- **Problèmes :** Trop de temps à planifier, deadlines manquées, reporting manuel
- **Besoins :** Vue globale des projets, alertes proactives, génération auto de plans
- **Willingness to Pay :** 29€/mois Plan Pro
- **Déclencheur d'achat :** "J'ai essayé la génération de plan IA en Free et ça a sauvé ma semaine"

### Persona 2 — Marc, Développeur Lead (utilisateur secondaire)
- **Profil :** 28 ans, Tech Lead, utilise Jira mais le trouve trop complexe
- **Problèmes :** Tâches mal définies, priorisation difficile, trop de réunions
- **Besoins :** Interface simple, intégration GitHub, génération de tâches depuis des descriptions
- **Willingness to Pay :** Plan inclus par l'employeur (Pro ou Enterprise)
- **Déclencheur :** "Mon chef de projet m'a invité sur SmartProject"

### Persona 3 — Isabelle, DSI / Admin (acheteur Enterprise)
- **Profil :** 45 ans, DSI d'une PME de 200 personnes
- **Problèmes :** Pas de visibilité sur les projets IT, outils fragmentés
- **Besoins :** SSO, audit logs, SLA, facturation centralisée
- **Willingness to Pay :** 99€/mois Plan Enterprise
- **Déclencheur :** "Notre équipe utilisait déjà le Plan Pro, on a upgradé pour le SSO"

---

## 4. User Stories (MVP)

### Authentification
- **US-01 :** En tant qu'utilisateur, je peux me connecter avec Google ou GitHub en 1 clic
- **US-02 :** En tant qu'utilisateur, mon session reste active grâce au refresh token automatique
- **US-03 :** En tant qu'admin, je peux voir et gérer tous les utilisateurs

### Gestion de Projets
- **US-04 :** En tant qu'utilisateur, je peux créer un projet avec nom, description, couleur et dates
- **US-05 :** En tant qu'utilisateur, je peux inviter des membres dans mon projet avec des rôles
- **US-06 :** En tant qu'utilisateur, je vois tous mes projets dans une vue grille avec leur statut
- **US-07 :** En tant qu'admin/owner, je peux archiver ou supprimer un projet

### Gestion de Tâches
- **US-08 :** En tant qu'utilisateur, je peux créer des tâches avec titre, priorité, deadline, assigné
- **US-09 :** En tant qu'utilisateur, je vois un tableau Kanban de mes tâches par statut
- **US-10 :** En tant qu'utilisateur, je peux créer des sous-tâches
- **US-11 :** En tant qu'utilisateur, je peux filtrer mes tâches par statut, priorité, assigné

### Intelligence Artificielle
- **US-12 :** En tant qu'utilisateur Pro, l'IA génère un plan de projet complet en JSON
- **US-13 :** En tant qu'utilisateur Pro, l'IA identifie les risques de mon projet
- **US-14 :** En tant qu'utilisateur Pro, l'IA génère 5-15 tâches depuis une description
- **US-15 :** En tant qu'utilisateur Free, je peux utiliser le chat IA (5/jour)
- **US-16 :** En tant qu'utilisateur Pro, le chat IA est illimité avec contexte de projet

### Notifications
- **US-17 :** Je reçois un email de bienvenue à l'inscription
- **US-18 :** Je reçois un SMS/email 24h avant la deadline d'une tâche assignée
- **US-19 :** Je reçois un email quand mon abonnement est renouvelé ou échoue

### Billing
- **US-20 :** Je peux passer au Plan Pro via Stripe Checkout en 3 clics
- **US-21 :** Je peux gérer mon abonnement (annuler, changer) depuis le Customer Portal
- **US-22 :** Mon plan est downgrade en Free si le paiement échoue

### Métriques & Admin
- **US-23 :** En tant qu'admin, je vois les métriques business (users, projets, tâches, MRR)
- **US-24 :** En tant que DevOps, je peux scraper `/metrics` avec Prometheus
- **US-25 :** En tant qu'admin, je peux activer/désactiver un utilisateur

---

## 5. Roadmap Produit

### MVP v1.0 (Semaines 1-8)
**Objectif :** Produit fonctionnel prêt à être lancé en beta

| Feature | Priorité | Statut |
|---------|----------|--------|
| Auth OAuth2 (Google + GitHub) | P0 | ✅ Done |
| CRUD Projets + Tâches | P0 | ✅ Done |
| Kanban Board | P0 | ✅ Done |
| Chat IA (basique) | P0 | ✅ Done |
| Stripe Billing (Free/Pro) | P0 | ✅ Done |
| Notifications email | P1 | ✅ Done |
| Dashboard KPI | P1 | ✅ Done |
| Métriques Prometheus | P1 | ✅ Done |

### V1.1 (Semaines 9-12)
**Objectif :** Enrichissement features IA et collaboration

| Feature | Priorité | Description |
|---------|----------|-------------|
| IA : Génération de plan | P0 | Plan JSON structuré |
| IA : Analyse risques | P0 | Risk scoring |
| IA : Auto-tasks | P1 | Tasks depuis description |
| Invitations membres par email | P1 | Onboarding équipe |
| Commentaires sur tâches | P1 | Collaboration |
| Rappels SMS Twilio | P2 | Deadline reminders |

### V2.0 (Q3 2026)
**Objectif :** Enterprise et intégrations

| Feature | Description |
|---------|-------------|
| SSO / SAML | Enterprise auth |
| GitHub/Jira sync | Import/export issues |
| Webhooks outbound | Intégrations custom |
| Time tracking | Suivi du temps par tâche |
| AI Standup auto | Rapport automatique quotidien |
| Mobile app (React Native) | iOS + Android |
| White-label | Entreprises |

---

## 6. MVP vs V2 — Tableau Comparatif

| Fonctionnalité | MVP | V2 |
|---------------|-----|-----|
| Auth OAuth | ✅ Google + GitHub | + SSO/SAML |
| Projets | ✅ CRUD basique | + Templates |
| Tâches | ✅ Kanban | + Time tracking + Gantt |
| IA Chat | ✅ GPT-4o | + Agents autonomes |
| IA Plan | ✅ JSON plan | + PERT/Critical path |
| Billing | ✅ Free/Pro | + Enterprise + Usage-based |
| Notifications | ✅ Email + SMS | + Slack + Teams |
| Métriques | ✅ Prometheus | + Custom dashboards |
| Équipes | ✅ 10 membres | + Illimité + Org tree |
| API | REST | + GraphQL + Webhooks |

---

## 7. Hypothèses et Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Concurrence Notion/ClickUp | HAUTE | MOYEN | Différenciation par IA native |
| Coût OpenAI élevé | MOYENNE | HAUTE | Rate limiting + cache responses |
| Churn élevé plan Free | HAUTE | FAIBLE | Convertir via IA features |
| Stripe webhook failure | FAIBLE | HAUTE | Retry + alerting |
| RGPD non-conformité | FAIBLE | HAUTE | Data residency EU + DPA |
