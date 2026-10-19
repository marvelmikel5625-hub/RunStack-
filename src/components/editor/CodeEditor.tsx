import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { ProjectFile } from '../../types/project';
import { Diagnostic } from '../../types/diagnostics';

export interface CodeEditorHandle {
  triggerFind: () => void;
  triggerReplace: () => void;
  formatDocument: () => void;
  focus: () => void;
}

interface CodeEditorProps {
  file: ProjectFile;
  onChange: (newContent: string) => void;
  theme: 'vs' | 'vs-dark';
  fontSize: number;
  wordWrap: 'on' | 'off';
  jumpToLine?: { line: number; column?: number; timestamp: number } | null;
  diagnostics?: Diagnostic[];
  className?: string;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
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
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);

    useImperativeHandle(ref, () => ({
      triggerFind: () => {
        if (editorRef.current) {
          editorRef.current.getAction('actions.find')?.run();
        }
      },
      triggerReplace: () => {
        if (editorRef.current) {
          editorRef.current.getAction('editor.action.startFindReplaceAction')?.run();
        }
      },
      formatDocument: () => {
        if (editorRef.current) {
          editorRef.current.getAction('editor.action.formatDocument')?.run();
        }
      },
      focus: () => {
        editorRef.current?.focus();
      },
    }));

    const updateMarkers = () => {
      if (!monacoRef.current || !editorRef.current) return;
      const model = editorRef.current.getModel();
      if (!model) return;

      const fileDiags = diagnostics.filter(
        (d) =>
          d.file === file.path ||
          d.file === file.name ||
          file.path.endsWith(d.file) ||
          d.file.endsWith(file.name)
      );

      const markers: Monaco.editor.IMarkerData[] = fileDiags.map((d) => {
        const lineCount = model.getLineCount();
        const safeLine = Math.max(1, Math.min(lineCount, d.line));
        const maxCol = model.getLineMaxColumn(safeLine);
        const safeCol = Math.max(1, Math.min(maxCol, d.column || 1));
        const endCol = Math.min(maxCol, safeCol + 6);

        return {
          startLineNumber: safeLine,
          startColumn: safeCol,
          endLineNumber: safeLine,
          endColumn: endCol > safeCol ? endCol : maxCol,
          message: d.message + (d.suggestedFix ? `\nSuggested Fix: ${d.suggestedFix}` : ''),
          severity:
            d.severity === 'error'
              ? monacoRef.current!.MarkerSeverity.Error
              : d.severity === 'warning'
              ? monacoRef.current!.MarkerSeverity.Warning
              : monacoRef.current!.MarkerSeverity.Info,
          source: d.source === 'runtime' ? 'RunStack Runtime' : 'RunStack Parser',
        };
      });

      monacoRef.current.editor.setModelMarkers(model, 'runstack-diagnostics', markers);
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Professional editor configuration
      editor.updateOptions({
        fontSize,
        wordWrap,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
        padding: { top: 12, bottom: 12 },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        glyphMargin: true,
        bracketPairColorization: {
          enabled: true,
          independentColorPoolPerBracketType: true,
        },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        formatOnPaste: true,
        formatOnType: true,
        renderWhitespace: 'selection',
        find: {
          addExtraSpaceOnTop: false,
          seedSearchStringFromSelection: 'always',
        },
      });

      updateMarkers();

      // Check if there is an active jumpToLine pending from error click
      if (jumpToLine && Date.now() - jumpToLine.timestamp < 10000) {
        setTimeout(() => {
          editor.revealLineInCenter(jumpToLine.line);
          editor.setPosition({
            lineNumber: jumpToLine.line,
            column: jumpToLine.column || 1,
          });
          const deltaDecorations = editor.deltaDecorations(
            [],
            [
              {
                range: new monaco.Range(jumpToLine.line, 1, jumpToLine.line, 1),
                options: {
                  isWholeLine: true,
                  className: 'bg-red-500/20 border-l-4 border-red-500',
                  glyphMarginClassName: 'bg-red-500 rounded-full',
                },
              },
            ]
          );
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.deltaDecorations(deltaDecorations, []);
            }
          }, 3000);
          editor.focus();
        }, 100);
      }
    };

    // Update settings dynamically if changed
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.updateOptions({
          fontSize,
          wordWrap,
        });
      }
    }, [fontSize, wordWrap]);

    // Sync markers whenever diagnostics or active file content changes
    useEffect(() => {
      updateMarkers();
    }, [diagnostics, file.id, file.content]);

    // React to jumpToLine updates from problem/error clicks
    useEffect(() => {
      if (!jumpToLine || !editorRef.current) return;

      const editor = editorRef.current;
      editor.revealLineInCenter(jumpToLine.line);
      editor.setPosition({
        lineNumber: jumpToLine.line,
        column: jumpToLine.column || 1,
      });

      // Highlight the targeted line with a flash decoration
      const deltaDecorations = editor.deltaDecorations(
        [],
        [
          {
            range: new monacoRef.current!.Range(jumpToLine.line, 1, jumpToLine.line, 1),
            options: {
              isWholeLine: true,
              className: 'bg-red-500/20 border-l-3 border-red-500',
              glyphMarginClassName: 'bg-red-500 rounded-full',
            },
          },
        ]
      );

      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.deltaDecorations(deltaDecorations, []);
        }
      }, 2500);

      editor.focus();
    }, [jumpToLine]);

    // Map file language to Monaco language identifier
    const getMonacoLanguage = (lang: string, path: string): string => {
      if (path.endsWith('.html') || path.endsWith('.htm')) return 'html';
      if (path.endsWith('.css')) return 'css';
      if (path.endsWith('.js') || path.endsWith('.mjs')) return 'javascript';
      if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
      if (path.endsWith('.py')) return 'python';
      if (path.endsWith('.sql')) return 'sql';
      if (path.endsWith('.json')) return 'json';
      if (path.endsWith('.md')) return 'markdown';
      if (path.endsWith('.cpp') || path.endsWith('.h') || path.endsWith('.hpp')) return 'cpp';
      if (path.endsWith('.rs')) return 'rust';
      if (path.endsWith('.java')) return 'java';
      return lang || 'plaintext';
    };

    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <Editor
          key={file.id}
          height="100%"
          width="100%"
          language={getMonacoLanguage(file.language, file.path)}
          value={file.content}
          theme={theme}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            wordWrap,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
            padding: { top: 10, bottom: 10 },
            lineNumbers: 'on',
            glyphMargin: true,
            bracketPairColorization: { enabled: true },
            folding: true,
            lineDecorationsWidth: 10,
            fixedOverflowWidgets: true,
          }}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Loading editor environment...</span>
            </div>
          }
        />
      </div>
    );
  }
);
