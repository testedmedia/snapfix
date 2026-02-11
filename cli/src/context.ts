import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { platform, arch, release, freemem, totalmem } from 'os';
import { join } from 'path';
import type { RunResult, SystemContext, DebugContext } from './types.js';

function tryExec(cmd: string): string {
  try {
    return execSync(cmd, { timeout: 5_000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function getShell(): string {
  return process.env.SHELL || tryExec('echo $SHELL') || 'unknown';
}

function getRuntimes(): Record<string, string> {
  const runtimes: Record<string, string> = {};
  const checks: [string, string][] = [
    ['node', 'node -v'],
    ['npm', 'npm -v'],
    ['yarn', 'yarn -v'],
    ['pnpm', 'pnpm -v'],
    ['bun', 'bun -v'],
    ['python3', 'python3 --version'],
    ['python', 'python --version'],
    ['pip', 'pip3 --version'],
    ['go', 'go version'],
    ['rust', 'rustc --version'],
    ['cargo', 'cargo --version'],
    ['ruby', 'ruby -v'],
    ['java', 'java -version 2>&1'],
    ['docker', 'docker --version'],
    ['brew', 'brew --version'],
    ['git', 'git --version'],
  ];

  for (const [name, cmd] of checks) {
    const ver = tryExec(cmd);
    if (ver) {
      const match = ver.match(/\d+\.\d+[\.\d]*/);
      runtimes[name] = match ? match[0] : ver.slice(0, 50);
    }
  }
  return runtimes;
}

function detectPackageManager(cwd: string): string {
  if (existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(cwd, 'package-lock.json'))) return 'npm';
  if (existsSync(join(cwd, 'requirements.txt'))) return 'pip';
  if (existsSync(join(cwd, 'Pipfile'))) return 'pipenv';
  if (existsSync(join(cwd, 'Cargo.toml'))) return 'cargo';
  if (existsSync(join(cwd, 'go.mod'))) return 'go';
  if (existsSync(join(cwd, 'Gemfile'))) return 'bundler';
  return 'unknown';
}

function findProjectFiles(cwd: string): string[] {
  const candidates = [
    'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'requirements.txt', 'Pipfile', 'pyproject.toml', 'setup.py',
    'Cargo.toml', 'go.mod', 'Gemfile', 'Makefile', 'CMakeLists.txt',
    'docker-compose.yml', 'docker-compose.yaml', 'Dockerfile',
    '.nvmrc', '.python-version', '.tool-versions', '.node-version',
  ];
  return candidates.filter((f) => existsSync(join(cwd, f)));
}

function getDiskFree(): string {
  const df = tryExec('df -h / | tail -1');
  if (!df) return 'unknown';
  const parts = df.split(/\s+/);
  return parts[3] || 'unknown';
}

function getEnvVarNames(): string[] {
  // Only names, NEVER values (security)
  return Object.keys(process.env)
    .filter((k) => !k.startsWith('npm_') && !k.startsWith('_'))
    .slice(0, 50);
}

export function collectContext(): SystemContext {
  const cwd = process.cwd();
  return {
    os: {
      platform: platform(),
      version: release(),
      arch: arch(),
    },
    shell: getShell(),
    runtimes: getRuntimes(),
    packageManager: detectPackageManager(cwd),
    projectFiles: findProjectFiles(cwd),
    cwd,
    recentCommands: [],
    previousFixes: [],
    envVarNames: getEnvVarNames(),
    diskFree: getDiskFree(),
    memFree: `${Math.round(freemem() / 1024 / 1024)}MB / ${Math.round(totalmem() / 1024 / 1024)}MB`,
  };
}

export function buildDebugContext(
  command: string,
  result: RunResult,
  previousFixes: string[],
  loopNumber: number,
  sysCtx: SystemContext
): DebugContext {
  return {
    command,
    exitCode: result.exitCode,
    cwd: process.cwd(),
    lastLines: result.lastLines.slice(-50),
    systemContext: { ...sysCtx, previousFixes },
    previousFixes,
    loopNumber,
  };
}
