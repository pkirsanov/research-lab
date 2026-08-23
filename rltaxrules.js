/* Lifetime Tax Strategy Lab — rule-pack contracts, resolution, and the closed refusal vocabulary.
 *
 * This module owns TaxRulePack/v1, SourceRecord/v1, AbsentFigure/v1, TaxUnavailable/v1,
 * RateTable/v1, DeductionAmount/v1, the RuleStatus enum, the RLTAX_CODES enum, and the
 * supported income-kind and filing-status vocabularies.
 *
 * It owns NO arithmetic, NO household value, NO storage access, and NO DOM access. The
 * resolver holds no math, so no code path can index, interpolate, or carry a threshold into
 * an unsupported year.
 *
 * UMD dual module: attaches to the global AND sets module.exports. Never ESM.
 */
(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});

  var PACK_CONTRACT = "TaxRulePack/v1";
  var PACK_CONTRACT_V2 = "TaxRulePack/v2";
  var SOURCE_CONTRACT = "SourceRecord/v1";
  var SOURCE_CONTRACT_V2 = "SourceRecord/v2";
  var ABSENT_CONTRACT = "AbsentFigure/v1";
  var UNAVAILABLE_CONTRACT = "TaxUnavailable/v1";
  var RATE_TABLE_CONTRACT = "RateTable/v1";
  var RATE_TABLE_CONTRACT_V2 = "RateTable/v2";
  var COMPONENT_SOURCE_CONTRACT = "ComponentSource/v1";
  var THRESHOLD_SET_CONTRACT = "ThresholdSet/v1";
  var TAX_LEG_CONTRACT = "TaxLeg/v1";
  var DEDUCTION_CONTRACT = "DeductionAmount/v1";
  var ROUNDING_CONTRACT = "TaxRoundingPolicy/v1";
  var EXPIRY_CONTRACT = "TaxPackExpiry/v1";
  var SOURCED_ZERO_CONTRACT = "SourcedZero/v1";
  var RELIEF_CONTRACT = "ReliefMechanism/v1";
  /* Feature 023 Scope 01. The declared half and the sourced half of the housing axis are two
     separate contracts on purpose: one carries only the household's own inputs and refuses a
     citation, the other carries only sourced figures and refuses a missing one. Registering both
     here rather than inside the property engine is what lets a later module depend on the
     distinction without depending on the engine. */
  var PROPERTY_ASSESSMENT_CONTRACT = "PropertyAssessment/v1";
  var PROPERTY_REGIME_CONTRACT = "PropertyReliefRegime/v1";
  /* Feature 023 Scope 02. */
  var DEDUCTION_COMPONENT_CONTRACT = "DeductionComponent/v1";
  var ITEMIZED_COMPOSITION_CONTRACT = "ItemizedComposition/v1";

  /* Feature 023 Scope 03. The three rental contracts. `CostRecovery/v1` is the one that carries
     the sourcing rule in its shape: recoveryPeriod and convention have NO default and NO
     fallback branch, so a module that lost its pack cannot quietly depreciate over a period it
     remembers. `LossLimitation/v1` carries an integer appliedOrder because FR-023-017's ordering
     is proven by an assertion over the applied records rather than assumed from the order the
     source happens to call two functions in. */
  var RENTAL_ACTIVITY_CONTRACT = "RentalActivity/v1";
  var COST_RECOVERY_CONTRACT = "CostRecovery/v1";
  var LOSS_LIMITATION_CONTRACT = "LossLimitation/v1";

  /* Feature 023 Scope 04. The dwelling-use axis. `DwellingUseDeclaration/v1` carries the two day
     counts and nothing else, and refuses a citation for the same reason every declared contract
     does. `UseClassification/v1` is the PUBLISHED result of running the sourced test against
     them: it carries the category, both counts, the sourced parameters with their citations, and
     every comparison actually performed as `{ left, operator, right, result }`. Publishing the
     comparisons is what makes inclusivity inspectable rather than buried in a branch — a reader
     can see that the test was strict, and an assertion can pin it at the exact sourced figure. */
  var DWELLING_USE_DECLARATION_CONTRACT = "DwellingUseDeclaration/v1";
  var USE_CLASSIFICATION_CONTRACT = "UseClassification/v1";
  var USE_ALLOCATION_CONTRACT = "UseAllocation/v1";

  /* Feature 023 Scope 05. The disposition axis. `DispositionDeclaration/v1` carries the
     household's own proceeds, adjusted basis and accumulated cost recovery and refuses a
     citation like every declared contract. `GainComponent/v1` is the piece that matters: a gain
     is never one number priced one way, so each component carries a `pricingRule` drawn from a
     CLOSED set, and a component carrying neither member is refused rather than defaulted to the
     stacking rule. That refusal is the whole point — the failure this feature exists to prevent
     is a settlement that prices a recapture component under the ordinary long-term stacking
     because nobody stated which rule applied to it. */
  var DISPOSITION_DECLARATION_CONTRACT = "DispositionDeclaration/v1";
  var DISPOSITION_CONTRACT = "Disposition/v1";
  var GAIN_COMPONENT_CONTRACT = "GainComponent/v1";
  var RESIDENCE_EXCLUSION_CONTRACT = "ResidenceExclusion/v1";

  /* Feature 024 Scope 01. The benefit axis. `BenefitBasis/v1` is the contract that carries the
     feature's central distinction in its SHAPE rather than in a message: a basis whose origin is
     the household's own statement reading refuses a `sourceRef`, and a basis computed from a
     declared earnings record refuses a missing bend-point citation. Two origins that are
     structurally incapable of impersonating each other cannot be collapsed by a copy edit, and
     there is deliberately NO precedence member — a household declaring both is an ambiguity the
     resolver refuses rather than one it resolves by preferring either.

     `ClaimAgeAdjustment/v1` publishes the months counted and the factor applied to EACH of them
     rather than one folded multiplier, because a single multiplier cannot be checked against the
     source and cannot show where the sourced stopping age bound the accrual. */
  var BENEFIT_BASIS_CONTRACT = "BenefitBasis/v1";
  var CLAIM_AGE_ADJUSTMENT_CONTRACT = "ClaimAgeAdjustment/v1";
  var SOURCED_ROW_LOOKUP_CONTRACT = "SourcedRowLookup/v1";

  /* Feature 024 Scope 02. */
  var PROVISIONAL_INCOME_CONTRACT = "ProvisionalIncome/v1";
  var BENEFIT_INCLUSION_CONTRACT = "BenefitInclusion/v1";
  var YEAR_INVARIANCE_BASIS_CONTRACT = "YearInvarianceBasis/v1";

  /* The closed origin set. Exactly two members and no third, and no member meaning "whichever
     one was supplied": the resolver branches on which ONE was declared, never on a ranking. */
  var BENEFIT_BASIS_ORIGINS = Object.freeze(["declared-statement-pia", "computed-from-earnings"]);

  /* The exact-key shape of each contract. An unknown key on a declared basis is a refusal for
     the same reason it is on a PropertyAssessment: without it, a citation could be smuggled
     alongside the household's own figure and would then render as an authority's. */
  var BENEFIT_BASIS_KEYS = Object.freeze([
    "basisOrigin", "contractVersion", "declaredEarnings", "declaredTaxYear",
    "origin", "primaryInsuranceAmount"
  ]);

  var CLAIM_AGE_ADJUSTMENT_KEYS = Object.freeze([
    "adjustedAnnualBenefit", "adjustedMonthlyBenefit", "birthYear", "claimAgeMonths",
    "comparisonsPerformed", "contractVersion", "creditBoundByStoppingAge", "direction",
    "factorsApplied", "fullRetirementAgeMonths", "fullRetirementAgeRow", "monthsCounted",
    "primaryInsuranceAmount", "ruleStatus"
  ]);

  /* The direction the claim age sits in relative to the full retirement age. `at` is a member
     rather than an absence because a claim exactly AT the full retirement age is a settled
     result with zero months counted, and that is a different claim from one that could not be
     placed at all. */
  var CLAIM_AGE_DIRECTIONS = Object.freeze(["early", "at", "delayed"]);

  /* Feature 024 Scope 02. `ProvisionalIncome/v1` and `BenefitInclusion/v1`.

     The measure this record IS, and the measures it is NOT. Naming the second set is the whole
     point of the contract: provisional income, adjusted gross income and the pack's modified
     adjusted gross measure are three different quantities that a careless implementation would
     conflate, and the conflation is invisible in a total. */
  var PROVISIONAL_INCOME_MEASURE_ID = "provisional-income";
  var PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM = Object.freeze([
    "adjusted-gross-income", "modified-adjusted-gross-income"
  ]);
  var PROVISIONAL_INCOME_KEYS = Object.freeze([
    "contractVersion", "distinctFrom", "locator", "measureId", "parts", "sourceRef", "total"
  ]);
  var PROVISIONAL_INCOME_PART_KEYS = Object.freeze([
    "amount", "label", "origin", "partId", "readFromMeasureId"
  ]);
  /* Where a part's amount came from. `readFromMeasureId` is the member the composition check
     actually inspects: a part that READ one of the distinctFrom measures is refused whatever its
     amount happens to be, so the check is about construction rather than about arithmetic. */
  var PROVISIONAL_INCOME_PART_ORIGINS = Object.freeze([
    "declared-by-the-household", "proportion-of-the-settled-benefit"
  ]);

  var BENEFIT_INCLUSION_KEYS = Object.freeze([
    "baseAmounts", "ceilingBound", "ceilingProportion", "comparisonsPerformed", "contractVersion",
    "includedAmount", "provisionalIncome", "ruleStatus", "sourceRecords", "tier"
  ]);

  /* The closed tier set. `none-included` is a settled result and never an absence. */
  var BENEFIT_INCLUSION_TIERS = Object.freeze([
    "none-included", "first-tier", "second-tier", "ceiling-proportion-of-provisional-income"
  ]);

  /* The tightened `yearInvarianceBasis`. A basis is admissible only when it exhibits a CONTRAST
     the publication itself drew: the text that carries the figure without a year qualifier, AND
     the text in the same publication that DOES date something. A basis naming only the first half
     is an observation about an absence, and an absence is not a contrast. */
  var YEAR_INVARIANCE_BASIS_KEYS = Object.freeze([
    "componentKind", "contrastLocator", "contractVersion", "datedCounterpartLocator",
    "quotedContrast", "quotedDatedCounterpart"
  ]);
  /* A quoted contrast is a sentence the reader can go and find. A label cannot be one, so a
     quotation shorter than this or carrying no interior whitespace is refused as a category
     name rather than accepted as a quotation. */
  var MIN_QUOTED_CONTRAST_LENGTH = 40;
  /* A basis may not stand on another feature's finding, so a quotation that cites this
     repository's own governance rather than the publication is refused. */
  var FOREIGN_FINDING_PATTERN = /SUP-\d{3}-\d{2}|\bFeature\s+\d|specs\/|scope\.md|report\.md/;

  /* Feature 024 Scope 03. The mortality basis and the claim-age comparison.

     The mortality basis carries a life-expectancy column and NOTHING ELSE, and it enforces that
     by an EXACT KEY SHAPE rather than by a list of member names it dislikes. A period life table
     publishes several columns beside the one this tool uses, and any of them entering a record
     this tool then renders would put a statement about chance into a tool that says it publishes
     none. A shape check refuses every one of them, including kinds nobody thought to list, and it
     cannot misfire on a legitimate member the way a substring match over member names does — a
     check that rejects innocent members gets loosened, and a loosened check is how the refusal it
     was written for eventually stops running at all. */
  var MORTALITY_BASIS_CONTRACT = "MortalityBasis/v1";
  var MORTALITY_TABLE_YEAR_BASIS_CONTRACT = "MortalityTableYearBasis/v1";
  var CLAIM_AGE_COMPARISON_CONTRACT = "ClaimAgeComparison/v1";

  var MORTALITY_BASIS_KEYS = Object.freeze([
    "columnId", "columnMeaning", "contractVersion", "declaredYear", "lifeExpectancyByAge",
    "locator", "maximumAge", "minimumAge", "sourceRef", "tableId", "tableYear", "tableYearBasis",
    "unlabelledColumns"
  ]);
  var MORTALITY_ROW_KEYS = Object.freeze(["age", "value"]);
  var MORTALITY_POLICY_KEYS = Object.freeze([
    "ageDomain", "columnLabels", "columnMeaning", "columns", "contractVersion", "stageId",
    "tableId", "tableYear", "tableYearBasis"
  ]);
  var MORTALITY_COLUMN_KEYS = Object.freeze([
    "columnId", "label", "lifeExpectancyByAge", "locator", "sourceRef"
  ]);

  var MORTALITY_TABLE_YEAR_BASIS_KEYS = Object.freeze([
    "carriedBecause", "contractVersion", "quotedTableDating", "quotedYearScoping",
    "tableDatingLocator", "yearScopingLocator"
  ]);

  var CLAIM_AGE_COMPARISON_KEYS = Object.freeze([
    "claimAges", "contractVersion", "mortalityBasisRef", "parityAges", "perAge",
    "resultKindStatement", "selectsNothingStatement"
  ]);

  /* Feature 024 Scope 04. The Medicare premium axis.

     `LookbackMagi/v1` is the contract this scope exists for. A household's premium adjustment is
     set by an income figure from a year this settlement is deliberately NOT settling, and the
     settlement is simultaneously holding a current-year modified adjusted gross measure in the
     same units under almost the same name. The contract therefore carries its OWN year as a
     required member, refuses a `sourceRef` because the figure is the household's own, and carries
     no settled-year member, no workspace handle and no settlement handle — so the object itself
     cannot smuggle a current-year figure into the resolver even if a caller wanted it to. The
     exact-key shape is what makes that structural rather than conventional: a member named
     anything else is refused rather than ignored. */
  var LOOKBACK_MAGI_CONTRACT = "LookbackMagi/v1";
  var LOOKBACK_MAGI_KEYS = Object.freeze([
    "contractVersion", "lookbackYear", "modifiedAdjustedGrossIncome", "origin"
  ]);
  /* Any member whose name could carry a current-year figure into the contract. Refused BY NAME,
     because the shape check alone would let a caller rename the smuggled member to something the
     shape happens to allow, and this list makes the intent unmissable to a later reader. */
  var LOOKBACK_MAGI_FORBIDDEN_KEYS = Object.freeze([
    "currentYear", "declaredTaxYear", "income", "locator", "modifiedAdjustedGross",
    "premiumYear", "settlement", "sourceRef", "workspace"
  ]);

  /* `AdjustmentBracket/v1`. `boundaryOperator` is the SOURCED inclusivity at the bracket's lower
     bound, so the exact-boundary case is decided by the publication rather than by a convention
     this repository happens to prefer. The upper edge needs no second operator: it is the
     complement of the next bracket's own operator, so the boundaries cannot overlap or leave a
     gap by construction. */
  var ADJUSTMENT_BRACKET_CONTRACT = "AdjustmentBracket/v1";
  var ADJUSTMENT_BRACKET_KEYS = Object.freeze([
    "boundaryOperator", "bracketIndex", "bracketSetId", "comparisonsPerformed", "contractVersion",
    "filingStatus", "locator", "lowerBound", "partBAdjustment", "partDAdjustment", "quotedRange",
    "upperBound"
  ]);
  var BOUNDARY_OPERATORS = Object.freeze([
    "no-lower-bound", "greater-than", "greater-than-or-equal"
  ]);

  /* `PremiumRecord/v1`. `includedInTotal` is structurally `false`: the validator refuses any
     other value rather than reading one. A record whose standard premium or adjustment is an
     AbsentFigure is refused rather than shipped, because `false` is a display mechanism and is
     never a way to carry a refusal past a total. */
  var PREMIUM_RECORD_CONTRACT = "PremiumRecord/v1";
  var PREMIUM_RECORD_KEYS = Object.freeze([
    "adjustmentMonthly", "contractVersion", "includedInTotal", "legId", "locator", "partId",
    "sourceRefs", "standardPremiumMonthly", "totalAnnual", "totalMonthly"
  ]);
  var PREMIUM_PART_IDS = Object.freeze(["part-b", "part-d", "both-parts"]);

  /* The closed pricing-rule set. `own-maximum-rate` means the component is priced at a rate the
     authority states FOR THAT CATEGORY and never enters the preferential band walk;
     `preferential-stacking` means the component is handed whole to the existing Feature 022
     model. There is no third member and no absent member. */
  var GAIN_PRICING_RULES = Object.freeze(["own-maximum-rate", "preferential-stacking"]);

  /* The two eligibility tests, evaluated SEPARATELY. They are a closed set rather than a boolean
     because FR-023-033 turns on naming which one failed, and a single combined condition cannot
     name anything. */
  var RESIDENCE_TEST_IDS = Object.freeze(["ownership", "use"]);

  /* How the property was used, which is what decides whether a LOSS is deductible at all. The
     two members are not symmetric and must never be collapsed: a loss on a home the household
     lived in and a loss on property held to produce income are settled under different rules,
     which the pack states and this module never does. A model that reported one figure for both
     would be wrong for whichever case it was not written for. */
  var DISPOSITION_PROPERTY_USES = Object.freeze(["principal-residence", "rental-or-investment"]);

  var ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
  var SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
  var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  var TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  var SHA_PATTERN = /^sha256:[a-f0-9]{64}$/;

  /* A source record's url is written into an anchor's href by the route. A pack is authored
     content, so the scheme is an executable surface: javascript: in this field would run in
     the page's own origin, with its local storage, and the route's CSP carries 'unsafe-inline'
     so it would not refuse. Only https is admitted. Every one of the 102 url fields across the
     14 shipped packs is already https, so this closes the hole without narrowing any pack. */
  var SOURCE_URL_PATTERN = /^https:\/\/[^\s]+$/;

  function isSafeSourceUrl(candidate) {
    return typeof candidate === "string" && SOURCE_URL_PATTERN.test(candidate);
  }

  /* The legal standing of a field. Not a confidence, and never probabilistic. */
  var RULE_STATUS = Object.freeze({
    "enacted-current-law": true,
    "enacted-scheduled-law": true,
    "user-hypothetical-law": true,
    "unavailable": true
  });

  /* The closed refusal vocabulary. Fourteen members: Feature 021's twelve, unchanged in meaning
     and in raising site, plus the two the jurisdiction axis needs. This is the ONLY declaration
     in the repository; every consumer imports it and none extends it. */
  var RLTAX_CODES = Object.freeze({
    "RLTAX-CONFIG-INVALID": true,
    "RLTAX-PACK-INVALID": true,
    "RLTAX-PACK-EXPIRED": true,
    "RLTAX-YEAR-UNSUPPORTED": true,
    "RLTAX-JURISDICTION-UNSUPPORTED": true,
    "RLTAX-INCOME-KIND-UNSUPPORTED": true,
    "RLTAX-FILING-STATUS-UNSUPPORTED": true,
    "RLTAX-INPUT-INCOMPLETE": true,
    "RLTAX-FEATURE-UNSUPPORTED": true,
    "RLTAX-THRESHOLD-UNAVAILABLE": true,
    "RLTAX-RECONCILE": true,
    "RLTAX-SCOPE-DEFERRED": true,
    /* The declared residency PATTERN is outside single-full-year residency. The jurisdiction
       itself may be fully supported, which is why this is not RLTAX-JURISDICTION-UNSUPPORTED. */
    "RLTAX-RESIDENCY-UNSUPPORTED": true,
    /* Two packs resolved for one combined settlement do not both declare the requested year
       effective. Neither pack is individually invalid, which is why this is not
       RLTAX-YEAR-UNSUPPORTED: the defect is in the relationship between two packs. */
    "RLTAX-PACK-YEAR-MISMATCH": true
  });

  /* The jurisdiction grammar. A pattern, never an enumeration: no module names a state. */
  var JURISDICTION_PATTERN = /^(?:federal|state:[A-Z]{2})$/;

  /* The residency patterns a household may declare. Only the first is modelled; every other
     member refuses under its own code rather than under the jurisdiction code. */
  var RESIDENCY_PATTERNS = Object.freeze([
    "full-year-resident", "part-year", "multi-state", "non-resident-source"
  ]);

  var RELIEF_KINDS = Object.freeze({ "deduction-from-income": true, "credit-against-tax": true });
  var RELIEF_APPLICATION_POINTS = Object.freeze({ "before-rate-application": true, "after-rate-application": true });

  /* Feature 023 Scope 01. The closed cap-basis set. Exactly two members, and every engine that
     applies an assessment cap branches on the MEMBER. A regime name, a state name or a county
     name is never a branch: adding a third relief shape is a third member here plus one branch
     on that member, and a new jurisdiction under an existing shape is a new pack file only. */
  var PROPERTY_CAP_BASES = Object.freeze(["prior-assessed-value", "acquisition-value"]);

  /* Where a property relief mechanism may be applied. A pattern of points, not a list of
     regimes. */
  var PROPERTY_APPLICATION_POINTS = Object.freeze(["assessed-value", "tax-rate"]);

  /* The property regime path grammar. A PATTERN, never an enumeration: this module names no
     state and no county, and a regime pack is admitted by the shape of its path rather than by
     membership in a hand-maintained list. The fixture arm can never resolve for a real
     jurisdiction because a two-letter postal code is not the literal word fixtures. */
  var PROPERTY_REGIME_PATH_PATTERN = /^tax-rules\/property\/(?:[A-Z]{2}\/\d{4}|fixtures\/[a-z0-9-]+)\.json$/;

  /* Feature 023 Scope 02. Both closed sets. `unavailable` is a first-class member of each: a
     composition whose cap could not be established must be able to SAY so, because the
     alternative is quietly taking the standard deduction and calling it a decision. */
  var DEDUCTION_COMPONENT_ORIGINS = Object.freeze(["declared", "computed"]);
  var CAP_BINDINGS = Object.freeze(["bound", "unbound", "unavailable"]);
  var CHOSEN_DEDUCTION_SIDES = Object.freeze(["itemized", "standard", "unavailable"]);
  var DEDUCTION_COMPONENT_KEYS = Object.freeze([
    "allowedAmount", "amount", "cappedWith", "componentId", "disallowedAmount", "label", "origin"
  ]);

  /* Feature 023 Scope 03. Every member of a RentalActivity is the household's own input, so the
     set is exact and a member carrying a citation is refused exactly as a PropertyAssessment
     member is. `openingSuspendedLoss` is in this set deliberately: a carryforward the household
     brings in from a year this single-year model never computed is a DECLARATION, and giving it
     a sourceRef would present the household's own figure as an authority's. */
  var RENTAL_ACTIVITY_KEYS = Object.freeze([
    "activeParticipation", "atRiskAmount", "contractVersion", "declaredTaxYear",
    "depreciableBasis", "modifiedAdjustedGrossIncome", "openingSuspendedLoss",
    "operatingExpenses", "origin", "placedInServiceMonth", "recoveryYearOrdinal", "rentalIncome"
  ]);

  /* The closed set of limits this feature applies, and the only two limitIds a LossLimitation
     may carry. A third limit is a third member plus its own sourced ordering row in the pack —
     never an unlabelled extra record appended to the ladder. */
  var LOSS_LIMIT_IDS = Object.freeze(["at-risk", "passive-activity"]);

  /* A limited loss is SUSPENDED. The single member is the point: this slice computes one year,
     so the only honest disposition for a disallowed amount is that it is carried, and there is
     no member a later reader could set to make a disallowed amount disappear. */
  var LOSS_DISPOSITIONS = Object.freeze(["suspended"]);

  var LOSS_LIMITATION_KEYS = Object.freeze([
    "allowedAmount", "amountBefore", "appliedOrder", "contractVersion", "disallowedAmount",
    "disposition", "limitId", "locator", "sourceRef"
  ]);

  /* The MACRS conventions this engine can apply, and the methods. Both are CLOSED sets of
     identifiers the pack must name, not values this module supplies: the module knows how to
     apply a mid-month convention, and it knows that it does not know how to apply anything it
     has no branch for, which is why an unrecognised identifier refuses rather than falling back
     to the one branch that exists. */
  var COST_RECOVERY_CONVENTIONS = Object.freeze(["mid-month"]);
  var COST_RECOVERY_METHODS = Object.freeze(["straight-line"]);

  /* Feature 023 Scope 04. The closed category set the dwelling-use test can produce. Three
     members and no fourth, because the publication draws exactly two independent lines — whether
     the unit was used as a home, and whether it was rented fewer than the stated number of days
     — and the second line only matters once the first is crossed. `null` is never a category: a
     classification that could not be made is a refusal, not an unlabelled dwelling. */
  var USE_CATEGORIES = Object.freeze([
    "not-a-residence", "residence-rented-at-or-above-threshold", "residence-minimal-rental-use"
  ]);

  /* The closed operator set a published comparison may name. Spelling the operator out rather
     than storing a symbol is deliberate: `greater-than` and `at-least` cannot be confused by a
     reader the way `>` and `>=` can, and a boundary assertion reads the operator from the record
     rather than assuming which one the branch used. Both inclusivities are members so that a
     pack stating the inclusive form is transcribable, and so that flipping a comparison's
     inclusivity is a change the engine executes rather than one it refuses as unsupported. */
  var USE_COMPARISON_OPERATORS = Object.freeze([
    "greater-than", "at-least", "less-than", "at-most", "greater-of"
  ]);

  var DWELLING_USE_DECLARATION_KEYS = Object.freeze([
    "contractVersion", "declaredTaxYear", "fairRentalDays", "origin", "personalUseDays"
  ]);

  var USE_CLASSIFICATION_KEYS = Object.freeze([
    "allocationBasis", "category", "categoryReason", "comparisonsPerformed", "contractVersion",
    "fairRentalDays", "percentageComparedAgainst", "personalUseDays", "ruleStatus",
    "testParameters", "usedAsResidence"
  ]);

  var USE_COMPARISON_KEYS = Object.freeze(["comparisonId", "left", "operator", "result", "right"]);

  /* kind and applicationPoint are separate members so the coherence rule between them is
     explicit rather than implied by a single conflated enum. */
  var RELIEF_COHERENT_POINT = Object.freeze({
    "deduction-from-income": "before-rate-application",
    "credit-against-tax": "after-rate-application"
  });

  var SOURCED_ZERO_KEYS = Object.freeze([
    "contractVersion", "domain", "locator", "reason", "ruleStatus", "sourceRef", "value"
  ]);

  var RELIEF_KEYS = Object.freeze([
    "amounts", "appliesToLegs", "componentSources", "contractVersion", "kind", "locator",
    "mechanismId", "applicationPoint", "sourceRef", "varyByFilingStatus"
  ]);

  var SUPPORTED_INCOME_KINDS = Object.freeze([
    "ordinary", "qualified-dividend", "long-term-capital-gain", "tax-exempt-interest"
  ]);

  var SUPPORTED_FILING_STATUSES = Object.freeze([
    "single", "married-filing-jointly", "married-filing-separately", "head-of-household"
  ]);

  /* The pack vocabulary is hyphenated; the workspace record uses camelCase members. The
     mapping lives here because this module owns the income-kind vocabulary. */
  var INCOME_KIND_FIELDS = Object.freeze({
    "ordinary": "ordinary",
    "qualified-dividend": "qualifiedDividend",
    "long-term-capital-gain": "longTermCapitalGain",
    "tax-exempt-interest": "taxExemptInterest"
  });

  /* The preferential kinds pooled by CO-4 into one preferential amount. */
  var PREFERENTIAL_INCOME_KINDS = Object.freeze(["qualified-dividend", "long-term-capital-gain"]);

  /* The engine's closed ordered stage list for a federal, own-schedule pack. A pack whose
     calculationOrder differs is refused. CO-11 and CO-12 precede CO-8 because CO-8 is a sum
     over the declared leg set, and a leg computed after the sum could not be in it. */
  var CALCULATION_ORDER = Object.freeze([
    "CO-1", "CO-2", "CO-3", "CO-4", "CO-5", "CO-6", "CO-7", "CO-11", "CO-12", "CO-8", "CO-9", "CO-10"
  ]);

  /* The ordered array for a jurisdiction whose preferentialPolicy is "none": no carve-out
     stage, no stacking stage, and relief applied after rate application. */
  var CALCULATION_ORDER_NO_PREFERENTIAL = Object.freeze([
    "CO-1", "CO-2", "CO-3", "CO-5", "CO-6", "CO-14", "CO-8", "CO-13", "CO-9", "CO-10"
  ]);

  /* Every stage id the engine knows, so a rounding policy may name any declared stage. */
  var ALL_CALCULATION_STAGES = Object.freeze([
    "CO-1", "CO-2", "CO-3", "CO-4", "CO-5", "CO-6", "CO-7", "CO-8", "CO-9", "CO-10",
    "CO-11", "CO-12", "CO-13", "CO-14"
  ]);

  /* The closed four-kind component map. Total, and derived mechanically from the path grammar
     rather than declared per pack, so a pack author cannot choose a component's kind. */
  var COMPONENT_KINDS = Object.freeze(["rate", "breakpoint", "amount", "qualifier"]);

  var DOCUMENT_KINDS = Object.freeze({
    "revenue-procedure": true,
    "publication": true,
    "form-instructions": true,
    "newsroom-release": true,
    "constitutional-provision": true,
    "statute": true,
    "departmental-publication": true
  });

  /* A summary aids discovery and never supplies a value. */
  var NON_CITABLE_DOCUMENT_KINDS = Object.freeze({ "newsroom-release": true });

  var THRESHOLD_KINDS = Object.freeze({ "rate-step": true, "cliff": true, "phase-in": true });

  /* `ruleStatus` closes a gap the design schema left open: every result field must carry a
     RuleStatus, and the only honest source for it is the pack that declares the standing of
     the law it transcribed. It is required rather than defaulted. */
  var PACK_REQUIRED_MEMBERS = Object.freeze([
    "contractVersion", "id", "program", "jurisdiction", "version", "effectiveTaxYears",
    "publishedAt", "retrievedAt", "ruleStatus", "sourceRecords", "supportedFeatures",
    "unsupportedFeatures", "indexingRules", "calculationOrder", "roundingPolicy", "expiryPolicy",
    "contentSha256", "filingStatuses", "incomeKinds", "standardDeductions", "ordinaryRateTables",
    "preferentialRateTables"
  ]);

  /* The six members TaxRulePack/v2 adds. They are validated separately from the v1 twenty-two
     so the v1 required-member list — which the shipped pack's own assertions enumerate — keeps
     its identity while v2 gains its own mandatory shape. */
  var PACK_V2_REQUIRED_MEMBERS = Object.freeze([
    "imposesIndividualIncomeTax", "noTaxAuthority", "preferentialPolicy", "taxLegs",
    "thresholdSets", "reliefMechanisms"
  ]);

  /* Exact-key shapes. An unknown key on a present figure is a refusal, not an ignored field:
     without this a value smuggled beside a band list would be silently accepted. */
  var RATE_TABLE_V1_KEYS = Object.freeze([
    "bands", "contractVersion", "filingStatus", "kind", "locator", "sourceRef", "tableId"
  ]);
  var RATE_TABLE_V2_KEYS = Object.freeze([
    "bands", "componentSources", "contractVersion", "filingStatus", "kind", "locator",
    "sourceRef", "tableId"
  ]);
  var COMPONENT_SOURCE_KEYS = Object.freeze(["component", "contractVersion", "locator", "sourceRef"]);

  var THRESHOLD_APPLIES_TO = Object.freeze({
    "modified-adjusted-gross-income-excess-capped-by": true,
    "declared-basis-excess": true
  });

  /* A record that carries any of these cannot be an AbsentFigure; the shape exists precisely
     so that "unavailable" can never smuggle a number. */
  var VALUE_BEARING_MEMBERS = Object.freeze(["value", "amount", "rate", "bands", "default"]);

  var ABSENT_ALLOWED_CODES = Object.freeze({
    "RLTAX-THRESHOLD-UNAVAILABLE": true,
    "RLTAX-FEATURE-UNSUPPORTED": true
  });

  var TABLE_GROUPS = Object.freeze(["standardDeductions", "ordinaryRateTables", "preferentialRateTables"]);

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  /* The only TaxUnavailable constructor. Its return type is a record, never a number: the
     record carries no numeric member, so no construction path can produce a value. */
  function unavailable(code, domain, reason, whatWouldMakeItAvailable) {
    if (!isNonEmptyString(code) || RLTAX_CODES[code] !== true) {
      throw new Error("unavailable() refuses an unknown RLTAX code: " + String(code));
    }
    return Object.freeze({
      contractVersion: UNAVAILABLE_CONTRACT,
      code: code,
      domain: isNonEmptyString(domain) ? domain : "unnamed-domain",
      reason: isNonEmptyString(reason) ? reason : "no reason supplied",
      whatWouldMakeItAvailable: isNonEmptyString(whatWouldMakeItAvailable)
        ? whatWouldMakeItAvailable
        : "no remediation supplied"
    });
  }

  function isUnavailable(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === UNAVAILABLE_CONTRACT;
  }

  function isAbsentFigure(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === ABSENT_CONTRACT;
  }

  function isRateTable(candidate) {
    return isPlainObject(candidate) &&
      (candidate.contractVersion === RATE_TABLE_CONTRACT || candidate.contractVersion === RATE_TABLE_CONTRACT_V2);
  }

  function isRateTableV2(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === RATE_TABLE_CONTRACT_V2;
  }

  function isThresholdSet(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === THRESHOLD_SET_CONTRACT;
  }

  function isDeductionAmount(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === DEDUCTION_CONTRACT;
  }

  function sortedKeysOf(candidate) {
    return Object.keys(candidate).slice().sort();
  }

  /* The closed component-kind map. Derived from the path grammar, so the kind of a component is
     a fact about its path rather than a claim a pack author may make. Returns null — never a
     default — for a path outside the grammar. */
  function componentKindOf(componentPath) {
    if (!isNonEmptyString(componentPath)) return null;
    if (componentPath === "rate") return "rate";
    if (componentPath === "amount") return "amount";
    if (componentPath === "indexing" || componentPath === "applicationPoint") return "qualifier";
    var parts = componentPath.split(":");
    if (parts.length === 3 && parts[0] === "band" && parts[1].length > 0) {
      if (parts[2] === "rate") return "rate";
      if (parts[2] === "lowerInclusive" || parts[2] === "upperExclusive") return "breakpoint";
      return null;
    }
    if (parts.length === 2 && parts[1].length > 0) {
      if (parts[0] === "threshold" || parts[0] === "amount") return "amount";
      return null;
    }
    return null;
  }

  /* Does the enclosing figure actually carry the component this path names? A citation attached
     to a component that does not exist cites nothing. */
  function componentExistsOn(figure, componentPath) {
    if (!isPlainObject(figure)) return false;
    var parts = componentPath.split(":");
    if (isRateTable(figure)) {
      if (parts.length !== 3 || parts[0] !== "band") return false;
      if (parts[2] !== "rate" && parts[2] !== "lowerInclusive" && parts[2] !== "upperExclusive") return false;
      if (!Array.isArray(figure.bands)) return false;
      var index = 0;
      for (index = 0; index < figure.bands.length; index += 1) {
        if (figure.bands[index] && figure.bands[index].bandId === parts[1]) return true;
      }
      return false;
    }
    if (isThresholdSet(figure)) {
      if (componentPath === "rate" || componentPath === "indexing") return true;
      if (parts.length === 2 && parts[0] === "threshold") {
        return isPlainObject(figure.thresholds) &&
          Object.prototype.hasOwnProperty.call(figure.thresholds, parts[1]);
      }
      return false;
    }
    if (isReliefMechanism(figure)) {
      if (componentPath === "applicationPoint") return true;
      if (parts.length === 2 && parts[0] === "amount") {
        return isPlainObject(figure.amounts) &&
          Object.prototype.hasOwnProperty.call(figure.amounts, parts[1]);
      }
      return false;
    }
    if (isDeductionAmount(figure)) return componentPath === "amount";
    return false;
  }

  function findSourceRecord(pack, sourceId) {
    if (!isPlainObject(pack) || !Array.isArray(pack.sourceRecords)) return null;
    var index = 0;
    for (index = 0; index < pack.sourceRecords.length; index += 1) {
      if (pack.sourceRecords[index] && pack.sourceRecords[index].sourceId === sourceId) {
        return pack.sourceRecords[index];
      }
    }
    return null;
  }

  /* Which citation actually governs one component: the override when the figure carries one,
     the figure default otherwise. The returned record states which of the two it was, because
     the whole point of the override list is that a reader can see the unusual component. */
  function effectiveSourceFor(pack, figure, componentPath) {
    var domain = "component:" + String(componentPath);
    if (componentKindOf(componentPath) === null) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the component path is outside the closed component grammar",
        "name a component the grammar declares; componentKindOf returns no default");
    }
    if (!isPlainObject(figure)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the enclosing figure is missing or is not an object",
        "supply the figure that carries this component");
    }
    var origin = "inherited";
    var sourceRef = figure.sourceRef;
    var locator = figure.locator;
    var overrides = Array.isArray(figure.componentSources) ? figure.componentSources : [];
    var index = 0;
    for (index = 0; index < overrides.length; index += 1) {
      if (isPlainObject(overrides[index]) && overrides[index].component === componentPath) {
        origin = "overridden";
        sourceRef = overrides[index].sourceRef;
        locator = overrides[index].locator;
        break;
      }
    }
    if (!isNonEmptyString(sourceRef)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "no override names this component and the figure carries no default citation",
        "add a default sourceRef to the figure, or a componentSources entry naming this component");
    }
    var record = findSourceRecord(pack, sourceRef);
    if (record === null) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the effective sourceRef names no record in sourceRecords[]",
        "add a SourceRecord whose sourceId equals " + sourceRef);
    }
    return Object.freeze({
      title: record.title,
      url: record.url,
      retrievedAt: record.retrievedAt,
      locator: isNonEmptyString(locator) ? locator : "",
      sourceRef: sourceRef,
      origin: origin
    });
  }

  /* Per-component-kind year containment. Evaluated per kind and never against one flat
     whole-record year list, because one document can be authoritative for a rate it states
     without a year qualifier and non-authoritative for a dollar amount it labels with a
     different year. A flat list cannot express both at once. */
  function componentYearContainment(pack, figure, componentPath) {
    var kind = componentKindOf(componentPath);
    var domain = "component-year:" + String(componentPath);
    if (kind === null) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the component path is outside the closed component grammar",
        "name a component the grammar declares");
    }
    var effective = effectiveSourceFor(pack, figure, componentPath);
    if (isUnavailable(effective)) return effective;
    var record = findSourceRecord(pack, effective.sourceRef);
    var declaredYear = isPlainObject(pack) ? pack.declaredTaxYear : undefined;
    if (!Number.isFinite(declaredYear)) {
      declaredYear = (isPlainObject(pack) && Array.isArray(pack.effectiveTaxYears) && pack.effectiveTaxYears.length === 1)
        ? pack.effectiveTaxYears[0]
        : null;
    }
    if (!isPlainObject(record) || record.contractVersion !== SOURCE_CONTRACT_V2 ||
      !isPlainObject(record.declaredApplicableYearsByComponentKind)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "component " + componentPath + " of kind " + kind + " cites " + String(effective.sourceRef) +
        ", which declares no per-component-kind applicable-year map",
        "promote that source record to SourceRecord/v2 and state its declaredApplicableYearsByComponentKind");
    }
    var declared = record.declaredApplicableYearsByComponentKind[kind];
    if (declared === "year-invariant") return null;
    if (Array.isArray(declared) && declared.indexOf(declaredYear) >= 0) return null;
    return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
      "component " + componentPath + " of kind " + kind + " cites " + String(effective.sourceRef) +
      ", which does not declare that kind applicable to tax year " + String(declaredYear),
      "cite an authority that states this component for the declared tax year; no figure is carried between years");
  }

  /* The legal standing of a figure, derived from the figure itself rather than asserted by a
     caller. An absent figure is `unavailable`; a present figure inherits the pack's status. */
  function ruleStatusFor(pack, figure) {
    if (isAbsentFigure(figure) || isUnavailable(figure) || figure === null || figure === undefined) {
      return "unavailable";
    }
    if (!isPlainObject(pack) || !isNonEmptyString(pack.ruleStatus) || RULE_STATUS[pack.ruleStatus] !== true) {
      return "unavailable";
    }
    return pack.ruleStatus;
  }

  /* Turn an AbsentFigure into the refusal a stage raises when it reaches one. */
  function absentFigureRefusal(figure, domain) {
    var missing = isPlainObject(figure) && isPlainObject(figure.missingSource) ? figure.missingSource : null;
    var remediation = isPlainObject(figure) && isNonEmptyString(figure.whatWouldMakeItAvailable)
      ? figure.whatWouldMakeItAvailable
      : "retrieve the authority named by the pack's missingSource pointer";
    if (missing && isNonEmptyString(missing.title)) {
      remediation = remediation + " (missing source: " + missing.title + ")";
    }
    var code = isPlainObject(figure) && RLTAX_CODES[figure.code] === true
      ? figure.code
      : "RLTAX-THRESHOLD-UNAVAILABLE";
    var reason = isPlainObject(figure) && isNonEmptyString(figure.reason)
      ? figure.reason
      : "the resolved pack carries no figure for this domain";
    return unavailable(code, domain, reason, remediation);
  }

  /* Expand a figure's sourceRef into the displayable triple plus its locator. The title and
     URL are stored once in sourceRecords[] and referenced, so two citations of one authority
     cannot drift into two different titles. */
  function sourceForFigure(pack, figure) {
    var domain = "source:" + (isPlainObject(figure) && isNonEmptyString(figure.sourceRef) ? figure.sourceRef : "unnamed");
    if (!isPlainObject(pack) || !Array.isArray(pack.sourceRecords)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the pack carries no sourceRecords array",
        "supply a valid TaxRulePack whose sourceRecords[] is a non-empty array");
    }
    if (!isPlainObject(figure) || !isNonEmptyString(figure.sourceRef)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the figure carries no sourceRef",
        "add a sourceRef naming a retrieved SourceRecord to the figure");
    }
    var index = 0;
    for (index = 0; index < pack.sourceRecords.length; index += 1) {
      if (pack.sourceRecords[index] && pack.sourceRecords[index].sourceId === figure.sourceRef) {
        return Object.freeze({
          title: pack.sourceRecords[index].title,
          url: pack.sourceRecords[index].url,
          retrievedAt: pack.sourceRecords[index].retrievedAt,
          locator: isNonEmptyString(figure.locator) ? figure.locator : ""
        });
      }
    }
    return unavailable("RLTAX-PACK-INVALID", domain,
      "the figure's sourceRef names no record in sourceRecords[]",
      "add a SourceRecord whose sourceId equals " + figure.sourceRef);
  }

  /* The bytes a pack's contentSha256 covers: the pack itself with that self-referential member
     removed, in file key order. One definition, so the Node digest and any later consumer
     cannot disagree about what was hashed. */
  function packContentDigestInput(pack) {
    if (!isPlainObject(pack)) return "";
    var copy = {};
    var keys = Object.keys(pack);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (keys[index] !== "contentSha256") copy[keys[index]] = pack[keys[index]];
    }
    return JSON.stringify(copy);
  }

  function refuseMember(refusals, member, reason) {
    refusals.push(unavailable("RLTAX-PACK-INVALID", "pack-member:" + member, reason,
      "correct the pack's " + member + " member; no branch supplies a default for it"));
  }

  function validateSourceRecords(pack, refusals, absent) {
    var retrieved = {};
    var citable = {};
    /* An absent member was already refused once by name; refusing its shape too would name it twice. */
    if (absent.sourceRecords === true) return { retrieved: retrieved, citable: citable };
    if (!Array.isArray(pack.sourceRecords) || pack.sourceRecords.length === 0) {
      refuseMember(refusals, "sourceRecords", "sourceRecords must be a non-empty array of SourceRecord/v1");
      return { retrieved: retrieved, citable: citable };
    }
    var index = 0;
    for (index = 0; index < pack.sourceRecords.length; index += 1) {
      var record = pack.sourceRecords[index];
      var label = "sourceRecords[" + index + "]";
      if (!isPlainObject(record) ||
        (record.contractVersion !== SOURCE_CONTRACT && record.contractVersion !== SOURCE_CONTRACT_V2)) {
        refuseMember(refusals, label, "each source record must carry contractVersion " +
          SOURCE_CONTRACT + " or " + SOURCE_CONTRACT_V2);
        continue;
      }
      if (record.contractVersion === SOURCE_CONTRACT_V2) {
        validateApplicableYearMap(record, label, refusals);
      }
      if (!isNonEmptyString(record.sourceId)) {
        refuseMember(refusals, label + ".sourceId", "a source record needs a non-empty sourceId");
        continue;
      }
      if (!isNonEmptyString(record.title) || !isNonEmptyString(record.url) || !isNonEmptyString(record.publisher)) {
        refuseMember(refusals, label + ".title/url/publisher", "a source record needs a title, url and publisher");
      } else if (!isSafeSourceUrl(record.url)) {
        refuseMember(refusals, label + ".url", "a source record url must be an https URL; the route writes it into an href, so any other scheme is refused rather than rendered");
      }
      if (DOCUMENT_KINDS[record.documentKind] !== true) {
        refuseMember(refusals, label + ".documentKind", "documentKind must be one of the four declared kinds");
      }
      if (!DATE_PATTERN.test(String(record.publishedAt))) {
        refuseMember(refusals, label + ".publishedAt", "publishedAt must be YYYY-MM-DD");
      }
      if (record.retrievalOutcome !== "retrieved" && record.retrievalOutcome !== "not-retrieved") {
        refuseMember(refusals, label + ".retrievalOutcome", "retrievalOutcome must be retrieved or not-retrieved");
        continue;
      }
      if (record.retrievalOutcome === "not-retrieved" && !isNonEmptyString(record.retrievalNote)) {
        refuseMember(refusals, label + ".retrievalNote", "a not-retrieved source must carry a retrievalNote");
      }
      if (record.retrievalOutcome === "retrieved") {
        if (!TIMESTAMP_PATTERN.test(String(record.retrievedAt))) {
          refuseMember(refusals, label + ".retrievedAt", "a retrieved source needs an ISO-8601 retrievedAt with milliseconds");
        }
        retrieved[record.sourceId] = true;
        if (NON_CITABLE_DOCUMENT_KINDS[record.documentKind] !== true) citable[record.sourceId] = true;
      }
    }
    return { retrieved: retrieved, citable: citable };
  }

  /* A value cannot come from a document nobody opened, and a summary never supplies a value. */
  function validateCitation(figure, label, sources, refusals) {
    if (!isNonEmptyString(figure.sourceRef)) {
      refuseMember(refusals, label + ".sourceRef", "every figure-bearing record needs a sourceRef");
      return;
    }
    if (!isNonEmptyString(figure.locator)) {
      refuseMember(refusals, label + ".locator", "every figure-bearing record needs a locator");
    }
    if (sources.retrieved[figure.sourceRef] !== true) {
      refuseMember(refusals, label + ".sourceRef",
        "a figure may reference only a retrieved source; " + figure.sourceRef + " is absent or not-retrieved");
      return;
    }
    if (sources.citable[figure.sourceRef] !== true) {
      refuseMember(refusals, label + ".sourceRef",
        "a newsroom-release may not be the sourceRef of a figure; " + figure.sourceRef + " is a summary");
    }
  }

  /* SourceRecord/v2's one added member, and the reason v2 exists. The map is TOTAL over the
     four kinds: a missing kind is a refusal rather than a permissive absence. An empty array is
     a legal value meaning the document establishes nothing for that kind, and it makes every
     component of that kind citing this record refuse. "year-invariant" is a positive cited
     claim about the document and is admissible only with a basis naming what establishes it. */
  function validateApplicableYearMap(record, label, refusals) {
    var map = record.declaredApplicableYearsByComponentKind;
    if (!isPlainObject(map)) {
      refuseMember(refusals, label + ".declaredApplicableYearsByComponentKind",
        "a SourceRecord/v2 must carry a total declaredApplicableYearsByComponentKind map over the four component kinds");
      return;
    }
    var index = 0;
    for (index = 0; index < COMPONENT_KINDS.length; index += 1) {
      var kind = COMPONENT_KINDS[index];
      var kindLabel = label + ".declaredApplicableYearsByComponentKind." + kind;
      if (!Object.prototype.hasOwnProperty.call(map, kind)) {
        refuseMember(refusals, kindLabel, "the applicable-year map must name every component kind; a missing kind is not a permissive default");
        continue;
      }
      var value = map[kind];
      if (value === "year-invariant") {
        var basis = record.yearInvarianceBasis;
        if (!isPlainObject(basis) || !isNonEmptyString(basis[kind])) {
          refuseMember(refusals, kindLabel,
            "year-invariant is admissible only with a yearInvarianceBasis naming what in the retrieved text establishes the absence of a year qualifier");
        }
        continue;
      }
      if (!Array.isArray(value)) {
        refuseMember(refusals, kindLabel, "each kind must carry an array of integer years or the literal string year-invariant");
        continue;
      }
      var yearIndex = 0;
      for (yearIndex = 0; yearIndex < value.length; yearIndex += 1) {
        if (!Number.isFinite(value[yearIndex]) || Math.floor(value[yearIndex]) !== value[yearIndex]) {
          refuseMember(refusals, kindLabel, "each declared applicable year must be an integer");
          break;
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(record, "yearInvarianceBasis") &&
      !isPlainObject(record.yearInvarianceBasis)) {
      refuseMember(refusals, label + ".yearInvarianceBasis", "yearInvarianceBasis must be an object keyed by component kind");
    }
  }

  /* Every override resolves to a component that exists, no component has two authorities, every
     sourceRef names a retrieved non-newsroom record, and every entry carries a locator. Each
     violation is refused once, with the component named. */
  function validateComponentSources(figure, label, sources, refusals) {
    var overrides = figure.componentSources;
    if (overrides === undefined) return;
    if (!Array.isArray(overrides)) {
      refuseMember(refusals, label + ".componentSources", "componentSources must be an array; an empty array declares no override");
      return;
    }
    var seen = {};
    var index = 0;
    for (index = 0; index < overrides.length; index += 1) {
      var entry = overrides[index];
      var entryLabel = label + ".componentSources[" + index + "]";
      if (!isPlainObject(entry) || entry.contractVersion !== COMPONENT_SOURCE_CONTRACT) {
        refuseMember(refusals, entryLabel, "each component source must carry contractVersion " + COMPONENT_SOURCE_CONTRACT);
        continue;
      }
      if (JSON.stringify(sortedKeysOf(entry)) !== JSON.stringify(COMPONENT_SOURCE_KEYS.slice())) {
        refuseMember(refusals, entryLabel, "a component source carries an unknown or missing key");
        continue;
      }
      var path = entry.component;
      if (componentKindOf(path) === null) {
        refuseMember(refusals, entryLabel + ".component", "the component path is outside the closed component grammar");
        continue;
      }
      if (!componentExistsOn(figure, path)) {
        refuseMember(refusals, entryLabel + ".component",
          "the component path names no component of the enclosing figure: " + String(path));
        continue;
      }
      if (seen[path] === true) {
        refuseMember(refusals, entryLabel + ".component",
          "two entries name the same component " + String(path) + "; a component with two authorities has no single answer");
        continue;
      }
      seen[path] = true;
      if (!isNonEmptyString(entry.locator)) {
        refuseMember(refusals, entryLabel + ".locator", "a sourceRef without a locator is not a citation");
      }
      if (!isNonEmptyString(entry.sourceRef) || sources.retrieved[entry.sourceRef] !== true) {
        refuseMember(refusals, entryLabel + ".sourceRef",
          "a component may reference only a retrieved source; " + String(entry.sourceRef) + " is absent or not-retrieved");
        continue;
      }
      if (sources.citable[entry.sourceRef] !== true) {
        refuseMember(refusals, entryLabel + ".sourceRef",
          "a newsroom-release may not be the sourceRef of a component; " + entry.sourceRef + " is a summary");
      }
    }
  }

  /* Every component of a v2 figure — overridden or inherited — must cite a record that declares
     that component's KIND applicable to the pack's declared tax year. */
  function validateComponentYears(pack, figure, componentPaths, label, refusals) {
    var index = 0;
    for (index = 0; index < componentPaths.length; index += 1) {
      var refusal = componentYearContainment(pack, figure, componentPaths[index]);
      if (refusal !== null) {
        refusals.push(unavailable(refusal.code, "pack-member:" + label + "." + componentPaths[index],
          refusal.reason, refusal.whatWouldMakeItAvailable));
      }
    }
  }

  function rateTableComponentPaths(table) {
    var paths = [];
    if (!Array.isArray(table.bands)) return paths;
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      var band = table.bands[index];
      if (!isPlainObject(band) || !isNonEmptyString(band.bandId)) continue;
      paths.push("band:" + band.bandId + ":rate");
      paths.push("band:" + band.bandId + ":lowerInclusive");
      if (band.upperExclusive !== null) paths.push("band:" + band.bandId + ":upperExclusive");
    }
    return paths;
  }

  function validateAbsentFigure(figure, label, refusals) {
    var index = 0;
    for (index = 0; index < VALUE_BEARING_MEMBERS.length; index += 1) {
      if (Object.prototype.hasOwnProperty.call(figure, VALUE_BEARING_MEMBERS[index])) {
        refuseMember(refusals, label + "." + VALUE_BEARING_MEMBERS[index],
          "an AbsentFigure may not carry a value-bearing member");
      }
    }
    if (ABSENT_ALLOWED_CODES[figure.code] !== true) {
      refuseMember(refusals, label + ".code", "an AbsentFigure code must be RLTAX-THRESHOLD-UNAVAILABLE or RLTAX-FEATURE-UNSUPPORTED");
    }
    if (!isNonEmptyString(figure.domain) || !isNonEmptyString(figure.reason) || !isNonEmptyString(figure.whatWouldMakeItAvailable)) {
      refuseMember(refusals, label + ".reason", "an AbsentFigure needs a domain, a reason and a remediation");
    }
    if (!isPlainObject(figure.missingSource) || !isNonEmptyString(figure.missingSource.title) ||
      !isNonEmptyString(figure.missingSource.url) || !isNonEmptyString(figure.missingSource.locator)) {
      refuseMember(refusals, label + ".missingSource", "an AbsentFigure must name the authority that would supply the figure");
    }
  }

  function validateBands(table, label, refusals) {
    if (!Array.isArray(table.bands) || table.bands.length === 0) {
      refuseMember(refusals, label + ".bands", "a rate table needs a non-empty ordered band list");
      return;
    }
    var index = 0;
    var previousUpper = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      var band = table.bands[index];
      var bandLabel = label + ".bands[" + index + "]";
      if (!isPlainObject(band) || !isNonEmptyString(band.bandId)) {
        refuseMember(refusals, bandLabel + ".bandId", "each band needs a bandId");
        return;
      }
      if (!Number.isFinite(band.lowerInclusive)) {
        refuseMember(refusals, bandLabel + ".lowerInclusive", "each band needs a finite lowerInclusive");
        return;
      }
      if (band.lowerInclusive !== previousUpper) {
        refuseMember(refusals, bandLabel + ".lowerInclusive",
          "bands must be contiguous: expected " + previousUpper + " and found " + band.lowerInclusive);
        return;
      }
      var last = index === table.bands.length - 1;
      if (last) {
        if (band.upperExclusive !== null) {
          refuseMember(refusals, bandLabel + ".upperExclusive", "the last band must be unbounded above with upperExclusive null");
        }
      } else {
        if (!Number.isFinite(band.upperExclusive) || band.upperExclusive <= band.lowerInclusive) {
          refuseMember(refusals, bandLabel + ".upperExclusive", "a non-final band needs a finite upperExclusive above its lowerInclusive");
          return;
        }
        previousUpper = band.upperExclusive;
      }
      if (!Number.isFinite(band.rate) || band.rate < 0 || band.rate > 1) {
        refuseMember(refusals, bandLabel + ".rate", "a band rate must be a number in [0, 1]");
      }
      if (THRESHOLD_KINDS[band.thresholdKind] !== true) {
        refuseMember(refusals, bandLabel + ".thresholdKind", "thresholdKind must be rate-step, cliff or phase-in");
      }
    }
  }

  function validateFigureGroup(pack, group, sources, refusals, absent) {
    var figures = pack[group];
    if (absent[group] === true) return;
    if (!isPlainObject(figures)) {
      refuseMember(refusals, group, group + " must be an object keyed by every declared filing status");
      return;
    }
    var statuses = Array.isArray(pack.filingStatuses) ? pack.filingStatuses : [];
    var index = 0;
    for (index = 0; index < statuses.length; index += 1) {
      var status = statuses[index];
      var label = group + "." + status;
      if (!Object.prototype.hasOwnProperty.call(figures, status)) {
        refuseMember(refusals, label, "a missing key is indistinguishable from a transcription mistake; state absence with an AbsentFigure");
        continue;
      }
      var figure = figures[status];
      if (figure === null || figure === undefined) {
        refuseMember(refusals, label, "null is not an absence statement; use an AbsentFigure record");
        continue;
      }
      if (isAbsentFigure(figure)) {
        validateAbsentFigure(figure, label, refusals);
        continue;
      }
      if (group === "standardDeductions") {
        if (!isDeductionAmount(figure)) {
          refuseMember(refusals, label, "a present standard deduction must be a DeductionAmount/v1 or an AbsentFigure/v1");
          continue;
        }
        if (!Number.isFinite(figure.amount) || figure.amount < 0) {
          refuseMember(refusals, label + ".amount", "a deduction amount must be a finite non-negative number");
        }
        if (figure.filingStatus !== status) {
          refuseMember(refusals, label + ".filingStatus", "a deduction record must name the filing status it is keyed under");
        }
        validateCitation(figure, label, sources, refusals);
        continue;
      }
      if (!isRateTable(figure)) {
        refuseMember(refusals, label, "a present rate table must be a RateTable/v1, a RateTable/v2 or an AbsentFigure/v1");
        continue;
      }
      var expectedKeys = isRateTableV2(figure) ? RATE_TABLE_V2_KEYS : RATE_TABLE_V1_KEYS;
      if (JSON.stringify(sortedKeysOf(figure)) !== JSON.stringify(expectedKeys.slice())) {
        var extraIndex = 0;
        var named = false;
        for (extraIndex = 0; extraIndex < VALUE_BEARING_MEMBERS.length; extraIndex += 1) {
          var member = VALUE_BEARING_MEMBERS[extraIndex];
          if (expectedKeys.indexOf(member) < 0 && Object.prototype.hasOwnProperty.call(figure, member)) {
            refuseMember(refusals, label + "." + member,
              "a rate table may not carry a value-bearing member beside its band list");
            named = true;
          }
        }
        if (!named) {
          refuseMember(refusals, label, "a rate table carries an unknown or missing key");
        }
      }
      if (figure.filingStatus !== status) {
        refuseMember(refusals, label + ".filingStatus", "a rate table must name the filing status it is keyed under");
      }
      var expectedKind = group === "ordinaryRateTables" ? "ordinary" : "preferential";
      if (figure.kind !== expectedKind) {
        refuseMember(refusals, label + ".kind", "the table kind must be " + expectedKind);
      }
      if (!isNonEmptyString(figure.tableId)) {
        refuseMember(refusals, label + ".tableId", "a rate table needs a tableId");
      }
      validateBands(figure, label, refusals);
      validateCitation(figure, label, sources, refusals);
      if (isRateTableV2(figure)) {
        validateComponentSources(figure, label, sources, refusals);
        validateComponentYears(pack, figure, rateTableComponentPaths(figure), label, refusals);
      }
    }
  }

  function validateRoundingPolicy(pack, sources, refusals, absent) {
    var policy = pack.roundingPolicy;
    if (absent.roundingPolicy === true) return;
    if (!isPlainObject(policy) || policy.contractVersion !== ROUNDING_CONTRACT) {
      refuseMember(refusals, "roundingPolicy", "roundingPolicy must carry contractVersion " + ROUNDING_CONTRACT);
      return;
    }
    if (!Array.isArray(policy.calculationStages)) {
      refuseMember(refusals, "roundingPolicy.calculationStages", "calculationStages must be an array; an empty array declares no rounding");
    } else {
      var index = 0;
      for (index = 0; index < policy.calculationStages.length; index += 1) {
        var stage = policy.calculationStages[index];
        var label = "roundingPolicy.calculationStages[" + index + "]";
        if (!isPlainObject(stage) || ALL_CALCULATION_STAGES.indexOf(stage.stageId) < 0) {
          refuseMember(refusals, label + ".stageId", "a rounding stage must name a declared calculation stage");
          continue;
        }
        if (stage.mode !== "none" && stage.mode !== "nearest-dollar" && stage.mode !== "nearest-cent") {
          refuseMember(refusals, label + ".mode", "a rounding mode must be none, nearest-dollar or nearest-cent");
        }
        validateCitation(stage, label, sources, refusals);
      }
    }
    if (policy.displayStageIsSeparate !== true) {
      refuseMember(refusals, "roundingPolicy.displayStageIsSeparate", "display rounding is a separate stage owned by the view");
    }
    if (!Number.isFinite(policy.reconciliationTolerance) || policy.reconciliationTolerance < 0) {
      refuseMember(refusals, "roundingPolicy.reconciliationTolerance", "the reconciliation tolerance must be a finite non-negative number");
    }
  }

  function validateExpiryPolicy(pack, refusals, absent) {
    var policy = pack.expiryPolicy;
    if (absent.expiryPolicy === true) return;
    if (!isPlainObject(policy) || policy.contractVersion !== EXPIRY_CONTRACT) {
      refuseMember(refusals, "expiryPolicy", "expiryPolicy must carry contractVersion " + EXPIRY_CONTRACT);
      return;
    }
    if (!DATE_PATTERN.test(String(policy.expiresAt))) {
      refuseMember(refusals, "expiryPolicy.expiresAt", "expiresAt must be YYYY-MM-DD");
    }
    if (policy.onExpiry !== "refuse") {
      refuseMember(refusals, "expiryPolicy.onExpiry", "onExpiry is closed to refuse; there is no fallback to an earlier pack");
    }
    if (!isNonEmptyString(policy.reason)) {
      refuseMember(refusals, "expiryPolicy.reason", "expiryPolicy needs a reason");
    }
  }

  function validateFeatureLists(pack, refusals, absent) {
    var lists = ["supportedFeatures", "unsupportedFeatures"];
    var listIndex = 0;
    for (listIndex = 0; listIndex < lists.length; listIndex += 1) {
      var name = lists[listIndex];
      var list = pack[name];
      if (absent[name] === true) continue;
      if (!Array.isArray(list) || list.length === 0) {
        refuseMember(refusals, name, name + " must be a non-empty array; coverage is stated, never inferred");
        continue;
      }
      var index = 0;
      for (index = 0; index < list.length; index += 1) {
        var entry = list[index];
        var label = name + "[" + index + "]";
        if (!isPlainObject(entry) || !isNonEmptyString(entry.id) || !isNonEmptyString(entry.label) || !isNonEmptyString(entry.reason)) {
          refuseMember(refusals, label, "each feature entry needs an id, a label and a reason");
          continue;
        }
        if (name === "unsupportedFeatures") {
          if (RLTAX_CODES[entry.code] !== true) {
            refuseMember(refusals, label + ".code", "each unsupported feature needs a code from the closed RLTAX vocabulary");
          }
          if (typeof entry.movesMarginalRate !== "boolean") {
            refuseMember(refusals, label + ".movesMarginalRate", "each unsupported feature must declare movesMarginalRate as a boolean");
          }
        }
      }
    }
  }

  /* The shape both federal surtaxes use, and the shape a later Medicare or premium-credit pack
     will reuse. `indexing.declaredFor` is the load-bearing member: it converts "the retrieved
     page did not say which year these apply to" from a judgement call into a refusal. */
  function validateThresholdSet(pack, set, label, sources, refusals) {
    if (!isThresholdSet(set)) {
      refuseMember(refusals, label, "a present threshold set must be a ThresholdSet/v1 or an AbsentFigure/v1");
      return;
    }
    if (!isNonEmptyString(set.thresholdSetId)) {
      refuseMember(refusals, label + ".thresholdSetId", "a threshold set needs a thresholdSetId");
    }
    if (!Number.isFinite(set.rate) || set.rate < 0 || set.rate > 1) {
      refuseMember(refusals, label + ".rate", "a threshold set rate must be a number in [0, 1]");
    }
    if (typeof set.varyByFilingStatus !== "boolean") {
      refuseMember(refusals, label + ".varyByFilingStatus", "varyByFilingStatus must be declared as a boolean");
    }
    if (!isPlainObject(set.thresholds)) {
      refuseMember(refusals, label + ".thresholds", "a threshold set needs a thresholds map");
    } else if (set.varyByFilingStatus === true) {
      var statuses = Array.isArray(pack.filingStatuses) ? pack.filingStatuses : SUPPORTED_FILING_STATUSES;
      if (JSON.stringify(sortedKeysOf(set.thresholds)) !== JSON.stringify(statuses.slice().sort())) {
        refuseMember(refusals, label + ".thresholds",
          "a status-varying threshold set must carry exactly one threshold per declared filing status");
      }
      var statusIndex = 0;
      for (statusIndex = 0; statusIndex < statuses.length; statusIndex += 1) {
        var amount = set.thresholds[statuses[statusIndex]];
        if (!Number.isFinite(amount) || amount < 0) {
          refuseMember(refusals, label + ".thresholds." + statuses[statusIndex],
            "each declared threshold must be a finite non-negative number");
        }
      }
    } else if (JSON.stringify(sortedKeysOf(set.thresholds)) !== JSON.stringify(["all"])) {
      refuseMember(refusals, label + ".thresholds",
        "a threshold set that does not vary by filing status carries exactly one key: all");
    } else if (!Number.isFinite(set.thresholds.all) || set.thresholds.all < 0) {
      refuseMember(refusals, label + ".thresholds.all", "the single declared threshold must be a finite non-negative number");
    }
    if (THRESHOLD_APPLIES_TO[set.appliesTo] !== true) {
      refuseMember(refusals, label + ".appliesTo", "appliesTo is closed to the two declared members");
    }
    if (!isNonEmptyString(set.basisMember)) {
      refuseMember(refusals, label + ".basisMember", "a threshold set names the workspace member supplying its basis");
    }
    if (set.appliesTo === "modified-adjusted-gross-income-excess-capped-by") {
      if (!isNonEmptyString(set.capMember)) {
        refuseMember(refusals, label + ".capMember", "the capped shape requires a non-null capMember");
      }
    } else if (set.appliesTo === "declared-basis-excess" && set.capMember !== null) {
      refuseMember(refusals, label + ".capMember", "the uncapped shape requires capMember to be null");
    }
    if (!isPlainObject(set.indexing) || typeof set.indexing.indexed !== "boolean" ||
      !Array.isArray(set.indexing.declaredFor)) {
      refuseMember(refusals, label + ".indexing", "indexing must declare an indexed boolean and a declaredFor year array");
    }
    validateCitation(set, label, sources, refusals);
    validateComponentSources(set, label, sources, refusals);
  }

  /* The declared tax year must be a member of indexing.declaredFor, or the whole set is refused
     rather than applied. An empty or absent array is never permission. */
  function thresholdSetYearRefusal(pack, set, domain) {
    var declaredYear = (isPlainObject(pack) && Array.isArray(pack.effectiveTaxYears) && pack.effectiveTaxYears.length === 1)
      ? pack.effectiveTaxYears[0]
      : null;
    if (isPlainObject(set) && isPlainObject(set.indexing) && Array.isArray(set.indexing.declaredFor) &&
      set.indexing.declaredFor.indexOf(declaredYear) >= 0) {
      return null;
    }
    return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
      "the threshold set does not declare itself applicable to tax year " + String(declaredYear),
      "retrieve an authority that states these thresholds for the declared tax year; no threshold is carried between years");
  }

  function validateThresholdSets(pack, sources, refusals) {
    var sets = pack.thresholdSets;
    if (!isPlainObject(sets)) {
      refuseMember(refusals, "thresholdSets", "thresholdSets must be an object keyed by threshold set id");
      return;
    }
    var keys = Object.keys(sets);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var label = "thresholdSets." + keys[index];
      var set = sets[keys[index]];
      if (isAbsentFigure(set)) {
        validateAbsentFigure(set, label, refusals);
        continue;
      }
      validateThresholdSet(pack, set, label, sources, refusals);
    }
  }

  /* A leg whose figure is an AbsentFigure produces a refusal and CO-8 inherits it.
     `includedInTotal: false` carries a leg for display without changing the total; it is not a
     mechanism for excluding a refusal from a total, so a false leg over an absent figure is
     refused. */
  function resolveFigureRef(pack, figureRef, filingStatus) {
    if (!isNonEmptyString(figureRef)) return undefined;
    var parts = figureRef.split(".");
    if (parts.length === 1) {
      var group = pack[parts[0]];
      if (!isPlainObject(group)) return undefined;
      if (isNonEmptyString(filingStatus)) return group[filingStatus];
      return group;
    }
    if (parts.length === 2 && isPlainObject(pack[parts[0]])) return pack[parts[0]][parts[1]];
    return undefined;
  }

  function validateTaxLegs(pack, refusals) {
    var legs = pack.taxLegs;
    if (!Array.isArray(legs) || legs.length === 0) {
      refuseMember(refusals, "taxLegs", "taxLegs must be a non-empty array of TaxLeg/v1");
      return;
    }
    var seen = {};
    var index = 0;
    for (index = 0; index < legs.length; index += 1) {
      var leg = legs[index];
      var label = "taxLegs[" + index + "]";
      if (!isPlainObject(leg) || leg.contractVersion !== TAX_LEG_CONTRACT) {
        refuseMember(refusals, label, "each tax leg must carry contractVersion " + TAX_LEG_CONTRACT);
        continue;
      }
      if (!isNonEmptyString(leg.legId)) {
        refuseMember(refusals, label + ".legId", "each tax leg needs a legId");
        continue;
      }
      if (seen[leg.legId] === true) {
        refuseMember(refusals, label + ".legId", "tax leg ids must be unique; " + leg.legId + " is declared twice");
        continue;
      }
      seen[leg.legId] = true;
      if (ALL_CALCULATION_STAGES.indexOf(leg.stageId) < 0) {
        refuseMember(refusals, label + ".stageId", "a tax leg must name a declared calculation stage");
      }
      if (typeof leg.includedInTotal !== "boolean") {
        refuseMember(refusals, label + ".includedInTotal", "includedInTotal must be declared as a boolean");
      }
      var resolved = resolveFigureRef(pack, leg.figureRef, null);
      if (resolved === undefined) {
        refuseMember(refusals, label + ".figureRef",
          "the figureRef names a figure the pack does not carry: " + String(leg.figureRef));
        continue;
      }
      if (leg.includedInTotal === false && isAbsentFigure(resolved)) {
        refuseMember(refusals, label + ".includedInTotal",
          "includedInTotal false is not a mechanism for excluding a refusal from a total; this leg's figure is absent");
      }
    }
  }

  function isSourcedZero(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === SOURCED_ZERO_CONTRACT;
  }

  function isReliefMechanism(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === RELIEF_CONTRACT;
  }

  /* A jurisdiction is a pattern rather than a list, so no module holds a state name or a postal
     code and a malformed, lowercase, three-letter or path-traversing code is refused. */
  function isSupportedJurisdiction(jurisdiction) {
    return typeof jurisdiction === "string" && JURISDICTION_PATTERN.test(jurisdiction);
  }

  /* Three rules make a sourced zero a real object rather than a decorated zero: the value is the
     literal zero and no other value validates, the citation is required, and contractVersion is
     the discriminator every consumer branches on. A renderer that tested `value === 0` would
     collapse this back into the failure mode the shape exists to prevent. */
  function validateSourcedZero(record) {
    var refusals = [];
    if (!isSourcedZero(record)) {
      refuseMember(refusals, "sourcedZero", "a sourced zero must carry contractVersion " + SOURCED_ZERO_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (JSON.stringify(sortedKeysOf(record)) !== JSON.stringify(SOURCED_ZERO_KEYS.slice())) {
      refuseMember(refusals, "sourcedZero", "a sourced zero carries an unknown or missing key");
    }
    if (record.value !== 0) {
      refuseMember(refusals, "sourcedZero.value", "a sourced zero carries the literal zero and no other value validates");
    }
    if (!isNonEmptyString(record.sourceRef) || !isNonEmptyString(record.locator)) {
      refuseMember(refusals, "sourcedZero.sourceRef", "a zero with no citation is an AbsentFigure, not a SourcedZero");
    }
    if (!isNonEmptyString(record.reason) || !isNonEmptyString(record.domain)) {
      refuseMember(refusals, "sourcedZero.reason", "a sourced zero names the domain it covers and why the authority establishes that nothing is owed");
    }
    if (RULE_STATUS[record.ruleStatus] !== true) {
      refuseMember(refusals, "sourcedZero.ruleStatus", "a sourced zero carries a member of the closed RuleStatus enum");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* Build the sourced zero a no-tax pack's declared authority establishes. Refuses rather than
     returning a bare zero when the pack does not actually carry that authority. */
  function sourcedZeroFor(pack, domain) {
    if (!isPlainObject(pack) || pack.imposesIndividualIncomeTax !== false) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "a sourced zero may be produced only by a pack that declares it imposes no individual income tax",
        "resolve a pack whose imposesIndividualIncomeTax is false and whose noTaxAuthority names the establishing authority");
    }
    var authority = pack.noTaxAuthority;
    if (!isPlainObject(authority) || !isNonEmptyString(authority.sourceRef) ||
      !isNonEmptyString(authority.locator) || !isNonEmptyString(authority.reason)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the pack states no authority establishing the absence of the tax",
        "author a pack whose noTaxAuthority names a retrieved source record, its locator and the reason");
    }
    var record = Object.freeze({
      contractVersion: SOURCED_ZERO_CONTRACT,
      value: 0,
      ruleStatus: ruleStatusFor(pack, pack),
      domain: domain,
      reason: authority.reason,
      sourceRef: authority.sourceRef,
      locator: authority.locator
    });
    var shape = validateSourcedZero(record);
    if (!shape.ok) return shape.refusals[0];
    return record;
  }

  /* `appliesToLegs[]` is the member that keeps a jurisdiction's surcharge outside its exemption
     credit. It is a pack field, so the engine applies relief to exactly the named legs and to no
     others, and no engine branch knows that any particular relief behaves unusually. */
  function validateReliefMechanisms(pack, sources, refusals) {
    var list = pack.reliefMechanisms;
    if (!Array.isArray(list)) return;
    var declaredLegIds = {};
    var legIndex = 0;
    var legs = Array.isArray(pack.taxLegs) ? pack.taxLegs : [];
    for (legIndex = 0; legIndex < legs.length; legIndex += 1) {
      if (isPlainObject(legs[legIndex]) && isNonEmptyString(legs[legIndex].legId)) {
        declaredLegIds[legs[legIndex].legId] = true;
      }
    }
    var seen = {};
    var index = 0;
    for (index = 0; index < list.length; index += 1) {
      var relief = list[index];
      var label = "reliefMechanisms[" + index + "]";
      if (isAbsentFigure(relief)) {
        validateAbsentFigure(relief, label, refusals);
        continue;
      }
      if (!isReliefMechanism(relief)) {
        refuseMember(refusals, label, "each relief mechanism must be a " + RELIEF_CONTRACT + " or an AbsentFigure/v1");
        continue;
      }
      if (JSON.stringify(sortedKeysOf(relief)) !== JSON.stringify(RELIEF_KEYS.slice().sort())) {
        refuseMember(refusals, label, "a relief mechanism carries an unknown or missing key");
      }
      if (!isNonEmptyString(relief.mechanismId)) {
        refuseMember(refusals, label + ".mechanismId", "a relief mechanism needs a mechanismId");
      } else if (seen[relief.mechanismId] === true) {
        refuseMember(refusals, label + ".mechanismId", "relief mechanism ids must be unique; " + relief.mechanismId + " is declared twice");
      } else {
        seen[relief.mechanismId] = true;
      }
      if (RELIEF_KINDS[relief.kind] !== true) {
        refuseMember(refusals, label + ".kind", "kind is closed to deduction-from-income and credit-against-tax");
      }
      if (RELIEF_APPLICATION_POINTS[relief.applicationPoint] !== true) {
        refuseMember(refusals, label + ".applicationPoint", "applicationPoint is closed to before-rate-application and after-rate-application");
      }
      if (RELIEF_KINDS[relief.kind] === true && RELIEF_APPLICATION_POINTS[relief.applicationPoint] === true &&
        RELIEF_COHERENT_POINT[relief.kind] !== relief.applicationPoint) {
        refuseMember(refusals, label + ".applicationPoint",
          "a credit applied before rate application and a deduction applied after it are each incoherent; " +
          relief.kind + " applies " + RELIEF_COHERENT_POINT[relief.kind]);
      }
      if (typeof relief.varyByFilingStatus !== "boolean") {
        refuseMember(refusals, label + ".varyByFilingStatus", "varyByFilingStatus must be declared as a boolean");
      }
      if (!Array.isArray(relief.appliesToLegs) || relief.appliesToLegs.length === 0) {
        refuseMember(refusals, label + ".appliesToLegs", "a relief mechanism names the legs it applies to; an empty list applies to nothing");
      } else {
        var namedIndex = 0;
        for (namedIndex = 0; namedIndex < relief.appliesToLegs.length; namedIndex += 1) {
          if (declaredLegIds[relief.appliesToLegs[namedIndex]] !== true) {
            refuseMember(refusals, label + ".appliesToLegs",
              "a relief mechanism may not name a leg the pack does not declare: " + String(relief.appliesToLegs[namedIndex]));
          }
        }
      }
      if (!isPlainObject(relief.amounts)) {
        refuseMember(refusals, label + ".amounts", "a relief mechanism needs an amounts map");
      } else if (relief.varyByFilingStatus === true) {
        var statuses = Array.isArray(pack.filingStatuses) ? pack.filingStatuses : SUPPORTED_FILING_STATUSES;
        if (JSON.stringify(sortedKeysOf(relief.amounts)) !== JSON.stringify(statuses.slice().sort())) {
          refuseMember(refusals, label + ".amounts",
            "a status-varying relief mechanism carries exactly one amount per declared filing status");
        }
        var statusIndex = 0;
        for (statusIndex = 0; statusIndex < statuses.length; statusIndex += 1) {
          var amount = relief.amounts[statuses[statusIndex]];
          if (isAbsentFigure(amount)) {
            validateAbsentFigure(amount, label + ".amounts." + statuses[statusIndex], refusals);
            continue;
          }
          if (!Number.isFinite(amount) || amount < 0) {
            refuseMember(refusals, label + ".amounts." + statuses[statusIndex],
              "each declared relief amount must be a finite non-negative number or an AbsentFigure/v1");
          }
        }
      } else if (JSON.stringify(sortedKeysOf(relief.amounts)) !== JSON.stringify(["all"])) {
        refuseMember(refusals, label + ".amounts",
          "a relief mechanism that does not vary by filing status carries exactly one key: all");
      } else if (!isAbsentFigure(relief.amounts.all) && (!Number.isFinite(relief.amounts.all) || relief.amounts.all < 0)) {
        refuseMember(refusals, label + ".amounts.all",
          "the single declared relief amount must be a finite non-negative number or an AbsentFigure/v1");
      }
      validateCitation(relief, label, sources, refusals);
      validateComponentSources(relief, label, sources, refusals);
    }
  }

  /* Every member TaxRulePack/v2 adds, plus the coherence rules between them. */
  function validatePackV2Members(pack, sources, refusals) {
    var index = 0;
    for (index = 0; index < PACK_V2_REQUIRED_MEMBERS.length; index += 1) {
      var member = PACK_V2_REQUIRED_MEMBERS[index];
      if (!Object.prototype.hasOwnProperty.call(pack, member)) {
        refuseMember(refusals, member, "a required TaxRulePack/v2 member is absent");
      }
    }
    /* Three states, not two. A pack may state that the tax IS imposed, state that it is NOT,
       or state neither — the last when no retrieved authority states the absence and the pack
       declines to derive it from a prohibition plus an administrative silence. The unstated
       state carries an AbsentFigure and no authority, because an authority establishing the
       absence would be the very assertion the pack is declining to make. */
    var impositionUnstated = isAbsentFigure(pack.imposesIndividualIncomeTax);
    if (pack.imposesIndividualIncomeTax !== true && pack.imposesIndividualIncomeTax !== false && !impositionUnstated) {
      refuseMember(refusals, "imposesIndividualIncomeTax",
        "imposesIndividualIncomeTax is a boolean or an AbsentFigure/v1 naming the authority that would state it");
    }
    if (impositionUnstated) {
      validateAbsentFigure(pack.imposesIndividualIncomeTax, "imposesIndividualIncomeTax", refusals);
      if (pack.noTaxAuthority !== null) {
        refuseMember(refusals, "noTaxAuthority",
          "a pack that does not state whether the tax is imposed may not name an authority establishing its absence");
      }
    }
    if (pack.imposesIndividualIncomeTax === true && pack.noTaxAuthority !== null) {
      refuseMember(refusals, "noTaxAuthority", "a jurisdiction that imposes a tax carries a null noTaxAuthority");
    }
    if (pack.imposesIndividualIncomeTax === false) {
      if (!isPlainObject(pack.noTaxAuthority)) {
        refuseMember(refusals, "noTaxAuthority", "a jurisdiction that imposes no tax must name the authority establishing the absence");
      } else {
        if (!isNonEmptyString(pack.noTaxAuthority.reason)) {
          refuseMember(refusals, "noTaxAuthority.reason", "the no-tax authority states why nothing is owed");
        }
        validateCitation(pack.noTaxAuthority, "noTaxAuthority", sources, refusals);
      }
    }
    if (pack.imposesIndividualIncomeTax === false || impositionUnstated) {
      if (Array.isArray(pack.taxLegs) && pack.taxLegs.length !== 0) {
        refuseMember(refusals, "taxLegs", "a jurisdiction that does not state it imposes a tax declares no tax legs");
      }
      /* A pack that carries a rate table while declaring no tax, or while declining to state
         whether one is imposed, is the exact shape a fabricated zero would take, so it is
         refused rather than silently ignored. */
      var noTaxGroups = ["ordinaryRateTables", "preferentialRateTables", "standardDeductions"];
      var groupIndex = 0;
      for (groupIndex = 0; groupIndex < noTaxGroups.length; groupIndex += 1) {
        var group = pack[noTaxGroups[groupIndex]];
        if (!isPlainObject(group)) continue;
        var statusKeys = Object.keys(group);
        var keyIndex = 0;
        for (keyIndex = 0; keyIndex < statusKeys.length; keyIndex += 1) {
          if (!isAbsentFigure(group[statusKeys[keyIndex]])) {
            refuseMember(refusals, noTaxGroups[groupIndex] + "." + statusKeys[keyIndex],
              "a jurisdiction that does not state it imposes a tax carries no rate table and no deduction amount");
            break;
          }
        }
      }
      if (isPlainObject(pack.thresholdSets) && Object.keys(pack.thresholdSets).length !== 0) {
        refuseMember(refusals, "thresholdSets", "a jurisdiction that does not state it imposes a tax declares no threshold set");
      }
    }
    if (pack.preferentialPolicy !== "own-schedule" && pack.preferentialPolicy !== "none") {
      refuseMember(refusals, "preferentialPolicy", "preferentialPolicy is closed to own-schedule and none");
    }
    if (pack.preferentialPolicy === "none" && isPlainObject(pack.preferentialRateTables)) {
      var statuses = Array.isArray(pack.filingStatuses) ? pack.filingStatuses : [];
      var statusIndex = 0;
      for (statusIndex = 0; statusIndex < statuses.length; statusIndex += 1) {
        if (isRateTable(pack.preferentialRateTables[statuses[statusIndex]])) {
          refuseMember(refusals, "preferentialPolicy",
            "a pack declaring preferentialPolicy none may not carry a preferential rate table");
          break;
        }
      }
    }
    if (!Array.isArray(pack.reliefMechanisms)) {
      refuseMember(refusals, "reliefMechanisms", "reliefMechanisms must be an array; an empty array declares no relief");
    }
    if (Object.prototype.hasOwnProperty.call(pack, "thresholdSets")) validateThresholdSets(pack, sources, refusals);
    if (Object.prototype.hasOwnProperty.call(pack, "taxLegs") && pack.imposesIndividualIncomeTax === true) {
      validateTaxLegs(pack, refusals);
    }
    validateReliefMechanisms(pack, sources, refusals);
  }

  /* The ordered stage array the engine will actually run for this pack. Derived from the pack's
     program, preferential policy and whether the jurisdiction imposes a tax at all — never from
     the numeric value of the stage ids. */
  function calculationOrderFor(pack) {
    if (isPlainObject(pack) && pack.imposesIndividualIncomeTax === false) return [];
    /* A pack that does not state whether the tax is imposed derives no stages either. Deriving
       a schedule here would be the first step of computing a tax the pack never claimed exists. */
    if (isPlainObject(pack) && isAbsentFigure(pack.imposesIndividualIncomeTax)) return [];
    if (isPlainObject(pack) && pack.preferentialPolicy === "none") {
      return CALCULATION_ORDER_NO_PREFERENTIAL.slice();
    }
    return CALCULATION_ORDER.slice();
  }

  /* Refuse a structurally wrong pack once per offending member, with the member named. */
  function validateRulePack(pack) {
    var refusals = [];
    if (!isPlainObject(pack)) {
      refusals.push(unavailable("RLTAX-PACK-INVALID", "pack", "the pack is not an object",
        "supply a TaxRulePack/v1 document"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals), missingMembers: Object.freeze([]) });
    }

    var missingMembers = [];
    var absent = {};
    var index = 0;
    for (index = 0; index < PACK_REQUIRED_MEMBERS.length; index += 1) {
      var member = PACK_REQUIRED_MEMBERS[index];
      if (!Object.prototype.hasOwnProperty.call(pack, member) || pack[member] === undefined || pack[member] === null) {
        missingMembers.push(member);
        absent[member] = true;
        refuseMember(refusals, member, "a required pack member is absent");
      }
    }

    if (pack.contractVersion !== undefined &&
      pack.contractVersion !== PACK_CONTRACT && pack.contractVersion !== PACK_CONTRACT_V2) {
      refuseMember(refusals, "contractVersion", "the pack contract version must be " + PACK_CONTRACT + " or " + PACK_CONTRACT_V2);
    }
    if (pack.id !== undefined && !ID_PATTERN.test(String(pack.id))) {
      refuseMember(refusals, "id", "the pack id must match ^[a-z0-9][a-z0-9-]*$");
    }
    if (pack.version !== undefined && !SEMVER_PATTERN.test(String(pack.version))) {
      refuseMember(refusals, "version", "the pack version must be a three-part semantic version");
    }
    if (pack.publishedAt !== undefined && !DATE_PATTERN.test(String(pack.publishedAt))) {
      refuseMember(refusals, "publishedAt", "publishedAt must be YYYY-MM-DD");
    }
    if (pack.retrievedAt !== undefined && !TIMESTAMP_PATTERN.test(String(pack.retrievedAt))) {
      refuseMember(refusals, "retrievedAt", "retrievedAt must be an ISO-8601 timestamp with milliseconds");
    }
    if (pack.contentSha256 !== undefined && !SHA_PATTERN.test(String(pack.contentSha256))) {
      refuseMember(refusals, "contentSha256", "contentSha256 must be the literal sha256: followed by 64 lowercase hexadecimal characters");
    }
    if (pack.ruleStatus !== undefined && RULE_STATUS[pack.ruleStatus] !== true) {
      refuseMember(refusals, "ruleStatus", "the pack rule status must be a member of the closed RuleStatus enum");
    }

    if (pack.effectiveTaxYears !== undefined) {
      if (!Array.isArray(pack.effectiveTaxYears) || pack.effectiveTaxYears.length === 0) {
        refuseMember(refusals, "effectiveTaxYears", "effectiveTaxYears must be a non-empty ascending array of integers");
      } else {
        var previousYear = null;
        for (index = 0; index < pack.effectiveTaxYears.length; index += 1) {
          var year = pack.effectiveTaxYears[index];
          if (!Number.isFinite(year) || Math.floor(year) !== year) {
            refuseMember(refusals, "effectiveTaxYears[" + index + "]", "each effective tax year must be an integer");
            break;
          }
          if (previousYear !== null && year <= previousYear) {
            refuseMember(refusals, "effectiveTaxYears[" + index + "]", "effective tax years must ascend with no duplicates");
            break;
          }
          previousYear = year;
        }
      }
    }

    if (pack.indexingRules !== undefined && !Array.isArray(pack.indexingRules)) {
      refuseMember(refusals, "indexingRules", "indexingRules must be an array; an empty array declares no indexing rule");
    }

    if (pack.calculationOrder !== undefined &&
      JSON.stringify(pack.calculationOrder) !== JSON.stringify(calculationOrderFor(pack))) {
      refuseMember(refusals, "calculationOrder",
        "calculationOrder must equal the engine's ordered stage array for this pack's program and preferential policy exactly");
    }

    if (pack.filingStatuses !== undefined &&
      JSON.stringify(pack.filingStatuses) !== JSON.stringify(SUPPORTED_FILING_STATUSES.slice())) {
      refuseMember(refusals, "filingStatuses", "filingStatuses must equal the closed filing-status set");
    }
    if (pack.incomeKinds !== undefined &&
      JSON.stringify(pack.incomeKinds) !== JSON.stringify(SUPPORTED_INCOME_KINDS.slice())) {
      refuseMember(refusals, "incomeKinds", "incomeKinds must equal the closed four supported income kinds");
    }

    var sources = validateSourceRecords(pack, refusals, absent);
    validateFeatureLists(pack, refusals, absent);
    validateRoundingPolicy(pack, sources, refusals, absent);
    validateExpiryPolicy(pack, refusals, absent);

    for (index = 0; index < TABLE_GROUPS.length; index += 1) {
      validateFigureGroup(pack, TABLE_GROUPS[index], sources, refusals, absent);
    }

    if (pack.contractVersion === PACK_CONTRACT_V2) validatePackV2Members(pack, sources, refusals);

    return Object.freeze({
      ok: refusals.length === 0,
      refusals: Object.freeze(refusals),
      missingMembers: Object.freeze(missingMembers)
    });
  }

  /* Resolve one pack for one jurisdiction, program and declared tax year. Membership in
     effectiveTaxYears is exact: there is no range expansion and no adjacency rule. */
  function resolveRulePack(pack, request) {
    var ask = isPlainObject(request) ? request : {};
    var validation = validateRulePack(pack);
    if (!validation.ok) {
      return Object.freeze({ ok: false, refusals: validation.refusals, pack: null });
    }
    if (isNonEmptyString(ask.expectedContentSha256) && ask.expectedContentSha256 !== pack.contentSha256) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-PACK-INVALID", "pack:contentSha256",
          "the pack digest does not match the configured pointer",
          "regenerate the pack digest or correct rules.packContentSha256 in the configuration")]),
        pack: null
      });
    }
    if (!isSupportedJurisdiction(ask.jurisdiction) || !isSupportedJurisdiction(pack.jurisdiction)) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "jurisdiction:" + String(ask.jurisdiction),
          "a jurisdiction must be the literal federal or state: followed by a two-letter upper-case postal code",
          "request a jurisdiction the grammar declares; no module enumerates a state, and a malformed code loads no path")]),
        pack: null
      });
    }
    if (ask.jurisdiction !== pack.jurisdiction) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "jurisdiction:" + String(ask.jurisdiction),
          "the requested jurisdiction is not the jurisdiction this pack covers",
          "author a rule pack for that jurisdiction; no threshold is carried across jurisdictions")]),
        pack: null
      });
    }
    if (ask.program !== pack.program) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-FEATURE-UNSUPPORTED", "program:" + String(ask.program),
          "the requested program is not the program this pack covers",
          "author a rule pack for that program")]),
        pack: null
      });
    }
    if (pack.effectiveTaxYears.indexOf(ask.declaredTaxYear) < 0) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-YEAR-UNSUPPORTED", "declaredTaxYear:" + String(ask.declaredTaxYear),
          "the declared tax year is not a member of the pack's effective tax years",
          "author a rule pack for that tax year; no threshold is indexed or extended into an unsupported year")]),
        pack: null
      });
    }
    if (isNonEmptyString(ask.filingStatus) && pack.filingStatuses.indexOf(ask.filingStatus) < 0) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-FILING-STATUS-UNSUPPORTED", "filingStatus:" + ask.filingStatus,
          "the requested filing status is outside the pack's declared filing statuses",
          "supply a filing status the pack declares")]),
        pack: null
      });
    }
    if (isNonEmptyString(ask.asOf) && ask.asOf > pack.expiryPolicy.expiresAt) {
      return Object.freeze({
        ok: false,
        refusals: Object.freeze([unavailable("RLTAX-PACK-EXPIRED", "pack:" + pack.id,
          "the pack expired on " + pack.expiryPolicy.expiresAt + " and no earlier pack is substituted",
          "retrieve the current authority and publish a refreshed rule pack")]),
        pack: null
      });
    }
    return Object.freeze({ ok: true, refusals: Object.freeze([]), pack: pack });
  }

  /* The unsupported features a curve consumer must surface as contributors it cannot price. */
  function marginalRateContributors(pack) {
    if (!isPlainObject(pack) || !Array.isArray(pack.unsupportedFeatures)) return Object.freeze([]);
    var contributors = [];
    var index = 0;
    for (index = 0; index < pack.unsupportedFeatures.length; index += 1) {
      if (pack.unsupportedFeatures[index] && pack.unsupportedFeatures[index].movesMarginalRate === true) {
        contributors.push(pack.unsupportedFeatures[index]);
      }
    }
    return Object.freeze(contributors);
  }

  /* The declared leg set the total sums over. A TaxRulePack/v1 carries none, and behaves as a
     v2 whose leg set is exactly the two Feature 021 legs. That is a version-compatibility rule
     supplying structure the v1 shape already implies; it supplies no figure. */
  var V1_TAX_LEGS = Object.freeze([
    Object.freeze({
      contractVersion: TAX_LEG_CONTRACT, legId: "ordinary", stageId: "CO-6",
      figureRef: "ordinaryRateTables", includedInTotal: true
    }),
    Object.freeze({
      contractVersion: TAX_LEG_CONTRACT, legId: "preferential", stageId: "CO-7",
      figureRef: "preferentialRateTables", includedInTotal: true
    })
  ]);

  function declaredTaxLegs(pack) {
    if (isPlainObject(pack) && Array.isArray(pack.taxLegs) && pack.taxLegs.length > 0) {
      return Object.freeze(pack.taxLegs.slice());
    }
    return V1_TAX_LEGS;
  }

  /* ---------- Feature 023 Scope 01: the declared/sourced split, registered ---------- */

  function isPropertyCapBasis(candidate) {
    return PROPERTY_CAP_BASES.indexOf(candidate) >= 0;
  }

  function isPropertyApplicationPoint(candidate) {
    return PROPERTY_APPLICATION_POINTS.indexOf(candidate) >= 0;
  }

  function isPropertyRegimePath(candidate) {
    return typeof candidate === "string" && PROPERTY_REGIME_PATH_PATTERN.test(candidate);
  }

  /* A declared object is one that carries the household's own inputs and NO citation anywhere.
     This is the one predicate the whole epistemology rests on, so it lives beside the refusal
     vocabulary rather than inside one engine: a declared figure that could carry a sourceRef
     would let a household's own guess be displayed with an authority's weight. */
  function carriesCitation(candidate) {
    if (!isPlainObject(candidate)) return false;
    var keys = Object.keys(candidate);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (keys[index] === "sourceRef" || keys[index] === "locator") return true;
      var member = candidate[keys[index]];
      if (isPlainObject(member) &&
        (isNonEmptyString(member.sourceRef) || isNonEmptyString(member.locator))) return true;
    }
    return false;
  }

  function isPropertyAssessment(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === PROPERTY_ASSESSMENT_CONTRACT;
  }

  function isPropertyReliefRegime(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === PROPERTY_REGIME_CONTRACT;
  }

  /* ---------- Feature 023 Scope 02: the deduction composition contracts ---------- */

  /* A component missing `disallowedAmount` is REFUSED rather than defaulted to zero. Without
     this rule a silent zero would be indistinguishable from an amount nobody computed, which is
     precisely the confusion FR-023-010 exists to remove. */
  function validateDeductionComponent(component) {
    var refusals = [];
    if (!isPlainObject(component)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component",
        "the component is missing or is not an object",
        "supply a " + DEDUCTION_COMPONENT_CONTRACT + " record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (JSON.stringify(sortedKeysOf(component)) !== JSON.stringify(DEDUCTION_COMPONENT_KEYS.slice())) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component:members",
        "the component carries a member outside the declared set, or is missing one",
        "carry exactly: " + DEDUCTION_COMPONENT_KEYS.join(", ")));
    }
    if (!isNonEmptyString(component.componentId)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component:componentId",
        "the component declares no identifier",
        "declare a componentId a reader can match against the not-modelled ledger"));
    }
    if (DEDUCTION_COMPONENT_ORIGINS.indexOf(component.origin) < 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component:origin",
        "the component declares no origin from the closed set, so a reader cannot tell the household's own figure from a computed one",
        "declare one of: " + DEDUCTION_COMPONENT_ORIGINS.join(", ")));
    }
    if (!Array.isArray(component.cappedWith)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component:cappedWith",
        "the component does not name the other components sharing its cap",
        "declare cappedWith as an array of componentIds, empty when the component shares no cap"));
    }
    if (!Number.isFinite(component.disallowedAmount)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component:disallowedAmount",
        "the component carries no computed disallowed amount, and an absent one is not a zero",
        "compute disallowedAmount; a zero is a real computed result and an absent member is not"));
    }
    if (!Number.isFinite(component.allowedAmount)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "deduction-component:allowedAmount",
        "the component carries no computed allowed amount",
        "compute allowedAmount"));
    }
    if (Number.isFinite(component.amount) && Number.isFinite(component.allowedAmount) &&
      Number.isFinite(component.disallowedAmount) &&
      Math.abs((component.allowedAmount + component.disallowedAmount) - component.amount) > 1e-9) {
      refusals.push(unavailable("RLTAX-RECONCILE", "deduction-component:accounting",
        "the allowed and disallowed portions do not add back to the component amount, so a dollar is unaccounted for",
        "compute allowedAmount and disallowedAmount as a disjoint exhaustive split of amount"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  function validateItemizedComposition(composition) {
    var refusals = [];
    if (!isPlainObject(composition)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "itemized-composition",
        "the composition is missing or is not an object",
        "supply an " + ITEMIZED_COMPOSITION_CONTRACT + " record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (composition.contractVersion !== ITEMIZED_COMPOSITION_CONTRACT) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "itemized-composition:contractVersion",
        "the composition does not declare " + ITEMIZED_COMPOSITION_CONTRACT,
        "set contractVersion to " + ITEMIZED_COMPOSITION_CONTRACT));
    }
    if (!Array.isArray(composition.components)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "itemized-composition:components",
        "the composition carries no component list",
        "carry a components array, empty when the household declared nothing"));
    }
    if (CAP_BINDINGS.indexOf(composition.capBinding) < 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "itemized-composition:capBinding",
        "the composition declares a cap binding outside the closed set",
        "declare one of: " + CAP_BINDINGS.join(", ")));
    }
    if (CHOSEN_DEDUCTION_SIDES.indexOf(composition.chosen) < 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "itemized-composition:chosen",
        "the composition declares a chosen side outside the closed set",
        "declare one of: " + CHOSEN_DEDUCTION_SIDES.join(", ")));
    }
    if (!isNonEmptyString(composition.chosenReason)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "itemized-composition:chosenReason",
        "the composition names no reason for the side it chose",
        "state the reason; a chosen side without a reason is a decision the reader cannot check"));
    }
    /* An unavailable cap must propagate to BOTH the binding and the choice. A composition that
       reported an unavailable cap and still chose a side would be the silent standard-deduction
       substitution FR-023-009 forbids. */
    if (composition.capBinding === "unavailable" && composition.chosen !== "unavailable") {
      refusals.push(unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "itemized-composition:chosen",
        "the cap could not be established and the composition still chose a side",
        "propagate the unavailable cap into the chosen side; the standard deduction is never silently substituted"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* ---------- Feature 023 Scope 03. The three rental contracts. ---------- */

  /* RentalActivity/v1. Declared members only, exact key set, and no member may carry a
     citation. The declared-versus-sourced split Scope 01 established is re-asserted here rather
     than assumed, because this is the contract that carries the opening suspended loss and that
     is the one household figure most likely to be mistaken for a rule. */
  function validateRentalActivity(activity) {
    var refusals = [];
    if (!isPlainObject(activity)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "rental-activity",
        "the rental activity is missing or is not an object",
        "supply a " + RENTAL_ACTIVITY_CONTRACT + " record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (activity.contractVersion !== RENTAL_ACTIVITY_CONTRACT) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "rental-activity:contractVersion",
        "the rental activity does not declare " + RENTAL_ACTIVITY_CONTRACT,
        "set contractVersion to " + RENTAL_ACTIVITY_CONTRACT));
    }
    if (JSON.stringify(sortedKeysOf(activity)) !== JSON.stringify(RENTAL_ACTIVITY_KEYS)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "rental-activity:members",
        "the rental activity carries a member outside the declared set, or is missing one",
        "carry exactly: " + RENTAL_ACTIVITY_KEYS.join(", ")));
    }
    if (activity.origin !== "declared") {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "rental-activity:origin",
        "a rental activity records the household's own input and its origin must be declared",
        "set origin to declared"));
    }
    var keys = Object.keys(activity);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var member = {};
      member[keys[index]] = activity[keys[index]];
      if (carriesCitation(member)) {
        refusals.push(unavailable("RLTAX-CONFIG-INVALID", "rental-activity:" + keys[index],
          "a declared rental member carries a citation, which would present the household's own input as an authority's figure",
          "remove the citation; a declared figure is labelled the household's input and carries no sourceRef"));
      }
    }
    /* FR-023-020. The opening carryforward is the household's declaration about a year this
       model never computed. A sourceRef on it would claim an authority established the figure. */
    if (isPlainObject(activity.openingSuspendedLoss)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "rental-activity:openingSuspendedLoss",
        "the opening suspended loss is carried as a record rather than as a declared number, and a record is where a citation could hide",
        "declare openingSuspendedLoss as a number, or null when the household declares none"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* CostRecovery/v1's SOURCED half. FR-023-016 turns entirely on this function: a missing
     recovery period, a missing convention, or either carrying no citation or no locator, is a
     refusal. There is deliberately no branch that supplies a period or a convention, so the
     module physically cannot depreciate over a recalled figure — the failure mode is a refusal,
     never a plausible number.

     The year check is the second half. A source record whose qualifier kind declares specific
     years, none of which is the declared year, cannot establish a parameter for that year; only
     an explicit year-invariant declaration, which SourceRecord/v2 admits only with a basis,
     carries across. This is the same discipline the mortgage limits refused under. */
  function validateCostRecoveryRule(pack, declaredTaxYear) {
    var rule = isPlainObject(pack) ? pack.costRecovery : null;
    if (!isPlainObject(rule)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "cost-recovery",
        "the resolved pack carries no cost-recovery rule, so the recovery period and the convention could not be established",
        "author a pack that declares costRecovery with a sourced recovery period, convention and method");
    }
    if (isAbsentFigure(rule)) return absentFigureRefusal(rule, "cost-recovery");
    var members = [
      { key: "recoveryPeriod", value: "years", label: "the recovery period" },
      { key: "convention", value: "conventionId", label: "the applicable convention" },
      { key: "method", value: "methodId", label: "the depreciation method" }
    ];
    var index = 0;
    for (index = 0; index < members.length; index += 1) {
      var domain = "cost-recovery:" + members[index].key;
      var figure = rule[members[index].key];
      if (isAbsentFigure(figure)) return absentFigureRefusal(figure, domain);
      if (!isPlainObject(figure)) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the pack states " + members[index].label + " nowhere, and no period, convention or method is supplied in its place",
          "transcribe " + members[index].label + " from its primary source and record it with a locator");
      }
      if (!isNonEmptyString(figure.sourceRef) || !isNonEmptyString(figure.locator)) {
        return unavailable("RLTAX-PACK-INVALID", domain,
          "the pack states " + members[index].label + " without a sourceRef and a locator naming the section it was transcribed from",
          "add a sourceRef naming a retrieved record and a locator naming the section, table or heading");
      }
      var record = findSourceRecord(pack, figure.sourceRef);
      if (record === null || record.retrievalOutcome !== "retrieved") {
        return unavailable("RLTAX-PACK-INVALID", domain,
          "the sourceRef of " + members[index].label + " names no retrieved record in sourceRecords[]",
          "cite a record whose retrievalOutcome is retrieved");
      }
      var declared = isPlainObject(record.declaredApplicableYearsByComponentKind)
        ? record.declaredApplicableYearsByComponentKind.qualifier
        : undefined;
      var carries = declared === "year-invariant" ||
        (Array.isArray(declared) && declared.indexOf(declaredTaxYear) >= 0);
      if (!carries) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the cited edition does not establish " + members[index].label + " for the declared year, and no figure is carried across from another tax year",
          "cite an edition that declares the year effective, or one whose qualifier kind is year-invariant with a basis");
      }
      if (figure[members[index].value] === undefined || figure[members[index].value] === null) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the pack carries " + members[index].label + " without the value it is supposed to state",
          "state the value; an empty sourced member establishes nothing");
      }
    }
    if (!Number.isFinite(rule.recoveryPeriod.years) || rule.recoveryPeriod.years <= 0) {
      return unavailable("RLTAX-PACK-INVALID", "cost-recovery:recoveryPeriod",
        "the recovery period is not a finite number of years greater than zero",
        "transcribe the recovery period as the number of years the authority states");
    }
    if (COST_RECOVERY_CONVENTIONS.indexOf(rule.convention.conventionId) < 0) {
      return unavailable("RLTAX-FEATURE-UNSUPPORTED", "cost-recovery:convention",
        "the pack names a convention this engine has no branch for, and the one branch it does have is not applied in its place",
        "add the convention to the engine's closed set together with the arithmetic it prescribes");
    }
    if (COST_RECOVERY_METHODS.indexOf(rule.method.methodId) < 0) {
      return unavailable("RLTAX-FEATURE-UNSUPPORTED", "cost-recovery:method",
        "the pack names a depreciation method this engine has no branch for, and the one branch it does have is not applied in its place",
        "add the method to the engine's closed set together with the arithmetic it prescribes");
    }
    return rule;
  }

  /* LossLimitation/v1. Exact key set, closed limitId, closed disposition, and every one of the
     three amounts present. FR-023-019's "none is silently zeroed" is enforced here as a shape
     rule rather than as a convention: a record cannot omit disallowedAmount, and the three must
     reconcile exactly. */
  function validateLossLimitation(limitation) {
    var refusals = [];
    if (!isPlainObject(limitation)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation",
        "the limitation is missing or is not an object",
        "supply a " + LOSS_LIMITATION_CONTRACT + " record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (limitation.contractVersion !== LOSS_LIMITATION_CONTRACT) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation:contractVersion",
        "the limitation does not declare " + LOSS_LIMITATION_CONTRACT,
        "set contractVersion to " + LOSS_LIMITATION_CONTRACT));
    }
    if (JSON.stringify(sortedKeysOf(limitation)) !== JSON.stringify(LOSS_LIMITATION_KEYS)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation:members",
        "the limitation carries a member outside the declared set, or is missing one",
        "carry exactly: " + LOSS_LIMITATION_KEYS.join(", ")));
    }
    if (LOSS_LIMIT_IDS.indexOf(limitation.limitId) < 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation:limitId",
        "the limitation declares a limit outside the closed set",
        "declare one of: " + LOSS_LIMIT_IDS.join(", ")));
    }
    if (LOSS_DISPOSITIONS.indexOf(limitation.disposition) < 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation:disposition",
        "a disallowed amount is carried, and the disposition must say so",
        "declare one of: " + LOSS_DISPOSITIONS.join(", ")));
    }
    if (!Number.isFinite(limitation.appliedOrder) ||
      Math.floor(limitation.appliedOrder) !== limitation.appliedOrder) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation:appliedOrder",
        "the limitation declares no integer applied order, so the order it was applied in cannot be asserted",
        "declare appliedOrder as the integer position the pack's sourced ordering rule gives this limit"));
    }
    var amounts = ["amountBefore", "allowedAmount", "disallowedAmount"];
    var index = 0;
    for (index = 0; index < amounts.length; index += 1) {
      if (!Number.isFinite(limitation[amounts[index]])) {
        refusals.push(unavailable("RLTAX-CONFIG-INVALID", "loss-limitation:" + amounts[index],
          "the limitation carries no finite " + amounts[index] + ", and an absent amount is how a disallowed loss disappears",
          "publish " + amounts[index] + " as a number; zero is a computed fact and is never a stand-in for absent"));
      }
    }
    if (refusals.length === 0 &&
      Math.abs((limitation.allowedAmount + limitation.disallowedAmount) - limitation.amountBefore) > 1e-9) {
      refusals.push(unavailable("RLTAX-RECONCILE", "loss-limitation:reconciliation",
        "the allowed and disallowed amounts do not sum to the amount before the limit, so some of the loss is unaccounted for",
        "publish the disallowed amount actually computed; the three amounts reconcile exactly or the limitation is refused"));
    }
    if (!isNonEmptyString(limitation.sourceRef) || !isNonEmptyString(limitation.locator)) {
      refusals.push(unavailable("RLTAX-PACK-INVALID", "loss-limitation:sourceRef",
        "the limitation names no sourced rule and locator for the limit it applied",
        "carry the sourceRef and locator of the pack rule that establishes this limit"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  function isRentalActivity(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === RENTAL_ACTIVITY_CONTRACT;
  }

  /* DwellingUseDeclaration/v1. Two day counts, an exact key set, and no citation on either. The
     day counts are the household's own record of how a dwelling was used; an authority states
     the TEST, never the days. */
  function validateDwellingUseDeclaration(declaration) {
    var refusals = [];
    if (!isPlainObject(declaration)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "dwelling-use",
        "the dwelling-use declaration is missing or is not an object",
        "supply a " + DWELLING_USE_DECLARATION_CONTRACT + " record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (declaration.contractVersion !== DWELLING_USE_DECLARATION_CONTRACT) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "dwelling-use:contractVersion",
        "the dwelling-use declaration does not declare " + DWELLING_USE_DECLARATION_CONTRACT,
        "set contractVersion to " + DWELLING_USE_DECLARATION_CONTRACT));
    }
    if (JSON.stringify(sortedKeysOf(declaration)) !== JSON.stringify(DWELLING_USE_DECLARATION_KEYS)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "dwelling-use:members",
        "the dwelling-use declaration carries a member outside the declared set, or is missing one",
        "carry exactly: " + DWELLING_USE_DECLARATION_KEYS.join(", ")));
    }
    if (declaration.origin !== "declared") {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "dwelling-use:origin",
        "a dwelling-use declaration records the household's own count of days and its origin must be declared",
        "set origin to declared"));
    }
    var keys = Object.keys(declaration);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var member = {};
      member[keys[index]] = declaration[keys[index]];
      if (carriesCitation(member)) {
        refusals.push(unavailable("RLTAX-CONFIG-INVALID", "dwelling-use:" + keys[index],
          "a declared day count carries a citation, which would present the household's own record as an authority's figure",
          "remove the citation; the authority states the test and never the days"));
      }
    }
    var counts = ["fairRentalDays", "personalUseDays"];
    for (index = 0; index < counts.length; index += 1) {
      var value = declaration[counts[index]];
      if (!Number.isFinite(value) || Math.floor(value) !== value || value < 0) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "dwelling-use:" + counts[index],
          "the household has not declared " + counts[index] + " as a whole number of days that is not negative, and the test cannot be run without it",
          "declare " + counts[index] + "; no typical value, average or estimate is substituted"));
      }
    }
    if (!Number.isFinite(declaration.declaredTaxYear)) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "dwelling-use:declaredTaxYear",
        "the household has not declared which tax year these day counts belong to, and the sourced parameters are checked against that year",
        "declare declaredTaxYear; no year is assumed from the pack or from a clock"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* UseClassification/v1. The published result. Four shape rules carry FR-023-022: a category
     from the closed set, both day counts present, every test parameter carrying a citation, and
     a NON-EMPTY comparisonsPerformed[] whose entries are complete. The last is the load-bearing
     one — a classification that published no comparison would be a category assigned by
     assertion, which is precisely the recalled rule of thumb this contract exists to exclude. */
  function validateUseClassification(classification) {
    var refusals = [];
    if (!isPlainObject(classification)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification",
        "the classification is missing or is not an object",
        "supply a " + USE_CLASSIFICATION_CONTRACT + " record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (classification.contractVersion !== USE_CLASSIFICATION_CONTRACT) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:contractVersion",
        "the classification does not declare " + USE_CLASSIFICATION_CONTRACT,
        "set contractVersion to " + USE_CLASSIFICATION_CONTRACT));
    }
    if (JSON.stringify(sortedKeysOf(classification)) !== JSON.stringify(USE_CLASSIFICATION_KEYS)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:members",
        "the classification carries a member outside the declared set, or is missing one",
        "carry exactly: " + USE_CLASSIFICATION_KEYS.join(", ")));
    }
    if (USE_CATEGORIES.indexOf(classification.category) < 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:category",
        "the classification declares a category outside the closed set, or none at all",
        "declare one of: " + USE_CATEGORIES.join(", ")));
    }
    var counts = ["fairRentalDays", "personalUseDays"];
    var index = 0;
    for (index = 0; index < counts.length; index += 1) {
      if (!Number.isFinite(classification[counts[index]])) {
        refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:" + counts[index],
          "the classification omits the declared " + counts[index] + " it was made from, so the category cannot be checked against its own inputs",
          "publish both declared day counts beside the category they produced"));
      }
    }
    var parameters = Array.isArray(classification.testParameters) ? classification.testParameters : [];
    if (parameters.length === 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:testParameters",
        "the classification publishes no test parameter, so nothing establishes the figures it compared against",
        "publish each sourced test parameter with the citation it was transcribed from"));
    }
    for (index = 0; index < parameters.length; index += 1) {
      var parameter = parameters[index];
      var citation = isPlainObject(parameter) ? parameter.citation : null;
      if (!isPlainObject(citation) || !isNonEmptyString(citation.title) ||
        !isNonEmptyString(citation.locator) || !isNonEmptyString(citation.sourceRef)) {
        refusals.push(unavailable("RLTAX-PACK-INVALID", "use-classification:testParameters:" + String(index),
          "a published test parameter carries no citation naming the record and the section it came from",
          "publish each parameter with a citation carrying its title, url, retrievedAt, sourceRef and locator"));
      }
    }
    var comparisons = Array.isArray(classification.comparisonsPerformed)
      ? classification.comparisonsPerformed : [];
    if (comparisons.length === 0) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:comparisonsPerformed",
        "the classification performed no published comparison, so its category was asserted rather than computed",
        "publish every comparison as left, operator, right and result"));
    }
    for (index = 0; index < comparisons.length; index += 1) {
      var comparison = comparisons[index];
      if (!isPlainObject(comparison) ||
        JSON.stringify(sortedKeysOf(comparison)) !== JSON.stringify(USE_COMPARISON_KEYS) ||
        !Number.isFinite(comparison.left) || !Number.isFinite(comparison.right) ||
        USE_COMPARISON_OPERATORS.indexOf(comparison.operator) < 0 ||
        typeof comparison.result !== "boolean") {
        refusals.push(unavailable("RLTAX-CONFIG-INVALID",
          "use-classification:comparisonsPerformed:" + String(index),
          "a published comparison is incomplete: each carries exactly a comparisonId, a finite left, an operator from the closed set, a finite right and a boolean result",
          "publish each comparison as " + USE_COMPARISON_KEYS.join(", ") +
          " with an operator from: " + USE_COMPARISON_OPERATORS.join(", ")));
      }
    }
    if (typeof classification.usedAsResidence !== "boolean") {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:usedAsResidence",
        "the classification does not state whether the unit was used as a residence as a boolean, and an absent answer is not a negative one",
        "publish usedAsResidence as the boolean the comparisons produced"));
    }
    if (!isNonEmptyString(classification.percentageComparedAgainst)) {
      refusals.push(unavailable("RLTAX-CONFIG-INVALID", "use-classification:percentageComparedAgainst",
        "the classification does not name which declared quantity the sourced percentage was compared against",
        "publish percentageComparedAgainst as the quantity the retrieved publication names"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* The sourced half of the dwelling-use test. Three parameters, each with a citation, a locator
     and a component kind whose source record establishes it for the declared year. There is
     deliberately NO branch returning a day figure, a percentage or a rental-days threshold when
     the pack states none: an unretrieved parameter refuses, and no category is assigned. */
  function validateUseClassificationRule(pack, declaredTaxYear) {
    var rule = isPlainObject(pack) ? pack.useClassification : null;
    if (!isPlainObject(rule)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "use-classification",
        "the resolved pack carries no dwelling-use classification rule, so the day figure, the percentage and the rental-days threshold could not be established",
        "author a pack that declares useClassification with its three sourced test parameters and their locators");
    }
    if (isAbsentFigure(rule)) return absentFigureRefusal(rule, "use-classification");
    var members = [
      { key: "personalUseDayFigure", value: "days", label: "the personal-use day figure" },
      { key: "personalUsePercentageFigure", value: "rate", label: "the personal-use percentage figure" },
      { key: "minimalRentalUseThreshold", value: "days", label: "the fewer-than-threshold rental-days figure" }
    ];
    var index = 0;
    for (index = 0; index < members.length; index += 1) {
      var domain = "use-classification:" + members[index].key;
      var figure = rule[members[index].key];
      if (isAbsentFigure(figure)) return absentFigureRefusal(figure, domain);
      if (!isPlainObject(figure)) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the pack states " + members[index].label + " nowhere, and no figure is supplied in its place",
          "transcribe " + members[index].label + " from its primary source and record it with a locator");
      }
      if (!isNonEmptyString(figure.sourceRef) || !isNonEmptyString(figure.locator)) {
        return unavailable("RLTAX-PACK-INVALID", domain,
          "the pack states " + members[index].label + " without a sourceRef and a locator naming the section it was transcribed from",
          "add a sourceRef naming a retrieved record and a locator naming the section or heading");
      }
      var record = findSourceRecord(pack, figure.sourceRef);
      if (record === null || record.retrievalOutcome !== "retrieved") {
        return unavailable("RLTAX-PACK-INVALID", domain,
          "the sourceRef of " + members[index].label + " names no retrieved record in sourceRecords[]",
          "cite a record whose retrievalOutcome is retrieved");
      }
      var declared = isPlainObject(record.declaredApplicableYearsByComponentKind)
        ? record.declaredApplicableYearsByComponentKind.qualifier
        : undefined;
      var carries = declared === "year-invariant" ||
        (Array.isArray(declared) && declared.indexOf(declaredTaxYear) >= 0);
      if (!carries) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the cited edition does not establish " + members[index].label + " for the declared year, and no figure is carried across from another tax year",
          "cite an edition that declares the year effective, or one whose qualifier kind is year-invariant with a basis");
      }
      var value = figure[members[index].value];
      if (!Number.isFinite(value) || value < 0) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the pack carries " + members[index].label + " without the finite value it is supposed to state",
          "state the value; an empty sourced member establishes nothing");
      }
      if (USE_COMPARISON_OPERATORS.indexOf(figure.comparisonOperator) < 0) {
        return unavailable("RLTAX-PACK-INVALID", domain,
          "the pack states " + members[index].label + " without naming the comparison the publication states it under, so its inclusivity would be the engine's convention rather than the authority's",
          "record comparisonOperator as one of: " + USE_COMPARISON_OPERATORS.join(", "));
      }
    }
    if (!isNonEmptyString(rule.personalUsePercentageFigure.comparedAgainst)) {
      return unavailable("RLTAX-PACK-INVALID", "use-classification:personalUsePercentageFigure",
        "the pack states the percentage without naming the quantity the publication compares it against, and the two candidate quantities are not the same number",
        "record comparedAgainst as the quantity the retrieved publication names");
    }
    var allocation = rule.allocationRule;
    if (isAbsentFigure(allocation)) return absentFigureRefusal(allocation, "use-classification:allocationRule");
    if (!isPlainObject(allocation) || !isNonEmptyString(allocation.basis) ||
      !isNonEmptyString(allocation.sourceRef) || !isNonEmptyString(allocation.locator)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "use-classification:allocationRule",
        "the pack states no sourced basis for dividing an expense between rental and personal use",
        "transcribe the allocation basis from its primary source and record it with a locator");
    }
    return rule;
  }

  function isUseClassification(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === USE_CLASSIFICATION_CONTRACT;
  }

  function isLossLimitation(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === LOSS_LIMITATION_CONTRACT;
  }

  /* ---------- Feature 023 Scope 05: the disposition contracts ---------- */

  /* The household's own disposition inputs. It refuses a citation for the same reason every
     declared contract does: proceeds and a basis are the household's record of what it did, and
     rendering them with an authority's weight would be the exact conflation NFR-023-001 forbids.
     `accumulatedCostRecovery` is separate from `adjustedBasis` rather than inferable from it,
     because the recapture component is bounded by the DEPRECIATION TAKEN and a basis alone does
     not state that figure. */
  function validateDispositionDeclaration(declaration) {
    var refusals = [];
    if (!isPlainObject(declaration) || declaration.contractVersion !== DISPOSITION_DECLARATION_CONTRACT) {
      refuseMember(refusals, "disposition", "the declaration must carry contractVersion " + DISPOSITION_DECLARATION_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (carriesCitation(declaration)) {
      refuseMember(refusals, "disposition.sourceRef",
        "a declared disposition carries the household's own figures and may never carry a citation");
    }
    var amounts = ["proceeds", "adjustedBasis", "accumulatedCostRecovery"];
    var index = 0;
    for (index = 0; index < amounts.length; index += 1) {
      var amount = declaration[amounts[index]];
      if (!Number.isFinite(amount)) {
        refuseMember(refusals, "disposition." + amounts[index],
          "declare " + amounts[index] + " as a number; null is undeclared and is never read as zero");
      } else if (amounts[index] !== "adjustedBasis" && amount < 0) {
        refuseMember(refusals, "disposition." + amounts[index], "this member may not be negative");
      }
    }
    var months = ["ownershipMonths", "useMonths"];
    for (index = 0; index < months.length; index += 1) {
      var count = declaration[months[index]];
      if (!Number.isFinite(count) || Math.floor(count) !== count || count < 0) {
        refuseMember(refusals, "disposition." + months[index],
          "declare " + months[index] + " as a whole number of months that is not negative");
      }
    }
    if (DISPOSITION_PROPERTY_USES.indexOf(declaration.propertyUse) < 0) {
      refuseMember(refusals, "disposition.propertyUse",
        "declare propertyUse as one of: " + DISPOSITION_PROPERTY_USES.join(", "));
    }
    if (!Number.isFinite(declaration.declaredTaxYear)
      || Math.floor(declaration.declaredTaxYear) !== declaration.declaredTaxYear) {
      refuseMember(refusals, "disposition.declaredTaxYear",
        "declare the tax year the disposition settles in; the sourcing gate is applied against it");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* A gain component with no `pricingRule` is REFUSED. A default would have to pick one of the
     two rules, and either choice silently misprices the other category — which is the defect
     this contract exists to make impossible. A component priced at its own maximum rate must
     additionally carry the rate and its citation, so an `own-maximum-rate` component whose rate
     could not be retrieved cannot be constructed at all. */
  function validateGainComponent(component) {
    var refusals = [];
    if (!isPlainObject(component) || component.contractVersion !== GAIN_COMPONENT_CONTRACT) {
      refuseMember(refusals, "gainComponent", "the component must carry contractVersion " + GAIN_COMPONENT_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (!isNonEmptyString(component.componentId)) {
      refuseMember(refusals, "gainComponent.componentId", "a component needs an id naming the category it prices");
    }
    if (!Number.isFinite(component.amount) || component.amount < 0) {
      refuseMember(refusals, "gainComponent.amount", "a component amount must be a finite number that is not negative");
    }
    if (GAIN_PRICING_RULES.indexOf(component.pricingRule) < 0) {
      refuseMember(refusals, "gainComponent.pricingRule",
        "a component carrying no pricing rule, or one outside the closed set, is refused rather than defaulted; the set is: "
        + GAIN_PRICING_RULES.join(", "));
    }
    if (component.pricingRule === "own-maximum-rate") {
      if (!Number.isFinite(component.maximumRate) || component.maximumRate < 0 || component.maximumRate > 1) {
        refuseMember(refusals, "gainComponent.maximumRate",
          "a component priced at its own maximum rate must carry that rate as a finite fraction");
      }
      if (!isPlainObject(component.citation) || !isNonEmptyString(component.citation.sourceRef)
        || !isNonEmptyString(component.citation.locator)) {
        refuseMember(refusals, "gainComponent.citation",
          "a component priced at its own maximum rate must carry the citation the rate was transcribed from");
      }
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* The settled disposition. Its components must SUM to the realised gain: a split that lost or
     invented a dollar is refused rather than displayed, because the whole claim this record
     makes is that two differently-priced pieces account for one gain. */
  function validateDisposition(disposition) {
    var refusals = [];
    if (!isPlainObject(disposition) || disposition.contractVersion !== DISPOSITION_CONTRACT) {
      refuseMember(refusals, "disposition", "the record must carry contractVersion " + DISPOSITION_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (!Number.isFinite(disposition.realizedGain)) {
      refuseMember(refusals, "disposition.realizedGain", "the realised gain or loss must be a finite number");
    }
    if (!Array.isArray(disposition.components)) {
      refuseMember(refusals, "disposition.components", "a disposition must carry its component array");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    var total = 0;
    var index = 0;
    for (index = 0; index < disposition.components.length; index += 1) {
      var shape = validateGainComponent(disposition.components[index]);
      if (!shape.ok) {
        refuseMember(refusals, "disposition.components[" + index + "]",
          "a component of this disposition is not a valid " + GAIN_COMPONENT_CONTRACT);
        continue;
      }
      total += disposition.components[index].amount;
    }
    if (refusals.length === 0 && Number.isFinite(disposition.realizedGain)
      && Math.abs(total - Math.max(disposition.realizedGain, 0)) > 0.005) {
      refuseMember(refusals, "disposition.components",
        "the components do not sum to the realised gain, so the split either lost or invented an amount");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* One sourced member of the disposition policy, checked the same way every sourced figure in
     this pack is: a citation, a locator, a retrieved record, and a source record whose map
     establishes THAT COMPONENT KIND for the declared year. There is deliberately no branch that
     supplies a rate, a period or an amount the pack does not state. */
  function sourcedDispositionMember(pack, figure, kind, label, domain, valueKey, declaredTaxYear) {
    if (isAbsentFigure(figure)) return absentFigureRefusal(figure, domain);
    if (!isPlainObject(figure)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the pack states " + label + " nowhere, and no figure is supplied in its place",
        "transcribe " + label + " from its primary source and record it with a locator");
    }
    if (!isNonEmptyString(figure.sourceRef) || !isNonEmptyString(figure.locator)) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the pack states " + label + " without a sourceRef and a locator naming the section it was transcribed from",
        "add a sourceRef naming a retrieved record and a locator naming the section or heading");
    }
    var record = findSourceRecord(pack, figure.sourceRef);
    if (record === null || record.retrievalOutcome !== "retrieved") {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the sourceRef of " + label + " names no retrieved record in sourceRecords[]",
        "cite a record whose retrievalOutcome is retrieved");
    }
    if (figure.componentKind !== kind) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the pack does not classify " + label + " as the " + kind + " component kind, so the year discipline applied to it would be a different row of its source record than the one it is checked against",
        "record componentKind as " + kind + " or cite a member of the kind the pack does classify it as");
    }
    var declared = isPlainObject(record.declaredApplicableYearsByComponentKind)
      ? record.declaredApplicableYearsByComponentKind[kind]
      : undefined;
    var carries = declared === "year-invariant" ||
      (Array.isArray(declared) && declared.indexOf(declaredTaxYear) >= 0);
    if (!carries) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the cited edition does not establish " + label + " for the declared year, and no figure is carried across from another tax year",
        "cite an edition that declares the year effective, or one whose " + kind + " kind is year-invariant with a basis");
    }
    var value = figure[valueKey];
    if (!Number.isFinite(value) || value < 0) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the pack carries " + label + " without the finite value it is supposed to state",
        "state the value; an empty sourced member establishes nothing");
    }
    return figure;
  }

  /* FR-023-030's sourcing gate. An unretrieved maximum rate refuses the RECAPTURE COMPONENT and
     nothing else — the caller is required not to reprice the whole gain under the preferential
     model in its place, and an assertion proves it does not. */
  function validateRecaptureRule(pack, declaredTaxYear) {
    var policy = isPlainObject(pack) ? pack.dispositionPolicy : null;
    if (!isPlainObject(policy)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "disposition:recaptureCategory",
        "the resolved pack carries no disposition policy, so the maximum rate for the recapture category could not be established",
        "author a pack that declares dispositionPolicy with the sourced maximum rate and its locator");
    }
    if (isAbsentFigure(policy)) return absentFigureRefusal(policy, "disposition:recaptureCategory");
    var category = policy.recaptureCategory;
    var resolved = sourcedDispositionMember(pack, category, "rate",
      "the maximum rate for the recapture category", "disposition:recaptureCategory",
      "maximumRate", declaredTaxYear);
    if (isUnavailable(resolved)) return resolved;
    if (resolved.maximumRate > 1) {
      return unavailable("RLTAX-PACK-INVALID", "disposition:recaptureCategory",
        "the maximum rate is not a fraction, so it would price a gain at more than the gain",
        "transcribe the rate as a fraction of one");
    }
    if (!isNonEmptyString(resolved.categoryId)) {
      return unavailable("RLTAX-PACK-INVALID", "disposition:recaptureCategory",
        "the pack states a maximum rate without naming the category the authority states it for",
        "record categoryId as the category the retrieved authority names");
    }
    return resolved;
  }

  /* FR-023-033 and FR-023-034's sourcing gate. Each of the two tests is resolved SEPARATELY, so
     a pack that established one and not the other refuses by the name of the one it could not
     establish rather than refusing both. The amount is resolved per filing status, which is what
     makes a status the retrieved publication does not enumerate ship absent instead of
     borrowing another status's figure. */
  function validateResidenceExclusionRule(pack, declaredTaxYear, filingStatus) {
    var policy = isPlainObject(pack) ? pack.dispositionPolicy : null;
    if (!isPlainObject(policy)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "disposition:residenceExclusion",
        "the resolved pack carries no disposition policy, so neither eligibility period nor any exclusion amount could be established",
        "author a pack that declares dispositionPolicy with both sourced period figures and the amounts per filing status");
    }
    var rule = policy.residenceExclusion;
    if (isAbsentFigure(rule)) return absentFigureRefusal(rule, "disposition:residenceExclusion");
    if (!isPlainObject(rule)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "disposition:residenceExclusion",
        "the pack states no residence-exclusion rule, so no gain is excluded",
        "transcribe both period figures and the amounts per filing status from their primary source");
    }
    var tests = [
      { key: "ownershipTest", label: "the ownership period figure" },
      { key: "useTest", label: "the use period figure" }
    ];
    var index = 0;
    for (index = 0; index < tests.length; index += 1) {
      var domain = "disposition:residenceExclusion:" + tests[index].key;
      var resolvedTest = sourcedDispositionMember(pack, rule[tests[index].key], "qualifier",
        tests[index].label, domain, "minimumMonths", declaredTaxYear);
      if (isUnavailable(resolvedTest)) return resolvedTest;
      if (USE_COMPARISON_OPERATORS.indexOf(resolvedTest.comparisonOperator) < 0) {
        return unavailable("RLTAX-PACK-INVALID", domain,
          "the pack states " + tests[index].label + " without naming the comparison the publication states it under, so its inclusivity would be the engine's convention rather than the authority's",
          "record comparisonOperator as one of: " + USE_COMPARISON_OPERATORS.join(", "));
      }
      if (!Number.isFinite(resolvedTest.lookbackYears) || resolvedTest.lookbackYears <= 0) {
        return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the pack states " + tests[index].label + " without the lookback period the authority measures it over",
          "transcribe the lookback period stated beside the figure");
      }
    }
    var amounts = rule.maximumAmounts;
    var amountDomain = "disposition:residenceExclusion:maximumAmounts:" + String(filingStatus);
    if (isAbsentFigure(amounts)) return absentFigureRefusal(amounts, amountDomain);
    if (!isPlainObject(amounts) || !isPlainObject(amounts.amounts)) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", amountDomain,
        "the pack states no exclusion amounts, so no gain is excluded",
        "transcribe the exclusion amount for each filing status the source enumerates");
    }
    var amount = amounts.amounts[filingStatus];
    if (isAbsentFigure(amount)) return absentFigureRefusal(amount, amountDomain);
    var resolvedAmounts = sourcedDispositionMember(pack,
      Object.freeze({
        componentKind: amounts.componentKind, sourceRef: amounts.sourceRef,
        locator: amounts.locator, amount: amount
      }),
      "amount", "the exclusion amount for this filing status", amountDomain, "amount", declaredTaxYear);
    if (isUnavailable(resolvedAmounts)) return resolvedAmounts;
    return Object.freeze({
      contractVersion: RESIDENCE_EXCLUSION_CONTRACT,
      ownershipTest: rule.ownershipTest,
      useTest: rule.useTest,
      maximumAmount: amount,
      amountCitation: Object.freeze({ sourceRef: amounts.sourceRef, locator: amounts.locator })
    });
  }

  function isDisposition(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === DISPOSITION_CONTRACT;
  }

  /* ---------- Feature 024 Scope 01. The benefit axis vocabulary. ---------- */

  function isBenefitBasisOrigin(candidate) {
    return BENEFIT_BASIS_ORIGINS.indexOf(candidate) >= 0;
  }

  function isBenefitBasis(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === BENEFIT_BASIS_CONTRACT;
  }

  function isClaimAgeAdjustment(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === CLAIM_AGE_ADJUSTMENT_CONTRACT;
  }

  /* An exact-boundary comparison, reused unchanged from `UseClassification/v1`'s shape. Publishing
     `{ left, operator, right, result }` is what makes inclusivity inspectable: a reader can see
     that the test was strict, and an assertion pins it at the exact sourced figure rather than
     assuming which branch the engine took. */
  function comparisonRecord(comparisonId, left, operator, right, result) {
    return Object.freeze({
      comparisonId: comparisonId,
      left: left,
      operator: operator,
      right: right,
      result: result === true
    });
  }

  /* `BenefitBasis/v1`. The two origins are validated by two DIFFERENT rules, which is the whole
     mechanism: a declared statement amount that carried a citation would present the household's
     own reading as an authority's, and a computed origin that carried none would present an
     uncited figure as a sourced one. Neither refusal is a message; both are shape. */
  function validateBenefitBasis(basis) {
    var refusals = [];
    if (!isPlainObject(basis)) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis",
        "the benefit basis is missing or is not an object",
        "supply a BenefitBasis/v1 record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (basis.contractVersion !== BENEFIT_BASIS_CONTRACT) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:contractVersion",
        "the benefit basis does not declare " + BENEFIT_BASIS_CONTRACT,
        "set contractVersion to " + BENEFIT_BASIS_CONTRACT));
    }
    if (!isBenefitBasisOrigin(basis.basisOrigin)) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:basisOrigin",
        "the basisOrigin is not one of the two declared origins",
        "set basisOrigin to one of: " + BENEFIT_BASIS_ORIGINS.join(", ")));
    }
    var keys = sortedKeysOf(basis);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (BENEFIT_BASIS_KEYS.indexOf(keys[index]) < 0) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:" + keys[index],
          "the benefit basis carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + BENEFIT_BASIS_KEYS.join(", ")));
      }
    }
    if (basis.basisOrigin === "declared-statement-pia") {
      if (carriesCitation(basis) || carriesCitation(basis.primaryInsuranceAmount)) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:declared-statement-pia",
          "a statement amount the household read off its own Social Security statement carries a citation, which would present the household's own input as an authority's figure",
          "remove the sourceRef and the locator; a declared amount is labelled the household's own input and is never cited"));
      }
      if (!Number.isFinite(basis.primaryInsuranceAmount) || basis.primaryInsuranceAmount < 0) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:primaryInsuranceAmount",
          "the declared statement amount is not a finite amount at or above zero",
          "declare the monthly Primary Insurance Amount shown on the statement"));
      }
      if (basis.declaredEarnings !== undefined && basis.declaredEarnings !== null) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:declaredEarnings",
          "the declared-statement origin carries an earnings record, which is the other origin's input",
          "declare exactly one origin; an earnings record belongs to computed-from-earnings"));
      }
    }
    if (basis.basisOrigin === "computed-from-earnings") {
      if (!Array.isArray(basis.declaredEarnings) || basis.declaredEarnings.length === 0) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:declaredEarnings",
          "the computed origin carries no declared earnings record",
          "declare the earnings record as an array of { year, amount } entries"));
      }
      if (basis.primaryInsuranceAmount !== undefined && basis.primaryInsuranceAmount !== null) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:primaryInsuranceAmount",
          "the computed origin carries a statement amount, which is the other origin's input",
          "declare exactly one origin; a statement amount belongs to declared-statement-pia"));
      }
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  function isProvisionalIncome(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === PROVISIONAL_INCOME_CONTRACT;
  }

  function isBenefitInclusion(candidate) {
    return isPlainObject(candidate) && candidate.contractVersion === BENEFIT_INCLUSION_CONTRACT;
  }

  /* FR-024-012. The single validation this scope turns on, written before any figure was
     retrieved. A `yearInvarianceBasis` is admissible only when it QUOTES the publication on both
     sides of a contrast and says where each quotation sits. Three things it therefore refuses,
     each for its own reason:

       - a bare assertion — a basis that states the figure does not vary without quoting anything;
       - a category name — a quotation too short, or with no interior whitespace, to be a sentence
         a reader could go and find;
       - another feature's finding — a quotation citing this repository's own governance rather
         than the publication, which is a claim about a different document.

     The contrast is what makes it a basis rather than an observation. A publication that dates
     nothing has not established that anything is undated on purpose. */
  function validateQuotedInvarianceBasis(basis, label) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-THRESHOLD-UNAVAILABLE", label + (member === "" ? "" : ":" + member),
        reason, remedy));
    };
    if (!isPlainObject(basis)) {
      refuse("", "the figure comes from an edition other than the declared year and carries no yearInvarianceBasis at all",
        "quote the publication's own dating contrast for this component kind, or ship the figure as an AbsentFigure and refuse");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (basis.contractVersion !== YEAR_INVARIANCE_BASIS_CONTRACT) {
      refuse("contractVersion", "the invariance basis does not declare " + YEAR_INVARIANCE_BASIS_CONTRACT,
        "set contractVersion to " + YEAR_INVARIANCE_BASIS_CONTRACT);
    }
    var keys = sortedKeysOf(basis);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (YEAR_INVARIANCE_BASIS_KEYS.indexOf(keys[index]) < 0) {
        refuse(keys[index], "the invariance basis carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + YEAR_INVARIANCE_BASIS_KEYS.join(", "));
      }
    }
    if (COMPONENT_KINDS.indexOf(basis.componentKind) < 0) {
      refuse("componentKind", "the invariance basis names no component kind, so it cannot be judged per component kind",
        "set componentKind to one of: " + COMPONENT_KINDS.join(", "));
    }
    var quotations = [
      { member: "quotedContrast", locatorMember: "contrastLocator" },
      { member: "quotedDatedCounterpart", locatorMember: "datedCounterpartLocator" }
    ];
    for (index = 0; index < quotations.length; index += 1) {
      var member = quotations[index].member;
      var locatorMember = quotations[index].locatorMember;
      var quotation = basis[member];
      if (!isNonEmptyString(quotation)) {
        refuse(member, "the invariance basis carries no " + member + ", so it is a bare assertion rather than a quoted contrast",
          "quote the publication's own words for " + member + "; an assertion that the figure does not vary is not a basis");
      } else if (quotation.length < MIN_QUOTED_CONTRAST_LENGTH || quotation.indexOf(" ") < 0) {
        refuse(member, "the " + member + " is a category name or a label rather than a quotation a reader could locate in the publication",
          "quote at least one complete sentence of the publication's own text; a category name is not a basis");
      } else if (FOREIGN_FINDING_PATTERN.test(quotation)) {
        refuse(member, "the " + member + " cites this repository's own governance rather than the publication",
          "quote the publication; a finding about another publication, or about another feature, is not a basis");
      }
      if (!isNonEmptyString(basis[locatorMember])) {
        refuse(locatorMember, "the quoted text carries no locator, so the reader cannot find it in the publication",
          "name the section, table, worksheet line, chapter or column the quotation was transcribed from");
      }
    }
    if (isNonEmptyString(basis.quotedContrast) && basis.quotedContrast === basis.quotedDatedCounterpart) {
      refuse("quotedDatedCounterpart", "both halves of the contrast quote the same text, so no contrast is drawn",
        "quote the text that carries the figure without a year qualifier AND the text in the same publication that does date something");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-015. The mortality table's own dating, quoted from the publication on both sides: the
     text that dates the table, and the text in the same publication that says a table exists for
     other years. Both halves are required. A table carried without them would be a figure whose
     year nobody stated, which is the defect the invariance discipline exists to prevent — the
     difference here is that the two quotations establish the year the figure BELONGS to rather
     than establishing that it does not vary, and the record says exactly that rather than
     claiming an invariance the publication contradicts. */
  function validateMortalityTableYearBasis(basis, label) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-THRESHOLD-UNAVAILABLE",
        label + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(basis)) {
      refuse("", "the mortality table carries no tableYearBasis at all, so the year its figures belong to was never established",
        "quote the publication's own dating for the table and its own statement that a table exists for other years");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (basis.contractVersion !== MORTALITY_TABLE_YEAR_BASIS_CONTRACT) {
      refuse("contractVersion", "the table year basis does not declare " + MORTALITY_TABLE_YEAR_BASIS_CONTRACT,
        "set contractVersion to " + MORTALITY_TABLE_YEAR_BASIS_CONTRACT);
    }
    var keys = sortedKeysOf(basis);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (MORTALITY_TABLE_YEAR_BASIS_KEYS.indexOf(keys[index]) < 0) {
        refuse(keys[index], "the table year basis carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + MORTALITY_TABLE_YEAR_BASIS_KEYS.join(", "));
      }
    }
    var quotations = [
      { member: "quotedTableDating", locatorMember: "tableDatingLocator" },
      { member: "quotedYearScoping", locatorMember: "yearScopingLocator" }
    ];
    for (index = 0; index < quotations.length; index += 1) {
      var member = quotations[index].member;
      var quotation = basis[member];
      if (!isNonEmptyString(quotation)) {
        refuse(member, "the table year basis carries no " + member + ", so it is a bare assertion rather than a quotation",
          "quote the publication's own words for " + member);
      } else if (quotation.length < MIN_QUOTED_CONTRAST_LENGTH || quotation.indexOf(" ") < 0) {
        refuse(member, "the " + member + " is a label rather than a quotation a reader could locate in the publication",
          "quote at least one complete sentence of the publication's own text");
      } else if (FOREIGN_FINDING_PATTERN.test(quotation)) {
        refuse(member, "the " + member + " cites this repository's own governance rather than the publication",
          "quote the publication; a finding recorded here is not a basis");
      }
      if (!isNonEmptyString(basis[quotations[index].locatorMember])) {
        refuse(quotations[index].locatorMember, "the quoted text carries no locator, so the reader cannot find it in the publication",
          "name the paragraph, caption, note or column the quotation was transcribed from");
      }
    }
    if (isNonEmptyString(basis.quotedTableDating) && basis.quotedTableDating === basis.quotedYearScoping) {
      refuse("quotedYearScoping", "both halves quote the same text, so the publication's own dating and its own year scoping are indistinguishable",
        "quote the text that dates this table AND the text in the same publication that states a table exists for other years");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-015. The exact shape of a mortality column, wherever it appears — in the pack's policy
     and in the resolved basis alike. Every member outside the declared shape is refused by NAME
     with `RLTAX-PACK-INVALID`, which is what keeps a column this tool does not carry from
     reaching a record it then renders. The row shape is checked the same way, so a per-age entry
     cannot smuggle an extra figure alongside its life expectancy. */
  function refuseMembersOutsideShape(node, allowedKeys, code, domain, refusals) {
    var keys = sortedKeysOf(node);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (allowedKeys.indexOf(keys[index]) < 0) {
        refusals.push(unavailable(code, domain + ":" + keys[index],
          "this record carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + allowedKeys.join(", ")));
      }
    }
  }

  function validateMortalityPolicy(policy, label) {
    var refusals = [];
    if (!isPlainObject(policy)) {
      refusals.push(unavailable("RLTAX-THRESHOLD-UNAVAILABLE", label,
        "the resolved mortality pack declares no mortality policy",
        "author a pack carrying the life-expectancy column transcribed from its primary source"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    refuseMembersOutsideShape(policy, MORTALITY_POLICY_KEYS, "RLTAX-PACK-INVALID", label, refusals);
    var columns = Array.isArray(policy.columns) ? policy.columns : [];
    var index = 0;
    var rowIndex = 0;
    for (index = 0; index < columns.length; index += 1) {
      var column = columns[index];
      var columnLabel = label + ":column:" + String(isPlainObject(column) ? column.columnId : index);
      if (!isPlainObject(column)) {
        refusals.push(unavailable("RLTAX-PACK-INVALID", columnLabel,
          "a declared column is not a record", "declare each column as a record"));
        continue;
      }
      refuseMembersOutsideShape(column, MORTALITY_COLUMN_KEYS, "RLTAX-PACK-INVALID", columnLabel, refusals);
      var rows = Array.isArray(column.lifeExpectancyByAge) ? column.lifeExpectancyByAge : [];
      for (rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (!isPlainObject(rows[rowIndex])) {
          refusals.push(unavailable("RLTAX-PACK-INVALID", columnLabel + ":row:" + String(rowIndex),
            "a declared row is not a record", "declare each row as a record"));
          continue;
        }
        refuseMembersOutsideShape(rows[rowIndex], MORTALITY_ROW_KEYS, "RLTAX-PACK-INVALID",
          columnLabel + ":row:" + String(rows[rowIndex].age), refusals);
      }
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  function validateMortalityBasis(basis, label) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-PACK-INVALID",
        label + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(basis)) {
      refuse("", "no mortality basis record was supplied", "resolve a " + MORTALITY_BASIS_CONTRACT + " first");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (basis.contractVersion !== MORTALITY_BASIS_CONTRACT) {
      refuse("contractVersion", "the record does not declare " + MORTALITY_BASIS_CONTRACT,
        "set contractVersion to " + MORTALITY_BASIS_CONTRACT);
    }
    refuseMembersOutsideShape(basis, MORTALITY_BASIS_KEYS, "RLTAX-PACK-INVALID", label, refusals);
    if (!Array.isArray(basis.lifeExpectancyByAge) || basis.lifeExpectancyByAge.length === 0) {
      refuse("lifeExpectancyByAge", "the mortality basis carries no life-expectancy rows",
        "transcribe the life-expectancy column by exact age from the published table");
    } else {
      var index = 0;
      for (index = 0; index < basis.lifeExpectancyByAge.length; index += 1) {
        var row = basis.lifeExpectancyByAge[index];
        if (!isPlainObject(row)) {
          refuse("lifeExpectancyByAge", "a life-expectancy row is not a record", "declare each row as a record");
          continue;
        }
        refuseMembersOutsideShape(row, MORTALITY_ROW_KEYS, "RLTAX-PACK-INVALID",
          label + ":lifeExpectancyByAge:" + String(row.age), refusals);
        if (!Number.isFinite(row.age) || !Number.isFinite(row.value) || row.value <= 0) {
          refuse("lifeExpectancyByAge:" + String(row.age),
            "a life-expectancy row carries no finite age and remaining-years pair",
            "transcribe both the exact age and the remaining years the table prints for it");
        }
      }
    }
    if (!isNonEmptyString(basis.tableId)) {
      refuse("tableId", "the mortality basis names no table", "name the table the column was transcribed from");
    }
    if (!Number.isFinite(basis.tableYear)) {
      refuse("tableYear", "the mortality basis states no table year, so a reader cannot tell which year the figures belong to",
        "transcribe the year the publication states for this table");
    }
    if (!isNonEmptyString(basis.sourceRef) || !isNonEmptyString(basis.locator)) {
      refuse("sourceRef", "the mortality basis carries no sourceRef and locator pair",
        "cite the retrieved record and name the column the figures were transcribed from");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-017 through FR-024-019. The comparison record's own shape. `perAge[]` is in declared
     order and the contract says so; `parityAges[]` names both claim ages of each pair; and both
     statements are members of the RECORD rather than page copy, so they travel with it into
     the export and cannot be edited away by a copy change on a page. */
  function validateClaimAgeComparison(record, label) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-PACK-INVALID",
        label + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(record)) {
      refuse("", "no claim-age comparison record was supplied", "compose a " + CLAIM_AGE_COMPARISON_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (record.contractVersion !== CLAIM_AGE_COMPARISON_CONTRACT) {
      refuse("contractVersion", "the record does not declare " + CLAIM_AGE_COMPARISON_CONTRACT,
        "set contractVersion to " + CLAIM_AGE_COMPARISON_CONTRACT);
    }
    refuseMembersOutsideShape(record, CLAIM_AGE_COMPARISON_KEYS, "RLTAX-PACK-INVALID", label, refusals);
    if (!Array.isArray(record.claimAges) || record.claimAges.length === 0) {
      refuse("claimAges", "the comparison names no declared claim ages", "declare at least one claim age");
    }
    if (!Array.isArray(record.perAge) || !Array.isArray(record.parityAges)) {
      refuse("perAge", "the comparison publishes no per-age list and pair list",
        "publish perAge[] in declared order and parityAges[] for each pair");
    } else if (Array.isArray(record.claimAges)
      && record.perAge.length === record.claimAges.length) {
      var index = 0;
      for (index = 0; index < record.perAge.length; index += 1) {
        if (record.perAge[index].claimAge !== record.claimAges[index]) {
          refuse("perAge:" + String(index),
            "the per-age list is not in the order the claim ages were declared",
            "build perAge[] by iterating the declared claim ages; it is never sorted by any figure");
        }
      }
    } else {
      refuse("perAge", "the per-age list does not carry one entry per declared claim age",
        "publish one entry per declared claim age, in declared order");
    }
    if (!isNonEmptyString(record.resultKindStatement)) {
      refuse("resultKindStatement", "the record does not say in its own words what kind of figure it carries",
        "publish resultKindStatement as a member of the record rather than as page copy");
    }
    if (!isNonEmptyString(record.selectsNothingStatement)) {
      refuse("selectsNothingStatement", "the record does not say in its own words that it selects nothing",
        "publish selectsNothingStatement as a member of the record rather than as page copy");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-022. The declared lookback income. Two refusals matter here and they are different
     failures: a `sourceRef` on a household declaration would render the household's own figure as
     an authority's, and a member carrying a CURRENT-year figure would make the whole structural
     independence of the resolver a convention rather than a fact. Both are refused by name, and
     the exact-key shape refuses the members nobody thought to list. */
  function validateLookbackMagi(record, label) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE",
        label + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(record)) {
      refuse("", "no declared lookback income was supplied",
        "declare a " + LOOKBACK_MAGI_CONTRACT + " carrying its own year and its own amount");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (record.contractVersion !== LOOKBACK_MAGI_CONTRACT) {
      refuse("contractVersion", "the declaration does not declare " + LOOKBACK_MAGI_CONTRACT,
        "set contractVersion to " + LOOKBACK_MAGI_CONTRACT);
    }
    var index = 0;
    for (index = 0; index < LOOKBACK_MAGI_FORBIDDEN_KEYS.length; index += 1) {
      var forbidden = LOOKBACK_MAGI_FORBIDDEN_KEYS[index];
      if (Object.prototype.hasOwnProperty.call(record, forbidden)) {
        refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE", label + ":" + forbidden,
          forbidden === "sourceRef"
            ? "a declared lookback income is the household's own figure and may never carry a citation"
            : "the declaration carries " + forbidden + ", through which a current-year figure could reach the adjustment resolver",
          "remove " + forbidden + "; the declared shape is " + LOOKBACK_MAGI_KEYS.join(", ")));
      }
    }
    var keys = sortedKeysOf(record);
    for (index = 0; index < keys.length; index += 1) {
      if (LOOKBACK_MAGI_KEYS.indexOf(keys[index]) < 0
        && LOOKBACK_MAGI_FORBIDDEN_KEYS.indexOf(keys[index]) < 0) {
        refuse(keys[index], "the declaration carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + LOOKBACK_MAGI_KEYS.join(", "));
      }
    }
    if (!Number.isFinite(record.lookbackYear) || Math.floor(record.lookbackYear) !== record.lookbackYear) {
      refuse("lookbackYear", "the declaration names no whole lookback year, so which year's income it carries was never stated",
        "declare the year this income belongs to; it is never inferred from the settled year");
    }
    if (!Number.isFinite(record.modifiedAdjustedGrossIncome) || record.modifiedAdjustedGrossIncome < 0) {
      refuse("modifiedAdjustedGrossIncome", "the declared lookback income must be a finite amount that is not negative",
        "declare the modified adjusted gross income for the named year; a zero is a real declaration and an absent one is not");
    }
    if (record.origin !== "declared") {
      refuse("origin", "a lookback income is the household's own input and its origin must be declared",
        "set origin to declared; no sourced origin exists for a household's own figure");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-025. The bracket record. `boundaryOperator` is required and is drawn from a closed set,
     so a bracket whose inclusivity the retrieval never established cannot be shipped with a
     convention standing in for it. Both part adjustments must be present as a figure or as a
     SourcedZero; an AbsentFigure in either is refused here rather than rendered as nothing owed. */
  function validateAdjustmentBracket(record, label) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-PACK-INVALID",
        label + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(record)) {
      refuse("", "no adjustment bracket record was supplied", "resolve an " + ADJUSTMENT_BRACKET_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (record.contractVersion !== ADJUSTMENT_BRACKET_CONTRACT) {
      refuse("contractVersion", "the record does not declare " + ADJUSTMENT_BRACKET_CONTRACT,
        "set contractVersion to " + ADJUSTMENT_BRACKET_CONTRACT);
    }
    refuseMembersOutsideShape(record, ADJUSTMENT_BRACKET_KEYS, "RLTAX-PACK-INVALID", label, refusals);
    if (BOUNDARY_OPERATORS.indexOf(record.boundaryOperator) < 0) {
      refuse("boundaryOperator", "the bracket states no sourced inclusivity for its own lower bound",
        "transcribe the publication's own operator; one of " + BOUNDARY_OPERATORS.join(", "));
    }
    if (!Number.isFinite(record.bracketIndex)) {
      refuse("bracketIndex", "the bracket carries no index", "publish the bracket's position in its declared set");
    }
    if (!Array.isArray(record.comparisonsPerformed) || record.comparisonsPerformed.length === 0) {
      refuse("comparisonsPerformed", "the bracket publishes no comparison, so its inclusivity is not inspectable",
        "publish each comparison as { left, operator, right, result }");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-026 and FR-024-027. A premium record is a COST, and the two rules that keeps it honest
     are enforced here rather than at a call site: `includedInTotal` is structurally `false`, and a
     record carrying an absent standard premium or an absent adjustment is refused rather than
     shipped. The second is the pack contract's own rule re-asserted at the record level, because
     this feature is the first to ship a leg the total must exclude and `false` must not become a
     route past a refusal. */
  function validatePremiumRecord(record, label) {
    var refusals = [];
    var refuse = function (code, member, reason, remedy) {
      refusals.push(unavailable(code, label + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(record)) {
      refuse("RLTAX-PACK-INVALID", "", "no premium record was supplied", "compose a " + PREMIUM_RECORD_CONTRACT);
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (record.contractVersion !== PREMIUM_RECORD_CONTRACT) {
      refuse("RLTAX-PACK-INVALID", "contractVersion", "the record does not declare " + PREMIUM_RECORD_CONTRACT,
        "set contractVersion to " + PREMIUM_RECORD_CONTRACT);
    }
    refuseMembersOutsideShape(record, PREMIUM_RECORD_KEYS, "RLTAX-PACK-INVALID", label, refusals);
    if (PREMIUM_PART_IDS.indexOf(record.partId) < 0) {
      refuse("RLTAX-PACK-INVALID", "partId", "the record names no declared Medicare part",
        "set partId to one of: " + PREMIUM_PART_IDS.join(", "));
    }
    if (record.includedInTotal !== false) {
      refuse("RLTAX-PACK-INVALID", "includedInTotal",
        "a premium is a household cost rather than federal income tax and may never be included in a tax total",
        "set includedInTotal to false; there is no premium record whose value enters a tax total");
    }
    var figures = ["standardPremiumMonthly", "adjustmentMonthly", "totalMonthly", "totalAnnual"];
    var index = 0;
    for (index = 0; index < figures.length; index += 1) {
      var figure = record[figures[index]];
      if (isAbsentFigure(figure) || isUnavailable(figure)) {
        refuse("RLTAX-THRESHOLD-UNAVAILABLE", figures[index],
          "this premium record carries an unestablished " + figures[index]
            + ", and includedInTotal false is not a mechanism for carrying it past a total",
          "retrieve the figure and transcribe it, or refuse the leg; no zero stands in for it");
      } else if (!Number.isFinite(figure) || figure < 0) {
        refuse("RLTAX-PACK-INVALID", figures[index], "the record's " + figures[index] + " is not a finite amount",
          "publish " + figures[index] + " as a finite amount that is not negative");
      }
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-008 and FR-024-009. The composition check inspects WHAT WAS SUMMED. A part whose
     `readFromMeasureId` names a measure this record declares itself distinct from is refused even
     when the total differs from that measure, because a total comparison cannot tell a copied
     measure from a coincidence and this check is not allowed to depend on arithmetic. */
  function validateProvisionalIncome(record) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE",
        "provisional-income" + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(record)) {
      refuse("", "the provisional income record is missing or is not an object",
        "supply a " + PROVISIONAL_INCOME_CONTRACT + " record");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (record.contractVersion !== PROVISIONAL_INCOME_CONTRACT) {
      refuse("contractVersion", "the record does not declare " + PROVISIONAL_INCOME_CONTRACT,
        "set contractVersion to " + PROVISIONAL_INCOME_CONTRACT);
    }
    var keys = sortedKeysOf(record);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (PROVISIONAL_INCOME_KEYS.indexOf(keys[index]) < 0) {
        refuse(keys[index], "the record carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + PROVISIONAL_INCOME_KEYS.join(", "));
      }
    }
    if (record.measureId !== PROVISIONAL_INCOME_MEASURE_ID) {
      refuse("measureId", "the record does not name itself " + PROVISIONAL_INCOME_MEASURE_ID,
        "set measureId to " + PROVISIONAL_INCOME_MEASURE_ID);
    }
    var distinctFrom = Array.isArray(record.distinctFrom) ? record.distinctFrom : [];
    for (index = 0; index < PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM.length; index += 1) {
      if (distinctFrom.indexOf(PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM[index]) < 0) {
        refuse("distinctFrom", "the record does not name " + PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM[index]
          + " among the measures it is not",
          "name every measure this one is distinct from, including "
            + PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM.join(" and "));
      }
    }
    if (!Array.isArray(record.parts) || record.parts.length === 0) {
      refuse("parts", "the record publishes no parts, so what was summed cannot be inspected",
        "publish every part the source names, each with its amount and its origin");
      return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
    }
    var summed = 0;
    var seen = {};
    for (index = 0; index < record.parts.length; index += 1) {
      var part = record.parts[index];
      var partLabel = "parts[" + index + "]";
      if (!isPlainObject(part)) {
        refuse(partLabel, "a provisional income part is not an object", "publish each part as a record");
        continue;
      }
      var partKeys = sortedKeysOf(part);
      var keyIndex = 0;
      for (keyIndex = 0; keyIndex < partKeys.length; keyIndex += 1) {
        if (PROVISIONAL_INCOME_PART_KEYS.indexOf(partKeys[keyIndex]) < 0) {
          refuse(partLabel + "." + partKeys[keyIndex],
            "the part carries a member outside its declared shape: " + partKeys[keyIndex],
            "remove " + partKeys[keyIndex] + "; the declared shape is " + PROVISIONAL_INCOME_PART_KEYS.join(", "));
        }
      }
      if (!isNonEmptyString(part.partId)) {
        refuse(partLabel + ".partId", "the part carries no id", "name the part the source names");
      } else if (seen[part.partId] === true) {
        refuse(partLabel + ".partId", "the part id " + part.partId + " appears twice",
          "publish each named part exactly once");
      } else {
        seen[part.partId] = true;
      }
      if (!isNonEmptyString(part.label)) {
        refuse(partLabel + ".label", "the part carries no label", "label the part as the source labels it");
      }
      if (PROVISIONAL_INCOME_PART_ORIGINS.indexOf(part.origin) < 0) {
        refuse(partLabel + ".origin", "the part origin is not one of the declared origins",
          "set origin to one of: " + PROVISIONAL_INCOME_PART_ORIGINS.join(", "));
      }
      if (!Number.isFinite(part.amount)) {
        refuse(partLabel + ".amount", "the part carries no finite amount",
          "publish the amount this part contributed");
      } else {
        summed += part.amount;
      }
      /* The construction check. It fires on the MEASURE the part was read from and never on the
         total, so a composition that copied the pack's modified adjusted gross measure is refused
         even when the copied number happens to differ from it. */
      if (part.readFromMeasureId !== null && part.readFromMeasureId !== undefined) {
        if (distinctFrom.indexOf(part.readFromMeasureId) >= 0) {
          refuse(partLabel + ".readFromMeasureId",
            "the part was read from " + part.readFromMeasureId
              + ", a measure this record declares itself distinct from, so the composition reused that measure rather than composing the parts the source names",
            "compose the part from the household's own declaration or from the settled benefit; provisional income is not "
              + part.readFromMeasureId + " and reusing it is refused whatever the total comes to");
        }
      }
    }
    if (!Number.isFinite(record.total)) {
      refuse("total", "the record carries no finite total", "publish the total of the published parts");
    } else if (Math.abs(record.total - summed) > 0.005) {
      refuse("total", "the published total is not the sum of the published parts",
        "publish a total equal to the sum of the parts, so the composition a reader is shown is the one that was performed");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* FR-024-010 and FR-024-011. Every comparison the tier decision performed is published as
     `{ left, operator, right, result }`, so an assertion pins the comparison at the exact sourced
     figure rather than assuming which branch was taken. */
  function validateBenefitInclusion(record) {
    var refusals = [];
    var refuse = function (member, reason, remedy) {
      refusals.push(unavailable("RLTAX-INPUT-INCOMPLETE",
        "benefit-inclusion" + (member === "" ? "" : ":" + member), reason, remedy));
    };
    if (!isPlainObject(record)) {
      refuse("", "the inclusion record is missing or is not an object",
        "supply a " + BENEFIT_INCLUSION_CONTRACT + " record");
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (record.contractVersion !== BENEFIT_INCLUSION_CONTRACT) {
      refuse("contractVersion", "the record does not declare " + BENEFIT_INCLUSION_CONTRACT,
        "set contractVersion to " + BENEFIT_INCLUSION_CONTRACT);
    }
    var keys = sortedKeysOf(record);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (BENEFIT_INCLUSION_KEYS.indexOf(keys[index]) < 0) {
        refuse(keys[index], "the record carries a member outside its declared shape: " + keys[index],
          "remove " + keys[index] + "; the declared shape is " + BENEFIT_INCLUSION_KEYS.join(", "));
      }
    }
    if (BENEFIT_INCLUSION_TIERS.indexOf(record.tier) < 0) {
      refuse("tier", "the tier is not one of the declared tiers",
        "set tier to one of: " + BENEFIT_INCLUSION_TIERS.join(", "));
    }
    if (!Array.isArray(record.baseAmounts) || record.baseAmounts.length === 0) {
      refuse("baseAmounts", "the record publishes no base amounts, so the figures compared against cannot be inspected",
        "publish every base amount the comparison used with its citation");
    }
    if (!Array.isArray(record.comparisonsPerformed) || record.comparisonsPerformed.length === 0) {
      refuse("comparisonsPerformed", "the record publishes no comparisons, so the inclusivity of the tier boundary is not readable",
        "publish each comparison as { comparisonId, left, operator, right, result }");
    } else {
      for (index = 0; index < record.comparisonsPerformed.length; index += 1) {
        var comparison = record.comparisonsPerformed[index];
        if (!isPlainObject(comparison) || !isNonEmptyString(comparison.comparisonId)
          || !isNonEmptyString(comparison.operator) || typeof comparison.result !== "boolean") {
          refuse("comparisonsPerformed[" + index + "]",
            "a published comparison does not carry an id, an operator and a boolean result",
            "publish each comparison as { comparisonId, left, operator, right, result }");
        }
      }
    }
    if (!Number.isFinite(record.ceilingProportion) || record.ceilingProportion <= 0) {
      refuse("ceilingProportion", "the record carries no sourced ceiling proportion",
        "publish the ceiling proportion the source states");
    }
    if (record.ceilingBound !== true && record.ceilingBound !== false) {
      refuse("ceilingBound", "the record does not state whether the ceiling bound the result",
        "publish ceilingBound as a boolean; whether the ceiling bound is a fact about this settlement");
    }
    if (!Number.isFinite(record.includedAmount) || record.includedAmount < 0) {
      refuse("includedAmount", "the included amount is not a finite amount at or above zero",
        "publish the included amount the tier's own arithmetic produced");
    }
    if (!isProvisionalIncome(record.provisionalIncome)) {
      refuse("provisionalIncome", "the record does not carry the provisional income it compared",
        "carry the " + PROVISIONAL_INCOME_CONTRACT + " record the comparison was performed against");
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* The shared SOURCED ROW LOOKUP. A table carrying its own declared domain, keyed by a declared
     value, returning an `AbsentFigure` when the key falls outside that domain. Scopes 03 and 04
     consume this unchanged, which is why it lives here rather than inside the benefit engine.
     The single behaviour that matters: a key outside the declared domain returns an AbsentFigure
     and NEVER a neighbouring row. A lookup that clamped to the nearest row would silently produce
     a plausible wrong figure in three separate families, and plausible-and-wrong is the exact
     failure this feature exists to prevent. */
  function lookupSourcedRow(table, key, domain) {
    if (!isPlainObject(table) || !Array.isArray(table.rows) || table.rows.length === 0) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the pack carries no sourced row table for this lookup",
        "author a pack that declares the table with its rows, its declared domain and its locator");
    }
    if (isAbsentFigure(table)) return absentFigureRefusal(table, domain);
    if (!Number.isFinite(key)) {
      return unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "the lookup key is not declared, so no row can be selected",
        "declare " + (isNonEmptyString(table.keyName) ? table.keyName : "the lookup key"));
    }
    var declared = isPlainObject(table.declaredDomain) ? table.declaredDomain : null;
    if (declared === null) {
      return unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced row table declares no domain, so a key outside it could not be distinguished from one inside it",
        "add declaredDomain with lowerInclusive/upperInclusive and their openness");
    }
    var belowDomain = declared.lowerOpen !== true && Number.isFinite(declared.lowerInclusive)
      && key < declared.lowerInclusive;
    var aboveDomain = declared.upperOpen !== true && Number.isFinite(declared.upperInclusive)
      && key > declared.upperInclusive;
    if (belowDomain || aboveDomain) {
      return unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the declared " + (isNonEmptyString(table.keyName) ? table.keyName : "key") + " " + String(key)
          + " falls outside the sourced table's own declared domain "
          + (declared.lowerOpen === true ? "(open)" : String(declared.lowerInclusive))
          + " to "
          + (declared.upperOpen === true ? "(open)" : String(declared.upperInclusive))
          + ", and no adjacent row is used in its place",
        "declare a " + (isNonEmptyString(table.keyName) ? table.keyName : "key")
          + " inside the table's declared domain, or retrieve a table whose declared domain covers it; the neighbouring row is deliberately not substituted");
    }
    var index = 0;
    for (index = 0; index < table.rows.length; index += 1) {
      var row = table.rows[index];
      if (!isPlainObject(row)) continue;
      var lowOk = !Number.isFinite(row.keyFrom) || key >= row.keyFrom;
      var highOk = !Number.isFinite(row.keyTo) || key <= row.keyTo;
      if (lowOk && highOk) {
        return Object.freeze({
          contractVersion: SOURCED_ROW_LOOKUP_CONTRACT,
          tableId: table.tableId,
          keyName: table.keyName,
          key: key,
          row: row,
          declaredDomain: table.declaredDomain,
          sourceRef: table.sourceRef,
          locator: isNonEmptyString(row.locator) ? row.locator : table.locator
        });
      }
    }
    /* Inside the declared domain and matched by no row. This is a defect in the transcription
       rather than in the household's declaration, and it refuses rather than reaching for the
       closest row. */
    return unavailable("RLTAX-PACK-INVALID", domain,
      "the declared key " + String(key) + " sits inside the table's declared domain and no transcribed row covers it",
      "transcribe the row covering " + String(key) + " from the primary source; no adjacent row is substituted");
  }

  var api = Object.freeze({
    RULE_STATUS: RULE_STATUS,
    RLTAX_CODES: RLTAX_CODES,
    RESIDENCY_PATTERNS: RESIDENCY_PATTERNS,
    SUPPORTED_INCOME_KINDS: SUPPORTED_INCOME_KINDS,
    SUPPORTED_FILING_STATUSES: SUPPORTED_FILING_STATUSES,
    PREFERENTIAL_INCOME_KINDS: PREFERENTIAL_INCOME_KINDS,
    INCOME_KIND_FIELDS: INCOME_KIND_FIELDS,
    CALCULATION_ORDER: CALCULATION_ORDER,
    CALCULATION_ORDER_NO_PREFERENTIAL: CALCULATION_ORDER_NO_PREFERENTIAL,
    ALL_CALCULATION_STAGES: ALL_CALCULATION_STAGES,
    COMPONENT_KINDS: COMPONENT_KINDS,
    PACK_REQUIRED_MEMBERS: PACK_REQUIRED_MEMBERS,
    PACK_V2_REQUIRED_MEMBERS: PACK_V2_REQUIRED_MEMBERS,
    isSafeSourceUrl: isSafeSourceUrl,
    V1_TAX_LEGS: V1_TAX_LEGS,
    CAP_BINDINGS: CAP_BINDINGS,
    CHOSEN_DEDUCTION_SIDES: CHOSEN_DEDUCTION_SIDES,
    DEDUCTION_COMPONENT_CONTRACT: DEDUCTION_COMPONENT_CONTRACT,
    DEDUCTION_COMPONENT_KEYS: DEDUCTION_COMPONENT_KEYS,
    DEDUCTION_COMPONENT_ORIGINS: DEDUCTION_COMPONENT_ORIGINS,
    ITEMIZED_COMPOSITION_CONTRACT: ITEMIZED_COMPOSITION_CONTRACT,
    PROPERTY_APPLICATION_POINTS: PROPERTY_APPLICATION_POINTS,
    PROPERTY_ASSESSMENT_CONTRACT: PROPERTY_ASSESSMENT_CONTRACT,
    PROPERTY_CAP_BASES: PROPERTY_CAP_BASES,
    PROPERTY_REGIME_CONTRACT: PROPERTY_REGIME_CONTRACT,
    COST_RECOVERY_CONTRACT: COST_RECOVERY_CONTRACT,
    COST_RECOVERY_CONVENTIONS: COST_RECOVERY_CONVENTIONS,
    COST_RECOVERY_METHODS: COST_RECOVERY_METHODS,
    LOSS_DISPOSITIONS: LOSS_DISPOSITIONS,
    LOSS_LIMITATION_CONTRACT: LOSS_LIMITATION_CONTRACT,
    LOSS_LIMITATION_KEYS: LOSS_LIMITATION_KEYS,
    LOSS_LIMIT_IDS: LOSS_LIMIT_IDS,
    RENTAL_ACTIVITY_CONTRACT: RENTAL_ACTIVITY_CONTRACT,
    RENTAL_ACTIVITY_KEYS: RENTAL_ACTIVITY_KEYS,
    DWELLING_USE_DECLARATION_CONTRACT: DWELLING_USE_DECLARATION_CONTRACT,
    DWELLING_USE_DECLARATION_KEYS: DWELLING_USE_DECLARATION_KEYS,
    USE_ALLOCATION_CONTRACT: USE_ALLOCATION_CONTRACT,
    USE_CATEGORIES: USE_CATEGORIES,
    USE_CLASSIFICATION_CONTRACT: USE_CLASSIFICATION_CONTRACT,
    USE_CLASSIFICATION_KEYS: USE_CLASSIFICATION_KEYS,
    USE_COMPARISON_KEYS: USE_COMPARISON_KEYS,
    USE_COMPARISON_OPERATORS: USE_COMPARISON_OPERATORS,
    LOOKBACK_MAGI_CONTRACT: LOOKBACK_MAGI_CONTRACT,
    LOOKBACK_MAGI_KEYS: LOOKBACK_MAGI_KEYS,
    LOOKBACK_MAGI_FORBIDDEN_KEYS: LOOKBACK_MAGI_FORBIDDEN_KEYS,
    ADJUSTMENT_BRACKET_CONTRACT: ADJUSTMENT_BRACKET_CONTRACT,
    ADJUSTMENT_BRACKET_KEYS: ADJUSTMENT_BRACKET_KEYS,
    BOUNDARY_OPERATORS: BOUNDARY_OPERATORS,
    PREMIUM_RECORD_CONTRACT: PREMIUM_RECORD_CONTRACT,
    PREMIUM_RECORD_KEYS: PREMIUM_RECORD_KEYS,
    PREMIUM_PART_IDS: PREMIUM_PART_IDS,
    DISPOSITION_CONTRACT: DISPOSITION_CONTRACT,
    DISPOSITION_DECLARATION_CONTRACT: DISPOSITION_DECLARATION_CONTRACT,
    DISPOSITION_PROPERTY_USES: DISPOSITION_PROPERTY_USES,
    GAIN_COMPONENT_CONTRACT: GAIN_COMPONENT_CONTRACT,
    GAIN_PRICING_RULES: GAIN_PRICING_RULES,
    RESIDENCE_EXCLUSION_CONTRACT: RESIDENCE_EXCLUSION_CONTRACT,
    RESIDENCE_TEST_IDS: RESIDENCE_TEST_IDS,
    BENEFIT_BASIS_CONTRACT: BENEFIT_BASIS_CONTRACT,
    BENEFIT_BASIS_KEYS: BENEFIT_BASIS_KEYS,
    BENEFIT_BASIS_ORIGINS: BENEFIT_BASIS_ORIGINS,
    CLAIM_AGE_ADJUSTMENT_CONTRACT: CLAIM_AGE_ADJUSTMENT_CONTRACT,
    CLAIM_AGE_ADJUSTMENT_KEYS: CLAIM_AGE_ADJUSTMENT_KEYS,
    CLAIM_AGE_DIRECTIONS: CLAIM_AGE_DIRECTIONS,
    SOURCED_ROW_LOOKUP_CONTRACT: SOURCED_ROW_LOOKUP_CONTRACT,
    PROVISIONAL_INCOME_CONTRACT: PROVISIONAL_INCOME_CONTRACT,
    PROVISIONAL_INCOME_KEYS: PROVISIONAL_INCOME_KEYS,
    PROVISIONAL_INCOME_MEASURE_ID: PROVISIONAL_INCOME_MEASURE_ID,
    PROVISIONAL_INCOME_PART_KEYS: PROVISIONAL_INCOME_PART_KEYS,
    PROVISIONAL_INCOME_PART_ORIGINS: PROVISIONAL_INCOME_PART_ORIGINS,
    PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM: PROVISIONAL_INCOME_REQUIRED_DISTINCT_FROM,
    BENEFIT_INCLUSION_CONTRACT: BENEFIT_INCLUSION_CONTRACT,
    BENEFIT_INCLUSION_KEYS: BENEFIT_INCLUSION_KEYS,
    BENEFIT_INCLUSION_TIERS: BENEFIT_INCLUSION_TIERS,
    MORTALITY_BASIS_CONTRACT: MORTALITY_BASIS_CONTRACT,
    MORTALITY_BASIS_KEYS: MORTALITY_BASIS_KEYS,
    MORTALITY_COLUMN_KEYS: MORTALITY_COLUMN_KEYS,
    MORTALITY_POLICY_KEYS: MORTALITY_POLICY_KEYS,
    MORTALITY_ROW_KEYS: MORTALITY_ROW_KEYS,
    MORTALITY_TABLE_YEAR_BASIS_CONTRACT: MORTALITY_TABLE_YEAR_BASIS_CONTRACT,
    MORTALITY_TABLE_YEAR_BASIS_KEYS: MORTALITY_TABLE_YEAR_BASIS_KEYS,
    CLAIM_AGE_COMPARISON_CONTRACT: CLAIM_AGE_COMPARISON_CONTRACT,
    CLAIM_AGE_COMPARISON_KEYS: CLAIM_AGE_COMPARISON_KEYS,
    YEAR_INVARIANCE_BASIS_CONTRACT: YEAR_INVARIANCE_BASIS_CONTRACT,
    YEAR_INVARIANCE_BASIS_KEYS: YEAR_INVARIANCE_BASIS_KEYS,
    absentFigureRefusal: absentFigureRefusal,
    calculationOrderFor: calculationOrderFor,
    carriesCitation: carriesCitation,
    componentExistsOn: componentExistsOn,
    componentKindOf: componentKindOf,
    componentYearContainment: componentYearContainment,
    comparisonRecord: comparisonRecord,
    declaredTaxLegs: declaredTaxLegs,
    effectiveSourceFor: effectiveSourceFor,
    isAbsentFigure: isAbsentFigure,
    isBenefitBasis: isBenefitBasis,
    isBenefitBasisOrigin: isBenefitBasisOrigin,
    isBenefitInclusion: isBenefitInclusion,
    isProvisionalIncome: isProvisionalIncome,
    isClaimAgeAdjustment: isClaimAgeAdjustment,
    isDisposition: isDisposition,
    isLossLimitation: isLossLimitation,
    isPropertyApplicationPoint: isPropertyApplicationPoint,
    isPropertyAssessment: isPropertyAssessment,
    isPropertyCapBasis: isPropertyCapBasis,
    isPropertyRegimePath: isPropertyRegimePath,
    isPropertyReliefRegime: isPropertyReliefRegime,
    isRateTable: isRateTable,
    isReliefMechanism: isReliefMechanism,
    isRentalActivity: isRentalActivity,
    isSourcedZero: isSourcedZero,
    isSupportedJurisdiction: isSupportedJurisdiction,
    isThresholdSet: isThresholdSet,
    isUnavailable: isUnavailable,
    isUseClassification: isUseClassification,
    lookupSourcedRow: lookupSourcedRow,
    marginalRateContributors: marginalRateContributors,
    packContentDigestInput: packContentDigestInput,
    rateTableComponentPaths: rateTableComponentPaths,
    resolveRulePack: resolveRulePack,
    ruleStatusFor: ruleStatusFor,
    sourceForFigure: sourceForFigure,
    sourcedZeroFor: sourcedZeroFor,
    thresholdSetYearRefusal: thresholdSetYearRefusal,
    unavailable: unavailable,
    validateCostRecoveryRule: validateCostRecoveryRule,
    validateDeductionComponent: validateDeductionComponent,
    validateDisposition: validateDisposition,
    validateDispositionDeclaration: validateDispositionDeclaration,
    validateDwellingUseDeclaration: validateDwellingUseDeclaration,
    validateGainComponent: validateGainComponent,
    validateRecaptureRule: validateRecaptureRule,
    validateResidenceExclusionRule: validateResidenceExclusionRule,
    validateItemizedComposition: validateItemizedComposition,
    validateLossLimitation: validateLossLimitation,
    validateRentalActivity: validateRentalActivity,
    validateRulePack: validateRulePack,
    validateBenefitBasis: validateBenefitBasis,
    validateBenefitInclusion: validateBenefitInclusion,
    validateClaimAgeComparison: validateClaimAgeComparison,
    validateLookbackMagi: validateLookbackMagi,
    validateAdjustmentBracket: validateAdjustmentBracket,
    validatePremiumRecord: validatePremiumRecord,
    validateMortalityBasis: validateMortalityBasis,
    validateMortalityPolicy: validateMortalityPolicy,
    validateMortalityTableYearBasis: validateMortalityTableYearBasis,
    validateProvisionalIncome: validateProvisionalIncome,
    validateQuotedInvarianceBasis: validateQuotedInvarianceBasis,
    validateSourcedZero: validateSourcedZero,
    validateUseClassification: validateUseClassification,
    validateUseClassificationRule: validateUseClassificationRule
  });

  root.RLTAXRULES = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
