import React from 'react';
import {
  AlertTriangle,
  Truck,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  RoadSegment,
  IncidentMarker,
  VehicleMarker,
  BridgeMarker,
  RiskZone,
  FleetVehicle,
} from '../../types';

export type PopupItem =
  | { type: 'road'; data: RoadSegment }
  | { type: 'incident'; data: IncidentMarker }
  | { type: 'vehicle'; data: VehicleMarker | FleetVehicle }
  | { type: 'bridge'; data: BridgeMarker }
  | { type: 'risk'; data: RiskZone };

import { evaluateRoadCondition } from '../../utils/roadConditions';

interface MapPopupProps {
  item: PopupItem;
  onClose: () => void;
  onAction?: (item: PopupItem) => void;
}

export const MapPopup: React.FC<MapPopupProps> = ({ item, onClose, onAction }) => {
  if (item.type === 'road') {
    const road = item.data;
    const evaluated = evaluateRoadCondition(road);
    const isBlocked = evaluated.isBlocked;
    const isWarning = evaluated.isWarning;

    return (
      <div className="w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-xs">
        <div
          className={`px-3.5 py-2.5 flex items-center justify-between text-white ${
            isBlocked ? 'bg-rose-700' : isWarning ? 'bg-amber-600' : 'bg-emerald-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-tight text-sm font-mono">{road.routeNumber}</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 tracking-wider">
              {evaluated.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3.5 space-y-2.5">
          <div>
            <div className="font-bold text-slate-900 text-xs">{road.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{road.from} → {road.to} {road.state ? `(${road.state})` : ''}</span>
            </div>
          </div>

          {/* Condition Matrix: Environment Risk, Traffic Level, Weather */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-slate-50 p-2 rounded border border-slate-100">
            <div className="text-center p-1 bg-white rounded border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase font-medium">Env Risk</span>
              <span className={`font-bold capitalize ${
                road.environmentRisk === 'high' ? 'text-rose-600' : road.environmentRisk === 'medium' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {road.environmentRisk || (isBlocked ? 'High' : isWarning ? 'Medium' : 'Low')}
              </span>
            </div>
            <div className="text-center p-1 bg-white rounded border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase font-medium">Traffic</span>
              <span className="font-bold text-slate-800 capitalize">
                {road.trafficLevel || 'Normal'}
              </span>
            </div>
            <div className="text-center p-1 bg-white rounded border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase font-medium">Length</span>
              <span className="font-bold text-slate-800 font-mono">
                {road.lengthKm} km
              </span>
            </div>
          </div>

          {road.weatherCondition && (
            <div className="text-[11px] text-slate-600 bg-blue-50/70 p-2 rounded border border-blue-100 flex items-start space-x-1.5">
              <span className="font-semibold text-blue-900 text-[10px] uppercase shrink-0">Weather:</span>
              <span className="text-blue-800 text-[11px] leading-tight">{road.weatherCondition}</span>
            </div>
          )}

          {road.conditionDetails && (
            <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
              {road.conditionDetails}
            </p>
          )}

          {road.detourRoute && (
            <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200/80 flex items-start space-x-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-semibold block text-[10px] uppercase text-amber-800">Detour Route:</span>
                <span className="text-[11px] text-amber-900 leading-tight">{road.detourRoute}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100">
            <span>Affected Convoys: <b className="text-slate-700">{road.affectedConvoys}</b></span>
            <span>Updated {road.lastUpdated}</span>
          </div>

          {onAction && (
            <button
              type="button"
              onClick={() => onAction(item)}
              className="w-full mt-2 py-1.5 px-2 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Inspect Corridor Telemetry</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (item.type === 'incident') {
    const inc = item.data;
    const isCritical = inc.severity === 'critical';
    const isHigh = inc.severity === 'high';

    return (
      <div className="w-72 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden text-xs">
        <div
          className={`px-3 py-2 flex items-center justify-between text-white ${
            isCritical ? 'bg-rose-700' : isHigh ? 'bg-amber-600' : 'bg-blue-700'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-bold tracking-tight text-xs uppercase">{inc.category}</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white/20">
              {inc.severity}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <div>
            <div className="font-semibold text-slate-900">{inc.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span>{inc.roadName} • {inc.district}, {inc.state}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
            {inc.description}
          </p>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{inc.verificationStatus === 'verified' ? 'Verified Intel' : 'Pending Verification'}</span>
            </span>
            <span className="font-mono">{inc.timestamp}</span>
          </div>

          {onAction && (
            <button
              type="button"
              onClick={() => onAction(item)}
              className="w-full mt-1 py-1.5 px-2 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Manage Emergency Response</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (item.type === 'vehicle') {
    const veh = item.data as any;

    return (
      <div className="w-72 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden text-xs">
        <div className="px-3 py-2 flex items-center justify-between text-white bg-slate-900">
          <div className="flex items-center space-x-1.5">
            <Truck className="h-4 w-4 text-blue-400" />
            <span className="font-bold tracking-tight text-xs">{veh.callsign || veh.registrationNumber || veh.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <div>
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>{veh.cargoDescription || veh.cargo || 'Relief Supplies'}</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded capitalize">
                {veh.status || 'Active'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Driver: {veh.driver || veh.driverName || 'Designated Driver'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Speed / ETA</span>
              <span className="font-semibold text-slate-800">
                {veh.currentSpeedKmH ? `${veh.currentSpeedKmH} km/h` : 'Moving'} • {veh.eta || 'On Schedule'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Destination</span>
              <span className="font-semibold text-slate-800 truncate block">
                {veh.destination || veh.destDistrict || 'Disaster Hub'}
              </span>
            </div>
          </div>

          {onAction && (
            <button
              type="button"
              onClick={() => onAction(item)}
              className="w-full mt-1 py-1.5 px-2 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>View Convoy Telemetry</span>
              <Radio className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (item.type === 'bridge') {
    const bridge = item.data;
    const isCritical = bridge.status === 'critical' || bridge.status === 'blocked';
    const isRestricted = bridge.status === 'restricted';

    return (
      <div className="w-72 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden text-xs">
        <div className={`px-3 py-2 flex items-center justify-between text-white ${
          isCritical ? 'bg-rose-700' : isRestricted ? 'bg-amber-600' : 'bg-slate-800'
        }`}>
          <div className="font-bold tracking-tight text-xs truncate pr-2">{bridge.name}</div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-0.5 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <div className="text-[11px] text-slate-500">
            Crossing: {bridge.river || bridge.riverCrossing || 'Regional River'} • {bridge.district}, {bridge.state}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Span Length</span>
              <span className="font-semibold text-slate-800">{bridge.lengthMeters} m</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Health Index</span>
              <span className="font-semibold text-slate-800">{bridge.structuralHealthScore}/100</span>
            </div>
          </div>

          {bridge.conditionDetails && (
            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
              {bridge.conditionDetails}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};
