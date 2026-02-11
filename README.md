<h1 align="center">snapfix</h1>

<p align="center">
  <strong>Autocorrect for your terminal.</strong><br/>
  Paste a broken command. Get it fixed. That's it.
</p>

<p align="center">
  <a href="https://github.com/testedmedia/snapfix/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node >= 20" />
  <img src="https://img.shields.io/badge/cost-free-34D399" alt="Free" />
</p>

---

```
$ snapfix "npm install"

  snapfix · npm install

  Running...
  ✗ No matching version found for expresss@^4.0.0
  ▸ Typo in package.json: expresss should be express
    edit package.json: "expresss" → "express"
    run  npm install
  ✓ Fix applied

  ✅ Fixed in 10s (2 attempts)
```

## Install

```bash
npm install -g snapfix
```

No API keys needed. Uses free local AI (Ollama) by default.

## Usage

```bash
snapfix "npm install"              # fix a broken install
snapfix "pip install tensorflow"   # works with any package manager
snapfix "cargo build"              # any CLI command
snapfix -i "docker build ."       # ask before each fix
snapfix --ai groq "go build"      # use free cloud AI
```

Auto-fixes by default. Use `-i` if you want to approve each fix.

## How it works

1. Runs your command
2. AI diagnoses the error
3. Edits files + runs fix commands automatically
4. Re-runs until it works

## AI Providers (all free options available)

| Provider | Cost | Setup |
|----------|------|-------|
| **Ollama** (default) | Free | `brew install ollama && ollama pull llama3.2` |
| **Groq** | Free | `export GROQ_API_KEY=...` ([get key](https://console.groq.com)) |
| **Gemini** | Free | `export GEMINI_API_KEY=...` ([get key](https://aistudio.google.com)) |
| OpenAI | ~$0.001/fix | `export OPENAI_API_KEY=...` |
| Claude | ~$0.01/fix | `export ANTHROPIC_API_KEY=...` |

Auto-detects keys from your environment. Zero config.

## Works with

npm · pip · brew · docker · cargo · go · yarn · apt · pnpm · gem · any CLI

## License

[MIT](LICENSE)

---

<p align="center">
  <a href="https://snapfix-deploy.vercel.app">Website</a> ·
  <a href="https://github.com/testedmedia/snapfix/issues">Issues</a>
</p>
