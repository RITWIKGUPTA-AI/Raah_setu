import React from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Package,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DistrictMonitoringItem } from '../types';

interface DistrictDetailDrawerProps {
  district: DistrictMonitoringItem | null;
  onClose: () => void;
  onNavigateToLiveOps?: (district: DistrictMonitoringItem) => void;
}

export const DistrictDetailDrawer: React.FC<DistrictDetailDrawerProps> = ({
  district,
  onClose,
  onNavigateToLiveOps,
}) => {
  if (!district) return null;

  const getConnectivityBadge = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Optimal' };
    if (score >= 75) return { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Moderate' };
    if (score >= 55) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Restricted' };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Critical' };
  };

  const getSupplyBadge = (status: string) => {
    switch (status) {
      case 'Stable':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Constrained':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Critical Shortage':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const badge = getConnectivityBadge(district.connectivityScore);

  return (
    <aside
      id="district-detail-drawer"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col select-none animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5 shrink-0 bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-tight">
              District Overview
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              {district.district} • {district.state}
            </p>
          </div>
        </div>
        <button
          id="close-district-drawer-btn"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* District Name & Connectivity Score */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Jurisdiction
              </span>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {district.district}
              </div>
              <span className="font-mono text-xs text-slate-500">{district.state} State</span>
            </div>

            <div className="text-right">
              <div
                className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-sm font-bold ${badge.bg}`}
              >
                {district.connectivityScore}%
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                {badge.text} Status
              </div>
            </div>
          </div>

          {/* Micro Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${
                district.connectivityScore >= 90
                  ? 'bg-emerald-600'
                  : district.connectivityScore >= 75
                  ? 'bg-blue-600'
                  : district.connectivityScore >= 55
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
              style={{ width: `${district.connectivityScore}%` }}
            />
          </div>
        </div>

        {/* Small Schematic Map Preview */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Sector Map Preview
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Schematic GIS Node
            </span>
          </div>

          <div className="relative h-28 w-full rounded border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* SVG Roads and District Schematic */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 120">
              {/* Road arteries */}
              <line x1="20" y1="60" x2="280" y2="60" stroke="#475569" strokeWidth="3" />
              <line x1="150" y1="10" x2="150" y2="110" stroke="#475569" strokeWidth="3" />
              <line x1="60" y1="20" x2="240" y2="100" stroke="#334155" strokeWidth="2" strokeDasharray="4" />

              {/* Open Roads Lines in Emerald */}
              <line x1="20" y1="60" x2="150" y2="60" stroke="#10b981" strokeWidth="3.5" />
              {district.blockedRoadsCount === 0 && (
                <line x1="150" y1="60" x2="280" y2="60" stroke="#10b981" strokeWidth="3.5" />
              )}
              {district.blockedRoadsCount > 0 && (
                <>
                  <line x1="150" y1="60" x2="280" y2="60" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="4 2" />
                  {/* Blocked Marker */}
                  <circle cx="215" cy="60" r="6" fill="#ef4444" />
                  <text x="215" y="75" fill="#f87171" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    BLOCKED
                  </text>
                </>
              )}

              {/* Center District Hub Marker */}
              <circle cx="150" cy="60" r="7" fill="#38bdf8" />
              <circle cx="150" cy="60" r="14" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
              <text x="150" y="45" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
                {district.district.split(' ')[0]}
              </text>
            </svg>

            <div className="absolute bottom-1.5 left-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 rounded">
              GPS: {district.mapCoordinates[0] * 10}m, {district.mapCoordinates[1] * 10}m
            </div>
          </div>
        </div>

        {/* Open Roads & Blocked Roads */}
        <div className="grid grid-cols-2 gap-2">
          {/* Open Roads */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-emerald-900 font-semibold text-xs">
              <span>Open Roads</span>
              <span className="font-mono font-bold text-sm">
                {district.openRoads} / {district.totalRoads}
              </span>
            </div>
            <ul className="space-y-0.5 text-[11px] text-emerald-800">
              {district.openRoadsList.slice(0, 3).map((r, i) => (
                <li key={i} className="truncate font-mono">
                  • {r.split('(')[0]}
                </li>
              ))}
            </ul>
          </div>

          {/* Blocked Roads */}
          <div
            className={`rounded-md border p-2.5 space-y-1 ${
              district.blockedRoadsCount > 0
                ? 'border-rose-200 bg-rose-50/50 text-rose-900'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between font-semibold text-xs">
              <span>Blocked Roads</span>
              <span className="font-mono font-bold text-sm">
                {district.blockedRoadsCount}
              </span>
            </div>
            {district.blockedRoadsCount > 0 ? (
              <ul className="space-y-0.5 text-[11px] text-rose-800">
                {district.blockedRoads.slice(0, 2).map((b, i) => (
                  <li key={i} className="truncate font-mono">
                    • {b.split('–')[0]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-500">All gazetted roads open</p>
            )}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Incidents ({district.activeIncidentsCount})
            </span>
            {district.activeIncidentsCount > 0 && (
              <span className="rounded bg-rose-100 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-rose-800">
                Action Required
              </span>
            )}
          </div>

          {district.incidentDetails.length > 0 ? (
            <div className="space-y-1.5">
              {district.incidentDetails.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded border border-slate-100 bg-slate-50/70 p-2 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{inc.title}</span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-1 rounded ${
                        inc.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Route: {inc.road}</span>
                    <span>{inc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-slate-400 text-xs">
              No active incidents reported in this district.
            </div>
          )}
        </div>

        {/* Vehicles Active */}
        <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Truck className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Logistics Vehicles ({district.activeVehiclesCount})
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Live Transits
            </span>
          </div>

          <div className="space-y-1.5">
            {district.vehiclesList.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/60 p-2 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">
                    {v.callsign}
                  </span>
                  <div className="text-[11px] text-slate-500">{v.cargo}</div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="font-semibold text-slate-700">{v.status}</span>
                  <div className="text-slate-400 text-[10px]">{v.eta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supply Deliveries */}
        <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Package className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Supply Deliveries Status
              </span>
            </div>
            <span
              className={`rounded border px-1.5 py-0.2 font-mono text-[10px] font-bold ${getSupplyBadge(
                district.supplyStatus
              )}`}
            >
              {district.supplyStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded bg-slate-50 p-2">
              <span className="text-slate-500 font-semibold block">Medicines</span>
              <span className="font-mono text-slate-800">
                {district.supplyDeliveries.medicines}
              </span>
            </div>
            <div className="rounded bg-slate-50 p-2">
              <span className="text-slate-500 font-semibold block">Food Grains</span>
              <span className="font-mono text-slate-800">
                {district.supplyDeliveries.foodGrains}
              </span>
            </div>
            <div className="rounded bg-slate-50 p-2">
              <span className="text-slate-500 font-semibold block">Fuel & POL</span>
              <span className="font-mono text-slate-800">
                {district.supplyDeliveries.fuelPOL}
              </span>
            </div>
            <div className="rounded bg-slate-50 p-2">
              <span className="text-slate-500 font-semibold block">Relief Supplies</span>
              <span className="font-mono text-slate-800">
                {district.supplyDeliveries.reliefSupplies}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Telemetry */}
        <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <CloudRain className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Meteorological Telemetry
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900">
              {district.weather.temp}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            {district.weather.condition}
          </p>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
            <span>24h Rain: {district.weather.rainfall24h}</span>
            <span>Wind: {district.weather.wind}</span>
          </div>
          {district.weather.warningAlert && (
            <div className="rounded border border-amber-200 bg-amber-50 p-1.5 text-[11px] text-amber-900 font-medium">
              ⚠ {district.weather.warningAlert}
            </div>
          )}
        </div>

        {/* Risk Forecast */}
        <div className="rounded-md border border-slate-200 bg-white p-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-slate-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Risk Forecast
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-bold uppercase ${
                district.riskLevel === 'Critical'
                  ? 'bg-rose-100 text-rose-800'
                  : district.riskLevel === 'High'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {district.riskLevel} Risk
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {district.riskForecast}
          </p>
        </div>
      </div>
    </aside>
  );
};
