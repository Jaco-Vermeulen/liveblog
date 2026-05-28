import { describe, expect, it } from 'vitest';
import { buildAnalyticsCsv } from './exportCsv';

describe('buildAnalyticsCsv', () => {
  it('joins blog_id, context_url, hits per row', () => {
    const csv = buildAnalyticsCsv([
      { _id: '1', blog_id: 'abc', context_url: 'https://x.com', hits: 3 },
    ]);
    expect(csv).toBe('abc,https://x.com,3');
  });
});
