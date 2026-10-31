import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Clock,
  UserCheck,
  Check,
} from 'lucide-react';
import { OPERATIONAL_ALERTS } from '../data/mockOperationalIntelligence';
import { OperationalAlertItem, AlertSeverity, AlertStatus } from '../types';
import { AlertDetailDrawer } from './AlertDetailDrawer';

interface AlertsViewProps {
  onViewOnMap?: (alert: OperationalAlertItem) => void;
}

type FilterTab = 'all' | 'critical' | 'warning' | 'info' | 'resolved';

export const AlertsView: React.FC<AlertsViewProps> = ({ onViewOnMap }) => {
  const [alerts, setAlerts] = useState<OperationalAlertItem[]>(OPERATIONAL_ALERTS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlertItem | null>(null);

  // Counters for tabs
  const counts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
      resolved: alerts.filter((a) => a.severity === 'resolved').length,
    };
  }, [alerts]);

  // Filtered list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesFilter =
        activeFilter === 'all' ? true : a.severity === activeFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [alerts, activeFilter, searchQuery]);

  // Handlers for Drawer actions
  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'acknowledged' ? 'active' : 'acknowledged',
            }
          : a
      )
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'acknowledged' ? 'active' : 'acknowledged',
            }
          : null
      );
    }
  };

  const handleAssign = (id: string, team: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, assignedTeam: team, status: 'assigned' } : a
      )
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) =>
        prev ? { ...prev, assignedTeam: team, status: 'assigned' } : null
      );
    }
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, severity: 'resolved', status: 'resolved' } : a
      )
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) =>
        prev ? { ...prev, severity: 'resolved', status: 'resolved' } : null
      );
    }
  };

  const getSeverityPill = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
          icon: <AlertOctagon className="h-3.5 w-3.5 text-rose-600 shrink-0" />,
          label: 'CRITICAL',
        };
      case 'warning':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
          label: 'WARNING',
        };
      case 'resolved':
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />,
          label: 'RESOLVED',
        };
      default:
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
          icon: <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />,
          label: 'INFO',
        };
    }
  };

  return (
    <div
      id="alerts-page"
      className="flex flex-1 flex-col overflow-hidden bg-[#F8FAFC] select-none relative"
    >
      {/* PAGE HEADER */}
      <header
        id="alerts-header"
        className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white shadow-2xs">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Alerts
            </h1>
            <p className="text-xs text-slate-500 leading-tight">
              Operational warnings and system notifications
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600">
            Feed Live • {counts.critical} Critical
          </span>
        </div>
      </header>

      {/* FILTERS & SEARCH ROW */}
      <div
        id="alerts-filters-row"
        className="shrink-0 border-b border-slate-200 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
      >
        {/* Filters Tabs: All, Critical, Warning, Information, Resolved */}
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          <button
            id="filter-tab-all"
            onClick={() => setActiveFilter('all')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All</span>
            <span className="font-mono text-[10px] opacity-80">({counts.all})</span>
          </button>

          <button
            id="filter-tab-critical"
            onClick={() => setActiveFilter('critical')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'critical'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>Critical</span>
            <span className="font-mono text-[10px] opacity-80">
              ({counts.critical})
            </span>
          </button>

          <button
            id="filter-tab-warning"
            onClick={() => setActiveFilter('warning')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>Warning</span>
            <span className="font-mono text-[10px] opacity-80">
              ({counts.warning})
            </span>
          </button>

          <button
            id="filter-tab-info"
            onClick={() => setActiveFilter('info')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'info'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span>Information</span>
            <span className="font-mono text-[10px] opacity-80">({counts.info})</span>
          </button>

          <button
            id="filter-tab-resolved"
            onClick={() => setActiveFilter('resolved')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === 'resolved'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>Resolved</span>
            <span className="font-mono text-[10px] opacity-80">
              ({counts.resolved})
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            id="alert-search-input"
            type="text"
            placeholder="Search alerts by road, location, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* MAIN: CHRONOLOGICAL ALERT FEED */}
      <main className="flex-1 overflow-y-auto p-5">
        <div className="max-w-5xl mx-auto space-y-2">
          {filteredAlerts.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            const style = getSeverityPill(alert.severity);

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                onClick={() => setSelectedAlert(alert)}
                className={`cursor-pointer rounded-lg border transition-all p-3.5 select-none ${
                  isSelected
                    ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Severity Badge + Title + Location + Description */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">{style.icon}</div>

                    <div className="flex-1 min-w-0">
                      {/* Top Row: Severity Tag • Title • Location */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded border px-1.5 py-0.2 font-mono text-[9px] font-bold ${style.pill}`}
                        >
                          {style.label}
                        </span>

                        <h2 className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {alert.title}
                        </h2>

                        <span className="flex items-center text-[11px] font-medium text-slate-500 shrink-0">
                          <MapPin className="h-3 w-3 mr-0.5 text-slate-400" />
                          {alert.location}
                        </span>
                      </div>

                      {/* Description: Compact and easy to scan */}
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Time + Status Pill */}
                  <div className="text-right shrink-0 flex flex-col items-end space-y-1">
                    <span className="flex items-center text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" />
                      {alert.time}
                    </span>

                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold capitalize ${
                        alert.status === 'acknowledged'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : alert.status === 'assigned'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : alert.status === 'resolved'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
              No operational alerts found under "{activeFilter}" tab.
            </div>
          )}
        </div>
      </main>

      {/* RIGHT-SIDE DETAIL DRAWER */}
      {selectedAlert && (
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledge}
          onAssign={handleAssign}
          onResolve={handleResolve}
          onViewOnMap={onViewOnMap}
        />
      )}
    </div>
  );
};
