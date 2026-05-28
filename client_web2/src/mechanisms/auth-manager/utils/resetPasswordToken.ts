/** Token from query (`?token=`) or legacy hash e-mail link (`/#/reset-password?token=`). */
export function readResetPasswordToken(): string | null {
  if (typeof window === 'undefined') return null;

  const fromQuery = new URLSearchParams(window.location.search).get('token');
  if (fromQuery?.trim()) return fromQuery.trim();

  const hash = window.location.hash;
  const match = hash.match(/[?&]token=([^&]+)/);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]).trim();
    } catch {
      return match[1].trim();
    }
  }

  return null;
}
