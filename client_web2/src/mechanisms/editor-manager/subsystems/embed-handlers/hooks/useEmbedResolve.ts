import { useCallback, useRef, useState } from 'react';
import { resolveEmbed, IframelyError } from '../resolveEmbed';
import { normalizeEmbedInput } from '../services/normalizeEmbedInput';
import type { EmbedMeta } from '../types';

export interface UseEmbedResolveResult {
  meta: EmbedMeta | null;
  isResolving: boolean;
  error: string | null;
  resolve: (input: string) => Promise<EmbedMeta | null>;
  setMeta: (meta: EmbedMeta | null) => void;
  clear: () => void;
}

export function useEmbedResolve(initialMeta?: EmbedMeta | null): UseEmbedResolveResult {
  const [meta, setMeta] = useState<EmbedMeta | null>(initialMeta ?? null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const clear = useCallback(() => {
    setMeta(null);
    setError(null);
  }, []);

  const resolve = useCallback(async (input: string) => {
    const trimmed = normalizeEmbedInput(input);
    if (!trimmed) {
      clear();
      return null;
    }

    const id = ++requestId.current;
    setIsResolving(true);
    setError(null);

    try {
      const resolved = await resolveEmbed(trimmed);
      if (id !== requestId.current) return null;
      setMeta(resolved);
      return resolved;
    } catch (err) {
      if (id !== requestId.current) return null;
      const message =
        err instanceof IframelyError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Kon nie inbedding laai nie';
      setError(message);
      return null;
    } finally {
      if (id === requestId.current) {
        setIsResolving(false);
      }
    }
  }, [clear]);

  return { meta, isResolving, error, resolve, setMeta, clear };
}
