import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { FileEdit, RunResult } from './types.js';

export async function applyFileEdits(edits: FileEdit[]): Promise<RunResult> {
  const results: string[] = [];
  let allSuccess = true;

  for (const edit of edits) {
    const filePath = resolve(process.cwd(), edit.file_path);

    if (!existsSync(filePath)) {
      results.push(`File not found: ${edit.file_path}`);
      allSuccess = false;
      continue;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');

      if (edit.search && content.includes(edit.search)) {
        // Search and replace
        const updated = content.replace(edit.search, edit.replace);
        writeFileSync(filePath, updated, 'utf-8');
        results.push(`Edited ${edit.file_path}: replaced "${edit.search.slice(0, 40)}..." with "${edit.replace.slice(0, 40)}..."`);
      } else if (edit.search) {
        // Search string not found - try JSON-aware edit for package.json
        if (edit.file_path.endsWith('.json')) {
          try {
            const json = JSON.parse(content);
            const replaceJson = JSON.parse(edit.replace);
            const merged = deepMerge(json, replaceJson);
            writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
            results.push(`Edited ${edit.file_path}: merged JSON content`);
          } catch {
            results.push(`Could not find "${edit.search.slice(0, 40)}" in ${edit.file_path}`);
            allSuccess = false;
          }
        } else {
          results.push(`Could not find "${edit.search.slice(0, 40)}" in ${edit.file_path}`);
          allSuccess = false;
        }
      } else {
        // No search = full file replace
        writeFileSync(filePath, edit.replace, 'utf-8');
        results.push(`Wrote ${edit.file_path}`);
      }
    } catch (err: any) {
      results.push(`Error editing ${edit.file_path}: ${err.message}`);
      allSuccess = false;
    }
  }

  const output = results.join('\n');
  return {
    exitCode: allSuccess ? 0 : 1,
    stdout: output,
    stderr: allSuccess ? '' : output,
    lastLines: results,
    durationMs: 0,
    timedOut: false,
    killed: false,
  };
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key]) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
