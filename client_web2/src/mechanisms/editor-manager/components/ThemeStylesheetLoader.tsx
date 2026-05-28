import { useEffect, useId } from 'react';

export interface ThemeStylesheetLoaderProps {
  urls: string[];
}

/** Injects theme CSS from the liveblog server (same files as public embed). */
export function ThemeStylesheetLoader({ urls }: ThemeStylesheetLoaderProps) {
  const scopeId = useId().replace(/:/g, '');

  useEffect(() => {
    if (!urls.length) return;

    const links = urls.map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-lb-theme-preview', scopeId);
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [urls, scopeId]);

  return null;
}
