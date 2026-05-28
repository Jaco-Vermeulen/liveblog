import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LiveblogWsEvent, useWsEvent } from '@/mechanisms/websocket-manager';

/** Refresh blog list when server broadcasts blog changes (legacy `$scope.$on('blogs')`). */
export function useBlogListWebSocket() {
  const queryClient = useQueryClient();

  useWsEvent(LiveblogWsEvent.Blog, () => {
    void queryClient.invalidateQueries({ queryKey: ['blogs'] });
  });

  useEffect(() => {
    const onFocus = () => {
      void queryClient.invalidateQueries({ queryKey: ['blogs'] });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [queryClient]);
}
