import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Shield,
  Layers,
  RefreshCw,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import {
  GISMapProps,
  MapBaseStyle,
  MapLayerVisibility,
  MapViewport,
} from './types';
import {
  buildKeylessMapStyle,
  getMapStyleSpec,
  isMapTilerConfigured,
  mapTilerTransformRequest,
  verifyWebGLSupport,
  STATE_BOUNDS,
} from './mapProviders';
import { MapControls } from './MapControls';
import { MapPopup, PopupItem } from './MapPopup';
import {
  NER_CENTER,
  NER_DEFAULT_ZOOM,
  NER_BOUNDS,
  buildRoadsGeoJSON,
  buildRiskZonesGeoJSON,
  NER_STATES_GEOJSON,
  getIncidentLngLat,
  getVehicleLngLat,
  getBridgeLngLat,
  getRoadMidpoint,
} from '../../utils/geoCoordinates';
import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  BridgeMarker,
  FleetVehicle,
} from '../../types';
import {
  evaluateRoadCondition,
  extractBlockedRoadIndicators,
} from '../../utils/roadConditions';

export const GISMap: React.FC<GISMapProps> = ({
  roads = [],
  incidents = [],
  vehicles = [],
  riskZones = [],
  bridges = [],
  selectedIncident = null,
  selectedVehicle = null,
  selectedRoad = null,
  selectedBridge = null,
  onSelectIncident,
  onSelectVehicle,
  onSelectRoad,
  onSelectBridge,
  selectedStateFilter = 'all',
  className = '',
  showTitleBar = true,
  title = 'Regional Operations & Tactical Logistics',
  subtitle = 'Open Cartographic Basemap • Real-time Highway Telemetry & Incident Intelligence',
  showLayerToggle = true,
  defaultBaseStyle = isMapTilerConfigured() ? 'maptiler-streets' : 'carto-voyager',
  initialCenter = NER_CENTER,
  initialZoom = NER_DEFAULT_ZOOM,
  onViewportChange,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);

  // Active Map Style (Open Basemap or MapTiler)
  const [baseStyle, setBaseStyle] = useState<MapBaseStyle>(defaultBaseStyle);
  const [styleVersion, setStyleVersion] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<string>('26°12\'N, 92°44\'E');
  const [currentZoom, setCurrentZoom] = useState<number>(initialZoom);

  // Tactical Layer Visibility
  const [layers, setLayers] = useState<MapLayerVisibility>({
    roads: true,
    incidents: true,
    vehicles: true,
    riskZones: true,
    bridges: true,
    stateBoundaries: true,
  });

  // Active selected popup item for on-map inspection
  const [activePopupItem, setActivePopupItem] = useState<PopupItem | null>(null);

  // Active hovered road segment for dynamic telemetry tooltip
  const [hoveredRoad, setHoveredRoad] = useState<{ road: RoadSegment; x: number; y: number } | null>(null);

  // Clear HTML markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Close maplibre popup
  const closePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    setActivePopupItem(null);
  }, []);

  // Update cursor coordinate readout
  const handleMouseMove = useCallback((e: maplibregl.MapMouseEvent) => {
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = Math.floor((Math.abs(lat) - latDeg) * 60);
    const latDir = lat >= 0 ? 'N' : 'S';

    const lngDeg = Math.floor(Math.abs(lng));
    const lngMin = Math.floor((Math.abs(lng) - lngDeg) * 60);
    const lngDir = lng >= 0 ? 'E' : 'W';

    setCursorCoords(`${latDeg}°${latMin}'${latDir}, ${lngDeg}°${lngMin}'${lngDir}`);
  }, []);

  // ==========================================
  // INITIALIZE MAPLIBRE INSTANCE (ZERO API KEY)
  // ==========================================
  useEffect(() => {
    if (!canvasRef.current) return;

    // Verify browser WebGL support
    const webglCheck = verifyWebGLSupport();
    if (!webglCheck.supported) {
      setMapError(`Hardware rendering notice: ${webglCheck.error || 'WebGL is not available.'}`);
      return;
    }

    setMapError(null);
    setIsMapReady(false);

    let fallbackTimer: NodeJS.Timeout | null = null;

    try {
      const styleSpec = getMapStyleSpec(baseStyle);

      const map = new maplibregl.Map({
        container: canvasRef.current,
        style: styleSpec,
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 4,
        maxZoom: 19,
        attributionControl: false,
        interactive: interactive,
        transformRequest: mapTilerTransformRequest,
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: 'VECTOR Gov GIS • © OpenStreetMap • © CARTO • © MapTiler',
        }),
        'bottom-right'
      );

      mapRef.current = map;

      // Fallback timer: If basemap does not load within 4.5 seconds, safely attempt fallback
      fallbackTimer = setTimeout(() => {
        const currentMap = mapRef.current;
        if (!currentMap) return;
        if (!currentMap.isStyleLoaded()) {
          console.warn('[GISMap] Basemap initialization taking longer, attempting keyless cartography');
          try {
            currentMap.setStyle(buildKeylessMapStyle('carto-voyager'));
            setBaseStyle('carto-voyager');
          } catch (fallbackErr) {
            console.warn('[GISMap] Fallback error:', fallbackErr);
          }
          // Do not manually force isMapReady = true; let the style.load event fire naturally
        }
      }, 4500);

      const handleStyleReady = () => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        setIsMapReady(true);
        setMapError(null);
        setStyleVersion((v) => v + 1);
        try {
          map.resize();
        } catch {}
      };

      map.on('load', handleStyleReady);
      map.on('style.load', handleStyleReady);

      map.on('move', () => {
        try {
          setCurrentZoom(map.getZoom());
          if (onViewportChange) {
            const c = map.getCenter();
            onViewportChange({
              center: [c.lng, c.lat],
              zoom: map.getZoom(),
              pitch: map.getPitch(),
              bearing: map.getBearing(),
            });
          }
        } catch {}
      });

      map.on('mousemove', handleMouseMove);

      map.on('error', (e) => {
        console.warn('[GISMap] MapLibre pipeline notice:', e.error?.message || e);
        // Do not force setStyle or set isMapReady here, which causes style loading collisions
      });

      // Responsive ResizeObserver
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          try {
            mapRef.current.resize();
          } catch {}
        }
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        resizeObserver.disconnect();
        clearMarkers();
        closePopup();
        try {
          map.remove();
        } catch (cleanupErr) {
          console.warn('[GISMap] Cleanup notice:', cleanupErr);
        }
        mapRef.current = null;
      };
    } catch (err: any) {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      console.error('[GISMap] Initialization error:', err);
      setMapError(`Failed to initialize GIS map service: ${err?.message || 'Unknown'}`);
    }
  }, []);

  // ==========================================
  // SWITCH BASEMAP STYLE SEAMLESSLY
  // ==========================================
  const handleChangeStyle = useCallback((newStyle: MapBaseStyle) => {
    const map = mapRef.current;
    if (!map) return;
    setIsMapReady(false);
    setBaseStyle(newStyle);
    try {
      const newStyleSpec = getMapStyleSpec(newStyle);
      map.setStyle(newStyleSpec);
    } catch (err) {
      console.warn('[GISMap] Failed to set style, reverting to Carto Voyager', err);
      try {
        map.setStyle(buildKeylessMapStyle('carto-voyager'));
        setBaseStyle('carto-voyager');
      } catch (fallbackErr) {
        console.error('[GISMap] Critical style failure:', fallbackErr);
        setMapError('Failed to load map style');
      }
    }
  }, []);

  // ==========================================
  // RENDER VECTOR GEOJSON LAYERS
  // ==========================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !map.isStyleLoaded()) return;

    // Helper to safely add or update GeoJSON source
    const updateSource = (sourceId: string, data: any) => {
      if (!map || !map.isStyleLoaded()) return;
      try {
        const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
        if (src && typeof src.setData === 'function') {
          src.setData(data);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data,
          });
        }
      } catch (err) {
        console.warn(`[GISMap] Notice updating source ${sourceId}:`, err);
      }
    };

    // 1. NER State Boundaries
    if (layers.stateBoundaries) {
      updateSource('source-ner-states', NER_STATES_GEOJSON);

      try {
        if (!map.getLayer('layer-ner-states-fill')) {
          map.addLayer({
            id: 'layer-ner-states-fill',
            type: 'fill',
            source: 'source-ner-states',
            paint: {
              'fill-color': '#2563eb',
              'fill-opacity': 0.03,
            },
          });
        }

        if (!map.getLayer('layer-ner-states-line')) {
          map.addLayer({
            id: 'layer-ner-states-line',
            type: 'line',
            source: 'source-ner-states',
            paint: {
              'line-color': '#475569',
              'line-width': 1.5,
              'line-dasharray': [3, 2],
              'line-opacity': 0.6,
            },
          });
        }
      } catch (err) {
        console.warn('[GISMap] Notice adding state boundary layers:', err);
      }
    } else {
      try {
        if (map.getLayer('layer-ner-states-line')) map.removeLayer('layer-ner-states-line');
        if (map.getLayer('layer-ner-states-fill')) map.removeLayer('layer-ner-states-fill');
        if (map.getSource('source-ner-states')) map.removeSource('source-ner-states');
      } catch (err) {
        console.warn('[GISMap] Notice removing state boundary layers:', err);
      }
    }

    // 2. Risk Zones Polygons
    if (layers.riskZones && riskZones.length > 0) {
      const riskData = buildRiskZonesGeoJSON(riskZones);
      updateSource('source-risk-zones', riskData);

      try {
        if (!map.getLayer('layer-risk-zones-fill')) {
          map.addLayer({
            id: 'layer-risk-zones-fill',
            type: 'fill',
            source: 'source-risk-zones',
            paint: {
              'fill-color': [
                'match',
                ['get', 'riskLevel'],
                'critical',
                '#ef4444',
                'high',
                '#f97316',
                'warning',
                '#eab308',
                '#3b82f6',
              ],
              'fill-opacity': 0.15,
            },
          });
        }

        if (!map.getLayer('layer-risk-zones-line')) {
          map.addLayer({
            id: 'layer-risk-zones-line',
            type: 'line',
            source: 'source-risk-zones',
            paint: {
              'line-color': [
                'match',
                ['get', 'riskLevel'],
                'critical',
                '#dc2626',
                'high',
                '#ea580c',
                'warning',
                '#ca8a04',
                '#2563eb',
              ],
              'line-width': 1.75,
              'line-dasharray': [4, 3],
            },
          });
        }
      } catch (err) {
        console.warn('[GISMap] Notice adding risk zone layers:', err);
      }
    } else {
      try {
        if (map.getLayer('layer-risk-zones-line')) map.removeLayer('layer-risk-zones-line');
        if (map.getLayer('layer-risk-zones-fill')) map.removeLayer('layer-risk-zones-fill');
        if (map.getSource('source-risk-zones')) map.removeSource('source-risk-zones');
      } catch (err) {
        console.warn('[GISMap] Notice removing risk zone layers:', err);
      }
    }

    // 3. Arterial Highway Corridors with Dynamic Road Condition Highlights
    if (layers.roads && roads.length > 0) {
      const roadData = buildRoadsGeoJSON(roads);
      updateSource('source-highway-corridors', roadData);

      try {
        // 3a. Subtle Glow / Ambient Aura Layer around highlighted roads
        if (!map.getLayer('layer-highway-glow')) {
          map.addLayer({
            id: 'layer-highway-glow',
            type: 'line',
            source: 'source-highway-corridors',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': ['coalesce', ['get', 'glowHex'], 'rgba(16, 185, 129, 0.4)'],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 7.5,
                8, 11.5,
                12, 15,
              ],
              'line-blur': 2.8,
              'line-opacity': 0.4,
            },
          });
        }

        // 3b. Casing layer for high-contrast border against any basemap
        if (!map.getLayer('layer-highway-casing')) {
          map.addLayer({
            id: 'layer-highway-casing',
            type: 'line',
            source: 'source-highway-corridors',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#090d16',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 5,
                8, 7.5,
                12, 10,
              ],
              'line-opacity': 0.88,
            },
          });
        }

        // 3c. Main dynamic status line layer (🟢 GREEN / 🟡 YELLOW / 🔴 RED)
        if (!map.getLayer('layer-highway-corridors')) {
          map.addLayer({
            id: 'layer-highway-corridors',
            type: 'line',
            source: 'source-highway-corridors',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': ['coalesce', ['get', 'colorHex'], '#10b981'],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 3.2,
                8, 5,
                12, 7,
              ],
            },
          });

          // Click handler for highway corridors
          map.on('click', 'layer-highway-corridors', (e) => {
            if (!e.features || e.features.length === 0) return;
            const feat = e.features[0];
            const roadId = feat.properties?.id;
            const matchRoad = roads.find((r) => r.id === roadId);
            if (matchRoad) {
              setHoveredRoad(null);
              setActivePopupItem({ type: 'road', data: matchRoad });
              if (onSelectRoad) onSelectRoad(matchRoad);
            }
          });

          map.on('mousemove', 'layer-highway-corridors', (e) => {
            try {
              map.getCanvas().style.cursor = 'pointer';
              if (e.features && e.features.length > 0) {
                const roadId = e.features[0].properties?.id;
                const match = roads.find((r) => r.id === roadId);
                if (match) {
                  setHoveredRoad({
                    road: match,
                    x: e.point.x,
                    y: e.point.y,
                  });
                }
              }
            } catch {}
          });

          map.on('mouseleave', 'layer-highway-corridors', () => {
            try {
              map.getCanvas().style.cursor = '';
              setHoveredRoad(null);
            } catch {}
          });
        }
      } catch (err) {
        console.warn('[GISMap] Notice adding highway corridor layers:', err);
      }
    } else {
      try {
        if (map.getLayer('layer-highway-corridors')) map.removeLayer('layer-highway-corridors');
        if (map.getLayer('layer-highway-casing')) map.removeLayer('layer-highway-casing');
        if (map.getLayer('layer-highway-glow')) map.removeLayer('layer-highway-glow');
        if (map.getSource('source-highway-corridors')) map.removeSource('source-highway-corridors');
      } catch (err) {
        console.warn('[GISMap] Notice removing highway corridor layers:', err);
      }
    }
  }, [isMapReady, layers, roads, riskZones, onSelectRoad, styleVersion]);

  // ==========================================
  // RENDER INTERACTIVE HTML MARKERS
  // ==========================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    clearMarkers();

    // 1. INCIDENT MARKERS
    if (layers.incidents) {
      incidents.forEach((inc) => {
        const coords = getIncidentLngLat(inc);
        if (!coords) return;

        const isCritical = inc.severity === 'critical';
        const isHigh = inc.severity === 'high';
        const isSelected = selectedIncident?.id === inc.id;

        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer select-none';
        el.id = `incident-pin-${inc.id}`;

        const markerColor = isCritical
          ? 'bg-rose-600 border-rose-200 text-white'
          : isHigh
          ? 'bg-amber-600 border-amber-200 text-white'
          : 'bg-blue-600 border-blue-200 text-white';

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            ${
              isCritical || isHigh
                ? `<span class="absolute -inset-1 rounded-full ${
                    isCritical ? 'bg-rose-500/40' : 'bg-amber-500/40'
                  } animate-ping"></span>`
                : ''
            }
            <div class="relative flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-md ${markerColor} transition-transform group-hover:scale-115 ${
              isSelected ? 'scale-125 ring-2 ring-slate-900' : ''
            }">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActivePopupItem({ type: 'incident', data: inc });
          if (onSelectIncident) onSelectIncident(inc);
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 8.5), duration: 600 });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 2. VEHICLE / CONVOY MARKERS
    if (layers.vehicles) {
      vehicles.forEach((veh: any) => {
        const coords = getVehicleLngLat(veh);
        if (!coords) return;

        const isSelected = selectedVehicle && (selectedVehicle as any).id === veh.id;
        const isDelayed = veh.status === 'delayed';

        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer select-none';
        el.id = `vehicle-marker-${veh.id}`;

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="relative flex h-6 w-6 items-center justify-center rounded-md border border-white shadow-md ${
              isDelayed ? 'bg-amber-600' : 'bg-slate-900'
            } text-white transition-transform group-hover:scale-115 ${
              isSelected ? 'scale-125 ring-2 ring-blue-500' : ''
            }">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-8 0a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActivePopupItem({ type: 'vehicle', data: veh });
          if (onSelectVehicle) onSelectVehicle(veh);
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 8.5), duration: 600 });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 3. BRIDGE MARKERS
    if (layers.bridges) {
      bridges.forEach((bridge) => {
        const coords = getBridgeLngLat(bridge);
        if (!coords) return;

        const isCritical = bridge.status === 'critical' || bridge.status === 'blocked';
        const isRestricted = bridge.status === 'restricted';
        const isSelected = selectedBridge?.id === bridge.id;

        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer select-none';
        el.id = `bridge-pin-${bridge.id}`;

        const bridgeBg = isCritical
          ? 'bg-rose-700 text-white'
          : isRestricted
          ? 'bg-amber-600 text-white'
          : 'bg-emerald-700 text-white';

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="flex h-5 w-5 items-center justify-center rounded-full border border-white shadow-xs ${bridgeBg} transition-transform group-hover:scale-120 ${
              isSelected ? 'scale-125 ring-2 ring-slate-900' : ''
            }">
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h16M4 14h16M9 10v4M15 10v4M4 18h16M4 6h16"/>
              </svg>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActivePopupItem({ type: 'bridge', data: bridge });
          if (onSelectBridge) onSelectBridge(bridge);
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 8.5), duration: 600 });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 4. BLOCKED ROAD CLOSURE INDICATOR PINS
    if (layers.roads && roads.length > 0) {
      const blockedClosures = extractBlockedRoadIndicators(roads);
      blockedClosures.forEach((closure) => {
        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer select-none';
        el.id = `road-closure-pin-${closure.id}`;

        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            <!-- Pulsing outer alert ring -->
            <div class="absolute -inset-2 rounded-full bg-rose-600/35 animate-ping pointer-events-none"></div>
            
            <!-- Closure Icon Shield -->
            <div class="relative flex h-7 w-7 items-center justify-center rounded-md bg-rose-700 text-white shadow-lg border-2 border-white ring-1 ring-rose-900 transition-transform group-hover:scale-115">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
            </div>

            <!-- Compact Permanent Label Pill -->
            <div class="mt-1 px-1.5 py-0.5 rounded bg-rose-950/90 text-white text-[9px] font-bold tracking-tight uppercase shadow-md border border-rose-500 whitespace-nowrap flex items-center space-x-1 backdrop-blur-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              <span>ROAD BLOCKED</span>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetRoad = roads.find((r) => r.id === closure.roadId);
          if (targetRoad) {
            setActivePopupItem({ type: 'road', data: targetRoad });
            if (onSelectRoad) onSelectRoad(targetRoad);
            map.flyTo({ center: closure.location, zoom: Math.max(map.getZoom(), 9.2), duration: 700 });
          }
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(closure.location)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 5. HIGHWAY ROUTE BADGES / CORRIDOR LABELS
    if (layers.roads && roads.length > 0) {
      roads.forEach((road) => {
        const midPoint = getRoadMidpoint(road);
        if (!midPoint) return;

        const cond = evaluateRoadCondition(road);
        const isSelected = selectedRoad?.id === road.id;

        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer select-none';
        el.id = `highway-badge-${road.id}`;

        const dotColor =
          cond.isBlocked
            ? 'bg-rose-500 shadow-rose-500/50 animate-pulse'
            : cond.isWarning
            ? 'bg-amber-400 shadow-amber-400/50'
            : 'bg-emerald-400 shadow-emerald-400/50';

        const borderRing = isSelected
          ? 'border-indigo-400 ring-2 ring-indigo-400 bg-indigo-950/95'
          : cond.isBlocked
          ? 'border-rose-500/70 bg-slate-950/90'
          : cond.isWarning
          ? 'border-amber-400/70 bg-slate-950/90'
          : 'border-slate-700/80 bg-slate-950/90';

        el.innerHTML = `
          <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded text-white text-[10px] font-bold tracking-tight shadow-md border ${borderRing} backdrop-blur-xs transition-all transform group-hover:scale-115 group-hover:bg-slate-900">
            <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
            <span class="text-slate-100 font-mono">${road.routeNumber || 'NH'}</span>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActivePopupItem({ type: 'road', data: road });
          if (onSelectRoad) onSelectRoad(road);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(midPoint)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [
    isMapReady,
    layers,
    incidents,
    vehicles,
    bridges,
    roads,
    selectedIncident,
    selectedVehicle,
    selectedBridge,
    selectedRoad,
    onSelectIncident,
    onSelectVehicle,
    onSelectBridge,
    onSelectRoad,
    clearMarkers,
  ]);

  // ==========================================
  // PROGRAMMATIC CAMERA POSITIONING (STATE FILTER)
  // ==========================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    if (selectedStateFilter && selectedStateFilter !== 'all') {
      const bounds = STATE_BOUNDS[selectedStateFilter];
      if (bounds) {
        try {
          map.fitBounds(bounds, { padding: 45, maxZoom: 8.5, duration: 1000 });
        } catch (err) {
          console.warn('[GISMap] Notice on fitBounds:', err);
        }
      }
    }
  }, [selectedStateFilter, isMapReady]);

  // ==========================================
  // SYNC CAMERA WITH SELECTED ENTITY
  // ==========================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    try {
      if (selectedIncident) {
        const coords = getIncidentLngLat(selectedIncident);
        if (coords) {
          map.flyTo({ center: coords, zoom: 8.8, duration: 800 });
          setActivePopupItem({ type: 'incident', data: selectedIncident });
        }
      } else if (selectedVehicle) {
        const coords = getVehicleLngLat(selectedVehicle);
        if (coords) {
          map.flyTo({ center: coords, zoom: 8.8, duration: 800 });
          setActivePopupItem({ type: 'vehicle', data: selectedVehicle });
        }
      } else if (selectedBridge) {
        const coords = getBridgeLngLat(selectedBridge);
        if (coords) {
          map.flyTo({ center: coords, zoom: 9.0, duration: 800 });
          setActivePopupItem({ type: 'bridge', data: selectedBridge });
        }
      }
    } catch (err) {
      console.warn('[GISMap] Notice on flyTo entity:', err);
    }
  }, [selectedIncident, selectedVehicle, selectedBridge, isMapReady]);

  // ==========================================
  // CONTROLS HANDLERS
  // ==========================================
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const handleResetBearing = () => mapRef.current?.resetNorthPitch({ duration: 500 });
  const handleResetBounds = () => {
    mapRef.current?.fitBounds(NER_BOUNDS, { padding: 30, duration: 800 });
  };
  const handleToggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleToggleLayer = (layerKey: keyof MapLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div
      ref={containerRef}
      id="gis-map-master-container"
      className={`relative flex flex-col w-full h-full min-h-[380px] bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      {/* Tactical Title Bar */}
      {showTitleBar && (
        <div
          id="gis-map-title-bar"
          className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/90 px-3.5 py-2.5 backdrop-blur-xs select-none"
        >
          <div className="flex items-center space-x-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-white">
              <Shield className="h-3 w-3" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold text-slate-900 tracking-tight">{title}</h2>
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  LIVE GIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{subtitle}</p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="inline-flex items-center space-x-1 rounded bg-white px-2 py-1 border border-slate-200 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{incidents.filter((i) => i.severity === 'critical').length} Critical</span>
            </span>
            <span className="inline-flex items-center space-x-1 rounded bg-white px-2 py-1 border border-slate-200 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>{vehicles.length} In-Transit</span>
            </span>
          </div>
        </div>
      )}

      {/* Map Surface Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[380px] overflow-hidden bg-slate-100">
        {/* MapLibre WebGL Canvas Container */}
        <div
          ref={canvasRef}
          id="gis-maplibre-canvas"
          className="absolute inset-0 w-full h-full"
        />

        {/* Loading Overlay */}
        {!isMapReady && !mapError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-xs pointer-events-none">
            <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm text-xs font-semibold text-slate-700">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <span>Loading VECTOR GIS Tactical Basemap...</span>
            </div>
          </div>
        )}

        {/* Map Error Notice */}
        {mapError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/95 p-6 text-center">
            <div className="max-w-md rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">GIS Basemap Connection Issue</h3>
              <p className="text-xs text-slate-500 mb-4">{mapError}</p>
              <button
                type="button"
                onClick={() => {
                  setMapError(null);
                  setIsMapReady(false);
                  mapRef.current?.setStyle(buildKeylessMapStyle(baseStyle));
                }}
                className="inline-flex items-center space-x-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Map Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Map Controls */}
        <MapControls
          currentStyle={baseStyle}
          onChangeStyle={handleChangeStyle}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetBearing={handleResetBearing}
          onResetBounds={handleResetBounds}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          cursorCoords={cursorCoords}
          zoomLevel={currentZoom}
          showLayerToggle={showLayerToggle}
        />

        {/* Active Inspection Popup (Pinned Top-Left or on click) */}
        {activePopupItem && (
          <div className="absolute top-3 left-3 z-30 animate-in fade-in zoom-in-95 duration-150">
            <MapPopup
              item={activePopupItem}
              onClose={() => setActivePopupItem(null)}
              onAction={(item) => {
                if (item.type === 'incident' && onSelectIncident) onSelectIncident(item.data);
                if (item.type === 'vehicle' && onSelectVehicle) onSelectVehicle(item.data);
                if (item.type === 'road' && onSelectRoad) onSelectRoad(item.data);
                if (item.type === 'bridge' && onSelectBridge) onSelectBridge(item.data);
              }}
            />
          </div>
        )}

        {/* Dynamic Road Telemetry Hover Tooltip */}
        {hoveredRoad && !activePopupItem && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: hoveredRoad.x, top: hoveredRoad.y - 12 }}
          >
            <div className="bg-slate-900/95 text-white rounded-lg shadow-xl border border-slate-700/80 px-3 py-2 text-xs w-64 backdrop-blur-md">
              <div className="flex items-center justify-between space-x-1.5 pb-1 border-b border-slate-800">
                <span className="font-bold text-slate-100 font-mono text-[11px]">
                  {hoveredRoad.road.routeNumber}
                </span>
                {(() => {
                  const evalCond = evaluateRoadCondition(hoveredRoad.road);
                  if (evalCond.isBlocked) {
                    return (
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>ROAD BLOCKED</span>
                      </span>
                    );
                  }
                  if (evalCond.isWarning) {
                    return (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold uppercase tracking-wider">
                        MODERATE RISK
                      </span>
                    );
                  }
                  return (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                      CLEAR & SAFE
                    </span>
                  );
                })()}
              </div>

              <div className="mt-1.5 space-y-1">
                <div className="font-semibold text-slate-200 text-[11px] leading-tight">
                  {hoveredRoad.road.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {hoveredRoad.road.from} → {hoveredRoad.road.to}
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-300 pt-0.5">
                  <span>Env: <b className="uppercase text-slate-100">{hoveredRoad.road.environmentRisk || 'low'}</b></span>
                  <span className="text-slate-600">•</span>
                  <span>Traffic: <b className="uppercase text-slate-100">{hoveredRoad.road.trafficLevel || 'normal'}</b></span>
                </div>
                {hoveredRoad.road.weatherCondition && (
                  <div className="text-[10px] text-sky-300 font-medium truncate pt-0.5">
                    {hoveredRoad.road.weatherCondition}
                  </div>
                )}
                <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <span>Click segment to inspect</span>
                  <span className="font-mono">{hoveredRoad.road.lengthKm} km</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Road Condition GIS Status Legend */}
        <div
          id="map-road-condition-legend"
          className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center space-x-3 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-[11px] text-white shadow-lg border border-slate-700/75 select-none"
        >
          <div className="flex items-center space-x-1.5 border-r border-slate-700/80 pr-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
              Road Condition
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="font-medium text-slate-200">Clear / Safe</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
            <span className="font-medium text-slate-200">Moderate Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)] animate-pulse" />
            <span className="font-medium text-slate-200">Blocked / Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};
