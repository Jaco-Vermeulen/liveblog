import { formatCurrentOverLabel, usesCricketScoreLayout } from './scorecardDisplay';
import { ensureCustomLists, listsForPlacement } from './scorecardCustomLists';
import { renderInlineListHtml, renderPanelListHtml } from './scorecardCustomListRender';
import { AF } from '@/copy';
import type { ScorecardBody } from './scorecardTypes';

const SC = AF.editor.scorecard;

export interface ScorecardCardProps {
  body: ScorecardBody;
  preview?: boolean;
}

function displayScore(score: string, preview: boolean): string {
  const s = score.trim();
  if (s) return s;
  return preview ? '–' : '0';
}

function displayName(name: string, preview: boolean, fallback: string): string {
  const n = name.trim();
  if (n) return n;
  return preview ? fallback : '';
}

export function ScorecardCard({ body, preview = false }: ScorecardCardProps) {
  const cricketLayout = usesCricketScoreLayout(body);
  const homeName = displayName(body.home.name, preview, SC.homeTeam);
  const awayName = displayName(body.away.name, preview, SC.awayTeam);
  const homeScore = displayScore(body.home.score, preview);
  const awayScore = displayScore(body.away.score, preview);
  const status = body.matchQuarters.trim();
  const currentOver = formatCurrentOverLabel(body.currentOver);
  const hasBg = Boolean(body.backgroundUrl.trim());
  const lists = ensureCustomLists(body);
  const inlineLists = listsForPlacement(lists, 'team-inline');
  const panelLists = lists.filter((list) => list.placement === 'panel' || list.placement === 'full');
  const p = 'm-scorecard-card';

  const cardClass = [
    'm-scorecard-card',
    hasBg ? 'm-scorecard-card--has-bg' : '',
    cricketLayout ? 'm-scorecard-card--cricket' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      style={hasBg ? { backgroundImage: `url(${body.backgroundUrl})` } : undefined}
      aria-label={SC.ariaLabel}
    >
      <div className="m-scorecard-card__overlay" />

      <div className="m-scorecard-card__scoreline">
        <div className="m-scorecard-card__team m-scorecard-card__team--home">
          {body.home.logoUrl ? (
            <img src={body.home.logoUrl} alt="" className="m-scorecard-card__logo" />
          ) : (
            <div className="m-scorecard-card__logo m-scorecard-card__logo--placeholder" aria-hidden />
          )}
          <span className="m-scorecard-card__team-name">{homeName}</span>
          {cricketLayout ? <span className="m-scorecard-card__team-score">{homeScore}</span> : null}
          {inlineLists.map((list) => (
            <div key={list.id} dangerouslySetInnerHTML={{ __html: renderInlineListHtml(list, 'home', p) }} />
          ))}
        </div>

        <div className="m-scorecard-card__result" aria-label={SC.scoreAria(homeScore, awayScore)}>
          {!cricketLayout ? (
            <div className="m-scorecard-card__result-scores">
              <span className="m-scorecard-card__score">{homeScore}</span>
              <span className="m-scorecard-card__score-sep">-</span>
              <span className="m-scorecard-card__score">{awayScore}</span>
            </div>
          ) : null}
          {(currentOver || status) && (
            <div className="m-scorecard-card__result-meta">
              {currentOver ? <span className="m-scorecard-card__current-over">{currentOver}</span> : null}
              {status ? <span className="m-scorecard-card__result-status">{status}</span> : null}
            </div>
          )}
        </div>

        <div className="m-scorecard-card__team m-scorecard-card__team--away">
          {body.away.logoUrl ? (
            <img src={body.away.logoUrl} alt="" className="m-scorecard-card__logo" />
          ) : (
            <div className="m-scorecard-card__logo m-scorecard-card__logo--placeholder" aria-hidden />
          )}
          <span className="m-scorecard-card__team-name">{awayName}</span>
          {cricketLayout ? <span className="m-scorecard-card__team-score">{awayScore}</span> : null}
          {inlineLists.map((list) => (
            <div key={list.id} dangerouslySetInnerHTML={{ __html: renderInlineListHtml(list, 'away', p) }} />
          ))}
        </div>
      </div>

      {panelLists.map((list) => (
        <div key={list.id} dangerouslySetInnerHTML={{ __html: renderPanelListHtml(list, p) }} />
      ))}

      {body.matchInfo.trim() ? (
        <footer className="m-scorecard-card__meta">
          <p>{body.matchInfo}</p>
        </footer>
      ) : null}
    </div>
  );
}
