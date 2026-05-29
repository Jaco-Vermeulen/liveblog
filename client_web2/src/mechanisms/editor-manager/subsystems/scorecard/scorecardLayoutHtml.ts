import { presetConfigForBody } from './scorecardPresets';
import {
  formatCurrentOverLabel,
  resolveTeamDisplay,
  teamHasBatters,
  teamHasBowlers,
  usesCricketScoreLayout,
  usesSplitInningsPanel,
} from './scorecardDisplay';
import type { ScorecardBody, ScorecardPlayerRow, ScorecardScorer, ScorecardTeam } from './scorecardTypes';

export function escapeScorecardHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatScorerDetail(scorer: ScorecardScorer, minuteSuffix: boolean): string {
  const detail = scorer.minute.trim();
  if (!detail) return '–';
  return minuteSuffix ? `${escapeScorecardHtml(detail)}'` : escapeScorecardHtml(detail);
}

function formatScorerStat(scorer: ScorecardScorer, showStat: boolean): string {
  if (!showStat) return '';
  const stat = scorer.stat.trim();
  return stat ? escapeScorecardHtml(stat) : '–';
}

function renderHomeScorerLi(s: ScorecardScorer, p: string, minuteSuffix: boolean, showStat: boolean): string {
  const min = formatScorerDetail(s, minuteSuffix);
  const name = s.name.trim() ? escapeScorecardHtml(s.name) : '—';
  const stat = formatScorerStat(s, showStat);
  const statHtml = showStat ? `<span class="${p}__scorer-stat">${stat}</span>` : '';
  return `<li>${statHtml}<span class="${p}__scorer-min">${min}</span><span class="${p}__scorer-name">${name}</span></li>`;
}

function renderAwayScorerLi(s: ScorecardScorer, p: string, minuteSuffix: boolean, showStat: boolean): string {
  const min = formatScorerDetail(s, minuteSuffix);
  const name = s.name.trim() ? escapeScorecardHtml(s.name) : '—';
  const stat = formatScorerStat(s, showStat);
  const statHtml = showStat ? `<span class="${p}__scorer-stat">${stat}</span>` : '';
  return `<li><span class="${p}__scorer-name">${name}</span><span class="${p}__scorer-min">${min}</span>${statHtml}</li>`;
}

function renderPlayerHomeLi(row: ScorecardPlayerRow, p: string): string {
  const figures = row.figures.trim() ? escapeScorecardHtml(row.figures) : '–';
  const name = row.name.trim() ? escapeScorecardHtml(row.name) : '—';
  return `<li><span class="${p}__scorer-min">${figures}</span><span class="${p}__scorer-name">${name}</span></li>`;
}

function renderPlayerAwayLi(row: ScorecardPlayerRow, p: string): string {
  const figures = row.figures.trim() ? escapeScorecardHtml(row.figures) : '–';
  const name = row.name.trim() ? escapeScorecardHtml(row.name) : '—';
  return `<li><span class="${p}__scorer-name">${name}</span><span class="${p}__scorer-min">${figures}</span></li>`;
}

function renderTeamExtras(team: ScorecardTeam, p: string): string {
  const rows = team.extras.filter((e) => e.label.trim() || e.value.trim());
  if (!rows.length) return '';
  const items = rows
    .map(
      (e) =>
        `<li><span class="${p}__extra-label">${escapeScorecardHtml(e.label || '—')}</span>` +
        `<span class="${p}__extra-value">${escapeScorecardHtml(e.value || '—')}</span></li>`,
    )
    .join('');
  return `<ul class="${p}__team-extras">${items}</ul>`;
}

function renderTeamColumn(
  team: ScorecardTeam,
  side: 'home' | 'away',
  fallbackName: string,
  score: string,
  cricketLayout: boolean,
  p: string,
): string {
  const name = team.name.trim() ? escapeScorecardHtml(team.name) : escapeScorecardHtml(fallbackName);
  const logo = team.logoUrl.trim()
    ? `<img src="${escapeScorecardHtml(team.logoUrl)}" alt="" class="${p}__logo" />`
    : `<div class="${p}__logo ${p}__logo--placeholder" aria-hidden="true"></div>`;
  const extras = renderTeamExtras(team, p);
  const scoreHtml = cricketLayout
    ? `<span class="${p}__team-score">${escapeScorecardHtml(score)}</span>`
    : '';
  return (
    `<div class="${p}__team ${p}__team--${side}">` +
    logo +
    `<span class="${p}__team-name">${name}</span>` +
    scoreHtml +
    extras +
    `</div>`
  );
}

function renderSidePlayerList(
  side: 'home' | 'away',
  batters: ScorecardScorer[],
  bowlers: ScorecardPlayerRow[],
  display: { batters: boolean; bowlers: boolean },
  p: string,
  minuteSuffix: boolean,
  showStat: boolean,
): string {
  const parts: string[] = [];

  if (display.batters && batters.length) {
    const items = batters
      .map((s) => (side === 'home' ? renderHomeScorerLi(s, p, minuteSuffix, showStat) : renderAwayScorerLi(s, p, minuteSuffix, showStat)))
      .join('');
    parts.push(`<ul class="${p}__scorer-list" data-side="${side}" data-role="batters">${items}</ul>`);
  }

  if (display.bowlers && bowlers.length) {
    const items = bowlers
      .map((b) => (side === 'home' ? renderPlayerHomeLi(b, p) : renderPlayerAwayLi(b, p)))
      .join('');
    parts.push(`<ul class="${p}__scorer-list" data-side="${side}" data-role="bowlers">${items}</ul>`);
  }

  return parts.join('');
}

function renderPlayersPanel(body: ScorecardBody, p: string, preset: ReturnType<typeof presetConfigForBody>): string {
  const homeDisplay = resolveTeamDisplay('home', body);
  const awayDisplay = resolveTeamDisplay('away', body);
  const homeBatters = body.home.scorers.filter((s) => s.name.trim() || s.minute.trim() || s.stat.trim());
  const awayBatters = body.away.scorers.filter((s) => s.name.trim() || s.minute.trim() || s.stat.trim());
  const homeBowlers = body.home.bowlers.filter((b) => b.name.trim() || b.figures.trim());
  const awayBowlers = body.away.bowlers.filter((b) => b.name.trim() || b.figures.trim());

  const homeHasPlayers =
    (homeDisplay.batters && homeBatters.length > 0) || (homeDisplay.bowlers && homeBowlers.length > 0);
  const awayHasPlayers =
    (awayDisplay.batters && awayBatters.length > 0) || (awayDisplay.bowlers && awayBowlers.length > 0);

  if (!homeHasPlayers && !awayHasPlayers) return '';

  const splitPanel = usesSplitInningsPanel(body);
  const scorersHeading = body.scorersLabel.trim() || preset.scorersLabel;
  const bowlersHeading = body.bowlersLabel.trim() || preset.bowlersLabel;

  if (splitPanel) {
    const homeList = renderSidePlayerList(
      'home',
      homeBatters,
      homeBowlers,
      homeDisplay,
      p,
      preset.minuteSuffix,
      preset.showScorerStat,
    );
    const awayList = renderSidePlayerList(
      'away',
      awayBatters,
      awayBowlers,
      awayDisplay,
      p,
      preset.minuteSuffix,
      preset.showScorerStat,
    );
    const homeHeading = homeDisplay.batters && !homeDisplay.bowlers
      ? scorersHeading
      : homeDisplay.bowlers && !homeDisplay.batters
        ? bowlersHeading
        : scorersHeading;
    const awayHeading = awayDisplay.batters && !awayDisplay.bowlers
      ? scorersHeading
      : awayDisplay.bowlers && !awayDisplay.batters
        ? bowlersHeading
        : bowlersHeading;

    return (
      `<div class="${p}__scorers-panel ${p}__scorers-panel--split">` +
      `<div class="${p}__scorers-row">` +
      (homeList
        ? `<div class="${p}__scorers-side" data-side="home">` +
          `<p class="${p}__scorers-heading">${escapeScorecardHtml(homeHeading)}</p>${homeList}</div>`
        : '') +
      (awayList
        ? `<div class="${p}__scorers-side" data-side="away">` +
          `<p class="${p}__scorers-heading">${escapeScorecardHtml(awayHeading)}</p>${awayList}</div>`
        : '') +
      `</div></div>`
    );
  }

  let scorers = '';
  if (
    (homeDisplay.batters && teamHasBatters(body.home)) ||
    (awayDisplay.batters && teamHasBatters(body.away))
  ) {
    const homeList =
      homeDisplay.batters && homeBatters.length
        ? `<ul class="${p}__scorer-list" data-side="home">${homeBatters.map((s) => renderHomeScorerLi(s, p, preset.minuteSuffix, preset.showScorerStat)).join('')}</ul>`
        : '';
    const awayList =
      awayDisplay.batters && awayBatters.length
        ? `<ul class="${p}__scorer-list" data-side="away">${awayBatters.map((s) => renderAwayScorerLi(s, p, preset.minuteSuffix, preset.showScorerStat)).join('')}</ul>`
        : '';
    scorers =
      `<div class="${p}__scorers-panel">` +
      `<p class="${p}__scorers-heading">${escapeScorecardHtml(scorersHeading)}</p>` +
      `<div class="${p}__scorers-row">${homeList}${awayList}</div></div>`;
  }

  let bowlers = '';
  if (
    preset.showBowlers &&
    ((homeDisplay.bowlers && teamHasBowlers(body.home)) || (awayDisplay.bowlers && teamHasBowlers(body.away)))
  ) {
    const homeList =
      homeDisplay.bowlers && homeBowlers.length
        ? `<ul class="${p}__scorer-list" data-side="home">${homeBowlers.map((b) => renderPlayerHomeLi(b, p)).join('')}</ul>`
        : '';
    const awayList =
      awayDisplay.bowlers && awayBowlers.length
        ? `<ul class="${p}__scorer-list" data-side="away">${awayBowlers.map((b) => renderPlayerAwayLi(b, p)).join('')}</ul>`
        : '';
    bowlers =
      `<div class="${p}__scorers-panel ${p}__scorers-panel--bowlers">` +
      `<p class="${p}__scorers-heading">${escapeScorecardHtml(bowlersHeading)}</p>` +
      `<div class="${p}__scorers-row">${homeList}${awayList}</div></div>`;
  }

  return scorers + bowlers;
}

export function buildScorecardLayoutHtml(
  body: ScorecardBody,
  classPrefix: 'lb' | 'm' = 'lb',
): { scoreline: string; players: string; meta: string } {
  const p = classPrefix === 'm' ? 'm-scorecard-card' : 'lb-scorecard-card';
  const preset = presetConfigForBody(body);
  const cricketLayout = usesCricketScoreLayout(body);
  const homeScore = body.home.score.trim() || '0';
  const awayScore = body.away.score.trim() || '0';
  const status = body.matchQuarters.trim();
  const currentOver = formatCurrentOverLabel(body.currentOver);
  const cricketClass = cricketLayout ? ` ${p}--cricket` : '';

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

  const scoreline =
    `<div class="${p}__scoreline">` +
    renderTeamColumn(body.home, 'home', 'Tuisspan', homeScore, cricketLayout, p) +
    centerHtml +
    renderTeamColumn(body.away, 'away', 'Wêreldspan', awayScore, cricketLayout, p) +
    `</div>`;

  const players = renderPlayersPanel(body, p, preset);

  const meta = body.matchInfo.trim()
    ? `<footer class="${p}__meta"><p>${escapeScorecardHtml(body.matchInfo)}</p></footer>`
    : '';

  return { scoreline, players, meta, cricketClass };
}
