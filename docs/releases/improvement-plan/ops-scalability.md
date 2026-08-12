# Operations And Scalability - `improvement-plan` phase

## Operating Model

Research Lab has no application server or production database. Operational complexity sits in the scheduled
publication pipeline, repository-backed data and history, static Pages delivery, browser-side computation, and
single-operator continuity.

The current operational priority is correctness under publication failure, not request throughput.

Numeric planning baselines are fixed at local repository commit
`eac966b78bacc5697458a7c8e54a684f6517c05b` (2026-08-12). Its 30-day scorecard reported 246 closed, 96
resolved, 143 not evaluable, `notEvaluableShare` 0.5813, and hit rate 0.5729. Scheduled origin artifacts advance
independently; every operational execution and release review records a fresh date and repository revision.

## Complexity Assessment

| Surface | Current complexity | Primary failure mode |
|---|---|---|
| Scheduled publication | High | Mixed candidate and retained generations, repair drift, partial history/index mutation |
| Owner-read generation | Medium | Dry-run producer and scheduled publication diverge; A02 still needs a Feature 002/012 owner-decision packet and Feature 002 consent |
| Brief composition | High | Feature 006's browser owner read exists and is registered, but scheduled/headless consumption and Scope 5 closure remain incomplete; evidence and implementation gaps can look alike |
| Recommendation ledger | High | Historical unscoreable outcomes dominate rolling KPI; corrections must remain append-only |
| Static Pages delivery | Low | Repository revision and served site can drift temporarily |
| Browser tools | Medium | Cache/data freshness, first paint, and missing evidence must degrade honestly |
| Release governance | Medium | Terminal spec state may outlive integration truth; phase records may lack execution backing |

## Scaling Triggers

Scaling means more evidence, tools, tickers, history, and scheduled work, not more concurrent users in this
phase.

| Trigger | Required response |
|---|---|
| Registry moves from 25 toward 29 | Derive every count; keep registry, navigation, journeys, owner reads, and tests atomic per tool |
| Watchlist publication moves from the planning snapshot's 4 tickers toward 12 | Measure the 62 applicable cells at the execution revision and preserve explicit gaps; do not infer unsupported domains |
| Scheduled run output grows | Measure run duration and artifact size before changing timeouts or budgets |
| Append-only history grows | Monitor repository and index growth; design bounded indexes without rewriting event history |
| More owner-read builders share `brief-refresh.mjs` | Reserve shared-file ownership and land one integration at a time with canaries |
| New evidence providers are proposed | Define source rights, freshness, failure, and unavailable contracts before consumption |
| A commercial or multi-user request appears | Route to product direction; do not expand the single-operator architecture implicitly |

No numeric threshold is invented where the repository has not established one. New budgets require a failing
assertion before they become release policy.

## Operational Readiness Gates

1. Atomicity suite passes the scheduler, explicit repair, automatic repair, push-failure, and rollback cases.
2. A02 has a `/bubbles.clarify` owner-decision packet, Feature 002 consent, and scheduled owner-read output that
   matches same-input dry-run counts for all 12 tickers.
3. Every headless tool row has a cause-qualified state: analyzed, not relevant, stale, or unavailable.
4. Scorecard generation preserves invalidated, expired, and not-evaluable outcomes.
5. G101 and the named integration checks pass together.
6. Pages serves the promoted coherent revision.

## Incident Response

### Publication incident

1. Stop promotion of the candidate generation.
2. Preserve the prior coherent pair, pointers, history, indexes, scorecard, and generated page artifacts.
3. Record the failing transaction selection and validator output.
4. Reproduce with the focused atomicity suite.
5. Fix the producer, scheduler, or fixture contract. Do not hand-edit generated output.
6. Rerun focused, baseline, and release reconciliation checks before promotion.

### Data-source incident

1. Classify the source as stale, unavailable, disputed, or not relevant.
2. Preserve the last accepted state only where its freshness contract permits it.
3. Do not substitute a proxy ticker, synthetic filing, inferred zero, or unsourced value.
4. Restore current status only after source-qualified evidence passes the owning contract.

### Record-integrity incident

1. Freeze any new completion claim for the affected feature.
2. Compare phase claims with existing execution records and reports.
3. Correct unsupported claims through the owning workflow.
4. Never manufacture a historical command, timestamp, run, or exit code.

## Support Plan

The support owner is the single operator. There is no customer SLA or staffed support rotation. Operational
responses are repository issues, spec/bug workflows, and release actions routed to the owning specialist.

Priority order:

- P0: public coherence, data integrity, selective-reporting risk;
- P1: scheduled owner-read ownership/publication and certified integration gaps;
- P2: active core feature delivery;
- P3: remaining tool coverage and record integrity;
- P4: catalogue expansion.

## Monitoring Cadence

| Cadence | Check |
|---|---|
| Every scheduled run | Exit status, selected transaction, validators, ticker/current/gap counts, final pair coherence |
| Daily | Published narrative freshness, tool-coverage state split, Pages availability, unresolved publication incidents |
| Weekly | Registry and journey derived counts, required binding status, stale-tool causes, repository/history growth |
| Rolling 30 days | Closed/resolved/not-evaluable counts, share, and hit rate with measurement date and repository revision; no historical rewrite |
| Before release promotion | Focused atomicity, A02 owner packet and Feature 002 consent, owner-read dry run, selftest, G101, packet shape/location, diff integrity |

## Post-Launch Iteration

After release promotion:

1. Watch the first complete scheduled cycle for mixed-generation or count drift.
2. Compare scheduled and dry-run owner-read output on identical inputs under the owner assigned by A02.
3. Confirm the five planning-snapshot stale rows moved only for their accepted cause-specific reasons.
4. Track whether recent machine-checkable authoring remains intact as the 30-day window rolls.
5. Review D20 decisions and ensure no new unbacked phase claims appear.
6. Start Feature 013 or 019 only after the release remains stable through the observation window chosen by the
   owner. This packet does not invent that window length.

## Scalability Non-Goals

This phase does not design multi-region hosting, horizontal application scaling, database sharding, customer
support staffing, paid-data procurement, or multi-tenant isolation. None belongs to the current static,
single-operator product boundary.
