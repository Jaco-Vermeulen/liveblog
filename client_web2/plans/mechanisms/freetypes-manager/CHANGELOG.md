# Freetypes Manager — Changelog

## 2026-05-27 - Built-in Scorecard (editor)

[ADDED] `builtinFreetypes.ts` — legacy Scorecard template merged in `useFreetypesList` when API omits it. tasks: T-edit-23 (editor-manager)
[CHANGED] `useFreetypesList` — dedupe by name; builtins available in composer dropdown

## 2026-05-27 - Editor render pipeline

[ADDED] `utils/freetypeTemplate.ts` — `extractFreetypeFields`, `renderFreetypeHtml`, `freetypeDataToPostItem`, path helpers. tasks: T-edit-15
[ADDED] `hooks/useFreetypesList.ts` — read-only list for editor composer
[CHANGED] Public exports for editor-manager integration

## 2026-05-26 - Phase 6 implementation

[ADDED] `freetypes-manager` — list, create/edit modal, remove, usage check
[ADDED] liveblog-api `endpoints/freetypes.ts`
[ADDED] Template/name validation utils + tests
[ADDED] Route `/freetypes`
[COMPLETED] Phase 6 freetypes-manager
