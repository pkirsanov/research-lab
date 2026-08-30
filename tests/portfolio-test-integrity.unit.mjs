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
import { existsSync, lstatSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INJECTOR = join(ROOT, "tests", "portfolio-defect-injector.cjs");
const LEDGER = "specs/008-portfolio-survival-and-brief-lab/scopes/_index.md";
const ROUTE = "portfolio-survival-allocation-lab.html";
const SCOPE_CLAIMS_MODULE_URL = new URL("../scripts/verify-spec008-scope-claims.mjs", import.meta.url);
const SCOPE_CLAIMS_MANIFEST = join(ROOT, "scripts", "spec008-scope-claims.json");
const SYNTHETIC_REPOSITORY_ROOT = "/virtual/research-lab";
const BOUNDARY_SCOPE_IDS = [3, 4, 8, 9, ...Array.from({ length: 13 }, (_, index) => index + 16)].map(scopeId);
const CONSUMER_SCOPE_IDS = [
  ...Array.from({ length: 11 }, (_, index) => index + 3),
  ...Array.from({ length: 13 }, (_, index) => index + 15)
].map(scopeId);

const SCOPE_CLAIMS_REFUSALS = Object.freeze({
  UNKNOWN_ROOT_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-ROOT-KEY",
  UNKNOWN_ENTRY_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-ENTRY-KEY",
  UNKNOWN_ATTRIBUTION_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-ATTRIBUTION-KEY",
  UNKNOWN_EXCLUDED_EDGE_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-EXCLUDED-EDGE-KEY",
  UNKNOWN_CONSUMER_KEY: "E008-SCOPE-CLAIMS-UNKNOWN-CONSUMER-KEY",
  DUPLICATE_ITEM_ID: "E008-SCOPE-CLAIMS-DUPLICATE-ITEM-ID",
  DUPLICATE_SCOPE_KIND: "E008-SCOPE-CLAIMS-DUPLICATE-SCOPE-KIND",
  INVENTORY_COUNT: "E008-SCOPE-CLAIMS-INVENTORY-COUNT",
  REQUIRED_PAIR_MISSING: "E008-SCOPE-CLAIMS-REQUIRED-PAIR-MISSING",
  ABSOLUTE_PATH: "E008-SCOPE-CLAIMS-ABSOLUTE-PATH",
  PARENT_TRAVERSAL: "E008-SCOPE-CLAIMS-PARENT-TRAVERSAL",
  PATH_ESCAPE: "E008-SCOPE-CLAIMS-PATH-ESCAPE",
  PATH_MISSING: "E008-SCOPE-CLAIMS-PATH-MISSING",
  PATH_FAMILY: "E008-SCOPE-CLAIMS-PATH-FAMILY",
  ATTRIBUTION_IDENTITY_REQUIRED: "E008-SCOPE-CLAIMS-ATTRIBUTION-IDENTITY-REQUIRED",
  ATTRIBUTION_ZERO_MATCH: "E008-SCOPE-CLAIMS-ATTRIBUTION-ZERO-MATCH",
  EXCLUDED_DEPENDENCY: "E008-SCOPE-CLAIMS-EXCLUDED-DEPENDENCY",
  EXCLUDED_FILESYSTEM_WRITE: "E008-SCOPE-CLAIMS-EXCLUDED-FILESYSTEM-WRITE",
  EXCLUDED_STORAGE_WRITE: "E008-SCOPE-CLAIMS-EXCLUDED-STORAGE-WRITE",
  EXCLUDED_PUBLIC_CONSUMER: "E008-SCOPE-CLAIMS-EXCLUDED-PUBLIC-CONSUMER",
  CANONICAL_IDENTIFIER_ZERO_MATCH: "E008-SCOPE-CLAIMS-CANONICAL-IDENTIFIER-ZERO-MATCH",
  SOURCE_TOKEN_ZERO_MATCH: "E008-SCOPE-CLAIMS-SOURCE-TOKEN-ZERO-MATCH",
  CONSUMER_CLASS_ZERO_MATCH: "E008-SCOPE-CLAIMS-CONSUMER-CLASS-ZERO-MATCH",
  TEST_CARRIER_ZERO_MATCH: "E008-SCOPE-CLAIMS-TEST-CARRIER-ZERO-MATCH",
  FORBIDDEN_ALIAS: "E008-SCOPE-CLAIMS-FORBIDDEN-ALIAS"
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

function addFixtureText(records, path, text) {
  const prior = records.get(path)?.text;
  records.set(path, {
    type: "file",
    realPath: join(SYNTHETIC_REPOSITORY_ROOT, path),
    text: prior ? `${prior}\n${text}` : text
  });
}

function boundaryAttribution(id) {
  if (id === "03") return { kind: "marker", identities: [`SCOPE_${id}_MARKER`] };
  if (id === "04") return { kind: "hunk", identities: [`SCOPE_${id}_HUNK`] };
  return { kind: "whole-file" };
}

function createScopeClaimsFixture() {
  const records = new Map();
  const boundaryEntries = BOUNDARY_SCOPE_IDS.map((id) => {
    const path = `owned/scope-${id}.mjs`;
    const attribution = boundaryAttribution(id);
    const identityText = attribution.identities?.join("\n") ?? `WHOLE_FILE_SCOPE_${id}`;
    addFixtureText(records, path, `export const scope${id}Boundary = true;\n${identityText}`);
    return {
      itemId: `SCOPE-${id}-BOUNDARY-CLAIM`,
      scopeId: id,
      kind: "boundary",
      dodClaim: `Scope ${id} boundary is attributed without excluded coupling`,
      attributedPaths: [{ path, attribution }],
      allowedFamilies: ["owned/"],
      excludedEdges: [
        { kind: "dependency", token: `FORBIDDEN_DEPENDENCY_${id}` },
        { kind: "filesystem-write", token: `FORBIDDEN_FILESYSTEM_WRITE_${id}` },
        { kind: "storage-write", token: `FORBIDDEN_STORAGE_WRITE_${id}` },
        { kind: "public-consumer", token: `FORBIDDEN_PUBLIC_CONSUMER_${id}` }
      ]
    };
  });

  const consumerEntries = CONSUMER_SCOPE_IDS.map((id) => {
    const sourcePath = `owned/scope-${id}.mjs`;
    const consumerPath = `consumers/scope-${id}.mjs`;
    const testPath = `tests/scope-${id}.unit.mjs`;
    const canonicalToken = `CANONICAL_SCOPE_${id}`;
    const sourceToken = `SOURCE_SCOPE_${id}`;
    const consumerClass = `scope-${id}-public-ui`;
    const consumerToken = `CONSUMER_SCOPE_${id}`;
    const testToken = `TEST_SCOPE_${id}`;
    addFixtureText(records, sourcePath, `export const ${canonicalToken} = "${sourceToken}";`);
    addFixtureText(records, consumerPath, `export const consumerClass = "${consumerClass}";\nexport const consume = "${consumerToken}";`);
    addFixtureText(records, testPath, `test("${testToken}", () => assert.ok(true));`);
    return {
      itemId: `SCOPE-${id}-CONSUMER-CLAIM`,
      scopeId: id,
      kind: "consumer",
      dodClaim: `Scope ${id} canonical source reaches its consumer and test carrier`,
      canonicalIdentifiers: [{ path: sourcePath, token: canonicalToken }],
      sourceSurfaces: [{ path: sourcePath, token: sourceToken }],
      consumerSurfaces: [{ path: consumerPath, consumerClass, token: consumerToken }],
      testCarriers: [{ path: testPath, token: testToken }],
      forbiddenAliases: [{ path: consumerPath, token: `STALE_SCOPE_${id}` }]
    };
  });

  const scope03Boundary = records.get("owned/scope-03.mjs");
  records.set("unowned/scope-03.mjs", {
    ...scope03Boundary,
    realPath: join(SYNTHETIC_REPOSITORY_ROOT, "unowned/scope-03.mjs")
  });

  const fixture = {
    manifest: {
      schemaVersion: "spec008-scope-claims/v1",
      specId: "008",
      entries: [...boundaryEntries, ...consumerEntries].reverse()
    },
    records
  };
  fixture.sourceReader = (path) => {
    const record = fixture.records.get(path);
    return record ? { ...record } : null;
  };
  return fixture;
}

function fixtureSignature(fixture) {
  return JSON.stringify({
    manifest: fixture.manifest,
    records: [...fixture.records.entries()].sort(([left], [right]) => left.localeCompare(right))
  });
}

function scopeClaimEntry(fixture, kind, id) {
  const entry = fixture.manifest.entries.find((candidate) => candidate.kind === kind && candidate.scopeId === id);
  assert.ok(entry, `synthetic fixture must contain ${kind} scope ${id}`);
  return entry;
}

function fixtureRecord(fixture, path) {
  const record = fixture.records.get(path);
  assert.ok(record, `synthetic fixture must contain ${path}`);
  return record;
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
  return {
    verifySpec008ScopeClaims: verifierModule.verifySpec008ScopeClaims,
    serializeSpec008ScopeClaimsResult: verifierModule.serializeSpec008ScopeClaimsResult
  };
}

function verifyFixture(verifier, fixture, repositoryRoot = SYNTHETIC_REPOSITORY_ROOT) {
  return verifier.verifySpec008ScopeClaims({
    manifest: structuredClone(fixture.manifest),
    repositoryRoot,
    sourceReader: fixture.sourceReader
  });
}

function resultOrder(entries) {
  return [...entries].sort((left, right) =>
    Number(left.scopeId) - Number(right.scopeId) || left.kind.localeCompare(right.kind)
  ).map(({ itemId, scopeId, kind }) => ({ itemId, scopeId, kind }));
}

function assertExactScopeClaimsResult(result, entries) {
  assert.deepEqual(
    Object.keys(result),
    ["schemaVersion", "specId", "manifestSha256", "results", "summary"],
    "result root must use the closed key order"
  );
  assert.equal(result.schemaVersion, "spec008-scope-claims/v1");
  assert.equal(result.specId, "008");
  assert.match(result.manifestSha256, /^sha256:[0-9a-f]{64}$/);
  assert.equal(result.results.length, entries.length);
  assert.deepEqual(
    result.results.map(({ itemId, scopeId, kind }) => ({ itemId, scopeId, kind })),
    resultOrder(entries),
    "results must be ordered by numeric scope then kind regardless of manifest order"
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

function assertDeterministicSyntheticScopeClaims(verifier) {
  const fixture = createScopeClaimsFixture();
  const before = fixtureSignature(fixture);
  const first = verifyFixture(verifier, fixture);
  const second = verifyFixture(verifier, fixture);
  assertExactScopeClaimsResult(first, fixture.manifest.entries);
  assert.deepEqual(second, first, "identical in-memory inputs must produce byte-equivalent result objects");
  assert.equal(fixtureSignature(fixture), before, "verification must not mutate the manifest or source-reader records");
  const firstJson = verifier.serializeSpec008ScopeClaimsResult(first);
  const secondJson = verifier.serializeSpec008ScopeClaimsResult(second);
  assert.equal(firstJson, `${JSON.stringify(first)}\n`, "JSON output must be one exact deterministic record plus newline");
  assert.equal(secondJson, firstJson, "repeated serialization must be byte stable");
}

function captureScopeClaimsRefusal(verifier, fixture) {
  let returned;
  try {
    returned = verifyFixture(verifier, fixture);
  } catch (error) {
    assert.ok(error instanceof Error, "a refusal must throw an Error");
    assert.equal(typeof error.code, "string", "a refusal must expose a stable code");
    assert.ok(error.message.length > 0, "a refusal must expose a stable non-empty message");
    return { code: error.code, message: error.message };
  }
  assert.fail(`expected a scope-claims refusal, received ${JSON.stringify(returned)}`);
}

function edgeFor(entry, kind) {
  const edge = entry.excludedEdges.find((candidate) => candidate.kind === kind);
  assert.ok(edge, `synthetic boundary must contain ${kind}`);
  return edge;
}

const SCOPE_CLAIMS_ADVERSARIAL_CASES = [
  {
    id: "unknown root key",
    code: SCOPE_CLAIMS_REFUSALS.UNKNOWN_ROOT_KEY,
    mutate(fixture) { fixture.manifest.unexpectedRoot = true; }
  },
  {
    id: "unknown entry key",
    code: SCOPE_CLAIMS_REFUSALS.UNKNOWN_ENTRY_KEY,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").unexpectedEntry = true; }
  },
  {
    id: "unknown attribution key",
    code: SCOPE_CLAIMS_REFUSALS.UNKNOWN_ATTRIBUTION_KEY,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").attributedPaths[0].attribution.unexpectedAttribution = true; }
  },
  {
    id: "unknown excluded-edge key",
    code: SCOPE_CLAIMS_REFUSALS.UNKNOWN_EXCLUDED_EDGE_KEY,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").excludedEdges[0].unexpectedEdge = true; }
  },
  {
    id: "unknown consumer nested key",
    code: SCOPE_CLAIMS_REFUSALS.UNKNOWN_CONSUMER_KEY,
    mutate(fixture) { scopeClaimEntry(fixture, "consumer", "03").consumerSurfaces[0].unexpectedConsumer = true; }
  },
  {
    id: "duplicate item id",
    code: SCOPE_CLAIMS_REFUSALS.DUPLICATE_ITEM_ID,
    mutate(fixture) { fixture.manifest.entries[1].itemId = fixture.manifest.entries[0].itemId; }
  },
  {
    id: "duplicate scope-kind pair",
    code: SCOPE_CLAIMS_REFUSALS.DUPLICATE_SCOPE_KIND,
    mutate(fixture) { scopeClaimEntry(fixture, "consumer", "26").scopeId = "27"; }
  },
  {
    id: "wrong inventory count",
    code: SCOPE_CLAIMS_REFUSALS.INVENTORY_COUNT,
    mutate(fixture) { fixture.manifest.entries.pop(); }
  },
  {
    id: "missing required scope-kind pair",
    code: SCOPE_CLAIMS_REFUSALS.REQUIRED_PAIR_MISSING,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").scopeId = "05"; }
  },
  {
    id: "absolute attributed path",
    code: SCOPE_CLAIMS_REFUSALS.ABSOLUTE_PATH,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").attributedPaths[0].path = "/virtual/research-lab/owned/scope-03.mjs"; }
  },
  {
    id: "parent-traversal attributed path",
    code: SCOPE_CLAIMS_REFUSALS.PARENT_TRAVERSAL,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").attributedPaths[0].path = "../owned/scope-03.mjs"; }
  },
  {
    id: "outside-root symlink escape",
    code: SCOPE_CLAIMS_REFUSALS.PATH_ESCAPE,
    mutate(fixture) {
      const record = fixtureRecord(fixture, "owned/scope-03.mjs");
      record.type = "symlink";
      record.realPath = "/virtual/outside-repository/scope-03.mjs";
    }
  },
  {
    id: "missing attributed path",
    code: SCOPE_CLAIMS_REFUSALS.PATH_MISSING,
    mutate(fixture) { fixture.records.delete("owned/scope-03.mjs"); }
  },
  {
    id: "disallowed attributed path family",
    code: SCOPE_CLAIMS_REFUSALS.PATH_FAMILY,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").attributedPaths[0].path = "unowned/scope-03.mjs"; }
  },
  {
    id: "marker identity missing",
    code: SCOPE_CLAIMS_REFUSALS.ATTRIBUTION_IDENTITY_REQUIRED,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "03").attributedPaths[0].attribution.identities = []; }
  },
  {
    id: "marker identity zero match",
    code: SCOPE_CLAIMS_REFUSALS.ATTRIBUTION_ZERO_MATCH,
    mutate(fixture) { removeFixtureToken(fixture, "owned/scope-03.mjs", "SCOPE_03_MARKER"); }
  },
  {
    id: "hunk identity missing",
    code: SCOPE_CLAIMS_REFUSALS.ATTRIBUTION_IDENTITY_REQUIRED,
    mutate(fixture) { scopeClaimEntry(fixture, "boundary", "04").attributedPaths[0].attribution.identities = []; }
  },
  {
    id: "hunk identity zero match",
    code: SCOPE_CLAIMS_REFUSALS.ATTRIBUTION_ZERO_MATCH,
    mutate(fixture) { removeFixtureToken(fixture, "owned/scope-04.mjs", "SCOPE_04_HUNK"); }
  },
  {
    id: "unauthorized excluded dependency",
    code: SCOPE_CLAIMS_REFUSALS.EXCLUDED_DEPENDENCY,
    mutate(fixture) {
      const entry = scopeClaimEntry(fixture, "boundary", "03");
      appendFixtureToken(fixture, entry.attributedPaths[0].path, edgeFor(entry, "dependency").token);
    }
  },
  {
    id: "unauthorized filesystem public write",
    code: SCOPE_CLAIMS_REFUSALS.EXCLUDED_FILESYSTEM_WRITE,
    mutate(fixture) {
      const entry = scopeClaimEntry(fixture, "boundary", "03");
      appendFixtureToken(fixture, entry.attributedPaths[0].path, edgeFor(entry, "filesystem-write").token);
    }
  },
  {
    id: "unauthorized personal storage write",
    code: SCOPE_CLAIMS_REFUSALS.EXCLUDED_STORAGE_WRITE,
    mutate(fixture) {
      const entry = scopeClaimEntry(fixture, "boundary", "03");
      appendFixtureToken(fixture, entry.attributedPaths[0].path, edgeFor(entry, "storage-write").token);
    }
  },
  {
    id: "unauthorized public-consumer edge",
    code: SCOPE_CLAIMS_REFUSALS.EXCLUDED_PUBLIC_CONSUMER,
    mutate(fixture) {
      const entry = scopeClaimEntry(fixture, "boundary", "03");
      appendFixtureToken(fixture, entry.attributedPaths[0].path, edgeFor(entry, "public-consumer").token);
    }
  },
  {
    id: "zero-match canonical identifier",
    code: SCOPE_CLAIMS_REFUSALS.CANONICAL_IDENTIFIER_ZERO_MATCH,
    mutate(fixture) {
      const descriptor = scopeClaimEntry(fixture, "consumer", "03").canonicalIdentifiers[0];
      removeFixtureToken(fixture, descriptor.path, descriptor.token);
    }
  },
  {
    id: "zero-match canonical source token",
    code: SCOPE_CLAIMS_REFUSALS.SOURCE_TOKEN_ZERO_MATCH,
    mutate(fixture) {
      const descriptor = scopeClaimEntry(fixture, "consumer", "03").sourceSurfaces[0];
      removeFixtureToken(fixture, descriptor.path, descriptor.token);
    }
  },
  {
    id: "zero-match consumer class",
    code: SCOPE_CLAIMS_REFUSALS.CONSUMER_CLASS_ZERO_MATCH,
    mutate(fixture) {
      const descriptor = scopeClaimEntry(fixture, "consumer", "03").consumerSurfaces[0];
      removeFixtureToken(fixture, descriptor.path, descriptor.consumerClass);
    }
  },
  {
    id: "zero-match test carrier",
    code: SCOPE_CLAIMS_REFUSALS.TEST_CARRIER_ZERO_MATCH,
    mutate(fixture) {
      const descriptor = scopeClaimEntry(fixture, "consumer", "03").testCarriers[0];
      removeFixtureToken(fixture, descriptor.path, descriptor.token);
    }
  },
  {
    id: "forbidden stale alias",
    code: SCOPE_CLAIMS_REFUSALS.FORBIDDEN_ALIAS,
    mutate(fixture) {
      const descriptor = scopeClaimEntry(fixture, "consumer", "03").forbiddenAliases[0];
      appendFixtureToken(fixture, descriptor.path, descriptor.token);
    }
  }
];

function assertScopeClaimsAdversarialContract(verifier) {
  const validFixture = createScopeClaimsFixture();
  assertExactScopeClaimsResult(verifyFixture(verifier, validFixture), validFixture.manifest.entries);
  const validSignature = fixtureSignature(validFixture);

  for (const adversarialCase of SCOPE_CLAIMS_ADVERSARIAL_CASES) {
    const firstFixture = createScopeClaimsFixture();
    adversarialCase.mutate(firstFixture);
    assert.notEqual(fixtureSignature(firstFixture), validSignature, `${adversarialCase.id} must mutate one fresh valid baseline`);
    const firstRefusal = captureScopeClaimsRefusal(verifier, firstFixture);
    assert.equal(firstRefusal.code, adversarialCase.code, `${adversarialCase.id} must use its stable refusal code`);

    const repeatedFixture = createScopeClaimsFixture();
    adversarialCase.mutate(repeatedFixture);
    const repeatedRefusal = captureScopeClaimsRefusal(verifier, repeatedFixture);
    assert.deepEqual(repeatedRefusal, firstRefusal, `${adversarialCase.id} refusal must be deterministic`);
  }

  const orderedFixture = createScopeClaimsFixture();
  const orderedAlias = scopeClaimEntry(orderedFixture, "consumer", "03").forbiddenAliases[0];
  appendFixtureToken(orderedFixture, orderedAlias.path, orderedAlias.token);
  const orderedRefusal = captureScopeClaimsRefusal(verifier, orderedFixture);
  const reversedFixture = createScopeClaimsFixture();
  reversedFixture.manifest.entries.reverse();
  const reversedAlias = scopeClaimEntry(reversedFixture, "consumer", "03").forbiddenAliases[0];
  appendFixtureToken(reversedFixture, reversedAlias.path, reversedAlias.token);
  assert.deepEqual(
    captureScopeClaimsRefusal(verifier, reversedFixture),
    orderedRefusal,
    "refusal code and message must remain stable when valid entry order changes"
  );
}

function manifestDeclaredPaths(manifest) {
  const paths = new Set();
  for (const entry of manifest.entries ?? []) {
    if (entry.kind === "boundary") {
      for (const attributedPath of entry.attributedPaths ?? []) paths.add(attributedPath.path);
      continue;
    }
    for (const field of ["canonicalIdentifiers", "sourceSurfaces", "consumerSurfaces", "testCarriers", "forbiddenAliases"]) {
      for (const descriptor of entry[field] ?? []) paths.add(descriptor.path);
    }
  }
  return [...paths];
}

function canonicalManifestFixture(manifest) {
  const records = new Map();
  for (const relativePath of manifestDeclaredPaths(manifest)) {
    if (typeof relativePath !== "string" || relativePath.startsWith("/") || relativePath.split("/").includes("..")) continue;
    const absolutePath = resolve(ROOT, relativePath);
    if (!existsSync(absolutePath)) continue;
    const linkStat = lstatSync(absolutePath);
    const realStat = statSync(absolutePath);
    records.set(relativePath, {
      type: linkStat.isSymbolicLink() ? "symlink" : realStat.isDirectory() ? "directory" : "file",
      realPath: realpathSync(absolutePath),
      text: realStat.isFile() ? readFileSync(absolutePath, "utf8") : ""
    });
  }
  return {
    manifest,
    records,
    sourceReader(path) {
      const record = records.get(path);
      return record ? { ...record } : null;
    }
  };
}

test("TP-28-02: Spec 008 scope-claims verifier emits the closed deterministic 41-item inventory", async () => {
  const verifier = await loadScopeClaimsVerifier();
  assertDeterministicSyntheticScopeClaims(verifier);
  assert.ok(existsSync(SCOPE_CLAIMS_MANIFEST), "canonical scripts/spec008-scope-claims.json must exist");
  const manifest = JSON.parse(readFileSync(SCOPE_CLAIMS_MANIFEST, "utf8"));
  const fixture = canonicalManifestFixture(manifest);
  const result = verifyFixture(verifier, fixture, ROOT);
  assertExactScopeClaimsResult(result, manifest.entries);
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
