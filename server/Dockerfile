# ─── Build Stage ──────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

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
FROM node:20-slim AS production

WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs && \
  useradd -u 1001 -g nodejs -m nodeapp

# Copy production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

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

CMD ["node", "dist/server.js"]