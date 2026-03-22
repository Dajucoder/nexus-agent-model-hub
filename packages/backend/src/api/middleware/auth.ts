import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { verifyAccessToken } from "../../auth/jwt";
import { getPermissionsForRole, hasPermission } from "../../lib/permissions";
import type { AuthPrincipal } from "../../types/auth";
import { t } from "../../lib/i18n";

declare global {
  namespace Express {
    interface Request {
      principal?: AuthPrincipal;
      locale?: "zh-CN" | "en-US";
    }
  }
}

function unauthorized(res: Response, message: string) {
  return res.status(401).json({
    error: "UNAUTHORIZED",
    message,
  });
}

async function authenticateApiKey(req: Request): Promise<AuthPrincipal | null> {
  const raw = req.headers["x-api-key"];
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }

  const keyHash = crypto.createHash("sha256").update(raw).digest("hex");
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (
    !apiKey ||
    !apiKey.isActive ||
    (apiKey.expiresAt && apiKey.expiresAt < new Date())
  ) {
    return null;
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    kind: "apiKey",
    tenantId: apiKey.tenantId,
    apiKeyId: apiKey.id,
    permissions: Array.isArray(apiKey.permissions)
      ? (apiKey.permissions as string[])
      : [],
  };
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    if (payload) {
      const user = await prisma.user.findFirst({
        where: {
          id: payload.sub,
          tenantId: payload.tid,
          isActive: true,
        },
        select: {
          id: true,
          tenantId: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return next();
      }

      req.principal = {
        kind: "user",
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        email: user.email,
        permissions: getPermissionsForRole(user.role),
      };
      return next();
    }
  }

  const apiKeyPrincipal = await authenticateApiKey(req);
  if (apiKeyPrincipal) {
    req.principal = apiKeyPrincipal;
  }

  return next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await authenticate(req, res, () => undefined);
  if (!req.principal) {
    return unauthorized(res, t(req, "auth.unauthorized"));
  }

  return next();
}

export async function requireUserAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await requireAuth(req, res, () => undefined);
  if (!req.principal) {
    return;
  }

  if (req.principal.kind !== "user") {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: t(req, "permission.forbidden"),
    });
  }

  return next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.principal ||
      req.principal.kind !== "user" ||
      !req.principal.role
    ) {
      return unauthorized(res, t(req, "auth.unauthorized"));
    }

    if (!roles.includes(req.principal.role)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: t(req, "permission.forbidden"),
      });
    }

    return next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.principal?.permissions ?? [];
    if (!hasPermission(permissions, permission)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: t(req, "permission.forbidden"),
      });
    }

    return next();
  };
}
