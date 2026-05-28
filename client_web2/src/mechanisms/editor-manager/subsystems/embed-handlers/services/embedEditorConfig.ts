/** Legacy `blog-edit.js` uses `coverMaxWidth: 350`. */
const DEFAULT_COVER_MAX_WIDTH = 350;

export interface EmbedEditorConfig {
  coverMaxWidth: number;
  facebookAppId: string;
}

export function getEmbedEditorConfig(): EmbedEditorConfig {
  const coverFromEnv = import.meta.env.VITE_EMBED_COVER_MAX_WIDTH as string | undefined;
  const coverMaxWidth = coverFromEnv ? Number(coverFromEnv) : DEFAULT_COVER_MAX_WIDTH;

  return {
    coverMaxWidth: Number.isFinite(coverMaxWidth) ? coverMaxWidth : DEFAULT_COVER_MAX_WIDTH,
    facebookAppId: String(import.meta.env.VITE_FACEBOOK_APP_ID ?? '').trim(),
  };
}
