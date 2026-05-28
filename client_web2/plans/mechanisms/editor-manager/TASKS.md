# Editor Manager — Tasks

## Phase 3

- [x] (T-edit-1) Review legacy module: `client/app/scripts/liveblog-edit`
- [x] (T-edit-2) Create `src/mechanisms/editor-manager/` scaffold
- [x] (T-edit-3) Implement core hooks/services
- [x] (T-edit-4) Implement UI components (style-guide compliant)
- [x] (T-edit-5) Wire routes in app shell
- [x] (T-edit-6) Unit tests (Vitest)
- [x] (T-edit-7) Smoke test against Docker stack (`scripts/smoke-editor.mjs`)
- [x] (T-edit-8) Update CHANGELOG + COMMENTS

## Phase 4

- [x] (T-edit-9) embed-handlers, polls, freetype-fields subsystems
- [x] (T-edit-10) blog-settings-rail (members, outputs, consumers)
- [x] (T-edit-11) output-modal
- [x] (T-edit-12) Smoke Phase 4 (`scripts/smoke-editor-phase4.mjs`)
- [x] (T-edit-13) Replace `useEditorWebSocket` stub when websocket-manager ships

## Phase 5+

- [x] (T-edit-14) Real-time timeline via websocket-manager (unblocks T-edit-13)
- [x] (T-edit-15) Full freetype template rendering via freetypes-manager (Phase 6)

## UX — live preview (2026-05-26)

- [x] (T-edit-16) Maroela-style editor view modes: edit / split / preview
- [x] (T-edit-17) `BlogLivePreviewPane` — draft preview, device widths, public blog link
- [x] (T-edit-18) Vitest: `composerPreview.test.ts`, `EditorViewModeSwitch.test.tsx`

## Post lifecycle (2026-05-27)

- [x] (T-edit-19) Schedule posts — datetime picker + `published_date` / `scheduled` on save
- [x] (T-edit-20) Edit mode UX — banner + cancel when editing existing post
- [x] (T-edit-21) Unpublish open posts → draft
- [x] (T-edit-22) Image block in composer
- [x] (T-edit-23) Built-in Scorecard freetype (legacy template)

## Rich text composer (2026-05-27)

- [x] (T-edit-24) Maroela-style rich text toolbar — `subsystems/rich-text-editor/`, HTML in `item.text`, `EmbedHtml` display
- [x] (T-edit-25) Toolbar UX — full-width flex groups, transparent bar, icon-only Wysig actions
