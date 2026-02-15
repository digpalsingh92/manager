import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.config';
import { prisma } from './config/database.config';
import { logger } from './utils/logger';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// ─── Initialize Express ──────────────────────
const app = express();

// ─── Security Middleware ─────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ───────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'TOO_MANY_REQUESTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// ─── Body Parsing ────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Request Logging ─────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ─── Health Check ────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── Error Handling ──────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📁 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API Base: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ───────────────────────
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;
