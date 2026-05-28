import type { LiveblogUser } from '@/mechanisms/liveblog-api';
import type { PrivilegeMap } from '@/mechanisms/liveblog-api/endpoints/roles';

export type { PrivilegeMap };

export function isAdministrator(user: LiveblogUser | null | undefined): boolean {
  return user?.user_type === 'administrator';
}

/** Legacy Superdesk parity: administrators bypass all privilege checks. */
export function userHasPrivileges(
  user: LiveblogUser | null | undefined,
  rolePrivileges: PrivilegeMap | null | undefined,
  required: PrivilegeMap,
): boolean {
  if (!user) return false;
  if (isAdministrator(user)) return true;
  const merged = rolePrivileges ?? {};
  return Object.keys(required).every((key) => merged[key] === 1);
}

export function resolveRolePrivileges(
  user: LiveblogUser | null | undefined,
  rolesById: Map<string, PrivilegeMap>,
): PrivilegeMap | null {
  if (!user?.role || typeof user.role !== 'string') return null;
  return rolesById.get(user.role) ?? null;
}
