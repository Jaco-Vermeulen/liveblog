import { api } from '../client';
import type {
  EveList,
  SyndicationConsumer,
  SyndicationIn,
  SyndicationOut,
  SyndicationProducer,
} from '../types';

export function listSyndicationProducers(): Promise<EveList<SyndicationProducer>> {
  return api.get<EveList<SyndicationProducer>>('/producers', { max_results: 200 });
}

export function listSyndicationConsumers(): Promise<EveList<SyndicationConsumer>> {
  return api.get<EveList<SyndicationConsumer>>('/consumers', { max_results: 200 });
}

export function listSyndicationIn(blogId: string): Promise<EveList<SyndicationIn>> {
  return api.get<EveList<SyndicationIn>>('/syndication_in', {
    where: JSON.stringify({ blog_id: blogId }),
    max_results: 200,
  });
}

export function listSyndicationOut(blogId: string): Promise<EveList<SyndicationOut>> {
  return api.get<EveList<SyndicationOut>>('/syndication_out', {
    where: JSON.stringify({ blog_id: blogId }),
    max_results: 200,
  });
}

export function saveSyndicationProducer(
  existing: SyndicationProducer | null,
  payload: Partial<SyndicationProducer>,
): Promise<SyndicationProducer> {
  if (existing?._id) {
    return api.patch<SyndicationProducer>(`/producers/${existing._id}`, payload, {
      etag: existing._etag,
    });
  }
  return api.post<SyndicationProducer>('/producers', payload);
}

export function removeSyndicationProducer(producer: SyndicationProducer): Promise<void> {
  if (!producer._id) {
    throw new Error('Producer id required for delete');
  }
  return api.delete(`/producers/${producer._id}`, { etag: producer._etag });
}
