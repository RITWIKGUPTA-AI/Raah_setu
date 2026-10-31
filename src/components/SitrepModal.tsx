import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Shield,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SitrepModal: React.FC<SitrepModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sitrepText = `================================================================================
GOVERNMENT OF INDIA • MINISTRY OF ROAD TRANSPORT & DISASTER OPERATIONS
VECTOR COMMAND NODE — NORTH EASTERN EMERGENCY OPERATIONS CENTER (NE-EOC)
SITUATION REPORT (SITREP) #NER-2026-0907-0930
CLASSIFICATION: OFFICIAL USE ONLY (OUO) • ACTIVE OPERATIONAL OVERVIEW
================================================================================

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
- Overall Regional Road Navigability: 92.0% (4,812 km / 5,230 km open).
- Active Logged Incidents: 37 total across 8 North Eastern States.
  - Critical Incidents: 8 (Immediate intervention by BRO & SDRF).
  - High Attention: 14.
  - Monitored: 15.
- Logistical Fleet Under Tracking: 428 active convoys (23 delayed, 381 on-schedule).
- Essential Deliveries Throughput: 1,284 dispatches (96% on-time delivery metric).

2. CRITICAL BOTTLENECK: NH-29 (DIMAPUR-KOHIMA)
--------------------------------------------------------------------------------
- Location: Km 42, Paglapahar Chasm, Nagaland.
- Status: TOTAL BLOCKAGE due to 4,000 cu.m continuous rockfall and road breach.
- Current Operations: BRO Project Sewak Task Force 74 deployed with 3 heavy excavators.
- Estimated Clearance: 14:30 IST (~5.0 hrs).
- Traffic Diversion: Light vehicles diverted through Old Medziphema Hill Road (<3.5T).
- Heavy Goods & POL Tankers: Held at Dimapur and Chumoukedima staging yards.

3. SENSITIVE LOGISTICS STATUS: MED-CONVOY-09
--------------------------------------------------------------------------------
- Asset: MED-09 (4-vehicle medical supply convoy).
- Cargo: Anti-venom vials, insulin serums, and pediatric ICU resuscitation units.
- Situation: Front transmission mechanical failure 4.2 km prior to Churachandpur.
- Action: NDRF Heavy Field Recovery Vehicle en-route with estimated tow arrival 20m.

4. AI RISK FORECASTING (NEXT 6 HOURS)
--------------------------------------------------------------------------------
- NH-29 Secondary Rockfall: 89% probability (11:00 - 15:00 IST) due to 45mm/h rain.
- Brahmaputra Surge (Tezpur): 84% probability of ro-ro ferry suspension by 16:00 IST.
- Barapani Logistics Corridor: Transit delay +3.5h expected due to convective storm cell.

5. SIGN-OFF & AUTHORIZATION
--------------------------------------------------------------------------------
Duty Officer: Col. R. Bhattacharya (Retd.), Director Operations, NE Command
Clearance ID: NIC-GOV-NER-440912
Timestamp: 07-SEP-2026 09:30:00 IST
================================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sitrepText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([sitrepText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `VECTOR_SITREP_NER_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      id="sitrep-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4">
          <div className="flex items-center space-x-2.5">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Operational Situation Report (SITREP)
            </span>
            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
              #NER-0907
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="rounded-md border border-slate-200 bg-white p-4 font-mono text-[11px] leading-relaxed text-slate-800 shadow-2xs">
            <pre className="whitespace-pre-wrap select-all font-mono">
              {sitrepText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>NIC Encrypted Digital Cryptographic Signature</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export SITREP (.txt)</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
