import { AF } from '@/copy';
import { logger } from '@/mechanisms/request-logger';
import { LiveblogApiError, resolveUrl } from '../client';

export interface UploadMediaResponse {
  _id: string;
  _status?: string;
  renditions?: Record<string, { href?: string; width?: number; height?: number }>;
}

function getAuthHeader(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('sess:token');
}

/** Multipart upload for user avatars (`/upload` resource). */
export async function uploadUserAvatar(file: File): Promise<string> {
  const url = resolveUrl('/upload');
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

    const data = (await res.json()) as UploadMediaResponse;

    if (!res.ok || data._status === 'ERR') {
      const message = data._status === 'ERR' ? 'Avatar oplaai het misluk' : `HTTP ${res.status}`;
      logger.error(id, message, url);
      throw new LiveblogApiError(message, res.status, data);
    }

    if (!data._id) {
      throw new LiveblogApiError(AF.upload.noUploadId, res.status, data);
    }

    return data._id;
  } catch (err) {
    if (!(err instanceof LiveblogApiError)) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(id, message, url);
    }
    throw err;
  }
}
