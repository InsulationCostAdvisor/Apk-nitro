// search.js — live filtering on the search page. Debounced, IME-safe,
// locale-aware (NFKD normalisation, no ASCII assumptions). Filters the
// server-rendered rows, so the page works with JS off too.
export function init() {
  var input = document.getElementById('search-input');
  var rowsBox = document.getElementById('search-rows');
  var empty = document.getElementById('search-empty');
  if (!input || !rowsBox) return;
  var timer = null;
  function norm(s) {
    return (s || '').normalize('NFKD').toLowerCase();
  }
  function run() {
    var q = norm(input.value.trim());
    var rows = rowsBox.querySelectorAll('.row');
    var shown = 0;
    rows.forEach(function (row) {
      var hay = norm(row.getAttribute('data-name') + ' ' + row.getAttribute('data-cat'));
      var match = !q || hay.indexOf(q) !== -1;
      row.hidden = !match;
      if (match) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
  }
  input.addEventListener('input', function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, 150);
  });
  input.addEventListener('compositionend', run);
  // Prefill from ?q= so a search from the header/hero lands filtered.
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    input.value = q;
    run();
  }
}
