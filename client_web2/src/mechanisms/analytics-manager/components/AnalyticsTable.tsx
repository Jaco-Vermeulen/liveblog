import { useMemo, useState } from 'react';
import { AF } from '@/copy';
import type { BlogAnalyticsRow } from '@/mechanisms/liveblog-api';

const PAGE_SIZE = 25;

type SortKey = 'context_url' | 'hits' | '';

export interface AnalyticsTableProps {
  rows: BlogAnalyticsRow[];
}

export function AnalyticsTable({ rows }: AnalyticsTableProps) {
  const [predicate, setPredicate] = useState<SortKey>('');
  const [reverse, setReverse] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter((r) => r.context_url.toLowerCase().includes(q));
    }
    if (predicate) {
      list = [...list].sort((a, b) => {
        const av = a[predicate];
        const bv = b[predicate];
        if (av < bv) return reverse ? 1 : -1;
        if (av > bv) return reverse ? -1 : 1;
        return 0;
      });
    }
    return list;
  }, [rows, filterText, predicate, reverse]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (predicate === key) {
      setReverse((r) => !r);
    } else {
      setPredicate(key);
      setReverse(false);
    }
    setPage(1);
  };

  return (
    <div className="m-analytics-table">
      <div className="mb-3">
        <input
          type="search"
          className="w-full max-w-md rounded border border-mar-border bg-mar-input px-3 py-2 text-sm"
          placeholder="Filter op referrer URL…"
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-mar-border text-left">
            <th className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => toggleSort('context_url')}>
                Blog referrer URL {predicate === 'context_url' ? (reverse ? '↓' : '↑') : ''}
              </button>
            </th>
            <th className="py-2">
              <button type="button" className="font-semibold" onClick={() => toggleSort('hits')}>
                Hit count {predicate === 'hits' ? (reverse ? '↓' : '↑') : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-6 text-mar-muted">
                {AF.analytics.noData}
              </td>
            </tr>
          ) : (
            pageRows.map((row) => (
              <tr key={row._id} className="border-b border-mar-border/60">
                <td className="py-2 pr-4 break-all">{row.context_url}</td>
                <td className="py-2">{row.hits}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <button
            type="button"
            className="rounded border border-mar-border px-2 py-1 disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Vorige
          </button>
          <span>
            Bladsy {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded border border-mar-border px-2 py-1 disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}
