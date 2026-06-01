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
import { AF } from '@/copy';

const phases = [
  { name: 'Phase 0', label: AF.setup.phaseLabels.setup, status: 'done' as const },
  { name: 'Phase 1', label: AF.setup.phaseLabels.shellAuth, status: 'active' as const },
  { name: 'Phase 2', label: AF.setup.phaseLabels.blogList, status: 'upcoming' as const },
  { name: 'Phase 3', label: AF.setup.phaseLabels.editor, status: 'upcoming' as const },
];

export function SetupPage() {
  return (
    <LbContentContainer size="lg" centered={false} className="py-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-mar-text">{AF.setup.title}</h1>
          <p className="mt-3 max-w-2xl text-mar-muted">
            {AF.setup.description}{' '}
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
            title={AF.setup.modernStack}
            description={AF.setup.modernStackDesc}
          />
          <LbFeatureCard
            iconVariant="orange"
            icon={<Layers className="h-5 w-5" />}
            title={AF.setup.trackedMigration}
            description={AF.setup.trackedMigrationDesc}
          />
          <LbFeatureCard
            iconVariant="accent"
            icon={<Activity className="h-5 w-5" />}
            title={AF.setup.devPort}
            description={AF.setup.devPortDesc}
          />
        </div>

        <LbPanelCard
          className="mt-10"
          eyebrow={AF.setup.roadmap}
          title={AF.setup.phases}
          subtitle={AF.setup.phasesSubtitle}
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
                        ? AF.common.inProgress
                        : phase.status === 'done'
                          ? AF.common.done
                          : AF.common.planned}
                    </LbBadge>
                  </LbCardBody>
                </LbCard>
              </li>
            ))}
          </ul>
        </LbPanelCard>

        <LbPanelCard
          className="mt-10"
          title={AF.setup.quickStart}
          subtitle={AF.setup.quickStartSubtitle}
          padding="md"
          footer={
            <>
              <LbButton
                variant="primary"
                onClick={() => window.open('http://localhost:9000', '_blank')}
              >
                {AF.setup.openLegacy}
              </LbButton>
              <LbButton variant="secondary" onClick={() => window.open('/api', '_blank')}>
                {AF.setup.testApi}
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
