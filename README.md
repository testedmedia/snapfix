# SnapFix

**Autopilot for installation debugging. Stop screenshotting errors.**

You know the loop: run a command, it fails, screenshot the error, paste into ChatGPT, read the fix, apply it, run again, new error, screenshot again... 20-40 times per failed install.

**SnapFix automates the entire loop.**

```bash
snapfix npm install
```

It runs your command, detects errors, sends full context to AI, gets a fix, applies it (with your approval), and loops until success.

## Install

```bash
npm install -g snapfix
```

## Quick Start

```bash
# Set your AI provider (pick one)
snapfix config set ai.provider claude
snapfix config set ai.apiKey sk-ant-your-key-here

# Or use OpenAI
snapfix config set ai.provider openai
snapfix config set ai.apiKey sk-your-key-here

# Or use Ollama (free, local, no API key needed)
snapfix config set ai.provider ollama

# Debug any command
snapfix npm install
snapfix pip install tensorflow
snapfix brew install ffmpeg
snapfix docker compose up
snapfix cargo build
```

## How It Works

```
┌─────────────────────────────────────┐
│ 1. Run your command                 │
│ 2. Detect errors automatically      │
│ 3. Send context to AI               │
│    (OS, versions, deps, history)    │
│ 4. Get fix suggestion               │
│ 5. [A]pply / [S]kip / [E]dit       │
│ 6. Re-run command                   │
│ 7. Loop until success               │
└─────────────────────────────────────┘
```

## Options

```bash
snapfix --auto          # Auto-apply fixes (skip confirmation)
snapfix --max-loops 10  # Limit iterations (default: 25)
snapfix --ai ollama     # Use local LLM (free)
snapfix --model gpt-4o  # Specific model
snapfix --report        # Generate debug report
snapfix --dry-run       # Show fixes without applying
snapfix --verbose       # Full AI reasoning
```

## Configuration

```bash
snapfix config set ai.provider claude    # claude | openai | ollama
snapfix config set ai.apiKey YOUR_KEY    # API key
snapfix config set ai.model MODEL_NAME   # Model override
snapfix config set loop.maxLoops 30      # Max iterations
snapfix config set loop.autoApply true   # Auto-apply fixes
snapfix config show                      # View config (keys masked)
```

Config stored at `~/.snapfix/config.json`

## Debug Reports

Every session generates a report:

```bash
snapfix report list        # List past sessions
snapfix report view abc123 # View a specific report
```

Reports include: every error, every fix attempted, system context, timing.

## AI Providers

| Provider | Cost | Setup |
|----------|------|-------|
| **Ollama** | Free | `brew install ollama && ollama pull llama3.2` |
| **Claude** | ~$0.01/fix | Get key at console.anthropic.com |
| **OpenAI** | ~$0.01/fix | Get key at platform.openai.com |

## What It Sends to AI

Full context for accurate fixes:
- Command + error output (last 50 lines)
- OS, architecture, shell
- Installed runtime versions (node, python, go, etc.)
- Package manager + dependency files
- Previous fixes attempted (avoids loops)
- **Never sends env var values** (only names)

## Examples

```bash
# Fix npm native module build failures
snapfix npm install sharp

# Fix Python dependency hell
snapfix pip install tensorflow

# Fix Docker build issues
snapfix docker build .

# Fix Homebrew permission errors
snapfix brew install ffmpeg

# Auto-mode for CI/CD
snapfix --auto --max-loops 10 npm ci
```

## License

MIT

## Links

- Website: [snapfix.dev](https://snapfix.dev)
- Issues: [GitHub Issues](https://github.com/snapfix-dev/snapfix/issues)
