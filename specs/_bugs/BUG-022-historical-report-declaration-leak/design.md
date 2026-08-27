# Bug Fix Design: BUG-022 Historical Report Declaration Leak

## Ownership Status

This document records the substantive filing-session diagnosis and proposed
repair. `bubbles.design` remains the owner of the final design decision and must
confirm or amend it before implementation dispatch.

## Root Cause Analysis

### Investigation Summary

The investigation traced the discovery assertion to
`collectDeclaredTestGlobs()` in
`scripts/validate-test-file-reachability.mjs`. The function recursively scans
repository text, excludes only itself and its baseline, and accepts every
glob-shaped `tests/...mjs` argument after `--test`.

The Feature 008 BUG-004 report contains an immutable evidence-table row whose
command is `node --test tests/portfolio-*.mjs`. That row is lexically identical
to a current command declaration. The parser records it as the only site for
that pattern, which selects eight Playwright `.spec.mjs` files.

### Root Cause

Declaration extraction conflates two artifact roles:

1. active authority that states what the repository runs now; and
2. historical evidence that states what ran in a prior execution.

Argument-position parsing protects against ordinary prose but cannot determine
artifact authority. The absent artifact-role boundary is the root cause.

### Discriminating Result

Filtering only sites whose basename is `report.md` produces these results:

- all eight new portfolio crossings disappear;
- the nine pre-existing frozen crossings remain;
- `tests/portfolio-*.mjs` has no active site;
- `tests/*.functional.mjs` and `tests/*.test.mjs` also lose their only sites;
- 33 currently reachable files become newly exposed orphans until those two
  legitimate families receive active declarations.

This distinguishes the discovered defect from a legitimate portfolio crossing
and also prevents a narrow one-line exclusion from manufacturing reachability
debt.

## Fix Design

### Solution Approach

1. Add a pure, exported artifact-authority predicate to
   `scripts/validate-test-file-reachability.mjs`.
2. Treat every basename `report.md` as an evidence receipt for declaration
   extraction. Keep it readable by other tools; only command-authority parsing
   skips it.
3. Preserve Playwright config parsing and all active Node pattern parsing.
4. Add explicit current commands for `tests/*.functional.mjs` and
   `tests/*.test.mjs` to `.specify/memory/agents.md`.
5. Add fixture-backed adversarial tests that pair the same broad pattern in a
   report and in an active authority. The report case must be ignored; the
   active case must remain visible and capable of producing a crossing.
6. Leave the Feature 008 BUG-004 report untouched.

### Why Basename Scoping

`report.md` is the repository's execution-evidence artifact in both single-file
and per-scope layouts. Its role does not depend on a particular feature number,
bug number, or directory depth. A basename rule therefore generalizes without
an allowlist of historical paths.

### Active Family Migration

The command registry already owns current project command truth. Adding the two
Node family commands there converts accidental receipt-derived reachability
into explicit current reachability. The broad portfolio command is not migrated
because it crosses runner ownership by matching `.spec.mjs` files.

### Adversarial Regression Design

The regression fixture must contain:

- a Playwright `testMatch` for `**/*.spec.mjs`;
- a `report.md` receipt with `tests/portfolio-*.mjs`;
- an active command authority with a safe functional glob;
- an adversarial variant that moves the broad portfolio glob to the active
  authority.

The control must show no report-derived declaration. The adversarial variant
must expose the broad pattern and select a browser spec. A test that only checks
the ignored report case would weaken P23 because a parser that ignores every
Node declaration would also pass.

## Alternatives Considered

1. Rewrite the historical command to enumerate files. Rejected because it
   corrupts immutable evidence and violates P21.
2. Add the eight portfolio specs to `KNOWN_DISCOVERY_CROSSINGS`. Rejected
   because there is no active Node selector and the invariant would be weaker.
3. Suppress only the exact Feature 008 path or pattern. Rejected because another
   report receipt could recreate the same defect immediately.
4. Exclude every file under `specs/`. Rejected because active scope and test-plan
   declarations may be valid current authority; the discovered distinction is
   evidence role, not directory ownership.
5. Exclude reports without declaring the two legitimate Node families.
   Rejected because it turns 33 files into real current orphans.

## Change Boundary And Rollback

The implementation is limited to the parser, its focused functional test, the
project command registry, and this packet. Rollback is the exact inverse of
those implementation hunks. The Feature 008 historical report is not part of
either direction.

## Complexity Tracking

| Decision | Simpler fix considered | Why rejected |
| --- | --- | --- |
| Add explicit active declarations with report scoping | Skip `report.md` only | The simpler edit reveals 33 current orphans because two real Node families relied on receipts |
| Pair control and adversarial fixture cases | Assert only that reports are ignored | An ignore-everything parser would pass and weaken the guard |
