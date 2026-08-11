# Spec: BUG-007 — Expected Behavior Of The Committed Attention Tier

## 1. Purpose

State what the committed brief artifacts must be true of, so that "fixed" is a measurable
condition rather than a green suite that happens to hold today.

## 2. Expected Behavior

### EB-1 — The committed tier is a certified contract, not prose

`market-brief.payload.json → attention[]` carries `decision-attention/v1` envelopes. Every
item declares `contractVersion === "decision-attention/v1"` and a `decisionWindow` drawn
from `rlattention.js → DECISION_WINDOWS` (`pre-market`, `morning`, `pre-close`,
`after-hours`). The legacy catalyst keys may remain alongside the envelope — the composer
merges over them and neither half overwrites the other — but they never stand alone.

### EB-2 — Every published item survives the certified selector

`RLATTN.selectAttentionItems(committedTier)` publishes every committed item under the
default card ceiling, with `capApplied === false` and an empty suppressed set. A committed
tier that publishes zero items is a failure regardless of how many items it contains.

### EB-3 — The ceiling overflows, it does not reject

Calling the selector with an explicit ceiling below the tier size publishes exactly the
ceiling count, sets `capApplied === true`, and moves the ranked tail into `suppressed[]`
rather than discarding it. Published concatenated with suppressed reproduces the canonical
rank order exactly.

### EB-4 — Refusals are recorded, never silent

A candidate the composer will not build is recorded in `attentionExclusions[]` with its
index, subject, closed `RLATTN-*` code and offending field. A run that publishes zero items
with zero recorded exclusions is a failure, not an empty day.

### EB-5 — The projection is byte-current with its source

`market-brief.page.json` equals `buildBriefPageArtifacts(ROOT)` byte for byte, including
its `attention` key, which `scripts/build-brief-page-artifacts.mjs:38` projects directly
from `payload.attention`.

### EB-6 — The payload gate is clean

`validateBriefPayload(payload, registry, config, snapshot)` returns zero errors against the
committed artifacts, so no `RLATTN-*` violation reaches a committed revision.

### EB-7 — The property survives regeneration

The scheduled authoring lane regenerates `market-brief.payload.json` roughly four times
daily. EB-1 through EB-6 must hold on every regenerated payload, not only on a payload that
was repaired once by hand. The lane authors judgement; a script, not a model, composes the
envelope.

### EB-8 — A legacy-shape payload fails by name

If a payload is ever authored or regenerated in the legacy shape, at least one assertion
fails naming the decision-attention contract explicitly. Silent republication is forbidden.

## 3. Acceptance Criteria

| ID | Criterion | Measured by |
|---|---|---|
| AC-1 | `node scripts/selftest.mjs` ends `0 failed` at exit 0 on a clean tree. The criterion is the zero-failure/exit-0 pair, not a fixed total: the suite total grows as scenarios are added, and it read `1370 passed` when this criterion was written and `1401 passed` at closure | Full suite run |
| AC-2 | Every committed attention item carries `contractVersion` and a declared `decisionWindow` | `scripts/selftest.mjs:6103-6106` |
| AC-3 | Uncapped selection publishes the whole tier; capped selection suppresses the tail | `scripts/selftest.mjs:6131-6140` |
| AC-4 | `market-brief.page.json` is byte-current | `scripts/selftest.mjs:6209` |
| AC-5 | The payload gate returns zero errors | `scripts/selftest.mjs:473-476`, `scripts/validate-brief-payload.mjs` |
| AC-6 | The composer runs on the publish path between lane and gate | `scripts/brief-refresh-and-push.sh:386` |
| AC-7 | The runbook names the composer step at its real pipeline position | `notes/market-brief.md` §3b |
| AC-8 | The guard in AC-2 is non-vacuous — it fails on a legacy-shape payload | Differential evaluation across `HEAD~1` and `HEAD` |

## 4. Out Of Scope

Re-litigating the `decision-attention/v1` contract itself, the ranking key, the card-ceiling
default, or the `RLATTN-*` refusal vocabulary. Those are owned by
`specs/017-decision-attention-and-developing-situations`, which is separately `in_progress`
under its own certification refusal. This bug is confined to whether the committed and
regenerated artifacts satisfy the contract that spec already certified.

## 5. Repository Constraints Honored

No API keys and no restricted endpoints were used; every command was local and read-only
apart from artifact authoring under this bug folder. No browser file was modified, so the
ES5 constraint and the `Number.isFinite`-over-global-`isFinite` rule bind no new code here.
Single-file tool conventions are untouched.

## 6. Capability Proportionality

### Single-Capability Justification

This packet introduces **no reusable capability foundation**, and none is warranted.

Gate G094 became applicable on two keyword hits, and both are incidental. The word
"provider" appears exactly twice across the planning artifacts, on `scopes.md` lines 172 and
174, and in both places it is part of the *name of a sibling bug folder* cited as a
cross-reference — `BUG-001-central-provider-credential-security` and
`BUG-002-two-tier-provider-access`. Nothing in this bug introduces a provider, adapter,
strategy, plugin, channel, driver, connector, or variant.

There is exactly one capability at issue: the empty-tier floor on the decision-attention
publication gate, which requires that a generation publishing zero items must record why. It
has exactly one caller and one call site. Building a foundation with variation axes for a
single seven-line rule would be speculative generality — the abstraction would have one
implementation forever, and the second implementation that would justify it does not exist
and is not foreseen.

The contracts this rule enforces — `decision-attention/v1` and its siblings — are owned by
spec 017, were reused unchanged, and were deliberately **not** re-abstracted here.

## Outcome Contract

**Intent**: Establish by measurement whether the reported decision-attention contract drift
reproduces, determine the failure-family structure rather than assuming it, and close any
residual gap that lets a non-conformant attention tier reach publication.

**Success Signal**: The publication gate refuses a drifted or unexplained-empty attention tier
*by name* rather than passing it silently, and the full project suite is green at exit 0. Both
halves must hold together — a green suite that never exercises the refusal is not the signal.

**Hard Constraints**:

- No source file outside the publication gate `scripts/validate-brief-payload.mjs` and its
  scenario coverage `tests/attention-payload-contract.test.mjs` may change.
- The certified contracts owned by spec 017 (`decision-attention/v1`, `low-noise-gate/v1`,
  `red-alert-policy/v1`, `xnys-calendar/v1`) are reused unchanged, never redefined here.
- Repository conventions hold: UMD modules only and no ESM in browser files, `Number.isFinite`
  over the global `isFinite`, no build step, and no shell redirection used to write files.
- Any mutation test runs in a disposable worktree; the live tree is never left mutated.

**Failure Condition**: A generation that publishes an empty attention tier with no recorded
exclusions, or a payload in the legacy catalyst shape, reaches publication at exit 0 — that is,
the gate stays silent where it should name a refusal.
