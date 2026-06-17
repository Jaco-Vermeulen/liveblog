import { describe, expect, it } from 'vitest';
import { applyScorecardVariant, SCORECARD_PRESETS } from './scorecardPresets';
import { defaultScorecardBody } from './scorecardTypes';

describe('scorecardPresets (templates, not modes)', () => {
  it('applies rugby starter lists but keeps team data', () => {
    const base = defaultScorecardBody();
    base.home.name = 'Bulls';
    base.away.name = 'Sharks';

    const body = applyScorecardVariant(base, 'rugby');

    expect(body.variant).toBe('rugby');
    expect(body.customLists.length).toBeGreaterThan(0);
    expect(body.customLists[0].heading).toBe('Doelskoppe');
    expect(body.home.name).toBe('Bulls');
    expect(body.away.name).toBe('Sharks');
  });

  it('leaves custom blank so the editor starts empty', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'custom');

    expect(body.variant).toBe('custom');
    expect(body.customLists).toEqual([]);
    expect(body.scorersLabel).toBe('');
  });

  it('applies cricket starter lists with multiple sections', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    expect(body.customLists.length).toBe(3);
    expect(body.scorersLabel).toBe(SCORECARD_PRESETS.cricket.scorersLabel);
  });
});
