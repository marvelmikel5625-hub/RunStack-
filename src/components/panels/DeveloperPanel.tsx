import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ConsoleTab } from './ConsoleTab';
import { ProblemsTab } from './ProblemsTab';
import { ErrorsTab } from './ErrorsTab';
import { OutputTab } from './OutputTab';
import { InputTab } from './InputTab';
import { AnimationsTab } from './AnimationsTab';
import { NetworkTab } from './NetworkTab';
import {
  ConsoleMessage,
  Diagnostic,
  ExecutionResult,
  AnimationInfo,
  NetworkRequestInfo,
} from '../../types/diagnostics';
import { ProjectFile } from '../../types/project';
import {
  Terminal,
  AlertTriangle,
  AlertOctagon,
  Database,
  Keyboard,
  Files,
  Activity,
  Globe,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RotateCcw,
  PanelBottom,
  PanelRight,
  MoreVertical,
  GripHorizontal,
  X,
} from 'lucide-react';

interface DeveloperPanelProps {
  activeTab: 'console' | 'problems' | 'errors' | 'output' | 'input' | 'animations' | 'network' | 'files';
  onTabChange: (tab: 'console' | 'problems' | 'errors' | 'output' | 'input' | 'animations' | 'network' | 'files') => void;
  position: 'bottom' | 'right';
  onChangePosition: (pos: 'bottom' | 'right') => void;
  height: number;
  width: number;
  onResize: (size: { height?: number; width?: number }) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onResetLayout?: () => void;
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
  onEvaluateConsole?: (code: string) => void;
  diagnostics: Diagnostic[];
  onSelectDiagnostic: (diag: Diagnostic) => void;
  runtimeErrors: Diagnostic[];
  onClearRuntimeErrors: () => void;
  executionResult: ExecutionResult | null;
  onClearOutput: () => void;
  language: string;
  stdinValue: string;
  onChangeStdin: (val: string) => void;
  animations: AnimationInfo[];
  onControlAnimation: (action: 'pause' | 'play' | 'restart' | 'rate', rate?: number) => void;
  networkRequests: NetworkRequestInfo[];
  onClearNetworkRequests: () => void;
  files: ProjectFile[];
  onSelectFile?: (fileId: string) => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  activeTab,
  onTabChange,
  position,
  onChangePosition,
  height,
  width,
  onResize,
  isCollapsed,
  onToggleCollapse,
  isMaximized = false,
  onToggleMaximize,
  onResetLayout,
  consoleMessages,
  onClearConsole,
  onEvaluateConsole,
  diagnostics,
  onSelectDiagnostic,
  runtimeErrors,
  onClearRuntimeErrors,
  executionResult,
  onClearOutput,
  language,
  stdinValue,
  onChangeStdin,
  animations = [],
  onControlAnimation = () => {},
  networkRequests = [],
  onClearNetworkRequests = () => {},
  files,
  onSelectFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const dragStartRef = useRef<{ startPos: number; startDimension: number }>({ startPos: 0, startDimension: 0 });

  // Mobile touch gesture tracking for bottom sheet expand/collapse
  const touchStartY = useRef<number>(0);
  const touchStartHeight = useRef<number>(0);

  // Mouse Drag Resizing (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (position === 'bottom') {
      dragStartRef.current = { startPos: e.clientY, startDimension: height };
    } else {
      dragStartRef.current = { startPos: e.clientX, startDimension: width };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    if (position === 'bottom') {
      const deltaY = dragStartRef.current.startPos - e.clientY;
      const newHeight = Math.max(120, Math.min(window.innerHeight * 0.85, dragStartRef.current.startDimension + deltaY));
      onResize({ height: newHeight });
    } else {
      const deltaX = dragStartRef.current.startPos - e.clientX;
      const newWidth = Math.max(260, Math.min(window.innerWidth * 0.65, dragStartRef.current.startDimension + deltaX));
      onResize({ width: newWidth });
    }
  }, [isDragging, position, onResize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mobile Touch Gestures (drag upward to expand, downward to collapse)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
      touchStartHeight.current = height;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY;
    const newHeight = Math.max(140, Math.min(window.innerHeight * 0.85, touchStartHeight.current + deltaY));
    onResize({ height: newHeight });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0]?.clientY || touchStartY.current;
    const totalDelta = touchStartY.current - endY;
    // If dragged upward significantly (> 100px), maximize
    if (totalDelta > 120 && onToggleMaximize && !isMaximized) {
      onToggleMaximize();
    } else if (totalDelta < -120 && isMaximized && onToggleMaximize) {
      onToggleMaximize();
    } else if (totalDelta < -180 && !isCollapsed) {
      onToggleCollapse();
    }
  };

  const handleHandleDoubleClick = () => {
    if (position === 'bottom') {
      onResize({ height: 240 });
    } else {
      onResize({ width: 380 });
    }
  };

  const staticProblemsCount = diagnostics.filter((d) => d.source !== 'runtime').length;
  const runtimeErrorsCount = runtimeErrors.length;
  const isWebProject = ['html', 'css', 'javascript', 'html-css-js'].includes(language);

  // Render Collapsed Strip
  if (isCollapsed) {
    return (
      <div
        className="bg-white border-t border-slate-200 select-none z-20 flex items-center justify-between px-3 h-9 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 text-blue-600">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Panel</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            {runtimeErrorsCount > 0 && (
              <span className="bg-red-100 text-red-700 px-1.5 py-0.2 rounded-xs font-bold">
                {runtimeErrorsCount} Error{runtimeErrorsCount > 1 ? 's' : ''}
              </span>
            )}
            {staticProblemsCount > 0 && (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-xs">
                {staticProblemsCount} Problem{staticProblemsCount > 1 ? 's' : ''}
              </span>
            )}
            {consoleMessages.length > 0 && (
              <span className="text-slate-400 hidden xs:inline">
                {consoleMessages.length} msg{consoleMessages.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Click to open panel</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="p-1 text-slate-500 hover:text-slate-900 rounded-sm cursor-pointer"
            title="Open Developer Panel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Calculate panel dimensions
  const containerStyle = isMaximized
    ? position === 'bottom'
      ? { height: '82vh' }
      : { width: '68vw' }
    : position === 'bottom'
    ? { height: `${height}px` }
    : { width: `${width}px` };

  return (
    <aside
      style={containerStyle}
      className={`relative flex flex-col bg-white border-slate-200 select-none z-20 shrink-0 transition-[height,width] duration-150 ${
        position === 'bottom' ? 'w-full border-t shadow-xs' : 'h-full border-l shadow-xs'
      }`}
    >
      {/* Draggable Resizer Handle Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleHandleDoubleClick}
        className={`absolute z-30 transition-colors flex items-center justify-center ${
          position === 'bottom'
            ? 'top-0 left-0 right-0 h-3 -mt-1.5 cursor-row-resize hover:bg-blue-400/30'
            : 'top-0 bottom-0 left-0 w-3 -ml-1.5 cursor-col-resize hover:bg-blue-400/30'
        } ${isDragging ? 'bg-blue-600/40' : 'bg-transparent'}`}
        title="Drag to resize panel (drag up to expand on mobile, double-click to reset)"
      >
        {position === 'bottom' ? (
          <div className="w-16 h-1 rounded-full bg-slate-300 hover:bg-blue-500 transition-colors" />
        ) : (
          <div className="h-16 w-1 rounded-full bg-slate-300 hover:bg-blue-500 transition-colors" />
        )}
      </div>

      {/* Panel Tab Navigation Bar */}
      <div className="flex items-center justify-between px-2 h-9 bg-slate-100 border-b border-slate-200 text-xs shrink-0 overflow-x-auto no-scrollbar">
        {/* Scrollable Tabs Bar */}
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Console Tab */}
          <button
            onClick={() => onTabChange('console')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'console'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
            {consoleMessages.length > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded-xs font-mono tabular-nums">
                {consoleMessages.length}
              </span>
            )}
          </button>

          {/* Problems Tab */}
          <button
            onClick={() => onTabChange('problems')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'problems'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${staticProblemsCount > 0 ? 'text-amber-500' : ''}`} />
            <span>Problems</span>
            {staticProblemsCount > 0 && (
              <span className="text-[10px] px-1 rounded-xs font-mono tabular-nums bg-amber-100 text-amber-800 font-semibold">
                {staticProblemsCount}
              </span>
            )}
          </button>

          {/* Errors Tab */}
          <button
            onClick={() => onTabChange('errors')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'errors'
                ? 'bg-white text-red-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <AlertOctagon className={`w-3.5 h-3.5 ${runtimeErrorsCount > 0 ? 'text-red-600' : ''}`} />
            <span>Errors</span>
            {runtimeErrorsCount > 0 && (
              <span className="text-[10px] px-1 rounded-xs font-mono tabular-nums bg-red-100 text-red-700 font-bold">
                {runtimeErrorsCount}
              </span>
            )}
          </button>

          {/* Output Tab */}
          <button
            onClick={() => onTabChange('output')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'output'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Output</span>
            {executionResult && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Output ready" />
            )}
          </button>

          {/* Input Tab (shown when supported, e.g. Python stdin) */}
          {(language === 'python' || stdinValue) && (
            <button
              onClick={() => onTabChange('input')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'input'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Input</span>
              {stdinValue && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Input buffered" />
              )}
            </button>
          )}

          {/* Animations Tab (for web projects) */}
          {isWebProject && (
            <button
              onClick={() => onTabChange('animations')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'animations'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Animations</span>
              {animations.length > 0 && (
                <span className="text-[10px] px-1 rounded-xs font-mono tabular-nums bg-blue-100 text-blue-800 font-semibold">
                  {animations.length}
                </span>
              )}
            </button>
          )}

          {/* Network Tab (for web projects) */}
          {isWebProject && (
            <button
              onClick={() => onTabChange('network')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'network'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Network</span>
              {networkRequests.length > 0 && (
                <span className="text-[10px] px-1 rounded-xs font-mono tabular-nums bg-slate-200 text-slate-800">
                  {networkRequests.length}
                </span>
              )}
            </button>
          )}

          {/* Files Tab */}
          <button
            onClick={() => onTabChange('files')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === 'files'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Files className="w-3.5 h-3.5" />
            <span>Files ({files.length})</span>
          </button>
        </div>

        {/* Panel Controls: Layout Menu, Maximize, Collapse */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Layout Menu */}
          <div className="relative">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-sm transition-colors cursor-pointer"
              title="Panel Layout & Position Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showLayoutMenu && (
              <div className="absolute right-0 bottom-full mb-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                  Docking Position
                </div>
                <button
                  onClick={() => {
                    onChangePosition('bottom');
                    setShowLayoutMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 cursor-pointer ${
                    position === 'bottom' ? 'text-blue-600 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <PanelBottom className="w-3.5 h-3.5" />
                  <span>Dock at Bottom</span>
                </button>
                <button
                  onClick={() => {
                    onChangePosition('right');
                    setShowLayoutMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 cursor-pointer ${
                    position === 'right' ? 'text-blue-600 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <PanelRight className="w-3.5 h-3.5" />
                  <span>Dock at Right</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                  Panel Sizing
                </div>
                {onToggleMaximize && (
                  <button
                    onClick={() => {
                      onToggleMaximize();
                      setShowLayoutMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span>{isMaximized ? 'Restore Default Height' : 'Maximize Panel'}</span>
                  </button>
                )}
                {onResetLayout && (
                  <button
                    onClick={() => {
                      onResetLayout();
                      setShowLayoutMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer border-t border-slate-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default Layout</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Maximize / Restore Toggle */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-sm transition-colors cursor-pointer hidden sm:inline-flex"
              title={isMaximized ? 'Restore Panel Height' : 'Maximize Panel'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Quick Position Toggle (Desktop) */}
          <button
            onClick={() => onChangePosition(position === 'bottom' ? 'right' : 'bottom')}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-sm transition-colors hidden sm:inline-flex cursor-pointer"
            title={`Move panel to ${position === 'bottom' ? 'right side' : 'bottom'}`}
          >
            {position === 'bottom' ? (
              <PanelRight className="w-3.5 h-3.5" />
            ) : (
              <PanelBottom className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Minimize / Collapse */}
          <button
            onClick={onToggleCollapse}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-sm transition-colors cursor-pointer"
            title="Minimize panel"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Content Active Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'console' && (
          <ConsoleTab
            messages={consoleMessages}
            onClear={onClearConsole}
            onEvaluate={onEvaluateConsole}
          />
        )}
        {activeTab === 'problems' && (
          <ProblemsTab
            diagnostics={diagnostics.filter((d) => d.source !== 'runtime')}
            onSelectDiagnostic={onSelectDiagnostic}
          />
        )}
        {activeTab === 'errors' && (
          <ErrorsTab
            runtimeErrors={runtimeErrors}
            onSelectError={onSelectDiagnostic}
            onClearErrors={onClearRuntimeErrors}
          />
        )}
        {activeTab === 'output' && (
          <OutputTab
            result={executionResult}
            onClear={onClearOutput}
            language={language}
          />
        )}
        {activeTab === 'input' && (
          <InputTab inputValue={stdinValue} onChange={onChangeStdin} />
        )}
        {activeTab === 'animations' && (
          <AnimationsTab
            animations={animations}
            onControlAnimation={onControlAnimation}
          />
        )}
        {activeTab === 'network' && (
          <NetworkTab
            requests={networkRequests}
            onClear={onClearNetworkRequests}
          />
        )}
        {activeTab === 'files' && (
          <div className="p-3 overflow-y-auto h-full text-xs font-sans">
            <h4 className="font-semibold text-slate-800 mb-2">Project Files ({files.length})</h4>
            <div className="divide-y divide-slate-100">
              {files.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFile && onSelectFile(f.id)}
                  className="py-1.5 px-2 hover:bg-slate-50 rounded-sm cursor-pointer flex items-center justify-between font-mono"
                >
                  <span className="text-slate-800 font-medium">{f.path}</span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    {f.content.length} chars · {f.language}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
