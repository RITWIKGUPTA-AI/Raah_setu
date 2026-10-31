import React from 'react';
import { DistrictConnectivity as DistrictConnectivityType } from '../types';

interface DistrictConnectivityProps {
  districts: DistrictConnectivityType[];
  onSelectDistrict?: (district: DistrictConnectivityType) => void;
  onViewAllDistricts?: () => void;
}

export const DistrictConnectivity: React.FC<DistrictConnectivityProps> = ({
  districts,
  onSelectDistrict,
  onViewAllDistricts,
}) => {
  const getRiskBadge = (percentage: number) => {
    if (percentage >= 90) return { label: 'Low', class: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (percentage >= 75) return { label: 'Medium', class: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Critical', class: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const getConnectivityBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div
      id="district-connectivity-section"
      className="flex h-full flex-col rounded-lg border border-slate-200 bg-white overflow-hidden select-none shadow-2xs"
    >
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-slate-200 px-3.5 shrink-0 bg-slate-50/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wide text-slate-900 uppercase">
            District Connectivity
          </span>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {districts.length} Districts
          </span>
        </div>
        {onViewAllDistricts ? (
          <button
            onClick={onViewAllDistricts}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
          >
            All Districts →
          </button>
        ) : (
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Road Health
          </span>
        )}
      </div>

      {/* Compact Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-3">District</th>
              <th className="py-2 px-3">Connectivity</th>
              <th className="py-2 px-2 text-center">Open</th>
              <th className="py-2 px-2 text-center">Blocked</th>
              <th className="py-2 px-3 text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {districts.map((item) => {
              const blocked = Math.max(0, item.totalRoutes - item.openRoutes);
              const risk = getRiskBadge(item.percentage);
              const barColor = getConnectivityBarColor(item.percentage);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectDistrict && onSelectDistrict(item)}
                  className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-medium text-slate-900">
                    <div className="text-xs font-semibold leading-tight">{item.district}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {item.state}
                    </div>
                  </td>
                  <td className="py-2 px-3 min-w-[110px]">
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 w-14 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {item.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-medium text-emerald-700">
                    {item.openRoutes}
                  </td>
                  <td className="py-2 px-2 text-center font-mono">
                    <span
                      className={
                        blocked > 0
                          ? 'font-bold text-rose-700'
                          : 'text-slate-400'
                      }
                    >
                      {blocked}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`inline-block rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${risk.class}`}
                    >
                      {risk.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

