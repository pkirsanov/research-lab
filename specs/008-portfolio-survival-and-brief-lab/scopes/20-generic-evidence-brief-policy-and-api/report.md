# Scope 20 Report: Generic Evidence Brief Policy And API

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 20 now validates one atomic public evidence transaction over the Market Brief config, snapshot,
payload, bounded history, public watchlist, and owner reads. The actual snapshot-named publication binds one
DST-safe `GenericEvidenceWindow/v1` identity into the immutable global rank, rendered Brief, Why-shown
disclosures, diagnostics, and lifecycle surface. Selecting a configured window with no matching snapshot
preserves the last valid brief rather than manufacturing a second publication.

## Decision Record

Evidence projection, timezone policy, ranking, and public API remain one vertical slice. The route removed the
three independent config/watchlist/owner fetch paths because they could mix publisher generations. It reads
the producer's `ownerDeepLink` directly and never resolves ownership through a second registry. A failed or
unmatched candidate returns a value-safe error or a named preserved-last-valid state.

## Completion Statement

Scope 20 is `Done`. This planning-owned reconciliation restores the scope, report, and index mirrors to the
validate-owned state execution record dated 2026-08-20T23:56:25Z. That record reconciles Scope 20 from its
Done artifact, 8/8 checked DoD items, populated report, and referenced report/tool-log evidence. No product
test was executed by this reconciliation, and no existing evidence block or product claim is rewritten.

## Code Diff Evidence

**Claim Source:** executed

```text
$ git log --reverse --format='%H %s' 9ee3c39ae^..80d781825 -- <six Scope 20 files>
9ee3c39ae4a1f85a8626d78f3ac2d1f7d9159483 feat(portfolio): expand survival analysis foundations
708038ba05b2cd56d19322dc554f9eb10bbe25fe fix(portfolio): restore owner routing and test reachability
80d7818256bd30ce567dd69d0aaf3164c7f83833 test(reachability): reconcile atomic owner routing baselines
$ git diff --stat 9ee3c39ae^..80d781825 -- <six Scope 20 files>
portfolio-survival-allocation-lab.html            | 865 ++++++++++++++++++----
rlportfoliobrief.js                               | 642 +++++++++++++++-
scripts/selftest.mjs                              |  67 +-
tests/portfolio-brief.functional.mjs              | 450 ++++++++++-
tests/portfolio-publisher-boundary.functional.mjs |  85 +++
tests/portfolio-survival-brief.spec.mjs           | 288 +++++--
6 files changed, 2175 insertions(+), 222 deletions(-)
```

## Test Evidence

**Claim Source:** executed

### TP-20-01

```text
# Feature 008 Scope 20 TP-20-01 functional
$ node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 172
sha256: c4a5805b5ff68d02fd9ad75b4d1bd5077ebd51c6260bd4943de8a5dc7b509b5b
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded
 source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded sou
rce can create or grow one
	---
	duration_ms: 283.911865
	type: 'test'
	...
# Subtest: route recomposition is invariant to behavior evidence and states that
 behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that beh
avior contributes none
	---
	duration_ms: 45.23619
	type: 'test'
	...
# Subtest: behavior clear removes the committed evidence and returns recompositi
on to the pre-evidence baseline
ok 3 - behavior clear removes the committed evidence and returns recomposition t
o the pre-evidence baseline
	---
	duration_ms: 202.358009
	type: 'test'
	...
# Subtest: dismissal and automatic invalidation record a safe outcome and never
--- omitted 132 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 26 - SCN-008-046 every public boundary emits a closed value-safe PortfolioErr
or
	---
	duration_ms: 0.675601
	type: 'test'
	...
# Subtest: Adversarial: reduced brief evidence policy and API cannot satisfy the
 complete contract
ok 27 - Adversarial: reduced brief evidence policy and API cannot satisfy the co
mplete contract
	---
	duration_ms: 2.087604
	type: 'test'
	...
1..27
# tests 27
# suites 0
# pass 27
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 933.628882
```

### TP-20-02

```text
# Feature 008 Scope 20 TP-20-02 publisher boundary
$ node --test tests/portfolio-publisher-boundary.functional.mjs
exit: 0
lines: 40
sha256: 1a245e1da74d47a7961d2761396acedf815759f9b2f2a89fb26156d6624f6ed5
--- output ---
TAP version 13
# Subtest: SCN-008-005 TP-04-02: no publisher script imports the personal module
 or names a personal storage key
ok 1 - SCN-008-005 TP-04-02: no publisher script imports the personal module or
 names a personal storage key
	---
	duration_ms: 3.902907
	type: 'test'
	...
# Subtest: SCN-008-005 TP-04-02: the personal-key scan is non-vacuous - it detec
ts a real committed leak
ok 2 - SCN-008-005 TP-04-02: the personal-key scan is non-vacuous - it detects a
 real committed leak
	---
	duration_ms: 1213.751745
	type: 'test'
	...
# Subtest: SCN-008-005 TP-04-02: a publisher subprocess given sentinel env and a
rgv emits no personal value
ok 3 - SCN-008-005 TP-04-02: a publisher subprocess given sentinel env and argv
 emits no personal value
	---
	duration_ms: 122.855099
	type: 'test'
	...
# Subtest: SCN-008-005 TP-04-02: the publisher boundary run mutates no tracked p
ublic artifact
ok 4 - SCN-008-005 TP-04-02: the publisher boundary run mutates no tracked publi
c artifact
	---
	duration_ms: 39.301365
	type: 'test'
	...
# Subtest: SCN-008-046 all five public artifacts contribute independently to one
 local generic evidence identity
ok 5 - SCN-008-046 all five public artifacts contribute independently to one loc
al generic evidence identity
	---
	duration_ms: 98.126461
	type: 'test'
	...
1..5
# tests 5
# suites 0
# pass 5
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1650.204596
```

### TP-20-03

The exact one-row runner passed. The complete carrier below supplies the required raw-output depth and proves
all fifteen existing Brief journeys stayed green after the new route contract.

```text
# Feature 008 Scope 20 complete browser carrier
$ npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 51
sha256: 87bc9ad0dbd02ce6de3ebc4b3cac3f2c564597d27782bc4672c500b366c68f2e
--- first 20 ---

Running 15 tests using 1 worker

[TP-05-02] windows=pre-market,morning,pre-close,after-hours times=07:30,11:00,15:00,17:00 preserved=3 excludedAfterCutoff=1
	✓   1 [system-chrome] - Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
[TP-05-03] held=MSFT watchlistOnly=QQQ completedResearch=0 inferred=0 duplicated=0
	✓   2 [system-chrome] - Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history
[TP-05-04] behaviorHistory=insufficient-history inferred=0 heldRetained=true explained=true
	✓   3 [system-chrome] - Regression: SCN-008-010 insufficient completed history produces zero inferred actions
[TP-05-05] desktop overflow=0 lanes=4 overlaps=0
[TP-05-05] mobile overflow=0 lanes=4 overlaps=0
[TP-05-05] zoom overflow=0 lanes=4 overlaps=0
[TP-05-05] keyboard focus reaches #briefWindow at 390px
	✓   4 [system-chrome] - Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap
[TP-05-07] completedResearchLane=nvda
[TP-05-07] renderedSource=direct-completed-research
[TP-05-07] promotedToHeld=false
	✓   5 [system-chrome] - Regression: SCN-008-007 TP-05-07 a completed-research subject renders in its own lane with its qualification source
[TP-05-08] explained=BND:evidence-unavailable,FBTC:evidence-unavailable,FETH:evidence-unavailable,FMTM:evidence-unavailable,GLD:evidence-unavailable,QQQ:evidence-unavailable,SOXX:evidence-unavailable,SPCX:evidence-unavailable,SPMO:evidence-unavailable,VGT:evidence-unavailable,XLE:evidence-unavailable,XLK:evidence-unavailable
	✓   6 [system-chrome] - Regression: SCN-008-007 TP-05-08 a scoped subject with no surviving evidence is explained on screen
--- omitted 11 line(s); sha256 above covers the full output ---
--- last 20 ---
[TP-06-09] outcomeRecorded=complete subject=MSFT behaviorEventCount=null
[TP-06-09] outcomeRecorded=dismiss subject=MSFT
	✓  11 [system-chrome] - Regression: SCN-008-034 TP-06-09 a lifecycle outcome is recorded without becoming a market view
[TP-06-10] confirmationEnforced=true inferredAfterClear=0
	✓  12 [system-chrome] - Regression: SCN-008-008 TP-06-10 the clear control is exposed where behaviour-derived ranking is visible
[TP-06-06] desktop overflow=0 overlap=false disclosureChars=811
[TP-06-06] mobile overflow=0 overlap=false disclosureChars=811
[TP-06-06] zoom overflow=0 overlap=false disclosureChars=811
[TP-06-06] keyboard reaches summary and lifecycle control at 390px; focusAfterAction=BODY
	✓  13 [system-chrome] - Regression: Feature 008 why shown lifecycle and return focus remain accessible without mobile overlap
[TP-18-03] storedOccurrences=3 eligible=2 quarantined=1
[TP-18-03] rankingFingerprint=sha256:e2b0bd2244516ef2ae554fed271caf026a30c9c6e19fae9fb6e4af36a212373c visible=3
[TP-18-03] actionOrder=sha256:ea0c85c2a2cf191f70f4ecc68ded5c92075d0a5b6f56bdbb34c628ace134cf14,sha256:f1c814ba6605bbf64b8f5173edfa541d0634d5ce25cb473aa8ce54d3d97a2684,sha256:eeb18ce5ee7e58abf9e69578ea2ebb93a4458c7d7ba1865d3c1d4ac8a4f2739a
	✓  14 [system-chrome] - Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection
[TP-20-03] window=after-hours sources=5
[TP-20-03] genericEvidenceIdentity=sha256:5b6f9e5eae1ff6d98a03f11f06023fa53a0c89c0a9f57d1525ae1a41c4013dd3 visibleCap=7
[TP-20-03] preservedWindow=pre-market ranked=1
	✓  15 [system-chrome] - Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent

	15 passed (35.2s)
```

### TP-20-04

```text
# Feature 008 Scope 20 TP-20-04 adversarial
$ node --test --test-name-pattern="Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract" tests/portfolio-brief.functional.mjs
exit: 0
lines: 16
sha256: 338dfd6959c69f1b1608de3998a2c1a0d2c9fb62630960c91ebca5587500994d
--- output ---
TAP version 13
# Subtest: Adversarial: reduced brief evidence policy and API cannot satisfy the
 complete contract
ok 1 - Adversarial: reduced brief evidence policy and API cannot satisfy the com
plete contract
	---
	duration_ms: 62.360682
	type: 'test'
	...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 241.535858
```

### TP-20-05

```text
# Feature 008 Scope 20 repository selftest final
$ node scripts/selftest.mjs
exit: 0
lines: 3628
sha256: 4e716857e55cf24c6efc8df8fcc855dab46a98bf3c252c531509d2d9d2192471
--- first 20 ---

Step 1 security - escaped model sinks and CSP on every page
	✓ every shipped HTML page carries a Content-Security-Policy meta
	✓ all pages use one identical CSP instead of drifting per page
	✓ CSP keeps the single-file inline-script design while defaulting to self
	✓ CSP blocks object, base-tag, and form exfiltration paths
	✓ CSP connect-src is an explicit origin allowlist, never wildcard https
	✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
	✓ CSP allows no open URL-forwarding relay origin
	✓ production pages and shared runtime contain no open URL-forwarding relay chain
	✓ no model/config-authored field reaches innerHTML without esc()
	✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first to oldest-first with UTC epochs, empty volume to null, error/malformed to null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3588 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ TP-02-01: both carried threshold sets equal the independently transcribed Publication 505 (2026) rates and filing-status thresholds, and the shipped pack validates with zero refusals
	✓ TP-02-01: a capped set with a null capMember, an uncapped set carrying one, a varyByFilingStatus:false set holding per-status keys, and a malformed indexing block are each refused by the member that carries them
	✓ TP-02-02: a duplicate legId, a figureRef naming a figure the pack does not carry, and an includedInTotal:false leg whose figure is absent are each refused by the member that carries them
	✓ TP-02-03: against the unmodified Feature 021 pack the generalized CO-8 sums exactly the two Feature 021 legs over every Feature 021 household shape
	✓ TP-02-04: the net investment income tax is exact immediately below, exactly at and above every filing-status threshold
	✓ TP-02-05: the additional Medicare tax is exact immediately below, exactly at and immediately above every filing-status threshold
	✓ TP-02-06: added ordinary income alone raises the net investment income tax and leaves a non-zero additional Medicare tax byte-identical
	✓ TP-02-09: createEmptyWorkspace initializes both surtax bases to null and a declared zero computes a real zero carrying no refusal code
	✓ TP-02-10: a leg whose figure was withdrawn makes CO-8 a refusal carrying that leg's own code
	✓ TP-02-11: a threshold set whose declaredFor omits the declared tax year is refused at settlement rather than applied
	✓ TP-02-12: the settlement publishes its modified-adjusted-gross measure as declared-incomplete with a non-empty list of unmodeled adjustments
	✓ TP-02-13: the privacy inventory names both declared surtax bases and the clear action removes the stored workspace
	✓ TP-02-14: no rltax module on disk holds a surtax rate, threshold, jurisdiction name or authority id
	✓ TP-02-24: the Fixture Input Completion Register carries four rows over two files, each declaring both bases at 0

================================================
Research-Lab self-test: 3192 passed, 0 failed
================================================
```

### RED And GREEN

The first live-page run failed because `genericEvidenceState` was absent. After adding diagnostics but before
the loader, it failed as `unavailable`. After the atomic loader, normalization, identity binding, and
preserved-last-valid rendering landed, the identical test passed and the full browser carrier passed 15/15.

## Uncertainty Declarations

The entries below preserve the earlier downstream-copy limitation as historical diagnostic context. They are
not active Scope 20 completion blockers after the later validate-owned canonical focused traceability pass
recorded in [Canonical Focused Traceability Correction](#canonical-focused-traceability-correction).

- The public repository currently carries one complete snapshot-named publication. The other three schedule
	windows remain selectable but do not pretend to have matching snapshot/payload evidence. They preserve and
	label the last valid publication.
- The current framework traceability guard has no planned-file exception. It scans two references to
	`tests/portfolio-survival-accessibility.spec.mjs`, owned by future Scope 27, and one reference to
	`tests/portfolio-test-integrity.unit.mjs`, owned by future Scope 28. Those carriers remain
	`planned-not-authored`; Scope 20 does not create them or patch the framework to suppress them.

## Scenario Contract Evidence

SCN-008-046 is implemented in `tests/portfolio-brief.functional.mjs`,
`tests/portfolio-publisher-boundary.functional.mjs`, and the exact persistent Playwright row in
`tests/portfolio-survival-brief.spec.mjs`.

## Coverage Report

The focused matrices cover eight public APIs, both DST transition sides, all five evidence identities, current
and stale action authoring, one global cap, lifecycle reduction, value-safe errors, public/private separation,
the real route, Why-shown identity parity, and unmatched-window rollback. The complete Browser carrier covers
15 Brief scenarios, and the repository suite covers 3,192 assertions.

## Lint And Quality

- Regression quality guard: 0 violations, 0 warnings.
- Pages build dry run: exit 0; 28 registered pages and 121 root files.
- Structured test paths: exit 0; zero new missing paths and eight future planned carriers.
- PII scan: exit 0; 8,875 files and 1,705 commit messages scanned, zero findings.
- Test reachability: zero new orphans; six historical baseline orphans remain recorded by the repository ratchet.
- Editor diagnostics: zero errors in the route, module, and three Scope 20 test carriers.
- Post-edit artifact lint: exit 0 with `Artifact lint PASSED`.
- The earlier downstream-copy run reported three future-carrier failures and the subsequent scope-universe
	rerun exited 2; both diagnostics are preserved below rather than rewritten.
- The later validate-owned execution record supersedes those diagnostics and records `Artifact lint PASSED`
	plus canonical focused traceability `PASSED` with the exact metrics in the correction below.

## Current-Scope Traceability

**Claim Source:** operator-supplied current-session diagnostic input; not execution evidence produced by this edit.

The earlier downstream-copy run that reached file-reference checks reported exactly three failures: two references to
`tests/portfolio-survival-accessibility.spec.mjs` owned by future Scope 27, and one reference to
`tests/portfolio-test-integrity.unit.mjs` owned by future Scope 28. The then-current downstream framework copy scanned those
`planned-not-authored` carriers and has no planned-file exception.

```text
RESULT: FAILED (3 failures, 0 warnings)
```

**Claim Source:** executed after this artifact reconciliation.

```text
$ timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
ERROR: scope-universe resolution refused (--current-scope):
scope-universe-resolver: current scope status must be in_progress or blocked
TRACE_EXIT=2
```

The post-edit command did not reach file-reference checks. Read-only inspection showed
`state.json.execution.currentScope` is 21; this narrow owner-correct reconciliation does not modify `state.json`.

<!-- bubbles:certifying-window-begin -->

### Canonical Focused Traceability Correction

**Dated correction:** 2026-08-20T23:56:25Z.

**Attribution:** the validate-owned `state.json.executionHistory` record at that timestamp. No raw trace receipt
is reproduced or re-attributed here; the metrics below are quoted from that immutable validation record.

The later record states that Scope 20 was reconciled from its Done artifact with 8/8 checked DoD items, a
populated report, and referenced report/tool-log evidence. It records `Artifact lint PASSED` and canonical
focused traceability `PASSED` with:

- 46 scenarios;
- 157 Test Plan rows;
- 46 scenario mappings;
- 46 concrete test files;
- 46 report references;
- 46/46 DoD fidelity; and
- 0 warnings.

This later canonical result supersedes the earlier downstream-copy failure and scope-universe refusal retained
above. It does not overwrite those historical diagnostics or claim product-test execution by this planner.

## Spot-Check Recommendations

- Keep the exact SCN-008-046 browser row in the full Brief carrier; it protects the interaction among the five
	public evidence classes, global ranking, Why-shown, and last-valid rollback.
- Retain the reduced-contract adversarial row; it proves a fixed offset, missing API, old stale verb, or reduced
	cap cannot satisfy the complete contract.

## Validation Summary

The validate-owned state execution record dated 2026-08-20T23:56:25Z is authoritative for this closeout mirror.
It records Scope 20 `done`, 8/8 checked DoD items, `Artifact lint PASSED`, and canonical focused traceability
`PASSED` with 46 scenarios, 157 Test Plan rows, 46 scenario mappings, 46 concrete test files, 46 report
references, 46/46 DoD fidelity, and 0 warnings. Existing Scope 20 evidence remains unchanged: all five declared
Test Plan commands have passing evidence, the complete Brief browser carrier passes 15/15, and the repository
selftest passes 3,192/0. This reconciliation runs no product tests and makes no new product completion claim.

## Audit Verdict

Scope 20 implementation, test evidence, rollback behavior, and cross-consumer checks are internally
consistent. The validate-owned state record establishes Scope 20 as `Done` with 8/8 checked DoD items, so the
planning closeout mirrors are restored to that state. No terminal feature claim is made; Scope 21 remains
`Done`, and Scopes 22-29 retain their existing indexed states.