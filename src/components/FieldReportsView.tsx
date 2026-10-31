import React, { useState, useMemo } from 'react';
import {
  Radio,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  WifiOff,
  CloudOff,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { FIELD_REPORTS_DATA } from '../data/mockOperationalIntelligence';
import { FieldReportItem, FieldReportType, FieldVerificationStatus } from '../types';
import { FieldReportDetailDrawer } from './FieldReportDetailDrawer';

interface FieldReportsViewProps {
  onPromoteToIncident?: (report: FieldReportItem) => void;
}

export const FieldReportsView: React.FC<FieldReportsViewProps> = ({
  onPromoteToIncident,
}) => {
  const [reports, setReports] = useState<FieldReportItem[]>(FIELD_REPORTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<FieldReportItem | null>(null);
  const [offlineSyncCount, setOfflineSyncCount] = useState<number>(12);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Derive unique states and districts
  const states = useMemo(() => {
    return ['all', ...Array.from(new Set(reports.map((r) => r.state)))];
  }, [reports]);

  const districts = useMemo(() => {
    const list = reports
      .filter((r) => selectedState === 'all' || r.state === selectedState)
      .map((r) => r.district);
    return ['all', ...Array.from(new Set(list))];
  }, [reports, selectedState]);

  const reportTypes: (FieldReportType | 'all')[] = [
    'all',
    'Landslide',
    'Flood',
    'Road Damage',
    'Bridge Damage',
    'Traffic',
    'Weather Condition',
  ];

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchState = selectedState === 'all' || r.state === selectedState;
      const matchDistrict =
        selectedDistrict === 'all' || r.district === selectedDistrict;
      const matchStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'Verified'
          ? r.verification === 'Verified'
          : selectedStatus === 'Rejected'
          ? r.verification === 'Rejected'
          : r.verification === 'Pending Verification';
      const matchType = selectedType === 'all' || r.type === selectedType;
      const matchSearch =
        searchQuery.trim() === '' ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchState && matchDistrict && matchStatus && matchType && matchSearch;
    });
  }, [
    reports,
    selectedState,
    selectedDistrict,
    selectedStatus,
    selectedType,
    searchQuery,
  ]);

  // Drawer handlers
  const handleVerify = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, verification: 'Verified', status: 'Under Review' }
          : r
      )
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) =>
        prev
          ? { ...prev, verification: 'Verified', status: 'Under Review' }
          : null
      );
    }
  };

  const handleReject = (id: string, reason?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, verification: 'Rejected', status: 'Dismissed' }
          : r
      )
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) =>
        prev
          ? { ...prev, verification: 'Rejected', status: 'Dismissed' }
          : null
      );
    }
  };

  const handleCreateIncident = (report: FieldReportItem) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id
          ? { ...r, status: 'Converted to Incident', verification: 'Verified' }
          : r
      )
    );
    if (selectedReport?.id === report.id) {
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              status: 'Converted to Incident',
              verification: 'Verified',
            }
          : null
      );
    }
    if (onPromoteToIncident) {
      onPromoteToIncident(report);
    }
  };

  const handleTriggerSync = () => {
    if (offlineSyncCount === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setOfflineSyncCount(0);
    }, 1200);
  };

  const getTypeBadge = (type: FieldReportType) => {
    switch (type) {
      case 'Landslide':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Flood':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Road Damage':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Bridge Damage':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Traffic':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Weather Condition':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getVerificationBadge = (v: FieldVerificationStatus) => {
    switch (v) {
      case 'Verified':
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Rejected':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
    }
  };

  return (
    <div
      id="field-reports-page"
      className="flex flex-1 flex-col overflow-hidden bg-[#F8FAFC] select-none relative"
    >
      {/* PAGE HEADER */}
      <header
        id="field-reports-header"
        className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white shadow-2xs">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Field Reports
            </h1>
            <p className="text-xs text-slate-500 leading-tight">
              Geo-tagged updates from field officials
            </p>
          </div>
        </div>

        {/* OFFLINE SYNC STATUS INDICATOR */}
        <div className="flex items-center space-x-2">
          <button
            id="offline-sync-indicator-btn"
            onClick={handleTriggerSync}
            disabled={offlineSyncCount === 0 || isSyncing}
            className={`flex items-center space-x-2 rounded-md border px-3 py-1.5 text-xs font-mono transition-colors shadow-2xs ${
              offlineSyncCount > 0
                ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border-slate-200 bg-slate-50 text-slate-600 cursor-default'
            }`}
          >
            <CloudOff
              className={`h-3.5 w-3.5 ${
                offlineSyncCount > 0 ? 'text-amber-600' : 'text-slate-400'
              }`}
            />
            <span>
              {isSyncing
                ? 'Syncing buffer...'
                : offlineSyncCount > 0
                ? `${offlineSyncCount} reports waiting to sync`
                : 'All field nodes synchronized'}
            </span>
            {offlineSyncCount > 0 && (
              <RefreshCw
                className={`h-3 w-3 ml-1 ${isSyncing ? 'animate-spin' : ''}`}
              />
            )}
          </button>
        </div>
      </header>

      {/* TOP CONTROLS: SEARCH, STATE, DISTRICT, STATUS */}
      <div
        id="field-reports-top-controls"
        className="shrink-0 border-b border-slate-200 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
      >
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              id="field-report-search-input"
              type="text"
              placeholder="Search reports or officers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* State Dropdown */}
          <select
            id="field-report-state-filter"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('all');
            }}
            className="h-8 rounded border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All States</option>
            {states
              .filter((s) => s !== 'all')
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>

          {/* District Dropdown */}
          <select
            id="field-report-district-filter"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="h-8 rounded border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Districts</option>
            {districts
              .filter((d) => d !== 'all')
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>

          {/* Type Filter */}
          <select
            id="field-report-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 rounded border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Incident Types</option>
            {reportTypes
              .filter((t) => t !== 'all')
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            {['all', 'Pending', 'Verified', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        <span className="font-mono text-xs text-slate-500 shrink-0">
          Showing {filteredReports.length} records
        </span>
      </div>

      {/* MAIN: FIELD REPORTS TABLE */}
      <main className="flex-1 overflow-y-auto p-5">
        <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Submitted By</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const vBadge = getVerificationBadge(report.verification);

                return (
                  <tr
                    key={report.id}
                    id={`field-report-row-${report.id}`}
                    onClick={() => setSelectedReport(report)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 font-medium'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Report ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {report.id}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {report.location}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {report.district}, {report.state}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${getTypeBadge(
                          report.type
                        )}`}
                      >
                        {report.type}
                      </span>
                    </td>

                    {/* Submitted By */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">
                        {report.submittedBy}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {report.reporterAgency}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {report.time}
                    </td>

                    {/* Verification */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${vBadge.dot}`}
                        />
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.2 font-mono text-[10px] font-bold ${vBadge.pill}`}
                        >
                          {report.verification}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono text-[11px] ${
                          report.status === 'Converted to Incident'
                            ? 'font-bold text-slate-900'
                            : 'text-slate-600'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="inline-flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                      >
                        <span>Review</span>
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredReports.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-xs text-slate-500"
                  >
                    No field reports matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* RIGHT-SIDE DETAIL DRAWER */}
      {selectedReport && (
        <FieldReportDetailDrawer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onVerify={handleVerify}
          onReject={handleReject}
          onCreateIncident={handleCreateIncident}
        />
      )}
    </div>
  );
};
