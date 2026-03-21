import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { agentRegistry } from '../../agents/registry';
import { config } from '../../config';
import { prisma } from '../../db/prisma';
import { Semaphore } from '../../lib/semaphore';
import { t } from '../../lib/i18n';
import { AppError } from '../middleware/errorHandler';
import { agentRateLimiter } from '../middleware/rateLimiter';
import { requireAuth, requirePermission } from '../middleware/auth';

const semaphore = new Semaphore(config.agentConcurrencyLimit);

async function executeWithRetry<T>(attempts: number, work: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let index = 0; index <= attempts; index += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export const agentsRouter = Router();

agentsRouter.get('/', requireAuth, requirePermission('agents:read'), async (_req, res) => {
  res.json({
    agents: agentRegistry.list().map((agent) => ({
      type: agent.type,
      name: agent.name,
      description: agent.description,
      version: agent.version,
      inputSchema: agent.inputSchema,
      outputSchema: agent.outputSchema
    }))
  });
});

agentsRouter.post('/call', requireAuth, agentRateLimiter, requirePermission('agents:call'), async (req, res) => {
  const input = z
    .object({
      agentType: z.string().min(1),
      input: z.record(z.unknown()),
      timeoutMs: z.number().int().min(1000).max(120000).optional()
    })
    .parse(req.body);

  const agent = agentRegistry.get(input.agentType);
  if (!agent) {
    throw new AppError(404, 'AGENT_NOT_FOUND', t(req, 'agent.notFound'));
  }

  const principal = req.principal!;
  const run = await prisma.agentRun.create({
    data: {
      tenantId: principal.tenantId,
      userId: principal.userId,
      actorType: principal.kind,
      agentType: agent.type,
      input: input.input as Prisma.InputJsonValue,
      status: 'RUNNING'
    }
  });

  const startedAt = Date.now();
  const timeoutMs = input.timeoutMs ?? config.agentTimeoutMs;

  try {
    const output = await semaphore.use(() =>
      executeWithRetry(config.agentMaxRetries, () =>
        Promise.race([
          agent.execute(input.input, {
            tenantId: principal.tenantId,
            userId: principal.userId,
            actorType: principal.kind,
            runId: run.id
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('AGENT_TIMEOUT')), timeoutMs);
          })
        ])
      )
    );

    const duration = Date.now() - startedAt;
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCESS',
        output: output as Prisma.InputJsonValue,
        duration
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: principal.tenantId,
        userId: principal.userId,
        action: 'agent.called',
        resource: agent.type,
        details: {
          runId: run.id,
          actorType: principal.kind,
          duration
        }
      }
    });

    res.json({
      runId: run.id,
      status: 'SUCCESS',
      duration,
      output
    });
  } catch (error) {
    const duration = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : 'Unknown agent error';
    const status = message === 'AGENT_TIMEOUT' ? 'TIMEOUT' : 'FAILED';

    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status,
        error: message,
        duration
      }
    });

    if (status === 'TIMEOUT') {
      throw new AppError(504, 'AGENT_TIMEOUT', t(req, 'agent.timeout'));
    }

    throw new AppError(500, 'AGENT_ERROR', message);
  }
});

agentsRouter.get('/runs', requireAuth, requirePermission('agents:read'), async (req, res) => {
  const runs = await prisma.agentRun.findMany({
    where: { tenantId: req.principal!.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  res.json({ runs });
});

agentsRouter.get('/runs/:id', requireAuth, requirePermission('agents:read'), async (req, res) => {
  const run = await prisma.agentRun.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.principal!.tenantId
    }
  });

  if (!run) {
    throw new AppError(404, 'RUN_NOT_FOUND', 'Agent run not found');
  }

  res.json({ run });
});
