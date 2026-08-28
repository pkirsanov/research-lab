# Design: BUG-024 — Assert Each Channel Against The Requirement That Governs It

## The Shape Of The Defect

`recomposePayloadAttention` (`scripts/build-attention-items.mjs:700`) ends by
computing two distinct values and returning both:

```js
const priorExclusions = Array.isArray(payload?.attentionExclusions) ? payload.attentionExclusions : [];
const freshExclusions = exclusions.concat(systemic);
const freshKeys = new Set(freshExclusions.map((entry) => `${entry?.code}|${entry?.subject}`));
const recordedExclusions = freshExclusions
  .concat(priorExclusions.filter((entry) => !freshKeys.has(`${entry?.code}|${entry?.subject}`)));

return {
  payload: Object.assign({}, payload, { attention: merged, attentionExclusions: recordedExclusions }),
  items: merged,
  exclusions            // <- this generation only, NOT recordedExclusions
};
```

`exclusions` is the generation's list. It is the value the accounting guard a
few lines above throws on:

```js
if (items.length + exclusions.length !== candidates.length) throw new Error(...)
```

That guard is FR-020-024 in executable form. `recordedExclusions` is the
append-only record, FR-020-023 in executable form. The function is correct on
both counts, and it is correct that the two differ.

The test asserts `deepEqual(result.payload.attentionExclusions, result.exclusions)`.
That equality holds only in the degenerate case where the input payload has no
priors. It is not a property of the contract; it is an accident of the fixture.

## Why This Is The Test's Defect And Not The Product's

Three independent lines of evidence, all executed (`report.md`):

1. **The overlap check never ran.** `result.exclusions.length === 1`, code
   `RLATTN-PROVENANCE`, field `gateResult`. Assertions on lines 792–796 all pass.
   The product refused exactly one candidate, exactly as the test demands.
2. **The extra rows are the input, not the output.** The five `RLATTN-OVERLAP`
   entries are byte-identical to `market-brief.payload.json`'s committed
   `attentionExclusions`, which the test inherits through its object spread.
3. **Emptying the priors satisfies the assertion.** Same candidate, same config,
   `attentionExclusions: []` → line 797 holds. `result.exclusions` stays at 1 in
   both runs, so nothing about the refusal behaviour changed.

Against that, the spec is unambiguous: FR-020-023 says *appended*, and the P21
bullet says exclusions are *"appended, never rewritten."* Making the assertion
pass by returning the fresh list into `payload.attentionExclusions` would revert
`df604ec1f`, whose commit subject is *"restore a disclosure a recompose had
erased"* and whose in-code comment records the concrete harm: *"one run dropped
three recorded RLATTN-OVERLAP refusals and left a one-item tier that no longer
said why three subjects were held back."*

So the repo doctrine — tests validate specifications, not implementations —
resolves against the test.

## What The Assertion Should Have Said

Line 797 collapses two obligations into one equality. Split it:

- **Against FR-020-024.** `items.length + exclusions.length` equals the declared
  candidate count, and `exclusions` carries exactly the one `RLATTN-PROVENANCE`
  refusal. Lines 792–795 already do most of this; only the identity is missing.
- **Against FR-020-023.** `payload.attentionExclusions` *contains* the fresh
  refusal, and *still contains* every prior record the generation did not
  re-derive. `deepEqual` on a superset is the wrong operator; containment plus a
  no-loss check is the right one.

Stated as an invariant the fixture cannot drift out of:

```
payload.attentionExclusions ⊇ exclusions
payload.attentionExclusions ⊇ { prior rows whose code|subject was not re-derived }
|payload.attentionExclusions| = |exclusions| + |priors not re-derived|
```

## The Fixture Must Stop Reading Production State

Line 788 is `{ ...COMMITTED_PAYLOAD, attention: [judgementOnly] }`. It overrides
`attention` and inherits `attentionExclusions`. That is why the same assertion
failed with three rows on 2026-08-22 and five at HEAD with no code change
between them.

Fixing only the assertion leaves a test whose input is whatever the brief last
published. The input must declare `attentionExclusions` explicitly. A fixture
that is coupled to a live feed is a scheduled false alarm.

## Candidate Directions For The Coverage Gap

Scope 2 has to choose, and the choice is not an implementing round's to make
alone. Recorded here so the trade is visible.

### A. The canonical check spawns the contract suite

`scripts/selftest.mjs` shells out to `node --test tests/*.test.mjs` and folds the
result into its own pass/fail. Closes the gap at the exact place the repo calls
canonical. Cost: `selftest` currently runs in-process and is the assertion count
the repo pins at 3429; adding a spawned child changes both its runtime and how
its count is derived, and `SCN-017-044` asserts on `selftest` from inside this
very suite, so the two would become mutually recursive. That recursion has to be
broken deliberately, not discovered.

### B. A second declared gate, run beside the canonical one

Leave `selftest` alone; add an explicit committed command that runs the
`tests/*.test.mjs` family, and declare it where the repo declares commands.
Avoids the recursion in A entirely. Cost: the repo then has two canonical checks,
and the failure mode this bug documents — a gate nobody runs — is exactly what a
second, less-prominent gate invites.

### C. Extend the reachability guard to distinguish declaration from execution

`scripts/validate-test-file-reachability.mjs` already derives its globs from the
tree. Add a second class: a glob whose only declaration sites are inside
`specs/**/report.md` or similar narrative is a *prose declaration*, and a file
covered only by prose declarations is reported as unexecuted. Cost: it reports
the gap rather than closing it, and the guard's own header warns that broadening
its scan is how it goes vacuous.

A and C are complementary rather than alternative. C is the one that would have
caught this class; A or B is the one that would have caught this instance.

## Rejected

- **Changing `recomposePayloadAttention` to return `recordedExclusions` as
  `exclusions`.** Breaks FR-020-024: the accounting identity would compare a
  record that includes priors against the declared candidate count, and would
  throw on any payload with a prior row.
- **Clearing `market-brief.payload.json`'s `attentionExclusions`.** Destroys a
  published append-only record to make a test pass. This is the harm, not the fix.
- **Deleting the regression test.** It guards a real property — a judgement-only
  candidate must not reach the payload gate — and lines 792–796 still assert it
  correctly. Only line 797 is wrong.
- **Marking the test `skip`.** Converts a loud failure into a silent one, which
  is the pattern `BUG-009` already recorded in this same subsystem.

## Unverified Hypothesis

`BUG-007-decision-attention-contract-drift` records `30 tests, 30 pass, 0 fail`
for this file. The file now holds 31 tests. It is *likely* that the 31st test is
the one added by `aff43d9c1` and that BUG-007's evidence predates it, but this
round did not establish the ordering between BUG-007's certification and
`aff43d9c1`, and does not claim it. Stated as a hypothesis so a later round can
settle it rather than inherit it as fact.
