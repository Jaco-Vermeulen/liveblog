import { api } from '../client';
import type { EveList } from '../types';

export type PrivilegeMap = Record<string, number>;

export interface LiveblogRole {
  _id: string;
  name: string;
  description?: string;
  privileges: PrivilegeMap;
}

export function listRoles(maxResults = 50): Promise<EveList<LiveblogRole>> {
  return api.get<EveList<LiveblogRole>>('/roles', { max_results: maxResults });
}

export function getRole(roleId: string): Promise<LiveblogRole> {
  return api.get<LiveblogRole>(`/roles/${encodeURIComponent(roleId)}`);
}
