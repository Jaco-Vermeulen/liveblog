/**
 * Export static docs — exact snapshot of live docs4 (dashboard, management, inventories, mechanisms, etc.).
 * Usage: node scripts/export.js [--public] [--build]
 *   --public  only include content marked for "other users"
 *   --build   output to build/, system fonts, local Mermaid (for distribution zip)
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import {
  resolveDoc,
  readDocContent,
  findMechanisms,
  collectMarkdownFiles,
  getFileDisplayNameAndCategory,
  isPublicCategory,
  extractAllComponents,
} from '../lib/content.js';
import {
  buildNavDocs3,
  buildDashboardHtml,
  buildManagementHtml,
  buildMechanismInventoryMarkdown,
  buildComponentInventoryMarkdown,
} from '../lib/dashboard.js';
import { transformDataFlowSectionToAscii } from '../lib/data-flow-mermaid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLANS_DIR = path.resolve(__dirname, '..', '..', 'plans');
const DOCS4_ROOT = path.resolve(__dirname, '..');
const CLIENT_WEB2 = path.resolve(__dirname, '..', '..');

const publicOnly = process.argv.includes('--public');
/** When true, produce a static build for distribution: no CDN (local Mermaid, system fonts). */
const buildMode = process.argv.includes('--build');
// When --output docs3 is given, write to docs3/ with build-mode (local Mermaid). See plans/docs3-from-docs4.
const outArgIndex = process.argv.indexOf('--output');
let outArg = outArgIndex >= 0 && process.argv[outArgIndex + 1] ? process.argv[outArgIndex + 1] : null;
const docs3Path = path.resolve(CLIENT_WEB2, 'docs3');
const wantDocs3 = outArg && (outArg.replace(/[/\\]/g, '').toLowerCase() === 'docs3' || path.resolve(CLIENT_WEB2, outArg) === docs3Path);
let OUT_DIR = outArg ? path.resolve(CLIENT_WEB2, outArg) : (buildMode ? path.resolve(DOCS4_ROOT, 'build') : path.resolve(DOCS4_ROOT, 'export'));
if (wantDocs3) OUT_DIR = docs3Path;
const isDocs3 = wantDocs3;

marked.setOptions({ gfm: true, breaks: true, headerIds: true, mangle: false });

function getRelativePathToRoot(filePath) {
  const rel = path.relative(OUT_DIR, path.dirname(filePath));
  const depth = rel.split(path.sep).filter(Boolean).length;
  if (depth === 0) return './';
  return '../'.repeat(depth);
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hrefToFile(href) {
  const p = (href || '').replace(/^\/docs\/?/, '').replace(/\/$/, '');
  if (!p) return 'index.html';
  if (p === 'README') return 'README.html';
  if (p.startsWith('mechanisms/')) return p + '/index.html';
  return p + '.html';
}

/** Rewrite /docs/ and relative links in HTML to static file paths (for exact snapshot). */
function rewriteLinksForStatic(html, rootPath) {
  if (!html || typeof html !== 'string') return html;
  let out = html;
  out = out.replace(/href="\/docs\/([^"]*)"/g, (_, p) => {
    const file = hrefToFile('/docs/' + p.replace(/\/$/, ''));
    return 'href="' + rootPath.replace(/"/g, '&quot;') + file + '"';
  });
  out = out.replace(/href="(mechanisms\/[^"]+)"/g, (_, p) => {
    const file = p.replace(/\/$/, '') + '/index.html';
    return 'href="' + rootPath.replace(/"/g, '&quot;') + file + '"';
  });
  return out;
}

function renderNavToHtml(items, rootPath, isNested = false) {
  if (!items || !Array.isArray(items)) return '';
  rootPath = rootPath || './';
  const ulClass = isNested ? 'nav-list nested' : 'nav-list';
  let out = `<ul class="${ulClass}">`;
  for (const item of items) {
    if (item.type === 'folder') {
      const name = (item.name || '').replace(/-/g, ' ');
      const noCollapse = item.noCollapse === true;
      const noLink = item.noLink === true;
      let link;
      if (noLink && noCollapse) {
        link = `<span class="nav-folder-title nav-folder-label">${escapeHtml(name)}</span>`;
      } else if (item.linkHref) {
        const href = rootPath + hrefToFile(item.linkHref);
        link = `<div class="nav-item-row"><a href="${escapeHtml(href)}" class="nav-link">${escapeHtml(name)}</a><button type="button" class="nav-expand" aria-label="Expand" aria-expanded="false" title="Expand">▶</button></div>`;
      } else {
        link = `<span class="nav-folder-title">${escapeHtml(name)}</span>`;
      }
      const collapsedClass = noCollapse ? ' nav-folder-open' : ' collapsed';
      out += `<li class="nav-item nav-folder${collapsedClass}">${link}${renderNavToHtml(item.children, rootPath, true)}</li>`;
    } else {
      const href = rootPath + hrefToFile(item.href);
      out += `<li class="nav-item"><a href="${escapeHtml(href)}" class="nav-link">${escapeHtml(item.name)}</a></li>`;
    }
  }
  out += '</ul>';
  return out;
}

function getRelativeRoot(filePath) {
  const depth = (filePath.match(/\//g) || []).length;
  if (depth === 0) return './';
  return '../'.repeat(depth);
}

const THEME_TOGGLE_HTML = `
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            <span class="icon-sun" aria-hidden="true" style="display:none"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>
            <span class="icon-moon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></span>
            <span id="theme-label">Light</span>
        </button>`;

function getTemplate(relativeRoot, title, navHtml, contentHtml, logoSrc) {
  const styles = logoSrc ? relativeRoot + 'styles.css' : relativeRoot + 'assets/styles.css';
  const navJs = logoSrc ? relativeRoot + 'navigation.js' : relativeRoot + 'assets/nav.js';
  const logoHtml = logoSrc
    ? `<a href="${relativeRoot}index.html" class="logo-wrap"><img src="${escapeHtml(logoSrc)}" alt="Liveblog" /><span>Liveblog Docs</span></a>`
    : `<a href="${relativeRoot}index.html" class="logo-wrap"><span>Liveblog Docs</span></a>`;
  const useLocalAssets = buildMode || isDocs3;
  const fontLink = useLocalAssets
    ? ''
    : '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">';
  const fontFallback = useLocalAssets
    ? '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}</style>'
    : '';
  // Static export: no Mermaid; Data Flow sections stay as ASCII/code blocks.
  const mermaidScript = '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Liveblog Documentation</title>
  <link rel="stylesheet" href="${escapeHtml(styles)}">
  ${fontLink}
  ${fontFallback}
</head>
<body>
  <header class="site-header">
    ${logoHtml}
    ${THEME_TOGGLE_HTML}
  </header>
  <div class="container">
    <aside class="sidebar">
      <nav class="nav-menu">${navHtml}</nav>
    </aside>
    <main class="content">
      <div class="content-wrapper">
        <article class="markdown-body">${contentHtml}</article>
      </div>
    </main>
  </div>
  <script src="${escapeHtml(navJs)}"></script>
  <script type="module">
    ${mermaidScript}
  </script>
</body>
</html>`;
}

function exportDoc(resolved, outputPath, nav, rootPath, logoSrc) {
  const raw = readDocContent(resolved, PLANS_DIR);
  let html = marked.parse(raw || '');
  html = transformDataFlowSectionToAscii(html); // Data Flow: Mermaid → ASCII for static
  const navHtml = renderNavToHtml(nav, rootPath);
  const page = getTemplate(rootPath, resolved.title, navHtml, html, logoSrc);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, page);
}

function main() {
  console.log('Docs4 ' + (buildMode ? 'build' : 'export') + (publicOnly ? ' (public only)' : '') + '...');
  console.log('Plans:', PLANS_DIR);
  console.log('Output:', OUT_DIR);

  const audience = publicOnly ? 'public' : 'all';
  const mechanisms = findMechanisms(PLANS_DIR);
  const allFiles = collectMarkdownFiles(PLANS_DIR);
  const otherFiles = allFiles.filter((f) => !(f.dir || '').startsWith('mechanisms'));
  const components = extractAllComponents(mechanisms);
  const nav = buildNavDocs3(mechanisms, otherFiles, '/docs/', audience, components);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  if (isDocs3) {
    const stylesSrc = path.join(DOCS4_ROOT, 'public', 'styles.css');
    const navJsSrc = path.join(DOCS4_ROOT, 'public', 'nav.js');
    if (fs.existsSync(stylesSrc)) fs.copyFileSync(stylesSrc, path.join(OUT_DIR, 'styles.css'));
    if (fs.existsSync(navJsSrc)) fs.copyFileSync(navJsSrc, path.join(OUT_DIR, 'navigation.js'));
  } else {
    const assetsDir = path.join(OUT_DIR, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
    const stylesSrc = path.join(DOCS4_ROOT, 'public', 'styles.css');
    const navJsSrc = path.join(DOCS4_ROOT, 'public', 'nav.js');
    if (fs.existsSync(stylesSrc)) fs.copyFileSync(stylesSrc, path.join(assetsDir, 'styles.css'));
    if (fs.existsSync(navJsSrc)) fs.copyFileSync(navJsSrc, path.join(assetsDir, 'nav.js'));
    const logoSrc = path.join(CLIENT_WEB2, 'docs4', 'public', 'logo', 'liveblog-logo.svg');
    if (fs.existsSync(logoSrc)) {
      try { fs.copyFileSync(logoSrc, path.join(assetsDir, 'liveblog-logo.svg')); } catch (_) {}
    }
  }

  let count = 0;
  const rootPath = './';
  const logoRoot = isDocs3 ? '../public/logo/liveblog-logo.svg' : 'assets/logo/liveblog-logo.svg';

  // Index = dashboard (exact snapshot of live /docs/)
  const dashboardContent = buildDashboardHtml(PLANS_DIR, mechanisms, otherFiles, components.length);
  const dashboardContentStatic = rewriteLinksForStatic(dashboardContent, rootPath);
  const dashboardPage = getTemplate(rootPath, 'Home', renderNavToHtml(nav, rootPath), dashboardContentStatic, logoRoot);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), dashboardPage);
  count++;

  // Project overview (README)
  const indexResolved = resolveDoc(PLANS_DIR, 'README', {});
  if (indexResolved) {
    exportDoc(indexResolved, path.join(OUT_DIR, 'README.html'), nav, rootPath, logoRoot);
    count++;
  }

  // Management page
  const managementContent = buildManagementHtml(PLANS_DIR, mechanisms);
  const managementContentStatic = rewriteLinksForStatic(managementContent, rootPath);
  const managementPage = getTemplate(rootPath, 'Management', renderNavToHtml(nav, rootPath), managementContentStatic, logoRoot);
  fs.writeFileSync(path.join(OUT_DIR, 'management.html'), managementPage);
  count++;

  // Mechanism inventory
  const mechanismInvMd = buildMechanismInventoryMarkdown(mechanisms);
  let mechanismInvHtml = marked.parse(mechanismInvMd);
  mechanismInvHtml = rewriteLinksForStatic(mechanismInvHtml, rootPath);
  const mechanismInvPage = getTemplate(rootPath, 'Mechanism Inventory', renderNavToHtml(nav, rootPath), mechanismInvHtml, logoRoot);
  fs.writeFileSync(path.join(OUT_DIR, 'mechanism-inventory.html'), mechanismInvPage);
  count++;

  // Component inventory
  const componentInvMd = buildComponentInventoryMarkdown(components);
  let componentInvHtml = marked.parse(componentInvMd);
  componentInvHtml = rewriteLinksForStatic(componentInvHtml, rootPath);
  const componentInvPage = getTemplate(rootPath, 'Component Inventory', renderNavToHtml(nav, rootPath), componentInvHtml, logoRoot);
  fs.writeFileSync(path.join(OUT_DIR, 'component-inventory.html'), componentInvPage);
  count++;

  for (const m of mechanisms) {
    const resolved = resolveDoc(PLANS_DIR, `mechanisms/${m.path}`, { detailed: true });
    if (resolved) {
      const outPath = path.join(OUT_DIR, 'mechanisms', m.path, 'index.html');
      const r = getRelativePathToRoot(outPath);
      const logoSrc = isDocs3 ? r + '../public/logo/liveblog-logo.svg' : r + 'assets/logo/liveblog-logo.svg';
      exportDoc(resolved, outPath, nav, r, logoSrc);
      count++;
    }
    if (m.subsystems) {
      for (const s of m.subsystems) {
        const resolvedSub = resolveDoc(PLANS_DIR, `mechanisms/${s.path}`, { detailed: true });
        if (resolvedSub) {
          const outPath = path.join(OUT_DIR, 'mechanisms', s.path, 'index.html');
          const r = getRelativePathToRoot(outPath);
          const logoSrc = isDocs3 ? r + '../public/logo/liveblog-logo.svg' : r + 'assets/logo/liveblog-logo.svg';
          exportDoc(resolvedSub, outPath, nav, r, logoSrc);
          count++;
        }
      }
    }
  }

  for (const file of otherFiles) {
    const info = getFileDisplayNameAndCategory(file);
    if (publicOnly && !isPublicCategory(info)) continue;
    const docPath = file.relativePath.replace(/\.md$/, '');
    const resolved = resolveDoc(PLANS_DIR, docPath, {});
    if (resolved) {
      const outPath = path.join(OUT_DIR, docPath + '.html');
      const r = getRelativePathToRoot(outPath);
      const logoSrc = isDocs3 ? r + '../public/logo/liveblog-logo.svg' : r + 'assets/logo/liveblog-logo.svg';
      exportDoc(resolved, outPath, nav, r, logoSrc);
      count++;
    }
  }

  console.log('Exported', count, 'pages to', OUT_DIR);
}

main();
