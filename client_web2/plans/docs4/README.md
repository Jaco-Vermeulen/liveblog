# Docs4 — Liveblog client_web2

Docs4 is the **live documentation portal** for this project's plans. It reads markdown from `client_web2/plans/` and serves:

- Dashboard (KPIs, task counts)
- Mechanism pages (`plans/mechanisms/*/README.md`)
- Data flow (`DATA_FLOW.md`)
- Component inventory
- Static export / offline zip

## Location

Application code: **`client_web2/docs4/`**

## Run

```bash
cd client_web2
npm run docs4:start
```

Open **http://localhost:4010/docs/**

## Commands integration

When using `/planner`, `/implement`, `/status`, or other commands from `plans/commands/`, output and mechanism docs are written under `plans/`. Docs4 picks those up on refresh — no separate publish step for local dev.

## Static distribution

```bash
cd client_web2/docs4
npm run build
```

Produces `liveblog-docs4.zip` — unzip and open `index.html` offline.

## Related

- `plans/documentation_standards/` — README and changelog conventions
- `plans/commands/` — AI command definitions
- `knowledge-graph.json` — project graph (includes docs4 entry)
