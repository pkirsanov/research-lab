/* Lifetime Tax Strategy Lab — the deterministic annual STATE settlement and the jurisdiction axis.
 *
 * This module owns StateResidency/v1, residency-pattern resolution, state pack resolution, and
 * the state settlement stages CO-13 and CO-14. It declares NO bracket, NO rate, NO band edge, NO
 * deduction amount, NO threshold, NO state name and NO postal code: every such value is read from
 * the resolved state rule pack, and the jurisdiction itself is a pattern rather than a list.
 *
 * `computeAnnualStateTax(workspace, statePack)` takes the workspace and the state pack AND NO
 * FEDERAL FIGURE. There is no parameter through which a federal result could reach it, which is
 * what makes the combined settlement's independence structural rather than conventional.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXSTATE");

  var engine = root.RLTAX;
  if (!engine && typeof module !== "undefined" && module && module.exports && typeof require === "function") {
    engine = require("./rltax");
  }
  if (!engine) throw new Error("RLTAX must be loaded before RLTAXSTATE");

  var RESIDENCY_CONTRACT = "StateResidency/v1";
  var SETTLEMENT_CONTRACT = "StateSettlement/v1";

  /* The single residency pattern this feature models. Every other declared pattern refuses under
     its own code, because a part-year resident of a fully supported state is not told that the
     state is unsupported. */
  var MODELLED_PATTERN = "full-year-resident";

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

  /* An undeclared residency is RLTAX-INPUT-INCOMPLETE naming the member. It is never read as
     "this household owes no state tax": a silent federal-only total presented as complete is the
     substitution this whole axis exists to prevent. */
  function residencyDeclaration(workspace) {
    var jurisdiction = isPlainObject(workspace) ? workspace.residencyJurisdiction : undefined;
    if (jurisdiction === null || jurisdiction === undefined) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "residency:residencyJurisdiction",
        "the household has not declared where it lives, and an undeclared residency is not an absence of state tax",
        "declare residencyJurisdiction; no residency is assumed and no state total is shown in its place");
    }
    if (!rules.isSupportedJurisdiction(jurisdiction)) {
      return rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "residency:" + String(jurisdiction),
        "the declared residency is outside the jurisdiction grammar",
        "declare the literal federal or state: followed by a two-letter upper-case postal code");
    }
    return Object.freeze({ contractVersion: RESIDENCY_CONTRACT, jurisdiction: jurisdiction });
  }

  /* The pattern is resolved separately from the jurisdiction and refuses under its own code.
     Routing an unsupported pattern through the jurisdiction code would tell a part-year resident
     that a fully supported state is unsupported, and would hide the real work item behind the
     wrong remediation. */
  function residencyPattern(workspace) {
    var declared = isPlainObject(workspace) ? workspace.residencyPattern : undefined;
    if (declared === null || declared === undefined) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "residency:residencyPattern",
        "the household has not declared its residency pattern",
        "declare " + rules.RESIDENCY_PATTERNS.join(", ") + "; no pattern is assumed");
    }
    if (rules.RESIDENCY_PATTERNS.indexOf(declared) < 0) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "residency:residencyPattern",
        "the declared residency pattern is outside the declared patterns",
        "declare " + rules.RESIDENCY_PATTERNS.join(", ") + "; no pattern is assumed");
    }
    if (declared !== MODELLED_PATTERN) {
      return rules.unavailable("RLTAX-RESIDENCY-UNSUPPORTED", "residency:pattern:" + declared,
        "this tool models a single full-year residency and does not model the declared pattern " + declared,
        "an apportionment model carrying source rules and a residency-period split would be needed; the declared jurisdiction itself may be fully supported");
    }
    return Object.freeze({ contractVersion: RESIDENCY_CONTRACT, pattern: declared });
  }

  /* Resolve the pack for a declared residency. A declared state with no shipped pack refuses by
     name, and the remediation names the state rather than the tool. */
  function resolveStatePack(workspace, packsByJurisdiction, request) {
    var declaration = residencyDeclaration(workspace);
    if (rules.isUnavailable(declaration)) return declaration;
    var pattern = residencyPattern(workspace);
    if (rules.isUnavailable(pattern)) return pattern;
    var available = isPlainObject(packsByJurisdiction) ? packsByJurisdiction : {};
    var pack = available[declaration.jurisdiction];
    if (pack === undefined || pack === null) {
      return rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "jurisdiction:" + declaration.jurisdiction,
        "no rule pack ships for " + declaration.jurisdiction + ", and no average, national default or zero is substituted",
        "author a rule pack for " + declaration.jurisdiction + " transcribed from that jurisdiction's own retrieved authority");
    }
    var ask = isPlainObject(request) ? request : {};
    var resolved = rules.resolveRulePack(pack, {
      jurisdiction: declaration.jurisdiction,
      program: ask.program,
      declaredTaxYear: ask.declaredTaxYear,
      filingStatus: ask.filingStatus,
      asOf: ask.asOf,
      expectedContentSha256: ask.expectedContentSha256
    });
    if (!resolved.ok) return resolved.refusals[0];
    return resolved.pack;
  }

  /* CO-2 for a state: the state's OWN deduction from its OWN authority. The federal deduction
     reaches no expression here, which is what reconciliation leg L7 checks. */
  function selectStateDeduction(workspace, pack) {
    var figure = isPlainObject(pack.standardDeductions) ? pack.standardDeductions[workspace.filingStatus] : undefined;
    if (figure === undefined || figure === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "state-deduction:" + String(workspace.filingStatus),
        "the state pack carries no deduction record for this filing status",
        "author a state pack that states a deduction for every declared filing status");
    }
    if (rules.isAbsentFigure(figure)) {
      return rules.absentFigureRefusal(figure, "state-deduction:" + String(workspace.filingStatus));
    }
    return valued(figure.amount, rules.ruleStatusFor(pack, figure), {
      mode: "state-standard",
      sourceRef: figure.sourceRef,
      locator: figure.locator
    });
  }

  /* CO-1, CO-2, CO-3, CO-5. A jurisdiction declaring preferentialPolicy "none" pools every
     supported income kind into its ordinary schedule, so CO-5 reduces to OTI = TI and there is no
     engine branch that knows which kinds a particular state treats preferentially. */
  function computeStateTaxableIncome(workspace, pack) {
    var income = workspace.income;
    var kinds = rules.SUPPORTED_INCOME_KINDS;
    var index = 0;
    var pooled = 0;
    for (index = 0; index < kinds.length; index += 1) {
      var field = rules.INCOME_KIND_FIELDS[kinds[index]];
      if (!Number.isFinite(income[field]) || income[field] < 0) {
        return Object.freeze({
          ok: false,
          refusal: rules.unavailable("RLTAX-INCOME-KIND-UNSUPPORTED", "state-income:" + kinds[index],
            "the declared amount for this income kind is not a finite non-negative number",
            "supply a finite non-negative amount for " + kinds[index])
        });
      }
    }
    /* Tax-exempt interest is retained as a recorded input and excluded from gross, exactly as the
       federal settlement excludes it. */
    pooled = income.ordinary + income.qualifiedDividend + income.longTermCapitalGain;
    var deduction = selectStateDeduction(workspace, pack);
    if (rules.isUnavailable(deduction)) {
      return Object.freeze({ ok: false, refusal: deduction, grossSupportedIncome: pooled, appliedDeduction: deduction });
    }
    var taxable = Math.max(0, pooled - deduction.value);
    return Object.freeze({
      ok: true,
      grossSupportedIncome: pooled,
      taxExemptInterestRecorded: income.taxExemptInterest,
      appliedDeduction: deduction,
      stateTaxableIncome: taxable,
      preferentialTaxableIncome: 0,
      ordinaryTaxableIncome: taxable
    });
  }

  /* CO-6. The pack's ordinary schedule prices the pooled amount. The walk itself is the federal
     engine's walk: one definition of "apply a rate table" exists in this repository. */
  function computeStateOrdinaryTax(workspace, pack, basis) {
    var table = isPlainObject(pack.ordinaryRateTables) ? pack.ordinaryRateTables[workspace.filingStatus] : undefined;
    if (table === undefined || table === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "state-ordinary-tax:" + String(workspace.filingStatus),
        "the state pack carries no ordinary rate table for this filing status",
        "author a state pack that states an ordinary schedule for every declared filing status");
    }
    if (rules.isAbsentFigure(table)) {
      return rules.absentFigureRefusal(table, "state-ordinary-tax:" + String(workspace.filingStatus));
    }
    var walk = engine.applyRateTable(basis.ordinaryTaxableIncome, table);
    return valued(walk.tax, rules.ruleStatusFor(pack, table), {
      bandDetail: walk.bandDetail,
      sourceRef: table.sourceRef,
      locator: table.locator
    });
  }

  /* CO-14. A threshold-set leg evaluated exactly as CO-12 is, but against the jurisdiction's own
     taxable income rather than a declared workspace basis, and honouring varyByFilingStatus. A
     set that does not vary carries one key and the engine uses it for every status, so no engine
     branch knows that a particular jurisdiction's surcharge threshold behaves unusually. */
  function computeStateSurchargeTax(workspace, pack, basis, setId) {
    var domain = "state-surcharge:" + String(setId) + ":" + String(workspace.filingStatus);
    var sets = isPlainObject(pack.thresholdSets) ? pack.thresholdSets : {};
    var set = sets[setId];
    if (set === undefined || set === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the resolved state pack declares no threshold set named " + String(setId),
        "author a state pack that carries this threshold set and states the year it applies to");
    }
    if (rules.isAbsentFigure(set)) return rules.absentFigureRefusal(set, domain);
    var yearRefusal = rules.thresholdSetYearRefusal(pack, set, domain);
    if (yearRefusal !== null) return yearRefusal;
    var threshold = engine.thresholdForStatus(set, workspace.filingStatus);
    if (threshold === null) {
      return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
        "the threshold set carries no threshold for this filing status",
        "author a state pack whose threshold set states a threshold for every declared filing status");
    }
    var excess = Math.max(0, basis.stateTaxableIncome - threshold);
    return valued(set.rate * excess, rules.ruleStatusFor(pack, set), {
      rate: set.rate,
      threshold: threshold,
      varyByFilingStatus: set.varyByFilingStatus === true,
      basisMeasure: basis.stateTaxableIncome,
      excessOverThreshold: excess,
      taxedAmount: excess,
      sourceRef: set.sourceRef,
      locator: set.locator
    });
  }

  /* CO-13. Relief declared to apply after rate application is subtracted from the sum of the legs
     it names, floored at zero per named leg. A leg the mechanism does not name is untouched,
     which is how a jurisdiction keeps a credit off a surcharge with no engine rule. */
  function applyReliefAfterRate(workspace, pack, legValues, status) {
    var applied = [];
    var reductionByLeg = {};
    var list = Array.isArray(pack.reliefMechanisms) ? pack.reliefMechanisms : [];
    var index = 0;
    for (index = 0; index < list.length; index += 1) {
      var relief = list[index];
      var domain = "state-relief:" + String(isPlainObject(relief) ? relief.mechanismId : index);
      if (rules.isAbsentFigure(relief)) return rules.absentFigureRefusal(relief, domain);
      if (!rules.isReliefMechanism(relief)) continue;
      if (relief.applicationPoint !== "after-rate-application") continue;
      var amount = relief.varyByFilingStatus === true ? relief.amounts[status] : relief.amounts.all;
      if (rules.isAbsentFigure(amount)) return rules.absentFigureRefusal(amount, domain);
      if (!Number.isFinite(amount)) {
        return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", domain,
          "the relief amount for this filing status is not a finite number",
          "author a state pack that states the relief amount for every declared filing status, or an AbsentFigure naming the missing authority");
      }
      var remaining = amount;
      var namedIndex = 0;
      var reducedLegs = [];
      for (namedIndex = 0; namedIndex < relief.appliesToLegs.length; namedIndex += 1) {
        var legId = relief.appliesToLegs[namedIndex];
        var available = Number.isFinite(legValues[legId]) ? legValues[legId] : 0;
        var alreadyReduced = Number.isFinite(reductionByLeg[legId]) ? reductionByLeg[legId] : 0;
        var reduction = Math.max(0, Math.min(remaining, available - alreadyReduced));
        reductionByLeg[legId] = alreadyReduced + reduction;
        remaining -= reduction;
        reducedLegs.push(Object.freeze({ legId: legId, reduction: reduction }));
      }
      applied.push(Object.freeze({
        mechanismId: relief.mechanismId,
        kind: relief.kind,
        declaredAmount: amount,
        value: amount - remaining,
        unusedAmount: remaining,
        appliedAtStage: "CO-13",
        appliesToLegs: Object.freeze(relief.appliesToLegs.slice()),
        perLegReduction: Object.freeze(reducedLegs),
        sourceRef: relief.sourceRef,
        locator: relief.locator
      }));
    }
    return Object.freeze({ applied: Object.freeze(applied), reductionByLeg: reductionByLeg });
  }

  /* CO-9 for a state. L7 is the leg that makes the independence commitment checkable rather than
     asserted: state taxable income derives from the state pack's OWN deduction and never from a
     federal total. A leg whose input is a refusal reports not-evaluable and does not silently
     pass. */
  function reconcileAnnualStateTax(result, pack, basis) {
    var tolerance = pack.roundingPolicy.reconciliationTolerance;
    var legs = [];
    var balanced = true;
    var notEvaluable = 0;

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

    var grossOk = !rules.isUnavailable(result.grossSupportedIncome);
    var deductionOk = !rules.isUnavailable(result.appliedDeduction);
    var taxableOk = !rules.isUnavailable(result.stateTaxableIncome);
    var totalOk = !rules.isUnavailable(result.totalStateTax);

    addLeg("L1", "the pooled supported income equals ordinary + qualifiedDividend + longTermCapitalGain",
      grossOk,
      grossOk && Math.abs((result.declaredIncome.ordinary + result.declaredIncome.qualifiedDividend
        + result.declaredIncome.longTermCapitalGain) - result.grossSupportedIncome.value) <= tolerance,
      "pooled supported income excludes tax-exempt interest by construction");

    addLeg("L2", "grossSupportedIncome - appliedDeduction == stateTaxableIncome, else stateTaxableIncome == 0",
      grossOk && deductionOk && taxableOk,
      grossOk && deductionOk && taxableOk && (result.grossSupportedIncome.value >= result.appliedDeduction.value
        ? Math.abs((result.grossSupportedIncome.value - result.appliedDeduction.value) - result.stateTaxableIncome.value) <= tolerance
        : Math.abs(result.stateTaxableIncome.value) <= tolerance),
      "the state deduction is applied to the state's own pooled income and the result is floored at zero");

    var includedLegs = Array.isArray(result.legs)
      ? result.legs.filter(function (leg) { return leg.includedInTotal; })
      : [];
    var everyIncludedAvailable = includedLegs.length > 0 && includedLegs.every(function (leg) { return leg.available; });
    var includedSum = 0;
    var reliefSum = 0;
    var index = 0;
    for (index = 0; index < includedLegs.length; index += 1) {
      if (includedLegs[index].available) includedSum += includedLegs[index].value;
    }
    for (index = 0; index < result.reliefApplied.length; index += 1) reliefSum += result.reliefApplied[index].value;
    addLeg("L4", "the sum of every declared leg whose includedInTotal is true, less the relief applied at CO-13, == totalStateTax",
      everyIncludedAvailable && totalOk,
      everyIncludedAvailable && totalOk && Math.abs((includedSum - reliefSum) - result.totalStateTax.value) <= tolerance,
      "a total that omitted an unavailable leg would be a substitution, so an unavailable leg refuses the total");

    /* L7. The identity is stated against the state deduction the state pack supplied, so an
       implementation that reached for a federal figure produces a different taxable income and
       breaks this leg rather than balancing quietly. */
    var deductionFromStatePack = deductionOk && isPlainObject(basis) &&
      Math.abs(basis.stateTaxableIncome - Math.max(0, basis.grossSupportedIncome - result.appliedDeduction.value)) <= tolerance;
    addLeg("L7", "stateTaxableIncome derives from the state pack's own deduction and never from a federal total",
      deductionOk && taxableOk,
      deductionOk && taxableOk && deductionFromStatePack
      && result.appliedDeduction.mode === "state-standard"
      && result.appliedDeduction.sourceRef !== null && result.appliedDeduction.sourceRef !== undefined,
      "computeAnnualStateTax accepts no federal figure through any parameter, and this leg checks the arithmetic that would betray one");

    return Object.freeze({
      legs: Object.freeze(legs),
      balanced: balanced,
      notEvaluableLegCount: notEvaluable,
      toleranceUsed: tolerance,
      refusal: balanced ? null : rules.unavailable("RLTAX-RECONCILE", "state-settlement:reconciliation",
        "the state reconciliation identity did not balance within the pack's declared tolerance",
        "correct the settlement or the state pack; a non-balancing result is refused rather than displayed as a tax figure")
    });
  }

  /* The nearest declared state edge above the current level, so a curve consumer can place an
     exact sample without holding any state threshold arithmetic of its own. */
  function stateMarginalContext(workspace, pack, basis) {
    var table = isPlainObject(pack.ordinaryRateTables) ? pack.ordinaryRateTables[workspace.filingStatus] : undefined;
    var bandContext = (rules.isAbsentFigure(table) || !isPlainObject(table))
      ? { bandId: null, distanceToNextEdge: null }
      : engine.activeBandContext(basis.stateTaxableIncome, table);
    var sets = isPlainObject(pack.thresholdSets) ? pack.thresholdSets : {};
    var keys = Object.keys(sets);
    var nearest = null;
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var set = sets[keys[index]];
      if (!isPlainObject(set) || rules.isAbsentFigure(set)) continue;
      var threshold = engine.thresholdForStatus(set, workspace.filingStatus);
      if (threshold === null || !(threshold > basis.stateTaxableIncome)) continue;
      var distance = threshold - basis.stateTaxableIncome;
      if (nearest === null || distance < nearest.distance) {
        nearest = { distance: distance, thresholdSetId: keys[index], threshold: threshold };
      }
    }
    return Object.freeze({
      activeOrdinaryBandId: bandContext.bandId,
      distanceToNextOrdinaryEdge: bandContext.distanceToNextEdge,
      nextThresholdSetId: nearest === null ? null : nearest.thresholdSetId,
      distanceToNextThresholdEdge: nearest === null ? null : nearest.distance,
      stateTaxableMeasure: basis.stateTaxableIncome,
      ruleStatus: rules.ruleStatusFor(pack, pack)
    });
  }

  function unsupportedFeatureNotices(pack) {
    var notices = [];
    var list = Array.isArray(pack.unsupportedFeatures) ? pack.unsupportedFeatures : [];
    var index = 0;
    for (index = 0; index < list.length; index += 1) {
      notices.push(Object.freeze({
        id: list[index].id,
        label: list[index].label,
        reason: list[index].reason,
        code: list[index].code,
        movesMarginalRate: list[index].movesMarginalRate
      }));
    }
    return Object.freeze(notices);
  }

  function emptyStages(pack, status) {
    var stages = {};
    var order = Array.isArray(pack.calculationOrder) ? pack.calculationOrder : [];
    var index = 0;
    for (index = 0; index < order.length; index += 1) stages[order[index]] = null;
    return { stages: stages, status: status };
  }

  /* The state settlement. Two parameters, and neither of them is a federal figure. A jurisdiction
     that imposes no individual income tax returns a valued record of zero carrying its authority,
     which is structurally distinguishable from every refusal because a consumer branches on the
     contract version rather than on the value. */
  function computeAnnualStateTax(workspace, statePack) {
    if (!isPlainObject(workspace) || !isPlainObject(workspace.income)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "state-settlement:workspace",
        "the workspace is missing or carries no income record",
        "supply a workspace carrying the four declared income kinds");
    }
    if (!isPlainObject(statePack)) {
      return rules.unavailable("RLTAX-PACK-INVALID", "state-settlement:pack",
        "the state pack is missing or is not an object",
        "resolve a state rule pack for the declared residency before settling");
    }
    var packRef = Object.freeze({ id: statePack.id, version: statePack.version, contentSha256: statePack.contentSha256 });
    var status = rules.ruleStatusFor(statePack, statePack);
    var declaredIncome = Object.freeze({
      ordinary: workspace.income.ordinary,
      qualifiedDividend: workspace.income.qualifiedDividend,
      longTermCapitalGain: workspace.income.longTermCapitalGain,
      taxExemptInterest: workspace.income.taxExemptInterest
    });

    /* A pack that does not state whether the tax is imposed settles to a refusal, not to a zero.
       The settlement is still composed so the resolved pack, its identity and what it does not
       carry stay publishable beside the refusal, exactly as they are for a pack whose deduction
       was never retrieved. */
    if (rules.isAbsentFigure(statePack.imposesIndividualIncomeTax)) {
      var unstated = rules.absentFigureRefusal(statePack.imposesIndividualIncomeTax,
        "state-settlement:" + String(statePack.jurisdiction));
      var unstatedStages = emptyStages(statePack, status);
      return Object.freeze({
        contractVersion: SETTLEMENT_CONTRACT,
        packRef: packRef,
        jurisdiction: statePack.jurisdiction,
        declaredTaxYear: workspace.declaredTaxYear,
        filingStatus: workspace.filingStatus,
        imposesIndividualIncomeTax: unstated,
        calculationOrder: Object.freeze((statePack.calculationOrder || []).slice()),
        stages: Object.freeze(unstatedStages.stages),
        declaredIncome: declaredIncome,
        grossSupportedIncome: valued(
          declaredIncome.ordinary + declaredIncome.qualifiedDividend + declaredIncome.longTermCapitalGain, status),
        appliedDeduction: null,
        stateTaxableIncome: null,
        legs: Object.freeze([]),
        reliefApplied: Object.freeze([]),
        totalStateTax: unstated,
        marginalContext: Object.freeze({
          activeOrdinaryBandId: null,
          distanceToNextOrdinaryEdge: null,
          nextThresholdSetId: null,
          distanceToNextThresholdEdge: null,
          stateTaxableMeasure: null,
          ruleStatus: status
        }),
        unsupportedFeatureNotices: unsupportedFeatureNotices(statePack),
        reconciliation: Object.freeze({
          legs: Object.freeze([Object.freeze({
            id: "L7",
            identity: "a jurisdiction whose pack states no imposition derives no taxable income from any pack",
            state: "holds",
            detail: "no state taxable income is computed, so no federal figure can reach one"
          })]),
          balanced: true,
          notEvaluableLegCount: 0,
          toleranceUsed: statePack.roundingPolicy.reconciliationTolerance
        }),
        completeStateTax: false
      });
    }

    if (statePack.imposesIndividualIncomeTax === false) {
      var zero = rules.sourcedZeroFor(statePack, "state-income-tax:" + String(statePack.jurisdiction));
      var noTaxStages = emptyStages(statePack, status);
      return Object.freeze({
        contractVersion: SETTLEMENT_CONTRACT,
        packRef: packRef,
        jurisdiction: statePack.jurisdiction,
        declaredTaxYear: workspace.declaredTaxYear,
        filingStatus: workspace.filingStatus,
        imposesIndividualIncomeTax: false,
        calculationOrder: Object.freeze((statePack.calculationOrder || []).slice()),
        stages: Object.freeze(noTaxStages.stages),
        declaredIncome: declaredIncome,
        grossSupportedIncome: valued(
          declaredIncome.ordinary + declaredIncome.qualifiedDividend + declaredIncome.longTermCapitalGain, status),
        appliedDeduction: null,
        stateTaxableIncome: null,
        legs: Object.freeze([]),
        reliefApplied: Object.freeze([]),
        totalStateTax: zero,
        marginalContext: Object.freeze({
          activeOrdinaryBandId: null,
          distanceToNextOrdinaryEdge: null,
          nextThresholdSetId: null,
          distanceToNextThresholdEdge: null,
          stateTaxableMeasure: null,
          ruleStatus: status
        }),
        unsupportedFeatureNotices: unsupportedFeatureNotices(statePack),
        reconciliation: Object.freeze({
          legs: Object.freeze([Object.freeze({
            id: "L7",
            identity: "a jurisdiction that imposes no individual income tax derives no taxable income from any pack",
            state: "holds",
            detail: "no state taxable income is computed, so no federal figure can reach one"
          })]),
          balanced: true,
          notEvaluableLegCount: 0,
          toleranceUsed: statePack.roundingPolicy.reconciliationTolerance
        }),
        completeStateTax: false
      });
    }

    var basis = computeStateTaxableIncome(workspace, statePack);
    var stages = {};
    if (!basis.ok) {
      var incomplete = Object.freeze({
        contractVersion: SETTLEMENT_CONTRACT,
        packRef: packRef,
        jurisdiction: statePack.jurisdiction,
        declaredTaxYear: workspace.declaredTaxYear,
        filingStatus: workspace.filingStatus,
        imposesIndividualIncomeTax: true,
        calculationOrder: Object.freeze((statePack.calculationOrder || []).slice()),
        stages: Object.freeze({}),
        declaredIncome: declaredIncome,
        grossSupportedIncome: Number.isFinite(basis.grossSupportedIncome)
          ? valued(basis.grossSupportedIncome, status)
          : basis.refusal,
        appliedDeduction: basis.appliedDeduction === undefined ? basis.refusal : basis.appliedDeduction,
        stateTaxableIncome: basis.refusal,
        legs: Object.freeze([]),
        reliefApplied: Object.freeze([]),
        totalStateTax: basis.refusal,
        marginalContext: Object.freeze({
          activeOrdinaryBandId: null,
          distanceToNextOrdinaryEdge: null,
          nextThresholdSetId: null,
          distanceToNextThresholdEdge: null,
          stateTaxableMeasure: null,
          ruleStatus: status
        }),
        unsupportedFeatureNotices: unsupportedFeatureNotices(statePack),
        reconciliation: Object.freeze({ legs: Object.freeze([]), balanced: true, notEvaluableLegCount: 0, toleranceUsed: statePack.roundingPolicy.reconciliationTolerance }),
        completeStateTax: false
      });
      return incomplete;
    }

    stages["CO-1"] = valued(basis.grossSupportedIncome, status);
    stages["CO-2"] = basis.appliedDeduction;
    stages["CO-3"] = valued(basis.stateTaxableIncome, status);
    stages["CO-5"] = valued(basis.ordinaryTaxableIncome, status);

    var ordinaryRecord = computeStateOrdinaryTax(workspace, statePack, basis);
    stages["CO-6"] = ordinaryRecord;

    /* Every declared leg whose stage is CO-14 is a threshold-set leg. The set id is read off the
       leg's figureRef, so the engine names no jurisdiction's surcharge. */
    var declaredLegs = rules.declaredTaxLegs(statePack);
    var legIndex = 0;
    for (legIndex = 0; legIndex < declaredLegs.length; legIndex += 1) {
      var leg = declaredLegs[legIndex];
      if (leg.stageId !== "CO-14") continue;
      var parts = String(leg.figureRef).split(".");
      var setId = parts.length === 2 ? parts[1] : parts[0];
      stages["CO-14"] = computeStateSurchargeTax(workspace, statePack, basis, setId);
    }

    var settledLegs = engine.sumDeclaredLegs(statePack, stages, status);
    stages["CO-8"] = settledLegs.total;

    var legValues = {};
    for (legIndex = 0; legIndex < settledLegs.legs.length; legIndex += 1) {
      if (settledLegs.legs[legIndex].available) legValues[settledLegs.legs[legIndex].legId] = settledLegs.legs[legIndex].value;
    }
    var relief = rules.isUnavailable(settledLegs.total)
      ? Object.freeze({ applied: Object.freeze([]), reductionByLeg: {} })
      : applyReliefAfterRate(workspace, statePack, legValues, workspace.filingStatus);
    if (rules.isUnavailable(relief)) {
      stages["CO-13"] = relief;
    }
    var reliefRefused = rules.isUnavailable(relief);
    var reliefApplied = reliefRefused ? Object.freeze([]) : relief.applied;
    var reliefTotal = 0;
    for (legIndex = 0; legIndex < reliefApplied.length; legIndex += 1) reliefTotal += reliefApplied[legIndex].value;
    if (!reliefRefused) stages["CO-13"] = valued(reliefTotal, status);

    var totalRecord = null;
    if (rules.isUnavailable(settledLegs.total)) {
      totalRecord = settledLegs.total;
    } else if (reliefRefused) {
      totalRecord = relief;
    } else {
      totalRecord = valued(Math.max(0, settledLegs.total.value - reliefTotal), status);
    }

    var result = {
      contractVersion: SETTLEMENT_CONTRACT,
      packRef: packRef,
      jurisdiction: statePack.jurisdiction,
      declaredTaxYear: workspace.declaredTaxYear,
      filingStatus: workspace.filingStatus,
      imposesIndividualIncomeTax: true,
      calculationOrder: Object.freeze((statePack.calculationOrder || []).slice()),
      stages: Object.freeze(stages),
      declaredIncome: declaredIncome,
      grossSupportedIncome: valued(basis.grossSupportedIncome, status),
      taxExemptInterestRecorded: valued(basis.taxExemptInterestRecorded, status),
      appliedDeduction: basis.appliedDeduction,
      stateTaxableIncome: valued(basis.stateTaxableIncome, status),
      preReliefTotal: settledLegs.total,
      legs: settledLegs.legs,
      reliefApplied: reliefApplied,
      totalStateTax: totalRecord,
      marginalContext: stateMarginalContext(workspace, statePack, basis),
      unsupportedFeatureNotices: unsupportedFeatureNotices(statePack),
      completeStateTax: false
    };

    var reconciliation = reconcileAnnualStateTax(result, statePack, basis);
    result.reconciliation = Object.freeze({
      legs: reconciliation.legs,
      balanced: reconciliation.balanced,
      notEvaluableLegCount: reconciliation.notEvaluableLegCount,
      toleranceUsed: reconciliation.toleranceUsed
    });
    if (reconciliation.refusal) result.totalStateTax = reconciliation.refusal;
    return Object.freeze(result);
  }

  var api = Object.freeze({
    MODELLED_PATTERN: MODELLED_PATTERN,
    applyReliefAfterRate: applyReliefAfterRate,
    computeAnnualStateTax: computeAnnualStateTax,
    computeStateOrdinaryTax: computeStateOrdinaryTax,
    computeStateSurchargeTax: computeStateSurchargeTax,
    computeStateTaxableIncome: computeStateTaxableIncome,
    reconcileAnnualStateTax: reconcileAnnualStateTax,
    residencyDeclaration: residencyDeclaration,
    residencyPattern: residencyPattern,
    resolveStatePack: resolveStatePack,
    selectStateDeduction: selectStateDeduction,
    stateMarginalContext: stateMarginalContext
  });

  root.RLTAXSTATE = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
