import { describe, expect, it } from 'vitest';
import { AF } from '@/copy';
import { assertImageUploadSize, MAX_IMAGE_UPLOAD_BYTES } from './uploadLimits';
import { LiveblogApiError } from './client';

describe('uploadLimits', () => {
  it('allows files at or below the limit', () => {
    const file = new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES)], 'ok.jpg', {
      type: 'image/jpeg',
    });
    expect(() => assertImageUploadSize(file)).not.toThrow();
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
});
