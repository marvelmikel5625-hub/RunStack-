import React, { useState } from 'react';
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
  Replace,
  Sparkles,
  Sun,
  Moon,
  Undo2,
  Redo2,
  WrapText,
  Hash,
  Download,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react';

interface EditorTabsProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectTab: (fileId: string) => void;
  onCloseTab?: (fileId: string) => void;
  onNewFileClick?: () => void;
  dirtyFileIds?: Set<string>;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onCopySelection?: () => void;
  onTriggerFind?: () => void;
  onTriggerReplace?: () => void;
  onFormatDocument?: () => void;
  wordWrap?: 'on' | 'off';
  onToggleWordWrap?: () => void;
  lineNumbers?: 'on' | 'off';
  onToggleLineNumbers?: () => void;
  fontSize?: number;
  onChangeFontSize?: (delta: number) => void;
  onDownloadCurrentFile?: () => void;
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
  onUndo,
  onRedo,
  onSelectAll,
  onCopySelection,
  onTriggerFind,
  onTriggerReplace,
  onFormatDocument,
  wordWrap = 'on',
  onToggleWordWrap,
  lineNumbers = 'on',
  onToggleLineNumbers,
  fontSize = 14,
  onChangeFontSize,
  onDownloadCurrentFile,
  theme,
  onToggleTheme,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
    if (fileName.endsWith('.css')) return <Palette className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return <FileCode className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    if (fileName.endsWith('.py')) return <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (fileName.endsWith('.sql')) return <Database className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const handleCopy = () => {
    if (onCopySelection) {
      onCopySelection();
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    }
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
                  className="p-0.5 rounded-xs text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
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
            className="p-1 ml-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors shrink-0 cursor-pointer"
            title="Create new file tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Editor Controls Bar */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Undo / Redo */}
        {onUndo && (
          <button
            onClick={onUndo}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Find & Replace */}
        {onTriggerFind && (
          <button
            onClick={onTriggerFind}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Search & Find in Editor (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        )}
        {onTriggerReplace && (
          <button
            onClick={onTriggerReplace}
            className="hidden sm:inline-flex p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Find and Replace (Ctrl+H)"
          >
            <Replace className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Format Document */}
        {onFormatDocument && (
          <button
            onClick={onFormatDocument}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors hidden md:inline-flex cursor-pointer"
            title="Format Code Document"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Word Wrap Toggle */}
        {onToggleWordWrap && (
          <button
            onClick={onToggleWordWrap}
            className={`hidden md:inline-flex p-1.5 rounded-md transition-colors cursor-pointer ${
              wordWrap === 'on'
                ? 'bg-blue-100 text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={`Word Wrap: ${wordWrap === 'on' ? 'Enabled' : 'Disabled'}`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Line Numbers Toggle */}
        {onToggleLineNumbers && (
          <button
            onClick={onToggleLineNumbers}
            className={`hidden lg:inline-flex p-1.5 rounded-md transition-colors cursor-pointer ${
              lineNumbers === 'on'
                ? 'bg-blue-100 text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={`Line Numbers: ${lineNumbers === 'on' ? 'Visible' : 'Hidden'}`}
          >
            <Hash className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Font Size decrease / increase */}
        {onChangeFontSize && (
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-200/60 p-0.5 rounded-md">
            <button
              onClick={() => onChangeFontSize(-1)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xs transition-colors cursor-pointer"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-600">{fontSize}</span>
            <button
              onClick={() => onChangeFontSize(1)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xs transition-colors cursor-pointer"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Download File */}
        {onDownloadCurrentFile && (
          <button
            onClick={onDownloadCurrentFile}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors hidden sm:inline-flex cursor-pointer"
            title="Download Active File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title={`Switch to ${theme === 'vs' ? 'Dark' : 'Light'} Editor Theme`}
          >
            {theme === 'vs' ? (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
        )}

        {/* More Menu Dropdown for mobile and compact screens */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="More Editor Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
              {onSelectAll && (
                <button
                  onClick={() => {
                    onSelectAll();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>Select All</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
                </button>
              )}
              {onCopySelection && (
                <button
                  onClick={() => {
                    handleCopy();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>{copyFeedback ? 'Copied!' : 'Copy Code'}</span>
                  {copyFeedback ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              )}
              {onFormatDocument && (
                <button
                  onClick={() => {
                    onFormatDocument();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  <span>Format Code</span>
                </button>
              )}
              {onToggleWordWrap && (
                <button
                  onClick={() => {
                    onToggleWordWrap();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>Word Wrap</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{wordWrap === 'on' ? 'ON' : 'OFF'}</span>
                </button>
              )}
              {onToggleLineNumbers && (
                <button
                  onClick={() => {
                    onToggleLineNumbers();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>Line Numbers</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{lineNumbers === 'on' ? 'ON' : 'OFF'}</span>
                </button>
              )}
              {onDownloadCurrentFile && (
                <button
                  onClick={() => {
                    onDownloadCurrentFile();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 border-t border-slate-100 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download This File</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
