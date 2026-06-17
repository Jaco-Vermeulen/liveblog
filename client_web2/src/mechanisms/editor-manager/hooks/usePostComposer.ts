import { useCallback, useMemo, useState } from 'react';
import type { Blog, Post } from '@/mechanisms/liveblog-api';
import { uploadArchiveMedia, uploadErrorMessage } from '@/mechanisms/liveblog-api';
import { freetypeDataToPostItem, useFreetypesList } from '@/mechanisms/freetypes-manager';
import { DEFAULT_POST_TYPE } from '../subsystems/freetype-fields';
import { defaultScorecardBody, normalizeScorecardBody } from '../subsystems/scorecard';
import {
  blocksToPostItems,
  freetypeHasContent,
  isBlockEmpty,
  loadFreetypeFromPost,
  loadScorecardFromPost,
  postToBlocks,
} from '../services/blockTransform';
import {
  buildPublishSchedulePatch,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  scheduleEnabledFromPost,
} from '../services/composerSchedule';
import type { ComposerState, EditorPostType, SirTrevorBlock, SirTrevorBlockType } from '../types';
import { newComposerBlockKey } from '../services/composerBlockKeys';
import { reorderArray } from '../services/reorderArray';
import {
  featuredImageSourceFromPost,
  resolveFeaturedImagePatch,
  type FeaturedImageSource,
} from '../services/featuredImage';
import { usePosts } from './usePosts';

const defaultBlock = (): SirTrevorBlock => ({ type: 'Text', data: { text: '' } });

function toEntries(blocks: SirTrevorBlock[]): { id: string; block: SirTrevorBlock }[] {
  return blocks.map((block) => ({ id: newComposerBlockKey(), block }));
}

function entryFromBlock(block: SirTrevorBlock): { id: string; block: SirTrevorBlock } {
  return { id: newComposerBlockKey(), block };
}

export function usePostComposer(blog: Blog | undefined, hasWebhook = false) {
  const blogId = blog?._id ?? '';
  const { savePost } = usePosts(blogId);
  const { freetypes } = useFreetypesList();

  const [entries, setEntries] = useState(() => [entryFromBlock(defaultBlock())]);
  const [headline, setHeadline] = useState('');
  const [showHeadline, setShowHeadline] = useState(false);
  const [featuredImageSource, setFeaturedImageSource] = useState<FeaturedImageSource>({
    type: 'none',
  });
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadingIndex, setImageUploadingIndex] = useState<number | null>(null);
  const [scorecardUploading, setScorecardUploading] = useState<'home' | 'away' | 'background' | null>(
    null,
  );
  const [selectedPostType, setSelectedPostType] = useState<EditorPostType>(DEFAULT_POST_TYPE);
  const [freetypeData, setFreetypeData] = useState<Record<string, unknown>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isFreetypeMode = selectedPostType !== DEFAULT_POST_TYPE;
  const isEditing = currentPost != null;

  const blocks = useMemo(() => entries.map((entry) => entry.block), [entries]);
  const blockIds = useMemo(() => entries.map((entry) => entry.id), [entries]);

  const composer: ComposerState = {
    blocks,
    blockIds,
    headline,
    showHeadline,
    featuredImageSource,
    sticky,
    highlight,
    tags,
    scheduleEnabled,
    scheduledDate,
    isDirty,
    currentPost,
    selectedPostType,
    freetypeData,
  };

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!isDirty) return false;
    if (scheduleEnabled && !scheduledDate) return false;
    if (isFreetypeMode) {
      return freetypeHasContent(selectedPostType.template, freetypeData);
    }
    return blocksToPostItems(blocks).length > 0;
  }, [
    blocks,
    freetypeData,
    isDirty,
    isFreetypeMode,
    isSubmitting,
    scheduleEnabled,
    scheduledDate,
    selectedPostType,
  ]);

  const blurComposerEditor = useCallback(() => {
    if (typeof document === 'undefined') return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('.m-rich-text-editor__body')) {
      active.blur();
    }
  }, []);

  const loadPost = useCallback(
    (post: Post | null) => {
      blurComposerEditor();
      setCurrentPost(post);
      if (post) {
        const scorecardBody = loadScorecardFromPost(post);
        if (scorecardBody) {
          setSelectedPostType(DEFAULT_POST_TYPE);
          setFreetypeData({});
          setEntries([entryFromBlock({ type: 'Scorecard', data: { scorecardBody } })]);
        } else {
        const loaded = loadFreetypeFromPost(post, freetypes);
        if (loaded) {
          setSelectedPostType(loaded.freetype);
          setFreetypeData(loaded.data);
          setEntries([entryFromBlock(defaultBlock())]);
        } else {
          setSelectedPostType(DEFAULT_POST_TYPE);
          setFreetypeData({});
          const loadedBlocks = postToBlocks(post).length ? postToBlocks(post) : [defaultBlock()];
          setEntries(toEntries(loadedBlocks));
        }
        }
        setHeadline(post.headline ?? '');
        setShowHeadline(Boolean(post.show_headline));
        setFeaturedImageSource(featuredImageSourceFromPost(post));
        setSticky(Boolean(post.sticky));
        setHighlight(Boolean(post.lb_highlight));
        setTags(Array.isArray(post.tags) ? [...post.tags] : []);
        const future = scheduleEnabledFromPost(post.published_date);
        setScheduleEnabled(future);
        setScheduledDate(future ? post.published_date ?? null : null);
      } else {
        setSelectedPostType(DEFAULT_POST_TYPE);
        setFreetypeData({});
        setEntries([entryFromBlock(defaultBlock())]);
        setHeadline('');
        setShowHeadline(false);
        setFeaturedImageSource({ type: 'none' });
        setSticky(false);
        setHighlight(false);
        setTags([]);
        setScheduleEnabled(false);
        setScheduledDate(null);
      }
      setIsDirty(false);
    },
    [blurComposerEditor, freetypes],
  );

  const createBlock = (type: SirTrevorBlockType): SirTrevorBlock => {
    if (type === 'Embed') return { type, data: { url: '', embedMeta: null } };
    if (type === 'Poll') {
      return {
        type,
        data: {
          pollBody: {
            question: '',
            answers: [
              { option: '', votes: 0 },
              { option: '', votes: 0 },
            ],
            active_until: '',
          },
        },
      };
    }
    if (type === 'Image') return { type, data: { url: '' } };
    if (type === 'Scorecard') {
      return { type, data: { scorecardBody: defaultScorecardBody() } };
    }
    if (type === 'Text') return defaultBlock();
    return { type, data: {} };
  };

  const addBlock = useCallback((type: SirTrevorBlockType) => {
    setEntries((prev) => {
      const kept = prev.filter((entry) => !isBlockEmpty(entry.block));
      return [...kept, entryFromBlock(createBlock(type))];
    });
    setIsDirty(true);
  }, []);

  const removeBlock = useCallback((index: number) => {
    setEntries((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [entryFromBlock(defaultBlock())];
    });
    setIsDirty(true);
  }, []);

  const removeBlockIfEmpty = useCallback((index: number) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      const entry = prev[index];
      if (!entry || !isBlockEmpty(entry.block)) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [entryFromBlock(defaultBlock())];
    });
    setIsDirty(true);
  }, []);

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setEntries((prev) => reorderArray(prev, fromIndex, toIndex));
    setIsDirty(true);
  }, []);

  const updateBlock = useCallback((index: number, data: Record<string, unknown>) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, block: { ...entry.block, data: { ...entry.block.data, ...data } } } : entry,
      ),
    );
    setIsDirty(true);
  }, []);

  const reportUploadError = useCallback((err: unknown) => {
    setUploadError(uploadErrorMessage(err));
  }, []);

  const uploadScorecardAsset = useCallback(
    async (index: number, target: 'home' | 'away' | 'background', file: File) => {
      if (!file) return;
      setUploadError(null);
      setScorecardUploading(target);
      try {
        const uploaded = await uploadArchiveMedia(file);
        setEntries((prev) =>
          prev.map((entry, i) => {
            if (i !== index || entry.block.type !== 'Scorecard') return entry;
            const body = normalizeScorecardBody(entry.block.data.scorecardBody);
            if (target === 'background') {
              return {
                ...entry,
                block: {
                  ...entry.block,
                  data: { scorecardBody: { ...body, backgroundUrl: uploaded.picture_url } },
                },
              };
            }
            const team = target === 'home' ? 'home' : 'away';
            return {
              ...entry,
              block: {
                ...entry.block,
                data: {
                  scorecardBody: {
                    ...body,
                    [team]: { ...body[team], logoUrl: uploaded.picture_url },
                  },
                },
              },
            };
          }),
        );
        setIsDirty(true);
      } catch (err) {
        reportUploadError(err);
      } finally {
        setScorecardUploading(null);
      }
    },
    [reportUploadError],
  );

  const uploadImage = useCallback(async (index: number, file: File) => {
    if (!file) return;
    setUploadError(null);
    setImageUploadingIndex(index);
    try {
      const uploaded = await uploadArchiveMedia(file);
      setEntries((prev) =>
        prev.map((entry, i) => {
          if (i !== index) return entry;
          const block = entry.block;
          const media = {
            _id: uploaded.picture,
            renditions: uploaded.picture_renditions,
          };
          const currentMeta = (block.data.meta as Record<string, unknown> | undefined) ?? {};
          return {
            ...entry,
            block: {
              ...block,
              data: {
                ...block.data,
                url: uploaded.picture_url,
                picture_url: uploaded.picture_url,
                media,
                meta: {
                  ...currentMeta,
                  media,
                },
              },
            },
          };
        }),
      );
      setIsDirty(true);
    } catch (err) {
      reportUploadError(err);
    } finally {
      setImageUploadingIndex(null);
    }
  }, [reportUploadError]);

  const setPostType = useCallback((postType: EditorPostType) => {
    setSelectedPostType(postType);
    setIsDirty(true);
  }, []);

  const updateFreetypeData = useCallback((data: Record<string, unknown>) => {
    setFreetypeData(data);
    setIsDirty(true);
  }, []);

  const setTagsAction = useCallback((next: string[]) => {
    setTags(next);
    setIsDirty(true);
  }, []);

  const setHeadlineAction = useCallback((value: string) => {
    setHeadline(value);
    setIsDirty(true);
  }, []);

  const setShowHeadlineAction = useCallback((value: boolean) => {
    setShowHeadline(value);
    if (!value) {
      setHeadline('');
    }
    setIsDirty(true);
  }, []);

  const setScheduleEnabledAction = useCallback((enabled: boolean) => {
    setScheduleEnabled(enabled);
    if (!enabled) {
      setScheduledDate(null);
    } else if (!scheduledDate) {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 30);
      setScheduledDate(d.toISOString());
    }
    setIsDirty(true);
  }, [scheduledDate]);

  const setScheduledDateFromLocal = useCallback((local: string) => {
    setScheduledDate(datetimeLocalToIso(local));
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    loadPost(null);
  }, [loadPost]);

  const resolveItems = useCallback(() => {
    if (isFreetypeMode) {
      return [freetypeDataToPostItem(selectedPostType.name, selectedPostType.template, freetypeData)];
    }
    return blocksToPostItems(blocks);
  }, [blocks, freetypeData, isFreetypeMode, selectedPostType]);

  const resolveFeaturedPatch = useCallback(
    () =>
      hasWebhook ? resolveFeaturedImagePatch(featuredImageSource, blocks, currentPost) ?? {} : {},
    [blocks, currentPost, featuredImageSource, hasWebhook],
  );

  const resolveHeadlinePatch = useCallback(() => {
    if (hasWebhook) {
      return {
        headline: headline.trim(),
        show_headline: false,
      };
    }
    return {
      headline: showHeadline ? headline.trim() : '',
      show_headline: showHeadline,
    };
  }, [hasWebhook, headline, showHeadline]);

  const uploadFeaturedImage = useCallback(async (file: File) => {
    setUploadError(null);
    setFeaturedImageUploading(true);
    try {
      const uploaded = await uploadArchiveMedia(file);
      setFeaturedImageSource({
        type: 'custom',
        picture: uploaded.picture,
        picture_url: uploaded.picture_url,
        picture_renditions: uploaded.picture_renditions,
      });
      setIsDirty(true);
    } catch (err) {
      reportUploadError(err);
    } finally {
      setFeaturedImageUploading(false);
    }
  }, [reportUploadError]);

  const setFeaturedImageSourceAction = useCallback((source: FeaturedImageSource) => {
    setFeaturedImageSource(source);
    setIsDirty(true);
  }, []);

  const resolveSchedulePatch = useCallback(() => {
    if (scheduleEnabled && scheduledDate) {
      return buildPublishSchedulePatch(true, scheduledDate);
    }
    if (!currentPost) {
      return buildPublishSchedulePatch(false, null);
    }
    return {};
  }, [currentPost, scheduleEnabled, scheduledDate]);

  const submit = useCallback(async () => {
    if (!blogId) return;
    const items = resolveItems();
    if (!items.length) return;

    setIsSubmitting(true);
    try {
      await savePost(items, {
        post: currentPost,
        post_status: 'open',
        sticky,
        lb_highlight: highlight,
        tags,
        ...resolveHeadlinePatch(),
        ...resolveFeaturedPatch(),
        ...resolveSchedulePatch(),
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    blogId,
    currentPost,
    headline,
    highlight,
    reset,
    resolveHeadlinePatch,
    resolveItems,
    resolveFeaturedPatch,
    resolveSchedulePatch,
    savePost,
    showHeadline,
    sticky,
    tags,
  ]);

  const saveDraftAction = useCallback(async () => {
    if (!blogId) return;
    const items = resolveItems();
    setIsSubmitting(true);
    try {
      await savePost(items, {
        post: currentPost,
        post_status: 'draft',
        sticky,
        lb_highlight: highlight,
        tags,
        ...resolveHeadlinePatch(),
        ...resolveFeaturedPatch(),
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    blogId,
    currentPost,
    headline,
    highlight,
    reset,
    resolveHeadlinePatch,
    resolveFeaturedPatch,
    resolveItems,
    savePost,
    showHeadline,
    sticky,
    tags,
  ]);

  const scheduledDatetimeLocal = useMemo(
    () => isoToDatetimeLocal(scheduledDate),
    [scheduledDate],
  );

  return {
    composer,
    loadPost,
    addBlock,
    removeBlock,
    removeBlockIfEmpty,
    reorderBlocks,
    updateBlock,
    uploadImage,
    uploadScorecardAsset,
    imageUploadingIndex,
    scorecardUploading,
    setPostType,
    updateFreetypeData,
    submit,
    saveDraft: saveDraftAction,
    reset,
    canSubmit,
    isSubmitting,
    isEditing,
    isFreetypeMode,
    setHeadline: setHeadlineAction,
    setShowHeadline: setShowHeadlineAction,
    setFeaturedImageSource: setFeaturedImageSourceAction,
    uploadFeaturedImage,
    featuredImageUploading,
    uploadError,
    setSticky,
    setHighlight,
    setTags: setTagsAction,
    setScheduleEnabled: setScheduleEnabledAction,
    setScheduledDateFromLocal,
    scheduledDatetimeLocal,
  };
}
