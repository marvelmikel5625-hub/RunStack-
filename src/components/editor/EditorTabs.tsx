import React, { useState, useRef, useEffect } from 'react';
import { ProjectFile } from '../../types/project';
import {
  X, Plus, FileCode, Globe, Palette, Terminal, Database, FileText,
  Search, Sparkles, Sun, Moon, MoreVertical, Copy, Scissors, Clipboard,
  Undo2, Redo2, Trash2, Type, CaseSensitive, Replace, CheckSquare,
} from 'lucide-react';

interface EditorTabsProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectTab: (fileId: string) => void;
  onCloseTab?: (fileId: string) => void;
  onNewFileClick?: () => void;
  dirtyFileIds?: Set<string>;
  onTriggerFind?: () => void;
  onFormatDocument?: () => void;
  theme?: 'vs' | 'vs-dark';
  onToggleTheme?: () => void;
  // New actions
  onSelectAll?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearActiveFile?: () => void;
  onReplace?: () => void;
  onIncreaseFont?: () => void;
  onDecreaseFont?: () => void;
  onToggleWordWrap?: () => void;
  wordWrap?: 'on' | 'off';
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files, activeFileId, onSelectTab, onCloseTab, onNewFileClick,
  dirtyFileIds = new Set(), onTriggerFind, onFormatDocument, theme, onToggleTheme,
  onSelectAll, onCopy, onCut, onPaste, onUndo, onRedo, onClearActiveFile,
  onReplace, onIncreaseFont, onDecreaseFont, onToggleWordWrap, wordWrap,
}) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!actionsOpen) return;
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [actionsOpen]);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
    if (fileName.endsWith('.css')) return <Palette className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) return <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (fileName.endsWith('.py')) return <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (fileName.endsWith('.sql')) return <Database className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const run = (fn?: () => void) => {
    if (fn) fn();
    setActionsOpen(false);
  };

  return (
    <div className="flex items-center justify-between bg-slate-100 border-b border-slate-200 h-9 px-1 select-none shrink-0 overflow-hidden">
      <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1 mr-2">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isDirty = dirtyFileIds.has(file.id);
          return (
            <div
              key={file.id}
              onClick={() => onSelectTab(file.id)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-t border-t-2 transition-all cursor-pointer select-none max-w-[170px] shrink-0 truncate ${
                isActive
                  ? 'bg-white text-slate-900 border-blue-600 shadow-2xs'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200/70 hover:text-slate-800'
              }`}
              title={file.path}
            >
              {getFileIcon(file.name)}
              <span className="truncate">{file.name}</span>
              {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" title="Unsaved changes" />}
              {onCloseTab && files.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(file.id); }}
                  className="p-0.5 rounded-xs text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {onNewFileClick && (
          <button
            onClick={onNewFileClick}
            className="p-1 ml-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors shrink-0"
            title="Create new file tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onTriggerFind && (
          <button onClick={onTriggerFind} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors" title="Search & Find (Ctrl+F)">
            <Search className="w-3.5 h-3.5" />
          </button>
        )}
        {onFormatDocument && (
          <button onClick={onFormatDocument} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors hidden sm:inline-flex" title="Format Document">
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
        {onToggleTheme && (
          <button onClick={onToggleTheme} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors" title={`Switch to ${theme === 'vs' ? 'Dark' : 'Light'} Theme`}>
            {theme === 'vs' ? <Moon className="w-3.5 h-3.5 text-slate-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </button>
        )}

        {/* Editor Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setActionsOpen((v) => !v)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            title="Editor Actions"
            aria-haspopup="menu"
            aria-expanded={actionsOpen}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {actionsOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs" role="menu">
              <MenuItem icon={<CheckSquare className="w-3.5 h-3.5" />} label="Select All" shortcut="Ctrl+A" onClick={() => run(onSelectAll)} />
              <MenuItem icon={<Copy className="w-3.5 h-3.5" />} label="Copy" shortcut="Ctrl+C" onClick={() => run(onCopy)} />
              <MenuItem icon={<Scissors className="w-3.5 h-3.5" />} label="Cut" shortcut="Ctrl+X" onClick={() => run(onCut)} />
              <MenuItem icon={<Clipboard className="w-3.5 h-3.5" />} label="Paste" shortcut="Ctrl+V" onClick={() => run(onPaste)} />
              <MenuItem icon={<Replace className="w-3.5 h-3.5" />} label="Replace" shortcut="Ctrl+H" onClick={() => run(onReplace)} />
              <div className="border-t border-slate-100 my-1" />
              <MenuItem icon={<Undo2 className="w-3.5 h-3.5" />} label="Undo" shortcut="Ctrl+Z" onClick={() => run(onUndo)} />
              <MenuItem icon={<Redo2 className="w-3.5 h-3.5" />} label="Redo" shortcut="Ctrl+Y" onClick={() => run(onRedo)} />
              <div className="border-t border-slate-100 my-1" />
              <MenuItem icon={<Type className="w-3.5 h-3.5" />} label="Increase Font" onClick={() => run(onIncreaseFont)} />
              <MenuItem icon={<Type className="w-3.5 h-3.5 rotate-180" />} label="Decrease Font" onClick={() => run(onDecreaseFont)} />
              <MenuItem
                icon={<CaseSensitive className="w-3.5 h-3.5" />}
                label={`Word Wrap: ${wordWrap === 'on' ? 'ON' : 'OFF'}`}
                onClick={() => run(onToggleWordWrap)}
              />
              <div className="border-t border-slate-100 my-1" />
              <MenuItem
                icon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
                label="Clear Active File"
                onClick={() => run(onClearActiveFile)}
                danger
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  danger?: boolean;
}> = ({ icon, label, shortcut, onClick, danger }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`w-full px-3 py-1.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors ${
      danger ? 'text-red-700' : 'text-slate-700'
    }`}
  >
    <span className="flex items-center gap-2">
      <span className={danger ? 'text-red-600' : 'text-slate-500'}>{icon}</span>
      <span>{label}</span>
    </span>
    {shortcut && <span className="text-[10px] text-slate-400 font-mono">{shortcut}</span>}
  </button>
);
