import type { CreateUserBody, LiveblogUser, UserAdminUpdate } from '@/mechanisms/liveblog-api';



export type UserFormState = {

  first_name: string;

  last_name: string;

  username: string;

  email: string;

  phone: string;

  password: string;

  user_type: 'administrator' | 'user';

  is_author: boolean;

  role: string;

  is_active: boolean;

  sign_off: string;

  byline: string;

  biography: string;

};



export function emptyUserForm(): UserFormState {

  return {

    first_name: '',

    last_name: '',

    username: '',

    email: '',

    phone: '',

    password: '',

    user_type: 'user',

    is_author: false,

    role: '',

    is_active: true,

    sign_off: '',

    byline: '',

    biography: '',

  };

}



export function userToForm(user: LiveblogUser): UserFormState {

  return {

    first_name: user.first_name ?? '',

    last_name: user.last_name ?? '',

    username: user.username ?? '',

    email: user.email ?? '',

    phone: user.phone ?? '',

    password: '',

    user_type: user.user_type === 'administrator' ? 'administrator' : 'user',

    is_author: Boolean(user.is_author),

    role: user.role ?? '',

    is_active: user.is_active !== false,

    sign_off: user.sign_off ?? '',

    byline: user.byline ?? '',

    biography: user.biography ?? '',

  };

}



export function validateUserForm(

  form: UserFormState,

  _isNew: boolean,

): { valid: boolean; error?: string } {

  if (!form.first_name.trim()) return { valid: false, error: 'Voornaam is verplig.' };

  if (!form.last_name.trim()) return { valid: false, error: 'Van is verplig.' };

  if (!form.username.trim()) return { valid: false, error: 'Gebruikersnaam is verplig.' };

  if (!form.email.trim()) return { valid: false, error: 'E-pos is verplig.' };

  if (form.user_type === 'user' && !form.role.trim()) {

    return { valid: false, error: 'Rol is verplig vir nie-administrateurs.' };

  }

  return { valid: true };

}



export function formToCreateBody(form: UserFormState): CreateUserBody {

  const body: CreateUserBody = {

    first_name: form.first_name.trim(),

    last_name: form.last_name.trim(),

    username: form.username.trim(),

    email: form.email.trim(),

    phone: form.phone.trim() || undefined,

    user_type: form.user_type,

    is_author: form.is_author,

    role: form.user_type === 'administrator' ? null : form.role.trim(),

  };

  if (form.password.length >= 8) {

    body.password = form.password;

  }

  return body;

}



export function formToAdminPatch(form: UserFormState, original: LiveblogUser): Partial<UserAdminUpdate> {

  const patch: Partial<UserAdminUpdate> = {};

  const stringFields: (keyof UserAdminUpdate)[] = [

    'first_name',

    'last_name',

    'email',

    'phone',

    'sign_off',

    'byline',

    'biography',

  ];



  for (const key of stringFields) {

    const next = (form[key as keyof UserFormState] as string).trim();

    const prev = (original[key as keyof LiveblogUser] as string | null | undefined) ?? '';

    if (next !== prev) {

      (patch as Record<string, unknown>)[key] = next || null;

    }

  }



  if (form.user_type !== (original.user_type === 'administrator' ? 'administrator' : 'user')) {

    patch.user_type = form.user_type;

  }

  if (form.is_author !== Boolean(original.is_author)) {

    patch.is_author = form.is_author;

  }

  if (form.is_active !== (original.is_active !== false)) {

    patch.is_active = form.is_active;

  }



  const nextRole = form.user_type === 'administrator' ? null : form.role.trim() || null;

  const prevRole = original.role ?? null;

  if (nextRole !== prevRole) {

    patch.role = nextRole;

  }



  return patch;

}



export function isUserFormDirty(form: UserFormState, original: LiveblogUser): boolean {

  return Object.keys(formToAdminPatch(form, original)).length > 0;

}



/** PATCH body to undo soft-delete (DELETE /users sets both false). */
export function reactivateUserPatch(): Pick<UserAdminUpdate, 'is_enabled' | 'is_active'> {
  return { is_enabled: true, is_active: true };
}

