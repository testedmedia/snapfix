import chalk from 'chalk';
import type { AIFix, Detection, FileEdit } from '../types.js';

const BRAND = chalk.hex('#FF6B35');

export function showBanner(command: string): void {
  console.log('');
  console.log(`  ${BRAND.bold('snapfix')} ${chalk.dim('·')} ${chalk.white(command)}`);
  console.log('');
}

export function showLoopHeader(loop: number, maxLoops: number): void {
  if (loop === 1) {
    console.log(`  ${chalk.dim('Running...')}`);
  } else {
    console.log(`  ${chalk.dim(`Retry ${loop}/${maxLoops}...`)}`);
  }
}

export function showError(detection: Detection): void {
  // Show just the most important error line, not a wall of text
  const key = detection.lines.filter(l => /error|ERR!|not found|failed|denied/i.test(l));
  const best = key.length > 0 ? key[key.length - 1] : detection.lines[detection.lines.length - 1];
  if (best) {
    console.log(`  ${chalk.red('✗')} ${chalk.dim(best.slice(0, 100))}`);
  }
}

export function showThinking(): void {
  process.stdout.write(`  ${BRAND('⟳')} ${chalk.dim('Diagnosing...')} `);
}

export function clearThinking(): void {
  process.stdout.write('\r\x1b[K');
}

export function showFix(fix: AIFix): void {
  clearThinking();
  console.log(`  ${BRAND('▸')} ${fix.diagnosis}`);

  if (fix.file_edits && fix.file_edits.length > 0) {
    for (const edit of fix.file_edits) {
      console.log(`    ${chalk.cyan('edit')} ${edit.file_path}: ${chalk.red(edit.search.slice(0, 30))} → ${chalk.green(edit.replace.slice(0, 30))}`);
    }
  }
  if (fix.fix_command) {
    console.log(`    ${chalk.cyan('run')}  ${fix.fix_command}`);
  }
}

export function showApplyingEdits(edits: FileEdit[]): void {
  for (const edit of edits) {
    console.log(`  ${chalk.cyan('✎')} ${edit.file_path}`);
  }
}

export function showApplying(command: string): void {
  console.log(`  ${chalk.cyan('$')} ${chalk.dim(command)}`);
}

export function showFixResult(success: boolean): void {
  if (success) {
    console.log(`  ${chalk.green('✓')} Fix applied`);
  } else {
    console.log(`  ${chalk.yellow('~')} Fix applied (may need another pass)`);
  }
}

export function showSuccess(loops: number, startedAt: Date): void {
  const elapsed = formatDuration(Date.now() - startedAt.getTime());
  console.log('');
  console.log(`  ${chalk.green.bold('✅ Fixed')} ${chalk.dim('in')} ${chalk.white(elapsed)} ${chalk.dim(`(${loops} ${loops === 1 ? 'attempt' : 'attempts'})`)}`);
  console.log('');
}

export function showMaxLoops(maxLoops: number): void {
  console.log('');
  console.log(`  ${chalk.yellow('⚠')}  Couldn't fix after ${maxLoops} attempts.`);
  console.log(`     ${chalk.dim('Try:')} snapfix --ai openai "your command"  ${chalk.dim('(smarter model)')}`);
  console.log('');
}

export function showAbort(): void {
  console.log(`  ${chalk.dim('Stopped.')}`);
}

export function showApiError(err: string): void {
  console.log(`  ${chalk.red('✗')} AI error: ${err}`);
}

export function showReportSaved(path: string): void {
  console.log(`  ${chalk.dim('Report:')} ${path}`);
}

export function showNoApiKey(provider: string): void {
  console.log('');
  console.log(`  ${chalk.red('✗')} No API key for ${provider}`);
  console.log('');
  console.log(`  ${chalk.white('Free options (no key needed):')}`);
  console.log(`    snapfix --ai ollama "your command"  ${chalk.dim('(local, requires Ollama)')}`);
  console.log('');
  console.log(`  ${chalk.white('Free with key:')}`);
  console.log(`    export GROQ_API_KEY=...   ${chalk.dim('(free at console.groq.com)')}`);
  console.log(`    export GEMINI_API_KEY=... ${chalk.dim('(free at aistudio.google.com)')}`);
  console.log('');
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}m ${remSecs}s`;
}
