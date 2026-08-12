# Deployment - `improvement-plan` phase

## Delivery Model

Research Lab is a static, build-free GitHub Pages product. The repository contains the deployable HTML,
JavaScript, JSON, and documentation. This phase adds no server, container image, deployment adapter, database,
or runtime environment.

The release is not deployment-ready today. The scheduled-publication atomicity suite is red, and required
release bindings remain incomplete.

## Release Preconditions

All conditions are required:

1. P0 atomicity is green under the focused scheduler and repair suite.
2. A02 has a `/bubbles.clarify` owner-decision packet assigning the producer change between Feature 002 and
   Feature 012, Feature 002 has consented, and the assigned path regenerates the 12-ticker owner-read artifact
   against the 62-applicable-cell denominator.
3. Feature 004 contributes a source-qualified headless FX read or explicit unavailable result and passes
   recertification review.
4. New recommendation proposals remain machine-checkable while historical scorecard events remain append-only.
5. Every required G101 binding is terminal-for-mode and validate-certified.
6. D20 record reconciliation is complete without reconstructed execution history.
7. Product baseline validation passes on the release revision.

## Rollout Sequence

| Stage | Change | Promotion condition |
|---|---|---|
| 1. Publication repair | Reconcile scheduler, repair fixture, final validation, and rollback contracts | Focused atomicity suite passes every scenario |
| 2. Watchlist regeneration | After A01, assign the producer change between Feature 002 and Feature 012 through `/bubbles.clarify`; require Feature 002 consent; invoke the existing producer inside the scheduled transaction | Owner-decision packet exists; assigned implementation publishes all 12 tickers and matches same-input dry-run counts |
| 3. FX integration | Add the design-required headless FX owner read | Integrated Feature 004 tests and validate review pass |
| 4. Sequential feature delivery | Continue Feature 008 from current Scope 6; run validate-owned Feature 007 Scope 1 certification review before its current owner starts Scope 2; complete Feature 006 Scope 5; implement 015 after decisions | Each owning scope passes its own completion gates; partial commits are not treated as scope completion |
| 5. Record reconciliation | Resolve D20 from existing evidence | No blocking unbacked phase claim and no invented history |
| 6. Catalogue expansion | Implement 013 and 019, then 020; consider 014/016 later | P0-P3 complete and each new tool lands atomically in registry/navigation/tests |
| 7. Release promotion | Publish the coherent repository revision to Pages | G101 and all named executable checks pass |

## Atomic Publication Contract

A scheduled run must either publish one coherent generation or retain the prior coherent generation. Required
owned artifacts include the candidate data, narrative pair, current pointers, history, indexes, scorecard, and
owner-read output affected by the run.

Failure behavior:

- a final-invalid pair must not publish;
- an invalid baseline may be replaced only by a final-valid matching pair;
- a rejected candidate may not mix with retained narrative;
- rollback restores every owned baseline byte and index path;
- a raw-data-only path is acceptable only where the governing scenario permits it;
- developer worktrees and active concurrent spec files remain untouched.

The current suite does not satisfy this contract, so this section is an exit requirement, not a delivered
claim.

## Configuration And Data

- `tools.json` remains the product inventory source.
- `journeys.json` remains the journey source.
- `watchlist.json` remains tickers-only.
- `market-brief.owner-reads.json` is generated output, not a hand-maintained release file.
- `market-brief.scorecard.json` remains append-only in meaning; historical events are not rewritten.
- Missing data remains explicit unavailable, stale, disputed, or not relevant.

No credential or private portfolio data is added to committed output.

## Verification Plan

The planning scorecard baseline is fixed at local repository commit
`eac966b78bacc5697458a7c8e54a684f6517c05b` (2026-08-12): 246 closed, 96 resolved, 143 not evaluable,
`notEvaluableShare` 0.5813, and hit rate 0.5729. Scheduled origin artifacts advance independently. Release
verification records a fresh measurement date and repository revision rather than updating that baseline in
this document.

| Check | Purpose | Expected before release |
|---|---|---|
| `node --test tests/brief-refresh-atomicity.test.mjs` | Scheduled transaction and rollback | Exit 0; zero failed subtests |
| `node scripts/build-owner-reads.mjs --dry-run --as-of <release-date>` | Same-input owner-read capacity | 12 tickers; supported current reads plus explicit gaps, recorded with the release revision |
| `node scripts/selftest.mjs` | Registry, navigation, and current model invariants | Exit 0 |
| G101 release-delivery reconciliation | Required feature delivery | Exit 0 only at release promotion |
| Release-packet location guard | Canonical packet placement | Canonical packet clean; known `_site` mirror false positives must be reported, not concealed |
| `git diff --check -- docs/releases/improvement-plan` | Packet whitespace integrity | Exit 0 |

## Rollback Strategy

Rollback is a repository revision rollback to the last coherent publication. It must not regenerate historical
outcomes or selectively edit the scorecard. For scheduled-publication failures, retain or restore the prior
coherent pair, pointers, history, indexes, and generated page artifacts as one transaction.

Do not repair a public mismatch by hand-editing generated JSON. Fix the producer or transaction, execute its
checks, then publish a coherent revision.

## Health And Observability

There is no long-running application service to monitor. Release health comes from:

- scheduled-job exit and transaction-selection logs;
- payload and cache validators;
- explicit stale and unavailable states in the published product;
- owner-read ticker/current/gap counts with measurement date and repository revision;
- scorecard closed, resolved, invalidated, and not-evaluable counts with measurement date and repository
   revision;
- Pages availability and repository-to-site parity checks where the active release workflow defines them.

## Technical Ownership

This packet documents a static Pages rollout. It does not claim signed images, deployment adapters, config
bundles, or Build-Once Deploy-Many infrastructure. No `/bubbles.devops` technical-accuracy handoff is required
for a deployment model that does not use those capabilities.
