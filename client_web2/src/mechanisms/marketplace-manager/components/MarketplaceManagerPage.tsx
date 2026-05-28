import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { useMarketplace } from '../hooks/useMarketplace';

export function MarketplaceManagerPage() {
  const mp = useMarketplace();

  return (
    <LbContentContainer size="full" className="py-6">
      <nav className="mb-4 flex gap-2">
        {(['Marketers', 'Producers'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${
              mp.activeTab === tab ? 'bg-mar-teal text-white' : 'text-mar-muted'
            }`}
            onClick={() => mp.setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <LbButton type="button" variant="secondary" onClick={() => mp.setSearchPanelOpen((o) => !o)}>
          {mp.searchPanelOpen ? 'Versteek filters' : 'Wys filters'}
        </LbButton>
      </nav>

      {mp.error && (
        <LbAlert variant="error" className="mb-4">
          {mp.error}
        </LbAlert>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {mp.searchPanelOpen && (
          <aside className="w-full shrink-0 rounded border border-mar-border bg-mar-panel p-4 lg:w-64">
            <h2 className="m-0 mb-3 text-sm font-semibold">Marketers</h2>
            <ul className="space-y-1 text-sm">
              {mp.marketers.map((m) => (
                <li key={m._id}>
                  <button
                    type="button"
                    className="text-mar-teal hover:underline"
                    onClick={() => mp.toggleFilter('marketer', { _id: m._id, name: m.name })}
                  >
                    {m.name}
                  </button>
                </li>
              ))}
            </ul>
            <h2 className="mb-3 mt-4 text-sm font-semibold">Tale</h2>
            <ul className="space-y-1 text-sm">
              {mp.languages.map((lang) => (
                <li key={lang._id}>
                  <button
                    type="button"
                    className="text-mar-teal hover:underline"
                    onClick={() => mp.toggleFilter('language', lang.name)}
                  >
                    {lang.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="min-w-0 flex-1">
          {mp.loading ? (
            <LbSpinner tone="dark" />
          ) : (
            <>
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">Aktiewe blogs</h2>
                {mp.blogs.length === 0 ? (
                  <p className="text-sm text-mar-muted">Geen blogs nie.</p>
                ) : (
                  <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
                    {mp.blogs.map((blog) => (
                      <li key={blog._id} className="flex justify-between gap-2 p-4">
                        <div>
                          <div className="font-medium">{blog.title}</div>
                          <div className="text-xs text-mar-muted">{blog.start_date}</div>
                        </div>
                        <LbButton
                          type="button"
                          variant="secondary"
                          onClick={() => mp.setEmbedModalBlog(blog)}
                        >
                          Inbed
                        </LbButton>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h2 className="mb-3 text-lg font-semibold">Komende blogs</h2>
                {mp.forthcoming.length === 0 ? (
                  <p className="text-sm text-mar-muted">Geen komende blogs nie.</p>
                ) : (
                  <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
                    {mp.forthcoming.map((blog) => (
                      <li key={blog._id} className="p-4">
                        <div className="font-medium">{blog.title}</div>
                        <div className="text-xs text-mar-muted">{blog.start_date}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <LbModal
        open={mp.embedModalBlog !== null}
        onClose={() => mp.setEmbedModalBlog(null)}
        title="Inbed kode"
        footer={
          <LbButton type="button" variant="secondary" onClick={() => mp.setEmbedModalBlog(null)}>
            Sluit
          </LbButton>
        }
      >
        {mp.embedModalBlog && (
          <p className="text-sm text-mar-muted">
            Inbed vir <strong>{mp.embedModalBlog.title}</strong> — volledige voorbeeld volg in Phase 6+.
          </p>
        )}
      </LbModal>
    </LbContentContainer>
  );
}
