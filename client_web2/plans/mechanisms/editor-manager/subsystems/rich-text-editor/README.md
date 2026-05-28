# Rich Text Editor (editor subsystem)

Maroela-style formatting toolbar for Text and Quote composer blocks. For change history, see [../../CHANGELOG.md](../../CHANGELOG.md).

## Overview

Ports the **Story body** toolbar from Maroela `article-editor-manager` (`ArticleFieldsForm.tsx`) into the Liveblog post composer. Uses `contentEditable` and `document.execCommand` (not TipTap). Formatted content is stored as HTML in `PostItem.text` and rendered on the timeline/preview via **embed-handlers** `EmbedHtml`.

## Status

**Implemented (2026-05-27)** — `RichTextBlockEditor`, `richTextHtml` helpers, toolbar flex layout, Vitest. tasks: T-edit-24, T-edit-25

## Purpose

- Provide bold, italic, underline, headings (H2/H3), lists, blockquote, alignment, link/unlink, clear formatting, undo/redo for Text blocks
- Match Maroela article editor UX (grouped toolbar, Afrikaans labels, explicit bold-on-selection)
- Normalize empty HTML (`<br>`, `&nbsp;`) so blank blocks do not publish
- Render saved HTML on timeline (`PostCard`), live preview (`PreviewPostItem`, `ThemedPostCard`)

## Dependencies

- **style-guide** — toolbar and body tokens in `src/index.css` (`.m-rich-text-editor__*`)
- **embed-handlers** — `EmbedHtml` for safe-ish HTML display (legacy parity with jQuery `.html()`)
- **editor-manager** `blockTransform` — `blockTextValue()` strips empty HTML before `blocksToPostItems`

## Dependents

- **post-composer** — `PostComposer.tsx` mounts `RichTextBlockEditor` for `Text` and `Quote` blocks
- **PreviewPostItem**, **PostCard**, **ThemedPostCard** — `isRichTextHtml()` branch

## Technical Specification

### Components

| Export | Role |
|--------|------|
| `RichTextBlockEditor` | Controlled `contentEditable` + toolbar |
| `isRichTextHtml` | Detect HTML vs plain text for display |
| `normalizeRichTextHtml` | Trim; map empty markup to `''` |
| `isEmptyRichTextHtml` | True for `<br>` / whitespace-only markup |

### Props (`RichTextBlockEditor`)

```typescript
interface RichTextBlockEditorProps {
  value: string;           // HTML or legacy plain text
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
}
```

### Toolbar groups (flex, full width)

| Label | Commands |
|-------|----------|
| Font | Bold (selection only), Italic, Underline |
| Style | H2, H3, Paragraph (`formatBlock` P) |
| Paragraaf | Bullet list, ordered list, blockquote |
| Belyn | justifyLeft/Center/Right/Full |
| Wysig | createLink (prompt), unlink, removeFormat |
| Geskiedenis | Custom undo stack + `execCommand` undo/redo fallback |

### Behaviour (Maroela parity)

- **Sticky bold blocked** — `beforeinput` / Ctrl+B clears accidental bold mode; explicit toolbar bold requires non-collapsed selection
- **Undo stack** — up to 100 snapshots on input; Ctrl+Z/Y when stack non-empty
- **styleWithCSS** — forced `false` after commands for legacy-compatible markup
- **Blur** — composer calls `onRemoveBlockIfEmpty` when block is empty HTML

### Data flow

1. User types in `contentEditable` → `onInput` → `normalizeRichTextHtml` → `onChange` → `block.data.text`
2. Publish → `blockTransform` `blockTextValue()` → `{ item_type: 'text', text: '<p>…</p>' }`
3. Timeline → `isRichTextHtml(text)` → `<EmbedHtml html={text} />`

### CSS classes

| Class | Role |
|-------|------|
| `.m-rich-text-editor` | Outer frame (border, width 100%) |
| `.m-rich-text-editor__toolbar` | Flex row; transparent background |
| `.m-rich-text-editor__group` | `flex: 1 1 0` — equal width segments |
| `.m-rich-text-editor__group-btns` | Flex row; buttons `flex: 1` |
| `.m-rich-text-editor__body` | `contentEditable` area |

## File Structure

The subsystem is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/editor-manager/subsystems/rich-text-editor/
├── index.ts                      # Public exports
├── RichTextBlockEditor.tsx       # Toolbar + contentEditable editor
├── richTextHtml.ts               # isRichTextHtml, normalize, isEmpty
└── richTextHtml.test.ts          # Vitest
```

Related (parent mechanism):

```
mechanisms/editor-manager/
├── components/PostComposer.tsx     # Mounts RichTextBlockEditor
├── components/PreviewPostItem.tsx  # EmbedHtml for HTML text
├── components/PostCard.tsx
├── components/ThemedPostCard.tsx
├── services/blockTransform.ts      # blockTextValue for Text/Quote
└── services/blockTransform.richText.test.ts
```

Styles: `src/index.css` — `.m-rich-text-editor__*` block (editor layer).

## Design Decisions

- **execCommand over TipTap** — matches Maroela web2 article editor; avoids new dependency; legacy Sir Trevor also produced HTML strings
- **HTML in `item.text`** — same field as legacy Sir Trevor text blocks; public embed already renders HTML via theme templates
- **EmbedHtml for display** — reuses embed subsystem DOM injection + iframely activation pattern; not a sanitizer (legacy did not sanitize in admin)
- **No toolbar background** — user request; groups share borders only; flex fill width
- **Plain text backward compatible** — posts without tags still render as `<p>{text}</p>`

## Legacy reference

- Maroela: `maroela_web2/src/mechanisms/article-editor-manager/components/ArticleFieldsForm.tsx`
- Liveblog legacy: `client/app/scripts/liveblog-edit` — Sir Trevor Text block (`ng-sir-trevor`)

## Testing Requirements

| Level | Scope |
|-------|--------|
| L1 | `richTextHtml.test.ts`, `blockTransform.richText.test.ts` |
| L2 | `npm test` full client_web2 suite |
| L3 | Manual: compose bold/list/link post; verify timeline + split preview render HTML |

## Tasks

Parent: [../../TASKS.md](../../TASKS.md) — (T-edit-24) rich text composer; (T-edit-25) toolbar flex layout
