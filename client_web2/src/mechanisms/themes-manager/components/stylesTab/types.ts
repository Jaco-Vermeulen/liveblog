import type {
  StyleSettings,
  ThemeStyleGroup,
  ThemeStyleOptionItem,
} from '@/mechanisms/liveblog-api';

export interface FontOption {
  value: string;
  label: string;
}

export interface GoogleFont {
  family: string;
  version: string;
  variant: unknown;
}

export interface GoogleFontData {
  kind: string;
  items: GoogleFont[];
}

export interface StylesTabProps {
  defaultSettings: StyleSettings;
  settings: StyleSettings;
  styleOptions: ThemeStyleGroup[];
  fontsOptions?: FontOption[];
  googleApiKey?: string;
  onChange: (settings: StyleSettings) => void;
}

export interface StyleOptionProps extends ThemeStyleOptionItem {
  value?: unknown;
  group: ThemeStyleGroup;
  onChange: (value: unknown) => void;
}

export type StylesTabState = {
  defaultSettings: StyleSettings;
  settings: StyleSettings;
  styleOptions: ThemeStyleGroup[];
  fontsOptions?: FontOption[];
};
