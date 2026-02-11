# Reddit r/programming Post

## Title
I automated the screenshot-paste-to-AI debug loop with a CLI wrapper

## Body

Every developer has done this: run a command → error → screenshot → paste to ChatGPT/Claude → get a fix → apply it → run again → new error → repeat 20-40 times.

I got tired of it and built a CLI tool that automates the entire cycle.

**The Architecture:**

The tool (`snapfix`) wraps any CLI command in a PTY (using `node-pty`, not `child_process.exec` - you need a real PTY for accurate exit codes and interactive prompt handling).

It streams output in real-time while simultaneously buffering for error detection. Detection happens via:

1. **Exit code analysis** (primary signal - if `exitCode !== 0`, likely an error)
2. **Stderr pattern matching** (regex for common error signatures: `ERR!`, `Traceback`, `panic`, `EACCES`, etc.)
3. **Stack trace detection** (multi-line patterns for Python, Node, Rust, Go stack traces)

When an error is detected, it captures:
- Last 50-100 lines of terminal output
- System context: OS, arch, shell, runtime versions (Node, Python, Ruby, Go)
- Project context: nearest package.json, requirements.txt, Cargo.toml
- Session history: previous commands run, fixes already attempted (critical for avoiding loops)

This context gets sent to an AI (Claude, GPT, or local Ollama) with a structured system prompt:

```
You are SnapFix, an expert installation debugger.
You receive: command, error output, system context, previous fixes.
Your job: Diagnose root cause, provide ONE fix command, explain why.
Rules: Never suggest destructive fixes, avoid repeating previous attempts, prefer simplest solution.
Response format: JSON with diagnosis, fix_command, explanation, confidence, risk level.
```

The AI returns a structured fix. The tool displays it to the user (with approval prompt), applies it if approved, re-runs the original command, and loops until exit code 0 or max loops hit (default 25).

At the end, it generates a markdown report showing the entire debug journey: every loop, every error, every fix, time elapsed.

**Why this is technically interesting:**

1. **PTY vs spawn** - Most CLI wrappers use `child_process.spawn` which doesn't handle interactive prompts (like npm's "overwrite? y/n"). PTY emulation is required.

2. **Error detection without false positives** - Lots of tools spam warnings to stderr. Exit codes are the ground truth, patterns are secondary (we check exit code first, then patterns for context).

3. **Context minimization** - Can't send 10,000 lines of output to AI. We send last 50 lines + system summary + dependency manifest. The prompt engineering here is critical.

4. **Loop prevention** - If the AI suggests the same fix twice, we're in a loop. Track all attempted fixes and include them in context with explicit "DO NOT REPEAT" instruction.

5. **Structured output parsing** - AI responses are structured JSON. If parsing fails, fallback to regex extraction of commands from freeform text.

**Open source (MIT):** github.com/testedmedia/snapfix

**Install:** `npm install -g snapfix`

**Usage:** `snapfix [any command]`

Free tier uses Ollama (local LLM, $0 cost). Pro tier adds Claude/GPT integration with your own keys.

Not trying to shill a product here - genuinely interested in feedback on the architecture. Is there a better way to handle error detection? Better prompt patterns? Edge cases I'm missing?

Also curious if this belongs in the "AI tools that are actually useful" category or "AI wrapper slop" - I built it because I had the problem myself, but I know HN can be skeptical of AI tooling.
