# Bug: BUG-024 Spec Path Historical Report Leak

## Summary

`collectSpecTestPathReferences()` treats every `tests/*.mjs` token in a bug or
feature report as a current test-path claim. Five immutable Feature 031 report
references to a retired filename therefore fail the repository path guard even
though no active plan or test command names that path.

## Severity

- [ ] Critical - System unusable or data loss
- [x] High - A repository-wide delivery gate fails and historical evidence cannot be rewritten
- [ ] Medium - Feature broken with a safe workaround
- [ ] Low - Minor issue

## Status

- [ ] Reported
- [x] Confirmed by current guard evidence and controlling-path inspection
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Filed

- Date: 2026-09-01
- Repository: `research-lab`
- Workflow mode: `bugfix-fastlane`
- Source finding: `XRL-PATH-GUARD-HIST-001`
- Discovery evidence: Feature 031 tool-log row 428

## Reproduction Steps

1. Run `node scripts/validate-spec-test-paths.mjs --all-sites`.
2. Observe one new missing path:
   `tests/shock-transmission.resource.test.mjs`.
3. Observe five reference sites, all inside
   `specs/031-shock-transmission-foundation/report.md`.
4. Inspect `collectSpecTestPathReferences()` and observe that it recursively
   extracts path tokens from every readable spec artifact without assigning an
   active, historical, or error authority role.

The current reproduction was executed by `bubbles.test` for Feature 031. This bug
phase did not rerun the guard.

## Expected Behavior

- Active scope plans, structured Test Plans, and current command contracts remain
  authoritative test-path claims.
- Immutable report receipts remain visible diagnostics but cannot create a current
  missing-path failure.
- An unknown candidate surface fails closed rather than silently disappearing.
- The Feature 031 report remains byte-for-byte unchanged.
- The frozen missing-path baseline does not grow.

## Actual Behavior

The collector attaches only path, artifact, and line. The validator groups every
site into active or planned-only status by owning spec, so a historical report site
falls into `actionableMissing`. Because the retired path is not in the frozen
baseline, the guard exits 1.

## Root Cause

The spec-path collector has lexical path detection but no artifact-authority
classification. It cannot distinguish an active planning declaration from an
immutable execution receipt. BUG-022 repaired this policy for the separate Node
glob collector, but its explicit capability boundary ends at
`collectDeclaredTestGlobs()` and does not cover this consumer.

## Impact

- The broad repository selftest carries one path-guard failure.
- Feature 031 Scope 1 cannot close its broad build-quality row.
- Rewriting the Feature 031 report would corrupt execution history.
- Adding the path to the baseline would freeze a newly discovered false authority
  instead of fixing classification.

## Existing-Owner Check

The canonical bug inventory was searched for the finding id, the collector symbol,
the retired path, and historical report path classification. No current packet owns
this consumer. BUG-022 is related precedent, not an owner: its spec and design
explicitly bind its capability to the Node test-glob reachability collector.

## Change Boundary

Potential repair surfaces for design review:

- `scripts/validate-spec-test-paths.mjs`
- `scripts/selftest.mjs`
- project-owned shared authority classification only if design proves reuse is
  required
- this BUG-024 packet

Protected surfaces:

- `specs/031-shock-transmission-foundation/**`
- `scripts/validate-spec-test-paths.baseline`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/**`
- all Feature 031 source, tests, and fixtures
- all Horizon Ladder source, data, notes, and tests
- registry, navigation, and standalone-Lab surfaces
- installed framework files under `.github/`

## Related

- Blocking feature: `specs/031-shock-transmission-foundation/`
- Failing collector: `scripts/validate-spec-test-paths.mjs#collectSpecTestPathReferences`
- Related precedent: `specs/_bugs/BUG-022-historical-report-declaration-leak/`
- Current real test: `tests/shock-transmission.resource.functional.mjs`
- Historical retired token: `tests/shock-transmission.resource.test.mjs`

## Required Route

`bubbles.design` must define one reusable authority model for this second consumer
without broad basename skipping. `bubbles.plan` must then own the executable scope
and paired historical-versus-active adversarial cases. No fix is implemented here.