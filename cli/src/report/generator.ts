import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Session } from '../types.js';

export function generateReport(session: Session): string {
  const status = session.status === 'success' ? 'Success' : session.status === 'aborted' ? 'Aborted' : 'Failed';
  const duration = session.endedAt
    ? formatMs(new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime())
    : 'unknown';

  const lines: string[] = [
    `# SnapFix Report`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Command** | \`${session.command}\` |`,
    `| **Status** | ${status} after ${session.totalLoops} ${session.totalLoops === 1 ? 'loop' : 'loops'} |`,
    `| **Duration** | ${duration} |`,
    `| **Date** | ${new Date(session.startedAt).toLocaleDateString()} |`,
    `| **OS** | ${session.systemContext.os.platform} ${session.systemContext.os.version} (${session.systemContext.os.arch}) |`,
    ``,
  ];

  if (session.loops.length > 0) {
    for (const loop of session.loops) {
      lines.push(`## Loop ${loop.index}`);
      lines.push('');

      if (loop.error.length > 0) {
        lines.push(`**Error:**`);
        lines.push('```');
        lines.push(loop.error.slice(-5).join('\n'));
        lines.push('```');
      }

      if (loop.fix) {
        lines.push(`**Diagnosis:** ${loop.fix.diagnosis}`);
        lines.push(`**Fix:** \`${loop.customCommand || loop.fix.fix_command}\``);
        lines.push(`**Result:** ${formatResult(loop.fixResult)}`);
        lines.push(`**Confidence:** ${Math.round(loop.fix.confidence * 100)}% | **Risk:** ${loop.fix.risk}`);
      }
      lines.push('');
    }
  }

  // Final status
  if (session.status === 'success') {
    lines.push(`## Result`);
    lines.push(`Command completed successfully after ${session.totalLoops} ${session.totalLoops === 1 ? 'attempt' : 'attempts'}.`);
    lines.push('');
  }

  lines.push(`---`);
  lines.push(`*Debugged with [SnapFix](https://snapfix.dev)*`);

  return lines.join('\n');
}

export function generateJSON(session: Session): string {
  return JSON.stringify(session, null, 2);
}

export function saveReport(session: Session, dir: string): string {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `${timestamp}-${session.id.slice(0, 8)}`;

  // Save JSON
  const jsonPath = join(dir, `${baseName}.json`);
  writeFileSync(jsonPath, generateJSON(session));

  // Save Markdown
  const mdPath = join(dir, `${baseName}.md`);
  writeFileSync(mdPath, generateReport(session));

  return mdPath;
}

export function listReports(dir: string): { id: string; date: string; command: string; status: string; path: string }[] {
  if (!existsSync(dir)) return [];

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();

  return files.map((f) => {
    try {
      const raw = readFileSync(join(dir, f), 'utf-8');
      const session: Session = JSON.parse(raw);
      return {
        id: session.id.slice(0, 8),
        date: new Date(session.startedAt).toLocaleString(),
        command: session.command,
        status: session.status,
        path: join(dir, f.replace('.json', '.md')),
      };
    } catch {
      return { id: f, date: 'unknown', command: 'unknown', status: 'unknown', path: join(dir, f) };
    }
  });
}

export function viewReport(dir: string, idPrefix: string): string | null {
  if (!existsSync(dir)) return null;

  const files = readdirSync(dir).filter((f) => f.endsWith('.md') && f.includes(idPrefix));
  if (files.length === 0) return null;

  return readFileSync(join(dir, files[0]), 'utf-8');
}

function formatResult(result: string): string {
  switch (result) {
    case 'applied': return 'Applied successfully';
    case 'fix_failed': return 'Fix command failed';
    case 'skipped': return 'Skipped by user';
    case 'edited': return 'User provided custom fix';
    default: return result;
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}m ${remSecs}s`;
}
