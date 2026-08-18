/* Lifetime Tax Strategy Lab — the combined federal-plus-state settlement and the combined
 * marginal-rate curve.
 *
 * This module COMPOSES two settlements that are already correct. It re-derives neither. It holds
 * NO tax-domain numeric constant, NO jurisdiction name, NO bracket, NO rate and NO threshold:
 * every edge it samples and every threshold it attributes is read off a resolved pack, and every
 * figure it reports is a settlement result or a difference of two settlement results.
 *
 * The independence is structural rather than conventional: `combineSettlements` calls the federal
 * settlement with the workspace and the federal pack, and the state settlement with the workspace
 * and the state pack, and passes no figure from either into the other. `orderIndependence` is
 * produced by actually settling both orders and comparing the serialised results, never by a
 * constant.
 *
 * UMD dual module: attaches to the global AND sets module.exports. Never ESM.
 */
(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});

  function requireModule(globalName, relativePath) {
    var found = root[globalName];
    if (!found && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
      found = require(relativePath);
    }
    if (!found) throw new Error(globalName + " must be loaded before RLTAXCOMBINED");
    return found;
  }

  var rules = requireModule("RLTAXRULES", "./rltaxrules");
  var engine = requireModule("RLTAX", "./rltax");
  var stateEngine = requireModule("RLTAXSTATE", "./rltaxstate");

  var SETTLEMENT_CONTRACT = "CombinedSettlement/v1";
  var CURVE_CONTRACT = "CombinedMarginalCurve/v1";

  var CURVE_KIND_FIELDS = Object.freeze({ "ordinary": "ordinary", "long-term-gain": "longTermCapitalGain" });
  var SWEEP_MEMBERS = Object.freeze(["start", "end", "step", "probe", "maxPoints"]);

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function valued(value, ruleStatus) {
    return Object.freeze({ value: value, ruleStatus: ruleStatus });
  }

  function packYears(pack) {
    return (isPlainObject(pack) && Array.isArray(pack.effectiveTaxYears))
      ? pack.effectiveTaxYears.slice()
      : [];
  }

  function packId(pack) {
    return isPlainObject(pack) && typeof pack.id === "string" ? pack.id : "unnamed-pack";
  }

  /* Refuse when the declared year is not a member of BOTH packs' effective years. The refusal
     carries both pack ids and both year arrays, because a refusal naming one side of a mismatch
     sends the operator to the wrong pack. */
  function assertPackYearAgreement(federalPack, statePack, declaredTaxYear) {
    var federalYears = packYears(federalPack);
    var stateYears = packYears(statePack);
    var agrees = federalYears.indexOf(declaredTaxYear) >= 0 && stateYears.indexOf(declaredTaxYear) >= 0;
    if (agrees) {
      return Object.freeze({ federalYears: Object.freeze(federalYears), stateYears: Object.freeze(stateYears), agrees: true });
    }
    return rules.unavailable("RLTAX-PACK-YEAR-MISMATCH", "combined:declaredTaxYear:" + String(declaredTaxYear),
      "the declared tax year " + String(declaredTaxYear) + " is not effective in both resolved packs: " +
      packId(federalPack) + " declares [" + federalYears.join(", ") + "] and " +
      packId(statePack) + " declares [" + stateYears.join(", ") + "]",
      "align the pair: resolve packs for " + packId(federalPack) + " and " + packId(statePack) +
      " that both declare the requested year effective; neither pack's thresholds are carried into the other's year");
  }

  /* The three terminal shapes of a jurisdiction total, and the one place they are added. The
     branch is on contractVersion, never on a value comparison, so a sourced zero is a real addend
     rather than something a `value === 0` test could quietly skip. */
  function addendOf(total) {
    if (rules.isUnavailable(total)) return Object.freeze({ ok: false, refusal: total, kind: "refusal" });
    if (rules.isSourcedZero(total)) return Object.freeze({ ok: true, amount: total.value, kind: "sourced-zero" });
    if (isPlainObject(total) && Number.isFinite(total.value)) {
      return Object.freeze({ ok: true, amount: total.value, kind: "valued" });
    }
    return Object.freeze({
      ok: false,
      kind: "malformed",
      refusal: rules.unavailable("RLTAX-PACK-INVALID", "combined:addend",
        "a jurisdiction total is neither a valued record, a sourced zero nor a refusal",
        "return one of the three declared terminal shapes from every settlement")
    });
  }

  /* The coupling this feature does NOT model, stated as a structural member rather than page copy
     so a rendering change cannot drop it. `modeled` is a required empty array so a later feature
     that models a coupling adds to a list a reader is already looking at. */
  function crossJurisdictionCoupling(workspace) {
    var itemized = isPlainObject(workspace) && workspace.deductionMode === "itemized";
    return Object.freeze({
      modeled: Object.freeze([]),
      notModeled: Object.freeze([Object.freeze({
        id: "federal-itemized-salt-deduction",
        deferralCode: "RLTAX-FEATURE-UNSUPPORTED",
        reason: "A household that itemises federally may deduct state income tax paid, so the federal settlement and the state settlement are coupled in law. This tool does not model that coupling: the declared itemised amount is used exactly as declared, the computed state tax is not added to it, and no fixed point is iterated, because a fixed-point figure has no retrieved source behind it."
      })]),
      itemizedNotice: itemized
        ? "The deduction mode declared is itemised. The itemised amount was used exactly as declared. The state tax computed here was not added to it, and this tool did not check whether the household had already included state income tax in the amount it declared."
        : null
    });
  }

  /* Two settlements, neither of which can reach the other. There is no parameter through which a
     federal figure could enter the state settlement, and that absence is the whole independence
     claim. `orderIndependence.asserted` is computed by settling both orders and comparing the
     serialised results, so a coupling introduced anywhere in either settlement fails it. */
  function combineSettlements(workspace, federalPack, statePack) {
    var declaredYear = isPlainObject(workspace) ? workspace.declaredTaxYear : undefined;
    var agreement = assertPackYearAgreement(federalPack, statePack, declaredYear);
    if (rules.isUnavailable(agreement)) return agreement;

    var federalFirst = engine.computeAnnualFederalTax(workspace, federalPack);
    var stateFirst = stateEngine.computeAnnualStateTax(workspace, statePack);
    var stateSecond = stateEngine.computeAnnualStateTax(workspace, statePack);
    var federalSecond = engine.computeAnnualFederalTax(workspace, federalPack);
    var orderIndependent = JSON.stringify(federalFirst) === JSON.stringify(federalSecond)
      && JSON.stringify(stateFirst) === JSON.stringify(stateSecond);

    var federalAddend = addendOf(federalFirst.totalFederalTax);
    var stateAddend = addendOf(isPlainObject(stateFirst) && stateFirst.contractVersion === "StateSettlement/v1"
      ? stateFirst.totalStateTax
      : stateFirst);
    var status = rules.ruleStatusFor(federalPack, federalPack);

    var combinedTotal = null;
    if (!federalAddend.ok) combinedTotal = federalAddend.refusal;
    else if (!stateAddend.ok) combinedTotal = stateAddend.refusal;
    else combinedTotal = valued(federalAddend.amount + stateAddend.amount, status);

    var grossSupportedIncome = rules.isUnavailable(federalFirst.grossSupportedIncome)
      ? null
      : federalFirst.grossSupportedIncome.value;
    var combinedAverage = null;
    if (rules.isUnavailable(combinedTotal)) {
      combinedAverage = combinedTotal;
    } else if (Number.isFinite(grossSupportedIncome) && grossSupportedIncome > 0) {
      combinedAverage = valued(combinedTotal.value / grossSupportedIncome, status);
    } else {
      combinedAverage = rules.unavailable("RLTAX-INPUT-INCOMPLETE", "combined:averageRate",
        "an average rate over zero supported income has no meaning",
        "declare a supported income amount greater than zero");
    }

    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      declaredTaxYear: declaredYear,
      federal: federalFirst,
      state: stateFirst,
      packYearAgreement: agreement,
      federalTotalKind: federalAddend.kind,
      stateTotalKind: stateAddend.kind,
      combinedTotalTax: combinedTotal,
      combinedAverageRate: combinedAverage,
      orderIndependence: Object.freeze({
        asserted: orderIndependent,
        method: "settle-both-orders-and-compare"
      }),
      crossJurisdictionCoupling: crossJurisdictionCoupling(workspace),
      /* Never true in this slice: both packs carry a non-empty unsupportedFeatures list, so no
         result may be labelled a complete combined tax. */
      completeCombinedTax: false
    });
  }

  function curveConfigRefusal(member, reason) {
    return rules.unavailable("RLTAX-CONFIG-INVALID", "combined-sweep:" + member, reason,
      "correct the sweep." + member + " member of the configuration; the combined curve carries no sweep constant of its own");
  }

  function validateSweepPolicy(sweep, kind) {
    if (CURVE_KIND_FIELDS[kind] === undefined) {
      return rules.unavailable("RLTAX-FEATURE-UNSUPPORTED", "combined-curve:kind:" + String(kind),
        "the curve kind is outside the closed pair ordinary and long-term-gain",
        "request the ordinary curve or the long-term-gain curve");
    }
    if (!isPlainObject(sweep)) return curveConfigRefusal("policy", "the sweep policy is missing or is not an object");
    var index = 0;
    for (index = 0; index < SWEEP_MEMBERS.length; index += 1) {
      if (!Number.isFinite(sweep[SWEEP_MEMBERS[index]])) {
        return curveConfigRefusal(SWEEP_MEMBERS[index], "the sweep member must be a finite number");
      }
    }
    if (sweep.step <= 0) return curveConfigRefusal("step", "the sweep step must be greater than zero");
    if (sweep.probe <= 0) return curveConfigRefusal("probe", "the sweep probe must be greater than zero");
    if (sweep.end < sweep.start) return curveConfigRefusal("end", "the sweep end must not sit below the sweep start");
    if (!Array.isArray(sweep.kinds) || sweep.kinds.indexOf(kind) < 0) {
      return curveConfigRefusal("kinds", "the sweep policy does not declare this curve kind");
    }
    return null;
  }

  function workspaceAt(workspace, kind, level) {
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

  /* Every edge a resolved pack declares, expressed as the measure it is compared against. The
     edges are read off the pack; this module holds none of them and knows the name of no
     jurisdiction. */
  function declaredEdges(pack, filingStatus, jurisdiction) {
    var edges = [];
    /* Each pack's edges are compared against that pack's OWN taxable measure. Comparing a state
       bracket edge against the federal taxable income would attribute the wrong government's
       move, or none at all. */
    var isFederal = pack.jurisdiction === "federal";
    var ownTaxable = isFederal ? "ordinaryTaxable" : "stateTaxable";
    var ownTotalTaxable = isFederal ? "totalTaxable" : "stateTaxable";
    function pushBandEdges(table, measureName) {
      if (!isPlainObject(table) || rules.isAbsentFigure(table) || !Array.isArray(table.bands)) return;
      var index = 0;
      for (index = 0; index < table.bands.length; index += 1) {
        var band = table.bands[index];
        if (!isPlainObject(band) || !Number.isFinite(band.lowerInclusive) || band.lowerInclusive <= 0) continue;
        edges.push(Object.freeze({
          jurisdiction: jurisdiction,
          packId: packId(pack),
          measure: measureName,
          at: band.lowerInclusive,
          name: table.tableId + " lower edge of band " + band.bandId,
          tableId: table.tableId,
          bandId: band.bandId,
          thresholdKind: band.thresholdKind,
          sourceRef: table.sourceRef,
          locator: table.locator
        }));
      }
    }
    /* The level at which a fully absorbed deduction stops absorbing the next dollar is a real
       threshold owned by the pack's own deduction figure, not an unexplained move. */
    var deduction = isPlainObject(pack.standardDeductions) ? pack.standardDeductions[filingStatus] : null;
    if (isPlainObject(deduction) && !rules.isAbsentFigure(deduction) && Number.isFinite(deduction.amount)) {
      edges.push(Object.freeze({
        jurisdiction: jurisdiction,
        packId: packId(pack),
        measure: ownTaxable,
        at: 0,
        name: "the level at which the applied deduction stops absorbing the next dollar",
        tableId: null,
        bandId: null,
        thresholdKind: "rate-step",
        sourceRef: deduction.sourceRef,
        locator: deduction.locator
      }));
    }
    pushBandEdges(isPlainObject(pack.ordinaryRateTables) ? pack.ordinaryRateTables[filingStatus] : null, ownTaxable);
    /* A preferential band edge is reached twice: once by the TOP of the stacking window and once
       by its BOTTOM. Both moves are owned by the same declared edge, so both are attributed to
       it rather than left unexplained. */
    pushBandEdges(isPlainObject(pack.preferentialRateTables) ? pack.preferentialRateTables[filingStatus] : null, ownTotalTaxable);
    pushBandEdges(isPlainObject(pack.preferentialRateTables) ? pack.preferentialRateTables[filingStatus] : null, ownTaxable);
    var sets = isPlainObject(pack.thresholdSets) ? pack.thresholdSets : {};
    var keys = Object.keys(sets);
    var setIndex = 0;
    for (setIndex = 0; setIndex < keys.length; setIndex += 1) {
      var set = sets[keys[setIndex]];
      if (!isPlainObject(set) || rules.isAbsentFigure(set)) continue;
      var threshold = engine.thresholdForStatus(set, filingStatus);
      if (threshold === null) continue;
      var cappedShape = set.appliesTo === "modified-adjusted-gross-income-excess-capped-by";
      edges.push(Object.freeze({
        jurisdiction: jurisdiction,
        packId: packId(pack),
        /* An uncapped federal set reads a declared basis the sweep never varies, so it is
           measured against a quantity the curve does not track and can never cross. */
        measure: cappedShape ? "modifiedAdjustedGross" : (isFederal ? "declaredBasisNotSwept" : "stateTaxable"),
        at: threshold,
        name: set.thresholdSetId + " threshold for " + String(filingStatus),
        tableId: null,
        bandId: null,
        thresholdKind: "rate-step",
        sourceRef: set.sourceRef,
        locator: set.locator
      }));
      /* A capped set stops pricing the next dollar once its cap binds. That is a move the pack
         owns through its declared capMember, so it is attributed rather than unexplained. */
      if (cappedShape) {
        edges.push(Object.freeze({
          jurisdiction: jurisdiction,
          packId: packId(pack),
          measure: "cappedExcessOverCap",
          at: 0,
          name: set.thresholdSetId + " cap on " + String(set.capMember) + " begins to bind",
          tableId: null,
          bandId: null,
          thresholdKind: "rate-step",
          sourceRef: set.sourceRef,
          locator: set.locator
        }));
      }
    }
    /* Relief applied after rate application fully absorbs the tax until the tax overtakes it.
       The level at which it stops absorbing is a kink the relief mechanism owns, and it is not a
       fixed measure the pack states, so it is located by search rather than by formula. */
    var reliefList = Array.isArray(pack.reliefMechanisms) ? pack.reliefMechanisms : [];
    var reliefIndex = 0;
    for (reliefIndex = 0; reliefIndex < reliefList.length; reliefIndex += 1) {
      var relief = reliefList[reliefIndex];
      if (!rules.isReliefMechanism(relief) || relief.applicationPoint !== "after-rate-application") continue;
      var reliefAmount = relief.varyByFilingStatus === true ? relief.amounts[filingStatus] : relief.amounts.all;
      if (!Number.isFinite(reliefAmount) || reliefAmount <= 0) continue;
      edges.push(Object.freeze({
        jurisdiction: jurisdiction,
        packId: packId(pack),
        measure: isFederal ? "federalTaxTotal" : "stateTaxTotal",
        at: 0,
        name: relief.mechanismId + " stops fully absorbing the tax",
        tableId: null,
        bandId: null,
        thresholdKind: "rate-step",
        sourceRef: relief.sourceRef,
        locator: relief.locator
      }));
    }
    return edges;
  }

  function measuresOf(federalResult, stateResult) {
    var ordinaryTaxable = rules.isUnavailable(federalResult.ordinaryTaxableIncome) ? null : federalResult.ordinaryTaxableIncome.value;
    var totalTaxable = rules.isUnavailable(federalResult.totalTaxableIncome) ? null : federalResult.totalTaxableIncome.value;
    var magi = federalResult.marginalContext.modifiedAdjustedGrossMeasure;
    var stateTaxable = (isPlainObject(stateResult) && isPlainObject(stateResult.marginalContext))
      ? stateResult.marginalContext.stateTaxableMeasure
      : null;
    /* How far the capped set's excess has run past the quantity capping it. It crosses zero at
       the level where the cap begins to bind, which is the level at which that leg stops pricing
       the next dollar. */
    var capped = federalResult.netInvestmentIncomeTax;
    var cappedExcessOverCap = (isPlainObject(capped) && !rules.isUnavailable(capped)
      && Number.isFinite(capped.excessOverThreshold) && Number.isFinite(capped.netInvestmentIncome))
      ? capped.excessOverThreshold - capped.netInvestmentIncome
      : null;
    var federalAddend = addendOf(federalResult.totalFederalTax);
    var stateTotal = (isPlainObject(stateResult) && stateResult.contractVersion === "StateSettlement/v1")
      ? stateResult.totalStateTax : stateResult;
    var stateAddend = addendOf(stateTotal);
    return Object.freeze({
      ordinaryTaxable: ordinaryTaxable,
      totalTaxable: totalTaxable,
      modifiedAdjustedGross: magi,
      stateTaxable: stateTaxable,
      cappedExcessOverCap: cappedExcessOverCap,
      federalTaxTotal: federalAddend.ok ? federalAddend.amount : null,
      stateTaxTotal: stateAddend.ok ? stateAddend.amount : null
    });
  }

  /* The smallest level in (lo, hi] at which a monotone predicate first holds, found by bounded
     bisection. Used only to place a sample exactly on a kink whose position is not a figure any
     pack states; it prices nothing and decides nothing. */
  function refineTransition(lo, hi, predicate) {
    var low = lo;
    var high = hi;
    var iteration = 0;
    for (iteration = 0; iteration < 60; iteration += 1) {
      var mid = (low + high) / 2;
      if (mid <= low || mid >= high) break;
      if (predicate(mid)) high = mid; else low = mid;
    }
    return high;
  }

  /* The union of the grid and BOTH jurisdictions' crossings. Each crossing contributes the pair
     (d - probe, d) so the step lands exactly on the edge, and nothing is synthesised between a
     pair. Dropping a jurisdiction's crossings to fit a budget would produce a curve that looks
     complete and says nothing about what it lost, so the budget refuses instead. */
  function combinedSampleLevels(workspace, federalPack, statePack, kind, sweep) {
    var levels = [];
    var seen = {};
    function record(level) {
      if (!Number.isFinite(level) || level < 0) return;
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
    for (index = 0; index < grid.length; index += 1) record(grid[index]);

    var edges = declaredEdges(federalPack, workspace.filingStatus, federalPack.jurisdiction)
      .concat(declaredEdges(statePack, workspace.filingStatus, statePack.jurisdiction));
    /* Walk the grid once and, at each grid position, convert every declared edge into the input
       level that reaches it. The offset between an input level and a measure is constant inside a
       settlement, so one settlement per grid position places every edge exactly. */
    var gridMeasures = [];
    var candidates = {};
    for (index = 0; index < grid.length; index += 1) {
      var here = workspaceAt(workspace, kind, grid[index]);
      var federalHere = engine.computeAnnualFederalTax(here, federalPack);
      var stateHere = stateEngine.computeAnnualStateTax(here, statePack);
      var measures = measuresOf(federalHere, stateHere);
      gridMeasures.push(measures);
      var edgeIndex = 0;
      for (edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        var edge = edges[edgeIndex];
        if (edge.measure === "federalTaxTotal" || edge.measure === "stateTaxTotal") continue;
        var measure = measures[edge.measure];
        if (!Number.isFinite(measure)) continue;
        var crossing = grid[index] + (edge.at - measure);
        if (crossing <= sweep.start || crossing > sweep.end) continue;
        if (crossing < grid[index] - sweep.step || crossing > grid[index] + sweep.step) continue;
        candidates[edge.measure + "|" + String(crossing)] = { measure: edge.measure, at: edge.at, level: crossing };
      }
    }
    /* A measure that is clamped at a grid position produces a candidate the offset does not
       actually reach. Each unique candidate is therefore confirmed by settling at it and checking
       that the measure really lands on the edge, so no sampled point is a sampling artifact. */
    var candidateKeys = Object.keys(candidates);
    var candidateIndex = 0;
    for (candidateIndex = 0; candidateIndex < candidateKeys.length; candidateIndex += 1) {
      var candidate = candidates[candidateKeys[candidateIndex]];
      var atCandidate = workspaceAt(workspace, kind, candidate.level);
      var federalAtCandidate = engine.computeAnnualFederalTax(atCandidate, federalPack);
      var stateAtCandidate = stateEngine.computeAnnualStateTax(atCandidate, statePack);
      var reached = measuresOf(federalAtCandidate, stateAtCandidate)[candidate.measure];
      if (!Number.isFinite(reached) || Math.abs(reached - candidate.at) > 0.005) continue;
      record(candidate.level - sweep.probe);
      record(candidate.level);
    }
    /* An absorption kink sits where a jurisdiction total first leaves zero. That level is not a
       figure any pack states, so it is located by bisection over the grid interval that contains
       it rather than by an offset formula. */
    function totalsAt(level, which) {
      var at = workspaceAt(workspace, kind, level);
      var federalThere = engine.computeAnnualFederalTax(at, federalPack);
      var stateThere = stateEngine.computeAnnualStateTax(at, statePack);
      return measuresOf(federalThere, stateThere)[which];
    }
    var absorptionMeasures = ["federalTaxTotal", "stateTaxTotal"];
    var whichIndex = 0;
    for (whichIndex = 0; whichIndex < absorptionMeasures.length; whichIndex += 1) {
      var which = absorptionMeasures[whichIndex];
      var hasEdge = edges.some(function (candidate) { return candidate.measure === which; });
      if (!hasEdge) continue;
      for (index = 1; index < grid.length; index += 1) {
        var before = gridMeasures[index - 1][which];
        var after = gridMeasures[index][which];
        if (!Number.isFinite(before) || !Number.isFinite(after) || before > 0 || after <= 0) continue;
        var found = refineTransition(grid[index - 1], grid[index], (function (member) {
          return function (level) { return totalsAt(level, member) > 0; };
        }(which)));
        if (found <= sweep.start || found > sweep.end) continue;
        record(found - sweep.probe);
        record(found);
      }
    }
    levels.sort(function (left, right) { return left - right; });
    return levels;
  }

  /* Which declared edges of either pack the probe dollar crossed between two sampled levels. The
     comparison is made against the measures one probe increment ahead, because that is where the
     dollar whose price the marginal rate reports actually sits. Every entry carries its
     jurisdiction and its pack id, because the entire value of a combined curve is knowing which
     government moved the rate. */
  function crossedEdges(edges, previousMeasures, currentMeasures, tolerance) {
    var crossed = [];
    var index = 0;
    for (index = 0; index < edges.length; index += 1) {
      var edge = edges[index];
      var before = previousMeasures[edge.measure];
      var after = currentMeasures[edge.measure];
      if (!Number.isFinite(before) || !Number.isFinite(after)) continue;
      /* The comparison uses the pack's OWN declared numerical tolerance rather than an exact
         zero, because a kink located by bisection lands a fraction of a cent away from the edge
         and every real edge in a rate table sits far outside that band. */
      var at = edge.at + tolerance;
      if (before <= at && after > at) {
        crossed.push(Object.freeze({
          jurisdiction: edge.jurisdiction,
          packId: edge.packId,
          name: edge.name,
          tableId: edge.tableId,
          bandId: edge.bandId,
          thresholdKind: edge.thresholdKind,
          sourceRef: edge.sourceRef,
          locator: edge.locator
        }));
      }
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

  /* Both packs' unsupported features, filtered by each pack's OWN movesMarginalRate declaration
     and tagged with the jurisdiction that could not price them. */
  function combinedUnavailableContributors(federalPack, statePack) {
    var contributors = [];
    function collect(pack) {
      var declared = rules.marginalRateContributors(pack);
      var index = 0;
      for (index = 0; index < declared.length; index += 1) {
        contributors.push(Object.freeze({
          jurisdiction: pack.jurisdiction,
          packId: packId(pack),
          id: declared[index].id,
          label: declared[index].label,
          code: declared[index].code,
          reason: declared[index].reason
        }));
      }
    }
    collect(federalPack);
    collect(statePack);
    return Object.freeze(contributors);
  }

  /* combinedMarginalRate(L) = federalMarginalRate(L) + stateMarginalRate(L), each a forward
     difference of two FULL settlements rather than a band lookup. The sum is separately checked
     against a single finite difference over the combined total: the two are identical only while
     the difference operator is linear and the two settlements are independent, which is exactly
     what makes the identity worth asserting. */
  function computeCombinedMarginalCurve(workspace, federalPack, statePack, kind, sweep) {
    var invalid = validateSweepPolicy(sweep, kind);
    if (invalid) return invalid;
    if (!isPlainObject(workspace) || !isPlainObject(workspace.income)
      || !isPlainObject(federalPack) || !isPlainObject(statePack)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "combined-curve:inputs",
        "the combined curve needs a workspace carrying an income record and two resolved packs",
        "resolve both packs and supply a complete workspace before requesting the curve");
    }
    var agreement = assertPackYearAgreement(federalPack, statePack, workspace.declaredTaxYear);
    if (rules.isUnavailable(agreement)) return agreement;

    var levels = combinedSampleLevels(workspace, federalPack, statePack, kind, sweep);
    if (levels.length > sweep.maxPoints) {
      return curveConfigRefusal("maxPoints",
        "the union of the grid and both jurisdictions' crossings exceeds the declared point budget; a budget refuses rather than dropping a jurisdiction's edges from the curve");
    }

    var edges = declaredEdges(federalPack, workspace.filingStatus, federalPack.jurisdiction)
      .concat(declaredEdges(statePack, workspace.filingStatus, statePack.jurisdiction));
    var status = rules.ruleStatusFor(federalPack, federalPack);
    var tolerance = federalPack.roundingPolicy.reconciliationTolerance;
    var points = [];
    var measureTrack = [];
    var federalCalls = 0;
    var stateCalls = 0;
    var index = 0;

    for (index = 0; index < levels.length; index += 1) {
      var here = workspaceAt(workspace, kind, levels[index]);
      var ahead = workspaceAt(workspace, kind, levels[index] + sweep.probe);
      var federalHere = engine.computeAnnualFederalTax(here, federalPack);
      var federalAhead = engine.computeAnnualFederalTax(ahead, federalPack);
      var stateHere = stateEngine.computeAnnualStateTax(here, statePack);
      var stateAhead = stateEngine.computeAnnualStateTax(ahead, statePack);
      federalCalls += 2;
      stateCalls += 2;

      var federalHereAddend = addendOf(federalHere.totalFederalTax);
      var federalAheadAddend = addendOf(federalAhead.totalFederalTax);
      if (!federalHereAddend.ok || !federalAheadAddend.ok) {
        var federalRefusal = federalHereAddend.ok ? federalAheadAddend.refusal : federalHereAddend.refusal;
        return rules.unavailable(federalRefusal.code, "combined-curve:" + kind + ":federal",
          "the federal settlement at a sampled level is unavailable, so the next dollar has no price there: " + federalRefusal.reason,
          federalRefusal.whatWouldMakeItAvailable);
      }
      var stateHereTotal = isPlainObject(stateHere) && stateHere.contractVersion === "StateSettlement/v1"
        ? stateHere.totalStateTax : stateHere;
      var stateAheadTotal = isPlainObject(stateAhead) && stateAhead.contractVersion === "StateSettlement/v1"
        ? stateAhead.totalStateTax : stateAhead;
      var stateHereAddend = addendOf(stateHereTotal);
      var stateAheadAddend = addendOf(stateAheadTotal);
      if (!stateHereAddend.ok || !stateAheadAddend.ok) {
        var stateRefusal = stateHereAddend.ok ? stateAheadAddend.refusal : stateHereAddend.refusal;
        return rules.unavailable(stateRefusal.code, "combined-curve:" + kind + ":state",
          "the state settlement at a sampled level is unavailable, so the next dollar has no price there: " + stateRefusal.reason,
          stateRefusal.whatWouldMakeItAvailable);
      }

      var federalRate = (federalAheadAddend.amount - federalHereAddend.amount) / sweep.probe;
      var stateRate = (stateAheadAddend.amount - stateHereAddend.amount) / sweep.probe;
      var combinedHere = federalHereAddend.amount + stateHereAddend.amount;
      var combinedAhead = federalAheadAddend.amount + stateAheadAddend.amount;
      var combinedRate = federalRate + stateRate;
      var singleDifference = (combinedAhead - combinedHere) / sweep.probe;
      if (Math.abs(combinedRate - singleDifference) > tolerance) {
        return rules.unavailable("RLTAX-RECONCILE", "combined-curve:" + kind + ":independence",
          "the sum of the two component marginal rates does not equal a single finite difference over the combined total, which can only happen if the two settlements are coupled",
          "remove the coupling; the combined rate is the sum of two independent settlements and is never a separate derivation");
      }

      measureTrack.push(measuresOf(federalAhead, stateAhead));
      points.push(Object.freeze({
        level: levels[index],
        federalTaxAtLevel: federalHereAddend.amount,
        stateTaxAtLevel: stateHereAddend.amount,
        combinedTaxAtLevel: combinedHere,
        federalMarginalRate: federalRate,
        stateMarginalRate: stateRate,
        combinedMarginalRate: combinedRate,
        stateTotalKind: stateHereAddend.kind,
        ruleStatus: status
      }));
    }

    var segments = [];
    for (index = 1; index < points.length; index += 1) {
      var changed = Math.abs(points[index - 1].combinedMarginalRate - points[index].combinedMarginalRate) > tolerance;
      var crossed = [];
      if (changed) {
        crossed = crossedEdges(edges, measureTrack[index - 1], measureTrack[index], tolerance);
        if (crossed.length === 0) {
          return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "combined-curve:" + kind + ":segment",
            "the combined marginal cost changed between two sampled levels with no threshold in either pack to attribute the move to",
            "declare the threshold that moved the rate in the pack that owns it; an unattributable move is refused rather than displayed");
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

    var contributors = combinedUnavailableContributors(federalPack, statePack);
    /* There is no averageRate member and no scalar summary rate here by construction: a view
       cannot read an average off a curve that does not carry one. */
    return Object.freeze({
      contractVersion: CURVE_CONTRACT,
      kind: kind,
      sweep: Object.freeze({
        start: sweep.start, end: sweep.end, step: sweep.step,
        probe: sweep.probe, maxPoints: sweep.maxPoints
      }),
      packRefs: Object.freeze({
        federal: Object.freeze({ id: federalPack.id, version: federalPack.version, contentSha256: federalPack.contentSha256 }),
        state: Object.freeze({ id: statePack.id, version: statePack.version, contentSha256: statePack.contentSha256 })
      }),
      settlementCalls: Object.freeze({ federal: federalCalls, state: stateCalls, points: points.length }),
      points: Object.freeze(points),
      segments: Object.freeze(segments),
      unavailableContributors: contributors,
      incomplete: contributors.length > 0,
      unavailableContributorCount: contributors.length
    });
  }

  /* One record, two renderings. The chart and the text-equivalent table both read these rows, so a
     table assembled from a second derivation cannot disagree with the drawn series. */
  function combinedCurveTextRows(curve) {
    var rows = [];
    if (!isPlainObject(curve) || curve.contractVersion !== CURVE_CONTRACT) return Object.freeze(rows);
    var index = 0;
    for (index = 0; index < curve.points.length; index += 1) {
      var segment = index === 0 ? null : curve.segments[index - 1];
      rows.push(Object.freeze({
        level: curve.points[index].level,
        federalTaxAtLevel: curve.points[index].federalTaxAtLevel,
        stateTaxAtLevel: curve.points[index].stateTaxAtLevel,
        combinedTaxAtLevel: curve.points[index].combinedTaxAtLevel,
        federalMarginalRate: curve.points[index].federalMarginalRate,
        stateMarginalRate: curve.points[index].stateMarginalRate,
        combinedMarginalRate: curve.points[index].combinedMarginalRate,
        segmentKind: segment === null ? null : segment.segmentKind,
        cliff: segment === null ? false : segment.cliff,
        contributingThresholds: segment === null ? Object.freeze([]) : segment.contributingThresholds,
        ruleStatus: curve.points[index].ruleStatus
      }));
    }
    return Object.freeze(rows);
  }

  var api = Object.freeze({
    addendOf: addendOf,
    assertPackYearAgreement: assertPackYearAgreement,
    combineSettlements: combineSettlements,
    combinedCurveTextRows: combinedCurveTextRows,
    combinedSampleLevels: combinedSampleLevels,
    combinedUnavailableContributors: combinedUnavailableContributors,
    computeCombinedMarginalCurve: computeCombinedMarginalCurve,
    crossJurisdictionCoupling: crossJurisdictionCoupling,
    declaredEdges: declaredEdges
  });

  root.RLTAXCOMBINED = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
