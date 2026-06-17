import { Check, ChevronRight, ImageIcon, Upload } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LbModal } from '@/components/ui/LbModal';
import { cn } from '@/lib/utils';
import { AF } from '@/copy';
import type { Blog } from '@/mechanisms/liveblog-api';
import {
  buildFeaturedImageLibraryOptions,
  isSameFeaturedSource,
  labelForFeaturedSource,
  previewUrlForFeaturedSource,
  type FeaturedImageOption,
  type FeaturedImageSource,
} from '../services/featuredImage';
import {
  featuredImageLibraryQueryKey,
  useFeaturedImageLibrary,
} from '../hooks/useFeaturedImageLibrary';
import type { SirTrevorBlock } from '../types';

export interface FeaturedImagePickerProps {
  blog: Blog;
  blocks: SirTrevorBlock[];
  source: FeaturedImageSource;
  uploading?: boolean;
  onSourceChange: (source: FeaturedImageSource) => void;
  onUpload: (file: File) => void | Promise<void>;
}

const featuredLabels = {
  get blogImage() {
    return AF.editor.featuredImage.blogImage;
  },
  get blogImageMissing() {
    return AF.editor.featuredImage.blogImageMissing;
  },
  postImage: AF.editor.featuredImage.postImage,
  libraryImage: AF.editor.featuredImage.libraryImage,
};

function PickerThumbnail({ url, className }: { url: string; className?: string }) {
  const [broken, setBroken] = useState(false);

  if (!url.trim() || broken) {
    return (
      <div
        className={cn(
          'flex aspect-square w-full items-center justify-center rounded-md bg-mar-beige text-mar-muted',
          className,
        )}
      >
        <ImageIcon className="h-5 w-5" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className={cn('rounded-md object-cover', className ?? 'aspect-square w-full')}
      onError={() => setBroken(true)}
    />
  );
}

function ImagePickerTile({
  label,
  selected,
  onClick,
  children,
  className,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      className={cn(
        'group relative flex flex-col gap-1 rounded-lg border p-1 text-left transition-colors',
        selected
          ? 'border-mar-teal bg-mar-teal/5 ring-1 ring-mar-teal'
          : 'border-mar-border hover:border-mar-teal/40 hover:bg-mar-beige',
        className,
      )}
      onClick={onClick}
    >
      {children}
      <span className="truncate px-0.5 text-[0.6875rem] leading-tight text-mar-text">{label}</span>
      {selected ? (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-mar-teal text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
        </span>
      ) : null}
    </button>
  );
}

function UploadTile({
  uploading,
  onPick,
}: {
  uploading: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label
      title={AF.editor.featuredImage.upload}
      className={cn(
        'flex cursor-pointer flex-col gap-1 rounded-lg border border-dashed p-1 transition-colors',
        uploading
          ? 'border-mar-border opacity-60'
          : 'border-mar-teal/50 bg-mar-teal/5 hover:border-mar-teal hover:bg-mar-teal/10',
      )}
    >
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-md px-1 text-mar-teal">
        <Upload className="h-5 w-5" aria-hidden />
        <span className="text-center text-[0.625rem] font-semibold leading-tight">
          {uploading ? AF.common.saving : AF.editor.featuredImage.uploadShort}
        </span>
      </div>
      <span className="truncate px-0.5 text-[0.6875rem] leading-tight text-mar-text">
        {AF.editor.featuredImage.upload}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = '';
        }}
      />
    </label>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="aspect-square animate-pulse rounded-lg border border-mar-border bg-mar-beige"
        />
      ))}
    </div>
  );
}

export function FeaturedImagePicker({
  blog,
  blocks,
  source,
  uploading = false,
  onSourceChange,
  onUpload,
}: FeaturedImagePickerProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const libraryQuery = useFeaturedImageLibrary(blog._id ?? '', open);
  const previewUrl = previewUrlForFeaturedSource(source, blocks, blog);

  const options = useMemo(() => {
    if (!libraryQuery.data) return [];
    return buildFeaturedImageLibraryOptions(
      blog,
      blocks,
      libraryQuery.data.pictures,
      libraryQuery.data.items,
      featuredLabels,
    );
  }, [blocks, blog, libraryQuery.data]);

  const currentLabel = labelForFeaturedSource(source, blog, options, {
    none: AF.editor.featuredImage.none,
    blogImage: AF.editor.featuredImage.blogImage,
    blogImageMissing: AF.editor.featuredImage.blogImageMissing,
    postImage: AF.editor.featuredImage.postImage,
    customUpload: AF.editor.featuredImage.customUpload,
  });

  const selectSource = (next: FeaturedImageSource) => {
    onSourceChange(next);
    setOpen(false);
  };

  const handleUpload = async (file: File) => {
    await onUpload(file);
    if (blog._id) {
      await queryClient.invalidateQueries({ queryKey: featuredImageLibraryQueryKey(blog._id) });
    }
    setOpen(false);
  };

  const renderOption = (option: FeaturedImageOption) => {
    const selected = isSameFeaturedSource(source, option.source);
    return (
      <ImagePickerTile
        key={option.key}
        label={option.label}
        selected={selected}
        onClick={() => selectSource(option.source)}
      >
        {option.url ? (
          <PickerThumbnail url={option.url} />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-md bg-mar-beige text-mar-muted">
            <ImageIcon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </ImagePickerTile>
    );
  };

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg border border-mar-border bg-white px-2.5 py-2 text-left text-sm transition-colors hover:bg-mar-beige disabled:opacity-60"
          aria-label={AF.editor.featuredImage.label}
          disabled={uploading}
          onClick={() => setOpen(true)}
        >
          {previewUrl ? (
            <PickerThumbnail url={previewUrl} className="h-9 w-9 shrink-0" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mar-beige text-mar-muted">
              <ImageIcon className="h-4 w-4" aria-hidden />
            </div>
          )}
          <span className="min-w-0 flex-1 truncate text-mar-text">
            <span className="text-mar-muted">{AF.editor.featuredImage.shortLabel}</span>
            <span className="text-mar-muted"> · </span>
            <span>{uploading ? AF.common.saving : currentLabel}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-mar-muted" aria-hidden />
        </button>
      </div>

      <LbModal
        open={open}
        onClose={() => setOpen(false)}
        title={AF.editor.featuredImage.modalTitle}
        className="max-w-lg"
      >
        <p className="mb-4 text-xs text-mar-muted">{AF.editor.featuredImage.hint}</p>

        {libraryQuery.isLoading ? (
          <LoadingGrid />
        ) : libraryQuery.isError ? (
          <p className="py-8 text-center text-sm text-red-600">{AF.editor.featuredImage.loadError}</p>
        ) : (
          <div className="grid max-h-[min(55vh,26rem)] grid-cols-4 gap-2 overflow-y-auto pr-1">
            <ImagePickerTile
              label={AF.editor.featuredImage.none}
              selected={source.type === 'none'}
              onClick={() => selectSource({ type: 'none' })}
            >
              <div className="flex aspect-square w-full items-center justify-center rounded-md bg-mar-beige text-mar-muted">
                <ImageIcon className="h-5 w-5" aria-hidden />
              </div>
            </ImagePickerTile>
            <UploadTile uploading={uploading} onPick={(file) => void handleUpload(file)} />
            {options.map(renderOption)}
          </div>
        )}
      </LbModal>
    </>
  );
}
