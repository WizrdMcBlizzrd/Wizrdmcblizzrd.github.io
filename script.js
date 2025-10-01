// Preload next page background for snappy transitions
function preload(srcs) { srcs.forEach(s => { const i = new Image(); i.src = s; }); }
(function () {
  const el = document.querySelector('[data-preload]');
  if (!el) return;
  try {
    const list = JSON.parse(el.getAttribute('data-preload'));
    if (Array.isArray(list) && list.length) preload(list);
  } catch (_) {}
})();

// Prevent dragging PNGs
addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
