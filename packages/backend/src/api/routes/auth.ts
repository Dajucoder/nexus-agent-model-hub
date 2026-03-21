import bcrypt from 'bcryptjs';
import { Router } from 'express';
import speakeasy from 'speakeasy';
import { Prisma, UserRole } from '@prisma/client';
import { z } from 'zod';
import { generateTokenPair, revokeAllUserRefreshTokens, revokeRefreshToken, toJwtPayload, verifyRefreshToken } from '../../auth/jwt';
import { config } from '../../config';
import { prisma } from '../../db/prisma';
import { t } from '../../lib/i18n';
import { AppError } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import { requireUserAuth } from '../middleware/auth';

export const authRouter = Router();

const registerSchema = z.object({
  tenantSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  tenantName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(10).max(128),
  displayName: z.string().min(1).max(100),
  locale: z.enum(['zh-CN', 'en-US']).default('zh-CN')
});

const loginSchema = z.object({
  tenantSlug: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
  otpCode: z.string().length(6).optional()
});

authRouter.post('/register', authRateLimiter, async (req, res) => {
  const input = registerSchema.parse(req.body);

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: input.tenantSlug }
  });
  if (existingTenant) {
    throw new AppError(409, 'TENANT_EXISTS', t(req, 'auth.registerConflict'));
  }

  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.tenantName,
        slug: input.tenantSlug
      }
    });

    await tx.role.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: 'owner',
          description: 'Tenant owner',
          permissions: ['*'],
          isSystem: true
        },
        {
          tenantId: tenant.id,
          name: 'admin',
          description: 'Tenant administrator',
          permissions: ['users:read', 'users:write', 'users:deactivate', 'tenants:read', 'tenants:write', 'audit:read', 'agents:read', 'agents:call'],
          isSystem: true
        },
        {
          tenantId: tenant.id,
          name: 'member',
          description: 'Standard member',
          permissions: ['profile:read', 'profile:write', 'tenants:read', 'agents:read', 'agents:call'],
          isSystem: true
        },
        {
          tenantId: tenant.id,
          name: 'viewer',
          description: 'Read-only viewer',
          permissions: ['profile:read', 'tenants:read', 'agents:read'],
          isSystem: true
        }
      ]
    });

    const owner = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        locale: input.locale,
        role: UserRole.OWNER
      }
    });

    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: owner.id,
        action: 'tenant.created',
        details: { tenantSlug: tenant.slug }
      }
    });

    return { tenant, owner };
  });

  const tokens = await generateTokenPair(
    toJwtPayload({
      userId: result.owner.id,
      tenantId: result.tenant.id,
      role: result.owner.role,
      email: result.owner.email
    })
  );

  res.status(201).json({
    tenant: result.tenant,
    user: {
      id: result.owner.id,
      email: result.owner.email,
      displayName: result.owner.displayName,
      role: result.owner.role
    },
    tokens
  });
});

authRouter.post('/login', authRateLimiter, async (req, res) => {
  const input = loginSchema.parse(req.body);
  const tenant = await prisma.tenant.findUnique({
    where: { slug: input.tenantSlug }
  });

  if (!tenant || !tenant.isActive) {
    throw new AppError(401, 'INVALID_CREDENTIALS', t(req, 'auth.invalidCredentials'));
  }

  const user = await prisma.user.findUnique({
    where: {
      tenant_email: {
        tenantId: tenant.id,
        email: input.email
      }
    }
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'INVALID_CREDENTIALS', t(req, 'auth.invalidCredentials'));
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(423, 'ACCOUNT_LOCKED', t(req, 'auth.accountLocked'));
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const failedAttempts = user.failedAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: failedAttempts >= 5 ? 0 : failedAttempts,
        lockedUntil: failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : user.lockedUntil
      }
    });
    throw new AppError(401, 'INVALID_CREDENTIALS', t(req, 'auth.invalidCredentials'));
  }

  if (user.totpEnabled) {
    if (!input.otpCode || !user.totpSecret) {
      throw new AppError(401, 'OTP_REQUIRED', 'One-time code required');
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: input.otpCode,
      window: 1
    });

    if (!verified) {
      throw new AppError(401, 'OTP_INVALID', 'One-time code is invalid');
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: req.ip
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      action: 'auth.login',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }
  });

  const tokens = await generateTokenPair(
    toJwtPayload({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      email: user.email
    })
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      locale: user.locale
    },
    tokens
  });
});

authRouter.post('/refresh', async (req, res) => {
  const input = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
  const payload = await verifyRefreshToken(input.refreshToken);
  if (!payload) {
    throw new AppError(401, 'TOKEN_INVALID', t(req, 'auth.invalidToken'));
  }

  await revokeRefreshToken(payload.jti);

  const tokens = await generateTokenPair({
    sub: payload.sub,
    tid: payload.tid,
    role: payload.role,
    email: payload.email
  });

  res.json({ tokens });
});

authRouter.post('/logout', async (req, res) => {
  const input = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
  const payload = await verifyRefreshToken(input.refreshToken);
  if (payload) {
    await revokeRefreshToken(payload.jti);
  }
  res.status(204).send();
});

authRouter.get('/me', requireUserAuth, async (req, res) => {
  const principal = req.principal!;
  const user = await prisma.user.findFirst({
    where: {
      id: principal.userId,
      tenantId: principal.tenantId
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      locale: true,
      role: true,
      lastLoginAt: true
    }
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', t(req, 'user.notFound'));
  }

  res.json({ user });
});

authRouter.post('/2fa/setup', requireUserAuth, async (req, res) => {
  const principal = req.principal!;
  const secret = speakeasy.generateSecret({
    name: `Nexus Agent Model Hub (${principal.email ?? principal.userId})`
  });

  await prisma.user.update({
    where: { id: principal.userId },
    data: {
      totpSecret: secret.base32,
      totpEnabled: false
    }
  });

  res.json({
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  });
});

authRouter.post('/2fa/verify', requireUserAuth, async (req, res) => {
  const principal = req.principal!;
  const input = z.object({ token: z.string().length(6) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: principal.userId } });
  if (!user?.totpSecret) {
    throw new AppError(400, 'OTP_NOT_SETUP', 'TOTP has not been configured');
  }

  const ok = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: input.token,
    window: 1
  });
  if (!ok) {
    throw new AppError(400, 'OTP_INVALID', 'One-time code is invalid');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true }
  });

  res.status(204).send();
});

authRouter.post('/sessions/revoke-all', requireUserAuth, async (req, res) => {
  const principal = req.principal!;
  await revokeAllUserRefreshTokens(principal.userId!);
  res.status(204).send();
});
