import { AF } from '@/copy';
import { LiveblogApiError } from './client';

/** Max image upload size (bytes). Override at build time via VITE_MAX_IMAGE_UPLOAD_BYTES. */
export const MAX_IMAGE_UPLOAD_BYTES =
  Number(import.meta.env.VITE_MAX_IMAGE_UPLOAD_BYTES) || 1 * 1024 * 1024;

export function assertImageUploadSize(file: File): void {
  if (file.size <= MAX_IMAGE_UPLOAD_BYTES) return;

  const maxMb = MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024);
  throw new LiveblogApiError(AF.upload.imageTooLarge(maxMb), 0);
}
