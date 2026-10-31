import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
} from 'lucide-react';
import { FleetVehicle, RoadSegment } from '../types';
import { INITIAL_FLEET_VEHICLES } from '../data/mockFleetLogisticsData';
import { INITIAL_ROADS, INITIAL_RISK_ZONES } from '../data/mockData';
import { FleetDetailDrawer } from './FleetDetailDrawer';
import { VectorMap } from './VectorMap';
import { MapErrorBoundary } from './MapErrorBoundary';

export const FleetTrackingView: React.FC = () => {
  const [vehicles] = useState<FleetVehicle[]>(INITIAL_FLEET_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'moving' | 'delayed' | 'at-risk'>('all');

  // Filtered vehicles for the right-side list
  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      v.id.toLowerCase().includes(query) ||
      v.cargo.toLowerCase().includes(query) ||
      v.origin.toLowerCase().includes(query) ||
      v.destination.toLowerCase().includes(query) ||
      v.route.toLowerCase().includes(query) ||
      v.statusLabel.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const handleFocusOnMap = (vehicle: FleetVehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div id="fleet-tracking-page" className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      {/* PAGE HEADER */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Fleet Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live movement of essential supply vehicles • Real-time GPS Telemetry
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 font-mono font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ISRO NavIC GPS FEED ACTIVE</span>
            </span>
          </div>
        </div>

        {/* TOP: 4 compact metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* 428 Active */}
          <div
            id="metric-fleet-active"
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs"
          >
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
              428
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5 flex items-center justify-between">
              <span>Active</span>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          {/* 23 Delayed */}
          <div
            id="metric-fleet-delayed"
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs"
          >
            <div className="text-2xl font-black font-mono tracking-tight text-amber-600">
              23
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5 flex items-center justify-between">
              <span>Delayed</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </div>

          {/* 12 At Risk */}
          <div
            id="metric-fleet-at-risk"
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs"
          >
            <div className="text-2xl font-black font-mono tracking-tight text-rose-600">
              12
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5 flex items-center justify-between">
              <span>At Risk</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
          </div>

          {/* 96% On Route */}
          <div
            id="metric-fleet-on-route"
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs"
          >
            <div className="text-2xl font-black font-mono tracking-tight text-emerald-600">
              96%
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5 flex items-center justify-between">
              <span>On Route</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN: Split layout (LEFT: Large live GIS map | RIGHT: Compact vehicle list) */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Large live GIS map */}
        <div className="flex-1 relative overflow-hidden flex flex-col min-h-[400px]">
          <MapErrorBoundary componentName="FleetTrackingMap" className="h-full rounded-none border-0 border-r border-slate-200">
            <VectorMap
              roads={INITIAL_ROADS}
              vehicles={filteredVehicles}
              riskZones={INITIAL_RISK_ZONES}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={(veh) => setSelectedVehicle(veh as FleetVehicle)}
              title="Active Fleet Corridors & GPS Tracking"
              subtitle="Open Vector Basemap • High-precision Vehicle Coordinates"
              className="h-full rounded-none border-0 border-r border-slate-200"
              showTitleBar={true}
            />
          </MapErrorBoundary>
        </div>

        {/* RIGHT: Compact vehicle list */}
        <div className="flex w-full lg:w-[410px] xl:w-[440px] flex-col border-t lg:border-t-0 border-slate-200 bg-white">
          {/* Search & Status Filters */}
          <div className="border-b border-slate-200 p-3.5 space-y-2.5 bg-slate-50/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="search-fleet-input"
                type="text"
                placeholder="Search Vehicle ID, cargo, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1">
              {[
                { id: 'all', label: 'All', count: vehicles.length },
                {
                  id: 'moving',
                  label: 'Moving',
                  count: vehicles.filter((v) => v.status === 'moving').length,
                  badge: 'text-emerald-700 bg-emerald-50',
                },
                {
                  id: 'delayed',
                  label: 'Delayed',
                  count: vehicles.filter((v) => v.status === 'delayed').length,
                  badge: 'text-amber-700 bg-amber-50',
                },
                {
                  id: 'at-risk',
                  label: 'At Risk',
                  count: vehicles.filter((v) => v.status === 'at-risk').length,
                  badge: 'text-rose-700 bg-rose-50',
                },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded px-1 text-[10px] font-mono ${
                        isActive
                          ? 'bg-slate-800 text-slate-200'
                          : tab.badge || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Vehicle List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredVehicles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No vehicles found matching current filter or search criteria.
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isSelected = selectedVehicle?.id === v.id;
                const isMoving = v.status === 'moving';
                const isDelayed = v.status === 'delayed';
                const isAtRisk = v.status === 'at-risk';

                const statusBadgeStyle = isMoving
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : isDelayed
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200';

                const statusDot = isMoving
                  ? 'bg-emerald-500'
                  : isDelayed
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

                return (
                  <div
                    key={v.id}
                    id={`vehicle-card-${v.id}`}
                    onClick={() => {
                      setSelectedVehicle(v);
                      handleFocusOnMap(v);
                    }}
                    className={`group cursor-pointer rounded-lg border p-3 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Top Row: Vehicle ID & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                          {v.id}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {v.cargo}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center space-x-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${statusBadgeStyle}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDot} ${
                            isAtRisk ? 'animate-ping' : ''
                          }`}
                        />
                        <span>{v.statusLabel}</span>
                      </span>
                    </div>

                    {/* Middle Row: Origin -> Destination */}
                    <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-700 font-medium">
                      <span className="text-slate-900 font-semibold">{v.origin}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-900 font-semibold">{v.destination}</span>
                    </div>

                    {/* Bottom Row: ETA & Current Details */}
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      <span className="font-semibold text-slate-800">{v.eta}</span>
                      <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                        Click for Details →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* CLICK VEHICLE: Right-side Detail Drawer */}
      <FleetDetailDrawer
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onFocusOnMap={handleFocusOnMap}
      />
    </div>
  );
};
