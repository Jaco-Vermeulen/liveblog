# Meeting notes — Phase 1 implementation complete

**Date:** 2026-05-26  
**Topic:** client_web2 Phase 1 foundation + shell

## Decisions

1. **No CSS files for feature UI** — Tailwind utilities only; `@source` in `index.css` required for full class generation.
2. **No gradients in web2** — solid Maroela tokens only (`bg-mar-teal`, etc.); legacy gradients not ported.
3. **Component ownership** — reusable primitives in `src/components/ui/` and `src/components/layout/` (style-guide); feature logic in `src/mechanisms/<name>/`.
4. **LbAuthCard** — dedicated login surface; generic `LbPanelCard` for admin panels.
5. **Shell via navigation-manager** — all authenticated routes use `AppShell` + `<Outlet />`; placeholders until feature mechanisms ship.

## Known issues / follow-ups

- `react-refresh/only-export-components` warnings on `AuthProvider` (non-blocking).
- Marketplace/syndication nav always visible in dev; feature flags to tighten in Phase 6.
- About modal (“Oor Regstreekse blog”) not implemented — footer button stub.

## References

- Report: [reports/implementation/2026-05-26-phase1-foundation.md](../reports/implementation/2026-05-26-phase1-foundation.md)
- Tests: [reports/tests/phase1/2026-05-26/test-summary.md](../reports/tests/phase1/2026-05-26/test-summary.md)
- Component index: [COMPONENT_INVENTORY.md](../COMPONENT_INVENTORY.md)
