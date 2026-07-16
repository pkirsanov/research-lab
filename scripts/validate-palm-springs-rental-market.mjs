import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "palm-springs-rental-market-lab.html");
const productionConfigPath = path.join(root, "palm-springs-rental-market.config.json");
const productionPayloadPath = path.join(root, "palm-springs-rental-market.payload.json");
const fixtureRoot = path.join(root, "tests/fixtures/palm-springs-rental-market");
const fixtureConfigPath = path.join(fixtureRoot, "config.json");
const fixturePayloadPath = path.join(fixtureRoot, "current.payload.json");
const invalidPayloadPath = path.join(fixtureRoot, "invalid.payload.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing production function ${name}`);
  const brace = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = brace; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if (char === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`unterminated production function ${name}`);
}

const html = fs.readFileSync(htmlPath, "utf8");
const functionNames = [
  "psrmError",
  "psrmIsObject",
  "psrmIsFiniteNumber",
  "psrmHasExactKeys",
  "psrmUniqueStrings",
  "psrmInBounds",
  "psrmStableSerialize",
  "validateResearchConfig",
  "indexResearchConfig",
  "validateResearchPayload",
  "validateChangeAccounting",
  "buildResearchGraph",
  "classifyTruthState",
  "normalizeUserAssumptions",
  "computeAdjustedOccupancy",
  "computeMonthlyPayment",
  "computeRentalModel",
  "buildPalmSpringsViewModel",
  "stableModelDigest",
  "buildPalmSpringsToolRead",
  "psrmParseQuery",
  "resolveContractPaths"
];
const extracted = functionNames.map((name) => extractFunction(html, name));
const production = new Function(`${extracted.join("\n")}\nreturn {${functionNames.join(",")}};`)();

const args = process.argv.slice(2);
assert.ok(args.length === 0 || args.length === 2, "usage: node scripts/validate-palm-springs-rental-market.mjs [payload.json config.json]");
let payloadPath;
let configPath;
let inputMode;
if (args.length === 2) {
  payloadPath = path.resolve(root, args[0]);
  configPath = path.resolve(root, args[1]);
  inputMode = "explicit";
} else if (fs.existsSync(productionPayloadPath)) {
  payloadPath = productionPayloadPath;
  configPath = productionConfigPath;
  inputMode = "production";
} else {
  payloadPath = fixturePayloadPath;
  configPath = fixtureConfigPath;
  inputMode = "scope1-fixture-explicitly-labeled";
}

const productionConfig = readJson(productionConfigPath);
const productionConfigValidation = production.validateResearchConfig(productionConfig);
assert.equal(productionConfigValidation.ok, true, JSON.stringify(productionConfigValidation.errors));

const config = readJson(configPath);
const configValidation = production.validateResearchConfig(config);
assert.equal(configValidation.ok, true, JSON.stringify(configValidation.errors));
const configIndex = production.indexResearchConfig(config);
const payload = readJson(payloadPath);
const payloadValidation = production.validateResearchPayload(payload, configIndex);
assert.equal(payloadValidation.ok, true, JSON.stringify(payloadValidation.errors));

const invalidPayload = readJson(invalidPayloadPath);
const invalidValidation = production.validateResearchPayload(invalidPayload, configIndex);
assert.equal(invalidValidation.ok, false, "invalid fixture must be rejected");
const invalidCodes = new Set(invalidValidation.errors.map((error) => error.code));
assert.equal(invalidCodes.has("PSRM-PAYLOAD-REF"), true, "invalid fixture must expose PSRM-PAYLOAD-REF");
assert.equal(invalidCodes.has("PSRM-PAYLOAD-CATEGORY"), true, "invalid fixture must expose PSRM-PAYLOAD-CATEGORY");

const occupancy = production.computeAdjustedOccupancy(0.40, 0.10, 0.25);
assert.equal(occupancy.ok, true);
assert.ok(Math.abs(occupancy.value - (0.40 * 1.10 / 1.25)) < 1e-12);
const invalidOccupancy = production.computeAdjustedOccupancy(0.40, 0.10, -1);
assert.equal(invalidOccupancy.ok, false);
assert.equal(invalidOccupancy.errors[0].code, "PSRM-MODEL-OCCUPANCY-DENOMINATOR");
assert.equal(Object.hasOwn(invalidOccupancy, "value"), false);

const scenario = payload.scenarios.find((entry) => entry.id === payload.initialSelection.scenarioId);
const assumptions = {
  demandDelta: payload.initialSelection.demandDelta,
  supplyDelta: payload.initialSelection.supplyDelta,
  adrShock: payload.initialSelection.adrShock,
  purchasePriceUsd: payload.acquisitionBaseline.purchasePriceUsd,
  leverageRatio: payload.acquisitionBaseline.leverageRatio,
  downPaymentRatio: payload.acquisitionBaseline.downPaymentRatio,
  annualMortgageRate: payload.acquisitionBaseline.annualMortgageRate,
  loanTermYears: payload.acquisitionBaseline.loanTermYears,
  operatingExpenseRatio: payload.acquisitionBaseline.operatingExpenseRatio
};
const amortizing = production.computeRentalModel(config, scenario, assumptions);
assert.equal(amortizing.ok, true, JSON.stringify(amortizing.errors));
assert.equal(amortizing.result.paymentBranch, "amortizing");
assert.ok(Object.values(amortizing.result).filter((value) => typeof value === "number").every(Number.isFinite));
const zeroRate = production.computeRentalModel(config, scenario, { ...assumptions, annualMortgageRate: 0 });
assert.equal(zeroRate.ok, true, JSON.stringify(zeroRate.errors));
assert.equal(zeroRate.result.paymentBranch, "zero-rate");
assert.equal(zeroRate.result.monthlyPaymentUsd, zeroRate.result.loanPrincipalUsd / (assumptions.loanTermYears * 12));

const unavailableView = production.buildPalmSpringsViewModel({ fixture: false, truth: { state: "unavailable" }, model: { ok: false, errors: [] } });
const unavailableRead = production.buildPalmSpringsToolRead(unavailableView, "2026-07-14T12:00:00.000Z");
assert.equal(Object.hasOwn(unavailableRead.metrics, "grossRevenueUsd"), false);
assert.equal(unavailableRead.metrics.availability, "unavailable");
const fixturePaths = production.resolveContractPaths("?fixture=current&clock=2026-07-14T12%3A00%3A00.000Z");
assert.equal(fixturePaths.ok, true);
assert.equal(fixturePaths.fixture, true);
assert.match(html, /TEST FIXTURE/);
assert.doesNotMatch(html, /page\.route|context\.route|fulfill\(/);

console.log("[psrm-validator] production functions extracted=" + functionNames.length);
console.log("[psrm-validator] input-mode=" + inputMode);
console.log("[psrm-validator] config=" + path.relative(root, configPath));
console.log("[psrm-validator] payload=" + path.relative(root, payloadPath));
console.log("[psrm-validator] production-config=PASS");
console.log("[psrm-validator] selected-config=PASS");
console.log("[psrm-validator] selected-payload=PASS");
console.log("[psrm-validator] invalid-payload=REJECTED");
console.log("[psrm-validator] invalid-codes=" + [...invalidCodes].sort().join(","));
console.log("[psrm-validator] occupancy-equation=PASS value=" + occupancy.value);
console.log("[psrm-validator] occupancy-denominator=REJECTED code=" + invalidOccupancy.errors[0].code);
console.log("[psrm-validator] amortization=PASS monthly=" + amortizing.result.monthlyPaymentUsd);
console.log("[psrm-validator] zero-rate=PASS monthly=" + zeroRate.result.monthlyPaymentUsd);
console.log("[psrm-validator] owner-read-omission=PASS");
console.log("[psrm-validator] fixture-path-contract=PASS");
console.log("[psrm-validator] OK");