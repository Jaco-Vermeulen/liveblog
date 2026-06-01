import { AF } from '@/copy';
import { api } from '../client';
import { LiveblogApiError } from '../client';
import type { PasswordResetRequest } from '../types';

export function requestPasswordReset(email: string): Promise<PasswordResetRequest> {
  return api.post<PasswordResetRequest>(
    '/reset_user_password',
    { email: email.trim() },
    { skipAuth: true },
  );
}

export function validatePasswordResetToken(token: string): Promise<PasswordResetRequest> {
  return api.post<PasswordResetRequest>(
    '/reset_user_password',
    { token },
    { skipAuth: true },
  );
}

export function completePasswordReset(token: string, password: string): Promise<PasswordResetRequest> {
  return api.post<PasswordResetRequest>(
    '/reset_user_password',
    { token, password },
    { skipAuth: true },
  );
}

export function passwordResetErrorMessage(err: unknown): string {
  if (!(err instanceof LiveblogApiError)) {
    return err instanceof Error ? err.message : AF.auth.errors.resetComplete;
  }
  const body = err.body as { _message?: string; _issues?: Record<string, string> } | undefined;
  const msg = body?._message ?? '';
  if (err.status === 400 && /invalid email/i.test(msg)) {
    return AF.auth.errors.noAccountEmail;
  }
  if (err.status === 401 || /invalid token/i.test(msg)) {
    return AF.auth.errors.invalidResetToken;
  }
  if (err.status === 403) {
    return AF.auth.errors.accountInactive;
  }
  return msg || err.message;
}
