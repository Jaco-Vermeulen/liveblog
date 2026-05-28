import { Columns2, Eye, Pencil } from 'lucide-react';
import type { EditorViewMode } from '../types';

const MODES: { id: EditorViewMode; label: string; short: string; icon: typeof Pencil }[] = [
  { id: 'edit', label: 'Redigeer', short: 'Redigeer', icon: Pencil },
  { id: 'split', label: 'Verdeelde aansig', short: 'Verdeel', icon: Columns2 },
  { id: 'preview', label: 'Voorskou alleen', short: 'Voorskou', icon: Eye },
];

export interface EditorViewModeSwitchProps {
  mode: EditorViewMode;
  onChange: (mode: EditorViewMode) => void;
  disabled?: boolean;
}

export function EditorViewModeSwitch({ mode, onChange, disabled = false }: EditorViewModeSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Redigeer-uitleg"
      className="m-editor-view-switch"
    >
      {MODES.map((item) => {
        const Icon = item.icon;
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-pressed={active}
            className={`m-editor-view-switch__btn${active ? ' m-editor-view-switch__btn--active' : ''}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="m-editor-view-switch__label">{item.short}</span>
          </button>
        );
      })}
    </div>
  );
}
