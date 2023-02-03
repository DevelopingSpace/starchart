import pino from 'pino';
import type { LoggerOptions } from 'pino';

const pinoOptions: LoggerOptions = { level: process.env.LOG_LEVEL || 'info' };
// Pretty debug logging
if (pinoOptions.level === 'debug') {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

export default pino(pinoOptions);
