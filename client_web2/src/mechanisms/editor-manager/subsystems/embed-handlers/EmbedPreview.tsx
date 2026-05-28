import { EmbedBlockEditor } from './components/EmbedBlockEditor';
import type { EmbedMeta } from './types';

export interface EmbedPreviewProps {
  url: string;
  embedMeta?: EmbedMeta | null;
  onChange?: (data: { url: string; embedMeta?: EmbedMeta | null }) => void;
}

/**
 * Composer embed field — resolves via Iframely when `onChange` is provided.
 * Read-only badge mode when used without onChange (deprecated).
 */
export function EmbedPreview({ url, embedMeta, onChange }: EmbedPreviewProps) {
  if (onChange) {
    return <EmbedBlockEditor url={url} embedMeta={embedMeta} onChange={onChange} />;
  }

  return <EmbedBlockEditor url={url} embedMeta={embedMeta} onChange={() => undefined} />;
}
