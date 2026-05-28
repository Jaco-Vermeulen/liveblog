import { useState } from 'react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { Blog } from '@/mechanisms/liveblog-api';
import { LiveblogApiError, requestBlogMembership } from '@/mechanisms/liveblog-api';

export interface AccessRequestModalProps {
  blog: Blog | null;
  open: boolean;
  onClose: () => void;
}

export function AccessRequestModal({ blog, open, onClose }: AccessRequestModalProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    setError(null);
    setSent(false);
    onClose();
  };

  const handleRequest = async () => {
    if (!blog?._id) return;
    setSending(true);
    setError(null);
    try {
      await requestBlogMembership(blog._id);
      setSent(true);
    } catch (err) {
      if (err instanceof LiveblogApiError && err.message.includes('already been sent')) {
        setError('’n Versoek is reeds gestuur vir hierdie blog.');
      } else {
        setError(err instanceof Error ? err.message : 'Kon nie versoek stuur nie.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <LbModal
      open={open}
      onClose={handleClose}
      title="Versoek toegang"
      footer={
        <>
          <LbButton type="button" variant="secondary" onClick={handleClose}>
            Sluit
          </LbButton>
          {!sent && (
            <LbButton type="button" variant="primary" onClick={() => void handleRequest()} disabled={sending}>
              {sending ? 'Stuur…' : 'Stuur versoek'}
            </LbButton>
          )}
        </>
      }
    >
      {blog ? (
        <p className="m-0 text-sm text-mar-text">
          Jy het nie toegang tot <strong>{blog.title}</strong> nie. Stuur ’n lidmaatskapversoek na die
          blog-eienaars?
        </p>
      ) : null}

      {error && (
        <LbAlert variant="error" className="mt-4">
          {error}
        </LbAlert>
      )}

      {sent && (
        <LbAlert variant="info" className="mt-4">
          Versoek gestuur. Jy sal ingelig word wanneer toegang verleen word.
        </LbAlert>
      )}

      {sending && (
        <div className="mt-4 flex justify-center">
          <LbSpinner tone="dark" />
          <span className="sr-only">Stuur versoek…</span>
        </div>
      )}
    </LbModal>
  );
}
