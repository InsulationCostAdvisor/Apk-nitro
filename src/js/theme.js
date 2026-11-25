// theme.js — System / Light / Dark. Follows system by default; the stored
// choice is applied by a tiny inline script in <head> to kill the flash.
export function init() {
  var root = document.documentElement;
  var KEY = 'apknitro-theme';
  var btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  function label(t) {
    return t === 'light' ? 'Theme: Light' : t === 'dark' ? 'Theme: Dark' : 'Theme: System';
  }
  function apply(t) {
    if (t === 'dark') root.setAttribute('data-theme', 'dark');
    else if (t === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    btn.textContent = label(t);
  }
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  var current = stored === 'light' || stored === 'dark' ? stored : 'system';
  apply(current);
  btn.addEventListener('click', function () {
    current = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    try {
      if (current === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, current);
    } catch (e) { /* storage unavailable */ }
    apply(current);
  });
}
