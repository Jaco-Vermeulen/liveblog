import { describe, expect, it } from 'vitest';
import type { PostItem } from '@/mechanisms/liveblog-api';
import { calculatePostItemsType } from './postItemsType';

function textItem(text: string): PostItem {
  return { item_type: 'text', text };
}

function imageItem(): PostItem {
  return { item_type: 'image', text: 'https://example.com/photo.jpg' };
}

function embedItem(providerName: string, url = 'https://example.com/article'): PostItem {
  return {
    item_type: 'embed',
    text: '<iframe></iframe>',
    meta: {
      provider_name: providerName,
      provider_url: url,
      original_url: url,
    },
  };
}

describe('calculatePostItemsType', () => {
  it('uses tree avatar for image plus text', () => {
    expect(calculatePostItemsType({}, [imageItem(), textItem('Caption')])).toEqual({
      postItemsType: 'image',
      postItemsIcon: null,
    });
  });

  it('uses tree avatar when custom text accompanies an embed', () => {
    expect(
      calculatePostItemsType({}, [textItem('Editorial context'), embedItem('Twitter')]),
    ).toEqual({
      postItemsType: 'text',
      postItemsIcon: null,
    });
  });

  it('uses social badge for known standalone embeds', () => {
    expect(calculatePostItemsType({}, [embedItem('Facebook')])).toEqual({
      postItemsType: 'embed-facebook',
      postItemsIcon: null,
    });
  });

  it('falls back to favicon for unknown standalone embeds', () => {
    expect(calculatePostItemsType({}, [embedItem('Example', 'https://news.example.com/story')])).toEqual({
      postItemsType: 'embed',
      postItemsIcon: 'https://www.google.com/s2/favicons?domain=news.example.com&sz=64',
    });
  });
});
