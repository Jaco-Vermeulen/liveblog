import { LbFormField } from '@/components/ui/LbFormField';
import type { Theme, ThemeSettingOption } from '@/mechanisms/liveblog-api';
import { linkifyHelp, optionRequirementIsSatisfied } from '../services/themeUtils';

const selectClass =
  'w-full rounded border border-mar-border bg-mar-input px-3 py-2 text-sm text-mar-text';

const DATETIME_FORMATS = [
  'MMMM Do, YYYY HH:mm',
  'YYYY-MM-DD hh:mm a',
  'DD/MM/YYYY hh:mm A',
  'HH:mm D.M.YYYY',
  'lll',
];

type ThemeSettingsOptionsTabProps = {
  options: ThemeSettingOption[];
  settings: Record<string, unknown>;
  themeNames: Pick<Theme, 'name' | 'label'>[];
  showAdvanced: boolean;
  onShowAdvancedChange(show: boolean): void;
  onChange(settings: Record<string, unknown>): void;
};

function updateSetting(
  settings: Record<string, unknown>,
  name: string,
  value: unknown,
): Record<string, unknown> {
  return { ...settings, [name]: value };
}

export function ThemeSettingsOptionsTab({
  options,
  settings,
  themeNames,
  showAdvanced,
  onShowAdvancedChange,
  onChange,
}: ThemeSettingsOptionsTabProps) {
  const hasAdvanced = options.some((o) => o.isAdvanced);

  return (
    <div className="space-y-4">
      {hasAdvanced && (
        <label className="flex items-center gap-2 text-sm text-mar-text">
          <input
            type="checkbox"
            checked={showAdvanced}
            onChange={(e) => onShowAdvancedChange(e.target.checked)}
          />
          Gevorderde instellings
        </label>
      )}

      {options.map((option) => {
        if (!optionRequirementIsSatisfied(option, settings)) return null;
        if (option.isAdvanced && !showAdvanced) return null;

        if (option.type === 'groupheading') {
          return (
            <h3
              key={option.name}
              className="m-0 border-b border-mar-border pb-1 text-sm font-bold uppercase tracking-wide text-mar-text"
            >
              {option.label}
            </h3>
          );
        }

        const helpHtml = linkifyHelp(option.help);

        if (option.type === 'checkbox') {
          return (
            <label key={option.name} className="flex items-center gap-2 text-sm text-mar-text">
              <input
                type="checkbox"
                checked={Boolean(settings[option.name])}
                onChange={(e) =>
                  onChange(updateSetting(settings, option.name, e.target.checked))
                }
              />
              {option.label}
              {helpHtml && (
                <span
                  className="text-xs text-mar-muted"
                  dangerouslySetInnerHTML={{ __html: helpHtml }}
                />
              )}
            </label>
          );
        }

        if (option.type === 'number' || option.type === 'text') {
          return (
            <LbFormField key={option.name} label={option.label ?? option.name} htmlFor={option.name}>
              <input
                id={option.name}
                type={option.type}
                className={selectClass}
                value={
                  settings[option.name] !== undefined && settings[option.name] !== null
                    ? String(settings[option.name])
                    : ''
                }
                onChange={(e) =>
                  onChange(
                    updateSetting(
                      settings,
                      option.name,
                      option.type === 'number' ? Number(e.target.value) : e.target.value,
                    ),
                  )
                }
              />
              {helpHtml && (
                <p
                  className="m-0 mt-1 text-xs text-mar-muted"
                  dangerouslySetInnerHTML={{ __html: helpHtml }}
                />
              )}
            </LbFormField>
          );
        }

        if (option.type === 'textarea') {
          return (
            <LbFormField key={option.name} label={option.label ?? option.name} htmlFor={option.name}>
              <textarea
                id={option.name}
                rows={4}
                className={selectClass}
                value={
                  settings[option.name] !== undefined && settings[option.name] !== null
                    ? String(settings[option.name])
                    : ''
                }
                onChange={(e) => onChange(updateSetting(settings, option.name, e.target.value))}
              />
              {helpHtml && (
                <p
                  className="m-0 mt-1 text-xs text-mar-muted"
                  dangerouslySetInnerHTML={{ __html: helpHtml }}
                />
              )}
            </LbFormField>
          );
        }

        if (option.type === 'select') {
          const isOutputChannel = option.name === 'outputChannelTheme';
          return (
            <LbFormField key={option.name} label={option.label ?? option.name} htmlFor={option.name}>
              <select
                id={option.name}
                className={selectClass}
                value={
                  settings[option.name] !== undefined && settings[option.name] !== null
                    ? String(settings[option.name])
                    : ''
                }
                onChange={(e) => onChange(updateSetting(settings, option.name, e.target.value))}
              >
                {isOutputChannel
                  ? themeNames.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.label ?? t.name}
                      </option>
                    ))
                  : option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
              </select>
              {helpHtml && (
                <p
                  className="m-0 mt-1 text-xs text-mar-muted"
                  dangerouslySetInnerHTML={{ __html: helpHtml }}
                />
              )}
            </LbFormField>
          );
        }

        if (option.type === 'datetimeformat') {
          return (
            <LbFormField key={option.name} label={option.label ?? option.name} htmlFor={option.name}>
              <select
                id={option.name}
                className={selectClass}
                value={
                  settings[option.name] !== undefined && settings[option.name] !== null
                    ? String(settings[option.name])
                    : ''
                }
                onChange={(e) => onChange(updateSetting(settings, option.name, e.target.value))}
              >
                {DATETIME_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
              {helpHtml && (
                <p
                  className="m-0 mt-1 text-xs text-mar-muted"
                  dangerouslySetInnerHTML={{ __html: helpHtml }}
                />
              )}
            </LbFormField>
          );
        }

        return null;
      })}
    </div>
  );
}
