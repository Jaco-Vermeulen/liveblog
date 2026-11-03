import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listLanguages,
  listSelectableThemes,
  uploadArchiveMedia,
  uploadErrorMessage,
  fetchBlogCategories,
  type Blog,
  type LanguageOption,
  type Theme,
} from '@/mechanisms/liveblog-api';
import {
  buildBlogEmbedSnippets,
  pickBlogEmbedCode,
  resolveBlogPublicUrl,
} from '../services/blogEmbedCode';

export const POST_LIMIT_OPTIONS = [
  { label: 'Geen beperking', value: 0 },
  { label: '100', value: 100 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
  { label: '2000', value: 2000 },
  { label: '3000', value: 3000 },
] as const;

export const COMMENT_OPTIONS = [
  { label: 'Ongestel', value: 'unset' },
  { label: 'Aangeskakel', value: 'enabled' },
  { label: 'Afgeskakel', value: 'disabled' },
] as const;

export interface BlogGeneralForm {
  title: string;
  description: string;
  isActive: boolean;
  themeName: string;
  language: string;
  embedResponsive: boolean;
  category: string;
  blogKey: string;
  placementTags: string;
  pageUri: string;
  postsLimit: number;
  usersCanComment: string;
  pictureUrl: string;
  pictureId: string;
  pictureRenditions: Record<string, { href?: string }>;
}

export function parsePlacementTagsInput(value: string): string[] | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function themeNameFromBlog(blog: Blog): string {
  const theme = blog.blog_preferences?.theme;
  if (typeof theme === 'string') return theme;
  if (theme && typeof theme === 'object' && 'name' in theme) {
    return String((theme as { name?: string }).name ?? '');
  }
  return '';
}

function placementTagsFromBlog(blog: Blog): string[] | null | undefined {
  if ('placement_tags' in blog) {
    return blog.placement_tags;
  }
  const prefs = blog.blog_preferences as { placement_tags?: string[] | null } | undefined;
  if (prefs && 'placement_tags' in prefs) {
    return prefs.placement_tags;
  }
  return undefined;
}

export function blogToGeneralForm(blog: Blog): BlogGeneralForm {
  const prefs = blog.blog_preferences ?? {};
  const placement = placementTagsFromBlog(blog);
  return {
    title: blog.title,
    description: blog.description ?? '',
    isActive: blog.blog_status === 'open',
    themeName: themeNameFromBlog(blog),
    language: String(prefs.language ?? blog.language ?? ''),
    embedResponsive: Boolean(prefs.embed_height_responsive_default),
    category: String(blog.category ?? ''),
    blogKey: String(blog.blog_key ?? ''),
    placementTags: Array.isArray(placement) ? placement.join(', ') : '',
    pageUri: String(blog.main_page_url ?? ''),
    postsLimit: blog.posts_limit ?? 0,
    usersCanComment: String(blog.users_can_comment ?? 'unset'),
    pictureUrl: blog.picture_url ?? '',
    pictureId: blog.picture ?? '',
    pictureRenditions: (blog.picture_renditions ?? {}) as Record<string, { href?: string }>,
  };
}

export function buildBlogPatchFromForm(blog: Blog, form: BlogGeneralForm): Partial<Blog> {
  const creatorId =
    typeof blog.original_creator === 'object'
      ? blog.original_creator._id
      : blog.original_creator;

  const placementTags = parsePlacementTagsInput(form.placementTags);

  // Persist on the blog and inside blog_preferences so webhook reads still work
  // if one of the two paths is dropped by schema/ES mapping quirks.
  const blog_preferences = {
    ...blog.blog_preferences,
    theme: form.themeName,
    language: form.language || undefined,
    embed_height_responsive_default: form.embedResponsive,
    placement_tags: placementTags,
  };

  const patch: Partial<Blog> = {
    title: form.title,
    description: form.description,
    blog_status: form.isActive ? 'open' : 'closed',
    blog_preferences,
    posts_limit: form.postsLimit,
    users_can_comment: form.usersCanComment,
    category: form.category,
    blog_key: form.blogKey.trim() || '',
    placement_tags: placementTags,
    main_page_url: form.pageUri.trim() || null,
    original_creator: creatorId,
  };

  if (form.pictureId) {
    patch.picture = form.pictureId;
    patch.picture_url = form.pictureUrl;
    patch.picture_renditions = form.pictureRenditions;
  } else if (!form.pictureUrl && blog.picture) {
    patch.picture = undefined;
    patch.picture_url = undefined;
    patch.picture_renditions = undefined;
  }

  return patch;
}

export function useBlogGeneralSettings(blog: Blog | undefined) {
  const [form, setForm] = useState<BlogGeneralForm | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [blogCategories, setBlogCategories] = useState<string[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!blog) {
      setForm(null);
      return;
    }
    setForm(blogToGeneralForm(blog));
  }, [blog?._id, blog?._etag]);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const [themeItems, languageItems, categoryItems] = await Promise.all([
        listSelectableThemes(),
        listLanguages(),
        fetchBlogCategories(),
      ]);
      setThemes(themeItems);
      setLanguages(languageItems._items);
      setBlogCategories(categoryItems);
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const updateForm = useCallback((patch: Partial<BlogGeneralForm>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const publicUrl = blog ? resolveBlogPublicUrl(blog) : '';
  const embedSnippets = useMemo(
    () => (publicUrl ? buildBlogEmbedSnippets(publicUrl) : null),
    [publicUrl, form?.embedResponsive],
  );
  const embedCode =
    embedSnippets && form
      ? pickBlogEmbedCode(embedSnippets, form.embedResponsive)
      : '';

  const uploadPicture = useCallback(async (file: File) => {
    setUploadError(null);
    try {
      const uploaded = await uploadArchiveMedia(file);
      updateForm({
        pictureId: uploaded.picture,
        pictureUrl: uploaded.picture_url,
        pictureRenditions: uploaded.picture_renditions,
      });
    } catch (err) {
      setUploadError(uploadErrorMessage(err));
    }
  }, [updateForm]);

  const clearPicture = useCallback(() => {
    updateForm({ pictureId: '', pictureUrl: '', pictureRenditions: {} });
  }, [updateForm]);

  return {
    form,
    themes,
    languages,
    blogCategories,
    metaLoading,
    publicUrl,
    embedCode,
    updateForm,
    uploadPicture,
    uploadError,
    clearPicture,
    resetFromBlog: () => blog && setForm(blogToGeneralForm(blog)),
  };
}
