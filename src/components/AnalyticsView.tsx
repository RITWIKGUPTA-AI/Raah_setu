import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  MapPin,
  Package,
  Layers,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  FileText,
  X,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  ANALYTICS_DISRUPTIONS_TREND,
  ANALYTICS_DELIVERY_DELAYS,
  ANALYTICS_DISTRICT_CONNECTIVITY,
  ANALYTICS_INCIDENT_CATEGORIES,
  VULNERABLE_CORRIDORS_DATA,
} from '../data/mockAnalyticsData';
import { VulnerableCorridorItem } from '../types';

interface AnalyticsViewProps {
  onNavigateToCorridor?: (corridorCode: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onNavigateToCorridor,
}) => {
  // Filters
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Filtered Vulnerable Corridors
  const filteredCorridors = useMemo(() => {
    return VULNERABLE_CORRIDORS_DATA.filter((item) => {
      if (selectedState !== 'all' && !item.state.toLowerCase().includes(selectedState.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [selectedState]);

  // Handle Export Report
  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    const filename = `VECTOR_Operations_Analytics_${dateRange}_${new Date().toISOString().slice(0, 10)}.${format}`;
    
    if (format === 'csv') {
      const headers = ['Corridor', 'State', 'Disruptions', 'Average Delay', 'Risk Level', 'Primary Cause', 'Active Blockages'];
      const rows = filteredCorridors.map((c) => [
        `"${c.corridor}"`,
        `"${c.state}"`,
        c.disruptions,
        `"${c.averageDelay}"`,
        `"${c.risk}"`,
        `"${c.primaryCause}"`,
        c.activeBlockages,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setExportSuccessMessage(`Executive briefing report generated in ${format.toUpperCase()} format.`);
    setTimeout(() => {
      setShowExportModal(false);
      setExportSuccessMessage(null);
    }, 1500);
  };

  const getRiskBadge = (risk: VulnerableCorridorItem['risk']) => {
    switch (risk) {
      case 'Critical':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Moderate':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* 1. Page Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 shadow-2xs gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Analytics
            </h1>
            <span className="inline-flex items-center rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200">
              Decision Support
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational performance and regional trends
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
        {/* 2. Compact Filter Strip */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Operational Scope</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Aggregated across 8 North Eastern States
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Date Range Filter */}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Date Range</span>
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="7d">Last 7 Days (Active Wave)</option>
                <option value="30d">Last 30 Days (Monsoon Peak)</option>
                <option value="90d">Last 90 Days (Quarterly)</option>
                <option value="monsoon2026">Monsoon Season 2026</option>
              </select>
            </div>

            {/* State Filter */}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>State</span>
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('all');
                }}
                className="rounded border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All States (North East)</option>
                <option value="Assam">Assam</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Manipur">Manipur</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Tripura">Tripura</option>
              </select>
            </div>

            {/* District Filter */}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
                <Layers className="h-3 w-3 text-slate-400" />
                <span>District</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Districts</option>
                <option value="Kamrup Metro">Kamrup Metro (Assam)</option>
                <option value="East Sikkim">East Sikkim (Sikkim)</option>
                <option value="Ri-Bhoi">Ri-Bhoi (Meghalaya)</option>
                <option value="Kohima">Kohima (Nagaland)</option>
                <option value="Papum Pare">Papum Pare (Arunachal)</option>
                <option value="Imphal West">Imphal West (Manipur)</option>
                <option value="Aizawl">Aizawl (Mizoram)</option>
                <option value="West Tripura">West Tripura (Tripura)</option>
              </select>
            </div>

            {/* Commodity Filter */}
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
                <Package className="h-3 w-3 text-slate-400" />
                <span>Commodity</span>
              </label>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Commodities</option>
                <option value="medical">Medical Supplies & Vaccines</option>
                <option value="food">Food Grains & Rations</option>
                <option value="fuel">Fuel & POL Reserves</option>
                <option value="rescue">Disaster Rescue Equipment</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. FOUR USEFUL VISUALIZATIONS (2x2 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* VISUALIZATION 1: Road disruptions over time */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Road Disruptions Over Time
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daily active road disruptions vs. clearance throughput
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">7-Day Trend</span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ANALYTICS_DISRUPTIONS_TREND}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '10px', paddingBottom: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="disruptions"
                    name="Disruptions Logged"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#ef4444' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cleared"
                    name="Corridors Restored"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10b981' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* VISUALIZATION 2: Average delivery delay */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  2. Average Delivery Delay
                </h3>
                <p className="text-[11px] text-slate-500">
                  Transit delay hours by primary highway corridor
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Hours Exceeded</span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ANALYTICS_DELIVERY_DELAYS}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="corridor"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number) => [`${value} hrs`, 'Average Delay']}
                  />
                  <Bar
                    dataKey="avgDelayHours"
                    name="Delay (Hours)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* VISUALIZATION 3: District connectivity */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  3. District Connectivity Index
                </h3>
                <p className="text-[11px] text-slate-500">
                  Regional lifeline road accessibility percentage
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Target ≥ 85%</span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ANALYTICS_DISTRICT_CONNECTIVITY}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="district"
                    tick={{ fontSize: 9, fill: '#334155' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number) => [`${value}% Connected`, 'Accessibility']}
                  />
                  <Bar
                    dataKey="connectivity"
                    name="Connectivity %"
                    fill="#0ea5e9"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* VISUALIZATION 4: Incident categories */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  4. Incident Categories
                </h3>
                <p className="text-[11px] text-slate-500">
                  Disruption causal distribution across monitored sectors
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">68 Total Events</span>
            </div>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ANALYTICS_INCIDENT_CATEGORIES}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {ANALYTICS_INCIDENT_CATEGORIES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} incidents (${(
                        ANALYTICS_INCIDENT_CATEGORIES.find((c) => c.name === name)?.percentage || 0
                      )}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM: "Most Vulnerable Corridors" Table */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {/* Table Header & Title */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50/60">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Most Vulnerable Corridors</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Critical corridors requiring priority earthmoving and escort asset allocation
              </p>
            </div>
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center space-x-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Compact Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3.5">Corridor</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-center">Disruptions</th>
                  <th className="py-2.5 px-3 text-center">Average Delay</th>
                  <th className="py-2.5 px-3">Primary Cause</th>
                  <th className="py-2.5 px-3 text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCorridors.map((item) => {
                  const riskBadge = getRiskBadge(item.risk);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onNavigateToCorridor && onNavigateToCorridor(item.corridor.split(' ')[0])}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3.5 font-semibold text-slate-900 group-hover:text-blue-700">
                        <div className="flex items-center space-x-1.5">
                          <span>{item.corridor}</span>
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-xs">
                        {item.state}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-900">
                        {item.disruptions}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                        {item.averageDelay}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                        {item.primaryCause}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${riskBadge}`}
                        >
                          {item.risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Export Operational Intelligence Report
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                Generate an official VECTOR summary report containing road disruption histories, delay metrics, and district vulnerabilities for government reviews.
              </p>

              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Horizon:</span>
                  <span className="font-semibold text-slate-800">{dateRange.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">State Filter:</span>
                  <span className="font-semibold text-slate-800">{selectedState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commodity:</span>
                  <span className="font-semibold text-slate-800">{selectedCommodity}</span>
                </div>
              </div>

              {exportSuccessMessage && (
                <div className="flex items-center space-x-2 rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{exportSuccessMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center space-x-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center space-x-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Executive PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
