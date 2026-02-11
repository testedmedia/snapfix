import { randomUUID } from 'crypto';
import type { Options, Session, LoopEntry, AIFix } from './types.js';
import { runCommand, runFixCommand } from './runner.js';
import { applyFileEdits } from './file-editor.js';
import { enhanceFix } from './fix-enhancer.js';
import { detect } from './detector.js';
import { collectContext, buildDebugContext } from './context.js';
import { createProviderFromConfig } from './ai/index.js';
import { loadConfig, resolveApiKey } from './config.js';
import * as ui from './ui/display.js';
import { askApproval, getCustomCommand } from './ui/prompt.js';
import { generateReport, saveReport } from './report/generator.js';

export async function debugLoop(command: string, options: Options): Promise<Session> {
  const config = loadConfig();
  const provider = options.ai || config.ai.provider;
  const apiKey = resolveApiKey(options.key, config);
  const maxLoops = options.maxLoops || config.loop.maxLoops;
  const autoApply = options.auto || config.loop.autoApply;
  const timeout = options.timeout || config.loop.timeout;

  // Defer API key check until we actually need the AI (on first error)
  let ai: ReturnType<typeof createProviderFromConfig> | null = null;

  function getAI() {
    if (ai) return ai;
    if (provider !== 'ollama' && provider !== 'local' && !apiKey) {
      ui.showNoApiKey(provider);
      process.exit(1);
    }
    ai = createProviderFromConfig(config, {
      provider,
      key: apiKey,
      model: options.model,
    });
    return ai;
  }

  const sysCtx = collectContext();

  const session: Session = {
    id: randomUUID(),
    command,
    startedAt: new Date().toISOString(),
    status: 'running',
    loops: [],
    totalLoops: 0,
    systemContext: sysCtx,
  };

  const previousFixes: string[] = [];
  let loopCount = 0;

  ui.showBanner(command);

  // Handle Ctrl+C gracefully
  const abortHandler = () => {
    session.status = 'aborted';
    session.endedAt = new Date().toISOString();
    session.totalLoops = loopCount;
    ui.showAbort();
    if (options.report || config.report.enabled) {
      const path = saveReport(session, config.report.dir);
      ui.showReportSaved(path);
    }
    process.exit(0);
  };
  process.on('SIGINT', abortHandler);

  try {
    while (loopCount < maxLoops) {
      loopCount++;
      ui.showLoopHeader(loopCount, maxLoops);

      // 1. Run the command
      const result = await runCommand(command, timeout);

      // 2. Detect outcome
      const detection = detect(result);

      // 3. SUCCESS
      if (detection.type === 'success') {
        session.status = 'success';
        session.totalLoops = loopCount;
        session.endedAt = new Date().toISOString();
        ui.showSuccess(loopCount, new Date(session.startedAt));
        break;
      }

      // 4. ERROR - enter debug cycle
      if (detection.type === 'error' || detection.type === 'warning') {
        ui.showError(detection);

        // 5. Build context for AI
        const debugCtx = buildDebugContext(command, result, previousFixes, loopCount, sysCtx);

        // 6. Ask AI for fix
        let fix: AIFix;
        try {
          ui.showThinking();
          fix = await getAI().diagnose(debugCtx);
          // Smart enhance: auto-generate file edits for common patterns
          fix = enhanceFix(fix, detection.lines);
          ui.showFix(fix);
        } catch (err: any) {
          ui.showApiError(err.message);
          session.status = 'failed';
          break;
        }

        // 7. Empty fix = AI is stuck
        if (!fix.fix_command && (!fix.file_edits || fix.file_edits.length === 0)) {
          console.log('  AI could not suggest a fix.');
          session.status = 'failed';
          break;
        }

        // 8. Dry run mode - just show, don't apply
        if (options.dryRun) {
          session.loops.push({
            index: loopCount,
            timestamp: new Date().toISOString(),
            error: detection.lines,
            fix,
            fixApplied: false,
            fixResult: 'skipped',
          });
          continue;
        }

        // 9. Get approval
        let action: string;
        if (autoApply && fix.risk !== 'high') {
          action = 'apply';
          console.log(`  ${'\x1b[90m'}Auto-applying (--auto mode)...\x1b[0m`);
        } else {
          action = await askApproval();
        }

        const entry: LoopEntry = {
          index: loopCount,
          timestamp: new Date().toISOString(),
          error: detection.lines,
          fix,
          fixApplied: false,
          fixResult: 'skipped',
        };

        if (action === 'quit') {
          session.status = 'aborted';
          session.loops.push(entry);
          ui.showAbort();
          break;
        }

        if (action === 'skip') {
          entry.fixResult = 'skipped';
          session.loops.push(entry);
          continue;
        }

        if (action === 'edit') {
          const custom = await getCustomCommand();
          if (custom) {
            ui.showApplying(custom);
            const fixResult = await runFixCommand(custom);
            entry.fixApplied = true;
            entry.fixResult = fixResult.exitCode === 0 ? 'applied' : 'fix_failed';
            entry.customCommand = custom;
            previousFixes.push(custom);
            ui.showFixResult(fixResult.exitCode === 0);
          }
          session.loops.push(entry);
          continue;
        }

        // Apply the AI fix
        let fixSuccess = true;

        // Apply file edits first (if any)
        if (fix.file_edits && fix.file_edits.length > 0) {
          ui.showApplyingEdits(fix.file_edits);
          const editResult = await applyFileEdits(fix.file_edits);
          if (editResult.exitCode !== 0) {
            fixSuccess = false;
            console.log(`  ${editResult.stderr}`);
          } else {
            console.log(`  ${editResult.stdout}`);
          }
          previousFixes.push(`[file edits: ${fix.file_edits.map(e => e.file_path).join(', ')}]`);
        }

        // Then run command (if any)
        if (fix.fix_command) {
          ui.showApplying(fix.fix_command);
          const cmdResult = await runFixCommand(fix.fix_command);
          fixSuccess = fixSuccess && cmdResult.exitCode === 0;
          previousFixes.push(fix.fix_command);
        }

        entry.fixApplied = true;
        entry.fixResult = fixSuccess ? 'applied' : 'fix_failed';
        ui.showFixResult(fixSuccess);
        session.loops.push(entry);
      }
    }

    // Max loops reached
    if (loopCount >= maxLoops && session.status === 'running') {
      session.status = 'max_loops';
      session.totalLoops = loopCount;
      session.endedAt = new Date().toISOString();
      ui.showMaxLoops(maxLoops);
    }
  } finally {
    process.removeListener('SIGINT', abortHandler);
  }

  // Generate report
  session.totalLoops = loopCount;
  if (!session.endedAt) session.endedAt = new Date().toISOString();

  if (options.report || config.report.enabled) {
    const path = saveReport(session, config.report.dir);
    ui.showReportSaved(path);
  }

  return session;
}
