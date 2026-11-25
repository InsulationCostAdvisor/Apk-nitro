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

const LOGO_N = read(path.join(SRC, 'assets', 'logos', 'icon-red.svg'))
  .replace(/<svg /, '<svg width="26" height="26" ');
const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';

function header(active) {
  const nav = [
    ['/apps/', 'Apps'], ['/games/', 'Games'], ['/mods/', 'Mods'], ['/charts/', 'Top charts'],
  ].map(([href, label]) =>
    `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="s-header"><div class="inner wrap">
  <a class="logo" href="/">${LOGO_N}Apk<span class="n2">Nitro</span></a>
  <button class="nav-toggle" aria-expanded="false" aria-label="Menu">Menu</button>
  <nav class="nav" aria-label="Main">${nav}</nav>
  <form class="search" action="/search/" method="get" role="search">${SEARCH_ICON}<input type="search" name="q" placeholder="Search apps…" aria-label="Search apps"></form>
  <button class="theme-btn" data-theme-toggle type="button">Theme: System</button>
</div></header>`;
}

function footer() {
  return `<footer class="s-foot"><div class="wrap">
  <b>ApkNitro</b> — fast APK downloads.<br>
  <a href="/apps/">All apps</a> · <a href="/games/">Games</a> · <a href="/mods/">Mods</a> · <a href="/charts/">Top charts</a> · <a href="/sitemap.xml">Sitemap</a><br>
  Scan status is shown on every app page. Files are linked from Google Drive; no APK file is hosted here.
</div></footer>`;
}

const THEME_SCRIPT = `<script>(function(){try{var t=localStorage.getItem('apknitro-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;
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

function rowHTML(a) {
  const size = fmtSize(a.size_mb);
  const rating = a.rating === 'tbd' ? 'tbd' : a.rating;
  return `<div class="row" data-name="${esc((a.name + ' ' + a.category + ' ' + (a.tags || []).join(' ')).toLowerCase())}" data-cat="${esc(a.category)}" data-mod="${a.signed_type === 'mod' ? '1' : '0'}">`
    + `<div class="ic" style="background:${esc(a.icon_colour)}">${esc(a.icon_initials)}</div>`
    + `<div class="tx"><div class="nm"><a href="/apps/${esc(a.slug)}/">${esc(a.name)}</a></div>`
    + `<div class="mt">v${esc(tbd(a.version))} · ${esc(size)} · ★ <b>${esc(rating)}</b></div></div>`
    + `<a class="dl" href="/apps/${esc(a.slug)}/">Download</a></div>`;
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
  const modnotes = isMod ? `<div class="modnotes"><h2>What this mod changes</h2><ul>${
    (a.mod_changes || []).map((c) => `<li>${esc(c)}</li>`).join('')
  }</ul><div class="work">Built on ${esc(a.name.replace(/ Mod$/, ''))} v${esc(tbd(a.mod_base_version))} · Uploaded by <b>${esc(tbd(a.mod_uploader))}</b> · <b>${esc(tbd(a.mod_working_percent))} working</b></div></div>` : '';
  const shots = (a.screenshots || []).map((label, i) =>
    `<div class="shot"><div class="big">${esc(a.icon_initials)}</div><div class="cap">Screenshot — ${esc(label)}</div></div>`).join('');
  const vers = (a.old_versions && a.old_versions.length)
    ? a.old_versions.map((v, i) =>
      `<div class="ver"><div><div class="v">${esc(v.version)}</div><div class="m">${i === 0 ? 'Latest · ' : ''}${esc(v.date)} · ${esc(fmtSize(v.size_mb))}</div></div>`
      + (a.download_url !== 'tbd'
        ? `<a class="vd" href="${esc(a.download_url)}">Download</a>`
        : `<span class="vd disabled">Download</span>`)).join('')
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

  const byDownloads = [...apps].sort((x, y) => parseDownloads(y.download_count) - parseDownloads(x.download_count));
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
    HEADER: header(''),
    FOOTER: footer(),
    SCRIPTS,
    ROWS_TRENDING: byDownloads.slice(0, 8).map(rowHTML).join(''),
    ROWS_CHARTS: byDownloads.slice(2, 8).map(rowHTML).join(''),
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
    ROWS: byDownloads.map(rowHTML).join(''),
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
