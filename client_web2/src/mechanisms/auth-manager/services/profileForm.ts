import type { LiveblogUser, UserProfileUpdate } from '@/mechanisms/liveblog-api';

export type ProfileFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_author: boolean;
  sign_off: string;
  byline: string;
  biography: string;
};

export function userToProfileForm(user: LiveblogUser): ProfileFormState {
  return {
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    is_author: Boolean(user.is_author),
    sign_off: user.sign_off ?? '',
    byline: user.byline ?? '',
    biography: user.biography ?? '',
  };
}

export function profileFormToPatch(
  form: ProfileFormState,
  original: LiveblogUser,
): Partial<UserProfileUpdate> {
  const patch: Partial<UserProfileUpdate> = {};
  const fields: (keyof UserProfileUpdate)[] = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'is_author',
    'sign_off',
    'byline',
    'biography',
  ];

  for (const key of fields) {
    const next = form[key as keyof ProfileFormState];
    const prev = original[key as keyof LiveblogUser];
    if (typeof next === 'string' && next !== (prev ?? '')) {
      (patch as Record<string, unknown>)[key] = next || null;
    } else if (typeof next === 'boolean' && next !== Boolean(prev)) {
      (patch as Record<string, unknown>)[key] = next;
    }
  }

  return patch;
}

export function isProfileFormDirty(
  form: ProfileFormState,
  original: LiveblogUser,
): boolean {
  return Object.keys(profileFormToPatch(form, original)).length > 0;
}
