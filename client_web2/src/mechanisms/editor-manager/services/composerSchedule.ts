/** Schedule / publish-date helpers for the post composer (legacy blog-edit parity). */

export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToIso(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function isScheduledInFuture(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
}

export function scheduleEnabledFromPost(publishedDate?: string | null): boolean {
  return isScheduledInFuture(publishedDate);
}

export function buildPublishSchedulePatch(
  scheduleEnabled: boolean,
  scheduledDate: string | null,
): { published_date?: string; scheduled?: boolean } {
  if (scheduleEnabled && scheduledDate) {
    return {
      published_date: scheduledDate,
      scheduled: isScheduledInFuture(scheduledDate),
    };
  }
  return {
    published_date: new Date().toISOString(),
    scheduled: false,
  };
}
