# Actions - `improvement-plan` phase

**Execution rule:** run in priority order. Do not start a lower priority because a higher-priority item is
inconvenient. Active spec owners retain their scope locks.

## Ordered Action Ledger

| ID | Priority | Owner | Current blocker | Exact unblock condition | Acceptance metric | Collision note |
|---|---|---|---|---|---|---|
| A01 | **P0 — DELIVERED `d85820b7`** | `/bubbles.workflow` routes `/bubbles.implement`, then `/bubbles.validate` | ~~`tests/brief-refresh-atomicity.test.mjs` is red~~ Resolved. The fixture's lane stub echoed the live payload verbatim, so when the live brief legitimately began publishing an empty attention tier the stub handed the composer zero candidates | Fixture lanes now author their own candidate that the composer refuses BY NAME, so the tier explains its emptiness instead of the validator being relaxed | `timeout 240 node --test tests/brief-refresh-atomicity.test.mjs` exits 0 — **27 tests, 27 pass, 0 fail**, including both byte-retention and both invalid-baseline repair cases. 74 insertions, 0 deletions: no assertion weakened, no validator relaxed | Reserve shared publication files before editing. Do not touch active Feature 007/008 or portfolio files |
| A02 | **P1 — DELIVERED `554a07ae`** | **OWNERSHIP DECIDED: Feature 002.** Feature 012 remains the consumer | ~~Scheduled publication does not invoke the 12-ticker owner-read producer~~ Resolved. The producer existed but appeared in `brief-refresh.mjs` only inside a COMMENT | `OWNED_PATHS` **is** the publication transaction, so enrolling an artifact in it is definitionally a transaction change, and a rollback must revert owner-reads with the payload or the matrix cites reads for a payload that never shipped. A consumer controlling its own producer would destroy the independence that makes the matrix trustworthy | **4 tickers/16 reads → 12 tickers/48 reads; 35 current + 13 reasoned gaps** — exactly the recorded metric. Three defects fixed rather than worked around: baseline capture hard-failed on a not-yet-existing owned path (would have broken EVERY future derived artifact; now uses the data directory's absent-sentinel pattern, and rollback DELETES what a failed run created); the atomicity fixture lacked the producer and `rlmetrics.js`; the producer's exit code encoded COVERAGE not execution, so a truthful all-gap artifact was indistinguishable from a crash and would have refused the whole brief — `--require-coverage` preserves the strict check. Atomicity 27/27 | Feature 008 stayed a consumer; its privacy boundary remains green |
| A03 | **P1 — DELIVERED `cbb5ac53`** | `/bubbles.workflow` routes `/bubbles.implement`, then `/bubbles.validate` for Feature 004 | ~~`scripts/brief-refresh.mjs` lacks `buildFxToolRead`; the FX row is stale~~ Resolved | `buildFxToolRead` runs the SAME RLFX chain the route runs at boot; no scoring, fit, tracking or admission rule is restated | The scheduled payload now carries a deterministic, source-qualified **explicit unavailable**: every committed evidence source is `unreviewed`/`denied` with a null source-use policy, so RLFX's own admission predicate admits none and the model reaches no verdict. Admissibility is READ from the universe, so the gate tracks the contract. selftest 1629 → **1635/0**; Feature 004 node **14/14**; FX browser spec **39/39**; payload contract PASS | `scripts/brief-refresh.mjs` is shared with A01/A02. Landed sequentially after A01; Feature 007/008 artifacts untouched |
| A04 | **P2 — SCOPE 6 DONE `d6db5f80`** | Current Feature 008 owner | ~~17 unchecked DoD; three Core Delivery checks never executed~~ Resolved. All three verified by execution and recorded in `report.md` under `Core Delivery Verification` | Run each declared command and tick on real evidence, or implement what it reveals. **Never tick on trust** | **Scope 6 Done in all three mirrors; `currentScope` → 7.** Verifying the routing clause found a REAL defect: `state.briefOwners` was `{}` and never populated, so every brief item claimed no owning tool existed when one did — fixed by reading the public owner-read registry and guarded by 5 selftest assertions proven RED under a controlled break. Three Test Plan rows also declared titles that do not exist; corrected and each re-executed to 1 passing test. Honest residual recorded: NFR-011/NFR-013 are covered behaviourally but carry no NFR tag. Artifact lint PASSED; portfolio 98/98; selftest 1640/0 | Feature 008 scopes 7-16 remain; Scope 7 is `Return And Drawdown X-Ray` |
| A05 | **P2** | `/bubbles.workflow` routes decisions to `/bubbles.design`, then work to `/bubbles.implement` | Feature 015 is `specs_hardened`; routed decisions P-015-01, P-015-02, P-015-03, and P-015-07 remain unresolved; implementation has not started | Owning design decisions are recorded with Feature 002 co-consent where required; source-edit lockout is clear; implementation proceeds in scope order | Track-record tool and owner read ship from append-only history; corrections are new events; required tests and validate certification pass | Do not change Feature 002 contracts without its owner. Preserve active portfolio and release work; never backfill historical verdicts |
| A06 | **P3** | `/bubbles.validate` next; then the current Feature 007 owner | Scope 1 is Done and the prior blocker is resolved by commit `7972b308`. `state.json` names current Scope `02-technique-engine` and `nextRequiredOwner: bubbles.validate`; the later five-gate model, setup state, trigger, expectancy, and owner publication remain unbuilt | `/bubbles.validate` performs the validate-owned Scope 1 certification review; only after that review does the current owner begin Scope 2 and continue through dependency-ready scopes | Scope 1 certification is recorded without fabricated promotion; technical coverage changes from stale only when later scopes publish a deterministic owner read from the real five-gate model | No parallel Scope 2 pickup. Preserve the validate handoff and current `in_progress` lifecycle |
| A07 | **P3 — DELIVERED `fe4dd95a`: Feature 006 is `done` and certified** | Current Feature 006 owner | ~~Scope 5 In Progress~~ / ~~10 unrun phases~~ / ~~16 unclaimed acceptance items~~ All resolved | — | **`state-transition-guard` verdict PASS, `failedGateIds []`, `failureCount 0`.** All 5 scopes Done, all 13 phases recorded with accepted provenance, operator acceptance granted for all 16 items, `certifiedAt` set. Spec-review verdict fresh-no-drift: 83 FRs / 18 NFRs, all 20 scenario contracts resolve to shipped rows, traceability 0 warnings, implementation-reality 0 violations | Shared `brief-refresh.mjs` work is clear |
| A08 | **P3** | Owning spec workflows with `/bubbles.validate` review | D20: spec 009 has phase claims and zero execution history; spec 012 has implement claims without implement execution history; spec 002 has warning-class excess claims versus one run | Owners classify each claim against existing evidence, correct unsupported claims where policy permits, and retain honest gaps; no historical run is invented | Zero blocking unbacked phase claims; spec 002 warning is justified with existing evidence or corrected; audit trail records each decision | Touch only 002/009/012 state when routed. Do not enter active 007/008 artifacts or synthesize timestamps/output |
| A09 | **P4** | `/bubbles.workflow` routes `/bubbles.implement` for Feature 013 | P0-P3 are not clear; lifecycle says `in_progress` but the Market Regime registered tool is not implemented | A01-A08 acceptance conditions are met and Feature 013 has an owner-ready path | Market Regime is registered, reachable, tested, and contributes a truthful owner read before registry count increases | Do not start while shared publication or active feature owners are unresolved |
| A10 | **P4** | `/bubbles.workflow` routes `/bubbles.implement` for Feature 019 | P0-P3 are not clear; Feature 019 is `not_started` | A01-A08 clear and Feature 019 starts from its existing plan with one owner | Research Agenda is registered and no-execution; recurring records remain local/public-safe as designed | Coordinate registry edits with A09; one atomic registry change per delivered tool |
| A11 | **P4** | Feature 020 owner after Feature 019 | Feature 020 is `not_started` and depends on the Research Agenda capability | Feature 019 is implemented and validated; dependency is capability-based, not status-only | Existing tool gains tested research-action routing and alerts without a new registry entry or execution authority | Do not start in parallel with Feature 019 or count it as tool 30 |
| A12 | **P4-low** | Future Feature 014 owner | Required P0-P4 work is incomplete; Feature 014 is `not_started` | A01-A11 clear and owner confirms the capability still passes the admission test | Shared cycle exchange passes its own specs without duplicating trend or regime math | Optional, not a phase exit criterion; no collision with Features 006/013 |
| A13 | **P4-low** | Future Feature 016 owner | Required P0-P4 work is incomplete; Feature 016 is planning-terminal only | A01-A11 clear and implementation ownership is assigned | Existing gamma tool gains the playbook extension with append-only, no-execution behavior | Optional, not a new registry entry; coordinate with gamma-owner changes |

## Accepted Evidence-Bound Dispositions

These are not implementation shortcuts:

- `bond-regime-lab` stays stale until independent credit-spread evidence exists. A price-ratio pulse cannot be
  promoted into a credit or duration conclusion.
- `smart-money-flow-lab` stays stale or not relevant when no fresh filings delta exists. Synthetic filings are
  forbidden.
- The rolling scorecard may remain above target while old events age through the append-only window. New-call
  authoring must stay machine-checkable throughout convergence.

## Closed Action

Improvement-Plan Step 9's BUG-001 paperwork binding is delivered because
`specs/_bugs/BUG-001-central-provider-credential-security` is `done` and validate-certified. D20 is a separate
record-integrity concern and is not evidence that BUG-001 remains open.

## Open Owner Decisions

1. ~~Assign A02's producer change~~ **DECIDED 2026-08-13: Feature 002 owns it, Feature 012 remains the consumer.**
   `OWNED_PATHS` is the publication transaction, so enrolling `market-brief.owner-reads.json` in it is a
   transaction change by definition, and a rollback must revert it with the payload it must agree with.
   Delivered in `554a07ae`.
2. Record the four Feature 015 routed decisions before implementation starts.
3. Decide whether bond and smart-money evidence sources warrant new source contracts. Until then, stale is the
   accepted honest output.
4. Confirm Feature 014 and Feature 016 still pass the admission test after required P0-P4 delivery. They are not
   phase exit criteria in this packet.
5. ~~Feature 006 human acceptance~~ **GRANTED 2026-08-13 by the operator for all 16 items**, recorded in
   `uservalidation.md` with provenance and a verification battery re-executed on the accepted revision
   (`bc261c4e`). Feature 006's remaining blocker is the unrun phase pipeline (RF-006-PIPELINE), not acceptance.

## Routed Findings

| Finding | Route | Reason |
|---|---|---|
| RF-ATOMICITY | `/bubbles.workflow` -> `/bubbles.implement` -> `/bubbles.validate` | Current focused atomicity suite is red |
| RF-OWNER-READ-PUBLICATION | `/bubbles.clarify`; then assigned Feature 002 or Feature 012 owner after Feature 002 consent | Producer capacity exists, but historical producer commits are outside a Bubbles spec and scheduled-publication ownership must be assigned before implementation |
| RF-FX-HEADLESS | `/bubbles.workflow` -> `/bubbles.implement` -> `/bubbles.validate` | Certified browser feature lacks its designed headless read |
| RF-015-DESIGN | `/bubbles.workflow` -> `/bubbles.design` | Four routed decisions gate append-only track-record implementation |
| RF-D20 | Owning spec workflows -> `/bubbles.validate` | Missing or excess phase records require evidence-bound reconciliation, never reconstructed history |
| RF-006-PIPELINE | `/bubbles.workflow` -> the 10 unrun specialist phases, then `/bubbles.validate` | **Raised 2026-08-13 by a `/bubbles.validate` certification review that REFUSED.** Feature 006 is implementation-complete but pipeline-incomplete: `full-delivery` requires 18 phases and `execution.completedPhaseClaims` holds only `implement` and `test`. Missing: `regression, simplify, gaps, harden, stabilize, security, validate, audit, chaos, docs`. `audit` is decisive because certification is gated behind it. Writing those claims by hand would fabricate runs that never happened, so certification stays refused. G084 and G040 were cleared separately (`e87f59e8`); `failedGateIds` is now `[G022,G027]` with `failureCount` 15. G027 clears in the same write as certification once G022 does |
