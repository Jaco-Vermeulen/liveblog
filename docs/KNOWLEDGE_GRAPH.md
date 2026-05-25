# Liveblog — Knowledge Graph

## Themes

| Theme | Purpose |
|-------|---------|
| **maroela** | Legacy embed theme (Source Sans 3, `#c45c26`, minimal overrides) |
| **nuwe-maroela** | Modern embed aligned with **maroela_web2** (Lato, cards, teal toolbar) |

## Client portal (admin) — maroela_web2 UX redux

Light-mode admin shell only (dark mode removed for now). Responsive nav: persistent teal sidebar on desktop (≥1024px), hamburger + off-canvas drawer + backdrop on tablet/mobile.

| File | Role |
|------|------|
| `client/app/styles/sass/maroela-brand.scss` | Tokens + imports nav/shell/portal/ui |
| `client/app/styles/sass/maroela-nav.scss` | App chrome: hamburger, drawer, backdrop, layout offsets |
| `client/app/styles/sass/maroela-shell.scss` | Portal chrome, blog card grid, editor rail |
| `client/app/styles/sass/maroela-portal.scss` | Timeline posts, Sir Trevor, panels |
| `client/app/styles/sass/maroela-ui.scss` | Buttons, forms, settings shell, themes, login |
| `client/app/images/maroela-logo.svg` | Nav + login branding |
| `client/app/template/core/menu/views/menu.html` | Hamburger, backdrop, drawer nav |
| `client/app/scripts/liveblog-bloglist/views/main.ng1` | Card grid (`m-blog-grid`), toolbar |
| `client/app/scripts/liveblog-edit/views/main.ng1` | Editor rail (`m-editor-rail`) |
| `client/app/styles/sass/lb-bootstrap.scss` | Lato import + Superdesk chain |
| `client/app/styles/sass/lb-variables.scss` | `$sd-blue` → teal, `$orange` → brand orange |

Local admin: http://localhost:9000/ — hard-refresh after `liveblog-client` rebuild.

**SCSS note:** libsass cannot evaluate `calc(100vh - Npx)` — use `#{"calc(100vh - 56px)"}` in maroela SCSS.

**Nav breakpoints:** `$mm-nav-width: 260px`, desktop sidebar from `1024px`. Hamburger uses Superdesk `toggleMenu()` / `flags.menu`.

## Design alignment (nuwe-maroela ↔ maroela_web2)

| Concern | Source of truth | Liveblog implementation |
|---------|-----------------|-------------------------|
| Brand colors | `maroela_demo/maroela_web2/tailwind.config.js` | `themes_assets/nuwe-maroela/less/nuwe-maroela.less` |
| Typography | Lato (web2 `index.css`) | Google Fonts + `--maroela-font` |
| Page background | `#F5EFE7` | `html.lb-wrapHtml`, `body.lb-wrapBody` |
| Post UI | News cards | `.lb-post` card layout under `.nuwe-maroela-timeline` |
| Headings | `.maroela-heading-cinema` | Blog title in `nuwe-maroela/template.html` |

## Key paths

- `server/liveblog/themes/themes_assets/maroela/` — legacy theme (unchanged behaviour)
- `server/liveblog/themes/themes_assets/nuwe-maroela/` — web2 modern theme
- `server/liveblog/system_themes.py` — registers both themes
- `client/app/styles/sass/maroela-brand.scss` — admin brand (legacy maroela colours)
- `docker/scripts/set-blog-nuwe-maroela.js` — assign test blog to nuwe-maroela
- `docker/scripts/reset-nuwe-maroela-theme-styles.js` — Mongo styleSettings for nuwe-maroela

## Embed URLs (local)

- Legacy: `http://localhost:5000/embed/<blog_id>/theme/maroela`
- Modern: `http://localhost:5000/embed/<blog_id>/theme/nuwe-maroela`

## Build

```bash
# Using default theme's lessc (requires no extra install):
node server/liveblog/themes/themes_assets/default/node_modules/less/bin/lessc \
  server/liveblog/themes/themes_assets/nuwe-maroela/less/nuwe-maroela.less \
  server/liveblog/themes/themes_assets/nuwe-maroela/dist/nuwe-maroela.css
```

### PowerShell build command
```powershell
$lessBin = "server\liveblog\themes\themes_assets\default\node_modules\less\bin\lessc"
$src = "server\liveblog\themes\themes_assets\nuwe-maroela\less\nuwe-maroela.less"
$dst = "server\liveblog\themes\themes_assets\nuwe-maroela\dist\nuwe-maroela.css"
node $lessBin $src $dst
```

### LESS build notes
- Use `@import (css) url("...")` for Google Fonts (prevents lessc URL fetch)
- Use `~"min()"` / `~"calc(var(...))"` escapes for CSS functions LESS intercepts

## Dark Mode — nuwe-maroela

The theme supports three dark-mode trigger layers (CSS-only + JS), matching Twitter/X's embed dark mode pattern.

### How it works

| Trigger | Mechanism | Priority |
|---------|-----------|----------|
| OS/browser preference | `@media (prefers-color-scheme: dark)` in CSS | lowest |
| URL parameter | `?colorScheme=dark\|light\|auto` → JS sets `data-color-scheme` on `<html>` | medium |
| postMessage from parent | `{ type: 'lb:colorScheme', data: 'dark'\|'light'\|'auto' }` → same JS handler | highest |

### URLs to test

```
# OS auto (dark if OS is dark)
http://localhost:5000/embed/<blog_id>/theme/nuwe-maroela

# Force dark
http://localhost:5000/embed/<blog_id>/theme/nuwe-maroela?colorScheme=dark

# Force light (overrides OS dark mode)
http://localhost:5000/embed/<blog_id>/theme/nuwe-maroela?colorScheme=light
```

### Embedding on Maroela website (iframe)

```javascript
// Force dark mode on the embed iframe
const iframe = document.querySelector('iframe.liveblog-embed');
iframe.contentWindow.postMessage({ type: 'lb:colorScheme', data: 'dark' }, '*');

// Follow the page's own dark mode class
const isDark = document.documentElement.classList.contains('dark');
iframe.src = iframe.src.includes('?')
  ? iframe.src + '&colorScheme=' + (isDark ? 'dark' : 'light')
  : iframe.src + '?colorScheme=' + (isDark ? 'dark' : 'light');
```

### CSS architecture

- All colours use CSS custom properties (`--maroela-*`) defined on `:root`
- Dark mode overrides those variables at higher specificity
- The inline `<style>` from `generate_theme_styles()` (hardcoded `#f5efe7`) is beat by `!important` in `.lb-timeline` dark rule
- Force-light `html[data-color-scheme="light"]` resets variables inside `@media (prefers-color-scheme: dark)` so it wins even when OS is dark

### Important: loaders.py fix

`CompiledThemeTemplateLoader` had a bug where child themes without compiled DB templates (`files.templates = {}`) couldn't resolve `{% include "template-embed-utils.html" %}`. Fixed in `server/liveblog/themes/template/loaders.py`: when child is in `else` branch and parent has DB templates, use `addDictonary(parent)` instead of `ModuleLoader`.

**Note:** The bind mount `./server:/opt/server` has a Windows→WSL2 mtime propagation issue for some paths. If Python is using a cached `.pyc` after a file edit, run:
```bash
docker exec liveblog-server bash -c "find /opt/server -name '*.pyc' -newer /opt/server/liveblog/themes/template/loaders.py -delete"
docker restart liveblog-server
```

## Tests

```powershell
.\scripts\test-nuwe-maroela-theme-css.ps1
```
