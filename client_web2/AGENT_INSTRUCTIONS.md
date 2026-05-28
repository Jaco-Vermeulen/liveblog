# CRITICAL AI AGENT INSTRUCTIONS

## DO NOT MODIFY ANYTHING OUTSIDE OF client_web2 WITHOUT EXPLICIT INSTRUCTION

This repository contains the **legacy Liveblog admin** (`client/`, reference / `legacy` branch) and the **modern web2 admin** (`client_web2/`). **Docker compose** on `main` serves `client_web2` at http://localhost:9000. Web2 implementation work is scoped to `client_web2/` only; root Docker/CI wiring may be changed when explicitly requested.

## YOUR WORKING PROJECT

**ONLY WORK IN:** `client_web2/`

**ONLY MODIFY FILES:** As dictated by the plans in `client_web2/plans/`

## STRICTLY FORBIDDEN

### DO NOT MODIFY (unless user explicitly asks):

- `client/` — legacy AngularJS admin (reference only)
- `generated/` — generated code
- `server/` — API/server (reference for endpoints only)
- Root deploy scripts unless explicitly requested

### DO NOT:

- Create web2 UI in `client/`
- Skip plan documentation updates (TASKS, CHANGELOG, COMMENTS)
- Make raw `fetch()` calls outside `liveblog-api` + `request-logger` mechanisms
- Edit mechanism plans without `/planner` workflow

## ALLOWED ACTIONS

- Read `client/` and `server/` for **reference** (API behaviour, legacy UX)
- Work in `client_web2/` per `client_web2/plans/`
- Use commands from `client_web2/plans/commands/`
- Implement mechanisms in `client_web2/plans/mechanisms/`

## WORKFLOW REQUIREMENTS

1. Read `client_web2/plans/README.md` before starting
2. Read the target mechanism README + TASKS
3. Read `client_web2/plans/directives/` for project rules
4. Update TASKS.md, CHANGELOG.md, COMMENTS.md as you work
5. Run tests and smoke checks before marking tasks complete
6. Update `client_web2/plans/KNOWLEDGE_GRAPH.md` when architecture changes

## REFERENCE PROJECT

The Maroela web2 plans structure is the template:

`c:\Work\Dev-rd\maroela_demo\maroela_web2\plans\`

Match that structure: mechanisms, directives, meetings, reports, commands.
