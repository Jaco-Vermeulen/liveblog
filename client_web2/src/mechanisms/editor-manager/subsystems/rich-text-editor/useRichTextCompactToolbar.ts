import { useEffect, useState, type RefObject } from 'react';

/** Minimum editor width (px) before switching to the overflow formatting menu. */
export const RICH_TEXT_COMPACT_MIN_WIDTH = 680;

export function useRichTextCompactToolbar(
  rootRef: RefObject<HTMLElement | null>,
): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      setCompact(root.clientWidth < RICH_TEXT_COMPACT_MIN_WIDTH);
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
