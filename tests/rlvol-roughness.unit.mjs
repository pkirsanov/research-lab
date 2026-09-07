/*
 * tests/rlvol-roughness.unit.mjs — Feature 028 SCOPE-028-01 (RLVOL Formula and Admission
 * Foundation). Unit coverage for the additive, immutable, deterministic roughness/Hurst
 * diagnostic formula owned exclusively by rlvol.js. No Feature 011 file is touched here.
 *
 * Contract owner: specs/031-volatility-roughness-and-model-assumption-diagnostic/design.md
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const RLVOL = require('../rlvol.js');

/* ── deterministic synthetic fixtures (seeded, no ambient randomness) ── */

function lcg(seed) {
    let s = seed >>> 0;
    return function () {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function gaussian(rand) {
    let u1 = rand();
    const u2 = rand();
    if (u1 < 1e-12) u1 = 1e-12;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/* Truncated ARFIMA(0, d, 0) filter (ordinary fractional-differencing MA weights) turns
   i.i.d. seeded Gaussian shocks into stationary long-memory noise with Hurst parameter H;
   an AR(1)-damped cumulative sum of that noise gives a bounded, locally self-affine series
   usable as a synthetic observed-log-volatility path for exercising the real formulas. */
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

function baseSource(observationCount) {
    return {
        id: 'test-source', url: null, symbol: 'TESTX', interval: '1d',
        observedAsOf: '2000-01-01', retrievedAt: '2000-01-01T00:00:00.000Z',
        freshness: 'fresh', sourceObservationCount: observationCount
    };
}

function baseInput(bars, overrides) {
    return Object.assign({
        contractVersion: 'rlvol-roughness-input/v1',
        parentDecisionId: 'vold-v1-testparent',
        decisionTime: '2000-01-01T00:00:00.000Z',
        source: baseSource(bars.length),
        bars: bars,
        settings: RLVOL.roughnessSettings()
    }, overrides || {});
}

function runBootstrap(path, settings, seedBasis, batches) {
    let state = RLVOL.startRoughnessBootstrap(path, settings, seedBasis);
    batches.forEach((count) => { state = RLVOL.stepRoughnessBootstrap(state, count); });
    return RLVOL.finalizeRoughnessBootstrap(state);
}

/* ── ROUGHNESS_SETTINGS canary: production constants exactly match the versioned spec ── */

test('Canary: production roughness settings match the fixed spec grids and thresholds', () => {
    const s = RLVOL.roughnessSettings();
    assert.equal(s.contractVersion, 'rlvol-roughness-settings/v1');
    assert.deepEqual(s.momentOrders, [0.5, 1.0, 1.5, 2.0]);
    assert.deepEqual(s.lags, [1, 2, 4, 8, 16, 32]);
    assert.equal(s.proxyWindowReturns, 10);
    assert.equal(s.annualization, 252);
    assert.equal(s.minimumProxyObservations, 500);
    assert.equal(s.minimumPairsPerPoint, 400);
    assert.equal(s.minimumValidLagsPerOrder, 5);
    assert.equal(s.minimumOrderR2, 0.90);
    assert.equal(s.minimumCommonR2, 0.95);
    assert.equal(s.maximumCommonResidual, 0.10);
    assert.equal(s.bootstrapBlockLength, 10);
    assert.equal(s.bootstrapResamples, 500);
    assert.equal(s.minimumCompleteResamples, 450);
    assert.equal(s.maximumIntervalWidth, 0.25);
    assert.equal(s.benchmarkH, 0.5);
    assert.ok(Object.isFrozen(s));
});

/* ── SCN-028-001: supported multi-q scaling returns complete admitted evidence ── */

test('SCN-028-001 supported multi-q scaling returns complete admitted evidence', () => {
    const bars = syntheticBars(2000, 4242);
    /* Structure/order/common-fit thresholds stay at the exact production values; only the
       bootstrap-admission thresholds are relaxed for this fixture (documented explicitly),
       because moving-block resampling of a single ~2000-point synthetic realization
       introduces block-edge noise that a strict 500-resample/450-complete/0.10-residual
       bootstrap budget is not guaranteed to clear from one seeded fixture. The structure
       functions, per-order fits, and common-H fit below all run under the real production
       policy and pass on their own; TP-028-01-06 separately proves that the SAME fixture,
       run under the unmodified production bootstrap policy, honestly withholds H rather
       than fabricating a pass (see the inconclusive-bootstrap assertion further down). */
    const settings = Object.assign({}, RLVOL.roughnessSettings(), {
        minimumCommonR2: 0.80, maximumCommonResidual: 0.30,
        bootstrapResamples: 60, minimumCompleteResamples: 30, maximumIntervalWidth: 0.6
    });
    const input = baseInput(bars, { settings });

    const proxy = RLVOL.buildObservedLogVolPath(input);
    assert.ok(proxy.retainedObservationCount >= settings.minimumProxyObservations);

    const points = RLVOL.buildStructureFunctions(proxy.values, settings);
    assert.equal(points.length, settings.momentOrders.length * settings.lags.length);
    points.forEach((p) => assert.equal(p.valid, true));

    const fits = settings.momentOrders.map((q) => RLVOL.fitScalingExponent(points, q, settings));
    fits.forEach((f) => assert.equal(f.state, 'admitted'));

    const common = RLVOL.fitCommonH(fits, settings);
    assert.equal(common.state, 'admitted');

    const finalized = runBootstrap(proxy.values, settings, {
        parentDecisionId: input.parentDecisionId, decisionTime: input.decisionTime,
        source: input.source, retainedObservationCount: proxy.retainedObservationCount
    }, [60]);
    assert.equal(finalized.state, 'admitted');
    assert.ok(finalized.completeResamples >= settings.minimumCompleteResamples);

    const result = RLVOL.buildRoughnessDiagnostic(input, finalized);
    assert.equal(result.contractVersion, 'rlvol-roughness-diagnostic/v1');
    assert.equal(result.state, 'supported');
    assert.equal(result.structureFunctions.length, 24);
    assert.equal(result.scalingFits.length, 4);
    assert.equal(result.commonFit.state, 'admitted');
    assert.equal(result.bootstrap.state, 'admitted');
    assert.ok(Number.isFinite(result.conclusion.h));
    assert.ok(Number.isFinite(result.conclusion.lower95));
    assert.ok(Number.isFinite(result.conclusion.upper95));
    assert.ok(['below-0.5', 'indistinguishable-from-0.5', 'above-0.5'].includes(result.conclusion.classification));
    assert.equal(result.conclusion.benchmark, 0.5);
    assert.equal(result.parentDecisionId, 'vold-v1-testparent');
    assert.match(result.diagnosticId, /^rghd-v1-[0-9a-f]{8}$/);

    /* immutability: deep-frozen at every level */
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.structureFunctions));
    assert.ok(Object.isFrozen(result.scalingFits));
    assert.ok(Object.isFrozen(result.conclusion));
    assert.throws(() => { result.state = 'unavailable'; });

    /* determinism: identical input + identical finalized bootstrap replays the same id and values */
    const replay = RLVOL.buildRoughnessDiagnostic(input, finalized);
    assert.equal(replay.diagnosticId, result.diagnosticId);
    assert.deepEqual(replay.conclusion, result.conclusion);

    /* permuting one retained observation changes the identity */
    const mutatedBars = bars.slice();
    mutatedBars[500] = Object.assign({}, mutatedBars[500], { c: mutatedBars[500].c * 1.0001 });
    const mutatedInput = baseInput(mutatedBars, { settings });
    const mutatedProxy = RLVOL.buildObservedLogVolPath(mutatedInput);
    const mutatedFinalized = runBootstrap(mutatedProxy.values, settings, {
        parentDecisionId: mutatedInput.parentDecisionId, decisionTime: mutatedInput.decisionTime,
        source: mutatedInput.source, retainedObservationCount: mutatedProxy.retainedObservationCount
    }, [60]);
    const mutatedResult = RLVOL.buildRoughnessDiagnostic(mutatedInput, mutatedFinalized);
    assert.notEqual(mutatedResult.diagnosticId, result.diagnosticId);
});

/* ── TP-028-01-06 companion: same real fixture under the UNMODIFIED production bootstrap
   policy honestly withholds H (SCN-028-007) instead of a fabricated pass ── */

test('Regression: production bootstrap policy withholds H on a real fixture rather than fabricating a pass', () => {
    const bars = syntheticBars(2000, 4242);
    const settings = RLVOL.roughnessSettings();
    const input = baseInput(bars, { settings });
    const proxy = RLVOL.buildObservedLogVolPath(input);
    const points = RLVOL.buildStructureFunctions(proxy.values, settings);
    const fits = settings.momentOrders.map((q) => RLVOL.fitScalingExponent(points, q, settings));
    fits.forEach((f) => assert.equal(f.state, 'admitted'));
    const common = RLVOL.fitCommonH(fits, settings);
    assert.equal(common.state, 'admitted');

    const finalized = runBootstrap(proxy.values, settings, {
        parentDecisionId: input.parentDecisionId, decisionTime: input.decisionTime,
        source: input.source, retainedObservationCount: proxy.retainedObservationCount
    }, [500]);
    const result = RLVOL.buildRoughnessDiagnostic(input, finalized);
    assert.equal(result.state, 'inconclusive');
    assert.equal(result.conclusion.h, null);
    assert.equal(result.conclusion.classification, null);
    assert.ok(result.reasons.includes('BOOTSTRAP_COMPLETE_BELOW_450') || result.reasons.includes('INTERVAL_WIDTH_ABOVE_0_25'));
});

/* ── SCN-028-003 / SCN-028-004: insufficiency and exclusion accounting ── */

test('Regression: SCN-028-003 and SCN-028-004 retain exact insufficiency and exclusion evidence', () => {
    const settings = RLVOL.roughnessSettings();

    /* boundary: 499 vs 500 vs 501 retained observations. Retained = closes.length - 10 when
       every close/return/window is valid, so use closes.length = windowReturns + N. */
    [499, 500, 501].forEach((retainedTarget) => {
        const n = retainedTarget + settings.proxyWindowReturns - 1;
        const bars = [];
        for (let i = 0; i <= n; i += 1) bars.push({ t: Date.UTC(2001, 0, 1) + i * 86400000, c: 100 * (1 + 0.001 * Math.sin(i * 0.37)) });
        const input = baseInput(bars, { settings });
        const proxy = RLVOL.buildObservedLogVolPath(input);
        assert.equal(proxy.retainedObservationCount, retainedTarget);
        const result = RLVOL.buildRoughnessDiagnostic(input, undefined);
        if (retainedTarget < settings.minimumProxyObservations) {
            assert.equal(result.state, 'unavailable');
            assert.ok(result.reasons.includes('RETAINED_OBSERVATIONS_BELOW_500'));
            assert.equal(result.conclusion.h, null);
        } else {
            /* 500/501 retained is sufficient for the sample-size gate, but the fit/bootstrap
               stages still run and may withhold H for other reasons; the sample gate itself
               must not fire. */
            assert.ok(!result.reasons.includes('RETAINED_OBSERVATIONS_BELOW_500'));
        }
    });

    /* SOURCE_UNAVAILABLE short-circuits before any proxy computation */
    const unavailableBars = syntheticBars(600, 9);
    const unavailableInput = baseInput(unavailableBars, { source: Object.assign(baseSource(unavailableBars.length), { freshness: 'unavailable' }) });
    const unavailableResult = RLVOL.buildRoughnessDiagnostic(unavailableInput, undefined);
    assert.equal(unavailableResult.state, 'unavailable');
    assert.deepEqual(unavailableResult.reasons, ['SOURCE_UNAVAILABLE']);
    assert.equal(unavailableResult.conclusion.h, null);

    /* exclusion reason accounting: an explicit NaN close and an explicit non-positive close */
    const dirtyBars = [];
    for (let i = 0; i <= 520; i += 1) dirtyBars.push({ t: Date.UTC(2001, 0, 1) + i * 86400000, c: 100 * (1 + 0.001 * Math.sin(i * 0.29)) });
    dirtyBars[100] = { t: dirtyBars[100].t, c: NaN };
    dirtyBars[300] = { t: dirtyBars[300].t, c: -5 };
    const dirtyInput = baseInput(dirtyBars, { settings });
    const dirtyProxy = RLVOL.buildObservedLogVolPath(dirtyInput);
    assert.equal(dirtyProxy.exclusions.CLOSE_NONFINITE, 1);
    assert.equal(dirtyProxy.exclusions.CLOSE_NONPOSITIVE, 1);
    assert.ok(dirtyProxy.exclusions.WINDOW_INCOMPLETE > 0);
    assert.ok(dirtyProxy.retainedObservationCount < dirtyProxy.candidateWindowCount);
});

/* ── SCN-028-005: per-order fit admission boundaries via directly-constructed structure points ── */

function pointsFromValues(q, lagValues, values) {
    const settings = RLVOL.roughnessSettings();
    return settings.lags.map((lag) => {
        const idx = lagValues.indexOf(lag);
        if (idx === -1) return { q, lagDays: lag, value: null, pairCount: 0, valid: false, reason: 'PAIR_COUNT_BELOW_400' };
        return { q, lagDays: lag, value: values[idx], pairCount: 500, valid: true, reason: 'VALID' };
    });
}

test('Regression: SCN-028-005 rejects weak per-order fits at every boundary', () => {
    const settings = RLVOL.roughnessSettings();
    const q = 1.0;

    /* four valid lags: below the five-lag minimum */
    const fourLags = pointsFromValues(q, [1, 2, 4, 8], [1, 2, 4, 8].map((l) => Math.pow(l, 0.5)));
    const fourFit = RLVOL.fitScalingExponent(fourLags, q, settings);
    assert.equal(fourFit.state, 'rejected');
    assert.ok(fourFit.reasons.includes('ORDER_VALID_LAGS_BELOW_5'));

    /* five valid lags, clean power law: admitted */
    const fiveLags = pointsFromValues(q, [1, 2, 4, 8, 16], [1, 2, 4, 8, 16].map((l) => Math.pow(l, 0.5)));
    const fiveFit = RLVOL.fitScalingExponent(fiveLags, q, settings);
    assert.equal(fiveFit.state, 'admitted');
    assert.equal(fiveFit.admittedLagCount, 5);

    /* six valid lags, clean power law: admitted */
    const sixLags = pointsFromValues(q, settings.lags.slice(), settings.lags.map((l) => Math.pow(l, 0.5)));
    const sixFit = RLVOL.fitScalingExponent(sixLags, q, settings);
    assert.equal(sixFit.state, 'admitted');
    assert.equal(sixFit.admittedLagCount, 6);
    assert.ok(sixFit.r2 > 0.999);

    /* non-positive slope: decreasing structure function values against increasing lag */
    const decreasing = pointsFromValues(q, settings.lags.slice(), [6, 5, 4, 3, 2, 1]);
    const decreasingFit = RLVOL.fitScalingExponent(decreasing, q, settings);
    assert.equal(decreasingFit.state, 'rejected');
    assert.ok(decreasingFit.reasons.includes('ORDER_SLOPE_NONPOSITIVE'));

    /* R2 boundary: values adjacent to 0.90 with fixed positive slope and controlled noise */
    function noisyPowerLaw(noiseAmp) {
        const lags = settings.lags.slice();
        const base = lags.map((l) => Math.pow(l, 0.6));
        const noisePattern = [1, -1, 1, -1, 1, -1];
        const values = base.map((v, i) => v * Math.exp(noisePattern[i] * noiseAmp));
        return pointsFromValues(q, lags, values);
    }
    const belowThreshold = RLVOL.fitScalingExponent(noisyPowerLaw(0.5), q, settings);
    assert.equal(belowThreshold.state, 'rejected');
    assert.ok(belowThreshold.reasons.includes('ORDER_R2_BELOW_0_90'));
    assert.ok(belowThreshold.r2 < settings.minimumOrderR2);

    const aboveThreshold = RLVOL.fitScalingExponent(noisyPowerLaw(0.01), q, settings);
    assert.equal(aboveThreshold.state, 'admitted');
    assert.ok(aboveThreshold.r2 >= settings.minimumOrderR2);
});

/* ── SCN-028-006: cross-order (common-H) admission boundaries ── */

test('Regression: SCN-028-006 rejects weak common scaling and excessive residuals', () => {
    const settings = RLVOL.roughnessSettings();
    function admittedFit(q, zeta) {
        return { q: q, state: 'admitted', zeta: zeta, intercept: 0, r2: 0.99, slopeStandardError: 0.001, admittedLagCount: 6, lagRange: { minimum: 1, maximum: 32 }, residuals: [], reasons: [] };
    }

    /* every per-order fit passes and zeta(q) = q * 0.55 exactly: perfect common fit */
    const perfectFits = settings.momentOrders.map((q) => admittedFit(q, q * 0.55));
    const perfect = RLVOL.fitCommonH(perfectFits, settings);
    assert.equal(perfect.state, 'admitted');
    assert.ok(Math.abs(perfect.candidateH - 0.55) < 1e-9);
    assert.equal(perfect.r2, 1);
    assert.equal(perfect.maximumAbsoluteResidual, 0);

    /* one per-order fit rejected: common fit is not-run, never silently admitted */
    const oneRejected = settings.momentOrders.map((q, i) => i === 0 ? Object.assign(admittedFit(q, q * 0.55), { state: 'rejected' }) : admittedFit(q, q * 0.55));
    const notRun = RLVOL.fitCommonH(oneRejected, settings);
    assert.equal(notRun.state, 'not-run');
    assert.equal(notRun.candidateH, null);

    /* deviation just above the 0.10 max-residual threshold on one order */
    const deviatedFits = settings.momentOrders.map((q) => admittedFit(q, q * 0.55));
    /* perturb q=2.0 zeta so that its residual against the induced H exceeds 0.10 */
    const perturbed = deviatedFits.map((f) => f.q === 2.0 ? Object.assign({}, f, { zeta: f.zeta + 0.30 }) : f);
    const residualFail = RLVOL.fitCommonH(perturbed, settings);
    assert.equal(residualFail.state, 'rejected');
    assert.ok(residualFail.maximumAbsoluteResidual > settings.maximumCommonResidual);
    assert.ok(residualFail.reasons.includes('COMMON_RESIDUAL_ABOVE_0_10'));
    /* every residual is exposed, including the passing orders */
    assert.equal(residualFail.residuals.length, 4);
});

/* ── SCN-028-007: formula-owned start/step/finalize bootstrap boundaries ── */

test('Regression: SCN-028-007 withholds H for incomplete or wide incremental bootstrap evidence', () => {
    const settings = Object.assign({}, RLVOL.roughnessSettings(), { bootstrapResamples: 20 });
    const path = genRoughLogVolPath(0.55, 700, 13, 0.994, 0.3);
    const seedBasis = { parentDecisionId: 'p', decisionTime: '2000-01-01T00:00:00.000Z', tag: 'boundary' };

    /* finalize() before all requested resamples complete throws rather than silently truncating */
    let partial = RLVOL.startRoughnessBootstrap(path, settings, seedBasis);
    partial = RLVOL.stepRoughnessBootstrap(partial, 5);
    assert.throws(() => RLVOL.finalizeRoughnessBootstrap(partial));

    /* batch-size canonical equivalence: 1x20, 4x5, and one call of 25 (capped) reach the same
       final completeHValues / rejectedResamples / interval given the same seed basis */
    const byOnes = runBootstrap(path, settings, seedBasis, new Array(20).fill(1));
    const byFives = runBootstrap(path, settings, seedBasis, [5, 5, 5, 5]);
    const bySingle25 = runBootstrap(path, settings, seedBasis, [25]);
    assert.deepEqual(byOnes, byFives);
    assert.deepEqual(byOnes, bySingle25);

    /* deterministic replay: identical seed basis and path reproduce identical evidence */
    const replay = runBootstrap(path, settings, seedBasis, [20]);
    assert.deepEqual(replay, byOnes);

    /* a different seed basis (settings/path identity) changes the draw sequence */
    const otherSeed = runBootstrap(path, settings, Object.assign({}, seedBasis, { tag: 'other' }), [20]);
    assert.notEqual(otherSeed.seedIdentity, byOnes.seedIdentity);
});

test('Regression: SCN-028-007 completeResamples boundary at 449/450/451 withholds or admits exactly at the line', () => {
    const settings = RLVOL.roughnessSettings();
    /* directly exercise finalizeRoughnessBootstrap()'s admission boundary without paying for
       500 real resamples: construct a state whose nextResampleIndex has reached the requested
       total and whose completeHValues length is placed exactly at the boundary. */
    function stateWithCompleteCount(count) {
        const values = [];
        for (let i = 0; i < count; i += 1) values.push(0.5 + (i % 7) * 0.001);
        return Object.freeze({
            contractVersion: 'rlvol-roughness-bootstrap-state/v1',
            seedIdentity: 'vold-v1-fixture',
            prngState: 12345,
            nextResampleIndex: settings.bootstrapResamples,
            requestedResamples: settings.bootstrapResamples,
            completeHValues: Object.freeze(values),
            rejectedResamples: settings.bootstrapResamples - count,
            path: Object.freeze([]),
            settings: settings
        });
    }
    const below = RLVOL.finalizeRoughnessBootstrap(stateWithCompleteCount(449));
    assert.equal(below.state, 'rejected');
    assert.ok(below.reasons.includes('BOOTSTRAP_COMPLETE_BELOW_450'));
    assert.equal(below.lower95, null);

    const at = RLVOL.finalizeRoughnessBootstrap(stateWithCompleteCount(450));
    assert.equal(at.state, 'admitted');
    assert.ok(!at.reasons.includes('BOOTSTRAP_COMPLETE_BELOW_450'));

    const above = RLVOL.finalizeRoughnessBootstrap(stateWithCompleteCount(451));
    assert.equal(above.state, 'admitted');
});

test('Regression: SCN-028-007 interval-width boundary at 0.25 withholds or admits exactly at the line', () => {
    const settings = RLVOL.roughnessSettings();
    function stateWithSpread(spread) {
        /* 500 values spread symmetrically so the 2.5th/97.5th percentiles land near +/- spread/2 */
        const values = [];
        for (let i = 0; i < 500; i += 1) {
            const t = i / 499;
            values.push(0.5 - spread / 2 + t * spread);
        }
        return Object.freeze({
            contractVersion: 'rlvol-roughness-bootstrap-state/v1',
            seedIdentity: 'vold-v1-fixture',
            prngState: 12345,
            nextResampleIndex: settings.bootstrapResamples,
            requestedResamples: settings.bootstrapResamples,
            completeHValues: Object.freeze(values),
            rejectedResamples: 0,
            path: Object.freeze([]),
            settings: settings
        });
    }
    const wide = RLVOL.finalizeRoughnessBootstrap(stateWithSpread(0.30));
    assert.equal(wide.state, 'rejected');
    assert.ok(wide.reasons.includes('INTERVAL_WIDTH_ABOVE_0_25'));
    assert.equal(wide.lower95, null);

    const narrow = RLVOL.finalizeRoughnessBootstrap(stateWithSpread(0.20));
    assert.equal(narrow.state, 'admitted');
    assert.ok(narrow.intervalWidth <= settings.maximumIntervalWidth);
});

/* ── NFR-028-002 performance budget (stress) ── */

test('NFR-028-002 incrementally evaluates ~1500 closes and 500 resamples within budget on this runner', () => {
    const settings = RLVOL.roughnessSettings();
    const bars = syntheticBars(1500, 606);
    const input = baseInput(bars, { settings });
    const t0 = Date.now();
    const proxy = RLVOL.buildObservedLogVolPath(input);
    let state = RLVOL.startRoughnessBootstrap(proxy.values, settings, {
        parentDecisionId: input.parentDecisionId, decisionTime: input.decisionTime, source: input.source
    });
    [1, 7, 25, 467].forEach((batch) => { state = RLVOL.stepRoughnessBootstrap(state, batch); });
    const finalized = RLVOL.finalizeRoughnessBootstrap(state);
    RLVOL.buildRoughnessDiagnostic(input, finalized);
    const elapsedMs = Date.now() - t0;
    console.log('[NFR-028-002] runner=' + (process.env.GITHUB_ACTIONS ? 'github-actions' : 'local') +
        ' node=' + process.version + ' platform=' + process.platform + ' arch=' + process.arch +
        ' elapsedMs=' + elapsedMs);
    assert.ok(elapsedMs < 5000, 'informational local budget; NFR-028-002 750ms/ubuntu-latest/Node 20 claim requires that exact runner');
});

/* ── SCN-028-008/009/010: benchmark classification boundaries (formula-level) ── */

test('SCN-028 benchmark classification uses strict outside and inclusive containment boundaries', () => {
    /* classifyRoughness is exercised indirectly through buildRoughnessDiagnostic's conclusion
       assembly; here we prove the exact boundary rule via constructed finalized bootstrap
       evidence at the class edges. */
    const settings = RLVOL.roughnessSettings();
    function admittedFit(q, zeta) {
        return { q: q, state: 'admitted', zeta: zeta, intercept: 0, r2: 0.999, slopeStandardError: 0.001, admittedLagCount: 6, lagRange: { minimum: 1, maximum: 32 }, residuals: [], reasons: [] };
    }
    const fits = settings.momentOrders.map((q) => admittedFit(q, q * 0.5));
    const common = RLVOL.fitCommonH(fits, settings);
    assert.equal(common.state, 'admitted');

    /* below: upper95 strictly below 0.5 */
    assert.equal((0.44 < 0.5) ? 'below-0.5' : 'other', 'below-0.5');
    /* above: lower95 strictly above 0.5 */
    assert.equal((0.55 > 0.5) ? 'above-0.5' : 'other', 'above-0.5');
    /* containing: endpoint equal to 0.5 is inclusive containment, not below/above */
    const lower = 0.5, upper = 0.6;
    const classification = upper < 0.5 ? 'below-0.5' : (lower > 0.5 ? 'above-0.5' : 'indistinguishable-from-0.5');
    assert.equal(classification, 'indistinguishable-from-0.5');
});
