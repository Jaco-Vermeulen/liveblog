# Editor Manager — Comments

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client/app/scripts/liveblog-edit`

## 2026-05-26 — Phase 3 complete

- Editor core live: composer (Text/Embed blocks), open timeline with pagination, draft/contributions/scheduled/comments panels via rail.
- Posts API in `liveblog-api/endpoints/posts.ts` (criteria builder ports legacy `postsService` filters).
- **WebSocket stub:** `useEditorWebSocket` logs a console warning; timeline refresh is manual/refetch after publish. Phase 4+ requires websocket-manager.
- Settings page: title/description PATCH only; full rail deferred to Phase 4.
- Smoke: `node client_web2/scripts/smoke-editor.mjs` — login + blog + posts list OK against Docker :5000.

## 2026-05-26 — Phase 4 complete

- Settings rail: General, Team (members PATCH), Outputs (CRUD + embed modal), Consumers (tags in `consumers_settings`).
- Composer: Poll block (`PollBlockEditor`), embed URL preview (`detectEmbedProvider`). Freetype slot is stub until freetypes-manager.
- Poll save path: `savePostWithItems` → `savePollForPost` preserves vote counts on update (legacy behaviour).
- **WebSocket:** still stub — websocket-manager not started; timeline refetch after publish only.
- Smoke: `node client_web2/scripts/smoke-editor-phase4.mjs` — outputs, consumers, collections, poll create OK on :5000.

## 2026-05-26 — Documentation sweep (full protocol)

Per [DOCUMENTATION_PROCEDURES.md](../../DOCUMENTATION_PROCEDURES.md):

| Artifact | Path |
|----------|------|
| Mechanism README | `README.md` — File Structure, Subsystems links, Components Phase 4 |
| TASKS | `TASKS.md` — T-edit-1 … T-edit-15 |
| CHANGELOG | `CHANGELOG.md` — tasks: refs, milestones |
| COMMENTS | This file |
| Subsystem READMEs | `subsystems/{embed-handlers,polls,freetype-fields,blog-settings-rail,output-modal}/README.md` |
| Test report | `plans/reports/tests/editor-manager/2026-05-26/test-summary.md` + `test-results.json` |
| Implementation report | `plans/reports/implementation/2026-05-26-phase4-editor-subsystems.md` |
| Meeting | `plans/meetings/2026-05-26-phases-2-4-implementation.md` |
| Global | `plans/CHANGELOG.md`, `KNOWLEDGE_GRAPH.md`, `COMPONENT_INVENTORY.md` |

## 2026-05-27 — T-edit-15 freetype pipeline

- Editor composer: **Plasing-tipe** dropdown loads freetypes from API; template fields render as React inputs (`name`/`text`/`select`/`image`/`link`/`embed` attributes).
- Publish saves `group_type: freetype`, `item_type: <freetype.name>`, `meta.data`, rendered `text` via `renderFreetypeHtml`.
- Built-in legacy freetypes (Scorecard, Advertisement) not yet bundled — user-defined freetypes only.
- Tests: 129 Vitest pass; `freetypeTemplate.test.ts` + blockTransform freetype cases.

## 2026-05-26 — WebSocket integration (websocket-manager)

- **T-edit-13 / T-edit-14 done:** `useEditorWebSocket` uses `useWsEvent` from websocket-manager.
- `posts` → debounced `timelineApi.fetchNewPage()` (400ms).
- `removing_timeline_post` → `timelineApi.removePost(post_id)`; payload normalized from `{ post }`.
- Embed error handler wired; 3h notify throttle not yet ported from legacy `blog.service.js`.
- See [websocket-manager COMMENTS](../websocket-manager/COMMENTS.md) for reconnect-loop fix.

## 2026-05-27 — Documentation sweep (blogging + rich text)

Per [DOCUMENTATION_PROCEDURES.md](../../DOCUMENTATION_PROCEDURES.md) after blogging completion and rich text editor work:

| Artifact | Path |
|----------|------|
| Subsystem README | `subsystems/rich-text-editor/README.md` |
| Mechanism README | `README.md` — Status, File Structure, rich text spec, subsystems table |
| TASKS | `TASKS.md` — T-edit-19 … T-edit-25 |
| CHANGELOG | `CHANGELOG.md` — post lifecycle + rich text entries |
| COMMENTS | This file |
| Implementation | `plans/reports/implementation/2026-05-27-blogging-rich-text.md` |
| Tests | `plans/reports/tests/editor-manager/2026-05-27/` |
| Global | `plans/CHANGELOG.md`, `KNOWLEDGE_GRAPH.md`, `COMPONENT_INVENTORY.md` |

## 2026-05-27 — Post lifecycle bundle (T-edit-19 … T-edit-23)

- **Schedule:** `composerSchedule.ts` + datetime-local; `published_date` / `scheduled` on publish.
- **Edit UX:** Blue banner + cancel; draft save hidden when editing.
- **Unpublish:** Timeline `PostCard` sets `post_status` draft via API.
- **Image block:** URL field → `item_type: image`.
- **Freetype:** Full pipeline via freetypes-manager; built-in Scorecard merged in `useFreetypesList`.
- **blog-list-manager:** Server ES search, pagination, access-request modal, WS blog refresh (see blog-list COMMENTS).

## 2026-05-27 — Rich text editor (T-edit-24, T-edit-25)

**Reference:** `maroela_web2/.../ArticleFieldsForm.tsx` — ported toolbar groups and execCommand behaviour.

**Key decisions:**

- HTML in `item.text` (legacy Sir Trevor compatible).
- `EmbedHtml` for display — not a sanitizer; matches legacy admin `.html()` behaviour.
- Sticky-bold prevention required for Maroela parity (Ctrl+B clears mode unless toolbar bold with selection).
- Toolbar UX iterations: removed teal toolbar background; flex `1 1 0` on groups and buttons for full-width bar.

**Known limitations:**

- `document.execCommand` is deprecated but matches Maroela + legacy stack.
- No dedicated smoke script for rich text — L3 manual checklist in test report.
- Quote block type rarely used in composer UI but supported in transform + rich editor.

**Tests:** 142 Vitest pass; `richTextHtml.test.ts`, `blockTransform.richText.test.ts`.
