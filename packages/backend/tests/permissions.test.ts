import { describe, expect, it } from 'vitest';
import { getPermissionsForRole, hasPermission } from '../src/lib/permissions';

describe('permission helpers', () => {
  it('grants owner wildcard permission', () => {
    expect(hasPermission(getPermissionsForRole('OWNER'), 'users:write')).toBe(true);
  });

  it('blocks viewer from write actions', () => {
    expect(hasPermission(getPermissionsForRole('VIEWER'), 'users:write')).toBe(false);
  });
});
