import { ExternalLink, Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Blog, Post } from '@/mechanisms/liveblog-api';
import { useBlogTheme } from '../hooks/useBlogTheme';
import { resolveBlogThemePreviewUrl } from '../services/blogPreviewUrl';
import { postsToMap, type PreviewEmbedHandlers } from '../services/previewEmbedBridge';
import type { PreviewDeviceMode, PreviewDeviceOrientation } from '../types';
import { PreviewBlogHeader } from './PreviewBlogHeader';
import { PreviewDeviceFrame } from './PreviewDeviceFrame';
import { ThemeStylesheetLoader } from './ThemeStylesheetLoader';

export interface BlogLivePreviewPaneProps {
  blog: Blog;
  immersive?: boolean;
  draftSlot?: ReactNode;
  posts: Post[];
  allowPinHighlight?: boolean;
  onPostSelect: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onPublishPost?: (post: Post) => void;
  onTogglePin?: (post: Post) => void;
  onToggleHighlight?: (post: Post) => void;
  children: ReactNode;
}

export function BlogLivePreviewPane({
  blog,
  immersive = false,
  draftSlot,
  posts,
  allowPinHighlight = true,
  onPostSelect,
  onDeletePost,
  onPublishPost,
  onTogglePin,
  onToggleHighlight,
  children,
}: BlogLivePreviewPaneProps) {
  const [deviceMode, setDeviceMode] = useState<PreviewDeviceMode>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 1024 ? 'mobile' : 'desktop';
  });
  const [orientation, setOrientation] = useState<PreviewDeviceOrientation>('portrait');

  const themePreviewUrl = resolveBlogThemePreviewUrl(blog);
  const { stylesheetUrls, theme, isLoading: themeLoading } = useBlogTheme(blog);
  const publicUrl = blog.public_url?.trim() || themePreviewUrl;

  const embedHandlers = useMemo<PreviewEmbedHandlers | null>(() => {
    if (!themePreviewUrl) return null;
    return {
      postsById: postsToMap(posts),
      allowPinHighlight,
      onEdit: (postId) => {
        const post = posts.find((p) => p._id === postId);
        if (post) onPostSelect(post);
      },
      onDelete: onDeletePost
        ? (postId) => {
            const post = posts.find((p) => p._id === postId);
            if (post) onDeletePost(post);
          }
        : undefined,
      onPublish: onPublishPost
        ? (postId: string) => {
            const post = posts.find((p) => p._id === postId);
            if (post) onPublishPost(post);
          }
        : undefined,
      onTogglePin: onTogglePin
        ? (postId) => {
            const post = posts.find((p) => p._id === postId);
            if (post) onTogglePin(post);
          }
        : undefined,
      onToggleHighlight: onToggleHighlight
        ? (postId) => {
            const post = posts.find((p) => p._id === postId);
            if (post) onToggleHighlight(post);
          }
        : undefined,
    };
  }, [
    themePreviewUrl,
    posts,
    allowPinHighlight,
    onPostSelect,
    onDeletePost,
    onPublishPost,
    onTogglePin,
    onToggleHighlight,
  ]);

  const shellClass = immersive
    ? 'm-editor-preview m-editor-preview--immersive'
    : 'm-editor-preview';

  const showOrientation = deviceMode !== 'desktop';
  const seg = (active: boolean) =>
    `m-editor-preview__seg-btn${active ? ' m-editor-preview__seg-btn--active' : ''}`;

  return (
    <section className={shellClass} aria-label="Lewendige blog-voorskou">
      {stylesheetUrls.length > 0 ? <ThemeStylesheetLoader urls={stylesheetUrls} /> : null}

      <header className="m-editor-preview__toolbar">
        <div className="m-editor-preview__toolbar-start">
          <span className="m-editor-preview__toolbar-label">Lewendige voorskou</span>
          <span className="m-editor-preview__toolbar-hint">
            {themeLoading
              ? 'Laai tema…'
              : theme?.label
                ? `Regte tema: ${theme.label} — redigeer op plasings`
                : 'Regte tema — redigeer op plasings'}
          </span>
        </div>

        <div className="m-editor-preview__device-group" role="group" aria-label="Toestel">
          <button
            type="button"
            className={seg(deviceMode === 'desktop')}
            onClick={() => setDeviceMode('desktop')}
            title="Desktop"
            aria-pressed={deviceMode === 'desktop'}
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden />
            <span className="m-editor-preview__device-label">Desktop</span>
          </button>
          <button
            type="button"
            className={seg(deviceMode === 'tablet')}
            onClick={() => setDeviceMode('tablet')}
            title="Tablet"
            aria-pressed={deviceMode === 'tablet'}
          >
            <Tablet className="h-3.5 w-3.5" aria-hidden />
            <span className="m-editor-preview__device-label">Tablet</span>
          </button>
          <button
            type="button"
            className={seg(deviceMode === 'mobile')}
            onClick={() => setDeviceMode('mobile')}
            title="Foon"
            aria-pressed={deviceMode === 'mobile'}
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            <span className="m-editor-preview__device-label">Foon</span>
          </button>
        </div>

        {showOrientation ? (
          <div className="m-editor-preview__device-group" role="group" aria-label="Orientasie">
            <button
              type="button"
              className={seg(orientation === 'portrait')}
              onClick={() => setOrientation('portrait')}
              aria-pressed={orientation === 'portrait'}
            >
              Portret
            </button>
            <button
              type="button"
              className={seg(orientation === 'landscape')}
              onClick={() => setOrientation('landscape')}
              aria-pressed={orientation === 'landscape'}
            >
              <RotateCw className="h-3 w-3 inline" aria-hidden />
              Landskap
            </button>
          </div>
        ) : null}

        {publicUrl ? (
          <a
            href={publicUrl.startsWith('/') ? `${window.location.origin}${publicUrl}` : publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="m-editor-preview__live-link"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span>Maak blog oop</span>
          </a>
        ) : null}
      </header>

      <div className="m-editor-preview__frame-host">
        <PreviewDeviceFrame
          deviceMode={deviceMode}
          orientation={orientation}
          themePreviewUrl={themePreviewUrl}
          embedHandlers={embedHandlers}
          draftSlot={draftSlot}
        >
          <div
            className={[
              'lb-timeline',
              'lb-themed-preview',
              theme?.name === 'tribute-light' ? 'tribute-light-timeline' : '',
              theme?.name === 'tribute' ? 'tribute-timeline' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-theme={theme?.name ?? 'unknown'}
          >
            <PreviewBlogHeader blog={blog} />
            {draftSlot}
            <div className="lb-preview-posts">{children}</div>
          </div>
        </PreviewDeviceFrame>
      </div>
    </section>
  );
}
