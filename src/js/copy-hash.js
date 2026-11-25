// copy-hash.js — copy the full SHA-256. Clipboard API with a fallback.
// The full hash is always selectable as text; the button is only rendered
// when a real hash exists.
export function init() {
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-copy-hash]');
    if (!btn) return;
    var hash = btn.getAttribute('data-copy-hash');
    if (!hash) return;
    function done() {
      var old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = old; }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hash).then(done, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = hash;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* copy unavailable */ }
      document.body.removeChild(ta);
    }
  });
}
