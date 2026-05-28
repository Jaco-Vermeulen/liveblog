# Liveblog client_web2

Modern admin client for Liveblog — **React 19**, **Vite 6**, **Tailwind CSS 4**, **TypeScript**.

Replaces the legacy AngularJS portal in `client/`. **Docker compose** and `npm run dev` use **port 9000** (same URL as before). Legacy Grunt admin is on branch `legacy` / host-only.

## Requirements

- Node.js **≥ 20** (Volta pin: 20.19.1)
- Liveblog Docker stack for API: `docker compose up -d` from repo root

## Quick start

```bash
cd client_web2
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:9000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR (port 9000) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run smoke:auth` | API smoke — login without password returns 401 (Docker :5000) |
| `npm run smoke:mail` | API smoke — password-reset email (`TEST_EMAIL` env, default `geen-antwoord@maroelamedia.co.za`) |
| `npm run smoke:api` | Core API smokes (auth, blogs, editor, phase5, websocket) |
| `node scripts/launch-verify.mjs` | Build + Vitest + API smokes |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_LIVEBLOG_API_URL` | `http://localhost:5000/api` | REST API base |
| `VITE_LIVEBLOG_WS_URL` | `ws://localhost:5100` | WebSocket (Phase 1+) |

Vite proxies `/api` to the API host during development.

## Documentation

- **Plans (start here):** [`client_web2/plans/README.md`](plans/README.md)
- Agent instructions: [`AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md)
- Knowledge graph: [`plans/KNOWLEDGE_GRAPH.md`](plans/KNOWLEDGE_GRAPH.md)
- Directives: [`plans/directives/`](plans/directives/)
- Mechanisms: [`plans/mechanisms/`](plans/mechanisms/) (15 mechanisms)
- Repo graph: [`docs/KNOWLEDGE_GRAPH.md`](../docs/KNOWLEDGE_GRAPH.md)

## Project structure

```
src/
├── app/pages/     # Setup, placeholder stubs
├── components/    # layout + ui (style-guide)
├── mechanisms/    # auth, navigation, liveblog-api, blog-list, editor, settings, themes, …
├── lib/           # utils, logger redirect
│   └── utils.ts
└── index.css      # Tailwind + Maroela tokens
```
