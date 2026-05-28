import { api } from '../client';
import type { EveList, Freetype } from '../types';

export function listFreetypes(): Promise<EveList<Freetype>> {
  return api.get<EveList<Freetype>>('/freetypes', { max_results: 200 });
}

export function saveFreetype(
  existing: Freetype | null,
  payload: { name: string; template: string },
): Promise<Freetype> {
  if (existing?._id) {
    return api.patch<Freetype>(`/freetypes/${existing._id}`, payload, { etag: existing._etag });
  }
  return api.post<Freetype>('/freetypes', payload);
}

export function removeFreetype(freetype: Freetype): Promise<void> {
  if (!freetype._id) {
    throw new Error('Freetype id required for delete');
  }
  return api.delete(`/freetypes/${freetype._id}`, { etag: freetype._etag });
}

export async function checkFreetypeUsed(name: string): Promise<boolean> {
  const result = await api.get<EveList<unknown>>('/items', {
    max_results: 1,
    source: JSON.stringify({
      query: {
        filtered: {
          filter: {
            and: [{ term: { item_type: name } }],
          },
        },
      },
    }),
  });
  return result._items.length > 0;
}
