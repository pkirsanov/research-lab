/* Lifetime Tax Strategy Lab — long-term rental settlement, cost recovery and the loss limits.
 *
 * Feature 023 Scope 03. This module owns `computeRentalSettlement`, `computeCostRecovery`,
 * `applyAtRiskLimit`, `applyPassiveActivityLimit` and `specialAllowanceFor`.
 *
 * It declares NO recovery period, NO convention, NO allowance amount, NO phase-out edge and NO
 * authority name. Every one of those is read from the resolved pack, and there is no branch
 * that supplies one when the pack does not: an unretrieved parameter produces a refusal, never
 * a plausible number. That is the whole of FR-023-016's protection, and it is structural — the
 * module cannot depreciate over a period it remembers, because it holds no period to remember.
 *
 * The ordering of the two limits is likewise NOT a property of the order this file calls two
 * functions in. Each limit carries the integer `appliedOrder` its pack rule declares, and
 * `computeRentalSettlement` asserts the applied orders are strictly increasing. Reversing the
 * calls therefore fails an assertion rather than silently producing a different allowed amount.
 *
 * Single-year by construction. The opening suspended loss is a household DECLARATION about a
 * year this model never computed, and the closing figure is published for the declared year
 * only. No member of any record this module returns names a year other than the declared one.
 *
 * It performs no storage access, no DOM access and no network access, and it reads no clock,
 * so the same input always produces the same result.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXRENTAL");

  /* Feature 023 Scope 04. The classification and the allocation are the use module's, consumed
     here rather than re-derived: a settlement that re-ran the test could reach a category the
     published record does not carry, and then two surfaces would disagree about the same
     dwelling. This module reads the published record and never recomputes it. */
  var use = root.RLTAXUSE;
  if (!use && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    use = require("./rltaxuse");
  }
  if (!use) throw new Error("RLTAXUSE must be loaded before RLTAXRENTAL");

  var ACTIVITY_CONTRACT = rules.RENTAL_ACTIVITY_CONTRACT;
  var LIMITATION_CONTRACT = rules.LOSS_LIMITATION_CONTRACT;
  var RECOVERY_CONTRACT = "CostRecoveryResult/v1";
  var SETTLEMENT_CONTRACT = "RentalSettlement/v1";
  var ALLOWANCE_CONTRACT = "SpecialAllowanceResult/v1";

  var MONTHS_IN_YEAR = 12;

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  /* A missing household declaration names the member, never the rule. The two refusal families
     are distinguished by code AND by domain prefix, so a copy edit to either message cannot
     collapse them into one another. */
  function undeclaredMember(member) {
    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "rental-activity:" + member,
      "the household has not declared " + member + ", which the rental settlement requires",
      "declare " + member + "; no typical value, average or estimate is substituted");
  }

  /* The citation actually governing one sourced pack figure, resolved against the pack's own
     source records so a locator can never point at a record that is not there. */
  function citationFor(pack, figure, domain) {
    if (!isPlainObject(figure) || !isNonEmptyString(figure.sourceRef) || !isNonEmptyString(figure.locator)) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced figure carries no sourceRef and locator naming the section it was transcribed from",
        "add a sourceRef naming a record in sourceRecords[] and a locator naming the section");
    }
    var records = Array.isArray(pack.sourceRecords) ? pack.sourceRecords : [];
    var index = 0;
    for (index = 0; index < records.length; index += 1) {
      if (records[index] && records[index].sourceId === figure.sourceRef) {
        return Object.freeze({
          origin: "sourced",
          title: records[index].title,
          url: records[index].url,
          retrievedAt: records[index].retrievedAt,
          locator: figure.locator,
          sourceRef: figure.sourceRef
        });
      }
    }
    return rules.unavailable("RLTAX-PACK-INVALID", domain,
      "the sourceRef names no record in sourceRecords[]",
      "add a SourceRecord whose sourceId equals " + figure.sourceRef);
  }

  /* A declared figure carries no citation and says so, so a reader can never mistake the
     household's own input for an authority's. */
  function declaredOrigin(member) {
    return Object.freeze({
      origin: "declared",
      member: member,
      label: "the household's own input",
      sourceRef: null,
      locator: null
    });
  }

  /* The first-year fraction the sourced convention prescribes. The convention identifier is a
     pack value and the arithmetic that identifier selects lives here, which is what makes a
     convention the engine has no branch for a refusal rather than a silent mid-month.

     Under a mid-month convention the month of placement counts as half a month, so a property
     placed in service in month m of a twelve-month year is in service for (12 - m + 0.5)
     twelfths of that year. */
  function conventionFraction(conventionId, placedInServiceMonth) {
    if (conventionId === "mid-month") {
      return (MONTHS_IN_YEAR - placedInServiceMonth + 0.5) / MONTHS_IN_YEAR;
    }
    return null;
  }

  /* CostRecovery/v1. The declared basis and month, the sourced period, convention and method,
     and nothing else. A pack whose period or convention is absent refuses HERE, before any
     depreciation figure exists, so no settlement can be produced without cost recovery. */
  function computeCostRecovery(activity, pack) {
    var rule = rules.validateCostRecoveryRule(pack, activity.declaredTaxYear);
    if (rules.isUnavailable(rule)) return rule;

    if (!Number.isFinite(activity.depreciableBasis) || activity.depreciableBasis < 0) {
      return undeclaredMember("depreciableBasis");
    }
    var month = activity.placedInServiceMonth;
    if (!Number.isFinite(month) || Math.floor(month) !== month || month < 1 || month > MONTHS_IN_YEAR) {
      return undeclaredMember("placedInServiceMonth");
    }

    var periodCitation = citationFor(pack, rule.recoveryPeriod, "cost-recovery:recoveryPeriod");
    if (rules.isUnavailable(periodCitation)) return periodCitation;
    var conventionCitation = citationFor(pack, rule.convention, "cost-recovery:convention");
    if (rules.isUnavailable(conventionCitation)) return conventionCitation;
    var methodCitation = citationFor(pack, rule.method, "cost-recovery:method");
    if (rules.isUnavailable(methodCitation)) return methodCitation;

    var period = rule.recoveryPeriod.years;
    var fullYearDeduction = activity.depreciableBasis / period;
    var fraction = conventionFraction(rule.convention.conventionId, month);
    if (fraction === null) {
      return rules.unavailable("RLTAX-FEATURE-UNSUPPORTED", "cost-recovery:convention",
        "the pack names a convention this engine has no arithmetic for, and no other convention is applied in its place",
        "add the convention's arithmetic to the engine together with the identifier the pack declares");
    }

    /* Which year of the recovery period the declared year is. It is an ORDINAL — first year,
       second year — and never a calendar year, so no member of this record can name a year
       other than the declared one. That is what keeps FR-023-020's no-projection rule a
       property of the shape rather than of a convention about how the value is read.

       The first year carries the convention's fraction, the whole years that follow carry a
       full year each, and the last year carries whatever the fraction left behind. Past the end
       of the period the deduction is zero, which is a computed fact and not an absence. */
    var ordinal = activity.recoveryYearOrdinal;
    if (!Number.isFinite(ordinal) || Math.floor(ordinal) !== ordinal || ordinal < 1) {
      return undeclaredMember("recoveryYearOrdinal");
    }
    var firstYearDeduction = fullYearDeduction * fraction;
    var remainingAfterFirst = activity.depreciableBasis - firstYearDeduction;
    var wholeYearsAfterFirst = Math.floor(remainingAfterFirst / fullYearDeduction);
    var finalPartial = remainingAfterFirst - (fullYearDeduction * wholeYearsAfterFirst);

    var currentYearDeduction = 0;
    var accumulated = 0;
    if (ordinal === 1) {
      currentYearDeduction = firstYearDeduction;
      accumulated = firstYearDeduction;
    } else {
      var subsequent = ordinal - 1;
      if (subsequent <= wholeYearsAfterFirst) {
        currentYearDeduction = fullYearDeduction;
        accumulated = firstYearDeduction + (fullYearDeduction * subsequent);
      } else if (subsequent === wholeYearsAfterFirst + 1) {
        currentYearDeduction = finalPartial;
        accumulated = activity.depreciableBasis;
      } else {
        currentYearDeduction = 0;
        accumulated = activity.depreciableBasis;
      }
    }

    return Object.freeze({
      contractVersion: RECOVERY_CONTRACT,
      declared: Object.freeze({
        depreciableBasis: Object.freeze({ value: activity.depreciableBasis, origin: declaredOrigin("depreciableBasis") }),
        placedInServiceMonth: Object.freeze({ value: month, origin: declaredOrigin("placedInServiceMonth") }),
        recoveryYearOrdinal: Object.freeze({ value: ordinal, origin: declaredOrigin("recoveryYearOrdinal") })
      }),
      recoveryPeriodYears: period,
      convention: rule.convention.conventionId,
      method: rule.method.methodId,
      firstYearFraction: fraction,
      fullYearDeduction: fullYearDeduction,
      firstYearDeduction: firstYearDeduction,
      finalYearDeduction: finalPartial,
      currentYearDeduction: currentYearDeduction,
      accumulatedRecovery: accumulated,
      /* Scope 05's recapture component reads this. It is published rather than left implicit,
         and the settlement asserts it equals the declared basis less the accumulated recovery. */
      adjustedBasis: activity.depreciableBasis - accumulated,
      citations: Object.freeze([periodCitation, conventionCitation, methodCitation])
    });
  }

  /* The pack's sourced ordering rows for the two limits, keyed by limitId. A limit the pack
     does not declare has no established order, so the ladder refuses rather than applying it in
     the position this file happens to call it in. */
  function limitRuleFor(pack, limitId) {
    var policy = isPlainObject(pack) ? pack.lossLimitPolicy : null;
    if (!isPlainObject(policy)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "loss-limit:" + limitId,
        "the resolved pack carries no loss-limit policy, so neither the limits nor the order they are applied in could be established",
        "author a pack that declares lossLimitPolicy with a sourced ordering rule and one row per limit");
    }
    if (rules.isAbsentFigure(policy)) return rules.absentFigureRefusal(policy, "loss-limit:" + limitId);
    var limits = Array.isArray(policy.limits) ? policy.limits : [];
    var index = 0;
    for (index = 0; index < limits.length; index += 1) {
      if (limits[index] && limits[index].limitId === limitId) {
        var row = limits[index];
        if (!Number.isFinite(row.appliedOrder) || Math.floor(row.appliedOrder) !== row.appliedOrder) {
          return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "loss-limit:" + limitId + ":appliedOrder",
            "the pack declares this limit without the integer order the sourced ordering rule places it in",
            "transcribe the ordering rule and record each limit's appliedOrder from it");
        }
        return row;
      }
    }
    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "loss-limit:" + limitId,
      "the resolved pack declares no row for this limit, so the rule it states could not be established",
      "transcribe the limit and its position in the ordering rule from the primary source with a locator");
  }

  /* One applied limit, in the LossLimitation/v1 shape. The three amounts are always all three
     present and always reconcile: `disallowedAmount` is computed even when it is zero, because
     a computed zero and an absent member are different claims and only one of them is a fact. */
  function limitation(row, amountBefore, allowedAmount) {
    return Object.freeze({
      contractVersion: LIMITATION_CONTRACT,
      limitId: row.limitId,
      appliedOrder: row.appliedOrder,
      amountBefore: amountBefore,
      allowedAmount: allowedAmount,
      disallowedAmount: amountBefore - allowedAmount,
      disposition: "suspended",
      sourceRef: row.sourceRef,
      locator: row.locator
    });
  }

  /* FR-023-017's first limit. A loss is allowed only to the extent of the declared at-risk
     amount. The at-risk amount is a household DECLARATION; what is sourced is the rule that the
     limit exists and the position it occupies. */
  function applyAtRiskLimit(lossAmount, activity, pack) {
    var row = limitRuleFor(pack, "at-risk");
    if (rules.isUnavailable(row)) return row;
    if (!Number.isFinite(activity.atRiskAmount) || activity.atRiskAmount < 0) {
      return undeclaredMember("atRiskAmount");
    }
    var allowed = Math.min(lossAmount, activity.atRiskAmount);
    if (allowed < 0) allowed = 0;
    return limitation(row, lossAmount, allowed);
  }

  /* FR-023-018. The allowance is computed from the SOURCED maximum and the SOURCED phase-out
     range at the declared modified adjusted gross income. Either being absent refuses, because
     applying the passive limit without the allowance would disallow a loss the allowance may
     have permitted — an error in the one direction this rule must never make. */
  function specialAllowanceFor(activity, pack) {
    var policy = isPlainObject(pack) ? pack.lossLimitPolicy : null;
    var allowanceRule = isPlainObject(policy) ? policy.specialAllowance : null;
    if (!isPlainObject(allowanceRule)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "loss-limit:passive-activity:specialAllowance",
        "the resolved pack states no special allowance, so the exception to the passive limit could not be established",
        "author a pack that declares the special allowance with its maximum, its phase-out range and its reduction rate");
    }
    if (activity.activeParticipation !== true) {
      var participationCitation = citationFor(pack, allowanceRule.requiresActiveParticipation,
        "loss-limit:passive-activity:specialAllowance:requiresActiveParticipation");
      if (rules.isUnavailable(participationCitation)) return participationCitation;
      return Object.freeze({
        contractVersion: ALLOWANCE_CONTRACT,
        available: true,
        amount: 0,
        reason: "The household did not declare active participation, and the sourced rule makes active participation the condition of the allowance.",
        modifiedAdjustedGrossIncome: activity.modifiedAdjustedGrossIncome,
        phaseOutApplies: false,
        citations: Object.freeze([participationCitation])
      });
    }
    if (rules.isAbsentFigure(allowanceRule.maximumAmounts)) {
      return rules.absentFigureRefusal(allowanceRule.maximumAmounts,
        "loss-limit:passive-activity:specialAllowance:maximumAmounts");
    }
    if (rules.isAbsentFigure(allowanceRule.phaseOutRange)) {
      return rules.absentFigureRefusal(allowanceRule.phaseOutRange,
        "loss-limit:passive-activity:specialAllowance:phaseOutRange");
    }
    if (rules.isAbsentFigure(allowanceRule.reductionRate)) {
      return rules.absentFigureRefusal(allowanceRule.reductionRate,
        "loss-limit:passive-activity:specialAllowance:reductionRate");
    }
    if (!Number.isFinite(activity.modifiedAdjustedGrossIncome)) {
      return undeclaredMember("modifiedAdjustedGrossIncome");
    }
    var maximum = isPlainObject(allowanceRule.maximumAmounts)
      ? allowanceRule.maximumAmounts.amount : undefined;
    var start = isPlainObject(allowanceRule.phaseOutRange)
      ? allowanceRule.phaseOutRange.startsAbove : undefined;
    var end = isPlainObject(allowanceRule.phaseOutRange)
      ? allowanceRule.phaseOutRange.exhaustedAtOrAbove : undefined;
    var rate = isPlainObject(allowanceRule.reductionRate)
      ? allowanceRule.reductionRate.rate : undefined;
    if (!Number.isFinite(maximum) || !Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(rate)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "loss-limit:passive-activity:specialAllowance",
        "the pack carries the allowance without one of the figures it is computed from",
        "transcribe the maximum, both edges of the phase-out range and the reduction rate from the primary source with a locator");
    }
    var maximumCitation = citationFor(pack, allowanceRule.maximumAmounts,
      "loss-limit:passive-activity:specialAllowance:maximumAmounts");
    if (rules.isUnavailable(maximumCitation)) return maximumCitation;
    var rangeCitation = citationFor(pack, allowanceRule.phaseOutRange,
      "loss-limit:passive-activity:specialAllowance:phaseOutRange");
    if (rules.isUnavailable(rangeCitation)) return rangeCitation;

    /* At or below the lower edge the maximum is exact. At or above the upper edge nothing
       remains. Between them the reduction is the sourced rate applied to the excess over the
       lower edge, and the result is floored at zero rather than allowed to go negative. */
    var measure = activity.modifiedAdjustedGrossIncome;
    var reduction = 0;
    var phaseOutApplies = false;
    if (measure > start) {
      phaseOutApplies = true;
      reduction = (measure - start) * rate;
    }
    var amount = maximum - reduction;
    if (amount < 0) amount = 0;
    if (measure >= end) amount = 0;

    return Object.freeze({
      contractVersion: ALLOWANCE_CONTRACT,
      available: true,
      maximum: maximum,
      phaseOutStartsAbove: start,
      phaseOutExhaustedAtOrAbove: end,
      reductionRate: rate,
      reduction: reduction,
      amount: amount,
      phaseOutApplies: phaseOutApplies,
      modifiedAdjustedGrossIncome: measure,
      reason: phaseOutApplies
        ? "The declared modified adjusted gross income sits above the sourced lower edge, so the sourced reduction rate was applied to the excess."
        : "The declared modified adjusted gross income sits at or below the sourced lower edge, so the sourced maximum applies unreduced.",
      citations: Object.freeze([maximumCitation, rangeCitation])
    });
  }

  /* FR-023-017's second limit. A passive loss is allowed to the extent of the special allowance
     this activity's declarations reach. This slice models one rental activity and no other
     passive activity, so there is no passive income from elsewhere to offset — a fact the
     record states rather than leaves to be inferred from an absent member. */
  function applyPassiveActivityLimit(lossAmount, activity, pack) {
    var row = limitRuleFor(pack, "passive-activity");
    if (rules.isUnavailable(row)) return row;
    var allowance = specialAllowanceFor(activity, pack);
    if (rules.isUnavailable(allowance)) return allowance;
    var allowed = Math.min(lossAmount, allowance.amount);
    if (allowed < 0) allowed = 0;
    var applied = limitation(row, lossAmount, allowed);
    return Object.freeze({
      limitation: applied,
      allowance: allowance
    });
  }

  /* Feature 023 Scope 04. The sourced deduction-ordering rows for a dwelling used as a residence
     and rented at or above the threshold. Each tier carries the integer order the pack's rule
     declares and whether the remaining rental income limits it, so the order the tiers are
     applied in is the pack's rather than the order this file happens to build them in. */
  function orderingTiersFor(pack) {
    var rule = isPlainObject(pack) ? pack.useClassification : null;
    var ordering = isPlainObject(rule) ? rule.deductionOrdering : null;
    if (!isPlainObject(ordering)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "use-deduction-ordering",
        "the resolved pack states no deduction ordering for a dwelling used as a residence, so the order its expenses are deducted in could not be established",
        "transcribe the ordering and each tier's position from the primary source with a locator");
    }
    if (rules.isAbsentFigure(ordering)) return rules.absentFigureRefusal(ordering, "use-deduction-ordering");
    if (!isNonEmptyString(ordering.sourceRef) || !isNonEmptyString(ordering.locator)) {
      return rules.unavailable("RLTAX-PACK-INVALID", "use-deduction-ordering",
        "the pack states the ordering without a sourceRef and a locator naming the section it was transcribed from",
        "add a sourceRef naming a retrieved record and a locator naming the worksheet and its lines");
    }
    var tiers = Array.isArray(ordering.tiers) ? ordering.tiers.slice() : [];
    if (tiers.length === 0) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "use-deduction-ordering:tiers",
        "the pack declares the ordering with no tier rows, so there is no order to apply",
        "transcribe each tier with its appliedOrder and whether the remaining rental income limits it");
    }
    var index = 0;
    for (index = 0; index < tiers.length; index += 1) {
      if (!Number.isFinite(tiers[index].appliedOrder) ||
        Math.floor(tiers[index].appliedOrder) !== tiers[index].appliedOrder) {
        return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE",
          "use-deduction-ordering:" + String(tiers[index].tierId) + ":appliedOrder",
          "the pack declares this tier without the integer order the sourced rule places it in",
          "transcribe the ordering rule and record each tier's appliedOrder from it");
      }
      if (typeof tiers[index].limitedToRemainingIncome !== "boolean") {
        return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE",
          "use-deduction-ordering:" + String(tiers[index].tierId) + ":limitedToRemainingIncome",
          "the pack does not state whether the remaining rental income limits this tier, and applying the limit either way would be this engine's convention rather than the authority's",
          "record limitedToRemainingIncome from the worksheet line the tier is transcribed from");
      }
    }
    tiers.sort(function (left, right) { return left.appliedOrder - right.appliedOrder; });
    for (index = 1; index < tiers.length; index += 1) {
      if (tiers[index].appliedOrder <= tiers[index - 1].appliedOrder) {
        return rules.unavailable("RLTAX-PACK-INVALID", "use-deduction-ordering:appliedOrder",
          "the ordering tiers do not carry strictly increasing orders, so the order they were applied in is not the order the sourced rule states: " +
          tiers[index - 1].tierId + " and " + tiers[index].tierId,
          "correct the pack's appliedOrder rows to match the ordering rule it transcribes");
      }
    }
    return Object.freeze({ ordering: ordering, tiers: Object.freeze(tiers) });
  }

  /* FR-023-025. The exception path. The rental income is EXCLUDED and no rental expense is
     deducted. The record states the exclusion as the reason and publishes the excluded amount,
     because a settlement whose value happened to be zero and one whose income the publication
     removes from the return are different claims, and only the second one is this. There is
     deliberately no `value` member: this path contributes no leg, and a zero leg would read as
     a rental that settled to nothing. */
  function computeExcludedRentalSettlement(activity, classification, pack) {
    var rule = isPlainObject(pack) ? pack.useClassification : null;
    var exclusion = isPlainObject(rule) ? rule.exclusionRule : null;
    if (!isPlainObject(exclusion)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "use-classification:exclusionRule",
        "the resolved pack states no rule excluding a minimally rented residence, so the exclusion could not be established",
        "transcribe the exclusion from the primary source with a locator");
    }
    var citation = citationFor(pack, exclusion, "use-classification:exclusionRule");
    if (rules.isUnavailable(citation)) return citation;
    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      declaredTaxYear: activity.declaredTaxYear,
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable",
      category: classification.category,
      classification: classification,
      settlementPath: "excluded",
      excluded: true,
      excludedRentalIncome: activity.rentalIncome,
      excludedRentalExpenses: Object.freeze({
        operatingExpenses: activity.operatingExpenses,
        costRecovery: 0
      }),
      exclusionReason: "This dwelling was used as a residence and rented fewer than the sourced threshold of days, so the sourced rule removes the activity from rental reporting: the rent you received is excluded from income and no rental expense is deducted. This is an exclusion, not a rental that settled to nothing.",
      exclusionStatement: exclusion.statement,
      exclusionCitation: citation,
      unallocatedToItemized: "Your mortgage interest and your property tax on this dwelling remain available to the itemised composition in full and unallocated, because none of either was deducted here.",
      appliedLimits: Object.freeze([]),
      appliedOrder: Object.freeze([]),
      specialAllowance: null,
      allocation: null,
      closingSuspendedLoss: 0,
      noProjectionStatement: "This exclusion is stated for the declared year. No following year is computed, displayed or implied."
    });
  }

  /* FR-023-025 and FR-023-026. A dwelling used as a residence and rented at or above the sourced
     threshold. The rental income is reported, the expenses are ALLOCATED by the classification's
     published day basis, and the allocated rental portions are deducted in the pack's sourced
     order against that income. Whatever an order-limited tier could not reach is carried forward
     and published, never dropped.

     The at-risk and passive-activity ladder is NOT applied here, and the record says which
     sourced statement removed it, because silently skipping two limits and silently applying
     them are indistinguishable from a figure alone. */
  function computeResidenceRentalSettlement(activity, classification, pack, recovery) {
    var resolved = orderingTiersFor(pack);
    if (rules.isUnavailable(resolved)) return resolved;
    var orderingCitation = citationFor(pack, resolved.ordering, "use-deduction-ordering");
    if (rules.isUnavailable(orderingCitation)) return orderingCitation;
    var rule = pack.useClassification;
    var notPassive = isPlainObject(rule) ? rule.notPassiveRule : null;
    if (!isPlainObject(notPassive)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "use-classification:notPassiveRule",
        "the resolved pack states no rule removing a residence from the passive-activity limits, so whether the ladder applies here could not be established",
        "transcribe the rule from the primary source with a locator");
    }
    var notPassiveCitation = citationFor(pack, notPassive, "use-classification:notPassiveRule");
    if (rules.isUnavailable(notPassiveCitation)) return notPassiveCitation;

    var operating = use.allocateByUseDays(Object.freeze({
      expenseId: "operating-expenses", label: "Operating and maintenance expenses",
      amount: activity.operatingExpenses, directlyAllocable: false
    }), classification);
    if (rules.isUnavailable(operating)) return operating;
    var depreciation = use.allocateByUseDays(Object.freeze({
      expenseId: "cost-recovery", label: "Depreciation of the dwelling unit",
      amount: recovery.currentYearDeduction, directlyAllocable: false
    }), classification);
    if (rules.isUnavailable(depreciation)) return depreciation;

    /* Each tier's declared amount, keyed by the tierId the PACK names. A tier the pack declares
       and this slice has no declared expense for carries a computed zero rather than being
       dropped, so the published order stays the pack's whole order. */
    var amountsByTier = {
      "fully-deductible": 0,
      "operating-expenses": operating.rentalPortion,
      "casualty-and-depreciation": depreciation.rentalPortion
    };
    var remaining = activity.rentalIncome;
    var applied = [];
    var carryoverTotal = 0;
    var index = 0;
    for (index = 0; index < resolved.tiers.length; index += 1) {
      var tier = resolved.tiers[index];
      var declared = Object.prototype.hasOwnProperty.call(amountsByTier, tier.tierId)
        ? amountsByTier[tier.tierId] : 0;
      var allowed = declared;
      if (tier.limitedToRemainingIncome === true) {
        allowed = Math.min(declared, Math.max(0, remaining));
      }
      remaining = remaining - allowed;
      var carriedOver = declared - allowed;
      carryoverTotal += carriedOver;
      applied.push(Object.freeze({
        tierId: tier.tierId,
        appliedOrder: tier.appliedOrder,
        limitedToRemainingIncome: tier.limitedToRemainingIncome,
        declaredAmount: declared,
        allowedAmount: allowed,
        carriedOverAmount: carriedOver,
        incomeRemainingAfter: remaining,
        statement: tier.statement,
        locator: tier.locator
      }));
    }
    var allowedTotal = 0;
    for (index = 0; index < applied.length; index += 1) allowedTotal += applied[index].allowedAmount;

    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      declaredTaxYear: activity.declaredTaxYear,
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable",
      category: classification.category,
      classification: classification,
      settlementPath: "residence-ordered-deductions",
      excluded: false,
      declared: Object.freeze({
        rentalIncome: Object.freeze({ value: activity.rentalIncome, origin: declaredOrigin("rentalIncome") }),
        operatingExpenses: Object.freeze({ value: activity.operatingExpenses, origin: declaredOrigin("operatingExpenses") })
      }),
      costRecovery: recovery,
      allocation: Object.freeze({
        basis: classification.allocationBasis,
        allocations: Object.freeze([operating, depreciation]),
        personalPortions: Object.freeze([
          Object.freeze({ componentId: "dwelling-personal-operating", label: "Personal share of the dwelling's operating expenses", amount: operating.personalPortion }),
          Object.freeze({ componentId: "dwelling-personal-depreciation", label: "Personal share of the dwelling's depreciation", amount: depreciation.personalPortion })
        ]),
        rentalTotal: operating.rentalPortion + depreciation.rentalPortion,
        personalTotal: operating.personalPortion + depreciation.personalPortion
      }),
      appliedDeductionOrder: Object.freeze(applied),
      appliedOrder: Object.freeze(applied.map(function (entry) { return entry.appliedOrder; })),
      orderingCitation: orderingCitation,
      allowedDeductionTotal: allowedTotal,
      /* FR-023-025's carryover. The record publishes it even when it is zero, because a computed
         zero and an absent member are different claims and only one of them is a fact. */
      carryoverToNextYear: carryoverTotal,
      passiveLadderApplied: false,
      passiveLadderReason: notPassive.statement,
      passiveLadderCitation: notPassiveCitation,
      appliedLimits: Object.freeze([]),
      specialAllowance: null,
      closingSuspendedLoss: 0,
      adjustedBasis: recovery.adjustedBasis,
      value: activity.rentalIncome - allowedTotal,
      noProjectionStatement: "The carryover published here is stated for the declared year. No following year is computed, displayed or implied."
    });
  }

  /* CO-17. The whole rental settlement.

     The ladder is built from the pack's sourced ordering rows and then SORTED by appliedOrder,
     so the order the limits are applied in is the order the pack declares rather than the order
     this file happens to construct them in. The strictly-increasing assertion that follows is
     what turns FR-023-017 from an assumption into a proven property: an implementation that
     assigned the passive limit the lower order, or that reused an order, is refused. */
  function computeRentalSettlement(activity, pack, classification) {
    var activityCheck = rules.validateRentalActivity(activity);
    if (!activityCheck.ok) return activityCheck.refusals[0];
    if (!isPlainObject(pack)) {
      return rules.unavailable("RLTAX-PACK-INVALID", "rental-settlement:pack",
        "no rule pack was supplied, so no recovery period, convention or limit rule could be read",
        "resolve the rule pack before settling the rental");
    }
    if (!Number.isFinite(activity.rentalIncome)) return undeclaredMember("rentalIncome");
    if (!Number.isFinite(activity.operatingExpenses)) return undeclaredMember("operatingExpenses");
    if (!Number.isFinite(activity.declaredTaxYear)) return undeclaredMember("declaredTaxYear");

    /* FR-023-022. A classification that was ATTEMPTED and refused refuses the settlement, and a
       supplied classification that is not a published record refuses too. A household that
       declared no personal use of the dwelling supplies none at all, which is the chapter this
       publication opens with rather than a missing input. */
    if (classification !== undefined && classification !== null) {
      if (rules.isUnavailable(classification)) return classification;
      if (!rules.isUseClassification(classification)) {
        return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "rental-settlement:classification",
          "a dwelling-use classification was supplied that is not a published classification record, so the category this settlement would be routed by was never established",
          "classify the dwelling first and pass the published classification, or pass none when the household declared no personal use");
      }
      var classificationCheck = rules.validateUseClassification(classification);
      if (!classificationCheck.ok) return classificationCheck.refusals[0];
    }

    /* FR-023-016. Cost recovery is computed BEFORE the net result, and a refusal here refuses
       the whole settlement: there is no path that reaches a net figure without it. */
    var recovery = computeCostRecovery(activity, pack);
    if (rules.isUnavailable(recovery)) return recovery;

    /* FR-023-025. Routed by the PUBLISHED category rather than by the day counts, so a
       settlement and the classification a reader was shown can never disagree. */
    if (classification !== undefined && classification !== null) {
      if (classification.category === "residence-minimal-rental-use") {
        return computeExcludedRentalSettlement(activity, classification, pack);
      }
      if (classification.category === "residence-rented-at-or-above-threshold") {
        return computeResidenceRentalSettlement(activity, classification, pack, recovery);
      }
    }

    var netBeforeLimits = activity.rentalIncome - activity.operatingExpenses - recovery.currentYearDeduction;

    /* The opening carryforward is a declaration and is added to the current year's loss before
       the limits are applied, exactly as a suspended loss from a prior year is treated. It
       carries no citation, and the record labels it the household's own input. */
    var openingSuspendedLoss = Number.isFinite(activity.openingSuspendedLoss)
      ? activity.openingSuspendedLoss : 0;
    var lossBeforeLimits = netBeforeLimits < 0 ? (-netBeforeLimits) + openingSuspendedLoss : openingSuspendedLoss;

    var appliedLimits = [];
    var allowance = null;
    var allowedLoss = lossBeforeLimits;

    if (lossBeforeLimits > 0) {
      var atRisk = applyAtRiskLimit(lossBeforeLimits, activity, pack);
      if (rules.isUnavailable(atRisk)) return atRisk;
      var passive = applyPassiveActivityLimit(atRisk.allowedAmount, activity, pack);
      if (rules.isUnavailable(passive)) return passive;
      appliedLimits = [atRisk, passive.limitation];
      allowance = passive.allowance;
      allowedLoss = passive.limitation.allowedAmount;
    }

    /* The ordering is asserted, not assumed. Sorting first and then requiring strict increase
       means a pack that gave both limits the same order, or that inverted them, is refused with
       the offending pair named. */
    appliedLimits = appliedLimits.slice().sort(function (left, right) {
      return left.appliedOrder - right.appliedOrder;
    });
    var index = 0;
    for (index = 1; index < appliedLimits.length; index += 1) {
      if (appliedLimits[index].appliedOrder <= appliedLimits[index - 1].appliedOrder) {
        return rules.unavailable("RLTAX-PACK-INVALID", "loss-limit:appliedOrder",
          "the applied limits do not carry strictly increasing orders, so the order they were applied in is not the order the sourced rule states: " +
          appliedLimits[index - 1].limitId + " and " + appliedLimits[index].limitId,
          "record each limit's appliedOrder from the pack's sourced ordering rule; the ladder is refused rather than applied in an unproven order");
      }
    }
    if (appliedLimits.length > 0 && appliedLimits[0].limitId !== "at-risk") {
      return rules.unavailable("RLTAX-PACK-INVALID", "loss-limit:appliedOrder",
        "the first applied limit is " + appliedLimits[0].limitId + " and the sourced ordering rule places the at-risk limit first",
        "correct the pack's appliedOrder rows to match the ordering rule it transcribes");
    }
    /* Every applied record is checked against its own contract, so a limit that omitted or
       zeroed its disallowed amount is refused here rather than published. */
    for (index = 0; index < appliedLimits.length; index += 1) {
      var limitCheck = rules.validateLossLimitation(appliedLimits[index]);
      if (!limitCheck.ok) return limitCheck.refusals[0];
    }

    var disallowedTotal = 0;
    for (index = 0; index < appliedLimits.length; index += 1) {
      disallowedTotal += appliedLimits[index].disallowedAmount;
    }

    var orderingRule = isPlainObject(pack.lossLimitPolicy) ? pack.lossLimitPolicy.orderingRule : null;
    var orderingCitation = appliedLimits.length > 0
      ? citationFor(pack, orderingRule, "loss-limit:orderingRule")
      : null;
    if (orderingCitation !== null && rules.isUnavailable(orderingCitation)) return orderingCitation;

    var netAfterLimits = netBeforeLimits < 0 ? -(allowedLoss) : netBeforeLimits - allowedLoss;

    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      /* The ONE year this record speaks about. Nothing else in it names a year. */
      declaredTaxYear: activity.declaredTaxYear,
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable",
      declared: Object.freeze({
        rentalIncome: Object.freeze({ value: activity.rentalIncome, origin: declaredOrigin("rentalIncome") }),
        operatingExpenses: Object.freeze({ value: activity.operatingExpenses, origin: declaredOrigin("operatingExpenses") }),
        atRiskAmount: Object.freeze({ value: activity.atRiskAmount, origin: declaredOrigin("atRiskAmount") }),
        modifiedAdjustedGrossIncome: Object.freeze({ value: activity.modifiedAdjustedGrossIncome, origin: declaredOrigin("modifiedAdjustedGrossIncome") }),
        openingSuspendedLoss: Object.freeze({ value: openingSuspendedLoss, origin: declaredOrigin("openingSuspendedLoss") })
      }),
      costRecovery: recovery,
      netBeforeLimits: netBeforeLimits,
      lossBeforeLimits: lossBeforeLimits,
      appliedLimits: Object.freeze(appliedLimits),
      appliedOrder: Object.freeze(appliedLimits.map(function (entry) { return entry.appliedOrder; })),
      orderingCitation: orderingCitation,
      specialAllowance: allowance,
      allowedLoss: allowedLoss,
      /* FR-023-020. The closing figure, for the declared year only. It is the sum of every
         disallowed amount the ladder published, which is what makes "none is silently zeroed"
         checkable rather than asserted: a zeroed disallowed amount changes this figure. */
      closingSuspendedLoss: disallowedTotal,
      adjustedBasis: recovery.adjustedBasis,
      value: netAfterLimits,
      noProjectionStatement: "This figure is the closing suspended loss for the declared year. No following year is computed, displayed or implied."
    });
  }

  /* What the rental leg contributes to a marginal reading. The special allowance phases out
     against a declared modified adjusted gross income, so unlike the property leg this one CAN
     move with income — and saying which member moves it is what keeps a curve consumer from
     guessing. */
  function rentalMarginalContext(settlement) {
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        contractVersion: "RentalMarginalContext/v1",
        available: false,
        code: settlement.code,
        movesWithIncome: false,
        reason: settlement.reason
      });
    }
    var phasing = isPlainObject(settlement.specialAllowance) && settlement.specialAllowance.phaseOutApplies === true;
    return Object.freeze({
      contractVersion: "RentalMarginalContext/v1",
      available: true,
      legId: "rental-net",
      value: settlement.value,
      movesWithIncome: phasing,
      reason: phasing
        ? "The special allowance is reduced across a sourced phase-out range measured on the declared modified adjusted gross income, so an added dollar of that measure reduces the allowed loss."
        : "No sourced allowance phase-out is in effect for the declared measure, so an added dollar of income does not move this leg.",
      ruleStatus: settlement.ruleStatus
    });
  }

  var api = Object.freeze({
    ACTIVITY_CONTRACT: ACTIVITY_CONTRACT,
    ALLOWANCE_CONTRACT: ALLOWANCE_CONTRACT,
    LIMITATION_CONTRACT: LIMITATION_CONTRACT,
    RECOVERY_CONTRACT: RECOVERY_CONTRACT,
    SETTLEMENT_CONTRACT: SETTLEMENT_CONTRACT,
    applyAtRiskLimit: applyAtRiskLimit,
    applyPassiveActivityLimit: applyPassiveActivityLimit,
    citationFor: citationFor,
    computeCostRecovery: computeCostRecovery,
    computeExcludedRentalSettlement: computeExcludedRentalSettlement,
    computeRentalSettlement: computeRentalSettlement,
    computeResidenceRentalSettlement: computeResidenceRentalSettlement,
    conventionFraction: conventionFraction,
    declaredOrigin: declaredOrigin,
    orderingTiersFor: orderingTiersFor,
    rentalMarginalContext: rentalMarginalContext,
    specialAllowanceFor: specialAllowanceFor
  });

  root.RLTAXRENTAL = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
