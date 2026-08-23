/* Lifetime Tax Strategy Lab — the deterministic annual federal settlement, CO-1 through CO-9.
 *
 * This module owns the calculation order and nothing else. It declares NO bracket, NO rate, NO
 * band edge, NO deduction amount and NO threshold: every such value is read from the resolved
 * rule pack. It performs no storage access and no DOM access, and it reads no clock, so the
 * same input always produces the same result.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAX");

  /* Feature 023 Scope 01. The property engine is a SEPARATE module and this module is its
     production consumer: stage CO-15 delegates the whole property settlement to it rather than
     reimplementing an assessment rule here. The require path carries its file extension so the
     dependency is greppable by the deploy-parity projection, which decides whether a shared
     module ships by asking whether anything shipped references it BY FILENAME. */
  var property = root.RLTAXPROPERTY;
  if (!property && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    property = require("./rltaxproperty.js");
  }
  if (!property) throw new Error("RLTAXPROPERTY must be loaded before RLTAX");

  /* Feature 023 Scope 03. The rental engine is likewise a SEPARATE module and this module is
     its production consumer: stage CO-17 delegates the whole rental settlement to it. The
     require path carries its file extension for the same reason the property one does. */
  var rental = root.RLTAXRENTAL;
  if (!rental && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    rental = require("./rltaxrental.js");
  }
  if (!rental) throw new Error("RLTAXRENTAL must be loaded before RLTAX");

  /* Feature 023 Scope 04. The dwelling-use engine, likewise a SEPARATE module with this module
     as its production consumer: stage CO-16 delegates the whole classification to it, and CO-17
     is routed by the record CO-16 published rather than by the day counts a second time. */
  var use = root.RLTAXUSE;
  if (!use && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    use = require("./rltaxuse.js");
  }
  if (!use) throw new Error("RLTAXUSE must be loaded before RLTAX");

  /* Feature 023 Scope 05. `rltaxdisposition.js` owns the gain split and the residence exclusion;
     its production consumer is stage CO-19, which delegates the whole settlement to it. The
     REMAINDER component is priced here rather than there, by handing it to the preferential
     model this file already owns, which is what keeps the stacking arithmetic in exactly one
     place. */
  var disposition = root.RLTAXDISPOSITION;
  if (!disposition && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    disposition = require("./rltaxdisposition.js");
  }
  if (!disposition) throw new Error("RLTAXDISPOSITION must be loaded before RLTAX");

  /* Feature 024 Scope 01. The Social Security benefit engine, likewise a SEPARATE module with
     this module as its production consumer: stage CO-20 delegates the whole benefit settlement to
     it. It is deliberately reached through the benefit PACK rather than through the federal pack,
     because establishing what a benefit IS must not require an income-tax pack edit. */
  var socialsecurity = root.RLTAXSOCIALSECURITY;
  if (!socialsecurity && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    socialsecurity = require("./rltaxsocialsecurity.js");
  }
  if (!socialsecurity) throw new Error("RLTAXSOCIALSECURITY must be loaded before RLTAX");

  /* Feature 024 Scope 02. The inclusion engine, likewise a SEPARATE module with this module as
     its production consumer: stage CO-21 delegates the whole inclusion settlement to it. Unlike
     the benefit engine it is reached through the FEDERAL pack, because what a benefit IS and how
     much of it a federal return picks up are questions for two different authorities. */
  var inclusion = root.RLTAXINCLUSION;
  if (!inclusion && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    inclusion = require("./rltaxinclusion.js");
  }
  if (!inclusion) throw new Error("RLTAXINCLUSION must be loaded before RLTAX");

  /* Feature 024 Scope 03. The claim-age comparison engine, likewise a SEPARATE module with this
     module as its production consumer: stage CO-23 delegates the whole comparison to it. It is
     reached through the MORTALITY pack and the BENEFIT pack and never through the federal pack,
     because comparing claim ages touches no tax total — and a signature that could see the
     federal pack would eventually be used as though it did. */
  var claimage = root.RLTAXCLAIMAGE;
  if (!claimage && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    claimage = require("./rltaxclaimage.js");
  }
  if (!claimage) throw new Error("RLTAXCLAIMAGE must be loaded before RLTAX");

  /* Feature 024 Scope 04. The Medicare premium engine, likewise a SEPARATE module with this
     module as its production consumer: stage CO-22 delegates the whole premium settlement to it.
     It is reached through the MEDICARE pack alone. That is not a packaging preference: the
     adjustment is set by an income figure from a year this settlement is deliberately not
     settling, and a module that could see the federal pack — or this file's settlement result —
     would be one identifier away from reading the current year's measure instead. The separation
     is what FR-024-023 asks for, and it is visible in the import list rather than promised. */
  var medicare = root.RLTAXMEDICARE;
  if (!medicare && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    medicare = require("./rltaxmedicare.js");
  }
  if (!medicare) throw new Error("RLTAXMEDICARE must be loaded before RLTAX");

  var RESULT_CONTRACT = "AnnualFederalTaxResult/v1";
  var CURVE_CONTRACT = "EffectiveMarginalCurve/v1";
  var DISPLAY_CONTRACT = "lifetime-tax-display-value/v1";

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function valued(value, ruleStatus, extra) {
    var record = { value: value, ruleStatus: ruleStatus };
    if (isPlainObject(extra)) {
      var keys = Object.keys(extra);
      var index = 0;
      for (index = 0; index < keys.length; index += 1) record[keys[index]] = extra[keys[index]];
    }
    return Object.freeze(record);
  }

  function bandUpperBound(band) {
    return band.upperExclusive === null ? Infinity : band.upperExclusive;
  }

  /* CO-2. The applied amount AND the mode that produced it are both published, so the deduction
     is displayed rather than inferred. There is no default mode. */
  function selectDeduction(workspace, pack) {
    if (workspace.deductionMode === null || workspace.deductionMode === undefined) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "deduction:mode",
        "no deduction mode was declared",
        "declare standard or itemized; no default mode is applied");
    }
    if (workspace.deductionMode === "itemized") {
      if (!Number.isFinite(workspace.itemizedAmount) || workspace.itemizedAmount < 0) {
        return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "deduction:itemizedAmount",
          "the itemised mode was declared with no finite non-negative itemised amount",
          "supply the itemised total the household is claiming");
      }
      return valued(workspace.itemizedAmount, rules.ruleStatusFor(pack, workspace),
        { mode: "itemized", sourceRef: null });
    }
    var figure = pack.standardDeductions[workspace.filingStatus];
    if (rules.isAbsentFigure(figure)) {
      return rules.absentFigureRefusal(figure, "deduction:standard:" + workspace.filingStatus);
    }
    return valued(figure.amount, rules.ruleStatusFor(pack, figure),
      { mode: "standard", sourceRef: figure.sourceRef, locator: figure.locator });
  }

  /* CO-1 gross, CO-3 total taxable income, CO-4 preferential taxable income, CO-5 ordinary
     taxable income. The deduction is applied to TOTAL income, and the preferential amount is
     then carved out of the top rather than taxed in isolation. */
  function computeTaxableIncome(workspace, pack) {
    var income = workspace.income;
    var kinds = rules.SUPPORTED_INCOME_KINDS;
    var index = 0;
    for (index = 0; index < kinds.length; index += 1) {
      var field = rules.INCOME_KIND_FIELDS[kinds[index]];
      if (!Number.isFinite(income[field]) || income[field] < 0) {
        return rules.unavailable("RLTAX-INCOME-KIND-UNSUPPORTED", "income:" + kinds[index],
          "the declared amount for this income kind is not a finite non-negative number",
          "supply a finite non-negative amount for " + kinds[index]);
      }
    }
    var preferentialIncome = 0;
    for (index = 0; index < rules.PREFERENTIAL_INCOME_KINDS.length; index += 1) {
      preferentialIncome += income[rules.INCOME_KIND_FIELDS[rules.PREFERENTIAL_INCOME_KINDS[index]]];
    }
    /* Tax-exempt interest is retained as a recorded input and excluded from gross. */
    var gross = income.ordinary + preferentialIncome;
    var deduction = selectDeduction(workspace, pack);
    if (rules.isUnavailable(deduction)) {
      return Object.freeze({
        ok: false,
        grossSupportedIncome: gross,
        taxExemptInterestRecorded: income.taxExemptInterest,
        appliedDeduction: deduction
      });
    }
    var totalTaxable = Math.max(0, gross - deduction.value);
    var preferentialTaxable = Math.min(preferentialIncome, totalTaxable);
    var ordinaryTaxable = totalTaxable - preferentialTaxable;
    return Object.freeze({
      ok: true,
      grossSupportedIncome: gross,
      taxExemptInterestRecorded: income.taxExemptInterest,
      appliedDeduction: deduction,
      preferentialIncome: preferentialIncome,
      totalTaxableIncome: totalTaxable,
      preferentialTaxableIncome: preferentialTaxable,
      ordinaryTaxableIncome: ordinaryTaxable
    });
  }

  /* CO-6. Walk the ordinary bands: each band [lo, hi) at rate r taxes max(0, min(amount, hi) - lo).
     An amount exactly equal to an edge sits in the band whose lowerInclusive is that edge and
     contributes zero dollars to it. */
  function applyRateTable(amount, table) {
    var total = 0;
    var detail = [];
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      var band = table.bands[index];
      var upper = bandUpperBound(band);
      var taxed = Math.max(0, Math.min(amount, upper) - band.lowerInclusive);
      var bandTax = band.rate * taxed;
      total += bandTax;
      detail.push(Object.freeze({
        bandId: band.bandId,
        rate: band.rate,
        lowerInclusive: band.lowerInclusive,
        upperExclusive: band.upperExclusive,
        dollarsTaxed: taxed,
        tax: bandTax
      }));
    }
    return Object.freeze({ tax: total, bandDetail: Object.freeze(detail) });
  }

  /* CO-7. Intersect the window [ordinaryTaxableIncome, ordinaryTaxableIncome + preferentialTaxableIncome)
     with each preferential band. The window starts at ordinary taxable income, so the
     preferential amount sits ON TOP of ordinary income rather than starting from zero. Dropping
     the ordinary term would tax the gain in isolation, which is the defect this function exists
     to prevent. */
  function stackPreferentialIncome(ordinaryTaxableIncome, preferentialTaxableIncome, table) {
    var total = 0;
    var detail = [];
    var windowTop = ordinaryTaxableIncome + preferentialTaxableIncome;
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      var band = table.bands[index];
      var upper = bandUpperBound(band);
      var slice = Math.max(0, Math.min(windowTop, upper) - Math.max(ordinaryTaxableIncome, band.lowerInclusive));
      var bandTax = band.rate * slice;
      total += bandTax;
      detail.push(Object.freeze({
        bandId: band.bandId,
        rate: band.rate,
        lowerInclusive: band.lowerInclusive,
        upperExclusive: band.upperExclusive,
        dollarsTaxed: slice,
        tax: bandTax
      }));
    }
    return Object.freeze({ tax: total, bandDetail: Object.freeze(detail) });
  }

  /* A rate table the pack does not carry still prices ZERO taxable dollars at zero. With no
     dollars in that class there is no threshold to look up, so this is arithmetic rather than a
     substituted rate: the refusal is reserved for a household that actually has dollars the
     missing table would have priced. */
  function zeroTaxOnNoTaxableDollars(ruleStatus) {
    return valued(0, ruleStatus, { bandDetail: Object.freeze([]), sourceRef: null, locator: null });
  }

  /* The threshold this filing status faces. A set that does not vary by filing status carries
     one key and the engine uses it for every status, so no engine needs to know that a
     particular jurisdiction's surcharge threshold behaves unusually. */
  function thresholdForStatus(set, filingStatus) {
    if (!isPlainObject(set) || !isPlainObject(set.thresholds)) return null;
    var key = set.varyByFilingStatus === true ? filingStatus : "all";
    var amount = set.thresholds[key];
    return Number.isFinite(amount) ? amount : null;
  }

  /* A declared basis the household has not supplied. `null` is undeclared and refuses by name;
     a declared `0` is a real statement and computes a real zero. The two are never merged,
     because a confident-looking zero in place of a refusal is the substitution this feature
     exists to prevent. */
  function declaredBasis(workspace, containerName, memberName) {
    var container = isPlainObject(workspace) ? workspace[containerName] : null;
    var amount = isPlainObject(container) ? container[memberName] : undefined;
    if (Number.isFinite(amount) && amount >= 0) return amount;
    return null;
  }

  function undeclaredBasisRefusal(containerName, memberName, legDomain) {
    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", legDomain,
      "the household has not declared " + containerName + "." + memberName +
      ", and an undeclared basis is not a zero",
      "declare " + containerName + "." + memberName +
      "; a zero is a real declaration of no such amount and is not applied on the household's behalf");
  }

  /* Read a declared threshold set, refusing when it is absent and refusing when it does not
     declare itself applicable to the pack's declared tax year. An empty or absent declaredFor
     is never permission. */
  function resolveThresholdSet(pack, setId, domain) {
    var sets = isPlainObject(pack) && isPlainObject(pack.thresholdSets) ? pack.thresholdSets : {};
    var set = sets[setId];
    if (set === undefined || set === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the resolved pack declares no threshold set named " + setId,
        "author a rule pack that carries this threshold set and states the year it applies to");
    }
    if (rules.isAbsentFigure(set)) return rules.absentFigureRefusal(set, domain);
    var yearRefusal = rules.thresholdSetYearRefusal(pack, set, domain);
    if (yearRefusal !== null) return yearRefusal;
    return set;
  }

  /* CO-11. The investment-income base is the two preferential income members plus the declared
     ordinary portion. The modified-adjusted-gross measure is the gross supported income CO-1
     already computed. Tax-exempt interest enters neither quantity. */
  function computeNetInvestmentIncomeTax(workspace, pack, basis) {
    var domain = "net-investment-income-tax:" + String(workspace.filingStatus);
    var declared = declaredBasis(workspace, "investmentIncomeBasis", "otherOrdinaryNetInvestmentIncome");
    if (declared === null) {
      return undeclaredBasisRefusal("investmentIncomeBasis", "otherOrdinaryNetInvestmentIncome", domain);
    }
    var set = resolveThresholdSet(pack, "net-investment-income-tax", domain);
    if (rules.isUnavailable(set)) return set;
    var threshold = thresholdForStatus(set, workspace.filingStatus);
    if (threshold === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the threshold set carries no threshold for this filing status",
        "author a rule pack whose threshold set states a threshold for every declared filing status");
    }
    var netInvestmentIncome = workspace.income.qualifiedDividend + workspace.income.longTermCapitalGain + declared;
    var modifiedAdjustedGross = basis.grossSupportedIncome;
    var excess = Math.max(0, modifiedAdjustedGross - threshold);
    var taxedAmount = Math.min(netInvestmentIncome, excess);
    return valued(set.rate * taxedAmount, rules.ruleStatusFor(pack, set), {
      rate: set.rate,
      threshold: threshold,
      netInvestmentIncome: netInvestmentIncome,
      modifiedAdjustedGross: modifiedAdjustedGross,
      excessOverThreshold: excess,
      taxedAmount: taxedAmount,
      declaredBasisMember: "investmentIncomeBasis.otherOrdinaryNetInvestmentIncome",
      sourceRef: set.sourceRef,
      locator: set.locator
    });
  }

  /* CO-12. The base is the declared wage basis and nothing else. No other income member appears
     in this expression, which is what makes added ordinary income unable to move this leg. */
  function computeAdditionalMedicareTax(workspace, pack) {
    var domain = "additional-medicare-tax:" + String(workspace.filingStatus);
    var declared = declaredBasis(workspace, "wageBasis", "medicareWagesAndSelfEmploymentIncome");
    if (declared === null) {
      return undeclaredBasisRefusal("wageBasis", "medicareWagesAndSelfEmploymentIncome", domain);
    }
    var set = resolveThresholdSet(pack, "additional-medicare-tax", domain);
    if (rules.isUnavailable(set)) return set;
    var threshold = thresholdForStatus(set, workspace.filingStatus);
    if (threshold === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the threshold set carries no threshold for this filing status",
        "author a rule pack whose threshold set states a threshold for every declared filing status");
    }
    var excess = Math.max(0, declared - threshold);
    return valued(set.rate * excess, rules.ruleStatusFor(pack, set), {
      rate: set.rate,
      threshold: threshold,
      wageBasis: declared,
      excessOverThreshold: excess,
      taxedAmount: excess,
      declaredBasisMember: "wageBasis.medicareWagesAndSelfEmploymentIncome",
      sourceRef: set.sourceRef,
      locator: set.locator
    });
  }

  /* The nearest declared threshold-set edge above the household's current measure, and the set
     that owns it. A threshold set is a pack threshold exactly as a band edge is, so a marginal
     move across one is attributable rather than unexplained. Only the modified-adjusted-gross
     shape is reported here, because that is the only measure either curve kind varies. */
  function nextThresholdEdge(pack, filingStatus, modifiedAdjustedGross) {
    var sets = isPlainObject(pack) && isPlainObject(pack.thresholdSets) ? pack.thresholdSets : {};
    var keys = Object.keys(sets);
    var nearest = null;
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var set = sets[keys[index]];
      if (!isPlainObject(set) || set.appliesTo !== "modified-adjusted-gross-income-excess-capped-by") continue;
      if (rules.isAbsentFigure(set)) continue;
      var threshold = thresholdForStatus(set, filingStatus);
      if (threshold === null || !(threshold > modifiedAdjustedGross)) continue;
      var distance = threshold - modifiedAdjustedGross;
      if (nearest === null || distance < nearest.distance) {
        nearest = { distance: distance, thresholdSetId: keys[index], threshold: threshold, set: set };
      }
    }
    return nearest;
  }

  /* Which declared threshold-set edges the probe dollar crossed between two sampled levels. */
  function crossedThresholdSets(pack, filingStatus, previousMeasure, currentMeasure) {
    var sets = isPlainObject(pack) && isPlainObject(pack.thresholdSets) ? pack.thresholdSets : {};
    var keys = Object.keys(sets);
    var crossed = [];
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var set = sets[keys[index]];
      if (!isPlainObject(set) || rules.isAbsentFigure(set)) continue;
      if (set.appliesTo !== "modified-adjusted-gross-income-excess-capped-by") continue;
      var threshold = thresholdForStatus(set, filingStatus);
      if (threshold === null) continue;
      if (previousMeasure < threshold && currentMeasure >= threshold) {
        crossed.push(Object.freeze({
          name: set.thresholdSetId + " threshold for " + String(filingStatus),
          tableId: null,
          bandId: null,
          thresholdKind: "rate-step",
          sourceRef: set.sourceRef,
          locator: set.locator
        }));
      }
    }
    return crossed;
  }

  /* CO-8. The total is the sum over the pack's declared leg set, and is the refusal of the first
     refusing leg in declared order. A total that silently omitted an unavailable leg would be
     exactly the substitution this feature exists to prevent. For a pack declaring no leg set the
     declared legs are the two Feature 021 legs, so the sum is identical. */
  function sumDeclaredLegs(pack, stageRecords, status) {
    var legs = rules.declaredTaxLegs(pack);
    var published = [];
    var refusal = null;
    var total = 0;
    var index = 0;
    for (index = 0; index < legs.length; index += 1) {
      var leg = legs[index];
      var record = stageRecords[leg.stageId];
      if (record === undefined) {
        record = rules.unavailable("RLTAX-PACK-INVALID", "tax-leg:" + String(leg.legId),
          "the declared leg names a calculation stage this engine does not compute: " + String(leg.stageId),
          "declare a leg whose stageId is a stage the engine runs");
      }
      var legUnavailable = rules.isUnavailable(record);
      if (legUnavailable && refusal === null && leg.includedInTotal === true) refusal = record;
      if (!legUnavailable && leg.includedInTotal === true) total += record.value;
      published.push(Object.freeze({
        legId: leg.legId,
        stageId: leg.stageId,
        figureRef: leg.figureRef,
        includedInTotal: leg.includedInTotal === true,
        available: !legUnavailable,
        value: legUnavailable ? null : record.value,
        code: legUnavailable ? record.code : null,
        reason: legUnavailable ? record.reason : null
      }));
    }
    return Object.freeze({
      legs: Object.freeze(published),
      refusal: refusal,
      total: refusal === null ? valued(total, status) : refusal
    });
  }

  /* The band a level sits in, and how far the next edge is. Returned by the settlement so a
     curve consumer can place an exact sample without holding threshold arithmetic of its own. */
  function activeBandContext(level, table) {
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      var band = table.bands[index];
      var upper = bandUpperBound(band);
      if (level >= band.lowerInclusive && level < upper) {
        return Object.freeze({
          bandId: band.bandId,
          distanceToNextEdge: band.upperExclusive === null ? null : band.upperExclusive - level
        });
      }
    }
    return Object.freeze({ bandId: null, distanceToNextEdge: null });
  }

  function unsupportedFeatureNotices(pack) {
    var notices = [];
    var index = 0;
    for (index = 0; index < pack.unsupportedFeatures.length; index += 1) {
      var entry = pack.unsupportedFeatures[index];
      notices.push(Object.freeze({
        id: entry.id,
        label: entry.label,
        reason: entry.reason,
        code: entry.code,
        movesMarginalRate: entry.movesMarginalRate
      }));
    }
    return Object.freeze(notices);
  }

  function stageRecord(value, ruleStatus, sourceRef) {
    return Object.freeze({ value: value, ruleStatus: ruleStatus, sourceRef: sourceRef });
  }

  /* CO-9. Five legs. A leg whose input is a refusal is reported as not-evaluable rather than
     silently passing. */
  function reconcileAnnualFederalTax(result, pack) {
    var tolerance = pack.roundingPolicy.reconciliationTolerance;
    var legs = [];
    var balanced = true;
    var notEvaluable = 0;

    /* A leg whose input is a refusal is reported as not-evaluable rather than silently passing,
       and it does not convert an honest upstream refusal into a reconciliation refusal. Only a
       leg that was evaluated and fell outside the pack's tolerance breaks the identity. */
    function addLeg(id, identity, evaluable, holds, detail) {
      if (!evaluable) notEvaluable += 1;
      if (evaluable && !holds) balanced = false;
      legs.push(Object.freeze({
        id: id,
        identity: identity,
        state: evaluable ? (holds ? "holds" : "breaks") : "not-evaluable",
        detail: detail
      }));
    }

    var gross = result.grossSupportedIncome;
    var deduction = result.appliedDeduction;
    var totalTaxable = result.totalTaxableIncome;
    var ordinaryTaxable = result.ordinaryTaxableIncome;
    var preferentialTaxable = result.preferentialTaxableIncome;
    var ordinaryTax = result.ordinaryTax;
    var preferentialTax = result.preferentialTax;
    var totalTax = result.totalFederalTax;
    var exempt = result.taxExemptInterestRecorded;

    var grossOk = !rules.isUnavailable(gross);
    var deductionOk = !rules.isUnavailable(deduction);
    var totalTaxableOk = !rules.isUnavailable(totalTaxable);
    var splitOk = !rules.isUnavailable(ordinaryTaxable) && !rules.isUnavailable(preferentialTaxable);
    var legsOk = !rules.isUnavailable(ordinaryTax) && !rules.isUnavailable(preferentialTax) && !rules.isUnavailable(totalTax);

    addLeg("L1", "ordinary + qualifiedDividend + longTermCapitalGain == grossSupportedIncome",
      grossOk,
      grossOk && Math.abs((result.declaredIncome.ordinary + result.declaredIncome.qualifiedDividend +
        result.declaredIncome.longTermCapitalGain) - gross.value) <= tolerance,
      "gross supported income excludes tax-exempt interest by construction");

    addLeg("L2", "grossSupportedIncome - appliedDeduction == totalTaxableIncome, else totalTaxableIncome == 0",
      grossOk && deductionOk && totalTaxableOk,
      grossOk && deductionOk && totalTaxableOk && (gross.value >= deduction.value
        ? Math.abs((gross.value - deduction.value) - totalTaxable.value) <= tolerance
        : Math.abs(totalTaxable.value) <= tolerance),
      "the deduction is applied to total income and the result is floored at zero");

    addLeg("L3", "ordinaryTaxableIncome + preferentialTaxableIncome == totalTaxableIncome",
      splitOk && totalTaxableOk,
      splitOk && totalTaxableOk &&
      Math.abs((ordinaryTaxable.value + preferentialTaxable.value) - totalTaxable.value) <= tolerance,
      "the preferential amount is capped at total taxable income, so ordinary taxable income is never negative");

    var includedLegs = Array.isArray(result.taxLegs)
      ? result.taxLegs.filter(function (leg) { return leg.includedInTotal; })
      : [];
    var everyIncludedLegAvailable = includedLegs.length > 0 &&
      includedLegs.every(function (leg) { return leg.available; });
    var includedLegSum = 0;
    var legIndex = 0;
    for (legIndex = 0; legIndex < includedLegs.length; legIndex += 1) {
      if (includedLegs[legIndex].available) includedLegSum += includedLegs[legIndex].value;
    }
    var totalOk = !rules.isUnavailable(totalTax);

    addLeg("L4", "the sum of every declared leg whose includedInTotal is true == totalFederalTax",
      everyIncludedLegAvailable && totalOk,
      everyIncludedLegAvailable && totalOk && Math.abs(includedLegSum - totalTax.value) <= tolerance,
      "a total that omitted an unavailable leg would be a substitution, so an unavailable leg refuses the total");

    var exemptOk = !rules.isUnavailable(exempt);
    addLeg("L5", "taxExemptInterestRecorded is present and is a member of no other leg",
      exemptOk,
      exemptOk && Number.isFinite(exempt.value),
      "tax-exempt interest is retained as a recorded input and excluded from gross supported income");

    /* L6. The investment-income base excludes tax-exempt interest, and excludes the declared
       wage basis unless that amount was also declared as net investment income. */
    var niit = result.netInvestmentIncomeTax;
    var bases = isPlainObject(result.declaredBases) ? result.declaredBases : {};
    var declaredPortion = bases.otherOrdinaryNetInvestmentIncome;
    var declaredWages = bases.medicareWagesAndSelfEmploymentIncome;
    var niitOk = !rules.isUnavailable(niit) && isPlainObject(niit)
      && Number.isFinite(niit.netInvestmentIncome) && Number.isFinite(niit.modifiedAdjustedGross)
      && Number.isFinite(declaredPortion);
    var expectedBase = niitOk
      ? result.declaredIncome.qualifiedDividend + result.declaredIncome.longTermCapitalGain + declaredPortion
      : null;
    var expectedMagi = result.declaredIncome.ordinary + result.declaredIncome.qualifiedDividend
      + result.declaredIncome.longTermCapitalGain;
    /* A wage basis folded into the investment-income base would show up as this larger figure.
       Naming it explicitly keeps the clause a real assertion rather than an implication. */
    var baseWithWagesFolded = niitOk && Number.isFinite(declaredWages)
      ? expectedBase + declaredWages
      : null;
    var wagesExcluded = !niitOk || !Number.isFinite(declaredWages) || declaredWages === 0
      || Math.abs(niit.netInvestmentIncome - baseWithWagesFolded) > tolerance;
    addLeg("L6",
      "netInvestmentIncomeBase excludes taxExemptInterestRecorded and excludes the declared wage basis unless that amount was also declared as net investment income",
      niitOk && exemptOk,
      niitOk && exemptOk
      && Math.abs(niit.netInvestmentIncome - expectedBase) <= tolerance
      && Math.abs(niit.modifiedAdjustedGross - expectedMagi) <= tolerance
      && wagesExcluded,
      "tax-exempt interest enters neither the investment-income base nor the modified adjusted gross measure, and a Medicare wage basis is not investment income");

    return Object.freeze({
      legs: Object.freeze(legs),
      balanced: balanced,
      notEvaluableLegCount: notEvaluable,
      toleranceUsed: tolerance,
      refusal: balanced ? null : rules.unavailable("RLTAX-RECONCILE", "settlement:reconciliation",
        "the reconciliation identity did not balance within the pack's declared tolerance",
        "correct the settlement or the pack; a non-balancing result is refused rather than displayed as a tax figure")
    });
  }

  /* Compose CO-1 through CO-9 in the pack's declared calculation order. The order is read from
     the pack and republished in the result, so the order a reader is told about and the order
     the code applied are one string.

     `costLegs` is OPTIONAL and additive. Feature 024 Scope 04 hands it the three Medicare premium
     legs, already settled by `composeMedicareStage` from the declared lookback alone. They are
     appended to the published leg set with `includedInTotal: false`, so every surface can show
     them and no tax total can contain them. Omitting the argument reproduces the leg set and the
     total this function produced before that scope existed, byte for byte — the cost axis is
     genuinely additive rather than woven into the tax arithmetic. Note the DIRECTION: costs
     arrive here already settled, and no income figure travels the other way. */
  function computeAnnualFederalTax(workspace, pack, costLegs) {
    var packRef = Object.freeze({ id: pack.id, version: pack.version, contentSha256: pack.contentSha256 });
    var status = rules.ruleStatusFor(pack, pack);
    var basis = computeTaxableIncome(workspace, pack);

    var grossRecord = valued(basis.grossSupportedIncome, status);
    var exemptRecord = valued(basis.taxExemptInterestRecorded, status);
    var stages = {};
    stages["CO-1"] = stageRecord(basis.grossSupportedIncome, status, null);

    var deduction = basis.appliedDeduction;
    var deductionUnavailable = rules.isUnavailable(deduction);
    stages["CO-2"] = deductionUnavailable ? deduction
      : stageRecord(deduction.value, deduction.ruleStatus, deduction.sourceRef);

    var totalTaxableRecord = deductionUnavailable ? deduction : valued(basis.totalTaxableIncome, status);
    var preferentialTaxableRecord = deductionUnavailable ? deduction : valued(basis.preferentialTaxableIncome, status);
    var ordinaryTaxableRecord = deductionUnavailable ? deduction : valued(basis.ordinaryTaxableIncome, status);
    stages["CO-3"] = totalTaxableRecord;
    stages["CO-4"] = preferentialTaxableRecord;
    stages["CO-5"] = ordinaryTaxableRecord;

    var ordinaryTable = pack.ordinaryRateTables[workspace.filingStatus];
    var preferentialTable = pack.preferentialRateTables[workspace.filingStatus];

    var ordinaryTaxRecord = null;
    if (deductionUnavailable) {
      ordinaryTaxRecord = deduction;
    } else if (rules.isAbsentFigure(ordinaryTable)) {
      ordinaryTaxRecord = basis.ordinaryTaxableIncome > 0
        ? rules.absentFigureRefusal(ordinaryTable, "ordinary-tax:" + workspace.filingStatus)
        : zeroTaxOnNoTaxableDollars(status);
    } else {
      var ordinaryWalk = applyRateTable(basis.ordinaryTaxableIncome, ordinaryTable);
      ordinaryTaxRecord = valued(ordinaryWalk.tax, rules.ruleStatusFor(pack, ordinaryTable), {
        bandDetail: ordinaryWalk.bandDetail,
        sourceRef: ordinaryTable.sourceRef,
        locator: ordinaryTable.locator
      });
    }
    stages["CO-6"] = ordinaryTaxRecord;

    var preferentialTaxRecord = null;
    if (deductionUnavailable) {
      preferentialTaxRecord = deduction;
    } else if (rules.isAbsentFigure(preferentialTable)) {
      preferentialTaxRecord = basis.preferentialTaxableIncome > 0
        ? rules.absentFigureRefusal(preferentialTable, "preferential-tax:" + workspace.filingStatus)
        : zeroTaxOnNoTaxableDollars(status);
    } else {
      var preferentialWalk = stackPreferentialIncome(
        basis.ordinaryTaxableIncome, basis.preferentialTaxableIncome, preferentialTable);
      preferentialTaxRecord = valued(preferentialWalk.tax, rules.ruleStatusFor(pack, preferentialTable), {
        bandDetail: preferentialWalk.bandDetail,
        sourceRef: preferentialTable.sourceRef,
        locator: preferentialTable.locator
      });
    }
    stages["CO-7"] = preferentialTaxRecord;

    /* CO-11 and CO-12 precede CO-8 because CO-8 is a sum over the declared leg set, and a leg
       computed after the sum could not be in it. */
    var netInvestmentIncomeTaxRecord = deductionUnavailable
      ? deduction
      : computeNetInvestmentIncomeTax(workspace, pack, basis);
    var additionalMedicareTaxRecord = deductionUnavailable
      ? deduction
      : computeAdditionalMedicareTax(workspace, pack);
    stages["CO-11"] = netInvestmentIncomeTaxRecord;
    stages["CO-12"] = additionalMedicareTaxRecord;

    var settledLegs = sumDeclaredLegs(pack, stages, status);
    var totalRecord = settledLegs.total;
    stages["CO-8"] = totalRecord;

    /* The cost legs join the PUBLISHED leg set and never the total. `sumDeclaredLegs` has already
       returned by this point, so there is no path by which one of them could be added to
       `totalRecord`: the exclusion is a consequence of where this line sits, not of a filter that
       could be edited away. */
    var publishedLegs = settledLegs.legs;
    if (Array.isArray(costLegs) && costLegs.length > 0) {
      publishedLegs = Object.freeze(publishedLegs.slice().concat(costLegs.map(function (leg) {
        return Object.freeze({
          legId: leg.legId,
          stageId: leg.stageId,
          figureRef: leg.figureRef,
          includedInTotal: leg.includedInTotal === true,
          available: leg.available === true,
          value: leg.available === true ? leg.value : null,
          code: leg.available === true ? null : (leg.refusal ? leg.refusal.code : null),
          reason: leg.available === true ? null : (leg.refusal ? leg.refusal.reason : null)
        });
      })));
    }

    var averageRecord = null;
    if (rules.isUnavailable(totalRecord)) {
      averageRecord = totalRecord;
    } else if (basis.grossSupportedIncome > 0) {
      averageRecord = valued(totalRecord.value / basis.grossSupportedIncome, status);
    } else {
      averageRecord = rules.unavailable("RLTAX-INPUT-INCOMPLETE", "settlement:averageRate",
        "an average rate over zero supported income has no meaning",
        "declare a supported income amount greater than zero");
    }

    var ordinaryContext = (deductionUnavailable || rules.isAbsentFigure(ordinaryTable))
      ? { bandId: null, distanceToNextEdge: null }
      : activeBandContext(basis.ordinaryTaxableIncome, ordinaryTable);
    var preferentialContext = (deductionUnavailable || rules.isAbsentFigure(preferentialTable))
      ? { bandId: null, distanceToNextEdge: null }
      : activeBandContext(basis.ordinaryTaxableIncome + basis.preferentialTaxableIncome, preferentialTable);
    var nextThreshold = deductionUnavailable
      ? null
      : nextThresholdEdge(pack, workspace.filingStatus, basis.grossSupportedIncome);

    var result = {
      contractVersion: RESULT_CONTRACT,
      packRef: packRef,
      declaredTaxYear: workspace.declaredTaxYear,
      filingStatus: workspace.filingStatus,
      calculationOrder: pack.calculationOrder,
      stages: Object.freeze(stages),
      declaredIncome: Object.freeze({
        ordinary: workspace.income.ordinary,
        qualifiedDividend: workspace.income.qualifiedDividend,
        longTermCapitalGain: workspace.income.longTermCapitalGain,
        taxExemptInterest: workspace.income.taxExemptInterest
      }),
      /* The two declared surtax bases, republished so a reader sees whether each was declared
         and reconciliation leg L6 can check the base against the declaration rather than
         against an assumption. `null` means undeclared; it never means zero. */
      declaredBases: Object.freeze({
        otherOrdinaryNetInvestmentIncome: declaredBasis(workspace, "investmentIncomeBasis", "otherOrdinaryNetInvestmentIncome"),
        medicareWagesAndSelfEmploymentIncome: declaredBasis(workspace, "wageBasis", "medicareWagesAndSelfEmploymentIncome")
      }),
      grossSupportedIncome: grossRecord,
      taxExemptInterestRecorded: exemptRecord,
      appliedDeduction: deduction,
      totalTaxableIncome: totalTaxableRecord,
      preferentialTaxableIncome: preferentialTaxableRecord,
      ordinaryTaxableIncome: ordinaryTaxableRecord,
      ordinaryTax: ordinaryTaxRecord,
      preferentialTax: preferentialTaxRecord,
      netInvestmentIncomeTax: netInvestmentIncomeTaxRecord,
      additionalMedicareTax: additionalMedicareTaxRecord,
      taxLegs: publishedLegs,
      /* FR-022-014. The asymmetry is a structural member of the result rather than page copy,
         so a rendering change cannot drop it. */
      conversionAsymmetry: Object.freeze({
        contractVersion: "ConversionAsymmetry/v1",
        movedByAddedOrdinaryIncome: Object.freeze(["ordinary", "preferential", "net-investment-income-tax"]),
        notMovedByAddedOrdinaryIncome: Object.freeze(["additional-medicare-tax"]),
        reason: "Added ordinary income raises the modified adjusted gross measure the net investment income tax compares against its threshold, so that leg can move. The additional Medicare tax reads only the declared Medicare wage and self-employment basis, so added ordinary income cannot move it.",
        ruleStatus: status
      }),
      modifiedAdjustedGross: Object.freeze({
        contractVersion: "MeasureCompleteness/v1",
        value: basis.grossSupportedIncome,
        complete: isPlainObject(pack.modifiedAdjustedGrossCompleteness)
          ? pack.modifiedAdjustedGrossCompleteness.complete === true
          : false,
        unmodeledAdjustments: isPlainObject(pack.modifiedAdjustedGrossCompleteness) &&
          Array.isArray(pack.modifiedAdjustedGrossCompleteness.unmodeledAdjustments)
          ? Object.freeze(pack.modifiedAdjustedGrossCompleteness.unmodeledAdjustments.slice())
          : Object.freeze([]),
        ruleStatus: status
      }),
      totalFederalTax: totalRecord,
      averageRate: averageRecord,
      marginalContext: Object.freeze({
        activeOrdinaryBandId: ordinaryContext.bandId,
        distanceToNextOrdinaryEdge: ordinaryContext.distanceToNextEdge,
        activePreferentialBandId: preferentialContext.bandId,
        distanceToNextPreferentialEdge: preferentialContext.distanceToNextEdge,
        nextThresholdSetId: nextThreshold === null ? null : nextThreshold.thresholdSetId,
        distanceToNextThresholdEdge: nextThreshold === null ? null : nextThreshold.distance,
        modifiedAdjustedGrossMeasure: basis.grossSupportedIncome,
        ruleStatus: status
      }),
      unsupportedFeatureNotices: unsupportedFeatureNotices(pack),
      roundingDisclosure: Object.freeze({
        calculationStagesApplied: Object.freeze(pack.roundingPolicy.calculationStages.map(function (stage) {
          return stage.stageId;
        })),
        displayStage: null
      }),
      /* Never true in this slice: unsupportedFeatures[] is non-empty, so no result may be
         labelled a complete federal tax. This is a structural member rather than page copy. */
      completeFederalTax: false
    };

    var reconciliation = reconcileAnnualFederalTax(result, pack);
    result.reconciliation = Object.freeze({
      legs: reconciliation.legs,
      balanced: reconciliation.balanced,
      notEvaluableLegCount: reconciliation.notEvaluableLegCount,
      toleranceUsed: reconciliation.toleranceUsed
    });
    if (reconciliation.refusal) {
      result.totalFederalTax = reconciliation.refusal;
      result.averageRate = reconciliation.refusal;
    }
    return Object.freeze(result);
  }

  /* The two curve kinds and the workspace member each one varies. The varied member is the
     household's INPUT level rather than taxable income, because the input is the quantity a
     household controls and the quantity the conversion comparison later moves. */
  var CURVE_KIND_FIELDS = Object.freeze({
    "ordinary": "ordinary",
    "long-term-gain": "longTermCapitalGain"
  });

  var CURVE_SWEEP_MEMBERS = Object.freeze(["start", "end", "step", "probe", "maxPoints"]);

  function curveConfigRefusal(member, reason) {
    return rules.unavailable("RLTAX-CONFIG-INVALID", "sweep:" + member, reason,
      "correct the sweep." + member + " member of the configuration; the curve carries no sweep constant of its own");
  }

  /* Every sweep member is mandatory. A missing or malformed policy refuses rather than
     substituting a range, a step or a probe increment the reader was never told about. */
  function validateSweepPolicy(sweep, kind) {
    if (CURVE_KIND_FIELDS[kind] === undefined) {
      return rules.unavailable("RLTAX-FEATURE-UNSUPPORTED", "curve:kind:" + String(kind),
        "the curve kind is outside the closed pair ordinary and long-term-gain",
        "request the ordinary curve or the long-term-gain curve");
    }
    if (!isPlainObject(sweep)) {
      return curveConfigRefusal("policy", "the sweep policy is missing or is not an object");
    }
    var index = 0;
    for (index = 0; index < CURVE_SWEEP_MEMBERS.length; index += 1) {
      if (!Number.isFinite(sweep[CURVE_SWEEP_MEMBERS[index]])) {
        return curveConfigRefusal(CURVE_SWEEP_MEMBERS[index], "the sweep member must be a finite number");
      }
    }
    if (sweep.step <= 0) return curveConfigRefusal("step", "the sweep step must be greater than zero");
    if (sweep.probe <= 0) return curveConfigRefusal("probe", "the sweep probe must be greater than zero");
    if (sweep.end < sweep.start) return curveConfigRefusal("end", "the sweep end must not sit below the sweep start");
    if (!Array.isArray(sweep.kinds) || sweep.kinds.indexOf(kind) < 0) {
      return curveConfigRefusal("kinds", "the sweep policy does not declare this curve kind");
    }
    if (((sweep.end - sweep.start) / sweep.step) > sweep.maxPoints) {
      return curveConfigRefusal("maxPoints",
        "the declared sweep would exceed its point budget; a budget refuses rather than silently truncating a curve");
    }
    return null;
  }

  /* One input at a time: the named kind moves and every other declaration is carried across
     untouched, so a curve point differs from its neighbour in exactly one member. */
  function curveWorkspaceAt(workspace, kind, level) {
    var next = {};
    var keys = Object.keys(workspace);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) next[keys[index]] = workspace[keys[index]];
    next.income = {
      ordinary: workspace.income.ordinary,
      qualifiedDividend: workspace.income.qualifiedDividend,
      longTermCapitalGain: workspace.income.longTermCapitalGain,
      taxExemptInterest: workspace.income.taxExemptInterest
    };
    next.income[CURVE_KIND_FIELDS[kind]] = level;
    return next;
  }

  /* The whole band a taxable level sits in, so the curve can publish the statutory rate beside
     the effective marginal rate without holding an edge of its own. */
  function bandAtLevel(level, table) {
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      var band = table.bands[index];
      if (level >= band.lowerInclusive && level < bandUpperBound(band)) return band;
    }
    return null;
  }

  function bandIndexOf(table, bandId) {
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      if (table.bands[index].bandId === bandId) return index;
    }
    return -1;
  }

  /* The grid plus a crossing pair at every declared edge the grid steps over. The crossing
     distance is read off the settlement, which computed it from data it already holds, so the
     curve performs no threshold arithmetic and carries no edge. The pair is (d - probe, d) and
     nothing is inserted between them, which is what keeps a step from being a sampling artifact
     and keeps a real discontinuity from being drawn as a ramp. */
  function curveSampleLevels(workspace, pack, kind, sweep) {
    var levels = [];
    var seen = {};
    function record(level) {
      if (!Number.isFinite(level)) return;
      var key = String(level);
      if (seen[key] === true) return;
      seen[key] = true;
      levels.push(level);
    }
    var grid = [];
    var gridCount = 0;
    while (sweep.start + gridCount * sweep.step < sweep.end) {
      grid.push(sweep.start + gridCount * sweep.step);
      gridCount += 1;
    }
    grid.push(sweep.end);
    var index = 0;
    for (index = 0; index < grid.length; index += 1) {
      record(grid[index]);
      if (index + 1 >= grid.length) continue;
      var upper = grid[index + 1];
      var from = grid[index];
      var guard = 0;
      while (guard < sweep.maxPoints) {
        guard += 1;
        var settled = computeAnnualFederalTax(curveWorkspaceAt(workspace, kind, from), pack);
        var bandDistance = kind === "ordinary"
          ? settled.marginalContext.distanceToNextOrdinaryEdge
          : settled.marginalContext.distanceToNextPreferentialEdge;
        var thresholdDistance = settled.marginalContext.distanceToNextThresholdEdge;
        /* The nearest declared edge of EITHER kind, so a threshold-set crossing is sampled as an
           exact pair rather than drawn as a ramp between two grid positions. */
        var distance = null;
        if (Number.isFinite(bandDistance) && bandDistance > 0) distance = bandDistance;
        if (Number.isFinite(thresholdDistance) && thresholdDistance > 0
          && (distance === null || thresholdDistance < distance)) {
          distance = thresholdDistance;
        }
        if (!Number.isFinite(distance) || distance <= 0) break;
        var crossing = from + distance;
        if (crossing > upper) break;
        record(crossing - sweep.probe);
        record(crossing);
        from = crossing;
      }
    }
    levels.sort(function (left, right) { return left - right; });
    return levels;
  }

  /* Which pack thresholds the probe dollar crossed. A band change is attributed to the declared
     edges between the two bands. A move out of a fully absorbed deduction is attributed to the
     applied deduction, which is a real threshold rather than an unexplained move. */
  function crossedThresholds(table, previousPoint, currentPoint, previousTaxable, currentTaxable, deduction) {
    var crossed = [];
    var usable = !rules.isAbsentFigure(table) && isPlainObject(table) && Array.isArray(table.bands);
    if (usable && previousPoint.statutoryBandId !== currentPoint.statutoryBandId
      && previousPoint.statutoryBandId !== null && currentPoint.statutoryBandId !== null) {
      var started = bandIndexOf(table, previousPoint.statutoryBandId);
      var ended = bandIndexOf(table, currentPoint.statutoryBandId);
      var index = 0;
      for (index = 0; index < table.bands.length; index += 1) {
        if (index <= started || index > ended) continue;
        crossed.push(Object.freeze({
          name: table.tableId + " lower edge of band " + table.bands[index].bandId,
          tableId: table.tableId,
          bandId: table.bands[index].bandId,
          thresholdKind: table.bands[index].thresholdKind,
          sourceRef: table.sourceRef,
          locator: table.locator
        }));
      }
    }
    if (crossed.length === 0 && previousTaxable === 0 && currentTaxable > 0
      && isPlainObject(deduction) && !rules.isUnavailable(deduction)) {
      crossed.push(Object.freeze({
        name: "applied " + String(deduction.mode) + " deduction threshold",
        tableId: null,
        bandId: null,
        thresholdKind: "rate-step",
        sourceRef: deduction.sourceRef === undefined ? null : deduction.sourceRef,
        locator: deduction.locator === undefined ? null : deduction.locator
      }));
    }
    return crossed;
  }

  function segmentKindFor(crossed) {
    var kinds = {};
    var index = 0;
    for (index = 0; index < crossed.length; index += 1) kinds[crossed[index].thresholdKind] = true;
    if (kinds.cliff === true) return "cliff";
    if (kinds["rate-step"] === true) return "rate-step";
    if (kinds["phase-in"] === true) return "phase-in";
    return "rate-step";
  }

  /* The deferred thresholds that would have moved a marginal rate had the pack carried them.
     The filter is the pack's own movesMarginalRate field, so the curve holds no list of which
     absences mattered. In this slice the list is the larger half of the answer. */
  function curveUnavailableContributors(pack) {
    var declared = rules.marginalRateContributors(pack);
    var contributors = [];
    var index = 0;
    for (index = 0; index < declared.length; index += 1) {
      contributors.push(rules.unavailable(declared[index].code,
        "marginal-contributor:" + declared[index].id,
        declared[index].reason,
        "author a rule pack that carries " + declared[index].label + " and declares it a supported feature"));
    }
    return Object.freeze(contributors);
  }

  /* effectiveMarginalRate(L) = (T(L + probe) - T(L)) / probe, where T is the FULL settlement.
     Forward rather than central, because a central difference averages across a discontinuity
     and turns a step into a ramp. The curve declares no band, no rate and no edge: every rate it
     reports is a difference of two settlements. */
  function computeEffectiveMarginalCurve(workspace, pack, kind, sweep) {
    var invalid = validateSweepPolicy(sweep, kind);
    if (invalid) return invalid;
    if (!isPlainObject(workspace) || !isPlainObject(workspace.income) || !isPlainObject(pack)
      || !isPlainObject(pack.ordinaryRateTables) || !isPlainObject(pack.preferentialRateTables)
      || pack.ordinaryRateTables[workspace.filingStatus] === undefined
      || pack.preferentialRateTables[workspace.filingStatus] === undefined) {
      return rules.unavailable("RLTAX-FILING-STATUS-UNSUPPORTED", "curve:" + kind + ":filingStatus",
        "the workspace declares no filing status the resolved pack carries a rate table for",
        "declare a filing status the pack declares, or resolve a pack that declares this one");
    }
    var levels = curveSampleLevels(workspace, pack, kind, sweep);
    if (levels.length > sweep.maxPoints) {
      return curveConfigRefusal("maxPoints",
        "the sampled level set exceeds the declared point budget; a budget refuses rather than silently truncating a curve");
    }
    var table = kind === "ordinary"
      ? pack.ordinaryRateTables[workspace.filingStatus]
      : pack.preferentialRateTables[workspace.filingStatus];
    var status = rules.ruleStatusFor(pack, pack);
    var points = [];
    var taxableLevels = [];
    var measures = [];
    var deductions = [];
    var index = 0;
    for (index = 0; index < levels.length; index += 1) {
      var here = computeAnnualFederalTax(curveWorkspaceAt(workspace, kind, levels[index]), pack);
      if (rules.isUnavailable(here.totalFederalTax)) {
        return rules.unavailable(here.totalFederalTax.code, "curve:" + kind + ":level",
          "the settlement at a sampled level is unavailable, so the next dollar has no price there: " + here.totalFederalTax.reason,
          here.totalFederalTax.whatWouldMakeItAvailable);
      }
      var ahead = computeAnnualFederalTax(curveWorkspaceAt(workspace, kind, levels[index] + sweep.probe), pack);
      if (rules.isUnavailable(ahead.totalFederalTax)) {
        return rules.unavailable(ahead.totalFederalTax.code, "curve:" + kind + ":probe",
          "the settlement one probe increment above a sampled level is unavailable, so the next dollar has no price there: "
          + ahead.totalFederalTax.reason,
          ahead.totalFederalTax.whatWouldMakeItAvailable);
      }
      var taxable = kind === "ordinary"
        ? here.ordinaryTaxableIncome.value
        : here.ordinaryTaxableIncome.value + here.preferentialTaxableIncome.value;
      var band = rules.isAbsentFigure(table) ? null : bandAtLevel(taxable, table);
      taxableLevels.push(taxable);
      measures.push(here.marginalContext.modifiedAdjustedGrossMeasure);
      deductions.push(here.appliedDeduction);
      points.push(Object.freeze({
        level: levels[index],
        taxAtLevel: here.totalFederalTax.value,
        effectiveMarginalRate: (ahead.totalFederalTax.value - here.totalFederalTax.value) / sweep.probe,
        statutoryBandRate: band === null ? null : band.rate,
        statutoryBandId: band === null ? null : band.bandId,
        ruleStatus: status
      }));
    }

    var segments = [];
    /* Two settlements differenced in floating point land a fraction of a basis point apart
       inside one band. The comparison therefore uses the pack's OWN declared numerical
       tolerance rather than a constant of this module's choosing: a difference below it is
       arithmetic noise, and every real band step in a rate table is far above it. */
    var rateTolerance = pack.roundingPolicy.reconciliationTolerance;
    for (index = 1; index < points.length; index += 1) {
      var changed = Math.abs(points[index - 1].effectiveMarginalRate - points[index].effectiveMarginalRate) > rateTolerance;
      var crossed = [];
      if (changed) {
        crossed = crossedThresholds(table, points[index - 1], points[index],
          taxableLevels[index - 1], taxableLevels[index], deductions[index]);
        /* A declared threshold set is a pack threshold exactly as a band edge is. */
        crossed = crossed.concat(crossedThresholdSets(pack, workspace.filingStatus,
          measures[index - 1], measures[index]));
        /* A rate that moved with nothing in the pack to attribute it to is a defect, not a data
           point, so it is refused rather than drawn as an unexplained move. */
        if (crossed.length === 0) {
          return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "curve:" + kind + ":segment",
            "the marginal cost changed between two sampled levels with no pack threshold to attribute the move to",
            "declare the threshold that moved the rate in the rule pack; an unexplained move is refused rather than displayed");
        }
      }
      var segmentKind = changed ? segmentKindFor(crossed) : "flat";
      segments.push(Object.freeze({
        fromLevel: points[index - 1].level,
        toLevel: points[index].level,
        segmentKind: segmentKind,
        cliff: segmentKind === "rate-step" || segmentKind === "cliff",
        contributingThresholds: Object.freeze(crossed)
      }));
    }

    var contributors = curveUnavailableContributors(pack);
    /* There is no averageRate member and no scalar summary rate here by construction: a view
       cannot read an average off a curve that does not carry one. */
    return Object.freeze({
      contractVersion: CURVE_CONTRACT,
      packRef: Object.freeze({ id: pack.id, version: pack.version, contentSha256: pack.contentSha256 }),
      kind: kind,
      sweep: Object.freeze({
        start: sweep.start, end: sweep.end, step: sweep.step,
        probe: sweep.probe, maxPoints: sweep.maxPoints
      }),
      points: Object.freeze(points),
      segments: Object.freeze(segments),
      unavailableContributors: contributors,
      incomplete: contributors.length > 0,
      unavailableContributorCount: contributors.length
    });
  }

  /* One record, two renderings. The chart and the text-equivalent table both read these rows, so
     a table assembled from a second derivation cannot disagree with the drawn series. */
  function curveTextRows(curve) {
    var rows = [];
    if (!isPlainObject(curve) || curve.contractVersion !== CURVE_CONTRACT) return Object.freeze(rows);
    var index = 0;
    for (index = 0; index < curve.points.length; index += 1) {
      var segment = index === 0 ? null : curve.segments[index - 1];
      rows.push(Object.freeze({
        level: curve.points[index].level,
        taxAtLevel: curve.points[index].taxAtLevel,
        effectiveMarginalRate: curve.points[index].effectiveMarginalRate,
        statutoryBandRate: curve.points[index].statutoryBandRate,
        statutoryBandId: curve.points[index].statutoryBandId,
        segmentKind: segment === null ? null : segment.segmentKind,
        cliff: segment === null ? false : segment.cliff,
        contributingThresholds: segment === null ? Object.freeze([]) : segment.contributingThresholds,
        ruleStatus: curve.points[index].ruleStatus
      }));
    }
    return Object.freeze(rows);
  }

  /* CO-10 display rounding, owned by the view. The raw and displayed values are returned side by
     side so the calculation stage and the display stage stay separately testable. */
  function formatForDisplay(valueRecord, displayPolicy) {
    if (rules.isUnavailable(valueRecord)) return valueRecord;
    var factor = displayPolicy.factor;
    if (!Number.isFinite(factor) || factor <= 0) {
      return rules.unavailable("RLTAX-CONFIG-INVALID", "display:displayRounding.factor",
        "the display rounding factor must be a finite number greater than zero",
        "correct display.displayRounding.factor in the configuration");
    }
    return Object.freeze({
      contractVersion: DISPLAY_CONTRACT,
      raw: valueRecord.value,
      displayed: Math.round(valueRecord.value * factor) / factor,
      policy: displayPolicy.mode,
      ruleStatus: valueRecord.ruleStatus
    });
  }

  /* CO-15. The property-tax leg. Feature 023 Scope 01.
     It takes the household's declared assessment and the sourced relief regime and NOTHING
     else: there is deliberately no parameter through which a federal or state income figure
     could arrive, because a property tax does not move with income and a signature that
     accepted one would invite a consumer to assume it does. The whole computation is delegated
     to rltaxproperty.js; this function only lifts the settlement into the leg shape the
     reconciliation and the surfaces already speak. A refusal is carried through as the leg's
     own record rather than collapsed to a zero. */
  function composePropertyLeg(assessment, regime) {
    var settlement = property.computePropertyTax(assessment, regime);
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        legId: "property-tax",
        stageId: "CO-15",
        available: false,
        refusal: settlement,
        marginalContext: property.propertyMarginalContext(settlement)
      });
    }
    return Object.freeze({
      legId: "property-tax",
      stageId: "CO-15",
      available: true,
      value: settlement.value,
      ruleStatus: settlement.ruleStatus,
      settlement: settlement,
      marginalContext: property.propertyMarginalContext(settlement)
    });
  }

  /* CO-20. The Social Security benefit leg. Feature 024 Scope 01.
     It takes the household's declared benefit inputs and the resolved BENEFIT pack and nothing
     else: there is deliberately no parameter through which a federal income figure could arrive,
     because the benefit a household receives is not a function of the income this settlement is
     pricing, and a signature that accepted one would invite a consumer to assume it is.

     The leg IDENTITY is read from the pack's own declared leg set rather than from a list in this
     module, so a later leg cannot be silently dropped by a hardcoded array that nobody updated.
     A refusal is carried through as the leg's own record rather than collapsed to a zero: a
     household whose indexing series could not be retrieved has not been told its benefit is
     nothing. */
  function composeBenefitLeg(declaration, benefitPack) {
    var declaredLegs = socialsecurity.declaredBenefitLegs(benefitPack);
    if (declaredLegs.length === 0) {
      return Object.freeze({
        legId: null,
        stageId: "CO-20",
        available: false,
        refusal: rules.unavailable("RLTAX-PACK-INVALID", "benefit-leg:CO-20",
          "the resolved benefit pack declares no leg set, so no leg identity exists to publish",
          "declare the leg set in the benefit pack; the leg identity is never supplied by the engine"),
        marginalContext: socialsecurity.benefitMarginalContext(
          rules.unavailable("RLTAX-PACK-INVALID", "benefit-leg:CO-20",
            "the resolved benefit pack declares no leg set",
            "declare the leg set in the benefit pack"))
      });
    }
    var declaredLeg = declaredLegs[0];
    var settlement = socialsecurity.computeBenefitSettlement(declaration, benefitPack);
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        legId: declaredLeg.legId,
        stageId: declaredLeg.stageId,
        includedInTotal: declaredLeg.includedInTotal === true,
        available: false,
        refusal: settlement,
        marginalContext: socialsecurity.benefitMarginalContext(settlement)
      });
    }
    return Object.freeze({
      legId: declaredLeg.legId,
      stageId: declaredLeg.stageId,
      includedInTotal: declaredLeg.includedInTotal === true,
      available: true,
      value: settlement.value,
      ruleStatus: settlement.ruleStatus,
      settlement: settlement,
      marginalContext: socialsecurity.benefitMarginalContext(settlement)
    });
  }

  /* CO-21. The Social Security inclusion leg. Feature 024 Scope 02.
     It takes the household's own declaration and the SETTLED benefit amount, and nothing else.
     There is deliberately no parameter through which the settlement's modified adjusted gross
     measure could arrive, because provisional income is not that measure and a signature that
     accepted it would invite a consumer to pass it.

     The included amount is published as a NAMED CONTRIBUTOR to ordinary taxable income rather
     than as a new income kind: `SUPPORTED_INCOME_KINDS` is unchanged and the pack's `incomeKinds`
     member is unchanged. A leg that had added a kind would have changed what every prior feature's
     income vocabulary means. */
  function composeInclusionLeg(declaration, benefitAmount, pack) {
    var declaredLegs = inclusion.declaredInclusionLegs(pack);
    if (declaredLegs.length === 0) {
      return Object.freeze({
        legId: null,
        stageId: "CO-21",
        available: false,
        refusal: rules.unavailable("RLTAX-PACK-INVALID", "inclusion-leg:CO-21",
          "the resolved federal pack declares no inclusion leg set, so no leg identity exists to publish",
          "declare the leg set in the pack's inclusion policy; the leg identity is never supplied by the engine"),
        marginalContext: inclusion.inclusionMarginalContext(
          rules.unavailable("RLTAX-PACK-INVALID", "inclusion-leg:CO-21",
            "the resolved federal pack declares no inclusion leg set",
            "declare the leg set in the pack's inclusion policy"))
      });
    }
    var declaredLeg = declaredLegs[0];
    var settlement = inclusion.computeInclusionSettlement(declaration, benefitAmount, pack);
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        legId: declaredLeg.legId,
        stageId: declaredLeg.stageId,
        includedInTotal: declaredLeg.includedInTotal === true,
        contributesTo: declaredLeg.contributesTo,
        available: false,
        refusal: settlement,
        marginalContext: inclusion.inclusionMarginalContext(settlement)
      });
    }
    return Object.freeze({
      legId: declaredLeg.legId,
      stageId: declaredLeg.stageId,
      includedInTotal: declaredLeg.includedInTotal === true,
      contributesTo: declaredLeg.contributesTo,
      available: true,
      value: settlement.value,
      ruleStatus: settlement.ruleStatus,
      settlement: settlement,
      marginalContext: inclusion.inclusionMarginalContext(settlement)
    });
  }

  /* The named contribution the inclusion makes to ordinary taxable income, published as a record
     rather than folded silently into a number. An unavailable inclusion contributes NOTHING and
     says so; it never contributes a zero, because a household whose base amount could not be
     carried has not been told that none of its benefit is taxable. */
  function ordinaryTaxableIncomeContribution(inclusionLeg) {
    if (!isPlainObject(inclusionLeg) || inclusionLeg.available !== true) {
      return Object.freeze({
        contractVersion: "OrdinaryTaxableIncomeContribution/v1",
        contributorId: "social-security-inclusion",
        available: false,
        amount: null,
        refusal: isPlainObject(inclusionLeg) && inclusionLeg.refusal ? inclusionLeg.refusal : null,
        addsIncomeKind: false
      });
    }
    return Object.freeze({
      contractVersion: "OrdinaryTaxableIncomeContribution/v1",
      contributorId: inclusionLeg.legId,
      available: true,
      amount: inclusionLeg.value,
      refusal: null,
      /* Structural, not prose: this contributor adds no member to the supported income-kind set,
         and the assertion that both counts are unchanged reads this flag. */
      addsIncomeKind: false
    });
  }

  /* CO-22. The Medicare premium stage. Feature 024 Scope 04.
     It takes the household's DECLARED lookback income, the resolved MEDICARE pack and the
     declared filing status, and nothing else. There is deliberately no parameter through which
     this file's own settlement, its modified adjusted gross measure, or the workspace holding the
     current year's income could arrive — and the module this stage delegates to cannot reach them
     either, because it does not import this file.

     Its position after `CO-21` in the declared order is POSITIONAL ONLY. `CO-21` produces an
     included benefit amount and this stage reads none of it; reversing the two would change
     nothing, which is precisely the property FR-024-023 asks for and a positional ordering alone
     would not give.

     The three legs it produces are COSTS. Each carries `includedInTotal: false` read from the
     pack's own declaration, and the annual cost is published separately rather than folded into
     any tax figure. */
  function composeMedicareStage(lookback, medicarePack, filingStatus) {
    var premiumLegs = medicare.computePremiumLegs(lookback, medicarePack, filingStatus);
    if (rules.isUnavailable(premiumLegs)) {
      return Object.freeze({
        stageId: "CO-22",
        available: false,
        refusal: premiumLegs,
        legs: Object.freeze([]),
        bracket: null,
        annualCost: premiumLegs
      });
    }
    var annualCost = medicare.annualMedicareCost(premiumLegs);
    return Object.freeze({
      stageId: premiumLegs.stageId,
      available: true,
      refusal: null,
      legs: premiumLegs.legs,
      bracket: premiumLegs.bracket,
      bracketSet: premiumLegs.bracketSet,
      lookbackYear: premiumLegs.lookbackYear,
      declaredLookbackAmount: premiumLegs.declaredLookbackAmount,
      requiredLookbackYear: premiumLegs.requiredLookbackYear,
      premiumYear: premiumLegs.premiumYear,
      lookbackOffsetYears: premiumLegs.lookbackOffsetYears,
      quotedOffsetBasis: premiumLegs.quotedOffsetBasis,
      annualCost: annualCost
    });
  }

  /* CO-23. The claim-age comparison. Feature 024 Scope 03.     It takes the household's own benefit declarations, the whole claim ages it declared, the
     resolved MORTALITY pack and the resolved BENEFIT pack, and nothing else. There is
     deliberately no parameter through which a federal figure, a settlement or a workspace could
     arrive, because comparing claim ages touches no tax total and a signature that accepted one
     would invite a consumer to assume it does.

     This stage adds NO leg. It publishes a comparison rather than a figure that enters any total,
     and giving it a leg identity would put it into a leg census it has no business being in. */
  function composeClaimAgeStage(declaration, claimAges, mortalityPack, benefitPack, columnId, declaredYear) {
    var basis = claimage.resolveMortalityBasis(mortalityPack, columnId, declaredYear);
    var basisRefusal = rules.isUnavailable(basis) ? basis : null;
    var comparison = claimage.composeClaimAgeComparison(declaration, claimAges, basis, benefitPack);
    if (rules.isUnavailable(comparison)) {
      return Object.freeze({
        stageId: "CO-23",
        available: false,
        refusal: comparison,
        mortalityBasis: basisRefusal === null ? basis : null,
        basisRefusal: basisRefusal
      });
    }
    return Object.freeze({
      stageId: "CO-23",
      available: true,
      refusal: null,
      comparison: comparison,
      mortalityBasis: basisRefusal === null ? basis : null,
      basisRefusal: basisRefusal
    });
  }

  /* CO-24. The surfacing census. Feature 024 Scope 05.

     It takes the settled leg record, the leg set each surface actually rendered, and the leg set
     that entered `totalFederalTax`, and reports where those three disagree. It computes no figure
     and settles nothing; a census that had to recompute anything could disagree with the surfaces
     it is auditing, which would make it useless as an audit.

     Three finding kinds, and keeping them apart is the whole point. A leg the record declares and
     a surface did not render is a MISSING leg, named with the surface it is missing from. A leg a
     surface rendered that the record does not declare is an UNDECLARED leg, which is the other
     direction of the same identity and is what stops a surface passing by rendering everything.
     A leg the record declares as a cost — `includedInTotal` false — that nonetheless entered the
     federal total is a MIS-SUMMED leg, and it is a different failure entirely: every surface holds
     it, so a census that only compared surface membership would report nothing at all while the
     headline silently overstated what the household owes by the size of a premium. */
  function composeSurfaceCensus(declaredLegs, surfaceMemberships, includedTotalLegIds) {
    var findings = [];
    var surfaces = [];
    var declaredIds = [];
    var index = 0;
    var surfaceIndex = 0;
    for (index = 0; index < declaredLegs.length; index += 1) declaredIds.push(declaredLegs[index].legId);
    var surfaceNames = Object.keys(surfaceMemberships);
    surfaceNames.sort();
    for (surfaceIndex = 0; surfaceIndex < surfaceNames.length; surfaceIndex += 1) {
      var surfaceName = surfaceNames[surfaceIndex];
      var rendered = surfaceMemberships[surfaceName];
      surfaces.push(surfaceName);
      for (index = 0; index < declaredIds.length; index += 1) {
        if (rendered.indexOf(declaredIds[index]) < 0) {
          findings.push(Object.freeze({
            kind: "missing-leg",
            legId: declaredIds[index],
            surface: surfaceName,
            statement: "the settled leg " + declaredIds[index]
              + " is declared by the record and is absent from the " + surfaceName + " surface"
          }));
        }
      }
      for (index = 0; index < rendered.length; index += 1) {
        if (declaredIds.indexOf(rendered[index]) < 0) {
          findings.push(Object.freeze({
            kind: "undeclared-leg",
            legId: rendered[index],
            surface: surfaceName,
            statement: "the " + surfaceName + " surface renders " + rendered[index]
              + ", which the settled record does not declare"
          }));
        }
      }
    }
    /* The mis-summed pass. It is deliberately OUTSIDE the per-surface loop: a mis-summed leg is
       not a fact about any one surface, it is a fact about the total, so it is reported once and
       names no surface. Reporting it per surface would produce one finding per surface for a
       single defect and would make it indistinguishable from a leg missing from four of them. */
    var summedIds = includedTotalLegIds === undefined || includedTotalLegIds === null
      ? [] : includedTotalLegIds;
    for (index = 0; index < declaredLegs.length; index += 1) {
      if (declaredLegs[index].includedInTotal === false
          && summedIds.indexOf(declaredLegs[index].legId) >= 0) {
        findings.push(Object.freeze({
          kind: "mis-summed-leg",
          legId: declaredLegs[index].legId,
          surface: null,
          statement: "the settled leg " + declaredLegs[index].legId
            + " is declared as a cost the record must never add, and it entered the federal tax total"
        }));
      }
    }
    return Object.freeze({
      contractVersion: "SurfaceCensus/v1",
      surfaces: Object.freeze(surfaces),
      declaredLegIds: Object.freeze(declaredIds),
      findings: Object.freeze(findings),
      clean: findings.length === 0
    });
  }

  /* Feature 023 Scope 04. The housing stages and what each one needs before it can run. The
     ORDER is not written down anywhere: it is derived from these dependency edges, so `CO-16`
     precedes `CO-17` because the rental settlement declares that it needs the classification,
     not because a list happens to name it first. Reversing the two is therefore impossible
     without deleting the edge that says why. */  var HOUSING_STAGES = Object.freeze([
    Object.freeze({ stageId: "CO-15", dependsOn: Object.freeze([]) }),
    Object.freeze({ stageId: "CO-16", dependsOn: Object.freeze([]) }),
    Object.freeze({ stageId: "CO-17", dependsOn: Object.freeze(["CO-16"]) }),
    Object.freeze({ stageId: "CO-18", dependsOn: Object.freeze(["CO-15", "CO-17"]) }),
    /* Feature 023 Scope 05. The disposition depends on CO-17 because the basis it reads is the
       one the rental settlement's cost recovery adjusted. Declaring the edge is what makes that
       dependency a fact the order is derived from rather than a comment. */
    Object.freeze({ stageId: "CO-19", dependsOn: Object.freeze(["CO-17"]) })
  ]);

  /* The derived ordered array. A stage is emitted only once every stage it depends on has been
     emitted; a cycle emits nothing further and is refused rather than resolved by falling back
     to declaration order. */
  function housingStageOrder(pack) {
    var emitted = {};
    var order = [];
    var progressed = true;
    var index = 0;
    while (progressed) {
      progressed = false;
      for (index = 0; index < HOUSING_STAGES.length; index += 1) {
        var stage = HOUSING_STAGES[index];
        if (emitted[stage.stageId] === true) continue;
        var ready = true;
        var edge = 0;
        for (edge = 0; edge < stage.dependsOn.length; edge += 1) {
          if (emitted[stage.dependsOn[edge]] !== true) ready = false;
        }
        if (!ready) continue;
        emitted[stage.stageId] = true;
        order.push(stage.stageId);
        progressed = true;
      }
    }
    if (order.length !== HOUSING_STAGES.length) {
      return rules.unavailable("RLTAX-CONFIG-INVALID", "housing-stages:order",
        "the housing stage dependencies do not resolve to an order, so the stage a settlement runs after cannot be established",
        "remove the dependency cycle; the order is derived from the edges and is never fallen back to declaration order");
    }
    return Object.freeze({
      contractVersion: "HousingStageOrder/v1",
      order: Object.freeze(order),
      ruleStatus: rules.ruleStatusFor(pack, pack)
    });
  }

  /* CO-16. The dwelling-use classification leg. Feature 023 Scope 04.
     It takes the household's declared day counts and the resolved rule pack and NOTHING else,
     and the whole classification is delegated to rltaxuse.js. A refusal is carried through as
     the leg's own record rather than collapsed to a category, because an unclassified dwelling
     and a dwelling classified as not-a-residence are different claims and only one of them is a
     finding. */
  function composeUseClassificationLeg(declaration, pack) {
    var classification = use.classifyDwellingUse(declaration, pack);
    if (rules.isUnavailable(classification)) {
      return Object.freeze({
        legId: "dwelling-use",
        stageId: "CO-16",
        available: false,
        refusal: classification,
        marginalContext: use.useMarginalContext(classification)
      });
    }
    return Object.freeze({
      legId: "dwelling-use",
      stageId: "CO-16",
      available: true,
      category: classification.category,
      ruleStatus: classification.ruleStatus,
      classification: classification,
      marginalContext: use.useMarginalContext(classification)
    });
  }

  /* CO-17. The rental leg. Feature 023 Scope 03, routed by Scope 04's published classification.
     It takes the household's declared rental activity, the resolved rule pack and — when the
     household declared personal use of the dwelling — the classification CO-16 published. The
     whole computation is delegated to rltaxrental.js; this function only lifts the settlement
     into the leg shape the reconciliation and the surfaces already speak. A refusal is carried
     through as the leg's own record rather than collapsed to a zero, which is what keeps a pack
     that could not establish a recovery period or an allowance from reading as a rental worth
     nothing.

     A dwelling the publication EXCLUDES contributes no leg value at all. It is not a zero leg:
     `available` is false and the exclusion is carried whole, so a reader is shown the reason
     rather than a figure that would read as a rental that settled to nothing. */
  function composeRentalLeg(activity, pack, classification) {
    var settlement = rental.computeRentalSettlement(activity, pack, classification);
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        legId: "rental-net",
        stageId: "CO-17",
        available: false,
        refusal: settlement,
        marginalContext: rental.rentalMarginalContext(settlement)
      });
    }
    if (settlement.excluded === true) {
      return Object.freeze({
        legId: "rental-net",
        stageId: "CO-17",
        available: false,
        excluded: true,
        settlement: settlement,
        refusal: rules.unavailable("RLTAX-FEATURE-UNSUPPORTED", "rental-settlement:excluded",
          settlement.exclusionReason,
          "no action is required: the sourced rule removes this activity from rental reporting, and the figure is absent because the authority excludes it rather than because anything could not be established"),
        marginalContext: rental.rentalMarginalContext(settlement)
      });
    }
    return Object.freeze({
      legId: "rental-net",
      stageId: "CO-17",
      available: true,
      value: settlement.value,
      ruleStatus: settlement.ruleStatus,
      settlement: settlement,
      marginalContext: rental.rentalMarginalContext(settlement)
    });
  }

  /* CO-19. The disposition legs. Feature 023 Scope 05.
     Two legs, not one, because the gain is priced under two different rules and a single leg
     would have to pick one of them. The recapture leg's tax is the sourced maximum rate applied
     to its amount, which `rltaxdisposition.js` computes because the rate is the only figure that
     component needs. The remainder leg's tax is computed HERE, by handing the amount to the same
     `stackPreferentialIncome` CO-7 uses — so the disposition composes WITH the existing
     preferential model rather than beside it, and there is exactly one implementation of the
     band walk in the repository.

     The remainder stacks on top of the household's ordinary income AND its existing preferential
     income, and its tax is the DIFFERENCE the addition made. Stacking it from zero instead would
     price a sale as though the household had no other preferential income, which understates the
     tax for exactly the households that have both.

     The adjusted basis is the one the rental settlement's cost recovery published when there is
     one. Reading it rather than re-deriving it is what keeps this stage from needing the rental
     engine: if the basis were not published, settling a sale would require reaching into it. */
  function composeDispositionLegs(declaration, workspace, pack, publishedAdjustedBasis) {
    var effective = declaration;
    var basisOrigin = "declared-by-the-household";
    if (Number.isFinite(publishedAdjustedBasis) && isPlainObject(declaration)) {
      var copied = {};
      var keys = Object.keys(declaration);
      var keyIndex = 0;
      for (keyIndex = 0; keyIndex < keys.length; keyIndex += 1) copied[keys[keyIndex]] = declaration[keys[keyIndex]];
      copied.adjustedBasis = publishedAdjustedBasis;
      effective = Object.freeze(copied);
      basisOrigin = "published-by-the-rental-cost-recovery";
    }
    var settlement = disposition.computeDisposition(effective, pack);
    var context = disposition.dispositionMarginalContext(settlement);
    if (rules.isUnavailable(settlement)) {
      /* Both legs refuse together. There is deliberately no branch that, having failed to price
         the recapture component, prices the whole gain under the preferential model instead. */
      return Object.freeze({
        stageId: "CO-19",
        available: false,
        refusal: settlement,
        basisOrigin: basisOrigin,
        legs: Object.freeze([]),
        marginalContext: context
      });
    }
    var exclusion = disposition.applyResidenceExclusion(settlement, effective, pack, workspace.filingStatus);
    if (settlement.isLoss === true) {
      /* A loss carries no priced components. It is published whole with its treatment named,
         and it contributes no leg rather than a zero leg. */
      return Object.freeze({
        stageId: "CO-19",
        available: false,
        isLoss: true,
        settlement: settlement,
        exclusion: exclusion,
        basisOrigin: basisOrigin,
        legs: Object.freeze([]),
        marginalContext: context
      });
    }
    var status = rules.ruleStatusFor(pack, pack);
    var basis = computeTaxableIncome(workspace, pack);
    var preferentialTable = pack.preferentialRateTables[workspace.filingStatus];
    var recaptureComponent = null;
    var remainderComponent = null;
    var index = 0;
    for (index = 0; index < settlement.components.length; index += 1) {
      if (settlement.components[index].pricingRule === "own-maximum-rate") {
        recaptureComponent = settlement.components[index];
      } else {
        remainderComponent = settlement.components[index];
      }
    }
    /* The exclusion reduces the REMAINDER only. When it refused, nothing is excluded and the
       whole remainder is taxed. The refusal does NOT travel onto this leg: the leg below still
       publishes `available: true` and an unqualified figure computed from a zero exclusion.
       That is deliberate rather than accidental — it errs toward overstating tax rather than
       understating it, the refusal itself is rendered in `#power-disposition`, and `TP-05-13`
       pins the unexcluded remainder — but it is not what the leg's own shape says. Whether the
       leg should instead refuse, or should publish carrying the refusal as a qualification, is
       an open contract question recorded as F-AUDIT-05 in Feature 023 Scope 05. This comment
       states what the line does; it previously claimed the opposite. */
    var excluded = rules.isUnavailable(exclusion) ? 0 : exclusion.excludedAmount;
    var taxableRemainder = remainderComponent.amount - excluded;

    var remainderLeg = null;
    if (rules.isAbsentFigure(preferentialTable)) {
      remainderLeg = Object.freeze({
        legId: disposition.REMAINDER_COMPONENT_ID,
        stageId: "CO-19",
        available: false,
        refusal: rules.absentFigureRefusal(preferentialTable, "disposition-remainder:" + workspace.filingStatus),
        component: remainderComponent,
        marginalContext: context
      });
    } else {
      var withoutDisposition = stackPreferentialIncome(
        basis.ordinaryTaxableIncome, basis.preferentialTaxableIncome, preferentialTable);
      var withDisposition = stackPreferentialIncome(
        basis.ordinaryTaxableIncome, basis.preferentialTaxableIncome + taxableRemainder, preferentialTable);
      remainderLeg = Object.freeze({
        legId: disposition.REMAINDER_COMPONENT_ID,
        stageId: "CO-19",
        available: true,
        value: withDisposition.tax - withoutDisposition.tax,
        amount: taxableRemainder,
        pricingRule: remainderComponent.pricingRule,
        stackedOnTop: basis.ordinaryTaxableIncome + basis.preferentialTaxableIncome,
        bandDetail: withDisposition.bandDetail,
        ruleStatus: rules.ruleStatusFor(pack, preferentialTable),
        component: remainderComponent,
        marginalContext: context
      });
    }
    var recaptureLeg = Object.freeze({
      legId: disposition.RECAPTURE_COMPONENT_ID,
      stageId: "CO-19",
      available: true,
      value: recaptureComponent.tax,
      amount: recaptureComponent.amount,
      pricingRule: recaptureComponent.pricingRule,
      maximumRate: recaptureComponent.maximumRate,
      citation: recaptureComponent.citation,
      ruleStatus: status,
      component: recaptureComponent,
      marginalContext: context
    });
    return Object.freeze({
      stageId: "CO-19",
      available: remainderLeg.available === true,
      isLoss: false,
      settlement: settlement,
      exclusion: exclusion,
      basisOrigin: basisOrigin,
      legs: Object.freeze([recaptureLeg, remainderLeg]),
      marginalContext: context
    });
  }

  /* ---------- CO-18. The itemised deduction composition. Feature 023 Scope 02. ---------- */
  /* The component ids this stage can produce, and which of them share the sourced cap. Both
     facts are read from the PACK: the cap declares the components it governs, so a jurisdiction
     that caps a different family is a pack edit rather than a code edit. */
  var DECLARED_COMPONENT_ID = "other-itemized";
  var MORTGAGE_COMPONENT_ID = "mortgage-interest";

  function deductionCapFor(pack, filingStatus) {
    var caps = isPlainObject(pack) ? pack.deductionCaps : null;
    var cap = isPlainObject(caps) ? caps["state-and-local-tax"] : null;
    if (!isPlainObject(cap)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "deduction-cap:state-and-local-tax",
        "the resolved pack carries no cap for the capped deduction family, so the competition between its components cannot be settled",
        "author a pack that declares the cap with its filing-status amounts and its locator");
    }
    if (rules.isAbsentFigure(cap)) return rules.absentFigureRefusal(cap, "deduction-cap:state-and-local-tax");
    var amount = isPlainObject(cap.amounts) ? cap.amounts[filingStatus] : undefined;
    if (rules.isAbsentFigure(amount)) return rules.absentFigureRefusal(amount, "deduction-cap:state-and-local-tax:" + String(filingStatus));
    if (!Number.isFinite(amount)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "deduction-cap:state-and-local-tax:" + String(filingStatus),
        "the pack declares no cap amount for this filing status",
        "transcribe the cap amount for this filing status from its primary source with a locator");
    }
    return Object.freeze({ cap: cap, amount: amount });
  }

  /* The cap the household actually faces. A pack that states a reduction above a declared
     measure but could not establish the RATE of that reduction refuses above the threshold
     rather than publishing the unreduced cap, because an unreduced cap above the threshold is a
     figure the authority contradicts. Below the threshold the stated cap is exact. */
  function effectiveDeductionCap(resolved, filingStatus, measure) {
    var cap = resolved.cap;
    var thresholds = isPlainObject(cap.reductionThresholds) ? cap.reductionThresholds : null;
    var threshold = thresholds === null ? undefined : thresholds[filingStatus];
    if (!Number.isFinite(threshold)) {
      return Object.freeze({ amount: resolved.amount, reduced: false, threshold: null });
    }
    if (!Number.isFinite(measure) || measure <= threshold) {
      return Object.freeze({ amount: resolved.amount, reduced: false, threshold: threshold });
    }
    if (rules.isAbsentFigure(cap.reductionRate)) {
      return rules.absentFigureRefusal(cap.reductionRate, "deduction-cap:state-and-local-tax:reductionRate");
    }
    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "deduction-cap:state-and-local-tax:reductionRate",
      "the declared measure sits above the cap's reduction threshold and the pack states no reduction rate",
      "transcribe the reduction rate from its primary source with a locator; no reduced cap is derived from the threshold and the floor");
  }

  /* One component, with its allowed and disallowed halves always both present. A disallowed
     amount is COMPUTED even when it is zero, because an absent member and a computed zero are
     different claims and only one of them is a fact. */
  function deductionComponent(componentId, label, amount, origin, cappedWith, allowed) {
    return Object.freeze({
      componentId: componentId,
      label: label,
      amount: amount,
      origin: origin,
      cappedWith: Object.freeze(cappedWith.slice()),
      allowedAmount: allowed,
      disallowedAmount: amount - allowed
    });
  }

  /* The mortgage interest component. The deductible portion is the declared interest scaled by
     the sourced limit over the declared balance; an unretrieved limit refuses the component
     rather than deducting the declared interest in full, which is the one direction this rule
     must never err in. */
  function mortgageInterestComponent(workspace, pack) {
    var interest = workspace.mortgageInterestPaid;
    if (!Number.isFinite(interest)) return null;
    var set = isPlainObject(pack) ? pack.mortgageDebtLimits : null;
    var tiers = isPlainObject(set) && Array.isArray(set.tiers) ? set.tiers : [];
    var declaredTier = workspace.mortgageAcquisitionDebtTier;
    if (typeof declaredTier !== "string" || declaredTier.length === 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "deduction-component:mortgage-interest:tier",
        "the household declared mortgage interest without declaring which acquisition-debt tier the debt sits in, and the tiers carry different limits",
        "declare mortgageAcquisitionDebtTier as one of the tier ids the resolved pack declares");
    }
    var index = 0;
    var tier = null;
    for (index = 0; index < tiers.length; index += 1) {
      if (tiers[index] && tiers[index].tierId === declaredTier) tier = tiers[index];
    }
    if (tier === null) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "deduction-component:mortgage-interest:tier",
        "the declared acquisition-debt tier is not a tier the resolved pack declares",
        "declare a tier the pack carries; no tier is assumed and the higher tier is never substituted");
    }
    if (rules.isAbsentFigure(tier.limits)) {
      return rules.absentFigureRefusal(tier.limits, "deduction-component:mortgage-interest:" + declaredTier);
    }
    var limit = isPlainObject(tier.limits) ? tier.limits[workspace.filingStatus] : undefined;
    if (!Number.isFinite(limit)) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "deduction-component:mortgage-interest:" + declaredTier,
        "the pack declares no acquisition-debt limit for this filing status under the declared tier",
        "transcribe the limit for this filing status from its primary source with a locator");
    }
    var balance = workspace.mortgageAcquisitionDebtBalance;
    if (!Number.isFinite(balance)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "deduction-component:mortgage-interest:balance",
        "the household declared mortgage interest without declaring the acquisition-debt balance the limit applies to",
        "declare mortgageAcquisitionDebtBalance; no balance is assumed");
    }
    var allowed = balance > limit ? interest * (limit / balance) : interest;
    return deductionComponent(MORTGAGE_COMPONENT_ID, "Home mortgage interest", interest, "declared", [], allowed);
  }

  /* CO-18. Build the components, record each origin, apply the sourced cap to the family the
     cap declares, compute each capped component's disallowed share of the excess under the
     pack's declared apportionment rule, and RECOMPUTE the itemised-versus-standard decision
     from the two totals. No declared preference reaches this function: the workspace validator
     refuses a member expressing one, so there is nothing here to read. */
  function composeItemizedDeduction(workspace, pack, computedComponents, allocatedPersonalPortions) {
    var filingStatus = workspace.filingStatus;
    var resolved = deductionCapFor(pack, filingStatus);
    var standard = isPlainObject(pack.standardDeductions) ? pack.standardDeductions[filingStatus] : undefined;
    var standardAmount = isPlainObject(standard) && Number.isFinite(standard.amount) ? standard.amount : null;
    var status = rules.ruleStatusFor(pack, pack);
    /* F-AUDIT-01. The deduction the SETTLEMENT priced the tax on, obtained by making the very
       call `computeTaxableIncome` makes rather than by restating it. This composition is a
       comparison surface: FR-023-012 requires the itemised-versus-standard decision to be
       recomputed and the side named, and FR-023-014 requires it to be SURFACED — neither makes it
       an input to `computeAnnualFederalTax`, and the settlement deliberately applies the mode the
       household declared rather than substituting a computed side for a declaration. Publishing
       the settled deduction here is what lets every surface name which of the two produced the
       figure beside it instead of asserting the composed one did. */
    var settlementDeduction = selectDeduction(workspace, pack);
    var settlementSettled = !rules.isUnavailable(settlementDeduction);
    var settlementClause = settlementSettled
      ? "This comparison did not price the tax: the settlement applied the " + settlementDeduction.mode
        + " deduction, which is the mode the household declared, and that deduction is stated with its own amount on the settlement row."
      : "This comparison did not price the tax: the settlement could not establish a deduction at all, so no deduction amount was applied and none is shown as though it were.";

    function unavailableComposition(refusal) {
      return Object.freeze({
        contractVersion: "ItemizedComposition/v1",
        stageId: "CO-18",
        components: Object.freeze([]),
        cap: refusal,
        capBinding: "unavailable",
        itemizedTotal: refusal,
        standardDeduction: standardAmount,
        chosen: "unavailable",
        chosenReason: "The cap that decides this composition could not be established, so neither total is comparable and the standard deduction is not silently substituted in its place. "
          + settlementClause,
        settlementDeduction: settlementDeduction,
        agreesWithSettlement: null,
        refusal: refusal,
        ruleStatus: status
      });
    }

    if (rules.isUnavailable(resolved)) return unavailableComposition(resolved);
    var measure = isPlainObject(workspace.income)
      ? workspace.income.ordinary + workspace.income.qualifiedDividend + workspace.income.longTermCapitalGain
      : null;
    var effective = effectiveDeductionCap(resolved, filingStatus, measure);
    if (rules.isUnavailable(effective)) return unavailableComposition(effective);

    var cappedIds = Array.isArray(resolved.cap.cappedComponentIds) ? resolved.cap.cappedComponentIds : [];
    var components = [];
    var cappedFamily = [];
    var index = 0;
    var supplied = isPlainObject(computedComponents) ? computedComponents : {};
    for (index = 0; index < cappedIds.length; index += 1) {
      var componentId = cappedIds[index];
      var value = supplied[componentId];
      if (rules.isUnavailable(value)) return unavailableComposition(value);
      if (!Number.isFinite(value)) continue;
      cappedFamily.push(Object.freeze({ componentId: componentId, amount: value }));
    }
    var cappedSum = 0;
    for (index = 0; index < cappedFamily.length; index += 1) cappedSum += cappedFamily[index].amount;
    var excess = Math.max(0, cappedSum - effective.amount);
    var bound = excess > 0;
    for (index = 0; index < cappedFamily.length; index += 1) {
      var entry = cappedFamily[index];
      /* Pro-rata by component amount, which is what the pack declares. A zeroed disallowed
         amount would hide exactly which half of the family bought nothing. */
      var share = cappedSum > 0 ? (entry.amount / cappedSum) * excess : 0;
      var siblings = [];
      var siblingIndex = 0;
      for (siblingIndex = 0; siblingIndex < cappedFamily.length; siblingIndex += 1) {
        if (cappedFamily[siblingIndex].componentId !== entry.componentId) {
          siblings.push(cappedFamily[siblingIndex].componentId);
        }
      }
      components.push(deductionComponent(entry.componentId, entry.componentId, entry.amount,
        "computed", siblings, entry.amount - share));
    }

    var mortgage = mortgageInterestComponent(workspace, pack);
    if (rules.isUnavailable(mortgage)) return unavailableComposition(mortgage);
    if (mortgage !== null) components.push(mortgage);

    /* FR-023-027. The personal half of every allocated dwelling expense enters HERE, as a named
       component with origin "computed", so it competes inside the composition like every other
       component instead of being discarded at the allocation. A component with a zero amount is
       still added: the allocation computed that zero, and dropping it would make a household
       whose whole dwelling was rented indistinguishable from one whose personal share was never
       routed at all. */
    var personalPortions = Array.isArray(allocatedPersonalPortions) ? allocatedPersonalPortions : [];
    for (index = 0; index < personalPortions.length; index += 1) {
      var portion = personalPortions[index];
      if (rules.isUnavailable(portion)) return unavailableComposition(portion);
      if (!isPlainObject(portion) || !Number.isFinite(portion.amount)) continue;
      components.push(deductionComponent(portion.componentId, portion.label,
        portion.amount, "computed", [], portion.amount));
    }

    /* The previously-declared lump sum survives as ONE named component. That is what lets every
       Feature 021 and 022 fixture produce its exact prior federal total under the composed
       shape before any new component is added. */
    if (Number.isFinite(workspace.itemizedAmount) && workspace.itemizedAmount > 0) {
      components.push(deductionComponent(DECLARED_COMPONENT_ID, "Other itemised deductions you declared",
        workspace.itemizedAmount, "declared", [], workspace.itemizedAmount));
    }

    var itemizedTotal = 0;
    for (index = 0; index < components.length; index += 1) itemizedTotal += components[index].allowedAmount;

    var chosen = null;
    var chosenReason = null;
    if (!Number.isFinite(standardAmount)) {
      return unavailableComposition(rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE",
        "itemized-composition:standardDeduction",
        "the pack carries no standard deduction for this filing status, so the two sides cannot be compared",
        "resolve a pack that declares the standard deduction for this filing status"));
    }
    var onTie = isPlainObject(pack.deductionChoicePolicy) ? pack.deductionChoicePolicy.onTie : null;
    if (itemizedTotal > standardAmount) {
      chosen = "itemized";
      chosenReason = "The itemised total is larger than the standard deduction, so this composed comparison names itemising. "
        + settlementClause;
    } else if (itemizedTotal < standardAmount) {
      chosen = "standard";
      chosenReason = "The itemised total is smaller than the standard deduction, so this composed comparison names the standard deduction and the capped components changed nothing. "
        + settlementClause;
    } else if (onTie === "itemized" || onTie === "standard") {
      chosen = onTie;
      chosenReason = "The two totals are equal, so the composed deduction is identical either way and the pack's declared tie rule named this side. "
        + settlementClause;
    } else {
      return unavailableComposition(rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE",
        "itemized-composition:tie",
        "the two totals are equal and the pack declares no tie rule, so the larger side cannot be named",
        "declare a deductionChoicePolicy.onTie member in the pack"));
    }

    var composedAmount = chosen === "itemized" ? itemizedTotal : standardAmount;
    return Object.freeze({
      contractVersion: "ItemizedComposition/v1",
      stageId: "CO-18",
      components: Object.freeze(components),
      cap: effective.amount,
      capApportionmentRule: resolved.cap.apportionmentRule,
      capExcess: excess,
      capBinding: bound ? "bound" : "unbound",
      itemizedTotal: itemizedTotal,
      standardDeduction: standardAmount,
      appliedDeduction: composedAmount,
      chosen: chosen,
      chosenReason: chosenReason,
      /* The two sides of F-AUDIT-01, published together so no surface can state one and imply the
         other. `appliedDeduction` above is the amount THIS COMPARISON names; `settlementDeduction`
         is the one the tax was priced on. They diverge whenever the household's declared mode is
         not the larger side, or whenever a component this comparison composes never reached the
         settlement, and `agreesWithSettlement` says which case a reader is in. */
      settlementDeduction: settlementDeduction,
      agreesWithSettlement: settlementSettled
        ? (settlementDeduction.mode === chosen && settlementDeduction.value === composedAmount)
        : null,
      refusal: null,
      ruleStatus: status
    });
  }

  var api = Object.freeze({
    activeBandContext: activeBandContext,
    applyRateTable: applyRateTable,
    composeItemizedDeduction: composeItemizedDeduction,
    composePropertyLeg: composePropertyLeg,
    composeBenefitLeg: composeBenefitLeg,
    composeInclusionLeg: composeInclusionLeg,
    composeClaimAgeStage: composeClaimAgeStage,
    composeMedicareStage: composeMedicareStage,
    composeSurfaceCensus: composeSurfaceCensus,
    ordinaryTaxableIncomeContribution: ordinaryTaxableIncomeContribution,
    composeDispositionLegs: composeDispositionLegs,
    composeRentalLeg: composeRentalLeg,
    composeUseClassificationLeg: composeUseClassificationLeg,
    computeAdditionalMedicareTax: computeAdditionalMedicareTax,
    computeAnnualFederalTax: computeAnnualFederalTax,
    computeEffectiveMarginalCurve: computeEffectiveMarginalCurve,
    computeNetInvestmentIncomeTax: computeNetInvestmentIncomeTax,
    computeTaxableIncome: computeTaxableIncome,
    crossedThresholds: crossedThresholds,
    crossedThresholdSets: crossedThresholdSets,
    curveTextRows: curveTextRows,
    curveWorkspaceAt: curveWorkspaceAt,
    formatForDisplay: formatForDisplay,
    housingStageOrder: housingStageOrder,
    nextThresholdEdge: nextThresholdEdge,
    reconcileAnnualFederalTax: reconcileAnnualFederalTax,
    selectDeduction: selectDeduction,
    stackPreferentialIncome: stackPreferentialIncome,
    sumDeclaredLegs: sumDeclaredLegs,
    thresholdForStatus: thresholdForStatus,
    unsupportedFeatureNotices: unsupportedFeatureNotices
  });

  root.RLTAX = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
