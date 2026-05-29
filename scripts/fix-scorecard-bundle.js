const fs = require('fs');

const path = 'c:/Work/Dev-rd/liveblog/server/liveblog/themes/themes_assets/default/dist/default-0444b3fa5d.js';
const lines = fs.readFileSync(path, 'utf8').split(/\n/);

const headAfterComment = lines.slice(2002, 2071);

const scorecardBranch = [
  'if(runtime.memberLookup((runtime.memberLookup((t_33),"item")),"item_type") == "Scorecard") {',
  'output += "\\r\\n              ";',
  'output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.memberLookup((runtime.memberLookup((t_33),"item")),"text")), env.opts.autoescape);',
  'output += "\\r\\n            ";',
  ';',
  '}',
];

const merged = [
  headAfterComment[0],
  headAfterComment[1],
  ...scorecardBranch,
  'else {',
  ...headAfterComment.slice(2),
];

// Scorecard if/else adds one nesting level — need one extra close in the cascade after </article>
let foundArticle = false;
let closeCount = 0;
for (let i = 0; i < merged.length; i++) {
  if (merged[i].includes('</article>')) foundArticle = true;
  if (foundArticle && merged[i].trim() === '}') {
    closeCount++;
    if (closeCount === 1) {
      merged.splice(i + 1, 0, ';', '}');
      break;
    }
  }
}

const before = lines.slice(0, 2002);
const after = lines.slice(2071);
fs.writeFileSync(path, [...before, ...merged, ...after].join('\n'), 'utf8');
console.log('Fixed Scorecard branch in bundle');
