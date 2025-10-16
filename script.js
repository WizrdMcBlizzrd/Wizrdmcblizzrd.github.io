// ---------- Preload helper (optional) ----------
function preload(list){ list.forEach(src => { const i = new Image(); i.src = src; }); }
(() => {
  const el = document.querySelector('[data-preload]');
  if (!el) return;
  try { const arr = JSON.parse(el.getAttribute('data-preload')); if (Array.isArray(arr)&&arr.length) preload(arr); } catch {}
})();

// ---------- Prevent dragging images ----------
addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

// ---------- Copy-to-clipboard + toast ----------
function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea'); ta.value = text;
  ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta);
  ta.focus(); ta.select(); try { document.execCommand('copy'); } catch(_) {}
  ta.remove(); return Promise.resolve();
}
function showToast(el, msg) {
  const r = el.getBoundingClientRect();
  const t = document.createElement('div'); t.className='toast'; t.textContent=msg;
  t.style.left=(r.left+r.width/2)+'px'; t.style.top=r.top+'px'; document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{t.classList.remove('show'); t.remove();},1200);
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy]'); if (!btn) return;
  const v = btn.getAttribute('data-copy')||''; if (!v) return;
  copyTextToClipboard(v).then(()=>showToast(btn,'Copied!'));
});

// ---------- Pin elements relative to fitted background image ----------
(function pinToCanvas(){
  const bg = document.querySelector('.bg-img'); if (!bg) return;

  const parse = (val, nat)=> String(val).trim().endsWith('%')
      ? (parseFloat(val)/100)*nat
      : parseFloat(val);

  function positionPins(){
    const rect = bg.getBoundingClientRect();
    const natW = bg.naturalWidth||1, natH = bg.naturalHeight||1;
    const scale = Math.min(rect.width/natW, rect.height/natH);
    const dispW = natW*scale, dispH = natH*scale;
    const offX = rect.left + (rect.width - dispW)/2;
    const offY = rect.top  + (rect.height- dispH)/2;

    document.querySelectorAll('.pin').forEach(el=>{
      const [px,py='50%'] = (el.getAttribute('data-pin')||'50%,50%').split(',');
      const xImg = parse(px,natW), yImg = parse(py,natH);
      const size = (el.getAttribute('data-size')||'').split(',');
      if (size[0]) el.style.width  = (parse(size[0],natW)*scale)+'px';
      if (size[1]) el.style.height = (parse(size[1],natH)*scale)+'px';
      el.style.left = Math.round(offX + xImg*scale)+'px';
      el.style.top  = Math.round(offY + yImg*scale)+'px';
      const anchor = (el.getAttribute('data-anchor')||'center').toLowerCase();
      el.style.transform = (anchor==='topleft'||anchor==='top-left') ? 'none' : 'translate(-50%,-50%)';
    });
  }
  if (bg.complete) positionPins(); else bg.addEventListener('load', positionPins);
  addEventListener('resize', positionPins); addEventListener('orientationchange', positionPins);

  // Canvas debug: add ?cdebug=1 to URL to get image-relative coords on click
  const q = new URLSearchParams(location.search);
  if (q.get('cdebug')==='1'){
    const hud = document.createElement('div');
    hud.style.cssText="position:fixed;right:8px;bottom:8px;z-index:9;background:rgba(0,0,0,.55);color:#fff;font:12px system-ui;padding:6px 8px;border:1px solid rgba(255,255,255,.2);border-radius:8px;";
    hud.textContent='move over image…'; document.body.appendChild(hud);
    document.addEventListener('mousemove', e=>{
      const r = bg.getBoundingClientRect(), natW=bg.naturalWidth||1, natH=bg.naturalHeight||1;
      const scale=Math.min(r.width/natW, r.height/natH);
      const dispW=natW*scale, dispH=natH*scale, offX=r.left+(r.width-dispW)/2, offY=r.top+(r.height-dispH)/2;
      const xIn=(e.clientX-offX)/scale, yIn=(e.clientY-offY)/scale;
      const pctX=Math.max(0,Math.min(100,(xIn/natW)*100)), pctY=Math.max(0,Math.min(100,(yIn/natH)*100));
      hud.textContent=`image: ${xIn.toFixed(1)}px, ${yIn.toFixed(1)}px  |  ${pctX.toFixed(1)}%, ${pctY.toFixed(1)}% (click copies)`;
      hud.dataset.pct=`${pctX.toFixed(1)}%,${pctY.toFixed(1)}%`;
    });
    document.addEventListener('click', ()=>navigator.clipboard.writeText(`data-pin="${hud.dataset.pct||'50%,50%'}"`).catch(()=>{}), true);
  }
})();
