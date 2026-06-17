import type { ReactNode } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Blog, LiveblogUser } from '@/mechanisms/liveblog-api';
import { EDITOR_PANELS } from '../config/editorPanels';
import type { EditorPanel, EditorViewMode } from '../types';
import { AF } from '@/copy';
import { EditorChromeActions } from './EditorChromeActions';
import { EditorViewModeSwitch } from './EditorViewModeSwitch';

export interface EditorLayoutProps {
  blog: Blog;
  user: LiveblogUser | null;
  panel: EditorPanel;
  onPanelChange: (panel: EditorPanel) => void;
  viewMode: EditorViewMode;
  onViewModeChange: (mode: EditorViewMode) => void;
  showViewModeSwitch?: boolean;
  composer: ReactNode;
  preview?: ReactNode | null;
}

export function EditorLayout({
  blog,
  user,
  panel,
  onPanelChange,
  viewMode,
  onViewModeChange,
  showViewModeSwitch = true,
  composer,
  preview,
}: EditorLayoutProps) {
  const showComposer = viewMode === 'edit' || viewMode === 'split';
  const showPreview = Boolean(preview) && (viewMode === 'preview' || viewMode === 'split');
  /** Edit/preview: single pane. Split: compose + preview; timeline lives in preview pane only. */
  const columnsClass = `m-editor-columns m-editor-columns--${viewMode}`;

  return (
    <div className="m-portal-editor">
      <header className="m-editor-chrome">
        <div className="m-editor-chrome__start">
          <Link
            to="/liveblog"
            className="m-editor-chrome__icon-btn m-editor-chrome__home"
            title={AF.editor.backToBlogs}
            aria-label={AF.editor.backToBlogs}
          >
            <LayoutGrid className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="m-editor-chrome__title">{blog.title}</h1>
        </div>
        <div className="m-editor-chrome__center">
          {showViewModeSwitch && panel === 'editor' ? (
            <EditorViewModeSwitch mode={viewMode} onChange={onViewModeChange} />
          ) : null}
        </div>
        <EditorChromeActions blog={blog} user={user} mode="editor" />
      </header>

      <div className="m-editor-shell">
        <aside className="m-editor-rail" aria-label={AF.editor.panels}>
          <ul className="m-editor-rail__list">
            {EDITOR_PANELS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`m-editor-rail__btn${panel === item.id ? ' m-editor-rail__btn--active' : ''}`}
                    disabled={!item.enabled}
                    onClick={() => item.enabled && onPanelChange(item.id)}
                    title={item.enabled ? item.label : AF.editor.panelComingSoon}
                    aria-label={item.label}
                    aria-current={panel === item.id ? 'page' : undefined}
                  >
                    <Icon className="m-editor-rail__icon" aria-hidden />
                    <span className="m-editor-rail__label">{item.shortLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className={columnsClass}>
          {showComposer ? (
            <div className="m-editor-panel m-editor-panel--compose">
              <header className="m-editor-panel__head">
                <span className="m-editor-panel__title">{AF.editor.editPanel}</span>
                <span className="m-editor-panel__hint">{AF.editor.editHint}</span>
              </header>
              <div className="m-editor-panel__body">{composer}</div>
            </div>
          ) : null}
          {showPreview ? (
            <div className="m-editor-panel m-editor-panel--preview">
              <div className="m-editor-panel__body m-editor-panel__body--flush">{preview}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
