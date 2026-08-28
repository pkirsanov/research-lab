# BUG-024 Execution Report

## Summary

Reported and root-caused. **Not fixed** — this round documents and routes.

`tests/attention-payload-contract.test.mjs:797` asserts that
`result.payload.attentionExclusions` deep-equals `result.exclusions`. Spec 020
requires those two to differ: the first is the append-only record of every
refusal, the second is the list this generation produced. Demanding equality
demands that the append-only record be overwritten, which FR-020-023 forbids in
the same document that states *"Append-only. Routing decisions, exclusions and
outcomes are appended, never rewritten. (P21)"*

Repo doctrine decides the direction: tests validate specifications, not
implementations. The specification is not in question here, so the **test** is
the defect. No product code was changed, and the test was **not** edited to make
it pass — editing it is the fix, and the fix belongs to a scope with its own
evidence, not to the turn that found it.

## Test Evidence

### 1. The failure at clean HEAD

Isolated with `git archive` so the ~85 foreign uncommitted files in the working
tree could not influence the result. `.git` was symlinked into the export — see
§ What This Evidence Does Not Establish for why that matters.

```
$ EXPORT_OF=2eb14d964
$ node --test tests/attention-payload-contract.test.mjs
not ok 7 - Regression: judgement-only lane output is refused rather than passed through to the payload gate
  ---
  duration_ms: 12.989721
  type: 'test'
  location: 'tests/attention-payload-contract.test.mjs:775:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly deep-equal:
    + actual - expected
# tests 31
# pass 30
# fail 1
EXIT=1
```

The diff shows the product emitting **more** refusals than the test allows — the
expected list holds only `RLATTN-PROVENANCE`, while the actual list also carries
five `RLATTN-OVERLAP` entries:

```
+   { code: 'RLATTN-OVERLAP', field: 'subject', index: 0, subject: 'MSFT',
+     reason: 'this subject is already published as an action and must not be surfaced twice' }
+   { code: 'RLATTN-OVERLAP', field: 'subject', index: 1, subject: 'XLK',  ... }
+   { code: 'RLATTN-OVERLAP', field: 'subject', index: 2, subject: 'QQQ',  ... }
+   { code: 'RLATTN-OVERLAP', field: 'subject', index: 3, subject: 'SPMO', ... }
+   { code: 'RLATTN-OVERLAP', field: 'subject', index: 5, subject: 'XLE',  ... }
```

### 2. The canonical gate cannot see it

This is why a red test survived undetected, and it is the more consequential half
of the bug:

```
$ for f in tests/*.test.mjs; do echo "refs=$(grep -c "$(basename $f)" scripts/selftest.mjs) $(basename $f)"; done
refs=1   attention-payload-contract.test.mjs      <- mention only, in a comment at line 25743
refs=0   brief-d16-direction-aware-publish-gate.test.mjs
refs=0   brief-refresh-atomicity.test.mjs
refs=0   brief-required-narrative-fields-publish-gate.test.mjs
refs=0   feature-004-brief-eligibility.test.mjs
refs=0   feature-004-collision-invariant.test.mjs
refs=0   feature-004-journey-evidence-refresh.test.mjs
refs=0   feature-004-tool-control-binding.test.mjs
refs=0   feature-004-vehicle-universe.test.mjs
refs=0   rlattention.test.mjs
```

`node scripts/selftest.mjs` reports **3429 passed / 0 failed** while this suite is
red. Nine of the ten `tests/*.test.mjs` files are not named in `selftest.mjs` at
all; the tenth appears only inside a comment. None is executed by the canonical
check.

### 3. A SECOND red suite in the same blind spot

Running every unreferenced suite directly found a second failure that nothing was
reporting:

```
$ for f in tests/*.test.mjs; do node --test "$f"; done
attention-payload-contract.test.mjs                    # pass 30  # fail 1
brief-d16-direction-aware-publish-gate.test.mjs        # pass 10  # fail 0
brief-refresh-atomicity.test.mjs                       # pass 41  # fail 0
brief-required-narrative-fields-publish-gate.test.mjs  # pass  5  # fail 0
feature-004-brief-eligibility.test.mjs                 # pass  1  # fail 0
feature-004-collision-invariant.test.mjs               # pass  3  # fail 0
feature-004-journey-evidence-refresh.test.mjs          # pass 10  # fail 0
feature-004-tool-control-binding.test.mjs              # pass  4  # fail 0
feature-004-vehicle-universe.test.mjs                  # pass 14  # fail 0
rlattention.test.mjs                                   # pass 27  # fail 1
```

```
$ node --test tests/rlattention.test.mjs
not ok 1 - SCN-017-001 The attention module loads in Node with sixteen frozen members
  location: 'tests/rlattention.test.mjs:203:1'
  error: |-
    export surface must be exactly the sixteen contracted members
# pass 27
# fail 1
```

Reproduced at clean HEAD as well (`# pass 27`, `# fail 1`), so it is not a
working-tree artifact. It is **not** the same defect as this bug and is recorded
here only so the discovery is not lost; it needs its own root cause.

## What This Evidence Does Not Establish

- It does **not** establish that the `RLATTN-OVERLAP` refusals are themselves
  correct in content. The finding is narrower: the test's equality assertion
  contradicts FR-020-023 regardless of which subjects the overlap check names.
- It does **not** establish a fix. Nothing was changed; the fix is scoped, not
  performed.
- It does **not** measure how long `rlattention.test.mjs` has been red, nor why.
- Two earlier observations were discarded as **measurement artifacts, not
  defects**, and are named here so they are not resurrected. Running the suite in
  an export without `.git` symlinked produced two false failures — a
  commit-message scan and a recommendation-ledger group, both of which shell out
  to git. Separately, deleting an export while a background job still read it
  produced nine spurious failures. Both were caught by re-running a control
  before reporting, and neither is a defect in this repository.

## Reproduction Command

```
node --test tests/attention-payload-contract.test.mjs
```

Exit 1, `# fail 1`, case 7. No setup, no fixtures, no server: the failure is
deterministic at HEAD.

## Completion Statement

Scope status is **not started** with 0 of 13 DoD items checked, and `state.json`
is `in_progress`. That is the honest state: this round reported and root-caused
the defect and did not repair it. The packet is routed to `bubbles.plan` for the
fix scope.
