# Project Changelog — client_web2 plans

High-level milestones. Per-mechanism detail: `plans/mechanisms/<mechanism>/CHANGELOG.md`.

## 2026-05-27 - Blogging UX + rich text editor

[COMPLETED] Editor post lifecycle — schedule, edit/cancel, unpublish, image block. tasks: T-edit-19 through T-edit-22
[COMPLETED] Rich text composer — Maroela toolbar parity, HTML posts. tasks: T-edit-24, T-edit-25
[COMPLETED] Freetype composer pipeline + Scorecard builtin. tasks: T-edit-15, T-edit-23
[COMPLETED] Blog list — server search, pagination, access request, WS refresh. tasks: T-blog-9, T-blog-10, T-blog-12
[ADDED] `plans/reports/implementation/2026-05-27-blogging-rich-text.md`
[ADDED] `plans/reports/tests/editor-manager/2026-05-27/` (142 Vitest)
[ADDED] `plans/mechanisms/editor-manager/subsystems/rich-text-editor/README.md`
[CHANGED] `plans/KNOWLEDGE_GRAPH.md`, `plans/COMPONENT_INVENTORY.md`, editor-manager + freetype-fields READMEs

## 2026-05-25 - Phase 0 planning

[ADDED] Full plans structure (15 mechanisms, commands, directives, meetings)
[ADDED] Vite + React scaffold, Maroela tokens in `src/index.css`
[COMPLETED] All mechanism READMEs per MECHANISM_README_STANDARD

## 2026-05-26 - Phase 1 foundation + shell

[COMPLETED] Phase 1 foundation. tasks: T-proj-1
[MILESTONE] Phase 1 — 100%

[ADDED] request-logger, liveblog-api (auth), auth-manager, navigation-manager implementations
[ADDED] Reusable layout + UI component library (`src/components/layout/`, `src/components/ui/`)
[ADDED] `plans/COMPONENT_INVENTORY.md`, implementation report, meeting notes
[CHANGED] App routing — AppShell + Outlet for all authenticated paths
[ADDED] Full Phase 1 documentation sweep per DOCUMENTATION_PROCEDURES.md
[ADDED] Test report `plans/reports/tests/phase1/2026-05-26/`

## 2026-05-26 - Phase 2 blog list

[COMPLETED] Phase 2 blog-list-manager. tasks: T-blog-1 through T-blog-8
[MILESTONE] Phase 2 — 100%

[ADDED] `blog-list-manager` — grid, create, bulk actions, embed modal
[ADDED] liveblog-api blogs/themes/archive/blogslist endpoints. tasks: T-api-9
[ADDED] Test report `plans/reports/tests/blog-list-manager/2026-05-26/`
[ADDED] Smoke `scripts/smoke-blogs.mjs`

## 2026-05-26 - Phase 3 editor core

[COMPLETED] Phase 3 editor-manager core. tasks: T-edit-1 through T-edit-8
[MILESTONE] Phase 3 — 100%

[ADDED] `editor-manager` — EditorPage, composer, timeline, settings entry
[ADDED] liveblog-api posts layer. tasks: T-api-10
[ADDED] Test report `plans/reports/tests/editor-manager/2026-05-26/` (partial; expanded in Phase 4)
[ADDED] Smoke `scripts/smoke-editor.mjs`

## 2026-05-26 - Phase 4 editor advanced

[COMPLETED] Phase 4 editor subsystems. tasks: T-edit-9 through T-edit-12
[MILESTONE] Phase 4 — 100%

[ADDED] Editor subsystems: embed-handlers, polls, settings rail, output-modal; freetype stub
[ADDED] liveblog-api polls/outputs/consumers/collections/users. tasks: T-api-11
[ADDED] Smoke `scripts/smoke-editor-phase4.mjs`
[NOTE] WebSocket still stub (T-edit-13)
[ADDED] Phase 4 implementation report `plans/reports/implementation/2026-05-26-phase4-editor-subsystems.md`
[ADDED] Editor subsystem plan READMEs (5 subsystems)

## 2026-05-26 - Documentation sweep (Phases 2–4)

[CHANGED] Mechanism README File Structures synced to `src/` for blog-list, editor, liveblog-api
[CHANGED] Task IDs and changelog `tasks:` refs for T-blog-*, T-edit-*, T-api-*
[ADDED] `plans/reports/implementation/2026-05-26-phases-2-4.md`
[ADDED] `plans/reports/tests/phases-2-4/2026-05-26/` + per-mechanism test summaries
[ADDED] `plans/meetings/2026-05-26-phases-2-4-implementation.md`
[CHANGED] `plans/COMPONENT_INVENTORY.md`, `plans/KNOWLEDGE_GRAPH.md`

## 2026-05-26 - Phase 5 settings & themes

[COMPLETED] Phase 5 settings-manager + themes-manager
[MILESTONE] Phase 5 — 100%

[ADDED] `settings-manager` — general + instance settings pages
[ADDED] `themes-manager` — Theme Manager list and actions
[ADDED] liveblog-api `endpoints/settings.ts`; extended themes (upload/download/redeploy)
[ADDED] Smoke `scripts/smoke-phase5.mjs`
[NOTE] Theme stylesTab modal deferred to themes-manager Phase 5+

## 2026-05-26 - WebSocket manager Phase 1–2

[COMPLETED] websocket-manager Phase 1 — Superdesk JSON WebSocket client, editor real-time, connection banner
[COMPLETED] websocket-manager Phase 2. tasks: T-ws-9
[FIXED] Reconnect loop causing UI flash every ~5s
[ADDED] settings-manager `InstanceFeaturesProvider` + `getInstanceSettingsCurrent`. tasks: T-set-12
[ADDED] Smoke `scripts/smoke-websocket.mjs`
[ADDED] Reports: `plans/reports/implementation/2026-05-26-websocket-manager-phase1-2.md`, `plans/reports/tests/websocket-manager/2026-05-26/`, `plans/reports/troubleshooting/ui-flash-reconnect-loop/`
[CHANGED] `plans/KNOWLEDGE_GRAPH.md`, editor-manager T-edit-13/14 complete

## 2026-05-26 - Phase 6 secondary modules

[COMPLETED] Phase 6 — analytics, freetypes, advertising, marketplace, syndication managers
[MILESTONE] Phase 6 — 100%

[ADDED] Five Phase 6 mechanisms under `src/mechanisms/`
[ADDED] liveblog-api endpoints: analytics, freetypes, advertising, marketplace, syndication
[ADDED] Route `/liveblog/analytics/:id`; replaced PlaceholderPages for admin modules
[ADDED] Editor analytics nav link; `VITE_MARKETPLACE` / `VITE_SYNDICATION` feature flags
[ADDED] Smoke `scripts/smoke-phase6.mjs`
[NOTE] Syndication ingest panel still needs WS consumer wiring (websocket-manager `posts` available)

## 2026-05-26 - Documentation sweep (Phase 5)

[CHANGED] Mechanism README File Structures synced to `src/` (settings-manager, themes-manager, liveblog-api)
[CHANGED] TASKS.md task IDs T-set-*, T-theme-*, T-api-12–14
[ADDED] `plans/reports/implementation/2026-05-26-phase5-settings-themes.md`
[ADDED] `plans/reports/tests/phase5/`, `settings-manager/`, `themes-manager/` test summaries
[ADDED] `plans/meetings/2026-05-26-phase5-implementation.md`
[CHANGED] `plans/COMPONENT_INVENTORY.md`, `plans/KNOWLEDGE_GRAPH.md`, `plans/README.md` mechanism index

## 2026-05-26 - WebSocket manager (Phase 1)

[COMPLETED] websocket-manager Phase 1. tasks: T-ws-1 through T-ws-8, T-ws-11
[MILESTONE] websocket-manager Phase 1 — 100%

[ADDED] `websocket-manager` — Superdesk JSON WebSocket, `wsManager`, `WebSocketProvider`, hooks, `ConnectionBanner`
[ADDED] Smoke `scripts/smoke-websocket.mjs`
[CHANGED] `editor-manager` — `useEditorWebSocket` real-time (T-edit-13, T-edit-14)
[CHANGED] `navigation-manager` AppShell — connection banner
[FIXED] Reconnect loop causing UI flash every ~5s. tasks: T-ws-12 through T-ws-16
[ADDED] `plans/reports/implementation/2026-05-26-websocket-manager.md`
[ADDED] `plans/reports/tests/websocket-manager/2026-05-26/`
[ADDED] `plans/reports/troubleshooting/ui-flash-reconnect-loop/`
[ADDED] `plans/meetings/2026-05-26-websocket-manager.md`
[CHANGED] Mechanism docs (websocket-manager, editor-manager, navigation-manager), `KNOWLEDGE_GRAPH.md`, `COMPONENT_INVENTORY.md`
[NOTE] Phase 6 syndication ingest panel still needs dedicated WS consumer — server uses same `posts` events
