import { LbAlert } from '@/components/ui/LbAlert';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbButton } from '@/components/ui/LbButton';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { AF } from '@/copy';
import { useInstanceSettings } from '../hooks/useInstanceSettings';
import { useInstanceSettingsRemoteSync } from '../hooks/useInstanceSettingsRemoteSync';
import { JsonEditor } from './JsonEditor';
import { SettingsToolbar } from './SettingsToolbar';

export function InstanceSettingsPage() {
  const {
    jsonText,
    onTextChange,
    formatJsonField,
    loading,
    saving,
    isDirty,
    error,
    parseError,
    saveMessage,
    save,
    reload,
  } = useInstanceSettings();

  useInstanceSettingsRemoteSync(reload, isDirty);

  if (loading) {
    return (
      <LbContentContainer size="lg" centered className="py-16">
        <LbSpinner tone="dark" />
        <p className="mt-3 text-sm text-mar-muted">{AF.settings.loadingInstance}</p>
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

      <div className="mb-3 flex justify-end">
        <LbButton type="button" variant="secondary" onClick={formatJsonField}>
          Formateer JSON
        </LbButton>
      </div>

      <JsonEditor
        value={jsonText}
        onChange={onTextChange}
        error={parseError}
      />
    </LbContentContainer>
  );
}
