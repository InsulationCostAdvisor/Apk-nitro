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
    var eff = effective(t);
    // Always set an explicit data-theme: there is no
    // prefers-color-scheme media query in the CSS, so removing the
    // attribute for 'system' would render light even on a dark system
    // while the icon/label (derived from effective()) said dark — and
    // a system -> light click would then show no visible change.
    // The rendered theme now always equals the effective theme.
    root.setAttribute('data-theme', eff);
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
    // The forced reflow below is load-bearing: without it the class
    // and the new theme land in the same frame, the browser computes
    // styles once with both changes, and there is no "before" state
    // to transition from — the switch snaps instead of fading.
    root.classList.add('theme-anim');
    void root.offsetHeight;
    if (animTimer) clearTimeout(animTimer);
    animTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 350);
    apply(current);
  });
}
