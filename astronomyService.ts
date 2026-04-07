
/**
 * Lightweight Astronomy Module for Tithi and Nakshatra calculation.
 * Optimized for browser use with simplified astronomical formulas.
 */

export interface PanchangaResult {
  date: string;
  bs_date: string;
  tithi: string;
  tithi_np: string;
  paksha: string;
  paksha_np: string;
  nakshatra: string;
  nakshatra_np: string;
}

const TITHI_NAMES_EN = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const TITHI_NAMES_NP = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "औंसी"
];

const NAKSHATRA_NAMES_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_NAMES_NP = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा",
  "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा",
  "ज्येष्ठा", "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
];

/**
 * Converts a Date object to Julian Day Number (JDN).
 */
export function getJulianDate(date: Date): number {
  const time = date.getTime();
  return (time / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
}

/**
 * Normalizes degrees to [0, 360).
 */
function normalizeDegrees(deg: number): number {
  let out = deg % 360;
  if (out < 0) out += 360;
  return out;
}

/**
 * Simplified Sun Ecliptic Longitude.
 * Accuracy: ~0.01 degree.
 */
export function getSunLongitude(jd: number): number {
  const n = jd - 2451545.0; // Days since J2000.0
  const L = normalizeDegrees(280.460 + 0.9856474 * n);
  const g = normalizeDegrees(357.528 + 0.9856003 * n);
  const lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
  return normalizeDegrees(lambda);
}

/**
 * Simplified Moon Ecliptic Longitude.
 * Accuracy: ~0.3 degree.
 */
export function getMoonLongitude(jd: number): number {
  const n = jd - 2451545.0;
  const L = normalizeDegrees(218.316 + 13.176396 * n);
  const M = normalizeDegrees(134.963 + 13.064993 * n);
  const lambda = L + 6.289 * Math.sin(M * Math.PI / 180);
  return normalizeDegrees(lambda);
}

/**
 * Calculates Tithi index (0-29).
 */
export function calculateTithiIndex(date: Date): number {
  const jd = getJulianDate(date);
  const sunLong = getSunLongitude(jd);
  const moonLong = getMoonLongitude(jd);
  
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  
  return Math.floor(diff / 12) % 30;
}

/**
 * Calculates Nakshatra index (0-26).
 */
export function calculateNakshatraIndex(date: Date): number {
  const jd = getJulianDate(date);
  const moonLong = getMoonLongitude(jd);
  return Math.floor(moonLong / 13.3333333333) % 27;
}

/**
 * Main function to get full Panchanga details.
 */
export function getPanchanga(date: Date, bsDateStr: string): PanchangaResult {
  // Use sunrise Nepal time (approx 6:00 AM) as default if not specified
  const calcDate = new Date(date);
  if (calcDate.getHours() === 0 && calcDate.getMinutes() === 0) {
    calcDate.setHours(6, 0, 0, 0);
  }

  const tithiIdx = calculateTithiIndex(calcDate);
  const nakshatraIdx = calculateNakshatraIndex(calcDate);
  
  const paksha = tithiIdx < 15 ? "Shukla" : "Krishna";
  const pakshaNp = tithiIdx < 15 ? "शुक्ल" : "कृष्ण";

  return {
    date: date.toISOString().split('T')[0],
    bs_date: bsDateStr,
    tithi: TITHI_NAMES_EN[tithiIdx],
    tithi_np: TITHI_NAMES_NP[tithiIdx],
    paksha: paksha,
    paksha_np: pakshaNp,
    nakshatra: NAKSHATRA_NAMES_EN[nakshatraIdx],
    nakshatra_np: NAKSHATRA_NAMES_NP[nakshatraIdx]
  };
}
