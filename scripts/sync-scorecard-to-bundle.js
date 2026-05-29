const fs = require('fs');

const renderPath = 'c:/Work/Dev-rd/liveblog/server/liveblog/themes/themes_assets/default/js/theme/scorecard-render.js';
const bundlePath = 'c:/Work/Dev-rd/liveblog/server/liveblog/themes/themes_assets/default/dist/default-0444b3fa5d.js';

const renderSrc = fs.readFileSync(renderPath, 'utf8');
const startMarker = 'function scEscapeHtml(value) {';
const endMarker = 'function hydrateScorecardPost(post) {';

const fnStart = renderSrc.indexOf(startMarker);
const fnEnd = renderSrc.indexOf(endMarker);
if (fnStart < 0 || fnEnd < 0) {
  console.error('Could not extract functions from scorecard-render.js');
  process.exit(1);
}
const fnBlock = renderSrc.slice(fnStart, fnEnd).trim() + '\n\n';

const bundle = fs.readFileSync(bundlePath, 'utf8');
const bStart = bundle.indexOf(startMarker);
const bEnd = bundle.indexOf(endMarker);
if (bStart < 0 || bEnd < 0) {
  console.error('Could not find scorecard functions in bundle');
  process.exit(1);
}

const updated = bundle.slice(0, bStart) + fnBlock + bundle.slice(bEnd);
fs.writeFileSync(bundlePath, updated, 'utf8');
console.log('Synced scorecard render functions to bundle');
