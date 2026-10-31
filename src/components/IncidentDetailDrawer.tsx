import React, { useState } from 'react';
import { IncidentMarker } from '../types';
import {
  X,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Copy,
  Check,
  Camera,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Info,
  Droplets,
  Mountain,
  Wrench,
  Construction,
  ShieldAlert,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: IncidentMarker | null;
  onClose: () => void;
  onVerify: (incidentId: string) => void;
  onAssign: (incidentId: string, officerName: string, officerRole: string) => void;
  onToggleResolved: (incidentId: string) => void;
  onViewOnMap: (incident: IncidentMarker) => void;
}

const AVAILABLE_OFFICERS = [
  { name: 'Col. R. Bhattacharya', role: 'Director Operations • NE Command' },
  { name: 'Smt. Ananya Saikia', role: 'ADC Logistics & Disaster Response' },
  { name: 'Maj. Neeraj Rawat', role: 'Officer Commanding, 117 RCC (BRO)' },
  { name: 'Er. Tomba Singh', role: 'Executive Engineer, PWD Highway Div' },
  { name: 'Maj. P. K. Gurung', role: 'Commander, BRO Task Force 33' },
  { name: 'Inspector T. Jamir', role: 'Nagaland Highway Traffic Command' },
];

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  onClose,
  onVerify,
  onAssign,
  onToggleResolved,
  onViewOnMap,
}) => {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  if (!incident) return null;

  const isResolved = incident.status === 'resolved';
  const isVerified = incident.verificationStatus === 'verified';

  const handleCopyCoords = () => {
    navigator.clipboard?.writeText(incident.latLng);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'landslide':
        return <Mountain className="h-3.5 w-3.5 text-amber-600" />;
      case 'flood':
        return <Droplets className="h-3.5 w-3.5 text-blue-600" />;
      case 'road_damage':
        return <Construction className="h-3.5 w-3.5 text-orange-600" />;
      case 'bridge_restriction':
        return <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />;
      case 'breakdown':
        return <Wrench className="h-3.5 w-3.5 text-indigo-600" />;
      default:
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'active':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'clearing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <div
        id="incident-detail-drawer-backdrop"
        className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      >
        <div
          id="incident-detail-drawer"
          className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar / Header */}
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/60">
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded">
                  {incident.code}
                </span>
                <span
                  className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-mono ${getSeverityBadgeClass(
                    incident.severity
                  )}`}
                >
                  {incident.severity}
                </span>
                <span
                  className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold capitalize font-mono ${getStatusBadgeClass(
                    incident.status
                  )}`}
                >
                  {incident.status === 'in-progress' ? 'In Progress' : incident.status}
                </span>
                {isVerified ? (
                  <span className="inline-flex items-center space-x-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    <Clock className="h-3 w-3" />
                    <span>Pending Verification</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {incident.title}
              </h2>
            </div>

            <button
              id="close-incident-drawer-btn"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Field Photo Section */}
            {incident.photoUrl && (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900 group relative shadow-2xs">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={incident.photoUrl}
                    alt={incident.title}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback placeholder if photo fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Photo Overlay HUD */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5 rounded bg-black/65 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-xs">
                    <Camera className="h-3 w-3 text-blue-400" />
                    <span>FIELD RECONNAISSANCE</span>
                  </div>
                  <div className="absolute top-2 right-2 rounded bg-black/65 px-2 py-0.5 text-[10px] font-mono text-slate-300 backdrop-blur-xs">
                    {incident.timestamp}
                  </div>
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute bottom-2 right-2 flex items-center space-x-1 rounded bg-black/75 px-2 py-1 text-[10px] text-white hover:bg-black/90 transition-colors backdrop-blur-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Expand Photo</span>
                  </button>
                </div>
                {incident.photoCaption && (
                  <div className="border-t border-slate-800 bg-slate-900/95 px-3 py-1.5 text-[11px] text-slate-300 font-mono">
                    {incident.photoCaption}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Incident Description
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {incident.description}
              </p>
            </div>

            {/* Location & GPS Info */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-xs text-slate-900">
                    {incident.roadName}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  {incident.district}, {incident.state}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5 text-slate-600 font-mono">
                  <span className="text-slate-400">GPS:</span>
                  <span className="font-semibold text-slate-800">{incident.latLng}</span>
                </div>
                <button
                  onClick={handleCopyCoords}
                  className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Copy GPS coordinates"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-slate-400" />
                      <span>Copy GPS</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Structured Details Matrix */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Reported By
                </span>
                <span className="font-semibold text-slate-900 text-xs block leading-tight">
                  {incident.reportedBy}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {incident.timestamp}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Est. Clearance
                </span>
                <span className="font-semibold text-blue-700 text-xs block leading-tight">
                  {incident.estimatedClearance || 'Under Assessment'}
                </span>
                <span className="text-[10px] text-amber-700 font-mono mt-0.5 block">
                  {incident.affectedVehicles} vehicles held
                </span>
              </div>
            </div>

            {/* Assigned Officer Block */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Officer
                </span>
                <button
                  id="reassign-officer-btn"
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  className="flex items-center space-x-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
                >
                  <span>{incident.assignedOfficer ? 'Reassign' : 'Assign'}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {incident.assignedOfficer ? (
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">
                      {incident.assignedOfficer}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {incident.assignedOfficerRole || 'Command Duty Officer'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-400 italic text-xs py-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>Unassigned — Click Reassign to designate officer</span>
                </div>
              )}

              {/* Officer Picker Dropdown */}
              {showAssignDropdown && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase border-b border-slate-100">
                    Select Response Commander
                  </div>
                  {AVAILABLE_OFFICERS.map((officer, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onAssign(incident.id, officer.name, officer.role);
                        setShowAssignDropdown(false);
                      }}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-blue-50/80 hover:text-blue-900 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{officer.name}</div>
                        <div className="text-[10px] text-slate-500">{officer.role}</div>
                      </div>
                      {incident.assignedOfficer === officer.name && (
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Action Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-blue-900 font-semibold text-xs">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Recommended Action & SOP</span>
              </div>
              <p className="text-xs text-blue-950/90 leading-relaxed font-medium">
                {incident.recommendedAction ||
                  'Dispatch field reconnaissance unit; establish traffic diversion point and maintain radio telemetry link with regional hub.'}
              </p>
            </div>

            {/* Dispatched Teams */}
            {incident.dispatchedTeams && incident.dispatchedTeams.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Dispatched Field Units ({incident.dispatchedTeams.length})
                </span>
                <div className="space-y-1">
                  {incident.dispatchedTeams.map((team, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium">{team}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Action Bar */}
          <div
            id="incident-drawer-actions"
            className="border-t border-slate-200 bg-slate-50 px-5 py-3.5 flex items-center justify-between gap-2"
          >
            {/* View on Map */}
            <button
              id="drawer-view-on-map-btn"
              onClick={() => {
                onViewOnMap(incident);
              }}
              className="flex items-center space-x-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <Navigation className="h-3.5 w-3.5 text-blue-600" />
              <span>View on Map</span>
            </button>

            <div className="flex items-center space-x-2">
              {/* Verify Action */}
              <button
                id="drawer-verify-btn"
                onClick={() => onVerify(incident.id)}
                className={`flex items-center space-x-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors shadow-2xs ${
                  isVerified
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
                title={isVerified ? 'Click to toggle verification status' : 'Verify incident'}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isVerified ? 'Verified ✓' : 'Verify'}</span>
              </button>

              {/* Mark Resolved / Reopen Action */}
              <button
                id="drawer-mark-resolved-btn"
                onClick={() => onToggleResolved(incident.id)}
                className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors shadow-2xs ${
                  isResolved
                    ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700'
                }`}
              >
                {isResolved ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Re-open</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Resolved</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Photo Modal */}
      {showPhotoModal && incident.photoUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="relative max-w-3xl w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-white">
              <span className="font-mono text-xs font-semibold">
                {incident.code} • {incident.title}
              </span>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <img
                src={incident.photoUrl}
                alt={incident.title}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {incident.photoCaption && (
              <div className="bg-slate-950 px-4 py-2 text-xs text-slate-300 font-mono border-t border-slate-800">
                {incident.photoCaption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
