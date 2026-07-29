# Scope 02 — Evidence Cutoff Reconciliation

**Status:** Not Started
**Depends On:** SCOPE-01
**Tags:** `foundation:true`
**Business scenarios owned:** BS-016-018, BS-016-019

---

## Objective

Give the feature exactly one evaluator of the evidence cutoff, and give it a
return shape that cannot express a widened cutoff.

`design.md` § Capability Foundation defines C2 `evidence-cutoff/v1`; §
Module Contracts specifies `RLMARKETSTRUCTURE.reconcileEvidenceCutoff` as a pure
predicate returning `{ state, reason, declaredAsOf }` where `declaredAsOf` is the
input echoed back. That echo is the mechanism: a function with no return slot
capable of carrying a relaxed bound cannot relax one. FR-016-022 becomes
structural rather than a rule a reviewer must remember.

This scope depends on SCOPE-01 because a reconciliation needs a candidate as-of
to reconcile, and before SCOPE-01 the snapshot as-of does not survive parsing.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `rlexperience-adapters/market-structure.js` | Owner modules — extended, bounded; the row's `reconcileEvidenceCutoff` addition | Add `reconcileEvidenceCutoff(declaredAsOf, candidateAsOf, policy) -> CutoffReconciliationV1`. Pure over its three arguments, no clock read, no I/O. No existing exported behaviour changes shape |
| `scripts/selftest.mjs` | Tests and documentation — "assertion groups for the new pure entry points on both owner modules" | Add the assertion group for this entry point, including the case that proves the return shape cannot widen the declared bound |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature** | Append this scope's own persistent regression case to the file SCOPE-01 creates, exactly as that scope's table anticipates when it records that later scopes extend the same file. This scope adds no other case and renders no lens |

The module header rule at `rlexperience-adapters/market-structure.js` lines
12–15 holds unchanged: no `fetch`, no `providerFetch`, and no import of another
domain adapter module.

---

## Change Boundary

This scope adds one export to an owner module that five registered pages already
load — `intraday-tape-lab.html`, `market-heatmap-lab.html`,
`swing-structure-lab.html`, `volatility-sizing-lab.html` and
`technical-analysis-decision-lab.html`. The boundary below is what keeps that
addition from becoming a behavioural edit to any of them.

**Allowed file families**

| Family | Concrete path | What may change inside it |
|---|---|---|
| Owner module — additive export only | `rlexperience-adapters/market-structure.js` | One new export, `reconcileEvidenceCutoff`. No existing export changes signature, return shape or behaviour |
| Assertion surface | `scripts/selftest.mjs` | One new assertion group for this entry point |
| Feature live-stack spec | `tests/auction-gamma-playbook.spec.mjs` | This scope's one persistent regression case, appended |

**Excluded surfaces** — a diff reaching any row below is a boundary breach rather
than an in-scope change:

| Excluded surface | Why it is excluded here |
|---|---|
| `sessionGammaTag` (`market-structure.js` lines 959–967) | SCOPE-06 owns that work; it stays byte-unchanged in this scope |
| `computeSessionAuctionSummary` (line 978), `sessionSummaryPath` (lines 1101–1106), `SESSION_OUTPUT_PATHS` (line 934) | SCOPE-04 owns the `summary.playbook` extension to all three |
| `resolvePlaybookCell` | It does not exist yet; SCOPE-04 adds it and consumes this predicate rather than re-deriving the cutoff |
| The five pages that load this module | This scope edits no page; the pages are exercised as consumers by TP-02-08 and never modified |
| `rlexperience-adapters/options.js` | The module header rule at lines 12–15 forbids importing another domain adapter, so no edge is created |
| `simple-models.json`, `tools.json`, `index.html` | This scope registers nothing and moves no registered count |

---

## Gherkin Scenarios

### BS-016-018: A cutoff mismatch reduces the read instead of silently fusing

```gherkin
Scenario: The gamma snapshot's as-of does not reconcile with the auction read's evidence cutoff
  Given the session auction state is ready under a stated evidence cutoff
  And the gamma snapshot's stated as-of falls outside that cutoff
  When the user requests the playbook read
  Then the gamma half is classified stale rather than ready
  And the read states the snapshot's as-of and the cutoff it failed
  And an auction-only reduced read is issued instead of a fused assertion
  And no behavioural regime derived from the stale snapshot is asserted
```

### BS-016-019: The declared cutoff is never widened to admit a stale input

```gherkin
Scenario: A user checks whether a stale gamma input was admitted by relaxing the cutoff
  Given a gamma snapshot's as-of falls outside the stated evidence cutoff
  When the user inspects the read and its declared cutoff
  Then the declared cutoff shown is the same one the auction half was asserted against
  And the stale gamma input is excluded rather than admitted
  And the read presents staleness as staleness rather than resolving it by relaxation
```

---

## Implementation Plan

**1. Add `reconcileEvidenceCutoff` as a pure predicate.**
Signature `(declaredAsOf, candidateAsOf, policy) -> { state, reason, declaredAsOf }`.
`declaredAsOf` is fixed at the auction observation and is echoed unchanged into
the result. `candidateAsOf` is the gamma snapshot's own as-of, supplied by
SCOPE-01. `policy` carries the declared window; it is a caller-supplied input, not
a module secret, so the bound the record discloses is the bound the caller
declared.

**2. Enumerate the states, each with a reason.**
Every return carries both `state` and `reason`, satisfying the
`calibrationPolicy.requiredFields: ["state","reason"]` declaration at
`simple-models.json` line 109. The reconciling case, the outside-the-window case
and the no-candidate-as-of case are three distinct named states; none is
represented by `null` and none by a bare boolean, because neither carries a
reason.

**3. Make widening structurally impossible.**
The return has no field able to express a bound other than the one supplied. A
candidate outside the window is reported as outside the window and excluded. The
function never returns a second, larger window, and it never returns the
candidate's own as-of in the `declaredAsOf` slot.

**4. Keep the gamma half from selecting the cutoff.**
`design.md` § What may never be inferred or defaulted states the cutoff is fixed
at the auction observation and a non-reconciling input is excluded. The gamma
as-of is only ever the candidate argument. It has no path into the declared bound.

**5. Keep determinism.**
No clock read, no randomness, no I/O. `seedPolicy.randomnessClass` is `"none"` at
`simple-models.json` line 107 and this addition keeps it so, which is what makes
AC-016-045 follow from the absence of nondeterministic inputs rather than from an
observed test run.

**Boundary held.** `summary.sessionType`, `summary.levels` and `summary.control`
keep their current shapes. `sessionGammaTag` at lines 959–967 is untouched here;
SCOPE-06 owns its repair. `resolvePlaybookCell` does not exist yet; SCOPE-04 adds
it and consumes this result rather than re-deriving it, which is what gives the
cutoff exactly one evaluator.

---

## Test Plan

This scope's Implementation Files are `rlexperience-adapters/market-structure.js`,
`scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`. It adds a
pure predicate and renders nothing, so every unit row runs
`node scripts/selftest.mjs`. The one browser row asserts the predicate executing
inside the real page from the real module file, which is the technique
`tests/simple-model-adapters-market.spec.mjs` already uses for this same module;
it makes no claim about a rendered playbook cell, because no page reads this
predicate until SCOPE-04 adds `resolvePlaybookCell`. The rendered-lens browser
proof belongs to the scopes whose Implementation Files include the page.

**Adversarial fixture rule for this scope.** BS-016-019 forbids a widened cutoff.
A fixture whose candidate as-of already falls inside the window would return the
same result whether or not the return shape can express a relaxed bound, so it
proves nothing. The adversarial rows below supply a candidate as-of that falls
**outside** the declared window and assert that `declaredAsOf` comes back
byte-identical to the input — an assertion that fails the moment the function
echoes the candidate or emits a second, larger window.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-02-01 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | A candidate as-of inside the declared window returns the reconciling state with its own named reason, and `declaredAsOf` echoes the input | `node scripts/selftest.mjs` | No |
| TP-02-02 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | A candidate as-of outside the declared window returns the stale state, and the reason names both the candidate as-of and the cutoff it failed rather than reporting an unqualified failure | `node scripts/selftest.mjs` | No |
| TP-02-03 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | A candidate carrying no as-of returns a third distinct named state with its own reason; the function returns neither `null` nor a bare boolean on any of the three paths, because neither can carry a reason | `node scripts/selftest.mjs` | No |
| TP-02-04 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | Every returned state carries both `state` and `reason`, satisfying `calibrationPolicy.requiredFields: ["state","reason"]` at `simple-models.json` line 109 | `node scripts/selftest.mjs` | No |
| TP-02-05 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | Adversarial input: a candidate as-of well outside the declared window. `declaredAsOf` in the result is byte-identical to the `declaredAsOf` argument and is never the candidate's value, and the returned object exposes no field able to express a second or larger window — so the assertion fails if a relaxed bound is ever emitted | `node scripts/selftest.mjs` | No |
| TP-02-06 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | Adversarial input: the gamma as-of offered in every argument position in turn. It reconciles only as `candidateAsOf`; no call shape routes it into the declared bound, so the excluded stale input stays excluded rather than becoming the cutoff | `node scripts/selftest.mjs` | No |
| TP-02-07 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | The same three arguments evaluated twice produce an identical result, with no clock read, no randomness and no I/O, keeping `seedPolicy.randomnessClass: "none"` at `simple-models.json` line 107 true of the addition | `node scripts/selftest.mjs` | No |
| TP-02-08 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-019 the declared evidence cutoff is echoed unchanged and never widened` | The persistent regression case for the behaviour this scope adds, asserted on the real `intraday-tape-lab.html` page with the real `rlexperience-adapters/market-structure.js` file injected — the same real-module-into-real-page technique `tests/simple-model-adapters-market.spec.mjs` already applies to this module — and with no `page.route`, no `context.route` and no request interception: calling `RLMARKETSTRUCTURE.reconcileEvidenceCutoff` in the page with a candidate as-of well outside the declared window returns `declaredAsOf` byte-identical to the supplied bound and exposes no field carrying a second or larger window. A build that echoes the candidate into that slot or emits a relaxed bound fails this case in the browser, not only in Node | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-019 the declared evidence cutoff is echoed unchanged and never widened" --reporter=list` | Yes |
| TP-02-09 | Stress | `stress` | `scripts/selftest.mjs` group `Feature 016 Scope 02 evidence cutoff reconciliation (market-structure)` | `reconcileEvidenceCutoff` is driven over every as-of the published set carries — the 22 `asof` stamps in `data/options/index.json` — crossed with all three reachable states and evaluated back-to-back in one pass. Every call returns both `state` and `reason`; the slowest single evaluation stays inside the 250 ms `performancePolicy.maxComputeMs` declared for this adapter module at `simple-models.json` line 111; and the last pass over identical arguments returns a result identical to the first, so no clock read and no accumulated state leaks into the predicate at volume | `node scripts/selftest.mjs` | No |

---

### Definition of Done

- [ ] `[TP-02-01]` `[BS-016-018]` A gamma snapshot whose as-of falls inside the stated cutoff reconciles to the ready state with a named reason, so the fused path is reachable only through this predicate.
- [ ] `[TP-02-02]` `[BS-016-018]` A gamma snapshot whose as-of falls outside the stated cutoff is classified stale, and the result names the snapshot's as-of and the cutoff it failed.
- [ ] `[TP-02-03]` `[BS-016-018]` A candidate with no as-of resolves to its own named state; no path returns `null` and no path returns a bare boolean.
- [ ] `[TP-02-04]` `[BS-016-018]` Every state this predicate returns carries a `reason`, so a caller rendering a reduced read always has a cause to state.
- [ ] `[TP-02-05]` `[BS-016-019]` Given a candidate as-of outside the window, the returned `declaredAsOf` equals the supplied `declaredAsOf` exactly, and no returned field can express a bound other than the one the caller declared.
- [ ] `[TP-02-06]` `[BS-016-019]` A user checks whether a stale gamma input was admitted by relaxing the cutoff: the gamma as-of reaches the predicate only as `candidateAsOf` and no call shape routes it into the declared bound, so the cutoff stays the one the auction half was asserted against; the stale input is excluded rather than admitted, and staleness is reported as staleness rather than resolved by relaxation.
- [ ] `[TP-02-07]` `[BS-016-019]` Repeated evaluation over identical arguments yields an identical result, so the declared bound cannot vary between two readings of the same evidence.
- [ ] `[TP-02-09]` `[BS-016-018]` Evaluated over all 22 published as-of stamps across the three reachable states, every call returns both `state` and `reason`, the slowest evaluation stays inside the 250 ms budget declared at `simple-models.json` line 111, and the last pass matches the first exactly.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-02-08]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-019 the declared evidence cutoff is echoed unchanged and never widened`, which executes the real module inside the real page and fails the moment `declaredAsOf` returns anything other than the bound the caller supplied.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the real-page Playwright regression spec that already injects this exact module into five pages, `tests/simple-model-adapters-market.spec.mjs`, both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.
- [ ] Change Boundary is respected and zero excluded file families were changed — the diff for this scope contains only `rlexperience-adapters/market-structure.js`, `scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`; `sessionGammaTag` at lines 959–967, `sessionSummaryPath` at lines 1101–1106 and `SESSION_OUTPUT_PATHS` at line 934 are byte-unchanged, and no page, no registry and no sibling adapter module appears in it.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; no registry count moves, because this scope registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] `notes/intraday-tape-lab.md` states that one evaluator decides the evidence cutoff, matching the behaviour this scope shipped.
- [ ] Only the paths in this scope's Implementation Files table were modified; `sessionGammaTag` at lines 959–967 is byte-unchanged.
