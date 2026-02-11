# BUILD PROMPT: SnapFix MVP

> Hand this to any senior dev (or Claude Code) to build the MVP in 3-4 days.

---

## What You're Building

A CLI tool called `snapfix` that automates the developer debug cycle:
screenshot terminal → paste to AI → get fix → apply fix → repeat.

Instead of 20-40 manual screenshot-paste rounds, the developer runs:
```bash
snapfix npm install
```

And the tool handles the entire loop automatically until the command succeeds.

---

## Core Loop (This IS the Product)

```
┌─────────────────────────────────────────────┐
│  1. Run command in PTY wrapper               │
│  2. Capture stdout/stderr in real-time       │
│  3. Detect: error? success? prompt?          │
│                                              │
│  If ERROR:                                   │
│    4. Capture terminal state (last 100 lines)│
│    5. Collect system context:                │
│       - OS, arch, shell                      │
│       - Node/Python/Ruby/Go versions         │
│       - package.json / requirements.txt      │
│       - Previous commands in this session     │
│       - Previous fixes attempted             │
│    6. Send to AI with structured prompt      │
│    7. Parse AI response for fix commands     │
│    8. Display fix to user:                   │
│       "SnapFix suggests: brew install gcc" │
│       [Apply] [Skip] [Edit] [Quit]          │
│    9. If approved: run fix command           │
│   10. Re-run original command                │
│   11. Go to step 2                           │
│                                              │
│  If SUCCESS:                                 │
│   12. Show summary: loops, time, fixes       │
│   13. Generate debug report                  │
│   14. Done                                   │
│                                              │
│  If MAX_LOOPS (default 25):                  │
│   15. Stop, show all attempted fixes         │
│   16. Generate partial report                │
│   17. Suggest manual next steps              │
└─────────────────────────────────────────────┘
```

---

## CLI Interface

```bash
# Basic usage - wrap any command
snapfix npm install
snapfix pip install tensorflow
snapfix docker compose up
snapfix brew install ffmpeg
snapfix cargo build

# Options
snapfix --auto          # Auto-apply fixes without confirmation
snapfix --max-loops 10  # Limit iterations (default: 25)
snapfix --ai claude     # AI provider (claude|openai|ollama)
snapfix --model gpt-4o  # Specific model
snapfix --key sk-xxx    # API key (or use SNAPFIX_API_KEY env)
snapfix --report        # Generate shareable report at end
snapfix --verbose       # Show full AI reasoning
snapfix --dry-run       # Show what AI suggests, don't apply

# Config
snapfix config set ai claude
snapfix config set key sk-ant-xxx
snapfix config set auto true
snapfix config set max-loops 30

# Reports
snapfix report list            # List past sessions
snapfix report view <id>       # View a report
snapfix report share <id>      # Get shareable link (Pro)
```

---

## Tech Stack (MVP)

```
Runtime:     Node.js 20+ (compile to single binary with pkg or bun)
Terminal:    node-pty (full PTY emulation for interactive processes)
CLI:         Commander.js + Inquirer.js (prompts)
AI:          Direct HTTP to Claude/OpenAI/Ollama APIs (no SDK bloat)
Rendering:   chalk + ora (colors + spinners)
Config:      ~/.snapfix/config.json
Reports:     ~/.snapfix/reports/<session-id>.json
```

---

## File Structure

```
cli/
├── src/
│   ├── index.ts              # CLI entry, arg parsing, config loading
│   ├── runner.ts             # PTY wrapper - spawns command, streams output
│   ├── detector.ts           # Pattern matching for errors/success/prompts
│   ├── context.ts            # System context collector (OS, versions, deps)
│   ├── loop.ts               # Main orchestrator - the debug loop
│   ├── ai/
│   │   ├── adapter.ts        # Interface: sendDebugRequest(context) → Fix
│   │   ├── claude.ts         # Anthropic API direct HTTP
│   │   ├── openai.ts         # OpenAI API direct HTTP
│   │   ├── ollama.ts         # Ollama local API
│   │   └── prompts.ts        # System + user prompt templates
│   ├── report/
│   │   ├── generator.ts      # Build JSON report from session
│   │   ├── renderer.ts       # Render report as terminal-friendly output
│   │   └── share.ts          # Upload to cloud (Pro feature, stub for MVP)
│   ├── ui/
│   │   ├── display.ts        # Terminal UI - fix suggestions, approvals
│   │   ├── progress.ts       # Loop counter, time elapsed, status
│   │   └── summary.ts        # End-of-session summary
│   ├── config.ts             # Config read/write (~/.snapfix/config.json)
│   └── types.ts              # TypeScript interfaces
├── package.json
├── tsconfig.json
├── .npmignore
└── README.md
```

---

## Critical Implementation Details

### 1. PTY Runner (runner.ts)

```typescript
// Must use node-pty, NOT child_process.exec/spawn
// Real PTY gives us: colors, interactive prompts, correct exit codes
import { spawn as ptySpawn } from 'node-pty';

interface RunResult {
  exitCode: number;
  stdout: string;          // Full output
  stderr: string;          // Stderr lines
  lastLines: string[];     // Last 100 lines (for AI context)
  durationMs: number;
  timedOut: boolean;
}

// Key behaviors:
// - Stream output to user's terminal in real-time (they see everything)
// - Simultaneously buffer output for error detection
// - Handle interactive prompts (y/n, passwords) by passing through to user
// - Timeout after 5 minutes per run (configurable)
// - Capture exit code accurately
```

### 2. Error Detector (detector.ts)

```typescript
interface Detection {
  type: 'error' | 'success' | 'warning' | 'prompt' | 'progress';
  confidence: number;     // 0-1
  lines: string[];        // Relevant lines
  pattern: string;        // Which pattern matched
}

// Priority-ordered patterns (check exit code FIRST)
const DETECTION_RULES = [
  // Exit code is king
  { type: 'error', check: (r) => r.exitCode !== 0, confidence: 0.95 },
  { type: 'success', check: (r) => r.exitCode === 0, confidence: 0.90 },

  // Stderr patterns (when exit code is ambiguous)
  { type: 'error', pattern: /error|ERR!|FATAL|panic|Traceback/i },
  { type: 'error', pattern: /permission denied|EACCES|EPERM/i },
  { type: 'error', pattern: /not found|No such file|ENOENT/i },
  { type: 'error', pattern: /Module not found|ImportError|ModuleNotFoundError/i },
  { type: 'error', pattern: /segmentation fault|core dumped|SIGSEGV/i },
  { type: 'error', pattern: /out of memory|ENOMEM|heap/i },
  { type: 'error', pattern: /connection refused|ECONNREFUSED|timeout/i },

  // Success patterns (secondary to exit code)
  { type: 'success', pattern: /successfully|installed|complete|ready|done/i },
  { type: 'success', pattern: /added \d+ packages/i },
  { type: 'success', pattern: /Build successful|compiled/i },

  // Interactive prompts (pause loop, let user answer)
  { type: 'prompt', pattern: /\? |y\/n|Y\/N|Press (Enter|RETURN)|password:/i },
];
```

### 3. System Context (context.ts)

```typescript
interface SystemContext {
  os: { platform: string; version: string; arch: string };
  shell: string;
  runtimes: Record<string, string>;  // node: "22.1.0", python: "3.12", etc.
  packageManager: string;            // npm, yarn, pnpm, pip, brew, cargo
  projectFiles: string[];            // package.json, requirements.txt, etc.
  recentCommands: string[];          // Commands run in this debug session
  previousFixes: string[];           // Fixes already attempted (avoid loops)
  envVars: string[];                 // Names only, NOT values (security)
  diskSpace: string;
  memory: string;
}

// Collect runtimes by running: node -v, python3 -V, go version, etc.
// Read nearest package.json / requirements.txt / Cargo.toml for deps
// NEVER send env var VALUES to AI - only names (for security)
```

### 4. AI Prompt (prompts.ts)

This is the HIGHEST LEVERAGE part. The quality of fixes depends on this prompt.

```typescript
const SYSTEM_PROMPT = `You are SnapFix, an expert installation debugger.

You receive:
- The command that was run
- Its error output
- System context (OS, versions, installed tools)
- Previous fixes that were already attempted

Your job:
1. Diagnose the ROOT CAUSE of the error
2. Provide a SINGLE fix command that will resolve it
3. Explain briefly WHY it failed and WHY your fix works

Rules:
- Return ONE fix command. Not multiple alternatives.
- If the fix requires multiple steps, chain with &&
- Never suggest "reinstall everything" or destructive fixes
- Never suggest changes to unrelated files
- If a previous fix was already attempted, suggest something DIFFERENT
- If you're unsure, say so and suggest a diagnostic command instead
- Prefer the simplest fix that addresses the root cause
- For permission errors: suggest the specific permission fix, not sudo everything

Response format (STRICT JSON):
{
  "diagnosis": "Brief explanation of what went wrong",
  "fix_command": "the exact command to run",
  "fix_explanation": "Why this fix works",
  "confidence": 0.85,
  "risk": "low|medium|high",
  "alternative": "Optional second approach if first might not work"
}`;

const USER_PROMPT = (context) => `
Command: ${context.command}
Exit code: ${context.exitCode}
Working directory: ${context.cwd}

Last 50 lines of output:
\`\`\`
${context.lastLines.join('\n')}
\`\`\`

System:
- OS: ${context.os.platform} ${context.os.version} (${context.os.arch})
- Shell: ${context.shell}
- Runtimes: ${JSON.stringify(context.runtimes)}
- Package files: ${context.projectFiles.join(', ')}

${context.previousFixes.length > 0 ? `
Previously attempted fixes (DO NOT REPEAT):
${context.previousFixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}
` : ''}

Diagnose and provide a fix.`;
```

### 5. The Loop (loop.ts)

```typescript
async function debugLoop(command: string, options: Options): Promise<Session> {
  const session: Session = {
    id: uuid(),
    command,
    startedAt: new Date(),
    loops: [],
    status: 'running',
  };

  let loopCount = 0;
  let previousFixes: string[] = [];

  while (loopCount < options.maxLoops) {
    loopCount++;
    ui.showLoopHeader(loopCount, options.maxLoops);

    // 1. Run the command
    const result = await runner.run(command, options.timeout);

    // 2. Detect outcome
    const detection = detector.analyze(result);

    // 3. SUCCESS - we're done!
    if (detection.type === 'success') {
      session.status = 'success';
      ui.showSuccess(loopCount, session.startedAt);
      break;
    }

    // 4. ERROR - enter debug cycle
    if (detection.type === 'error') {
      ui.showError(detection);

      // 5. Collect context
      const ctx = await context.collect(command, result, previousFixes);

      // 6. Ask AI
      ui.showThinking();
      const fix = await ai.diagnose(ctx);
      ui.showFix(fix);

      // 7. Get user approval (or auto-apply)
      const approved = options.auto
        ? true
        : await ui.askApproval(fix);

      if (!approved) {
        const action = await ui.askAction(); // skip, edit, quit
        if (action === 'quit') break;
        if (action === 'edit') {
          // Let user type custom fix
          const customFix = await ui.getCustomFix();
          await runner.run(customFix);
          previousFixes.push(customFix);
        }
        continue;
      }

      // 8. Apply fix
      ui.showApplying(fix.fix_command);
      const fixResult = await runner.run(fix.fix_command);
      previousFixes.push(fix.fix_command);

      // Record this loop
      session.loops.push({
        index: loopCount,
        error: detection.lines,
        fix: fix,
        fixResult: fixResult.exitCode === 0 ? 'applied' : 'fix_failed',
      });

      // 9. Loop back - re-run original command
      continue;
    }
  }

  // Generate report
  session.endedAt = new Date();
  session.totalLoops = loopCount;
  if (options.report) {
    await report.generate(session);
  }

  return session;
}
```

### 6. Terminal UI (display.ts)

```
┌─ SnapFix ─────────────────────────────────────┐
│ Command: npm install                             │
│ Loop: 3/25 | Time: 2m 14s | Fixes applied: 2    │
├──────────────────────────────────────────────────┤
│                                                  │
│  npm output streams here in real-time...         │
│  npm ERR! gyp ERR! find Python                   │
│  npm ERR! node-pre-gyp WARN                      │
│                                                  │
├──────────────────────────────────────────────────┤
│ ERROR DETECTED (confidence: 92%)                 │
│                                                  │
│ Diagnosis: node-gyp requires Python but          │
│ python3 is not in PATH for native module build   │
│                                                  │
│ Suggested fix:                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ brew install python3 && npm config set       │ │
│ │ python /opt/homebrew/bin/python3             │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Risk: low | Confidence: 87%                      │
│                                                  │
│ [A]pply  [S]kip  [E]dit  [Q]uit                 │
└──────────────────────────────────────────────────┘
```

Use `chalk` for colors, `ora` for spinners, `boxen` for boxes.
Keep it clean. Developers hate cluttered output.

### 7. Report Generator (generator.ts)

Output format: JSON (machine) + Markdown (human)

The markdown report looks like:

```markdown
# SnapFix Report
**Command:** `npm install`
**Status:** Success after 4 loops
**Time:** 3m 42s
**Date:** 2026-02-11

## Loop 1
**Error:** `gyp ERR! find Python`
**Fix:** `brew install python3`
**Result:** Applied successfully

## Loop 2
**Error:** `EACCES permission denied /usr/local/lib`
**Fix:** `sudo chown -R $(whoami) /usr/local/lib`
**Result:** Applied successfully

## Loop 3
**Error:** `node-pre-gyp ERR! sharp requires libvips`
**Fix:** `brew install vips`
**Result:** Applied successfully

## Loop 4
**Status:** SUCCESS - `npm install` completed
**Packages:** added 847 packages in 24s

---
*Debugged with [SnapFix](https://snapfix.dev) - saved ~35 minutes*
```

---

## Config File (~/.snapfix/config.json)

```json
{
  "ai": {
    "provider": "claude",
    "model": "claude-sonnet-4-5-20250929",
    "apiKey": "sk-ant-xxx",
    "maxTokens": 1024,
    "temperature": 0.3
  },
  "loop": {
    "maxLoops": 25,
    "autoApply": false,
    "timeout": 300000
  },
  "report": {
    "enabled": true,
    "dir": "~/.snapfix/reports",
    "autoShare": false
  },
  "ui": {
    "verbose": false,
    "colors": true
  }
}
```

---

## Build Order (Sequential - Each Step Testable)

### Day 1: Core Loop
1. `index.ts` - CLI arg parsing with Commander
2. `runner.ts` - PTY wrapper that runs a command and captures output
3. `detector.ts` - Error/success detection from exit code + patterns
4. `types.ts` - All TypeScript interfaces

**Test:** `snapfix echo "hello"` should detect success.
**Test:** `snapfix false` should detect error.

### Day 2: AI Integration
5. `ai/adapter.ts` - Provider interface
6. `ai/claude.ts` - Claude API integration
7. `ai/openai.ts` - OpenAI API integration
8. `ai/ollama.ts` - Ollama local integration
9. `ai/prompts.ts` - System + user prompts
10. `config.ts` - Config read/write

**Test:** `snapfix npm install some-broken-package` should detect error, send to AI, show fix.

### Day 3: The Loop + UI
11. `loop.ts` - Full debug loop orchestrator
12. `ui/display.ts` - Fix display, approval prompts
13. `ui/progress.ts` - Loop counter, timer
14. `ui/summary.ts` - End summary

**Test:** Full loop - `snapfix npm install` with a real broken install should auto-fix.

### Day 4: Reports + Polish
15. `report/generator.ts` - JSON + Markdown reports
16. `report/renderer.ts` - Terminal-friendly report view
17. README.md with demo GIF
18. npm publish as `snapfix`
19. Record demo GIF for landing page

**Test:** Full session generates shareable report.

---

## npm Package Config

```json
{
  "name": "snapfix",
  "version": "1.0.0",
  "description": "Autopilot for installation debugging. Stop screenshotting errors.",
  "bin": {
    "snapfix": "./dist/index.js"
  },
  "keywords": [
    "debug", "install", "cli", "ai", "error",
    "fix", "terminal", "npm", "pip", "brew",
    "developer-tools", "automation"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=20"
  }
}
```

Install: `npm install -g snapfix`

---

## Success Criteria (MVP is Done When)

1. `snapfix npm install` on a project with native deps → auto-fixes through errors → succeeds
2. `snapfix pip install tensorflow` on fresh machine → handles missing deps → succeeds
3. `snapfix brew install ffmpeg` → handles permission issues → succeeds
4. Reports generate with full loop history
5. Works with Claude, OpenAI, and Ollama
6. `npm install -g snapfix` works globally
7. README has demo GIF that shows the "holy shit" moment
8. Total binary size < 50MB

---

## What NOT to Build (MVP Scope Control)

- NO web dashboard (just CLI reports)
- NO cloud upload (local reports only)
- NO GitHub Action (month 2)
- NO browser mode (terminal only)
- NO Setup Playbooks (month 3)
- NO team features (month 3)
- NO billing/payments (month 3)
- NO VS Code extension (month 4)
- NO Windows support (macOS + Linux first)

Keep it tight. Ship in 4 days. Iterate based on real usage.
