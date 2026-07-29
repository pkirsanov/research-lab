# Scope 05 Report: Registry-Wide Normalized Reads

**Status:** Done

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 05 freezes the complete runtime-discovered briefing registry from the live committed
`tools.json` and produces exactly one truthful `ToolModelRead/v1` outcome for every derived source
role. Delivery was fully additive within the declared Change Boundary:

- **`tools.json`** — added the required `briefing` block (`role`, `profile`, `readAdapter`,
  `readContractVersion`, `freshnessPolicy`, `recommendationPolicy`, `budgetPolicy`) to all 23
  entries. Every existing field, entry order, and every consumer is preserved; each `readAdapter`
  ID is unique (23/23).
- **`rlcontracts.js`** — added the pure, dual-runtime `validateRegistry(registry, config)` which
  derives `participantCount`/`sourceCount`/`aggregatorToolId`/`orderedParticipantIds`/
  `orderedSourceToolIds`/`registryFingerprint` by filtering the validated briefing role (never a
  literal or `count - 1`), requires exactly one non-recursive `final-aggregator`, rejects
  missing/unknown/mismatched metadata and duplicate adapters, and cross-checks each profile's
  policy IDs against the caller-supplied committed config (so the module holds no default policy
  values). Added to the frozen `api` export.
- **`scripts/brief-refresh.mjs`** — made `freezeToolReads` polymorphic by first-argument contract:
  the shipped Scope 04 evidence-first signature/behaviour is unchanged, and a new registry form
  (`freezeRegistryToolReads(registry, adapters, runContext)`) emits one validated read per derived
  source, reusing the six Scope 04 owning-model builders and delegating non-owner sources to the
  Scope 04 `buildNonOwnerApplicabilityRead` typed-applicability path. No owner formula is copied;
  the final aggregator (Market Brief) is never self-consumed.

## Decision Record

- **Registry cardinality is derived, never literal.** `validateRegistry` computes counts by role
  filtering over the live entries; the current repository canary is 23 participants / 22 sources,
  and a valid added source derives 24/23 through the identical loops (proven by SCN-002-003).
- **`readAdapter` uniqueness honored.** Per design.md line 879 ("duplicate adapter IDs … are
  registry-contract failures") every entry declares a unique read adapter; the six Scope 04 owners
  and the Scope 03 company adapter reuse their existing adapter IDs
  (`sector-owning-model-v1`, `company-fundamentals-owner-v1`, etc.).
- **`freezeToolReads` extended, not replaced.** A top-of-function contract guard delegates the
  registry form; the legacy `freezeToolReads(evidence, runContext, otherSources) -> { owners,
  others }` path is byte-for-byte behaviourally unchanged and still pinned green by the Scope 04
  selftest group, `distributed-briefs-owner-reads.integration.mjs`, and `…owner-reads.e2e.mjs`.
- **FINDING — company-fundamentals status vocabulary.** The committed company-fundamentals
  Feature-010 owner read (`buildCompanyFundamentalsOwnerRead`) carries `status: "partial"`, which
  is outside the strict Feature-002 `ToolModelRead/v1` status enum
  `{fresh, stale, unavailable, not-run, not-applicable}` enforced by `rldata.js::validateToolModelRead`.
  For the market-session registry freeze, `company-fundamentals-lab` (a static-model SEC-facts
  source) therefore resolves uniformly as **not-applicable** via `buildNonOwnerApplicabilityRead`
  — truthful, because a static SEC model cannot consume XNYS market-session evidence — exactly like
  the other static-model sources (`ai-capex-strategy-lab`, `msft-july-print-model`). Its rich
  committed brief remains a Feature-010 concern surfaced on its own page/toolCoverage. This
  cross-feature status-vocabulary observation belongs to Feature-010, which owns
  `buildCompanyFundamentalsOwnerRead` and its status vocabulary; no foreign artifact was edited to
  work around it. Scope 05 itself is complete: the registry freeze resolves this source truthfully
  through `buildNonOwnerApplicabilityRead` rather than relaxing the `ToolModelRead/v1` status enum.

## Completion Statement

Complete. Every Scope 05 DoD item is met with reproduced current-session evidence. The four
production/test surfaces (`tools.json`, `rlcontracts.js`, `scripts/brief-refresh.mjs`,
`scripts/selftest.mjs`) plus the four Scope 05 test files are left uncommitted in the working tree
for the parent to stage/commit; the consumed Scope 01/03/04 modules are unchanged.

## Code Diff Evidence

`git status --porcelain` (Scope 05 surface, all within the Change Boundary):

```
 M rlcontracts.js
 M scripts/brief-refresh.mjs
 M scripts/selftest.mjs
 M tests/distributed-briefs.contract.mjs
 M tools.json
?? tests/distributed-briefs-foundation.e2e.mjs
?? tests/distributed-briefs-read-adapters.integration.mjs
?? tests/distributed-briefs-shared-canary.mjs
```

`rlcontracts.js` post-restore sha256 = `a1b9ff2385bf406f8106f0ae5858ef05d7812b6561da8ea62baebc14e5e1d6f2`
(byte-identical to the pre-mutation baseline captured after implementation and before the
controlled-mutation red stages).

### Code Diff Evidence — committed delta (`0dabe962`)

The working-tree surface recorded above was subsequently committed as `0dabe962`
(`spec(002): Scope 05 registry-wide normalized reads`). The committed non-artifact runtime delta
is reproduced below directly from git; spec artifacts are excluded from the pathspec so only the
runtime/source surface is shown.

**Claim Source:** executed

```
$ git --no-pager show --stat --oneline 0dabe962 -- . ':(exclude)specs/**'
0dabe962 spec(002): Scope 05 registry-wide normalized reads
 rlcontracts.js                                     | 125 ++++++++++
 scripts/brief-refresh.mjs                          |  77 ++++++-
 scripts/selftest.mjs                               |  55 +++++
 tests/distributed-briefs-foundation.e2e.mjs        | 145 ++++++++++++
 ...istributed-briefs-read-adapters.integration.mjs | 113 +++++++++
 tests/distributed-briefs-shared-canary.mjs         |  93 ++++++++
 tests/distributed-briefs.contract.mjs              | 144 ++++++++++++
 tools.json                                         | 253 +++++++++++++++++++--
 8 files changed, 981 insertions(+), 24 deletions(-)
EXIT=0
```

Per-file added/removed line counts for the four production surfaces named in the Completion
Statement (`rlcontracts.js`, `tools.json`, `scripts/brief-refresh.mjs`, `scripts/selftest.mjs`):

**Claim Source:** executed

```
$ git --no-pager show --numstat --format= 0dabe962 -- rlcontracts.js tools.json scripts/brief-refresh.mjs scripts/selftest.mjs
125     0       rlcontracts.js
76      1       scripts/brief-refresh.mjs
55      0       scripts/selftest.mjs
230     23      tools.json
EXIT=0
```

This confirms the delta is additive on `rlcontracts.js` (+125 / −0) and `scripts/selftest.mjs`
(+55 / −0); the `tools.json` (+230 / −23) and `scripts/brief-refresh.mjs` (+76 / −1) edits are the
registry `briefing` block additions and the polymorphic `freezeToolReads` contract guard described
in the Decision Record.

## Test Evidence

All commands run from the repository root; full unfiltered output was reviewed. **Claim Source:**
`executed` for every block below.

### [TP-05-01], [TP-05-02] and [TP-05-03] unit RED, byte-exact restore, GREEN

**[TP-05-01] SCN-002-001 unit — controlled-mutation RED → byte-exact restore → GREEN**

RED: `validateRegistry` frozen.sourceCount mutated to a literal 21.

```
$ node --test --test-name-pattern='SCN-002-001' tests/distributed-briefs.contract.mjs
✖ SCN-002-001: registry derives 23 participants 22 sources and one non-recursive aggregator
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:  21 !== 22
ℹ tests 1  ℹ pass 0  ℹ fail 1
TP0501_RED_EXIT=1
```

Restore byte-exact (`sourceCount: orderedSourceToolIds.length`) → sha256 == baseline → GREEN below.

**[TP-05-03] SCN-002-003 unit — controlled-mutation RED → byte-exact restore → GREEN**

RED: `validateRegistry` frozen.sourceCount mutated to a non-scaling literal 22.

```
$ node --test --test-name-pattern='SCN-002-003' tests/distributed-briefs.contract.mjs
✖ SCN-002-003: added-source mutation derives 24 participants and 23 sources generically
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:  22 !== 23
ℹ tests 1  ℹ pass 0  ℹ fail 1
TP0503_RED_EXIT=1
```

**[TP-05-02] SCN-002-002 unit — controlled-mutation RED → byte-exact restore → GREEN**

RED: `validateRegistry` policy-mismatch boundary disabled (`if (false && …)`) → mismatch slips through.

```
$ node --test --test-name-pattern='SCN-002-002' tests/distributed-briefs.contract.mjs
✖ SCN-002-002: profile status applicability privacy and eligibility boundaries fail loud
  TypeError: Cannot read properties of undefined (reading 'reason')   # .error absent → not fail-loud
ℹ tests 1  ℹ pass 0  ℹ fail 1
TP0502_RED_EXIT=1
```

**[TP-05-01/02/03] byte-exact restore verification + unit GREEN**
```
$ shasum -a 256 rlcontracts.js
a1b9ff2385bf406f8106f0ae5858ef05d7812b6561da8ea62baebc14e5e1d6f2  rlcontracts.js
$ node --test --test-name-pattern='SCN-002-00[123]' tests/distributed-briefs.contract.mjs
✔ SCN-002-001: registry derives 23 participants 22 sources and one non-recursive aggregator
✔ SCN-002-002: profile status applicability privacy and eligibility boundaries fail loud
✔ SCN-002-003: added-source mutation derives 24 participants and 23 sources generically
ℹ tests 3  ℹ pass 3  ℹ fail 0
TP0501_02_03_GREEN_EXIT=0
```

### [TP-05-04] through [TP-05-10] full Feature-002 evidence-owner-registry suite (integration, canary, e2e, regression)
```
$ node --test tests/distributed-briefs.contract.mjs \
    tests/distributed-briefs-read-adapters.integration.mjs \
    tests/distributed-briefs-shared-canary.mjs \
    tests/distributed-briefs-foundation.e2e.mjs \
    tests/distributed-briefs-owner-canary.mjs \
    tests/distributed-briefs-owner-reads.integration.mjs \
    tests/distributed-briefs-owner-reads.e2e.mjs \
    tests/market-session-evidence.unit.mjs tests/market-session-evidence.functional.mjs \
    tests/market-session-evidence.foundation.functional.mjs tests/market-session-evidence.foundation.e2e.mjs \
    tests/market-session-evidence.source.e2e.mjs tests/released-report-evidence.e2e.mjs \
    tests/event-market-reaction.functional.mjs tests/event-market-reaction.e2e.mjs
✔ all observed 22 source adapters emit truthful production ToolModelRead outcomes            # TP-05-04
✔ Canary: observed registry retains 23 ordered links and one Market Brief aggregator          # TP-05-05
✔ Canary: five browser publishers four headless reads and RLAPP statuses preserve semantics   # TP-05-06
✔ Regression: SCN-002-001 current registry freezes 22 source reads and one non-recursive final aggregator  # TP-05-07
✔ Regression: SCN-002-002 unavailable non-live and off-theme evidence never becomes a market recommendation # TP-05-08
✔ Regression: SCN-002-003 registry-only addition joins every read consumer without inventory edits          # TP-05-09
ℹ tests 41  ℹ pass 41  ℹ fail 0
FEATURE002_SUITE_EXIT=0
```

### [TP-05-11] baseline complete repository selftest
```
$ node scripts/selftest.mjs
  ✓ Feature 002 Scope 05 validateRegistry derives 23 participants / 22 sources with one non-recursive Market Brief aggregator
  ✓ Feature 002 Scope 05 all 23 tools.json entries carry a unique briefing read adapter
  ✓ Feature 002 Scope 05 validateRegistry fails loud on missing metadata, role/profile mismatch, duplicate adapter, and policy mismatch
  ✓ Feature 002 Scope 05 a valid added source derives 24 participants / 23 sources generically
  ✓ Feature 002 Scope 05 freezeToolReads registry form emits 22 validated source reads while the legacy evidence-first form is unchanged
Research-Lab self-test: 606 passed, 0 failed
FINAL_SELFTEST_EXIT=0
```
(Baseline was 601 passed before Scope 05; the additive Scope 05 group adds +5 and the six-place
registration parity — `tools.json` ↔ index.html ↔ rlnav.js ↔ README ↔ notes/README ↔ payload
`toolCoverage` — stays green.)

## Uncertainty Declarations

None. Every DoD item is backed by a directly-executed command whose output proves the claim.

## Scenario Contract Evidence

- **SCN-002-001** — `validateRegistry` over the live `tools.json` derives 23 participants / 22
  sources with `market-brief` the sole `final-aggregator` (excluded from `orderedSourceToolIds`);
  the registry-form `freezeToolReads` emits exactly 22 validated `ToolModelRead/v1` reads. Unit +
  canary + e2e regression green; red-before-green recorded.
- **SCN-002-002** — missing metadata, role/profile mismatch, duplicate adapter, second aggregator,
  and policy mismatch each fail loud with a closed reason; a shared-evidence read cannot become
  action-eligible without an owner interpretation; every non-live-market and not-applicable source
  read is `eligible: false`. Unit + e2e regression green; red-before-green recorded.
- **SCN-002-003** — a registry-only added source derives 24/23 through the same loops, receives a
  complete typed read, and leaves every pre-existing read byte-identical; incomplete metadata fails
  before acquisition. Unit + e2e regression green; red-before-green recorded.

## Coverage Report

Not a coverage-instrumented scope. Behavioural coverage is provided by the exact scenario-to-test
mapping above (unit + integration + canary + e2e), all executed green.

## Lint and Quality

```
$ node scripts/validate-node-source-lock.mjs   → [node-source-lock] actual=PASS  adversarial=16  unexpectedAcceptances=0   (exit 0)
$ node scripts/validate-brief-cache.mjs         → [brief-cache] PASS: 354 JSON cache files parsed and available indexes coherent (exit 0)
$ node scripts/validate-brief-payload.mjs       → [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions valid (exit 0)
$ bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history → Artifact lint PASSED (exit 0)
```

**Consumer Impact Sweep** — searched `tools.json`, `index.html`, `rlnav.js`,
`scripts/selftest.mjs`, market-brief coverage, and validators for behaviour-authoritative literal
participant/source counts and parallel source inventories. None found in the in-scope code
consumers (the only `18` matches are the unrelated Trend-Dynamics `methodOrder`); the six-place
registration parity is derived, so the additive briefing metadata leaves it green. The live-derived
23/22, five-publisher, and four-headless values are retained only in the named canary constants in
`tests/distributed-briefs-shared-canary.mjs`.

**Shared Infrastructure Impact Sweep** — the protected surfaces (`tools.json`, `rldata.js`,
`scripts/brief-refresh.mjs`) are preserved: `rldata.js` is unchanged; the five browser publishers
round-trip byte-identically through `putToolRead`; the four headless Tier-A builders remain callable
exports; the RLAPP status vocabulary in the out-of-scope `rlapp.js` is unchanged. Dual-runtime: the
contract test browser-evaluates `rlcontracts.js` and asserts it stays browser-safe (no
`fetch`/`XMLHttpRequest`/`localStorage`/`document`) — green. Rollback story: the change is additive
(briefing metadata + registry read dispatch); reverting restores IDs/order and every unrelated
consumer unchanged.

## Validation Summary

DoD-level validation is complete and self-audited (Tier 1 universal + Implement Tier 2). Formal
certification remains pending `bubbles.validate`; `certification.*` and the feature `status` are
unchanged by this scope.

## Audit Verdict

Not audited (certification pending). No fabricated evidence: every checked DoD item links a
directly-executed command with its real output and exit code.

<!-- bubbles:certifying-window-begin -->

## Certification Window Evidence (2026-07-29)

Everything above this marker is prior-window history — implement-phase records that were true when
written and are retained unedited. The current certifying window starts here.

`artifact-lint.sh` resolves `report_file` as `report_files[0]` and re-runs the `full-delivery` mode gate
against every per-scope report, so these three sections are required in each one. The validation and audit
evidence below is specific to THIS scope; the chaos probe is feature-wide by nature.

### Validation Evidence

**Executed:** YES (2026-07-29, certification run)
**Phase Agent:** bubbles.validate
**Command:** `node --test tests/distributed-briefs-foundation.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs tests/distributed-briefs-read-adapters.integration.mjs tests/distributed-briefs-shared-canary.mjs tests/distributed-briefs.contract.mjs tests/market-session-evidence.foundation.e2e.mjs`
**Exit Code:** 0
**Output:**

```text
$ node --test tests/distributed-briefs-foundation.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs \
    tests/distributed-briefs-read-adapters.integration.mjs tests/distributed-briefs-shared-canary.mjs \
    tests/distributed-briefs.contract.mjs tests/market-session-evidence.foundation.e2e.mjs
# tests 17
# pass 17
# fail 0
# cancelled 0
# skipped 0
Exit Code: 0
```

### Audit Evidence

**Executed:** YES (2026-07-29, certification run)
**Phase Agent:** bubbles.audit
**Command:** recompute `sha256(exact Markdown Test Plan row bytes + LF)` for this scope's rows and compare against the frozen `rowSha256` values in `test-plan.json`
**Exit Code:** 0
**Output:**

```text
$ python3 - recompute scopes/05-registry-wide-normalized-reads/scope.md#test-plan
ROWSHA_MATCH=11 MISMATCH=0
Exit Code: 0
```

### Chaos Evidence

**Executed:** YES (2026-07-29, certification run)
**Phase Agent:** bubbles.chaos
**Command:** content-address integrity re-verification — recompute `sha256` over every file in `briefs/objects/**` and compare against its stored content address
**Exit Code:** 0
**Output:**

```text
$ python3 - verify briefs/objects content addresses
OBJECTS_VERIFIED=857 MISMATCH=0
Exit Code: 0
```

