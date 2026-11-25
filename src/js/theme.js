// theme.js — System / Light / Dark. Follows system by default; the stored
// choice is applied by a tiny inline script in <head> to kill the flash.
// The header control is an icon button: moon shows in light mode (tap for
// dark), sun shows in dark mode (tap for light). The three-state cycle is
// unchanged: System -> Light -> Dark -> System.
export function init() {
  var root = document.documentElement;
  var KEY = 'apknitro-theme';
  var btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  var mq = null;
  try { mq = window.matchMedia('(prefers-color-scheme: dark)'); } catch (e) { /* no matchMedia */ }
  function effective(t) {
    if (t === 'dark') return 'dark';
    if (t === 'light') return 'light';
    return mq && mq.matches ? 'dark' : 'light';
  }
  function apply(t) {
    if (t === 'dark') root.setAttribute('data-theme', 'dark');
    else if (t === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    var eff = effective(t);
    btn.setAttribute('data-icon', eff === 'dark' ? 'sun' : 'moon');
    btn.setAttribute('aria-label', eff === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  var current = stored === 'light' || stored === 'dark' ? stored : 'system';
  apply(current);
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { apply(current); });
  var animTimer = null;
  btn.addEventListener('click', function () {
    current = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    try {
      if (current === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, current);
    } catch (e) { /* storage unavailable */ }
    // Smooth cross-fade, only for this user-initiated switch: the class
    // enables the CSS transition, then is removed after the fade. The
    // first page load never gets the class, so it never fades in.
    root.classList.add('theme-anim');
    if (animTimer) clearTimeout(animTimer);
    animTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 350);
    apply(current);
  });
}
