import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  selectedState: string;
  onSelectState: (state: string) => void;
  onOpenSitrep: () => void;
  onOpenBroadcast: () => void;
  lastSyncTime: string;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Command Dashboard',
  subtitle = 'North Eastern Region • Live operational overview',
  selectedState,
  onSelectState,
  onOpenSitrep,
  onOpenBroadcast,
  lastSyncTime,
  isSyncing,
  onTriggerSync,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const stateOptions = [
    { id: 'all', label: 'North Eastern Region (All 8)' },
    { id: 'Assam', label: 'Assam' },
    { id: 'Meghalaya', label: 'Meghalaya' },
    { id: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { id: 'Nagaland', label: 'Nagaland' },
    { id: 'Manipur', label: 'Manipur' },
    { id: 'Mizoram', label: 'Mizoram' },
    { id: 'Tripura', label: 'Tripura' },
    { id: 'Sikkim', label: 'Sikkim' },
  ];

  return (
    <header
      id="vector-command-header"
      className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between shrink-0 select-none shadow-2xs"
    >
      {/* Title and Scope */}
      <div className="flex items-center space-x-3">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-snug">
            {title}
          </h1>
          <p className="text-xs text-slate-500 leading-tight">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Theme selector, Region selector, Sync, SITREP, Broadcast */}
      <div className="flex items-center space-x-2">
        {/* Theme / Background Color Selector */}
        <ThemeSelector />

        {/* Region Selector Dropdown */}
        <div className="relative">
          <button
            id="sector-filter-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-8 items-center space-x-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <span className="truncate max-w-[170px]">
              {stateOptions.find((o) => o.id === selectedState)?.label || 'North Eastern Region'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-1.5 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Jurisdiction
              </div>
              {stateOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelectState(opt.id);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 ${
                    selectedState === opt.id
                      ? 'bg-blue-50/70 font-semibold text-blue-900'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedState === opt.id && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sync Button */}
        <button
          id="sync-telemetry-btn"
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="flex h-8 items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-colors shadow-2xs"
          title={`Last sync: ${lastSyncTime}`}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`}
          />
          <span className="text-xs font-medium">Sync</span>
        </button>

        {/* SITREP Button */}
        <button
          id="open-sitrep-modal-btn"
          onClick={onOpenSitrep}
          className="flex h-8 items-center space-x-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-slate-600" />
          <span>SITREP</span>
        </button>

        {/* Broadcast Button */}
        <button
          id="open-broadcast-modal-btn"
          onClick={onOpenBroadcast}
          className="flex h-8 items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors shadow-2xs"
          title="Emergency broadcast"
        >
          <Radio className="h-3.5 w-3.5 text-slate-500 hover:text-rose-600" />
          <span className="text-xs font-medium">Broadcast</span>
        </button>
      </div>
    </header>
  );
};

