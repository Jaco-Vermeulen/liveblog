import type { Blog, Post } from '@/mechanisms/liveblog-api';
import { resolveLiveBlogTitle } from '../services/liveBlogTitle';

export interface PreviewBlogHeaderProps {
  blog: Blog;
  posts?: Post[];
}

/** Live-blog masthead shown at the top of the preview device frame. */
export function PreviewBlogHeader({ blog, posts = [] }: PreviewBlogHeaderProps) {
  const displayTitle = resolveLiveBlogTitle(blog, posts);

  return (
    <header className="lb-preview-blog">
      {blog.picture_url ? (
        <div className="lb-preview-blog__cover">
          <img src={blog.picture_url} alt="" className="lb-preview-blog__image" />
        </div>
      ) : null}
      <div className="lb-preview-blog__text">
        <h2 className="lb-preview-blog__title">{displayTitle}</h2>
        {blog.description ? (
          <p className="lb-preview-blog__desc">{blog.description}</p>
        ) : null}
      </div>
    </header>
  );
}
