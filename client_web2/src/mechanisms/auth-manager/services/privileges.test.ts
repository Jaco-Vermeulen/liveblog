import { describe, expect, it } from 'vitest';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';
import { isAdministrator, userHasPrivileges } from './privileges';

const editor: LiveblogUser = {
  _id: '1',
  username: 'editor',
  user_type: 'user',
  role: 'role-1',
};

const admin: LiveblogUser = {
  _id: '2',
  username: 'admin',
  user_type: 'administrator',
};

describe('privileges', () => {
  it('treats administrator as having all privileges', () => {
    expect(isAdministrator(admin)).toBe(true);
    expect(userHasPrivileges(admin, null, { global_preferences: 1 })).toBe(true);
    expect(userHasPrivileges(admin, {}, { themes_delete: 1 })).toBe(true);
  });

  it('checks role privileges for non-admin users', () => {
    const role = { global_preferences: 1, themes_delete: 0 };
    expect(userHasPrivileges(editor, role, { global_preferences: 1 })).toBe(true);
    expect(userHasPrivileges(editor, role, { themes_delete: 1 })).toBe(false);
  });
});
