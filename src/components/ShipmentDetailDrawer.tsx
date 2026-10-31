import React from 'react';
import {
  X,
  Package,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react';
import { ShipmentItem } from '../types';

interface ShipmentDetailDrawerProps {
  shipment: ShipmentItem | null;
  onClose: () => void;
  onTrackVehicle?: (vehicleId: string) => void;
}

export const ShipmentDetailDrawer: React.FC<ShipmentDetailDrawerProps> = ({
  shipment,
  onClose,
  onTrackVehicle,
}) => {
  if (!shipment) return null;

  const isDelivered = shipment.status === 'Delivered';
  const isDelayed = shipment.status === 'Delayed';
  const isInTransit = shipment.status === 'In Transit';
  const isDispatched = shipment.status === 'Dispatched';

  const statusBadgeStyle = isDelivered
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : isDelayed
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : isInTransit
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : 'text-slate-700 bg-slate-100 border-slate-300';

  const priorityBadgeStyle =
    shipment.priority === 'Critical'
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : shipment.priority === 'High'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-slate-700 bg-slate-100 border-slate-200';

  const riskBadgeStyle =
    shipment.risk === 'High'
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : shipment.risk === 'Medium'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div
      id="shipment-detail-drawer"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-in-out"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold text-slate-900 tracking-tight">
                {shipment.id}
              </span>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${priorityBadgeStyle}`}
              >
                {shipment.priority}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Essential Commodity Consignment
            </div>
          </div>
        </div>

        <button
          id="close-shipment-drawer-btn"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          title="Close Drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Delivery Status Banner */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Delivery Status
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {shipment.status}
            </div>
          </div>
          <span
            className={`inline-flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeStyle}`}
          >
            {isDelivered ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : isDelayed ? (
              <Clock className="h-3.5 w-3.5" />
            ) : (
              <Truck className="h-3.5 w-3.5" />
            )}
            <span>{shipment.status}</span>
          </span>
        </div>

        {/* Commodity & Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center space-x-1">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              <span>Commodity</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {shipment.commodity}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center space-x-1">
              <span className="font-mono text-slate-400 font-bold">#</span>
              <span>Quantity</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {shipment.quantity}
            </div>
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Route Details
          </div>

          <div className="flex items-start justify-between">
            <div className="max-w-[45%]">
              <div className="text-[11px] text-slate-400 font-medium">Origin</div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {shipment.origin}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {shipment.originState}
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 mt-2 shrink-0" />

            <div className="max-w-[45%] text-right">
              <div className="text-[11px] text-slate-400 font-medium">Destination</div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {shipment.destination}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {shipment.destinationDistrict}, {shipment.destinationState}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Current Location */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                <span>Assigned Vehicle</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {shipment.vehicle}
              </div>
            </div>

            {onTrackVehicle && (
              <button
                onClick={() => onTrackVehicle(shipment.vehicle)}
                className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Track Vehicle →
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Current Location</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-0.5 font-mono">
              {shipment.currentLocation}
            </div>
          </div>
        </div>

        {/* ETA, Delay & Risk */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* ETA */}
          <div className="rounded-lg border border-slate-200 p-2.5 bg-white">
            <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mb-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>ETA</span>
            </div>
            <div className="text-xs font-bold text-slate-900 font-mono leading-tight">
              {shipment.eta}
            </div>
          </div>

          {/* Delay */}
          <div className="rounded-lg border border-slate-200 p-2.5 bg-white">
            <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-slate-400" />
              <span>Delay</span>
            </div>
            <div
              className={`text-xs font-bold font-mono leading-tight ${
                shipment.delay.includes('No') || shipment.delay.includes('None')
                  ? 'text-slate-900'
                  : 'text-amber-700'
              }`}
            >
              {shipment.delay}
            </div>
          </div>

          {/* Risk */}
          <div className="rounded-lg border border-slate-200 p-2.5 bg-white">
            <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mb-1">
              <ShieldCheck className="h-3 w-3 text-slate-400" />
              <span>Risk</span>
            </div>
            <span
              className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${riskBadgeStyle}`}
            >
              {shipment.risk}
            </span>
          </div>
        </div>

        {/* Consignee & Dispatch Time */}
        {shipment.consignee && (
          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Building className="h-3 w-3 text-slate-400" />
              <span>Consignee Agency</span>
            </div>
            <div className="text-xs font-medium text-slate-800">
              {shipment.consignee}
            </div>
            {shipment.dispatchDate && (
              <div className="text-[11px] text-slate-500 pt-1 flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Dispatched: {shipment.dispatchDate}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="border-t border-slate-200 bg-slate-50/80 p-4">
        <button
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
