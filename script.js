// Optional: preload the next page's images for snappier transitions
function preload(list){ list.forEach(src => { const i = new Image(); i.src = src; }); }
(() => {
  const el = document.querySelector('[data-preload]');
  if (!el) return;
  try {
    const arr = JSON.parse(el.getAttribute('data-preload'));
    if (Array.isArray(arr) && arr.length) preload(arr);
  } catch {}
})();

// Prevent dragging images
addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
