# Reddit r/webdev Post

## Title
npm install hell is officially over

## Body

You know that feeling when `npm install` fails and you spend the next hour screenshotting errors and pasting them into ChatGPT?

I automated that entire loop.

**Introducing SnapFix** - a CLI wrapper that autopilots the debug cycle:

```bash
snapfix npm install
```

What happens:
1. Runs npm install in a real terminal (PTY)
2. Detects the error (exit code + stderr patterns)
3. Auto-captures your system context (Node version, OS, package.json)
4. Sends to AI (Claude/GPT/Ollama) with full context
5. Shows you the fix: "Install python3 for node-gyp"
6. You hit [Apply]
7. Re-runs npm install
8. Loops until it works

**Real example from this morning:**

Fresh M4 Mac, tried to `npm install` a project with Sharp (image processing).

Errors:
- node-gyp missing Python ✅ auto-fixed with `brew install python3`
- Missing libvips ✅ auto-fixed with `brew install vips`
- Permission issues ✅ auto-fixed with proper chown
- Wrong Python path in npm config ✅ auto-fixed

4 loops, 3 minutes, zero screenshots. It just worked.

**Features:**
- Works with npm, yarn, pnpm, bun
- Also works with pip, brew, docker, cargo (any CLI tool)
- Free tier uses local LLMs (Ollama - zero cost)
- Pro tier ($15/mo) adds Claude/GPT + unlimited loops
- Generates shareable debug reports
- Open source (MIT)

**Install:**
```bash
npm install -g snapfix
snapfix npm install  # try it on your cursed project
```

Repo: https://github.com/testedmedia/snapfix

No more:
- "It works on my machine" (debug report shows exactly what was fixed)
- Losing track of what you've already tried
- Re-explaining your setup to ChatGPT 40 times
- Rage-quitting at 2am when the install fails for the 50th time

If you've ever wanted to throw your laptop out a window during `npm install`, this is for you.
