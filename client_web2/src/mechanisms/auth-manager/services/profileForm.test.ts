import { describe, expect, it } from 'vitest';
import { isProfileFormDirty, profileFormToPatch, userToProfileForm } from './profileForm';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';

const baseUser: LiveblogUser = {
  _id: 'u1',
  _etag: 'e1',
  username: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
};

describe('profileForm', () => {
  it('detects dirty fields', () => {
    const form = userToProfileForm(baseUser);
    expect(isProfileFormDirty(form, baseUser)).toBe(false);
    const dirty = { ...form, first_name: 'New' };
    expect(isProfileFormDirty(dirty, baseUser)).toBe(true);
    expect(profileFormToPatch(dirty, baseUser)).toEqual({ first_name: 'New' });
  });
});
