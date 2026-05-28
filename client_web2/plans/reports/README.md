# Reports — client_web2

Output from `/test`, `/audit`, `/analyze`, `/troubleshoot`, `/implement` documentation sweeps.

## Structure

```
reports/
├── tests/[mechanism]/[timestamp]/
│   ├── test-summary.md
│   └── test-results.json   # optional
├── tests/phases-2-4/[timestamp]/   # cross-phase rollup
├── tests/phase5/[timestamp]/       # Phase 5 rollup
├── implementation/
├── troubleshooting/[problem-title]/
├── analysis/[timestamp]/
└── audits/[timestamp]/
```

Create subfolders when running commands. Do not commit large binary artifacts.

## Published reports

| Date | Type | Path |
|------|------|------|
| 2026-05-26 | Implementation (Phase 1) | [implementation/2026-05-26-phase1-foundation.md](implementation/2026-05-26-phase1-foundation.md) |
| 2026-05-26 | Implementation (Phases 2–4) | [implementation/2026-05-26-phases-2-4.md](implementation/2026-05-26-phases-2-4.md) |
| 2026-05-26 | Implementation (Phase 4 editor) | [implementation/2026-05-26-phase4-editor-subsystems.md](implementation/2026-05-26-phase4-editor-subsystems.md) |
| 2026-05-26 | Tests (Phase 1) | [tests/phase1/2026-05-26/test-summary.md](tests/phase1/2026-05-26/test-summary.md) |
| 2026-05-26 | Tests (Phases 2–4 rollup) | [tests/phases-2-4/2026-05-26/test-summary.md](tests/phases-2-4/2026-05-26/test-summary.md) |
| 2026-05-26 | Tests (blog-list-manager) | [tests/blog-list-manager/2026-05-26/test-summary.md](tests/blog-list-manager/2026-05-26/test-summary.md) |
| 2026-05-26 | Tests (editor-manager) | [tests/editor-manager/2026-05-26/test-summary.md](tests/editor-manager/2026-05-26/test-summary.md) (+ test-results.json) |
| 2026-05-26 | Tests (liveblog-api) | [tests/liveblog-api/2026-05-26/test-summary.md](tests/liveblog-api/2026-05-26/test-summary.md) |
| 2026-05-26 | Validation (editor Phase 4) | [validation-editor-manager-phase4-2026-05-26.md](validation-editor-manager-phase4-2026-05-26.md) |
| 2026-05-26 | Implementation (Phase 5) | [implementation/2026-05-26-phase5-settings-themes.md](implementation/2026-05-26-phase5-settings-themes.md) |
| 2026-05-26 | Tests (Phase 5 rollup) | [tests/phase5/2026-05-26/test-summary.md](tests/phase5/2026-05-26/test-summary.md) (+ test-results.json) |
| 2026-05-26 | Tests (settings-manager) | [tests/settings-manager/2026-05-26/test-summary.md](tests/settings-manager/2026-05-26/test-summary.md) |
| 2026-05-26 | Tests (themes-manager) | [tests/themes-manager/2026-05-26/test-summary.md](tests/themes-manager/2026-05-26/test-summary.md) |
| 2026-05-26 | Implementation (websocket-manager) | [implementation/2026-05-26-websocket-manager.md](implementation/2026-05-26-websocket-manager.md) |
| 2026-05-26 | Tests (websocket-manager) | [tests/websocket-manager/2026-05-26/test-summary.md](tests/websocket-manager/2026-05-26/test-summary.md) |
| 2026-05-26 | Troubleshooting (UI flash / reconnect loop) | [troubleshooting/ui-flash-reconnect-loop/troubleshooting-summary.md](troubleshooting/ui-flash-reconnect-loop/troubleshooting-summary.md) |
