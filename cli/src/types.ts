export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  lastLines: string[];
  durationMs: number;
  timedOut: boolean;
  killed: boolean;
}

export interface Detection {
  type: 'error' | 'success' | 'warning' | 'prompt' | 'progress';
  confidence: number;
  lines: string[];
  pattern: string;
}

export interface SystemContext {
  os: { platform: string; version: string; arch: string };
  shell: string;
  runtimes: Record<string, string>;
  packageManager: string;
  projectFiles: string[];
  cwd: string;
  recentCommands: string[];
  previousFixes: string[];
  envVarNames: string[];
  diskFree: string;
  memFree: string;
}

export interface DebugContext {
  command: string;
  exitCode: number;
  cwd: string;
  lastLines: string[];
  systemContext: SystemContext;
  previousFixes: string[];
  loopNumber: number;
}

export interface FileEdit {
  file_path: string;
  search: string;
  replace: string;
}

export interface AIFix {
  diagnosis: string;
  fix_command: string;
  fix_explanation: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  alternative?: string;
  file_edits?: FileEdit[];
}

export interface LoopEntry {
  index: number;
  timestamp: string;
  error: string[];
  fix: AIFix | null;
  fixApplied: boolean;
  fixResult: 'applied' | 'fix_failed' | 'skipped' | 'edited';
  customCommand?: string;
}

export interface Session {
  id: string;
  command: string;
  startedAt: string;
  endedAt?: string;
  status: 'running' | 'success' | 'failed' | 'aborted' | 'max_loops';
  loops: LoopEntry[];
  totalLoops: number;
  systemContext: SystemContext;
}

export interface Config {
  ai: {
    provider: 'claude' | 'openai' | 'ollama';
    model: string;
    apiKey: string;
    baseUrl?: string;
    maxTokens: number;
    temperature: number;
  };
  loop: {
    maxLoops: number;
    autoApply: boolean;
    timeout: number;
  };
  report: {
    enabled: boolean;
    dir: string;
  };
  ui: {
    verbose: boolean;
    colors: boolean;
  };
}

export interface Options {
  auto: boolean;
  maxLoops: number;
  ai: string;
  model: string;
  key: string;
  report: boolean;
  verbose: boolean;
  dryRun: boolean;
  timeout: number;
}
