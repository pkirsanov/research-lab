# Bubbles Framework Change Proposal

- Title: execution history reconstructed timestamp declaration
- Slug: execution-history-reconstructed-timestamp-declaration
- Created: 2026-08-12
- Created From: research-lab
- Requested Upstream Repo: bubbles

## Summary

Give Check 7A (Gate G077) a way to distinguish an executionHistory overlap that
evidences two agents running concurrently from one that evidences a span nobody
measured. Add an entry-level `timestampReconstructed` / `timestampReconstructedReason`
declaration, mirroring the `durationUnmeasured` / `durationUnmeasuredReason` pair the
same check already accepts for zero-duration spans. A pair in which at least one side
carries a substantive declaration is surfaced rather than blocked, and is still
reported by agent name.

## Why This Must Be Upstream

The overlap comparison lives entirely inside the framework-owned Check 7A analyzer in
`bubbles/scripts/state-transition-guard.sh`. No project-owned artifact can change how
that analyzer classifies a pair of spans. Editing `.github/bubbles/**` downstream
violates framework immutability, is refused by `framework-write-guard`, and would be
erased on the next refresh — all three were confirmed in this repository before this
proposal was written.

## Current Downstream Limitation

Feature 011 records 21 executionHistory entries from a 2026-07-17 operator-directed
fast-delivery pass that logged approximate wall-clock boundaries instead of captured
start and finish instants. Two pairs consequently overlap:

- `bubbles.stabilize(22:55–23:12)` overlaps `bubbles.audit(23:01)`
- `bubbles.validate(23:46–00:00:37)` overlaps `bubbles.chaos(23:55)`

Feature 011's own validate pass recorded finding `VAL-011-G077`: the installed check
"has no correction or supersession input", and "the original timestamps remain
unchanged because no source-backed replacement times are available". That leaves
exactly two exits, and both are bad. Invent replacement timestamps — which is the
fabrication Check 7A exists to catch — or leave the packet permanently uncertifiable
even though all four of its scopes are Done and every other gate passes. The check
correctly refuses to be satisfied, and correctly offers no way to be satisfied
honestly.

## Proposed Bubbles Change

1. Read `timestampReconstructed` (boolean) and `timestampReconstructedReason` (string)
   from each executionHistory entry.
2. Classify an overlapping pair as reconstructed when at least one side declares it
   with a reason of at least 20 characters. One side is sufficient: if either span was
   not measured, the pair cannot testify to concurrency at all, and demanding the
   declaration on both would force a false declaration onto the entry whose timestamps
   are trustworthy.
3. Emit reconstructed pairs as `RECONSTRUCTED_OVERLAPS` / `RECONSTRUCTED_OVERLAP_DETAIL`
   and surface them through `info`, naming which agent's span was declared. Never
   silent.
4. Keep undeclared overlaps blocking, and keep a perfunctory reason blocking, so the
   declaration costs something rather than becoming a bypass with extra steps.
5. Add selftest coverage driving the real extracted analyzer over three fixtures:
   undeclared (blocks), substantively declared (surfaces), declared-but-perfunctory
   (blocks).

## Affected Framework Paths

- `bubbles/scripts/state-transition-guard.sh` (Check 7A analyzer and its shell consumer)
- `bubbles/scripts/state-transition-guard-selftest.sh`

## Upstream Implementation Status

Implemented in the Bubbles source repository as part of this proposal, not merely
requested. The analyzer was extracted from guard source and driven over the three
fixtures above; undeclared reported `OVERLAPS=1`, substantively declared reported
`RECONSTRUCTED_OVERLAPS=1` with no `OVERLAPS`, and a nine-character reason reported
`OVERLAPS=1`. This repository still consumes the pre-change installed snapshot and
gains the behavior only at the next framework refresh.

## Expected Downstream Outcome

After the framework refresh, `state-transition-guard.sh specs/011-volatility-regime-and-sizing-lab`
reports both pairs as declared-reconstructed under Check 7A, lists the two agents whose
spans were reconstructed, and reaches `verdict: PASS` with `failedChecks: []`. Feature
011's honest declarations are already written into its `state.json`, so no further
downstream edit is required.

## Acceptance Criteria

- [ ] An overlap with no declaration still blocks with the existing message.
- [ ] An overlap whose reason is under 20 characters still blocks.
- [ ] An overlap with one substantively declared side is surfaced, not blocked.
- [ ] The surfaced line names which agent's span was declared reconstructed.
- [ ] Feature 011 reaches `verdict: PASS` without any timestamp being altered.
