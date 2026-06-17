/**
 * Standalone assertions for the published scorecard renderer.
 * Run with: `node scripts/scorecard-render.test.js`.
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

check('renders custom list with arbitrary columns', () => {
  const html = buildScorecardHtmlFromMeta({
    home: { name: 'Bulls', score: '24' },
    away: { name: 'Sharks', score: '17' },
    match: {
      variant: 'custom',
      lists: [
        {
          id: 'goals',
          heading: 'Doelpunten',
          placement: 'panel',
          columns: [
            { id: 'time', label: 'Min.' },
            { id: 'name', label: 'Speler' },
          ],
          home_rows: [{ values: { time: '40', name: 'Pollard' } }],
          away_rows: [],
        },
      ],
    },
  });
  assert.ok(html.indexOf('Doelpunten') !== -1);
  assert.ok(html.indexOf('Pollard') !== -1);
});

check('renders full-width list with three columns', () => {
  const html = buildScorecardHtmlFromMeta({
    home: { name: 'A', score: '1' },
    away: { name: 'B', score: '2' },
    match: {
      variant: 'custom',
      lists: [
        {
          id: 'full',
          heading: 'My lys',
          placement: 'full',
          columns: [
            { id: 'time', label: 'Tyd' },
            { id: 'n1', label: 'Naam 1' },
            { id: 'n2', label: 'Naam 2' },
          ],
          rows: [{ values: { time: '9', n1: 'Foo', n2: 'Bar' } }],
        },
      ],
    },
  });
  assert.ok(html.indexOf('data-scope="full"') !== -1);
  assert.ok(html.indexOf('Foo') !== -1);
  assert.ok(html.indexOf('Bar') !== -1);
});

check('cricket still shows per-team scores', () => {
  const html = buildScorecardHtmlFromMeta({
    home: { name: 'Proteas', score: '245/8' },
    away: { name: 'India', score: '198/6' },
    match: { variant: 'cricket', current_over: '32.4' },
  });
  assert.ok(html.indexOf('lb-scorecard-card--cricket') !== -1);
  assert.ok(html.indexOf('245/8') !== -1);
});

console.log('\n' + passed + ' checks passed.');
