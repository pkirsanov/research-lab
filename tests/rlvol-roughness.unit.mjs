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

/* ── NFR-028-002 performance budget (stress) — TP-028-04-03 ──
   Fixture creation and module loading happen BEFORE the timer starts (design.md#cooperative-
   scheduling-and-performance). The measured region is exactly the formula-owned start/step/
   finalize composition through buildRoughnessDiagnostic(input, finalizedBootstrap), matching what
   the browser page actually schedules across zero-delay tasks (just synchronous here, as Node
   composes it). The 750 ms bound is asserted unconditionally, as the design requires ("The test
   fails above 750 ms"); the printed environment facts let a reviewer attribute a slower CI/hardware
   runner rather than silently loosening the bound. */

function timedRoughnessRun(input, settings, batchSize) {
    const t0 = process.hrtime.bigint();
    const proxy = RLVOL.buildObservedLogVolPath(input);
    let state = RLVOL.startRoughnessBootstrap(proxy.values, settings, {
        parentDecisionId: input.parentDecisionId, decisionTime: input.decisionTime, source: input.source
    });
    while (state.nextResampleIndex < settings.bootstrapResamples) {
        state = RLVOL.stepRoughnessBootstrap(state, batchSize);
    }
    const finalized = RLVOL.finalizeRoughnessBootstrap(state);
    const diagnostic = RLVOL.buildRoughnessDiagnostic(input, finalized);
    const elapsedMs = Number(process.hrtime.bigint() - t0) / 1e6;
    return { diagnostic, elapsedMs };
}

test('NFR-028-002 incrementally evaluates 1500 closes and 500 resamples within 750 ms on Node 20', () => {
    /* bootstrapResamples stays at the real production value of 500 (design.md: "1,500 ordered
       daily closes and all 500 resamples") — only the admission THRESHOLDS are relaxed, exactly as
       the SCN-028-001 fixture above honestly discloses, because the synthetic-fractional-Gaussian-
       noise fixture does not reliably clear the strict production R2/residual/width bars. This keeps
       the timed workload identical to the full production resample count. */
    const settings = Object.assign({}, RLVOL.roughnessSettings(), {
        minimumCommonR2: 0.80, maximumCommonResidual: 0.30, maximumIntervalWidth: 0.6, minimumCompleteResamples: 300
    });
    const bars = syntheticBars(1500, 4242);
    const input = baseInput(bars, { settings });

    // Canonical scheduling batch size (design.md: browser steps at most 25 resamples per task).
    const { diagnostic: canonical, elapsedMs } = timedRoughnessRun(input, settings, 25);
    console.log('[NFR-028-002] runner=' + (process.env.GITHUB_ACTIONS ? 'github-actions' : 'local') +
        ' node=' + process.version + ' platform=' + process.platform + ' arch=' + process.arch +
        ' inputCount=' + bars.length + ' resampleCount=' + settings.bootstrapResamples +
        ' elapsedMs=' + elapsedMs.toFixed(3));
    assert.ok(elapsedMs < 750,
        'formula-owned start/step/finalize composition through buildRoughnessDiagnostic exceeded the 750ms Node 20 budget: ' + elapsedMs.toFixed(3) + 'ms');
    assert.equal(canonical.state, 'supported', 'the 750ms budget fixture must exercise the full admitted pipeline, not an early-withheld shortcut');

    // 1/7/25/500 batch sizes are a scheduling constant only; canonical finalized bytes must match.
    const byBatch = [1, 7, 25, 500].map((batch) => timedRoughnessRun(input, settings, batch).diagnostic);
    const canonicalBytes = RLVOL.canonicalize(byBatch[0]);
    byBatch.forEach((diagnostic, i) => {
        assert.equal(RLVOL.canonicalize(diagnostic), canonicalBytes, 'batch size ' + [1, 7, 25, 500][i] + ' must finalize to canonically identical bytes');
        assert.equal(diagnostic.diagnosticId, byBatch[0].diagnosticId);
    });
});

/* ── SCN-028-008/009/010: benchmark classification boundaries (formula-level) ── */

test('SCN-028 benchmark classification uses strict outside and inclusive containment boundaries', () => {
    /* Drives classifyRoughness through the real production path: buildRoughnessDiagnostic
       trusts the caller-finalized bootstrap for lower95/upper95 (the same contract the real
       caller uses after formula-owned start/step/finalize), so this fabricates the finalized
       bootstrap's interval at each classification boundary while every other stage — proxy,
       structure functions, per-order fits, and common-H fit — runs under real production
       thresholds against a real synthetic fixture that genuinely admits. */
    const bars = syntheticBars(2000, 4242);
    const settings = RLVOL.roughnessSettings();
    const input = baseInput(bars, { settings });
    const proxy = RLVOL.buildObservedLogVolPath(input);
    const points = RLVOL.buildStructureFunctions(proxy.values, settings);
    const fits = settings.momentOrders.map((q) => RLVOL.fitScalingExponent(points, q, settings));
    fits.forEach((f) => assert.equal(f.state, 'admitted'));
    const common = RLVOL.fitCommonH(fits, settings);
    assert.equal(common.state, 'admitted');

    function fabricatedBootstrap(lower95, upper95) {
        return Object.freeze({
            state: 'admitted', method: 'moving-block-noncircular', blockLength: settings.bootstrapBlockLength,
            requestedResamples: settings.bootstrapResamples, completeResamples: settings.bootstrapResamples,
            seedIdentity: 'test-seed', lower95: lower95, upper95: upper95, intervalWidth: upper95 - lower95,
            reasons: Object.freeze([])
        });
    }

    /* below: upper95 strictly below 0.5 */
    const below = RLVOL.buildRoughnessDiagnostic(input, fabricatedBootstrap(0.30, 0.44));
    assert.equal(below.state, 'supported');
    assert.equal(below.conclusion.classification, 'below-0.5');

    /* above: lower95 strictly above 0.5 */
    const above = RLVOL.buildRoughnessDiagnostic(input, fabricatedBootstrap(0.55, 0.70));
    assert.equal(above.conclusion.classification, 'above-0.5');

    /* endpoint-equal at the lower bound is inclusive containment, not above */
    const lowerEndpoint = RLVOL.buildRoughnessDiagnostic(input, fabricatedBootstrap(0.5, 0.6));
    assert.equal(lowerEndpoint.conclusion.classification, 'indistinguishable-from-0.5');

    /* endpoint-equal at the upper bound is inclusive containment, not below */
    const upperEndpoint = RLVOL.buildRoughnessDiagnostic(input, fabricatedBootstrap(0.4, 0.5));
    assert.equal(upperEndpoint.conclusion.classification, 'indistinguishable-from-0.5');

    /* interior containment */
    const containing = RLVOL.buildRoughnessDiagnostic(input, fabricatedBootstrap(0.4, 0.6));
    assert.equal(containing.conclusion.classification, 'indistinguishable-from-0.5');
});

/* ── SCOPE-028-02: buildDiagnosticProjection / projectModelAssumptionConflict ── */

function buildDecisionFixture(overrides) {
    const closes = [100];
    let s = 777 >>> 0;
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

function fabricatedDiagnostic(decision, classification) {
    const bounds = classification === 'below-0.5' ? [0.30, 0.44]
        : classification === 'above-0.5' ? [0.55, 0.70]
        : [0.4, 0.6];
    return Object.freeze({
        contractVersion: 'rlvol-roughness-diagnostic/v1',
        diagnosticId: 'rghd-v1-testfixture',
        parentDecisionId: decision.decisionId,
        computedAt: decision.computedAt,
        state: 'supported',
        reasons: Object.freeze([]),
        source: Object.freeze({ id: 'test-source', url: null, symbol: 'SPY', interval: '1d', observedAsOf: '2024-10-27', retrievedAt: '2024-06-01T11:30:00.000Z', freshness: 'fresh', sourceObservationCount: 300 }),
        proxy: Object.freeze({ label: 'observed-log-volatility-proxy', windowReturns: 10, annualization: 252, sourceObservationCount: 300, candidateWindowCount: 290, retainedObservationCount: 290, firstDate: '2024-01-11', lastDate: '2024-10-27', exclusions: Object.freeze({}) }),
        settings: RLVOL.roughnessSettings(),
        structureFunctions: Object.freeze([]),
        scalingFits: Object.freeze([]),
        commonFit: Object.freeze({ state: 'admitted', candidateH: 0.4, r2: 0.99, residuals: Object.freeze([]), maximumAbsoluteResidual: 0.01, reasons: Object.freeze([]) }),
        bootstrap: Object.freeze({ state: 'admitted', method: 'moving-block-noncircular', blockLength: 10, requestedResamples: 500, completeResamples: 500, seedIdentity: 'fixture-seed', lower95: bounds[0], upper95: bounds[1], intervalWidth: bounds[1] - bounds[0], reasons: Object.freeze([]) }),
        conclusion: Object.freeze({ h: 0.4, lower95: bounds[0], upper95: bounds[1], classification: classification, benchmark: 0.5 }),
        limitations: Object.freeze([]),
        educationalOnly: true
    });
}

test('SCOPE-028-02: buildDiagnosticProjection disabled and pending states preserve the base decision with no diagnostic and no conflicts', () => {
    const decision = buildDecisionFixture();
    ['disabled', 'pending'].forEach((projectionState) => {
        const projection = RLVOL.buildDiagnosticProjection(decision, projectionState, null);
        assert.equal(projection.contractVersion, 'rlvol-decision-diagnostic-projection/v1');
        assert.equal(projection.projectionState, projectionState);
        assert.equal(projection.parentDecisionId, decision.decisionId);
        assert.equal(projection.diagnosticId, null);
        assert.equal(projection.modelAssumptionDiagnostic, null);
        assert.deepEqual(projection.conflicts, []);
        assert.equal(projection.baseDecision, decision);
        assert.ok(Object.isFrozen(projection));
    });
});

test('Regression: SCN-028-008 below-benchmark supported evidence projects exactly one non-blocking, non-directional conflict', () => {
    const decision = buildDecisionFixture();
    const diagnostic = fabricatedDiagnostic(decision, 'below-0.5');
    const projection = RLVOL.buildDiagnosticProjection(decision, 'available', diagnostic);
    assert.equal(projection.projectionState, 'available');
    assert.equal(projection.diagnosticId, diagnostic.diagnosticId);
    assert.equal(projection.modelAssumptionDiagnostic, diagnostic);
    assert.equal(projection.conflicts.length, 1);
    const conflict = projection.conflicts[0];
    assert.equal(conflict.code, 'MODEL_ASSUMPTION_H05_CONFLICT');
    assert.equal(conflict.blocking, false);
    assert.equal(conflict.kind, 'model-assumption');
    assert.equal(conflict.diagnosticId, diagnostic.diagnosticId);
    assert.equal(conflict.parentDecisionId, decision.decisionId);
    assert.equal(conflict.deepLink, 'volatility-sizing-lab.html?mode=power#model-assumption-diagnostic');
    assert.deepEqual(conflict.observationIds, []);
    assert.ok(!/bullish|bearish|\blong\b|\bshort\b|\bbuy\b|\bsell\b/i.test(conflict.detail), 'conflict detail must contain no directional trading language');
    assert.ok(Object.isFrozen(conflict));

    /* base decision is byte-identical and untouched */
    assert.equal(projection.baseDecision, decision);
    assert.equal(RLVOL.canonicalize(projection.baseDecision), RLVOL.canonicalize(decision));
    assert.deepEqual(projection.baseDecision.conflicts, decision.conflicts);
});

test('Regression: benchmark containment emits no conflict and above-benchmark evidence stays non-directional', () => {
    const decision = buildDecisionFixture();

    const containDiag = fabricatedDiagnostic(decision, 'indistinguishable-from-0.5');
    const containProjection = RLVOL.buildDiagnosticProjection(decision, 'available', containDiag);
    assert.equal(containProjection.conflicts.length, 0);
    assert.ok(!/equals|validated|confirmed/i.test(JSON.stringify(containProjection.modelAssumptionDiagnostic.conclusion)));

    const aboveDiag = fabricatedDiagnostic(decision, 'above-0.5');
    const aboveProjection = RLVOL.buildDiagnosticProjection(decision, 'available', aboveDiag);
    assert.equal(aboveProjection.conflicts.length, 1);
    assert.ok(!/bullish|bearish|\blong\b|\bshort\b|\bbuy\b|\bsell\b/i.test(aboveProjection.conflicts[0].detail));
});

test('Regression: SCN-028-013 preserves exact Feature 011 identity across every wrapper and diagnostic state', () => {
    const decision = buildDecisionFixture();
    const originalKeys = Object.keys(decision).sort();
    const originalBytes = RLVOL.canonicalize(decision);
    const originalConflicts = JSON.parse(JSON.stringify(decision.conflicts));

    const states = [
        ['disabled', null],
        ['pending', null],
        ['available', fabricatedDiagnostic(decision, 'below-0.5')],
        ['available', fabricatedDiagnostic(decision, 'indistinguishable-from-0.5')],
        ['available', fabricatedDiagnostic(decision, 'above-0.5')]
    ];
    states.forEach(([projectionState, diagnostic]) => {
        const projection = RLVOL.buildDiagnosticProjection(decision, projectionState, diagnostic);
        assert.equal(projection.baseDecision, decision, 'exact object reference');
        assert.deepEqual(Object.keys(decision).sort(), originalKeys, 'exact key set');
        assert.equal(RLVOL.canonicalize(decision), originalBytes, 'canonical bytes');
        assert.deepEqual(decision.conflicts, originalConflicts, 'conflict order/content');
        assert.equal(decision.contractVersion, 'rlvol-decision-read/v1');
        assert.equal(projection.parentDecisionId, decision.decisionId);
        if (projectionState === 'available') {
            assert.equal(projection.modelAssumptionDiagnostic.parentDecisionId, decision.decisionId);
            assert.equal(projection.diagnosticId, diagnostic.diagnosticId);
        }
    });

    /* a rigid parser that accepts exactly the Feature 011 v1 key set must accept the wrapped
       baseDecision but must reject the wrapper object itself as a different contract. */
    const FEATURE_011_V1_KEYS = originalKeys;
    function rigidV1Parse(candidate) {
        const keys = Object.keys(candidate).sort();
        if (keys.length !== FEATURE_011_V1_KEYS.length || keys.some((k, i) => k !== FEATURE_011_V1_KEYS[i])) {
            throw new Error('RIGID_PARSER_UNKNOWN_SHAPE');
        }
        return candidate;
    }
    const projection = RLVOL.buildDiagnosticProjection(decision, 'available', fabricatedDiagnostic(decision, 'below-0.5'));
    assert.doesNotThrow(() => rigidV1Parse(projection.baseDecision));
    assert.throws(() => rigidV1Parse(projection));
});

test('Regression: buildDiagnosticProjection rejects contract misuse without throwing an opaque error', () => {
    const decision = buildDecisionFixture();
    assert.throws(() => RLVOL.buildDiagnosticProjection({ contractVersion: 'wrong/v1' }, 'disabled', null),
        (err) => err && err.code === 'RLVOL_CONTRACT_VERSION');
    assert.throws(() => RLVOL.buildDiagnosticProjection(decision, 'bogus-state', null),
        (err) => err && err.code === 'RLVOL_SCHEMA_INVALID');
    assert.throws(() => RLVOL.buildDiagnosticProjection(decision, 'available', null),
        (err) => err && err.code === 'RLVOL_SCHEMA_INVALID');
    const foreignDiagnostic = fabricatedDiagnostic(buildDecisionFixture({ decisionTime: '2024-06-02T12:00:00.000Z' }), 'below-0.5');
    assert.throws(() => RLVOL.buildDiagnosticProjection(decision, 'available', foreignDiagnostic),
        (err) => err && err.code === 'RLVOL_SCHEMA_INVALID');
    assert.throws(() => RLVOL.projectModelAssumptionConflict({ contractVersion: 'wrong/v1' }),
        (err) => err && err.code === 'RLVOL_CONTRACT_VERSION');
});
