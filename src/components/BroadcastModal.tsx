import React, { useState } from 'react';
import { AlertOctagon, X, Send, Radio, CheckCircle2 } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (message: string, channel: string) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendBroadcast,
}) => {
  const [selectedChannel, setSelectedChannel] = useState('ALL_CONVOYS');
  const [message, setMessage] = useState(
    'URGENT ADVISORY: NH-29 Paglapahar sector fully blocked due to 4000m³ rockfall. All heavy multi-axle freight hold at Dimapur staging yard. Diversion via Wokha for emergency light logistics only.'
  );
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    onSendBroadcast(message, selectedChannel);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      id="broadcast-modal-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
    >
      <div className="flex w-full max-w-lg flex-col rounded-lg border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Emergency Command Broadcast
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs text-slate-700">
          <div>
            <label className="mb-1 block font-semibold text-[11px] text-slate-700 uppercase tracking-wider">
              Broadcast Transmission Target
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL_CONVOYS">All Active Transport Convoys (428 units)</option>
              <option value="NH29_CORRIDOR">NH-29 Nagaland-Manipur Corridor Only</option>
              <option value="MEDICAL_PRIORITY">Medical & Essential Supplies Only</option>
              <option value="POLICE_BRO">State Highway Police & BRO Units</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-[11px] text-slate-700 uppercase tracking-wider">
              Emergency Advisory Text
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
            <Radio className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Advisory will be transmitted simultaneously via GSAT Satcom Telemetry and SMS Gateway.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-3">
          <span className="font-mono text-[10px] text-slate-500 font-medium">
            AUTH: DEFCON-2 ACTIVE PROTOCOL
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sentSuccess}
              className="flex items-center space-x-1.5 rounded-md border border-rose-600 bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Transmitted!</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmit Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
