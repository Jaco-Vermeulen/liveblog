import type { ScorecardBattingSide, ScorecardTeamSideDisplay } from './scorecardDisplay';

export type ScorecardVariant = 'rugby' | 'cricket' | 'custom';

export type { ScorecardBattingSide, ScorecardTeamSideDisplay };

export interface ScorecardScorer {
  name: string;
  /** Minute (rugby) or overs/ball (cricket) when used as detail column */
  minute: string;
  /** Optional second column e.g. runs (cricket) */
  stat: string;
}

export interface ScorecardPlayerRow {
  name: string;
  /** Bowling figures, wickets, etc. */
  figures: string;
}

export interface ScorecardTeamExtra {
  label: string;
  value: string;
}

export interface ScorecardTeam {
  name: string;
  score: string;
  logoUrl: string;
  scorers: ScorecardScorer[];
  bowlers: ScorecardPlayerRow[];
  extras: ScorecardTeamExtra[];
}

export interface ScorecardBody {
  variant: ScorecardVariant;
  scorersLabel: string;
  bowlersLabel: string;
  scorerDetailLabel: string;
  /** Which team is currently batting (cricket innings split). */
  battingSide: ScorecardBattingSide;
  /** Live over e.g. "32.4" — shown prominently for cricket. */
  currentOver: string;
  /** What to show on the card for each side (auto follows battingSide for cricket). */
  homeSideDisplay: ScorecardTeamSideDisplay;
  awaySideDisplay: ScorecardTeamSideDisplay;
  home: ScorecardTeam;
  away: ScorecardTeam;
  matchQuarters: string;
  matchInfo: string;
  backgroundUrl: string;
}

export function emptyScorers(): ScorecardScorer[] {
  return [{ name: '', minute: '', stat: '' }];
}

export function emptyBowlers(): ScorecardPlayerRow[] {
  return [{ name: '', figures: '' }];
}

export function emptyExtras(): ScorecardTeamExtra[] {
  return [];
}

export function emptyTeam(): ScorecardTeam {
  return {
    name: '',
    score: '',
    logoUrl: '',
    scorers: emptyScorers(),
    bowlers: emptyBowlers(),
    extras: emptyExtras(),
  };
}

export function defaultScorecardBody(): ScorecardBody {
  return {
    variant: 'rugby',
    scorersLabel: 'Doelskoppe',
    bowlersLabel: 'Boulers',
    scorerDetailLabel: 'Min',
    battingSide: 'home',
    currentOver: '',
    homeSideDisplay: 'auto',
    awaySideDisplay: 'auto',
    home: emptyTeam(),
    away: emptyTeam(),
    matchQuarters: '',
    matchInfo: '',
    backgroundUrl: '',
  };
}
