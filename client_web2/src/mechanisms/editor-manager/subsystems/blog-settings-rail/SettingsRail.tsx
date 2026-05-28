import type { ReactNode } from 'react';
import type { SettingsTab } from '../../hooks/useBlogSettings';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'Algemeen' },
  { id: 'team', label: 'Span' },
  { id: 'outputs', label: 'Uitsette' },
  { id: 'consumers', label: 'Verbruikers' },
];

export interface SettingsRailProps {
  tab: SettingsTab;
  onTabChange(tab: SettingsTab): void;
  children: ReactNode;
}

export function SettingsRail({ tab, onTabChange, children }: SettingsRailProps) {
  return (
    <div className="m-settings-rail">
      <nav className="m-settings-rail__nav" aria-label="Instelling-oortjies">
        <ul className="m-settings-rail__tabs">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`m-settings-rail__tab ${tab === t.id ? 'm-settings-rail__tab--active' : ''}`}
                onClick={() => onTabChange(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="m-settings-rail__content">{children}</div>
    </div>
  );
}
