# User Manager — Changelog

## 2026-05-27 - Reactivate disabled users

[ADDED] `Heraktiveer` button on `/users` for soft-deleted users (`is_enabled: false`); optional password-reset e-mail. tasks: T-user-9

## 2026-05-27 - Invite flow (no admin password)

[CHANGED] New users created without password; `requestPasswordReset` sends activation e-mail after create. tasks: T-user-8
[ADDED] Admin “Stuur wagwoord-herstel-e-pos” on existing users. tasks: T-user-8
[REMOVED] Password field from new-user modal. tasks: T-user-8

## 2026-05-27

[ADDED] user-manager mechanism — `/users` admin list, create/edit modal, activate/deactivate, role assignment. tasks: T-user-1 through T-user-7

[ADDED] liveblog-api `searchUsers`, `createUser`, `disableUser`, `CreateUserBody`, `UserAdminUpdate`. tasks: T-user-1

[ADDED] navigation `Gebruikersbestuur` nav item; `PrivilegesProvider.canManageUsers`. tasks: T-user-4
