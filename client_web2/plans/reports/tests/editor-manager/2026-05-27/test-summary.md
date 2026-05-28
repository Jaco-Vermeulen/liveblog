# editor-manager — Test Summary

**Date:** 2026-05-27  
**Command:** `npm test` (client_web2 root)  
**JSON:** [test-results.json](test-results.json)

## Vitest (mechanism-related)

| File | Tests | Status |
|------|-------|--------|
| `subsystems/rich-text-editor/richTextHtml.test.ts` | 3 | pass |
| `services/blockTransform.richText.test.ts` | 2 | pass |
| `services/blockTransform.test.ts` | (incl. freetype) | pass |
| `services/composerSchedule.test.ts` | — | pass |
| `subsystems/embed-handlers/detectProvider.test.ts` | — | pass |
| `subsystems/polls/pollCalculations.test.ts` | — | pass |
| `services/composerPreview.test.ts` | — | pass |
| `components/EditorViewModeSwitch.test.tsx` | — | pass |

**Suite total:** 142 tests, 50 files (2026-05-27 run).

## Build

| Command | Result |
|---------|--------|
| `npm run build` | pass — `tsc -b && vite build` |

## Smoke (Docker :5000)

| Script | Notes |
|--------|-------|
| `scripts/smoke-editor.mjs` | Login + blog + posts — run when stack up |
| `scripts/smoke-editor-phase4.mjs` | Polls, outputs — run when stack up |

Rich text has **no dedicated smoke** yet; manual L3 covers toolbar + HTML round-trip.

## L3 manual checklist (rich text)

| Step | Expected |
|------|----------|
| Open `/liveblog/edit/:id` | Composer shows flex toolbar (6 groups, full width) |
| Type text, apply **Vet** on selection | `<b>` or `<strong>` in saved post |
| Add bullet list | `<ul><li>` in `item.text` |
| Publish | Timeline card shows formatted HTML (not raw tags) |
| Split preview | `PreviewPostItem` renders same formatting |
| Edit post | Rich editor loads existing HTML |

## Related reports

- Implementation: [2026-05-27-blogging-rich-text.md](../../../implementation/2026-05-27-blogging-rich-text.md)
- Prior: [2026-05-26/test-summary.md](../2026-05-26/test-summary.md)
