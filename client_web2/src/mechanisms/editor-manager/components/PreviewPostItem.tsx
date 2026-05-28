import type { PollBody, PostItem } from '@/mechanisms/liveblog-api';
import { EmbedHtml, PostItemEmbed } from '../subsystems/embed-handlers';
import { isRichTextHtml } from '../subsystems/rich-text-editor';
import { PollPreviewBlock } from './PollPreviewBlock';

function isFreetypeItem(item: PostItem): boolean {
  return item.group_type === 'freetype' && Boolean(item.text?.trim());
}

function asPollBody(value: unknown): PollBody | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as PollBody;
  if (!body.question?.trim()) return null;
  return body;
}

export interface PreviewPostItemProps {
  item: PostItem;
}

export function PreviewPostItem({ item }: PreviewPostItemProps) {
  if (isFreetypeItem(item)) {
    return <EmbedHtml html={item.text!} className="lb-post__freetype" />;
  }

  if (item.item_type === 'embed') {
    return <PostItemEmbed item={item} showInfo={false} />;
  }

  const pollBody = item.item_type === 'poll' ? asPollBody(item.poll_body) : null;
  if (pollBody) {
    return <PollPreviewBlock pollBody={pollBody} />;
  }

  if (item.item_type === 'image' && item.text) {
    return <EmbedHtml html={item.text} className="lb-post__image" />;
  }

  const text = item.text?.trim() ?? '';
  const isQuote = Boolean(item.meta && typeof item.meta === 'object' && 'quote' in item.meta);

  if (!text) {
    return null;
  }

  if (isQuote) {
    if (isRichTextHtml(text)) {
      return (
        <blockquote className="lb-post__quote">
          <EmbedHtml html={text} className="lb-post__rich-text" />
        </blockquote>
      );
    }
    return (
      <blockquote className="lb-post__quote">
        <p>{text}</p>
      </blockquote>
    );
  }

  if (isRichTextHtml(text)) {
    return <EmbedHtml html={text} className="lb-post__rich-text" />;
  }

  return <p className="lb-post__text">{text}</p>;
}
