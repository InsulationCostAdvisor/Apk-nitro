// lazy.js — lazy-loads images below the fold. Images carry loading="lazy"
// and data-src; this swaps the real source in when they approach the
// viewport. No images on the page yet — the module is ready for them.
export function init() {
  var imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  if (!('IntersectionObserver' in window)) {
    imgs.forEach(function (img) { img.src = img.getAttribute('data-src'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var img = entry.target;
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
      io.unobserve(img);
    });
  }, { rootMargin: '200px' });
  imgs.forEach(function (img) { io.observe(img); });
}
