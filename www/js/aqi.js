// PM2.5 → AQI using the U.S. EPA breakpoints in effect since May 2024
// (Good is now 0–9.0 µg/m³). Source: EPA PM NAAQS AQI fact sheet, Feb 2024.

const BP = [
  { lo: 0.0,   hi: 9.0,   aLo: 0,   aHi: 50 },
  { lo: 9.1,   hi: 35.4,  aLo: 51,  aHi: 100 },
  { lo: 35.5,  hi: 55.4,  aLo: 101, aHi: 150 },
  { lo: 55.5,  hi: 125.4, aLo: 151, aHi: 200 },
  { lo: 125.5, hi: 225.4, aLo: 201, aHi: 300 },
  { lo: 225.5, hi: 325.4, aLo: 301, aHi: 500 },
];

export const CATEGORIES = [
  { key: 'good', name: 'Good', short: 'Good', color: '#00e400', ink: '#0b3d0b', max: 50,
    pub: 'Air quality is satisfactory. Enjoy outdoor activities.',
    ff: 'Normal operations. Keep up routine decon and gear cleaning.' },
  { key: 'moderate', name: 'Moderate', short: 'Moderate', color: '#ffff00', ink: '#3d3a00', max: 100,
    pub: 'Unusually sensitive people should consider shorter, lighter outdoor activity.',
    ff: 'Watch for symptoms in crew members with asthma or heart/lung conditions.' },
  { key: 'usg', name: 'Unhealthy for Sensitive Groups', short: 'Sensitive', color: '#ff7e00', ink: '#fff', max: 150,
    pub: 'People with heart or lung disease, older adults, children, teens, pregnant people and outdoor workers should reduce long or heavy outdoor exertion.',
    ff: 'Limit time and exertion outside of required operations; take rest breaks in filtered air.' },
  { key: 'unhealthy', name: 'Unhealthy', short: 'Unhealthy', color: '#ff0000', ink: '#fff', max: 200,
    pub: 'Everyone should reduce long or heavy outdoor exertion. Sensitive groups should avoid it. A well-fitted N95 helps if you must be outside.',
    ff: 'Follow your department\'s respiratory protection program. Rotate crews and rehab in clean air.' },
  { key: 'very', name: 'Very Unhealthy', short: 'Very Unhealthy', color: '#8f3f97', ink: '#fff', max: 300,
    pub: 'Everyone should avoid long or heavy outdoor exertion. Stay indoors with windows closed and filtered air.',
    ff: 'Minimize non-essential outdoor work. Report coughing, chest tightness or shortness of breath.' },
  { key: 'hazardous', name: 'Hazardous', short: 'Hazardous', color: '#7e0023', ink: '#fff', max: 500,
    pub: 'Health warning of emergency conditions. Everyone should avoid all outdoor physical activity.',
    ff: 'Emergency conditions. Only essential operations, with full respiratory protection.' },
];

export function pmToAqi(pm) {
  if (pm == null || Number.isNaN(pm)) return null;
  const c = Math.floor(Math.max(0, pm) * 10) / 10; // EPA truncates to 0.1
  const b = BP.find((x) => c <= x.hi) || BP[BP.length - 1];
  if (c > b.hi) return 500;
  return Math.round(((b.aHi - b.aLo) / (b.hi - b.lo)) * (c - b.lo) + b.aLo);
}

export function category(aqi) {
  return CATEGORIES.find((c) => aqi <= c.max) || CATEGORIES[CATEGORIES.length - 1];
}
