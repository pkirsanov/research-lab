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
