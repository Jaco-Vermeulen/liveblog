import { describe, expect, it, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import { ResetPasswordTokenRedirect } from './ResetPasswordTokenRedirect';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

describe('ResetPasswordTokenRedirect', () => {
  const original = window.location;

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, 'location', { value: original, writable: true });
  });

  it('redirects legacy hash activation link to /reset-password', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '', hash: '#/reset-password?token=legacy-token' },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <ResetPasswordTokenRedirect />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe(
        '/reset-password?token=legacy-token',
      );
    });
  });

  it('does not redirect when already on reset-password', async () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '?token=abc', hash: '' },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPasswordTokenRedirect />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')?.textContent).toBe(
        '/reset-password?token=abc',
      );
    });
  });
});
