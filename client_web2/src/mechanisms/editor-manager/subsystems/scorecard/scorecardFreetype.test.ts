import { describe, expect, it } from 'vitest';
import {
  freetypeDataToScorecardBody,
  isScorecardBodyEmpty,
  scorecardBodyToFreetypeData,
} from './scorecardFreetype';
import { applyScorecardVariant } from './scorecardPresets';
import { defaultScorecardBody } from './scorecardTypes';

describe('scorecardFreetype', () => {
  it('round-trips team data through freetype paths', () => {
    const body = defaultScorecardBody();
    body.home.name = 'Springbokke';
    body.home.score = '2';
    body.away.name = 'All Blacks';
    body.away.score = '1';
    body.home.scorers = [{ name: 'Pollard', minute: '67', stat: '' }];

    const data = scorecardBodyToFreetypeData(body);
    const restored = freetypeDataToScorecardBody(data);

    expect(restored.home.name).toBe('Springbokke');
    expect(restored.home.score).toBe('2');
    expect(restored.away.name).toBe('All Blacks');
    expect(restored.home.scorers[0].name).toBe('Pollard');
    expect(restored.home.scorers[0].minute).toBe('67');
  });

  it('round-trips cricket labels, innings control, and bowlers', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    body.scorersLabel = 'Batting';
    body.bowlersLabel = 'Bowling';
    body.currentOver = '18.3';
    body.battingSide = 'away';
    body.homeSideDisplay = 'bowlers';
    body.awaySideDisplay = 'batters';
    body.home.bowlers = [{ name: 'Starc', figures: '3/40' }];
    body.home.extras = [{ label: 'RR', value: '5.2' }];

    const restored = freetypeDataToScorecardBody(scorecardBodyToFreetypeData(body));

    expect(restored.variant).toBe('cricket');
    expect(restored.scorersLabel).toBe('Batting');
    expect(restored.bowlersLabel).toBe('Bowling');
    expect(restored.currentOver).toBe('18.3');
    expect(restored.battingSide).toBe('away');
    expect(restored.homeSideDisplay).toBe('bowlers');
    expect(restored.awaySideDisplay).toBe('batters');
    expect(restored.home.bowlers[0].name).toBe('Starc');
    expect(restored.home.extras[0].value).toBe('5.2');
    expect(restored.sections).toEqual({
      teamStats: true,
      primaryPlayers: true,
      secondaryPlayers: true,
    });
  });

  it('detects empty scorecard', () => {
    expect(isScorecardBodyEmpty(defaultScorecardBody())).toBe(true);
    const body = defaultScorecardBody();
    body.home.score = '1';
    expect(isScorecardBodyEmpty(body)).toBe(false);
  });
});
