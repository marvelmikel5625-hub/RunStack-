export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  id: string;
  file: string;
  line: number;
  column?: number;
  message: string;
  severity: DiagnosticSeverity;
  source: 'static' | 'runtime' | 'compiler';
  suggestedFix?: string;
}

export type ConsoleMessageType = 'log' | 'info' | 'warn' | 'error';

export interface ConsoleMessage {
  id: string;
  type: ConsoleMessageType;
  text: string;
  timestamp: number;
  source?: string;
  line?: number;
  column?: number;
  data?: unknown[];
}

export interface AnimationInfo {
  id: string;
  name: string;
  playState: 'running' | 'paused' | 'finished' | 'idle';
  playbackRate: number;
  currentTime: number;
  duration: number;
  targetTag: string;
  targetClass?: string;
  targetId?: string;
}

export interface NetworkRequestInfo {
  id: string;
  method: string;
  url: string;
  status: number | 'pending' | 'failed';
  statusText?: string;
  type: 'fetch' | 'xhr';
  durationMs: number;
  timestamp: number;
}

export interface ExecutionResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  outputRows?: Array<Record<string, unknown>>;
  columns?: string[];
  executionTimeMs?: number;
  error?: string;
}
