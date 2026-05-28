import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbInput } from '@/components/ui/LbInput';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { useSyndicationAdmin } from '../hooks/useSyndicationAdmin';

export function SyndicationManagerPage() {
  const syn = useSyndicationAdmin();

  return (
    <LbContentContainer size="full" className="py-6">
      <nav className="mb-6 flex gap-2 border-b border-mar-border pb-2">
        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            syn.activeTab === 'producers' ? 'bg-mar-teal text-white' : 'text-mar-muted'
          }`}
          onClick={() => syn.setTab('producers')}
        >
          Produseerders
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            syn.activeTab === 'consumers' ? 'bg-mar-teal text-white' : 'text-mar-muted'
          }`}
          onClick={() => syn.setTab('consumers')}
        >
          Verbruikers
        </button>
      </nav>

      {syn.error && (
        <LbAlert variant="error" className="mb-4">
          {syn.error}
        </LbAlert>
      )}
      {syn.message && (
        <LbAlert variant="info" className="mb-4">
          {syn.message}
        </LbAlert>
      )}

      {syn.loading ? (
        <LbSpinner tone="dark" />
      ) : syn.activeTab === 'producers' ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <LbInput
              placeholder="Nuwe produseerder naam"
              value={syn.nameDraft}
              onChange={(e) => syn.setNameDraft(e.target.value)}
            />
            <LbButton type="button" variant="primary" onClick={() => void syn.addProducer()}>
              Voeg by
            </LbButton>
          </div>
          <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
            {syn.producers.map((p) => (
              <li key={p._id} className="flex justify-between gap-2 p-4">
                <span className="font-medium">{p.name}</span>
                <LbButton type="button" variant="secondary" onClick={() => void syn.removeProducer(p)}>
                  Verwyder
                </LbButton>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
          {syn.consumers.length === 0 ? (
            <li className="p-4 text-sm text-mar-muted">Geen verbruikers nie.</li>
          ) : (
            syn.consumers.map((c) => (
              <li key={c._id} className="p-4">
                <div className="font-medium">{c.name}</div>
                {c.contacts?.[0]?.email && (
                  <div className="text-xs text-mar-muted">{c.contacts[0].email}</div>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      <p className="mt-6 text-xs text-mar-muted">
        Sindikasie-in/uit en redigeerder-ingest-paneel vereis websocket-manager (volgende fase).
      </p>
    </LbContentContainer>
  );
}
