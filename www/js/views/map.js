import { icons } from '../icons.js';
import { CONFIG } from '../config.js';
import { pmToAqi, category, CATEGORIES } from '../aqi.js';
import { askLCAI } from './ai.js';
import { $, $$, esc, openSheet, toast, distKm, haptic } from '../util.js';

// Shown only when live AirNow data can't be loaded. Clearly labelled "Sample data" in the UI.
const SAMPLE = [
  ['Fontana', 34.0922, -117.435, 24.8, 'Steel + I-10 freight corridor'], ['Ontario', 34.0633, -117.6509, 22.1, 'Major freight hub'],
  ['San Bernardino', 34.1083, -117.2898, 27.5, 'Inland basin air trap'], ['Moreno Valley', 33.9375, -117.2306, 19.4, 'Inland basin'],
  ['Riverside', 33.9533, -117.3962, 21.7, 'Inland Empire corridor'], ['Pomona', 34.0553, -117.75, 18.2, 'Smog accumulation zone'],
  ['Rancho Cucamonga', 34.1064, -117.5931, 16.9, 'Foothill community'], ['Upland', 34.0975, -117.6484, 15.8, 'Foothill community'],
  ['Santa Ana', 33.7455, -117.8677, 12.4, 'Santa Ana wind corridor'], ['Compton', 33.8958, -118.2201, 14.6, 'Industrial zone, port proximity'],
  ['Banning', 33.9256, -116.876, 11.3, 'Pass funnels inland smog'], ['Anaheim', 33.8366, -117.9143, 13.1, 'I-5 / SR-91 corridor'],
  ['Pasadena', 34.1478, -118.1445, 13.9, 'Foothill inversions'], ['Long Beach', 33.7701, -118.1937, 11.6, 'Port emissions'],
  ['Burbank', 34.1808, -118.309, 10.8, 'Valley inversions'], ['Palmdale', 34.5794, -118.1165, 7.9, 'Antelope Valley'],
  ['Downtown LA', 34.0407, -118.2468, 12.7, 'Urban traffic'], ['Lancaster', 34.6868, -118.1542, 6.8, 'Antelope Valley'],
  ['Thousand Oaks', 34.1706, -118.8376, 6.2, 'Near Woolsey Fire burn area'], ['Santa Monica', 34.0195, -118.4912, 5.4, 'Marine layer'],
  ['Ventura', 34.2749, -119.229, 6.6, 'Coastal'], ['Malibu', 34.0259, -118.7798, 4.1, 'Coastal, high fire risk'],
  ['Redlands', 34.0556, -117.1825, 23.6, 'East valley'], ['Temecula', 33.4936, -117.1484, 9.2, 'Inland valley'], ['San Diego', 32.7157, -117.1611, 8.4, 'Coastal'],
].map(([name, lat, lng, pm25, note]) => ({ name, lat, lng, pm25, note }));

// Illustrative outlines only. For official maps use CAL FIRE Fire Hazard Severity Zones.
const FIRE_ZONES = [
  ['San Gabriel Mountains / Angeles NF', [[34.42, -118.15], [34.47, -117.82], [34.38, -117.6], [34.22, -117.62], [34.15, -117.85], [34.2, -118.1], [34.28, -118.22]]],
  ['Santa Monica Mountains', [[34.12, -118.92], [34.14, -118.45], [34.06, -118.42], [33.98, -118.55], [34.0, -118.9]]],
  ['San Bernardino Mountains', [[34.32, -117.35], [34.33, -116.85], [34.15, -116.75], [34.12, -117.2]]],
  ['Woolsey / Conejo corridor', [[34.22, -119.0], [34.24, -118.75], [34.1, -118.72], [34.06, -118.92]]],
];

let stations = [], live = false, me = null;

async function airnowDirect() {
  const pad = (n) => String(n).padStart(2, '0'); const b = CONFIG.BBOX;
  for (let back = 1; back <= 3; back++) {
    const t = new Date(Date.now() - back * 3600e3);
    const hour = `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}`;
    const url = `https://www.airnowapi.org/aq/data/?startDate=${hour}&endDate=${hour}&parameters=PM25&BBOX=${b.minLng},${b.minLat},${b.maxLng},${b.maxLat}&dataType=B&format=application/json&verbose=1&monitorType=2&includerawconcentrations=0&API_KEY=${CONFIG.AIRNOW_API_KEY}`;
    const rows = await (await fetch(url, { signal: AbortSignal.timeout(12000) })).json();
    const stations = (Array.isArray(rows) ? rows : []).filter((s) => s.Parameter === 'PM2.5' && s.Value >= 0)
      .map((s) => ({ name: s.SiteName, lat: s.Latitude, lng: s.Longitude, pm25: Math.round(s.Value * 10) / 10, aqi: s.AQI >= 0 ? s.AQI : null, agency: s.AgencyName, updated: `${s.UTC}:00Z` }));
    if (stations.length) return { stations };
  }
  throw new Error('no data');
}

async function loadStations() {
  try {
    let data;
    if (CONFIG.AIRNOW_API_KEY) data = await airnowDirect();
    else {
      const res = await fetch(`${CONFIG.API_BASE}/api/air`, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
    }
    if (!Array.isArray(data.stations) || !data.stations.length) throw new Error('empty');
    live = true;
    return data.stations;
  } catch { live = false; return SAMPLE; }
}

const enrich = (s) => { const aqi = s.aqi ?? pmToAqi(s.pm25); return { ...s, aqi, cat: category(aqi) }; };

export function render(view) {
  view.innerHTML = `
  <div class="map-page">
    <div id="pmMap" role="application" aria-label="PM2.5 map of Southern California"></div>
    <div class="map-top">
      <form class="map-search" id="msForm" role="search">${icons.pin}
        <input id="ms" placeholder="Search a city or ZIP in SoCal" autocomplete="off" aria-label="Search places">
        <button type="button" class="clear" id="msClear" aria-label="Clear search" hidden>${icons.closeCircle}</button>
      </form>
      <div class="suggest" id="sug" hidden></div>
      <div class="map-chips" id="chips">
        <button class="map-chip" data-layer="haze">${icons.wind} Heat view</button>
        <button class="map-chip on" data-layer="dots">${icons.pin} Monitors</button>
        <button class="map-chip" data-layer="fire">${icons.fire} Fire-risk areas</button>
        <button class="map-chip" data-sort="worst">Worst first</button>
      </div>
    </div>
    <div class="status-pill" id="status"><i></i><span>Loading…</span></div>
    <div class="map-fabs">
      <button class="fab" id="locate" aria-label="Use my location">${icons.locate}</button>
      <button class="fab" id="legendBtn" aria-label="Legend">${icons.info}</button>
      <button class="fab" id="refresh" aria-label="Refresh data">${icons.layers}</button>
    </div>
    <div class="legend" id="legend"><b>PM2.5 AQI (EPA 2024)</b>
      ${CATEGORIES.map((c) => `<div><i style="background:${c.color}"></i>${c.name}</div>`).join('')}
      <div><i style="background:rgba(255,87,34,.4);border:1px dashed #ff5722;border-radius:2px"></i>Fire-risk area (illustrative)</div>
    </div>
    <div class="cards-rail" id="rail" aria-label="Monitoring stations"></div>
  </div>`;

  if (typeof window.L === 'undefined') {
    $('#pmMap', view).innerHTML = '<div class="map-error"><div><b>Map couldn’t load.</b><br>Check your internet connection and reopen the Map tab.</div></div>';
    return;
  }
  const L = window.L;
  const m = L.map($('#pmMap', view), { center: CONFIG.MAP_CENTER, zoom: CONFIG.MAP_ZOOM, zoomControl: false, attributionControl: true, minZoom: 6 });
  // Standard light street map (Google-Maps-style look). No key needed.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap contributors · Data: U.S. EPA AirNow',
  }).addTo(m);
  m.createPane('haze').classList.add('haze-pane'); m.getPane('haze').style.zIndex = 350;
  const haze = L.layerGroup(), dots = L.layerGroup().addTo(m), fire = L.layerGroup();
  FIRE_ZONES.forEach(([name, coords]) => L.polygon(coords, { color: '#ff5722', weight: 1.5, dashArray: '6 5', fillOpacity: 0.12 })
    .bindTooltip(`${name}<br><small>Illustrative high fire-risk area</small>`).addTo(fire));
  let meMarker = null, selected = null, sortWorst = false;
  const markers = new Map();

  const draw = () => {
    haze.clearLayers(); dots.clearLayers(); markers.clear();
    stations.forEach((s) => {
      L.circle([s.lat, s.lng], { pane: 'haze', radius: 7000 + s.aqi * 60, stroke: false, fillColor: s.cat.color, fillOpacity: 0.25 }).addTo(haze);
      // Google-Maps-style teardrop pin with the AQI number inside
      const icon = L.divIcon({ className: '', iconSize: [34, 44], iconAnchor: [17, 42],
        html: `<div class="pm-pin" style="--c:${s.cat.color};color:${s.cat.ink}"><span>${s.aqi}</span></div>` });
      const mk = L.marker([s.lat, s.lng], { icon, title: `${s.name}: AQI ${s.aqi}`, keyboard: true }).on('click', () => select(s, true)).addTo(dots);
      markers.set(s, mk);
    });
    drawRail();
  };

  const ordered = () => {
    const list = [...stations];
    if (sortWorst) return list.sort((a, b) => b.aqi - a.aqi);
    const c = me || m.getCenter();
    return list.sort((a, b) => distKm(c, a) - distKm(c, b));
  };

  const drawRail = () => {
    $('#rail', view).innerHTML = ordered().slice(0, 15).map((s, i) => `
      <button class="scard" data-i="${stations.indexOf(s)}">
        <div class="band" style="background:${s.cat.color}">
          ${i === 0 && me && !sortWorst ? '<span class="tag">Nearest</span>' : ''}
          <span class="big" style="color:${s.cat.ink}">${s.aqi}<small>AQI</small></span></div>
        <div class="inner"><h3>${esc(s.name)}</h3><div class="cat" style="color:${s.cat.key === 'moderate' ? '#8a6500' : s.cat.color}">${s.cat.name}</div>
          <div class="row">${icons.wind}${s.pm25} µg/m³ PM2.5${me ? ` · ${distKm(me, s).toFixed(1)} km away` : ''}</div>
          <div class="row">${icons.clock}${s.updated ? `Updated ${new Date(s.updated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Sample reading'}</div></div>
      </button>`).join('');
    $$('.scard', view).forEach((b) => { b.onclick = () => select(stations[+b.dataset.i], true); b.classList.toggle('sel', stations[+b.dataset.i] === selected); });
  };

  const select = (s, open) => {
    selected = s; haptic();
    $$('.pm-pin', view).forEach((d) => d.classList.remove('sel'));
    markers.get(s)?.getElement()?.querySelector('.pm-pin')?.classList.add('sel');
    $$('.scard', view).forEach((c) => c.classList.toggle('sel', stations[+c.dataset.i] === s));
    $(`.scard[data-i="${stations.indexOf(s)}"]`, view)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    m.flyTo([s.lat, s.lng], Math.max(m.getZoom(), 10), { duration: 0.6 });
    if (open) detail(s);
  };

  const detail = (s) => {
    const pct = Math.min(1, s.aqi / 300);
    openSheet(`
      <h2>${esc(s.name)}</h2><div class="note" style="color:#6b6b7a">${esc(s.note || s.agency || '')}${s.updated ? ` · ${new Date(s.updated).toLocaleString()}` : ' · Sample data'}</div>
      <div class="aqi-gauge">
        <svg class="aqi-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" stroke="#eceef5" stroke-width="10" fill="none"/>
          <circle cx="50" cy="50" r="42" stroke="${s.cat.color}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${pct * 264} 264" transform="rotate(-90 50 50)"/>
          <text x="50" y="50" text-anchor="middle" font-size="26" font-weight="800" fill="#1d1d2b">${s.aqi}</text><text x="50" y="68" text-anchor="middle" font-size="11" fill="#6b6b7a">AQI</text></svg>
        <div><b style="font-size:18px">${s.cat.name}</b><div style="color:#4a4a5c">${s.pm25} µg/m³ PM2.5</div>
          <div class="aqi-scale">${CATEGORIES.map((c) => `<i style="background:${c.color}"></i>`).join('')}</div></div>
      </div>
      <div class="tip-box"><b>For everyone:</b> ${s.cat.pub}</div>
      <div class="tip-box"><b>For firefighters:</b> ${s.cat.ff}</div>
      <button class="cta" id="askAi">Ask LCAI about this air</button>`, {
      label: `${s.name} air quality`,
      onMount: (sh) => { $('#askAi', sh).onclick = () => askLCAI(`The AQI in ${s.name} is ${s.aqi} (${s.cat.name}, PM2.5 ${s.pm25} µg/m³). What should I do today?`); },
    });
    sessionStorage.setItem('lungitude.nearest', JSON.stringify({ name: s.name, aqi: s.aqi, category: s.cat.name, pm25: s.pm25, live }));
  };

  const load = async () => {
    $('#status', view).className = 'status-pill'; $('#status span', view).textContent = 'Loading…';
    stations = (await loadStations()).map(enrich);
    $('#status', view).className = `status-pill ${live ? 'live' : ''}`;
    $('#status span', view).textContent = live ? `Live · AirNow · ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Sample data';
    draw();
  };
  load();

  // Layer chips
  $$('#chips .map-chip', view).forEach((b) => b.onclick = () => {
    if (b.dataset.sort) { sortWorst = !sortWorst; b.classList.toggle('on', sortWorst); drawRail(); return; }
    const layer = { haze, dots, fire }[b.dataset.layer];
    const on = m.hasLayer(layer); on ? m.removeLayer(layer) : layer.addTo(m); b.classList.toggle('on', !on);
  });
  $('#legendBtn', view).onclick = () => $('#legend', view).classList.toggle('open');
  $('#refresh', view).onclick = () => load();

  // Locate me → nearest monitor
  $('#locate', view).onclick = () => {
    const btn = $('#locate', view);
    if (!navigator.geolocation) return toast('Location isn’t available on this device');
    btn.classList.add('spin');
    navigator.geolocation.getCurrentPosition((p) => {
      btn.classList.remove('spin');
      me = { lat: p.coords.latitude, lng: p.coords.longitude };
      meMarker?.remove();
      meMarker = L.marker([me.lat, me.lng], { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18] }), zIndexOffset: 1000 }).addTo(m);
      drawRail();
      const near = ordered()[0];
      if (near && distKm(me, near) < 80) select(near, true); else { m.flyTo([me.lat, me.lng], 10); toast('No monitor nearby. Lungitude+ covers Southern California'); }
    }, () => { btn.classList.remove('spin'); toast('Location permission was denied'); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  // Search: station names first, then OpenStreetMap place search inside SoCal
  const inp = $('#ms', view), sug = $('#sug', view), clr = $('#msClear', view);
  let deb;
  inp.oninput = () => {
    clr.hidden = !inp.value; clearTimeout(deb);
    const q = inp.value.trim().toLowerCase();
    if (!q) { sug.hidden = true; return; }
    const local = stations.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 4);
    showSug(local, []);
    if (q.length >= 3) deb = setTimeout(async () => {
      try {
        const b = CONFIG.BBOX;
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=4&countrycodes=us&bounded=1&viewbox=${b.minLng},${b.maxLat},${b.maxLng},${b.minLat}&q=${encodeURIComponent(inp.value)}`;
        const places = await (await fetch(url, { headers: { 'Accept-Language': 'en' } })).json();
        if (inp.value.trim().toLowerCase() === q) showSug(local, places);
      } catch { /* offline: local results only */ }
    }, 350);
  };
  const showSug = (local, places) => {
    if (!local.length && !places.length) { sug.innerHTML = '<button disabled>No matches in Southern California</button>'; sug.hidden = false; return; }
    sug.innerHTML = local.map((s) => `<button data-s="${stations.indexOf(s)}"><span>${esc(s.name)}</span><small>AQI ${s.aqi}</small></button>`).join('')
      + places.map((p) => `<button data-lat="${p.lat}" data-lng="${p.lon}"><span>${esc(p.display_name.split(',').slice(0, 2).join(','))}</span><small>Place</small></button>`).join('');
    sug.hidden = false;
    $$('button', sug).forEach((b) => b.onclick = () => {
      sug.hidden = true; inp.blur();
      if (b.dataset.s) return select(stations[+b.dataset.s], true);
      me = null; m.flyTo([+b.dataset.lat, +b.dataset.lng], 11);
      setTimeout(() => { const c = m.getCenter(); const near = [...stations].sort((a, z) => distKm(c, a) - distKm(c, z))[0]; drawRail(); if (near) select(near, false); }, 700);
    });
  };
  clr.onclick = () => { inp.value = ''; clr.hidden = true; sug.hidden = true; };
  $('#msForm', view).onsubmit = (e) => { e.preventDefault(); $('button[data-s], button[data-lat]', sug)?.click(); };
  m.on('moveend', () => { if (!me && !sortWorst && !selected) drawRail(); });

  setTimeout(() => m.invalidateSize(), 150);
  return () => m.remove();
}