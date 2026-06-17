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
import type { ReactNode } from 'react';
import { AF } from '@/copy';

const R = AF.editor.richText;

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
  active = false,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
  variant?: 'icon' | 'text';
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active || undefined}
      className={`m-rich-text-editor__btn m-rich-text-editor__btn--${variant}${active ? ' m-rich-text-editor__btn--active' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export type RichTextToolbarActions = {
  applyBold: () => void;
  applyItalic: () => void;
  applyUnderline: () => void;
  applyH2: () => void;
  applyH3: () => void;
  applyParagraph: () => void;
  applyBulletList: () => void;
  applyNumberedList: () => void;
  applyQuote: () => void;
  applyAlignLeft: () => void;
  applyAlignCenter: () => void;
  applyAlignRight: () => void;
  applyAlignJustify: () => void;
  insertLink: () => void;
  applyUnlink: () => void;
  applyClearFormat: () => void;
  applyUndo: () => void;
  applyRedo: () => void;
  linkActive: boolean;
};

export function RichTextToolbarGroups({ actions }: { actions: RichTextToolbarActions }) {
  return (
    <>
      <ToolbarGroup label={R.font}>
        <ToolbarBtn title={R.bold} onClick={actions.applyBold}>
          <Bold className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.italic} onClick={actions.applyItalic}>
          <Italic className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.underline} onClick={actions.applyUnderline}>
          <Underline className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
      </ToolbarGroup>
      <ToolbarGroup label={R.style}>
        <ToolbarBtn title={R.h2} variant="text" onClick={actions.applyH2}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title={R.h3} variant="text" onClick={actions.applyH3}>
          H3
        </ToolbarBtn>
        <ToolbarBtn title={R.paragraph} onClick={actions.applyParagraph}>
          <Type className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
      </ToolbarGroup>
      <ToolbarGroup label={R.paragraphGroup}>
        <ToolbarBtn title={R.bulletList} onClick={actions.applyBulletList}>
          <List className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.numberedList} onClick={actions.applyNumberedList}>
          <ListOrdered className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.quote} onClick={actions.applyQuote}>
          <Quote className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
      </ToolbarGroup>
      <ToolbarGroup label={R.align}>
        <ToolbarBtn title={R.left} onClick={actions.applyAlignLeft}>
          <AlignLeft className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.center} onClick={actions.applyAlignCenter}>
          <AlignCenter className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.right} onClick={actions.applyAlignRight}>
          <AlignRight className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.justify} onClick={actions.applyAlignJustify}>
          <AlignJustify className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
      </ToolbarGroup>
      <ToolbarGroup label={R.edit}>
        <ToolbarBtn title={R.link} onClick={actions.insertLink} active={actions.linkActive}>
          <Link2 className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.unlink} onClick={actions.applyUnlink}>
          <Link2Off className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.clearFormat} onClick={actions.applyClearFormat}>
          <RemoveFormatting className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
      </ToolbarGroup>
      <ToolbarGroup label={R.history}>
        <ToolbarBtn title={R.undo} onClick={actions.applyUndo}>
          <Undo2 className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
        <ToolbarBtn title={R.redo} onClick={actions.applyRedo}>
          <Redo2 className="m-rich-text-editor__icon" aria-hidden />
        </ToolbarBtn>
      </ToolbarGroup>
    </>
  );
}
