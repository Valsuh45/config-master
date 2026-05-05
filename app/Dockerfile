# ── Stage 1: build dependencies ───────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what we need
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# Switch to non-root user
USER appuser

# Default env values (overridden by ConfigMap at runtime)
ENV NODE_ENV=production \
    PORT=3000 \
    APP_COLOR=grey \
    APP_ENV=local

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
