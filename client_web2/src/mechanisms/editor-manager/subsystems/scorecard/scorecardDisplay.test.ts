import { describe, expect, it } from 'vitest';
import { formatCurrentOverLabel, usesCricketScoreLayout } from './scorecardDisplay';
import { applyScorecardVariant } from './scorecardPresets';
import { defaultScorecardBody } from './scorecardTypes';

describe('scorecardDisplay', () => {
  it('formats current over with prefix', () => {
    expect(formatCurrentOverLabel('32.4')).toBe('Over 32.4');
    expect(formatCurrentOverLabel('Over 12')).toBe('Over 12');
    expect(formatCurrentOverLabel('')).toBe('');
  });

  it('detects cricket score layout from variant', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    expect(usesCricketScoreLayout(body)).toBe(true);
    body.variant = 'rugby';
    expect(usesCricketScoreLayout(body)).toBe(false);
  });
});
