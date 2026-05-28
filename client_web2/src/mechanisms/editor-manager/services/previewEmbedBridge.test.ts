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
  it('reads id from permalink anchor', () => {
    const article = document.createElement('article');
    article.className = 'lb-post list-group-item';
    article.innerHTML =
      '<div class="lb-post-permalink"><a href="/embed/x#y" id="post-abc12345">link</a></div>';
    expect(findPostIdInArticle(article)).toBe('post-abc12345');
  });

  it('returns null when id is too short', () => {
    const article = document.createElement('article');
    article.innerHTML = '<a id="short"></a>';
    expect(findPostIdInArticle(article)).toBeNull();
  });
});

describe('syncEmbedEditorTools', () => {
  it('injects toolbar with edit action', () => {
    const doc = document.implementation.createHTMLDocument('embed');
    doc.body.innerHTML = `
      <article class="lb-post list-group-item">
        <div class="lb-post-permalink"><a id="post-abcdefgh" href="#">#</a></div>
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
});
