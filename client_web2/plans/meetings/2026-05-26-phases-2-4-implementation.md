# Meeting notes — Phases 2–4 implementation

**Date:** 2026-05-26  
**Topic:** blog-list-manager, editor-manager, liveblog-api Phases 2–4

## Decisions

- Feature mechanisms call **liveblog-api** directly (no duplicate `*Api.ts` wrappers in blog-list-manager).
- Editor settings live under **editor-manager** (`/liveblog/settings/:id`), not settings-manager (instance-level).
- **useEditorWebSocket** remains an explicit stub with console warning until websocket-manager exists.
- Navigation **sub-nav hidden** on `/liveblog/edit/*` and `/liveblog/settings/*` to match legacy full-screen editor chrome.

## Delivered

- Phase 2: blog grid, create, bulk archive/delete, embed modal
- Phase 3: editor shell, posts criteria API, composer, timeline
- Phase 4: polls, embed preview, settings rail, outputs/consumers

## Follow-ups

- T-edit-13: wire websocket-manager
- T-blog-9–13: blog list parity (access request, server search, pagination UI, E2E)
- T-edit-15: freetypes-manager integration

## References

- [Implementation report (rollup)](../reports/implementation/2026-05-26-phases-2-4.md)
- [Implementation report (Phase 4)](../reports/implementation/2026-05-26-phase4-editor-subsystems.md)
- [Test summary](../reports/tests/phases-2-4/2026-05-26/test-summary.md)
- [Editor subsystem READMEs](../mechanisms/editor-manager/subsystems/)
