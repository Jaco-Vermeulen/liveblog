import { useEffect, useState } from 'react';
import { listGlobalPreferences } from '@/mechanisms/liveblog-api';
import { SETTINGS_KEYS } from '@/mechanisms/settings-manager/constants';

function preferenceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '');
}

/** Editor settings from global_preferences (legacy blog-edit on load). */
export function useEditorLiveblogSettings() {
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [allowMultipleTags, setAllowMultipleTags] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listGlobalPreferences();
        const tagsPref = data._items.find((item) => item.key === SETTINGS_KEYS.globalTags);
        const multiPref = data._items.find((item) => item.key === SETTINGS_KEYS.allowMultipleTags);
        if (cancelled) return;
        setGlobalTags(preferenceStringArray(tagsPref?.value));
        setAllowMultipleTags(multiPref?.value !== false);
      } catch {
        if (!cancelled) {
          setGlobalTags([]);
          setAllowMultipleTags(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { globalTags, allowMultipleTags, isLoading };
}
