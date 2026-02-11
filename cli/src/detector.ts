import type { RunResult, Detection } from './types.js';

interface PatternRule {
  type: Detection['type'];
  pattern?: RegExp;
  check?: (result: RunResult) => boolean;
  confidence: number;
  label: string;
}

const RULES: PatternRule[] = [
  // Exit code is the primary signal
  { type: 'success', check: (r) => r.exitCode === 0, confidence: 0.95, label: 'exit_code_0' },
  { type: 'error', check: (r) => r.exitCode !== 0 && r.exitCode !== null, confidence: 0.90, label: 'non_zero_exit' },

  // Critical errors
  { type: 'error', pattern: /FATAL|panic|Segmentation fault|core dumped|SIGSEGV|SIGABRT/i, confidence: 0.98, label: 'fatal_crash' },
  { type: 'error', pattern: /out of memory|ENOMEM|heap out of memory|JavaScript heap/i, confidence: 0.95, label: 'oom' },

  // Permission errors
  { type: 'error', pattern: /permission denied|EACCES|EPERM|Operation not permitted/i, confidence: 0.92, label: 'permission' },

  // Not found errors
  { type: 'error', pattern: /command not found|not found|ENOENT|No such file/i, confidence: 0.90, label: 'not_found' },
  { type: 'error', pattern: /Module not found|ImportError|ModuleNotFoundError|Cannot find module/i, confidence: 0.90, label: 'module_not_found' },

  // Build/compile errors
  { type: 'error', pattern: /error\[E\d+\]|error:|ERR!|ERROR|SyntaxError|TypeError/i, confidence: 0.85, label: 'compile_error' },
  { type: 'error', pattern: /gyp ERR!|node-pre-gyp|node-gyp/i, confidence: 0.88, label: 'native_build' },
  { type: 'error', pattern: /Traceback \(most recent|raise \w+Error/i, confidence: 0.88, label: 'python_traceback' },

  // Network errors
  { type: 'error', pattern: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|connection refused|network error/i, confidence: 0.85, label: 'network' },
  { type: 'error', pattern: /404 Not Found|403 Forbidden|401 Unauthorized/i, confidence: 0.80, label: 'http_error' },

  // Dependency errors
  { type: 'error', pattern: /peer dep|ERESOLVE|conflicting peer|dependency conflict/i, confidence: 0.88, label: 'dep_conflict' },
  { type: 'error', pattern: /version .+ not found|no matching version/i, confidence: 0.85, label: 'version_not_found' },

  // Warnings (lower confidence, don't trigger fix loop)
  { type: 'warning', pattern: /WARN|warning:|deprecated/i, confidence: 0.50, label: 'warning' },

  // Success patterns
  { type: 'success', pattern: /added \d+ packages?/i, confidence: 0.92, label: 'npm_success' },
  { type: 'success', pattern: /Successfully installed/i, confidence: 0.92, label: 'pip_success' },
  { type: 'success', pattern: /Build (successful|complete)|Compiled successfully/i, confidence: 0.90, label: 'build_success' },
  { type: 'success', pattern: /already (installed|satisfied|up-to-date)/i, confidence: 0.88, label: 'already_done' },

  // Interactive prompts (need user input)
  { type: 'prompt', pattern: /\? .*[:\?]|y\/n|Y\/N|\[y\/N\]|\[Y\/n\]/i, confidence: 0.70, label: 'yn_prompt' },
  { type: 'prompt', pattern: /Press (Enter|RETURN|any key)/i, confidence: 0.70, label: 'press_key' },
  { type: 'prompt', pattern: /password:|Password:|token:|Token:/i, confidence: 0.80, label: 'auth_prompt' },
];

export function detect(result: RunResult): Detection {
  let best: Detection = {
    type: 'error',
    confidence: 0,
    lines: result.lastLines.slice(-20),
    pattern: 'unknown',
  };

  for (const rule of RULES) {
    let matched = false;

    if (rule.check) {
      matched = rule.check(result);
    } else if (rule.pattern) {
      const combined = result.lastLines.join('\n');
      matched = rule.pattern.test(combined);
    }

    if (matched && rule.confidence > best.confidence) {
      const matchedLines = rule.pattern
        ? result.lastLines.filter((l) => rule.pattern!.test(l))
        : result.lastLines.slice(-10);

      best = {
        type: rule.type,
        confidence: rule.confidence,
        lines: matchedLines.length > 0 ? matchedLines : result.lastLines.slice(-10),
        pattern: rule.label,
      };
    }
  }

  // If exit code is 0, always treat as success regardless of stderr noise
  if (result.exitCode === 0 && best.type === 'error') {
    best.type = 'success';
    best.confidence = 0.95;
    best.pattern = 'exit_code_override';
  }

  return best;
}

export function extractErrorSummary(result: RunResult): string {
  const errorLines = result.lastLines.filter((l) =>
    /error|ERR!|FATAL|failed|denied|not found|Traceback/i.test(l)
  );
  if (errorLines.length > 0) return errorLines.slice(-10).join('\n');
  return result.lastLines.slice(-20).join('\n');
}
