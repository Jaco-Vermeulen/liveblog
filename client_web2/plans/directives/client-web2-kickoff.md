# Directives — client-web2 kickoff

**Scope:** All code, config, and documentation under `client_web2/`.

**Status:** Active from 2026-05-25

---

## 1. Mission

Completely modernise the Liveblog admin client. Replace legacy AngularJS + Superdesk with a greenfield React application. Preserve API compatibility with Liveblog server.

Legacy `client/` is reference only — **do not add web2 features there**.

---

## 2. Non-negotiables

| Rule | Detail |
|------|--------|
| Work in `client_web2/` only | Unless user explicitly requests otherwise |
| Do not edit `generated/` | Generated code is off-limits |
| All external calls logged | REST via `liveblog-api` + `request-logger`; WS via `websocket-manager` |
| Plan changes via `/planner` | Never bypass mechanism plan validation |
| Style-guide first | Update `style-guide` before visual changes |
| Test after every phase | API + UI smoke against Docker stack |

---

## 3. Technology stack

React 19 · Vite 6 · Tailwind 4 · TypeScript 5 · TanStack Query 5 · React Router 7 · Vitest · Playwright (E2E)

Node ≥ 20. Dev port **9001**. Legacy stays on **9000**.

---

## 4. Plans structure

Match **maroela_web2** (`maroela_demo/maroela_web2/plans/`):

- 15 mechanisms with README/TASKS/CHANGELOG/COMMENTS
- directives/, meetings/, reports/, commands/
- MECHANISM_README_STANDARD.md

---

## 5. Quality gates (per phase)

- `npm run build` passes
- `npm run lint` passes
- Logger shows all API calls in smoke test
- Mechanism TASKS + CHANGELOG updated

---

## 6. Out of scope

- Embed themes (`server/liveblog/themes/`)
- Server API changes
- Removing legacy client before parity
- Docker production deploy (Phase 7)
