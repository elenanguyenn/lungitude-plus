// Learning content. Facts are written to match EPA/AirNow, CDC, IARC and NIOSH/NFPA guidance.
// Keep claims cautious: these screens are educational, not medical advice.

export const LESSON = [
  {
    title: '1. The invisible enemy: wildfire smoke',
    body: [
      'Wildfire smoke is a mix of gases and fine particles from burning vegetation, buildings and other materials. Its biggest public-health threat is <strong>PM2.5</strong>: particles 2.5 micrometers or smaller, roughly <strong>30 times thinner than a human hair</strong>.',
      'PM2.5 is small enough to slip past the nose and throat and travel deep into the lungs, and some of it can reach the bloodstream. When fires burn homes and cars, the smoke can also carry metals, plastics and other toxic chemicals.',
    ],
    check: {
      q: 'Which particles travel deepest into the lungs?',
      choices: ['PM10 (coarse dust)', 'PM2.5 (fine particles)', 'Pollen grains'],
      answer: 1,
      right: 'Correct! PM2.5 is fine enough to reach the alveoli, the tiny air sacs where oxygen enters the blood.',
      wrong: 'Not quite: the answer is PM2.5. Larger particles like PM10 and pollen are mostly trapped in the nose and upper airways.',
    },
  },
  {
    title: '2. How smoke damages lung cells',
    body: [
      'Inhaled particles trigger inflammation and <strong>oxidative stress</strong>, an overload of reactive molecules (free radicals) that can damage cell membranes, proteins and <strong>DNA</strong>. Over years, DNA damage that isn\'t repaired can cause mutations, one pathway toward cancer.',
      'Smoke contains known carcinogens such as benzene, formaldehyde and <strong>polycyclic aromatic hydrocarbons (PAHs)</strong>. The International Agency for Research on Cancer (IARC) classifies outdoor air pollution and particulate matter as carcinogenic to humans (Group 1), and in 2022 placed occupational exposure as a firefighter in Group 1 too.',
    ],
    check: {
      q: 'What is the term for cell damage caused by an overload of free radicals from toxins?',
      choices: ['Cellular hypertrophy', 'Oxidative stress', 'Mitotic overload'],
      answer: 1,
      right: 'Correct! Oxidative stress overwhelms the lungs\' antioxidant defenses and can damage DNA.',
      wrong: 'Not quite: the answer is oxidative stress. Hypertrophy means cells growing larger, and "mitotic overload" isn\'t a real term.',
    },
  },
  {
    title: '3. Who is most at risk',
    body: [
      'Children, older adults, pregnant people, people with asthma, COPD or heart disease, and outdoor workers, <strong>including firefighters</strong>, face the highest risk from smoke.',
      'Exposure isn\'t shared equally. Inland valleys where mountains and temperature inversions trap smoke, homes without air filtration, and jobs that can\'t move indoors all raise exposure, which makes wildfire smoke a <strong>health equity</strong> issue.',
    ],
    check: {
      q: 'The sky looks clear today. Is the air safe?',
      choices: ['Yes, smoke is always visible', 'Not necessarily: check the AQI', 'Only if it isn\'t windy'],
      answer: 1,
      right: 'Exactly. PM2.5 can be high even when the sky looks clear, so check the AQI on the map.',
      wrong: 'PM2.5 can be unhealthy even without visible haze. The AQI is the reliable check.',
    },
  },
  {
    title: '4. Protection and prevention',
    body: [
      'Check the AQI before heading out. On smoky days, stay indoors with windows closed and run a <strong>HEPA air purifier</strong> or a MERV-13 filter. Outdoors, a well-fitted <strong>N95 respirator</strong> filters fine particles; cloth and surgical masks do little.',
      'Firefighters should follow their department\'s respiratory protection program: <strong>SCBA</strong> during structure-fire suppression <em>and</em> overhaul, on-scene decon, showering soon after exposure, and regular medical screenings that include lung-function tests.',
    ],
  },
];

export const QUIZ = [
  { q: 'Under the EPA\'s 2024 Air Quality Index, a 24-hour PM2.5 level above which value is "Unhealthy" for everyone?',
    choices: ['9.0 µg/m³', '35.4 µg/m³', '55.4 µg/m³'], answer: 2,
    fact: '0–9.0 is Good, 9.1–35.4 Moderate, 35.5–55.4 Unhealthy for Sensitive Groups, and above 55.4 Unhealthy for everyone.' },
  { q: 'About how much thinner is a PM2.5 particle than a human hair?',
    choices: ['3×', '10×', '30×'], answer: 2,
    fact: 'The EPA describes PM2.5 as about 30 times smaller than the diameter of a human hair.' },
  { q: 'What does SCBA stand for?',
    choices: ['Self-Contained Breathing Apparatus', 'Standard Chemical Barrier Agent', 'Smoke Control Breathing Aid'], answer: 0,
    fact: 'An SCBA supplies clean air from a tank, so it protects against both particles and toxic gases, unlike filter masks.' },
  { q: 'Where in the lungs can PM2.5 particles lodge?',
    choices: ['Trachea (windpipe)', 'Bronchi (large airways)', 'Alveoli (air sacs)'], answer: 2,
    fact: 'Alveoli are where oxygen enters the blood. Particles that reach them cause inflammation right at the gas-exchange surface.' },
  { q: 'Which group of chemicals in smoke can bind to DNA and cause mutations?',
    choices: ['Carbon dioxide', 'Polycyclic aromatic hydrocarbons (PAHs)', 'Water vapor'], answer: 1,
    fact: 'PAHs form when materials burn incompletely. Several are known or probable human carcinogens.' },
  { q: 'Which mask actually filters wildfire smoke particles when fitted well?',
    choices: ['Cloth mask', 'Surgical mask', 'N95 respirator'], answer: 2,
    fact: 'A sealed N95 filters at least 95% of airborne particles, but it does not filter gases like carbon monoxide.' },
  { q: 'Which phase of a structure fire is a hidden exposure risk because crews often remove their SCBA?',
    choices: ['Pre-fire staging', 'Overhaul / cleanup', 'Driving to the scene'], answer: 1,
    fact: 'Smoldering debris keeps releasing particles and gases during overhaul, so respiratory protection matters even after flames are out.' },
  { q: 'Why does the Inland Empire often have some of the worst air in the U.S.?',
    choices: ['Ocean humidity traps smoke', 'Basin geography and inversions trap pollution from freeways, freight and fires', 'It has the most wildfires in the state'], answer: 1,
    fact: 'Mountains ring the basin and warm air layers act like a lid, holding smog and smoke near the ground.' },
];

export const TIPS = [
  { ico: '📱', who: 'Everyone', title: 'Check before you go', text: 'Look at the AQI on the Lungitude+ map before outdoor plans. Smoke can be unhealthy even when the sky looks clear.' },
  { ico: '🏠', who: 'Everyone', title: 'Make a clean-air room', text: 'Close windows and doors and run a HEPA air purifier, or build a box-fan filter with a MERV-13 furnace filter.' },
  { ico: '😷', who: 'Everyone', title: 'N95, not cloth', text: 'A well-fitted N95 filters fine particles. Cloth and surgical masks don\'t seal, so smoke leaks around them.' },
  { ico: '🏃', who: 'Everyone', title: 'Take it easy outside', text: 'Heavy exercise makes you breathe deeper and faster, pulling in more PM2.5. Move workouts indoors on smoky days.' },
  { ico: '🚗', who: 'Everyone', title: 'Recirculate in the car', text: 'Set the A/C to recirculate so it isn\'t pulling in outside smoke.' },
  { ico: '👶', who: 'Everyone', title: 'Protect sensitive people', text: 'Children, older adults, pregnant people and anyone with asthma, COPD or heart disease should take extra care.' },
  { ico: '🧑‍🚒', who: 'Firefighters', title: 'Mask up through overhaul', text: 'Keep SCBA on during suppression and overhaul. Smoldering debris keeps releasing particles and toxic gases.' },
  { ico: '🚿', who: 'Firefighters', title: 'Decon fast', text: 'Gross decon on scene, wipe exposed skin, and shower as soon as possible after a fire.' },
  { ico: '🧺', who: 'Firefighters', title: 'Keep dirty gear contained', text: 'Bag contaminated turnouts, keep them out of the cab and living quarters, and clean them per your department policy.' },
  { ico: '🩺', who: 'Firefighters', title: 'Get screened', text: 'Annual medical evaluations with lung-function testing (spirometry) can catch changes before symptoms appear.' },
];

// Offline fallback for LCAI when the Gemini proxy is unreachable or not configured.
export const LOCAL_KB = [
  { keys: ['hello', 'hi', 'hey', 'help', 'what can you'], r: 'Hi, I\'m **LCAI**! Ask me about PM2.5, the AQI, wildfire smoke, masks and air purifiers, lung cancer risk, or how firefighters protect their lungs.' },
  { keys: ['pm2.5', 'pm 2.5', 'particulate', 'particle'], r: '**PM2.5** are particles 2.5 micrometers or smaller, about 30× thinner than a hair. They reach deep into the lungs, cause inflammation and oxidative stress, and can carry toxic chemicals from whatever burned.' },
  { keys: ['aqi', 'air quality index', 'safe to'], r: 'The EPA\'s PM2.5 AQI (2024 update):\n- **0–50 Good** (0–9.0 µg/m³)\n- **51–100 Moderate** (9.1–35.4)\n- **101–150 Unhealthy for Sensitive Groups** (35.5–55.4)\n- **151–200 Unhealthy** (55.5–125.4)\n- **201–300 Very Unhealthy**\n- **301+ Hazardous**\nCheck the Map tab for your area.' },
  { keys: ['n95', 'mask', 'respirator', 'kn95'], r: 'A **well-fitted N95** filters at least 95% of fine particles. It must seal (no gaps, no beard under the seal) and it does **not** filter gases. Cloth and surgical masks offer little protection from smoke.' },
  { keys: ['scba', 'breathing apparatus'], r: '**SCBA** (Self-Contained Breathing Apparatus) supplies clean air from a tank, so it protects against both particles and toxic gases. Structural firefighters should keep it on through overhaul, when smoldering debris is still releasing toxins.' },
  { keys: ['purifier', 'hepa', 'filter', 'indoor', 'inside'], r: 'Indoors: close windows, run a **HEPA air purifier** sized for the room (or a box fan with a MERV-13 filter taped on), set HVAC to recirculate, and avoid frying food, candles or vacuuming without a HEPA filter on smoky days.' },
  { keys: ['symptom', 'cough', 'wheez', 'chest', 'breath'], r: 'Smoke can cause coughing, scratchy throat, irritated eyes, wheezing and shortness of breath. **Call 911** for severe trouble breathing or chest pain. For lingering symptoms, see a doctor. I can\'t diagnose, but I can help you prepare questions.' },
  { keys: ['cancer', 'carcinogen', 'tumor'], r: 'IARC classifies **outdoor air pollution and particulate matter** as carcinogenic to humans (Group 1), and in 2022 classified **occupational exposure as a firefighter** as Group 1. Risk builds with long-term, repeated exposure, so reducing exposure over time matters most.' },
  { keys: ['firefighter', 'overhaul', 'decon', 'turnout'], r: 'Key firefighter protections: SCBA through suppression **and** overhaul, on-scene gross decon, showering soon after exposure, keeping dirty gear out of the cab and living quarters, and annual medical exams with spirometry.' },
  { keys: ['inland', 'socal', 'california', 'fontana', 'riverside', 'san bernardino'], r: 'Inland Southern California often has worse air because the basin is ringed by mountains and temperature inversions act like a lid, trapping freeway, freight and wildfire pollution near the ground. Check the **Map** tab for live readings.' },
  { keys: ['coin', 'shop', 'xp', 'streak', 'accessor'], r: 'Finish modules on the **Home** tab to earn coins and XP. The first completion each day pays the full reward, and spending coins in the **Shop** dresses me up! 🎩' },
];
export const LOCAL_FALLBACK = 'I\'m in offline mode right now, so I can only answer common questions about PM2.5, the AQI, masks, air purifiers, symptoms, cancer risk and firefighter protection. Try asking about one of those!';
