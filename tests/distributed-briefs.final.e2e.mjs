/*
 * tests/distributed-briefs.final.e2e.mjs — Feature 002 Scope 08 (SCN-002-025 / SCN-002-027).
 *
 * Scenario-specific persistent E2E regressions for window-aware final aggregation. They drive the full
 * production barrier → compaction → author → validate path (runFinalAuthor) with the production-shaped
 * final author, and assert:
 *  - each scheduled window (pre-market / morning / pre-close / after-hours) authors a complete final whose
 *    window contract uses only cutoff-relevant evidence — pre-market names no prior thesis, morning names
 *    only a same-date earlier-cutoff pre-market thesis, pre-close never names an official close, and
 *    after-hours retains the current date's official regular close separately (SCN-002-025);
 *  - an unsupported unusual observation remains bounded educational context with ZERO action-slot impact,
 *    and promoting it into an action is rejected (SCN-002-027).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { runFinalAuthor } from '../scripts/brief-refresh.mjs';
import { singleSourceScenario, windowContext, buildFinalFromInput, makeHash } from './fixtures/feature-002/final/final-fixture-builder.mjs';
import { envelopeFinalAuthorFn } from './fixtures/feature-002/final/final-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

test('Regression: SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence', async () => {
  const finals = {};
  for (const window of ['pre-market', 'morning', 'pre-close', 'after-hours']) {
    const scenario = singleSourceScenario(window);
    const result = await runFinalAuthor({ ...scenario, authorFn: envelopeFinalAuthorFn('valid') });
    assert.equal(result.ok, true, `${window}: ${result.ok ? '' : JSON.stringify(result.refusal)}`);
    assert.equal(result.final.windowContext.window, window);
    assert.equal(result.final.coverage.length, 3);
    finals[window] = result.final;
  }

  // pre-market: no prior thesis, no official close labeled.
  assert.equal(finals['pre-market'].windowContext.priorWindowThesisRef, null);
  assert.equal(finals['pre-market'].windowContext.officialCloseAnchorRef, null);
  // morning: only a SAME-DATE pre-market thesis at an EARLIER cutoff.
  const morningPrior = finals['morning'].windowContext.priorWindowThesisRef;
  assert.equal(morningPrior.window, 'pre-market');
  assert.equal(morningPrior.tradingDate, finals['morning'].windowContext.tradingDate);
  assert.ok(Date.parse(morningPrior.cutoffAt) < Date.parse(finals['morning'].windowContext.cutoffAt));
  // pre-close: never names an official close before the calendar close.
  assert.equal(finals['pre-close'].windowContext.officialCloseAnchorRef, null);
  // after-hours: retains the current date's official regular close separately.
  assert.ok(finals['after-hours'].windowContext.officialCloseAnchorRef && typeof finals['after-hours'].windowContext.officialCloseAnchorRef.fingerprint === 'string');

  // The window contract REJECTS post-cutoff / mislabeled evidence for every window.
  const base = singleSourceScenario('morning');
  const reject = (window, overrides) => RLCONTRACTS.compactFinalAuthorInput(base.registry, base.reads, base.briefs, base.groups, { ...base.runContext, windowContext: windowContext(window, overrides) }, base.finalBudget);
  assert.equal(reject('morning', { priorWindowThesisRef: null, priorWindowThesisState: null }).error.reason, 'window-prior-thesis-insufficient-undeclared');
  assert.equal(reject('morning', { priorWindowThesisRef: { window: 'pre-market', tradingDate: '2026-07-14', cutoffAt: '2026-07-14T16:00:00.000Z' } }).error.reason, 'window-prior-thesis-cutoff-not-earlier');
  assert.equal(reject('pre-close', { officialCloseAnchorRef: { fingerprint: makeHash('premature-close') } }).error.reason, 'window-official-close-forbidden');
  assert.equal(reject('after-hours', { officialCloseAnchorRef: null }).error.reason, 'window-official-close-required');
  assert.equal(reject('pre-market', { priorWindowThesisRef: { window: 'pre-market', tradingDate: '2026-07-14', cutoffAt: '2026-07-14T10:00:00.000Z' } }).error.reason, 'window-prior-thesis-not-allowed');

  // A morning final whose predecessor thesis is absent but declared insufficient still validates.
  const insufficient = singleSourceScenario('morning', { windowOverrides: { priorWindowThesisRef: null, priorWindowThesisState: 'insufficient' } });
  const insufficientResult = await runFinalAuthor({ ...insufficient, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(insufficientResult.ok, true, insufficientResult.ok ? '' : JSON.stringify(insufficientResult.refusal));
  assert.equal(insufficientResult.final.windowContext.priorWindowThesisState, 'insufficient');
});

test('Regression: SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact', async () => {
  const unusual = { observationRef: 'obs-nvda-unusual', destination: 'context', suppressionReason: 'no-eligible-owner-interpretation', subjects: ['NVDA'] };

  // Baseline WITHOUT the unusual observation.
  const baseline = singleSourceScenario('after-hours');
  const baselineResult = await runFinalAuthor({ ...baseline, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(baselineResult.ok, true, baselineResult.ok ? '' : JSON.stringify(baselineResult.refusal));

  // WITH the unusual observation: it becomes bounded context; actions and confidence are UNCHANGED.
  const withUnusual = singleSourceScenario('after-hours', { lowNoiseResults: [unusual] });
  const withResult = await runFinalAuthor({ ...withUnusual, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(withResult.ok, true, withResult.ok ? '' : JSON.stringify(withResult.refusal));
  assert.equal(withResult.final.attention.length, 1);
  assert.equal(withResult.final.attention[0].destination, 'context');
  assert.equal(withResult.final.attention[0].observationRef, 'obs-nvda-unusual');
  // Zero action-slot impact: same action count and same merged confidence as the baseline.
  assert.equal(withResult.final.actions.length, baselineResult.final.actions.length);
  assert.deepEqual(withResult.final.actions.map((action) => action.mergedConfidenceScore), baselineResult.final.actions.map((action) => action.mergedConfidenceScore));
  // The unusual subject never appears in an action.
  assert.equal(withResult.final.actions.some((action) => action.subjects.includes('NVDA')), false);

  // RED regression: promoting the unusual observation into an action slot is rejected by the validator.
  const compact = RLCONTRACTS.compactFinalAuthorInput(withUnusual.registry, withUnusual.reads, withUnusual.briefs, withUnusual.groups, withUnusual.runContext, withUnusual.finalBudget);
  const runInputs = { registry: withUnusual.registry, reads: withUnusual.reads, briefs: withUnusual.briefs, marketSessionEvidenceRef: withUnusual.runContext.marketSessionEvidenceRef, actionThresholds: withUnusual.runContext.actionThresholds };
  const promoted = buildFinalFromInput(compact.value.finalInput, { mode: 'promote-unusual' });
  assert.equal(RLCONTRACTS.validateFinalBrief(promoted, runInputs, withUnusual.groups).error.reason, 'final-attention-consumes-action');
});
