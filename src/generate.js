// generate.js — builds the whole ApkNitro site into dist/.
// Node, zero dependencies. Usage: node src/generate.js
// Reads src/data/apps.json, renders src/templates/*.html, writes
// dist/ from scratch. If one app's data is bad, that ONE page is
// skipped and logged — the build never fails as a whole.
// A second run produces identical output (deterministic).
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://apknitro.com';

const data = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'apps.json'), 'utf8'));
const apps = data.apps;
// Trending order, shared by the homepage rows and the footer Top apps
// column — computed once, deterministic.
const byDownloads = [...apps].sort((x, y) => parseDownloads(y.download_count) - parseDownloads(x.download_count));
// Top charts order, shared by the homepage Top charts section and the
// /charts/ page — computed once, deterministic. The homepage section
// shows the first 6; the /charts/ page shows all 10 in this same order
// (first 6 identical, then the remaining apps in download order).
const topCharts = byDownloads.slice(2, 8);
const chartsPageOrder = [...topCharts, ...byDownloads.filter((a) => !topCharts.includes(a))];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function read(p) { return fs.readFileSync(p, 'utf8'); }
function write(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
function fill(tpl, map) {
  let out = tpl;
  for (const k of Object.keys(map)) out = out.split('{{' + k + '}}').join(map[k]);
  return out;
}
function fmtSize(mb) {
  if (mb == null || mb === 'tbd') return 'tbd';
  return mb >= 1024 ? (mb / 1024).toFixed(1).replace(/\.0$/, '') + ' GB' : mb + ' MB';
}
function parseDownloads(s) {
  if (!s || s === 'tbd') return 0;
  const m = String(s).match(/^([\d.]+)\s*([KM])?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2] === 'M' ? n * 1e6 : m[2] === 'K' ? n * 1e3 : n;
}
function stars(r) {
  if (r == null || r === 'tbd') return '';
  const full = Math.round(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
function tbd(v) { return v == null || v === '' || v === 'tbd' ? 'tbd' : v; }

// Real app artwork: icons are 512x512 WebP in /assets/icons/, banners
// are 2:1 WebP in /assets/banners/, wired via apps.json. Every tile keeps
// its coloured background + initials behind the <img>; if the image file
// is missing the img removes itself (onerror) and the old initials tile
// shows. Icons/banners are decorative (the app name is adjacent text),
// so alt is empty. Rows/carousel/grid images are below the fold, so
// they load lazily; the app-page header icon is above the fold (eager).
function iconImg(a, lazy) {
  if (!a.icon) return '';
  return `<img src="${esc(a.icon)}" width="512" height="512" alt="" decoding="async"${lazy ? ' loading="lazy"' : ''} onerror="this.remove()">`;
}
function bannerImg(a) {
  if (!a.banner) return '';
  return `<img src="${esc(a.banner)}" width="480" height="240" alt="" decoding="async" loading="lazy" onerror="this.remove()">`;
}
function tileInner(a, lazy) {
  return iconImg(a, lazy) + `<span aria-hidden="true">${esc(a.icon_initials)}</span>`;
}

const LOGO_N = read(path.join(SRC, 'assets', 'logos', 'icon-red.svg'))
  .replace(/<svg /, '<svg width="26" height="26" ');
const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';
const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5" y1="5" x2="6.8" y2="6.8"/><line x1="17.2" y1="17.2" x2="19" y2="19"/><line x1="19" y1="5" x2="17.2" y2="6.8"/><line x1="6.8" y1="17.2" x2="5" y2="19"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>';
const MENU_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
const FLAME_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.8 3.2 3.8 5.4 5.5 8.2 1.2 2 1.8 3.6 1.8 5.3a7.3 7.3 0 1 1-14.6 0c0-2.4 1.2-4.3 2.6-5.8.4 1.4 1.1 2.4 2.2 3-.6-3.4.3-7.3 2.5-10.7Z"/></svg>';
const NAV_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  apps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  games: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 8h10a5 5 0 0 1 5 5v2a3 3 0 0 1-5.4 1.8L15.5 15h-7l-1.1 1.8A3 3 0 0 1 2 15v-2a5 5 0 0 1 5-5Z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16.2" cy="11.4" r=".7" fill="currentColor" stroke="none"/><circle cx="18.2" cy="13.4" r=".7" fill="currentColor" stroke="none"/></svg>',
  mods: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  charts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="20" x2="5" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="19" y1="20" x2="19" y2="14"/></svg>',
};
const CHEV_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 5 8 12 15 19"/></svg>';
const CHEV_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 5 16 12 9 19"/></svg>';
const UP_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"/></svg>';
// Download arrow shown on the compact mobile row button (the word
// "Download" is the desktop label; on phones the 44px icon button
// frees the text column so the rating and category stay visible).
const DL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v11"/><polyline points="6 10 12 16 18 10"/><line x1="5" y1="21" x2="19" y2="21"/></svg>';

// Minimal app index for the header live search, embedded as JSON in every
// page (no extra fetch, instant on first keystroke). Only the fields the
// dropdown shows. `<` is escaped so the blob can never break out of its
// <script type="application/json"> tag.
const HS_DATA = '<script type="application/json" id="hs-data">'
  + JSON.stringify(apps.map((a) => ({ n: a.name, s: a.slug, c: a.category, v: a.version, z: fmtSize(a.size_mb), ic: a.icon_colour, ii: a.icon_initials, ig: a.icon || '' }))).replace(/</g, '\\u003c')
  + '</script>';

function header(active) {
  const nav = [
    ['/', 'Home', 'home'], ['/apps/', 'Apps', 'apps'], ['/games/', 'Games', 'games'],
    ['/mods/', 'Mods', 'mods'], ['/charts/', 'Top charts', 'charts'],
  ].map(([href, label, icon]) =>
    `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${NAV_ICONS[icon]}${label}</a>`).join('');
  return `<header class="s-header"><div class="inner wrap">
  <a class="logo" href="/">${LOGO_N}<span>APKNITRO</span></a>
  <nav class="nav" aria-label="Main">${nav}</nav>
  <div class="h-actions">
    <div class="h-search" data-header-search>
      <a class="icon-btn" href="/search/" aria-label="Search" aria-expanded="false" data-hs-toggle>${SEARCH_ICON}</a>
      <div class="h-search-box"><input type="search" data-hs-input placeholder="Search apps…" aria-label="Search apps" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" role="combobox" aria-expanded="false" aria-controls="hs-results" aria-autocomplete="list"></div>
      <div class="h-search-results" id="hs-results" role="listbox" aria-label="Matching apps" hidden></div>
    </div>
    <button class="icon-btn theme-btn" data-theme-toggle type="button" aria-label="Switch theme" data-icon="moon"><span class="ic-moon">${MOON_ICON}</span><span class="ic-sun">${SUN_ICON}</span></button>
    <button class="icon-btn nav-toggle" aria-expanded="false" aria-label="Menu">${MENU_ICON}</button>
  </div>
</div></header>${HS_DATA}`;
}

function carouselHTML(list) {
  const cards = list.map((a) =>
    `<article class="card"><a class="card-link" href="/apps/${esc(a.slug)}/">`
    + `<div class="card-banner" style="background:${esc(a.icon_colour)}">${bannerImg(a)}<span class="card-big">${esc(a.icon_initials)}</span></div>`
    + `<div class="card-strip"><div class="card-ic" style="background:${esc(a.icon_colour)}">${tileInner(a, true)}</div>`
    + `<div class="card-tx"><div class="card-nm">${esc(a.name)}</div><div class="card-cat">${esc(a.category)}</div></div></div>`
    + `</a></article>`).join('');
  return `<section class="carousel" aria-labelledby="indispensable-h"><div class="carousel-head"><h2 id="indispensable-h"><span class="flame">${FLAME_ICON}</span>Indispensable on your phone</h2>`
    + `<div class="carousel-arrows"><button type="button" class="car-arrow" data-car-prev aria-label="Previous apps">${CHEV_LEFT}</button><button type="button" class="car-arrow" data-car-next aria-label="Next apps">${CHEV_RIGHT}</button></div></div>`
    + `<div class="carousel-track" data-carousel>${cards}</div></section>`;
}

function latestGridHTML(list) {
  // Latest Apps grid: big icon tile, name (max 2 lines), star rating.
  // Catalogue only, apps.json order, no dates, no "NEW" badges.
  return list.map((a) =>
    `<a class="g-card" href="/apps/${esc(a.slug)}/">`
    + `<div class="g-ic" style="background:${esc(a.icon_colour)}">${tileInner(a, true)}</div>`
    + `<div class="g-nm">${esc(a.name)}</div>`
    + (a.rating === 'tbd' ? '' : `<div class="g-rt"><span class="st">★</span> ${esc(a.rating)}</div>`)
    + `</a>`).join('');
}

function footer() {
  // Brand column uses the official lockup, exactly as the header does:
  // the real leaning-N icon SVG + "APKNITRO" in Montserrat ExtraBold
  // Italic (off-white on navy). Never plain bold text, never a redrawn N.
  // Top apps = top 5 in the existing Trending order, generated from data.
  const top5 = byDownloads.slice(0, 5).map((a) =>
    `<li><a href="/apps/${esc(a.slug)}/">${esc(a.name)}</a></li>`).join('');
  return `<footer class="s-foot"><div class="wrap">
  <div class="f-cols">
    <div class="f-col f-brand">
      <a class="f-logo" href="/">${LOGO_N}<span>APKNITRO</span></a>
      <p class="f-tag">Fast APKs. Direct downloads.</p>
      <p class="f-note">Scan status is shown on every app page. Files are linked from Google Drive; no APK file is hosted here.</p>
    </div>
    <nav class="f-col" aria-label="Browse">
      <h3>Browse</h3>
      <ul>
        <li><a href="/apps/">All apps</a></li>
        <li><a href="/games/">Games</a></li>
        <li><a href="/mods/">Mods</a></li>
        <li><a href="/charts/">Top charts</a></li>
        <li><a href="/search/">Search</a></li>
      </ul>
    </nav>
    <nav class="f-col" aria-label="Top apps">
      <h3>Top apps</h3>
      <ul>${top5}</ul>
    </nav>
    <nav class="f-col" aria-label="Site">
      <h3>Site</h3>
      <ul>
        <li><a href="/sitemap.xml">Sitemap</a></li>
        <li><a href="#top">Back to top</a></li>
      </ul>
    </nav>
  </div>
  <div class="f-bar"><span>© 2026 ApkNitro</span><span>All APKs are linked from Google Drive — ApkNitro hosts no APK files.</span></div>
</div></footer>
<button type="button" class="to-top" aria-label="Back to top">${UP_ARROW}</button>`;
}

const THEME_SCRIPT = `<script>(function(){try{var t=localStorage.getItem('apknitro-theme');var d=t==='dark'?'dark':t==='light'?'light':(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',d);}catch(e){}})();</script>`;
const SCRIPTS = `<script type="module" src="/js/main.js" defer></script>`;

function head({ title, description, canonical, ogImage, jsonLd }) {
  const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Montserrat:ital,wght@1,800;1,900&display=swap" rel="stylesheet">';
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:site_name" content="ApkNitro">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/main.css">
${fonts}
${THEME_SCRIPT}
${jsonLd ? `<script type="application/ld+json">\n${jsonLd}\n</script>` : ''}`;
}

function rowHTML(a, opts) {
  const size = fmtSize(a.size_mb);
  const rating = a.rating === 'tbd' ? 'tbd' : a.rating;
  // Trending rows only: big rank number (top 3 in red) and the category
  // in the meta line. Every other caller omits opts and gets the plain row.
  const rank = opts && opts.rank != null
    ? `<span class="rank${opts.rank <= 3 ? ' top' : ''}" aria-hidden="true">${opts.rank}</span>` : '';
  const cat = opts && opts.category ? ` · ${esc(a.category)}` : '';
  // The name+meta is ONE block link (min-height 44px via CSS) so the
  // row's main tap target is a proper target; the Download control
  // stays a separate sibling link — never nested links.
  return `<div class="row" data-name="${esc((a.name + ' ' + a.category + ' ' + (a.tags || []).join(' ')).toLowerCase())}" data-cat="${esc(a.category)}" data-mod="${a.signed_type === 'mod' ? '1' : '0'}">`
    + rank
    + `<div class="ic" style="background:${esc(a.icon_colour)}">${tileInner(a, true)}</div>`
    + `<a class="tx" href="/apps/${esc(a.slug)}/"><span class="nm">${esc(a.name)}</span>`
    + `<span class="mt"><span class="m1">v${esc(tbd(a.version))} · ${esc(size)}</span><span class="msep"> · </span><span class="m2">★ <b>${esc(rating)}</b>${cat}</span></span></a>`
    + `<a class="dl" href="/apps/${esc(a.slug)}/" aria-label="Download ${esc(a.name)}"><span class="dl-tx">Download</span>${DL_ICON}</a></div>`;
}

function jsonLdApp(a) {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: a.name + ' APK',
    applicationCategory: a.category,
    operatingSystem: 'Android',
    url: SITE_URL + '/apps/' + a.slug + '/',
  };
  if (a.version !== 'tbd') obj.softwareVersion = a.version;
  if (a.size_mb !== 'tbd' && a.size_mb != null) obj.fileSize = fmtSize(a.size_mb);
  if (a.rating !== 'tbd') {
    obj.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(a.rating),
      ...(a.review_count !== 'tbd' ? { reviewCount: String(a.review_count) } : {}),
    };
  }
  return JSON.stringify(obj, null, 2);
}

function appPage(a, allApps) {
  const tpl = read(path.join(SRC, 'templates', 'app.html'));
  const size = fmtSize(a.size_mb);
  const stats = [];
  if (a.rating !== 'tbd') stats.push(`<span class="stars">${stars(a.rating)}</span> <b>${esc(a.rating)}</b>`);
  if (a.review_count !== 'tbd') stats.push(`${esc(a.review_count)} reviews`);
  if (a.download_count !== 'tbd') stats.push(`<b>${esc(a.download_count)}</b> downloads`);
  stats.push(`<b>${esc(size)}</b>`);
  const isMod = a.signed_type === 'mod';
  const trustVariant = isMod
    ? '<br><span class="warn">Re-signed by uploader — scan result only.</span> This mod APK does not match the developer\u2019s original signature. Play Protect may warn on install — that is expected for a re-signed file.'
    : '<br><span class="warn">Not distributed on Google Play — scan result only.</span> This app is not on Google Play; check the scan result above once it exists before installing.';
  const known = (v) => tbd(v) !== 'tbd';
  const workParts = [];
  if (known(a.mod_base_version)) workParts.push(`Built on ${esc(a.name.replace(/ Mod$/, ''))} v${esc(a.mod_base_version)}`);
  if (known(a.mod_uploader)) workParts.push(`Uploaded by <b>${esc(a.mod_uploader)}</b>`);
  if (known(a.mod_working_percent)) workParts.push(`<b>${esc(a.mod_working_percent)} working</b>`);
  const workLine = workParts.length ? `<div class="work">${workParts.join(' · ')}</div>` : '';
  const modnotes = isMod ? `<div class="modnotes"><h2>What this mod changes</h2><ul>${
    (a.mod_changes || []).map((c) => `<li>${esc(c)}</li>`).join('')
  }</ul>${workLine}</div>` : '';
  const shots = (a.screenshots || []).map((label, i) =>
    `<div class="shot"><div class="big">${esc(a.icon_initials)}</div><div class="cap">Screenshot — ${esc(label)}</div></div>`).join('');
  const vers = (a.old_versions && a.old_versions.length)
    ? a.old_versions.map((v, i) =>
      `<div class="ver"><div><div class="v">${esc(v.version)}</div><div class="m">${i === 0 ? 'Latest · ' : ''}${esc(v.date)} · ${esc(fmtSize(v.size_mb))}</div></div>`
      + (a.download_url !== 'tbd'
        ? `<a class="vd" href="${esc(a.download_url)}">Download</a>`
        : `<span class="vd disabled">Download</span>`) + `</div>`).join('')
    : '<p class="empty">No older versions listed yet.</p>';
  const similar = allApps.filter((x) => x.slug !== a.slug && x.category === a.category).slice(0, 3);
  const similarList = similar.length ? similar : allApps.filter((x) => x.slug !== a.slug).slice(0, 3);
  const dlPrimary = a.download_url !== 'tbd'
    ? `<a class="dl-primary" href="${esc(a.download_url)}">Download APK <small>· ${esc(size)}</small></a>`
    : `<span class="dl-primary disabled">Download coming soon <small>· ${esc(size)}</small></span>`
      + `<p class="empty" style="margin:0 16px;padding:0 0 6px;">No download file linked yet — the file link will appear here once it is added.</p>`;
  const dlSticky = a.download_url !== 'tbd'
    ? `<a class="dl-sticky" href="${esc(a.download_url)}">Download <small>· ${esc(size)}</small></a>`
    : `<span class="dl-sticky disabled">Download <small>· ${esc(size)}</small></span>`;
  const desc = `${esc(a.short_description)} <b>${esc(size)}</b> · Android 5.0+ · v${esc(tbd(a.version))}.`;
  return fill(tpl, {
    HEAD: head({
      title: `${a.name} APK Download v${tbd(a.version)} — ApkNitro`,
      description: `Download ${a.name} APK v${tbd(a.version)} (${size}) for Android. Scan status, old versions and similar apps on ApkNitro.`,
      canonical: `${SITE_URL}/apps/${a.slug}/`,
      ogImage: `${SITE_URL}/assets/logos/icon-red.svg`,
      jsonLd: jsonLdApp(a),
    }),
    HEADER: header(''),
    FOOTER: footer(),
    SCRIPTS,
    APP_NAME: esc(a.name + ' APK'),
    ICON_COLOUR: esc(a.icon_colour),
    ICON_INITIALS: esc(a.icon_initials),
    ICON_IMG: iconImg(a, false),
    DEVELOPER: esc(tbd(a.developer)),
    CATEGORY: esc(a.category),
    VERSION: esc(tbd(a.version)),
    SIZE_LABEL: esc(size),
    STATS: stats.join(' · '),
    DOWNLOAD_PRIMARY: dlPrimary,
    TRUST_VARIANT: trustVariant,
    MODNOTES: modnotes,
    SHOTS: shots,
    DESCRIPTION: desc,
    OLD_VERSIONS: vers,
    ROWS_SIMILAR: similarList.map(rowHTML).join(''),
    DOWNLOAD_STICKY: dlSticky,
  });
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // Copy static assets.
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
  for (const f of ['tokens.css', 'main.css']) fs.copyFileSync(path.join(SRC, 'css', f), path.join(DIST, 'css', f));
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  for (const f of fs.readdirSync(path.join(SRC, 'js'))) fs.copyFileSync(path.join(SRC, 'js', f), path.join(DIST, 'js', f));
  fs.mkdirSync(path.join(DIST, 'assets', 'logos'), { recursive: true });
  for (const f of fs.readdirSync(path.join(SRC, 'assets', 'logos'))) fs.copyFileSync(path.join(SRC, 'assets', 'logos', f), path.join(DIST, 'assets', 'logos', f));
  fs.copyFileSync(path.join(SRC, 'assets', 'favicon.svg'), path.join(DIST, 'assets', 'favicon.svg'));
  fs.copyFileSync(path.join(SRC, 'assets', 'hero-bg.webp'), path.join(DIST, 'assets', 'hero-bg.webp'));
  fs.mkdirSync(path.join(DIST, 'assets', 'icons'), { recursive: true });
  for (const f of fs.readdirSync(path.join(SRC, 'assets', 'icons'))) fs.copyFileSync(path.join(SRC, 'assets', 'icons', f), path.join(DIST, 'assets', 'icons', f));
  fs.mkdirSync(path.join(DIST, 'assets', 'banners'), { recursive: true });
  for (const f of fs.readdirSync(path.join(SRC, 'assets', 'banners'))) fs.copyFileSync(path.join(SRC, 'assets', 'banners', f), path.join(DIST, 'assets', 'banners', f));

  const skipped = [];
  const pages = []; // [relPath, url] for sitemap

  // Homepage.
  const homeTpl = read(path.join(SRC, 'templates', 'home.html'));
  write('index.html', fill(homeTpl, {
    HEAD: head({
      title: 'ApkNitro — Fast APK Downloads',
      description: `Download Android APKs and mods on ApkNitro. ${apps.length} apps listed — direct downloads, no account needed.`,
      canonical: SITE_URL + '/',
      ogImage: SITE_URL + '/assets/logos/icon-red.svg',
      jsonLd: null,
    }),
    HEADER: header('/'),
    FOOTER: footer(),
    SCRIPTS,
    CAROUSEL: carouselHTML(apps),
    ROWS_TRENDING: byDownloads.slice(0, 8).map((a, i) => rowHTML(a, { rank: i + 1, category: true })).join(''),
    GRID_LATEST: latestGridHTML(apps),
    ROWS_CHARTS: topCharts.map((a, i) => rowHTML(a, { rank: i + 1, category: true })).join(''),
  }));
  pages.push(['index.html', SITE_URL + '/']);

  // App pages.
  const appTpl = read(path.join(SRC, 'templates', 'app.html'));
  for (const a of apps) {
    try {
      if (!a.slug || !a.name) throw new Error('missing slug/name');
      write(`apps/${a.slug}/index.html`, appPage(a, apps));
      pages.push([`apps/${a.slug}/index.html`, `${SITE_URL}/apps/${a.slug}/`]);
    } catch (e) {
      skipped.push(`${a.slug || '?'}: ${e.message}`);
      console.error('SKIP app page:', a.slug, e.message);
    }
  }

  // Category / charts / search pages.
  const catTpl = read(path.join(SRC, 'templates', 'category.html'));
  const chartsTpl = read(path.join(SRC, 'templates', 'charts.html'));
  const searchTpl = read(path.join(SRC, 'templates', 'search.html'));
  const cats = [
    ['apps', 'All apps', 'Every APK listed on ApkNitro', apps],
    ['games', 'Games', 'Games on ApkNitro', apps.filter((a) => a.category === 'Games')],
    ['mods', 'Mods', 'Modified APKs on ApkNitro', apps.filter((a) => a.signed_type === 'mod')],
  ];
  for (const [slug, heading, sub, list] of cats) {
    write(`${slug}/index.html`, fill(catTpl, {
      HEAD: head({
        title: `${heading} — ApkNitro`,
        description: `${sub}. ${list.length} apps listed.`,
        canonical: `${SITE_URL}/${slug}/`,
        ogImage: SITE_URL + '/assets/logos/icon-red.svg',
        jsonLd: null,
      }),
      HEADER: header(`/${slug}/`),
      FOOTER: footer(),
      SCRIPTS,
      PAGE_HEADING: esc(heading),
      PAGE_SUB: esc(sub),
      ROWS: list.length ? list.map(rowHTML).join('') : '<p class="empty">No apps in this category yet.</p>',
    }));
    pages.push([`${slug}/index.html`, `${SITE_URL}/${slug}/`]);
  }
  write('charts/index.html', fill(chartsTpl, {
    HEAD: head({
      title: 'Top Charts — Most Downloaded APKs — ApkNitro',
      description: `Top free APKs on ApkNitro this week, ranked by downloads. ${apps.length} apps listed.`,
      canonical: SITE_URL + '/charts/',
      ogImage: SITE_URL + '/assets/logos/icon-red.svg',
      jsonLd: null,
    }),
    HEADER: header('/charts/'),
    FOOTER: footer(),
    SCRIPTS,
    ROWS: chartsPageOrder.map(rowHTML).join(''),
  }));
  pages.push(['charts/index.html', SITE_URL + '/charts/']);
  write('search/index.html', fill(searchTpl, {
    HEAD: head({
      title: 'Search APKs — ApkNitro',
      description: `Search ${apps.length} Android APKs and mods on ApkNitro.`,
      canonical: SITE_URL + '/search/',
      ogImage: SITE_URL + '/assets/logos/icon-red.svg',
      jsonLd: null,
    }),
    HEADER: header(''),
    FOOTER: footer(),
    SCRIPTS,
    ROWS: apps.map(rowHTML).join(''),
  }));
  pages.push(['search/index.html', SITE_URL + '/search/']);

  // sitemap.xml + robots.txt
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + pages.map(([, url]) => `  <url><loc>${url}</loc></url>`).join('\n')
    + `\n</urlset>\n`;
  write('sitemap.xml', sitemap);
  write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: https://apknitro.com/sitemap.xml\n');

  const count = pages.length;
  console.log(`Built ${count} HTML pages (${apps.length} apps), skipped: ${skipped.length ? skipped.join('; ') : 'none'}`);
  return { pages: count, skipped };
}

main();
