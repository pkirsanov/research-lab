# Spec: BUG-022 Historical Evidence Is Not Active Test Authority

**Status:** In progress
**Workflow mode:** `bugfix-fastlane`

## Purpose

Define the distinction between a command declaration that governs current test
discovery and an immutable receipt that records what ran at an earlier point in
time.

## Outcome Contract

- **Intent:** Make current declaration and reachability discovery distinguish active command authority from immutable historical report receipts.
- **Success Signal:** The selected repair demonstrates every outcome below.
  - Historical Feature 008 report bytes remain unchanged.
  - Active declaration sites remain authoritative with provenance.
  - Unknown declaration candidates fail closed.
  - The `tests/*.functional.mjs` and `tests/*.test.mjs` Node families remain explicitly reachable from current command authority.
  - A protected active Node and Playwright crossing still blocks.
  - The current Feature 008 consumer passes under BUG-017's selected one-worker `system-chrome` route.
- **Hard Constraints:** Preserve authority, reachability, history, and the declared change boundary together.
  - Do not rewrite historical evidence.
  - Do not create a parser-only intermediate state that leaves legitimate Node families orphaned.
  - Do not weaken the reachability baseline or the protected crossing set.
  - Do not change protected BUG-016 through BUG-021 artifacts, concurrent work, or excluded paths.
- **Failure Condition:** The fix fails if history gains authority, active commands lose reachability, unknown candidates disappear, or protected crossings pass. It also fails if orphan debt appears or excluded work changes.

## Product Principle Alignment

### P17 - Reachable or removed

Every committed test must remain selected by a current verification contract.
A historical receipt cannot satisfy that requirement because it does not cause
the command to run now.

### P21 - Additive contracts, append-only history

The Feature 008 receipt must remain unchanged. The correction is additive: the
parser learns that reports are evidence, while current suite declarations are
added to the active command registry.

### P23 - A guard that cannot fail is not a guard

The disjointness guard must still fail when the same broad Node pattern is
declared from an active authority surface. The regression must distinguish an
ignored historical receipt from a live crossing.

This change improves measurement quality by making test reachability and runner
ownership reflect current commands rather than past transcripts. It delivers no
new product capability and makes no roadmap claim.

### Single-Capability Justification

- **Capability:** Classify repository test-declaration candidates as active,
   historical, or error outcomes for reachability and runner-disjointness checks.
- **Boundary:** The capability starts with candidates extracted by
   `collectDeclaredTestGlobs()` and ends with its classified result. It does not
   own test execution, command authoring, or historical evidence content.
- **Consumers and variants:** `validateTestFileReachability()`,
   `tests/playwright-runtime.foundation.functional.mjs`, and
   `scripts/selftest.mjs` consume the same classification path. Active,
   historical, and error are closed outcomes, not separate implementations.
- **Why no foundation split:** This bug repairs one policy inside the existing
   reachability guard. No second provider, adapter, screen, service, or reusable
   product contract exists, so a foundation split would add an unused extension
   layer.

## Requirements

### FR-BUG022-001 - Evidence receipts are non-declarative

A `report.md` file may quote an exact `node --test` command without adding its
glob to the current declaration set.

### FR-BUG022-002 - Active declarations remain declarative

The same command-shaped text in an active command authority must still produce
a `node-test-argument` declaration with its real artifact and line.

### FR-BUG022-003 - Runner disjointness is unchanged

A browser specification selected by both Playwright `testMatch` and an active
Node glob remains a blocking crossing. The fix must not add the eight portfolio
paths to the frozen crossing allowlist and must not relax either set relation.

### FR-BUG022-004 - Historical evidence is immutable

The captured `node --test tests/portfolio-*.mjs` command, its exit, pass count,
and sha256 remain byte-for-byte unchanged in the Feature 008 BUG-004 report.

### FR-BUG022-005 - Current Node families have active authority

The `tests/*.functional.mjs` and `tests/*.test.mjs` families must be declared in
the project command registry or another current authority surface. Historical
report receipts do not count.

### FR-BUG022-006 - Reachability remains fail-closed

Parser scoping must not make the scan vacuous, absorb new orphans into the
baseline, or silently exempt files that register `node:test` tests.

### FR-BUG022-007 - Change containment is exact

No protected BUG-016 through BUG-021 artifact, market-brief path, tool-brief-v2
path, open-work path, concurrent dirty path, or installed framework file may
change.

## Acceptance Criteria

1. The pre-fix runtime-foundation command fails on exactly the eight new
   portfolio crossings.
2. A fixture report containing `node --test tests/portfolio-*.mjs` contributes
   no Node declaration.
3. An active authority containing the identical command contributes the pattern
   and demonstrates that the disjointness assertion can still fail.
4. `node scripts/validate-test-file-reachability.mjs` exits 0 without adding to
   its baseline.
5. `node --test tests/playwright-runtime.foundation.functional.mjs` exits 0.
6. `node scripts/selftest.mjs` exits 0 in a clean tree.
7. Applicable Feature 008 Node and Playwright tests exit 0.
8. Artifact lint and the state-transition guard execute for this packet with
   their real verdicts recorded.
9. A path-limited diff proves the protected Feature 008 report and every
   excluded surface are unchanged.

## Protected Historical Record

This specification does not reinterpret the Feature 008 command as a bad
execution. It was a real successful command for the inventory at that time.
The defect is only the parser's current use of that receipt as authority.
