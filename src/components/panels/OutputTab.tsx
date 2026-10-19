import React, { useState } from 'react';
import { ExecutionResult } from '../../types/diagnostics';
import { Copy, Check, Trash2, Database, Terminal, Clock } from 'lucide-react';

interface OutputTabProps {
  result: ExecutionResult | null;
  onClear: () => void;
  language: string;
}

export const OutputTab: React.FC<OutputTabProps> = ({ result, onClear, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    let textToCopy = '';
    if (result.outputRows && result.outputRows.length > 0) {
      textToCopy = JSON.stringify(result.outputRows, null, 2);
    } else {
      textToCopy = (result.stdout || '') + '\n' + (result.stderr || '') + '\n' + (result.error || '');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white font-mono text-xs">
      {/* Output Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 capitalize">{language} Execution Output</span>
          {result?.executionTimeMs !== undefined && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono tabular-nums bg-slate-100 px-1.5 py-0.5 rounded-xs">
              <Clock className="w-2.5 h-2.5" />
              {result.executionTimeMs}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={!result}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40"
            title="Copy output"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>Copy</span>
          </button>
          <button
            onClick={onClear}
            disabled={!result}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40"
            title="Clear output"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-3">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 select-none font-sans">
            <Terminal className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">No execution output yet.</p>
            <p className="text-[11px] text-slate-400">Press "Run" to execute your program.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* If SQL Table rows exist */}
            {result.columns && result.columns.length > 0 && result.outputRows && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {result.columns.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-[11px] font-semibold text-slate-700 tracking-wider border-r border-slate-200 last:border-r-0"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {result.outputRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80">
                          {result.columns!.map((col) => (
                            <td
                              key={col}
                              className="px-3 py-1.5 text-xs text-slate-800 font-mono border-r border-slate-100 last:border-r-0 tabular-nums whitespace-nowrap"
                            >
                              {row[col] === null ? (
                                <span className="text-slate-400 italic">null</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Standard stdout */}
            {result.stdout && (
              <div className="text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
                {result.stdout}
              </div>
            )}

            {/* Standard stderr or error */}
            {(result.stderr || result.error) && (
              <div className="text-red-700 bg-red-50/70 p-2.5 rounded-md border border-red-200 whitespace-pre-wrap leading-relaxed font-mono">
                {result.stderr || result.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
