import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clone, loadProductionApi, readJson } from './tool-experience.support.mjs';

/*
 * TP-06-01 — Feature 012 Scope 06 macro/rotation/fundamental Simple-adapter unit contracts.
 *
 * This suite proves the delivered Scope-06 adapters (macro-rotation.js + fundamental-models.js)
 * at genuine owner-parity: the pure owner primitives are the SINGLE SOURCE that BOTH the owning
 * page's Power path AND the registered Simple adapter consume (no inline formula copy on the
 * page), every declared parameter provably moves its declared output path, and neither module
 * touches any fetch/provider/storage/cross-domain authority.
 *
 * Delivered so far: sector-rotation-transition/v1 (sector-research-lab). The remaining Scope-06
 * definitions are declared in simple-models.json (Scope 01) and land incrementally; a tool whose
 * owner seam is not yet extracted is simply absent from the module's supportedAdapterIds, so this
 * suite asserts only over the delivered set.
 */

const require = createRequire(import.meta.url);

function loadMacroRotation() {
  const path = require.resolve('../rlexperience-adapters/macro-rotation.js');
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

/* The sector owner page source, read once, so the single-source tests can assert the page
   delegates its RRG/state/rotation compute to the module (RLMACROROTATION) and carries no inline
   formula copy. */
const SECTOR_PAGE = readFileSync(new URL('../sector-research-lab.html', import.meta.url), 'utf8');

/* ═══════════════════════ sector-rotation owner fixture ═══════════════════════
   A synthetic frozen owner snapshot engineered so every declared parameter provably moves its
   declared output path. rs series carry a distinct trend + wobble per sector (so the RRG readout
   changes with the short/long lookback), distinct SPY-vs-RSP relative series (so benchmark moves
   relative strength), distinct breadth/riskScore/accel (so each rank weight moves the rank), and
   distinct etf fit/mom (so the ETF-fit weight moves the vehicle projection). No fabricated feed —
   the adapter recomputes only from these frozen owner facts through the single-source primitives. */
function rsSeries(slope, wobble, tilt) {
  const out = [];
  for (let i = 0; i < 200; i += 1) {
    const trend = 1 + slope * (i / 200);
    const wob = wobble * Math.sin(i / 9);
    out.push(Math.round((trend + wob + tilt) * 1e6) / 1e6);
  }
  return out;
}

function sectorOwnerFixture() {
  return {
    contractVersion: 'sector-rotation-owner-state/v1',
    toolId: 'sector-research-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmarks: ['SPY', 'RSP'],
    sectors: [
      { id: 'XLK', label: 'Technology', rs: { SPY: rsSeries(0.42, 0.05, 0.00), RSP: rsSeries(0.30, 0.06, 0.04) }, x3: 0.08, breadthPct50: 0.70, riskScore: 1, etf: { ticker: 'XLK', fit: 0.82, mom: 0.61 } },
      { id: 'XLE', label: 'Energy', rs: { SPY: rsSeries(-0.28, 0.07, 0.00), RSP: rsSeries(-0.20, 0.05, 0.05) }, x3: -0.05, breadthPct50: 0.30, riskScore: 4, etf: { ticker: 'XLE', fit: 0.44, mom: 0.58 } },
      { id: 'XLV', label: 'Health Care', rs: { SPY: rsSeries(0.10, 0.09, 0.00), RSP: rsSeries(0.16, 0.04, 0.03) }, x3: 0.02, breadthPct50: 0.52, riskScore: 2, etf: { ticker: 'XLV', fit: 0.63, mom: 0.49 } }
    ]
  };
}

/* ═══════════════════════ TP-06-01 module authority + primitives ═══════════════════════ */

test('TP-06-01 macro-rotation module exposes the delivered sector-rotation adapter with no forbidden authority', () => {
  const mr = loadMacroRotation();
  assert.ok(mr.supportedAdapterIds.includes('simple-adapter/sector-rotation-transition/v1'), 'sector-rotation-transition is a declared supported adapter');
  const raw = readFileSync(new URL('../rlexperience-adapters/macro-rotation.js', import.meta.url), 'utf8');
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
    /data\/options/,
    /data\/bars/,
    /rlexperience-adapters\/(market-structure|options|fundamental-models|strategy-research|property-research|market-action)/
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `macro-rotation.js must not contain ${pattern}`);
  }
});

test('TP-06-01 macro-rotation owner primitives pin the single-source RRG/state/rotation formula', () => {
  const mr = loadMacroRotation();

  // rollZ100: rolling z-score → 100 + (x - mean)/sd over the last L finite values (global isFinite,
  // sample stdev, minN = max(8, floor(L/2))). Byte-identical to the sector page's rollZ100.
  const flat = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const flatZ = mr.rollZ100(flat, 10); // minN = max(8, 5) = 8 → first 7 points are NaN (short window)
  assert.ok(Number.isNaN(flatZ[0]) && Number.isNaN(flatZ[6]), 'points with < minN finite lookback are NaN');
  assert.deepEqual(flatZ.slice(7), [100, 100, 100], 'a flat (sd 0) full window pins z to 100');
  const ramp = [];
  for (let i = 0; i < 20; i += 1) ramp.push(i);
  const z = mr.rollZ100(ramp, 10);
  assert.ok(!Number.isFinite(z[0]) === true || Number.isNaN(z[0]), 'insufficient-window points are NaN (minN guard)');
  assert.ok(Number.isFinite(z[19]) && z[19] > 100, 'a rising last value sits above its trailing mean (z > 100)');

  // rrgQuadrant: the RRG quadrant classifier (owner formula, no copy on the page).
  assert.equal(mr.rrgQuadrant(101, 101), 'L', 'ratio>=100 & mom>=100 => Leading');
  assert.equal(mr.rrgQuadrant(101, 99), 'W', 'ratio>=100 & mom<100 => Weakening');
  assert.equal(mr.rrgQuadrant(99, 101), 'I', 'ratio<100 & mom>=100 => Improving');
  assert.equal(mr.rrgQuadrant(99, 99), 'A', 'ratio<100 & mom<100 => Lagging');

  // stateLabel: quad + acceleration => the owner state label (early-turn detection preserved).
  assert.equal(mr.stateLabel('L', -0.2).t, 'Peaking ⚠', 'Leading + falling accel => Peaking');
  assert.equal(mr.stateLabel('L', 0.0).t, 'Leading', 'Leading + flat accel => Leading');
  assert.equal(mr.stateLabel('A', 0.2).t, 'Basing ↑', 'Lagging + rising accel => Basing');
  assert.equal(mr.stateLabel('A', 0.0).t, 'Lagging', 'Lagging + flat accel => Lagging');
  assert.equal(mr.stateLabel('I', 0.0).t, 'Improving ↑', 'Improving quadrant');
  assert.equal(mr.stateLabel('W', 0.0).t, 'Weakening ↓', 'Weakening quadrant');

  // backVal: change over `span` bars ending at `last` (0 when either endpoint is missing).
  assert.equal(mr.backVal([1, 2, 3, 4, 5], 2, 4), 2, 'backVal 4th - 2nd = 5 - 3 = 2');
  assert.equal(mr.backVal([1, 2, 3], 5, 2), 0, 'backVal out-of-range span => 0');

  // rotationCandidacy: the Simple into/out classifier (owner formula shared with the page).
  assert.deepEqual(mr.rotationCandidacy({ quad: 'I', state: { t: 'Improving ↑' }, accel: 0.1, x3: 0.02 }, 'confirmed'), { inTurn: true, outTurn: false }, 'Improving => into');
  assert.deepEqual(mr.rotationCandidacy({ quad: 'W', state: { t: 'Weakening ↓' }, accel: -0.1, x3: -0.02 }, 'confirmed'), { inTurn: false, outTurn: true }, 'Weakening => out');
  const strict = mr.rotationCandidacy({ quad: 'I', state: { t: 'Improving ↑' }, accel: 0.1, x3: -0.02 }, 'strict');
  assert.equal(strict.inTurn, false, 'strict requires accel>0.2 and x3>0');
  const early = mr.rotationCandidacy({ quad: 'A', state: { t: 'Lagging' }, accel: 0.05, x3: 0 }, 'early');
  assert.equal(early.inTurn, true, 'early admits an accelerating laggard');
});

test('TP-06-01 sector-research-lab.html single-sources rollZ100/rrgQuadrant/stateLabel/rotationCandidacy from macro-rotation.js', () => {
  assert.match(SECTOR_PAGE, /rlexperience-adapters\/macro-rotation\.js/, 'sector page loads macro-rotation.js');
  assert.match(SECTOR_PAGE, /RLMACROROTATION\.rollZ100\s*\(/, 'sector page delegates rollZ100 to the module');
  assert.match(SECTOR_PAGE, /RLMACROROTATION\.rrgQuadrant\s*\(/, 'sector page delegates the RRG quadrant to the module');
  assert.match(SECTOR_PAGE, /RLMACROROTATION\.stateLabel\s*\(/, 'sector page delegates the state label to the module');
  assert.match(SECTOR_PAGE, /RLMACROROTATION\.rotationCandidacy\s*\(/, 'sector page delegates the into/out classifier to the module');
  // The single owner source lives in macro-rotation.js; the page must carry no inline copy.
  assert.equal(/out\[i\] = sd \? 100 \+ \(a\[i\] - m\) \/ sd : 100/.test(SECTOR_PAGE), false, 'sector page has no inline rollZ100 formula');
  assert.equal(/rsRatio >= 100 \? \(rsMom >= 100 \? 'L' : 'W'\)/.test(SECTOR_PAGE), false, 'sector page has no inline RRG quadrant formula');
  assert.equal(/'Peaking ⚠', c: 'st-peak'/.test(SECTOR_PAGE), false, 'sector page has no inline stateLabel formula');
});

/* ═══════════════════════ TP-06-01 adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 sector-rotation adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('sector-research-lab');
  const runtime = runtimeFor(api, definition);
  const results = mr.registerMacroRotationAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/sector-rotation-transition/v1'].ok, true, JSON.stringify(results['simple-adapter/sector-rotation-transition/v1'].error || {}));

  const owner = sectorOwnerFixture();
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.benchmark, 'SPY', 'default benchmark is SPY');
  assert.equal(summary.sectorCount, 3, 'all three owner sectors are scored');
  assert.ok(summary.transition && Array.isArray(summary.transition.sectors) && summary.transition.sectors.length === 3, 'transition carries a per-sector RRG readout');
  assert.ok(Array.isArray(summary.rank) && summary.rank.length === 3, 'rank carries every scored sector');
  assert.ok(summary.relativeStrength && Array.isArray(summary.relativeStrength.leaders), 'relativeStrength carries benchmark-relative leaders');
  assert.ok(summary.vehicle && typeof summary.vehicle.projection === 'number', 'vehicle carries an ETF-fit projection');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the adapter's per-sector RRG readout equals the module primitives run directly on
  // the frozen owner rs series at the default lookbacks (single source, no re-implementation).
  owner.sectors.forEach((sector) => {
    const kernel = mr.rrgReadout(sector.rs.SPY, base['short-lookback'], base['long-lookback']);
    const view = summary.transition.sectors.find((entry) => entry.id === sector.id);
    assert.equal(view.quad, kernel.quad, `${sector.id} quad is single-sourced from rrgReadout`);
    assert.equal(view.rsRatio, Math.round(kernel.rsRatio * 1e4) / 1e4, `${sector.id} rsRatio parity`);
    assert.equal(view.rsMom, Math.round(kernel.rsMom * 1e4) / 1e4, `${sector.id} rsMom parity`);
  });
});

test('TP-06-01 each enabled sector-rotation parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('sector-research-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: sectorOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['short-lookback', 42, 'summary.transition'],
    ['long-lookback', 63, 'summary.transition'],
    ['acceleration-weight', 0.6, 'summary.rank'],
    ['breadth-weight', 0.6, 'summary.rank'],
    ['risk-weight', 0.6, 'summary.rank'],
    ['benchmark', 'RSP', 'summary.relativeStrength'],
    ['etf-fit-weight', 0.6, 'summary.vehicle']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    // Restore baseline for the next isolated one-at-a-time change.
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:30.000Z' });
  }
});

test('TP-06-01 sector-rotation compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('sector-research-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: sectorOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  const again = requireValue(await runtime.recompute({
    parameterValues: { ...base },
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:30.000Z'
  }));
  assert.equal(
    api.fingerprint(first.current.output.values.summary),
    api.fingerprint(again.current.output.values.summary),
    'identical inputs => identical owner summary'
  );
});

/* ═══════════════════════ country-rotation owner fixture (global-rotation-lab) ═══════════════════════
   A synthetic frozen owner snapshot engineered so every declared parameter provably moves its
   declared output path. Per country: distinct rel21/rel63/rel126 (so each horizon weight moves the
   momentum blend and hence the queue), distinct non-zero fxScore (so the FX weight moves the queue),
   distinct vol (so the volatility penalty moves the queue), distinct daily row shapes (so pairwise
   correlation differs and the diversification weight moves the queue), and distinct local-close ages
   straddling the max-age band (so the local-close-max-age control flips a country's freshness). No
   fabricated feed — the adapter recomputes only from these frozen owner facts, single-sourcing the
   correlation formula from RLMACROROTATION.globalPairCorrelation. */
const GLOBAL_ROTATION_PAGE = readFileSync(new URL('../global-rotation-lab.html', import.meta.url), 'utf8');

function countryRows(seed, drift, wobble) {
  const rows = [];
  const base = Date.UTC(2026, 3, 1);
  let close = 100;
  for (let i = 0; i < 90; i += 1) {
    close = close * (1 + drift + wobble * Math.sin((i + seed) / 5));
    rows.push({ t: base + i * 864e5, c: Math.round(close * 1e4) / 1e4 });
  }
  return rows;
}

function countryOwnerFixture() {
  return {
    contractVersion: 'country-rotation-owner-state/v1',
    toolId: 'global-rotation-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmark: 'ACWI',
    countries: [
      { id: 'EWY', label: 'South Korea', rel21: 6, rel63: 3, rel126: 1, fxScore: 0.5, vol: 0.25, drawdown: 0.12, trendScore: 0.4, localCloseAgeHours: 2, rows: countryRows(0, 0.004, 0.010) },
      { id: 'EWG', label: 'Germany', rel21: -2, rel63: 4, rel126: 8, fxScore: -0.3, vol: 0.35, drawdown: 0.22, trendScore: 0.1, localCloseAgeHours: 12, rows: countryRows(7, -0.002, 0.014) },
      { id: 'EWZ', label: 'Brazil', rel21: 1, rel63: -1, rel126: 2, fxScore: 0.1, vol: 0.15, drawdown: 0.30, trendScore: -0.2, localCloseAgeHours: 30, rows: countryRows(3, 0.001, 0.020) }
    ]
  };
}

/* ═══════════════════════ TP-06-01 country-rotation module authority + primitives ═══════════════════════ */

test('TP-06-01 macro-rotation module exposes the country-rotation adapter with single-sourced correlation + horizon momentum', () => {
  const mr = loadMacroRotation();
  assert.ok(mr.supportedAdapterIds.includes('simple-adapter/country-rotation/v1'), 'country-rotation/v1 is a declared supported adapter');
  assert.equal(typeof mr.globalPairCorrelation, 'function', 'globalPairCorrelation owner primitive is single-sourced in the module');
  assert.equal(typeof mr.countryHorizonMomentum, 'function', 'countryHorizonMomentum horizon-weighted momentum is exported');
  assert.equal(typeof mr.computeCountryRotationSummary, 'function', 'computeCountryRotationSummary is exported');
});

test('TP-06-01 globalPairCorrelation single-source pins Pearson correlation over aligned daily returns', () => {
  const mr = loadMacroRotation();
  const a = countryRows(0, 0.003, 0.012);
  const b = countryRows(0, 0.003, 0.012);
  assert.ok(Math.abs(mr.globalPairCorrelation(a, b, 63) - 1) < 1e-9, 'identical series => correlation 1');
  const opp = a.map((row, i) => ({ t: row.t, c: 200 - row.c }));
  assert.ok(mr.globalPairCorrelation(a, opp, 63) < 0, 'a mirror-image series is negatively correlated');
  assert.equal(mr.globalPairCorrelation([{ t: 1, c: 1 }], [{ t: 1, c: 1 }], 63), null, 'a <12-key overlap stays null (never fabricated)');
});

test('TP-06-01 countryHorizonMomentum blends the three horizon relatives under explicit weights', () => {
  const mr = loadMacroRotation();
  // Only the short horizon is positive; a short-heavy weight lifts the blend above a long-heavy one.
  const shortHeavy = mr.countryHorizonMomentum(8, 0, -8, { short: 0.8, medium: 0.1, long: 0.1 });
  const longHeavy = mr.countryHorizonMomentum(8, 0, -8, { short: 0.1, medium: 0.1, long: 0.8 });
  assert.ok(shortHeavy > longHeavy, 'weighting the positive short horizon outranks weighting the negative long horizon');
  // Missing / non-positive weights are ignored, never defaulted to a neutral fill.
  assert.equal(mr.countryHorizonMomentum(null, null, null, { short: 0.3, medium: 0.4, long: 0.3 }), null, 'no finite relative => null (no fabricated neutral)');
  assert.ok(Number.isFinite(mr.countryHorizonMomentum(5, null, null, { short: 0.3, medium: 0, long: 0 })), 'a single finite horizon with weight still blends');
});

test('TP-06-01 global-rotation-lab.html single-sources globalPairCorrelation from macro-rotation.js', () => {
  assert.match(GLOBAL_ROTATION_PAGE, /rlexperience-adapters\/macro-rotation\.js/, 'global-rotation page loads macro-rotation.js');
  assert.match(GLOBAL_ROTATION_PAGE, /RLMACROROTATION\.globalPairCorrelation\s*\(/, 'global-rotation page delegates the pairwise correlation to the module');
  // The single owner source lives in macro-rotation.js; the page must carry no inline correlation copy.
  assert.equal(/covariance \/ Math\.sqrt\(varianceA \* varianceB\)/.test(GLOBAL_ROTATION_PAGE), false, 'global-rotation page has no inline pairwise-correlation formula');
});

/* ═══════════════════════ TP-06-01 country-rotation adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 country-rotation adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('global-rotation-lab');
  const runtime = runtimeFor(api, definition);
  const results = mr.registerMacroRotationAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/country-rotation/v1'].ok, true, JSON.stringify(results['simple-adapter/country-rotation/v1'].error || {}));

  const owner = countryOwnerFixture();
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.benchmark, 'ACWI', 'benchmark is carried from the frozen owner state');
  assert.ok(Array.isArray(summary.queue) && summary.queue.length === 3, 'queue carries every priced country');
  assert.ok(summary.freshness && Array.isArray(summary.freshness.countries) && summary.freshness.countries.length === 3, 'freshness carries a per-country local-close state');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: each queue entry's momentum equals the module horizon-momentum primitive run
  // directly on the frozen owner relatives at the default weights (single source, no re-implementation).
  const weights = { short: base['short-horizon-weight'], medium: base['medium-horizon-weight'], long: base['long-horizon-weight'] };
  owner.countries.forEach((country) => {
    const entry = summary.queue.find((q) => q.id === country.id);
    const momentum = mr.countryHorizonMomentum(country.rel21, country.rel63, country.rel126, weights);
    assert.equal(entry.momentum, Math.round(momentum * 1e6) / 1e6, `${country.id} momentum is single-sourced from countryHorizonMomentum`);
  });
});

test('TP-06-01 each enabled country-rotation parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('global-rotation-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: countryOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['short-horizon-weight', 0.5, 'summary.queue'],
    ['medium-horizon-weight', 0.6, 'summary.queue'],
    ['long-horizon-weight', 0.5, 'summary.queue'],
    ['fx-weight', 0.5, 'summary.queue'],
    ['local-close-max-age', 6, 'summary.freshness'],
    ['volatility-penalty', 0.5, 'summary.queue'],
    ['diversification-weight', 0.5, 'summary.queue']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    await runtime.recompute({ parameterValues: { ...base }, seed: null, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:30.000Z' });
  }
});

test('TP-06-01 country-rotation compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('global-rotation-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: countryOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  const again = requireValue(await runtime.recompute({
    parameterValues: { ...base },
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:30.000Z'
  }));
  assert.equal(
    api.fingerprint(first.current.output.values.summary),
    api.fingerprint(again.current.output.values.summary),
    'identical inputs => identical owner summary'
  );
});
