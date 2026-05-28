# editor-manager — Test Summary

**Date:** 2026-05-26  
**Command:** `npm test` (client_web2 root)  
**JSON:** [test-results.json](test-results.json) (`vitest run --reporter=json --outputFile=…`)

## Vitest (mechanism scope)

| File | Tests | Status |
|------|-------|--------|
| `services/blockTransform.test.ts` | 4 | pass |
| `subsystems/embed-handlers/detectProvider.test.ts` | 4 | pass |
| `subsystems/polls/pollCalculations.test.ts` | 2 | pass |

## Smoke (Docker :5000)

| Script | Result |
|--------|--------|
| `node client_web2/scripts/smoke-editor.mjs` | pass — login, get blog, list posts |
| `node client_web2/scripts/smoke-editor-phase4.mjs` | pass — outputs, consumers, collections, poll create |

## Notes

- `useEditorWebSocket` is a **stub** — no WS integration tests until websocket-manager
- Manual UI: `/liveblog/edit/:id`, `/liveblog/settings/:id` at :9001 after login

### L3 manual checklist (Phase 4 settings)

| Step | Expected |
|------|----------|
| Login admin/admin | Session in localStorage |
| Open `/liveblog/settings/:id` | Four tabs visible |
| Team → Wysig span | User list; save members |
| Uitsette → + Nuwe uitset | OutputModal; save |
| Uitset → Inbed | Embed modal if `public_urls.output` set |
| Edit → + Poll | PollBlockEditor; publish creates `/polls` entry |

- Full suite rollup: [phases-2-4 test-summary](../../phases-2-4/2026-05-26/test-summary.md)
- Implementation: [phase4 report](../../../implementation/2026-05-26-phase4-editor-subsystems.md)
