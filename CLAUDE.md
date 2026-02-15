# SnapFix

## Project
SnapFix -- autocorrect for your terminal. A multi-project workspace containing a CLI tool, serverless API, and static landing page. The CLI wraps any broken command, uses AI to diagnose errors, applies fixes automatically, and re-runs until it succeeds. Supports multiple AI providers (Ollama, Groq, Gemini, OpenAI, Claude).

## Current Version
`v1.0.0` (defined in `cli/package.json`)

## Stack

| Component | Technology |
|-----------|-----------|
| CLI Runtime | Node.js 20+ / TypeScript 5 |
| CLI Framework | Commander.js (args), Chalk (colors), strip-ansi |
| CLI Build | tsup (ESM, single-file output) |
| AI Providers | Ollama (free/local), Groq (free), Gemini (free), OpenAI, Claude, OpenRouter |
| API | Vercel Serverless Function (Node.js, `api/waitlist.js`) |
| Landing | Static HTML (no framework) |
| Database | Supabase (shared instance, `snapfix_waitlist` table) |
| Hosting | Vercel (landing + API) |
| Package Registry | npm (`snapfix`) |

## Architecture Overview

```
snapfix/
├── cli/                            # npm package: "snapfix"
│   ├── src/
│   │   ├── index.ts                # CLI entry point (Commander.js, arg parsing)
│   │   ├── loop.ts                 # Core debug loop: run -> detect -> AI fix -> re-run
│   │   ├── runner.ts               # Command execution via child_process spawn
│   │   ├── detector.ts             # Error pattern matching (exit codes, regex rules)
│   │   ├── context.ts              # System context collector (OS, runtimes, project files)
│   │   ├── config.ts               # Config file (~/.snapfix/config.json), API key resolution
│   │   ├── types.ts                # TypeScript interfaces (Session, AIFix, RunResult, etc.)
│   │   ├── file-editor.ts          # File edit application (search/replace from AI suggestions)
│   │   ├── fix-enhancer.ts         # Fix post-processing and enhancement
│   │   ├── ai/
│   │   │   ├── index.ts            # Provider factory (auto-detect from env vars)
│   │   │   ├── adapter.ts          # AIProvider interface definition
│   │   │   ├── prompts.ts          # System/user prompts for AI diagnosis
│   │   │   ├── claude.ts           # Anthropic Claude provider
│   │   │   ├── openai.ts           # OpenAI-compatible provider (also Groq, Gemini, OpenRouter)
│   │   │   └── ollama.ts           # Ollama local provider
│   │   ├── ui/
│   │   │   ├── display.ts          # Terminal output formatting (status, fixes, summaries)
│   │   │   └── prompt.ts           # Interactive prompts (approve/skip/edit/quit)
│   │   └── report/
│   │       └── generator.ts        # Debug session report generation and persistence
│   ├── dist/                       # Built output (single ESM file)
│   │   └── index.js                # Compiled CLI binary
│   ├── package.json                # npm package config (bin: snapfix)
│   └── tsconfig.json
├── api/
│   └── waitlist.js                 # Vercel serverless: POST waitlist signups to Supabase
├── landing/
│   ├── index.html                  # Main landing page (static HTML, SEO-optimized)
│   ├── confirmed.html              # Waitlist confirmation page
│   ├── referral.html               # Referral program page
│   └── errors/
│       ├── index.html              # Error directory index (50 common dev errors)
│       └── *.html                  # Individual error fix pages (SEO content)
├── brand/                          # Brand assets (logos, colors, etc.)
├── launch-content/                 # Launch marketing materials
├── vercel.json                     # URL rewrites: / -> landing, /fix/:slug -> error pages
├── scripts/
│   └── deploy.sh                   # Deploy script
├── BUILD_PROMPT.md                 # Original build specification
├── BUSINESS_PLAN.md                # Business plan and monetization strategy
├── LAUNCH.md                       # Launch plan
├── MONTH1_BLASTOFF.md              # Month 1 growth plan
├── LICENSE                         # MIT
└── README.md                       # npm package README
```

## Data Flow

### CLI Flow
User runs `snapfix "broken command"` -> spawns command via bash -> captures stdout/stderr -> detector pattern-matches for errors -> if error: collects system context (OS, runtimes, project files) -> sends to AI provider -> AI returns diagnosis + fix commands + file edits -> applies fix (auto or interactive) -> re-runs original command -> loops until success or max attempts (default 25).

### Landing/API Flow
User visits landing page -> enters email -> `POST /api/waitlist` -> validates email -> inserts into Supabase `snapfix_waitlist` table -> returns success/duplicate status.

## Production URLs

| URL | Purpose |
|-----|---------|
| `https://snapfix-deploy.vercel.app` | Landing page |
| `https://snapfix-deploy.vercel.app/api/waitlist` | Waitlist API |
| `https://snapfix-deploy.vercel.app/errors` | Error directory (SEO pages) |
| `https://snapfix-deploy.vercel.app/fix/:slug` | Individual error fix pages |
| `https://www.npmjs.com/package/snapfix` | npm package |
| `https://github.com/testedmedia/snapfix` | GitHub repository |
| Vercel project ID: `prj_ZAqjEKOx9IMnu0ImkPq9Gmaqyuyg` | Vercel identifier |

## Environment Variables

### API (Vercel)
```
SUPABASE_URL=<supabase-project-url>       # Defaults to shared Supabase instance
SUPABASE_KEY=<supabase-service-role-key>  # Required for waitlist inserts
```

### CLI (User's machine)
The CLI auto-detects API keys from environment variables (zero config):
```
# Free providers (auto-detected in priority order)
GROQ_API_KEY=<key>           # Free cloud AI (groq.com)
GEMINI_API_KEY=<key>         # Free cloud AI (aistudio.google.com)

# Paid providers (fallback)
OPENROUTER_API_KEY=<key>     # OpenRouter (multi-model)
OPENAI_API_KEY=<key>         # OpenAI
ANTHROPIC_API_KEY=<key>      # Claude

# No key needed for Ollama (default, local)
```

CLI config stored at `~/.snapfix/config.json`. Reports stored at `~/.snapfix/reports/`.

## Database

Shared Supabase instance (`https://wbfdnqgzopupxhntvpct.supabase.co`).

### Tables Used

| Table | Purpose |
|-------|---------|
| `snapfix_waitlist` | Email waitlist signups: email, source, referral_code |

## Deployment
Deploy protocol defined in `~/CLAUDE.md`. Use: `bash scripts/deploy.sh <version> <tag>`

## Test Commands
```bash
npm test                    # Run test suite (from root)
npm run test:smoke          # Post-deploy smoke tests
cd cli && npm run build     # Build CLI package
```
