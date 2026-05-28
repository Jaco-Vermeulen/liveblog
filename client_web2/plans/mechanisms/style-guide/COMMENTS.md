# Style Guide — Comments

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client/app/styles/tailwind/portal.css`

## 2026-05-26 — Phase 1 implementation

- Layout components live under `src/components/layout/` (owned by style-guide, consumed by navigation-manager).
- UI components under `src/components/ui/` with barrel `index.ts`.
- **Critical fix:** `@source` directive required — without it Tailwind only generated ~11KB CSS and login/shell appeared unstyled.
- User rejected separate `.css` files and gradients; all styling is Tailwind utilities + `@theme` tokens.
- `COMPONENT_INVENTORY.md` added at plans root for quick agent reference.
