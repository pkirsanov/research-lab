# Design: 034 AI Opportunity Intelligence Lab

## Design Brief

### Current State

The accepted proposal and [spec.md](spec.md) describe recurring AI opportunity intelligence, but no Feature 034 tool is registered. [rlexperience.js](../../rlexperience.js) supplies the ordinary four-view shell. [rlagenda.js](../../rlagenda.js) supplies content-addressed research lineage, but its active subject is a topic. [scripts/company-intelligence-publication.mjs](../../scripts/company-intelligence-publication.mjs) supplies pointer-last publication for one explicit company policy.

The imported research spans 23 industries, 230 memberships, 196 original entities, and 197 assessments. Those counts are preservation obligations, not claims that 197 forensic dossiers are current. Feature 020 routing is not a usable delivery shortcut. Feature 032 is independent Company Intelligence delivery work: Feature 034 may reuse already-delivered shared publication primitives, but it does not depend on Feature 032's unfinished company-specific public registration.

### Target State

Feature 034 owns a separate, build-free company-sector research graph. A headless regeneration imports or reads the preserved corpus, refreshes selected source classes, constructs typed evidence and model records, and validates one full-universe generation. A pointer-last transaction publishes that generation with its owner read and Brief.

The browser reads one published generation for Simple, Power, Brief, and Journey. In-tool notifications remain visible when external routing refuses or is unavailable. Every forecast and later outcome retains a separate immutable record.

### Patterns to Follow

- Use [rlexperience.js](../../rlexperience.js) and [rlviews.js](../../rlviews.js) for the ordinary Simple, Power, Brief, Journey view set.
- Use [rlagenda.js](../../rlagenda.js) immutable identifiers, predecessor checks, explicit unavailable states, and dated corrections.
- Use [rldata.js](../../rldata.js) `tool-model-read/v1` source-owner validation for the compact downstream read.
- Use [scripts/brief-author.mjs](../../scripts/brief-author.mjs) frozen owner-read, evidence identity, and claim-mapping rules for any authored compact Brief projection.
- Use [scripts/brief-publication.mjs](../../scripts/brief-publication.mjs) pointer-last staging and exact-byte readback as the publication pattern.
- Thread new domain entities through the project SST in [config/domain-model.yaml](../../config/domain-model.yaml) during implementation.

### Patterns to Avoid

- Do not widen `rlagenda.js` topic IDs into company IDs. Its topic registry and model vocabulary would hide security, site, and cohort identity.
- Do not inherit Company Intelligence's one-subject policy or its coupled two-checkout Git transaction wholesale. Feature 034 needs a broad, static owner generation.
- Do not use `rldata.js` local option-cache rows as immutable research evidence. They lack the required quote and source clocks.
- Do not treat a `tool-brief/v2` action state as an investment recommendation. Feature 034 publishes research alerts and abstentions, not portfolio actions.

### Resolved Decisions

- A partial acquisition may publish a full-universe keyed overlay with explicit failed and carried states.
- Atomicity applies to the validated generation, owner read, Brief, and final current selector.
- The new capability owns its domain contracts. Existing tools remain consumers or reference lenses.
- The browser's current generation is a committed static artifact, not a live network response or local-storage cache.
- Public or approved licensed providers implement one acquisition contract. No provider silently substitutes for another.
- The default notification destination is the in-tool lane and owner Brief. External delivery requires Feature 020 admission.
- Missing economics, unmatched denominators, invalid options, or unreconciled expectations produce typed unavailability.

### Open Questions

None blocks technical planning. Source rights are resolved per source-use policy at acquisition time. An external notification channel is not part of this feature's owned delivery contract.

## Purpose And Scope

This design implements FR-034-001 through FR-034-106 and SCN-034-001 through SCN-034-032. It is planning, not a delivered tool. It introduces static owner data, a headless generator, a separate browser route, and read-only projections. It does not modify Features 019, 020, 025, 028, or 032.

The feature owns evidence and conclusions about AI adoption. It does not own source licenses, third-party data truth, trade execution, destination notification gates, or mutable historical-row correction. A source result is evidence only inside its approved rights and measurement scope.

## Architecture Overview

The pipeline has six boundaries:

1. **Import boundary:** Verify the preserved source archive and map stable identities. It never edits imported bytes.
2. **Acquisition boundary:** Run approved source providers against a declared selection and research cutoff. Every requested source returns a result or a named failure.
3. **Review boundary:** Normalize candidate claims, reconcile source clusters, preserve contradictions, and append corrections.
4. **Model boundary:** Derive milestones, economic sensitivities, signals, and forecast eligibility from typed inputs.
5. **Publication boundary:** Freeze candidate bytes, validate corpus coverage and claim links, build owner read and Brief, then advance one selector last.
6. **Reader boundary:** Render all views and exports from the exact selector generation. The browser cannot promote local hypothetical values into published records.

The planned owner modules are `rlaiopportunity.js` for portable pure validation and calculation, `scripts/ai-opportunity-refresh.mjs` for headless orchestration, and `ai-opportunity-intelligence-lab.html` for the browser. The planned static root is `data/ai-opportunity/`. These paths do not exist yet.

### Transaction And Retry Rules

A logical run has one `requestId`, `researchCutoffAt`, selection digest, source-plan digest, and predecessor generation digest. Retrying the same logical run must reproduce the same candidate generation ID. A changed input requires a new request ID. A collision with different bytes refuses.

The generator stages under a task-owned private directory outside the publication root. It writes immutable archive references and generation objects first. It then writes a validated owner read, Brief projection, and manifest. It reads every staged byte back and checks the digest. Only afterward may it replace `data/ai-opportunity/current.json`. A matching `current.js` browser projection binds the same generation and digest and is included in the validation set.

If validation, writeback, stage, commit, or remote acknowledgment fails, the previous committed selector remains authoritative. An uncertain remote outcome cannot start a new logical run until exact ancestry is reconciled. The producer retains a refusal record outside the public current selector.

### Refresh Selection

Each scheduled or manual regeneration declares selected entity IDs, source classes, and a cutoff. The plan prioritizes approaching events and changed critical dependencies. It does not equate selected acquisition with complete forensic coverage. Unselected identities remain carried with their prior `reviewedAt`. Requested failures remain failed with their prior research preserved as dated history, never mislabeled current.

The generator performs a source and event-calendar freshness pass on every regeneration. A rights refusal, network error, parser error, cadence skip, or no relevant row change receives its own result state. A new finalization clock does not refresh an older observation. Weekend market retrieval retains the prior trading-session identity.

## Capability Foundation

### Foundation Contract

| Contract | Responsibility | Consumers |
| --- | --- | --- |
| `ai-opportunity-universe/v1` | Stable identities, memberships, and archive preservation | Import, refresh, every view |
| `ai-opportunity-evidence/v1` | Claim classes, origin clusters, clocks, units, and conflicts | Models, signals, Power |
| `ai-opportunity-provider/v1` | Rights-qualified acquisition and typed failure result | Headless refresher |
| `ai-opportunity-generation/v1` | One immutable full-universe overlay and derived record graph | Selector, views, exports |
| `ai-opportunity-publication/v1` | Byte inventory, owner-read and Brief coherence, pointer-last admission | Static reader, Market Brief |
| `ai-opportunity-signal/v1` | Research notification state and destination outcome | Brief, in-tool lane, Feature 020 consumer |

The foundation owns identity, unknown-field refusal, claim boundary validation, source-cluster deduplication, clock discipline, model output classes, full-universe preservation, and publication coherence. Concrete source providers cannot relax those rules.

### Extension Points

An acquisition provider receives a signed source-use policy and declared selection. It returns raw reference metadata, typed candidate rows, and rights/storage classification. It cannot directly write a conclusion or current pointer.

A model implementation receives only validated typed inputs and returns calculations, sensitivities, eligible forecasts, or explicit unavailable outputs. It cannot convert an assumption into an observation.

A destination adapter receives a validated read-only signal projection. It may accept or refuse delivery but cannot change the owner's research record.

## Concrete Implementations

### Preserved Archive Importer

The first importer fingerprints repo-local source bytes and maps the historical AIOpportunities archive into identities and assessments. It records 23/230/196/197 counts and the Udemy–Skillsoft distinction. It refuses unknown historical mutation. It does not assign current forensic status merely because an assessment was imported.

### Public Source Provider

The public provider handles approved official records, source documents, and public structured datasets. It records original URL, response digest, row digest, source clocks, access terms, and relevant identity linkage. A response-hash change without a relevant row change is a retrieval change, not a milestone upgrade.

### Approved Licensed Provider

An optional provider implements the same result contract. Its policy may prohibit raw retention or public quotation. That constraint produces reference-only records or an explicit rights refusal. The base tool must remain usable without this provider.

### Reader And Destination Projections

The static reader uses one generation for four views. The compact `tool-model-read/v1` owner projection carries qualifiers and a deep link. An external destination is optional and must return accepted or refused with its own reason. Feature 034 never claims that a planned destination already delivered.

### Variation Axes

| Axis | Options | Foundation-owned invariant |
| --- | --- | --- |
| Source protocol and rights | Local archive, public URL, approved licensed record | Every candidate has rights, publisher, clocks, and a source result |
| Storage behavior | Redistributable snapshot, reference-only hash and excerpt, prohibited | No restricted payload leaks into static public files |
| Measurement type | Stock, flow, capacity, allowance, realized use, estimate | Incompatible types do not combine automatically |
| Delivery | In-tool, owner Brief, gated external destination | Routing refusal preserves owner signal |
| Reader surface | Static browser, compact owner read, structured export | One published generation and lossless qualifiers |

## Data Model And Exact Contracts

The store uses versioned JSON artifacts rather than a new database. Every object has an exact field set for its contract version. Unknown required vocabularies, duplicate IDs, unresolved references, and mixed generation IDs refuse candidate publication. Each availability-governed value uses a value, availability, and reason triplet defined by its record contract. `availability` is `available`, `unavailable`, or `not-applicable`. `available` requires a non-null value and null reason. The other states require a null value and nonempty reason. A nullable relationship or lifecycle boundary may use plain null only when its record contract defines null as absence, not unavailable data. `0` is a measured number only when its source and unit prove zero.

All persisted instants use ISO 8601 UTC with `Z`. Local event times also store an IANA timezone and the original local string. Money and ratios use canonical decimal strings, not binary-float serialized amounts. Rates specify `percent` or `decimal` explicitly. Fingerprints are `sha256:<64 lowercase hex>` over canonical UTF-8 JSON with sorted object keys, sorted identity-keyed arrays, and unchanged archive bytes where applicable. Date windows are closed ISO-date bounds with named controlling gates.

### Archive, Identity, And Universe

| Record, version | Required fields and closed values | Validation |
| --- | --- | --- |
| `ai-opportunity-archive/v1` | `archiveId, importedAt, sourceName, artifactRefs[] {path, sha256, byteLength, rights}, expectedCounts {industries:23, memberships:230, originalEntities:196, assessments:197}, sourceManifestSha256` | Every path is repo-relative and traversal-free; every byte digest matches. |
| `ai-opportunity-industry/v1` | `industryId, slug, label, comparisonBasis, effectiveFrom, effectiveTo` | Exactly 23 imported identities; IDs never renumber silently. |
| `ai-opportunity-entity/v1` | `entityId, legalName, kind, parentEntityId, effectiveFrom, effectiveTo, predecessorIds[], originalCorpusIdentity`; `kind`: public-parent, subsidiary, private-operator, business | Parent cycles refuse. |
| `ai-opportunity-exposure/v1` | `exposureId, entityId, kind, label, geography, effectiveFrom, effectiveTo`; `kind`: company, unit, product, site, customer-cohort | A site or cohort cannot project to parent without an explicit bridge. |
| `ai-opportunity-security/v1` | `securityId, entityId, exchange, symbol, rightsClass, currency, effectiveFrom, effectiveTo, predecessorSecurityId, status`; `status`: verified, inactive, unavailable | Private entities may have no security. Symbol alone is not an identity. |
| `ai-opportunity-membership/v1` | `membershipId, industryId, exposureId, rank, activeFrom, activeTo, originalCorpusIdentity` | Ten active ranks per industry, unique 1–10. Import retains all 230 historical membership identities. |

Stable imported IDs come from a reviewed import mapping, not a ticker guess. IDs have namespace prefixes `industry:`, `entity:`, `exposure:`, `security:`, and `membership:`. A merger or spin creates successors and effective dates. It never rewrites predecessor archive records. Original candidate and assessment counts remain separately queryable from current active ranks.

### Evidence, Source, And Dependency

| Record, version | Required fields | Validation |
| --- | --- | --- |
| `ai-opportunity-source-policy/v1` | `policyId, providerId, sourceClass, publisher, originUrl, accessBasis, rights, retention, approvedAt, reviewedAt, cadence, limitations[]` | `rights`: redistributable, reference-only, prohibited. Prohibited refuses acquisition/publication. |
| `ai-opportunity-source-result/v1` | `resultId, requestId, policyId, selectedEntityIds[], state, attemptedAt, retrievedAt, responseSha256, relevantRowSha256, tradingSessionId, reason` | `state`: retrieved, unchanged-row, unavailable, refused, not-due. `reason` is null only for `retrieved`; every other state requires a nonempty reason. State-governed clocks and digests may be null under that reason. |
| `ai-opportunity-evidence/v1` | `evidenceId, sourceResultId, sourceRecordRef, publisher, originClusterId, claimClass, stance, availability, reason, subjectExposureId, linkedEntityIds[], geography, publicationAt, observedFrom, observedTo, retrievedAt, firstDetectedAt, measurementClass, metric, valueDecimal, valueAvailability, valueReason, unit, denominator, baselineRef, methodology, limitations[], sourceRights, supersedesEvidenceId, refutedByIds[]` | `claimClass`: observed-fact, party-claim, independent-estimate, calculation, deduction, user-assumption. `stance`: supporting, conflicting, refuting, context. `measurementClass`: stock, flow, capacity, allowance, realized-use, projection. `availability` governs the evidence record. Retrieval failure requires `unavailable` and a nonempty `reason`. `valueAvailability` governs `valueDecimal`. Non-numerical evidence uses `not-applicable`; a missing numerical observation uses `unavailable`. Both require `valueDecimal: null` and a nonempty `valueReason`. |
| `ai-opportunity-cluster/v1` | `clusterId, originPublisher, originalRecordRef, methodologyKey, evidenceIds[], independenceBasis, state` | Syndicated reposts or identical measurement panels share one cluster. `state`: open, corroborated, conflicted, refuted. |
| `ai-opportunity-dependency/v1` | `edgeId, fromExposureId, toExposureId, relation, direction, criticality, expectedLag, bottleneckState, effectiveFrom, effectiveTo, evidenceIds[], exposureEffect` | Direction and financial effect are distinct. One source may support several edges by reference. |
| `ai-opportunity-milestone/v1` | `milestoneId, exposureId, stage, state, earliestDate, latestDate, controllingGateIds[], preconditionIds[], dependencyEdgeIds[], evidenceIds[], falsifier, nextEvidenceNeeded, affectedPeriodIds[]` | Dates are supported bounds, not generic adoption bands. Missing acceptance or billability blocks revenue timing. |

An evidence record always refers to one origin cluster. Review appends a new record and a supersession link. Review never mutates an existing source observation. Conflicting compatible observations remain concurrently visible. Unmatched units, periods, geography, denominator, or subject linkage force `unavailable` for the affected comparison.

### Economic, Event, Forecast, And Signal

| Record, version | Required fields | Validation |
| --- | --- | --- |
| `ai-opportunity-bridge/v1` | `bridgeId, exposureId, modelId, inputEvidenceIds[], inputBridgeIds[], denominator, unit, periodId, coverage, adoption, quality, costBasis, formulaId, outputClass, valueDecimal, availability, reason, assumptions[], limitations[]` | `outputClass`: calculation, sensitivity, eligible-forecast. Missing material inputs block eligible-forecast. |
| `ai-opportunity-assessment/v1` | `assessmentId, entityId, exposureIds[], industryIds[], generationId, reviewedAt, operatingConclusion, realizationConclusion, expectationsConclusion, peerBasis, horizonRows[], evidenceIds[], counterEvidenceIds[], bridgeIds[], falsifier, largestMissingInput, state` | Three conclusions validate independently. Every current entity has next-event, six-month, twelve-month rows. |
| `ai-opportunity-event/v1` | `eventId, entityId, securityId, fiscalPeriodId, fiscalCutoffDate, releaseType, eventDate, eventDateAvailability, eventDateReason, localTime, localTimeAvailability, localTimeReason, timezone, timezoneAvailability, timezoneReason, certainty, dateProvider, evidenceCutoffAt, state, nextEventId`; `releaseType`: earnings, revenue-only; `state`: estimated, confirmed, completed, canceled, superseded | Each date, time, and timezone triplet follows the availability contract. An unknown next date uses `eventDate: null`, `eventDateAvailability: unavailable`, and a nonempty `eventDateReason`. An event may retain an available date while its local time or timezone remains independently unavailable. A completed event requires all three values available and never appears as next. |
| `ai-opportunity-market/v1` | `marketId, securityId, eventId, kind, providerId, observedAt, retrievedAt, tradingSessionId, raw, normalized, unit, basis, quality, reason`; `kind`: consensus, underlying, option, outcome-price | Consensus includes period, GAAP/adjusted, currency, dilution, and contributors if available. Options include deliverable, multiplier, bid/ask, quote clocks, expiry, strike, IV units, volume, and OI. |
| `ai-opportunity-forecast/v1` | `forecastId, eventId, generationId, publishedAt, frozenAt, forecastType, dimensions[], returnWindow, evidenceIds[], bridgeIds[], assumptions[], eligibility, reason, withdrawalAt`; `forecastType`: directional-watch, conditional-scenario, unconditional-forecast, abstention | Freeze before event cutoff. Conditional outputs never enter unconditional error statistics. |
| `ai-opportunity-outcome/v1` | `outcomeId, eventId, forecastId, actuals[], openingGap, regularCloseReturn, corporateActionBasis, scoredDimensions[], abstentionDimensions[], observedAt, sourceMarketIds[]` | Outcome appends and cannot change forecast. Scored window must equal frozen `returnWindow`. |
| `ai-opportunity-signal/v1` | `signalId, assessmentId, mechanismId, periodId, level, direction, firstDetectedAt, lastReviewedAt, eventId, financialLines[], evidenceIds[], counterEvidenceIds[], bridgeIds[], falsifier, nextEvidenceNeeded, missingInputs[], state, revision, routingStatus` | `level`: early-watch, realization-alert, surprise-alert, abstention. `state`: detected, strengthened, weakened, realized, expired, withdrawn. Dedup key is entity + mechanism + period + evidence revision. |

Market `raw` retains provider units and fields. `normalized` carries conversion and quality state. Invalid vendor zero IV30 retains raw zero and normalized null. A last trade is not a quote observation. Opening gap, close-to-close return, and intraday last trade are separate named values.

### Generation And Current Selector

`ai-opportunity-generation/v1` has exact top-level fields:

```text
contractVersion, generationId, requestId, predecessorGenerationId,
researchCutoffAt, frozenAt, finalizedAt, selectionDigest, sourcePlanDigest,
archiveRef, universeRef, recordRefs {sources, evidence, clusters, dependencies,
milestones, bridges, assessments, events, markets, forecasts, outcomes, signals},
refreshResults[], coverage {industries, activeMemberships, originalEntities,
assessments, refreshed, carried, failed, unreviewed, completedEvents},
validationResults[], ownerReadRef, briefRef, inventory[], generationSha256
```

Every `recordRef` has `path, sha256, byteLength, contractVersion`. Each selected entity has exactly one refresh result: refreshed, failed, or unchanged-row. Nonselected entities are carried or unreviewed. No entity can disappear. `coverage` reports imported counts separately from current candidate counts. A failed source may coexist with a valid generation. An invalid universe, dangling evidence link, unsupported numerical forecast, or Brief mismatch refuses the entire generation.

`ai-opportunity-current/v1` has `contractVersion, generationId, generationRef, ownerReadRef, briefRef, projectionRef, predecessorGenerationId, publishedAt`. It is the only mutable selector. Reader startup validates all hashes and identity equality before painting a current state. A stale or malformed projection displays a refusal, never a blended prior/current view.

## Acquisition Provider Contract

`acquire(request)` receives `ai-opportunity-provider-request/v1`:

```text
requestId, providerId, sourcePolicyRef, selectedEntityIds[], sourceClass,
researchCutoffAt, observedSinceAt, maxBytes, deadlineAt, rightsPurpose,
priorResponseSha256, priorRelevantRowSha256
```

It returns `ai-opportunity-provider-result/v1`:

```text
requestId, providerId, state, stateReason, attemptedAt, retrievedAt, sourceRecordRef,
responseSha256, relevantRowSha256, publicationAt, observationPeriod,
measurementClass, candidateRows[], rights, retention, tradingSessionId,
failure null | {code, reason, retryable}
```

`state` has this closed vocabulary and field contract:

| State | Meaning | Required field conditions |
| --- | --- | --- |
| `retrieved` | The provider acquired an authorized response and parsed a new or changed relevant record set. | `retrievedAt`, `sourceRecordRef`, `responseSha256`, and `relevantRowSha256` are non-null. `stateReason` and `failure` are null. |
| `unchanged-row` | Acquisition succeeded, but the relevant-row digest equals the prior relevant-row digest. | Retrieval clocks and both digests are non-null. `candidateRows` is empty, `stateReason` is nonempty, and `failure` is null. |
| `unavailable` | Acquisition was attempted, but no usable result exists because the source or required identity, period, or calendar fact was unavailable. | `candidateRows` is empty. `stateReason` is nonempty. `failure` is non-null and uses an allowed unavailable code. |
| `refused` | Policy or safe parsing rejected use of the response. | `candidateRows` is empty. `stateReason` is nonempty. `failure` is non-null with `RIGHTS_REFUSED` or `PARSE_REFUSED`. Restricted payload fields remain null. |
| `not-due` | The source plan skipped network acquisition because its declared cadence and dependency triggers did not select this source. | `retrievedAt`, digests, `sourceRecordRef`, and `failure` are null. `candidateRows` is empty and `stateReason` names the cadence decision. |

Allowed `unavailable` failure codes are `SOURCE_UNAVAILABLE`, `TIMEOUT`, `IDENTITY_UNRESOLVED`, `PERIOD_UNRESOLVED`, and `CALENDAR_UNVERIFIED`. `ROW_UNCHANGED` is not a failure code because `unchanged-row` is its own terminal state. Every non-null failure has a nonempty reason. `retryable` is true only for a condition that the same policy permits a later acquisition to retry.

The acquisition lifecycle is `scheduled -> acquiring -> retrieved | unchanged-row | unavailable | refused`, or `scheduled -> not-due`. Only the five terminal states are persisted in provider results. A provider result is immutable, and a terminal state cannot transition to another terminal state. A later eligible acquisition creates a new request and result instead of mutating the prior result. The provider must return exactly one terminal result per request. Rights or parser failure cannot become `unchanged-row`. Candidate extraction never assumes that an HTTP 200 response is current, complete, or licensed for public retention.

The source plan names cadence and selected classes in versioned config. Filings and event calendars run at each approaching-event generation. Market observations run on trading sessions, never weekend synthetic sessions. Permit, utility, labor, customer, supplier, and product records run on declared cadence plus dependency triggers. A cadence skip is `not-due` and keeps the prior review clock.

## Models And Refusal Semantics

### Operational Critical Path

The milestone engine forms a directed acyclic precondition graph. Cycles refuse. Each gate has an earliest and latest sourced date. An inflection window exists only when every critical gate has a supported range and the recognition lag has a named accounting basis. Its lower and upper bounds identify their controlling gates. A missing customer acceptance, usable load, hire, billable utilization, or paid conversion keeps the relevant financial window unavailable.

Capacity stocks, additions, and flows remain distinct. An allowance ratio may publish as a calculation. It cannot promote consumption, accepted IT load, billable output, revenue, or productivity. A requisition and three training dates remain one requisition and three plans, not filled roles.

### Productivity And Retained Economics

Cost-saving-share formula:

```text
affectedCostShare × deployedShare × measuredLocalSavingRate − incrementalCostShare
```

The cost-productivity multiplier is `1 / (1 − costSavingShare)` only when the shares share a period and denominator and the denominator stays positive. Without coverage weights, a workflow multiplier remains workflow-scoped. Redeployed time is a capacity output. It becomes cash savings only after sourced spending reduction or hiring avoidance.

Quarterly profit uses cohort live days, ramp, recognition, retained cost savings, incremental AI revenue, contribution margin, run cost, and inference cost. It also includes rework, cannibalization, implementation cost, and depreciation. Output volume, price, and mix remain separate. For outsourcing, `contacts = orders × contactsPerOrder` requires matched cohorts and periods. Customer revenue growth cannot substitute for order growth. Volume-priced, fixed-fee, and outcome-priced contracts have separate capture formulas.

The equity sensitivity adds interest, tax, debt, cash, shares, dilution, persistence, and a dated expectations gap. A constant-P/E case may use `(1 + forwardEPSChange) × (1 + multipleChange) − 1`, but negative or unstable forward earnings refuse that model. A temporary quarterly shock cannot become recurring forward EPS without a persistence input. An assumed unpriced fraction yields a conditional scenario, not an observed stock expectation. Missing material inputs yield an explicit unavailable percentage.

### Alert Ladder

An early watch requires dated change evidence, a plausible mechanism, a falsifier, and missing-input list. A realization alert additionally needs observed live adoption or erosion, defined scope and quality, a named reporting period, retained economics, materiality, and counterevidence review. A surprise alert additionally needs a reconciled, dated, same-basis expectation comparison. Incompatible provider estimates remain separate. Unresolved compatible contradictions block promotion.

A directional watch, conditional numerical scenario, unconditional forecast, and abstention have distinct type tags. Market-implied option magnitude cannot choose direction. A stock percentage needs a reproducible economic and priced-in bridge. Withdrawal appends a signal revision, preserves the old call, and records the reason.

### Options And Outcome Gate

Normalize IV30 only after unit and usable-value checks. Vendor zero with invalid quality becomes null. Verify underlying security, deliverable, exchange, currency, expiration after the release, strike, multiplier, quote clocks, bid/ask coherence, spread, OI, volume, and trading session. A same-day expiry needs confirmed release time. Broad or unsynchronized quotes block event-only variance extraction.

`(callMid + putMid) / spot` is labeled total-expiration straddle premium. Break-evens are `strike ± premium`. Event-only magnitude requires a stated variance baseline, adjacent valid maturities, day count, and sensitivity. Otherwise it remains unavailable.

The forecast freezes the event window before release. Outcome scoring separates operating direction, money bridge, timing, surprise, and stock-return dimensions. It uses the declared regular close-to-close or opening-gap window, not hindsight selection. Splits and corporate actions must have an explicit adjustment basis. No eligible numerical forecast means no numerical error and no hit credit. Publish abstention counts and coverage next to any accuracy rate. Probability percentages remain unavailable until frozen forecasts support real out-of-sample calibration.

## Brief, Notifications, And Downstream Contracts

The owner Brief is a deterministic `ai-opportunity-brief/v1` projection of validated signal and event IDs. Its six required sections are approaching earnings, six-month milestones, twelve-month milestones, completed events, changed signals, and coverage/abstentions. Empty sections state `no-qualified-signal`, `unavailable`, or `not-reviewed` with a reason. The next earnings lane appears first. Revenue-only events retain their own label.

Every Brief row carries `generationId, entityId, securityId|null, eventId|null, threeConclusions, level, mechanism, evidenceIds[], counterEvidenceIds[], bridgeIds[], missingInputs[], financialLines[], fiscalPeriodId|null, firstDetectedAt, lastReviewedAt, falsifier, ownerDeepLink`. The row cannot add a claim that the owner graph does not contain.

The compact shared owner read is exactly one `tool-model-read/v1` source read for the registered tool. It carries `toolId, role:source, profile:static-model, status, adapter {adapterId, owningModelVersion}, deepLink, evidenceCutoff, evidenceRefs, evidenceApplicability, evidenceInterpretations, recommendationEligibility`. Its interpretations are owner-authored and source-qualified. Without a compatible market evidence bundle, applicability is `not-integrated`, interpretations are empty, and recommendation eligibility is false. A bounded `tool-brief/v2` projection may only use `catalyst`, `no-action`, or `unavailable` unless separate market-action policy admits an action. It must satisfy the existing frozen-read and claim-mapping validator.

In-tool notices publish from `ai-opportunity-signal/v1`. Delivery outcomes use `ai-opportunity-routing/v1` with `signalId, destinationId, attemptedAt, state, refusalCode, refusalReason, destinationRecordRef`. `state` is displayed, accepted, refused, or unavailable. An unchanged evidence revision does not create a duplicate notice. A destination refusal cannot remove or downgrade the owner signal. The Feature 020 consumer is read-only and subject to its own gates. No email, push, or Red Alert delivery is claimed here.

## UI And Journey Contract

The planned route uses the ordinary view set. Simple presents one causal chain, the critical dependency, the next gate, evidence strength, falsifier, and largest missing input. Power exposes the full universe, source ledger, peer basis, dependency graph, milestone critical path, model formula and assumptions, options quality, and generation diff. Brief prioritizes next earnings and separates longer horizons and completed events. Journey follows evidence sufficiency, catalyst critical path, underwriting, conflicts, recruitment-to-utilization, and event accountability.

The UI exposes one `generationId` and `researchCutoffAt` in every view. A local assumption change builds a transient scenario object. It does not alter the owner read, current selector, Brief, forecast, or historical record. Reset restores the evidence-derived baseline. All source and model text is escaped at HTML sinks. Tables expose headings and units. Keyboard, touch, zoom, and reduced-motion interaction preserve the same qualifiers. UX-owned wireframes may refine component layout without changing these contracts.

## Security, Rights, Configuration, And Migration

The build-free browser reads committed static files without accounts or credentials. A refresh is a local headless operator or scheduled workflow, not a browser-side scraper. Provider authorization and rights review stay in the source-use policy. Public static artifacts contain only redistributable data or permitted references and excerpts. They never contain provider secrets, private employee records, customer records, holdings, orders, or portfolio data.

The source archive importer is one-way. It checks every expected fingerprint and count before first publication. A schema revision writes a new version and explicit migration manifest. Validators may read supported predecessors but write only the active version. Historical byte fingerprints remain unchanged. Corporate actions add dated successor identities. Unknown version, unknown field, unknown unit, missing source rights, or malformed link refuses rather than defaulting.

Versioned repo-local config declares source policies, acquisition cadence, model eligibility, and public export rights. Required values are explicit. The initial usable configuration has a preserved local archive and approved public-source policies. An optional licensed provider remains unavailable until its policy and access exist. A browser route never requires a sibling absolute path.

The project SST in [config/domain-model.yaml](../../config/domain-model.yaml) currently names Tool, ToolRead, company publication, and shock entities. During implementation, promote the new universe, evidence, generation, signal, and forecast invariants into that project-owned SST. Do not edit it in this planning-only run. Its correspondence tests must verify full-universe preservation, immutable forecasts, and generation/Brief coherence.

## Observability And Failure Handling

The generator reports progress by entity, source class, phase, and source result. A refusal contains a closed code, field path, record identity, and safe reason. Public diagnostics exclude credentials and restricted source payloads. Coverage publishes refreshed, carried, failed, unreviewed, stale, completed-event, eligible forecast, and abstention counts. A signal audit log records creation, strengthening, weakening, withdrawal, realization, destination refusal, and score eligibility.

Reader failures distinguish missing current selector, digest mismatch, stale generation, missing source rights, and unavailable research. Acquisition failures do not impersonate `no change`. A changed response hash with unchanged relevant rows is logged but does not promote a milestone. A Sunday finalization retains the prior trading session.

The current [\.github/bubbles-project.yaml](../../.github/bubbles-project.yaml) has no wired `traceContracts` block. No service trace topology is declared. Headless log and artifact evidence remain required for refresh and publication tests.

## Testing And Validation Strategy

Persistent regression tests execute the planned pure validator, headless refresh, static route, owner-read projection, and publication paths. Third-party source responses may be controlled at the external boundary, but owned graph, model, transaction, and reader logic must run for real. Representative seed records come from the preserved corpus and source-rights-qualified snapshots, not a synthetic pass-through.

| Scenarios | Test category | Behavioral assertion |
| --- | --- | --- |
| SCN-034-001–004 | functional, integration, e2e-api | Import counts and fingerprints, partial keyed overlay, closed provider-result states and field conditions, unchanged pointer on refusal |
| SCN-034-005–008, 027 | unit, functional | Origin clustering, contradiction visibility, proxy stages, requisition stages, response-versus-row diffs |
| SCN-034-009–016 | unit, functional, integration | Critical-path bounds, blocked recognition, scoped productivity, matched demand, independent conclusions, common-basis peer gate |
| SCN-034-017–024 | integration, e2e-ui | Brief ordering, qualified and early notices, routing refusal, completed event retirement, invalid IV and quote isolation |
| SCN-034-025–028 | unit, integration | Frozen return window, honest abstention, unchanged relevant rows, isolated user assumptions |
| SCN-034-029–032 | e2e-ui, accessibility | One generation in four views, concise Simple, reconstructable Power, explicit Brief empties |

Add arithmetic regressions for allowance ratios, cost shares, matched contacts, quarter live days, conditional valuation, strike break-evens, and event returns. Stress testing is proportionate to the 23-industry, 230-membership, 197-assessment minimum and verifies rendering and validation without record loss. Run registry, artifact, rights, link, source-clock, and corpus-preservation checks. A full release check belongs to the exact final implementation candidate, not to this design-only artifact.

Contract regressions must reject unknown provider-result states and terminal-to-terminal mutations. They must also reject evidence or event nulls that violate their declared value, availability, and reason triplets.

## Alternatives And Tradeoffs

| Decision | Simpler alternative | Why rejected |
| --- | --- | --- |
| Separate company-sector owner capability | Add columns to Research Agenda topics | Topic identity cannot model multi-industry memberships, sites, securities, and event-specific forecasts without hidden coupling. |
| Immutable generation plus pointer-last transaction | Overwrite one current JSON file | Overwrite cannot prove Brief/read coherence or reconstruct frozen forecasts. |
| Typed evidence and origin clusters | Keep Markdown as source of truth | Prose cannot enforce units, clocks, correlated sources, or append-only correction. |
| Partial acquisition inside full-universe publication | Require every source to succeed | One source outage would stop valid research updates and hide which entity actually failed. |
| Explicit unavailable output classes | Fill missing values with approximate defaults | Defaults fabricate productivity, earnings, IV, or stock effects. |

## Complexity Tracking

| Decision | Simpler alternative considered | Why rejected |
| --- | --- | --- |
| Separate archive, graph, generation, and selector records | One mutable document | Historical byte preservation and frozen-event accountability require distinct lifecycles. |
| Provider and rights contract | Direct URL fetches in model code | Source cadence, storage rights, and failure semantics would differ by source and leak into conclusions. |
| Pointer-last owner-read/Brief transaction | Publish UI and Brief independently | A reader could see different generation identities and stale signals. |
| Source-origin clustering | Count each article separately | Syndication would incorrectly strengthen corroboration. |

## Risks And Open Questions

1. **Source rights:** Each provider policy must document access and retention before ingestion. An unapproved source is a rights refusal, not a fallback source.
2. **Corpus mapping:** Ambiguous historical entity or security names require reviewed identity links. The importer must refuse rather than guess.
3. **Coverage depth:** Preserved breadth does not imply current forensic review. Generation coverage must separate imported, carried, failed, and reviewed identities.
4. **Market quality:** Public options and consensus feeds may omit synchronized quote clocks or contributor details. These gaps block event-only move or surprise outputs.
5. **Publication coupling:** Existing Company Intelligence and Brief publishers use specialized Git workflows. Feature 034 should reuse validated pointer-last primitives only where their contracts fit, not force broad research into a one-subject transaction. Feature 032 Scope 5 and Feature 034 Scope 8 may both touch shared registry and Pages surfaces, so Scope 8 must re-read the current Feature 032 state and shared bytes immediately before implementation, serialize any overlapping edits, and rerun the named consumer canaries. That is a coordination boundary, not a hard implementation dependency.
6. **External routing:** Feature 020 and Red Alert gates remain separate owners. Feature 034's mandatory delivery is reader-visible in-tool and owner Brief.

No unresolved question prevents scoped implementation planning. A source or security mapping that cannot be verified remains unavailable in the affected generation.
