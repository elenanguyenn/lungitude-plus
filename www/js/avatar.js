// LCAI, drawn in SVG so Shop purchases (headwear, colour, eyewear, emotions) render on the bot.
let uid = 0;

export const SHOP = {
  head: {
    label: 'Headwear', emoji: '🎩', badge: 50,
    items: [
      { id: 'helmet', name: 'Fire Helmet', price: 60 },
      { id: 'beanie', name: 'Beanie', price: 40 },
      { id: 'cap', name: 'Ball Cap', price: 40 },
      { id: 'tophat', name: 'Top Hat', price: 50 },
      { id: 'party', name: 'Party Hat', price: 30 },
      { id: 'crown', name: 'Crown', price: 150 },
    ],
  },
  color: {
    label: 'Color', emoji: '🎨', badge: 80,
    items: [
      { id: 'classic', name: 'Classic', price: 0, c: ['#ffffff', '#d9d4ff'] },
      { id: 'mint', name: 'Mint', price: 80, c: ['#e9fff6', '#8de8c4'] },
      { id: 'rose', name: 'Rose', price: 80, c: ['#fff0f6', '#f7a8c8'] },
      { id: 'sky', name: 'Sky', price: 80, c: ['#eef9ff', '#8fd3ff'] },
      { id: 'sun', name: 'Sunny', price: 80, c: ['#fffbe6', '#ffd75e'] },
      { id: 'ember', name: 'Ember', price: 100, c: ['#fff1e8', '#ff9a5c'] },
      { id: 'galaxy', name: 'Galaxy', price: 120, c: ['#7a6cff', '#2a1d7a'] },
      { id: 'gold', name: 'Gold', price: 200, c: ['#fff4c2', '#e2a400'] },
    ],
  },
  eyes: {
    label: 'Eyewear', emoji: '🕶️', badge: 25,
    items: [
      { id: 'shades', name: 'Shades', price: 25 },
      { id: 'round', name: 'Round Specs', price: 25 },
      { id: 'hearts', name: 'Heart Shades', price: 35 },
      { id: 'stars', name: 'Star Shades', price: 35 },
      { id: 'goggles', name: 'Lab Goggles', price: 45 },
    ],
  },
  mood: {
    label: 'Emotions', emoji: '😄', badge: 10,
    items: [
      { id: 'happy', name: 'Happy', price: 0 },
      { id: 'wink', name: 'Wink', price: 10 },
      { id: 'love', name: 'Love', price: 10 },
      { id: 'wow', name: 'Wow', price: 10 },
      { id: 'sleepy', name: 'Sleepy', price: 10 },
      { id: 'star', name: 'Star-struck', price: 15 },
    ],
  },
};

const EYE = '#5fd8ff';
const MOODS = {
  happy: `<path d="M70 88h20" stroke="${EYE}" stroke-width="6" stroke-linecap="round"/><path d="M110 92q10-14 20 0" stroke="${EYE}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  wink: `<path d="M70 92q10-14 20 0" stroke="${EYE}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M110 88h20" stroke="${EYE}" stroke-width="6" stroke-linecap="round"/>`,
  love: `<path d="M80 96l-9-9a5.5 5.5 0 0 1 9-6 5.5 5.5 0 0 1 9 6z" fill="#ff6fa8"/><path d="M120 96l-9-9a5.5 5.5 0 0 1 9-6 5.5 5.5 0 0 1 9 6z" fill="#ff6fa8"/>`,
  wow: `<circle cx="80" cy="87" r="8" fill="none" stroke="${EYE}" stroke-width="5"/><circle cx="120" cy="87" r="8" fill="none" stroke="${EYE}" stroke-width="5"/>`,
  sleepy: `<path d="M70 86q10 10 20 0M110 86q10 10 20 0" stroke="${EYE}" stroke-width="5" fill="none" stroke-linecap="round"/><text x="134" y="68" font-size="14" fill="${EYE}" font-weight="700">z</text>`,
  star: `<path d="m80 77 3 6.5 7 .8-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7-5.3-4.8 7-.8z" fill="#ffe36b"/><path d="m120 77 3 6.5 7 .8-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7-5.3-4.8 7-.8z" fill="#ffe36b"/>`,
};

const EYEWEAR = {
  shades: `<path d="M58 78h84v6c0 10-8 16-18 16s-16-6-18-14h-6c-2 8-8 14-18 14s-24-6-24-16z" fill="#111" opacity=".95"/><path d="M66 82h20" stroke="#fff" stroke-width="2" opacity=".5"/>`,
  round: `<circle cx="80" cy="87" r="15" fill="rgba(180,230,255,.18)" stroke="#d4a017" stroke-width="4"/><circle cx="120" cy="87" r="15" fill="rgba(180,230,255,.18)" stroke="#d4a017" stroke-width="4"/><path d="M95 86h10" stroke="#d4a017" stroke-width="4"/>`,
  hearts: `<path d="M80 104 64 88a9 9 0 0 1 16-9 9 9 0 0 1 16 9z" fill="#ff3d7f" stroke="#fff" stroke-width="2"/><path d="M120 104 104 88a9 9 0 0 1 16-9 9 9 0 0 1 16 9z" fill="#ff3d7f" stroke="#fff" stroke-width="2"/><path d="M96 86h8" stroke="#fff" stroke-width="3"/>`,
  stars: `<path d="m80 70 5 10.5 11.5 1.3-8.6 7.8 2.4 11.4-10.3-5.9-10.3 5.9 2.4-11.4-8.6-7.8 11.5-1.3z" fill="#ffc400" stroke="#fff" stroke-width="2"/><path d="m120 70 5 10.5 11.5 1.3-8.6 7.8 2.4 11.4-10.3-5.9-10.3 5.9 2.4-11.4-8.6-7.8 11.5-1.3z" fill="#ffc400" stroke="#fff" stroke-width="2"/>`,
  goggles: `<rect x="56" y="72" width="88" height="30" rx="15" fill="rgba(120,255,200,.28)" stroke="#2bb673" stroke-width="5"/><path d="M100 72v30" stroke="#2bb673" stroke-width="4"/><path d="M40 86h16M144 86h16" stroke="#2bb673" stroke-width="5"/>`,
};

const HEADWEAR = {
  helmet: `<path d="M44 52c4-26 30-40 56-40s52 14 56 40z" fill="#d32f2f"/><path d="M30 52h140c0 6-6 9-14 9H44c-8 0-14-3-14-9z" fill="#b71c1c"/><path d="M100 14v38" stroke="#ff8a80" stroke-width="6"/><path d="M88 28h24v18H88z" fill="#ffd54a" stroke="#b28704" stroke-width="2"/><text x="100" y="42" font-size="12" text-anchor="middle" font-weight="800" fill="#7a1f00">L+</text>`,
  beanie: `<path d="M48 54c0-26 24-42 52-42s52 16 52 42z" fill="#3d5aa8"/><rect x="44" y="46" width="112" height="14" rx="7" fill="#2a3f7a"/><circle cx="100" cy="12" r="9" fill="#f06292"/>`,
  cap: `<path d="M50 54c0-24 22-40 50-40s50 16 50 40z" fill="#f06292"/><path d="M140 52h44c0 6-8 10-20 10h-30z" fill="#c2185b"/><circle cx="100" cy="16" r="4" fill="#c2185b"/>`,
  tophat: `<rect x="64" y="-6" width="72" height="52" rx="4" fill="#1d1d2b"/><rect x="64" y="30" width="72" height="9" fill="#f06292"/><rect x="44" y="44" width="112" height="10" rx="5" fill="#1d1d2b"/>`,
  party: `<path d="M100 -6 128 50H72z" fill="#4fc3f7"/><path d="M86 22h28M80 36h40" stroke="#ffd54a" stroke-width="5"/><circle cx="100" cy="-6" r="7" fill="#ff4fd8"/>`,
  crown: `<path d="M58 50 52 14l26 18 22-26 22 26 26-18-6 36z" fill="#ffc400" stroke="#b28704" stroke-width="3" stroke-linejoin="round"/><circle cx="78" cy="38" r="5" fill="#e53935"/><circle cx="100" cy="34" r="6" fill="#1e88e5"/><circle cx="122" cy="38" r="5" fill="#43a047"/>`,
};

/**
 * @param {object} eq equipped { head, color, eyes, mood }
 * @param {object} opts { wave: bool, className }
 */
export function avatarSVG(eq = {}, { wave = false, className = '', label = 'LCAI robot' } = {}) {
  const id = `b${++uid}`;
  const colorItem = SHOP.color.items.find((c) => c.id === eq.color) || SHOP.color.items[0];
  const [c1, c2] = colorItem.c;
  const dark = eq.color === 'galaxy';
  return `<svg class="bot ${className}" viewBox="0 -14 200 236" role="img" aria-label="${label}">
  <defs>
    <radialGradient id="${id}s" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>
    <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a44"/><stop offset="1" stop-color="#0b0b18"/></linearGradient>
    <filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse cx="100" cy="216" rx="46" ry="6" fill="rgba(0,0,0,.25)"/>
  <g class="${wave ? 'wave' : ''}" style="transform-box:view-box;transform-origin:66px 150px">
    <ellipse cx="44" cy="134" rx="13" ry="28" transform="rotate(-38 44 134)" fill="url(#${id}s)"/>
  </g>
  <ellipse cx="160" cy="168" rx="12" ry="26" transform="rotate(-18 160 168)" fill="url(#${id}s)"/>
  <rect x="88" y="128" width="24" height="14" rx="6" fill="${dark ? '#1a124d' : '#c9c3f0'}"/>
  <path d="M62 170c0-24 17-36 38-36s38 12 38 36-14 42-38 42-38-18-38-42z" fill="url(#${id}s)"/>
  <rect x="34" y="36" width="132" height="102" rx="40" fill="url(#${id}s)"/>
  <rect x="50" y="52" width="100" height="70" rx="26" fill="url(#${id}v)"/>
  <path d="M128 58q14 2 16 18" stroke="rgba(255,255,255,.35)" stroke-width="5" fill="none" stroke-linecap="round"/>
  <g class="bot-eyes" filter="url(#${id}g)">${MOODS[eq.mood] || MOODS.happy}</g>
  ${eq.eyes ? EYEWEAR[eq.eyes] || '' : ''}
  ${eq.head ? `<g transform="translate(0 -4)">${HEADWEAR[eq.head] || ''}</g>` : ''}
</svg>`;
}

/** Preview of a single shop item on a default bot. */
export function itemPreview(cat, itemId, base) {
  const eq = { ...base, [cat]: itemId };
  return avatarSVG(eq, { label: itemId });
}
