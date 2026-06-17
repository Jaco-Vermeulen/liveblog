import { describe, expect, it } from 'vitest';
import {
  freetypeDataToScorecardBody,
  isScorecardBodyEmpty,
  scorecardBodyToFreetypeData,
} from './scorecardFreetype';
import { applyScorecardVariant } from './scorecardPresets';
import { defaultScorecardBody } from './scorecardTypes';

describe('scorecardFreetype', () => {
  it('round-trips team data and custom lists', () => {
    const body = defaultScorecardBody();
    body.home.name = 'Springbokke';
    body.home.score = '2';
    body.away.name = 'All Blacks';
    body.away.score = '1';
    body.customLists = [
      {
        id: 'x',
        heading: 'Doelskoppe',
        placement: 'panel',
        columns: [
          { id: 'min', label: 'Min.' },
          { id: 'name', label: 'Speler' },
        ],
        homeRows: [{ values: { min: '67', name: 'Pollard' } }],
        awayRows: [{ values: { min: '', name: '' } }],
        rows: [],
      },
    ];

    const restored = freetypeDataToScorecardBody(scorecardBodyToFreetypeData(body));

    expect(restored.home.name).toBe('Springbokke');
    expect(restored.customLists[0].homeRows[0].values.name).toBe('Pollard');
    expect(restored.customLists[0].homeRows[0].values.min).toBe('67');
  });

  it('round-trips full-width lists with arbitrary columns', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'custom');
    body.customLists = [
      {
        id: 'f',
        heading: 'Skynsers',
        placement: 'full',
        columns: [
          { id: 'time', label: 'Tyd' },
          { id: 'a', label: 'Naam 1' },
          { id: 'b', label: 'Naam 2' },
        ],
        homeRows: [],
        awayRows: [],
        rows: [{ values: { time: '5', a: 'X', b: 'Y' } }],
      },
    ];

    const restored = freetypeDataToScorecardBody(scorecardBodyToFreetypeData(body));
    expect(restored.customLists[0].placement).toBe('full');
    expect(restored.customLists[0].rows[0].values.b).toBe('Y');
  });

  it('detects empty scorecard', () => {
    expect(isScorecardBodyEmpty(defaultScorecardBody())).toBe(true);
    const body = defaultScorecardBody();
    body.home.score = '1';
    expect(isScorecardBodyEmpty(body)).toBe(false);
  });
});
