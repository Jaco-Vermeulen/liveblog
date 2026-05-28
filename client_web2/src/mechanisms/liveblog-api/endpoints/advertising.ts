import { api } from '../client';
import type { Advertisement, AdvertisementCollection, EveList } from '../types';

export function listAdvertisements(): Promise<EveList<Advertisement>> {
  return api.get<EveList<Advertisement>>('/advertisements', {
    where: JSON.stringify({ deleted: false }),
    max_results: 200,
  });
}

export function saveAdvertisement(
  existing: Advertisement | null,
  payload: Partial<Advertisement>,
): Promise<Advertisement> {
  if (existing?._id) {
    return api.patch<Advertisement>(`/advertisements/${existing._id}`, payload, {
      etag: existing._etag,
    });
  }
  return api.post<Advertisement>('/advertisements', payload);
}

export function removeAdvertisement(advert: Advertisement): Promise<void> {
  if (!advert._id) {
    throw new Error('Advertisement id required for delete');
  }
  return api.delete(`/advertisements/${advert._id}`, { etag: advert._etag });
}

export function listAdvertisementCollections(): Promise<EveList<AdvertisementCollection>> {
  return api.get<EveList<AdvertisementCollection>>('/collections', {
    where: JSON.stringify({ deleted: false }),
    max_results: 200,
  });
}

export function saveAdvertisementCollection(
  existing: AdvertisementCollection | null,
  payload: Partial<AdvertisementCollection>,
): Promise<AdvertisementCollection> {
  if (existing?._id) {
    return api.patch<AdvertisementCollection>(`/collections/${existing._id}`, payload, {
      etag: existing._etag,
    });
  }
  return api.post<AdvertisementCollection>('/collections', payload);
}

export async function removeAdvertisementCollection(
  collection: AdvertisementCollection,
): Promise<void> {
  await saveAdvertisementCollection(collection, { ...collection, deleted: true });
}
