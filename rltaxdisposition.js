/* Lifetime Tax Strategy Lab — the disposition, the gain split and the residence exclusion.
 *
 * Feature 023 Scope 05. This module owns `computeDisposition` and `applyResidenceExclusion`.
 *
 * It declares NO rate, NO exclusion amount and NO period figure. Every one is read from the
 * resolved pack, and there is no branch that supplies one when the pack does not: an unretrieved
 * figure produces a refusal and NO number. That is structural rather than disciplined — the
 * module holds no figure to fall back on.
 *
 * It also contains NO STACKING ARITHMETIC. The part of a gain that is priced under the ordinary
 * long-term rules is handed WHOLE to the Feature 022 preferential model through the caller, and
 * this module only says which component that is. A scan asserts the absence, and the scan is
 * proven to fire on a module that duplicates the stacking, so the two implementations cannot
 * drift apart into two different answers for one household.
 *
 * The one thing most tools get wrong is the thing this module makes structural: a gain that
 * followed depreciation is NOT one number priced one way. The part attributable to cost recovery
 * already taken is priced at a maximum rate the authority states FOR THAT CATEGORY, and only the
 * remainder stacks. Each component therefore carries an explicit `pricingRule` drawn from a
 * closed set, and a component carrying neither member is refused rather than defaulted — because
 * a default would have to pick one of the two rules and would silently misprice the other.
 *
 * The residence exclusion applies to the REMAINDER ONLY. Applying it to the recapture component
 * would exclude gain the authority states is not excludable, and an adversarial case proves the
 * assertion that forbids it can fail.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXDISPOSITION");

  var DISPOSITION_CONTRACT = rules.DISPOSITION_CONTRACT;
  var GAIN_COMPONENT_CONTRACT = rules.GAIN_COMPONENT_CONTRACT;
  var EXCLUSION_CONTRACT = "ResidenceExclusionOutcome/v1";
  var MARGINAL_CONTEXT_CONTRACT = "DispositionMarginalContext/v1";

  /* The two component ids. They are semantic rather than positional for the same reason every
     leg id in this feature is: a reader who sees `disposition-remainder` knows which rule priced
     it, and a consumer that matched on an index would silently follow a reordering. */
  var RECAPTURE_COMPONENT_ID = "disposition-recapture";
  var REMAINDER_COMPONENT_ID = "disposition-remainder";

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  /* The realised gain or loss, and the two things that make a LOSS different from a small gain.
     A loss is not a negative gain that can be split: there is nothing to allocate to a recapture
     category, and whether it is deductible at all depends on how the property was used. Both
     facts are published rather than folded into a number, because a household that sold at a
     loss and is shown a zero learns nothing about which of the two situations it is in. */
  function realizedResult(declaration) {
    var gain = declaration.proceeds - declaration.adjustedBasis;
    var isLoss = gain < 0;
    return Object.freeze({
      realizedGain: gain,
      isLoss: isLoss,
      /* A loss on a home the household lived in and a loss on property held to produce income are
         settled by different rules, and this record makes which one applies explicit rather than
         reporting one figure that would be wrong for whichever case it was not written for. The
         rules themselves are named in the pack, never here. */
      lossTreatment: !isLoss ? null : (declaration.propertyUse === "principal-residence"
        ? "not-deductible-personal-use"
        : "deductible-under-the-business-property-rules-which-this-slice-does-not-settle")
    });
  }

  /* FR-023-029 and FR-023-030. The split.
     The recapture component is bounded by BOTH the cost recovery actually taken and the total
     gain. The second bound is the one that is easy to omit and easy to get wrong: a property
     depreciated by more than it ultimately gained cannot have a recapture component larger than
     the gain, or the components would sum to more than the gain they are supposed to account
     for. The over-depreciated fixture exists to hold that bound in place.
     The remainder is the BALANCE rather than a second computation, so the two cannot fail to
     sum. */
  function splitGain(gain, accumulatedCostRecovery, recaptureRule) {
    var recaptureAmount = Math.max(0, Math.min(accumulatedCostRecovery, gain));
    var remainderAmount = gain - recaptureAmount;
    return Object.freeze({
      recaptureAmount: recaptureAmount,
      remainderAmount: remainderAmount,
      boundBy: recaptureAmount === gain && accumulatedCostRecovery > gain
        ? "the total gain"
        : "the cost recovery taken",
      categoryId: recaptureRule.categoryId
    });
  }

  /* A component record. The `pricingRule` is set HERE, at construction, so a component can never
     exist without one — which is what makes the contract's refusal of a missing rule reachable
     only by a caller that built a record this module did not. */
  function gainComponent(componentId, label, amount, pricingRule, rule) {
    var component = {
      contractVersion: GAIN_COMPONENT_CONTRACT,
      componentId: componentId,
      label: label,
      amount: amount,
      pricingRule: pricingRule
    };
    if (pricingRule === "own-maximum-rate") {
      component.maximumRate = rule.maximumRate;
      component.citation = Object.freeze({ sourceRef: rule.sourceRef, locator: rule.locator });
      /* The tax on this component is the sourced rate applied to its amount, and it is stated
         here rather than left to a consumer. A consumer that had to multiply would be a second
         place the rate lives. */
      component.tax = amount * rule.maximumRate;
    } else {
      /* Deliberately no `tax`. The remainder's tax is whatever the existing preferential model
         produces for this amount at this household's stacking position, and publishing a figure
         here would be a second implementation of that model. */
      component.handOffTarget = "the settlement's existing preferential stacking";
    }
    return Object.freeze(component);
  }

  /* FR-023-029 through FR-023-031. The settled disposition.
     The recapture rate is resolved FIRST and its refusal is returned whole. There is deliberately
     no branch that, on an unresolved rate, prices the entire gain under the preferential model:
     that fallback would turn a sourcing failure into a confident under-statement of the tax,
     which is the one direction this tool must never err in. */
  function computeDisposition(declaration, pack) {
    var shape = rules.validateDispositionDeclaration(declaration);
    if (!shape.ok) return shape.refusals[0];
    if (!isPlainObject(pack)) {
      return rules.unavailable("RLTAX-PACK-INVALID", "disposition",
        "no resolved rule pack was supplied, so no disposition rule could be read",
        "resolve a rule pack for the declared year before settling a disposition");
    }
    var result = realizedResult(declaration);
    var status = rules.ruleStatusFor(pack, pack);
    if (result.isLoss) {
      /* A loss has no components to price. It is published whole, with its treatment named, and
         it carries no exclusion: the exclusion is a rule about gain. */
      return Object.freeze({
        contractVersion: DISPOSITION_CONTRACT,
        realizedGain: result.realizedGain,
        isLoss: true,
        lossTreatment: result.lossTreatment,
        propertyUse: declaration.propertyUse,
        components: Object.freeze([]),
        declaredProceeds: declaration.proceeds,
        declaredAdjustedBasis: declaration.adjustedBasis,
        declaredAccumulatedCostRecovery: declaration.accumulatedCostRecovery,
        ruleStatus: status
      });
    }
    var recaptureRule = rules.validateRecaptureRule(pack, declaration.declaredTaxYear);
    if (rules.isUnavailable(recaptureRule)) return recaptureRule;
    var split = splitGain(result.realizedGain, declaration.accumulatedCostRecovery, recaptureRule);
    var components = [
      gainComponent(RECAPTURE_COMPONENT_ID, recaptureRule.label || recaptureRule.categoryId,
        split.recaptureAmount, "own-maximum-rate", recaptureRule),
      gainComponent(REMAINDER_COMPONENT_ID, "The remaining long-term gain",
        split.remainderAmount, "preferential-stacking", recaptureRule)
    ];
    var disposition = Object.freeze({
      contractVersion: DISPOSITION_CONTRACT,
      realizedGain: result.realizedGain,
      isLoss: false,
      lossTreatment: null,
      propertyUse: declaration.propertyUse,
      components: Object.freeze(components),
      recaptureBoundBy: split.boundBy,
      recaptureCategoryId: split.categoryId,
      declaredProceeds: declaration.proceeds,
      declaredAdjustedBasis: declaration.adjustedBasis,
      declaredAccumulatedCostRecovery: declaration.accumulatedCostRecovery,
      ruleStatus: status
    });
    var settled = rules.validateDisposition(disposition);
    if (!settled.ok) return settled.refusals[0];
    return disposition;
  }

  /* One eligibility test, evaluated on its own and publishing the comparison it performed. The
     operator is read from the pack rather than chosen here, for the same reason the dwelling-use
     comparisons are: a boundary assertion can then pin the exact sourced figure without knowing
     which branch ran, and the inclusivity is the authority's rather than this engine's. */
  function evaluateTest(testId, declaredMonths, figure) {
    var required = figure.minimumMonths;
    var passed = figure.comparisonOperator === "greater-than"
      ? declaredMonths > required
      : declaredMonths >= required;
    return Object.freeze({
      testId: testId,
      declaredMonths: declaredMonths,
      requiredMonths: required,
      lookbackYears: figure.lookbackYears,
      operator: figure.comparisonOperator,
      passed: passed,
      citation: Object.freeze({ sourceRef: figure.sourceRef, locator: figure.locator })
    });
  }

  /* FR-023-033 and FR-023-034. The exclusion.
     The two tests are evaluated SEPARATELY and both outcomes are published whether or not either
     failed, so a household that failed one is told which one and still sees that the other
     passed. A single combined condition could not name anything, and an adversarial case proves
     that an implementation written that way fails this record's own assertions.
     The exclusion is applied to the REMAINDER component only. The recapture component is passed
     through untouched, which is the interaction this scope exists to get right. */
  function applyResidenceExclusion(disposition, declaration, pack, filingStatus) {
    if (rules.isUnavailable(disposition)) return disposition;
    if (!rules.isDisposition(disposition)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "disposition:residenceExclusion",
        "no settled disposition was supplied, so there is no gain to apply an exclusion to",
        "settle the disposition before applying the exclusion");
    }
    if (disposition.isLoss === true) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "disposition:residenceExclusion",
        "the disposition realised a loss, and the exclusion is a rule about gain",
        "no action is required: a loss is published with its own treatment rather than excluded");
    }
    var rule = rules.validateResidenceExclusionRule(pack, declaration.declaredTaxYear, filingStatus);
    if (rules.isUnavailable(rule)) return rule;
    var ownership = evaluateTest("ownership", declaration.ownershipMonths, rule.ownershipTest);
    var use = evaluateTest("use", declaration.useMonths, rule.useTest);
    var failed = [];
    if (!ownership.passed) failed.push(ownership.testId);
    if (!use.passed) failed.push(use.testId);
    var eligible = failed.length === 0;

    var remainder = null;
    var recapture = null;
    var index = 0;
    for (index = 0; index < disposition.components.length; index += 1) {
      if (disposition.components[index].pricingRule === "preferential-stacking") {
        remainder = disposition.components[index];
      } else {
        recapture = disposition.components[index];
      }
    }
    var excludable = remainder === null ? 0 : remainder.amount;
    /* Bounded by the remainder rather than by the gain. An exclusion larger than the amount it
       may be applied to would spill onto the recapture component, which is exactly the error
       this bound exists to make impossible. */
    var excluded = eligible ? Math.min(rule.maximumAmount, excludable) : 0;
    return Object.freeze({
      contractVersion: EXCLUSION_CONTRACT,
      eligible: eligible,
      tests: Object.freeze([ownership, use]),
      failedTests: Object.freeze(failed),
      /* Named rather than implied. A household reading "no exclusion" needs to know which test
         it missed, and by how much, to know what would have to be different for the answer to
         change. */
      reason: eligible
        ? "both eligibility tests passed against the period figures the publication states"
        : "no exclusion was applied because the " + failed.join(" and the ") + " test did not pass",
      maximumAmount: rule.maximumAmount,
      amountCitation: rule.amountCitation,
      appliedToComponentId: remainder === null ? null : remainder.componentId,
      excludedAmount: excluded,
      /* The recapture component is republished at its ORIGINAL amount. Stating it here, rather
         than leaving it out because nothing happened to it, is what lets an assertion check that
         nothing happened to it. */
      recaptureComponentId: recapture === null ? null : recapture.componentId,
      recaptureAmountAfterExclusion: recapture === null ? null : recapture.amount,
      remainderAmountAfterExclusion: remainder === null ? null : remainder.amount - excluded,
      ruleStatus: disposition.ruleStatus
    });
  }

  /* What the marginal curve does with this leg, in the leg's own words. A disposition is settled
     from declared figures and does not move with the income the curve resamples, so it is
     carried at its settled value rather than recomputed at each sampled point — and saying so is
     what keeps a reader from expecting the curve to price a sale it never resampled. */
  function dispositionMarginalContext(settlement) {
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        contractVersion: MARGINAL_CONTEXT_CONTRACT,
        carriedInCurve: false,
        reason: "this leg refused, so the curve carries no disposition figure and states none in its place"
      });
    }
    return Object.freeze({
      contractVersion: MARGINAL_CONTEXT_CONTRACT,
      carriedInCurve: false,
      reason: "this leg settles from declared proceeds and a declared basis, so it is held at its settled value while the curve resamples income rather than being recomputed at each sampled point"
    });
  }

  var api = Object.freeze({
    RECAPTURE_COMPONENT_ID: RECAPTURE_COMPONENT_ID,
    REMAINDER_COMPONENT_ID: REMAINDER_COMPONENT_ID,
    applyResidenceExclusion: applyResidenceExclusion,
    computeDisposition: computeDisposition,
    dispositionMarginalContext: dispositionMarginalContext
  });

  root.RLTAXDISPOSITION = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
