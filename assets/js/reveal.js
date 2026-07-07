document.addEventListener('DOMContentLoaded', function () {
var items = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-left'));

var groups = new Map();
items.forEach(function (item) {
var group = item.closest('.row, .chevron-row') || item.parentElement || document.body;
if (!groups.has(group)) groups.set(group, []);
groups.get(group).push(item);
});
groups.forEach(function (groupItems, group) {
var step = parseFloat(group.dataset && group.dataset.stagger) || 0.25;
groupItems.forEach(function (item, index) {
item.style.transitionDelay = (index * step) + 's';
});
});

var words = Array.prototype.slice.call(document.querySelectorAll('.word-reveal, .word-pop'));
var wordGroups = new Map();
words.forEach(function (word) {
var group = word.closest('h1, h2, h3') || word.parentElement || document.body;
if (!wordGroups.has(group)) wordGroups.set(group, []);
wordGroups.get(group).push(word);
});
wordGroups.forEach(function (groupWords) {
groupWords.forEach(function (word, index) {
word.style.transitionDelay = (index * 0.3) + 's';
});
});

function reveal(el) {
// For elements already in view on page load (e.g. the hero heading),
// the browser can batch the hidden starting state and the visible
// state into the same first paint if we flip the class too soon,
// so the transition never plays. A macrotask (setTimeout) plus a
// double rAF guarantees at least one real paint of the hidden state
// happens first.
setTimeout(function () {
requestAnimationFrame(function () {
requestAnimationFrame(function () {
el.classList.add('is-visible');
});
});
}, 50);
}

if (!('IntersectionObserver' in window)) {
items.forEach(reveal);
words.forEach(reveal);
return;
}
function makeObserver(threshold, rootMargin) {
var obs = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
reveal(entry.target);
obs.unobserve(entry.target);
}
});
}, { threshold: threshold, rootMargin: rootMargin });
return obs;
}

var earlyItems = items.filter(function (item) { return item.dataset.threshold; });
var defaultItems = items.filter(function (item) { return !item.dataset.threshold; });

var observer = makeObserver(0.5, '0px 0px -40px 0px');
defaultItems.forEach(function (item) { observer.observe(item); });

earlyItems.forEach(function (item) {
var earlyObserver = makeObserver(parseFloat(item.dataset.threshold), '0px 0px 60px 0px');
earlyObserver.observe(item);
});

var wordObserver = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
reveal(entry.target);
wordObserver.unobserve(entry.target);
}
});
}, { threshold: 0.3 });
words.forEach(function (word) { wordObserver.observe(word); });
});
