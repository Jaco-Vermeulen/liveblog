import { api } from '../client';
import type { EveList, Output } from '../types';

export function listBlogOutputs(blogId: string): Promise<EveList<Output>> {
  return api.get<EveList<Output>>('/outputs', {
    where: JSON.stringify({ blog: blogId, deleted: { $ne: true } }),
    max_results: 100,
  });
}

export function createOutput(payload: Omit<Output, '_id' | '_etag'>): Promise<Output> {
  return api.post<Output>('/outputs', payload);
}

export function updateOutput(output: Output, patch: Partial<Output>): Promise<Output> {
  if (!output._etag) {
    throw new Error('Output etag required for update');
  }
  return api.patch<Output>(`/outputs/${output._id}`, { ...output, ...patch }, { etag: output._etag });
}

export async function deleteOutput(output: Output): Promise<Output> {
  return updateOutput(output, { deleted: true });
}
