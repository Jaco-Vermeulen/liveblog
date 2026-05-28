# E-mail assets

Password-reset HTML uses a hosted logo image (not inline SVG — our `maroela-logo.svg` is ~885KB with embedded raster and breaks clients).

Default URL (Maroela CDN):

`https://mcusercontent.com/3d8f21b3e2/images/3a06e0a5-db1d-a4ea-cac2-8e87fb118fd0.png`

Override via `EMAIL_LOGO_URL` in server env / `.env`.

Optional local fallback asset: `client_web2/public/maroela-logo-email-white.png` (regenerate with `client_web2/scripts/generate-email-white-logo.cjs`).
