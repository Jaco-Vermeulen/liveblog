# Blog Settings Rail (editor subsystem)

Tabbed blog settings UI at `/liveblog/settings/:id`. For change history, see [../../CHANGELOG.md](../../CHANGELOG.md).

## Overview

Ports legacy `BlogSettingsController` + `views/settings.ng1` — general metadata, team, output channels, consumer tag filters. Instance-level settings remain in **settings-manager**.

## Status

**Implemented (2026-05-26)** — four tabs via `SettingsRail`; data via `useBlogSettings` + **liveblog-api**.

## Purpose

- **General** — title, description PATCH on blog
- **Team** — list members; PATCH `blog.members` from user picker
- **Outputs** — list/create/edit/delete output channels per blog
- **Consumers** — list instance consumers; PATCH `blog.consumers_settings` tags per consumer

## Dependencies

- **liveblog-api** — blogs PATCH, outputs, consumers, users list
- **auth-manager** — session required (route behind `ProtectedRoute`)
- **style-guide** — settings rail CSS (`m-settings-rail*` in `index.css`)

## File Structure

```
mechanisms/editor-manager/
├── routes/SettingsPage.tsx              # Orchestrates rail + modals
├── hooks/useBlogSettings.ts             # TanStack Query for outputs/consumers/users
└── subsystems/blog-settings-rail/
    ├── index.ts
    ├── SettingsRail.tsx               # Tab shell
    ├── GeneralSettings.tsx
    ├── MembersSettings.tsx
    ├── OutputsTab.tsx
    └── ConsumersList.tsx
```

## Routes

| Path | Legacy |
|------|--------|
| `/liveblog/settings/:id` | `/liveblog/settings/:_id` |

## Legacy reference

- `client/app/scripts/liveblog-edit/controllers/blog-settings.js`
- `client/app/scripts/liveblog-edit/views/settings.ng1`
- `client/app/scripts/liveblog-edit/directives/settings-consumer-list.ts`

## Tasks

Parent: [../../TASKS.md](../../TASKS.md) — (T-edit-10)
