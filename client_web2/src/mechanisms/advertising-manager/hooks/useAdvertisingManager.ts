import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import {
  listAdvertisementCollections,
  listAdvertisements,
  removeAdvertisement,
  removeAdvertisementCollection,
  saveAdvertisement,
  saveAdvertisementCollection,
  type Advertisement,
  type AdvertisementCollection,
} from '@/mechanisms/liveblog-api';
import { uniqueNameInItems } from '../utils/uniqueName';

export type AdvertisingTab = 'adverts' | 'collections';

const AD_TYPES = ['Advertisement Local', 'Advertisement Remote'] as const;

export function useAdvertisingManager() {
  const [activeTab, setActiveTab] = useState<AdvertisingTab>('adverts');
  const [adverts, setAdverts] = useState<Advertisement[]>([]);
  const [collections, setCollections] = useState<AdvertisementCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [advertModal, setAdvertModal] = useState<Advertisement | null | 'new'>(null);
  const [collectionModal, setCollectionModal] = useState<AdvertisementCollection | null | 'new'>(
    null,
  );

  const loadAdverts = useCallback(async () => {
    const data = await listAdvertisements();
    setAdverts(data._items);
  }, []);

  const loadCollections = useCallback(async () => {
    const data = await listAdvertisementCollections();
    setCollections(data._items);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'collections') {
        await loadCollections();
      } else {
        await loadAdverts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.advertising.errors.load);
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadAdverts, loadCollections]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveAdvert = async (payload: {
    name: string;
    type: string;
    text: string;
    meta: { data: Record<string, unknown> };
  }) => {
    const existing = advertModal && advertModal !== 'new' ? advertModal : null;
    if (!uniqueNameInItems(payload.name, adverts, existing?._id)) {
      setError('Advertensie name moet uniek wees.');
      return;
    }
    await saveAdvertisement(existing, payload);
    setAdvertModal(null);
    setMessage('Advertensie gestoor.');
    await loadAdverts();
  };

  const saveCollection = async (payload: { name: string; advertisements: { advertisement_id: string }[] }) => {
    const existing = collectionModal && collectionModal !== 'new' ? collectionModal : null;
    if (!uniqueNameInItems(payload.name, collections, existing?._id)) {
      setError('Versameling name moet uniek wees.');
      return;
    }
    await saveAdvertisementCollection(existing, payload);
    setCollectionModal(null);
    setMessage('Versameling gestoor.');
    await loadCollections();
  };

  return {
    activeTab,
    setActiveTab,
    adverts,
    collections,
    loading,
    error,
    message,
    advertModal,
    collectionModal,
    setAdvertModal,
    setCollectionModal,
    saveAdvert,
    saveCollection,
    removeAdvert: async (ad: Advertisement) => {
      if (!window.confirm(AF.advertising.confirmDeleteAd(ad.name))) return;
      await removeAdvertisement(ad);
      setMessage('Advertensie verwyder.');
      await loadAdverts();
    },
    removeCollection: async (col: AdvertisementCollection) => {
      if (!window.confirm(AF.advertising.confirmDeleteCollection(col.name))) return;
      await removeAdvertisementCollection(col);
      setMessage('Versameling verwyder.');
      await loadCollections();
    },
    adTypes: AD_TYPES,
  };
}
