import React, { useRef, useEffect, useState } from 'react';
import { ProjectFile } from '../../types/project';
import { ConsoleMessage, Diagnostic, AnimationInfo, NetworkRequestInfo } from '../../types/diagnostics';
import { buildSandboxedDocument } from '../../services/execution/webEngine';
import { RotateCw, Maximize2, Minimize2, Smartphone, Monitor, Tablet, Globe, CheckCircle2 } from 'lucide-react';

interface LivePreviewProps {
  files: ProjectFile[];
  activeFile?: ProjectFile;
  onConsoleMessage?: (msg: ConsoleMessage) => void;
  onRuntimeError?: (err: Diagnostic) => void;
  onStatusChange?: (status: 'ready' | 'initializing' | 'running' | 'completed' | 'error', note?: string) => void;
  onAnimationsUpdate?: (anims: AnimationInfo[]) => void;
  onNetworkRequest?: (req: NetworkRequestInfo) => void;
  autoRun?: boolean;
  onToggleAutoRun?: () => void;
  onRefreshManual?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onNavigatePage?: (filePath: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  activeFile,
  onConsoleMessage,
  onRuntimeError,
  onStatusChange,
  onAnimationsUpdate,
  onNetworkRequest,
  autoRun = true,
  onToggleAutoRun,
  isExpanded = false,
  onToggleExpand,
  onNavigatePage,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCompiling, setIsCompiling] = useState(false);

  // Compile bundle and update iframe srcDoc
  const compileAndRender = () => {
    setIsCompiling(true);
    if (onStatusChange) onStatusChange('running', 'Compiling bundle & updating live preview...');

    try {
      const doc = buildSandboxedDocument(files, activeFile);
      setSrcDoc(doc);
      if (onStatusChange) onStatusChange('completed', 'Web preview updated successfully.');
    } catch (err: unknown) {
      console.error('Failed to build sandboxed document:', err);
      if (onStatusChange) onStatusChange('error', 'Failed to compile preview bundle.');
    } finally {
      setTimeout(() => setIsCompiling(false), 200);
    }
  };

  // Auto-run with debounce (350ms)
  useEffect(() => {
    if (!autoRun) return;

    const timer = setTimeout(() => {
      compileAndRender();
    }, 350);

    return () => clearTimeout(timer);
  }, [files, activeFile, autoRun]);

  // Initial render
  useEffect(() => {
    compileAndRender();
  }, []);

  // PostMessage listener for sandboxed iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.source !== 'RUNSTACK_SANDBOX') return;

      if (event.data.type === 'CONSOLE_MESSAGE' && onConsoleMessage) {
        onConsoleMessage(event.data.payload);
      } else if (event.data.type === 'RUNTIME_ERROR') {
        if (onRuntimeError) onRuntimeError(event.data.payload);
        if (onStatusChange) onStatusChange('error', 'Runtime error thrown in preview.');
      } else if (event.data.type === 'ANIMATIONS_UPDATE' && onAnimationsUpdate) {
        onAnimationsUpdate(event.data.payload);
      } else if (event.data.type === 'NETWORK_REQUEST' && onNetworkRequest) {
        onNetworkRequest(event.data.payload);
      } else if (event.data.type === 'NAVIGATE_PAGE' && onNavigatePage) {
        onNavigatePage(event.data.payload.path);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleMessage, onRuntimeError, onStatusChange, onAnimationsUpdate, onNetworkRequest, onNavigatePage]);

  const getContainerWidth = () => {
    if (deviceView === 'mobile') return 'max-w-[375px]';
    if (deviceView === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 border-l border-slate-200 overflow-hidden">
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-3 h-9 bg-slate-100 border-b border-slate-200 text-xs text-slate-600 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800">Live Preview</span>
          {isCompiling ? (
            <span className="flex items-center gap-1 text-[11px] text-blue-600 font-mono">
              <RotateCw className="w-2.5 h-2.5 animate-spin" />
              Compiling...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono hidden sm:inline">
              <CheckCircle2 className="w-2.5 h-2.5" />
              sandbox://ready
            </span>
          )}
        </div>

        {/* Viewport & Device Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Auto-run Toggle */}
          {onToggleAutoRun && (
            <label
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer mr-1 hidden sm:flex select-none"
              title="Toggle automatic refresh on typing"
            >
              <input
                type="checkbox"
                checked={autoRun}
                onChange={onToggleAutoRun}
                className="w-3 h-3 rounded-xs text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Auto-Run</span>
            </label>
          )}

          {/* Device Dimensions */}
          <div className="hidden sm:flex items-center bg-slate-200/60 p-0.5 rounded-md">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-1 rounded-sm transition-colors cursor-pointer ${
                deviceView === 'desktop' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Full Width Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`p-1 rounded-sm transition-colors cursor-pointer ${
                deviceView === 'tablet' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-1 rounded-sm transition-colors cursor-pointer ${
                deviceView === 'mobile' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh preview */}
          <button
            onClick={compileAndRender}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Refresh Sandbox Preview"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
          </button>

          {/* Maximize preview */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              title={isExpanded ? 'Restore split layout' : 'Maximize Preview'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex justify-center items-stretch overflow-hidden bg-slate-200/40 p-1 sm:p-2">
        <div
          className={`${getContainerWidth()} h-full bg-white rounded-md shadow-2xs border border-slate-200 overflow-hidden transition-all duration-150 flex flex-col`}
        >
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="RunStack Sandboxed Application Preview"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
