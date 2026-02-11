# Hacker News Post

## Title
Show HN: SnapFix - Autopilot for the screenshot-paste-fix loop

## Body

I built a CLI tool that automates the debug cycle we all do 20-40 times per failed installation.

You know the routine: run `npm install` → error → screenshot → paste to ChatGPT → read the fix → apply it → run again → new error → repeat until it works (or you give up at 2am).

**SnapFix wraps any command and handles the entire loop automatically:**

```bash
snapfix npm install
snapfix pip install tensorflow
snapfix brew install ffmpeg
```

It detects errors in real-time (exit codes, stderr patterns, stack traces), auto-captures system context (OS, versions, package files, previous fixes), sends it to an AI (Claude/GPT/Ollama), shows you the suggested fix, you approve or auto-apply, and it re-runs until success.

**Technical details:**

- Built with Node.js, uses `node-pty` for full terminal emulation (not `child_process.exec` - we need real PTY for interactive prompts and accurate exit codes)
- Error detection via pattern matching + exit code analysis (no false positives from warning spam)
- Context collector grabs Node/Python/Ruby/Go versions, reads nearest package.json/requirements.txt, tracks previous fixes to avoid loops
- AI prompt includes last 50 lines of output + full system context + attempted fixes
- Generates markdown reports of the entire debug session with time-saved metrics

**Open source (MIT), works with local LLMs (Ollama) so you can run it for free.** No signup required to try it.

The paid Pro tier ($15/mo) adds unlimited loops, Claude/GPT integration with your own keys, and shareable debug reports.

I built this because I was spending 30-90 minutes per failed install manually screenshotting and pasting. Now it's one command.

Repo: https://github.com/testedmedia/snapfix
Try it: `npm install -g snapfix`

Would love feedback from the HN crowd - especially on the AI prompt engineering (that's the highest leverage part) and error detection patterns.
