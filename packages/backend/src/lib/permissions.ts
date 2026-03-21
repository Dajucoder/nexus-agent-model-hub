import type { UserRole } from '@prisma/client';

const rolePermissions: Record<UserRole, string[]> = {
  OWNER: ['*'],
  ADMIN: [
    'users:read',
    'users:write',
    'users:deactivate',
    'tenants:read',
    'tenants:write',
    'audit:read',
    'agents:read',
    'agents:call'
  ],
  MEMBER: ['profile:read', 'profile:write', 'tenants:read', 'agents:read', 'agents:call'],
  VIEWER: ['profile:read', 'tenants:read', 'agents:read']
};

export function getPermissionsForRole(role: UserRole): string[] {
  return rolePermissions[role] ?? [];
}

export function hasPermission(permissions: string[], required: string): boolean {
  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(required);
}
