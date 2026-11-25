// filters.js — category chips filter the homepage trending rows in place.
// Event delegation: one listener, no listener per row.
export function init() {
  var chips = document.getElementById('filter-chips');
  var rowsBox = document.getElementById('trend-rows');
  if (!chips || !rowsBox) return;
  chips.addEventListener('click', function (ev) {
    var chip = ev.target.closest('a[data-filter]');
    if (!chip) return;
    var f = chip.getAttribute('data-filter');
    if (f === 'editors') return; // Top charts is a real page — navigate.
    ev.preventDefault();
    chips.querySelectorAll('a').forEach(function (a) { a.classList.remove('on'); });
    chip.classList.add('on');
    rowsBox.querySelectorAll('.row').forEach(function (row) {
      var cat = row.getAttribute('data-cat');
      var mod = row.getAttribute('data-mod') === '1';
      var show = f === 'all'
        || (f === 'Games' && cat === 'Games')
        || (f === 'Apps' && cat !== 'Games')
        || (f === 'Mods' && mod);
      row.hidden = !show;
    });
  });
}
