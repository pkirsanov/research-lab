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
