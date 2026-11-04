import { icons } from './icons.js';
import { store } from './store.js';
import { $, $$, closeSheet } from './util.js';
import * as auth from './views/auth.js';
import * as hub from './views/hub.js';
import * as map from './views/map.js';
import * as ai from './views/ai.js';
import * as profile from './views/profile.js';
import * as mods from './views/modules.js';

// ---- Tab bar ----
const TABS = { home: ['Home', icons.home], map: ['Map', icons.map], ai: ['AI', icons.ai], profile: ['Profile', icons.user] };
$$('.tab').forEach((a) => { const [label, ico] = TABS[a.dataset.tab]; a.innerHTML = `${ico}<span>${label}</span>`; });

// ---- Theme ----
const applyTheme = () => { document.documentElement.dataset.theme = store.get().theme; };
applyTheme();
store.subscribe(applyTheme);

// ---- Routes: pattern -> { view, tab, chrome } ----
// chrome: 'nav' (tab bar), 'bare' (no tab bar), 'bleed' (tab bar, no bottom padding)
const ROUTES = [
  [/^login$/, auth.login, null, 'bare', true],
  [/^signup$/, auth.signup, null, 'bare', true],
  [/^home(?:\/(games|leaderboard|balance|shop))?$/, hub.render, 'home', 'nav'],
  [/^shop\/(head|color|eyes|mood)$/, hub.shopCategory, 'home', 'nav'],
  [/^map$/, map.render, 'map', 'bleed'],
  [/^ai$/, ai.render, 'ai', 'bleed'],
  [/^profile$/, profile.render, 'profile', 'nav'],
  [/^learn\/lung$/, mods.lesson, 'home', 'bare'],
  [/^quiz$/, mods.quiz, 'home', 'bare'],
  [/^play\/frenzy$/, mods.frenzy, 'home', 'bare'],
  [/^watch\/pm25$/, mods.video, 'home', 'bare'],
  [/^tips$/, mods.tips, 'home', 'bare'],
  [/^breathe$/, mods.breathe, 'home', 'bare'],
];

let cleanup = null;
const view = $('#view');

function route() {
  const path = location.hash.replace(/^#\/?/, '') || 'home';
  const s = store.get();
  const authed = s.signedIn || s.guest;
  const match = ROUTES.find(([re]) => re.test(path));
  if (!match) { location.replace('#/home'); return; }
  const [re, fn, tab, chrome, isPublic] = match;
  if (!authed && !isPublic) { location.replace('#/login'); return; }
  if (authed && isPublic) { location.replace('#/home'); return; }

  closeSheet();
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.warn(e); } }
  cleanup = null;

  document.body.classList.toggle('no-nav', chrome === 'bare');
  document.body.classList.toggle('full-bleed', chrome === 'bleed');
  $$('.tab').forEach((a) => (a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));

  view.innerHTML = '';
  window.scrollTo(0, 0);
  const params = path.match(re).slice(1);
  cleanup = fn(view, ...params);
}

window.addEventListener('hashchange', route);

// ---- Splash (Canva screen 1) then route ----
function boot() {
  const splash = document.createElement('div');
  splash.className = 'splash';
  splash.innerHTML = '<div class="wordmark">lungitude<b>+</b></div>';
  document.body.appendChild(splash);
  route();
  setTimeout(() => { splash.style.opacity = '0'; }, 1500);
  setTimeout(() => splash.remove(), 2100);
}
boot();

// iOS keyboard/status bar niceties when running inside Capacitor
window.Capacitor?.Plugins?.StatusBar?.setStyle?.({ style: 'DARK' }).catch?.(() => {});
