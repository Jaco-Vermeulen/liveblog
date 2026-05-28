# Auth Manager — Comments

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `superdesk-core/scripts/core/auth`, `client/app/template/core/auth/login-modal.html`

## 2026-05-26 — Phase 1c complete

LoginPage (Maroela split layout, Afrikaans), AuthProvider, ProtectedRoute wired. Reset-password routes deferred.

## 2026-05-26 — Login UX notes

- Initial implementation used raw Tailwind on LoginPage; user required reusable components.
- Brief `maroela-login.css` attempt reverted — **Tailwind + Lb* components only**.
- Final login uses `LbAuthCard`, `LbAuthForm`, brand panel from `@/components/layout`.
- **No gradients** on login or brand panel (solid `bg-mar-teal`).
