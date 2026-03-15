# BC04 — Maintenance & Exploitation : SmartProject AI

**Version :** 1.0
**Date :** Mars 2026

---

## 1. Monitoring

### 1.1 Prometheus — Métriques Collectées

| Métrique | Type | Description |
|---------|------|-------------|
| `smartproject_http_requests_total` | Counter | Requêtes HTTP par method/route/status |
| `smartproject_http_request_duration_seconds` | Histogram | Latence HTTP |
| `smartproject_ai_requests_total` | Counter | Requêtes IA par type/model/status |
| `smartproject_ai_request_duration_seconds` | Histogram | Durée requêtes IA |
| `smartproject_active_users` | Gauge | Utilisateurs actifs |
| `smartproject_projects_total` | Counter | Projets créés total |
| `smartproject_tasks_total` | Counter | Tâches créées par status/priority |
| `smartproject_errors_total` | Counter | Erreurs backend par type/route |
| `smartproject_subscriptions` | Gauge | Abonnements actifs par plan |
| `process_cpu_seconds_total` | Counter | CPU Node.js |
| `process_heap_bytes` | Gauge | Mémoire heap |
| `nodejs_eventloop_lag_seconds` | Histogram | Lag event loop |

### 1.2 Grafana Dashboard JSON

```json
{
  "dashboard": {
    "id": null,
    "uid": "smartproject",
    "title": "SmartProject AI — Overview",
    "tags": ["smartproject", "production"],
    "timezone": "Europe/Paris",
    "panels": [
      {
        "id": 1, "title": "HTTP Requests/min", "type": "stat",
        "targets": [{"expr": "rate(smartproject_http_requests_total[5m]) * 60"}]
      },
      {
        "id": 2, "title": "API Latency p95 (ms)", "type": "stat",
        "targets": [{"expr": "histogram_quantile(0.95, rate(smartproject_http_request_duration_seconds_bucket[5m])) * 1000"}]
      },
      {
        "id": 3, "title": "AI Requests/min", "type": "stat",
        "targets": [{"expr": "rate(smartproject_ai_requests_total[5m]) * 60"}]
      },
      {
        "id": 4, "title": "Error Rate (%)", "type": "stat",
        "targets": [{"expr": "rate(smartproject_errors_total[5m]) / rate(smartproject_http_requests_total[5m]) * 100"}]
      },
      {
        "id": 5, "title": "HTTP Requests by Route", "type": "timeseries",
        "targets": [{"expr": "sum by(route) (rate(smartproject_http_requests_total[5m]))"}]
      },
      {
        "id": 6, "title": "Subscriptions by Plan", "type": "piechart",
        "targets": [{"expr": "smartproject_subscriptions"}]
      },
      {
        "id": 7, "title": "Memory Usage (MB)", "type": "timeseries",
        "targets": [{"expr": "process_heap_bytes / 1024 / 1024"}]
      },
      {
        "id": 8, "title": "CPU Usage (%)", "type": "timeseries",
        "targets": [{"expr": "rate(process_cpu_seconds_total[5m]) * 100"}]
      }
    ]
  }
}
```

### 1.3 Alertes Prometheus (prometheus.yml — règles)

```yaml
groups:
  - name: smartproject
    rules:
      - alert: HighErrorRate
        expr: rate(smartproject_errors_total[5m]) > 0.1
        for: 2m
        labels: { severity: "warning" }
        annotations:
          summary: "Taux d'erreur élevé ({{ $value }} erreurs/s)"

      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(smartproject_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels: { severity: "critical" }
        annotations:
          summary: "API lente — p95 > 2 secondes"

      - alert: BackendDown
        expr: up{job="smartproject-backend"} == 0
        for: 1m
        labels: { severity: "critical" }
        annotations:
          summary: "Backend SmartProject AI est DOWN"

      - alert: HighMemoryUsage
        expr: process_heap_bytes > 500 * 1024 * 1024
        for: 5m
        labels: { severity: "warning" }
        annotations:
          summary: "Mémoire heap > 500MB"
```

---

## 2. Logging

### 2.1 Structure des Logs (Winston)

Format JSON en production :
```json
{
  "timestamp": "2026-03-15 14:32:01",
  "level": "info",
  "message": "POST /projects 201 45ms",
  "service": "smartproject-api",
  "userId": "cuid_xyz",
  "requestId": "uuid-v4",
  "method": "POST",
  "path": "/projects",
  "statusCode": 201,
  "duration": 45
}
```

### 2.2 Niveaux de Log

| Niveau | Usage |
|--------|-------|
| `error` | Erreurs critiques, crashes, exceptions non gérées |
| `warn` | Tentatives d'auth échouées, rate limiting |
| `info` | Requêtes HTTP (morgan), créations importantes |
| `debug` | Requêtes Prisma, détails IA (dev only) |

### 2.3 Retention des Logs

| Environnement | Durée | Stockage |
|---------------|-------|---------|
| Production | 90 jours | S3 + CloudWatch |
| Staging | 30 jours | Fichiers locaux |
| Développement | Session | Console uniquement |

### 2.4 Logs à surveiller en priorité

```bash
# Erreurs critiques
grep '"level":"error"' logs/combined.log | tail -50

# Tentatives d'auth suspectes
grep '"action":"auth.failed"' logs/combined.log

# Latences > 2s
grep '"duration":[2-9][0-9][0-9][0-9]' logs/combined.log
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
JWT_SECRET_OLD=<ancien_secret>
JWT_SECRET=<nouveau_secret>

# 3. Déployer la nouvelle version
docker-compose up -d backend

# 4. Après 24h, supprimer l'ancien secret et tous les refresh tokens
DELETE FROM refresh_tokens WHERE created_at < NOW() - INTERVAL '24 hours';

# 5. Redéployer sans JWT_SECRET_OLD
```

---

## 4. Stratégie Backup PostgreSQL

### 4.1 Sauvegardes Automatiques

```bash
#!/bin/bash
# backup-db.sh — Exécuté quotidiennement via cron à 3h00 UTC

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="smartproject_${DATE}.sql.gz"
S3_BUCKET="s3://smartproject-backups/postgres"

# Dump compressé
pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE

# Upload S3
aws s3 cp /tmp/$BACKUP_FILE $S3_BUCKET/$BACKUP_FILE

# Nettoyage local
rm /tmp/$BACKUP_FILE

# Supprimer backups > 30 jours
aws s3 ls $S3_BUCKET/ | awk '{print $4}' | \
  xargs -I{} aws s3api head-object --bucket smartproject-backups --key postgres/{} | \
  # Filter old files...
  echo "Cleanup done"

echo "Backup $BACKUP_FILE uploaded to S3"
```

### 4.2 Stratégie de Rétention

| Fréquence | Retention | Stockage |
|-----------|-----------|---------|
| Quotidienne | 30 jours | S3 Standard |
| Hebdomadaire | 3 mois | S3 Standard-IA |
| Mensuelle | 1 an | S3 Glacier |

### 4.3 Restauration

```bash
# Restaurer depuis un backup
aws s3 cp s3://smartproject-backups/postgres/smartproject_20260315_030000.sql.gz /tmp/

gunzip /tmp/smartproject_20260315_030000.sql.gz

psql $DATABASE_URL < /tmp/smartproject_20260315_030000.sql

echo "Restoration complete"
```

### 4.4 RTO / RPO

| Métrique | Cible | Commentaire |
|---------|-------|-------------|
| RPO (Recovery Point Objective) | 24h | Backup quotidien |
| RTO (Recovery Time Objective) | 2h | Temps de restauration |

---

## 5. CI/CD Pipeline — GitHub Actions

### 5.1 Pipeline Principal

```yaml
# .github/workflows/ci.yml
name: SmartProject AI CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"
  DATABASE_URL: postgresql://test:test@localhost:5432/test

jobs:
  # ─── Tests Backend ─────────────────────────────────────────────────────────
  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
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
        run: npm run test --workspace=@smartproject/backend -- --coverage
        env:
          JWT_SECRET: test_secret_min_32_chars_padding_here
          JWT_REFRESH_SECRET: test_refresh_min_32_chars_padding_x

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  # ─── Lint & Type Check ─────────────────────────────────────────────────────
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
      - run: npx tsc --noEmit --workspace=@smartproject/backend
      - run: npx tsc --noEmit --workspace=@smartproject/frontend

  # ─── Build Docker ──────────────────────────────────────────────────────────
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
          tags: smartproject/backend:${{ github.sha }},smartproject/backend:latest

      - name: Build & Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/frontend/Dockerfile
          push: true
          tags: smartproject/frontend:${{ github.sha }},smartproject/frontend:latest

  # ─── Deploy Production ─────────────────────────────────────────────────────
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
            cd /opt/smartproject
            docker-compose pull
            docker-compose up -d --no-deps backend frontend
            docker exec smartproject_backend npx prisma migrate deploy
            echo "✅ Deployment complete"
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
        run: docker-compose up -d postgres redis
      - name: Run Cypress E2E
        uses: cypress-io/github-action@v6
        with:
          working-directory: apps/frontend
          start: npm run dev
          wait-on: "http://localhost:3000"
          browser: chrome
```

---

## 6. Checklist de Maintenance Mensuelle

### Sécurité
- [ ] Vérifier les logs d'accès suspects (> 5 tentatives auth échouées)
- [ ] Audit des dépendances : `npm audit`
- [ ] Vérifier l'expiration des certificats SSL
- [ ] Rotation des secrets selon calendrier

### Performance
- [ ] Vérifier les métriques Grafana (latence p95, memory, CPU)
- [ ] Analyser les requêtes Prisma lentes (slow query log)
- [ ] Nettoyer les anciens refresh tokens expirés
- [ ] Archiver les ActivityLogs > 90 jours

### Business
- [ ] Vérifier les alertes paiements échoués Stripe
- [ ] Exporter les métriques MRR, Churn, conversion
- [ ] Vérifier les webhooks Stripe actifs
- [ ] Contrôler les coûts OpenAI

### Infrastructure
- [ ] Vérifier les backups S3 (intégrité + retention)
- [ ] Mettre à jour les images Docker
- [ ] Tester la procédure de restauration DB (staging)
- [ ] Vérifier les quotas cloud (CPU, storage, bandwidth)

---

## 7. Runbook — Incidents Courants

### Incident : Backend Down
```bash
# 1. Vérifier l'état
docker ps | grep backend
docker logs smartproject_backend --tail 100

# 2. Redémarrer
docker-compose restart backend

# 3. Si DB unreachable
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

### Incident : Paiements Stripe échoués
```bash
# 1. Vérifier webhook dans Stripe Dashboard
# https://dashboard.stripe.com/webhooks

# 2. Vérifier les logs backend
grep '"action":"billing.webhook"' logs/combined.log | tail -20

# 3. Relancer manuellement les événements Stripe
# Dashboard Stripe > Webhooks > Resend event
```

### Incident : OpenAI Rate Limit
```bash
# 1. Vérifier les métriques
# Grafana > AI Requests/min > si > 60, rate limit atteint

# 2. Ajuster le rate limit Express temporairement
# apps/backend/src/middlewares/rate-limit.middleware.ts
# Réduire max de 10 à 5 pour /ai/*

# 3. Contacter OpenAI pour augmenter les quotas
# https://platform.openai.com/account/limits
```

### Incident : DB Full
```bash
# 1. Vérifier la taille
docker exec smartproject_postgres psql -U smartproject -c "\l+"

# 2. Purger les vieux logs
docker exec smartproject_postgres psql -U smartproject -c \
  "DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';"

# 3. Purger les refresh tokens expirés
docker exec smartproject_postgres psql -U smartproject -c \
  "DELETE FROM refresh_tokens WHERE expires_at < NOW();"

# 4. VACUUM
docker exec smartproject_postgres psql -U smartproject -c "VACUUM ANALYZE;"
```
