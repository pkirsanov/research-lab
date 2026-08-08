# Feature 017 Execution Report

This report is a structural template created during planning. It records no results yet. Every section below is an empty anchor that an execution agent fills with raw terminal output captured in the session that produced it. Nothing in this file may be written from expectation, inference, or summary; each anchor stays empty until a real command has run and its unedited output has been pasted under that anchor.

## Summary

_Awaiting execution. No evidence recorded yet._

## Completion Statement

_Awaiting execution. No scope is complete._

## Decision Record

Four decisions changed the shape of this feature. Each is recorded where it was
taken; this is the index.

| Decision | What changed | Why |
|----------|--------------|-----|
| **F-017-06 — route the lane through the composer** | The authoring lane authors JUDGEMENT only; the envelope is composed at publish time by `scripts/build-attention-items.mjs`. | Three consecutive crons published zero conforming items while enforcement was fully intact. A prose instruction to a language model is advisory; a lane that no longer emits the envelope cannot emit a bad one. |
| **Both sides of the interruption rate** | `computeInterruptionRate` publishes `warrantedShare` AND `expiredWithoutEffectShare`, withheld together below the minimum sample. | Publishing the hit side without its complement is exactly the asymmetry P4/BI-5 forbids. The fields were added rather than the DoD renamed. |
| **Refusals name the item, not the slot** | `attentionItemLabel()` puts the item's id and subject between the slot index and the field. | An index moves the moment the list is re-ranked, so a slot-only refusal is unactionable by the time anyone reads it. |
| **Byte-identity narrowed to what a scope can own** | Each scope asserts that IT modified no excluded path, and that paths it protects from ANOTHER owner are byte-identical. | The blanket form is unsatisfiable while sibling scopes inside one feature legitimately modify paths on each other's excluded lists. Scope isolation forbids reaching outside your own paths; it does not freeze the feature around you. |

## Code Diff Evidence

### Code Diff Evidence — spec 017 runtime delta

**Claim Source:** executed.

```text
$ git --no-pager diff --stat c0c7d34c..HEAD -- rlattention.js \
    scripts/build-attention-items.mjs scripts/validate-brief-payload.mjs \
    scripts/brief-narrative-parallel.mjs scripts/brief-refresh-and-push.sh \
    scripts/selftest.mjs market-brief.html tests/rlattention.test.mjs \
    tests/attention-payload-contract.test.mjs tests/attention-browser.spec.mjs \
    tests/brief-refresh-atomicity.support.mjs notes/decision-attention.md \
    notes/market-brief.md
 market-brief.html                         |  557 ++++++-
 notes/decision-attention.md               |  395 +++++
 notes/market-brief.md                     |   22 +
 rlattention.js                            |  916 +++++++++++
 scripts/brief-narrative-parallel.mjs      |    9 +-
 scripts/brief-refresh-and-push.sh         |   18 +
 scripts/build-attention-items.mjs         |  281 ++++
 scripts/selftest.mjs                      |  199 ++-
 scripts/validate-brief-payload.mjs        |  129 +-
 tests/attention-browser.spec.mjs          | 1203 ++++++++++++++
 tests/attention-payload-contract.test.mjs | 2430 +++++++++++++++++++++++++++++
 tests/brief-refresh-atomicity.support.mjs |   59 +-
 tests/rlattention.test.mjs                | 1076 +++++++++++++
 13 files changed, 7262 insertions(+), 32 deletions(-)
```

Three numbers in that table carry the argument.

**`rlattention.js` +916 against `scripts/validate-brief-payload.mjs` +129.** The
capability module is where the rules live; the gate is thin because it `require`s
the module and calls it. Had the gate restated the rules, the two files would be
comparable in size and would drift the first time either changed.

**`scripts/brief-refresh-and-push.sh` +18.** The smallest diff in the set and the
one without which none of the rest is load-bearing. It is the line that makes the
composer run on the publication path. Before it, `build-attention-items.mjs` was
written, tested and registered with the selftest while nothing invoked it — an
orphaned build step, which is a file rather than a guarantee.

**Tests +4709 against implementation +2013.** Roughly 2.3 lines of test per line
of implementation. That ratio is not padding: the module's contract is almost
entirely about what it REFUSES, and every refusal code needs a scenario that
proves the refusal fires and an adversarial twin that proves the guard can fail.

Only 32 lines were deleted across the whole delivery, and `git diff --numstat`
over the six scope artifacts reports 0 deletions — this feature was built
additively on top of the existing brief rather than by rewriting it.

## Test Evidence

### Scope 1 — Attention Capability Module And Item Contract

**TP-01-01**

_Awaiting execution. No evidence recorded yet._

**TP-01-02**

_Awaiting execution. No evidence recorded yet._

**TP-01-03**

_Awaiting execution. No evidence recorded yet._

**TP-01-04**

_Awaiting execution. No evidence recorded yet._

**TP-01-05**

_Awaiting execution. No evidence recorded yet._

**TP-01-06**

_Awaiting execution. No evidence recorded yet._

**TP-01-07**

_Awaiting execution. No evidence recorded yet._

**TP-01-08**

_Awaiting execution. No evidence recorded yet._

**TP-01-09**

_Awaiting execution. No evidence recorded yet._

**TP-01-10**

_Awaiting execution. No evidence recorded yet._

**TP-01-11**

_Awaiting execution. No evidence recorded yet._

**TP-01-12**

_Awaiting execution. No evidence recorded yet._

**TP-01-13**

_Awaiting execution. No evidence recorded yet._

**TP-01-14**

_Awaiting execution. No evidence recorded yet._

**TP-01-15**

_Awaiting execution. No evidence recorded yet._

**TP-01-16**

_Awaiting execution. No evidence recorded yet._

**TP-01-17**

_Awaiting execution. No evidence recorded yet._

**TP-01-18**

_Awaiting execution. No evidence recorded yet._

**TP-01-19**

_Awaiting execution. No evidence recorded yet._

**TP-01-20**

_Awaiting execution. No evidence recorded yet._

**TP-01-21**

_Awaiting execution. No evidence recorded yet._

**TP-01-22**

_Awaiting execution. No evidence recorded yet._

**TP-01-23**

_Awaiting execution. No evidence recorded yet._

**TP-01-24**

_Awaiting execution. No evidence recorded yet._

**TP-01-25**

_Awaiting execution. No evidence recorded yet._

### Scope 2 — Publication-Path Enforcement

**TP-02-01**

_Awaiting execution. No evidence recorded yet._

**TP-02-02**

_Awaiting execution. No evidence recorded yet._

**TP-02-03**

_Awaiting execution. No evidence recorded yet._

### Scope 3 — Brief Tier Render

**TP-03-01**

_Awaiting execution. No evidence recorded yet._

**TP-03-02**

_Awaiting execution. No evidence recorded yet._

**TP-03-03**

_Awaiting execution. No evidence recorded yet._

**TP-03-04**

_Awaiting execution. No evidence recorded yet._

**TP-03-05**

_Awaiting execution. No evidence recorded yet._

### Scope 4 — Outcome Record And Interruption Rate

**TP-04-01**

_Awaiting execution. No evidence recorded yet._

**TP-04-02**

_Awaiting execution. No evidence recorded yet._

**TP-04-03**

_Awaiting execution. No evidence recorded yet._

**TP-04-04**

_Awaiting execution. No evidence recorded yet._

**TP-04-05**

_Awaiting execution. No evidence recorded yet._

**TP-04-06**

_Awaiting execution. No evidence recorded yet._

**TP-04-07**

_Awaiting execution. No evidence recorded yet._

### Scope 5 — Legacy Feed Reconciliation And Acceptance

**TP-05-01**

_Awaiting execution. No evidence recorded yet._

**TP-05-02**

_Awaiting execution. No evidence recorded yet._

**TP-05-03**

_Awaiting execution. No evidence recorded yet._

**TP-05-04**

_Awaiting execution. No evidence recorded yet._

**TP-05-05**

_Awaiting execution. No evidence recorded yet._

## Uncertainty Declarations

_Awaiting execution. No evidence recorded yet._

## Scenario Contract Evidence

_Awaiting execution. No evidence recorded yet._

## Coverage Report

_Awaiting execution. No evidence recorded yet._

## Lint/Quality

_Awaiting execution. No evidence recorded yet._

## Validation Summary

_Awaiting execution. No evidence recorded yet._

## Audit Verdict

**REWORK_REQUIRED** · profile `delivery-completion-v1` · attempt `AUD-017-001` ·
`bubbles.audit` · 2026-08-08T16:31:52Z

The delivered feature is sound. I re-ran every gate rather than reading this
packet's account of them, and every implementation claim I could falsify held.
What fails is the **execution record**, not the code: ten phase entries state
times the commits they cite prove wrong, two of them describe another feature's
test file under an identifier this feature already uses for something else, and
this rollup still declares itself unexecuted while the packet claims completion.

### What I executed myself

| Command | Exit | Observed |
|---|---|---|
| `node scripts/selftest.mjs` | 0 | `1273 passed, 0 failed` |
| `node scripts/validate-brief-payload.mjs` | 0 | `[brief-contract] PASS` |
| `node --test tests/rlattention.test.mjs tests/attention-payload-contract.test.mjs` | 0 | `pass 54 · fail 0` |
| `node --test tests/brief-refresh-atomicity.test.mjs` | 1 | `pass 18 · fail 8` — D19 confirmed environmental |
| `artifact-lint.sh specs/017-…` | 0 | `Artifact lint PASSED` |
| `state-transition-guard.sh specs/017-… --target-status done` | 1 | `failedGateIds: [G022]` · `failedChecks: []` |
| `regression-quality-guard.sh tests/attention-browser.spec.mjs` | 0 | `0 violation(s), 0 warning(s)` |
| skip-marker scan, 3 spec-017 suites | 1 | zero matches |
| non-comment interception scan, `tests/attention-browser.spec.mjs` | 1 | zero matches — the e2e-ui proof is genuinely live-stack |

### Claims I tried to falsify and could not

`refuse()` returns exactly `{ok, code, field, message}` (`rlattention.js:196`), so
a refusal cannot itself leak the value it refused. `isFiniteNumber` guards
`typeof` before `isFinite` (`:193`). The composer resolves `RLATTN-PRIVACY` out of
the module's frozen `REFUSAL_CODES` and **throws** if it is absent
(`build-attention-items.mjs:129-134`), so a rename upstream stops the composer
instead of silently disabling redaction. The runbook names the composer at step
3b, and that text is committed. The three cited commits `04060d09`, `53223f1c`,
`0ea271e7` exist with diffs matching their descriptions.

**F-017-06's residual is stated accurately, and I checked it rather than took it.**
The literal survives only as a fallback behind the published read
(`market-brief.html:1421-1425`), `ATTENTION_RECORD` is genuinely fetched from
`market-brief.attention-scorecard.json` (`:1544`, index 7), and that artifact does
reduce to `closedSample: 0` with `rate: null`. So the browser row would indeed
still pass against the defect. The finding says so in its own words. That is the
standard the rest of this record should have met.

**D19 holds.** Seven of the eight failures assert
`data/bars/index.json expectedSessionDate must equal 2026-08-07`. The eighth
(`reports a rejected final push as a failed run`) refuses earlier —
`current-window data refresh is incomplete — refusing before tool briefs`,
`exit=1` — so it never reaches the push assertion. Same cause, one step
downstream. Environmental, not a code defect. Nothing was weakened to hide it.

### Findings

**A-017-01 · BLOCKING · the ten parent-expanded records carry times that cannot be true.**
All ten have `startedAt == completedAt` on an exact 600-second grid — 00:00,
00:10, 00:20 … 01:30. The commits they offer as their own evidence were authored
roughly fifteen and a half hours later: `stabilize` records `00:10:00Z` and cites
`04060d09` (authored `15:52:35Z`); `gaps` records `00:30:00Z` and cites `53223f1c`
(`16:02:49Z`); `simplify` records `00:40:00Z` and cites `0ea271e7` (`16:07:20Z`).
The commit that wrote these records, `d7d3c362`, is `16:10:43Z`. A phase cannot
finish before the commit it points at. The work is real — I read all three diffs
— but the times are synthetic. This is the exact pattern the anti-fabrication
heuristics name, and the guard check that exists to catch it, Check 7A, skipped
itself on the false premise that `executionHistory` has fewer than three entries.
It has fourteen. Owner: `bubbles.workflow`. Record the real times, or record the
field as unknown; do not state a time that the tree disproves.

**A-017-02 · BLOCKING · `stabilize` and `chaos` describe another feature's test under a colliding identifier.**
Spec 017's own TP-03-06 is `tests/attention-browser.spec.mjs`
(`scopes/03-brief-tier-render/scope.md:186`). The `stabilize` record says
"TP-03-06 opens a fresh browser context per fault arm", and its history summary
names `portfolio-survival-foundation.spec.mjs TP-03-06`; `04060d09` modified that
file and no spec-017 surface. The `chaos` record's seven-arm storage-fault matrix
lives in the same foreign file. Neither file appears in any spec-017 Test Plan.
The work was plausibly a prerequisite for the full-suite green this packet leans
on, but filing it under this feature's own TP-03-06 leads a reader to conclude
spec 017's TP-03-06 was the flaky test. It was not. Owner: `bubbles.workflow`.
Name the foreign identifier and file explicitly and record it as a prerequisite.

**A-017-03 · BLOCKING · this rollup still declares itself unexecuted.**
Line 3 reads "It records no results yet." `## Summary` and `## Completion
Statement` are still `_Awaiting execution_`, as are all fifty-three placeholder
anchors including Coverage Report, Lint/Quality and Validation Summary. The
per-scope reports carry the real evidence and the guard confirms all 178 checked
DoD items have evidence blocks, so this is a rollup defect and not missing proof
— but a `done` certification against a report whose own Completion Statement says
"No scope is complete" contradicts itself on its face. Artifact lint passes it
because that lint asserts the section exists, not that it says anything.

**A-017-04 · NON-BLOCKING · a committed privacy fix's regression test is uncommitted.**
`fa6f3d68` ships the fix that stops recording the offending value on a privacy
refusal. Its test, `SCN-017-062 A privacy refusal never prints the offending
value to stdout`, is one of five uncommitted working-tree files. HEAD declares 26
tests in that file; the working tree declares 27. **My 54/54 therefore measured
the working tree — the committed packet is 53.** Push HEAD as it stands and the
privacy fix ships without the test that proves it. I did not touch these files;
they may belong to a concurrent session.

**A-017-05 · INFORMATIONAL · this attempt does not clear G022 by itself.**
Check 6 blocks eleven phases because `certification.certifiedCompletedPhases`
holds only `validate`, while Check 6B separately passes all ten parent-expanded
provenance records. The guard accepts the disclosure and still demands
certification, which is validate-owned. This attempt supplies the
`independent-audit` input validate recorded as missing. It does not write
certification, and it must not.

### Spot-Check Recommendations

Verify these yourself; a confident audit is still an audit.

1. **The ten phase timestamps (A-017-01).** Compare
   `execution.completedPhaseClaims[].claimedAt` against
   `git log --format='%h %ad %s' --date=iso` for `04060d09`, `53223f1c`,
   `0ea271e7`. Confirm the ordering is impossible before accepting any narrative
   built on those records.
2. **Whose TP-03-06 (A-017-02).** Read
   `scopes/03-brief-tier-render/scope.md:186`, then `git show --stat 04060d09`.
   Confirm they name different files.
3. **The uncommitted test (A-017-04).** Run `git status --porcelain` and
   `git show HEAD:tests/attention-payload-contract.test.mjs | grep -c '^test('`.
   Decide whether HEAD may ship without `SCN-017-062`.
4. **F-017-06's residual.** Confirm `market-brief.attention-scorecard.json` still
   reports `closedSample: 0`. The browser row's non-adversarial status depends on
   that value and stops being true the moment the ledger fills.
5. **The eighth D19 failure.** It fails on a different assertion from the other
   seven. Satisfy yourself that `current-window data refresh is incomplete` is
   the same clock condition and not a second defect sheltering behind it.
6. **Scope 04's evidence.** The guard warns 16 of 19 blocks lack terminal-output
   signals. I read them and judged the warning a short-block heuristic artifact —
   all 19 carry `Claim Source: executed` with real commands. That judgement is
   mine, not a measurement.

BEGIN AUDIT_RESULT_V1
schemaVersion: audit-result/v1
runId: RUN-017-AUDIT-20260808T163152Z
attemptId: AUD-017-001
target: specs/017-decision-attention-and-developing-situations
targetRevision: sha256:f9c0d69c402cf042f849e4795263a6e469170b58a05798ab85a7e2703a9aea67
workflowMode: full-delivery
modeClass: none
auditClass: delivery-completion
statusCeiling: done
requestedStatus: done
auditVerdict: REWORK_REQUIRED
outcome: route_required
resultState: ACTIVE
certifiedStatus: none
planningEvaluation: NOT_EVALUATED
deliveryEvaluation: REFUSED
sourceEditLockout: NOT_EVALUATED
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022]
failedChecks: [AUDIT-EXECUTION-RECORD-TIMESTAMPS,AUDIT-CLAIM-ATTRIBUTION,AUDIT-ROLLUP-REPORT-COHERENCE]
blockingCode: DELIVERY_COMPLETION_FAILED
unresolvedFields: []
contradictions: [executionHistory.stabilize.completedAt=2026-08-08T00:10:00Z vs commit-04060d09-authored=2026-08-08T15:52:35Z, executionHistory.gaps.completedAt=2026-08-08T00:30:00Z vs commit-53223f1c-authored=2026-08-08T16:02:49Z, executionHistory.simplify.completedAt=2026-08-08T00:40:00Z vs commit-0ea271e7-authored=2026-08-08T16:07:20Z, stabilize.claim.TP-03-06=portfolio-survival-foundation.spec.mjs vs spec017.TP-03-06=tests/attention-browser.spec.mjs, report.md.completionStatement=No scope is complete vs certification.completedScopes=6, guard.Check7A=executionHistory has fewer than 3 entries vs executionHistory.length=14, audit.node--test=54 vs HEAD.testDeclarations=53]
contractRef: bubbles/workflows/modes.yaml#full-delivery
contractDigest: sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93
evidenceRefs: [report.md#audit-verdict, scopes/04-outcome-record-and-interruption-rate/report.md, market-brief.html#L1421-L1425, rlattention.js#L193-L197, scripts/build-attention-items.mjs#L129-L134]
addressedFindings: [F-017-04]
unresolvedFindings: [F-017-06,A-017-01,A-017-02,A-017-03,A-017-04,A-017-05]
nextRequiredOwner: bubbles.workflow
supersedesAttemptId: none
resumeFromPhase: none
END AUDIT_RESULT_V1

## Open Findings

This section is created during Scope 3. It is the first finding ledger in this
feature directory: F-017-01 through F-017-03 are referenced by identifier in the
execution sessions but have no recorded entry here, so the numbering below is
inherited from those sessions rather than continued from a ledger.

### F-017-04 — Rank rationale renders a vacuous self-comparison when two items share a subject

**Status:** FIXED (verified 2026-08-08) · **Severity:** reader-facing correctness, not a crash ·
**Found during:** Scope 3 (`03-brief-tier-render`), reading the rendered page ·
**Owner:** `bubbles.design` for the rule, then `bubbles.plan` for the scope and
Test Plan row.

**Observed.** Verbatim from the rendered page during the Scope 3 run:

```text
QQQ is placed above QQQ because its effect is already arriving and a transmission channel is identified, while for QQQ its effect is already arriving and a transmission channel is identified.
```

**Why it is a defect.** The sentence compares an item to another item with the
same subject and gives identical reasoning on both sides, so it explains nothing.
A reader sees broken copy. It is literally true and completely useless, which is
worse than silence, because it spends the reader's trust to deliver no
information. The ranking rationale exists to tell a reader why one item outranks
another; here it asserts that `QQQ` outranks `QQQ` for reasons that are word-for-word
the same on both sides of the comparison.

**How it arose.** The migrated payload legitimately carries `QQQ` for two distinct
items. Read-only confirmation from the committed payload:

```text
$ python3 -c "import json; ..." market-brief.payload.json
items: 5
0 'QQQ' | Dealers flipped to negative gamma into the close while bread
1 'XLK' | XLK holds the clean into leg while XLI stays out and breadth
2 'QQQ' | The growth add-gate stays closed: QQQ holds only +0.21% over
3 'MSFT' | MSFT extended its post-print gap to +22.75% over its 50-day
4 'GLD' | Gold is still no clean haven at score 28.7 while copper lead
```

Item 0 is about 0-DTE dealer positioning and item 2 is about the breadth
add-gate. They are different situations that happen to share a ticker.
`validateAttentionItem` imposes no subject-uniqueness rule, so both items are
valid and correctly admitted. `rankRationale` then compares adjacent items
without checking whether the resulting comparison carries any information.

**Candidate resolutions — routing record only, do not implement from this entry.**

1. Suppress the comparison when both sides share a subject, or when both sides
   resolve to identical reasons.
2. Disambiguate by naming the angle rather than the ticker, so the two `QQQ`
   items are distinguished by what they are about.
3. Require subject uniqueness among ranked items, which changes what the payload
   is allowed to contain rather than how it is rendered.

These are materially different products, not three spellings of one fix. Option 3
in particular would reject a payload that is currently valid. Choosing among them
is a design decision and belongs to `bubbles.design`.

**Test coverage.** None. No scenario in this feature asserts anything about the
content of the rank rationale, and the five Scope 3 scenarios all pass with this
sentence on the page. A new scenario is needed before the defect can be fixed
under test, which is why this is routed to `bubbles.plan` after the design rule
is settled rather than being fixed inside Scope 3.

**Resolution (verified 2026-08-08).** Fixed in `rlattention.js::rankRationale`,
which now branches three ways instead of one. Option 1 was taken for the
identical-reason case and a narrower form of option 2 for the rest; option 3 was
correctly rejected, so a payload carrying two `QQQ` items remains valid:

| case | rendered form |
|---|---|
| distinct subjects | unchanged comparative sentence (the regression surface) |
| same subject, identical reasons | `X is placed here because R; the item below it stands on the same footing.` |
| same subject, differing reasons | `X is placed above a second X item because R1, while for the second R2.` |

The vacuous self-comparison is therefore unreachable: when the two sides carry
the same reasoning the sentence no longer pretends to compare them.

**The "Test coverage: None" paragraph above is superseded.** `rankRationale` is
part of the module's exported surface and the tail of `tests/rlattention.test.mjs`
now exercises all three branches. That suite asserts against clause constants
derived from production rather than against literal sentences, which is why a
grep for the rendered wording does not find it — the test survives a copy edit
and still fails on a behaviour change, which is the correct trade.

### F-017-06 — The rendered interruption rate is hardcoded to an empty ledger

**Status:** FIXED for the wiring defect · one residual coverage gap recorded below
(verified 2026-08-08) · **Severity:** low today, reader-facing correctness once the
ledger is populated · **Found during:** Scope 4 (`04-outcome-record-and-interruption-rate`),
reading the render path · **Owner:** `bubbles.plan` for the Test Plan row, then
implementation.

**Numbering.** No F-017-05 entry exists in this ledger; a search of the feature
directory finds the identifier nowhere. The number is skipped rather than reused,
on the same footing as F-017-01 through F-017-03 described in the preamble above.

**Observed.** `renderAttentionRecord` in `market-brief.html` passes a literal
empty array as the record set:

```text
market-brief.html:1416
  var rate = RLATTN.computeInterruptionRate([], null, generatedAt || null);
```

The reduced artifact is never read. `market-brief.attention-scorecard.json`
exists on disk and is not consulted by this call.

**Why it is a defect.** The rendered withheld state is true today only by
coincidence: `market-brief.attention-outcomes.jsonl` currently has zero lines, so
an empty array and the real ledger agree. They stop agreeing the moment one real
outcome is appended. From that moment the page keeps rendering the withheld state
while the scorecard reports a computed rate, and the page is making a false
statement about its own evidence. A hardcoded input that happens to match reality
is not a correct read; it is a read that has not been wired yet and is
indistinguishable from a correct one until the data moves.

**Test coverage.** None. No scenario asserts any relationship between the
rendered rate and the reduced artifact, so the divergence would ship silently.
The missing coverage is a Playwright assertion that the rendered rate, the
insufficient-sample marker and the displayed sample size match
`market-brief.attention-scorecard.json` for a fixture ledger that is deliberately
non-empty. A fixture with an empty ledger cannot detect this defect, because the
hardcoded empty array and the empty ledger produce identical output — that is the
adversarial requirement for the row.

**Resolution.** Two parts, in order. Add the Test Plan row and scenario, then
wire `renderAttentionRecord` to read `market-brief.attention-scorecard.json`
instead of passing a literal. Both belong to Scope 4's surfaces
(`market-brief.html` `#attentionRecord` block and the scorecard artifact), so no
change-boundary widening is needed to fix it.

**Verified outcome (2026-08-08) — the wiring half is done, the adversarial half is not.**

The hardcoded literal is gone. `market-brief.html` now reads the published
reduction and falls back to the reducer's own empty-set answer only when nothing
has been published:

```text
var published = ATTENTION_RECORD && typeof ATTENTION_RECORD === "object"
    ? ATTENTION_RECORD.overall : null;
var rate = (published && typeof published === "object")
    ? published
    : RLATTN.computeInterruptionRate([], null, generatedAt || null);
```

That fallback is materially different from the defect: the empty-set answer now
comes from the reducer rather than from a literal typed into the renderer, so the
page cannot pin itself to "the sample is too small" once the ledger fills.

The reducer itself is well covered over NON-empty ledgers —
`tests/attention-payload-contract.test.mjs` drives closed samples of 22, 26, 19,
20, 25 and 5, including the sufficiency boundary at exactly 20.

**What is still owed.** `tests/attention-browser.spec.mjs` asserts the rendered
block against the shipped artifact, but the shipped artifact currently reduces to
`closedSample: 0`. At that value the wired read and the old hardcoded read emit
the *same* statement, the same sample size and the same minimum — so the browser
row, as it stands, would still pass against the defect. This is precisely the
trap this finding named: "a fixture with an empty ledger cannot detect this
defect." The row is therefore honest but not yet adversarial.

Closing it needs a non-empty scorecard served to a real page load. It cannot be
closed with `page.route`, because repo policy classifies an intercepted
Playwright test out of `e2e-ui` entirely — mocking the artifact would convert the
only live-stack proof into a mocked one and leave the gap open while appearing to
close it. The legitimate route is a static fixture root serving a seeded
scorecard. Recorded rather than papered over.

