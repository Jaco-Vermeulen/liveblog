import { AF } from '@/copy';
import { useEffect, useState } from 'react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import {
  buildBlogslistIframeSnippet,
  fetchBlogslistEmbedUrl,
} from '@/mechanisms/liveblog-api';

export interface EmbedCodeModalProps {
  open: boolean;
  onClose(): void;
}

export function EmbedCodeModal({ open, onClose }: EmbedCodeModalProps) {
  const [snippet, setSnippet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetchBlogslistEmbedUrl()
      .then((url) => {
        if (!url) {
          setError(AF.blogs.embedNoUrl);
          return;
        }
        setSnippet(buildBlogslistIframeSnippet(url));
      })
      .catch(() => setError(AF.blogs.embedLoadError))
      .finally(() => setLoading(false));
  }, [open]);

  const copy = async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
  };

  return (
    <LbModal open={open} onClose={onClose} title={AF.blogs.embedListTitle} className="max-w-2xl">
      {loading && <LbSpinner tone="dark" />}
      {error && <LbAlert variant="error">{error}</LbAlert>}
      {snippet && (
        <>
          <textarea
            readOnly
            className="min-h-[120px] w-full rounded-lg border border-mar-border bg-mar-beige p-3 font-mono text-sm"
            value={snippet}
          />
          <div className="mt-4 flex justify-end">
            <LbButton type="button" variant="accent" onClick={copy}>
              Kopieer
            </LbButton>
          </div>
        </>
      )}
    </LbModal>
  );
}
