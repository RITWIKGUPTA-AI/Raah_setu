import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  RiskZone,
  BridgeMarker,
} from '../types';
import { FleetVehicle } from '../types';
import { evaluateRoadCondition } from './roadConditions';

// Bounding box for North Eastern Region of India
export const NER_BOUNDS: [[number, number], [number, number]] = [
  [88.0, 21.8], // Southwest: [lng, lat] (Bay of Bengal / Tripura / West Bengal border)
  [97.4, 29.5], // Northeast: [lng, lat] (Arunachal / China / Myanmar border)
];

export const NER_CENTER: [number, number] = [92.8, 26.1]; // [lng, lat] centered in Assam
export const NER_DEFAULT_ZOOM = 6.2;

/**
 * Parses DMS or decimal string like "27°14'N, 88°31'E" into [lng, lat]
 */
export function parseLatLngString(latLngStr: string): [number, number] | null {
  if (!latLngStr) return null;
  try {
    const parts = latLngStr.split(',');
    if (parts.length !== 2) return null;

    const parsePart = (str: string): number | null => {
      const trimmed = str.trim();
      // Match degrees and minutes: e.g. 27°14'N or 27.23°N
      const dmsMatch = trimmed.match(/(\d+(?:\.\d+)?)[°\s]+(?:(\d+(?:\.\d+)?)[′']?)?\s*([NSEW])/i);
      if (dmsMatch) {
        const deg = parseFloat(dmsMatch[1]);
        const min = dmsMatch[2] ? parseFloat(dmsMatch[2]) : 0;
        const dir = dmsMatch[3].toUpperCase();
        let val = deg + min / 60;
        if (dir === 'S' || dir === 'W') val = -val;
        return val;
      }
      // Simple decimal
      const num = parseFloat(trimmed.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? null : num;
    };

    const lat = parsePart(parts[0]);
    const lng = parsePart(parts[1]);

    if (lat !== null && lng !== null) {
      return [lng, lat]; // GeoJSON standard is [longitude, latitude]
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Coordinate mapping fallback: converts normalized canvas [x, y] (800x500)
 * into approximate [lng, lat] within the NER bounding box.
 */
export function canvasCoordsToLngLat(x: number, y: number): [number, number] {
  // Canvas width = 800 (lng from ~88.4 to ~96.5)
  // Canvas height = 500 (lat from ~28.8 north to ~22.8 south)
  const lngMin = 88.3;
  const lngMax = 96.6;
  const latMin = 22.8;
  const latMax = 28.8;

  const lng = lngMin + (x / 800) * (lngMax - lngMin);
  const lat = latMax - (y / 500) * (latMax - latMin);

  return [Number(lng.toFixed(5)), Number(lat.toFixed(5))];
}

/**
 * Inverse mapping: converts [lng, lat] to canvas [x, y] coordinates
 */
export function lngLatToCanvasCoords(lng: number, lat: number): [number, number] {
  const lngMin = 88.3;
  const lngMax = 96.6;
  const latMin = 22.8;
  const latMax = 28.8;
  const x = Math.round(((lng - lngMin) / (lngMax - lngMin)) * 800);
  const y = Math.round(((latMax - lat) / (latMax - latMin)) * 500);
  return [Math.max(0, Math.min(800, x)), Math.max(0, Math.min(500, y))];
}

// Known highway corridors with real GIS geographic coordinates in NER
export const HIGHWAY_GEOJSON_COORDS: Record<string, [number, number][]> = {
  // NH-27 (East-West Corridor - Western Gateway & Lower Assam)
  'road-nh-27-western': [
    [88.430, 26.720], // Siliguri Gate
    [88.720, 26.540], // Jalpaiguri
    [89.520, 26.490], // Alipurduar Gate
    [90.560, 26.500], // Bongaigaon
    [90.850, 26.510], // Bijni
    [91.010, 26.480], // Barpeta Road
    [91.440, 26.450], // Nalbari
    [91.630, 26.470], // Rangia Junction
    [91.736, 26.144], // Guwahati Gate
  ],  // NH-27 (East-West Corridor)
  'road-nh-27': [
    [92.684, 26.347], // Nagaon
    [92.950, 26.050], // Doboka
    [93.170, 25.750], // Lumding
    [93.016, 25.183], // Haflong
  ],
  'road-nh-27-guwahati': [
    [91.736, 26.144], // Guwahati
    [92.050, 26.180], // Jagiroad
    [92.684, 26.347], // Nagaon
  ],
  'road-nh-27-silchar': [
    [93.016, 25.183], // Haflong
    [92.900, 25.000], // Harangajao
    [92.797, 24.833], // Silchar Junction
  ],

  // NH-37 (Assam Valley Corridor)
  'road-nh-37': [
    [92.800, 26.650], // Tezpur / Kaliabor
    [93.350, 26.580], // Kaziranga West
    [93.700, 26.600], // Kohora
    [93.950, 26.620], // Bokakhat
  ],
  'road-nh-37-guwahati': [
    [91.736, 26.144], // Guwahati Gate
    [92.350, 26.450], // Mangaldai / Kharupetia
    [92.800, 26.650], // Tezpur / Kaliabor
  ],
  'road-nh-37-dibrugarh': [
    [93.950, 26.620], // Bokakhat
    [94.216, 26.757], // Jorhat
    [94.630, 27.010], // Sivasagar
    [94.912, 27.472], // Dibrugarh
    [95.360, 27.500], // Tinsukia Junction
  ],

  // NH-29 (Dimapur–Kohima Corridor)
  'road-nh-29-dimapur': [
    [93.726, 25.906], // Dimapur Central
    [93.765, 25.840], // 4th Mile Junction
    [93.810, 25.760], // Chumoukedima Gate
  ],
  'road-nh-29-blocked': [
    [93.810, 25.760], // Chumoukedima Gate
    [93.850, 25.730], // Paglapahar Km 42 (Blocked Obstruction)
    [93.920, 25.715], // Phesama Approach
    [93.970, 25.705], // Medziphema Bypass
  ],
  'road-nh-29-kohima': [
    [93.970, 25.705], // Medziphema Bypass
    [94.020, 25.695], // Zubza
    [94.070, 25.685], // Jotsoma
    [94.108, 25.675], // Kohima Central
  ],

  // NH-10 (Siliguri–Gangtok Axis)
  'road-nh-10-sevoke': [
    [88.470, 26.880], // Sevoke Bridge
    [88.450, 27.020], // Coronation / Kalijhora
    [88.450, 27.090], // Melli Checkpost
    [88.480, 27.160], // Rangpo Gateway
  ],
  'road-nh-10-sikkim': [
    [88.480, 27.160], // Rangpo Gateway
    [88.516, 27.233], // Singtam / 20th Mile (Blocked)
    [88.550, 27.260], // Dikchu Junction
  ],
  'road-nh-10-gangtok': [
    [88.550, 27.260], // Dikchu Junction
    [88.580, 27.280], // Ranipool
    [88.613, 27.338], // Gangtok Central
  ],

  // NH-6 (Guwahati–Shillong Expressway & Silchar Link)
  'road-nh-6-jorabat': [
    [91.860, 26.110], // Jorabat
    [91.880, 25.900], // Nongpoh
    [91.885, 25.780], // Umsning Bypass
  ],
  'road-nh-6-shillong': [
    [91.885, 25.780], // Umsning Bypass
    [91.890, 25.660], // Umiam Bridge
    [91.893, 25.578], // Shillong
  ],
  'road-nh-6-jowai': [
    [91.893, 25.578], // Shillong
    [92.200, 25.450], // Jowai
    [92.450, 25.150], // Khliehriat
  ],

  // NH-102 (Imphal–Moreh Border Corridor)
  'road-nh-102-imphal': [
    [93.936, 24.817], // Imphal Central
    [94.010, 24.630], // Thoubal
    [93.980, 24.490], // Kakching Lamkhai
  ],
  'road-nh-102-restricted': [
    [93.980, 24.490], // Kakching Lamkhai
    [94.120, 24.360], // Pallel
    [94.220, 24.300], // Tengnoupal Hills
    [94.301, 24.249], // Moreh Border Station
  ],

  // NH-8 (Tripura Lifeline)
  'road-nh-8-tripura': [
    [92.350, 24.870], // Karimganj
    [92.160, 24.370], // Dharmanagar
    [92.010, 24.150], // Kumarghat
    [91.850, 23.920], // Ambassa
    [91.560, 23.850], // Teliamura
    [91.286, 23.831], // Agartala
  ],

  // NH-13 (Trans-Arunachal Highway)
  'road-nh-13-arunachal': [
    [93.605, 27.084], // Itanagar
    [93.420, 27.240], // Sagalee
    [93.830, 27.540], // Ziro Valley
  ],
  'road-nh-13-daporijo': [
    [93.830, 27.540], // Ziro Valley
    [94.220, 27.980], // Daporijo
    [94.500, 28.100], // Bame Junction
  ],
  'road-nh-13-pasighat': [
    [94.500, 28.100], // Bame Junction
    [94.770, 28.170], // Aalo / Along
    [95.330, 28.070], // Pasighat
  ],

  // --- NH-15 (Arunachal Foothills & Assam North Bank Trunk) ---
  'road-nh-15-west': [
    [91.720, 26.340], // Baihata Chariali
    [92.030, 26.430], // Mangaldai
    [92.480, 26.700], // Dhekiajuli
    [92.790, 26.650], // Tezpur / Kaliabor Link
  ],
  'road-nh-15-east': [
    [92.790, 26.650], // Tezpur
    [93.150, 26.730], // Biswanath Chariali
    [93.820, 27.100], // Banderdewa (Itanagar Gate)
    [94.100, 27.230], // North Lakhimpur
    [94.583, 27.483], // Dhemaji
    [94.730, 27.600], // Silapathar
    [95.210, 27.830], // Jonai (Arunachal Border)
  ],

  // --- NH-17 (Lower Assam & Brahmaputra South Bank) ---
  'road-nh-17-assam': [
    [91.736, 26.144], // Guwahati Gate
    [91.200, 26.050], // Boko
    [90.620, 26.170], // Goalpara
    [90.230, 26.120], // Bilasipara
    [89.980, 26.020], // Dhubri Port
    [89.850, 26.040], // Boxirhat (Bengal Border)
  ],

  // --- NH-2 (Nagaland Spine: Kohima to Mao Gate) ---
  'road-nh-2-nagaland': [
    [94.108, 25.675], // Kohima Central
    [94.140, 25.580], // Viswema / Dzukou Entry
    [94.120, 25.510], // Mao Gate (Border)
  ],

  // --- NH-2 (Manipur Northern Spine: Mao Gate to Imphal) ---
  'road-nh-2-manipur-north': [
    [94.120, 25.510], // Mao Gate
    [94.090, 25.430], // Maram
    [94.020, 25.270], // Senapati
    [93.970, 25.150], // Kangpokpi
    [93.936, 24.817], // Imphal Central
  ],

  // --- NH-2 (Manipur Southern Spine: Imphal to Churachandpur) ---
  'road-nh-2-manipur-south': [
    [93.936, 24.817], // Imphal Central
    [93.760, 24.630], // Bishnupur
    [93.680, 24.330], // Churachandpur
  ],

  // --- NH-37 (Western Manipur Lifeline: Silchar–Jiribam–Imphal) ---
  'road-nh-37-western-manipur': [
    [92.797, 24.833], // Silchar Junction
    [93.120, 24.800], // Jiribam (Manipur Entry)
    [93.380, 24.820], // Nungba
    [93.583, 24.833], // Noney (Railway Bridge / Valley)
    [93.750, 24.830], // Khongsang
    [93.936, 24.817], // Imphal Valley
  ],

  // --- NH-306 (The Mizoram Lifeline: Silchar to Aizawl) ---
  'road-nh-306-mizoram': [
    [92.797, 24.833], // Silchar Barak Valley Gate
    [92.760, 24.510], // Vairengte Checkpost (Mizoram Border)
    [92.710, 24.350], // Bilkhawthlir
    [92.680, 24.230], // Kolasib
    [92.700, 23.950], // Ratu / Selesih
    [92.720, 23.730], // Aizawl Capital
  ],

  // --- NH-2 / NH-54 (Central Mizoram Ridge: Aizawl to Lunglei) ---
  'road-nh-2-mizoram-south': [
    [92.720, 23.730], // Aizawl
    [92.810, 23.550], // Hmuifang Pass
    [92.850, 23.340], // Serchhip
    [92.800, 23.100], // Keitum
    [92.740, 22.890], // Lunglei
  ],

  // --- NH-502A (Kaladan Multi-Modal Corridor: Lunglei to Zorinpui Border) ---
  'road-nh-2-kaladan-corridor': [
    [92.740, 22.890], // Lunglei
    [92.890, 22.530], // Lawngtlai
    [92.980, 22.490], // Saiha
    [92.940, 22.250], // Tuipang
    [92.880, 22.020], // Zorinpui (Myanmar Border)
  ],

  // --- NH-8 (Southern Tripura: Agartala to Sabroom Maitri Setu) ---
  'road-nh-8-tripura-south': [
    [91.286, 23.831], // Agartala
    [91.350, 23.680], // Bishalgarh
    [91.490, 23.530], // Udaipur
    [91.470, 23.350], // Shantirbazar
    [91.450, 23.250], // Belonia
    [91.700, 23.000], // Sabroom (Maitri Setu / Port Link)
  ],

  // --- NH-208 (Tripura Eastern Ridge) ---
  'road-nh-208-tripura': [
    [92.010, 24.150], // Kumarghat
    [92.010, 24.320], // Kailashahar
    [91.800, 24.200], // Fatikroy
    [91.600, 24.060], // Khowai
    [91.560, 23.850], // Teliamura Junction
  ],

  // --- NH-217 (Meghalaya Garo Hills Spine: Paikan to Tura to Dalu) ---
  'road-nh-217-garo-hills': [
    [90.620, 26.020], // Paikan Junction
    [90.500, 25.850], // Bajengdoba
    [90.220, 25.510], // Tura Headquarters
    [90.250, 25.350], // Asanang
    [90.200, 25.210], // Dalu Border Post (Bangladesh)
  ],

  // --- NH-106 (Central Meghalaya: Shillong to Nongstoin) ---
  'road-nh-106-meghalaya': [
    [91.893, 25.578], // Shillong
    [91.640, 25.560], // Mairang
    [91.450, 25.540], // Markasa
    [91.270, 25.520], // Nongstoin
  ],

  // --- NH-206 (Shillong to Dawki Border) ---
  'road-nh-206-dawki': [
    [91.893, 25.578], // Shillong
    [91.950, 25.380], // Mylliem
    [92.000, 25.280], // Pynursla
    [92.020, 25.180], // Dawki / Tamabil Border Post
  ],

  // --- NH-61 (Nagaland: Amguri–Mokokchung–Wokha–Kohima) ---
  'road-nh-61-nagaland': [
    [94.550, 26.800], // Amguri (Assam Border)
    [94.520, 26.550], // Tuli
    [94.520, 26.330], // Mokokchung
    [94.260, 26.100], // Wokha
    [94.150, 25.850], // Tseminyu
    [94.108, 25.675], // Kohima
  ],

  // --- NH-202 (Nagaland Eastern Frontier Highway) ---
  'road-nh-202-nagaland': [
    [94.520, 26.330], // Mokokchung
    [94.830, 26.280], // Tuensang
    [94.780, 25.870], // Kiphire
    [94.630, 25.680], // Meluri
    [94.550, 25.630], // Jessami (Manipur Border)
  ],

  // --- NH-202 (Manipur: Jessami–Ukhrul–Imphal) ---
  'road-nh-202-manipur': [
    [94.550, 25.630], // Jessami Border
    [94.450, 25.350], // Chingai
    [94.360, 25.110], // Ukhrul
    [94.150, 24.950], // Litan
    [93.936, 24.817], // Imphal
  ],

  // --- NH-13 Western Arunachal (Balipara–Bomdila–Sela Pass–Tawang) ---
  'road-nh-13-tawang': [
    [92.790, 26.750], // Balipara
    [92.650, 27.010], // Bhalukpong
    [92.420, 27.260], // Bomdila
    [92.240, 27.360], // Dirang
    [92.100, 27.500], // Sela Pass / Sela Tunnel
    [91.860, 27.590], // Tawang
  ],

  // --- NH-515 (Upper Siang & Dibang Valley: Jonai–Pasighat–Roing–Tezu) ---
  'road-nh-515-pasighat-roing': [
    [95.210, 27.830], // Jonai
    [95.330, 28.070], // Pasighat
    [95.600, 28.100], // Mebo
    [95.833, 28.133], // Roing
    [96.170, 27.920], // Tezu (Lohit)
  ],

  // --- NH-715 (Dhola-Sadiya Bridge Corridor to Roing) ---
  'road-nh-715-dhola-sadiya': [
    [95.360, 27.500], // Tinsukia
    [95.450, 27.600], // Doomdooma
    [95.680, 27.800], // Dhola-Sadiya Bridge (Bhupen Hazarika Setu)
    [95.833, 28.133], // Roing
  ],

  // --- NH-315 (Ledo Stillwell Road: Makum to Pangsau Border) ---
  'road-nh-315-ledo': [
    [95.360, 27.500], // Makum Junction
    [95.620, 27.390], // Digboi Refinery
    [95.730, 27.290], // Margherita
    [95.850, 27.280], // Ledo
    [96.000, 27.250], // Lekhapani / Jagun (Pangsau Pass Border)
  ],

  // --- NH-310 (Sikkim Frontier: Gangtok to Nathu La Border) ---
  'road-nh-310-nathula': [
    [88.613, 27.338], // Gangtok Central
    [88.690, 27.350], // 3rd Mile
    [88.780, 27.370], // Sherathang
    [88.850, 27.390], // Nathu La Pass (Border)
  ],

  // --- NH-310A (North Sikkim Defense: Gangtok to Chungthang & Lachen) ---
  'road-nh-310a-north-sikkim': [
    [88.613, 27.338], // Gangtok
    [88.580, 27.420], // Phodong
    [88.530, 27.510], // Mangan
    [88.650, 27.600], // Chungthang
    [88.550, 27.730], // Lachen
  ],

  // --- NH-510 (West Sikkim: Singtam to Geyzing & Pelling) ---
  'road-nh-510-west-sikkim': [
    [88.516, 27.233], // Singtam
    [88.420, 27.250], // Ravangla
    [88.330, 27.260], // Legship
    [88.250, 27.280], // Geyzing
    [88.230, 27.300], // Pelling
  ],
};

// Known incident coordinates
export const INCIDENT_GEO_LOOKUP: Record<string, [number, number]> = {
  'inc-sikkim-01': [88.516, 27.233], // Pakyong / Singtam NH-10
  'inc-dhemaji-02': [94.583, 27.483], // Dhemaji NH-515
  'inc-manipur-03': [93.583, 24.833], // Noney NH-37
  'inc-arunachal-04': [95.833, 28.133], // Lower Dibang Valley
  'inc-01': [93.800, 25.816], // Paglapahar NH-29
  'inc-02': [91.883, 25.650], // Umiam Ri-Bhoi NH-6
  'inc-03': [93.016, 25.183], // Haflong Dima Hasao
  'inc-04': [93.650, 24.333], // Churachandpur Old Cachar Rd
  'inc-05': [92.783, 26.616], // Tezpur Ferry Slipway
  'inc-resolved-06': [91.583, 26.166], // Kamrup Rural
};

// Known vehicle coordinates
export const VEHICLE_GEO_LOOKUP: Record<string, [number, number]> = {
  'veh-01': [93.650, 24.333], // Churachandpur
  'NER-1023': [93.583, 24.833], // Noney NH-37
  'veh-02': [93.950, 26.100], // Golaghat/Wokha detour
  'NER-2045': [88.516, 27.233], // Singtam NH-10
  'veh-03': [92.150, 24.200], // Dharmanagar NH-8
  'NER-3180': [91.880, 25.750], // Umiam Bypass
  'veh-04': [93.100, 25.500], // Lumding Corridor
  'NER-4210': [93.800, 25.816], // Chumoukedima
  'veh-05': [94.500, 27.100], // NH-37 Eastbound
  'NER-5502': [93.605, 27.084], // Papum Pare
  'NER-6199': [94.583, 27.483], // Dhemaji
  'NER-7011': [93.016, 25.183], // Haflong
  'NER-8304': [91.286, 23.831], // Agartala
};

// Known bridge coordinates
export const BRIDGE_GEO_LOOKUP: Record<string, [number, number]> = {
  'bridge-bogibeel': [94.908, 27.402],
  'bridge-dhola': [95.660, 27.796],
  'bridge-kolia': [92.852, 26.613],
  'bridge-saraighat': [91.688, 26.175],
  'bridge-umiam': [91.905, 25.662],
  'bridge-sevoke': [88.473, 26.883],
  'bridge-barak': [92.802, 24.838],
  'bridge-irang': [93.588, 24.825],
};

// Known risk zones polygons in real GIS coordinates
export const RISK_ZONE_GEO_POLYGONS: Record<string, [number, number][]> = {
  'zone-01': [
    // Dima Hasao Landslide Corridor
    [92.85, 25.35],
    [93.25, 25.38],
    [93.35, 25.02],
    [92.95, 24.95],
    [92.85, 25.35],
  ],
  'zone-02': [
    // Brahmaputra Lowland Inundation Belt
    [92.40, 26.65],
    [93.10, 26.75],
    [93.70, 26.60],
    [93.30, 26.35],
    [92.55, 26.40],
    [92.40, 26.65],
  ],
  'zone-03': [
    // East Khasi Hills Cloudburst Watch
    [91.65, 25.65],
    [92.15, 25.65],
    [92.15, 25.25],
    [91.60, 25.30],
    [91.65, 25.65],
  ],
};

// State coordinates and bounding centers for zooming
export const STATE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  Assam: { center: [92.9, 26.2], zoom: 7.2 },
  'Arunachal Pradesh': { center: [94.5, 28.0], zoom: 6.8 },
  Manipur: { center: [93.9, 24.8], zoom: 8.0 },
  Meghalaya: { center: [91.4, 25.5], zoom: 7.8 },
  Mizoram: { center: [92.8, 23.3], zoom: 7.8 },
  Nagaland: { center: [94.2, 26.1], zoom: 8.0 },
  Sikkim: { center: [88.5, 27.5], zoom: 8.5 },
  Tripura: { center: [91.7, 23.8], zoom: 8.2 },
};

// District Center Coordinates for District Monitoring & Zooming
export const DISTRICT_CENTERS: Record<string, [number, number]> = {
  'Kamrup Metropolitan (Guwahati)': [91.736, 26.144],
  'Kamrup Metro': [91.736, 26.144],
  'Kamrup Rural': [91.583, 26.166],
  'Dima Hasao (Haflong)': [93.016, 25.183],
  'Dima Hasao': [93.016, 25.183],
  Dhemaji: [94.583, 27.483],
  Dibrugarh: [94.912, 27.472],
  Sonitpur: [92.783, 26.616],
  Cachar: [92.797, 24.833],
  'Ri-Bhoi': [91.880, 25.900],
  'East Khasi Hills (Shillong)': [91.893, 25.578],
  'East Khasi Hills': [91.893, 25.578],
  'East Sikkim (Gangtok)': [88.613, 27.338],
  'East Sikkim': [88.613, 27.338],
  'Pakyong / East Sikkim': [88.516, 27.233],
  'North Sikkim': [88.550, 27.700],
  Dimapur: [93.726, 25.906],
  'Dimapur / Chumoukedima': [93.750, 25.850],
  'Kohima District': [94.108, 25.675],
  Kohima: [94.108, 25.675],
  Longleng: [94.800, 26.470],
  Mokokchung: [94.520, 26.320],
  'Imphal West': [93.936, 24.817],
  'Imphal West (Imphal)': [93.936, 24.817],
  Churachandpur: [93.650, 24.333],
  Noney: [93.583, 24.833],
  Tengnoupal: [94.150, 24.380],
  'Papum Pare (Itanagar)': [93.605, 27.084],
  'Papum Pare': [93.605, 27.084],
  'Lower Dibang Valley': [95.833, 28.133],
  'East Siang': [95.330, 28.070],
  Tawang: [91.860, 27.580],
  'West Tripura (Agartala)': [91.286, 23.831],
  'West Tripura': [91.286, 23.831],
  'North Tripura': [92.160, 24.370],
  Gomati: [91.500, 23.530],
  'Aizawl District': [92.717, 23.730],
  Aizawl: [92.717, 23.730],
  Kolasib: [92.680, 24.230],
  Lunglei: [92.740, 22.890],
};

/**
 * Resolves an Incident's geographic coordinate [lng, lat]
 */
export function getIncidentLngLat(incident: IncidentMarker): [number, number] {
  if (INCIDENT_GEO_LOOKUP[incident.id]) {
    return INCIDENT_GEO_LOOKUP[incident.id];
  }
  const parsed = parseLatLngString(incident.latLng);
  if (parsed) return parsed;

  if (incident.district && DISTRICT_CENTERS[incident.district]) {
    return DISTRICT_CENTERS[incident.district];
  }

  if (incident.coordinates && incident.coordinates.length === 2) {
    return canvasCoordsToLngLat(incident.coordinates[0], incident.coordinates[1]);
  }

  return NER_CENTER;
}

/**
 * Resolves a Vehicle's geographic coordinate [lng, lat]
 */
export function getVehicleLngLat(vehicle: VehicleMarker | FleetVehicle): [number, number] {
  if (VEHICLE_GEO_LOOKUP[vehicle.id]) {
    return VEHICLE_GEO_LOOKUP[vehicle.id];
  }

  // Check if callsign matches
  if ('callsign' in vehicle && vehicle.callsign && VEHICLE_GEO_LOOKUP[vehicle.callsign]) {
    return VEHICLE_GEO_LOOKUP[vehicle.callsign];
  }

  if (vehicle.coordinates && vehicle.coordinates.length === 2) {
    return canvasCoordsToLngLat(vehicle.coordinates[0], vehicle.coordinates[1]);
  }

  return NER_CENTER;
}

/**
 * Resolves a Road's geographic LineString coordinates [[lng, lat], ...]
 */
export function getRoadCoordinates(road: RoadSegment): [number, number][] {
  if (HIGHWAY_GEOJSON_COORDS[road.id]) {
    return HIGHWAY_GEOJSON_COORDS[road.id];
  }

  // Fallback: transform canvas points
  if (road.points && road.points.length > 0) {
    return road.points.map(([x, y]) => canvasCoordsToLngLat(x, y));
  }

  return [];
}

/**
 * Resolves a Road's geographic midpoint [lng, lat] for highway badge placement
 */
export function getRoadMidpoint(road: RoadSegment): [number, number] | null {
  const coords = getRoadCoordinates(road);
  if (!coords || coords.length === 0) return null;
  const midIdx = Math.floor(coords.length / 2);
  return coords[midIdx];
}

/**
 * Resolves a Bridge's geographic coordinate [lng, lat]
 */
export function getBridgeLngLat(bridge: BridgeMarker): [number, number] {
  if (BRIDGE_GEO_LOOKUP[bridge.id]) {
    return BRIDGE_GEO_LOOKUP[bridge.id];
  }
  if (bridge.district && DISTRICT_CENTERS[bridge.district]) {
    return DISTRICT_CENTERS[bridge.district];
  }
  if (bridge.coordinates && bridge.coordinates.length === 2) {
    return canvasCoordsToLngLat(bridge.coordinates[0], bridge.coordinates[1]);
  }
  return NER_CENTER;
}

/**
 * Resolves a Risk Zone polygon coordinates [[[lng, lat], ...]]
 */
export function getRiskZoneCoordinates(zone: RiskZone): [number, number][] {
  if (RISK_ZONE_GEO_POLYGONS[zone.id]) {
    return RISK_ZONE_GEO_POLYGONS[zone.id];
  }
  if (zone.polygon && zone.polygon.length > 0) {
    const pts = zone.polygon.map(([x, y]) => canvasCoordsToLngLat(x, y));
    // Ensure closed ring
    if (pts.length > 2) {
      const first = pts[0];
      const last = pts[pts.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        pts.push([first[0], first[1]]);
      }
    }
    return pts;
  }
  return [];
}

/**
 * Generates GeoJSON FeatureCollection for Roads with dynamic condition attributes
 */
export function buildRoadsGeoJSON(roads: RoadSegment[]) {
  return {
    type: 'FeatureCollection' as const,
    features: roads.map((road) => {
      const evaluation = evaluateRoadCondition(road);

      return {
        type: 'Feature' as const,
        id: road.id,
        geometry: {
          type: 'LineString' as const,
          coordinates: getRoadCoordinates(road),
        },
        properties: {
          id: road.id,
          name: road.name,
          routeNumber: road.routeNumber,
          status: road.status,
          effectiveCondition: evaluation.condition, // 'clear' | 'warning' | 'blocked'
          effectiveColor: evaluation.color, // 'green' | 'yellow' | 'red'
          colorHex: evaluation.colorHex,
          glowHex: evaluation.glowHex,
          casingHex: evaluation.casingHex,
          conditionLabel: evaluation.label,
          badgeLabel: evaluation.badgeLabel,
          priorityRank: evaluation.priorityRank,
          from: road.from,
          to: road.to,
          state: road.state || '',
          lengthKm: road.lengthKm,
          conditionDetails: road.conditionDetails,
          detourRoute: road.detourRoute || '',
          affectedConvoys: road.affectedConvoys,
          lastUpdated: road.lastUpdated,
          environmentRisk: road.environmentRisk || (evaluation.condition === 'blocked' ? 'high' : evaluation.condition === 'warning' ? 'medium' : 'low'),
          trafficLevel: road.trafficLevel || (evaluation.condition === 'blocked' ? 'high' : evaluation.condition === 'warning' ? 'medium' : 'low'),
          weatherCondition: road.weatherCondition || (evaluation.condition === 'blocked' ? 'Debris Obstruction / Severe' : evaluation.condition === 'warning' ? 'Inclement / Restricted' : 'Normal / Clear'),
          isBlocked: evaluation.isBlocked,
          color: evaluation.colorHex,
        },
      };
    }),
  };
}

/**
 * Generates GeoJSON FeatureCollection for Incidents
 */
export function buildIncidentsGeoJSON(incidents: IncidentMarker[]) {
  return {
    type: 'FeatureCollection' as const,
    features: incidents.map((inc) => {
      const coords = getIncidentLngLat(inc);
      return {
        type: 'Feature' as const,
        id: inc.id,
        geometry: {
          type: 'Point' as const,
          coordinates: coords,
        },
        properties: {
          id: inc.id,
          code: inc.code,
          title: inc.title,
          category: inc.category,
          severity: inc.severity,
          status: inc.status,
          roadName: inc.roadName,
          district: inc.district,
          state: inc.state,
          timestamp: inc.timestamp,
          reportedBy: inc.reportedBy,
          description: inc.description,
          affectedVehicles: inc.affectedVehicles,
          estimatedClearance: inc.estimatedClearance,
          color:
            inc.severity === 'critical'
              ? '#ef4444' // RED
              : inc.severity === 'high' || inc.severity === 'warning'
              ? '#f59e0b' // AMBER
              : '#3b82f6', // BLUE / INFO
        },
      };
    }),
  };
}

/**
 * Generates GeoJSON FeatureCollection for Vehicles
 */
export function buildVehiclesGeoJSON(vehicles: (VehicleMarker | FleetVehicle)[]) {
  return {
    type: 'FeatureCollection' as const,
    features: vehicles.map((veh) => {
      const coords = getVehicleLngLat(veh);
      const isFleet = 'speed' in veh;
      return {
        type: 'Feature' as const,
        id: veh.id,
        geometry: {
          type: 'Point' as const,
          coordinates: coords,
        },
        properties: {
          id: veh.id,
          callsign: veh.callsign,
          cargo: isFleet ? (veh as FleetVehicle).cargo : (veh as VehicleMarker).cargo,
          status: veh.status,
          origin: veh.origin,
          destination: veh.destination,
          eta: veh.eta,
          speed: isFleet
            ? (veh as FleetVehicle).speed
            : `${(veh as VehicleMarker).currentSpeedKmH} km/h`,
          driver: isFleet ? (veh as FleetVehicle).driverName : (veh as VehicleMarker).driver,
          color: '#2563eb', // BLUE
        },
      };
    }),
  };
}

/**
 * Generates GeoJSON FeatureCollection for Risk Zones
 */
export function buildRiskZonesGeoJSON(riskZones: RiskZone[]) {
  return {
    type: 'FeatureCollection' as const,
    features: riskZones.map((zone) => {
      const ring = getRiskZoneCoordinates(zone);
      return {
        type: 'Feature' as const,
        id: zone.id,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ring],
        },
        properties: {
          id: zone.id,
          name: zone.name,
          type: zone.type,
          level: zone.level,
          riskScore: zone.riskScore,
          advisoryText: zone.advisoryText,
          sensorTrigger: zone.sensorTrigger,
          affectedDistricts: zone.affectedDistricts.join(', '),
          fillColor:
            zone.level === 'extreme'
              ? '#fca5a5'
              : zone.level === 'high'
              ? '#fde68a'
              : '#bae6fd',
          strokeColor:
            zone.level === 'extreme'
              ? '#ef4444'
              : zone.level === 'high'
              ? '#f59e0b'
              : '#3b82f6',
        },
      };
    }),
  };
}

/**
 * Simplified administrative boundaries for North Eastern Region (8 States)
 */
export const NER_STATES_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Assam', code: 'AS', headquarters: 'Dispur / Guwahati' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [89.8, 26.0],
            [90.0, 26.6],
            [91.5, 26.8],
            [92.8, 27.1],
            [94.3, 27.5],
            [95.5, 27.9],
            [95.9, 27.4],
            [95.3, 26.9],
            [94.2, 26.4],
            [93.3, 25.8],
            [93.1, 24.8],
            [92.4, 24.7],
            [92.5, 25.2],
            [91.8, 26.1],
            [90.6, 26.1],
            [89.8, 26.0],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Meghalaya', code: 'ML', headquarters: 'Shillong' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [90.0, 25.1],
            [90.0, 25.8],
            [91.8, 26.0],
            [92.8, 25.6],
            [92.7, 25.0],
            [91.5, 25.1],
            [90.0, 25.1],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Arunachal Pradesh', code: 'AR', headquarters: 'Itanagar' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [91.6, 27.3],
            [92.2, 27.9],
            [94.0, 28.7],
            [96.3, 28.9],
            [97.3, 28.3],
            [96.5, 27.5],
            [95.5, 27.3],
            [93.8, 27.0],
            [92.5, 26.8],
            [91.6, 27.3],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Nagaland', code: 'NL', headquarters: 'Kohima' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [93.5, 25.6],
            [93.7, 26.2],
            [94.5, 26.9],
            [95.2, 26.8],
            [95.1, 26.0],
            [94.3, 25.5],
            [93.5, 25.6],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Manipur', code: 'MN', headquarters: 'Imphal' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [93.2, 24.0],
            [93.2, 25.4],
            [94.4, 25.5],
            [94.6, 24.2],
            [93.8, 23.9],
            [93.2, 24.0],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Mizoram', code: 'MZ', headquarters: 'Aizawl' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [92.3, 21.9],
            [92.3, 24.3],
            [93.2, 24.2],
            [93.4, 22.8],
            [92.9, 21.9],
            [92.3, 21.9],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Tripura', code: 'TR', headquarters: 'Agartala' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [91.1, 23.0],
            [91.1, 24.4],
            [92.3, 24.4],
            [92.1, 23.1],
            [91.1, 23.0],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Sikkim', code: 'SK', headquarters: 'Gangtok' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [88.1, 27.1],
            [88.2, 28.0],
            [88.8, 28.1],
            [88.9, 27.3],
            [88.5, 27.1],
            [88.1, 27.1],
          ],
        ],
      },
    },
  ],
};
