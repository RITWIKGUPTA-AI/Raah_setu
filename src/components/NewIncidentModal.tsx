import React, { useState } from 'react';
import { IncidentMarker, IncidentCategory, SeverityLevel } from '../types';
import { X, Plus, AlertTriangle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateIncident: (incident: IncidentMarker) => void;
}

const NE_STATES = [
  'Assam',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
];

const OFFICERS_LIST = [
  { name: 'Col. R. Bhattacharya', role: 'Director Operations • NE Command' },
  { name: 'Smt. Ananya Saikia', role: 'ADC Logistics & Disaster Response' },
  { name: 'Maj. Neeraj Rawat', role: 'Officer Commanding, 117 RCC (BRO)' },
  { name: 'Er. Tomba Singh', role: 'Executive Engineer, PWD Highway Div' },
  { name: 'Maj. P. K. Gurung', role: 'Commander, BRO Task Force 33' },
  { name: 'Inspector T. Jamir', role: 'Nagaland Highway Traffic Command' },
];

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onCreateIncident,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('landslide');
  const [severity, setSeverity] = useState<SeverityLevel>('critical');
  const [roadName, setRoadName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Sikkim');
  const [latLng, setLatLng] = useState("27°15'N, 88°30'E");
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('BRO Field Control Room');
  const [assignedOfficerIndex, setAssignedOfficerIndex] = useState(0);
  const [recommendedAction, setRecommendedAction] = useState('');
  const [affectedVehicles, setAffectedVehicles] = useState(12);
  const [estimatedClearance, setEstimatedClearance] = useState('Within 4 hours');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !roadName.trim()) return;

    const officer = OFFICERS_LIST[assignedOfficerIndex];
    const generatedCode = `INC-NE-${Math.floor(380 + Math.random() * 80)}`;

    const newIncident: IncidentMarker = {
      id: `inc-manual-${Date.now()}`,
      code: generatedCode,
      title: title.trim(),
      category,
      severity,
      roadName: roadName.trim(),
      district: district.trim() || 'Command Sector',
      state,
      coordinates: [300 + Math.floor(Math.random() * 200), 200 + Math.floor(Math.random() * 150)],
      latLng: latLng.trim() || "26°10'N, 92°30'E",
      timestamp: 'Just now',
      reportedBy: reportedBy.trim() || 'Regional Control Hub',
      status: 'active',
      description:
        description.trim() ||
        'Emergency transport incident logged into VECTOR Command. Response protocols initiated.',
      dispatchedTeams: ['Regional Highway Patrol Unit', 'District Rapid Response Squad'],
      estimatedClearance: estimatedClearance.trim() || 'Assessment in progress',
      affectedVehicles: Number(affectedVehicles) || 0,
      verificationStatus: 'verified',
      assignedOfficer: officer.name,
      assignedOfficerRole: officer.role,
      recommendedAction:
        recommendedAction.trim() ||
        'Dispatch reconnaissance team, activate local detour corridor and monitor convoy movements.',
      photoUrl:
        category === 'flood'
          ? 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800&auto=format&fit=crop'
          : category === 'bridge_restriction'
          ? 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=800&auto=format&fit=crop'
          : category === 'road_damage'
          ? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      photoCaption: `Initial Field Reconnaissance Report • ${roadName.trim()}`,
    };

    onCreateIncident(newIncident);
    onClose();
  };

  return (
    <div
      id="new-incident-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="new-incident-modal"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Log New Transport Incident</h2>
              <p className="text-[11px] text-slate-500">
                Official government dispatch & regional coordination record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3 text-xs">
          {/* Incident Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Incident Title / Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Landslide — NH-10 — Sikkim or Flash Flooding Breach"
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Type & Severity in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Disruption Type *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="landslide">Landslide / Rockfall</option>
                <option value="flood">Flooding / Waterlogging</option>
                <option value="road_damage">Road Damage / Subsidence</option>
                <option value="bridge_restriction">Bridge Restriction / Structural</option>
                <option value="breakdown">Convoy Breakdown / Obstruction</option>
                <option value="weather">Extreme Weather / Visibility</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-semibold"
              >
                <option value="critical" className="text-rose-700 font-bold">Critical (Total Blockage)</option>
                <option value="high" className="text-amber-700 font-semibold">High (Severe Delay)</option>
                <option value="medium" className="text-yellow-700 font-medium">Medium (Restricted Flow)</option>
                <option value="info" className="text-blue-700 font-normal">Info (Precautionary)</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Highway / Route *
              </label>
              <input
                type="text"
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                placeholder="e.g. NH-10 Km 22"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Dhemaji"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {NE_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS & Reporter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                GPS Coordinates
              </label>
              <input
                type="text"
                value={latLng}
                onChange={(e) => setLatLng(e.target.value)}
                placeholder="e.g. 27°14'N, 88°31'E"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reported By (Agency)
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Project Swastik (BRO)"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Assigned Officer */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Assign Command Officer
            </label>
            <select
              value={assignedOfficerIndex}
              onChange={(e) => setAssignedOfficerIndex(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              {OFFICERS_LIST.map((off, idx) => (
                <option key={idx} value={idx}>
                  {off.name} — {off.role}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Initial Operational Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail size of obstruction, physical damage, and local weather conditions..."
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Recommended Action */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Recommended Action & Detour SOP
            </label>
            <input
              type="text"
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="e.g. Deploy 2 earthmovers; activate alternate bypass corridor for light transit."
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
            >
              Log Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
