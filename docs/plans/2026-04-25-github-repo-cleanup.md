# GitHub / Repo Cleanup Plan

**Status:** Planned
**Date:** 2026-04-25
**Owner:** Chaitanya

## Goal

Turn this repository from an active product workspace into a stronger public GitHub artifact that presents you as a disciplined engineer, not just someone who ships quickly.

The main outcome should be:

- A cleaner public repo structure
- Stronger engineering signals
- Better documentation for recruiters, collaborators, and future you
- Fewer obvious inconsistencies that make the project feel unfinished

## Why This Matters

Right now the repo shows real product depth:

- AI integration
- auth + payments
- PDF parsing + LaTeX export
- nontrivial user workflow

But it also signals avoidable mess:

- no usable lint setup
- no tests
- schema/runtime mismatches
- billing and credit-flow correctness risks
- noisy planning/assets mixed with product code
- very large orchestration components

A cleanup pass should preserve the speed/founder energy while removing the parts that read as sloppy.

## Success Criteria

This cleanup is successful if the repo can answer these questions well:

1. What does this project do?
2. Why is it technically interesting?
3. How do I run it locally?
4. What tradeoffs did the author make?
5. Does the codebase look maintained and intentional?

## Priority Order

### Phase 1: Fix credibility-damaging issues

These are the highest-value items because they directly affect trust.

- Fix export/template ID mismatch between runtime template IDs and DB schema
- Fix non-atomic credit deductions in analysis, rewrite, and export flows
- Fix PayPal capture idempotency and double-credit risk
- Make `npm run lint` work non-interactively
- Add at least a minimal test suite for critical flows

### Phase 2: Improve public repo presentation

- Add a strong `README.md`
- Document architecture and major user flows clearly
- Add screenshots intentionally instead of leaving many ad hoc image files at repo root
- Move or reduce noisy planning and scratch docs
- Clarify which docs are product plans vs implementation notes vs portfolio-facing docs

### Phase 3: Improve codebase readability

- Break up oversized route/page files
- Pull business logic out of UI-heavy components where possible
- Standardize naming for tools, exports, credits, and templates
- Remove dead code, stale comments, and misleading comments

## Cleanup Tasks

### 1. README overhaul

Create a `README.md` that includes:

- one-sentence pitch
- product demo screenshots or GIF
- core feature list
- architecture overview
- local setup instructions
- required env vars
- known tradeoffs / limitations
- what makes the project technically interesting

Recommended framing:

- "ResumeLab is an AI-assisted resume analysis and editing tool built with Next.js, Supabase, Anthropic, and a LaTeX export pipeline."

### 2. Repo structure cleanup

Audit top-level files and decide what belongs in the public repo root.

Candidates to move into `docs/`, `docs/assets/`, or remove:

- `landing-page-current.png`
- `landing-improved.png`
- `login-current.png`
- `login-improved.png`
- `signup-current.png`
- `PROCESS_DOCUMENTATION.md`
- `TODO_RESUME_TEMPLATES.md`

Rule:

- root should contain only files a new visitor expects to see immediately

### 3. Tooling hygiene

- Add a real ESLint config and make `npm run lint` deterministic
- Add `npm run typecheck`
- Add `npm run test` even if the first test set is small
- Consider `prettier` only if you will actually keep it enforced

Minimum bar:

- `build`, `lint`, `typecheck`, and `test` should all exist and run cleanly

### 4. Testing baseline

Add focused tests around high-risk logic, not broad shallow coverage.

Suggested first targets:

- resume text parsing
- template selection / export behavior
- credit deduction logic
- PayPal capture idempotency behavior
- analysis JSON parsing fallbacks

If test coverage stays small, that is acceptable. The key is showing judgment about what deserves tests.

### 5. Billing and data integrity cleanup

Refactor money/credit-sensitive flows so they look trustworthy in review.

Required fixes:

- replace read-then-write credit updates with real atomic DB operations or RPCs
- add idempotency guarantees for PayPal capture
- align `resume_exports.template_id` usage with actual DB schema
- stop using misleading comments like "atomic" where the implementation is not atomic

### 6. Public-facing documentation cleanup

Keep planning docs, but organize them.

Suggested structure:

- `docs/plans/` for future-oriented plans
- `docs/notes/` for implementation notes
- `docs/assets/` for screenshots used by README/docs

Avoid leaving "temporary but maybe useful" files in the root without explanation.

### 7. Architecture cleanup

Target the largest files first.

Current high-visibility candidate:

- `src/app/(dashboard)/resumelab/page.tsx`

Break out:

- state management hooks
- analysis loading logic
- export flow orchestration
- create-from-scratch form management

Goal:

- reduce the feeling that one page controls the entire product

### 8. Portfolio-signaling improvements

Make the repo show technical taste, not just feature count.

Add or improve:

- architecture diagram or short architecture section
- explicit tradeoffs section
- short explanation of parser challenges / export pipeline
- examples of tricky edge cases you handled

These help reviewers understand that the complexity is deliberate.

## What To Keep

Do not over-clean the repo into something generic. Keep the parts that show real engineering depth:

- PDF parsing and cleanup logic
- structured analysis flow
- LaTeX export pipeline
- Supabase auth/data integration
- actual end-to-end product thinking

The goal is not to look sterile. The goal is to look intentional.

## What To Remove Or De-Emphasize

- duplicate planning notes
- stale TODO files once the work is done
- misleading comments
- dead code for abandoned flows
- root-level visual artifacts without context
- incomplete infrastructure that appears "present" but does not actually work

## Recommended Execution Order

1. Add `README.md`
2. Fix lint so repo validation works
3. Fix export/template mismatch
4. Fix credit/payment correctness issues
5. Add a minimal test suite
6. Move noisy assets/docs out of root
7. Refactor the largest orchestrator files
8. Do one final pass on naming, comments, and dead code

## Definition Of Done

The repo is "GitHub-clean" when:

- a new visitor can understand it in under 2 minutes
- the root directory looks intentional
- validation commands actually run
- obvious correctness issues in money/credits are resolved
- the most complex parts are documented, not hidden
- the code feels curated rather than merely accumulated

## Nice-To-Have Follow-Up

After the cleanup, consider:

- a short demo video linked in the README
- pinned GitHub repo description refresh
- a release/tag for the cleaned portfolio version
- a small "Lessons learned" section if you want to lean into founder-engineer storytelling
