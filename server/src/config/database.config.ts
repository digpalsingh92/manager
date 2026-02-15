import { PrismaClient } from '@prisma/client';
import { env } from './env.config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: env.isDevelopment
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : [{ level: 'error', emit: 'stdout' }],
});

if (env.isDevelopment) {
  prisma.$on('query' as never, (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

export { prisma };
