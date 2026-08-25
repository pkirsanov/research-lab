# Scopes: BUG-020 — Declared Income Beyond The Double Range Settles As A Non-Finite Figure

**Scope layout:** single-file.

## Sequencing Note

Scope 1 is blocked until the owner answers the refusal-code question in
`design.md`. Nothing in Scope 2 can be written before Scope 1 chooses the code,
because the assertions name it. Neither scope may begin as an implementer's
decision.

## Scope 1: Refuse A Non-Finite Figure At The Display Seam

**Status:** in_progress

### Problem This Scope Resolves

`formatForDisplay` guards its rounding factor for finiteness and returns a
refusal, and does not guard the value it is asked to format. A non-finite value
therefore reaches `toLocaleString` and prints as `$∞` or `$NaN` on a row that
still claims `enacted-current-law` standing.

### Gherkin Scenarios

```gherkin
# SCN-020-01
Scenario: a stage whose amount overflows the double range is refused by name
  Given a household declaring ordinary income and qualified dividends at 9e307 each
  When the Power view renders the stage table
  Then every stage whose amount is not finite carries a named refusal
  And no such stage carries a rule-status label
  And no rendered text on the route contains an infinity symbol or NaN

# SCN-020-02
Scenario: the settlement header does not describe an unrepresentable result as settled
  Given the same household
  When the settlement header renders
  Then it does not read "Settled"
  And it names the domain that could not be represented

# SCN-020-03
Scenario: a declaration inside the representable range is unchanged
  Given a household declaring ordinary income and qualified dividends at 8.9e307 each
  When the Power view renders the stage table
  Then every stage carries the same figure, rounding and rule status it carried before this change
```

### Implementation Plan

1. Record the owner's answer to the refusal-code question in `design.md`.
2. If a new vocabulary member was chosen, add it to `RLTAX_CODES` in
   `rltaxrules.js` and extend the named list in `scripts/selftest.mjs`
   assertion `TP-01-05` so the assertion continues to enumerate the vocabulary
   exactly. Do not relax the assertion's shape.
3. Guard `valueRecord.value` in `formatForDisplay` with the same finiteness
   check the factor already receives, returning a refusal that names the domain.
4. Confirm the surfaces render that refusal without a new branch, since the
   refusal shape is the one they already handle.

### Test Plan

| Id | Category | Asserts |
|---|---|---|
| TB-020-01 | browser | Two fields at `9e307` produce a named refusal on every non-finite stage and no rule-status label on those rows |
| TB-020-02 | browser | The settlement header does not read `Settled` for that declaration |
| TB-020-03 | browser | No rendered text contains an infinity symbol or `NaN` for that declaration |
| TB-020-04 | node | `formatForDisplay` returns a refusal for a non-finite value and the prior result for a finite one |

### Definition of Done

- [x] The owner's refusal-code decision is recorded in `design.md` under the open question, with the date and the reasoning. → Evidence: `design.md` `## The Decision`, "Decided 2026-08-24. Authorised by the owner", with the reasoning in `### Why a new member rather than a reused one` and the rejected alternative in `### The alternative rejected`.
- [x] SCN-020-01 holds: two fields at `9e307` refuse by name on every non-finite stage, and no such row carries a rule-status label. → Evidence: asserted at the reported declaration itself by `tests/lifetime-tax-representable.spec.mjs` test 6, over `CO-1`, `CO-3`, `CO-4`, `CO-5`, `CO-6`, `CO-7` and `CO-8`; run recorded in `report.md` `## The Reported Pair, Asserted In Its Own Right`.
- [x] SCN-020-02 holds: the settlement header does not read `Settled` for that declaration and names the unrepresentable domain. → Evidence: test 7, asserting the header is not `Settled` and that `#truthDetail` names `income:grossSupportedIncome`.
- [x] SCN-020-03 holds: two fields at `8.9e307` settle with every figure, rounding and rule status unchanged from the pre-change observation recorded in `report.md`. → Evidence: test 8 asserts the three facts the pre-change observation actually records (`truth=Settled`, no infinity symbol, no `NaN`) and adds a rounded figure and `enacted-current-law` standing on `CO-1`, which that observation could not carry; probe `P12` establishes the "unchanged" clause by measurement, showing the guard is not on this declaration's path at all.
- [x] `formatForDisplay` refuses a non-finite value at the same seam that already refuses a non-finite factor, and the refusal names the domain. → Evidence: `rltax.js:1205`, guarding `valueRecord.value` beside the existing factor guard and naming domain `display:value`; asserted by `TB-020-04` and proven to discriminate by probe `P3`.
- [x] If a vocabulary member was added, `scripts/selftest.mjs` assertion `TP-01-05` enumerates it by name and still fails on a fabricated addition and on a repurposed member. → Evidence: `BUG_020_CODES` names the member; the assertion carries the `fabricatedAddition` and `repurposedVocabulary` limbs as live conjuncts; probe `P2` proves the fabricated-addition direction against the module source and probe `P1` the removal direction.
- [ ] A red-green probe through `scripts/red-green-probe.sh` proves each new assertion fails when the guard is removed, with the probe output recorded in `report.md`. → OPEN. Eight of the nine assertions are proven to discriminate (`P1`, `P2`, `P3`, `P4`, `P5`, `P7`, `P8`, `P9`, `P10`, `P11`). `TB-020-03` is not. It is defended by three independent layers and no one of them is load-bearing: `P6` removed R2, `P6b` removed E1 and `P6c` removed E3, each on its own, and each returned exit `7`. It is over-determined rather than vacuous — `P6d` neutralises every finiteness guard in `rltax.js` at once and the assertion goes red, exit `0` — so it can fail, but only under a mutation removing eighteen guards where this row's wording contemplates one, and `design.md` itself specifies a two-mutation adversarial case for it while the harness applies one literal replacement to one file. Closing this row needs a harness that composes mutations or a design amendment naming the true adversarial case for an over-determined assertion; neither is an implementer's decision. Recorded in `report.md` under `#### P6 and P6b` and `#### P6c and P6d`.
- [x] `node scripts/selftest.mjs` reports `0 failed` and no fewer assertions than before this scope. → Evidence: `self-test: 3408 passed, 0 failed`, exit `0`; recorded in `report.md` `## Validation`.

## Scope 2: Pin The Boundary From Both Sides

**Status:** done

### Problem This Scope Resolves

The boundary between a settling declaration and a refusing one is a single
arithmetic threshold with nothing marking it. Without an assertion on each side,
a later change can move it in either direction silently: a widened guard would
start refusing real households, and a removed guard would restore the defect.

### Gherkin Scenarios

```gherkin
# SCN-020-04
Scenario: the settling side of the boundary is pinned
  Given a declaration whose declared amounts sum to just inside the representable range
  When the route settles
  Then every stage carries a finite figure

# SCN-020-05
Scenario: the refusing side of the boundary is pinned
  Given a declaration whose declared amounts sum to just outside the representable range
  When the route renders
  Then every affected stage carries a named refusal
```

### Implementation Plan

1. Add the two-sided assertions to the lifetime-tax browser suite, using
   declarations close enough that no third behaviour can sit between them.
2. Prove each assertion discriminates with `scripts/red-green-probe.sh`, pinning
   `--summary-match` to the assertion's own wording rather than to the aggregate
   pass count.

### Test Plan

| Id | Category | Asserts |
|---|---|---|
| TB-020-05 | browser | The settling side settles with finite figures throughout |
| TB-020-06 | browser | The refusing side refuses by name on every affected stage |

### Definition of Done

- [x] SCN-020-04 holds against a declaration just inside the boundary. → Evidence: `8.988465674311579e+307` in both income fields, summing to exactly `Number.MAX_VALUE`; test 4 asserts `Settled` and no unrepresentable refusal on any stage.
- [x] SCN-020-05 holds against a declaration just outside the boundary. → Evidence: `8.98846567431158e+307` in both fields; test 5 asserts `Incomplete` and at least one rendered `RLTAX-FIGURE-UNREPRESENTABLE`.
- [x] The two declarations are close enough that no untested behaviour sits between them, and `report.md` states the two values. → Evidence: both values are stated in `report.md` `### The boundary, both sides`; test 5 derives the adjacency from the page's own arithmetic rather than trusting the literals, asserting that the refusing amount is the immediate successor double, that each round-trips through the input, that the settling pair sums to exactly `Number.MAX_VALUE` and that the refusing pair overflows.
- [x] Each assertion is proven to discriminate by a `scripts/red-green-probe.sh` run recorded verbatim in `report.md`, with `--summary-match` pinned to that assertion's own wording. → Evidence: probe `P7` for the settling side against a widened guard, probe `P8` for the refusing side against a removed guard; each `--summary-match` names its own scenario title, and both returned exit `0`.
- [x] `node scripts/validate-spec-test-paths.mjs` reports `new=0 stale=0`. → Evidence: recorded in `report.md` `## Validation`.
- [x] The lifetime-tax browser suite passes on `--project=chromium` with no fewer assertions than before this scope. → Evidence: recorded in `report.md` `## The Lifetime-Tax Browser Suite`.
