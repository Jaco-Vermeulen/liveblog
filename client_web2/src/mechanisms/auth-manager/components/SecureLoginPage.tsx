import { Link } from 'react-router-dom';
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
import { LbAlert, LbAuthCard, LbButton } from '@/components/ui';
import { AF } from '@/copy';

/** Route stub for legacy `/secure-login/` deep links. */
export function SecureLoginPage() {
  return (
    <LbFullscreenShell>
      <LbSplitLayout
        brand={
          <LbBrandPanel>
            <LbBrandLogo />
            <LbBrandTitle>{AF.app.brand}</LbBrandTitle>
            <LbBrandTagline>{AF.app.tagline}</LbBrandTagline>
            <LbBrandOrnament />
          </LbBrandPanel>
        }
      >
        <LbMainPanel>
          <LbContentContainer size="sm" centered className="py-12 sm:py-16">
            <LbAuthCard title={AF.auth.secureSignIn}>
              <LbAlert variant="info" className="mb-4">
                {AF.auth.secureLoginHint}
              </LbAlert>
              <Link to="/login">
                <LbButton type="button" variant="accent" className="w-full">
                  {AF.auth.goToSignIn}
                </LbButton>
              </Link>
            </LbAuthCard>
          </LbContentContainer>
        </LbMainPanel>
      </LbSplitLayout>
    </LbFullscreenShell>
  );
}
