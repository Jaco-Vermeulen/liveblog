# Auth Manager

User authentication, session persistence, and route protection for Liveblog admin — porting Superdesk `core.auth` to React. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Login, logout, session storage, and privilege checks for the client_web2 admin. Replaces the Superdesk auth module and Maroela-branded `login-modal.html` with a React `AuthProvider`, `LoginPage`, and protected-route wrapper. All auth HTTP calls go through **liveblog-api** and **request-logger**.

## Status

**Phase 1 implemented** — `AuthProvider`, `LoginPage`, `ProtectedRoute`, Superdesk `sess:*` session parity. Login uses `LbAuthCard` + layout split (`@/components/layout`). Routes: `/login` (public); authenticated routes via `navigation-manager` AppShell.

**Phase 2 profile** — `ProfilePage` at `/profile` (edit name, email, phone, author fields, avatar upload, change password via `change_user_password`).

**Password reset (2026-05-27)** — `ResetPasswordPage` at `/reset-password` (request e-mail, complete reset from token). Login links to forgot-password. E-mail links use server `CLIENT_URL` (`SUPERDESK_CLIENT_URL`); set to `http://localhost:9001` for web2 dev so links hit this app (legacy hash `?token=` supported).

## Purpose

- Render Maroela-branded login page (Afrikaans copy, split brand/form layout)
- Authenticate against Liveblog `auth_db` REST endpoint
- Persist session in `localStorage` (`sess:token`, `sess:user`, `sess:id`, `sess:href`)
- Expose auth context via `useAuth` for protected routes and user menu
- Redirect unauthenticated users to `/login`
- Handle 401 session expiry and logout (DELETE session, clear storage)
- Boot-time stale-session cleanup (token missing but user present)

## Current Implementation

- **Legacy:** `superdesk-core/scripts/core/auth` — `auth.js`, `session-service.js`, `auth-service.js`, `basic-auth-adapter.js`, `login-modal-directive.js`. Liveblog wiring in `client/app/scripts/index.js` (module import, stale-session cleanup, post-login redirect to `/liveblog`). Maroela login template override: `client/app/template/core/auth/login-modal.html` (webpack alias in `client/webpack.config.js`). Styles: `client/app/styles/sass/maroela-ui.scss`, `portal.css` login overrides.
- **Web2:** `src/mechanisms/auth-manager/` — `AuthProvider`, `LoginPage`, `ProtectedRoute`, `sessionStorage.ts` (localStorage `sess:*` keys), `authApi`. Public `/login`; authenticated routes wrapped by `navigation-manager` AppShell.

## Liveblog server / API

All HTTP via **liveblog-api** (no raw `fetch`). Base: `http://localhost:5000/api` (Vite proxy `/api`).

| Resource | Method | Purpose |
|----------|--------|---------|
| `auth_db` | `POST` | Login — body `{ username, password }`; returns session token |
| `users/:id` | `GET` | Fetch user profile after login |
| `auth/:sessionId` | `DELETE` | Logout — remove server session using `sess:href` / `sess:id` |

**Session token format:** `Basic ` + `btoa(token + ':')` stored in `sess:token`; sent as `Authorization` header on subsequent requests.

**Default credentials (local Docker):** `admin` / `admin`

## Dependencies

- **liveblog-api** (REQUIRED) — `auth_db`, `users` endpoints
- **request-logger** (REQUIRED) — all auth HTTP logged
- **style-guide** (REQUIRED) — Maroela login layout, form inputs, buttons

## Dependents

- **navigation-manager** — user menu, sign-out, protected shell
- **blog-list-manager** — blog-level permission checks via session user
- **editor-manager**, **settings-manager**, **themes-manager**, and all protected feature mechanisms

## Technical Specification

### Routes

| React Router path | Legacy | Auth required |
|-------------------|--------|---------------|
| `/login` | Login modal (global overlay) | No |
| `/reset-password` | `/reset-password/` | No |
| `/secure-login` | `/secure-login/` | No |
| All other routes | Superdesk activities (`auth: true` default) | Yes |

Legacy explicit `auth: true`: `/liveblog/edit/:_id`, `/liveblog/settings/:_id`, `/liveblog/analytics/:_id`. All other Liveblog activities inherit default `auth: true`.

Post-login default redirect: `/liveblog` (legacy `superdesk.config.js`).

### Core types

```typescript
interface LiveblogUser {
  _id: string;
  username: string;
  display_name?: string;
  email?: string;
  user_type?: 'administrator' | 'user' | string;
  is_active?: boolean;
  avatar?: string;
}

interface SessionData {
  _id: string;
  token: string;
  user: string;
  _links?: {
    self?: { href: string };
  };
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LiveblogUser | null;
  token: string | null;
  sessionId: string | null;
  sessionHref: string | null;
}

interface AuthContextValue {
  state: AuthState;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}

/** localStorage keys — match Superdesk session-service */
const SESSION_KEYS = {
  token: 'sess:token',
  user: 'sess:user',
  id: 'sess:id',
  href: 'sess:href',
} as const;
```

### Session service

```typescript
interface SessionStorage {
  read(): Pick<AuthState, 'token' | 'user' | 'sessionId' | 'sessionHref'>;
  write(session: SessionData, user: LiveblogUser): void;
  clear(): void;
  /** Legacy boot guard: clear all keys if token missing but user present */
  reconcileStaleSession(): void;
}

function formatAuthHeader(token: string): string;
// Returns `Basic ${btoa(token + ':')}`
```

### Auth provider and hook

```typescript
function AuthProvider(props: { children: React.ReactNode }): JSX.Element;

function useAuth(): AuthContextValue;

function ProtectedRoute(props: {
  children: React.ReactNode;
  redirectTo?: string; // default '/login'
}): JSX.Element;
```

### Login flow

1. User submits username/password on `LoginPage`
2. `login()` → `liveblogApi.auth.login({ username, password })` → `POST /auth_db`
3. On success: format token, `GET /users/:id`, write all four `sess:*` keys
4. Update `AuthState`; navigate to `/liveblog` (or `location.state.from`)
5. On failure: surface Afrikaans error messages matching legacy (401 invalid, 403 suspended, 404 not found, network)

### Logout flow

1. `logout()` → `DELETE` session via `sess:href` or `auth/:sessionId`
2. `sessionStorage.clear()` — remove all `sess:*` keys
3. Reset `AuthState`; navigate to `/login` or `/`

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/auth-manager/
├── index.ts                      # Public exports: AuthProvider, useAuth, ProtectedRoute, LoginPage
├── types.ts                      # AuthState, LiveblogUser, SessionData, SESSION_KEYS
├── services/
│   ├── sessionStorage.ts         # localStorage read/write/clear, stale-session reconcile
│   └── authApi.ts                # liveblog-api wrappers: login, logout, getUser
├── context/
│   └── AuthProvider.tsx          # Session provider, boot reconcile, 401 handler
├── hooks/
│   └── useAuth.ts                # Auth context consumer
├── components/
│   ├── LoginPage.tsx             # Maroela split login (LbAuthCard + layout)
│   └── ProtectedRoute.tsx        # Redirect when !isAuthenticated
```

## Design Decisions

- **localStorage parity** — use exact Superdesk keys (`sess:token`, `sess:user`, `sess:id`, `sess:href`) so dev can compare legacy vs web2 sessions during migration
- **No raw fetch** — all HTTP through **liveblog-api** + **request-logger**
- **Maroela login UX** — replicate `login-modal.html` split layout, Afrikaans copy, brand panel with logo; tokens from **style-guide**
- **Stale session guard** — on boot, if `sess:token` missing but `sess:user` present, clear all four keys (legacy `index.js` behaviour)
- **401 interceptor** — liveblog-api client calls `auth.expire()` on 401; AuthProvider clears session and redirects to login
- **Default redirect** — successful login navigates to `/liveblog`
- **Unauthenticated routes** — only `/login`, `/reset-password`, `/secure-login` are public in Phase 1

## Implementation Approach

Phase 1 per [plans/README.md](../../README.md#implementation-phases).

1. **Scaffold** — `types.ts`, `sessionStorage.ts`, `SESSION_KEYS`
2. **API layer** — `authApi.ts` via liveblog-api; smoke-test `POST /auth_db` with `admin`/`admin`
3. **AuthProvider** — boot read, stale reconcile, login/logout, context value
4. **LoginPage** — Maroela brand panel + form; Afrikaans labels/errors; style-guide inputs/buttons
5. **ProtectedRoute** — wrap navigation-manager shell routes
6. **App wiring** — wrap `App` in `AuthProvider`; add `/login` route; default `*` → protected shell
7. **Tests + smoke** — Vitest unit tests for sessionStorage; full-stack login smoke on Docker :5000/:9001

## Components

All components use **style-guide** tokens and `Lb*` primitives. Legacy reference: `login-modal.html`, `maroela-ui.scss`.

### LoginPage

- **Purpose:** Full-page Maroela login — brand panel (left) + credentials form (right)
- **Location:** `components/LoginPage.tsx`
- **Props:** none (uses `useAuth().login`, `useNavigate`)
- **Styling:** `maroela-login` layout equivalents — teal gradient brand panel, `maroela-logo.svg`, form panel with `LbButton` primary submit (`Meld aan`), Afrikaans field labels (`Gebruikersnaam`, `Wagwoord`)

### ProtectedRoute

- **Purpose:** Guard authenticated routes; redirect to `/login` with return path
- **Location:** `components/ProtectedRoute.tsx`
- **Props:** `{ children: React.ReactNode; redirectTo?: string }`
- **Styling:** none (pass-through wrapper)

## Usage Examples

```tsx
import { AuthProvider, ProtectedRoute, LoginPage } from '@/mechanisms/auth-manager';

function AppRoot() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
```

```tsx
import { useAuth } from '@/mechanisms/auth-manager';

function UserMenu() {
  const { state, logout } = useAuth();
  return (
    <div>
      <span>{state.user?.display_name ?? state.user?.username}</span>
      <button type="button" onClick={() => logout()}>Sign out</button>
    </div>
  );
}
```

## Data Flow

```
LoginPage form submit
  → authApi.login(username, password)
  → liveblog-api POST /auth_db  [request-logger]
  → format Basic token
  → liveblog-api GET /users/:id  [request-logger]
  → sessionStorage.write(sess:*)
  → AuthProvider state update
  → navigate /liveblog

Boot (AuthProvider mount)
  → sessionStorage.reconcileStaleSession()
  → sessionStorage.read()
  → if token: validate user loaded → isAuthenticated

Logout
  → authApi.logout(sessionHref)
  → liveblog-api DELETE session  [request-logger]
  → sessionStorage.clear()
  → navigate /login

401 on any API call
  → liveblog-api interceptor
  → AuthProvider.expire()
  → sessionStorage.clear()
  → redirect /login
```

## Error Handling Strategy

| Condition | User-facing message (Afrikaans) | Action |
|-----------|----------------------------------|--------|
| 401 invalid credentials | Invalid username/password | Show inline form error |
| 403 suspended account | Account suspended | Show inline form error |
| 404 user not found | User not found | Show inline form error |
| Network / server down | Connection error | Show retry message |
| 401 on authenticated request | Session expired | Clear session, redirect login |
| Logout failure | Silent | Clear local session anyway, redirect login |

All errors logged via **request-logger** with request id and status code.

## Related Mechanisms

- **[liveblog-api](../liveblog-api/)** — HTTP client for `auth_db`, `users`
- **[request-logger](../request-logger/)** — structured auth request/response logging
- **[style-guide](../style-guide/)** — login page tokens and form components
- **[navigation-manager](../navigation-manager/)** — user menu and sign-out in shell

## Testing Requirements

| Level | Scope | Expectation |
|-------|-------|-------------|
| **1 — Unit** | `sessionStorage`, token formatting, stale reconcile | Vitest; mock localStorage |
| **2 — Integration** | `AuthProvider` login/logout with mocked liveblog-api | Vitest + MSW or liveblog-api mocks |
| **3 — Smoke** | Full login against Docker stack | `admin`/`admin` → `/liveblog`; logout clears `sess:*`; 401 redirects to login |

Dev server: http://localhost:9001. API: http://localhost:5000/api.

## Legacy reference

- `superdesk-core/scripts/core/auth` — auth module, session service, login directive
- `client/app/template/core/auth/login-modal.html` — Maroela login template
- `client/app/scripts/index.js` — module registration, stale-session cleanup, post-login route

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
