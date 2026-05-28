import { LbButton } from '@/components/ui/LbButton';
import { LbModal } from '@/components/ui/LbModal';
import type { Theme } from '@/mechanisms/liveblog-api';

type ThemeBlogsModalProps = {
  theme: Theme | null;
  open: boolean;
  onClose(): void;
};

export function ThemeBlogsModal({ theme, open, onClose }: ThemeBlogsModalProps) {
  const blogs = theme?.blogs ?? [];

  return (
    <LbModal open={open} onClose={onClose} title={theme ? `Blogs — ${theme.label ?? theme.name}` : 'Blogs'}>
      {blogs.length === 0 ? (
        <p className="m-0 text-sm text-mar-muted">Geen blogs gebruik hierdie tema nie.</p>
      ) : (
        <ul className="m-0 list-inside list-disc space-y-1 text-sm">
          {blogs.map((blog) => (
            <li key={blog._id}>{blog.title}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-end">
        <LbButton type="button" variant="secondary" onClick={onClose}>
          Sluit
        </LbButton>
      </div>
    </LbModal>
  );
}
