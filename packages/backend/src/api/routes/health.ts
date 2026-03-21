import { Router } from 'express';
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
    version: '0.1.0',
    checks: {
      database
    },
    timestamp: new Date().toISOString()
  });
});
