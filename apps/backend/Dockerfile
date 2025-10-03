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
COPY --from=deps /app ./
WORKDIR /app/apps/backend
RUN pnpm build

# -------------------------
# 4) Production image
# -------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# 빌드 결과 복사
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=deps /app/apps/backend/package.json ./package.json

# 실행에 필요한 의존성만 설치
RUN pnpm install --prod --filter backend...

# Cloud Run은 반드시 PORT env 사용
EXPOSE 8080

CMD ["node", "dist/main.js"]