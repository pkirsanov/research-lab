/* Feature 008 Scope 13 — allocation composition against the real production modules.
 *
 * The analytics unit suite proves the six methods solve. This file proves the two things
 * that only appear when the composition and storage modules are used together: that a
 * saved allocation reaches storage through its REAL builder, and that the full-personal
 * clear genuinely empties it. Scope 03 could not make that claim, because `allocations`
 * had no write path then.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT, createStorage, fixture } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const NOW = '2026-07-15T14:00:00.000Z';
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const ANALYTICS_PATH = resolve(ROOT, 'rlportfolioanalytics.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');
const SCOPE24_FIXTURE_PATH = resolve(
  ROOT,
  'tests/fixtures/portfolio-survival-allocation/scope-24-allocation-basis.json'
);

const BASIS = 'basis=exact-common-date-intersection|cutoff=2026-05-08|symbols=BND,MSFT';

function loadRuntime() {
  assert.equal(existsSync(MODULE_PATH), true, 'RLPORTFOLIO production module must exist');
  assert.equal(existsSync(ANALYTICS_PATH), true, 'RLPORTFOLIOANALYTICS production module must exist');
  assert.equal(existsSync(POLICY_PATH), true, 'mandatory portfolio policy must exist');
  const api = require('../rlportfolio.js');
  const analytics = require('../rlportfolioanalytics.js');
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  assert.equal(api.validatePolicy(policy).ok, true);
  return { api, analytics, policy };
}

function seededWorkspace(api, policy, localStorage, sessionStorage) {
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const preview = api.validateImport('csv', fixture('valid-portfolio.csv'), opened.value.workspace, policy);
  assert.equal(preview.ok, true);
  const resolved = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(resolved.ok, true);
  const candidate = api.buildWorkspaceCandidate(resolved.value, opened.value.workspace, { name: 'Allocation basis', now: NOW }, policy);
  assert.equal(candidate.ok, true);
  const committed = store.commitWorkspace(candidate.value, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true);
  return { store, workspace: committed.value.workspace };
}

test('TP-13-02 six production candidates share one frozen basis and keep their own states', () => {
  const { analytics } = loadRuntime();
  const covariance = [[0.04, 0.01], [0.01, 0.09]];

  const comparison = analytics.compareAllocationMethods({
    symbols: ['BND', 'MSFT'],
    covariance,
    currentWeights: [0.4, 0.6],
    constraints: [{ subject: 'BND', minimum: null, maximum: 0.5 }]
  });
  assert.equal(comparison.state, 'ok');

  // One frozen basis: every candidate is evaluated against the SAME covariance
  // and the SAME constraint set, so a difference is attributable to the method.
  assert.equal(comparison.basisFrozen, true);
  assert.deepEqual(comparison.symbols, ['BND', 'MSFT']);
  assert.equal(comparison.candidates.length, 6);

  // Each candidate keeps its own state rather than being collapsed into a single
  // pass/fail. A method that could not run is distinguishable from one that ran
  // and produced an infeasible answer, which are very different findings.
  const byMethod = new Map(comparison.candidates.map((c) => [c.method, c]));
  assert.equal(byMethod.get('equal-weight').feasibility.state, 'feasible');
  assert.equal(byMethod.get('minimum-variance').feasibility.state, 'infeasible',
    'minimum variance puts 0.727 in BND, breaching the 0.5 cap');
  assert.equal(byMethod.get('black-litterman').state, 'unavailable');
  assert.equal(byMethod.get('black-litterman').feasibility.state, 'unavailable');

  // An infeasible candidate keeps its weights so the breach is inspectable.
  assert.ok(Array.isArray(byMethod.get('minimum-variance').weights));
  assert.equal(byMethod.get('minimum-variance').feasibility.conflictingSet[0].kind, 'maximum');

  // The comparison never names a winner, at any layer.
  assert.equal(comparison.recommendedMethod, null);
  assert.equal(comparison.bestMethod, null);
  for (const candidate of comparison.candidates) {
    assert.equal(candidate.recommended, undefined);
    assert.equal(candidate.best, undefined);
  }
});

test('BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible', () => {
  const { analytics } = loadRuntime();
  const comparison = analytics.compareAllocationMethods({
    symbols: ['BND', 'MSFT'],
    covariance: [[0.04, 0.01], [0.01, 0.09]],
    currentWeights: [0.4, 0.6],
    constraints: [{ subject: 'BND', minimum: null, maximum: 0.5 }]
  });
  const minimumVariance = comparison.candidates.find((candidate) => candidate.method === 'minimum-variance');

  assert.equal(comparison.state, 'ok');
  assert.equal(minimumVariance.feasibility.state, 'infeasible');
  assert.equal(minimumVariance.feasibility.conflictingSet.length, 1);
  assert.equal(minimumVariance.feasibility.conflictingSet[0].subject, 'BND');
  assert.equal(minimumVariance.feasibility.conflictingSet[0].kind, 'maximum');
  assert.equal(minimumVariance.feasibility.conflictingSet[0].required, 0.5);
  assert.ok(minimumVariance.feasibility.conflictingSet[0].actual > 0.5);
});

test('TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const { store, workspace } = seededWorkspace(api, policy, localStorage, sessionStorage);

  // Written through the REAL builder, not injected into the container.
  const saved = api.buildAllocationCandidate(
    BASIS,
    'minimum-variance',
    'Minimum variance on the current basis',
    { volatility: 0.1784, feasible: true },
    workspace,
    NOW,
    policy
  );
  assert.equal(saved.ok, true, `allocation must build: ${JSON.stringify(saved.error || {})}`);
  assert.equal(saved.value.accepted, true);
  const committed = store.commitWorkspace(saved.value.workspace, workspace.generation, NOW);
  assert.equal(committed.ok, true);

  // Reread from storage through a NEW store over the same backing keys. Reading
  // the in-memory object back would prove nothing about persistence.
  const reopened = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(NOW);
  assert.equal(reopened.ok, true);
  assert.equal(reopened.value.workspace.allocations.length, 1, 'the saved allocation survives a reread');
  assert.equal(reopened.value.workspace.allocations[0].basisIdentity, BASIS);
  assert.equal(reopened.value.workspace.allocations[0].method, 'minimum-variance');

  // The stored record carries the basis identity and a summary, never the full
  // candidate matrix: the basis reproduces the candidate exactly, so storing the
  // weights would duplicate derivable data and widen what a clear must remove.
  assert.equal(reopened.value.workspace.allocations[0].weights, undefined);

  // Saving the same basis and method twice is a no-op, not a second record.
  const again = api.buildAllocationCandidate(
    BASIS, 'minimum-variance', 'Minimum variance on the current basis',
    { volatility: 0.1784, feasible: true }, reopened.value.workspace, NOW, policy
  );
  assert.equal(again.ok, true);
  assert.equal(again.value.accepted, false);
  assert.equal(again.value.reason, 'duplicate-allocation');
  assert.equal(again.value.workspace.allocations.length, 1);

  // The declared privacy category is real: it reports the stored count.
  const inventory = api.privacyInventory(reopened.value.workspace, { localStorage, sessionStorage }, policy);
  assert.equal(inventory.ok, true);
  const allocationsCategory = inventory.value.categories.find((entry) => entry.category === 'allocations');
  assert.ok(allocationsCategory, 'allocations must be a declared privacy category');
  assert.equal(allocationsCategory.recordCount, 1);
  assert.equal(allocationsCategory.present, true);

  // A behavior-only clear must LEAVE it: a saved allocation is something the
  // user explicitly kept, not a behavioural inference.
  const behaviorCleared = api.buildBehaviorClearCandidate(reopened.value.workspace, NOW, policy);
  assert.equal(behaviorCleared.ok, true);
  assert.equal(behaviorCleared.value.workspace.allocations.length, 1,
    'a saved allocation is not behavior-derived, so the behavior clear preserves it');

  // The full-personal clear empties it, proven on a reread rather than in memory.
  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true, `full personal clear must succeed: ${JSON.stringify(cleared.error || {})}`);
  const afterClear = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(NOW);
  assert.equal(afterClear.ok, true);
  assert.equal(afterClear.value.workspace.allocations.length, 0,
    'the full personal clear removes every saved allocation');
});

test('TP-14-02 production sensitivity and Black-Litterman lifecycle run on the common basis', () => {
  const { api, analytics, policy } = loadRuntime();
  const covariance = [[0.04, 0.01], [0.01, 0.09]];

  // The perturbation set and the stability threshold come from the SAME visible
  // policy the page reads. A test that invented its own would prove the engine
  // works on numbers nothing in production uses.
  const sensitivity = analytics.allocationSensitivity({
    symbols: ['BND', 'MSFT'],
    covariance,
    currentWeights: [0.4, 0.6],
    perturbations: policy.analytics.covarianceSensitivity,
    unstableRangeThreshold: policy.analytics.allocationUnstableRangeThreshold
  });
  assert.equal(sensitivity.state, 'ok');
  assert.equal(sensitivity.validTrials, policy.analytics.covarianceSensitivity.length);
  assert.equal(sensitivity.failedTrials, 0);
  assert.deepEqual(sensitivity.declaredPerturbations, policy.analytics.covarianceSensitivity);
  assert.equal(sensitivity.ranges.length, 2);
  assert.ok(Array.isArray(sensitivity.reversalConditions));

  // The equilibrium is computed from the policy's own risk aversion and tau.
  const equilibriumOnly = analytics.blackLittermanPosterior({
    symbols: ['BND', 'MSFT'],
    covariance,
    benchmarkWeights: [0.5, 0.5],
    riskAversion: policy.analytics.blackLittermanRiskAversion,
    tau: policy.analytics.blackLittermanTau,
    views: []
  });
  assert.equal(equilibriumOnly.state, 'equilibrium-only');
  assert.deepEqual(equilibriumOnly.posteriorMean, equilibriumOnly.impliedEquilibriumReturns);

  // Adding a stated view moves the posterior and leaves the equilibrium intact.
  const withView = analytics.blackLittermanPosterior({
    symbols: ['BND', 'MSFT'],
    covariance,
    benchmarkWeights: [0.5, 0.5],
    riskAversion: policy.analytics.blackLittermanRiskAversion,
    tau: policy.analytics.blackLittermanTau,
    views: [{ subject: 'MSFT', expectedReturn: 0.25, confidence: 0.7, source: 'user-stated' }]
  });
  assert.equal(withView.state, 'ok');
  assert.deepEqual(withView.impliedEquilibriumReturns, equilibriumOnly.impliedEquilibriumReturns,
    'stating a view must not rewrite the implied equilibrium');
  assert.ok(withView.posteriorMean[1] > equilibriumOnly.posteriorMean[1],
    'a bullish view raises the posterior for its subject');
  assert.equal(withView.behaviorContribution, 'none');

  // A workspace holding real behavioural interest is passed through the view
  // audit and contributes nothing, which is the lifecycle claim this row makes.
  const audit = analytics.blackLittermanViews({
    statedViews: [{ subject: 'MSFT', expectedReturn: 0.25, confidence: 0.7, source: 'user-stated' }],
    behaviorSignals: [{ subject: 'MSFT', weight: 0.99 }, { subject: 'BND', weight: 0.4 }]
  });
  assert.equal(audit.behaviorSignalsSeen, 2);
  assert.equal(audit.behaviorDerivedViews, 0);
  assert.equal(audit.admittedViews.length, 1);
  assert.ok(audit.exclusionStatement.includes('contributed NO view'));

  // The policy the page loads is the policy this row exercised.
  assert.equal(api.validatePolicy(policy).ok, true);
});

test('TP-24-02 six complete candidates retain one basis costs paths survival and no winner', () => {
  const { analytics } = loadRuntime();
  const input = JSON.parse(readFileSync(SCOPE24_FIXTURE_PATH, 'utf8'));
  assert.equal(analytics.validateAllocationBasis(input.basis).ok, true);

  const comparison = analytics.runAllocationComparison({
    basis: input.basis,
    blackLittermanInput: input.blackLittermanInput,
    expectedReturnInput: input.constrainedMvoInput,
    riskAversion: input.constrainedMvoInput.riskAversion
  });
  assert.equal(comparison.state, 'ok');
  assert.equal(comparison.contractVersion, 'AllocationComparison/v1');
  assert.deepEqual(comparison.candidates.map((candidate) => candidate.method), analytics.ALLOCATION_METHODS);
  assert.equal(comparison.recommendedMethod, null);
  assert.equal(comparison.bestMethod, null);

  for (const candidate of comparison.candidates) {
    assert.equal(candidate.contractVersion, 'AllocationCandidate/v1');
    assert.equal(candidate.basisFingerprint, comparison.basisFingerprint);
    assert.ok(['feasible', 'infeasible', 'unstable', 'unavailable'].includes(candidate.state));
    assert.equal(candidate.fullCosts.complete, true);
    assert.equal(candidate.fullCosts.rebalanceTiming, input.basis.costPolicy.rebalanceTiming);
    assert.equal(candidate.commonPathOutcomes.scenarioIdentity, input.basis.commonScenario.scenarioIdentity);
    assert.deepEqual(
      candidate.commonPathOutcomes.pathIds,
      input.basis.commonScenario.paths.map((path) => path.pathId)
    );
    assert.equal(candidate.survivalOutcomes.pathCount, input.basis.commonScenario.paths.length);
    assert.equal(candidate.returnContribution.values.length, input.basis.assetOrder.length);
    assert.equal(candidate.riskContribution.contributionShare.length, input.basis.assetOrder.length);
    assert.ok(Number.isFinite(candidate.turnover));
    assert.ok(Number.isFinite(candidate.concentration.herfindahl));
  }

  const publicRoundTrip = JSON.parse(JSON.stringify(comparison));
  assert.deepEqual(publicRoundTrip, comparison);
  assert.match(comparison.claimBoundary, /No candidate is universally best/);
  assert.equal(JSON.stringify(comparison).includes('recommendedMethod":"current'), false);

  const sensitivity = analytics.runAllocationSensitivity({
    basis: input.basis,
    blackLittermanInput: input.blackLittermanInput,
    expectedReturnInput: input.constrainedMvoInput,
    riskAversion: input.constrainedMvoInput.riskAversion,
    axes: input.basis.sensitivityAxes
  });
  assert.equal(sensitivity.state, 'ok');
  assert.deepEqual(sensitivity.declaredAxes, [
    'history', 'means', 'covariance', 'views', 'costs', 'assetBounds',
    'groupBounds', 'turnover', 'cash', 'leverage', 'riskAversion'
  ]);
  const declaredPointCount = Object.values(input.basis.sensitivityAxes)
    .reduce((sum, points) => sum + points.length, 0);
  assert.equal(sensitivity.totalTrials, declaredPointCount * analytics.ALLOCATION_METHODS.length);
  assert.equal(sensitivity.methods.length, analytics.ALLOCATION_METHODS.length);
  assert.deepEqual(JSON.parse(JSON.stringify(sensitivity)), sensitivity);
});

/* TP-15-02 — the production dossier projection, exercised through the real
 * analytics engine rather than a hand-built fixture. The point of the row is
 * that the SEPARATION survives the trip through the projection: a dossier that
 * merges in-sample with walk-forward on the way to storage would look correct
 * in the unit suite and still mislead a reader on reload. */
test('TP-15-02 production dossier projection preserves separation, costs, trials and the claim boundary', () => {
  const { api, analytics, policy } = loadRuntime();

  const returns = [0.021, -0.014, 0.033, 0.008, -0.022, 0.017, 0.026, -0.009, 0.012, 0.031, -0.018, 0.014];
  const dossier = analytics.walkForwardDossier({
    returns,
    folds: policy.analytics.walkForwardFolds,
    perRebalanceCostFraction: policy.analytics.hedgeCommissionFraction,
    rebalancesPerFold: policy.analytics.hedgeRebalancesPerYear,
    trialsSearched: policy.analytics.dossierTrialsSearched
  });
  assert.equal(dossier.state, 'ok', `dossier must resolve: ${dossier.reason || ''}`);

  /* Three distinct figures survive projection. Equality between any pair would
     mean the projection collapsed a distinction the engine drew. */
  const figures = [dossier.inSampleReturn, dossier.walkForwardReturn, dossier.costAdjustedReturn];
  figures.forEach((value) => assert.equal(Number.isFinite(value), true));
  assert.equal(new Set(figures.map((v) => v.toFixed(10))).size, 3,
    'in-sample, walk-forward and cost-adjusted must remain three distinct numbers through the projection');
  assert.equal(dossier.costAdjustedReturn < dossier.walkForwardReturn, true,
    'stated costs must reduce the walk-forward figure, or the cost row is decorative');

  /* The first fold is training only. Scoring it would put the fitted window back
     into the result, which is the whole failure walk-forward exists to avoid. */
  assert.equal(dossier.scoredFolds, policy.analytics.walkForwardFolds - 1,
    'exactly one fold is training-only and is never scored');
  assert.equal(dossier.trialsSearched, policy.analytics.dossierTrialsSearched);
  assert.equal(dossier.provesFutureSuperiority, false);

  const claim = analytics.marketEfficiencyClaim({
    form: policy.analytics.efficiencyFormTested,
    informationSet: policy.analytics.efficiencyInformationSet,
    sample: 'the held common-date sample',
    test: 'walk-forward cost-adjusted excess return',
    costAdjustedEdge: dossier.costAdjustedReturn
  });
  assert.equal(claim.state, 'ok');
  assert.equal(claim.allFormsRefuted, false);
  assert.equal(claim.untestedForms.length, 2, 'the two forms not tested are named, never left implicit');

  /* The persisted record carries its claim boundary. Storing the finding without
     the boundary would let a reload present a scoped, cost-adjusted,
     trial-discounted result as an unqualified one. */
  const store = api.createPortfolioStore({ localStorage: createStorage(), sessionStorage: createStorage() }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const built = api.buildDossierCandidate(
    'basis=exact-common-date-intersection|cutoff=2026-05-08|symbols=BND,MSFT',
    'Walk-forward research dossier',
    claim.claimBoundary,
    {
      inSampleReturn: dossier.inSampleReturn,
      walkForwardReturn: dossier.walkForwardReturn,
      costAdjustedReturn: dossier.costAdjustedReturn,
      trialsSearched: dossier.trialsSearched,
      scoredFolds: dossier.scoredFolds
    },
    opened.value.workspace,
    NOW,
    policy
  );
  assert.equal(built.ok, true, `dossier must persist: ${JSON.stringify(built.error || {})}`);
  const stored = built.value.workspace.dossiers[0];
  assert.equal(stored.summary.inSampleReturn, dossier.inSampleReturn);
  assert.equal(stored.summary.walkForwardReturn, dossier.walkForwardReturn);
  assert.equal(stored.summary.costAdjustedReturn, dossier.costAdjustedReturn);
  assert.equal(stored.claimBoundary.length > 0, true);
  assert.match(stored.claimBoundary, /nothing else|does not claim/);

  /* A dossier stored WITHOUT its boundary must be refused, not accepted with an
     empty string. An unqualified stored claim is the failure mode. */
  const unqualified = api.buildDossierCandidate(
    'basis=exact-common-date-intersection|cutoff=2026-05-08|symbols=BND,MSFT',
    'Unqualified claim',
    '   ',
    { walkForwardReturn: 0.04 },
    opened.value.workspace,
    NOW,
    policy
  );
  assert.equal(unqualified.ok, false, 'a dossier with no claim boundary must be refused');
  assert.equal(unqualified.error.reason, 'dossier-input-invalid');

  /* The engine REFUSES rather than inventing folds. Both refusals are asserted
     by name, because they are different failures: too little data at all, and
     enough data but not enough to support the declared fold count. The second is
     the state the browser fixture had to be lengthened to escape, so it is
     proven here rather than left as an unexercised branch. */
  const tooShort = analytics.walkForwardDossier({
    returns: returns.slice(0, 3),
    folds: policy.analytics.walkForwardFolds,
    perRebalanceCostFraction: policy.analytics.hedgeCommissionFraction,
    rebalancesPerFold: policy.analytics.hedgeRebalancesPerYear,
    trialsSearched: policy.analytics.dossierTrialsSearched
  });
  assert.equal(tooShort.state, 'unavailable');
  assert.equal(tooShort.reason, 'insufficient-sample');
  /* A refusal publishes NO figure. Asserting "not a finite number" rather than
     "=== null" covers both shapes a refusal could take (absent key or explicit
     null) while still failing if any number leaks out - which is the only thing
     that actually matters to a reader. */
  ['inSampleReturn', 'walkForwardReturn', 'costAdjustedReturn'].forEach((key) => {
    assert.equal(Number.isFinite(tooShort[key]), false, `a refused dossier must publish no ${key}`);
  });

  const tooFewPerFold = analytics.walkForwardDossier({
    returns: returns.slice(0, 5),
    folds: policy.analytics.walkForwardFolds,
    perRebalanceCostFraction: policy.analytics.hedgeCommissionFraction,
    rebalancesPerFold: policy.analytics.hedgeRebalancesPerYear,
    trialsSearched: policy.analytics.dossierTrialsSearched
  });
  assert.equal(tooFewPerFold.state, 'unavailable');
  assert.equal(tooFewPerFold.reason, 'folds-exceed-sample');
  assert.equal(Number.isFinite(tooFewPerFold.walkForwardReturn), false,
    'a sample too short for the declared folds yields no walk-forward figure rather than a fold count quietly reduced to fit');
});

/* TP-15-08 — Scope 03 recorded that its full-personal clear swept `dossiers`
 * vacuously, because no write path existed. That conjunct is discharged here:
 * the section is populated through the REAL builder and then observed to be
 * emptied by the clear that names it, and preserved by the clear that does not. */
test('TP-15-08 a persisted dossier is swept by the full-personal clear and survives the behavior clear', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);

  const built = api.buildDossierCandidate(
    'basis=exact-common-date-intersection|cutoff=2026-05-08|symbols=BND,MSFT',
    'Discharged clear conjunct dossier',
    'This result speaks to the weak form over the held sample and to nothing else.',
    { walkForwardReturn: 0.0412, costAdjustedReturn: 0.0388, trialsSearched: 12 },
    opened.value.workspace,
    NOW,
    policy
  );
  assert.equal(built.ok, true, `dossier must build: ${JSON.stringify(built.error || {})}`);
  const committed = store.commitWorkspace(built.value.workspace, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true, `dossier must commit: ${JSON.stringify(committed.error || {})}`);
  assert.equal(committed.value.workspace.dossiers.length, 1,
    'the section must genuinely hold a record, or every emptiness assertion below is vacuous');

  /* A saved dossier is explicitly saved, not behavior-derived, so the
     behavior-only clear must LEAVE it exactly as it leaves holdings. Deleting a
     user's saved research on a behavior clear would be a silent data loss. */
  const behaviorCleared = api.buildBehaviorClearCandidate(committed.value.workspace, NOW, policy);
  assert.equal(behaviorCleared.ok, true);
  assert.equal(behaviorCleared.value.workspace.dossiers.length, 1,
    'a behavior-only clear must not remove an explicitly saved dossier');

  /* The full-personal clear removes it. Proven by REREADING storage, not by
     inspecting the in-memory object - a clear that only updated the variable
     would leave the record on disk for the next session to surface. */
  const inventoryBefore = api.privacyInventory(committed.value.workspace, { localStorage, sessionStorage }, policy);
  assert.equal(inventoryBefore.ok, true);
  const dossierCategory = inventoryBefore.value.categories.find((entry) => entry.category === 'dossiers');
  assert.equal(dossierCategory.recordCount, 1, 'the inventory must report the real held count');
  assert.equal(dossierCategory.clearedBy.split('-and-').includes('all-personal'), true);

  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true, `clear must succeed: ${JSON.stringify(cleared.error || {})}`);
  const reread = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(NOW);
  assert.equal(reread.ok, true);
  assert.equal(reread.value.workspace.dossiers.length, 0,
    'the full-personal clear must empty the dossier section on a storage REREAD, not merely in memory');
});

test('TP-25-01 decision-time folds preserve clocks costs states and exact tried variants', () => {
  const { analytics } = loadRuntime();
  const observations = [
    ['obs-01', '2026-01-02', '2026-01-02T22:00:00.000Z', 0.01, false],
    ['obs-02', '2026-01-05', '2026-01-05T22:00:00.000Z', -0.005, false],
    ['obs-03', '2026-01-06', '2026-01-06T22:00:00.000Z', 0.015, false],
    ['obs-04', '2026-01-07', '2026-01-07T22:00:00.000Z', 0.004, false],
    ['obs-lookahead', '2026-01-08', '2026-01-12T22:00:00.000Z', 0.90, false],
    ['obs-05', '2026-01-13', '2026-01-13T22:00:00.000Z', 0.02, false],
    ['obs-06', '2026-01-14', '2026-01-14T22:00:00.000Z', -0.01, true],
    ['obs-07', '2026-01-15', '2026-01-15T22:00:00.000Z', 0.012, false]
  ].map(([observationId, date, availableAt, portfolioReturn, stress]) => ({
    contractVersion: 'decision-observation/v1',
    observationId,
    date,
    availableAt,
    portfolioReturn,
    sourceVintageId: 'sha256:' + (stress ? 'b' : 'a').repeat(64),
    stress
  }));
  const costs = {
    contractVersion: 'decision-costs/v1',
    commissionFraction: 0.0004,
    spreadFraction: 0.0006,
    slippageFraction: 0.0005,
    turnoverFraction: 0.20,
    financingFraction: 0.0002,
    carryFraction: 0.0001,
    rebalanceTiming: 'application-start'
  };
  const fold = analytics.evaluateDecisionFold({
    contractVersion: 'decision-fold-request/v1',
    trainingStart: '2026-01-02',
    trainingEnd: '2026-01-08',
    decisionCutoff: '2026-01-09T00:00:00.000Z',
    embargo: { contractVersion: 'decision-interval/v1', startDate: '2026-01-09', endDate: '2026-01-12' },
    purge: { contractVersion: 'decision-interval/v1', startDate: '2026-01-08', endDate: '2026-01-08' },
    rebalanceDate: '2026-01-13',
    applicationStart: '2026-01-13',
    applicationEnd: '2026-01-15',
    observations,
    sourceVintages: [
      { sourceId: 'fixture-bars', vintageId: 'sha256:' + 'a'.repeat(64), publishedAt: '2026-01-07T22:00:00.000Z' },
      { sourceId: 'fixture-stress', vintageId: 'sha256:' + 'b'.repeat(64), publishedAt: '2026-01-14T22:00:00.000Z' }
    ],
    fittedParameterIdentities: ['sha256:' + 'c'.repeat(64)],
    candidateIdentity: 'sha256:' + 'd'.repeat(64),
    costs
  });

  assert.equal(fold.state, 'ok');
  assert.equal(fold.contractVersion, 'DecisionFold/v1');
  assert.deepEqual(fold.eligibleTrainingObservationIds, ['obs-01', 'obs-02', 'obs-03', 'obs-04']);
  assert.equal(fold.excludedLookAheadObservationIds.includes('obs-lookahead'), true,
    'the strong return published after the decision cutoff must not enter fitting');
  assert.equal(fold.applicationObservationIds.includes('obs-lookahead'), false,
    'the look-ahead discriminator is neither training evidence nor an application return');
  assert.equal(fold.results.inSample.state, 'in-sample');
  assert.equal(fold.results.outOfSample.state, 'out-of-sample');
  assert.equal(fold.results.stress.state, 'stress');
  assert.equal(fold.results.gross.state, 'gross-only');
  assert.equal(fold.results.net.state, 'net');
  assert.equal(fold.results.net.value < fold.results.gross.value, true);
  assert.deepEqual(Object.keys(fold.costs).sort(), Object.keys(costs).sort());

  const grossOnly = analytics.evaluateDecisionFold({
    ...fold.requestIdentityInput,
    costs: { ...costs, carryFraction: null }
  });
  assert.equal(grossOnly.state, 'ok');
  assert.equal(grossOnly.results.gross.state, 'gross-only');
  assert.equal(grossOnly.results.net.state, 'unavailable');
  assert.equal(grossOnly.results.net.reason, 'complete-cost-authority-required');

  const ledger = analytics.buildTrialLedger([
    { trialKind: 'method', trialIdentity: 'sha256:' + '1'.repeat(64), selected: false },
    { trialKind: 'parameter-vector', trialIdentity: 'sha256:' + '2'.repeat(64), selected: true },
    { trialKind: 'method', trialIdentity: 'sha256:' + '1'.repeat(64), selected: false },
    { trialKind: 'stress-definition', trialIdentity: 'sha256:' + '3'.repeat(64), selected: false },
    { trialKind: 'view-set', trialIdentity: 'sha256:' + '4'.repeat(64), selected: false },
    { trialKind: 'hedge-ratio', trialIdentity: 'sha256:' + '5'.repeat(64), selected: false }
  ]);
  assert.equal(ledger.state, 'ok');
  assert.equal(ledger.entries.length, 5, 'an identical inspected trial counts exactly once');
  assert.equal(ledger.duplicateCount, 1);
  assert.equal(ledger.selectionBiasDisclosure.trialsInspected, 5);
  assert.equal(ledger.selectionBiasDisclosure.selectedOutputs, 1);
});
