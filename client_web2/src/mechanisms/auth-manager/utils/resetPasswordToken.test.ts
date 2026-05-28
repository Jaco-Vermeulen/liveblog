import { describe, expect, it, afterEach } from 'vitest';
import { readResetPasswordToken } from './resetPasswordToken';

describe('readResetPasswordToken', () => {
  const original = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: original, writable: true });
  });

  it('reads token from search params', () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '?token=abc-123', hash: '' },
      writable: true,
    });
    expect(readResetPasswordToken()).toBe('abc-123');
  });

  it('reads token from legacy hash link', () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '', hash: '#/reset-password?token=legacy-token' },
      writable: true,
    });
    expect(readResetPasswordToken()).toBe('legacy-token');
  });
});
