export type SupportedLanguage = 
  | 'html' 
  | 'css' 
  | 'javascript' 
  | 'html-css-js' 
  | 'react'
  | 'typescript'
  | 'python' 
  | 'sql' 
  | 'json'
  | 'cpp' 
  | 'rust' 
  | 'java';

export type LanguageCategory = 'web' | 'scripting' | 'database' | 'compiled';

export interface LanguageInfo {
  id: SupportedLanguage;
  name: string;
  category: LanguageCategory;
  extension: string;
  isAvailable: boolean;
  statusNote: string;
  iconName: string;
  defaultFilename: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string; // e.g. "index.html" or "styles/main.css"
  content: string;
  language: string;
  isBinary?: boolean;
  binaryData?: ArrayBuffer;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  language: SupportedLanguage;
  files: ProjectFile[];
  activeFileId: string;
  createdAt: number;
  updatedAt: number;
  isCustomProject?: boolean;
}

export interface EditorSettings {
  theme: 'vs' | 'vs-dark';
  fontSize: number;
  wordWrap: 'on' | 'off';
  lineNumbers?: 'on' | 'off';
  autoRun: boolean;
  autoRunDelay: number; // in ms
  panelPosition: 'bottom' | 'right';
  panelHeight: number; // px for bottom panel
  panelWidth: number; // px for right panel
  isPanelCollapsed: boolean;
  activePanelTab: 'console' | 'problems' | 'errors' | 'output' | 'input' | 'animations' | 'network' | 'files';
}

