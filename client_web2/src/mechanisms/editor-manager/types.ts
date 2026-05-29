import type { Blog, Freetype, Post, PostItem, TimelineSort } from '@/mechanisms/liveblog-api';

export type { Blog, Post, PostItem, TimelineSort };

export type EditorPanel =
  | 'editor'
  | 'timeline'
  | 'contributions'
  | 'scheduled'
  | 'drafts'
  | 'ingest'
  | 'incoming-syndication'
  | 'comments';

/** Layout for composer + live preview (Maroela article-editor parity). */
export type EditorViewMode = 'edit' | 'split' | 'preview';

export type PreviewDeviceMode = 'desktop' | 'tablet' | 'mobile';

export type PreviewDeviceOrientation = 'portrait' | 'landscape';

export type SirTrevorBlockType =
  | 'Text'
  | 'Image'
  | 'Embed'
  | 'Quote'
  | 'Comment'
  | 'Poll'
  | 'Scorecard'
  | 'Video';

export interface SirTrevorBlock {
  type: SirTrevorBlockType;
  data: Record<string, unknown>;
}

export type EditorPostType = 'Default' | Freetype;

export interface ComposerState {
  blocks: SirTrevorBlock[];
  sticky: boolean;
  highlight: boolean;
  tags: string[];
  scheduleEnabled: boolean;
  scheduledDate: string | null;
  isDirty: boolean;
  currentPost: Post | null;
  selectedPostType: EditorPostType;
  freetypeData: Record<string, unknown>;
}

export interface TimelineState {
  blogId: string;
  panel: EditorPanel;
  status: string;
  sort: TimelineSort;
  sticky?: boolean;
  highlight: boolean;
  pages: Post[][];
  meta: { total: number; max_results: number; page: number };
  isLoading: boolean;
  error: Error | null;
}
