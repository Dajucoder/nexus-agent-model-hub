import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv === 'development' && config.logFormat === 'pretty'
      ? {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      : undefined,
  redact: [
    '*.password',
    '*.passwordHash',
    '*.totpSecret',
    '*.refreshToken',
    'req.headers.authorization',
    'req.headers.cookie'
  ]
});
