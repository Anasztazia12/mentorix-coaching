document.addEventListener('DOMContentLoaded', function () {
var items = document.querySelectorAll('.reveal');
if (!('IntersectionObserver' in window)) {
items.forEach(function (item) { item.classList.add('is-visible'); });
return;
}
var observer = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
entry.target.classList.add('is-visible');
observer.unobserve(entry.target);
}
});
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
items.forEach(function (item) { observer.observe(item); });
});
