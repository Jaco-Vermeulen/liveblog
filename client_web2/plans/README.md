# Plans Documentation — Liveblog client_web2

## CRITICAL: For AI Agents

**BEFORE STARTING:** Read `client_web2/AGENT_INSTRUCTIONS.md`

**YOU ARE ONLY ALLOWED TO WORK IN:** `client_web2/`  
**DO NOT MODIFY:** `client/` (legacy admin), `generated/`, or server code unless explicitly instructed.

## Overview

This directory contains comprehensive documentation for modernising the Liveblog admin client from the legacy AngularJS/Superdesk stack into a clean, maintainable **client_web2** React application.

Same approach as **maroela_web2** (`maroela_demo/maroela_web2/plans/`): mechanisms, directives, meetings, reports, commands, and per-mechanism tracking.

## Purpose

The legacy client (`client/`) is AngularJS 1.6 + Superdesk + Node 10 + Grunt/Webpack 3. This redesign aims to:

- Replace AngularJS with React 19 + TypeScript
- Replace SCSS/Superdesk overrides with Tailwind CSS 4 design system
- Decouple feature modules with clear API boundaries
- Log all external API/WebSocket traffic
- Achieve feature parity, then cutover from port 9000 → 9001

## Structure

```
client_web2/plans/
├── README.md                         # This file — entry point + mechanism index
├── TASKS.md                          # Project-level task pointer
├── AGENT_INSTRUCTIONS.md             # (parent) agent scope rules
├── MECHANISM_README_STANDARD.md      # Required README format
├── DOCUMENTATION_PROCEDURES.md       # Where to document what
├── COMPONENT_PLANNING_GUIDE.md       # Components vs mechanisms
├── KNOWLEDGE_GRAPH.md                # client_web2 architecture graph
├── commands/                         # AI agent command registry
├── directives/                       # Project-level directives
├── meetings/                         # Kickoff and cross-cutting decisions
├── reports/                          # Test, audit, troubleshooting reports
│   ├── tests/
│   ├── troubleshooting/
│   ├── analysis/
│   └── audits/
└── mechanisms/                       # One folder per mechanism
    └── [mechanism]/
        ├── README.md
        ├── TASKS.md
        ├── CHANGELOG.md
        └── COMMENTS.md
```

## Required mechanism documentation

All mechanism READMEs **MUST** follow:

| Document | Purpose |
|----------|---------|
| **[MECHANISM_README_STANDARD.md](MECHANISM_README_STANDARD.md)** | Canonical section order + File Structure ASCII rules |
| **[README_REQUIREMENTS.md](README_REQUIREMENTS.md)** | Quick checklist for README completeness |
| **[DOCUMENTATION_PROCEDURES.md](DOCUMENTATION_PROCEDURES.md)** | Where to document what (all commands) |
| **[CHANGELOG_TASK_MILESTONE_PLAN.md](CHANGELOG_TASK_MILESTONE_PLAN.md)** | Task IDs + milestone linkage |
| **[COMPONENT_PLANNING_GUIDE.md](COMPONENT_PLANNING_GUIDE.md)** | Components vs mechanisms |

Every mechanism requires README, TASKS, CHANGELOG, COMMENTS. Plan changes via **`/planner`** only.

## Design principles

1. **Simplicity** — one mechanism, one responsibility
2. **Clear interfaces** — TypeScript types at boundaries
3. **Logged I/O** — all REST/WS through `liveblog-api` + `request-logger`
4. **Style-guide first** — no ad-hoc styling; update `style-guide` before UI changes
5. **Strangler migration** — web2 on :9001 until parity, then cutover
6. **Test every phase** — Vitest + manual smoke against Docker stack

## Mechanism index

### Foundation (Phase 0–1)

| # | Mechanism | Status (2026-05-26) | Purpose |
|---|-----------|---------------------|---------|
| 1 | **[style-guide](mechanisms/style-guide/)** | Phase 1 done | **REQUIRED** — design tokens, Tailwind, Lb* components |
| 2 | **[request-logger](mechanisms/request-logger/)** | Phase 1 done | Structured logging for all external calls |
| 3 | **[liveblog-api](mechanisms/liveblog-api/)** | Phases 1–5 done | Typed REST client to Liveblog server |
| 4 | **[websocket-manager](mechanisms/websocket-manager/)** | Phase 1 done | Superdesk JSON WebSocket; editor + shell banner |
| 5 | **[auth-manager](mechanisms/auth-manager/)** | Phase 1 done | Login, session, privileges (Superdesk auth) |
| 6 | **[navigation-manager](mechanisms/navigation-manager/)** | Phase 1 done | App shell, top bar, side nav, responsive drawer |

### Core features (Phase 2–3)

| # | Mechanism | Legacy module | Priority |
|---|-----------|---------------|----------|
| 7 | **[blog-list-manager](mechanisms/blog-list-manager/)** | `liveblog-bloglist` | P1 |
| 8 | **[editor-manager](mechanisms/editor-manager/)** | `liveblog-edit` | P1 — Phases 3–4 + blogging UX + [rich-text-editor](mechanisms/editor-manager/subsystems/rich-text-editor/) (2026-05-27) |

### Secondary features (Phase 4–6)

| # | Mechanism | Legacy module | Priority |
|---|-----------|---------------|----------|
| 9 | **[settings-manager](mechanisms/settings-manager/)** | `liveblog-settings` | P2 — Phase 5 done |
| 10 | **[themes-manager](mechanisms/themes-manager/)** | `liveblog-themes` | P2 — Phase 5 done (stylesTab Phase 5+) |
| 11 | **[analytics-manager](mechanisms/analytics-manager/)** | `liveblog-analytics` | P3 |
| 12 | **[syndication-manager](mechanisms/syndication-manager/)** | `liveblog-syndication` | P3 |
| 13 | **[marketplace-manager](mechanisms/marketplace-manager/)** | `liveblog-marketplace` | P3 |
| 14 | **[advertising-manager](mechanisms/advertising-manager/)** | `liveblog-advertising` | P3 |
| 15 | **[freetypes-manager](mechanisms/freetypes-manager/)** | `liveblog-freetypes` | P3 |

## Implementation phases

| Phase | Deliverable | Mechanisms |
|-------|-------------|------------|
| **0** | Plans + Vite scaffold | All READMEs, style-guide tokens |
| **1** | Shell + auth | auth, navigation, liveblog-api, request-logger, websocket (stub) |
| **2** | Blog list | blog-list-manager |
| **3** | Editor core | editor-manager |
| **4** | Editor advanced | editor-manager subsystems |
| **5** | Settings & themes | settings, themes — **done (2026-05-26)** |
| **6** | Secondary modules | analytics, syndication, marketplace, advertising, freetypes |
| **7** | Cutover | Docker service, E2E, default UI switch |

## Dev URLs

| App | URL |
|-----|-----|
| Legacy admin | http://localhost:9000 |
| **client_web2** | http://localhost:9001 |
| API | http://localhost:5000/api |
| WebSocket | ws://localhost:5100 |

## Commands

Full registry: [commands/README.md](commands/README.md) — **19 commands** ported from maroela_web2.

| Category | Commands |
|----------|----------|
| Plan | `/planner` |
| Implement | `/implement` |
| Build/Run | `/build`, `/run`, `/deploy` |
| Test | `/test`, `/validate` |
| Analysis | `/analyze`, `/audit`, `/check`, `/debug`, `/status`, `/task` |
| Setup | `/initialize` |
| Maintenance | `/clean`, `/fix`, `/troubleshoot`, `/rollback`, `/sync` |

Dev server for Level 3 tests: **http://localhost:9001**. API: **http://localhost:5000/api**.

## Directives

See [directives/README.md](directives/README.md) and [directives/client-web2-kickoff.md](directives/client-web2-kickoff.md).

## Getting started

1. Read this file
2. Read [MECHANISM_README_STANDARD.md](MECHANISM_README_STANDARD.md) and [README_REQUIREMENTS.md](README_REQUIREMENTS.md)
3. Read [DOCUMENTATION_PROCEDURES.md](DOCUMENTATION_PROCEDURES.md)
4. Pick a mechanism from the index below
5. Run `/implement [mechanism]` or follow mechanism TASKS
6. Document in CHANGELOG + COMMENTS per procedures

## Phase 1 reports (2026-05-26)

| Type | Path |
|------|------|
| Implementation | [reports/implementation/2026-05-26-phase1-foundation.md](reports/implementation/2026-05-26-phase1-foundation.md) |
| Tests | [reports/tests/phase1/2026-05-26/test-summary.md](reports/tests/phase1/2026-05-26/test-summary.md) |
| Meeting | [meetings/2026-05-26-phase1-implementation.md](meetings/2026-05-26-phase1-implementation.md) |
| Components | [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md) |

## Related

- Project knowledge graph: [KNOWLEDGE_GRAPH.md](KNOWLEDGE_GRAPH.md)
- Repo knowledge graph: `docs/KNOWLEDGE_GRAPH.md`
- Legacy client reference: `client/app/scripts/`
- E2E reference: `client/e2e/`
- Maroela web2 template: `maroela_demo/maroela_web2/plans/`
