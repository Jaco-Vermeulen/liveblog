# Freetype Fields (editor subsystem)

Post type selector and dynamic freetype template fields in the composer. For change history, see [../../CHANGELOG.md](../../CHANGELOG.md).

## Overview

Ports legacy `freetype.service.js` — theme HTML templates rendered as form fields bound to `freetypeData`, saved as `group_type: freetype` posts.

## Status

**Implemented (2026-05-27)** — post type selector + template fields via **freetypes-manager** `freetypeTemplate` utils. tasks: T-edit-15, T-edit-23

## Purpose

- **Plasing-tipe** dropdown — default Sir Trevor blocks vs API freetypes (+ built-in Scorecard)
- Dynamic fields from template `name` / `text` / `select` / `image` / `link` / `embed` attributes
- Publish → `freetypeDataToPostItem` → `renderFreetypeHtml` in `item.text`

## Dependencies

- **freetypes-manager** — `useFreetypesList`, `extractFreetypeFields`, `renderFreetypeHtml`, `freetypeDataToPostItem`, `builtinFreetypes`
- **liveblog-api** — `GET /freetypes`
- **style-guide** — `LbFormField`, `LbInput`, composer textarea classes

## File Structure

```
mechanisms/editor-manager/subsystems/freetype-fields/
├── index.ts
├── FreetypeFields.tsx           # Post type selector + field list
├── FreetypeFieldInput.tsx       # Per-field control by attribute type
└── constants.ts                 # DEFAULT_POST_TYPE
```

## Data Flow

1. User selects freetype → `useFreetypesList` provides template
2. `extractFreetypeFields` → dynamic inputs
3. Publish → `{ group_type: 'freetype', item_type: <name>, meta.data, text: rendered HTML }`
4. `usePostComposer` hides Sir Trevor blocks when `isFreetypeMode`

## Design Decisions

- **No silent fallback** — unknown freetype shows alert; built-in Scorecard bundled client-side until API lists it
- **No raw fetch** — freetypes list via liveblog-api only

## Legacy reference

- `client/app/scripts/liveblog-edit/freetype.service.js`
- `client/app/scripts/liveblog-edit/directives/freetype-*.js`

## Tasks

Parent: [../../TASKS.md](../../TASKS.md) — (T-edit-15), (T-edit-23)
