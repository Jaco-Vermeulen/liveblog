import { createContext, useContext, type ReactNode } from 'react';
import type { StyleTabAction } from './actions';
import type { StylesTabState } from './types';

type StylesTabContextValue = {
  state: StylesTabState;
  dispatch: (action: StyleTabAction) => void;
};

const StylesTabContext = createContext<StylesTabContextValue | null>(null);

export function StylesTabProvider({
  value,
  children,
}: {
  value: StylesTabContextValue;
  children: ReactNode;
}) {
  return <StylesTabContext.Provider value={value}>{children}</StylesTabContext.Provider>;
}

export function useStylesTabContext(): StylesTabContextValue {
  const ctx = useContext(StylesTabContext);
  if (!ctx) {
    throw new Error('useStylesTabContext must be used within StylesTabProvider');
  }
  return ctx;
}
