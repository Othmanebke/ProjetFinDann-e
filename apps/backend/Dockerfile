FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY prisma ./prisma
RUN npm ci --workspace=@smartproject/backend

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend ./apps/backend
COPY prisma ./prisma
COPY tsconfig*.json ./
RUN npm run build --workspace=@smartproject/backend
RUN npx prisma generate

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/index.js"]
