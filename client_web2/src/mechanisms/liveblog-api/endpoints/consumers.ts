import { api } from '../client';
import type { Consumer, EveList } from '../types';

export function listConsumers(): Promise<EveList<Consumer>> {
  return api.get<EveList<Consumer>>('/consumers', { max_results: 200 });
}
