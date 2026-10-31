import React, { useState } from 'react';
import {
  Package,
  Search,
  Truck,
  Clock,
  CheckCircle2,
  Send,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';
import { ShipmentItem, ShipmentStatus, ShipmentPriority } from '../types';
import { INITIAL_SHIPMENTS } from '../data/mockFleetLogisticsData';
import { ShipmentDetailDrawer } from './ShipmentDetailDrawer';

interface LogisticsViewProps {
  onNavigateToFleetVehicle?: (vehicleId: string) => void;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({
  onNavigateToFleetVehicle,
}) => {
  const [shipments, setShipments] = useState<ShipmentItem[]>(INITIAL_SHIPMENTS);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentItem | null>(null);

  // TOP FILTERS: Commodity, State, District, Priority, Status
  const [commodityFilter, setCommodityFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract districts dynamically based on selected state
  const availableDistricts = Array.from(
    new Set(
      shipments
        .filter((s) => stateFilter === 'All' || s.destinationState === stateFilter || s.originState === stateFilter)
        .map((s) => s.destinationDistrict)
    )
  ).filter(Boolean);

  // Filter shipments
  const filteredShipments = shipments.filter((item) => {
    const matchesCommodity =
      commodityFilter === 'All' || item.commodity === commodityFilter;
    const matchesState =
      stateFilter === 'All' ||
      item.destinationState === stateFilter ||
      item.originState === stateFilter;
    const matchesDistrict =
      districtFilter === 'All' || item.destinationDistrict === districtFilter;
    const matchesPriority =
      priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.id.toLowerCase().includes(query) ||
      item.commodity.toLowerCase().includes(query) ||
      item.origin.toLowerCase().includes(query) ||
      item.destination.toLowerCase().includes(query) ||
      item.vehicle.toLowerCase().includes(query) ||
      item.destinationDistrict.toLowerCase().includes(query) ||
      item.destinationState.toLowerCase().includes(query);

    return (
      matchesCommodity &&
      matchesState &&
      matchesDistrict &&
      matchesPriority &&
      matchesStatus &&
      matchesSearch
    );
  });

  // Calculate Status Summary counts
  const statusCounts = {
    dispatched: shipments.filter((s) => s.status === 'Dispatched').length,
    inTransit: shipments.filter((s) => s.status === 'In Transit').length,
    delayed: shipments.filter((s) => s.status === 'Delayed').length,
    delivered: shipments.filter((s) => s.status === 'Delivered').length,
  };

  const handleResetFilters = () => {
    setCommodityFilter('All');
    setStateFilter('All');
    setDistrictFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div id="logistics-page" className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      {/* PAGE HEADER */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Logistics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Essential supply movement across the region
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center space-x-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800 font-mono font-medium">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>INTER-STATE COMMODITY PIPELINE</span>
            </span>
          </div>
        </div>

        {/* STATUS SUMMARY: 4 compact status indicators */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Dispatched */}
          <button
            id="status-summary-dispatched"
            onClick={() => setStatusFilter(statusFilter === 'Dispatched' ? 'All' : 'Dispatched')}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
              statusFilter === 'Dispatched'
                ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div
                className={`text-2xl font-black font-mono tracking-tight ${
                  statusFilter === 'Dispatched' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {statusCounts.dispatched}
              </div>
              <div
                className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${
                  statusFilter === 'Dispatched' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Dispatched
              </div>
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                statusFilter === 'Dispatched'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Send className="h-4 w-4" />
            </div>
          </button>

          {/* In Transit */}
          <button
            id="status-summary-in-transit"
            onClick={() => setStatusFilter(statusFilter === 'In Transit' ? 'All' : 'In Transit')}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
              statusFilter === 'In Transit'
                ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div
                className={`text-2xl font-black font-mono tracking-tight ${
                  statusFilter === 'In Transit' ? 'text-white' : 'text-blue-600'
                }`}
              >
                {statusCounts.inTransit}
              </div>
              <div
                className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${
                  statusFilter === 'In Transit' ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                In Transit
              </div>
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                statusFilter === 'In Transit'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Truck className="h-4 w-4" />
            </div>
          </button>

          {/* Delayed */}
          <button
            id="status-summary-delayed"
            onClick={() => setStatusFilter(statusFilter === 'Delayed' ? 'All' : 'Delayed')}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
              statusFilter === 'Delayed'
                ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div
                className={`text-2xl font-black font-mono tracking-tight ${
                  statusFilter === 'Delayed' ? 'text-white' : 'text-amber-600'
                }`}
              >
                {statusCounts.delayed}
              </div>
              <div
                className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${
                  statusFilter === 'Delayed' ? 'text-amber-100' : 'text-slate-500'
                }`}
              >
                Delayed
              </div>
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                statusFilter === 'Delayed'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Clock className="h-4 w-4" />
            </div>
          </button>

          {/* Delivered */}
          <button
            id="status-summary-delivered"
            onClick={() => setStatusFilter(statusFilter === 'Delivered' ? 'All' : 'Delivered')}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
              statusFilter === 'Delivered'
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div
                className={`text-2xl font-black font-mono tracking-tight ${
                  statusFilter === 'Delivered' ? 'text-white' : 'text-emerald-600'
                }`}
              >
                {statusCounts.delivered}
              </div>
              <div
                className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${
                  statusFilter === 'Delivered' ? 'text-emerald-100' : 'text-slate-500'
                }`}
              >
                Delivered
              </div>
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                statusFilter === 'Delivered'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* TOP FILTERS: Commodity, State, District, Priority, Status */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="search-shipment-input"
              type="text"
              placeholder="Search shipment, vehicle, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Commodity Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Commodity:
            </label>
            <select
              id="filter-commodity"
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="All">All Commodities</option>
              <option value="Medicines">Medicines</option>
              <option value="Food">Food</option>
              <option value="Agricultural Produce">Agricultural Produce</option>
              <option value="Construction Materials">Construction Materials</option>
              <option value="Fuel & POL">Fuel & POL</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              State:
            </label>
            <select
              id="filter-state"
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setDistrictFilter('All');
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="All">All States (NER)</option>
              <option value="Assam">Assam</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tripura">Tripura</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              District:
            </label>
            <select
              id="filter-district"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="All">All Districts</option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Priority:
            </label>
            <select
              id="filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Status:
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Delayed">Delayed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {(commodityFilter !== 'All' ||
            stateFilter !== 'All' ||
            districtFilter !== 'All' ||
            priorityFilter !== 'All' ||
            statusFilter !== 'All' ||
            searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN: Clean shipment table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Shipment ID</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No shipments match the selected filters or search terms.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const isDelivered = shipment.status === 'Delivered';
                  const isDelayed = shipment.status === 'Delayed';
                  const isInTransit = shipment.status === 'In Transit';

                  const statusBadgeColor = isDelivered
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : isDelayed
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : isInTransit
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-slate-700 bg-slate-100 border-slate-300';

                  const priorityBadgeColor =
                    shipment.priority === 'Critical'
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : shipment.priority === 'High'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-slate-600 bg-slate-100 border-slate-200';

                  return (
                    <tr
                      key={shipment.id}
                      id={`shipment-row-${shipment.id}`}
                      onClick={() => setSelectedShipment(shipment)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Shipment ID */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {shipment.id}
                      </td>

                      {/* Commodity */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {shipment.commodity}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {shipment.quantity}
                        </div>
                      </td>

                      {/* Origin */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {shipment.origin}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {shipment.originState}
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {shipment.destination}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {shipment.destinationDistrict}, {shipment.destinationState}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {shipment.vehicle}
                      </td>

                      {/* ETA */}
                      <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                        {shipment.eta}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${priorityBadgeColor}`}
                        >
                          {shipment.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeColor}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDelivered
                                ? 'bg-emerald-500'
                                : isDelayed
                                ? 'bg-amber-500'
                                : isInTransit
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{shipment.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShipment(shipment);
                          }}
                          className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 group-hover:border-blue-300 group-hover:text-blue-700 transition-colors"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLICK SHIPMENT: Right-side detail drawer */}
      <ShipmentDetailDrawer
        shipment={selectedShipment}
        onClose={() => setSelectedShipment(null)}
        onTrackVehicle={onNavigateToFleetVehicle}
      />
    </div>
  );
};
