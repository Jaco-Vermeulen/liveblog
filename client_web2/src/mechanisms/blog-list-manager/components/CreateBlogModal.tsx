import { useEffect, useState } from 'react';
import { AF } from '@/copy';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { useAuth } from '@/mechanisms/auth-manager';
import {
  listSelectableThemes,
  listUsers,
  uploadErrorMessage,
  type LiveblogUser,
  type Theme,
} from '@/mechanisms/liveblog-api';
import { useBlogActions } from '../hooks/useBlogActions';
import { MemberUserPicker } from './MemberUserPicker';

export interface CreateBlogModalProps {
  open: boolean;
  onClose(): void;
  onCreated(): void;
}

export function CreateBlogModal({ open, onClose, onCreated }: CreateBlogModalProps) {
  const { state } = useAuth();
  const { createBlog, uploadCoverImage } = useBlogActions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeName, setThemeName] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [users, setUsers] = useState<LiveblogUser[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingThemes(true);
    setLoadingUsers(true);
    void Promise.all([
      listSelectableThemes()
        .then((items) => {
          setThemes(items);
          if (items[0]) setThemeName(items[0].name);
        })
        .catch(() => setError(AF.blogs.loadThemesError)),
      listUsers()
        .then((res) => setUsers(res._items))
        .catch(() => setError(AF.blogs.loadUsersError)),
    ]).finally(() => {
      setLoadingThemes(false);
      setLoadingUsers(false);
    });
  }, [open]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setCoverFile(null);
    setMemberIds([]);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !themeName) return;

    setSubmitting(true);
    setError(null);

    try {
      let pictureFields: {
        picture_url?: string;
        picture?: string;
        picture_renditions?: Record<string, unknown>;
      } = {};

      if (coverFile) {
        pictureFields = await uploadCoverImage(coverFile);
      }

      const members = memberIds.map((user) => ({ user }));
      await createBlog({
        title: title.trim(),
        description: description.trim(),
        members,
        blog_preferences: { theme: themeName },
        ...pictureFields,
      });

      onCreated();
      handleClose();
    } catch (err) {
      setError(uploadErrorMessage(err) || AF.blogs.createError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LbModal open={open} onClose={handleClose} title={AF.blogs.createModalTitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <LbAlert variant="error">{error}</LbAlert>}

        <LbFormField label={AF.blogs.titleField} htmlFor="create-blog-title">
          <LbInput
            id="create-blog-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </LbFormField>

        <LbFormField label={AF.blogs.description} htmlFor="create-blog-description">
          <textarea
            id="create-blog-description"
            className="min-h-[100px] w-full rounded-lg border border-mar-border bg-mar-input px-3 py-2 text-mar-text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </LbFormField>

        <LbFormField label={AF.blogs.coverImage} htmlFor="create-blog-cover">
          <input
            id="create-blog-cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="text-sm text-mar-muted"
          />
        </LbFormField>

        <MemberUserPicker
          users={users}
          selectedIds={memberIds}
          onChange={setMemberIds}
          loading={loadingUsers}
          excludeUserId={state.user?._id}
        />

        <LbFormField label={AF.blogs.theme} htmlFor="create-blog-theme">
          {loadingThemes ? (
            <LbSpinner tone="dark" />
          ) : (
            <select
              id="create-blog-theme"
              className="w-full rounded-lg border border-mar-border bg-mar-input px-3 py-2"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              required
            >
              {themes.map((theme) => (
                <option key={theme._id} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </select>
          )}
        </LbFormField>

        <div className="flex justify-end gap-2 pt-2">
          <LbButton type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
            Kanselleer
          </LbButton>
          <LbButton type="submit" variant="accent" disabled={submitting || loadingThemes}>
            {submitting ? 'Skep…' : 'Skep blog'}
          </LbButton>
        </div>
      </form>
    </LbModal>
  );
}
