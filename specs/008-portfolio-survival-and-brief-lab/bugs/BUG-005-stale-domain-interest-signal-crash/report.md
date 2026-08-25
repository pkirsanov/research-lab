# Report: BUG-005 Stale-Domain Interest Signal Crash

## Summary

The packet is in progress. The existing working tree contains a candidate fix in
`rlportfolio.js`, an adversarial unit carrier, and one test-registry note. This
report does not claim that the candidate is complete or certified.

## Completion Statement

No completion claim is made. Pre-fix reproduction and provenance receipts were
reported by the bug-filing work, but they have not been re-executed by this
checkpointing pass. Human acceptance and independent certification are absent.

## Test Evidence

### Focused carrier {#focused-carrier}

```text
# BUG-005 focused stale-domain regression carrier
$ timeout 540 node --test tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 46
sha256: 81c25c2fdecf569674d57402868e99759a06429d10c1995902e8f898aec16c32
1..6
# tests 6
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

The six rows include the source-mutant case that reinstates pre-filter bucket
creation and expects the superseded `RangeError`. A green aggregate therefore
does not mean the failure path was omitted from the carrier.

### Unchanged BUG-004 regressions {#bug-004-regressions}

```text
# BUG-005 unchanged BUG-004 regression carriers
$ timeout 1140 node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs
exit: 0
lines: 226
sha256: 4c85ef4a915ee236f12a7d5af198d6faf44f4a124a794ff5b09cd7366d5699ad
1..36
# tests 36
# pass 36
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### Canonical repository selftest {#canonical-selftest}

```text
# BUG-005 canonical repository selftest
$ timeout 1140 node scripts/selftest.mjs
exit: 0
lines: 3893
sha256: 1b2f5218530e36a1f67ae6f37b3f6c540f67ebb86f841dc79dc359711b461acf
================================================
Research-Lab self-test: 3409 passed, 0 failed
================================================
```

### Artifact and regression quality {#artifact-and-regression-quality}

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
exit: 0
Artifact lint PASSED.

$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

$ git diff --check
exit: 0
output: empty
```

## Open Verification

- Reproduce the pre-fix crash at the historical HEAD and parent revision in an
	isolated checkout if those DoD items are to be checked.
- Run independent validation before any terminal status or scope completion.
- Preserve human acceptance as a separate, human-owned fact.
