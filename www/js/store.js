// Single source of truth for progress: XP, coins, streak, completions, shop items, settings.
// Saved to localStorage (works on the website and inside the iOS app).
// To sync across devices / power a real leaderboard, swap load()/persist() for Firebase or Supabase.
import { today } from './util.js';

const KEY = 'lungitude.v2';
const listeners = new Set();

const DEFAULT = {
  user: null,            // { name, email, pwHash, dob }
  signedIn: false,
  guest: false,
  xp: 0,
  coins: 0,
  streak: { count: 0, last: null },
  completions: {},       // moduleId -> { count, lastDay, best }
  owned: ['color:classic', 'mood:happy'],
  equipped: { head: null, color: 'classic', eyes: null, mood: 'happy' },
  theme: 'dark',
  chat: [],
  stats: { breathSessions: 0, frenzyBest: 0, quizBest: 0, questionsAsked: 0 },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const s = JSON.parse(raw);
    return { ...structuredClone(DEFAULT), ...s, equipped: { ...DEFAULT.equipped, ...s.equipped }, stats: { ...DEFAULT.stats, ...s.stats } };
  } catch { return structuredClone(DEFAULT); }
}
let state = load();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  update(fn) { fn(state); persist(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  reset({ keepAccount = true } = {}) {
    const { user, signedIn, guest, theme } = state;
    state = structuredClone(DEFAULT);
    if (keepAccount) Object.assign(state, { user, signedIn, guest, theme });
    persist();
  },
};

/** Count today toward the streak (consecutive days with at least one activity). */
export function touchStreak() {
  const t = today();
  const s = state.streak;
  if (s.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  s.count = s.last === yStr ? s.count + 1 : 1;
  s.last = t;
}

/** Streak shown to the user (0 if they missed yesterday and haven't played today). */
export function liveStreak() {
  const s = state.streak;
  if (!s.last) return 0;
  const diff = Math.round((new Date(today()) - new Date(s.last)) / 864e5);
  return diff <= 1 ? s.count : 0;
}

/**
 * Award a module. First completion each day pays the card's full coins + XP (scaled by score);
 * repeats the same day still earn 10% XP so practice always counts.
 * @param {object} mod  module from data/modules.js
 * @param {number} fraction 0..1 performance (quiz score etc.)
 */
export function award(mod, fraction = 1) {
  const t = today();
  const c = state.completions[mod.id] || { count: 0, lastDay: null, best: 0 };
  const firstToday = c.lastDay !== t;
  const xp = Math.round(mod.xp * fraction * (firstToday ? 1 : 0.1));
  const coins = firstToday && fraction >= 0.5 ? mod.coins : 0;
  store.update((s) => {
    s.xp += xp; s.coins += coins;
    s.completions[mod.id] = { count: c.count + 1, lastDay: t, best: Math.max(c.best, fraction) };
    touchStreak();
  });
  return { xp, coins, firstToday };
}

export const doneToday = (id) => state.completions[id]?.lastDay === today();
