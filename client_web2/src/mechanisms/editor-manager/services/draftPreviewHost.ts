export const DRAFT_PREVIEW_HOST_ID = 'lb-composer-draft-preview-host';
const DRAFT_THEME_CSS_ID = 'lb-composer-draft-preview-css';

const DRAFT_IN_IFRAME_CSS = `
#${DRAFT_PREVIEW_HOST_ID} {
  display: contents;
}
#${DRAFT_PREVIEW_HOST_ID} .lb-post--draft {
  position: relative;
  outline: 2px dashed rgba(21, 117, 120, 0.55);
  outline-offset: -2px;
}
#${DRAFT_PREVIEW_HOST_ID} .lb-post__draft-label {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  z-index: 5;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #157578;
  background: rgba(255, 253, 248, 0.95);
  border: 1px solid rgba(21, 117, 120, 0.35);
}
`;

function ensureDraftStyles(doc: Document): void {
  if (doc.getElementById(DRAFT_THEME_CSS_ID)) return;
  const style = doc.createElement('style');
  style.id = DRAFT_THEME_CSS_ID;
  style.textContent = DRAFT_IN_IFRAME_CSS;
  doc.head.appendChild(style);
}

function resolveDraftInsertTarget(doc: Document): Element | null {
  return (
    doc.querySelector('section[data-timeline-normal].lb-posts') ??
    doc.querySelector('section.lb-posts.normal') ??
    doc.querySelector('section.lb-posts') ??
    doc.querySelector('.timeline-body') ??
    doc.querySelector('[data-timeline].lb-timeline')
  );
}

/** Mount point for the composer draft inside a same-origin theme embed. */
export function ensureDraftPreviewHost(doc: Document): HTMLElement {
  ensureDraftStyles(doc);

  const existing = doc.getElementById(DRAFT_PREVIEW_HOST_ID);
  if (existing) return existing;

  const host = doc.createElement('div');
  host.id = DRAFT_PREVIEW_HOST_ID;
  host.className = 'lb-composer-draft-preview-host';

  const target = resolveDraftInsertTarget(doc);
  if (target) {
    target.insertBefore(host, target.firstChild);
  } else {
    doc.body.appendChild(host);
  }

  return host;
}

export function removeDraftPreviewHost(doc: Document): void {
  doc.getElementById(DRAFT_PREVIEW_HOST_ID)?.remove();
}
