import { icons } from '../icons.js';
import { store, liveStreak, doneToday } from '../store.js';
import { MODULES, MODULE_TYPES } from '../data/modules.js';
import { SHOP, avatarSVG } from '../avatar.js';
import { $, $$, esc, fmtK, openSheet, toast, haptic } from '../util.js';

const TABS = [['games', 'Games'], ['leaderboard', 'Leaderboard'], ['balance', 'Your Balance'], ['shop', 'Shop']];
let query = '';
let typeFilter = null;

const circuit = `<svg class="circuit" viewBox="0 0 320 22" aria-hidden="true">
  <defs><filter id="ng" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <g filter="url(#ng)" fill="none" stroke-width="2.4" stroke-linecap="round">
    <path d="M14 13h52M74 6h44l12 7h16" stroke="#ff4fd8"/>
    <path d="M62 8h42l14 6h10M150 9h28M192 9h40l12-6h44" stroke="#3fe0ff"/>
    <path d="M194 16h28l12-6h18M254 16h52" stroke="#ff4fd8"/>
  </g>
  <circle cx="9" cy="13" r="5" fill="none" stroke="#ff4fd8" stroke-width="2.4" filter="url(#ng)"/>
  <circle cx="311" cy="16" r="5" fill="none" stroke="#ff4fd8" stroke-width="2.4" filter="url(#ng)"/>
</svg>`;

export function header(title = 'LC Learning') {
  return `<header class="hub-header">
    <div class="row">
      <button class="icon-btn" id="menuBtn" aria-label="All activities">${icons.menu}</button>
      <h1>${esc(title)}</h1>
      <a class="icon-btn" href="#/profile" aria-label="Settings">${icons.gear}</a>
    </div>
    ${circuit}
  </header>`;
}

export function bindMenu(root) {
  $('#menuBtn', root)?.addEventListener('click', () => {
    openSheet(`<h2>All activities</h2>
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:10px">
      ${MODULES.map((m) => `<a href="${m.route}" style="display:flex;align-items:center;gap:12px;padding:10px 4px;color:inherit;text-decoration:none;border-bottom:1px solid #eee">
        <span style="font-size:22px;width:32px;text-align:center">${m.emoji || '📘'}</span>
        <span style="flex:1"><b>${m.title}</b><br><small style="color:#6b6b7a">${m.kind} · ${m.xp} XP · ${m.coins} coins</small></span>
        ${doneToday(m.id) ? '<small style="color:#1b9e5a;font-weight:700">Done today ✓</small>' : ''}
      </a>`).join('')}
      </div>`, { label: 'All activities' });
  });
}

export function render(view, tab = 'games') {
  view.innerHTML = `
    ${header()}
    <div class="wrap">
      <div class="search-row">
        <label class="search"><span class="sr-only">Search modules</span>
          <input id="q" type="search" placeholder="Search here..." value="${esc(query)}" autocomplete="off">${icons.search}
        </label>
        <button class="square-btn" id="filterBtn" aria-label="Filter by type" aria-pressed="${!!typeFilter}">${icons.sliders}</button>
      </div>
      <div class="filter-pop ${typeFilter ? 'open' : ''}" id="filters">
        ${MODULE_TYPES.map((t) => `<button class="chip ${typeFilter === t ? 'on' : ''}" data-type="${t}">${t}</button>`).join('')}
      </div>
      <div class="chips" role="tablist">
        ${TABS.map(([k, l]) => `<button class="chip" role="tab" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join('')}
      </div>
      <section id="tabBody"></section>
    </div>`;

  bindMenu(view);
  const body = $('#tabBody', view);
  let current = tab;
  const show = (t) => {
    current = t;
    $$('.chips [role=tab]', view).forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === t));
    history.replaceState(null, '', `#/home/${t}`);
    ({ games, leaderboard, balance, shop })[t](body);
  };

  $$('.chips [role=tab]', view).forEach((b) => b.addEventListener('click', () => { haptic(); show(b.dataset.tab); }));
  $('#q', view).addEventListener('input', (e) => { query = e.target.value; if (current !== 'games') show('games'); else games(body); });
  $('#filterBtn', view).addEventListener('click', (e) => {
    const pop = $('#filters', view);
    pop.classList.toggle('open');
    if (!pop.classList.contains('open')) { typeFilter = null; $$('#filters .chip', view).forEach((c) => c.classList.remove('on')); if (current === 'games') games(body); }
    e.currentTarget.setAttribute('aria-pressed', pop.classList.contains('open'));
  });
  $$('#filters .chip', view).forEach((c) => c.addEventListener('click', () => {
    typeFilter = typeFilter === c.dataset.type ? null : c.dataset.type;
    $$('#filters .chip', view).forEach((x) => x.classList.toggle('on', x.dataset.type === typeFilter));
    show('games');
  }));

  show(tab);
  return store.subscribe(() => { if (current !== 'games') show(current); });
}

// ---------- Games ----------
function games(el) {
  const q = query.trim().toLowerCase();
  const list = MODULES.filter((m) => (!typeFilter || m.type === typeFilter)
    && (!q || `${m.title} ${m.kind} ${m.keywords}`.toLowerCase().includes(q)));
  if (!list.length) { el.innerHTML = '<p class="empty">No modules match that search.</p>'; return; }
  el.innerHTML = `<div class="grid">${list.map(card).join('')}</div>`;
}

function card(m) {
  const art = m.img
    ? `<div class="art"><img src="${m.img}" alt="" loading="lazy"></div>`
    : `<div class="art emoji" style="background:${m.tint}">${m.emoji}</div>`;
  return `<a class="mcard" href="${m.route}" style="text-decoration:none" aria-label="${m.title}, ${m.kind}, ${m.xp} XP, ${m.coins} coins">
    <span class="coin-badge">${m.coins}${icons.coin}</span>
    ${doneToday(m.id) ? '<span class="done-tag">✓ Today</span>' : ''}
    ${art}
    <div class="title-row"><h3>${m.title}</h3><span class="xp">${m.xp} XP</span></div>
    <div class="meta-row"><span class="kind">${m.kind}</span><span class="arrow-btn">${icons.arrow}</span></div>
  </a>`;
}

// ---------- Leaderboard ----------
// Sample league so the board is never empty. Replace with a real backend query
// (e.g. Firebase/Supabase "players" ordered by xp) when accounts sync online.
const SAMPLE = [
  ['Ava R.', 9400, { head: 'helmet', color: 'ember', mood: 'star' }],
  ['Marcus T.', 8150, { head: 'cap', color: 'sky', eyes: 'shades' }],
  ['Priya S.', 7300, { head: 'crown', color: 'rose', mood: 'love' }],
  ['Diego M.', 6100, { color: 'mint', eyes: 'round', mood: 'wink' }],
  ['Hannah L.', 4900, { head: 'beanie', color: 'galaxy' }],
  ['Kenji W.', 3600, { head: 'tophat', eyes: 'goggles' }],
  ['Sofia G.', 2450, { color: 'sun', mood: 'wow' }],
  ['Jordan P.', 1300, { head: 'party', color: 'classic', mood: 'sleepy' }],
];

function leaderboard(el) {
  const s = store.get();
  const meName = s.user?.name || 'You (guest)';
  const rows = SAMPLE.map(([name, xp, eq]) => ({ name, xp, eq }))
    .concat({ name: meName, xp: s.xp, eq: s.equipped, me: true })
    .sort((a, b) => b.xp - a.xp);
  const meIdx = rows.findIndex((r) => r.me);
  const top = rows.slice(0, 8);
  if (meIdx >= 8) top[7] = rows[meIdx];
  const medal = ['🥇', '🥈', '🥉'];
  el.innerHTML = `
    <h2 class="rank-title">Rankings</h2>
    <div class="neon-frame">
      ${top.map((r) => {
        const pos = rows.indexOf(r);
        return `<div class="rank-row ${r.me ? 'me' : ''}">
          <span class="rank-no ${pos < 3 ? 'medal' : ''}">${pos < 3 ? medal[pos] : pos + 1}</span>
          <span class="avatar-dot">${avatarSVG({ ...r.eq }, { label: r.name })}</span>
          <span class="rank-name">${esc(r.name)}</span>
          <span class="rank-score">${fmtK(r.xp)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="streak"><span class="flame">🔥</span> Streak: ${liveStreak()} day${liveStreak() === 1 ? '' : 's'}</div>
    <p class="fineprint">Sample league · your rank updates as you earn XP</p>`;
}

// ---------- Balance ----------
function balance(el) {
  const s = store.get();
  const done = Object.values(s.completions).reduce((n, c) => n + c.count, 0);
  el.innerHTML = `
    <h2 class="neon-heading mint">YOUR BALANCE</h2>
    <div class="balance">
      <div><h2>Coins</h2><div class="num">${fmtK(s.coins)}</div></div>
      <div><h2>Points</h2><div class="num">${fmtK(s.xp)}</div></div>
    </div>
    <div class="podium">
      <svg viewBox="0 0 400 360" aria-hidden="true">
        <defs>
          <linearGradient id="pd" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd2dc"/></linearGradient>
          <linearGradient id="pd2" x1="0" x2="1"><stop offset="0" stop-color="#c3c6d1"/><stop offset=".5" stop-color="#fafafa"/><stop offset="1" stop-color="#b9bcc8"/></linearGradient>
          <radialGradient id="cg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffe46b"/><stop offset="1" stop-color="#f5a300"/></radialGradient>
        </defs>
        <ellipse cx="200" cy="300" rx="190" ry="38" fill="url(#pd)"/>
        <path d="M10 300v28c0 21 85 38 190 38s190-17 190-38v-28c0 21-85 38-190 38S10 321 10 300z" fill="url(#pd2)"/>
        <ellipse cx="200" cy="250" rx="140" ry="30" fill="url(#pd)"/>
        <path d="M60 250v26c0 16 63 30 140 30s140-14 140-30v-26c0 16-63 30-140 30S60 266 60 250z" fill="url(#pd2)"/>
        <g class="spin-coin">
          <circle cx="200" cy="130" r="92" fill="#f0b400"/>
          <circle cx="196" cy="126" r="90" fill="url(#cg)"/>
          <circle cx="196" cy="126" r="66" fill="#f7a600" stroke="#e08e00" stroke-width="4"/>
          <path d="m196 72 16 33 37 4-27 25 8 36-34-19-34 19 8-36-27-25 37-4z" fill="#fff6b0"/>
          <path d="M140 70a80 80 0 0 0-20 90" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
        </g>
      </svg>
    </div>
    <div class="stat-strip">
      <div class="stat"><b>🔥 ${liveStreak()}</b><span>day streak</span></div>
      <div class="stat"><b>${done}</b><span>modules done</span></div>
      <div class="stat"><b>${s.stats.frenzyBest}</b><span>Frenzy best</span></div>
    </div>`;
}

// ---------- Shop ----------
function shop(el) {
  const s = store.get();
  el.innerHTML = `
    <h2 class="neon-heading gold">Customize your<br>Character!</h2>
    <div class="shop-preview">${avatarSVG(s.equipped, { label: 'Your LCAI' })}
      <div><b>Your LCAI</b><div style="color:var(--text-dim);font-size:14px;margin-top:2px;display:flex;align-items:center;gap:4px">${icons.coin} ${s.coins} coins to spend</div></div>
    </div>
    <div class="grid">
      ${Object.entries(SHOP).map(([cat, c]) => {
        const sample = { ...s.equipped, [cat]: c.items[Math.min(1, c.items.length - 1)].id };
        if (cat === 'head') sample.head = 'helmet';
        return `<a class="mcard shop-card" href="#/shop/${cat}" style="text-decoration:none">
          <span class="coin-badge">${c.badge}${icons.coin}</span>
          <div class="art emoji" style="padding:10%">${avatarSVG(sample, { label: c.label })}</div>
          <div class="title-row"><h3>${c.label}</h3></div>
          <div class="meta-row"><span class="kind">${c.items.length} options</span><span class="arrow-btn">${icons.arrow}</span></div>
        </a>`;
      }).join('')}
    </div>`;
}

export function shopCategory(view, cat) {
  const c = SHOP[cat];
  const draw = () => {
    const s = store.get();
    view.innerHTML = `
      <header class="page-head"><a class="pill-btn" href="#/home/shop">Back</a><h1>${c.label}</h1>
        <span class="xp-pill" style="display:flex;gap:4px;align-items:center">${icons.coin.replace('coin-ico', 'coin-ico" style="width:14px;height:14px')}${s.coins}</span></header>
      <div class="body">
        <div class="shop-preview" style="justify-content:center">${avatarSVG(s.equipped, { wave: true, label: 'Your LCAI' })}</div>
        <div class="items" style="margin-top:16px">
          ${c.items.map((it) => {
            const key = `${cat}:${it.id}`;
            const owned = it.price === 0 || s.owned.includes(key);
            const on = s.equipped[cat] === it.id;
            return `<button class="item ${on ? 'equipped' : ''} ${owned ? '' : 'locked'}" data-id="${it.id}">
              ${avatarSVG({ ...s.equipped, [cat]: it.id }, { label: it.name })}
              <span class="nm">${it.name}</span>
              ${owned ? `<span class="state">${on ? (cat === 'color' || cat === 'mood' ? 'Equipped' : 'Remove') : 'Equip'}</span>`
                : `<span class="price">${icons.coin}${it.price}</span>`}
            </button>`;
          }).join('')}
        </div>
        <p class="note center" style="margin-top:18px">Earn coins by finishing modules on the Games tab. The first completion each day pays out.</p>
      </div>`;
    $$('.item', view).forEach((b) => b.addEventListener('click', () => buy(cat, c.items.find((i) => i.id === b.dataset.id))));
  };
  const buy = (cat2, it) => {
    const s = store.get();
    const key = `${cat2}:${it.id}`;
    const owned = it.price === 0 || s.owned.includes(key);
    if (owned) {
      const removable = cat2 === 'head' || cat2 === 'eyes';
      store.update((st) => { st.equipped[cat2] = st.equipped[cat2] === it.id && removable ? null : it.id; });
      haptic(); draw(); return;
    }
    if (s.coins < it.price) { toast(`You need ${it.price - s.coins} more coins`, icons.coin); return; }
    store.update((st) => { st.coins -= it.price; st.owned.push(key); st.equipped[cat2] = it.id; });
    haptic('Medium');
    toast(`Unlocked ${it.name}!`, icons.coin);
    draw();
  };
  draw();
}
