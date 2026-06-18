import { useEffect, useState, type RefObject } from 'react';

/**
 * Use the overflow formatting menu only below this width.
 * Typical split-view compose columns (~500px on a 1366px laptop) keep the full toolbar.
 */
export const RICH_TEXT_COMPACT_FORCE_WIDTH = 380;

export function useRichTextCompactToolbar(
  rootRef: RefObject<HTMLElement | null>,
): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      setCompact(root.clientWidth < RICH_TEXT_COMPACT_FORCE_WIDTH);
    };

    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  return compact;
}
