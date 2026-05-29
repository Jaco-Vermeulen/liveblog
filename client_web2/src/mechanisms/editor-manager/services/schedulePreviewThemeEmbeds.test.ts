import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { schedulePreviewThemeEmbeds } from './schedulePreviewThemeEmbeds';

describe('schedulePreviewThemeEmbeds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls LiveBlog.loadEmbeds when the iframe window exposes it', () => {
    const loadEmbeds = vi.fn();
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    const doc = document.implementation.createHTMLDocument('embed');
    doc.body.innerHTML = '<div class="iframely-embed"></div>';
    Object.defineProperty(iframe, 'contentWindow', {
      value: {
        document: doc,
        LiveBlog: { loadEmbeds },
        iframely: { load: vi.fn() },
      },
      configurable: true,
    });

    const stop = schedulePreviewThemeEmbeds(iframe);
    vi.runAllTimers();
    stop();

    expect(loadEmbeds).toHaveBeenCalled();
    iframe.remove();
  });
});
