import { GripVertical, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import type { PollBody } from '@/mechanisms/liveblog-api';
import { AF } from '@/copy';
import { EmbedPreview, type EmbedMeta } from '../subsystems/embed-handlers';
import { PollBlockEditor } from '../subsystems/polls';
import { RichTextBlockEditor } from '../subsystems/rich-text-editor';
import { ScorecardBlockEditor, type ScorecardBody } from '../subsystems/scorecard';
import type { SirTrevorBlock } from '../types';

function blockLabel(block: SirTrevorBlock): string {
  switch (block.type) {
    case 'Text':
      return AF.editor.blocks.text;
    case 'Quote':
      return AF.editor.blocks.quote;
    case 'Image':
      return AF.editor.blocks.image;
    case 'Embed':
      return AF.editor.blocks.embed;
    case 'Poll':
      return AF.editor.blocks.poll;
    case 'Scorecard':
      return AF.editor.blocks.scorecard;
    default:
      return block.type;
  }
}

export interface ComposerBlockListProps {
  blocks: SirTrevorBlock[];
  blockIds: string[];
  currentPostId?: string;
  onRemoveBlock: (index: number) => void;
  onRemoveBlockIfEmpty: (index: number) => void;
  onUpdateBlock: (index: number, data: Record<string, unknown>) => void;
  onReorderBlock: (fromIndex: number, toIndex: number) => void;
  onUploadImage: (index: number, file: File) => Promise<void> | void;
  onUploadScorecardAsset?: (
    index: number,
    target: 'home' | 'away' | 'background',
    file: File,
  ) => Promise<void> | void;
  imageUploadingIndex?: number | null;
  scorecardUploading?: 'home' | 'away' | 'background' | null;
}

export function ComposerBlockList({
  blocks,
  blockIds,
  currentPostId,
  onRemoveBlock,
  onRemoveBlockIfEmpty,
  onUpdateBlock,
  onReorderBlock,
  onUploadImage,
  onUploadScorecardAsset,
  imageUploadingIndex = null,
  scorecardUploading = null,
}: ComposerBlockListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const canReorder = blocks.length > 1;

  const clearDragState = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  const handleDragStart = useCallback((index: number, event: React.DragEvent<HTMLButtonElement>) => {
    setDragIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }, []);

  const handleDragOver = useCallback((index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (dropIndex !== index) {
      setDropIndex(index);
    }
  }, [dropIndex]);

  const handleDrop = useCallback(
    (index: number, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const fromRaw = event.dataTransfer.getData('text/plain');
      const fromIndex = dragIndex ?? Number(fromRaw);
      if (!Number.isNaN(fromIndex) && fromIndex !== index) {
        onReorderBlock(fromIndex, index);
      }
      clearDragState();
    },
    [clearDragState, dragIndex, onReorderBlock],
  );

  return (
    <div className="m-editor-composer__blocks">
      {blocks.map((block, index) => {
        const label = blockLabel(block);
        const showHead =
          (block.type !== 'Text' && block.type !== 'Quote') || blocks.length > 1;
        const blockKey = blockIds[index] ?? `${currentPostId ?? 'new'}-${index}`;

        return (
          <div
            key={blockKey}
            className={[
              'm-editor-composer__block',
              block.type === 'Text' || block.type === 'Quote'
                ? 'm-editor-composer__block--rich-text'
                : '',
              dragIndex === index ? 'm-editor-composer__block--dragging' : '',
              dropIndex === index && dragIndex !== index ? 'm-editor-composer__block--drop-target' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onDragOver={canReorder ? (event) => handleDragOver(index, event) : undefined}
            onDrop={canReorder ? (event) => handleDrop(index, event) : undefined}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDropIndex((current) => (current === index ? null : current));
              }
            }}
          >
            {showHead ? (
              <div className="m-editor-composer__block-head">
                <div className="m-editor-composer__block-head-start">
                  {canReorder ? (
                    <button
                      type="button"
                      className="m-editor-composer__block-drag"
                      draggable
                      onDragStart={(event) => handleDragStart(index, event)}
                      onDragEnd={clearDragState}
                      title={AF.editor.dragBlock}
                      aria-label={AF.editor.dragBlockAria(label)}
                    >
                      <GripVertical className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                  <span className="m-editor-composer__block-label">{label}</span>
                </div>
                {blocks.length > 1 ? (
                  <button
                    type="button"
                    className="m-editor-composer__block-remove"
                    onClick={() => onRemoveBlock(index)}
                    title={AF.editor.removeBlock}
                    aria-label={AF.editor.removeBlock}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            ) : canReorder ? (
              <div className="m-editor-composer__block-head m-editor-composer__block-head--drag-only">
                <button
                  type="button"
                  className="m-editor-composer__block-drag"
                  draggable
                  onDragStart={(event) => handleDragStart(index, event)}
                  onDragEnd={clearDragState}
                  title={AF.editor.dragBlock}
                  aria-label={AF.editor.dragBlockAria(label)}
                >
                  <GripVertical className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
            {block.type === 'Text' || block.type === 'Quote' ? (
              <RichTextBlockEditor
                key={`${currentPostId ?? 'new'}-rte-${blockKey}`}
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
                    onClick={() => document.getElementById(`block-image-file-${index}`)?.click()}
                  >
                    {imageUploadingIndex === index ? AF.editor.uploadingImage : AF.editor.uploadImage}
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
        );
      })}
    </div>
  );
}
