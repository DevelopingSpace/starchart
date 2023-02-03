import winston from 'winston';

const { combine, json, simple, colorize, errors, timestamp } = winston.format;

const logger = winston.createLogger({
  // Default to info level, but use whatever's defined in the env
  level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
  // In development, use a simplified output, expand errors, use colour.
  // Use JSON with timestamps in production
  format:
    process.env.NODE_ENV === 'production'
      ? combine(timestamp(), json())
      : combine(colorize(), errors({ stack: true }), simple()),
  // Log to stdout/stderr
  transports: [new winston.transports.Console()],
});

export default logger;
