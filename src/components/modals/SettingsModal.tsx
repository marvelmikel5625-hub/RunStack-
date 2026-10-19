import React, { useState } from 'react';
import { EditorSettings } from '../../types/project';
import { X, Moon, Sun, RotateCcw, AlertTriangle, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onResetLayout: () => void;
  onClearAllLocalData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetLayout,
  onClearAllLocalData,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Workspace & Editor Settings</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Editor Theme */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Editor Theme</div>
              <div className="text-xs text-slate-500">Choose light or dark editor palette</div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => onUpdateSettings({ theme: 'vs' })}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  settings.theme === 'vs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'vs-dark' })}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  settings.theme === 'vs-dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Font Size</div>
              <div className="text-xs text-slate-500">Editor text dimensions in pixels</div>
            </div>
            <select
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12">12 px (Compact)</option>
              <option value="14">14 px (Default)</option>
              <option value="16">16 px (Medium)</option>
              <option value="18">18 px (Large)</option>
            </select>
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Word Wrapping</div>
              <div className="text-xs text-slate-500">Wrap long lines to fit the visible editor width</div>
            </div>
            <button
              onClick={() => onUpdateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.wordWrap === 'on' ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Live Preview Auto-Run */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Auto-Run Live Preview</div>
              <div className="text-xs text-slate-500">Automatically update web preview upon typing</div>
            </div>
            <button
              onClick={() => onUpdateSettings({ autoRun: !settings.autoRun })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.autoRun ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Panel Default Layout */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Developer Panel Position</div>
              <div className="text-xs text-slate-500">Docking placement for console & diagnostics</div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => onUpdateSettings({ panelPosition: 'bottom' })}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  settings.panelPosition === 'bottom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Bottom
              </button>
              <button
                onClick={() => onUpdateSettings({ panelPosition: 'right' })}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  settings.panelPosition === 'right' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Reset Workspace Layout */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Reset Layout</div>
              <div className="text-xs text-slate-500">Restore default split widths and panel heights</div>
            </div>
            <button
              onClick={() => {
                onResetLayout();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Clear Storage */}
          <div className="pt-3 border-t border-slate-100">
            <div className="font-medium text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Local Storage & Saved Projects</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your projects are stored safely in IndexedDB inside your browser. Clearing this data will delete locally saved custom projects.
            </p>

            {confirmClear ? (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
                <p className="text-xs font-semibold text-red-800">
                  Are you absolutely sure? This cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearAllLocalData();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Yes, Clear All Data
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="mt-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                Clear Local Data
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
