import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LbBrandLogo,
  LbBrandOrnament,
  LbBrandPanel,
  LbBrandTagline,
  LbBrandTitle,
  LbContentContainer,
  LbFullscreenShell,
  LbMainPanel,
  LbSplitLayout,
} from '@/components/layout';
import { LbAlert, LbAuthCard, LbAuthForm, LbButton, LbFormField, LbInput } from '@/components/ui';
import {
  completePasswordReset,
  passwordResetErrorMessage,
  requestPasswordReset,
  validatePasswordResetToken,
} from '@/mechanisms/liveblog-api';
import { readResetPasswordToken } from '../utils/resetPasswordToken';
import {
  PasswordResetSuccessModal,
  type PasswordResetSuccessKind,
} from './PasswordResetSuccessModal';

type Step = 'request' | 'set' | 'done';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<PasswordResetSuccessKind | null>(null);

  useEffect(() => {
    const fromUrl = readResetPasswordToken();
    if (!fromUrl) return;

    setToken(fromUrl);
    setStep('set');
    setBusy(true);
    void validatePasswordResetToken(fromUrl)
      .then(() => {
        setError(null);
      })
      .catch((err) => {
        setError(passwordResetErrorMessage(err));
        setStep('request');
        setToken(null);
      })
      .finally(() => setBusy(false));
  }, []);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setEmail('');
      setSuccessModal('email-sent');
    } catch (err) {
      setError(passwordResetErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      setError('Wagwoord moet minstens 8 karakters wees.');
      return;
    }
    if (password !== confirm) {
      setError('Wagwoorde stem nie ooreen nie.');
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await completePasswordReset(token, password);
      setStep('done');
      setSuccessModal('password-set');
    } catch (err) {
      setError(passwordResetErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const cardTitle =
    step === 'set' ? 'Stel jou wagwoord' : step === 'done' ? 'Wagwoord gestel' : 'Wagwoord vergeet?';

  const cardSubtitle =
    step === 'set'
      ? "Kies 'n nuwe wagwoord vir jou rekening"
      : step === 'done'
        ? 'Aanmelding is beskikbaar'
        : "Ons stuur 'n herstelskakel na jou e-pos";

  return (
    <LbFullscreenShell>
      <PasswordResetSuccessModal
        open={successModal !== null}
        kind={successModal ?? 'email-sent'}
        onClose={() => setSuccessModal(null)}
        onPrimaryAction={
          successModal === 'password-set'
            ? () => navigate('/login', { replace: true })
            : undefined
        }
      />
      <LbSplitLayout
        brand={
          <LbBrandPanel>
            <LbBrandLogo />
            <LbBrandTitle>Maroela Media</LbBrandTitle>
            <LbBrandTagline>Regstreekse blog</LbBrandTagline>
            <LbBrandOrnament />
          </LbBrandPanel>
        }
      >
        <LbMainPanel>
          <LbContentContainer size="sm" centered className="py-12 sm:py-16">
            <LbAuthCard title={cardTitle} subtitle={cardSubtitle}>
              {error && (
                <LbAlert variant="error" className="mb-4">
                  {error}
                </LbAlert>
              )}

              {step === 'request' && (
                <LbAuthForm name="resetRequest" onSubmit={handleRequest} noValidate>
                  <LbFormField label="E-posadres" htmlFor="reset-email" variant="login">
                    <LbInput
                      id="reset-email"
                      name="email"
                      type="email"
                      inputSize="login"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </LbFormField>
                  <LbButton
                    type="submit"
                    variant="accent"
                    disabled={busy || !email.trim()}
                    className="min-h-[3.25rem] w-full rounded-xl text-base font-bold"
                  >
                    {busy ? 'Stuur…' : 'Stuur herstelskakel'}
                  </LbButton>
                </LbAuthForm>
              )}

              {step === 'set' && (
                <LbAuthForm name="resetSet" onSubmit={handleSetPassword} noValidate>
                  <LbFormField label="Nuwe wagwoord" htmlFor="reset-password" variant="login">
                    <LbInput
                      id="reset-password"
                      type="password"
                      inputSize="login"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </LbFormField>
                  <LbFormField label="Bevestig wagwoord" htmlFor="reset-confirm" variant="login">
                    <LbInput
                      id="reset-confirm"
                      type="password"
                      inputSize="login"
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </LbFormField>
                  <LbButton
                    type="submit"
                    variant="accent"
                    disabled={busy}
                    className="min-h-[3.25rem] w-full rounded-xl text-base font-bold"
                  >
                    {busy ? 'Stoor…' : 'Stel wagwoord'}
                  </LbButton>
                </LbAuthForm>
              )}

              {step === 'done' && (
                <LbButton
                  type="button"
                  variant="accent"
                  className="min-h-[3.25rem] w-full rounded-xl text-base font-bold"
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Gaan na aanmelding
                </LbButton>
              )}

              {step !== 'done' && (
                <p className="mt-4 text-center text-sm">
                  <Link to="/login" className="font-semibold text-mar-teal hover:underline">
                    Terug na aanmelding
                  </Link>
                </p>
              )}
            </LbAuthCard>
          </LbContentContainer>
        </LbMainPanel>
      </LbSplitLayout>
    </LbFullscreenShell>
  );
}
