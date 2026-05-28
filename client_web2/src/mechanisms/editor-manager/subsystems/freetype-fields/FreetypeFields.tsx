import { LbAlert } from '@/components/ui/LbAlert';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { Freetype } from '@/mechanisms/liveblog-api';
import {
  extractFreetypeFields,
  getPathValue,
  setPathValue,
  useFreetypesList,
} from '@/mechanisms/freetypes-manager';
import { FreetypeFieldInput } from './FreetypeFieldInput';

export const DEFAULT_POST_TYPE = 'Default';

export interface FreetypeFieldsProps {
  selectedPostType: typeof DEFAULT_POST_TYPE | Freetype;
  freetypeData: Record<string, unknown>;
  onPostTypeChange: (postType: typeof DEFAULT_POST_TYPE | Freetype) => void;
  onFreetypeDataChange: (data: Record<string, unknown>) => void;
}

export function FreetypeFields({
  selectedPostType,
  freetypeData,
  onPostTypeChange,
  onFreetypeDataChange,
}: FreetypeFieldsProps) {
  const { freetypes, loading, error } = useFreetypesList();

  const isDefault = selectedPostType === DEFAULT_POST_TYPE;
  const activeFreetype = isDefault ? null : selectedPostType;
  const fields = activeFreetype ? extractFreetypeFields(activeFreetype.template) : [];

  const setFieldValue = (path: string, value: string) => {
    const field = fields.find((f) => f.path === path);
    const targetPath = field?.type === 'image' ? `${path}.picture_url` : path;
    onFreetypeDataChange(setPathValue(freetypeData, targetPath, value));
  };

  const readFieldValue = (path: string, type: string): string => {
    if (type === 'image') {
      const url = getPathValue(freetypeData, `${path}.picture_url`);
      if (url != null && url !== '') return String(url);
    }
    const raw = getPathValue(freetypeData, path);
    return raw != null ? String(raw) : '';
  };

  return (
    <div className="m-editor-freetype" aria-label="Vrye tipe">
      <LbFormField label="Plasing-tipe" htmlFor="editor-post-type">
        <select
          id="editor-post-type"
          className="m-editor-composer__select"
          value={isDefault ? DEFAULT_POST_TYPE : activeFreetype?.name ?? DEFAULT_POST_TYPE}
          onChange={(e) => {
            const name = e.target.value;
            if (name === DEFAULT_POST_TYPE) {
              onPostTypeChange(DEFAULT_POST_TYPE);
              onFreetypeDataChange({});
              return;
            }
            const ft = freetypes.find((f) => f.name === name);
            if (ft) {
              onPostTypeChange(ft);
              onFreetypeDataChange({});
            }
          }}
          disabled={loading}
        >
          <option value={DEFAULT_POST_TYPE}>Standaard (teks / inbed / poll)</option>
          {freetypes.map((ft) => (
            <option key={ft._id ?? ft.name} value={ft.name}>
              {ft.name}
            </option>
          ))}
        </select>
      </LbFormField>

      {error && (
        <LbAlert variant="error" className="mt-3">
          {error}
        </LbAlert>
      )}

      {loading && !freetypes.length && (
        <div className="mt-3 flex justify-center py-4">
          <LbSpinner tone="dark" />
          <span className="sr-only">Laai vrye tipes…</span>
        </div>
      )}

      {!isDefault && activeFreetype && (
        <div className="m-editor-freetype__fields mt-4 space-y-3">
          {fields.length === 0 ? (
            <LbAlert variant="info">
              Geen redigeerbare velde in hierdie sjabloon gevind nie. Kontroleer $veranderlikes in
              die vrye tipe-sjabloon.
            </LbAlert>
          ) : (
            fields.map((field) => (
              <FreetypeFieldInput
                key={field.path}
                field={field}
                value={readFieldValue(field.path, field.type)}
                onChange={(value) => setFieldValue(field.path, value)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
