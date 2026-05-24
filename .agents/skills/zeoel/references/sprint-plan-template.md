# Sprint Plan Template

## Plan File

Save as `docs/sprint-N/plan.md`:

```markdown
# Sprint N — [Name]

> Sprint Goal: [one sentence describing the deliverable]
> Branch: feature/sprint-N
> Estimated effort: [time estimate]

## Prioritized Task List

| # | Task   | Assigned Agent                | Skills to Load (⭐) | Required Tests | Est | Description              |
|---|--------|-------------------------------|----------------------|----------------|-----|--------------------------| 
| 1 | [task] | Gohar (CEO)                   | `zeoel` | — | 1h  | [what to coordinate]     |
| 2 | [task] | Mahdi (Product Designer)      | `frontend-design`, `seo` | — | 2h  | [what to design]         |
| 3 | [task] | Mustafa (Art/Visual Director) | `ui-ux-pro-max`, `gsap-scrolltrigger` | — | 1h  | [what to style]          |
| 4 | [task] | Karar (Frontend Engineer)     | `nextjs-turbopack`, `frontend-design` | Component test, route integration test | 1h  | [what to build on UI]    |
| 5 | [task] | Tariq (Backend Engineer)      | `laravel-patterns`, `api-design` | Feature test, security assertions | 2h  | [what to build on API]   |
| 6 | [task] | Muhammad (QA Engineer)        | `e2e-testing` | E2E spec file | 1h  | [what to test]           |
| 7 | [task] | Ali (DevOps Engineer)         | `deployment-patterns` | Pipeline validation, security tests | 1h  | [what to deploy]         |

> **Required Tests column is MANDATORY.** Every code-producing task must specify what tests are expected. Design/coordination tasks can use "—".

## Work Schedule

### Phase 1: [Name] (tasks 1-3)
- Build [component]
- Checkpoint commit after phase

### Phase 2: [Name] (tasks 4-6)
- Build [component]
- Checkpoint commit after phase

### Phase 3: Polish & Integration
- Integration testing
- Bug fixes
- Final commit

## Success Criteria

- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]
- [ ] All task-level tests pass
- [ ] All E2E tests pass
- [ ] No console errors
- [ ] Security tests pass (auth, validation, tenant isolation)

## What's NOT in This Sprint

| Feature | Reason | Priority | Target Sprint |
|---------|--------|----------|---------------|
| [cut feature] | [why — scope, complexity, not needed yet] | P1/P2/P3 | Sprint N+1 |

> These items MUST be copied to `docs/sprint-N/deferred.md` and `docs/deferred/backlog.md` at sprint start.

## Execution Dispatch Prompt

> Use `zeoel-dispatch` to execute this sprint.
>
> 1. For each task, load the assigned agent's context from `.agents/skills/zeoel/agents/[name].md`.
> 2. Complete the task AND its required tests using their bound skills.
> 3. Run the Post-Task Checkpoint (Step 7) — update `progress.md`, verify tests, log deferred items.
> 4. Every 3 tasks, run the Incremental Audit Check (Step 8).
> 5. Commit changes: `git commit -m "feat: [task description]"`
> 6. Move to the next task on the list.
```

## Progress Tracker

Create `docs/sprint-N/progress.md` at sprint start:

```markdown
# Sprint N — Progress Tracker

> If context overflows, start a new chat:
> "Read PROJECT_BRIEF.md and docs/sprint-N/progress.md.
>  Continue from where it left off."

## Task Status

| # | Task    | Status         | Tests Created | Notes        | Updated At |
|---|---------|----------------|---------------|--------------|------------|
| 1 | [task]  | ⬜ Not started |               |              |            |
| 2 | [task]  | 🔨 In progress |               |              |            |
| 3 | [task]  | ✅ Done        | `[test file]` | [notes]      | [time]     |
| 4 | [task]  | ❌ Blocked     |               | [reason]     | [time]     |
| 5 | [task]  | ⏭️ Deferred    |               | See deferred.md | [time]  |

## Audit Checkpoints

> Incremental audits are run every 3 completed tasks. Record results here.

### Audit Checkpoint (after Task #3)
- QA: [PASS/issues]
- Security: [PASS/issues]
- SEO: [PASS/N/A]

### Audit Checkpoint (after Task #6)
- QA: [PASS/issues]
- Security: [PASS/issues]
- SEO: [PASS/N/A]

## Bugs Found

| # | Description | Severity | Status | Fix | Found At |
|---|-------------|----------|--------|-----|----------|
| 1 | [bug] | blocker/major/minor | open/fixed | [commit or PR] | [task #] |

## Notes

[Free-form notes about decisions, issues, or context for recovery]
```

## Deferred Items Tracker

Create `docs/sprint-N/deferred.md` at sprint start:

```markdown
# Sprint N — Deferred Items

> Items cut, simplified, or deferred during this sprint. Reviewed at the start of Sprint N+1.

## Deferred Items

| # | Item | Original Task | Reason | Priority | Target Sprint | Status |
|---|------|--------------|--------|----------|---------------|--------|
|   |      |              |        |          |               |        |

> If nothing was deferred, write: "No items were deferred during this sprint."

## Simplifications Made

| # | What Was Simplified | Original Scope | Simplified To | Task # | Reason |
|---|-------------------|---------------|--------------|--------|--------|
|   |                   |               |              |        |        |

> Track features that were built but at reduced scope compared to the original plan.
```

## Cumulative Deferred Backlog

Create `docs/deferred/backlog.md` once (cumulative across sprints):

```markdown
# Deferred Items — Cumulative Backlog

> Master list of all deferred items across all sprints. Updated after every sprint.
> Review this at the start of each sprint during Phase 2 planning.

## Active Backlog

| # | Item | Source Sprint | Reason | Priority | Target Sprint | Status |
|---|------|--------------|--------|----------|---------------|--------|
|   |      |              |        |          |               |        |

## Resolved Items

| # | Item | Source Sprint | Resolved In | How |
|---|------|--------------|-------------|-----|
|   |      |              |             |     |
```

## Test Coverage Tracker

Create `docs/tests/sprint-N-coverage.md` at Phase 4:

```markdown
# Sprint N — Test Coverage

Date: [date]
Compiled by: Muhammad (QA)

## Test Summary

| Category | Files Created | Tests Written | Tests Passing | Tests Failing |
|----------|-------------|---------------|---------------|---------------|
| Component tests (`.test.tsx`) | X | X | X | 0 |
| Route integration tests | X | X | X | 0 |
| Feature tests (PHPUnit) | X | X | X | 0 |
| Security tests | X | X | X | 0 |
| E2E tests (Playwright) | X | X | X | 0 |
| **Total** | **X** | **X** | **X** | **0** |

## Test Files by Task

| Task # | Task | Test File(s) | Status |
|--------|------|-------------|--------|
| 1 | [task] | `tests/[file].test.tsx` | ✅ Pass |
| 2 | [task] | `tests/Feature/[file]Test.php` | ✅ Pass |

## Untested Code (Exceptions)

| File | Reason Not Tested | Risk Level |
|------|-------------------|------------|
|      |                   |            |

> If this table has entries, they MUST be justified. "No time" is NOT a valid reason.

## Coverage Notes

[Any notes about test quality, coverage gaps, or recommendations for next sprint]
```

## Done File

Write `docs/sprint-N/done.md` at sprint end:

```markdown
# Sprint N — Done

## What Was Built
- [Feature 1]
- [Feature 2]

## Tests Delivered
- Component tests: [count]
- Feature tests: [count]
- Security tests: [count]
- E2E tests: [count]
- Total: [count] tests, all passing

## What's NOT Done (Deferred)
- [Deferred item — why] → Tracked in `docs/sprint-N/deferred.md`

## Files Changed/Created
- `src/components/NewComponent.tsx` — [purpose]
- `src/components/__tests__/NewComponent.test.tsx` — [component test]
- `api/src/functions/newEndpoint.ts` — [purpose]
- `tests/Feature/NewEndpointTest.php` — [feature test]

## Verification Status
- QA Sign-off: ✅ `docs/qa/sprint-N-signoff.md`
- Security Audit: ✅ `docs/security/sprint-N-audit.md`
- SEO Audit: ✅ `docs/seo/sprint-N-audit.md` (or N/A — [reason])
- Test Coverage: ✅ `docs/tests/sprint-N-coverage.md`
- Deferred Items: ✅ `docs/sprint-N/deferred.md`

## Manual Setup Required
- [Any env vars, config, or manual steps needed]

## Known Issues
- [Issue — tracked as GitHub Issue #NN]
```

## QA Sign-off Template

```markdown
# QA Sprint N Sign-Off

Date: [date]
Tester: Muhammad (QA)

## Incremental Audit History

> These are the mini-audits conducted every 3 tasks during Phase 3.

### Audit 1 (after Task #3) — [date]
- [findings]

### Audit 2 (after Task #6) — [date]
- [findings]

## Final QA Results

- Task-level tests verified: X/X tasks have tests
- E2E tests run: X
- E2E tests passed: X
- E2E tests failed: 0

## Test Coverage Verification

- [ ] Every component has a corresponding `.test.tsx`
- [ ] Every API endpoint has a Feature Test
- [ ] Every auth endpoint has security test assertions
- [ ] All tests pass in CI

## Blockers
NONE

## Issues Filed
- #NN — [description] (severity: minor)

## Result
✅ PASS — No blockers. Sprint N is ready to merge.
```

## Security Audit Template

```markdown
# Security Audit — Sprint N

Date: [date]
Auditor: Ali (DevOps)

## Incremental Audit History

> These are the mini security scans conducted every 3 tasks during Phase 3.

### Scan 1 (after Task #3) — [date]
- [findings]

### Scan 2 (after Task #6) — [date]
- [findings]

## OWASP ASI Compliance

| Risk | Status | Notes |
|------|--------|-------|
| ASI-01: Excessive Agency | ✅/❌ | [notes] |
| ASI-02: Data Poisoning | ✅/❌ | [notes] |
| ASI-03: Supply Chain | ✅/❌ | [notes] |
| ASI-04: Prompt Injection | ✅/❌ | [notes] |
| ASI-05: Insufficient Output Validation | ✅/❌ | [notes] |

## Security Tests Summary

| Category | Tests Written | Tests Passing |
|----------|-------------|---------------|
| Auth bypass tests | X | X |
| Input validation tests | X | X |
| Tenant isolation tests | X | X |
| RBAC/permission tests | X | X |
| **Total** | **X** | **X** |

## OWASP Top 10 Web Checks

| Risk | Status | Notes |
|------|--------|-------|
| A01: Broken Access Control | ✅/❌ | [notes] |
| A02: Cryptographic Failures | ✅/❌ | [notes] |
| A03: Injection | ✅/❌ | [notes] |
| A07: Auth Failures | ✅/❌ | [notes] |

## Hardcoded Secrets Scan
- [ ] No API keys in source
- [ ] No passwords in code
- [ ] `.env` is in `.gitignore`
- [ ] No secrets in Docker images

## Findings

| # | Finding | Severity | Status | Remediation |
|---|---------|----------|--------|-------------|
|   |         |          |        |             |

## Result
✅ PASS — No critical or high-severity issues. Sprint N is secure.
```

## SEO Audit Template

```markdown
# SEO Audit — Sprint N

Date: [date]
Auditor: Zara (SEO)

## Incremental Audit History

> These are the mini SEO checks conducted every 3 tasks during Phase 3.

### Check 1 (after Task #3) — [date]
- [findings]

### Check 2 (after Task #6) — [date]
- [findings]

## Page-Level SEO Checklist

| Page | URL | Title Tag | Meta Desc | H1 | JSON-LD | OG Tags | Status |
|------|-----|-----------|-----------|-----|---------|---------|--------|
| [page] | [url] | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |

## Technical SEO

- [ ] `sitemap.xml` includes all indexable pages
- [ ] `robots.txt` blocks admin/dashboard routes
- [ ] Canonical URLs set on all pages
- [ ] No orphan pages
- [ ] Core Web Vitals pass (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] JSON-LD validates in Google Rich Results Test
- [ ] Open Graph tags render correctly

## Heading Hierarchy

| Page | H1 | H2s | Issues |
|------|----|-----|--------|
| [page] | [h1 text] | [count] | [any issues] |

## Findings

| # | Finding | Severity | Status | Fix |
|---|---------|----------|--------|-----|
|   |         |          |        |     |

## Result
✅ PASS — All public pages meet SEO requirements.
```
