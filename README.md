# Lungitude+ v2: website + iOS app from one codebases


```
www/            ← the whole app (HTML/CSS/JS, no build step). Website AND iOS app use this folder.
  index.html
  css/app.css   ← every Canva color/size is a token at the top of this file
  js/app.js     ← router + tab bar
  js/views/     ← auth, hub (Games/Leaderboard/Balance/Shop), map, ai, profile, modules
  js/data/      ← modules.js (hub cards) + content.js (lesson, quiz, tips, LCAI offline answers)
  js/avatar.js  ← LCAI robot in SVG + Shop catalog
  js/store.js   ← XP, coins, streaks, purchases (saved on device)
api/chat.js     ← Gemini proxy (keeps your key secret)
api/air.js      ← EPA AirNow proxy (keeps your key secret, caches 20 min)
```

## 1. Run it locally
```bash
cd www && python3 -m http.server 5173     # or: npx serve www
```
Open http://localhost:5173. Map, quizzes, games and shop all work. LCAI uses offline answers and the map
uses clearly-labelled sample data until the API keys are set up (step 2).

## 2. Put the website online (Vercel, free)
1. Push this folder to GitHub → import it at vercel.com.
2. In Project → Settings → Environment Variables add:
   - `GEMINI_API_KEY` from https://aistudio.google.com/apikey
   - `AIRNOW_API_KEY` from https://docs.airnowapi.org/ (free account)
   - optional `GEMINI_MODEL` (default `gemini-2.5-flash`)
3. Deploy. The site, `/api/chat` and `/api/air` now run on the same domain. The status pill on the map turns green ("Live · AirNow").

To test the API functions locally: `npm i -g vercel && vercel dev`.

## 3. Build the iOS app (needs a Mac with Xcode)
```bash
npm install
npx cap add ios          # first time only, creates ios/
```
1. In `www/js/config.js` set `API_BASE` to your Vercel URL (e.g. `https://lungitude.vercel.app`).
2. `npm run ios` copies `www/` into the Xcode project and opens it.
3. In Xcode → `App/Info.plist` add **Privacy - Location When In Use Usage Description**:
   "Lungitude+ uses your location to show the nearest air-quality monitor."
4. Set your Team under Signing & Capabilities, pick an iPhone simulator or your phone, press ▶.
5. Replace the app icon: drag `www/assets/icons/icon-1024.png` (or your Canva logo) into `Assets.xcassets/AppIcon`.

Every time you change files in `www/`, run `npx cap sync ios` again.

**App Store notes:** Apple rejects apps that are "just a website", so the native touches matter (location,
haptics, offline answers, games). Because accounts exist, the in-app **Delete account** button is required (included).
Leaflet and Google Fonts load from a CDN; for an offline-proof build, download `leaflet.min.js/css` into
`www/vendor/` and update the two lines in `index.html`.

## Customizing
- **New module/card:** add an entry in `js/data/modules.js`, then a view in `js/views/modules.js` and a route in `js/app.js`.
- **Card images:** The `img` paths in `www/js/data/modules.js` point to files in `www/assets/cards/`. Replace an image with the same filename, or update its `img` path when using a different filename or format.
- **Shop items:** `SHOP` in `js/avatar.js`. Each item is a few lines of SVG.
- **Colors/spacing:** the `:root` tokens at the top of `css/app.css`.

## What's real vs. what to upgrade next
| Feature | Now | Next step |
|---|---|---|
| Accounts, XP, coins, streak | Saved on the device | Firebase/Supabase auth so progress syncs across devices |
| Leaderboard | Your real XP ranked against a labelled sample league | Store players' XP in the same backend |
| Map data | Live EPA AirNow via `/api/air`; sample data fallback | Add CDC EPH / NASA FIRMS active-fire points |
| Fire-risk areas | Illustrative outlines | CAL FIRE Fire Hazard Severity Zones GeoJSON |
| LCAI | Gemini via `/api/chat`; offline keyword answers fallback | Rate limiting (Vercel KV / Upstash) before launch |
