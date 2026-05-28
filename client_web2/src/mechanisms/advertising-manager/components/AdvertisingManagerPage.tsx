import { useState } from 'react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { useAdvertisingManager } from '../hooks/useAdvertisingManager';

export function AdvertisingManagerPage() {
  const mgr = useAdvertisingManager();
  const [advertForm, setAdvertForm] = useState({
    name: '',
    type: 'Advertisement Local',
    text: '',
  });
  const [collectionForm, setCollectionForm] = useState({ name: '' });

  const openAdvert = (ad?: typeof mgr.adverts[0]) => {
    mgr.setAdvertModal(ad ?? 'new');
    setAdvertForm({
      name: ad?.name ?? '',
      type: ad?.type ?? 'Advertisement Local',
      text: ad?.text ?? '',
    });
  };

  const openCollection = (col?: typeof mgr.collections[0]) => {
    mgr.setCollectionModal(col ?? 'new');
    setCollectionForm({ name: col?.name ?? '' });
  };

  return (
    <LbContentContainer size="full" className="py-6">
      <nav className="mb-6 flex gap-2 border-b border-mar-border pb-2">
        {(['adverts', 'collections'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              mgr.activeTab === tab ? 'bg-mar-teal text-white' : 'text-mar-muted hover:bg-mar-beige'
            }`}
            onClick={() => mgr.setActiveTab(tab)}
          >
            {tab === 'adverts' ? 'Advertensies' : 'Versamelings'}
          </button>
        ))}
      </nav>

      {mgr.error && (
        <LbAlert variant="error" className="mb-4">
          {mgr.error}
        </LbAlert>
      )}
      {mgr.message && (
        <LbAlert variant="info" className="mb-4">
          {mgr.message}
        </LbAlert>
      )}

      <div className="mb-4">
        <LbButton
          type="button"
          variant="primary"
          onClick={() =>
            mgr.activeTab === 'adverts' ? openAdvert() : openCollection()
          }
        >
          {mgr.activeTab === 'adverts' ? 'Nuwe advertensie' : 'Nuwe versameling'}
        </LbButton>
      </div>

      {mgr.loading ? (
        <LbSpinner tone="dark" />
      ) : mgr.activeTab === 'adverts' ? (
        <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
          {mgr.adverts.map((ad) => (
            <li key={ad._id} className="flex justify-between gap-2 p-4">
              <div>
                <div className="font-medium">{ad.name}</div>
                <div className="text-xs text-mar-muted">{ad.type}</div>
              </div>
              <div className="flex gap-2">
                <LbButton type="button" variant="secondary" onClick={() => openAdvert(ad)}>
                  Wysig
                </LbButton>
                <LbButton type="button" variant="secondary" onClick={() => void mgr.removeAdvert(ad)}>
                  Verwyder
                </LbButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
          {mgr.collections.map((col) => (
            <li key={col._id} className="flex justify-between gap-2 p-4">
              <div className="font-medium">{col.name}</div>
              <div className="flex gap-2">
                <LbButton type="button" variant="secondary" onClick={() => openCollection(col)}>
                  Wysig
                </LbButton>
                <LbButton
                  type="button"
                  variant="secondary"
                  onClick={() => void mgr.removeCollection(col)}
                >
                  Verwyder
                </LbButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <LbModal
        open={mgr.advertModal !== null}
        onClose={() => mgr.setAdvertModal(null)}
        title={mgr.advertModal === 'new' ? 'Nuwe advertensie' : 'Wysig advertensie'}
        footer={
          <>
            <LbButton type="button" variant="secondary" onClick={() => mgr.setAdvertModal(null)}>
              Kanselleer
            </LbButton>
            <LbButton
              type="button"
              variant="primary"
              onClick={() =>
                void mgr.saveAdvert({
                  name: advertForm.name,
                  type: advertForm.type,
                  text: advertForm.text,
                  meta: { data: {} },
                })
              }
            >
              Stoor
            </LbButton>
          </>
        }
      >
        <LbFormField label="Naam" htmlFor="ad-name">
          <LbInput
            id="ad-name"
            value={advertForm.name}
            onChange={(e) => setAdvertForm((f) => ({ ...f, name: e.target.value }))}
          />
        </LbFormField>
        <LbFormField label="Tipe" htmlFor="ad-type">
          <select
            id="ad-type"
            className="w-full rounded border border-mar-border px-3 py-2 text-sm"
            value={advertForm.type}
            onChange={(e) => setAdvertForm((f) => ({ ...f, type: e.target.value }))}
          >
            {mgr.adTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </LbFormField>
        <LbFormField label="HTML teks" htmlFor="ad-text">
          <textarea
            id="ad-text"
            className="min-h-[80px] w-full rounded border border-mar-border px-3 py-2 text-sm"
            value={advertForm.text}
            onChange={(e) => setAdvertForm((f) => ({ ...f, text: e.target.value }))}
          />
        </LbFormField>
        <p className="text-xs text-mar-muted">
          Volledige freetype-sjabloonweergawe volg in freetypes-manager integrasie.
        </p>
      </LbModal>

      <LbModal
        open={mgr.collectionModal !== null}
        onClose={() => mgr.setCollectionModal(null)}
        title={mgr.collectionModal === 'new' ? 'Nuwe versameling' : 'Wysig versameling'}
        footer={
          <>
            <LbButton type="button" variant="secondary" onClick={() => mgr.setCollectionModal(null)}>
              Kanselleer
            </LbButton>
            <LbButton
              type="button"
              variant="primary"
              onClick={() =>
                void mgr.saveCollection({
                  name: collectionForm.name,
                  advertisements: [],
                })
              }
            >
              Stoor
            </LbButton>
          </>
        }
      >
        <LbFormField label="Naam" htmlFor="col-name">
          <LbInput
            id="col-name"
            value={collectionForm.name}
            onChange={(e) => setCollectionForm({ name: e.target.value })}
          />
        </LbFormField>
      </LbModal>
    </LbContentContainer>
  );
}
