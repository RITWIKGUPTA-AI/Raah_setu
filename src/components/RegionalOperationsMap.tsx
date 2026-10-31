import React, { useState } from 'react';
import { VectorMap, VectorMapProps } from './VectorMap';
import { MapErrorBoundary } from './MapErrorBoundary';
import { isMapTilerConfigured } from './map/mapProviders';
import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  RiskZone,
  BridgeMarker,
} from '../types';
import { INITIAL_BRIDGES } from '../data/mockData';

export interface RegionalOperationsMapProps {
  roads: RoadSegment[];
  incidents: IncidentMarker[];
  vehicles: VehicleMarker[];
  riskZones: RiskZone[];
  bridges?: BridgeMarker[];
  selectedIncident: IncidentMarker | null;
  selectedVehicle: VehicleMarker | null;
  selectedRoad: RoadSegment | null;
  selectedBridge?: BridgeMarker | null;
  onSelectIncident: (inc: IncidentMarker | null) => void;
  onSelectVehicle: (veh: VehicleMarker | null) => void;
  onSelectRoad: (road: RoadSegment | null) => void;
  onSelectBridge?: (bridge: BridgeMarker | null) => void;
  selectedStateFilter: string;
  className?: string;
  showTitleBar?: boolean;
}

export const RegionalOperationsMap: React.FC<RegionalOperationsMapProps> = ({
  roads,
  incidents,
  vehicles,
  riskZones,
  bridges = INITIAL_BRIDGES,
  selectedIncident,
  selectedVehicle,
  selectedRoad,
  selectedBridge = null,
  onSelectIncident,
  onSelectVehicle,
  onSelectRoad,
  onSelectBridge,
  selectedStateFilter,
  className = 'h-full w-full',
  showTitleBar = true,
}) => {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <MapErrorBoundary
      key={`regional-map-boundary-${retryCount}`}
      componentName="RegionalOperationsMap"
      className={className}
      onReset={() => {
        console.info('[RegionalOperationsMap] Initiating clean map component re-mount.');
        setRetryCount((prev) => prev + 1);
      }}
    >
      <VectorMap
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
        title="Regional Operations"
        subtitle={
          isMapTilerConfigured()
            ? 'GIS Tactical Grid (1:250K) • MapTiler Cloud Cartography'
            : 'GIS Tactical Grid (1:250K) • Open GIS Basemap'
        }
        showLayerToggle={true}
      />
    </MapErrorBoundary>
  );
};

