<!-- bubbles:reconciled-packet schemaVersion=1 phase=improvement-plan -->

# Features — `improvement-plan` phase

**Measured at:** HEAD `4476cefd`, 2026-08-04 · **Gate:** G101 `release-delivery-reconciliation-guard.sh`

> **Anti-fabrication contract for this file.** A row is marked **Delivered** only when a command was actually
> run in this session and its output is quoted, or a committed file is cited by path. **A spec existing is not
> delivery.** Where code demonstrably shipped but the owning spec is non-terminal, the row says so — that
> divergence is the phase's own Step 9 and is exactly what the machine bindings below are wired to catch.

---

## Carried Forward From Prior Phases

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

<!-- bubbles:feature id=distributed-tool-briefs spec=specs/002-distributed-tool-briefs-and-history delivery=carried -->
<!-- bubbles:feature id=bond-regime-lab spec=specs/003-bond-regime-and-scenario-lab delivery=carried -->
<!-- bubbles:feature id=msft-july-refresh spec=specs/009-msft-july-market-refresh delivery=carried -->
<!-- bubbles:feature id=company-fundamentals-lab spec=specs/010-company-fundamentals-and-brief-lab delivery=carried -->
<!-- bubbles:feature id=volatility-sizing-lab spec=specs/011-volatility-regime-and-sizing-lab delivery=carried -->

**Deprecated from the prior phase:** none. **Step 8 of this phase is withdrawn** (see below) but that withdraws
a *planned* item, not a delivered one.

Non-spec capabilities carried forward and re-verified this session — CSP on every page, escaped sinks, bounded
first load, full-suite CI — are re-asserted by `node scripts/selftest.mjs` (**1216 passed, 0 failed, exit 0**),
which is the mechanism that keeps them from regressing.

---

## New In This Phase

Each row maps to a step in [`Improvement-Plan.md`](../../Improvement-Plan.md) §5 and to the owning spec named in
its §8 *Spec re-plan* table.

| # | Feature | Step | Owning spec | Spec status | Code shipped? | Phase status |
|---|---|---|---|---|---|---|
| 1 | Reader legibility — Simple speaks to a human, governance out of product copy | 1–3 | `012-market-action-center-and-guided-tools` | `blocked` | **yes, verified** | **Code delivered, spec not certified** |
| 2 | Watchlist routed into the tools (public matrix) | 4 | `008-portfolio-survival-and-brief-lab` | `in_progress` | **partial, verified** | In flight |
| 3 | Red Alert + Portfolio become data-derived | 5 | `012-market-action-center-and-guided-tools` | `blocked` | **yes, verified** | **Code delivered, spec not certified** |
| 4 | Recommendations born evaluable | 6 | `015-recommendation-outcome-ledger-and-track-record` | `blocked` | partial | In flight |
| 5 | Close the last stale tools | 7 | `007-technical-analysis-decision-lab` | `blocked` | not in published payload | In flight |
| 6 | Journey entry on every tool page | 8 | — | — | — | **VOID — withdrawn (D17)** |
| 7 | Paperwork reconciled to shipped code | 9 | `_bugs/BUG-001-central-provider-credential-security` | `in_progress` | no | Outstanding |

<!-- bubbles:feature id=reader-legibility spec=specs/012-market-action-center-and-guided-tools delivery=required -->
<!-- bubbles:feature id=watchlist-routing spec=specs/008-portfolio-survival-and-brief-lab delivery=required -->
<!-- bubbles:feature id=red-alert-portfolio-real spec=specs/012-market-action-center-and-guided-tools delivery=required -->
<!-- bubbles:feature id=born-evaluable-calls spec=specs/015-recommendation-outcome-ledger-and-track-record delivery=required -->
<!-- bubbles:feature id=stale-tool-coverage spec=specs/007-technical-analysis-decision-lab delivery=required -->
<!-- bubbles:feature id=paperwork-reconciliation spec=specs/_bugs/BUG-001-central-provider-credential-security delivery=required -->
<!-- bubbles:feature id=journey-entry-every-page spec=none delivery=optional -->

### Why the required set is expected to refuse G101

Six features are bound `delivery=required` and **not one** of their specs is terminal-and-validate-certified.
That is not a mis-binding — it is the finding. `Improvement-Plan.md` Step 9 states the acceptance metric as
*"zero specs whose shipped code contradicts their recorded status"*, and the sweep below shows that metric is
unmet. Binding these `optional` to obtain a green gate would make G101 decorative and would be precisely the
"claimed delivered / actually skipped" hole the gate exists to close. The refusal text is reproduced verbatim in
[`actions.md`](actions.md) → *Guard results*.

---

## Evidence Trace — every "verified" claim above

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

**7 · Paperwork (Step 9) — outstanding.** `BUG-001-central-provider-credential-security` is still
`in_progress` at High severity although `BUG-002-two-tier-provider-access` is `done` and explicitly reverses its
Tier-2 clause — a live **D8** violation.

---

## Measured spec-status sweep — the Step 9 worklist

```
$ for f in specs/*/state.json specs/_bugs/*/state.json; do printf '%-70s %s\n' "$f" "$(jq -r '.status' "$f")"; done
```

| Spec | Status | Not-Started scopes |
|---|---|---|
| `001-causal-rotation-intelligence` | `blocked` | 5 of 6 |
| `004-fx-regime-relative-value-lab` | `in_progress` | 4 of 5 |
| `005-palm-springs-rental-market-lab` | `in_progress` | 8 of 10 |
| `006-trend-dynamics-cycle-lab` | `in_progress` | 2 of 5 |
| `007-technical-analysis-decision-lab` | `blocked` | 8 of 9 |
| `008-portfolio-survival-and-brief-lab` | `in_progress` | 15 of 16 |
| `012-market-action-center-and-guided-tools` | `blocked` | 1 of 18 |
| `013-market-regime-stack-and-strategy-playbook` | `in_progress` | 14 of 14 |
| `014-shared-cycle-and-seasonality-exchange` | `not_started` | 11 of 11 |
| `015-recommendation-outcome-ledger-and-track-record` | `blocked` | 10 of 10 |
| `016-auction-gamma-playbook` | `not_started` | 9 of 9 |
| `_bugs/BUG-001-central-provider-credential-security` | `in_progress` | 0 of 1 |
| `_bugs/BUG-005-g087-planning-packet-linkage…` | `blocked` | 0 of 0 |

**11 non-terminal specs. 87 Not Started scopes** across all specs; **74** of those fall in the nine specs
`001, 005, 006, 007, 008, 012, 013, 014, 015` (5+8+2+8+15+1+14+11+10 = 74). Terminal: `002`, `003`, `009`,
`010`, `011` and four bugs.

> **Not claimed as delivered.** No row in this packet marks any of these 11 specs delivered. Where their code
> demonstrably shipped, this file says *"code delivered, spec not certified"* — a different statement.

---

## Withheld From This Phase

Not deferred to a named successor — **this repo declares no phase model**, so `unscheduled` below is a
disposition, not a release identity.

| Capability | Spec | Why withheld |
|---|---|---|
| Private portfolio overlay (sizes, cost basis, P&L) | `008` | Step 4 narrows `008` to the **public** watchlist axis only. Private overlay stays behind its own gate — **BI-4**: committed artifacts are tickers-only, forever. |
| Market regime stack + strategy playbook | `013` | §13: *must not be finished as written*; re-scope under **D9** against the admission test. |
| Shared cycle + seasonality exchange | `014` | Same — 11 of 11 scopes Not Started, zero code. |
| Auction + gamma playbook | `016` | Same — 9 of 9 scopes Not Started. |
| Causal rotation intelligence | `001` | `blocked`; must name a real missing capability, not a status, per **D10**. |

<!-- bubbles:feature id=private-portfolio-overlay spec=specs/008-portfolio-survival-and-brief-lab delivery=deferred-to:unscheduled -->
<!-- bubbles:feature id=regime-stack-playbook spec=specs/013-market-regime-stack-and-strategy-playbook delivery=deferred-to:unscheduled -->
<!-- bubbles:feature id=cycle-seasonality-exchange spec=specs/014-shared-cycle-and-seasonality-exchange delivery=deferred-to:unscheduled -->
<!-- bubbles:feature id=auction-gamma-playbook spec=specs/016-auction-gamma-playbook delivery=deferred-to:unscheduled -->
<!-- bubbles:feature id=causal-rotation spec=specs/001-causal-rotation-intelligence delivery=deferred-to:unscheduled -->

`004-fx-regime-relative-value-lab`, `005-palm-springs-rental-market-lab` and `006-trend-dynamics-cycle-lab` are
non-terminal but carry **no** binding in this packet: this phase makes no promise about them, and inventing one
would be the fabrication this file exists to prevent. `004` is additionally under active concurrent edit and was
not read, measured, or bound.

---

## Plan-to-Release Traceability

There is no `docs/plans/improvement-plan/` directory. This repo keeps its delivery plan as a single authoritative
document rather than the plans-and-features split, so traceability runs directly to
[`Improvement-Plan.md`](../../Improvement-Plan.md) §5 step numbers.

> ⚠ **"Step *N*" is ambiguous in this repository — always name the document.** `Product-Review-and-Roadmap.md`
> §11 and `Improvement-Plan.md` §5 both number their steps 1–9 and mean entirely different things. Every step
> reference in this packet means **Improvement-Plan** unless it says §11.
