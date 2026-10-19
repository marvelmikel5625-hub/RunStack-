import React from 'react';
import { InteractiveHeroWorkspace } from './InteractiveHeroWorkspace';
import { FeatureGrid } from './FeatureGrid';
import { LanguagesShowcase } from './LanguagesShowcase';
import { RunStackLogo } from '../common/RunStackLogo';
import { SupportedLanguage } from '../../types/project';
import { Play, FolderPlus, ArrowRight, Code, ShieldCheck, Terminal, Database } from 'lucide-react';

interface HomepageProps {
  onStartPlayground: (lang?: SupportedLanguage) => void;
  onOpenNewProject: () => void;
  onNavigate: (view: 'home' | 'playground' | 'workspace' | 'docs' | 'languages') => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onStartPlayground,
  onOpenNewProject,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>No installation required for supported playgrounds.</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto text-balance leading-tight">
            Your Code. Your Ideas. <span className="text-blue-600">One Workspace.</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Write, run, experiment, and build directly in your browser. Start with a few lines of HTML or work on a complete project.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto sm:max-w-none">
            <button
              onClick={() => onStartPlayground('html-css-js')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Try Code Now</span>
            </button>
            <button
              onClick={onOpenNewProject}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create a Project</span>
            </button>
          </div>

          {/* Interactive Hero Workspace Demo */}
          <div className="mt-14 max-w-5xl mx-auto">
            <InteractiveHeroWorkspace onOpenFullPlayground={() => onStartPlayground('html-css-js')} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Three straightforward steps from blank screen to working software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl border border-slate-200 flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Choose a supported language
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select HTML/CSS/JS, Python 3, or SQL. Each opens immediately with tailored templates and ready-to-run environments.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Write or import code
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste snippets or create multi-file projects. Import existing ZIP archives with full directory preservation and safety checks.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Run, inspect, and improve
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect real runtime logs, discover syntax errors with clickable jumps to line numbers, and export your project anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <FeatureGrid />

      {/* Language Section */}
      <LanguagesShowcase onSelectLanguage={(lang) => onStartPlayground(lang)} />

      {/* Final Call to Action */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your Next Idea Starts Here.
          </h2>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Experience clean, fast in-browser development without logins or local configuration hurdles.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onStartPlayground('html-css-js')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-blue-600" />
              <span>Start Coding for Free</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <RunStackLogo size="sm" />
              <span className="text-slate-500 hidden sm:inline">|</span>
              <p className="text-slate-400">
                Your code, your workspace, your possibilities.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => onNavigate('playground')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Playground
              </button>
              <button
                onClick={() => onNavigate('languages')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Languages
              </button>
              <button
                onClick={() => onNavigate('docs')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Documentation
              </button>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">RunStack © 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
