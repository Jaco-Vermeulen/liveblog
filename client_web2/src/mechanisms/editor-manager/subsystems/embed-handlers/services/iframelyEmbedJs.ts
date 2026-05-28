import { getIframelyKey } from './iframely';

let loadPromise: Promise<void> | null = null;

type IframelyWindow = Window & {
  iframely?: { load?: () => void };
};

/** Same URL as theme `template-embed-utils.html` (key required for cards to render). */
export function getIframelyEmbedScriptUrl(): string {
  return `https://cdn.iframe.ly/embed.js?key=${encodeURIComponent(getIframelyKey())}`;
}

function waitForIframelyApi(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if ((window as IframelyWindow).iframely?.load) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error('Iframely API not available after script load'));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/** Scan DOM for `iframely-embed` cards (safe to call repeatedly). */
export function runIframelyLoad(): void {
  const w = window as IframelyWindow;
  try {
    w.iframely?.load?.();
  } catch {
    // ignore
  }
}

/**
 * After injecting embed HTML, iframely needs load() once layout exists.
 * Without retries, fast machines often miss cards (works when DevTools slows the tab).
 */
export function scheduleIframelyActivation(retries = 4, delayMs = 120): void {
  const attempt = (remaining: number) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runIframelyLoad();
        if (remaining > 0) {
          window.setTimeout(() => attempt(remaining - 1), delayMs);
        }
      });
    });
  };
  attempt(retries);
}

function runWidgetParsers(root?: HTMLElement | null): void {
  const el = root ?? document.body;

  const instgrm = (window as Window & { instgrm?: { Embeds?: { process: () => void } } }).instgrm;
  if (instgrm?.Embeds?.process) {
    try {
      instgrm.Embeds.process();
    } catch {
      // ignore
    }
  }

  const fb = (window as Window & { FB?: { XFBML?: { parse: (node?: HTMLElement) => void } } }).FB;
  if (fb?.XFBML?.parse) {
    try {
      fb.XFBML.parse(el);
    } catch {
      // ignore
    }
  }

  const twttr = (window as Window & { twttr?: { widgets?: { load: (node?: HTMLElement) => void } } })
    .twttr;
  if (twttr?.widgets?.load) {
    try {
      twttr.widgets.load(el);
    } catch {
      // ignore
    }
  }
}

/**
 * Load embed.js (once) then activate cards/widgets inside `root`.
 */
export async function activateEmbedMarkup(root?: HTMLElement | null): Promise<void> {
  await ensureIframelyEmbedJs();
  scheduleIframelyActivation();
  runWidgetParsers(root);
  window.setTimeout(() => {
    runIframelyLoad();
    runWidgetParsers(root);
  }, 300);
}

/**
 * Load Iframely embed.js with public key — required for `iframely-embed` markup (Facebook, etc.).
 */
export function ensureIframelyEmbedJs(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (!loadPromise) {
    loadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById('iframely-embed-js') as HTMLScriptElement | null;

      if (existing?.src.includes('key=') && existing.dataset.loaded === '1') {
        void waitForIframelyApi().then(resolve).catch(reject);
        return;
      }

      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.id = 'iframely-embed-js';
      script.async = true;
      script.defer = true;
      script.charset = 'utf-8';
      script.src = getIframelyEmbedScriptUrl();
      script.onload = () => {
        script.dataset.loaded = '1';
        void waitForIframelyApi().then(resolve).catch(reject);
      };
      script.onerror = () => reject(new Error('Kon nie Iframely embed.js laai nie'));
      document.body.appendChild(script);
    });
  }

  return loadPromise;
}
