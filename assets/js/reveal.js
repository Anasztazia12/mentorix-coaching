document.addEventListener('DOMContentLoaded', function () {
var items = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-left'));

var groups = new Map();
items.forEach(function (item) {
var group = item.closest('.row, .chevron-row') || item.parentElement || document.body;
if (!groups.has(group)) groups.set(group, []);
groups.get(group).push(item);
});
groups.forEach(function (groupItems) {
groupItems.forEach(function (item, index) {
item.style.transitionDelay = (index * 0.1) + 's';
});
});

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
}, { threshold: 0.5, rootMargin: '0px 0px -40px 0px' });
items.forEach(function (item) { observer.observe(item); });
});
