import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listAllMediaPictures } from './archive';

vi.mock('../client', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../client';

describe('archive endpoints', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('listAllMediaPictures fetches every page from media_pictures', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        _items: [{ _id: 'a' }],
        _meta: { total: 3, page: 1, max_results: 2 },
      })
      .mockResolvedValueOnce({
        _items: [{ _id: 'b' }, { _id: 'c' }],
        _meta: { total: 3, page: 2, max_results: 2 },
      });

    const items = await listAllMediaPictures(2);

    expect(items.map((item) => item._id)).toEqual(['a', 'b', 'c']);
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenNthCalledWith(1, '/media_pictures', {
      max_results: 2,
      page: 1,
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/media_pictures', {
      max_results: 2,
      page: 2,
    });
  });
});
