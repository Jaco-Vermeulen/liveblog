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
import { AF } from '@/copy';
import type { EditorPanel } from '../types';

export interface EditorPanelConfig {
  id: EditorPanel;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  enabled: boolean;
}

const P = AF.editor.panels_config;

export const EDITOR_PANELS: EditorPanelConfig[] = [
  { id: 'editor', label: P.editor, shortLabel: P.editorShort, icon: Pencil, enabled: true },
  { id: 'timeline', label: P.timeline, shortLabel: P.timelineShort, icon: LayoutList, enabled: true },
  {
    id: 'contributions',
    label: P.contributions,
    shortLabel: P.contributions,
    icon: Inbox,
    enabled: true,
  },
  {
    id: 'scheduled',
    label: P.scheduled,
    shortLabel: P.scheduledShort,
    icon: CalendarClock,
    enabled: true,
  },
  { id: 'drafts', label: P.drafts, shortLabel: P.drafts, icon: Archive, enabled: true },
  {
    id: 'comments',
    label: P.comments,
    shortLabel: P.comments,
    icon: MessageCircle,
    enabled: true,
  },
  { id: 'ingest', label: P.ingest, shortLabel: P.ingestShort, icon: Download, enabled: false },
  {
    id: 'incoming-syndication',
    label: P.syndication,
    shortLabel: P.syndication,
    icon: Radio,
    enabled: false,
  },
];
