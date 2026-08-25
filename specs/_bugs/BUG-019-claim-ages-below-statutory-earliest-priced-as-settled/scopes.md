# Scopes: BUG-019 — Claim Ages Below The Statutory Earliest Age Are Priced As Settled

**Status:** In Progress (delivered at `e28be5814` and `eeb2ac7cc`)

All eighteen Definition of Done items are ticked with executed evidence. Two of them were once
worded on a premise that measurement refuted; `bubbles.plan` rewrote both to the obligation that
is true of what shipped, and they stayed unticked until an independent round verified them at
`1cc3bd23b`, because a verifying round earns a tick, not the round that writes the wording.

The packet was filed by a `bubbles.chaos` round, which is authorised to record findings and file
bug artifacts and is not authorised to implement a fix.

## Sequencing Note

Scope 1 is a prerequisite for Scope 2. The refusal in Scope 2 has nothing to compare against until
the pack declares an earliest claim age, and the alternative — a constant in the engine — is the
thing the pack contract exists to prevent. Scope 3 depends on both.

The scopes are small deliberately. The defect is narrow and its remedy should be too; the size of
this packet reflects the care needed in the pack contract, not the size of the code change.

---

## Scope 1: Declare The Earliest Claim Age As A Sourced Pack Figure

**Status:** In Progress (delivered; all five Definition of Done items ticked)

The pack member ships and the engine reads it. Two of the five items were wording that did not
match what shipped, not missing behaviour; `bubbles.plan` rewrote both so that each names the
adversarial case under which it fails, and an independent round verified both at `1cc3bd23b`.

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

- [x] The benefit pack carries the earliest priceable claim age with a source reference and a
      locator. → Evidence: `node scripts/selftest.mjs` → `3405 passed, 0 failed`, exit 0. The
      BUG-019 assertion resolves `earliestClaimAge.sourceRef` against the pack's own `sourceRecords`
      and requires a non-empty `locator`; `report.md` § Implementation Round quotes the member.
- [x] A pack that has not retrieved the figure declares its absence and the engine refuses rather
      than assuming an age: the earliest-age path returns a `TaxUnavailable/v1` record under
      `RLTAX-THRESHOLD-UNAVAILABLE` and settles no monthly and no annual amount. Both absence
      shapes a pack can carry take that path — the member deleted, and the member declared
      `AbsentFigure/v1`. → Evidence: ticked by an independent verifying round that wrote none of
      this packet; see `report.md` § Independent Verification Round — The Two Restated Rows. Both
      shapes were driven straight into `SS.applyClaimAgeAdjustment` by a harness reading no test
      file: each returned `contractVersion: "TaxUnavailable/v1"` with code
      `RLTAX-THRESHOLD-UNAVAILABLE`, and neither record carries `adjustedMonthlyBenefit` or
      `adjustedAnnualBenefit` as a key at all, so nothing is settled and no zero stands in for an
      amount. A control on the intact pack settled `1826` and `21912`, so the refusals discriminate.
      The guard is load-bearing: with the missing-member branch replaced by an admissible synthetic
      figure the same pack prices `1565` monthly and `18780` annually with no `code`
      (`red-green-probe`, exit 0, revert hash-verified). The committed clause detects that mutation
      (`CLAUSE_STATE=RED hits=1` against `GREEN hits=0`, exit 1 against 0). The obligation is carried
      by the
      `unbounded019` and `absentBound019` clauses of the BUG-019 assertion in
      `scripts/selftest.mjs`, which drive one pack with `earlyReductionRule.earliestClaimAge`
      deleted and one declaring it absent, and require `RLTAX-THRESHOLD-UNAVAILABLE` from each.
      **Adversarial case:** the row fails if the earliest-age guard is removed, or if its
      unusable-figure branches fall through to the reduction arithmetic — both packs would then
      price, carrying an `adjustedMonthlyBenefit` and no `code`, so `codeOf24` yields `null` and
      the `/earliestClaimAge/` match on the refusal reason finds nothing to read.
      **Corrected wording (`bubbles.plan`).** This item previously read "A pack lacking the figure
      yields an `AbsentFigure/v1` rather than an assumed age", which named a return shape the
      architecture does not produce. `AbsentFigure/v1` is the `contractVersion` a *pack member*
      carries to declare itself unretrieved — an input shape. Re-measured here: the literal
      `"AbsentFigure/v1"` appears on the right of an assignment in exactly one place in shipped
      engine code, `rltaxrules.js` line 23, and that constant is read only by `isAbsentFigure` at
      line 587 for identity testing. No shipped module constructs one; every other reference is
      `rules.isAbsentFigure(...)` reading an input or `rules.absentFigureRefusal(...)` converting
      one into a `TaxUnavailable/v1`. The intent — absence must refuse, never assume — is
      unchanged and is what the wording above now states.
- [x] No earliest-age literal exists in `rltaxsocialsecurity.js`, `rltaxclaimage.js` or
      `rltaxrules.js`. → Evidence: `node scripts/selftest.mjs` → `3405 passed, 0 failed`, exit 0.
      The `noLiteral019` clause reads all three modules and rejects `62 * 12`, an
      `earliestClaimAgeYears` assignment and the literal `744`. Independently confirmed by the
      Probe 3 block in `report.md`: editing only `tax-rules/benefit/2026.json` moves the boundary.
- [x] The pack edit leaves the route admissible: the edited `tax-rules/benefit/2026.json` still
      reads and the route still reaches `ready`, and `rules.packContentSha256` in
      `lifetime-tax-strategy.config.json` is unchanged by this packet. → Evidence: ticked by an
      independent verifying round; see `report.md` § Independent Verification Round — The Two
      Restated Rows. The family was run at `origin/main` on the bundled project — 22 spec files,
      `111 passed`, exit 0, 64s — and the `ready` gate was shown to be sensitive rather than
      decorative: a malformed benefit-pack edit turns the family red (`red-green-probe`, exit 1
      against 0, revert hash-verified). `rules.packContentSha256` is compared at the single
      `RULES.resolveRulePack` call site against the federal pack's own **declared** `contentSha256`
      member, which carries that same value, so the pin holds; the benefit pack declares no such key
      and never reaches that resolver. No delivery commit in this packet lists
      `lifetime-tax-strategy.config.json`. One correction: the claim below of "every case" is one
      file too broad — `tests/lifetime-tax-read-bound.spec.mjs` opens the route itself so it can
      observe `config-blocked` and the pre-`ready` states, which a `ready` gate would forbid. The
      other twenty-one enter through
      `openLifetimeTax` in `tests/lifetime-tax.support.mjs`, which asserts
      `data-rl-tax-state="ready"` before any case body runs, so a pack edit that broke admission
      would fail the whole family rather than one case; and `git show --name-only` on this
      packet's delivery commits must not list `lifetime-tax-strategy.config.json`.
      **Adversarial case:** the row fails if a malformed pack edit leaves the route at
      `config-blocked` or `pack-blocked` so the `ready` attribute never appears, or if
      `rules.packContentSha256` were edited to accommodate a pack change — which would silently
      re-pin the federal pack to content no one verified.
      **Corrected wording (`bubbles.plan`).** This item previously read "The pinned
      `packContentSha256` matches the edited pack and the route still reaches `ready`", whose first
      half was unperformable. Re-measured here: `rules.packContentSha256` is
      `sha256:06681e37…` and equals the `contentSha256` of `tax-rules/federal/2026.json`, the pack
      named by `rules.packPath`; that is the only pack the route admits through
      `RULES.resolveRulePack` with an `expectedContentSha256`, the sole such call site in
      `lifetime-tax-strategy-lab.html`. The benefit pack carries no `contentSha256` key at all, is
      read by path from `rules.benefitPackPaths` straight into `state.benefitPack`, and never
      passes through that resolver — so editing it moves no pin and there is no digest to match.
      The surviving obligation is the protection the item was written to provide: the pack edit
      must not cost the route its admission, and no digest may be edited to buy it back.
      Implementation Plan step 4 above rests on the same false premise and is superseded by this
      item.
- [x] `node scripts/selftest.mjs` reports 0 failed and not below 3404. → Evidence:
      `self-test: 3405 passed, 0 failed`, exit 0. Verbatim in `report.md` § Validation Run.

---

## Scope 2: Refuse A Claim Age Below The Declared Earliest Age

**Status:** In Progress (delivered; all eight Definition of Done items ticked)

The refusal ships and is asserted from both sides. The last item to close concerns the
delayed-credit stopping-age disclosure, which the implementation round left unasserted and a
later round asserted at `17dafde4f`.

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

- [x] The reproduction in `bug.md` no longer reproduces: 720 months yields a refusal, not $1,800.
      → Evidence: the `every claim age below the earliest priceable age refuses` case drives 720,
      600, 576, 480 and 0 months and asserts each returns `RLTAX-THRESHOLD-UNAVAILABLE` with zero
      `[data-rl-value]` nodes and zero factor rows. Passing on `--project=chromium`; Probe 4 in
      `report.md` proves the case fails when the guard is disabled.
- [x] 744 months still yields $2,100 monthly and $25,200 annually, unchanged. → Evidence: the
      `earliest priceable claim age prices` case asserts the headline is `$25,200` and the
      adjustment body contains `2,100`, with sixty counted months and sixty-six adjustment rows.
      Probe 2b proves the assertion fails when the guard is widened by one month.
- [x] A browser case fails before the change on the figure assertion rather than on a timeout, and
      passes after. → Evidence: Probe 6 in `report.md` — RED reports
      `Error: expect(locator).toHaveAttribute(expected) failed` at exit 1, GREEN reports `NONE` at
      exit 0, and the revert is hash-verified against the committed blob.
- [x] The comparison table refuses per candidate and drops no row. → Evidence: the
      `comparison list mixing priceable and unpriceable ages` case asserts the declared row order
      `['62', '60', '67']` survives, that 62 and 67 keep `$20,160` and `$28,800`, and that only the
      60 row carries the refusal. Probe 5 proves a wholesale return drops the priceable rows.
- [x] The benefit section's settled-fact sentence is absent when the section is refusing.
      → Evidence: the refusing half asserts `#benefitNoProjectionLine` is empty, and the comparison
      case asserts the refused row does not contain `settled from your own declarations` while the
      priced row still does — so the sentence is proven absent AND still reachable.
- [x] A claim age beyond the delayed-credit stopping age is disclosed rather than silently clamped.
      → Evidence: the disclosure has three surfaces and two were already asserted before this
      round — `creditBoundByStoppingAge` true past the stopping age and false at it, with a
      non-empty `stoppingAgeStatedFact`, by TP-01-09 in `scripts/selftest.mjs`; and the rendered
      line a household reads, by the `#benefitStoppingAgeLine` case at a claim age of 71 in
      `tests/lifetime-tax-benefit.spec.mjs`. The third, the
      `claim-age-beyond-sourced-stopping-age` comparison record, was matched by nothing and is now
      asserted in both directions one year apart: present with `result === true` at 72, present
      with `result === false` at 70, each naming the claim age and the sourced stopping age.
      `node scripts/selftest.mjs` → `3408 passed`, `20` insertions and `0` deletions. Probe 6 in
      `report.md` discriminates: renaming the comparison id turns the assertion red and the
      hash-verified revert turns it green.
- [x] The `tests/lifetime-tax-*.spec.mjs` family passes on `--project=chromium` with no assertion
      removed or weakened. → Evidence: `Running 97 tests using 6 workers` → `97 passed (18.1s)`,
      exit 0. `git --no-pager diff --numstat` on both edited spec files reports `108` insertions
      and `0` deletions, so no existing assertion was removed or weakened.
- [x] `node scripts/selftest.mjs` reports 0 failed and not below 3404. → Evidence:
      `self-test: 3405 passed, 0 failed`, exit 0. Verbatim in `report.md` § Validation Run.

---

## Scope 3: Cover Both Sides Of The Boundary So It Cannot Move Quietly

**Status:** Done

All five Definition of Done items are ticked with executed evidence.

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

- [x] The boundary is asserted from both sides one month apart. → Evidence: 744 months prices to a
      `$25,200` headline and 743 months refuses, both inside one case so neither side can drift
      alone. Probe 1 fails the refusing half, Probe 2b fails the priced half.
- [x] Each new case is shown failing against the pre-fix behaviour for its own assertion reason.
      → Evidence: all three new cases carry their own probe in `report.md` — Probe 1 and Probe 2b
      for the two-sided boundary case, Probe 4 for the sub-zero band case, Probe 5 for the
      comparison-table case. Each reports `discriminating: yes` and `revert-verified: yes`.
- [x] The sub-zero band asserts a refusal code rather than an absence of figures. → Evidence: the
      sub-zero case builds an observed array per claim age and compares it to an expected array in
      which every entry carries `code: 'RLTAX-THRESHOLD-UNAVAILABLE'` — the code is asserted
      positively, and the zero figure count is asserted beside it rather than in place of it.
- [x] No existing assertion was removed or weakened. → Evidence:
      `git --no-pager diff --numstat` on `tests/lifetime-tax-benefit.spec.mjs` and
      `tests/lifetime-tax-claim-age.spec.mjs` reports `108` insertions and `0` deletions.
      `scripts/selftest.mjs` shows a single deletion, the `sourceIds24` declaration in its former
      position, quoted verbatim in `report.md`.
- [x] `node scripts/selftest.mjs` reports 0 failed and not below 3404. → Evidence:
      `self-test: 3405 passed, 0 failed`, exit 0. Verbatim in `report.md` § Validation Run.
