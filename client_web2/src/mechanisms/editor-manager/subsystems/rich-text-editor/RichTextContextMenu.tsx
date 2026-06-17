import { useEffect, useRef } from 'react';

/** English labels for the editor context menu (toolbar copy stays Afrikaans for now). */
const MENU = {
  ariaLabel: 'Edit menu',
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  link: 'Link',
  unlink: 'Remove link',
  clearFormat: 'Clear formatting',
} as const;
export type RichTextContextMenuState = {
  x: number;
  y: number;
};

export type RichTextContextMenuActions = {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  linkActive: boolean;
  applyUndo: () => void;
  applyRedo: () => void;
  applyCut: () => void;
  applyCopy: () => void;
  applyPaste: () => void;
  applyBold: () => void;
  applyItalic: () => void;
  applyUnderline: () => void;
  insertLink: () => void;
  applyUnlink: () => void;
  applyClearFormat: () => void;
};

type RichTextContextMenuProps = {
  menu: RichTextContextMenuState;
  actions: RichTextContextMenuActions;
  onClose: () => void;
};

type MenuItem =
  | { type: 'separator' }
  | {
      type: 'item';
      label: string;
      shortcut?: string;
      disabled?: boolean;
      onSelect: () => void;
    };

function ContextMenuItem({
  label,
  shortcut,
  disabled,
  onSelect,
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="m-rich-text-editor__context-item"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        if (!disabled) onSelect();
      }}
    >
      <span>{label}</span>
      {shortcut ? <span className="m-rich-text-editor__context-shortcut">{shortcut}</span> : null}
    </button>
  );
}

export function RichTextContextMenu({ menu, actions, onClose }: RichTextContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const onScroll = () => onClose();

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [onClose]);

  useEffect(() => {
    const node = menuRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const padding = 8;
    let left = menu.x;
    let top = menu.y;

    if (left + rect.width > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - rect.width - padding);
    }
    if (top + rect.height > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
  }, [menu.x, menu.y]);

  const items: MenuItem[] = [
    {
      type: 'item',
      label: MENU.undo,
      shortcut: 'Ctrl+Z',
      disabled: !actions.canUndo,
      onSelect: actions.applyUndo,
    },
    {
      type: 'item',
      label: MENU.redo,
      shortcut: 'Ctrl+Y',
      disabled: !actions.canRedo,
      onSelect: actions.applyRedo,
    },
    { type: 'separator' },
    {
      type: 'item',
      label: MENU.cut,
      shortcut: 'Ctrl+X',
      disabled: !actions.hasSelection,
      onSelect: actions.applyCut,
    },
    {
      type: 'item',
      label: MENU.copy,
      shortcut: 'Ctrl+C',
      disabled: !actions.hasSelection,
      onSelect: actions.applyCopy,
    },
    {
      type: 'item',
      label: MENU.paste,
      shortcut: 'Ctrl+V',
      onSelect: actions.applyPaste,
    },
    { type: 'separator' },
    {
      type: 'item',
      label: MENU.bold,
      shortcut: 'Ctrl+B',
      disabled: !actions.hasSelection,
      onSelect: actions.applyBold,
    },
    {
      type: 'item',
      label: MENU.italic,
      shortcut: 'Ctrl+I',
      disabled: !actions.hasSelection,
      onSelect: actions.applyItalic,
    },
    {
      type: 'item',
      label: MENU.underline,
      shortcut: 'Ctrl+U',
      disabled: !actions.hasSelection,
      onSelect: actions.applyUnderline,
    },
    { type: 'separator' },
    {
      type: 'item',
      label: MENU.link,
      disabled: !actions.hasSelection && !actions.linkActive,
      onSelect: actions.insertLink,
    },
    {
      type: 'item',
      label: MENU.unlink,
      disabled: !actions.linkActive,
      onSelect: actions.applyUnlink,
    },
    {
      type: 'item',
      label: MENU.clearFormat,
      disabled: !actions.hasSelection,
      onSelect: actions.applyClearFormat,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="m-rich-text-editor__context-menu"
      role="menu"
      aria-label={MENU.ariaLabel}
      style={{ left: menu.x, top: menu.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) =>
        item.type === 'separator' ? (
          <div key={`sep-${index}`} className="m-rich-text-editor__context-separator" role="separator" />
        ) : (
          <ContextMenuItem
            key={item.label}
            label={item.label}
            shortcut={item.shortcut}
            disabled={item.disabled}
            onSelect={() => {
              item.onSelect();
              onClose();
            }}
          />
        ),
      )}
    </div>
  );
}
