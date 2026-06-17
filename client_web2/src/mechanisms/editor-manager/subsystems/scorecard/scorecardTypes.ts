import type { ScorecardBattingSide, ScorecardTeamSideDisplay } from './scorecardDisplay';

export type ScorecardVariant = 'rugby' | 'cricket' | 'custom';

export type { ScorecardBattingSide, ScorecardTeamSideDisplay };

/** @deprecated Legacy toggle sections — migrated to customLists on read. */
export interface ScorecardSections {
  teamStats: boolean;
  primaryPlayers: boolean;
  secondaryPlayers: boolean;
}

export function defaultSectionsForVariant(variant: ScorecardVariant): ScorecardSections {
  if (variant === 'cricket') {
    return { teamStats: true, primaryPlayers: true, secondaryPlayers: true };
  }
  return { teamStats: false, primaryPlayers: true, secondaryPlayers: false };
}

export interface ScorecardListColumn {
  id: string;
  label: string;
}

export interface ScorecardListRow {
  values: Record<string, string>;
}

/** Where a user-defined list appears on the card. */
export type ScorecardListPlacement = 'panel' | 'team-inline' | 'full';

export interface ScorecardCustomList {
  id: string;
  heading: string;
  placement: ScorecardListPlacement;
  columns: ScorecardListColumn[];
  /** Used when placement is panel or team-inline (home side). */
  homeRows: ScorecardListRow[];
  /** Used when placement is panel or team-inline (away side). */
  awayRows: ScorecardListRow[];
  /** Used when placement is full — one list spanning the card width. */
  rows: ScorecardListRow[];
}

/** @deprecated Migrated into customLists. */
export interface ScorecardScorer {
  name: string;
  minute: string;
  stat: string;
}

/** @deprecated Migrated into customLists. */
export interface ScorecardPlayerRow {
  name: string;
  figures: string;
}

/** @deprecated Migrated into customLists. */
export interface ScorecardTeamExtra {
  label: string;
  value: string;
}

export interface ScorecardTeam {
  name: string;
  score: string;
  logoUrl: string;
  /** @deprecated */
  scorers: ScorecardScorer[];
  /** @deprecated */
  bowlers: ScorecardPlayerRow[];
  /** @deprecated */
  extras: ScorecardTeamExtra[];
}

export interface ScorecardBody {
  variant: ScorecardVariant;
  /** User-defined lists — the real template. Add as many as you want. */
  customLists: ScorecardCustomList[];
  /** @deprecated */
  sections: ScorecardSections;
  /** @deprecated */
  scorersLabel: string;
  /** @deprecated */
  bowlersLabel: string;
  /** @deprecated */
  scorerDetailLabel: string;
  battingSide: ScorecardBattingSide;
  currentOver: string;
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
    variant: 'custom',
    customLists: [],
    sections: defaultSectionsForVariant('custom'),
    scorersLabel: '',
    bowlersLabel: '',
    scorerDetailLabel: '',
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
