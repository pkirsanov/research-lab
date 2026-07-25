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

/* ═══════════════════════ real-asset-driver owner fixture (real-assets-lab) ═══════════════════════
   A synthetic frozen owner snapshot engineered so every declared parameter provably moves its
   declared output path. The selected asset carries a distinct owner score / volatility / drawdown
   (so the volatility-penalty moves summary.score and the drawdown-limit moves summary.riskState),
   the universe-level driver deltas are non-zero and mid-range (so the USD / rate / risk shocks each
   move summary.driverState through the bounded scenario tilt without clamping), and the frozen
   commodity-breadth returns straddle zero (so the single-sourced realBreadthPct moves
   summary.confirmation with the breadth threshold). No fabricated feed — the adapter recomputes only
   from these frozen owner facts, single-sourcing the breadth formula from RLMACROROTATION.realBreadthPct. */
const REAL_ASSETS_PAGE = readFileSync(new URL('../real-assets-lab.html', import.meta.url), 'utf8');

function realAssetOwnerFixture() {
  return {
    contractVersion: 'real-asset-driver-owner-state/v1',
    toolId: 'real-assets-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmark: 'DBC',
    selected: 'GLD',
    drivers: { uup63: -3, tlt63: 5, tip63: 7, qqq63: 8, xle63: 4, xli63: 3, dbc63: 2, gld63: 6, btc63: 12, goldSilverRatio63: -4 },
    breadthReturns: [8, -3, 5, -1, 6, -2],
    assets: [
      { id: 'GLD', label: 'Gold', model: 'gold', trendScore: 70, volatility: 16, drawdown: 8, ownerScore: 68, riskPenalty: 3 },
      { id: 'BTC-USD', label: 'Bitcoin', model: 'bitcoin', trendScore: 62, volatility: 48, drawdown: 22, ownerScore: 55, riskPenalty: 9 },
      { id: 'DBC', label: 'Broad commodities', model: 'broad', trendScore: 54, volatility: 22, drawdown: 12, ownerScore: 50, riskPenalty: 5 }
    ]
  };
}

/* ═══════════════════════ TP-06-01 real-asset-driver module authority + primitives ═══════════════════════ */

test('TP-06-01 macro-rotation module exposes the real-asset-driver adapter with single-sourced breadth + scenario tilt', () => {
  const mr = loadMacroRotation();
  assert.ok(mr.supportedAdapterIds.includes('simple-adapter/real-asset-driver/v1'), 'real-asset-driver/v1 is a declared supported adapter');
  assert.equal(typeof mr.realBreadthPct, 'function', 'realBreadthPct owner primitive is single-sourced in the module');
  assert.equal(typeof mr.realAssetDriverScenario, 'function', 'realAssetDriverScenario bounded scenario tilt is exported');
  assert.equal(typeof mr.computeRealAssetDriverSummary, 'function', 'computeRealAssetDriverSummary is exported');
});

test('TP-06-01 realBreadthPct single-source pins the commodity-breadth percentage', () => {
  const mr = loadMacroRotation();
  // Byte-parity with the real-assets-lab breadthScore reduction: of the finite returns, the fraction
  // that are positive, times 100.
  assert.equal(mr.realBreadthPct([8, -3, 5, -1, 6, -2]), 3 / 6 * 100, 'three of six positive => 50%');
  assert.equal(mr.realBreadthPct([1, 2, 3]), 100, 'all positive => 100%');
  assert.equal(mr.realBreadthPct([-1, -2, -3]), 0, 'all negative => 0%');
  // Missing/non-finite returns are ignored, never counted as a zero — an all-missing set is null.
  assert.equal(mr.realBreadthPct([null, undefined, NaN]), null, 'no finite return => null (no fabricated breadth)');
  assert.equal(mr.realBreadthPct([4, null, -2]), 50, 'non-finite entries are excluded from the denominator');
});

test('TP-06-01 realAssetDriverScenario applies bounded USD/rate/risk shocks to the frozen driver mix', () => {
  const mr = loadMacroRotation();
  const drivers = { uup63: -3, tlt63: 5, tip63: 7, qqq63: 8 };
  const flat = mr.realAssetDriverScenario(drivers, { usd: 0, rate: 0, risk: 0 });
  // A positive USD shock strengthens the dollar => the inverse-USD tilt falls => a lower composite tilt.
  const usdUp = mr.realAssetDriverScenario(drivers, { usd: 8, rate: 0, risk: 0 });
  assert.ok(usdUp.tilt < flat.tilt, 'a stronger dollar lowers the composite driver tilt');
  // A positive risk-appetite shock lifts the risk component => a higher composite tilt.
  const riskUp = mr.realAssetDriverScenario(drivers, { usd: 0, rate: 0, risk: 0.6 });
  assert.ok(riskUp.tilt > flat.tilt, 'a higher risk appetite lifts the composite driver tilt');
  // Missing drivers contribute nothing rather than a fabricated neutral score.
  const empty = mr.realAssetDriverScenario({}, { usd: 5, rate: 5, risk: 0.5 });
  assert.equal(empty.tilt, 0, 'no finite driver => a zero tilt, not a fabricated fill');
});

test('TP-06-01 real-assets-lab.html single-sources realBreadthPct from macro-rotation.js', () => {
  assert.match(REAL_ASSETS_PAGE, /rlexperience-adapters\/macro-rotation\.js/, 'real-assets page loads macro-rotation.js');
  assert.match(REAL_ASSETS_PAGE, /RLMACROROTATION\.realBreadthPct\s*\(/, 'real-assets page delegates the breadth percentage to the module');
  // The single owner source lives in macro-rotation.js; the page must carry no inline breadth formula.
  assert.equal(/return sum \+ value; \}, 0\) \/ values\.length \* 100/.test(REAL_ASSETS_PAGE), false, 'real-assets page has no inline breadth-percentage formula');
});

/* ═══════════════════════ TP-06-01 real-asset-driver adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 real-asset-driver adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('real-assets-lab');
  const runtime = runtimeFor(api, definition);
  const results = mr.registerMacroRotationAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/real-asset-driver/v1'].ok, true, JSON.stringify(results['simple-adapter/real-asset-driver/v1'].error || {}));

  const owner = realAssetOwnerFixture();
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
  assert.equal(summary.benchmark, 'DBC', 'benchmark is carried from the frozen owner state');
  assert.equal(summary.selected, 'GLD', 'the frozen selected asset drives the scenario');
  assert.ok(summary.driverState && typeof summary.driverState.tilt === 'number', 'driverState carries a bounded scenario tilt');
  assert.ok(typeof summary.score === 'number', 'score carries a bounded scenario score');
  assert.ok(summary.riskState && typeof summary.riskState.state === 'string', 'riskState carries a drawdown-limit state');
  assert.ok(summary.confirmation && typeof summary.confirmation.state === 'string', 'confirmation carries a breadth state');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the confirmation breadth equals the single-sourced module breadth primitive run
  // directly on the frozen commodity-breadth returns (single source, no re-implementation).
  assert.equal(summary.confirmation.breadth, Math.round(mr.realBreadthPct(owner.breadthReturns) * 1e4) / 1e4, 'confirmation breadth is single-sourced from realBreadthPct');
});

test('TP-06-01 each enabled real-asset-driver parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('real-assets-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: realAssetOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['usd-shock', 6, 'summary.driverState'],
    ['rate-shock', 120, 'summary.driverState'],
    ['risk-appetite', 0.6, 'summary.driverState'],
    ['volatility-penalty', 0.6, 'summary.score'],
    ['drawdown-limit', 6, 'summary.riskState'],
    ['breadth-threshold', 50, 'summary.confirmation']
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

test('TP-06-01 real-asset-driver compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('real-assets-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: realAssetOwnerFixture() },
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

/* ═══════════════════════ fixed-income-sleeve owner fixture (bond-regime-lab) ═══════════════════════
   A synthetic frozen owner snapshot engineered so every declared parameter provably moves its
   declared output path. The sleeves carry distinct rate/spread durations and convexity so the same
   scenario yields a distinct total per sleeve (the ranking moves with horizon/rate-shock/spread-
   shock/carry/convexity), at least one sleeve is spread-bearing (so the spread-shock moves the
   spread-bearing outcomes), and the frozen regime carries a non-zero real-yield/breakeven change and
   a mid-range credit confirmation (so the inflation/real-yield/confirmation controls move the regime
   read). No fabricated feed — the adapter recomputes only from these frozen owner facts, single-
   sourcing the sleeve total-return decomposition from RLMACROROTATION.sleeveTotalReturn. The base
   carries a non-zero rate/spread shock so the convexity term (0.5·convexity·combinedShock²) binds. */
const BOND_PAGE = readFileSync(new URL('../bond-regime-lab.html', import.meta.url), 'utf8');

function bondSleeveOwnerFixture() {
  return {
    contractVersion: 'fixed-income-sleeve-owner-state/v1',
    toolId: 'bond-regime-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    regime: { realYieldChangeBp: 14, breakevenChangeBp: -9, creditConfirmation: 0.55 },
    sleeves: [
      { id: 'long-treasury', label: 'Long Treasury', rateDuration: 17, spreadDuration: 0, convexity: 3.2, rateShockKind: 'nominal', spreadShockKind: 'none', carry: 4.2 },
      { id: 'investment-grade-corporate', label: 'IG Corporate', rateDuration: 7, spreadDuration: 6.5, convexity: 0.8, rateShockKind: 'nominal', spreadShockKind: 'ig', carry: 5.4 },
      { id: 'high-yield-corporate', label: 'HY Corporate', rateDuration: 3.5, spreadDuration: 4, convexity: 0.4, rateShockKind: 'nominal', spreadShockKind: 'hy', carry: 7.8 },
      { id: 'tips', label: 'TIPS', rateDuration: 7.5, spreadDuration: 0, convexity: 0.6, rateShockKind: 'real-derived', spreadShockKind: 'none', carry: 3.1 }
    ]
  };
}

/* The bond scenario baseline carries a non-zero rate/spread shock so the convexity term binds and
   the convexity control provably moves the sleeve outcomes (with a zero combined shock the owner
   convexity term is identically zero, which would be a hidden flat region). */
function bondBase(definition) {
  return { ...defaultValues(definition), 'rate-shock': 40, 'spread-shock': 20 };
}

/* ═══════════════════════ TP-06-01 fixed-income-sleeve module authority + primitive ═══════════════════════ */

test('TP-06-01 macro-rotation module exposes the fixed-income-sleeve adapter with the single-sourced sleeve total-return', () => {
  const mr = loadMacroRotation();
  assert.ok(mr.supportedAdapterIds.includes('simple-adapter/fixed-income-sleeve/v1'), 'fixed-income-sleeve/v1 is a declared supported adapter');
  assert.equal(typeof mr.sleeveTotalReturn, 'function', 'sleeveTotalReturn owner primitive is single-sourced in the module');
  assert.equal(typeof mr.computeFixedIncomeSleeveSummary, 'function', 'computeFixedIncomeSleeveSummary is exported');
});

test('TP-06-01 sleeveTotalReturn single-source pins the owner carry+rate+spread+convexity decomposition', () => {
  const mr = loadMacroRotation();
  // Byte-parity with the bond-regime-lab.html calculateScenarioResult decomposition, computed with
  // the EXACT owner operations: carry = pctToDecimal(carry)·horizon/12, rate = −rateDuration·rateShock,
  // spread = −spreadDuration·spreadShock, convexity = 0.5·convexity·combinedShock². The inline expected
  // is the exact float arithmetic; the rounded expected pins the independent hand-computed value.
  const carryDec = 5 / 100, rateShock = 50 / 10000, spreadShock = 30 / 10000;
  const expCarry = carryDec * 6 / 12;
  const expRate = -7 * rateShock;
  const expSpread = -6 * spreadShock;
  const expConvexity = 0.5 * 1.5 * (rateShock + spreadShock) * (rateShock + spreadShock);
  const expTotal = expCarry + expRate + (expSpread || 0) + expConvexity;
  const got = mr.sleeveTotalReturn(5, 7, 6, 1.5, 6, 50, 30);
  assert.equal(got.carry, expCarry, 'carry term byte-parity');
  assert.equal(got.rate, expRate, 'rate term byte-parity');
  assert.equal(got.spread, expSpread, 'spread term byte-parity');
  assert.equal(got.convexity, expConvexity, 'convexity term byte-parity');
  assert.equal(got.total, expTotal, 'total byte-parity');
  assert.equal(Math.round(got.total * 1e6) / 1e6, -0.027952, 'independent hand-computed total pins the decomposition');
  // A spread-less sleeve carries a null spread and folds a zero into the total (the owner (spread||0) rule).
  const none = mr.sleeveTotalReturn(5, 7, 6, 1.5, 6, 50, null);
  assert.equal(none.spread, null, 'a spread-less sleeve carries a null spread (not a fabricated zero contribution)');
  assert.equal(Math.round(none.total * 1e6) / 1e6, -0.009981, 'the spread-less total drops the spread term exactly');
  // A non-finite owner characteristic yields a non-finite total (an unpriced sleeve), never a fabricated fill.
  assert.equal(Number.isNaN(mr.sleeveTotalReturn(null, 7, 6, 1.5, 6, 50, 30).total), true, 'a missing carry leaves the total non-finite (unpriced), not a default');
});

test('TP-06-01 bond-regime-lab.html single-sources sleeveTotalReturn from macro-rotation.js', () => {
  assert.match(BOND_PAGE, /rlexperience-adapters\/macro-rotation\.js/, 'bond page loads macro-rotation.js');
  assert.match(BOND_PAGE, /RLMACROROTATION\.sleeveTotalReturn\s*\(/, 'bond page delegates the sleeve total-return to the module');
  // The single owner source lives in macro-rotation.js; the page must carry no inline convexity formula.
  assert.equal(/0\.5 \* values\.convexity \* combinedShock \* combinedShock/.test(BOND_PAGE), false, 'bond page has no inline sleeve convexity/total formula');
});

/* ═══════════════════════ TP-06-01 fixed-income-sleeve adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 fixed-income-sleeve adapter registers through the production runtime and produces a ready owner run at parity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('bond-regime-lab');
  const runtime = runtimeFor(api, definition);
  const results = mr.registerMacroRotationAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/fixed-income-sleeve/v1'].ok, true, JSON.stringify(results['simple-adapter/fixed-income-sleeve/v1'].error || {}));

  const owner = bondSleeveOwnerFixture();
  const base = bondBase(definition);
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
  assert.ok(Array.isArray(summary.outcomes) && summary.outcomes.length === 4, 'every frozen sleeve carries a scenario outcome');
  assert.ok(summary.regime && typeof summary.regime.state === 'string', 'regime carries an inflation/real-yield confirmation state');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: each sleeve outcome total equals the single-sourced sleeve decomposition run directly
  // on the frozen sleeve characteristics under the base scenario (single source, no re-implementation).
  owner.sleeves.forEach((sleeve) => {
    const spreadShockBp = sleeve.spreadShockKind === 'none' ? null : base['spread-shock'];
    const parity = mr.sleeveTotalReturn(base.carry, sleeve.rateDuration, sleeve.spreadDuration, base.convexity, base.horizon / 30, base['rate-shock'], spreadShockBp);
    const outcome = summary.outcomes.find((entry) => entry.id === sleeve.id);
    assert.equal(outcome.total, Math.round(parity.total * 1e6) / 1e6, `${sleeve.id} total is single-sourced from sleeveTotalReturn`);
  });
});

test('TP-06-01 each enabled fixed-income-sleeve parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('bond-regime-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = bondBase(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: bondSleeveOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['horizon', 180, 'summary.outcomes'],
    ['rate-shock', 120, 'summary.outcomes'],
    ['spread-shock', 90, 'summary.outcomes'],
    ['carry', 6, 'summary.outcomes'],
    ['convexity', 9, 'summary.outcomes'],
    ['inflation-shock', 60, 'summary.regime'],
    ['real-yield-shock', 60, 'summary.regime'],
    ['confirmation-threshold', 0.4, 'summary.regime']
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

test('TP-06-01 fixed-income-sleeve compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('bond-regime-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = bondBase(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: bondSleeveOwnerFixture() },
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

/* ═══════════════════════ etf-ranking owner fixture (etf-momentum-lab) ═══════════════════════
   A synthetic frozen owner snapshot engineered so every declared parameter provably moves its
   declared output path. Per fund: distinct trailing returns per horizon key (so the horizon control
   moves the momentum and hence the ranking), distinct annVol/maxDD so the risk component differs (so
   the risk-penalty moves the ranking), and distinct cagr so the excess-vs-benchmark differs; the two
   frozen benchmarks (SPY/QQQ) carry distinct window CAGRs (so the benchmark control moves the
   relative performance); the funds' scores spread (so weighting equal-vs-score and the constituent
   cap both move the basket). No fabricated feed — the adapter recomputes only from these frozen owner
   metrics, single-sourcing the horizon momentum from RLMACROROTATION.etfMomentumSignal (the same
   owner ranking primitive the page's Simple cockpit delegates). */
const ETF_PAGE = readFileSync(new URL('../etf-momentum-lab.html', import.meta.url), 'utf8');
const ETF_HORIZON_KEY = { '1m': '1M', '3m': '3M', '6m': '6M', '12m': '1Y' };

function etfOwnerFixture() {
  return {
    contractVersion: 'etf-ranking-owner-state/v1',
    toolId: 'etf-momentum-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    benchmarks: {
      SPY: { cagr: 0.10, trailing: { '1M': 0.01, '3M': 0.03, '6M': 0.06, '1Y': 0.10 } },
      QQQ: { cagr: 0.14, trailing: { '1M': 0.02, '3M': 0.05, '6M': 0.09, '1Y': 0.15 } }
    },
    funds: [
      { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', trailing: { '1M': 0.02, '3M': 0.06, '6M': 0.14, 'YTD': 0.11, '1Y': 0.22, '3Y': 0.09, '5Y': 0.11 }, annVol: 0.18, maxDD: -0.12, sharpe: 1.1, cagr: 0.20, aum: 28456 },
      { ticker: 'XMMO', name: 'Invesco S&P MidCap Momentum', trailing: { '1M': 0.05, '3M': 0.10, '6M': 0.08, 'YTD': 0.07, '1Y': 0.10, '3Y': 0.06, '5Y': 0.09 }, annVol: 0.26, maxDD: -0.22, sharpe: 0.6, cagr: 0.12, aum: 7801 },
      { ticker: 'VFMO', name: 'Vanguard U.S. Momentum', trailing: { '1M': -0.01, '3M': 0.02, '6M': 0.05, 'YTD': 0.04, '1Y': 0.16, '3Y': 0.07, '5Y': 0.10 }, annVol: 0.14, maxDD: -0.08, sharpe: 1.3, cagr: 0.15, aum: 1935 }
    ]
  };
}

/* ═══════════════════════ TP-06-01 etf-ranking module authority + primitives ═══════════════════════ */

test('TP-06-01 macro-rotation module exposes the etf-ranking adapter with single-sourced momentum + composite score', () => {
  const mr = loadMacroRotation();
  assert.ok(mr.supportedAdapterIds.includes('simple-adapter/etf-ranking/v1'), 'etf-ranking/v1 is a declared supported adapter');
  assert.equal(typeof mr.etfMomentumSignal, 'function', 'etfMomentumSignal owner primitive is single-sourced in the module');
  assert.equal(typeof mr.etfCompositeScore, 'function', 'etfCompositeScore owner primitive is single-sourced in the module');
  assert.equal(typeof mr.computeEtfRankingSummary, 'function', 'computeEtfRankingSummary is exported');
});

test('TP-06-01 etfMomentumSignal and etfCompositeScore single-source pin the owner ranking formula', () => {
  const mr = loadMacroRotation();
  const m = { trailing: { '1M': 0.02, '3M': 0.06, '6M': 0.14, '1Y': 0.22 }, sharpe: 1.2, annVol: 0.18 };
  // etfMomentumSignal: a horizon key returns that trailing return; 'blend' averages the 3M/6M/1Y relatives.
  assert.equal(mr.etfMomentumSignal(m, '6M'), 0.14, 'a horizon key returns its trailing return');
  assert.ok(Math.abs(mr.etfMomentumSignal(m, 'blend') - (0.06 + 0.14 + 0.22) / 3) < 1e-12, 'blend averages the 3M/6M/1Y relatives (owner formula)');
  assert.equal(mr.etfMomentumSignal({ trailing: {} }, '6M'), null, 'a missing trailing return stays null (never a fabricated fill)');
  assert.equal(mr.etfMomentumSignal(null, '6M'), null, 'a missing metrics object stays null');
  // etfCompositeScore: raw preserves the momentum; balanced/defensive blend sharpe + quality at the owner weights.
  assert.equal(mr.etfCompositeScore(m, '6M', 'raw'), 0.14, 'raw mode preserves the selected momentum signal');
  const sharpe = Math.max(-1, Math.min(1, 1.2 / 2));
  const quality = Math.max(-1, Math.min(1, (0.30 - 0.18) / 0.22));
  assert.ok(Math.abs(mr.etfCompositeScore(m, '6M', 'balanced') - (0.14 * 0.70 + sharpe * 0.20 + quality * 0.10)) < 1e-12, 'balanced blends momentum/sharpe/quality at the owner 0.70/0.20/0.10 weights');
  assert.ok(Math.abs(mr.etfCompositeScore(m, '6M', 'defensive') - (0.14 * 0.45 + sharpe * 0.30 + quality * 0.25)) < 1e-12, 'defensive blends at the owner 0.45/0.30/0.25 weights');
  assert.equal(mr.etfCompositeScore({ trailing: {} }, '6M', 'balanced'), null, 'no momentum => null composite (no fabricated score)');
});

test('TP-06-01 etf-momentum-lab.html single-sources etfMomentumSignal/etfCompositeScore from macro-rotation.js', () => {
  assert.match(ETF_PAGE, /rlexperience-adapters\/macro-rotation\.js/, 'etf page loads macro-rotation.js');
  assert.match(ETF_PAGE, /RLMACROROTATION\.etfMomentumSignal\s*\(/, 'etf page delegates the momentum signal to the module');
  assert.match(ETF_PAGE, /RLMACROROTATION\.etfCompositeScore\s*\(/, 'etf page delegates the composite ranking score to the module');
  // The single owner source lives in macro-rotation.js; the page must carry no inline composite formula.
  assert.equal(/momentum \* 0\.70 \+ sharpe \* 0\.20 \+ quality \* 0\.10/.test(ETF_PAGE), false, 'etf page has no inline composite-score formula');
  assert.equal(/momentum \* 0\.45 \+ sharpe \* 0\.30 \+ quality \* 0\.25/.test(ETF_PAGE), false, 'etf page has no inline defensive composite formula');
});

/* ═══════════════════════ TP-06-01 etf-ranking adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 etf-ranking adapter registers through the production runtime and produces a ready owner run at parity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('etf-momentum-lab');
  const runtime = runtimeFor(api, definition);
  const results = mr.registerMacroRotationAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/etf-ranking/v1'].ok, true, JSON.stringify(results['simple-adapter/etf-ranking/v1'].error || {}));

  const owner = etfOwnerFixture();
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
  assert.equal(summary.fundCount, 3, 'every frozen fund is scored');
  assert.ok(Array.isArray(summary.ranking) && summary.ranking.length === 3, 'ranking carries every priced fund');
  assert.ok(summary.relativePerformance && Array.isArray(summary.relativePerformance.funds) && summary.relativePerformance.funds.length === 3, 'relativePerformance carries the benchmark excess per fund');
  assert.ok(summary.basket && Array.isArray(summary.basket.constituents) && summary.basket.constituents.length === 3, 'basket carries a weighted constituent per ranked fund');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: each ranking entry's momentum equals the single-sourced module momentum primitive run
  // directly on the frozen fund trailing returns at the default horizon (single source, no re-implementation).
  const horizonKey = ETF_HORIZON_KEY[base.horizon];
  owner.funds.forEach((fund) => {
    const entry = summary.ranking.find((row) => row.ticker === fund.ticker);
    const momentum = mr.etfMomentumSignal(fund, horizonKey);
    assert.equal(entry.momentum, Math.round(momentum * 1e6) / 1e6, `${fund.ticker} momentum is single-sourced from etfMomentumSignal`);
  });
});

test('TP-06-01 each enabled etf-ranking parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('etf-momentum-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: etfOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['horizon', '12m', 'summary.ranking'],
    ['momentum-weight', 0.9, 'summary.ranking'],
    ['risk-penalty', 0.6, 'summary.ranking'],
    ['benchmark', 'QQQ', 'summary.relativePerformance'],
    ['weighting', 'equal', 'summary.basket'],
    ['max-constituent-weight', 0.5, 'summary.basket']
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

/* ═══════════════════════ ai-capex-portfolio owner fixture (ai-capex-strategy-lab) ═══════════════════════
   A synthetic frozen owner snapshot engineered so every declared parameter provably moves its
   declared output path. Per asset: a distinct per-horizon {er, sd} (so horizon moves the portfolio
   distribution band), distinct theme membership with a selectedTheme (so theme-weight moves the
   beneficiary distribution), distinct non-zero crowding (so the crowding penalty moves the
   distribution mean), a spread of sd across a within-theme and cross-theme correlation pair (so the
   correlation ceiling moves the portfolio sigma), and an er/sd spread that separates the objective
   weightings (so the objective moves the portfolio). No fabricated feed — the adapter recomputes only
   from these frozen owner facts, single-sourcing the lognormal band + CVaR from RLFUNDAMENTALS. */
const AI_CAPEX_PAGE = readFileSync(new URL('../ai-capex-strategy-lab.html', import.meta.url), 'utf8');

function loadFundamentalModels() {
  const path = require.resolve('../rlexperience-adapters/fundamental-models.js');
  delete require.cache[path];
  return require(path);
}

function aiCapexOwnerFixture() {
  return {
    contractVersion: 'ai-capex-portfolio-owner-state/v1',
    toolId: 'ai-capex-strategy-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'test-owner cache snapshot',
    selectedTheme: 'Memory & Storage',
    correlation: { intra: 0.72, inter: 0.40 },
    horizons: ['1m', '3m', '6m', '1y'],
    assets: [
      { id: 'MU', ticker: 'MU', theme: 'Memory & Storage', tier: 'A', crowding: 0.03, byHorizon: { '1m': { er: 0.06, sd: 0.16 }, '3m': { er: 0.14, sd: 0.28 }, '6m': { er: 0.22, sd: 0.39 }, '1y': { er: 0.34, sd: 0.55 } } },
      { id: 'STX', ticker: 'STX', theme: 'Memory & Storage', tier: 'A', crowding: 0.02, byHorizon: { '1m': { er: 0.05, sd: 0.14 }, '3m': { er: 0.11, sd: 0.24 }, '6m': { er: 0.17, sd: 0.34 }, '1y': { er: 0.26, sd: 0.48 } } },
      { id: 'ETN', ticker: 'ETN', theme: 'Grid & Electrical', tier: 'A', crowding: 0.04, byHorizon: { '1m': { er: 0.03, sd: 0.10 }, '3m': { er: 0.07, sd: 0.18 }, '6m': { er: 0.12, sd: 0.26 }, '1y': { er: 0.20, sd: 0.32 } } },
      { id: 'GEV', ticker: 'GEV', theme: 'Grid & Electrical', tier: 'A', crowding: 0.06, byHorizon: { '1m': { er: 0.02, sd: 0.12 }, '3m': { er: 0.06, sd: 0.20 }, '6m': { er: 0.13, sd: 0.30 }, '1y': { er: 0.22, sd: 0.45 } } },
      { id: 'CEG', ticker: 'CEG', theme: 'Power Gen & Nuclear', tier: 'A', crowding: 0.05, byHorizon: { '1m': { er: 0.02, sd: 0.13 }, '3m': { er: 0.05, sd: 0.22 }, '6m': { er: 0.11, sd: 0.33 }, '1y': { er: 0.19, sd: 0.44 } } },
      { id: 'OKLO', ticker: 'OKLO', theme: 'Power Gen & Nuclear', tier: 'S', crowding: 0.14, byHorizon: { '1m': { er: 0.05, sd: 0.40 }, '3m': { er: 0.14, sd: 0.68 }, '6m': { er: 0.30, sd: 0.95 }, '1y': { er: 0.55, sd: 1.30 } } }
    ]
  };
}

/* ═══════════════════════ TP-06-01 ai-capex module authority + owner primitives ═══════════════════════ */

test('TP-06-01 fundamental-models module exposes the delivered ai-capex adapter with no forbidden authority', () => {
  const fm = loadFundamentalModels();
  assert.ok(fm.supportedAdapterIds.includes('simple-adapter/ai-capex-portfolio/v1'), 'ai-capex-portfolio is a declared supported adapter');
  const raw = readFileSync(new URL('../rlexperience-adapters/fundamental-models.js', import.meta.url), 'utf8');
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
    /rlexperience-adapters\/(market-structure|options|macro-rotation|strategy-research|property-research|market-action)/
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(source), false, `fundamental-models.js must not contain ${pattern}`);
  }
});

test('TP-06-01 fundamental-models owner primitives pin the single-source lognormal band + CVaR formula', () => {
  const fm = loadFundamentalModels();
  // erf / normCdf / invNorm identities (A&S 7.1.26 erf carries ~1e-9 error at 0 — the same on the owner page).
  assert.ok(Math.abs(fm.erf(0)) < 1e-6, 'erf(0) = 0');
  assert.ok(Math.abs(fm.normCdf(0) - 0.5) < 1e-6, 'normCdf(0) = 0.5');
  assert.ok(Math.abs(fm.invNorm(0.5)) < 1e-6, 'invNorm(0.5) ~ 0');
  assert.ok(fm.invNorm(0.95) > 0 && fm.invNorm(0.05) < 0, 'invNorm is monotone about the median');
  // bandStats: lognormal simple-return band with prob of a target, loss bounded at -100%.
  const band = fm.bandStats(0.20, 0.35, 0.10);
  assert.ok(band.lo < band.med && band.med < band.hi, 'band lo < median < hi');
  assert.ok(band.lo >= -1, 'lower band bounded at -100%');
  assert.ok(band.prob >= 0 && band.prob <= 1, 'target probability is in [0,1]');
  const richer = fm.bandStats(0.40, 0.35, 0.10);
  assert.ok(richer.prob > band.prob, 'a higher mean lifts the chance of clearing the target');
  // cvarOf: expected shortfall (mean simple-return in the worst 5% tail) is a bounded loss.
  const a = fm.cvarOf(0.15, 0.30, 0.05), b = fm.cvarOf(0.10, 0.50, 0.05);
  assert.ok(a < 0 && b < 0, 'CVaR(5%) tail returns are losses (negative)');
  assert.ok(a > -1 && b > -1, 'CVaR bounded at -100%');
  assert.ok(b < a, 'higher volatility => deeper CVaR tail');
});

test('TP-06-01 ai-capex-strategy-lab.html single-sources erf/normCdf/invNorm/bandStats/cvarOf from fundamental-models.js', () => {
  assert.match(AI_CAPEX_PAGE, /rlexperience-adapters\/fundamental-models\.js/, 'ai-capex page loads fundamental-models.js');
  assert.match(AI_CAPEX_PAGE, /RLFUNDAMENTALS\.erf\s*\(/, 'ai-capex page delegates erf to the module');
  assert.match(AI_CAPEX_PAGE, /RLFUNDAMENTALS\.normCdf\s*\(/, 'ai-capex page delegates normCdf to the module');
  assert.match(AI_CAPEX_PAGE, /RLFUNDAMENTALS\.invNorm\s*\(/, 'ai-capex page delegates invNorm to the module');
  assert.match(AI_CAPEX_PAGE, /RLFUNDAMENTALS\.bandStats\s*\(/, 'ai-capex page delegates bandStats to the module');
  assert.match(AI_CAPEX_PAGE, /RLFUNDAMENTALS\.cvarOf\s*\(/, 'ai-capex page delegates cvarOf to the module');
  // The single owner source lives in fundamental-models.js; the page must carry no inline copy.
  assert.equal(/0\.3275911/.test(AI_CAPEX_PAGE), false, 'ai-capex page has no inline erf polynomial constant');
  assert.equal(/2\.209460984245205e\+02/.test(AI_CAPEX_PAGE), false, 'ai-capex page has no inline invNorm coefficient');
  assert.equal(/Math\.log\(base\) - s2 \/ 2/.test(AI_CAPEX_PAGE), false, 'ai-capex page has no inline bandStats/cvarOf lognormal fit');
});

/* ═══════════════════════ TP-06-01 ai-capex adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 ai-capex-portfolio adapter registers through the production runtime and produces a ready owner run', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('ai-capex-strategy-lab');
  const runtime = runtimeFor(api, definition);
  const results = fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/ai-capex-portfolio/v1'].ok, true, JSON.stringify(results['simple-adapter/ai-capex-portfolio/v1'].error || {}));

  const owner = aiCapexOwnerFixture();
  const base = defaultValues(definition);
  const prepared = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: owner },
    parameterValues: base,
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  assert.equal(prepared.state, 'ready');
  const summary = prepared.current.output.values.summary;
  assert.equal(summary.horizon, '6m', 'default horizon is 6m');
  assert.equal(summary.selectedTheme, 'Memory & Storage', 'selected owner theme is preserved');
  assert.equal(summary.assetCount, 6, 'all six owner assets are scored');
  assert.equal(summary.pricedCount, 6, 'all six owner assets are priced at the default horizon');
  assert.ok(summary.distribution && typeof summary.distribution.median === 'number' && typeof summary.distribution.cvar === 'number', 'distribution carries a lognormal band + CVaR');
  assert.ok(Array.isArray(summary.beneficiaries) && summary.beneficiaries.length === 3, 'beneficiaries carries the three owner themes');
  assert.ok(summary.portfolio && Array.isArray(summary.portfolio.holdings) && summary.portfolio.holdings.length === 6, 'portfolio carries every priced holding');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the distribution band + CVaR are the single-sourced RLFUNDAMENTALS primitives run
  // directly on the portfolio's crowding/risk-adjusted mu/sigma (single source, no re-implementation).
  const port = fm.computeAiCapexPortfolio(owner, base);
  const band = fm.bandStats(port.muAdj, port.sdAdj, port.target);
  assert.equal(summary.distribution.median, Math.round(band.med * 1e6) / 1e6, 'distribution median is single-sourced from bandStats');
  assert.equal(summary.distribution.lo, Math.round(band.lo * 1e6) / 1e6, 'distribution lo parity');
  assert.equal(summary.distribution.hi, Math.round(band.hi * 1e6) / 1e6, 'distribution hi parity');
  assert.equal(summary.distribution.cvar, Math.round(fm.cvarOf(port.muAdj, port.sdAdj, 0.05) * 1e6) / 1e6, 'distribution CVaR is single-sourced from cvarOf');
});

test('TP-06-01 each enabled ai-capex-portfolio parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('ai-capex-strategy-lab');
  const runtime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: aiCapexOwnerFixture() },
    parameterValues: base,
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['horizon', '1y', 'summary.distribution'],
    ['theme-weight', 0.9, 'summary.beneficiaries'],
    ['crowding-penalty', 0.8, 'summary.distribution'],
    ['risk-damper', 0.8, 'summary.distribution'],
    ['correlation-ceiling', 0.4, 'summary.portfolio'],
    ['objective', 'return', 'summary.portfolio']
  ];
  for (const [parameterId, value, path] of cases) {
    const run = requireValue(await runtime.recompute({
      parameterValues: { ...base, [parameterId]: value },
      seed: base.seed,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-24T20:03:00.000Z'
    }));
    assert.deepEqual(run.changedParameters, [parameterId], `changed ${parameterId}`);
    const effect = run.sensitivity.effects.find((entry) => entry.parameterId === parameterId);
    assert.ok(effect, `sensitivity effect present for ${parameterId}`);
    assert.equal(effect.outputChanged, true, `${parameterId} must change ${path}`);
    assert.deepEqual(effect.resultPaths, [path], `${parameterId} declared path`);
    // Restore baseline for the next isolated one-at-a-time change.
    await runtime.recompute({ parameterValues: { ...base }, seed: base.seed, scenarioIds: ['baseline'], computedAt: '2026-07-24T20:03:30.000Z' });
  }
});

test('TP-06-01 ai-capex-portfolio compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('ai-capex-strategy-lab');
  const runtime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: aiCapexOwnerFixture() },
    parameterValues: base,
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  const again = requireValue(await runtime.recompute({
    parameterValues: { ...base },
    seed: base.seed,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:30.000Z'
  }));
  assert.equal(
    api.fingerprint(first.current.output.values.summary),
    api.fingerprint(again.current.output.values.summary),
    'identical inputs => identical owner summary'
  );
});

test('TP-06-01 etf-ranking compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const mr = loadMacroRotation();
  const definition = definitionFor('etf-momentum-lab');
  const runtime = runtimeFor(api, definition);
  mr.registerMacroRotationAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: etfOwnerFixture() },
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

/* ═══════════════════════ company-scenario-bridge owner fixture (company-fundamentals-lab) ═══════════════════════
   A synthetic FROZEN accepted-publication snapshot engineered so every declared parameter provably moves its
   declared output path and every source gap is preserved honestly. The five reported base facts are all
   available (so the baseline scenario is "ready"); the lineage clocks put the accepted revision 30 whole days
   before asOf (so lineage-cutoff flips within→stale across the default 90 and a tight 10); the two frozen
   evidence gaps carry one required + one optional entry (so evidence-gap-policy flips preserve→refuse on the
   required gap); and the lineage carries distinct statement/model cutoffs + revisions (so accepted-state flips
   the source-qualified anchor). No fabricated feed — the adapter recomputes only from these frozen owner facts
   through the single-source projection/lineage/gap primitives (RLFUNDAMENTALS.projectCompanyScenario /
   companyScenarioLineage / companyGapLedger), which the company page Power path delegates to as well. */
const COMPANY_PAGE = readFileSync(new URL('../company-fundamentals-lab.html', import.meta.url), 'utf8');

function companyOwnerFixture() {
  return {
    contractVersion: 'company-scenario-owner-state/v1',
    toolId: 'company-fundamentals-lab',
    companyId: 'company-fundamentals-lab',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'accepted publication snapshot',
    reported: {
      revenue: { value: 200000, unit: 'USD-millions', state: 'reported' },
      operatingMargin: { value: 0.4, unit: 'ratio', state: 'reported' },
      revenueGrowth: { value: 0.1, unit: 'ratio', state: 'reported' },
      capexIntensity: { value: 0.2, unit: 'ratio', state: 'reported' },
      valuationMultiple: { value: 20, unit: 'x', state: 'reported' }
    },
    lineage: {
      revision: 4,
      owner: 'accepted-publication',
      scenarioRevisionId: 'scn-rev-7',
      createdAt: '2026-06-24T20:00:00.000Z',
      statementCutoff: '2026-06-20T00:00:00.000Z',
      modelCutoff: '2026-07-01T00:00:00.000Z'
    },
    gaps: [
      { evidenceClass: 'segment-detail', concept: 'SegmentRevenue', state: 'unavailable', required: true },
      { evidenceClass: 'guidance', concept: 'ForwardGuidance', state: 'unavailable', required: false }
    ]
  };
}

/* ═══════════════════════ TP-06-01 company-scenario-bridge module authority + primitives ═══════════════════════ */

test('TP-06-01 fundamental-models module exposes the company-scenario-bridge adapter with single-sourced projection + lineage + gap primitives', () => {
  const fm = loadFundamentalModels();
  assert.ok(fm.supportedAdapterIds.includes('simple-adapter/company-scenario-bridge/v1'), 'company-scenario-bridge/v1 is a declared supported adapter');
  assert.equal(typeof fm.projectCompanyScenario, 'function', 'projectCompanyScenario bounded-projection primitive is single-sourced in the module');
  assert.equal(typeof fm.companyReportedBase, 'function', 'companyReportedBase gap-preserving marshaller is exported');
  assert.equal(typeof fm.companyScenarioLineage, 'function', 'companyScenarioLineage frozen-clock primitive is exported');
  assert.equal(typeof fm.companyGapLedger, 'function', 'companyGapLedger evidence-gap primitive is exported');
  assert.equal(typeof fm.computeCompanyScenarioSummary, 'function', 'computeCompanyScenarioSummary is exported');
});

test('TP-06-01 projectCompanyScenario/companyScenarioLineage/companyGapLedger single-source pin the bounded scenario + gap-preservation formula', () => {
  const fm = loadFundamentalModels();
  const base = companyOwnerFixture().reported;
  // projectCompanyScenario: growth applies to the frozen reported base and derives operating income + bounded valuation.
  const ready = fm.projectCompanyScenario(base, { growth: 10, marginChange: 0, gapPolicy: 'preserve' });
  assert.equal(ready.state, 'ready', 'a complete reported base yields a ready bounded scenario');
  assert.equal(ready.revenue, 220000, 'revenue node = base-revenue 200000 * (1 + growth 0.10)');
  assert.equal(ready.operatingIncome, 88000, 'operating income = revenue 220000 * margin 0.40');
  assert.equal(ready.valuation, 1760000, 'bounded valuation = operating income 88000 * multiple 20');
  // margin-change moves the margin node (percentage points), not the revenue node.
  const marginShift = fm.projectCompanyScenario(base, { growth: 0, marginChange: 10, gapPolicy: 'preserve' });
  assert.equal(marginShift.operatingMargin, 0.5, 'margin change +10pp lifts the 0.40 margin to 0.50');
  assert.equal(marginShift.operatingIncome, 100000, 'operating income tracks the shifted margin (200000 * 0.50)');
  // Gap preservation: a required reported gap stays honestly unavailable (preserve) or withholds the whole scenario (refuse) — never a fabricated default.
  const gapped = companyOwnerFixture().reported;
  gapped.revenue = { value: null, unit: 'USD-millions', state: 'unavailable' };
  const preserved = fm.projectCompanyScenario(gapped, { growth: 10, marginChange: 0, gapPolicy: 'preserve' });
  const refused = fm.projectCompanyScenario(gapped, { growth: 10, marginChange: 0, gapPolicy: 'refuse' });
  assert.equal(preserved.state, 'unavailable', 'a required reported gap is honestly unavailable under preserve');
  assert.equal(preserved.revenue, null, 'the gapped revenue node is null, never a fabricated default');
  assert.equal(preserved.operatingIncome, null, 'a derived node depending on a gapped required node stays null');
  assert.ok(preserved.missing.includes('revenue'), 'the preserved gap is named in missing');
  assert.equal(refused.state, 'refused', 'the refuse policy withholds the whole scenario on a required gap');
  assert.equal(refused.valuation, null, 'a refused scenario carries no fabricated numbers');
  // A non-required reported gap is a partial scenario (the available nodes still project).
  const optionalGap = companyOwnerFixture().reported;
  optionalGap.valuationMultiple = { value: null, unit: 'x', state: 'unavailable' };
  const partial = fm.projectCompanyScenario(optionalGap, { growth: 10, marginChange: 0, gapPolicy: 'preserve' });
  assert.equal(partial.state, 'partial', 'a non-required reported gap is a partial scenario');
  assert.equal(partial.valuation, null, 'the gapped valuation node stays null under partial');
  assert.equal(partial.revenue, 220000, 'the available revenue node still projects');
  // companyScenarioLineage: age over the FROZEN clocks (never Date.now()); the cutoff flips within→stale; a missing clock stays unavailable.
  const within = fm.companyScenarioLineage(companyOwnerFixture().lineage, '2026-07-24T20:00:00.000Z', 90);
  const stale = fm.companyScenarioLineage(companyOwnerFixture().lineage, '2026-07-24T20:00:00.000Z', 10);
  assert.equal(within.ageDays, 30, 'the accepted revision is 30 whole days before asOf');
  assert.equal(within.state, 'within', 'a 30-day age within the 90-day cutoff is within');
  assert.equal(stale.state, 'stale', 'a 30-day age past a 10-day cutoff is stale');
  assert.equal(fm.companyScenarioLineage({}, '2026-07-24T20:00:00.000Z', 90).ageDays, null, 'a missing lineage clock stays unavailable (no fabricated age)');
  // companyGapLedger: preserve keeps every gap honest; refuse marks a required unresolved gap blocking and refuses acceptance.
  const gaps = companyOwnerFixture().gaps;
  const preserveLedger = fm.companyGapLedger(gaps, 'preserve');
  const refuseLedger = fm.companyGapLedger(gaps, 'refuse');
  assert.equal(preserveLedger.refused, false, 'preserve never refuses');
  assert.equal(refuseLedger.refused, true, 'refuse refuses on a required gap');
  assert.equal(refuseLedger.entries[0].blocking, true, 'the required gap is marked blocking under refuse');
  assert.equal(preserveLedger.entries[0].blocking, false, 'no gap is blocking under preserve');
});

test('TP-06-01 company-fundamentals-lab.html single-sources projectCompanyScenario from fundamental-models.js', () => {
  assert.match(COMPANY_PAGE, /rlexperience-adapters\/fundamental-models\.js/, 'company page loads fundamental-models.js');
  assert.match(COMPANY_PAGE, /RLFUNDAMENTALS\.projectCompanyScenario\s*\(/, 'company page delegates the bounded scenario projection to the module');
  // The single owner source lives in fundamental-models.js; the page must carry no inline projection copy.
  assert.equal(/roundTo\(rev0 \* \(1 \+ g\), 6\)/.test(COMPANY_PAGE), false, 'company page has no inline bounded-revenue projection formula');
  assert.equal(/clamp\(m0 \+ dm, -1, 1\)/.test(COMPANY_PAGE), false, 'company page has no inline bounded-margin projection formula');
});

/* ═══════════════════════ TP-06-01 company-scenario-bridge adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 company-scenario-bridge adapter registers through the production runtime and produces a ready owner run at parity', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('company-fundamentals-lab');
  const runtime = runtimeFor(api, definition);
  const results = fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/company-scenario-bridge/v1'].ok, true, JSON.stringify(results['simple-adapter/company-scenario-bridge/v1'].error || {}));

  const owner = companyOwnerFixture();
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
  assert.equal(summary.acceptedState, 'reported', 'the default accepted state is reported');
  assert.equal(summary.state.accepted, 'reported', 'the source-qualified anchor labels the reported state');
  assert.equal(summary.scenario.state, 'ready', 'the complete reported base yields a ready bounded scenario');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the Simple read reflects the company page's owner facts through the SINGLE-SOURCE primitives
  // (RLFUNDAMENTALS.projectCompanyScenario / companyReportedBase / companyScenarioLineage / companyGapLedger)
  // run directly on the frozen owner facts at the default parameters — not a re-implementation.
  assert.deepEqual(summary.reported, fm.companyReportedBase(owner.reported), 'reported base is single-sourced from companyReportedBase');
  assert.deepEqual(summary.scenario, fm.projectCompanyScenario(owner.reported, { growth: base['growth-assumption'], marginChange: base['margin-change'], gapPolicy: 'preserve' }), 'bounded scenario is single-sourced from projectCompanyScenario');
  assert.deepEqual(summary.lineage, fm.companyScenarioLineage(owner.lineage, owner.asOf, base['lineage-cutoff']), 'lineage age is single-sourced from companyScenarioLineage');
  assert.deepEqual(summary.gaps, fm.companyGapLedger(owner.gaps, 'preserve'), 'gap ledger is single-sourced from companyGapLedger');
  assert.equal(summary.scenario.revenue, 220000, 'the parity scenario reproduces the owner revenue node (200000 * 1.10)');
});

test('TP-06-01 each enabled company-scenario-bridge parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('company-fundamentals-lab');
  const runtime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: companyOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['accepted-state', 'scenario', 'summary.state'],
    ['growth-assumption', 25, 'summary.scenario'],
    ['margin-change', 5, 'summary.scenario'],
    ['evidence-gap-policy', 'refuse', 'summary.gaps'],
    ['lineage-cutoff', 10, 'summary.lineage']
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

test('TP-06-01 company-scenario-bridge preserves source gaps as honest partial/unavailable through the live adapter (no fabricated default)', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('company-fundamentals-lab');

  // (a) A NON-required reported gap (valuation multiple unavailable, revenue+margin present) runs through the LIVE
  //     adapter to an honest "partial" scenario: the gapped node stays null, never a fabricated default.
  const partialRuntime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(partialRuntime, api, [definition]);
  const partialOwner = companyOwnerFixture();
  partialOwner.reported.valuationMultiple = { value: null, unit: 'x', state: 'unavailable' };
  const partialPrepared = requireValue(await partialRuntime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: partialOwner },
    parameterValues: defaultValues(definition),
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  }));
  const partialScenario = partialPrepared.current.output.values.summary.scenario;
  assert.equal(partialScenario.state, 'partial', 'a non-required reported gap yields an honest partial scenario');
  assert.equal(partialScenario.valuation, null, 'the gapped valuation node stays null (no fabricated default)');
  assert.ok(partialScenario.missing.includes('valuationMultiple'), 'the preserved gap is named in missing');
  assert.equal(partialScenario.revenue, 220000, 'the available reported nodes still project (revenue node intact)');
  assert.ok(partialPrepared.current.output.provenance.classes.includes('unavailable'), 'the output provenance carries the honest unavailable class');

  // (b) A REQUIRED reported gap (revenue unavailable) makes the owner evidence "unavailable"; the runtime HONESTLY
  //     REFUSES the run rather than fabricating a ready output — no invented default is produced.
  const missingRuntime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(missingRuntime, api, [definition]);
  const missingOwner = companyOwnerFixture();
  missingOwner.reported.revenue = { value: null, unit: 'USD-millions', state: 'unavailable' };
  const refusedRun = await missingRuntime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: missingOwner },
    parameterValues: defaultValues(definition),
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });
  assert.equal(refusedRun.ok, false, 'a required reported gap refuses the run (no fabricated ready output)');
  assert.equal(refusedRun.error.code, 'E012-SIMPLE-INPUT', 'the refusal is the Simple-input contract refusal');
  assert.match(refusedRun.error.reason, /evidence state does not permit a new run/, 'the refusal names the unavailable evidence truth state');
});

test('TP-06-01 company-scenario-bridge compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('company-fundamentals-lab');
  const runtime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: companyOwnerFixture() },
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

/* ═══════════════════════ msft-margin-eps owner fixture (msft-july-print-model) ═══════════════════════
   A synthetic FROZEN static-model snapshot engineered so every declared parameter provably moves its
   declared output path. `bridge` carries the base decimal FY26 facts + FY27 growth/margin levers the
   owner page already computes (revFY26/om26/vol/prc/churn/fx margins/opex/dDep/oi/tax/sh/pe); the
   frozen `depreciationBase` (FY26 D&A) is what the depreciation-growth + capex-phase levers scale into
   the FY27 incremental depreciation step; and `anchors` carries the two owner-computed Q4 FY26 OM
   anchors (consensus vs seasonality) the earnings-anchor lever selects between. No fabricated feed —
   the adapter recomputes only from these frozen owner facts through the SINGLE-SOURCE FY26→FY27 bridge
   (RLFUNDAMENTALS.msftAnnualBridge), which the owner page's calculateAnnual delegates to as well. */
const MSFT_PAGE = readFileSync(new URL('../msft-july-print-model.html', import.meta.url), 'utf8');

function msftOwnerFixture() {
  return {
    contractVersion: 'msft-margin-eps-owner-state/v1',
    toolId: 'msft-july-print-model',
    asOf: '2026-07-24T20:00:00.000Z',
    source: 'static model snapshot',
    bridge: {
      revFY26: 330, om26: 0.46,
      vol: 0.10, prc: 0.05, churn: 0.02, fx: -0.01,
      pm: 0.95, vm: 0.65, cm: 0.75, opexI: 0.12,
      dDep: 20,
      oi: 2, tax: 0.20, sh: 7.5, pe: 30
    },
    depreciationBase: 40,
    anchors: { consensus: 0.46, seasonality: 0.44 }
  };
}

/* ═══════════════════════ TP-06-01 msft-margin-eps module authority + single-source bridge ═══════════════════════ */

test('TP-06-01 fundamental-models module exposes the msft-margin-eps adapter with the single-source margin/EPS/valuation bridge', () => {
  const fm = loadFundamentalModels();
  assert.ok(fm.supportedAdapterIds.includes('simple-adapter/msft-margin-eps/v1'), 'msft-margin-eps/v1 is a declared supported adapter');
  assert.equal(typeof fm.msftAnnualBridge, 'function', 'msftAnnualBridge single-source FY26->FY27 bridge is exported');
  assert.equal(typeof fm.computeMsftBridgeInputs, 'function', 'computeMsftBridgeInputs (param -> scenario bridge inputs) is exported');
  assert.equal(typeof fm.computeMsftMarginEpsSummary, 'function', 'computeMsftMarginEpsSummary is exported');
});

test('TP-06-01 msftAnnualBridge single-source pins the reported-period margin/EPS/valuation bridge formula', () => {
  const fm = loadFundamentalModels();
  // A clean zero-growth identity: revenue and operating income carry straight through, so OM27 == om26,
  // EPS27 == OI27/sh (no growth, no tax), and implied == EPS27 * pe. This pins the exact owner arithmetic.
  const flat = fm.msftAnnualBridge({ revFY26: 100, om26: 0.4, vol: 0, prc: 0, churn: 0, fx: 0, pm: 1, vm: 1, cm: 1, opexI: 0, dDep: 0, oi: 0, tax: 0, sh: 1, pe: 10 });
  assert.equal(flat.OI26, 40, 'OI26 = revenue 100 * om26 0.40');
  assert.equal(flat.OI27, 40, 'zero-growth OI27 carries OI26 straight through');
  assert.equal(flat.RevFY27, 100, 'zero-growth FY27 revenue == FY26 revenue');
  assert.equal(flat.OM27, 0.4, 'zero-growth OM27 == om26');
  assert.equal(flat.EPS27, 40, 'EPS27 = (OI27 + oi) * (1 - tax) / sh = 40 / 1');
  assert.equal(flat.implied, 400, 'implied price = EPS27 40 * pe 10');
  // A depreciation step and a price/mix uplift both bite the FY27 bridge: OI27 drops by the full dDep and
  // rises by the price gross profit, so a bigger depreciation step lowers OM27 and a bigger price uplift lifts it.
  const withDep = fm.msftAnnualBridge({ revFY26: 100, om26: 0.4, vol: 0, prc: 0, churn: 0, fx: 0, pm: 1, vm: 1, cm: 1, opexI: 0, dDep: 5, oi: 0, tax: 0, sh: 1, pe: 10 });
  assert.equal(withDep.OI27, 35, 'a $5 depreciation step lowers OI27 to 35');
  assert.ok(withDep.OM27 < flat.OM27, 'a heavier depreciation step compresses OM27');
  const withPrice = fm.msftAnnualBridge({ revFY26: 100, om26: 0.4, vol: 0, prc: 0.10, churn: 0, fx: 0, pm: 1, vm: 1, cm: 1, opexI: 0, dDep: 0, oi: 0, tax: 0, sh: 1, pe: 10 });
  assert.equal(withPrice.GP_price, 10, 'price/mix gross profit = revenue 100 * prc 0.10 * priceMargin 1.0');
  assert.equal(withPrice.OI27, 50, 'the price uplift adds its full gross profit to OI27');
  assert.ok(withPrice.EPS27 > flat.EPS27, 'a price/mix uplift lifts EPS27');
});

test('TP-06-01 msft-july-print-model.html single-sources the FY26->FY27 bridge from fundamental-models.js', () => {
  assert.match(MSFT_PAGE, /rlexperience-adapters\/fundamental-models\.js/, 'msft page loads fundamental-models.js');
  assert.match(MSFT_PAGE, /RLFUNDAMENTALS\.msftAnnualBridge\s*\(/, 'msft page calculateAnnual delegates the bridge to the module');
  // The single owner source lives in fundamental-models.js; the page must carry no inline bridge copy.
  assert.equal(/OI26 \+ GP_price \+ GP_vol \+ GP_fx - GP_churn - dDep - dOpex/.test(MSFT_PAGE), false, 'msft page has no inline OI27 bridge formula');
  assert.equal(/NI27 = \(OI27 \+ oi\) \* \(1 - tax\)/.test(MSFT_PAGE), false, 'msft page has no inline net-income/EPS bridge formula');
});

/* ═══════════════════════ TP-06-01 msft-margin-eps adapter runtime + owner parity ═══════════════════════ */

test('TP-06-01 msft-margin-eps adapter registers through the production runtime and produces a ready owner run at parity', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('msft-july-print-model');
  const runtime = runtimeFor(api, definition);
  const results = fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  assert.equal(results['simple-adapter/msft-margin-eps/v1'].ok, true, JSON.stringify(results['simple-adapter/msft-margin-eps/v1'].error || {}));

  const owner = msftOwnerFixture();
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
  assert.ok(summary.margin && typeof summary.margin.om27 === 'number', 'summary.margin carries the FY27 operating margin');
  assert.ok(summary.eps && typeof summary.eps.eps27 === 'number', 'summary.eps carries the FY27 EPS');
  assert.ok(summary.valuation && typeof summary.valuation.impliedPrice === 'number', 'summary.valuation carries the implied price');
  assert.equal(prepared.current.output.provenance.evidenceIdentity, prepared.current.input.evidenceIdentity, 'evidence identity is bound');

  // Owner parity: the margin/EPS/valuation summary is the SINGLE-SOURCE bridge (RLFUNDAMENTALS.msftAnnualBridge)
  // run on the default-param scenario inputs (computeMsftBridgeInputs) — not a re-implementation.
  const inputs = fm.computeMsftBridgeInputs(owner, base);
  const bridge = fm.msftAnnualBridge(inputs);
  assert.equal(summary.margin.om27, Math.round(bridge.OM27 * 1e6) / 1e6, 'margin OM27 is single-sourced from msftAnnualBridge');
  assert.equal(summary.margin.oi27, Math.round(bridge.OI27 * 1e6) / 1e6, 'margin OI27 parity');
  assert.equal(summary.eps.eps27, Math.round(bridge.EPS27 * 1e6) / 1e6, 'EPS27 is single-sourced from msftAnnualBridge');
  assert.equal(summary.eps.eps26, Math.round(bridge.EPS26 * 1e6) / 1e6, 'EPS26 parity');
  assert.equal(summary.valuation.impliedPrice, Math.round(bridge.implied * 1e6) / 1e6, 'implied price is single-sourced from msftAnnualBridge');
  // The default capex phase is mid and the default anchor is consensus, so the FY26 OM base is the consensus anchor
  // and the incremental depreciation step is the frozen D&A base grown at the default depreciation-growth rate.
  assert.equal(inputs.om26, owner.anchors.consensus, 'the default consensus anchor sets the FY26 OM base');
  assert.equal(inputs.dDep, owner.depreciationBase * (base['depreciation-growth'] / 100), 'the FY27 depreciation step = frozen D&A base * depreciation-growth at the mid phase (tilt 1.0)');
  assert.equal(inputs.pe, base['valuation-multiple'], 'the valuation multiple overrides pe for the valuation bridge');
});

test('TP-06-01 each enabled msft-margin-eps parameter changes its declared output path', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('msft-july-print-model');
  const runtime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: msftOwnerFixture() },
    parameterValues: base,
    seed: null,
    scenarioIds: ['baseline'],
    computedAt: '2026-07-24T20:02:00.000Z'
  });

  const cases = [
    ['depreciation-growth', 40, 'summary.margin'],
    ['mix-shift', 8, 'summary.margin'],
    ['fx-impact', 5, 'summary.eps'],
    ['memory-cost-impact', 6, 'summary.margin'],
    ['capex-phase', 'early', 'summary.margin'],
    ['earnings-anchor', 'seasonality', 'summary.eps'],
    ['valuation-multiple', 50, 'summary.valuation']
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

test('TP-06-01 msft-margin-eps compute is deterministic for one compute identity', async () => {
  const api = loadProductionApi();
  const fm = loadFundamentalModels();
  const definition = definitionFor('msft-july-print-model');
  const runtime = runtimeFor(api, definition);
  fm.registerFundamentalModelsAdapters(runtime, api, [definition]);
  const base = defaultValues(definition);
  const first = requireValue(await runtime.prepare({
    definitionId: definition.definitionId,
    ownerContext: { ownerState: msftOwnerFixture() },
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
