import { describe, expect, it } from 'vitest';
import {
  blocksToPostItems,
  freetypeHasContent,
  isBlockEmpty,
  loadFreetypeFromPost,
  postToBlocks,
} from './blockTransform';

describe('blockTransform', () => {
  it('converts text blocks to post items', () => {
    const items = blocksToPostItems([{ type: 'Text', data: { text: 'Hello world' } }]);
    expect(items).toEqual([
      { item_type: 'text', text: 'Hello world', group_type: 'default', meta: undefined },
    ]);
  });

  it('skips empty text blocks', () => {
    const items = blocksToPostItems([{ type: 'Text', data: { text: '   ' } }]);
    expect(items).toHaveLength(0);
  });

  it('isBlockEmpty matches blocksToPostItems filtering', () => {
    expect(isBlockEmpty({ type: 'Text', data: { text: '' } })).toBe(true);
    expect(isBlockEmpty({ type: 'Text', data: { text: 'Hi' } })).toBe(false);
    expect(isBlockEmpty({ type: 'Embed', data: { url: '', embedMeta: null } })).toBe(true);
    expect(
      isBlockEmpty({
        type: 'Poll',
        data: { pollBody: { question: '', answers: [], active_until: '' } },
      }),
    ).toBe(true);
  });

  it('maps poll blocks to post items', () => {
    const items = blocksToPostItems([
      {
        type: 'Poll',
        data: {
          pollBody: {
            question: 'Best team?',
            answers: [
              { option: 'A', votes: 0 },
              { option: 'B', votes: 0 },
            ],
            active_until: new Date(Date.now() + 60_000).toISOString(),
          },
        },
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]?.item_type).toBe('poll');
    const pollBody = items[0]?.poll_body as { question?: string } | undefined;
    expect(pollBody?.question).toBe('Best team?');
  });

  it('persists resolved embed meta and html', () => {
    const items = blocksToPostItems([
      {
        type: 'Embed',
        data: {
          url: 'https://twitter.com/x/status/1',
          embedMeta: {
            html: '<blockquote class="twitter-tweet"></blockquote>',
            provider_name: 'Twitter',
            original_url: 'https://twitter.com/x/status/1',
          },
        },
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]?.item_type).toBe('embed');
    expect(items[0]?.text).toContain('twitter-tweet');
    expect(items[0]?.meta?.provider_name).toBe('Twitter');
  });

  it('round-trips embed posts to blocks', () => {
    const blocks = postToBlocks({
      mainItem: {
        item: {
          item_type: 'embed',
          text: '<p>embed html</p>',
          meta: {
            provider_name: 'Facebook',
            original_url: 'https://facebook.com/post/1',
            html: '<p>embed html</p>',
          },
        },
      },
    });
    expect(blocks[0]?.type).toBe('Embed');
    expect(blocks[0]?.data.url).toBe('https://facebook.com/post/1');
    expect(blocks[0]?.data.embedMeta).toMatchObject({ provider_name: 'Facebook' });
  });

  it('round-trips text posts to blocks', () => {
    const blocks = postToBlocks({
      mainItem: { item: { item_type: 'text', text: 'Saved' } },
    });
    expect(blocks[0]?.type).toBe('Text');
    expect(blocks[0]?.data.text).toBe('Saved');
  });

  it('detects freetype field content', () => {
    const template = '<span name="$title"></span>';
    expect(freetypeHasContent(template, {})).toBe(false);
    expect(freetypeHasContent(template, { title: 'News' })).toBe(true);
  });

  it('maps image blocks to post items', () => {
    const items = blocksToPostItems([{ type: 'Image', data: { url: 'https://example.com/a.jpg' } }]);
    expect(items[0]?.item_type).toBe('image');
    expect(items[0]?.text).toBe('https://example.com/a.jpg');
  });

  it('round-trips image posts to blocks', () => {
    const blocks = postToBlocks({
      mainItem: { item: { item_type: 'image', text: 'https://example.com/pic.png' } },
    });
    expect(blocks[0]?.type).toBe('Image');
    expect(blocks[0]?.data.url).toBe('https://example.com/pic.png');
  });

  it('loads freetype posts for editor', () => {
    const loaded = loadFreetypeFromPost(
      {
        _id: 'p1',
        blog: 'b1',
        post_status: 'open',
        groups: [],
        mainItem: {
          item: {
            item_type: 'Custom',
            group_type: 'freetype',
            text: '<span>Hi</span>',
            meta: { data: { title: 'Hi' } },
          },
        },
      },
      [{ _id: 'ft1', name: 'Custom', template: '<span name="$title"></span>' }],
    );
    expect(loaded?.freetype.name).toBe('Custom');
    expect(loaded?.data).toEqual({ title: 'Hi' });
  });
});
