import { useCallback, useEffect, useState } from 'react';
import { listFreetypes, type Freetype } from '@/mechanisms/liveblog-api';
import { mergeEditorFreetypes } from '../builtinFreetypes';

/** Read-only freetype list for editor composer (no usage checks). */
export function useFreetypesList() {
  const [freetypes, setFreetypes] = useState<Freetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFreetypes();
      setFreetypes(mergeEditorFreetypes(data._items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie vrye tipes laai nie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { freetypes, loading, error, refresh };
}
