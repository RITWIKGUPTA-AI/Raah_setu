import React from 'react';

interface KpiRowProps {
  onSelectKpiFilter?: (filterType: string) => void;
  activeFilter?: string | null;
}

export const KpiRow: React.FC<KpiRowProps> = ({ onSelectKpiFilter, activeFilter }) => {
  const kpis = [
    {
      id: 'accessibility',
      value: '92%',
      title: 'Road Accessibility',
      subtext: 'Open network • 4,812 km',
      indicatorColor: 'bg-emerald-500',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'incidents',
      value: '37',
      title: 'Active Incidents',
      subtext: '8 critical blockages',
      indicatorColor: 'bg-rose-500',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'vehicles',
      value: '428',
      title: 'Vehicles in Transit',
      subtext: '23 delayed in corridor',
      indicatorColor: 'bg-amber-500',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'deliveries',
      value: '1,284',
      title: 'Essential Deliveries',
      subtext: '96% on time target',
      indicatorColor: 'bg-blue-500',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div
      id="top-kpi-row"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 select-none"
    >
      {kpis.map((kpi) => {
        const isSelected = activeFilter === kpi.id;
        return (
          <div
            key={kpi.id}
            id={`kpi-card-${kpi.id}`}
            onClick={() => onSelectKpiFilter && onSelectKpiFilter(kpi.id)}
            className={`group flex cursor-pointer flex-col justify-between rounded-lg border bg-white p-3.5 transition-all shadow-2xs hover:shadow-xs hover:border-slate-300 ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {kpi.title}
              </span>
              <span className={`h-2 w-2 rounded-full ${kpi.indicatorColor}`} />
            </div>

            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {kpi.value}
              </span>
            </div>

            <div className="text-[11px] font-medium text-slate-500 truncate">
              {kpi.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};

