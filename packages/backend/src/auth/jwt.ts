import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../db/prisma";
import { durationToMilliseconds } from "../lib/duration";
import type { JwtPayload } from "../types/auth";

type RefreshPayload = JwtPayload & { jti: string };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export async function generateTokenPair(
  payload: JwtPayload,
): Promise<TokenPair> {
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    issuer: "nexus-agent-model-hub",
    audience: "nexus-agent-model-hub-web",
  });

  const tokenId = crypto.randomUUID();
  const refreshToken = jwt.sign(
    { ...payload, jti: tokenId },
    config.jwtRefreshSecret,
    {
      expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
      issuer: "nexus-agent-model-hub",
      audience: "nexus-agent-model-hub-web",
    },
  );

  const expiresAt = new Date(
    Date.now() + durationToMilliseconds(config.jwtRefreshExpiresIn),
  );
  await prisma.refreshToken.create({
    data: {
      tenantId: payload.tid,
      userId: payload.sub,
      tokenId,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwtExpiresIn,
  };
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: "nexus-agent-model-hub",
      audience: "nexus-agent-model-hub-web",
    }) as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshPayload | null> {
  try {
    const payload = jwt.verify(token, config.jwtRefreshSecret, {
      issuer: "nexus-agent-model-hub",
      audience: "nexus-agent-model-hub-web",
    }) as RefreshPayload;

    const record = await prisma.refreshToken.findUnique({
      where: { tokenId: payload.jti },
    });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenId },
    data: { revoked: true },
  });
}

export async function revokeAllUserRefreshTokens(
  userId: string,
): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

export function toJwtPayload(params: {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}): JwtPayload {
  return {
    sub: params.userId,
    tid: params.tenantId,
    role: params.role,
    email: params.email,
  };
}
