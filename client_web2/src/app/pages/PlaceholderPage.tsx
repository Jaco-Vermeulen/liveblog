import { LbContentContainer } from '@/components/layout';
import { LbPanelCard } from '@/components/ui';
import { AF } from '@/copy';

type PlaceholderPageProps = {
  title: string;
  description?: string;
  mechanism?: string;
};

/** Stub page until feature mechanism is implemented */
export function PlaceholderPage({ title, description, mechanism }: PlaceholderPageProps) {
  return (
    <LbContentContainer size="lg" centered={false} className="py-8">
      <LbPanelCard
        eyebrow={mechanism ?? AF.common.comingSoonEyebrow}
        title={title}
        subtitle={description ?? AF.placeholder.defaultDescription}
        padding="md"
      >
        <p className="m-0 text-sm text-mar-muted">
          {AF.placeholder.trackingNote}{' '}
          <code className="rounded bg-mar-beige px-1 text-mar-teal-dark">plans/mechanisms/</code>.
        </p>
      </LbPanelCard>
    </LbContentContainer>
  );
}
