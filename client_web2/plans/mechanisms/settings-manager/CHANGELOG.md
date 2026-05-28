# Settings Manager — Changelog

## 2026-05-26 - Instance settings WebSocket sync (T-set-12 / T-ws-9)

[ADDED] `InstanceFeaturesProvider` — loads `GET /instance_settings/current`, refreshes on `instance_settings:updated`
[ADDED] `useInstanceSettingsRemoteSync` — reloads JSON editor when remote save and form not dirty
[ADDED] liveblog-api `getInstanceSettingsCurrent()`
[ADDED] `lib/config/resolveFeatureFlags.ts` + Vitest
[CHANGED] `NavMenu` — admin nav uses API feature flags (env fallback while loading)
[CHANGED] `App.tsx` — `InstanceFeaturesProvider` inside `WebSocketProvider`

## 2026-05-26 - Phase 5 implementation

[ADDED] `src/mechanisms/settings-manager/` — GeneralSettingsPage, InstanceSettingsPage, TagsManager, JsonEditor. tasks: T-set-2, T-set-4
[ADDED] `useGeneralSettings`, `useInstanceSettings`, `constants.ts`, `types.ts`. tasks: T-set-3
[ADDED] liveblog-api `endpoints/settings.ts` — languages, global_preferences, instance_settings. tasks: T-api-12
[ADDED] Vitest: `types.test.ts`. tasks: T-set-6
[ADDED] Smoke: `scripts/smoke-phase5.mjs` (shared with themes). tasks: T-set-7
[CHANGED] `/settings/general` and `/settings/instance-settings` replace PlaceholderPage. tasks: T-set-5
[CHANGED] README File Structure + Components synced to `src/`
[ADDED] Test report `plans/reports/tests/settings-manager/2026-05-26/`
[COMPLETED] Phase 5 settings-manager. tasks: T-set-1 through T-set-8
[MILESTONE] 100%

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements
