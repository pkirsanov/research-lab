# Vision - `improvement-plan` phase

**Phase status:** in progress
**Planning snapshot:** local repository commit `eac966b78bacc5697458a7c8e54a684f6517c05b` (2026-08-12)
**Product boundary:** static, build-free, single-operator educational market research; not investment advice

Numeric baselines below are fixed to that local planning snapshot. Scheduled origin artifacts advance
independently, and execution/release must remeasure them at a named date and repository revision. This packet
does not chase moving origin values in prose.

## 1. Product Vision

Research Lab is a closed-loop decision journal for a discretionary investor. It states what changed, shows
why, records what it claimed, and publishes how the claim resolved. Its differentiator is calibrated honesty:
misses, unavailable evidence, stale reads, and unscoreable claims remain visible instead of being edited away.

At the planning snapshot, the inventory was **25 live registry entries**, **52 journey definitions**, and **67
journey steps**. Those counts describe published inventory, not blanket certification. The Market Action Center
is the global cockpit; each owning tool remains responsible for its own math, evidence, and compact read.

## 2. Phase Intent

This phase makes the honesty loop operational across scheduled publication, watchlist depth, headless tool
reads, recommendation scoring, and release records. Shipping it must prove that a reader can receive a
legible, evidence-qualified, machine-checkable claim about a watched ticker and later see that claim scored
without selective history repair.

Four planned registered tools move the registry from 25 to 29 only after their own gates clear: Portfolio
Survival (008, current Scope 6 `Explainable Research Action Lifecycle`; initial code landed but the scope is not
done), Market Regime (013, not implemented), Recommendation Track Record (015, `specs_hardened` planning only),
and Research Agenda (019, not started). Features 016 and 020 extend existing tools and do not increase the
count.

## 3. What Shipping This Phase Proves

1. A scheduled run publishes one coherent generation or retains the prior coherent generation.
2. The scheduled producer evaluates all 12 watchlist tickers against the 62 applicable matrix cells and
	preserves explicit gaps.
3. Feature 004 contributes its design-required headless FX read and passes recertification review.
4. New proposals remain machine-checkable while the historical 30-day KPI converges append-only.
5. Evidence blockers, missing implementations, honest work in progress, and certified-delivery gaps retain
	distinct labels.
6. D20 phase records are reconciled from existing evidence; missing execution history is never invented.
7. G101 passes without relabeling an incomplete required feature optional.

## 4. Current Signals And Exit Metrics

| Signal | Current state | Exit condition |
|---|---|---|
| Scheduled-publication atomicity | Focused scheduler/repair suite is red on fixture contract drift | Focused suite passes with production scheduler and repair fixture on one contract |
| Published owner reads | Planning snapshot: 4 tickers, 14 current reads | A02 owner-decision packet assigns the Feature 002/012 producer change with Feature 002 consent; scheduled output then covers 12 tickers and the 62-applicable-cell denominator |
| Producer capacity | Planning snapshot: dry run reports 35 current reads and 13 explicit gaps across 12 tickers | Same-input supported set publishes without hand editing; execution and release remeasure it |
| Headless FX | Feature 004 is certified; `buildFxToolRead` is absent | FX read is wired, tested, and recertified |
| New proposal evaluability | Owner measurement is 45 of 45 since 2026-08-10 machine-checkable | New proposals remain machine-checkable |
| Rolling evaluability | Planning snapshot: 246 closed, 96 resolved, 143 not evaluable, `notEvaluableShare` 0.5813, hit rate 0.5729 | At or below 0.25 without rewriting history, measured again on the release revision |
| Brief coverage | Planning snapshot: 13 analyzed, 7 not relevant, 5 stale | Every stale row has an accepted cause-specific disposition |
| Feature 008 handoff | Scope 5 Done; current Scope 6 has initial code from `4063170a` but unchecked completion obligations | Current owner completes Scope 6 sequentially |
| Feature 007 handoff | Scope 1 Done in `7972b308`; current Scope is `02-technique-engine`, with `/bubbles.validate` next | Validate-owned Scope 1 certification review, then only the current owner starts Scope 2 |
| Feature 006 handoff | Scope 5 In Progress; `eac966b7` landed partial replay/run/history implementation; browser owner read exists and is registered | Remaining persistence/read-back, regression, test, and validate closure completes before scheduled/headless consumption is claimed |
| Release reconciliation | Required bindings remain incomplete | G101 and named executable checks pass together |

Historical 2026-08-04 baselines remain useful but are not current: 23 registered tools, 14 current reads over
four tickers and an older 28-cell matrix, `notEvaluableShare` 0.8333, and 11 analyzed / 7 not relevant / 5 stale.

## 5. Audience

The primary audience is the single operator. The secondary audience is any public reader who wants to inspect
the evidence, gaps, and realised error rate. Neither audience is promised personalised advice, execution, or a
performance guarantee.

## 6. Non-Goals

This phase does not add a bundler, brokerage, execution, real-time proprietary data, multi-user accounts,
hosted auth, private portfolio data, synthetic filings, or selective scorecard repair. It does not start 013
or 019 before P0-P3 clear, and it does not count 016 or 020 as new registry entries.

## 7. Admission Test

Every candidate must improve decision quality or the measurement of decision quality. Tool count, visual
polish, sunk effort, and roadmap status do not override that test.

## 8. Cross-Product Context

None. This is one standalone Research Lab phase with no paired-repository schema.
