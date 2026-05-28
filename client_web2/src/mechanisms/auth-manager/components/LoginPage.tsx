import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LbBrandCopy,
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
import {
  LbAlert,
  LbAuthCard,
  LbAuthForm,
  LbButton,
  LbFormField,
  LbInput,
  LbLoadingScreen,
  LbSpinner,
} from '@/components/ui';
import { getLoginErrorCode } from '../context/AuthProvider';
import { useAuth } from '../hooks/useAuth';

const ERROR_MESSAGES: Record<string, string> = {
  '401': 'Ongeldige gebruikersnaam of wagwoord.',
  '403': 'Rekening gesuspendeer.',
  '404': 'Gebruiker nie gevind nie.',
  network: 'Kan nie die bediener bereik nie.',
  unknown: 'Aanmelding het misluk. Probeer asseblief weer.',
};

export function LoginPage() {
  const { state, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? '/liveblog';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  if (state.isLoading) {
    return <LbLoadingScreen message="Laai sessie…" />;
  }

  if (state.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorCode(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorCode(getLoginErrorCode(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LbFullscreenShell>
      <LbSplitLayout
        brand={
          <LbBrandPanel>
            <LbBrandLogo />
            <LbBrandTitle>Maroela Media</LbBrandTitle>
            <LbBrandTagline>
              Regstreekse blog — betroubaar, vinnig, Afrikaans
            </LbBrandTagline>
            <LbBrandOrnament />
            <LbBrandCopy>
              Die redaksiestelsel vir jou regstreekse verslaggewing
            </LbBrandCopy>
          </LbBrandPanel>
        }
      >
        <LbMainPanel>
          <LbContentContainer size="sm" centered className="py-12 sm:py-16">
            <LbAuthCard
              showLogo
              eyebrow="Liveblog Admin"
              title="Welkom terug"
              subtitle="Meld aan by jou werkspasie"
            >
              <LbAuthForm name="loginForm" onSubmit={handleSubmit} noValidate>
                <LbFormField label="Gebruikersnaam" htmlFor="login-username" variant="login">
                  <LbInput
                    id="login-username"
                    name="username"
                    inputSize="login"
                    placeholder="jou.naam"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </LbFormField>

                <LbFormField label="Wagwoord" htmlFor="login-password" variant="login">
                  <LbInput
                    id="login-password"
                    name="password"
                    type="password"
                    inputSize="login"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </LbFormField>

                <p className="m-0 text-right text-sm">
                  <Link
                    to="/reset-password"
                    className="font-semibold text-mar-teal hover:underline"
                  >
                    Wagwoord vergeet?
                  </Link>
                </p>

                {errorCode ? (
                  <LbAlert variant="error">
                    {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.unknown}
                  </LbAlert>
                ) : null}

                <LbButton
                  type="submit"
                  id="login-btn"
                  variant="accent"
                  disabled={isSubmitting}
                  className="min-h-[3.25rem] w-full rounded-xl text-base font-bold sm:text-lg"
                >
                  {isSubmitting ? <LbSpinner /> : 'Meld aan'}
                </LbButton>
              </LbAuthForm>
            </LbAuthCard>
          </LbContentContainer>
        </LbMainPanel>
      </LbSplitLayout>
    </LbFullscreenShell>
  );
}
