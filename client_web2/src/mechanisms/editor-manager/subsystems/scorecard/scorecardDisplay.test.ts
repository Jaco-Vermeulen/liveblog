import { describe, expect, it } from 'vitest';
import { applyScorecardVariant } from './scorecardPresets';
import {
  formatCurrentOverLabel,
  resolveTeamDisplay,
  usesCricketScoreLayout,
  usesSplitInningsPanel,
} from './scorecardDisplay';
import { defaultScorecardBody } from './scorecardTypes';

describe('scorecardDisplay', () => {
  it('formats current over with prefix', () => {
    expect(formatCurrentOverLabel('32.4')).toBe('Over 32.4');
    expect(formatCurrentOverLabel('Over 12')).toBe('Over 12');
    expect(formatCurrentOverLabel('')).toBe('');
  });

  it('splits batters and bowlers by batting side for cricket', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    body.battingSide = 'home';

    expect(resolveTeamDisplay('home', body)).toEqual({ batters: true, bowlers: false });
    expect(resolveTeamDisplay('away', body)).toEqual({ batters: false, bowlers: true });
    expect(usesSplitInningsPanel(body)).toBe(true);
    expect(usesCricketScoreLayout(body)).toBe(true);

    body.battingSide = 'away';
    expect(resolveTeamDisplay('home', body)).toEqual({ batters: false, bowlers: true });
    expect(resolveTeamDisplay('away', body)).toEqual({ batters: true, bowlers: false });
  });

  it('shows bowlers for rugby only when the secondary section is enabled', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'rugby');

    expect(resolveTeamDisplay('home', body)).toEqual({ batters: true, bowlers: false });

    body.home.bowlers = [{ name: 'De Klerk', figures: '1 try saved' }];
    expect(resolveTeamDisplay('home', body)).toEqual({ batters: true, bowlers: false });

    body.sections.secondaryPlayers = true;
    expect(resolveTeamDisplay('home', body)).toEqual({ batters: true, bowlers: true });
  });

  it('respects manual side display overrides', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    body.homeSideDisplay = 'bowlers';
    body.awaySideDisplay = 'batters';

    expect(resolveTeamDisplay('home', body)).toEqual({ batters: false, bowlers: true });
    expect(resolveTeamDisplay('away', body)).toEqual({ batters: true, bowlers: false });
  });
});
