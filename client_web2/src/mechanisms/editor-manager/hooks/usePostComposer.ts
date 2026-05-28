import { useCallback, useMemo, useState } from 'react';
import type { Blog, Post } from '@/mechanisms/liveblog-api';
import { uploadArchiveMedia } from '@/mechanisms/liveblog-api';
import { freetypeDataToPostItem, useFreetypesList } from '@/mechanisms/freetypes-manager';
import { DEFAULT_POST_TYPE } from '../subsystems/freetype-fields';
import {
  blocksToPostItems,
  freetypeHasContent,
  isBlockEmpty,
  loadFreetypeFromPost,
  postToBlocks,
} from '../services/blockTransform';
import {
  buildPublishSchedulePatch,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  scheduleEnabledFromPost,
} from '../services/composerSchedule';
import type { ComposerState, EditorPostType, SirTrevorBlock, SirTrevorBlockType } from '../types';
import { usePosts } from './usePosts';

const defaultBlock = (): SirTrevorBlock => ({ type: 'Text', data: { text: '' } });

export function usePostComposer(blog: Blog | undefined) {
  const blogId = blog?._id ?? '';
  const { savePost, saveDraft } = usePosts(blogId);
  const { freetypes } = useFreetypesList();

  const [blocks, setBlocks] = useState<SirTrevorBlock[]>([defaultBlock()]);
  const [sticky, setSticky] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadingIndex, setImageUploadingIndex] = useState<number | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<EditorPostType>(DEFAULT_POST_TYPE);
  const [freetypeData, setFreetypeData] = useState<Record<string, unknown>>({});

  const isFreetypeMode = selectedPostType !== DEFAULT_POST_TYPE;
  const isEditing = currentPost != null;

  const composer: ComposerState = {
    blocks,
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

  const loadPost = useCallback(
    (post: Post | null) => {
      setCurrentPost(post);
      if (post) {
        const loaded = loadFreetypeFromPost(post, freetypes);
        if (loaded) {
          setSelectedPostType(loaded.freetype);
          setFreetypeData(loaded.data);
          setBlocks([defaultBlock()]);
        } else {
          setSelectedPostType(DEFAULT_POST_TYPE);
          setFreetypeData({});
          setBlocks(postToBlocks(post).length ? postToBlocks(post) : [defaultBlock()]);
        }
        setSticky(Boolean(post.sticky));
        setHighlight(Boolean(post.lb_highlight));
        setTags(Array.isArray(post.tags) ? [...post.tags] : []);
        const future = scheduleEnabledFromPost(post.published_date);
        setScheduleEnabled(future);
        setScheduledDate(future ? post.published_date ?? null : null);
      } else {
        setSelectedPostType(DEFAULT_POST_TYPE);
        setFreetypeData({});
        setBlocks([defaultBlock()]);
        setSticky(false);
        setHighlight(false);
        setTags([]);
        setScheduleEnabled(false);
        setScheduledDate(null);
      }
      setIsDirty(false);
    },
    [freetypes],
  );

  const createBlock = (type: SirTrevorBlockType): SirTrevorBlock => {
    if (type === 'Embed') return { type, data: { url: '', embedMeta: null } };
    if (type === 'Poll') return { type, data: { pollBody: null } };
    if (type === 'Image') return { type, data: { url: '' } };
    if (type === 'Text') return defaultBlock();
    return { type, data: {} };
  };

  const addBlock = useCallback((type: SirTrevorBlockType) => {
    setBlocks((prev) => {
      const kept = prev.filter((block) => !isBlockEmpty(block));
      return [...kept, createBlock(type)];
    });
    setIsDirty(true);
  }, []);

  const removeBlock = useCallback((index: number) => {
    setBlocks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [defaultBlock()];
    });
    setIsDirty(true);
  }, []);

  const removeBlockIfEmpty = useCallback((index: number) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev;
      const block = prev[index];
      if (!block || !isBlockEmpty(block)) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [defaultBlock()];
    });
    setIsDirty(true);
  }, []);

  const updateBlock = useCallback((index: number, data: Record<string, unknown>) => {
    setBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, data: { ...block.data, ...data } } : block)),
    );
    setIsDirty(true);
  }, []);

  const uploadImage = useCallback(async (index: number, file: File) => {
    if (!file) return;
    setImageUploadingIndex(index);
    try {
      const uploaded = await uploadArchiveMedia(file);
      setBlocks((prev) =>
        prev.map((block, i) => {
          if (i !== index) return block;
          const media = {
            _id: uploaded.picture,
            renditions: uploaded.picture_renditions,
          };
          const currentMeta = (block.data.meta as Record<string, unknown> | undefined) ?? {};
          return {
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
          };
        }),
      );
      setIsDirty(true);
    } finally {
      setImageUploadingIndex(null);
    }
  }, []);

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
        ...resolveSchedulePatch(),
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    blogId,
    currentPost,
    highlight,
    reset,
    resolveItems,
    resolveSchedulePatch,
    savePost,
    sticky,
    tags,
  ]);

  const saveDraftAction = useCallback(async () => {
    if (!blogId) return;
    const items = resolveItems();
    setIsSubmitting(true);
    try {
      await saveDraft(currentPost, items, sticky, highlight, tags);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  }, [blogId, currentPost, highlight, reset, resolveItems, saveDraft, sticky, tags]);

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
    updateBlock,
    uploadImage,
    imageUploadingIndex,
    setPostType,
    updateFreetypeData,
    submit,
    saveDraft: saveDraftAction,
    reset,
    canSubmit,
    isSubmitting,
    isEditing,
    isFreetypeMode,
    setSticky,
    setHighlight,
    setTags: setTagsAction,
    setScheduleEnabled: setScheduleEnabledAction,
    setScheduledDateFromLocal,
    scheduledDatetimeLocal,
  };
}
