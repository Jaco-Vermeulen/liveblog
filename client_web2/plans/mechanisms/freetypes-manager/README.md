# Freetypes Manager

Custom post type templates (free types) with variable placeholders. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-freetypes`: admin page at `/freetypes/` listing freetypes, create/edit modal with template editor, validation requiring at least one `$variable`, elastic search usage check via `items` API, and feature flag `freetypes_manager`.

## Status

**Phase 6 implemented (2026-05-26)** — `/freetypes` list + CRUD modal; editor freetype render still stub.

## Purpose

- Free types manager at `/freetypes/` (`global_preferences` privilege)
- List all `freetypes`; create, edit, remove
- **Template validation:** must match `/\$([$a-z0-9_.[\]]+)/gi` — at least one `$variable` (document link to freetype docs in error copy)
- **Unique name** enforcement across freetypes
- **Usage check:** before edit/remove, query `items` with elastic `term` filter on `item_type` === freetype `name`; if used, confirm modal warning
- Feature gate: `freetypes_manager` via `featuresService` (upgrade mailto when disabled)
- Privilege `freetypes_delete` for remove

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-freetypes` — `LiveblogFreetypesController`, `list.ng1` modal
- **Web2:** Planned — see File Structure

## Liveblog server / API

| Resource | Methods | Usage |
|----------|---------|--------|
| `freetypes` | `GET` query, `save`, `remove` | CRUD name + template |
| `items` | `GET` query | Usage check: `max_results: 1`, elastic filtered query `item_type` term |

**Route:**

| Path | Label |
|------|-------|
| `/freetypes/` | Free types manager |

**Save payload:**

```typescript
{ name: string; template: string }
```

**Template rules:**

- Must contain at least one `$variable` (regex above)
- Server may return `_issues.template` — surface to user (legacy 10s notify)

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED) — `freetypes_delete`
- **style-guide** (REQUIRED)

## Dependents

- **advertising-manager** — freetype template rendering for adverts
- **editor-manager** — custom post types in editor use freetype definitions

## Technical Specification

```typescript
interface Freetype {
  _id?: string;
  name: string;
  template: string;
  isUsed?: boolean;  // client-side after items query
}

interface FreetypesManagerApi {
  listFreetypes(): Promise<Freetype[]>;
  saveFreetype(existing: Freetype | null, payload: { name: string; template: string }): Promise<Freetype>;
  removeFreetype(freetype: Freetype): Promise<void>;
  checkFreetypeUsed(name: string): Promise<boolean>;
}

const FREETYPE_VARIABLE_PATTERN = /\$([$a-z0-9_.[\]]+)/gi;

function validateFreetypeTemplate(template: string): {
  valid: boolean;
  error?: 'missing_variable' | 'server_issue';
};

function validateFreetypeName(name: string, freetypes: Freetype[], editingId?: string): boolean;

function useFreetypesManager(): {
  freetypes: Freetype[];
  modalOpen: boolean;
  editing: Freetype | null;
  dialog: { name: string; template: string; loading: boolean };
  isFeatureEnabled: boolean;
  openDialog(freetype?: Freetype): Promise<void>;
  save(): Promise<void>;
  remove(freetype: Freetype, index: number): Promise<void>;
};
```

**Usage query (legacy):**

```json
{
  "max_results": 1,
  "source": {
    "query": {
      "filtered": {
        "filter": {
          "and": [{ "term": { "item_type": "<freetype.name>" } }]
        }
      }
    }
  }
}
```

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/freetypes-manager/
├── index.ts                      # Public exports
├── types.ts                      # Freetype
├── api/
│   └── freetypesApi.ts           # freetypes + items usage check
├── hooks/
│   └── useFreetypesManager.ts    # List, modal, save, remove
├── utils/
│   ├── validateTemplate.ts       # $variable requirement
│   └── validateName.ts           # Unique name
├── components/
│   ├── FreetypesPage.tsx         # List page (style-guide)
│   ├── FreetypeModal.tsx         # Create/edit form
│   └── FreetypeList.tsx          # Table with used badge
└── routes.tsx                    # /freetypes/
```

## Design Decisions

- **$variables required:** Block save client-side before API call; match legacy error message about documentation
- **isUsed flag:** Computed per freetype on list load (N+1 queries in legacy) — web2 may batch or lazy-check on edit only for performance
- **Edit warning:** If `isUsed`, confirm before opening modal (legacy `checkItemIsUsed`)
- **Feature flag:** Hide or show upgrade CTA when `freetypes_manager` disabled
- **Render helper:** Export variable substitution util for **advertising-manager** (port of `freetypeService.htmlContent` concept)

## Implementation Approach

1. `freetypesApi` + validation utils
2. `FreetypesPage` + modal with template textarea
3. Wire feature flag from server config/features endpoint (when available in web2)
4. Document `$variable` syntax in mechanism COMMENTS.md
5. API + E2E tests

Phase **6** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Purpose | Styling |
|-----------|---------|---------|
| `FreetypesPage` | Manager shell | style-guide |
| `FreetypeList` | Rows with used indicator | table |
| `FreetypeModal` | name + template fields | monospace template editor |

## Usage Examples

```typescript
import { FreetypesPage, validateFreetypeTemplate } from '@/mechanisms/freetypes-manager';

{ path: '/freetypes', element: <FreetypesPage /> }

if (!validateFreetypeTemplate(template).valid) {
  // show: Template must contain at least one variable!
}
```

## Data Flow

```
FreetypesPage mount
  → freetypesApi.listFreetypes
  → for each (or on demand): checkFreetypeUsed → set isUsed
openDialog(freetype)
  → checkFreetypeUsed → confirm if used
save
  → validateTemplate + validateName
  → freetypesApi.saveFreetype
```

## Error Handling Strategy

- Missing `$variable`: client notify before save
- Duplicate name: client notify “Free types titles must be unique”
- Server `_issues.template`: display server message (10s legacy)
- Remove failure: “Can't remove free type”
- Used-template edit: confirm HTML message about active live blogs

## Related Mechanisms

- [advertising-manager](../advertising-manager/README.md)
- [editor-manager](../editor-manager/README.md)
- [liveblog-api](../liveblog-api/README.md)

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: `FREETYPE_VARIABLE_PATTERN`; unique name; validateTemplate failures |
| **2** | API: `GET/POST freetypes`; `GET items` with item_type filter |
| **3** | E2E: create freetype with `$title`; reject template without `$`; edit used freetype shows confirm |

## Legacy reference

`client/app/scripts/liveblog-freetypes`

- `module.js` — `/freetypes/` activity, API provider, `LiveblogFreetypesController`
- `views/list.ng1` — list + modal
- `preSaveChecks` — `$variable` regex and unique name
- `getFreetypes` + `items.query` elastic usage check
- Feature: `featuresService.isEnabled('freetypes_manager')`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
