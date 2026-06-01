import { useRef, useState } from 'react';
import { LbButton } from '@/components/ui/LbButton';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';
import { AF } from '@/copy';
import { userAvatarUrl } from '@/mechanisms/liveblog-api';

type ProfileAvatarProps = {
  user: LiveblogUser;
  displayName: string;
  uploading: boolean;
  onUpload(file: File): Promise<void>;
};

export function ProfileAvatar({ user, displayName, uploading, onUpload }: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const avatarSrc = previewUrl ?? userAvatarUrl(user);
  const initial = displayName.charAt(0).toUpperCase();

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    try {
      await onUpload(file);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="relative">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            className="h-20 w-20 rounded-full border-2 border-mar-border object-cover"
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-mar-border bg-mar-beige text-2xl font-bold text-mar-teal-dark"
            aria-hidden
          >
            {initial}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void handleFile(file);
        }}
      />
      <LbButton
        type="button"
        variant="secondary"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? AF.auth.uploading : AF.auth.changePhoto}
      </LbButton>
    </div>
  );
}
