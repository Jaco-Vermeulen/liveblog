import {
  BarChart2,
  CalendarClock,
  ImageIcon,
  Link2,
  Pin,
  Star,
  Type,
  X,
} from 'lucide-react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import type { Blog, PollBody } from '@/mechanisms/liveblog-api';
import { EmbedPreview, type EmbedMeta } from '../subsystems/embed-handlers';
import { FreetypeFields } from '../subsystems/freetype-fields';
import { PollBlockEditor } from '../subsystems/polls';
import { RichTextBlockEditor } from '../subsystems/rich-text-editor';
import type { ComposerState, EditorPostType, SirTrevorBlockType } from '../types';
import { PostTagsSelector } from './PostTagsSelector';

const BLOCK_TYPES: {
  type: SirTrevorBlockType;
  label: string;
  icon: typeof Type;
}[] = [
  { type: 'Text', label: 'Teks', icon: Type },
  { type: 'Image', label: 'Beeld', icon: ImageIcon },
  { type: 'Embed', label: 'Inbed', icon: Link2 },
  { type: 'Poll', label: 'Poll', icon: BarChart2 },
];

export interface PostComposerProps {
  blog: Blog;
  composer: ComposerState;
  canSubmit: boolean;
  isSubmitting: boolean;
  isEditing?: boolean;
  isFreetypeMode?: boolean;
  scheduledDatetimeLocal?: string;
  onAddBlock: (type: SirTrevorBlockType) => void;
  onRemoveBlock: (index: number) => void;
  onRemoveBlockIfEmpty: (index: number) => void;
  onUpdateBlock: (index: number, data: Record<string, unknown>) => void;
  onUploadImage: (index: number, file: File) => Promise<void> | void;
  imageUploadingIndex?: number | null;
  onPostTypeChange: (postType: EditorPostType) => void;
  onFreetypeDataChange: (data: Record<string, unknown>) => void;
  onScheduleEnabledChange: (enabled: boolean) => void;
  onScheduledDatetimeChange: (local: string) => void;
  onCancelEdit: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onStickyChange: (sticky: boolean) => void;
  onHighlightChange: (highlight: boolean) => void;
  globalTags?: string[];
  allowMultipleTags?: boolean;
  tagsLoading?: boolean;
  onTagsChange: (tags: string[]) => void;
}

export function PostComposer({
  blog,
  composer,
  canSubmit,
  isSubmitting,
  isEditing = false,
  isFreetypeMode = false,
  scheduledDatetimeLocal = '',
  onAddBlock,
  onRemoveBlock,
  onRemoveBlockIfEmpty,
  onUpdateBlock,
  onUploadImage,
  imageUploadingIndex = null,
  onPostTypeChange,
  onFreetypeDataChange,
  onScheduleEnabledChange,
  onScheduledDatetimeChange,
  onCancelEdit,
  onSubmit,
  onSaveDraft,
  onStickyChange,
  onHighlightChange,
  globalTags = [],
  allowMultipleTags = true,
  tagsLoading = false,
  onTagsChange,
}: PostComposerProps) {
  const publishLabel = composer.scheduleEnabled ? 'Skeduleer' : 'Publiseer';

  return (
    <section className="m-editor-composer" aria-label="Plasing-samesteller">
      <header className="m-editor-composer__header">
        <h2 className="m-editor-composer__title">
          {isEditing ? 'Wysig plasing' : 'Nuwe plasing'}
        </h2>
        <p className="m-editor-composer__hint">{blog.title}</p>
      </header>

      {isEditing && (
        <LbAlert variant="info" className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span>Wysig bestaande plasing. Wysigings word by stoor op die tydlyn toegepas.</span>
          <LbButton type="button" variant="secondary" onClick={onCancelEdit}>
            Kanselleer
          </LbButton>
        </LbAlert>
      )}

      <FreetypeFields
        selectedPostType={composer.selectedPostType}
        freetypeData={composer.freetypeData}
        onPostTypeChange={onPostTypeChange}
        onFreetypeDataChange={onFreetypeDataChange}
      />

      {!isFreetypeMode && (
        <div className="m-editor-composer__toolbar" role="toolbar" aria-label="Blok-tipes">
          {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              className="m-editor-composer__tool-btn"
              onClick={() => onAddBlock(type)}
              title={`Voeg ${label} by`}
              aria-label={`Voeg ${label} by`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="m-editor-composer__tool-label">{label}</span>
            </button>
          ))}
        </div>
      )}

      {!isFreetypeMode && (
        <div className="m-editor-composer__blocks">
          {composer.blocks.map((block, index) => (
            <div
              key={index}
              className={`m-editor-composer__block${block.type === 'Text' || block.type === 'Quote' ? ' m-editor-composer__block--rich-text' : ''}`}
            >
              {(block.type !== 'Text' && block.type !== 'Quote') || composer.blocks.length > 1 ? (
                <div className="m-editor-composer__block-head">
                  <span className="m-editor-composer__block-label">
                    {block.type === 'Text' ? 'Teks' : block.type === 'Quote' ? 'Aanhaling' : block.type}
                  </span>
                  {composer.blocks.length > 1 && (
                    <button
                      type="button"
                      className="m-editor-composer__block-remove"
                      onClick={() => onRemoveBlock(index)}
                      title="Verwyder blok"
                      aria-label="Verwyder blok"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
              ) : null}
              {block.type === 'Text' || block.type === 'Quote' ? (
                <RichTextBlockEditor
                  id={`block-text-${index}`}
                  value={String(block.data.text ?? '')}
                  onChange={(text) => onUpdateBlock(index, { text })}
                  onBlur={() => onRemoveBlockIfEmpty(index)}
                  placeholder="Skryf jou plasing…"
                />
              ) : block.type === 'Image' ? (
                <LbFormField label="Beeld-URL" htmlFor={`block-image-${index}`}>
                  <div className="mb-2">
                    <LbButton
                      type="button"
                      variant="secondary"
                      disabled={imageUploadingIndex === index}
                      onClick={() =>
                        document.getElementById(`block-image-file-${index}`)?.click()
                      }
                    >
                      {imageUploadingIndex === index ? 'Laai op…' : 'Laai beeld op'}
                    </LbButton>
                    <input
                      id={`block-image-file-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onUploadImage(index, file);
                        e.currentTarget.value = '';
                      }}
                    />
                  </div>
                  <LbInput
                    id={`block-image-${index}`}
                    type="url"
                    value={String(block.data.url ?? '')}
                    onChange={(e) => onUpdateBlock(index, { url: e.target.value })}
                    onBlur={() => onRemoveBlockIfEmpty(index)}
                    placeholder="https://…"
                  />
                  {String(block.data.url ?? '').trim() ? (
                    <img
                      src={String(block.data.url)}
                      alt=""
                      className="mt-2 max-h-40 rounded-lg border border-mar-border object-contain"
                    />
                  ) : null}
                </LbFormField>
              ) : block.type === 'Poll' ? (
                <div
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      onRemoveBlockIfEmpty(index);
                    }
                  }}
                >
                  <PollBlockEditor
                    pollBody={(block.data.pollBody as PollBody | null) ?? null}
                    onChange={(pollBody) => onUpdateBlock(index, { pollBody })}
                  />
                </div>
              ) : (
                <div
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      onRemoveBlockIfEmpty(index);
                    }
                  }}
                >
                  <EmbedPreview
                    url={String(block.data.url ?? '')}
                    embedMeta={(block.data.embedMeta as EmbedMeta | null) ?? null}
                    onChange={(data) => onUpdateBlock(index, data)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="m-editor-composer__options" role="toolbar" aria-label="Plasing-opsies">
        <button
          type="button"
          className={`m-editor-composer__option-btn${composer.sticky ? ' m-editor-composer__option-btn--active' : ''}`}
          onClick={() => onStickyChange(!composer.sticky)}
          title={composer.sticky ? 'Ontspeld' : 'Speld vas'}
          aria-label={composer.sticky ? 'Ontspeld' : 'Speld vas'}
          aria-pressed={composer.sticky}
        >
          <Pin className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={`m-editor-composer__option-btn${composer.highlight ? ' m-editor-composer__option-btn--active' : ''}`}
          onClick={() => onHighlightChange(!composer.highlight)}
          title={composer.highlight ? 'Verwyder beklemtoning' : 'Beklemtoon'}
          aria-label={composer.highlight ? 'Verwyder beklemtoning' : 'Beklemtoon'}
          aria-pressed={composer.highlight}
        >
          <Star className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={`m-editor-composer__option-btn${composer.scheduleEnabled ? ' m-editor-composer__option-btn--active' : ''}`}
          onClick={() => onScheduleEnabledChange(!composer.scheduleEnabled)}
          title="Skeduleer plasing"
          aria-label="Skeduleer plasing"
          aria-pressed={composer.scheduleEnabled}
        >
          <CalendarClock className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {composer.scheduleEnabled && (
        <LbFormField label="Publiseer op" htmlFor="composer-schedule">
          <LbInput
            id="composer-schedule"
            type="datetime-local"
            value={scheduledDatetimeLocal}
            onChange={(e) => onScheduledDatetimeChange(e.target.value)}
          />
        </LbFormField>
      )}

      <PostTagsSelector
        availableTags={globalTags}
        selectedTags={composer.tags}
        allowMultiple={allowMultipleTags}
        disabled={isSubmitting}
        isLoading={tagsLoading}
        onChange={onTagsChange}
      />

      <footer className="m-editor-composer__actions">
        {!isEditing && (
          <LbButton type="button" variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
            Stoor konsep
          </LbButton>
        )}
        <LbButton type="button" variant="primary" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Stoor…' : publishLabel}
        </LbButton>
      </footer>
    </section>
  );
}
