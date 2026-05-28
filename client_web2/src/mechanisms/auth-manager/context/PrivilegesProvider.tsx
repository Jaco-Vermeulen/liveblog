import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { listRoles, type PrivilegeMap } from '@/mechanisms/liveblog-api/endpoints/roles';
import { useAuth } from '../hooks/useAuth';
import {
  isAdministrator,
  resolveRolePrivileges,
  userHasPrivileges,
} from '../services/privileges';

type PrivilegesContextValue = {
  loading: boolean;
  rolePrivileges: PrivilegeMap | null;
  hasPrivilege(required: PrivilegeMap): boolean;
  canManageGlobalPreferences: boolean;
  canDeleteThemes: boolean;
  canManageUsers: boolean;
};

const PrivilegesContext = createContext<PrivilegesContextValue | null>(null);

export function PrivilegesProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const [rolesById, setRolesById] = useState<Map<string, PrivilegeMap>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated || !state.user) {
      setRolesById(new Map());
      setLoading(false);
      return;
    }

    if (isAdministrator(state.user)) {
      setRolesById(new Map());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    listRoles()
      .then((res) => {
        if (cancelled) return;
        const map = new Map<string, PrivilegeMap>();
        for (const role of res._items) {
          map.set(role._id, role.privileges ?? {});
        }
        setRolesById(map);
      })
      .catch(() => {
        if (!cancelled) setRolesById(new Map());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state.isAuthenticated, state.user?._id, state.user?.user_type, state.user?.role]);

  const rolePrivileges = useMemo(
    () => resolveRolePrivileges(state.user, rolesById),
    [state.user, rolesById],
  );

  const hasPrivilege = useCallback(
    (required: PrivilegeMap) => userHasPrivileges(state.user, rolePrivileges, required),
    [state.user, rolePrivileges],
  );

  const value = useMemo<PrivilegesContextValue>(
    () => ({
      loading,
      rolePrivileges,
      hasPrivilege,
      canManageGlobalPreferences: hasPrivilege({ global_preferences: 1 }),
      canDeleteThemes: hasPrivilege({ themes_delete: 1 }),
      canManageUsers: hasPrivilege({ users: 1 }),
    }),
    [loading, rolePrivileges, hasPrivilege],
  );

  return <PrivilegesContext.Provider value={value}>{children}</PrivilegesContext.Provider>;
}

export function usePrivileges(): PrivilegesContextValue {
  const ctx = useContext(PrivilegesContext);
  if (!ctx) {
    throw new Error('usePrivileges must be used within PrivilegesProvider');
  }
  return ctx;
}
