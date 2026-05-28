import type { EmbedMeta } from '../types';

export interface EmbedInfoProps {
  meta: EmbedMeta;
  originalUrl?: string;
  credit?: string;
}

export function EmbedInfo({ meta, originalUrl, credit }: EmbedInfoProps) {
  const link = originalUrl ?? meta.original_url ?? meta.url;
  const creditText = credit ?? meta.credit ?? meta.provider_name;
  const title =
    meta.title && !String(meta.title).includes('undefined') ? meta.title : undefined;
  const description =
    meta.description && !String(meta.description).includes('undefined')
      ? meta.description
      : undefined;

  return (
    <div className="m-embed-info">
      {title && <div className="m-embed-info__title">{title}</div>}
      {description && <div className="m-embed-info__description">{description}</div>}
      {creditText && <div className="m-embed-info__credit">{creditText}</div>}
      {link && (
        <a
          className="m-embed-info__link"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link}
        </a>
      )}
    </div>
  );
}
