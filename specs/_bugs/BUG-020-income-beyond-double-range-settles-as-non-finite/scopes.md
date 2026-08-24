# Scopes: BUG-020 — Declared Income Beyond The Double Range Settles As A Non-Finite Figure

**Scope layout:** single-file.

## Sequencing Note

Scope 1 is blocked until the owner answers the refusal-code question in
`design.md`. Nothing in Scope 2 can be written before Scope 1 chooses the code,
because the assertions name it. Neither scope may begin as an implementer's
decision.

## Scope 1: Refuse A Non-Finite Figure At The Display Seam

**Status:** not_started

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

- [ ] The owner's refusal-code decision is recorded in `design.md` under the open question, with the date and the reasoning.
- [ ] SCN-020-01 holds: two fields at `9e307` refuse by name on every non-finite stage, and no such row carries a rule-status label.
- [ ] SCN-020-02 holds: the settlement header does not read `Settled` for that declaration and names the unrepresentable domain.
- [ ] SCN-020-03 holds: two fields at `8.9e307` settle with every figure, rounding and rule status unchanged from the pre-change observation recorded in `report.md`.
- [ ] `formatForDisplay` refuses a non-finite value at the same seam that already refuses a non-finite factor, and the refusal names the domain.
- [ ] If a vocabulary member was added, `scripts/selftest.mjs` assertion `TP-01-05` enumerates it by name and still fails on a fabricated addition and on a repurposed member.
- [ ] A red-green probe through `scripts/red-green-probe.sh` proves each new assertion fails when the guard is removed, with the probe output recorded in `report.md`.
- [ ] `node scripts/selftest.mjs` reports `0 failed` and no fewer assertions than before this scope.

## Scope 2: Pin The Boundary From Both Sides

**Status:** not_started

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

- [ ] SCN-020-04 holds against a declaration just inside the boundary.
- [ ] SCN-020-05 holds against a declaration just outside the boundary.
- [ ] The two declarations are close enough that no untested behaviour sits between them, and `report.md` states the two values.
- [ ] Each assertion is proven to discriminate by a `scripts/red-green-probe.sh` run recorded verbatim in `report.md`, with `--summary-match` pinned to that assertion's own wording.
- [ ] `node scripts/validate-spec-test-paths.mjs` reports `new=0 stale=0`.
- [ ] The lifetime-tax browser suite passes on `--project=chromium` with no fewer assertions than before this scope.
