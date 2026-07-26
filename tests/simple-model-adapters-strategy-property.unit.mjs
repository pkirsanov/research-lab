import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clone, loadProductionApi, readJson } from './tool-experience.support.mjs';

/*
 * TP-07-01 — Feature 012 Scope 07 strategy/property/method Simple-adapter unit contracts.
 *
 * This suite proves the delivered Scope-07 adapters (rlexperience-adapters/strategy-research.js,
 * and later property-research.js + market-action.js) at genuine owner-parity: the pure owner
 * primitives are the SINGLE SOURCE that BOTH the owning page's Power path AND the registered Simple
 * adapter consume (no inline formula copy on the page), every declared parameter provably moves its
 * declared output path, seeded simulation is reproducible under an explicit integer seed
 * (SCN-012-002), and neither module touches any fetch/provider/storage/cross-domain authority.
 *
 * Delivered so far: strategy-evolution/v1 (strategy-self-improvement-lab). The remaining Scope-07
 * definitions are declared in simple-models.json (Scope 01) and land incrementally; a tool whose
 * owner seam is not yet extracted is simply absent from the module's supportedAdapterIds, so this
 * suite asserts only over the delivered set.
 */

const require = createRequire(import.meta.url);

function loadStrategyResearch() {
  const path = require.resolve('../rlexperience-adapters/strategy-research.js');
  delete require.cache[path];
  return require(path);
}

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code || ''} ${result.error.fieldPath || result.error.reason || ''}`);
  return result.value;
}

function definitionFor(toolId) {
  return clone(readJson('simple-models.json').definitions.find((definition) => definition.toolId === toolId));
}

function runtimeFor(api, definition) {
  const config = readJson('tool-experience.config.json');
  const models = { contractVersion: 'simple-model-registry/v1', definitions: [definition] };
  return requireValue(api.createSimpleRuntime(config, models));
}

function defaultValues(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}

/* The strategy owner page source, read once, so the single-source tests can assert the page
   delegates its seeded path + walk-forward compute to the module (RLSTRATEGY) and carries no inline
   PRNG / genSeries / walk-forward formula copy. */
const SSI_PAGE = readFileSync(new URL('../strategy-self-improvement-lab.html', import.meta.url), 'utf8');

/* ═══════════════════════ strategy-evolution owner fixture (strategy-self-improvement-lab) ═══════════════════════
   A synthetic frozen owner scenario engineered so every declared parameter provably moves its
   declared output path. A multi-regime boom-bust-recovery path (so the search finds real differences),
   the page's real start levers + lever ranges (so the search sweeps a genuine range), the page's real
   goal thresholds, and the page's real walk-forward config. No fabricated feed — the adapter recomputes
   only from these frozen owner facts through the single-source seeded engine, and the SEEDED PATH comes
   only from the single-sourced mulberry32(seed). */
function strategyOwnerFixture() {
  return {
    contractVersion: 'strategy-evolution-owner-state/v1',
    toolId: 'strategy-self-improvement-lab',
    asOf: '2026-07-26T20:00:00.000Z',
    source: 'test-owner synthetic seeded scenario',
    scenario: { id: 'boom-bust-recovery', label: 'Boom -> bust -> recovery' },
    years: 8,
    regimes: [
      { frac: 0.4, muAnnual: 0.17, sigAnnual: 0.14 },
      { frac: 0.2, muAnnual: -0.38, sigAnnual: 0.42 },
      { frac: 0.4, muAnnual: 0.13, sigAnnual: 0.18 }
    ],
    startLevers: { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 },
    leverRanges: {
      fast: { min: 5, max: 60, step: 5 },
      slow: { min: 50, max: 250, step: 10 },
      momLookback: { min: 20, max: 250, step: 10 },
      volTarget: { min: 0.05, max: 0.35, step: 0.025 },
      stopDd: { min: 0.05, max: 0.40, step: 0.025 },
      maxLeverage: { min: 0.5, max: 3.0, step: 0.25 }
    },
    goal: { targetCagr: 0.12, sharpeFloor: 1.0, maxDdCeiling: 0.20, minTimeInMarket: 0.25 },
    walkForward: { folds: 5, trainRatio: 0.6, acceptMargin: 0.05, oosGapTolerance: 0.8 }
  };
}

/* ═══════════════════════ TP-07-01 module authority + primitives ═══════════════════════ */

test('TP-07-01 strategy-research module exposes the delivered strategy-evolution adapter with no forbidden authority', () => {
  const sr = loadStrategyResearch();
  assert.ok(sr.supportedAdapterIds.includes('simple-adapter/strategy-evolution/v1'), 'strategy-evolution is a declared supported adapter');
  const raw = readFileSync(new URL('../rlexperience-adapters/strategy-research.js', import.meta.url), 'utf8');
  // Strip comments so the scan targets real authority CALLS, not doc prose naming what it avoids.
  const source = raw
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const forbidden = [
    /\bfetch\s*\(/,
    /\bproviderFetch\s*\(/,
    /\bRLDATA\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/,
    /\bXMLHttpRequest\b/,
    /\bimport\s*\(/,
    /\bwriteFileSync\b/,
    /\bDate\.now\s*\(/,
    /\bMath\.random\s*\(/,
    /data\/options/,
    /data\/bars/,
    /rlexperience-adapters\/(market-structure|options|macro-rotation|fundamental-models|property-research|market-action)/
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `strategy-research.js must not contain ${pattern}`);
  }
});

test('TP-07-01 strategy-research mulberry32/gauss/genSeries pin the single-source seeded path (SCN-012-002 core)', () => {
  const sr = loadStrategyResearch();

  // mulberry32: the deterministic PRNG. The same 32-bit seed yields the same stream; a different seed
  // yields a different stream. This is the reproducibility core.
  const a1 = sr.mulberry32(12345); const a2 = sr.mulberry32(12345);
  assert.equal(a1(), a2(), 'same seed => identical first draw');
  assert.equal(a1(), a2(), 'same seed => identical second draw');
  const b = sr.mulberry32(999);
  assert.notEqual(sr.mulberry32(12345)(), b(), 'a different seed yields a different draw');

  // genSeries: the seeded synthetic path. Same seed => byte-identical path; different seed => distinct path.
  const regimes = [{ frac: 1, muAnnual: 0.11, sigAnnual: 0.16 }];
  const s1 = sr.genSeries(20260722, 8, regimes);
  const s2 = sr.genSeries(20260722, 8, regimes);
  assert.equal(s1.days, s2.days, 'same seed => same length');
  assert.equal(s1.px[s1.days], s2.px[s2.days], 'same seed => identical terminal price (reproducible path)');
  assert.equal(s1.px[Math.floor(s1.days / 2)], s2.px[Math.floor(s2.days / 2)], 'same seed => identical interior price');
  const s3 = sr.genSeries(777, 8, regimes);
  assert.notEqual(s1.px[s1.days], s3.px[s3.days], 'a different seed selects a distinct reproducible path');

  // The single-source evaluation engine produces finite metrics on a seeded path.
  const wf = sr.walkForward(s1, { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 }, 5, 0.6);
  assert.ok(wf.oos && Number.isFinite(wf.oos.sharpe), 'walkForward produces a finite out-of-sample Sharpe on the seeded path');
  assert.ok(wf.folds.length === 5, 'walkForward records one entry per fold');
});

test('TP-07-01 strategy-self-improvement-lab.html single-sources the seeded path + walk-forward engine from strategy-research.js', () => {
  assert.match(SSI_PAGE, /rlexperience-adapters\/strategy-research\.js/, 'ssi page loads strategy-research.js');
  assert.match(SSI_PAGE, /RLSTRATEGY\.genSeries\s*\(/, 'ssi page delegates the seeded path to the module');
  assert.match(SSI_PAGE, /RLSTRATEGY\.walkForward\s*\(/, 'ssi page delegates the walk-forward engine to the module');
  assert.match(SSI_PAGE, /RLSTRATEGY\.mulberry32\s*\(/, 'ssi page delegates the PRNG to the module');
  // The single owner source lives in strategy-research.js; the page must carry no inline copy.
  assert.equal(/a = a \+ 0x6D2B79F5 \| 0/.test(SSI_PAGE), false, 'ssi page has no inline mulberry32 formula');
  assert.equal(/px\[i \+ 1\] = px\[i\] \* Math\.exp\(r\)/.test(SSI_PAGE), false, 'ssi page has no inline genSeries path formula');
  assert.equal(/out\.oos\.sharpe = out\.meanOos/.test(SSI_PAGE), false, 'ssi page has no inline walkForward formula');
});

/* ═══════════════════════ TP-07-01 adapter runtime + owner parity ═══════════════════════ */

test('TP-07-01 strategy-evolution adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-self-improvement-lab');
  const runtime = runtimeFor(api, definition);
  const results = sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/strategy-evolution/v1'].ok, true, JSON.stringify(results['simple-adapter/strategy-evolution/v1'].error || {}));

  const owner = strategyOwnerFixture();
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.goal, 'sharpe', 'default goal is sharpe');
  assert.equal(summary.leverKey, 'fast', 'default variable trend-window maps to the fast lever');
  assert.equal(summary.seed, base.seed, 'the Simple seed drives the run');
  assert.ok(summary.path && typeof summary.path.pathIdentity === 'string', 'path carries a reproducible identity');
  assert.ok(summary.outOfSample && Array.isArray(summary.outOfSample.perFold) && summary.outOfSample.perFold.length === base['walk-forward-folds'], 'outOfSample carries one entry per fold');
  assert.ok(summary.search && Array.isArray(summary.search.sweptValues), 'search carries the swept candidate values');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the adapter's seeded path identity equals the module genSeries run directly on the
  // frozen owner scenario at the default seed (single source, no re-implementation).
  const series = sr.genSeries(base.seed, owner.years, owner.regimes);
  const samples = [series.px[0], series.px[Math.floor(series.days * 0.25)], series.px[Math.floor(series.days * 0.5)], series.px[Math.floor(series.days * 0.75)], series.px[series.days]];
  const expectIdentity = samples.map((v) => Math.round(v * 1e6) / 1e6).join(':');
  assert.equal(summary.path.pathIdentity, expectIdentity, 'path identity is single-sourced from genSeries');
  // Owner parity: the adapter's baseline OOS equals the module walkForward run directly.
  const baseWf = sr.walkForward(series, owner.startLevers, base['walk-forward-folds'], owner.walkForward.trainRatio);
  assert.equal(summary.outOfSample.meanOos, Math.round(baseWf.meanOos * 1e6) / 1e6, 'baseline meanOos is single-sourced from walkForward');
});

test('TP-07-01 each enabled strategy-evolution parameter changes its declared output path (common random numbers)', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-self-improvement-lab');
  const runtime = runtimeFor(api, definition);
  sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: strategyOwnerFixture() },
    parameterValues: base,
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T20:02:00.000Z'
  });

  // Every case keeps the SAME seed (common random numbers): the parameter effect must be visible on the
  // declared output path SEPARATE from path randomness.
  const cases = [
    ['goal', 'cagr', 'summary.goalScore'],
    ['variable', 'vol-target', 'summary.candidate'],
    ['search-budget', 6, 'summary.search'],
    ['overfit-penalty', 0.6, 'summary.acceptance'],
    ['acceptance-threshold', 0.9, 'summary.acceptance'],
    ['walk-forward-folds', 8, 'summary.outOfSample']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: base.seed,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    assert.equal(run.sensitivity.sharedRandomness.mode, 'common-random-numbers', `${parameterId} recompute keeps the seed (common random numbers)`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    // The seeded path is unchanged when only a non-seed parameter moves: sensitivity is separate from path.
    assert.equal(run.current.output.values.summary.path.pathIdentity, run.baseline.output.values.summary.path.pathIdentity, `${parameterId} does not alter the seeded path`);
    // Restore baseline for the next isolated one-at-a-time change.
    await runtime.recompute({ parameterValues: { ...base }, seed: base.seed, scenarioIds: ['baseline'], computedAt: '2026-07-26T20:03:30.000Z' });
  }
});

/* ═══════════════════════ TP-07-01 SCN-012-002 seeded reproducibility ═══════════════════════ */

test('TP-07-01 SCN-012-002 the same inputs+params+evidence+seed run twice produce identical result identity + summary', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-self-improvement-lab');
  const base = defaultValues(definition);

  async function runOnce() {
    const runtime = runtimeFor(api, definition);
    sr.registerStrategyResearchAdapters(runtime, api, [definition]);
    return requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: strategyOwnerFixture() },
      parameterValues: base,
      seed: base.seed,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T20:02:00.000Z'
    }));
  }

  const first = await runOnce();
  const again = await runOnce();
  assert.equal(first.computeIdentity, again.computeIdentity, 'identical inputs => identical compute identity');
  assert.equal(
    api.fingerprint(first.current.output.values.summary),
    api.fingerprint(again.current.output.values.summary),
    'identical inputs => identical owner summary (reproducible)'
  );
  assert.equal(first.current.output.values.summary.path.pathIdentity, again.current.output.values.summary.path.pathIdentity, 'identical seed => identical reproducible path');
});

test('TP-07-01 SCN-012-002 changing the seed creates a distinct run and a distinct path', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-self-improvement-lab');
  const runtime = runtimeFor(api, definition);
  sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);

  const baseline = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: strategyOwnerFixture() },
    parameterValues: base,
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T20:02:00.000Z'
  }));

  const newSeed = base.seed + 1;
  const seeded = requireValue(await runtime.recompute({
    parameterValues: { ...base, seed: newSeed },
    seed: newSeed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T20:04:00.000Z'
  }));

  assert.notEqual(seeded.computeIdentity, baseline.computeIdentity, 'a new seed produces a distinct compute identity');
  assert.equal(seeded.sensitivity.sharedRandomness.mode, 'path-separated', 'a seed change is path-separated, not a common-random sensitivity');
  assert.equal(seeded.sensitivity.seedChanged, true, 'the run records a seed change');
  assert.deepEqual(seeded.changedParameters, [], 'a seed change is not a sensitivity parameter (path randomness, not sensitivity)');
  assert.notEqual(
    seeded.current.output.values.summary.path.pathIdentity,
    baseline.current.output.values.summary.path.pathIdentity,
    'a new seed selects a distinct reproducible path'
  );
});
