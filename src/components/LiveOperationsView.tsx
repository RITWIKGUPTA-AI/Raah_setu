import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  Radio,
  Clock,
  MapPin,
  ChevronRight,
  Shield,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  ExternalLink,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { RegionalOperationsMap } from './RegionalOperationsMap';
import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  RiskZone,
  BridgeMarker,
  LiveEventItem
} from '../types';
import {
  INITIAL_ROADS,
  INITIAL_INCIDENTS,
  INITIAL_VEHICLES,
  INITIAL_RISK_ZONES,
  INITIAL_BRIDGES,
  INITIAL_LIVE_EVENTS,
  NER_LOCATIONS
} from '../data/mockData';

interface LiveOperationsViewProps {
  onSelectIncidentDetail?: (incident: IncidentMarker) => void;
  onSelectVehicleDetail?: (vehicle: VehicleMarker) => void;
  onSelectRoadDetail?: (road: RoadSegment) => void;
  onSelectBridgeDetail?: (bridge: BridgeMarker) => void;
}

export const LiveOperationsView: React.FC<LiveOperationsViewProps> = ({
  onSelectIncidentDetail,
  onSelectVehicleDetail,
  onSelectRoadDetail,
  onSelectBridgeDetail,
}) => {
  // Filter States
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedRoadStatus, setSelectedRoadStatus] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedVehicleStatus, setSelectedVehicleStatus] = useState('all');
  const [selectedIncidentType, setSelectedIncidentType] = useState('all');
  const [searchLocation, setSearchLocation] = useState('');

  // Floating Panel Visibility
  const [isEventsPanelOpen, setIsEventsPanelOpen] = useState(true);

  // Selected Entity on Map
  const [selectedIncident, setSelectedIncident] = useState<IncidentMarker | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleMarker | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadSegment | null>(null);
  const [selectedBridge, setSelectedBridge] = useState<BridgeMarker | null>(null);

  // Selected Live Event item from panel
  const [selectedLiveEvent, setSelectedLiveEvent] = useState<LiveEventItem | null>(null);

  const statesList = [
    'Assam',
    'Arunachal Pradesh',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura',
  ];

  // Derive available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'all') {
      const allDists = Array.from(new Set(NER_LOCATIONS.map((loc) => loc.district))).sort();
      return allDists;
    }
    const stateDists = NER_LOCATIONS.filter(
      (loc) => loc.state.toLowerCase() === selectedState.toLowerCase()
    ).map((loc) => loc.district);
    return Array.from(new Set(stateDists)).sort();
  }, [selectedState]);

  // Filtered Roads
  const filteredRoads = useMemo(() => {
    return INITIAL_ROADS.filter((road) => {
      if (selectedState !== 'all' && road.state && road.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (selectedRoadStatus !== 'all' && road.status !== selectedRoadStatus) {
        return false;
      }
      if (searchLocation) {
        const query = searchLocation.toLowerCase();
        const matchesName = road.name.toLowerCase().includes(query);
        const matchesRoute = road.routeNumber.toLowerCase().includes(query);
        const matchesFromTo = road.from.toLowerCase().includes(query) || road.to.toLowerCase().includes(query);
        if (!matchesName && !matchesRoute && !matchesFromTo) return false;
      }
      return true;
    });
  }, [selectedState, selectedRoadStatus, searchLocation]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return INITIAL_INCIDENTS.filter((inc) => {
      if (selectedState !== 'all' && inc.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (selectedDistrict !== 'all' && inc.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedRiskLevel !== 'all' && inc.severity.toLowerCase() !== selectedRiskLevel.toLowerCase()) {
        return false;
      }
      if (selectedIncidentType !== 'all') {
        const matchesType = inc.category.toLowerCase() === selectedIncidentType.toLowerCase();
        const matchesDesc = inc.title.toLowerCase().includes(selectedIncidentType.toLowerCase());
        if (!matchesType && !matchesDesc) return false;
      }
      if (searchLocation) {
        const query = searchLocation.toLowerCase();
        const matchesLoc = `${inc.district} ${inc.state}`.toLowerCase().includes(query);
        const matchesRoad = inc.roadName.toLowerCase().includes(query);
        const matchesTitle = inc.title.toLowerCase().includes(query);
        if (!matchesLoc && !matchesRoad && !matchesTitle) return false;
      }
      return true;
    });
  }, [selectedState, selectedDistrict, selectedRiskLevel, selectedIncidentType, searchLocation]);

  // Filtered Vehicles
  const filteredVehicles = useMemo(() => {
    return INITIAL_VEHICLES.filter((veh) => {
      if (selectedVehicleStatus !== 'all') {
        if (selectedVehicleStatus === 'active' && veh.status !== 'moving' && veh.status !== 'rerouting') return false;
        if (selectedVehicleStatus === 'delayed' && veh.status !== 'delayed') return false;
        if (selectedVehicleStatus === 'halted' && veh.status !== 'halted') return false;
      }
      if (searchLocation) {
        const query = searchLocation.toLowerCase();
        const matchesCallsign = veh.callsign.toLowerCase().includes(query);
        const matchesRoute = veh.assignedHighway.toLowerCase().includes(query);
        const matchesDest = veh.destination.toLowerCase().includes(query);
        if (!matchesCallsign && !matchesRoute && !matchesDest) return false;
      }
      return true;
    });
  }, [selectedVehicleStatus, searchLocation]);

  // Filtered Bridges
  const filteredBridges = useMemo(() => {
    return INITIAL_BRIDGES.filter((b) => {
      if (selectedState !== 'all' && b.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (searchLocation) {
        const query = searchLocation.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(query);
        const matchesRiver = (b.river || b.riverCrossing || '').toLowerCase().includes(query);
        if (!matchesName && !matchesRiver) return false;
      }
      return true;
    });
  }, [selectedState, searchLocation]);

  // Filtered Live Events
  const filteredLiveEvents = useMemo(() => {
    return INITIAL_LIVE_EVENTS.filter((ev) => {
      if (selectedState !== 'all' && ev.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (selectedDistrict !== 'all' && ev.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedRiskLevel !== 'all' && ev.severity.toLowerCase() !== selectedRiskLevel.toLowerCase()) {
        return false;
      }
      if (searchLocation) {
        const query = searchLocation.toLowerCase();
        const matchesLoc = ev.location.toLowerCase().includes(query);
        const matchesType = ev.eventType.toLowerCase().includes(query);
        if (!matchesLoc && !matchesType) return false;
      }
      return true;
    });
  }, [selectedState, selectedDistrict, selectedRiskLevel, searchLocation]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedState('all');
    setSelectedDistrict('all');
    setSelectedRoadStatus('all');
    setSelectedRiskLevel('all');
    setSelectedVehicleStatus('all');
    setSelectedIncidentType('all');
    setSearchLocation('');
  };

  const hasActiveFilters =
    selectedState !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedRoadStatus !== 'all' ||
    selectedRiskLevel !== 'all' ||
    selectedVehicleStatus !== 'all' ||
    selectedIncidentType !== 'all' ||
    searchLocation !== '';

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleSelectMapIncident = (inc: IncidentMarker | null) => {
    setSelectedIncident(inc);
    setSelectedVehicle(null);
    setSelectedRoad(null);
    setSelectedBridge(null);

    // If an incident was selected, ensure events panel is open to display details
    if (inc) {
      setIsEventsPanelOpen(true);
      // Link to corresponding live event if available
      const matchedEvent = INITIAL_LIVE_EVENTS.find((e) => e.incidentId === inc.id);
      if (matchedEvent) {
        setSelectedLiveEvent(matchedEvent);
      } else {
        setSelectedLiveEvent(null);
      }
    } else {
      setSelectedLiveEvent(null);
    }
  };

  const handleSelectLiveEventCard = (ev: LiveEventItem) => {
    setSelectedLiveEvent(ev);
    if (ev.incidentId) {
      const match = INITIAL_INCIDENTS.find((i) => i.id === ev.incidentId);
      if (match) {
        setSelectedIncident(match);
        return;
      }
    }
  };

  return (
    <div id="live-operations-page" className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
      {/* PAGE HEADER */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5 shrink-0 select-none">
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
            Live Operations
          </h1>
          <p className="text-xs text-slate-500 leading-tight">
            Real-time regional accessibility and transport monitoring
          </p>
        </div>

        {/* Quick summary indicators */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Open Roads:</span>
            <strong className="text-slate-900">{filteredRoads.filter((r) => r.status === 'open').length}</strong>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-600">Blocked:</span>
            <strong className="text-rose-700">{filteredRoads.filter((r) => r.status === 'blocked').length}</strong>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-600">Active Units:</span>
            <strong className="text-slate-900">{filteredVehicles.length}</strong>
          </div>
        </div>
      </div>

      {/* TOP FILTER BAR */}
      <div className="border-b border-slate-200 bg-white px-5 py-2.5 shrink-0 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* State Selector */}
          <div className="flex items-center">
            <select
              id="filter-state-select"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('all');
              }}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All States (NER)</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="flex items-center">
            <select
              id="filter-district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All Districts</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Road Status */}
          <div className="flex items-center">
            <select
              id="filter-road-status-select"
              value={selectedRoadStatus}
              onChange={(e) => setSelectedRoadStatus(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">Road Status: All</option>
              <option value="open">Open Network</option>
              <option value="restricted">Restricted Passage</option>
              <option value="blocked">Blocked / Closed</option>
            </select>
          </div>

          {/* Risk Level */}
          <div className="flex items-center">
            <select
              id="filter-risk-level-select"
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">Risk Level: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="warning">Warning</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Vehicle */}
          <div className="flex items-center">
            <select
              id="filter-vehicle-status-select"
              value={selectedVehicleStatus}
              onChange={(e) => setSelectedVehicleStatus(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">Vehicles: All</option>
              <option value="active">Active In-Transit</option>
              <option value="delayed">Delayed Units</option>
              <option value="halted">Halted</option>
            </select>
          </div>

          {/* Incident Type */}
          <div className="flex items-center">
            <select
              id="filter-incident-type-select"
              value={selectedIncidentType}
              onChange={(e) => setSelectedIncidentType(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">Incidents: All</option>
              <option value="landslide">Landslide</option>
              <option value="flood">Flood / Surge</option>
              <option value="structural">Bridge / Structural</option>
              <option value="breakdown">Vehicle Breakdown</option>
              <option value="weather">Heavy Weather</option>
            </select>
          </div>

          {/* Search location */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="live-ops-search-input"
              type="text"
              placeholder="Search location, road, convoy..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            {searchLocation && (
              <button
                onClick={() => setSearchLocation('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex h-8 items-center space-x-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <X className="h-3 w-3 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          {/* Panel Toggle Button */}
          <button
            id="toggle-live-events-panel-btn"
            onClick={() => setIsEventsPanelOpen(!isEventsPanelOpen)}
            className={`ml-auto flex h-8 items-center space-x-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors ${
              isEventsPanelOpen
                ? 'border-blue-300 bg-blue-50 text-blue-900'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-blue-600" />
            <span>Live Events</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: Dominant GIS Map + Floating Right Panel */}
      <div className="relative flex-1 overflow-hidden p-3.5 flex flex-col min-h-[480px]">
        {/* Full-bleed GIS map */}
        <div className="h-full w-full flex-1 relative min-h-[450px]">
          <RegionalOperationsMap
            className="h-full w-full"
            roads={filteredRoads}
            incidents={filteredIncidents}
            vehicles={filteredVehicles}
            riskZones={INITIAL_RISK_ZONES}
            bridges={filteredBridges}
            selectedIncident={selectedIncident}
            selectedVehicle={selectedVehicle}
            selectedRoad={selectedRoad}
            selectedBridge={selectedBridge}
            onSelectIncident={handleSelectMapIncident}
            onSelectVehicle={(veh) => {
              setSelectedVehicle(veh);
              setSelectedIncident(null);
              setSelectedRoad(null);
              setSelectedBridge(null);
              if (veh && onSelectVehicleDetail) onSelectVehicleDetail(veh);
            }}
            onSelectRoad={(road) => {
              setSelectedRoad(road);
              setSelectedIncident(null);
              setSelectedVehicle(null);
              setSelectedBridge(null);
              if (road && onSelectRoadDetail) onSelectRoadDetail(road);
            }}
            onSelectBridge={(bridge) => {
              setSelectedBridge(bridge);
              setSelectedIncident(null);
              setSelectedVehicle(null);
              setSelectedRoad(null);
              if (bridge && onSelectBridgeDetail) onSelectBridgeDetail(bridge);
            }}
            selectedStateFilter={selectedState}
            showTitleBar={false}
          />
        </div>

        {/* RIGHT SIDE FLOATING PANEL: "Live Events" */}
        {isEventsPanelOpen && (
          <div
            id="live-events-floating-panel"
            className="absolute right-6 top-6 bottom-6 w-84 max-w-[calc(100%-3rem)] flex flex-col rounded-lg border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xl overflow-hidden z-20"
          >
            {/* Panel Header */}
            <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3.5 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-bold tracking-wide text-slate-900 uppercase">
                  Live Events
                </span>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.2 text-[10px] font-semibold text-slate-700">
                  {filteredLiveEvents.length}
                </span>
              </div>
              <button
                onClick={() => setIsEventsPanelOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-700"
                title="Collapse Panel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* When an incident is selected on the map, show the detailed Inspector Card */}
            {selectedIncident ? (
              <div className="border-b border-slate-200 bg-blue-50/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-700 uppercase">
                    {selectedIncident.code} • {selectedIncident.severity}
                  </span>
                  <button
                    onClick={() => handleSelectMapIncident(null)}
                    className="text-[10px] font-medium text-slate-500 hover:text-slate-800"
                  >
                    Close Inspect
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {selectedIncident.title}
                  </h4>
                  <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-600">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>
                      {selectedIncident.district}, {selectedIncident.state} ({selectedIncident.roadName})
                    </span>
                  </div>
                </div>

                {/* Details Grid: Location, Incident type, Status, Risk score, Last update */}
                <div className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-2.5 text-[11px] font-mono shadow-2xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase">Incident Type</span>
                    <div className="font-semibold text-slate-800 capitalize">
                      {selectedIncident.category}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase">Status</span>
                    <div className="font-semibold text-rose-700 capitalize">
                      {selectedIncident.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase">Risk Score</span>
                    <div className="font-semibold text-slate-900">
                      {selectedIncident.severity === 'critical' ? '94/100' : '78/100'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase">Last Update</span>
                    <div className="font-semibold text-slate-600">
                      {selectedIncident.timestamp}
                    </div>
                  </div>
                </div>

                {/* View Incident Button */}
                <button
                  id="view-incident-modal-btn"
                  onClick={() => {
                    if (onSelectIncidentDetail) {
                      onSelectIncidentDetail(selectedIncident);
                    }
                  }}
                  className="flex w-full items-center justify-center space-x-1.5 rounded-md border border-blue-600 bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors"
                >
                  <span>View Incident Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            {/* List of Recent Live Events */}
            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
              <div className="px-3.5 py-1.5 bg-slate-50/50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Recent Regional Events
              </div>
              {filteredLiveEvents.map((ev) => {
                const badgeClass = getSeverityBadge(ev.severity);
                const isSelected = selectedLiveEvent?.id === ev.id || selectedIncident?.id === ev.incidentId;

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleSelectLiveEventCard(ev)}
                    className={`cursor-pointer px-3.5 py-2.5 transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-3 border-l-blue-600'
                        : 'hover:bg-slate-50 border-l-3 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${badgeClass}`}
                      >
                        {ev.severity}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {ev.time}
                      </span>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                      {ev.eventType}
                    </div>

                    <div className="mt-0.5 flex items-center space-x-1 text-[11px] text-slate-600 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{ev.location}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Status: {ev.status}</span>
                      {ev.riskScore && <span>Risk: {ev.riskScore}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
