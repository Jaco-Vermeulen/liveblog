import type { ChangeEvent, FormEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import type { LanguageOption, Theme } from '@/mechanisms/liveblog-api';
import type { BlogGeneralForm } from '../../hooks/useBlogGeneralSettings';
import {
  BLOG_CATEGORIES,
  COMMENT_OPTIONS,
  POST_LIMIT_OPTIONS,
} from '../../hooks/useBlogGeneralSettings';

const fieldClass =
  'w-full rounded border border-mar-border bg-mar-input px-3 py-2 text-sm text-mar-text';

export interface GeneralSettingsProps {
  form: BlogGeneralForm;
  themes: Theme[];
  languages: LanguageOption[];
  publicUrl: string;
  embedCode: string;
  metaLoading: boolean;
  isSaving: boolean;
  blogId: string;
  onChange(patch: Partial<BlogGeneralForm>): void;
  onUploadImage(file: File): void;
  onRemoveImage(): void;
  onSubmit(e: FormEvent): void;
}

export function GeneralSettings({
  form,
  themes,
  languages,
  publicUrl,
  embedCode,
  metaLoading,
  isSaving,
  blogId,
  onChange,
  onUploadImage,
  onRemoveImage,
  onSubmit,
}: GeneralSettingsProps) {
  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    e.target.value = '';
  };

  return (
    <form onSubmit={onSubmit} className="m-settings-panel space-y-5">
      <div className="text-sm text-mar-muted">
        <span className="font-medium">Blog ID:</span> {blogId}
      </div>

      <LbFormField label="Blog-status" htmlFor="settings-status">
        <label className="flex items-center gap-3 text-sm">
          <input
            id="settings-status"
            type="checkbox"
            className="h-4 w-4 accent-mar-teal"
            checked={form.isActive}
            onChange={(e) => onChange({ isActive: e.target.checked })}
          />
          <span>{form.isActive ? 'Aktief' : 'Geargiveer'}</span>
        </label>
      </LbFormField>

      <LbFormField label="Titel" htmlFor="settings-title">
        <LbInput
          id="settings-title"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          required
        />
      </LbFormField>

      <LbFormField label="Blog-beeld" htmlFor="settings-image">
        {form.pictureUrl ? (
          <div className="space-y-2">
            <img
              src={form.pictureUrl}
              alt=""
              className="max-h-40 rounded border border-mar-border object-cover"
            />
            <div className="flex flex-wrap gap-2">
              <label className="m-settings-file-btn m-settings-file-btn--secondary cursor-pointer">
                Verander
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImagePick}
                />
              </label>
              <LbButton type="button" variant="ghost" onClick={onRemoveImage}>
                Verwyder
              </LbButton>
            </div>
          </div>
        ) : (
          <label className="m-settings-file-btn m-settings-file-btn--secondary cursor-pointer">
            Laai beeld op
            <input
              id="settings-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImagePick}
            />
          </label>
        )}
      </LbFormField>

      <LbFormField label="Beskrywing" htmlFor="settings-description">
        <textarea
          id="settings-description"
          className={fieldClass}
          rows={4}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </LbFormField>

      <LbFormField label="Tema" htmlFor="settings-theme">
        <select
          id="settings-theme"
          className={fieldClass}
          disabled={metaLoading}
          value={form.themeName}
          onChange={(e) => onChange({ themeName: e.target.value })}
        >
          <option value="">Kies tema</option>
          {themes.map((theme) => (
            <option key={theme._id} value={theme.name}>
              {theme.label ?? theme.name}
            </option>
          ))}
        </select>
      </LbFormField>

      <LbFormField label="Taal" htmlFor="settings-language">
        <select
          id="settings-language"
          className={fieldClass}
          disabled={metaLoading}
          value={form.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option value="">Standaard</option>
          {languages.map((lang) => (
            <option key={lang._id} value={lang.language_code}>
              {lang.name}
            </option>
          ))}
        </select>
      </LbFormField>

      <LbFormField label="Inbed-hoogte" htmlFor="settings-embed-height">
        <label className="flex items-center gap-3 text-sm">
          <input
            id="settings-embed-height"
            type="checkbox"
            className="h-4 w-4 accent-mar-teal"
            checked={form.embedResponsive}
            onChange={(e) => onChange({ embedResponsive: e.target.checked })}
          />
          <span>{form.embedResponsive ? 'Responsief' : 'Vaste hoogte'}</span>
        </label>
      </LbFormField>

      <LbFormField label="Inbed-kode" htmlFor="settings-embed-code">
        <textarea
          id="settings-embed-code"
          className={`${fieldClass} min-h-[140px] font-mono text-xs`}
          readOnly
          value={embedCode}
          onFocus={(e) => e.target.select()}
        />
      </LbFormField>

      {publicUrl && (
        <p className="text-sm">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-mar-teal hover:underline"
          >
            {publicUrl}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </p>
      )}

      <LbFormField label="Kategorie" htmlFor="settings-category">
        <select
          id="settings-category"
          className={fieldClass}
          value={form.category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          {BLOG_CATEGORIES.map((cat) => (
            <option key={cat || 'none'} value={cat}>
              {cat || '— Geen —'}
            </option>
          ))}
        </select>
      </LbFormField>

      <LbFormField label="Gebruikers kan kommentaar lewer" htmlFor="settings-comments">
        <select
          id="settings-comments"
          className={fieldClass}
          value={form.usersCanComment}
          onChange={(e) => onChange({ usersCanComment: e.target.value })}
        >
          {COMMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </LbFormField>

      <LbFormField label="Plasing-limiet" htmlFor="settings-post-limit">
        <select
          id="settings-post-limit"
          className={fieldClass}
          value={form.postsLimit}
          onChange={(e) => onChange({ postsLimit: Number(e.target.value) })}
        >
          {POST_LIMIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </LbFormField>

      <LbButton type="submit" variant="primary" disabled={isSaving || metaLoading}>
        {isSaving ? 'Stoor…' : 'Stoor'}
      </LbButton>
    </form>
  );
}
