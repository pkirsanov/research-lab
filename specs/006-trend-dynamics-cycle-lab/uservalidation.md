# User Validation: Trend Dynamics and Cycle Lab

Execution evidence is recorded in [report.md](report.md), and acceptance obligations are defined by [scopes.md](scopes.md).

## Checklist

- [x] The acceptance inventory is derived from the Outcome Contract, BS-001 through BS-020, FR-001 through FR-083, NFR-001 through NFR-018, and the complete UX/design contracts.
- [x] Five dependency-ordered scopes are defined; Scope 1 is the foundation and every engine/UI/replay overlay depends on it.
- [x] Every business scenario has one stable `SCN-006-*` contract, SHA-256 Gherkin hash, persistent Regression E2E title, and report evidence anchor.
- [x] The checklist distinguishes deterministic algorithm fixtures from source-qualified historical browser inputs and makes no human-acceptance claim.

### Human Acceptance - Granted 2026-08-13

The items below required human acceptance after delivery. **The operator granted acceptance for all sixteen
in-session on 2026-08-13**, so this section no longer withholds a claim; it records one, with its provenance and
the evidence that was current at the moment the grant was given.

**Provenance.** Acceptance is the operator's, not an agent's. It was given as an explicit instruction to accept
the full set, after delivery and after the verification battery below was re-run on the accepted revision. No
agent inferred, assumed, or self-issued this acceptance.

**Evidence current at the grant** (re-executed 2026-08-13, not carried forward from the delivery run):

| Command | Exit | Result |
| --- | --- | --- |
| `node scripts/validate-trend-dynamics-cycle.mjs` | 0 | `scope5-replay-history-workplan=PASS cases=5 work-units=2200 jobs=94 history=read-back-validated`, then `OK` |
| `npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | 0 | **24 passed** — the full `SCN-006-*` matrix plus NFR-003 |
| `node scripts/selftest.mjs` | 0 | **1635 passed, 0 failed** |
| `bash .github/bubbles/scripts/traceability-guard.sh specs/006-trend-dynamics-cycle-lab` | 0 | `RESULT: PASSED`, 20/20 scenarios mapped across 50 test rows |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/006-trend-dynamics-cycle-lab` | 0 | `Artifact lint PASSED`, all checked DoD items carry evidence blocks |

The final item is machine-verified rather than observed: `git log --name-only eac966b7~1..af89f280` shows the
Feature 006 delivery commits touched only `trend-dynamics-cycle-lab.html`, its own spec artifacts, its own test
and validator, and its own fixture. No `specs/005-*` or `palm-springs-*` path appears, so Feature 005 is
untouched by construction and not merely by inspection.

- [x] Simple states direction, trend type, horizon, inspectable strength, dynamics, earliest credible change, uncertainty, support, contradiction, context, and confirmation/invalidation without collapsing distinct concepts.
- [x] Cautious, Balanced, Early, and governed custom controls visibly change speed/reliability while source/history/as-of/multiplicity/family/invalidation rules remain fixed.
- [x] Effective, detected, confirmed, invalidated, and retrospective dates remain separate in replay and original records remain immutable.
- [x] Weekly and annual seasonality remain separate; irregular data create no silent interpolation; insufficient long-cycle history exposes no phase or next turn.
- [x] Lifecycle, deterministic calendar, regime, event, empirical seasonality, and quasi-periodic records retain their type-specific fields and limitations.
- [x] Climate context is source-, season-, geography-, mechanism-, and uncertainty-qualified; candidate lead/lag remains association without independent causal evidence.
- [x] Search breadth, raw and adjusted evidence, BH/Holm policy, discovery/confirmation split, nearby stability, and held-out outcomes are inspectable.
- [x] Missing, stale, degraded, revised, incompatible, mixed, contradicted, unsupported, ineligible, and unavailable states remain truthful and never become neutral numeric output.
- [x] Simple and Power preserve one result, parameter state, truth state, focus context, and source data across controls and mode changes.
- [x] Charts have visible interpretation, provenance, parameters, uncertainty, keyboard traversal, nonblank synchronous pixels, and equivalent tables or structured summaries.
- [x] The route remains usable at 390 and 1440 CSS pixels and 130% root text without body overflow, overlap, clipped focus, hover-only meaning, or color-only state.
- [x] Imported labels and metadata render as text; no route control requests holdings, account, identity, execution, or credential data.
- [x] The owner read preserves current/stale/degraded/unavailable truth, caveat, invalid-field omission, and deep link; consumers do not recalculate or upgrade it.
- [x] Progress and cancellation keep navigation usable, retain the last complete result, and publish no partial/canceled/superseded output.
- [x] Educational research and no-guarantee language is visible in route metadata, the main decision surface, owner-read context, and footer.
- [x] Feature 005 and every unrelated dirty-worktree path remain unchanged by Feature 006 delivery.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-25T16:59:38Z
- method: human-interactive

