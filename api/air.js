// Vercel serverless function: GET /api/air?lat=...&lng=... → nearby EPA AirNow monitors.
// Env var: AIRNOW_API_KEY (free at https://docs.airnowapi.org/). Cached at the edge for 20 minutes.

const US_BOUNDS = { minLat: 17, maxLat: 72, minLng: -180, maxLng: -64 };
const SEARCH_RADII = [2.5, 5];

function getCenter(query = {}) {
  const lat = Number(query.lat ?? 34.05);
  const lng = Number(query.lng ?? -117.75);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)
    || lat < US_BOUNDS.minLat || lat > US_BOUNDS.maxLat
    || lng < US_BOUNDS.minLng || lng > US_BOUNDS.maxLng) return null;
  return { lat, lng };
}

function getBbox(center, radius) {
  const minLng = Math.max(US_BOUNDS.minLng, center.lng - radius);
  const minLat = Math.max(US_BOUNDS.minLat, center.lat - radius);
  const maxLng = Math.min(US_BOUNDS.maxLng, center.lng + radius);
  const maxLat = Math.min(US_BOUNDS.maxLat, center.lat + radius);
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const term = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(term));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const center = getCenter(req.query);
  if (!center) return res.status(400).json({ error: 'A valid U.S. latitude and longitude are required' });
  const key = process.env.AIRNOW_API_KEY;
  if (!key) return res.status(503).json({ error: 'AIRNOW_API_KEY not set' });

  // AirNow publishes hourly with ~1 h lag; try recent hours and widen the area if needed.
  const pad = (n) => String(n).padStart(2, '0');
  for (let back = 1; back <= 3; back++) {
    const t = new Date(Date.now() - back * 3600e3);
    const hour = `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}`;
    for (const radius of SEARCH_RADII) {
      const params = new URLSearchParams({
        startDate: hour,
        endDate: hour,
        parameters: 'PM25',
        BBOX: getBbox(center, radius),
        dataType: 'B',
        format: 'application/json',
        verbose: '1',
        monitorType: '2',
        includerawconcentrations: '0',
        API_KEY: key,
      });
      try {
        const r = await fetch(`https://www.airnowapi.org/aq/data/?${params}`);
        if (!r.ok) continue;
        const rows = await r.json();
        const stations = (Array.isArray(rows) ? rows : [])
          .filter((s) => s.Parameter === 'PM2.5' && s.Value !== null && s.Value !== undefined
            && s.Latitude !== null && s.Latitude !== undefined && s.Longitude !== null && s.Longitude !== undefined
            && Number.isFinite(Number(s.Value)) && Number(s.Value) >= 0
            && Number.isFinite(Number(s.Latitude)) && Number.isFinite(Number(s.Longitude)))
          .map((s) => ({
            name: s.SiteName, lat: Number(s.Latitude), lng: Number(s.Longitude),
            pm25: Math.round(Number(s.Value) * 10) / 10,
            aqi: s.AQI !== null && s.AQI !== undefined && Number(s.AQI) >= 0 ? Number(s.AQI) : null,
            agency: s.AgencyName, updated: `${s.UTC}:00Z`,
          }))
          .sort((a, b) => distanceKm(center, a) - distanceKm(center, b))
          .slice(0, 50);
        if (stations.length) {
          res.setHeader('Cache-Control', 's-maxage=1200, stale-while-revalidate=3600');
          return res.status(200).json({ source: 'EPA AirNow', hour, stations });
        }
      } catch {
        // Try a wider area or the previous hour.
      }
    }
  }
  return res.status(502).json({ error: 'No AirNow data available near this location' });
}
