import { describe, expect, it, vi } from 'vitest';
import type { Post } from '@/mechanisms/liveblog-api';
import {
  findPostIdInArticle,
  postsToMap,
  syncEmbedEditorTools,
} from './previewEmbedBridge';

function mockPost(id: string, overrides: Partial<Post> = {}): Post {
  return {
    _id: id,
    post_status: 'open',
    sticky: false,
    lb_highlight: false,
    ...overrides,
  } as Post;
}

describe('findPostIdInArticle', () => {
  it('reads id from data-post-id on article', () => {
    const article = document.createElement('article');
    article.className = 'lb-post list-group-item';
    article.setAttribute('data-post-id', '6a1422edad6d7cc47db776ee');
    expect(findPostIdInArticle(article)).toBe('6a1422edad6d7cc47db776ee');
  });

  it('reads id from permalink anchor', () => {
    const article = document.createElement('article');
    article.className = 'lb-post list-group-item';
    article.innerHTML =
      '<div class="lb-post-permalink"><a href="/embed/x#y" id="post-abc12345">link</a></div>';
    expect(findPostIdInArticle(article)).toBe('post-abc12345');
  });

  it('returns null when only a non-permalink anchor is present', () => {
    const article = document.createElement('article');
    article.innerHTML = '<div class="items-container"><a id="short"></a></div>';
    expect(findPostIdInArticle(article)).toBeNull();
  });
});

describe('syncEmbedEditorTools', () => {
  it('injects toolbar with edit action', () => {
    const doc = document.implementation.createHTMLDocument('embed');
    doc.body.innerHTML = `
      <article class="lb-post list-group-item" data-post-id="post-abcdefgh">
      </article>
    `;

    const onEdit = vi.fn();
    const teardown = syncEmbedEditorTools(doc, {
      postsById: postsToMap([mockPost('post-abcdefgh')]),
      allowPinHighlight: true,
      onEdit,
      onTogglePin: vi.fn(),
      onToggleHighlight: vi.fn(),
    });

    const toolbar = doc.querySelector('.lb-post-admin-actions');
    expect(toolbar).toBeTruthy();
    expect(doc.getElementById('lb-admin-preview-tools')).toBeTruthy();

    const editBtn = doc.querySelector('[data-action="edit"]') as HTMLButtonElement;
    editBtn.click();
    expect(onEdit).toHaveBeenCalledWith('post-abcdefgh');

    teardown();
    expect(doc.querySelector('.lb-post-admin-actions')).toBeNull();
  });

  it('does not add publish on open posts', () => {
    const doc = document.implementation.createHTMLDocument('embed');
    doc.body.innerHTML = `
      <article class="lb-post list-group-item" data-post-id="post-openpost1">
      </article>
    `;

    const teardown = syncEmbedEditorTools(doc, {
      postsById: postsToMap([
        mockPost('post-openpost1', {
          post_status: 'open',
          published_date: new Date(Date.now() - 60_000).toISOString(),
        }),
      ]),
      allowPinHighlight: true,
      onEdit: vi.fn(),
      onPublish: vi.fn(),
    });

    expect(doc.querySelector('[data-action="publish"]')).toBeNull();
    teardown();
  });

  it('omits publish after a post is published', () => {
    const doc = document.implementation.createHTMLDocument('embed');
    doc.body.innerHTML = `
      <article class="lb-post list-group-item" data-post-id="post-draftpost">
      </article>
    `;

    const handlers = {
      postsById: postsToMap([
        mockPost('post-draftpost', { post_status: 'draft' }),
      ]),
      allowPinHighlight: false,
      onEdit: vi.fn(),
      onPublish: vi.fn(),
    };

    const teardown = syncEmbedEditorTools(doc, handlers);
    expect(doc.querySelector('[data-action="publish"]')).toBeTruthy();

    handlers.postsById = postsToMap([
      mockPost('post-draftpost', {
        post_status: 'open',
        published_date: new Date().toISOString(),
      }),
    ]);
    syncEmbedEditorTools(doc, handlers);

    expect(doc.querySelector('[data-action="publish"]')).toBeNull();
    teardown();
  });
});
