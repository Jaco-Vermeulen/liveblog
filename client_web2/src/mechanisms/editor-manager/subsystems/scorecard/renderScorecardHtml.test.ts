import { describe, expect, it } from 'vitest';
import { renderScorecardHtml } from './renderScorecardHtml';
import { applyScorecardVariant } from './scorecardPresets';
import { emptyListRow } from './scorecardCustomLists';
import { defaultScorecardBody } from './scorecardTypes';

describe('renderScorecardHtml', () => {
  it('renders a custom list with arbitrary columns', () => {
    const body = defaultScorecardBody();
    body.home.name = 'bok1';
    body.home.score = '25';
    body.away.name = 'bok2';
    body.away.score = '50';
    body.customLists = [
      {
        id: 'goals',
        heading: 'Doelpunten',
        placement: 'panel',
        columns: [
          { id: 'time', label: 'Min.' },
          { id: 'name', label: 'Speler' },
        ],
        homeRows: [{ values: { time: '2', name: 'Jan Koos' } }],
        awayRows: [emptyListRow([{ id: 'time', label: '' }, { id: 'name', label: '' }])],
        rows: [],
      },
    ];

    const html = renderScorecardHtml(body);

    expect(html).toContain('Doelpunten');
    expect(html).toContain('Jan Koos');
    expect(html).toContain('>2</span>');
  });

  it('renders a full-width list with any number of columns', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'custom');
    const columns = [
      { id: 'time', label: 'Tyd' },
      { id: 'n1', label: 'Naam 1' },
      { id: 'n2', label: 'Naam 2' },
    ];
    body.customLists = [
      {
        id: 'custom',
        heading: 'My lys',
        placement: 'full',
        columns,
        homeRows: [],
        awayRows: [],
        rows: [{ values: { time: '12', n1: 'A', n2: 'B' } }],
      },
    ];

    const html = renderScorecardHtml(body);

    expect(html).toContain('My lys');
    expect(html).toContain('data-scope="full"');
    expect(html).toContain('>A</span>');
    expect(html).toContain('>B</span>');
  });

  it('renders cricket scoreline with per-team scores', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    body.home.name = 'Proteas';
    body.home.score = '245/8';
    body.away.name = 'India';
    body.away.score = '198/6';
    body.currentOver = '32.4';
    body.matchQuarters = '2de beurt';

    const html = renderScorecardHtml(body);

    expect(html).toContain('lb-scorecard-card--cricket');
    expect(html).toContain('lb-scorecard-card__team-score">245/8</span>');
    expect(html).toContain('lb-scorecard-card__team-score">198/6</span>');
    expect(html).toContain('lb-scorecard-card__current-over">Over 32.4</span>');
  });
});
