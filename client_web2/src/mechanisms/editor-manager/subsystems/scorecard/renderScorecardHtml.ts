import { AF } from '@/copy';
import type { ScorecardBody } from './scorecardTypes';
import { buildScorecardLayoutHtml, escapeScorecardHtml } from './scorecardLayoutHtml';

/** Timeline/embed HTML — matches editor ScorecardCard layout. */
export function renderScorecardHtml(body: ScorecardBody): string {
  const bg = body.backgroundUrl.trim();
  const bgClass = bg ? ' lb-scorecard-card--has-bg' : '';
  const bgStyle = bg ? ` style="background-image:url(${escapeScorecardHtml(bg)})"` : '';

  const { scoreline, players, meta, cricketClass } = buildScorecardLayoutHtml(body, 'lb');

  return (
    `<div class="lb-scorecard-card${cricketClass}${bgClass}"${bgStyle} role="region" aria-label="${escapeScorecardHtml(AF.editor.scorecard.ariaLabel)}">` +
    '<div class="lb-scorecard-card__overlay" aria-hidden="true"></div>' +
    scoreline +
    players +
    meta +
    '</div>'
  );
}
