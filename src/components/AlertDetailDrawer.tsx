import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  MapPin,
  Clock,
  UserCheck,
  Navigation,
  ShieldCheck,
  Send,
  User,
} from 'lucide-react';
import { OperationalAlertItem } from '../types';

interface AlertDetailDrawerProps {
  alert: OperationalAlertItem | null;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  onAssign: (alertId: string, team: string) => void;
  onResolve: (alertId: string, notes: string) => void;
  onViewOnMap?: (alert: OperationalAlertItem) => void;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onAssign,
  onResolve,
  onViewOnMap,
}) => {
  const [assigneeInput, setAssigneeInput] = useState('BRO Task Force 74 Quick Response');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!alert) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <AlertOctagon className="h-4 w-4 text-rose-600" />,
          label: 'CRITICAL',
        };
      case 'warning':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
          label: 'WARNING',
        };
      case 'resolved':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
          label: 'RESOLVED',
        };
      default:
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Info className="h-4 w-4 text-blue-600" />,
          label: 'INFORMATION',
        };
    }
  };

  const style = getSeverityStyle(alert.severity);

  return (
    <aside
      id="alert-detail-drawer"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col select-none animate-in slide-in-from-right duration-200"
    >
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-2 left-4 right-4 z-50 rounded bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5 shrink-0 bg-slate-50/70">
        <div className="flex items-center space-x-2">
          {style.icon}
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-tight">
              Operational Alert Review
            </h2>
            <p className="text-[11px] font-mono text-slate-500">
              {alert.code} • {alert.time}
            </p>
          </div>
        </div>
        <button
          id="close-alert-drawer-btn"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Severity Banner */}
        <div className="flex items-center justify-between">
          <span
            className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold ${style.badge}`}
          >
            {style.label}
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Logged: {alert.timestamp}
          </span>
        </div>

        {/* Title & Location */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {alert.title}
          </h3>
          <div className="flex items-center space-x-1.5 text-slate-600 text-xs">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">
              {alert.location}
              {alert.district ? ` (${alert.district})` : ''}, {alert.state}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3.5 space-y-1 text-slate-700 leading-relaxed">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Incident Description & Context
          </span>
          <p>{alert.description}</p>
        </div>

        {/* Action Advised */}
        {alert.actionAdvised && (
          <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
              Standard Operating Procedure (SOP)
            </span>
            <p className="text-amber-950 font-medium">{alert.actionAdvised}</p>
          </div>
        )}

        {/* Status & Assignment Info */}
        <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Dispatch & Task Assignment
          </span>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-mono font-bold capitalize text-slate-800">
              {alert.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Assigned Unit:</span>
            <span className="font-mono font-semibold text-slate-800">
              {alert.assignedTeam || alert.assignedTo || 'Unassigned'}
            </span>
          </div>

          {alert.targetRoad && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Primary Asset:</span>
              <span className="font-mono font-semibold text-slate-800">
                {alert.targetRoad}
              </span>
            </div>
          )}
        </div>

        {/* Assign Modal Input if toggled */}
        {isAssigning && (
          <div className="rounded-md border border-blue-200 bg-blue-50/40 p-3 space-y-2">
            <span className="text-xs font-bold text-blue-900 block">
              Assign Response Unit
            </span>
            <input
              type="text"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              placeholder="Enter unit or officer callsign..."
              className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  onAssign(alert.id, assigneeInput);
                  setIsAssigning(false);
                  showToast(`Assigned to ${assigneeInput}`);
                }}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Confirm Assignment
              </button>
              <button
                onClick={() => setIsAssigning(false)}
                className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Resolve Input if toggled */}
        {isResolving && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
            <span className="text-xs font-bold text-emerald-900 block">
              Log Resolution Notes
            </span>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Summary of actions taken and clearance verification..."
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  onResolve(alert.id, resolutionNotes || 'Resolved per standard protocol');
                  setIsResolving(false);
                  showToast('Alert marked as resolved');
                }}
                className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Confirm Resolution
              </button>
              <button
                onClick={() => setIsResolving(false)}
                className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Actions Footer */}
      <div className="border-t border-slate-200 bg-slate-50/80 p-4 space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Acknowledge */}
          <button
            id="alert-acknowledge-btn"
            onClick={() => {
              onAcknowledge(alert.id);
              showToast(
                alert.status === 'acknowledged'
                  ? 'Reverted to Active'
                  : 'Alert acknowledged by Command'
              );
            }}
            className={`flex items-center justify-center space-x-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
              alert.status === 'acknowledged'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>
              {alert.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}
            </span>
          </button>

          {/* Action 2: Assign */}
          <button
            id="alert-assign-btn"
            onClick={() => setIsAssigning(!isAssigning)}
            className="flex items-center justify-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Assign Unit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Action 3: View on Map */}
          <button
            id="alert-view-map-btn"
            onClick={() => {
              if (onViewOnMap) {
                onViewOnMap(alert);
              } else {
                showToast(`Centering on ${alert.location}...`);
              }
            }}
            className="flex items-center justify-center space-x-1.5 rounded-md border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>View on Map</span>
          </button>

          {/* Action 4: Resolve */}
          <button
            id="alert-resolve-btn"
            onClick={() => setIsResolving(!isResolving)}
            disabled={alert.severity === 'resolved'}
            className={`flex items-center justify-center space-x-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              alert.severity === 'resolved'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {alert.severity === 'resolved' ? 'Closed' : 'Resolve Alert'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
