import { ExecutionResult, Diagnostic } from '../../types/diagnostics';

// Declare global Pyodide types
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
    __pyodideInstance?: PyodideInterface | null;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  loadPackagesFromImports?: (code: string) => Promise<void>;
}

export type PythonEngineStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error';

class PythonEngineService {
  private status: PythonEngineStatus = 'idle';
  private pyodide: PyodideInterface | null = null;
  private loadPromise: Promise<PyodideInterface> | null = null;
  private statusListeners: Set<(status: PythonEngineStatus, message?: string) => void> = new Set();

  public getStatus(): PythonEngineStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: PythonEngineStatus, message?: string) => void) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  private setStatus(status: PythonEngineStatus, message?: string) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status, message));
  }

  public async initialize(): Promise<PyodideInterface> {
    if (this.pyodide) return this.pyodide;
    if (this.loadPromise) return this.loadPromise;

    this.setStatus('loading', 'Loading Python WebAssembly runtime (Pyodide v0.26)...');

    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        // Dynamically inject Pyodide script if not present
        if (!window.loadPyodide) {
          await new Promise<void>((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
            script.async = true;
            script.onload = () => res();
            script.onerror = () => rej(new Error('Failed to load Pyodide script from CDN. Please check your network connection.'));
            document.head.appendChild(script);
          });
        }

        if (!window.loadPyodide) {
          throw new Error('Pyodide loader unavailable.');
        }

        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        });

        this.pyodide = pyodideInstance;
        this.setStatus('ready', 'Python 3 runtime ready.');
        resolve(pyodideInstance);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.setStatus('error', `Failed to initialize Python runtime: ${errorMsg}`);
        reject(err);
      }
    });

    return this.loadPromise;
  }

  public async runPython(
    code: string,
    onOutputChunk?: (text: string, isError: boolean) => void,
    inputBuffer?: string
  ): Promise<{ result: ExecutionResult; diagnostics: Diagnostic[] }> {
    const startTime = performance.now();
    let stdoutBuffer = '';
    let stderrBuffer = '';

    try {
      const py = await this.initialize();
      this.setStatus('running', 'Executing Python program...');

      // Hook stdout / stderr
      py.setStdout({
        batched: (msg: string) => {
          const formatted = msg + '\n';
          stdoutBuffer += formatted;
          if (onOutputChunk) onOutputChunk(formatted, false);
        },
      });

      py.setStderr({
        batched: (msg: string) => {
          const formatted = msg + '\n';
          stderrBuffer += formatted;
          if (onOutputChunk) onOutputChunk(formatted, true);
        },
      });

      // If user provided input lines, we can mock stdin in sys.stdin
      let executionPrefix = '';
      if (inputBuffer !== undefined && inputBuffer.trim().length > 0) {
        const escapedInput = JSON.stringify(inputBuffer);
        executionPrefix = `import sys, io\nsys.stdin = io.StringIO(${escapedInput})\n`;
      }

      await py.runPythonAsync(executionPrefix + code);

      this.setStatus('ready', 'Execution completed.');
      const elapsed = Math.round(performance.now() - startTime);

      return {
        result: {
          success: true,
          stdout: stdoutBuffer,
          stderr: stderrBuffer,
          executionTimeMs: elapsed,
        },
        diagnostics: [],
      };
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startTime);
      const rawError = err instanceof Error ? err.message : String(err);
      this.setStatus('ready', 'Execution finished with errors.');

      // Parse Python exception traceback for line numbers
      const diagnostics: Diagnostic[] = [];
      const lineMatch = rawError.match(/line (\d+)/i);
      const lineNo = lineMatch ? parseInt(lineMatch[1], 10) : 1;

      diagnostics.push({
        id: 'py_err_' + Date.now(),
        file: 'main.py',
        line: lineNo,
        column: 1,
        message: rawError.split('\n').filter(Boolean).pop() || rawError,
        severity: 'error',
        source: 'runtime',
      });

      return {
        result: {
          success: false,
          stdout: stdoutBuffer,
          stderr: stderrBuffer + (stderrBuffer ? '\n' : '') + rawError,
          error: rawError,
          executionTimeMs: elapsed,
        },
        diagnostics,
      };
    }
  }
}

export const pythonEngine = new PythonEngineService();
