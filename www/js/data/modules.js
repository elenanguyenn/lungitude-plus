// The learning hub catalog. Add a module here and it shows up on the Games tab automatically.
// coins/xp = reward for the first completion each day (matches the badges on the Canva cards).
   export const PM25_VIDEO_URL = 'https://www.youtube.com/watch?v=utF7NuuiZrQ';
export const MODULES = [
  { id: 'lung',    title: 'Lung Cancer',        kind: 'Interactive', type: 'Interactive', xp: 800,  coins: 50, img: 'assets/cards/lung.png',   route: '#/learn/lung',
    keywords: 'lesson cancer pm2.5 oxidative stress carcinogen' },
  { id: 'frenzy',  title: 'Firefighter Frenzy', kind: 'Game',        type: 'Game',        xp: 1000, coins: 80, img: 'assets/cards/frenzy.png', route: '#/play/frenzy',
    keywords: 'game ember scba mask smoke exposure' },
  { id: 'pm25',    title: 'PM2.5',              kind: 'Video',       type: 'Video',       xp: 300,  coins: 25, img: 'assets/cards/pm25.png',   route: '#/watch/pm25',
    keywords: 'video particulate matter explained' },
  { id: 'tips',    title: 'Safety Tips',        kind: 'Visual only', type: 'Visual',      xp: 100,  coins: 10, img: 'assets/cards/tips.svg',   route: '#/tips',
    keywords: 'n95 hepa filter decon scba firefighter' },
  { id: 'quiz',    title: 'Smoke Shield Quiz',  kind: 'Quiz',        type: 'Interactive', xp: 500,  coins: 40, emoji: '🛡️', tint: 'linear-gradient(135deg,#ffe0ec,#d7f2ff)', route: '#/quiz',
    keywords: 'quiz aqi test streak' },
  { id: 'breathe', title: 'Breathing Coach',    kind: 'Practice',    type: 'Practice',    xp: 150,  coins: 15, emoji: '🫁', tint: 'linear-gradient(135deg,#d7f2ff,#e8e2ff)', route: '#/breathe',
    keywords: 'box breathing calm relax' },
];

export const MODULE_TYPES = ['Interactive', 'Game', 'Video', 'Visual', 'Practice'];
export const byId = (id) => MODULES.find((m) => m.id === id);
