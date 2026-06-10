import { describe, expect, it, vi } from 'vitest';
import { fetchBlogCategories } from './blogCategories';

vi.mock('./client', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from './client';

describe('fetchBlogCategories', () => {
  it('returns string categories from global_preferences', async () => {
    vi.mocked(api.get).mockResolvedValue({
      _items: [
        { _id: '1', key: 'blog_categories', value: ['Nuus', 'Sport', 'SA-nuus'] },
      ],
    });

    await expect(fetchBlogCategories()).resolves.toEqual(['Nuus', 'Sport', 'SA-nuus']);
  });

  it('returns empty list when preference is missing', async () => {
    vi.mocked(api.get).mockResolvedValue({ _items: [] });
    await expect(fetchBlogCategories()).resolves.toEqual([]);
  });
});
