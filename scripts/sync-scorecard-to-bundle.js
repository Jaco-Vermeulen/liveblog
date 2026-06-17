const fs = require('fs');
const path = require('path');

const renderPath = 'c:/Work/Dev-rd/liveblog/server/liveblog/themes/themes_assets/default/js/theme/scorecard-render.js';
const distDir = 'c:/Work/Dev-rd/liveblog/server/liveblog/themes/themes_assets/default/dist';

const startMarker = 'function scEscapeHtml(value) {';
const endMarker = 'function hydrateScorecardPost(post) {';

// The built bundle name is content-hashed (e.g. default-<hash>.js), so discover
// the one that actually contains the scorecard render functions instead of
// hardcoding a hash that goes stale on every rebuild.
function findBundlePath() {
  const candidates = fs
    .readdirSync(distDir)
    .filter((name) => name.startsWith('default-') && name.endsWith('.js'))
    .map((name) => path.join(distDir, name));
  for (const candidate of candidates) {
    const contents = fs.readFileSync(candidate, 'utf8');
    if (contents.indexOf(startMarker) !== -1 && contents.indexOf(endMarker) !== -1) {
      return candidate;
    }
  }
  return null;
}

const bundlePath = findBundlePath();
if (!bundlePath) {
  console.error('Could not find a default-*.js bundle containing the scorecard functions in ' + distDir);
  process.exit(1);
}

const renderSrc = fs.readFileSync(renderPath, 'utf8');

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
