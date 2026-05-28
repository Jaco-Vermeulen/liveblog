import { LbFormField } from '@/components/ui/LbFormField';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';

type MemberUserPickerProps = {
  users: LiveblogUser[];
  selectedIds: string[];
  onChange(selectedIds: string[]): void;
  loading?: boolean;
  excludeUserId?: string;
};

export function MemberUserPicker({
  users,
  selectedIds,
  onChange,
  loading,
  excludeUserId,
}: MemberUserPickerProps) {
  const toggle = (userId: string) => {
    onChange(
      selectedIds.includes(userId)
        ? selectedIds.filter((id) => id !== userId)
        : [...selectedIds, userId],
    );
  };

  return (
    <LbFormField label="Spanlede (opsioneel)" htmlFor="create-blog-members">
      {loading ? (
        <LbSpinner tone="dark" />
      ) : (
        <ul
          id="create-blog-members"
          className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-mar-border p-2"
        >
          {users
            .filter((u) => u._id !== excludeUserId)
            .map((user) => (
              <li key={user._id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-mar-beige">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user._id)}
                    onChange={() => toggle(user._id)}
                  />
                  <span className="text-sm">
                    {user.display_name ?? user.username}
                    <span className="text-mar-muted"> ({user.username})</span>
                  </span>
                </label>
              </li>
            ))}
        </ul>
      )}
    </LbFormField>
  );
}
