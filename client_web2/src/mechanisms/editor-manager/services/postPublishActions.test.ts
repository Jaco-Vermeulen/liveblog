import { describe, expect, it } from 'vitest';
import {
  canShowPublishAction,
  canShowUnpublishAction,
  isPublishedPost,
} from './postPublishActions';

describe('postPublishActions', () => {
  it('treats open posts as published', () => {
    expect(isPublishedPost({ post_status: 'open' })).toBe(true);
    expect(canShowPublishAction({ post_status: 'open' })).toBe(false);
    expect(canShowUnpublishAction({ post_status: 'open' })).toBe(true);
  });

  it('treats draft posts as unpublished', () => {
    expect(isPublishedPost({ post_status: 'draft' })).toBe(false);
    expect(canShowPublishAction({ post_status: 'draft' })).toBe(true);
  });

  it('treats posts with a past published_date as published when status is missing', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isPublishedPost({ post_status: '', published_date: past })).toBe(true);
    expect(canShowPublishAction({ post_status: '', published_date: past })).toBe(false);
  });

  it('does not treat future published_date as published when status is missing', () => {
    const future = new Date(Date.now() + 60 * 60_000).toISOString();
    expect(isPublishedPost({ post_status: '', published_date: future })).toBe(false);
    expect(canShowPublishAction({ post_status: '', published_date: future })).toBe(true);
  });
});
