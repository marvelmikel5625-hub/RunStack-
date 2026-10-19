import React, { useState, useEffect } from 'react';
import { Project, EditorSettings, SupportedLanguage } from './types/project';
import {
  getAllProjects,
  saveProject,
  deleteProject,
  createInitialProject,
  loadSettings,
  saveSettings,
} from './services/storage/indexedDb';
import { TopNavBar } from './components/navigation/TopNavBar';
import { Homepage } from './components/home/Homepage';
import { Workspace } from './components/workspace/Workspace';
import { DocumentationView } from './components/docs/DocumentationView';
import { LanguagesShowcase } from './components/home/LanguagesShowcase';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { AuthModal } from './components/modals/AuthModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'playground' | 'workspace' | 'docs' | 'languages'>('home');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [settings, setSettings] = useState<EditorSettings>(loadSettings());

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize storage & default projects
  useEffect(() => {
    async function init() {
      try {
        const saved = await getAllProjects();
        setProjectsList(saved);

        if (saved.length > 0) {
          setCurrentProject(saved[0]);
        } else {
          // Create initial starter project and persist
          const initial = createInitialProject('Interactive Counter & Animation', 'html-css-js');
          await saveProject(initial);
          setProjectsList([initial]);
          setCurrentProject(initial);
        }
      } catch (err) {
        console.error('Failed to initialize local IndexedDB storage:', err);
        // Fallback in-memory project
        const fallback = createInitialProject('Interactive Counter & Animation', 'html-css-js');
        setCurrentProject(fallback);
      } finally {
        setIsInitialized(true);
      }
    }

    init();
  }, []);

  // Update settings handler
  const handleUpdateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // Reset workspace layout
  const handleResetLayout = () => {
    handleUpdateSettings({
      panelHeight: 240,
      panelWidth: 380,
      panelPosition: 'bottom',
      isPanelCollapsed: false,
    });
  };

  // Clear all local data
  const handleClearAllLocalData = async () => {
    try {
      for (const p of projectsList) {
        await deleteProject(p.id);
      }
      const fresh = createInitialProject('Quick Playground', 'html-css-js');
      await saveProject(fresh);
      setProjectsList([fresh]);
      setCurrentProject(fresh);
    } catch (err) {
      console.error('Failed to clear data:', err);
    }
  };

  // Update current project
  const handleUpdateProject = (updated: Project) => {
    setCurrentProject(updated);
    setProjectsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Auto-persist silently
    saveProject(updated).catch((err) => console.error('Auto-save error:', err));
  };

  // Create new project from modal
  const handleCreateProject = async (name: string, language: SupportedLanguage, description?: string) => {
    const newProj = createInitialProject(name, language, description);
    try {
      await saveProject(newProj);
      setProjectsList((prev) => [newProj, ...prev]);
      setCurrentProject(newProj);
      setCurrentView('workspace');
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  // Launch Playground immediately
  const handleStartPlayground = (lang: SupportedLanguage = 'html-css-js') => {
    // If a project matching this language exists, open it, or create a fresh playground
    const existing = projectsList.find((p) => p.language === lang);
    if (existing) {
      setCurrentProject(existing);
    } else {
      const fresh = createInitialProject(`Quick ${lang} Playground`, lang);
      saveProject(fresh).catch(() => {});
      setProjectsList((prev) => [fresh, ...prev]);
      setCurrentProject(fresh);
    }
    setCurrentView('playground');
  };

  if (!isInitialized || !currentProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-800">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-semibold text-slate-700">Loading RunStack Workspace...</span>
      </div>
    );
  }

  // Workspace or Playground View
  if (currentView === 'workspace' || currentView === 'playground') {
    return (
      <div className="w-full h-[100dvh] max-w-full overflow-hidden flex flex-col">
        <Workspace
          project={currentProject}
          onUpdateProject={handleUpdateProject}
          onNavigateHome={() => setCurrentView('home')}
          onOpenNewProject={() => setIsNewProjectModalOpen(true)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetLayout={handleResetLayout}
          onClearAllLocalData={handleClearAllLocalData}
        />

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      </div>
    );
  }

  // Home, Docs, or Languages View
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNavBar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <Homepage
            onStartPlayground={handleStartPlayground}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'languages' && (
          <div className="py-8">
            <LanguagesShowcase
              onSelectLanguage={(lang) => handleStartPlayground(lang)}
            />
          </div>
        )}

        {currentView === 'docs' && (
          <DocumentationView onBackToHome={() => setCurrentView('home')} />
        )}
      </main>

      {/* Global Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onContinueAsGuest={() => handleStartPlayground('html-css-js')}
      />
    </div>
  );
}
