import React from 'react';
import { Diagnostic } from '../../types/diagnostics';
import { AlertOctagon, CheckCircle2, ArrowUpRight, Trash2 } from 'lucide-react';

interface ErrorsTabProps {
  runtimeErrors: Diagnostic[];
  onSelectError: (diag: Diagnostic) => void;
  onClearErrors: () => void;
}

export const ErrorsTab: React.FC<ErrorsTabProps> = ({
  runtimeErrors,
  onSelectError,
  onClearErrors,
}) => {
  return (
    <div className="flex flex-col h-full bg-white font-sans text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-red-700">
            {runtimeErrors.length} Runtime Error{runtimeErrors.length !== 1 ? 's' : ''}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 text-[10px]">Uncaught exceptions and runtime tracebacks</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearErrors}
            disabled={runtimeErrors.length === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40"
            title="Clear runtime errors"
          >
            <Trash2 className="w-3 h-3" />
            <span className="font-sans">Clear</span>
          </button>
        </div>
      </div>

      {/* Error List */}
      <div className="flex-1 overflow-y-auto divide-y divide-red-100">
        {runtimeErrors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 select-none">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
            <p className="font-medium text-slate-600">No runtime exceptions</p>
            <p className="text-[11px] text-slate-400">Programs executed without throwing uncaught errors.</p>
          </div>
        ) : (
          runtimeErrors.map((err) => (
            <div
              key={err.id}
              onClick={() => onSelectError(err)}
              className="p-3 hover:bg-red-50/50 transition-colors cursor-pointer group flex flex-col gap-1.5 bg-red-50/20"
            >
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-red-900 font-bold truncate">
                      {err.file}
                    </span>
                    <span className="text-[10px] text-red-800 font-mono tabular-nums bg-red-100 px-1.5 py-0.5 rounded-xs font-semibold">
                      Line {err.line}{err.column ? `, Col ${err.column}` : ''}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-100 px-1 rounded-xs">
                      [RUNTIME]
                    </span>
                  </div>

                  <p className="text-red-950 font-mono text-[11px] leading-relaxed break-words bg-red-50/80 p-2 rounded border border-red-200/60">
                    {err.message}
                  </p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 shrink-0 self-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
