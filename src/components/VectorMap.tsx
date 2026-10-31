import React from 'react';
import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  RiskZone,
  BridgeMarker,
  FleetVehicle,
} from '../types';
import { GISMap } from './map/GISMap';
import { MapBaseStyle } from './map/types';
import { isMapTilerConfigured } from './map/mapProviders';

export interface VectorMapProps {
  roads?: RoadSegment[];
  incidents?: IncidentMarker[];
  vehicles?: (VehicleMarker | FleetVehicle)[];
  riskZones?: RiskZone[];
  bridges?: BridgeMarker[];
  selectedIncident?: IncidentMarker | null;
  selectedVehicle?: (VehicleMarker | FleetVehicle) | null;
  selectedRoad?: RoadSegment | null;
  selectedBridge?: BridgeMarker | null;
  onSelectIncident?: (incident: IncidentMarker | null) => void;
  onSelectVehicle?: (vehicle: (VehicleMarker | FleetVehicle) | null) => void;
  onSelectRoad?: (road: RoadSegment | null) => void;
  onSelectBridge?: (bridge: BridgeMarker | null) => void;
  selectedStateFilter?: string;
  className?: string;
  showTitleBar?: boolean;
  title?: string;
  subtitle?: string;
  showLayerToggle?: boolean;
  highlightedDistrict?: string | null;
  activeCorridorId?: string | null;
  defaultBaseStyle?: MapBaseStyle;
}

/**
 * Re-designed VectorMap component:
 * Powered by keyless open GIS cartography (Carto Voyager / Positron / OSM / Topo)
 * with zero third-party API keys or token requirements.
 */
export const VectorMap: React.FC<VectorMapProps> = ({
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
  title = 'North Eastern Region GIS Operations Grid',
  subtitle = isMapTilerConfigured()
    ? 'MapTiler Cloud Cartography • Real-time Telemetry & Hazards'
    : 'Open GIS Basemap • Real-time Telemetry & Hazards',
  showLayerToggle = true,
  defaultBaseStyle = isMapTilerConfigured() ? 'maptiler-streets' : 'carto-voyager',
}) => {
  return (
    <GISMap
      roads={roads}
      incidents={incidents}
      vehicles={vehicles}
      riskZones={riskZones}
      bridges={bridges}
      selectedIncident={selectedIncident}
      selectedVehicle={selectedVehicle}
      selectedRoad={selectedRoad}
      selectedBridge={selectedBridge}
      onSelectIncident={onSelectIncident}
      onSelectVehicle={onSelectVehicle}
      onSelectRoad={onSelectRoad}
      onSelectBridge={onSelectBridge}
      selectedStateFilter={selectedStateFilter}
      className={className}
      showTitleBar={showTitleBar}
      title={title}
      subtitle={subtitle}
      showLayerToggle={showLayerToggle}
      defaultBaseStyle={defaultBaseStyle}
    />
  );
};
