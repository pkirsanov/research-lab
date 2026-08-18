/* Lifetime Tax Strategy Lab — property assessment mechanics and statutory relief regimes.
 *
 * Feature 023 Scope 01. This module owns PropertyAssessment/v1 (declared members only),
 * PropertyReliefRegime/v1 (sourced members only), the closed cap-basis enum, the closed
 * relief application-point enum, `resolvePropertyRegime`, `computePropertyTax`,
 * `propertyMarginalContext`, and the leg-visibility set-identity helper every later leg in
 * this feature is checked by.
 *
 * It declares NO regime name, NO state name, NO county name, NO exemption amount, NO cap
 * figure and NO rate ceiling: every such value is read from the resolved regime pack. The
 * engine branches on the DECLARED cap basis, never on a regime identifier, so a new regime is
 * a new pack file and not a code change.
 *
 * `computePropertyTax` takes exactly the declared assessment and the sourced regime. There is
 * no parameter through which a federal or state income figure could arrive.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXPROPERTY");

  /* The two contracts and both closed enums are REGISTERED in the rules vocabulary module and
     consumed here. Declaring them in the engine would make the declared/sourced split a
     property of one module rather than of the vocabulary, and a later module could then
     contradict it. */
  var ASSESSMENT_CONTRACT = rules.PROPERTY_ASSESSMENT_CONTRACT;
  var REGIME_CONTRACT = rules.PROPERTY_REGIME_CONTRACT;
  var SETTLEMENT_CONTRACT = "PropertyTaxSettlement/v1";
  var LEG_VISIBILITY_CONTRACT = "LegVisibilityIdentity/v1";

  /* The closed cap-basis set. Exactly two members, and the engine branches on the member.
     A third regime shape is a third member plus one branch on that member — never a branch on
     a regime name, a jurisdiction or a state. */
  var CAP_BASES = rules.PROPERTY_CAP_BASES;

  /* Where a relief mechanism may be applied. A mechanism declares its point and the engine
     applies it there; an incoherent pairing is refused rather than silently relocated. */
  var APPLICATION_POINTS = rules.PROPERTY_APPLICATION_POINTS;

  /* The coherent point for each mechanism kind. Kept as a map rather than an inline test so
     the coherence rule is one declaration a reader can check against the refusal. */
  var COHERENT_POINT = Object.freeze({
    "exemption": "assessed-value",
    "assessment-cap": "assessed-value",
    "rate-ceiling": "tax-rate"
  });

  /* The declared assessment members the household supplies. Every one is declared; none may
     carry a citation. */
  var ASSESSMENT_KEYS = Object.freeze([
    "acquisitionValue", "assessedValue", "contractVersion", "exemptionElections",
    "localCombinedRate", "origin", "priorAssessedValue"
  ]);

  /* Which declared member each cap basis reads. This is the whole of the basis branch. */
  var CAP_BASIS_MEMBER = Object.freeze({
    "prior-assessed-value": "priorAssessedValue",
    "acquisition-value": "acquisitionValue"
  });

  /* The four surfaces every computed leg must reach. NFR-023-006. */
  var LEG_SURFACES = Object.freeze(["headline", "comparison", "curve", "export"]);

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  function sortedKeysOf(candidate) {
    return Object.keys(candidate).slice().sort();
  }

  function isFiniteNonNegative(candidate) {
    return Number.isFinite(candidate) && candidate >= 0;
  }

  function findSourceRecord(regime, sourceId) {
    if (!isPlainObject(regime) || !Array.isArray(regime.sourceRecords)) return null;
    var index = 0;
    for (index = 0; index < regime.sourceRecords.length; index += 1) {
      if (regime.sourceRecords[index] && regime.sourceRecords[index].sourceId === sourceId) {
        return regime.sourceRecords[index];
      }
    }
    return null;
  }

  /* The citation actually governing one sourced regime figure. A figure whose sourceRef names
     no record, or whose locator is empty, cites nothing and is refused rather than displayed
     with an unreachable reference. */
  function citationFor(regime, figure, domain) {
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
        "add a locator naming the section, table or heading");
    }
    var record = findSourceRecord(regime, figure.sourceRef);
    if (record === null) {
      return rules.unavailable("RLTAX-PACK-INVALID", domain,
        "the sourceRef names no record in sourceRecords[]",
        "add a SourceRecord whose sourceId equals " + figure.sourceRef);
    }
    return Object.freeze({
      origin: "sourced",
      title: record.title,
      url: record.url,
      retrievedAt: record.retrievedAt,
      locator: figure.locator,
      sourceRef: figure.sourceRef
    });
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

  /* PropertyAssessment/v1. Declared members only. A member carrying a sourceRef is refused,
     which is what makes the declared half structurally incapable of impersonating a sourced
     figure: the impersonation cannot be constructed, not merely discouraged. */
  function validatePropertyAssessment(assessment) {
    var refusals = [];
    if (!isPlainObject(assessment)) {
      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment",
        "the assessment is missing or is not an object",
        "supply a PropertyAssessment/v1 record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (assessment.contractVersion !== ASSESSMENT_CONTRACT) {
      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment:contractVersion",
        "the assessment does not declare " + ASSESSMENT_CONTRACT,
        "set contractVersion to " + ASSESSMENT_CONTRACT));
    }
    if (JSON.stringify(sortedKeysOf(assessment)) !== JSON.stringify(ASSESSMENT_KEYS)) {
      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment:members",
        "the assessment carries a member outside the declared set, or is missing one",
        "carry exactly: " + ASSESSMENT_KEYS.join(", ")));
    }
    if (assessment.origin !== "declared") {
      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment:origin",
        "a PropertyAssessment records the household's own input and its origin must be declared",
        "set origin to declared"));
    }
    /* The central distinction, decided by the registered predicate rather than by a local one,
       so the declared half cannot drift away from the vocabulary that defines it. */
    var keys = Object.keys(assessment);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var member = {};
      member[keys[index]] = assessment[keys[index]];
      if (rules.carriesCitation(member)) {
        refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment:" + keys[index],
          "a declared assessment member carries a citation, which would present the household's own input as an authority's figure",
          "remove the citation; a declared figure is labelled the household's input and carries no sourceRef"));
      }
    }
    if (!Array.isArray(assessment.exemptionElections)) {
      refusals.push(rules.unavailable("RLTAX-CONFIG-INVALID", "assessment:exemptionElections",
        "the exemption elections are not an array",
        "supply an array of exemption ids the household claims, empty when it claims none"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* One sourced regime mechanism. Returns a refusal, never a default. */
  function validateMechanism(regime, figure, kind, label, refusals) {
    if (!isPlainObject(figure)) return;
    if (rules.isAbsentFigure(figure)) return;
    if (figure.applicationPoint === undefined || APPLICATION_POINTS.indexOf(figure.applicationPoint) < 0) {
      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", label + ":applicationPoint",
        "the mechanism declares no application point from the closed set",
        "declare one of: " + APPLICATION_POINTS.join(", ")));
      return;
    }
    /* FR-023-004. An exemption applied to a rate, and a cap applied to a tax amount, are each
       incoherent: the pairing names the mechanism and the point it cannot occupy. */
    if (figure.applicationPoint !== COHERENT_POINT[kind]) {
      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", label + ":applicationPoint",
        "a " + kind + " declares the application point " + figure.applicationPoint +
        ", which is incoherent: a " + kind + " is applied at " + COHERENT_POINT[kind],
        "declare applicationPoint " + COHERENT_POINT[kind] + " for a " + kind));
    }
    var citation = citationFor(regime, figure, label);
    if (rules.isUnavailable(citation)) refusals.push(citation);
  }

  /* PropertyReliefRegime/v1. Sourced members only. Every value-bearing member carries its own
     citation with a locator; an unretrieved member is an AbsentFigure/v1 and is left alone
     here, because absence is a legitimate shipped state that refuses at settlement rather
     than a pack defect. */
  function validatePropertyReliefRegime(regime) {
    var refusals = [];
    if (!isPlainObject(regime)) {
      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", "regime",
        "the regime is missing or is not an object",
        "supply a PropertyReliefRegime/v1 record"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (regime.contractVersion !== REGIME_CONTRACT) {
      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", "regime:contractVersion",
        "the regime does not declare " + REGIME_CONTRACT,
        "set contractVersion to " + REGIME_CONTRACT));
    }
    if (!isNonEmptyString(regime.regimeId)) {
      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", "regime:regimeId",
        "the regime declares no identifier",
        "declare a regimeId"));
    }
    if (!rules.isSupportedJurisdiction(regime.jurisdiction) && regime.jurisdiction !== "fixture") {
      refusals.push(rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "regime:jurisdiction",
        "the regime declares a jurisdiction outside the supported grammar",
        "declare federal, state:XX, or fixture"));
    }
    if (!Array.isArray(regime.sourceRecords) || regime.sourceRecords.length === 0) {
      refusals.push(rules.unavailable("RLTAX-PACK-INVALID", "regime:sourceRecords",
        "the regime carries no source records",
        "carry at least one retrieved SourceRecord"));
    }
    var index = 0;
    var exemptions = Array.isArray(regime.exemptions) ? regime.exemptions : [];
    for (index = 0; index < exemptions.length; index += 1) {
      validateMechanism(regime, exemptions[index], "exemption",
        "regime:exemption:" + String(exemptions[index] && exemptions[index].exemptionId), refusals);
    }
    if (isPlainObject(regime.assessmentCap) && !rules.isAbsentFigure(regime.assessmentCap)) {
      if (!rules.isPropertyCapBasis(regime.assessmentCap.capBasis)) {
        refusals.push(rules.unavailable("RLTAX-PACK-INVALID", "regime:assessmentCap:capBasis",
          "the assessment cap declares no basis from the closed set",
          "declare one of: " + CAP_BASES.join(", ")));
      }
      validateMechanism(regime, regime.assessmentCap, "assessment-cap", "regime:assessmentCap", refusals);
    }
    if (isPlainObject(regime.rateCeiling) && !rules.isAbsentFigure(regime.rateCeiling)) {
      validateMechanism(regime, regime.rateCeiling, "rate-ceiling", "regime:rateCeiling", refusals);
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  /* Which regime governs a declared jurisdiction and year. A pattern match, never an
     enumeration: this module names no jurisdiction. */
  function resolvePropertyRegime(regimesByJurisdiction, jurisdiction, declaredTaxYear) {
    if (!isPlainObject(regimesByJurisdiction)) {
      return rules.unavailable("RLTAX-CONFIG-INVALID", "property-regime:registry",
        "no regime registry was supplied",
        "supply a map of jurisdiction to PropertyReliefRegime");
    }
    if (!isNonEmptyString(jurisdiction)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "property-regime:jurisdiction",
        "no jurisdiction was declared for the property",
        "declare the jurisdiction the property sits in");
    }
    var regime = regimesByJurisdiction[jurisdiction];
    if (!isPlainObject(regime)) {
      return rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "property-regime:" + jurisdiction,
        "no property relief regime is shipped for this jurisdiction",
        "add a regime pack for " + jurisdiction + "; no typical or average regime is substituted");
    }
    if (!Number.isFinite(declaredTaxYear)) {
      return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "property-regime:declaredTaxYear",
        "no tax year was declared",
        "declare the tax year the settlement is for");
    }
    if (regime.year !== declaredTaxYear) {
      return rules.unavailable("RLTAX-YEAR-UNSUPPORTED", "property-regime:" + jurisdiction,
        "the shipped regime does not declare the requested year effective",
        "supply a regime whose year equals " + declaredTaxYear);
    }
    return regime;
  }

  /* A missing household declaration names the member AND the regime that required it, so the
     user learns which of their inputs the regime needs rather than that something is absent. */
  function undeclaredMember(member, regimeId) {
    return rules.unavailable("RLTAX-INPUT-INCOMPLETE", "property-assessment:" + member,
      "the household has not declared " + member + ", which the resolved regime " + regimeId + " requires",
      "declare " + member + "; no typical value, average or estimate is substituted");
  }

  /* An unretrieved sourced rule names the rule, not the household. The two refusals are
     distinguished by their code AND by their domain prefix, so a copy edit to either message
     cannot collapse them into one another. */
  function unretrievedRule(rule, regimeId) {
    return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "property-regime:" + rule,
      "the regime " + regimeId + " ships " + rule + " as an unretrieved figure, so the rule it states could not be established",
      "retrieve " + rule + " from its primary source and record it with a locator; no figure is derived in its place");
  }

  /* CO-15. The declared assessment and the sourced regime, and nothing else.
     There is deliberately no third parameter: no federal or state income figure can arrive. */
  function computePropertyTax(assessment, regime) {
    var assessmentCheck = validatePropertyAssessment(assessment);
    if (!assessmentCheck.ok) return assessmentCheck.refusals[0];
    var regimeCheck = validatePropertyReliefRegime(regime);
    if (!regimeCheck.ok) return regimeCheck.refusals[0];

    var regimeId = regime.regimeId;
    if (!isFiniteNonNegative(assessment.assessedValue)) return undeclaredMember("assessedValue", regimeId);
    if (!isFiniteNonNegative(assessment.localCombinedRate)) return undeclaredMember("localCombinedRate", regimeId);

    var steps = [];
    var citations = [];

    /* Step one: the cap, applied at its DECLARED basis. The branch is on the basis member,
       never on the regime. Two regimes identical in every member except capBasis therefore
       produce different taxable bases from identical declarations. */
    var cap = regime.assessmentCap;
    var cappedValue = assessment.assessedValue;
    var capBasisApplied = null;
    var capBound = false;
    if (isPlainObject(cap)) {
      if (rules.isAbsentFigure(cap)) return unretrievedRule("assessmentCap", regimeId);
      var basisMember = CAP_BASIS_MEMBER[cap.capBasis];
      var basisValue = assessment[basisMember];
      if (!isFiniteNonNegative(basisValue)) return undeclaredMember(basisMember, regimeId);
      /* The constitution states the cap as a ceiling bounded by an annual index change. The
         index change is a separate sourced figure; when the pack could not retrieve it the
         effective cap cannot be established and the leg refuses rather than applying the
         ceiling as though it were the cap. */
      if (rules.isAbsentFigure(cap.capIndexRate)) return unretrievedRule("assessmentCap.capIndexRate", regimeId);
      if (!Number.isFinite(cap.capRate)) return unretrievedRule("assessmentCap.capRate", regimeId);
      if (!Number.isFinite(cap.capIndexRate)) return unretrievedRule("assessmentCap.capIndexRate", regimeId);
      var effectiveCapRate = Math.min(cap.capRate, cap.capIndexRate);
      var capCeilingValue = basisValue * (1 + effectiveCapRate);
      cappedValue = Math.min(assessment.assessedValue, capCeilingValue);
      capBound = capCeilingValue < assessment.assessedValue;
      capBasisApplied = cap.capBasis;
      var capCitation = citationFor(regime, cap, "regime:assessmentCap");
      if (rules.isUnavailable(capCitation)) return capCitation;
      citations.push(capCitation);
      steps.push(Object.freeze({
        stepId: "assessment-cap",
        applicationPoint: cap.applicationPoint,
        capBasis: cap.capBasis,
        capBasisMember: basisMember,
        capBasisValue: basisValue,
        capRate: cap.capRate,
        capIndexRate: cap.capIndexRate,
        effectiveCapRate: effectiveCapRate,
        before: assessment.assessedValue,
        after: cappedValue,
        bound: capBound,
        citation: capCitation
      }));
    }

    /* Step two: the exemptions the household ELECTED, applied at the assessed value. An
       exemption the regime carries but the household did not elect is not applied, and the
       fact is published rather than silently dropped. */
    var exemptions = Array.isArray(regime.exemptions) ? regime.exemptions : [];
    var elected = Array.isArray(assessment.exemptionElections) ? assessment.exemptionElections : [];
    var exemptionTotal = 0;
    var appliedExemptions = [];
    var index = 0;
    for (index = 0; index < exemptions.length; index += 1) {
      var exemption = exemptions[index];
      var claimed = elected.indexOf(exemption.exemptionId) >= 0;
      if (rules.isAbsentFigure(exemption)) {
        if (claimed) return unretrievedRule("exemption:" + String(exemption.exemptionId), regimeId);
        appliedExemptions.push(Object.freeze({
          exemptionId: exemption.exemptionId, claimed: false, applied: 0, available: false
        }));
        continue;
      }
      if (!Number.isFinite(exemption.amount)) return unretrievedRule("exemption:" + String(exemption.exemptionId), regimeId);
      var exemptionCitation = citationFor(regime, exemption, "regime:exemption:" + String(exemption.exemptionId));
      if (rules.isUnavailable(exemptionCitation)) return exemptionCitation;
      citations.push(exemptionCitation);
      var applied = claimed ? Math.min(exemption.amount, Math.max(0, cappedValue - exemptionTotal)) : 0;
      exemptionTotal += applied;
      appliedExemptions.push(Object.freeze({
        exemptionId: exemption.exemptionId,
        claimed: claimed,
        amount: exemption.amount,
        applied: applied,
        available: true,
        applicationPoint: exemption.applicationPoint,
        citation: exemptionCitation
      }));
    }
    var taxableBasis = Math.max(0, cappedValue - exemptionTotal);
    if (exemptions.length > 0) {
      steps.push(Object.freeze({
        stepId: "exemptions",
        applicationPoint: "assessed-value",
        before: cappedValue,
        after: taxableBasis,
        exemptionTotal: exemptionTotal,
        exemptions: Object.freeze(appliedExemptions)
      }));
    }

    /* Step three: the rate ceiling, applied as a CEILING on the declared rate and never as
       the rate. A regime carrying no ceiling publishes that no ceiling applies — a stated
       fact rather than a silent pass. */
    var ceiling = regime.rateCeiling;
    var appliedRate = assessment.localCombinedRate;
    var ceilingBound = false;
    var ceilingApplies = false;
    var ceilingCitation = null;
    if (isPlainObject(ceiling)) {
      if (rules.isAbsentFigure(ceiling)) return unretrievedRule("rateCeiling", regimeId);
      if (!Number.isFinite(ceiling.rate)) return unretrievedRule("rateCeiling", regimeId);
      ceilingCitation = citationFor(regime, ceiling, "regime:rateCeiling");
      if (rules.isUnavailable(ceilingCitation)) return ceilingCitation;
      citations.push(ceilingCitation);
      ceilingApplies = true;
      appliedRate = Math.min(assessment.localCombinedRate, ceiling.rate);
      ceilingBound = ceiling.rate < assessment.localCombinedRate;
    }
    steps.push(Object.freeze({
      stepId: "rate-ceiling",
      applicationPoint: "tax-rate",
      ceilingApplies: ceilingApplies,
      declaredRate: assessment.localCombinedRate,
      ceilingRate: ceilingApplies ? ceiling.rate : null,
      appliedRate: appliedRate,
      bound: ceilingBound,
      statedFact: ceilingApplies
        ? (ceilingBound
          ? "The declared local rate exceeds the regime's ad valorem ceiling, so the ceiling bound it."
          : "The declared local rate is below the regime's ad valorem ceiling, so it was used unchanged.")
        : "This regime carries no ad valorem rate ceiling, so the declared local rate was used unchanged.",
      citation: ceilingCitation
    }));

    var tax = taxableBasis * appliedRate;

    return Object.freeze({
      contractVersion: SETTLEMENT_CONTRACT,
      regimeId: regimeId,
      jurisdiction: regime.jurisdiction,
      year: regime.year,
      ruleStatus: isNonEmptyString(regime.ruleStatus) ? regime.ruleStatus : "unavailable",
      declared: Object.freeze({
        assessedValue: Object.freeze({ value: assessment.assessedValue, origin: declaredOrigin("assessedValue") }),
        priorAssessedValue: Object.freeze({ value: assessment.priorAssessedValue, origin: declaredOrigin("priorAssessedValue") }),
        acquisitionValue: Object.freeze({ value: assessment.acquisitionValue, origin: declaredOrigin("acquisitionValue") }),
        localCombinedRate: Object.freeze({ value: assessment.localCombinedRate, origin: declaredOrigin("localCombinedRate") }),
        exemptionElections: Object.freeze(elected.slice())
      }),
      capBasisApplied: capBasisApplied,
      capBound: capBound,
      assessedValueBefore: assessment.assessedValue,
      cappedAssessedValue: cappedValue,
      exemptionTotal: exemptionTotal,
      taxableBasis: taxableBasis,
      appliedRate: appliedRate,
      rateCeilingBound: ceilingBound,
      rateCeilingApplies: ceilingApplies,
      steps: Object.freeze(steps),
      citations: Object.freeze(citations),
      value: tax
    });
  }

  /* What the property leg contributes to a marginal reading. It carries no income figure and
     no rate table: the property tax does not move with income, and saying so explicitly is
     what keeps a curve consumer from inferring that it does. */
  function propertyMarginalContext(settlement) {
    if (rules.isUnavailable(settlement)) {
      return Object.freeze({
        contractVersion: "PropertyMarginalContext/v1",
        available: false,
        code: settlement.code,
        movesWithIncome: false,
        reason: settlement.reason
      });
    }
    return Object.freeze({
      contractVersion: "PropertyMarginalContext/v1",
      available: true,
      legId: "property-tax",
      value: settlement.value,
      movesWithIncome: false,
      reason: "The property tax is computed from a declared assessed value and a declared local rate. No income figure reaches it, so an added dollar of income cannot move it.",
      ruleStatus: settlement.ruleStatus
    });
  }

  /* The leg-visibility set identity NFR-023-006 turns into an assertion.
     Two-directional: a leg in the record and not on a surface fails, and a leg on a surface
     and not in the record fails. The failure NAMES the missing leg on the named surface,
     because a numeric mismatch is exactly the report that let Feature 022's dropped leg hide.
     Every later leg in this feature consumes this helper unchanged. */
  function legVisibilityIdentity(recordLegIds, surfaces) {
    var declared = Array.isArray(recordLegIds) ? recordLegIds.slice().sort() : [];
    var findings = [];
    var index = 0;
    var surfaceIndex = 0;
    for (surfaceIndex = 0; surfaceIndex < LEG_SURFACES.length; surfaceIndex += 1) {
      var surface = LEG_SURFACES[surfaceIndex];
      var rendered = (isPlainObject(surfaces) && Array.isArray(surfaces[surface]))
        ? surfaces[surface].slice().sort()
        : null;
      if (rendered === null) {
        findings.push(Object.freeze({
          surface: surface, missingFromSurface: Object.freeze(declared.slice()),
          unexpectedOnSurface: Object.freeze([]),
          detail: "the surface " + surface + " published no leg set at all"
        }));
        continue;
      }
      var missing = [];
      var unexpected = [];
      for (index = 0; index < declared.length; index += 1) {
        if (rendered.indexOf(declared[index]) < 0) missing.push(declared[index]);
      }
      for (index = 0; index < rendered.length; index += 1) {
        if (declared.indexOf(rendered[index]) < 0) unexpected.push(rendered[index]);
      }
      if (missing.length > 0 || unexpected.length > 0) {
        findings.push(Object.freeze({
          surface: surface,
          missingFromSurface: Object.freeze(missing),
          unexpectedOnSurface: Object.freeze(unexpected),
          detail: missing.length > 0
            ? "the leg " + missing.join(", ") + " is computed in the record and does not reach " + surface
            : "the leg " + unexpected.join(", ") + " appears on " + surface + " and is not in the settled record"
        }));
      }
    }
    return Object.freeze({
      contractVersion: LEG_VISIBILITY_CONTRACT,
      declaredLegs: Object.freeze(declared),
      surfaces: LEG_SURFACES,
      holds: findings.length === 0,
      findings: Object.freeze(findings)
    });
  }

  var api = Object.freeze({
    APPLICATION_POINTS: APPLICATION_POINTS,
    ASSESSMENT_CONTRACT: ASSESSMENT_CONTRACT,
    ASSESSMENT_KEYS: ASSESSMENT_KEYS,
    CAP_BASES: CAP_BASES,
    CAP_BASIS_MEMBER: CAP_BASIS_MEMBER,
    COHERENT_POINT: COHERENT_POINT,
    LEG_SURFACES: LEG_SURFACES,
    REGIME_CONTRACT: REGIME_CONTRACT,
    SETTLEMENT_CONTRACT: SETTLEMENT_CONTRACT,
    citationFor: citationFor,
    computePropertyTax: computePropertyTax,
    declaredOrigin: declaredOrigin,
    legVisibilityIdentity: legVisibilityIdentity,
    propertyMarginalContext: propertyMarginalContext,
    resolvePropertyRegime: resolvePropertyRegime,
    validatePropertyAssessment: validatePropertyAssessment,
    validatePropertyReliefRegime: validatePropertyReliefRegime
  });

  root.RLTAXPROPERTY = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
