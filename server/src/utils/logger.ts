import winston from 'winston';
import { env } from '../config/env.config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  if (stack) {
    log += `\n${stack}`;
  }
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  return log;
});

// Console transport
const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
});

// File transports
const fileTransports = [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'project-management-api' },
  transports: [
    consoleTransport,
    ...(env.isProduction ? fileTransports : []),
  ],
  exitOnError: false,
});
