import { spawn } from 'child_process';
import stripAnsi from 'strip-ansi';
import type { RunResult } from './types.js';

const MAX_BUFFER_LINES = 500;

export async function runCommand(
  command: string,
  timeout: number = 300_000,
  onData?: (data: string) => void
): Promise<RunResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    let killed = false;
    let timedOut = false;

    // Parse command into shell execution
    const proc = spawn('bash', ['-c', command], {
      env: { ...process.env, FORCE_COLOR: '1' },
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    const timer = setTimeout(() => {
      timedOut = true;
      killed = true;
      proc.kill('SIGTERM');
      setTimeout(() => {
        if (!proc.killed) proc.kill('SIGKILL');
      }, 5_000);
    }, timeout);

    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write(text);
      const clean = stripAnsi(text);
      const lines = clean.split('\n').filter(Boolean);
      stdoutLines.push(...lines);
      if (stdoutLines.length > MAX_BUFFER_LINES) {
        stdoutLines.splice(0, stdoutLines.length - MAX_BUFFER_LINES);
      }
      onData?.(clean);
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      process.stderr.write(text);
      const clean = stripAnsi(text);
      const lines = clean.split('\n').filter(Boolean);
      stderrLines.push(...lines);
      if (stderrLines.length > MAX_BUFFER_LINES) {
        stderrLines.splice(0, stderrLines.length - MAX_BUFFER_LINES);
      }
      onData?.(clean);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      const allLines = [...stdoutLines, ...stderrLines];
      const lastLines = allLines.slice(-100);

      resolve({
        exitCode: code ?? 1,
        stdout: stdoutLines.join('\n'),
        stderr: stderrLines.join('\n'),
        lastLines,
        durationMs: Date.now() - startTime,
        timedOut,
        killed,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        exitCode: 127,
        stdout: '',
        stderr: err.message,
        lastLines: [err.message],
        durationMs: Date.now() - startTime,
        timedOut: false,
        killed: false,
      });
    });
  });
}

export async function runFixCommand(
  command: string,
  timeout: number = 120_000
): Promise<RunResult> {
  return runCommand(command, timeout);
}
