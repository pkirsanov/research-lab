<!-- bubbles:reconciled-packet schemaVersion=1 phase=improvement-plan -->

# Features - `improvement-plan` phase

**Release status:** in progress
**Planning snapshot:** local repository commit `eac966b78bacc5697458a7c8e54a684f6517c05b` (2026-08-12)
**Planning snapshot inventory:** 25 live tool entries, 52 journey definitions, 67 journey steps
**Gate:** G101 `release-delivery-reconciliation-guard.sh`

This ledger keeps delivered-and-certified, implemented-but-release-incomplete, planning-terminal, in-progress,
and not-started states distinct. Registry presence is not certification. A terminal spec is not proof that a
later integration still works.

Numeric planning baselines in this packet are fixed to the local snapshot above. Scheduled origin artifacts
advance independently, and the latest origin scorecard has already advanced beyond that snapshot. Execution and
release checks must remeasure the artifacts at their own date and repository revision instead of chasing moving
origin values in this prose.

## Historical Snapshot - Superseded

Everything below this heading through the historical traceability note was measured on 2026-08-04 at HEAD
`4476cefd`. It is retained as a baseline only. Its status labels, counts, acceptance denominator, and delivery
dispositions are not current release truth. The active ledger follows in **Current Release Ledger** below.

### Historical Carried-Forward Table

The prior arc is `Product-Review-and-Roadmap.md` §11 (Steps 1–9, shipped). Nothing from it is dropped. These
five specs are the ones that are **both** terminal **and** validate-certified — verified by reading
`.certification.certifiedCompletedPhases` / `.completedPhases` out of each `state.json`:

| Capability | Spec | Status | `validate` certified | Disposition |
|---|---|---|---|---|
| Distributed tool briefs + bounded history | `002-distributed-tool-briefs-and-history` | `done` | yes | Carried, intact |
| Bond regime + scenario lab | `003-bond-regime-and-scenario-lab` | `done` | yes | Carried, intact |
| MSFT July market refresh | `009-msft-july-market-refresh` | `done` | yes | Carried, intact |
| Company fundamentals + brief lab | `010-company-fundamentals-and-brief-lab` | `done` | yes | Carried, intact |
| Volatility regime + sizing lab | `011-volatility-regime-and-sizing-lab` | `done` | yes | Carried, intact |

<!-- historical-feature-binding id=distributed-tool-briefs spec=specs/002-distributed-tool-briefs-and-history delivery=carried -->
<!-- historical-feature-binding id=bond-regime-lab spec=specs/003-bond-regime-and-scenario-lab delivery=carried -->
<!-- historical-feature-binding id=msft-july-refresh spec=specs/009-msft-july-market-refresh delivery=carried -->
<!-- historical-feature-binding id=company-fundamentals-lab spec=specs/010-company-fundamentals-and-brief-lab delivery=carried -->
<!-- historical-feature-binding id=volatility-sizing-lab spec=specs/011-volatility-regime-and-sizing-lab delivery=carried -->

**Deprecated from the prior phase:** none. **Step 8 of this phase is withdrawn** (see below) but that withdraws
a *planned* item, not a delivered one.

Non-spec capabilities carried forward and re-verified this session — CSP on every page, escaped sinks, bounded
first load, full-suite CI — are re-asserted by `node scripts/selftest.mjs` (**1216 passed, 0 failed, exit 0**),
which is the mechanism that keeps them from regressing.

---

### Historical New-In-Phase Table

Each row maps to a step in [`Improvement-Plan.md`](../../Improvement-Plan.md) §5 and to the owning spec named in
its §8 *Spec re-plan* table.

| # | Feature | Step | Owning spec | Spec status | Code shipped? | Phase status |
|---|---|---|---|---|---|---|
| 1 | Reader legibility — Simple speaks to a human, governance out of product copy | 1–3 | `012-market-action-center-and-guided-tools` | `blocked` | **yes, verified** | **Code delivered, spec not certified** |
| 2 | Watchlist routed into the tools (public matrix) | 4 | `008-portfolio-survival-and-brief-lab` | `in_progress` | **partial, verified** | In flight |
| 3 | Red Alert + Portfolio become data-derived | 5 | `012-market-action-center-and-guided-tools` | `blocked` | **yes, verified** | **Code delivered, spec not certified** |
| 4 | Recommendations born evaluable | 6 | `015-recommendation-outcome-ledger-and-track-record` | `blocked` | partial | In flight |
| 5 | Close the last stale tools | 7 | `007-technical-analysis-decision-lab` | Superseded lifecycle snapshot; current: `in_progress` | not in published payload | In flight |
| 6 | Journey entry on every tool page | 8 | — | — | — | **VOID — withdrawn (D17)** |
| 7 | Paperwork reconciled to shipped code | 9 | `_bugs/BUG-001-central-provider-credential-security` | Historical: `in_progress`; current: `done` | Historical row superseded | Delivered now |

<!-- historical-feature-binding id=reader-legibility spec=specs/012-market-action-center-and-guided-tools delivery=required -->
<!-- historical-feature-binding id=watchlist-routing spec=specs/008-portfolio-survival-and-brief-lab delivery=required -->
<!-- historical-feature-binding id=red-alert-portfolio-real spec=specs/012-market-action-center-and-guided-tools delivery=required -->
<!-- historical-feature-binding id=born-evaluable-calls spec=specs/015-recommendation-outcome-ledger-and-track-record delivery=required -->
<!-- historical-feature-binding id=stale-tool-coverage spec=specs/007-technical-analysis-decision-lab delivery=required -->
<!-- historical-feature-binding id=paperwork-reconciliation spec=specs/_bugs/BUG-001-central-provider-credential-security delivery=required -->
<!-- historical-feature-binding id=journey-entry-every-page spec=none delivery=optional -->

### Why the required set is expected to refuse G101

Six features are bound `delivery=required` and **not one** of their specs is terminal-and-validate-certified.
That is not a mis-binding — it is the finding. `Improvement-Plan.md` Step 9 states the acceptance metric as
*"zero specs whose shipped code contradicts their recorded status"*, and the sweep below shows that metric is
unmet. Binding these `optional` to obtain a green gate would make G101 decorative and would be precisely the
"claimed delivered / actually skipped" hole the gate exists to close. The refusal text is reproduced verbatim in
[`actions.md`](actions.md) → *Guard results*.

---

### Historical Evidence Trace

**1 · Reader legibility (Steps 1–3) — code delivered.**

```
$ node scripts/audit-reader-legibility.mjs
pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
AUDIT_EXIT=0
```

Every one of the 23 registered tools renders `Simple · Power · Brief · Journey` with **zero** framework
vocabulary in reader-visible copy — down from the 157 leaks across 23 of 23 tools recorded in
`Improvement-Plan.md` §2 N1. This is the D13 gate, measured in a real browser per **D17**.

**2 · Watchlist routing (Step 4) — partial.** From the same audit run, the `market-brief` page reports:

```
scope: journeyToolRows=23 journeyGoals=48 briefMounts=1 briefTools=market-brief matrixCells=28 owned=28 covered=14
```

Cross-checked against the committed artifact:

```
$ jq -r '[.ownerReads | to_entries[] as $t | $t.value | to_entries[] | .value] | group_by(.state) | ...' market-brief.owner-reads.json
current 14
unavailable     2
$ jq -c '{tickers, domainsProduced, contractVersion, asOf}' market-brief.owner-reads.json
{"tickers":["QQQ","SPMO","VGT","MSFT"],"domainsProduced":["volatility","technical","macro-rotation","options"],
 "contractVersion":"public-owner-reads/v1","asOf":"2026-08-03"}
```

**14 of 28 cells covered**, against an original target of ≥ 15 that the plan itself lowered to the honest
evidence ceiling. The 2 explicit `unavailable` reads carry real reasons (`"no committed option chain for SPMO"`,
`"no committed option chain for VGT"`) — a reasoned gap, per **BI-2**, not a blank.

> **Discrepancy found this session, not previously recorded.** `Improvement-Plan.md` Step 4's acceptance command
> is `jq -r '.scopeSummary.coveredCellCount, .scopeSummary.gapCount' market-brief.owner-reads.json`. Run against
> the committed artifact it returns **`null`** — the artifact's top-level keys are `asOf`, `contractVersion`,
> `domainsProduced`, `generatedAt`, `ownerReads`, `source`, `tickers`. There is no `scopeSummary` object. The
> acceptance command as written does not resolve. Routed as action **A5**.

**3 · Red Alert + Portfolio (Step 5) — code delivered.** The audit activates `Portfolio` and `Red Alert` on
`market-brief` and reports it **clean** with `matrixCells=28 owned=28 covered=14`; a hardcoded constant panel
cannot produce per-cell coverage counts. The N6 constants are gone.

**4 · Born-evaluable calls (Step 6) — partial, and the headline is unchanged.**

```
$ jq -c '.windows["30d"] | {closed, resolved, notEvaluableShare, hitRate}' market-brief.scorecard.json
{"closed":180,"resolved":30,"notEvaluableShare":0.8333,"hitRate":0.5333}
```

`notEvaluableShare` is **0.8333** against a target of **≤ 0.25**. This is expected and honest: the ledger is
append-only, so historical verdicts are never rewritten and the fix lands only on *new* calls. It does mean the
published hit rate still rests on **30 resolved of 180 closed**.

**5 · Stale tools (Step 7) — not reflected in the published payload.**

```
$ jq -r '.toolCoverage | group_by(.status) | ...' market-brief.payload.json
analyzed        11
not-relevant    7
stale   5
```

Still `analyzed 11 · stale 5`, against the plan's honest ceiling of `11 → 14`. HEAD's commit subject is *"feat(brief):
close Step 7 tool coverage…"*, but the **committed payload has not moved**. The step is not delivered in the
artifact a reader is served. `smart-money-flow-lab` remains a named blocker, not an effort gap — its
filings input is not committed and an adapter would have to invent it.

**6 · Journey entry on every page (Step 8) — VOID, withdrawn.** Bound `spec=none delivery=optional` because
there is nothing to deliver. The original premise was a measurement error: reach was asserted from a static grep
for `<script src="rlviews.js">` and found 2 of 25, but `rlapp.js` loads the shell dynamically. Browser-measured
reach was always 23 of 23 — re-confirmed this session, every tool page reporting `journeyToolRows=1
journeyGoals=2` and the Action Center `journeyToolRows=23 journeyGoals=48`. That scoping (a tool page shows its
*own* journeys) was the real defect, N10, and it is fixed. Recorded as anti-drift **D17**.

**7 · Paperwork (Step 9) - historical claim, now superseded.** On 2026-08-04 BUG-001 was `in_progress`.
It is now `done` and validate-certified, so this binding is delivered. D20 is a separate record concern.

---

### Historical Spec-Status Sweep

```
$ for f in specs/*/state.json specs/_bugs/*/state.json; do printf '%-70s %s\n' "$f" "$(jq -r '.status' "$f")"; done
```

| Spec | Status | Not-Started scopes |
|---|---|---|
| `001-causal-rotation-intelligence` | `blocked` | 5 of 6 |
| `004-fx-regime-relative-value-lab` | `in_progress` | 4 of 5 |
| `005-palm-springs-rental-market-lab` | `in_progress` | 8 of 10 |
| `006-trend-dynamics-cycle-lab` | `in_progress` | 2 of 5 |
| `007-technical-analysis-decision-lab` | Superseded lifecycle snapshot; current: `in_progress` | Historical 8 of 9 |
| `008-portfolio-survival-and-brief-lab` | `in_progress` | 15 of 16 |
| `012-market-action-center-and-guided-tools` | `blocked` | 1 of 18 |
| `013-market-regime-stack-and-strategy-playbook` | `in_progress` | 14 of 14 |
| `014-shared-cycle-and-seasonality-exchange` | `not_started` | 11 of 11 |
| `015-recommendation-outcome-ledger-and-track-record` | `blocked` | 10 of 10 |
| `016-auction-gamma-playbook` | `not_started` | 9 of 9 |
| `_bugs/BUG-001-central-provider-credential-security` | Historical: `in_progress`; current: `done` | Historical 0 of 1 |
| `_bugs/BUG-005-g087-planning-packet-linkage…` | `blocked` | 0 of 0 |

**11 non-terminal specs. 87 Not Started scopes** across all specs; **74** of those fall in the nine specs
`001, 005, 006, 007, 008, 012, 013, 014, 015` (5+8+2+8+15+1+14+11+10 = 74). Terminal: `002`, `003`, `009`,
`010`, `011` and four bugs.

> **Not claimed as delivered.** No row in this packet marks any of these 11 specs delivered. Where their code
> demonstrably shipped, this file says *"code delivered, spec not certified"* — a different statement.

---

### Historical Withheld Dispositions - Superseded

Not deferred to a named successor — **this repo declares no phase model**, so `unscheduled` below is a
disposition, not a release identity.

| Capability | Spec | Why withheld |
|---|---|---|
| Private portfolio overlay (sizes, cost basis, P&L) | `008` | Step 4 narrows `008` to the **public** watchlist axis only. Private overlay stays behind its own gate — **BI-4**: committed artifacts are tickers-only, forever. |
| Market regime stack + strategy playbook | `013` | §13: *must not be finished as written*; re-scope under **D9** against the admission test. |
| Shared cycle + seasonality exchange | `014` | Same — 11 of 11 scopes Not Started, zero code. |
| Auction + gamma playbook | `016` | Same — 9 of 9 scopes Not Started. |
| Causal rotation intelligence | `001` | `blocked`; must name a real missing capability, not a status, per **D10**. |

<!-- historical-feature-binding id=private-portfolio-overlay spec=specs/008-portfolio-survival-and-brief-lab delivery=deferred-to:unscheduled -->
<!-- historical-feature-binding id=regime-stack-playbook spec=specs/013-market-regime-stack-and-strategy-playbook delivery=deferred-to:unscheduled -->
<!-- historical-feature-binding id=cycle-seasonality-exchange spec=specs/014-shared-cycle-and-seasonality-exchange delivery=deferred-to:unscheduled -->
<!-- historical-feature-binding id=auction-gamma-playbook spec=specs/016-auction-gamma-playbook delivery=deferred-to:unscheduled -->
<!-- historical-feature-binding id=causal-rotation spec=specs/001-causal-rotation-intelligence delivery=deferred-to:unscheduled -->

`004-fx-regime-relative-value-lab`, `005-palm-springs-rental-market-lab` and `006-trend-dynamics-cycle-lab` are
non-terminal but carry **no** binding in this packet: this phase makes no promise about them, and inventing one
would be the fabrication this file exists to prevent. `004` is additionally under active concurrent edit and was
not read, measured, or bound.

---

### Historical Plan-to-Release Traceability

There is no `docs/plans/improvement-plan/` directory. This repo keeps its delivery plan as a single authoritative
document rather than the plans-and-features split, so traceability runs directly to
[`Improvement-Plan.md`](../../Improvement-Plan.md) §5 step numbers.

> ⚠ **"Step *N*" is ambiguous in this repository — always name the document.** `Product-Review-and-Roadmap.md`
> §11 and `Improvement-Plan.md` §5 both number their steps 1–9 and mean entirely different things. Every step
> reference in this packet means **Improvement-Plan** unless it says §11.

---

## Current Release Ledger

### Carried Forward From Shipped History

Research Lab has one named release phase. These capabilities come from the shipped pre-phase roadmap rather
than from an earlier release packet.

| Capability | Binding | Recorded state | Current release qualification |
|---|---|---|---|
| Distributed tool briefs and bounded history | `specs/002-distributed-tool-briefs-and-history` | `done`, certified | Carried; D20 warning-class phase-record excess remains open |
| Bond regime and scenario lab | `specs/003-bond-regime-and-scenario-lab` | `done`, certified | Carried; current brief row is stale because independent credit-spread evidence is absent |
| MSFT July market refresh | `specs/009-msft-july-market-refresh` | `done`, certified | Carried; D20 records phase claims with zero execution history |
| Company fundamentals and brief lab | `specs/010-company-fundamentals-and-brief-lab` | `done`, certified | Carried |
| Volatility regime and sizing lab | `specs/011-volatility-regime-and-sizing-lab` | `done`, certified | Carried |

<!-- bubbles:feature id=current-distributed-tool-briefs spec=specs/002-distributed-tool-briefs-and-history delivery=carried -->
<!-- bubbles:feature id=current-bond-regime-lab spec=specs/003-bond-regime-and-scenario-lab delivery=carried -->
<!-- bubbles:feature id=current-msft-july-refresh spec=specs/009-msft-july-market-refresh delivery=carried -->
<!-- bubbles:feature id=current-company-fundamentals-lab spec=specs/010-company-fundamentals-and-brief-lab delivery=carried -->
<!-- bubbles:feature id=current-volatility-sizing-lab spec=specs/011-volatility-regime-and-sizing-lab delivery=carried -->

### Required In This Phase

| ID | Capability | Binding | Current release truth | Delivery state |
|---|---|---|---|---|
| F01 | Scheduled-publication atomicity | `specs/_bugs/BUG-002-market-brief-session-date-drift` | Bug packet is `done` and certified, but the focused suite is red on scheduler and repair fixture contract drift | Release regression open |
| F02 | Reader-legible tools and Market Action Center | `specs/012-market-action-center-and-guided-tools` | Shared surfaces exist; feature remains `blocked` and uncertified | Partial |
| F03 | Twelve-ticker scheduled owner-read regeneration | `specs/008-portfolio-survival-and-brief-lab` | Feature 008 consumes generic owner reads but does not own scheduled public publication. Scope 5 is Done; `state.json` names current Scope 6, `Explainable Research Action Lifecycle`; commit `4063170a` landed initial Scope 6 code, but its DoD remains unchecked. A02 assigns the producer change between Feature 002 and Feature 012 | Publisher ownership pending; Feature 008 separately in progress under its current owner |
| F04 | Headless FX owner read | `specs/004-fx-regime-relative-value-lab` | Feature 004 is `done` and certified, but `scripts/brief-refresh.mjs` has no `buildFxToolRead`; current brief row remains stale | Certified-delivery gap |
| F05 | New-call evaluability and public track record | `specs/015-recommendation-outcome-ledger-and-track-record` | Recent authoring is corrected; historical KPI has not converged; planning is terminal at `specs_hardened`, with no implementation scope delivered | Implementation pending |
| F06 | Technical five-gate owner model | `specs/007-technical-analysis-decision-lab` | Scope 1 is Done and its blocker is resolved by commit `7972b308`; current Scope is `02-technique-engine`, with `nextRequiredOwner: bubbles.validate`. Later scopes still owe setup state, trigger, expectancy, five-gate synthesis, and owner publication | Validate-owned Scope 1 certification review next; only then may the current owner begin Scope 2 |
| F07 | Headless trend and cycle read | `specs/006-trend-dynamics-cycle-lab` | Scope 4 delivered the registered browser owner read. Scope 5 remains In Progress; commit `eac966b7` landed as-of replay, run lifecycle, and history implementation, but persistence/read-back, regression closure, and test/validate obligations remain unchecked. Scheduled composition still lacks deterministic consumption | Partial Scope 5 delivery under current owner; no parallel pickup |
| F08 | Step 9 BUG-001 paperwork binding | `specs/_bugs/BUG-001-central-provider-credential-security` | BUG-001 is `done` and validate-certified | Delivered |
| F09 | D20 MSFT evidence-record reconciliation | `specs/009-msft-july-market-refresh` | `done` state carries phase claims and zero execution-history entries | Open record-integrity review |
| F10 | D20 Action Center implement-record reconciliation | `specs/012-market-action-center-and-guided-tools` | Implement claims have no implement execution-history backing | Open record-integrity review |
| F11 | D20 distributed-briefs warning review | `specs/002-distributed-tool-briefs-and-history` | Excess implement claims versus one run are warning-class, not proof of fabricated execution | Open bounded review |
| F12 | Market Regime registered tool | `specs/013-market-regime-stack-and-strategy-playbook` | Lifecycle state is `in_progress`; registered tool implementation is absent | Not delivered |
| F13 | Research Agenda registered tool | `specs/019-custom-recurring-research-agenda` | `not_started` | Not delivered |
| F14 | Research action-routing extension | `specs/020-research-action-routing-and-alerts` | `not_started`; follows Feature 019 and extends an existing tool | Not delivered |

<!-- bubbles:feature id=scheduled-publication-atomicity spec=specs/_bugs/BUG-002-market-brief-session-date-drift delivery=required -->
<!-- bubbles:feature id=reader-legible-action-center spec=specs/012-market-action-center-and-guided-tools delivery=required -->
<!-- bubbles:feature id=twelve-ticker-owner-reads spec=specs/008-portfolio-survival-and-brief-lab delivery=required -->
<!-- bubbles:feature id=headless-fx-owner-read spec=specs/004-fx-regime-relative-value-lab delivery=required -->
<!-- bubbles:feature id=recommendation-track-record spec=specs/015-recommendation-outcome-ledger-and-track-record delivery=required -->
<!-- bubbles:feature id=technical-five-gate spec=specs/007-technical-analysis-decision-lab delivery=required -->
<!-- bubbles:feature id=headless-trend-read spec=specs/006-trend-dynamics-cycle-lab delivery=required -->
<!-- bubbles:feature id=bug001-paperwork-binding spec=specs/_bugs/BUG-001-central-provider-credential-security delivery=required -->
<!-- bubbles:feature id=d20-msft-record spec=specs/009-msft-july-market-refresh delivery=required -->
<!-- bubbles:feature id=d20-action-center-record spec=specs/012-market-action-center-and-guided-tools delivery=required -->
<!-- bubbles:feature id=d20-distributed-briefs-warning spec=specs/002-distributed-tool-briefs-and-history delivery=required -->
<!-- bubbles:feature id=market-regime-tool spec=specs/013-market-regime-stack-and-strategy-playbook delivery=required -->
<!-- bubbles:feature id=research-agenda-tool spec=specs/019-custom-recurring-research-agenda delivery=required -->
<!-- bubbles:feature id=research-action-routing spec=specs/020-research-action-routing-and-alerts delivery=required -->

F03's required G101 binding remains intact because Feature 008 is a release dependency and regression consumer.
That binding does not assign scheduled-publication ownership. A02 requires `/bubbles.clarify` to assign the
producer change between Feature 002 and Feature 012, with Feature 002 consent before implementation. Feature
008 stays out of that change except for regression proof that generic owner-read consumption and the privacy
boundary remain green.

### Current Coverage Truth

At the fixed planning snapshot, the published split is **13 analyzed, 7 not relevant, and 5 stale**. The stale
rows have different causes.

| Tool | Cause class | Current truth | Required disposition |
|---|---|---|---|
| `bond-regime-lab` | Evidence blocker | Independent credit-spread evidence is absent; partial price-ratio evidence is not a credit or duration conclusion | Keep stale until accepted evidence exists |
| `smart-money-flow-lab` | Evidence blocker | No fresh filings delta or deterministic owner read exists | Keep stale or not relevant; never synthesize filings |
| `technical-analysis-decision-lab` | Capability implementation | Scope 1 is Done; validate review is next, while technique, setup, five-gate, expectancy, and owner-publication scopes remain unbuilt | Validate Scope 1, then deliver Feature 007 sequentially from Scope 2 |
| `fx-regime-relative-value-lab` | Certified-delivery gap | Browser feature is certified; scheduled headless read is absent | Add the design-required read and recertify |
| `trend-dynamics-cycle-lab` | Partial Scope 5 delivery | The browser owner read exists and is registered. Scope 5 implementation has landed in part, but persistence/read-back, regression, test, and validation closure remain; scheduled composition has no deterministic consumer | Complete Scope 5 under its owner, then add scheduled/headless consumption without duplicating the owner model |

### Watchlist Denominator And Producer Truth

At the fixed planning snapshot, the release denominator is **12 watchlist tickers and 62 applicable cells**.
The published artifact had four tickers and 14 current cells, while the existing producer dry run reported
**35 current reads and 13 explicit gaps across 12 tickers**. The release obligation is to invoke that producer
from scheduled publication and preserve the same evidence-qualified output, not to hand-copy the dry-run file.
Execution and release checks remeasure these moving artifacts.

### Evaluability Truth

At local repository commit `eac966b78bacc5697458a7c8e54a684f6517c05b` on 2026-08-12, the owner measurement
was **45 of 45 proposals since 2026-08-10 machine-checkable**. The append-only 30-day scorecard reported
**246 closed, 96 resolved, 143 not evaluable, `notEvaluableShare` 0.5813, and hit rate 0.5729**. These are
planning-snapshot values, not a claim about the latest origin artifact. No historical outcome may be rewritten
to accelerate convergence, and execution/release must record a new date and repository revision when remeasured.

### Planned Registry Growth

The registry becomes 29 only if Portfolio Survival (008), Market Regime (013), Recommendation Track Record
(015), and Research Agenda (019) all land and pass their release gates. Features 016, 020, and 028 extend
existing tools and do not increase that count.

### Optional, Non-Exit Work

| Capability | Binding | Current truth | Disposition |
|---|---|---|---|
| Shared cycle and seasonality exchange | `specs/014-shared-cycle-and-seasonality-exchange` | `not_started` | Optional after required P0-P4 work |
| Auction gamma playbook extension | `specs/016-auction-gamma-playbook` | `specs_hardened`; implementation not started | Optional after required P0-P4 work |
| Volatility roughness and model-assumption diagnostic | `specs/031-volatility-roughness-and-model-assumption-diagnostic` | `not_started`, planning-only, uncertified, and not delivered. Requirements, the UI/UX scenario contract, design, four ordered scopes, scenario manifest, persistent test plan, report template, user-validation planning baseline, and state record exist. No Feature 028 implementation, Feature 028 test execution, product validation, human acceptance, or certification exists. Feature 011 is the sole technical dependency and is `done` and certified. | **Operator-prioritized ASAP ahead of unresolved A04, A06, A09, and A11, which are release-order constraints only and remain undelivered where so recorded.** Feature 028 remains optional, non-gating, and outside the phase exit criteria. It extends the existing Feature 011 volatility-sizing tool in Power mode through an additive immutable diagnostic with its own `diagnosticId` and unchanged base `decisionId`. A09 supplies no roughness, structure-function, zeta, or Hurst capability. A11 supplies no additive `RLVOL` decision schema. Shared `RLVOL` and volatility-workspace changes receive ordinary compatibility review against current consumers; A09 or A11 delivery does not invalidate this plan. Uses the existing non-blocking conflict vocabulary, fixed $q$ and lag grids, a planned Node 20 `ubuntu-latest` 750 ms reference, and separate planned `system-chrome` smoke coverage. Promises no additional file-origin regression and does not claim to restore Feature 011's existing `file://` configuration limitation. Adds no root page, tool-registry row, provider, backend, or catalogue-count increment. |

<!-- bubbles:feature id=cycle-seasonality-exchange spec=specs/014-shared-cycle-and-seasonality-exchange delivery=optional -->
<!-- bubbles:feature id=auction-gamma-extension spec=specs/016-auction-gamma-playbook delivery=optional -->
<!-- bubbles:feature id=volatility-roughness-diagnostic spec=specs/031-volatility-roughness-and-model-assumption-diagnostic delivery=optional -->

### G101 Interpretation

G101 is expected to refuse while required bindings remain incomplete. That is release truth, not a reason to
mark them optional. G101 is also not sufficient alone: F01, F04, F09, and F11 bind terminal specs while current
executable or record-integrity findings remain open. Exit requires both machine reconciliation and the named
acceptance checks in [actions.md](actions.md).

### Current Plan Traceability

This repository uses the release packet plus `docs/Improvement-Plan.md`; it has no
`docs/plans/improvement-plan/`. Historical step numbers remain provenance. The current priority and ownership
order is [actions.md](actions.md).
