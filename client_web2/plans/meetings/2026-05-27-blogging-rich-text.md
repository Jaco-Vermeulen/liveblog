# Meeting — Blogging UX + rich text editor documentation

**Date:** 2026-05-27  
**Type:** Implementation + documentation sweep

## Goals

1. Complete high-impact blogging flows (schedule, edit, unpublish, image, freetype, blog list scale).
2. Port Maroela article-editor formatting toolbar to Liveblog Text blocks.
3. Document all work per [DOCUMENTATION_PROCEDURES.md](../DOCUMENTATION_PROCEDURES.md).

## Outcomes

| Area | Result |
|------|--------|
| editor-manager | T-edit-19 … T-edit-25 complete; `rich-text-editor` subsystem |
| blog-list-manager | T-blog-9, T-blog-10, T-blog-12 |
| freetypes-manager | T-edit-15 pipeline + T-edit-23 Scorecard builtin |
| Tests | 142 Vitest; report `plans/reports/tests/editor-manager/2026-05-27/` |
| Implementation report | `plans/reports/implementation/2026-05-27-blogging-rich-text.md` |

## Decisions

- Rich text uses `contentEditable` + `execCommand` (Maroela parity), not TipTap.
- HTML stored in `item.text`; displayed via `EmbedHtml` (legacy admin parity).
- Toolbar: full-width flex, transparent bar, no inter-group gaps.

## Follow-ups

- Post reorder on timeline
- Rich text smoke script
- HTML sanitization policy (if security review requires)
