// nav.js — mobile nav toggle. The nav is visible by default on desktop
// and hidden behind the toggle on small screens (see main.css).
export function init() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.s-header .nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
