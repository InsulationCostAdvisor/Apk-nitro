# ApkNitro

Fast APK downloads — a static site generated from data. Navy-first dense
minimal design, one-tap plain-link downloads, honest scan status on every
app page.

Live test deployment: Vercel (repo connected to Vercel by the owner).

## How the site is built

- `src/data/apps.json` — the single source of truth for every app.
- `src/templates/` — plain HTML templates with `{{placeholders}}`.
- `src/css/` — `tokens.css` (all colours/fonts/spacing) + `main.css`.
- `src/js/` — one small ES module per feature + `main.js`.
- `src/generate.js` — Node, zero dependencies. One command builds the
  whole site into `dist/`.
- `dist/` — the generated site. This is what gets deployed. Do not edit
  `dist/` by hand; regenerate it.

## Build

```bash
node src/generate.js
```

This rebuilds `dist/` from scratch. A second run produces identical output.

## Update process (new app or new version)

1. Edit `src/data/apps.json` (add the app or version).
2. Run `node src/generate.js`.
3. Commit and push; Vercel redeploys from `main`.

Unknown values (version, size, rating, review count, scan result) must be
`"tbd"` in `apps.json` — never invent a figure. Download links point at
`download_url` in `apps.json`; `"tbd"` means no file link yet. APK files
live on Google Drive, never in this repo.

## Pages (16)

Homepage, 10 app pages, All apps, Games, Mods, Top charts, Search —
plus `sitemap.xml` and `robots.txt`.

## Rules

See `AGENTS.md` — the standing rules (palette, the 11 debate fixes,
honesty rules for scan claims, budgets). Trademark clearance on
"ApkNitro" is still open; do not claim it is clear.
