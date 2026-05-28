import type { LiveblogUser } from '../types';

/** Best display URL for a user avatar (renditions or legacy picture_url). */
export function userAvatarUrl(user: Pick<LiveblogUser, 'picture_url' | 'avatar_renditions'>): string | null {
  if (user.picture_url) return user.picture_url;
  const renditions = user.avatar_renditions;
  if (!renditions) return null;
  return renditions.viewImage?.href ?? renditions.thumbnail?.href ?? renditions.original?.href ?? null;
}
