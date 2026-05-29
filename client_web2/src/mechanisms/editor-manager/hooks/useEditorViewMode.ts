import { useCallback, useState } from 'react';
import type { EditorViewMode } from '../types';

function initialEditorViewMode(): EditorViewMode {
  return 'split';
}

export function useEditorViewMode() {
  const [viewMode, setViewMode] = useState<EditorViewMode>(initialEditorViewMode);

  const resetToEdit = useCallback(() => setViewMode('edit'), []);

  return { viewMode, setViewMode, resetToEdit };
}
