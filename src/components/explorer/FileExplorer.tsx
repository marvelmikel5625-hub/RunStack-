import React, { useState } from 'react';
import { ProjectFile } from '../../types/project';
import {
  FilePlus,
  FolderPlus,
  FileCode,
  Globe,
  Palette,
  Terminal,
  Database,
  FileText,
  Trash2,
  Edit2,
  Download,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Upload,
  Archive,
} from 'lucide-react';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newPath: string) => void;
  onDownloadFile: (file: ProjectFile) => void;
  onDownloadProjectZip: () => void;
  onOpenZipImportModal: () => void;
  projectName: string;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  file?: ProjectFile;
  children: Record<string, TreeNode>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onDownloadFile,
  onDownloadProjectZip,
  onOpenZipImportModal,
  projectName,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ '': true });
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  // Toggle folder expansion
  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  // Build hierarchical folder tree from flat file list
  const buildTree = (): TreeNode => {
    const root: TreeNode = {
      name: projectName,
      path: '',
      isFolder: true,
      children: {},
    };

    files.forEach((file) => {
      const parts = file.path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (isLast) {
          current.children[part] = {
            name: part,
            path: currentPath,
            isFolder: false,
            file,
            children: {},
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: currentPath,
              isFolder: true,
              children: {},
            };
          }
          current = current.children[part];
        }
      });
    });

    return root;
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
    if (fileName.endsWith('.css')) return <Palette className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) return <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (fileName.endsWith('.py')) return <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (fileName.endsWith('.sql')) return <Database className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const handleStartRename = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFileId(file.id);
    setRenameValue(file.path);
  };

  const handleSaveRename = (fileId: string) => {
    if (renameValue.trim()) {
      onRenameFile(fileId, renameValue.trim());
    }
    setRenamingFileId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilePath.trim()) {
      onCreateFile(newFilePath.trim());
      setNewFilePath('');
      setIsCreatingNew(false);
    }
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isRoot = node.path === '';
    const isOpen = openFolders[node.path] ?? true;

    if (isRoot) {
      return (
        <div className="space-y-0.5">
          {Object.values(node.children).map((child) => renderNode(child, 0))}
        </div>
      );
    }

    if (node.isFolder) {
      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${depth * 12 + 6}px` }}
            className="flex items-center gap-1.5 py-1 px-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-sm cursor-pointer transition-colors"
          >
            {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
            {isOpen ? <FolderOpen className="w-3.5 h-3.5 text-blue-500" /> : <Folder className="w-3.5 h-3.5 text-blue-500" />}
            <span className="truncate">{node.name}</span>
          </div>

          {isOpen && (
            <div>
              {Object.values(node.children).map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const file = node.file!;
    const isActive = file.id === activeFileId;
    const isRenaming = renamingFileId === file.id;

    return (
      <div
        key={file.id}
        onClick={() => onSelectFile(file.id)}
        style={{ paddingLeft: `${depth * 12 + 18}px` }}
        className={`group flex items-center justify-between py-1 px-2 text-xs font-mono rounded-sm cursor-pointer select-none transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {getFileIcon(file.name)}
          {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => handleSaveRename(file.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(file.id);
                if (e.key === 'Escape') setRenamingFileId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="px-1 py-0.5 text-xs font-mono bg-white border border-blue-500 rounded-xs text-slate-900 w-full"
            />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-1">
          <button
            onClick={(e) => handleStartRename(file, e)}
            className="p-0.5 text-slate-400 hover:text-slate-700 rounded-xs"
            title="Rename file"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadFile(file);
            }}
            className="p-0.5 text-slate-400 hover:text-slate-700 rounded-xs"
            title="Download file"
          >
            <Download className="w-3 h-3" />
          </button>
          {files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(file.id);
              }}
              className="p-0.5 text-slate-400 hover:text-red-600 rounded-xs"
              title="Delete file"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const tree = buildTree();

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 select-none w-56 sm:w-60 shrink-0 font-sans">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 h-9 bg-slate-100 border-b border-slate-200 text-xs text-slate-600 font-semibold">
        <span className="uppercase tracking-wider text-[11px] text-slate-500">Explorer</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingNew(true)}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-sm transition-colors"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenZipImportModal}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-sm transition-colors"
            title="Import ZIP Project"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDownloadProjectZip}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-sm transition-colors"
            title="Download Entire Project as ZIP"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New File Inline Form */}
      {isCreatingNew && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-slate-200 bg-white">
          <div className="text-[11px] text-slate-500 mb-1">Enter path (e.g. <code>components/card.html</code>):</div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="filename.ext"
              className="flex-1 px-2 py-1 text-xs font-mono border border-blue-500 rounded-sm focus:outline-none"
            />
            <button
              type="submit"
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded-sm font-medium hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {renderNode(tree)}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>{files.length} files</span>
        <button
          onClick={onDownloadProjectZip}
          className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
        >
          <Download className="w-3 h-3" />
          Export ZIP
        </button>
      </div>
    </div>
  );
};
