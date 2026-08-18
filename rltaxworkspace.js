/* Lifetime Tax Strategy Lab — household workspace, mandatory configuration, local storage,
 * privacy inventory, clear, and export sanitisation.
 *
 * This module owns TaxWorkspace/v1 and the storage boundary. It owns NO rule value, NO tax
 * arithmetic, and NO refusal code of its own: the RLTAX vocabulary is imported.
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
  if (!rules) throw new Error("RLTAXRULES must be loaded before RLTAXWORKSPACE");

  var WORKSPACE_CONTRACT = "TaxWorkspace/v2";
  var POINTER_CONTRACT = "lifetime-tax-workspace-pointer/v1";
  var EXPORT_CONTRACT = "LifetimeTaxExport/v1";
  var INVENTORY_CONTRACT = "lifetime-tax-privacy-inventory/v1";
  var CONFIG_CONTRACT = "lifetime-tax-strategy-policy/v1";

  var TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  var CONFIG_TOP_FIELDS = Object.freeze(["contractVersion", "display", "rules", "storage", "sweep"]);
  var CONFIG_SECTION_FIELDS = Object.freeze({
    storage: Object.freeze([
      "contractVersion", "forbiddenKeyPrefixes", "namespace", "pointerKey", "probeKey",
      "probeValue", "workspaceContractVersion", "workspaceKey"
    ]),
    rules: Object.freeze([
      "benefitPackPaths", "contractVersion", "declaredTaxYear", "jurisdiction", "medicarePackPaths",
      "mortalityPackPaths",
      "packContentSha256", "packPath", "program", "propertyPackPaths", "statePackPaths"
    ]),
    sweep: Object.freeze([
      "contractVersion", "end", "kinds", "maxPoints", "probe", "start", "step"
    ]),
    display: Object.freeze([
      "contractVersion", "defaultView", "displayRounding", "educationalFraming",
      "localNetworkPolicy", "privateExportWarning"
    ])
  });
  var CONFIG_SECTION_VERSIONS = Object.freeze({
    storage: "lifetime-tax-storage-policy/v1",
    rules: "lifetime-tax-rules-policy/v1",
    sweep: "lifetime-tax-sweep-policy/v1",
    display: "lifetime-tax-display-policy/v1"
  });

  var WORKSPACE_FIELDS = Object.freeze([
    "benefitBirthYear", "benefitClaimAgeMonths", "benefitDeclaredEarnings",
    "benefitStatementPrimaryInsuranceAmount", "claimAgeComparisonAges",
    "contractVersion", "conversionFundingSource", "declaredTaxYear", "declaredUnavailableDomains",
    "deductionMode", "filingStatus", "generation", "income", "investmentIncomeBasis",
    "itemizedAmount", "lookbackModifiedAdjustedGrossIncome", "lookbackYear",
    "mortalityTableColumnId",
    "mortgageAcquisitionDebtBalance", "mortgageAcquisitionDebtTier",
    "mortgageInterestPaid", "propertyAcquisitionValue", "propertyAssessedValue",
    "propertyExemptionElections", "propertyJurisdiction", "propertyLocalCombinedRate",
    "propertyPriorAssessedValue", "rentalActiveParticipation", "rentalAtRiskAmount",
    "rentalDepreciableBasis", "rentalFairRentalDays", "rentalIncome",
    "rentalModifiedAdjustedGrossIncome", "rentalOpeningSuspendedLoss", "rentalOperatingExpenses",
    "rentalPersonalUseDays", "rentalPlacedInServiceMonth",
    "rentalRecoveryYearOrdinal", "residencyJurisdiction", "residencyPattern",
    "saleAccumulatedCostRecovery", "saleAdjustedBasis", "saleOwnershipMonths", "saleProceeds",
    "salePropertyUse", "saleUseMonths", "selectedBracketId",
    "updatedAt", "wageBasis"
  ]);
  var INCOME_FIELDS = Object.freeze(["longTermCapitalGain", "ordinary", "qualifiedDividend", "taxExemptInterest"]);

  /* Feature 023. Every member here is the household's OWN input and none may ever carry a
     citation. The assessed value and the acquisition value are additionally location-adjacent:
     a parcel value beside a declared jurisdiction narrows a household considerably, so both are
     treated as at least as sensitive as an income amount. `null` is undeclared and refuses by
     name; it never means zero, and a zero rate is a real declaration. */
  var PROPERTY_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "propertyAssessedValue", kind: "amount", locationAdjacent: true }),
    Object.freeze({ member: "propertyPriorAssessedValue", kind: "amount", locationAdjacent: true }),
    Object.freeze({ member: "propertyAcquisitionValue", kind: "amount", locationAdjacent: true }),
    Object.freeze({ member: "propertyLocalCombinedRate", kind: "rate", locationAdjacent: true }),
    Object.freeze({ member: "mortgageInterestPaid", kind: "amount", locationAdjacent: false }),
    Object.freeze({ member: "mortgageAcquisitionDebtBalance", kind: "amount", locationAdjacent: false })
  ]);

  /* The two declarations that are not numeric: an elected-exemption list and a declared debt
     tier. The tier is what makes a sourced grandfathered limit REACHABLE from declared inputs
     rather than inferred from a date this workspace does not hold. */
  var PROPERTY_STRING_DECLARATIONS = Object.freeze(["propertyJurisdiction", "mortgageAcquisitionDebtTier"]);

  /* Feature 023 Scope 03. The rental declarations. Every one is the household's own input and
     none may carry a citation. `rentalOpeningSuspendedLoss` is the household's declaration about
     a year this single-year model never computed, and it is treated as at least as sensitive as
     an income amount because it discloses a prior-year rental loss. `rentalDepreciableBasis` is
     location-adjacent for the same reason a parcel value is: a basis beside a declared property
     jurisdiction narrows a household. */
  var RENTAL_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "rentalIncome", kind: "amount", locationAdjacent: false }),
    Object.freeze({ member: "rentalOperatingExpenses", kind: "amount", locationAdjacent: false }),
    Object.freeze({ member: "rentalDepreciableBasis", kind: "amount", locationAdjacent: true }),
    Object.freeze({ member: "rentalPlacedInServiceMonth", kind: "month", locationAdjacent: false }),
    Object.freeze({ member: "rentalRecoveryYearOrdinal", kind: "ordinal", locationAdjacent: false }),
    Object.freeze({ member: "rentalAtRiskAmount", kind: "amount", locationAdjacent: false }),
    Object.freeze({ member: "rentalModifiedAdjustedGrossIncome", kind: "amount", locationAdjacent: false }),
    Object.freeze({ member: "rentalOpeningSuspendedLoss", kind: "amount", locationAdjacent: false })
  ]);

  /* Feature 023 Scope 04. The two day counts the dwelling-use test is run against. Both are the
     household's own record of how a dwelling was used and neither may carry a citation: the
     authority states the TEST, never the days. Both are location-adjacent for the same reason a
     parcel value is — a personal-use day count beside a declared property jurisdiction describes
     a household's movements as well as its finances, and it never leaves this browser. */
  var USE_DAY_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "rentalFairRentalDays", kind: "days", locationAdjacent: true }),
    Object.freeze({ member: "rentalPersonalUseDays", kind: "days", locationAdjacent: true })
  ]);

  /* Feature 023 Scope 05. The disposition declarations. Every one is the household's own record
     of a sale it made and none may carry a citation: the authority states the RULES, never the
     proceeds. Proceeds and the adjusted basis are location-adjacent for the same reason a parcel
     value is — a sale price beside a declared property jurisdiction can identify a specific
     transaction, which makes them the most disclosive members this workspace holds, and they
     never leave this browser. The two month counts describe where a household lived and for how
     long, so they are treated the same way. */
  var DISPOSITION_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "saleProceeds", kind: "amount", locationAdjacent: true }),
    Object.freeze({ member: "saleAdjustedBasis", kind: "amount", locationAdjacent: true }),
    Object.freeze({ member: "saleAccumulatedCostRecovery", kind: "amount", locationAdjacent: false }),
    Object.freeze({ member: "saleOwnershipMonths", kind: "months", locationAdjacent: true }),
    Object.freeze({ member: "saleUseMonths", kind: "months", locationAdjacent: true })
  ]);

  /* How the property was used, declared rather than inferred. A model that guessed this from the
     rental members would decide loss deductibility on its own guess. */
  var DISPOSITION_STRING_DECLARATIONS = Object.freeze(["salePropertyUse"]);

  /* Feature 024 Scope 01. The benefit declarations. Every one is the household's own input and
     none may ever carry a citation: the authority publishes the FORMULA and the FACTORS, never
     the household's own statement reading and never its birth year.

     Both numeric members here are treated as more sensitive than an income amount, not less. A
     birth year is a direct identity attribute rather than a financial one, and a statement
     Primary Insurance Amount is a lifetime earnings summary compressed into a single figure.
     Neither ever leaves this browser. */
  var BENEFIT_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "benefitStatementPrimaryInsuranceAmount", kind: "amount", identityAdjacent: true }),
    Object.freeze({ member: "benefitBirthYear", kind: "year", identityAdjacent: true }),
    Object.freeze({ member: "benefitClaimAgeMonths", kind: "months", identityAdjacent: false })
  ]);

  /* The earnings record is not a number and is inventoried separately for that reason. It is the
     single most sensitive object this program carries: a year-by-year employment history is a
     biography, and an inventory that could only count numeric members would have left it
     uncounted while reporting that everything was accounted for. */
  var BENEFIT_RECORD_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "benefitDeclaredEarnings", kind: "earnings-record", identityAdjacent: true })
  ]);

  /* Feature 024 Scope 03. The claim ages a household asks to be compared, and the column of the
     published table it asks to be read. A claim age set discloses an INTENTION rather than a
     fact: it says which retirement dates a household is weighing, which is more disclosive than
     the single claim age it has already declared, so it is inventoried, cleared and redacted on
     the same terms as every other declaration here. The column choice is the household's answer
     to a question this program's retrieval left open, and it is the household's own answer
     rather than a rule, so it may never carry a citation. */
  var CLAIM_AGE_SET_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "claimAgeComparisonAges", kind: "whole-year-age-list", identityAdjacent: false })
  ]);
  var CLAIM_AGE_STRING_DECLARATIONS = Object.freeze(["mortalityTableColumnId"]);

  /* Feature 024 Scope 04. The lookback declaration and the year it belongs to. Both are the
     household's own input and neither may ever carry a citation: the authority publishes which
     year's income sets the premium, never the household's income for it.

     A second year's finances is a disclosure the rest of this workspace does not make. Every
     other amount here describes the year being settled; this one describes a year that is over,
     and holding both says how a household's income CHANGED. It is therefore treated as at least
     as sensitive as an income amount, and the year travels with it as a declaration in its own
     right rather than as a label — because an amount whose year nobody stated is exactly the
     confusion this scope exists to prevent, and a year silently inferred here would defeat the
     structural separation the resolver enforces. */
  var LOOKBACK_DECLARATIONS = Object.freeze([
    Object.freeze({ member: "lookbackModifiedAdjustedGrossIncome", kind: "amount", identityAdjacent: false }),
    Object.freeze({ member: "lookbackYear", kind: "year", identityAdjacent: false })
  ]);

  /* Active participation is a declared yes or no rather than a number. `null` is undeclared and
     is not the same claim as a declared no: the sourced allowance rule makes participation the
     condition of the allowance, so an undeclared answer must refuse rather than read as no. */
  var RENTAL_BOOLEAN_DECLARATIONS = Object.freeze(["rentalActiveParticipation"]);

  /* The two declared surtax bases. Each container carries exactly one member, and that member
     is `null` until the household declares it. `null` is undeclared and refuses its leg by name;
     `0` is a real declaration and computes a real zero. A zero DEFAULT is forbidden: it would
     let a wage earner far above the threshold read a confident-looking additional Medicare tax
     of $0, which is a fabricated declaration attributed to the household. */
  var BASIS_CONTAINERS = Object.freeze([
    Object.freeze({ container: "investmentIncomeBasis", member: "otherOrdinaryNetInvestmentIncome" }),
    Object.freeze({ container: "wageBasis", member: "medicareWagesAndSelfEmploymentIncome" })
  ]);
  var DEDUCTION_MODES = Object.freeze({ "standard": true, "itemized": true });
  var FUNDING_SOURCES = Object.freeze({ "outside-funds": true, "withheld": true });

  /* Identifier categories this tool never asks for, stated in the export so a reader sees the
     check rather than inferring it from an absence. */
  var NEVER_COLLECTED = Object.freeze([
    "name", "postal-address", "account-number", "tax-identifier", "credential"
  ]);

  function isPlainObject(candidate) {
    return !!candidate && typeof candidate === "object" && !Array.isArray(candidate);
  }

  function isNonEmptyString(candidate) {
    return typeof candidate === "string" && candidate.length > 0;
  }

  function sortedKeys(candidate) {
    return Object.keys(candidate).slice().sort();
  }

  function configRefusal(member, reason) {
    return rules.unavailable("RLTAX-CONFIG-INVALID", "config-member:" + member, reason,
      "correct the " + member + " member of the configuration; the load path carries no fallback branch");
  }

  /* Exact-key and closed at every level. An unknown key, a missing key or an unknown version is
     a refusal, never a defaulted value. */
  function validateConfig(config) {
    var refusals = [];
    if (!isPlainObject(config)) {
      refusals.push(configRefusal("config", "the configuration document is missing or is not an object"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (config.contractVersion !== CONFIG_CONTRACT) {
      refusals.push(configRefusal("contractVersion", "the configuration contract version must be " + CONFIG_CONTRACT));
    }
    if (JSON.stringify(sortedKeys(config)) !== JSON.stringify(CONFIG_TOP_FIELDS.slice())) {
      refusals.push(configRefusal("top-level", "the configuration carries an unknown or missing top-level section"));
    }
    var sections = ["storage", "rules", "sweep", "display"];
    var index = 0;
    for (index = 0; index < sections.length; index += 1) {
      var name = sections[index];
      var section = config[name];
      if (!isPlainObject(section)) {
        refusals.push(configRefusal(name, "the " + name + " section is missing or is not an object"));
        continue;
      }
      if (section.contractVersion !== CONFIG_SECTION_VERSIONS[name]) {
        refusals.push(configRefusal(name + ".contractVersion",
          "the " + name + " section version must be " + CONFIG_SECTION_VERSIONS[name]));
      }
      if (JSON.stringify(sortedKeys(section)) !== JSON.stringify(CONFIG_SECTION_FIELDS[name].slice())) {
        refusals.push(configRefusal(name, "the " + name + " section carries an unknown or missing key"));
      }
    }
    if (isPlainObject(config.storage)) {
      if (!isNonEmptyString(config.storage.namespace)) {
        refusals.push(configRefusal("storage.namespace", "the storage namespace must be a non-empty string"));
      }
      if (!Array.isArray(config.storage.forbiddenKeyPrefixes) || config.storage.forbiddenKeyPrefixes.length === 0) {
        refusals.push(configRefusal("storage.forbiddenKeyPrefixes", "the forbidden key prefix list must be a non-empty array"));
      }
      var declaredKeys = [config.storage.workspaceKey, config.storage.pointerKey, config.storage.probeKey];
      var keyIndex = 0;
      for (keyIndex = 0; keyIndex < declaredKeys.length; keyIndex += 1) {
        if (!isNonEmptyString(declaredKeys[keyIndex]) ||
          declaredKeys[keyIndex].indexOf(config.storage.namespace + ".") !== 0) {
          refusals.push(configRefusal("storage.keys", "every declared storage key must sit inside the declared namespace"));
          break;
        }
      }
    }
    if (isPlainObject(config.sweep)) {
      var sweepNumbers = ["start", "end", "step", "probe", "maxPoints"];
      var sweepIndex = 0;
      for (sweepIndex = 0; sweepIndex < sweepNumbers.length; sweepIndex += 1) {
        if (!Number.isFinite(config.sweep[sweepNumbers[sweepIndex]])) {
          refusals.push(configRefusal("sweep." + sweepNumbers[sweepIndex], "the sweep member must be a finite number"));
        }
      }
      if (Number.isFinite(config.sweep.step) && config.sweep.step <= 0) {
        refusals.push(configRefusal("sweep.step", "the sweep step must be greater than zero"));
      }
      if (Number.isFinite(config.sweep.probe) && config.sweep.probe <= 0) {
        refusals.push(configRefusal("sweep.probe", "the sweep probe must be greater than zero"));
      }
      if (Number.isFinite(config.sweep.start) && Number.isFinite(config.sweep.end) &&
        Number.isFinite(config.sweep.step) && Number.isFinite(config.sweep.maxPoints) &&
        config.sweep.step > 0 && ((config.sweep.end - config.sweep.start) / config.sweep.step) > config.sweep.maxPoints) {
        refusals.push(configRefusal("sweep.maxPoints",
          "the declared sweep would exceed its point budget; a budget refuses rather than silently truncating a curve"));
      }
    }
    if (isPlainObject(config.display) && config.display.defaultView !== "simple") {
      refusals.push(configRefusal("display.defaultView", "the default view must be simple"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  function createEmptyWorkspace() {
    return {
      contractVersion: WORKSPACE_CONTRACT,
      filingStatus: null,
      declaredTaxYear: null,
      income: { ordinary: 0, qualifiedDividend: 0, longTermCapitalGain: 0, taxExemptInterest: 0 },
      investmentIncomeBasis: { otherOrdinaryNetInvestmentIncome: null },
      wageBasis: { medicareWagesAndSelfEmploymentIncome: null },
      deductionMode: null,
      itemizedAmount: 0,
      conversionFundingSource: null,
      selectedBracketId: null,
      /* Where the household lives. `null` is undeclared and refuses by name; it never means
         "no state tax". The residency state is a location signal and is treated as at least as
         sensitive as an income amount. */
      residencyJurisdiction: null,
      residencyPattern: null,
      /* The housing axis. Every member is undeclared until the household supplies it. */
      propertyJurisdiction: null,
      propertyAssessedValue: null,
      propertyPriorAssessedValue: null,
      propertyAcquisitionValue: null,
      propertyLocalCombinedRate: null,
      propertyExemptionElections: [],
      mortgageInterestPaid: null,
      mortgageAcquisitionDebtBalance: null,
      mortgageAcquisitionDebtTier: null,
      /* The rental axis. Every member is undeclared until the household supplies it. */
      rentalIncome: null,
      rentalOperatingExpenses: null,
      rentalDepreciableBasis: null,
      rentalPlacedInServiceMonth: null,
      rentalRecoveryYearOrdinal: null,
      rentalAtRiskAmount: null,
      rentalModifiedAdjustedGrossIncome: null,
      rentalOpeningSuspendedLoss: null,
      rentalActiveParticipation: null,
      /* The dwelling-use axis. Both day counts are undeclared until the household supplies them,
         and `null` never means zero: a dwelling nobody used and a dwelling nobody counted are
         different claims. */
      rentalFairRentalDays: null,
      rentalPersonalUseDays: null,
      /* The disposition axis. Every member is undeclared until the household supplies it, and
         `null` never means zero: a household that sold nothing and a household that sold for
         nothing are different claims. */
      saleProceeds: null,
      saleAdjustedBasis: null,
      saleAccumulatedCostRecovery: null,
      saleOwnershipMonths: null,
      saleUseMonths: null,
      salePropertyUse: null,
      /* The benefit axis. Feature 024 Scope 01. Every member is undeclared until the household
         supplies it, and `null` never means zero: a household that declared no statement amount
         and a household whose statement shows nothing are different claims. The two origins live
         side by side here BECAUSE the workspace must be able to hold the ambiguity long enough
         for the resolver to refuse it — a workspace that could only hold one would have made the
         precedence decision itself, silently, before any rule ran. */
      benefitStatementPrimaryInsuranceAmount: null,
      benefitDeclaredEarnings: null,
      benefitBirthYear: null,
      benefitClaimAgeMonths: null,
      /* The claim-age comparison axis. Feature 024 Scope 03. An empty list is undeclared and
         refuses by name; it never means "compare nothing", and no claim age is supplied on the
         household's behalf. The column is `null` until the household chooses one, because which
         population subgroup each published column describes is a figure this program's retrieval
         did not establish and this tool will not guess. */
      claimAgeComparisonAges: [],
      mortalityTableColumnId: null,
      /* The Medicare lookback axis. Feature 024 Scope 04. Both are `null` until the household
         supplies them, and the year is NEVER derived from `declaredTaxYear`: a year this tool
         inferred would be checked against the pack's offset and would pass its own inference. */
      lookbackModifiedAdjustedGrossIncome: null,
      lookbackYear: null,
      declaredUnavailableDomains: [],
      generation: 1,
      updatedAt: null
    };
  }

  /* A domain the household did not supply, recorded so a zero input and an unsupplied domain
     stay distinguishable. An unsupplied domain never blocks a supplied one. */
  function declaredUnavailableDomains(workspace) {
    var domains = [];
    if (!isPlainObject(workspace)) return Object.freeze(domains);
    var income = isPlainObject(workspace.income) ? workspace.income : {};
    var kinds = rules.SUPPORTED_INCOME_KINDS;
    var index = 0;
    for (index = 0; index < kinds.length; index += 1) {
      var field = rules.INCOME_KIND_FIELDS[kinds[index]];
      if (!Number.isFinite(income[field])) domains.push("income:" + kinds[index]);
    }
    if (workspace.filingStatus === null) domains.push("filingStatus");
    if (workspace.deductionMode === null) domains.push("deductionMode");
    if (workspace.conversionFundingSource === null) domains.push("conversionFundingSource");
    if (workspace.selectedBracketId === null) domains.push("selectedBracketId");
    if (workspace.residencyJurisdiction === null || workspace.residencyJurisdiction === undefined) {
      domains.push("residencyJurisdiction");
    }
    if (workspace.residencyPattern === null || workspace.residencyPattern === undefined) {
      domains.push("residencyPattern");
    }
    for (index = 0; index < BASIS_CONTAINERS.length; index += 1) {
      var basis = workspace[BASIS_CONTAINERS[index].container];
      if (!isPlainObject(basis) || !Number.isFinite(basis[BASIS_CONTAINERS[index].member])) {
        domains.push(BASIS_CONTAINERS[index].container + "." + BASIS_CONTAINERS[index].member);
      }
    }
    for (index = 0; index < PROPERTY_DECLARATIONS.length; index += 1) {
      if (!Number.isFinite(workspace[PROPERTY_DECLARATIONS[index].member])) {
        domains.push(PROPERTY_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < PROPERTY_STRING_DECLARATIONS.length; index += 1) {
      if (!isNonEmptyString(workspace[PROPERTY_STRING_DECLARATIONS[index]])) {
        domains.push(PROPERTY_STRING_DECLARATIONS[index]);
      }
    }
    for (index = 0; index < RENTAL_DECLARATIONS.length; index += 1) {
      if (!Number.isFinite(workspace[RENTAL_DECLARATIONS[index].member])) {
        domains.push(RENTAL_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < RENTAL_BOOLEAN_DECLARATIONS.length; index += 1) {
      if (typeof workspace[RENTAL_BOOLEAN_DECLARATIONS[index]] !== "boolean") {
        domains.push(RENTAL_BOOLEAN_DECLARATIONS[index]);
      }
    }
    for (index = 0; index < USE_DAY_DECLARATIONS.length; index += 1) {
      if (!Number.isFinite(workspace[USE_DAY_DECLARATIONS[index].member])) {
        domains.push(USE_DAY_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < DISPOSITION_DECLARATIONS.length; index += 1) {
      if (!Number.isFinite(workspace[DISPOSITION_DECLARATIONS[index].member])) {
        domains.push(DISPOSITION_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < DISPOSITION_STRING_DECLARATIONS.length; index += 1) {
      if (!isNonEmptyString(workspace[DISPOSITION_STRING_DECLARATIONS[index]])) {
        domains.push(DISPOSITION_STRING_DECLARATIONS[index]);
      }
    }
    for (index = 0; index < BENEFIT_DECLARATIONS.length; index += 1) {
      if (!Number.isFinite(workspace[BENEFIT_DECLARATIONS[index].member])) {
        domains.push(BENEFIT_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < BENEFIT_RECORD_DECLARATIONS.length; index += 1) {
      var record = workspace[BENEFIT_RECORD_DECLARATIONS[index].member];
      if (!Array.isArray(record) || record.length === 0) {
        domains.push(BENEFIT_RECORD_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < CLAIM_AGE_SET_DECLARATIONS.length; index += 1) {
      var ages = workspace[CLAIM_AGE_SET_DECLARATIONS[index].member];
      if (!Array.isArray(ages) || ages.length === 0) {
        domains.push(CLAIM_AGE_SET_DECLARATIONS[index].member);
      }
    }
    for (index = 0; index < CLAIM_AGE_STRING_DECLARATIONS.length; index += 1) {
      if (!isNonEmptyString(workspace[CLAIM_AGE_STRING_DECLARATIONS[index]])) {
        domains.push(CLAIM_AGE_STRING_DECLARATIONS[index]);
      }
    }
    for (index = 0; index < LOOKBACK_DECLARATIONS.length; index += 1) {
      if (!Number.isFinite(workspace[LOOKBACK_DECLARATIONS[index].member])) {
        domains.push(LOOKBACK_DECLARATIONS[index].member);
      }
    }
    return Object.freeze(domains);
  }

  /* Filing status, one declared year, at least one supported income amount, and a deduction
     mode. Anything less names each missing member; no member is defaulted. */
  function minimumViableInput(workspace) {
    var missing = [];
    if (!isPlainObject(workspace)) missing.push("workspace");
    var income = isPlainObject(workspace) && isPlainObject(workspace.income) ? workspace.income : {};
    if (!isPlainObject(workspace) || !isNonEmptyString(workspace.filingStatus)) missing.push("filingStatus");
    if (!isPlainObject(workspace) || !Number.isFinite(workspace.declaredTaxYear) ||
      Math.floor(workspace.declaredTaxYear) !== workspace.declaredTaxYear) {
      missing.push("declaredTaxYear");
    }
    var supplied = 0;
    var index = 0;
    for (index = 0; index < INCOME_FIELDS.length; index += 1) {
      if (Number.isFinite(income[INCOME_FIELDS[index]]) && income[INCOME_FIELDS[index]] > 0) supplied += 1;
    }
    if (supplied === 0) missing.push("income");
    if (!isPlainObject(workspace) || DEDUCTION_MODES[workspace.deductionMode] !== true) missing.push("deductionMode");
    if (missing.length === 0) {
      return Object.freeze({ ok: true, missing: Object.freeze([]), refusal: null });
    }
    return Object.freeze({
      ok: false,
      missing: Object.freeze(missing),
      refusal: rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:minimum-viable-input",
        "these workspace members are not declared: " + missing.join(", "),
        "declare " + missing.join(", ") + "; no default is applied for any of them")
    });
  }

  /* Shape and vocabulary only. No rule value and no arithmetic reaches this function. */
  function validateWorkspace(workspace, pack) {
    var refusals = [];
    if (!isPlainObject(workspace)) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace",
        "the workspace is missing or is not an object", "create an empty workspace and supply the household's declarations"));
      return Object.freeze({ ok: false, refusals: Object.freeze(refusals) });
    }
    if (workspace.contractVersion !== WORKSPACE_CONTRACT) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:contractVersion",
        "the workspace contract version must be " + WORKSPACE_CONTRACT,
        "rebuild the workspace from the current contract"));
    }
    if (JSON.stringify(sortedKeys(workspace)) !== JSON.stringify(WORKSPACE_FIELDS.slice())) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:fields",
        "the workspace carries an unknown or missing member",
        "supply exactly the declared workspace members"));
    }
    if (!isPlainObject(workspace.income) ||
      JSON.stringify(sortedKeys(workspace.income)) !== JSON.stringify(INCOME_FIELDS.slice())) {
      refusals.push(rules.unavailable("RLTAX-INCOME-KIND-UNSUPPORTED", "workspace:income",
        "the income record carries a kind outside the four supported kinds, or is missing one of them",
        "supply exactly the four supported income kinds; author a pack that declares a further kind before using it"));
    } else {
      var index = 0;
      for (index = 0; index < INCOME_FIELDS.length; index += 1) {
        var amount = workspace.income[INCOME_FIELDS[index]];
        if (!Number.isFinite(amount) || amount < 0) {
          refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:income." + INCOME_FIELDS[index],
            "an income amount must be a finite number that is not negative",
            "supply a finite non-negative amount for " + INCOME_FIELDS[index]));
        }
      }
    }
    var statuses = isPlainObject(pack) && Array.isArray(pack.filingStatuses)
      ? pack.filingStatuses
      : rules.SUPPORTED_FILING_STATUSES;
    if (workspace.filingStatus !== null && statuses.indexOf(workspace.filingStatus) < 0) {
      refusals.push(rules.unavailable("RLTAX-FILING-STATUS-UNSUPPORTED", "workspace:filingStatus",
        "the declared filing status is outside the resolved pack's declared filing statuses",
        "declare a filing status the pack carries, or resolve a pack that declares this one"));
    }
    if (workspace.deductionMode !== null && DEDUCTION_MODES[workspace.deductionMode] !== true) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:deductionMode",
        "the deduction mode must be standard, itemized, or null meaning not declared",
        "declare standard or itemized; there is no default mode"));
    }
    if (workspace.conversionFundingSource !== null && FUNDING_SOURCES[workspace.conversionFundingSource] !== true) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:conversionFundingSource",
        "the conversion funding source must be outside-funds, withheld, or null meaning not declared",
        "declare outside-funds or withheld; the two cases differ materially and neither is assumed"));
    }
    if (workspace.residencyJurisdiction !== null && !rules.isSupportedJurisdiction(workspace.residencyJurisdiction)) {
      refusals.push(rules.unavailable("RLTAX-JURISDICTION-UNSUPPORTED", "workspace:residencyJurisdiction",
        "a declared residency must be the literal federal or state: followed by a two-letter upper-case postal code",
        "declare a residency the jurisdiction grammar accepts, or leave it null meaning not declared"));
    }
    if (workspace.residencyPattern !== null && rules.RESIDENCY_PATTERNS.indexOf(workspace.residencyPattern) < 0) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:residencyPattern",
        "the residency pattern must be one of the declared patterns, or null meaning not declared",
        "declare " + rules.RESIDENCY_PATTERNS.join(", ") + "; no pattern is assumed"));
    }
    if (!Number.isFinite(workspace.itemizedAmount) || workspace.itemizedAmount < 0) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:itemizedAmount",
        "the itemised amount must be a finite number that is not negative",
        "supply a finite non-negative itemised amount, or zero when the mode is standard"));
    }
    if (workspace.updatedAt !== null && !TIMESTAMP_PATTERN.test(String(workspace.updatedAt))) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:updatedAt",
        "updatedAt must be an ISO-8601 timestamp with milliseconds, or null",
        "write updatedAt from the browser clock on user edit only; it never enters a computation"));
    }
    var basisIndex = 0;
    for (basisIndex = 0; basisIndex < BASIS_CONTAINERS.length; basisIndex += 1) {
      var container = BASIS_CONTAINERS[basisIndex].container;
      var member = BASIS_CONTAINERS[basisIndex].member;
      var basis = workspace[container];
      if (!isPlainObject(basis) || JSON.stringify(sortedKeys(basis)) !== JSON.stringify([member])) {
        refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:" + container,
          "the " + container + " record must carry exactly the member " + member,
          "supply " + container + "." + member + " as a finite non-negative amount, or null meaning not declared"));
        continue;
      }
      var declared = basis[member];
      if (declared !== null && (!Number.isFinite(declared) || declared < 0)) {
        refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:" + container + "." + member,
          "a declared basis must be a finite number that is not negative, or null meaning not declared",
          "declare " + member + "; a zero is a real declaration and null is an undeclared basis, and the two are not the same"));
      }
    }
    /* The housing declarations. A declared amount must be finite and not negative; `null` is
       undeclared and refuses by name downstream rather than settling to a plausible figure. */
    var propertyIndex = 0;
    for (propertyIndex = 0; propertyIndex < PROPERTY_DECLARATIONS.length; propertyIndex += 1) {
      var declaration = PROPERTY_DECLARATIONS[propertyIndex];
      var declaredHousing = workspace[declaration.member];
      if (declaredHousing !== null && (!Number.isFinite(declaredHousing) || declaredHousing < 0)) {
        refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:" + declaration.member,
          "a declared housing " + declaration.kind + " must be a finite number that is not negative, or null meaning not declared",
          "declare " + declaration.member + "; a zero is a real declaration and null is an undeclared member, and the two are not the same"));
      }
    }
    for (propertyIndex = 0; propertyIndex < PROPERTY_STRING_DECLARATIONS.length; propertyIndex += 1) {
      var stringMember = workspace[PROPERTY_STRING_DECLARATIONS[propertyIndex]];
      if (stringMember !== null && !isNonEmptyString(stringMember)) {
        refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:" + PROPERTY_STRING_DECLARATIONS[propertyIndex],
          "the declaration must be a non-empty string, or null meaning not declared",
          "declare " + PROPERTY_STRING_DECLARATIONS[propertyIndex] + "; no value is assumed"));
      }
    }
    if (!Array.isArray(workspace.propertyExemptionElections)) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:propertyExemptionElections",
        "the elected property exemptions must be an array",
        "supply an array of exemption ids the household claims, empty when it claims none"));
    }
    /* The Medicare lookback declarations. `null` is undeclared and refuses by name downstream,
       naming the exact year the pack's own offset requires. A declared year must be a whole year
       and is never taken from the settled year. */
    var lookbackIndex = 0;
    for (lookbackIndex = 0; lookbackIndex < LOOKBACK_DECLARATIONS.length; lookbackIndex += 1) {
      var lookbackDeclaration = LOOKBACK_DECLARATIONS[lookbackIndex];
      var declaredLookback = workspace[lookbackDeclaration.member];
      if (declaredLookback === null) continue;
      if (!Number.isFinite(declaredLookback) || declaredLookback < 0
        || (lookbackDeclaration.kind === "year" && Math.floor(declaredLookback) !== declaredLookback)) {
        refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:" + lookbackDeclaration.member,
          "a declared lookback " + lookbackDeclaration.kind
            + " must be a finite number that is not negative, or null meaning not declared",
          "declare " + lookbackDeclaration.member
            + "; a zero is a real declaration, null is an undeclared member, and neither is taken from the settled year"));
      }
    }
    /* FR-023-012. A declared preferred deduction side is refused outright. The itemised-versus-
       standard decision is recomputed from the two totals, and a workspace member expressing a
       preference would let a household's wish overwrite the arithmetic. */    if (Object.prototype.hasOwnProperty.call(workspace, "preferredDeductionSide")) {
      refusals.push(rules.unavailable("RLTAX-INPUT-INCOMPLETE", "workspace:preferredDeductionSide",
        "the itemised-versus-standard decision is recomputed from the two totals and is never declared",
        "remove the preferred side; the chosen side is published with the reason that produced it"));
    }
    return Object.freeze({ ok: refusals.length === 0, refusals: Object.freeze(refusals) });
  }

  function declaredStorageKeys(config) {
    return Object.freeze([config.storage.workspaceKey, config.storage.pointerKey, config.storage.probeKey]);
  }

  function isForbiddenKey(config, key) {
    var prefixes = config.storage.forbiddenKeyPrefixes;
    var index = 0;
    for (index = 0; index < prefixes.length; index += 1) {
      if (String(key).indexOf(prefixes[index]) === 0) return true;
    }
    return false;
  }

  /* The writer refuses any key outside the closed declared set and any key matching a forbidden
     prefix, so a collision with another feature's namespace cannot happen by accident. */
  function writeStorageKey(storage, config, key, value) {
    if (declaredStorageKeys(config).indexOf(key) < 0 || isForbiddenKey(config, key)) {
      return rules.unavailable("RLTAX-CONFIG-INVALID", "storage:" + String(key),
        "this feature writes only the three keys its configuration declares inside its own namespace",
        "write one of the declared keys; another feature's namespace is never touched");
    }
    storage.setItem(key, value);
    return null;
  }

  function writeWorkspace(storage, config, workspace) {
    var shape = validateWorkspace(workspace, null);
    if (!shape.ok) return Object.freeze({ ok: false, refusals: shape.refusals });
    var refusal = writeStorageKey(storage, config, config.storage.workspaceKey, JSON.stringify(workspace));
    if (refusal) return Object.freeze({ ok: false, refusals: Object.freeze([refusal]) });
    writeStorageKey(storage, config, config.storage.pointerKey, JSON.stringify({
      contractVersion: POINTER_CONTRACT,
      workspaceContractVersion: config.storage.workspaceContractVersion,
      generation: workspace.generation
    }));
    writeStorageKey(storage, config, config.storage.probeKey, config.storage.probeValue);
    return Object.freeze({ ok: true, refusals: Object.freeze([]) });
  }

  function readWorkspace(storage, config) {
    var raw = storage.getItem(config.storage.workspaceKey);
    if (raw === null || raw === undefined) return Object.freeze({ ok: true, workspace: null, refusals: Object.freeze([]) });
    var parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return Object.freeze({
        ok: false,
        workspace: null,
        refusals: Object.freeze([rules.unavailable("RLTAX-INPUT-INCOMPLETE", "storage:workspace",
          "the stored workspace is not readable JSON",
          "clear the stored workspace and re-enter the household's declarations")])
      });
    }
    return Object.freeze({ ok: true, workspace: parsed, refusals: Object.freeze([]) });
  }

  /* Every written key, its purpose, and its size. Rendered before and independently of any
     computation, so it stays reachable when the configuration blocks everything else. */
  function privacyInventory(storage, config) {
    var purposes = {};
    purposes[config.storage.workspaceKey] = "The household values you entered: filing status, declared tax year, the four income amounts, the declared net investment income portion, the declared Medicare wage and self-employment basis, deduction mode and itemised amount, funding source, the declared residency state and residency pattern, the selected bracket, and the housing declarations \u2014 the property jurisdiction, its assessed value, its prior-year assessed value, its acquisition value, the declared local combined rate, the exemptions claimed, the mortgage interest paid, the acquisition-debt balance and the declared debt tier, plus the rental declarations and the two dwelling-use day counts \u2014 the days the unit was rented at a fair rental price and the days it was used personally. The assessed value and the acquisition value sit beside a declared jurisdiction, so they are treated as at least as sensitive as an income amount, and the two day counts are treated the same way because a personal-use day count beside a declared jurisdiction describes a household's movements. None of them leaves this browser. It also holds the Medicare lookback declarations \u2014 the modified adjusted gross income for an earlier year and the year that figure belongs to. That pair is a SECOND year's finances rather than a restatement of the year being settled, so it is treated as at least as sensitive as an income amount, and it is redacted from every export exactly as the rest of these values are.";    purposes[config.storage.pointerKey] = "A pointer recording which workspace contract and generation this browser holds. It carries no household value.";
    purposes[config.storage.probeKey] = "A fixed constant proving this browser allows local storage. It carries no household value.";
    var carriesHouseholdValues = {};
    carriesHouseholdValues[config.storage.workspaceKey] = true;
    carriesHouseholdValues[config.storage.pointerKey] = false;
    carriesHouseholdValues[config.storage.probeKey] = false;
    var entries = [];
    var keys = declaredStorageKeys(config);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      var stored = storage.getItem(keys[index]);
      entries.push(Object.freeze({
        key: keys[index],
        present: stored !== null && stored !== undefined,
        bytes: (stored === null || stored === undefined) ? 0 : String(stored).length,
        purpose: purposes[keys[index]],
        carriesHouseholdValues: carriesHouseholdValues[keys[index]]
      }));
    }
    return Object.freeze({
      contractVersion: INVENTORY_CONTRACT,
      namespace: config.storage.namespace,
      entries: Object.freeze(entries),
      forbiddenKeyPrefixes: Object.freeze(config.storage.forbiddenKeyPrefixes.slice()),
      localNetworkPolicy: config.display.localNetworkPolicy
    });
  }

  /* Removes exactly the three declared keys and nothing else. */
  function clearAllPrivateData(storage, config) {
    var keys = declaredStorageKeys(config);
    var removed = [];
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      storage.removeItem(keys[index]);
      removed.push(keys[index]);
    }
    return Object.freeze({ contractVersion: INVENTORY_CONTRACT, removedKeys: Object.freeze(removed) });
  }

  /* Every withheld member is named in omittedFields[]; a field dropped without being listed is
     the defect this shape exists to prevent. */
  function sanitizeForExport(workspace) {
    var kept = {
      contractVersion: WORKSPACE_CONTRACT,
      filingStatus: workspace.filingStatus,
      declaredTaxYear: workspace.declaredTaxYear,
      income: {
        ordinary: workspace.income.ordinary,
        qualifiedDividend: workspace.income.qualifiedDividend,
        longTermCapitalGain: workspace.income.longTermCapitalGain,
        taxExemptInterest: workspace.income.taxExemptInterest
      },
      investmentIncomeBasis: {
        otherOrdinaryNetInvestmentIncome: isPlainObject(workspace.investmentIncomeBasis)
          ? workspace.investmentIncomeBasis.otherOrdinaryNetInvestmentIncome
          : null
      },
      wageBasis: {
        medicareWagesAndSelfEmploymentIncome: isPlainObject(workspace.wageBasis)
          ? workspace.wageBasis.medicareWagesAndSelfEmploymentIncome
          : null
      },
      deductionMode: workspace.deductionMode,
      itemizedAmount: workspace.itemizedAmount,
      conversionFundingSource: workspace.conversionFundingSource,
      selectedBracketId: workspace.selectedBracketId
    };
    var omitted = [];
    var keys = Object.keys(workspace);
    var index = 0;
    for (index = 0; index < keys.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(kept, keys[index])) omitted.push(keys[index]);
    }
    return Object.freeze({ workspace: kept, omittedFields: Object.freeze(omitted) });
  }

  function exportManifest(workspace, config, packRef) {
    var sanitized = sanitizeForExport(workspace);
    return Object.freeze({
      contractVersion: EXPORT_CONTRACT,
      warning: config.display.privateExportWarning,
      educationalFraming: config.display.educationalFraming,
      packRef: packRef,
      workspace: sanitized.workspace,
      omittedFields: sanitized.omittedFields,
      neverCollected: NEVER_COLLECTED
    });
  }

  var api = Object.freeze({
    BASIS_CONTAINERS: BASIS_CONTAINERS,
    NEVER_COLLECTED: NEVER_COLLECTED,
    PROPERTY_DECLARATIONS: PROPERTY_DECLARATIONS,
    PROPERTY_STRING_DECLARATIONS: PROPERTY_STRING_DECLARATIONS,
    RENTAL_BOOLEAN_DECLARATIONS: RENTAL_BOOLEAN_DECLARATIONS,
    RENTAL_DECLARATIONS: RENTAL_DECLARATIONS,
    DISPOSITION_DECLARATIONS: DISPOSITION_DECLARATIONS,
    DISPOSITION_STRING_DECLARATIONS: DISPOSITION_STRING_DECLARATIONS,
    BENEFIT_DECLARATIONS: BENEFIT_DECLARATIONS,
    BENEFIT_RECORD_DECLARATIONS: BENEFIT_RECORD_DECLARATIONS,
    CLAIM_AGE_SET_DECLARATIONS: CLAIM_AGE_SET_DECLARATIONS,
    CLAIM_AGE_STRING_DECLARATIONS: CLAIM_AGE_STRING_DECLARATIONS,
    LOOKBACK_DECLARATIONS: LOOKBACK_DECLARATIONS,
    USE_DAY_DECLARATIONS: USE_DAY_DECLARATIONS,
    WORKSPACE_FIELDS: WORKSPACE_FIELDS,
    clearAllPrivateData: clearAllPrivateData,
    createEmptyWorkspace: createEmptyWorkspace,
    declaredStorageKeys: declaredStorageKeys,
    declaredUnavailableDomains: declaredUnavailableDomains,
    exportManifest: exportManifest,
    isForbiddenKey: isForbiddenKey,
    minimumViableInput: minimumViableInput,
    privacyInventory: privacyInventory,
    readWorkspace: readWorkspace,
    sanitizeForExport: sanitizeForExport,
    validateConfig: validateConfig,
    validateWorkspace: validateWorkspace,
    writeStorageKey: writeStorageKey,
    writeWorkspace: writeWorkspace
  });

  root.RLTAXWORKSPACE = api;
  if (typeof module !== "undefined" && module && module.exports) module.exports = api;
}());
