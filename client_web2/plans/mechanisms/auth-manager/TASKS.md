# Auth Manager — Tasks

## Phase 1

- [x] (T-auth-1) Review legacy module: `superdesk-core/scripts/core/auth`
- [x] (T-auth-2) Create `src/mechanisms/auth-manager/` scaffold
- [x] (T-auth-3) localStorage + authApi (Superdesk `sess:*` keys)
- [x] (T-auth-4) AuthProvider, useAuth, ProtectedRoute
- [x] (T-auth-5) LoginPage (Maroela split + LbAuthCard)
- [x] (T-auth-6) Wire routes (`/login`, protected shell routes)
- [x] (T-auth-7) Unit tests (sessionStorage.ts / localStorage)
- [x] (T-auth-8) Smoke test Docker login `admin`/`admin`
- [x] (T-auth-19) Smoke `smoke-auth-no-password.mjs` + server guard + CI/pytest
- [x] (T-auth-20) Afrikaans Maroela-branded password-reset e-mail + web2 reset URL
- [x] (T-auth-9) Update CHANGELOG + COMMENTS + README
- [COMPLETED] Phase 1 auth. tasks: T-auth-1 through T-auth-9

## Phase 1+

- [x] (T-auth-10) `/reset-password`, `/secure-login` route stubs
- [x] (T-auth-17) Full password reset flow + login link + smoke
- [x] (T-auth-18) Profile avatar upload via `/upload` + smoke
- [x] (T-auth-11) E2E login flow (Playwright)
- [ ] (T-auth-12) Split AuthProvider context to fix react-refresh warning

## Phase 2 — Profile

- [x] (T-auth-13) `liveblog-api` `updateUser`, `changeUserPassword`
- [x] (T-auth-14) `ProfilePage` + `useProfile` + change-password modal
- [x] (T-auth-15) Wire `/profile` route (replace placeholder)
- [x] (T-auth-16) Vitest `profileForm` + smoke `scripts/smoke-profile-notifications.mjs`
- [COMPLETED] Profile management. tasks: T-auth-13 through T-auth-16
