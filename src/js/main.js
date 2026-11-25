// main.js — entry point. Each module's init() runs in its own try/catch
// so one broken feature cannot kill the others.
import { init as initTheme } from './theme.js';
import { init as initSearch } from './search.js';
import { init as initFilters } from './filters.js';
import { init as initSticky } from './sticky-download.js';
import { init as initCopyHash } from './copy-hash.js';
import { init as initNav } from './nav.js';
import { init as initLazy } from './lazy.js';
import { init as initCarousel } from './carousel.js';

var modules = [initTheme, initSearch, initFilters, initSticky, initCopyHash, initNav, initLazy, initCarousel];
modules.forEach(function (init) {
  try { init(); } catch (err) { /* one broken feature must not kill the rest */ }
});
