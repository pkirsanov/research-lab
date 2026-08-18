/* Lifetime Tax Strategy Lab — the dwelling-use classification and the day-based allocation.
 *
 * Feature 023 Scope 04. This module owns `classifyDwellingUse` and `allocateByUseDays`.
 *
 * It declares NO day figure, NO percentage and NO rental-days threshold. All three are read from
 * the resolved pack, and there is no branch that supplies one when the pack does not: an
 * unretrieved parameter produces a refusal and NO category, never a plausible one. That is the
 * whole of FR-023-023's protection and it is structural — the module cannot classify a dwelling
 * against a rule it remembers, because it holds no figure to remember.
 *
 * The classification is a PUBLISHED RECORD rather than a branch. Every comparison it made is in
 * `comparisonsPerformed[]` as `{ comparisonId, left, operator, right, result }`, with the
 * operator read from the pack rather than chosen here. That is what makes the three boundaries
 * assertable at the exact sourced figure and the inclusivity inspectable: a reader can see that
 * the personal-use test was strict, and a test can pin it without knowing which branch ran.
 *
 * `usedAsResidence` is deliberately the conjunction of the two published comparisons rather than
 * a separate computation. A value exceeds the greater of two quantities exactly when it exceeds
 * both, so the conjunction is the greater-of test — and writing it that way means the record
 * cannot state a residence its own published comparisons do not support.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXUSE");

  var CLASSIFICATION_CONTRACT = rules.USE_CLASSIFICATION_CONTRACT;
  var DECLARATION_CONTRACT = rules.DWELLING_USE_DECLARATION_CONTRACT;
  var ALLOCATION_CONTRACT = rules.USE_ALLOCATION_CONTRACT;

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
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

  /* One published comparison. The operator is the PACK's, passed in, never chosen here: an
     engine that decided its own inclusivity would be stating the authority's rule from memory.
     A comparison whose operator the engine has no arithmetic for returns null, and every caller
     turns that into a refusal rather than falling through to the operator it does know. */
  function comparison(comparisonId, left, operator, right) {
    var result = null;
    if (operator === "greater-than") result = left > right;
    if (operator === "at-least") result = left >= right;
    if (operator === "less-than") result = left < right;
    if (operator === "at-most") result = left <= right;
    if (result === null) return null;
    return Object.freeze({
      comparisonId: comparisonId,
      left: left,
      operator: operator,
      right: right,
      result: result
    });
  }

  /* The greater-of selection, published as a comparison of its own so a reader can see WHICH of
     the two candidate quantities the personal-use test was actually run against. Its `result` is
     true when the day figure was the greater, which is the fact the two candidate rights differ
     by and the one a boundary fixture is built to move. */
  function greaterOfComparison(dayFigure, percentageOfRentalDays) {
    return Object.freeze({
      comparisonId: "greater-of-selection",
      left: dayFigure,
      operator: "greater-of",
      right: percentageOfRentalDays,
      result: dayFigure >= percentageOfRentalDays
    });
  }

  function parameterRecord(parameterId, label, value, unit, figure, citation) {
    return Object.freeze({
      parameterId: parameterId,
      label: label,
      value: value,
      unit: unit,
      comparisonOperator: figure.comparisonOperator,
      citation: citation
    });
  }

  /* CO-16. FR-023-022 and FR-023-023.
     The declaration supplies the two day counts and the pack supplies the three test parameters.
     Each parameter is resolved, cited and published BEFORE any comparison runs, so a pack that
     could not establish one refuses with that parameter named and no category is assigned. */
  function classifyDwellingUse(declaration, pack) {
    var declarationCheck = rules.validateDwellingUseDeclaration(declaration);
    if (!declarationCheck.ok) return declarationCheck.refusals[0];
    if (!isPlainObject(pack)) {
      return rules.unavailable("RLTAX-PACK-INVALID", "use-classification:pack",
        "no rule pack was supplied, so the day figure, the percentage and the rental-days threshold could not be read",
        "resolve the rule pack before classifying the dwelling");
    }
    var declaredTaxYear = declaration.declaredTaxYear;
    var rule = rules.validateUseClassificationRule(pack, declaredTaxYear);
    if (rules.isUnavailable(rule)) return rule;

    var dayCitation = citationFor(pack, rule.personalUseDayFigure, "use-classification:personalUseDayFigure");
    if (rules.isUnavailable(dayCitation)) return dayCitation;
    var percentageCitation = citationFor(pack, rule.personalUsePercentageFigure,
      "use-classification:personalUsePercentageFigure");
    if (rules.isUnavailable(percentageCitation)) return percentageCitation;
    var thresholdCitation = citationFor(pack, rule.minimalRentalUseThreshold,
      "use-classification:minimalRentalUseThreshold");
    if (rules.isUnavailable(thresholdCitation)) return thresholdCitation;
    var allocationCitation = citationFor(pack, rule.allocationRule, "use-classification:allocationRule");
    if (rules.isUnavailable(allocationCitation)) return allocationCitation;

    var personalUseDays = declaration.personalUseDays;
    var fairRentalDays = declaration.fairRentalDays;
    var dayFigure = rule.personalUseDayFigure.days;
    var percentage = rule.personalUsePercentageFigure.rate;
    var thresholdDays = rule.minimalRentalUseThreshold.days;
    var percentageOfRentalDays = fairRentalDays * percentage;

    var againstDayFigure = comparison("personal-use-versus-day-figure", personalUseDays,
      rule.personalUseDayFigure.comparisonOperator, dayFigure);
    var againstPercentage = comparison("personal-use-versus-percentage-of-rental-days", personalUseDays,
      rule.personalUsePercentageFigure.comparisonOperator, percentageOfRentalDays);
    var againstThreshold = comparison("rental-days-versus-minimal-use-threshold", fairRentalDays,
      rule.minimalRentalUseThreshold.comparisonOperator, thresholdDays);
    if (againstDayFigure === null || againstPercentage === null || againstThreshold === null) {
      return rules.unavailable("RLTAX-FEATURE-UNSUPPORTED", "use-classification:comparisonOperator",
        "the pack names a comparison this engine has no arithmetic for, and no other comparison is applied in its place",
        "add the comparison's arithmetic to the engine together with the operator the pack declares");
    }

    /* Exceeding the greater of two quantities is exceeding BOTH. Writing the conjunction rather
       than recomputing a maximum is what keeps the published comparisons and the category from
       being able to disagree. */
    var usedAsResidence = againstDayFigure.result === true && againstPercentage.result === true;
    var minimalRentalUse = againstThreshold.result === true;
    var category = "not-a-residence";
    var categoryReason = "The declared personal use does not exceed the greater of the sourced day figure and the sourced percentage of the days rented at a fair rental price, so this dwelling was not used as a residence and the rental is settled without the personal-use limit.";
    if (usedAsResidence && minimalRentalUse) {
      category = "residence-minimal-rental-use";
      categoryReason = "The declared personal use exceeds the greater of the two sourced parameters, so the dwelling was used as a residence, and it was rented fewer than the sourced threshold of days, so the publication excludes this activity from rental reporting entirely.";
    } else if (usedAsResidence) {
      category = "residence-rented-at-or-above-threshold";
      categoryReason = "The declared personal use exceeds the greater of the two sourced parameters, so the dwelling was used as a residence, and it was rented at or above the sourced threshold of days, so the rental is reported and its expenses are deducted in the sourced order against the rental income.";
    }

    return Object.freeze({
      contractVersion: CLASSIFICATION_CONTRACT,
      category: category,
      categoryReason: categoryReason,
      usedAsResidence: usedAsResidence,
      personalUseDays: personalUseDays,
      fairRentalDays: fairRentalDays,
      /* The open question the specification routed to this retrieval, answered from the pack and
         published rather than left to a reader to infer from an unlabelled multiplication. */
      percentageComparedAgainst: rule.personalUsePercentageFigure.comparedAgainst,
      testParameters: Object.freeze([
        parameterRecord("personal-use-day-figure", "Personal-use day figure", dayFigure, "days",
          rule.personalUseDayFigure, dayCitation),
        parameterRecord("personal-use-percentage", "Personal-use percentage of days rented",
          percentage, "share-of-days", rule.personalUsePercentageFigure, percentageCitation),
        parameterRecord("minimal-rental-use-threshold", "Minimal-rental-use day threshold",
          thresholdDays, "days", rule.minimalRentalUseThreshold, thresholdCitation)
      ]),
      comparisonsPerformed: Object.freeze([
        againstDayFigure,
        againstPercentage,
        greaterOfComparison(dayFigure, percentageOfRentalDays),
        againstThreshold
      ]),
      allocationBasis: Object.freeze({
        basis: rule.allocationRule.basis,
        numerator: fairRentalDays,
        denominator: fairRentalDays + personalUseDays,
        ratio: (fairRentalDays + personalUseDays) === 0 ? null
          : fairRentalDays / (fairRentalDays + personalUseDays),
        statement: rule.allocationRule.statement,
        citation: allocationCitation
      }),
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable"
    });
  }

  /* FR-023-026 and FR-023-027. One declared expense, divided by the published allocation basis.
     The personal portion is the declared amount LESS the rental portion rather than a second
     multiplication, so the two halves sum to the declared amount exactly at every ratio and no
     rounding can lose a cent between them — which is what makes "the personal portion is routed
     rather than discarded" checkable by addition.

     An expense the household declared directly allocable is REFUSED rather than divided. Dividing
     it would deduct less than the authority allows, and silently returning it undivided would
     make the two paths indistinguishable in the record. */
  function allocateByUseDays(expense, classification) {
    if (rules.isUnavailable(classification)) return classification;
    if (!rules.isUseClassification(classification)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "use-allocation:classification",
        "no published classification was supplied, so the day counts an allocation divides by were never established",
        "classify the dwelling first and pass the published classification to the allocation");
    }
    if (!isPlainObject(expense) || !isNonEmptyString(expense.expenseId)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "use-allocation:expense",
        "the expense is missing, is not an object, or names no expenseId",
        "supply an expense carrying an expenseId, a declared amount and whether it is directly allocable");
    }
    if (!Number.isFinite(expense.amount) || expense.amount < 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "use-allocation:" + expense.expenseId,
        "the household has not declared a finite amount for this expense, and an allocation of an undeclared amount is an allocation of nothing",
        "declare the expense amount; no typical value, average or estimate is substituted");
    }
    if (expense.directlyAllocable === true) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "use-allocation:" + expense.expenseId,
        "this expense was declared directly allocable to the rental use, and dividing it by the day ratio would deduct less than the sourced rule allows",
        "carry a directly allocable expense to the rental side whole; it is not re-allocated and the allocation refuses rather than dividing it");
    }
    var basis = classification.allocationBasis;
    if (!isPlainObject(basis) || !Number.isFinite(basis.ratio)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "use-allocation:" + expense.expenseId,
        "the classification establishes no day ratio, because the declared day counts are both zero and a dwelling used on no day divides nothing",
        "declare the days the dwelling was rented at a fair rental price and the days it was used personally");
    }
    var rentalPortion = expense.amount * basis.ratio;
    return Object.freeze({
      contractVersion: ALLOCATION_CONTRACT,
      expenseId: expense.expenseId,
      label: isNonEmptyString(expense.label) ? expense.label : expense.expenseId,
      declaredAmount: expense.amount,
      rentalPortion: rentalPortion,
      personalPortion: expense.amount - rentalPortion,
      allocationBasis: basis,
      basisStatement: "Divided " + String(basis.numerator) + " over " + String(basis.denominator)
        + " on the day counts you declared, under " + String(basis.basis) + ".",
      citation: basis.citation
    });
  }

  /* Every allocation for a declared expense set, in declared order, plus the two totals. A
     directly allocable expense is carried WHOLE to the rental side and named as such rather than
     dropped, so the returned record accounts for every declared expense exactly once. */
  function allocateExpenseSet(expenses, classification) {
    if (rules.isUnavailable(classification)) return classification;
    var list = Array.isArray(expenses) ? expenses : [];
    var allocations = [];
    var direct = [];
    var rentalTotal = 0;
    var personalTotal = 0;
    var index = 0;
    for (index = 0; index < list.length; index += 1) {
      if (list[index] && list[index].directlyAllocable === true) {
        if (!Number.isFinite(list[index].amount) || list[index].amount < 0) {
          return rules.unavailable("RLTAX-INPUT-INCOMPLETE",
            "use-allocation:" + String(list[index].expenseId),
            "the household has not declared a finite amount for this directly allocable expense",
            "declare the expense amount; no typical value, average or estimate is substituted");
        }
        direct.push(Object.freeze({
          expenseId: list[index].expenseId,
          label: isNonEmptyString(list[index].label) ? list[index].label : list[index].expenseId,
          declaredAmount: list[index].amount,
          rentalPortion: list[index].amount,
          personalPortion: 0,
          reason: "Declared directly allocable to the rental use, so its whole amount is a rental expense and it was not divided."
        }));
        rentalTotal += list[index].amount;
        continue;
      }
      var allocated = allocateByUseDays(list[index], classification);
      if (rules.isUnavailable(allocated)) return allocated;
      allocations.push(allocated);
      rentalTotal += allocated.rentalPortion;
      personalTotal += allocated.personalPortion;
    }
    return Object.freeze({
      contractVersion: "UseAllocationSet/v1",
      allocations: Object.freeze(allocations),
      directlyAllocable: Object.freeze(direct),
      rentalTotal: rentalTotal,
      personalTotal: personalTotal,
      declaredTotal: rentalTotal + personalTotal
    });
  }

  /* What the classification contributes to a marginal reading. A day count does not move with an
     added dollar of income, and saying so explicitly is what keeps a curve consumer from
     guessing that it might. */
  function useMarginalContext(classification) {
    if (rules.isUnavailable(classification)) {
      return Object.freeze({
        contractVersion: "UseMarginalContext/v1",
        available: false,
        code: classification.code,
        movesWithIncome: false,
        reason: classification.reason
      });
    }
    return Object.freeze({
      contractVersion: "UseMarginalContext/v1",
      available: true,
      legId: "dwelling-use",
      movesWithIncome: false,
      reason: "This classification is decided by the days you declared and by sourced day parameters, so an added dollar of income does not move it. What it moves is which arithmetic the rental leg gets.",
      ruleStatus: classification.ruleStatus
    });
  }

  var api = Object.freeze({
    ALLOCATION_CONTRACT: ALLOCATION_CONTRACT,
    CLASSIFICATION_CONTRACT: CLASSIFICATION_CONTRACT,
    DECLARATION_CONTRACT: DECLARATION_CONTRACT,
    allocateByUseDays: allocateByUseDays,
    allocateExpenseSet: allocateExpenseSet,
    citationFor: citationFor,
    classifyDwellingUse: classifyDwellingUse,
    useMarginalContext: useMarginalContext
  });

  root.RLTAXUSE = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
