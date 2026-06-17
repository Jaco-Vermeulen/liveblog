# Editor Manager — Changelog

## 2026-06-17 - Webhook-conditional composer title and featured image

[ADDED] `useBlogHasWebhook`, `blogWebhooks.ts` — editor shows **Pasgemaakte titel** + **Hoofbeeld** only when the blog has an enabled webhook (blog-specific or global); otherwise optional custom title via checkbox only.
[ADDED] Featured image `none` source — posting works without a blog cover image; picker hides broken thumbnails and omits empty blog-cover tile.
[CHANGED] `useFeaturedImageLibrary` — loads all pages from `GET /api/media_pictures` (shared server library, all editors).
[CHANGED] `useWebhooks` invalidates React Query webhook cache on save/remove so the editor picks up new webhooks without reload.
[CHANGED] Copy — plain Afrikaans labels (`Pasgemaakte titel`, `Hoofbeeld`); no webhook/nuuskaart jargon in composer.
[ADDED] Vitest: `blogWebhooks.test.ts`, `featuredImage` cases; server `media_pictures_test.py`.

## 2026-05-27 - Rich text toolbar UX

[CHANGED] Toolbar — full-width flex (`flex: 1` groups + buttons), transparent bar, no gaps between segments. tasks: T-edit-25
[CHANGED] Wysig actions — `Link2Off`, `RemoveFormatting` icons (replaced Unlink/Clear text). tasks: T-edit-25
[CHANGED] `PostComposer` — removed duplicate TEXT/Inhoud labels for default text block. tasks: T-edit-25
[ADDED] Subsystem plan README `subsystems/rich-text-editor/README.md`. tasks: T-edit-24, T-edit-25

## 2026-05-27 - Rich text composer (Maroela parity)

[ADDED] `subsystems/rich-text-editor/` — `RichTextBlockEditor` with Maroela-style toolbar (bold/italic/underline, headings, lists, quote, alignment, link, undo/redo) via `contentEditable` + `execCommand`. tasks: T-edit-24
[CHANGED] `PostComposer` Text/Quote blocks use rich editor instead of plain textarea; HTML stored in `item.text`. tasks: T-edit-24
[CHANGED] `PreviewPostItem`, `PostCard`, `ThemedPostCard` render HTML text via `EmbedHtml`; `blockTransform` treats empty HTML as empty blocks. tasks: T-edit-24
[ADDED] Vitest: `richTextHtml.test.ts`, `blockTransform.richText.test.ts`. tasks: T-edit-24
[ADDED] Implementation report `plans/reports/implementation/2026-05-27-blogging-rich-text.md`
[ADDED] Test report `plans/reports/tests/editor-manager/2026-05-27/`

## 2026-05-27 - Post lifecycle completion

[ADDED] Schedule posts — `composerSchedule.ts`, datetime-local in composer, `published_date` on save. tasks: T-edit-19
[ADDED] Edit mode banner + cancel; hide draft save when editing. tasks: T-edit-20
[ADDED] Unpublish (`open` → `draft`) on timeline cards. tasks: T-edit-21
[ADDED] Image block in composer + `blockTransform` round-trip. tasks: T-edit-22
[ADDED] Built-in Scorecard freetype via `freetypes-manager/builtinFreetypes.ts`. tasks: T-edit-23

## 2026-05-27 - Freetype composer (freetypes-manager pipeline)

[ADDED] `freetypes-manager/utils/freetypeTemplate.ts` — field extraction, `renderFreetypeHtml`, `freetypeDataToPostItem`. tasks: T-edit-15
[CHANGED] `FreetypeFields` — post type selector + template fields from API freetypes; saves `group_type: freetype`. tasks: T-edit-15
[CHANGED] `usePostComposer` — freetype mode hides Sir Trevor blocks; loads freetype posts for edit. tasks: T-edit-15
[ADDED] Vitest: `freetypeTemplate.test.ts`, freetype cases in `blockTransform.test.ts`. tasks: T-edit-15

## 2026-05-26 - Maroela embed theme root cause (styleSettings)

[FIXED] Mongo `maroela` theme had `styleSettings` forcing `div.lb-timeline { background: #ffffff }` — overrode nuwe-maroela cream/teal CSS (looked like broken default theme). Reset via `docker/scripts/reset-maroela-theme-styles.js` (`extends: nuwe-maroela`, `#f5efe7` / `#c45712`).
[ADDED] `client_web2/scripts/smoke-theme-embed.mjs` — asserts stylesheet chain + no white inline override.

## 2026-05-26 - Maroela embed theme + preview chrome

[NOTE] Server `themes_assets/maroela`: **extends `nuwe-maroela`**, nuwe-maroela template + CSS. Embed loads `default` + `nuwe-maroela` + `maroela` stylesheets after DB reset.
[CHANGED] Desktop preview: max-width 52rem, cream page background, centered article column.
[CHANGED] Phone/tablet scale-to-fit in `PreviewDeviceFrame`.

## 2026-05-26 - Maroela theme preview (inheritance, scale, asset URLs)

[FIXED] Theme CSS in “Wysig” mode loads parent + child stylesheets (`default` → `maroela`) via `themeAssets.ts`. tasks: T-edit-17
[FIXED] Theme asset URLs rewritten to same-origin `/themes_assets/...` in dev (Vite proxy). tasks: T-edit-17
[FIXED] Phone/tablet preview scales to fit panel width (realistic 393/820px viewports, portrait/landscape). tasks: T-edit-17
[ADDED] Vitest: `themeAssets.test.ts`. tasks: T-edit-17

## 2026-05-26 - Editor scroll lock (no page scroll behind panels)

[FIXED] Blog editor locks viewport (`lb-route-fill--editor`); scroll only inside **Redigeer** / **Tydlyn** / **Voorskou** panel bodies — not the whole page.
[CHANGED] Classic **Redigeer** view uses same panel chrome as split (compose + timeline columns).

## 2026-05-26 - Phone mockup corner bleed + scrollbar fix

[FIXED] Removed CSS `transform: scale()` on device frame (caused beige/gray ghost corners) — layout uses real scaled pixels via `scaleDeviceFrame()`.
[FIXED] Stage + screen `overflow: hidden` / `contain: paint`; iframe clipped to screen radius; embed scrollbars hidden in admin preview.

## 2026-05-26 - Phone device mockup realism

[CHANGED] iPhone-style frame: dynamic island + home indicator overlays, metallic bezel, side buttons, centered scale transform.
[CHANGED] Thin/hidden scrollbars in device + injected theme embed CSS (no fat desktop scrollbar in phone frame).

## 2026-05-26 - Warm panel surfaces (no pure white)

[CHANGED] Design tokens: `mar-card` → warm cream; new `mar-panel` / `mar-input` for functional panels and fields across editor and managers.
[CHANGED] `LbTopBar` keeps **pure white** (`bg-white`) — warm tokens do not apply to main nav bar.

## 2026-05-26 - Phone/tablet preview centering

[FIXED] Foon/tablet mockup centered in preview panel (horizontal + vertical); scale fits host width **and** height; `transform-origin: top left` + clip stage fixes layout vs visual mismatch.

## 2026-05-26 - Desktop preview fills panel

[FIXED] Desktop live preview no longer collapses to a tiny centered box — flex fill chain + removed `max-width: 52rem` cap on desktop iframe.

## 2026-05-26 - Preview: inject editor tools into real theme embed

[CHANGED] Removed **Regte tema** / **Wysig** toggle — single preview uses server embed iframe with admin toolbars injected on `.lb-post` (pin, highlight, edit, publish, delete).
[ADDED] `previewEmbedBridge` + `usePreviewEmbedBridge` — same-origin DOM injection; React-themed fallback when iframe is cross-origin.
[ADDED] Konsep draft overlay above iframe in split/preview modes.

## 2026-05-26 - Editor layout: no viewport calc hacks

[CHANGED] Removed `calc(100dvh - 7rem)` / `:has(.m-portal-editor)` height lock; editor fills shell via flex (`LbAppShell` → `LbShellMain` → `.lb-route-fill` → `.m-portal-editor`).
[CHANGED] `LbShellMain` no longer uses `min-h-[calc(100vh-4rem)]`.

## 2026-05-26 - Theme embed asset proxy (analytics.js 404)

[FIXED] “Regte tema” iframe preview — `/themes_assets` and `/themes_uploads` proxied to liveblog server in `vite.config.ts` (embed pages load theme JS/CSS from same origin as Vite dev server).

## 2026-05-26 - Blog settings save fix

[FIXED] General/team/consumers blog save — use `liveblog-api` `updateBlog` instead of PATCHing full GET document (Eve metadata caused 422).
[CHANGED] `GeneralSettings` save button label: `Stoor` (was `Stoor algemeen`).

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements

## 2026-05-26 - Phase 3 implementation

[ADDED] `src/mechanisms/editor-manager/` — routes, hooks, components, block transform. tasks: T-edit-2, T-edit-3, T-edit-4
[ADDED] `EditorPage` at `/liveblog/edit/:id`, `SettingsPage` at `/liveblog/settings/:id`. tasks: T-edit-5
[ADDED] `useTimeline`, `usePosts`, `usePostComposer`, `useBlog`, `useEditorWebSocket` (stub). tasks: T-edit-3
[ADDED] Maroela editor chrome CSS (`m-portal-editor`, `m-editor-rail`, etc.)
[ADDED] Vitest: `blockTransform.test.ts`. tasks: T-edit-6
[ADDED] Smoke: `scripts/smoke-editor.mjs`. tasks: T-edit-7
[CHANGED] App routes; navigation hides list subnav on editor/settings. tasks: T-edit-5
[COMPLETED] Phase 3 editor core. tasks: T-edit-1, T-edit-8
[NOTE] WebSocket live updates stubbed until websocket-manager — see `useEditorWebSocket` (T-edit-13)

## 2026-05-26 - Editor UX parity (chrome, settings, post actions)

[CHANGED] `EditorLayout` — icon chrome (home, analytics, settings), icon panel rail (legacy `lb-big-icon-*` parity)
[CHANGED] `PostComposer` — icon block toolbar + pin/highlight icon toggles; removed freetype stub dumping `blog_preferences` in composer
[CHANGED] `FreetypeFields` — no longer renders language/embed_height as debug JSON (settings keys filtered; hidden until freetypes-manager)
[CHANGED] `GeneralSettings` — full blog general tab: status, image upload, theme, language, embed height/code, category, comments, posts limit
[CHANGED] `SettingsPage` — shared icon chrome, permission gate via `canAccessBlogSettings`
[CHANGED] `PostCard` — author/time meta; pin, highlight, edit, publish, delete icon toolbar
[ADDED] `blogSecurity`, `blogEmbedCode`, `blogPreferenceKeys`, `useBlogGeneralSettings`, `EditorChromeActions`
[ADDED] liveblog-api `updatePostFlags` for sticky/highlight PATCH

## 2026-05-26 - Phase 4 implementation

[ADDED] Editor subsystems: `embed-handlers`, `polls`, `freetype-fields` (stub), `blog-settings-rail`, `output-modal`. tasks: T-edit-9, T-edit-10, T-edit-11
[ADDED] Settings rail tabs: general, team, outputs, consumers at `/liveblog/settings/:id`. tasks: T-edit-10
[ADDED] `PostComposer` Poll block + embed provider preview. tasks: T-edit-9
[CHANGED] Poll save via liveblog-api `savePollForPost` (legacy vote-count parity)
[ADDED] Vitest: `detectProvider.test.ts`, `pollCalculations.test.ts`, poll in `blockTransform.test.ts`. tasks: T-edit-6
[ADDED] Smoke: `scripts/smoke-editor-phase4.mjs`. tasks: T-edit-12
[COMPLETED] Phase 4 editor subsystems (except live WS). tasks: T-edit-9, T-edit-10, T-edit-11, T-edit-12
[MILESTONE] Phase 4 — 100%
[NOTE] `useEditorWebSocket` remains stub — websocket-manager not implemented (T-edit-13)
[NOTE] `FreetypeFields` stub until freetypes-manager (Phase 6, T-edit-15)

## 2026-05-26 - Documentation sweep

[CHANGED] README File Structure aligned to implemented tree; Status and Current Implementation updated
[ADDED] Test report `plans/reports/tests/editor-manager/2026-05-26/`
[ADDED] Subsystem plan READMEs under `plans/mechanisms/editor-manager/subsystems/*/README.md`
[ADDED] Implementation report `plans/reports/implementation/2026-05-26-phase4-editor-subsystems.md`
[CHANGED] README Subsystems table links to per-subsystem docs; Components section Phase 4 entries
[MILESTONE] Phase 4 documentation — 100%

## 2026-05-26 - WebSocket integration (websocket-manager Phase 1)

[CHANGED] `useEditorWebSocket` — real `useWsEvent` subscriptions; removed stub console.warn. tasks: T-edit-13
[CHANGED] `posts` events debounced 400ms before `timelineApi.fetchNewPage()`. tasks: T-edit-14
[ADDED] Subscriptions: `posts`, `blog`, `embed_generation_error`, `removing_timeline_post` (blog-scoped where applicable)
[COMPLETED] Real-time timeline via websocket-manager. tasks: T-edit-13, T-edit-14
[NOTE] Embed error UI throttle (3h localStorage) still legacy parity gap

## 2026-05-26 - Live preview UX (Maroela parity)

[ADDED] `EditorViewMode` (`edit` | `split` | `preview`) with `EditorViewModeSwitch` in editor chrome. tasks: T-edit-16
[ADDED] `BlogLivePreviewPane`, `PreviewPostItem`, `PollPreviewBlock`, `composerPreview` service. tasks: T-edit-17
[ADDED] Split layout: composer + live preview side-by-side; timeline below on large screens. tasks: T-edit-16
[ADDED] Device preview toolbar (desktop / tablet / mobile) and optional `public_url` link. tasks: T-edit-17
[ADDED] Vitest: `composerPreview.test.ts`, `EditorViewModeSwitch.test.tsx`. tasks: T-edit-18

## 2026-05-26 - Preview shows full timeline (fix)

[CHANGED] Split/preview modes render **all timeline posts with PostCard controls** inside the preview pane — not a blog card stub. tasks: T-edit-17
[CHANGED] Removed duplicate squeezed timeline row below split view; classic **Redigeer** mode keeps composer + timeline. tasks: T-edit-16
[ADDED] `ComposerDraftPreview` — optional dashed draft block above published posts when editing. tasks: T-edit-17

## 2026-05-26 - Separate panels + representative preview frame

[CHANGED] Split view uses distinct **Redigeer** and **Voorskou** panels (gap, border, shadow) — not a single fused column. tasks: T-edit-16
[ADDED] `PreviewDeviceFrame`, `PreviewBlogHeader` — device bezels (desktop/tablet/phone) and live-blog masthead. tasks: T-edit-17
[CHANGED] Preview posts use `lb-post` live styling with hover action toolbar; editor timeline keeps admin cards. tasks: T-edit-17

## 2026-05-26 - Preview iframe + real phone width

[CHANGED] `PreviewDeviceFrame` — iframe clones app CSS; fixed widths (390 / 768 / 960 px) with scale-to-fit; phone bezel. tasks: T-edit-17
[ADDED] `src/styles/liveblog-preview.css` — unlayered preview rules (fixes cascade / missing styles). tasks: T-edit-17

## 2026-05-26 - Preview fixes (embeds, scroll, device height)

[CHANGED] Removed preview iframe — embeds render in-page again (Twitter/React widgets work). tasks: T-edit-17
[CHANGED] Phone/tablet fixed viewport (390×520 / 600×480) with scroll **inside** device only — no growing tall frame. tasks: T-edit-17
[CHANGED] Split view: editor locked to viewport; compose + preview panels scroll independently (`overscroll-behavior: contain`). tasks: T-edit-16
