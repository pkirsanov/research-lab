/* Lifetime Tax Strategy Lab — Medicare premiums and the income-related adjustment.
 *
 * Feature 024 Scope 04. This module owns `resolveBracketSet`, `resolveAdjustmentBracket`,
 * `requiredLookbackYear`, `checkLookbackYear`, `computePremiumLegs` and `annualMedicareCost`.
 *
 * It declares NO premium, NO bracket boundary, NO adjustment amount, NO lookback offset, NO
 * agency name and NO publication name. Every such value is read from the resolved medicare pack,
 * so a figure that moves is a pack edit and never a code edit, and a scan over this file finds
 * nothing to transcribe.
 *
 * THE ONE THING THIS MODULE EXISTS TO PREVENT. A household's premium adjustment is set by its
 * modified adjusted gross income from a year this settlement is deliberately not settling, while
 * the settlement is simultaneously holding a CURRENT-year modified adjusted gross measure in the
 * same units under almost the same name. Reading the wrong one produces a confidently wrong
 * premium that nobody can see is wrong. The separation here is therefore STRUCTURAL rather than
 * conventional, and a reader can confirm it from the signatures alone:
 *
 *   - `resolveAdjustmentBracket(lookback, bracketPack)` takes exactly two parameters. There is no
 *     third, no options bag and no trailing rest parameter.
 *   - This module imports RLTAXRULES and nothing else. It does not import the settlement engine
 *     RLTAX, so no settlement type is even in scope here.
 *   - It receives no workspace and no settlement through any function in its API.
 *   - It holds no module-scope mutable variable at all: every binding below the imports is a
 *     frozen constant or a function declaration, so there is no closure a caller could load with
 *     a current-year figure between calls.
 *   - `LookbackMagi/v1` itself refuses every member through which a current-year figure could
 *     travel, so the ONE object that does reach the resolver cannot carry one either.
 *
 * And what it produces is a COST. The three legs this module composes are household costs rather
 * than federal income tax: each carries `includedInTotal: false`, each is surfaced beside the tax
 * total, and none is ever summed into it.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXMEDICARE");

  var POLICY_CONTRACT = "MedicarePolicy/v1";
  var BRACKET_SET_CONTRACT = "AdjustmentBracketSet/v1";
  var BRACKET_CONTRACT = rules.ADJUSTMENT_BRACKET_CONTRACT;
  var LOOKBACK_CONTRACT = rules.LOOKBACK_MAGI_CONTRACT;
  var PREMIUM_CONTRACT = rules.PREMIUM_RECORD_CONTRACT;
  var COST_CONTRACT = "AnnualMedicareCost/v1";
  var ADJUSTMENT_LEG_PART_ID = "both-parts";
  var MONTHS_PER_YEAR = 12;

  /* The cost's own words about what it is and where it does not belong. They live HERE rather
     than on the page because a record that travels into an export without them would arrive
     somewhere its framing did not, and the whole point of this scope is that a reader can never
     mistake this figure for tax owed. */
  var NOT_A_TAX_STATEMENT = "This is what Medicare costs the household over a year. It is not "
    + "federal income tax, it is not part of the federal tax total shown beside it, and no part "
    + "of it is added into that total. It is shown here because it is money leaving the "
    + "household in the same year, and a plan that priced the tax and ignored the premium would "
    + "be answering a narrower question than the one asked.";

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  function medicarePolicyOf(pack) {
    return isPlainObject(pack) ? pack.medicarePolicy : undefined;
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

  /* A figure the pack either established or did not. A `SourcedZero` is a real established zero
     and resolves; an `AbsentFigure` refuses by name and no zero stands in for it. */
  function figureAmount(figure) {
    if (rules.isSourcedZero(figure)) return figure.value;
    if (isPlainObject(figure) && Number.isFinite(figure.value)) return figure.value;
    return null;
  }

  function figureRefusal(figure, domain) {
    if (rules.isAbsentFigure(figure)) return rules.absentFigureRefusal(figure, domain);
    if (rules.isUnavailable(figure)) return figure;
    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
      "the medicare pack states no figure here, so nothing is known about it",
      "transcribe the figure from the retrieved publication with its locator; no zero and no average stands in for it");
  }

  /* FR-024-024. The year the declaration MUST name, derived from the pack's own declared premium
     year and its own declared offset. The offset is a pack member and never a module constant:
     a fixture pack declaring a different offset produces a different required year here, which is
     what proves the derivation reads the pack rather than a recollection. */
  function requiredLookbackYear(pack) {
    var policy = medicarePolicyOf(pack);
    if (!isPlainObject(policy)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "medicare-policy",
        "no medicare pack was read for the declared year, so no premium rule exists to price against",
        "ship a medicare pack for the declared year; no typical premium is substituted");
    }
    if (policy.contractVersion !== POLICY_CONTRACT) {
      return rules.unavailable("RLTAX-PACK-INVALID", "medicare-policy",
        "the medicare policy does not declare " + POLICY_CONTRACT,
        "set contractVersion to " + POLICY_CONTRACT);
    }
    if (!Number.isFinite(policy.premiumYear)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "medicare-policy:premium-year",
        "the medicare pack states no premium year, so the year its figures belong to was never established",
        "transcribe the year the publication states for these premiums, with its locator");
    }
    var offset = policy.lookbackOffsetYears;
    var offsetValue = figureAmount(offset);
    if (offsetValue === null || !Number.isFinite(offsetValue) || Math.floor(offsetValue) !== offsetValue) {
      /* Without the offset there is nothing for the declared year to be checked AGAINST, and an
         unchecked lookback year is the exact defect this scope exists to prevent. So the whole
         Medicare settlement refuses rather than accepting whatever year arrives. */
      return figureRefusal(offset, "medicare-policy:lookback-offset");
    }
    if (!isNonEmptyString(offset.quotedOffsetBasis)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "medicare-policy:lookback-offset:basis",
        "the lookback offset carries no quotation from the publication that states it, so it is a bare assertion",
        "quote the publication's own words stating which year's income sets the premium, with its locator");
    }
    return Object.freeze({
      premiumYear: policy.premiumYear,
      offsetYears: offsetValue,
      requiredYear: policy.premiumYear - offsetValue,
      sourceRef: offset.sourceRef,
      locator: offset.locator,
      quotedOffsetBasis: offset.quotedOffsetBasis
    });
  }

  /* FR-024-022 and FR-024-024. An undeclared lookback names the exact year required AND the offset
     that produced it, so a household is told what to supply rather than that something is wrong.
     A declared year that disagrees with the pack's own rule refuses naming all three figures. */
  function checkLookbackYear(lookback, pack) {
    var required = requiredLookbackYear(pack);
    if (rules.isUnavailable(required)) return required;
    if (!isPlainObject(lookback)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "lookback-magi",
        "the household has not declared its modified adjusted gross income for "
          + String(required.requiredYear) + ", which is the premium year "
          + String(required.premiumYear) + " minus this pack's declared lookback offset of "
          + String(required.offsetYears) + " years",
        "declare the modified adjusted gross income for " + String(required.requiredYear)
          + "; the current year's figure is not used and is not substituted");
    }
    var shape = rules.validateLookbackMagi(lookback, "lookback-magi");
    if (shape.ok !== true) return shape.refusals[0];
    if (lookback.lookbackYear !== required.requiredYear) {
      return rules.unavailable("RLTAX-PACK-YEAR-MISMATCH", "lookback-magi:year",
        "the declared lookback year is " + String(lookback.lookbackYear)
          + ", but this pack's premium year is " + String(required.premiumYear)
          + " and its declared lookback offset is " + String(required.offsetYears)
          + " years, which requires " + String(required.requiredYear),
        "declare the income for " + String(required.requiredYear)
          + ", or resolve a medicare pack whose premium year and offset name the year declared");
    }
    return required;
  }

  /* The bracket set for one filing status, narrowed BEFORE the resolver runs. The narrowing takes
     no income figure of any kind, and the resolver it feeds takes no filing status — which is what
     lets `resolveAdjustmentBracket` keep a two-parameter signature a reader can check at a glance.
     A filing status the publication does not enumerate refuses rather than borrowing the amounts
     of an adjacent status. */
  function resolveBracketSet(pack, filingStatus) {
    var policy = medicarePolicyOf(pack);
    var domain = "adjustment-bracket-set:" + String(filingStatus);
    if (!isPlainObject(policy) || policy.contractVersion !== POLICY_CONTRACT) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "no medicare policy was read, so no bracket set exists for any filing status",
        "ship a medicare pack for the declared year");
    }
    if (!isNonEmptyString(filingStatus)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no filing status is declared, and the adjustment brackets differ by it",
        "declare a filing status; no status is chosen on the household's behalf");
    }
    var mapping = isPlainObject(policy.filingStatusMapping)
      ? policy.filingStatusMapping[filingStatus] : undefined;
    if (!isPlainObject(mapping) || !isNonEmptyString(mapping.bracketSetId)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "this publication does not enumerate the declared filing status, and the amounts of an adjacent status are not borrowed for it",
        "retrieve a publication that states the bracket set for this filing status, or declare a status the pack enumerates");
    }
    if (!isNonEmptyString(mapping.quotedBasis)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain + ":basis",
        "the mapping from this filing status to a bracket set carries no quotation from the publication that supports it",
        "quote the publication's own words placing this filing status in this bracket set");
    }
    var brackets = isPlainObject(policy.bracketSets)
      ? policy.bracketSets[mapping.bracketSetId] : undefined;
    if (!Array.isArray(brackets) || brackets.length === 0) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain + ":" + mapping.bracketSetId,
        "the bracket set this filing status maps to carries no brackets",
        "transcribe the bracket rows the publication states for this set, with their locators");
    }
    return Object.freeze({
      contractVersion: BRACKET_SET_CONTRACT,
      bracketSetId: mapping.bracketSetId,
      filingStatus: filingStatus,
      brackets: Object.freeze(brackets.slice()),
      quotedBasis: mapping.quotedBasis,
      locator: mapping.locator
    });
  }

  /* The exact-boundary comparison, published rather than branched. `left` is the household's own
     declared figure, `operator` is the PACK's own sourced inclusivity and `right` is the bracket's
     own lower bound, so a reader can see that the test was strict or inclusive and an assertion
     can pin it at the exact sourced figure. */
  function compareAtLowerBound(amount, bracket) {
    if (bracket.boundaryOperator === "no-lower-bound") {
      return Object.freeze({ left: amount, operator: "no-lower-bound", right: null, result: true });
    }
    if (bracket.boundaryOperator === "greater-than-or-equal") {
      return Object.freeze({
        left: amount, operator: "greater-than-or-equal", right: bracket.lowerBound,
        result: amount >= bracket.lowerBound
      });
    }
    return Object.freeze({
      left: amount, operator: "greater-than", right: bracket.lowerBound,
      result: amount > bracket.lowerBound
    });
  }

  /* FR-024-023 and FR-024-025. EXACTLY TWO PARAMETERS. `lookback` is a `LookbackMagi/v1`, whose
     own contract refuses every member a current-year figure could ride in on; `bracketPack` is a
     bracket set with no income figure in it at all. There is deliberately no third parameter, no
     options bag and no rest parameter, so a caller holding the settlement's current-year modified
     adjusted gross measure has nowhere to put it. That is the whole of FR-024-023, and it is
     readable from this line rather than promised in a comment somewhere else.
     The last bracket whose lower-bound comparison holds is the one selected, which is exactly how
     the publication's own ranges are written: each row's upper edge is the complement of the next
     row's own operator, so no second operator is invented and no gap or overlap is possible. */
  function resolveAdjustmentBracket(lookback, bracketPack) {
    var domain = "adjustment-bracket";
    if (rules.isUnavailable(bracketPack)) return bracketPack;
    if (!isPlainObject(bracketPack) || bracketPack.contractVersion !== BRACKET_SET_CONTRACT) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "no bracket set was resolved, so no bracket can be selected",
        "resolve a bracket set for the declared filing status first");
    }
    if (rules.isUnavailable(lookback)) return lookback;
    var shape = rules.validateLookbackMagi(lookback, "lookback-magi");
    if (shape.ok !== true) return shape.refusals[0];
    var amount = lookback.modifiedAdjustedGrossIncome;
    var comparisons = [];
    var selected = null;
    var index = 0;
    for (index = 0; index < bracketPack.brackets.length; index += 1) {
      var candidate = bracketPack.brackets[index];
      if (!isPlainObject(candidate)) {
        return rules.unavailable("RLTAX-PACK-INVALID", domain + ":" + String(index),
          "a declared bracket is not a record", "declare each bracket as a record");
      }
      if (rules.BOUNDARY_OPERATORS.indexOf(candidate.boundaryOperator) < 0) {
        return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE",
          domain + ":" + String(candidate.bracketIndex) + ":boundary-operator",
          "this bracket states no sourced inclusivity for its own lower bound, so a household sitting exactly on it cannot be placed",
          "transcribe the publication's own operator for this bracket; no convention stands in for it");
      }
      if (candidate.boundaryOperator !== "no-lower-bound" && !Number.isFinite(candidate.lowerBound)) {
        return figureRefusal(candidate.lowerBound,
          domain + ":" + String(candidate.bracketIndex) + ":lower-bound");
      }
      var comparison = compareAtLowerBound(amount, candidate);
      comparisons.push(comparison);
      if (comparison.result === true) selected = candidate;
    }
    if (selected === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the declared income falls in none of the bracket rows this pack carries",
        "transcribe every bracket row the publication states, including its lowest");
    }
    var bracket = Object.freeze({
      contractVersion: BRACKET_CONTRACT,
      bracketIndex: selected.bracketIndex,
      bracketSetId: bracketPack.bracketSetId,
      filingStatus: bracketPack.filingStatus,
      lowerBound: selected.boundaryOperator === "no-lower-bound" ? null : selected.lowerBound,
      upperBound: Number.isFinite(selected.upperBound) ? selected.upperBound : null,
      boundaryOperator: selected.boundaryOperator,
      partBAdjustment: selected.partBAdjustment,
      partDAdjustment: selected.partDAdjustment,
      quotedRange: selected.quotedRange,
      locator: selected.locator,
      comparisonsPerformed: Object.freeze(comparisons)
    });
    var verdict = rules.validateAdjustmentBracket(bracket, domain);
    if (verdict.ok !== true) return verdict.refusals[0];
    return bracket;
  }

  /* The declared leg set, read from the pack rather than from a list in this module, so a leg
     cannot be silently dropped by a hardcoded array nobody updated. */
  function declaredPremiumLegs(pack) {
    var policy = medicarePolicyOf(pack);
    if (!isPlainObject(policy) || !Array.isArray(policy.taxLegs)) return Object.freeze([]);
    return Object.freeze(policy.taxLegs.slice());
  }

  function premiumRecordFor(leg, standardFigure, adjustmentAmount, sourceRefs, locator) {
    var standardAmount = figureAmount(standardFigure);
    if (standardAmount === null) {
      return figureRefusal(standardFigure, "premium-record:" + leg.legId + ":standard-premium");
    }
    var monthly = standardAmount + adjustmentAmount;
    var record = Object.freeze({
      contractVersion: PREMIUM_CONTRACT,
      legId: leg.legId,
      partId: leg.partId,
      includedInTotal: false,
      standardPremiumMonthly: standardAmount,
      adjustmentMonthly: adjustmentAmount,
      totalMonthly: monthly,
      totalAnnual: monthly * MONTHS_PER_YEAR,
      sourceRefs: Object.freeze(sourceRefs.slice()),
      locator: locator
    });
    var verdict = rules.validatePremiumRecord(record, "premium-record:" + leg.legId);
    if (verdict.ok !== true) return verdict.refusals[0];
    return record;
  }

  /* FR-024-026. The three cost legs. Each carries `includedInTotal: false`, and that value comes
     from the pack's own declaration AND is re-asserted structurally by `PremiumRecord/v1`, so a
     pack that declared `true` produces a refusal rather than a premium inside a tax total.
     The signature takes the declared lookback, the medicare pack and a filing status. It takes NO
     settlement, NO workspace and NO current-year income figure. */
  function computePremiumLegs(lookback, pack, filingStatus) {
    var legs = declaredPremiumLegs(pack);
    if (legs.length === 0) {
      return rules.unavailable("RLTAX-PACK-INVALID", "premium-legs:CO-22",
        "the resolved medicare pack declares no leg set, so no leg identity exists to publish",
        "declare the leg set in the medicare pack; the leg identity is never supplied by the engine");
    }
    var yearCheck = checkLookbackYear(lookback, pack);
    if (rules.isUnavailable(yearCheck)) return yearCheck;
    var bracketSet = resolveBracketSet(pack, filingStatus);
    var bracket = resolveAdjustmentBracket(lookback, bracketSet);
    if (rules.isUnavailable(bracket)) return bracket;

    var policy = medicarePolicyOf(pack);
    var partBAdjustment = figureAmount(bracket.partBAdjustment);
    var partDAdjustment = figureAmount(bracket.partDAdjustment);
    var published = [];
    var index = 0;
    for (index = 0; index < legs.length; index += 1) {
      var leg = legs[index];
      var record = null;
      if (leg.partId === ADJUSTMENT_LEG_PART_ID) {
        /* The adjustment leg prices BOTH parts, so it refuses when either part's amount is
           unestablished. Publishing one half would understate a cost by an amount the household
           has no way to notice. */
        if (partBAdjustment === null) {
          record = figureRefusal(bracket.partBAdjustment, "adjustment:" + leg.legId + ":part-b");
        } else if (partDAdjustment === null) {
          record = figureRefusal(bracket.partDAdjustment, "adjustment:" + leg.legId + ":part-d");
        } else {
          var monthlyAdjustment = partBAdjustment + partDAdjustment;
          record = Object.freeze({
            contractVersion: PREMIUM_CONTRACT,
            legId: leg.legId,
            partId: leg.partId,
            includedInTotal: false,
            standardPremiumMonthly: 0,
            adjustmentMonthly: monthlyAdjustment,
            totalMonthly: monthlyAdjustment,
            totalAnnual: monthlyAdjustment * MONTHS_PER_YEAR,
            sourceRefs: Object.freeze([
              bracket.partBAdjustment.sourceRef, bracket.partDAdjustment.sourceRef
            ]),
            locator: bracket.locator
          });
          var adjustmentVerdict = rules.validatePremiumRecord(record, "premium-record:" + leg.legId);
          if (adjustmentVerdict.ok !== true) record = adjustmentVerdict.refusals[0];
        }
      } else {
        var standardFigure = isPlainObject(policy.standardPremiums)
          ? policy.standardPremiums[leg.partId] : undefined;
        record = premiumRecordFor(leg, standardFigure, 0,
          [isPlainObject(standardFigure) ? standardFigure.sourceRef : null],
          isPlainObject(standardFigure) ? standardFigure.locator : null);
      }
      var unavailable = rules.isUnavailable(record);
      published.push(Object.freeze({
        legId: leg.legId,
        stageId: leg.stageId,
        partId: leg.partId,
        figureRef: leg.figureRef,
        /* Read from the PACK's declaration rather than written here, so a pack that declared a
           premium as included in a tax total is caught by the record contract above rather than
           silently corrected by this engine. */
        includedInTotal: leg.includedInTotal === true,
        available: !unavailable,
        value: unavailable ? null : record.totalAnnual,
        record: unavailable ? null : record,
        refusal: unavailable ? record : null
      }));
    }
    return Object.freeze({
      contractVersion: "MedicarePremiumLegs/v1",
      stageId: policy.stageId,
      bracket: bracket,
      bracketSet: bracketSet,
      lookbackYear: lookback.lookbackYear,
      declaredLookbackAmount: lookback.modifiedAdjustedGrossIncome,
      requiredLookbackYear: yearCheck.requiredYear,
      premiumYear: yearCheck.premiumYear,
      lookbackOffsetYears: yearCheck.offsetYears,
      quotedOffsetBasis: yearCheck.quotedOffsetBasis,
      legs: Object.freeze(published)
    });
  }

  /* FR-024-026. The separately published annual cost. It is a sum over the SAME declared leg set
     the surfaces show, and it refuses when any declared leg refused: a cost that quietly omitted
     an unestablished component would understate what the household pays by an amount nobody could
     see, which is the substitution this whole program exists to prevent. It enters no tax total,
     and the record says so in its own words. */
  function annualMedicareCost(premiumLegs) {
    if (rules.isUnavailable(premiumLegs)) return premiumLegs;
    if (!isPlainObject(premiumLegs) || !Array.isArray(premiumLegs.legs)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "annual-medicare-cost",
        "no premium legs were composed, so there is nothing to total",
        "compose the premium legs first");
    }
    var total = 0;
    var index = 0;
    for (index = 0; index < premiumLegs.legs.length; index += 1) {
      var leg = premiumLegs.legs[index];
      if (leg.available !== true) {
        return rules.unavailable(leg.refusal.code, "annual-medicare-cost:" + leg.legId,
          "the annual Medicare cost is withheld because one of its declared parts is unavailable: "
            + leg.refusal.reason,
          leg.refusal.whatWouldMakeItAvailable);
      }
      total += leg.value;
    }
    return Object.freeze({
      contractVersion: COST_CONTRACT,
      value: total,
      includedInTotal: false,
      legCount: premiumLegs.legs.length,
      notATaxStatement: NOT_A_TAX_STATEMENT
    });
  }

  var api = Object.freeze({
    BRACKET_CONTRACT: BRACKET_CONTRACT,
    BRACKET_SET_CONTRACT: BRACKET_SET_CONTRACT,
    COST_CONTRACT: COST_CONTRACT,
    LOOKBACK_CONTRACT: LOOKBACK_CONTRACT,
    NOT_A_TAX_STATEMENT: NOT_A_TAX_STATEMENT,
    POLICY_CONTRACT: POLICY_CONTRACT,
    PREMIUM_CONTRACT: PREMIUM_CONTRACT,
    annualMedicareCost: annualMedicareCost,
    checkLookbackYear: checkLookbackYear,
    computePremiumLegs: computePremiumLegs,
    declaredPremiumLegs: declaredPremiumLegs,
    requiredLookbackYear: requiredLookbackYear,
    resolveAdjustmentBracket: resolveAdjustmentBracket,
    resolveBracketSet: resolveBracketSet
  });

  root.RLTAXMEDICARE = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
