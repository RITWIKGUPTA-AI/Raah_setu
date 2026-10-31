import React from 'react';
import { AIRiskOutlook as AIRiskOutlookType } from '../types';

interface AIRiskOutlookProps {
  outlooks: AIRiskOutlookType[];
  onSelectPrediction?: (outlook: AIRiskOutlookType) => void;
  onViewFullOutlook?: () => void;
}

export const AIRiskOutlook: React.FC<AIRiskOutlookProps> = ({
  outlooks,
  onSelectPrediction,
  onViewFullOutlook,
}) => {
  // Show only the top 3 predicted risks
  const topRisks = outlooks.slice(0, 3);

  const getRiskBadge = (prob: number) => {
    if (prob >= 85) {
      return {
        pill: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
      };
    }
    if (prob >= 75) {
      return {
        pill: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    return {
      pill: 'text-blue-700 bg-blue-50 border-blue-200',
      dot: 'bg-blue-500',
    };
  };

  return (
    <div
      id="ai-risk-outlook-section"
      className="flex h-full flex-col rounded-lg border border-slate-200 bg-white overflow-hidden select-none shadow-2xs"
    >
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-slate-200 px-3.5 shrink-0 bg-slate-50/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wide text-slate-900 uppercase">
            AI Risk Outlook
          </span>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            Top 3 Risks
          </span>
        </div>
        {onViewFullOutlook ? (
          <button
            onClick={onViewFullOutlook}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
          >
            Predictive Model →
          </button>
        ) : (
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            12H Predictive Model
          </span>
        )}
      </div>

      {/* 3 Compact List Rows */}
      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {topRisks.map((item) => {
          const badge = getRiskBadge(item.probability);

          return (
            <div
              key={item.id}
              onClick={() => onSelectPrediction && onSelectPrediction(item)}
              className="flex cursor-pointer flex-col justify-center px-3.5 py-2.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 line-clamp-1 pr-2">
                  {item.title}
                </span>
                <span
                  className={`inline-flex items-center space-x-1 shrink-0 rounded border px-1.5 py-0.2 text-[10px] font-mono font-semibold ${badge.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                  <span>{item.probability}% Risk</span>
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate pr-2">{item.riskFactor}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {item.timeHorizon}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

