/*
 * TP-07-03 … TP-07-09 — persistent per-tool system-Chrome Simple regressions for the seven
 * strategy / property / method owner tools (Feature 012 Scope 07).
 *
 * SCN-012-002 (TP-07-03, strategy self-improvement): open the REAL tool page, drive the REAL seeded
 * strategy-evolution adapter through the REAL runtime, and prove visible seeded reproducibility —
 * the same seed run twice yields an identical run identity + owner summary + reproducible path; a
 * parameter change under the SAME seed is a common-random sensitivity (the owner output moves while
 * the seeded path stays byte-stable); a NEW seed is a labeled path change (a distinct run identity +
 * a distinct reproducible path), NOT a sensitivity.
 *
 * SCN-012-036 (TP-07-04 … TP-07-09, each remaining owner tool + the in-Brief Center triage): open
 * the REAL tool page, change TWO meaningful controls, and prove the OWNER-produced Simple output
 * path CHANGES with a user-visible DOM/text difference — with the tool's evidence truth preserved
 * (waterfront unverified-club/estimated-hazard evidence stays visible; the two rental scenarios keep
 * their undisclosed-economics gap unfilled; the Center triage stays a bounded action / no-action
 * result INSIDE the Brief with NO top-level Simple tab).
 *
 * REAL-STACK, ZERO INTERCEPTION. Each test navigates to the real tool page (every Scope-07 owner
 * page loads rlapp.js, which brings up the REAL production core globalThis.RLEXPERIENCE), injects the
 * REAL production adapter module (rlexperience-adapters/strategy-research.js exposing RLSTRATEGY,
 * property-research.js exposing RLPROPERTY, or market-action.js exposing RLMARKETACTION — the same
 * UMD files the owning pages load), injects the REAL shared owner rental engine rlrental.js
 * (RLRENTAL) for the two place-based scenarios, registers the REAL adapter into a REAL production
 * runtime (globalThis.RLEXPERIENCE.createSimpleRuntime), prepares on a frozen owner snapshot,
 * recomputes with the changed controls, and renders the REAL projection into the REAL
 * [data-rlexperience-panel="simple"] host through the production renderSimpleProjection. There is NO
 * page.route / context.route / intercept / routeFromHAR / msw / nock / fulfill anywhere — the owner
 * data is a deterministic frozen owner fixture (the same owner shape the owning page produces and the
 * TP-07-02 integration loop drives), never an intercepted network response. Owner-parity is proven
 * exhaustively by TP-07-01 / TP-07-02; this surface proves the real page renders the real adapter's
 * distinct, parameter-sensitive Simple read.
 *
 * Shell posture: the seven owner pages are shell-opt-out for the shared four-view Simple UI (like the
 * Scope-06 msft page) — the Market Action Center (market-brief.html) is a market-action-center
 * specialization with NO top-level Simple/Power view, and the six ordinary owner pages do not surface
 * the shared Simple panel. Each test therefore drives the REAL adapter through the REAL page's
 * already-loaded production core, mounting the [data-rlexperience-panel="simple"] host the shell
 * omits so the REAL adapter renders into the REAL page's DOM. The two shell-specific asserts from the
 * shared-shell pattern (a deployed placeholder + a Power-panel text comparison) are intentionally
 * skipped; the REAL adapter + REAL render + REAL DOM + REAL owner-parity are exercised in full.
 *
 * Owner fixtures + owner-relative control values are built NODE-SIDE from the REAL production
 * definitions (byte-faithful to the TP-07-01 unit fixtures; no formula is copied); only plain owner
 * DATA + changed control values cross into the browser, where the REAL production adapters perform
 * the compute and the REAL renderer paints it.
 */
import { createRequire } from 'node:module';
import { expect, test } from './playwright-runtime.mjs';
import { readJson, startStaticServer } from './tool-experience.support.mjs';

const require = createRequire(import.meta.url);
// strategy-research is required node-side ONLY to build the walk-forward fixture's real seeded closes
// from the single-source genSeries (a test-side seeded generation; the ADAPTER consumes frozen closes).
const strategy = require('../rlexperience-adapters/strategy-research.js');

const config = readJson('tool-experience.config.json');
const definitions = readJson('simple-models.json').definitions;

function defFor(toolId) {
  const definition = definitions.find((candidate) => candidate.toolId === toolId);
  if (!definition) throw new Error(`missing simple-models.json definition for ${toolId}`);
  return definition;
}
function defaults(definition) {
  return Object.fromEntries(definition.parameterDefinitions.map((parameter) => [parameter.parameterId, parameter.defaultValue]));
}
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/* ═══════════════════════ owner fixtures (byte-faithful to the TP-07-01 unit fixtures) ═══════════════════════ */

/* strategy-evolution (owner seam = strategy-self-improvement-lab.html) — a multi-regime boom-bust-recovery
   path so the seeded search finds real differences; the page's real levers, goal thresholds, and walk-forward. */
function strategyOwnerFixture() {
  return {
    contractVersion: 'strategy-evolution-owner-state/v1',
    toolId: 'strategy-self-improvement-lab',
    asOf: '2026-07-26T20:00:00.000Z',
    source: 'test-owner synthetic seeded scenario',
    scenario: { id: 'boom-bust-recovery', label: 'Boom -> bust -> recovery' },
    years: 8,
    regimes: [
      { frac: 0.4, muAnnual: 0.17, sigAnnual: 0.14 },
      { frac: 0.2, muAnnual: -0.38, sigAnnual: 0.42 },
      { frac: 0.4, muAnnual: 0.13, sigAnnual: 0.18 }
    ],
    startLevers: { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 },
    leverRanges: {
      fast: { min: 5, max: 60, step: 5 },
      slow: { min: 50, max: 250, step: 10 },
      momLookback: { min: 20, max: 250, step: 10 },
      volTarget: { min: 0.05, max: 0.35, step: 0.025 },
      stopDd: { min: 0.05, max: 0.40, step: 0.025 },
      maxLeverage: { min: 0.5, max: 3.0, step: 0.25 }
    },
    goal: { targetCagr: 0.12, sharpeFloor: 1.0, maxDdCeiling: 0.20, minTimeInMarket: 0.25 },
    walkForward: { folds: 5, trainRatio: 0.6, acceptMargin: 0.05, oosGapTolerance: 0.8 }
  };
}

/* walk-forward-validation (owner seam = strategy-validation-lab.html) — real seeded closes generated
   NODE-SIDE via the single-source module genSeries; the adapter is non-seeded and consumes the frozen
   closes. Registry universe holds 2 of 3 (heldFraction 2/3); watchlist holds 1 of 3 (a DIFFERENT set). */
function walkForwardValidationOwnerFixture() {
  const closesFor = (seed, regimes) => Array.from(strategy.genSeries(seed, 5, regimes).px);
  const up = [{ frac: 1, muAnnual: 0.22, sigAnnual: 0.10 }];
  const whip = [{ frac: 1, muAnnual: -0.20, sigAnnual: 0.35 }];
  const down = [{ frac: 1, muAnnual: -0.18, sigAnnual: 0.30 }];
  const flat = [{ frac: 1, muAnnual: 0.0, sigAnnual: 0.42 }];
  return {
    contractVersion: 'walk-forward-validation-owner-state/v1',
    toolId: 'strategy-validation-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic multi-instrument universe',
    sourceClass: 'model-estimate',
    trainRatio: 0.6,
    startLevers: { fast: 20, slow: 100, momLookback: 120, volTarget: 0.15, stopDd: 0.15, maxLeverage: 1.5 },
    goal: { targetCagr: -1, sharpeFloor: 0.5, maxDdCeiling: 0.99, minTimeInMarket: 0.0 },
    universes: {
      registry: [
        { symbol: 'REG-STRONG', closes: closesFor(111, up), sourceClass: 'model-estimate' },
        { symbol: 'REG-STEADY', closes: closesFor(444, up), sourceClass: 'model-estimate' },
        { symbol: 'REG-WHIP', closes: closesFor(606, whip), sourceClass: 'model-estimate' }
      ],
      'current-watchlist': [
        { symbol: 'WL-EDGE', closes: closesFor(808, flat), sourceClass: 'model-estimate' },
        { symbol: 'WL-CLEAN', closes: closesFor(555, up), sourceClass: 'model-estimate' },
        { symbol: 'WL-DOWN', closes: closesFor(303, down), sourceClass: 'model-estimate' }
      ]
    }
  };
}

/* disclosure-decay (owner seam = smart-money-flow-lab.html) — five clusters chosen so every declared
   parameter moves its declared owner path with genuine computed content. Reference "today" 2026-07-05. */
function disclosureOwnerFixture() {
  return {
    contractVersion: 'disclosure-decay-owner-state/v1',
    toolId: 'smart-money-flow-lab',
    asOf: '2026-07-05',
    today: '2026-07-05',
    source: 'test-owner illustrative filing set',
    sourceClass: 'model-estimate',
    disclosures: [
      { ticker: 'AAA', filer: 'Dir A1 (Form 4)', type: 'insider', side: 'buy', usd: 2100000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'Off A2 (Form 4)', type: 'insider', side: 'buy', usd: 950000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'AAA', filer: 'Off A3 (Form 4)', type: 'insider', side: 'buy', usd: 640000, txn: '2026-06-29', disclosed: '2026-07-01' },
      { ticker: 'BBB', filer: 'Sen B1 (STOCK Act)', type: 'congress', side: 'buy', usd: 250000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'Rep B2 (STOCK Act)', type: 'congress', side: 'buy', usd: 120000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'BBB', filer: 'Rep B3 (STOCK Act)', type: 'congress', side: 'buy', usd: 90000, txn: '2026-04-30', disclosed: '2026-06-29' },
      { ticker: 'CCC', filer: 'Off C1 (Form 4)', type: 'insider', side: 'sell', usd: 5200000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'CCC', filer: 'Off C2 (Form 4)', type: 'insider', side: 'sell', usd: 1800000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'CCC', filer: 'Dir C3 (Form 4)', type: 'insider', side: 'sell', usd: 900000, txn: '2026-06-28', disclosed: '2026-07-01' },
      { ticker: 'DDD', filer: 'Rep D1 (STOCK Act)', type: 'congress', side: 'buy', usd: 175000, txn: '2026-05-20', disclosed: '2026-06-29' },
      { ticker: 'DDD', filer: 'Sen D2 (STOCK Act)', type: 'congress', side: 'buy', usd: 130000, txn: '2026-05-20', disclosed: '2026-06-29' },
      { ticker: 'EEE', filer: 'Fund E1 (13F)', type: 'institution', side: 'buy', usd: 42000000, txn: '2026-05-10', disclosed: '2026-06-29' }
    ]
  };
}

/* location-suitability (owner seam = waterfront-polo-lab.html geo primitives) — two Masters clubs
   (one reported, one seed) + six markets positioned so exactly one market crosses each lever; the
   estimated-hazard market (m-b) and the seed-club market (m-f) stay unverified. */
function locationOwnerFixture() {
  return {
    contractVersion: 'location-suitability-owner-state/v1',
    toolId: 'waterfront-polo-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic location universe',
    driveModel: { defaultMinutes: 40, avgSpeedMph: 38, roadFactor: 1.25 },
    mastersClubs: [
      { id: 'club-r', name: 'Reported club', lat: 28.50, lon: -81.40, confidence: 'reported' },
      { id: 'club-s', name: 'Seed club', lat: 30.00, lon: -82.00, confidence: 'seed' }
    ],
    markets: [
      { id: 'm-a', name: 'Alpha Lake', lat: 28.55, lon: -81.45, water: 'lake', medK: 1200, ppsf: 400, insBand: 2, flood: 1, surge: 1, land: 3, budgetFit: 'strong', q: 'measured' },
      { id: 'm-b', name: 'Bravo Lake (far)', lat: 28.85, lon: -81.75, water: 'lake', medK: 1000, ppsf: 350, insBand: 5, flood: 3, surge: 3, land: 2, budgetFit: 'good', q: 'estimated' },
      { id: 'm-c', name: 'Charlie Lake (pricey)', lat: 28.60, lon: -81.55, water: 'lake', medK: 1400, ppsf: 800, insBand: 3, flood: 1, surge: 1, land: 3, budgetFit: 'good', q: 'measured' },
      { id: 'm-d', name: 'Delta River', lat: 28.45, lon: -81.30, water: 'river', medK: 1100, ppsf: 300, insBand: 2, flood: 1, surge: 0, land: 4, budgetFit: 'strong', q: 'measured' },
      { id: 'm-e', name: 'Echo Lake (over budget)', lat: 28.52, lon: -81.42, water: 'lake', medK: 1800, ppsf: 500, insBand: 1, flood: 1, surge: 0, land: 3, budgetFit: 'over', q: 'measured' },
      { id: 'm-f', name: 'Foxtrot Lake (seed club)', lat: 29.95, lon: -82.05, water: 'lake', medK: 1300, ppsf: 400, insBand: 2, flood: 1, surge: 1, land: 3, budgetFit: 'strong', q: 'measured' }
    ]
  };
}

/* str-scenario/palm-springs (owner seam = rlrental.js) — two segments differ in nights + price; the
   full-economics required set includes the UNDISCLOSED property tax + capital reserve, so the owner
   engine returns INCOMPLETE (null full bottom line + a missingCostFieldIds list). */
function palmOwnerFixture() {
  return {
    contractVersion: 'str-scenario-owner-state/v1',
    toolId: 'palm-springs-rental-market-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic place scenario',
    marketId: 'palm-springs-ca',
    formulaVersion: 'place-based-rental-market-formula/v2',
    forecastYear: 2026,
    requiredFixedRiskCostFieldIds: ['insurance'],
    fullRequiredFixedRiskCostFieldIds: ['insurance', 'property-tax', 'capital-reserve'],
    missingEconomics: ['property-tax', 'capital-reserve', 'resale-basis'],
    loanTermYears: 30,
    leverageRatio: 0.7,
    downPaymentRatio: 0.3,
    baseFixedInsuranceUsd: null,
    segments: {
      'whole-market': { segmentId: 'whole-market', pairKey: 'palm-springs-ca::whole-market', unitId: 'ps-whole', baseOccupancy: 0.6, availableNights: 340, purchasePriceUsd: 1250000, baseAdrUsd: 600 },
      'large-luxury': { segmentId: 'large-luxury-5plus', pairKey: 'palm-springs-ca::large-luxury-5plus', unitId: 'ps-lux', baseOccupancy: 0.55, availableNights: 300, purchasePriceUsd: 3500000, baseAdrUsd: 1200 }
    }
  };
}

/* str-scenario/ocean-shores (owner seam = rlrental.js) — like Palm Springs but seasonal + no explicit
   insurance Simple input (disclosed insurance = frozen owner baseFixedInsuranceUsd). */
function oceanOwnerFixture() {
  return {
    contractVersion: 'str-scenario-owner-state/v1',
    toolId: 'ocean-shores-rental-market-lab',
    asOf: '2026-07-26',
    source: 'test-owner synthetic seasonal place scenario',
    marketId: 'ocean-shores-wa',
    formulaVersion: 'place-based-rental-market-formula/v2',
    forecastYear: 2026,
    requiredFixedRiskCostFieldIds: ['insurance'],
    fullRequiredFixedRiskCostFieldIds: ['insurance', 'property-tax', 'capital-reserve'],
    missingEconomics: ['property-tax', 'capital-reserve', 'resale-basis'],
    loanTermYears: 30,
    leverageRatio: 0.7,
    downPaymentRatio: 0.3,
    baseFixedInsuranceUsd: 28000,
    segments: {
      'whole-market': { segmentId: 'whole-market', pairKey: 'ocean-shores-wa::whole-market', unitId: 'os-whole', baseOccupancy: 0.5, availableNights: 300, purchasePriceUsd: 480000, baseAdrUsd: 320 },
      'large-luxury': { segmentId: 'large-luxury-5plus', pairKey: 'ocean-shores-wa::large-luxury-5plus', unitId: 'os-lux', baseOccupancy: 0.45, availableNights: 260, purchasePriceUsd: 1150000, baseAdrUsd: 900 }
    }
  };
}

/* market-action-triage (owner seam = rlbrief.js §6c window/action-gating) — two windows differ in
   candidate count; the 07:30 window holds a persistent gated action (SPY) + a non-persistent gated
   action (XLK) + a watch-only idea (MAGS), so the gate partitions them and excluded candidates are
   preserved as disclosures. Reference asOf 2026-07-26T11:30Z. */
function marketActionOwnerFixture() {
  const asOf = '2026-07-26T11:30:00.000Z';
  const base = Date.parse(asOf);
  const at = (days) => new Date(base + days * 864e5).toISOString();
  return {
    contractVersion: 'market-action-triage-owner-state/v1',
    toolId: 'market-brief',
    asOf,
    source: 'test-owner synthetic brief windows',
    windows: {
      '07:30': {
        label: '07:30 ET', asOf,
        recommendations: [
          { key: 'XLK', subject: 'XLK', action: 'add', trigger: 'hold breakout', invalidation: 'lose breakout', structuralAnchor: 'above 50d', confidence: 82, horizon: 'swing' },
          { key: 'SPY', subject: 'SPY', action: 'hedge', trigger: 'before CPI', invalidation: 'reclaim 200d', structuralAnchor: 'below 50d', confidence: 72, horizon: 'swing' },
          { key: 'MAGS', subject: 'MAGS', action: 'watch', trigger: 'breadth improves', invalidation: 'breadth rolls', structuralAnchor: 'at 50d', confidence: 70, horizon: 'tactical' }
        ],
        attention: [
          { title: 'Confirmed break', what: 'XLK cleared its base', structuralAnchor: '50d', confidence: 66 },
          { title: 'Watchlist only', what: 'MAGS breadth watch', structuralAnchor: '200d', confidence: 74 }
        ],
        seriesByKey: { XLK: [-0.2, -0.5, -0.3], SPY: [-0.2, -0.5, -0.9] },
        events: [{ when: at(3), event: 'CPI' }, { when: at(14), event: 'FOMC' }]
      },
      '11:00': {
        label: '11:00 ET', asOf,
        recommendations: [
          { key: 'XLK', subject: 'XLK', action: 'add', trigger: 'hold breakout', invalidation: 'lose breakout', structuralAnchor: 'above 50d', confidence: 80, horizon: 'swing' }
        ],
        attention: [{ title: 'Confirmed break', what: 'XLK holds', structuralAnchor: '50d', confidence: 64 }],
        seriesByKey: { XLK: [-0.2, -0.5, -0.9] },
        events: [{ when: at(3), event: 'CPI' }]
      },
      '15:00': { label: '15:00 ET', asOf, recommendations: [], attention: [], seriesByKey: {}, events: [] },
      '17:00': { label: '17:00 ET', asOf, recommendations: [], attention: [], seriesByKey: {}, events: [] }
    }
  };
}

/* ═══════════════════════ per-tool descriptor table (TP-07-04 … TP-07-09; TP-07-03 is the seeded driver below) ═══════════════════════
   moduleGlobal selects which injected UMD module owns the tool; registerKind selects the module's
   production registration entrypoint; needsRental injects the shared owner rental engine (RLRENTAL)
   for the two place-based scenarios; owner() is the frozen owner snapshot; changes are two in-domain
   control changes proven by TP-07-01 to move a declared owner output path. Every Scope-07 adapter is
   non-seeded except strategy-evolution (its own TP-07-03 seeded driver), so seed is null here. */
const TOOLS = {
  'strategy-validation-lab': {
    title: 'Regression: strategy validation Simple controls recompute owner out-of-sample evidence',
    html: 'strategy-validation-lab.html',
    moduleGlobal: 'RLSTRATEGY',
    moduleFile: 'rlexperience-adapters/strategy-research.js',
    registerKind: 'strategy',
    owner: () => walkForwardValidationOwnerFixture(),
    changes: () => [['cost', 80], ['folds', 8]],
    adapterId: 'simple-adapter/walk-forward-validation/v1'
  },
  'smart-money-flow-lab': {
    title: 'Regression: smart-money Simple controls recompute owner disclosure-lag decay',
    html: 'smart-money-flow-lab.html',
    moduleGlobal: 'RLSTRATEGY',
    moduleFile: 'rlexperience-adapters/strategy-research.js',
    registerKind: 'strategy',
    owner: () => disclosureOwnerFixture(),
    changes: () => [['lag-half-life', 90], ['cluster-minimum', 2]],
    adapterId: 'simple-adapter/disclosure-decay/v1'
  },
  'waterfront-polo-lab': {
    title: 'Regression: waterfront polo Simple controls recompute owner suitability with unverified evidence visible',
    html: 'waterfront-polo-lab.html',
    moduleGlobal: 'RLPROPERTY',
    moduleFile: 'rlexperience-adapters/property-research.js',
    registerKind: 'property',
    owner: () => locationOwnerFixture(),
    changes: () => [['travel-limit', 70], ['budget', 2500000]],
    adapterId: 'simple-adapter/location-suitability/v1',
    // Unverified-evidence truth must remain visible in the owner run the Simple read is built from.
    extraAsserts: (result) => {
      const verification = result.baselineSummary.verification;
      expect(verification.floodRequired).toBe(true);
      expect(verification.clubRequired).toBe(true);
      expect(verification.unverifiedIds).toContain('m-b'); // estimated-hazard market preserved unverified
      expect(verification.unverifiedIds).toContain('m-f'); // seed-club market preserved unverified
      const shortlistF = result.baselineSummary.shortlist.markets.find((market) => market.id === 'm-f');
      expect(shortlistF, 'the seed-club market is shortlisted').toBeTruthy();
      expect(shortlistF.nearestClubConfidence).toBe('seed'); // never promoted to "reported"
    }
  },
  'palm-springs-rental-market-lab': {
    title: 'Regression: Palm Springs Simple controls recompute owner cash-flow without zero-filling gaps',
    html: 'palm-springs-rental-market-lab.html',
    moduleGlobal: 'RLPROPERTY',
    moduleFile: 'rlexperience-adapters/property-research.js',
    registerKind: 'property',
    needsRental: true,
    owner: () => palmOwnerFixture(),
    changes: () => [['adr', 1500], ['occupancy', 72]],
    adapterId: 'simple-adapter/str-scenario/palm-springs/v1',
    extraAsserts: (result) => {
      const cf = result.baselineSummary.cashFlow;
      expect(cf.fullEconomicsState).toBe('INCOMPLETE'); // undisclosed economics keep the full run incomplete
      expect(cf.fullPreTaxCashFlowUsd).toBeNull();      // full bottom line unavailable, never zero-filled
      expect(cf.missingCostFieldIds).toContain('property-tax');
      expect(cf.missingCostFieldIds).toContain('capital-reserve');
      expect(typeof cf.annualOperatingPreTaxCashFlowUsd).toBe('number'); // disclosed-cost operating path is a real owner number
    }
  },
  'ocean-shores-rental-market-lab': {
    title: 'Regression: Ocean Shores Simple controls recompute owner seasonal cash-flow without zero-filling gaps',
    html: 'ocean-shores-rental-market-lab.html',
    moduleGlobal: 'RLPROPERTY',
    moduleFile: 'rlexperience-adapters/property-research.js',
    registerKind: 'property',
    needsRental: true,
    owner: () => oceanOwnerFixture(),
    changes: () => [['adr', 1400], ['occupancy', 70]],
    adapterId: 'simple-adapter/str-scenario/ocean-shores/v1',
    extraAsserts: (result) => {
      const cf = result.baselineSummary.cashFlow;
      expect(cf.fullEconomicsState).toBe('INCOMPLETE');
      expect(cf.fullPreTaxCashFlowUsd).toBeNull();
      expect(cf.missingCostFieldIds).toContain('property-tax');
      expect(cf.missingCostFieldIds).toContain('capital-reserve');
      expect(typeof cf.annualOperatingPreTaxCashFlowUsd).toBe('number');
    }
  },
  'market-brief': {
    title: 'Regression: Market Action triage controls recompute bounded action or no-action inside Brief only',
    html: 'market-brief.html',
    moduleGlobal: 'RLMARKETACTION',
    moduleFile: 'rlexperience-adapters/market-action.js',
    registerKind: 'market-action',
    isCenter: true,
    owner: () => marketActionOwnerFixture(),
    // evidence-threshold 0.95 flips the triage to no-action; catalyst-horizon 30 widens the visible slate.
    changes: () => [['evidence-threshold', 0.95], ['catalyst-horizon', 30]],
    adapterId: 'simple-adapter/market-action-triage/v1',
    extraAsserts: (result) => {
      // Bounded triage: both renders are a bounded action / no-action result (never an open forecast).
      expect(['action', 'no-action']).toContain(result.baselineSummary.actionState.state);
      expect(['action', 'no-action']).toContain(result.changedSummary.actionState.state);
      // The default frozen window triages to a bounded ACTION; the tighter evidence threshold flips it to no-action.
      expect(result.baselineSummary.actionState.state).toBe('action');
      expect(result.changedSummary.actionState.state).toBe('no-action');
      // INSIDE the Brief only: the Market Action Center page surfaces NO top-level Simple tab and NO
      // shared Simple panel — the triage is an in-Brief model, not a fifth/top-level Simple view.
      expect(result.nativeSimpleTabs).toBe(0);
      expect(result.nativeSimplePanel).toBe(false);
    }
  }
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Ensure the REAL production core is present. Every Scope-07 owner page loads rlapp.js, which brings up
   globalThis.RLEXPERIENCE asynchronously via its mount anchor; wait for the page's own core and, only if
   the page never brings it up, inject the REAL production core file (no interception, the real module). */
async function ensureCore(page) {
  const coreReady = () => !!(globalThis.RLEXPERIENCE
    && typeof globalThis.RLEXPERIENCE.createSimpleRuntime === 'function'
    && typeof globalThis.RLEXPERIENCE.renderSimpleProjection === 'function');
  try {
    await page.waitForFunction(coreReady, undefined, { timeout: 8000 });
  } catch (error) {
    await page.addScriptTag({ path: 'rlexperience.js' });
    await page.waitForFunction(coreReady, undefined, { timeout: 8000 });
  }
}

/* Inject the REAL production modules the tool needs: the shared owner rental engine (RLRENTAL) for the
   two place-based scenarios, then the REAL adapter UMD module. Injection is the same technique the
   Scope-05/06 specs use for the adapter — the REAL production file executing in the REAL page. */
async function injectModules(page, descriptor) {
  if (descriptor.needsRental) await page.addScriptTag({ path: 'rlrental.js' });
  await page.addScriptTag({ path: descriptor.moduleFile });
}

/* Drive one generic (TP-07-04 … TP-07-09) tool through the real stack: register the REAL adapter into a
   REAL runtime, prepare + a two-control recompute on the frozen owner snapshot, and render both
   projections into the REAL Simple panel host. Owner data is a frozen fixture (never intercepted). */
async function driveSimple(page, toolId) {
  const descriptor = TOOLS[toolId];
  const definition = plain(defFor(toolId));
  const owner = plain(descriptor.owner());
  const base = plain(defaults(definition));
  const changes = descriptor.changes();

  await page.goto(`${site.baseUrl}/${descriptor.html}`);
  await expect(page.locator('body')).toBeVisible();
  await ensureCore(page);
  await injectModules(page, descriptor);

  const result = await page.evaluate(async ({ config, definition, owner, base, changes, moduleGlobal, registerKind, needsRental }) => {
    const capture = (host) => {
      const numericNode = host.querySelector('[data-simple-numeric-value]');
      return {
        state: host.getAttribute('data-rlexperience-simple-state'),
        adapter: host.getAttribute('data-rlexperience-adapter'),
        heading: host.querySelector('h2') ? host.querySelector('h2').textContent : null,
        numeric: numericNode ? numericNode.textContent : null,
        text: host.textContent
      };
    };
    const api = globalThis.RLEXPERIENCE;
    const mod = globalThis[moduleGlobal];
    if (!api || !mod) return { fatal: `missing globals api=${!!api} mod=${!!mod}` };
    if (needsRental && !globalThis.RLRENTAL) return { fatal: 'missing globals RLRENTAL' };

    // Capture the page's NATIVE Simple surface BEFORE we mount our own host — proves whether the page
    // exposes a top-level Simple tab / shared Simple panel (the Center must expose neither).
    const nativeSimplePanel = !!document.querySelector('[data-rlexperience-panel="simple"]');
    const nativeSimpleTabs = Array.prototype.filter.call(
      document.querySelectorAll('[role="tab"]'),
      (node) => /^\s*simple\s*$/i.test(node.textContent || '')
    ).length;

    const runtime = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }).value;
    let registered;
    if (registerKind === 'strategy') registered = mod.registerStrategyResearchAdapters(runtime, api, [definition]);
    else if (registerKind === 'property') registered = mod.registerPropertyResearchAdapters(runtime, api, [definition], needsRental ? { rental: globalThis.RLRENTAL } : {});
    else registered = mod.registerMarketActionAdapters(runtime, api, [definition]);

    // The shared shell would provide the Simple panel host; the shell-opt-out owner pages omit it, so
    // mount the Simple host the shell omits — the REAL adapter renders into the REAL page's DOM.
    let host = document.querySelector('[data-rlexperience-panel="simple"]');
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-rlexperience-panel', 'simple');
      document.body.appendChild(host);
    }

    const prepared = await runtime.prepare({
      definitionId: definition.definitionId,
      ownerContext: { ownerState: owner },
      parameterValues: base,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T20:02:00.000Z'
    });
    if (!prepared.ok) return { fatal: 'prepare failed', error: prepared.error, registered: Object.keys(registered || {}) };
    api.renderSimpleProjection(host, runtime.snapshot().value.projection);
    const baseline = capture(host);
    const baselineSummary = prepared.value.current.output.values.summary;

    const changedValues = Object.assign({}, base);
    for (const [key, value] of changes) changedValues[key] = value;
    const run = await runtime.recompute({
      parameterValues: changedValues,
      seed: null,
      scenarioIds: ['baseline'],
      computedAt: '2026-07-26T20:03:00.000Z'
    });
    if (!run.ok) return { fatal: 'recompute failed', error: run.error };
    api.renderSimpleProjection(host, runtime.snapshot().value.projection);
    const changed = capture(host);
    const changedSummary = run.value.current.output.values.summary;

    return {
      registered: Object.keys(registered || {}),
      preparedState: prepared.value.state,
      changedParameters: run.value.changedParameters,
      nativeSimplePanel,
      nativeSimpleTabs,
      baseline,
      changed,
      baselineSummary,
      changedSummary
    };
  }, {
    config,
    definition,
    owner,
    base,
    changes,
    moduleGlobal: descriptor.moduleGlobal,
    registerKind: descriptor.registerKind,
    needsRental: !!descriptor.needsRental
  });

  return { descriptor, changes, result };
}

/* Every Scope-07 owner model is proven-complete (TP-07-01/TP-07-02), so each Simple read renders a
   READY owner run whose visible output path moves under the two control changes. */
async function assertVisibleSensitivity(page, toolId) {
  const { descriptor, changes, result } = await driveSimple(page, toolId);
  expect(result.fatal, JSON.stringify(result)).toBeUndefined();

  // Two meaningful controls were changed and the production runtime detected exactly those changes.
  const changedIds = changes.map(([id]) => id);
  expect(changedIds.length).toBeGreaterThanOrEqual(2);
  expect(result.changedParameters.slice().sort()).toEqual(changedIds.slice().sort());

  // The rendered projection is the REAL adapter's output on the real page.
  expect(result.registered).toContain(descriptor.adapterId);
  expect(result.baseline.adapter).toBe(descriptor.adapterId);
  expect(result.changed.adapter).toBe(descriptor.adapterId);

  // Ready owner run: the Simple decision read renders a value node and a decision-first heading.
  expect(result.preparedState).toBe('ready');
  expect(result.baseline.state).toBe('ready');
  expect(result.changed.state).toBe('ready');
  /* Decision-first: the heading is the tool's OWN verdict, never the generic contract label. */
  expect(result.baseline.heading).not.toBe('Simple model result');
  expect(result.changed.heading).not.toBe('Simple model result');
  expect(result.baseline.heading.length).toBeGreaterThan(0);
  expect(result.changed.heading.length).toBeGreaterThan(0);
  // Owner fact is visible: the Simple read paints a numeric owner value on both renders.
  expect(result.baseline.numeric).not.toBeNull();
  expect(result.changed.numeric).not.toBeNull();
  // Limitations are shown: the renderer always paints the owner limitation line (>= 1 by contract).
  expect(result.baseline.text).toMatch(/Limitation:/);
  expect(result.changed.text).toMatch(/Limitation:/);
  // VISIBLE parameter sensitivity: the owner-produced Simple output text CHANGES when the two controls
  // change — a user-visible DOM/text difference, not existence-only.
  expect(result.changed.text).not.toBe(result.baseline.text);
  expect(result.baseline.text).toContain(result.baseline.heading);
  expect(result.baseline.text).not.toContain('sha256:');

  // Tool-specific truth: unverified evidence stays visible / gaps stay unfilled / triage stays bounded in-Brief.
  if (descriptor.extraAsserts) descriptor.extraAsserts(result);
}

/* Drive the SEEDED strategy-evolution adapter (TP-07-03 / SCN-012-002) through the real stack across
   three fresh runtimes: (1) two prepares at the SAME seed prove reproducibility; (2) a two-control
   recompute under the SAME seed proves common-random sensitivity with a stable seeded path + a visible
   DOM change; (3) a NEW seed proves a labeled path change (distinct identity + distinct path), not a
   sensitivity. Owner data is a frozen fixture (never intercepted). */
async function driveSeededReproducibility(page) {
  const toolId = 'strategy-self-improvement-lab';
  const html = 'strategy-self-improvement-lab.html';
  const moduleFile = 'rlexperience-adapters/strategy-research.js';
  const adapterId = 'simple-adapter/strategy-evolution/v1';
  const definition = plain(defFor(toolId));
  const owner = plain(strategyOwnerFixture());
  const base = plain(defaults(definition));

  await page.goto(`${site.baseUrl}/${html}`);
  await expect(page.locator('body')).toBeVisible();
  await ensureCore(page);
  await page.addScriptTag({ path: moduleFile });

  const result = await page.evaluate(async ({ config, definition, owner, base }) => {
    const capture = (host) => {
      const numericNode = host.querySelector('[data-simple-numeric-value]');
      return {
        state: host.getAttribute('data-rlexperience-simple-state'),
        adapter: host.getAttribute('data-rlexperience-adapter'),
        heading: host.querySelector('h2') ? host.querySelector('h2').textContent : null,
        numeric: numericNode ? numericNode.textContent : null,
        text: host.textContent
      };
    };
    const api = globalThis.RLEXPERIENCE;
    const mod = globalThis.RLSTRATEGY;
    if (!api || !mod) return { fatal: `missing globals api=${!!api} mod=${!!mod}` };
    const seed = base.seed;

    function freshRuntime() {
      const runtime = api.createSimpleRuntime(config, { contractVersion: 'simple-model-registry/v1', definitions: [definition] }).value;
      mod.registerStrategyResearchAdapters(runtime, api, [definition]);
      return runtime;
    }
    function ensureHost() {
      let host = document.querySelector('[data-rlexperience-panel="simple"]');
      if (!host) {
        host = document.createElement('div');
        host.setAttribute('data-rlexperience-panel', 'simple');
        document.body.appendChild(host);
      }
      return host;
    }
    async function prepareBaseline(runtime) {
      return runtime.prepare({
        definitionId: definition.definitionId,
        ownerContext: { ownerState: owner },
        parameterValues: base,
        seed: seed,
        scenarioIds: ['baseline'],
        computedAt: '2026-07-26T20:02:00.000Z'
      });
    }

    // ── (A) common-random driver on the REAL DOM ──────────────────────────────────────────────
    const host = ensureHost();
    const runtimeA = freshRuntime();
    const prepA = await prepareBaseline(runtimeA);
    if (!prepA.ok) return { fatal: 'prepareA failed', error: prepA.error };
    api.renderSimpleProjection(host, runtimeA.snapshot().value.projection);
    const baseline = capture(host);
    const path0 = prepA.value.current.output.values.summary.path.pathIdentity;
    const compute0 = prepA.value.computeIdentity;

    const crChanged = Object.assign({}, base, { goal: 'cagr', 'search-budget': 6 });
    const runA = await runtimeA.recompute({ parameterValues: crChanged, seed: seed, scenarioIds: ['baseline'], computedAt: '2026-07-26T20:03:00.000Z' });
    if (!runA.ok) return { fatal: 'recomputeA failed', error: runA.error };
    api.renderSimpleProjection(host, runtimeA.snapshot().value.projection);
    const changed = capture(host);
    const cr = {
      changedParameters: runA.value.changedParameters,
      mode: runA.value.sensitivity.sharedRandomness.mode,
      seedChanged: runA.value.sensitivity.seedChanged,
      pathBefore: path0,
      pathAfter: runA.value.current.output.values.summary.path.pathIdentity,
      state: changed.state
    };

    // ── (B) reproducibility: a second fresh prepare at the SAME seed must be byte-identical ───────
    const runtimeB = freshRuntime();
    const prepB = await prepareBaseline(runtimeB);
    if (!prepB.ok) return { fatal: 'prepareB failed', error: prepB.error };
    const repro = {
      compute0,
      computeB: prepB.value.computeIdentity,
      fp0: api.fingerprint(prepA.value.current.output.values.summary),
      fpB: api.fingerprint(prepB.value.current.output.values.summary),
      path0,
      pathB: prepB.value.current.output.values.summary.path.pathIdentity
    };

    // ── (C) new-seed: a labeled path change (distinct identity + distinct path), NOT a sensitivity ─
    const runtimeC = freshRuntime();
    const prepC = await prepareBaseline(runtimeC);
    if (!prepC.ok) return { fatal: 'prepareC failed', error: prepC.error };
    const newSeed = seed + 1;
    const runC = await runtimeC.recompute({ parameterValues: Object.assign({}, base, { seed: newSeed }), seed: newSeed, scenarioIds: ['baseline'], computedAt: '2026-07-26T20:04:00.000Z' });
    if (!runC.ok) return { fatal: 'recomputeC failed', error: runC.error };
    const ns = {
      changedParameters: runC.value.changedParameters,
      mode: runC.value.sensitivity.sharedRandomness.mode,
      seedChanged: runC.value.sensitivity.seedChanged,
      pathBaseline: prepC.value.current.output.values.summary.path.pathIdentity,
      pathAfter: runC.value.current.output.values.summary.path.pathIdentity,
      computeBaseline: prepC.value.computeIdentity,
      computeAfter: runC.value.computeIdentity
    };

    return {
      adapterId: baseline.adapter,
      preparedState: prepA.value.state,
      baseline,
      changed,
      cr,
      repro,
      ns
    };
  }, { config, definition, owner, base });

  return { adapterId, result };
}

/* ═══════════════════════ TP-07-03 — SCN-012-002 seeded strategy self-improvement ═══════════════════════ */
test('Regression: strategy self-improvement Simple repeats one seed and separates parameter sensitivity from path randomness', async ({ page }) => {
  const { adapterId, result } = await driveSeededReproducibility(page);
  expect(result.fatal, JSON.stringify(result)).toBeUndefined();

  // The rendered projection is the REAL seeded strategy-evolution adapter on the real page.
  expect(result.preparedState).toBe('ready');
  expect(result.adapterId).toBe(adapterId);
  expect(result.baseline.adapter).toBe(adapterId);
  expect(result.baseline.state).toBe('ready');
  expect(result.baseline.heading).not.toBe('Simple model result');
  expect(result.baseline.heading.length).toBeGreaterThan(0);
  expect(result.baseline.numeric).not.toBeNull();
  expect(result.baseline.text).toMatch(/Limitation:/);

  // (B) Reproducibility: the same inputs+params+evidence+seed run twice => identical run identity,
  // identical owner summary, and an identical reproducible seeded path.
  expect(result.repro.computeB).toBe(result.repro.compute0);
  expect(result.repro.fpB).toBe(result.repro.fp0);
  expect(result.repro.pathB).toBe(result.repro.path0);

  // (A) Common-random sensitivity: a parameter change under the SAME seed moves the owner output
  // (a visible DOM/text difference) while the seeded path stays byte-stable — sensitivity SEPARATE
  // from path randomness.
  expect(result.cr.changedParameters.slice().sort()).toEqual(['goal', 'search-budget']);
  expect(result.cr.mode).toBe('common-random-numbers');
  expect(result.cr.seedChanged).toBe(false);
  expect(result.cr.pathAfter).toBe(result.cr.pathBefore); // the seeded path is UNCHANGED by a non-seed parameter
  expect(result.cr.state).toBe('ready');
  expect(result.changed.text).not.toBe(result.baseline.text); // visible parameter sensitivity in the DOM

  // (C) New seed: a labeled path change — a distinct run identity + a distinct reproducible path — and
  // NOT a sensitivity effect (the seed is path-separated, no parameter is reported as changed).
  expect(result.ns.changedParameters).toEqual([]);
  expect(result.ns.mode).toBe('path-separated');
  expect(result.ns.seedChanged).toBe(true);
  expect(result.ns.pathAfter).not.toBe(result.ns.pathBaseline); // a new seed selects a distinct reproducible path
  expect(result.ns.computeAfter).not.toBe(result.ns.computeBaseline); // a new seed is a distinct run identity
});

/* ═══════════════════════ TP-07-04 … TP-07-09 — SCN-012-036 per-tool owner sensitivity ═══════════════════════ */
test(TOOLS['strategy-validation-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'strategy-validation-lab'); });
test(TOOLS['smart-money-flow-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'smart-money-flow-lab'); });
test(TOOLS['waterfront-polo-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'waterfront-polo-lab'); });
test(TOOLS['palm-springs-rental-market-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'palm-springs-rental-market-lab'); });
test(TOOLS['ocean-shores-rental-market-lab'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'ocean-shores-rental-market-lab'); });
test(TOOLS['market-brief'].title, async ({ page }) => { await assertVisibleSensitivity(page, 'market-brief'); });
