import { useState } from 'react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import type { Blog, LiveblogUser } from '@/mechanisms/liveblog-api';

export interface MembersSettingsProps {
  blog: Blog;
  memberUsers: LiveblogUser[];
  allUsers: LiveblogUser[];
  onSaveMembers(members: { user: string }[]): Promise<void>;
  isSaving: boolean;
}

export function MembersSettings({
  blog,
  memberUsers,
  allUsers,
  onSaveMembers,
  isSaving,
}: MembersSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    blog.members?.map((m) => m.user) ?? [],
  );

  const creatorId =
    typeof blog.original_creator === 'object'
      ? blog.original_creator._id
      : blog.original_creator;

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSave = async () => {
    const members = selectedIds.map((user) => ({ user }));
    await onSaveMembers(members);
    setEditing(false);
  };

  const creator =
    typeof blog.original_creator === 'object' ? blog.original_creator : null;

  return (
    <div className="m-settings-panel">
      <section className="mb-6">
        <h3 className="text-lg font-semibold">Eienaar</h3>
        {creator && (
          <p className="mt-2">
            <strong>{creator.display_name ?? creator.username}</strong>
            <span className="text-mar-muted"> — {creator.username}</span>
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Spanlede</h3>
          {!editing && (
            <LbButton type="button" variant="secondary" onClick={() => setEditing(true)}>
              Wysig span
            </LbButton>
          )}
        </div>

        {!editing && (
          <ul className="space-y-2">
            {memberUsers.length === 0 && (
              <li className="text-mar-muted text-sm">Geen spanlede nie</li>
            )}
            {memberUsers.map((user) => (
              <li key={user._id} className="rounded border border-mar-border bg-mar-input px-3 py-2">
                <strong>{user.display_name ?? user.username}</strong>
                <span className="text-mar-muted text-sm"> ({user.username})</span>
              </li>
            ))}
          </ul>
        )}

        {editing && (
          <div className="space-y-3">
            <LbAlert variant="info" className="text-sm">
              Kies gebruikers vir hierdie blog. Eienaar ({creatorId}) word nie verwyder nie.
            </LbAlert>
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded border border-mar-border p-2">
              {allUsers.map((user) => (
                <li key={user._id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-mar-beige">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user._id)}
                      onChange={() => toggleUser(user._id)}
                    />
                    <span>{user.display_name ?? user.username}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <LbButton type="button" variant="primary" disabled={isSaving} onClick={() => void handleSave()}>
                {isSaving ? 'Stoor…' : 'Stoor span'}
              </LbButton>
              <LbButton type="button" variant="secondary" onClick={() => setEditing(false)}>
                Kanselleer
              </LbButton>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
