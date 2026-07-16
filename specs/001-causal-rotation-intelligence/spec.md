# Feature: 001 Causal Rotation Intelligence

## Problem Statement

The Research Lab can identify that relative leadership is bending before a move becomes visually obvious, but it cannot establish why that bend may persist. The current Sector Rotation tool computes relative-strength state, momentum acceleration, price/volume participation, breadth, and correlation from market series. The Market Brief adds macro, policy, earnings, geopolitical, and psychology narrative, but those causal claims are free-form and do not have a common lifecycle, provenance rule, expiry rule, contradiction policy, or outcome history.

This leaves the user with two costly failure modes:

1. entering after a rotation is already established because fundamental and policy transmission was not organized early enough; or
2. entering a reflex rally because an oversold price move was retroactively explained as a durable fundamental rotation.

The need is not another price indicator. The user needs a distinct causal-rotation capability that tracks evidence available at the time, explains how a catalyst could transmit into a sector under the current regime, distinguishes independent confirmation from duplicated evidence, and hands timing to the existing rotation tool.

Concrete evidence for the gap:

- `sector-research-lab.html` classifies `Basing`, `Improving`, `Leading`, `Peaking`, and `Weakening` from relative strength and acceleration, with volume, breadth, and correlation confirmation; it has no structured catalyst, earnings-revision, valuation, policy, credit, or seasonality object.
- `market-brief.config.json` contains a macro-event calendar and standing backdrop, but not a source-dated, sector-specific transmission hypothesis with lifecycle and expiry.
- `market-brief.payload.json` currently explains examples such as fresh XLF leadership, cooling semiconductors, and XLE accumulation in prose; those explanations cannot be compared mechanically with what was known in the prior run.
- `real-assets-lab.html` distinguishes gold, bitcoin, silver, energy, and commodity models, but an energy-equity versus commodity-curve divergence is not owned as a causal rotation hypothesis.
- The supplied transcript combines useful candidate evidence with promotional commentary and unverified claims. Its ideas are inputs for hypothesis generation, not accepted facts.

## Outcome Contract

**Intent:** Enable a user to identify a possible sector, factor, country, or real-asset rotation while it is still emerging, understand the evidence-backed reasons it may occur, and know what would confirm or falsify it before entering. The causal explanation must remain separate from market timing so that the user can see whether cause leads price, price leads an unverified story, or the two agree.

**Success Signal:** For every elevated rotation candidate, the user can see the catalyst timeline, affected exposure, transmission mechanism, regime dependence, valuation/fundamental state, positioning state, market-confirmation state, evidence freshness, independent confirmation count, current lifecycle stage, and one explicit confirmation and invalidation condition. The Market Brief can consume the same candidate and either elevate it into a near-term action or record why it remains a watch item.

**Hard Constraints:**

- A causal claim is never presented as fact without a named source, publication/effective time, freshness state, and confidence classification.
- Evidence that shares one underlying cause is grouped and cannot count as multiple independent confirmations.
- The sensitivity control may change when a candidate becomes visible, but may not weaken provenance, freshness, contradiction, or invalidation requirements.
- Price, volume, options, and flows remain market-confirmation evidence; they do not prove why a rotation occurred.
- Seasonality and election-cycle history are contextual priors with sample size and dispersion, never a sufficient primary cause.
- Policy outcomes are represented as scenarios until enacted or otherwise observed; the product does not predict an unverified geopolitical or regulatory event as fact.
- All historical evaluation uses only evidence that was available by the decision timestamp; later facts cannot be inserted into an earlier hypothesis.
- Missing or stale required evidence remains visibly missing or stale and is never converted to a neutral score.

**Failure Condition:** The feature fails even if its calculations render correctly when it encourages a user to treat a post-hoc narrative as causation, double-counts correlated evidence, hides stale inputs, promotes a seasonal pattern as a trade by itself, or produces an early signal with no falsifiable confirmation/invalidation path.

## Goals

- Surface evidence-backed causal rotation candidates before they reach established-leadership status.
- Separate four decision clocks: catalyst, fundamental transmission, positioning, and market confirmation.
- Explain why the same policy, earnings, or geopolitical event can affect sectors differently across regimes.
- Give users a transparent sensitivity control for discovery versus confirmation without changing evidence-quality rules.
- Resolve common contradictions such as fresh XLF leadership with weak longer-term relative strength, energy equities diverging from spot oil, or semiconductor breadth washout during an intact earnings cycle.
- Make valuation, earnings revisions, credit conditions, policy timing, seasonality, election-cycle context, options, and flow evidence comparable without forcing them into one undifferentiated score.
- Provide decision-useful charts that show chronology, valuation/cycle context, and falsification rather than decorative market summaries.
- Supply the Actionable Market Brief with one normalized causal-rotation read per candidate.

## Non-Goals

- Predicting policy, election, war, court, regulatory, or central-bank outcomes before credible public evidence exists.
- Claiming real-time fund inflow/outflow, dark-pool direction, or cash allocation when the available source is delayed or only a proxy.
- Replacing the Sector Rotation tool's relative-strength and timing model.
- Replacing fundamental research, audited filings, issuer disclosures, or licensed consensus-estimate products.
- Treating forward P/E, margin debt, the Hindenburg Omen, put/call activity, seasonality, or election cycles as standalone entry signals.
- Producing personalized portfolio sizing, execution, or investment advice.
- Combining every available observation into a larger score merely because it is available.

## Current Capability Map

| Capability | Current Evidence | Status | Gap This Feature Owns |
| --- | --- | --- | --- |
| Early relative-strength bend | `sector-research-lab.html` RRG states and two-week acceleration | Complete for market timing | No causal evidence or chronology |
| Participation and internal health | Sector OBV, relative volume, breadth, correlation, risk flags | Partial | Flow is proxy-only and does not establish cause |
| International leadership | `global-rotation-lab.html` relative momentum, trend, risk, FX, local-session context | Partial | No country policy/growth/credit transmission hypothesis |
| Real-asset regime clues | `real-assets-lab.html` distinct gold, silver, bitcoin, energy, and commodity models | Partial | No futures-curve/inventory/policy divergence ownership |
| Options positioning | Options Structure, Gamma Trading, and Unusual Options tools | Complete for delayed positioning proxies | Cannot establish causal fundamentals |
| Structural regime | Swing Structure plus Market Brief backdrop | Partial | Regime is not linked to sector-specific event transmission |
| Events and policy context | `market-brief.config.json` and Tier-B research | Partial | Free-form, no common lifecycle/provenance/expiry contract |
| Valuation and revisions | MSFT-specific model and editorial brief references | Missing at sector level | No sector valuation band or revision breadth |
| Credit and debt creation | Cross-asset HYG/TLT proxies and prose | Missing as owned capability | No credit-pulse or debt-issuance evidence chain |
| Seasonality and election cycle | Occasional brief narrative | Missing as governed input | No sample-aware prior or regime interaction |
| Outcome accountability | `brief-history.jsonl` stores snapshots | Partial | No causal hypothesis result/falsification ledger |

## Domain Capability Model

### Capability

**Causal Rotation Intelligence**: evidence-time-safe discovery, staging, and evaluation of hypotheses that a policy, macro, fundamental, credit, supply, geopolitical, seasonal, or positioning change may shift relative leadership among market exposures.

### Domain Primitives

| Primitive | Purpose | Lifecycle |
| --- | --- | --- |
| Catalyst Event | A dated occurrence or scheduled decision that could alter cash flows, discount rates, supply, demand, regulation, or risk premia | rumored/unverified → proposed → scheduled → announced → enacted → effective → expired/reversed |
| Evidence Observation | A source-dated fact, estimate, market proxy, or contextual prior supporting or challenging a hypothesis | pending → current → stale → superseded/retracted |
| Transmission Hypothesis | A falsifiable explanation linking a catalyst to one or more exposures through a named mechanism | draft → evidenced → watch → confirmed → contradicted → falsified/expired |
| Exposure Map | The sectors, factors, countries, commodities, or instruments expected to benefit, suffer, or remain neutral under a scenario | versioned when composition or mechanism changes |
| Regime State | The growth, inflation, liquidity/rate, volatility/gamma, correlation/dispersion, and credit backdrop that conditions transmission | observed per decision window; changes are timestamped |
| Fundamental State | Earnings revisions, guidance, margins, valuation, balance-sheet, credit, and supply/demand evidence for an exposure | current → stale → refreshed; never silently neutral |
| Positioning State | Options, disclosed flows, leverage, cash-allocation proxies, breadth, and crowding evidence | observed → stale; source delay remains visible |
| Market Confirmation State | Relative-strength acceleration, trend, breadth, price/volume, correlation, and option-level confirmation | emerging → confirming → established → weakening → invalidated |
| Rotation Candidate | A user-facing synthesis of one hypothesis across the four clocks | cause-emerging → watch → confirmable → established → contradicted/falsified |
| Evidence Cluster | Observations sharing the same causal origin, used to prevent double-counting | open while underlying event remains active; merged or closed explicitly |
| Decision Record | What the user or brief could know, the stage assigned, and the confirmation/invalidation conditions at that time | append-only outcome history |

### Relationships

- A Catalyst Event may generate multiple mutually exclusive scenarios.
- A Transmission Hypothesis links exactly one primary causal mechanism to one or more Exposure Maps and may cite multiple Evidence Observations.
- Evidence Observations belong to Evidence Clusters; observations in one cluster count as one line of confirmation.
- Regime State modifies the expected direction, magnitude, timing, and confidence of a Transmission Hypothesis.
- Fundamental, Positioning, and Market Confirmation states may support or contradict the hypothesis independently.
- A Rotation Candidate exposes the state of the four clocks without erasing disagreement between them.
- A Decision Record freezes the evidence set and stage at a decision timestamp so later evaluation cannot rewrite history.

### Business Policies

1. **Chronology before explanation:** evidence published after a decision timestamp cannot support that decision record.
2. **Primary-cause discipline:** each candidate names one primary mechanism; secondary observations are labeled confirmation, contradiction, or context.
3. **Independence accounting:** price reaction, options reaction, and ETF activity caused by the same announcement do not count as three independent reasons.
4. **Regime conditioning:** no catalyst has a universal sector effect. The candidate shows how its transmission changes across the current and at least one plausible alternative regime.
5. **Sensitivity integrity:** discovery sensitivity changes visibility and minimum confirmation stage only. It cannot admit missing-source evidence, expired observations, or a candidate without invalidation.
6. **Seasonality restraint:** calendar and election-cycle evidence modifies prior confidence only when sample size, period definition, dispersion, and present-regime compatibility are shown.
7. **Proxy honesty:** OBV, dollar volume, disclosed ETF data, put/call, margin debt, cash allocation, dark-pool, and futures-linked products are labeled by what they actually measure and their delay.
8. **Contradiction preservation:** disagreement among causal, fundamental, positioning, and market clocks remains visible; it is not averaged away.
9. **No forced action:** a useful output may be “cause emerging, market unconfirmed,” “market moving, cause unknown,” or “no candidate clears the evidence bar.”
10. **Outcome accountability:** confirmed and falsified candidates remain queryable with their original evidence and thresholds.

## Actors & Personas

| Actor | Description | Key Goals | Permission Boundary |
| --- | --- | --- | --- |
| Rotation Trader | Makes days-to-months relative allocation decisions among sector, factor, country, and real-asset vehicles | Discover a plausible rotation before it is established; time entry and exit; avoid reflex bounces | May tune sensitivity and record decisions; may not convert unverified claims into facts |
| Macro/Fundamental Researcher | Studies policy, central-bank, credit, earnings, supply, valuation, and geopolitical transmission | Build and challenge causal hypotheses; maintain source/freshness; compare regime effects | May add or update evidence and scenarios; cannot certify market confirmation |
| Risk Manager | Oversees concentration, crowding, leverage, event, and regime risk | Identify when an emerging thesis conflicts with price structure or depends on one fragile assumption | May suppress action and require stronger confirmation; cannot rewrite source history |
| Market Brief Analyst | Produces the low-noise next-session synthesis | Elevate only candidates that change the plan; preserve watches and contradictions without clutter | May consume normalized reads and verified research; cannot invent missing inputs or silently contradict owning tools |
| Strategic Allocator | Reviews quarterly cycle, valuation, and policy context | Distinguish transient tactical moves from durable cycle shifts | Uses slower confirmation settings; cannot treat tactical options/flow as strategic proof |

## Use Cases

### UC-001: Discover an emerging causal rotation

- **Actor:** Rotation Trader
- **Preconditions:** At least one current, source-dated catalyst or fundamental change maps to an exposure; market confirmation may be absent.
- **Main Flow:**
  1. The actor selects a sleeve and discovery sensitivity.
  2. The system ranks cause-emerging candidates by evidence quality, regime fit, time-to-effect, and contradiction state.
  3. The actor opens a candidate and sees the four clocks separately.
  4. The system states what market behavior would confirm the candidate and what evidence would falsify it.
- **Alternative Flows:** If only price has moved, the candidate is labeled “market moving, cause unverified.” If causal evidence is stale, the candidate remains visible only as stale context.
- **Postconditions:** The actor has a watch candidate, not an implied trade, unless confirmation requirements are met.

### UC-002: Explain and challenge a policy-driven rotation

- **Actor:** Macro/Fundamental Researcher
- **Preconditions:** A policy, regulatory, fiscal, trade, or central-bank event has a credible source and lifecycle state.
- **Main Flow:**
  1. The researcher records scenarios rather than one predicted outcome.
  2. Each scenario maps to affected exposures and a transmission mechanism.
  3. The current regime modifies expected direction, timing, and strength.
  4. Contradictory fundamental or market evidence is attached and remains visible.
- **Alternative Flows:** A proposal without an effective date remains a proposed catalyst; a rumor remains unverified and cannot elevate a candidate.
- **Postconditions:** The policy hypothesis is falsifiable, source-dated, and ready for timing confirmation.

### UC-003: Distinguish a semiconductor repair from a reflex bounce

- **Actor:** Rotation Trader
- **Preconditions:** Semiconductor breadth and price are recovering after a sharp decline.
- **Main Flow:**
  1. The actor compares breadth washout and market structure with earnings revisions, guidance, valuation, and demand/supply evidence.
  2. The system shows whether the causal/fundamental clock is improving, flat, or deteriorating.
  3. The actor sees confirmation thresholds such as revision breadth stabilizing and relative strength reclaiming structure.
- **Alternative Flows:** Oversold breadth with falling estimates is labeled a reflex-bounce risk; improving estimates without market confirmation is labeled cause-emerging.
- **Postconditions:** The actor can distinguish setup, watch, and trap without a hindsight narrative.

### UC-004: Interpret financial-sector leadership

- **Actor:** Rotation Trader or Risk Manager
- **Preconditions:** Financial-sector acceleration improves while longer-horizon relative strength is weak or mixed.
- **Main Flow:**
  1. The system separates proposed deregulation, enacted policy, rate-curve changes, loan/deposit evidence, capital-markets activity, credit spreads, and debt issuance.
  2. It identifies which financial subsectors the mechanism actually affects.
  3. It shows the earnings/event calendar and market confirmation clock.
  4. It states what would turn fresh leadership into a durable handoff.
- **Alternative Flows:** If broad financials move but evidence applies only to banks, the exposure mismatch is flagged.
- **Postconditions:** The user understands the XLF thesis, its scope, and its credit/regime risks.

### UC-005: Interpret energy equities diverging from commodities

- **Actor:** Macro/Fundamental Researcher
- **Preconditions:** Energy equities, oil-service equities, spot proxies, or longer-dated commodity expectations diverge.
- **Main Flow:**
  1. The system shows the divergence across equity, commodity, and curve-sensitive proxies.
  2. The researcher evaluates supply, inventory, policy, geopolitical, capital-discipline, and earnings explanations.
  3. The current inflation/growth regime conditions the transmission.
  4. The system distinguishes a durable equity cash-flow re-rating from a short-lived spot dislocation.
- **Alternative Flows:** If futures-curve or inventory evidence is unavailable, the cause remains unverified rather than inferred from XLE price.
- **Postconditions:** The candidate has explicit evidence needs and falsifiers.

### UC-006: Use seasonality and election cycles responsibly

- **Actor:** Strategic Allocator or Market Brief Analyst
- **Preconditions:** A seasonal or election-cycle pattern is relevant to the current window.
- **Main Flow:**
  1. The actor sees the historical sample definition, count, median, dispersion, and adverse outcomes.
  2. The system compares the present regime with historical regimes.
  3. The seasonal prior is labeled supportive, contradictory, or not comparable.
- **Alternative Flows:** A small, unstable, or regime-mismatched sample is demoted to context.
- **Postconditions:** Seasonality informs confidence but cannot create an action by itself.

### UC-007: Publish a causal candidate to the Market Brief

- **Actor:** Market Brief Analyst
- **Preconditions:** A normalized candidate exists with source/freshness, stage, regime, contradiction, and confirmation/invalidation fields.
- **Main Flow:**
  1. The brief compares the candidate with the current owning-tool market read.
  2. It elevates the candidate only if it changes or independently confirms/falsifies the near-term plan.
  3. Otherwise it records a concise coverage reason without adding an action card.
- **Alternative Flows:** If the candidate is cause-emerging but market-unconfirmed, it remains a watch item in the owning tool.
- **Postconditions:** The brief remains actionable and low-noise while preserving causal context.

## Requirements

### Causal Evidence and Lifecycle

- **FR-001:** The product must let users create, inspect, update, and challenge causal rotation hypotheses for sectors, factors, countries, thematic groups, and real assets.
- **FR-002:** Every evidence observation must show source identity, evidence class, publication time, effective time when applicable, observation period, freshness/expiry, and whether it is fact, estimate, proxy, scenario, or contextual prior.
- **FR-003:** Policy and regulatory events must distinguish proposed, scheduled, announced, enacted, effective, expired, reversed, and unverified states.
- **FR-004:** A candidate must name one primary transmission mechanism and show all supporting, contradictory, and missing evidence without averaging contradictions away.
- **FR-005:** The product must group observations sharing one underlying event or dependency and display the number of independent evidence clusters.
- **FR-006:** A candidate must expire or be revalidated when its catalyst, regime, evidence, or expected transmission window expires.
- **FR-007:** The product must preserve an append-only decision record containing the evidence and thresholds available at that time.

### Four-Clock Early Rotation Model

- **FR-008:** Every candidate must display separate catalyst, fundamental, positioning, and market-confirmation clocks.
- **FR-009:** Candidate stages must include cause-emerging, watch, confirmable, established, contradicted, falsified, and expired.
- **FR-010:** A cause-emerging stage may precede price confirmation but must include a named expected transmission window and confirmation/invalidation conditions.
- **FR-011:** A market move without sufficient causal evidence must be labeled “cause unverified,” not assigned a post-hoc explanation.
- **FR-012:** Established market leadership without remaining entry edge must be distinguishable from an emerging candidate with runway.
- **FR-013:** The user must be able to compare the candidate stage with the existing RRG state, structural trend, breadth, volume/flow proxy, options state, and correlation divergence.

### Sensitivity and Decision Policy

- **FR-014:** A sensitivity control must offer at least discovery, balanced, and confirmation postures.
- **FR-015:** Higher discovery sensitivity may surface earlier lifecycle stages and lower market confirmation, but must not reduce source quality, freshness, independence, contradiction, or invalidation requirements.
- **FR-016:** The product must explain exactly which stage/evidence threshold changed when sensitivity changes.
- **FR-017:** No sensitivity posture may convert a watch item into an action when all confirmation comes from one evidence cluster.
- **FR-018:** The risk manager must be able to require stronger confirmation for crowded, leveraged, event-dependent, or regime-fragile candidates.

### Regime-Conditioned Transmission

- **FR-019:** Every hypothesis must state its expected effect under the current growth, inflation, liquidity/rate, volatility/gamma, correlation/dispersion, and credit backdrop.
- **FR-020:** The product must show at least one plausible alternative regime where the same catalyst has a different consequence.
- **FR-021:** A regime change must trigger candidate reassessment without rewriting the original decision record.
- **FR-022:** The product must distinguish policy-path repricing from the policy decision itself.

### Fundamentals, Valuation, Credit, and Supply

- **FR-023:** The product must support earnings/guidance changes, revision breadth, margin direction, and valuation context as separate evidence classes.
- **FR-024:** Valuation views must show metric definition, historical window, current percentile or band, and whether the metric is trailing, forward, estimated, or analyst-derived.
- **FR-025:** Forward valuation must not appear current when its estimate date or provider is unknown.
- **FR-026:** Credit evidence must distinguish debt issuance demand, leverage, refinancing exposure, loan/deposit conditions, and market credit-spread proxies.
- **FR-027:** Supply/demand evidence must distinguish spot price, longer-horizon expectations, inventory, curve structure, supplier constraints, and equity cash-flow effects when available.
- **FR-028:** Exposure mismatch must be flagged when a catalyst applies to only part of a broad ETF or group.

### Policy, Geopolitics, Seasonality, and Elections

- **FR-029:** Policy and geopolitical inputs must be represented as dated scenarios with credible sources, affected exposures, transmission mechanisms, and falsifiers.
- **FR-030:** Unverified rumors may be recorded for awareness but cannot raise candidate confidence or actionability.
- **FR-031:** Seasonality and election-cycle views must show sample count, date definition, central tendency, dispersion, adverse-tail behavior, and regime comparability.
- **FR-032:** Seasonal and election-cycle evidence may only modify a candidate's prior confidence; it cannot be the sole primary cause or confirmation.
- **FR-033:** The product must distinguish calendar seasonality, earnings-season effects, fiscal-year effects, and election-cycle effects.

### Positioning, Options, Flows, and Leverage

- **FR-034:** The product must label each positioning input by what it measures, its delay, and whether it is observed or proxied.
- **FR-035:** Options activity must remain positioning/tactical evidence and may not establish fundamental causation.
- **FR-036:** ETF inflow/outflow, dark-pool, cash-allocation, margin-use, and leverage claims must be omitted or marked unavailable when no verifiable source and timestamp exist.
- **FR-037:** The product must show when crowding or leverage makes an otherwise supported candidate asymmetric or fragile.

### Decision Views and Charts

- **FR-038:** The default view must show a ranked early-candidate queue, current stage, primary cause, regime fit, independent confirmation count, contradiction count, time-to-effect, confirmation, and invalidation.
- **FR-039:** A candidate detail view must show a chronological catalyst/evidence timeline and freeze what was known at each decision record.
- **FR-040:** The product must provide a four-clock evidence view that preserves disagreement among causal, fundamental, positioning, and market confirmation.
- **FR-041:** The product must provide a regime-conditioned sector transmission matrix.
- **FR-042:** The product must provide valuation-band and earnings-revision-breadth charts when those inputs are available.
- **FR-043:** The product must provide a credit-pulse view covering spread direction, issuance/refinancing context, and staleness when those inputs are available.
- **FR-044:** The product must provide equity-versus-underlying divergence views for relevant real-asset sectors, including the limitations of spot and futures-linked proxies.
- **FR-045:** The product must provide seasonality/election-cycle distributions with sample size and dispersion, not only an average path.
- **FR-046:** Every chart must state what decision it supports, the current interpretation, source date, and what would invalidate the interpretation.

### Cross-Tool Integration

- **FR-047:** The dedicated Causal Rotation Lab must own hypothesis lifecycle, evidence provenance, regime transmission, and outcome history.
- **FR-048:** Sector Rotation must remain the owner of relative-strength timing and consume a normalized causal stage without recomputing causal evidence.
- **FR-049:** Global Rotation and Real Assets may consume the same causal capability for country and commodity-linked hypotheses while retaining their own market models.
- **FR-050:** The Market Brief must consume normalized causal reads and elevate only candidates that change, independently confirm, or falsify the near-term plan.
- **FR-051:** Brief actions based on a causal candidate must include primary cause, stage, evidence as-of, regime, confirmation trigger, invalidation, and owning-tool deep link.
- **FR-052:** The brief must not count a causal hypothesis and its resulting price/options reactions as multiple independent reasons.

### Outcome Learning

- **FR-053:** The product must track whether each candidate confirmed, falsified, expired, or remained unresolved within its expected window.
- **FR-054:** Outcome views must include misses and false positives, not only successful examples.
- **FR-055:** Sensitivity performance must be evaluated without retroactively changing the original thresholds or evidence set.
- **FR-056:** Historical comparisons must prevent survivorship and look-ahead bias and must state when the available history is insufficient.

## Business Scenarios

### BS-001: Cause emerges before price confirmation

```gherkin
Scenario: Policy catalyst creates an early watch candidate
  Given a source-dated policy event has a plausible sector transmission mechanism
  And the current regime supports that mechanism
  And market relative strength has not yet confirmed
  When the user selects discovery sensitivity
  Then the candidate appears as cause-emerging rather than actionable
  And the product shows its expected transmission window, confirmation trigger, and invalidation
```

### BS-002: Price moves before cause is known

```gherkin
Scenario: Market acceleration has no verified causal explanation
  Given a sector's relative-strength acceleration turns positive
  And available causal observations are missing, stale, or contradictory
  When the candidate is evaluated
  Then the product labels the move as cause unverified
  And it does not invent or select a causal narrative from the price move
```

### BS-003: Financial rotation is scoped to the mechanism

```gherkin
Scenario: Broad financial ETF moves on a bank-specific policy hypothesis
  Given a credible regulatory or rate-path catalyst primarily affects banks
  And a broad financial ETF also contains non-bank exposures
  When the financial rotation candidate is shown
  Then the product flags the exposure mismatch
  And separately shows credit, loan/deposit, earnings, and market-confirmation evidence
```

### BS-004: Energy equities diverge from oil

```gherkin
Scenario: Energy-equity leadership diverges from the commodity proxy
  Given energy equities strengthen while the selected oil proxy remains weak
  When the user opens the candidate
  Then the product shows the equity-versus-underlying divergence
  And distinguishes supply, inventory, policy, curve, capital-discipline, and earnings explanations by evidence availability
  And leaves the cause unverified when the required evidence is absent
```

### BS-005: Semiconductor bounce is challenged by fundamentals

```gherkin
Scenario: Oversold semiconductor breadth rebounds while revisions deteriorate
  Given semiconductor breadth records a washout and begins to recover
  And earnings revisions or guidance continue to weaken
  When the candidate is evaluated
  Then the product labels reflex-bounce risk rather than durable repair
  And requires both fundamental stabilization and market confirmation before promotion
```

### BS-006: Regime changes catalyst consequences

```gherkin
Scenario: The same rate-path repricing has different sector effects by regime
  Given a rate-path repricing is observed
  And the current regime differs from the prior decision record
  When the transmission hypothesis is recalculated
  Then the product shows the current and prior regime consequences separately
  And preserves the original decision record unchanged
```

### BS-007: Sensitivity reveals earlier evidence without weakening quality

```gherkin
Scenario: User increases discovery sensitivity
  Given a candidate has current source-dated causal evidence and an explicit invalidation
  But market confirmation is incomplete
  When the user changes sensitivity from confirmation to discovery
  Then the candidate becomes visible at its earlier lifecycle stage
  And provenance, freshness, independence, contradiction, and invalidation requirements remain unchanged
```

### BS-008: Seasonality cannot create a trade

```gherkin
Scenario: Election-cycle history supports a sector but current evidence disagrees
  Given an election-cycle sample has a positive historical median for the sector
  And current regime or fundamental evidence contradicts that prior
  When the candidate is evaluated
  Then seasonality is shown as a contextual prior with sample and dispersion
  And it cannot promote the candidate into an action
```

### BS-009: Correlated evidence is not double-counted

```gherkin
Scenario: One announcement moves price, options, and ETF activity
  Given price, options, and ETF activity respond to the same announcement
  When confidence is calculated
  Then those observations belong to one evidence cluster
  And the product reports one primary reason with market reactions as confirmation
```

### BS-010: Stale fundamental data remains visible

```gherkin
Scenario: Forward valuation has no current estimate timestamp
  Given a forward valuation observation lacks a current provider timestamp
  When a candidate uses valuation context
  Then the valuation is labeled stale or unavailable
  And it cannot be treated as current confirmation
```

### BS-011: Market Brief keeps cause-emerging candidates low-noise

```gherkin
Scenario: Causal candidate does not change the next-session plan
  Given a normalized cause-emerging candidate exists
  And it neither changes nor independently confirms or falsifies the next-session plan
  When the Market Brief is authored
  Then the candidate remains in owning-tool coverage
  And it does not consume an action or attention slot
```

### BS-012: Outcome history exposes false positives

```gherkin
Scenario: Early candidate fails within its expected window
  Given a candidate was recorded with its evidence, thresholds, and invalidation
  And the invalidation occurs before confirmation
  When outcomes are reviewed
  Then the candidate is shown as falsified
  And the original evidence and sensitivity settings remain visible
```

## Competitive Analysis

| Capability | Research Lab Today | TradingView Heatmap | Finviz Groups | Morningstar Markets | State Street Sector Tracker | Opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| Current sector performance | Strong RRG, breadth, and relative analysis | Strong visual heatmap | Strong multi-horizon performance tables | Market/sector overview | Sector/fund reference | Already competitive |
| Valuation context | Missing at sector level | Limited in heatmap | Valuation tab exists | Fair-value and valuation barometers | Fund facts | Add source-dated valuation bands tied to rotation candidates |
| Fundamental/news context | Free-form Brief narrative | Separate chart/news experience | Separate tabs | Editorial topics, earnings, rates, tariffs | Product disclosures | Convert context into falsifiable, lifecycle-managed hypotheses |
| Early rotation timing | RRG acceleration and early states | Current-state visual | Multi-horizon performance | Editorial interpretation | Not a timing tool | Preserve timing advantage while adding causal clocks |
| Policy/regime transmission | Narrative only | Not intrinsic to heatmap | Not intrinsic to performance table | Editorial coverage by topic | Risk disclosures | Transparent regime-conditioned transmission is the differentiator |
| Evidence provenance and expiry | Partial staleness labels | Source-dependent | Source-dependent | Editorial timestamps | Regular-update disclaimers | Make source/effective/expiry mandatory per observation |
| Sensitivity with integrity | Tempo/confirmation controls for RRG | Display controls | View controls | Screening/barometer controls | None evident | Discovery sensitivity that cannot weaken evidence quality |
| Outcome accountability | Brief history lacks causal outcomes | None evident | None evident | Editorial track record not candidate ledger | None | Append-only false-positive and falsification history |

**Competitive conclusion:** Existing products separate market state, valuation, and editorial context. The opportunity is not to replicate a larger dashboard; it is to join evidence chronology, regime transmission, early timing, contradiction, and outcome accountability in one transparent workflow.

## Transcript Idea Assessment

| Transcript Idea | Decision | Product Treatment |
| --- | --- | --- |
| Sector breadth washout and dead-cat bounce risk | Accept | Market confirmation plus revisions/guidance contradiction; never call a bottom from breadth alone |
| Bank earnings as credit/debt health read | Accept | Event/fundamental evidence for XLF with subsector exposure and credit regime |
| Debt issuance demand and IPO oversubscription | Accept with constraints | Credit/liquidity context; issuer-specific demand does not prove system-wide liquidity by itself |
| Forward P/E and multiple compression | Accept | Source-dated valuation band plus growth/revision context; no stale forward estimate presented as live |
| Options-implied earnings moves | Accept | Event-risk/tactical clock; not causal fundamental evidence |
| Buffett cash allocation | Demote | Slow, mandate-specific contextual risk signal; not a market-timing cause |
| Hindenburg Omen count | Demote | Risk-cluster context requiring independent confirmation and documented false-positive history |
| Retail cash allocation and leveraged ETF growth | Accept as fragility context | Crowding/leverage state with source delay; cannot determine direction by itself |
| Dark-pool clusters | Reject unless verifiable | Omit when source, direction classification, timestamp, and methodology are unavailable |
| Gold and bitcoin ETF flows | Accept only with verified source | Positioning evidence with exact window and delay; never inferred from price |
| Energy equities versus spot oil and longer-dated expectations | Accept | Dedicated divergence hypothesis with curve/proxy limitations and supply/fundamental evidence needs |
| Mid-July and midterm-year seasonality | Accept as prior only | Distribution, sample size, dispersion, regime comparison; never a primary trade reason |
| Election-cycle policy effects | Accept as scenario context | Named policy channels and dates, not deterministic presidential-cycle claims |
| Fed technology/AI task-force claim | Treat as unverified transcript claim | No product confidence until a credible primary source and effective consequence are recorded |
| “Markets can run longer” | Accept as risk principle | Sensitivity and invalidation prevent valuation context from becoming premature timing |

## Platform Direction & Market Trends

### Industry Trends

| Trend | Status | Relevance | Impact on Product |
| --- | --- | --- | --- |
| Combining quantitative screens with narrative research | Established | High | Requires clear boundary between observed signal and interpreted cause |
| Source/freshness transparency | Growing | High | Provenance and expiry become first-class user-visible fields |
| Regime-conditioned allocation | Growing | High | Static catalyst-to-sector mappings are insufficient |
| Event and policy scenario timelines | Growing | High | Scheduled decisions can be monitored before market confirmation without predicting outcomes |
| Explainable multi-signal scoring | Established | High | Independence and contradiction matter more than adding signal count |
| AI-generated market explanations | Growing | High | Anti-hindsight, source validation, and outcome history are essential trust controls |

### Strategic Opportunities

| Opportunity | Type | Priority | Rationale |
| --- | --- | --- | --- |
| Evidence-tagged causal rotation lifecycle | Differentiator | High | Directly addresses why-now and early-entry needs without weakening timing discipline |
| Four-clock candidate view | Differentiator | High | Makes cause/confirmation disagreement decision-useful |
| Source-dated valuation/revision/credit context | Table Stakes | High | Competitors already pair performance with valuation or editorial context |
| Regime-conditioned policy transmission | Differentiator | High | Prevents universal sector rules and creates falsifiable scenarios |
| Seasonality/election distribution view | Table Stakes with restraint | Medium | Useful context only when sample/dispersion and regime comparability are explicit |
| Candidate outcome/falsification ledger | Differentiator | High | Exposes false positives and prevents selective memory |

### Recommendations

1. **Immediate:** Establish the causal evidence contract, lifecycle, four-clock view, sensitivity integrity, and Brief handoff.
2. **Near-term:** Add source-dated valuation, earnings-revision, policy-calendar, and credit-pulse observations where trustworthy data exists.
3. **Strategic:** Evaluate regime-conditioned event studies and election/seasonality distributions only after the outcome ledger can prevent look-ahead and survivorship bias.

## Improvement Proposals

### IP-001: Dedicated Causal Rotation Lab — Competitive Edge

- **Impact:** High
- **Effort:** Large
- **Competitive Advantage:** Joins source-dated catalysts, fundamental transmission, regime dependence, market timing, contradiction, and outcome accountability without hiding disagreement in one score.
- **Actors Affected:** Rotation Trader, Macro/Fundamental Researcher, Risk Manager, Market Brief Analyst, Strategic Allocator
- **Business Scenarios:** BS-001 through BS-012

### IP-002: Four-Clock Early Candidate Queue

- **Impact:** High
- **Effort:** Medium
- **Competitive Advantage:** Shows whether cause, fundamentals, positioning, or market confirmation is leading, making “too early” and “too late” visible.
- **Actors Affected:** Rotation Trader, Risk Manager
- **Business Scenarios:** BS-001, BS-002, BS-005, BS-007

### IP-003: Regime-Conditioned Policy Transmission Map

- **Impact:** High
- **Effort:** Medium
- **Competitive Advantage:** Replaces simplistic “rate hikes help banks” or “tariffs hurt tech” rules with scenario-specific, regime-dependent exposure maps.
- **Actors Affected:** Macro/Fundamental Researcher, Market Brief Analyst
- **Business Scenarios:** BS-003, BS-006

### IP-004: Valuation, Revision, and Credit Evidence Views

- **Impact:** High
- **Effort:** Large
- **Competitive Advantage:** Connects early market bends to source-dated fundamental evidence while preserving unavailable/stale states.
- **Actors Affected:** Rotation Trader, Fundamental Analyst, Strategic Allocator
- **Business Scenarios:** BS-003, BS-005, BS-010

### IP-005: Outcome and False-Positive Ledger

- **Impact:** High
- **Effort:** Medium
- **Competitive Advantage:** Makes early-signal quality auditable and prevents successful anecdotes from hiding failed hypotheses.
- **Actors Affected:** All actors
- **Business Scenarios:** BS-012

### IP-006: Market Brief Causal Gate

- **Impact:** High
- **Effort:** Medium
- **Competitive Advantage:** Keeps the Brief low-noise while making primary cause, independence, regime, and falsification enforceable rather than prose conventions.
- **Actors Affected:** Market Brief Analyst, Risk Manager
- **Business Scenarios:** BS-009, BS-011

## UI Scenario Matrix

| Scenario | Actor | Entry Point | Steps | Expected Outcome | Screen(s) |
| --- | --- | --- | --- | --- | --- |
| Find earliest candidates | Rotation Trader | Causal Rotation Lab | Select sleeve and discovery sensitivity; rank candidates; open one | Cause-emerging candidates appear with four clocks and no implied action | Candidate queue, candidate detail |
| Challenge XLF thesis | Researcher | Candidate detail | Inspect policy lifecycle, rates/curve, credit, earnings, exposure map | Bank-specific versus broad-financial transmission and contradictions are clear | Evidence timeline, transmission map |
| Distinguish semiconductor bounce | Trader | Candidate detail from Sector Rotation | Compare washout, revisions, valuation, guidance, and RRG state | Candidate reads repair, reflex-bounce risk, or unverified with explicit thresholds | Four-clock view, valuation/revision charts |
| Adjust sensitivity | Trader | Candidate queue | Switch discovery/balanced/confirmation | Visibility/stage threshold changes are explained; evidence-quality rules do not | Candidate queue, threshold explanation |
| Review election seasonality | Allocator | Candidate context | Open seasonality distribution and regime comparison | Sample count, median, dispersion, adverse tail, and current comparability appear | Seasonality distribution |
| Publish to Brief | Brief Analyst | Brief authoring workflow | Consume normalized read; compare to next-session plan | Candidate is elevated only when plan-relevant, otherwise coverage reason is recorded | Market Brief, owning-tool deep link |
| Audit past calls | Risk Manager | Outcome history | Filter by sensitivity, sector, stage, and result | Wins, false positives, falsifications, and expired candidates remain visible | Outcome ledger |

## Non-Functional Requirements

- **NFR-001 Performance:** A cached candidate queue must become usable without waiting for external research refresh; stale/missing evidence updates independently without blanking available clocks.
- **NFR-002 Accessibility:** Stages, evidence classes, confidence, contradictions, and chart meaning must be conveyed by text and structure, not color alone. All sensitivity and filter controls require keyboard and assistive-technology labels.
- **NFR-003 Explainability:** Every score or stage must expose its contributing evidence clusters, exclusions, contradictions, and threshold policy.
- **NFR-004 Freshness:** Every observation and candidate must show the oldest decision-critical input and the next required refresh or event.
- **NFR-005 Reliability:** A failed external source must produce an explicit unavailable/stale state and must not silently reuse an expired value as current.
- **NFR-006 Privacy:** No portfolio size, cost basis, P&L, or private research credential is committed or embedded in a shared candidate.
- **NFR-007 Auditability:** Decision records and subsequent outcomes must be append-only from the user's perspective; corrections create new records rather than rewriting history.
- **NFR-008 Scalability:** The capability vocabulary must support sectors, factors, countries, thematic baskets, and real assets without provider-specific business rules.
- **NFR-009 Data Integrity:** Market proxies, analyst estimates, issuer facts, policy facts, scenarios, and seasonal priors must remain distinguishable throughout the workflow.
- **NFR-010 Low Noise:** The default candidate queue and Brief integration must favor decision relevance over signal count; “nothing clears the bar” is valid.

## Assumptions and Open Questions

1. **Data availability:** Reliable free historical sector forward P/E and consensus-revision series may not exist at the required freshness. The product must support unavailable or manually verified observations without presenting fabricated continuity.
2. **Policy sources:** Primary-source policy calendars are preferred, but sector-impact mappings remain hypotheses and require explicit assumptions.
3. **Flow data:** Real ETF creation/redemption and institutional-flow data may require licensed sources. Free price/volume proxies cannot be relabeled as inflows.
4. **Election studies:** Exact study window, sector taxonomy continuity, and regime stratification materially change results; the study contract must be settled before claims are displayed.
5. **Sensitivity calibration:** Initial thresholds require prospective outcome history. They must be labeled policy choices until enough decision records exist for evaluation.
6. **Scope of first release:** The minimum coherent release must include the evidence contract, lifecycle, four-clock view, sensitivity integrity, at least one policy/credit example and one earnings/valuation example, Sector timing handoff, Brief handoff, and outcome ledger. A broad dashboard with empty evidence categories would fail the Outcome Contract.

## Change Magnitude Decision

**Sizable — create and deliver as a separate feature/tool.** The work introduces a new actor workflow, reusable evidence/lifecycle model, cross-tool contracts, multiple new views, outcome history, and changes to Sector Rotation and Market Brief behavior. It cannot be safely represented as a minor extension to the current price-based rotation tool.

## Acceptance Criteria

- AC-001 maps to BS-001 and BS-007: discovery sensitivity surfaces cause-emerging candidates without weakening evidence-quality rules.
- AC-002 maps to BS-002: a price-led move with no verified cause is explicitly labeled cause unverified.
- AC-003 maps to BS-003: broad-ETF exposure mismatch is visible for a bank-specific XLF hypothesis.
- AC-004 maps to BS-004: energy-equity divergence is shown without inferring missing supply/curve evidence.
- AC-005 maps to BS-005: an oversold semiconductor rebound with deteriorating revisions is classified as reflex-bounce risk.
- AC-006 maps to BS-006: regime changes update current transmission while preserving prior decision records.
- AC-007 maps to BS-008: seasonality/election evidence cannot independently promote an action.
- AC-008 maps to BS-009: observations caused by one announcement count as one evidence cluster.
- AC-009 maps to BS-010: stale or untimestamped forward valuation cannot count as current confirmation.
- AC-010 maps to BS-011: the Brief omits plan-irrelevant cause-emerging candidates from action/attention slots while recording coverage.
- AC-011 maps to BS-012: falsified and expired candidates remain visible with original evidence and sensitivity.
- AC-012 maps to the Outcome Contract: every elevated candidate exposes source/freshness, stage, four clocks, regime, contradictions, confirmation, invalidation, and ownership deep link.

## Analyst Evidence Notes

- Current capability claims were derived from `sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html`, `market-brief.config.json`, `market-brief.payload.json`, `notes/sector-research-lab.md`, and `notes/market-brief.md` during the 2026-07-12 analysis run.
- Competitive observations were captured from TradingView Stock Heatmap, Finviz Groups, Morningstar Markets, and the State Street sector tracker landing/terms surface. Koyfin retrieval failed with an SSL protocol error and no Koyfin capability claim is made.
- Transcript-specific factual assertions are not certified by this spec. They are accepted, demoted, rejected, or marked unverified as product-input ideas only.
