import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { readResetPasswordToken } from '../utils/resetPasswordToken';

/**
 * Legacy activation e-mails used `/#/reset-password?token=…` (Angular hash routing).
 * BrowserRouter ignores the hash, so users landed on `/` → login. Redirect early.
 */
export function ResetPasswordTokenRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/reset-password') return;

    const token = readResetPasswordToken();
    if (!token) return;

    navigate(`/reset-password?token=${encodeURIComponent(token)}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}
