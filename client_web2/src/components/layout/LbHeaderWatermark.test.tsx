import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LbHeaderWatermark } from './LbHeaderWatermark';

beforeEach(() => {
  vi.stubGlobal(
    'Image',
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 200;
      naturalHeight = 100;
      set src(_v: string) {
        queueMicrotask(() => {
          this.onload?.();
        });
      }
    } as unknown as typeof Image,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LbHeaderWatermark', () => {
  it('renders repeatable muurpapier tile behind header', async () => {
    const { getByTestId } = render(<LbHeaderWatermark headerHeightPx={60} />);
    const layer = getByTestId('header-watermark');

    expect(layer.style.backgroundImage).toContain('/muurpapier.png');
    expect(layer.style.backgroundRepeat).toBe('repeat');
    expect(layer.className).toMatch(/opacity-\[0\.42\]/);

    await waitFor(() => {
      expect(layer.style.backgroundPosition).toBe('center calc(50% - 12px)');
      expect(layer.style.backgroundSize).toBe('80px 40px');
    });
  });
});
