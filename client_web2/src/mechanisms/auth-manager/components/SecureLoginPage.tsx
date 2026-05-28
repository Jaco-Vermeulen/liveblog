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

/** Route stub for legacy `/secure-login/` deep links. */
export function SecureLoginPage() {
  return (
    <LbFullscreenShell>
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
            <LbAuthCard title="Veilige aanmelding">
              <LbAlert variant="info" className="mb-4">
                Gebruik die gewone aanmeldbladsy vir toegang tot Regstreekse blog.
              </LbAlert>
              <Link to="/login">
                <LbButton type="button" variant="accent" className="w-full">
                  Gaan na aanmelding
                </LbButton>
              </Link>
            </LbAuthCard>
          </LbContentContainer>
        </LbMainPanel>
      </LbSplitLayout>
    </LbFullscreenShell>
  );
}
