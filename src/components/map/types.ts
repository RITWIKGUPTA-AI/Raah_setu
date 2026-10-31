import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  RiskZone,
  BridgeMarker,
  FleetVehicle,
} from '../../types';

export type MapBaseStyle =
  | 'carto-voyager'
  | 'carto-light'
  | 'osm'
  | 'topo'
  | 'carto-dark'
  | 'maptiler-streets'
  | 'maptiler-satellite'
  | 'maptiler-outdoor'
  | 'maptiler-dataviz'
  | 'maptiler-topo';

export interface MapLayerVisibility {
  roads: boolean;
  incidents: boolean;
  vehicles: boolean;
  riskZones: boolean;
  bridges: boolean;
  stateBoundaries: boolean;
}

export interface MapViewport {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface GISMapProps {
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
  defaultBaseStyle?: MapBaseStyle;
  initialCenter?: [number, number];
  initialZoom?: number;
  onViewportChange?: (viewport: MapViewport) => void;
  interactive?: boolean;
}
