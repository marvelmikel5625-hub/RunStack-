import React, { useState, useRef, useEffect } from 'react';
import { ConsoleMessage, ConsoleMessageType } from '../../types/diagnostics';
import { Trash2, Copy, Check, Info, AlertTriangle, AlertCircle, Terminal, CornerDownLeft } from 'lucide-react';

interface ConsoleTabProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  onEvaluate?: (command: string) => void;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({ messages, onClear, onEvaluate }) => {
  const [filter, setFilter] = useState<'all' | ConsoleMessageType>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [replInput, setReplInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const filteredMessages = messages.filter((m) => filter === 'all' || m.type === filter);

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleCopy = () => {
    const text = filteredMessages
      .map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] [${m.type.toUpperCase()}] ${m.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replInput.trim()) return;
    if (onEvaluate) {
      onEvaluate(replInput.trim());
    }
    setReplInput('');
  };

  const getMessageIcon = (type: ConsoleMessageType) => {
    switch (type) {
      case 'info':
        return <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />;
      default:
        return <span className="text-slate-400 select-none text-[11px] shrink-0 font-mono mt-0.5">&gt;</span>;
    }
  };

  const getRowStyle = (type: ConsoleMessageType) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50/50 text-blue-900 border-l-2 border-blue-400';
      case 'warn':
        return 'bg-amber-50/50 text-amber-900 border-l-2 border-amber-400';
      case 'error':
        return 'bg-red-50/60 text-red-900 border-l-2 border-red-500';
      default:
        return 'hover:bg-slate-50 text-slate-800 border-l-2 border-transparent';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-mono text-xs">
      {/* Console Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] shrink-0">
        {/* Filters */}
        <div className="flex items-center gap-1">
          {(['all', 'log', 'info', 'warn', 'error'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2 py-0.5 rounded-sm font-sans capitalize transition-colors ${
                filter === type
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-slate-500 font-sans cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded-xs text-blue-600 focus:ring-0"
            />
            <span>Auto-scroll</span>
          </label>

          <button
            onClick={handleCopy}
            disabled={filteredMessages.length === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40"
            title="Copy console output"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span className="font-sans">Copy</span>
          </button>

          <button
            onClick={onClear}
            disabled={messages.length === 0}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40"
            title="Clear console"
          >
            <Trash2 className="w-3 h-3" />
            <span className="font-sans">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-slate-400 select-none">
            <Terminal className="w-6 h-6 mb-1 opacity-40" />
            <p className="font-sans text-xs">Console is clear.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 px-2 py-1 rounded-sm leading-relaxed ${getRowStyle(msg.type)}`}
            >
              {getMessageIcon(msg.type)}
              <span className="flex-1 break-words whitespace-pre-wrap">{msg.text}</span>
              <span className="text-[10px] text-slate-400 shrink-0 font-sans tabular-nums select-none">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Interactive REPL Prompt */}
      {onEvaluate && (
        <form onSubmit={handleReplSubmit} className="flex items-center border-t border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs shrink-0">
          <span className="text-blue-600 font-bold mr-1.5 select-none">&gt;</span>
          <input
            type="text"
            value={replInput}
            onChange={(e) => setReplInput(e.target.value)}
            placeholder="Evaluate JavaScript expression in live environment... (e.g. 2 + 2, document.title)"
            className="flex-1 bg-transparent border-0 focus:outline-none text-slate-800 placeholder:text-slate-400 font-mono text-xs"
          />
          <button
            type="submit"
            disabled={!replInput.trim()}
            className="p-1 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30"
            title="Evaluate (Enter)"
          >
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      )}
    </div>
  );
};
