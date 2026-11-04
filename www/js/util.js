import { icons } from './icons.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' M'
  : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + ' K' : String(n));

/** Light haptic tap: native Haptics plugin on iOS if present, vibrate on Android web. */
export function haptic(style = 'Light') {
  try {
    const H = window.Capacitor?.Plugins?.Haptics;
    if (H) return H.impact({ style });
    navigator.vibrate?.(10);
  } catch { /* ignore */ }
}

let toastTimer;
export function toast(msg, icon = '') {
  let el = $('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.innerHTML = `${icon}${esc(msg)}`;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
export const coinToast = (coins, xp) => toast(`+${coins} coins · +${xp} XP`, icons.coin);

/** Bottom sheet (becomes a centred dialog on desktop). Returns close(). */
export function openSheet(html, { onMount, onClose, label = 'Details' } = {}) {
  closeSheet();
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const sheet = document.createElement('div'); sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', label);
  sheet.innerHTML = `<div class="grab"></div>${html}`;
  document.body.append(scrim, sheet);
  requestAnimationFrame(() => { scrim.classList.add('open'); sheet.classList.add('open'); });
  const close = () => {
    scrim.classList.remove('open'); sheet.classList.remove('open');
    setTimeout(() => { scrim.remove(); sheet.remove(); }, 300);
    document.removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  // swipe down to dismiss
  let y0 = null;
  sheet.addEventListener('touchstart', (e) => { if (sheet.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchend', (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 80) close(); y0 = null; });
  sheet._close = close;
  onMount?.(sheet, close);
  sheet.querySelector('button, a, input')?.focus({ preventScroll: true });
  return close;
}
export function closeSheet() { $$('.sheet').forEach((s) => s._close ? s._close() : s.remove()); }

/** Very small, safe markdown: **bold**, *italic*, bullet lists, paragraphs, links. */
export function md(text) {
  const lines = esc(text).split(/\n/);
  let html = ''; let inList = false;
  const inline = (s) => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^(?:[-*•]|\d+\.)\s+(.*)/);
    if (m) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(m[1])}</li>`; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    if (line) html += `<p>${inline(line)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const distKm = (a, b) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};
