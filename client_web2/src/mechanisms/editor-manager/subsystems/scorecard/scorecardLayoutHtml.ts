import { formatCurrentOverLabel, usesCricketScoreLayout } from './scorecardDisplay';
import { ensureCustomLists, listsForPlacement } from './scorecardCustomLists';
import {
  escapeScorecardHtml,
  renderAllCustomListsHtml,
  renderInlineListHtml,
} from './scorecardCustomListRender';
import type { ScorecardBody, ScorecardTeam } from './scorecardTypes';
import { AF } from '@/copy';

const SC = AF.editor.scorecard;

export { escapeScorecardHtml };

function renderTeamColumn(
  team: ScorecardTeam,
  side: 'home' | 'away',
  fallbackName: string,
  score: string,
  cricketLayout: boolean,
  inlineHtml: string,
  p: string,
): string {
  const name = team.name.trim() ? escapeScorecardHtml(team.name) : escapeScorecardHtml(fallbackName);
  const logo = team.logoUrl.trim()
    ? `<img src="${escapeScorecardHtml(team.logoUrl)}" alt="" class="${p}__logo" />`
    : `<div class="${p}__logo ${p}__logo--placeholder" aria-hidden="true"></div>`;
  const scoreHtml = cricketLayout
    ? `<span class="${p}__team-score">${escapeScorecardHtml(score)}</span>`
    : '';
  return (
    `<div class="${p}__team ${p}__team--${side}">` +
    logo +
    `<span class="${p}__team-name">${name}</span>` +
    scoreHtml +
    inlineHtml +
    `</div>`
  );
}

export function buildScorecardLayoutHtml(
  body: ScorecardBody,
  classPrefix: 'lb' | 'm' = 'lb',
): { scoreline: string; players: string; meta: string; cricketClass: string } {
  const p = classPrefix === 'm' ? 'm-scorecard-card' : 'lb-scorecard-card';
  const cricketLayout = usesCricketScoreLayout(body);
  const homeScore = body.home.score.trim() || '0';
  const awayScore = body.away.score.trim() || '0';
  const status = body.matchQuarters.trim();
  const currentOver = formatCurrentOverLabel(body.currentOver);
  const cricketClass = cricketLayout ? ` ${p}--cricket` : '';
  const lists = ensureCustomLists(body);
  const inlineLists = listsForPlacement(lists, 'team-inline');

  const statusParts: string[] = [];
  if (currentOver) {
    statusParts.push(`<span class="${p}__current-over">${escapeScorecardHtml(currentOver)}</span>`);
  }
  if (status) {
    statusParts.push(`<span class="${p}__result-status">${escapeScorecardHtml(status)}</span>`);
  }
  const statusHtml = statusParts.length ? `<div class="${p}__result-meta">${statusParts.join('')}</div>` : '';

  let centerHtml: string;
  if (cricketLayout) {
    centerHtml =
      `<div class="${p}__result" aria-label="Telling ${escapeScorecardHtml(homeScore)} teen ${escapeScorecardHtml(awayScore)}">` +
      statusHtml +
      `</div>`;
  } else {
    centerHtml =
      `<div class="${p}__result" aria-label="Telling ${escapeScorecardHtml(homeScore)} teen ${escapeScorecardHtml(awayScore)}">` +
      `<div class="${p}__result-scores">` +
      `<span class="${p}__score">${escapeScorecardHtml(homeScore)}</span>` +
      `<span class="${p}__score-sep">-</span>` +
      `<span class="${p}__score">${escapeScorecardHtml(awayScore)}</span>` +
      `</div>` +
      statusHtml +
      `</div>`;
  }

  const homeInline = inlineLists.map((list) => renderInlineListHtml(list, 'home', p)).join('');
  const awayInline = inlineLists.map((list) => renderInlineListHtml(list, 'away', p)).join('');

  const scoreline =
    `<div class="${p}__scoreline">` +
    renderTeamColumn(body.home, 'home', SC.homeTeam, homeScore, cricketLayout, homeInline, p) +
    centerHtml +
    renderTeamColumn(body.away, 'away', SC.awayTeam, awayScore, cricketLayout, awayInline, p) +
    `</div>`;

  const players = renderAllCustomListsHtml(lists, p);

  const meta = body.matchInfo.trim()
    ? `<footer class="${p}__meta"><p>${escapeScorecardHtml(body.matchInfo)}</p></footer>`
    : '';

  return { scoreline, players, meta, cricketClass };
}
