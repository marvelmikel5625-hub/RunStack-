import React, { useState } from 'react';
import { importProjectFromZip } from '../../services/zip/zipManager';
import { ProjectFile } from '../../types/project';
import { X, Upload, Archive, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface ZipImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (projectName: string, files: ProjectFile[]) => void;
}

export const ZipImportModal: React.FC<ZipImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please select a valid .zip archive file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importProjectFromZip(file);
      onImportSuccess(result.projectName, result.files);
      setIsLoading(false);
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to import ZIP file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">Import Project ZIP</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800 mb-1">
              Drag and drop your project ZIP here
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Folder structure, HTML, CSS, JavaScript, Python, and SQL files will be preserved.
            </p>

            <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs">
              <Archive className="w-3.5 h-3.5" />
              <span>Browse ZIP File</span>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 py-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Extracting and validating archive files...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Import Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-600">Security & Path Validation:</div>
            <p>
              Every entry is screened against directory traversal. Unsafe paths or hidden system files are filtered safely.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
