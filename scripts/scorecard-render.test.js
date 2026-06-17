/**
 * Standalone assertions for the published scorecard renderer
 * (server/.../theme/scorecard-render.js). Run with: `node scripts/scorecard-render.test.js`.
 *
 * Verifies the "templates, not modes" behaviour end-to-end on the published side:
 * a rugby card can still render bowlers / a stat column, and custom falls back
 * to neutral headings when its labels are left blank.
 */
const assert = require('assert');
const { buildScorecardHtmlFromMeta } = require('../server/liveblog/themes/themes_assets/default/js/theme/scorecard-render.js');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('  ok - ' + name);
}

console.log('scorecard-render (published)');

check('rugby with secondary section enabled renders bowlers + stat column', () => {
  const html = buildScorecardHtmlFromMeta({
    home: {
      name: 'Bulls',
      score: '24',
      scorers: [{ name: 'Pollard', time: '40', stat: '3' }],
      bowlers: [{ name: 'Smith', figures: 'MOTM' }],
    },
    away: { name: 'Sharks', score: '17' },
    match: {
      variant: 'rugby',
      sections: { secondary_players: true },
    },
  });
  assert.ok(html.indexOf('lb-scorecard-card__scorer-stat">3</span>') !== -1, 'stat column should render');
  assert.ok(html.indexOf('scorers-panel--bowlers') !== -1, 'bowlers panel should render for rugby');
  assert.ok(html.indexOf('Smith') !== -1, 'bowler name should appear');
});

check('plain rugby (no bowlers) stays clean with minute suffix and no stat column', () => {
  const html = buildScorecardHtmlFromMeta({
    home: { name: 'Bulls', score: '24', scorers: [{ name: 'Pollard', time: '40' }] },
    away: { name: 'Sharks', score: '17' },
    match: { variant: 'rugby' },
  });
  assert.ok(html.indexOf(">40'</span>") !== -1, 'minute suffix should render');
  assert.ok(html.indexOf('lb-scorecard-card__scorer-stat') === -1, 'no stat column when no stats');
  assert.ok(html.indexOf('scorers-panel--bowlers') === -1, 'no bowlers panel when no bowlers');
});

check('custom with blank labels falls back to neutral headings', () => {
  const html = buildScorecardHtmlFromMeta({
    home: { name: 'A', score: '1', scorers: [{ name: 'Player', stat: '9' }] },
    away: { name: 'B', score: '2' },
    match: { variant: 'custom', scorers_label: '', bowlers_label: '' },
  });
  assert.ok(html.indexOf('Spelers') !== -1, 'blank custom scorers heading falls back to "Spelers"');
});

check('cricket still splits innings and shows per-team scores', () => {
  const html = buildScorecardHtmlFromMeta({
    home: { name: 'Proteas', score: '245/8', scorers: [{ name: 'Markram', time: '48.2', stat: '102' }] },
    away: { name: 'India', score: '198/6', bowlers: [{ name: 'Bumrah', figures: '3/52' }] },
    match: { variant: 'cricket', current_over: '32.4', batting_side: 'home' },
  });
  assert.ok(html.indexOf('lb-scorecard-card--cricket') !== -1, 'cricket class');
  assert.ok(html.indexOf('lb-scorecard-card__team-score">245/8</span>') !== -1, 'home team score');
  assert.ok(html.indexOf('scorers-panel--split') !== -1, 'split innings panel');
  assert.ok(html.indexOf('Bumrah') !== -1, 'bowler appears');
  assert.ok(html.indexOf("48.2'") === -1, 'no minute suffix for cricket');
});

console.log('\n' + passed + ' checks passed.');
