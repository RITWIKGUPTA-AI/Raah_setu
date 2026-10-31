import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  ShieldAlert,
  Droplets,
  Package,
  Table as TableIcon,
  Map as MapIcon,
} from 'lucide-react';
import { DISTRICT_MONITORING_DATA } from '../data/mockOperationalIntelligence';
import { DistrictMonitoringItem, IncidentMarker } from '../types';
import { DistrictDetailDrawer } from './DistrictDetailDrawer';
import { VectorMap } from './VectorMap';
import { MapErrorBoundary } from './MapErrorBoundary';
import { INITIAL_ROADS, INITIAL_INCIDENTS, INITIAL_RISK_ZONES, INITIAL_BRIDGES } from '../data/mockData';

interface DistrictMonitoringViewProps {
  onNavigateToCommandMap?: (district: DistrictMonitoringItem) => void;
}

export const DistrictMonitoringView: React.FC<DistrictMonitoringViewProps> = ({
  onNavigateToCommandMap,
}) => {
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictMonitoringItem | null>(DISTRICT_MONITORING_DATA[0]);
  const [sortBy, setSortBy] = useState<'name' | 'connectivity' | 'blocked' | 'risk'>('connectivity');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const stateOptions = [
    { id: 'all', label: 'All States (8)' },
    { id: 'Assam', label: 'Assam' },
    { id: 'Sikkim', label: 'Sikkim' },
    { id: 'Meghalaya', label: 'Meghalaya' },
    { id: 'Nagaland', label: 'Nagaland' },
    { id: 'Manipur', label: 'Manipur' },
    { id: 'Arunachal Pradesh', label: 'Arunachal' },
    { id: 'Mizoram', label: 'Mizoram' },
    { id: 'Tripura', label: 'Tripura' },
  ];

  // Filtered and sorted districts
  const filteredDistricts = useMemo(() => {
    let result = DISTRICT_MONITORING_DATA.filter((item) => {
      const matchState = selectedState === 'all' || item.state === selectedState;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplyStatus.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchSearch;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortAsc
          ? a.district.localeCompare(b.district)
          : b.district.localeCompare(a.district);
      }
      if (sortBy === 'connectivity') {
        return sortAsc
          ? a.connectivityScore - b.connectivityScore
          : b.connectivityScore - a.connectivityScore;
      }
      if (sortBy === 'blocked') {
        return sortAsc
          ? b.blockedRoadsCount - a.blockedRoadsCount
          : a.blockedRoadsCount - b.blockedRoadsCount;
      }
      if (sortBy === 'risk') {
        const order: Record<string, number> = { Critical: 4, High: 3, Moderate: 2, Low: 1 };
        return sortAsc
          ? (order[b.riskLevel] || 0) - (order[a.riskLevel] || 0)
          : (order[a.riskLevel] || 0) - (order[b.riskLevel] || 0);
      }
      return 0;
    });

    return result;
  }, [selectedState, searchQuery, sortBy, sortAsc]);

  const handleSort = (column: 'name' | 'connectivity' | 'blocked' | 'risk') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(column === 'connectivity' ? true : false);
    }
  };

  const getConnectivityBadge = (score: number) => {
    if (score >= 90) {
      return {
        pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Optimal',
      };
    }
    if (score >= 75) {
      return {
        pill: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'Moderate',
      };
    }
    if (score >= 55) {
      return {
        pill: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Restricted',
      };
    }
    return {
      pill: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Critical',
    };
  };

  const getSupplyBadge = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="district-monitoring-page"
      className="flex flex-1 flex-col overflow-hidden bg-[#F8FAFC] select-none relative"
    >
      {/* PAGE HEADER */}
      <header
        id="district-monitoring-header"
        className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white shadow-2xs">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              District Monitoring
            </h1>
            <p className="text-xs text-slate-500 leading-tight">
              Regional accessibility and logistics status across administrative sectors • Regional GIS
            </p>
          </div>
        </div>

        {/* View Toggle & Aggregate Status Pills */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-blue-600" />
              <span>GIS Map</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-600">
              <span>Critical Districts:</span>
              <span className="font-bold text-rose-600">
                {DISTRICT_MONITORING_DATA.filter((d) => d.riskLevel === 'Critical').length}
              </span>
            </div>
            <div className="flex items-center space-x-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-600">
              <span>Active Blockages:</span>
              <span className="font-bold text-slate-900">
                {DISTRICT_MONITORING_DATA.reduce((sum, d) => sum + d.blockedRoadsCount, 0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* TOP CONTROLS: STATE SELECTOR & DISTRICT SEARCH */}
      <div
        id="district-top-controls"
        className="shrink-0 border-b border-slate-200 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
      >
        {/* State Selector Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          {stateOptions.map((opt) => (
            <button
              key={opt.id}
              id={`state-tab-${opt.id}`}
              onClick={() => setSelectedState(opt.id)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                selectedState === opt.id
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* District Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            id="district-search-input"
            type="text"
            placeholder="Search district name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* MAIN: COMPACT DISTRICT TABLE OR GIS MAP */}
      {viewMode === 'map' ? (
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <MapErrorBoundary componentName="DistrictMonitoringMap" className="h-full rounded-none border-0">
            <VectorMap
              roads={INITIAL_ROADS}
              incidents={INITIAL_INCIDENTS}
              riskZones={INITIAL_RISK_ZONES}
              bridges={INITIAL_BRIDGES}
              selectedStateFilter={selectedState}
              title={`District GIS Connectivity: ${selectedState === 'all' ? 'North East Region' : selectedState}`}
              subtitle="Open Vector Basemap • Road Network Status & Vulnerability"
              className="h-full rounded-none border-0"
              showTitleBar={true}
            />
          </MapErrorBoundary>
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto p-5">
          <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center space-x-1">
                      <span>District</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('connectivity')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Connectivity</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Open Roads</th>
                  <th
                    onClick={() => handleSort('blocked')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Blocked</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Incidents</th>
                  <th className="py-3 px-3">Supply Status</th>
                  <th
                    onClick={() => handleSort('risk')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Risk</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDistricts.map((item) => {
                  const connBadge = getConnectivityBadge(item.connectivityScore);
                  const isSelected = selectedDistrict?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      id={`district-row-${item.id}`}
                      onClick={() => setSelectedDistrict(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/60 font-medium'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* District Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`h-2 w-2 rounded-full shrink-0 ${connBadge.dot}`}
                          />
                          <div>
                            <div className="font-bold text-slate-900">
                              {item.district}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {item.state}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Connectivity Score Column */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center space-x-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${connBadge.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${connBadge.dot}`}
                          />
                          <span>{item.connectivityScore}%</span>
                          <span className="text-[9px] opacity-75 font-sans">
                            ({connBadge.label})
                          </span>
                        </span>
                      </td>

                      {/* Open Roads Column */}
                      <td className="py-3 px-3 font-mono text-slate-700">
                        <span className="font-bold text-emerald-700">
                          {item.openRoads}
                        </span>{' '}
                        <span className="text-slate-400">/ {item.totalRoads}</span>
                      </td>

                      {/* Blocked Column */}
                      <td className="py-3 px-3">
                        {item.blockedRoadsCount > 0 ? (
                          <span className="inline-flex items-center rounded border border-rose-200 bg-rose-50 px-1.5 py-0.2 font-mono font-bold text-rose-700 text-[11px]">
                            {item.blockedRoadsCount} Blocked
                          </span>
                        ) : (
                          <span className="font-mono text-slate-400 text-[11px]">
                            0
                          </span>
                        )}
                      </td>

                      {/* Incidents Column */}
                      <td className="py-3 px-3">
                        {item.activeIncidentsCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800 border border-slate-200">
                            {item.activeIncidentsCount} Active
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>

                      {/* Supply Status Column */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${getSupplyBadge(
                            item.supplyStatus
                          )}`}
                        >
                          {item.supplyStatus}
                        </span>
                      </td>

                      {/* Risk Column */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${getRiskBadge(
                            item.riskLevel
                          )}`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDistrict(item);
                          }}
                          className="inline-flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                        >
                          <span>Details</span>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredDistricts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                      No districts matching search criteria "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* RIGHT-SIDE DETAIL DRAWER */}
      {selectedDistrict && (
        <DistrictDetailDrawer
          district={selectedDistrict}
          onClose={() => setSelectedDistrict(null)}
          onNavigateToLiveOps={onNavigateToCommandMap}
        />
      )}
    </div>
  );
};
