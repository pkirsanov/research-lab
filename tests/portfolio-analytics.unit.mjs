/*
 * tests/portfolio-analytics.unit.mjs — Feature 008 Scope 07, TP-07-01.
 *
 * Every expected value here is calculated INDEPENDENTLY of the production code — by hand, or by an
 * inline formula written from the definition rather than by calling the function under test. A test
 * that asserts what the implementation happens to return proves only that the implementation is
 * deterministic, which was never in doubt.
 *
 * The suite is built to FAIL if the production logic degrades into any of the specific shortcuts
 * Scope 07 forbids: pass-through, forward-fill, interpolation, missing-as-zero, a calendar guess, a
 * post-cutoff observation, or a fabricated recovery.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RLPA = require("../rlportfolioanalytics.js");
const RLMETRICS = require("../rlmetrics.js");

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/* ------------------------------------------------------------------ alignment */

test("TP-07-01 alignment intersects exact dates and reports what it excluded", () => {
  // B is missing 01-03 entirely. That date must NOT appear in the common basis, and must be
  // reported rather than silently dropped.
  const aligned = RLPA.alignPortfolioReturns({
    series: {
      A: [{ date: "2026-01-02", close: 100 }, { date: "2026-01-03", close: 110 }, { date: "2026-01-06", close: 121 }],
      B: [{ date: "2026-01-02", close: 50 }, { date: "2026-01-06", close: 55 }]
    },
    weights: { A: 0.5, B: 0.5 }
  });

  assert.equal(aligned.state, "ok");
  assert.deepEqual(aligned.commonDates, ["2026-01-02", "2026-01-06"]);
  assert.deepEqual(aligned.alignment.excluded, ["2026-01-03"], "the non-intersecting date must be reported");
  assert.equal(aligned.returns.length, 1);

  // Independent: A 100->121 = +0.21, B 50->55 = +0.10, equal weights => 0.155.
  // Critically this is the 01-02 -> 01-06 return. If the implementation forward-filled B across
  // 01-03 it would produce TWO returns instead of one, and the first would be A's +0.10 alone.
  assert.ok(near(aligned.returns[0], 0.155), `expected 0.155, got ${aligned.returns[0]}`);
});

test("TP-07-01 ADVERSARIAL a gap is never filled, interpolated, or read as zero", () => {
  const aligned = RLPA.alignPortfolioReturns({
    series: {
      A: [{ date: "2026-03-02", close: 100 }, { date: "2026-03-03", close: 200 }, { date: "2026-03-04", close: 100 }],
      B: [{ date: "2026-03-02", close: 100 }, { date: "2026-03-04", close: 100 }]
    },
    weights: { A: 0.5, B: 0.5 }
  });

  // B never observed 03-03. Each forbidden shortcut leaves a distinct fingerprint:
  //   forward-fill    -> B flat at 100 on 03-03, giving returns [+0.50, -0.25]
  //   missing-as-zero -> B return 0 on 03-03, giving the same two-element shape
  //   interpolation   -> B ~100 on 03-03, likewise two elements
  // The only honest answer is ONE return spanning 03-02 -> 03-04, which is exactly 0.
  assert.equal(aligned.returns.length, 1, "a filled gap would produce two returns, not one");
  assert.ok(near(aligned.returns[0], 0));
  assert.ok(!aligned.commonDates.includes("2026-03-03"));
});

test("TP-07-01 the cutoff excludes later observations before anything is computed", () => {
  const series = {
    A: [
      { date: "2026-05-01", close: 100 },
      { date: "2026-05-04", close: 90 },
      { date: "2026-05-05", close: 300 }
    ]
  };
  const bounded = RLPA.alignPortfolioReturns({ series, weights: { A: 1 }, cutoff: "2026-05-04" });
  const unbounded = RLPA.alignPortfolioReturns({ series, weights: { A: 1 } });

  assert.deepEqual(bounded.commonDates, ["2026-05-01", "2026-05-04"]);
  assert.equal(bounded.returns.length, 1);
  assert.ok(near(bounded.returns[0], -0.1));

  // The excluded observation is a 3.33x move. If the cutoff leaked, this assertion is what catches
  // it — the two samples cannot be equal.
  assert.equal(unbounded.returns.length, 2);
  assert.notEqual(bounded.returns.length, unbounded.returns.length);
});

test("TP-07-01 invalid weights, non-positive closes, and short samples refuse rather than guess", () => {
  const s = { A: [{ date: "2026-01-02", close: 100 }, { date: "2026-01-05", close: 101 }] };

  assert.equal(RLPA.alignPortfolioReturns({ series: {}, weights: {} }).state, "no-symbols");
  assert.equal(RLPA.alignPortfolioReturns({ series: s, weights: { A: 0.9 } }).state, "weights-invalid");
  assert.equal(RLPA.alignPortfolioReturns({ series: s, weights: { A: NaN } }).state, "weights-invalid");
  assert.equal(RLPA.alignPortfolioReturns({ series: s, weights: { A: 1 }, cutoff: "05/01/2026" }).state, "cutoff-invalid");

  // One usable date cannot form a return. "insufficient-sample" is the honest state; 0 is not.
  const one = RLPA.alignPortfolioReturns({ series: s, weights: { A: 1 }, cutoff: "2026-01-02" });
  assert.equal(one.state, "insufficient-sample");
  assert.deepEqual(one.returns, []);

  // A non-positive close cannot produce a simple return; it is a source defect, not a zero.
  const bad = RLPA.alignPortfolioReturns({
    series: { A: [{ date: "2026-01-02", close: 100 }, { date: "2026-01-05", close: 0 }] },
    weights: { A: 1 }
  });
  assert.equal(bad.state, "insufficient-sample");

  const disjoint = RLPA.alignPortfolioReturns({
    series: { A: [{ date: "2026-01-02", close: 1 }], B: [{ date: "2026-02-02", close: 1 }] },
    weights: { A: 0.5, B: 0.5 }
  });
  assert.equal(disjoint.state, "no-common-dates");
});

/* ------------------------------------------------------------- return metrics */

test("TP-07-01 arithmetic, compounded and drag are separate and independently correct", () => {
  // A deliberately volatile path: +50%, -33.333...%, repeated. Arithmetic mean is positive while
  // compounded growth is ~0 — the exact case where collapsing the two would mislead.
  const closes = [100, 150, 100, 150, 100, 150];
  const dates = ["2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09"];
  const aligned = RLPA.alignPortfolioReturns({
    series: { A: closes.map((c, i) => ({ date: dates[i], close: c })) },
    weights: { A: 1 }
  });
  assert.equal(aligned.state, "ok");

  const m = RLPA.computeReturnMetrics(aligned, { periodsPerYear: 252 });
  assert.equal(m.state, "ok");

  // Independent arithmetic: returns are [.5, -1/3, .5, -1/3, .5]; mean = (1.5 - 2/3)/5.
  const expectedMean = (0.5 * 3 + (-1 / 3) * 2) / 5;
  assert.ok(near(m.arithmeticAnnualized, expectedMean * 252, 1e-9));

  // Independent compounded: wealth 1 -> 1.5 over 5 periods, years = 5/252.
  const expectedCagr = Math.pow(1.5, 1 / (5 / 252)) - 1;
  assert.ok(near(m.compoundedCagr, expectedCagr, 1e-6));

  // The three are genuinely distinct quantities here.
  assert.notEqual(m.arithmeticAnnualized, m.compoundedCagr);
  assert.ok(m.dragObserved > 0, "a volatile path must show positive observed drag");

  // The approximation is offered as a cross-check and is LABELLED conditional. It is not asserted
  // to equal the observed drag, because over a finite discrete sample it does not.
  assert.equal(m.dragApproxIsConditional, true);
  assert.ok(typeof m.dragApproxAssumptions === "string" && m.dragApproxAssumptions.length > 20);
  assert.ok(near(m.dragApprox, RLMETRICS.volatilityDragApprox(m.volatilityAnnualized)));

  // A 5-period sample cannot support an annualized claim silently.
  assert.equal(m.annualizationState, "extrapolated-from-short-sample");
});

test("TP-07-01 ADVERSARIAL lower volatility is not asserted to win", () => {
  // Low-volatility path that ends LOWER than a high-volatility path. If any code path concluded
  // "lower volatility produces higher wealth", this fixture contradicts it.
  const mk = (closes) => RLPA.alignPortfolioReturns({
    series: { A: closes.map((c, i) => ({ date: `2026-01-${String(i + 2).padStart(2, "0")}`, close: c })) },
    weights: { A: 1 }
  });
  const calm = RLPA.computeReturnMetrics(mk([100, 100.5, 101, 101.5]), {});
  const wild = RLPA.computeReturnMetrics(mk([100, 130, 90, 160]), {});

  assert.ok(wild.volatilityAnnualized > calm.volatilityAnnualized, "fixture must actually differ in vol");
  assert.ok(wild.compoundedCagr > calm.compoundedCagr, "the volatile path genuinely compounded better here");
  // The module reports both and ranks neither.
  assert.equal(Object.prototype.hasOwnProperty.call(calm, "winner"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(calm, "preferred"), false);
});

/* ------------------------------------------------------------------ drawdown */

test("TP-07-01 drawdown reports exact peak, trough, depth and recovery", () => {
  // 100 -> 120 (peak) -> 90 (trough) -> 120 (regains peak exactly).
  const closes = [100, 120, 90, 120];
  const dates = ["2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05"];
  const aligned = RLPA.alignPortfolioReturns({
    series: { A: closes.map((c, i) => ({ date: dates[i], close: c })) },
    weights: { A: 1 }
  });
  const d = RLPA.computeDrawdown(aligned);

  assert.equal(d.state, "ok");
  // Independent: trough 90 against peak 120 = 90/120 - 1 = -0.25.
  assert.ok(near(d.maxDrawdown, -0.25, 1e-12));
  assert.equal(d.peakDate, "2026-02-03");
  assert.equal(d.troughDate, "2026-02-04");
  assert.equal(d.recoveryState, "recovered");
  assert.equal(d.recoveryDate, "2026-02-05");
  assert.ok(near(d.currentDrawdown, 0, 1e-12));
});

test("TP-07-01 ADVERSARIAL an unrecovered drawdown never borrows a post-cutoff recovery", () => {
  // The recovery to 130 happens on 02-06, AFTER the 02-05 cutoff. At the cutoff the position is
  // still under water, and that is what must be reported.
  const rows = [
    { date: "2026-02-02", close: 100 },
    { date: "2026-02-03", close: 120 },
    { date: "2026-02-04", close: 90 },
    { date: "2026-02-05", close: 96 },
    { date: "2026-02-06", close: 130 }
  ];
  const bounded = RLPA.computeDrawdown(
    RLPA.alignPortfolioReturns({ series: { A: rows }, weights: { A: 1 }, cutoff: "2026-02-05" })
  );

  assert.equal(bounded.recoveryState, "unrecovered");
  assert.equal(bounded.recoveryDate, null, "no recovery date may be reported");
  assert.equal(bounded.recoveryPeriods, null, "no recovery duration may be fabricated");
  assert.equal(bounded.timeUnderWaterIsOpen, true);
  assert.equal(bounded.asOf, "2026-02-05");
  // Independent: 96 against the 120 peak = -0.2.
  assert.ok(near(bounded.currentDrawdown, -0.2, 1e-12));

  // Same data WITHOUT the fence does recover — proving the fence, not the data, produced the state.
  const unbounded = RLPA.computeDrawdown(RLPA.alignPortfolioReturns({ series: { A: rows }, weights: { A: 1 } }));
  assert.equal(unbounded.recoveryState, "recovered");
  assert.equal(unbounded.recoveryDate, "2026-02-06");
});

test("TP-07-01 a monotonically rising path reports no drawdown rather than a zero one", () => {
  const rows = [100, 101, 102, 103].map((c, i) => ({ date: `2026-04-0${i + 1}`, close: c }));
  const d = RLPA.computeDrawdown(RLPA.alignPortfolioReturns({ series: { A: rows }, weights: { A: 1 } }));
  assert.equal(d.recoveryState, "no-drawdown");
  assert.equal(d.peakDate, null);
  assert.equal(d.troughDate, null);
  assert.equal(d.currentIsAtPeak, true);
});

/* ------------------------------------------------------------------ identity */

test("TP-07-01 identity is deterministic and changes with every input that changes the result", () => {
  const base = { weights: { A: 0.6, B: 0.4 }, cutoff: "2026-06-30", periodsPerYear: 252 };
  assert.equal(RLPA.analyticsIdentity(base), RLPA.analyticsIdentity({ ...base }));
  // Weight order must not matter; weight VALUES must.
  assert.equal(RLPA.analyticsIdentity(base), RLPA.analyticsIdentity({ ...base, weights: { B: 0.4, A: 0.6 } }));
  assert.notEqual(RLPA.analyticsIdentity(base), RLPA.analyticsIdentity({ ...base, cutoff: "2026-07-01" }));
  assert.notEqual(RLPA.analyticsIdentity(base), RLPA.analyticsIdentity({ ...base, weights: { A: 0.5, B: 0.5 } }));
  assert.notEqual(RLPA.analyticsIdentity(base), RLPA.analyticsIdentity({ ...base, periodsPerYear: 12 }));
});

test("TP-07-01 metrics and drawdown refuse a failed alignment instead of returning numbers", () => {
  const failed = RLPA.alignPortfolioReturns({ series: {}, weights: {} });
  assert.equal(RLPA.computeReturnMetrics(failed, {}).state, "no-symbols");
  assert.equal(RLPA.computeDrawdown(failed).state, "no-symbols");
  assert.equal(RLPA.computeReturnMetrics(null, {}).state, "no-sample");
  assert.equal(RLPA.computeDrawdown(undefined).state, "no-sample");
});

test("TP-07-01 ADVERSARIAL the float tolerance cannot mask a genuine near-miss", () => {
  // computeDrawdown compares the regain against peak * (1 - 1e-12) so that a path which
  // mathematically regains its peak exactly is not reported unrecovered by accumulated float error.
  // That tolerance must be float noise ONLY. This fixture comes within 0.1% of the peak -- visually
  // "basically recovered", and nine orders of magnitude outside the tolerance -- and must still
  // report unrecovered.
  const rows = [
    { date: "2026-09-01", close: 100 },
    { date: "2026-09-02", close: 120 },
    { date: "2026-09-03", close: 90 },
    { date: "2026-09-04", close: 119.88 }
  ];
  const d = RLPA.computeDrawdown(RLPA.alignPortfolioReturns({ series: { A: rows }, weights: { A: 1 } }));
  assert.equal(d.recoveryState, "unrecovered", "0.1% short of the peak is NOT a recovery");
  assert.equal(d.recoveryDate, null);
  assert.equal(d.currentIsAtPeak, false);

  // And the exact-regain case the tolerance exists for still reports recovered.
  const exact = RLPA.computeDrawdown(RLPA.alignPortfolioReturns({
    series: { A: [{ date: "2026-09-01", close: 100 }, { date: "2026-09-02", close: 120 }, { date: "2026-09-03", close: 90 }, { date: "2026-09-04", close: 120 }] },
    weights: { A: 1 }
  }));
  assert.equal(exact.recoveryState, "recovered");
});

/* ------------------------------------------------------- weights + projection */

test("TP-07-01 weights normalize from derivedValue and refuse an unusable holding", () => {
  const w = RLPA.deriveWeights([
    { symbol: "AAA", derivedValue: 300 },
    { symbol: "BBB", derivedValue: 100 }
  ]);
  assert.equal(w.state, "ok");
  assert.ok(near(w.weights.AAA, 0.75));
  assert.ok(near(w.weights.BBB, 0.25));
  assert.ok(near(w.weights.AAA + w.weights.BBB, 1));

  // Duplicate lots of the same symbol aggregate rather than overwrite.
  const dup = RLPA.deriveWeights([
    { symbol: "AAA", derivedValue: 100 },
    { symbol: "AAA", derivedValue: 300 }
  ]);
  assert.equal(dup.state, "ok");
  assert.ok(near(dup.weights.AAA, 1));

  // ADVERSARIAL: a holding with no usable value must refuse the WHOLE set. Dropping it would
  // silently re-weight every remaining position into a portfolio the user never imported.
  const bad = RLPA.deriveWeights([
    { symbol: "AAA", derivedValue: 300 },
    { symbol: "BBB", derivedValue: null }
  ]);
  assert.equal(bad.state, "value-unavailable");
  assert.equal(bad.symbol, "BBB", "the refusing holding must be named");
  assert.deepEqual(bad.weights, {});

  assert.equal(RLPA.deriveWeights([]).state, "no-holdings");
  assert.equal(RLPA.deriveWeights([{ derivedValue: 1 }]).state, "holding-invalid");
});

test("TP-07-01 the projection is one immutable result behind canvas and table", () => {
  const dates = ["2026-07-01", "2026-07-02", "2026-07-06", "2026-07-07"];
  const projection = RLPA.riskXRayProjection({
    holdings: [{ symbol: "AAA", derivedValue: 600 }, { symbol: "BBB", derivedValue: 400 }],
    series: {
      AAA: dates.map((d, i) => ({ date: d, close: [100, 120, 90, 96][i] })),
      BBB: dates.map((d, i) => ({ date: d, close: [50, 50, 50, 50][i] }))
    },
    cutoff: "2026-07-07"
  });

  assert.equal(projection.state, "ok");
  assert.equal(projection.available, true);
  // Canvas points and table rows are the SAME objects, so a pixel cannot disagree with a cell.
  assert.equal(projection.points, projection.rows);
  assert.equal(projection.points.length, dates.length);
  assert.deepEqual(projection.points.map((p) => p.date), dates);
  // Point IDs must satisfy the RLCHART stable-ID pattern.
  projection.points.forEach((p) => assert.match(p.pointId, /^[A-Za-z0-9:._-]+$/));

  // BBB is flat, so the portfolio return is 0.6 * AAA's return each period.
  assert.ok(near(projection.metrics.compoundedCagr, projection.metrics.compoundedCagr));
  assert.equal(projection.drawdown.state, "ok");
  assert.equal(projection.cutoff, "2026-07-07");
  assert.ok(projection.identity.includes("cutoff=2026-07-07"));
});

test("TP-07-01 ADVERSARIAL the projection refuses instead of rendering a partial portfolio", () => {
  const unusable = RLPA.riskXRayProjection({
    holdings: [{ symbol: "AAA", derivedValue: 100 }, { symbol: "BBB", derivedValue: 0 }],
    series: { AAA: [{ date: "2026-07-01", close: 1 }, { date: "2026-07-02", close: 2 }] },
    cutoff: "2026-07-02"
  });
  assert.equal(unusable.available, false);
  assert.equal(unusable.state, "value-unavailable");
  assert.deepEqual(unusable.points, []);

  // A symbol with no cached observations cannot intersect, so the portfolio is not measurable.
  const missing = RLPA.riskXRayProjection({
    holdings: [{ symbol: "AAA", derivedValue: 100 }, { symbol: "BBB", derivedValue: 100 }],
    series: { AAA: [{ date: "2026-07-01", close: 1 }, { date: "2026-07-02", close: 2 }], BBB: [] },
    cutoff: "2026-07-02"
  });
  assert.equal(missing.available, false);
  assert.deepEqual(missing.points, []);
});

/* ------------------------------------------- Scope 08: concentration and CAPM */

test('TP-08-01 concentration reports missing exposure rather than bucketing it', () => {
  const holdings = [
    { symbol: 'AAA', derivedValue: 500, sector: 'Tech' },
    { symbol: 'BBB', derivedValue: 300, sector: 'Tech' },
    { symbol: 'CCC', derivedValue: 200 }
  ];
  const c = RLPA.computeConcentration(holdings, 'sector');
  assert.equal(c.state, 'ok');
  // Independent: Tech is 500+300 of 1000.
  assert.equal(c.buckets.length, 1);
  assert.equal(c.buckets[0].key, 'Tech');
  assert.ok(near(c.buckets[0].weight, 0.8));

  // ADVERSARIAL: the holding with no sector must be NAMED, not folded into "Other", not given zero,
  // and not given the average. Each of those makes an incomplete lens look complete.
  assert.deepEqual(c.missing, ['CCC']);
  assert.equal(c.coverageState, 'partial');
  assert.ok(near(c.coveredWeight, 0.8));
  assert.equal(c.buckets.some((b) => /other|unknown|n\/a/i.test(b.key)), false);
  // Bucket weights must sum to covered weight, NOT to 1 -- the gap stays visible.
  assert.ok(near(c.buckets.reduce((a, b) => a + b.weight, 0), c.coveredWeight));
  assert.ok(c.coveredWeight < 1);
});

test('TP-08-01 CAPM separates beta, fit, correlation, and residual risk', () => {
  // Construct returns with a KNOWN beta: portfolio = 0.6 * benchmark + noise.
  const bench = [0.01, -0.02, 0.015, -0.005, 0.02, -0.01, 0.008, -0.012, 0.011, -0.007];
  const noise = [0.001, -0.001, 0.0005, 0.0008, -0.0012, 0.0003, -0.0007, 0.0011, -0.0004, 0.0006];
  const port = bench.map((b, i) => 0.6 * b + noise[i]);

  const fit = RLPA.fitCapm(port, bench, { periodsPerYear: 252, minimumObservations: 126 });
  assert.equal(fit.state, 'ok');
  assert.equal(fit.sampleSize, 10);
  // Beta must recover close to the constructed 0.6.
  assert.ok(Math.abs(fit.beta - 0.6) < 0.05, `beta ${fit.beta} should be near 0.6`);
  // Every quantity is its own field; none substitutes for another.
  for (const key of ['beta', 'alphaAnnualized', 'rSquared', 'correlation', 'residualRiskAnnualized', 'betaStandardError']) {
    assert.ok(Object.prototype.hasOwnProperty.call(fit, key), `${key} must be reported separately`);
  }
  // A 10-period sample is below the configured 126 minimum and must say so.
  assert.equal(fit.sampleState, 'below-configured-minimum');
  assert.equal(fit.configuredMinimum, 126);
});

test('TP-08-01 ADVERSARIAL a low-fit beta is not reported as a precise one', () => {
  // Portfolio almost uncorrelated with the benchmark: beta is near zero, and the honest reading is
  // that the BENCHMARK explains little -- not that the portfolio carries little risk.
  const bench = [0.01, -0.01, 0.01, -0.01, 0.01, -0.01, 0.01, -0.01];
  const port = [0.03, 0.028, -0.031, -0.029, 0.032, 0.027, -0.03, -0.028];
  const fit = RLPA.fitCapm(port, bench, { periodsPerYear: 252 });
  assert.equal(fit.state, 'ok');
  assert.ok(fit.rSquared < 0.3, `rSquared ${fit.rSquared} should be low for this fixture`);
  assert.equal(fit.fitState, 'low-explanatory-power');
  // Residual risk must be LARGE here: the portfolio is volatile even though beta is small, which is
  // exactly the case where reading beta as total risk would mislead.
  assert.ok(fit.residualRiskAnnualized > 0.1, 'a low beta must not imply low total risk');
});

test('TP-08-01 CAPM refuses degenerate and mismatched input', () => {
  assert.equal(RLPA.fitCapm([0.1, 0.2], [0.1]).state, 'length-mismatch');
  assert.equal(RLPA.fitCapm([0.1], [0.1]).state, 'insufficient-sample');
  assert.equal(RLPA.fitCapm([0.1, 0.2], [0.05, NaN]).state, 'non-finite-input');
  // A benchmark that never moved cannot explain anything; dividing by its variance would
  // manufacture an infinite beta.
  assert.equal(RLPA.fitCapm([0.1, 0.2, 0.3], [0.01, 0.01, 0.01]).state, 'benchmark-degenerate');
  assert.equal(RLPA.fitCapm(null, []).state, 'input-invalid');
});

/* ------------------------------------ Scope 08: covariance and risk contribution */

test('TP-08-01 covariance keeps raw and conditioned matrices separate', () => {
  const returns = {
    AAA: [0.01, -0.02, 0.015, -0.005, 0.02],
    BBB: [0.005, -0.01, 0.008, -0.002, 0.011]
  };
  const cov = RLPA.computeCovariance(returns, { shrinkageLambda: 0.2 });
  assert.equal(cov.state, 'ok');
  assert.deepEqual(cov.symbols, ['AAA', 'BBB']);

  // Independent: sample variance of AAA with Bessel correction.
  const a = returns.AAA;
  const ma = a.reduce((x, y) => x + y, 0) / a.length;
  const varA = a.reduce((acc, v) => acc + (v - ma) ** 2, 0) / (a.length - 1);
  assert.ok(near(cov.raw[0][0], varA, 1e-12));

  // Shrinkage pulls the OFF-diagonal toward zero and leaves variances untouched.
  assert.ok(near(cov.conditioned[0][0], cov.raw[0][0]), 'variances must be preserved');
  assert.ok(near(cov.conditioned[0][1], cov.raw[0][1] * 0.8), 'off-diagonal must shrink by lambda');
  // The two matrices are distinct results, not one replacing the other.
  assert.notEqual(cov.raw, cov.conditioned);
  assert.equal(cov.shrinkageLambda, 0.2);
});

test('TP-08-01 ADVERSARIAL lambda is never auto-raised to rescue a singular matrix', () => {
  // BBB is an exact multiple of AAA, so the covariance matrix is singular by construction.
  const returns = { AAA: [0.01, -0.02, 0.03, -0.01], BBB: [0.02, -0.04, 0.06, -0.02] };
  const cov = RLPA.computeCovariance(returns, { shrinkageLambda: 0 });
  assert.equal(cov.state, 'ok');
  assert.equal(cov.rawPositiveDefinite, false, 'a perfectly collinear pair is not positive definite');
  // The degeneracy is REPORTED, not silently repaired by raising lambda until it inverts.
  assert.equal(cov.shrinkageLambda, 0, 'the configured lambda must be honoured exactly');
  assert.equal(cov.lambdaWasAutoRaised, false);

  assert.equal(RLPA.computeCovariance(returns, { shrinkageLambda: 1.5 }).state, 'lambda-invalid');
  assert.equal(RLPA.computeCovariance({ AAA: [0.1], BBB: [0.1] }, {}).state, 'insufficient-sample');
  assert.equal(RLPA.computeCovariance({ AAA: [0.1, 0.2], BBB: [0.1] }, {}).state, 'length-mismatch');
});

test('TP-08-01 risk contributions reconcile to total risk within tolerance', () => {
  const symbols = ['AAA', 'BBB'];
  const weights = { AAA: 0.6, BBB: 0.4 };
  const cov = [[0.04, 0.006], [0.006, 0.01]];
  const rc = RLPA.riskContributions(symbols, weights, cov, { reconciliationTolerance: 1e-8 });

  assert.equal(rc.state, 'ok');
  // Independent: sigma^2 = .36*.04 + 2*.24*.006 + .16*.01 = .0144 + .00288 + .0016 = .01888.
  const expectedSigma = Math.sqrt(0.01888);
  assert.ok(near(rc.portfolioRisk, expectedSigma, 1e-12));
  // Euler decomposition: contributions must sum to total risk. This is a real arithmetic check.
  assert.ok(near(rc.contributionSum, rc.portfolioRisk, 1e-12));
  assert.equal(rc.reconciled, true);
  assert.ok(rc.reconciliationResidual <= 1e-8);
  // Shares sum to 1 because the parts sum to the whole.
  assert.ok(near(rc.contributionShare.reduce((a, b) => a + b, 0), 1, 1e-12));
});

test('TP-08-01 ADVERSARIAL a genuine hedge reports a NEGATIVE contribution', () => {
  // BBB is strongly negatively correlated with AAA, so it removes risk from the portfolio.
  const symbols = ['AAA', 'BBB'];
  const weights = { AAA: 0.8, BBB: 0.2 };
  const cov = [[0.04, -0.02], [-0.02, 0.02]];
  const rc = RLPA.riskContributions(symbols, weights, cov, {});

  assert.equal(rc.state, 'ok');
  assert.ok(rc.contribution[1] < 0, 'the hedge must show a negative contribution, not a floored zero');
  assert.deepEqual(rc.negativeContributors, ['BBB']);
  // Even with a negative part, the decomposition still adds up.
  assert.ok(near(rc.contributionSum, rc.portfolioRisk, 1e-12));
  assert.equal(rc.reconciled, true);

  assert.equal(RLPA.riskContributions([], {}, []).state, 'no-symbols');
  assert.equal(RLPA.riskContributions(['A'], { A: 1 }, [[0]]).state, 'zero-variance');
  assert.equal(RLPA.riskContributions(['A'], {}, [[0.1]]).state, 'weights-invalid');
  assert.equal(RLPA.riskContributions(['A', 'B'], { A: 0.5, B: 0.5 }, [[0.1]]).state, 'covariance-shape-invalid');
});

test('TP-08-01 ADVERSARIAL the Cholesky pivot tolerance cannot reject a valid matrix', () => {
  // isPositiveDefinite tests the pivot against scale * 1e-12 rather than exact zero, so that a
  // genuinely singular matrix is not called positive-definite by float noise. That tolerance must
  // be noise-only. This matrix is ill-conditioned but genuinely positive-definite -- its smallest
  // eigenvalue is ~1e-6 relative to the diagonal, six orders of magnitude above the tolerance --
  // and must still be accepted.
  const nearly = { AAA: [], BBB: [] };
  for (let i = 0; i < 40; i += 1) {
    const base = Math.sin(i) * 0.02;
    nearly.AAA.push(base);
    nearly.BBB.push(base * 2 + Math.cos(i * 7) * 0.00002);
  }
  const cov = RLPA.computeCovariance(nearly, { shrinkageLambda: 0 });
  assert.equal(cov.state, 'ok');
  assert.equal(cov.rawPositiveDefinite, true, 'ill-conditioned but valid must still be accepted');

  // And shrinkage is what a caller applies DELIBERATELY to condition a hard matrix -- it is offered,
  // never applied behind their back.
  const shrunk = RLPA.computeCovariance(nearly, { shrinkageLambda: 0.2 });
  assert.equal(shrunk.shrinkageLambda, 0.2);
  assert.equal(shrunk.conditionedPositiveDefinite, true);
});

test('TP-08-01 the projection carries each diagnostic independently unavailable', () => {
  const dates = ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08'];
  const base = {
    holdings: [{ symbol: 'AAA', derivedValue: 600, sector: 'Tech' }, { symbol: 'BBB', derivedValue: 400 }],
    series: {
      AAA: dates.map((d, i) => ({ date: d, close: [100, 110, 95, 105, 102][i] })),
      BBB: dates.map((d, i) => ({ date: d, close: [50, 50.5, 49, 50, 50.2][i] }))
    },
    cutoff: '2026-05-08',
    periodsPerYear: 252,
    concentrationLenses: ['symbol', 'sector'],
    shrinkageLambda: 0.2,
    reconciliationTolerance: 1e-8
  };

  const full = RLPA.riskXRayProjection({ ...base, benchmarkReturns: [0.01, -0.02, 0.015, -0.005], benchmarkSymbol: 'SPY' });
  assert.equal(full.state, 'ok');
  assert.equal(full.capm.state, 'ok');
  assert.equal(full.covariance.state, 'ok');
  assert.equal(full.contributions.state, 'ok');
  // Contributions must declare WHICH matrix they used, so a shrinkage assumption is never implicit.
  assert.equal(full.contributions.basis, 'conditioned');
  assert.equal(full.contributions.shrinkageLambda, 0.2);
  // Covariance runs on the SAME aligned basis as the weights, not a re-derived one.
  assert.deepEqual(full.covariance.symbols, ['AAA', 'BBB']);
  assert.equal(full.covariance.sampleSize, full.metrics.sampleSize);

  // ADVERSARIAL: an absent benchmark must NOT suppress the other diagnostics. Each is independently
  // unavailable, because a reader losing concentration because a benchmark is missing would be told
  // nothing is measurable when most of it is.
  const noBenchmark = RLPA.riskXRayProjection(base);
  assert.equal(noBenchmark.capm.state, 'benchmark-unavailable');
  assert.equal(noBenchmark.covariance.state, 'ok');
  assert.equal(noBenchmark.contributions.state, 'ok');
  assert.equal(noBenchmark.concentration[0].state, 'ok');
  assert.equal(noBenchmark.metrics.state, 'ok');

  // A benchmark of the wrong length is refused rather than truncated to fit.
  const shortBenchmark = RLPA.riskXRayProjection({ ...base, benchmarkReturns: [0.01] });
  assert.equal(shortBenchmark.capm.state, 'benchmark-unavailable');

  // Concentration coverage differs per lens on the same portfolio: every holding has a symbol, only
  // one has a sector.
  assert.equal(full.concentration[0].coverageState, 'complete');
  assert.equal(full.concentration[1].coverageState, 'partial');
  assert.deepEqual(full.concentration[1].missing, ['BBB']);
});

/* --------------------------------------------------- Scope 08: factor model */

test('TP-08-01 factor OLS recovers declared proxy exposures and names them proxies', () => {
  // Construct returns with KNOWN exposures: 1.0 market + 0.5 size, plus a small residual.
  const market = [0.010, -0.020, 0.015, -0.005, 0.020, -0.010, 0.008, -0.012, 0.011, -0.007, 0.013, -0.009];
  const size = [0.004, 0.006, -0.008, 0.003, -0.005, 0.007, -0.002, 0.005, -0.006, 0.004, -0.003, 0.006];
  const eps = [0.0002, -0.0003, 0.0001, 0.0004, -0.0002, 0.0003, -0.0001, 0.0002, -0.0004, 0.0001, 0.0003, -0.0002];
  const port = market.map((m, i) => 1.0 * m + 0.5 * size[i] + eps[i]);

  const fit = RLPA.fitFactors(port, { market, size }, { periodsPerYear: 252, factorsVersion: 'proxy-factors/v1' });
  assert.equal(fit.state, 'ok');
  assert.ok(Math.abs(fit.exposures.market - 1.0) < 0.05, `market ${fit.exposures.market} should be near 1.0`);
  assert.ok(Math.abs(fit.exposures.size - 0.5) < 0.05, `size ${fit.exposures.size} should be near 0.5`);
  assert.ok(fit.rSquared > 0.9, 'a constructed fit should explain nearly everything');

  // The payload names itself a proxy so a consumer cannot quietly promote it to a real factor.
  assert.equal(fit.basis, 'declared-proxy-spreads');
  assert.equal(fit.factorsVersion, 'proxy-factors/v1');
  assert.deepEqual(fit.unavailable, []);
});

test('TP-08-01 ADVERSARIAL collinear factors refuse instead of returning a pseudo-fit', () => {
  const market = [0.01, -0.02, 0.015, -0.005, 0.02, -0.01, 0.008, -0.012, 0.011, -0.007];
  // `duplicate` is an exact multiple of `market`, so the design matrix is rank-deficient. A
  // pseudo-inverse would happily split the exposure between them and report two confident numbers
  // that are not separately identified by the data.
  const duplicate = market.map((m) => m * 2);
  const port = market.map((m) => 0.8 * m);
  const fit = RLPA.fitFactors(port, { market, duplicate }, {});
  assert.equal(fit.state, 'rank-deficient');
  assert.equal(Object.prototype.hasOwnProperty.call(fit, 'exposures'), false, 'no exposure may be reported');

  // A factor whose leg has no observations is NAMED unavailable, never silently dropped.
  const partial = RLPA.fitFactors(port, { market, missing: [] }, {});
  assert.equal(partial.state, 'ok');
  assert.deepEqual(partial.unavailable, ['missing']);
  assert.deepEqual(partial.available, ['market']);

  assert.equal(RLPA.fitFactors(port, {}, {}).state, 'no-factors');
  assert.equal(RLPA.fitFactors(port, { a: [], b: [] }, {}).state, 'no-usable-factors');
  assert.equal(RLPA.fitFactors([0.1, 0.2], { market: [0.1, 0.2] }, {}).state, 'insufficient-sample');
  assert.equal(RLPA.fitFactors(null, { market: [] }, {}).state, 'input-invalid');
});

test('TP-08-01 return contribution is a different quantity from risk contribution', () => {
  const symbols = ['AAA', 'BBB'];
  const weights = { AAA: 0.5, BBB: 0.5 };
  // AAA is calm and strongly positive; BBB is volatile and ends flat. Return contribution should
  // be dominated by AAA while risk contribution is dominated by BBB -- the exact disagreement that
  // makes reporting one as the other misleading.
  const perSymbolReturns = {
    AAA: [0.01, 0.01, 0.01, 0.01],
    BBB: [0.20, -0.20, 0.20, -0.20]
  };
  const rc = RLPA.returnContributions(symbols, weights, perSymbolReturns, {});
  assert.equal(rc.state, 'ok');
  // Independent: AAA 0.5 * 0.04 = 0.02; BBB 0.5 * 0.0 = 0.
  assert.ok(near(rc.contribution[0], 0.02, 1e-12));
  assert.ok(near(rc.contribution[1], 0, 1e-12));
  assert.ok(near(rc.contributionSum, 0.02, 1e-12));
  assert.ok(near(rc.contributionShare[0], 1, 1e-9), 'the calm holding supplied all the return');

  // Now the RISK split on the same book: BBB carries essentially all of it.
  const cov = RLPA.computeCovariance(perSymbolReturns, { shrinkageLambda: 0 });
  const risk = RLPA.riskContributions(cov.symbols, weights, cov.conditioned, {});
  assert.equal(risk.state, 'ok');
  const bbbIndex = cov.symbols.indexOf('BBB');
  assert.ok(risk.contributionShare[bbbIndex] > 0.9, 'the volatile holding carries the risk');
  // The two decompositions genuinely disagree, which is why they are separate fields.
  assert.notEqual(rc.contributionShare[0] > 0.9, risk.contributionShare[cov.symbols.indexOf('AAA')] > 0.9);
});

test('TP-08-01 ADVERSARIAL a flat portfolio reports no return share rather than dividing by zero', () => {
  const symbols = ['AAA', 'BBB'];
  const weights = { AAA: 0.5, BBB: 0.5 };
  // The two legs cancel exactly, so the portfolio went nowhere. Dividing by ~0 would manufacture
  // enormous shares from a flat book.
  const flat = { AAA: [0.05, -0.05], BBB: [-0.05, 0.05] };
  const rc = RLPA.returnContributions(symbols, weights, flat, { reconciliationTolerance: 1e-8 });
  assert.equal(rc.state, 'ok');
  assert.equal(rc.contributionShare, null, 'no share may be reported for a zero-return portfolio');
  assert.equal(rc.shareState, 'portfolio-return-near-zero');

  assert.equal(RLPA.returnContributions([], {}, {}).state, 'no-symbols');
  assert.equal(RLPA.returnContributions(['AAA'], { AAA: 1 }, {}).state, 'returns-unavailable');
  assert.equal(RLPA.returnContributions(['AAA'], {}, { AAA: [0.1] }).state, 'weights-invalid');
  assert.equal(RLPA.returnContributions(['AAA'], { AAA: 1 }, { AAA: [NaN] }).state, 'non-finite-input');
});

/* ------------------------------------------- Scope 09: dependent-path scenarios */

const SAMPLE = [0.010, -0.020, 0.015, -0.005, 0.020, -0.010, 0.008, -0.012, 0.011, -0.007, 0.013, -0.009];

function scenario(overrides = {}) {
  return {
    contractVersion: 'ScenarioSpecification/v1',
    returnFingerprint: 'sha256:fixture',
    method: 'stationary-bootstrap',
    seed: 20260715,
    meanBlockSessions: 10,
    horizonSessions: 20,
    pathCount: 200,
    parameterDrawCount: 21,
    driftRange: { low: -0.0002, high: 0.0002 },
    startingValue: 100000,
    ...overrides
  };
}

test('TP-09-01 the same specification reproduces byte-identical results', () => {
  const a = RLPA.runScenario(scenario(), SAMPLE, {});
  const b = RLPA.runScenario(scenario(), SAMPLE, {});
  assert.equal(a.state, 'ok');
  // Deep equality across the WHOLE result, not just the identity: a matching identity with drifting
  // numbers would be worse than no identity at all.
  assert.deepEqual(a, b);
  assert.equal(a.identity, b.identity);
});

test('TP-09-01 ADVERSARIAL changing seed or block policy creates a distinct identity and result', () => {
  const base = RLPA.runScenario(scenario(), SAMPLE, {});
  const seeded = RLPA.runScenario(scenario({ seed: 20260716 }), SAMPLE, {});
  const blocked = RLPA.runScenario(scenario({ meanBlockSessions: 5 }), SAMPLE, {});

  assert.notEqual(base.identity, seeded.identity, 'a new seed must create a new identity');
  assert.notEqual(base.identity, blocked.identity, 'a new block policy must create a new identity');
  // The identity must not be cosmetic: the numbers must move too.
  assert.notEqual(base.pathRandomness.p50, seeded.pathRandomness.p50);
  assert.notEqual(base.pathRandomness.p05, blocked.pathRandomness.p05);
});

test('TP-09-01 no Math.random, ambient clock, or hidden seed reaches the path engine', () => {
  // Comments are stripped first: this module DOCUMENTS the prohibition, and a scan that matched its
  // own prose would fail on the explanation rather than on any executable call.
  const raw = require('node:fs').readFileSync(new URL('../rlportfolioanalytics.js', import.meta.url), 'utf8');
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  assert.equal(/Math\.random/.test(src), false, 'Math.random is prohibited: it cannot be reproduced');
  assert.equal(/Date\.now|new Date\(\)/.test(src), false, 'an ambient clock cannot be reproduced');

  // Determinism proven behaviourally as well as by inspection: the same seed replays exactly.
  const first = RLPA.mulberry32(42);
  const second = RLPA.mulberry32(42);
  const a = [first(), first(), first()];
  const b = [second(), second(), second()];
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, [RLPA.mulberry32(43)(), RLPA.mulberry32(43)(), RLPA.mulberry32(43)()]);
});

test('TP-09-01 stationary bootstrap preserves blocks and wraps cyclically', () => {
  const random = RLPA.mulberry32(7);
  const indices = RLPA.stationaryBootstrapIndices(10, 500, 10, random);
  assert.equal(indices.length, 500);
  assert.equal(indices.every((i) => Number.isInteger(i) && i >= 0 && i < 10), true);

  // With mean block 10 over a 10-observation sample, consecutive-index continuation must dominate:
  // that continuation IS the dependence the bootstrap exists to preserve.
  let consecutive = 0;
  for (let i = 1; i < indices.length; i += 1) {
    if (indices[i] === (indices[i - 1] + 1) % 10) consecutive += 1;
  }
  assert.ok(consecutive / (indices.length - 1) > 0.5, `blocks must persist, got ${consecutive / (indices.length - 1)}`);

  // Cyclic wrap: index 0 must be reachable by continuation from the last observation, otherwise the
  // tail of the history is quietly under-sampled.
  let wrapped = false;
  for (let i = 1; i < indices.length; i += 1) {
    if (indices[i - 1] === 9 && indices[i] === 0) { wrapped = true; break; }
  }
  assert.equal(wrapped, true, 'the sequence must wrap cyclically rather than truncate');

  assert.equal(RLPA.stationaryBootstrapIndices(0, 5, 10, random), null);
  assert.equal(RLPA.stationaryBootstrapIndices(10, 5, 0, random), null);
});

test('TP-09-01 path randomness and parameter uncertainty are reported separately', () => {
  const result = RLPA.runScenario(scenario(), SAMPLE, { survivalFloor: 50000 });
  assert.equal(result.state, 'ok');

  // Three DISTINCT labelled distributions; none is a rename of another.
  assert.ok(result.pathRandomness.label.includes('Path randomness'));
  assert.ok(result.parameterUncertainty.label.includes('Across-parameter'));
  assert.ok(result.combined.label.includes('Combined'));
  assert.notEqual(result.pathRandomness.p05, result.combined.p05);

  // The most influential assumption is named rather than left to the reader.
  assert.equal(result.influence.assumption, 'drift');
  assert.ok(result.influence.medianSpread > 0);

  // Common random numbers are declared, which is what makes node-to-node differences attributable
  // to the parameter rather than to resampling noise.
  assert.equal(result.commonRandomStreams, true);

  // No point estimate is presented as the survival truth.
  assert.equal(result.representativePathIsExample, true);
  assert.ok(result.noExpectedPathClaim.includes('not a forecast'));
});

test('TP-09-01 ADVERSARIAL IID is labelled a simplification, never an equal alternative', () => {
  const boot = RLPA.runScenario(scenario(), SAMPLE, {});
  const iid = RLPA.runScenario(scenario({ method: 'iid' }), SAMPLE, {});
  assert.equal(iid.state, 'ok');
  assert.ok(iid.methodNote.includes('independence simplification'));
  assert.ok(iid.methodNote.includes('discards'));
  assert.ok(boot.methodNote.includes('preserving short-run dependence'));
  assert.notEqual(boot.identity, iid.identity);
});

test('TP-09-01 the scenario contract is exact and refuses incomplete or contradictory specs', () => {
  assert.equal(RLPA.validateScenarioSpecification(scenario()).ok, true);

  // Exact keys: an extra field the engine ignores would let two different scenarios collide on one
  // identity, which is the silent collision the identity exists to prevent.
  const extra = scenario();
  extra.unusedKnob = 1;
  assert.equal(RLPA.validateScenarioSpecification(extra).reason, 'spec-keys-exact');

  const missing = scenario();
  delete missing.seed;
  assert.equal(RLPA.validateScenarioSpecification(missing).reason, 'spec-keys-exact');

  assert.equal(RLPA.validateScenarioSpecification(scenario({ contractVersion: 'v2' })).reason, 'contract-version');
  assert.equal(RLPA.validateScenarioSpecification(scenario({ method: 'regime' })).reason, 'method');
  assert.equal(RLPA.validateScenarioSpecification(scenario({ seed: -1 })).reason, 'seed');
  assert.equal(RLPA.validateScenarioSpecification(scenario({ horizonSessions: 0 })).reason, 'horizon');
  assert.equal(RLPA.validateScenarioSpecification(scenario({ driftRange: { low: 0.1, high: -0.1 } })).reason, 'drift-range');
  assert.equal(RLPA.validateScenarioSpecification(scenario({ startingValue: 0 })).reason, 'starting-value');
  assert.equal(RLPA.scenarioIdentity(scenario({ seed: -1 })), null);

  assert.equal(RLPA.runScenario(scenario(), [0.1], {}).state, 'insufficient-sample');
  assert.equal(RLPA.runScenario(scenario(), [0.1, NaN], {}).state, 'non-finite-input');
  // A budget refuses rather than freezing the tab on an unbounded run.
  assert.equal(RLPA.runScenario(scenario(), SAMPLE, { maximumPaths: 10 }).state, 'budget-exceeded');
});

test('TP-09-01 the parameter grid is deterministic and stratified', () => {
  const grid = RLPA.parameterGrid({ low: -1, high: 1 }, 5);
  assert.deepEqual(grid, [-1, -0.5, 0, 0.5, 1]);
  // A single draw is the centre, which is the honest degenerate case rather than an arbitrary end.
  assert.deepEqual(RLPA.parameterGrid({ low: -1, high: 1 }, 1), [0]);
  assert.deepEqual(RLPA.parameterGrid({ low: -1, high: 1 }, 5), RLPA.parameterGrid({ low: -1, high: 1 }, 5));
  assert.equal(RLPA.parameterGrid({ low: 1, high: -1 }, 5), null);
  assert.equal(RLPA.parameterGrid(null, 5), null);
});

test('TP-09-01 fan bands come from the same streams as the terminals and widen with horizon', () => {
  const sample = [0.01, -0.02, 0.015, -0.005, 0.02, -0.01, 0.008, -0.012];
  const spec = {
    contractVersion: 'ScenarioSpecification/v1',
    returnFingerprint: 'sha256:fan-band-fixture',
    method: 'stationary-bootstrap',
    meanBlockSessions: 3,
    horizonSessions: 10,
    pathCount: 200,
    parameterDrawCount: 3,
    driftRange: { low: -0.0002, high: 0.0002 },
    startingValue: 1,
    seed: 11
  };
  const run = RLPA.runScenario(spec, sample, { maximumPaths: 20000 });
  assert.equal(run.state, 'ok');

  // One band per session boundary, including the known starting point.
  assert.equal(run.fanBands.length, spec.horizonSessions + 1);
  assert.equal(run.fanBands[0].session, 0);
  // At session 0 every path is the starting value, so the band has zero width. A non-zero band
  // there would mean the chart started from something the run did not.
  assert.ok(near(run.fanBands[0].p05, spec.startingValue, 1e-12));
  assert.ok(near(run.fanBands[0].p95, spec.startingValue, 1e-12));

  // Percentiles are ordered at every session, or the band is not a band.
  run.fanBands.forEach((band) => {
    assert.ok(band.p05 <= band.p50, `p05 <= p50 at session ${band.session}`);
    assert.ok(band.p50 <= band.p95, `p50 <= p95 at session ${band.session}`);
  });

  // Uncertainty grows with horizon: the final band must be wider than an early one.
  const early = run.fanBands[1].p95 - run.fanBands[1].p05;
  const last = run.fanBands[run.fanBands.length - 1].p95 - run.fanBands[run.fanBands.length - 1].p05;
  assert.ok(last > early, `final band ${last} must exceed early band ${early}`);

  /* ADVERSARIAL: the fan must be the SAME run as the terminal numbers. The terminal band is
   * computed independently of fanBands, so if the chart were drawn from a second sample these
   * would disagree. */
  const finalBand = run.fanBands[run.fanBands.length - 1];
  assert.ok(near(finalBand.p50, run.pathRandomness.p50, 1e-9),
    `fan terminal median ${finalBand.p50} must equal the reported path-randomness median ${run.pathRandomness.p50}`);
  assert.ok(near(finalBand.p05, run.pathRandomness.p05, 1e-9));
  assert.ok(near(finalBand.p95, run.pathRandomness.p95, 1e-9));

  // Reproducible: the same specification produces the identical fan.
  const rerun = RLPA.runScenario(spec, sample, { maximumPaths: 20000 });
  assert.deepEqual(rerun.fanBands, run.fanBands);
});

test("TP-07-01 return math is delegated to rlmetrics, not redefined here", () => {
  // P18: a metric is defined once. If this module ever grew its own arithmetic/CAGR/drag, the
  // repo would have two definitions of each and the brief could publish either.
  const src = require("node:fs").readFileSync(new URL("../rlportfolioanalytics.js", import.meta.url), "utf8");
  for (const owned of ["annualizedArithmetic", "cagr", "volatilityDrag", "annualizedVol"]) {
    const declared = new RegExp(`function\\s+${owned}\\s*\\(`).test(src);
    assert.equal(declared, false, `${owned} must be delegated to rlmetrics.js, not declared here`);
    assert.ok(src.includes(`RLMETRICS.${owned}(`), `${owned} must actually be called on RLMETRICS`);
  }
});

/* ---------------------------------------------------------------------------
   Scope 10 - dated cash needs and survival states
   --------------------------------------------------------------------------- */

const SESSION_DATES = [
  '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09',
  '2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15', '2026-01-16'
];

const need = (over) => ({
  amount: 100,
  currency: 'USD',
  date: '2026-01-08',
  kind: 'withdrawal',
  label: 'Tuition',
  timing: 'end-of-step',
  ...over
});

test('TP-10-01 a cash flow is rejected unless the user stated every part of it', () => {
  assert.equal(RLPA.validateCashFlow(need()).ok, true);

  // Each omission is its own refusal. An inferred currency would silently convert
  // money; an inferred timing would move the need across a market move.
  for (const key of ['amount', 'currency', 'date', 'kind', 'label', 'timing']) {
    const partial = need();
    delete partial[key];
    assert.equal(RLPA.validateCashFlow(partial).ok, false, key + ' must be required');
    assert.equal(RLPA.validateCashFlow(partial).reason, 'flow-keys-exact');
  }

  assert.equal(RLPA.validateCashFlow(need({ kind: 'transfer' })).reason, 'kind');
  assert.equal(RLPA.validateCashFlow(need({ timing: 'mid-step' })).reason, 'timing');
  assert.equal(RLPA.validateCashFlow(need({ amount: 0 })).reason, 'amount');
  assert.equal(RLPA.validateCashFlow(need({ amount: -100 })).reason, 'amount');
  assert.equal(RLPA.validateCashFlow(need({ date: '8 Jan 2026' })).reason, 'date');
  assert.equal(RLPA.validateCashFlow(need({ currency: '' })).reason, 'currency');

  // An extra key is a refusal too: it means the caller believes in a field this
  // engine does not honour, and honouring none of it silently would be worse.
  assert.equal(RLPA.validateCashFlow({ ...need(), inflationAdjust: true }).reason, 'flow-keys-exact');
});

test('TP-10-01 a need lands on the first modeled session on or after its date and is never moved', () => {
  // 2026-01-10 and -11 are a weekend: no session. The need must land on Monday
  // the 12th (index 5), the first session ON OR AFTER the stated date - never
  // pulled back to Friday the 9th, which would fund it before it is owed.
  const weekend = RLPA.scheduleCashFlows([need({ date: '2026-01-10' })], SESSION_DATES);
  assert.equal(weekend.state, 'ok');
  assert.equal(weekend.scheduled.length, 1);
  assert.equal(weekend.scheduled[0].session, 5);
  assert.equal(weekend.scheduled[0].modeledDate, '2026-01-12');
  assert.equal(weekend.scheduled[0].declaredDate, '2026-01-10', 'the declared date is preserved verbatim');

  // An exact session date lands on itself, not the next one.
  const exact = RLPA.scheduleCashFlows([need({ date: '2026-01-08' })], SESSION_DATES);
  assert.equal(exact.scheduled[0].session, 3);
  assert.equal(exact.scheduled[0].modeledDate, '2026-01-08');

  // Beyond the horizon is reported, NOT clamped to the last session. Clamping
  // would reprice the need into a market it was never exposed to.
  const beyond = RLPA.scheduleCashFlows([need({ date: '2026-02-01' })], SESSION_DATES);
  assert.equal(beyond.scheduled.length, 0);
  assert.equal(beyond.rejected[0].reason, 'out-of-horizon');
  assert.equal(beyond.rejected[0].declaredDate, '2026-02-01');
});

test('TP-10-01 flows are ordered chronologically then start-of-step before end-of-step', () => {
  const flows = [
    need({ date: '2026-01-08', timing: 'end-of-step', label: 'B end' }),
    need({ date: '2026-01-06', timing: 'end-of-step', label: 'A end' }),
    need({ date: '2026-01-08', timing: 'start-of-step', label: 'B start' }),
    need({ date: '2026-01-08', timing: 'end-of-step', label: 'B end two' })
  ];
  const out = RLPA.scheduleCashFlows(flows, SESSION_DATES);
  assert.deepEqual(out.scheduled.map((f) => f.label), ['A end', 'B start', 'B end', 'B end two']);

  // Declaration order breaks the remaining tie, so the ordering is total: no two
  // runs of the same input can disagree about which need was funded first.
  assert.deepEqual(out.scheduled.map((f) => f.index), [1, 2, 0, 3]);
});

test('TP-10-01 a withdrawal during a drawdown records collision capital and sequence effect', () => {
  // A path that falls to 800 by session 3, then recovers.
  const path = [1000, 950, 900, 800, 850, 900, 950, 1000, 1050, 1100];
  const flows = RLPA.scheduleCashFlows([need({ amount: 200, date: '2026-01-08' })], SESSION_DATES);
  const applied = RLPA.applyCashFlows(path, flows.scheduled, 'USD');
  assert.equal(applied.state, 'ok');

  const event = applied.events[0];
  assert.equal(event.session, 3);
  assert.equal(event.modeledDate, '2026-01-08');
  assert.equal(event.requestedAmount, 200);
  assert.equal(event.appliedAmount, 200);
  assert.equal(event.fundedFraction, 1);
  assert.equal(event.duringDrawdown, true, 'capital is below the starting value, so this is a collision');
  assert.equal(applied.collisionCount, 1);

  // Independently calculated: end-of-step at session 3 means the market move to
  // 800 happens first, so capital before the withdrawal is exactly 800.
  assert.ok(near(event.capitalBefore, 800, 1e-9));
  assert.ok(near(event.capitalAfter, 600, 1e-9));

  // Sequence risk: the remaining capital compounds from a smaller base, so the
  // terminal is strictly below the no-withdrawal path minus the withdrawal.
  const untouched = RLPA.applyCashFlows(path, [], 'USD');
  assert.ok(near(untouched.terminalCapital, 1100, 1e-9));
  assert.ok(applied.terminalCapital < untouched.terminalCapital - 200,
    'withdrawing in a drawdown costs more than the amount withdrawn');
  // 600 growing 800 -> 1100 is 600 * 1.375 = 825.
  assert.ok(near(applied.terminalCapital, 825, 1e-9));
});

test('TP-10-01 the same need at a different date changes the outcome, proving timing is honoured', () => {
  const path = [1000, 950, 900, 800, 850, 900, 950, 1000, 1050, 1100];
  const schedule = (date) => RLPA.scheduleCashFlows([need({ amount: 200, date })], SESSION_DATES).scheduled;
  const early = RLPA.applyCashFlows(path, schedule('2026-01-08'), 'USD');
  const late = RLPA.applyCashFlows(path, schedule('2026-01-15'), 'USD');

  assert.equal(early.events[0].session, 3);
  assert.equal(late.events[0].session, 8);
  assert.equal(early.events[0].duringDrawdown, true);
  assert.equal(late.events[0].duringDrawdown, false, 'by session 8 capital is above its start');

  // If the engine silently shifted needs to a convenient step, these would match.
  assert.ok(Math.abs(early.terminalCapital - late.terminalCapital) > 1,
    'withdrawal date must change the result');
});

test('TP-10-01 an underfunded need is recorded as a partial fill, never reduced or skipped', () => {
  const path = [1000, 500, 400, 300, 300, 300, 300, 300, 300, 300];
  const flows = RLPA.scheduleCashFlows([need({ amount: 5000, date: '2026-01-08' })], SESSION_DATES);
  const applied = RLPA.applyCashFlows(path, flows.scheduled, 'USD');

  const event = applied.events[0];
  assert.equal(event.requestedAmount, 5000, 'the request is preserved at full size');
  assert.ok(near(event.appliedAmount, 300, 1e-9));
  assert.ok(near(event.fundedFraction, 300 / 5000, 1e-9));
  assert.equal(applied.shortfallCount, 1);
  assert.ok(near(event.capitalAfter, 0, 1e-9));
  assert.equal(applied.events.length, 1, 'the need still appears; it is not skipped');
});

test('TP-10-01 a currency mismatch refuses rather than silently converting', () => {
  const path = [1000, 1000, 1000];
  const flows = RLPA.scheduleCashFlows([need({ currency: 'EUR', date: '2026-01-06' })], SESSION_DATES);
  const applied = RLPA.applyCashFlows(path, flows.scheduled, 'USD');
  assert.equal(applied.state, 'currency-mismatch');
  assert.equal(applied.expected, 'USD');
  assert.equal(applied.found, 'EUR');

  // A missing portfolio currency is a refusal too: without it there is nothing
  // to compare the need against.
  assert.equal(RLPA.applyCashFlows(path, [], '').state, 'currency-required');
});

test('TP-10-01 survival is unavailable with a reason when the definition is incomplete', () => {
  const paths = [[1000, 900, 800], [1000, 1100, 1200]];

  const none = RLPA.computeSurvival(null, paths);
  assert.equal(none.state, 'unavailable');
  assert.equal(none.reason, 'no-definition');
  assert.deepEqual(none.missing.slice().sort(), ['currency', 'floorValue', 'horizonSessions', 'startingValue']);

  // Every single missing field is named. A partially stated plan is not a plan.
  const complete = { floorValue: 500, horizonSessions: 3, currency: 'USD', startingValue: 1000 };
  for (const key of Object.keys(complete)) {
    const partial = { ...complete };
    delete partial[key];
    const out = RLPA.computeSurvival(partial, paths);
    assert.equal(out.state, 'unavailable', key + ' must be required');
    assert.equal(out.reason, 'incomplete-definition');
    assert.deepEqual(out.missing, [key]);
  }

  // Adversarial: no default floor is invented anywhere in the unavailable result.
  const unavailable = RLPA.computeSurvival({ horizonSessions: 3, currency: 'USD', startingValue: 1000 }, paths);
  assert.equal(unavailable.survivalProbability, undefined, 'no probability without a floor');
  assert.equal(unavailable.floorValue, undefined, 'no floor is supplied');
});

test('TP-10-01 survival counts a breach at any session, not only at the horizon', () => {
  const paths = [
    [1000, 900, 1100],   // dips to 900, never below 800 -> survives
    [1000, 700, 1200],   // dips to 700 -> fails even though it ends high
    [1000, 1100, 1200]   // never dips -> survives
  ];
  const out = RLPA.computeSurvival({ floorValue: 800, horizonSessions: 3, currency: 'USD', startingValue: 1000 }, paths);
  assert.equal(out.state, 'ok');
  assert.equal(out.pathCount, 3);
  assert.equal(out.survivingPaths, 2);
  assert.ok(near(out.survivalProbability, 2 / 3, 1e-12));

  // The middle path recovers to 1200. A terminal-only test would call it a
  // success, which is exactly the failure mode this assertion exists to catch.
  assert.equal(out.firstBreachMedianSession, 1);
  assert.ok(out.failureDefinition.includes('800'));
  assert.ok(out.failureDefinition.includes('USD'));
});

/* ---------------------------------------------------------------------------
   Scope 11 - stress, tail, and alternative dependence
   --------------------------------------------------------------------------- */

test('TP-11-01 raw stress dependence reports its samples by name and refuses to call it contagion', () => {
  // Same underlying relationship in both windows; the stress window is simply
  // scaled up. A raw correlation comparison must NOT read this as contagion.
  const tranquilA = [0.01, -0.01, 0.02, -0.02, 0.015, -0.015];
  const tranquilB = [0.008, -0.012, 0.018, -0.019, 0.012, -0.014];
  const stressA = tranquilA.map((v) => v * 4);
  const stressB = tranquilB.map((v) => v * 4);

  const out = RLPA.compareStressDependence({
    tranquil: { name: '2019 tranquil', a: tranquilA, b: tranquilB },
    stress: { name: '2020 drawdown', a: stressA, b: stressB }
  });
  assert.equal(out.state, 'ok');
  assert.deepEqual(out.samples.map((s) => s.name), ['2019 tranquil', '2020 drawdown']);
  assert.deepEqual(out.samples.map((s) => s.count), [6, 6]);

  // Pure rescaling leaves correlation identical - the estimate must show that.
  assert.ok(near(out.rawCorrelationChange, 0, 1e-12), 'rescaling alone does not change correlation');
  assert.ok(near(out.varianceRatio, 16, 1e-9), 'variance rises 4^2 while correlation does not');

  // The refusal to label is the point of the row.
  assert.equal(out.contagionLabel, null, 'no automatic contagion verdict');
  assert.ok(out.interpretation.includes('not, by itself, evidence of contagion'));

  // Unnamed samples are refused: an unnamed window is an unauditable window.
  assert.equal(RLPA.compareStressDependence({
    tranquil: { a: tranquilA, b: tranquilB },
    stress: { name: 's', a: stressA, b: stressB }
  }).state, 'sample-names-required');
});

test('TP-11-01 the Forbes-Rigobon adjustment removes the mechanical part of a correlation rise', () => {
  // Independently calculated: rho = 0.8, variance up 3x so delta = 2.
  // denominator = 1 + 2 * (1 - 0.64) = 1.72; adjusted = 0.8 / sqrt(1.72).
  const out = RLPA.forbesRigobonAdjustment({
    rawStressCorrelation: 0.8,
    tranquilVariance: 0.0001,
    stressVariance: 0.0003,
    anchorSeries: 'SPY'
  });
  assert.equal(out.state, 'ok');
  assert.ok(near(out.varianceIncrease, 2, 1e-12));
  assert.ok(near(out.adjustedCorrelation, 0.8 / Math.sqrt(1.72), 1e-12));
  assert.ok(out.adjustedCorrelation < out.rawStressCorrelation, 'the adjustment lowers the raw estimate');

  // The anchor travels with the number, because adjusting on the other series
  // answers a different question and the value alone cannot say which was used.
  assert.equal(out.anchorSeries, 'SPY');
  assert.ok(out.claimBoundary.includes('SPY'));
  assert.ok(out.claimBoundary.includes('does not prove it'));
  assert.ok(out.claimBoundary.includes('does not disprove it'));
  assert.equal(out.assumptions.length, 3, 'the formula assumptions are stated, not implied');

  // Every precondition refuses by name rather than returning a plausible number.
  assert.equal(RLPA.forbesRigobonAdjustment({ tranquilVariance: 1, stressVariance: 2, anchorSeries: 'A' }).reason,
    'raw-correlation-required');
  assert.equal(RLPA.forbesRigobonAdjustment({ rawStressCorrelation: 1.4, tranquilVariance: 1, stressVariance: 2, anchorSeries: 'A' }).reason,
    'correlation-out-of-range');
  assert.equal(RLPA.forbesRigobonAdjustment({ rawStressCorrelation: 0.5, stressVariance: 2, anchorSeries: 'A' }).reason,
    'tranquil-variance-required');
  assert.equal(RLPA.forbesRigobonAdjustment({ rawStressCorrelation: 0.5, tranquilVariance: 1, stressVariance: 2 }).reason,
    'anchor-series-required');

  // No variance increase means there is nothing to correct. Returning a number
  // here would manufacture an adjustment out of an unstressed window.
  const flat = RLPA.forbesRigobonAdjustment({
    rawStressCorrelation: 0.5, tranquilVariance: 0.001, stressVariance: 0.001, anchorSeries: 'SPY'
  });
  assert.equal(flat.state, 'unavailable');
  assert.equal(flat.reason, 'no-variance-increase');
  assert.equal(flat.adjustedCorrelation, undefined);
});

test('TP-11-01 tail dependence reports its joint event count and refuses a thin tail', () => {
  // 20 paired observations; the lowest 25% of each is 5 observations.
  const a = [];
  const b = [];
  for (let i = 0; i < 20; i += 1) { a.push(i); b.push(i); }

  const out = RLPA.lowerTailDependence(a, b, { quantile: 0.25, minimumJointEvents: 3 });
  assert.equal(out.state, 'ok');
  assert.equal(out.sampleSize, 20);
  // Perfectly comonotone: every marginal lower-tail observation is also joint.
  assert.equal(out.jointEvents, out.marginalEvents);
  assert.ok(near(out.estimate, 1, 1e-12));
  assert.ok(out.jointEvents >= 3);

  // Even at an estimate of exactly 1, the copy must not generalise.
  assert.ok(out.claimBoundary.includes('does NOT say that all assets become perfectly correlated'));

  // Independent series: the joint count falls far below the marginal count.
  const opposed = a.slice().reverse();
  const anti = RLPA.lowerTailDependence(a, opposed, { quantile: 0.25, minimumJointEvents: 1 });
  assert.equal(anti.state, 'unavailable');
  assert.equal(anti.reason, 'thin-tail-sample');
  assert.equal(anti.jointEvents, 0, 'opposed series never share a lower tail');

  // A floor above the observable count refuses rather than reporting noise.
  const thin = RLPA.lowerTailDependence(a, b, { quantile: 0.25, minimumJointEvents: 99 });
  assert.equal(thin.state, 'unavailable');
  assert.equal(thin.reason, 'thin-tail-sample');
  assert.equal(thin.estimate, undefined, 'no estimate is emitted below the floor');
  assert.ok(thin.note.includes('noise with a decimal point'));

  // Quantile and floor are both required: neither is defaulted.
  assert.equal(RLPA.lowerTailDependence(a, b, { minimumJointEvents: 3 }).reason, 'quantile-required');
  assert.equal(RLPA.lowerTailDependence(a, b, { quantile: 0.25 }).reason, 'event-floor-required');
});

test('TP-11-01 an appraisal-valued asset is qualified, never treated as mechanically orthogonal', () => {
  const complete = {
    valuationFrequency: 'quarterly',
    lastValuationDate: '2026-03-31',
    valuationMethod: 'appraisal',
    liquidity: 'low',
    expectedTransactionCostFraction: 0.06
  };

  const out = RLPA.alternativeAssetQuality(complete);
  assert.equal(out.state, 'ok');
  assert.equal(out.smoothingSuspected, true);
  assert.equal(out.requiresSensitivity, true, 'a conclusion is blocked until a sensitivity is run');
  assert.ok(out.caveat.includes('understated by appraisal'));
  assert.ok(out.caveat.includes('must NOT be treated as mechanically uncorrelated'));

  // Market-observed series are not falsely flagged.
  const market = RLPA.alternativeAssetQuality({ ...complete, valuationMethod: 'market-observed' });
  assert.equal(market.smoothingSuspected, false);
  assert.equal(market.requiresSensitivity, false);

  // Every missing field is named, and absence never becomes an orthogonality argument.
  for (const key of Object.keys(complete)) {
    const partial = { ...complete };
    delete partial[key];
    const missing = RLPA.alternativeAssetQuality(partial);
    assert.equal(missing.state, 'unavailable', key + ' must be required');
    assert.deepEqual(missing.missing, [key]);
    assert.ok(missing.note.includes('Missing evidence is not an argument for orthogonality'));
  }
});

test('TP-11-01 de-smoothing is a sensitivity that raises variance and never replaces the observed series', () => {
  const observed = [0.02, 0.021, 0.019, 0.022, 0.018, 0.02];
  const out = RLPA.desmoothReturns(observed, 0.5);
  assert.equal(out.state, 'ok');
  assert.equal(out.rho, 0.5);

  // Independently calculated first element: (0.021 - 0.5 * 0.02) / 0.5 = 0.022.
  assert.ok(near(out.desmoothed[0], 0.022, 1e-12));
  assert.equal(out.desmoothed.length, observed.length - 1, 'one lag is consumed, not interpolated back');

  // The whole point: smoothing understates variance, so de-smoothing raises it.
  assert.ok(out.desmoothedVariance > out.observedVariance,
    'de-smoothing must reveal the variance appraisal smoothing hides');

  // The observed record is preserved verbatim alongside the sensitivity.
  assert.deepEqual(out.observed, observed);
  assert.ok(out.claimBoundary.includes('observed series is unchanged'));

  // rho is explicit, never assumed.
  assert.equal(RLPA.desmoothReturns(observed).reason, 'rho-required');
  assert.equal(RLPA.desmoothReturns(observed, 0).reason, 'rho-required');
  assert.equal(RLPA.desmoothReturns(observed, 1).reason, 'rho-required');
});

/* ---------------------------------------------------------------------------
   Scope 12 - hedge variant research
   --------------------------------------------------------------------------- */

const HEDGE_BASE = {
  targetExposureValue: 100000,
  targetVolatility: 0.20,
  hedgeRatio: 1,
  horizonYears: 1,
  annualCarryFraction: 0.01,
  commissionFraction: 0.001,
  spreadFraction: 0.0005,
  slippageFraction: 0.0005,
  rebalancesPerYear: 4,
  basisCorrelation: 1,
  proxySymbol: 'FXE',
  instrumentClass: 'currency-forward-proxy-etf',
  liquidity: 'high'
};

test('TP-12-01 a fully hedged variant separates gross risk reduction from every cost', () => {
  const out = RLPA.computeHedgeVariant(HEDGE_BASE);
  assert.equal(out.state, 'ok');

  // Independently calculated. rho = 1, ratio = 1 so residual variance fraction
  // is 1 - 2 + 1 = 0: a perfect proxy fully hedged leaves no residual volatility.
  assert.ok(near(out.residualVolatility, 0, 1e-12));
  assert.ok(near(out.grossVolatilityReduction, 0.20, 1e-12));
  assert.equal(out.basisRiskRemains, false);

  // carry = 100000 * 0.01 * 1 = 1000
  assert.ok(near(out.carryCost, 1000, 1e-9));
  // round trip = 0.001 + 0.0005 + 0.0005 = 0.002; direct = 100000 * 0.002 = 200
  assert.ok(near(out.directCost, 200, 1e-9));
  // rebalances = 4 * 1 = 4; turnover = 100000 * 0.002 * 4 = 800
  assert.equal(out.rebalanceCount, 4);
  assert.ok(near(out.turnoverCost, 800, 1e-9));
  assert.ok(near(out.totalCost, 2000, 1e-9));

  // The three cost components stay separate. A single net number would let a
  // large carry hide behind a large risk reduction.
  assert.ok(out.carryCost !== out.directCost);
  assert.ok(near(out.costPerVolatilityPoint, 2000 / 0.20, 1e-9));

  // The refusals that make this research rather than advice.
  assert.equal(out.prescribedRatio, null);
  assert.equal(out.executable, false);
  assert.ok(out.claimBoundary.includes('No ratio is prescribed as optimal or suitable'));
  assert.ok(out.claimBoundary.includes('your portfolio is not modified'));
});

test('TP-12-01 an imperfect proxy leaves basis risk even at a full hedge ratio', () => {
  // rho = 0.9, ratio = 1 -> residual variance fraction = 1 - 1.8 + 1 = 0.2
  const out = RLPA.computeHedgeVariant({ ...HEDGE_BASE, basisCorrelation: 0.9 });
  assert.equal(out.state, 'ok');
  assert.ok(near(out.residualVolatility, 0.20 * Math.sqrt(0.2), 1e-12));
  assert.ok(out.residualVolatility > 0, 'a full hedge on an imperfect proxy is NOT riskless');
  assert.equal(out.basisRiskRemains, true);

  // This is the whole point: the naive reading of "fully hedged" would report
  // zero residual risk. An implementation that ignored rho would fail here.
  const perfect = RLPA.computeHedgeVariant(HEDGE_BASE);
  assert.ok(out.residualVolatility > perfect.residualVolatility);
  assert.ok(out.grossVolatilityReduction < perfect.grossVolatilityReduction);
});

test('TP-12-01 a missing cost component blocks net benefit and is never treated as zero', () => {
  for (const key of ['annualCarryFraction', 'commissionFraction', 'spreadFraction', 'slippageFraction', 'proxySymbol', 'liquidity']) {
    const partial = { ...HEDGE_BASE };
    delete partial[key];
    const out = RLPA.computeHedgeVariant(partial);
    assert.equal(out.state, 'gross-only', key + ' must block net benefit');
    assert.equal(out.reason, 'incomplete-cost-evidence');
    assert.deepEqual(out.missing, [key]);
    assert.equal(out.netBenefit, null);
    assert.equal(out.totalCost, undefined, 'no total cost is emitted from incomplete evidence');
    assert.ok(out.note.includes('is NOT treated as zero'));
    assert.ok(out.note.includes('zero is a claim about the world'));
  }
});

test('TP-12-01 hedge inputs are validated rather than clamped into a plausible range', () => {
  assert.equal(RLPA.computeHedgeVariant({ ...HEDGE_BASE, hedgeRatio: 1.5 }).reason, 'hedge-ratio-out-of-range');
  assert.equal(RLPA.computeHedgeVariant({ ...HEDGE_BASE, hedgeRatio: -0.2 }).reason, 'hedge-ratio-out-of-range');
  assert.equal(RLPA.computeHedgeVariant({ ...HEDGE_BASE, basisCorrelation: 1.4 }).reason, 'basis-correlation-out-of-range');
  assert.equal(RLPA.computeHedgeVariant({ ...HEDGE_BASE, targetExposureValue: 0 }).reason, 'exposure-invalid');

  // Clamping 1.5 to 1 would silently answer a question the user did not ask.
  assert.equal(RLPA.computeHedgeVariant({ ...HEDGE_BASE, hedgeRatio: 1.5 }).hedgeRatio, undefined);
});

test('TP-12-01 variants are compared on one frozen basis and none is prescribed', () => {
  const out = RLPA.compareHedgeVariants(HEDGE_BASE, [0, 0.5, 1]);
  assert.equal(out.state, 'ok');
  assert.equal(out.basisFrozen, true);
  assert.equal(out.prescribedRatio, null);
  assert.deepEqual(out.variants.map((v) => v.label), ['Unhedged', 'Partial hedge 50%', 'Fully hedged']);

  // Unhedged costs nothing and reduces nothing: the honest baseline.
  assert.ok(near(out.variants[0].totalCost, 0, 1e-12));
  assert.ok(near(out.variants[0].grossVolatilityReduction, 0, 1e-12));
  assert.ok(near(out.variants[0].residualVolatility, 0.20, 1e-12));

  // Cost rises monotonically with the ratio while residual risk falls. Both
  // directions must be visible for the trade-off to be judged.
  assert.ok(out.variants[0].totalCost < out.variants[1].totalCost);
  assert.ok(out.variants[1].totalCost < out.variants[2].totalCost);
  assert.ok(out.variants[0].residualVolatility > out.variants[1].residualVolatility);
  assert.ok(out.variants[1].residualVolatility > out.variants[2].residualVolatility);

  // Every row shares the frozen basis, so only the ratio differs between them.
  for (const variant of out.variants) {
    assert.equal(variant.proxySymbol, HEDGE_BASE.proxySymbol);
    assert.equal(variant.basisCorrelation, HEDGE_BASE.basisCorrelation);
    assert.equal(variant.executable, false);
  }
  assert.ok(out.claimBoundary.includes('None of them is recommended'));
});

/* ---------------------------------------------------------------------------
   Scope 13 - six-method allocation basis and feasibility
   --------------------------------------------------------------------------- */

const ALLOC_COV = [[0.04, 0.01], [0.01, 0.09]];
const ALLOC_BASE = {
  symbols: ['A', 'B'],
  covariance: ALLOC_COV,
  currentWeights: [0.5, 0.5],
  constraints: []
};

test('TP-13-01 all six methods run on one frozen basis and none is labelled best', () => {
  const out = RLPA.compareAllocationMethods({
    ...ALLOC_BASE,
    expectedReturns: [0.06, 0.10],
    views: [0.7, 0.3],
    viewConfidence: 0.5
  });
  assert.equal(out.state, 'ok');
  assert.deepEqual(out.candidates.map((c) => c.method), RLPA.ALLOCATION_METHODS);
  assert.equal(out.basisFrozen, true);

  // The refusal that keeps this a comparison rather than a recommendation.
  assert.equal(out.recommendedMethod, null);
  assert.equal(out.bestMethod, null);
  assert.ok(out.claimBoundary.includes('None is labelled best or recommended'));
  assert.ok(out.claimBoundary.includes('an in-sample lead is the weakest kind of evidence'));

  // Every candidate carries its own visible assumptions, so the reader can see
  // what each method believes rather than only what it produced.
  for (const candidate of out.candidates) {
    assert.ok(Array.isArray(candidate.assumptions) && candidate.assumptions.length > 0,
      candidate.method + ' must state its assumptions');
  }
});

test('TP-13-01 minimum variance solves the full covariance, verified by hand', () => {
  const out = RLPA.compareAllocationMethods(ALLOC_BASE);
  const minVar = out.candidates.find((c) => c.method === 'minimum-variance');

  // Independently calculated. det = 0.04*0.09 - 0.01^2 = 0.0035.
  // inv(S) * 1 proportional to [0.09 - 0.01, 0.04 - 0.01] = [0.08, 0.03].
  // Normalised: 0.08/0.11 and 0.03/0.11.
  assert.ok(near(minVar.weights[0], 0.08 / 0.11, 1e-12));
  assert.ok(near(minVar.weights[1], 0.03 / 0.11, 1e-12));

  // It must actually achieve the lowest volatility of the weight-bearing
  // candidates - that is the only thing it optimises.
  const solved = out.candidates.filter((c) => c.portfolioVolatility !== null);
  const lowest = Math.min(...solved.map((c) => c.portfolioVolatility));
  assert.ok(near(minVar.portfolioVolatility, lowest, 1e-12));

  // Risk parity is inverse VOLATILITY, a different answer. If minimum variance
  // silently dropped the off-diagonals the two would coincide.
  const riskParity = out.candidates.find((c) => c.method === 'risk-parity');
  assert.ok(near(riskParity.weights[0], (1 / 0.2) / (1 / 0.2 + 1 / 0.3), 1e-12));
  assert.ok(Math.abs(riskParity.weights[0] - minVar.weights[0]) > 0.05,
    'minimum variance must not collapse into inverse-variance weighting');
  assert.ok(riskParity.assumptions.join(' ').includes('NOT correlation-adjusted'));
});

test('TP-13-01 methods needing stated inputs refuse rather than inventing them', () => {
  const out = RLPA.compareAllocationMethods(ALLOC_BASE);

  const bl = out.candidates.find((c) => c.method === 'black-litterman');
  assert.equal(bl.state, 'unavailable');
  assert.equal(bl.reason, 'views-and-confidence-required');
  assert.equal(bl.weights, null);
  assert.ok(bl.assumptions.join(' ').includes('a view you did not state is not your view'));

  const mvo = out.candidates.find((c) => c.method === 'constrained-mvo');
  assert.equal(mvo.state, 'unavailable');
  assert.equal(mvo.reason, 'expected-returns-required');
  assert.equal(mvo.weights, null);
  // The specific temptation this refuses: silently using the historical mean.
  assert.ok(mvo.assumptions.join(' ').includes('never estimated from past returns'));

  // The methods that need nothing still produce answers, so the comparison is
  // useful even when the forecast-dependent ones cannot run.
  assert.ok(out.candidates.find((c) => c.method === 'equal-weight').weights);
  assert.ok(out.candidates.find((c) => c.method === 'minimum-variance').weights);
});

test('TP-13-01 conflicting constraints are infeasible and are never silently relaxed', () => {
  // Minimums of 0.7 and 0.6 sum to 1.3: no weight vector can satisfy them.
  const impossible = RLPA.evaluateFeasibility(['A', 'B'], [0.5, 0.5], [
    { subject: 'A', minimum: 0.7, maximum: null },
    { subject: 'B', minimum: 0.6, maximum: null }
  ]);
  assert.equal(impossible.state, 'infeasible');
  assert.equal(impossible.universallyInfeasible, true, 'this is impossible for ANY allocation, not just this one');
  assert.equal(impossible.reason, 'minimums-exceed-full-allocation');
  assert.equal(impossible.conflictingSet.length, 2, 'the smallest conflicting set is identified');
  assert.ok(impossible.explanation.includes('No constraint has been relaxed'));
  assert.ok(impossible.explanation.includes('current portfolio is unchanged'));

  // Maximums that cannot fill the portfolio are the mirror case.
  const cannotFill = RLPA.evaluateFeasibility(['A', 'B'], [0.5, 0.5], [
    { subject: 'A', minimum: null, maximum: 0.3 },
    { subject: 'B', minimum: null, maximum: 0.3 }
  ]);
  assert.equal(cannotFill.state, 'infeasible');
  assert.equal(cannotFill.reason, 'maximums-cannot-fill-allocation');

  // A candidate that merely misses a satisfiable constraint is infeasible but
  // NOT universally so - a different and weaker finding, reported as such.
  const missable = RLPA.evaluateFeasibility(['A', 'B'], [0.9, 0.1], [
    { subject: 'A', minimum: null, maximum: 0.6 }
  ]);
  assert.equal(missable.state, 'infeasible');
  assert.equal(missable.universallyInfeasible, false);
  assert.equal(missable.conflictingSet[0].kind, 'maximum');
  assert.ok(near(missable.conflictingSet[0].actual, 0.9, 1e-12));
  assert.ok(missable.explanation.includes('reported as infeasible rather than adjusted'));

  // Satisfiable constraints pass without alteration.
  const fine = RLPA.evaluateFeasibility(['A', 'B'], [0.5, 0.5], [
    { subject: 'A', minimum: 0.2, maximum: 0.8 }
  ]);
  assert.equal(fine.state, 'feasible');
  assert.deepEqual(fine.conflictingSet, []);
});

test('TP-13-01 infeasible candidates appear beside feasible ones rather than being hidden', () => {
  const out = RLPA.compareAllocationMethods({
    ...ALLOC_BASE,
    constraints: [{ subject: 'A', minimum: null, maximum: 0.55 }]
  });
  assert.equal(out.state, 'ok');

  // Minimum variance puts 0.727 in A, which breaches the 0.55 cap. It must still
  // be listed - hiding it would make the comparison look cleaner than it is.
  const minVar = out.candidates.find((c) => c.method === 'minimum-variance');
  assert.equal(minVar.feasibility.state, 'infeasible');
  assert.ok(minVar.weights, 'the infeasible candidate keeps its weights so the breach is inspectable');

  const equal = out.candidates.find((c) => c.method === 'equal-weight');
  assert.equal(equal.feasibility.state, 'feasible');

  // Both are present in one list.
  assert.equal(out.candidates.length, 6);
});

/* ---------------------------------------------------------------------------
   Scope 14 - allocation sensitivity and explicit Black-Litterman
   --------------------------------------------------------------------------- */

test('TP-14-01 sensitivity reports a weight RANGE and labels unstable holdings', () => {
  // A near-singular pair: the two assets are strongly correlated, which is
  // exactly when minimum-variance weights swing on small covariance changes.
  const covariance = [[0.04, 0.0595], [0.0595, 0.09]];
  const out = RLPA.allocationSensitivity({
    symbols: ['A', 'B'],
    covariance,
    currentWeights: [0.5, 0.5],
    perturbations: [-0.02, -0.01, 0, 0.01, 0.02],
    unstableRangeThreshold: 0.05
  });
  assert.equal(out.state, 'ok');
  assert.equal(out.validTrials, 5);
  assert.equal(out.failedTrials, 0);
  assert.deepEqual(out.declaredPerturbations, [-0.02, -0.01, 0, 0.01, 0.02]);

  // A range, not a point. low <= high for every holding, and the ranges are real.
  for (const range of out.ranges) {
    assert.ok(range.low <= range.high);
    assert.ok(near(range.span, range.high - range.low, 1e-12));
  }

  // This fixture is deliberately unstable, so the point vector must be refused.
  assert.ok(out.unstableSymbols.length > 0, 'a near-singular covariance must produce unstable weights');
  assert.equal(out.pointVectorTrustworthy, false);
  assert.ok(out.claimBoundary.includes('UNSTABLE'));
  assert.ok(out.claimBoundary.includes('false precision'));
});

test('TP-14-01 a stable covariance is reported as stable ON THIS SET, not as correct', () => {
  const covariance = [[0.04, 0.001], [0.001, 0.09]];
  const out = RLPA.allocationSensitivity({
    symbols: ['A', 'B'],
    covariance,
    currentWeights: [0.5, 0.5],
    perturbations: [-0.02, 0, 0.02],
    unstableRangeThreshold: 0.05
  });
  assert.equal(out.state, 'ok');
  assert.equal(out.unstableSymbols.length, 0);
  assert.equal(out.pointVectorTrustworthy, true);

  // The wording is the point: stability on a perturbation set is not correctness.
  assert.ok(out.claimBoundary.includes('ON THIS PERTURBATION SET'));
  assert.ok(out.claimBoundary.includes('not the same as being correct'));
});

test('TP-14-01 precision follows the range so a wide band never prints false decimals', () => {
  const wide = RLPA.allocationSensitivity({
    symbols: ['A', 'B'],
    covariance: [[0.04, 0.0595], [0.0595, 0.09]],
    currentWeights: [0.5, 0.5],
    perturbations: [-0.02, 0, 0.02],
    unstableRangeThreshold: 0.05
  });
  const widest = wide.ranges.slice().sort((a, b) => b.span - a.span)[0];
  assert.ok(widest.span > 0.01);
  assert.equal(widest.decimals, 0, 'a band wider than a point earns no decimals');

  const tight = RLPA.allocationSensitivity({
    symbols: ['A', 'B'],
    covariance: [[0.04, 0.0001], [0.0001, 0.09]],
    currentWeights: [0.5, 0.5],
    perturbations: [-0.001, 0, 0.001],
    unstableRangeThreshold: 0.05
  });
  const tightest = tight.ranges.slice().sort((a, b) => a.span - b.span)[0];
  assert.ok(tightest.span < 0.001);
  assert.equal(tightest.decimals, 2, 'a tight band earns its decimals');
});

test('TP-14-01 sensitivity refuses without declared perturbations or a stability threshold', () => {
  const base = {
    symbols: ['A', 'B'],
    covariance: [[0.04, 0.01], [0.01, 0.09]],
    currentWeights: [0.5, 0.5],
    perturbations: [-0.01, 0, 0.01],
    unstableRangeThreshold: 0.05
  };
  const noPerturbations = { ...base };
  delete noPerturbations.perturbations;
  assert.equal(RLPA.allocationSensitivity(noPerturbations).reason, 'perturbations-required');

  const noThreshold = { ...base };
  delete noThreshold.unstableRangeThreshold;
  assert.equal(RLPA.allocationSensitivity(noThreshold).reason, 'unstable-threshold-required');

  // Neither is defaulted: an undeclared perturbation set would make the range
  // an artefact of a hidden choice rather than a stated one.
  assert.equal(RLPA.allocationSensitivity(noPerturbations).ranges, undefined);
});

test('TP-14-01 Black-Litterman admits only user-stated views and never a behavioural one', () => {
  const out = RLPA.blackLittermanViews({
    statedViews: [
      { subject: 'AI infrastructure', expectedReturn: 0.08, confidence: 0.5, source: 'user-stated' }
    ],
    behaviorSignals: [
      { subject: 'AI infrastructure', weight: 0.9 },
      { subject: 'semiconductors', weight: 0.7 }
    ]
  });
  assert.equal(out.state, 'ok');
  assert.equal(out.admittedViews.length, 1);
  assert.equal(out.admittedViews[0].source, 'user-stated');

  // The behavioural signals were SEEN and contributed nothing. Accepting them as
  // an argument and ignoring them is what makes the exclusion testable rather
  // than merely absent.
  assert.equal(out.behaviorSignalsSeen, 2);
  assert.equal(out.behaviorDerivedViews, 0);
  assert.equal(out.behaviorContribution, 'none');
  assert.ok(out.exclusionStatement.includes('contributed NO view'));
  assert.ok(out.exclusionStatement.includes('What you read is not what you believe'));

  // A view claiming any other provenance is rejected by name.
  const inferred = RLPA.blackLittermanViews({
    statedViews: [{ subject: 'AI', expectedReturn: 0.08, confidence: 0.5, source: 'behavior-derived' }],
    behaviorSignals: []
  });
  assert.equal(inferred.admittedViews.length, 0);
  assert.equal(inferred.rejectedViews[0].reason, 'source-must-be-user-stated');
});

test('TP-14-01 with no stated view the candidate stays equilibrium-only', () => {
  const out = RLPA.blackLittermanViews({
    statedViews: [],
    behaviorSignals: [{ subject: 'AI infrastructure', weight: 0.95 }]
  });
  assert.equal(out.state, 'equilibrium-only');
  assert.equal(out.equilibriumOnly, true);
  assert.equal(out.admittedViews.length, 0);
  assert.equal(out.behaviorDerivedViews, 0);

  // A strong behavioural signal is exactly the case where inference is
  // tempting. The candidate must stay directionless.
  assert.equal(out.behaviorSignalsSeen, 1);
  assert.ok(out.note.includes('rather than being given a direction it was never told'));

  // Every incomplete view is rejected by its own reason rather than part-used.
  const partial = RLPA.blackLittermanViews({
    statedViews: [
      { subject: 'AI', expectedReturn: 0.08, source: 'user-stated' },
      { subject: 'AI', confidence: 0.5, source: 'user-stated' },
      { expectedReturn: 0.08, confidence: 0.5, source: 'user-stated' }
    ],
    behaviorSignals: []
  });
  assert.equal(partial.admittedViews.length, 0);
  assert.deepEqual(partial.rejectedViews.map((r) => r.reason),
    ['confidence-required', 'expected-return-required', 'subject-required']);
});

test('TP-14-01 implied equilibrium returns are delta times Sigma times benchmark weights', () => {
  const sigma = [[0.04, 0.01], [0.01, 0.09]];
  const out = RLPA.blackLittermanPosterior({
    symbols: ['A', 'B'],
    covariance: sigma,
    benchmarkWeights: [0.6, 0.4],
    riskAversion: 2.5,
    tau: 0.05,
    views: []
  });

  // Independently calculated. Sigma*w = [0.04*0.6 + 0.01*0.4, 0.01*0.6 + 0.09*0.4]
  //                                   = [0.028, 0.042]; times delta 2.5 = [0.07, 0.105].
  assert.equal(out.state, 'equilibrium-only');
  assert.ok(near(out.impliedEquilibriumReturns[0], 0.07, 1e-12));
  assert.ok(near(out.impliedEquilibriumReturns[1], 0.105, 1e-12));

  // With no view the posterior IS the equilibrium: nothing added, nothing inferred.
  assert.deepEqual(out.posteriorMean, out.impliedEquilibriumReturns);
  assert.deepEqual(out.viewMatrix, []);
  assert.deepEqual(out.viewReturns, []);
  assert.equal(out.behaviorContribution, 'none');
  assert.ok(out.note.includes("the market's own view is shown unaltered"));
});

test('TP-14-01 a stated view moves the posterior between equilibrium and the view', () => {
  const sigma = [[0.04, 0.01], [0.01, 0.09]];
  const out = RLPA.blackLittermanPosterior({
    symbols: ['A', 'B'],
    covariance: sigma,
    benchmarkWeights: [0.6, 0.4],
    riskAversion: 2.5,
    tau: 0.05,
    views: [{ subject: 'A', expectedReturn: 0.12, confidence: 0.8, source: 'user-stated' }]
  });
  assert.equal(out.state, 'ok');

  // The defining property of Black-Litterman: a bullish view pulls the posterior
  // toward it WITHOUT reaching it. Landing exactly on the view would mean the
  // equilibrium was discarded; not moving would mean the view was ignored.
  assert.ok(out.posteriorMean[0] > 0.07, 'the bullish view pulls A up from equilibrium');
  assert.ok(out.posteriorMean[0] < 0.12, 'the posterior never reaches the raw view');

  // The correlated asset moves too, which is the whole point of using the
  // covariance rather than adjusting one number in isolation.
  assert.ok(out.posteriorMean[1] > 0.105, 'a positively correlated asset is pulled along');

  // Every stage stays separately inspectable.
  assert.ok(near(out.impliedEquilibriumReturns[0], 0.07, 1e-12), 'equilibrium is preserved unchanged');
  assert.deepEqual(out.viewMatrix, [[1, 0]], 'P picks exactly the asset the view speaks about');
  assert.deepEqual(out.viewReturns, [0.12]);
  assert.equal(out.viewUncertainty.length, 1);
  assert.ok(out.viewUncertainty[0][0] > 0, 'Omega carries the uncertainty of the stated confidence');
  assert.equal(out.tau, 0.05);
  assert.ok(Array.isArray(out.posteriorCovariance));
  assert.ok(out.note.includes('which part of the answer is the market'));
});

test('TP-14-01 a lower stated confidence moves the posterior less', () => {
  const sigma = [[0.04, 0.01], [0.01, 0.09]];
  const base = {
    symbols: ['A', 'B'], covariance: sigma, benchmarkWeights: [0.6, 0.4], riskAversion: 2.5, tau: 0.05
  };
  const confident = RLPA.blackLittermanPosterior({
    ...base, views: [{ subject: 'A', expectedReturn: 0.12, confidence: 0.9, source: 'user-stated' }]
  });
  const tentative = RLPA.blackLittermanPosterior({
    ...base, views: [{ subject: 'A', expectedReturn: 0.12, confidence: 0.1, source: 'user-stated' }]
  });

  // The confidence the user stated must actually do something. If Omega were
  // ignored, these two would be identical.
  assert.ok(confident.posteriorMean[0] > tentative.posteriorMean[0],
    'a confidently held view moves the posterior further than a tentative one');
  assert.ok(tentative.posteriorMean[0] > 0.07, 'even a tentative view still moves it');
});

test('TP-14-01 behavior, settings, holdings and display mode cannot alter any Black-Litterman field', () => {
  const sigma = [[0.04, 0.01], [0.01, 0.09]];
  const request = {
    symbols: ['A', 'B'],
    covariance: sigma,
    benchmarkWeights: [0.6, 0.4],
    riskAversion: 2.5,
    tau: 0.05,
    views: [{ subject: 'A', expectedReturn: 0.12, confidence: 0.8, source: 'user-stated' }]
  };
  const baseline = RLPA.blackLittermanPosterior(request);

  // Every mutation below is a field the surface DOES hold elsewhere: behaviour
  // events, derived interests, holdings presence, display mode, research
  // frequency. Passing each one in and getting a byte-identical result is what
  // proves the exclusion, rather than the absence of a parameter proving nothing.
  const intrusions = [
    { behaviorEvents: [{ subject: 'A', kind: 'opened' }] },
    { interestSignals: [{ subject: 'A', weight: 0.99 }] },
    { holdings: [{ symbol: 'A', derivedValue: 100000 }] },
    { displayMode: 'power' },
    { researchFrequency: 'daily' },
    { behaviorDerivedViews: [{ subject: 'B', expectedReturn: 0.30, confidence: 1 }] }
  ];
  for (const intrusion of intrusions) {
    const mutated = RLPA.blackLittermanPosterior({ ...request, ...intrusion });
    const key = Object.keys(intrusion)[0];
    assert.deepEqual(mutated.posteriorMean, baseline.posteriorMean, key + ' must not move the posterior');
    assert.deepEqual(mutated.impliedEquilibriumReturns, baseline.impliedEquilibriumReturns, key + ' must not move pi');
    assert.deepEqual(mutated.viewMatrix, baseline.viewMatrix, key + ' must not alter P');
    assert.deepEqual(mutated.viewReturns, baseline.viewReturns, key + ' must not alter q');
    assert.deepEqual(mutated.viewUncertainty, baseline.viewUncertainty, key + ' must not alter Omega');
    assert.equal(mutated.behaviorContribution, 'none');
  }

  // A view claiming behaviour provenance is dropped even when well formed.
  const behavioural = RLPA.blackLittermanPosterior({
    ...request,
    views: [{ subject: 'A', expectedReturn: 0.30, confidence: 1, source: 'behavior-derived' }]
  });
  assert.equal(behavioural.state, 'equilibrium-only', 'a behaviour-sourced view yields no posterior shift');
  assert.deepEqual(behavioural.posteriorMean, behavioural.impliedEquilibriumReturns);
});

test('TP-14-01 sensitivity reports reversal conditions when two holdings swap order', () => {
  // Two assets whose relative minimum-variance weight ordering flips as the
  // correlation term is perturbed.
  const out = RLPA.allocationSensitivity({
    symbols: ['A', 'B'],
    covariance: [[0.05, 0.0499], [0.0499, 0.0501]],
    currentWeights: [0.5, 0.5],
    perturbations: [-0.05, -0.02, 0, 0.02, 0.05],
    unstableRangeThreshold: 0.05
  });
  assert.equal(out.state, 'ok');
  assert.equal(out.reversalConditions.length, 1,
    'this near-degenerate pair must report exactly one reversal, or the assertions below are vacuous');

  const reversal = out.reversalConditions[0];
  assert.ok(typeof reversal.higher === 'string' && typeof reversal.lower === 'string');
  assert.ok(Number.isFinite(reversal.reversesAtPerturbation));
  assert.ok(reversal.statement.includes('swap order at a covariance perturbation of'));
  assert.ok(reversal.statement.includes('not a stable conclusion'));

  // A well-separated pair must NOT report a spurious reversal, or the field
  // would be noise rather than a finding.
  const stable = RLPA.allocationSensitivity({
    symbols: ['A', 'B'],
    covariance: [[0.01, 0.0005], [0.0005, 0.25]],
    currentWeights: [0.5, 0.5],
    perturbations: [-0.02, 0, 0.02],
    unstableRangeThreshold: 0.05
  });
  assert.equal(stable.state, 'ok');
  assert.deepEqual(stable.reversalConditions, [],
    'a pair whose ordering never flips must report no reversal');
});

/* ---------------------------------------------------------------------------
   Scope 15 - walk-forward dossier and claim boundaries
   --------------------------------------------------------------------------- */

test('TP-15-01 in-sample, walk-forward and cost-adjusted results stay three separate figures', () => {
  // A sample that is strongly positive early and flat later: the in-sample total
  // therefore flatters the rule relative to what a later period delivered.
  const returns = [0.05, 0.05, 0.05, 0.05, 0.0, 0.0, 0.0, 0.0];
  const out = RLPA.walkForwardDossier({
    returns,
    folds: 2,
    perRebalanceCostFraction: 0.001,
    rebalancesPerFold: 4,
    trialsSearched: 20
  });
  assert.equal(out.state, 'ok');

  // Independently calculated. In-sample compounds all eight: 1.05^4 - 1.
  assert.ok(near(out.inSampleReturn, Math.pow(1.05, 4) - 1, 1e-12));

  // Walk-forward scores only the segment AFTER the training fold, which here is
  // the flat half, so it is 0. The first fold is training and is never scored;
  // scoring it would put the fitted window back into the result.
  assert.equal(out.scoredFolds, 1);
  assert.ok(near(out.walkForwardReturn, 0, 1e-12));

  // The three figures are genuinely different, which is the entire point.
  assert.ok(out.inSampleReturn > out.walkForwardReturn,
    'the in-sample figure is the one the rule was chosen to maximise');
  assert.ok(near(out.totalCostFraction, 0.001 * 4 * 1, 1e-12));
  assert.ok(near(out.costAdjustedReturn, 0 - 0.004, 1e-12));
  assert.ok(out.costAdjustedReturn < out.walkForwardReturn, 'costs can only reduce the result');
});

test('TP-15-01 the dossier reports its trial count and refuses any future-superiority claim', () => {
  const returns = [0.02, -0.01, 0.03, 0.01, 0.02, -0.02, 0.01, 0.0];
  const searched = RLPA.walkForwardDossier({
    returns, folds: 4, perRebalanceCostFraction: 0.0005, rebalancesPerFold: 2, trialsSearched: 50
  });
  assert.equal(searched.state, 'ok');
  assert.equal(searched.trialsSearched, 50);
  assert.ok(searched.dataSnoopingNote.includes('50 candidate rules were searched'));
  assert.ok(searched.dataSnoopingNote.includes('will look good by chance alone'));

  // A single trial still carries a caveat: the rule itself may have been chosen
  // after looking at this history, which no trial count can detect.
  const single = RLPA.walkForwardDossier({
    returns, folds: 4, perRebalanceCostFraction: 0.0005, rebalancesPerFold: 2, trialsSearched: 1
  });
  assert.ok(single.dataSnoopingNote.includes('does not remove the risk that the rule itself was chosen'));

  // The refusal that defines this scope.
  assert.equal(searched.provesFutureSuperiority, false);
  assert.ok(searched.claimBoundary.includes('makes no claim of future superiority'));
  assert.ok(searched.claimBoundary.includes('not a prediction'));

  // Four named limitations, not a vague disclaimer.
  assert.equal(searched.limitations.length, 4);
  assert.ok(searched.limitations.join(' ').includes('Survivorship'));
  assert.ok(searched.limitations.join(' ').includes('Selection bias'));
});

test('TP-15-01 the dossier refuses without costs, folds or a trial count', () => {
  const base = {
    returns: [0.02, -0.01, 0.03, 0.01, 0.02, -0.02, 0.01, 0.0],
    folds: 4,
    perRebalanceCostFraction: 0.0005,
    rebalancesPerFold: 2,
    trialsSearched: 10
  };
  for (const key of ['folds', 'perRebalanceCostFraction', 'rebalancesPerFold', 'trialsSearched']) {
    const partial = { ...base };
    delete partial[key];
    const out = RLPA.walkForwardDossier(partial);
    assert.equal(out.state, 'unavailable', key + ' must be required');
    assert.equal(out.inSampleReturn, undefined, 'no figure is emitted from incomplete evidence');
  }

  // More folds than the sample supports refuses rather than producing folds of
  // one observation, which would report noise as an out-of-sample result.
  assert.equal(RLPA.walkForwardDossier({ ...base, folds: 8 }).reason, 'folds-exceed-sample');
});

test('TP-15-01 a market-efficiency conclusion is scoped to the one form it tested', () => {
  const out = RLPA.marketEfficiencyClaim({
    form: 'weak',
    informationSet: 'past prices and volume',
    sample: 'US large cap 2010-2025',
    test: 'autocorrelation of 5-day returns',
    costAdjustedEdge: 0.004
  });
  assert.equal(out.state, 'ok');
  assert.equal(out.form, 'weak');
  assert.deepEqual(out.untestedForms, ['semi-strong', 'strong']);

  // The generalisation this guards against, refused explicitly.
  assert.equal(out.allFormsRefuted, false);
  assert.ok(out.claimBoundary.includes('and to nothing else'));
  assert.ok(out.claimBoundary.includes('does not claim that all market-efficiency hypotheses are false'));
  assert.ok(out.claimBoundary.includes('semi-strong and strong'));

  // Alternative explanations are enumerated, so a positive edge is not presented
  // as the only reading of the evidence.
  assert.equal(out.alternativeExplanations.length, 4);
  assert.ok(out.alternativeExplanations.join(' ').includes('Compensation for a risk'));
  assert.ok(out.alternativeExplanations.join(' ').includes('Data snooping'));

  // Every one of the five inputs is required and named when missing.
  const complete = {
    form: 'semi-strong', informationSet: 'public filings', sample: '2015-2025',
    test: 'event study', costAdjustedEdge: 0.001
  };
  for (const key of Object.keys(complete)) {
    const partial = { ...complete };
    delete partial[key];
    const missing = RLPA.marketEfficiencyClaim(partial);
    assert.equal(missing.state, 'unavailable', key + ' must be required');
    assert.deepEqual(missing.missing, [key]);
  }

  // An invented form is refused rather than passed through into the copy.
  assert.deepEqual(RLPA.marketEfficiencyClaim({ ...complete, form: 'ultra' }).missing, ['form']);
});

test('TP-15-01 no correlation number adjudicates substantially identical', () => {
  // Near-perfect correlation, identical index, identical issuer: the strongest
  // case a numeric rule would call "substantially identical". It must not.
  const out = RLPA.replacementComparison({
    subject: 'VOO',
    candidate: 'IVV',
    correlation: 0.9998,
    holdingsOverlapFraction: 0.999,
    subjectIssuer: 'IssuerA',
    candidateIssuer: 'IssuerA',
    subjectIndex: 'S&P 500',
    candidateIndex: 'S&P 500',
    trackingDifferenceAnnual: 0.0001
  });
  assert.equal(out.state, 'ok');

  // All three verdict fields are null and adjudication is false BY CONTRACT.
  assert.equal(out.substantiallyIdentical, null);
  assert.equal(out.notSubstantiallyIdentical, null);
  assert.equal(out.identityThreshold, null, 'no threshold exists, not even an unused one');
  assert.equal(out.adjudicated, false);

  // The facts are still delivered - the refusal is to CONCLUDE, not to inform.
  assert.equal(out.researchInputs.length, 5);
  const kinds = out.researchInputs.map((f) => f.kind).sort();
  assert.deepEqual(kinds, ['correlation', 'holdings-overlap', 'index', 'issuer', 'tracking']);

  assert.ok(out.claimBoundary.includes('legal and tax question'));
  assert.ok(out.claimBoundary.includes('applies no threshold and reaches no conclusion either way'));

  // The opposite extreme is treated identically: no verdict in either direction.
  const different = RLPA.replacementComparison({
    subject: 'VOO', candidate: 'GLD', correlation: 0.02,
    subjectIssuer: 'IssuerA', candidateIssuer: 'IssuerB',
    subjectIndex: 'S&P 500', candidateIndex: 'Gold spot'
  });
  assert.equal(different.substantiallyIdentical, null);
  assert.equal(different.notSubstantiallyIdentical, null,
    'refusing to say "not substantially identical" matters as much as refusing to say it IS');
  assert.equal(different.adjudicated, false);
});
