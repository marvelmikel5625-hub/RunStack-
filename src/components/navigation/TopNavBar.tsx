import React, { useState } from 'react';
import { RunStackLogo } from '../common/RunStackLogo';
import { Menu, X, Play, Code2, FolderPlus, ArrowLeft } from 'lucide-react';

interface TopNavBarProps {
  currentView: 'home' | 'playground' | 'workspace' | 'docs' | 'languages';
  onNavigate: (view: 'home' | 'playground' | 'workspace' | 'docs' | 'languages') => void;
  onOpenNewProjectModal?: () => void;
  onOpenAuthModal?: () => void;
  projectName?: string;
  isWorkspaceMode?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenNewProjectModal,
  onOpenAuthModal,
  projectName,
  isWorkspaceMode = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (view: 'home' | 'playground' | 'workspace' | 'docs' | 'languages') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleFeaturesClick = () => {
    setMobileMenuOpen(false);
    if (currentView === 'home') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-8">
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleLinkClick('home')}
              className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 rounded-sm"
              title="RunStack Home"
            >
              <RunStackLogo size="md" />
            </button>

            {isWorkspaceMode && projectName && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
                <span className="font-medium text-slate-700 truncate max-w-[140px] md:max-w-[200px]" title={projectName}>
                  {projectName}
                </span>
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleLinkClick('home')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'home' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick('playground')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'playground' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Playground
            </button>
            <button
              onClick={() => handleLinkClick('languages')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'languages' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Languages
            </button>
            <button
              onClick={handleFeaturesClick}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleLinkClick('docs')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'docs' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Documentation
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {currentView === 'workspace' || currentView === 'playground' ? (
              <div className="flex items-center gap-2">
                {onOpenNewProjectModal && (
                  <button
                    onClick={onOpenNewProjectModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    title="Create or load another project"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>New Project</span>
                  </button>
                )}
                <button
                  onClick={() => handleLinkClick('home')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Workspace</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleLinkClick('playground')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Try Code Now</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {currentView !== 'playground' && currentView !== 'workspace' && (
              <button
                onClick={() => handleLinkClick('playground')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap shrink-0"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Playground</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <button
            onClick={() => handleLinkClick('home')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
              currentView === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleLinkClick('playground')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
              currentView === 'playground' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Quick Playground
          </button>
          <button
            onClick={() => handleLinkClick('workspace')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
              currentView === 'workspace' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Multi-File Project Workspace
          </button>
          <button
            onClick={() => handleLinkClick('languages')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
              currentView === 'languages' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Supported Languages & Engines
          </button>
          <button
            onClick={handleFeaturesClick}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50"
          >
            Features & Capabilities
          </button>
          <button
            onClick={() => handleLinkClick('docs')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
              currentView === 'docs' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Documentation
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {onOpenNewProjectModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNewProjectModal();
                }}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Create New Project
              </button>
            )}
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
