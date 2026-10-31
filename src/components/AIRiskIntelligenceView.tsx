import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CloudRain,
  Mountain,
  History,
  Activity,
  Truck,
  Waves,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Filter,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import {
  AI_RISK_METRICS,
  AI_RISK_CORRIDORS,
  REGIONAL_RISK_FACTORS_OVERVIEW,
} from '../data/mockOperationalIntelligence';
import { AIRiskCorridor } from '../types';

interface AIRiskIntelligenceViewProps {
  onNavigateToCorridorMap?: (corridor: AIRiskCorridor) => void;
}

type TimelineStep = 'now' | 'plus3h' | 'plus6h' | 'plus12h' | 'plus24h';

export const AIRiskIntelligenceView: React.FC<AIRiskIntelligenceViewProps> = ({
  onNavigateToCorridorMap,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<AIRiskCorridor | null>(
    AI_RISK_CORRIDORS[0]
  );
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineStep>('now');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  // States available in dataset
  const states = useMemo(() => {
    const s = new Set(AI_RISK_CORRIDORS.map((c) => c.state));
    return ['all', ...Array.from(s)];
  }, []);

  // Filtered corridors
  const filteredCorridors = useMemo(() => {
    return AI_RISK_CORRIDORS.filter((c) => {
      const matchState = stateFilter === 'all' || c.state === stateFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        c.corridorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.corridorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primaryHazard.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchSearch;
    });
  }, [stateFilter, searchQuery]);

  // Risk probability accessor based on selected timeline step
  const getProbabilityAtTimeline = (corridor: AIRiskCorridor, step: TimelineStep) => {
    return corridor.timeline[step];
  };

  const getRiskBadge = (prob: number) => {
    if (prob >= 80) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        bar: 'bg-rose-600',
        label: 'Critical Risk',
      };
    }
    if (prob >= 60) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
        label: 'High Risk',
      };
    }
    if (prob >= 35) {
      return {
        bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        bar: 'bg-yellow-500',
        label: 'Moderate Risk',
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
      label: 'Low Risk',
    };
  };

  const timelineSteps: { id: TimelineStep; label: string; offset: string }[] = [
    { id: 'now', label: 'NOW', offset: 'Live Telemetry' },
    { id: 'plus3h', label: '+3 HOURS', offset: 'Short-range IMD Radar' },
    { id: 'plus6h', label: '+6 HOURS', offset: 'Precipitation Peak' },
    { id: 'plus12h', label: '+12 HOURS', offset: 'Hydrological Crest' },
    { id: 'plus24h', label: '+24 HOURS', offset: 'Catchment Drainage' },
  ];

  const getFactorIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'rainfall':
        return <CloudRain className="h-4 w-4 text-blue-600" />;
      case 'terrain':
        return <Mountain className="h-4 w-4 text-amber-700" />;
      case 'historical incidents':
        return <History className="h-4 w-4 text-slate-700" />;
      case 'road condition':
        return <Activity className="h-4 w-4 text-indigo-600" />;
      case 'traffic':
        return <Truck className="h-4 w-4 text-emerald-600" />;
      case 'flood probability':
        return <Waves className="h-4 w-4 text-cyan-600" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div
      id="ai-risk-intelligence-page"
      className="flex flex-1 flex-col overflow-hidden bg-[#F8FAFC] select-none"
    >
      {/* PAGE HEADER */}
      <header
        id="ai-risk-header"
        className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white shadow-2xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                AI Risk Intelligence
              </h1>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                PROBABILISTIC MODEL v4.8
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-tight">
              Predictive disruption monitoring • Continuous sensor fusion for North Eastern Corridors
            </p>
          </div>
        </div>

        {/* Telemetry status indicators */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium">InSAR & Met Doppler Linked</span>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            Cycle: <span className="font-mono font-semibold text-slate-700">15m refresh</span>
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TOP: THREE COMPACT METRICS */}
        <section
          id="ai-risk-metrics-top"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3 shrink-0"
        >
          {/* Metric 1: High Risk Corridors */}
          <div
            id="metric-high-risk-corridors"
            className="flex items-center justify-between rounded-lg border border-rose-200/80 bg-white p-3.5 shadow-2xs"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                High Risk Corridors
              </span>
              <div className="text-2xl font-bold font-mono tracking-tight text-rose-700">
                {AI_RISK_METRICS.highRiskCorridors}
              </div>
              <p className="text-[11px] text-slate-500">Disruption probability &gt; 60%</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Metric 2: Predicted Disruptions */}
          <div
            id="metric-predicted-disruptions"
            className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white p-3.5 shadow-2xs"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Predicted Disruptions
              </span>
              <div className="text-2xl font-bold font-mono tracking-tight text-amber-700">
                {AI_RISK_METRICS.predictedDisruptions}
              </div>
              <p className="text-[11px] text-slate-500">Expected within 12 hours</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {/* Metric 3: Regions at Risk */}
          <div
            id="metric-regions-at-risk"
            className="flex items-center justify-between rounded-lg border border-blue-200/80 bg-white p-3.5 shadow-2xs"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Regions at Risk
              </span>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                {AI_RISK_METRICS.regionsAtRisk}
              </div>
              <p className="text-[11px] text-slate-500">Sub-divisions under advisory</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </section>

        {/* RISK FACTORS: COMPACT SECTION */}
        <section
          id="risk-factors-section"
          className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Composite Risk Factors Breakdown
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                6 Verified Parameters
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Weighted input vectors driving corridor probabilities
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {REGIONAL_RISK_FACTORS_OVERVIEW.map((factor) => {
              const isSelected = selectedFactor === factor.name;
              return (
                <div
                  key={factor.name}
                  id={`risk-factor-${factor.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() =>
                    setSelectedFactor(isSelected ? null : factor.name)
                  }
                  className={`cursor-pointer rounded-md border p-2.5 transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {factor.name}
                    </span>
                    {getFactorIcon(factor.name)}
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {factor.score}%
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1 rounded ${
                        factor.score >= 80
                          ? 'bg-rose-100 text-rose-800'
                          : factor.score >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {factor.level}
                    </span>
                  </div>
                  {/* Micro Progress Bar */}
                  <div className="h-1 w-full rounded-full bg-slate-200 overflow-hidden mb-1.5">
                    <div
                      className={`h-full ${
                        factor.score >= 80
                          ? 'bg-rose-600'
                          : factor.score >= 60
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    {factor.metric}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active factor explanatory expander */}
          {selectedFactor && (
            <div className="mt-2.5 rounded border border-blue-200 bg-blue-50/40 p-2 text-xs text-slate-700 flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-blue-900">
                  {selectedFactor} Context:{' '}
                </strong>
                {
                  REGIONAL_RISK_FACTORS_OVERVIEW.find(
                    (f) => f.name === selectedFactor
                  )?.detail
                }{' '}
                <span className="font-mono text-[11px] text-slate-600">
                  (Trigger:{' '}
                  {
                    REGIONAL_RISK_FACTORS_OVERVIEW.find(
                      (f) => f.name === selectedFactor
                    )?.primaryTrigger
                  }
                  )
                </span>
              </div>
            </div>
          )}
        </section>

        {/* MAIN: CLEAN RISK MONITORING LIST & DETAIL INSPECTOR */}
        <section id="ai-risk-main-list-section" className="space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  id="corridor-search-input"
                  type="text"
                  placeholder="Search corridor, state or hazard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-56 rounded border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* State Filter Buttons */}
              <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                {states.map((st) => (
                  <button
                    key={st}
                    onClick={() => setStateFilter(st)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      stateFilter === st
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All States' : st}
                  </button>
                ))}
              </div>
            </div>

            <span className="font-mono text-xs text-slate-500">
              Showing {filteredCorridors.length} of {AI_RISK_CORRIDORS.length} monitored routes
            </span>
          </div>

          {/* List Layout with Side-by-side or Scannable Table */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* Left Corridor Feed */}
            <div className="lg:col-span-7 space-y-2">
              {filteredCorridors.map((corridor) => {
                const isSelected = selectedCorridor?.id === corridor.id;
                const prob = getProbabilityAtTimeline(corridor, selectedTimeline);
                const badge = getRiskBadge(prob);

                return (
                  <div
                    key={corridor.id}
                    id={`corridor-item-${corridor.corridorCode.toLowerCase()}`}
                    onClick={() => setSelectedCorridor(corridor)}
                    className={`cursor-pointer rounded-lg border transition-all p-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-8 w-14 items-center justify-center rounded bg-slate-900 font-mono font-bold text-xs text-white">
                          {corridor.corridorCode}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">
                              {corridor.corridorName}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] font-medium text-slate-600 border border-slate-200">
                              {corridor.state}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                              {corridor.primaryHazard}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[11px]">
                              {corridor.expectedTimeframe}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Disruption Probability Pill */}
                      <div className="text-right shrink-0">
                        <div
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${badge.bg}`}
                        >
                          {prob}% disruption probability
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-slate-400">
                          {badge.label} @ {selectedTimeline.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Clean Progress Meter */}
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${badge.bar}`}
                        style={{ width: `${prob}%` }}
                      />
                    </div>

                    {/* Footer tags */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        <span>
                          Convoys active:{' '}
                          <strong className="font-mono text-slate-700">
                            {corridor.affectedConvoys}
                          </strong>
                        </span>
                        <span>
                          Model Confidence:{' '}
                          <strong className="font-mono text-slate-700">
                            {corridor.confidenceScore}%
                          </strong>
                        </span>
                      </div>
                      <span className="text-blue-600 font-medium flex items-center text-[11px]">
                        Inspect details <ChevronRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Detailed Corridor Inspector */}
            <div className="lg:col-span-5">
              {selectedCorridor ? (
                <div
                  id="corridor-detail-panel"
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs sticky top-4 space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                          {selectedCorridor.corridorCode}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900">
                          {selectedCorridor.state} Regional Corridor
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedCorridor.corridorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-slate-900">
                        {getProbabilityAtTimeline(selectedCorridor, selectedTimeline)}%
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Current Forecast
                      </span>
                    </div>
                  </div>

                  {/* Primary Trigger & Expected Horizon */}
                  <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 space-y-1 text-xs">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Disruption Assessment
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      {selectedCorridor.primaryHazard}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Window: {selectedCorridor.expectedTimeframe} • Model confidence:{' '}
                      {selectedCorridor.confidenceScore}%
                    </div>
                  </div>

                  {/* Factor Contribution Bars for Selected Corridor */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Factor Sensitivities
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(selectedCorridor.riskFactors).map(([key, rawVal]) => {
                        const val = Number(rawVal);
                        const labels: Record<string, string> = {
                          rainfall: 'Rainfall Saturation',
                          terrain: 'Terrain & Slope Shear',
                          historical: 'Historical Incidents',
                          roadCondition: 'Road Condition',
                          traffic: 'Traffic & Freight Load',
                          floodProbability: 'Flood Probability',
                        };

                        return (
                          <div key={key} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-600">{labels[key] || key}</span>
                              <span className="font-mono font-semibold text-slate-900">
                                {val}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${
                                  val >= 80
                                    ? 'bg-rose-500'
                                    : val >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actionable Government Mitigation Step */}
                  <div className="rounded-md border border-blue-200 bg-blue-50/50 p-3 space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-blue-900 font-bold uppercase text-[10px] tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
                      <span>Recommended Action</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {selectedCorridor.recommendedAction}
                    </p>
                  </div>

                  {/* Sensor Ground Truth */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Telemetry Feeds
                    </span>
                    <ul className="space-y-1">
                      {selectedCorridor.sensorInputs.map((sensor, idx) => (
                        <li
                          key={idx}
                          className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>{sensor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                  Select a corridor from the list to view detailed risk factors.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOTTOM: PREDICTION TIMELINE */}
        <section
          id="prediction-timeline-section"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prediction Timeline • Changing Risk Levels
              </h3>
              <p className="text-xs text-slate-500">
                Scrub through predictive forecast horizons to track risk escalation or clearance
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-mono">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>Active Horizon: {selectedTimeline.toUpperCase()}</span>
            </div>
          </div>

          {/* Timeline Step Selector Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {timelineSteps.map((step) => {
              const isActive = selectedTimeline === step.id;
              // average risk across all corridors at this step
              const avgRisk = Math.round(
                AI_RISK_CORRIDORS.reduce(
                  (sum, c) => sum + c.timeline[step.id],
                  0
                ) / AI_RISK_CORRIDORS.length
              );

              return (
                <button
                  key={step.id}
                  id={`timeline-btn-${step.id}`}
                  onClick={() => setSelectedTimeline(step.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/60 shadow-2xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold tracking-wide ${
                        isActive ? 'text-blue-900' : 'text-slate-800'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {avgRisk}% avg
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {step.offset}
                  </div>
                  {/* Micro Progress Bar */}
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        avgRisk >= 60 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${avgRisk}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scannable Matrix of Changing Risk Across Corridors */}
          <div className="mt-2 overflow-x-auto rounded border border-slate-200 bg-slate-50/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-2 px-3">Corridor</th>
                  <th className="py-2 px-2">State</th>
                  <th className="py-2 px-2 text-center">NOW</th>
                  <th className="py-2 px-2 text-center">+3 HOURS</th>
                  <th className="py-2 px-2 text-center">+6 HOURS</th>
                  <th className="py-2 px-2 text-center">+12 HOURS</th>
                  <th className="py-2 px-2 text-center">+24 HOURS</th>
                  <th className="py-2 px-3 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 font-mono text-[11px]">
                {filteredCorridors.map((c) => {
                  const nowVal = c.timeline.now;
                  const futureVal = c.timeline.plus6h;
                  const isWorsening = futureVal > nowVal;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCorridor(c)}
                      className={`cursor-pointer hover:bg-white transition-colors ${
                        selectedCorridor?.id === c.id ? 'bg-blue-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {c.corridorCode}
                        <span className="font-normal text-slate-500 ml-1.5 hidden sm:inline">
                          ({c.corridorName.split('–')[0]?.trim() || c.corridorName})
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-600">{c.state}</td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            c.timeline.now >= 75
                              ? 'bg-rose-100 text-rose-800'
                              : c.timeline.now >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.timeline.now}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            c.timeline.plus3h >= 75
                              ? 'bg-rose-100 text-rose-800'
                              : c.timeline.plus3h >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.timeline.plus3h}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            c.timeline.plus6h >= 75
                              ? 'bg-rose-100 text-rose-800'
                              : c.timeline.plus6h >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.timeline.plus6h}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            c.timeline.plus12h >= 75
                              ? 'bg-rose-100 text-rose-800'
                              : c.timeline.plus12h >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.timeline.plus12h}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            c.timeline.plus24h >= 75
                              ? 'bg-rose-100 text-rose-800'
                              : c.timeline.plus24h >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.timeline.plus24h}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {isWorsening ? (
                          <span className="text-rose-600 font-sans font-semibold text-[10px]">
                            ▲ Escalating (+{futureVal - nowVal}%)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-sans font-semibold text-[10px]">
                            ▼ Clearing ({futureVal - nowVal}%)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
