// Vercel serverless function: GET /api/air → current PM2.5 monitors across Southern California (EPA AirNow)
// Env var: AIRNOW_API_KEY (free at https://docs.airnowapi.org/). Cached at the edge for 20 minutes.

const BBOX = '-120.6,32.5,-114.9,35.3'; // minLng,minLat,maxLng,maxLat

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const key = process.env.AIRNOW_API_KEY;
  if (!key) return res.status(503).json({ error: 'AIRNOW_API_KEY not set' });

  // AirNow publishes hourly with ~1 h lag; try the last few hours until data appears.
  const pad = (n) => String(n).padStart(2, '0');
  for (let back = 1; back <= 3; back++) {
    const t = new Date(Date.now() - back * 3600e3);
    const hour = `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}`;
    const url = `https://www.airnowapi.org/aq/data/?startDate=${hour}&endDate=${hour}&parameters=PM25&BBOX=${BBOX}`
      + `&dataType=B&format=application/json&verbose=1&monitorType=2&includerawconcentrations=0&API_KEY=${key}`;
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const rows = await r.json();
      const stations = (Array.isArray(rows) ? rows : [])
        .filter((s) => s.Parameter === 'PM2.5' && s.Value >= 0)
        .map((s) => ({
          name: s.SiteName, lat: s.Latitude, lng: s.Longitude,
          pm25: Math.round(s.Value * 10) / 10, aqi: s.AQI >= 0 ? s.AQI : null,
          agency: s.AgencyName, updated: `${s.UTC}:00Z`,
        }));
      if (stations.length) {
        res.setHeader('Cache-Control', 's-maxage=1200, stale-while-revalidate=3600');
        return res.status(200).json({ source: 'EPA AirNow', hour, stations });
      }
    } catch { /* try previous hour */ }
  }
  return res.status(502).json({ error: 'No AirNow data available' });
}
