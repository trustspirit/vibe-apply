# -------------------------
# 1) Base image
# -------------------------
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# -------------------------
# 2) Install dependencies
# -------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --filter backend...

# -------------------------
# 3) Build Nest.js backend
# -------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# 👉 빌드에 필요한 소스/설정 복사
COPY tsconfig*.json ./
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

WORKDIR /app/apps/backend
RUN pnpm build

# -------------------------
# 4) Production image
# -------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# 빌드 결과와 실행에 필요한 의존성 복사
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Cloud Run은 반드시 PORT 사용
EXPOSE 8080
CMD ["node", "dist/main.js"]