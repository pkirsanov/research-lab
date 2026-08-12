# Research Lab - Investor Overview

**Status:** Current product-direction summary for release planning  
**Measured:** 2026-08-12 from the checked-out repository  
**Audience:** Owner, operator, investor, release planner, and new contributor

> Research Lab provides educational market-research models. It does not provide investment advice,
> brokerage, order execution, or personalised financial recommendations.

## Reading Order

1. Read this overview for the product thesis, current evidence, phase model, and priorities.
2. Read [`Product-Principles.md`](Product-Principles.md) for the binding product rules.
3. Read the [`improvement-plan` vision](releases/improvement-plan/vision.md) for the active phase intent.
4. Read the [`improvement-plan` feature ledger](releases/improvement-plan/features.md) for evidence-backed
   capability status.
5. Read the [`improvement-plan` action ledger](releases/improvement-plan/actions.md) for current priority,
   ownership, unblock conditions, and collision rules.
6. Read [`Product-Review-and-Roadmap.md`](Product-Review-and-Roadmap.md) and
   [`Improvement-Plan.md`](Improvement-Plan.md) for the measured product review and delivery plan.

## Executive Summary

Research Lab is a static, build-free, single-operator educational market-research suite. Its product thesis
is a closed-loop decision journal: state what changed, show why, record what it claimed, and publish how the
claim resolved, including misses.

The current registry contains **25 live entries**, including the Market Action Center. The count comes from
`tools.json`, not from historical prose. A `live` registry status means the entry is published in the product
inventory. It does not, by itself, certify every workflow or every data source.

The strategic edge is calibrated honesty rather than tool count. Provenance, explicit missing data,
scoreable claims, equal treatment of misses, and append-only history make the product's analysis auditable.

## Product Thesis

The tools provide depth. The Market Action Center directs attention across those tools. The recommendation
history and scorecard close the loop by recording what the product claimed and how those claims resolved.
The public scorecard and its error rate are accountability evidence, not an investment-performance promise.

Every proposed capability must pass the binding admission test in
[`Product-Principles.md`](Product-Principles.md):

> **Does this improve decision quality, or the measurement of decision quality?**

Work that does neither is outside the product direction.

## Phase Overview

| Phase | Status | Goal | Canonical Planning Evidence |
|---|---|---|---|
| `improvement-plan` | 🔜 in progress | Make every surfaced read legible, relevant, scoreable, and honestly measured. | [Vision](releases/improvement-plan/vision.md) · [Features](releases/improvement-plan/features.md) · [Delivery plan](Improvement-Plan.md) |

Status vocabulary: ✅ delivered · 🔜 in progress · ⏳ planned.

Research Lab currently declares one named release phase. The earlier nine-step roadmap is shipped history,
but the repository did not assign it a release-phase slug. This overview does not invent one.

## Phase: `improvement-plan`

### Goal

Make every tool, brief, and journey produce a legible, evidence-qualified claim that the scorecard can later
evaluate. Preserve explicit unavailable states when the evidence cannot support a claim.

### Key Capabilities In Scope

- Reader-legible Simple views with Power drill-down for supporting detail.
- Public watchlist routing that remains tickers-only.
- Recommendations born with an instrument, level, invalidation, and horizon.
- Registry-derived tool reads that reach the Market Action Center without duplicated model logic.
- Outcome accounting that publishes invalidations and not-evaluable calls beside satisfied calls.
- Planning records that match measured product behavior.

These are phase commitments, not blanket delivery claims. The release feature ledger owns row-level delivery
evidence and must remain explicit about partial, withheld, or uncertified work.

### Exit Criteria

- Every required phase capability has evidence-backed delivery status or an explicit non-delivery disposition.
- Every published recommendation is machine-scoreable or explicitly marked `not-evaluable`.
- The scorecard keeps invalidated calls as prominent as satisfied calls and withholds undersampled rates.
- Every registered tool contributes a current read or an explicit stale, unavailable, or not-relevant state.
- Product copy contains no framework bookkeeping that a reader must interpret.
- Planning state, release evidence, and shipped behavior no longer contradict one another.

## What's Actually Working Today

The statements below are deliberately narrow. They describe current repository artifacts and commands, not
an independent audit of the deployed Pages site.

| Capability | Current Evidence | Honest Boundary |
|---|---|---|
| Static, build-free product | [`README.md`](../README.md) and [`.specify/memory/agents.md`](../.specify/memory/agents.md) define checked-in HTML, JavaScript, and data as the deployable site. | No application build or service runtime is claimed. |
| Registered product inventory | `jq '{count: (.tools | length), statuses: (.tools | group_by(.status) | map({status: .[0].status, count: length}))}' tools.json` returned **25**, all with status `live`, on 2026-08-12. | Registry presence is not end-to-end certification. |
| Market Action Center contract | [`tools.json`](../tools.json) registers `market-brief` as the final aggregator and declares Brief, Portfolio, Red Alert, and Journey views. | This proves the declared product contract, not current data freshness. |
| Outcome scorecard artifact | At local planning snapshot `eac966b78bacc5697458a7c8e54a684f6517c05b` on 2026-08-12, [`market-brief.scorecard.json`](../market-brief.scorecard.json) recorded 246 closed calls: 55 satisfied, 41 invalidated, 7 expired, 143 not evaluable, and 96 resolved. | The snapshot's 30-day not-evaluable share was **0.5813** and its hit rate was **0.5729**. Scheduled origin artifacts advance independently, so execution and release checks must remeasure by date and revision. |
| Shared data and access contract | [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) requires cache-first reads, delta-only refresh, central provider access, and honest stale or unavailable states. | The contract permits degraded or unavailable data and forbids presenting it as live. |

## Current Versus Planned

Current capability statements must come from current artifacts, executed checks, or the evidence-backed
release feature ledger. A spec, roadmap item, or file name does not prove delivery.

Planned work remains planned until the release owner records its evidence in
[`releases/improvement-plan/features.md`](releases/improvement-plan/features.md). Code that exists without
matching certification must be described as code present, not as a delivered capability.

No new phase should be added merely to rename unfinished work. Add a phase only when it has a distinct goal,
capability set, and exit criteria.

## Risk Assessment

| Risk | Current Signal | Product Response |
|---|---|---|
| Recommendation evaluability | Planning snapshot `eac966b78bacc5697458a7c8e54a684f6517c05b` marks 58.13% of closed calls `not-evaluable`. | Prioritise level-bearing claims before adding more analysis surfaces, and remeasure moving artifacts at execution time. |
| Documentation drift | Binding product prose still contains the historical 23-tool count while `tools.json` contains 25 live entries. | Derive counts from the registry and refresh release-owned summaries without editing historical evidence. |
| Data freshness and availability | The product supports cached, stale, unavailable, local, and refreshed states. | Keep missing data explicit and never convert absence into zero or a plausible value. |
| Selective outcome reporting | The product's differentiation depends on publishing misses with equal prominence. | Preserve append-only history, invalidations, and sample-size withholding. |
| Single-operator continuity | Scheduled research and narrative refresh depend on one operator's environment. | Keep the static site useful without keys, a proxy, an account, or a current narrative. |
| Public-data privacy | The repository is public and the product is intentionally single-operator. | Commit tickers only. Keep position size, cost basis, P&L, and credentials local. |

## Capital Requirements

The repository contains no quantified financing request, hiring plan, or operating budget. This overview does
not invent one.

| Area | Current Posture | Planning Implication |
|---|---|---|
| Hosting and compute | Static GitHub Pages delivery with in-browser computation and no application build. | Keep the baseline architecture capital-light. |
| Market data | Same-origin snapshots and optional centrally configured provider access support the current product. | Treat licensed or real-time data as a separate, evidence-backed decision. |
| Product development | The suite is single-operator and build-free. | Operator attention and evidence quality are the binding resources. |
| Commercial operations | Multi-user accounts, brokerage, and order execution are explicit non-goals. | Do not budget for a commercial platform without a new owner-approved direction. |

## Strategic Priorities

1. **Restore scheduled-publication atomicity.** Repair the transaction, validation, and rollback contract
   before integrating another scheduled producer.
2. **Publish the existing evidence completely.** Wire 12-ticker owner-read generation and the Feature 004
   headless FX read through their assigned owners.
3. **Continue active work sequentially.** Respect current Feature 008, Feature 007, and Feature 006 handoffs,
   then reconcile D20 without inventing execution history.
4. **Finish the honesty loop before expanding the catalogue.** Keep new calls machine-checkable and let the
   append-only scorecard converge without rewriting old outcomes.
5. **Protect offline and keyless usefulness.** A missing provider, proxy, key, or narrative must degrade
   honestly rather than empty the product.
6. **Apply the admission test before catalogue expansion.** Start another tool only when higher priorities
   are clear and the capability improves decisions or their measurement.

The [release action ledger](releases/improvement-plan/actions.md) owns exact owners, blockers, unblock
conditions, acceptance metrics, and collision rules for these priorities.

## Documentation Map

| Question | Source |
|---|---|
| What governs product decisions? | [`Product-Principles.md`](Product-Principles.md) |
| What is the active phase trying to prove? | [`releases/improvement-plan/vision.md`](releases/improvement-plan/vision.md) |
| What is delivered, partial, withheld, or uncertified? | [`releases/improvement-plan/features.md`](releases/improvement-plan/features.md) |
| What executes next, and who owns it? | [`releases/improvement-plan/actions.md`](releases/improvement-plan/actions.md) |
| What work does the active phase propose? | [`Improvement-Plan.md`](Improvement-Plan.md) |
| What did the whole-product review measure? | [`Product-Review-and-Roadmap.md`](Product-Review-and-Roadmap.md) |
| What are the canonical project commands? | [`.specify/memory/agents.md`](../.specify/memory/agents.md) |
| How does the brief operate? | [`notes/market-brief.md`](../notes/market-brief.md) |
| What tools are registered now? | [`tools.json`](../tools.json) |
