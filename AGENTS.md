# ApkNitro — AGENTS.md

Standing rules for any agent working on this site. These come from the
debated decisions in `apknitro-brand/BUILD-PLAN.md`; do not re-debate them
in a task, follow them.

## Stack
- Static HTML generated from data. No framework, no build step on the host.
- `src/data/apps.json` is the single source of truth. Edit it, run
  `node src/generate.js`, redeploy `dist/`. That is the whole update process.
- Vanilla CSS with design tokens. Vanilla JS, own code under 15 KB.
- Page budget ≤1 MB. Total JS ≤50 KB gzipped. No render-blocking JS
  except the tiny theme snippet in `<head>`.
- Download is a plain `<a>` link that works with JS off. No countdown,
  no interstitial, no pop-up, no ad-gate, no account wall.

## Palette and type
- Nitro Red #E10600 (dark-mode red text #FF3B46), Midnight Navy #0B1B30,
  off-white #F7F8FA, near-black #0E1116, Verified Green #16A34A (icon/dot
  only; badge text #15803D), Amber #D97706 (icons/large text only),
  error body text #92400E, metadata #475569, dark metadata #9AA7BD.
- Display: Montserrat ExtraBold Italic. Body/UI: Inter. Google Fonts
  only (`display=swap`, needed weights). No local font files in the site.
- ALL colours live in `src/css/tokens.css` (primitive → semantic →
  component). No hex colour anywhere else. Dark theme is one
  `[data-theme="dark"]` block overriding the same tokens — a second
  palette, not an inversion.

## Header (redesigned 2026-11-25 — LiteAPKs-style bar, ApkNitro branding)
- White bar (near-black #0E1116 in dark), 1px bottom divider, flat — no
  shadow. Sticky at top. The navy hero band below it is unchanged.
- Logo lockup: red leaning-N icon + "APKNITRO" wordmark in Midnight Navy
  (off-white in dark). Never ".com", never a red wordmark.
- Nav: Home, Apps, Games, Mods, Top Charts, each with a small icon.
  Inactive nav is metadata #475569 (#9AA7BD dark); the ACTIVE page is
  Nitro Red #E10600 (#FF3B46 dark) — a deliberate exception to fix #2's
  one-red-element rule, which otherwise still holds. Do not "fix" the
  header back to navy or the active nav back to white.
- Right side: search magnifier icon (links to /search/), theme icon
  button (moon in light mode, sun in dark mode; same System/Light/Dark
  cycle underneath), hamburger on mobile.
- Homepage carousel: "Indispensable on your phone" sits directly under
  the hero, above Trending now. Cards use each app's own icon colour
  with initials (placeholder panels, never fake screenshots); category
  is red, not green. First card is a labelled Advertisement placeholder.

## The 11 debate fixes (all must hold on every page)
1. Trust strip in the first viewport under the download button, honest
   variant only: Play-signed "Matches developer signature"; mod
   "Re-signed by uploader — scan result only". Never a bare "100% safe".
   Never invent a SHA-256 or scan date — placeholder until a real scan
   exists. Never use the word "verified" for an APK that has not been
   scanned. Never claim "Scanned with 70+ engines" without a real scan.
2. The red download button is the ONLY red element in the first viewport
   (apart from the logo). Row buttons are navy.
3. Rows 72px max, ≥8 rows visible per phone screen (390px).
4. Shadows only on the primary button and header. Rows: 1px dividers,
   no shadows.
5. Metadata #475569, stars navy, no gold.
6. Error body text #92400E on light (#FBBF24 on dark).
7. Hero ONLY on the homepage: wordmark + ONE factual line + search.
   No hero on app pages.
8. Mod pages have a mod-notes block (what the mod changes, base version,
   uploader, working %) — only where the data is real, else "tbd".
9. Sticky bottom download bar in the thumb zone — the SAME button
   relocated when the primary scrolls out of view, not a second CTA.
10. Page budget ≤1 MB, WebP icons, two fonts only.
11. Dark theme is a second palette, not an inversion.

## Ground rules
- No gradients, no glass, no purple, no mascot, no emoji in the UI.
- No fabricated stats, no fake testimonials, no invented figures.
  Unknown version/size/rating/review count/scan = `"tbd"` in apps.json.
- Ads: labelled "Advertisement" placeholders only, visually separated,
  never adjacent to the download button, never styled like a button.
  No real ad code yet.
- APK files live on Google Drive, never with the site. Download links
  point at `download_url` in apps.json; `"tbd"` means no link yet —
  never fabricate a Drive URL, never upload an APK file.
- JS: one module per feature, each `init()` in its own try/catch,
  `defer` or `type="module"`, no `innerHTML` with untrusted data,
  event delegation (no listener per row). CSS must not depend on JS.

## SEO
- Per-page title, description, canonical
  (`https://apknitro.com/apps/<slug>/`), OG tags, JSON-LD
  SoftwareApplication — all generated from apps.json, never hardcoded.
- `sitemap.xml` lists every generated page and nothing else. `robots.txt`
  allows crawling of pages.
- No duplicate titles. No invented figures in any meta tag.

## Workflow
- One task at a time. Rebuild with `node src/generate.js` after every
  change. Verify in the browser at 390px and 1280px, light and dark.
- Report honestly: what you checked, what you did NOT check, measured
  numbers (page weight, JS size), and every defect found — even small ones.
- Never buy anything, never enter payment details, never contact
  checkdomain.de (account banned 2026-11-18). Custom domain is deferred
  until the ICANN 60-day transfer block lifts (earliest 2027-01-15).
- Trademark clearance on "ApkNitro" is NOT done. Flag it before launch;
  never claim it is clear.
