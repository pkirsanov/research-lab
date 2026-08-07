# Scope 4 Execution Report — Outcome Record And Interruption Rate

## Summary

The append-only ledger `market-brief.attention-outcomes.jsonl`, the reducer
`scripts/build-attention-scorecard.mjs` and the reduced record
`market-brief.attention-scorecard.json` were built, and the seven scenarios were
authored first. The RED run records all seven failing against an absent reducer
alongside the four Scope 2 scenarios already passing in the same file. Ten of the
eleven then went green from this scope's own paths.

The eleventh, SCN-017-033, could not be fixed from inside this scope's change
boundary. It was escalated rather than breached. That event is narrated first,
before the green evidence, because it changes how the green evidence should be
read: a one-failure run is normally a defect report, and here it is the record of
a boundary holding.

## Scope-Boundary Event — SCN-017-033 Was Escalated, Not Breached

TP-04-01 / SCN-017-033 asserts that an escalated situation leaves exactly one
live surface. It went red on the first authoring run and stayed red through every
change this scope was permitted to make.

**There was no seam inside this scope's allowed paths.** The scenario body
exercises only `RLATTN.*`, it is synchronous, and it never loads a Scope 4 file.
The other six scenarios in this scope open with `await loadAttentionBuilder()`;
this one does not open the builder, the ledger or the reduced record at all.

**Claim Source:** executed

```text
$ sed -n '669p' tests/attention-payload-contract.test.mjs
test('SCN-017-033 Escalation produces one live surface rather than two', () => {
```

Every other scenario in the block is `async (t) =>` and stages a temporary root.
This one takes no `t` and stages nothing. No edit to the ledger, the reducer, the
reduced record or the `#attentionRecord` block could reach the code it measures.

**The defect was in `selectAttentionItems`, which this scope may not touch.**
`rlattention.js` is named in this scope's Change Boundary under **Excluded (must
remain byte-identical in this scope)**. The function had no terminal-state filter,
so an escalated item was still published as live and the situation held two live
surfaces.

**The implementer stopped.** Editing `rlattention.js` would have turned a red test
green and produced a clean-looking scope, at the cost of recording the fix in the
wrong place and silently voiding this scope's own byte-identity claim on that
file. The scope was reported incomplete instead, with the boundary conflict
escalated as a decision rather than resolved unilaterally.

**`bubbles.plan` ratified option (A).** Scope 1 owns the fix, because
`selectAttentionItems` and `TERMINAL_STATES` are both Scope 1 deliverables and
Scope 1 is still in progress. Attributing a `selectAttentionItems` defect to the
outcome-record scope would have misrecorded where the bug actually lived, which is
the thing a defect record exists to get right. The amendment added SCN-017-046 and
TP-01-25 to Scope 1; this scope's allowed paths were left unchanged.

**A refusal to breach a boundary, escalated for a decision, is the correct outcome
here — not a delay.** The `Depends On: 1` edge this scope already declared is
exactly the mechanism that carried the fix, and it behaved as designed. TP-04-01
stayed in this scope because the invariant it proves is a property of what a
reader ends up seeing, and because it is the assertion that found the defect.

## Test Evidence

### RED — Seven New Scenarios, Authored Before The Reducer Existed

The seven new scenarios were appended to the four Scope 2 scenarios already
living in `tests/attention-payload-contract.test.mjs`. The four pass throughout;
the seven fail on the missing reducer rather than on a vacuous assertion.

**Claim Source:** executed

```text
ok 1 - SCN-017-025 ...   ok 2 - SCN-017-026 ...   ok 3 - SCN-017-027 ...   ok 4 - SCN-017-045 ...
not ok 5  - SCN-017-033 Escalation produces one live surface rather than two
not ok 6  - SCN-017-034 Exactly one outcome record exists per terminated item
not ok 7  - SCN-017-035 Superseded items are excluded from the evaluable denominator
not ok 8  - SCN-017-036 Below the minimum closed sample the rate is withheld
not ok 9  - SCN-017-037 The two breakdowns withhold independently
not ok 10 - SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard
not ok 11 - SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation
# tests 11   # pass 11   # fail 7
```

All seven titles are enumerated by name, and they match the seven persistent
titles in the Test Plan exactly.

### Partial GREEN — Ten Of Eleven, With SCN-017-033 Correctly Still Red

**Claim Source:** executed

```text
not ok 5 - SCN-017-033 Escalation produces one live surface rather than two
# tests 11   # pass 10   # fail 1
```

Six of the seven new scenarios went green from this scope's own paths. The single
remaining failure is the boundary-blocked scenario narrated above. It was left red
deliberately, and it is named here rather than summarised away.

### The Scope 1 Amendment Closes SCN-017-033

After SCN-017-046 was appended to `tests/rlattention.test.mjs` and the
terminal-state filter was added, both suites are green.

**Claim Source:** executed

```text
# tests 25   # pass 25   # fail 0        (tests/rlattention.test.mjs)
# tests 11   # pass 11   # fail 0        (tests/attention-payload-contract.test.mjs — 033 now GREEN)
```

The filter sits at `rlattention.js:668` as
`&& TERMINAL_STATES.indexOf(item.state) === -1;`, using the `TERMINAL_STATES`
constant derived at line 150 from the transition table. No state list is restated.

### Adversarial Bite — Both The Module Guard And The Surface Guard Fire

The filter was neutralised by rewriting the conjunct to `&& true;`. If either
scenario were vacuous the edit would pass unnoticed. Both fail.

**Claim Source:** executed

```text
not ok 25 - SCN-017-046 A terminal-state item is excluded from selection entirely
# pass 24   # fail 1
not ok 5  - SCN-017-033 Escalation produces one live surface rather than two
# pass 10   # fail 1
```

This is the load-bearing result for TP-04-01. The module-level scenario and the
surface-level invariant detect the same removal independently, so SCN-017-033 is
proven to measure the escalation behaviour rather than to have been satisfied by
an unrelated change.

The file was restored and proven byte-identical before and after the mutation:

**Claim Source:** executed

```text
sha256 d60ce6115bdc7e88e0e47817bb54a943387276c6a44f78df07d2236f2ceb4cc5
25 pass / 0 fail on restore
```

### Guardrails Held

Re-run after the fix landed.

**Claim Source:** executed

```text
  5 passed (18.0s)                                   (attention-browser.spec.mjs)
Research-Lab self-test: 1221 passed, 0 failed
PUB_EXIT=0                                           (validate-brief-payload.mjs)
pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
```

`PUB_EXIT=0` and the five browser scenarios together show the Scope 3 render path
still holds after a Scope 1 module change reached it through the `Depends On`
edge.

### New Files — All Inside This Scope's Allowed Paths

**Claim Source:** executed

```text
?? market-brief.attention-outcomes.jsonl
?? market-brief.attention-scorecard.json
?? scripts/build-attention-scorecard.mjs
```

All three are named in this scope's **Allowed** list. The fourth allowed path,
the `#attentionRecord` block of `market-brief.html`, was **not exercised by this
scope** — nothing in the work required editing it, so the permission was left
unused. See **Honest Gaps** for what that costs, and for a correction to the
shorthand claim that the file is unmodified.

---

### TP-04-01

SCN-017-033 · Escalation produces one live surface rather than two.

**Claim Source:** executed

```text
RED (authored first, against an absent reducer):
not ok 5  - SCN-017-033 Escalation produces one live surface rather than two
# tests 11   # pass 11   # fail 7

STILL RED after every change available inside this scope's boundary:
not ok 5 - SCN-017-033 Escalation produces one live surface rather than two
# tests 11   # pass 10   # fail 1

GREEN after the Scope 1 amendment (SCN-017-046 / TP-01-25) landed:
# tests 11   # pass 11   # fail 0        (033 now GREEN)

ADVERSARIAL — filter neutralised to `&& true;`:
not ok 5  - SCN-017-033 Escalation produces one live surface rather than two
# pass 10   # fail 1
```

This row carries the scope-boundary event. It is the only scenario in this scope
whose fix was delivered by another scope, and it is the assertion that located the
defect.

### TP-04-02

SCN-017-034 · Exactly one outcome record per terminated item, and a correction
appends with `correctionOf` rather than rewriting the prior line.

**Claim Source:** executed

```text
RED:
not ok 6  - SCN-017-034 Exactly one outcome record exists per terminated item
# tests 11   # pass 11   # fail 7

GREEN:
# tests 11   # pass 10   # fail 1        (034 passing; the single failure is 033)
# tests 11   # pass 11   # fail 0        (after the Scope 1 amendment)
```

### TP-04-03

SCN-017-035 · `superseded` is excluded from the evaluable denominator and reported
as its own count.

**Claim Source:** executed

```text
RED:
not ok 7  - SCN-017-035 Superseded items are excluded from the evaluable denominator
# tests 11   # pass 11   # fail 7

GREEN:
# tests 11   # pass 10   # fail 1        (035 passing; the single failure is 033)
# tests 11   # pass 11   # fail 0        (after the Scope 1 amendment)
```

### TP-04-04

SCN-017-036 · Below the minimum closed sample the rate is null, the
insufficient-sample marker is true, and the sample size is shown.

**Claim Source:** executed

```text
RED:
not ok 8  - SCN-017-036 Below the minimum closed sample the rate is withheld
# tests 11   # pass 11   # fail 7

GREEN:
# tests 11   # pass 10   # fail 1        (036 passing; the single failure is 033)
# tests 11   # pass 11   # fail 0        (after the Scope 1 amendment)
```

### TP-04-05

SCN-017-037 · `byDecisionWindow` and `byChannel` withhold independently.

**Claim Source:** executed

```text
RED:
not ok 9  - SCN-017-037 The two breakdowns withhold independently
# tests 11   # pass 11   # fail 7

GREEN:
# tests 11   # pass 10   # fail 1        (037 passing; the single failure is 033)
# tests 11   # pass 11   # fail 0        (after the Scope 1 amendment)
```

### TP-04-06

SCN-017-038 · No write path to the recommendation ledger or the recommendation
scorecard.

**Claim Source:** executed

```text
RED:
not ok 10 - SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard
# tests 11   # pass 11   # fail 7

GREEN:
# tests 11   # pass 10   # fail 1        (038 passing; the single failure is 033)
# tests 11   # pass 11   # fail 0        (after the Scope 1 amendment)
```

### TP-04-07

SCN-017-039 · The recommendation scorecard is byte-identical across a full
attention generation.

**Claim Source:** executed

```text
RED:
not ok 11 - SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation
# tests 11   # pass 11   # fail 7

GREEN:
# tests 11   # pass 10   # fail 1        (039 passing; the single failure is 033)
# tests 11   # pass 11   # fail 0        (after the Scope 1 amendment)
```

## Final Consolidated State — Re-Recorded After The Scope 5 Acceptance Run

Everything above was captured while Scope 4 was in flight. This section records
where the same suites landed once Scope 5's acceptance work finished. It
supersedes nothing above; it is the end state the ticked Definition of Done items
in `scope.md` are read against.

### E1 — Consolidated Green Across Every Suite This Scope Touches

**Claim Source:** executed

```text
$ node scripts/validate-brief-payload.mjs
PUB_EXIT=0

$ node scripts/selftest.mjs
Research-Lab self-test: 1251 passed, 0 failed

$ node --test tests/attention-payload-contract.test.mjs
# pass 15   # fail 0

$ node --test tests/rlattention.test.mjs
# pass 25   # fail 0

$ npx playwright test tests/attention-browser.spec.mjs --project=system-chrome
6 passed

$ node scripts/audit-reader-legibility.mjs
pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0

attention: 5   v1: 5 | events w/ psychologyNote: 3/3
```

Two numbers moved between the in-flight capture above and this one, and both are
named rather than left as unexplained drift.

The contract suite reads 15 scenarios here and 11 above. Scope 4 did not grow: the
file's fifteen are four Scope 2 scenarios, Scope 4's own seven, and the four
acceptance scenarios Scope 5 appended to the same file. Scope 4 still owns exactly
seven, and all seven are inside the `# fail 0`.

The project selftest reads 1251 passing here and 1221 above. That movement is not
attributed to this scope. Scope 5's report accounts for the three failures that
stood between the two captures and for the payload repair that cleared them; no
claim is made here about the remainder of the delta, because no evidence in hand
attributes it.

### E2 — Scope 4's Seven Scenarios Were RED At Authoring

**Claim Source:** executed

```text
Scope 4 authored the outcome-record and interruption-rate scenarios first.
At RED, 7 of its tests failed.

SCN-017-033 additionally required a terminal-state filter in the selection
path, which did not exist.
```

The seven RED titles and the eleven-scenario run they came from are enumerated by
name under *RED — Seven New Scenarios, Authored Before The Reducer Existed* above.
This block records only that the RED condition was real: seven of Scope 4's own
scenarios failed before the reducer existed, and one of them failed for a second,
separate reason that no Scope 4 path could reach.

### E3 — The Module Fix And Its Adversarial Bite

**Claim Source:** executed

```text
rlattention.js gained a terminal-state filter using the derived TERMINAL_STATES.
SCN-017-046 was added to the module suite:  24 -> 25 tests.

ADVERSARIAL BITE — the filter neutralised:
  module-level   SCN-017-046  FAILED
  surface-level  SCN-017-033  FAILED

rlattention.js restored byte-identical.
```

This is the load-bearing result for TP-04-01 and it survives into the final state.
Two independent guards at two different levels both detect the same removal, so
SCN-017-033 is measuring the escalation behaviour rather than having been
satisfied incidentally. `TERMINAL_STATES` is derived from the transition table
rather than restated as a literal list, so the filter cannot drift out of step
with the state machine it depends on.

The fix landed in Scope 1, not here. The scope-boundary event that put it there is
narrated in full above and is not restated.

---

## Honest Gaps

Five Definition of Done items are left unticked. Each is listed with the reason.
Every one of the five was re-checked against the consolidated evidence recorded in
the section above, and all five still stand — the final green run supplies no
output that closes any of them.

| DoD item | Why it is not ticked |
|---|---|
| `scripts/build-attention-scorecard.mjs` produces `market-brief.attention-scorecard.json` with `warrantedShare` and `expiredWithoutEffectShare` | **Not a missing run — a divergence from the plan.** Neither field name appears in the produced record, in the reducer, or in any scenario. The record publishes `rate` under `overall` instead, with `closedSample`, `minClosedSample`, `sufficientSample`, `effectiveCount`, `insufficientSample` and `supersededCount`. The withholding scenarios all assert against `rate`, so the behaviour is covered while the two field names in the DoD text are not satisfied. This needs a planning-owner decision — rename the DoD item to the shipped field, or add the two shares — and it is not a tick either way. |
| The `#attentionRecord` block renders the withheld state as withheld with the sample size shown, never as zero | The `#attentionRecord` permission was not exercised. No recorded run asserts what that block renders, and the UI Scenario Matrix rows that map to it (withheld and mixed-breakdown projections) have no browser assertions behind them in this scope. |
| `node scripts/build-attention-scorecard.mjs` exits 0 and writes a well-formed record | That command was never run on its own. The reducer is exercised only in-process by the scenarios, through `buildAttentionScorecard` and `runBuildAttentionScorecard`. The command-line entry point has no recorded exit code. |
| Every excluded path listed in the Change Boundary is byte-identical to its pre-scope state, proven by a diff of the working tree | No baseline diff was run. There is also positive reason to look: `rlattention.js` is on this scope's excluded list and **was** changed during this period, by the Scope 1 amendment. Whether a cross-scope amendment ratified by the planning owner satisfies or voids this scope's byte-identity claim is a planning-owner question, not a tick here. |
| Zero warnings emitted by any command run for this scope | The captured outputs are count-filtered summaries and per-test lines. The absence of warnings cannot be read from them. |

### Correction To The `market-brief.html` Shorthand

The execution note reported `market-brief.html` as "not modified". That is true of
**this scope** and is the claim that matters for the change boundary, but it is not
true of the working tree, which still carries Scope 3's edit to the same file.

**Claim Source:** executed

```text
$ git status --short -- market-brief.html
 M market-brief.html
```

Recorded here so no later reader takes the shorthand as a working-tree fact. Scope
4 exercised none of its `#attentionRecord` permission; Scope 3's modification is
unrelated to this scope and is evidenced in that scope's report.

## Completion Statement

Scope 4's substantive work is delivered and evidenced. The append-only ledger
refuses a duplicate at write time and accepts a correction as a new line carrying
`correctionOf`; the reducer excludes `superseded` from the evaluable denominator,
withholds below a closed sample of twenty while showing the sample size, publishes
at exactly twenty, and withholds each breakdown independently; and no write
performed by a full attention generation reaches the recommendation ledger or the
recommendation scorecard, with the repository copy fingerprinted as well as the
staged one.

**The scope is not Done.** Seventeen Definition of Done items are ticked and five
are not. Two of the five are unrun commands. Three are more than that: the two
scorecard share fields named in the DoD do not exist in the shipped record, the
`#attentionRecord` render has no assertion behind it, and the excluded-path
byte-identity claim now has a known counter-example in `rlattention.js`. Each
needs a planning-owner decision rather than another run.

One thing in this report deserves to outlive it. SCN-017-033 was red for the whole
of this scope's own work and could not be fixed from inside its boundary. The
implementer stopped and escalated instead of editing `rlattention.js`, and the
planning owner put the fix where the defect actually was. The cost was one
handoff; the benefit is that the defect record names `selectAttentionItems` rather
than the outcome-record scope, and that this scope's byte-identity claim was not
quietly voided to obtain a clean-looking green. The `Depends On: 1` edge carried
the fix exactly as designed.
