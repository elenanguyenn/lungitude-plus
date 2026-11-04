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
// Tap embers before they land. Smoke raises your exposure meter; grab SCBA masks 🎭→😷 to stop it.
export function frenzy(view) {
  view.innerHTML = `<div class="frenzy">${head('Firefighter Frenzy', `<span class="xp-pill" style="border-color:#ff8a65;color:#ff8a65">+${byId('frenzy').xp} XP</span>`)}
    <div class="hud"><span>🔥 <b id="fs">0</b></span><div class="meter time"><i id="ft" style="width:100%"></i></div><span id="fsec">45s</span></div>
    <div class="hud"><small>Exposure</small><div class="meter exp"><i id="fe" style="width:0%"></i></div><small id="fep">0%</small></div>
    <div class="arena" id="arena"><div class="smoke-veil" id="veil" style="opacity:0"></div><div class="shield-ring" id="shield"></div>
      <div class="overlay" id="ov"><h2>Firefighter Frenzy</h2>
        <div class="howto"><span>🔥</span><span>Tap embers before they hit the ground</span><span>💨</span><span>Missed embers make smoke and raise your exposure</span><span>😷</span><span>Grab an SCBA mask to block smoke for 5 seconds</span></div>
        <p>Keep exposure under 100% for 45 seconds. Protection matters as much as speed!</p><button class="cta" id="start">Start shift</button></div></div></div>`;
  const arena = $('#arena', view);
  let raf, last, spawnT = 0, time = 45, score = 0, exposure = 0, shield = 0, sprites = [], running = false;
  const W = () => arena.clientWidth, H = () => arena.clientHeight;
  const pop = (x, y, t, c) => { const e = document.createElement('div'); e.className = 'pop'; e.style.cssText = `left:${x}px;top:${y}px;color:${c}`; e.textContent = t; arena.appendChild(e); setTimeout(() => e.remove(), 700); };
  const spawn = () => {
    const mask = Math.random() < 0.09;
    const el = document.createElement('div'); el.className = `sprite ${mask ? 'mask' : ''}`;
    const size = mask ? 40 : 30 + Math.random() * 18; el.style.fontSize = `${size}px`;
    el.textContent = mask ? '😷' : Math.random() < 0.2 ? '💥' : '🔥';
    const s = { el, x: 10 + Math.random() * (W() - size - 20), y: -50, v: (mask ? 90 : 70 + Math.random() * 60) * (1 + (45 - time) / 60), mask, size };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (!running) return;
      if (s.mask) { shield = 5; pop(s.x, s.y, 'SCBA ON!', '#4fc3f7'); } else { score++; pop(s.x, s.y, '+1', '#ffd54a'); }
      haptic(); remove(s);
    });
    arena.appendChild(el); sprites.push(s);
  };
  const remove = (s) => { s.el.remove(); sprites = sprites.filter((x) => x !== s); };
  const end = (burned) => {
    running = false; cancelAnimationFrame(raf); sprites.forEach((s) => s.el.remove()); sprites = [];
    store.update((st) => { st.stats.frenzyBest = Math.max(st.stats.frenzyBest, score); });
    const frac = burned ? 0.3 : Math.min(1, 0.5 + score / 60);
    const r = finish('frenzy', frac);
    $('#ov', view).style.display = 'flex';
    $('#ov', view).innerHTML = `<h2>${burned ? 'Too much smoke!' : 'Shift complete!'}</h2><p style="font-size:20px;color:#ff9800;font-weight:700">Embers: ${score}</p>
      <p>${burned ? 'Your exposure hit 100%. In real life, smoke exposure adds up. Grab those SCBA masks!' : score >= 30 ? 'Outstanding work, firefighter!' : 'Good reflexes. Keep training.'}</p>
      ${rewardHTML(r)}<button class="cta" id="start">Play again</button><a class="pill-btn" href="#/home" style="margin-top:10px">Exit</a>`;
    $('#start', view).onclick = start;
  };
  const tick = (t) => {
    if (!running) return;
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    time -= dt; shield = Math.max(0, shield - dt); spawnT -= dt;
    if (spawnT <= 0) { spawn(); spawnT = Math.max(0.35, 0.8 - (45 - time) / 90); }
    for (const s of [...sprites]) {
      s.y += s.v * dt; s.el.style.transform = `translate(${s.x}px,${s.y}px)`;
      if (s.y > H()) { if (!s.mask && !shield) exposure += 7; remove(s); }
    }
    if (!shield) exposure = Math.max(0, exposure - dt * 1.2);
    $('#fs', view).textContent = score; $('#fsec', view).textContent = `${Math.ceil(time)}s`;
    $('#ft', view).style.width = `${(time / 45) * 100}%`;
    $('#fe', view).style.width = `${Math.min(100, exposure)}%`; $('#fep', view).textContent = `${Math.min(100, Math.round(exposure))}%`;
    $('#veil', view).style.opacity = Math.min(0.85, exposure / 110); $('#shield', view).classList.toggle('on', shield > 0);
    if (exposure >= 100) return end(true);
    if (time <= 0) return end(false);
    raf = requestAnimationFrame(tick);
  };
  function start() { time = 45; score = 0; exposure = 0; shield = 0; spawnT = 0; last = 0; $('#ov', view).style.display = 'none'; running = true; raf = requestAnimationFrame(tick); }
  $('#start', view).onclick = start;
  return () => { running = false; cancelAnimationFrame(raf); };
}
