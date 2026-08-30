/*
 * tests/portfolio-test-integrity.unit.mjs — Feature 008 Scope 28, TP-28-04.
 *
 * SCN-008-054. The other Feature 008 carriers assert that the repaired behavior is correct. Nothing
 * asserted that those assertions would still FAIL if the audited defect came back — and an
 * assertion that cannot fail is not a proof, it is a receipt. This file closes that gap by
 * challenging each protective test with the reduced implementation it exists to reject.
 *
 * FOR EACH AUDITED DEFECT CLASS, three facts are established by execution, not by narration:
 *
 *   1. DISCOVERY — the protective title resolves to EXACTLY ONE executed test. `# tests 1` is
 *      asserted on every run, so a renamed or deleted test surfaces as a zero-match here instead of
 *      passing silently. This is the "no zero-match selector may pass" obligation, enforced per case.
 *   2. GREEN ON SHIPPED — that test passes against the shipped tree.
 *   3. RED ON THE DEFECT — the SAME command fails when the audited defect is represented inside a
 *      disposable in-memory copy of the shipped module.
 *
 * (1) and (2) alone are what every Feature 008 report already showed. (3) is the load-bearing part,
 * and it is the only one that can distinguish a real proof from a test that would pass either way.
 *
 * THE SHIPPED SOURCE IS NEVER MUTATED. `tests/portfolio-defect-injector.cjs` substitutes the reduced
 * source between "bytes read from disk" and "source handed to the engine". The working tree is
 * byte-identical before and after — asserted here by a sha256 over every touched module, taken
 * before the first case and again after the last one.
 *
 * WHY EACH DEFECT IS THE AUDITED ONE, not a random breakage. Every representation is a single-line
 * substitution that reproduces the specific shortcut the finding names: an annualization taken from
 * the market-session return count instead of exact elapsed calendar days; a cash need funded at the
 * first session instead of its declared date; a fixed -05:00 offset instead of resolved New York
 * civil time. Corrupting a function at random would prove only that the suite notices rubble.
 *
 * COVERAGE IS DERIVED, NOT DECLARED. The set of audited defect classes is read at run time from the
 * one-owner finding ledger in `scopes/_index.md` and filtered to the remediation scopes. A finding
 * added to that ledger with no case here fails this file, so the coverage claim cannot rot.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INJECTOR = join(ROOT, "tests", "portfolio-defect-injector.cjs");
const LEDGER = "specs/008-portfolio-survival-and-brief-lab/scopes/_index.md";
const ROUTE = "portfolio-survival-allocation-lab.html";
const SCOPE_CLAIMS_MODULE_URL = new URL("../scripts/verify-spec008-scope-claims.mjs", import.meta.url);
const SCOPE_CLAIMS_MANIFEST = join(ROOT, "scripts", "spec008-scope-claims.json");
const SCOPE_CLAIMS_SCHEMA = "spec008-scope-claims/v2";
const FEATURE_ROOT = "specs/008-portfolio-survival-and-brief-lab";
const SYNTHETIC_REPOSITORY_ROOT = ROOT;
const COMMIT_ALIAS_ORIGIN = "6c84913a";
const BOUNDARY_ROW_SUFFIX = "attribution covers every claimed path and marker, hunk, or whole-file ownership declaration";
const CONSUMER_ROW = "Consumer impact sweep completed; zero stale first-party references remain";
const BOUNDARY_SCOPE_IDS = [3, 4, 8, 9, ...Array.from({ length: 13 }, (_, index) => index + 16)].map(scopeId);
const CONSUMER_SCOPE_IDS = [
  ...Array.from({ length: 11 }, (_, index) => index + 3),
  ...Array.from({ length: 13 }, (_, index) => index + 15)
].map(scopeId);
const SCOPE_ARTIFACTS = Object.freeze({
  "03": "scopes/03-local-behavior-privacy-inventory-and-clear/scope.md",
  "04": "scopes/04-public-evidence-barrier-and-coverage/scope.md",
  "05": "scopes/05-four-window-direct-scope-brief/scope.md",
  "06": "scopes/06-explainable-research-action-lifecycle/scope.md",
  "07": "scopes/07-return-and-drawdown-x-ray/scope.md",
  "08": "scopes/08-concentration-capm-and-risk-contribution/scope.md",
  "09": "scopes/09-dependent-path-reproducibility/scope.md",
  "10": "scopes/10-dated-cash-needs-and-survival-states/scope.md",
  "11": "scopes/11-stress-tail-and-alternative-dependence/scope.md",
  "12": "scopes/12-hedge-variant-research/scope.md",
  "13": "scopes/13-six-method-allocation-basis-and-feasibility/scope.md",
  "15": "scopes/15-walk-forward-research-dossier-and-claim-boundaries/scope.md",
  "16": "scopes/16-integrated-route-accessibility-and-atomic-release/scope.md",
  "17": "scopes/17-local-lifecycle-and-verified-clear-foundation/scope.md",
  "18": "scopes/18-behavior-identity-and-ranking-foundation/scope.md",
  "19": "scopes/19-coverage-aware-market-data-foundation/scope.md",
  "20": "scopes/20-generic-evidence-brief-policy-and-api/scope.md",
  "21": "scopes/21-partial-risk-input-and-diagnostics/scope.md",
  "22": "scopes/22-scenario-contract-and-survival-distributions/scope.md",
  "23": "scopes/23-stress-dependence-and-hedge-effectiveness/scope.md",
  "24": "scopes/24-complete-allocation-and-explicit-views/scope.md",
  "25": "scopes/25-decision-time-dossier-and-immutable-audit/scope.md",
  "26": "scopes/26-immutable-workspace-compute-and-navigation/scope.md",
  "27": "scopes/27-accessible-six-tab-interaction/scope.md",
  "28": "scopes/28-spec-driven-adversarial-test-replacement/scope.md"
});

/* The remediation scopes. A ledger finding whose execution home is one of these is an audited
   defect class this file must challenge; an analyst/plan/docs/external row is not. */
const REMEDIATION_SCOPES = { first: 17, last: 28 };

const CASES = [
  {
    finding: "F008-PORTFOLIO-LIFECYCLE-001",
    scope: 17,
    defect: "a removal returns the unchanged row set, so a holding can never actually be removed",
    module: "rlportfolio.js",
    find: "      draftResult.value.rows.filter(function (row) { return row.holdingId !== holdingId; }),",
    replace: "      draftResult.value.rows,",
    carrier: "tests/portfolio-privacy.functional.mjs",
    title: "SCN-008-042 and SCN-008-043 multi-row revision and full clear round trip through fresh adapters and controller inspection",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-CLEAR-RUNTIME-001",
    scope: 17,
    defect: "the personal-category registry stops discovering undeclared personal keys at runtime",
    module: "rlportfolio.js",
    find: "          if (reservedPersonalKey(stored.key) && !declared[locationKey]) {",
    replace: "          if (false) {",
    carrier: "tests/portfolio-privacy.functional.mjs",
    title: "Adversarial: full personal clear detects undeclared keys live state and arbitrary residue",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-CLEAR-TEST-001",
    scope: 17,
    defect: "public keys are no longer recorded as exclusions, so the clear cannot show what it left alone",
    module: "rlportfolio.js",
    find: "          } else if (!reservedPersonalKey(stored.key)) {",
    replace: "          } else if (false) {",
    carrier: "tests/portfolio-privacy.functional.mjs",
    title: "BUG-008 clear mapping: public exclusions enumerate untouched public storage",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-BEHAVIOR-CONTRACT-001",
    scope: 18,
    defect: "behavior identity collapses to the subject alone, so semantically distinct events collide",
    module: "rlportfolio.js",
    find: "    var fingerprintPayload = clone(payload);",
    replace: "    var fingerprintPayload = { subjectId: payload.subjectId };",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-BAR-COVERAGE-001",
    scope: 19,
    defect: "coverage falls back to the legacy cache measurement and ignores the declared source policy",
    module: "rldata.js",
    find: "    return acquireBarCoverage(sym, interval, target, sourcePolicy);",
    replace: "    return measureBarCoverageLegacy(sym, interval, target);",
    carrier: "tests/portfolio-bar-coverage.functional.mjs",
    title: "SCN-008-045 same-origin append measures actual bounds and preserves partial truth without lookup",
    intendedHook: "fs.readFileSync"
  },
  {
    finding: "F008-BRIEF-EVIDENCE-001",
    scope: 20,
    defect: "history evidence is taken raw instead of by fingerprint, so one observation is counted twice",
    module: "rlportfoliobrief.js",
    find: "    var selectedHistoryRefs = Object.keys(historyByEvidence).sort().map(function (key) { return historyByEvidence[key]; });",
    replace: "    var selectedHistoryRefs = input.historyRefs.slice();",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-BRIEF-POLICY-001",
    scope: 20,
    defect: "the window cutoff uses a fixed -05:00 offset instead of resolved New York civil time",
    module: "rlportfoliobrief.js",
    find: "    return actual === expected ? new Date(guess).toISOString() : null;",
    replace: "    return new Date(target + 5 * 3600000).toISOString();",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-BROWSER-API-001",
    scope: 20,
    defect: "the designed public API is incomplete — whyShown is not exported",
    module: "rlportfoliobrief.js",
    find: "    whyShown: whyShown,",
    replace: "    /* reduced: whyShown is not part of the exported API */",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-RISK-INPUT-001",
    scope: 21,
    defect: "one unlisted holding refuses the whole portfolio instead of degrading per metric",
    module: "rlportfolioanalytics.js",
    find: "      else excluded.push({ symbol: h.symbol, assetType: h.assetType || \"unknown\" });",
    replace: "      else return { state: \"unsupported-holding\", symbol: h.symbol };",
    carrier: "tests/portfolio-risk.functional.mjs",
    title: "BUG-009 risk mapping: unsupported holdings remain named exclusions",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-RISK-DIAGNOSTICS-001",
    scope: 21,
    defect: "CAGR is annualized from the return count instead of exact elapsed calendar days",
    module: "rlportfolioanalytics.js",
    find: "    var years = elapsedDays / CALENDAR_DAYS_PER_YEAR;",
    replace: "    var years = returns.length / ppy;",
    carrier: "tests/portfolio-analytics.unit.mjs",
    title: "TP-07-01 arithmetic, compounded and drag are separate and independently correct",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-PATH-CONTRACT-001",
    scope: 22,
    defect: "a superseded compute token is accepted, so a stale chunk can publish over a newer one",
    module: "rlportfolioanalytics.js",
    find: "    if (token.workspaceIdentity !== spec.workspaceIdentity || token.scenarioIdentity !== identity) {",
    replace: "    if (false) {",
    carrier: "tests/portfolio-paths.functional.mjs",
    title: "BUG-008 token mapping: mismatched scenario identity is superseded directly",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-SURVIVAL-PATH-001",
    scope: 22,
    defect: "every cash need is funded at the first session instead of its declared date",
    module: "rlportfolioanalytics.js",
    find: "        if (sessionDates[s] >= flow.date) { session = s; break; }",
    replace: "        if (s === 0) { session = s; break; }",
    carrier: "tests/portfolio-paths.functional.mjs",
    title: "BUG-008 cash-need mapping: declared date resolves to the first eligible session",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-DIVERSIFICATION-001",
    scope: 23,
    defect: "the qualified Forbes-Rigobon path is unreachable, leaving the unqualified adjustment",
    module: "rlportfolioanalytics.js",
    find: "    if (input && input.contractVersion === \"ForbesRigobonRequest/v1\") {",
    replace: "    if (false) {",
    carrier: "tests/portfolio-diversification.functional.mjs",
    title: "BUG-008 diversification mapping: qualified Forbes-Rigobon adjustment exposes orientation and estimate",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-HEDGE-001",
    scope: 23,
    defect: "hedge basis risk no longer requires an aligned excess-return sample",
    module: "rlportfolioanalytics.js",
    find: "    if (request.sample.definitionKind !== \"aligned-excess-returns\") {",
    replace: "    if (false) {",
    carrier: "tests/portfolio-diversification.functional.mjs",
    title: "BUG-008 hedge mapping: non-aligned excess-return sample is unavailable",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-ALLOCATION-001",
    scope: 24,
    defect: "declared constraints are dropped before feasibility, so nothing is ever infeasible",
    module: "rlportfolioanalytics.js",
    find: "    var list = Array.isArray(constraints) ? constraints : [];",
    replace: "    var list = [];",
    carrier: "tests/portfolio-allocation.functional.mjs",
    title: "BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-SENSITIVITY-BL-001",
    scope: 24,
    defect: "stated views never reach the posterior, leaving Black-Litterman equilibrium-only",
    module: "rlportfolioanalytics.js",
    find: "    var sigma = request.covariance;",
    replace: "    var sigma = request.covariance;\n    request = Object.assign({}, request, { views: [] });",
    carrier: "tests/portfolio-allocation.functional.mjs",
    title: "TP-14-02 production sensitivity and Black-Litterman lifecycle run on the common basis",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-DOSSIER-001",
    scope: 25,
    defect: "an incomplete decision-fold request is accepted, so walk-forward can skip its own contract",
    module: "rlportfolioanalytics.js",
    find: "    ]) || request.contractVersion !== DECISION_FOLD_REQUEST_VERSION) {",
    replace: "    ]) && false) {",
    carrier: "tests/portfolio-dossier.functional.mjs",
    title: "BUG-008 dossier mapping: incomplete decision-fold request is request-invalid",
    intendedHook: "Module._compile"
  },
  {
    finding: "F008-COMPUTE-NAV-001",
    scope: 26,
    defect: "a consumed ReturnContext is left in storage, so the handoff can be replayed",
    module: "rlportfolio.js",
    find: "    function discard() { try { storage.removeItem(RETURN_CONTEXT_KEY); } catch (error) { /* already gone */ } }",
    replace: "    function discard() { /* reduced: the consumed context is left behind */ }",
    carrier: "tests/portfolio-workspace.functional.mjs",
    title: "Adversarial: recomputing navigation stale publication and fake return context cannot pass",
    intendedHook: "Module._compile"
  }
];

/* Scope 27's repaired behavior is markup the browser matrix drives, and mutation-running Playwright
   for one assertion is not worth its cost. What IS checked here, in-process and with the same
   red/green discipline, is that the route's accessibility affordances are individually load-bearing:
   removing any one of them from a disposable copy must break the structural probe. This is a proof
   about the affordances, not a substitute for TP-28-03. */
const ACCESSIBILITY_AFFORDANCES = [
  { id: "skip-link", markup: "<a id=\"skipToWorkspace\" class=\"skip-link\" href=\"#briefWorkspace\">Skip to the workspace panel</a>" },
  { id: "tablist-role", markup: "<nav class=\"tablist\" role=\"tablist\" aria-label=\"Portfolio workspace\">" },
  { id: "reduced-motion", markup: "@media (prefers-reduced-motion: reduce) {" },
  { id: "forced-colors", markup: "@media (forced-colors: active) {" }
];

function escapeForNamePattern(title) {
  return title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sha256(relPath) {
  return createHash("sha256").update(readFileSync(join(ROOT, relPath))).digest("hex");
}

function scopeId(value) {
  return String(value).padStart(2, "0");
}

function compareScopeClaimPair(left, right) {
  return Number(left.scopeId) - Number(right.scopeId)
    || (left.kind === right.kind ? 0 : left.kind === "boundary" ? -1 : 1);
}

function canonicalScopeClaimPairs() {
  return [
    ...BOUNDARY_SCOPE_IDS.map((id) => ({ scopeId: id, kind: "boundary" })),
    ...CONSUMER_SCOPE_IDS.map((id) => ({ scopeId: id, kind: "consumer" }))
  ].sort(compareScopeClaimPair);
}

function boundaryRow(id) {
  return `Scope-${id} ${BOUNDARY_ROW_SUFFIX}`;
}

function definitionOfDoneSection(id) {
  return Number(id) >= 17 ? "Definition of Done - Tiered Validation" : "Definition of Done";
}

function canonicalObject(value) {
  if (Array.isArray(value)) return value.map(canonicalObject);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalObject(value[key])]));
}

function descriptorOrder(left, right) {
  return left.path.localeCompare(right.path)
    || left.identityKind.localeCompare(right.identityKind)
    || left.identity.localeCompare(right.identity);
}

function normalizedDescriptors(descriptors) {
  return descriptors.map((descriptor) => ({ ...descriptor })).sort(descriptorOrder);
}

function inventorySha256(descriptors) {
  const normalized = normalizedDescriptors(descriptors).map(canonicalObject);
  return `sha256:${createHash("sha256").update(JSON.stringify(normalized)).digest("hex")}`;
}

function encodedDescriptor(descriptor) {
  return `${descriptor.path} :: ${descriptor.identityKind} :: ${descriptor.identity}`;
}

function decodedDescriptor(value) {
  const parts = value.split(" :: ");
  assert.equal(parts.length, 3, `descriptor table value must have three structural fields: ${value}`);
  return { path: parts[0], identityKind: parts[1], identity: parts[2] };
}

function addFixtureText(records, path, text) {
  const prior = records.get(path)?.text ?? "";
  if (prior.includes(text)) return;
  records.set(path, {
    type: "file",
    realPath: join(SYNTHETIC_REPOSITORY_ROOT, path),
    text: prior ? `${prior}\n${text}` : text
  });
}

function setFixtureText(records, path, text) {
  records.set(path, {
    type: "file",
    realPath: join(SYNTHETIC_REPOSITORY_ROOT, path),
    text
  });
}

function boundaryDescriptors(id) {
  const sharedEvolution = { path: "shared/evolving-boundary.mjs", identityKind: "exported-symbol", identity: "evolvingBoundary" };
  return [
    id === "03" || id === "04"
      ? sharedEvolution
      : { path: `owned/scope-${id}.mjs`, identityKind: "whole-file", identity: "whole-file" },
    { path: `owned/scope-${id}.mjs`, identityKind: "exported-symbol", identity: `scope${id}Boundary` },
    { path: `tests/scope-${id}.unit.mjs`, identityKind: "test-title", identity: `Scope ${id} boundary contract` },
    { path: `public/scope-${id}.html`, identityKind: "dom-id", identity: `scope-${id}-surface` }
  ];
}

function sourceTable(section, descriptor) {
  return [
    `### ${section}`,
    "",
    "| Descriptor |",
    "|---|",
    `| \`${encodedDescriptor(descriptor)}\` |`
  ].join("\n");
}

function addDescriptorRecord(records, descriptor) {
  if (descriptor.identityKind === "whole-file") {
    addFixtureText(records, descriptor.path, `// ${descriptor.path} is explicitly owned as a whole file.`);
  } else if (descriptor.identityKind === "exported-symbol") {
    addFixtureText(records, descriptor.path, `export const ${descriptor.identity} = true;`);
  } else if (descriptor.identityKind === "test-title") {
    addFixtureText(records, descriptor.path, `test("${descriptor.identity}", () => assert.equal(2 + 3, 5));`);
  } else if (descriptor.identityKind === "dom-id") {
    addFixtureText(records, descriptor.path, `<section id="${descriptor.identity}"></section>`);
  } else {
    assert.fail(`unsupported synthetic descriptor identity kind: ${descriptor.identityKind}`);
  }
}

function edgeSurface(pathFamily, path, identityKind, identity) {
  return { pathFamily, path, identityKind, identity };
}

function boundaryEdgePolicy(id) {
  const sourcePath = `owned/scope-${id}.mjs`;
  return {
    dependency: {
      permittedSurfaces: [edgeSurface("permitted/", `permitted/dependency-${id}.mjs`, "exported-symbol", `permittedDependency${id}`)],
      forbiddenSurfaces: [edgeSurface("forbidden/", `forbidden/dependency-${id}.mjs`, "exported-symbol", `forbiddenDependency${id}`)]
    },
    filesystemWrite: {
      permittedSurfaces: [edgeSurface("permitted/", `permitted/output-${id}.json`, "whole-file", "whole-file")],
      forbiddenSurfaces: [edgeSurface("forbidden/", `forbidden/output-${id}.json`, "whole-file", "whole-file")]
    },
    durableStorageWrite: {
      permittedSurfaces: [edgeSurface("owned/", sourcePath, "config-key", `scope${id}PublicState`)],
      forbiddenSurfaces: [edgeSurface("owned/", sourcePath, "config-key", `scope${id}PrivateState`)]
    },
    publicConsumer: {
      permittedSurfaces: [edgeSurface("public/", `public/permitted-${id}.html`, "dom-id", `scope-${id}-consumer`)],
      forbiddenSurfaces: [
        edgeSurface("public/", `public/forbidden-${id}.html`, "dom-id", `scope-${id}-forbidden-consumer`),
        edgeSurface("public/", `public/forbidden-${id}.json`, "config-key", "module"),
        edgeSurface("public/", `public/forbidden-${id}.md`, "marker", `scope-${id}-public-link`),
        edgeSurface("public/", `public/forbidden-${id}.mjs`, "local-symbol", `scope${id}RouteConsumer`)
      ]
    }
  };
}

function addBoundarySemanticRecords(records, id) {
  const sourcePath = `owned/scope-${id}.mjs`;
  addFixtureText(records, `permitted/dependency-${id}.mjs`, `export function permittedDependency${id}(value) { return Number(value) + 1; }`);
  addFixtureText(records, `forbidden/dependency-${id}.mjs`, `export function forbiddenDependency${id}(value) { return Number(value) - 1; }`);
  addFixtureText(records, `permitted/output-${id}.json`, "{}\n");
  addFixtureText(records, `forbidden/output-${id}.json`, "{}\n");
  addFixtureText(
    records,
    sourcePath,
    [
      `import { permittedDependency${id} as allowedDependency${id} } from "../permitted/dependency-${id}.mjs";`,
      `import { writeFileSync as writeScope${id}File } from "node:fs";`,
      `export function classifyScope${id}Edges(value) {`,
      `  writeScope${id}File("../permitted/output-${id}.json", String(value));`,
      `  localStorage.setItem("scope${id}PublicState", String(value));`,
      `  return allowedDependency${id}(value);`,
      "}"
    ].join("\n")
  );
  addFixtureText(
    records,
    `public/permitted-${id}.html`,
    `<main id="scope-${id}-consumer"><script type="module" src="../owned/scope-${id}.mjs"></script></main>`
  );
  addFixtureText(records, `public/forbidden-${id}.html`, `<main id="scope-${id}-forbidden-consumer"></main>`);
  addFixtureText(records, `public/forbidden-${id}.json`, "{}\n");
  addFixtureText(records, `public/forbidden-${id}.md`, `<!-- scope-${id}-public-link -->\n`);
  addFixtureText(records, `public/forbidden-${id}.mjs`, `export const scope${id}RouteConsumer = null;\n`);
}

function ownershipFor(id, descriptor) {
  if (descriptor.path === "shared/evolving-boundary.mjs" && descriptor.identity === "evolvingBoundary") {
    return { mode: "ordered-evolution", chainId: "scope-03-04-boundary-evolution", orderedScopeIds: ["03", "04"] };
  }
  return { mode: "exclusive", ownerScopeId: id };
}

function createBoundaryEntry(records, scopeParts, id, artifact) {
  const descriptors = boundaryDescriptors(id);
  const sourceSpecs = [
    { role: "owned-paths", section: "Boundary Owned Paths", descriptor: descriptors[0] },
    { role: "owned-identities", section: "Boundary Owned Identities", descriptor: descriptors[1] },
    { role: "test-identities", section: "Boundary Test Identities", descriptor: descriptors[2] },
    { role: "edge-surfaces", section: "Boundary Edge Surfaces", descriptor: descriptors[3] }
  ];
  for (const source of sourceSpecs) {
    scopeParts.push(sourceTable(source.section, source.descriptor));
    addDescriptorRecord(records, source.descriptor);
  }
  addBoundarySemanticRecords(records, id);
  const orderedDescriptors = normalizedDescriptors(descriptors);
  return {
    itemId: `SCOPE-${id}-BOUNDARY-CLAIM`,
    scopeId: id,
    kind: "boundary",
    dodClaim: boundaryRow(id),
    claimSource: { artifact, section: definitionOfDoneSection(id), rowIdentity: boundaryRow(id) },
    expectedInventory: {
      sources: sourceSpecs.map(({ role, section }) => ({
        artifact,
        section,
        selector: { kind: "table-column", value: "Descriptor" },
        role
      })),
      descriptors: orderedDescriptors,
      descriptorCount: orderedDescriptors.length,
      inventorySha256: inventorySha256(orderedDescriptors)
    },
    attributedPaths: orderedDescriptors.map((descriptor) => ({
      ...descriptor,
      ownership: ownershipFor(id, descriptor)
    })),
    allowedFamilies: ["owned/", "public/", "shared/", "tests/"],
    edgePolicy: boundaryEdgePolicy(id)
  };
}

function commitOrigin() {
  return {
    kind: "commit",
    commit: COMMIT_ALIAS_ORIGIN,
    path: "tests/portfolio-test-integrity.unit.mjs",
    identity: "SCOPE_CLAIMS_REFUSALS"
  };
}

function consumerAliases(records, scopeParts, id, artifact, scanSurfaces) {
  if (id === "03") {
    const identity = "LEGACY_SCOPE_03";
    scopeParts.push(["### Legacy Alias Origins", "", `- Alias: \`${identity}\``].join("\n"));
    return {
      mode: "declared",
      values: [{
        identity,
        origin: { kind: "artifact", artifact, section: "Legacy Alias Origins", identity },
        scanSurfaces
      }]
    };
  }
  if (id === "04") {
    const identity = "LEGACY_SCOPE_04";
    const contractPath = "contracts/scope-04-aliases.json";
    setFixtureText(records, contractPath, `${JSON.stringify({ aliases: { [identity]: "produceScope04" } }, null, 2)}\n`);
    return {
      mode: "declared",
      values: [{
        identity,
        origin: { kind: "current-contract", path: contractPath, identity },
        scanSurfaces
      }]
    };
  }
  if (id === "05") {
    return {
      mode: "declared",
      values: [{ identity: "SCOPE_CLAIMS_REFUSALS", origin: commitOrigin(), scanSurfaces }]
    };
  }
  return {
    mode: "none",
    reason: `Scope ${id} has no grounded stale aliases`,
    scanSurfaces
  };
}

function createConsumerEntry(records, scopeParts, id, artifact) {
  const producerPath = `owned/producer-${id}.mjs`;
  const consumerPath = `consumers/scope-${id}.mjs`;
  const testPath = `tests/scope-${id}.unit.mjs`;
  const producerIdentity = `produceScope${id}`;
  const consumerUseIdentity = `produceScope${id}ForConsumer`;
  const consumerIdentity = `renderScope${id}`;
  const title = `Scope ${id} consumer contract`;
  const assertionIdentity = `assert.equal(actual, ${2 * (Number(id) + 2)});`;
  const producer = { path: producerPath, language: "javascript", identityKind: "exported-symbol", identity: producerIdentity };
  const consumer = {
    path: consumerPath,
    language: "javascript",
    dependencyEdge: "static-import",
    useKind: "call",
    useIdentity: consumerUseIdentity
  };
  const testCarrier = { path: testPath, title, assertionKind: "strict-equal", assertionIdentity };
  addFixtureText(
    records,
    producerPath,
    `export function ${producerIdentity}(value) { return Number(value) + ${Number(id)}; }`
  );
  addFixtureText(
    records,
    consumerPath,
    [
      `import { ${producerIdentity} as ${consumerUseIdentity} } from "../${producerPath}";`,
      `export function ${consumerIdentity}(value) { return ${consumerUseIdentity}(value) * 2; }`
    ].join("\n")
  );
  addFixtureText(
    records,
    testPath,
    [
      "import test from \"node:test\";",
      "import assert from \"node:assert/strict\";",
      `import { ${consumerIdentity} } from "../${consumerPath}";`,
      `test("${title}", () => {`,
      `  const actual = ${consumerIdentity}(2);`,
      `  ${assertionIdentity}`,
      "});"
    ].join("\n")
  );
  const scanSurfaces = [producerPath, consumerPath, testPath];
  return {
    itemId: `SCOPE-${id}-CONSUMER-CLAIM`,
    scopeId: id,
    kind: "consumer",
    dodClaim: CONSUMER_ROW,
    claimSource: { artifact, section: definitionOfDoneSection(id), rowIdentity: CONSUMER_ROW },
    canonicalProducers: [producer],
    consumerSurfaces: [consumer],
    testCarriers: [testCarrier],
    aliases: consumerAliases(records, scopeParts, id, artifact, scanSurfaces),
    causalBindings: [{
      bindingId: `SCOPE-${id}-PRODUCER-CONSUMER-ASSERTION`,
      producer: { ...producer },
      consumer: { ...consumer },
      test: { ...testCarrier }
    }]
  };
}

function makeRecordReader(fixture, commitReader) {
  const reader = (path) => {
    const override = fixture.overrides.get(path);
    if (override) return { ...override };
    const record = fixture.records?.get(path);
    return record ? { ...record } : null;
  };
  reader.listPaths = () => [...new Set([
    ...(fixture.records ? fixture.records.keys() : []),
    ...fixture.overrides.keys()
  ])].sort();
  reader.readCommit = commitReader;
  return reader;
}

function syntheticCommitReader(commit, path) {
  if (commit !== COMMIT_ALIAS_ORIGIN || path !== "tests/portfolio-test-integrity.unit.mjs") return null;
  return { text: "const SCOPE_CLAIMS_REFUSALS = Object.freeze({ legacy: true });\n" };
}

function createScopeClaimsFixture() {
  const records = new Map();
  const entries = [];
  const boundarySet = new Set(BOUNDARY_SCOPE_IDS);
  const consumerSet = new Set(CONSUMER_SCOPE_IDS);

  for (const id of Object.keys(SCOPE_ARTIFACTS).sort()) {
    const artifact = SCOPE_ARTIFACTS[id];
    const scopeParts = [
      `# Scope ${id}`,
      "",
      `**Depends On:** ${id === "04" ? "Scope 03" : "None"}`,
      "",
      `### ${definitionOfDoneSection(id)}`,
      "",
      ...(boundarySet.has(id) ? [`- [ ] ${boundaryRow(id)}`] : []),
      ...(consumerSet.has(id) ? [`- [ ] ${CONSUMER_ROW}`] : [])
    ];
    if (boundarySet.has(id)) entries.push(createBoundaryEntry(records, scopeParts, id, artifact));
    if (consumerSet.has(id)) entries.push(createConsumerEntry(records, scopeParts, id, artifact));
    setFixtureText(records, `${FEATURE_ROOT}/${artifact}`, `${scopeParts.join("\n\n")}\n`);
  }

  const fixture = {
    kind: "synthetic",
    manifest: { schemaVersion: SCOPE_CLAIMS_SCHEMA, specId: "008", entries: entries.reverse() },
    repositoryRoot: SYNTHETIC_REPOSITORY_ROOT,
    records,
    overrides: new Map(),
    cleanup() {}
  };
  fixture.sourceReader = makeRecordReader(fixture, syntheticCommitReader);
  return fixture;
}

function fixtureSignature(fixture) {
  return JSON.stringify({
    manifest: fixture.manifest,
    records: fixture.records ? [...fixture.records.entries()].sort(([left], [right]) => left.localeCompare(right)) : null,
    overrides: [...fixture.overrides.entries()].sort(([left], [right]) => left.localeCompare(right)),
    physical: fixture.physicalRoot ? physicalFixtureSignature(fixture) : null
  });
}

function scopeClaimEntry(fixture, kind, id) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === kind && candidate.scopeId === id);
  assert.ok(entry, `synthetic fixture must contain ${kind} scope ${id}`);
  return entry;
}

function fixtureRecord(fixture, path) {
  const record = fixture.overrides.get(path) ?? fixture.records?.get(path) ?? fixture.sourceReader(path);
  assert.ok(record, `synthetic fixture must contain ${path}`);
  if (fixture.records?.has(path)) return fixture.records.get(path);
  fixture.overrides.set(path, { ...record });
  return fixture.overrides.get(path);
}

function removeFixtureToken(fixture, path, token) {
  const record = fixtureRecord(fixture, path);
  assert.equal(record.text.split(token).length - 1, 1, `${path} must contain ${token} exactly once before mutation`);
  record.text = record.text.replace(token, "REMOVED_BY_ADVERSARIAL_FIXTURE");
}

function appendFixtureToken(fixture, path, token) {
  const record = fixtureRecord(fixture, path);
  assert.equal(record.text.includes(token), false, `${path} must omit ${token} before mutation`);
  record.text = `${record.text}\n${token}`;
}

async function loadScopeClaimsVerifier() {
  let verifierModule;
  try {
    verifierModule = await import(SCOPE_CLAIMS_MODULE_URL.href);
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND" && String(error.message).includes("verify-spec008-scope-claims.mjs")) {
      assert.fail(`SCOPE_CLAIMS_VERIFIER_MODULE_MISSING: ${error.code}: ${error.message}`);
    }
    throw error;
  }
  assert.equal(
    typeof verifierModule.verifySpec008ScopeClaims,
    "function",
    "SCOPE_CLAIMS_VERIFIER_EXPORT_MISSING: verifySpec008ScopeClaims must be a pure function"
  );
  assert.equal(
    typeof verifierModule.serializeSpec008ScopeClaimsResult,
    "function",
    "SCOPE_CLAIMS_VERIFIER_EXPORT_MISSING: serializeSpec008ScopeClaimsResult must be a pure function"
  );
  assert.equal(
    verifierModule.SCOPE_CLAIMS_REFUSAL_V2 !== null && typeof verifierModule.SCOPE_CLAIMS_REFUSAL_V2 === "object",
    true,
    "SCOPE_CLAIMS_REFUSAL_V2_EXPORT_MISSING: verifier must export the v2 refusal enum"
  );
  assert.equal(
    Object.isFrozen(verifierModule.SCOPE_CLAIMS_REFUSAL_V2),
    true,
    "SCOPE_CLAIMS_REFUSAL_V2_NOT_FROZEN: exported refusal enum must be frozen"
  );
  const refusalValues = Object.values(verifierModule.SCOPE_CLAIMS_REFUSAL_V2);
  assert.equal(refusalValues.length > 0, true, "SCOPE_CLAIMS_REFUSAL_V2 must not be empty");
  assert.equal(new Set(refusalValues).size, refusalValues.length, "SCOPE_CLAIMS_REFUSAL_V2 codes must be unique");
  assert.equal(refusalValues.every((code) => typeof code === "string" && /^SCV2-/.test(code)), true);
  return {
    verifySpec008ScopeClaims: verifierModule.verifySpec008ScopeClaims,
    serializeSpec008ScopeClaimsResult: verifierModule.serializeSpec008ScopeClaimsResult,
    SCOPE_CLAIMS_REFUSAL_V2: verifierModule.SCOPE_CLAIMS_REFUSAL_V2
  };
}

function verifyFixture(verifier, fixture) {
  return verifier.verifySpec008ScopeClaims({
    manifest: structuredClone(fixture.manifest),
    repositoryRoot: fixture.repositoryRoot,
    sourceReader: fixture.sourceReader
  });
}

function expectedResultOrder() {
  return canonicalScopeClaimPairs().map(({ scopeId: id, kind }) => ({
    itemId: `SCOPE-${id}-${kind.toUpperCase()}-CLAIM`,
    scopeId: id,
    kind
  }));
}

function assertExactScopeClaimsResult(result) {
  assert.deepEqual(
    Object.keys(result),
    ["schemaVersion", "specId", "manifestSha256", "results", "summary"],
    "result root must use the closed key order"
  );
  assert.equal(result.schemaVersion, SCOPE_CLAIMS_SCHEMA);
  assert.equal(result.specId, "008");
  assert.match(result.manifestSha256, /^sha256:[0-9a-f]{64}$/);
  assert.equal(result.results.length, 41);
  assert.deepEqual(
    result.results.map(({ itemId, scopeId, kind }) => ({ itemId, scopeId, kind })),
    expectedResultOrder(),
    "results must be the authority-derived 41 pairs in numeric-scope/kind order, independent of manifest order"
  );
  for (const row of result.results) {
    assert.deepEqual(
      Object.keys(row),
      ["itemId", "scopeId", "kind", "status", "checks"],
      `${row.itemId} must use the closed result key order`
    );
    assert.equal(row.status, "pass", `${row.itemId} must pass on the valid fixture`);
    assert.ok(Array.isArray(row.checks) && row.checks.length > 0, `${row.itemId} must report non-empty checks`);
    assert.equal(new Set(row.checks).size, row.checks.length, `${row.itemId} checks must be unique`);
  }
  assert.deepEqual(Object.keys(result.summary), ["total", "boundary", "consumer", "pass", "fail"]);
  assert.deepEqual(result.summary, { total: 41, boundary: 17, consumer: 24, pass: 41, fail: 0 });
}

function markdownSection(markdown, section) {
  const lines = markdown.split("\n");
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index]);
    if (heading?.[2] === section) starts.push({ index, level: heading[1].length });
  }
  assert.equal(starts.length, 1, `synthetic authority must contain section ${section} exactly once`);
  const start = starts[0];
  let end = lines.length;
  for (let index = start.index + 1; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+/.exec(lines[index]);
    if (heading && heading[1].length <= start.level) {
      end = index;
      break;
    }
  }
  return lines.slice(start.index + 1, end);
}

function derivePairsFromSyntheticAuthority(fixture) {
  const pairs = [];
  for (const id of Object.keys(SCOPE_ARTIFACTS).sort()) {
    const artifactPath = `${FEATURE_ROOT}/${SCOPE_ARTIFACTS[id]}`;
    const record = fixture.records.get(artifactPath);
    assert.ok(record, `synthetic authority must include ${artifactPath}`);
    const rows = markdownSection(record.text, definitionOfDoneSection(id))
      .map((line) => /^- \[[ x]\] (.+)$/.exec(line)?.[1])
      .filter(Boolean);
    if (rows.includes(boundaryRow(id))) pairs.push({ scopeId: id, kind: "boundary" });
    if (rows.includes(CONSUMER_ROW)) pairs.push({ scopeId: id, kind: "consumer" });
  }
  return pairs.sort(compareScopeClaimPair);
}

function deriveDescriptorsFromSyntheticAuthority(fixture, entry) {
  const descriptors = [];
  for (const source of entry.expectedInventory.sources) {
    assert.deepEqual(Object.keys(source), ["artifact", "section", "selector", "role"]);
    assert.deepEqual(Object.keys(source.selector), ["kind", "value"]);
    assert.equal(source.selector.kind, "table-column");
    assert.equal(source.selector.value, "Descriptor");
    const record = fixture.records.get(`${FEATURE_ROOT}/${source.artifact}`);
    assert.ok(record, `synthetic authority must include ${source.artifact}`);
    const section = markdownSection(record.text, source.section);
    const tableRows = section.filter((line) => /^\| `.+` \|$/.test(line));
    assert.equal(tableRows.length, 1, `${source.section} must resolve one descriptor row`);
    descriptors.push(decodedDescriptor(tableRows[0].slice(3, -3)));
  }
  return normalizedDescriptors(descriptors);
}

function assertSyntheticV2Authority(fixture) {
  assert.deepEqual(
    derivePairsFromSyntheticAuthority(fixture),
    canonicalScopeClaimPairs(),
    "the authoritative scope-artifact rows, not manifest membership, must derive exactly 17 boundary and 24 consumer pairs"
  );
  assert.equal(derivePairsFromSyntheticAuthority(fixture).length, 41);
  const originKinds = new Set();
  let declaredAliases = 0;
  let noneAliases = 0;
  const evolutionOwners = [];
  let exclusiveOwners = 0;
  for (const entry of fixture.manifest.entries) {
    if (entry.kind === "boundary") {
      const derived = deriveDescriptorsFromSyntheticAuthority(fixture, entry);
      const cached = normalizedDescriptors(entry.expectedInventory.descriptors);
      const attributed = normalizedDescriptors(entry.attributedPaths.map(({ ownership, ...descriptor }) => descriptor));
      assert.deepEqual(cached, derived, `${entry.itemId} cached inventory must equal independently derived authority`);
      assert.deepEqual(attributed, derived, `${entry.itemId} attribution must equal independently derived authority`);
      assert.equal(entry.expectedInventory.descriptorCount, derived.length);
      assert.equal(entry.expectedInventory.inventorySha256, inventorySha256(derived));
      assert.deepEqual(
        Object.keys(entry.edgePolicy),
        ["dependency", "filesystemWrite", "durableStorageWrite", "publicConsumer"],
        `${entry.itemId} must classify all four semantic edge analyzers`
      );
      for (const [edgeClass, policy] of Object.entries(entry.edgePolicy)) {
        assert.deepEqual(Object.keys(policy), ["permittedSurfaces", "forbiddenSurfaces"]);
        assert.equal(policy.permittedSurfaces.length > 0, true, `${entry.itemId}.${edgeClass} needs a permitted control`);
        assert.equal(policy.forbiddenSurfaces.length > 0, true, `${entry.itemId}.${edgeClass} needs a forbidden control`);
      }
      for (const descriptor of entry.attributedPaths) {
        if (descriptor.ownership.mode === "exclusive") {
          exclusiveOwners += 1;
          assert.equal(descriptor.ownership.ownerScopeId, entry.scopeId);
        } else {
          assert.equal(descriptor.ownership.mode, "ordered-evolution");
          assert.deepEqual(descriptor.ownership.orderedScopeIds, ["03", "04"]);
          evolutionOwners.push(entry.scopeId);
        }
      }
      continue;
    }
    assert.equal(entry.canonicalProducers.length, 1, `${entry.itemId} must name its producer`);
    assert.equal(entry.consumerSurfaces.length, 1, `${entry.itemId} must name its consumer use`);
    assert.equal(entry.testCarriers.length, 1, `${entry.itemId} must name its executable test assertion`);
    assert.equal(entry.causalBindings.length, 1, `${entry.itemId} must bind producer, consumer, and assertion`);
    assert.deepEqual(entry.causalBindings[0].producer, entry.canonicalProducers[0]);
    assert.deepEqual(entry.causalBindings[0].consumer, entry.consumerSurfaces[0]);
    assert.deepEqual(entry.causalBindings[0].test, entry.testCarriers[0]);
    if (entry.aliases.mode === "declared") {
      declaredAliases += 1;
      for (const alias of entry.aliases.values) originKinds.add(alias.origin.kind);
    } else {
      assert.equal(entry.aliases.mode, "none");
      noneAliases += 1;
    }
  }
  assert.equal(declaredAliases, 3, "synthetic authority must exercise every declared alias-origin form");
  assert.equal(noneAliases, 21, "remaining consumers must carry explicit grounded none declarations");
  assert.deepEqual([...originKinds].sort(), ["artifact", "commit", "current-contract"]);
  assert.equal(exclusiveOwners, 66, "all non-shared boundary tuples must have one exclusive owner");
  assert.deepEqual(evolutionOwners.sort(), ["03", "04"], "the shared tuple must carry one complete ordered evolution graph");
}

function reorderNormalizedCollections(fixture) {
  fixture.manifest.entries.reverse();
  for (const entry of fixture.manifest.entries) {
    if (entry.kind === "boundary") {
      entry.expectedInventory.sources.reverse();
      entry.expectedInventory.descriptors.reverse();
      entry.attributedPaths.reverse();
      entry.allowedFamilies.reverse();
      for (const policy of Object.values(entry.edgePolicy)) {
        policy.permittedSurfaces.reverse();
        policy.forbiddenSurfaces.reverse();
      }
    } else {
      entry.canonicalProducers.reverse();
      entry.consumerSurfaces.reverse();
      entry.testCarriers.reverse();
      entry.causalBindings.reverse();
      if (entry.aliases.mode === "declared") {
        entry.aliases.values.reverse();
        for (const alias of entry.aliases.values) alias.scanSurfaces.reverse();
      } else {
        entry.aliases.scanSurfaces.reverse();
      }
    }
  }
}

function assertDeterministicSyntheticScopeClaims(verifier) {
  const fixture = createScopeClaimsFixture();
  assertSyntheticV2Authority(fixture);
  const before = fixtureSignature(fixture);
  const first = verifyFixture(verifier, fixture);
  const second = verifyFixture(verifier, fixture);
  assertExactScopeClaimsResult(first);
  assert.deepEqual(second, first, "identical in-memory inputs must produce byte-equivalent result objects");
  assert.equal(fixtureSignature(fixture), before, "verification must not mutate the manifest or source-reader records");
  const firstJson = verifier.serializeSpec008ScopeClaimsResult(first);
  const secondJson = verifier.serializeSpec008ScopeClaimsResult(second);
  assert.equal(firstJson, `${JSON.stringify(first)}\n`, "JSON output must be one exact deterministic record plus newline");
  assert.equal(secondJson, firstJson, "repeated serialization must be byte stable");

  const reorderedFixture = createScopeClaimsFixture();
  reorderNormalizedCollections(reorderedFixture);
  const reorderedBefore = fixtureSignature(reorderedFixture);
  const reorderedResult = verifyFixture(verifier, reorderedFixture);
  assert.equal(
    verifier.serializeSpec008ScopeClaimsResult(reorderedResult),
    firstJson,
    "normalizing object keys and unordered arrays must produce byte-identical success output"
  );
  assert.equal(fixtureSignature(reorderedFixture), reorderedBefore, "normalization must not mutate reordered input");
}

function captureScopeClaimsRefusal(verifier, fixture) {
  try {
    const returned = verifyFixture(verifier, fixture);
    assert.fail(`expected a scope-claims refusal, received ${JSON.stringify(returned)}`);
  } catch (error) {
    assert.ok(error instanceof Error, "a refusal must throw an Error");
    assert.ok(error.refusal && typeof error.refusal === "object", "a refusal error must expose its deterministic refusal object");
    const refusal = error.refusal;
    assert.deepEqual(
      Object.keys(refusal),
      ["schemaVersion", "specId", "status", "refusalCode", "itemId", "detail"],
      "refusal output must use the closed v2 key order"
    );
    assert.equal(refusal.schemaVersion, SCOPE_CLAIMS_SCHEMA);
    assert.equal(refusal.specId, "008");
    assert.equal(refusal.status, "refused");
    assert.equal(typeof refusal.refusalCode, "string");
    assert.equal(error.code, refusal.refusalCode, "thrown and serialized refusal codes must agree");
    assert.equal(refusal.itemId === null || typeof refusal.itemId === "string", true);
    assert.equal(typeof refusal.detail, "string");
    assert.equal(refusal.detail.length > 0, true);
    const serialized = verifier.serializeSpec008ScopeClaimsResult(refusal);
    assert.equal(serialized, `${JSON.stringify(refusal)}\n`, "refusal serialization must be deterministic JSON plus one newline");
    return { refusal, serialized };
  }
}

function firstBoundaryEntry(fixture, id = "03") {
  return scopeClaimEntry(fixture, "boundary", id);
}

function firstConsumerEntry(fixture, id = "03") {
  return scopeClaimEntry(fixture, "consumer", id);
}

function declaredAliasEntry(fixture) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === "consumer" && candidate.aliases?.mode === "declared");
  assert.ok(entry, "fixture must contain a declared alias entry");
  return entry;
}

function noneAliasEntry(fixture) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === "consumer" && candidate.aliases?.mode === "none");
  assert.ok(entry, "fixture must contain an explicit none alias entry");
  return entry;
}

function replaceBoundaryDescriptor(fixture, entry, current, replacement, ownership) {
  const source = entry.expectedInventory.sources.find((candidate) => {
    const artifact = fixtureRecord(fixture, `${FEATURE_ROOT}/${candidate.artifact}`);
    return markdownSection(artifact.text, candidate.section).some((line) => line.includes(encodedDescriptor(current)));
  });
  assert.ok(source, `${entry.itemId} must have a source for ${encodedDescriptor(current)}`);
  const artifactPath = `${FEATURE_ROOT}/${source.artifact}`;
  const artifact = fixtureRecord(fixture, artifactPath);
  artifact.text = artifact.text.replace(encodedDescriptor(current), encodedDescriptor(replacement));
  entry.expectedInventory.descriptors = entry.expectedInventory.descriptors.map((descriptor) =>
    descriptorOrder(descriptor, current) === 0 ? { ...replacement } : descriptor
  );
  entry.expectedInventory.descriptors = normalizedDescriptors(entry.expectedInventory.descriptors);
  entry.expectedInventory.descriptorCount = entry.expectedInventory.descriptors.length;
  entry.expectedInventory.inventorySha256 = inventorySha256(entry.expectedInventory.descriptors);
  entry.attributedPaths = entry.attributedPaths.map((descriptor) =>
    descriptorOrder(descriptor, current) === 0 ? { ...replacement, ownership } : descriptor
  ).sort(descriptorOrder);
}

function updateEvolutionChains(fixture, orderedScopeIds) {
  for (const id of ["03", "04"]) {
    const descriptor = firstBoundaryEntry(fixture, id).attributedPaths.find((candidate) =>
      candidate.path === "shared/evolving-boundary.mjs" && candidate.identity === "evolvingBoundary"
    );
    assert.ok(descriptor, `Scope ${id} must participate in the valid evolution chain`);
    descriptor.ownership.orderedScopeIds = [...orderedScopeIds];
  }
}

function mutateConsumerSource(fixture, id, mutate) {
  const consumer = firstConsumerEntry(fixture, id).consumerSurfaces[0];
  const record = fixtureRecord(fixture, consumer.path);
  record.text = mutate(record.text, consumer);
}

function mutateTestSource(fixture, id, mutate) {
  const carrier = firstConsumerEntry(fixture, id).testCarriers[0];
  const record = fixtureRecord(fixture, carrier.path);
  record.text = mutate(record.text, carrier);
}

function canonicalGitReader(commit, path) {
  const run = spawnSync("git", ["show", `${commit}:${path}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  return run.status === 0 ? { text: run.stdout } : null;
}

function diskRecordReader(fixture, commitReader = canonicalGitReader) {
  const reader = (path) => {
    const override = fixture.overrides.get(path);
    if (override) return { ...override };
    const absolutePath = resolve(fixture.repositoryRoot, path);
    try {
      const linkStat = lstatSync(absolutePath);
      const targetStat = statSync(absolutePath);
      return {
        type: linkStat.isSymbolicLink() ? "symlink" : targetStat.isFile() ? "file" : "other",
        realPath: realpathSync(absolutePath),
        text: targetStat.isFile() ? readFileSync(absolutePath, "utf8") : ""
      };
    } catch {
      return null;
    }
  };
  reader.listPaths = () => fixture.records ? [...fixture.records.keys()].sort() : [];
  reader.readCommit = commitReader;
  return reader;
}

function createCanonicalManifestFixture() {
  const fixture = {
    kind: "canonical",
    manifest: JSON.parse(readFileSync(SCOPE_CLAIMS_MANIFEST, "utf8")),
    repositoryRoot: ROOT,
    records: null,
    overrides: new Map(),
    cleanup() {}
  };
  fixture.sourceReader = diskRecordReader(fixture);
  return fixture;
}

function materializeFixtureRecords(fixture, repositoryRoot) {
  for (const [path, record] of [...fixture.records.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const absolutePath = resolve(repositoryRoot, path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, record.text);
  }
}

function createPhysicalScopeClaimsFixture() {
  const fixture = createScopeClaimsFixture();
  const workspace = mkdtempSync(join(tmpdir(), "rl-scope-claims-v2-"));
  const repositoryRoot = join(workspace, "repository");
  mkdirSync(repositoryRoot, { recursive: true });
  materializeFixtureRecords(fixture, repositoryRoot);
  fixture.kind = "physical";
  fixture.physicalRoot = workspace;
  fixture.repositoryRoot = repositoryRoot;
  fixture.overrides = new Map();
  fixture.sourceReader = diskRecordReader(fixture, syntheticCommitReader);
  fixture.cleanup = () => rmSync(workspace, { recursive: true, force: true });
  return fixture;
}

function physicalFixtureSignature(fixture) {
  const snapshot = [];
  for (const path of [...fixture.records.keys()].sort()) {
    const absolutePath = resolve(fixture.repositoryRoot, path);
    try {
      const linkStat = lstatSync(absolutePath);
      const realPath = realpathSync(absolutePath);
      const targetStat = statSync(absolutePath);
      snapshot.push({
        path,
        type: linkStat.isSymbolicLink() ? "symlink" : targetStat.isFile() ? "file" : "other",
        realPath: relative(fixture.repositoryRoot, realPath),
        sha256: targetStat.isFile() ? createHash("sha256").update(readFileSync(absolutePath)).digest("hex") : null
      });
    } catch {
      snapshot.push({ path, type: "missing", realPath: null, sha256: null });
    }
  }
  return snapshot;
}

function replacePhysicalPathWithSymlink(fixture, path, target) {
  const absolutePath = resolve(fixture.repositoryRoot, path);
  rmSync(absolutePath, { force: true });
  symlinkSync(target, absolutePath);
}

function canonicalBoundary(fixture) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === "boundary");
  assert.ok(entry, "canonical v2 manifest must contain a boundary entry");
  return entry;
}

function canonicalConsumer(fixture) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === "consumer");
  assert.ok(entry, "canonical v2 manifest must contain a consumer entry");
  return entry;
}

function canonicalDeclaredAliasConsumer(fixture) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === "consumer" && candidate.aliases?.mode === "declared");
  assert.ok(entry, "canonical v2 manifest must contain a declared alias origin");
  return entry;
}

function hostileFactory(kind) {
  if (kind === "canonical") return createCanonicalManifestFixture();
  if (kind === "physical") return createPhysicalScopeClaimsFixture();
  return createScopeClaimsFixture();
}

const SCOPE_CLAIMS_V2_HOSTILE_CASES = [
  {
    id: "descriptor deletion remains detectable when cached count and digest are edited to agree",
    refusal: "INVENTORY_DESCRIPTOR_MISMATCH",
    mutate(fixture) {
      const inventory = firstBoundaryEntry(fixture).expectedInventory;
      inventory.descriptors.pop();
      inventory.descriptorCount = inventory.descriptors.length;
      inventory.inventorySha256 = inventorySha256(inventory.descriptors);
    }
  },
  {
    id: "undeclared duplicate path and identity ownership cannot hide behind complete inventories",
    refusal: "OWNERSHIP_OVERLAP_UNDECLARED",
    mutate(fixture) {
      const owner = firstBoundaryEntry(fixture, "03");
      const duplicate = owner.expectedInventory.descriptors.find((descriptor) => descriptor.identity === "scope03Boundary");
      const claimant = firstBoundaryEntry(fixture, "08");
      const replaced = claimant.expectedInventory.descriptors.find((descriptor) => descriptor.identity === "scope08Boundary");
      replaceBoundaryDescriptor(fixture, claimant, replaced, duplicate, { mode: "exclusive", ownerScopeId: "08" });
    }
  },
  {
    id: "ordered evolution cannot be vacuous",
    refusal: "EVOLUTION_CHAIN_INVALID",
    mutate(fixture) { updateEvolutionChains(fixture, ["03"]); }
  },
  {
    id: "ordered evolution must follow dependency order",
    refusal: "EVOLUTION_CHAIN_INVALID",
    mutate(fixture) { updateEvolutionChains(fixture, ["04", "03"]); }
  },
  {
    id: "ordered evolution cannot duplicate an owner",
    refusal: "EVOLUTION_CHAIN_INVALID",
    mutate(fixture) { updateEvolutionChains(fixture, ["03", "03", "04"]); }
  },
  {
    id: "single-quote aliased import resolves the same forbidden dependency edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "import { forbiddenDependency03 as denied03 } from '../forbidden/dependency-03.mjs';\nexport const deniedImport03 = denied03(2);");
    }
  },
  {
    id: "double-quote re-export resolves the same forbidden dependency edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "export { forbiddenDependency03 as deniedReexport03 } from \"../forbidden/dependency-03.mjs\";");
    }
  },
  {
    id: "constant computed dynamic import resolves the same forbidden dependency edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "const deniedRoot03 = '../forbidden/';\nconst deniedLeaf03 = 'dependency-03.mjs';\nexport const deniedDynamic03 = import(deniedRoot03 + deniedLeaf03);");
    }
  },
  {
    id: "CommonJS require alias and helper forwarding resolve the same forbidden dependency edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "const deniedRequire03 = require;\nfunction loadDenied03(path) { return deniedRequire03(path); }\nloadDenied03('../forbidden/dependency-03.mjs');");
    }
  },
  {
    id: "computed filesystem member alias resolves the forbidden write edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "const deniedWriter03 = { writeFileSync: writeScope03File }['write' + 'FileSync'];\ndeniedWriter03('../forbidden/output-03.json', 'x');");
    }
  },
  {
    id: "filesystem helper forwarding resolves the forbidden write edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "function forwardWrite03(writer, path, value) { writer(path, value); }\nforwardWrite03(writeScope03File, '../forbidden/output-03.json', 'x');");
    }
  },
  {
    id: "promise filesystem alias and computed member resolve the forbidden write edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "const promisedFs03 = await import('node:fs/promises');\nconst promisedWrite03 = promisedFs03['write' + 'File'];\nawait promisedWrite03('../forbidden/output-03.json', 'x');");
    }
  },
  {
    id: "computed durable-storage alias and helper resolve the forbidden key edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "const deniedStorage03 = localStorage['set' + 'Item'].bind(localStorage);\nfunction persistDenied03(write) { write('scope03' + 'PrivateState', 'x'); }\npersistDenied03(deniedStorage03);");
    }
  },
  {
    id: "destructured durable-storage alias resolves the forbidden key edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "const { setItem: destructuredStore03 } = localStorage;\ndestructuredStore03.call(localStorage, 'scope03PrivateState', 'x');");
    }
  },
  {
    id: "HTML script dependency resolves the forbidden public-consumer edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "public/forbidden-03.html", "<script type=\"module\" src=\"../owned/scope-03.mjs\"></script>");
    }
  },
  {
    id: "JSON registry entry resolves the forbidden public-consumer edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      fixtureRecord(fixture, "public/forbidden-03.json").text = `${JSON.stringify({ module: "../owned/scope-03.mjs" })}\n`;
    }
  },
  {
    id: "Markdown link resolves the forbidden public-consumer edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      appendFixtureToken(fixture, "public/forbidden-03.md", "[Scope 03](../owned/scope-03.mjs#scope03Boundary)");
    }
  },
  {
    id: "fixed route and hash read resolves the forbidden public-consumer edge",
    refusal: "SEMANTIC_EDGE_FORBIDDEN",
    mutate(fixture) {
      fixtureRecord(fixture, "public/forbidden-03.mjs").text = "export const scope03RouteConsumer = 'portfolio-survival-allocation-lab.html#scope-03-surface';\n";
    }
  },
  {
    id: "unresolved runtime dynamic dependency fails closed",
    refusal: "SEMANTIC_EDGE_UNRESOLVED",
    mutate(fixture) {
      appendFixtureToken(fixture, "owned/scope-03.mjs", "export const unresolvedScope03 = import(resolveAtRuntime03());");
    }
  },
  {
    id: "declared path must exist",
    refusal: "PATH_MISSING",
    mutate(fixture) { fixture.records.delete("owned/scope-03.mjs"); }
  },
  {
    id: "physical symlink cannot leave the repository",
    refusal: "PATH_REPOSITORY_ESCAPE",
    fixture: "physical",
    mutate(fixture) {
      const outside = join(fixture.physicalRoot, "outside-scope-03.mjs");
      writeFileSync(outside, "export const scope03Boundary = true;\n");
      replacePhysicalPathWithSymlink(fixture, "owned/scope-03.mjs", outside);
    }
  },
  {
    id: "in-repository symlink cannot cross the declared path family",
    refusal: "PATH_FAMILY_ESCAPE",
    fixture: "physical",
    mutate(fixture) {
      replacePhysicalPathWithSymlink(
        fixture,
        "owned/scope-03.mjs",
        relative(resolve(fixture.repositoryRoot, "owned"), resolve(fixture.repositoryRoot, "forbidden/dependency-03.mjs"))
      );
    }
  },
  {
    id: "structural identity must resolve exactly once",
    refusal: "IDENTITY_UNRESOLVED",
    mutate(fixture) { removeFixtureToken(fixture, "owned/scope-03.mjs", "scope03Boundary"); }
  },
  {
    id: "duplicate structural identity is ambiguous",
    refusal: "IDENTITY_UNRESOLVED",
    mutate(fixture) { appendFixtureToken(fixture, "owned/scope-03.mjs", "export const scope03Boundary = false;"); }
  },
  {
    id: "invented artifact alias origin is rejected",
    refusal: "ALIAS_ORIGIN_INVALID",
    mutate(fixture) {
      declaredAliasEntry(fixture).aliases.values[0].origin.identity = "INVENTED_ALIAS_ORIGIN";
    }
  },
  {
    id: "canonical identifier cannot be relabelled as a stale alias",
    refusal: "ALIAS_ORIGIN_INVALID",
    mutate(fixture) {
      const entry = declaredAliasEntry(fixture);
      entry.aliases.values[0].identity = entry.canonicalProducers[0].identity;
      entry.aliases.values[0].origin.identity = entry.canonicalProducers[0].identity;
      appendFixtureToken(
        fixture,
        `${FEATURE_ROOT}/${entry.claimSource.artifact}`,
        `\n### Canonical Alias Decoy\n\n- Alias: \`${entry.canonicalProducers[0].identity}\``
      );
      entry.aliases.values[0].origin.section = "Canonical Alias Decoy";
    }
  },
  {
    id: "declared alias scan cannot omit a consumer class",
    refusal: "ALIAS_SCAN_INVALID",
    mutate(fixture) { declaredAliasEntry(fixture).aliases.values[0].scanSurfaces.pop(); }
  },
  {
    id: "grounded stale alias surviving a scan surface is rejected",
    refusal: "ALIAS_SCAN_INVALID",
    mutate(fixture) {
      const alias = declaredAliasEntry(fixture).aliases.values[0];
      appendFixtureToken(fixture, alias.scanSurfaces[1], alias.identity);
    }
  },
  {
    id: "none alias declaration requires a reason",
    refusal: "ALIAS_NONE_INVALID",
    mutate(fixture) { noneAliasEntry(fixture).aliases.reason = ""; }
  },
  {
    id: "none alias declaration requires complete scan surfaces",
    refusal: "ALIAS_NONE_INVALID",
    mutate(fixture) { noneAliasEntry(fixture).aliases.scanSurfaces = []; }
  },
  {
    id: "none alias declaration cannot conflict with a grounded artifact alias",
    refusal: "ALIAS_NONE_INVALID",
    mutate(fixture) {
      const entry = noneAliasEntry(fixture);
      appendFixtureToken(
        fixture,
        `${FEATURE_ROOT}/${entry.claimSource.artifact}`,
        "\n### Legacy Alias Origins\n\n- Alias: `GROUNDED_BUT_UNDECLARED_ALIAS`"
      );
    }
  },
  {
    id: "producer token consumer token and assertion token cannot pass as disconnected substrings",
    refusal: "CAUSAL_BINDING_DISCONNECTED",
    mutate(fixture) {
      const entry = firstConsumerEntry(fixture);
      const binding = entry.causalBindings[0];
      setFixtureText(
        fixture.records,
        binding.consumer.path,
        `// ${binding.producer.identity}\nexport function disconnectedConsumer03() { return 7; }\n// ${binding.consumer.useIdentity}`
      );
      setFixtureText(
        fixture.records,
        binding.test.path,
        `import test from "node:test";\nimport assert from "node:assert/strict";\ntest("${binding.test.title}", () => { const actual = 6; ${binding.test.assertionIdentity} });`
      );
    }
  },
  {
    id: "consumer import that never reaches the declared use is disconnected",
    refusal: "CAUSAL_BINDING_DISCONNECTED",
    mutate(fixture) {
      mutateConsumerSource(fixture, "03", (text, consumer) => text.replace(
        `return ${consumer.useIdentity}(value) * 2;`,
        "return Number(value) * 2;"
      ));
    }
  },
  {
    id: "exact executable test title must be present",
    refusal: "TEST_TITLE_UNREACHABLE",
    mutate(fixture) {
      mutateTestSource(fixture, "03", (text, carrier) => text.replace(carrier.title, "Removed Scope 03 title"));
    }
  },
  {
    id: "duplicate executable test title is ambiguous",
    refusal: "TEST_TITLE_UNREACHABLE",
    mutate(fixture) {
      const carrier = firstConsumerEntry(fixture).testCarriers[0];
      appendFixtureToken(fixture, carrier.path, `test("${carrier.title}", () => assert.fail("duplicate"));`);
    }
  },
  {
    id: "filtered-out exact test title is unreachable",
    refusal: "TEST_TITLE_UNREACHABLE",
    mutate(fixture) {
      mutateTestSource(fixture, "03", (text, carrier) => text.replace(`test("${carrier.title}"`, `test.skip("${carrier.title}"`));
    }
  },
  {
    id: "assertion outside the named test body is invalid",
    refusal: "ASSERTION_BINDING_INVALID",
    mutate(fixture) {
      mutateTestSource(fixture, "03", (text, carrier) => `${text.replace(`  ${carrier.assertionIdentity}\n`, "")}\n${carrier.assertionIdentity}\n`);
    }
  },
  {
    id: "assertion unrelated to the consumer result is invalid",
    refusal: "ASSERTION_BINDING_INVALID",
    mutate(fixture) {
      mutateTestSource(fixture, "03", (text, carrier) => text.replace(
        "  const actual = renderScope03(2);",
        `  renderScope03(2);\n  const actual = ${2 * (3 + 2)};`
      ).replace(carrier.assertionIdentity, carrier.assertionIdentity));
    }
  },
  {
    id: "missing exact assertion is invalid",
    refusal: "ASSERTION_BINDING_INVALID",
    mutate(fixture) {
      mutateTestSource(fixture, "03", (text, carrier) => text.replace(carrier.assertionIdentity, "assert.ok(true);"));
    }
  },
  {
    id: "canonical manifest version mutation is schema-invalid",
    refusal: "MANIFEST_SCHEMA_INVALID",
    fixture: "canonical",
    mutate(fixture) { fixture.manifest.schemaVersion = "spec008-scope-claims/v1"; }
  },
  {
    id: "canonical manifest spec-id mutation is schema-invalid",
    refusal: "MANIFEST_SCHEMA_INVALID",
    fixture: "canonical",
    mutate(fixture) { fixture.manifest.specId = "009"; }
  },
  {
    id: "canonical manifest unknown root key is schema-invalid",
    refusal: "MANIFEST_SCHEMA_INVALID",
    fixture: "canonical",
    mutate(fixture) { fixture.manifest.unexpectedRoot = true; }
  },
  {
    id: "canonical manifest pair membership cannot define completeness",
    refusal: "CANONICAL_PAIR_SET_MISMATCH",
    fixture: "canonical",
    mutate(fixture) { fixture.manifest.entries.pop(); }
  },
  {
    id: "canonical manifest inventory source mutation cannot shrink authority",
    refusal: "INVENTORY_SOURCE_INVALID",
    fixture: "canonical",
    mutate(fixture) { canonicalBoundary(fixture).expectedInventory.sources[0].section += " INVENTED"; }
  },
  {
    id: "canonical manifest descriptor count mutation is rejected",
    refusal: "INVENTORY_DESCRIPTOR_MISMATCH",
    fixture: "canonical",
    mutate(fixture) { canonicalBoundary(fixture).expectedInventory.descriptorCount += 1; }
  },
  {
    id: "canonical manifest inventory digest mutation is rejected",
    refusal: "INVENTORY_DESCRIPTOR_MISMATCH",
    fixture: "canonical",
    mutate(fixture) { canonicalBoundary(fixture).expectedInventory.inventorySha256 = `sha256:${"0".repeat(64)}`; }
  },
  {
    id: "canonical manifest identity mutation is rejected",
    refusal: "INVENTORY_DESCRIPTOR_MISMATCH",
    fixture: "canonical",
    mutate(fixture) { canonicalBoundary(fixture).expectedInventory.descriptors[0].identity += "-invented"; }
  },
  {
    id: "canonical manifest edge-policy mutation is schema-invalid",
    refusal: "MANIFEST_SCHEMA_INVALID",
    fixture: "canonical",
    mutate(fixture) { canonicalBoundary(fixture).edgePolicy.dependency.unexpectedPolicy = true; }
  },
  {
    id: "canonical manifest alias-origin mutation is rejected",
    refusal: "ALIAS_ORIGIN_INVALID",
    fixture: "canonical",
    mutate(fixture) { canonicalDeclaredAliasConsumer(fixture).aliases.values[0].origin.identity += "-invented"; }
  },
  {
    id: "canonical manifest causal-binding mutation is disconnected",
    refusal: "CAUSAL_BINDING_DISCONNECTED",
    fixture: "canonical",
    mutate(fixture) { canonicalConsumer(fixture).causalBindings[0].consumer.useIdentity += "Disconnected"; }
  },
  {
    id: "canonical manifest test-title mutation is unreachable",
    refusal: "TEST_TITLE_UNREACHABLE",
    fixture: "canonical",
    mutate(fixture) { canonicalConsumer(fixture).causalBindings[0].test.title += " unreachable"; }
  },
  {
    id: "canonical manifest assertion-identity mutation is invalid",
    refusal: "ASSERTION_BINDING_INVALID",
    fixture: "canonical",
    mutate(fixture) { canonicalConsumer(fixture).causalBindings[0].test.assertionIdentity += " unrelated"; }
  }
];

function runScopeClaimsHostileCase(verifier, refusalEnum, hostileCase) {
  const control = hostileFactory(hostileCase.fixture);
  try {
    const controlSignature = fixtureSignature(control);
    assertExactScopeClaimsResult(verifyFixture(verifier, control));
    assert.equal(fixtureSignature(control), controlSignature, `${hostileCase.id} clean control must remain immutable`);
  } finally {
    control.cleanup();
  }

  const runOnce = () => {
    const fixture = hostileFactory(hostileCase.fixture);
    try {
      const cleanSignature = fixtureSignature(fixture);
      hostileCase.mutate(fixture);
      const hostileSignature = fixtureSignature(fixture);
      assert.notEqual(hostileSignature, cleanSignature, `${hostileCase.id} must alter one fresh fixture condition`);
      const captured = captureScopeClaimsRefusal(verifier, fixture);
      assert.equal(fixtureSignature(fixture), hostileSignature, `${hostileCase.id} verification must not mutate its fixture`);
      assert.equal(
        captured.refusal.refusalCode,
        refusalEnum[hostileCase.refusal],
        `${hostileCase.id} must select ${hostileCase.refusal}`
      );
      return captured;
    } finally {
      fixture.cleanup();
    }
  };
  const first = runOnce();
  const second = runOnce();
  assert.deepEqual(second, first, `${hostileCase.id} refusal bytes must be deterministic`);
}

function assertScopeClaimsAdversarialContract(verifier) {
  const refusalEnum = verifier.SCOPE_CLAIMS_REFUSAL_V2;
  const coveredMembers = new Set(SCOPE_CLAIMS_V2_HOSTILE_CASES.map((hostileCase) => hostileCase.refusal));
  assert.deepEqual(
    [...coveredMembers].sort(),
    Object.keys(refusalEnum).sort(),
    "TP-28-04 must derive and exercise every exported refusal member without copying refusal values"
  );

  const syntheticControl = createScopeClaimsFixture();
  assertSyntheticV2Authority(syntheticControl);
  assertExactScopeClaimsResult(verifyFixture(verifier, syntheticControl));

  const canonicalControl = createCanonicalManifestFixture();
  assert.equal(canonicalControl.manifest.schemaVersion, SCOPE_CLAIMS_SCHEMA, "canonical manifest must be v2");
  assertExactScopeClaimsResult(verifyFixture(verifier, canonicalControl));

  const physicalControl = createPhysicalScopeClaimsFixture();
  try {
    assertExactScopeClaimsResult(verifyFixture(verifier, physicalControl));
  } finally {
    physicalControl.cleanup();
  }

  for (const hostileCase of SCOPE_CLAIMS_V2_HOSTILE_CASES) {
    runScopeClaimsHostileCase(verifier, refusalEnum, hostileCase);
  }
}

test("TP-28-02: Spec 008 scope-claims verifier emits the closed deterministic 41-item inventory", async () => {
  const verifier = await loadScopeClaimsVerifier();
  assertDeterministicSyntheticScopeClaims(verifier);
  assert.ok(existsSync(SCOPE_CLAIMS_MANIFEST), "canonical scripts/spec008-scope-claims.json must exist");
  const fixture = createCanonicalManifestFixture();
  assert.equal(fixture.manifest.schemaVersion, SCOPE_CLAIMS_SCHEMA, "canonical manifest must use the v2 schema");
  const before = fixtureSignature(fixture);
  const result = verifyFixture(verifier, fixture);
  assert.equal(fixtureSignature(fixture), before, "canonical verification must not mutate its manifest or reader overlays");
  assertExactScopeClaimsResult(result);
  assert.deepEqual(result.summary, { total: 41, boundary: 17, consumer: 24, pass: 41, fail: 0 });
});

/* One narrowed carrier run. `defect` absent => shipped tree; `defect` present => the reduced source
   is substituted in memory by the preload. TAP is forced so the counts parse identically whether or
   not a terminal is attached. */
function runProtectiveTitle({ carrier, title, defect, marker, doubleApplicationControl = false }) {
  const env = { ...process.env };
  /* This file is itself executed by `node --test`, which marks its children with NODE_TEST_CONTEXT.
     Inheriting it makes the run below report over the internal child-reporter channel instead of
     TAP, and an unparsed run would then read as a silent exit 0 — the exact false pass this file
     exists to detect. */
  delete env.NODE_TEST_CONTEXT;
  if (defect) {
    env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ""} --require ${INJECTOR}`.trim();
    env.RL_DEFECT_MODULE = defect.module;
    env.RL_DEFECT_FIND_B64 = Buffer.from(defect.find, "utf8").toString("base64");
    env.RL_DEFECT_REPLACE_B64 = Buffer.from(defect.replace, "utf8").toString("base64");
    env.RL_DEFECT_MARKER = marker;
    if (doubleApplicationControl) env.RL_DEFECT_DOUBLE_APPLICATION_CONTROL = "1";
  }
  const run = spawnSync(
    process.execPath,
    ["--test", "--test-reporter=tap", `--test-name-pattern=^${escapeForNamePattern(title)}$`, carrier],
    { cwd: ROOT, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const count = (label) => {
    const found = new RegExp(`^# ${label} (\\d+)$`, "m").exec(output);
    return found ? Number(found[1]) : null;
  };
  return { exitCode: run.status, tests: count("tests"), pass: count("pass"), fail: count("fail"), output };
}

function runUncoordinatedMutatedCompile({ defect, marker }) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ""} --require ${INJECTOR}`.trim();
  env.RL_DEFECT_MODULE = defect.module;
  env.RL_DEFECT_FIND_B64 = Buffer.from(defect.find, "utf8").toString("base64");
  env.RL_DEFECT_REPLACE_B64 = Buffer.from(defect.replace, "utf8").toString("base64");
  env.RL_DEFECT_MARKER = marker;
  const probe = [
    "const fs = require('node:fs');",
    "const path = require('node:path');",
    "const { Module } = require('node:module');",
    "const target = path.resolve(process.cwd(), process.env.RL_DEFECT_MODULE);",
    "const source = fs.readFileSync(target).toString('utf8');",
    "const find = Buffer.from(process.env.RL_DEFECT_FIND_B64, 'base64').toString('utf8');",
    "const replacement = Buffer.from(process.env.RL_DEFECT_REPLACE_B64, 'base64').toString('utf8');",
    "const uncoordinated = source.replace(find, replacement);",
    "const candidate = new Module(target, module);",
    "candidate.filename = target;",
    "candidate.paths = module.paths;",
    "candidate._compile(uncoordinated, target);"
  ].join("\n");
  const run = spawnSync(process.execPath, ["-e", probe], {
    cwd: ROOT,
    env,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  return { exitCode: run.status, output: `${run.stdout ?? ""}${run.stderr ?? ""}` };
}

const INFRASTRUCTURE_FAILURE = /portfolio-defect-injector:|\bpreload\b|\bsetup\b|\banchor\b|\bsyntax(?:\s*error)?\b|\bmodule[- ]load(?:\s+error)?\b/i;

function readApplications(marker) {
  return readFileSync(marker, "utf8").trim().split("\n").filter(Boolean).map((line) => {
    const parsed = /^applied module=(\S+) via=(Module\._compile|fs\.readFileSync|require|readFileSync) bytes=(\d+)$/.exec(line);
    assert.ok(parsed, `representation marker must name an exact module, intended hook, and byte count: ${line}`);
    return { module: parsed[1], hook: parsed[2], bytes: Number(parsed[3]) };
  });
}

function mutationCausalityProblems({ entry, mutant, applications }) {
  const problems = [];
  const infrastructureFailure = INFRASTRUCTURE_FAILURE.exec(mutant.output);
  if (applications.length !== 1) {
    problems.push(`in-memory substitution applied ${applications.length} time(s), expected exactly 1`);
  }
  if (applications.length === 1 && applications[0].module !== entry.module) {
    problems.push(`marker named module ${applications[0].module}, expected ${entry.module}`);
  }
  if (applications.length === 1 && applications[0].hook !== entry.intendedHook) {
    problems.push(`marker named hook ${applications[0].hook}, expected ${entry.intendedHook}`);
  }
  if (mutant.tests !== 1) {
    problems.push(`mutant title resolved to ${mutant.tests} test(s), expected exactly 1`);
  }
  if (mutant.exitCode === 0 || mutant.pass !== 0 || mutant.fail !== 1) {
    problems.push(`mutant result was exit=${mutant.exitCode} pass=${mutant.pass} fail=${mutant.fail}, expected one failing selected test`);
  }
  if (infrastructureFailure) {
    const detail = mutant.output.split("\n").find((line) => line.includes(infrastructureFailure[0]))?.trim();
    problems.push(`mutant output contains forbidden infrastructure failure: ${detail ?? infrastructureFailure[0]}`);
  }
  if (!mutant.output.includes(`# Subtest: ${entry.title}`) ||
      !mutant.output.includes(`not ok 1 - ${entry.title}`) ||
      !/code: ['"]ERR_ASSERTION['"]/.test(mutant.output)) {
    problems.push("mutant failure did not originate from the selected protective assertion");
  }
  return problems;
}

test("Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing", async (t) => {
  const scopeClaimsVerifier = await loadScopeClaimsVerifier();
  assertScopeClaimsAdversarialContract(scopeClaimsVerifier);

  const workspace = mkdtempSync(join(tmpdir(), "rl-scope28-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));

  const touched = [...new Set(CASES.map((entry) => entry.module))].sort();
  const before = Object.fromEntries(touched.map((path) => [path, sha256(path)]));

  /* ---- the audited set is read from the ledger, never declared here ---- */
  const ledger = readFileSync(join(ROOT, LEDGER), "utf8");
  const audited = new Set();
  for (const line of ledger.split("\n")) {
    const row = /^\|\s*(F008-[A-Z0-9-]+)\s*\|[^|]*\|[^|]*\|\s*Scope\s+(\d+)\s*\|/.exec(line);
    if (!row) continue;
    const scope = Number(row[2]);
    if (scope >= REMEDIATION_SCOPES.first && scope <= REMEDIATION_SCOPES.last) audited.add(row[1]);
  }
  assert.ok(audited.size >= 18, `the ledger must yield the audited remediation findings, read ${audited.size}`);

  const covered = new Set([...CASES.map((entry) => entry.finding), "F008-ACCESSIBILITY-001", "F008-TEST-INTEGRITY-001"]);
  assert.deepEqual(
    [...audited].sort(),
    [...covered].sort(),
    "every audited remediation finding needs exactly one adversarial case, and no case may claim a finding the ledger does not carry"
  );
  assert.equal(CASES.length, new Set(CASES.map((entry) => entry.finding)).size, "one case per finding");

  /* ---- F008-TEST-INTEGRITY-001: the harness itself must be load-bearing ----
     A representation that does not apply would make the mutant run identical to the shipped run,
     and every case below would then "discriminate" against nothing. Prove the harness refuses that
     state: an anchor that does not exist must leave the marker empty, which is the condition each
     case asserts before it is allowed to read a failure as discrimination. */
  const bogusMarker = join(workspace, "bogus.marker");
  writeFileSync(bogusMarker, "");
  const bogus = runProtectiveTitle({
    carrier: CASES[0].carrier,
    title: CASES[0].title,
    defect: { module: CASES[0].module, find: "\n    var anchorThatIsNotInTheShippedSource = true;\n", replace: "\n" },
    marker: bogusMarker
  });
  assert.equal(readFileSync(bogusMarker, "utf8"), "", "an unmatched anchor must never report itself as applied");
  assert.notEqual(bogus.exitCode, 0, "an unrepresentable defect must fail loudly rather than pass quietly");

  /* ---- every audited defect class ---- */
  const failures = [];
  const evidence = [];
  for (const entry of CASES) {
    const marker = join(workspace, `${entry.finding}.marker`);
    writeFileSync(marker, "");

    const shipped = runProtectiveTitle({ carrier: entry.carrier, title: entry.title, defect: null, marker });
    const mutant = runProtectiveTitle({ carrier: entry.carrier, title: entry.title, defect: entry, marker });
    const applications = readApplications(marker);

    const problems = [];
    if (shipped.tests !== 1) problems.push(`title resolved to ${shipped.tests} executed test(s) on the shipped tree, expected exactly 1`);
    if (shipped.exitCode !== 0 || shipped.pass !== 1 || shipped.fail !== 0) {
      problems.push(`the protective test does not pass exactly once on the shipped tree (exit ${shipped.exitCode}, pass ${shipped.pass}, fail ${shipped.fail})`);
    }
    problems.push(...mutationCausalityProblems({ entry, mutant, applications }));

    if (problems.length) failures.push(`${entry.finding} (scope ${entry.scope}, ${entry.carrier}): ${problems.join("; ")}`);
    evidence.push(`${entry.finding} scope=${entry.scope} shipped=${shipped.pass}/${shipped.tests} mutant=${mutant.pass}/${mutant.tests} mutant-fail=${mutant.fail} applications=${applications.length} hook=${applications[0]?.hook ?? "none"}`);
  }

  /* ---- F008-ACCESSIBILITY-001: each route affordance is individually load-bearing ---- */
  const route = readFileSync(join(ROOT, ROUTE), "utf8");
  const probeRoute = (html) => {
    for (const affordance of ACCESSIBILITY_AFFORDANCES) {
      assert.ok(html.includes(affordance.markup), `the route must carry the ${affordance.id} affordance`);
    }
  };
  probeRoute(route);
  for (const affordance of ACCESSIBILITY_AFFORDANCES) {
    assert.equal(route.split(affordance.markup).length - 1, 1, `${affordance.id} must be anchored exactly once`);
    const disposable = route.replace(affordance.markup, "");
    assert.throws(
      () => probeRoute(disposable),
      new RegExp(`the route must carry the ${affordance.id} affordance`),
      `removing ${affordance.id} must break the structural probe`
    );
  }

  const after = Object.fromEntries(touched.map((path) => [path, sha256(path)]));
  assert.deepEqual(after, before, "no shipped module may differ before and after the adversarial run");

  assert.deepEqual(failures, [], `audited defect classes that are NOT load-bearing:\n  ${failures.join("\n  ")}\n\nper-case:\n  ${evidence.join("\n  ")}`);
});

const BUG_007_MUTATIONS = [
  {
    id: "BUG-007-NULL-PROTOTYPE-MAP",
    defect: "the completion-category index regains Object.prototype inheritance",
    module: "rlportfoliobrief.js",
    find: "    var categoriesBySubject = Object.create(null);",
    replace: "    var categoriesBySubject = {};",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "BUG-007: prototype-sensitive completion subjects are safe own keys",
    intendedHook: "Module._compile"
  },
  {
    id: "BUG-007-OWN-OWNER-LOOKUP",
    defect: "an inherited owner entry is accepted as though the caller supplied it",
    module: "rlportfoliobrief.js",
    find: "Object.prototype.hasOwnProperty.call(owners, subjectId)",
    replace: "true",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "BUG-007: own lookup semantics and RED cleanup preserve shared built-ins",
    intendedHook: "Module._compile"
  },
  {
    id: "BUG-007-NORMAL-LANE-ORDER",
    defect: "watchlist is ranked ahead of held instead of preserving direct-authority order",
    module: "rlportfoliobrief.js",
    find: "  var LANE_ORDER = [\"held\", \"watchlist\", \"completedResearch\", \"inferredRelevance\"];",
    replace: "  var LANE_ORDER = [\"watchlist\", \"held\", \"completedResearch\", \"inferredRelevance\"];",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "BUG-007: normal brief order and refusal precedence remain unchanged",
    intendedHook: "Module._compile"
  }
];

const DIRECT_TEXT_CONTROL = {
  ...CASES.find((entry) => entry.finding === "F008-BAR-COVERAGE-001"),
  intendedHook: "fs.readFileSync"
};

function runBug007MutationCausality(t) {
  const workspace = mkdtempSync(join(tmpdir(), "rl-bug007-integrity-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));

  assert.ok(DIRECT_TEXT_CONTROL, "the direct-text control must reuse the registered rldata.js mutation");
  const trackedPaths = [...new Set([
    ...BUG_007_MUTATIONS.flatMap((entry) => [entry.module, entry.carrier]),
    DIRECT_TEXT_CONTROL.module,
    DIRECT_TEXT_CONTROL.carrier,
    "tests/provider-credentials.support.mjs",
    "tests/portfolio-defect-injector.cjs",
    "tests/portfolio-test-integrity.unit.mjs"
  ])].sort();
  const before = Object.fromEntries(trackedPaths.map((path) => [path, sha256(path)]));
  const failures = [];

  for (const entry of BUG_007_MUTATIONS) {
    const marker = join(workspace, `${entry.id}.marker`);
    writeFileSync(marker, "");
    const shipped = runProtectiveTitle({ carrier: entry.carrier, title: entry.title, defect: null, marker });
    const mutant = runProtectiveTitle({ carrier: entry.carrier, title: entry.title, defect: entry, marker });
    const applications = readApplications(marker);

    const problems = [];
    if (shipped.tests !== 1) problems.push(`protective title resolved to ${shipped.tests} test(s), expected exactly 1`);
    if (shipped.exitCode !== 0 || shipped.pass !== 1 || shipped.fail !== 0) problems.push(`shipped protection is not green (exit ${shipped.exitCode}, pass ${shipped.pass}, fail ${shipped.fail})`);
    problems.push(...mutationCausalityProblems({ entry, mutant, applications }));
    if (problems.length) failures.push(`${entry.id}: ${entry.defect}: ${problems.join("; ")}`);
  }

  const doubleEntry = BUG_007_MUTATIONS[0];
  const doubleMarker = join(workspace, "double-application.marker");
  writeFileSync(doubleMarker, "");
  const doubleMutant = runProtectiveTitle({
    carrier: doubleEntry.carrier,
    title: doubleEntry.title,
    defect: doubleEntry,
    marker: doubleMarker,
    doubleApplicationControl: true
  });
  const doubleApplications = readApplications(doubleMarker);
  const doubleHooks = doubleApplications.map((application) => application.hook);
  const doubleProblems = mutationCausalityProblems({ entry: doubleEntry, mutant: doubleMutant, applications: doubleApplications });
  if (doubleHooks.length !== 2 || doubleHooks[0] !== "fs.readFileSync" || doubleHooks[1] !== "Module._compile") {
    failures.push(`DOUBLE-APPLICATION-CONTROL: observed hooks ${JSON.stringify(doubleHooks)}, expected ["fs.readFileSync","Module._compile"]`);
  }
  if (!doubleProblems.some((problem) => problem.includes("applied 2 time(s)"))) {
    failures.push(`DOUBLE-APPLICATION-CONTROL: carrier did not classify two applications as infrastructure failure: ${doubleProblems.join("; ")}`);
  }
  if (INFRASTRUCTURE_FAILURE.test(doubleMutant.output)) {
    failures.push("DOUBLE-APPLICATION-CONTROL: injector/preload failure prevented the selected protective assertion");
  }

  const directMarker = join(workspace, "direct-text.marker");
  writeFileSync(directMarker, "");
  const directMutant = runProtectiveTitle({
    carrier: DIRECT_TEXT_CONTROL.carrier,
    title: DIRECT_TEXT_CONTROL.title,
    defect: DIRECT_TEXT_CONTROL,
    marker: directMarker
  });
  const directApplications = readApplications(directMarker);
  const directProblems = mutationCausalityProblems({ entry: DIRECT_TEXT_CONTROL, mutant: directMutant, applications: directApplications });
  if (directProblems.length) {
    failures.push(`DIRECT-TEXT-CONTROL: ${directProblems.join("; ")}`);
  }

  const uncoordinatedMarker = join(workspace, "uncoordinated-mutated-content.marker");
  writeFileSync(uncoordinatedMarker, "");
  const uncoordinated = runUncoordinatedMutatedCompile({ defect: BUG_007_MUTATIONS[0], marker: uncoordinatedMarker });
  assert.notEqual(uncoordinated.exitCode, 0, "uncoordinated already-mutated content must fail loud");
  assert.equal(readFileSync(uncoordinatedMarker, "utf8"), "", "uncoordinated mutated content must not record an application");
  assert.match(
    uncoordinated.output,
    /portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief\.js \(found 0\)/,
    "uncoordinated already-mutated content must retain the exact zero-anchor refusal"
  );

  const after = Object.fromEntries(trackedPaths.map((path) => [path, sha256(path)]));
  assert.deepEqual(after, before, "in-memory BUG-007 mutations must not write product source or persistent tests");
  assert.deepEqual(failures, [], `BUG-007 protections that are not load-bearing:\n  ${failures.join("\n  ")}`);
}

test("BUG-007: caller-key protections and normal ordering are load-bearing in memory", runBug007MutationCausality);
test("BUG-007: represented mutants execute one protective assertion through one intended hook", runBug007MutationCausality);
