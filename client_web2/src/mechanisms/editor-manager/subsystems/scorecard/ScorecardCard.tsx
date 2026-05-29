import type { ReactNode } from 'react';
import { presetConfigForBody } from './scorecardPresets';
import {
  formatCurrentOverLabel,
  resolveTeamDisplay,
  usesCricketScoreLayout,
  usesSplitInningsPanel,
} from './scorecardDisplay';
import type { ScorecardBody, ScorecardPlayerRow, ScorecardScorer } from './scorecardTypes';

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

function formatDetail(scorer: ScorecardScorer, minuteSuffix: boolean): string {
  const d = scorer.minute.trim();
  if (!d) return '–';
  return minuteSuffix ? `${d}'` : d;
}

function HomeScorerRow({
  scorer,
  minuteSuffix,
  showStat,
}: {
  scorer: ScorecardScorer;
  minuteSuffix: boolean;
  showStat: boolean;
}) {
  return (
    <li>
      {showStat ? (
        <span className="m-scorecard-card__scorer-stat">{scorer.stat.trim() || '–'}</span>
      ) : null}
      <span className="m-scorecard-card__scorer-min">{formatDetail(scorer, minuteSuffix)}</span>
      <span className="m-scorecard-card__scorer-name">{scorer.name || '—'}</span>
    </li>
  );
}

function AwayScorerRow({
  scorer,
  minuteSuffix,
  showStat,
}: {
  scorer: ScorecardScorer;
  minuteSuffix: boolean;
  showStat: boolean;
}) {
  return (
    <li>
      <span className="m-scorecard-card__scorer-name">{scorer.name || '—'}</span>
      <span className="m-scorecard-card__scorer-min">{formatDetail(scorer, minuteSuffix)}</span>
      {showStat ? (
        <span className="m-scorecard-card__scorer-stat">{scorer.stat.trim() || '–'}</span>
      ) : null}
    </li>
  );
}

function HomePlayerRow({ row }: { row: ScorecardPlayerRow }) {
  return (
    <li>
      <span className="m-scorecard-card__scorer-min">{row.figures.trim() || '–'}</span>
      <span className="m-scorecard-card__scorer-name">{row.name || '—'}</span>
    </li>
  );
}

function AwayPlayerRow({ row }: { row: ScorecardPlayerRow }) {
  return (
    <li>
      <span className="m-scorecard-card__scorer-name">{row.name || '—'}</span>
      <span className="m-scorecard-card__scorer-min">{row.figures.trim() || '–'}</span>
    </li>
  );
}

function SidePlayerLists({
  side,
  body,
  preset,
}: {
  side: 'home' | 'away';
  body: ScorecardBody;
  preset: ReturnType<typeof presetConfigForBody>;
}) {
  const team = side === 'home' ? body.home : body.away;
  const display = resolveTeamDisplay(side, body);
  const batters = team.scorers.filter((s) => s.name.trim() || s.minute.trim() || s.stat.trim());
  const bowlers = team.bowlers.filter((b) => b.name.trim() || b.figures.trim());

  const lists: ReactNode[] = [];

  if (display.batters && batters.length) {
    lists.push(
      <ul key="batters" className="m-scorecard-card__scorer-list" data-side={side} data-role="batters">
        {batters.map((s, i) =>
          side === 'home' ? (
            <HomeScorerRow key={i} scorer={s} minuteSuffix={preset.minuteSuffix} showStat={preset.showScorerStat} />
          ) : (
            <AwayScorerRow key={i} scorer={s} minuteSuffix={preset.minuteSuffix} showStat={preset.showScorerStat} />
          ),
        )}
      </ul>,
    );
  }

  if (display.bowlers && bowlers.length) {
    lists.push(
      <ul key="bowlers" className="m-scorecard-card__scorer-list" data-side={side} data-role="bowlers">
        {bowlers.map((b, i) => (side === 'home' ? <HomePlayerRow key={i} row={b} /> : <AwayPlayerRow key={i} row={b} />))}
      </ul>,
    );
  }

  return lists.length ? <>{lists}</> : null;
}

function sideHeading(
  side: 'home' | 'away',
  body: ScorecardBody,
  preset: ReturnType<typeof presetConfigForBody>,
): string {
  const display = resolveTeamDisplay(side, body);
  const scorersHeading = body.scorersLabel.trim() || preset.scorersLabel;
  const bowlersHeading = body.bowlersLabel.trim() || preset.bowlersLabel;
  if (display.batters && !display.bowlers) return scorersHeading;
  if (display.bowlers && !display.batters) return bowlersHeading;
  return scorersHeading;
}

export function ScorecardCard({ body, preview = false }: ScorecardCardProps) {
  const preset = presetConfigForBody(body);
  const cricketLayout = usesCricketScoreLayout(body);
  const splitPanel = usesSplitInningsPanel(body);
  const homeName = displayName(body.home.name, preview, 'Tuisspan');
  const awayName = displayName(body.away.name, preview, 'Wêreldspan');
  const homeScore = displayScore(body.home.score, preview);
  const awayScore = displayScore(body.away.score, preview);
  const status = body.matchQuarters.trim();
  const currentOver = formatCurrentOverLabel(body.currentOver);
  const hasBg = Boolean(body.backgroundUrl.trim());
  const scorersHeading = body.scorersLabel.trim() || preset.scorersLabel;
  const bowlersHeading = body.bowlersLabel.trim() || preset.bowlersLabel;

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
      aria-label="Skoorbord"
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
          {body.home.extras.some((e) => e.label.trim() || e.value.trim()) ? (
            <ul className="m-scorecard-card__team-extras">
              {body.home.extras
                .filter((e) => e.label.trim() || e.value.trim())
                .map((e, i) => (
                  <li key={i}>
                    <span className="m-scorecard-card__extra-label">{e.label || '—'}</span>
                    <span className="m-scorecard-card__extra-value">{e.value || '—'}</span>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>

        <div className="m-scorecard-card__result" aria-label={`Telling ${homeScore} teen ${awayScore}`}>
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
          {body.away.extras.some((e) => e.label.trim() || e.value.trim()) ? (
            <ul className="m-scorecard-card__team-extras">
              {body.away.extras
                .filter((e) => e.label.trim() || e.value.trim())
                .map((e, i) => (
                  <li key={i}>
                    <span className="m-scorecard-card__extra-label">{e.label || '—'}</span>
                    <span className="m-scorecard-card__extra-value">{e.value || '—'}</span>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      </div>

      {(homeHasPlayers || awayHasPlayers) && splitPanel && (
        <div className="m-scorecard-card__scorers-panel m-scorecard-card__scorers-panel--split">
          <div className="m-scorecard-card__scorers-row">
            {homeHasPlayers ? (
              <div className="m-scorecard-card__scorers-side" data-side="home">
                <p className="m-scorecard-card__scorers-heading">{sideHeading('home', body, preset)}</p>
                <SidePlayerLists side="home" body={body} preset={preset} />
              </div>
            ) : null}
            {awayHasPlayers ? (
              <div className="m-scorecard-card__scorers-side" data-side="away">
                <p className="m-scorecard-card__scorers-heading">{sideHeading('away', body, preset)}</p>
                <SidePlayerLists side="away" body={body} preset={preset} />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {(homeHasPlayers || awayHasPlayers) && !splitPanel && (
        <>
          {((homeDisplay.batters && homeBatters.length > 0) || (awayDisplay.batters && awayBatters.length > 0)) && (
            <div className="m-scorecard-card__scorers-panel">
              <p className="m-scorecard-card__scorers-heading">{scorersHeading}</p>
              <div className="m-scorecard-card__scorers-row">
                {homeDisplay.batters && homeBatters.length > 0 ? (
                  <ul className="m-scorecard-card__scorer-list" data-side="home">
                    {homeBatters.map((s, i) => (
                      <HomeScorerRow
                        key={`h-${i}`}
                        scorer={s}
                        minuteSuffix={preset.minuteSuffix}
                        showStat={preset.showScorerStat}
                      />
                    ))}
                  </ul>
                ) : null}
                {awayDisplay.batters && awayBatters.length > 0 ? (
                  <ul className="m-scorecard-card__scorer-list" data-side="away">
                    {awayBatters.map((s, i) => (
                      <AwayScorerRow
                        key={`a-${i}`}
                        scorer={s}
                        minuteSuffix={preset.minuteSuffix}
                        showStat={preset.showScorerStat}
                      />
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          )}

          {preset.showBowlers &&
            ((homeDisplay.bowlers && homeBowlers.length > 0) || (awayDisplay.bowlers && awayBowlers.length > 0)) && (
              <div className="m-scorecard-card__scorers-panel m-scorecard-card__scorers-panel--bowlers">
                <p className="m-scorecard-card__scorers-heading">{bowlersHeading}</p>
                <div className="m-scorecard-card__scorers-row">
                  {homeDisplay.bowlers && homeBowlers.length > 0 ? (
                    <ul className="m-scorecard-card__scorer-list" data-side="home">
                      {homeBowlers.map((b, i) => (
                        <HomePlayerRow key={`hb-${i}`} row={b} />
                      ))}
                    </ul>
                  ) : null}
                  {awayDisplay.bowlers && awayBowlers.length > 0 ? (
                    <ul className="m-scorecard-card__scorer-list" data-side="away">
                      {awayBowlers.map((b, i) => (
                        <AwayPlayerRow key={`ab-${i}`} row={b} />
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            )}
        </>
      )}

      {body.matchInfo.trim() ? (
        <footer className="m-scorecard-card__meta">
          <p>{body.matchInfo}</p>
        </footer>
      ) : null}
    </div>
  );
}
