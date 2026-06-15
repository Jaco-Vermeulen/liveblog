import { describe, expect, it } from 'vitest';
import { AF } from '@/copy';
import {
  assertImageUploadSize,
  imageUploadSizeError,
  MAX_IMAGE_UPLOAD_BYTES,
  uploadErrorMessage,
} from './uploadLimits';
import { LiveblogApiError } from './client';

describe('uploadLimits', () => {
  it('allows files at or below the limit', () => {
    const file = new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES)], 'ok.jpg', {
      type: 'image/jpeg',
    });
    expect(() => assertImageUploadSize(file)).not.toThrow();
  });

  it('returns a message for oversized files', () => {
    const file = new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES + 1)], 'big.jpg', {
      type: 'image/jpeg',
    });
    expect(imageUploadSizeError(file)).toBe(
      AF.upload.imageTooLarge(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)),
    );
  });

  it('rejects files over the limit', () => {
    const file = new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES + 1)], 'big.jpg', {
      type: 'image/jpeg',
    });
    expect(() => assertImageUploadSize(file)).toThrow(LiveblogApiError);
    expect(() => assertImageUploadSize(file)).toThrow(
      AF.upload.imageTooLarge(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)),
    );
  });

  it('formats upload errors for the UI', () => {
    expect(uploadErrorMessage(new LiveblogApiError('Beeld is groter as 1 MB', 0))).toBe(
      'Beeld is groter as 1 MB',
    );
    expect(uploadErrorMessage(new Error('netwerk'))).toBe('netwerk');
    expect(uploadErrorMessage(null)).toBe(AF.upload.failed);
  });
});
