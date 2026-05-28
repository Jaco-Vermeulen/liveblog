import { describe, expect, it } from 'vitest';
import { canPreviewEmbed } from './canPreviewEmbed';

describe('canPreviewEmbed', () => {
  it('allows Twitter preview with URL only (widget render)', () => {
    expect(
      canPreviewEmbed({
        provider_name: 'Twitter',
        original_url: 'https://twitter.com/x/status/1',
      }),
    ).toBe(true);
  });

  it('allows html-based preview', () => {
    expect(
      canPreviewEmbed({
        html: '<iframe src="https://youtube.com/embed/1"></iframe>',
        provider_name: 'YouTube',
      }),
    ).toBe(true);
  });

  it('rejects empty meta', () => {
    expect(canPreviewEmbed(null)).toBe(false);
  });
});
