import { AF } from '@/copy';
import type { ScorecardBody, ScorecardVariant } from './scorecardTypes';
import { defaultSectionsForVariant } from './scorecardTypes';
import { starterListsForVariant, syncListColumnIds } from './scorecardCustomLists';

const P = AF.editor.scorecard.presets;

export interface ScorecardPresetConfig {
  label: string;
  scorersLabel: string;
  bowlersLabel: string;
  scorerDetailLabel: string;
  /** Append a minute apostrophe to the detail column (rugby-style formatting hint). */
  minuteSuffix: boolean;
  /** Hint the score input as a plain number (rugby-style). Never enforced. */
  scoreNumericOnly: boolean;
}

/**
 * Templates, NOT modes. Picking one only pre-fills sensible default labels and
 * formatting hints. Every field stays fully editable afterwards and the user can
 * always add scorers, bowlers, team stats, etc. regardless of the chosen template.
 * `custom` intentionally starts blank so the editor can be filled from scratch.
 */
export const SCORECARD_PRESETS: Record<ScorecardVariant, ScorecardPresetConfig> = {
  rugby: {
    label: P.rugby,
    scorersLabel: P.goalScorers,
    bowlersLabel: P.secondaryPlayers,
    scorerDetailLabel: P.minute,
    minuteSuffix: true,
    scoreNumericOnly: true,
  },
  cricket: {
    label: P.cricket,
    scorersLabel: P.batters,
    bowlersLabel: P.bowlers,
    scorerDetailLabel: P.overs,
    minuteSuffix: false,
    scoreNumericOnly: false,
  },
  custom: {
    label: P.custom,
    scorersLabel: P.players,
    bowlersLabel: P.secondaryPlayers,
    scorerDetailLabel: P.stat,
    minuteSuffix: false,
    scoreNumericOnly: false,
  },
};

export function scorecardPresetFor(variant: ScorecardVariant): ScorecardPresetConfig {
  return SCORECARD_PRESETS[variant] ?? SCORECARD_PRESETS.rugby;
}

/**
 * Apply a template's default labels when switching variant. Team data and display
 * choices are always preserved. `custom` clears the labels so the editor starts
 * blank (the preset labels remain only as placeholders / render fallbacks).
 */
export function applyScorecardVariant(body: ScorecardBody, variant: ScorecardVariant): ScorecardBody {
  const preset = scorecardPresetFor(variant);
  const blank = variant === 'custom';
  return {
    ...body,
    variant,
    customLists: starterListsForVariant(variant).map(syncListColumnIds),
    sections: defaultSectionsForVariant(variant),
    scorersLabel: blank ? '' : preset.scorersLabel,
    bowlersLabel: blank ? '' : preset.bowlersLabel,
    scorerDetailLabel: blank ? '' : preset.scorerDetailLabel,
  };
}

export function presetConfigForBody(body: ScorecardBody): ScorecardPresetConfig {
  return scorecardPresetFor(body.variant);
}
