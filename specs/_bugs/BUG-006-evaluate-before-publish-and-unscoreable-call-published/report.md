# Report: BUG-006 Evaluate-Before-Publish Ordering, And An Unscoreable Call Published (D16)

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

### Summary

This run **documented** two verified defects. **It fixed nothing and tested no
fix.**

`node scripts/selftest.mjs` is RED on `origin/main`. One assertion fails —
*"the evaluator is idempotent against the committed ledger — a re-run closes
nothing twice"* — because `planEvaluation` proposes one pending closure against
the committed ledger.

Two independent defects were established:

- **A** — [`scripts/brief-refresh-and-push.sh`](../../../scripts/brief-refresh-and-push.sh)
  evaluates at `:239` and publishes at `:407`, with exactly one evaluator
  invocation in the file. This run's own output is outside this run's
  evaluation window.
- **B** — a `horizon: tactical`, `evaluability: not-evaluable` call was
  published at commit `7ad10b31`, breaching anti-drift rule **D16**.

Five claims in the originally reported framing were checked. **Three were found
inaccurate and are corrected** in
[bug.md → Corrections](bug.md#corrections-to-the-originally-reported-framing);
one correction (C5) **sharpens** the finding rather than weakening it. Neither
defect's existence is changed by any correction.

All evidence below was produced by executing commands in this session against
`/home/redacted/research-lab`.

**Run date:** 2026-08-04T15:21:40Z
**HEAD:** `8d5657b8433bc59e0fd3bb38a4e6e17aaed150ae` (equals `origin/main`)

### Completion Statement

**This packet is NOT complete and asserts no completion.**

- Status is `blocked`. The blocker is the operator's standing DO-NOT-FIX
  constraint plus an unmade remedy decision among R1–R6 in
  [design.md](design.md#candidate-remedies-and-which-defect-each-addresses).
- **Zero** DoD boxes are checked across all four scopes.
- **No** certification field asserts anything: `certifiedAt` is `null`,
  `certification.completedScopes` is empty, `certification.scopeProgress` is
  empty, and `certification.status` mirrors the non-terminal top-level status.
- No remedy was selected, designed into code, or applied.
- No file under `scripts/` was created or modified.
- No file under `tests/` was created or modified.
- `rlbrief.js`, `rlexperience.js`, `rlfx.js`, `rljourney.js` and `specs/004-*`
  were **not** read into, written to, reverted, stashed, or committed.
- No recommendation-ledger partition, index, or pointer was written. The ledger
  was **read only**.
- No brief artifact (`market-brief.*`, `briefs/**`) was written.
- The concurrent session's uncommitted working-tree files were left untouched
  (proved byte-for-byte in [E10](#e10--the-working-tree-was-not-mutated)).

### Test Evidence

Every block below is raw terminal output captured in this session. Long lines
were soft-wrapped by the terminal for display; the logical content is
unmodified.

#### E1 — The canonical project check fails

**Claim Source:** `executed`

```bash
cd /home/redacted/research-lab && node scripts/selftest.mjs; echo "SELFTEST_EXIT=$?"
```

The failing assertion, in context (the ten preceding assertions in the same
group all pass, including the two adversarial attribution assertions):

```
  ✓ a call still inside its horizon with nothing breached emits no event — silence means open
  ✓ a call with no checkable level resolves not-evaluable with its own reason, never a forced hit or miss
  ✓ a call naming an instrument we hold no bars for is not-evaluable, not a silent pass
  ✓ an upside gate written inside the invalidation field is attributed to the trigger side, so a recovering thesis is never scored as broken
  ✓ with only an upside gate published, the call is withheld from scoring rather than counted as a free win
  ✓ a single-instrument call still resolves a gate written without repeating the ticker
  ✓ the ledger carries close events (150 outcomes)
  ✓ every outcome uses the shipped close vocabulary: invalidated, not-evaluable, satisfied
  ✓ not-evaluable is populated, proving the evaluator is not forcing verdicts
  ✓ every outcome names its reason and the call it closes
  ✗ FAIL: the evaluator is idempotent against the committed ledger — a re-run closes nothing twice

scorecard — the brief publishes its own error rate, misses included
  ✓ resolved counts only calls that reached a trigger or an invalidation (18 + 15 = 33)
```

Tail of the run:

```
================================================
Research-Lab self-test: 1217 passed, 1 failed
================================================
SELFTEST_EXIT=1
```

**Interpretation** — *Claim Source: `interpreted`.* Exactly one assertion fails,
and it is the one reported. The count is 1217/1 rather than the reported 1215/1
because the working tree carries unrelated concurrent work; see
[E10](#e10--the-working-tree-was-not-mutated) and correction C3. Note that the
two adversarial attribution assertions immediately above the failure **pass** —
the direction-aware classifier is working as specified. This is why
[design.md](design.md#defect-b--an-unscoreable-tactical-call-was-published)
places Defect B at the publish gate and not in the classifier.

#### E2 — `planEvaluation` returns one row

**Claim Source:** `executed`

```bash
cd /home/redacted/research-lab && node --input-type=module -e 'const m = await import("./scripts/evaluate-recommendations.mjs"); const plan = m.planEvaluation(process.cwd(), {}); console.log("rows: " + plan.rows.length); for (const r of plan.rows) console.log(JSON.stringify(r));'
```

```
rows: 1
{"contractVersion":"brief-recommendation-history-row/v2","outcomeContractVersion":"brief-recommendation-outcome-row/v1","runId":"evaluate-2026-08-04","canonicalMonth":"2026-08","eventId":"sha256:849b672ee2e1b80a2df37e17cb383ea0d488faf952429eb198fcd97a3e981a98","eventType":"not-evaluable","recommendationKey":"sha256:8a1f77e90dc8437ff2f1ae67ad352aacda9603d7cb31390e6698e09489faf552","occurredAt":"2026-08-04T15:14:03.714Z","reasonCode":"no-attributable-invalidation-level","proposedAt":"2026-08-04T14:30:29.136Z","instrument":"VIX","direction":"hedge","horizon":"tactical","confidence":55,"deepLink":"gamma-trading-lab.html","outcome":{"levels":4,"instrument":"VIX"},"evaluatedAsOf":"2026-08-04T15:14:03.714Z"}
```

**Interpretation** — *Claim Source: `interpreted`.* `planEvaluation` is
documented pure at
[`evaluate-recommendations.mjs:193-196`](../../../scripts/evaluate-recommendations.mjs)
— *"the closures that WOULD be appended"* — so this run wrote nothing. Note
`"outcome":{"levels":4}`: the call carries **four** levels. It is unscoreable
because none of them is attributed to the invalidation side, **not** because it
carries no level. That is correction C5.

#### E3 — Pipeline ordering in the publisher

**Claim Source:** `executed`

Search over `scripts/brief-refresh-and-push.sh`:

```
evaluate-recommendations   → 1 match
  239: run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/evaluate-recommendations.mjs \

brief-distributed-publish  → 3 matches
  250:   if "$NODE_BIN" scripts/brief-distributed-publish.mjs --prepare-tools --root . --output "$TOOL_BRIEF_BUNDLE"; then
  395:   if "$NODE_BIN" scripts/brief-distributed-publish.mjs --dry-run --root .; then
  407:   if "$NODE_BIN" scripts/brief-distributed-publish.mjs --root . "${tool_bundle_args[@]}" \

git commit                 → 1 match
  560: if ! "$GIT_BIN" commit -q -m "$MSG" -- "${SELECTED_FILES[@]}"; then
```

The evaluator invocation at `:239`, with its own comment at `:236-238`:

```
# 1b-ii) Score every open call against its OWN published trigger/invalidation BEFORE the narrative
# lane runs, so the author sees this run's real track record rather than authoring blind. Appending
# outcomes is additive and never blocks publication: a scoring failure must not cost us the brief.
run_with_timeout "$TIER_A_TIMEOUT" "$NODE_BIN" scripts/evaluate-recommendations.mjs \
  || echo "[brief-timer] recommendation scoring returned non-zero (soft) — continuing"
```

**Interpretation** — *Claim Source: `interpreted`.* `:250` is the read-only
tool-bundle barrier and `:395` is the `--dry-run` branch; **`:407` is the only
mutating publish**. With exactly one evaluator invocation, at `:239`, the
ordering is `evaluate → publish → commit` with no post-publish evaluate. The
script's own comment states the intent, which is coherent — the consequence is
structural, not a coding slip.

#### E4 — Ledger attribution

**Claim Source:** `executed`

```bash
cd /home/redacted/research-lab && git --no-pager log --format='%H %ci %s' -S'sha256:8a1f77e90dc8437ff2f1ae67ad352aacda9603d7cb31390e6698e09489faf552' -- briefs/history/recommendations/2026-08.jsonl
```

```
7ad10b31e684a50ba517dece798760d0292c46fd 2026-08-04 08:00:17 -0700 market-brief: auto-refresh + narrative 2026-08-04 11:00 EDT (morning)
```

```bash
git merge-base --is-ancestor 7ad10b31 HEAD && echo "yes"
git --no-pager log --format='%h %ci %s' 7ad10b31~1..HEAD -- briefs/history/recommendations/2026-08.jsonl
```

```
yes
7ad10b31 2026-08-04 08:00:17 -0700 market-brief: auto-refresh + narrative 2026-08-04 11:00 EDT (morning)
```

The ledger row itself:

```json
{
  "eventType": "proposed",
  "runId": "dist-2026-08-04-morning-0a21f353a9b4",
  "occurredAt": "2026-08-04T14:30:29.136Z",
  "horizon": "tactical",
  "instrument": "VIX",
  "direction": "hedge",
  "confidence": 55,
  "evaluability": "not-evaluable",
  "evaluabilityReason": "no-attributable-invalidation-level",
  "levels": [
    { "instrument": "VIX", "relation": "below", "source": "trigger", "value": 16 },
    { "instrument": "SPY", "relation": "below", "source": "trigger", "value": 755.68 },
    { "instrument": "SPY", "relation": "below", "source": "trigger", "value": 745 },
    { "instrument": "VIX", "relation": "below", "source": "trigger", "value": 16 }
  ]
}
```

Ledger-wide evaluability tally for `2026-08.jsonl` (143 rows total):

```
{
  "machine-checkable / null": 49,
  "not-evaluable / no-attributable-invalidation-level": 26,
  "not-evaluable / no-attributable-price-level": 10
}
```

**Interpretation** — *Claim Source: `interpreted`.* Commit `7ad10b31` is the
sole commit that introduced this row, it is an ancestor of HEAD, and **no later
commit has touched the partition** — so the call is still open, exactly as
Defect A predicts. All four attributed levels carry `source: "trigger"` and none
carries `source: "invalidation"`.

#### E5 — Root cause: the same text under two action families

**Claim Source:** `executed`

The shipped body builder was re-run on the **exact published** `trigger` and
`invalidation` strings, varying only the action family:

```
=== action=hedge  directionSign=-1  breakRelation=above ===
  evaluability      : not-evaluable
  evaluabilityReason: no-attributable-invalidation-level
  levels by source  : trigger=4  invalidation=0
    {"instrument":"VIX","relation":"below","value":16,"source":"trigger"}
    {"instrument":"SPY","relation":"below","value":755.68,"source":"trigger"}
    {"instrument":"SPY","relation":"below","value":745,"source":"trigger"}
    {"instrument":"VIX","relation":"below","value":16,"source":"trigger"}
=== action=add  directionSign=1  breakRelation=below ===
  evaluability      : machine-checkable
  evaluabilityReason: null
  levels by source  : trigger=1  invalidation=3
    {"instrument":"VIX","relation":"below","value":16,"source":"trigger"}
    {"instrument":"SPY","relation":"below","value":755.68,"source":"invalidation"}
    {"instrument":"SPY","relation":"below","value":745,"source":"invalidation"}
    {"instrument":"VIX","relation":"below","value":16,"source":"invalidation"}
```

**Interpretation** — *Claim Source: `interpreted`.* Identical prose, identical
extracted numerals, opposite evaluability. `ACTION_DIRECTION`
([`recommendation-body.mjs:26`](../../../scripts/recommendation-body.mjs)) maps
`hedge → -1`, so `breakRelation` is `above` and every `below` level written in
the invalidation field is reclassified as the hedge's improvement branch. This
grounds the root cause; it is not inferred from the reasonCode name.

The prose **does** contain an `above` clause — *"SPY closing at/above the 765
call wall"* — and it produced **no** `above` level. **Why has not been
established** and is recorded as open finding `DISC-006-004`. This packet does
not speculate about the extractor.

#### E6 — D16 is a prompt string, not a gate

**Claim Source:** `executed`

The **only** D16 surface, [`brief-narrative-parallel.mjs:232`](../../../scripts/brief-narrative-parallel.mjs):

```
const evaluabilityInstruction = 'Every tactical or swing call MUST carry, in its invalidation field, a numeric price level on a named instrument that is in the committed universe, written with an explicit direction word (for example "a close below 740.09" or "a gap-fade back below the 200-day (~432.3)"). A percentage, a relative-strength threshold, a moving-average name with no number, or a purely qualitative condition is NOT a level. If the thesis genuinely has no attributable price level, withhold the call rather than publishing one that can never be scored.';
```

The actual publish gate, [`validate-brief-payload.mjs:72-77`](../../../scripts/validate-brief-payload.mjs):

```
      for (const field of ['subject', 'rationale', 'structuralAnchor', 'trigger', 'invalidation', 'deepLink']) {
        if (!hasText(action?.[field])) errors.push(`${prefix}.${field} is required`);
      }
      if (!allowedHorizons.has(action?.horizon)) errors.push(`${prefix}.horizon must be structural|swing|tactical`);
      if (!Number.isFinite(action?.confidence) || action.confidence < minimumConfidence) errors.push(`${prefix}.confidence must be at least ${minimumConfidence}`);
      if (action?.horizon === 'tactical' && Number.isFinite(action.confidence) && action.confidence > tacticalCap) errors.push(`${prefix}.confidence exceeds tactical cap ${tacticalCap}`);
```

Search over `validate-brief-payload.mjs` for `evaluab` → **0 matches**.

**Interpretation** — *Claim Source: `interpreted`.* The publish gate requires
`invalidation` to be **non-empty text** and nothing more. It never evaluates
attribution or evaluability. The contrast inside `brief-narrative-parallel.mjs`
is self-documenting: the comment at `:222-226` states the *vocabulary* rule is
*"Enforced by scripts/validate-brief-payload.mjs on the publish path"*, while
the evaluability comment at `:227-231` names **no** enforcement surface. D16 is
a request to a model; D13 is a gate. Note also that the instruction demands only
*"a numeric price level … in its invalidation field"* — the published call
satisfied that wording literally and was still unscoreable, which is why
[spec.md](spec.md#fr-006-004--a-d16-equivalent-rule-must-be-stated-in-terms-the-evaluator-uses)
raises FR-006-004.

#### E7 — Only one of the two commit paths runs `selftest`

**Claim Source:** `executed`

Search over `scripts/brief-refresh-and-push.sh` for `selftest` → **0 matches**
(the same search matched `validate-distributed`, `build-scorecard` and `push`,
so the search itself is not vacuous).

`.github/workflows/tier-a.yml`:

```
  112:    - name: Evaluate elapsed recommendations
  114:      run: node scripts/evaluate-recommendations.mjs ${{ inputs['dry-run'] && '--dry-run' || '' }}
  131:    - name: Self-test (all assertions)
  135:    - name: Commit refreshed artifacts
```

with, at `:129-133`:

```
    # The same gate the deploy path uses. A scheduled run must never commit an artifact that
    # would fail the checks a human commit has to pass.
    - name: Self-test (all assertions)
      if: steps.window.outputs.run == 'true'
      run: node scripts/selftest.mjs
```

**Interpretation** — *Claim Source: `interpreted`.* The workflow runs evaluate
(`:112`) **before** selftest (`:131`) **before** commit (`:135`), so it is
self-consistent and self-heals: it closes the pending call, then asserts, then
commits. The publisher script runs neither selftest nor a second evaluate, and
commits at `:560` / pushes at `:566` regardless. This is contributing factor
A2 — it explains why the red state reaches `origin/main` unobserved and why it
later clears. The workflow comment *"A scheduled run must never commit an
artifact that would fail the checks a human commit has to pass"* states the
standard the publisher path does not meet.

#### E8 — Open calls and close lag (the C1 correction)

**Claim Source:** `executed`

Close lag for the twelve most recent close events:

```
  proposed 2026-07-31T14:30:20.016Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=38.91  not-evaluable/no-attributable-invalidation-level
  proposed 2026-07-31T18:30:28.372Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=34.91  not-evaluable/no-attributable-invalidation-level
  proposed 2026-07-31T18:30:28.372Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=34.91  not-evaluable/no-attributable-price-level
  proposed 2026-07-31T14:30:20.016Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=38.91  not-evaluable/no-attributable-price-level
  proposed 2026-07-31T11:00:17.269Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=42.41  satisfied/trigger-level-above-743.9
  proposed 2026-08-03T11:00:19.246Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=-29.59  not-evaluable/no-attributable-price-level
  proposed 2026-07-31T11:00:17.269Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=42.41  not-evaluable/no-attributable-invalidation-level
  proposed 2026-08-02T03:07:05.490Z  ->  closed 2026-08-02T05:25:08.748Z  runId=evaluate-2026-08-02  lag_hours=2.30   not-evaluable/no-attributable-invalidation-level
  proposed 2026-08-02T22:08:43.166Z  ->  closed 2026-08-02T14:30:23.009Z  runId=evaluate-2026-08-02  lag_hours=-7.64  not-evaluable/no-attributable-invalidation-level
  proposed 2026-07-31T18:30:28.372Z  ->  closed 2026-08-03T20:30:22.287Z  runId=evaluate-2026-08-03  lag_hours=74.00  satisfied/trigger-level-above-744.2
  proposed 2026-07-31T14:30:20.016Z  ->  closed 2026-08-03T20:30:22.287Z  runId=evaluate-2026-08-03  lag_hours=78.00  satisfied/trigger-level-above-744.1
  proposed 2026-08-03T11:00:19.246Z  ->  closed 2026-08-03T20:30:22.287Z  runId=evaluate-2026-08-03  lag_hours=9.50   invalidated/invalidation-level-above-744.2
```

Currently open (proposed, never closed) — **36** entries. Abridged to the tail
plus one representative earlier row; the full listing is reproducible from the
command in this section:

```
  2026-08-03T14:30:54.130Z  runId=dist-2026-08-03-morning-574480c1918e     horizon=tactical    evaluability=machine-checkable / null
  2026-08-03T18:30:22.861Z  runId=dist-2026-08-03-pre-close-f800f398d153   horizon=tactical    evaluability=machine-checkable / null
  2026-08-03T20:30:22.217Z  runId=dist-2026-08-03-after-hours-5c5bfa861b08 horizon=tactical    evaluability=machine-checkable / null
  2026-08-04T04:08:51.922Z  runId=dist-2026-08-04-pre-market-490b631d1c42  horizon=tactical    evaluability=machine-checkable / null
  2026-08-04T11:00:19.764Z  runId=dist-2026-08-04-pre-market-2c03927060c4  horizon=tactical    evaluability=machine-checkable / null
  2026-08-04T14:30:29.136Z  runId=dist-2026-08-04-morning-0a21f353a9b4     horizon=structural  evaluability=machine-checkable / null
  2026-08-04T14:30:29.136Z  runId=dist-2026-08-04-morning-0a21f353a9b4     horizon=swing       evaluability=machine-checkable / null
  2026-08-04T14:30:29.136Z  runId=dist-2026-08-04-morning-0a21f353a9b4     horizon=swing       evaluability=machine-checkable / null
  2026-08-04T14:30:29.136Z  runId=dist-2026-08-04-morning-0a21f353a9b4     horizon=swing       evaluability=machine-checkable / null
  2026-08-04T14:30:29.136Z  runId=dist-2026-08-04-morning-0a21f353a9b4     horizon=tactical    evaluability=not-evaluable / no-attributable-invalidation-level
```

**Interpretation** — *Claim Source: `interpreted`.* **This is the evidence that
corrects the reported framing.** Of 36 open calls, **35 are
`machine-checkable`** and produce **no** closure row, because *"silence means
open"*. Five recent publishes — `2026-08-03 morning`, `2026-08-03 pre-close`,
`2026-08-03 after-hours`, and both `2026-08-04 pre-market` runs — each minted a
tactical call, and **none** of them turned the assertion red. The single
`not-evaluable` call from `2026-08-04 morning` is the **only** row
`planEvaluation` proposes, matching `rows: 1` in [E2](#e2--planevaluation-returns-one-row) exactly.

So the assertion does **not** fail after every publish. It fails when a publish
mints a call the evaluator can close **on sight**. The close-lag table
independently confirms the deferral: real closes land in a **later** run
(`runId=evaluate-2026-08-02` closing calls proposed on 07-31), never in the run
that proposed them. Negative lags are calls closed by a run whose `asOf`
precedes a later-proposed call's timestamp — an artifact of the append-only
ordering, not a contradiction.

#### E9 — Measured consequence: the committed scorecard

**Claim Source:** `executed`

`market-brief.scorecard.json`, `windows["30d"]`, abridged to the relevant slices:

```
{
  "days": 30, "closed": 183, "satisfied": 18, "invalidated": 15,
  "expired": 0, "unresolved": 0, "notEvaluable": 150, "resolved": 33,
  "hitRate": 0.5455, "insufficientSample": false, "notEvaluableShare": 0.8197,
  "byHorizon": {
    "swing":      { "closed": 106, "resolved": 2,  "notEvaluable": 104, "hitRate": null, "insufficientSample": true,  "notEvaluableShare": 0.9811 },
    "tactical":   { "closed": 41,  "resolved": 2,  "notEvaluable": 39,  "hitRate": null, "insufficientSample": true,  "notEvaluableShare": 0.9512 },
    "structural": { "closed": 36,  "resolved": 29, "notEvaluable": 7,   "hitRate": 0.6207, "insufficientSample": false, "notEvaluableShare": 0.1944 }
  },
  "byDirection": {
    "hedge":  { "closed": 43, "resolved": 2, "notEvaluable": 41, "notEvaluableShare": 0.9535 },
    "trim":   { "closed": 34, "resolved": 0, "notEvaluable": 34, "notEvaluableShare": 1 },
    "rotate": { "closed": 28, "resolved": 0, "notEvaluable": 28, "notEvaluableShare": 1 },
    "add":    { "closed": 10, "resolved": 0, "notEvaluable": 10, "notEvaluableShare": 1 },
    "hold":   { "closed": 68, "resolved": 31, "notEvaluable": 37, "notEvaluableShare": 0.5441 }
  }
}
```

Spec 015's recorded state:

```
{ "status": "blocked", "workflowMode": "product-to-planning", "certification": "blocked", "createdAt": "2026-07-28T00:00:00Z" }
```

**Interpretation** — *Claim Source: `interpreted`.* The committed 30-day
`notEvaluableShare` is **0.8197**, against the **≤ 0.25** target at
[`Improvement-Plan.md:716`](../../../docs/Improvement-Plan.md). The reported
figure 0.8333 is the value recorded in that document at `:159` and `:716` — a
different snapshot, not an error; this is correction C2. The `swing` and
`tactical` horizons both report `insufficientSample: true`, which is precisely
the Step 6 *"Done when"* condition at
[`Improvement-Plan.md:453-454`](../../../docs/Improvement-Plan.md) that remains
unmet. Spec 015, which owns the `born-evaluable-calls` required feature, is
`blocked` — so the preventive control for Defect B is undelivered.

**Explicitly not claimed:** `hedge` at 0.9535 is suggestive alongside the
direction-sign mechanism in [E5](#e5--root-cause-the-same-text-under-two-action-families),
but `rotate` and `add` (both sign `+1`) sit at **1.0**, so this evidence does
**not** support a direction-sign-wide explanation. A cohort analysis is open
finding `DISC-006-005`.

#### E10 — The working tree was not mutated

**Claim Source:** `executed`

Repository identity:

```
=== HEAD ===
8d5657b8433bc59e0fd3bb38a4e6e17aaed150ae
2026-08-04 15:08:16 +0000
Complete the domain-vocabulary commit: stage its producer

=== HEAD vs origin/main ===
8d5657b8433bc59e0fd3bb38a4e6e17aaed150ae
8d5657b8433bc59e0fd3bb38a4e6e17aaed150ae

=== ahead/behind (left=local-only right=remote-only) ===
0       0
```

`git status --porcelain=v1` **before** the selftest run and **after** it were
byte-identical:

```
 M .vscode/mcp.json
 M rlbrief.js
 M rlexperience.js
 M rlfx.js
 M rljourney.js
 M specs/004-fx-regime-relative-value-lab/design.md
 M specs/004-fx-regime-relative-value-lab/report.md
 M specs/004-fx-regime-relative-value-lab/scenario-manifest.json
 M specs/004-fx-regime-relative-value-lab/scopes.md
 M specs/004-fx-regime-relative-value-lab/spec.md
 M specs/004-fx-regime-relative-value-lab/state.json
 M specs/004-fx-regime-relative-value-lab/test-plan.json
 M specs/004-fx-regime-relative-value-lab/uservalidation.md
 M specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md
 M specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
 M specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
 M specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json
 M tests/feature-004-dirty-tree-collision.test.mjs
 M tests/journey.spec.mjs
 M tests/playwright-runtime.foundation.functional.mjs
 M tests/simple-production-bridge.integration.mjs
 M tests/simple-production-bridge.unit.mjs
?? .specify/memory/bubbles.session.json.flock
?? fx-vehicle-universe.json
?? specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/
?? tests/feature-004-brief-eligibility.test.mjs
?? tests/feature-004-journey-evidence-refresh.test.mjs
?? tests/feature-004-tool-control-binding.test.mjs
?? tests/feature-004-vehicle-universe.test.mjs
```

`scripts/selftest.mjs` was additionally checked for write calls before being
run — searching it for `writeFileSync|mkdirSync|rmSync|appendFileSync|execSync|spawnSync`
returns exactly **one** match, at `:5557`, and that match is a **string literal
inside an assertion** (`!read('scripts/shard-brief-history.mjs').includes('writeFileSync(...)')`),
not a call.

**Interpretation** — *Claim Source: `interpreted`.* HEAD equals `origin/main`,
so the failure is on `main` and not on a local commit. The working tree carries
a **concurrent session's** uncommitted work — `rlbrief.js`, `rlfx.js`,
`rlexperience.js`, `rljourney.js`, `specs/004-*` and several `tests/*` — which
this packet was explicitly forbidden to touch and did not touch. The identical
pre/post listings prove the selftest run mutated nothing. That dirty state is
also why the assertion count is 1217/1 rather than the reported 1215/1
(correction C3); the failing assertion is the same one.

### Anti-Fabrication Statement

- **No fix was implemented.** No file under `scripts/`, `tests/`, `specs/004-*`,
  no `rl*.js`, no ledger partition, no index, no pointer, and no brief artifact
  was created or modified by this packet.
- **No test was written.** The only commands executed were the two reproduction
  commands, the canonical `node scripts/selftest.mjs`, read-only `git`
  inspection, and read-only Node imports of shipped modules.
- **No claim of verification-after-fix is made**, because no fix exists.
- **The loop question for remedy R1 is NOT answered.** The lifecycle reasoning
  and the fingerprint-drift hazard in
  [design.md](design.md#r1-the-loop-question--must-be-assessed-before-any-attempt)
  are labelled `interpreted` and are derived from reading code, not from
  execution.
- **Why `"at/above the 765 call wall"` produced no `above` level is NOT
  established** and is recorded as an open finding rather than guessed at.

---

## Defect B Remediation Run (later session)

> The Anti-Fabrication Statement above describes the **documentation-only** run.
> Everything below is a **separate, later execution** in which the repository
> owner explicitly lifted the DO-NOT-FIX constraint **for Defect B only** and
> directed the remedy: **R5 (sharpen the authoring instruction) + R2 (a
> mechanical publish gate)**, with the drop-versus-fail policy delegated to this
> run. Defect A and contributing factor A2 were **not** touched and remain open.

### The Owner Decision, Recorded (Scope 1 items 1–3)

| Question | Recorded answer |
|---|---|
| Selected remedy | **R5 + R2.** R5 alone was rejected by the owner as insufficient — *"the prompt alone is what already failed here."* |
| Defect left open | **Defect A** (evaluate-before-publish ordering) and **A2** (the publisher never runs `selftest`). Neither was touched. |
| R4 (relax the assertion) | **Not selected.** The `selftest` idempotence assertion is unchanged. |
| Pipeline edits while the scheduler is live | Permitted for this change. The edit to `scripts/brief-refresh-and-push.sh` is a one-token flag addition, covered by `tests/brief-refresh-atomicity.test.mjs` (26/26 green, below). |
| R5 in `docs/Improvement-Plan.md` | **NOT done.** Only the *author prompt* wording was sharpened. `docs/Improvement-Plan.md` is an owner-authored surface and is still out of scope; the Scope 2 DoD item for it remains unchecked. |

### The Refusal Policy: DROP The Call, Never Fail The Publish

The choice was forced by executed evidence, not preference.

**The currently committed `market-brief.payload.json` already contains one
offending call** — `nextSession.actions[4]`, `action=hedge`, `horizon=tactical`,
zero attributed invalidation levels (raw output in
[E-B1](#e-b1--the-committed-payload-still-carries-the-offending-call)). So a
blocking D16 verdict would not have been a hypothetical future refusal; it would
have fired immediately, on the existing baseline. Three consequences follow:

1. **The brief would stop shipping, permanently.**
   [`brief-refresh-and-push.sh:95`](../../../scripts/brief-refresh-and-push.sh)
   validates the **previously published** payload as its transaction baseline and
   `exit 1`s when that payload is invalid — *before any fetch*. A blocking verdict
   there refuses **every** subsequent scheduled run until a human hand-edits a
   committed artifact under `BRIEF_REPAIR_INVALID_BASELINE=1`.
2. **`main` would stay red, only differently.**
   [`selftest.mjs:462`](../../../scripts/selftest.mjs) asserts
   `validateBriefPayload(...)` returns zero errors for the committed payload. A
   blocking D16 error there swaps one red assertion for another.
3. **The cost is disproportionate.** BUG-006 severity is *"Medium — `main` is
   RED; no reader-facing surface is wrong."* Killing eight briefs a day to
   prevent one unscoreable ledger row is a strictly larger harm than the defect.

Dropping costs exactly one call from one window — and D16 itself asks for
precisely that: *"the claim is **withheld** rather than emitted as
`not-evaluable`."* A call that can never be scored is not a call.

**The policy is therefore per-rung, and each rung is deliberate:**

| Rung | Mode | Why |
|---|---|---|
| `:95` baseline | default — report by name, exit on schema errors only | D16 governs **publication**; a baseline is history, not this run's claim. Blocking here stalls the scheduler. |
| `:303` post-narrative | **`--drop-unscoreable`** | This run's own candidate, inside the transaction, with `restore_narrative_baseline` available. The offending claim is withheld and the brief still publishes. |
| `:334` retained / `:365` final pair | default | `:303` already repaired; these rungs must not rewrite an artifact this run did not author. |
| human / CI / regression | **`--enforce-d16`** | Strict, read-only verdict. This is the mode the adversarial proof exercises. |

A typo'd flag exits **2** rather than being silently ignored, so a misspelling
can never quietly disable the gate.

### E-B1 — The Committed Payload Still Carries The Offending Call

**Claim Source: `executed`.**

```
[0] action=hold horizon=structural   evaluability=machine-checkable reason=null invalidationLevels=3 triggerLevels=3
[1] action=hold horizon=swing        evaluability=machine-checkable reason=null invalidationLevels=1 triggerLevels=2
[2] action=rotate horizon=swing      evaluability=machine-checkable reason=null invalidationLevels=2 triggerLevels=0
[3] action=hold horizon=swing        evaluability=machine-checkable reason=null invalidationLevels=1 triggerLevels=2
[4] action=hedge horizon=tactical    evaluability=not-evaluable reason=no-attributable-invalidation-level invalidationLevels=0 triggerLevels=3
PROBE_EXIT=0
```

### E-B2 — DISC-006-004 Closed: The Bare Integer, Not The Compound Form

**Claim Source: `executed`.** The open question *"why did `at/above the 765 call
wall` produce no `above` level?"* is now answered. It is **not** the `at/above`
compound and **not** the *"call wall"* noun phrase. `765` is a **bare integer**,
which `extractLevels` deliberately refuses on both sides (*"in this corpus
integers are periods and thresholds … not prices"*). Only `~16` survived, and a
`below` level on a short-biased call is re-attributed to the trigger side.

```
published form (bare integer)    -> [{"instrument":"VIX","relation":"below","value":16,"upside":false}]
tilde form                       -> [{"instrument":"SPY","relation":"above","value":765,"upside":false}]
decimal form                     -> [{"instrument":"SPY","relation":"above","value":765,"upside":false}]
below only (the defect)          -> [{"instrument":"SPY","relation":"below","value":755.68,"upside":false}]
PROBE_EXIT=0
```

This is why the sharpened authoring instruction now constrains **both** the side
**and** the numeric form. The previous wording was under-specified on both axes,
and the published call violated both.

### E-B3 — Mandated Adversarial Proof (three exit codes, verbatim)

**Claim Source: `executed`.** The offending fixture is the **real published
payload, byte-for-byte** — not a synthetic strawman. The corrected fixture is
the same file with **only** `actions[4].invalidation` rewritten onto the
direction-correct side.

**1 — canonical project check**

```
Research-Lab self-test: 1218 passed, 0 failed
PROOF_1_SELFTEST_EXIT=0
```

**2 — the offending hedge call is REFUSED**

```
[brief-contract] D16 REFUSED nextSession.actions[4] action=hedge horizon=tactical directionSign=-1 must break ABOVE reason=no-attributable-invalidation-level invalidationLevels=0 triggerLevels=3 subject="Keep a MINIMAL event-insurance residual into July NFP 8/7 — with VIX now easing back under 16 (15.86) the run-off case f"
[brief-contract] FAIL: 1 unscoreable tactical/swing call(s) breach D16 — withhold them or give each one a direction-correct invalidation level
PROOF_2_OFFENDING_EXIT=1
```

**3 — the direction-correct version PASSES**

```
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
PROOF_3_CORRECTED_EXIT=0
```

**The gate is not vacuous.** Two payloads differing **only** in the invalidation
clause's side and numeric form produce exit `1` and exit `0`. The refusal names
the action, its subject, its direction sign, the side it needed, and the reason
code, as required.

### E-B4 — The Repair Mode Keeps The Brief

**Claim Source: `executed`.** Same offending payload, `--drop-unscoreable`:

```
[brief-contract] D16 REFUSED nextSession.actions[4] action=hedge horizon=tactical directionSign=-1 must break ABOVE reason=no-attributable-invalidation-level invalidationLevels=0 triggerLevels=3 subject="Keep a MINIMAL event-insurance residual into July NFP 8/7 — …"
[brief-contract] D16 withheld 1 unscoreable call(s) from /tmp/bug006-d16-proof/offending.payload.json — the rest of the brief still publishes
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
DROP_MODE_EXIT=0
surviving actions: 4
  [0] hold/structural
  [1] hold/swing
  [2] rotate/swing
  [3] hold/swing
```

One unscoreable claim withheld; four scoreable calls and the whole brief survive.

### E-B5 — Regression Sweep

**Claim Source: `executed`.**

| Command | Result |
|---|---|
| `node scripts/selftest.mjs` | `1218 passed, 0 failed` — exit `0`, identical to the pre-change baseline |
| `node --test tests/brief-d16-direction-aware-publish-gate.test.mjs` | `tests 10 / pass 10 / fail 0` — exit `0` |
| `node --test tests/brief-refresh-atomicity.test.mjs` | `tests 26 / pass 26 / fail 0` (exercises the wrapper with the new flag) |
| `bash -n scripts/brief-refresh-and-push.sh` | exit `0` |
| `shellcheck scripts/brief-refresh-and-push.sh` | exit `0` |
| `node --check` on both modified `.mjs` files | exit `0` each |
| `node scripts/validate-node-source-lock.mjs` | `OK adversarial=16 unexpectedAcceptances=0` — exit `0` |

### E-B6 — Honest Gaps And Pre-Existing Reds

**Claim Source: `executed` for the observations, `interpreted` for the attribution.**

- **`tests/feature-004-dirty-tree-collision.test.mjs` is RED, and was RED before
  this change.** Baseline and post-change runs are **byte-identical**: the same
  3 tests fail on the same assertion (`post-commit v10 requiredRecords[9]
  commits the complete ordered full record`) with the same actual/expected
  hashes. Index 9 of `REQUIRED_SCOPE_ONE_PATHS` is `scripts/selftest.mjs`, which
  a **concurrent session** is editing. This change introduced no new failure
  there and did not touch that test or any `specs/004-*` artifact.
- **Tests were placed in a new standalone file, not in `scripts/selftest.mjs`**
  as the Scope 2 Test Plan proposed. `scripts/selftest.mjs` is the exact path the
  concurrent session is mutating and is pinned by the Feature 004 identity
  ledger; adding to it would have collided with in-flight foreign work. The
  deviation is recorded rather than hidden.
- **The append-only ledger is untouched.** No partition, index, pointer, or
  brief artifact under `briefs/` was read-modified-written. `market-brief.payload.json`
  was **not** modified — every gate demonstration ran against copies under
  `/tmp/bug006-d16-proof/`.
- **The already-published unscoreable row stands.** The ledger cannot be
  retro-scored (FR-006-006); this change prevents the **next** one.
- **Defect A is still open**, and so is A2. `planEvaluation` will still fall one
  evaluation behind whenever a publish mints an on-sight-closable call. The gate
  added here removes the most common **source** of such calls, which makes the
  `selftest` idempotence assertion far less likely to trip, but it does **not**
  fix the ordering and must not be read as doing so.
- **`docs/Improvement-Plan.md` D16 wording (R5) was not updated.** It is an
  owner-authored surface. The gate now enforces more than that document states.

## Observation Only — The Named Assertion Is Green At One Commit (2026-08-24)

This section adds no fix, lifts no block, ticks no Definition of Done item and changes no
status. `DO-NOT-FIX` is an operator constraint, and the condition behind it is still live:
the scheduled pipeline wrote this surface four times on the day of this observation
(`ffd8e02af` 08:00, `adbfc86bb` 11:21, `b2f97b6c3` 14:56, `6e60f8590` 17:27 EDT). Nothing
here authorises an edit.

`## Summary` opens by recording `node scripts/selftest.mjs` as **RED on `origin/main`** with
one named failing assertion. Measured against a clean `origin/main` worktree at `31aad20d4`:

```text
Command: node scripts/selftest.mjs
Research-Lab self-test: 3409 passed, 0 failed
Exit Code: 0
✗ FAIL lines: 0
✓ the evaluator is idempotent against the committed ledger — a re-run closes nothing twice
```

**This confirms the prediction directly above rather than overturning it.** That note states
the Defect B gate removes the most common *source* of unscoreable calls, making the idempotence
assertion "far less likely to trip", while explicitly not fixing the ordering. A green
assertion is the predicted consequence of a removed source, not evidence of a repaired
ordering, and must not be read as the latter.

Two limits bound what this observation can support. The assertion reads the **committed
ledger**, whose content the pipeline rewrites eight times a day, so its outcome is a function
of ledger state at the moment of the run — green here means it does not reproduce **at this
commit**, not that it cannot recur. And an assertion passing is not the same as the invariant
holding; Defect A is an ordering defect, and no ordering was inspected by this run.

What the owner may take from this: the specific symptom recorded in `## Summary` no longer
reproduces on the current tip. Whether that is sufficient to revisit the `blocked` status is
an owner decision, and deliberately not taken here.
