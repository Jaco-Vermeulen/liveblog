import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/mechanisms/auth-manager';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbLoadingScreen } from '@/components/ui/LbLoadingScreen';
import { LiveblogApiError } from '@/mechanisms/liveblog-api';
import { BlogLivePreviewPane } from '../components/BlogLivePreviewPane';
import { ComposerDraftPreview } from '../components/ComposerDraftPreview';
import { canPublishPost } from '../services/blogSecurity';
import { EditorLayout } from '../components/EditorLayout';
import { PostComposer } from '../components/PostComposer';
import { Timeline } from '../components/Timeline';
import { useBlog } from '../hooks/useBlog';
import { useEditorViewMode } from '../hooks/useEditorViewMode';
import { useEditorWebSocket } from '../hooks/useEditorWebSocket';
import { usePostComposer } from '../hooks/usePostComposer';
import { useBlogHasWebhook } from '../hooks/useBlogHasWebhook';
import { usePosts } from '../hooks/usePosts';
import { useEditorEmbedRuntime } from '../hooks/useEditorEmbedRuntime';
import { useEditorLiveblogSettings } from '../hooks/useEditorLiveblogSettings';
import { useTimeline } from '../hooks/useTimeline';
import { applyPostsNotification } from '../services/applyPostsNotification';
import { composerToPreviewItems } from '../services/composerPreview';
import { createDualTimelineHandlers } from '../services/dualTimelineHandlers';
import { AF } from '@/copy';
import type { EditorPanel } from '../types';
import type { Post } from '@/mechanisms/liveblog-api';

function excludePost(posts: Post[], postId: string | null | undefined): Post[] {
  if (!postId) return posts;
  return posts.filter((post) => post._id !== postId);
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { blog, isLoading, error } = useBlog(id);
  const [panel, setPanel] = useState<EditorPanel>('editor');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [previewRefreshToken, setPreviewRefreshToken] = useState(0);
  const { viewMode, setViewMode, resetToEdit } = useEditorViewMode();

  const mainTimelineApi = useTimeline(id ?? '', { panel, sticky: false });
  const pinnedTimelineApi = useTimeline(id ?? '', { panel, sticky: true });
  const postsApi = usePosts(id ?? '');
  const { hasWebhook } = useBlogHasWebhook(id ?? '');
  const composerApi = usePostComposer(blog, hasWebhook);
  const { globalTags, allowMultipleTags, isLoading: tagsSettingsLoading } =
    useEditorLiveblogSettings();

  useEditorEmbedRuntime();

  useEffect(() => {
    if (error instanceof LiveblogApiError && error.status === 404) {
      navigate('/liveblog', { replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (panel !== 'editor') {
      resetToEdit();
    }
  }, [panel, resetToEdit]);

  const timelineHandlers = createDualTimelineHandlers(
    {
      removePost: mainTimelineApi.removePost,
      updatePost: mainTimelineApi.updatePost,
      addPost: mainTimelineApi.addPost,
      fetchNewPage: () => mainTimelineApi.fetchNewPage(),
    },
    {
      removePost: pinnedTimelineApi.removePost,
      updatePost: pinnedTimelineApi.updatePost,
      addPost: pinnedTimelineApi.addPost,
      fetchNewPage: () => pinnedTimelineApi.fetchNewPage(),
    },
  );

  useEditorWebSocket(id ?? '', {
    onPosts: (data) => {
      if (!id) return;
      applyPostsNotification(data, id, timelineHandlers);
      if (data.created || data.updated || data.deleted || data.scheduled_done) {
        setPreviewRefreshToken((prev) => prev + 1);
      }
    },
    onRemoveTimelinePost: ({ post_id }) => {
      mainTimelineApi.removePost(post_id);
      pinnedTimelineApi.removePost(post_id);
      setPreviewRefreshToken((prev) => prev + 1);
    },
  });

  const handleSubmit = async () => {
    setActionMessage(null);
    try {
      await composerApi.submit();
      await Promise.all([mainTimelineApi.fetchNewPage(), pinnedTimelineApi.fetchNewPage()]);
      if (!composerApi.composer.scheduleEnabled) {
        setPreviewRefreshToken((prev) => prev + 1);
      }
      setActionMessage(
        composerApi.composer.scheduleEnabled
          ? AF.editor.messages.postScheduled
          : AF.editor.messages.postPublished,
      );
    } catch (err) {
      const detail = err instanceof LiveblogApiError ? err.message : null;
      setActionMessage(
        detail ? AF.editor.errors.savePostDetail(detail) : AF.editor.errors.savePost,
      );
    }
  };

  const handleDelete = async (post: Parameters<typeof postsApi.deletePost>[0]) => {
    if (!window.confirm(AF.editor.confirmDeletePost)) return;
    try {
      await postsApi.deletePost(post);
      mainTimelineApi.removePost(post._id);
      pinnedTimelineApi.removePost(post._id);
      setPreviewRefreshToken((prev) => prev + 1);
    } catch {
      setActionMessage(AF.editor.errors.deletePost);
    }
  };

  const handlePublish = async (post: Parameters<typeof postsApi.publishPost>[0]) => {
    try {
      await postsApi.publishPost(post);
      await Promise.all([mainTimelineApi.fetchNewPage(), pinnedTimelineApi.fetchNewPage()]);
      setPreviewRefreshToken((prev) => prev + 1);
    } catch {
      setActionMessage(AF.editor.errors.publishPost);
    }
  };

  const handleUnpublish = async (post: Parameters<typeof postsApi.unpublishPost>[0]) => {
    if (!window.confirm(AF.editor.confirmUnpublish)) return;
    try {
      await postsApi.unpublishPost(post);
      mainTimelineApi.removePost(post._id);
      pinnedTimelineApi.removePost(post._id);
      setPreviewRefreshToken((prev) => prev + 1);
      setActionMessage(AF.editor.messages.postUnpublished);
    } catch {
      setActionMessage(AF.editor.errors.unpublishPost);
    }
  };

  const handleTogglePin = async (post: Parameters<typeof postsApi.togglePostPin>[0]) => {
    try {
      const updated = await postsApi.togglePostPin(post);
      timelineHandlers.updatePost(updated);
    } catch {
      setActionMessage(AF.editor.errors.pinPost);
    }
  };

  const handleToggleHighlight = async (
    post: Parameters<typeof postsApi.togglePostHighlight>[0],
  ) => {
    try {
      const updated = await postsApi.togglePostHighlight(post);
      mainTimelineApi.updatePost(updated);
      pinnedTimelineApi.updatePost(updated);
    } catch {
      setActionMessage(AF.editor.errors.highlightPost);
    }
  };

  const canEditPosts = blog ? canPublishPost(authState.user, blog) : false;

  const editingPostIdForPreview =
    composerApi.isEditing && composerApi.composer.isDirty && composerApi.composer.currentPost
      ? composerApi.composer.currentPost._id
      : null;

  const pinnedPreviewPosts = excludePost(pinnedTimelineApi.posts, editingPostIdForPreview);
  const mainPreviewPosts = excludePost(mainTimelineApi.posts, editingPostIdForPreview);
  const previewPosts = [...pinnedPreviewPosts, ...mainPreviewPosts];
  const draftPreviewItems = composerToPreviewItems(composerApi.composer);
  const draftPortalEnabled =
    composerApi.composer.isDirty || draftPreviewItems.length > 0;

  const renderTimeline = (
    pinned: Post[],
    main: Post[],
    variant: 'default' | 'preview',
  ) => (
    <>
      {pinned.length > 0 ? (
        <Timeline
          timeline={pinnedTimelineApi.timeline}
          posts={pinned}
          hasMore={pinnedTimelineApi.hasMore}
          allowPinHighlight={canEditPosts}
          variant={variant}
          onPostSelect={composerApi.loadPost}
          onLoadMore={() => void pinnedTimelineApi.fetchNextPage()}
          onDeletePost={canEditPosts ? (post) => void handleDelete(post) : undefined}
          onPublishPost={canEditPosts ? (post) => void handlePublish(post) : undefined}
          onUnpublishPost={canEditPosts ? (post) => void handleUnpublish(post) : undefined}
          onTogglePin={canEditPosts ? (post) => void handleTogglePin(post) : undefined}
          onToggleHighlight={canEditPosts ? (post) => void handleToggleHighlight(post) : undefined}
        />
      ) : null}
      <Timeline
        timeline={mainTimelineApi.timeline}
        posts={main}
        hasMore={mainTimelineApi.hasMore}
        allowPinHighlight={canEditPosts}
        variant={variant}
        onPostSelect={composerApi.loadPost}
        onLoadMore={() => void mainTimelineApi.fetchNextPage()}
        onDeletePost={canEditPosts ? (post) => void handleDelete(post) : undefined}
        onPublishPost={canEditPosts ? (post) => void handlePublish(post) : undefined}
        onUnpublishPost={canEditPosts ? (post) => void handleUnpublish(post) : undefined}
        onTogglePin={canEditPosts ? (post) => void handleTogglePin(post) : undefined}
        onToggleHighlight={canEditPosts ? (post) => void handleToggleHighlight(post) : undefined}
      />
    </>
  );

  const previewTimeline = renderTimeline(pinnedPreviewPosts, mainPreviewPosts, 'preview');

  if (isLoading || !blog) {
    return <LbLoadingScreen message={AF.editor.loadingBlog} />;
  }

  if (error && !(error instanceof LiveblogApiError && error.status === 404)) {
    return (
      <LbAlert variant="error">
        {error instanceof Error ? error.message : AF.editor.loadBlogError}
      </LbAlert>
    );
  }

  return (
    <div className="lb-route-fill lb-route-fill--editor">
      {actionMessage ? (
        <LbAlert variant="info" className="mx-4 mt-4 shrink-0">
          {actionMessage}
        </LbAlert>
      ) : null}
      <div className="lb-route-fill__workspace">
        <EditorLayout
        blog={blog}
        user={authState.user}
        panel={panel}
        onPanelChange={setPanel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewModeSwitch={panel === 'editor'}
        preview={
          <BlogLivePreviewPane
            blog={blog}
            immersive={viewMode === 'preview'}
            refreshToken={previewRefreshToken}
            posts={previewPosts}
            draftPortalEnabled={draftPortalEnabled}
            allowPinHighlight={canEditPosts}
            onPostSelect={composerApi.loadPost}
            onDeletePost={canEditPosts ? (post) => void handleDelete(post) : undefined}
            onPublishPost={canEditPosts ? (post) => void handlePublish(post) : undefined}
            onTogglePin={canEditPosts ? (post) => void handleTogglePin(post) : undefined}
            onToggleHighlight={canEditPosts ? (post) => void handleToggleHighlight(post) : undefined}
            draftSlot={
              <ComposerDraftPreview
                composer={composerApi.composer}
                user={authState.user}
              />
            }
          >
            {previewTimeline}
          </BlogLivePreviewPane>
        }
        composer={
          <PostComposer
            blog={blog}
            hasWebhook={hasWebhook}
            composer={composerApi.composer}
            canSubmit={composerApi.canSubmit}
            isSubmitting={composerApi.isSubmitting}
            isEditing={composerApi.isEditing}
            isFreetypeMode={composerApi.isFreetypeMode}
            scheduledDatetimeLocal={composerApi.scheduledDatetimeLocal}
            onAddBlock={composerApi.addBlock}
            onRemoveBlock={composerApi.removeBlock}
            onRemoveBlockIfEmpty={composerApi.removeBlockIfEmpty}
            onReorderBlock={composerApi.reorderBlocks}
            onUpdateBlock={composerApi.updateBlock}
            onUploadImage={composerApi.uploadImage}
            onUploadScorecardAsset={composerApi.uploadScorecardAsset}
            imageUploadingIndex={composerApi.imageUploadingIndex}
            scorecardUploading={composerApi.scorecardUploading}
            onPostTypeChange={composerApi.setPostType}
            onFreetypeDataChange={composerApi.updateFreetypeData}
            onScheduleEnabledChange={composerApi.setScheduleEnabled}
            onScheduledDatetimeChange={composerApi.setScheduledDateFromLocal}
            onCancelEdit={() => composerApi.reset()}
            onSubmit={() => void handleSubmit()}
            onSaveDraft={() =>
              void composerApi
                .saveDraft()
                .then(() =>
                  Promise.all([mainTimelineApi.fetchNewPage(), pinnedTimelineApi.fetchNewPage()]),
                )
            }
            onHeadlineChange={composerApi.setHeadline}
            onShowHeadlineChange={composerApi.setShowHeadline}
            onFeaturedImageSourceChange={composerApi.setFeaturedImageSource}
            onUploadFeaturedImage={(file) => void composerApi.uploadFeaturedImage(file)}
            featuredImageUploading={composerApi.featuredImageUploading}
            uploadError={composerApi.uploadError}
            onStickyChange={composerApi.setSticky}
            onHighlightChange={composerApi.setHighlight}
            globalTags={globalTags}
            allowMultipleTags={allowMultipleTags}
            tagsLoading={tagsSettingsLoading}
            onTagsChange={composerApi.setTags}
          />
        }
        />
      </div>
    </div>
  );
}
