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
import { AF, AF_LOGIN_ERRORS } from '@/copy';
import { getLoginErrorCode } from '../context/AuthProvider';
import { useAuth } from '../hooks/useAuth';

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
    return <LbLoadingScreen message={AF.common.loadingSession} />;
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
              {AF.app.taglineLogin}
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
              eyebrow={AF.app.title}
              title={AF.auth.welcomeBack}
              subtitle={AF.auth.signInSubtitle}
            >
              <LbAuthForm name="loginForm" onSubmit={handleSubmit} noValidate>
                <LbFormField label={AF.auth.username} htmlFor="login-username" variant="login">
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

                <LbFormField label={AF.auth.password} htmlFor="login-password" variant="login">
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
                    {AF.auth.forgotPassword}
                  </Link>
                </p>

                {errorCode ? (
                  <LbAlert variant="error">
                    {AF_LOGIN_ERRORS[errorCode] ?? AF_LOGIN_ERRORS.unknown}
                  </LbAlert>
                ) : null}

                <LbButton
                  type="submit"
                  id="login-btn"
                  variant="accent"
                  disabled={isSubmitting}
                  className="min-h-[3.25rem] w-full rounded-xl text-base font-bold sm:text-lg"
                >
                  {isSubmitting ? <LbSpinner /> : AF.common.signIn}
                </LbButton>
              </LbAuthForm>
            </LbAuthCard>
          </LbContentContainer>
        </LbMainPanel>
      </LbSplitLayout>
    </LbFullscreenShell>
  );
}
