import { BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Blog } from '@/mechanisms/liveblog-api';
import { canAccessBlogSettings } from '../services/blogSecurity';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';

export type EditorChromeMode = 'editor' | 'settings' | 'analytics';

export interface EditorChromeActionsProps {
  blog: Blog;
  user: LiveblogUser | null;
  mode?: EditorChromeMode;
}

export function EditorChromeActions({
  blog,
  user,
  mode = 'editor',
}: EditorChromeActionsProps) {
  const showSettings = canAccessBlogSettings(blog, user);

  if (!showSettings) {
    return null;
  }

  return (
    <nav className="m-editor-chrome__actions" aria-label="Blog-navigasie">
      <Link
        to={`/liveblog/analytics/${blog._id}`}
        className={`m-editor-chrome__icon-btn${mode === 'analytics' ? ' m-editor-chrome__icon-btn--active' : ''}`}
        title="Analise"
        aria-label="Analise"
        aria-current={mode === 'analytics' ? 'page' : undefined}
      >
        <BarChart3 className="h-5 w-5" aria-hidden />
      </Link>
      <Link
        to={`/liveblog/settings/${blog._id}`}
        className={`m-editor-chrome__icon-btn${mode === 'settings' ? ' m-editor-chrome__icon-btn--active' : ''}`}
        title="Blog-instellings"
        aria-label="Blog-instellings"
        aria-current={mode === 'settings' ? 'page' : undefined}
      >
        <Settings className="h-5 w-5" aria-hidden />
      </Link>
    </nav>
  );
}
