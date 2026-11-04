import { icons } from '../icons.js';
import { store, award } from '../store.js';
import { byId } from '../data/modules.js';
import { LESSON, QUIZ, TIPS } from '../data/content.js';
import { $, $$, haptic, coinToast } from '../util.js';

const head = (title, right = '') => `<header class="page-head"><a class="pill-btn" href="#/home">Exit</a><h1>${title}</h1>${right || '<span style="width:56px"></span>'}</header>`;
const rewardHTML = (r) => `<div class="reward"><span>${icons.coin} +${r.coins} coins</span><span>⚡ +${r.xp} XP</span></div>
  ${r.firstToday ? '' : '<p class="note center">Already completed today: repeats earn 10% XP. Come back tomorrow for the full reward!</p>'}`;
function finish(id, fraction = 1) { const r = award(byId(id), fraction); if (r.coins || r.xp) coinToast(r.coins, r.xp); haptic('Medium'); return r; }

// ---------- Lung Cancer Interactive (merged screen 11 + lunginteractive.html) ----------
export function lesson(view) {
  const mod = byId('lung');
  view.innerHTML = `${head('Lung Cancer Interactive', `<span class="xp-pill">+${mod.xp} XP</span>`)}<div class="body"><div class="gbar"></div><div id="flow"></div></div>`;
  const flow = $('#flow', view);
  let correct = 0; const checks = LESSON.filter((s) => s.check).length;
  const step = (i) => {
    const s = LESSON[i];
    if (!s) {
      const r = finish('lung', Math.max(0.5, correct / checks));
      flow.insertAdjacentHTML('beforeend', `<div class="panel reveal center"><div class="big-emoji">🫁</div><h2>Lesson complete!</h2>
        <p>You got ${correct} of ${checks} quick checks right.</p>${rewardHTML(r)}
        <div class="btn-row"><a class="cta ghost" href="#/quiz">Smoke Shield Quiz</a><a class="cta" href="#/breathe">Breathing Coach</a></div></div>`);
      return;
    }
    flow.insertAdjacentHTML('beforeend', `<section class="panel reveal"><h2>${s.title}</h2>${s.body.map((p) => `<p>${p}</p>`).join('')}</section>`);
    if (!s.check) { step(i + 1); return; }
    const c = s.check;
    const box = document.createElement('section'); box.className = 'panel reveal';
    box.innerHTML = `<h3>Quick check: ${c.q}</h3><div class="choices">${c.choices.map((t, k) => `<button class="choice" data-k="${k}">${String.fromCharCode(65 + k)}. ${t}</button>`).join('')}</div>`;
    flow.appendChild(box);
    $$('.choice', box).forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.k; const ok = k === c.answer; if (ok) correct++;
      $$('.choice', box).forEach((x, j) => { x.disabled = true; if (j === c.answer) x.classList.add('correct'); else if (j === k) x.classList.add('wrong'); });
      box.insertAdjacentHTML('beforeend', `<div class="feedback ${ok ? 'ok' : 'bad'}">${ok ? c.right : c.wrong}</div>`);
      haptic(); setTimeout(() => { step(i + 1); box.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 600);
    }));
  };
  step(0);
}

// ---------- Smoke Shield Quiz ----------
export function quiz(view) {
  let q = 0, xp = 0, streak = 0, right = 0;
  view.innerHTML = `${head('Smoke Shield Quiz', '<span class="xp-pill" id="qxp">0 XP</span>')}
    <div class="body"><div class="progress"><i id="qbar"></i></div><p class="center" id="qstreak" style="color:#fff5c0;margin:10px 0 14px">🔥 Streak: 0</p><div id="qcard"></div></div>`;
  const card = $('#qcard', view);
  const draw = () => {
    if (q >= QUIZ.length) {
      store.update((s) => { s.stats.quizBest = Math.max(s.stats.quizBest, right); });
      const r = finish('quiz', right / QUIZ.length);
      $('#qbar', view).style.width = '100%';
      card.innerHTML = `<div class="panel center reveal"><div class="big-emoji">🏆</div><h2>Quiz complete!</h2><p>${right} / ${QUIZ.length} correct · best streak counts!</p>${rewardHTML(r)}
        <div class="btn-row"><button class="cta ghost" id="again">Try again</button><a class="cta" href="#/breathe">Breathing Coach →</a></div></div>`;
      $('#again', card).onclick = () => { q = xp = streak = right = 0; draw(); };
      return;
    }
    const d = QUIZ[q];
    $('#qbar', view).style.width = `${(q / QUIZ.length) * 100}%`;
    card.innerHTML = `<div class="panel reveal"><div style="color:var(--cyan);font-size:12px;margin-bottom:8px">Question ${q + 1} of ${QUIZ.length}</div>
      <h3 style="line-height:1.45">${d.q}</h3><div class="choices">${d.choices.map((c, i) => `<button class="choice" data-i="${i}">${c}</button>`).join('')}</div><div id="qfoot"></div></div>`;
    $$('.choice', card).forEach((b) => b.onclick = () => {
      const i = +b.dataset.i, ok = i === d.answer;
      $$('.choice', card).forEach((x, j) => { x.disabled = true; if (j === d.answer) x.classList.add('correct'); else if (j === i) x.classList.add('wrong'); });
      if (ok) { right++; xp += 10 + streak * 2; streak++; } else streak = 0;
      $('#qxp', view).textContent = `${xp} XP`; $('#qstreak', view).textContent = `🔥 Streak: ${streak}`;
      $('#qfoot', card).innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}">💡 ${d.fact}</div><button class="cta" style="margin-top:14px" id="qn">${q === QUIZ.length - 1 ? 'Finish' : 'Next →'}</button>`;
      $('#qn', card).onclick = () => { q++; draw(); }; haptic();
    });
  };
  draw();
}

// ---------- PM2.5 video ----------
export function video(view) {
  view.innerHTML = `${head('PM2.5 Explained', `<span class="xp-pill">+${byId('pm25').xp} XP</span>`)}<div class="body">
    <div class="video"><iframe src="https://www.youtube-nocookie.com/embed/ltbx_Gb4x9w?rel=0&modestbranding=1&playsinline=1" title="PM2.5 explained" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
    <div class="panel"><h3 style="color:var(--cyan)">Why this matters</h3><p>PM2.5 particles are 2.5 micrometers or smaller, small enough to travel deep into lung tissue. Repeated smoke exposure is linked to asthma attacks, COPD, heart problems and, over the long term, lung cancer.</p></div>
    <div class="panel"><h3>⚠️ For firefighters</h3><p>Wildfire smoke can push PM2.5 far above the EPA's health-based standards. Respiratory protection, decon and limiting time in smoke are the biggest levers you control.</p></div>
    <button class="cta" id="watched" disabled>Watch for 60 s to claim reward…</button></div>`;
  const btn = $('#watched', view); let left = 60;
  const t = setInterval(() => { left--; btn.textContent = `Watch for ${left} s to claim reward…`; if (left <= 0) { clearInterval(t); btn.disabled = false; btn.textContent = 'I watched it, claim reward'; } }, 1000);
  btn.onclick = () => { const r = finish('pm25'); btn.outerHTML = rewardHTML(r); };
  return () => clearInterval(t);
}

// ---------- Safety Tips (visual) ----------
export function tips(view) {
  view.innerHTML = `${head('Safety Tips', `<span class="xp-pill">+${byId('tips').xp} XP</span>`)}<div class="body" style="max-width:900px">
    <p class="note center">Swipe through all ${TIPS.length} cards</p>
    <div class="tips" id="tipRail">${TIPS.map((t) => `<article class="tip ${t.who === 'Firefighters' ? 'ff' : ''}"><span class="who">${t.who}</span><div class="t-ico">${t.ico}</div><h3>${t.title}</h3><p>${t.text}</p></article>`).join('')}</div>
    <div class="tip-dots">${TIPS.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
    <div class="panel" style="margin-top:18px"><h3>SCBA vs. no protection</h3><div class="compare">
      <div class="no"><b>No protection</b>PM2.5 and toxic gases reach deep lung tissue. Repeated exposure adds up over a career.</div>
      <div class="yes"><b>With SCBA</b>Clean air from the tank, so particles <em>and</em> gases are kept out as long as the mask seals and stays on.</div></div></div>
    <button class="cta" id="tipDone" disabled>See every card to finish</button></div>`;
  const rail = $('#tipRail', view), dots = $$('.tip-dots i', view), btn = $('#tipDone', view); const seen = new Set([0]);
  rail.addEventListener('scroll', () => {
    const i = Math.round(rail.scrollLeft / (rail.firstElementChild.offsetWidth + 14));
    dots.forEach((d, j) => d.classList.toggle('on', j === i)); seen.add(i);
    if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 10) TIPS.forEach((_, j) => seen.add(j));
    if (seen.size >= TIPS.length && btn.disabled) { btn.disabled = false; btn.textContent = 'Got it, claim reward'; }
  }, { passive: true });
  btn.onclick = () => { const r = finish('tips'); btn.outerHTML = rewardHTML(r); };
}

// ---------- Breathing Coach ----------
export function breathe(view) {
  const P = [['Inhale', 'Breathe in slowly through your nose', 1.4], ['Hold', 'Hold gently', 1.4], ['Exhale', 'Breathe out slowly through your mouth', 1], ['Hold', 'Rest before the next breath', 1]];
  view.innerHTML = `${head('Breathing Coach', `<span class="xp-pill" id="sess">${store.get().stats.breathSessions} sessions</span>`)}
    <div class="body breathe"><p class="note">Box breathing · 4-4-4-4 · practice indoors on smoky days</p>
    <div class="orb-wrap"><div class="ring"></div><div class="ring mid"></div><div class="orb" id="orb">4</div></div>
    <h2 id="ph" style="margin:0">Tap start</h2><p class="note" id="pd">4 rounds = 1 session · a calming routine</p>
    <button class="cta" id="go" style="max-width:240px">Start</button><div class="dots">${'<i></i>'.repeat(4)}</div></div>`;
  let timer = null, phase = 0, count = 4, round = 0;
  const orb = $('#orb', view), rings = $$('.ring', view), go = $('#go', view), dots = $$('.dots i', view);
  const paint = () => { const [n, d, sc] = P[phase]; $('#ph', view).textContent = n; $('#pd', view).textContent = d; orb.textContent = count; orb.style.transform = `scale(${sc})`; rings.forEach((r) => r.style.transform = `scale(${sc === 1 ? 1 : 1.25})`); };
  const stop = () => { clearInterval(timer); timer = null; go.textContent = 'Start'; orb.style.transform = 'scale(1)'; $('#ph', view).textContent = 'Tap start'; };
  go.onclick = () => {
    if (timer) return stop();
    phase = 0; count = 4; round = 0; dots.forEach((d) => d.classList.remove('on')); go.textContent = 'Stop'; paint();
    timer = setInterval(() => {
      if (--count > 0) { orb.textContent = count; return; }
      phase = (phase + 1) % 4; count = 4;
      if (phase === 0) {
        dots[round]?.classList.add('on'); round++;
        if (round >= 4) {
          stop(); store.update((s) => { s.stats.breathSessions++; });
          $('#sess', view).textContent = `${store.get().stats.breathSessions} sessions`;
          const r = finish('breathe'); $('#pd', view).innerHTML = `Session complete! +${r.xp} XP`; return;
        }
      }
      paint();
    }, 1000);
  };
  return stop;
}

// ---------- Firefighter Frenzy ----------
// Illustrated neighborhood at dusk. Fires break out in windows; tap to put them out.
// Fires left burning send smoke into the air and raise your exposure. Grab the SCBA mask to stay protected.
const FLAME = `<g class="flame"><path d="M0-34C9-22 16-14 14-3 13 6 7 12 0 12S-13 6-14-3C-15-12-8-17-4-26-3-18 1-15 3-13 4-20 2-27 0-34z" fill="#d9480f"/>
  <path d="M0-20C6-12 9-7 8-1 7 5 4 8 0 8S-7 5-8-1C-8-6-5-9-2-14-1-9 1-8 2-7 3-11 2-15 0-20z" fill="#f08c00"/>
  <path d="M0-8C3-4 4-2 4 1 4 4 2 5 0 5S-4 4-4 1C-4-1-2-3 0-8z" fill="#fcc419"/></g>`;
const MASK = `<g class="scba"><circle r="20" fill="#fff" stroke="#1c7ed6" stroke-width="3"/><path d="M-10-6c0-6 4-9 10-9s10 3 10 9v6c0 7-5 12-10 12S-10 7-10 0z" fill="#343a40"/>
  <rect x="-7" y="-9" width="14" height="8" rx="3" fill="#a5d8ff"/><circle cy="6" r="4" fill="#868e96"/></g>`;

function scene() {
  // buildings: [x, width, height, color, windowCols, windowRows]
  const B = [[8, 70, 250, '#56657a', 2, 5], [86, 90, 330, '#6b7a8f', 3, 6], [184, 64, 210, '#4d5b6e', 2, 4], [256, 84, 290, '#627187', 3, 5], [348, 46, 230, '#56657a', 1, 4]];
  const ground = 470; const windows = [];
  const bld = B.map(([x, w, h, c, cols, rows]) => {
    const top = ground - h; let win = '';
    const gx = w / cols, gy = (h - 40) / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const wx = x + gx * k + gx / 2, wy = top + 26 + gy * r + gy / 2;
      windows.push([wx, wy]);
      win += `<rect x="${wx - 9}" y="${wy - 11}" width="18" height="22" rx="2" fill="#f4e8cc"/>`;
    }
    return `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}"/><rect x="${x - 3}" y="${top - 6}" width="${w + 6}" height="8" fill="#3d4858"/>${win}`;
  }).join('');
  const svg = `<svg class="scene" viewBox="0 0 400 560" preserveAspectRatio="xMidYMax slice">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7c59f"/><stop offset=".6" stop-color="#f6dcc0"/><stop offset="1" stop-color="#efe3d3"/></linearGradient></defs>
    <rect width="400" height="560" fill="url(#sky)"/>
    <circle cx="320" cy="90" r="34" fill="#f9d8a8"/>
    <path d="M0 360 Q80 300 160 340 T320 320 T400 330 V560 H0z" fill="#d9b99b"/>
    <path d="M0 400 Q100 360 200 390 T400 380 V560 H0z" fill="#c8a688"/>
    <g id="smokeLayer"></g>
    ${bld}
    <rect y="${ground}" width="400" height="90" fill="#7b8a6a"/><rect y="${ground + 30}" width="400" height="34" fill="#495057"/>
    <path d="M0 ${ground + 47}h400" stroke="#f1f3f5" stroke-width="2" stroke-dasharray="18 14"/>
    <g id="fireLayer"></g><g id="fxLayer"></g>
  </svg>`;
  return { svg, windows, ground };
}

export function frenzy(view) {
  const mod = byId('frenzy');
  const { svg, windows, ground } = scene();
  view.innerHTML = `<div class="frenzy">
    <header class="fz-head"><a class="fz-exit" href="#/home">Exit</a><h1>Firefighter Frenzy</h1><span class="fz-xp">+${mod.xp} XP</span></header>
    <div class="fz-hud">
      <div><small>Fires out</small><b id="fs">0</b></div>
      <div class="fz-bar"><small>Time</small><div class="meter time"><i id="ft" style="width:100%"></i></div></div>
      <div class="fz-bar"><small>Smoke exposure <span id="fep">0%</span></small><div class="meter exp"><i id="fe" style="width:0%"></i></div></div>
      <span class="fz-scba" id="scbaTag" hidden>SCBA on</span>
    </div>
    <div class="arena" id="arena">${svg}
      <div class="overlay" id="ov"><div class="fz-card">
        <h2>Firefighter Frenzy</h2>
        <ul class="howto">
          <li><svg viewBox="-16 -36 32 50" width="26">${FLAME}</svg>Tap fires to put them out. Catch them early for bonus points.</li>
          <li><span class="smoke-ico"></span>Fires left burning release smoke and raise your exposure.</li>
          <li><svg viewBox="-22 -22 44 44" width="26">${MASK}</svg>Grab the SCBA mask to breathe clean air for 6 seconds.</li>
        </ul>
        <p>Last 45 seconds without your exposure reaching 100%.</p>
        <button class="fz-btn" id="start">Start shift</button></div></div>
    </div></div>`;

  const svgEl = $('.scene', view), fireLayer = $('#fireLayer', view), smokeLayer = $('#smokeLayer', view), fx = $('#fxLayer', view);
  const NS = 'http://www.w3.org/2000/svg';
  let raf, last = 0, time, score, exposure, shield, spawnT, maskT, fires, mask, running = false;

  const node = (html, x, y) => { const g = document.createElementNS(NS, 'g'); g.setAttribute('transform', `translate(${x} ${y})`); g.innerHTML = html; return g; };
  const splash = (x, y) => {
    const g = node(`<g class="splash"><circle r="6" fill="#74c0fc"/><circle cx="-10" cy="-6" r="4" fill="#a5d8ff"/><circle cx="9" cy="-8" r="4" fill="#a5d8ff"/><circle cx="2" cy="-16" r="3" fill="#d0ebff"/></g>`, x, y); fx.appendChild(g); setTimeout(() => g.remove(), 500);
  };
  const puff = (x, y) => {
    const g = node(`<g class="puff"><circle r="${10 + Math.random() * 8}" fill="#868e96"/></g>`, x + (Math.random() * 10 - 5), y - 20); smokeLayer.appendChild(g); setTimeout(() => g.remove(), 3000);
  };
  const floater = (x, y, text, color) => {
    const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y - 30); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', color); t.setAttribute('class', 'floater'); t.textContent = text; fx.appendChild(t); setTimeout(() => t.remove(), 800);
  };

  const spawnFire = () => {
    const free = windows.filter(([x, y]) => !fires.some((f) => f.x === x && f.y === y));
    if (!free.length) return;
    const [x, y] = free[Math.floor(Math.random() * free.length)];
    const g = node(`<rect x="-9" y="-11" width="18" height="22" rx="2" fill="#e8590c" opacity=".35"/><g class="grow">${FLAME}</g><circle r="22" fill="transparent"/>`, x, y + 8);
    g.classList.add('fire');
    const f = { x, y, g, age: 0, puffT: 0 };
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (!running) return;
      const early = f.age < 2.5; score += early ? 2 : 1;
      splash(x, y); floater(x, y, early ? '+2' : '+1', '#1864ab'); haptic();
      g.remove(); fires = fires.filter((z) => z !== f);
    });
    fireLayer.appendChild(g); fires.push(f);
  };

  const spawnMask = () => {
    if (mask) return;
    const x = 30 + Math.random() * 340, y = ground + 16;
    const g = node(`<g class="mask-item">${MASK}</g>`, x, y);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (!running) return;
      shield = 6; floater(x, y, 'SCBA on', '#1864ab'); haptic('Medium'); g.remove(); mask = null;
    });
    fireLayer.appendChild(g); mask = { g, life: 5 };
  };

  const end = (burned) => {
    running = false; cancelAnimationFrame(raf);
    store.update((st) => { st.stats.frenzyBest = Math.max(st.stats.frenzyBest, score); });
    const r = finish('frenzy', burned ? 0.3 : Math.min(1, 0.5 + score / 50));
    $('#ov', view).style.display = 'flex';
    $('#ov', view).innerHTML = `<div class="fz-card"><h2>${burned ? 'Too much smoke' : 'Shift complete'}</h2>
      <p class="fz-score">${score} points</p>
      <p>${burned ? 'Your exposure reached 100%. On a real fireground, smoke exposure adds up over a career, which is why SCBA stays on through overhaul.' : score >= 40 ? 'Outstanding work. Quick response keeps smoke, and exposure, down.' : 'Nice work. Try catching fires earlier to limit smoke.'}</p>
      ${rewardHTML(r)}<button class="fz-btn" id="start">Play again</button></div>`;
    $('#start', view).onclick = start;
  };

  const tick = (t) => {
    if (!running) return;
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    time -= dt; shield = Math.max(0, shield - dt); spawnT -= dt; maskT -= dt;
    const pace = 1 + (45 - time) / 30;
    if (spawnT <= 0) { spawnFire(); spawnT = Math.max(0.55, 1.6 / pace); }
    if (maskT <= 0) { spawnMask(); maskT = 9 + Math.random() * 5; }
    if (mask && (mask.life -= dt) <= 0) { mask.g.remove(); mask = null; }
    for (const f of fires) {
      f.age += dt;
      const s = Math.min(1.5, 0.5 + f.age / 3);
      f.g.querySelector('.grow').setAttribute('transform', `scale(${s})`);
      if (f.age > 3) {
        if (!shield) exposure += dt * 4.5;
        if ((f.puffT -= dt) <= 0) { puff(f.x, f.y); f.puffT = 0.6; }
      }
    }
    if (!fires.length) exposure = Math.max(0, exposure - dt * 3);
    $('#fs', view).textContent = score;
    $('#ft', view).style.width = `${Math.max(0, time / 45) * 100}%`;
    $('#fe', view).style.width = `${Math.min(100, exposure)}%`; $('#fep', view).textContent = `${Math.min(100, Math.round(exposure))}%`;
    $('#scbaTag', view).hidden = shield <= 0;
    $('#arena', view).style.setProperty('--haze', Math.min(0.55, exposure / 180));
    if (exposure >= 100) return end(true);
    if (time <= 0) return end(false);
    raf = requestAnimationFrame(tick);
  };

  function start() {
    fireLayer.innerHTML = ''; smokeLayer.innerHTML = ''; fx.innerHTML = '';
    time = 45; score = 0; exposure = 0; shield = 0; spawnT = 0.3; maskT = 6; fires = []; mask = null; last = 0;
    $('#ov', view).style.display = 'none'; running = true; raf = requestAnimationFrame(tick);
  }
  $('#start', view).onclick = start;
  return () => { running = false; cancelAnimationFrame(raf); };
}