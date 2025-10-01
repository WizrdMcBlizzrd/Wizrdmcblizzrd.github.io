// ---------- Preload next page images (optional) ----------
function preload(list){ list.forEach(src => { const i = new Image(); i.src = src; }); }
(() => {
  const el = document.querySelector('[data-preload]');
  if (!el) return;
  try {
    const arr = JSON.parse(el.getAttribute('data-preload'));
    if (Array.isArray(arr) && arr.length) preload(arr);
  } catch {}
})();

// ---------- Prevent dragging images ----------
addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

// ---------- Copy-to-clipboard ----------
function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); } catch (_) {}
  document.body.removeChild(ta);
  return Promise.resolve();
}

// Toast
function showToast(el, msg) {
  const r = el.getBoundingClientRect();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  t.style.left = (r.left + r.width / 2) + 'px';
  t.style.top  = (r.top) + 'px';
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); t.remove(); }, 1200);
}

// Copy any [data-copy]
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const v = btn.getAttribute('data-copy') || '';
  if (!v) return;
  copyTextToClipboard(v).then(() => showToast(btn, 'Copied!'));
});

// ---------- Pin-to-canvas: place .pin relative to fitted background image ----------
(function pinToCanvas() {
  const bg = document.querySelector('.bg-img');
  if (!bg) return;

  function parseCoord(val, nat) {
    const s = String(val).trim();
    if (s.endsWith('%')) return (parseFloat(s) / 100) * nat; // % of image native size
    return parseFloat(s);                                    // px in image native size
  }

  function positionPins() {
    const rect = bg.getBoundingClientRect();
    const natW = bg.naturalWidth || 1;
    const natH = bg.naturalHeight || 1;

    const scale = Math.min(rect.width / natW, rect.height / natH);
    const dispW = natW * scale, dispH = natH * scale;
    const offX  = rect.left + (rect.width  - dispW) / 2;
    const offY  = rect.top  + (rect.height - dispH) / 2;

    document.querySelectorAll('.pin').forEach(el => {
      const [px, py='50%'] = (el.getAttribute('data-pin') || '50%,50%').split(',');
      const xImg = parseCoord(px, natW);
      const yImg = parseCoord(py, natH);

      const sizeAttr = (el.getAttribute('data-size') || '').split(',');
      if (sizeAttr[0]) el.style.width  = (parseCoord(sizeAttr[0], natW) * scale) + 'px';
      if (sizeAttr[1]) el.style.height = (parseCoord(sizeAttr[1], natH) * scale) + 'px';

      const xScreen = Math.round(offX + xImg * scale);
      const yScreen = Math.round(offY + yImg * scale);

      el.style.left = xScreen + 'px';
      el.style.top  = yScreen + 'px';

      const anchor = (el.getAttribute('data-anchor') || 'center').toLowerCase();
      el.style.transform = (anchor === 'topleft' || anchor === 'top-left') ? 'none' : 'translate(-50%, -50%)';
    });
  }

  if (bg.complete) positionPins(); else bg.addEventListener('load', positionPins);
  addEventListener('resize', positionPins);
  addEventListener('orientationchange', positionPins);

  // Canvas debug: add ?cdebug=1 to a page URL to read image-relative coords
  const q = new URLSearchParams(location.search);
  if (q.get('cdebug') === '1') {
    const hud = document.createElement('div');
    hud.style.cssText = "position:fixed;right:8px;bottom:8px;z-index:9;background:rgba(0,0,0,.55);color:#fff;font:12px system-ui;padding:6px 8px;border:1px solid rgba(255,255,255,.2);border-radius:8px;";
    hud.textContent = 'move over image…';
    document.body.appendChild(hud);

    document.addEventListener('mousemove', e => {
      const r = bg.getBoundingClientRect();
      const natW = bg.naturalWidth || 1;
      const natH = bg.naturalHeight || 1;
      const scale = Math.min(r.width / natW, r.height / natH);
      const dispW = natW * scale, dispH = natH * scale;
      const offX  = r.left + (r.width  - dispW) / 2;
      const offY  = r.top  + (r.height - dispH) / 2;

      const xIn = (e.clientX - offX) / scale;
      const yIn = (e.clientY - offY) / scale;
      const pctX = Math.max(0, Math.min(100, (xIn / natW) * 100));
      const pctY = Math.max(0, Math.min(100, (yIn / natH) * 100));

      hud.textContent = `image: ${xIn.toFixed(1)}px, ${yIn.toFixed(1)}px  |  ${pctX.toFixed(1)}%, ${pctY.toFixed(1)}%  (click copies)`;
      hud.dataset.pct = `${pctX.toFixed(1)}%,${pctY.toFixed(1)}%`;
    });

    document.addEventListener('click', () => {
      navigator.clipboard.writeText(`data-pin="${hud.dataset.pct || '50%,50%'}"`).catch(()=>{});
    }, true);
  }
})();
