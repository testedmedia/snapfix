import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { AIFix, FileEdit } from './types.js';

/**
 * Smart fix enhancer: auto-generates file_edits when the AI's diagnosis
 * identifies a file-based error but only returns a command fix.
 * Works with any model quality, even tiny local ones.
 */
export function enhanceFix(fix: AIFix, errorLines: string[]): AIFix {
  // Already has file edits - AI was smart enough
  if (fix.file_edits && fix.file_edits.length > 0) return fix;

  const edits: FileEdit[] = [];
  const combined = errorLines.join('\n');

  // Pattern 1: Package name typo in package.json
  // Matches: "No matching version found for expresss@^4.0.0"
  const pkgTypo = combined.match(/no matching version found for ([^@\s]+)@([^\s.]+)/i);
  if (pkgTypo) {
    const wrongName = pkgTypo[1];
    const version = pkgTypo[2];

    // Try to figure out the correct name from the AI's fix command
    const correctMatch = fix.fix_command.match(/install\s+([^@\s]+)/);
    const correctName = correctMatch ? correctMatch[1] : null;

    if (correctName && correctName !== wrongName) {
      const pkgJsonPath = resolve(process.cwd(), 'package.json');
      if (existsSync(pkgJsonPath)) {
        const content = readFileSync(pkgJsonPath, 'utf-8');
        if (content.includes(`"${wrongName}"`)) {
          edits.push({
            file_path: 'package.json',
            search: `"${wrongName}"`,
            replace: `"${correctName}"`,
          });
        }
      }
    }
  }

  // Pattern 2: Python ImportError / ModuleNotFoundError with typo
  const pyImport = combined.match(/ModuleNotFoundError: No module named '([^']+)'/);
  if (pyImport) {
    const wrongModule = pyImport[1];
    // Check if any .py file in CWD imports this
    const correctMatch = fix.fix_command.match(/install\s+(\S+)/);
    if (correctMatch) {
      // This is a pip install fix - the module might be a typo in the source
      // For now, just let the command fix handle pip installs
    }
  }

  // Pattern 3: Source file has syntax/reference error at specific line
  const nodeErr = combined.match(/([^()\s]+\.(?:js|ts|mjs|cjs)):(\d+)/);
  if (nodeErr && !edits.length) {
    // The AI diagnosis + fix_command handles these via commands
    // File edits for source code need smarter AI - don't force it
  }

  if (edits.length > 0) {
    return {
      ...fix,
      file_edits: edits,
      // Keep the original fix_command as a follow-up (e.g., npm install after fixing package.json)
      fix_command: fix.fix_command.includes('install') ? fix.fix_command.replace(/-g\s*$/, '').trim() : fix.fix_command,
    };
  }

  return fix;
}
