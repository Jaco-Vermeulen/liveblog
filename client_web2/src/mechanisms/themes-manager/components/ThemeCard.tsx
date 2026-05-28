import { LbBadge } from '@/components/ui/LbBadge';
import { LbButton } from '@/components/ui/LbButton';
import { LbCard, LbCardBody, LbCardHeader, LbCardTitle } from '@/components/ui/LbCard';
import type { Theme } from '@/mechanisms/liveblog-api';
import { cannotRemoveTheme } from '../services/parseTheme';

type ThemeCardProps = {
  theme: Theme;
  allThemes: Theme[];
  isDefault: boolean;
  busy?: boolean;
  canRemove?: boolean;
  onMakeDefault(): void;
  onDownload(): void;
  onRedeploy(): void;
  onRemove(): void;
  onShowBlogs(): void;
  onOpenSettings(): void;
};

export function ThemeCard({
  theme,
  allThemes,
  isDefault,
  busy,
  canRemove = true,
  onMakeDefault,
  onDownload,
  onRedeploy,
  onRemove,
  onShowBlogs,
  onOpenSettings,
}: ThemeCardProps) {
  const author =
    typeof theme.author === 'object'
      ? theme.author?.name
      : theme.author;
  const removeDisabled = cannotRemoveTheme(theme, allThemes);

  return (
    <LbCard className="h-full">
      <LbCardHeader>
        <LbCardTitle>{theme.label ?? theme.name}</LbCardTitle>
        {isDefault && <LbBadge variant="teal">Verstek</LbBadge>}
        {theme.extends && (
          <LbBadge variant="muted">Brei uit: {theme.extends}</LbBadge>
        )}
      </LbCardHeader>
      <LbCardBody className="space-y-3">
        {theme.screenshot_url && (
          <img
            src={theme.screenshot_url}
            alt=""
            className="max-h-24 rounded border border-mar-border object-cover"
          />
        )}
        <p className="m-0 text-xs text-mar-muted">
          {theme.blogs_count ?? 0} blog(s)
          {author ? ` · ${author}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          <LbButton
            type="button"
            variant="primary"
            className="px-2 py-1 text-xs"
            disabled={busy}
            onClick={onOpenSettings}
          >
            Instellings
          </LbButton>
          {!isDefault && (
            <LbButton
              type="button"
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={busy}
              onClick={onMakeDefault}
            >
              Maak verstek
            </LbButton>
          )}
          <LbButton
            type="button"
            variant="secondary"
            className="px-2 py-1 text-xs"
            disabled={busy}
            onClick={onDownload}
          >
            Laai af
          </LbButton>
          <LbButton
            type="button"
            variant="secondary"
            className="px-2 py-1 text-xs"
            disabled={busy}
            onClick={onRedeploy}
          >
            Herontplooi
          </LbButton>
          <LbButton
            type="button"
            variant="secondary"
            className="px-2 py-1 text-xs"
            disabled={busy}
            onClick={onShowBlogs}
          >
            Blogs
          </LbButton>
          {canRemove && (
            <LbButton
              type="button"
              variant="ghost"
              className="px-2 py-1 text-xs text-red-700"
              disabled={busy || removeDisabled}
              onClick={onRemove}
            >
              Verwyder
            </LbButton>
          )}
        </div>
      </LbCardBody>
    </LbCard>
  );
}
