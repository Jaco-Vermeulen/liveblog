import { Activity, Layers, Sparkles } from 'lucide-react';
import { LbContentContainer } from '@/components/layout';
import {
  LbBadge,
  LbButton,
  LbCard,
  LbCardBody,
  LbCardMeta,
  LbCardMetaItem,
  LbCardTitle,
  LbFeatureCard,
  LbPanelCard,
} from '@/components/ui';

const phases = [
  { name: 'Phase 0', label: 'Setup', status: 'done' as const },
  { name: 'Phase 1', label: 'Shell + auth', status: 'active' as const },
  { name: 'Phase 2', label: 'Blog list', status: 'upcoming' as const },
  { name: 'Phase 3', label: 'Editor', status: 'upcoming' as const },
];

export function SetupPage() {
  return (
    <LbContentContainer size="lg" centered={false} className="py-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-mar-text">Web2 client setup</h1>
          <p className="mt-3 max-w-2xl text-mar-muted">
            Greenfield modernisation of the Liveblog admin portal. This replaces the legacy
            AngularJS client with React 19, Vite 6, and Tailwind CSS 4 — same strategy as{' '}
            <code className="rounded bg-mar-beige px-1.5 py-0.5 text-sm text-mar-teal-dark">
              maroela_web2
            </code>
            .
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <LbFeatureCard
            iconVariant="teal"
            icon={<Sparkles className="h-5 w-5" />}
            title="Modern stack"
            description="Vite · React 19 · TypeScript · TanStack Query · React Router 7"
          />
          <LbFeatureCard
            iconVariant="orange"
            icon={<Layers className="h-5 w-5" />}
            title="Tracked migration"
            description="Plans in plans/mechanisms/ with phased tasks and directives."
          />
          <LbFeatureCard
            iconVariant="accent"
            icon={<Activity className="h-5 w-5" />}
            title="Dev port 9001"
            description="Legacy admin stays on :9000. API proxied to :5000 via Vite."
          />
        </div>

        <LbPanelCard
          className="mt-10"
          eyebrow="Roadmap"
          title="Implementation phases"
          subtitle="Tracked in client_web2/plans/"
          padding="md"
        >
          <ul className="space-y-2">
            {phases.map((phase) => (
              <li key={phase.name}>
                <LbCard variant="outline" padding="none">
                  <LbCardBody className="!flex-row !items-center !justify-between !py-3">
                    <div>
                      <LbCardTitle level="compact" as="h3">
                        {phase.name}
                      </LbCardTitle>
                      <p className="m-0 text-sm text-mar-muted">{phase.label}</p>
                    </div>
                    <LbBadge
                      variant={
                        phase.status === 'active'
                          ? 'teal'
                          : phase.status === 'done'
                            ? 'muted'
                            : 'muted'
                      }
                    >
                      {phase.status === 'active'
                        ? 'In progress'
                        : phase.status === 'done'
                          ? 'Done'
                          : 'Planned'}
                    </LbBadge>
                  </LbCardBody>
                </LbCard>
              </li>
            ))}
          </ul>
        </LbPanelCard>

        <LbPanelCard
          className="mt-10"
          title="Quick start"
          subtitle="Local development"
          padding="md"
          footer={
            <>
              <LbButton
                variant="primary"
                onClick={() => window.open('http://localhost:9000', '_blank')}
              >
                Open legacy admin (:9000)
              </LbButton>
              <LbButton variant="secondary" onClick={() => window.open('/api', '_blank')}>
                Test API proxy
              </LbButton>
            </>
          }
        >
          <pre className="overflow-x-auto rounded-xl bg-mar-text p-4 text-sm text-mar-page">
            {`cd client_web2
cp .env.example .env
npm install
npm run dev    # http://localhost:9001`}
          </pre>
          <LbCardMeta className="mt-4 border-none pt-0">
            <LbCardMetaItem label="API" value="localhost:5000" />
            <LbCardMetaItem label="Web2" value="localhost:9001" />
          </LbCardMeta>
        </LbPanelCard>
    </LbContentContainer>
  );
}
