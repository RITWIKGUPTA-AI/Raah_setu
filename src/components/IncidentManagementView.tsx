import React, { useState, useMemo } from 'react';
import { IncidentMarker, SeverityLevel } from '../types';
import { IncidentDetailDrawer } from './IncidentDetailDrawer';
import { NewIncidentModal } from './NewIncidentModal';
import {
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Filter,
  ArrowUpDown,
  Navigation,
  Eye,
  Check,
  User,
  Droplets,
  Mountain,
  Construction,
  ShieldAlert,
  Wrench,
  X,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

interface IncidentManagementViewProps {
  incidents: IncidentMarker[];
  onUpdateIncident: (updated: IncidentMarker) => void;
  onCreateIncident: (newIncident: IncidentMarker) => void;
  onViewOnMap: (incident: IncidentMarker) => void;
}

type FilterTab = 'all' | 'critical' | 'high' | 'medium' | 'resolved';

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  incidents,
  onUpdateIncident,
  onCreateIncident,
  onViewOnMap,
}) => {
  // Filter & Search States
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'severity' | 'time' | 'status'>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer & Modal States
  const [selectedIncident, setSelectedIncident] = useState<IncidentMarker | null>(null);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Severity weights for sorting
  const severityWeight: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    warning: 2,
    info: 1,
  };

  // Filter calculation counts
  const filterCounts = useMemo(() => {
    return {
      all: incidents.length,
      critical: incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved')
        .length,
      high: incidents.filter((i) => i.severity === 'high' && i.status !== 'resolved').length,
      medium: incidents.filter(
        (i) => (i.severity === 'medium' || i.severity === 'warning') && i.status !== 'resolved'
      ).length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
    };
  }, [incidents]);

  // Filter & Search Logic
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Tab Filter
        if (activeFilter === 'resolved') {
          if (inc.status !== 'resolved') return false;
        } else if (activeFilter === 'critical') {
          if (inc.severity !== 'critical' || inc.status === 'resolved') return false;
        } else if (activeFilter === 'high') {
          if (inc.severity !== 'high' || inc.status === 'resolved') return false;
        } else if (activeFilter === 'medium') {
          if (
            (inc.severity !== 'medium' && inc.severity !== 'warning') ||
            inc.status === 'resolved'
          )
            return false;
        }

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = inc.title.toLowerCase().includes(q);
          const matchCode = inc.code.toLowerCase().includes(q);
          const matchRoad = inc.roadName.toLowerCase().includes(q);
          const matchDistrict = inc.district.toLowerCase().includes(q);
          const matchState = inc.state.toLowerCase().includes(q);
          const matchOfficer = inc.assignedOfficer?.toLowerCase().includes(q);
          const matchReporter = inc.reportedBy.toLowerCase().includes(q);
          const matchCategory = inc.category.toLowerCase().includes(q);
          return (
            matchTitle ||
            matchCode ||
            matchRoad ||
            matchDistrict ||
            matchState ||
            matchOfficer ||
            matchReporter ||
            matchCategory
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const wA = severityWeight[a.severity] || 0;
          const wB = severityWeight[b.severity] || 0;
          return sortOrder === 'desc' ? wB - wA : wA - wB;
        }
        if (sortBy === 'status') {
          return sortOrder === 'desc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
        // default time
        return 0;
      });
  }, [incidents, activeFilter, searchQuery, sortBy, sortOrder]);

  // Handlers for Drawer actions
  const handleVerify = (id: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const nextStatus = inc.verificationStatus === 'verified' ? 'pending' : 'verified';
    const updated = {
      ...inc,
      verificationStatus: nextStatus as 'verified' | 'pending',
    };
    onUpdateIncident(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated);
    }
    showToast(
      nextStatus === 'verified'
        ? `Incident ${inc.code} officially verified by command.`
        : `Incident ${inc.code} set back to pending review.`
    );
  };

  const handleAssign = (id: string, officerName: string, officerRole: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const updated = {
      ...inc,
      assignedOfficer: officerName,
      assignedOfficerRole: officerRole,
    };
    onUpdateIncident(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated);
    }
    showToast(`Assigned ${inc.code} to ${officerName}`);
  };

  const handleToggleResolved = (id: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const isNowResolved = inc.status !== 'resolved';
    const updated: IncidentMarker = {
      ...inc,
      status: isNowResolved ? 'resolved' : 'in-progress',
      estimatedClearance: isNowResolved ? 'Cleared & Restored' : 'Assessment in progress',
    };
    onUpdateIncident(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident(updated);
    }
    showToast(
      isNowResolved
        ? `Incident ${inc.code} marked RESOLVED. All transit restored.`
        : `Incident ${inc.code} re-opened to IN-PROGRESS.`
    );
  };

  const handleCreateNew = (newInc: IncidentMarker) => {
    onCreateIncident(newInc);
    setSelectedIncident(newInc);
    showToast(`Logged new incident ${newInc.code} — ${newInc.title}`);
  };

  // Badge helpers
  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case 'landslide':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
            <Mountain className="h-3 w-3 text-amber-600" />
            <span>Landslide</span>
          </span>
        );
      case 'flood':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-800 border border-blue-200">
            <Droplets className="h-3 w-3 text-blue-600" />
            <span>Flooding</span>
          </span>
        );
      case 'road_damage':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-800 border border-orange-200">
            <Construction className="h-3 w-3 text-orange-600" />
            <span>Road Damage</span>
          </span>
        );
      case 'bridge_restriction':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-purple-50 px-1.5 py-0.5 text-[11px] font-medium text-purple-800 border border-purple-200">
            <ShieldAlert className="h-3 w-3 text-purple-600" />
            <span>Bridge Restriction</span>
          </span>
        );
      case 'breakdown':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800 border border-indigo-200">
            <Wrench className="h-3 w-3 text-indigo-600" />
            <span>Breakdown</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-800 border border-slate-200">
            <AlertTriangle className="h-3 w-3 text-slate-500" />
            <span className="capitalize">{category}</span>
          </span>
        );
    }
  };

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-700 uppercase">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 uppercase">
            High
          </span>
        );
      case 'medium':
      case 'warning':
        return (
          <span className="inline-flex items-center rounded border border-yellow-200 bg-yellow-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-yellow-800 uppercase">
            Medium
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 uppercase">
            Info
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center space-x-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
            <Check className="h-3 w-3 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center space-x-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span>In-Progress</span>
          </span>
        );
      case 'clearing':
        return (
          <span className="inline-flex items-center space-x-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-700">
            <span>Clearing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      id="incident-management-page"
      className="flex flex-1 flex-col h-full overflow-hidden bg-[#F8FAFC]"
    >
      {/* Toast notification banner if triggered */}
      {toastMessage && (
        <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4 py-1.5 text-xs text-blue-900 shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-blue-500 hover:text-blue-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <header
        id="incident-mgmt-header"
        className="shrink-0 border-b border-slate-200 bg-white px-5 py-3 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Incident Management
              </h1>
              <span className="inline-flex items-center space-x-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>GOVT / ADMIN DISPATCH</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor, verify and resolve regional transport disruptions
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono">
              <span className="text-slate-400">Total:</span>
              <strong className="text-slate-900">{incidents.length}</strong>
            </div>
            <div className="flex items-center space-x-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 font-mono text-rose-700">
              <span>Critical:</span>
              <strong>{filterCounts.critical}</strong>
            </div>
            <div className="flex items-center space-x-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-emerald-700">
              <span>Resolved:</span>
              <strong>{filterCounts.resolved}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* TOP CONTROLS: Compact Filters + Search + New Incident */}
      <div
        id="incident-controls-bar"
        className="shrink-0 border-b border-slate-200 bg-white px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
      >
        {/* Compact Filters: All, Critical, High, Medium, Resolved */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              {
                id: 'all',
                label: 'All',
                count: filterCounts.all,
                badgeColor: 'text-slate-700 bg-slate-200',
              },
              {
                id: 'critical',
                label: 'Critical',
                count: filterCounts.critical,
                badgeColor: 'text-rose-700 bg-rose-100/70',
              },
              {
                id: 'high',
                label: 'High',
                count: filterCounts.high,
                badgeColor: 'text-amber-700 bg-amber-100/70',
              },
              {
                id: 'medium',
                label: 'Medium',
                count: filterCounts.medium,
                badgeColor: 'text-yellow-800 bg-yellow-100/70',
              },
              {
                id: 'resolved',
                label: 'Resolved',
                count: filterCounts.resolved,
                badgeColor: 'text-emerald-700 bg-emerald-100/70',
              },
            ] as const
          ).map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                id={`filter-tab-${filter.id}`}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : filter.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Search + New Incident button */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="incident-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by incident, location, officer..."
              className="w-full rounded-md border border-slate-300 bg-slate-50/60 pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* New Incident Button */}
          <button
            id="new-incident-btn"
            onClick={() => setIsNewIncidentOpen(true)}
            className="flex items-center space-x-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Incident</span>
          </button>
        </div>
      </div>

      {/* MAIN: Clean Compact Incident Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table
              id="incident-management-table"
              className="w-full border-collapse text-left text-xs"
            >
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">
                    <button
                      onClick={() => {
                        setSortBy('severity');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Incident</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">
                    <button
                      onClick={() => {
                        setSortBy('severity');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Severity</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3">
                    <button
                      onClick={() => {
                        setSortBy('status');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center space-x-1 hover:text-slate-900"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Reported</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertTriangle className="h-7 w-7 text-slate-300" />
                        <span className="font-semibold text-slate-700">
                          No transport incidents found
                        </span>
                        <span className="text-[11px] text-slate-400 max-w-sm">
                          {searchQuery
                            ? `No incidents matching "${searchQuery}". Try clearing search filters.`
                            : `There are currently no incidents under the "${activeFilter}" filter.`}
                        </span>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-1 text-xs text-blue-600 hover:underline"
                          >
                            Clear search filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => {
                    const isSelected = selectedIncident?.id === incident.id;
                    const isVerified = incident.verificationStatus === 'verified';

                    return (
                      <tr
                        key={incident.id}
                        id={`incident-row-${incident.id}`}
                        onClick={() => setSelectedIncident(incident)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/60 font-medium'
                            : 'hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        {/* 1. Incident Column */}
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-start space-x-2">
                            <span className="shrink-0 mt-0.5">
                              {isVerified ? (
                                <span title="Verified Incident">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                </span>
                              ) : (
                                <span title="Pending Verification">
                                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                                </span>
                              )}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono text-[11px] font-bold text-slate-900">
                                  {incident.code}
                                </span>
                              </div>
                              <div className="font-semibold text-slate-900 truncate max-w-[220px] text-xs">
                                {incident.title}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Location Column */}
                        <td className="py-2.5 px-3">
                          <div className="text-slate-800 font-medium truncate max-w-[180px]">
                            {incident.roadName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {incident.district}, {incident.state}
                          </div>
                        </td>

                        {/* 3. Type Column */}
                        <td className="py-2.5 px-3 shrink-0">
                          {renderCategoryBadge(incident.category)}
                        </td>

                        {/* 4. Severity Column */}
                        <td className="py-2.5 px-3 shrink-0">
                          {renderSeverityBadge(incident.severity)}
                        </td>

                        {/* 5. Status Column */}
                        <td className="py-2.5 px-3 shrink-0">
                          {renderStatusBadge(incident.status)}
                        </td>

                        {/* 6. Reported Column */}
                        <td className="py-2.5 px-3">
                          <div className="text-slate-900 font-mono text-[11px]">
                            {incident.timestamp}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {incident.reportedBy}
                          </div>
                        </td>

                        {/* 7. Assigned Column */}
                        <td className="py-2.5 px-3">
                          {incident.assignedOfficer ? (
                            <div className="flex items-center space-x-1.5 text-slate-800">
                              <User className="h-3 w-3 text-blue-600 shrink-0" />
                              <span className="font-medium truncate max-w-[130px]">
                                {incident.assignedOfficer}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 italic">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* 8. Action Column */}
                        <td className="py-2.5 px-3 text-right">
                          <div
                            className="flex items-center justify-end space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedIncident(incident)}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
                              title="Inspect incident details"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => {
                                onViewOnMap(incident);
                              }}
                              className="rounded border border-slate-200 bg-white p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              title="View on GIS Map"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleResolved(incident.id)}
                              className={`rounded border p-1 transition-colors ${
                                incident.status === 'resolved'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={
                                incident.status === 'resolved'
                                  ? 'Re-open incident'
                                  : 'Mark as resolved'
                              }
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Compact Table Summary Footer */}
          <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{filteredIncidents.length}</strong> of{' '}
              <strong className="text-slate-800">{incidents.length}</strong> incidents
              {activeFilter !== 'all' && (
                <span>
                  {' '}
                  (Filtered by <span className="font-semibold capitalize">{activeFilter}</span>)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Total Active Dispatches: {incidents.filter((i) => i.status !== 'resolved').length}</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Click any row to open incident drawer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right-Side Incident Detail Drawer */}
      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onVerify={handleVerify}
        onAssign={handleAssign}
        onToggleResolved={handleToggleResolved}
        onViewOnMap={(inc) => {
          onViewOnMap(inc);
        }}
      />

      {/* New Incident Modal Dialog */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onCreateIncident={handleCreateNew}
      />
    </div>
  );
};
