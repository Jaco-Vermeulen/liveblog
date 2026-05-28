# Embed Handlers (editor subsystem)

URL-based embed provider detection and composer preview. For change history, see [../../CHANGELOG.md](../../CHANGELOG.md).

## Overview

Ports legacy `liveblog-edit/embed/handlers/*` and `helpers.ts` provider guessing for the React composer. Does **not** call Iframely yet — full HTML embed resolution remains server/legacy.

## Status

**Implemented (2026-05-26+)** — Full legacy embed card parity: Iframely oEmbed + `embed.js?key=`, provider handlers, `EmbedCard` (title/description/credit, cover hide/show, Instagram caption), paste-to-URL normalization, `PostItemEmbed` timeline. Logged via **request-logger**.

## Purpose

- Classify embed URLs (Twitter, Facebook, Instagram, direct images, generic)
- Resolve URLs via Iframely oEmbed (`key=` param) and provider-specific handlers
- Store full `meta` (`html`, `provider_name`, `original_url`, …) on save
- Render embed cards in composer preview and timeline (`PostItemEmbed`)

## Dependencies

- **style-guide** — `LbAlert` for warnings
- **liveblog-api** — embed items saved as `item_type: 'embed'` with URL in `text` / `meta.url`

## File Structure

The subsystem is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/editor-manager/subsystems/embed-handlers/
├── index.ts
├── resolveEmbed.ts
├── detectProvider.ts
├── services/ (iframely, loggedFetch, guessProvider, normalizeEmbedUrl)
├── handlers/ (twitter, facebook, instagram, picture)
├── hooks/useEmbedResolve.ts
└── components/ (EmbedBlockEditor, PostItemEmbed, EmbedHtml, …)
```

## Design Decisions

- **Logged external HTTP** — `loggedFetch` + **request-logger** for `https://iframe.ly/api/oembed`
- **Env** — `VITE_IFRAMELY_KEY` overrides public key (legacy `IFRAMELY_KEY`)
- **Legacy patterns** — handlers ported from `embed/handlers/*.ts`; fallback Iframely for unknown URLs
- **Raw HTML** — paste embed code (non-URL) stored as `meta.html` without oEmbed call

## Legacy reference

- `client/app/scripts/liveblog-edit/embed/helpers.ts` — `guessProvider`
- `client/app/scripts/liveblog-edit/embed/handlers/` — twitter, facebook, instagram, pictures
- `client/app/scripts/liveblog-edit/components/itemEmbed*.tsx` — timeline embed render (not ported)

## Tasks

Parent mechanism: [../../TASKS.md](../../TASKS.md) — (T-edit-9)
