import { icons } from '../icons.js';
import { store } from '../store.js';
import { avatarSVG } from '../avatar.js';
import { CONFIG } from '../config.js';
import { LOCAL_KB, LOCAL_FALLBACK } from '../data/content.js';
import { $, esc, md, haptic } from '../util.js';

const PROMPTS = ['Is the air safe to run outside today?', 'What does PM2.5 do to my lungs?', 'Best mask for wildfire smoke?', 'How can firefighters lower cancer risk?'];
let pendingPrompt = null;
/** Lets other screens (e.g. the map) open LCAI with a question ready to send. */
export const askLCAI = (text) => { pendingPrompt = text; location.hash = '#/ai'; };

function localAnswer(msg) {
  const l = msg.toLowerCase();
  return (LOCAL_KB.find((e) => e.keys.some((k) => l.includes(k))) || { r: LOCAL_FALLBACK }).r;
}

export function render(view) {
  const s = store.get();
  view.innerHTML = `
    <div class="ai-page ${s.chat.length ? 'chatting' : ''}" id="aiPage">
      <header class="ai-header">
        <div class="ai-brand"><div class="ai-avatar" id="botSlot">${avatarSVG(s.equipped)}</div>
          <div class="ai-brand-copy"><h1>LCAI</h1></div>
        </div>
      </header>
      <section class="ai-welcome" id="welcome" ${s.chat.length ? 'hidden' : ''}>
        <div class="ai-welcome-figure">${avatarSVG(s.equipped, { wave: true })}</div>
        <span class="ai-welcome-kicker">YOUR RESPIRATORY HEALTH COMPANION</span>
        <h2>Hi, I’m LCAI.</h2>
        <p>Ask me about air quality, wildfire smoke, and ways to protect your lungs.</p>
        <span class="ai-disclaimer">General information, not a medical diagnosis.</span>
      </section>
      <div class="messages" id="msgs" aria-live="polite"></div>
      <section class="ai-quick" aria-label="Suggested questions" ${s.chat.length ? 'hidden' : ''}>
        <div class="ai-quick-heading"><h2>What can I help with?</h2><span>Choose a topic</span></div>
        <div class="prompts" id="prompts" ${s.chat.length ? 'hidden' : ''}>${PROMPTS.map((p) => `<button type="button">${p}</button>`).join('')}</div>
      </section>
      <p class="ai-mode" id="mode"></p>
      <form class="composer" id="cmp">
        <button type="button" id="more" aria-label="Suggested questions">${icons.plus}</button>
        <textarea id="inp" rows="1" placeholder="Message LCAI…" aria-label="Message LCAI"></textarea>
        <button type="button" class="mic" id="mic" aria-label="Speak">${icons.mic}</button>
        <button type="submit" class="send" aria-label="Send">${icons.send}</button>
      </form>
    </div>`;
  const msgs = $('#msgs', view), inp = $('#inp', view), page = $('#aiPage', view);
  const bubble = (role, html) => {
    const row = document.createElement('div');
    row.className = `msg-row ${role === 'user' ? 'msg-row-user' : 'msg-row-ai'}`;
    if (role !== 'user') row.innerHTML = `<span class="msg-avatar" aria-hidden="true">${icons.ai}</span>`;
    const d = document.createElement('div'); d.className = `msg ${role === 'user' ? 'me' : 'ai'}`; d.innerHTML = html;
    row.appendChild(d); msgs.appendChild(row); row.scrollIntoView({ behavior: 'smooth', block: 'end' }); return d;
  };
  s.chat.forEach((m) => bubble(m.role, m.role === 'user' ? esc(m.text) : md(m.text)));

  const send = async (text) => {
    text = text.trim(); if (!text) return;
    page.classList.add('chatting'); $('#welcome', view).hidden = true; $('.ai-quick', view).hidden = true; $('#prompts', view).hidden = true;
    inp.value = ''; inp.style.height = '';
    bubble('user', esc(text));
    store.update((st) => { st.chat.push({ role: 'user', text }); st.chat = st.chat.slice(-30); st.stats.questionsAsked++; });
    const t = bubble('ai', '<span class="typing"><i></i><i></i><i></i></span>');
    $('#botSlot svg', view)?.classList.add('thinking');
    let reply, offline = false;
    try {
      const ctx = sessionStorage.getItem('lungitude.nearest');
      const res = await fetch(`${CONFIG.API_BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: store.get().chat.slice(-12), context: ctx ? JSON.parse(ctx) : null }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(res.status);
      reply = (await res.json()).reply;
      if (!reply) throw new Error('empty');
    } catch {
      offline = true; await new Promise((r) => setTimeout(r, 500)); reply = localAnswer(text);
    }
    $('#botSlot svg', view)?.classList.remove('thinking');
    t.innerHTML = md(reply); haptic();
    $('#mode', view).textContent = offline ? 'Offline mode: built-in answers. Connect the Gemini proxy for full AI.' : '';
    store.update((st) => { st.chat.push({ role: 'model', text: reply }); st.chat = st.chat.slice(-30); });
  };

  $('#cmp', view).addEventListener('submit', (e) => { e.preventDefault(); send(inp.value); });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inp.value); } });
  inp.addEventListener('input', () => { inp.style.height = 'auto'; inp.style.height = `${Math.min(120, inp.scrollHeight)}px`; });
  $('#prompts', view).addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') send(e.target.textContent); });
  $('#more', view).onclick = () => {
    const quick = $('.ai-quick', view), p = $('#prompts', view);
    p.hidden = !p.hidden; quick.hidden = p.hidden;
  };

  // Voice input where supported (Chrome/Edge/Safari desktop; hidden elsewhere)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = $('#mic', view);
  if (!SR) mic.style.display = 'none';
  else mic.onclick = () => {
    const r = new SR(); r.lang = navigator.language || 'en-US'; r.interimResults = true;
    mic.classList.add('rec');
    r.onresult = (e) => { inp.value = [...e.results].map((x) => x[0].transcript).join(''); };
    r.onend = () => { mic.classList.remove('rec'); if (inp.value.trim()) send(inp.value); };
    r.start();
  };

  if (pendingPrompt) { const p = pendingPrompt; pendingPrompt = null; send(p); }
}
