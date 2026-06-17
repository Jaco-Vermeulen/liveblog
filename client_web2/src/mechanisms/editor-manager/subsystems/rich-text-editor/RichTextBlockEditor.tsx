import { Menu } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AF } from '@/copy';
import {
  RichTextContextMenu,
  type RichTextContextMenuState,
} from './RichTextContextMenu';
import { RichTextToolbarGroups, type RichTextToolbarActions } from './RichTextToolbarGroups';
import { normalizeRichTextHtml } from './richTextHtml';
import { isSelectionInLink } from './richTextSelection';
import { useRichTextCompactToolbar } from './useRichTextCompactToolbar';

const R = AF.editor.richText;

const MAX_UNDO = 100;

export interface RichTextBlockEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
}

function hasNonCollapsedSelection(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  return root.contains(range.commonAncestorContainer);
}

export function RichTextBlockEditor({
  value,
  onChange,
  onBlur,
  placeholder = AF.editor.writePost,
  id,
}: RichTextBlockEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const overflowPanelRef = useRef<HTMLDivElement | null>(null);
  const undoPastRef = useRef<string[]>([]);
  const undoFutureRef = useRef<string[]>([]);
  const lastHtmlRef = useRef('');
  const lastPropValueRef = useRef('');
  const applyingHistoryRef = useRef(false);
  const skipNextInputUndoRef = useRef(false);
  const [linkActive, setLinkActive] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<RichTextContextMenuState | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const compactToolbar = useRichTextCompactToolbar(rootRef);
  const normalizedValue = normalizeRichTextHtml(value);

  const refreshEditorState = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    setLinkActive(isSelectionInLink(el));
    setHasSelection(hasNonCollapsedSelection(el));
    setCanUndo(undoPastRef.current.length > 0);
    setCanRedo(undoFutureRef.current.length > 0);
  }, []);

  const commitChange = useCallback(
    (html: string) => {
      const next = normalizeRichTextHtml(html);
      lastHtmlRef.current = next;
      onChange(next);
      refreshEditorState();
    },
    [onChange, refreshEditorState],
  );

  const applyUndo = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (undoPastRef.current.length === 0) {
      document.execCommand('undo');
      document.execCommand('styleWithCSS', false, 'false');
      commitChange(el.innerHTML);
      return;
    }
    const current = el.innerHTML;
    const prev = undoPastRef.current.pop()!;
    undoFutureRef.current.push(current);
    applyingHistoryRef.current = true;
    el.innerHTML = prev;
    commitChange(prev);
    applyingHistoryRef.current = false;
  }, [commitChange]);

  const applyRedo = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (undoFutureRef.current.length === 0) {
      document.execCommand('redo');
      document.execCommand('styleWithCSS', false, 'false');
      commitChange(el.innerHTML);
      return;
    }
    const current = el.innerHTML;
    const next = undoFutureRef.current.pop()!;
    undoPastRef.current.push(current);
    if (undoPastRef.current.length > MAX_UNDO) undoPastRef.current.shift();
    applyingHistoryRef.current = true;
    el.innerHTML = next;
    commitChange(next);
    applyingHistoryRef.current = false;
  }, [commitChange]);

  const recordCommandChange = useCallback(
    (before: string, after: string) => {
      if (after === before) return;
      undoPastRef.current.push(before);
      if (undoPastRef.current.length > MAX_UNDO) undoPastRef.current.shift();
      undoFutureRef.current = [];
      lastHtmlRef.current = after;
      skipNextInputUndoRef.current = true;
      requestAnimationFrame(() => {
        skipNextInputUndoRef.current = false;
      });
      commitChange(after);
    },
    [commitChange],
  );

  const applyEditorCommand = useCallback(
    (command: string, cmdValue?: string, requireSelection = false) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      if (requireSelection) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      }
      const before = el.innerHTML;
      document.execCommand(command, false, cmdValue);
      document.execCommand('styleWithCSS', false, 'false');
      recordCommandChange(before, el.innerHTML);
    },
    [recordCommandChange],
  );

  const applyAlignment = useCallback(
    (align: 'left' | 'center' | 'right' | 'justify') => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      const before = el.innerHTML;
      const cmd =
        align === 'left'
          ? 'justifyLeft'
          : align === 'center'
            ? 'justifyCenter'
            : align === 'right'
              ? 'justifyRight'
              : 'justifyFull';
      document.execCommand(cmd, false);
      document.execCommand('styleWithCSS', false, 'false');
      recordCommandChange(before, el.innerHTML);
    },
    [recordCommandChange],
  );

  const insertLink = useCallback(() => {
    const url = window.prompt(R.linkUrlPrompt);
    if (!url?.trim()) return;
    applyEditorCommand('createLink', url.trim());
  }, [applyEditorCommand]);

  const applyClipboardCommand = useCallback(
    async (command: 'cut' | 'copy' | 'paste') => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      const before = el.innerHTML;

      if (command === 'paste') {
        try {
          if (document.execCommand('paste')) {
            recordCommandChange(before, el.innerHTML);
            return;
          }
        } catch {
          /* execCommand paste is often blocked */
        }

        try {
          const text = await navigator.clipboard.readText();
          if (!text) return;
          document.execCommand('insertText', false, text);
          document.execCommand('styleWithCSS', false, 'false');
          recordCommandChange(before, el.innerHTML);
        } catch {
          /* clipboard permission denied */
        }
        return;
      }

      document.execCommand(command, false);
      document.execCommand('styleWithCSS', false, 'false');
      recordCommandChange(before, el.innerHTML);
    },
    [recordCommandChange],
  );

  const toolbarActions = useMemo<RichTextToolbarActions>(
    () => ({
      applyBold: () => applyEditorCommand('bold', undefined, true),
      applyItalic: () => applyEditorCommand('italic', undefined, true),
      applyUnderline: () => applyEditorCommand('underline', undefined, true),
      applyH2: () => applyEditorCommand('formatBlock', 'H2'),
      applyH3: () => applyEditorCommand('formatBlock', 'H3'),
      applyParagraph: () => applyEditorCommand('formatBlock', 'P'),
      applyBulletList: () => applyEditorCommand('insertUnorderedList'),
      applyNumberedList: () => applyEditorCommand('insertOrderedList'),
      applyQuote: () => applyEditorCommand('formatBlock', 'BLOCKQUOTE'),
      applyAlignLeft: () => applyAlignment('left'),
      applyAlignCenter: () => applyAlignment('center'),
      applyAlignRight: () => applyAlignment('right'),
      applyAlignJustify: () => applyAlignment('justify'),
      insertLink,
      applyUnlink: () => applyEditorCommand('unlink'),
      applyClearFormat: () => applyEditorCommand('removeFormat'),
      applyUndo,
      applyRedo,
      linkActive,
    }),
    [applyAlignment, applyEditorCommand, applyRedo, applyUndo, insertLink, linkActive],
  );

  const contextMenuActions = useMemo(
    () => ({
      canUndo,
      canRedo,
      hasSelection,
      linkActive,
      applyUndo,
      applyRedo,
      applyCut: () => void applyClipboardCommand('cut'),
      applyCopy: () => void applyClipboardCommand('copy'),
      applyPaste: () => void applyClipboardCommand('paste'),
      applyBold: () => applyEditorCommand('bold', undefined, true),
      applyItalic: () => applyEditorCommand('italic', undefined, true),
      applyUnderline: () => applyEditorCommand('underline', undefined, true),
      insertLink,
      applyUnlink: () => applyEditorCommand('unlink'),
      applyClearFormat: () => applyEditorCommand('removeFormat'),
    }),
    [
      applyClipboardCommand,
      applyEditorCommand,
      applyRedo,
      applyUndo,
      canRedo,
      canUndo,
      hasSelection,
      insertLink,
      linkActive,
    ],
  );

  const onInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      const next = el.innerHTML;
      if (applyingHistoryRef.current) {
        commitChange(next);
        return;
      }
      if (skipNextInputUndoRef.current) {
        commitChange(next);
        return;
      }
      const prev = lastHtmlRef.current;
      if (next === prev) return;
      undoPastRef.current.push(prev);
      if (undoPastRef.current.length > MAX_UNDO) undoPastRef.current.shift();
      undoFutureRef.current = [];
      commitChange(next);
    },
    [commitChange],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        applyEditorCommand('bold', undefined, true);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        applyEditorCommand('italic', undefined, true);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        applyEditorCommand('underline', undefined, true);
        return;
      }
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (mod && key === 'z' && !event.shiftKey && undoPastRef.current.length > 0) {
        event.preventDefault();
        applyUndo();
        return;
      }
      if (mod && (key === 'y' || (key === 'z' && event.shiftKey)) && undoFutureRef.current.length > 0) {
        event.preventDefault();
        applyRedo();
      }
    },
    [applyEditorCommand, applyRedo, applyUndo],
  );

  const onContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      setFormatMenuOpen(false);
      setContextMenu({ x: event.clientX, y: event.clientY });
      refreshEditorState();
    },
    [refreshEditorState],
  );

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const display = normalizedValue || '';
    const propChanged = normalizedValue !== lastPropValueRef.current;
    lastPropValueRef.current = normalizedValue;

    if (!propChanged && document.activeElement === el) {
      lastHtmlRef.current = el.innerHTML;
      return;
    }

    if (el.innerHTML !== display) {
      el.innerHTML = display;
      undoPastRef.current = [];
      undoFutureRef.current = [];
      refreshEditorState();
    }
    lastHtmlRef.current = el.innerHTML;
  }, [normalizedValue, refreshEditorState]);

  useEffect(() => {
    const onSelectionChange = () => {
      const el = editorRef.current;
      if (!el) return;
      if (document.activeElement === el || el.contains(document.activeElement)) {
        refreshEditorState();
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [refreshEditorState]);

  useEffect(() => {
    if (!compactToolbar) setFormatMenuOpen(false);
  }, [compactToolbar]);

  useEffect(() => {
    if (!formatMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (overflowPanelRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.('.m-rich-text-editor__menu-toggle')) return;
      setFormatMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFormatMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [formatMenuOpen]);

  const showPlaceholder = !normalizedValue;

  return (
    <div
      ref={rootRef}
      className={`m-rich-text-editor${compactToolbar ? ' m-rich-text-editor--compact' : ''}`}
      data-compact={compactToolbar ? 'true' : 'false'}
    >
      <div
        className={`m-rich-text-editor__toolbar${compactToolbar ? ' m-rich-text-editor__toolbar--compact' : ''}`}
        role="toolbar"
        aria-label={R.toolbar}
      >
        {compactToolbar ? (
          <>
            <button
              type="button"
              className="m-rich-text-editor__menu-toggle"
              aria-expanded={formatMenuOpen}
              aria-controls="rich-text-format-panel"
              aria-label={formatMenuOpen ? R.closeFormatMenu : R.openFormatMenu}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFormatMenuOpen((open) => !open)}
            >
              <Menu className="m-rich-text-editor__menu-icon" aria-hidden />
              <span>{R.toolbar}</span>
            </button>
            {formatMenuOpen ? (
              <div
                id="rich-text-format-panel"
                ref={overflowPanelRef}
                className="m-rich-text-editor__overflow-panel"
              >
                <RichTextToolbarGroups actions={toolbarActions} />
              </div>
            ) : null}
          </>
        ) : (
          <RichTextToolbarGroups actions={toolbarActions} />
        )}
      </div>
      <div className="m-rich-text-editor__body-wrap">
        {showPlaceholder ? (
          <span className="m-rich-text-editor__placeholder" aria-hidden>
            {placeholder}
          </span>
        ) : null}
        <div
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          className="m-rich-text-editor__body"
          onInput={onInput}
          onBlur={(event) => {
            setLinkActive(false);
            setHasSelection(false);
            onBlur?.();
          }}
          onKeyDown={onKeyDown}
          onKeyUp={refreshEditorState}
          onMouseUp={refreshEditorState}
          onFocus={refreshEditorState}
          onContextMenu={onContextMenu}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) {
              event.preventDefault();
            }
          }}
        />
      </div>
      {contextMenu ? (
        <RichTextContextMenu
          menu={contextMenu}
          actions={contextMenuActions}
          onClose={() => setContextMenu(null)}
        />
      ) : null}
    </div>
  );
}
