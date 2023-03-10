import winston from 'winston';

const { combine, json, simple, colorize, errors, timestamp } = winston.format;

declare global {
  var __logger_init__: boolean;
}

function init() {
  // https://nodejs.org/api/process.html#event-uncaughtexception
  process.on('uncaughtException', (err, origin) => {
    logger.error(`uncaughtException: origin=${origin}`, err);
    throw err;
  });

  // https://nodejs.org/api/process.html#event-unhandledrejection
  process.on('unhandledRejection', (reason) => {
    logger.error(`unhandledRejection:`, reason);
    throw reason;
  });
}

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

if (process.env.NODE_ENV === 'production') {
  init();
} else {
  // Only do this setup once in dev
  if (!global.__logger_init__) {
    init();
    global.__logger_init__ = true;
  }
}

export default logger;
