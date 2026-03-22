import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { agentsRouter } from './api/routes/agents';
import { authRouter } from './api/routes/auth';
import { healthRouter } from './api/routes/health';
import { platformRouter } from './api/routes/platform';
import { tenantsRouter } from './api/routes/tenants';
import { usersRouter } from './api/routes/users';
import { config } from './config';
import { errorHandler } from './api/middleware/errorHandler';
import { rateLimiter } from './api/middleware/rateLimiter';
import { requestContext } from './api/middleware/requestContext';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(config.corsOriginList);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || allowedOrigins.has(origin));
      },
      credentials: true
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestContext);
  app.use(
    morgan('combined', {
      stream: {
        write: (line) => logger.info(line.trim())
      }
    })
  );

  app.use('/api', rateLimiter);
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/platform', platformRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/tenants', tenantsRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/agents', agentsRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Resource not found'
    });
  });

  app.use(errorHandler);
  return app;
}
