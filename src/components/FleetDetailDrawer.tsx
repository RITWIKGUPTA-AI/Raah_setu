import React from 'react';
import {
  X,
  MapPin,
  Route as RouteIcon,
  Package,
  Clock,
  Gauge,
  AlertOctagon,
  ShieldCheck,
  Radio,
  User,
  Phone,
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { FleetVehicle } from '../types';

interface FleetDetailDrawerProps {
  vehicle: FleetVehicle | null;
  onClose: () => void;
  onFocusOnMap?: (vehicle: FleetVehicle) => void;
}

export const FleetDetailDrawer: React.FC<FleetDetailDrawerProps> = ({
  vehicle,
  onClose,
  onFocusOnMap,
}) => {
  if (!vehicle) return null;

  const isMoving = vehicle.status === 'moving';
  const isDelayed = vehicle.status === 'delayed';
  const isAtRisk = vehicle.status === 'at-risk';

  const statusBadgeColor = isMoving
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : isDelayed
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-rose-700 bg-rose-50 border-rose-200';

  const statusDotColor = isMoving
    ? 'bg-emerald-500'
    : isDelayed
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const riskBadgeColor =
    vehicle.risk === 'Critical' || vehicle.risk === 'High'
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : vehicle.risk === 'Medium'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div
      id="fleet-detail-drawer"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-in-out"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4">
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${statusBadgeColor}`}
          >
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold text-slate-900 tracking-tight">
                {vehicle.id}
              </span>
              <span
                className={`inline-flex items-center space-x-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold ${statusBadgeColor}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor} ${isAtRisk ? 'animate-ping' : ''}`} />
                <span>{vehicle.statusLabel}</span>
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {vehicle.callsign || 'Essential Transport Convoy'}
            </div>
          </div>
        </div>

        <button
          id="close-fleet-drawer-btn"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          title="Close Drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Origin to Destination Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Transit Corridor
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Origin</div>
              <div className="text-sm font-bold text-slate-900">{vehicle.origin}</div>
            </div>
            <div className="flex flex-col items-center px-3">
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-blue-600 font-mono font-medium">LIVE</span>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">Destination</div>
              <div className="text-sm font-bold text-slate-900">{vehicle.destination}</div>
            </div>
          </div>
        </div>

        {/* Operational Attributes Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Current Location */}
          <div className="col-span-2 rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Current Location</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 font-mono">
              {vehicle.currentLocation}
            </div>
            {vehicle.state && (
              <div className="text-xs text-slate-500 mt-0.5">{vehicle.state} Sector</div>
            )}
          </div>

          {/* Route */}
          <div className="col-span-2 rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <RouteIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Designated Route</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 leading-relaxed">
              {vehicle.route}
            </div>
          </div>

          {/* Cargo */}
          <div className="col-span-2 rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <Package className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>Cargo</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {vehicle.cargo}
            </div>
            {vehicle.cargoDetails && (
              <div className="text-xs text-slate-500 mt-0.5">
                {vehicle.cargoDetails}
              </div>
            )}
          </div>

          {/* ETA */}
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>ETA</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {vehicle.eta}
            </div>
          </div>

          {/* Speed */}
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <Gauge className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Speed</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {vehicle.speed}
            </div>
          </div>

          {/* Delay */}
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <AlertOctagon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Delay</span>
            </div>
            <div className={`text-sm font-bold font-mono ${vehicle.delay.includes('None') ? 'text-slate-900' : 'text-amber-700'}`}>
              {vehicle.delay}
            </div>
          </div>

          {/* Risk */}
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${riskBadgeColor}`}>
                {vehicle.risk}
              </span>
            </div>
          </div>

          {/* Risk Details */}
          {vehicle.riskDetails && (
            <div className="col-span-2 rounded-lg border border-slate-200 p-3 bg-slate-50/70">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Risk Advisory Note
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                {vehicle.riskDetails}
              </div>
            </div>
          )}

          {/* Last GPS Update */}
          <div className="col-span-2 rounded-lg border border-slate-200 p-3 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xs font-medium text-slate-500">Last GPS Update</div>
                <div className="text-xs font-mono font-semibold text-slate-900">
                  {vehicle.lastGpsUpdate}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>SATCOM LOCKED</span>
            </span>
          </div>
        </div>

        {/* Driver / Crew Dispatch info */}
        {vehicle.driverName && (
          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Personnel
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{vehicle.driverName}</div>
                  <div className="text-[11px] text-slate-500">Convoy Pilot Operator</div>
                </div>
              </div>
              {vehicle.driverPhone && (
                <a
                  href={`tel:${vehicle.driverPhone}`}
                  className="inline-flex items-center space-x-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 bg-slate-50/80 p-4 space-y-2">
        {onFocusOnMap && (
          <button
            id="focus-map-btn"
            onClick={() => onFocusOnMap(vehicle)}
            className="flex w-full items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Center on Live GIS Map</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
