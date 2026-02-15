# ─── Build Stage ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source
COPY tsconfig.json ./
COPY src ./src/

# Build
RUN npm run build

# ─── Production Stage ────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built code
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown -R nodeapp:nodejs logs

# Switch to non-root user
USER nodeapp

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
