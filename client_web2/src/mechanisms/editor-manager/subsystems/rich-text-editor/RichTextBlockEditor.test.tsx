import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import { RICH_TEXT_COMPACT_MIN_WIDTH } from './useRichTextCompactToolbar';

const resizeObservers: ResizeObserverMock[] = [];

class ResizeObserverMock {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeObservers.push(this);
  }

  observe(target: Element) {
    this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }

  unobserve() {}

  disconnect() {}
}

function setEditorWidth(width: number) {
  const root = document.querySelector('.m-rich-text-editor') as HTMLElement;
  Object.defineProperty(root, 'clientWidth', {
    configurable: true,
    value: width,
  });
  for (const observer of resizeObservers) {
    observer.observe(root);
  }
}

beforeEach(() => {
  resizeObservers.length = 0;
  window.ResizeObserver = ResizeObserverMock;
});

afterEach(() => {
  cleanup();
  window.getSelection()?.removeAllRanges();
  vi.restoreAllMocks();
});

describe('RichTextBlockEditor', () => {
  it('updates displayed content when value changes while editor is focused', () => {
    const { rerender } = render(
      <RichTextBlockEditor value="<p>First post</p>" onChange={() => {}} />,
    );

    const body = document.querySelector('.m-rich-text-editor__body') as HTMLDivElement;
    expect(body).not.toBeNull();
    body.focus();
    expect(body.innerHTML).toContain('First post');

    rerender(<RichTextBlockEditor value="<p>Second post</p>" onChange={() => {}} />);

    expect(body.innerHTML).toContain('Second post');
    expect(body.innerHTML).not.toContain('First post');
  });

  it('clears content when value changes to empty while focused', () => {
    const { rerender } = render(
      <RichTextBlockEditor value="<p>Published post</p>" onChange={() => {}} />,
    );

    const body = document.querySelector('.m-rich-text-editor__body') as HTMLDivElement;
    body.focus();

    rerender(<RichTextBlockEditor value="" onChange={() => {}} />);

    expect(body.textContent?.trim()).toBe('');
  });

  it('marks the link toolbar button active when the caret is on linked text', () => {
    render(
      <RichTextBlockEditor
        value='<p>Visit <a href="https://example.com">our site</a></p>'
        onChange={() => {}}
      />,
    );

    setEditorWidth(RICH_TEXT_COMPACT_MIN_WIDTH + 40);

    const body = document.querySelector('.m-rich-text-editor__body') as HTMLDivElement;
    const link = body.querySelector('a')!;
    const textNode = link.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, 2);
    range.collapse(true);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    body.focus();
    fireEvent.mouseUp(body);

    const linkToolbarBtn = document.querySelector(
      'button[title="Skakel"]',
    ) as HTMLButtonElement;
    expect(linkToolbarBtn).toHaveClass('m-rich-text-editor__btn--active');
    expect(linkToolbarBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the overflow formatting menu when the editor is narrower than the compact threshold', () => {
    render(<RichTextBlockEditor value="" onChange={() => {}} />);

    setEditorWidth(RICH_TEXT_COMPACT_MIN_WIDTH - 1);

    expect(document.querySelector('.m-rich-text-editor')).toHaveAttribute('data-compact', 'true');
    expect(document.querySelector('.m-rich-text-editor__menu-toggle')).not.toBeNull();
    expect(document.querySelector('.m-rich-text-editor__overflow-panel')).toBeNull();

    fireEvent.click(document.querySelector('.m-rich-text-editor__menu-toggle')!);
    expect(document.querySelector('.m-rich-text-editor__overflow-panel')).not.toBeNull();
  });

  it('opens a custom context menu on right-click with clipboard and formatting actions', () => {
    render(<RichTextBlockEditor value="<p>Hello world</p>" onChange={() => {}} />);

    const body = document.querySelector('.m-rich-text-editor__body') as HTMLDivElement;
    fireEvent.contextMenu(body, { clientX: 120, clientY: 80 });

    const menu = document.querySelector('.m-rich-text-editor__context-menu');
    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(menu?.textContent).toContain('Cut');
    expect(menu?.textContent).toContain('Copy');
    expect(menu?.textContent).toContain('Paste');
    expect(menu?.textContent).toContain('Bold');
  });
});
