import type { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  tid: string;
  role: UserRole;
  email: string;
}

export interface AuthPrincipal {
  kind: 'user' | 'apiKey';
  tenantId: string;
  userId?: string;
  email?: string;
  role?: UserRole;
  permissions?: string[];
  apiKeyId?: string;
}
