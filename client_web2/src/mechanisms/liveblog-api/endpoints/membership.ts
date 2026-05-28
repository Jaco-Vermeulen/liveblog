import { api } from '../client';
import type { EveList, LiveblogUser } from '../types';

export function listBlogMembershipRequests(blogId: string): Promise<EveList<LiveblogUser>> {
  return api.get<EveList<LiveblogUser>>(`/blogs/${blogId}/request_membership`);
}

export function requestBlogMembership(blogId: string): Promise<unknown> {
  return api.post('/request_membership', { blog: blogId });
}
