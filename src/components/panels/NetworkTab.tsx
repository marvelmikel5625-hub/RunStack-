import React, { useState } from 'react';
import { NetworkRequestInfo } from '../../types/diagnostics';
import { Globe, Trash2, Copy, Check, ArrowDownRight, Clock } from 'lucide-react';

interface NetworkTabProps {
  requests: NetworkRequestInfo[];
  onClear: () => void;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({ requests, onClear }) => {
  const [filter, setFilter] = useState<'all' | 'fetch' | 'xhr'>('all');
  const [copied, setCopied] = useState(false);

  const filtered = requests.filter((r) => filter === 'all' || r.type === filter);

  const handleCopy = () => {
    const text = filtered
      .map(
        (r) =>
          `[${new Date(r.timestamp).toLocaleTimeString()}] ${r.method} ${r.url} -> ${r.status} (${r.durationMs}ms)`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: number | string) => {
    if (typeof status === 'number') {
      if (status >= 200 && status < 300) return 'text-emerald-700 bg-emerald-50';
      if (status >= 300 && status < 400) return 'text-blue-700 bg-blue-50';
      if (status >= 400 && status < 500) return 'text-amber-700 bg-amber-50';
      return 'text-red-700 bg-red-50';
    }
    return 'text-red-700 bg-red-50';
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-xs">
      {/* Network Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600 shrink-0">
        <div className="flex items-center gap-1">
          {(['all', 'fetch', 'xhr'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2 py-0.5 rounded-sm capitalize transition-colors cursor-pointer ${
                filter === t
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
          <span className="text-slate-400 font-mono text-[10px] ml-1">
            ({filtered.length} request{filtered.length !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={filtered.length === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            title="Copy network activity"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>Copy</span>
          </button>
          <button
            onClick={onClear}
            disabled={requests.length === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear network logs"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Network List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 font-mono">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 select-none font-sans">
            <Globe className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs font-medium text-slate-600">No network requests recorded</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Network calls made via <code>fetch()</code> or <code>XMLHttpRequest</code> in the live preview will appear here.
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
                <span className="px-1.5 py-0.5 rounded-xs font-bold text-[10px] bg-slate-100 text-slate-800 shrink-0">
                  {req.method}
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded-xs font-bold text-[10px] shrink-0 ${getStatusColor(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>

                <span className="truncate text-slate-800 font-mono text-[11px]" title={req.url}>
                  {req.url}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-500 font-sans">
                <span className="uppercase text-[9px] font-bold bg-slate-100 px-1 rounded-xs">
                  {req.type}
                </span>
                <span className="flex items-center gap-0.5 font-mono tabular-nums">
                  <Clock className="w-2.5 h-2.5" />
                  {req.durationMs}ms
                </span>
                <span className="tabular-nums text-slate-400 hidden sm:inline">
                  {new Date(req.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
