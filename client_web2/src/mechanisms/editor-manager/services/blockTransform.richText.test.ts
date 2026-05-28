import { describe, expect, it } from 'vitest';
import { blocksToPostItems, isBlockEmpty } from './blockTransform';
import type { SirTrevorBlock } from '../types';

describe('blockTransform rich text', () => {
  it('treats empty HTML as empty block', () => {
    const block: SirTrevorBlock = { type: 'Text', data: { text: '<br>' } };
    expect(isBlockEmpty(block)).toBe(true);
    expect(blocksToPostItems([block])).toEqual([]);
  });

  it('keeps non-empty HTML text items', () => {
    const block: SirTrevorBlock = { type: 'Text', data: { text: '<p>Hello</p>' } };
    expect(isBlockEmpty(block)).toBe(false);
    expect(blocksToPostItems([block])[0]?.text).toBe('<p>Hello</p>');
  });
});
