# Scope 05 — Behavioural Expectation Matrix, Origin Rule And Falsifiers

**Status:** Not Started
**Depends On:** SCOPE-04
**Tags:** `foundation:true`
**Business scenarios owned:** BS-016-001, BS-016-002, BS-016-003, BS-016-004, BS-016-005, BS-016-006, BS-016-007, BS-016-009, BS-016-011, BS-016-012

---

## Objective

Fill the `fused` arm SCOPE-04 created: state what the pairing of an auction state
and a behavioural regime actually expects, and make every asserted expectation
carry a falsifier a user can check unaided.

This is the capability's primary outcome expressed as one matrix. Two auction
classes — balancing and imbalanced — cross three regime values — suppressive,
amplifying and hinge-proximate — giving the six behavioural cells of BS-016-001
through BS-016-006, plus the comparison in BS-016-007 that proves the regime and
not the structure is the discriminator.

Three invariants hold across every cell in that matrix and are inseparable from
it: only an auction primitive may originate a level, target or direction
(BS-016-009); a pairing with no statable falsifier is not asserted at all
(BS-016-011); and every cell that is asserted exposes its falsifier alongside the
expectation (BS-016-012). They are owned here because they are properties of the
assembly this scope writes, not of a surface that renders it.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `rlexperience-adapters/market-structure.js` | Owner modules — extended, bounded | Populate the `fused` arm inside `resolvePlaybookCell`: the expectation, the trade shape, the `basis` entries with their `origin` and `qualifier` roles, and the expectation-level falsifier |
| `scripts/selftest.mjs` | Tests and documentation — "assertion groups for the new pure entry points on both owner modules" | Add the assertion group covering the six matrix cells, the opposite-regime comparison, the origin rule and the falsifier requirement |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature** | Append this scope's one persistent regression case to the file SCOPE-01 creates, exactly as that scope's table anticipates when it records that later scopes extend the same file. This scope adds no other case and renders no lens |

---

## Gherkin Scenarios

### BS-016-001: Balancing auction under a suppressive regime expects the value-area edge to hold

```gherkin
Scenario: Price tests the lower value-area edge while net gamma is positive and the flip is distant
  Given the session auction state is ready and classified balancing
  And the behavioural regime resolves as suppressive because the modelled net gamma is positive and price sits far enough from the gamma flip that the sign is stable
  And the auction half and the gamma half share one stated evidence cutoff
  When the user reads the playbook for the lower value-area edge
  Then the read states an expectation that the edge holds and price rotates back toward the point of control
  And the read names both halves of its basis: the balancing auction state that supplied the level and the suppressive regime that supplied the expectation
  And the read states a trade shape consistent with rotation back into value
  And the read states one observable falsifier the user can check against the developing session
  And every figure in the read carries its source, its provenance class and its as-of
```

### BS-016-002: Balancing auction under an amplifying regime downgrades the rotation expectation

```gherkin
Scenario: Price tests the lower value-area edge while net gamma is negative and the flip is distant
  Given the session auction state is ready and classified balancing
  And the behavioural regime resolves as amplifying because the modelled net gamma is negative and price sits far enough from the gamma flip that the sign is stable
  And the auction half and the gamma half share one stated evidence cutoff
  When the user reads the playbook for the lower value-area edge
  Then the read states that the edge is more likely to break than to hold, despite the balancing structure
  And the read names the amplifying regime as the reason the structural rotation expectation is downgraded
  And the read states a trade shape consistent with acceptance below the edge rather than rotation back into value
  And the read states the observable condition that would restore the rotation case
```

### BS-016-003: Balancing auction near the flip asserts neither hold nor break

```gherkin
Scenario: Price tests the lower value-area edge while sitting close to the gamma flip
  Given the session auction state is ready and classified balancing
  And the behavioural regime resolves as hinge-proximate because price sits close enough to the gamma flip that modest movement would invert the modelled net-gamma sign
  When the user reads the playbook for the lower value-area edge
  Then the read states that the structure is genuinely two-sided
  And the read does not claim the edge holds and does not claim the edge breaks
  And the read names the flip proximity as the reason the behavioural character is unstable
  And the read states the observable condition on each side that would resolve the ambiguity
  And the stated confidence is lower than that of a comparable cell whose regime is stable
```

### BS-016-004: Imbalanced auction under a suppressive regime expects the extension to be dampened

```gherkin
Scenario: The session is seeking value in one direction while net gamma is positive and the flip is distant
  Given the session auction state is ready and classified imbalanced with no acceptance established
  And the behavioural regime resolves as suppressive
  When the user reads the playbook for the level the session is extending toward
  Then the read states that extension is likely to be dampened and to retrace toward value
  And the read names the suppressive regime as the reason the directional structure is qualified rather than confirmed
  And the read states a trade shape that respects the dampening rather than one that assumes continuation
  And the read states the observable condition that would confirm genuine acceptance beyond the level
```

### BS-016-005: Imbalanced auction under an amplifying regime expects continuation

```gherkin
Scenario: The session is seeking value in one direction while net gamma is negative and the flip is distant
  Given the session auction state is ready and classified imbalanced with no acceptance established
  And the behavioural regime resolves as amplifying
  When the user reads the playbook for the level the session is extending toward
  Then the read states that the level is likely to break and that retracement is likely to be shallow
  And the read names the imbalanced auction state as the supplier of the level and the direction, and the amplifying regime as the supplier of the behavioural expectation
  And the read states a trade shape consistent with continuation
  And the read states one observable falsifier that would end the continuation case
```

### BS-016-006: Imbalanced auction near the flip withholds the behavioural expectation

```gherkin
Scenario: The session is seeking value in one direction while price sits close to the gamma flip
  Given the session auction state is ready and classified imbalanced
  And the behavioural regime resolves as hinge-proximate
  When the user reads the playbook for the level the session is extending toward
  Then the read presents the auction direction and the level without asserting that the move will be dampened or extended
  And the read names the flip proximity as the reason the behavioural expectation is withheld
  And the instability is named in the cell's own basis rather than only in a general disclosure
  And the stated confidence is lower than that of a comparable cell whose regime is stable
```

### BS-016-007: Identical structure under opposite regimes yields opposite expectations

```gherkin
Scenario: The same value-area edge is read under a suppressive regime and under an amplifying regime
  Given two reads share an identical auction state, an identical level, and one stated evidence cutoff
  And the first read's behavioural regime is suppressive and the second read's behavioural regime is amplifying
  When the user compares the two reads
  Then the two reads state opposite expectations for the same level
  And each read attributes the difference to its behavioural regime rather than to any structural difference
  And each read states its own falsifier, and the two falsifiers name different observations
  And the user can act on one read while monitoring a single named condition rather than re-reading the whole structure
```

### BS-016-009: No level, target or direction originates from a gamma primitive

```gherkin
Scenario: A user traces the origin of every level in a fully qualified playbook cell
  Given a playbook cell has been asserted with both halves qualified
  When the user inspects the origin of each level, target and direction in the cell
  Then every level, target and direction traces to an auction primitive
  And no level, target or direction traces to a gamma primitive
  And every gamma primitive in the cell's basis appears only as a qualifier of the expectation
```

### BS-016-011: A pairing with no definable falsifier is not asserted

```gherkin
Scenario: An auction state and a behavioural regime qualify but no observable falsifier can be stated
  Given an auction state and a behavioural regime both qualify under one evidence cutoff
  And no observable condition can be stated that would disprove the resulting expectation
  When the user requests the playbook read
  Then no expectation is asserted for that pairing
  And the read names the missing falsifier as the reason the pairing was not asserted
  And the read does not present a partial expectation stripped of its falsifier
```

### BS-016-012: Every asserted cell exposes a falsifier the user can check unaided

```gherkin
Scenario: A user checks whether an asserted expectation can be graded during the session
  Given a playbook cell has been asserted
  When the user reads the cell's falsifier
  Then the falsifier names a level, a direction and a confirming condition
  And the falsifier is phrased so the user can check it against the developing session without re-deriving the model
  And the falsifier is presented alongside the expectation rather than only in a separate disclosure
```

---

## Implementation Plan

**1. Resolve the expectation from the auction class crossed with the regime value.**
Balancing under suppressive expects the edge to hold and price to rotate back
toward the point of control. Balancing under amplifying states the edge is more
likely to break than hold, despite the balancing structure, and names the regime
as the reason the structural expectation is downgraded. Imbalanced under
suppressive expects the extension to be dampened and to retrace toward value.
Imbalanced under amplifying expects the level to break with shallow retracement.
Each populated expectation names which half supplied it.

**2. Withhold the directional claim under hinge proximity.**
Balancing under hinge-proximate states the structure is genuinely two-sided,
claims neither hold nor break, names the flip proximity as the cause of the
instability, and states the resolving condition on each side. Imbalanced under
hinge-proximate presents the auction direction and level without asserting that
the move will be dampened or extended. Both name the instability in the cell's own
`basis` rather than only in a general disclosure, and both state a confidence
lower than a comparable cell whose regime is stable — which follows from the
regime-level confidence bound SCOPE-03 places on the C3 record.

**3. Enforce the origin rule by assembly, not by review.**
Every `basis` entry carries a role. An `origin` role is populated only from the
auction summary, for every level, target and direction. Every gamma primitive is
populated with a `qualifier` role. A gamma primitive has no path into an `origin`
slot, which is how FR-016-012 is enforced structurally.

**4. Make the falsifier a precondition of asserting.**
A falsifier names a level, a direction and a confirming condition. Where no
observable condition can be stated that would disprove the expectation, the cell
is not asserted: the arm carries the missing falsifier as its named cause. A
partial expectation stripped of its falsifier is never emitted, so the assertion
path and the gradability path cannot come apart.

**5. Keep the two falsifiers separable.**
The expectation-level falsifier populated here sits alongside the regime-level
observation SCOPE-03 places on the C3 record. Both travel on the cell; a user can
tell which of the two a given observation would trigger, and SCOPE-08 grades them
as distinct outcomes.

**6. Make the opposite-regime comparison structural.**
Two cells sharing an identical auction state, an identical level and one stated
cutoff, differing only in regime, produce opposite expectations and two falsifiers
naming different observations. Because the auction half is byte-identical between
them, the difference is attributable to the regime by construction rather than by
assertion.

**7. Carry source, provenance class and as-of on every figure.**
Each `basis` entry names its source, the provenance class it carried into the
fusion and its as-of. SCOPE-04's rule that fusion never promotes a class holds
over every entry this scope populates.

**Boundary held.** This scope adds no new entry point; it fills the `fused` arm of
the function SCOPE-04 created. `summary.sessionType`, `summary.levels` and
`summary.control` keep their current shapes. No import of `RLOPTIONS` is added.
All assembly is pure over the deep-frozen owner state and the parameter map.

---

## Test Plan

This scope's Implementation Files are `rlexperience-adapters/market-structure.js`,
`scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`. It fills an
arm inside an existing pure function and edits no page, so every Node row runs
`node scripts/selftest.mjs`. Its one browser row asserts the assembly executing
inside the real page from the real module file — the technique
`tests/simple-model-adapters-market.spec.mjs` already applies to this exact
module, injecting it with `page.addScriptTag({ path: descriptor.moduleFile })` at
line 482 against the `intraday-tape-lab.html` descriptor at line 327, under the
file header at line 17 recording that there is no `page.route` and no
`context.route`. That row makes no claim about a rendered cell, because no page
reads `summary.playbook` until SCOPE-07 renders it. The proof that a rendered
cell shows its expectation and falsifier together belongs to the scope whose
Implementation Files include the page.

**Adversarial fixture rule for this scope.** Two invariants here are only provable
by a fixture built to violate them. BS-016-007 is satisfiable by coincidence if
the two compared cells differ anywhere in their auction halves — a difference in
level or in auction class would produce different expectations regardless of
regime, so the comparison would prove nothing about the regime. The adversarial
row therefore holds the auction half **byte-identical** between the two cells and
varies only the regime. BS-016-009 is likewise vacuous if no gamma primitive is
ever offered as a level: the adversarial row offers one and asserts it cannot
reach an `origin` slot.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-05-01 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Balancing crossed with suppressive expects the value-area edge to hold with rotation toward the point of control, names the balancing state as the level's supplier and the suppressive regime as the expectation's, states a rotation-consistent trade shape and one observable falsifier | `node scripts/selftest.mjs` | No |
| TP-05-02 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Balancing crossed with amplifying states the edge is more likely to break than hold despite the balancing structure, names the amplifying regime as the reason the structural expectation is downgraded, states an acceptance-below trade shape and the condition that would restore the rotation case | `node scripts/selftest.mjs` | No |
| TP-05-03 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Balancing crossed with hinge-proximate states the structure is two-sided, claims neither hold nor break, names flip proximity as the cause of the instability, states a resolving condition on each side, and carries a confidence lower than the stable-regime cell over the same auction half | `node scripts/selftest.mjs` | No |
| TP-05-04 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Imbalanced crossed with suppressive expects the extension to be dampened and to retrace toward value, names the suppressive regime as the qualifier of the directional structure, states a trade shape that respects the dampening, and states the condition that would confirm genuine acceptance beyond the level | `node scripts/selftest.mjs` | No |
| TP-05-05 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Imbalanced crossed with amplifying expects the level to break with shallow retracement, names the imbalanced state as the supplier of level and direction and the amplifying regime as the supplier of the expectation, states a continuation trade shape and one falsifier that would end the continuation case | `node scripts/selftest.mjs` | No |
| TP-05-06 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Imbalanced crossed with hinge-proximate presents the auction direction and level while asserting neither dampening nor extension, names the instability inside the cell's own `basis`, and carries a confidence lower than the stable-regime cell over the same auction half | `node scripts/selftest.mjs` | No |
| TP-05-07 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Adversarial input: two cells whose auction half is **byte-identical** — same auction class, same level, one stated cutoff — differing only in regime. They state opposite expectations and two falsifiers naming different observations. Because the auction halves cannot differ, an implementation that derived the expectation from structure rather than regime fails this assertion | `node scripts/selftest.mjs` | No |
| TP-05-08 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Adversarial input: owner state offering a gamma primitive as a candidate level, target and direction. Every `origin`-role `basis` entry still traces to an auction primitive; the offered gamma primitive appears only with a `qualifier` role and reaches no `origin` slot on any of the three | `node scripts/selftest.mjs` | No |
| TP-05-09 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | A pairing for which no observable falsifier can be stated asserts no expectation and names the missing falsifier as the reason; no partial expectation stripped of its falsifier is emitted on any path | `node scripts/selftest.mjs` | No |
| TP-05-10 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Every asserted cell's falsifier names a level, a direction and a confirming condition, and travels on the cell alongside the expectation rather than in a separate disclosure, so a user can grade it without re-deriving the model | `node scripts/selftest.mjs` | No |
| TP-05-11 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | Across all six populated cells, every `basis` entry names its source, the provenance class it carried into the fusion and its as-of; an entry missing any of the three is not emitted | `node scripts/selftest.mjs` | No |
| TP-05-12 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-009 a gamma primitive offered as a level reaches no origin slot in an asserted cell` | The persistent regression case for the assembly invariant this scope adds, asserted on the real `intraday-tape-lab.html` page with the real `rlexperience-adapters/market-structure.js` file injected — the same real-module-into-real-page technique `tests/simple-model-adapters-market.spec.mjs` already applies to this module at line 482 — and with no `page.route`, no `context.route` and no request interception. In the page, `RLMARKETSTRUCTURE.resolvePlaybookCell` is called with owner state offering a gamma primitive as a candidate level, target and direction: every `origin`-role `basis` entry in the returned cell still traces to an auction primitive, the offered gamma primitive appears only with a `qualifier` role, and the same call over a pairing with no statable falsifier asserts no expectation at all rather than emitting a falsifier-stripped partial one. A build that lets a gamma primitive occupy an `origin` slot, or that emits an expectation without its falsifier, fails this case in the browser, not only in Node | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-009 a gamma primitive offered as a level reaches no origin slot in an asserted cell" --reporter=list` | Yes |
| TP-05-13 | Stress | `stress` | `scripts/selftest.mjs` group `Feature 016 Scope 05 behavioural expectation matrix (market-structure)` | The matrix is driven over the entire published set `data/options/index.json` declares — 22 tickers, 39,190 contracts and 4,692,202 bytes of snapshot JSON on disk, the largest single file `data/options/NDX.json` carrying 6,066 contracts in 570,547 bytes — crossed with both auction classes and all three regime values, giving every one of the six cells over every ticker, assembled back-to-back in one pass. Every asserted cell carries an expectation, a trade shape and a falsifier naming a level, a direction and a confirming condition; every `origin`-role `basis` entry traces to an auction primitive across the whole run; the slowest single assembly stays inside the 250 ms `performancePolicy.maxComputeMs` declared for this module at `simple-models.json` line 111; and the last pass over identical arguments returns a result identical to the first, so no clock read and no accumulated state leaks into the assembly at volume | `node scripts/selftest.mjs` | No |

---

### Definition of Done

- [ ] `[TP-05-01]` `[BS-016-001]` Price tests the lower value-area edge while net gamma is positive and the flip is distant: the balancing-and-suppressive cell states an expectation that the edge holds and price rotates back toward the point of control, names both halves of its basis — the balancing auction state that supplied the level and the suppressive regime that supplied the expectation — states a trade shape consistent with rotation back into value, and states one observable falsifier the user can check against the developing session.
- [ ] `[TP-05-02]` `[BS-016-002]` Price tests the lower value-area edge while net gamma is negative and the flip is distant: the balancing-and-amplifying cell states the edge is more likely to break than to hold despite the balancing structure, names the amplifying regime as the reason the structural rotation expectation is downgraded, states a trade shape consistent with acceptance below the edge rather than rotation back into value, and states the observable condition that would restore the rotation case.
- [ ] `[TP-05-03]` `[BS-016-003]` Price tests the lower value-area edge while sitting close to the gamma flip: the balancing-and-hinge-proximate cell states the structure is genuinely two-sided, claims neither that the edge holds nor that the edge breaks, names the flip proximity as the reason the behavioural character is unstable, states the observable condition on each side that would resolve the ambiguity, and carries a confidence lower than that of a comparable cell whose regime is stable.
- [ ] `[TP-05-04]` `[BS-016-004]` The session is seeking value in one direction while net gamma is positive and the flip is distant: the imbalanced-and-suppressive cell states that extension is likely to be dampened and to retrace toward value, names the suppressive regime as the reason the directional structure is qualified rather than confirmed, states a trade shape that respects the dampening rather than one that assumes continuation, and states the observable condition that would confirm genuine acceptance beyond the level.
- [ ] `[TP-05-05]` `[BS-016-005]` The session is seeking value in one direction while net gamma is negative and the flip is distant: the imbalanced-and-amplifying cell states the level is likely to break and that retracement is likely to be shallow, names the imbalanced auction state as the supplier of the level and the direction and the amplifying regime as the supplier of the behavioural expectation, states a trade shape consistent with continuation, and states one observable falsifier that would end the continuation case.
- [ ] `[TP-05-06]` `[BS-016-006]` The session is seeking value in one direction while price sits close to the gamma flip: the imbalanced-and-hinge-proximate cell presents the auction direction and the level without asserting that the move will be dampened or extended, names the flip proximity as the reason the behavioural expectation is withheld, names the instability in the cell's own `basis` rather than only in a general disclosure, and carries a confidence lower than that of a comparable cell whose regime is stable.
- [ ] `[TP-05-07]` `[BS-016-007]` The same value-area edge is read under a suppressive regime and under an amplifying regime: two reads sharing an identical auction state, an identical level and one stated evidence cutoff — held byte-identical by the adversarial fixture so no structural difference can explain the outcome — state opposite expectations for that same level, each attributes the difference to its behavioural regime rather than to any structural difference, and each states its own falsifier with the two falsifiers naming different observations, so the user can act on one read while monitoring a single named condition rather than re-reading the whole structure.
- [ ] `[TP-05-08]` `[BS-016-009]` Every level, target and direction traces to an auction primitive, and a gamma primitive offered as any of the three appears only as a qualifier and never in an `origin` slot.
- [ ] `[TP-05-09]` `[BS-016-011]` An auction state and a behavioural regime qualify but no observable falsifier can be stated: no expectation is asserted for that pairing, the read names the missing falsifier as the reason the pairing was not asserted, and the read presents no partial expectation stripped of its falsifier on any path.
- [ ] `[TP-05-10]` `[BS-016-012]` A user checks whether an asserted expectation can be graded during the session: the asserted cell's falsifier names a level, a direction and a confirming condition, is phrased so the user can check it against the developing session without re-deriving the model, and is presented alongside the expectation rather than only in a separate disclosure.
- [ ] `[TP-05-11]` `[BS-016-001]` Every `basis` entry across the six cells carries its source, its provenance class and its as-of, so no figure in an asserted cell is unattributed.
- [ ] `[TP-05-13]` `[BS-016-012]` Assembled across all 22 published snapshots crossed with both auction classes and all three regime values, every asserted cell carries an expectation, a trade shape and a falsifier naming a level, a direction and a confirming condition, every `origin`-role entry traces to an auction primitive, the slowest assembly stays inside the 250 ms budget declared at `simple-models.json` line 111, and the last pass matches the first exactly.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-05-12]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-009 a gamma primitive offered as a level reaches no origin slot in an asserted cell`, which executes the real module inside the real page and fails the moment a gamma primitive occupies an `origin` slot or an expectation is emitted without its falsifier.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the real-page Playwright regression spec that already injects this exact module into five pages, `tests/simple-model-adapters-market.spec.mjs`, both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; no registry count moves, because this scope registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] `notes/intraday-tape-lab.md` states the six behavioural cells and the falsifier the reader can expect on each, matching the behaviour this scope shipped.
- [ ] Only the paths in this scope's Implementation Files table were modified; no new entry point is introduced and no `RLOPTIONS` import is added.
