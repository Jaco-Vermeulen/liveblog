import { ExternalLink, Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Blog, Post } from '@/mechanisms/liveblog-api';
import { useBlogTheme } from '../hooks/useBlogTheme';
import { resolveBlogThemePreviewUrl } from '../services/blogPreviewUrl';
import { buildThemeStyleSettingsCss } from '../services/themeAssets';
import { postsToMap, type PreviewEmbedHandlers } from '../services/previewEmbedBridge';
import type { PreviewDeviceMode, PreviewDeviceOrientation } from '../types';
import { PreviewBlogHeader } from './PreviewBlogHeader';
import { PreviewDeviceFrame } from './PreviewDeviceFrame';
import { ThemeStylesheetLoader } from './ThemeStylesheetLoader';
import { AF } from '@/copy';

const P = AF.editor.preview;

export interface BlogLivePreviewPaneProps {
  blog: Blog;
  immersive?: boolean;
  draftSlot?: ReactNode;
  draftPortalEnabled?: boolean;
  refreshToken?: number;
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
  draftPortalEnabled = false,
  refreshToken = 0,
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
  const themeStyleCss = useMemo(
    () => (theme ? buildThemeStyleSettingsCss(theme) : ''),
    [theme],
  );
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
    <section className={shellClass} aria-label={P.aria}>
      {stylesheetUrls.length > 0 ? <ThemeStylesheetLoader urls={stylesheetUrls} /> : null}
      {themeStyleCss ? <style data-liveblog-theme-styles>{themeStyleCss}</style> : null}

      <header className="m-editor-preview__toolbar">
        <div className="m-editor-preview__toolbar-start">
          <span className="m-editor-preview__toolbar-label">{P.label}</span>
          <span className="m-editor-preview__toolbar-hint">
            {themeLoading
              ? P.loadingTheme
              : theme?.label
                ? P.themeHint(theme.label)
                : P.themeHintDefault}
          </span>
        </div>

        <div className="m-editor-preview__device-group" role="group" aria-label={P.device}>
          <button
            type="button"
            className={seg(deviceMode === 'desktop')}
            onClick={() => setDeviceMode('desktop')}
            title={P.desktop}
            aria-pressed={deviceMode === 'desktop'}
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden />
            <span className="m-editor-preview__device-label">{P.desktop}</span>
          </button>
          <button
            type="button"
            className={seg(deviceMode === 'tablet')}
            onClick={() => setDeviceMode('tablet')}
            title={P.tablet}
            aria-pressed={deviceMode === 'tablet'}
          >
            <Tablet className="h-3.5 w-3.5" aria-hidden />
            <span className="m-editor-preview__device-label">{P.tablet}</span>
          </button>
          <button
            type="button"
            className={seg(deviceMode === 'mobile')}
            onClick={() => setDeviceMode('mobile')}
            title={P.phone}
            aria-pressed={deviceMode === 'mobile'}
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            <span className="m-editor-preview__device-label">{P.phone}</span>
          </button>
        </div>

        {showOrientation ? (
          <div className="m-editor-preview__device-group" role="group" aria-label={P.orientation}>
            <button
              type="button"
              className={seg(orientation === 'portrait')}
              onClick={() => setOrientation('portrait')}
              aria-pressed={orientation === 'portrait'}
            >
              {P.portrait}
            </button>
            <button
              type="button"
              className={seg(orientation === 'landscape')}
              onClick={() => setOrientation('landscape')}
              aria-pressed={orientation === 'landscape'}
            >
              <RotateCw className="h-3 w-3 inline" aria-hidden />
              {P.landscape}
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
            <span>{P.openBlog}</span>
          </a>
        ) : null}
      </header>

      <div className="m-editor-preview__frame-host">
        <PreviewDeviceFrame
          deviceMode={deviceMode}
          orientation={orientation}
          themePreviewUrl={themePreviewUrl}
          refreshToken={refreshToken}
          embedHandlers={embedHandlers}
          draftSlot={draftSlot}
          draftPortalEnabled={draftPortalEnabled}
        >
          <div
            className={[
              'lb-timeline',
              'lb-themed-preview',
              theme?.name === 'tribute-light' ? 'tribute-light-timeline' : '',
              theme?.name === 'tribute-ultimate' ? 'tribute-ultimate-timeline' : '',
              theme?.name === 'tribute' ? 'tribute-timeline' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-theme={theme?.name ?? 'unknown'}
          >
            <PreviewBlogHeader blog={blog} posts={posts} />
            {draftSlot}
            <div className="lb-preview-posts">{children}</div>
          </div>
        </PreviewDeviceFrame>
      </div>
    </section>
  );
}
