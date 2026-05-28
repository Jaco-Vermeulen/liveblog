import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbButton } from '@/components/ui/LbButton';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { usePrivileges } from '@/mechanisms/auth-manager';
import { HIDDEN_THEME_PICKER } from '../constants';
import { useThemesManager } from '../hooks/useThemesManager';
import { ThemeBlogsModal } from './ThemeBlogsModal';
import { ThemeCard } from './ThemeCard';
import { ThemeSettingsModal } from './ThemeSettingsModal';

export function ThemesManagerPage() {
  const navigate = useNavigate();
  const { canDeleteThemes } = usePrivileges();
  const fileRef = useRef<HTMLInputElement>(null);
  const [blogsModalTheme, setBlogsModalTheme] = useState<import('@/mechanisms/liveblog-api').Theme | null>(
    null,
  );
  const [settingsModalTheme, setSettingsModalTheme] = useState<
    import('@/mechanisms/liveblog-api').Theme | null
  >(null);

  const {
    themes,
    loading,
    busy,
    error,
    message,
    makeDefault,
    doRemove,
    doRedeploy,
    doDownload,
    doUpload,
    isDefaultTheme,
    refresh,
  } = useThemesManager();

  const handleThemeSaved = () => {
    void refresh();
  };

  const visibleThemes = themes.filter((t) => t.name !== HIDDEN_THEME_PICKER);

  if (loading) {
    return (
      <LbContentContainer size="full" centered className="py-16">
        <LbSpinner tone="dark" />
        <p className="mt-3 text-sm text-mar-muted">Laai temas…</p>
      </LbContentContainer>
    );
  }

  return (
    <LbContentContainer size="full" centered={false} className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-mar-muted">
          Bestuur temas, verstek tema, oplaai en herontplooi.
        </p>
        <div className="flex flex-wrap gap-2">
          <LbButton type="button" variant="secondary" onClick={() => navigate('/liveblog')}>
            Terug na blogs
          </LbButton>
          <LbButton type="button" variant="primary" disabled={busy} onClick={() => fileRef.current?.click()}>
            Laai tema op
          </LbButton>
          <input
            ref={fileRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void doUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}
      {message && (
        <LbAlert variant="info" className="mb-4" role="status">
          {message}
        </LbAlert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleThemes.map((theme) => (
          <ThemeCard
            key={theme._id ?? theme.name}
            theme={theme}
            allThemes={themes}
            isDefault={isDefaultTheme(theme)}
            busy={busy}
            canRemove={canDeleteThemes}
            onMakeDefault={() => void makeDefault(theme)}
            onDownload={() => void doDownload(theme)}
            onRedeploy={() => void doRedeploy(theme)}
            onRemove={() => {
              if (window.confirm(`Verwyder tema "${theme.label ?? theme.name}"?`)) {
                void doRemove(theme);
              }
            }}
            onShowBlogs={() => setBlogsModalTheme(theme)}
            onOpenSettings={() => setSettingsModalTheme(theme)}
          />
        ))}
      </div>

      <ThemeBlogsModal
        theme={blogsModalTheme}
        open={Boolean(blogsModalTheme)}
        onClose={() => setBlogsModalTheme(null)}
      />

      <ThemeSettingsModal
        theme={settingsModalTheme}
        allThemes={themes}
        open={Boolean(settingsModalTheme)}
        onClose={() => setSettingsModalTheme(null)}
        onSaved={handleThemeSaved}
      />
    </LbContentContainer>
  );
}
