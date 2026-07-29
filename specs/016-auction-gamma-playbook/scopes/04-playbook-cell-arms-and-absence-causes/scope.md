# Scope 04 — Playbook Cell Arms And Absence Causes

**Status:** Not Started
**Depends On:** SCOPE-02, SCOPE-03
**Tags:** `foundation:true`
**Business scenarios owned:** BS-016-008, BS-016-010, BS-016-014, BS-016-015, BS-016-021, BS-016-022, BS-016-032, BS-016-033

---

## Objective

Add the fusion vertex and make every input combination land on a named arm.

`design.md` § Capability Foundation defines C4 `playbook-cell/v1` and C5
`absence-cause/v1`. § Module Contracts specifies
`RLMARKETSTRUCTURE.resolvePlaybookCell` as returning a `context-only` arm when the
auction half is not ready, a `reduced` arm when the regime is not ready, and a
`fused` arm only when both are ready under one binding cutoff — never `null`.

This scope owns the arm selection, the absence causes that explain a non-fused
arm, the provenance and confidence rules that fusion must not violate, and the
registry declaration that lets the gamma-participation lever prove it moved the
cell. SCOPE-05 owns what a `fused` arm actually says.

The `simple-models.json` edit lands here rather than in a registry scope because
it is one half of a lockstep pair: `sensitivityPolicy.requireOutputEffect` is
`true` at line 108, so a parameter that moves the cell without declaring
`summary.playbook` in both `affectsOutputPaths` and `SESSION_OUTPUT_PATHS` reports
as having no effect — a false negative in the exact mechanism meant to prove the
lever works. Splitting the pair across scopes would ship that false negative.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `rlexperience-adapters/market-structure.js` | Owner modules — extended, bounded | Add `resolvePlaybookCell`; extend `computeSessionAuctionSummary` (line 978) with `summary.playbook`; extend `sessionSummaryPath` (lines 1101–1106) and `SESSION_OUTPUT_PATHS` (line 934) with that path; make `flatRegionProof.reason` (lines 1206–1209) name the specific absence cause |
| `simple-models.json` | Registries — extended, bounded | Extend `gamma-context.affectsOutputPaths` (line 104) with `"summary.playbook"`, and add the same path to any other parameter whose change moves the cell |
| `scripts/selftest.mjs` | Tests and documentation — "assertion groups for the new pure entry points on both owner modules" | Add the assertion group for `resolvePlaybookCell` arm selection, the absence-cause vocabulary and the provenance and confidence bounds |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature** | Append this scope's one persistent regression case to the file SCOPE-01 creates, exactly as that scope's table anticipates when it records that later scopes extend the same file. This scope adds no other case and renders no lens |

Verified at `simple-models.json` line 104: `gamma-context` currently declares
`"affectsOutputPaths":["summary.sessionType"]`. Verified at line 108:
`"sensitivityPolicy": {"method":"one-at-a-time","requireOutputEffect":true,"flatRegionPolicy":"explicit-proof"}`.
Verified at `market-structure.js` lines 1101–1106: `sessionSummaryPath` enumerates
exactly `summary.sessionType`, `summary.levels` and `summary.control`, then
returns `null`.

`inputRequirements.stalePolicy` (line 98), `seedPolicy` (line 107),
`calibrationPolicy` (line 109), `provenancePolicy` (line 110), `performancePolicy`
(line 111) and `deepLinkTargets` (line 113) are unchanged. No definition is added
or removed — the count stays 23.

---

## Change Boundary

This scope is the feature's only repair scope on the owner module: two existing
behaviours change rather than one new export being added. `sessionSummaryPath`
(lines 1101–1106) currently enumerates exactly `summary.sessionType`,
`summary.levels` and `summary.control` and then returns `null`, and
`flatRegionProof.reason` (lines 1206–1209) is a generic sentence. Repairs reach
further than additions, and the module is loaded by five registered pages, so the
boundary below is what keeps these two repairs from becoming a behavioural edit
to anything else.

**Allowed file families**

| Family | Concrete path | What may change inside it |
|---|---|---|
| Owner module — one additive export plus two bounded repairs | `rlexperience-adapters/market-structure.js` | The new export `resolvePlaybookCell`; `summary.playbook` added to `computeSessionAuctionSummary` (line 978), to the `sessionSummaryPath` enumeration (lines 1101–1106) and to `SESSION_OUTPUT_PATHS` (line 934); `flatRegionProof.reason` (lines 1206–1209) made to name the specific C5 cause. No other export changes signature, return shape or behaviour |
| Registry — one existing declaration extended | `simple-models.json` | `gamma-context.affectsOutputPaths` (line 104) gains `"summary.playbook"`, and any other parameter whose change moves the cell gains the same string. No definition is added or removed |
| Assertion surface | `scripts/selftest.mjs` | One new assertion group for `resolvePlaybookCell`, the absence-cause vocabulary and the provenance and confidence bounds |
| Feature live-stack spec | `tests/auction-gamma-playbook.spec.mjs` | This scope's one persistent regression case, appended |

**Excluded surfaces** — a diff reaching any row below is a boundary breach rather
than an in-scope change:

| Excluded surface | Why it is excluded here |
|---|---|
| `sessionGammaTag` (`market-structure.js` lines 959–967) | SCOPE-06 owns its repair; it stays byte-unchanged in this scope, and its `"wall-context"` return is never reused as a regime value |
| The body of the `fused` arm | SCOPE-05 owns what a fused arm says. This scope selects the arm and populates the non-fused ones; it states no expectation, no trade shape and no falsifier |
| `summary.sessionType`, `summary.levels`, `summary.control` | Existing consumers read all three at their current shapes; `summary.playbook` is added beside them and none of the three is reshaped |
| `reconcileEvidenceCutoff` | SCOPE-02 owns it. This scope consumes its result and never re-derives the cutoff, which is what keeps the cutoff on exactly one evaluator |
| Every page, including `intraday-tape-lab.html` | This scope edits no page. The page is exercised as a consumer by TP-04-12 and never modified; SCOPE-07 owns the rendered lens |
| `rlexperience-adapters/options.js` | The module header rule at `market-structure.js` lines 12–15 forbids importing another domain adapter, so no edge is created; the regime arrives as data on frozen owner state |
| `tools.json`, `index.html`, `rlnav.js` | This scope registers no tool and moves no registered count |
| `data/options/**` | Read only, which is NFR-016-006; TP-04-13 reads the published set and writes nothing back to it |

---

## Gherkin Scenarios

### BS-016-008: A ready gamma context with no auction state asserts nothing

```gherkin
Scenario: A gamma context is ready before the session has established an auction state
  Given the gamma context is ready and carries its snapshot as-of and its provenance class
  And no session auction state has reached readiness
  When the user requests a playbook read
  Then the gamma context is presented as context only
  And no expectation, no direction and no trade shape is asserted
  And the read names the absent auction state as the reason nothing is asserted
  And the read is distinguishable from a read in which an expectation was asserted
```

### BS-016-010: A forming auction state converts gamma context into an asserted cell on readiness

```gherkin
Scenario: The session develops enough structure to establish an auction state
  Given the gamma context is ready and no auction state has reached readiness
  And the read presents gamma as context only with no asserted expectation
  When the auction state reaches readiness under the same evidence cutoff
  Then a fully qualified playbook cell becomes available
  And the cell states the expectation, the trade shape and the falsifier
  And the change from a context-only read to an asserted cell is visible to the user
```

### BS-016-014: A missing gamma half yields a named auction-only read

```gherkin
Scenario: The gamma half is unavailable for a ticker whose auction state is ready
  Given the session auction state is ready
  And no usable gamma evidence exists for that ticker under the stated evidence cutoff
  When the user requests the playbook read
  Then the read is presented as an explicitly auction-only expectation
  And the read names the missing input, its availability state and the reason it is unavailable
  And no behavioural regime is asserted
  And the auction-only expectation still carries its own falsifier
```

### BS-016-015: An absent regime is never rendered as a neutral one

```gherkin
Scenario: A user compares an unavailable gamma half against a measured stable regime
  Given one read has no usable gamma evidence
  And a second read has usable gamma evidence that resolves to a stable regime
  When the user views both reads
  Then the first read displays the gamma half as unavailable
  And the first read does not display a balanced, neutral or mid-range regime in place of the missing one
  And the two reads are distinguishable without the user inspecting their underlying evidence
```

### BS-016-021: Fusion never upgrades an input's provenance class

```gherkin
Scenario: A user traces each approximation through a fused playbook cell
  Given a playbook cell fuses a bar-reconstructed auction input, an up/down-volume proxy input and a convention-dependent gamma input
  When the user inspects the cell's basis
  Then each participating primitive retains the provenance class it carried before the fusion
  And the bar-reconstructed input remains labelled a model estimate
  And the up/down-volume input remains labelled a proxy
  And the gamma input remains labelled a convention-dependent estimate
  And the fused cell carries no provenance class stronger than that of any of its inputs
```

### BS-016-022: Stated confidence cannot exceed the weakest participating input

```gherkin
Scenario: A user compares a cell's stated confidence against its least-qualified primitive
  Given a playbook cell enumerates each participating primitive with its provenance class and availability state
  When the user identifies the least-qualified participating primitive
  Then the cell's stated confidence does not exceed the confidence that primitive supports
  And the cell names which primitive bounds its confidence
```

### BS-016-032: Excluding gamma context yields a labelled auction-only read

```gherkin
Scenario: The user selects the declared parameter value that excludes gamma context
  Given usable gamma evidence exists under the stated evidence cutoff
  And the user selects the parameter value that excludes gamma context from participating
  When the user reads the playbook
  Then the read presents an auction-only expectation
  And the read states that gamma context was excluded by the user's own parameter selection
  And no behavioural regime is asserted
  And the auction-only expectation still carries its own falsifier
```

### BS-016-033: An excluded gamma half is distinguishable from an unavailable one

```gherkin
Scenario: A user compares a parameter-excluded gamma half against an unavailable one
  Given one read excluded gamma context by the user's parameter selection
  And a second read has no usable gamma evidence
  When the user views both reads
  Then the first read attributes the absence to the user's parameter selection
  And the second read attributes the absence to the missing or disqualified evidence and names it
  And the two reads are distinguishable from each other
  And selecting the parameter value that includes gamma context restores a fused cell for the first read
```

---

## Implementation Plan

**1. Add `resolvePlaybookCell(auctionSummary, regimeRead, cutoffRead, opts)`.**
It selects one C4 arm and populates it. `context-only` when the auction half is
not ready; `reduced` when the auction half is ready and the regime is not; `fused`
only when both are ready under one binding cutoff. Every input combination maps to
a named arm, so the function never returns `null` and a caller never has to invent
a meaning for absence.

**2. Populate C5 as a closed cause set with a recoverable flag.**
`design.md` § Failure Handling And Degradation states the distinguishing fact is
`recoverable`, true for exactly one of the five causes. `parameter-excluded`
carries `recoverable: true`; the evidence-side causes carry `recoverable: false`.
That single field is what lets a user tell whether flipping the lever would
restore the gamma half, and it is why a user's own setting is never presented as a
data problem and a data problem is never presented as the user's setting.

**3. Degrade honestly on a v1 owner-state shape.**
Owner state carrying the v1 `gamma: { callWall, putWall, flip }` projection — no
`netGEX`, no `asOf` — yields a `reduced` arm with an absence cause naming the
missing evidence. It does not throw and it does not synthesize a regime. This
keeps the module correct against a page that has not yet moved to v2, which
SCOPE-06 owns.

**4. Never emit a neutral regime for an absent one.**
There is no balanced, neutral, mid-range or `wall-context` value available in the
regime slot of a `reduced` arm. The slot carries the availability state and the
named cause instead, so a rendering surface has nothing neutral to display even if
it tried.

**5. Carry provenance through fusion unchanged.**
Each participating primitive keeps the class it carried before fusion. The four
classes at `simple-models.json` line 110 are reused exactly and no parallel
vocabulary is introduced. `design.md` § What may never be inferred or defaulted
forbids promoting a class because several inputs agree.

**6. Bound confidence by the weakest participating input and name it.**
The cell states which primitive bounds it. Confidence is neither averaged across
primitives nor taken from the strongest.

**7. Extend `computeSessionAuctionSummary` with `summary.playbook`.**
Line 978 gains the field, populated by `resolvePlaybookCell`. The existing
`summary.sessionType`, `summary.levels` and `summary.control` keep their current
shapes so existing consumers are unaffected. The `gammaTag` assignment at line
1006 stays.

**8. Move the sensitivity declarations in lockstep.**
`sessionSummaryPath` gains `summary.playbook` so `compareSensitivity` at line 1185
can fingerprint the new path. `SESSION_OUTPUT_PATHS` gains it for `gamma-context`
and for every other parameter whose change moves the cell.
`simple-models.json`'s `gamma-context.affectsOutputPaths` gains the same string.
All three move together in this scope.

**9. Make the flat-region proof specific.**
When `gamma-context` changes and `summary.playbook` does not move because the
gamma half was already unavailable, `flatRegionProof.reason` states the C5 cause
rather than the current generic sentence verified at lines 1206–1209.
`flatRegionPolicy: "explicit-proof"` is only meaningful if the proof is specific.

**Boundary held.** No import of `RLOPTIONS` is added — the regime arrives as data
on frozen owner state, the channel `gamma` already uses. `resolvePlaybookCell` is a
pure function of the deep-frozen owner state and the parameter map, with no clock
read, no randomness and no I/O. `sessionGammaTag` at lines 959–967 is untouched
here; SCOPE-06 owns its repair.

---

## Test Plan

This scope's Implementation Files are `rlexperience-adapters/market-structure.js`,
`simple-models.json`, `scripts/selftest.mjs` and
`tests/auction-gamma-playbook.spec.mjs`. It adds a pure entry point and one
registry declaration and edits no page, so its Node rows run
`node scripts/selftest.mjs` and `node scripts/validate-tool-experience.mjs`. Its
one browser row asserts the arm selection executing inside the real page from the
real module file — the technique `tests/simple-model-adapters-market.spec.mjs`
already applies to this exact module, injecting it with
`page.addScriptTag({ path: descriptor.moduleFile })` at line 482 against the
`intraday-tape-lab.html` descriptor at line 327, under the file header at line 17
recording that there is no `page.route` and no `context.route`. That row makes no
claim about a rendered playbook lens, because no page reads `summary.playbook`
until SCOPE-07 renders it. The rendered-lens browser proof belongs to the scope
whose Implementation Files include the page.

**Adversarial fixture rule for this scope.** Two behaviours here are repairs, not
additions, and each needs a fixture the pre-change code fails. `sessionSummaryPath`
(lines 1101–1106) enumerates exactly `summary.sessionType`, `summary.levels` and
`summary.control` and then returns `null` — so a fixture exercising only those
three paths passes before and after and proves nothing; the adversarial row asks
for `summary.playbook` specifically. `flatRegionProof.reason` (lines 1206–1209) is
a generic sentence today — so an assertion that merely checks the reason is
non-empty passes before and after; the adversarial row asserts the specific C5
cause appears, which the generic sentence fails.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-04-01 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | An auction half that has not reached readiness selects the `context-only` arm, which names the absent auction state and populates no expectation, no direction and no trade shape | `node scripts/selftest.mjs` | No |
| TP-04-02 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Re-resolving the same ticker once the auction half reaches readiness under the same cutoff moves the arm from `context-only` to `fused`, and the two results are distinguishable by arm rather than by inspecting their contents | `node scripts/selftest.mjs` | No |
| TP-04-03 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | A ready auction half with no usable gamma evidence selects the `reduced` arm, naming the missing input, its availability state and the reason, while the auction-only expectation still carries its own falsifier | `node scripts/selftest.mjs` | No |
| TP-04-04 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Adversarial input: a `reduced` arm resolved from owner state offering `"wall-context"` and a mid-range value in the regime position. The regime slot admits neither; it carries only the availability state and the named cause, so a rendering surface has no balanced, neutral or mid-range value to display | `node scripts/selftest.mjs` | No |
| TP-04-05 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | A `fused` arm over a bar-reconstructed input, an up/down-volume proxy and a convention-dependent gamma input leaves each primitive's provenance class as it entered, using the four classes at `simple-models.json` line 110 and introducing no parallel vocabulary | `node scripts/selftest.mjs` | No |
| TP-04-06 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Stated confidence equals what the weakest participating primitive supports and the cell names that primitive; a fixture whose primitives differ in strength proves the value is neither averaged across them nor taken from the strongest | `node scripts/selftest.mjs` | No |
| TP-04-07 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Selecting the declared parameter value that excludes gamma context yields a `reduced` arm whose cause is `parameter-excluded` with `recoverable: true`, and whose auction-only expectation still carries its own falsifier | `node scripts/selftest.mjs` | No |
| TP-04-08 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Adversarial input: two `reduced` arms whose rendered gamma halves are both absent — one `parameter-excluded`, one evidence-side. They differ in cause and in `recoverable`, and flipping the parameter back to the including value restores a `fused` arm for the first and leaves the second reduced | `node scripts/selftest.mjs` | No |
| TP-04-09 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Adversarial input: `sessionSummaryPath('summary.playbook')` specifically. It returns a fingerprintable path rather than the `null` the lines 1101–1106 enumeration returns today, and `SESSION_OUTPUT_PATHS` carries `summary.playbook` for `gamma-context`, so `compareSensitivity` at line 1185 can observe the cell moving | `node scripts/selftest.mjs` | No |
| TP-04-10 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | Adversarial input: `gamma-context` varied while the gamma half is already unavailable, so `summary.playbook` genuinely does not move. `flatRegionProof.reason` names the specific C5 cause; the generic sentence at lines 1206–1209 does not satisfy the assertion, so a non-empty-reason check alone cannot pass it | `node scripts/selftest.mjs` | No |
| TP-04-11 | Registry | `registry` | `scripts/validate-tool-experience.mjs` `invariant(...)` assertions at lines 493–496 | After the `simple-models.json` edit, `gamma-context.affectsOutputPaths` carries `summary.playbook` while the definition count stays 23 and `inputRequirements.stalePolicy`, `seedPolicy`, `calibrationPolicy`, `provenancePolicy`, `performancePolicy` and `deepLinkTargets` are unchanged — so the parameter the user selects is the declared one and not a newly introduced definition | `node scripts/validate-tool-experience.mjs` | No |
| TP-04-12 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-033 the playbook cell path is fingerprintable and an excluded gamma half stays distinguishable from an unavailable one` | The persistent regression case for the two behaviours this scope repairs, asserted on the real `intraday-tape-lab.html` page with the real `rlexperience-adapters/market-structure.js` file injected — the same real-module-into-real-page technique `tests/simple-model-adapters-market.spec.mjs` already applies to this module at line 482 — and with no `page.route`, no `context.route` and no request interception. In the page, `sessionSummaryPath` resolves `summary.playbook` to a fingerprintable value rather than the `null` the lines 1101–1106 enumeration returns today; a `parameter-excluded` reduced arm and an evidence-side reduced arm return two different C5 causes with two different `recoverable` values; and the flat-region proof raised when `gamma-context` moves against an already-absent gamma half names that specific cause rather than the generic sentence at lines 1206–1209. A build that reinstates the `null`-returning path enumeration or the generic proof sentence fails this case in the browser, not only in Node | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-033 the playbook cell path is fingerprintable and an excluded gamma half stays distinguishable from an unavailable one" --reporter=list` | Yes |
| TP-04-13 | Stress | `stress` | `scripts/selftest.mjs` group `Feature 016 Scope 04 playbook cell arms and absence causes (market-structure)` | `resolvePlaybookCell` is driven over the entire published set `data/options/index.json` declares — 22 tickers, 39,190 contracts and 4,692,202 bytes of snapshot JSON on disk, the largest single file `data/options/NDX.json` carrying 6,066 contracts in 570,547 bytes — crossed with all three C4 arms and all five C5 causes, resolved back-to-back in one pass. Every call returns a named arm and never `null`; every non-fused arm carries both its cause and its `recoverable` flag; the slowest single resolution stays inside the 250 ms `performancePolicy.maxComputeMs` declared for this module at `simple-models.json` line 111; and the last pass over identical arguments returns a result identical to the first, so no clock read and no accumulated state leaks into the resolver at volume | `node scripts/selftest.mjs` | No |

---

### Definition of Done

- [ ] `[TP-04-01]` `[BS-016-008]` A ready gamma context with no auction state yields a `context-only` arm that asserts no expectation, direction or trade shape and names the absent auction state as the reason.
- [ ] `[TP-04-02]` `[BS-016-010]` The session develops enough structure to establish an auction state: when the auction state reaches readiness under the same evidence cutoff, the arm becomes `fused` with expectation, trade shape and falsifier populated, and the change from a context-only read to an asserted cell is visible in the arm itself.
- [ ] `[TP-04-03]` `[BS-016-014]` A ready auction half with no usable gamma evidence yields an explicitly auction-only read that names the missing input, its availability state and its reason, and still carries its own falsifier.
- [ ] `[TP-04-04]` `[BS-016-015]` The `reduced` arm's regime slot accepts no balanced, neutral, mid-range or `wall-context` value; it carries the availability state and named cause, making an unavailable half distinguishable from a measured stable one without inspecting the evidence.
- [ ] `[TP-04-05]` `[BS-016-021]` A user traces each approximation through a fused playbook cell: every participating primitive keeps the provenance class it carried into the fusion — the bar-reconstructed input stays labelled a model estimate, the up/down-volume input stays labelled a proxy, the gamma input stays labelled a convention-dependent estimate — and the fused cell carries no provenance class stronger than any of its inputs.
- [ ] `[TP-04-06]` `[BS-016-022]` The cell's stated confidence does not exceed what its least-qualified participating primitive supports, and the cell names which primitive bounds it.
- [ ] `[TP-04-07]` `[BS-016-032]` The parameter value that excludes gamma context yields an auction-only read attributed to the user's own selection, with `recoverable: true` and no behavioural regime asserted.
- [ ] `[TP-04-08]` `[BS-016-033]` A parameter-excluded gamma half and an unavailable one are distinguishable by cause and by `recoverable`, and restoring the including parameter value returns a fused cell for the first only.
- [ ] `[TP-04-09]` `[BS-016-032]` `sessionSummaryPath` resolves `summary.playbook`, and `SESSION_OUTPUT_PATHS` and `gamma-context.affectsOutputPaths` both carry it, so the lever's effect on the cell is observable rather than reported as no effect.
- [ ] `[TP-04-10]` `[BS-016-033]` When the cell does not move because the gamma half was already unavailable, the flat-region proof names that specific absence cause rather than restating a generic sentence.
- [ ] `[TP-04-11]` `[BS-016-032]` The registry edit extends the existing `gamma-context` declaration without moving any registered count and without altering any adjacent policy block.
- [ ] `[TP-04-13]` `[BS-016-015]` Resolved across all 22 published snapshots crossed with all three arms and all five causes, every call returns a named arm and never `null`, every non-fused arm carries its cause and its `recoverable` flag, the slowest resolution stays inside the 250 ms budget declared at `simple-models.json` line 111, and the last pass matches the first exactly.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-04-12]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-033 the playbook cell path is fingerprintable and an excluded gamma half stays distinguishable from an unavailable one`, which executes the real module inside the real page and fails the moment `sessionSummaryPath` returns `null` for `summary.playbook` again, the two absence causes collapse into one, or the flat-region proof falls back to the generic sentence at lines 1206–1209.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite, the registry validator `node scripts/validate-tool-experience.mjs`, and the real-page Playwright regression spec that already injects this exact module into five pages, `tests/simple-model-adapters-market.spec.mjs`, all run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.
- [ ] Change Boundary is respected and zero excluded file families were changed — the diff for this scope contains only `rlexperience-adapters/market-structure.js`, `simple-models.json`, `scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`; `sessionGammaTag` at lines 959–967 is byte-unchanged, `summary.sessionType`, `summary.levels` and `summary.control` keep their current shapes, the `fused` arm body SCOPE-05 owns is unpopulated here, and no page, no `tools.json` entry and no sibling adapter module appears in it.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean with all eleven hard-asserted counts holding and the definition count still 23.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] `notes/intraday-tape-lab.md` states the arm vocabulary and the absence causes a reader can encounter, matching the behaviour this scope shipped.
- [ ] Only the paths in this scope's Implementation Files table were modified; `summary.sessionType`, `summary.levels`, `summary.control` and `sessionGammaTag` are behaviourally unchanged.
