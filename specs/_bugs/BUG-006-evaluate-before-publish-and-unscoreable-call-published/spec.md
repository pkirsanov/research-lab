# Spec: BUG-006 Evaluate-Before-Publish Ordering, And An Unscoreable Call Published (D16)

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Purpose

State the **expected behavior** the brief pipeline and its idempotence assertion
should jointly satisfy, so the two defects recorded in [bug.md](bug.md) can be
judged against a written contract rather than against intuition.

This spec describes **what correct looks like**. It selects no remedy. Candidate
remedies and their defect mapping live in
[design.md](design.md#candidate-remedies-and-which-defect-each-addresses); the
choice is an owner decision.

## Scope Of This Artifact

**Documentation-only. DO NOT FIX from this packet.** It changes no script, no
gate, no ledger, and no other spec. The operator's standing constraint applies:
a scheduled pipeline actively writes this surface and the recommendation ledger
is append-only, so racing it risks corrupting the published track record.

## Problem Statement

Two independent conditions each hold today, and together they make
`node scripts/selftest.mjs` fail on `origin/main`.

**Condition A — ordering.** In
[`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh)
the sequence is:

```
:239  evaluate-recommendations.mjs      ← the ONLY evaluator invocation
  …
:407  brief-distributed-publish.mjs     ← appends new `proposed` rows to the ledger
  …
:560  git commit                        ← no selftest anywhere in this file
:566  git push
```

Any closure the publish makes due is therefore deferred to the **next** cycle's
line-239 evaluate. The committed ledger is one evaluation behind for the whole
interval between two runs.

**Condition B — an unscoreable call was published.** A `horizon: tactical` call
with `evaluability: not-evaluable` and
`evaluabilityReason: no-attributable-invalidation-level` entered the ledger at
commit `7ad10b31`. **D16** forbids exactly this.

An unscoreable call is closable **on sight** — `judge()` needs no elapsed
horizon and no price move to resolve it. So condition B produces precisely the
kind of pending closure that condition A guarantees will not be applied before
the commit.

## Requirements

### FR-006-001 — The canonical project check MUST be green on `origin/main`

`node scripts/selftest.mjs` MUST exit `0` at every commit reachable from
`origin/main`.

**Acceptance:** the command exits `0` on a clean checkout of `origin/main`.

**Currently violated.** See [bug.md](bug.md#r1--the-canonical-project-check-fails).

### FR-006-002 — A published invariant MUST be holdable by the pipeline that publishes

If the pipeline asserts *"a re-run closes nothing twice"* against the **committed**
ledger, then the pipeline MUST NOT commit a ledger with an un-applied closure
pending — or the assertion MUST be restated to something the pipeline's own
ordering can hold.

**Acceptance:** either (a) at every commit the publisher produces,
`planEvaluation(ROOT, {}).rows.length === 0`, or (b) the assertion's contract is
rewritten to describe the ordering that actually exists, with the reason
recorded.

**Currently violated by** Defect A.

### FR-006-003 — D16 MUST be enforced at the publish gate, not only requested of the author

No `swing` or `tactical` call whose body resolves to `evaluability:
not-evaluable` may be published. Per
[`docs/Improvement-Plan.md:444-446`](../../../docs/Improvement-Plan.md):
*"The proposal path **refuses** to emit `evaluability: not-evaluable` for `swing`
and `tactical` horizons — if no level can be attributed, no call is published."*

**Acceptance:** the publish path mechanically refuses such a call. A natural-
language instruction to an authoring model does not satisfy this requirement,
because a model instruction is not a gate.

**Currently violated by** Defect B. Today the only D16 surface is the prompt
string at
[`brief-narrative-parallel.mjs:232`](../../../scripts/brief-narrative-parallel.mjs);
the actual publish gate at
[`validate-brief-payload.mjs:72`](../../../scripts/validate-brief-payload.mjs)
checks only that `invalidation` is **non-empty text**.

### FR-006-004 — A D16-equivalent rule MUST be stated in terms the evaluator uses

The authoring rule MUST be expressed against **attributed** levels
(`levels[].source === 'invalidation'` after direction-aware classification), not
against the presence of a numeral in the invalidation prose. Those two are not
the same, and the difference is what let this call through.

**Acceptance:** the rule's wording, and any gate implementing it, reference the
attributed-invalidation-level count that
[`recommendation-body.mjs:255-262`](../../../scripts/recommendation-body.mjs)
actually decides on.

**Currently violated.** The prompt rule demands *"a numeric price level on a
named instrument … in its invalidation field"*. The published call satisfied
that literal wording and was still unscoreable. See
[bug.md](bug.md#c5--no-attributable-invalidation-level-does-not-mean-carries-no-level).

### FR-006-005 — The publishing path MUST run the same gate the scheduled path runs

[`.github/workflows/tier-a.yml:131`](../../../.github/workflows/tier-a.yml) runs
`node scripts/selftest.mjs` before committing.
[`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh)
does not run it at all. Two commit paths into the same branch MUST NOT hold
different gate standards.

**Acceptance:** both paths run the same blocking pre-commit check, or the
divergence is documented with its rationale.

**Currently violated by** contributing factor A2.

> **This requirement is stated, not prescribed as the remedy.** Adding
> `selftest` to the publisher without also resolving Defect A would convert a
> red `main` into a **failed publish** — the brief would not ship. That trade is
> an owner decision, recorded in
> [design.md](design.md#candidate-remedies-and-which-defect-each-addresses).

### FR-006-006 — The recommendation ledger MUST remain append-only

Any remedy MUST preserve append-only semantics. Historical verdicts are never
rewritten; the plan states this explicitly at
[`docs/Improvement-Plan.md:694-696`](../../../docs/Improvement-Plan.md).
Retro-scoring already-closed calls to improve `notEvaluableShare` is forbidden.

**Acceptance:** no remedy rewrites, deletes, or reorders an existing ledger row.

## Non-Functional Requirements

### NFR-006-001 — Evidence reproducibility

Every claim in this packet MUST be re-runnable from the commands recorded in
[bug.md](bug.md#reproduction-steps) and [report.md](report.md#test-evidence),
against a checkout, without privileged access and without network access to a
data provider.

### NFR-006-002 — Non-destructive documentation

Documenting this finding MUST NOT modify `scripts/**`, `tests/**`,
`specs/004-*`, `rlbrief.js`, `rlexperience.js`, `rlfx.js`, `rljourney.js`, any
ledger partition or index, or any brief artifact.

### NFR-006-003 — Truthful status

This packet's `state.json` MUST carry a non-terminal status, MUST assert no
certification, and MUST carry no checked DoD box while the remedy decision is
unmade.

## Acceptance Criteria

| ID | Criterion | Status |
|---|---|---|
| AC-006-001 | `node scripts/selftest.mjs` fails with exactly the named assertion, exit 1 | Verified — [report.md](report.md#e1--the-canonical-project-check-fails) |
| AC-006-002 | `planEvaluation(ROOT, {})` returns exactly 1 row, `not-evaluable` / `no-attributable-invalidation-level` | Verified — [report.md](report.md#e2--planevaluation-returns-one-row) |
| AC-006-003 | The publisher evaluates at `:239` and publishes at `:407`, with exactly one evaluator invocation | Verified — [report.md](report.md#e3--pipeline-ordering-in-the-publisher) |
| AC-006-004 | The subject row entered the ledger at commit `7ad10b31`, and no later commit has touched that partition | Verified — [report.md](report.md#e4--ledger-attribution) |
| AC-006-005 | The same trigger/invalidation text is `not-evaluable` under `hedge` and `machine-checkable` under `add` | Verified — [report.md](report.md#e5--root-cause-the-same-text-under-two-action-families) |
| AC-006-006 | The publish gate checks `invalidation` presence only; D16 exists solely as a prompt string | Verified — [report.md](report.md#e6--d16-is-a-prompt-string-not-a-gate) |
| AC-006-007 | `brief-refresh-and-push.sh` never runs `selftest`; `tier-a.yml:131` does | Verified — [report.md](report.md#e7--only-one-of-the-two-commit-paths-runs-selftest) |
| AC-006-008 | 36 calls are open; all but the subject call are `machine-checkable`, so recent publishes did not turn the assertion red | Verified — [report.md](report.md#e8--open-calls-and-close-lag-the-c1-correction) |
| AC-006-009 | A remedy is selected and its loop-safety assessed | **NOT MET** — no remedy selected; see [scopes.md](scopes.md) Scope 1 |
| AC-006-010 | `notEvaluableShare` reaches ≤ 0.25 | **NOT MET** — committed 30d window reads 0.8197; Step 6 is undelivered (spec 015 `blocked`) |
