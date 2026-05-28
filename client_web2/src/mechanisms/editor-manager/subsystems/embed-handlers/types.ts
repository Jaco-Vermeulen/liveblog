/** oEmbed / Iframely response fields stored on post item meta (legacy parity). */
export interface EmbedMeta {
  url?: string;
  original_url?: string;
  html?: string;
  title?: string;
  description?: string;
  credit?: string;
  provider_name?: string;
  provider_url?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  type?: string;
  element_id?: string;
  show_embed_description?: boolean;
  liveblog_version?: string;
  [key: string]: unknown;
}

export interface OembedResponse {
  url?: string;
  html?: string;
  title?: string;
  description?: string;
  provider_name?: string;
  provider_url?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  type?: string;
  error_message?: string;
  data?: { error_message?: string };
}

export interface EmbedResolveOptions {
  maxWidth?: number;
}
