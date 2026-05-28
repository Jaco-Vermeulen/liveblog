# Auth Manager — Changelog

## 2026-05-27 - White logo on teal e-mail header

[CHANGED] Reset-password e-mail uses `maroela-logo-email-white.png` (login-style white logo on teal); cream inlay removed. tasks: T-auth-22
[CHANGED] White logo PNG generated via Playwright + login CSS filters (not Sharp) so it matches `LbBrandLogo` exactly. tasks: T-auth-22
[ADDED] `client_web2/scripts/generate-email-white-logo.mjs`. tasks: T-auth-22

## 2026-05-27 - Password reset success modal

[ADDED] `PasswordResetSuccessModal` — dialog after e-mail request sent or password set. tasks: T-auth-21
[CHANGED] `ResetPasswordPage` — success modal replaces inline info banner. tasks: T-auth-21
[CHANGED] Server `liveblog/auth/__init__.py` — patch `superdesk.emails.send_reset_password_email` so branded CID mail always runs. tasks: T-auth-21

## 2026-05-27 - Branded Afrikaans password-reset e-mail

[CHANGED] `server/superdesk/templates/reset_password.*` — Maroela HTML (teal/accent), Afrikaans copy, CTA knoppie. tasks: T-auth-20
[CHANGED] `liveblog/auth/emails.py` — web2 link `/reset-password?token=` (not `/#/…`); logo from `{CLIENT_URL}/maroela-logo.svg`. tasks: T-auth-20
[CHANGED] `APP_NAME` default `Maroela Media Liveblog`. tasks: T-auth-20
[ADDED] Pytest `liveblog/auth/tests/emails_test.py`. tasks: T-auth-20

## 2026-05-27 - Login guard for users without password

[FIXED] Server `liveblog/auth/db.py` — invited users with no stored password return 401 (`CredentialsAuthError`) instead of 500 (`AttributeError` in superdesk-core + JSON handler). tasks: T-auth-19
[ADDED] Smoke `scripts/smoke-auth-no-password.mjs`; `npm run smoke:auth`; CI step after API up. tasks: T-auth-19
[ADDED] Pytest `server/liveblog/auth/tests/auth_db_test.py`. tasks: T-auth-19

## 2026-05-27 - Password reset + avatar

[ADDED] Full `ResetPasswordPage` — request e-mail, set password from token (query + legacy `/#/reset-password?token=`). tasks: T-auth-17
[ADDED] `liveblog-api` `requestPasswordReset`, `validatePasswordResetToken`, `completePasswordReset`, `uploadUserAvatar`, `userAvatarUrl`. tasks: T-auth-17, T-auth-18
[ADDED] `ProfileAvatar` on `/profile`; login “Wagwoord vergeet?” link. tasks: T-auth-17, T-auth-18
[ADDED] Smoke `scripts/smoke-password-reset.mjs`, `scripts/smoke-avatar-upload.mjs`. tasks: T-auth-17, T-auth-18

## 2026-05-27 - Profile management

[ADDED] `ProfilePage`, `useProfile`, `ChangePasswordModal`, `profileForm` helpers. tasks: T-auth-14
[ADDED] `liveblog-api` `updateUser`, `changeUserPassword`. tasks: T-auth-13
[CHANGED] `/profile` route uses real profile editor (was `PlaceholderPage`). tasks: T-auth-15
[ADDED] Smoke `scripts/smoke-profile-notifications.mjs`. tasks: T-auth-16

## 2026-05-27 - Launch: privileges + auth routes + E2E

[ADDED] `PrivilegesProvider`, `usePrivileges`, `PrivilegeRoute`, `privileges.ts` (administrator bypass + role merge). tasks: T-set-9, T-theme-10
[ADDED] `liveblog-api` `listRoles` / `getRole` endpoints
[ADDED] `/reset-password`, `/secure-login` route stubs. tasks: T-auth-10
[ADDED] Playwright E2E `e2e/login.spec.ts`. tasks: T-auth-11

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements

## 2026-05-26 - Phase 1 implementation

[ADDED] `src/mechanisms/auth-manager/` — AuthProvider, useAuth, ProtectedRoute, LoginPage. tasks: T-auth-2, T-auth-3, T-auth-4, T-auth-5
[ADDED] localStorage with Superdesk `sess:*` key parity. tasks: T-auth-3
[ADDED] App routes `/login`, protected shell via navigation-manager. tasks: T-auth-6
[ADDED] Vitest localStorage/session tests; Docker smoke auth_db 201. tasks: T-auth-7, T-auth-8
[COMPLETED] Phase 1 auth. tasks: T-auth-9

## 2026-05-26 - Login UX iteration

[CHANGED] LoginPage uses `LbAuthCard` + layout split (Tailwind only, no gradients). tasks: T-auth-5
[CHANGED] Removed separate CSS file approach per project directive. tasks: T-auth-5
