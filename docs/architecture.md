# SmartProject AI — Architecture Complète

## 1. Diagramme Microservices

```mermaid
graph TB
    subgraph "Client"
        FE["Next.js Frontend\n:3000"]
    end

    subgraph "Backend API — Node.js/Express :4000"
        AUTH["Auth Service\nOAuth2 + JWT"]
        PROJ["Projects Service\nCRUD + Prisma"]
        TASK["Tasks Service\nCRUD + Kanban"]
        AI["AI Service\nOpenAI + SSE"]
        BILL["Billing Service\nStripe"]
        NOTIF["Notification Service\nSendGrid + Twilio"]
        METRICS["Metrics Service\nPrometheus"]
    end

    subgraph "Data Layer"
        PG[("PostgreSQL\n:5432")]
        REDIS[("Redis\n:6379")]
    end

    subgraph "External Services"
        GOOGLE["Google OAuth2"]
        GITHUB["GitHub OAuth2"]
        OPENAI["OpenAI GPT-4o"]
        STRIPE["Stripe Billing"]
        SENDGRID["SendGrid Email"]
        TWILIO["Twilio SMS"]
    end

    subgraph "Observability"
        PROM["Prometheus\n:9090"]
        GRAFANA["Grafana\n:3001"]
    end

    FE <-->|"HTTPS REST + SSE"| AUTH
    FE <-->|"HTTPS REST"| PROJ
    FE <-->|"HTTPS REST"| TASK
    FE <-->|"SSE Streaming"| AI
    FE <-->|"HTTPS REST"| BILL
    FE <-->|"HTTPS REST"| METRICS

    AUTH --> GOOGLE
    AUTH --> GITHUB
    AUTH --> PG
    AUTH --> REDIS

    PROJ --> PG
    TASK --> PG
    AI --> OPENAI
    AI --> PG
    BILL --> STRIPE
    BILL --> PG
    NOTIF --> SENDGRID
    NOTIF --> TWILIO
    METRICS --> PROM

    PROM --> GRAFANA
```

---

## 2. Diagramme Séquence — Login OAuth2

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as Frontend Next.js
    participant BE as Backend Express
    participant OAUTH as Google/GitHub
    participant DB as PostgreSQL

    U->>FE: Clic "Connexion avec Google"
    FE->>BE: GET /auth/google
    BE->>OAUTH: Redirect (OAuth2 Authorization URL)
    OAUTH-->>U: Page de connexion Google
    U->>OAUTH: Accepte les permissions
    OAUTH->>BE: GET /auth/google/callback?code=xxx
    BE->>OAUTH: POST /token (échange code → access_token)
    OAUTH-->>BE: access_token + profile

    BE->>DB: Upsert user (email, name, avatarUrl, oauthProvider)
    DB-->>BE: User record

    BE->>DB: INSERT refresh_token (userId, token UUID, expiresAt+7j)
    DB-->>BE: RefreshToken saved

    BE->>BE: Signe JWT accessToken (exp: 15m)
    BE-->>FE: Redirect /auth/callback?access_token=...&refresh_token=...

    FE->>FE: Stocke tokens (Zustand + localStorage)
    FE->>BE: GET /auth/me (Authorization: Bearer <accessToken>)
    BE->>DB: SELECT user WHERE id = sub
    DB-->>BE: User + subscription
    BE-->>FE: User profile JSON
    FE-->>U: Redirect /dashboard
```

---

## 3. Diagramme Séquence — Paiement Stripe

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as Frontend Next.js
    participant BE as Backend Express
    participant STRIPE as Stripe
    participant DB as PostgreSQL

    U->>FE: Clic "Passer à Pro"
    FE->>BE: POST /billing/checkout { priceId: "price_pro_monthly" }
    BE->>DB: SELECT subscription WHERE userId (cherche stripeCustomerId)
    DB-->>BE: subscription (stripeCustomerId: null)

    BE->>STRIPE: POST /customers { email, name, metadata: {userId} }
    STRIPE-->>BE: { id: "cus_xxx" }
    BE->>DB: UPDATE subscription SET stripeCustomerId = "cus_xxx"

    BE->>STRIPE: POST /checkout/sessions { customer, mode: subscription, price }
    STRIPE-->>BE: { url: "https://checkout.stripe.com/pay/cs_xxx" }
    BE-->>FE: { url }
    FE-->>U: Redirect vers Stripe Checkout

    U->>STRIPE: Saisit CB + confirme paiement
    STRIPE-->>U: Redirect /billing?success=true

    Note over STRIPE,BE: Webhook asynchrone
    STRIPE->>BE: POST /billing/webhook (checkout.session.completed)
    BE->>BE: Vérifie signature HMAC (stripe.webhooks.constructEvent)
    BE->>STRIPE: GET /subscriptions/sub_xxx
    STRIPE-->>BE: Subscription details

    BE->>DB: UPSERT subscription { plan: PRO, status: ACTIVE, stripeSubscriptionId }
    DB-->>BE: Updated
    BE-->>STRIPE: { received: true }

    FE->>BE: GET /billing/subscription
    BE->>DB: SELECT subscription WHERE userId
    DB-->>BE: { plan: PRO, status: ACTIVE }
    BE-->>FE: Subscription data
    FE-->>U: "Plan Pro actif ✅"
```

---

## 4. Diagramme Séquence — Requête IA (Chat Streaming)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as Frontend React
    participant BE as Backend Express
    participant DB as PostgreSQL
    participant OAI as OpenAI GPT-4o

    U->>FE: Saisit message + Entrée
    FE->>BE: POST /ai/chat { message, chatId?, projectId? }
    Note over BE: Vérifie JWT + plan (rate limit: 10/min)

    BE->>DB: Upsert AIChat (créé si chatId null)
    DB-->>BE: { chatId }

    BE->>DB: SELECT AIMessage WHERE chatId (historique 20 msgs)
    DB-->>BE: messages[]

    BE->>DB: INSERT AIMessage { role: "user", content }
    DB-->>BE: saved

    BE->>OAI: chat.completions.create({ messages, stream: true })

    Note over FE,BE: SSE Connection ouverte
    BE-->>FE: data: {"type":"chat_id","chatId":"..."}

    loop Streaming tokens
        OAI-->>BE: chunk (delta.content)
        BE-->>FE: data: {"type":"delta","content":"..."}
        FE->>FE: Append to message display
    end

    OAI-->>BE: [DONE]
    BE->>DB: INSERT AIMessage { role: "assistant", content: fullResponse }
    DB-->>BE: saved
    BE-->>FE: data: {"type":"done"}
    FE->>FE: Finalise affichage
    FE-->>U: Réponse complète affichée
```

---

## 5. Diagramme ERD (Base de Données)

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string name
        string avatarUrl
        enum role
        enum oauthProvider
        string oauthProviderId
        string passwordHash
        string phone
        string timezone
        boolean isActive
        boolean emailVerified
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }

    REFRESH_TOKEN {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
        datetime revokedAt
        string ipAddress
        string userAgent
        datetime createdAt
    }

    PROJECT {
        string id PK
        string name
        string description
        enum status
        datetime startDate
        datetime endDate
        string color
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    PROJECT_MEMBER {
        string id PK
        string projectId FK
        string userId FK
        string role
        datetime joinedAt
    }

    TASK {
        string id PK
        string title
        string description
        enum status
        enum priority
        datetime dueDate
        datetime startDate
        float estimatedHours
        float loggedHours
        string[] tags
        string projectId FK
        string assigneeId FK
        string creatorId FK
        string parentTaskId FK
        datetime createdAt
        datetime updatedAt
    }

    ACTIVITY_LOG {
        string id PK
        string action
        json metadata
        string userId FK
        string projectId FK
        string taskId FK
        string ipAddress
        datetime createdAt
    }

    SUBSCRIPTION {
        string id PK
        string userId FK UK
        enum plan
        enum status
        string stripeCustomerId UK
        string stripeSubscriptionId UK
        string stripePriceId
        datetime currentPeriodStart
        datetime currentPeriodEnd
        boolean cancelAtPeriodEnd
        datetime trialEnd
    }

    NOTIFICATION {
        string id PK
        string userId FK
        string type
        string title
        string body
        boolean isRead
        json metadata
        datetime createdAt
    }

    AI_CHAT {
        string id PK
        string userId FK
        string projectId FK
        string title
        datetime createdAt
        datetime updatedAt
    }

    AI_MESSAGE {
        string id PK
        string chatId FK
        string role
        string content
        json metadata
        datetime createdAt
    }

    USER ||--o{ REFRESH_TOKEN : "has"
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ PROJECT_MEMBER : "member_of"
    USER ||--|| SUBSCRIPTION : "has"
    USER ||--o{ TASK : "assigns"
    USER ||--o{ TASK : "creates"
    USER ||--o{ ACTIVITY_LOG : "generates"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AI_CHAT : "has"

    PROJECT ||--o{ PROJECT_MEMBER : "has"
    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ ACTIVITY_LOG : "has"
    PROJECT ||--o{ AI_CHAT : "context_for"

    TASK ||--o{ TASK : "subtask_of"
    TASK ||--o{ ACTIVITY_LOG : "has"

    AI_CHAT ||--o{ AI_MESSAGE : "contains"
```

---

## 6. Arborescence Complète du Projet

```
smartproject-ai/
├── apps/
│   ├── frontend/                     # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── providers.tsx         # SWR + providers
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── auth/callback/page.tsx# OAuth callback handler
│   │   │   ├── login/page.tsx        # Login avec OAuth
│   │   │   ├── dashboard/page.tsx    # KPI dashboard
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Liste projets
│   │   │   │   └── [id]/page.tsx     # Détail projet + kanban
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx          # Liste tâches
│   │   │   │   └── [id]/page.tsx     # Détail tâche
│   │   │   ├── ai/page.tsx           # Chat IA
│   │   │   ├── billing/page.tsx      # Plans + Stripe
│   │   │   ├── admin/page.tsx        # Admin users
│   │   │   ├── metrics/page.tsx      # Grafana embed
│   │   │   └── profile/page.tsx      # Profile utilisateur
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── ui/
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── charts/
│   │   │   │   └── ActivityChart.tsx  # Recharts
│   │   │   ├── ai/
│   │   │   │   └── ChatUI.tsx         # SSE streaming chat
│   │   │   ├── auth/
│   │   │   │   └── LoginButtons.tsx
│   │   │   └── dashboard/
│   │   │       └── RecentActivity.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts            # Auth hook
│   │   ├── store/
│   │   │   └── auth.store.ts         # Zustand store
│   │   ├── lib/
│   │   │   └── api.ts                # Axios + interceptors
│   │   ├── cypress/
│   │   │   ├── e2e/
│   │   │   │   ├── login.cy.ts
│   │   │   │   ├── projects.cy.ts
│   │   │   │   ├── ai-chat.cy.ts
│   │   │   │   └── billing.cy.ts
│   │   │   └── support/e2e.ts
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── cypress.config.ts
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── backend/                      # Node.js Express API
│       └── src/
│           ├── index.ts              # App entry point
│           ├── config/
│           │   └── passport.ts       # OAuth strategies
│           ├── routes/
│           │   ├── auth.routes.ts
│           │   ├── projects.routes.ts
│           │   ├── tasks.routes.ts
│           │   ├── ai.routes.ts
│           │   ├── billing.routes.ts
│           │   ├── notifications.routes.ts
│           │   ├── metrics.routes.ts
│           │   └── admin.routes.ts
│           ├── controllers/
│           │   ├── auth.controller.ts
│           │   ├── projects.controller.ts
│           │   ├── tasks.controller.ts
│           │   ├── ai.controller.ts
│           │   └── billing.controller.ts
│           ├── services/
│           │   ├── auth.service.ts
│           │   ├── projects.service.ts
│           │   ├── tasks.service.ts
│           │   ├── ai.service.ts
│           │   ├── billing.service.ts
│           │   └── notification.service.ts
│           ├── middlewares/
│           │   ├── auth.middleware.ts
│           │   ├── error.middleware.ts
│           │   ├── metrics.middleware.ts
│           │   └── rate-limit.middleware.ts
│           ├── clients/
│           │   ├── openai.client.ts
│           │   ├── stripe.client.ts
│           │   ├── sendgrid.client.ts
│           │   ├── twilio.client.ts
│           │   └── prometheus.client.ts
│           ├── lib/
│           │   ├── prisma.ts
│           │   └── logger.ts
│           └── __tests__/
│               ├── auth.service.test.ts
│               ├── projects.service.test.ts
│               ├── ai.service.test.ts
│               ├── billing.service.test.ts
│               └── notification.service.test.ts
│
├── packages/
│   ├── types/
│   │   ├── index.ts                  # Shared TypeScript types
│   │   └── package.json
│   └── shared/
│       ├── utils.ts                  # Shared utilities
│       └── package.json
│
├── prisma/
│   ├── schema.prisma                 # Database schema (6 models)
│   └── seed.ts                       # Database seed
│
├── infra/
│   ├── prometheus/prometheus.yml
│   └── grafana/
│       └── provisioning/datasources/datasource.yml
│
├── docs/
│   ├── architecture.md               # Ce fichier
│   ├── BC01-cadrage.md
│   ├── BC02-tests-docs.md
│   ├── BC03-pilotage.md
│   └── BC04-maintenance.md
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── .env.example
```
