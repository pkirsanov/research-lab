# Actions - `improvement-plan` phase

**Execution rule:** run in priority order. Do not start a lower priority because a higher-priority item is
inconvenient. Active spec owners retain their scope locks.

## Ordered Action Ledger

| ID | Priority | Owner | Current blocker | Exact unblock condition | Acceptance metric | Collision note |
|---|---|---|---|---|---|---|
| A01 | **P0** | `/bubbles.workflow` routes `/bubbles.implement`, then `/bubbles.validate` | `tests/brief-refresh-atomicity.test.mjs` is red: repair candidates carry a `nextSession` mismatch and empty attention without exclusions; one explicit repair selects `raw-data-only` instead of a matching pair; rollback expectations also drift | Production scheduler, repair helper, and fixtures share one final-valid transaction contract; no assertion is weakened and no validator is relaxed | `timeout 240 node --test tests/brief-refresh-atomicity.test.mjs` exits 0 with zero failed subtests; byte-retention and invalid-baseline repair cases pass | Reserve shared publication files before editing. Do not touch active Feature 007/008 or portfolio files |
| A02 | **P1** | `/bubbles.clarify` first; then the assigned Feature 002 or Feature 012 owner routes `/bubbles.implement` | Scheduled publication does not invoke the 12-ticker owner-read producer. Historical producer commits `e6124e97` and `68fc6bc5` landed outside a Bubbles spec. Feature 002 owns the scheduled atomic publication transaction; Feature 012 owns the public matrix consumer and scheduled public-watchlist behavior | After A01, `/bubbles.clarify` records an owner-decision packet assigning the producer change between Feature 002 and Feature 012; Feature 002 explicitly consents before `/bubbles.implement`; the assigned owner then implements sequentially | Same-run output declares 12 tickers and the 62-applicable-cell denominator. The planning snapshot at local commit `eac966b78bacc5697458a7c8e54a684f6517c05b` reported 35 current and 13 gaps on identical inputs; execution and release remeasure the moving artifacts | Feature 008 is a regression consumer only: generic owner-read consumption and its privacy boundary must remain green. Do not edit Feature 008 scopes, state, portfolio source, or tests for A02 |
| A03 | **P1** | `/bubbles.workflow` routes `/bubbles.implement`, then `/bubbles.validate` for Feature 004 | Feature 004 is certified but `scripts/brief-refresh.mjs` lacks `buildFxToolRead`; the FX row is stale | Implement the design-owned headless FX read through RLFX, wire scheduled composition, then run recertification review | Scheduled payload has a deterministic, source-qualified FX owner read or explicit unavailable result; Feature 004 integration tests and validation pass | `scripts/brief-refresh.mjs` is shared with A01/A02. Reserve it once and land changes sequentially; do not touch Feature 007/008 active artifacts |
| A04 | **P2** | Current Feature 008 owner | Scope 5 is Done. `state.json` now names current Scope 6, `Explainable Research Action Lifecycle`; initial Scope 6 code landed in commit `4063170a`, but Scope 6 remains incomplete with unchecked DoD items | The current owner continues Scope 6 sequentially, completes its remaining implementation, test, and validation chain, then picks up only the next dependency-ready scope | Scope 6 reaches Done with per-item evidence; later scopes continue in order until terminal Feature 008 certification satisfies release and Feature 012 dependency gates | No release-agent edits to Feature 008 Scope 6 artifacts, state, portfolio source, or tests; no second owner starts another scope |
| A05 | **P2** | `/bubbles.workflow` routes decisions to `/bubbles.design`, then work to `/bubbles.implement` | Feature 015 is `specs_hardened`; routed decisions P-015-01, P-015-02, P-015-03, and P-015-07 remain unresolved; implementation has not started | Owning design decisions are recorded with Feature 002 co-consent where required; source-edit lockout is clear; implementation proceeds in scope order | Track-record tool and owner read ship from append-only history; corrections are new events; required tests and validate certification pass | Do not change Feature 002 contracts without its owner. Preserve active portfolio and release work; never backfill historical verdicts |
| A06 | **P3** | `/bubbles.validate` next; then the current Feature 007 owner | Scope 1 is Done and the prior blocker is resolved by commit `7972b308`. `state.json` names current Scope `02-technique-engine` and `nextRequiredOwner: bubbles.validate`; the later five-gate model, setup state, trigger, expectancy, and owner publication remain unbuilt | `/bubbles.validate` performs the validate-owned Scope 1 certification review; only after that review does the current owner begin Scope 2 and continue through dependency-ready scopes | Scope 1 certification is recorded without fabricated promotion; technical coverage changes from stale only when later scopes publish a deterministic owner read from the real five-gate model | No parallel Scope 2 pickup. Preserve the validate handoff and current `in_progress` lifecycle |
| A07 | **P3** | Current Feature 006 owner | Scope 5 remains In Progress. Commit `eac966b7` landed as-of replay, run lifecycle, and history implementation, but Scope 5 still has unchecked persistence/read-back, regression, test, and validation obligations. The registered browser owner read exists; scheduled/headless composition still does not consume it | Current owner completes remaining persistence/read-back behavior, regression closure, and the test/validate chain, then wires or hands off the scheduled/headless consumer without duplicating the owner model | Scope 5 reaches Done; scheduled coverage becomes analyzed or explicitly unavailable from the existing owner read, and browser cache is never treated as scheduled evidence | Respect the current owner and coordinate shared `brief-refresh.mjs` work after A01-A03 |
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

1. Assign A02's producer change to Feature 002 or Feature 012 in a `/bubbles.clarify` owner-decision packet and
  record Feature 002 consent before implementation.
2. Record the four Feature 015 routed decisions before implementation starts.
3. Decide whether bond and smart-money evidence sources warrant new source contracts. Until then, stale is the
   accepted honest output.
4. Confirm Feature 014 and Feature 016 still pass the admission test after required P0-P4 delivery. They are not
   phase exit criteria in this packet.

## Routed Findings

| Finding | Route | Reason |
|---|---|---|
| RF-ATOMICITY | `/bubbles.workflow` -> `/bubbles.implement` -> `/bubbles.validate` | Current focused atomicity suite is red |
| RF-OWNER-READ-PUBLICATION | `/bubbles.clarify`; then assigned Feature 002 or Feature 012 owner after Feature 002 consent | Producer capacity exists, but historical producer commits are outside a Bubbles spec and scheduled-publication ownership must be assigned before implementation |
| RF-FX-HEADLESS | `/bubbles.workflow` -> `/bubbles.implement` -> `/bubbles.validate` | Certified browser feature lacks its designed headless read |
| RF-015-DESIGN | `/bubbles.workflow` -> `/bubbles.design` | Four routed decisions gate append-only track-record implementation |
| RF-D20 | Owning spec workflows -> `/bubbles.validate` | Missing or excess phase records require evidence-bound reconciliation, never reconstructed history |
