FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm ci --workspace=@smartproject/frontend

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/frontend ./apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@smartproject/frontend

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
