import { AF } from '@/copy';
import { LiveblogApiError } from './client';

/** Max image upload size (bytes). Override at build time via VITE_MAX_IMAGE_UPLOAD_BYTES. */
export const MAX_IMAGE_UPLOAD_BYTES =
  Number(import.meta.env.VITE_MAX_IMAGE_UPLOAD_BYTES) || 1 * 1024 * 1024;

export function imageUploadSizeError(file: File): string | null {
  if (file.size <= MAX_IMAGE_UPLOAD_BYTES) return null;
  const maxMb = MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024);
  return AF.upload.imageTooLarge(maxMb);
}

export function assertImageUploadSize(file: File): void {
  const message = imageUploadSizeError(file);
  if (message) throw new LiveblogApiError(message, 0);
}

export function uploadErrorMessage(err: unknown): string {
  if (err instanceof LiveblogApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return AF.upload.failed;
}
