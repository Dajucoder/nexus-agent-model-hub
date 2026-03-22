import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { config } from '../../config';
import { prisma } from '../../db/prisma';
import { t } from '../../lib/i18n';
import { requirePermission, requireUserAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const usersRouter = Router();

usersRouter.get('/', requireUserAuth, requirePermission('users:read'), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { tenantId: req.principal!.tenantId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      displayName: true,
      locale: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      totpEnabled: true,
      createdAt: true,
      lastLoginAt: true
    }
  });

  res.json({ users });
});

usersRouter.post('/', requireUserAuth, requirePermission('users:write'), async (req, res) => {
  const input = z
    .object({
      email: z.string().email(),
      password: z.string().min(10).max(128),
      displayName: z.string().min(1).max(100),
      locale: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
      role: z.nativeEnum(UserRole).default(UserRole.MEMBER)
    })
    .parse(req.body);

  const existing = await prisma.user.findUnique({
    where: {
      tenant_email: {
        tenantId: req.principal!.tenantId,
        email: input.email
      }
    }
  });

  if (existing) {
    throw new AppError(409, 'USER_EXISTS', t(req, 'user.exists'));
  }

  const user = await prisma.user.create({
    data: {
      tenantId: req.principal!.tenantId,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, config.bcryptRounds),
      displayName: input.displayName,
      locale: input.locale,
      role: input.role
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      locale: true,
      role: true,
      isActive: true
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId: req.principal!.tenantId,
      userId: req.principal!.userId,
      action: 'user.created',
      resource: user.id,
      details: { createdUserEmail: user.email, role: user.role }
    }
  });

  res.status(201).json({ user });
});

usersRouter.patch('/:id', requireUserAuth, async (req, res) => {
  const isSelf = req.principal!.userId === req.params.id;
  const hasWritePermission = (req.principal!.permissions ?? []).includes('*') || (req.principal!.permissions ?? []).includes('users:write');
  if (!isSelf && !hasWritePermission) {
    throw new AppError(403, 'FORBIDDEN', t(req, 'permission.forbidden'));
  }

  const input = z
    .object({
      displayName: z.string().min(1).max(100).optional(),
      locale: z.enum(['zh-CN', 'en-US']).optional(),
      role: z.nativeEnum(UserRole).optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(10).max(128).optional()
    })
    .parse(req.body);

  const existing = await prisma.user.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.principal!.tenantId
    }
  });
  if (!existing) {
    throw new AppError(404, 'USER_NOT_FOUND', t(req, 'user.notFound'));
  }

  const data: Record<string, unknown> = {};
  if (input.displayName) data.displayName = input.displayName;
  if (input.locale) data.locale = input.locale;
  if (input.role && !isSelf) data.role = input.role;

  if (input.newPassword) {
    if (isSelf && !input.currentPassword) {
      throw new AppError(400, 'CURRENT_PASSWORD_REQUIRED', t(req, 'auth.currentPasswordRequired'));
    }

    if (isSelf) {
      const valid = await bcrypt.compare(input.currentPassword!, existing.passwordHash);
      if (!valid) {
        throw new AppError(401, 'INVALID_PASSWORD', t(req, 'auth.invalidPassword'));
      }
    }

    data.passwordHash = await bcrypt.hash(input.newPassword, config.bcryptRounds);
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data,
    select: {
      id: true,
      email: true,
      displayName: true,
      locale: true,
      role: true,
      isActive: true
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId: req.principal!.tenantId,
      userId: req.principal!.userId,
      action: isSelf ? 'user.profile.updated' : 'user.updated',
      resource: user.id,
      details: {
        updatedFields: Object.keys(data),
        passwordReset: Boolean(input.newPassword)
      }
    }
  });

  res.json({ user });
});

usersRouter.delete('/:id', requireUserAuth, requirePermission('users:deactivate'), async (req, res) => {
  if (req.params.id === req.principal!.userId) {
    throw new AppError(400, 'CANNOT_DEACTIVATE_SELF', t(req, 'user.cannotDeactivateSelf'));
  }

  const existing = await prisma.user.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.principal!.tenantId
    }
  });
  if (!existing) {
    throw new AppError(404, 'USER_NOT_FOUND', t(req, 'user.notFound'));
  }

  await prisma.user.update({
    where: { id: existing.id },
    data: { isActive: false }
  });

  await prisma.auditLog.create({
    data: {
      tenantId: req.principal!.tenantId,
      userId: req.principal!.userId,
      action: 'user.deactivated',
      resource: existing.id
    }
  });

  res.status(204).send();
});
