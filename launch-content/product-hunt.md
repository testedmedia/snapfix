# Product Hunt Launch

## Tagline
Autopilot for installation debugging - stop screenshotting errors

## Description

SnapFix automates the screenshot-paste-fix loop that every developer does 20-40 times per failed installation.

Instead of manually screenshotting terminal errors, pasting to ChatGPT/Claude, reading the fix, applying it, and repeating until it works... you just run:

```
snapfix npm install
```

And it handles the entire debug cycle automatically.

**How it works:** SnapFix wraps your command in a PTY, detects errors in real-time, auto-captures system context (OS, versions, package files), sends it to AI with full context, shows you the suggested fix, you approve (or it auto-applies), and it re-runs until success. At the end, you get a full debug report showing every loop, every error, every fix attempted.

Works with any CLI command: npm, pip, brew, docker, cargo, go, and more. Open source (MIT license), works with local LLMs (Ollama) for $0 cost, or bring your own Claude/GPT API keys for Pro features.

## Key Features

• **Universal command wrapper** - Works with npm, pip, brew, docker, cargo, and any CLI tool
• **Intelligent error detection** - Exit codes + pattern matching + stack trace analysis
• **Full system context** - Auto-captures OS, versions, dependencies, previous fixes
• **AI-powered fixes** - Claude, GPT, or local Ollama integration with structured prompts
• **Debug reports** - Shareable markdown reports showing the entire debug journey + time saved

## First Comment (Maker Comment)

Hey Product Hunt!

I'm the maker of SnapFix. I built this out of pure frustration.

Last month I spent 90 minutes trying to install a single npm package on a fresh M4 Mac. The native module build kept failing. I took 40+ screenshots, pasted them into Claude one by one, got fixes, applied them, hit new errors, repeated. By the end I had lost track of what I'd already tried.

I thought: "Why am I manually doing this? The AI can see my error. Why can't it just... keep fixing things until it works?"

So I built SnapFix.

It's a CLI wrapper that automates the entire screenshot-paste-fix cycle. You run `snapfix [your command]` and it handles the rest. Detects errors, captures system context, sends to AI, shows you the fix, you approve, it applies, re-runs, repeats until success.

The free version uses Ollama (local, $0 cost). Pro tier lets you bring your own Claude/GPT keys for better fixes + unlimited loops.

**What I'd love feedback on:**
- The AI prompting (it's the highest leverage part - how can I make fixes more accurate?)
- Error detection patterns (any edge cases I'm missing?)
- UX flow (is the approval step annoying or necessary?)

Open source (MIT): https://github.com/snapfix/cli

Try it: `npm install -g snapfix`

Happy to answer any questions!
