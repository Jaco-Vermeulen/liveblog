import {
  BarChart2,
  CalendarClock,
  ImageIcon,
  Link2,
  Pin,
  Star,
  Trophy,
  Type,
} from 'lucide-react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import type { Blog } from '@/mechanisms/liveblog-api';
import { FreetypeFields } from '../subsystems/freetype-fields';
import { AF } from '@/copy';
import type { ComposerState, EditorPostType, SirTrevorBlockType } from '../types';
import { PostTagsSelector } from './PostTagsSelector';
import { FeaturedImagePicker } from './FeaturedImagePicker';
import type { FeaturedImageSource } from '../services/featuredImage';
import { ComposerBlockList } from './ComposerBlockList';

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
  hasWebhook?: boolean;
  composer: ComposerState;
  canSubmit: boolean;
  isSubmitting: boolean;
  isEditing?: boolean;
  isFreetypeMode?: boolean;
  scheduledDatetimeLocal?: string;
  onAddBlock: (type: SirTrevorBlockType) => void;
  onRemoveBlock: (index: number) => void;
  onRemoveBlockIfEmpty: (index: number) => void;
  onReorderBlock: (fromIndex: number, toIndex: number) => void;
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
  onHeadlineChange: (headline: string) => void;
  onShowHeadlineChange: (show: boolean) => void;
  onFeaturedImageSourceChange: (source: FeaturedImageSource) => void;
  onUploadFeaturedImage: (file: File) => void;
  featuredImageUploading?: boolean;
  uploadError?: string | null;
  onStickyChange: (sticky: boolean) => void;
  onHighlightChange: (highlight: boolean) => void;
  globalTags?: string[];
  allowMultipleTags?: boolean;
  tagsLoading?: boolean;
  onTagsChange: (tags: string[]) => void;
}

export function PostComposer({
  blog,
  hasWebhook = false,
  composer,
  canSubmit,
  isSubmitting,
  isEditing = false,
  isFreetypeMode = false,
  scheduledDatetimeLocal = '',
  onAddBlock,
  onRemoveBlock,
  onRemoveBlockIfEmpty,
  onReorderBlock,
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
  onHeadlineChange,
  onShowHeadlineChange,
  onFeaturedImageSourceChange,
  onUploadFeaturedImage,
  featuredImageUploading = false,
  uploadError = null,
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

      {uploadError ? (
        <LbAlert variant="error" className="mb-4" role="alert">
          {uploadError}
        </LbAlert>
      ) : null}

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

      {hasWebhook ? (
        <>
          <LbFormField label={AF.editor.entryTitle} htmlFor="composer-entry-title">
            <LbInput
              id="composer-entry-title"
              type="text"
              value={composer.headline}
              placeholder={AF.editor.entryTitlePlaceholder}
              onChange={(e) => onHeadlineChange(e.target.value)}
            />
          </LbFormField>

          {!isFreetypeMode && (
            <FeaturedImagePicker
              blog={blog}
              blocks={composer.blocks}
              source={composer.featuredImageSource}
              uploading={featuredImageUploading}
              onSourceChange={onFeaturedImageSourceChange}
              onUpload={onUploadFeaturedImage}
            />
          )}
        </>
      ) : (
        <>
          <label className="mb-4 flex items-center gap-2 text-sm text-mar-text">
            <input
              type="checkbox"
              checked={composer.showHeadline}
              onChange={(e) => onShowHeadlineChange(e.target.checked)}
            />
            <span className="font-medium">{AF.editor.addCustomTitle}</span>
          </label>

          {composer.showHeadline ? (
            <LbFormField label={AF.editor.entryTitle} htmlFor="composer-entry-title">
              <LbInput
                id="composer-entry-title"
                type="text"
                value={composer.headline}
                placeholder={AF.editor.entryTitlePlaceholder}
                onChange={(e) => onHeadlineChange(e.target.value)}
              />
            </LbFormField>
          ) : null}
        </>
      )}

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
        <ComposerBlockList
          blocks={composer.blocks}
          blockIds={composer.blockIds}
          currentPostId={composer.currentPost?._id}
          editSession={composer.editSession}
          onRemoveBlock={onRemoveBlock}
          onRemoveBlockIfEmpty={onRemoveBlockIfEmpty}
          onReorderBlock={onReorderBlock}
          onUpdateBlock={onUpdateBlock}
          onUploadImage={onUploadImage}
          onUploadScorecardAsset={onUploadScorecardAsset}
          imageUploadingIndex={imageUploadingIndex}
          scorecardUploading={scorecardUploading}
        />
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
