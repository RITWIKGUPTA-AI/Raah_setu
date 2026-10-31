import React from 'react';
import { PriorityAlert } from '../types';

interface PriorityAlertsProps {
  alerts: PriorityAlert[];
  selectedAlertId?: string | null;
  onSelectAlert?: (alert: PriorityAlert) => void;
  onSelectAlertOnMap?: (alert: PriorityAlert) => void;
  onToggleAcknowledge?: (alertId: string) => void;
  onViewAllAlerts?: () => void;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  onSelectAlertOnMap,
  onToggleAcknowledge,
  onViewAllAlerts,
}) => {
  const handleItemClick = (alert: PriorityAlert) => {
    if (onSelectAlert) onSelectAlert(alert);
    if (onSelectAlertOnMap) onSelectAlertOnMap(alert);
  };
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'high':
      case 'warning':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    if (timestamp.includes('(')) {
      return timestamp.split('(')[1].replace(')', '').trim();
    }
    return timestamp;
  };

  return (
    <div
      id="priority-alerts-section"
      className="flex h-full w-full flex-col rounded-lg border border-slate-200 bg-white overflow-hidden select-none shadow-2xs"
    >
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-slate-200 px-3.5 shrink-0 bg-slate-50/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wide text-slate-900 uppercase">
            Priority Alerts
          </span>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {alerts.length}
          </span>
        </div>
        {onViewAllAlerts ? (
          <button
            onClick={onViewAllAlerts}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
          >
            All Alerts →
          </button>
        ) : (
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Live Feed
          </span>
        )}
      </div>

      {/* Alerts Vertical List */}
      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {alerts.map((alert) => {
          const badge = getSeverityBadge(alert.severity);
          const isSelected = selectedAlertId === alert.id;

          return (
            <div
              key={alert.id}
              id={`alert-item-${alert.id}`}
              onClick={() => handleItemClick(alert)}
              className={`flex cursor-pointer flex-col justify-center px-3.5 py-2.5 transition-colors ${
                isSelected
                  ? 'bg-blue-50/60 border-l-3 border-l-blue-600'
                  : 'hover:bg-slate-50 border-l-3 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center space-x-1 rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${badge.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                  <span>{alert.severity}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatRelativeTime(alert.timestamp)}
                </span>
              </div>

              <h4 className="mt-1 text-xs font-semibold text-slate-900 line-clamp-1 leading-snug">
                {alert.title}
              </h4>

              <div className="mt-0.5 text-[11px] text-slate-500 truncate">
                {alert.location}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

