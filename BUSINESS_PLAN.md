# SnapFix - Business Plan & Product Spec
## "Autopilot for Installation Debugging"

---

## THE PROBLEM (Why This Prints Money)

Every developer has lived this hell:

1. Run `npm install` or `brew install` or `pip install` → ERROR
2. Screenshot the error
3. Paste into ChatGPT/Claude
4. Read the fix
5. Apply the fix
6. Run again → NEW ERROR
7. Screenshot again
8. Paste again
9. Repeat 20-40 times until it works

**This loop takes 30-90 minutes per failed installation.**
**It happens to every developer, every week.**
**Nobody has automated it.**

---

## THE PRODUCT

**SnapFix** wraps any CLI command and autopilots the debug cycle:

```bash
snapfix npm install
snapfix brew install ffmpeg
snapfix docker compose up
snapfix pip install tensorflow
```

What happens:
1. Runs the command in a PTY wrapper
2. Detects errors in real-time (exit codes, stderr patterns, stack traces)
3. Auto-captures terminal state + system context (OS, versions, env)
4. Sends to AI (Claude/GPT/local LLM) with full context
5. Gets fix suggestion
6. Shows fix to user → user approves or auto-applies
7. Re-runs the command
8. Loops until success or user stops
9. Generates a shareable "debug report" of the entire journey

**The 20-40 screenshot loop → ONE command.**

---

## PRODUCT TIERS

### Free (Open Source CLI)
- 5 debug loops/day
- Local LLM support (Ollama)
- Manual fix application (shows fix, you paste it)
- Basic terminal capture
- "Powered by SnapFix" watermark on reports

### Pro ($15/month)
- Unlimited loops
- Claude/GPT integration (bring your own key)
- Auto-apply fixes (with confirmation prompt)
- Full debug reports (shareable links)
- No watermark
- Priority error pattern database

### Team ($39/month per seat)
- Everything in Pro
- Shared debug reports dashboard
- "Setup Playbooks" - record successful installs, replay for new team members
- Onboarding analytics (time-to-first-commit metrics)
- CI/CD integration (GitHub Actions, GitLab CI)
- Slack/Teams notifications

### Enterprise ($199/month per seat)
- Everything in Team
- Self-hosted AI (no data leaves your network)
- Custom error pattern training
- SLA + priority support
- SOC2 compliance mode
- SSO/SAML

---

## REVENUE PROJECTIONS

| Month | Free Users | Pro | Team Seats | Enterprise | MRR |
|-------|-----------|-----|------------|------------|-----|
| 1-2   | 500       | 10  | 0          | 0          | $150 |
| 3     | 2,000     | 50  | 10         | 0          | $1,140 |
| 6     | 10,000    | 200 | 50         | 5          | $5,945 |
| 9     | 25,000    | 500 | 150        | 15         | $16,335 |
| 12    | 50,000    | 1,000| 300       | 30         | $32,670 |
| 18    | 100,000   | 2,500| 800       | 80         | $84,470 |

**Year 1 target: $30K MRR = $360K ARR**
**Year 2 target: $100K+ MRR = $1.2M ARR**

Conservative vs. Warp ($36M ARR). We're targeting 1% of their market initially.

---

## COMPETITIVE LANDSCAPE

| Tool | What It Does | AI? | Revenue | Gap |
|------|-------------|-----|---------|-----|
| Asciinema (16.8K stars) | Records terminal | No | $0 | No AI, no fixing |
| Terminalizer (16.1K stars) | GIF recording | No | $0 | Abandoned, no AI |
| VHS by Charm (18.6K stars) | Scripted recordings | No | $0 | Not real-time |
| Warp ($73M raised) | AI terminal | Yes | $36M ARR | Terminal replacement, not debugger |
| ChatGPT/Claude | Manual paste | Yes | N/A | Manual, no automation |

**SnapFix = ONLY tool that automates the screenshot-paste-fix loop.**

50K+ GitHub stars across recording tools, ZERO revenue.
Warp proved developers pay for AI-in-terminal.
We're in the gap between passive recording and full terminal replacement.

---

## VIRAL GROWTH ENGINE

### Loop 1: Shareable Debug Reports
Every debug session generates a visual report:
- Terminal screenshots at each step
- AI suggestions shown inline
- Before/after comparisons
- Time saved counter ("SnapFix saved 47 minutes")
- Shareable link + "Debugged with SnapFix" badge

Developers post these to: GitHub Issues, Stack Overflow, Twitter, team Slack.
Each share = organic discovery.

### Loop 2: GitHub Action Integration
```yaml
# .github/workflows/snapfix.yml
- name: Debug Failed Build
  uses: snapfix/action@v1
  if: failure()
  with:
    api_key: ${{ secrets.SNAPFIX_KEY }}
```
Failed CI → auto-generates debug report → posts to PR comment.
Every PR comment = team-wide exposure.

### Loop 3: "Setup Playbook" Sharing
Teams record successful installs as playbooks:
```bash
snapfix record --playbook "project-setup"
# Do your install steps...
snapfix stop
snapfix publish my-project-setup
```
New developer joins → runs playbook → guided install with auto-fixes.
Published playbooks on snapfix.dev = SEO + community content.

### Loop 4: Error Pattern Database (Network Effect)
Every (anonymized) debug session trains the pattern database:
- "Error X on macOS 15 + Node 22 = fix Y works 94% of the time"
- More users = better suggestions = more users
- Moat through data, not code

### Loop 5: Referral Mechanics
- Free users: invite 3 friends = 1 month Pro free
- Pro users: invite 5 = permanent 20% discount
- Waitlist position: share link = move up queue

---

## GO-TO-MARKET STRATEGY

### Phase 1: Pre-Launch (Week 1-2)
- [ ] Build MVP (CLI wrapper + AI loop + basic report)
- [ ] Landing page at snapfix.dev
- [ ] Demo GIF showing 20-step install debugged in 1 command
- [ ] Waitlist with referral ladder
- [ ] Record 3 real debug sessions as social proof

### Phase 2: Launch Week (Week 3)
- [ ] Monday: Tweet thread "I automated the screenshot-paste-to-Claude loop"
- [ ] Tuesday: Show HN post (try-it-now, no signup)
- [ ] Wednesday: Product Hunt launch
- [ ] Thursday: Dev.to + Hashnode articles
- [ ] Friday: Reddit r/programming + r/webdev + r/node
- [ ] All week: Engage every comment, RT every user showcase

### Phase 3: Growth (Month 1-3)
- [ ] YouTube tutorials: "Debug any install in 60 seconds"
- [ ] Integration posts: "SnapFix + Docker", "SnapFix + Python"
- [ ] GitHub Action launch (free for open source repos)
- [ ] Conference lightning talks (remote)
- [ ] Partner with DevRel teams at Vercel, Railway, Supabase

### Phase 4: Monetization (Month 3-6)
- [ ] Launch Pro tier
- [ ] Launch Team tier
- [ ] Enterprise outreach (companies with 50+ devs)
- [ ] Setup Playbooks marketplace
- [ ] Pattern database as competitive moat

### Phase 5: Scale (Month 6-12)
- [ ] VS Code extension
- [ ] JetBrains plugin
- [ ] Slack/Discord bot integration
- [ ] API for third-party integrations
- [ ] Seed funding if traction warrants ($2-5M at $20-40M valuation)

---

## TECH STACK

```
CLI Tool (Open Source)
├── Node.js / Bun (single binary distribution)
├── node-pty (terminal emulation)
├── ansi-to-image (terminal frame capture)
├── chokidar (filesystem watching)
├── Commander.js (CLI framework)
└── AI Adapters
    ├── Anthropic Claude API
    ├── OpenAI API
    ├── Ollama (local, free tier)
    └── OpenRouter (fallback)

Cloud Platform (Paid Tiers)
├── Next.js 15 + React 19 (dashboard)
├── Supabase (auth, DB, storage)
├── Vercel (hosting + serverless)
├── Upstash Redis (rate limiting)
├── S3/R2 (report storage)
└── Stripe (billing)

GitHub Action
├── Docker container
├── CLI binary bundled
└── PR comment integration via GitHub API
```

---

## FILE STRUCTURE

```
snapfix/
├── cli/                        # Open source CLI
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── runner.ts           # PTY command wrapper
│   │   ├── detector.ts         # Error/success pattern detection
│   │   ├── capture.ts          # Terminal frame capture
│   │   ├── context.ts          # System context collector
│   │   ├── ai/
│   │   │   ├── adapter.ts      # AI provider interface
│   │   │   ├── claude.ts       # Claude API
│   │   │   ├── openai.ts       # OpenAI API
│   │   │   ├── ollama.ts       # Local LLM
│   │   │   └── prompts.ts      # System prompts for debugging
│   │   ├── loop.ts             # Main debug loop orchestrator
│   │   ├── report.ts           # Report generator
│   │   ├── playbook.ts         # Record/replay install steps
│   │   └── config.ts           # User config + API keys
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── web/                        # Paid dashboard
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # User dashboard
│   │   ├── report/[id]/        # Shareable report viewer
│   │   └── api/                # Serverless functions
│   └── package.json
├── action/                     # GitHub Action
│   ├── action.yml
│   ├── Dockerfile
│   └── entrypoint.sh
└── landing/                    # Marketing site
    └── (separate repo)
```

---

## THE PROMPT (What You Give a Dev to Build the MVP)

See: BUILD_PROMPT.md

---

## WHAT ELSE WE DO (Full Checklist)

### Immediate (This Week)
- [ ] Register snapfix.dev domain
- [ ] Create GitHub org: github.com/snapfix
- [ ] Build MVP CLI (3-4 days)
- [ ] Record demo GIF (the "holy shit" moment)
- [ ] Landing page with waitlist
- [ ] Twitter/X account @snapfix

### Week 2
- [ ] Beta test with 10 real developers
- [ ] Iterate on AI prompts (biggest leverage point)
- [ ] Error pattern library (top 50 common install errors)
- [ ] Polish CLI UX (spinners, colors, progress indicators)

### Week 3 (Launch)
- [ ] Show HN + Product Hunt + Twitter thread
- [ ] Engage every single comment for 48 hours
- [ ] Track: stars, installs, waitlist signups, shares

### Month 2
- [ ] Pro tier with Stripe billing
- [ ] Shareable report links (cloud storage)
- [ ] VS Code extension (marketplace listing)
- [ ] GitHub Action (free for OSS)

### Month 3
- [ ] Team tier
- [ ] Setup Playbooks feature
- [ ] Dashboard with analytics
- [ ] First enterprise outreach

### Month 6
- [ ] Pattern database with network effects
- [ ] Enterprise tier
- [ ] Evaluate funding (if >$10K MRR)
- [ ] Expand: Windows/Linux support

---

## KEY METRICS TO TRACK

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|-------------------|
| GitHub Stars | 500 | 5,000 |
| npm installs/week | 200 | 5,000 |
| Free users | 500 | 10,000 |
| Pro subscribers | 10 | 200 |
| MRR | $150 | $5,945 |
| Debug sessions/day | 50 | 5,000 |
| Avg session length | 8 loops | 12 loops |
| Share rate | 5% | 15% |
| Free→Pro conversion | 2% | 5% |

---

## WHY THIS WINS

1. **Universal pain**: Every developer, every language, every OS
2. **Obvious value**: "47 minutes saved" is undeniable
3. **Network effects**: More users = better fix suggestions
4. **Open source core**: Trust + community + contributions
5. **Low CAC**: Viral reports + GitHub Action = organic growth
6. **High retention**: Once you stop manually screenshotting, you never go back
7. **Clear monetization**: Free CLI → Pro → Team → Enterprise ladder
8. **Timing**: AI tools are normalized, developers expect AI assistance
9. **Moat**: Error pattern database grows with usage (data flywheel)
10. **Exit potential**: Acquisition target for Warp, Vercel, GitHub, JetBrains
