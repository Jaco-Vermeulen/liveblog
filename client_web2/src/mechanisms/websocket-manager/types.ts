import type { Post } from '@/mechanisms/liveblog-api';

export type WsConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

/** Legacy EventNames — stable string values from server */
export enum LiveblogWsEvent {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Blog = 'blog',
  Posts = 'posts',
  EmbedGenerationError = 'embed_generation_error',
  RemoveTimelinePost = 'removing_timeline_post',
  InstanceSettingsUpdated = 'instance_settings:updated',
}

export interface BlogEventPayload {
  blog_id: string;
  published?: number;
  public_url?: string;
}

/** Full post on create/update; delete notifications use `{ post_id, blog }`. */
export type PostsNotificationEntry = Post | { post_id: string; blog?: string };

export interface PostsEventPayload {
  posts: PostsNotificationEntry[];
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
  scheduled_done?: boolean;
  syndicated?: boolean;
}

export interface EmbedGenerationErrorPayload {
  blog_id: string;
  error: string;
  theme_name?: string;
}

export interface RemoveTimelinePostPayload {
  post: Post;
}

export type LiveblogWsPayloadMap = {
  [LiveblogWsEvent.Blog]: BlogEventPayload;
  [LiveblogWsEvent.Posts]: PostsEventPayload;
  [LiveblogWsEvent.EmbedGenerationError]: EmbedGenerationErrorPayload;
  [LiveblogWsEvent.RemoveTimelinePost]: RemoveTimelinePostPayload;
  [LiveblogWsEvent.Connected]: undefined;
  [LiveblogWsEvent.Disconnected]: undefined;
  [LiveblogWsEvent.InstanceSettingsUpdated]: { settings?: Record<string, unknown> };
};

/** Superdesk notification wire format (liveblog/superdesk v1.17) */
export interface SuperdeskWsMessage {
  event: string;
  extra?: unknown;
}

export interface WebSocketManager {
  getState(): WsConnectionState;
  connect(url?: string): Promise<void>;
  disconnect(): void;
  subscribe<E extends LiveblogWsEvent>(
    event: E,
    handler: (payload: LiveblogWsPayloadMap[E]) => void,
  ): () => void;
  subscribeAll(handler: (event: LiveblogWsEvent, payload: unknown) => void): () => void;
  /** Superdesk menu notifications — activity, user:mention, etc. */
  subscribeServerEvent(event: string, handler: (extra: unknown) => void): () => void;
  /** React integration — notified on connection state changes */
  onStateChange(listener: () => void): () => void;
}
