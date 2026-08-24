# Scopes: BUG-019 — Claim Ages Below The Statutory Earliest Age Are Priced As Settled

**Status:** Filed, unstarted. No scope has been started and nothing has been delivered.

The packet was filed by a `bubbles.chaos` round, which is authorised to record findings and file
bug artifacts and is not authorised to implement a fix. Every Definition of Done item below is
open.

## Sequencing Note

Scope 1 is a prerequisite for Scope 2. The refusal in Scope 2 has nothing to compare against until
the pack declares an earliest claim age, and the alternative — a constant in the engine — is the
thing the pack contract exists to prevent. Scope 3 depends on both.

The scopes are small deliberately. The defect is narrow and its remedy should be too; the size of
this packet reflects the care needed in the pack contract, not the size of the code change.

---

## Scope 1: Declare The Earliest Claim Age As A Sourced Pack Figure

**Status:** Not started

### Problem This Scope Resolves

The benefit pack states its reduction maximum twice and states it in prose both times, in
`earlyReductionRule.quotedRule` and in `invarianceContrastAlsoStatedBy.quotedRule`. The engine
consumes only the three structured fields beside that prose, none of which carries a bound. There
is no structured figure anywhere in the pack that an engine could compare a claim age against.

Mechanism and lines: `design.md`, "The bound and the factors live in the same object".

### Gherkin Scenarios

```gherkin
Feature: The earliest priceable claim age is a declared pack figure

  Scenario: The pack declares the earliest age with a source
    Given the benefit rule pack for a declared year
    When the earliest priceable claim age is read
    Then it carries a source reference and a locator
    And it is not derived from the reduction factors

  Scenario: A pack that has not retrieved the figure declares its absence
    Given a benefit rule pack whose earliest claim age was never retrieved
    When the earliest priceable claim age is read
    Then an AbsentFigure record is returned
    And no age is assumed in its place

  Scenario: The engine holds no earliest age of its own
    Given the claim-age module
    When it is searched for a literal earliest claim age
    Then no such literal exists
```

### Implementation Plan

1. Retrieve an authority stating the earliest age at which a retirement claim may be made, and
   record it in `tax-rules/benefit/2026.json` with the same `sourceRef` and `locator` discipline
   every other declared figure in that pack carries.
2. Decide the placement question in `design.md`, "Open Questions For The Owner", item 1.
3. Expose the figure through the pack reader so `rltaxsocialsecurity.js` can read it, including the
   `AbsentFigure/v1` path.
4. Update the pack's `packContentSha256` in `lifetime-tax-strategy.config.json`, because the route
   pins the pack by content hash.

### Test Plan

| Type | What it proves |
| --- | --- |
| Unit (`node scripts/selftest.mjs`) | The declared figure is readable and its absent form refuses |
| Regression | `node scripts/selftest.mjs` stays at 3404 or above with 0 failed |

### Definition of Done

- [ ] The benefit pack carries the earliest priceable claim age with a source reference and a
      locator. → Evidence:
- [ ] A pack lacking the figure yields an `AbsentFigure/v1` rather than an assumed age. → Evidence:
- [ ] No earliest-age literal exists in `rltaxsocialsecurity.js`, `rltaxclaimage.js` or
      `rltaxrules.js`. → Evidence:
- [ ] The pinned `packContentSha256` matches the edited pack and the route still reaches `ready`.
      → Evidence:
- [ ] `node scripts/selftest.mjs` reports 0 failed and not below 3404. → Evidence:

---

## Scope 2: Refuse A Claim Age Below The Declared Earliest Age

**Status:** Not started

### Problem This Scope Resolves

`applyClaimAgeAdjustment` admits any finite non-negative claim age and extrapolates the pack's
per-month reduction factors past the maximum the same rule object states. A claim at age 60
produces $1,800 monthly and $21,600 annually on a $3,000 Primary Insurance Amount, and the
claim-age comparison table describes that figure as "settled".

Reproduction and the full observed table: `bug.md`, "Reproduction" and "Observed Against Expected".

### Gherkin Scenarios

```gherkin
Feature: A claim age the pack cannot price is refused

  Scenario: The earliest priceable age still prices
    Given a household born in 1962 with a declared Primary Insurance Amount
    When the declared claim age is the pack's earliest priceable age
    Then a monthly and an annual figure are produced
    And the reduction equals the maximum the pack declares

  Scenario: One month below the earliest age refuses
    Given the same household
    When the declared claim age is one month below the earliest priceable age
    Then no monthly figure is produced
    And no annual figure is produced
    And a refusal naming the earliest priceable age is shown

  Scenario: The refusal reaches the comparison table row by row
    Given a comparison list holding one priceable and one unpriceable age
    When the comparison table renders
    Then the priceable age carries its figure
    And the unpriceable age carries a refusal in its own row
    And no row is dropped

  Scenario: The section prose agrees with what the section shows
    Given a claim age the pack cannot price
    When the benefit section renders
    Then it does not assert that a claim age was settled against the sourced factors

  Scenario: A claim age beyond the delayed-credit stopping age is disclosed
    Given a declared claim age beyond the age at which delayed credit stops
    When the figure renders
    Then the route states the declared age is beyond the stopping age
    And states that the figure shown is the stopping-age figure
```

### Implementation Plan

1. In `applyClaimAgeAdjustment`, read the Scope 1 figure and compare the declared claim age against
   it before any month is counted, returning a refusal that names the earliest age and the remedy.
2. Do not clamp. `design.md`, "Option C", records why clamping is refused.
3. Propagate the refusal through `rltaxclaimage.js` so the comparison table refuses per candidate
   rather than wholesale, per FR-019-004.
4. Make the benefit section's standing sentence conditional on a figure existing, per FR-019-007.
5. Add the stopping-age disclosure on the delayed branch, per FR-019-005.

### Test Plan

| Type | What it proves |
| --- | --- |
| Browser (`tests/lifetime-tax-benefit.spec.mjs`) | The priced side and the refused side one month apart; the prose is conditional |
| Browser (`tests/lifetime-tax-claim-age.spec.mjs`) | A mixed comparison list keeps priceable rows and refuses unpriceable ones in place |
| Regression | The committed `tests/lifetime-tax-*.spec.mjs` family still passes on `--project=chromium` |

### Definition of Done

- [ ] The reproduction in `bug.md` no longer reproduces: 720 months yields a refusal, not $1,800.
      → Evidence:
- [ ] 744 months still yields $2,100 monthly and $25,200 annually, unchanged. → Evidence:
- [ ] A browser case fails before the change on the figure assertion rather than on a timeout, and
      passes after. → Evidence:
- [ ] The comparison table refuses per candidate and drops no row. → Evidence:
- [ ] The benefit section's settled-fact sentence is absent when the section is refusing.
      → Evidence:
- [ ] A claim age beyond the delayed-credit stopping age is disclosed rather than silently clamped.
      → Evidence:
- [ ] The `tests/lifetime-tax-*.spec.mjs` family passes on `--project=chromium` with no assertion
      removed or weakened. → Evidence:
- [ ] `node scripts/selftest.mjs` reports 0 failed and not below 3404. → Evidence:

---

## Scope 3: Cover Both Sides Of The Boundary So It Cannot Move Quietly

**Status:** Not started

### Problem This Scope Resolves

The committed suite is green against the defective route because every claim-age case it holds
sits at or above the boundary. The defect lives entirely in values the suite never asks about, so
the suite could not have caught it and cannot catch its return.

The sub-zero band is a second uncovered region: below the point at which the multiplier reaches
zero, the figures stop rendering with no refusal code emitted, which no existing assertion
distinguishes from a refusal.

### Gherkin Scenarios

```gherkin
Feature: The pricing boundary is pinned from both sides

  Scenario: The boundary is asserted one month apart
    Given a case at the earliest priceable age and a case one month below it
    When both run
    Then the first asserts a figure and the second asserts a refusal

  Scenario: Removing the bound fails the suite
    Given the earliest-age comparison is removed from the module
    When the suite runs
    Then a case fails on its figure or refusal assertion rather than on a timeout

  Scenario: The sub-zero band is a refusal and not a silence
    Given a declared claim age far below the earliest priceable age
    When the benefit section renders
    Then a refusal code is present
    And the section does not omit its figures without saying why
```

### Implementation Plan

1. Add the paired boundary cases to `tests/lifetime-tax-benefit.spec.mjs`.
2. Add the mixed-comparison case to `tests/lifetime-tax-claim-age.spec.mjs`.
3. Add a sub-zero-band case asserting a refusal code rather than an absence of figures.
4. Verify each new case fails against the pre-fix behaviour for its own assertion reason, not for a
   timeout, and record both transcripts.

### Test Plan

| Type | What it proves |
| --- | --- |
| Browser | Each new case fails red against the pre-fix route for its assertion reason and passes after |
| Regression | The whole `tests/lifetime-tax-*.spec.mjs` family passes on `--project=chromium` |

### Definition of Done

- [ ] The boundary is asserted from both sides one month apart. → Evidence:
- [ ] Each new case is shown failing against the pre-fix behaviour for its own assertion reason.
      → Evidence:
- [ ] The sub-zero band asserts a refusal code rather than an absence of figures. → Evidence:
- [ ] No existing assertion was removed or weakened. → Evidence:
- [ ] `node scripts/selftest.mjs` reports 0 failed and not below 3404. → Evidence:
