# BUG-024: A Regression Test Requires The Attention Exclusion Record To Be Overwritten, Which FR-020-023 Forbids

**Severity:** High — a contract test has been red for six days at HEAD, and the
repository's canonical check reports green while it is red.

**Status:** Reported, root-caused, not fixed. This round documents and routes.

**Filed at commit:** `2eb14d964`

## Summary

`tests/attention-payload-contract.test.mjs:797` asserts

```
assert.deepEqual(result.payload.attentionExclusions, result.exclusions);
```

`recomposePayloadAttention` returns two different things under those two names,
and the spec requires them to be different:

| Return value | What it is | Requirement |
| --- | --- | --- |
| `result.exclusions` | the refusals **this generation** produced | FR-020-024 — built plus excluded must equal declared |
| `result.payload.attentionExclusions` | the **append-only record** of refusals | FR-020-023 — every refusal is *appended* with its code, field and reason |

Demanding they be deep-equal is demanding that the append-only record be
replaced by the current run's list — that is, that prior refusals be discarded.
Spec 020 states the opposite in the same document twice: *"Append-only. Routing
decisions, exclusions and outcomes are appended, never rewritten. (P21)"* and
FR-020-023.

So the assertion is not merely stale. It encodes the behaviour that
`df604ec1f` — the BUG-014 audit close, whose subject line is *"restore a
disclosure a recompose had erased"* — was written to remove.

## The Reported Framing Was Wrong, And The Correction Decides The Remedy

The incoming report read the failure as *"the system emits MORE refusals than
the test expects,"* and asked whether the overlap check is over-refusing.

It is not. **The overlap check did not run in this generation at all.**
Measured (`report.md` § 3): `result.exclusions.length === 1`, carrying exactly
one `RLATTN-PROVENANCE` on `gateResult` — precisely what the test expects, and
assertions on lines 792–796 all pass. The five `RLATTN-OVERLAP` entries are
read verbatim out of the committed `market-brief.payload.json`, where they have
been sitting as a published prior record, and are carried forward untouched.

This matters because the two framings route to opposite remedies. "The product
over-refuses" would mean changing `rlattention.js`. The measured mechanism means
the product is correct and the assertion is wrong.

## Reproduction

At clean `HEAD` (`2eb14d964`), no worktree edits to any file involved:

```
$ node --test tests/attention-payload-contract.test.mjs
ℹ tests 31
ℹ pass 30
ℹ fail 1
exit 1
```

Failing case: `Regression: judgement-only lane output is refused rather than
passed through to the payload gate`, at
`tests/attention-payload-contract.test.mjs:775`, failing at line 797.

Full output, the isolated-export control, and the mechanism probe are in
`report.md`.

## Expected vs Actual

| | |
| --- | --- |
| **Expected by the test** | `payload.attentionExclusions` holds exactly the one refusal this run produced |
| **Actual** | `payload.attentionExclusions` holds that one refusal *plus* five prior `RLATTN-OVERLAP` records it must not drop |
| **Expected by FR-020-023** | the actual behaviour |

## Root Cause

Two independent defects in the test, neither in the product.

**RC-1 — the assertion conflates two channels.** Line 797 requires the
FR-020-023 record to equal the FR-020-024 accounting list. Those are equal only
when the input payload carries no prior exclusions. Proven by direct probe: with
`attentionExclusions: []` on the same input the assertion holds; with the
committed priors it does not, and `result.exclusions` is `1` in both runs.

**RC-2 — the test inherits live published data.** Line 788 builds its input as
`{ ...COMMITTED_PAYLOAD, attention: [judgementOnly] }`. It overrides `attention`
but silently inherits `attentionExclusions` from the real
`market-brief.payload.json`. The fixture therefore changes every time the brief
publishes. This is visible in the history: the same assertion failed with
**three** `RLATTN-OVERLAP` entries on 2026-08-22 and with **five** at HEAD,
without the test or the product changing in between.

RC-2 is why this is worth filing rather than adjusting. Even after RC-1 is
corrected, a test whose fixture is whatever the production feed last published
will keep drifting.

## When It Started

`926e1488d` (2026-08-22, parent of the breaking commit) — **passes**, exit 0.
`df604ec1f` (2026-08-22 12:43 -0700) — **fails**, three `RLATTN-OVERLAP` rows.
`2eb14d964` (2026-08-28, HEAD) — **fails**, five `RLATTN-OVERLAP` rows.

Bisected by execution against isolated `git archive` exports, not inferred from
the diff. Commands and output in `report.md` § 2.

The assertion was written on 2026-08-10 in `aff43d9c1`, when the product line
read `attentionExclusions: exclusions` — the same array object. The assertion
was tautologically true then, which is why it was never a meaningful check even
while it was green.

## The Coverage Gap That Let It Live

A contract test has been red for six days and nothing reported it.

1. `node scripts/selftest.mjs` — the canonical repository check — does **not**
   execute this file. Its only reference is prose at `scripts/selftest.mjs:25743`.
   Measured at HEAD: **3429 passed, 0 failed, exit 0**, concurrent with the red test.
2. No workflow executes it either. `.github/workflows/` contains `pages.yml` and
   `tier-a.yml`, and neither runs `node --test`.
3. `scripts/validate-test-file-reachability.mjs` rates the file **reachable**,
   so it is correctly absent from the orphan baseline. It is matched by the glob
   `tests/*.test.mjs`, which the guard derives from four sites — the first being
   `specs/015-…/scopes/02-additive-ledger-row-extension/report.md:861`.

Point 3 is the sharp edge. The reachability guard asks *"is this file selected
by a declared pattern?"* and a pattern quoted inside a committed **spec report**
answers yes. Nobody runs a spec report. The guard is behaving exactly as its own
header documents; the gap is that no check asks the adjacent question, *"does an
automated gate actually execute this file?"* — and the answer here is no.

## Impact

- A red `decision-attention/v1` contract test is invisible to every automated gate.
- `specs/_bugs/BUG-007-decision-attention-contract-drift/` is `status: done`,
  `certification.status: done`, 0 unchecked DoD items, and owns this test file.
  Its recorded evidence is `30 tests, 30 pass, 0 fail`. That count no longer
  holds at HEAD. See `report.md` § 6 for the routing recommendation; this packet
  does not modify that certified packet.
- Any future round running this suite hits a pre-existing red and may either
  spend time on it or, worse, "fix" it by deleting the append-only behaviour.

## Related

- `specs/020-research-action-routing-and-alerts` — FR-020-022, FR-020-023, FR-020-024, P21
- `specs/017-decision-attention-and-developing-situations` — FR-006, `design.md:616`
- `specs/_bugs/BUG-014-recommendation-confidence-pinned-at-the-tactical-cap` — the audit whose close (`df604ec1f`) introduced the append semantics
- `specs/_bugs/BUG-007-decision-attention-contract-drift` — owns the test file; certified done; **not modified by this packet**
- `specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent` — independently recorded the same class of silent escape
