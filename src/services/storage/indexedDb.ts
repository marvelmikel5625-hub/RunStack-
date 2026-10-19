import { Project, EditorSettings, SupportedLanguage } from '../../types/project';
import { STARTER_TEMPLATES } from '../languages';

const DB_NAME = 'RunStack_Database';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'vs',
  fontSize: 14,
  wordWrap: 'on',
  autoRun: true,
  autoRunDelay: 600,
  panelPosition: 'bottom',
  panelHeight: 240,
  panelWidth: 380,
  isPanelCollapsed: false,
  activePanelTab: 'console',
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Project[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error fetching projects from IndexedDB:', err);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve((request.result as Project) || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error(`Error fetching project ${id}:`, err);
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const updatedProject: Project = {
        ...project,
        updatedAt: Date.now(),
      };
      const request = store.put(updatedProject);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error saving project to IndexedDB:', err);
    throw err;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Error deleting project ${id}:`, err);
    throw err;
  }
}

export function createInitialProject(
  name: string,
  language: SupportedLanguage = 'html-css-js',
  description?: string
): Project {
  const template = STARTER_TEMPLATES[language] || STARTER_TEMPLATES['html-css-js'];
  const now = Date.now();
  const id = 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + now;

  const files = template.files.map((f, index) => ({
    id: `file_${index}_${now}`,
    name: f.name,
    path: f.path,
    content: f.content,
    language: f.language,
    updatedAt: now,
  }));

  return {
    id,
    name,
    description: description || `A ${language} project on RunStack`,
    language,
    files,
    activeFileId: files[0]?.id || '',
    createdAt: now,
    updatedAt: now,
    isCustomProject: true,
  };
}

export function loadSettings(): EditorSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem('runstack_editor_settings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: EditorSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('runstack_editor_settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}
