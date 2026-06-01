import { AF } from '@/copy';
import { LbButton } from '@/components/ui/LbButton';

const O = AF.editor.output;
import { LbModal } from '@/components/ui/LbModal';
import type { Blog, Output } from '@/mechanisms/liveblog-api';

export interface OutputEmbedCodeModalProps {
  open: boolean;
  blog: Blog;
  output: Output | null;
  onClose(): void;
}

function buildEmbedSnippet(publicUrl: string): string {
  const script = `${window.location.origin}/embed.js`;
  return `<script src="${script}" defer></script>
<iframe id="liveblog-iframe" width="100%" height="715" src="${publicUrl}" frameborder="0" allowfullscreen></iframe>`;
}

export function OutputEmbedCodeModal({ open, blog, output, onClose }: OutputEmbedCodeModalProps) {
  const publicUrl =
    output?._id && blog.public_urls?.output
      ? blog.public_urls.output[output._id]
      : blog.public_url ?? '';

  const snippet = publicUrl ? buildEmbedSnippet(publicUrl) : '';

  const copy = async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
  };

  return (
    <LbModal
      open={open}
      onClose={onClose}
      title={output ? O.embedCodeFor(output.name) : O.embedCode}
      className="max-w-2xl"
    >
      {!publicUrl && (
        <p className="text-mar-muted text-sm">{O.noPublicUrl}</p>
      )}
      {snippet && (
        <>
          <textarea
            readOnly
            className="min-h-[140px] w-full rounded-lg border border-mar-border bg-mar-beige p-3 font-mono text-sm"
            value={snippet}
          />
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-mar-teal hover:underline"
            >
              {publicUrl}
            </a>
          )}
          <div className="mt-4 flex justify-end">
            <LbButton type="button" variant="accent" onClick={() => void copy()}>
              Kopieer
            </LbButton>
          </div>
        </>
      )}
    </LbModal>
  );
}
