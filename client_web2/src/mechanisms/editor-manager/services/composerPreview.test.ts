import { describe, expect, it } from 'vitest';
import type { ComposerState } from '../types';
import { composerToPreviewItems, previewAuthorLabel } from './composerPreview';

function makeComposer(overrides: Partial<ComposerState> = {}): ComposerState {
  return {
    blocks: [{ type: 'Text', data: { text: '' } }],
    blockIds: ['block-1'],
    headline: '',
    showHeadline: false,
    featuredImageSource: { type: 'none' },
    sticky: false,
    highlight: false,
    tags: [],
    scheduleEnabled: false,
    scheduledDate: null,
    isDirty: false,
    currentPost: null,
    selectedPostType: 'Default',
    freetypeData: {},
    ...overrides,
  };
}

describe('composerPreview', () => {
  it('maps composer blocks to preview items', () => {
    const items = composerToPreviewItems(
      makeComposer({
        blocks: [{ type: 'Text', data: { text: 'Live update' } }],
        isDirty: true,
      }),
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.text).toBe('Live update');
  });

  it('returns empty list when draft has no content', () => {
    const items = composerToPreviewItems(makeComposer());
    expect(items).toHaveLength(0);
  });

  it('falls back author label', () => {
    expect(previewAuthorLabel(null)).toBe('Redakteur');
    expect(previewAuthorLabel({ display_name: 'Jaco' })).toBe('Jaco');
    expect(previewAuthorLabel({ username: 'jaco' })).toBe('jaco');
  });
});
