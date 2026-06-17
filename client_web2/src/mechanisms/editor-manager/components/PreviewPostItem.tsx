import type { PollBody, PostItem } from '@/mechanisms/liveblog-api';
import { EmbedHtml, PostItemEmbed } from '../subsystems/embed-handlers';
import { isRichTextHtml } from '../subsystems/rich-text-editor';
import { imagePreviewHtml } from '../services/previewItemLayout';
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
    return <EmbedHtml html={item.text!} className="m-embed-html" />;
  }

  if (item.item_type === 'embed') {
    return <PostItemEmbed item={item} showInfo={false} />;
  }

  const pollBody = item.item_type === 'poll' ? asPollBody(item.poll_body) : null;
  if (pollBody) {
    return <PollPreviewBlock pollBody={pollBody} />;
  }

  if (item.item_type === 'image') {
    const html = imagePreviewHtml(item);
    if (html) {
      return <EmbedHtml html={html} className="m-embed-html" />;
    }
    return null;
  }

  const text = item.text?.trim() ?? '';
  const isQuote = Boolean(item.meta && typeof item.meta === 'object' && 'quote' in item.meta);

  if (!text) {
    return null;
  }

  if (isQuote) {
    if (isRichTextHtml(text)) {
      return (
        <div className="item--embed-quote">
          <blockquote>
            <EmbedHtml html={text} className="m-embed-html" />
          </blockquote>
        </div>
      );
    }
    return (
      <div className="item--embed-quote">
        <blockquote>
          <p>{text}</p>
        </blockquote>
      </div>
    );
  }

  if (isRichTextHtml(text)) {
    return (
      <article>
        <EmbedHtml html={text} className="m-embed-html lb-post__rich-text" />
      </article>
    );
  }

  return (
    <article>
      <p>{text}</p>
    </article>
  );
}
