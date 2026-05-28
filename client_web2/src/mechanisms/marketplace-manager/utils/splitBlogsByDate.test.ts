import { describe, expect, it } from 'vitest';
import { splitBlogsByStartDate } from './splitBlogsByDate';

describe('splitBlogsByStartDate', () => {
  it('splits by start_date vs now', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();
    const { active, forthcoming } = splitBlogsByStartDate([
      { _id: '1', title: 'A', start_date: past },
      { _id: '2', title: 'B', start_date: future },
    ]);
    expect(active).toHaveLength(1);
    expect(forthcoming).toHaveLength(1);
  });
});
