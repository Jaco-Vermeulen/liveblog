import { AF } from '@/copy';
import type { ScorecardBody, ScorecardVariant } from './scorecardTypes';

const P = AF.editor.scorecard.presets;

export interface ScorecardPresetConfig {
  label: string;
  scorersLabel: string;
  bowlersLabel: string;
  scorerDetailLabel: string;
  showBowlers: boolean;
  showScorerStat: boolean;
  showTeamExtras: boolean;
  minuteSuffix: boolean;
  scoreNumericOnly: boolean;
}

export const SCORECARD_PRESETS: Record<ScorecardVariant, ScorecardPresetConfig> = {
  rugby: {
    label: P.rugby,
    scorersLabel: P.goalScorers,
    bowlersLabel: P.bowlers,
    scorerDetailLabel: P.minute,
    showBowlers: false,
    showScorerStat: false,
    showTeamExtras: false,
    minuteSuffix: true,
    scoreNumericOnly: true,
  },
  cricket: {
    label: P.cricket,
    scorersLabel: P.batters,
    bowlersLabel: P.bowlers,
    scorerDetailLabel: P.overs,
    showBowlers: true,
    showScorerStat: true,
    showTeamExtras: true,
    minuteSuffix: false,
    scoreNumericOnly: false,
  },
  custom: {
    label: P.custom,
    scorersLabel: P.players,
    bowlersLabel: P.bowlers,
    scorerDetailLabel: P.stat,
    showBowlers: true,
    showScorerStat: true,
    showTeamExtras: true,
    minuteSuffix: false,
    scoreNumericOnly: false,
  },
};

export function scorecardPresetFor(variant: ScorecardVariant): ScorecardPresetConfig {
  return SCORECARD_PRESETS[variant] ?? SCORECARD_PRESETS.rugby;
}

/** Apply preset labels when switching variant (keeps team data). */
export function applyScorecardVariant(body: ScorecardBody, variant: ScorecardVariant): ScorecardBody {
  const preset = scorecardPresetFor(variant);
  return {
    ...body,
    variant,
    scorersLabel: preset.scorersLabel,
    bowlersLabel: preset.bowlersLabel,
    scorerDetailLabel: preset.scorerDetailLabel,
    homeSideDisplay: variant === 'rugby' ? 'auto' : body.homeSideDisplay,
    awaySideDisplay: variant === 'rugby' ? 'auto' : body.awaySideDisplay,
  };
}

export function presetConfigForBody(body: ScorecardBody): ScorecardPresetConfig {
  const preset = scorecardPresetFor(body.variant);
  if (body.variant === 'custom') {
    return {
      ...preset,
      showBowlers: true,
      showScorerStat: true,
      showTeamExtras: true,
    };
  }
  return preset;
}
