# snapfix Launch Content

All ready to copy-paste. No editing needed.

---

## 1. Hacker News (Show HN)

**Title:**
```
Show HN: snapfix - autocorrect for your terminal (free, open source)
```

**Body:**
```
Hey HN,

I built snapfix because I was tired of the screenshot-paste-ChatGPT loop every time npm/pip/docker failed.

snapfix wraps any broken command, uses AI to diagnose the error, edits the actual files (not just suggests commands), and re-runs until it works.

How it works:
  $ snapfix "npm install"
  ✗ No matching version found for expresss@^4.0.0
  ▸ Typo in package.json: expresss → express
  ✎ package.json
  ✅ Fixed in 10s

Key decisions:
- Free by default. Uses Ollama (local, no API key needed)
- Also supports Groq and Gemini (both free cloud options)
- Auto-fix is the default. Use -i for interactive mode
- Edits files directly (package.json typos, wrong configs) instead of just suggesting commands
- 47KB bundle, 3 dependencies, MIT licensed

What it's NOT:
- Not a replacement for understanding your errors
- Not magic - the 3B local model handles ~80% of common errors. Smarter models (GPT-4o, Claude) handle more edge cases

GitHub: https://github.com/testedmedia/snapfix
Website: https://snapfix-deploy.vercel.app

Would love feedback on the approach. The main technical challenge was making file edits work reliably with small/dumb local models - ended up building a "smart enhancer" that auto-generates file edits from the AI's diagnosis even when the model can't output structured JSON.
```

---

## 2. Reddit r/programming

**Title:**
```
I built "autocorrect" for terminal errors - wraps any broken command, AI fixes it, re-runs until it works. Free & open source.
```

**Body:**
```
Tired of:
1. npm install fails
2. Copy error into ChatGPT
3. Read a wall of text
4. Manually try the fix
5. Repeat 5x

So I built snapfix:
1. snapfix "npm install"
2. It fixes itself

It uses AI to diagnose errors, edits files directly (typos in package.json, wrong configs), runs fix commands, and loops until success.

Free by default - uses Ollama (local AI, no API key). Also works with Groq and Gemini (both free). Or bring your own OpenAI/Claude key.

Works with npm, pip, brew, docker, cargo, go, yarn, apt, and any other CLI.

GitHub: https://github.com/testedmedia/snapfix
MIT licensed, 47KB, 3 dependencies.
```

---

## 3. Reddit r/commandline

**Title:**
```
snapfix: like thefuck but with AI - autocorrects terminal errors by editing files and running fixes automatically
```

**Body:**
```
If you've used thefuck, you know the concept. snapfix takes it further:

- Uses AI instead of regex rules (catches errors thefuck can't)
- Edits FILES directly (fixes typos in package.json, configs, etc.)
- Loops until the command actually succeeds
- Works offline with Ollama (free, local, no API key)

Quick demo:
  $ snapfix "npm install"
  ✗ expresss@^4.0.0 not found
  ▸ Typo: expresss → express
  ✎ package.json fixed
  ✅ Done in 10s

npm install -g snapfix

GitHub: https://github.com/testedmedia/snapfix
```

---

## 4. Twitter/X Launch Thread

**Tweet 1 (hook):**
```
I built autocorrect for the terminal.

Paste a broken command → AI fixes it → re-runs until it works.

Free. Open source. Works offline.

snapfix: https://github.com/testedmedia/snapfix
```

**Tweet 2 (demo):**
```
Here's what it looks like:

$ snapfix "npm install"

  ✗ expresss@^4.0.0 not found
  ▸ Typo in package.json: expresss → express
  ✎ package.json
  ✓ Fix applied
  ✅ Fixed in 10s

No more screenshotting errors into ChatGPT.
```

**Tweet 3 (why it's different):**
```
What makes it different from thefuck:

• AI-powered (not just regex)
• Edits files directly (package.json, configs)
• Loops until the command succeeds
• 3 free AI options (local + cloud)
• 47KB, 3 deps, MIT

npm install -g snapfix
```

**Tweet 4 (ask):**
```
If this is useful, star the repo and share with a dev friend who wastes time on error messages.

https://github.com/testedmedia/snapfix

Built this in a weekend. Launching on HN tomorrow.
```

---

## 5. Dev.to Post

**Title:**
```
I built autocorrect for the terminal - here's how it works under the hood
```

**Body:**
```markdown
# I built autocorrect for the terminal

Every developer knows this loop:

1. Run a command
2. It fails
3. Copy the error
4. Paste into ChatGPT
5. Read a wall of text
6. Try the fix manually
7. It fails again
8. Repeat

I built [snapfix](https://github.com/testedmedia/snapfix) to automate this entirely.

## What it does

Wrap any broken command with `snapfix`:

\`\`\`bash
snapfix "npm install"
\`\`\`

It runs the command, catches the error, sends it to AI with full context (OS, runtimes, project files), gets a fix, applies it automatically, and re-runs until it works.

## The key insight

Most CLI debugging tools suggest commands. But many errors are caused by **wrong file contents** - a typo in package.json, a bad import path, a wrong config value.

snapfix edits files directly. When it detects "expresss" should be "express" in your package.json, it fixes the file AND runs npm install. Then re-runs your original command to verify.

## Architecture

1. **Runner** - Executes commands in a sandboxed child process, captures stdout/stderr
2. **Detector** - 50+ regex patterns for error classification (permission, not found, build, network, etc.)
3. **Context collector** - Gathers OS, runtimes, project files, env var names (never values)
4. **AI adapter** - Supports 6 providers (Ollama, Groq, Gemini, OpenAI, Claude, OpenRouter)
5. **Smart enhancer** - Auto-generates file edits from AI diagnosis, even when the AI model is too small to output structured JSON
6. **File editor** - Safe search-and-replace with JSON-aware merging for package.json

## Free by default

The default AI is Ollama (llama3.2:3b) - runs locally, costs $0, no API key needed. For better results, use Groq (free cloud, llama-3.3-70b) or bring your own OpenAI/Claude key.

## Try it

\`\`\`bash
npm install -g snapfix
snapfix "npm install"
\`\`\`

[GitHub](https://github.com/testedmedia/snapfix) | [Website](https://snapfix-deploy.vercel.app) | MIT Licensed
```

---

## 6. npm Publish Command (run after npm login)

```bash
cd /Users/jarvis/debugloop/cli && npm publish
```

That's it. One command after login.

---

## Launch Timeline

| When | What | Who |
|------|------|-----|
| Now | npm login + npm publish | You (2 min) |
| After publish | Post HN "Show HN" | You (copy-paste from above) |
| Same day | Tweet thread | You (copy-paste from above) |
| Same day | Reddit posts | You (copy-paste from above) |
| Day 2 | Dev.to article | You (copy-paste from above) |
| Day 2 | Monitor HN comments, respond to all | You |
| Week 2 | Share milestones (100 stars, etc.) | You |
