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

// ---- Placement helper: add ?debug=1 to any page URL ----
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get('debug') !== '1') return;

  const hud = document.createElement('div');
  hud.style.cssText = `
    position:fixed; inset:auto 8px 8px auto; z-index:9;
    background:rgba(0,0,0,.55); color:#fff; font:12px/1.3 system-ui,Segoe UI,Arial;
    padding:6px 8px; border:1px solid rgba(255,255,255,.2); border-radius:8px;
  `;
  hud.textContent = 'move mouse…';
  document.body.appendChild(hud);

  document.addEventListener('mousemove', e => {
    const x = Math.round((e.clientX / innerWidth ) * 1000) / 10;
    const y = Math.round((e.clientY / innerHeight) * 1000) / 10;
    hud.textContent = `--x:${x}%; --y:${y}%;  (click copies style)`;
    hud.dataset.x = x; hud.dataset.y = y;
  });

  document.addEventListener('click', e => {
    const x = hud.dataset.x || 50;
    const y = hud.dataset.y || 50;
    const snippet = `style="--x:${x}%; --y:${y}%; --w: clamp(260px, 40vw, 620px);"`;
    navigator.clipboard.writeText(snippet).catch(()=>{});
    console.log('Paste on your <a class="btn-img" ...>:', snippet);
  }, true);
})();
