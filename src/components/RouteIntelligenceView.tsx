import React, { useState } from 'react';
import {
  Route,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  FileText,
  Map as MapIcon,
} from 'lucide-react';
import { INITIAL_ROADS, INITIAL_INCIDENTS, INITIAL_RISK_ZONES, INITIAL_BRIDGES } from '../data/mockData';
import { RoadSegment } from '../types';
import { evaluateRoadCondition } from '../utils/roadConditions';
import { VectorMap } from './VectorMap';
import { MapErrorBoundary } from './MapErrorBoundary';

interface RouteIntelligenceViewProps {
  onSelectRouteOnMap?: (road: RoadSegment) => void;
}

export const RouteIntelligenceView: React.FC<RouteIntelligenceViewProps> = ({
  onSelectRouteOnMap,
}) => {
  const [roads] = useState<RoadSegment[]>(INITIAL_ROADS);
  const [selectedRoad, setSelectedRoad] = useState<RoadSegment>(INITIAL_ROADS[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'clear' | 'warning' | 'blocked'>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'map'>('details');

  const filteredRoads = roads.filter((r) => {
    if (filterStatus === 'all') return true;
    const cond = evaluateRoadCondition(r);
    return cond.condition === filterStatus;
  });

  const getStatusBadge = (road: RoadSegment) => {
    const cond = evaluateRoadCondition(road);
    switch (cond.condition) {
      case 'blocked':
        return { label: 'ROAD BLOCKED', class: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
      case 'warning':
        return { label: 'MODERATE RISK', class: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
      default:
        return { label: 'CLEAR & SAFE', class: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 shadow-2xs shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Route Intelligence
            </h1>
            <span className="inline-flex items-center rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200">
              Strategic Highway Corridors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-state arterial corridor diagnostics, load constraints, and bypass routing • Open GIS
          </p>
        </div>

        {/* Status Filters & View Toggle */}
        <div className="flex items-center space-x-3">
          {/* Status Pills */}
          <div className="hidden sm:flex items-center space-x-1.5">
            {[
              { id: 'all', label: 'All Corridors' },
              { id: 'clear', label: 'Clear & Safe' },
              { id: 'warning', label: 'Moderate Risk' },
              { id: 'blocked', label: 'Blocked / Critical' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterStatus(id as any)}
                className={`rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filterStatus === id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* View Tab Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 transition-colors ${
                activeTab === 'details'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Dossier</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 transition-colors ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-blue-600" />
              <span>GIS Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Corridor List */}
        <div className="lg:col-span-5 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
            <span>Arterial Corridors ({filteredRoads.length})</span>
            <span className="text-slate-400 font-mono">BRO &amp; NHIDCL</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredRoads.map((road) => {
              const statusBadge = getStatusBadge(road);
              const isSelected = selectedRoad?.id === road.id;

              return (
                <div
                  key={road.id}
                  onClick={() => setSelectedRoad(road)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-3 border-l-blue-600'
                      : 'hover:bg-slate-50 border-l-3 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {road.routeNumber}
                    </span>
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[10px] ${statusBadge.class}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-800 mt-1">
                    {road.name}
                  </h3>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {road.from} → {road.to}
                    </span>
                    <span className="font-mono">{road.lengthKm} km</span>
                  </div>

                  {/* Environmental & Traffic Telemetry */}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="rounded px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200/60 font-medium">
                      Env Risk: <b className="capitalize text-slate-900">{road.environmentRisk || 'Low'}</b>
                    </span>
                    <span className="rounded px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200/60 font-medium">
                      Traffic: <b className="capitalize text-slate-900">{road.trafficLevel || 'Normal'}</b>
                    </span>
                    {road.weatherCondition && (
                      <span className="rounded px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/60 truncate max-w-[180px]">
                        {road.weatherCondition}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 line-clamp-2 bg-slate-50 rounded p-1.5 border border-slate-100">
                    {road.conditionDetails}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Corridor Detailed Intelligence OR GIS Map View */}
        <div className="lg:col-span-7 bg-[#F8FAFC] flex flex-col overflow-hidden">
          {activeTab === 'map' ? (
            /* Interactive GIS Map View */
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <MapErrorBoundary componentName="RouteIntelligenceMap" className="h-full rounded-none border-0">
                <VectorMap
                  roads={roads}
                  incidents={INITIAL_INCIDENTS}
                  riskZones={INITIAL_RISK_ZONES}
                  bridges={INITIAL_BRIDGES}
                  selectedRoad={selectedRoad}
                  onSelectRoad={(road) => road && setSelectedRoad(road)}
                  title={`GIS Alignment: ${selectedRoad?.routeNumber || 'NER Corridors'}`}
                  subtitle="Open Vector Basemap • Real-time Alignment & Bottlenecks"
                  className="h-full rounded-none border-0"
                  showTitleBar={true}
                />
              </MapErrorBoundary>
            </div>
          ) : (
            /* Detailed Dossier View */
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedRoad ? (
                <>
                  {/* Corridor Banner */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="rounded bg-slate-900 text-white font-mono px-2 py-0.5 text-xs font-bold">
                          {selectedRoad.routeNumber}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900">
                          {selectedRoad.name}
                        </h2>
                      </div>
                      <button
                        onClick={() => setActiveTab('map')}
                        className="inline-flex items-center space-x-1 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Inspect on GIS Map</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
                      <div className="rounded bg-slate-50 p-2 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Span Length</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {selectedRoad.lengthKm} KM
                        </div>
                      </div>
                      <div className="rounded bg-slate-50 p-2 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Origin Terminus</span>
                        <div className="font-semibold text-slate-900 mt-0.5 truncate">
                          {selectedRoad.from}
                        </div>
                      </div>
                      <div className="rounded bg-slate-50 p-2 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Destination</span>
                        <div className="font-semibold text-slate-900 mt-0.5 truncate">
                          {selectedRoad.to}
                        </div>
                      </div>
                      <div className="rounded bg-slate-50 p-2 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Convoys Enroute</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {selectedRoad.affectedConvoys} Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Environmental & Road Condition Diagnostics */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                        <Route className="h-4 w-4 text-blue-600" />
                        <span>Road Condition &amp; Environmental Status</span>
                      </h3>
                      <span className={`px-2.5 py-1 rounded text-xs border ${getStatusBadge(selectedRoad).class}`}>
                        {getStatusBadge(selectedRoad).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Environment Risk</span>
                        <p className={`font-bold capitalize mt-0.5 text-sm ${
                          selectedRoad.environmentRisk === 'high' ? 'text-rose-600' : selectedRoad.environmentRisk === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {selectedRoad.environmentRisk || 'Low Risk'}
                        </p>
                        <span className="text-[10px] text-slate-400">Terrain & Geological Vulnerability</span>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Traffic Volume</span>
                        <p className="font-bold text-slate-900 capitalize mt-0.5 text-sm">
                          {selectedRoad.trafficLevel || 'Normal'}
                        </p>
                        <span className="text-[10px] text-slate-400">Sensors & Checkpoint Telemetry</span>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Live Weather</span>
                        <p className="font-semibold text-blue-900 mt-0.5 text-xs truncate">
                          {selectedRoad.weatherCondition || 'Clear Skies'}
                        </p>
                        <span className="text-[10px] text-slate-400">Updated {selectedRoad.lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Diagnostic Details */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Real-Time Condition &amp; Obstructions</span>
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded border border-amber-200/80">
                      {selectedRoad.conditionDetails}
                    </p>

                    {selectedRoad.detourRoute && (
                      <div className="rounded border border-blue-200 bg-blue-50/50 p-3 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                          Authorized Alternate Bypass Route
                        </span>
                        <p className="text-blue-800 font-medium">{selectedRoad.detourRoute}</p>
                      </div>
                    )}
                  </div>

                  {/* Strategic Logistics Parameters */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-slate-700" />
                      <span>Heavy Convoy Guidelines</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                          Max Axle Load Rating
                        </span>
                        <p className="font-mono text-slate-900 font-bold mt-0.5">Class 70R (Tracked) / 40 Ton</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Bailey bridges restricted to single vehicle crossing at 10 km/h</p>
                      </div>

                      <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                          Night Transit Protocol
                        </span>
                        <p className="font-mono text-slate-900 font-bold mt-0.5">Restricted: 20:00 – 05:00 IST</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Mandatory escort convoy staging at base checkposts</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                  Select a corridor from the left to view comprehensive intelligence.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
