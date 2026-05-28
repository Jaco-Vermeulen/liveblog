import { describe, expect, it } from 'vitest';
import {
  autoResolveDelayMs,
  isHttpUri,
  normalizeEmbedInput,
  replaceEmbedCodeWithUrl,
  shouldAutoResolveInput,
} from './normalizeEmbedInput';

describe('normalizeEmbedInput', () => {
  it('extracts twitter status URL from embed HTML', () => {
    const html =
      '<blockquote class="twitter-tweet"><a href="https://twitter.com/jack/status/123">x</a></blockquote>';
    expect(replaceEmbedCodeWithUrl(html)).toBe('https://twitter.com/jack/status/123');
  });

  it('normalizes twitter URL', () => {
    expect(
      normalizeEmbedInput('https://twitter.com/jack/status/123?s=20'),
    ).toContain('twitter.com/jack/status/123');
  });

  it('detects http URLs', () => {
    expect(isHttpUri('https://www.youtube.com/watch?v=abc')).toBe(true);
  });

  it('auto-resolves complete URLs and embed HTML', () => {
    expect(shouldAutoResolveInput('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(shouldAutoResolveInput('<iframe src="x"></iframe>')).toBe(true);
    expect(shouldAutoResolveInput('not yet')).toBe(false);
    expect(autoResolveDelayMs('https://twitter.com/x/status/1')).toBeLessThan(
      autoResolveDelayMs('http'),
    );
  });
});
