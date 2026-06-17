import type { CSSProperties } from 'react';

export interface PostTypeBadgeProps {
  postItemsType: string | null;
  postItemsIcon?: string | null;
}

const FAVICON_BADGE_STYLE: CSSProperties = {
  backgroundSize: '65%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#fff',
};

export function PostTypeBadge({ postItemsType, postItemsIcon }: PostTypeBadgeProps) {
  if (!postItemsType) return null;

  return (
    <div
      className={`lb-type lb-type--${postItemsType}${postItemsIcon ? ' lb-type--favicon' : ''}`}
      style={postItemsIcon ? { ...FAVICON_BADGE_STYLE, backgroundImage: `url(${postItemsIcon})` } : undefined}
      aria-hidden
    />
  );
}
