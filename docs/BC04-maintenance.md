# BC04 — Maintenance & Exploitation : élan (Fit & Travel)

**Version :** 2.0
**Date :** Mars 2026

---

## 1. Monitoring

### 1.1 Prometheus — Métriques Collectées

| Métrique | Type | Description |
|---------|------|-------------|
| `elan_http_requests_total` | Counter | Requêtes HTTP par method/route/status |
| `elan_http_request_duration_seconds` | Histogram | Latence HTTP |
| `elan_ai_requests_total` | Counter | Requêtes IA par type (chat/route/analyze/restaurant) |
| `elan_ai_request_duration_seconds` | Histogram | Durée requêtes GPT-4o |
| `elan_active_users` | Gauge | Utilisateurs actifs (sessions en cours) |
| `elan_workouts_total` | Counter | Workouts créés |
| `elan_nutrition_logs_total` | Counter | Repas loggés |
| `elan_errors_total` | Counter | Erreurs backend par type/route |
| `elan_subscriptions` | Gauge | Abonnements actifs par plan (FREE/PREMIUM/VOYAGEUR) |
| `process_cpu_seconds_total` | Counter | CPU Node.js |
| `process_heap_bytes` | Gauge | Mémoire heap Node.js |
| `nodejs_eventloop_lag_seconds` | Histogram | Lag event loop |

### 1.2 Grafana Dashboard

```json
{
  "dashboard": {
    "uid": "elan-fitness",
    "title": "élan Fit & Travel — Overview",
    "tags": ["elan", "production"],
    "timezone": "Europe/Paris",
    "panels": [
      {
        "id": 1, "title": "HTTP Requests/min", "type": "stat",
        "targets": [{"expr": "rate(elan_http_requests_total[5m]) * 60"}]
      },
      {
        "id": 2, "title": "API Latency p95 (ms)", "type": "stat",
        "targets": [{"expr": "histogram_quantile(0.95, rate(elan_http_request_duration_seconds_bucket[5m])) * 1000"}]
      },
      {
        "id": 3, "title": "Requêtes IA/min", "type": "stat",
        "targets": [{"expr": "rate(elan_ai_requests_total[5m]) * 60"}]
      },
      {
        "id": 4, "title": "Taux d'erreur (%)", "type": "stat",
        "targets": [{"expr": "rate(elan_errors_total[5m]) / rate(elan_http_requests_total[5m]) * 100"}]
      },
      {
        "id": 5, "title": "Workouts créés (24h)", "type": "stat",
        "targets": [{"expr": "increase(elan_workouts_total[24h])"}]
      },
      {
        "id": 6, "title": "Abonnements par plan", "type": "piechart",
        "targets": [{"expr": "elan_subscriptions"}]
      },
      {
        "id": 7, "title": "Latence IA (p95 ms)", "type": "timeseries",
        "targets": [{"expr": "histogram_quantile(0.95, rate(elan_ai_request_duration_seconds_bucket[5m])) * 1000"}]
      },
      {
        "id": 8, "title": "Mémoire Heap (MB)", "type": "timeseries",
        "targets": [{"expr": "process_heap_bytes / 1024 / 1024"}]
      }
    ]
  }
}
```

### 1.3 Alertes Prometheus

```yaml
groups:
  - name: elan
    rules:
      - alert: HighErrorRate
        expr: rate(elan_errors_total[5m]) > 0.1
        for: 2m
        labels: { severity: "warning" }
        annotations:
          summary: "Taux d'erreur élevé ({{ $value }} erreurs/s)"

      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(elan_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels: { severity: "critical" }
        annotations:
          summary: "API lente — p95 > 2 secondes"

      - alert: SlowAIResponse
        expr: histogram_quantile(0.95, rate(elan_ai_request_duration_seconds_bucket[5m])) > 15
        for: 3m
        labels: { severity: "warning" }
        annotations:
          summary: "IA GPT-4o lente — p95 > 15 secondes"

      - alert: BackendDown
        expr: up{job="elan-backend"} == 0
        for: 1m
        labels: { severity: "critical" }
        annotations:
          summary: "Backend élan est DOWN"

      - alert: HighMemoryUsage
        expr: process_heap_bytes > 500 * 1024 * 1024
        for: 5m
        labels: { severity: "warning" }
        annotations:
          summary: "Mémoire heap Node.js > 500MB"

      - alert: StripeWebhookErrors
        expr: rate(elan_errors_total{route="/billing/webhook"}[5m]) > 0
        for: 1m
        labels: { severity: "critical" }
        annotations:
          summary: "Erreurs webhook Stripe détectées"
```

---

## 2. Logging

### 2.1 Structure des Logs (Winston)

Format JSON en production :
```json
{
  "timestamp": "2026-03-20 08:15:42",
  "level": "info",
  "message": "POST /workouts 201 38ms",
  "service": "elan-api",
  "userId": "clxyz123",
  "requestId": "uuid-v4",
  "method": "POST",
  "path": "/workouts",
  "statusCode": 201,
  "duration": 38
}
```

### 2.2 Niveaux de Log

| Niveau | Usage |
|--------|-------|
| `error` | Erreurs critiques, exceptions non gérées, échecs Stripe/OpenAI |
| `warn` | Tentatives d'auth échouées, rate limiting atteint, Twilio/SendGrid error |
| `info` | Requêtes HTTP (morgan), créations workout/nutrition, events Stripe |
| `debug` | Requêtes Prisma, tokens SSE IA, détails OAuth (dev only) |

### 2.3 Rétention des Logs

| Environnement | Durée | Stockage |
|---------------|-------|---------|
| Production | 90 jours | S3 + CloudWatch |
| Staging | 30 jours | Fichiers locaux |
| Développement | Session | Console uniquement |

### 2.4 Logs à surveiller en priorité

```bash
# Erreurs critiques
grep '"level":"error"' logs/combined.log | tail -50

# Échecs d'authentification
grep '"action":"auth.failed"' logs/combined.log

# Latences IA > 10s
grep '"path":"/ai/' logs/combined.log | grep '"duration":[1-9][0-9][0-9][0-9][0-9]'

# Erreurs Stripe webhook
grep '"path":"/billing/webhook"' logs/combined.log | grep '"level":"error"'
```

---

## 3. Rotation des Clés Secrets

### 3.1 Calendrier de Rotation

| Secret | Fréquence | Procédure |
|--------|-----------|----------|
| JWT_SECRET | 90 jours | Déployer nouveau secret → invalider anciens tokens |
| JWT_REFRESH_SECRET | 90 jours | Idem + forcer reconnexion des utilisateurs |
| OpenAI API Key | 180 jours | Créer nouvelle clé → déployer → désactiver ancienne |
| Stripe Secret Key | En cas de compromis | Créer nouvelle clé dans Stripe dashboard |
| SendGrid API Key | 180 jours | Créer dans SendGrid → déployer → désactiver |
| Twilio Auth Token | 180 jours | Régénérer dans console Twilio |
| DB Password | 90 jours | Changer dans DB + .env + redémarrer backend |

### 3.2 Procédure de Rotation JWT

```bash
# 1. Générer nouveau secret
NEW_SECRET=$(openssl rand -base64 64)

# 2. Mettre à jour .env (zero-downtime : accepter ancien + nouveau pendant 24h)
JWT_SECRET=<nouveau_secret>

# 3. Déployer la nouvelle version
docker-compose up -d backend

# 4. Après 24h, purger les refresh tokens existants
docker exec elan_postgres psql -U elan -c \
  "DELETE FROM refresh_tokens WHERE created_at < NOW() - INTERVAL '24 hours';"
```

---

## 4. Stratégie Backup PostgreSQL

### 4.1 Sauvegardes Automatiques

```bash
#!/bin/bash
# backup-db.sh — Exécuté quotidiennement via cron à 3h00 UTC

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="elan_${DATE}.sql.gz"
S3_BUCKET="s3://elan-backups/postgres"

# Dump compressé
pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE

# Upload S3
aws s3 cp /tmp/$BACKUP_FILE $S3_BUCKET/$BACKUP_FILE

# Nettoyage local
rm /tmp/$BACKUP_FILE

echo "Backup $BACKUP_FILE uploaded to S3"
```

### 4.2 Stratégie de Rétention

| Fréquence | Rétention | Stockage |
|-----------|-----------|---------|
| Quotidienne | 30 jours | S3 Standard |
| Hebdomadaire | 3 mois | S3 Standard-IA |
| Mensuelle | 1 an | S3 Glacier |

### 4.3 Restauration

```bash
# Restaurer depuis un backup
aws s3 cp s3://elan-backups/postgres/elan_20260320_030000.sql.gz /tmp/
gunzip /tmp/elan_20260320_030000.sql.gz
psql $DATABASE_URL < /tmp/elan_20260320_030000.sql
echo "Restoration complete"
```

### 4.4 RTO / RPO

| Métrique | Cible | Commentaire |
|---------|-------|-------------|
| RPO (Recovery Point Objective) | 24h | Backup quotidien |
| RTO (Recovery Time Objective) | 2h | Temps de restauration estimé |

---

## 5. CI/CD Pipeline — GitHub Actions

### 5.1 Pipeline Principal

```yaml
# .github/workflows/ci.yml
name: élan CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"
  DATABASE_URL: postgresql://test:test@localhost:5432/elan_test

jobs:
  test-backend:
    name: Backend Tests (Jest)
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: elan_test
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}

      - name: Run Jest tests
        run: npm run test --workspace=@elan/backend -- --coverage
        env:
          JWT_SECRET: test_secret_min_32_chars_padding_here
          JWT_REFRESH_SECRET: test_refresh_min_32_chars_padding_x
          OPENAI_API_KEY: sk-test-mock

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit --workspace=@elan/backend
      - run: npx tsc --noEmit --workspace=@elan/frontend

  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [test-backend, lint]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Build & Push Backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/backend/Dockerfile
          push: true
          tags: elan/backend:${{ github.sha }},elan/backend:latest

      - name: Build & Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/frontend/Dockerfile
          push: true
          tags: elan/frontend:${{ github.sha }},elan/frontend:latest

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/elan
            docker-compose pull
            docker-compose up -d --no-deps backend frontend
            docker exec elan_backend npx prisma migrate deploy
            echo "Deployment complete"
```

### 5.2 Pipeline E2E (Nightly)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests (Nightly)

on:
  schedule:
    - cron: "0 2 * * *"  # 2h UTC chaque nuit
  workflow_dispatch:

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: npm }
      - run: npm ci
      - name: Start services
        run: docker-compose up -d postgres
      - name: Run Cypress E2E
        uses: cypress-io/github-action@v6
        with:
          working-directory: apps/frontend
          start: npm run dev
          wait-on: "http://localhost:3000"
          browser: chrome
        env:
          NEXT_PUBLIC_API_URL: http://localhost:4000
```

---

## 6. Checklist de Maintenance Mensuelle

### Sécurité
- [ ] Vérifier les logs d'accès suspects (> 5 tentatives auth échouées depuis même IP)
- [ ] Audit des dépendances : `npm audit`
- [ ] Vérifier l'expiration des certificats SSL
- [ ] Rotation des secrets selon calendrier
- [ ] Purger les refresh tokens expirés : `DELETE FROM refresh_tokens WHERE expires_at < NOW()`

### Performance
- [ ] Vérifier les métriques Grafana (latence p95, latence IA p95, mémoire)
- [ ] Analyser les requêtes Prisma lentes (slow query log)
- [ ] Vérifier le cache des réponses IA (éviter doublons coûteux)
- [ ] Archiver les workouts/nutrition logs > 1 an si besoin

### Business
- [ ] Vérifier les alertes paiements échoués Stripe (Dashboard > Webhooks)
- [ ] Exporter les métriques MRR, Churn, conversion Free→Premium
- [ ] Contrôler les coûts OpenAI (Dashboard > Usage)
- [ ] Contrôler les coûts Twilio (Dashboard > Usage)
- [ ] Vérifier les webhooks Stripe actifs et fonctionnels

### Infrastructure
- [ ] Vérifier les backups S3 (intégrité + rétention)
- [ ] Mettre à jour les images Docker (security patches)
- [ ] Tester la procédure de restauration DB (staging)
- [ ] Vérifier les quotas cloud (CPU, storage, bandwidth)

---

## 7. Runbook — Incidents Courants

### Incident : Backend Down
```bash
# 1. Vérifier l'état
docker ps | grep backend
docker logs elan_backend --tail 100

# 2. Redémarrer
docker-compose restart backend

# 3. Si DB unreachable
docker-compose restart postgres
sleep 10
docker-compose restart backend

# 4. Vérifier métriques
curl http://localhost:4000/health
```

### Incident : Paiements Stripe échoués
```bash
# 1. Vérifier webhook dans Stripe Dashboard
# https://dashboard.stripe.com/webhooks

# 2. Vérifier les logs backend
grep '"path":"/billing/webhook"' logs/combined.log | tail -20

# 3. Relancer manuellement les événements Stripe
# Dashboard Stripe > Webhooks > Resend event
```

### Incident : OpenAI Rate Limit / Lenteur IA
```bash
# 1. Vérifier les métriques Grafana
# Panel "Latence IA p95" — si > 15s, problème OpenAI

# 2. Vérifier le statut OpenAI
# https://status.openai.com

# 3. Temporairement réduire le rate limit IA
# apps/backend/src/middlewares/rate-limit.middleware.ts
# Réduire max de 10 à 5 pour /ai/*

# 4. Si OpenAI down : les endpoints de génération retournent
# le fallback mock intégré dans ai.service.ts
```

### Incident : DB Full
```bash
# 1. Vérifier la taille
docker exec elan_postgres psql -U elan -c "\l+"

# 2. Purger les refresh tokens expirés
docker exec elan_postgres psql -U elan -c \
  "DELETE FROM refresh_tokens WHERE expires_at < NOW();"

# 3. VACUUM
docker exec elan_postgres psql -U elan -c "VACUUM ANALYZE;"

# 4. Vérifier les gros volumes
docker exec elan_postgres psql -U elan -c \
  "SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) FROM pg_class ORDER BY pg_total_relation_size(oid) DESC LIMIT 10;"
```

### Incident : SMS Twilio non reçus
```bash
# 1. Vérifier le solde Twilio
# https://console.twilio.com

# 2. Vérifier les logs
grep '"action":"sms"' logs/combined.log | tail -20

# 3. Tester manuellement via API
curl -X POST http://localhost:4000/api/notifications/sms-reminder \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "time": "18h30"}'
```

---

## 8. Architecture de Déploiement

```
                    ┌─────────────────────────────────┐
                    │         Cloudflare CDN           │
                    │     (DNS + DDoS protection)      │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │         Load Balancer            │
                    └─────────┬──────────┬────────────┘
                              │          │
              ┌───────────────▼─┐    ┌───▼───────────────┐
              │  Next.js :3000  │    │  Express API :4000 │
              │   (Frontend)    │    │    (Backend)       │
              └─────────────────┘    └───────┬────────────┘
                                             │
              ┌──────────────────────────────▼────────────┐
              │              PostgreSQL :5432              │
              │          (Managed DB — 10GB)               │
              └───────────────────────────────────────────┘

              ┌──────────────┐  ┌──────────────┐
              │  Prometheus  │  │    Grafana   │
              │    :9090     │  │    :3001     │
              └──────────────┘  └──────────────┘
```
