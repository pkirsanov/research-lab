# Bug: BUG-022 Historical Report Declaration Leak

## Summary

`collectDeclaredTestGlobs()` treats command-shaped text in immutable
`report.md` evidence as a current Node test-suite declaration. A historical
Feature 008 receipt therefore makes eight Playwright specifications appear to
belong to both Playwright and Node discovery.

## Severity

- [ ] Critical - System unusable or data loss
- [x] High - A blocking repository test fails and rewriting the evidence is not an admissible workaround
- [ ] Medium - Feature broken with a safe workaround
- [ ] Low - Minor issue

## Status

- [ ] Reported
- [x] Confirmed by parser-path diagnosis
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Filed

- Date: 2026-08-27
- Repository: `research-lab`
- Local HEAD at filing: `9dbd3b87c`
- Fresh `origin/main` at filing: `3c8828f7c`
- Workflow mode: `bugfix-fastlane`

## Reproduction Steps

1. Run `node --test tests/playwright-runtime.foundation.functional.mjs`.
2. Inspect the failing discovery-boundary assertion.
3. Call `collectDeclaredTestGlobs()` and list Node patterns selecting the eight
   `tests/portfolio-survival-*.spec.mjs` files.
4. Observe that the only site for `tests/portfolio-*.mjs` is
   `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md:3856`.

The command failure was supplied by the operator and remains diagnostic input
until the test owner executes it in this workflow. The parser-path diagnosis
was executed in the filing session and is recorded in `report.md`.

## Expected Behavior

- Historical evidence receipts preserve the exact commands that ran without
  becoming active suite declarations.
- Current command-registry or planning declarations remain discoverable.
- An active Node glob that selects a Playwright spec still violates the
  disjointness invariant.
- The historical Feature 008 report remains byte-for-byte unchanged.

## Actual Behavior

`collectDeclaredTestGlobs()` recursively reads every non-ignored text file and
applies `NODE_TEST_INVOCATION` without classifying the artifact. The immutable
receipt matches the same regular expression as an active command declaration.

## Classification

| Candidate | Verdict | Grounding |
| --- | --- | --- |
| Active Node selector | No for `tests/portfolio-*.mjs` | Removing only `report.md` sites removes all eight new portfolio crossings |
| Historical receipt parsed as active | Yes | The parser reports one site, the Feature 008 BUG-004 report at line 3856 |
| Legitimate crossing needing migration | No for the portfolio pattern; yes for two separate Node families | Excluding receipts exposes `tests/*.functional.mjs` and `tests/*.test.mjs` as report-only declarations; they need active declarations, not historical rewrites |

## Root Cause

The parser has a lexical command detector but no declaration-authority
boundary. `listFilesRecursive()` supplies every readable file below the
repository root, and `collectDeclaredTestGlobs()` scans each line for
`NODE_TEST_INVOCATION`. Its exclusions cover only the parser itself and its
baseline. They do not distinguish active command contracts from immutable
execution receipts.

The immediate false crossing and the latent reachability issue have one shared
cause: evidence receipts are being used as command authority. Excluding those
receipts removes the false portfolio crossing and reveals that two legitimate
Node families currently rely on historical evidence for reachability.

## Impact

- The runtime-foundation test reports eight false new crossings.
- Historical evidence becomes unsafe to preserve because an accurately quoted
  command can change current repository behavior.
- Reachability can appear green because a command ran once, even when no active
  command contract selects the family now.
- Weakening the disjointness assertion would hide a real active crossing as
  well as this false one.

## Change Boundary

Owned implementation surfaces:

- `scripts/validate-test-file-reachability.mjs`
- `tests/playwright-runtime.foundation.functional.mjs`
- `.specify/memory/agents.md`
- this BUG-022 packet

Protected surfaces:

- the Feature 008 BUG-004 `report.md`, including line 3856
- `specs/_bugs/BUG-016-*` through `specs/_bugs/BUG-021-*`
- market-brief, tool-brief-v2, open-work, and all concurrent dirty paths
- `.github/bubbles/**` and all other installed framework files

## Related

- Feature contract: `specs/008-portfolio-survival-and-brief-lab/`
- Historical receipt: `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md`
- Parser: `scripts/validate-test-file-reachability.mjs`
- Failing boundary test: `tests/playwright-runtime.foundation.functional.mjs`
