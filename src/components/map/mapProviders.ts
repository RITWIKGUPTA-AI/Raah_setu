import type { StyleSpecification } from 'maplibre-gl';
import { MapBaseStyle } from './types';

export interface TileProviderConfig {
  id: MapBaseStyle;
  name: string;
  description: string;
  tiles?: string[];
  tileSize?: number;
  maxZoom?: number;
  attribution: string;
  badge: string;
  isMapTiler?: boolean;
}

/**
 * Retrieves the configured MapTiler API Key from Vite environment variables or defaults.
 */
export function getMapTilerApiKey(): string {
  const key = import.meta.env.VITE_MAPTILER_API_KEY;
  if (typeof key === 'string' && key.trim()) {
    return key.trim();
  }
  return 'wkndVymjmsbf6Y0M1QG4';
}

/**
 * Retrieves the configured MapTiler Access/Session Token from Vite environment variables or defaults.
 */
export function getMapTilerToken(): string {
  const token = import.meta.env.VITE_MAPTILER_API_TOKEN || import.meta.env.VITE_MAPTILER_TOKEN;
  if (typeof token === 'string' && token.trim()) {
    return token.trim();
  }
  return '4944422b95dd4dcfba73ddc23520d066_3ebe7e7a3e239c7de29d29becadb0f73b2e8acd4a3285c9d477557f7cec3c86f';
}

/**
 * Detailed authentication descriptor for MapTiler credentials.
 */
export interface MapTilerAuthInfo {
  hasKey: boolean;
  hasToken: boolean;
  isConfigured: boolean;
  description: string;
}

export function getMapTilerAuthInfo(): MapTilerAuthInfo {
  const hasKey = Boolean(getMapTilerApiKey());
  const hasToken = Boolean(getMapTilerToken());
  const isConfigured = hasKey || hasToken;

  let description = 'Keyless Mode';
  if (hasKey && hasToken) {
    description = 'API Key & Token Active';
  } else if (hasKey) {
    description = 'API Key Active';
  } else if (hasToken) {
    description = 'Access Token Active';
  }

  return { hasKey, hasToken, isConfigured, description };
}

/**
 * Checks whether any valid MapTiler credential (API Key or Token) is currently active.
 */
export function isMapTilerConfigured(): boolean {
  return Boolean(getMapTilerApiKey() || getMapTilerToken());
}

/**
 * Generates the URL authentication query string for MapTiler requests.
 * MapTiler Cloud styles authenticate via the API key parameter in the URL.
 */
export function getMapTilerAuthQuery(): string {
  const key = getMapTilerApiKey();
  if (key) {
    return `key=${encodeURIComponent(key)}`;
  }
  return '';
}

/**
 * Request transformer for MapLibre GL.
 * Ensures that all requests to api.maptiler.com include the key parameter.
 * Avoids setting custom Authorization headers which can trigger CORS preflight rejection on CDN tile endpoints.
 */
export function mapTilerTransformRequest(
  url: string,
  _resourceType?: string
): { url: string } {
  if (!url) return { url };

  if (url.includes('maptiler.com')) {
    const key = getMapTilerApiKey();
    if (key && !url.includes('key=')) {
      const separator = url.includes('?') ? '&' : '?';
      return { url: `${url}${separator}key=${encodeURIComponent(key)}` };
    }
  }

  return { url };
}

/**
 * Unified catalog of Open GIS and MapTiler Basemap styles.
 */
export const TILE_PROVIDERS: Record<MapBaseStyle, TileProviderConfig> = {
  // --- Open GIS Styles (Keyless) ---
  'carto-voyager': {
    id: 'carto-voyager',
    name: 'Carto Voyager (Roads & Terrain)',
    description: 'High-clarity navigation cartography showing highways, mountain passes, and urban hubs',
    tiles: [
      'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    ],
    tileSize: 256,
    maxZoom: 19,
    attribution: '© CARTO • © OpenStreetMap contributors',
    badge: 'Operational Navigation',
    isMapTiler: false,
  },
  'carto-light': {
    id: 'carto-light',
    name: 'Carto Positron (Tactical Light)',
    description: 'Clean monochrome basemap engineered for high-contrast telemetry and incident overlays',
    tiles: [
      'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png',
      'https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}@2x.png',
    ],
    tileSize: 256,
    maxZoom: 19,
    attribution: '© CARTO • © OpenStreetMap contributors',
    badge: 'Tactical Light',
    isMapTiler: false,
  },
  'topo': {
    id: 'topo',
    name: 'OpenTopoMap (Terrain & Relief)',
    description: 'Topographic contour relief and mountain elevation data for landslide analysis',
    tiles: [
      'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
    ],
    tileSize: 256,
    maxZoom: 17,
    attribution: '© OpenTopoMap • © OpenStreetMap contributors',
    badge: 'Topographic Relief',
    isMapTiler: false,
  },
  'osm': {
    id: 'osm',
    name: 'OpenStreetMap (Standard)',
    description: 'Global crowdsourced cartography with complete administrative and settlement names',
    tiles: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    ],
    tileSize: 256,
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
    badge: 'OpenStreetMap',
    isMapTiler: false,
  },
  'carto-dark': {
    id: 'carto-dark',
    name: 'Carto Dark Matter (Night Operations)',
    description: 'Low-luminance tactical dark basemap for nocturnal emergency convoys',
    tiles: [
      'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
      'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
    ],
    tileSize: 256,
    maxZoom: 19,
    attribution: '© CARTO • © OpenStreetMap contributors',
    badge: 'Night Ops',
    isMapTiler: false,
  },

  // --- MapTiler Cloud Styles (Requires VITE_MAPTILER_API_KEY) ---
  'maptiler-streets': {
    id: 'maptiler-streets',
    name: 'MapTiler Streets v2',
    description: 'Sharp cartography with arterial highways, district borders, and urban networks',
    attribution: '© MapTiler • © OpenStreetMap contributors',
    badge: 'MapTiler Streets',
    isMapTiler: true,
    tileSize: 512,
    maxZoom: 20,
  },
  'maptiler-satellite': {
    id: 'maptiler-satellite',
    name: 'MapTiler Satellite Hybrid',
    description: 'High-resolution satellite photogrammetry with overlaid road network and administrative labels',
    attribution: '© MapTiler • © OpenStreetMap contributors',
    badge: 'Satellite Hybrid',
    isMapTiler: true,
    tileSize: 512,
    maxZoom: 20,
  },
  'maptiler-outdoor': {
    id: 'maptiler-outdoor',
    name: 'MapTiler Outdoor & Relief',
    description: 'Contour lines, hillshading, mountain passes, and topography for natural disaster analysis',
    attribution: '© MapTiler • © OpenStreetMap contributors',
    badge: 'Outdoor Relief',
    isMapTiler: true,
    tileSize: 512,
    maxZoom: 20,
  },
  'maptiler-dataviz': {
    id: 'maptiler-dataviz',
    name: 'MapTiler Dataviz Dark',
    description: 'Modern high-contrast dark map optimized for tactical mission operations',
    attribution: '© MapTiler • © OpenStreetMap contributors',
    badge: 'Dark Tactical',
    isMapTiler: true,
    tileSize: 512,
    maxZoom: 20,
  },
  'maptiler-topo': {
    id: 'maptiler-topo',
    name: 'MapTiler Topo v2',
    description: 'Precision topographic contour maps for flood catchment and landslide route monitoring',
    attribution: '© MapTiler • © OpenStreetMap contributors',
    badge: 'Topographic v2',
    isMapTiler: true,
    tileSize: 512,
    maxZoom: 20,
  },
};

/**
 * Builds a reliable, high-performance MapLibre style specification.
 * Eliminates worker pbf parsing crashes, glyph font delays, and CORS preflight issues.
 */
export function buildKeylessMapStyle(styleId: MapBaseStyle): StyleSpecification {
  const provider = TILE_PROVIDERS[styleId] || TILE_PROVIDERS['carto-voyager'];
  const key = getMapTilerApiKey();

  let tiles = provider.tiles;

  // For MapTiler styles, dynamically generate the authenticated 512px raster tile URL
  if (provider.isMapTiler) {
    if (key) {
      switch (styleId) {
        case 'maptiler-streets':
          tiles = [`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`];
          break;
        case 'maptiler-satellite':
          tiles = [`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${encodeURIComponent(key)}`];
          break;
        case 'maptiler-outdoor':
          tiles = [`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`];
          break;
        case 'maptiler-dataviz':
          tiles = [`https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`];
          break;
        case 'maptiler-topo':
          tiles = [`https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`];
          break;
        default:
          tiles = [`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`];
      }
    } else {
      // Gracefully fall back to Carto Voyager if no key is configured
      tiles = TILE_PROVIDERS['carto-voyager'].tiles!;
    }
  }

  if (!tiles || tiles.length === 0) {
    tiles = TILE_PROVIDERS['carto-voyager'].tiles!;
  }

  const tileSize = provider.tileSize || (provider.isMapTiler ? 512 : 256);
  const maxZoom = provider.maxZoom || 19;

  return {
    version: 8,
    name: provider.name,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'base-raster-tiles': {
        type: 'raster',
        tiles,
        tileSize,
        attribution: provider.attribution,
        maxzoom: maxZoom,
      },
    },
    layers: [
      {
        id: 'base-raster-layer',
        type: 'raster',
        source: 'base-raster-tiles',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
          'raster-fade-duration': 150,
        },
      },
    ],
  };
}

/**
 * Returns a complete MapLibre StyleSpecification object ready for instant rendering.
 */
export function getMapStyleSpec(styleId: MapBaseStyle): StyleSpecification {
  return buildKeylessMapStyle(styleId);
}

/**
 * Checks whether WebGL or WebGL2 hardware acceleration is enabled in the browser.
 */
export function verifyWebGLSupport(): { supported: boolean; version?: string; error?: string } {
  if (typeof window === 'undefined') {
    return { supported: false, error: 'SSR environment' };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) return { supported: true, version: 'WebGL 2.0' };

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) return { supported: true, version: 'WebGL 1.0' };

    return { supported: false, error: 'WebGL context creation returned null' };
  } catch (err: any) {
    return { supported: false, error: err?.message || 'WebGL exception' };
  }
}

/**
 * Regional Bounding Boxes for North East Region States
 */
export const STATE_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  'Assam': [
    [89.7, 24.1],
    [96.0, 28.0],
  ],
  'Arunachal Pradesh': [
    [91.5, 26.6],
    [97.4, 29.5],
  ],
  'Manipur': [
    [93.0, 23.8],
    [94.8, 25.7],
  ],
  'Meghalaya': [
    [89.8, 25.0],
    [92.8, 26.1],
  ],
  'Mizoram': [
    [92.2, 21.9],
    [93.5, 24.5],
  ],
  'Nagaland': [
    [93.3, 25.1],
    [95.3, 27.0],
  ],
  'Sikkim': [
    [88.0, 27.0],
    [88.9, 28.1],
  ],
  'Tripura': [
    [91.1, 22.9],
    [92.4, 24.5],
  ],
};
