import React from 'react';
import { IncidentMarker, VehicleMarker, RoadSegment, BridgeMarker } from '../types';
import {
  X,
  AlertTriangle,
  Truck,
  Navigation,
  Shield,
  Radio,
  Anchor,
  ShieldCheck,
  Clock,
  User,
  Sparkles,
  Camera,
  MapPin,
} from 'lucide-react';

interface DetailDrawerProps {
  incident: IncidentMarker | null;
  vehicle: VehicleMarker | null;
  road: RoadSegment | null;
  bridge?: BridgeMarker | null;
  onClose: () => void;
  onOpenBroadcast?: () => void;
  onNavigateToIncidents?: () => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  incident,
  vehicle,
  road,
  bridge,
  onClose,
  onOpenBroadcast,
  onNavigateToIncidents,
}) => {
  if (!incident && !vehicle && !road && !bridge) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white p-5 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            {incident && (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {incident.code}
                    </span>
                    <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-700 uppercase">
                      {incident.severity}
                    </span>
                    {incident.verificationStatus === 'verified' && (
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-700">
                        Verified ✓
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            {vehicle && !incident && (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {vehicle.callsign}
                    </span>
                    <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-700 uppercase">
                      {vehicle.cargo}
                    </span>
                  </div>
                </div>
              </>
            )}
            {road && !incident && !vehicle && !bridge && (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  <Navigation className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {road.routeNumber}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        road.status === 'blocked'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : road.status === 'restricted'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {road.status}
                    </span>
                  </div>
                </div>
              </>
            )}
            {bridge && !incident && !vehicle && !road && (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  <Anchor className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {bridge.name}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        bridge.status === 'blocked'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : bridge.status === 'restricted'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {bridge.status}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {incident && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{incident.title}</h3>
                <p className="mt-1 text-slate-600 leading-relaxed">{incident.description}</p>
              </div>

              {/* Photo Reconnaissance if available */}
              {incident.photoUrl && (
                <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-950">
                  <div className="relative aspect-video w-full bg-slate-900">
                    <img
                      src={incident.photoUrl}
                      alt={incident.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1.5 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-xs">
                      <Camera className="h-3 w-3 text-blue-400" />
                      <span>SURVEILLANCE RECON</span>
                    </div>
                    {incident.latLng && (
                      <div className="absolute bottom-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-xs">
                        {incident.latLng}
                      </div>
                    )}
                  </div>
                  {incident.photoCaption && (
                    <div className="border-t border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] text-slate-400">
                      {incident.photoCaption}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Location</span>
                  <div className="text-slate-900 font-semibold">
                    {incident.district}, {incident.state}
                  </div>
                  <div className="text-[10px] text-slate-500">{incident.roadName}</div>
                  {incident.latLng && (
                    <div className="text-[10px] text-blue-600 mt-0.5">{incident.latLng}</div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Est. Clearance</span>
                  <div className="text-blue-700 font-semibold">{incident.estimatedClearance}</div>
                  <div className="text-[10px] text-slate-500">Reported {incident.timestamp}</div>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] text-slate-500 uppercase">Affected Convoys</span>
                  <div className="text-amber-700 font-semibold">{incident.affectedVehicles} Units</div>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] text-slate-500 uppercase">Status</span>
                  <div className="text-rose-700 font-semibold capitalize">{incident.status}</div>
                </div>
              </div>

              {/* Assigned Officer & Recommended Action */}
              {(incident.assignedOfficer || incident.recommendedAction) && (
                <div className="space-y-2">
                  {incident.assignedOfficer && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                      <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-500 uppercase">
                        <User className="h-3 w-3 text-blue-600" />
                        <span>Assigned Command Officer</span>
                      </div>
                      <div className="mt-1 text-slate-900 font-semibold text-xs">
                        {incident.assignedOfficer}
                      </div>
                      {incident.assignedOfficerRole && (
                        <div className="text-[10px] text-slate-500">
                          {incident.assignedOfficerRole}
                        </div>
                      )}
                    </div>
                  )}

                  {incident.recommendedAction && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2.5">
                      <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-blue-700 uppercase">
                        <Sparkles className="h-3 w-3 text-blue-600" />
                        <span>Recommended Operational Action</span>
                      </div>
                      <div className="mt-1 text-slate-800 text-[11px] leading-relaxed">
                        {incident.recommendedAction}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Dispatched Emergency Teams
                </span>
                <div className="mt-1.5 space-y-1">
                  {incident.dispatchedTeams.map((team, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 shadow-2xs"
                    >
                      <Shield className="h-3.5 w-3.5 text-blue-600" />
                      <span>{team}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {vehicle && !incident && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{vehicle.cargoDescription}</h3>
                <div className="mt-1 text-slate-600">
                  Assigned Route: <strong className="text-slate-900">{vehicle.assignedHighway}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Origin</span>
                  <div className="text-slate-900 font-semibold">{vehicle.origin}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Destination</span>
                  <div className="text-slate-900 font-semibold">{vehicle.destination}</div>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] text-slate-500 uppercase">Speed & Telemetry</span>
                  <div className="text-blue-700 font-semibold">{vehicle.currentSpeedKmH} km/h</div>
                  <div className="text-[10px] text-slate-500">Satcom: {vehicle.telemetry.satcomLink}</div>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] text-slate-500 uppercase">Estimated Arrival</span>
                  <div className="text-amber-700 font-semibold">{vehicle.eta}</div>
                  {vehicle.delayMinutes ? (
                    <div className="text-[10px] text-rose-600">+{vehicle.delayMinutes}m delay</div>
                  ) : (
                    <div className="text-[10px] text-emerald-600">On Schedule</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {road && !incident && !vehicle && !bridge && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{road.name}</h3>
                <p className="mt-1 text-slate-600 leading-relaxed">{road.conditionDetails}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Span</span>
                  <div className="text-slate-900 font-semibold">{road.from} → {road.to}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Segment Length</span>
                  <div className="text-slate-900 font-semibold">{road.lengthKm} KM</div>
                </div>
                {road.detourRoute && (
                  <div className="col-span-2 mt-1">
                    <span className="text-[10px] text-slate-500 uppercase">Recommended Detour</span>
                    <div className="text-amber-700 font-semibold">{road.detourRoute}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {bridge && !incident && !vehicle && !road && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{bridge.name}</h3>
                <div className="mt-1 text-slate-600">
                  Span: <strong className="text-slate-900">{bridge.lengthM}m</strong> across {bridge.riverCrossing}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">State & River</span>
                  <div className="text-slate-900 font-semibold">{bridge.state}</div>
                  <div className="text-[10px] text-slate-500">{bridge.riverCrossing}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Structural Health</span>
                  <div className="text-blue-700 font-semibold">{bridge.structuralHealthScore}%</div>
                  <div className="text-[10px] text-slate-500">Sensor status: Online</div>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase">Status & Load Restrictions</span>
                  <div className="text-slate-900 font-semibold capitalize">{bridge.status}</div>
                  <div className="text-[10px] text-slate-500">{bridge.details}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Bar */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <div>
            {incident && onNavigateToIncidents && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToIncidents();
                }}
                className="flex items-center space-x-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-medium text-xs text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-blue-600" />
                <span>Go to Incident Management</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onOpenBroadcast && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBroadcast();
                }}
                className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-xs text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <Radio className="h-3.5 w-3.5 text-blue-600" />
                <span>Broadcast Alert</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
