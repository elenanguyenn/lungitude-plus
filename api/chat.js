// Vercel serverless function: POST /api/chat  → Google Gemini
// Keeps GEMINI_API_KEY on the server (never ship it inside the iOS app or website JS).
// Env vars: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default gemini-2.5-flash)

const SYSTEM = `You are LCAI, the friendly digital health companion inside Lungitude+, an app about wildfire smoke, PM2.5, lung cancer prevention and firefighter respiratory health in Southern California.
Rules:
- Be warm, encouraging and clear. Default to under 120 words; use short bullet points when listing steps.
- Match the user's reading level and language (answer in the language they write in).
- Be factual and cautious. Base guidance on EPA/AirNow, CDC, IARC, NIOSH and NFPA. Use the EPA 2024 PM2.5 AQI: Good 0-9.0, Moderate 9.1-35.4, Unhealthy for Sensitive Groups 35.5-55.4, Unhealthy 55.5-125.4, Very Unhealthy 125.5-225.4, Hazardous 225.5+ µg/m³.
- Never diagnose or prescribe. For trouble breathing, chest pain or other emergencies, tell them to call 911. Suggest seeing a doctor for persistent symptoms.
- If asked about something unrelated to air quality or lung/respiratory health, briefly help if harmless, then guide back to your topic.
- You can mention the app: Map tab (live PM2.5), Home tab learning modules that earn coins and XP, and the Shop where coins buy LCAI accessories.`;

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // tighten to your domain + capacitor://localhost for production
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY not set' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!messages.length) return res.status(400).json({ error: 'messages required' });

  const contents = messages
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text.slice(0, 2000) }] }));
  while (contents.length && contents[0].role !== 'user') contents.shift();

  let system = SYSTEM;
  const c = body.context;
  if (c && typeof c === 'object') {
    system += `\nContext: the user last viewed ${String(c.name).slice(0, 60)} on the map: AQI ${Number(c.aqi)} (${String(c.category).slice(0, 40)}), PM2.5 ${Number(c.pm25)} µg/m³${c.live ? '' : ' (sample data, not live)'}.`;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data?.error?.message || 'Gemini error' });
    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
    return res.status(200).json({ reply: reply || 'Sorry, I couldn’t come up with an answer. Try rephrasing?' });
  } catch (e) {
    return res.status(502).json({ error: 'Upstream request failed' });
  }
}
