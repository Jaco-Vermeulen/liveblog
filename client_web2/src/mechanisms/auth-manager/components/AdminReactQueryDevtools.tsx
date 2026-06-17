import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '../hooks/useAuth';
import { isAdministrator } from '../services/privileges';

export function AdminReactQueryDevtools() {
  const { state } = useAuth();

  if (!isAdministrator(state.user)) {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
}
