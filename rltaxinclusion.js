/* Lifetime Tax Strategy Lab — provisional income, the inclusion tier and the included amount.
 *
 * Feature 024 Scope 02. This module owns `composeProvisionalIncome`, `selectInclusionTier`,
 * `computeIncludedBenefit` and `computeInclusionSettlement`.
 *
 * It declares NO base amount, NO tier percentage, NO ceiling proportion, NO agency name and NO
 * publication name. Every such value is read from the resolved federal pack's inclusion policy,
 * so a figure that moves is a pack edit and never a code edit, and a scan over this file finds
 * nothing to transcribe.
 *
 * Provisional income is COMPOSED from the parts the source names. It is never read from the
 * settlement's modified adjusted gross measure and never from adjusted gross income, and the
 * contract refuses a composition that read either — by inspecting which measure each part came
 * from rather than by comparing totals, because a total comparison cannot tell a copied measure
 * from a coincidence.
 *
 * It performs no storage access, no DOM access and no network access, and it reads no clock, so
 * the same input always produces the same result.
 *
 * UMD dual module: attaches to the global AND sets module.exports. Never ESM.
 */
(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});

  var rules = root.RLTAXRULES;
  if (!rules && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    rules = require("./rltaxrules");
  }
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXINCLUSION");

  var POLICY_CONTRACT = "BenefitInclusionPolicy/v1";
  var SETTLEMENT_CONTRACT = "InclusionSettlement/v1";
  var PROVISIONAL_CONTRACT = rules.PROVISIONAL_INCOME_CONTRACT;
  var INCLUSION_CONTRACT = rules.BENEFIT_INCLUSION_CONTRACT;

  /* The two tier rules the source states. The second exists because the publication instructs a
     reader in one filing situation to SKIP the tier arithmetic entirely and take the ceiling
     proportion of provisional income, which is a different rule rather than the same rule with a
     zero base amount. Collapsing the two would produce a plausible wrong figure. */
  var TIER_RULES = Object.freeze(["two-tier-base-and-increment", "ceiling-proportion-of-provisional-income"]);

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  function isFiniteNonNegative(candidate) {
    return Number.isFinite(candidate) && candidate >= 0;
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

  function declaredYearOf(pack) {
    if (!isPlainObject(pack)) return undefined;
    if (Array.isArray(pack.effectiveTaxYears) && pack.effectiveTaxYears.length > 0) {
      return pack.effectiveTaxYears[0];
    }
    return undefined;
  }

  /* The edition year a source record states about ITSELF. A publication whose title block names
     the returns it is for has dated itself; one that names nothing has not, and the two are told
     apart here rather than by assuming an undated page is timeless. */
  function editionYearOf(record) {
    if (!isPlainObject(record)) return undefined;
    if (Number.isFinite(record.editionYear)) return record.editionYear;
    return undefined;
  }

  /* The whole of FR-024-012 at the point of use. A figure is usable only when it cites a
     retrieved record with a locator AND, where the edition it came from is not the declared year,
     carries an invariance basis that survives the tightened validation. A retrieval that
     succeeded and a basis that did not is a REFUSAL on a figure the implementer is holding, and
     the refusal names the missing basis rather than the missing figure. */
  function resolveSourcedFigure(pack, figure, domain) {
    if (rules.isAbsentFigure(figure)) return rules.absentFigureRefusal(figure, domain);
    if (!isPlainObject(figure)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the inclusion policy carries no retrieved value for this figure",
        "retrieve the figure from its primary source and transcribe it with a locator and a retrievedAt; no value is derived, interpolated or recalled in its place");
    }
    if (!Number.isFinite(figure.value)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the inclusion policy figure carries no finite value",
        "transcribe the value from the retrieved page, or ship the member as an AbsentFigure and let this leg refuse");
    }
    if (!isNonEmptyString(figure.sourceRef)) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced figure carries no sourceRef",
        "add a sourceRef naming a record in sourceRecords[]");
    }
    if (!isNonEmptyString(figure.locator)) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced figure carries no locator naming the section it was transcribed from",
        "add a locator naming the section, table, worksheet line or column");
    }
    var record = findSourceRecord(pack, figure.sourceRef);
    if (record === null) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourceRef names no record in sourceRecords[]",
        "add a SourceRecord whose sourceId equals " + figure.sourceRef);
    }
    if (record.retrievalOutcome !== "retrieved") {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the figure cites a source that was not retrieved",
        "retrieve the source, or ship the figure as an AbsentFigure and let this leg refuse");
    }
    var declaredYear = declaredYearOf(pack);
    var edition = editionYearOf(record);
    var sameYear = Number.isFinite(declaredYear) && Number.isFinite(edition) && edition === declaredYear;
    if (!sameYear) {
      var verdict = rules.validateQuotedInvarianceBasis(figure.yearInvarianceBasis, domain);
      if (verdict.ok !== true) return verdict.refusals[0];
    }
    return Object.freeze({
      value: figure.value,
      sourceRef: figure.sourceRef,
      locator: figure.locator,
      editionYear: Number.isFinite(edition) ? edition : null,
      declaredYear: Number.isFinite(declaredYear) ? declaredYear : null,
      carriedAcrossEditions: !sameYear,
      yearInvarianceBasis: isPlainObject(figure.yearInvarianceBasis) ? figure.yearInvarianceBasis : null,
      citation: Object.freeze({
        origin: "sourced",
        title: record.title,
        url: record.url,
        retrievedAt: record.retrievedAt,
        locator: figure.locator,
        sourceRef: figure.sourceRef
      })
    });
  }

  function resolveInclusionPolicy(pack) {
    if (!isPlainObject(pack) || !isPlainObject(pack.benefitInclusionPolicy)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "benefit-inclusion:policy",
        "the resolved federal pack declares no benefit inclusion policy",
        "author a pack carrying the inclusion policy transcribed from its primary source");
    }
    var policy = pack.benefitInclusionPolicy;
    if (policy.contractVersion !== POLICY_CONTRACT) {
      return rules.unavailable("RLTAX-PACK-INVALID", "benefit-inclusion:policy",
        "the inclusion policy does not declare " + POLICY_CONTRACT,
        "set contractVersion to " + POLICY_CONTRACT);
    }
    return policy;
  }

  /* Which parameter row the filing status resolves to. Most statuses resolve to themselves. A
     status the source splits on a household fact resolves only once that fact is declared, and an
     undeclared fact is an INPUT refusal rather than a threshold refusal, because the pack has the
     figure and the household has not said which one applies. */
  function resolveStatusKey(policy, filingStatus, declaration) {
    var domain = "benefit-inclusion:status:" + String(filingStatus);
    if (!isNonEmptyString(filingStatus)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-inclusion:status",
        "no filing status is declared, so no base amount can be selected",
        "declare the filing status");
    }
    var conditional = isPlainObject(policy.conditionalStatuses)
      ? policy.conditionalStatuses[filingStatus] : undefined;
    if (!isPlainObject(conditional)) return filingStatus;
    var member = conditional.declarationMember;
    var declared = isPlainObject(declaration) ? declaration[member] : undefined;
    var options = isPlainObject(conditional.options) ? conditional.options : {};
    var optionNames = Object.keys(options);
    if (!isNonEmptyString(declared) || optionNames.indexOf(declared) < 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "this filing status carries more than one base amount and the household has not declared which situation applies, so neither is selected",
        "declare " + String(member) + " as one of: " + optionNames.join(", ")
          + "; neither situation is defaulted and no amount is chosen on the household's behalf");
    }
    return options[declared];
  }

  function resolveTierParameters(policy, statusKey) {
    var domain = "benefit-inclusion:tier-parameters:" + String(statusKey);
    var table = isPlainObject(policy.tierParameters) ? policy.tierParameters[statusKey] : undefined;
    if (!isPlainObject(table)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the inclusion policy carries no tier parameters for this filing situation",
        "transcribe the base amount and the tier arithmetic this filing situation is given by the primary source");
    }
    if (TIER_RULES.indexOf(table.tierRule) < 0) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the tier parameters name no tier rule the engine implements",
        "set tierRule to one of: " + TIER_RULES.join(", "));
    }
    return table;
  }

  /* FR-024-008. Provisional income is the sum of the parts the composition rule names, each
     published with its amount and where it came from. The benefit part is a proportion OF the
     settled benefit; every other part is the household's own declaration. Nothing here reads a
     settlement measure, which is what the contract's construction check then proves. */
  function composeProvisionalIncome(declaration, benefitAmount, policy, pack) {
    var domain = "benefit-inclusion:provisional-income";
    if (!isPlainObject(declaration)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no household declaration was supplied, so provisional income has no parts to compose",
        "declare the income parts the composition names");
    }
    var rule = isPlainObject(policy) ? policy.compositionRule : undefined;
    if (!isPlainObject(rule) || !Array.isArray(rule.parts) || rule.parts.length === 0) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the inclusion policy carries no composition rule, so what provisional income is made of was never retrieved",
        "transcribe the composition rule and every part it names from the primary source");
    }
    var parts = [];
    var total = 0;
    var index = 0;
    for (index = 0; index < rule.parts.length; index += 1) {
      var declaredPart = rule.parts[index];
      var partDomain = domain + ":" + String(declaredPart && declaredPart.partId);
      var amount = null;
      if (declaredPart.origin === "proportion-of-the-settled-benefit") {
        if (!isFiniteNonNegative(benefitAmount)) {
          return rules.unavailable("RLTAX-INPUT-INCOMPLETE", partDomain,
            "the benefit this part is a proportion of has not settled, so the part cannot be composed",
            "settle the benefit first; no proportion of an unsettled benefit is used");
        }
        var proportion = resolveSourcedFigure(pack, declaredPart.proportion, partDomain);
        if (rules.isUnavailable(proportion)) return proportion;
        amount = proportion.value * benefitAmount;
      } else {
        var member = declaredPart.declarationMember;
        var value = declaration[member];
        if (!isFiniteNonNegative(value)) {
          return rules.unavailable("RLTAX-INPUT-INCOMPLETE", partDomain,
            "the household has not declared " + String(member) + ", which the composition names as a part",
            "declare " + String(member) + " as a finite amount at or above zero; it is not defaulted to nothing");
        }
        amount = value;
      }
      total += amount;
      parts.push(Object.freeze({
        partId: declaredPart.partId,
        label: declaredPart.label,
        amount: amount,
        origin: declaredPart.origin,
        /* Null is the load-bearing value: this part was composed rather than read off another
           measure. A part naming one of the distinctFrom measures here is refused by the
           contract whatever the totals come to. */
        readFromMeasureId: null
      }));
    }
    var record = Object.freeze({
      contractVersion: PROVISIONAL_CONTRACT,
      measureId: rules.PROVISIONAL_INCOME_MEASURE_ID,
      parts: Object.freeze(parts),
      total: total,
      distinctFrom: Object.freeze((policy.distinctFrom || []).slice()),
      sourceRef: rule.sourceRef,
      locator: rule.locator
    });
    var verdict = rules.validateProvisionalIncome(record);
    if (verdict.ok !== true) return verdict.refusals[0];
    return record;
  }

  function applyOperator(operator, left, right) {
    if (operator === ">") return left > right;
    if (operator === ">=") return left >= right;
    return null;
  }

  /* FR-024-010. The tier is a RETURNED RECORD carrying every comparison it performed, not a
     branch a reader has to infer. The operator comes from the pack, so an implementation that
     treated an inclusive boundary as strict is a pack disagreement an assertion can catch at the
     exact figure rather than a code path nobody can see. */
  function selectInclusionTier(provisionalIncome, parameters, policy, pack) {
    var domain = "benefit-inclusion:tier";
    if (!rules.isProvisionalIncome(provisionalIncome)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no provisional income record was supplied, so no tier can be selected",
        "compose provisional income first");
    }
    var operatorFigure = isPlainObject(policy) ? policy.boundaryOperator : undefined;
    var operator = isPlainObject(operatorFigure) ? operatorFigure.value : undefined;
    if (applyOperator(operator, 0, 0) === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the inclusion policy states no boundary operator, so whether the comparison is strict was never retrieved",
        "transcribe the boundary operator the primary source states; it is never assumed");
    }
    var comparisons = [];
    var baseAmounts = [];

    if (parameters.tierRule === "ceiling-proportion-of-provisional-income") {
      /* This rule skips the tier arithmetic, but the source still STATES a base amount for the
         situation and the reader is owed it: the figure compared against is published, with its
         citation, beside the rule that made the comparison stop mattering. */
      var statedBase = resolveSourcedFigure(pack, parameters.baseAmount, domain + ":base-amount");
      if (rules.isUnavailable(statedBase)) return statedBase;
      baseAmounts.push(Object.freeze({
        baseAmountId: "first-base-amount", amount: statedBase.value,
        sourceRef: statedBase.sourceRef, locator: statedBase.locator,
        editionYear: statedBase.editionYear, carriedAcrossEditions: statedBase.carriedAcrossEditions,
        yearInvarianceBasis: statedBase.yearInvarianceBasis
      }));
      comparisons.push(rules.comparisonRecord("provisional-income-against-first-base-amount",
        provisionalIncome.total, operator, statedBase.value,
        applyOperator(operator, provisionalIncome.total, statedBase.value)));
      return Object.freeze({
        tier: "ceiling-proportion-of-provisional-income",
        tierRule: parameters.tierRule,
        comparisons: Object.freeze(comparisons),
        baseAmounts: Object.freeze(baseAmounts),
        aboveFirstBase: provisionalIncome.total - statedBase.value,
        aboveSecondBase: 0,
        firstBase: statedBase.value,
        secondBase: null,
        increment: null
      });
    }

    var firstBase = resolveSourcedFigure(pack, parameters.baseAmount, domain + ":base-amount");
    if (rules.isUnavailable(firstBase)) return firstBase;
    baseAmounts.push(Object.freeze({
      baseAmountId: "first-base-amount", amount: firstBase.value,
      sourceRef: firstBase.sourceRef, locator: firstBase.locator,
      editionYear: firstBase.editionYear, carriedAcrossEditions: firstBase.carriedAcrossEditions,
      yearInvarianceBasis: firstBase.yearInvarianceBasis
    }));

    var aboveFirst = applyOperator(operator, provisionalIncome.total, firstBase.value);
    comparisons.push(rules.comparisonRecord("provisional-income-against-first-base-amount",
      provisionalIncome.total, operator, firstBase.value, aboveFirst));

    if (!aboveFirst) {
      return Object.freeze({
        tier: "none-included",
        tierRule: parameters.tierRule,
        comparisons: Object.freeze(comparisons),
        baseAmounts: Object.freeze(baseAmounts),
        aboveFirstBase: 0,
        aboveSecondBase: 0,
        firstBase: firstBase.value,
        secondBase: null,
        increment: null
      });
    }

    var increment = resolveSourcedFigure(pack, parameters.secondTierIncrement, domain + ":second-tier-increment");
    if (rules.isUnavailable(increment)) return increment;
    var secondBase = resolveSourcedFigure(pack, parameters.secondBaseAmount, domain + ":second-base-amount");
    if (rules.isUnavailable(secondBase)) return secondBase;
    baseAmounts.push(Object.freeze({
      baseAmountId: "second-base-amount", amount: secondBase.value,
      sourceRef: secondBase.sourceRef, locator: secondBase.locator,
      editionYear: secondBase.editionYear, carriedAcrossEditions: secondBase.carriedAcrossEditions,
      yearInvarianceBasis: secondBase.yearInvarianceBasis
    }));

    /* The publication states the second base amount in one place and the increment above the
       first base in another. Both are transcribed independently and their agreement is PUBLISHED
       as a comparison rather than one being derived from the other, so a transcription error in
       either is visible instead of being absorbed. */
    comparisons.push(rules.comparisonRecord("first-base-plus-increment-equals-second-base",
      firstBase.value + increment.value, "==", secondBase.value,
      Math.abs((firstBase.value + increment.value) - secondBase.value) < 0.005));

    var overFirst = provisionalIncome.total - firstBase.value;
    var overSecond = Math.max(0, overFirst - increment.value);
    var aboveSecond = applyOperator(operator, provisionalIncome.total, secondBase.value);
    comparisons.push(rules.comparisonRecord("provisional-income-against-second-base-amount",
      provisionalIncome.total, operator, secondBase.value, aboveSecond));

    return Object.freeze({
      tier: overSecond > 0 ? "second-tier" : "first-tier",
      tierRule: parameters.tierRule,
      comparisons: Object.freeze(comparisons),
      baseAmounts: Object.freeze(baseAmounts),
      aboveFirstBase: overFirst,
      aboveSecondBase: overSecond,
      firstBase: firstBase.value,
      secondBase: secondBase.value,
      increment: increment.value
    });
  }

  /* FR-024-011. The included amount is the tier's own arithmetic, bounded by the sourced ceiling
     proportion of the benefit, and the record STATES whether the ceiling bound the result. A
     ceiling that never binds and a ceiling that bound are different facts about a settlement and
     only one of them explains the figure. */
  function computeIncludedBenefit(provisionalIncome, tierRecord, benefitAmount, policy, pack) {
    var domain = "benefit-inclusion:included-amount";
    if (!isFiniteNonNegative(benefitAmount)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "the benefit has not settled, so no proportion of it can be included",
        "settle the benefit first");
    }
    var ceiling = resolveSourcedFigure(pack, policy.ceilingProportion, domain + ":ceiling-proportion");
    if (rules.isUnavailable(ceiling)) return ceiling;
    var ceilingAmount = ceiling.value * benefitAmount;

    if (tierRecord.tier === "none-included") {
      return Object.freeze({
        includedAmount: 0,
        ceilingProportion: ceiling.value,
        ceilingAmount: ceilingAmount,
        ceilingBound: false,
        beforeCeiling: 0,
        components: Object.freeze([])
      });
    }

    var secondProportion = resolveSourcedFigure(pack, policy.secondTierProportion, domain + ":second-tier-proportion");
    if (rules.isUnavailable(secondProportion)) return secondProportion;

    var beforeCeiling = null;
    var components = [];

    if (tierRecord.tier === "ceiling-proportion-of-provisional-income") {
      beforeCeiling = secondProportion.value * provisionalIncome.total;
      components.push(Object.freeze({
        componentId: "proportion-of-provisional-income",
        amount: beforeCeiling, proportion: secondProportion.value
      }));
    } else {
      var firstProportion = resolveSourcedFigure(pack, policy.firstTierProportion, domain + ":first-tier-proportion");
      if (rules.isUnavailable(firstProportion)) return firstProportion;
      var benefitProportionPart = null;
      var partIndex = 0;
      for (partIndex = 0; partIndex < provisionalIncome.parts.length; partIndex += 1) {
        if (provisionalIncome.parts[partIndex].origin === "proportion-of-the-settled-benefit") {
          benefitProportionPart = provisionalIncome.parts[partIndex].amount;
        }
      }
      if (benefitProportionPart === null) {
        return rules.unavailable("RLTAX-PACK-INVALID", domain,
          "the composition published no benefit-proportion part, and the tier arithmetic is bounded by it",
          "declare the benefit-proportion part in the composition rule");
      }
      var withinBand = Math.min(tierRecord.aboveFirstBase, tierRecord.increment);
      var firstTierAmount = firstProportion.value * withinBand;
      var cappedByBenefitProportion = Math.min(benefitProportionPart, firstTierAmount);
      var secondTierAmount = secondProportion.value * tierRecord.aboveSecondBase;
      beforeCeiling = cappedByBenefitProportion + secondTierAmount;
      components.push(Object.freeze({
        componentId: "first-tier-amount", amount: cappedByBenefitProportion,
        proportion: firstProportion.value, appliedTo: withinBand,
        boundedByBenefitProportion: firstTierAmount > benefitProportionPart
      }));
      components.push(Object.freeze({
        componentId: "second-tier-amount", amount: secondTierAmount,
        proportion: secondProportion.value, appliedTo: tierRecord.aboveSecondBase
      }));
    }

    var included = Math.min(beforeCeiling, ceilingAmount);
    return Object.freeze({
      includedAmount: included,
      ceilingProportion: ceiling.value,
      ceilingAmount: ceilingAmount,
      ceilingBound: ceilingAmount < beforeCeiling,
      beforeCeiling: beforeCeiling,
      components: Object.freeze(components)
    });
  }

  /* The declared inclusion leg set, read from the pack rather than from a list in this module,
     so a later leg cannot be silently dropped by a hardcoded array nobody updated. */
  function declaredInclusionLegs(pack) {
    var policy = isPlainObject(pack) ? pack.benefitInclusionPolicy : undefined;
    if (!isPlainObject(policy) || !Array.isArray(policy.taxLegs)) return Object.freeze([]);
    return Object.freeze(policy.taxLegs.slice());
  }

  /* The whole settlement. Every refusal reaches the caller as itself: an inclusion whose base
     amount could not be carried has not thereby included nothing. */
  function computeInclusionSettlement(declaration, benefitAmount, pack) {
    var policy = resolveInclusionPolicy(pack);
    if (rules.isUnavailable(policy)) return policy;

    var provisional = composeProvisionalIncome(declaration, benefitAmount, policy, pack);
    if (rules.isUnavailable(provisional)) return provisional;

    var filingStatus = isPlainObject(declaration) ? declaration.filingStatus : undefined;
    var statusKey = resolveStatusKey(policy, filingStatus, declaration);
    if (rules.isUnavailable(statusKey)) return statusKey;

    var parameters = resolveTierParameters(policy, statusKey);
    if (rules.isUnavailable(parameters)) return parameters;

    var tierRecord = selectInclusionTier(provisional, parameters, policy, pack);
    if (rules.isUnavailable(tierRecord)) return tierRecord;

    var included = computeIncludedBenefit(provisional, tierRecord, benefitAmount, policy, pack);
    if (rules.isUnavailable(included)) return included;

    var inclusion = Object.freeze({
      contractVersion: INCLUSION_CONTRACT,
      provisionalIncome: provisional,
      baseAmounts: tierRecord.baseAmounts,
      tier: tierRecord.tier,
      comparisonsPerformed: tierRecord.comparisons,
      includedAmount: included.includedAmount,
      ceilingProportion: included.ceilingProportion,
      ceilingBound: included.ceilingBound,
      sourceRecords: Object.freeze(tierRecord.baseAmounts.map(function (entry) {
        return entry.sourceRef;
      })),
      ruleStatus: rules.ruleStatusFor(pack, pack)
    });
    var verdict = rules.validateBenefitInclusion(inclusion);
    if (verdict.ok !== true) return verdict.refusals[0];

    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      value: included.includedAmount,
      statusKey: statusKey,
      tierRule: tierRecord.tierRule,
      inclusion: inclusion,
      includedComponents: included.components,
      ceilingAmount: included.ceilingAmount,
      amountBeforeCeiling: included.beforeCeiling,
      ruleStatus: rules.ruleStatusFor(pack, pack)
    });
  }

  /* What a marginal reader is owed when the inclusion refuses: the domain and the reason, never
     a zero standing in for an unavailable figure. */
  function inclusionMarginalContext(settlement) {
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        available: false,
        domain: settlement.domain,
        code: settlement.code,
        reason: settlement.reason
      });
    }
    return Object.freeze({
      available: true,
      tier: settlement.inclusion.tier,
      includedAmount: settlement.value,
      ceilingBound: settlement.inclusion.ceilingBound,
      provisionalIncome: settlement.inclusion.provisionalIncome.total
    });
  }

  var api = Object.freeze({
    POLICY_CONTRACT: POLICY_CONTRACT,
    SETTLEMENT_CONTRACT: SETTLEMENT_CONTRACT,
    TIER_RULES: TIER_RULES,
    composeProvisionalIncome: composeProvisionalIncome,
    computeIncludedBenefit: computeIncludedBenefit,
    computeInclusionSettlement: computeInclusionSettlement,
    declaredInclusionLegs: declaredInclusionLegs,
    inclusionMarginalContext: inclusionMarginalContext,
    resolveInclusionPolicy: resolveInclusionPolicy,
    resolveSourcedFigure: resolveSourcedFigure,
    resolveStatusKey: resolveStatusKey,
    resolveTierParameters: resolveTierParameters,
    selectInclusionTier: selectInclusionTier
  });

  root.RLTAXINCLUSION = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
