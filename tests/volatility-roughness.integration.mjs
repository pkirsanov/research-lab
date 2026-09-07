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
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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

/* ── SCOPE-028-02: Additive Decision and Conflict Projection ── */

function buildDecisionFixture(seed, overrides) {
    const closes = [100];
    let s = seed >>> 0;
    const rng = () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    for (let i = 0; i < 300; i += 1) {
        const r = (rng() * 2 - 1) * 0.01;
        closes.push(closes[closes.length - 1] * Math.exp(r));
    }
    const rows = closes.map((c, i) => ({ t: Date.UTC(2024, 0, 1) + i * 86400000, c }));
    return RLVOL.buildVolDecisionRead(Object.assign({
        decisionTime: '2024-06-01T12:00:00.000Z',
        configVersion: 'test-rlvol-v1',
        controls: { asset: 'SPY', estimator: 'ewma', termLengthDays: 21, targetVol: 0.15, notional: 100000, historyRange: '5y' },
        asset: { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', cohort: 'equity-index', management: 'free-float', defaultTargetVol: 0.15, regimeWindowObs: 120, minForecastObs: 60, reviewWindowHours: 100000, limitations: [] },
        policy: { ewma: { lambda: 0.94, seedWindow: 20 }, garch: { maxIter: 200, tolerance: 1e-8, minOmega: 1e-12, maxPersistence: 0.999 }, forecast: { defaultHorizonDays: 21, maxHorizonDays: 63, annualization: 252 }, regime: { calmMaxPct: 25, normalMaxPct: 75, elevatedMaxPct: 95 }, sizing: { cap: 2.0, forecastVolFloor: 0.05 }, managedSuppression: { zeroReturnFraction: 0.30, minAbsDailyReturn: 0.0005, identicalCloseRun: 10 }, history: { defaultRange: '5y', longRangeOptions: ['10y', 'max'], dailyBarReviewHours: 100000 } },
        bars: { rows, observedAsOf: '2024-10-27', retrievedAt: '2024-06-01T11:30:00.000Z', source: { id: 'test-snapshot', url: null } }
    }, overrides || {}));
}

function realDiagnosticForDecision(decision, classification) {
    /* build a genuine rlvol-roughness-diagnostic/v1 from real production formulas (same
       synthetic-fixture pattern as SCN-028-001), then fabricate only the finalized-bootstrap
       interval endpoints (the caller-owned stage) to hit each classification boundary. */
    const bars = syntheticBars(2000, 4242);
    const settings = Object.assign({}, RLVOL.roughnessSettings());
    const input = Object.assign(baseInput(bars, { settings }), { parentDecisionId: decision.decisionId });
    const bounds = classification === 'below-0.5' ? [0.30, 0.44]
        : classification === 'above-0.5' ? [0.55, 0.70]
        : [0.4, 0.6];
    const proxy = RLVOL.buildObservedLogVolPath(input);
    const points = RLVOL.buildStructureFunctions(proxy.values, settings);
    const fits = settings.momentOrders.map((q) => RLVOL.fitScalingExponent(points, q, settings));
    const common = RLVOL.fitCommonH(fits, settings);
    if (common.state !== 'admitted') throw new Error('test fixture common fit did not admit');
    const finalized = Object.freeze({
        state: 'admitted', method: 'moving-block-noncircular', blockLength: settings.bootstrapBlockLength,
        requestedResamples: settings.bootstrapResamples, completeResamples: settings.bootstrapResamples,
        seedIdentity: 'integration-test-seed', lower95: bounds[0], upper95: bounds[1], intervalWidth: bounds[1] - bounds[0],
        reasons: Object.freeze([])
    });
    return RLVOL.buildRoughnessDiagnostic(input, finalized);
}

test('Regression: SCN-028-008 projects one non-blocking below-benchmark conflict without mutating the base decision', () => {
    const decision = buildDecisionFixture(9001);
    const decisionSnapshot = RLVOL.canonicalize(decision);
    const diagnostic = realDiagnosticForDecision(decision, 'below-0.5');
    assert.equal(diagnostic.conclusion.classification, 'below-0.5');

    const projection = RLVOL.buildDiagnosticProjection(decision, 'available', diagnostic);
    assert.equal(projection.contractVersion, 'rlvol-decision-diagnostic-projection/v1');
    assert.equal(projection.conflicts.length, 1);
    assert.equal(projection.conflicts[0].code, 'MODEL_ASSUMPTION_H05_CONFLICT');
    assert.equal(projection.conflicts[0].blocking, false);
    assert.equal(projection.conflicts[0].diagnosticId, diagnostic.diagnosticId);
    assert.equal(projection.conflicts[0].parentDecisionId, decision.decisionId);

    /* no base mutation */
    assert.equal(RLVOL.canonicalize(decision), decisionSnapshot);
    assert.equal(projection.baseDecision, decision);
    assert.ok(Object.isFrozen(projection));
    assert.throws(() => { projection.projectionState = 'disabled'; });
});

test('Regression: benchmark containment emits no conflict and above-benchmark evidence stays non-directional', () => {
    const decision = buildDecisionFixture(9002);

    const containDiagnostic = realDiagnosticForDecision(decision, 'indistinguishable-from-0.5');
    const containProjection = RLVOL.buildDiagnosticProjection(decision, 'available', containDiagnostic);
    assert.equal(containProjection.conflicts.length, 0);

    const aboveDiagnostic = realDiagnosticForDecision(decision, 'above-0.5');
    const aboveProjection = RLVOL.buildDiagnosticProjection(decision, 'available', aboveDiagnostic);
    assert.equal(aboveProjection.conflicts.length, 1);
    const prose = JSON.stringify(aboveProjection.conflicts) + JSON.stringify(aboveProjection.modelAssumptionDiagnostic.conclusion);
    assert.ok(!/bullish|bearish|\blong\b|\bshort\b|\bbuy\b|\bsell\b/i.test(prose), 'above-benchmark evidence must carry no directional trading language');
});

test('Regression: SCN-028-013 preserves exact Feature 011 bytes and parent identity in every wrapper state', () => {
    const decision = buildDecisionFixture(9003);
    const originalBytes = RLVOL.canonicalize(decision);
    const originalKeys = Object.keys(decision).sort();
    const originalConflictsBytes = JSON.stringify(decision.conflicts);
    const originalDecisionId = decision.decisionId;

    const below = realDiagnosticForDecision(decision, 'below-0.5');
    const contain = realDiagnosticForDecision(decision, 'indistinguishable-from-0.5');
    const above = realDiagnosticForDecision(decision, 'above-0.5');

    const cases = [
        ['disabled', null],
        ['pending', null],
        ['available', below],
        ['available', contain],
        ['available', above]
    ];

    cases.forEach(([projectionState, diagnostic]) => {
        const projection = RLVOL.buildDiagnosticProjection(decision, projectionState, diagnostic);
        assert.equal(projection.baseDecision, decision, 'exact base object reference for state ' + projectionState);
        assert.equal(RLVOL.canonicalize(decision), originalBytes, 'canonical bytes unchanged for state ' + projectionState);
        assert.deepEqual(Object.keys(decision).sort(), originalKeys, 'exact key set unchanged for state ' + projectionState);
        assert.equal(JSON.stringify(decision.conflicts), originalConflictsBytes, 'conflict order/content unchanged for state ' + projectionState);
        assert.equal(decision.contractVersion, 'rlvol-decision-read/v1');
        assert.equal(decision.decisionId, originalDecisionId);
        assert.equal(projection.parentDecisionId, originalDecisionId);
        if (projectionState === 'available') {
            assert.equal(projection.diagnosticId, diagnostic.diagnosticId);
            assert.equal(projection.modelAssumptionDiagnostic.parentDecisionId, originalDecisionId);
        } else {
            assert.equal(projection.diagnosticId, null);
            assert.equal(projection.modelAssumptionDiagnostic, null);
            assert.deepEqual(projection.conflicts, []);
        }
    });

    /* a rigid parser bound to the exact Feature 011 v1 key set accepts wrapper.baseDecision in
       every state but rejects the wrapper object itself as a different, unrecognized contract */
    function rigidV1Parse(candidate) {
        const keys = Object.keys(candidate).sort();
        if (keys.length !== originalKeys.length || keys.some((k, i) => k !== originalKeys[i])) {
            throw new Error('RIGID_PARSER_UNKNOWN_SHAPE');
        }
        if (candidate.contractVersion !== 'rlvol-decision-read/v1') throw new Error('RIGID_PARSER_WRONG_VERSION');
        return candidate;
    }
    const availableProjection = RLVOL.buildDiagnosticProjection(decision, 'available', below);
    cases.forEach(([projectionState, diagnostic]) => {
        const projection = RLVOL.buildDiagnosticProjection(decision, projectionState, diagnostic);
        assert.doesNotThrow(() => rigidV1Parse(projection.baseDecision));
        assert.throws(() => rigidV1Parse(projection));
    });
    assert.equal(rigidV1Parse(availableProjection.baseDecision).decisionId, originalDecisionId);

    /* the unchanged owner-read projection continues to consume only projection.baseDecision */
    const ownerRead = RLVOL.projectVolToolRead(availableProjection.baseDecision);
    assert.equal(ownerRead.metrics.decisionId, originalDecisionId);
    assert.equal(ownerRead.metrics.conflicts.length, decision.conflicts.length);
});

test('RLVOL roughness contract errors use the existing closed error shape for contract misuse', () => {
    assert.throws(() => RLVOL.buildRoughnessDiagnostic({ contractVersion: 'wrong/v1' }, undefined),
        (err) => err && err.code === 'RLVOL_CONTRACT_VERSION');
    assert.throws(() => RLVOL.buildRoughnessDiagnostic({ contractVersion: 'rlvol-roughness-input/v1' }, undefined),
        (err) => err && (err.code === 'RLVOL_SCHEMA_INVALID' || err.message === 'RLVOL_DECISION_TIME_INVALID'));
    assert.throws(() => RLVOL.finalizeRoughnessBootstrap({ contractVersion: 'wrong/v1' }),
        (err) => err && err.code === 'RLVOL_CONTRACT_VERSION');
});

/* ═══════════ SCOPE-028-04: Integration, Snapshot, Compatibility, Performance, and Release Proof ═══════════ */

/* ── TP-028-04-01 / SCN-028-011: one immutable cached-snapshot evaluation, honestly labeled stale ── */

test('Regression: SCN-028-011 evaluates one immutable cached snapshot without ensureBars', () => {
    const bars = syntheticBars(2000, 4242);
    const settings = RLVOL.roughnessSettings();

    /* Mirrors readCachedBars()+enableRoughness() in volatility-sizing-lab.html: a frozen snapshot
       of `runtime.bars` plus its RLDATA.barInfo() derived metadata is captured ONCE. This test
       proves the formula-owned diagnostic accepts and computes from a source explicitly marked
       "stale" (a usable-but-old cache, distinct from "unavailable" meaning no rows at all) rather
       than silently promoting it to "fresh" or refusing to compute. */
    const staleRetrievedAt = '2000-01-01T00:00:00.000Z'; // far in the past relative to decisionTime
    const staleInput = baseInput(bars, {
        settings,
        decisionTime: '2005-01-01T00:00:00.000Z',
        source: {
            id: 'test-source', url: null, symbol: 'TESTX', interval: '1d',
            observedAsOf: '2000-01-01', retrievedAt: staleRetrievedAt,
            freshness: 'stale', sourceObservationCount: bars.length
        }
    });

    const proxy = RLVOL.buildObservedLogVolPath(staleInput);
    assert.ok(proxy.retainedObservationCount >= settings.minimumProxyObservations,
        'the stale-but-present snapshot must still be computed, never withheld merely for being stale');

    let state = RLVOL.startRoughnessBootstrap(proxy.values, settings, {
        parentDecisionId: staleInput.parentDecisionId, decisionTime: staleInput.decisionTime, source: staleInput.source
    });
    state = RLVOL.stepRoughnessBootstrap(state, settings.bootstrapResamples);
    const finalized = RLVOL.finalizeRoughnessBootstrap(state);
    const diagnostic = RLVOL.buildRoughnessDiagnostic(staleInput, finalized);

    /* the diagnostic computed (state is not "unavailable" merely because the source is stale) and
       carries the exact source timing forward for presentation to label, unmodified */
    assert.notEqual(diagnostic.state, 'unavailable');
    assert.equal(diagnostic.source.freshness, 'stale');
    assert.equal(diagnostic.source.retrievedAt, staleRetrievedAt);

    /* a second, fresh-labeled evaluation over the IDENTICAL bars produces the identical canonical
       diagnostic bytes except for the source metadata itself — proving the formula performs no
       hidden re-fetch, re-derivation, or second read of "current" staleness on its own */
    const freshInput = baseInput(bars, {
        settings,
        decisionTime: staleInput.decisionTime,
        parentDecisionId: staleInput.parentDecisionId,
        source: Object.assign({}, staleInput.source, { freshness: 'fresh' })
    });
    let freshState = RLVOL.startRoughnessBootstrap(proxy.values, settings, {
        parentDecisionId: freshInput.parentDecisionId, decisionTime: freshInput.decisionTime, source: freshInput.source
    });
    freshState = RLVOL.stepRoughnessBootstrap(freshState, settings.bootstrapResamples);
    const freshFinalized = RLVOL.finalizeRoughnessBootstrap(freshState);
    const freshDiagnostic = RLVOL.buildRoughnessDiagnostic(freshInput, freshFinalized);
    /* diagnosticId and bootstrap.seedIdentity are, by design, derived FROM source (Feature 028's
       identity basis includes parentDecisionId/decisionTime/source — see basisForIdentity in
       rlvol.js), so a freshness-label change legitimately changes them; every other computed
       evidence field must be identical since the underlying bars and formulas did not change. */
    const withoutSource = (d) => Object.assign({}, d, {
        source: undefined, computedAt: undefined, diagnosticId: undefined,
        bootstrap: Object.assign({}, d.bootstrap, { seedIdentity: undefined })
    });
    assert.deepEqual(JSON.parse(JSON.stringify(withoutSource(diagnostic))), JSON.parse(JSON.stringify(withoutSource(freshDiagnostic))),
        'only the source freshness label (and its identity-basis derivatives) differs; every computed evidence field is unaffected by the stale/fresh label itself');

    /* the immutable snapshot contract: neither call above ever names or requires ensureBars/hydrate/fetch —
       buildRoughnessDiagnostic and its formula-owned bootstrap stages take only an explicit bars array and
       never reference a global RLDATA, network, or timer surface (this module is the pure UMD formula owner) */
    const rlvolSource = readFileSync(new URL('../rlvol.js', import.meta.url), 'utf8');
    assert.ok(!/ensureBars|\bhydrate\s*\(|\bfetch\s*\(/.test(rlvolSource),
        'rlvol.js must call no ensureBars, hydrate, or fetch from any formula path');

    /* an independent, already-in-flight refresh producing a DIFFERENT bars array is simply a
       different input to a fresh diagnostic build — it never mutates the frozen snapshot already
       captured above; the diagnosticId changes because the underlying evidence genuinely changed */
    const refreshedBars = syntheticBars(2000, 4242).concat([{ t: bars[bars.length - 1].t + 86400000, c: bars[bars.length - 1].c * 1.01 }]);
    const refreshedInput = baseInput(refreshedBars, { settings, decisionTime: staleInput.decisionTime, parentDecisionId: staleInput.parentDecisionId, source: freshInput.source });
    const refreshedProxy = RLVOL.buildObservedLogVolPath(refreshedInput);
    let refreshedState = RLVOL.startRoughnessBootstrap(refreshedProxy.values, settings, {
        parentDecisionId: refreshedInput.parentDecisionId, decisionTime: refreshedInput.decisionTime, source: refreshedInput.source
    });
    refreshedState = RLVOL.stepRoughnessBootstrap(refreshedState, settings.bootstrapResamples);
    const refreshedFinalized = RLVOL.finalizeRoughnessBootstrap(refreshedState);
    const refreshedDiagnostic = RLVOL.buildRoughnessDiagnostic(refreshedInput, refreshedFinalized);
    assert.notEqual(refreshedDiagnostic.diagnosticId, diagnostic.diagnosticId,
        'a later independent refresh with different bars must produce a distinct diagnostic identity rather than silently overwriting the earlier frozen snapshot result');
    /* and the ORIGINAL diagnostic object, already returned above, remains byte-identical: nothing
       mutated it when the "independent refresh" input was built and evaluated afterward */
    assert.equal(RLVOL.canonicalize(diagnostic), RLVOL.canonicalize(RLVOL.buildRoughnessDiagnostic(staleInput, finalized)));
});

/* ── TP-028-04-02 / SCN-028-012: browser-global and CommonJS diagnostics are canonically identical ── */

test('SCN-028-012 browser-global and CommonJS diagnostics are canonically identical', () => {
    /* Load the EXACT same rlvol.js source text a second time, executed under a vm sandbox that has
       no `module`/`module.exports` object — forcing the UMD factory down its browser-global
       `globalThis.RLVOL = api` branch instead of the `module.exports = api` branch createRequire()
       already exercised for the RLVOL binding used throughout this file. This proves the two UMD
       consumption paths are not just similarly-shaped but produce byte-identical results from
       identical input, per Hard Constraint 8. */
    const source = readFileSync(new URL('../rlvol.js', import.meta.url).pathname, 'utf8');
    /* an EMPTY sandbox, contextified by vm itself: vm.createContext() gives this context its own
       fresh realm intrinsics (its own Array, Object, JSON, ...). rlvol.js's own isPlainObject()
       compares Object.getPrototypeOf(value) against ITS OWN realm's Object.prototype, so a plain
       object built in the outer (Node test) realm and handed across the boundary would fail that
       check even though it is a perfectly ordinary object — the classic cross-realm-identity trap.
       The fix used below is to build the packet AND run the whole diagnostic INSIDE the vm realm
       from a JSON string (primitives only cross the boundary), so every object the formula inspects
       is a same-realm object, exactly like a real browser page never sharing objects with Node. */
    const sandbox = { console };
    vm.createContext(sandbox);
    vm.runInContext('(function(){' + source + '\n})();', sandbox, { filename: 'rlvol.browser-global.vm.js' });
    const BrowserRLVOL = sandbox.RLVOL;
    assert.equal(typeof BrowserRLVOL, 'object', 'the browser-global UMD branch must attach RLVOL to globalThis when no CommonJS module object exists');
    assert.notEqual(BrowserRLVOL, RLVOL, 'the two consumers must be genuinely separate module evaluations, not the same cached object');

    const bars = syntheticBars(1200, 777);
    const settings = RLVOL.roughnessSettings();
    const packet = baseInput(bars, { settings, decisionTime: '2003-05-01T00:00:00.000Z' });
    const packetJson = JSON.stringify(packet);

    function runDiagnosticNode() {
        const proxy = RLVOL.buildObservedLogVolPath(packet);
        const seedIdentity = { parentDecisionId: packet.parentDecisionId, decisionTime: packet.decisionTime, source: packet.source };
        let state = RLVOL.startRoughnessBootstrap(proxy.values, packet.settings, seedIdentity);
        // exercise batch sizes 1, 7, 25 and the remainder — proving both consumers share one deterministic start-index sequence
        [1, 7, 25].forEach((batch) => { state = RLVOL.stepRoughnessBootstrap(state, batch); });
        while (state.nextResampleIndex < packet.settings.bootstrapResamples) state = RLVOL.stepRoughnessBootstrap(state, 500);
        const finalized = RLVOL.finalizeRoughnessBootstrap(state);
        return RLVOL.buildRoughnessDiagnostic(packet, finalized);
    }

    const nodeDiagnostic = runDiagnosticNode();

    sandbox.PACKET_JSON = packetJson;
    const browserResultJson = vm.runInContext(
        'JSON.stringify((function () {' +
        '  var packet = JSON.parse(PACKET_JSON);' +
        '  var proxy = RLVOL.buildObservedLogVolPath(packet);' +
        '  var seedIdentity = { parentDecisionId: packet.parentDecisionId, decisionTime: packet.decisionTime, source: packet.source };' +
        '  var state = RLVOL.startRoughnessBootstrap(proxy.values, packet.settings, seedIdentity);' +
        '  [1, 7, 25].forEach(function (batch) { state = RLVOL.stepRoughnessBootstrap(state, batch); });' +
        '  while (state.nextResampleIndex < packet.settings.bootstrapResamples) state = RLVOL.stepRoughnessBootstrap(state, 500);' +
        '  var finalized = RLVOL.finalizeRoughnessBootstrap(state);' +
        '  var diagnostic = RLVOL.buildRoughnessDiagnostic(packet, finalized);' +
        '  return { canonical: RLVOL.canonicalize(diagnostic), diagnostic: diagnostic };' +
        '})());',
        sandbox, { filename: 'rlvol.browser-global.run.vm.js' }
    );
    const browserResult = JSON.parse(browserResultJson);
    const browserDiagnostic = browserResult.diagnostic;

    assert.equal(browserResult.canonical, RLVOL.canonicalize(nodeDiagnostic),
        'canonical bytes (each produced by RLVOL.canonicalize() in its OWN realm) must be identical between the browser-global and CommonJS UMD consumers');
    assert.equal(browserDiagnostic.diagnosticId, nodeDiagnostic.diagnosticId);
    assert.equal(browserDiagnostic.state, nodeDiagnostic.state);
    assert.deepEqual(browserDiagnostic.reasons, nodeDiagnostic.reasons);
    assert.deepEqual(browserDiagnostic.bootstrap, nodeDiagnostic.bootstrap);
    assert.deepEqual(browserDiagnostic.conclusion, nodeDiagnostic.conclusion);

    /* the pre-existing Feature 011 registry trio (buildVolDecisionRead/projectVolToolRead/canonicalize)
       is present and functionally identical on both UMD branches too — this module has one owner */
    assert.equal(typeof BrowserRLVOL.buildVolDecisionRead, 'function');
    assert.equal(typeof BrowserRLVOL.projectVolToolRead, 'function');
    assert.equal(typeof BrowserRLVOL.buildDiagnosticProjection, 'function');
});
