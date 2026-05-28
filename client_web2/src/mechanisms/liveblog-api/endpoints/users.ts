import { api } from '../client';

import type {

  CreateUserBody,

  EveList,

  LiveblogUser,

  UserAdminUpdate,

  UserProfileUpdate,

  ChangePasswordBody,

} from '../types';



export type { ChangePasswordBody };



export interface SearchUsersOptions {

  search?: string;

  page?: number;

  maxResults?: number;

  /** When false, only active+enabled users (team picker). When true, all users for admin. */

  adminList?: boolean;

}



export function listUsers(maxResults = 200): Promise<EveList<LiveblogUser>> {

  return api.get<EveList<LiveblogUser>>('/users', {

    max_results: maxResults,

    where: JSON.stringify({ is_active: true }),

  });

}



export function searchUsers(options: SearchUsersOptions = {}): Promise<EveList<LiveblogUser>> {

  const { search, page = 1, maxResults = 50, adminList = false } = options;

  const where: Record<string, unknown> = {};



  if (!adminList) {

    where.is_active = true;

  }



  if (search?.trim()) {

    const term = search.trim();

    where.$or = [

      { username: { $regex: term, $options: 'i' } },

      { display_name: { $regex: term, $options: 'i' } },

      { email: { $regex: term, $options: 'i' } },

    ];

  }



  return api.get<EveList<LiveblogUser>>('/users', {

    page,

    max_results: maxResults,

    where: JSON.stringify(where),

    sort: '[("display_name", 1)]',

  });

}



export function createUser(body: CreateUserBody): Promise<LiveblogUser> {

  return api.post<LiveblogUser>('/users', body);

}



export function updateUser(

  userId: string,

  body: Partial<UserProfileUpdate> | Partial<UserAdminUpdate>,

  etag: string,

): Promise<LiveblogUser> {

  return api.patch<LiveblogUser>(`/users/${encodeURIComponent(userId)}`, body, { etag });

}



/** Legacy Superdesk: DELETE disables the user (does not hard-delete). */

export function disableUser(userId: string, etag: string): Promise<void> {

  return api.delete(`/users/${encodeURIComponent(userId)}`, { etag });

}



export function changeUserPassword(body: ChangePasswordBody): Promise<void> {

  return api.post('/change_user_password', body);

}


