# Bubbles Framework Change Proposal

- Title: traceauility canonical manifest tiered dod
- Slug: traceability-canonical-manifest-tiered-dod
- Created: 2026-07-15
- Created From: research-lab
- Requested Upstream Repo: bubbles

## Summary

Align `traceability-guard.sh` with the installed canonical `scenario-manifest.schema.json` and tiered per-scope DoD template. The guard must count scenario objects by their required `id` field and must read TP items nested under `#### Core Outcomes` and `#### Test Evidence Items` instead of reporting zero scenarios and zero DoD items.

## Why This Must Be Upstream

The false negatives are in framework-owned parser logic. Changing Feature 002 from schema-required `id` to the guard's stale `scenarioId` spelling would make the artifact non-canonical, and flattening tiered DoD sections would violate the framework's own scope template. A project script cannot repair the required state-transition/traceability gate semantics, and direct downstream edits to `.github/bubbles/**` are forbidden.

## Current Downstream Limitation

For `specs/002-distributed-tool-briefs-and-history`, the guard correctly finds 28 Gherkin scenarios and 122 Test Plan rows, but reports `scenario-manifest.json covers only 0 scenarios` because it greps for `scenarioId` while the installed schema requires `id`. It then reports all ten scope files have no DoD items because `extract_dod_items` exits at the first nested `####` heading immediately after `### Definition of Done - Tiered Validation`. Missing planned test files are legitimate pre-implementation failures and must remain distinct from these parser false negatives.

## Proposed Bubbles Change

1. Count and resolve scenario-manifest entries using canonical `scenarios[].id`, with schema-compatible parsing rather than a stale grep key.
2. Parse tiered DoD content through the end of the Definition of Done section, including nested Core Outcomes, Test Evidence Items, and Build Quality Gate subsections.
3. Preserve scenario-to-Test-Plan and missing-concrete-test-file failures exactly; do not let parser fixes weaken pre-implementation honesty checks.
4. Add hermetic selftests for canonical `id`, nested tiered DoD headings, positional TP items, malformed manifests, and genuinely missing tests.
5. Ensure artifact lint, traceability guard, and the installed JSON schema agree on one artifact shape.

## Affected Framework Paths

- `bubbles/scripts/traceability-guard.sh`
- `bubbles/scripts/traceability-guard-selftest.sh`
- `bubbles/schemas/scenario-manifest.schema.json` only if documentation alignment is needed; the current `id` contract should remain authoritative
- Shared scope/template documentation if parser expectations are described there

## Expected Downstream Outcome

After refresh, Feature 002 traceability output must report 28 scenario-manifest contracts and parse all tiered DoD/TP items. While the feature remains `not_started`, the guard should still exit nonzero only for real absent implementation test files or evidence, not for canonical planning-artifact parser mismatches.

## Acceptance Criteria

- [ ] Canonical `scenarios[].id` entries are counted and linked without requiring a duplicate `scenarioId` field.
- [ ] Tiered DoD subsections yield all TP items for each per-scope file.
- [ ] Feature 002 reports 28 manifest scenarios and 122 Test Plan/TP contracts after parser repair.
- [ ] Missing concrete implementation tests remain blocking until those files genuinely exist.
- [ ] Traceability selftests, framework validation, and normal downstream refresh pass.

## Notes

- Do not edit `.github/bubbles/**`, `.github/agents/bubbles*`, or other framework-managed files locally.
- Implement the framework fix in the Bubbles source repo, then refresh this repo via install/refresh.
