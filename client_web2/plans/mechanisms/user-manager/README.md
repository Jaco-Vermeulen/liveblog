# User Manager

Superdesk-style admin user management for Liveblog — list, create, edit, activate/deactivate users. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `superdesk.apps.users` admin (not the self-service profile in **auth-manager**). Administrators with privilege `users` manage accounts via `/users`: search, create with password, edit roles and author fields, toggle active status, and disable users (HTTP DELETE).

## Status

**Implemented (2026-05-27)** — `UsersManagerPage`, `UserEditModal`, `useUsersManager`, liveblog-api `searchUsers` / `createUser` / `disableUser`.

## Purpose

- List and search users (`GET /users` with `where` / `sort`)
- Create users (`POST /users` without password — activation e-mail via `POST /reset_user_password`)
- Edit users (`PATCH /users/:id` with etag)
- Toggle `is_active` and disable users (`DELETE /users/:id` — soft delete, sets `is_enabled` + `is_active` false)
- **Heraktiveer** disabled users (`PATCH` `is_enabled` + `is_active` true; optional reset e-mail)
- Assign roles (`GET /roles`) for non-administrator accounts
- Gate UI behind privilege `users: 1` (administrators bypass)

## Current Implementation

- **Legacy:** `superdesk-core/scripts/apps/users` — user list activity, edit form `client/app/template/superdesk-override/apps/users/views/edit-form.html`, privilege `privileges.users`
- **Web2:** `src/mechanisms/user-manager/` — React page at `/users`; profile for current user remains **auth-manager** `/profile`

## Liveblog server / API

| Resource | Methods | Usage |
|----------|---------|--------|
| `users` | `GET`, `POST`, `PATCH`, `DELETE` | CRUD + disable |
| `roles` | `GET` | Role dropdown |
| `change_user_password` | `POST` | auth-manager profile only |

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED) — `PrivilegeRoute`, `usePrivileges`
- **style-guide** (REQUIRED)

## Dependents

- **navigation-manager** — admin nav link when `canManageUsers`

## Technical Specification

| React path | Legacy | Privilege |
|------------|--------|-----------|
| `/users` | Superdesk users list | `users: 1` |

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/user-manager/
├── index.ts
├── hooks/
│   └── useUsersManager.ts
├── components/
│   ├── UsersManagerPage.tsx
│   └── UserEditModal.tsx
└── utils/
    ├── userForm.ts
    └── userForm.test.ts
```

## Legacy reference

- `client/app/scripts/index.js` — `superdesk.apps.users`
- `client/app/template/superdesk-override/apps/users/views/edit-form.html`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
