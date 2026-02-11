import chalk from 'chalk';
import type { AIFix, Detection, FileEdit } from '../types.js';

const LOGO = chalk.hex('#FF6B35').bold('snapfix');

export function showBanner(command: string): void {
  console.log('');
  console.log(`  ${LOGO} ${chalk.dim('v1.0.0')}`);
  console.log(`  ${chalk.dim('Command:')} ${chalk.white(command)}`);
  console.log(`  ${chalk.dim('─'.repeat(50))}`);
  console.log('');
}

export function showLoopHeader(loop: number, maxLoops: number): void {
  const bar = chalk.hex('#FF6B35')(`[Loop ${loop}/${maxLoops}]`);
  console.log('');
  console.log(`  ${bar} ${chalk.dim('Running command...')}`);
  console.log(`  ${chalk.dim('─'.repeat(50))}`);
}

export function showError(detection: Detection): void {
  console.log('');
  const conf = Math.round(detection.confidence * 100);
  console.log(`  ${chalk.red.bold('ERROR DETECTED')} ${chalk.dim(`(${detection.pattern}, ${conf}% confidence)`)}`);
  if (detection.lines.length > 0) {
    console.log(`  ${chalk.dim('Key lines:')}`);
    for (const line of detection.lines.slice(-5)) {
      console.log(`  ${chalk.red('>')} ${chalk.dim(line.slice(0, 120))}`);
    }
  }
}

export function showThinking(): void {
  process.stdout.write(`\n  ${chalk.hex('#FF6B35')('>')} ${chalk.dim('Analyzing error...')} `);
}

export function clearThinking(): void {
  process.stdout.write('\r\x1b[K');
}

export function showFix(fix: AIFix): void {
  clearThinking();
  const confColor = fix.confidence >= 0.8 ? chalk.green : fix.confidence >= 0.5 ? chalk.yellow : chalk.red;
  const riskColor = fix.risk === 'low' ? chalk.green : fix.risk === 'medium' ? chalk.yellow : chalk.red;

  console.log(`  ${chalk.hex('#FF6B35').bold('DIAGNOSIS:')} ${fix.diagnosis}`);
  console.log('');
  console.log(`  ${chalk.white.bold('Suggested fix:')}`);
  if (fix.file_edits && fix.file_edits.length > 0) {
    for (const edit of fix.file_edits) {
      console.log(`  ${chalk.cyan('EDIT')} ${chalk.white(edit.file_path)}: ${chalk.red(edit.search.slice(0, 30))} -> ${chalk.green(edit.replace.slice(0, 30))}`);
    }
  }
  if (fix.fix_command) {
    console.log(`  ${chalk.bgGray.white(` ${fix.fix_command} `)}`);
  }
  console.log('');
  console.log(`  ${chalk.dim(fix.fix_explanation)}`);
  console.log(`  ${chalk.dim('Confidence:')} ${confColor(`${Math.round(fix.confidence * 100)}%`)}  ${chalk.dim('Risk:')} ${riskColor(fix.risk)}`);

  if (fix.alternative) {
    console.log(`  ${chalk.dim('Alternative:')} ${fix.alternative}`);
  }
  console.log('');
}

export function showApplyingEdits(edits: FileEdit[]): void {
  console.log(`  ${chalk.hex('#FF6B35')('>')} ${chalk.dim('Applying file edits:')}`);
  for (const edit of edits) {
    console.log(`    ${chalk.cyan(edit.file_path)}: "${chalk.red(edit.search.slice(0, 30))}" -> "${chalk.green(edit.replace.slice(0, 30))}"`);
  }
}

export function showApplying(command: string): void {
  console.log(`  ${chalk.hex('#FF6B35')('>')} ${chalk.dim('Applying fix:')} ${command}`);
  console.log(`  ${chalk.dim('─'.repeat(50))}`);
}

export function showFixResult(success: boolean): void {
  if (success) {
    console.log(`  ${chalk.green('>')} Fix applied successfully`);
  } else {
    console.log(`  ${chalk.yellow('>')} Fix command returned error (continuing to next loop)`);
  }
}

export function showSuccess(loops: number, startedAt: Date): void {
  const elapsed = formatDuration(Date.now() - startedAt.getTime());
  console.log('');
  console.log(`  ${chalk.green.bold('SUCCESS')} ${chalk.dim('after')} ${chalk.white.bold(String(loops))} ${chalk.dim(loops === 1 ? 'attempt' : 'attempts')} ${chalk.dim('in')} ${chalk.white(elapsed)}`);
  console.log('');
}

export function showMaxLoops(maxLoops: number): void {
  console.log('');
  console.log(`  ${chalk.yellow.bold('MAX LOOPS REACHED')} ${chalk.dim(`(${maxLoops} attempts)`)}`);
  console.log(`  ${chalk.dim('The command could not be fixed automatically.')}`);
  console.log(`  ${chalk.dim('Try running with')} ${chalk.white('--max-loops 50')} ${chalk.dim('or debug manually.')}`);
  console.log('');
}

export function showAbort(): void {
  console.log('');
  console.log(`  ${chalk.yellow.bold('ABORTED')} ${chalk.dim('by user')}`);
  console.log('');
}

export function showApiError(err: string): void {
  console.log(`  ${chalk.red('>')} AI error: ${err}`);
  console.log(`  ${chalk.dim('  Check your API key:')} snapfix config set ai.apiKey YOUR_KEY`);
}

export function showReportSaved(path: string): void {
  console.log(`  ${chalk.dim('Report saved:')} ${chalk.underline(path)}`);
}

export function showNoApiKey(provider: string): void {
  console.log('');
  console.log(`  ${chalk.red.bold('No API key configured')}`);
  console.log('');
  console.log(`  Set your ${provider} API key:`);
  console.log(`  ${chalk.white(`snapfix config set ai.apiKey YOUR_KEY`)}`);
  console.log('');
  console.log(`  Or use environment variable:`);
  const envVar = provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  console.log(`  ${chalk.white(`export ${envVar}=YOUR_KEY`)}`);
  console.log('');
  console.log(`  Or use Ollama (free, local):`);
  console.log(`  ${chalk.white('snapfix --ai ollama npm install')}`);
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
