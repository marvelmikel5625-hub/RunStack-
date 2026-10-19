import React from 'react';
import { BookOpen, Shield, Cpu, Terminal, Database, KeyRound, Sparkles, FolderArchive } from 'lucide-react';

export const DocumentationView: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 font-sans text-slate-800">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          RunStack Architecture & Documentation
        </h1>
        <p className="text-sm text-slate-600">
          Technical specifications, supported browser execution engines, local storage models, and security principles.
        </p>
      </div>

      <div className="space-y-10">
        {/* Section 1: Execution Engines */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Execution Engines & Runtime Models</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            RunStack prioritizes genuine execution over synthetic output. Each supported environment operates using dedicated sandboxing technologies:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Web Preview Sandbox
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sandboxed iframes running with isolated script capabilities. Injects bidirectional postMessage bridges to capture console messages, uncaught runtime exceptions, and provide live console evaluation.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Pyodide Python 3
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full CPython runtime compiled to WebAssembly. Executes real Python scripts in your browser with standard math, datetime, string processing, and custom standard input streaming.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-600" />
                SQLite WASM Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In-memory relational database compiled to WebAssembly via sql.js. Executes real DDL and DQL queries, returning formatted tables with execution latency metrics.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Security & Isolation */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Security Model & Code Isolation</span>
          </h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>
              • <strong>Iframe Isolation:</strong> Web previews run in an iframe with strict sandbox constraints (<code>sandbox="allow-scripts allow-modals"</code>). Untrusted preview code cannot access the parent RunStack application storage or context.
            </p>
            <p>
              • <strong>ZIP Archive Path Sanitization:</strong> All uploaded ZIP archives are scanned prior to extraction. Any entry containing directory traversal sequences (e.g. <code>../</code>) or absolute file system roots is automatically discarded.
            </p>
            <p>
              • <strong>Zero Remote Code Execution on Host:</strong> RunStack does not execute arbitrary user code on backend servers. Compiled languages (C++, Rust, Java) require isolated cloud containers and are kept transparently labeled as unavailable until sandboxed containers are attached.
            </p>
          </div>
        </section>

        {/* Section 3: Storage & Persistence */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-blue-600" />
            <span>Local Storage & IndexedDB</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your projects, files, and multi-file directories are stored locally inside your browser's IndexedDB engine (<code>RunStack_Database</code>).
          </p>
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>Storage Note:</strong> Because projects reside in your browser's local storage, clearing your browser cache or site data will remove saved local projects. Always use the <strong>Export ZIP</strong> button in the File Explorer or Top Bar to download offline backups of important projects.
          </div>
        </section>

        {/* Section 4: Keyboard Shortcuts */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <span>Keyboard Shortcuts</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-700 font-medium">Run Code / Update Preview</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono font-semibold shadow-2xs">Ctrl + Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-700 font-medium">Save Project</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono font-semibold shadow-2xs">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-700 font-medium">Find / Replace in Editor</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono font-semibold shadow-2xs">Ctrl + F</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-700 font-medium">Command Palette (Monaco)</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono font-semibold shadow-2xs">F1</kbd>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center">
        <button
          onClick={onBackToHome}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          ← Back to Overview
        </button>
      </div>
    </div>
  );
};
