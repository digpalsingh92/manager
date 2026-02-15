import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { env } from '../config/env.config';

/**
 * Global centralized error handler.
 * Catches all errors and returns a consistent JSON response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ─── Zod Validation Errors ───────────────────
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
    return;
  }

  // ─── Application Errors ─────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(env.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // ─── Prisma Errors ──────────────────────────
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: `A record with this ${prismaError.meta?.target?.join(', ') || 'value'} already exists.`,
          code: 'DUPLICATE_ENTRY',
        });
        return;

      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'The requested record was not found.',
          code: 'NOT_FOUND',
        });
        return;

      case 'P2003':
        res.status(400).json({
          success: false,
          message: 'Invalid reference. The related record does not exist.',
          code: 'INVALID_REFERENCE',
        });
        return;

      default:
        logger.error(`Prisma error ${prismaError.code}: ${prismaError.message}`);
    }
  }

  // ─── JWT Errors ─────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token has expired.',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // ─── Unknown Errors ─────────────────────────
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: env.isProduction
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(env.isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 handler for unmatched routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};
