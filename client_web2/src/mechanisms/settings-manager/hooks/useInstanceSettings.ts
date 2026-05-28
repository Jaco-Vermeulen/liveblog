import { useCallback, useEffect, useState } from 'react';
import {
  getInstanceSettingsDocument,
  saveInstanceSettings,
} from '@/mechanisms/liveblog-api';
import { LiveblogApiError } from '@/mechanisms/liveblog-api';

function formatJson(text: string): string {
  const parsed = JSON.parse(text) as unknown;
  return JSON.stringify(parsed, null, 4);
}

export function useInstanceSettings() {
  const [jsonText, setJsonText] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getInstanceSettingsDocument();
      setJsonText(JSON.stringify(settings, null, 4));
      setIsDirty(false);
      setParseError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie instansie-instellings laai nie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onTextChange = (text: string) => {
    setJsonText(text);
    setIsDirty(true);
    setParseError(null);
    setSaveMessage(null);
  };

  const formatJsonField = () => {
    try {
      setJsonText(formatJson(jsonText));
      setParseError(null);
    } catch {
      setParseError('Ongeldige JSON-formaat. Regstel en probeer weer.');
    }
  };

  const save = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText) as Record<string, unknown>;
      setParseError(null);
    } catch {
      setParseError('Ongeldige JSON-formaat. Regstel en probeer weer.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      await saveInstanceSettings(parsed);
      setIsDirty(false);
      setSaveMessage('Instansie-instellings suksesvol gestoor.');
      await load();
    } catch (err) {
      if (err instanceof LiveblogApiError && err.body && typeof err.body === 'object') {
        const body = err.body as { _issues?: { settings?: string }; _message?: string };
        setError(body._issues?.settings ?? body._message ?? 'Kon nie stoor nie.');
      } else {
        setError('Kon nie instansie-instellings stoor nie.');
      }
    } finally {
      setSaving(false);
    }
  };

  return {
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
    reload: load,
  };
}
