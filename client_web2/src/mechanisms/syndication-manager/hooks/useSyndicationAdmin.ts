import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  listSyndicationConsumers,
  listSyndicationProducers,
  removeSyndicationProducer,
  saveSyndicationProducer,
  type SyndicationConsumer,
  type SyndicationProducer,
} from '@/mechanisms/liveblog-api';
import { AF } from '@/copy';

export type SyndicationTab = 'producers' | 'consumers';

export function useSyndicationAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: SyndicationTab =
    searchParams.get('state') === 'consumers' ? 'consumers' : 'producers';
  const [producers, setProducers] = useState<SyndicationProducer[]>([]);
  const [consumers, setConsumers] = useState<SyndicationConsumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');

  const setTab = (tab: SyndicationTab) => {
    setSearchParams({ state: tab });
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prod, cons] = await Promise.all([
        listSyndicationProducers(),
        listSyndicationConsumers(),
      ]);
      setProducers(prod._items);
      setConsumers(cons._items);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.syndication.errors.load);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, activeTab]);

  const addProducer = async () => {
    if (!nameDraft.trim()) return;
    await saveSyndicationProducer(null, { name: nameDraft.trim() });
    setNameDraft('');
    setMessage(AF.syndication.messages.producerCreated);
    await refresh();
  };

  return {
    activeTab,
    setTab,
    producers,
    consumers,
    loading,
    error,
    message,
    nameDraft,
    setNameDraft,
    addProducer,
    removeProducer: async (p: SyndicationProducer) => {
      if (!window.confirm(AF.syndication.confirmDeleteProducer(p.name))) return;
      await removeSyndicationProducer(p);
      setMessage(AF.syndication.messages.producerRemoved);
      await refresh();
    },
  };
}
