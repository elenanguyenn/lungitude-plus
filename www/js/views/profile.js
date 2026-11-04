import { icons } from '../icons.js';
import { store } from '../store.js';
import { avatarSVG } from '../avatar.js';
import { $, esc, openSheet, toast } from '../util.js';

const row = (id, ico, label, sub = '', right = icons.chevron.replace('<svg', '<svg class="chev"')) =>
  `<li><button id="${id}"><span class="ico">${ico}</span><span class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</span>${right}</button></li>`;

const INFO = {
  about: ['About Lungitude+', `<p>Lungitude+ tracks wildfire PM2.5 across Southern California using EPA AirNow data, explains what it means for your health with LCAI (powered by Google Gemini), and turns lung-health learning into a game.</p><p>Built by Elena Nguyen. Winner, Congressional App Challenge.</p><p style="font-size:13px">Data: U.S. EPA AirNow (preliminary, unvalidated real-time data). AQI categories follow the EPA's 2024 PM2.5 update. LCAI is educational and not a substitute for medical advice. In an emergency, call 911.</p>`],
  terms: ['Terms & Conditions', '<p>Lungitude+ is provided for education. Air-quality readings are preliminary and can be delayed or missing. Always follow official guidance from local air districts, public-health agencies and your fire department. LCAI may make mistakes; verify important health information with a professional.</p>'],
  privacy: ['Privacy Policy', '<p>Your account, progress and chat history are stored on this device only. Location is used only on the map to find the nearest monitor and is never stored. Chat messages you send to LCAI are forwarded to Google Gemini to generate replies. Delete everything any time with “Delete account”.</p>'],
};

export function render(view) {
  const draw = () => {
    const s = store.get();
    const name = s.user?.name || 'Guest';
    view.innerHTML = `
      <header class="page-head"><a class="pill-btn" href="#/home" style="border-color:var(--text-dim);color:var(--text)">‹ Back</a><h1>Profile</h1><span style="width:56px"></span></header>
      <div class="body">
        <div class="panel profile-card">${avatarSVG(s.equipped)}<div><b style="font-size:18px">${esc(name)}</b><div class="note">${s.signedIn ? esc(s.user?.email || 'Signed in on this device') : 'Guest: progress saves on this device'}</div>
          <div style="margin-top:4px;font-size:14px">⚡ ${s.xp} XP · ${icons.coin.replace('coin-ico', 'coin-ico" style="width:14px;height:14px;vertical-align:-2px')} ${s.coins}</div></div></div>
        <ul class="settings">
          ${s.signedIn ? row('logout', icons.logout, 'Log out') : row('login', icons.user, 'Login', 'Create an account or sign in')}
        </ul>
        <div class="section-label">General Settings</div>
        <ul class="settings">
          <li><label><span class="ico">${icons.sun}</span><span class="lbl">Mode<small>Dark &amp; Light</small></span>
            <span class="toggle"><input type="checkbox" id="theme" ${s.theme === 'light' ? 'checked' : ''} aria-label="Light mode"><i></i></span></label></li>
          ${row('lang', icons.globe, 'Language', 'English')}
          ${row('about', icons.help, 'About')}
          ${row('terms', icons.alert, 'Terms &amp; Conditions')}
          ${row('privacy', icons.lock, 'Privacy Policy')}
          ${row('rate', icons.star, 'Rate This App')}
          ${row('share', icons.share, 'Share This App')}
          ${row('reset', icons.trash, 'Reset progress')}
          ${s.user ? row('delete', icons.trash, 'Delete account', 'Removes all data from this device') : ''}
        </ul>
      </div>`;
    $('#theme', view).onchange = (e) => store.update((st) => { st.theme = e.target.checked ? 'light' : 'dark'; });
    $('#login', view)?.addEventListener('click', () => { store.update((st) => { st.guest = false; }); location.hash = '#/login'; });
    $('#logout', view)?.addEventListener('click', () => { store.update((st) => { st.signedIn = false; st.guest = false; }); location.hash = '#/login'; });
    for (const k of Object.keys(INFO)) $(`#${k}`, view).onclick = () => openSheet(`<h2>${INFO[k][0]}</h2>${INFO[k][1]}`);
    $('#lang', view).onclick = () => openSheet('<h2>Language</h2><p>English is available now. Spanish and Vietnamese are planned. LCAI already answers in whatever language you write to it!</p>');
    $('#rate', view).onclick = () => toast('Thanks! Ratings open once Lungitude+ is on the App Store ⭐');
    $('#share', view).onclick = async () => {
      const data = { title: 'Lungitude+', text: 'Track wildfire smoke and learn to protect your lungs with Lungitude+.', url: location.origin.startsWith('http') ? location.origin : 'https://lungitude.app' };
      try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast('Link copied'); } } catch { /* cancelled */ }
    };
    $('#reset', view).onclick = () => openSheet('<h2>Reset progress?</h2><p>XP, coins, streak and shop items go back to zero. Your account stays.</p><button class="cta" id="yes" style="background:#e53935">Reset</button>', {
      onMount: (sh, close) => { $('#yes', sh).onclick = () => { store.reset(); close(); toast('Progress reset'); }; } });
    $('#delete', view)?.addEventListener('click', () => openSheet('<h2>Delete account?</h2><p>This permanently removes your account, progress and chat history from this device.</p><button class="cta" id="yes" style="background:#e53935">Delete everything</button>', {
      onMount: (sh, close) => { $('#yes', sh).onclick = () => { store.reset({ keepAccount: false }); close(); location.hash = '#/login'; }; } }));
  };
  draw();
  return store.subscribe(draw);
}
