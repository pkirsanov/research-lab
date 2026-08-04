# Bug: BUG-006 Evaluate-Before-Publish Ordering, And An Unscoreable Call Published (D16)

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Summary

`node scripts/selftest.mjs` is **RED on `origin/main`**. One assertion fails:

```
✗ FAIL: the evaluator is idempotent against the committed ledger — a re-run closes nothing twice
```

That assertion is [`scripts/selftest.mjs:5370-5371`](../../../scripts/selftest.mjs) —
`assert(evaluate.planEvaluation(ROOT, {}).rows.length === 0, ...)`. Against the
committed ledger it returns **1** row, not 0.

This artifact records **two distinct defects**. They are deliberately **not
merged**: they have different owners, different remedies, and either can be
fixed without the other.

| | Defect | One-line statement |
|---|---|---|
| **A** | **Pipeline ordering makes the asserted invariant unholdable** | [`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh) evaluates at **line 239** and publishes at **line 407**. A call the publish creates is never evaluated in that run. |
| **B** | **An unscoreable tactical call was published** | Anti-drift rule **D16** forbids publishing an unscoreable tactical/swing call. One was published, at commit `7ad10b31`. |

Defect **A** is the *mechanism* that turns a red ledger into a red `main`.
Defect **B** is the *trigger* that produced this particular red. Fixing either
one alone changes the outcome, and neither fix subsumes the other.

## Severity

**Medium — `main` is RED; no reader-facing surface is wrong.**

Not High: the published brief renders correctly, the ledger is internally
consistent, the `not-evaluable` handling downstream of publication is **honest**
(the call is withheld from scoring rather than counted as a free win), and no
number shown to a reader is false.

Not Low: the repository's canonical check
([`node scripts/selftest.mjs`](../../../scripts/selftest.mjs)) fails on
`origin/main` right now, and Defect B is a breach of a ratified anti-drift rule
that directly degrades the product's central claim — a measured, published error
rate.

## Status

**Documented — DO NOT FIX from this packet.**

`state.json` status is `blocked`. The blocker is explicit operator instruction:
an active scheduled pipeline writes this surface and the recommendation ledger
is **append-only**, so an in-flight edit risks corrupting the track record. The
remedy also requires a design choice (see
[design.md](design.md#candidate-remedies-and-which-defect-each-addresses))
that no agent may make unilaterally.

Nothing was fixed. No file under `scripts/`, no `rl*.js`, no `specs/004-*`, no
file under `tests/`, no ledger partition, and no brief artifact was created or
modified by this packet.

## Reproduction Steps

Both commands below were executed in this session against
`/home/redacted/research-lab`. Raw output is in
[report.md](report.md#test-evidence).

### R1 — The canonical project check fails

```bash
cd /home/redacted/research-lab
node scripts/selftest.mjs; echo "SELFTEST_EXIT=$?"
```

Observed, verbatim:

```
  ✗ FAIL: the evaluator is idempotent against the committed ledger — a re-run closes nothing twice
...
================================================
Research-Lab self-test: 1217 passed, 1 failed
================================================
SELFTEST_EXIT=1
```

### R2 — What `planEvaluation` actually returns

```bash
cd /home/redacted/research-lab
node --input-type=module -e 'const m = await import("./scripts/evaluate-recommendations.mjs"); const plan = m.planEvaluation(process.cwd(), {}); console.log("rows: " + plan.rows.length); for (const r of plan.rows) console.log(JSON.stringify(r));'
```

Observed — **1** row, re-flowed here for legibility (the verbatim single-line
form is in [report.md](report.md#e2--planevaluation-returns-one-row)):

```json
{
  "eventType": "not-evaluable",
  "reasonCode": "no-attributable-invalidation-level",
  "proposedAt": "2026-08-04T14:30:29.136Z",
  "instrument": "VIX",
  "direction": "hedge",
  "horizon": "tactical",
  "confidence": 55,
  "deepLink": "gamma-trading-lab.html",
  "outcome": { "levels": 4, "instrument": "VIX" },
  "runId": "evaluate-2026-08-04"
}
```

### R3 — The ordering, read from the script

```bash
grep -n 'evaluate-recommendations' scripts/brief-refresh-and-push.sh
grep -n 'brief-distributed-publish' scripts/brief-refresh-and-push.sh
```

Observed: **exactly one** evaluator invocation, at line **239**; the real
publish at line **407**; the commit at line **560**. There is no second
evaluator invocation anywhere in the file. See
[report.md](report.md#e3--pipeline-ordering-in-the-publisher).

### R4 — Attribution of the ledger row to its commit

```bash
git log --format='%H %ci %s' -S'sha256:8a1f77e90dc8437ff2f1ae67ad352aacda9603d7cb31390e6698e09489faf552' -- briefs/history/recommendations/2026-08.jsonl
```

Observed:

```
7ad10b31e684a50ba517dece798760d0292c46fd 2026-08-04 08:00:17 -0700 market-brief: auto-refresh + narrative 2026-08-04 11:00 EDT (morning)
```

No later commit has touched that partition, so the call is still open.

## Expected Behavior

1. `node scripts/selftest.mjs` exits **0** on `origin/main`.
2. **D16** holds: no unscoreable tactical or swing call reaches the ledger. Per
   [`docs/Improvement-Plan.md:736`](../../../docs/Improvement-Plan.md) — *"If a
   level cannot be attributed, the claim is withheld rather than emitted as
   `not-evaluable`"* — and §5 Step 6 change item 2: *"The proposal path
   **refuses** to emit `evaluability: not-evaluable` for `swing` and `tactical`
   horizons — if no level can be attributed, no call is published. An unscoreable
   tactical call is not a call."*
3. Either the evaluate/publish ordering permits the idempotence invariant to
   hold at commit time, **or** the invariant is restated to something the
   pipeline can actually hold.

## Actual Behavior

1. `selftest` exits **1**. `planEvaluation` proposes **1** closure.
2. A `horizon: tactical` call with `evaluability: not-evaluable` was published
   and committed at `7ad10b31`.
3. The evaluator runs **before** the publish in the same pipeline run, so the
   just-published call waits for the next cycle. The publisher then commits and
   pushes without ever running `selftest`.

## Environment

- Repository: `/home/redacted/research-lab`
- HEAD at documentation time: `8d5657b8433bc59e0fd3bb38a4e6e17aaed150ae`
- HEAD **equals** `origin/main` (`rev-list --left-right --count HEAD...origin/main` → `0  0`)
- Introducing commit: `7ad10b31e684a50ba517dece798760d0292c46fd`, an ancestor of HEAD
- Working tree: **dirty** with unrelated concurrent work (see
  [Corrections](#corrections-to-the-originally-reported-framing) C3). Nothing in
  this packet's evidence depends on those files, and the selftest run mutated
  nothing.
- Node: the repository's build-free `node scripts/selftest.mjs` path; no build step

## Affected Surfaces (read-only in this packet)

| Path | Role |
|---|---|
| [`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh) | `:239` evaluate · `:407` publish · `:560` commit — Defect A |
| [`scripts/selftest.mjs`](../../../scripts/selftest.mjs) | `:5370-5371` the failing assertion |
| [`scripts/evaluate-recommendations.mjs`](../../../scripts/evaluate-recommendations.mjs) | `:196` `planEvaluation` · `:298` `runEvaluation` |
| [`scripts/recommendation-body.mjs`](../../../scripts/recommendation-body.mjs) | `:26` `ACTION_DIRECTION` · `:239-243` direction-aware `classify` · `:255-262` evaluability decision |
| [`scripts/validate-brief-payload.mjs`](../../../scripts/validate-brief-payload.mjs) | `:72` the publish gate — presence-only `invalidation` check — Defect B |
| [`scripts/brief-narrative-parallel.mjs`](../../../scripts/brief-narrative-parallel.mjs) | `:232` D16 as a **prompt string**, not a gate — Defect B |
| [`.github/workflows/tier-a.yml`](../../../.github/workflows/tier-a.yml) | `:112` evaluate · `:131` selftest · `:135` commit — the *other* pipeline surface |
| `briefs/history/recommendations/2026-08.jsonl` | append-only ledger — **not touched** |

## Cross-References

- **D16** — [`docs/Improvement-Plan.md:736`](../../../docs/Improvement-Plan.md)
- **Step 6 acceptance metric** — [`docs/Improvement-Plan.md:444-454`](../../../docs/Improvement-Plan.md)
- **Step 6 spec row** — [`docs/Improvement-Plan.md:751`](../../../docs/Improvement-Plan.md): *"6 born-evaluable | `015-recommendation-outcome-ledger-and-track-record` (`blocked`)"*
- **`notEvaluableShare` metric row** — [`docs/Improvement-Plan.md:716`](../../../docs/Improvement-Plan.md): HEAD **0.8333**, target **≤ 0.25**
- **Required-feature binding** — [`docs/releases/improvement-plan/features.md:61`](../../../docs/releases/improvement-plan/features.md): `<!-- bubbles:feature id=born-evaluable-calls spec=specs/015-recommendation-outcome-ledger-and-track-record delivery=required -->`
- **Spec 015** — `specs/015-recommendation-outcome-ledger-and-track-record/state.json`: `status: blocked`, `certification.status: blocked`

Defect B is precisely the failure mode the **required, undelivered** Step 6
feature exists to prevent. Spec 015 is `blocked`, so the preventive control is
not in place.

## Corrections To The Originally Reported Framing

Recorded per this repository's convention (see
`BUG-005/bug.md → Corrections`). **None of these corrections weakens the
finding**; C1 and C5 sharpen it.

### C1 — "fails after EVERY publish" is not supported by the evidence

The reported framing predicted the assertion *"will fail after EVERY publish …
Expect main to oscillate red/green on each cron cycle."* The ledger says
otherwise.

`judge()` emits **no event** for a `machine-checkable` call that is still inside
its horizon with nothing breached — *"silence means open"*
([`selftest.mjs:5330`](../../../scripts/selftest.mjs)). Those calls contribute
**0** rows, so the assertion stays **green**.

Measured: **36** calls proposed across 2026-08-01 … 2026-08-04 are still open,
and every one of them except the subject call is `machine-checkable`. That
includes tactical calls published by the `2026-08-03 morning`,
`2026-08-03 pre-close`, `2026-08-03 after-hours`, `2026-08-04 pre-market
(490b631d1c42)` and `2026-08-04 pre-market (2c03927060c4)` cycles. Those five
publishes did **not** turn the assertion red.

**Corrected statement of Defect A's trigger condition:** the assertion breaks
when a publish mints a call the evaluator can close **on sight** — an
unscoreable call (verdict emitted immediately), or a call whose level is already
breached at publication. It does not break merely because a publish happened.

The oscillation *is* real; its period is the arrival rate of on-sight-closable
calls, not the cron cadence.

### C2 — `notEvaluableShare` is 0.8197 in the committed scorecard

The reported figure **0.8333** is the value recorded in
[`docs/Improvement-Plan.md`](../../../docs/Improvement-Plan.md) at `:159` and
`:716`. The **committed** `market-brief.scorecard.json` 30-day window currently
reads `notEvaluableShare: 0.8197` (`closed: 183`, `resolved: 33`,
`notEvaluable: 150`). Both numbers are real; they are different snapshots. The
target **≤ 0.25** and the conclusion are unchanged.

### C3 — 1217 passed / 1 failed here, not 1215 / 1

HEAD **equals** `origin/main`, but the working tree carries unrelated
uncommitted concurrent work (`rlbrief.js`, `rlfx.js`, `rlexperience.js`,
`rljourney.js`, `specs/004-*`, several `tests/*`). The assertion count therefore
differs from the reported clean-checkout run. **The failing assertion is
identical**, and it is the only failure. `git status --porcelain=v1` was
byte-identical before and after the selftest run, so the run mutated nothing.

### C4 — A third structural fact, recorded under Defect A as factor A2

`scripts/brief-refresh-and-push.sh` contains **zero** references to `selftest`.
It commits (`:560`) and pushes (`:566`) without running the repository's
canonical check. By contrast
[`.github/workflows/tier-a.yml`](../../../.github/workflows/tier-a.yml) runs
`node scripts/selftest.mjs` as a hard, ungated step at `:131` — *after* its own
evaluate step at `:112` and *before* its commit at `:135`.

This is why the red state reaches `origin/main` unobserved, and why the
workflow path self-heals. It is recorded as **contributing factor A2**, not as a
third defect, because it is squarely about pipeline ordering and gating. See
[design.md](design.md#contributing-factor-a2--the-publisher-path-never-runs-selftest).

### C5 — `no-attributable-invalidation-level` does **not** mean "carries no level"

The reported framing said the reasonCode *"means the call carries no
invalidation level"*. The published `invalidation` field carries **four**
numerals (`755.68`, `~745.0`, `765`, `~16`) and the row records `levels: 4`.

What the reasonCode actually means is that **zero of those levels were
attributed to the invalidation side** after direction-aware classification
([`recommendation-body.mjs:239-243`](../../../scripts/recommendation-body.mjs)).
Re-running the shipped body builder on the exact published text confirms it:
under `action: hedge` all 4 levels classify as `trigger` and the call is
`not-evaluable`; under `action: add`, **same text**, 3 classify as
`invalidation` and the call is `machine-checkable`. Raw output:
[report.md](report.md#e5--root-cause-the-same-text-under-two-action-families).

The conclusion — *unscoreable at birth, D16 breach* — is **unchanged and
correct**. The correction makes it sharper: the D16 authoring instruction at
[`brief-narrative-parallel.mjs:232`](../../../scripts/brief-narrative-parallel.mjs)
demands *"a numeric price level on a named instrument … in its invalidation
field"*. That instruction was **literally satisfied** and the call was still
unscoreable, because the instruction says nothing about direction-aware
attribution. So D16 is not merely unenforced — as written, it is also
**under-specified**.

## What Was NOT Done

- No fix was attempted, designed into code, or applied.
- No test was written, modified, or run beyond the two read-only reproduction
  commands and the canonical `node scripts/selftest.mjs`.
- No claim is made that anything is fixed, verified as fixed, or safe to ship.
- The append-only ledger was **read only**. No partition, index, or pointer was
  written.
- No file under `scripts/`, `tests/`, `specs/004-*`, no `rl*.js`, and no brief
  artifact was created or modified.
