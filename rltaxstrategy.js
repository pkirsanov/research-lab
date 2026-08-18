/* Lifetime Tax Strategy Lab — the two-policy bracket-fill conversion comparison.
 *
 * This module owns ConversionComparison/v1, the fill amount, and the closed notModeled[]
 * membership. It owns NO tax arithmetic and NO bracket edge: both policies are priced by the
 * settlement engine RLTAX, and every threshold is read from the resolved rule pack. Its result
 * record carries none of the forbidden members the record key-set test enumerates, and that
 * test is what proves it rather than this sentence.
 *
 * UMD dual module: attaches to the global AND sets module.exports. Never ESM.
 */
(function () {
  "use strict";

  var root = (typeof globalThis !== "undefined") ? globalThis :
    ((typeof window !== "undefined") ? window : {});

  var rules = root.RLTAXRULES;
  var engine = root.RLTAX;
  if (typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    if (!rules) rules = require("./rltaxrules");
    if (!engine) engine = require("./rltax");
  }
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXSTRATEGY");
  if (!engine) throw new Error("RLTAX must be loaded before RLTAXSTRATEGY");

  var COMPARISON_CONTRACT = "ConversionComparison/v1";

  /* Exactly two. There is no third policy, no ranking between them, and no preferred one. */
  var POLICY_IDS = Object.freeze(["no-conversion", "fill-to-bracket"]);

  /* What the comparison did NOT vary, published so a reader sees the fairness of the two states
     rather than trusting it. */
  var HELD_CONSTANT = Object.freeze([
    "filingStatus", "declaredTaxYear", "packContentSha256", "deductionMode", "itemizedAmount",
    "qualifiedDividend", "longTermCapitalGain", "taxExemptInterest", "conversionFundingSource"
  ]);

  /* Closed membership, eight entries, each with a reason and its deferral code. This is a
     structural member of every result rather than page copy, so neither a rendering change nor a
     later scope can quietly shrink it. In this slice it is most of what actually decides a
     conversion. */
  var NOT_MODELED = Object.freeze([
    Object.freeze({
      id: "state-tax",
      label: "State and local income tax",
      reason: "The resolved pack covers the federal jurisdiction only, so no state boundary is priced.",
      deferralCode: "RLTAX-JURISDICTION-UNSUPPORTED"
    }),
    Object.freeze({
      id: "medicare-and-irmaa",
      label: "Medicare premiums and IRMAA bands",
      reason: "The pack now declares the adjustment bands, but IRMAA uses a two-year income lookback and this model computes no future year, so the premium a conversion made this year would change lands two premium years away and is not priced here.",
      deferralCode: "RLTAX-FEATURE-UNSUPPORTED"
    }),
    Object.freeze({
      id: "premium-tax-credit",
      label: "Premium tax credit",
      reason: "The pack declares no premium tax credit schedule, so a conversion's marketplace subsidy effect is not priced.",
      deferralCode: "RLTAX-FEATURE-UNSUPPORTED"
    }),
    Object.freeze({
      id: "roth-five-year-clocks",
      label: "Roth five-year clocks",
      reason: "Each converted amount starts its own five-year clock, which is a multi-year rule outside this single-year slice.",
      deferralCode: "RLTAX-SCOPE-DEFERRED"
    }),
    Object.freeze({
      id: "later-year-distribution-pressure",
      label: "Later-year distribution pressure",
      reason: "A conversion changes what later years must distribute, and this slice settles one declared tax year only.",
      deferralCode: "RLTAX-SCOPE-DEFERRED"
    }),
    Object.freeze({
      id: "required-distribution-pressure",
      label: "Required minimum distribution pressure",
      reason: "Required distributions depend on later balances and ages, which this single-year slice does not model.",
      deferralCode: "RLTAX-SCOPE-DEFERRED"
    }),
    Object.freeze({
      id: "survivor-effects",
      label: "Survivor filing-status effects",
      reason: "A surviving spouse files under a different status with different edges, which is a later-year effect.",
      deferralCode: "RLTAX-SCOPE-DEFERRED"
    }),
    Object.freeze({
      id: "lost-growth-on-taxes-paid",
      label: "Lost growth on taxes paid",
      reason: "Dollars spent on conversion tax stop compounding, and this slice carries no growth model.",
      deferralCode: "RLTAX-SCOPE-DEFERRED"
    })
  ]);

  var FUNDING_SOURCES = Object.freeze({ "outside-funds": true, "withheld": true });

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  function conversionNotModeled() {
    return NOT_MODELED;
  }

  function conversionPolicyIds() {
    return POLICY_IDS;
  }

  /* The edge is the upperExclusive of the band the household named, read straight off the
     resolved pack. This module declares no edge, so moving a pack edge moves the fill amount. */
  function bracketEdgeRecord(pack, filingStatus, bracketId) {
    var table = isPlainObject(pack) && isPlainObject(pack.ordinaryRateTables)
      ? pack.ordinaryRateTables[filingStatus] : undefined;
    if (table === undefined || table === null) {
      return rules.unavailable("RLTAX-FILING-STATUS-UNSUPPORTED", "conversion:bracketEdge",
        "the resolved pack carries no ordinary rate table for the declared filing status",
        "declare a filing status the pack carries, or resolve a pack that declares this one");
    }
    if (rules.isAbsentFigure(table)) {
      return rules.absentFigureRefusal(table, "conversion:bracketEdge:" + String(filingStatus));
    }
    if (!isNonEmptyString(bracketId)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "conversion:selectedBracketId",
        "no ordinary-income bracket was selected to fill",
        "select one band from the resolved pack's own ordinary rate table");
    }
    var index = 0;
    for (index = 0; index < table.bands.length; index += 1) {
      if (table.bands[index].bandId !== bracketId) continue;
      if (!Number.isFinite(table.bands[index].upperExclusive)) {
        return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "conversion:bracketEdge:" + bracketId,
          "the selected band is unbounded above, so the pack declares no finite edge to fill to",
          "select a band the pack bounds above; a fill target must be a finite number");
      }
      return Object.freeze({
        value: table.bands[index].upperExclusive,
        bandId: bracketId,
        tableId: table.tableId,
        sourceRef: table.sourceRef,
        locator: table.locator,
        ruleStatus: rules.ruleStatusFor(pack, table)
      });
    }
    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "conversion:selectedBracketId:" + bracketId,
      "the selected bracket names no band in the resolved pack's ordinary rate table",
      "select a bandId the resolved pack declares");
  }

  /* The distance from the household's current ordinary TAXABLE income to the named edge. A
     household already at or above the edge receives a labelled zero, which is a real answer:
     the bracket is already full. It is never a negative amount and never an Unavailable. */
  function fillToBracketConversion(workspace, pack, bracketId) {
    var edge = bracketEdgeRecord(pack, isPlainObject(workspace) ? workspace.filingStatus : null, bracketId);
    if (rules.isUnavailable(edge)) return edge;
    var baseline = engine.computeAnnualFederalTax(workspace, pack);
    if (rules.isUnavailable(baseline.ordinaryTaxableIncome)) return baseline.ordinaryTaxableIncome;
    var distance = edge.value - baseline.ordinaryTaxableIncome.value;
    var atOrAboveEdge = distance <= 0;
    return Object.freeze({
      value: atOrAboveEdge ? 0 : distance,
      atOrAboveEdge: atOrAboveEdge,
      bracketEdge: edge,
      ruleStatus: edge.ruleStatus
    });
  }

  /* The converted state differs from the declared state in ORDINARY INCOME ONLY. */
  function convertedWorkspace(workspace, amount) {
    var next = {};
    var keys = Object.keys(workspace);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) next[keys[index]] = workspace[keys[index]];
    next.income = {
      ordinary: workspace.income.ordinary + amount,
      qualifiedDividend: workspace.income.qualifiedDividend,
      longTermCapitalGain: workspace.income.longTermCapitalGain,
      taxExemptInterest: workspace.income.taxExemptInterest
    };
    return next;
  }

  /* One sampled level, at the fill edge, using the configured probe. The marginal cost is read
     from the curve rather than from a statutory bracket rate, because the statutory rate is not
     the cost of the next dollar and citing it here would be the exact defect this tool exists
     to surface. */
  function edgeSweepPolicy(sweep, level) {
    if (!isPlainObject(sweep)) {
      return rules.unavailable("RLTAX-CONFIG-INVALID", "conversion:sweep",
        "the sweep policy is missing, so the marginal cost at the fill edge has no declared probe",
        "supply the configuration's sweep policy; this module carries no sweep constant of its own");
    }
    if (!Number.isFinite(level)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "conversion:edgeLevel",
        "the converted ordinary income level is not a finite number",
        "declare a finite ordinary income amount and a selectable bracket");
    }
    return Object.freeze({
      contractVersion: sweep.contractVersion,
      kinds: sweep.kinds,
      start: level,
      end: level,
      step: sweep.step,
      probe: sweep.probe,
      maxPoints: sweep.maxPoints
    });
  }

  function marginalRateAtEdge(workspace, pack, sweep, level) {
    var edgeSweep = edgeSweepPolicy(sweep, level);
    if (rules.isUnavailable(edgeSweep)) return edgeSweep;
    var curve = engine.computeEffectiveMarginalCurve(workspace, pack, "ordinary", edgeSweep);
    if (rules.isUnavailable(curve)) return curve;
    if (curve.points.length === 0) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "conversion:effectiveMarginalRateAtEdge",
        "the curve returned no sampled point at the fill edge",
        "widen the configured sweep so the fill edge is inside its declared range");
    }
    /* The curve's own incompleteness is inherited rather than dropped: where the curve says it
       is missing contributors, the comparison says so too instead of presenting the marginal
       cost as settled. */
    return Object.freeze({
      value: curve.points[0].effectiveMarginalRate,
      level: curve.points[0].level,
      statutoryBandRate: curve.points[0].statutoryBandRate,
      statutoryBandId: curve.points[0].statutoryBandId,
      inheritedIncomplete: curve.incomplete,
      unavailableContributorCount: curve.unavailableContributorCount,
      ruleStatus: curve.points[0].ruleStatus
    });
  }

  /* The two cases differ materially, so neither is assumed. An undeclared funding source is an
     explicit Unavailable naming what would make it available. */
  function conversionFundingSource(workspace) {
    if (isPlainObject(workspace) && FUNDING_SOURCES[workspace.conversionFundingSource] === true) {
      return workspace.conversionFundingSource;
    }
    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "conversion:fundingSource",
      "the household did not declare whether conversion tax is paid from outside funds or withheld from the converted amount",
      "declare outside-funds or withheld; the two cases differ materially and neither is assumed");
  }

  /* The single largest named contributor to the cost of the conversion: the crossed curve
     segment maximising the marginal rate times the conversion dollars falling inside it. Ties
     break by the lower fromLevel, so the line is deterministic rather than narrated. */
  function strongestTradeoffSegment(curve, fromLevel, toLevel) {
    if (rules.isUnavailable(curve)) return curve;
    if (!isPlainObject(curve) || !Array.isArray(curve.segments) || curve.segments.length === 0) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "conversion:strongestTradeoff",
        "no curve segment is available over the converted range, so no tradeoff can be named",
        "supply a curve whose declared sweep covers the conversion range");
    }
    if (!Number.isFinite(fromLevel) || !Number.isFinite(toLevel) || toLevel <= fromLevel) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "conversion:strongestTradeoff",
        "the conversion moves no dollars, so no segment carries a tradeoff",
        "select a bracket whose edge sits above current ordinary taxable income");
    }
    var best = null;
    var index = 0;
    for (index = 0; index < curve.segments.length; index += 1) {
      var segment = curve.segments[index];
      var overlap = Math.min(segment.toLevel, toLevel) - Math.max(segment.fromLevel, fromLevel);
      if (!(overlap > 0)) continue;
      var rate = curve.points[index].effectiveMarginalRate;
      var weight = rate * overlap;
      if (best !== null && !(weight > best.weight)) continue;
      best = {
        weight: weight,
        name: segment.contributingThresholds.length > 0
          ? segment.contributingThresholds[0].name
          : ("band " + String(curve.points[index].statutoryBandId)),
        effectiveMarginalRate: rate,
        dollars: overlap,
        fromLevel: segment.fromLevel,
        toLevel: segment.toLevel,
        segmentKind: segment.segmentKind
      };
    }
    if (best === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "conversion:strongestTradeoff",
        "no curve segment overlaps the converted range",
        "widen the configured sweep so the conversion range is inside its declared bounds");
    }
    return Object.freeze({
      name: best.name,
      effectiveMarginalRate: best.effectiveMarginalRate,
      dollars: best.dollars,
      fromLevel: best.fromLevel,
      toLevel: best.toLevel,
      segmentKind: best.segmentKind,
      ruleStatus: curve.points[0].ruleStatus
    });
  }

  /* Exactly two policies, identical workspace, identical resolved pack. Both call the settlement
     engine, so neither is priced by a second definition of tax. The converted case runs the whole
     computation again rather than adding a marginal-rate product to the baseline: the added
     ordinary income raises ordinary taxable income, which slides the preferential stacking window
     upward, and a marginal-rate product is blind to that interaction. */
  function compareConversionPolicies(workspace, pack, bracketId, sweep) {
    var edge = bracketEdgeRecord(pack, isPlainObject(workspace) ? workspace.filingStatus : null, bracketId);
    var conversion = fillToBracketConversion(workspace, pack, bracketId);
    var conversionRefused = rules.isUnavailable(conversion);
    var baseSettlement = engine.computeAnnualFederalTax(workspace, pack);
    var filledSettlement = conversionRefused
      ? null
      : engine.computeAnnualFederalTax(convertedWorkspace(workspace, conversion.value), pack);
    var status = rules.ruleStatusFor(pack, pack);

    var conversionAmount = conversionRefused ? conversion : Object.freeze({
      value: conversion.value,
      atOrAboveEdge: conversion.atOrAboveEdge,
      ruleStatus: conversion.ruleStatus
    });

    var policies = Object.freeze([
      Object.freeze({ policyId: POLICY_IDS[0], settlement: baseSettlement }),
      Object.freeze({ policyId: POLICY_IDS[1], settlement: filledSettlement === null ? conversion : filledSettlement })
    ]);

    var federalTaxDifference = null;
    if (conversionRefused) {
      federalTaxDifference = conversion;
    } else if (rules.isUnavailable(baseSettlement.totalFederalTax)) {
      federalTaxDifference = baseSettlement.totalFederalTax;
    } else if (rules.isUnavailable(filledSettlement.totalFederalTax)) {
      federalTaxDifference = filledSettlement.totalFederalTax;
    } else if (baseSettlement.packRef.contentSha256 !== filledSettlement.packRef.contentSha256) {
      federalTaxDifference = rules.unavailable("RLTAX-PACK-INVALID", "conversion:federalTaxDifference",
        "the two policies did not settle against one identical rule pack, so their difference is not comparable",
        "settle both policies against the identical resolved pack before reporting a difference");
    } else {
      federalTaxDifference = Object.freeze({
        value: filledSettlement.totalFederalTax.value - baseSettlement.totalFederalTax.value,
        ruleStatus: status
      });
    }

    var effectiveMarginalRateAtEdge = conversionRefused
      ? conversion
      : marginalRateAtEdge(workspace, pack, sweep, workspace.income.ordinary + conversion.value);

    return Object.freeze({
      contractVersion: COMPARISON_CONTRACT,
      packRef: Object.freeze({ id: pack.id, version: pack.version, contentSha256: pack.contentSha256 }),
      selectedBracketId: isNonEmptyString(bracketId) ? bracketId : null,
      bracketEdge: edge,
      conversionAmount: conversionAmount,
      heldConstant: HELD_CONSTANT,
      policies: policies,
      federalTaxDifference: federalTaxDifference,
      effectiveMarginalRateAtEdge: effectiveMarginalRateAtEdge,
      fundingSource: conversionFundingSource(workspace),
      notModeled: NOT_MODELED,
      resultKindStatement: "single-year federal tax difference",
      isRecommendation: false
    });
  }

  var api = Object.freeze({
    bracketEdgeRecord: bracketEdgeRecord,
    compareConversionPolicies: compareConversionPolicies,
    conversionFundingSource: conversionFundingSource,
    conversionNotModeled: conversionNotModeled,
    conversionPolicyIds: conversionPolicyIds,
    convertedWorkspace: convertedWorkspace,
    edgeSweepPolicy: edgeSweepPolicy,
    fillToBracketConversion: fillToBracketConversion,
    marginalRateAtEdge: marginalRateAtEdge,
    strongestTradeoffSegment: strongestTradeoffSegment
  });

  root.RLTAXSTRATEGY = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
