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

/* ═══════════════════════ disclosure-decay owner fixture (smart-money-flow-lab) ═══════════════════════
   A synthetic frozen owner disclosure set engineered so every declared parameter provably moves its declared
   output path with GENUINE computed content (not just an echoed parameter). Five clusters chosen so:
   - source-mix insider vs blended include different filings (conviction moves);
   - lag-half-life moves every retained fraction (decayedConviction moves);
   - cluster-minimum 3 -> 2 admits the 2-filer cluster (cluster set moves);
   - the qualified set is 2 buy + 1 sell so consensusFraction = 2/3 straddles the 0.6/0.7 thresholds;
   - two clusters retain below 0.5, so a decay floor of 0.5 lifts them (decayedConviction moves).
   No fabricated feed — the adapter recomputes only from these frozen owner facts through the single-source
   owner functions. Reference "today" is 2026-07-05. */
function disclosureOwnerFixture() {
  return {
    contractVersion: 'disclosure-decay-owner-state/v1',
    toolId: 'smart-money-flow-lab',
    asOf: '2026-07-05',
    today: '2026-07-05',
    source: 'test-owner illustrative filing set',
    sourceClass: 'model-estimate',
    disclosures: [
      // AAA — 3 insider Form-4 buys, short lag (~2d), fresh -> high retained
      { ticker: 'AAA', filer: 'Dir A1 (Form 4)', type: 'insider', side: 'buy', usd: 2100000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'Off A2 (Form 4)', type: 'insider', side: 'buy', usd: 950000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'Off A3 (Form 4)', type: 'insider', side: 'buy', usd: 640000, txn: '2026-06-29', disclosed: '2026-07-01' },
      // BBB — 3 congress STOCK-Act buys, long lag (~60d) -> retained ~0.397 (< 0.5)
      { ticker: 'BBB', filer: 'Sen B1 (STOCK Act)', type: 'congress', side: 'buy', usd: 250000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'Rep B2 (STOCK Act)', type: 'congress', side: 'buy', usd: 120000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'Rep B3 (STOCK Act)', type: 'congress', side: 'buy', usd: 90000, txn: '2026-04-30', disclosed: '2026-06-29' },
      // CCC — 3 insider Form-4 SELLS, short lag (~3d) -> net negative (sell direction)
      { ticker: 'CCC', filer: 'Off C1 (Form 4)', type: 'insider', side: 'sell', usd: 5200000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'CCC', filer: 'Off C2 (Form 4)', type: 'insider', side: 'sell', usd: 1800000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'CCC', filer: 'Dir C3 (Form 4)', type: 'insider', side: 'sell', usd: 900000, txn: '2026-06-28', disclosed: '2026-07-01' },
      // DDD — 2 congress buys, lag (~40d) -> nFilers=2 (below default cluster minimum of 3)
      { ticker: 'DDD', filer: 'Rep D1 (STOCK Act)', type: 'congress', side: 'buy', usd: 175000, txn: '2026-05-20', disclosed: '2026-06-29' },
      { ticker: 'DDD', filer: 'Sen D2 (STOCK Act)', type: 'congress', side: 'buy', usd: 130000, txn: '2026-05-20', disclosed: '2026-06-29' },
      // EEE — 1 institutional 13F buy, lag (~50d) -> single filer, retained ~0.463 (< 0.5)
      { ticker: 'EEE', filer: 'Fund E1 (13F)', type: 'institution', side: 'buy', usd: 42000000, txn: '2026-05-10', disclosed: '2026-06-29' }
    ]
  };
}

/* The smart-money owner page source, read once, so the single-source tests can assert the page delegates its
   disclosure-lag / consensus formulas to the module (RLSTRATEGY) and carries no inline copy. */
const SMF_PAGE = readFileSync(new URL('../smart-money-flow-lab.html', import.meta.url), 'utf8');

/* ═══════════════════════ TP-07-01 disclosure-decay module authority + owner primitives ═══════════════════════ */

test('TP-07-01 strategy-research module exposes the delivered disclosure-decay adapter (owner-parity primitives)', () => {
  const sr = loadStrategyResearch();
  assert.ok(sr.supportedAdapterIds.includes('simple-adapter/disclosure-decay/v1'), 'disclosure-decay is a declared supported adapter');
  // The disclosure-lag owner primitives pin the exact smart-money-flow-lab semantics (single source).
  assert.equal(sr.alphaDecay(0, 15), 1, 'alphaDecay(0,H) = 1 (no age, full edge)');
  assert.equal(Math.round(sr.alphaDecay(15, 15) * 1e9) / 1e9, 0.5, 'alphaDecay(H,H) = 0.5 (one half-life)');
  assert.equal(Math.round(sr.alphaDecay(45, 15) * 1e9) / 1e9, 0.125, 'alphaDecay(3H,H) = 12.5%');
  assert.ok(sr.alphaDecay(30, 15) < sr.alphaDecay(10, 15), 'alphaDecay strictly decreasing in age');
  assert.equal(sr.dayGap('2026-05-20', '2026-06-28'), 39, 'dayGap counts whole days');
  assert.equal(sr.dayGap('2026-06-28', '2026-05-20'), 0, 'dayGap clamps a reversed range to 0');
  assert.equal(sr.dayGap('not-a-date', '2026-06-28'), 0, 'dayGap is NaN-safe -> 0');
  assert.ok(sr.consensusScore(3, 1e6, 2, 15) > sr.consensusScore(1, 1e6, 2, 15), 'consensus rises with distinct filers');
  assert.ok(sr.consensusScore(2, 5e6, 2, 15) > sr.consensusScore(2, 1e5, 2, 15), 'consensus rises with net $');
  assert.ok(sr.consensusScore(2, 1e6, 40, 15) < sr.consensusScore(2, 1e6, 2, 15), 'consensus falls as the cluster ages');
  assert.equal(sr.realisticEdgeFraction(2, 15), sr.alphaDecay(2, 15), 'realistic edge == decay at the disclosure lag');
});

test('TP-07-01 smart-money-flow-lab.html single-sources the disclosure-lag/consensus engine from strategy-research.js', () => {
  assert.match(SMF_PAGE, /rlexperience-adapters\/strategy-research\.js/, 'smart-money page loads strategy-research.js');
  assert.match(SMF_PAGE, /RLSTRATEGY\.alphaDecay\s*\(/, 'smart-money page delegates alphaDecay to the module');
  assert.match(SMF_PAGE, /RLSTRATEGY\.consensusScore\s*\(/, 'smart-money page delegates consensusScore to the module');
  assert.match(SMF_PAGE, /RLSTRATEGY\.realisticEdgeFraction\s*\(/, 'smart-money page delegates realisticEdgeFraction to the module');
  assert.match(SMF_PAGE, /RLSTRATEGY\.dayGap\s*\(/, 'smart-money page delegates dayGap to the module');
  // The single owner source lives in strategy-research.js; the page must carry no inline formula copy.
  assert.equal(/return Math\.pow\(2, -Math\.max\(0, ageDays\) \/ halfLifeDays\)/.test(SMF_PAGE), false, 'smart-money page has no inline alphaDecay formula');
  assert.equal(/var breadth = Math\.log2\(1 \+ Math\.max\(0, nFilers\)\)/.test(SMF_PAGE), false, 'smart-money page has no inline consensusScore formula');
});

/* ═══════════════════════ TP-07-01 disclosure-decay adapter runtime + owner parity ═══════════════════════ */

test('TP-07-01 disclosure-decay adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('smart-money-flow-lab');
  const runtime = runtimeFor(api, definition);
  const results = sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/disclosure-decay/v1'].ok, true, JSON.stringify(results['simple-adapter/disclosure-decay/v1'].error || {}));

  const owner = disclosureOwnerFixture();
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T21:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.sourceMix, 'blended', 'default source mix is blended');
  assert.equal(summary.lagHalfLife, base['lag-half-life'], 'the Simple lag half-life drives the run');
  assert.deepEqual(summary.cluster.qualifiedTickers.slice().sort(), ['AAA', 'BBB', 'CCC'], 'default cluster minimum 3 qualifies exactly the 3-filer clusters');
  assert.deepEqual(summary.cluster.droppedTickers.slice().sort(), ['DDD', 'EEE'], 'the 2-filer and 1-filer clusters are dropped, not zero-filled');
  assert.equal(summary.consensus.qualifiedClusters, 3, 'three qualified clusters');
  assert.equal(summary.consensus.buyClusters, 2, 'two of the qualified clusters are buy-directional (AAA, BBB); CCC nets to a sell');
  assert.equal(summary.consensus.consensusFraction, Math.round((2 / 3) * 1e6) / 1e6, 'consensus fraction is 2/3');
  assert.equal(summary.consensus.passes, true, 'a 2/3 consensus clears the default 0.6 threshold');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the adapter's per-ticker naive conviction equals the module consensusScore run directly on
  // the frozen owner cluster (single source, no re-implementation). BBB is 3 congress buys of 250k+120k+90k,
  // freshest disclosure 6 days old, at a 45-day half-life.
  const bbb = summary.conviction.perTicker.find((c) => c.ticker === 'BBB');
  assert.ok(bbb, 'BBB is a conviction cluster');
  const expectBbbNaive = Math.round(sr.consensusScore(3, 250000 + 120000 + 90000, 6, base['lag-half-life']) * 1e6) / 1e6;
  assert.equal(bbb.naive, expectBbbNaive, 'BBB naive conviction is single-sourced from consensusScore');
  // Owner parity: BBB retained equals realisticEdgeFraction at its 60-day average disclosure lag.
  const bbbDecay = summary.decayedConviction.perTicker.find((c) => c.ticker === 'BBB');
  assert.equal(bbbDecay.retained, Math.round(sr.realisticEdgeFraction(60, base['lag-half-life']) * 1e6) / 1e6, 'BBB retained edge is single-sourced from realisticEdgeFraction at its 60-day lag');
});

test('TP-07-01 each enabled disclosure-decay parameter changes its declared output path with genuine computed content', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('smart-money-flow-lab');
  const runtime = runtimeFor(api, definition);
  sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: disclosureOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T21:02:00.000Z'
  }));
  const baseSummary = prepared.current.output.values.summary;

  const cases = [
    ['source-mix', 'insider', 'summary.conviction'],
    ['lag-half-life', 90, 'summary.decayedConviction'],
    ['cluster-minimum', 2, 'summary.cluster'],
    ['consensus-threshold', 0.7, 'summary.consensus'],
    ['decay-floor', 0.5, 'summary.decayedConviction']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T21:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    // Restore baseline for the next isolated one-at-a-time change.
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:03:30.000Z' });
  }

  // Genuine computed effects (not just echoed parameters):
  const bySource = requireValue(await runtime.recompute({ parameterValues: { ...base, 'source-mix': 'insider' }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:04:00.000Z' })).current.output.values.summary;
  assert.notEqual(bySource.conviction.totalNaive, baseSummary.conviction.totalNaive, 'source-mix genuinely changes total naive conviction (fewer included filings)');
  assert.deepEqual(bySource.conviction.perTicker.map((c) => c.ticker).sort(), ['AAA', 'CCC'], 'insider-only conviction keeps only the two insider clusters');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:04:15.000Z' });

  const byHalfLife = requireValue(await runtime.recompute({ parameterValues: { ...base, 'lag-half-life': 90 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:04:30.000Z' })).current.output.values.summary;
  assert.ok(byHalfLife.decayedConviction.totalDecayed > baseSummary.decayedConviction.totalDecayed, 'a longer lag half-life genuinely retains more surviving conviction');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:04:45.000Z' });

  const byMin = requireValue(await runtime.recompute({ parameterValues: { ...base, 'cluster-minimum': 2 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:05:00.000Z' })).current.output.values.summary;
  assert.deepEqual(byMin.cluster.qualifiedTickers.slice().sort(), ['AAA', 'BBB', 'CCC', 'DDD'], 'lowering the cluster minimum to 2 genuinely admits the 2-filer DDD cluster');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:05:15.000Z' });

  const byThreshold = requireValue(await runtime.recompute({ parameterValues: { ...base, 'consensus-threshold': 0.7 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:05:30.000Z' })).current.output.values.summary;
  assert.equal(byThreshold.consensus.passes, false, 'raising the consensus threshold above 2/3 genuinely flips the verdict to divided');
  assert.equal(byThreshold.consensus.band, 'divided', 'the consensus band flips with the threshold');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:05:45.000Z' });

  const byFloor = requireValue(await runtime.recompute({ parameterValues: { ...base, 'decay-floor': 0.5 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T21:06:00.000Z' })).current.output.values.summary;
  assert.ok(byFloor.decayedConviction.totalDecayed > baseSummary.decayedConviction.totalDecayed, 'a higher decay floor genuinely lifts surviving conviction for below-floor clusters');
  const bbbFloor = byFloor.decayedConviction.perTicker.find((c) => c.ticker === 'BBB');
  assert.equal(bbbFloor.floored, true, 'BBB (retained ~0.397) is lifted by a 0.5 decay floor');
  assert.equal(bbbFloor.retainedFloored, 0.5, 'the floor lifts the retained fraction to exactly the floor, never above the natural cap');
});

test('TP-07-01 disclosure-decay is deterministic and preserves the frozen evidence gap without zero-filling', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('smart-money-flow-lab');
  const base = defaultValues(definition);

  async function runOnce() {
    const runtime = runtimeFor(api, definition);
    sr.registerStrategyResearchAdapters(runtime, api, [definition]);
    return requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: disclosureOwnerFixture() },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T21:02:00.000Z'
    }));
  }
  const first = await runOnce();
  const again = await runOnce();
  assert.equal(first.computeIdentity, again.computeIdentity, 'identical inputs => identical compute identity (no seed, pure over the frozen set)');
  assert.equal(
    api.fingerprint(first.current.output.values.summary),
    api.fingerprint(again.current.output.values.summary),
    'identical inputs => identical owner summary (deterministic)'
  );

  // The single-filer institutional echo (EEE) never qualifies at the default 3-filer gate and is reported as
  // dropped — it is never zero-filled into a fake cluster.
  const summary = first.current.output.values.summary;
  assert.ok(summary.cluster.droppedTickers.includes('EEE'), 'the single-filer 13F echo is dropped, not fabricated into a cluster');
  const eee = summary.decayedConviction.perTicker.find((c) => c.ticker === 'EEE');
  assert.ok(eee && eee.retained > 0 && eee.retained < 1, 'the dropped cluster still reports its real decayed edge (no zero-fill)');
});

/* ═══════════════════════ walk-forward-validation owner fixture (strategy-validation-lab) ═══════════════════════
   A synthetic frozen owner universe engineered so every declared parameter provably moves its declared output
   path with GENUINE computed content. The instrument closes are pre-generated deterministically in the TEST via
   the single-sourced module genSeries (a SEEDED generation done here, in the fixture — the ADAPTER itself is
   non-seeded and only consumes the frozen closes). The goal uses the OOS Sharpe as the SOLE discriminator with a
   wide margin (floor 0.5): clean-trend instruments clear it comfortably (measured OOS Sharpe 2–3) while choppy /
   downtrend instruments fail it (measured negative). The registry universe carries two clean-trend passers and
   one whipsaw failer (heldFraction 2/3); the current-watchlist universe carries one clean-trend passer and two
   failers (heldFraction 1/3) — a DIFFERENT held set of DISTINCT instruments, so the universe switch genuinely
   moves robustness. No fabricated feed: the adapter recomputes only from these frozen owner closes through the
   single-source walk-forward engine. Seeds calibrated against the real module OOS metrics. */
function walkForwardValidationOwnerFixture(sr) {
  const closesFor = (seed, regimes) => Array.from(sr.genSeries(seed, 5, regimes).px);
  const up = [{ frac: 1, muAnnual: 0.22, sigAnnual: 0.10 }];        // clean trend -> OOS Sharpe > 2 (PASS)
  const whip = [{ frac: 1, muAnnual: -0.20, sigAnnual: 0.35 }];     // sharp downtrend -> OOS Sharpe < 0 (FAIL)
  const down = [{ frac: 1, muAnnual: -0.18, sigAnnual: 0.30 }];     // downtrend -> OOS Sharpe < 0 (FAIL)
  const flat = [{ frac: 1, muAnnual: 0.0, sigAnnual: 0.42 }];       // high-vol chop -> OOS Sharpe < 0 (FAIL)
  return {
    contractVersion: 'walk-forward-validation-owner-state/v1',
    toolId: 'strategy-validation-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic multi-instrument universe',
    sourceClass: 'model-estimate',
    trainRatio: 0.6,
    startLevers: { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 },
    goal: { targetCagr: -1, sharpeFloor: 0.5, maxDdCeiling: 0.99, minTimeInMarket: 0.0 },
    universes: {
      registry: [
        { symbol: 'REG-STRONG', closes: closesFor(111, up), sourceClass: 'model-estimate' }, // OOS Sharpe 3.12 -> PASS (focus)
        { symbol: 'REG-STEADY', closes: closesFor(444, up), sourceClass: 'model-estimate' }, // OOS Sharpe 2.24 -> PASS
        { symbol: 'REG-WHIP', closes: closesFor(606, whip), sourceClass: 'model-estimate' }  // OOS Sharpe -0.75 -> FAIL
      ],
      'current-watchlist': [
        { symbol: 'WL-EDGE', closes: closesFor(808, flat), sourceClass: 'model-estimate' },   // OOS Sharpe -0.12 -> FAIL (focus)
        { symbol: 'WL-CLEAN', closes: closesFor(555, up), sourceClass: 'model-estimate' },     // OOS Sharpe 2.73 -> PASS
        { symbol: 'WL-DOWN', closes: closesFor(303, down), sourceClass: 'model-estimate' }     // OOS Sharpe -0.77 -> FAIL
      ]
    }
  };
}

/* The strategy-validation owner page source, read once, so the single-source tests can assert the page delegates
   its real-data walk-forward engine to the module (RLSTRATEGY) and carries no inline copy of the extracted
   formulas. Its Bailey-Lopez de Prado deflated Sharpe stays RLVALID-owned (Feature 007) and is untouched. */
const SVL_PAGE = readFileSync(new URL('../strategy-validation-lab.html', import.meta.url), 'utf8');

/* ═══════════════════════ TP-07-01 walk-forward-validation module authority + owner primitives ═══════════════════════ */

test('TP-07-01 strategy-research module exposes the delivered walk-forward-validation adapter (owner-parity primitives)', () => {
  const sr = loadStrategyResearch();
  assert.ok(sr.supportedAdapterIds.includes('simple-adapter/walk-forward-validation/v1'), 'walk-forward-validation is a declared supported adapter');

  // seriesFromCloses: REAL closes[] -> the same engine struct the seeded lab uses (single source).
  const ramp = []; for (let i = 0; i < 200; i++) ramp.push(100 * Math.pow(1.001, i));
  const Sr = sr.seriesFromCloses(ramp);
  assert.ok(Sr && Sr.days === 199, 'seriesFromCloses: days = closes.length - 1');
  assert.ok(Math.abs(Sr.fwd[0] - 0.001) < 1e-9, 'seriesFromCloses: forward return matches the bar ratio');
  assert.equal(sr.seriesFromCloses([1, 2, 3]), null, 'seriesFromCloses rejects < 120 bars (no stub series)');

  // scorePass / allPass: the OOS goal scorecard (single source).
  const goal = { targetCagr: 0.08, sharpeFloor: 0.7, maxDdCeiling: 0.30, minTimeInMarket: 0.25 };
  assert.equal(sr.allPass(sr.scorePass({ cagr: 0.2, sharpe: 1.5, maxDd: 0.1, tim: 0.5 }, goal)), true, 'scorePass/allPass: a clearly-good OOS result passes all four targets');
  assert.equal(sr.allPass(sr.scorePass({ cagr: 0.02, sharpe: 0.3, maxDd: 0.5, tim: 0.1 }, goal)), false, 'scorePass/allPass: a weak OOS result fails');

  // walkForwardEmbargo: the embargo walk-forward engine on a deterministic strong-bull synthetic path.
  const L = { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 };
  const Sb = sr.genSeries(12345, 6, [{ frac: 1, muAnnual: 0.18, sigAnnual: 0.11 }]);
  const wf = sr.walkForwardEmbargo(Sb, L, 4, 0.6, 5);
  assert.ok(wf.oos && Number.isFinite(wf.oos.sharpe) && wf.folds.length === 4, 'walkForwardEmbargo: finite OOS Sharpe, one record per fold');
  assert.ok(wf.usable > 0 && wf.oosCurve.length > 20, 'walkForwardEmbargo: stitches usable OOS folds');
  const wfBig = sr.walkForwardEmbargo(Sb, L, 4, 0.6, 100000);
  assert.ok(wfBig.usable <= wf.usable, 'walkForwardEmbargo: a larger embargo never increases usable OOS (purge, not peek)');

  // buyHoldCurve: the benchmark equity curve (single source).
  const bh = sr.buyHoldCurve(Sb, 10, 40);
  assert.ok(Array.isArray(bh) && bh.length === 30 && bh.every((x) => Number.isFinite(x) && x > 0), 'buyHoldCurve: one positive equity point per bar');
});

test('TP-07-01 strategy-validation-lab.html single-sources the real-data walk-forward engine from strategy-research.js', () => {
  assert.match(SVL_PAGE, /rlexperience-adapters\/strategy-research\.js/, 'strategy-validation page loads strategy-research.js');
  assert.match(SVL_PAGE, /RLSTRATEGY\.walkForwardEmbargo\s*\(/, 'strategy-validation page delegates the embargo walk-forward engine to the module');
  assert.match(SVL_PAGE, /RLSTRATEGY\.seriesFromCloses\s*\(/, 'strategy-validation page delegates seriesFromCloses to the module');
  assert.match(SVL_PAGE, /RLSTRATEGY\.scorePass\s*\(/, 'strategy-validation page delegates scorePass to the module');
  assert.match(SVL_PAGE, /RLSTRATEGY\.allPass\s*\(/, 'strategy-validation page delegates allPass to the module');
  assert.match(SVL_PAGE, /RLSTRATEGY\.mulberry32\s*\(/, 'strategy-validation page delegates the demo PRNG to the module');
  // The single owner source lives in strategy-research.js; the page must carry no inline copy of the extracted formulas.
  assert.equal(/var warm = Math\.max\(L\.slow, L\.momLookback, VOL_WIN\) \+ 1;/.test(SVL_PAGE), false, 'strategy-validation page has no inline backtest/walkForward warm-up formula');
  assert.equal(/var pnl = want \* S\.fwd\[i\];/.test(SVL_PAGE), false, 'strategy-validation page has no inline backtest pnl formula');
  assert.equal(/out\.oos\.sharpe = out\.meanOos;/.test(SVL_PAGE), false, 'strategy-validation page has no inline walkForward OOS-headline formula');
  // The Bailey-Lopez de Prado deflated Sharpe stays RLVALID-owned (Feature 007) — the module never re-implements it.
  const sr = loadStrategyResearch();
  assert.equal(typeof sr.deflatedSharpe, 'undefined', 'the module does not export a deflatedSharpe (Power owns Bailey-LdP via RLVALID)');
});

/* ═══════════════════════ TP-07-01 walk-forward-validation adapter runtime + owner parity ═══════════════════════ */

test('TP-07-01 walk-forward-validation adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-validation-lab');
  const runtime = runtimeFor(api, definition);
  const results = sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/walk-forward-validation/v1'].ok, true, JSON.stringify(results['simple-adapter/walk-forward-validation/v1'].error || {}));

  const owner = walkForwardValidationOwnerFixture(sr);
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T22:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.rule, 'trend', 'default rule is trend');
  assert.equal(summary.universe, 'registry', 'default universe is registry');
  assert.ok(summary.validation && summary.validation.focusSymbol === 'REG-STRONG', 'the first registry instrument with data is the validation focus');
  assert.ok(summary.outOfSample && Array.isArray(summary.outOfSample.perFold) && summary.outOfSample.perFold.length === base.folds, 'outOfSample carries one entry per fold');
  assert.ok(summary.robustness && summary.robustness.instrumentCount === 3, 'the registry universe carries three instruments');
  assert.ok(summary.deflatedEvidence && typeof summary.deflatedEvidence.deflatedSharpe === 'number', 'deflatedEvidence carries a numeric surviving Sharpe');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // The registry heldFraction is a genuine 2/3 (two up-trend instruments hold the time-in-market gate; the bear fails).
  assert.equal(summary.robustness.withData, 3, 'all three registry instruments have data');
  assert.equal(summary.robustness.held, 2, 'exactly the two up-trend instruments hold the goal (the bear fails the time-in-market gate)');
  assert.equal(summary.robustness.heldFraction, Math.round((2 / 3) * 1e6) / 1e6, 'registry heldFraction is 2/3');
  assert.equal(summary.robustness.robust, true, 'a 2/3 held fraction clears the default 0.6 robustness threshold');

  // Owner parity: the focus validation gross OOS equals the module walkForwardEmbargo run DIRECTLY on the frozen
  // focus closes at the default (trend = identity) rule levers, folds, trainRatio and embargo (single source).
  const focusCloses = owner.universes.registry[0].closes;
  const directWf = sr.walkForwardEmbargo(sr.seriesFromCloses(focusCloses), owner.startLevers, base.folds, owner.trainRatio, base.embargo);
  assert.equal(summary.validation.gross.sharpe, Math.round(directWf.oos.sharpe * 1e6) / 1e6, 'focus gross OOS Sharpe is single-sourced from walkForwardEmbargo');
  assert.equal(summary.validation.gross.cagr, Math.round(directWf.oos.cagr * 1e6) / 1e6, 'focus gross OOS CAGR is single-sourced from walkForwardEmbargo');
  assert.deepEqual(summary.validation.appliedLevers, owner.startLevers, 'the trend rule uses the owner base levers verbatim (identity override)');
});

test('TP-07-01 each enabled walk-forward-validation parameter changes its declared output path with genuine computed content', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-validation-lab');
  const runtime = runtimeFor(api, definition);
  sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: walkForwardValidationOwnerFixture(sr) },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T22:02:00.000Z'
  }));
  const baseSummary = prepared.current.output.values.summary;

  const cases = [
    ['rule', 'momentum', 'summary.validation'],
    ['universe', 'current-watchlist', 'summary.robustness'],
    ['folds', 8, 'summary.outOfSample'],
    ['embargo', 20, 'summary.outOfSample'],
    ['cost', 60, 'summary.validation'],
    ['trial-count', 300, 'summary.deflatedEvidence'],
    ['robustness-threshold', 0.9, 'summary.robustness']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T22:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:03:30.000Z' });
  }

  // Genuine computed effects (not merely echoed parameters):
  // rule genuinely applies different levers (momentum halves the momentum lookback), driving a different backtest.
  const byRule = requireValue(await runtime.recompute({ parameterValues: { ...base, rule: 'momentum' }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:04:00.000Z' })).current.output.values.summary;
  assert.equal(byRule.validation.appliedLevers.momLookback, Math.max(20, Math.round(baseSummary.validation.appliedLevers.momLookback * 0.5)), 'the momentum rule genuinely halves the momentum-lookback lever');
  assert.notDeepEqual(byRule.validation.appliedLevers, baseSummary.validation.appliedLevers, 'the momentum rule genuinely uses different levers than trend');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:04:15.000Z' });

  // universe genuinely swaps the held instrument set (registry 2/3 -> watchlist 1/3).
  const byUniverse = requireValue(await runtime.recompute({ parameterValues: { ...base, universe: 'current-watchlist' }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:04:30.000Z' })).current.output.values.summary;
  assert.deepEqual(byUniverse.robustness.perInstrument.map((r) => r.symbol), ['WL-EDGE', 'WL-CLEAN', 'WL-DOWN'], 'the watchlist universe genuinely evaluates a different instrument set');
  assert.ok(byUniverse.robustness.heldFraction < baseSummary.robustness.heldFraction, 'the watchlist universe genuinely holds fewer instruments than the registry');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:04:45.000Z' });

  // folds genuinely changes the per-fold structure.
  const byFolds = requireValue(await runtime.recompute({ parameterValues: { ...base, folds: 8 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:05:00.000Z' })).current.output.values.summary;
  assert.equal(byFolds.outOfSample.perFold.length, 8, 'raising folds genuinely produces eight per-fold records');
  assert.notEqual(byFolds.outOfSample.meanOos, baseSummary.outOfSample.meanOos, 'raising folds genuinely changes the mean OOS Sharpe');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:05:15.000Z' });

  // embargo genuinely purges leakage — a larger embargo never leaves MORE usable OOS.
  const byEmbargo = requireValue(await runtime.recompute({ parameterValues: { ...base, embargo: 25 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:05:30.000Z' })).current.output.values.summary;
  assert.ok(byEmbargo.outOfSample.usable <= baseSummary.outOfSample.usable, 'a larger embargo genuinely never increases usable OOS (purge, not peek)');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:05:45.000Z' });

  // cost genuinely reduces the net OOS edge (higher round-trip cost -> lower net Sharpe and net CAGR).
  const byCost = requireValue(await runtime.recompute({ parameterValues: { ...base, cost: 80 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:06:00.000Z' })).current.output.values.summary;
  assert.ok(byCost.validation.net.sharpe < baseSummary.validation.net.sharpe, 'a higher trading cost genuinely lowers the net OOS Sharpe');
  assert.ok(byCost.validation.net.cagr < baseSummary.validation.net.cagr, 'a higher trading cost genuinely lowers the net OOS CAGR');
  assert.ok(byCost.validation.gross.sharpe === baseSummary.validation.gross.sharpe, 'the gross OOS is unchanged by cost (cost is an explicit post-hoc drag, not a formula change)');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:06:15.000Z' });

  // trial-count genuinely deflates the surviving Sharpe (more variants tried -> a larger multiple-testing discount).
  const byTrials = requireValue(await runtime.recompute({ parameterValues: { ...base, 'trial-count': 500 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:06:30.000Z' })).current.output.values.summary;
  assert.ok(byTrials.deflatedEvidence.discount > baseSummary.deflatedEvidence.discount, 'more trials genuinely raise the multiple-testing discount');
  assert.ok(Math.abs(byTrials.deflatedEvidence.deflatedSharpe) <= Math.abs(baseSummary.deflatedEvidence.deflatedSharpe), 'more trials genuinely shrink the surviving Sharpe toward zero');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:06:45.000Z' });

  // robustness-threshold genuinely gates the robust verdict around the actual held fraction. The registry held
  // fraction is a deterministic 2/3 (≈0.667); step-aligned thresholds 0.65 and 0.70 straddle it (domain step 0.05).
  const held = baseSummary.robustness.heldFraction;
  assert.ok(held > 0.65 && held < 0.70, 'the fixture held fraction (2/3) sits strictly between the 0.65 and 0.70 thresholds');
  const strict = requireValue(await runtime.recompute({ parameterValues: { ...base, 'robustness-threshold': 0.70 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:07:00.000Z' })).current.output.values.summary;
  assert.equal(strict.robustness.robust, false, 'a 0.70 threshold above the 2/3 held fraction genuinely fails the robustness verdict');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:07:15.000Z' });
  const loose = requireValue(await runtime.recompute({ parameterValues: { ...base, 'robustness-threshold': 0.65 }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:07:30.000Z' })).current.output.values.summary;
  assert.equal(loose.robustness.robust, true, 'a 0.65 threshold below the 2/3 held fraction genuinely passes the robustness verdict');
  await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-26T22:07:45.000Z' });
});

test('TP-07-01 walk-forward-validation is deterministic (non-seeded) and preserves the no-data gap without zero-filling', async () => {
  const api = loadProductionApi();
  const sr = loadStrategyResearch();
  const definition = definitionFor('strategy-validation-lab');
  const base = defaultValues(definition);

  async function runOnce() {
    const runtime = runtimeFor(api, definition);
    sr.registerStrategyResearchAdapters(runtime, api, [definition]);
    return requireValue(await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: walkForwardValidationOwnerFixture(sr) },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T22:02:00.000Z'
    }));
  }
  const first = await runOnce();
  const again = await runOnce();
  assert.equal(first.computeIdentity, again.computeIdentity, 'identical inputs => identical compute identity (no seed, pure over the frozen universe)');
  assert.equal(
    api.fingerprint(first.current.output.values.summary),
    api.fingerprint(again.current.output.values.summary),
    'identical inputs => identical owner summary (deterministic)'
  );

  // A universe instrument with too few closes is reported as no-data, never zero-filled into a fake OOS result.
  const owner = walkForwardValidationOwnerFixture(sr);
  owner.universes.registry.push({ symbol: 'REG-THIN', closes: owner.universes.registry[0].closes.slice(0, 60), sourceClass: 'model-estimate' });
  const runtime = runtimeFor(api, definition);
  sr.registerStrategyResearchAdapters(runtime, api, [definition]);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-26T22:08:00.000Z'
  }));
  const robustness = prepared.current.output.values.summary.robustness;
  const thin = robustness.perInstrument.find((r) => r.symbol === 'REG-THIN');
  assert.ok(thin && thin.withData === false && thin.held === false && thin.oosSharpe === null, 'the thin instrument is reported no-data (null OOS), never zero-filled');
  assert.equal(robustness.withData, 3, 'the thin instrument is excluded from the with-data count, not counted as a failed hold');
});
