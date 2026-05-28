import { useCallback, useState } from 'react';
import type { EditorViewMode } from '../types';

function initialEditorViewMode(): EditorViewMode {
  if (typeof window === 'undefined') return 'edit';
  return window.matchMedia('(min-width: 1024px)').matches ? 'split' : 'edit';
}

export function useEditorViewMode() {
  const [viewMode, setViewMode] = useState<EditorViewMode>(initialEditorViewMode);

  const resetToEdit = useCallback(() => setViewMode('edit'), []);

  return { viewMode, setViewMode, resetToEdit };
}
