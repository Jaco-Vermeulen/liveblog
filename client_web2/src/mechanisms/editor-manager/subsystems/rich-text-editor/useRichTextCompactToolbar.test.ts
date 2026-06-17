import { describe, expect, it } from 'vitest';
import { RICH_TEXT_COMPACT_MIN_WIDTH } from './useRichTextCompactToolbar';

describe('useRichTextCompactToolbar', () => {
  it('uses a compact threshold wide enough for six toolbar groups', () => {
    expect(RICH_TEXT_COMPACT_MIN_WIDTH).toBeGreaterThanOrEqual(640);
  });
});
