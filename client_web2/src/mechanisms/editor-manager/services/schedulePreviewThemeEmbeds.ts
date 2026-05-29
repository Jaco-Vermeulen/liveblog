type PreviewIframeWindow = Window & {
  LiveBlog?: { loadEmbeds?: (root?: Document | Element) => void };
  LB?: { loadEmbeds?: (root?: Document | Element) => void };
  iframely?: { load?: (node?: Element) => void };
};

const POLL_MS = 250;
const MAX_ATTEMPTS = 24;

function runThemeEmbedActivation(win: PreviewIframeWindow | null): void {
  if (!win) return;
  const doc = win.document;
  if (!doc?.body) return;

  const load = win.LiveBlog?.loadEmbeds ?? win.LB?.loadEmbeds;
  if (load) {
    try {
      load(doc);
    } catch {
      try {
        load();
      } catch {
        // ignore
      }
    }
  }

  const iframely = win.iframely;
  if (iframely?.load) {
    doc.querySelectorAll('.iframely-embed').forEach((node) => {
      try {
        iframely.load!(node);
      } catch {
        // ignore
      }
    });
    try {
      iframely.load();
    } catch {
      // ignore
    }
  }
}

/**
 * Poll the theme embed iframe until `LiveBlog.loadEmbeds` / `iframely.load` exist,
 * then activate cards (same retries as public blog GDPR path).
 */
export function schedulePreviewThemeEmbeds(iframe: HTMLIFrameElement): () => void {
  let cancelled = false;
  let attempts = 0;

  const tick = () => {
    if (cancelled) return;
    attempts += 1;
    runThemeEmbedActivation(iframe.contentWindow as PreviewIframeWindow | null);
    if (attempts < MAX_ATTEMPTS) {
      window.setTimeout(tick, POLL_MS);
    }
  };

  tick();
  return () => {
    cancelled = true;
  };
}
