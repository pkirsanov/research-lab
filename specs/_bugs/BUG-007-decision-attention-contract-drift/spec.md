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
| AC-1 | `node scripts/selftest.mjs` ends `1370 passed, 0 failed`, exit 0, on a clean tree | Full suite run |
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
