import React from 'react';
import {
  Layers,
  Maximize2,
  Minimize2,
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Eye,
  EyeOff,
  Palette,
  Check,
} from 'lucide-react';
import { MapBaseStyle, MapLayerVisibility } from './types';
import { TILE_PROVIDERS, getMapTilerAuthInfo } from './mapProviders';

interface MapControlsProps {
  currentStyle: MapBaseStyle;
  onChangeStyle: (style: MapBaseStyle) => void;
  layers: MapLayerVisibility;
  onToggleLayer: (layerKey: keyof MapLayerVisibility) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetBearing: () => void;
  onResetBounds: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  cursorCoords: string;
  zoomLevel: number;
  showLayerToggle?: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  currentStyle,
  onChangeStyle,
  layers,
  onToggleLayer,
  onZoomIn,
  onZoomOut,
  onResetBearing,
  onResetBounds,
  isFullscreen,
  onToggleFullscreen,
  cursorCoords,
  zoomLevel,
  showLayerToggle = true,
}) => {
  const [showStyleMenu, setShowStyleMenu] = React.useState(false);
  const [showLayerMenu, setShowLayerMenu] = React.useState(false);

  return (
    <>
      {/* Top-Right Floating Action Bar */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1.5 select-none">
        {/* Layer Visibility Menu Toggle */}
        {showLayerToggle && (
          <div className="relative">
            <button
              type="button"
              id="map-layers-toggle-btn"
              onClick={() => {
                setShowLayerMenu(!showLayerMenu);
                setShowStyleMenu(false);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-md border shadow-2xs transition-colors ${
                showLayerMenu
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Operational Map Layers"
            >
              <Layers className="h-4 w-4" />
            </button>

            {/* Layer Visibility Flyout */}
            {showLayerMenu && (
              <div
                id="map-layers-dropdown"
                className="absolute right-9 top-0 w-60 rounded-lg border border-slate-200 bg-white p-3 shadow-md z-30 text-xs"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 tracking-tight">Tactical Layers</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">GIS Grid</span>
                </div>
                <div className="space-y-1">
                  {[
                    { key: 'roads', label: 'Highway Corridors', count: '8 Routes' },
                    { key: 'incidents', label: 'Active Incidents', count: 'Real-time' },
                    { key: 'vehicles', label: 'GPS Supply Convoys', count: 'Live' },
                    { key: 'bridges', label: 'Critical Bridges', count: 'Monitored' },
                    { key: 'riskZones', label: 'Landslide Risk Polygons', count: 'Vulnerability' },
                    { key: 'stateBoundaries', label: 'NER State Borders', count: '8 States' },
                  ].map(({ key, label, count }) => {
                    const isVisible = layers[key as keyof MapLayerVisibility];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onToggleLayer(key as keyof MapLayerVisibility)}
                        className="flex w-full items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-2">
                          {isVisible ? (
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span className={isVisible ? 'font-medium text-slate-800' : 'text-slate-500 line-through'}>
                            {label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Style Selector Toggle */}
        <div className="relative">
          <button
            type="button"
            id="map-style-toggle-btn"
            onClick={() => {
              setShowStyleMenu(!showStyleMenu);
              setShowLayerMenu(false);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-md border shadow-2xs transition-colors ${
              showStyleMenu
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Cartographic Basemap Style"
          >
            <Palette className="h-4 w-4" />
          </button>

          {/* Style Selector Flyout */}
          {showStyleMenu && (
            <div
              id="map-styles-dropdown"
              className="absolute right-9 top-0 w-72 max-h-[85vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-lg z-30 text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 tracking-tight">Basemap Style</span>
                {getMapTilerAuthInfo().isConfigured ? (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{getMapTilerAuthInfo().description}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                    Open Cartography
                  </span>
                )}
              </div>

              {/* SECTION: MapTiler Cloud Vector Styles */}
              <div className="mb-3">
                <div className="flex items-center justify-between px-1 py-1 mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    MapTiler Vector Basemaps
                  </span>
                  {!getMapTilerAuthInfo().isConfigured && (
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200">
                      Add API Key or Token
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {Object.values(TILE_PROVIDERS)
                    .filter((p) => p.isMapTiler)
                    .map((provider) => {
                      const isSelected = currentStyle === provider.id;
                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => {
                            onChangeStyle(provider.id);
                            setShowStyleMenu(false);
                          }}
                          className={`flex w-full items-start justify-between p-2 rounded text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50/80 border border-blue-200 text-blue-950'
                              : 'hover:bg-slate-50 border border-transparent text-slate-800'
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="font-semibold text-xs flex items-center space-x-1.5">
                              <span>{provider.name}</span>
                              {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {provider.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* SECTION: Open GIS Styles (Keyless) */}
              <div>
                <div className="px-1 py-1 mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Open GIS Basemaps (Keyless)
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.values(TILE_PROVIDERS)
                    .filter((p) => !p.isMapTiler)
                    .map((provider) => {
                      const isSelected = currentStyle === provider.id;
                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => {
                            onChangeStyle(provider.id);
                            setShowStyleMenu(false);
                          }}
                          className={`flex w-full items-start justify-between p-2 rounded text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50/80 border border-blue-200 text-blue-950'
                              : 'hover:bg-slate-50 border border-transparent text-slate-800'
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="font-semibold text-xs flex items-center space-x-1.5">
                              <span>{provider.badge}</span>
                              {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {provider.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-md border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <button
            type="button"
            id="map-zoom-in-btn"
            onClick={onZoomIn}
            className="flex h-7 w-8 items-center justify-center text-slate-700 hover:bg-slate-50 border-b border-slate-100 transition-colors"
            title="Zoom In"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            id="map-zoom-out-btn"
            onClick={onZoomOut}
            className="flex h-7 w-8 items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
            title="Zoom Out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Compass / Reset Bearing */}
        <button
          type="button"
          id="map-reset-bearing-btn"
          onClick={onResetBearing}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          title="Reset North Orientation"
        >
          <Compass className="h-4 w-4" />
        </button>

        {/* Reset View to North East Region */}
        <button
          type="button"
          id="map-reset-bounds-btn"
          onClick={onResetBounds}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          title="Fit North East Region (NER)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          id="map-toggle-fullscreen-btn"
          onClick={onToggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Bottom Floating Telemetry & Coordinates Bar */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-2 pointer-events-none select-none">
        <div className="rounded bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 text-[11px] font-mono text-slate-200 shadow-sm flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{cursorCoords}</span>
          <span className="text-slate-500">•</span>
          <span>Zoom {zoomLevel.toFixed(1)}x</span>
        </div>
      </div>
    </>
  );
};
