import { api } from '../client';
import { logger } from '@/mechanisms/request-logger';
import { LiveblogApiError, resolveUrl } from '../client';
import { assertImageUploadSize } from '../uploadLimits';
import type { EveList } from '../types';

export interface ArchivePictureRenditions {
  href?: string;
  width?: number;
  height?: number;
}

export interface ArchivePicture {
  _id: string;
  type?: string;
  unique_name?: string;
  _updated?: string;
  renditions?: Record<string, ArchivePictureRenditions>;
}

export interface BlogImageItem {
  _id: string;
  text?: string;
  meta?: {
    media?: {
      _id?: string;
      renditions?: Record<string, ArchivePictureRenditions>;
    };
  };
}

const PICTURE_ARCHIVE_QUERY = {
  query: {
    filtered: {
      filter: {
        and: [{ term: { type: 'picture' } }],
      },
    },
  },
};

function blogImageItemsQuery(blogId: string) {
  return {
    query: {
      filtered: {
        filter: {
          and: [{ term: { blog: blogId } }, { term: { item_type: 'image' } }],
        },
      },
    },
  };
}

/** List uploaded picture media from the server archive (Superdesk media library). */
export function listArchivePictures(
  maxResults = 200,
  page = 1,
): Promise<EveList<ArchivePicture>> {
  return api.get<EveList<ArchivePicture>>('/archive', {
    max_results: maxResults,
    page,
    source: JSON.stringify(PICTURE_ARCHIVE_QUERY),
  });
}

/** Image blocks already saved on posts in this blog. */
export function listBlogImageItems(
  blogId: string,
  maxResults = 200,
): Promise<EveList<BlogImageItem>> {
  return api.get<EveList<BlogImageItem>>('/items', {
    max_results: maxResults,
    source: JSON.stringify(blogImageItemsQuery(blogId)),
  });
}

export interface ArchiveUploadResponse {
  _id: string;
  _status?: string;
  renditions?: Record<string, { href?: string }>;
}

function getAuthHeader(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('sess:token');
}

/** Multipart upload for blog cover images (legacy archive API). */
export async function uploadArchiveMedia(file: File): Promise<{
  picture: string;
  picture_url: string;
  picture_renditions: Record<string, { href?: string }>;
}> {
  assertImageUploadSize(file);

  const url = resolveUrl('/archive');
  const formData = new FormData();
  formData.append('media', file);

  const id = logger.request('POST', url);
  const started = performance.now();

  const headers = new Headers();
  const auth = getAuthHeader();
  if (auth) {
    headers.set('Authorization', auth);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    const durationMs = Math.round(performance.now() - started);
    logger.response(id, res.status, durationMs, url);

    const data = (await res.json()) as ArchiveUploadResponse;

    if (!res.ok || data._status === 'ERR') {
      const message =
        data._status === 'ERR' ? 'Archive upload failed' : `HTTP ${res.status}`;
      logger.error(id, message, url);
      throw new LiveblogApiError(message, res.status, data);
    }

    const viewHref = data.renditions?.viewImage?.href;
    if (!viewHref) {
      throw new LiveblogApiError('No image rendition returned', res.status, data);
    }

    return {
      picture: data._id,
      picture_url: viewHref,
      picture_renditions: data.renditions ?? {},
    };
  } catch (err) {
    if (!(err instanceof LiveblogApiError)) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(id, message, url);
    }
    throw err;
  }
}
