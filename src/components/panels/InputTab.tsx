import React from 'react';
import { Keyboard, ArrowDownToLine, Trash2 } from 'lucide-react';

interface InputTabProps {
  inputValue: string;
  onChange: (val: string) => void;
}

export const InputTab: React.FC<InputTabProps> = ({ inputValue, onChange }) => {
  return (
    <div className="flex flex-col h-full bg-white font-sans text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium text-slate-700">Interactive Standard Input (stdin)</span>
        </div>

        <button
          onClick={() => onChange('')}
          disabled={!inputValue}
          className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40"
          title="Clear input"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="p-2.5 flex-1 flex flex-col gap-2">
        <p className="text-[11px] text-slate-500">
          Provide inputs for programs using <code>input()</code> or <code>sys.stdin</code>. Separate multiple inputs with new lines.
        </p>

        <textarea
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`e.g.\nAlice\n42\nyes`}
          className="flex-1 w-full p-2.5 font-mono text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
};
