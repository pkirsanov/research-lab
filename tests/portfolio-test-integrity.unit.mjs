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
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INJECTOR = join(ROOT, "tests", "portfolio-defect-injector.cjs");
const LEDGER = "specs/008-portfolio-survival-and-brief-lab/scopes/_index.md";
const ROUTE = "portfolio-survival-allocation-lab.html";

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
    title: "SCN-008-042 and SCN-008-043 multi-row revision and full clear round trip through fresh adapters and controller inspection"
  },
  {
    finding: "F008-CLEAR-RUNTIME-001",
    scope: 17,
    defect: "the personal-category registry stops discovering undeclared personal keys at runtime",
    module: "rlportfolio.js",
    find: "          if (reservedPersonalKey(stored.key) && !declared[locationKey]) {",
    replace: "          if (false) {",
    carrier: "tests/portfolio-privacy.functional.mjs",
    title: "Adversarial: full personal clear detects undeclared keys live state and arbitrary residue"
  },
  {
    finding: "F008-CLEAR-TEST-001",
    scope: 17,
    defect: "public keys are no longer recorded as exclusions, so the clear cannot show what it left alone",
    module: "rlportfolio.js",
    find: "          } else if (!reservedPersonalKey(stored.key)) {",
    replace: "          } else if (false) {",
    carrier: "tests/portfolio-privacy.functional.mjs",
    title: "Adversarial: full personal clear detects undeclared keys live state and arbitrary residue"
  },
  {
    finding: "F008-BEHAVIOR-CONTRACT-001",
    scope: 18,
    defect: "behavior identity collapses to the subject alone, so semantically distinct events collide",
    module: "rlportfolio.js",
    find: "    var fingerprintPayload = clone(payload);",
    replace: "    var fingerprintPayload = { subjectId: payload.subjectId };",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical"
  },
  {
    finding: "F008-BAR-COVERAGE-001",
    scope: 19,
    defect: "coverage falls back to the legacy cache measurement and ignores the declared source policy",
    module: "rldata.js",
    find: "    return acquireBarCoverage(sym, interval, target, sourcePolicy);",
    replace: "    return measureBarCoverageLegacy(sym, interval, target);",
    carrier: "tests/portfolio-bar-coverage.functional.mjs",
    title: "SCN-008-045 same-origin append measures actual bounds and preserves partial truth without lookup"
  },
  {
    finding: "F008-BRIEF-EVIDENCE-001",
    scope: 20,
    defect: "history evidence is taken raw instead of by fingerprint, so one observation is counted twice",
    module: "rlportfoliobrief.js",
    find: "    var selectedHistoryRefs = Object.keys(historyByEvidence).sort().map(function (key) { return historyByEvidence[key]; });",
    replace: "    var selectedHistoryRefs = input.historyRefs.slice();",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time"
  },
  {
    finding: "F008-BRIEF-POLICY-001",
    scope: 20,
    defect: "the window cutoff uses a fixed -05:00 offset instead of resolved New York civil time",
    module: "rlportfoliobrief.js",
    find: "    return actual === expected ? new Date(guess).toISOString() : null;",
    replace: "    return new Date(target + 5 * 3600000).toISOString();",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time"
  },
  {
    finding: "F008-BROWSER-API-001",
    scope: 20,
    defect: "the designed public API is incomplete — whyShown is not exported",
    module: "rlportfoliobrief.js",
    find: "    whyShown: whyShown,",
    replace: "    /* reduced: whyShown is not part of the exported API */",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time"
  },
  {
    finding: "F008-RISK-INPUT-001",
    scope: 21,
    defect: "one unlisted holding refuses the whole portfolio instead of degrading per metric",
    module: "rlportfolioanalytics.js",
    find: "      else excluded.push({ symbol: h.symbol, assetType: h.assetType || \"unknown\" });",
    replace: "      else return { state: \"unsupported-holding\", symbol: h.symbol };",
    carrier: "tests/portfolio-risk.functional.mjs",
    title: "SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output"
  },
  {
    finding: "F008-RISK-DIAGNOSTICS-001",
    scope: 21,
    defect: "CAGR is annualized from the return count instead of exact elapsed calendar days",
    module: "rlportfolioanalytics.js",
    find: "    var years = elapsedDays / CALENDAR_DAYS_PER_YEAR;",
    replace: "    var years = returns.length / ppy;",
    carrier: "tests/portfolio-analytics.unit.mjs",
    title: "TP-07-01 arithmetic, compounded and drag are separate and independently correct"
  },
  {
    finding: "F008-PATH-CONTRACT-001",
    scope: 22,
    defect: "a superseded compute token is accepted, so a stale chunk can publish over a newer one",
    module: "rlportfolioanalytics.js",
    find: "    if (token.workspaceIdentity !== spec.workspaceIdentity || token.scenarioIdentity !== identity) {",
    replace: "    if (false) {",
    carrier: "tests/portfolio-paths.functional.mjs",
    title: "TP-22-02 chunk controller cancellation and supersession preserve the last valid result"
  },
  {
    finding: "F008-SURVIVAL-PATH-001",
    scope: 22,
    defect: "every cash need is funded at the first session instead of its declared date",
    module: "rlportfolioanalytics.js",
    find: "        if (sessionDates[s] >= flow.date) { session = s; break; }",
    replace: "        if (s === 0) { session = s; break; }",
    carrier: "tests/portfolio-paths.functional.mjs",
    title: "TP-22-02 complete multi-path flow and distribution records survive a public JSON round trip"
  },
  {
    finding: "F008-DIVERSIFICATION-001",
    scope: 23,
    defect: "the qualified Forbes-Rigobon path is unreachable, leaving the unqualified adjustment",
    module: "rlportfolioanalytics.js",
    find: "    if (input && input.contractVersion === \"ForbesRigobonRequest/v1\") {",
    replace: "    if (false) {",
    carrier: "tests/portfolio-diversification.functional.mjs",
    title: "TP-23-02 complete diversification projection survives JSON round trip with exact contracts"
  },
  {
    finding: "F008-HEDGE-001",
    scope: 23,
    defect: "hedge basis risk no longer requires an aligned excess-return sample",
    module: "rlportfolioanalytics.js",
    find: "    if (request.sample.definitionKind !== \"aligned-excess-returns\") {",
    replace: "    if (false) {",
    carrier: "tests/portfolio-diversification.functional.mjs",
    title: "TP-23-02 reduced or incomplete recompute refuses publication and preserves the last valid projection"
  },
  {
    finding: "F008-ALLOCATION-001",
    scope: 24,
    defect: "declared constraints are dropped before feasibility, so nothing is ever infeasible",
    module: "rlportfolioanalytics.js",
    find: "    var list = Array.isArray(constraints) ? constraints : [];",
    replace: "    var list = [];",
    carrier: "tests/portfolio-allocation.functional.mjs",
    title: "TP-24-02 six complete candidates retain one basis costs paths survival and no winner"
  },
  {
    finding: "F008-SENSITIVITY-BL-001",
    scope: 24,
    defect: "stated views never reach the posterior, leaving Black-Litterman equilibrium-only",
    module: "rlportfolioanalytics.js",
    find: "    var sigma = request.covariance;",
    replace: "    var sigma = request.covariance;\n    request = Object.assign({}, request, { views: [] });",
    carrier: "tests/portfolio-allocation.functional.mjs",
    title: "TP-14-02 production sensitivity and Black-Litterman lifecycle run on the common basis"
  },
  {
    finding: "F008-DOSSIER-001",
    scope: 25,
    defect: "an incomplete decision-fold request is accepted, so walk-forward can skip its own contract",
    module: "rlportfolioanalytics.js",
    find: "    ]) || request.contractVersion !== DECISION_FOLD_REQUEST_VERSION) {",
    replace: "    ]) && false) {",
    carrier: "tests/portfolio-dossier.functional.mjs",
    title: "Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract"
  },
  {
    finding: "F008-COMPUTE-NAV-001",
    scope: 26,
    defect: "a consumed ReturnContext is left in storage, so the handoff can be replayed",
    module: "rlportfolio.js",
    find: "    function discard() { try { storage.removeItem(RETURN_CONTEXT_KEY); } catch (error) { /* already gone */ } }",
    replace: "    function discard() { /* reduced: the consumed context is left behind */ }",
    carrier: "tests/portfolio-workspace.functional.mjs",
    title: "Adversarial: recomputing navigation stale publication and fake return context cannot pass"
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

/* One narrowed carrier run. `defect` absent => shipped tree; `defect` present => the reduced source
   is substituted in memory by the preload. TAP is forced so the counts parse identically whether or
   not a terminal is attached. */
function runProtectiveTitle({ carrier, title, defect, marker }) {
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

test("Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing", (t) => {
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
    const applied = readFileSync(marker, "utf8").trim();

    const problems = [];
    if (shipped.tests !== 1) problems.push(`title resolved to ${shipped.tests} executed test(s) on the shipped tree, expected exactly 1`);
    if (shipped.exitCode !== 0 || shipped.fail !== 0) problems.push(`the protective test does not pass on the shipped tree (exit ${shipped.exitCode}, fail ${shipped.fail})`);
    if (applied === "") problems.push("the audited defect was never represented, so nothing was challenged");
    if (mutant.tests !== 1) problems.push(`title resolved to ${mutant.tests} executed test(s) under the defect, expected exactly 1`);
    if (mutant.exitCode === 0 || !(mutant.fail >= 1)) problems.push(`the protective test still PASSES with the audited defect present (exit ${mutant.exitCode}, fail ${mutant.fail}) — it is not load-bearing`);

    if (problems.length) failures.push(`${entry.finding} (scope ${entry.scope}, ${entry.carrier}): ${problems.join("; ")}`);
    evidence.push(`${entry.finding} scope=${entry.scope} shipped=${shipped.pass}/${shipped.tests} mutant-fail=${mutant.fail} represented=${applied !== ""}`);
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
    title: "BUG-007: prototype-sensitive completion subjects are safe own keys"
  },
  {
    id: "BUG-007-OWN-OWNER-LOOKUP",
    defect: "an inherited owner entry is accepted as though the caller supplied it",
    module: "rlportfoliobrief.js",
    find: "Object.prototype.hasOwnProperty.call(owners, subjectId)",
    replace: "true",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "BUG-007: own lookup semantics and RED cleanup preserve shared built-ins"
  },
  {
    id: "BUG-007-NORMAL-LANE-ORDER",
    defect: "watchlist is ranked ahead of held instead of preserving direct-authority order",
    module: "rlportfoliobrief.js",
    find: "  var LANE_ORDER = [\"held\", \"watchlist\", \"completedResearch\", \"inferredRelevance\"];",
    replace: "  var LANE_ORDER = [\"watchlist\", \"held\", \"completedResearch\", \"inferredRelevance\"];",
    carrier: "tests/portfolio-brief.functional.mjs",
    title: "BUG-007: normal brief order and refusal precedence remain unchanged"
  }
];

test("BUG-007: caller-key protections and normal ordering are load-bearing in memory", (t) => {
  const workspace = mkdtempSync(join(tmpdir(), "rl-bug007-integrity-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));

  const trackedPaths = [
    "rlportfoliobrief.js",
    "tests/portfolio-brief.functional.mjs",
    "tests/portfolio-defect-injector.cjs",
    "tests/portfolio-test-integrity.unit.mjs"
  ];
  const before = Object.fromEntries(trackedPaths.map((path) => [path, sha256(path)]));
  const failures = [];

  for (const entry of BUG_007_MUTATIONS) {
    const marker = join(workspace, `${entry.id}.marker`);
    writeFileSync(marker, "");
    const shipped = runProtectiveTitle({ carrier: entry.carrier, title: entry.title, defect: null, marker });
    const mutant = runProtectiveTitle({ carrier: entry.carrier, title: entry.title, defect: entry, marker });
    const applications = readFileSync(marker, "utf8").trim().split("\n").filter(Boolean);

    const problems = [];
    if (shipped.tests !== 1) problems.push(`protective title resolved to ${shipped.tests} test(s), expected exactly 1`);
    if (shipped.exitCode !== 0 || shipped.fail !== 0) problems.push(`shipped protection is not green (exit ${shipped.exitCode}, fail ${shipped.fail})`);
    if (applications.length !== 1) problems.push(`in-memory substitution applied ${applications.length} time(s), expected exactly 1`);
    if (mutant.tests !== 1) problems.push(`mutant title resolved to ${mutant.tests} test(s), expected exactly 1`);
    if (mutant.exitCode === 0 || !(mutant.fail >= 1)) problems.push(`persistent test stayed green after removing protection (exit ${mutant.exitCode}, fail ${mutant.fail})`);
    if (problems.length) failures.push(`${entry.id}: ${entry.defect}: ${problems.join("; ")}`);
  }

  const after = Object.fromEntries(trackedPaths.map((path) => [path, sha256(path)]));
  assert.deepEqual(after, before, "in-memory BUG-007 mutations must not write product source or persistent tests");
  assert.deepEqual(failures, [], `BUG-007 protections that are not load-bearing:\n  ${failures.join("\n  ")}`);
});
