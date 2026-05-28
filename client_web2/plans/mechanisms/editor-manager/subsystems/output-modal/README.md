# Output Modal (editor subsystem)

Create/edit output channels and show embed code. For change history, see [../../CHANGELOG.md](../../CHANGELOG.md).

## Overview

Ports legacy `directives/output-modal.js`, `views/output-modal.ng1`, `views/output-embed-code-modal.ng1`.

## Status

**Implemented (2026-05-26)** — `OutputModal` (CRUD), `OutputEmbedCodeModal` (iframe snippet from `blog.public_urls.output[id]`).

## Purpose

- Create/edit output: name, theme, collection (required fields per server schema)
- Soft-delete output (`deleted: true` via PATCH)
- Display embed iframe + script snippet for published blog output URLs

## Dependencies

- **liveblog-api** — `outputs.ts`, `collections.ts`, `themes.ts` (`listSelectableThemes`)
- **style-guide** — `LbModal`, `LbButton`, form fields

## File Structure

```
mechanisms/editor-manager/subsystems/output-modal/
├── index.ts
├── OutputModal.tsx              # CRUD form
└── OutputEmbedCodeModal.tsx     # Embed code copy UI
```

## Data Flow

1. Settings **Outputs** tab → `listBlogOutputs(blogId)`
2. Save → `createOutput` / `updateOutput` → server may republish embeds on S3 (async)
3. Embed code → reads `blog.public_urls.output[output._id]` after blog publish

## Legacy reference

- `client/app/scripts/liveblog-edit/directives/output-modal.js`
- `client/app/scripts/liveblog-edit/views/output-embed-code-modal.ng1`

## Tasks

Parent: [../../TASKS.md](../../TASKS.md) — (T-edit-11)
