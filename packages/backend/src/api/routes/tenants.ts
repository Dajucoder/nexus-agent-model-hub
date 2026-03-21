import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma';
import { t } from '../../lib/i18n';
import { requirePermission, requireRole, requireUserAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const tenantsRouter = Router();

tenantsRouter.get('/current', requireUserAuth, requirePermission('tenants:read'), async (req, res) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.principal!.tenantId },
    include: {
      _count: {
        select: {
          users: true,
          agentRuns: true
        }
      }
    }
  });

  if (!tenant) {
    throw new AppError(404, 'TENANT_NOT_FOUND', t(req, 'tenant.notFound'));
  }

  res.json({ tenant });
});

tenantsRouter.patch('/current', requireUserAuth, requireRole('OWNER'), async (req, res) => {
  const input = z
    .object({
      name: z.string().min(2).max(120).optional(),
      description: z.string().max(500).optional(),
      logoUrl: z.string().url().optional(),
      isActive: z.boolean().optional()
    })
    .parse(req.body);

  const tenant = await prisma.tenant.update({
    where: { id: req.principal!.tenantId },
    data: input
  });

  res.json({ tenant });
});

tenantsRouter.get('/current/audit-logs', requireUserAuth, requirePermission('audit:read'), async (req, res) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { tenantId: req.principal!.tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.auditLog.count({
      where: { tenantId: req.principal!.tenantId }
    })
  ]);

  res.json({
    items,
    page,
    limit,
    total
  });
});
