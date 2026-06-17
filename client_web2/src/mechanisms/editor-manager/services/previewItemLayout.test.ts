import { describe, expect, it } from 'vitest';
import type { PostItem } from '@/mechanisms/liveblog-api';
import { imagePreviewHtml, previewLbItemClass } from './previewItemLayout';

describe('previewItemLayout', () => {
  it('maps item types to theme lb-item classes', () => {
    expect(previewLbItemClass({ item_type: 'text', group_type: 'default' })).toBe('lb-item text');
    expect(
      previewLbItemClass({
        item_type: 'text',
        group_type: 'default',
        meta: { quote: true },
      }),
    ).toBe('lb-item quote');
    expect(
      previewLbItemClass({
        item_type: 'Scorecard',
        group_type: 'freetype',
        text: '<div></div>',
      }),
    ).toBe('lb-item Scorecard');
  });

  it('builds image html from renditions when text is a bare url', () => {
    const item: PostItem = {
      item_type: 'image',
      group_type: 'default',
      text: 'https://example.com/original.jpg',
      meta: {
        media: {
          renditions: {
            viewImage: { href: 'https://example.com/view.jpg' },
          },
        },
      },
    };

    expect(imagePreviewHtml(item)).toContain('https://example.com/view.jpg');
    expect(imagePreviewHtml(item)).toContain('<figure>');
  });

  it('returns existing html unchanged', () => {
    const item: PostItem = {
      item_type: 'image',
      group_type: 'default',
      text: '<figure><img src="https://example.com/a.jpg" /></figure>',
    };
    expect(imagePreviewHtml(item)).toBe(item.text);
  });
});
