# Anti-Patterns

Lessons learned from real multi-agent projects. Each anti-pattern was encountered at least once and caused real problems.

## Git & Branching

| Don't | Do Instead | Why |
|-------|------------|-----|
| Rebase feature branches | Regular merge | Rebase rewrites history and loses commits. When multiple chats contribute to a branch, rebase causes cascading regressions. |
| Squash merge PRs | Regular merge | Squash hides individual commits, making it impossible to revert a single fix. |
| Use worktrees on shared branches | Separate clones | Worktrees share the git index. Parallel teams stepping on each other's staging area causes confusion. |
| Push directly to main | Feature branch → PR → merge | Direct pushes bypass review and can't be reverted cleanly. |
| Force push (`--force`) | Fix forward or revert | Force push destroys remote history that other teams may have pulled. |

## Team Roles

| Don't | Do Instead | Why |
|-------|------------|-----|
| CEO writes code | CEO only plans, merges, files issues | When the coordinator starts coding, they lose track of the big picture. Fixes in the CEO chat often conflict with dev team work. |
| One agent does everything | Separate agents for dev, QA, coordination | Context isolation prevents cross-contamination. QA shouldn't have edit tools. |
| Skip the brainstorm | Run brainstorm → plan → execute | Jumping straight to code produces generic results. Brainstorms surface edge cases early. |
| Vague brainstorm prompts ("you are the team") | Name each agent with distinct perspective | Named agents with defined tendencies produce real debate. Generic prompts produce bland consensus. |
| Dispatch without skills | Read agent `.md` and load their ⭐ skills | An agent dispatched without its skill pack will hallucinate code and ignore project constraints. |

## Sprint Management

| Don't | Do Instead | Why |
|-------|------------|-----|
| Batch "fix everything" commits | One commit per fix with issue reference | Batch commits make it impossible to track what was fixed. If one fix causes a regression, you can't revert just that fix. |
| Keep bugs only in chat | File GitHub Issues | Chat context dies when the conversation ends. Issues persist across all chats and teams. |
| Skip handoff docs (done.md) | Mandatory done.md + PROJECT_BRIEF update | Without handoff docs, the next chat starts blind. It may overwrite work or duplicate effort. |
| Skip progress tracker | Update progress.md after each phase | Without a progress tracker, context overflow recovery is impossible. The new chat doesn't know where the old one left off. |
| Skip mandatory sign-offs | Create QA/SEO/Security docs before done.md | Skipping sign-offs means unverified code ships to production. The system MUST stop at hard gates. |
| Rush the AI with time pressure | "Take your time, do it right" | Time pressure makes the LLM skip edge cases, write less tests, and produce lower quality code. "No rush" produces better results. |

## Documentation & Tracking

| Don't | Do Instead | Why |
|-------|------------|-----|
| Skip `deferred.md` | Create `deferred.md` at sprint start, update after every cut | Deferred items vanish between sprints. The next sprint starts without knowing what was cut. Context is lost forever. |
| Skip `done.md` | ALWAYS write `done.md` at sprint end | Without `done.md`, the next session doesn't know what was built, what's working, and what was deferred. |
| Generate `done.md` without audit docs | Create QA/Security/SEO docs FIRST, then `done.md` | `done.md` without verification docs means unverified code ships. The hard-gate exists for a reason. |
| Forget to update `progress.md` | Update `progress.md` after EVERY task with timestamp | Without progress tracking, context recovery is impossible. The new chat doesn't know where the old one left off. |
| Only write tests at Phase 4 | Write tests alongside every task during Phase 3 | Tests written after the fact miss edge cases the developer was thinking about. Test-alongside catches bugs at the source. |
| Only do security audit at Phase 4 | Run incremental security scans every 3 tasks | Security issues found late require expensive rework. Incremental scans catch issues early when they're cheap to fix. |
| Only do QA at Phase 4 | Run incremental QA reviews every 3 tasks | QA at the end finds architectural issues that are expensive to fix. Incremental reviews catch them early. |
| Ship code without test files | Every code file MUST have a corresponding test file | Code without tests is untested code. Period. If it's not tested, it's not done. |
| Track deferred items only in `done.md` | Use separate `deferred.md` per sprint AND cumulative `docs/deferred/backlog.md` | Deferred items in `done.md` are hard to find. Separate tracking makes backlog review easy during sprint planning. |
| Skip SEO audit for "internal" pages | Document as N/A with explicit reason | Skipping without documenting why creates ambiguity. Always create the audit file, even if it says N/A. |

## Testing & QA

| Don't | Do Instead | Why |
|-------|------------|-----|
| Merge before testing | Playtest → file issues → fix → merge | Merging untested code creates a broken main branch. QA can't test against a moving target. |
| QA modifies source code | QA only files issues, dev team fixes | QA fixes often miss context and introduce new bugs. Separation of concerns. |
| Close issues without verification | Dev fixes → QA verifies → close | Self-closing issues skips verification. The fix might not actually work. |

## Context & Communication

| Don't | Do Instead | Why |
|-------|------------|-----|
| Assume chats share memory | Files are the shared memory | Each chat is a fresh context. PROJECT_BRIEF.md and progress.md are the only things that survive. |
| Keep decisions in conversation | Write decisions to files | Decisions made in chat are lost when the chat closes. Write to docs/ or GitHub Issues. |
| Relay raw error logs between teams | Summarize and file as GitHub Issue | Raw logs waste context tokens. Summarize: component, steps, expected, actual. |
