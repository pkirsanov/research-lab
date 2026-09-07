/*
 * tests/volatility-roughness.integration.mjs — Feature 028 SCOPE-028-01. CommonJS-consumer
 * integration coverage proving the RLVOL roughness diagnostic contract is immutable, does not
 * mutate caller input, and keeps admitted and withheld states distinct across the CommonJS path
 * used by Node reviewers/tests (the same module also serves the browser global; the browser side
 * is proven by scripts/selftest.mjs and TP-028-04-02).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const RLVOL = require('../rlvol.js');

function lcg(seed) {
    let s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function gaussian(rand) {
    let u1 = rand(); const u2 = rand();
    if (u1 < 1e-12) u1 = 1e-12;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function genRoughLogVolPath(H, n, seed, phi, ampl) {
    const d = H - 0.5;
    const truncate = 200;
    const rand = lcg(seed);
    const w = new Array(truncate);
    w[0] = 1;
    for (let j = 1; j < truncate; j += 1) w[j] = w[j - 1] * ((j - 1 + d) / j);
    const eps = new Array(n + truncate);
    for (let i = 0; i < eps.length; i += 1) eps[i] = gaussian(rand);
    const path = [];
    let acc = 0;
    for (let t = 0; t < n; t += 1) {
        let fgn = 0;
        for (let j = 0; j < truncate; j += 1) fgn += w[j] * eps[t + truncate - 1 - j];
        acc = phi * acc + fgn * ampl;
        path.push(acc);
    }
    return path;
}
function syntheticBars(n, seed) {
    const path = genRoughLogVolPath(0.6, n, seed, 0.995, 0.35);
    const rand = lcg(seed + 1);
    const closes = [100];
    for (let i = 0; i < n; i += 1) {
        const annualVol = 0.20 * Math.exp(path[i]);
        const dailyVol = annualVol / Math.sqrt(252);
        const z = gaussian(rand);
        closes.push(closes[closes.length - 1] * Math.exp(dailyVol * z));
    }
    return closes.map((c, i) => ({ t: Date.UTC(2000, 0, 1) + i * 86400000, c }));
}
function baseInput(bars, overrides) {
    return Object.assign({
        contractVersion: 'rlvol-roughness-input/v1',
        parentDecisionId: 'vold-v1-testparent',
        decisionTime: '2000-01-01T00:00:00.000Z',
        source: {
            id: 'test-source', url: null, symbol: 'TESTX', interval: '1d',
            observedAsOf: '2000-01-01', retrievedAt: '2000-01-01T00:00:00.000Z',
            freshness: 'fresh', sourceObservationCount: bars.length
        },
        bars: bars,
        settings: RLVOL.roughnessSettings()
    }, overrides || {});
}

test('RLVOL diagnostic contract is immutable and keeps admitted and withheld states distinct', () => {
    const settings = Object.assign({}, RLVOL.roughnessSettings(), {
        minimumCommonR2: 0.80, maximumCommonResidual: 0.30,
        bootstrapResamples: 60, minimumCompleteResamples: 30, maximumIntervalWidth: 0.6
    });
    const bars = syntheticBars(2000, 4242);
    const originalBarsSnapshot = JSON.parse(JSON.stringify(bars));
    const input = baseInput(bars, { settings });
    const inputSnapshot = JSON.parse(JSON.stringify(input));

    const proxy = RLVOL.buildObservedLogVolPath(input);
    let state = RLVOL.startRoughnessBootstrap(proxy.values, settings, {
        parentDecisionId: input.parentDecisionId, decisionTime: input.decisionTime, source: input.source
    });
    state = RLVOL.stepRoughnessBootstrap(state, 60);
    const finalized = RLVOL.finalizeRoughnessBootstrap(state);

    const supported = RLVOL.buildRoughnessDiagnostic(input, finalized);
    assert.equal(supported.state, 'supported');

    /* caller input is never mutated */
    assert.deepEqual(bars, originalBarsSnapshot);
    assert.deepEqual(JSON.parse(JSON.stringify(input)), inputSnapshot);

    /* deep immutability of every nested contract shape */
    assert.ok(Object.isFrozen(supported));
    assert.ok(Object.isFrozen(supported.proxy));
    assert.ok(Object.isFrozen(supported.proxy.exclusions));
    assert.ok(Object.isFrozen(supported.settings));
    assert.ok(Object.isFrozen(supported.settings.momentOrders));
    assert.ok(Object.isFrozen(supported.structureFunctions));
    supported.structureFunctions.forEach((p) => assert.ok(Object.isFrozen(p)));
    assert.ok(Object.isFrozen(supported.scalingFits));
    supported.scalingFits.forEach((f) => { assert.ok(Object.isFrozen(f)); assert.ok(Object.isFrozen(f.residuals)); });
    assert.ok(Object.isFrozen(supported.commonFit));
    assert.ok(Object.isFrozen(supported.bootstrap));
    assert.ok(Object.isFrozen(supported.conclusion));
    assert.ok(Object.isFrozen(supported.limitations));
    assert.throws(() => { supported.structureFunctions[0].value = 999; });
    assert.throws(() => { supported.conclusion.h = 0.99; });

    /* unavailable state is machine-readable and distinct: withheld with a closed reason */
    const tinyBars = [];
    for (let i = 0; i <= 50; i += 1) tinyBars.push({ t: Date.UTC(2001, 0, 1) + i * 86400000, c: 100 + i * 0.01 });
    const unavailableInput = baseInput(tinyBars, { settings });
    const unavailable = RLVOL.buildRoughnessDiagnostic(unavailableInput, undefined);
    assert.equal(unavailable.state, 'unavailable');
    assert.notEqual(unavailable.state, supported.state);
    assert.equal(unavailable.conclusion.h, null);
    assert.equal(unavailable.conclusion.classification, null);
    assert.ok(unavailable.reasons.includes('RETAINED_OBSERVATIONS_BELOW_500'));
    /* valid intermediate evidence remains inspectable (proxy accounting) even when withheld */
    assert.equal(typeof unavailable.proxy.retainedObservationCount, 'number');
    assert.equal(typeof unavailable.proxy.sourceObservationCount, 'number');

    /* CommonJS export shape is stable and versioned */
    assert.equal(typeof RLVOL.buildRoughnessDiagnostic, 'function');
    assert.equal(typeof RLVOL.startRoughnessBootstrap, 'function');
    assert.equal(typeof RLVOL.stepRoughnessBootstrap, 'function');
    assert.equal(typeof RLVOL.finalizeRoughnessBootstrap, 'function');
    assert.equal(supported.contractVersion, 'rlvol-roughness-diagnostic/v1');
    assert.equal(unavailable.contractVersion, 'rlvol-roughness-diagnostic/v1');

    /* existing Feature 011 exports remain present and untouched by this additive module */
    assert.equal(typeof RLVOL.buildVolDecisionRead, 'function');
    assert.equal(typeof RLVOL.projectVolToolRead, 'function');
});

test('RLVOL roughness contract errors use the existing closed error shape for contract misuse', () => {
    assert.throws(() => RLVOL.buildRoughnessDiagnostic({ contractVersion: 'wrong/v1' }, undefined),
        (err) => err && err.code === 'RLVOL_CONTRACT_VERSION');
    assert.throws(() => RLVOL.buildRoughnessDiagnostic({ contractVersion: 'rlvol-roughness-input/v1' }, undefined),
        (err) => err && (err.code === 'RLVOL_SCHEMA_INVALID' || err.message === 'RLVOL_DECISION_TIME_INVALID'));
    assert.throws(() => RLVOL.finalizeRoughnessBootstrap({ contractVersion: 'wrong/v1' }),
        (err) => err && err.code === 'RLVOL_CONTRACT_VERSION');
});
