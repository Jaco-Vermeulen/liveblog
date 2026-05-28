import { api } from '../client';
import type {
  EveList,
  MarketplaceBlog,
  MarketplaceLanguage,
  MarketplaceMarketer,
} from '../types';

export type MarketplaceFilters = Record<string, unknown>;

export function listMarketplaceBlogs(
  filters: MarketplaceFilters = {},
): Promise<EveList<MarketplaceBlog>> {
  return api.get<EveList<MarketplaceBlog>>('/marketplace/blogs', {
    where: JSON.stringify(filters),
    sort: '-start_date',
    max_results: 100,
  });
}

export function listMarketplaceMarketers(): Promise<EveList<MarketplaceMarketer>> {
  return api.get<EveList<MarketplaceMarketer>>('/marketplace/marketers', { max_results: 200 });
}

export function listMarketplaceLanguages(): Promise<EveList<MarketplaceLanguage>> {
  return api.get<EveList<MarketplaceLanguage>>('/marketplace/languages', { max_results: 200 });
}
