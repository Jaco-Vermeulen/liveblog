# Implementation Report — Blogging completion + rich text editor

**Date:** 2026-05-27  
**Scope:** editor-manager, blog-list-manager, freetypes-manager (builtin), cross-cutting docs

## Summary

Completed end-to-end blogging UX improvements and ported Maroela article-editor formatting tools into the Liveblog post composer.

## editor-manager

| Feature | Tasks | Key paths |
|---------|-------|-----------|
| Schedule posts | T-edit-19 | `services/composerSchedule.ts`, `PostComposer` datetime-local |
| Edit mode UX | T-edit-20 | Banner + cancel in `PostComposer`, `usePostComposer.isEditing` |
| Unpublish | T-edit-21 | `usePosts.unpublishPost`, `PostCard` EyeOff action |
| Image block | T-edit-22 | `blockTransform` Image case, composer URL field |
| Rich text toolbar | T-edit-24, T-edit-25 | `subsystems/rich-text-editor/` |
| Freetype composer | T-edit-15 | `freetype-fields/`, freetypes-manager utils |
| Scorecard builtin | T-edit-23 | `freetypes-manager/builtinFreetypes.ts` |

### Rich text editor

- **Reference:** Maroela `ArticleFieldsForm.tsx` (`contentEditable` + `execCommand`)
- **Storage:** HTML in `PostItem.text` for Text/Quote blocks
- **Display:** `EmbedHtml` when `isRichTextHtml(text)`
- **Toolbar UI:** Full-width flex groups, no toolbar background, flush buttons

## blog-list-manager

| Feature | Tasks | Key paths |
|---------|-------|-----------|
| Server search | T-blog-10 | `liveblog-api/endpoints/blogs.ts` ES `query_string` |
| Pagination | T-blog-12 | `BlogListPagination.tsx`, `useBlogList` page state |
| Access request | T-blog-9 | `AccessRequestModal.tsx`, `endpoints/membership.ts` |
| WS refresh | T-ws-10 | `hooks/useBlogListWebSocket.ts` |

## Verification

| Check | Result |
|-------|--------|
| `npm test` (client_web2) | 142 tests pass (2026-05-27) |
| `npm run build` | pass |
| Smokes | `smoke-editor.mjs`, `smoke-phase6.mjs` (prior session) |

## Documentation updated

| Artifact | Path |
|----------|------|
| Subsystem README | `plans/mechanisms/editor-manager/subsystems/rich-text-editor/README.md` |
| Mechanism README | `plans/mechanisms/editor-manager/README.md` |
| TASKS / CHANGELOG / COMMENTS | editor-manager, blog-list-manager |
| freetype-fields README | stub → implemented |
| Test report | `plans/reports/tests/editor-manager/2026-05-27/` |
| Global | `plans/CHANGELOG.md`, `plans/KNOWLEDGE_GRAPH.md`, `plans/COMPONENT_INVENTORY.md` |

## Open follow-ups

- Post reorder on timeline (legacy drag)
- Syndication ingest panel WS consumer
- Ad freetypes beyond Scorecard builtin
- HTML sanitization policy (if required for public embed security review)
