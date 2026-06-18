import type { Post } from '@/mechanisms/liveblog-api';
import { canShowPublishAction } from './postPublishActions';

export const PREVIEW_EMBED_ADMIN_STYLE_ID = 'lb-admin-preview-tools';
export const PREVIEW_EMBED_MOBILE_STYLE_ID = 'lb-admin-preview-mobile';

export const INJECTED_POST_ATTR = 'data-lb-admin-injected';

/** Toolbar actions wired from React into the server-rendered theme embed. */
export interface PreviewEmbedHandlers {
  postsById: Map<string, Post>;
  allowPinHighlight: boolean;
  onEdit: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onPublish?: (postId: string) => void;
  onTogglePin?: (postId: string) => void;
  onToggleHighlight?: (postId: string) => void;
}

const ADMIN_TOOLBAR_CSS = `
.lb-post.lb-post--admin-preview { position: relative; }
.lb-post.lb-post--admin-preview .lb-post-admin-actions {
  position: absolute; top: 0.35rem; right: 0.35rem; z-index: 1200;
  display: flex; gap: 0.15rem; padding: 0.15rem; border-radius: 0.5rem;
  background: rgba(248,244,237,0.97); border: 1px solid #e2dcd2;
  box-shadow: 0 4px 12px rgba(28,25,23,0.14);
  opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
}
.lb-post.lb-post--admin-preview:hover .lb-post-admin-actions,
.lb-post.lb-post--admin-preview:focus-within .lb-post-admin-actions {
  opacity: 1; pointer-events: auto;
}
.lb-post-admin-actions__btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem; padding: 0; margin: 0;
  border: 1px solid #e2dcd2; border-radius: 0.375rem; background: #fffdf8;
  color: #157578; cursor: pointer; line-height: 1;
}
.lb-post-admin-actions__btn:hover { background: #157578; color: #fff; }
.lb-post-admin-actions__btn--active {
  border-color: #157578;
  background: color-mix(in srgb, #157578 12%, #fffdf8);
}
.lb-post-admin-actions__btn--danger { color: #b42318; }
.lb-post-admin-actions__btn--danger:hover {
  background: #b42318; border-color: #b42318; color: #fff;
}
.lb-post-admin-actions__btn svg { width: 0.875rem; height: 0.875rem; display: block; }
`;

/** Hide fat desktop scrollbars inside theme embed (admin device preview). */
const EMBED_MOBILE_CHROME_CSS = `
html, body {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}
`;

const ICONS = {
  pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 3h6l1 7h4l-3 5v4H7v-4L4 10h4z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  pencil: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
} as const;

/** Resolve post id from theme DOM (`data-post-id` or permalink anchor). */
export function findPostIdInArticle(article: Element): string | null {
  const fromAttr = article.getAttribute('data-post-id')?.trim();
  if (fromAttr && fromAttr.length >= 8) return fromAttr;

  const link = article.querySelector<HTMLAnchorElement>('.lb-post-permalink a[id]');
  const id = link?.id?.trim();
  if (!id || id.length < 8) return null;
  return id;
}

function resolvePostFromHandlers(
  handlers: PreviewEmbedHandlers,
  postId: string,
): Post | undefined {
  const direct = handlers.postsById.get(postId);
  if (direct) return direct;

  for (const [id, post] of handlers.postsById) {
    if (id === postId || id.endsWith(postId) || postId.endsWith(id)) {
      return post;
    }
  }
  return undefined;
}

function clearPostToolbar(article: HTMLElement): void {
  article.classList.remove('lb-post--admin-preview');
  article.removeAttribute(INJECTED_POST_ATTR);
  article.querySelector('.lb-post-admin-actions')?.remove();
}

export function canAccessIframeDocument(iframe: HTMLIFrameElement): boolean {
  try {
    return Boolean(iframe.contentDocument?.body);
  } catch {
    return false;
  }
}

function ensureAdminStyles(doc: Document): void {
  if (!doc.getElementById(PREVIEW_EMBED_ADMIN_STYLE_ID)) {
    const style = doc.createElement('style');
    style.id = PREVIEW_EMBED_ADMIN_STYLE_ID;
    style.textContent = ADMIN_TOOLBAR_CSS;
    doc.head.appendChild(style);
  }
  if (!doc.getElementById(PREVIEW_EMBED_MOBILE_STYLE_ID)) {
    const mobile = doc.createElement('style');
    mobile.id = PREVIEW_EMBED_MOBILE_STYLE_ID;
    mobile.textContent = EMBED_MOBILE_CHROME_CSS;
    doc.head.appendChild(mobile);
  }
}

function actionButton(
  doc: Document,
  options: {
    action: string;
    label: string;
    html: string;
    className?: string;
    active?: boolean;
    onClick: () => void;
  },
): HTMLButtonElement {
  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = `lb-post-admin-actions__btn${options.className ? ` ${options.className}` : ''}${options.active ? ' lb-post-admin-actions__btn--active' : ''}`;
  btn.dataset.action = options.action;
  btn.title = options.label;
  btn.setAttribute('aria-label', options.label);
  btn.innerHTML = options.html;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    options.onClick();
  });
  return btn;
}

function buildToolbar(
  doc: Document,
  post: Post,
  postId: string,
  handlers: PreviewEmbedHandlers,
): HTMLDivElement {
  const toolbar = doc.createElement('div');
  toolbar.className = 'lb-post-admin-actions';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Plasing-aksies');

  if (handlers.allowPinHighlight && handlers.onTogglePin) {
    toolbar.appendChild(
      actionButton(doc, {
        action: 'pin',
        label: post.sticky ? 'Ontspeld' : 'Speld vas',
        html: ICONS.pin,
        active: Boolean(post.sticky),
        onClick: () => handlers.onTogglePin?.(postId),
      }),
    );
  }

  if (handlers.allowPinHighlight && handlers.onToggleHighlight) {
    toolbar.appendChild(
      actionButton(doc, {
        action: 'highlight',
        label: post.lb_highlight ? 'Verwyder beklemtoning' : 'Beklemtoon',
        html: ICONS.star,
        active: Boolean(post.lb_highlight),
        onClick: () => handlers.onToggleHighlight?.(postId),
      }),
    );
  }

  toolbar.appendChild(
    actionButton(doc, {
      action: 'edit',
      label: 'Wysig',
      html: ICONS.pencil,
      onClick: () => handlers.onEdit(postId),
    }),
  );

  if (canShowPublishAction(post) && handlers.onPublish) {
    toolbar.appendChild(
      actionButton(doc, {
        action: 'publish',
        label: 'Publiseer',
        html: ICONS.send,
        onClick: () => handlers.onPublish?.(postId),
      }),
    );
  }

  if (handlers.onDelete) {
    toolbar.appendChild(
      actionButton(doc, {
        action: 'delete',
        label: 'Verwyder',
        html: ICONS.trash,
        className: 'lb-post-admin-actions__btn--danger',
        onClick: () => handlers.onDelete?.(postId),
      }),
    );
  }

  return toolbar;
}

function updateToolbarState(toolbar: Element, post: Post): void {
  const setActive = (action: string, active: boolean) => {
    const btn = toolbar.querySelector<HTMLButtonElement>(`[data-action="${action}"]`);
    if (!btn) return;
    btn.classList.toggle('lb-post-admin-actions__btn--active', active);
  };
  setActive('pin', Boolean(post.sticky));
  setActive('highlight', Boolean(post.lb_highlight));

  const pinBtn = toolbar.querySelector<HTMLButtonElement>('[data-action="pin"]');
  if (pinBtn) pinBtn.title = post.sticky ? 'Ontspeld' : 'Speld vas';
  const hlBtn = toolbar.querySelector<HTMLButtonElement>('[data-action="highlight"]');
  if (hlBtn) hlBtn.title = post.lb_highlight ? 'Verwyder beklemtoning' : 'Beklemtoon';

  const publishBtn = toolbar.querySelector('[data-action="publish"]');
  if (publishBtn && !canShowPublishAction(post)) {
    publishBtn.remove();
  }
}

function ensurePostToolbar(article: HTMLElement, handlers: PreviewEmbedHandlers): void {
  const postId = findPostIdInArticle(article);
  if (!postId) return;

  const post = resolvePostFromHandlers(handlers, postId);
  if (!post) {
    clearPostToolbar(article);
    return;
  }

  article.classList.add('lb-post--admin-preview');

  let toolbar = article.querySelector('.lb-post-admin-actions');
  const wantsPublish = canShowPublishAction(post) && Boolean(handlers.onPublish);
  const hasPublish = Boolean(toolbar?.querySelector('[data-action="publish"]'));

  if (!toolbar || wantsPublish !== hasPublish) {
    toolbar?.remove();
    toolbar = buildToolbar(article.ownerDocument, post, postId, handlers);
    article.appendChild(toolbar);
    article.setAttribute(INJECTED_POST_ATTR, '1');
    return;
  }

  updateToolbarState(toolbar, post);
}

function scanPosts(doc: Document, handlers: PreviewEmbedHandlers): void {
  const nodes = doc.querySelectorAll<HTMLElement>('article[data-post-id]');
  nodes.forEach((article) => ensurePostToolbar(article, handlers));
}

/**
 * Inject admin toolbars into a same-origin theme embed document.
 * Returns teardown for observer + injected DOM.
 */
export function syncEmbedEditorTools(
  doc: Document,
  handlers: PreviewEmbedHandlers,
): () => void {
  ensureAdminStyles(doc);
  scanPosts(doc, handlers);

  let scheduled = 0;
  const observer = new MutationObserver(() => {
    window.cancelAnimationFrame(scheduled);
    scheduled = window.requestAnimationFrame(() => scanPosts(doc, handlers));
  });
  observer.observe(doc.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    window.cancelAnimationFrame(scheduled);
    doc.querySelectorAll(`[${INJECTED_POST_ATTR}]`).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.classList.remove('lb-post--admin-preview');
      node.removeAttribute(INJECTED_POST_ATTR);
      node.querySelector('.lb-post-admin-actions')?.remove();
    });
  };
}

export function postsToMap(posts: Post[]): Map<string, Post> {
  return new Map(posts.map((p) => [p._id, p]));
}
