import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { useFreetypesManager } from '../hooks/useFreetypesManager';

export function FreetypesManagerPage() {
  const {
    freetypes,
    loading,
    saving,
    error,
    message,
    modalOpen,
    editing,
    dialog,
    setDialog,
    openDialog,
    closeDialog,
    save,
    remove,
  } = useFreetypesManager();

  return (
    <LbContentContainer size="full" className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-mar-muted">
          Bestuur pasgemaakte pos-tipes met $veranderlikes in sjablone.
        </p>
        <LbButton type="button" variant="primary" onClick={() => openDialog()}>
          Nuwe vrye tipe
        </LbButton>
      </div>

      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}
      {message && (
        <LbAlert variant="info" className="mb-4">
          {message}
        </LbAlert>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <LbSpinner tone="dark" />
        </div>
      ) : (
        <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
          {freetypes.length === 0 ? (
            <li className="p-6 text-sm text-mar-muted">Geen vrye tipes nie.</li>
          ) : (
            freetypes.map((ft) => (
              <li key={ft._id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <span className="font-medium">{ft.name}</span>
                  {(ft as { isUsed?: boolean }).isUsed && (
                    <span className="ml-2 text-xs text-mar-muted">(in gebruik)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <LbButton type="button" variant="secondary" onClick={() => openDialog(ft)}>
                    Wysig
                  </LbButton>
                  <LbButton type="button" variant="secondary" onClick={() => void remove(ft)}>
                    Verwyder
                  </LbButton>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      <LbModal
        open={modalOpen}
        onClose={closeDialog}
        title={editing ? 'Wysig vrye tipe' : 'Nuwe vrye tipe'}
        footer={
          <>
            <LbButton type="button" variant="secondary" onClick={closeDialog}>
              Kanselleer
            </LbButton>
            <LbButton type="button" variant="primary" disabled={saving} onClick={() => void save()}>
              Stoor
            </LbButton>
          </>
        }
      >
        <LbFormField label="Naam" htmlFor="freetype-name">
          <LbInput
            id="freetype-name"
            value={dialog.name}
            onChange={(e) => setDialog((d) => ({ ...d, name: e.target.value }))}
          />
        </LbFormField>
        <LbFormField label="Sjabloon ($veranderlikes verplig)" htmlFor="freetype-template">
          <textarea
            id="freetype-template"
            className="min-h-[120px] w-full rounded border border-mar-border px-3 py-2 text-sm"
            value={dialog.template}
            onChange={(e) => setDialog((d) => ({ ...d, template: e.target.value }))}
          />
        </LbFormField>
      </LbModal>
    </LbContentContainer>
  );
}
