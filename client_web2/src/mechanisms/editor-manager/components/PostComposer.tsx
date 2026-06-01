import {
  BarChart2,
  CalendarClock,
  ImageIcon,
  Link2,
  Pin,
  Star,
  Trophy,
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
import { ScorecardBlockEditor, type ScorecardBody } from '../subsystems/scorecard';
import { AF } from '@/copy';
import type { ComposerState, EditorPostType, SirTrevorBlockType } from '../types';
import { PostTagsSelector } from './PostTagsSelector';

const BLOCK_TYPES: {
  type: SirTrevorBlockType;
  label: string;
  icon: typeof Type;
}[] = [
  { type: 'Text', label: AF.editor.blocks.text, icon: Type },
  { type: 'Image', label: AF.editor.blocks.image, icon: ImageIcon },
  { type: 'Embed', label: AF.editor.blocks.embed, icon: Link2 },
  { type: 'Poll', label: AF.editor.blocks.poll, icon: BarChart2 },
  { type: 'Scorecard', label: AF.editor.blocks.scorecard, icon: Trophy },
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
  onUploadScorecardAsset?: (
    index: number,
    target: 'home' | 'away' | 'background',
    file: File,
  ) => Promise<void> | void;
  imageUploadingIndex?: number | null;
  scorecardUploading?: 'home' | 'away' | 'background' | null;
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
  onUploadScorecardAsset,
  imageUploadingIndex = null,
  scorecardUploading = null,
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
  const publishLabel = composer.scheduleEnabled ? AF.common.schedule : AF.common.publish;

  return (
    <section className="m-editor-composer" aria-label={AF.editor.composer}>
      <header className="m-editor-composer__header">
        <h2 className="m-editor-composer__title">
          {isEditing ? AF.editor.editPost : AF.editor.newPost}
        </h2>
        <p className="m-editor-composer__hint">{blog.title}</p>
      </header>

      {isEditing && (
        <LbAlert variant="info" className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span>{AF.editor.editPostHint}</span>
          <LbButton type="button" variant="secondary" onClick={onCancelEdit}>
            {AF.common.cancel}
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
        <div className="m-editor-composer__toolbar" role="toolbar" aria-label={AF.editor.blockTypes}>
          {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              className="m-editor-composer__tool-btn"
              onClick={() => onAddBlock(type)}
              title={AF.editor.addBlock(label)}
              aria-label={AF.editor.addBlock(label)}
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
                    {block.type === 'Text'
                      ? AF.editor.blocks.text
                      : block.type === 'Quote'
                        ? AF.editor.blocks.quote
                        : block.type === 'Image'
                          ? AF.editor.blocks.image
                          : block.type === 'Embed'
                            ? AF.editor.blocks.embed
                            : block.type === 'Poll'
                              ? AF.editor.blocks.poll
                              : block.type === 'Scorecard'
                                ? AF.editor.blocks.scorecard
                                : block.type}
                  </span>
                  {composer.blocks.length > 1 && (
                    <button
                      type="button"
                      className="m-editor-composer__block-remove"
                      onClick={() => onRemoveBlock(index)}
                      title={AF.editor.removeBlock}
                      aria-label={AF.editor.removeBlock}
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
                  placeholder={AF.editor.writePost}
                />
              ) : block.type === 'Image' ? (
                <LbFormField label={AF.editor.imageUrl} htmlFor={`block-image-${index}`}>
                  <div className="mb-2">
                    <LbButton
                      type="button"
                      variant="secondary"
                      disabled={imageUploadingIndex === index}
                      onClick={() =>
                        document.getElementById(`block-image-file-${index}`)?.click()
                      }
                    >
                      {imageUploadingIndex === index
                        ? AF.editor.uploadingImage
                        : AF.editor.uploadImage}
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
              ) : block.type === 'Scorecard' ? (
                <ScorecardBlockEditor
                  scorecardBody={(block.data.scorecardBody as ScorecardBody | null) ?? null}
                  onChange={(scorecardBody) => onUpdateBlock(index, { scorecardBody })}
                  onUploadLogo={(side, file) => onUploadScorecardAsset?.(index, side, file)}
                  onUploadBackground={(file) => onUploadScorecardAsset?.(index, 'background', file)}
                  uploadingSide={scorecardUploading}
                />
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

      <div className="m-editor-composer__options" role="toolbar" aria-label={AF.editor.postOptions}>
        <button
          type="button"
          className={`m-editor-composer__option-btn${composer.sticky ? ' m-editor-composer__option-btn--active' : ''}`}
          onClick={() => onStickyChange(!composer.sticky)}
          title={composer.sticky ? AF.editor.unpin : AF.editor.pin}
          aria-label={composer.sticky ? AF.editor.unpin : AF.editor.pin}
          aria-pressed={composer.sticky}
        >
          <Pin className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={`m-editor-composer__option-btn${composer.highlight ? ' m-editor-composer__option-btn--active' : ''}`}
          onClick={() => onHighlightChange(!composer.highlight)}
          title={composer.highlight ? AF.editor.removeHighlight : AF.editor.highlight}
          aria-label={composer.highlight ? AF.editor.removeHighlight : AF.editor.highlight}
          aria-pressed={composer.highlight}
        >
          <Star className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={`m-editor-composer__option-btn${composer.scheduleEnabled ? ' m-editor-composer__option-btn--active' : ''}`}
          onClick={() => onScheduleEnabledChange(!composer.scheduleEnabled)}
          title={AF.editor.schedulePost}
          aria-label={AF.editor.schedulePost}
          aria-pressed={composer.scheduleEnabled}
        >
          <CalendarClock className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {composer.scheduleEnabled && (
        <LbFormField label={AF.editor.publishAt} htmlFor="composer-schedule">
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
            {AF.editor.saveDraft}
          </LbButton>
        )}
        <LbButton type="button" variant="primary" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? AF.common.saving : publishLabel}
        </LbButton>
      </footer>
    </section>
  );
}
