// --------- Robust copy routine used by the end-page hotspot ----------
function copyHotspot(el) {
  const text = el.getAttribute('data-copy') || '';
  if (!text) return;

  // 1) Preferred: async clipboard (HTTPS only)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(el, 'Copied!'))
      .catch(() => legacyCopy(el, text));
    return;
  }
  // 2) Fallback
  legacyCopy(el, text);
}

function legacyCopy(el, text) {
  // contenteditable trick works well on iOS + old browsers
  const span = document.createElement('span');
  span.textContent = text;
  span.style.position = 'fixed';
  span.style.left = '-9999px';
  span.setAttribute('contenteditable', 'true');
  document.body.appendChild(span);

  const range = document.createRange();
  range.selectNodeContents(span);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  try { document.execCommand('copy'); } catch (_) {}
  sel.removeAllRanges();
  span.remove();

  showToast(el, 'Copied!');
}

// If you kept the generic [data-copy] click handler from earlier, it’s fine to keep;
// copyHotspot() runs explicitly on the button and handles everything.
