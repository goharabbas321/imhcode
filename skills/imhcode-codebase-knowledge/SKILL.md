---
name: imhcode-codebase-knowledge
description: 'Use this skill to map, document, or onboard into an existing codebase. Generates STACK.md, STRUCTURE.md, ARCHITECTURE.md, CONVENTIONS.md, INTEGRATIONS.md, TESTING.md, and CONCERNS.md in docs/codebase/.'
---

# Acquire Codebase Knowledge

Produces seven populated documents in `docs/codebase/` covering everything needed to work effectively on the project. Only document what is verifiable from files or terminal output — never infer or assume.

## Output Contract (Required)

Before finishing, all of the following must be true:

1. Exactly these files exist in `docs/codebase/`: `STACK.md`, `STRUCTURE.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md`, `CONCERNS.md`.
2. Every claim is traceable to source files, config, or terminal output.
3. Unknowns are marked as `[TODO]`; intent-dependent decisions are marked `[ASK USER]`.
4. Every document includes a short "evidence" list with concrete file paths.

## Workflow

```
- [ ] Phase 1: Run scan, read intent documents
- [ ] Phase 2: Investigate each documentation area
- [ ] Phase 3: Populate all seven docs in docs/codebase/
- [ ] Phase 4: Validate docs, present findings, resolve all [ASK USER] items
```

### Phase 1: Scan and Read Intent

1. Run the scan script from the target project root:
   ```bash
   python3 "$SKILL_ROOT/scripts/scan.py" --output docs/codebase/.codebase-scan.txt
   ```
   Where `$SKILL_ROOT` is the absolute path to the skill folder.

2. Search for PRD, TRD, README, ROADMAP, SPEC, DESIGN files and read them.
3. Summarize project intent.
