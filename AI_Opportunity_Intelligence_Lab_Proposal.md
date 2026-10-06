# AI Opportunity Intelligence Lab — Proposal

Status: proposal; no running tool or notification service is implemented by this document. Planning document last reconciled 5 October 2026 (America/Los_Angeles). Latest embedded research refinement: 14 September 2026 review of the 13 September snapshot; source observations retain their original dates, and this planning update does not claim a research-data refresh.

## Decision

Create a separate **AI Opportunity Intelligence Lab** in `research-lab` as the owner of recurring, evidence-backed AI adoption research across industries and companies.

Reuse the research-lab platform's existing Brief, Simple/Power, journey, publication, and evidence-lifecycle infrastructure. Do **not** repurpose the Research Agenda Lab as the owner: it is a strong architectural template, but it is designed for macro-topic research rather than a multi-sector, company-level causal research registry.

The existing AIOpportunities corpus remains the preserved seed and historical report archive. It must not be overwritten during refreshes.

## Current Input Corpus

The relocated corpus lives at:

`/Users/pkirsanov/Projects/AIOpportunities/research/ai-industry/`

It currently contains:

- 23 industry sectors.
- A 196-company original universe and 197 current assessments.
- Company research records, sources, milestones, readiness attributes, and market-snapshot artifacts.
- Preserved original and investigative report snapshots.
- A structural validator that confirms preservation and coverage, but does not certify source truth, causal attribution, or price-model validity.

This is a valuable starting point, but not yet a sustainable research system. Source completeness, corroboration, causal attribution, inflection timing, and valuation depth are uneven by design and must remain visibly incomplete until refreshed with evidence.

## Tool Boundaries And Reuse

| Existing tool | Reuse decision |
| --- | --- |
| Research Agenda Lab | Reuse immutable generations, explicit unavailable/stale states, current-versus-history separation, source/evidence lifecycle, and shared Simple/Power computation principles. Do not merge its macro-topic UI or make it the owner. |
| Causal Rotation Lab | Reuse the causal-evidence principles: pre-event timing, independent evidence clusters, falsifiers, contradictions, and append-only corrections. |
| AI Capex Strategy Lab | Keep as a specialized downstream infrastructure/supplier lens. Reconcile its taxonomy with the new canonical entity map; do not combine its heuristic allocation model with factual research. |
| Company Intelligence Lab | Reuse multi-horizon composition, explicit unavailable dimensions, and evidence-source trace patterns. Its current coverage is Microsoft-specific, so its hard-coded subject model should not be reused directly. |
| Company Fundamentals Lab | Reuse user-owned scenario and evidence-gap UX. Keep standard financial-statement analysis distinct from AI causal research. |
| Sector Rotation Lab | Keep as a live market-price/momentum consumer. Deep-link from the new tool rather than mixing technical signals into the causal evidence ledger. |
| Market Action Center | Consume a compact validated “what changed” brief with deep-links back to the owner. It should not own the company research universe. |

## Canonical Research Objects

The new tool should make research records—not prose—the primary source of truth.

### 1. Entity and security universe

- Stable company, parent, subsidiary, product/business-unit, security, and ticker IDs.
- Multiple sector memberships with effective dates.
- Corporate-action, merger, spin-off, ADR, currency, and security-mapping history.
- Explicit handling for private companies and operating exposures that do not map one-to-one to a public security.

### 2. Evidence ledger

Each claim is an independent record containing:

- Entity, claim type, metric, unit, denominator, observation period, and claim text.
- Publisher, URL, publication time, retrieval time, source class, and source-content hash/snapshot reference.
- Primary versus secondary evidence, corroboration relationships, confidence, and freshness.
- Supporting, conflicting, refuting, superseded, or unavailable status.

An LLM may summarize these records, but must not create unsourced numerical claims or silently resolve conflicts.

### 3. Milestone ledger

Replace generic timing guesses with dated operational gates:

- Milestone state: observed, planned, delayed, achieved, invalidated, or unknown.
- Earliest/latest evidence-supported date window.
- Preconditions such as capacity, chips, power, water, permits, staffing, deployment, customer acceptance, or regulation.
- Evidence references, falsifiers, and the measured outcome needed to confirm productivity impact.

### 4. Dependency graph

Store directed relationships between companies, assets, and constraints:

`company -> supplier/customer/utility/permit/asset/workflow`

Each edge should identify criticality, expected lag, source evidence, exposure direction, and whether it is a bottleneck or benefit pathway. This allows a data-center power contract, an interconnection queue, a staffing change, a procurement award, or a customer deployment to affect several company dossiers without duplicating the evidence.

### 5. Immutable refresh runs

Every refresh produces a dated, immutable generation containing:

- Source manifest and retrieval results.
- Validation results and explicit data-quality gaps.
- New, revised, contradicted, and stale claims.
- Milestone and dependency diffs.
- Derived model outputs and a concise brief.

The current pointer may move to a validated generation; historic records must remain reproducible and never be silently edited.

## Refresh Architecture

Research-lab should not rely on a sibling-project absolute path at runtime. A static deployment cannot read `/Users/.../AIOpportunities`.

Use a versioned import pipeline:

1. Preserve the AIOpportunities corpus as a source archive.
2. Import it into tracked research-lab artifacts through an explicit converter/validator.
3. Normalize entities, securities, source records, and historical snapshots.
4. Store raw-source references and content hashes where permitted.
5. Publish a new generation atomically only when contracts and validations pass.

Suggested source cadence:

| Source class | Refresh policy |
| --- | --- |
| Filings, earnings, official IR releases | Event-driven with daily event detection. |
| Market/security reference data | Business-day refresh; always retain retrieval time and mapping basis. |
| Permits, interconnection, utility, water, procurement, regulator records | Scheduled monthly plus trigger-based review around a milestone. |
| Personnel, hiring, product, customer, and supply-chain evidence | Biweekly scan plus event-driven review. |
| High-impact/contested claims | Manual corroboration queue; never silently overwrite a prior conclusion. |

The refresh process should acquire sources, extract candidate claims, validate units and identities, append or supersede evidence, recompute derived outputs, and publish a diff. It must distinguish `unknown`, `unavailable`, `stale`, and `zero`.

## Simple, Power, Brief, And Journeys

### Simple mode

Answer only the immediate research question:

- What changed?
- Why does it matter?
- What is the next evidence-supported operational gate?
- What dependency could block or accelerate it?
- How strong and current is the evidence?
- What would falsify the thesis?

Show a compact, change-ranked watchlist. Do not present an unsupported investment recommendation or causal price target.

### Power mode

Provide the investigation workspace:

- Industry/company matrix with evidence completeness and freshness filters.
- Company dossiers and multi-milestone timelines.
- Dependency graph and critical-path views.
- Evidence ledger with raw-source links, conflicts, and corroboration.
- Competitor/peer comparison.
- Refresh-generation diffs.
- Explicit models, assumptions, sensitivities, and exports.

### Brief

Reuse the shared brief publication model. Every statement in the brief must be traceable to structured evidence and the generation identifier. If a required input is stale or unavailable, the brief must say so rather than borrowing a prior conclusion.

**Required additional output: AI earnings realization and competitive progress.** Every generation must contain a next-earnings watch, a six-month watch, and a twelve-month watch. Next earnings takes precedence. The complete contract, quality gates, and notification behavior are specified in the dated addendum below; this output supplements all existing briefs and research views.

### Journeys

Define domain-specific journeys rather than reusing generic investment flows:

1. **Evidence sufficiency:** source -> claim -> denominator -> corroboration -> uncertainty.
2. **Catalyst critical path:** milestones -> dependencies -> trigger evidence -> falsifier.
3. **Company underwriting:** operational evidence -> economic bridge -> scenario sensitivity -> review decision.
4. **Refresh and conflict review:** examine deltas, accept/supersede/refute claims, and retain audit history.

No journey should permit a price conclusion where required evidence is incomplete.

## Models

Models must be explicitly separated from reported facts and label every user assumption.

### Initial/basic models

1. **Productivity bridge** — workflow coverage × adoption × verified efficiency × retained benefit. Inputs need source references or an explicit user-assumption label.
2. **Milestone/critical-path model** — timing windows based on the actual dependency gates, not a generic AI adoption curve.
3. **Economic-capture bridge** — connects verified operational gains to revenue, gross margin, opex, or cash-flow exposure.
4. **External-consensus comparison** — retains outside target/estimate data as external context only, never as proof of AI causal value.

### Advanced models, introduced only when evidence is sufficient

- Capacity-to-revenue models for power, data centers, industrial systems, and constrained supply chains.
- Workflow-level adoption curves supported by observed deployment data.
- Biotech research/productivity rNPV models.
- Company valuation/DCF sensitivity models with a separate, visible AI contribution bridge.
- Ownership, funding, capex, and dilution scenarios where those are material to economic capture.

The tool should not mechanically add an “AI uplift” to a stock price. Valuation models need company-specific financial, implementation, and competitive evidence, plus uncertainty ranges.

## Implementation Sequence

1. **Foundation:** define schemas; import the current corpus without changing its historical content; add entity/security mapping and schema validation.
2. **Owner UI:** create the AI Opportunity Intelligence Lab with Simple, Power, Brief, and journey registration using shared research-lab infrastructure.
3. **Refresh pipeline:** implement source plans, source retrieval contracts, evidence ingestion, immutable generations, and diff output.
4. **Initial models:** implement the productivity, critical-path, and economic-capture bridges with evidence-completeness gates.
5. **Consumer connections:** add deep-links and compact read-only outputs to AI Capex Strategy, Sector Rotation, Company Intelligence, and Market Action Center.
6. **Expansion:** progressively raise primary-source and independent-corroboration coverage, beginning with the highest-impact company-sector pairs rather than claiming full forensic coverage for all 197 companies immediately.

## Guardrails

- Preserve original reports and prior investigations verbatim as historical artifacts.
- Never let a previous report become implicit current evidence.
- Never silently overwrite a claim; append corrections and supersession links.
- Keep source truth, model outputs, user assumptions, market price data, and narrative distinct.
- Require direct evidence for causal claims where feasible; label deductions as deductions.
- Treat missing evidence as a visible research result, not an invitation to guess.
- Present the system as educational research, not investment advice.

## Existing References

- `notes/research-agenda-lab.md` — recurring research, immutable generations, and honest unavailable states.
- `notes/causal-rotation-lab.md` — causal evidence, anti-hindsight, independence, and falsification.
- `notes/ai-capex-strategy-lab.md` — specialized infrastructure/supplier lens and its current limitations.
- `company-intelligence.config.json` — explicit coverage, multi-horizon composition, and unavailable-dimension patterns.
- `../AIOpportunities/research/ai-industry/README.md` — source corpus preservation and current research limitations.

## Required Addendum — AI Gains Approaching Earnings

Added 7 September 2026. This extends the proposal and clarifies model and refresh requirements where the earlier outline was underspecified.

### Research question and three independent conclusions

Detect, as early as public evidence permits, whether implemented AI, a changed operating model, or a resolved dependency is approaching a material effect on a company's reported earnings. Also detect erosion when competitors, substitution, customer repricing, or implementation costs outweigh its gains.

Each company must receive three distinct conclusions:

| Conclusion | Question | Permitted states |
| --- | --- | --- |
| Competitive progress | Is the company gaining or losing economic advantage from AI in a defined business and peer group? | gaining, losing, mixed, unresolved |
| Earnings realization | When can the operational change affect the reported period, and when will investors see it? | emerging, approaching-realization, already-realizing, delayed, eroding, unresolved |
| Expectations gap | Does supported incremental performance exceed or fall below a comparable, dated market baseline? | positive-gap, negative-gap, already-in-baseline, unresolved |

A company can gain adoption while losing margin, or deliver better earnings while losing its competitive position. Positive earnings realization does not require an earnings surprise. Price-return conclusions require an additional valuation bridge and cannot be inferred from either of the first two conclusions.

### Required brief outputs

Publish these sections on every generation, including explicit empty and unavailable states:

1. **Next earnings — highest priority:** positive realization candidates, erosion candidates, investment-dip warnings, and items lacking enough evidence. Sort qualified signals by event proximity, financial materiality, and evidence completeness; keep uncertain candidates visibly separate.
2. **Next six months:** cumulative realization and intermediate milestones through `asOf + 6 calendar months`; show which reporting events can reveal each effect.
3. **Next twelve months:** the next stage of deployment, retention, capacity, or business-model change through `asOf + 12 calendar months`. A milestone just before the endpoint may not be visible in earnings until afterward.
4. **Changes since the prior generation:** new, strengthened, weakened, delayed, contradicted, realized, expired, or withdrawn signals, with evidence links and the reason for each change.
5. **Coverage and abstentions:** reviewed companies / eligible universe, source failures, stale dossiers, missing calendars, and unreviewed companies. An absent company is not a neutral assessment.

Every signal card must contain: company/security identity; sector and peer group; the three conclusions above; mechanism (internal productivity, AI product revenue, infrastructure supply, or competitive erosion); the implemented change; operational milestone and evidence date; expected economic period; next report date/time/timezone and confirmation status; affected financial line; sourced impact range or named missing inputs; novelty versus already-reported benefits; counterevidence; falsifier; next evidence to collect; and the first-detected and last-reviewed timestamps.

### Evidence gates and earliest useful notification

Use two notification levels so research can surface early without asserting that an unproven gain is imminent:

- **Early watch:** a dated implementation, organizational change, procurement/customer event, or credible adverse signal plus a plausible economic mechanism. Show missing deployment, quality, cost, timing, and corroboration inputs. Management claims and independent findings remain identifiable.
- **Realization alert:** operating evidence establishes live deployment/adoption or actual erosion; scope and quality are defined; a supported recognition/cost lag puts the effect into a named period; the company retains an economic benefit or bears a loss; a financial bridge establishes materiality; counterevidence has been checked. Independent counterparty, regulator, customer, or observed-outcome corroboration strengthens the alert; correlated reposts count as one source. Unresolved contradictions block promotion.

An unconfirmed announcement date does not suppress a valid period-level early warning. Display the estimated date's provider and downgrade calendar certainty. It does prevent a date-specific alert from being labeled confirmed. Revenue-only updates must not be presented as full earnings releases.

An **earnings-surprise alert** additionally requires a timestamped, same-period, same-accounting-basis consensus/guidance comparison, contributor count where available, and proof that the modeled AI effect has not already been included. Missing consensus blocks only the surprise claim, not the operational watch.

Do not infer an AI advantage from layoffs alone, new executive appointments, job-posting counts, demo benchmarks, purchased seats, contract backlog, or a permit. Test output/quality after staffing changes; paid usage after purchases; customer acceptance after commissioning; and billable utilization after acceptance. Alert on canceled projects and deterioration as promptly as on deployment gains.

### Financial and timing models — clarification of the initial model list

The initial productivity bridge is a screening decomposition, not a company-wide productivity multiplier. For a fixed-volume, constant-quality cost model:

`cost saving share = affected cost share × deployed share × measured local saving rate − incremental cost share`

`cost productivity multiplier = 1 / (1 − cost saving share)`

All inputs must use the same cost denominator and period. Redeployed time is capacity, not a cash saving, unless spending or hiring avoidance is established. Output growth, prices, and mix need separate models.

For a quarter, model each deployment cohort's effective live days and ramp, then map revenue recognition and cost timing:

`incremental operating profit = retained cost savings + incremental AI revenue × incremental contribution margin − implementation/run costs − cannibalized contribution − incremental depreciation`

For equity effects, separately include interest, tax, share count, and dilution. Maintain both reported and comparable accounting views. Show the adoption investment dip, actual benefit emergence, and possible later scaling as separate milestones. Never add overlapping cloud, chip, application, and end-customer benefits as independent company revenue.

Avoid assigning unsupported probability percentages or multiplying subjective evidence weights into forecast probabilities. Use transparent evidence states initially. Probability outputs become eligible only after calibration against frozen prior forecasts and out-of-sample outcomes.

### Competitive comparisons

Compare companies on a declared common business, geography, period, denominator, and operating outcome. Retain gross demand, customer value, supplier capture, and shareholder capture separately. Normalize acquisitions, divestitures, metric redefinitions, FX, price increases, share repurchases, tax effects, depreciation assumptions, restructuring, and exceptional gains before interpreting a change as AI productivity.

A losing classification needs an observed adverse mechanism such as churn, price pressure, loss of distribution, contract repricing, adoption failure, or inability to fund/commission capacity. A competitor's impressive AI press release is insufficient. Preserve a separate status for a successful internal adopter whose market is shrinking.

### Refresh and delivery behavior

Every tool/brief regeneration must run the research freshness and change-detection stage. Each requested source publishes exactly one terminal result: `retrieved`, `unchanged-row`, `unavailable`, `refused`, or `not-due`. Rendering an old narrative with a new timestamp does not count as refreshing research.

Use incremental source acquisition with per-source cadence and content hashes. Prioritize changed companies and those approaching earnings; run a targeted source and calendar check at each scheduled generation inside the pre-earnings monitoring window. Full-universe deep research is budgeted separately and its coverage is displayed. Reopen dependent signals when an evidence item, metric definition, earnings date, or critical dependency changes.

Default notifications are in-tool and in the generated Brief. Any future email/push integration requires separately configured delivery preferences. Deduplicate by company, mechanism, period, and evidence revision. Repeated unchanged refreshes produce no new alert. Record first detection, source-availability time, revisions, outcome, and lead time; freeze the pre-earnings assessment before the release.

Refresh the report and model snapshots atomically. If one company fails acquisition, publish its failure state and preserve its dated history while allowing validated companies to refresh. Upstream generations remain reproducible. The Markdown report and interactive tool must render the same canonical signal records.

### Acceptance criteria

- All three horizon outputs exist, and next earnings is prominent in Simple and Brief.
- Every candidate has a sourced event date/status or an explicit unknown; expired events cannot remain “next.”
- A milestone occurring after a quarter closes cannot be assigned as a realized effect in that quarter; subsequent guidance impact is separate.
- The calendar provider's estimate is never relabeled as company confirmation.
- Customer savings cannot become vendor profits without a capture bridge.
- A reporting definition/accounting change cannot generate an automatic AI-gain upgrade.
- Old evidence remains visible with its original dates; cancellation/refutation reopens dependent journeys.
- Missing inputs yield an explicit abstention, not zero impact or a fabricated forecast.
- Track alert precision, false positives, direction errors, timing error, withdrawals, coverage, and detection lead time against frozen outcomes. Report insufficient history until a useful evaluation sample exists.

### Initial research artifact

The first manual application is [AI Earnings Realization Watch — 7 September 2026](../AIOpportunities/AI_Earnings_Realization_Watch_2026-09-07.md), with a [structured signal snapshot](../AIOpportunities/research/ai-industry/earnings_realization_watch_2026-09-07.json). It is a dated research publication and import seed; it does not implement automated monitoring or delivery.

The [September 8 revision](../AIOpportunities/AI_Earnings_Realization_Watch_2026-09-08.md) and its [signal snapshot](../AIOpportunities/research/ai-industry/earnings_realization_watch_2026-09-08.json) demonstrate the intended additive update: Concentrix's company-confirmed September 29 earnings date supersedes a September 24 provider estimate, while newly discovered Meta counterevidence retains its September 2 publication date. The unchanged company financial baselines retain their prior review dates. Acceptance checks must cover all three behaviors: calendar precedence, discovery-versus-publication timing, and honest partial refresh.

## Required extension — outside-in earnings signals and options-aware forecasts

This extension tightens the earnings-realization brief. A summary of the issuer's last results is a **financial baseline**, not the leading-evidence engine. All existing sector attributes, ten-company-per-sector coverage, Simple/Power modes, Brief, Journeys, refresh requirements and historical research remain required.

### Mandatory Brief output

For each selected company, put the following together in the next-earnings calendar and company card:

1. Next event, financial period, release/call time, timezone, confirmed/estimated status, and earnings-versus-revenue-only classification.
2. **Outside-in thesis:** what changed in customer, supplier, workforce, physical infrastructure, product deployment, competitive distribution or observed usage; when it happened; and why it can change this reporting period.
3. Revenue, gross-margin, operating-margin, cash and EPS bridge, distinguishing source facts, calculations and analyst assumptions. Show the investment dip and later realization separately.
4. **Own stock-event prediction:** direction, percentage when supported, explicit unavailable magnitude otherwise, conviction, return window and the model connecting economics to valuation. Do not quietly substitute analyst targets, a management forecast, sector optimism or the options-implied move.
5. IV30, selected event-expiration contract IV, expiration, strike, spot reference, quote/provider clocks, bid/ask, liquidity and staleness status. Show the options-implied earnings component only when a defensible event-isolation method exists.
6. The six- and twelve-month continuation, dependency milestones, counterevidence, peer comparison, earliest confirmation/falsifier, and changes since the previous frozen record.

A **directional watch**, a **conditional numerical scenario**, an **unconditional return forecast**, and a **qualified earnings-surprise alert** must be different record types and visibly different outputs. An unavailable percentage is a coverage gap, not 0%. The tool must disclose how many of each it published.

### Outside-in acquisition and provenance

Prioritize customer procurement/awards and implementation documentation, supplier shipments and staffing, permits and metering approvals, grid interconnection and actual load, construction/commissioning records, technical release notes and outages, deduplicated job postings and WARN/other actual exit notices, customer receipt/app/traffic panels, and original investigative reporting.

Every evidence item needs:

- publisher and original URL/record identifier; immutable source-availability, observation-period, retrieval and first-detected clocks;
- company, subsidiary, site/customer cohort, geography and exact linkage to the issuer;
- observed fact versus management/counterparty claim versus independent estimate; source methodology, coverage and limitations;
- common source/measurement cluster, so syndicated releases and correlated panels are not counted as separate corroboration;
- revision/supersession status, accessible excerpt or permitted snapshot, content hash when stored, and any retrieval failure;
- unit, denominator, period, baseline, and whether the input is a stock, flow, capacity, allowance or realized use.

Use only public or appropriately licensed information. Do not obtain private employee or customer records, imply insider access, or send information requests/contact companies automatically without separately authorized workflow settings.

**No proxy shortcuts:** water allocation is not water consumption; consumption is not IT MW without cooling design and utilization; emergency generator rating is not continuous load; satellite building completion is not accepted billable capacity; headcount reduction is not preserved output; co-subscription is not churn; customer savings are not vendor revenue. A source date cannot substitute for the underlying measurement period.

### Models and assumption controls

Simple mode shows the causal chain and the largest missing input. Power mode exposes cohort timing, ramp, utilization, net pricing, recognition, retained savings, variable costs, inference/rework, depreciation, financing, tax, dilution and valuation assumptions. Journeys link the operating milestone to the earliest affected reporting period, and reopen when a source is contradicted.

Quantitative stock predictions require a reproducible earnings/cash-flow bridge and an explicit estimate of what is already priced. Store the consensus/guidance basis and observation date separately; a scenario relative to guidance cannot be labeled a consensus beat. An unpriced-fraction assumption is allowed in a **conditional scenario**, but must not be represented as an observed market expectation.

For a constant-P/E scenario, use `return = (1 + newly recognized forward-EPS change) × (1 + multiple change) − 1`. A temporary quarter timing effect cannot be perpetuated across forward EPS without an explicit persistence assumption. Debt/cash and share changes must be included in an EV-to-equity model. Do not use a positive P/E model on negative/unstable earnings or extrapolate a task-level productivity multiplier to the whole company.

A qualified pre-earnings “winning/losing” alert needs economically material operating evidence and a named period. A stock-surprise alert additionally needs a supported expectations gap. The tool should still issue an early, explicitly incomplete warning when the mechanism is credible but the monetary bridge is unfinished.

### Options quality and event-isolation rules

- Store raw contract symbols and verify security, corporate-action-adjusted deliverables, currency, exchange, expiration, strike and multiplier. Do not substitute an ADR or similarly named ticker without a documented mapping.
- Record IV units explicitly: in the current Cboe feed, IV30 is already percent; contract IV is decimal. Convert exactly once.
- Select and disclose the near-spot paired strike and expiry after the release. If the calendar is estimated, keep that uncertainty attached to the contract choice. Same-day expiry requires release-time verification.
- Disclose zero bids, crossed quotes, spread, open interest, volume, strike distance, feed age and missing coverage. HTTP 200 and today's retrieval do not imply a current market observation.
- `(call midpoint + put midpoint) / spot` is **total-expiration straddle premium**, not automatically an earnings-only expected move, a confidence interval or a symmetric break-even around spot. Exact expiration break-evens are `strike ± premium`.
- If extracting an event variance from adjacent maturities, expose the baseline variance/term-structure model, day count and sensitivity; suppress event-only magnitude if maturity coverage, quote quality or calendar certainty is inadequate.
- Market-implied magnitude must never supply the direction or mechanically become the analyst's return forecast. Do not describe cheap/expensive IV without a defensible comparable realized/event distribution.

### Regeneration, history and evaluation

Every regeneration must refresh the selected operating sources, calendar and market snapshots or mark each failed/deferred acquisition. The financial baseline and indirect evidence have independent freshness clocks. Preserve all earlier reports and forecasts; show the current assessment prominently and label superseded result-led narratives as historical calibration material.

Publish the Brief, detailed report and canonical model records from one validated revision. All numeric calculations need tests. Missing company acquisition must not prevent other validated records from updating, but cannot silently become “no change.”

Freeze pre-event inputs and score operating-direction accuracy, monetary bridge error, timing, surprise classification and stock-return error **separately**. Do not score a conditional sensitivity as an unconditional forecast. Track coverage/abstentions alongside false positives, alert lead time and forecast revisions. Event returns must use the specified pre/post regular-session closes, with splits and other corporate actions handled.

### Acceptance fixtures from the September 8 investigation

- Amazon's 0.060 → 0.129 MGD approval produces a **2.15× allowance ratio**, not a 2.15× revenue or productivity forecast.
- An August commissioning entry extrapolated from May satellite imagery remains an **estimate**, even if displayed in a source's “current capacity” field.
- Concentrix's September 8 retrieval carrying a September 4 vendor clock is marked **stale**; it cannot populate “current IV” without that warning.
- Chegg's $1 option strike against $0.84 spot and wide spreads blocks a clean ATM/event-move label.
- Smarsh's 72% deflection includes its **405-interaction denominator**; it cannot be scaled to Salesforce's installed base without a model.
- A July 23 go-live recounted in August keeps July 23 as the operating event.
- Chegg cancellation/retention counterevidence and missing free-AI usage prevent a paid-AI-causation claim.
- A November TP revenue update cannot be scored as confirmation of an earnings-margin jump.
- The full earlier research and sector/company universe remain preserved.

Implementation reference: the [revised earnings report](../AIOpportunities/AI_Earnings_Realization_Watch_2026-09-08.md), [indirect-evidence records](../AIOpportunities/research/ai-industry/indirect_evidence_assessment_2026-09-08.json), and [audited options observations](../AIOpportunities/research/ai-industry/options_audited_2026-09-08.json). These are manual research artifacts and a read-only options acquisition script, not a running monitoring/notification service.

### Additional required controls — September 8 evening forensic findings

The [three-company supplement](../AIOpportunities/AI_Earnings_Forensic_Update_2026-09-08.md) supplies additional acceptance cases. These requirements extend, not replace, the sector universe, company attributes, Simple/Power modes, Brief, Journeys and automatic research refresh.

**Brief must separate three signals:** operational improvement/deterioration, expected earnings realization, and stock surprise relative to current expectations. Each gets its own status, date, evidence, countercase and missing-input explanation. A company may improve operationally without generating a positive stock surprise. A material intervening market move triggers a priced-in reassessment; it must not mechanically upgrade or invert a thesis. Show withdrawals prominently and preserve the old call. Never score a move that occurred before publication, or before the specified earnings event, as success for that event forecast.

**Source reconciliation before forecasting:**

- Store consensus provider, publication/observation time, fiscal period, GAAP/adjusted definition, currency, dilution basis and contributor count/distribution when obtainable. Store missing values explicitly. Preserve provider disagreement; do not average incompatible figures or use equity-rating counts as EPS contributor counts.
- Keep a preliminary aggregate anchor distinct from a reconciled consensus panel. A one-cent Adobe EPS difference between providers is a model ambiguity, not an AI surprise. An unexplained $4.86 estimate cannot be assumed GAAP or merged with $6.07/$6.08.
- Source event dates, expected dates and effective dates are separate. A September personnel filing can describe a December appointment; the latter cannot cause a completed August quarter's productivity. An acquisition announcement without consideration, closing/recognition date or contribution does not establish organic productivity or quarterly accretion.
- A dataset's current field may carry forward an old estimate. Store each row's observation period and projected/inferred/measured status. Future rows cannot become facts because the source downloaded successfully. When schema documentation conflicts with actual units, quarantine conversions until reconciled and record the resolution.
- Free-access commitment value, eligibility, registration, activation, usage, paid conversion and recognized revenue must be distinct measures. For Adobe's 12-month offer, the journey begins the free-period clock at activation, not announcement. Do not notify a revenue win from the headline dollar value.

**Model and market controls:**

- Require a dated consensus-gap bridge before a stock-surprise alert; publish a research warning separately when the causal economics remain incomplete. Reverse-materiality calculations are allowed and useful, but must be labeled thresholds, not forecasts.
- Distinguish one-quarter shocks from recurrent effects. Never annualize an EPS shock without explicitly modeling the affected quarters. A synthetic `4 × quarterly EPS` denominator is not next-twelve-month consensus; an assumed 50% unpriced fraction is not measured investor positioning.
- Retain raw underlying current price, close, prior close, price change, bid/ask, OHLC, response clock and contract last trades. Check OHLC consistency and price-change reconciliation. HTTP freshness, liquid spreads and recent last trades do not establish simultaneous underlying/option bid-ask observations.
- In the current examples, CNXC's updated contracts supersede the stale observation but retain the wide-spread and synchronization warnings; ORCL/ADBE mixed-session fields cannot supply validated event closes. Do not silently repair these by selecting whichever price makes the model work.
- Partial refresh is a keyed overlay with explicit precedence, not a new smaller universe. The current three-company update must retain the other ten watchlist records and all sector tables. Atomic generation must expose which inputs refreshed, failed or remained historical.

**Regression fixtures:** distinguish 421 IT MW from 590 facility MW at Abilene; preserve the November row as a projection; reject TDLR accessibility review as customer acceptance; reject free-access value as sales; preserve September 27/December 1 personnel effective dates; retain Adobe's incompatible EPS feeds; distinguish Concentrix's one-quarter −0.335% conditional case from the recurring −1.34% case; exclude the September 8 price decline from the September 29 event score. Current overlay and snapshots: [structured findings](../AIOpportunities/research/ai-industry/earnings_forensic_update_2026-09-08.json), [quotes](../AIOpportunities/research/ai-industry/options_selected_quotes_2026-09-08_evening.json), [site timeline](../AIOpportunities/research/ai-industry/epoch_abilene_selected_2026-09-08.json).

### Required refinements — September 14 review of the September 13 snapshot

The [new research snapshot](../AIOpportunities/AI_Earnings_Realization_Watch_2026-09-13.md) exposes specific weaknesses that the proposed tool must address. These requirements extend the existing design. They do not replace its sector coverage, Simple/Power models, Brief or Journeys. No automated service was implemented by this research update.

#### Brief: approaching events and completed-event accountability

Show three separate lanes: approaching earnings, six-/twelve-month milestones, and recently completed events. Each company retains distinct operating, earnings-realization and stock-surprise assessments.

For approaching events, require the reporting date, certainty, fiscal cutoff, earliest affected period and leading evidence. Include counterevidence, missing monetary inputs and market-data freshness. Report qualified alerts separately from research warnings and abstentions.

After an event, retire it from the next-earnings queue. Preserve its forecast and record actuals separately. If the following date is unverified, display that gap instead of retaining the expired date. Do not select new options against a completed event.

Freeze consensus observations and forecast publication times before results. Score the declared event window, not whichever opening or closing price favors the narrative. In this snapshot, Oracle's opening and closing returns have opposite signs. Adobe's do too. Neither company had an eligible numerical prediction. Both count toward abstention coverage, not forecast hits or zero forecast error.

#### Power model: demand, automation and retained economics

Concentrix's customer evidence requires a demand-versus-deflection model. Use `contacts = orders × contacts per order` with matched cohorts and periods. Currys' 6% revenue growth is not observed order growth. Its 0.18 contact ratio cannot establish a before/after change without a baseline.

The 5.66% contact-ratio threshold is conditional sensitivity, not predicted demand. Require customer billing terms before converting fewer contacts into Concentrix revenue or margin. Separate customer savings, technology-provider receipts and outsourcing-provider retained contribution.

For a volume-priced cohort, expose the following bridge:

`contribution = billed contacts × net revenue per contact − delivery labor − AI/inference costs − rework − deployment costs`

Model fixed-fee and outcome-priced contracts separately. Aggregate only after reconciling cohort coverage and avoiding overlapping contract revenue. The stock model additionally requires forward-period persistence, financing, dilution and an expectations gap.

#### Journeys: recruitment, deployment and company coverage

Track requisition, planned start, actual hire, training completion, accepted customer work and billable utilization as separate events. A requisition is not a headcount. Multiple training dates are not measured cohorts. Deduplicate reposts and distinguish attrition replacement from expansion.

The September 14/21 and October recruitment starts follow Concentrix's August quarter-end. They cannot explain productivity already realized in that quarter. Salary calculations must retain their pay-period assumptions. The Widnes listing does not establish an annual basis or filled-role count.

For infrastructure companies, maintain site/customer-cohort coverage before presenting a company-wide timing estimate. Oracle's Abilene investigation did not establish its global delivery inventory. Track accepted capacity additions separately from installed capacity stocks. Require matching units and periods for coverage ratios. A site stock divided by quarterly company additions is not a valid ratio.

#### Acquisition quality and release requirements

- Preserve both raw and normalized IV30. A vendor zero fails the usable-volatility check and becomes null, with a reason.
- Separate response timestamps, trading sessions, quote observations and contract last trades. A weekend refresh does not create weekend trading.
- Preserve opening gaps and regular close-to-close returns separately. Reject intraday last trades as substitutes for the selected closing observation.
- Compare relevant dataset rows as well as response hashes. Epoch's changed download hash did not establish changed Abilene evidence.
- Preserve the research cutoff separately from finalization time. Monday finalization does not make Sunday's market snapshot live.
- Publish explicit refreshed, carried, failed and completed-event counts. Never advertise a partial refresh as full-universe coverage.

Required acceptance cases come from the [structured revision](../AIOpportunities/research/ai-industry/earnings_watch_update_2026-09-13.json), [event prices](../AIOpportunities/research/ai-industry/market_event_outcomes_2026-09-13.json), and [options observations](../AIOpportunities/research/ai-industry/options_reviewed_2026-09-13.json). Their arithmetic can be checked independently. They do not establish calibrated forecasts, causal AI attribution or production notification delivery.
