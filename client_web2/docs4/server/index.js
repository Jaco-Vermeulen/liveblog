/**
 * Liveblog Docs4 server: live reading, API, and static UI.
 * Run with: npm run start (from docs4 folder) or npm run docs4:start (from client_web2).
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { marked } from 'marked';
import {
  resolveDoc,
  readDocContent,
  findMechanisms,
  collectMarkdownFiles,
  extractAllComponents,
  findComponent,
  slugifyHeading,
  extractComponentSection,
} from '../lib/content.js';
import {
  buildNavDocs3,
  buildDashboardHtml,
  buildManagementHtml,
  buildMechanismInventoryMarkdown,
  buildComponentInventoryMarkdown,
  buildReportsByMechanism,
  getRelatedReportsSection,
} from '../lib/dashboard.js';
import { transformDataFlowSectionToMermaid } from '../lib/data-flow-mermaid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLANS_DIR = path.resolve(__dirname, '..', '..', 'plans');
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

marked.setOptions({ gfm: true, breaks: true, headerIds: true, mangle: false });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/assets', express.static(PUBLIC_DIR));
// Wireframe renderer (live from plans) — same as docs3
const WIREFRAME_RENDERER_DIR = path.join(PLANS_DIR, 'wireframes', 'renderer');
if (fs.existsSync(WIREFRAME_RENDERER_DIR)) {
  app.use('/docs/wireframes/renderer', express.static(WIREFRAME_RENDERER_DIR));
}

// --- API ---

/** GET /api/docs/nav?audience=public|all — docs3-style nav (Management, inventories, reports under mechanisms). */
app.get('/api/docs/nav', (req, res) => {
  const audience = (req.query.audience || 'all') === 'public' ? 'public' : 'all';
  try {
    const { nav, mechanisms } = getDocs3Context(audience);
    res.json({ nav, mechanismCount: mechanisms.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/docs/content?path=<docPath>&format=md|html&detailed=1&audience=public */
app.get('/api/docs/content', (req, res) => {
  const docPath = req.query.path;
  if (!docPath) {
    return res.status(400).json({ error: 'Missing path' });
  }
  const format = (req.query.format || 'html') === 'md' ? 'md' : 'html';
  const detailed = req.query.detailed === '1' || req.query.detailed === 'true';
  try {
    const resolved = resolveDoc(PLANS_DIR, docPath, { detailed });
    if (!resolved) {
      return res.status(404).json({ error: 'Not found', path: docPath });
    }
    const raw = readDocContent(resolved, PLANS_DIR);
    if (!raw) {
      return res.status(404).json({ error: 'No content', path: docPath });
    }
    if (format === 'md') {
      return res.json({ path: docPath, title: resolved.title, format: 'md', markdown: raw });
    }
    let html = marked.parse(raw);
    html = transformDataFlowSectionToMermaid(html);
    res.json({ path: docPath, title: resolved.title, format: 'html', html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/docs/mechanisms */
app.get('/api/docs/mechanisms', (req, res) => {
  try {
    const mechanisms = findMechanisms(PLANS_DIR);
    const list = mechanisms.map((m) => ({
      path: m.path,
      name: m.name,
      title: m.title || m.name.replace(/-/g, ' '),
      subsystems: (m.subsystems || []).map((s) => ({ path: s.path, title: s.title || s.name.replace(/-/g, ' ') })),
    }));
    res.json({ mechanisms: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/docs/mechanism/:path(*) */
app.get('/api/docs/mechanism/:path(*)', (req, res) => {
  const mechPath = `mechanisms/${req.params.path || ''}`.replace(/\/$/, '');
  const detailed = req.query.detailed === '1' || req.query.detailed === 'true';
  try {
    const resolved = resolveDoc(PLANS_DIR, mechPath, { detailed });
    if (!resolved || resolved.type !== 'mechanism') {
      return res.status(404).json({ error: 'Not found', path: mechPath });
    }
    const raw = readDocContent(resolved, PLANS_DIR);
    res.json({
      path: mechPath,
      title: resolved.title,
      markdown: raw,
      html: marked.parse(raw),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/docs/health */
app.get('/api/docs/health', (req, res) => {
  const plansExists = fs.existsSync(PLANS_DIR);
  res.json({
    ok: true,
    plansDir: PLANS_DIR,
    plansExists,
  });
});

// --- Live doc viewer (HTML) ---

const THEME_TOGGLE_HTML = `
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            <span class="icon-sun" aria-hidden="true" style="display:none"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>
            <span class="icon-moon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></span>
            <span id="theme-label">Light</span>
        </button>`;

/** @param {{ articleClass?: string }} [layoutOptions] — e.g. `articleClass: 'bugs-portal-full-width'` for full main-column width */
function getLayout(title, navJson, contentHtml, layoutOptions) {
  const navHtml = renderNavToHtml(navJson, false);
  const articleClass = layoutOptions?.articleClass
    ? `markdown-body ${layoutOptions.articleClass}`
    : 'markdown-body';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Liveblog Docs</title>
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <header class="site-header">
    <a href="/docs/" class="logo-wrap">
      <img src="/assets/logo/liveblog-logo.svg" alt="Liveblog" onerror="this.style.display='none'"/>
      <span>Liveblog Docs</span>
    </a>
    <div class="header-actions">${THEME_TOGGLE_HTML}</div>
  </header>
  <div class="container">
    <aside class="sidebar">
      <nav class="nav-menu">${navHtml}</nav>
    </aside>
    <main class="content">
      <div class="content-wrapper">
        <article class="${articleClass}">${contentHtml}</article>
      </div>
    </main>
  </div>
  <script src="/assets/nav.js"></script>
  <script type="module">
    (async function() {
      var container = document.querySelector('.mermaid.data-flow-diagram');
      if (!container) return;
      try {
        var mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')).default;
        window.mermaid = mermaid;
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        mermaid.initialize({
          theme: 'base',
          themeVariables: isDark
            ? { primaryColor: '#334155', primaryTextColor: '#f1f5f9', primaryBorderColor: '#64748b', lineColor: '#94a3b8', secondaryColor: '#1e293b', tertiaryColor: '#0f172a' }
            : { primaryColor: '#f1f5f9', primaryTextColor: '#1e293b', primaryBorderColor: '#cbd5e1', lineColor: '#64748b', secondaryColor: '#e2e8f0', tertiaryColor: '#ffffff' }
        });
        var divs = document.querySelectorAll('.mermaid.data-flow-diagram');
        for (var i = 0; i < divs.length; i++) {
          var div = divs[i];
          var src = div.getAttribute('data-mermaid-src');
          if (src && div.querySelector('svg')) div.textContent = src;
        }
        await mermaid.run({ querySelector: '.mermaid.data-flow-diagram', suppressErrors: true });
      } catch (e) { console.warn('Mermaid render failed:', e); }
    })();
    document.documentElement.addEventListener('themechange', function() {
      if (window.mermaid && document.querySelector('.mermaid.data-flow-diagram')) {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        window.mermaid.initialize({ theme: 'base', themeVariables: isDark ? { primaryColor: '#334155', primaryTextColor: '#f1f5f9', primaryBorderColor: '#64748b', lineColor: '#94a3b8' } : { primaryColor: '#f1f5f9', primaryTextColor: '#1e293b', primaryBorderColor: '#cbd5e1', lineColor: '#64748b' } });
        var divs = document.querySelectorAll('.mermaid.data-flow-diagram');
        divs.forEach(function(div) { var s = div.getAttribute('data-mermaid-src'); if (s && div.querySelector('svg')) div.textContent = s; });
        window.mermaid.run({ querySelector: '.mermaid.data-flow-diagram', suppressErrors: true });
      }
    });
  </script>
</body>
</html>`;
}

function renderNavToHtml(items, isNested = false) {
  if (!items || !Array.isArray(items)) return '';
  const ulClass = isNested ? 'nav-list nested' : 'nav-list';
  let out = `<ul class="${ulClass}">`;
  for (const item of items) {
    if (item.type === 'folder') {
      const name = (item.name || '').replace(/-/g, ' ');
      const categoryAttr = name ? ` data-nav-category="${escapeHtml(name)}"` : '';
      const noCollapse = item.noCollapse === true;
      const noLink = item.noLink === true;
      let link;
      if (noLink && noCollapse) {
        link = `<span class="nav-folder-title nav-folder-label">${escapeHtml(name)}</span>`;
      } else if (item.linkHref) {
        link = `<div class="nav-item-row"><a href="${escapeHtml(item.linkHref)}" class="nav-link">${escapeHtml(name)}</a><button type="button" class="nav-expand" aria-label="Expand" aria-expanded="false" title="Expand">▶</button></div>`;
      } else {
        link = `<span class="nav-folder-title">${escapeHtml(name)}</span>`;
      }
      const collapsedClass = noCollapse ? ' nav-folder-open' : ' collapsed';
      out += `<li class="nav-item nav-folder${collapsedClass}"${categoryAttr}>${link}${renderNavToHtml(item.children, true)}</li>`;
    } else {
      out += `<li class="nav-item"><a href="${escapeHtml(item.href)}" class="nav-link">${escapeHtml(item.name)}</a></li>`;
    }
  }
  out += '</ul>';
  return out;
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Live docs3-mirror: dashboard, management, inventories (read from plans, same structure as docs3) ---

function getDocs3Context(audience = 'all') {
  const mechanisms = findMechanisms(PLANS_DIR);
  const allFiles = collectMarkdownFiles(PLANS_DIR);
  const otherFiles = allFiles.filter((f) => !(f.dir || '').startsWith('mechanisms'));
  const components = extractAllComponents(mechanisms);
  const nav = buildNavDocs3(mechanisms, otherFiles, '/docs/', audience, components);
  const reportsByMechanism = buildReportsByMechanism(otherFiles, '/docs/');
  return { mechanisms, otherFiles, nav, components, reportsByMechanism };
}

function getWireframeEmbedHtml(wireframeId, rendererPath) {
  const base = rendererPath + '?wf=' + encodeURIComponent(wireframeId) + '&bp=';
  return (
    '<div class="wireframe-embed">' +
    '<p class="wireframe-embed-tabs">' +
    '<a href="' + base + 'mobile" target="wireframe-embed-iframe">Mobile (460px)</a> | ' +
    '<a href="' + base + 'tablet" target="wireframe-embed-iframe">Tablet (786px)</a> | ' +
    '<a href="' + base + 'desktop" target="wireframe-embed-iframe">Desktop (1280px)</a>' +
    '</p>' +
    '<iframe name="wireframe-embed-iframe" class="wireframe-embed-frame" title="Wireframe" src="' + base + 'desktop" width="100%" height="520"></iframe>' +
    '</div>'
  );
}

function injectWireframeEmbed(htmlContent, wireframeId, rendererPath) {
  const embedHtml = getWireframeEmbedHtml(wireframeId, rendererPath);
  const sectionRe = /(<h2[^>]*>Visual wireframe \(drawn from \.md\)<\/h2>)\s*[\s\S]*?(?=<h2|$)/i;
  return htmlContent.replace(sectionRe, '$1\n' + embedHtml + '\n');
}

/**
 * Build list of { pattern, title, path } for task report replacement.
 * Includes: full path for every mechanism and subsystem; short name for every subsystem (so "infinite-scroll" -> subsystem doc).
 */
function getMechanismReplacements(plansDir) {
  const mechanisms = findMechanisms(plansDir);
  const byPattern = new Map();
  for (const m of mechanisms) {
    const title = m.title || m.name.replace(/-/g, ' ');
    byPattern.set(m.path, { pattern: m.path, title, path: m.path });
    for (const sub of m.subsystems || []) {
      const subTitle = sub.title || sub.name.replace(/-/g, ' ');
      byPattern.set(sub.path, { pattern: sub.path, title: subTitle, path: sub.path });
      if (sub.name && !byPattern.has(sub.name)) {
        byPattern.set(sub.name, { pattern: sub.name, title: subTitle, path: sub.path });
      }
    }
  }
  const list = Array.from(byPattern.values()).sort((a, b) => (b.pattern.length - a.pattern.length));
  return list;
}

/** Replace mechanism/subsystem slugs in task report HTML with human-readable titles (and link to doc). */
function rewriteTaskReportMechanismNames(html, replacements, basePath = '/docs/') {
  let out = html;
  for (const { pattern, title, path } of replacements) {
    const patternEsc = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\//g, '\\/');
    const re = new RegExp(`<strong>${patternEsc}</strong>`, 'g');
    const link = `<a href="${basePath}mechanisms/${path.replace(/"/g, '&quot;')}"><strong>${escapeHtml(title)}</strong></a>`;
    out = out.replace(re, link);
  }
  out = out.replace(/<strong>Project \(root\)<\/strong>/g, '<strong>Project (root)</strong>');
  return out;
}

/** Resolve a relative path against the directory of currentDocPath (for mechanism pages). */
function resolveDocRelative(currentDocPath, relativeHref) {
  if (!currentDocPath.startsWith('mechanisms/')) return null;
  // currentDocPath IS the directory (e.g. 'mechanisms/site-widgets/subsystems/modal-manager').
  // path.posix.resolve would produce an absolute path making startsWith('mechanisms/') always
  // false; use path.posix.normalize on the joined string to stay relative.
  const joined = currentDocPath.replace(/\/$/, '') + '/' + relativeHref.replace(/\/$/, '');
  const resolved = path.posix.normalize(joined);
  return resolved.startsWith('mechanisms/') ? resolved : null;
}

/** Rewrite .md and directory links in HTML to /docs/ paths for live viewer. */
function rewriteLinksForDocs4(html, currentDocPath) {
  let out = html;
  // In mechanism pages: TASKS.md, CHANGELOG.md, COMMENTS.md -> #tasks, #changelog, #comments
  if (currentDocPath.startsWith('mechanisms/')) {
    out = out.replace(/href=["']([^"']*?)TASKS\.md(?:#([^"']*))?["']/gi, (_, __, hash) => `href="#tasks${hash ? '#' + hash : ''}"`);
    out = out.replace(/href=["']([^"']*?)CHANGELOG\.md(?:#([^"']*))?["']/gi, (_, __, hash) => `href="#changelog${hash ? '#' + hash : ''}"`);
    out = out.replace(/href=["']([^"']*?)COMMENTS\.md(?:#([^"']*))?["']/gi, (_, __, hash) => `href="#comments-notes${hash ? '#' + hash : ''}"`);
  }
  // Relative .md -> /docs/ path (no .md); resolve relative to current doc when in mechanisms/
  out = out.replace(/href=["']([^"']+\.md)(#?[^"']*)["']/gi, (match, mdPath, hash) => {
    if (/^(https?:|\/\/|mailto:)/i.test(mdPath.trim())) return match;
    const isRelative = /^\.\.?\//.test(mdPath) || !mdPath.includes('/');
    const resolved = isRelative && currentDocPath.startsWith('mechanisms/')
      ? resolveDocRelative(currentDocPath, mdPath.replace(/\.md$/i, '').replace(/\/README$/i, ''))
      : null;
    const clean = resolved || mdPath.replace(/\.md$/i, '').replace(/^\.\//, '').replace(/\/README$/i, '');
    return `href="/docs/${clean}${hash || ''}"`;
  });
  // Relative directory/ -> /docs/ path; resolve relative to current doc when in mechanisms/
  out = out.replace(/href=["']([^"']*\/)["']/g, (match, slashPath) => {
    const t = slashPath.trim();
    if (!t || t.startsWith('#') || /^(https?:|\/\/|mailto:)/i.test(t)) return match;
    const resolved = /^\.\.?\//.test(t) && currentDocPath.startsWith('mechanisms/')
      ? resolveDocRelative(currentDocPath, t)
      : null;
    const target = resolved || t.replace(/\/$/, '');
    return `href="/docs/${target}"`;
  });
  return out;
}

/** GET /docs/ - dashboard (mirrors docs3 index) */
app.get('/docs/', (req, res) => {
  const audience = req.query.audience === 'public' ? 'public' : 'all';
  try {
    const { nav, mechanisms, otherFiles, components } = getDocs3Context(audience);
    const dashboardHtml = buildDashboardHtml(PLANS_DIR, mechanisms, otherFiles, components.length);
    const page = getLayout('Home', nav, dashboardHtml);
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

/** GET /docs/management - management page (progress + Gantt) */
app.get('/docs/management', (req, res) => {
  const audience = req.query.audience === 'public' ? 'public' : 'all';
  try {
    const { nav, mechanisms } = getDocs3Context(audience);
    const managementHtml = buildManagementHtml(PLANS_DIR, mechanisms);
    const page = getLayout('Management', nav, managementHtml);
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

/** GET /docs/mechanism-inventory */
app.get('/docs/mechanism-inventory', (req, res) => {
  const audience = req.query.audience === 'public' ? 'public' : 'all';
  try {
    const { nav, mechanisms } = getDocs3Context(audience);
    const markdown = buildMechanismInventoryMarkdown(mechanisms);
    const html = marked.parse(markdown);
    const linked = rewriteLinksForDocs4(html, 'mechanism-inventory');
    const page = getLayout('Mechanism Inventory', nav, linked);
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

/** GET /docs/component-inventory */
app.get('/docs/component-inventory', (req, res) => {
  const audience = req.query.audience === 'public' ? 'public' : 'all';
  try {
    const { nav, components } = getDocs3Context(audience);
    const markdown = buildComponentInventoryMarkdown(components);
    const html = marked.parse(markdown);
    const linked = rewriteLinksForDocs4(html, 'component-inventory');
    const page = getLayout('Component Inventory', nav, linked);
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

/** GET /docs/components/:path* - component detail page (full section from README + link to full mechanism doc) */
app.get('/docs/components/*', (req, res) => {
  const pathStr = (req.params[0] || '').replace(/\/$/, '');
  const segments = pathStr.split('/').filter(Boolean);
  if (segments.length < 2) {
    res.status(404).send('Component path must be mechanism/component-slug');
    return;
  }
  const componentSlug = segments[segments.length - 1];
  const mechanismPath = segments.slice(0, -1).join('/');
  try {
    const found = findComponent(PLANS_DIR, mechanismPath, componentSlug);
    if (!found) {
      res.status(404).send(`Component not found: ${mechanismPath}/${componentSlug}`);
      return;
    }
    const { component, mechanismTitle, mechanismPath: mechPath } = found;
    const anchor = slugifyHeading(component.name);
    const fullDocHref = `/docs/mechanisms/${mechPath}#${anchor}`;
    const sectionMd = extractComponentSection(PLANS_DIR, mechPath, component.name);
    let sectionHtml = '';
    if (sectionMd) {
      sectionHtml = marked.parse(sectionMd);
      sectionHtml = transformDataFlowSectionToMermaid(sectionHtml);
      sectionHtml = rewriteLinksForDocs4(sectionHtml, 'mechanisms/' + mechPath);
    }
    const meta = [
      `<p class="component-meta"><strong>Mechanism:</strong> <a href="/docs/mechanisms/${escapeHtml(mechPath)}">${escapeHtml(mechanismTitle)}</a></p>`,
      component.purpose ? `<p class="component-meta"><strong>Purpose:</strong> ${escapeHtml(component.purpose)}</p>` : '',
      component.location ? `<p class="component-meta"><strong>Location:</strong> <code>${escapeHtml(component.location)}</code></p>` : '',
    ].filter(Boolean).join('\n');
    const html = `
    <h1>${escapeHtml(component.name)}</h1>
    <div class="component-intro">${meta}</div>
    ${sectionHtml ? `<div class="component-section">${sectionHtml}</div>` : ''}
    <hr class="component-divider" />
    <p class="component-cta"><a href="${fullDocHref}" class="cta-link">View in full mechanism documentation &rarr;</a> <span class="muted">(scrolls to this component)</span></p>`;
    const audience = req.query.audience === 'public' ? 'public' : 'all';
    const { nav } = getDocs3Context(audience);
    const page = getLayout(`${component.name} – ${mechanismTitle}`, nav, html);
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

/** GET /docs/* - live doc viewer (README, mechanisms, wireframes, reports, etc.) */
app.get('/docs/*', (req, res) => {
  const docPath = (req.params[0] || '').replace(/\/$/, '') || 'README';
  if (docPath.startsWith('components/')) {
    res.status(404).send('Not found');
    return;
  }
  const audience = req.query.audience === 'public' ? 'public' : 'all';
  try {
    const { nav, reportsByMechanism } = getDocs3Context(audience);
    const resolved = resolveDoc(PLANS_DIR, docPath, { detailed: true });
    if (!resolved) {
      res.status(404).send(`Doc not found: ${docPath}`);
      return;
    }
    const raw = readDocContent(resolved, PLANS_DIR);
    let html = marked.parse(raw || '');
    html = transformDataFlowSectionToMermaid(html);
    if (resolved.type === 'mechanism') {
      const mechanismPath = docPath.replace(/^mechanisms\//, '');
      html += getRelatedReportsSection(mechanismPath, reportsByMechanism);
    }
    if (resolved.type === 'file' && docPath.startsWith('wireframes/')) {
      const wireframeId = docPath.replace(/^wireframes\//, '');
      if (/^\d{2}-.+/.test(wireframeId)) {
        html = injectWireframeEmbed(html, wireframeId, '/docs/wireframes/renderer/index.html');
      }
    }
    if (resolved.type === 'file' && /^reports\/task-report-/.test(docPath)) {
      const replacements = getMechanismReplacements(PLANS_DIR);
      html = rewriteTaskReportMechanismNames(html, replacements);
    }
    html = rewriteLinksForDocs4(html, docPath);
    const page = getLayout(resolved.title, nav, html);
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.get('/docs', (req, res) => res.redirect(302, '/docs/'));
app.get('/', (req, res) => res.redirect(302, '/docs/'));

// SPA fallback: serve index.html for unknown routes so we can use client-side routing later
const indexPath = path.join(PUBLIC_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
}

const PORT = Number(process.env.DOCS4_PORT || process.env.PORT) || 4010;
app.listen(PORT, () => {
  console.log(`Liveblog Docs4 at http://localhost:${PORT}`);
  console.log(`  Live docs: http://localhost:${PORT}/docs/`);
  console.log(`  API:       http://localhost:${PORT}/api/docs/nav`);
  console.log(`  Plans:     ${PLANS_DIR}`);
});
