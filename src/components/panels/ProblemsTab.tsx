import React from 'react';
import { Diagnostic, DiagnosticSeverity } from '../../types/diagnostics';
import { AlertCircle, AlertTriangle, Info, ArrowUpRight, CheckCircle2, Wrench } from 'lucide-react';

interface ProblemsTabProps {
  diagnostics: Diagnostic[];
  onSelectDiagnostic: (diagnostic: Diagnostic) => void;
  onApplyFix?: (diagnostic: Diagnostic) => void;
}

export const ProblemsTab: React.FC<ProblemsTabProps> = ({
  diagnostics,
  onSelectDiagnostic,
  onApplyFix,
}) => {
  const getSeverityIcon = (severity: DiagnosticSeverity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <div className="flex flex-col h-full bg-white font-sans text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-700">
            {diagnostics.length} Problem{diagnostics.length !== 1 ? 's' : ''}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-red-600 font-medium">{errorCount} Errors</span>
          <span className="text-slate-400">·</span>
          <span className="text-amber-600 font-medium">{warningCount} Warnings</span>
        </div>

        <span className="text-[10px] text-slate-400">Click a problem to navigate to source code</span>
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {diagnostics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 select-none">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
            <p className="font-medium text-slate-600">No problems detected</p>
            <p className="text-[11px] text-slate-400">Your code passed syntax and static verification checks.</p>
          </div>
        ) : (
          diagnostics.map((diag) => (
            <div
              key={diag.id}
              onClick={() => onSelectDiagnostic(diag)}
              className="p-2.5 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col gap-1"
            >
              <div className="flex items-start gap-2">
                {getSeverityIcon(diag.severity)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-slate-900 font-semibold truncate max-w-sm">
                      {diag.file}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums bg-slate-100 px-1.5 py-0.5 rounded-xs">
                      Line {diag.line}{diag.column ? `, Col ${diag.column}` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      [{diag.source}]
                    </span>
                  </div>

                  <p className="text-slate-800 font-mono text-[11px] leading-relaxed break-words">
                    {diag.message}
                  </p>

                  {diag.suggestedFix && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50/70 p-1.5 rounded-sm border border-blue-200/60">
                      <Wrench className="w-3 h-3 text-blue-600 shrink-0" />
                      <span><strong>Suggested fix:</strong> {diag.suggestedFix}</span>
                    </div>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 shrink-0">
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
