# Phase 4 — Editor Subsystems Implementation Report

**Date:** 2026-05-26  
**Mechanism:** editor-manager (+ liveblog-api T-api-11)  
**Status:** Complete (live WebSocket deferred)

## Scope

Phase 4 adds editor subsystems and expands blog settings beyond title/description:

| Subsystem | Task ID | API |
|-----------|---------|-----|
| embed-handlers | T-edit-9 | None (client URL detection) |
| polls | T-edit-9 | `POST/PATCH /polls` |
| freetype-fields (stub) | T-edit-9 | None until freetypes-manager |
| blog-settings-rail | T-edit-10 | `PATCH /blogs`, `GET/POST/PATCH /outputs`, `GET /consumers`, `GET /users` |
| output-modal | T-edit-11 | outputs + collections + themes |

## Files created (src)

### liveblog-api

- `endpoints/polls.ts`, `outputs.ts`, `consumers.ts`, `collections.ts`, `users.ts`
- `types.ts` — `Poll`, `PollBody`, `Output`, `Consumer`, `Collection`; extended `Blog`

### editor-manager

- `hooks/useBlogSettings.ts`
- `subsystems/embed-handlers/*`
- `subsystems/polls/*`
- `subsystems/freetype-fields/*`
- `subsystems/blog-settings-rail/*`
- `subsystems/output-modal/*`
- Updated: `routes/SettingsPage.tsx`, `components/PostComposer.tsx`, `services/blockTransform.ts`
- `liveblog-api/endpoints/posts.ts` — `savePostItem` poll branch

## Smoke verification

```bash
node client_web2/scripts/smoke-editor-phase4.mjs
```

| Step | Endpoint | Result |
|------|----------|--------|
| Login | `POST /auth_db` | pass |
| Outputs list | `GET /outputs?where=…` | pass |
| Consumers | `GET /consumers` | pass |
| Collections | `GET /collections` | pass |
| Poll create | `POST /polls` | pass |

## Tests

| Type | Location |
|------|----------|
| Vitest | `detectProvider.test.ts`, `pollCalculations.test.ts`, `blockTransform` poll case |
| Report | [tests/editor-manager/2026-05-26/](../tests/editor-manager/2026-05-26/test-summary.md) |

## Known limitations

| Item | Task |
|------|------|
| `useEditorWebSocket` stub | T-edit-13 |
| `FreetypeFields` stub | T-edit-15 |
| No Iframely/oEmbed in composer | Future embed-handlers work |
| No timeline embed React islands | Legacy `itemEmbed*.tsx` not ported |

## Documentation

| Artifact | Path |
|----------|------|
| Mechanism README | `plans/mechanisms/editor-manager/README.md` |
| Subsystem READMEs | `plans/mechanisms/editor-manager/subsystems/*/README.md` |
| CHANGELOG | `plans/mechanisms/editor-manager/CHANGELOG.md` |
| Meeting | `plans/meetings/2026-05-26-phases-2-4-implementation.md` |

## Related

- [Phases 2–4 rollup](2026-05-26-phases-2-4.md)
- [liveblog-api Phase 4 resources](../../mechanisms/liveblog-api/CHANGELOG.md)
