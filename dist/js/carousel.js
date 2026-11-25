// carousel.js — prev/next arrows scroll the homepage carousel track one
// card at a time. Swipe/scroll works with JS off (native overflow); the
// arrows are a progressive enhancement only.
export function init() {
  var track = document.querySelector('[data-carousel]');
  if (!track) return;
  var prev = document.querySelector('[data-car-prev]');
  var next = document.querySelector('[data-car-next]');
  function step() {
    var card = track.querySelector('.card');
    return card ? card.getBoundingClientRect().width + 12 : 252;
  }
  if (prev) prev.addEventListener('click', function () {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  if (next) next.addEventListener('click', function () {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });
}
