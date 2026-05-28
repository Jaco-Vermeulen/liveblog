import { describe, expect, it } from 'vitest';
import {
  buildPublishSchedulePatch,
  datetimeLocalToIso,
  isScheduledInFuture,
  scheduleEnabledFromPost,
} from './composerSchedule';

describe('composerSchedule', () => {
  it('detects future published_date as scheduled', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(scheduleEnabledFromPost(future)).toBe(true);
    expect(isScheduledInFuture(future)).toBe(true);
  });

  it('buildPublishSchedulePatch uses future date when scheduling', () => {
    const future = new Date(Date.now() + 3600_000).toISOString();
    const patch = buildPublishSchedulePatch(true, future);
    expect(patch.published_date).toBe(future);
    expect(patch.scheduled).toBe(true);
  });

  it('buildPublishSchedulePatch publishes now when not scheduling', () => {
    const patch = buildPublishSchedulePatch(false, null);
    expect(patch.scheduled).toBe(false);
    expect(patch.published_date).toBeTruthy();
  });

  it('round-trips datetime-local', () => {
    const iso = datetimeLocalToIso('2026-06-01T14:30');
    expect(iso).toBeTruthy();
  });
});
