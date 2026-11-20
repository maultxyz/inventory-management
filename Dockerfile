FROM node:24-alpine AS builder
RUN npm install -g pnpm@9.1.3

WORKDIR /app

# Copy manifests for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile

# Copy source
COPY turbo.json tsconfig.json ./
COPY packages/ packages/

# The web build holds no deployment config: the server writes /env.js from
# its own environment at request time.
RUN pnpm build

FROM node:24-alpine

WORKDIR /app

# The server bundle has every dependency inlined, so no node_modules here.
COPY --from=builder /app/packages/server/dist/ ./
COPY --from=builder /app/packages/web/dist/ ./web/
COPY drizzle/ ./drizzle/

ENV NODE_ENV=production \
    PORT=3001 \
    WEB_DIST_DIR=web \
    MIGRATIONS_DIR=drizzle

USER node

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/public/health" || exit 1

# Applies pending migrations, then starts the API and web app on one port.
CMD ["sh", "-c", "node migrate.js && exec node index.js"]
