# User Manager — Tasks

## Phase 1

- [x] (T-user-1) Extend liveblog-api: `searchUsers`, `createUser`, `disableUser`, `UserAdminUpdate`
- [x] (T-user-2) `useUsersManager` hook + `userForm` utils
- [x] (T-user-3) `UsersManagerPage` + `UserEditModal`
- [x] (T-user-4) Route `/users` + `PrivilegeRoute` + nav item
- [x] (T-user-5) Vitest `userForm.test.ts`, `nav-config` users privilege
- [x] (T-user-6) Smoke `scripts/smoke-user-manager.mjs`
- [x] (T-user-7) Mechanism README, CHANGELOG, COMMENTS
- [COMPLETED] User manager Phase 1. tasks: T-user-1 through T-user-7

## Phase 2 — Invite / reset e-mail

- [x] (T-user-8) Create user without password; send `reset_user_password` e-mail; admin reset button
- [COMPLETED] Invite flow. tasks: T-user-8

## Phase 2 — Reactivate disabled users

- [x] (T-user-9) `Heraktiveer` on `/users` for `is_enabled: false` (PATCH + optional reset e-mail)
- [COMPLETED] Reactivate disabled users. tasks: T-user-9
