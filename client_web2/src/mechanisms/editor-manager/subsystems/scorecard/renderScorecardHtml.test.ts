import { describe, expect, it } from 'vitest';
import { renderScorecardHtml } from './renderScorecardHtml';
import { applyScorecardVariant } from './scorecardPresets';
import { defaultScorecardBody } from './scorecardTypes';

describe('renderScorecardHtml', () => {
  it('renders rugby layout with custom scorers heading', () => {
    const body = defaultScorecardBody();
    body.home.name = 'bok1';
    body.home.score = '25';
    body.home.scorers = [{ name: 'Jan Koos', minute: '2', stat: '' }];
    body.away.name = 'bok2';
    body.away.score = '50';
    body.scorersLabel = 'Doelpunten';

    const html = renderScorecardHtml(body);

    expect(html).toContain('Doelpunten');
    expect(html).toContain(">2'</span>");
    expect(html).not.toContain('lb-scorecard-card__scorer-stat');
    expect(html).not.toContain('scorers-panel--bowlers');
  });

  it('renders cricket with split innings, current over, and team scores', () => {
    const body = applyScorecardVariant(defaultScorecardBody(), 'cricket');
    body.home.name = 'Proteas';
    body.home.score = '245/8';
    body.home.scorers = [{ name: 'Markram', minute: '48.2', stat: '102' }];
    body.away.name = 'India';
    body.away.score = '198/6';
    body.away.bowlers = [{ name: 'Bumrah', figures: '3/52' }];
    body.currentOver = '32.4';
    body.battingSide = 'home';
    body.matchQuarters = '2de beurt';

    const html = renderScorecardHtml(body);

    expect(html).toContain('lb-scorecard-card--cricket');
    expect(html).toContain('lb-scorecard-card__team-score">245/8</span>');
    expect(html).toContain('lb-scorecard-card__team-score">198/6</span>');
    expect(html).toContain('lb-scorecard-card__current-over">Over 32.4</span>');
    expect(html).toContain('scorers-panel--split');
    expect(html).toContain('Markram');
    expect(html).toContain('Bumrah');
    expect(html).toContain('3/52');
    expect(html).toContain('lb-scorecard-card__scorer-stat">102</span>');
    expect(html).not.toContain('scorers-panel--bowlers');
    expect(html).not.toContain("48.2'");
    expect(html).not.toContain('lb-scorecard-card__score-sep');
  });
});
