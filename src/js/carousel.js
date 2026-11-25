// carousel.js — prev/next arrows scroll the homepage carousel track one
// card at a time. Swipe/scroll works with JS off (native overflow); the
// arrows are a progressive enhancement only.
//
// Auto-scroll (2026-11-25, user instruction): the track advances one card
// every 3 seconds on a seamless loop. The original card set is duplicated
// once (clones are aria-hidden and unfocusable) so that when the scroll
// position passes the end of the original set it can jump back by exactly
// one set width — the content is identical, so the jump is invisible.
// Auto-scroll pauses on hover, while the user drags, while focus is
// inside the track, and while the tab is hidden; any manual swipe, arrow
// click or drag pauses it for 4 seconds, then it resumes. It never runs
// when the user has prefers-reduced-motion set, and it never runs when
// all cards already fit on screen.
export function init() {
  var track = document.querySelector('[data-carousel]');
  if (!track) return;
  var section = track.closest('.carousel');
  var prev = document.querySelector('[data-car-prev]');
  var next = document.querySelector('[data-car-next]');
  function step() {
    var card = track.querySelector('.card');
    return card ? card.getBoundingClientRect().width + 12 : 252;
  }
  var resumeAt = 0;
  function pauseBriefly() { resumeAt = Date.now() + 4000; }
  if (prev) prev.addEventListener('click', function () {
    pauseBriefly();
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  if (next) next.addEventListener('click', function () {
    pauseBriefly();
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  // No auto-scroll for reduced motion, or when there is nothing to scroll.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (track.scrollWidth <= track.clientWidth + 10) return;
  var originals = Array.prototype.slice.call(track.children);
  if (originals.length < 2) return;
  originals.forEach(function (el) {
    var clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    var links = clone.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) links[i].setAttribute('tabindex', '-1');
    track.appendChild(clone);
  });
  var firstClone = track.children[originals.length];

  var hovering = false;
  var dragging = false;
  var focused = false;
  function paused() {
    return hovering || dragging || focused || document.hidden
      || Date.now() < resumeAt;
  }
  function advance() {
    if (paused()) return;
    // Only scroll while the carousel is on screen.
    var r = track.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    // Seamless loop: jump back one whole set width when the original set
    // has scrolled past. offsetLeft of the first clone is exactly one set
    // width (cards are fixed-width with a fixed gap), so the jump lands on
    // the same snap point showing identical content.
    var setWidth = firstClone.offsetLeft;
    if (setWidth <= track.clientWidth) return;
    if (track.scrollLeft >= setWidth - 2) track.scrollLeft -= setWidth;
    track.scrollBy({ left: step(), behavior: 'smooth' });
  }
  setInterval(advance, 3000);

  if (section) {
    section.addEventListener('mouseenter', function () { hovering = true; });
    section.addEventListener('mouseleave', function () { hovering = false; });
  }
  track.addEventListener('pointerdown', function () { dragging = true; pauseBriefly(); });
  window.addEventListener('pointerup', function () { dragging = false; pauseBriefly(); });
  track.addEventListener('focusin', function () { focused = true; });
  track.addEventListener('focusout', function () { focused = false; pauseBriefly(); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) pauseBriefly();
  });
}
