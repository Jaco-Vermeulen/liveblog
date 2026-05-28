# Settings Manager — Comments

## 2026-05-26 — WebSocket instance settings sync (T-set-12)

**Parity:** Legacy `liveblog-features.service.ts` reloads on `EventNames.InstanceSettingsUpdated`. Web2 `InstanceFeaturesProvider` calls `getInstanceSettingsCurrent()` on that WS event.

**Nav:** Marketplace/syndication visibility uses API `features` map (network subscription → all on). Env `VITE_MARKETPLACE` / `VITE_SYNDICATION` remain fallback while loading or if API fails.

**Instance JSON:** `useInstanceSettingsRemoteSync` reloads only when form is not dirty — avoids overwriting in-progress edits.

## 2026-05-26 — Phase 5

Implemented general settings (theme, tags, YouTube privacy, quotation marks, embed/toggles) and instance JSON editor. tasks: T-set-1 through T-set-8

**API:** Hooks call **liveblog-api** directly (no local `settingsApi.ts`). Batch save uses `Promise.all` over `saveGlobalPreference` per allowed key (legacy `$q.all` parity).

**Tags:** `TagsManager` uses chip UI + Enter/Tab instead of `react-select` to avoid new dependency.

**Language:** Legacy `general.ng1` hides language selector — web2 matches; track T-set-10 if product wants it visible.

**Privileges:** `global_preferences` gate not enforced in UI yet (T-set-9). Routes require auth via `ProtectedRoute` only.

**Tests:** `types.test.ts` (2). Smoke: `node scripts/smoke-phase5.mjs`. Reports: `plans/reports/tests/settings-manager/2026-05-26/`.

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client/app/scripts/liveblog-settings`
