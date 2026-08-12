# Scope 05 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

The Portfolio Brief route composes each generic ET window into held, public-watchlist,
completed-research, and inferred-relevance lanes from local state and same-origin cached
evidence, and it degrades honestly when evidence or history is missing.

The composer is `rlportfoliobrief.js` (`RLPORTFOLIOBRIEF.composeBrief`). The page reads the
four windows from the PUBLIC generic config and never declares its own, so the window
identities cannot drift from the shared contract.

Auditing the scope's declared FR list against the composer's actual output found seven FRs
that the DoD named but nothing implemented. They were implemented rather than ticked. That
work is the substance of this scope beyond the original six rows, and it is recorded in the
Decision Record below.

## Decision Record

**D1 - Implement the seven uncovered FRs rather than tick them.**
FR-060, FR-061, FR-064, and FR-067 were absent from the composer output; FR-041's fourth
clock, FR-057, and FR-059 were likewise unimplemented. Marking those DoD items complete
would have been fabrication, so each was implemented with tests. Commits `d62cbb41` and
`bf3a90b9`.

**D2 - FR-064 was a behaviour defect, not a missing field.**
The composer did `if (!observed) return;`, so a subject in scope whose evidence was
unavailable or post-cutoff was silently dropped. A held ticker with no data simply vanished
and the reader could not tell "nothing to do" from "we do not know". Scoped subjects now
enter a `noAction` list carrying the reason. Cutoff exclusion is tracked per subject so
`evidence-unavailable` and `evidence-after-cutoff` can be told apart.

**D3 - Enforce `maximumEvidenceAgeDays` instead of only declaring it.**
FR-041 requires four separate clocks and the composer had three. The missing local
action-history cutoff meant the declared 56-day limit was never applied, so a completion
from any point in the past kept clearing the behaviour floor forever.

**D4 - The `occurredAt` fix came from D3, not from a test failing by luck.**
Enforcing the age cutoff immediately turned TP-05-07 red. `briefCompletions()` read
`event.recordedAt || event.at`, but the behaviour event's field is `occurredAt`, so every
completion carried `completedAt: null`. The lane still populated because qualification only
needs a `subjectId`, which is why the defect had been invisible; the distinct-DATE half of
the behaviour floor was counting zero on every composition and could never be satisfied.

**D5 - Owner routing is supplied, not hardcoded.**
FR-060/061 owner links come from the caller via `input.owners`, read from the shared tool
registry. Hardcoding them in the composer would let the brief drift from the registry that
actually defines ownership.

**D6 - Cross-window state is an explicit input.**
FR-057 compares this window's evidence ids against `input.priorEvidenceIds`. The composer
keeps no hidden memory of prior windows, so a repeat is detectable without the composer
becoming stateful.

## Completion Statement

Every Scope 05 DoD item has a matching declared command that was executed in this session,
with the raw output recorded below.

## Code Diff Evidence

Changed paths, all runtime-behaviour bearing:

```
portfolio-survival-allocation-lab.html   route, render, no-action region, identity, owner links
rlportfoliobrief.js                      composer: lanes, noAction, identity, owners, 4th clock
tests/portfolio-brief.functional.mjs     15 functional rows
tests/portfolio-survival-brief.spec.mjs  7 live-stack browser rows
```

Commits: `84d09d5e` (composer), `adf35cd1` (page wiring), `2ec3db92` (browser rows +
TP-05-07), `d62cbb41` (FR-060/061/064/067), `bf3a90b9` (FR-041/057/059 + `occurredAt` fix).

## Test Evidence

Each section records the exact command, exit code, and raw output.

### TP-05-01

Command: `node --test tests/portfolio-brief.functional.mjs`
Exit code: 0

```
# Subtest: SCN-008-006 TP-05-01: each window is identified from the generic config and no later observation enters an earlier cutoff
ok 5 - SCN-008-006 TP-05-01: each window is identified from the generic config and no later observation enters an earlier cutoff
# Subtest: SCN-008-007 TP-05-01: the four qualification lanes stay separate and a subject is never duplicated across them
ok 6 - SCN-008-007 TP-05-01: the four qualification lanes stay separate and a subject is never duplicated across them
# Subtest: SCN-008-010 TP-05-01: below the behavior floor the inferred lane is empty and the shortfall is named
ok 7 - SCN-008-010 TP-05-01: below the behavior floor the inferred lane is empty and the shortfall is named
# Subtest: SCN-008-007 TP-05-01: the visible queue is bounded by policy and ordered by materiality
ok 8 - SCN-008-007 TP-05-01: the visible queue is bounded by policy and ordered by materiality
# pass 15
# fail 0
```

### TP-05-02

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time" --reporter=list`
Exit code: 0

```
[TP-05-02] windows=pre-market,morning,pre-close,after-hours distinctCutoffs=4 excludedAfterCutoff=1
  ✓  1 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:86:1 › Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time (1.2s)
```

Four windows yield four DISTINCT cutoffs, and the observation stamped after the earliest
cutoff is excluded rather than carried backwards.

### TP-05-03

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history" --reporter=list`
Exit code: 0

```
[TP-05-03] held=MSFT watchlistOnly=QQQ completedResearch=0 inferred=0 duplicated=0
  ✓  2 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:129:1 › Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history (859ms)
```

MSFT is both held and watchlisted; it appears ONCE, in the higher-authority lane, and
discloses the second qualification instead of being listed twice.

### TP-05-04

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-010 insufficient completed history produces zero inferred actions" --reporter=list`
Exit code: 0

```
[TP-05-04] behaviorHistory=insufficient-history inferred=0 heldRetained=true explained=true
  ✓  3 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:168:1 › Regression: SCN-008-010 insufficient completed history produces zero inferred actions (622ms)
```

Below the floor the inferred lane is empty AND says why, while direct value is retained.

### TP-05-05

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap" --reporter=list`
Exit code: 0

```
[TP-05-05] desktop overflow=0 lanes=4 overlaps=0
[TP-05-05] mobile overflow=0 lanes=4 overlaps=0
[TP-05-05] zoom overflow=0 lanes=4 overlaps=0
[TP-05-05] keyboard focus reaches #briefWindow at 390px
  ✓  4 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:196:1 › Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap (799ms)
```

### TP-05-06

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
Exit code: 0

```
  ✓  1 › Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time (1.2s)
  ✓  2 › Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history (859ms)
  ✓  3 › Regression: SCN-008-010 insufficient completed history produces zero inferred actions (622ms)
  ✓  4 › Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap (799ms)
  ✓  5 › Regression: SCN-008-007 TP-05-07 a completed-research subject renders in its own lane with its qualification source (832ms)
  ✓  6 › Regression: SCN-008-007 TP-05-08 a scoped subject with no surviving evidence is explained on screen (635ms)
  ✓  7 › Regression: SCN-008-007 TP-05-09 brief identity binds revision window policy and action set (615ms)
  7 passed (8.0s)
```

### TP-05-07

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-007 TP-05-07 a completed-research subject renders in its own lane with its qualification source" --reporter=list`
Exit code: 0

```
[TP-05-07] completedResearchLane=nvda
[TP-05-07] renderedSource=direct-completed-research
[TP-05-07] promotedToHeld=false
  ✓  5 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:260:1 › Regression: SCN-008-007 TP-05-07 a completed-research subject renders in its own lane with its qualification source (832ms)
```

Why this row exists: the original four browser rows ALL stayed green when
`briefCompletions()` was replaced with `[]` on the page. TP-05-03 asserts the
completed-research lane is EMPTY when nothing was recorded, and no row exercised the
POPULATED case, so an emptied lane passed undetected. TP-05-07 records a completion through
the production UI path and was verified RED under that same probe, then GREEN on revert.

### TP-05-08

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-007 TP-05-08 a scoped subject with no surviving evidence is explained on screen" --reporter=list`
Exit code: 0

```
[TP-05-08] explained=BND:evidence-unavailable,FBTC:evidence-unavailable,FETH:evidence-unavailable,FMTM:evidence-unavailable,GLD:evidence-unavailable,QQQ:evidence-unavailable,SOXX:evidence-unavailable,SPCX:evidence-unavailable,SPMO:evidence-unavailable,VGT:evidence-unavailable,XLE:evidence-unavailable,XLK:evidence-unavailable
  ✓  6 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:300:1 › Regression: SCN-008-007 TP-05-08 a scoped subject with no surviving evidence is explained on screen (635ms)
```

Twelve scoped subjects that previously rendered NOWHERE are now each accounted for with a
reason, and none of them is also presented as actionable.

### TP-05-09

Command: `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-007 TP-05-09 brief identity binds revision window policy and action set" --reporter=list`
Exit code: 0

```
[TP-05-09] revision=sha256:1d35e08192c50010f851f111bccf32eda0a0f9cbbdcb114b386512bd3b08a4f4 policy=portfolio-survival-allocation-policy/v1
[TP-05-09] afterHoursSignature=held[MSFT]|watchlist[]|completedResearch[]|inferredRelevance[]
[TP-05-09] preMarketSignature=held[MSFT]|watchlist[]|completedResearch[]|inferredRelevance[]
  ✓  7 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:329:1 › Regression: SCN-008-007 TP-05-09 brief identity binds revision window policy and action set (615ms)
```

The revision id is the revision's CONTENT fingerprint (`portfolioId` in `rlportfolio.js`).
An earlier `revisionId` guess rendered `null` and this row caught it.

### TP-05-10

Command: `node --test tests/portfolio-brief.functional.mjs`
Exit code: 0

```
# Subtest: FR-041 the local action-history cutoff is a fourth clock and is actually enforced
ok 13 - FR-041 the local action-history cutoff is a fourth clock and is actually enforced
# Subtest: FR-057 a repeat over the same evidence is not reported as independent confirmation
ok 14 - FR-057 a repeat over the same evidence is not reported as independent confirmation
# Subtest: FR-059 a general-interest item states it is not a known holding and ranks below direct work
ok 15 - FR-059 a general-interest item states it is not a known holding and ranks below direct work
# pass 15
# fail 0
```

Four distinct clocks are asserted, the cutoff is derived from declared policy, and expired
completions are excluded, counted, and unable to clear the behaviour floor. Verified RED
with the age check disabled, GREEN on restore.

### TP-05-11

Covered by the run recorded under TP-05-10 (`ok 14`). A repeat resting on the same evidence
ids as the prior window reports `same-evidence-as-prior-window`; genuinely newer evidence
reports `new-evidence-since-prior-window`; with no prior window it reports
`no-prior-window` rather than implying novelty.

### TP-05-12

Covered by the run recorded under TP-05-10 (`ok 15`). Every non-held item declares
`notAKnownHolding` explicitly, and `laneOrder` keeps `held` first and `inferredRelevance`
last so inferred work never displaces direct portfolio work.

### TP-05-13

Command: `node --test tests/portfolio-brief.functional.mjs`
Exit code: 0

```
# Subtest: FR-050 partial or stale evidence keeps its state and cannot support an action as if fresh
ok 16 - FR-050 partial or stale evidence keeps its state and cannot support an action as if fresh
# pass 16
# fail 0
```

FR-050 was the last uncovered FR in this scope. `briefEvidence()` called `RLDATA.bars`
directly and therefore had no notion of coverage quality, so `stale` and `partial` — two of
the four states FR-050 names — were invisible to the brief. Scope 04 built
`ensureBarCoverage` to measure exactly this; the brief now CONSUMES that measurement rather
than re-deriving it, which is what stops the two scopes from eventually disagreeing.

Degraded evidence is retained, because withholding it would be its own distortion, but each
item declares `evidenceState` and only `complete` sets `supportsCurrentActionAsFresh`. The
WORST state across a subject wins, so one good day inside a mostly-absent series cannot
launder the subject into looking fresh, and `unmeasured` is ranked as degraded so "we did
not check" never presents as "we checked and it is fine".

Verified RED by flattening `COVERAGE_RANK` so every state tied, then GREEN on restore.

## Scenario Contract Evidence

### Scenario SCN-008-006

Four-window local composition. TP-05-01 (`ok 5`) proves each window is identified from the
generic config and no later observation enters an earlier cutoff. TP-05-02 proves the same
in the browser with four distinct cutoffs. TP-05-09 proves the composed identity moves with
the window. TP-05-10 proves the fourth clock stays separate from the other three.

### Scenario SCN-008-007

Direct and inferred scope stay separate. TP-05-01 (`ok 6`, `ok 8`) proves lane separation,
non-duplication, and the bounded queue. TP-05-03 proves the four lanes reject raw history
and that a doubly-qualifying subject appears once. TP-05-07 proves the populated
completed-research case. TP-05-08 proves a scoped subject with no evidence is explained
rather than dropped. TP-05-12 proves each non-held item states it is not a holding.

### Scenario SCN-008-010

Insufficient behaviour history degrades honestly. TP-05-01 (`ok 7`) proves the inferred lane
is empty below the floor and the shortfall is named. TP-05-04 proves the same on screen with
direct value retained. TP-05-10 proves expired completions cannot clear the floor, which is
what makes the insufficient state truthful over time rather than only on first use.

## Coverage Report

| Surface | Result |
| --- | --- |
| Repo self-test | 1586 passed, 0 failed |
| Portfolio functional + unit | 92 passed, 0 failed |
| Live-stack browser (foundation + brief + provider-credentials) | 27 passed, 0 failed |

Scope 05 contributes 16 functional rows and 7 live-stack browser rows.

## Lint And Quality

`git diff --check` clean on every commit in this scope. No shell redirection was used to
write repository files. All test additions run under the repo's existing commands with no
new tooling.

## Uncertainty Declarations

1. **The cutoff-survival invariant is functional-only coverage.** Replacing the composer's
   cutoff guard turned `tests/portfolio-brief.functional.mjs` red but left the browser rows
   green. The browser rows cover rendering, lanes, identity, and accessibility; they do not
   independently prove cutoff survival. This is stated rather than implied by a green suite.

2. **FR-058 is satisfied only insofar as materiality is supplied by evidence.** The composer
   ranks by the materiality carried on evidence records and does not itself perform exposure
   calculations, so "materiality affects ranking only through explicit exposure calculations"
   holds for the composer but depends on the producer of those records.

3. **TP-05-11 and TP-05-12 share TP-05-10's command.** All three live in the same functional
   file and the same invocation covers them; they are recorded separately because they prove
   different FRs, not because they were run separately. TP-05-13 is likewise the same file.

4. **One transient self-test failure was observed and is not attributed to this scope.** A
   single run reported `1585 passed, 1 failed` between two runs that both reported
   `1586 passed, 0 failed`. It coincided with a concurrent session editing
   `trend-dynamics-cycle-lab`, which this scope does not touch. Three subsequent runs were
   clean. It is recorded here rather than omitted, because a green count that followed a red
   one should not be presented as if the red never happened.

## Validation Summary

Every DoD item in this scope has a matching declared command that was executed, and each
declared `--grep` string was verified to resolve to exactly one test. Newly added rows were
each verified to FAIL under a probe restoring the behaviour they guard, then to pass on
revert, so no row in this scope is known-vacuous.

## Audit Verdict

Scope 05 delivers the four-window brief and closes seven FRs the DoD declared but nothing
implemented, plus one live page defect (`occurredAt`) surfaced by that work.
