<p align="center">
  <img src="brand/logo.svg" alt="SnapFix" width="120" />
</p>

<h1 align="center">SnapFix</h1>

<p align="center">
  <strong>Run command. Catch error. AI fixes it. Repeat until it works.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/snapfix"><img src="https://img.shields.io/npm/v/snapfix?color=E64516&label=npm" alt="npm version" /></a>
  <a href="https://github.com/testedmedia/snapfix/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node >= 20" />
  <img src="https://img.shields.io/badge/bundle-41KB-orange" alt="41KB bundle" />
  <a href="https://snapfix-deploy.vercel.app"><img src="https://img.shields.io/badge/website-snapfix.dev-E64516" alt="Website" /></a>
</p>

<p align="center">
  Stop screenshotting errors into ChatGPT. SnapFix automates the entire debug loop<br/>with 3 free AI engines and zero configuration.
</p>

---

## Install

```bash
npm install -g snapfix
```

No API keys needed. Ships with free local AI via Ollama out of the box.

## The Debug Loop, Automated

```bash
$ snapfix "npm install sharp"

  ► Running: npm install sharp
  ✖ ERROR DETECTED (native_build, 92% confidence)
  ⚙ AI diagnosing with ollama (llama3.2)...

  Fix 1/3: Install build dependencies
  ➜ xcode-select --install

  [A]pply  [S]kip  [E]dit  [Q]uit
  > a

  ✔ Applied. Re-running: npm install sharp
  ✔ SUCCESS — added 2 packages in 4.2s (2 loops, 1 fix applied)
```

## Features

| | |
|---|---|
| **Any command** | npm, pip, brew, docker, cargo, go, yarn, apt, make |
| **3 free AI engines** | Ollama (local), Groq (cloud), Gemini (cloud) |
| **50+ error patterns** | Crashes, permissions, missing modules, native builds, network, deps |
| **Auto-apply mode** | `--auto` skips confirmation, perfect for CI/CD |
| **Debug reports** | Full session history in JSON + Markdown |
| **Zero config** | Install and run. Auto-detects API keys from env vars |
| **41KB bundle** | Single file. No bloat. Ships fast |

## AI Providers

| Provider | Cost | API Key Required | Setup |
|----------|------|:---:|-------|
| **Ollama** | Free | No | `brew install ollama && ollama pull llama3.2` |
| **Groq** | Free | Yes | `export GROQ_API_KEY=...` |
| **Gemini** | Free | Yes | `export GEMINI_API_KEY=...` |
| **OpenAI** | ~$0.01/fix | Yes | `export OPENAI_API_KEY=...` |
| **Claude** | ~$0.01/fix | Yes | `export ANTHROPIC_API_KEY=...` |
| **OpenRouter** | Varies | Yes | `export OPENROUTER_API_KEY=...` |

SnapFix auto-detects keys from your environment. No config file needed.

## Usage

```bash
# Basic: wraps any failing command
snapfix "npm install"

# Auto-apply fixes without confirmation
snapfix "pip install tensorflow" --auto

# Use a specific AI provider
snapfix --ai groq "cargo build"
snapfix --ai gemini "brew install ffmpeg"

# Show full AI reasoning
snapfix "docker build ." --verbose

# Limit retry loops
snapfix "go build ./..." --max-loops 5

# Generate a debug report
snapfix "make build" --report

# Dry run: show fixes without applying
snapfix "yarn install" --dry-run
```

## Configuration

```bash
snapfix config set ai.provider gemini     # Set default provider
snapfix config set ai.apiKey YOUR_KEY     # Store API key (keys are masked in output)
snapfix config set loop.maxLoops 30       # Max retry iterations (default: 25)
snapfix config set loop.autoApply true    # Always auto-apply fixes
snapfix config show                       # View current config
```

Config is stored at `~/.snapfix/config.json`. Environment variables always take priority.

## Debug Reports

```bash
snapfix report list                # List all past sessions
snapfix report view abc123         # View a specific report
```

Reports capture every error, every AI diagnosis, every fix attempted, system context, and timing. Export as JSON for CI dashboards or Markdown for sharing with your team.

## Pricing

| | Free | Pro | Team |
|---|:---:|:---:|:---:|
| **Price** | $0 | $29 lifetime | $99 lifetime / 5 seats |
| **AI Engines** | Ollama, Groq, Gemini | + Claude, GPT-4o | + Claude, GPT-4o |
| **Debug Loops** | Unlimited | Unlimited | Unlimited |
| **Reports** | Local only | + Shareable links | + Shareable links |
| **Dashboard** | - | - | Team dashboard |
| **CI/CD Integration** | - | - | GitHub Actions, GitLab |
| **Slack Alerts** | - | - | On failure |
| **Source** | Open (MIT) | Open (MIT) | Open (MIT) |

The CLI is fully open source. Free tier is not a trial. Use it forever.

## How It Works

1. **Run** your command in a sandboxed child process
2. **Detect** errors using 50+ pattern matchers (exit codes, stderr, stack traces)
3. **Collect** full context: OS, architecture, runtime versions, dependency files, previous fix history
4. **Diagnose** via AI with a specialized prompt that prevents hallucinated fixes
5. **Apply** the fix (with your approval, or automatically with `--auto`)
6. **Re-run** the command and loop until success or max iterations

SnapFix never sends your environment variable values to AI providers. Only variable names are included for context.

## Contributing

```bash
git clone https://github.com/testedmedia/snapfix.git
cd snapfix/cli
npm install
npm run dev -- "echo hello"     # Run from source
npm run build                   # Build with tsup
```

PRs welcome. If you hit an error pattern that SnapFix doesn't catch, open an issue with the raw terminal output and we will add it.

## License

[MIT](LICENSE) -- use it however you want.

---

<p align="center">
  <a href="https://snapfix-deploy.vercel.app">Website</a> ·
  <a href="https://github.com/testedmedia/snapfix/issues">Issues</a> ·
  <a href="https://www.npmjs.com/package/snapfix">npm</a>
</p>
