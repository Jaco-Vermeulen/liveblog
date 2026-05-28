import type { BlogAnalyticsRow } from '@/mechanisms/liveblog-api';

/** Legacy CSV: blog_id,context_url,hits per line, no header. */
export function buildAnalyticsCsv(rows: BlogAnalyticsRow[]): string {
  return rows.map((row) => [row.blog_id, row.context_url, row.hits].join(',')).join('\n');
}

export function downloadAnalyticsCsv(rows: BlogAnalyticsRow[], blogId: string): void {
  const content = buildAnalyticsCsv(rows);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const filename = `liveblog_analytics_${blogId}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
