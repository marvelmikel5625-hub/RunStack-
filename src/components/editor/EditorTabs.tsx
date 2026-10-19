import React from 'react';
import { ProjectFile } from '../../types/project';
import {
  X,
  Plus,
  FileCode,
  Globe,
  Palette,
  Terminal,
  Database,
  FileText,
  Search,
  Sparkles,
  Sun,
  Moon,
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
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onNewFileClick,
  dirtyFileIds = new Set(),
  onTriggerFind,
  onFormatDocument,
  theme,
  onToggleTheme,
}) => {
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
    if (fileName.endsWith('.css')) return <Palette className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) return <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (fileName.endsWith('.py')) return <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (fileName.endsWith('.sql')) return <Database className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div className="flex items-center justify-between bg-slate-100 border-b border-slate-200 h-9 px-1 select-none shrink-0 overflow-hidden">
      {/* Scrollable Tabs */}
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

              {isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" title="Unsaved changes" />
              )}

              {onCloseTab && files.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
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

      {/* Editor Actions: Search, Format, Theme Toggle */}
      <div className="flex items-center gap-1 shrink-0">
        {onTriggerFind && (
          <button
            onClick={onTriggerFind}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            title="Search & Find in Editor (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        )}

        {onFormatDocument && (
          <button
            onClick={onFormatDocument}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors hidden sm:inline-flex"
            title="Format Code Document"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            title={`Switch to ${theme === 'vs' ? 'Dark' : 'Light'} Editor Theme`}
          >
            {theme === 'vs' ? (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
