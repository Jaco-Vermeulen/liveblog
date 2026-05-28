import { describe, expect, it } from 'vitest';
import { composerToPreviewItems, previewAuthorLabel } from './composerPreview';

describe('composerPreview', () => {
  it('maps composer blocks to preview items', () => {
    const items = composerToPreviewItems({
      blocks: [{ type: 'Text', data: { text: 'Live update' } }],
      sticky: false,
      highlight: false,
      scheduleEnabled: false,
      scheduledDate: null,
      isDirty: true,
      currentPost: null,
      selectedPostType: 'Default',
      freetypeData: {},
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.text).toBe('Live update');
  });

  it('returns empty list when draft has no content', () => {
    const items = composerToPreviewItems({
      blocks: [{ type: 'Text', data: { text: '' } }],
      sticky: false,
      highlight: false,
      scheduleEnabled: false,
      scheduledDate: null,
      isDirty: false,
      currentPost: null,
      selectedPostType: 'Default',
      freetypeData: {},
    });
    expect(items).toHaveLength(0);
  });

  it('falls back author label', () => {
    expect(previewAuthorLabel(null)).toBe('Redakteur');
    expect(previewAuthorLabel({ display_name: 'Jaco' })).toBe('Jaco');
    expect(previewAuthorLabel({ username: 'jaco' })).toBe('jaco');
  });
});
