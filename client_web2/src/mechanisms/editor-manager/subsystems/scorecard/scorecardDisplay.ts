import type { ScorecardBody, ScorecardTeam } from './scorecardTypes';

export type ScorecardBattingSide = 'home' | 'away';
export type ScorecardTeamSideDisplay = 'auto' | 'batters' | 'bowlers' | 'both' | 'none';

export interface ResolvedTeamDisplay {
  batters: boolean;
  bowlers: boolean;
}

/** Cricket uses per-team scores and split batter/bowler columns. */
export function usesCricketScoreLayout(body: ScorecardBody): boolean {
  return body.variant === 'cricket';
}

/** One combined player row (batters left / bowlers right) instead of two stacked panels. */
export function usesSplitInningsPanel(body: ScorecardBody): boolean {
  if (body.variant === 'cricket') return true;
  if (body.variant !== 'custom') return false;
  const home = resolveTeamDisplay('home', body);
  const away = resolveTeamDisplay('away', body);
  return (
    (home.batters && !home.bowlers && away.bowlers && !away.batters) ||
    (away.batters && !away.bowlers && home.bowlers && !home.batters)
  );
}

export function resolveTeamDisplay(side: 'home' | 'away', body: ScorecardBody): ResolvedTeamDisplay {
  const mode = side === 'home' ? body.homeSideDisplay : body.awaySideDisplay;

  if (mode === 'batters') return { batters: body.sections.primaryPlayers, bowlers: false };
  if (mode === 'bowlers') return { batters: false, bowlers: body.sections.secondaryPlayers };
  if (mode === 'both') {
    return { batters: body.sections.primaryPlayers, bowlers: body.sections.secondaryPlayers };
  }
  if (mode === 'none') return { batters: false, bowlers: false };

  // mode === 'auto'
  if (body.variant === 'cricket') {
    const batting = body.battingSide;
    if (side === batting) return { batters: body.sections.primaryPlayers, bowlers: false };
    return { batters: false, bowlers: body.sections.secondaryPlayers };
  }

  // Rugby / custom: respect section toggles; bowlers only when the section is enabled
  // and the team has data entered.
  const team = side === 'home' ? body.home : body.away;
  const secondary = body.sections.secondaryPlayers && teamHasBowlers(team);
  return { batters: body.sections.primaryPlayers, bowlers: secondary };
}

export function teamHasBatters(team: ScorecardTeam): boolean {
  return team.scorers.some((s) => s.name.trim() || s.minute.trim() || s.stat.trim());
}

export function teamHasBowlers(team: ScorecardTeam): boolean {
  return team.bowlers.some((b) => b.name.trim() || b.figures.trim());
}

export function formatCurrentOverLabel(currentOver: string): string {
  const raw = currentOver.trim();
  if (!raw) return '';
  if (/^over\b/i.test(raw)) return raw;
  return `Over ${raw}`;
}
