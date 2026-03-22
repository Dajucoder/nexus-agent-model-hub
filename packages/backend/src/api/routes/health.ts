import { Router } from 'express';
import { config } from '../../config';
import { prisma } from '../../db/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  let database = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'error';
  }

  res.status(database === 'ok' ? 200 : 503).json({
    status: database === 'ok' ? 'ok' : 'degraded',
    appName: config.appName,
    version: config.appVersion,
    environment: config.nodeEnv,
    checks: {
      database
    },
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
