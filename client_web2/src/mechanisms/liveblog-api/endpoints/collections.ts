import { api } from '../client';
import type { Collection, EveList } from '../types';

export function listCollections(): Promise<EveList<Collection>> {
  return api.get<EveList<Collection>>('/collections', {
    where: JSON.stringify({ deleted: false }),
    max_results: 200,
  });
}
