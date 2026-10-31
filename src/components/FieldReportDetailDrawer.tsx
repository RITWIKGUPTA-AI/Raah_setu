import React, { useState } from 'react';
import {
  X,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  User,
  Clock,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { FieldReportItem } from '../types';

interface FieldReportDetailDrawerProps {
  report: FieldReportItem | null;
  onClose: () => void;
  onVerify: (reportId: string) => void;
  onReject: (reportId: string, reason?: string) => void;
  onCreateIncident: (report: FieldReportItem) => void;
}

export const FieldReportDetailDrawer: React.FC<FieldReportDetailDrawerProps> = ({
  report,
  onClose,
  onVerify,
  onReject,
  onCreateIncident,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!report) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800';
      case 'High':
        return 'bg-amber-100 text-amber-800';
      case 'Moderate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <aside
      id="field-report-detail-drawer"
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
          <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-tight">
              Field Report Review
            </h2>
            <p className="text-[11px] font-mono text-slate-500">
              {report.id} • {report.time}
            </p>
          </div>
        </div>
        <button
          id="close-field-report-drawer-btn"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Verification & Severity Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold ${getVerificationBadge(
                report.verification
              )}`}
            >
              {report.verification}
            </span>
            <span
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${getSeverityBadge(
                report.severity
              )}`}
            >
              {report.severity} Severity
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-500">
            {report.type}
          </span>
        </div>

        {/* Location & GPS Coordinates */}
        <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3 space-y-1.5">
          <div className="flex items-start space-x-1.5">
            <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 leading-snug">
                {report.location}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {report.district}, {report.state}
              </div>
            </div>
          </div>

          <div className="rounded bg-slate-900 px-2.5 py-1.5 font-mono text-[11px] text-sky-400 flex items-center justify-between">
            <span>GPS: {report.gpsCoordinates}</span>
            <span className="text-[10px] text-slate-400">WGS-84 FIX</span>
          </div>
        </div>

        {/* Photo Preview / Field Documentation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Field Photographic Evidence
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Geo-watermarked
            </span>
          </div>

          <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group">
            {report.photoUrl ? (
              <img
                src={report.photoUrl}
                alt={report.photoCaption || 'Field report image'}
                className="h-44 w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <Camera className="h-8 w-8 mb-1 opacity-50" />
                <span className="text-xs">No image attached by field unit</span>
              </div>
            )}

            {/* Geo Watermark Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs p-2 text-white font-mono text-[10px] flex items-center justify-between">
              <span className="truncate">{report.gpsCoordinates}</span>
              <span className="shrink-0">{report.time}</span>
            </div>
          </div>

          {report.photoCaption && (
            <p className="text-[11px] text-slate-500 italic">
              {report.photoCaption}
            </p>
          )}
        </div>

        {/* Location on Map (Schematic Vector GIS) */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Location on Tactical GIS
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Grid Sector [
              {Math.round(report.coordinates[0])},{Math.round(report.coordinates[1])}]
            </span>
          </div>

          <div className="relative h-24 w-full rounded border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 260 100">
              <line x1="10" y1="50" x2="250" y2="50" stroke="#475569" strokeWidth="2.5" />
              <line x1="80" y1="10" x2="180" y2="90" stroke="#334155" strokeWidth="2" strokeDasharray="3" />
              {/* Pulsing Pin at Center */}
              <circle cx="130" cy="50" r="12" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
              <circle cx="130" cy="50" r="5" fill="#ef4444" />
              <text x="130" y="32" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {report.id}
              </text>
            </svg>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="rounded-md border border-slate-200 bg-white p-3 space-y-1 text-slate-700 leading-relaxed">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Officer Field Notes
          </span>
          <p className="text-xs">{report.description}</p>
        </div>

        {/* Reporter Information */}
        <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Reporting Official
          </span>
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold font-mono text-[10px]">
              {report.submittedBy.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900">{report.submittedBy}</div>
              <div className="text-[11px] text-slate-500">
                {report.reporterDesignation} • {report.reporterAgency}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
            Contact / Sat-Comm: {report.reporterContact}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Submission Time: {report.timestamp}
          </div>
        </div>

        {/* Reject input if active */}
        {isRejecting && (
          <div className="rounded-md border border-rose-200 bg-rose-50/40 p-3 space-y-2">
            <span className="text-xs font-bold text-rose-900 block">
              Provide Rejection Justification
            </span>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate report, minor clearance, non-critical..."
              className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
            />
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  onReject(report.id, rejectReason || 'Insufficient evidence / duplicate');
                  setIsRejecting(false);
                  showToast('Report rejected');
                }}
                className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setIsRejecting(false)}
                className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Actions Footer: Verify, Reject, Create Incident */}
      <div className="border-t border-slate-200 bg-slate-50/80 p-4 space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Verify */}
          <button
            id="report-verify-btn"
            onClick={() => {
              onVerify(report.id);
              showToast('Field report verified');
            }}
            disabled={report.verification === 'Verified'}
            className={`flex items-center justify-center space-x-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              report.verification === 'Verified'
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {report.verification === 'Verified' ? 'Verified' : 'Verify Report'}
            </span>
          </button>

          {/* Action 2: Reject */}
          <button
            id="report-reject-btn"
            onClick={() => setIsRejecting(!isRejecting)}
            disabled={report.verification === 'Rejected'}
            className={`flex items-center justify-center space-x-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
              report.verification === 'Rejected'
                ? 'bg-rose-50 text-rose-700 border-rose-200 cursor-default'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>{report.verification === 'Rejected' ? 'Rejected' : 'Reject'}</span>
          </button>
        </div>

        {/* Action 3: Create Incident */}
        <button
          id="report-create-incident-btn"
          onClick={() => {
            onCreateIncident(report);
            showToast(`Incident created from ${report.id}`);
          }}
          disabled={report.status === 'Converted to Incident'}
          className={`flex w-full items-center justify-center space-x-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            report.status === 'Converted to Incident'
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs'
          }`}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>
            {report.status === 'Converted to Incident'
              ? 'Converted to Incident #INC'
              : 'Promote to Incident'}
          </span>
        </button>
      </div>
    </aside>
  );
};
