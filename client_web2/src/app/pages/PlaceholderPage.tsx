import { LbContentContainer } from '@/components/layout';
import { LbPanelCard } from '@/components/ui';

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
        eyebrow={mechanism ?? 'Coming soon'}
        title={title}
        subtitle={description ?? 'Hierdie afdeling word in ’n volgende fase geïmplementeer.'}
        padding="md"
      >
        <p className="m-0 text-sm text-mar-muted">
          Navigasie en dop is reeds bedraad — inhoud volg per mechanism README in{' '}
          <code className="rounded bg-mar-beige px-1 text-mar-teal-dark">plans/mechanisms/</code>.
        </p>
      </LbPanelCard>
    </LbContentContainer>
  );
}
