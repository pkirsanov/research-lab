/* Lifetime Tax Strategy Lab — the Social Security benefit basis, the bend-point formula, the
 * full retirement age and the claim-age adjustment.
 *
 * Feature 024 Scope 01. This module owns `resolveBenefitBasis`,
 * `computeAverageIndexedMonthlyEarnings`, `computePrimaryInsuranceAmount`,
 * `resolveFullRetirementAge`, `applyClaimAgeAdjustment` and `computeBenefitSettlement`.
 *
 * It declares NO bend point, NO percentage, NO reduction factor, NO credit rate, NO age, NO
 * agency name and NO publication name. Every such value is read from the resolved benefit pack,
 * so a figure that moves is a pack edit and never a code edit, and a scan over this file finds
 * nothing to transcribe.
 *
 * The two basis origins are resolved by SHAPE and there is deliberately no precedence branch:
 * a household declaring both a statement amount and an earnings record is an ambiguity this
 * module refuses, not one it settles by preferring either. Grepping this file for a precedence
 * rule finds nothing, which is the point.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXSOCIALSECURITY");

  var BASIS_CONTRACT = rules.BENEFIT_BASIS_CONTRACT;
  var ADJUSTMENT_CONTRACT = rules.CLAIM_AGE_ADJUSTMENT_CONTRACT;
  var SETTLEMENT_CONTRACT = "BenefitSettlement/v1";
  var PIA_CONTRACT = "PrimaryInsuranceAmount/v1";
  var AIME_CONTRACT = "AverageIndexedMonthlyEarnings/v1";
  var FRA_CONTRACT = "FullRetirementAge/v1";

  var BASIS_ORIGINS = rules.BENEFIT_BASIS_ORIGINS;

  /* The two things a household can actually have. Named once, so the neither-declared refusal
     can enumerate exactly what it would accept rather than describing it in prose. */
  var ACCEPTED_DECLARATIONS = Object.freeze([
    "statementPrimaryInsuranceAmount", "declaredEarnings"
  ]);

  var MONTHS_PER_YEAR = 12;

  /* The one refusal that belongs to a CANDIDATE claim age rather than to the household or the
     pack. It is named here and exported so the comparison surface can refuse that candidate in
     its own row without matching on message text or on a domain string it reconstructed. */
  var BELOW_EARLIEST_CLAIM_AGE_DOMAIN = "benefit:claim-age-adjustment:below-earliest-claim-age";

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

  /* The citation actually governing one sourced benefit figure. A figure whose sourceRef names
     no record, or whose locator is empty, cites nothing and is refused rather than displayed
     with an unreachable reference. A figure carried from an edition other than the declared year
     must additionally carry a quoted `yearInvarianceBasis`; without one it refuses even though it
     was genuinely retrieved, because a retrieved figure with no established invariance for the
     declared year is not a usable figure. */
  function citationFor(pack, figure, domain) {
    if (!isPlainObject(figure)) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced figure is missing or is not an object",
        "supply the figure this citation belongs to");
    }
    if (!isNonEmptyString(figure.sourceRef)) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced figure carries no sourceRef",
        "add a sourceRef naming a record in sourceRecords[]");
    }
    if (!isNonEmptyString(figure.locator)) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourced figure carries no locator naming the section it was transcribed from",
        "add a locator naming the section, table, column or footnote");
    }
    var record = findSourceRecord(pack, figure.sourceRef);
    if (record === null) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourceRef names no record in sourceRecords[]",
        "add a SourceRecord whose sourceId equals " + figure.sourceRef);
    }
    var declaredYear = isPlainObject(pack) ? pack.declaredForYear : undefined;
    var editionYear = record.editionYear;
    /* Two separate ways a figure can fail the edition-year judgement, and BOTH refuse.
       An edition dated differently from the declared year is the obvious one. The one that is
       easy to miss is an UNDATED publication: a page carrying no edition year has not thereby
       proven that its figures are year-invariant, it has merely declined to say. A figure from
       such a page ships only with a quoted in-document invariance contrast, and without one it
       refuses even though it was genuinely retrieved. Category is not a basis; plausibility is
       not a basis; a finding about a different publication is not a basis. */
    if (Number.isFinite(declaredYear) && Number.isFinite(editionYear) && editionYear !== declaredYear
      && !isNonEmptyString(figure.yearInvarianceBasis)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the figure comes from an edition dated " + String(editionYear) + " and the declared year is "
          + String(declaredYear) + ", and it carries no quoted invariance basis from the publication's own text",
        "quote the publication's own dating contrast for this component kind as yearInvarianceBasis, or retrieve the figure from the declared year's edition; category and plausibility are not a basis");
    }
    if (!Number.isFinite(editionYear) && !isNonEmptyString(figure.yearInvarianceBasis)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the figure was retrieved from a publication that declares no edition year, and it carries no quoted invariance basis from that publication's own text",
        "quote the publication's own text establishing that this component kind is not scoped to a publication year, or retrieve the figure from a dated edition; an undated page has not established invariance merely by declining to state a year");
    }
    return Object.freeze({
      origin: "sourced",
      title: record.title,
      url: record.url,
      retrievedAt: record.retrievedAt,
      editionYear: Number.isFinite(editionYear) ? editionYear : null,
      locator: figure.locator,
      sourceRef: figure.sourceRef,
      yearInvarianceBasis: isNonEmptyString(figure.yearInvarianceBasis) ? figure.yearInvarianceBasis : null
    });
  }

  /* A declared figure carries no citation and says so, so a reader can never mistake the
     household's own statement reading for an authority's published figure. */
  function declaredOrigin(member) {
    return Object.freeze({
      origin: "declared-by-the-household",
      member: member,
      citation: null,
      statedFact: "This figure is the household's own declaration. It carries no citation because no authority published it."
    });
  }

  function unretrievedRule(memberName, domain) {
    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
      "the resolved benefit pack carries no retrieved value for " + memberName,
      "retrieve " + memberName + " from its primary source and transcribe it with a locator and a retrievedAt; no value is derived, interpolated or recalled in its place");
  }

  /* A per-month factor expressed the way its source expresses it — a fraction OF one percent —
     rather than as a decimal the publication never prints. Transcribing `5` and `9` is a
     transcription; transcribing `0.00555556` is a derivation, and the two are not the same
     claim. */
  function monthlyFactorValue(factor) {
    if (!isPlainObject(factor)) return null;
    if (!Number.isFinite(factor.numerator) || !Number.isFinite(factor.denominator)) return null;
    if (factor.denominator === 0) return null;
    if (!Number.isFinite(factor.ofPercent)) return null;
    return (factor.numerator / factor.denominator) * (factor.ofPercent / 100);
  }

  /* Truncation toward the next LOWER multiple, which is the operation the sourced rounding rules
     name. It is applied only where a rule was retrieved that names it; where no rule was
     retrieved the raw quotient is published and the absence is stated. */
  function truncateDownToMultiple(value, multiple) {
    if (!Number.isFinite(value) || !Number.isFinite(multiple) || multiple <= 0) return value;
    return Math.floor((value + Number.EPSILON * Math.abs(value)) / multiple) * multiple;
  }

  /* ---------- The two-origin basis. FR-024-001 and FR-024-002. ---------- */

  /* The whole of the two-origin rule. Exactly one origin settles; neither and both each refuse
     under `RLTAX-INPUT-INCOMPLETE`, and the two refusals are told apart by their CONTRACT SHAPE —
     `acceptedDeclarations` on the neither case, `ambiguousDeclarations` on the both case — rather
     than by their message text, so a copy edit cannot collapse one into the other.

     There is no precedence branch. A household that declared both is not resolved by preferring
     the statement amount, or the earnings record, or the more recent one: it is refused, and the
     refusal carries no benefit amount computed from either declaration. */
  function resolveBenefitBasis(declaration) {
    if (!isPlainObject(declaration)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:declaration",
        "no benefit declaration was supplied",
        "declare exactly one of: " + ACCEPTED_DECLARATIONS.join(", "));
    }
    var statement = declaration.statementPrimaryInsuranceAmount;
    var earnings = declaration.declaredEarnings;
    var hasStatement = isFiniteNonNegative(statement);
    var hasEarnings = Array.isArray(earnings) && earnings.length > 0;

    if (!hasStatement && !hasEarnings) {
      var neither = rules.unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:neither-origin-declared",
        "neither benefit origin is declared: no Primary Insurance Amount was read off a Social Security statement and no earnings record was supplied",
        "declare exactly one of: " + ACCEPTED_DECLARATIONS.join(", ") + "; neither is defaulted and no typical amount is shown in their place");
      return Object.freeze({
        contractVersion: neither.contractVersion,
        code: neither.code,
        domain: neither.domain,
        reason: neither.reason,
        whatWouldMakeItAvailable: neither.whatWouldMakeItAvailable,
        acceptedDeclarations: ACCEPTED_DECLARATIONS,
        declaredOriginCount: 0
      });
    }
    if (hasStatement && hasEarnings) {
      var both = rules.unavailable("RLTAX-INPUT-INCOMPLETE", "benefit-basis:both-origins-declared",
        "both benefit origins are declared, and exactly one is required: a statement Primary Insurance Amount and an earnings record are two different claims about the same figure and neither takes precedence over the other",
        "withdraw one of: " + ACCEPTED_DECLARATIONS.join(", ") + "; no figure is computed from either while both stand");
      return Object.freeze({
        contractVersion: both.contractVersion,
        code: both.code,
        domain: both.domain,
        reason: both.reason,
        whatWouldMakeItAvailable: both.whatWouldMakeItAvailable,
        ambiguousDeclarations: ACCEPTED_DECLARATIONS,
        declaredOriginCount: 2
      });
    }
    if (hasStatement) {
      return Object.freeze({
        contractVersion: BASIS_CONTRACT,
        basisOrigin: BASIS_ORIGINS[0],
        declaredTaxYear: declaration.declaredTaxYear,
        origin: declaredOrigin("statementPrimaryInsuranceAmount"),
        primaryInsuranceAmount: statement
      });
    }
    return Object.freeze({
      contractVersion: BASIS_CONTRACT,
      basisOrigin: BASIS_ORIGINS[1],
      declaredTaxYear: declaration.declaredTaxYear,
      origin: declaredOrigin("declaredEarnings"),
      declaredEarnings: Object.freeze(earnings.slice())
    });
  }

  /* ---------- The computed origin. FR-024-003. ---------- */

  /* Average indexed monthly earnings, from the household's DECLARED record and the pack's SOURCED
     indexing series. Each nominal amount is multiplied by the factor the source defines — the
     wage index for the year the claimant attains the sourced indexing age, divided by the wage
     index for that earning year — and the factor is one at and after the indexing year, which the
     source states rather than this module assuming.

     An earning year outside the series' own declared domain refuses through the shared sourced
     row lookup. No factor is extrapolated from the nearest year present. */
  function computeAverageIndexedMonthlyEarnings(declaredEarnings, birthYear, pack) {
    var domain = "benefit:average-indexed-monthly-earnings";
    if (!isPlainObject(pack)) return unretrievedRule("the benefit pack", domain);
    var indexingRule = pack.indexingRule;
    if (!isPlainObject(indexingRule)) return unretrievedRule("indexingRule", domain);
    if (rules.isAbsentFigure(indexingRule)) return rules.absentFigureRefusal(indexingRule, domain);
    var series = pack.wageIndexingSeries;
    if (!isPlainObject(series)) return unretrievedRule("wageIndexingSeries", domain);
    if (rules.isAbsentFigure(series)) return rules.absentFigureRefusal(series, domain);
    if (!Number.isFinite(indexingRule.indexingAgeYears) || !Number.isFinite(indexingRule.highestYearsCount)
      || !Number.isFinite(indexingRule.monthsDivisor)) {
      return unretrievedRule("indexingRule.indexingAgeYears, indexingRule.highestYearsCount and indexingRule.monthsDivisor", domain);
    }
    if (!Number.isFinite(birthYear)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no birth year is declared, so the year the claimant attains the sourced indexing age cannot be established",
        "declare the birth year; the indexing year is not inferred from any other declaration");
    }
    var ruleCitation = citationFor(pack, indexingRule, domain + ":indexingRule");
    if (rules.isUnavailable(ruleCitation)) return ruleCitation;
    var seriesCitation = citationFor(pack, series, domain + ":wageIndexingSeries");
    if (rules.isUnavailable(seriesCitation)) return seriesCitation;

    var indexingYear = birthYear + indexingRule.indexingAgeYears;
    var indexingLookup = rules.lookupSourcedRow(series, indexingYear, domain + ":indexing-year");
    if (rules.isUnavailable(indexingLookup)) return indexingLookup;
    var indexingYearWageIndex = indexingLookup.row.wageIndex;
    if (!Number.isFinite(indexingYearWageIndex) || indexingYearWageIndex <= 0) {
      return unretrievedRule("the wage index for the indexing year " + String(indexingYear), domain);
    }

    var indexed = [];
    var index = 0;
    for (index = 0; index < declaredEarnings.length; index += 1) {
      var entry = declaredEarnings[index];
      if (!isPlainObject(entry) || !Number.isFinite(entry.year) || !isFiniteNonNegative(entry.amount)) {
        return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
          "an entry in the declared earnings record does not carry a year and a non-negative amount",
          "declare each earnings entry as { year, amount }");
      }
      var factor = 1;
      var factorBasis = "at-or-after-indexing-year";
      if (entry.year < indexingYear) {
        var yearLookup = rules.lookupSourcedRow(series, entry.year, domain + ":earning-year:" + String(entry.year));
        if (rules.isUnavailable(yearLookup)) return yearLookup;
        var yearWageIndex = yearLookup.row.wageIndex;
        if (!Number.isFinite(yearWageIndex) || yearWageIndex <= 0) {
          return unretrievedRule("the wage index for the earning year " + String(entry.year), domain);
        }
        factor = indexingYearWageIndex / yearWageIndex;
        factorBasis = "indexing-year-wage-index-divided-by-earning-year-wage-index";
      }
      indexed.push(Object.freeze({
        year: entry.year,
        nominalEarnings: entry.amount,
        indexingFactor: factor,
        factorBasis: factorBasis,
        indexedEarnings: entry.amount * factor
      }));
    }

    var ranked = indexed.slice().sort(function (left, right) {
      return right.indexedEarnings - left.indexedEarnings;
    });
    var counted = ranked.slice(0, indexingRule.highestYearsCount);
    var countedTotal = 0;
    for (index = 0; index < counted.length; index += 1) countedTotal += counted[index].indexedEarnings;
    var countedYears = [];
    for (index = 0; index < counted.length; index += 1) countedYears.push(counted[index].year);

    /* The rounding applied to the quotient. This is REQUIRED rather than optional, and an
       AbsentFigure here refuses the computed origin outright.

       The temptation is to publish the exact quotient and call the missing rule a stated
       limitation. That is wrong here, and the difference matters: the quotient rounding moves the
       Primary Insurance Amount, so publishing an unrounded quotient does not produce a figure
       with a caveat, it produces a DIFFERENT BENEFIT — one that disagrees with the authority's
       own worked example. A benefit figure that is plausible and wrong is the exact defect the
       sourcing rule exists to prevent, so the correct outcome is a refusal on a figure this
       module is holding. The declared origin is untouched by it. */
    var roundingRule = indexingRule.quotientRounding;
    if (!isPlainObject(roundingRule)) return unretrievedRule("indexingRule.quotientRounding", domain);
    if (rules.isAbsentFigure(roundingRule)) {
      return rules.absentFigureRefusal(roundingRule, domain + ":quotientRounding");
    }
    if (!Number.isFinite(roundingRule.multiple)) {
      return unretrievedRule("indexingRule.quotientRounding.multiple", domain);
    }
    var roundingCitation = citationFor(pack, roundingRule, domain + ":quotientRounding");
    if (rules.isUnavailable(roundingCitation)) return roundingCitation;
    var value = truncateDownToMultiple(countedTotal / indexingRule.monthsDivisor, roundingRule.multiple);
    var roundingApplied = Object.freeze({
      multiple: roundingRule.multiple,
      before: countedTotal / indexingRule.monthsDivisor,
      citation: roundingCitation
    });

    return Object.freeze({
      contractVersion: AIME_CONTRACT,
      indexingYear: indexingYear,
      indexingAgeYears: indexingRule.indexingAgeYears,
      indexingYearWageIndex: indexingYearWageIndex,
      highestYearsCount: indexingRule.highestYearsCount,
      monthsDivisor: indexingRule.monthsDivisor,
      indexedEarnings: Object.freeze(indexed),
      countedYears: Object.freeze(countedYears.slice().sort()),
      countedTotal: countedTotal,
      quotientRoundingApplied: roundingApplied,
      citations: Object.freeze([ruleCitation, seriesCitation, roundingCitation]),
      value: value,
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable"
    });
  }

  /* The Primary Insurance Amount. Each sourced percentage is applied to the portion its OWN
     declared breakpoint delimits — never to the whole, and never to a portion delimited by a
     breakpoint this module remembers. A tier declares its own lower and upper edge and its own
     percentage, and every one of the three is read from the pack and published with its citation,
     so a fixture pack with deliberately non-standard breakpoints produces a different answer and
     a recalled figure cannot pass. */
  function computePrimaryInsuranceAmount(basis, pack) {
    var domain = "benefit:primary-insurance-amount";
    if (rules.isUnavailable(basis)) return basis;
    if (!rules.isBenefitBasis(basis)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no resolved benefit basis was supplied",
        "resolve the benefit basis before computing the Primary Insurance Amount");
    }
    if (basis.basisOrigin === BASIS_ORIGINS[0]) {
      /* The household read this figure off its own statement. It is published unchanged, labelled
         as the household's own input, and it carries no citation — deliberately, because none
         exists. The computed path's unavailability never degrades it. */
      return Object.freeze({
        contractVersion: PIA_CONTRACT,
        basisOrigin: basis.basisOrigin,
        origin: basis.origin,
        averageIndexedMonthlyEarnings: null,
        tiersApplied: Object.freeze([]),
        citations: Object.freeze([]),
        roundingApplied: null,
        value: basis.primaryInsuranceAmount,
        ruleStatus: isPlainObject(pack) && isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable"
      });
    }
    if (!isPlainObject(pack)) return unretrievedRule("the benefit pack", domain);
    var bendPointSet = pack.bendPointSet;
    if (!isPlainObject(bendPointSet)) return unretrievedRule("bendPointSet", domain);
    if (rules.isAbsentFigure(bendPointSet)) return rules.absentFigureRefusal(bendPointSet, domain);
    if (!Array.isArray(bendPointSet.tiers) || bendPointSet.tiers.length === 0) {
      return unretrievedRule("bendPointSet.tiers", domain);
    }
    var aime = computeAverageIndexedMonthlyEarnings(basis.declaredEarnings, basis.birthYear, pack);
    if (rules.isUnavailable(aime)) return aime;

    var citations = [];
    var applied = [];
    var total = 0;
    var index = 0;
    for (index = 0; index < bendPointSet.tiers.length; index += 1) {
      var tier = bendPointSet.tiers[index];
      if (!isPlainObject(tier)) return unretrievedRule("bendPointSet.tiers[" + index + "]", domain);
      if (rules.isAbsentFigure(tier)) return rules.absentFigureRefusal(tier, domain + ":tier:" + String(tier.tierId));
      if (!Number.isFinite(tier.percentage) || !Number.isFinite(tier.lowerInclusive)) {
        return unretrievedRule("the percentage and lower breakpoint of tier " + String(tier.tierId), domain);
      }
      var tierCitation = citationFor(pack, tier, domain + ":tier:" + String(tier.tierId));
      if (rules.isUnavailable(tierCitation)) return tierCitation;
      citations.push(tierCitation);
      /* The portion THIS tier's own breakpoints delimit, and nothing else. An implementation
         applying a percentage to the whole would produce a different figure here and is proven
         to fail against the non-standard fixture. */
      var upper = Number.isFinite(tier.upperInclusive) ? tier.upperInclusive : Infinity;
      var portion = Math.max(0, Math.min(aime.value, upper) - tier.lowerInclusive);
      var contribution = portion * tier.percentage;
      total += contribution;
      applied.push(Object.freeze({
        tierId: tier.tierId,
        percentage: tier.percentage,
        lowerInclusive: tier.lowerInclusive,
        upperInclusive: Number.isFinite(tier.upperInclusive) ? tier.upperInclusive : null,
        portion: portion,
        contribution: contribution,
        comparison: rules.comparisonRecord("tier-" + String(tier.tierId) + "-reached",
          aime.value, "greater-than", tier.lowerInclusive, aime.value > tier.lowerInclusive),
        citation: tierCitation
      }));
    }

    var rounding = bendPointSet.roundingRule;
    var roundingApplied = null;
    var value = total;
    if (isPlainObject(rounding) && !rules.isAbsentFigure(rounding)) {
      if (!Number.isFinite(rounding.multiple)) return unretrievedRule("bendPointSet.roundingRule.multiple", domain);
      var roundingCitation = citationFor(pack, rounding, domain + ":roundingRule");
      if (rules.isUnavailable(roundingCitation)) return roundingCitation;
      citations.push(roundingCitation);
      value = truncateDownToMultiple(total, rounding.multiple);
      roundingApplied = Object.freeze({ multiple: rounding.multiple, before: total, citation: roundingCitation });
    }

    return Object.freeze({
      contractVersion: PIA_CONTRACT,
      basisOrigin: basis.basisOrigin,
      origin: basis.origin,
      averageIndexedMonthlyEarnings: aime,
      tiersApplied: Object.freeze(applied),
      citations: Object.freeze(citations),
      roundingApplied: roundingApplied,
      value: value,
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable"
    });
  }

  /* ---------- The full retirement age. FR-024-004. ---------- */

  /* The full retirement age, read from the sourced table row for the DECLARED birth year through
     the shared sourced row lookup. A birth year outside the table's own declared domain refuses
     and NEVER falls through to an adjacent row: an adjacent row would produce a plausible wrong
     age, and every later figure in this scope is a function of it. */
  function resolveFullRetirementAge(birthYear, pack) {
    var domain = "benefit:full-retirement-age";
    if (!isPlainObject(pack)) return unretrievedRule("the benefit pack", domain);
    var table = pack.fullRetirementAgeTable;
    if (!isPlainObject(table)) return unretrievedRule("fullRetirementAgeTable", domain);
    if (rules.isAbsentFigure(table)) return rules.absentFigureRefusal(table, domain);
    if (!Number.isFinite(birthYear)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no birth year is declared, so no row of the sourced full-retirement-age table can be selected",
        "declare the birth year; no row is chosen by default and no typical age is shown");
    }
    var tableCitation = citationFor(pack, table, domain + ":table");
    if (rules.isUnavailable(tableCitation)) return tableCitation;
    var lookup = rules.lookupSourcedRow(table, birthYear, domain);
    if (rules.isUnavailable(lookup)) return lookup;
    var row = lookup.row;
    if (!Number.isFinite(row.ageYears) || !Number.isFinite(row.ageMonths)) {
      return unretrievedRule("the age on the full-retirement-age row for birth year " + String(birthYear), domain);
    }
    return Object.freeze({
      contractVersion: FRA_CONTRACT,
      birthYear: birthYear,
      rowId: row.rowId,
      rowKeyFrom: Number.isFinite(row.keyFrom) ? row.keyFrom : null,
      rowKeyTo: Number.isFinite(row.keyTo) ? row.keyTo : null,
      ageYears: row.ageYears,
      ageMonths: row.ageMonths,
      totalMonths: (row.ageYears * MONTHS_PER_YEAR) + row.ageMonths,
      declaredDomain: table.declaredDomain,
      applicabilityNote: isNonEmptyString(table.applicabilityNote) ? table.applicabilityNote : null,
      citation: tableCitation,
      lookup: lookup,
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable"
    });
  }

  /* ---------- The claim-age adjustment. FR-024-005. ---------- */

  /* The months counted and the factor applied to EACH of them, published rather than folded into
     one multiplier. Two things follow from publishing them: the early reduction's two sourced
     segments are separately checkable against the source, and the delayed credit's bound is
     visible as a bound rather than as an answer that happens to stop changing.
     
     The delayed credit accrues only to the sourced stopping age. A claim age beyond it accrues no
     further credit and the record SAYS the bound applied, so a reader is never left inferring
     from a flat number whether the model stopped or simply had nothing more to add. */
  function applyClaimAgeAdjustment(primaryInsuranceAmount, birthYear, claimAgeMonths, pack) {
    var domain = "benefit:claim-age-adjustment";
    if (rules.isUnavailable(primaryInsuranceAmount)) return primaryInsuranceAmount;
    if (!isPlainObject(primaryInsuranceAmount) || !Number.isFinite(primaryInsuranceAmount.value)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no Primary Insurance Amount was settled, so no claim-age adjustment can be applied to it",
        "settle the Primary Insurance Amount from exactly one declared origin first");
    }
    if (!Number.isFinite(claimAgeMonths) || claimAgeMonths < 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", domain,
        "no claim age is declared, so the months between it and the full retirement age cannot be counted",
        "declare the claim age in whole months; no claim age is assumed");
    }
    var fra = resolveFullRetirementAge(birthYear, pack);
    if (rules.isUnavailable(fra)) return fra;

    var comparisons = [];
    var factors = [];
    var monthsCounted = 0;
    var direction = rules.CLAIM_AGE_DIRECTIONS[1];
    var multiplier = 1;
    var creditBound = false;
    var citations = [fra.citation];
    var index = 0;

    comparisons.push(rules.comparisonRecord("claim-age-before-full-retirement-age",
      claimAgeMonths, "less-than", fra.totalMonths, claimAgeMonths < fra.totalMonths));
    comparisons.push(rules.comparisonRecord("claim-age-after-full-retirement-age",
      claimAgeMonths, "greater-than", fra.totalMonths, claimAgeMonths > fra.totalMonths));

    if (claimAgeMonths < fra.totalMonths) {
      direction = rules.CLAIM_AGE_DIRECTIONS[0];
      var reduction = pack.earlyReductionRule;
      if (!isPlainObject(reduction)) return unretrievedRule("earlyReductionRule", domain);
      if (rules.isAbsentFigure(reduction)) return rules.absentFigureRefusal(reduction, domain + ":earlyReductionRule");
      var reductionCitation = citationFor(pack, reduction, domain + ":earlyReductionRule");
      if (rules.isUnavailable(reductionCitation)) return reductionCitation;
      citations.push(reductionCitation);
      var firstSegmentMonths = reduction.firstSegmentMonths;
      var firstFactor = monthlyFactorValue(reduction.firstSegmentMonthlyFactor);
      var laterFactor = monthlyFactorValue(reduction.additionalMonthlyFactor);
      if (!Number.isFinite(firstSegmentMonths) || firstFactor === null || laterFactor === null) {
        return unretrievedRule("earlyReductionRule.firstSegmentMonths and both per-month factors", domain);
      }
      /* The bound the early rule states, applied as a bound. The delayed rule has always carried
         its stopping age as a structured field and the engine has always honoured it; the early
         rule stated its own maximum only in prose, so nothing compared a claim age against it and
         the factors were applied once per month for as many months as the arithmetic allowed.
         Below the declared earliest age this REFUSES rather than clamping: pricing a claim at
         sixty as a claim at sixty-two would answer a question the household did not ask with a
         number that looks like an answer to the one they did. */
      var earliest = reduction.earliestClaimAge;
      if (!isPlainObject(earliest)) return unretrievedRule("earlyReductionRule.earliestClaimAge", domain);
      if (rules.isAbsentFigure(earliest)) {
        return rules.absentFigureRefusal(earliest, domain + ":earlyReductionRule.earliestClaimAge");
      }
      if (!Number.isFinite(earliest.ageYears)) {
        return unretrievedRule("earlyReductionRule.earliestClaimAge.ageYears", domain);
      }
      var earliestCitation = citationFor(pack, earliest, domain + ":earlyReductionRule.earliestClaimAge");
      if (rules.isUnavailable(earliestCitation)) return earliestCitation;
      citations.push(earliestCitation);
      var earliestMonths = earliest.ageYears * MONTHS_PER_YEAR;
      comparisons.push(rules.comparisonRecord("claim-age-below-earliest-priceable-age",
        claimAgeMonths, "less-than", earliestMonths, claimAgeMonths < earliestMonths));
      if (claimAgeMonths < earliestMonths) {
        return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", BELOW_EARLIEST_CLAIM_AGE_DOMAIN,
          "the declared claim age of " + String(claimAgeMonths)
            + " months is below the earliest claim age this pack declares, " + String(earliestMonths)
            + " months, which is age " + String(earliest.ageYears) + " as stated by "
            + String(earliestCitation.title) + " at " + String(earliestCitation.locator)
            + ", so no reduction this pack states reaches it and no monthly or annual amount is settled",
          "declare a claim age of at least " + String(earliestMonths)
            + " months; the reduction is NOT clamped to the pack's declared maximum and the earliest "
            + "priceable age is NOT substituted, because pricing this claim age as that one would answer "
            + "a question that was not asked, and no zero stands in for the amount either");
      }
      monthsCounted = fra.totalMonths - claimAgeMonths;
      var reductionTotal = 0;
      for (index = 0; index < monthsCounted; index += 1) {
        var withinFirstSegment = index < firstSegmentMonths;
        var monthFactor = withinFirstSegment ? firstFactor : laterFactor;
        reductionTotal += monthFactor;
        factors.push(Object.freeze({
          monthOrdinal: index + 1,
          segmentId: withinFirstSegment ? "first-segment" : "additional-months",
          factor: monthFactor,
          factorAsDeclared: withinFirstSegment
            ? reduction.firstSegmentMonthlyFactor
            : reduction.additionalMonthlyFactor,
          citation: reductionCitation
        }));
      }
      comparisons.push(rules.comparisonRecord("months-counted-beyond-first-segment",
        monthsCounted, "greater-than", firstSegmentMonths, monthsCounted > firstSegmentMonths));
      /* Published rather than enforced. The age bound above is what refuses; this states that the
         counted months agree with the maximum the same rule declares, so a reader can see the two
         statements of the bound agree instead of taking the age on trust. */
      if (Number.isFinite(earliest.maximumReductionMonths)) {
        comparisons.push(rules.comparisonRecord("months-counted-within-declared-maximum",
          monthsCounted, "less-than-or-equal", earliest.maximumReductionMonths,
          monthsCounted <= earliest.maximumReductionMonths));
      }
      multiplier = 1 - reductionTotal;
    } else if (claimAgeMonths > fra.totalMonths) {
      direction = rules.CLAIM_AGE_DIRECTIONS[2];
      var credit = pack.delayedCreditRule;
      if (!isPlainObject(credit)) return unretrievedRule("delayedCreditRule", domain);
      if (rules.isAbsentFigure(credit)) return rules.absentFigureRefusal(credit, domain + ":delayedCreditRule");
      if (!Number.isFinite(credit.stoppingAgeYears)) {
        return unretrievedRule("delayedCreditRule.stoppingAgeYears", domain);
      }
      var creditTable = credit.monthlyRateTable;
      if (!isPlainObject(creditTable)) return unretrievedRule("delayedCreditRule.monthlyRateTable", domain);
      if (rules.isAbsentFigure(creditTable)) {
        return rules.absentFigureRefusal(creditTable, domain + ":delayedCreditRule.monthlyRateTable");
      }
      var creditTableCitation = citationFor(pack, creditTable, domain + ":delayedCreditRule.monthlyRateTable");
      if (rules.isUnavailable(creditTableCitation)) return creditTableCitation;
      citations.push(creditTableCitation);
      var creditLookup = rules.lookupSourcedRow(creditTable, birthYear, domain + ":delayed-credit-rate");
      if (rules.isUnavailable(creditLookup)) return creditLookup;
      var creditFactor = monthlyFactorValue(creditLookup.row.monthlyFactor);
      if (creditFactor === null) {
        return unretrievedRule("the per-month delayed credit factor for birth year " + String(birthYear), domain);
      }
      /* The bound the source states, applied as a bound. Credit accrues from the full retirement
         age to the sourced stopping age and no further. */
      var stoppingMonths = credit.stoppingAgeYears * MONTHS_PER_YEAR;
      var creditableTo = Math.min(claimAgeMonths, stoppingMonths);
      creditBound = claimAgeMonths > stoppingMonths;
      monthsCounted = Math.max(0, creditableTo - fra.totalMonths);
      comparisons.push(rules.comparisonRecord("claim-age-beyond-sourced-stopping-age",
        claimAgeMonths, "greater-than", stoppingMonths, creditBound));
      var creditTotal = 0;
      for (index = 0; index < monthsCounted; index += 1) {
        creditTotal += creditFactor;
        factors.push(Object.freeze({
          monthOrdinal: index + 1,
          segmentId: "delayed-credit",
          factor: creditFactor,
          factorAsDeclared: creditLookup.row.monthlyFactor,
          citation: creditTableCitation
        }));
      }
      multiplier = 1 + creditTotal;
    }

    var adjustedMonthly = primaryInsuranceAmount.value * multiplier;
    var benefitRounding = pack.benefitRounding;
    var roundingApplied = null;
    if (isPlainObject(benefitRounding) && !rules.isAbsentFigure(benefitRounding)
      && Number.isFinite(benefitRounding.multiple)) {
      var benefitRoundingCitation = citationFor(pack, benefitRounding, domain + ":benefitRounding");
      if (rules.isUnavailable(benefitRoundingCitation)) return benefitRoundingCitation;
      citations.push(benefitRoundingCitation);
      adjustedMonthly = truncateDownToMultiple(adjustedMonthly, benefitRounding.multiple);
      roundingApplied = Object.freeze({ multiple: benefitRounding.multiple, citation: benefitRoundingCitation });
    }

    return Object.freeze({
      contractVersion: ADJUSTMENT_CONTRACT,
      birthYear: birthYear,
      claimAgeMonths: claimAgeMonths,
      fullRetirementAgeMonths: fra.totalMonths,
      fullRetirementAgeRow: fra,
      direction: direction,
      monthsCounted: monthsCounted,
      factorsApplied: Object.freeze(factors),
      comparisonsPerformed: Object.freeze(comparisons),
      creditBoundByStoppingAge: creditBound,
      stoppingAgeStatedFact: direction === rules.CLAIM_AGE_DIRECTIONS[2] && isPlainObject(pack.delayedCreditRule)
        && isNonEmptyString(pack.delayedCreditRule.stoppingStatement)
        ? pack.delayedCreditRule.stoppingStatement
        : null,
      roundingApplied: roundingApplied,
      primaryInsuranceAmount: primaryInsuranceAmount,
      adjustedMonthlyBenefit: adjustedMonthly,
      adjustedAnnualBenefit: adjustedMonthly * MONTHS_PER_YEAR,
      citations: Object.freeze(citations),
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable"
    });
  }

  /* ---------- The settlement the leg is lifted from. FR-024-006 and FR-024-007. ---------- */

  /* The whole benefit, from one declaration and one resolved pack. Every sourced parameter that
     entered it is published with its citation and its locator, and an unretrieved parameter is
     carried through as a refusal rather than as a zero benefit. */
  function computeBenefitSettlement(declaration, pack) {
    var basis = resolveBenefitBasis(declaration);
    if (rules.isUnavailable(basis)) return basis;
    var enriched = Object.freeze({
      contractVersion: basis.contractVersion,
      basisOrigin: basis.basisOrigin,
      declaredTaxYear: basis.declaredTaxYear,
      origin: basis.origin,
      primaryInsuranceAmount: basis.primaryInsuranceAmount,
      declaredEarnings: basis.declaredEarnings,
      birthYear: isPlainObject(declaration) ? declaration.birthYear : undefined
    });
    var pia = computePrimaryInsuranceAmount(enriched, pack);
    if (rules.isUnavailable(pia)) return pia;
    var adjustment = applyClaimAgeAdjustment(pia, isPlainObject(declaration) ? declaration.birthYear : undefined,
      isPlainObject(declaration) ? declaration.claimAgeMonths : undefined, pack);
    if (rules.isUnavailable(adjustment)) return adjustment;
    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      basisOrigin: basis.basisOrigin,
      origin: basis.origin,
      primaryInsuranceAmount: pia,
      adjustment: adjustment,
      citations: Object.freeze(pia.citations.concat(adjustment.citations)),
      ruleStatus: isNonEmptyString(pack.ruleStatus) ? pack.ruleStatus : "unavailable",
      value: adjustment.adjustedAnnualBenefit
    });
  }

  /* What the benefit leg contributes to a marginal reading. The benefit itself is an amount the
     claim age and the sourced factors decide; an added dollar of income does not move it, and
     saying so explicitly is what keeps a curve consumer from inferring that it does. Whether any
     PART of it becomes taxable is a separate question this scope deliberately does not answer. */
  function benefitMarginalContext(settlement) {
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        contractVersion: "BenefitMarginalContext/v1",
        available: false,
        code: settlement.code,
        movesWithIncome: false,
        reason: settlement.reason
      });
    }
    return Object.freeze({
      contractVersion: "BenefitMarginalContext/v1",
      available: true,
      legId: "social-security-benefit",
      value: settlement.value,
      movesWithIncome: false,
      reason: "The benefit is computed from a declared basis, a declared birth year and a declared claim age against sourced factors. No income figure reaches it, so an added dollar of income cannot move it.",
      ruleStatus: settlement.ruleStatus
    });
  }

  /* The leg set this stage may publish, read from the PACK's declared leg set rather than from a
     list in this module. A leg the pack does not declare is not emitted, and a leg the pack
     declares that this engine cannot compute refuses by name. */
  function declaredBenefitLegs(pack) {
    if (!isPlainObject(pack) || !Array.isArray(pack.declaredLegs)) return Object.freeze([]);
    return Object.freeze(pack.declaredLegs.slice());
  }

  var api = Object.freeze({
    ACCEPTED_DECLARATIONS: ACCEPTED_DECLARATIONS,
    AIME_CONTRACT: AIME_CONTRACT,
    BASIS_CONTRACT: BASIS_CONTRACT,
    BASIS_ORIGINS: BASIS_ORIGINS,
    ADJUSTMENT_CONTRACT: ADJUSTMENT_CONTRACT,
    BELOW_EARLIEST_CLAIM_AGE_DOMAIN: BELOW_EARLIEST_CLAIM_AGE_DOMAIN,
    FRA_CONTRACT: FRA_CONTRACT,
    PIA_CONTRACT: PIA_CONTRACT,
    SETTLEMENT_CONTRACT: SETTLEMENT_CONTRACT,
    applyClaimAgeAdjustment: applyClaimAgeAdjustment,
    benefitMarginalContext: benefitMarginalContext,
    citationFor: citationFor,
    computeAverageIndexedMonthlyEarnings: computeAverageIndexedMonthlyEarnings,
    computeBenefitSettlement: computeBenefitSettlement,
    computePrimaryInsuranceAmount: computePrimaryInsuranceAmount,
    declaredBenefitLegs: declaredBenefitLegs,
    declaredOrigin: declaredOrigin,
    monthlyFactorValue: monthlyFactorValue,
    resolveBenefitBasis: resolveBenefitBasis,
    resolveFullRetirementAge: resolveFullRetirementAge,
    truncateDownToMultiple: truncateDownToMultiple
  });

  root.RLTAXSOCIALSECURITY = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
