import React from 'react';
import {
  Zap,
  Eye,
  Layers,
  AlertTriangle,
  FolderTree,
  Download,
  Sliders,
  Smartphone,
} from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Zap,
    title: 'Instant Coding Playground',
    description: 'Jump directly into an editor without logging in, verifying email, or setting up local dev environments.',
  },
  {
    icon: Eye,
    title: 'Live Responsive Preview',
    description: 'Real-time sandboxed rendering for HTML, CSS, and JavaScript with automatic debounced execution.',
  },
  {
    icon: Layers,
    title: 'Multiple Programming Languages',
    description: 'Execute web code, Python 3 via Pyodide WebAssembly, and relational SQL queries powered by SQLite.',
  },
  {
    icon: AlertTriangle,
    title: 'Real Error Detection',
    description: 'Genuine syntax verification and runtime diagnostics with line numbers and clickable jumps to source code.',
  },
  {
    icon: FolderTree,
    title: 'Multi-File Projects',
    description: 'Create nested folders, organize style sheets, scripts, and pages, and preserve true project hierarchies.',
  },
  {
    icon: Download,
    title: 'Downloadable Projects & ZIP',
    description: 'Export complete ZIP archives or individual files instantly. Import existing project ZIPs safely.',
  },
  {
    icon: Sliders,
    title: 'Customizable Developer Tools',
    description: 'Collapsible, resizable panels with console REPL, problem inspection, dedicated runtime error reporting, and stdin.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-Friendly Coding',
    description: 'Specialized mobile layout stacking the editor above preview with a dedicated bottom sheet developer panel.',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Real Coding, Not Mockups
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Every feature in RunStack connects to an actual execution engine, file system, or browser-native runtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
