/* Lifetime Tax Strategy Lab — the claim-age comparison.
 *
 * Feature 024 Scope 03. This module owns `resolveMortalityBasis`, `cumulativeBenefitTotal`,
 * `cumulativeParityAge` and `composeClaimAgeComparison`.
 *
 * It declares NO life-expectancy figure, NO age, NO table year, NO agency name and NO
 * publication name. Every such value is read from the resolved mortality pack, so a figure that
 * moves is a pack edit and never a code edit, and a scan over this file finds nothing to
 * transcribe.
 *
 * What this module produces is arithmetic and nothing more. For each claim age the household
 * declared it reports the adjusted annual benefit, the whole number of years from that claim age
 * to the life-expectancy age the table states for it, and the product of the two. For each pair
 * it reports the age at which those two sums are equal, which is the solution of an equality
 * between two declared quantities. There is no discount rate here, no growth rate, no inflation
 * adjustment, no partial-year interpolation and no ranking: a reader may grep for each and find
 * nothing. The record says in its own words what kind of figure it carries and that it selects
 * nothing, and both statements travel with it into the export.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXCLAIMAGE");

  var socialsecurity = root.RLTAXSOCIALSECURITY;
  if (!socialsecurity && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    socialsecurity = require("./rltaxsocialsecurity");
  }
  if (!socialsecurity) throw new Error("RLTAXSOCIALSECURITY must be loaded before RLTAXCLAIMAGE");

  var POLICY_CONTRACT = "MortalityPolicy/v1";
  var COMPARISON_CONTRACT = rules.CLAIM_AGE_COMPARISON_CONTRACT;
  var BASIS_CONTRACT = rules.MORTALITY_BASIS_CONTRACT;
  var MONTHS_PER_YEAR = 12;

  /* The record's own words about what it is. These live HERE rather than on the page because a
     record that travels into an export without them would arrive somewhere its framing did not. */
  var RESULT_KIND_STATEMENT = "Each figure here is a declared annual amount multiplied by a whole "
    + "number of years, and each pairing reports the age at which two such products are equal. "
    + "Every one is arithmetic over an amount this settlement computed from your own declarations "
    + "and a remaining-years figure transcribed from a published table. The claim made here is "
    + "exactly that and no more: two declared sums are equal at that age. It is not a forecast "
    + "and not a prediction of what will happen to you, and it states no chance that any "
    + "particular thing happens.";

  var SELECTS_NOTHING_STATEMENT = "This comparison selects nothing. The claim ages appear in the "
    + "order you declared them rather than in the order of any figure, none of them is marked as "
    + "better than another, and the arithmetic here expresses no preference between them.";

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  function isWholeAge(candidate) {
    return Number.isFinite(candidate) && Math.floor(candidate) === candidate && candidate > 0;
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

  function declaredColumnIds(pack) {
    var policy = isPlainObject(pack) ? pack.mortalityPolicy : undefined;
    if (!isPlainObject(policy) || !Array.isArray(policy.columns)) return Object.freeze([]);
    return Object.freeze(policy.columns.map(function (column) {
      return isPlainObject(column) ? column.columnId : null;
    }).filter(isNonEmptyString));
  }

  /* FR-024-015. The basis a comparison may run on. Every gate here refuses rather than
     substituting: a pack with no policy, a policy carrying a member outside its declared shape, a
     column the household never chose, a table year the publication never stated, and a table
     whose own dating was never quoted each produce a refusal naming what is missing.
     `columnId` is REQUIRED and has no default, because choosing a column on the household's
     behalf would be this tool answering a question the retrieval left open. */
  function resolveMortalityBasis(pack, columnId, declaredYear) {
    var domain = "mortality-basis";
    var policy = isPlainObject(pack) ? pack.mortalityPolicy : undefined;
    if (!isPlainObject(policy)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "no mortality pack was read for the declared year, so no sourced remaining-years figure exists to compare against",
        "ship a mortality pack for the declared year; no default horizon is substituted");
    }
    if (policy.contractVersion !== POLICY_CONTRACT) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the mortality policy does not declare " + POLICY_CONTRACT,
        "set contractVersion to " + POLICY_CONTRACT);
    }
    var shapeVerdict = rules.validateMortalityPolicy(policy, domain + ":policy");
    if (shapeVerdict.ok !== true) return shapeVerdict.refusals[0];

    var available = declaredColumnIds(pack);
    if (!isNonEmptyString(columnId)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain + ":column",
        "this table publishes more than one column of remaining years and the household has not declared which one to read",
        "declare one of: " + available.join(", ")
          + "; neither is chosen on the household's behalf, and what each column describes is stated beside them");
    }
    var columns = policy.columns;
    var column = null;
    var index = 0;
    for (index = 0; index < columns.length; index += 1) {
      if (columns[index].columnId === columnId) column = columns[index];
    }
    if (column === null) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain + ":column:" + String(columnId),
        "the declared column is not one this table carries",
        "declare one of: " + available.join(", "));
    }

    var yearFigure = policy.tableYear;
    if (!isPlainObject(yearFigure) || !Number.isFinite(yearFigure.value)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain + ":table-year",
        "the mortality pack states no table year, so which year the remaining-years figures belong to was never established",
        "transcribe the year the publication states for this table, with its locator");
    }
    var record = findSourceRecord(pack, column.sourceRef);
    if (record === null || record.retrievalOutcome === "not-retrieved") {
      return rules.unavailable("RLTAX-PACK-INVALID", domain + ":source",
        "the column cites no retrieved record in sourceRecords[]",
        "add a SourceRecord whose sourceId equals " + String(column.sourceRef));
    }
    var basisVerdict = rules.validateMortalityTableYearBasis(policy.tableYearBasis, domain + ":table-year-basis");
    if (basisVerdict.ok !== true) return basisVerdict.refusals[0];

    var domainRule = isPlainObject(policy.ageDomain) ? policy.ageDomain : {};
    var basis = Object.freeze({
      contractVersion: BASIS_CONTRACT,
      tableId: policy.tableId,
      tableYear: yearFigure.value,
      declaredYear: Number.isFinite(declaredYear) ? declaredYear : null,
      columnId: column.columnId,
      columnMeaning: policy.columnMeaning,
      lifeExpectancyByAge: Object.freeze(column.lifeExpectancyByAge.slice()),
      minimumAge: domainRule.minimumAge,
      maximumAge: domainRule.maximumAge,
      sourceRef: column.sourceRef,
      locator: column.locator,
      tableYearBasis: policy.tableYearBasis,
      /* What this retrieval did NOT establish, carried inside the basis so it reaches every
         surface the basis reaches rather than living only where someone remembered to render it. */
      unlabelledColumns: policy.columnLabels
    });
    var verdict = rules.validateMortalityBasis(basis, domain);
    if (verdict.ok !== true) return verdict.refusals[0];
    return basis;
  }

  /* The sourced row lookup, reused from Scope 01's foundation contract. A declared age outside
     the table's own declared domain refuses by name; no adjacent row is borrowed and no horizon
     is substituted. */
  function remainingYearsAt(basis, age) {
    var domain = "mortality-basis:remaining-years:" + String(age);
    if (!isWholeAge(age)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no whole claim age was declared, so no row can be read",
        "declare the claim age as a whole number of years");
    }
    var rows = basis.lifeExpectancyByAge;
    var index = 0;
    for (index = 0; index < rows.length; index += 1) {
      if (rows[index].age === age) return rows[index].value;
    }
    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
      "this table carries no row for the declared age, and no adjacent row stands in for it",
      "transcribe the row for this age from the published table, or declare an age the table carries");
  }

  /* FR-024-016. A sum over WHOLE years. The remaining-years figure the table states is added to
     the claim age to give the age this arithmetic runs to, and the whole years between the two
     are counted. Nothing is discounted, nothing is grown, nothing is inflated and no part of a
     year is interpolated: the count is a count and the total is a product. */
  function cumulativeBenefitTotal(adjustedAnnualBenefit, claimAge, remainingYears) {
    var domain = "claim-age-comparison:cumulative-total:" + String(claimAge);
    if (!Number.isFinite(adjustedAnnualBenefit) || adjustedAnnualBenefit < 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "the adjusted annual benefit for this claim age has not settled, so no sum over years exists",
        "settle the benefit at this claim age first");
    }
    if (!isWholeAge(claimAge) || !Number.isFinite(remainingYears) || remainingYears <= 0) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "no sourced remaining-years figure is available for this claim age, so the sum is withheld",
        "transcribe the remaining-years figure for this age; no default horizon is substituted");
    }
    var terminalAge = claimAge + remainingYears;
    var wholeYears = Math.floor(terminalAge) - claimAge;
    return Object.freeze({
      claimAge: claimAge,
      remainingYears: remainingYears,
      terminalAge: terminalAge,
      wholeYears: wholeYears,
      adjustedAnnualBenefit: adjustedAnnualBenefit,
      cumulativeTotal: adjustedAnnualBenefit * wholeYears
    });
  }

  /* FR-024-017. The age at which two cumulative totals are EQUAL. Both are the same declared
     annual amount multiplied by the years elapsed since its own claim age, so the equality is a
     linear one and its solution is exact arithmetic over two declared amounts and two declared
     ages. When the later claim age's annual amount is not the larger of the two, the two running
     sums never meet, and the record says so rather than reporting a bound as though it were an
     answer. Both claim ages are named on the record so a reader never has to infer which pair a
     figure belongs to. */
  function cumulativeParityAge(earlierClaimAge, earlierAnnual, laterClaimAge, laterAnnual) {
    var domain = "claim-age-comparison:equality-age:"
      + String(earlierClaimAge) + "-and-" + String(laterClaimAge);
    if (!isWholeAge(earlierClaimAge) || !isWholeAge(laterClaimAge)
      || !Number.isFinite(earlierAnnual) || !Number.isFinite(laterAnnual)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "one of the two claim ages has no settled annual amount, so no equality between their sums exists",
        "settle the benefit at both claim ages first");
    }
    if (!(laterAnnual > earlierAnnual)) {
      return Object.freeze({
        earlierClaimAge: earlierClaimAge,
        laterClaimAge: laterClaimAge,
        equalityAge: null,
        sumsMeet: false,
        withheldReason: "The later claim age's annual amount is not larger than the earlier one's, "
          + "so the two running sums never become equal at any age. No figure is reported here, "
          + "because reporting a bound in place of an equality would answer a question that has no answer."
      });
    }
    return Object.freeze({
      earlierClaimAge: earlierClaimAge,
      laterClaimAge: laterClaimAge,
      equalityAge: ((laterAnnual * laterClaimAge) - (earlierAnnual * earlierClaimAge))
        / (laterAnnual - earlierAnnual),
      sumsMeet: true,
      withheldReason: null
    });
  }

  /* Every declared claim age, in the order it was declared. `perAge[]` is built by ITERATING the
     declared list, so there is no sort here for a later reader to have to prove absent. */
  function composeClaimAgeComparison(declaration, claimAges, basis, benefitPack) {
    var domain = "claim-age-comparison";
    if (!Array.isArray(claimAges) || claimAges.length === 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain + ":claim-ages",
        "no claim ages were declared, so there is nothing to compare",
        "declare at least one whole claim age; none is supplied on the household's behalf");
    }
    var basisAvailable = !rules.isUnavailable(basis) && isPlainObject(basis)
      && basis.contractVersion === BASIS_CONTRACT;
    /* FR-024-015. An INVALID PACK and an ABSENT FIGURE are different failures and are answered
       differently. A pack carrying a member outside the mortality shape — a probability, a
       survivorship count, a hazard — has been refused by name, and no comparison is produced
       from it at all: the per-age benefits are withheld along with everything else, because the
       question is not "which figure is missing" but "should this pack have been read". An absent
       figure is the FR-024-020 case below, where the benefits still resolve. */
    if (rules.isUnavailable(basis) && basis.code === "RLTAX-PACK-INVALID") return basis;
    var perAge = [];
    var index = 0;
    for (index = 0; index < claimAges.length; index += 1) {
      var claimAge = claimAges[index];
      if (!isWholeAge(claimAge)) {
        return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain + ":claim-age:" + String(claimAge),
          "a declared claim age is not a whole number of years",
          "declare each claim age as a whole number of years");
      }
      var settlement = socialsecurity.computeBenefitSettlement(Object.freeze({
        declaredTaxYear: isPlainObject(declaration) ? declaration.declaredTaxYear : undefined,
        statementPrimaryInsuranceAmount: isPlainObject(declaration)
          ? declaration.statementPrimaryInsuranceAmount : undefined,
        declaredEarnings: isPlainObject(declaration) ? declaration.declaredEarnings : undefined,
        birthYear: isPlainObject(declaration) ? declaration.birthYear : undefined,
        claimAgeMonths: claimAge * MONTHS_PER_YEAR
      }), benefitPack);
      if (rules.isUnavailable(settlement)) {
        /* FR-019-004. A refusal that belongs to THIS candidate refuses THIS row and leaves the
           others alone. Refusing the whole table would withhold the ages the pack can price, and
           dropping the row would let a household believe an age it typed was considered and lost
           on the merits. Every other refusal is about the household or the pack, applies to every
           candidate equally, and still returns wholesale. */
        if (settlement.domain !== socialsecurity.BELOW_EARLIEST_CLAIM_AGE_DOMAIN) return settlement;
        perAge.push(Object.freeze({
          claimAge: claimAge,
          adjustedAnnualBenefit: null,
          benefitRefusal: settlement,
          remainingYears: null,
          terminalAge: null,
          wholeYears: null,
          cumulativeTotal: null,
          withheld: null
        }));
        continue;
      }

      /* FR-024-020. The adjusted annual benefit resolves whether or not the table did. When the
         remaining-years figure is absent the cumulative total is WITHHELD and its refusal is
         published in its place; no horizon stands in for it. */
      var totalRecord = null;
      var withheld = null;
      if (basisAvailable) {
        var remaining = remainingYearsAt(basis, claimAge);
        if (rules.isUnavailable(remaining)) {
          withheld = remaining;
        } else {
          totalRecord = cumulativeBenefitTotal(settlement.value, claimAge, remaining);
          if (rules.isUnavailable(totalRecord)) {
            withheld = totalRecord;
            totalRecord = null;
          }
        }
      } else {
        withheld = rules.isUnavailable(basis) ? basis
          : rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain + ":mortality-basis",
            "no mortality basis resolved, so no sum over years is available",
            "resolve a mortality basis; no default horizon is substituted");
      }
      perAge.push(Object.freeze({
        claimAge: claimAge,
        adjustedAnnualBenefit: settlement.value,
        benefitRefusal: null,
        remainingYears: totalRecord === null ? null : totalRecord.remainingYears,
        terminalAge: totalRecord === null ? null : totalRecord.terminalAge,
        wholeYears: totalRecord === null ? null : totalRecord.wholeYears,
        cumulativeTotal: totalRecord === null ? null : totalRecord.cumulativeTotal,
        withheld: withheld
      }));
    }

    var parityAges = [];
    var outer = 0;
    var inner = 0;
    for (outer = 0; outer < perAge.length; outer += 1) {
      for (inner = outer + 1; inner < perAge.length; inner += 1) {
        var first = perAge[outer];
        var second = perAge[inner];
        if (first.cumulativeTotal === null || second.cumulativeTotal === null) {
          parityAges.push(Object.freeze({
            earlierClaimAge: first.claimAge,
            laterClaimAge: second.claimAge,
            equalityAge: null,
            sumsMeet: false,
            withheldReason: "One of these two claim ages has no sourced remaining-years figure, so "
              + "neither cumulative total exists and no equality between them can be stated."
          }));
          continue;
        }
        parityAges.push(cumulativeParityAge(first.claimAge, first.adjustedAnnualBenefit,
          second.claimAge, second.adjustedAnnualBenefit));
      }
    }

    var comparison = Object.freeze({
      contractVersion: COMPARISON_CONTRACT,
      claimAges: Object.freeze(claimAges.slice()),
      perAge: Object.freeze(perAge),
      parityAges: Object.freeze(parityAges),
      mortalityBasisRef: basisAvailable
        ? Object.freeze({
          tableId: basis.tableId, tableYear: basis.tableYear, columnId: basis.columnId,
          sourceRef: basis.sourceRef, locator: basis.locator
        })
        : null,
      resultKindStatement: RESULT_KIND_STATEMENT,
      selectsNothingStatement: SELECTS_NOTHING_STATEMENT
    });
    var verdict = rules.validateClaimAgeComparison(comparison, domain);
    if (verdict.ok !== true) return verdict.refusals[0];
    return comparison;
  }

  var api = Object.freeze({
    BASIS_CONTRACT: BASIS_CONTRACT,
    COMPARISON_CONTRACT: COMPARISON_CONTRACT,
    POLICY_CONTRACT: POLICY_CONTRACT,
    RESULT_KIND_STATEMENT: RESULT_KIND_STATEMENT,
    SELECTS_NOTHING_STATEMENT: SELECTS_NOTHING_STATEMENT,
    composeClaimAgeComparison: composeClaimAgeComparison,
    cumulativeBenefitTotal: cumulativeBenefitTotal,
    cumulativeParityAge: cumulativeParityAge,
    declaredColumnIds: declaredColumnIds,
    remainingYearsAt: remainingYearsAt,
    resolveMortalityBasis: resolveMortalityBasis
  });

  root.RLTAXCLAIMAGE = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
