import { describe, expect, it } from 'vitest';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';
import {
  formToAdminPatch,
  formToCreateBody,
  reactivateUserPatch,
  userToForm,
  validateUserForm,
} from './userForm';

const baseUser: LiveblogUser = {
  _id: 'u1',
  _etag: 'etag1',
  username: 'jane',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  user_type: 'user',
  role: 'role1',
  is_active: true,
  is_author: false,
};

describe('validateUserForm', () => {
  it('does not require password for new users', () => {
    const form = userToForm(baseUser);
    form.password = '';
    expect(validateUserForm(form, true).valid).toBe(true);
  });

  it('requires role for non-administrators', () => {
    const form = userToForm(baseUser);
    form.role = '';
    expect(validateUserForm(form, false).valid).toBe(false);
  });
});

describe('formToCreateBody', () => {
  it('omits password when not set (invite flow)', () => {
    const form = userToForm(baseUser);
    form.password = '';
    const body = formToCreateBody(form);
    expect(body.username).toBe('jane');
    expect(body.password).toBeUndefined();
    expect(body.role).toBe('role1');
  });

  it('includes password when explicitly provided', () => {
    const form = userToForm(baseUser);
    form.password = 'longpassword';
    const body = formToCreateBody(form);
    expect(body.password).toBe('longpassword');
  });
});

describe('reactivateUserPatch', () => {
  it('sets is_enabled and is_active', () => {
    expect(reactivateUserPatch()).toEqual({ is_enabled: true, is_active: true });
  });
});

describe('formToAdminPatch', () => {
  it('detects email change only', () => {
    const form = userToForm(baseUser);
    form.email = 'new@example.com';
    const patch = formToAdminPatch(form, baseUser);
    expect(patch).toEqual({ email: 'new@example.com' });
  });
});
