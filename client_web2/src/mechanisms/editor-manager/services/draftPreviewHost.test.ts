import { describe, expect, it, beforeEach } from 'vitest';
import {
  DRAFT_PREVIEW_HOST_ID,
  ensureDraftPreviewHost,
  removeDraftPreviewHost,
} from './draftPreviewHost';

describe('draftPreviewHost', () => {
  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('preview');
    doc.body.innerHTML = `
      <div data-timeline class="lb-timeline">
        <div class="timeline-body">
          <section data-timeline-normal class="lb-posts list-group normal">
            <article class="lb-post">Published</article>
          </section>
        </div>
      </div>
    `;
  });

  it('inserts draft host at the top of the normal posts section', () => {
    const host = ensureDraftPreviewHost(doc);
    const section = doc.querySelector('section[data-timeline-normal]');

    expect(host.id).toBe(DRAFT_PREVIEW_HOST_ID);
    expect(section?.firstElementChild).toBe(host);
  });

  it('reuses an existing host', () => {
    const first = ensureDraftPreviewHost(doc);
    const second = ensureDraftPreviewHost(doc);
    expect(second).toBe(first);
    expect(doc.querySelectorAll(`#${DRAFT_PREVIEW_HOST_ID}`)).toHaveLength(1);
  });

  it('removes the host on teardown', () => {
    ensureDraftPreviewHost(doc);
    removeDraftPreviewHost(doc);
    expect(doc.getElementById(DRAFT_PREVIEW_HOST_ID)).toBeNull();
  });
});
