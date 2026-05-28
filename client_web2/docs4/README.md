# Liveblog Docs4

Live documentation server for **client_web2** plans. Reads `../plans/` and serves a browsable dashboard, mechanism pages, data flow, and component inventory.

## Quick start

From **client_web2** root:

```bash
npm run docs4:install   # once
npm run docs4:start     # http://localhost:4010/docs/
```

From **docs4/** directly:

```bash
npm install
npm start
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Live Express server (port **4010**, override with `DOCS4_PORT`) |
| `npm run export` | Static HTML to `export/` |
| `npm run export:public` | Public-only export |
| `npm run build` | Static build + `liveblog-docs4.zip` (offline package) |
| `npm run electron` | Desktop wrapper (requires build first) |

## Structure

```
docs4/
├── server/index.js     # Express app
├── lib/                # content + dashboard helpers
├── scripts/export.js   # Static site generator
├── scripts/build.js    # Build + zip
├── public/             # CSS, nav, logo
└── electron/           # Optional desktop app
```

Plans live in `client_web2/plans/` — see `plans/docs4/README.md` for how docs4 relates to planning commands.
