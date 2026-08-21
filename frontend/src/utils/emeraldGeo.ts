import { resolveFlagCode } from '../components/Flag';

export type GeoCoordinate = [number, number];

// The map is deliberately kept in the frontend: node regions are metadata and
// do not require a new database table or an IP geolocation lookup.
export const EMERALD_COORDINATES: Record<string, GeoCoordinate> = {
  CN: [35.8617, 104.1954], HK: [22.3193, 114.1694], MO: [22.1987, 113.5439], TW: [23.6978, 120.9605],
  JP: [36.2048, 138.2529], KR: [35.9078, 127.7669], SG: [1.3521, 103.8198], MY: [4.2105, 101.9758],
  TH: [15.87, 100.9925], VN: [14.0583, 108.2772], PH: [12.8797, 121.774], ID: [-0.7893, 113.9213],
  IN: [20.5937, 78.9629], BD: [23.685, 90.3563], PK: [30.3753, 69.3451], KZ: [48.0196, 66.9237],
  UZ: [41.3775, 64.5853], TR: [38.9637, 35.2433], AE: [23.4241, 53.8478], SA: [23.8859, 45.0792],
  IL: [31.0461, 34.8516], IR: [32.4279, 53.688], GB: [55.3781, -3.436], FR: [46.2276, 2.2137],
  DE: [51.1657, 10.4515], NL: [52.1326, 5.2913], BE: [50.5039, 4.4699], CH: [46.8182, 8.2275],
  AT: [47.5162, 14.5501], IE: [53.4129, -8.2439], IT: [41.8719, 12.5674], ES: [40.4637, -3.7492],
  PT: [39.3999, -8.2245], GR: [39.0742, 21.8243], SE: [60.1282, 18.6435], NO: [60.472, 8.4689],
  DK: [56.2639, 9.5018], FI: [61.9241, 25.7482], IS: [64.9631, -19.0208], RU: [61.524, 105.3188],
  UA: [48.3794, 31.1656], BY: [53.7098, 27.9534], PL: [51.9194, 19.1451], CZ: [49.8175, 15.473],
  SK: [48.669, 19.699], HU: [47.1625, 19.5033], RO: [45.9432, 24.9668], BG: [42.7339, 25.4858],
  US: [37.0902, -95.7129], CA: [56.1304, -106.3468], MX: [23.6345, -102.5528], CU: [21.5218, -77.7812],
  CR: [9.7489, -83.7534], PA: [8.538, -80.7821], BR: [-14.235, -51.9253], AR: [-38.4161, -63.6167],
  CL: [-35.6751, -71.543], CO: [4.5709, -74.2973], PE: [-9.19, -75.0152], VE: [6.4238, -66.5897],
  EG: [26.8206, 30.8025], MA: [31.7917, -7.0926], DZ: [28.0339, 1.6596], NG: [9.082, 8.6753],
  GH: [7.9465, -1.0232], KE: [-0.0236, 37.9062], ET: [9.145, 40.4897], ZA: [-30.5595, 22.9375],
  AU: [-25.2744, 133.7751], NZ: [-40.9006, 174.886], FJ: [-17.7134, 178.065],
};

export function getEmeraldCountryCode(region?: string | null): string | null {
  const code = resolveFlagCode(region || '').toUpperCase();
  return /^[A-Z]{2}$/.test(code) && EMERALD_COORDINATES[code] ? code : null;
}

export function getEmeraldCoordinate(code: string): GeoCoordinate | null {
  return EMERALD_COORDINATES[code] || null;
}

export function getEmeraldCountryName(code: string): string {
  try {
    if (typeof Intl.DisplayNames === 'function') {
      return new Intl.DisplayNames(['zh-Hans'], { type: 'region' }).of(code) || code;
    }
  } catch {
    // Fall through to the ISO code when DisplayNames is unavailable.
  }
  return code;
}
