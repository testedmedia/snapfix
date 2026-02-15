# SnapFix — AI Agent Configuration

## Code Review Agents

### Jules (Gemini 2.5 Pro)
- Async PR review with adversarial self-critique
- Auto-triggered on PRs with `jules` label
- Config: `.github/workflows/jules-review.yml`

### Greptile
- Full-codebase-context PR review
- Auto-triggered on every PR
- Config: `.greptile.yml`

## Review Focus
- Security: input validation, auth checks
- Performance: image processing efficiency
- Correctness: error handling, edge cases
