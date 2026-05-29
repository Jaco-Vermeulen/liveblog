import type { ScorecardBody, ScorecardVariant } from './scorecardTypes';

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
    label: 'Rugby',
    scorersLabel: 'Doelskoppe',
    bowlersLabel: 'Boulers',
    scorerDetailLabel: 'Min',
    showBowlers: false,
    showScorerStat: false,
    showTeamExtras: false,
    minuteSuffix: true,
    scoreNumericOnly: true,
  },
  cricket: {
    label: 'Krieket',
    scorersLabel: 'Kolwers',
    bowlersLabel: 'Boulers',
    scorerDetailLabel: "O's",
    showBowlers: true,
    showScorerStat: true,
    showTeamExtras: true,
    minuteSuffix: false,
    scoreNumericOnly: false,
  },
  custom: {
    label: 'Pasgemaak',
    scorersLabel: 'Spelers',
    bowlersLabel: 'Boulers',
    scorerDetailLabel: 'Stat',
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
