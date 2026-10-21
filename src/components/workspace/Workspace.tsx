import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, ProjectFile, EditorSettings, SupportedLanguage } from '../../types/project';
import {
  ConsoleMessage,
  Diagnostic,
  ExecutionResult,
  AnimationInfo,
  NetworkRequestInfo,
} from '../../types/diagnostics';
import { CodeEditor, CodeEditorHandle } from '../editor/CodeEditor';
import { EditorTabs } from '../editor/EditorTabs';
import { LivePreview } from '../preview/LivePreview';
import { DeveloperPanel } from '../panels/DeveloperPanel';
import { FileExplorer } from '../explorer/FileExplorer';
import { SettingsModal } from '../modals/SettingsModal';
import { ZipImportModal } from '../modals/ZipImportModal';
import { RunStackLogo } from '../common/RunStackLogo';
import { SUPPORTED_LANGUAGES, STARTER_TEMPLATES } from '../../services/languages';
import { validateProjectFiles } from '../../services/diagnostics/validator';
import { pythonEngine, PythonEngineStatus } from '../../services/execution/pythonEngine';
import { sqlEngine } from '../../services/execution/sqlEngine';
import { exportProjectToZip, downloadSingleFile } from '../../services/zip/zipManager';
import { saveProject } from '../../services/storage/indexedDb';

import {
  Play,
  Save,
  Download,
  Settings,
  FolderTree,
  ChevronDown,
  Layers,
  ArrowLeft,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
  Columns2,
  PanelBottom,
  PanelRight,
  MoreHorizontal,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Loader2,
} from 'lucide-react';

export type WorkspaceExecutionStatus = 'ready' | 'initializing' | 'running' | 'completed' | 'error' | 'stopped';

interface WorkspaceProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateHome: () => void;
  onOpenNewProject: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onResetLayout: () => void;
  onClearAllLocalData: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  project,
  onUpdateProject,
  onNavigateHome,
  onOpenNewProject,
  settings,
  onUpdateSettings,
  onResetLayout,
  onClearAllLocalData,
}) => {
  const activeFile = project.files.find((f) => f.id === project.activeFileId) || project.files[0];

  // Editor ref for find & formatting actions
  const editorHandleRef = useRef<CodeEditorHandle | null>(null);

  // Dirty state tracking (unsaved changes)
  const [dirtyFileIds, setDirtyFileIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Execution Status State
  const [executionStatus, setExecutionStatus] = useState<WorkspaceExecutionStatus>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  // Layout states
  const [showExplorer, setShowExplorer] = useState(false);
  const [editorSplitPercent, setEditorSplitPercent] = useState<number>(50); // % width for editor on desktop
  const [isResizingSplit, setIsResizingSplit] = useState(false);
  const [maximizedArea, setMaximizedArea] = useState<'none' | 'editor' | 'preview' | 'panel'>('none');

  // Mobile dedicated view mode ('split' | 'editor' | 'preview' | 'panel')
  const [mobileView, setMobileView] = useState<'split' | 'editor' | 'preview' | 'panel'>('split');
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Runtime & Diagnostics state
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [staticDiagnostics, setStaticDiagnostics] = useState<Diagnostic[]>([]);
  const [runtimeErrors, setRuntimeErrors] = useState<Diagnostic[]>([]);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [stdinValue, setStdinValue] = useState('');
  const [animations, setAnimations] = useState<AnimationInfo[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequestInfo[]>([]);
  const [jumpToLine, setJumpToLine] = useState<{ line: number; column?: number; timestamp: number } | null>(null);

  // Animation controller for live preview
  const handleControlAnimation = (action: 'pause' | 'play' | 'restart' | 'rate', rate?: number) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          target: 'RUNSTACK_SANDBOX',
          action: 'CONTROL_ANIMATION',
          payload: { action, rate },
        },
        '*'
      );
    }
  };

  // Modals & Menus state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZipImportOpen, setIsZipImportOpen] = useState(false);
  const [isLanguageSelectOpen, setIsLanguageSelectOpen] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [unsupportedNotice, setUnsupportedNotice] = useState<string | null>(null);

  const mainSplitRef = useRef<HTMLDivElement | null>(null);

  // Visual Viewport tracking for mobile virtual keyboard responsiveness
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;

    const updateHeight = () => {
      setViewportHeight(vv.height);
    };

    vv.addEventListener('resize', updateHeight);
    vv.addEventListener('scroll', updateHeight);
    return () => {
      vv.removeEventListener('resize', updateHeight);
      vv.removeEventListener('scroll', updateHeight);
    };
  }, []);

  // Revalidate files whenever content changes and clear obsolete diagnostics
  useEffect(() => {
    const staticDiags = validateProjectFiles(project.files);
    setStaticDiagnostics(staticDiags);

    // If there are static syntax errors, update execution status to error
    if (staticDiags.some((d) => d.severity === 'error')) {
      setExecutionStatus('error');
      setStatusMessage('Syntax error detected');
    } else if (executionStatus === 'error' && runtimeErrors.length === 0) {
      setExecutionStatus('ready');
      setStatusMessage('Ready');
    }
  }, [project.files]);

  // Handle Code Change in active file
  const handleContentChange = (newContent: string) => {
    if (!activeFile) return;

    const updatedFiles = project.files.map((file) =>
      file.id === activeFile.id
        ? { ...file, content: newContent, updatedAt: Date.now() }
        : file
    );

    setDirtyFileIds((prev) => new Set(prev).add(activeFile.id));

    onUpdateProject({
      ...project,
      files: updatedFiles,
      updatedAt: Date.now(),
    });
  };

  // Switch active tab/file
  const handleSelectFile = (fileId: string) => {
    onUpdateProject({
      ...project,
      activeFileId: fileId,
    });
  };

  // Close tab
  const handleCloseTab = (fileId: string) => {
    if (project.files.length <= 1) return;
    const remaining = project.files.filter((f) => f.id !== fileId);
    onUpdateProject({
      ...project,
      files: remaining,
      activeFileId: fileId === project.activeFileId ? remaining[0].id : project.activeFileId,
    });
  };

  // Create new file
  const handleCreateFile = (path: string) => {
    const fileName = path.split('/').pop() || 'untitled.js';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const language =
      ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'py' ? 'python' : ext === 'sql' ? 'sql' : 'javascript';

    const newFile: ProjectFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: fileName,
      path: path.trim(),
      content: `// ${path}\n`,
      language,
      updatedAt: Date.now(),
    };

    onUpdateProject({
      ...project,
      files: [...project.files, newFile],
      activeFileId: newFile.id,
      updatedAt: Date.now(),
    });
  };

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    if (project.files.length <= 1) return;
    const remaining = project.files.filter((f) => f.id !== fileId);
    onUpdateProject({
      ...project,
      files: remaining,
      activeFileId: fileId === project.activeFileId ? remaining[0].id : project.activeFileId,
      updatedAt: Date.now(),
    });
  };

  // Rename file
  const handleRenameFile = (fileId: string, newPath: string) => {
    const fileName = newPath.split('/').pop() || 'renamed';
    const updated = project.files.map((f) =>
      f.id === fileId ? { ...f, name: fileName, path: newPath, updatedAt: Date.now() } : f
    );
    onUpdateProject({
      ...project,
      files: updated,
      updatedAt: Date.now(),
    });
  };

  // Save Project to IndexedDB
  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      await saveProject(project);
      setDirtyFileIds(new Set());
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut listener (Ctrl+S, Ctrl+Enter, Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        editorHandleRef.current?.triggerFind();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, stdinValue]);

  // Execute Code based on language
  const handleRun = async () => {
    const currentLang = project.language;
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.id === currentLang);

    if (langInfo && !langInfo.isAvailable) {
      setUnsupportedNotice(
        `Execution for ${langInfo.name} is currently unavailable. RunStack operates local-first and does not simulate or fake compiler outputs. Native container execution for compiled languages is scheduled for future updates.`
      );
      setExecutionStatus('error');
      setStatusMessage('Environment unavailable');
      return;
    }

    setExecutionStatus('running');
    setStatusMessage('Running...');

    if (currentLang === 'python') {
      onUpdateSettings({ activePanelTab: 'output', isPanelCollapsed: false });
      const pythonFile = project.files.find((f) => f.path.endsWith('.py')) || activeFile;

      setExecutionStatus('initializing');
      setStatusMessage('Initializing Pyodide WebAssembly...');

      const { result, diagnostics: pyDiags } = await pythonEngine.runPython(
        pythonFile?.content || '',
        (chunk, isErr) => {
          setConsoleMessages((prev) => [
            ...prev,
            {
              id: 'py_out_' + Date.now() + Math.random(),
              type: isErr ? 'error' : 'log',
              text: chunk.trim(),
              timestamp: Date.now(),
            },
          ]);
        },
        stdinValue
      );

      setExecutionResult(result);
      if (result.success) {
        setExecutionStatus('completed');
        setStatusMessage(`Completed in ${result.executionTimeMs}ms`);
      } else {
        setExecutionStatus('error');
        setStatusMessage('Execution failed');
      }

      if (pyDiags.length > 0) {
        setRuntimeErrors((prev) => [...prev, ...pyDiags]);
        onUpdateSettings({ activePanelTab: 'errors', isPanelCollapsed: false });
      }
    } else if (currentLang === 'sql') {
      onUpdateSettings({ activePanelTab: 'output', isPanelCollapsed: false });
      const sqlFile = project.files.find((f) => f.path.endsWith('.sql')) || activeFile;

      setExecutionStatus('running');
      setStatusMessage('Executing SQLite query...');

      const { result, diagnostics: sqlDiags } = await sqlEngine.runSql(sqlFile?.content || '');
      setExecutionResult(result);

      if (result.success) {
        setExecutionStatus('completed');
        setStatusMessage(`Completed in ${result.executionTimeMs}ms`);
      } else {
        setExecutionStatus('error');
        setStatusMessage('Query execution failed');
      }

      if (sqlDiags.length > 0) {
        setRuntimeErrors((prev) => [...prev, ...sqlDiags]);
        onUpdateSettings({ activePanelTab: 'errors', isPanelCollapsed: false });
      }
    } else {
      // Web project execution: trigger manual reload
      setExecutionStatus('running');
      setStatusMessage('Compiling web bundle...');

      // Find preview iframe and refresh
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.srcdoc = iframe.srcdoc;
      }

      setTimeout(() => {
        setExecutionStatus('completed');
        setStatusMessage('Live preview updated');
      }, 300);
    }
  };

  // Jump to Diagnostic Line in Editor
  const handleSelectDiagnostic = (diag: Diagnostic) => {
    const targetFile = project.files.find(
      (f) =>
        f.path === diag.file ||
        f.name === diag.file ||
        f.path.endsWith('/' + diag.file) ||
        diag.file.endsWith(f.name)
    );
    if (targetFile && targetFile.id !== project.activeFileId) {
      onUpdateProject({
        ...project,
        activeFileId: targetFile.id,
      });
    }

    setJumpToLine({
      line: diag.line,
      column: diag.column,
      timestamp: Date.now(),
    });

    if (maximizedArea === 'panel' || maximizedArea === 'preview') {
      setMaximizedArea('none');
    }

    if (mobileView !== 'editor' && mobileView !== 'split') {
      setMobileView('editor');
    }
  };

  // Navigate to internal file from live preview anchor click
  const handleNavigatePreviewPage = (targetPath: string) => {
    const clean = targetPath.replace(/^\.\//, '');
    const matched = project.files.find(
      (f) =>
        f.path === clean ||
        f.name === clean ||
        f.path.endsWith('/' + clean) ||
        f.path.replace(/^\/+/, '') === clean
    );
    if (matched) {
      handleSelectFile(matched.id);
    }
  };

  // Switch Language & Starter Template
  const handleSwitchLanguage = (newLang: SupportedLanguage) => {
    setIsLanguageSelectOpen(false);
    const template = STARTER_TEMPLATES[newLang];
    if (!template) return;

    const now = Date.now();
    const newFiles = template.files.map((f, idx) => ({
      id: `file_${newLang}_${idx}_${now}`,
      name: f.name,
      path: f.path,
      content: f.content,
      language: f.language,
      updatedAt: now,
    }));

    onUpdateProject({
      ...project,
      language: newLang,
      files: newFiles,
      activeFileId: newFiles[0].id,
      updatedAt: now,
    });

    setConsoleMessages([]);
    setRuntimeErrors([]);
    setExecutionResult(null);
    setExecutionStatus('ready');
    setStatusMessage('Ready');
  };

  // Evaluate Expression in Console REPL
  const handleEvaluateConsole = (code: string) => {
    setConsoleMessages((prev) => [
      ...prev,
      {
        id: 'repl_in_' + Date.now(),
        type: 'info',
        text: `> ${code}`,
        timestamp: Date.now(),
      },
    ]);

    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          target: 'RUNSTACK_SANDBOX',
          action: 'EVAL_CODE',
          code,
        },
        '*'
      );
    } else {
      try {
        const res = window.eval(code);
        setConsoleMessages((prev) => [
          ...prev,
          {
            id: 'repl_out_' + Date.now(),
            type: 'log',
            text: String(res),
            timestamp: Date.now(),
          },
        ]);
      } catch (err: unknown) {
        setConsoleMessages((prev) => [
          ...prev,
          {
            id: 'repl_err_' + Date.now(),
            type: 'error',
            text: String(err),
            timestamp: Date.now(),
          },
        ]);
      }
    }
  };

  // Drag Resizing for Splitter (Editor vs Preview on Desktop)
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSplit(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleSplitterMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingSplit || !mainSplitRef.current) return;
    const rect = mainSplitRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const totalWidth = rect.width;
    const percent = Math.max(20, Math.min(80, (offsetX / totalWidth) * 100));
    setEditorSplitPercent(percent);
  }, [isResizingSplit]);

  const handleSplitterMouseUp = useCallback(() => {
    if (isResizingSplit) {
      setIsResizingSplit(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isResizingSplit]);

  useEffect(() => {
    if (isResizingSplit) {
      window.addEventListener('mousemove', handleSplitterMouseMove);
      window.addEventListener('mouseup', handleSplitterMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleSplitterMouseMove);
      window.removeEventListener('mouseup', handleSplitterMouseUp);
    };
  }, [isResizingSplit, handleSplitterMouseMove, handleSplitterMouseUp]);

  // Reset Splitter to 50/50
  const handleResetSplitter = () => {
    setEditorSplitPercent(50);
    setMaximizedArea('none');
  };

  const isWebProject = ['html', 'css', 'javascript', 'html-css-js', 'typescript', 'react'].includes(project.language);

  // Status Indicator Styles
  const getStatusBadge = () => {
    switch (executionStatus) {
      case 'running':
      case 'initializing':
        return (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
            <span className="truncate max-w-[120px]">{statusMessage}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span className="truncate max-w-[120px]">{statusMessage}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
            <AlertOctagon className="w-3 h-3 text-red-600" />
            <span className="truncate max-w-[120px]">{statusMessage}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Ready</span>
          </div>
        );
    }
  };

  // Combine static and runtime diagnostics for Monaco markers
  const allCurrentDiagnostics = [...staticDiagnostics, ...runtimeErrors];

  return (
    <div
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
      className="flex flex-col w-full max-w-full bg-slate-100 overflow-hidden font-sans select-none"
    >
      {/* 1. TOP WORKSPACE TOOLBAR */}
      <header className="flex items-center justify-between px-3 h-12 bg-white border-b border-slate-200 shrink-0 z-30">
        {/* Left: Brand + Project Title + Explorer Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onNavigateHome}
            className="flex items-center justify-center p-2 min-w-[36px] min-h-[36px] text-slate-500 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            title="Exit to RunStack Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <RunStackLogo size="sm" showWordmark={false} />

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Project Title & Explorer Toggle */}
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              showExplorer
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle File Explorer"
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline font-semibold text-slate-900 truncate max-w-[130px] md:max-w-[180px]">
              {project.name}
            </span>
          </button>

          {dirtyFileIds.size > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />
          )}
        </div>

        {/* Center: Language Selector + Execution Status Badge + RUN Action */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageSelectOpen(!isLanguageSelectOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200 cursor-pointer"
              title="Select Execution Environment"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize hidden xs:inline">
                {SUPPORTED_LANGUAGES.find((l) => l.id === project.language)?.name || project.language}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isLanguageSelectOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 divide-y divide-slate-100 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400">
                  Select Language
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleSwitchLanguage(lang.id)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        project.language === lang.id ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lang.isAvailable ? 'Ready' : 'Container'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Execution Status Badge */}
          <div className="hidden lg:block">
            {getStatusBadge()}
          </div>

          {/* Primary RUN Action */}
          <button
            onClick={handleRun}
            disabled={executionStatus === 'running'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors shadow-2xs cursor-pointer disabled:opacity-50 min-h-[34px]"
            title="Run Code (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run</span>
          </button>
        </div>

        {/* Right: Desktop Actions & Mobile Menu Button */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Desktop Save */}
          <button
            onClick={handleSaveProject}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Save Project (Ctrl+S)"
          >
            {saveSuccessNotice ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Save</span>
          </button>

          {/* Desktop Layout Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Workspace Layout Menu"
            >
              <Columns2 className="w-4 h-4" />
            </button>

            {showLayoutMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                  Layout Controls
                </div>
                <button
                  onClick={() => {
                    setMaximizedArea(maximizedArea === 'editor' ? 'none' : 'editor');
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>Maximize Editor</span>
                  {maximizedArea === 'editor' && <Check className="w-3 h-3 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setMaximizedArea(maximizedArea === 'preview' ? 'none' : 'preview');
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>Maximize Preview</span>
                  {maximizedArea === 'preview' && <Check className="w-3 h-3 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    handleResetSplitter();
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore 50/50 Split</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                  Developer Panel
                </div>
                <button
                  onClick={() => {
                    onUpdateSettings({ panelPosition: 'bottom', isPanelCollapsed: false });
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <PanelBottom className="w-3.5 h-3.5" />
                  <span>Dock at Bottom</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateSettings({ panelPosition: 'right', isPanelCollapsed: false });
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <PanelRight className="w-3.5 h-3.5" />
                  <span>Dock at Right</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateSettings({ isPanelCollapsed: !settings.isPanelCollapsed });
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <span>{settings.isPanelCollapsed ? 'Show Panel' : 'Hide Panel'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Export ZIP */}
          <button
            onClick={() => exportProjectToZip(project)}
            className="hidden sm:inline-flex p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Export Entire Project as ZIP"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Desktop Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hidden sm:inline-flex p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile "More" Menu Toggle */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-md cursor-pointer"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMobileMoreMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    handleSaveProject();
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-800"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Project</span>
                </button>
                <button
                  onClick={() => {
                    exportProjectToZip(project);
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-800"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Project ZIP</span>
                </button>
                <button
                  onClick={() => {
                    setShowExplorer(!showExplorer);
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-800"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>File Explorer</span>
                </button>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-800 border-t border-slate-100"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE VIEW TOGGLE TABS (Mobile only) */}
      <div className="flex md:hidden items-center justify-around bg-slate-200/80 p-1 border-b border-slate-200 text-xs shrink-0">
        <button
          onClick={() => setMobileView('split')}
          className={`flex-1 py-1.5 text-center font-medium rounded-sm transition-colors ${
            mobileView === 'split' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
          }`}
        >
          Split View
        </button>
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-1.5 text-center font-medium rounded-sm transition-colors ${
            mobileView === 'editor' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-1.5 text-center font-medium rounded-sm transition-colors ${
            mobileView === 'preview' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setMobileView('panel')}
          className={`flex-1 py-1.5 text-center font-medium rounded-sm transition-colors flex items-center justify-center gap-1 ${
            mobileView === 'panel' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
          }`}
        >
          <span>DevTools</span>
          {(runtimeErrors.length > 0 || staticDiagnostics.length > 0) && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          )}
        </button>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Transparent drag overlay to prevent iframe stealing mouse events */}
        {isResizingSplit && (
          <div className="absolute inset-0 z-50 cursor-col-resize select-none" />
        )}

        {/* Collapsible File Explorer */}
        {showExplorer && (
          <FileExplorer
            files={project.files}
            activeFileId={project.activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            onDownloadFile={downloadSingleFile}
            onDownloadProjectZip={() => exportProjectToZip(project)}
            onOpenZipImportModal={() => setIsZipImportOpen(true)}
            projectName={project.name}
          />
        )}

        {/* Central Workspace Area: Left/Top Editor, Right/Bottom Preview, and Developer Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Main Workspace Column */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Upper Work Area: Side-by-side on desktop, vertical stack on mobile */}
            <div
              ref={mainSplitRef}
              className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
            >
              {/* CODE EDITOR CONTAINER */}
              <div
                style={{
                  width:
                    typeof window !== 'undefined' && window.innerWidth >= 768
                      ? maximizedArea === 'preview'
                        ? '0%'
                        : maximizedArea === 'editor'
                        ? '100%'
                        : `${editorSplitPercent}%`
                      : '100%',
                  display:
                    (mobileView === 'preview' || mobileView === 'panel') && typeof window !== 'undefined' && window.innerWidth < 768
                      ? 'none'
                      : maximizedArea === 'preview'
                      ? 'none'
                      : 'flex',
                }}
                className={`flex-col bg-white overflow-hidden ${
                  mobileView === 'split' ? 'h-1/2 md:h-full' : 'h-full'
                }`}
              >
                {/* Editor Tabs & Quick Actions */}
                <EditorTabs
                  files={project.files}
                  activeFileId={project.activeFileId}
                  onSelectTab={handleSelectFile}
                  onCloseTab={handleCloseTab}
                  onNewFileClick={() => handleCreateFile(`new_file_${project.files.length + 1}.js`)}
                  dirtyFileIds={dirtyFileIds}
                  onUndo={() => editorHandleRef.current?.undo()}
                  onRedo={() => editorHandleRef.current?.redo()}
                  onSelectAll={() => editorHandleRef.current?.selectAll()}
                  onCopySelection={() => editorHandleRef.current?.copySelection()}
                  onTriggerFind={() => editorHandleRef.current?.triggerFind()}
                  onTriggerReplace={() => editorHandleRef.current?.triggerReplace()}
                  onFormatDocument={() => editorHandleRef.current?.formatDocument()}
                  wordWrap={settings.wordWrap}
                  onToggleWordWrap={() =>
                    onUpdateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })
                  }
                  lineNumbers={settings.lineNumbers || 'on'}
                  onToggleLineNumbers={() =>
                    onUpdateSettings({ lineNumbers: settings.lineNumbers === 'off' ? 'on' : 'off' })
                  }
                  fontSize={settings.fontSize}
                  onChangeFontSize={(delta) =>
                    onUpdateSettings({ fontSize: Math.max(11, Math.min(24, settings.fontSize + delta)) })
                  }
                  onDownloadCurrentFile={() => activeFile && downloadSingleFile(activeFile)}
                  theme={settings.theme}
                  onToggleTheme={() =>
                    onUpdateSettings({ theme: settings.theme === 'vs' ? 'vs-dark' : 'vs' })
                  }
                />

                {/* Monaco Code Editor with Live Error Markers */}
                {activeFile && (
                  <div className="flex-1 relative overflow-hidden">
                    <CodeEditor
                      ref={editorHandleRef}
                      file={activeFile}
                      onChange={handleContentChange}
                      theme={settings.theme}
                      fontSize={settings.fontSize}
                      wordWrap={settings.wordWrap}
                      lineNumbers={settings.lineNumbers || 'on'}
                      jumpToLine={jumpToLine}
                      diagnostics={allCurrentDiagnostics}
                    />
                  </div>
                )}
              </div>

              {/* DESKTOP DRAGGABLE DIVIDER */}
              {maximizedArea === 'none' && isWebProject && (
                <div
                  onMouseDown={handleSplitterMouseDown}
                  onDoubleClick={handleResetSplitter}
                  className={`hidden md:flex w-2 bg-slate-200 hover:bg-blue-500 cursor-col-resize items-center justify-center transition-colors z-20 shrink-0 select-none ${
                    isResizingSplit ? 'bg-blue-600' : ''
                  }`}
                  title="Drag to resize editor and preview (double-click to center)"
                >
                  <div className="h-10 w-1 rounded-full bg-slate-400 group-hover:bg-white" />
                </div>
              )}

              {/* LIVE PREVIEW (OR EXECUTION STAGE) CONTAINER */}
              {isWebProject ? (
                <div
                  style={{
                    width:
                      typeof window !== 'undefined' && window.innerWidth >= 768
                        ? maximizedArea === 'editor'
                          ? '0%'
                          : maximizedArea === 'preview'
                          ? '100%'
                          : `${100 - editorSplitPercent}%`
                        : '100%',
                    display:
                      (mobileView === 'editor' || mobileView === 'panel') && typeof window !== 'undefined' && window.innerWidth < 768
                        ? 'none'
                        : maximizedArea === 'editor'
                        ? 'none'
                        : 'flex',
                  }}
                  className={`flex-col overflow-hidden ${
                    mobileView === 'split' ? 'h-1/2 md:h-full' : 'h-full'
                  }`}
                >
                  <LivePreview
                    files={project.files}
                    activeFile={activeFile}
                    autoRun={settings.autoRun}
                    onToggleAutoRun={() => onUpdateSettings({ autoRun: !settings.autoRun })}
                    onConsoleMessage={(msg) =>
                      setConsoleMessages((prev) => [...prev, msg])
                    }
                    onRuntimeError={(err) => {
                      setRuntimeErrors((prev) => [...prev, err]);
                    }}
                    onStatusChange={(status, note) => {
                      setExecutionStatus(status);
                      if (note) setStatusMessage(note);
                    }}
                    onAnimationsUpdate={(anims) => setAnimations(anims)}
                    onNetworkRequest={(req) =>
                      setNetworkRequests((prev) => [...prev.slice(-49), req])
                    }
                    isExpanded={maximizedArea === 'preview'}
                    onToggleExpand={() =>
                      setMaximizedArea(maximizedArea === 'preview' ? 'none' : 'preview')
                    }
                    onNavigatePage={handleNavigatePreviewPage}
                  />
                </div>
              ) : (
                /* Non-web environment stage for Python / SQLite */
                <div
                  style={{
                    width:
                      typeof window !== 'undefined' && window.innerWidth >= 768
                        ? `${100 - editorSplitPercent}%`
                        : '100%',
                    display:
                      (mobileView === 'editor' || mobileView === 'panel') && typeof window !== 'undefined' && window.innerWidth < 768
                        ? 'none'
                        : 'flex',
                  }}
                  className="flex-col bg-slate-50 border-l border-slate-200 p-4 overflow-auto"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-700 capitalize">
                      {project.language} Execution Environment
                    </h3>
                    <button
                      onClick={handleRun}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-2xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Execute</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs overflow-auto">
                    {executionResult ? (
                      <div>
                        {executionResult.stdout && (
                          <pre className="whitespace-pre-wrap text-slate-800">
                            {executionResult.stdout}
                          </pre>
                        )}
                        {executionResult.stderr && (
                          <pre className="whitespace-pre-wrap text-red-600 mt-2">
                            {executionResult.stderr}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-center py-12">
                        Click "Run" above to initialize WebAssembly and execute.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DEVELOPER PANEL (When position is 'bottom') */}
            {settings.panelPosition === 'bottom' && (
              <div
                className={`${
                  mobileView === 'editor' || mobileView === 'preview' ? 'hidden md:block' : 'block'
                }`}
              >
                <DeveloperPanel
                  activeTab={settings.activePanelTab}
                  onTabChange={(tab) => onUpdateSettings({ activePanelTab: tab })}
                  position="bottom"
                  onChangePosition={(pos) => onUpdateSettings({ panelPosition: pos })}
                  height={settings.panelHeight}
                  width={settings.panelWidth}
                  onResize={({ height }) => {
                    if (height) onUpdateSettings({ panelHeight: height });
                  }}
                  isCollapsed={settings.isPanelCollapsed}
                  onToggleCollapse={() =>
                    onUpdateSettings({ isPanelCollapsed: !settings.isPanelCollapsed })
                  }
                  isMaximized={maximizedArea === 'panel'}
                  onToggleMaximize={() =>
                    setMaximizedArea(maximizedArea === 'panel' ? 'none' : 'panel')
                  }
                  onResetLayout={handleResetSplitter}
                  consoleMessages={consoleMessages}
                  onClearConsole={() => setConsoleMessages([])}
                  onEvaluateConsole={handleEvaluateConsole}
                  diagnostics={staticDiagnostics}
                  onSelectDiagnostic={handleSelectDiagnostic}
                  runtimeErrors={runtimeErrors}
                  onClearRuntimeErrors={() => setRuntimeErrors([])}
                  executionResult={executionResult}
                  onClearOutput={() => setExecutionResult(null)}
                  language={project.language}
                  stdinValue={stdinValue}
                  onChangeStdin={setStdinValue}
                  animations={animations}
                  onControlAnimation={handleControlAnimation}
                  networkRequests={networkRequests}
                  onClearNetworkRequests={() => setNetworkRequests([])}
                  files={project.files}
                  onSelectFile={handleSelectFile}
                />
              </div>
            )}
          </div>

          {/* DEVELOPER PANEL (When position is 'right' on desktop) */}
          {settings.panelPosition === 'right' && (
            <div className="hidden md:flex h-full">
              <DeveloperPanel
                activeTab={settings.activePanelTab}
                onTabChange={(tab) => onUpdateSettings({ activePanelTab: tab })}
                position="right"
                onChangePosition={(pos) => onUpdateSettings({ panelPosition: pos })}
                height={settings.panelHeight}
                width={settings.panelWidth}
                onResize={({ width }) => {
                  if (width) onUpdateSettings({ panelWidth: width });
                }}
                isCollapsed={settings.isPanelCollapsed}
                onToggleCollapse={() =>
                  onUpdateSettings({ isPanelCollapsed: !settings.isPanelCollapsed })
                }
                isMaximized={maximizedArea === 'panel'}
                onToggleMaximize={() =>
                  setMaximizedArea(maximizedArea === 'panel' ? 'none' : 'panel')
                }
                onResetLayout={handleResetSplitter}
                consoleMessages={consoleMessages}
                onClearConsole={() => setConsoleMessages([])}
                onEvaluateConsole={handleEvaluateConsole}
                diagnostics={staticDiagnostics}
                onSelectDiagnostic={handleSelectDiagnostic}
                runtimeErrors={runtimeErrors}
                onClearRuntimeErrors={() => setRuntimeErrors([])}
                executionResult={executionResult}
                onClearOutput={() => setExecutionResult(null)}
                language={project.language}
                stdinValue={stdinValue}
                onChangeStdin={setStdinValue}
                animations={animations}
                onControlAnimation={handleControlAnimation}
                networkRequests={networkRequests}
                onClearNetworkRequests={() => setNetworkRequests([])}
                files={project.files}
                onSelectFile={handleSelectFile}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onResetLayout={() => {
          handleResetSplitter();
          onResetLayout();
        }}
        onClearAllLocalData={onClearAllLocalData}
      />

      <ZipImportModal
        isOpen={isZipImportOpen}
        onClose={() => setIsZipImportOpen(false)}
        onImportSuccess={(name, files) => {
          onUpdateProject({
            ...project,
            name,
            files,
            activeFileId: files[0]?.id || '',
            updatedAt: Date.now(),
          });
        }}
      />

      {/* Unsupported Container Notice */}
      {unsupportedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Execution Environment Note</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {unsupportedNotice}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setUnsupportedNotice(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
