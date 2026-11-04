import { store } from '../store.js';
import { icons } from '../icons.js';
import { $, sha256 } from '../util.js';

// Flowing "silk" ribbons from the Canva login header, drawn as SVG so they scale to any screen.
function silk() {
  const strands = (color, flip) => Array.from({ length: 14 }, (_, i) => {
    const o = i * 7;
    const d = flip
      ? `M${560 + o} -20 C ${420 - o} 120, ${700 + o} 200, ${520 - o * .4} 420`
      : `M${240 - o} -20 C ${380 + o} 120, ${100 - o} 200, ${280 + o * .4} 420`;
    return `<path d="${d}" stroke="${color}" stroke-width="${1 + (i % 3)}" fill="none" opacity="${0.18 + (i % 4) * 0.07}"/>`;
  }).join('');
  return `<svg class="silk" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><filter id="sg"><feGaussianBlur stdDeviation="1.2"/></filter></defs>
    <g filter="url(#sg)">${strands('#c77dff', false)}${strands('#4fc3f7', true)}</g>
    <g opacity=".55">${strands('#e0aaff', false).replace(/stroke-width="\d"/g, 'stroke-width="6"')}</g>
  </svg>`;
}

export function login(view) {
  view.innerHTML = `
  <div class="auth">
    <div class="auth-hero">${silk()}<div class="logo-box"><span class="wordmark">lungitude<b>+</b></span></div></div>
    <div class="auth-card"><div class="auth-inner">
      <h1>Login</h1>
      <p class="sub">Sign in to continue.</p>
      <form id="loginForm" novalidate>
        <div class="field"><label for="lName">Name or email</label><input id="lName" autocomplete="username" required></div>
        <div class="field"><label for="lPw">Password</label><input id="lPw" type="password" autocomplete="current-password" required></div>
        <div class="form-error" id="lErr" role="alert"></div>
        <button class="dark-btn" type="submit">Log in</button>
      </form>
      <div class="text-links">
        <button type="button" id="forgot">Forgot Password?</button>
        <a href="#/signup" style="color:inherit">Sign up</a>
        <button type="button" id="guest" style="margin-top:6px;text-decoration:underline">Continue as guest</button>
      </div>
    </div></div>
  </div>`;

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $('#lName').value.trim().toLowerCase();
    const pw = $('#lPw').value;
    const err = $('#lErr');
    const u = store.get().user;
    if (!id || !pw) { err.textContent = 'Please enter your name and password.'; return; }
    if (!u) { err.textContent = 'No account on this device yet. Tap “Sign up”.'; return; }
    const match = [u.name.toLowerCase(), (u.email || '').toLowerCase()].includes(id);
    if (!match || (await sha256(pw)) !== u.pwHash) { err.textContent = 'Name or password doesn’t match.'; return; }
    store.update((s) => { s.signedIn = true; s.guest = false; });
    location.hash = '#/home';
  });
  $('#guest').addEventListener('click', () => { store.update((s) => { s.guest = true; }); location.hash = '#/home'; });
  $('#forgot').addEventListener('click', () => {
    $('#lErr').textContent = 'Accounts are stored on this device. Create a new one with Sign up (your progress stays).';
  });
}

export function signup(view) {
  view.innerHTML = `
  <div class="auth">
    <div class="auth-hero short">${silk()}<a class="back" href="#/login" aria-label="Back to login">${icons.back}</a></div>
    <div class="auth-card"><div class="auth-inner">
      <h1>Create new<br>Account</h1>
      <p class="sub">Already registered? <button type="button" id="toLogin">Log in here.</button></p>
      <form id="suForm" novalidate>
        <div class="field"><label for="sName">Name</label><input id="sName" autocomplete="nickname" maxlength="24" required></div>
        <div class="field"><label for="sEmail">Email</label><input id="sEmail" type="email" autocomplete="email"></div>
        <div class="field"><label for="sPw">Password</label><input id="sPw" type="password" autocomplete="new-password" minlength="6" required></div>
        <div class="field"><label for="sDob">Date of birth</label><input id="sDob" type="date" max="${new Date().toISOString().slice(0, 10)}"></div>
        <div class="form-error" id="sErr" role="alert"></div>
        <button class="dark-btn" type="submit">Sign up</button>
      </form>
    </div></div>
  </div>`;
  $('#toLogin').addEventListener('click', () => { location.hash = '#/login'; });
  $('#suForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#sName').value.trim();
    const email = $('#sEmail').value.trim();
    const pw = $('#sPw').value;
    const err = $('#sErr');
    if (!name) { err.textContent = 'Please choose a name.'; return; }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'That email doesn’t look right.'; return; }
    if (pw.length < 6) { err.textContent = 'Password needs at least 6 characters.'; return; }
    const pwHash = await sha256(pw);
    store.update((s) => { s.user = { name, email, pwHash, dob: $('#sDob').value || null }; s.signedIn = true; s.guest = false; });
    location.hash = '#/home';
  });
}
