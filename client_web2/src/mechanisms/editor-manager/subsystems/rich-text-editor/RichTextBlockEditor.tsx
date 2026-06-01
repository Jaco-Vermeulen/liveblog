import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Type,
  Underline,
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { AF } from '@/copy';
import { normalizeRichTextHtml } from './richTextHtml';

const R = AF.editor.richText;

const MAX_UNDO = 100;

export interface RichTextBlockEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
}

function ToolbarGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="m-rich-text-editor__group">
      <div className="m-rich-text-editor__group-btns">{children}</div>
      <p className="m-rich-text-editor__group-label">{label}</p>
    </div>
  );
}

function ToolbarBtn({
  title,
  onClick,
  children,
  variant = 'icon',
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
  variant?: 'icon' | 'text';
}) {
  return (
    <button
      type="button"
      title={title}
      className={`m-rich-text-editor__btn m-rich-text-editor__btn--${variant}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RichTextBlockEditor({
  value,
  onChange,
  onBlur,
  placeholder = AF.editor.writePost,
  id,
}: RichTextBlockEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const undoPastRef = useRef<string[]>([]);
  const undoFutureRef = useRef<string[]>([]);
  const lastHtmlRef = useRef('');
  const applyingHistoryRef = useRef(false);
  const skipNextInputUndoRef = useRef(false);

  const normalizedValue = normalizeRichTextHtml(value);

  const commitChange = useCallback(
    (html: string) => {
      const next = normalizeRichTextHtml(html);
      lastHtmlRef.current = next;
      onChange(next);
    },
    [onChange],
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

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const display = normalizedValue || '';
    if (el.innerHTML !== display) {
      el.innerHTML = display;
      undoPastRef.current = [];
      undoFutureRef.current = [];
    }
    lastHtmlRef.current = el.innerHTML;
  }, [normalizedValue]);

  const showPlaceholder = !normalizedValue;

  return (
    <div className="m-rich-text-editor">
      <div className="m-rich-text-editor__toolbar" role="toolbar" aria-label={R.toolbar}>
          <ToolbarGroup label={R.font}>
            <ToolbarBtn title={R.bold} onClick={() => applyEditorCommand('bold', undefined, true)}>
              <Bold className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.italic} onClick={() => applyEditorCommand('italic', undefined, true)}>
              <Italic className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.underline} onClick={() => applyEditorCommand('underline', undefined, true)}>
              <Underline className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
          </ToolbarGroup>
          <ToolbarGroup label={R.style}>
            <ToolbarBtn title={R.h2} variant="text" onClick={() => applyEditorCommand('formatBlock', 'H2')}>
              H2
            </ToolbarBtn>
            <ToolbarBtn title={R.h3} variant="text" onClick={() => applyEditorCommand('formatBlock', 'H3')}>
              H3
            </ToolbarBtn>
            <ToolbarBtn title={R.paragraph} onClick={() => applyEditorCommand('formatBlock', 'P')}>
              <Type className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
          </ToolbarGroup>
          <ToolbarGroup label={R.paragraphGroup}>
            <ToolbarBtn title={R.bulletList} onClick={() => applyEditorCommand('insertUnorderedList')}>
              <List className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.numberedList} onClick={() => applyEditorCommand('insertOrderedList')}>
              <ListOrdered className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.quote} onClick={() => applyEditorCommand('formatBlock', 'BLOCKQUOTE')}>
              <Quote className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
          </ToolbarGroup>
          <ToolbarGroup label={R.align}>
            <ToolbarBtn title={R.left} onClick={() => applyAlignment('left')}>
              <AlignLeft className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.center} onClick={() => applyAlignment('center')}>
              <AlignCenter className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.right} onClick={() => applyAlignment('right')}>
              <AlignRight className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.justify} onClick={() => applyAlignment('justify')}>
              <AlignJustify className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
          </ToolbarGroup>
          <ToolbarGroup label={R.edit}>
            <ToolbarBtn title={R.link} onClick={insertLink}>
              <Link2 className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.unlink} onClick={() => applyEditorCommand('unlink')}>
              <Link2Off className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.clearFormat} onClick={() => applyEditorCommand('removeFormat')}>
              <RemoveFormatting className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
          </ToolbarGroup>
          <ToolbarGroup label={R.history}>
            <ToolbarBtn title={R.undo} onClick={applyUndo}>
              <Undo2 className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
            <ToolbarBtn title={R.redo} onClick={applyRedo}>
              <Redo2 className="m-rich-text-editor__icon" aria-hidden />
            </ToolbarBtn>
          </ToolbarGroup>
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
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
