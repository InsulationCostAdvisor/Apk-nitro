// header-search.js — inline header search with live results.
// The search icon opens an expanding field in the header (no redirect);
// matching APKs appear in a dropdown as the user types, from the app
// index embedded in the page (#hs-data). No-JS fallback: the icon is a
// plain link to /search/. Enter with text goes to /search/?q=… (the
// search page prefills from ?q=). Built with DOM APIs only — no
// innerHTML with data. Debounced 120ms, IME-safe, locale-aware.
export function init() {
  var box = document.querySelector('[data-header-search]');
  if (!box) return;
  var toggle = box.querySelector('[data-hs-toggle]');
  var input = box.querySelector('[data-hs-input]');
  var results = box.querySelector('.h-search-results');
  var dataEl = document.getElementById('hs-data');
  if (!toggle || !input || !results || !dataEl) return;
  var apps;
  try {
    apps = JSON.parse(dataEl.textContent);
  } catch (e) {
    return; // bad data: leave the icon as a plain link to /search/
  }
  if (!Array.isArray(apps) || !apps.length) return;

  var timer = null;
  var active = -1; // index of the keyboard-highlighted result, -1 = none

  function norm(s) {
    return (s || '').normalize('NFKD').toLowerCase();
  }
  function open() {
    box.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-expanded', 'true');
    input.focus();
  }
  function close() {
    box.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    input.value = '';
    results.hidden = true;
    results.textContent = '';
    active = -1;
  }
  function isOpen() {
    return box.classList.contains('open');
  }
  function itemEl(a, i) {
    var link = document.createElement('a');
    link.className = 'hs-item';
    link.id = 'hs-item-' + i;
    link.href = '/apps/' + a.s + '/';
    link.setAttribute('role', 'option');
    var ic = document.createElement('span');
    ic.className = 'hs-ic';
    ic.style.backgroundColor = a.ic;
    ic.textContent = a.ii;
    var tx = document.createElement('span');
    tx.className = 'hs-tx';
    var nm = document.createElement('span');
    nm.className = 'hs-nm';
    nm.textContent = a.n;
    var mt = document.createElement('span');
    mt.className = 'hs-mt';
    mt.textContent = 'v' + a.v + ' · ' + a.z + ' · ' + a.c;
    tx.appendChild(nm);
    tx.appendChild(mt);
    link.appendChild(ic);
    link.appendChild(tx);
    return link;
  }
  function render() {
    var q = norm(input.value.trim());
    results.textContent = '';
    active = -1;
    input.removeAttribute('aria-activedescendant');
    if (!q) {
      results.hidden = true;
      return;
    }
    var matches = apps.filter(function (a) {
      return norm(a.n + ' ' + a.c).indexOf(q) !== -1;
    });
    if (!matches.length) {
      var none = document.createElement('div');
      none.className = 'hs-none';
      none.textContent = 'No apps match "' + input.value.trim() + '".';
      results.appendChild(none);
    } else {
      matches.forEach(function (a, i) {
        results.appendChild(itemEl(a, i));
      });
    }
    results.hidden = false;
  }
  function setActive(i) {
    var items = results.querySelectorAll('.hs-item');
    if (!items.length) return;
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    items.forEach(function (el) { el.classList.remove('active'); });
    items[i].classList.add('active');
    input.setAttribute('aria-activedescendant', items[i].id);
    active = i;
  }

  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    if (isOpen()) close();
    else open();
  });
  input.addEventListener('input', function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(render, 120);
  });
  input.addEventListener('compositionend', render);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'Enter') {
      var items = results.querySelectorAll('.hs-item');
      if (active >= 0 && items[active]) {
        e.preventDefault();
        window.location.href = items[active].href;
      } else if (input.value.trim()) {
        e.preventDefault();
        window.location.href = '/search/?q=' + encodeURIComponent(input.value.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (isOpen() && !box.contains(e.target)) close();
  });
}
