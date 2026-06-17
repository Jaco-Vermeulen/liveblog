import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AF } from '@/copy';
import type { SirTrevorBlock } from '../types';
import { ComposerBlockList } from './ComposerBlockList';

function renderList(
  blocks: SirTrevorBlock[],
  onReorderBlock = vi.fn(),
) {
  return render(
    <ComposerBlockList
      blocks={blocks}
      blockIds={blocks.map((_, index) => `block-${index}`)}
      onRemoveBlock={vi.fn()}
      onRemoveBlockIfEmpty={vi.fn()}
      onUpdateBlock={vi.fn()}
      onReorderBlock={onReorderBlock}
      onUploadImage={vi.fn()}
    />,
  );
}

describe('ComposerBlockList', () => {
  afterEach(() => cleanup());

  it('does not show drag handles for a single block', () => {
    renderList([{ type: 'Text', data: { text: 'Hello' } }]);
    expect(screen.queryByTitle(AF.editor.dragBlock)).toBeNull();
  });

  it('reorders blocks when dropping onto another block', () => {
    const onReorderBlock = vi.fn();
    renderList(
      [
        { type: 'Embed', data: { url: 'https://example.com/embed' } },
        { type: 'Text', data: { text: 'Top text' } },
      ],
      onReorderBlock,
    );

    const dragHandles = screen.getAllByTitle(AF.editor.dragBlock);
    const embedBlock = screen.getByText(AF.editor.blocks.embed).closest('.m-editor-composer__block');
    expect(embedBlock).not.toBeNull();

    const dataTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(),
      getData: vi.fn(() => '1'),
    };

    fireEvent.dragStart(dragHandles[1]!, { dataTransfer });
    fireEvent.dragOver(embedBlock!, { dataTransfer });
    fireEvent.drop(embedBlock!, { dataTransfer });

    expect(onReorderBlock).toHaveBeenCalledWith(1, 0);
  });
});
