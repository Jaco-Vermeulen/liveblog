import { describe, expect, it } from 'vitest';
import { applyScorecardVariant, SCORECARD_PRESETS } from './scorecardPresets';
import { defaultScorecardBody } from './scorecardTypes';

describe('scorecardPresets (templates, not modes)', () => {
  it('applies rugby template labels but keeps team data', () => {
    const base = defaultScorecardBody();
    base.home.name = 'Bulls';
    base.away.name = 'Sharks';
    base.home.scorers = [{ name: 'Pollard', minute: '40', stat: '' }];

    const body = applyScorecardVariant(base, 'rugby');

    expect(body.variant).toBe('rugby');
    expect(body.scorersLabel).toBe(SCORECARD_PRESETS.rugby.scorersLabel);
    // Team data is never wiped when switching template.
    expect(body.home.name).toBe('Bulls');
    expect(body.away.name).toBe('Sharks');
    expect(body.home.scorers[0].name).toBe('Pollard');
  });

  it('leaves custom blank so the editor starts empty', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'custom');

    expect(body.variant).toBe('custom');
    expect(body.scorersLabel).toBe('');
    expect(body.bowlersLabel).toBe('');
    expect(body.scorerDetailLabel).toBe('');
  });

  it('switching template only swaps labels, not entered data', () => {
    let body = applyScorecardVariant(defaultScorecardBody(), 'rugby');
    body.home.bowlers = [{ name: 'Smith', figures: '2/30' }];
    body.home.score = '24';

    body = applyScorecardVariant(body, 'cricket');
    expect(body.scorersLabel).toBe(SCORECARD_PRESETS.cricket.scorersLabel);
    expect(body.home.bowlers[0].name).toBe('Smith');
    expect(body.home.score).toBe('24');
  });
});
