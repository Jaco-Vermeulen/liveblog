import { afterEach, describe, expect, it } from 'vitest';
import { isSelectionInLink } from './richTextSelection';

function selectNodeContents(node: Node) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function placeCaret(node: Node, offset: number) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection()?.removeAllRanges();
});

describe('isSelectionInLink', () => {
  it('returns true when the caret is inside a link', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<p>Hello <a href="https://example.com">world</a>!</p>';
    document.body.appendChild(editor);

    const linkText = editor.querySelector('a')!.firstChild!;
    placeCaret(linkText, 2);

    expect(isSelectionInLink(editor)).toBe(true);
  });

  it('returns false when the caret is outside a link', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<p>Hello <a href="https://example.com">world</a>!</p>';
    document.body.appendChild(editor);

    const paragraphText = editor.querySelector('p')!.firstChild!;
    placeCaret(paragraphText, 2);

    expect(isSelectionInLink(editor)).toBe(false);
  });

  it('returns true when the selection spans linked text', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<p>See <a href="https://example.com">our site</a> today</p>';
    document.body.appendChild(editor);

    selectNodeContents(editor.querySelector('a')!);

    expect(isSelectionInLink(editor)).toBe(true);
  });
});
