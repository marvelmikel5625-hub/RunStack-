import JSZip from 'jszip';
import { Project, ProjectFile } from '../../types/project';

/**
 * Validates a file path from a ZIP entry against path traversal and forbidden sequences.
 */
export function isSafeZipPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  // Normalize slashes
  const normalized = path.replace(/\\/g, '/');
  // Check for path traversal attacks
  if (normalized.includes('../') || normalized.startsWith('../') || normalized.includes('/../')) {
    return false;
  }
  // Check for absolute root paths
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    return false;
  }
  return true;
}

/**
 * Determines file language from path or filename extension.
 */
export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'sql':
      return 'sql';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'svg':
      return 'xml';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'rs':
      return 'rust';
    case 'java':
      return 'java';
    default:
      return 'plaintext';
  }
}

/**
 * Exports an entire project as a ZIP archive and triggers browser download.
 */
export async function exportProjectToZip(project: Project): Promise<void> {
  const zip = new JSZip();

  for (const file of project.files) {
    if (file.isBinary && file.binaryData) {
      zip.file(file.path, file.binaryData);
    } else {
      zip.file(file.path, file.content);
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const safeProjectName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'runstack_project';
  const fileName = `${safeProjectName}.zip`;

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Downloads a single file from the project.
 */
export function downloadSingleFile(file: ProjectFile): void {
  const blob = file.isBinary && file.binaryData
    ? new Blob([file.binaryData])
    : new Blob([file.content], { type: 'text/plain;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and parses a ZIP file, extracting all valid files and preserving directory hierarchy.
 */
export async function importProjectFromZip(
  file: File
): Promise<{ projectName: string; files: ProjectFile[] }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const extractedFiles: ProjectFile[] = [];
    const entries = Object.keys(zip.files);

    if (entries.length === 0) {
      throw new Error('The ZIP archive is empty.');
    }

    const now = Date.now();
    let fileIdx = 0;

    for (const rawPath of entries) {
      const zipEntry = zip.files[rawPath];

      // Ignore directory entries
      if (zipEntry.dir) continue;

      // Validate path against traversal
      if (!isSafeZipPath(rawPath)) {
        console.warn(`Skipping unsafe path inside ZIP archive: ${rawPath}`);
        continue;
      }

      // Skip OS metadata files
      if (rawPath.includes('__MACOSX/') || rawPath.endsWith('.DS_Store') || rawPath.endsWith('Thumbs.db')) {
        continue;
      }

      const normalizedPath = rawPath.replace(/^\/+/, '');
      const fileName = normalizedPath.split('/').pop() || 'unnamed';
      const language = getLanguageFromPath(fileName);

      // Check if image or binary
      const ext = fileName.split('.').pop()?.toLowerCase();
      const isBinaryExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'woff', 'woff2', 'ttf', 'zip'].includes(ext || '');

      if (isBinaryExt) {
        const binData = await zipEntry.async('arraybuffer');
        extractedFiles.push({
          id: `file_imported_${fileIdx}_${now}`,
          name: fileName,
          path: normalizedPath,
          content: `/* Binary asset: ${fileName} (${binData.byteLength} bytes) */`,
          language,
          isBinary: true,
          binaryData: binData,
          updatedAt: now,
        });
      } else {
        const textContent = await zipEntry.async('text');
        extractedFiles.push({
          id: `file_imported_${fileIdx}_${now}`,
          name: fileName,
          path: normalizedPath,
          content: textContent,
          language,
          isBinary: false,
          updatedAt: now,
        });
      }

      fileIdx++;
    }

    if (extractedFiles.length === 0) {
      throw new Error('No valid code or project files could be extracted from this ZIP archive.');
    }

    const rawProjectName = file.name.replace(/\.zip$/i, '') || 'Imported Project';

    return {
      projectName: rawProjectName,
      files: extractedFiles,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid or corrupted ZIP archive.';
    throw new Error(`Failed to import ZIP: ${errorMsg}`);
  }
}
