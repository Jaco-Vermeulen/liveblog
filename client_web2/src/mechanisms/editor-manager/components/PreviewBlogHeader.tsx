import type { Blog } from '@/mechanisms/liveblog-api';

export interface PreviewBlogHeaderProps {
  blog: Blog;
}

/** Live-blog masthead shown at the top of the preview device frame. */
export function PreviewBlogHeader({ blog }: PreviewBlogHeaderProps) {
  return (
    <header className="lb-preview-blog">
      {blog.picture_url ? (
        <div className="lb-preview-blog__cover">
          <img src={blog.picture_url} alt="" className="lb-preview-blog__image" />
        </div>
      ) : null}
      <div className="lb-preview-blog__text">
        <h2 className="lb-preview-blog__title">{blog.title}</h2>
        {blog.description ? (
          <p className="lb-preview-blog__desc">{blog.description}</p>
        ) : null}
      </div>
    </header>
  );
}
