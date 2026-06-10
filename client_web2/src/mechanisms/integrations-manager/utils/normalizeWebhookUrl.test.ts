import { describe, expect, it } from 'vitest';
import { normalizeWebhookUrl } from './normalizeWebhookUrl';

describe('normalizeWebhookUrl', () => {
  it('prepends http when scheme is missing', () => {
    expect(normalizeWebhookUrl('192.168.1.10:3000/api/webhooks/liveblog/nuus/')).toBe(
      'http://192.168.1.10:3000/api/webhooks/liveblog/nuus/',
    );
  });

  it('leaves existing http urls unchanged', () => {
    expect(normalizeWebhookUrl('http://host.docker.internal:3000/hook/')).toBe(
      'http://host.docker.internal:3000/hook/',
    );
  });
});
