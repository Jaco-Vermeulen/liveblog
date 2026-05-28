import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { PrivilegeMap } from '@/mechanisms/liveblog-api/endpoints/roles';
import { usePrivileges } from '../context/PrivilegesProvider';

type PrivilegeRouteProps = {
  require: PrivilegeMap;
  children: ReactNode;
  redirectTo?: string;
};

export function PrivilegeRoute({
  require,
  children,
  redirectTo = '/liveblog',
}: PrivilegeRouteProps) {
  const { loading, hasPrivilege } = usePrivileges();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LbSpinner tone="dark" />
      </div>
    );
  }

  if (!hasPrivilege(require)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
