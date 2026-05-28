import { describe, expect, it } from 'vitest';
import { metaForSave } from './mergeEmbedMeta';

describe('mergeEmbedMeta', () => {
  it('clears thumbnail when cover hidden', () => {
    const meta = metaForSave(
      {
        html: '<iframe></iframe>',
        provider_name: 'YouTube',
        thumbnail_url: 'https://example.com/thumb.jpg',
      },
      { coverHidden: true },
    );
    expect(meta.thumbnail_url).toBeUndefined();
  });

  it('merges title and instagram caption flag', () => {
    const meta = metaForSave(
      { provider_name: 'Instagram', original_url: 'https://instagram.com/p/x/' },
      { title: 'My title', showEmbedDescription: true },
    );
    expect(meta.title).toBe('My title');
    expect(meta.show_embed_description).toBe(true);
  });
});
