import { useContext } from 'react';
import { AppShellContext } from '../context/AppShellProvider';
import type { AppShellContextValue } from '../types';

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShell must be used within AppShellProvider');
  }
  return ctx;
}
