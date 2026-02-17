FROM node:20-slim AS production

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs && \
  useradd -u 1001 -g nodejs -m nodeapp

# Copy production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy built code
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown -R nodeapp:nodejs logs

USER nodeapp

EXPOSE 5000

CMD sh -c "npx prisma migrate deploy && node dist/server.js"