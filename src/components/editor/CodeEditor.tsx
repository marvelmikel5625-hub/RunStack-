import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';

import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

import { ProjectFile } from '../../types/project';
import { Diagnostic } from '../../types/diagnostics';

export interface CodeEditorHandle {
  triggerFind: () => void;
  triggerReplace: () => void;
  formatDocument: () => void;
  focus: () => void;

  selectAll: () => void;
  copy: () => void;
  cut: () => void;
  paste: () => void;

  undo: () => void;
  redo: () => void;

  clearActiveFile: () => void;
  getValue: () => string;
}

interface CodeEditorProps {
  file: ProjectFile;

  onChange: (newContent: string) => void;

  theme: 'vs' | 'vs-dark';

  fontSize: number;

  wordWrap: 'on' | 'off';

  jumpToLine?: {
    line: number;
    column?: number;
    timestamp: number;
  } | null;

  diagnostics?: Diagnostic[];

  className?: string;
}

type MonacoDisposable = {
  dispose: () => void;
};

export const CodeEditor = forwardRef<
  CodeEditorHandle,
  CodeEditorProps
>(
  (
    {
      file,
      onChange,
      theme,
      fontSize,
      wordWrap,
      jumpToLine,
      diagnostics = [],
      className = '',
    },
    ref
  ) => {
    const editorRef =
      useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

    const monacoRef = useRef<typeof Monaco | null>(null);

    const isFocusedRef = useRef(false);

    const disposablesRef = useRef<MonacoDisposable[]>([]);

    const cleanupRef = useRef<(() => void) | null>(null);

    const jumpDecorationIdsRef = useRef<string[]>([]);

    const jumpTimeoutRef = useRef<number | null>(null);

    const viewportFrameRef = useRef<number | null>(null);

    /**
     * Clean up listeners and timers associated with the editor.
     */
    const cleanupEditorListeners = useCallback(() => {
      disposablesRef.current.forEach((disposable) => {
        disposable.dispose();
      });

      disposablesRef.current = [];

      cleanupRef.current?.();
      cleanupRef.current = null;

      if (viewportFrameRef.current !== null) {
        window.cancelAnimationFrame(viewportFrameRef.current);
        viewportFrameRef.current = null;
      }

      if (jumpTimeoutRef.current !== null) {
        window.clearTimeout(jumpTimeoutRef.current);
        jumpTimeoutRef.current = null;
      }

      const editor = editorRef.current;

      if (editor && !editor.isDisposed()) {
        const existingIds = jumpDecorationIdsRef.current;

        if (existingIds.length > 0) {
          editor.deltaDecorations(existingIds, []);
        }
      }

      jumpDecorationIdsRef.current = [];
    }, []);

    /**
     * Run an editor action safely.
     */
    const runAction = useCallback((actionId: string) => {
      const editor = editorRef.current;

      if (!editor || editor.isDisposed()) return;

      const action = editor.getAction(actionId);

      if (!action) return;

      void action.run();
    }, []);

    /**
     * Expose editor operations to Workspace and EditorTabs.
     */
    useImperativeHandle(
      ref,
      () => ({
        triggerFind: () => {
          runAction('actions.find');
        },

        triggerReplace: () => {
          runAction('editor.action.startFindReplaceAction');
        },

        formatDocument: () => {
          runAction('editor.action.formatDocument');
        },

        focus: () => {
          editorRef.current?.focus();
        },

        selectAll: () => {
          const editor = editorRef.current;

          if (!editor || editor.isDisposed()) return;

          const model = editor.getModel();

          if (!model) return;

          editor.setSelection(model.getFullModelRange());
          editor.focus();
        },

        copy: () => {
          runAction('editor.action.clipboardCopyAction');
        },

        cut: () => {
          runAction('editor.action.clipboardCutAction');
        },

        paste: () => {
          runAction('editor.action.clipboardPasteAction');
        },

        undo: () => {
          const editor = editorRef.current;

          if (!editor || editor.isDisposed()) return;

          editor.trigger('toolbar', 'undo', null);
        },

        redo: () => {
          const editor = editorRef.current;

          if (!editor || editor.isDisposed()) return;

          editor.trigger('toolbar', 'redo', null);
        },

        clearActiveFile: () => {
          const editor = editorRef.current;

          if (!editor || editor.isDisposed()) return;

          const model = editor.getModel();

          if (!model) return;

          editor.pushUndoStop();

          editor.executeEdits('clearActiveFile', [
            {
              range: model.getFullModelRange(),
              text: '',
              forceMoveMarkers: true,
            },
          ]);

          editor.setPosition({
            lineNumber: 1,
            column: 1,
          });

          editor.pushUndoStop();

          editor.focus();
        },

        getValue: () => {
          return editorRef.current?.getModel()?.getValue() ?? '';
        },
      }),
      [runAction]
    );

    /**
     * Match diagnostic file paths to the active file.
     */
    const updateMarkers = useCallback(() => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;

      if (!editor || editor.isDisposed() || !monaco) return;

      const model = editor.getModel();

      if (!model) return;

      const activePath = file.path.replace(/\\/g, '/');
      const activeName = file.name;

      const fileDiagnostics = diagnostics.filter((diagnostic) => {
        const diagnosticFile = diagnostic.file;

        if (!diagnosticFile) return false;

        const diagnosticPath = diagnosticFile.replace(/\\/g, '/');

        return (
          diagnosticPath === activePath ||
          diagnosticPath === activeName ||
          diagnosticPath === file.path ||
          activePath.endsWith(`/${diagnosticPath}`) ||
          diagnosticPath.endsWith(`/${activeName}`)
        );
      });

      const lineCount = model.getLineCount();

      const markers: Monaco.editor.IMarkerData[] =
        fileDiagnostics.map((diagnostic) => {
          const safeLine = Math.max(
            1,
            Math.min(
              lineCount,
              Number(diagnostic.line) || 1
            )
          );

          const maxColumn = model.getLineMaxColumn(safeLine);

          const safeColumn = Math.max(
            1,
            Math.min(
              maxColumn,
              Number(diagnostic.column) || 1
            )
          );

          const endColumn = Math.min(
            maxColumn,
            safeColumn + 6
          );

          let severity = monaco.MarkerSeverity.Info;

          if (diagnostic.severity === 'error') {
            severity = monaco.MarkerSeverity.Error;
          } else if (diagnostic.severity === 'warning') {
            severity = monaco.MarkerSeverity.Warning;
          }

          return {
            startLineNumber: safeLine,
            startColumn: safeColumn,

            endLineNumber: safeLine,

            endColumn:
              endColumn > safeColumn
                ? endColumn
                : maxColumn,

            message:
              diagnostic.message +
              (diagnostic.suggestedFix
                ? `\nSuggested Fix: ${diagnostic.suggestedFix}`
                : ''),

            severity,

            source:
              diagnostic.source === 'runtime'
                ? 'RunStack Runtime'
                : 'RunStack Parser',
          };
        });

      monaco.editor.setModelMarkers(
        model,
        'runstack-diagnostics',
        markers
      );
    }, [
      diagnostics,
      file.path,
      file.name,
    ]);

    /**
     * Detect the Monaco language using the file extension first.
     */
    const getMonacoLanguage = useCallback(
      (language: string, path: string): string => {
        const normalizedPath = path.toLowerCase();

        if (
          normalizedPath.endsWith('.html') ||
          normalizedPath.endsWith('.htm')
        ) {
          return 'html';
        }

        if (normalizedPath.endsWith('.css')) {
          return 'css';
        }

        if (
          normalizedPath.endsWith('.jsx') ||
          normalizedPath.endsWith('.js') ||
          normalizedPath.endsWith('.mjs') ||
          normalizedPath.endsWith('.cjs')
        ) {
          return 'javascript';
        }

        if (
          normalizedPath.endsWith('.tsx') ||
          normalizedPath.endsWith('.ts') ||
          normalizedPath.endsWith('.mts')
        ) {
          return 'typescript';
        }

        if (normalizedPath.endsWith('.json')) {
          return 'json';
        }

        if (normalizedPath.endsWith('.py')) {
          return 'python';
        }

        if (normalizedPath.endsWith('.sql')) {
          return 'sql';
        }

        if (
          normalizedPath.endsWith('.md') ||
          normalizedPath.endsWith('.markdown')
        ) {
          return 'markdown';
        }

        if (
          normalizedPath.endsWith('.cpp') ||
          normalizedPath.endsWith('.cc') ||
          normalizedPath.endsWith('.h') ||
          normalizedPath.endsWith('.hpp')
        ) {
          return 'cpp';
        }

        if (normalizedPath.endsWith('.rs')) {
          return 'rust';
        }

        if (normalizedPath.endsWith('.java')) {
          return 'java';
        }

        if (normalizedPath.endsWith('.xml')) {
          return 'xml';
        }

        if (
          normalizedPath.endsWith('.yml') ||
          normalizedPath.endsWith('.yaml')
        ) {
          return 'yaml';
        }

        if (normalizedPath.endsWith('.sh')) {
          return 'shell';
        }

        const normalizedLanguage = (language || '').toLowerCase();

        const aliases: Record<string, string> = {
          js: 'javascript',
          jsx: 'javascript',
          ts: 'typescript',
          tsx: 'typescript',
          py: 'python',
          md: 'markdown',
          sh: 'shell',
          yml: 'yaml',
          plain: 'plaintext',
          text: 'plaintext',
        };

        return (
          aliases[normalizedLanguage] ||
          normalizedLanguage ||
          'plaintext'
        );
      },
      []
    );

    /**
     * Configure listeners when Monaco mounts.
     *
     * Monaco's visual configuration is supplied through the Editor options
     * prop below. This function manages events and runtime behavior.
     */
    const handleEditorDidMount: OnMount = useCallback(
      (editor, monaco) => {
        cleanupEditorListeners();

        editorRef.current = editor;
        monacoRef.current = monaco;

        isFocusedRef.current = editor.hasTextFocus();

        /**
         * Track focus so viewport changes don't repeatedly steal focus
         * from another control.
         */
        const focusDisposable = editor.onDidFocusEditorText(() => {
          isFocusedRef.current = true;

          if (window.innerWidth >= 768) return;

          window.setTimeout(() => {
            if (editor.isDisposed()) return;

            editor.layout();

            const position = editor.getPosition();

            if (position) {
              editor.revealPositionInCenterIfOutsideViewport(position);
            }
          }, 150);
        });

        const blurDisposable = editor.onDidBlurEditorText(() => {
          isFocusedRef.current = false;
        });

        disposablesRef.current.push(
          focusDisposable,
          blurDisposable
        );

        /**
         * Recalculate Monaco when the Android keyboard changes
         * the visible viewport.
         */
        const visualViewport = window.visualViewport;

        const handleViewportChange = () => {
          if (viewportFrameRef.current !== null) {
            window.cancelAnimationFrame(viewportFrameRef.current);
          }

          viewportFrameRef.current = window.requestAnimationFrame(() => {
            viewportFrameRef.current = null;

            if (editor.isDisposed()) return;

            editor.layout();

            if (!isFocusedRef.current) return;

            const position = editor.getPosition();

            if (position) {
              editor.revealPositionInCenterIfOutsideViewport(position);
            }
          });
        };

        visualViewport?.addEventListener(
          'resize',
          handleViewportChange
        );

        visualViewport?.addEventListener(
          'scroll',
          handleViewportChange
        );

        window.addEventListener(
          'resize',
          handleViewportChange
        );

        cleanupRef.current = () => {
          visualViewport?.removeEventListener(
            'resize',
            handleViewportChange
          );

          visualViewport?.removeEventListener(
            'scroll',
            handleViewportChange
          );

          window.removeEventListener(
            'resize',
            handleViewportChange
          );
        };

        /**
         * Apply diagnostic markers immediately after mounting.
         */
        updateMarkers();

        /**
         * Initial error navigation, if one is still valid.
         */
        if (
          jumpToLine &&
          Date.now() - jumpToLine.timestamp < 10000
        ) {
          const model = editor.getModel();

          if (model) {
            const line = Math.max(
              1,
              Math.min(
                model.getLineCount(),
                jumpToLine.line
              )
            );

            const column = Math.max(
              1,
              Math.min(
                model.getLineMaxColumn(line),
                jumpToLine.column || 1
              )
            );

            editor.setPosition({
              lineNumber: line,
              column,
            });

            editor.revealLineInCenter(line);
          }
        }
      },
      [
        cleanupEditorListeners,
        updateMarkers,
        jumpToLine,
      ]
    );

    /**
     * Update editor settings without recreating Monaco.
     */
    useEffect(() => {
      const editor = editorRef.current;

      if (!editor || editor.isDisposed()) return;

      editor.updateOptions({
        fontSize,
        wordWrap,
      });

      editor.layout();
    }, [fontSize, wordWrap]);

    /**
     * Refresh diagnostic markers when the active file or diagnostics change.
     */
    useEffect(() => {
      updateMarkers();
    }, [
      updateMarkers,
      file.id,
      file.content,
    ]);

    /**
     * Navigate to an error or requested line.
     */
    useEffect(() => {
      if (!jumpToLine) return;

      const editor = editorRef.current;
      const monaco = monacoRef.current;

      if (!editor || editor.isDisposed() || !monaco) return;

      const model = editor.getModel();

      if (!model) return;

      const line = Math.max(
        1,
        Math.min(
          model.getLineCount(),
          jumpToLine.line
        )
      );

      const column = Math.max(
        1,
        Math.min(
          model.getLineMaxColumn(line),
          jumpToLine.column || 1
        )
      );

      editor.setPosition({
        lineNumber: line,
        column,
      });

      editor.revealLineInCenter(line);

      /**
       * Remove the previous error highlight before creating another.
       */
      if (jumpDecorationIdsRef.current.length > 0) {
        jumpDecorationIdsRef.current = editor.deltaDecorations(
          jumpDecorationIdsRef.current,
          []
        );
      }

      jumpDecorationIdsRef.current = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(
              line,
              1,
              line,
              1
            ),

            options: {
              isWholeLine: true,
              className: 'bg-red-500/20 border-l-4 border-red-500',
              glyphMarginClassName: 'bg-red-500 rounded-full',
            },
          },
        ]
      );

      if (jumpTimeoutRef.current !== null) {
        window.clearTimeout(jumpTimeoutRef.current);
      }

      jumpTimeoutRef.current = window.setTimeout(() => {
        const currentEditor = editorRef.current;

        if (
          currentEditor &&
          !currentEditor.isDisposed() &&
          jumpDecorationIdsRef.current.length > 0
        ) {
          jumpDecorationIdsRef.current =
            currentEditor.deltaDecorations(
              jumpDecorationIdsRef.current,
              []
            );
        }

        jumpTimeoutRef.current = null;
      }, 2500);

      /**
       * Do not steal focus if the user is already editing.
       */
      if (!isFocusedRef.current) {
        editor.focus();
      }

      return () => {
        if (jumpTimeoutRef.current !== null) {
          window.clearTimeout(jumpTimeoutRef.current);
          jumpTimeoutRef.current = null;
        }
      };
    }, [jumpToLine, file.id]);

    /**
     * Dispose event listeners and timers when this component unmounts.
     */
    useEffect(() => {
      return () => {
        cleanupEditorListeners();
      };
    }, [cleanupEditorListeners]);

    /**
     * Keep editor configuration in one place.
     */
    const editorOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
      fontSize,

      wordWrap,

      minimap: {
        enabled: false,
      },

      scrollBeyondLastLine: false,

      automaticLayout: true,

      tabSize: 2,

      insertSpaces: true,

      detectIndentation: true,

      fontFamily:
        "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",

      padding: {
        top: 12,
        bottom: 24,
      },

      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 14,
        alwaysConsumeMouseWheel: false,
      },

      lineNumbers: 'on',

      glyphMargin: true,

      lineDecorationsWidth: 10,

      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true,
      },

      guides: {
        bracketPairs: true,
        indentation: true,
      },

      folding: true,

      renderLineHighlight: 'all',

      smoothScrolling: true,

      cursorBlinking: 'smooth',

      cursorSmoothCaretAnimation: 'on',

      autoClosingBrackets: 'always',

      autoClosingQuotes: 'always',

      formatOnPaste: true,

      formatOnType: true,

      renderWhitespace: 'selection',

      selectionHighlight: true,

      occurrencesHighlight: 'singleFile',

      copyWithSyntaxHighlighting: false,

      contextmenu: true,

      fixedOverflowWidgets: true,

      readOnly: false,

      domReadOnly: false,

      mouseWheelZoom: false,

      find: {
        addExtraSpaceOnTop: false,
        seedSearchStringFromSelection: 'always',
      },

      /**
       * Preserve long lines when wrapping is turned off.
       */
      wrappingIndent: 'same',
    };

    return (
      <div
        className={`relative h-full w-full min-w-0 min-h-0 overflow-hidden ${className}`}
        style={{
          overscrollBehavior: 'contain',
        }}
      >
        <Editor
          height="100%"
          width="100%"
          language={getMonacoLanguage(
            file.language,
            file.path
          )}
          path={file.path}
          value={file.content}
          theme={theme}
          onChange={(value) => {
            onChange(value ?? '');
          }}
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

              <span className="font-mono text-xs">
                Loading editor environment...
              </span>
            </div>
          }
        />
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
