/* Feature 008 Scope 21 — mixed-input Risk X-Ray functional contract. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RLPA = require("../rlportfolioanalytics.js");
const near = (actual, expected, tolerance = 1e-9) => Math.abs(actual - expected) <= tolerance;

function mixedPortfolio() {
  const dates = ["2025-01-02", "2025-04-02", "2025-07-02", "2025-10-02", "2026-01-02"];
  const series = (closes) => dates.map((date, index) => ({ date, close: closes[index] }));
  return {
    holdings: [
      { holdingId: "listed-weight", symbol: "AAA", assetType: "listed", inputClass: "listed-explicit-weight", weight: 0.4, issuer: "Issuer A", sector: "Technology", factor: "growth", lookThrough: { "Issuer A": 1 } },
      { holdingId: "listed-value", symbol: "BBB", assetType: "listed", inputClass: "listed-quantity-value", weight: 0.2, derivedValue: 200, issuer: "Issuer B", sector: "Industrials", factor: "quality", lookThrough: { "Issuer B": 1 } },
      { holdingId: "cash", symbol: "CASH", assetType: "cash", inputClass: "cash", weight: 0.1, derivedValue: 100, cashTreatment: { kind: "public-proxy", sourceSymbol: "BIL", frequency: "daily", evidenceIds: ["cash-policy/v1"] }, issuer: "Cash reserve", sector: "Cash", factor: "cash" },
      { holdingId: "manual-dated", symbol: "ALT", assetType: "manual-alternative", inputClass: "manual-dated-series", weight: 0.1, derivedValue: 100, manualSeries: { frequency: "quarterly", evidenceIds: ["manual-alt/v1"], rows: series([100, 101, 100, 103, 104]) }, issuer: "Private issuer", sector: "Alternatives", factor: "illiquidity" },
      { holdingId: "manual-no-series", symbol: "ART", assetType: "manual-alternative", inputClass: "manual-no-series", weight: 0.1, derivedValue: 100, scenarioRanges: [{ low: -0.25, high: 0.1, horizon: "one-year" }] },
      { holdingId: "unsupported", symbol: "UNKNOWN", assetType: "unresolved", inputClass: "unresolved-unsupported", weight: 0.1, derivedValue: 100 }
    ],
    series: {
      AAA: series([100, 105, 102, 108, 110]),
      BBB: series([50, 50, 51, 51, 52]),
      CASH: series([100, 100.2, 100.1, 100.35, 100.5])
    },
    cutoff: dates.at(-1),
    periodsPerYear: 4,
    concentrationLenses: ["issuer", "sector", "factor", "lookThrough"],
    benchmarkReturns: [0.02, -0.01, 0.03, 0.01],
    benchmarkSymbol: "SPY",
    factorReturns: {
      market: [0.018, -0.012, 0.025, 0.009],
      quality: [-0.004, 0.006, 0.003, -0.002]
    },
    factorSourceSymbols: { market: ["SPY"], quality: ["QUAL", "SPY"] },
    proxyFactorsVersion: "proxy-factors/v1",
    shrinkageLambda: 0.25,
    reconciliationTolerance: 1e-8
  };
}

test("BUG-009 risk mapping: unsupported holdings remain named exclusions", () => {
  const treatment = RLPA.assetTreatment([
    {
      holdingId: "listed",
      symbol: "AAA",
      assetType: "listed",
      weight: 0.6,
      lookThrough: { "Issuer A": 1 }
    },
    {
      holdingId: "unsupported",
      symbol: "UNKNOWN",
      assetType: "unresolved",
      weight: 0.4
    }
  ]);

  assert.equal(treatment.state, "ok");
  assert.deepEqual(treatment.marketBased, ["AAA"]);
  assert.deepEqual(treatment.excludedFromMarketAnalytics, [
    { symbol: "UNKNOWN", assetType: "unresolved" }
  ]);
  assert.equal(treatment.lookThrough.state, "partial");
  assert.deepEqual(treatment.lookThrough.coveredIds, ["listed"]);
  assert.deepEqual(treatment.lookThrough.missingIds, ["unsupported"]);
  assert.equal(treatment.lookThrough.coveredWeight, 0.6);
  assert.equal(treatment.lookThrough.uncoveredWeight, 0.4);
});

test("SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output", () => {
  const input = mixedPortfolio();
  const projection = RLPA.riskXRayProjection(input);

  assert.equal(projection.contractVersion, "RiskDiagnosticSet/v1");
  assert.equal(projection.state, "partial");
  assert.equal(projection.cutoff, input.cutoff);
  assert.equal(projection.available, true);
  assert.deepEqual(projection.metricResults.returns.includedIds, ["cash", "listed-value", "listed-weight"]);
  assert.deepEqual(projection.metricResults.returns.excludedIds, ["manual-dated", "manual-no-series", "unsupported"]);
  assert.ok(near(projection.metricResults.returns.coveredWeight, 0.7));
  assert.ok(near(projection.metricResults.returns.uncoveredWeight, 0.3));

  // First period: AAA +5% at its original 40% weight, BBB flat at 20%, and the explicit cash
  // proxy +0.2% at 10%. The result is +2.02%, not the +2.8857...% produced by silently
  // reweighting the covered 70% sleeve.
  const expectedFirstReturn = 0.4 * 0.05 + 0.2 * 0 + 0.1 * 0.002;
  assert.ok(near(projection.alignedReturns[0], expectedFirstReturn, 1e-12));
  assert.ok(!near(projection.alignedReturns[0], expectedFirstReturn / 0.7, 1e-12));

  const elapsedDays = 365;
  assert.equal(projection.metrics.elapsedDays, elapsedDays);
  const endingWealth = projection.alignedReturns.reduce((wealth, value) => wealth * (1 + value), 1);
  const expectedCagr = Math.pow(endingWealth, 1 / (elapsedDays / 365.2425)) - 1;
  assert.ok(near(projection.metrics.compoundedCagr, expectedCagr, 1e-12));

  assert.equal(projection.covariance.rawDiagnostics.observationCount, 4);
  assert.equal(projection.covariance.rawDiagnostics.firstDate, "2025-01-02");
  assert.equal(projection.covariance.rawDiagnostics.lastDate, "2026-01-02");
  assert.equal(projection.covariance.conditioning.lambda, 0.25);
  assert.equal(projection.covariance.conditioning.lambdaWasAutoRaised, false);
  assert.equal(projection.contributions.reconciled, true);
  assert.equal(projection.factorContributions.reconciled, true);
  assert.equal(projection.returnContributions.model, "realized-return");
  assert.notEqual(projection.contributions.model, projection.factorContributions.model);

  const monthly = projection.eligibility.find((entry) => entry.holdingId === "manual-dated" && entry.metricFamily === "return-cagr-drawdown");
  assert.equal(monthly.state, "eligible-compatible-frequency");
  assert.equal(monthly.frequency, "quarterly");
  assert.deepEqual(monthly.evidenceIds, ["manual-alt/v1"]);
  assert.equal(projection.compatibleFrequencyResults.length, 1);
  const compatible = projection.compatibleFrequencyResults[0];
  assert.equal(compatible.contractVersion, "CompatibleFrequencyRiskResult/v1");
  assert.equal(compatible.holdingId, "manual-dated");
  assert.equal(compatible.frequency, "quarterly");
  assert.ok(near(compatible.holdingWeight, 0.1));
  assert.equal(compatible.metrics.elapsedDays, 365);
  assert.equal(compatible.metrics.periodsPerYear, 4);
  assert.equal(compatible.drawdown.state, "ok");
  assert.deepEqual(compatible.metricResult.includedIds, ["manual-dated"]);
  assert.ok(near(compatible.metricResult.coveredWeight, 0.1));
  assert.equal(projection.assetTreatment.lookThrough.state, "partial");
  assert.deepEqual(projection.assetTreatment.lookThrough.missingIds.sort(), ["cash", "manual-dated", "manual-no-series", "unsupported"]);
});

test("SCN-008-047 failed candidate preserves the last valid structured result", () => {
  const valid = RLPA.riskXRayProjection(mixedPortfolio());
  assert.equal(valid.available, true);

  const preserved = RLPA.riskXRayProjection({ holdings: [], series: {}, cutoff: "2026-01-03", lastValid: valid });
  assert.equal(preserved.available, true);
  assert.equal(preserved.state, "preserved-last-valid");
  assert.equal(preserved.candidateFailure.state, "no-holdings");
  assert.equal(preserved.identity, valid.identity);
  assert.deepEqual(preserved.metricResults, valid.metricResults);
  assert.equal(preserved.lastValidState, valid.state);
});