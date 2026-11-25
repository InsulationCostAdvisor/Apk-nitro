// sticky-download.js — shows the sticky bottom download bar when the
// primary download button scrolls out of view. IntersectionObserver,
// not a scroll listener. The bar holds the SAME download link.
export function init() {
  var primary = document.querySelector('.dl-primary');
  var bar = document.getElementById('stickyDl');
  if (!primary || !bar || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    bar.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0 });
  io.observe(primary);
}
