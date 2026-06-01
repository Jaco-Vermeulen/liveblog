import { LbAlert } from '@/components/ui/LbAlert';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { PRIVACY_STATUSES, QUOTATION_MARKS_OPTIONS } from '../constants';
import { useGeneralSettings } from '../hooks/useGeneralSettings';
import { SettingsToolbar } from './SettingsToolbar';
import { AF } from '@/copy';
import { TagsManager } from './TagsManager';

const selectClass =
  'w-full rounded border border-mar-border bg-mar-input px-3 py-2 text-sm text-mar-text';

export function GeneralSettingsPage() {
  const {
    form,
    themes,
    loading,
    saving,
    isDirty,
    error,
    saveMessage,
    updateForm,
    setTags,
    save,
  } = useGeneralSettings();

  if (loading) {
    return (
      <LbContentContainer size="lg" centered className="py-16">
        <LbSpinner tone="dark" />
        <p className="mt-3 text-sm text-mar-muted">{AF.settings.loading}</p>
      </LbContentContainer>
    );
  }

  return (
    <LbContentContainer size="lg" centered={false} className="py-6">
      <SettingsToolbar onSave={() => void save()} saving={saving} saveDisabled={!isDirty} />

      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}
      {saveMessage && (
        <LbAlert variant="info" className="mb-4" role="status">
          {saveMessage}
        </LbAlert>
      )}

      <form
        className="grid gap-6 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <LbFormField label="Verstek tema" htmlFor="settings-theme">
          <select
            id="settings-theme"
            className={selectClass}
            value={form.theme.value}
            onChange={(e) =>
              updateForm({ theme: { ...form.theme, value: e.target.value } })
            }
          >
            {themes.map((theme) => (
              <option key={theme.name} value={theme.name}>
                {theme.label ?? theme.name}
              </option>
            ))}
          </select>
        </LbFormField>

        <LbFormField label="YouTube privaatheid" htmlFor="settings-youtube">
          <select
            id="settings-youtube"
            className={selectClass}
            value={form.youtubePrivacy.value}
            onChange={(e) =>
              updateForm({
                youtubePrivacy: {
                  ...form.youtubePrivacy,
                  value: e.target.value as typeof form.youtubePrivacy.value,
                },
              })
            }
          >
            {PRIVACY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </LbFormField>

        <LbFormField label="Aanhalingstekens taal" htmlFor="settings-quotes">
          <select
            id="settings-quotes"
            className={selectClass}
            value={form.quotationMarks.value}
            onChange={(e) =>
              updateForm({
                quotationMarks: {
                  ...form.quotationMarks,
                  value: e.target.value as typeof form.quotationMarks.value,
                },
              })
            }
          >
            {QUOTATION_MARKS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </LbFormField>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-mar-text">
            <input
              type="checkbox"
              checked={form.embedHeightResponsive.value}
              onChange={(e) =>
                updateForm({
                  embedHeightResponsive: {
                    ...form.embedHeightResponsive,
                    value: e.target.checked,
                  },
                })
              }
            />
            {AF.settings.embedHeightResponsive}
          </label>
          <label className="flex items-center gap-2 text-sm text-mar-text">
            <input
              type="checkbox"
              checked={form.allowMultipleTags.value}
              onChange={(e) =>
                updateForm({
                  allowMultipleTags: {
                    ...form.allowMultipleTags,
                    value: e.target.checked,
                  },
                })
              }
            />
            Meervoudige etiketkeuse op plasings
          </label>
        </div>

        <div className="md:col-span-2">
          <TagsManager tags={form.globalTags.value} onChange={setTags} />
        </div>
      </form>
    </LbContentContainer>
  );
}
