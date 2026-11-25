// back-to-top.js — floating Back to top button. Appears after one
// viewport of scrolling (fades + slides in via the .visible class);
// smooth-scrolls to the top on click. On app pages the button sits
// ABOVE the sticky download bar while that bar is shown (.above-bar),
// never on it. One rAF-guarded scroll listener; the click uses the
// native smooth scroll, which is instant for prefers-reduced-motion
// users automatically.
export function init() {
  var btn = document.querySelector('.to-top');
  if (!btn) return;
  var bar = document.getElementById('stickyDl');
  var ticking = false;
  function update() {
    ticking = false;
    btn.classList.toggle('visible', window.scrollY > window.innerHeight);
    if (bar) btn.classList.toggle('above-bar', bar.classList.contains('show'));
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
