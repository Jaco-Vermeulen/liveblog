import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  CalendarClock,
  Download,
  Inbox,
  LayoutList,
  MessageCircle,
  Pencil,
  Radio,
} from 'lucide-react';
import type { EditorPanel } from '../types';

export interface EditorPanelConfig {
  id: EditorPanel;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  enabled: boolean;
}

export const EDITOR_PANELS: EditorPanelConfig[] = [
  { id: 'editor', label: 'Redigeerder', shortLabel: 'Redigeer', icon: Pencil, enabled: true },
  { id: 'timeline', label: 'Tydlyn', shortLabel: 'TL', icon: LayoutList, enabled: true },
  { id: 'contributions', label: 'Bydraes', shortLabel: 'Bydraes', icon: Inbox, enabled: true },
  { id: 'scheduled', label: 'Geskeduleer', shortLabel: 'Skedule', icon: CalendarClock, enabled: true },
  { id: 'drafts', label: 'Konsepte', shortLabel: 'Konsepte', icon: Archive, enabled: true },
  { id: 'comments', label: 'Kommentaar', shortLabel: 'Kommentaar', icon: MessageCircle, enabled: true },
  { id: 'ingest', label: 'Ingest', shortLabel: 'Inname', icon: Download, enabled: false },
  {
    id: 'incoming-syndication',
    label: 'Sindikasie',
    shortLabel: 'Sindikasie',
    icon: Radio,
    enabled: false,
  },
];
