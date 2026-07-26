/*
 * tests/market-action.unit.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 09 — TP-09-01 unit coverage for the PURE Market Action
 * Center projection composer/validator (rlmarketaction.js).
 *
 * Drives the REAL production rlmarketaction.js. Proves:
 *   - SCN-012-019: a complete-coverage, zero-admitted-action Brief states that
 *     no current action clears the bar and manufactures NO trade, catalyst, or
 *     confidence claim;
 *   - the Center composes EXACTLY four top-level views (brief, portfolio,
 *     red-alert, journey) — no Simple/Power/fifth top-level mode is derivable;
 *   - live Red Alert publication, authored ToolBrief/v2 Briefs, and the private
 *     Portfolio overlay are EXACT dependency-pending gates (not capabilities);
 *   - long-context disclosures default CLOSED while trigger/limitation stay
 *     visible;
 *   - closed, safe refusal errors that never echo the offending value.
 *
 * The first assertion is a production-artifact existence guard: an absent
 * rlmarketaction.js is the intended RED for this pure unit slice (never a
 * skipped/soft pass).
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const productionUrl = new URL('../rlmarketaction.js', import.meta.url);
const require = createRequire(import.meta.url);

function loadProductionApi() {
  assert.equal(existsSync(productionUrl), true, 'production contract missing: rlmarketaction.js');
  delete require.cache[require.resolve(productionUrl.pathname)];
  return require(productionUrl.pathname);
}

const JOURNEY_REFS = Object.freeze([
  'journey/market-action/prepare-session/v1',
  'journey/market-action/triage/v1',
  'journey/market-action/latent-risk/v1',
  'journey/market-action/portfolio-stress/v1'
]);

function makeCenterInput(overrides = {}) {
  const base = {
    projectionId: 'center/2026-07-26/1100ET',
    generationRef: 'legacy:market-brief:2026-07-26',
    cutoffAt: '2026-07-26T15:00:00.000Z',
    activeView: 'brief',
    brief: {
      window: '1100ET',
      cutoffAt: '2026-07-26T15:00:00.000Z',
      sourceTruth: 'legacy market-brief payload',
      coverageComplete: true,
      actions: [],
      imminentCatalysts: [],
      visibleLimitations: ['Educational research only; not investment advice.'],
      disclosures: [
        { id: 'backdrop', kind: 'methodology', ref: '#backdrop' },
        { id: 'citations', kind: 'citations', ref: '#citations' }
      ],
      legacyProvenance: 'legacy-market-brief-payload'
    },
    portfolio: { publicMatrixRef: 'matrix/center/2026-07-26' },
    redAlert: { alertRefs: [], cutoffAt: '2026-07-26T15:00:00.000Z' },
    journey: { definitionRefs: [...JOURNEY_REFS] }
  };
  return { ...base, ...overrides };
}

test('SCN-012-019 a complete-coverage zero-action Brief states no action and fabricates nothing', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput());
  assert.equal(result.ok, true, `compose rejected a valid no-action projection: ${JSON.stringify(result.error || {})}`);
  const brief = result.value.views.brief;
  assert.deepEqual(brief.actions, [], 'no-action Brief must carry zero actions');
  assert.equal(brief.noAction.coverageComplete, true);
  assert.equal(brief.noAction.statement, api.NO_ACTION_STATEMENT);
  assert.equal(brief.noAction.fabricatedAction, false);
  assert.equal(brief.noAction.fabricatedCatalyst, false);
  assert.equal(brief.noAction.fabricatedConfidence, false);
  assert.deepEqual(brief.imminentCatalysts, [], 'no catalyst may be manufactured in the no-action state');
  // adversarial: the serialized projection must contain no fabricated confidence/probability claim
  const serialized = JSON.stringify(result.value);
  assert.equal(/confidence"\s*:\s*[0-9]/.test(serialized), false, 'a no-action Brief must not manufacture a numeric confidence claim');
  assert.equal(/"probability"\s*:\s*[0-9]/.test(serialized), false, 'a no-action Brief must not manufacture a numeric probability claim');
});

test('SCN-012-019 an admitted action suppresses the no-action state (no false no-action)', () => {
  const api = loadProductionApi();
  const withAction = makeCenterInput({
    brief: { window: '1100ET', coverageComplete: true, actions: [{ id: 'a1', kind: 'attention', text: 'Watch the FOMC print window.' }] }
  });
  const result = api.composeCenterProjection(withAction);
  assert.equal(result.ok, true);
  assert.equal(result.value.views.brief.noAction, null, 'a Brief with an admitted action must not also claim no-action');
  assert.equal(result.value.views.brief.actions.length, 1);
});

test('SCN-012-017 the Center composes exactly the four top-level views in order', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput());
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.viewOrder, ['brief', 'portfolio', 'red-alert', 'journey']);
  assert.deepEqual(Object.keys(result.value.views).sort(), ['brief', 'journey', 'portfolio', 'red-alert']);
  assert.equal(result.value.viewState.activeView, 'brief');
  assert.deepEqual(api.CENTER_VIEW_IDS, ['brief', 'portfolio', 'red-alert', 'journey']);
});

test('a legacy #simple / #power hash maps only onto the closed four-view set (no fifth mode)', () => {
  const api = loadProductionApi();
  for (const active of ['brief', 'portfolio', 'red-alert', 'journey']) {
    const result = api.composeCenterProjection(makeCenterInput({ activeView: active }));
    assert.equal(result.ok, true, `active view ${active} rejected`);
    assert.equal(result.value.viewState.activeView, active);
  }
  // adversarial: 'simple' and 'power' are NOT top-level Center views
  for (const bad of ['simple', 'power', 'evidence', 'experiment']) {
    const result = api.composeCenterProjection(makeCenterInput({ activeView: bad }));
    assert.equal(result.ok, false, `a ${bad} top-level view must be rejected`);
    assert.equal(result.error.code, 'RLMKT-VIEW');
  }
});

test('dependency-pending gates are exact and not implemented (authored Brief, live alert, private overlay)', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput());
  assert.equal(result.ok, true);
  assert.equal(result.value.gates.authoredBriefV2, api.GATE.authoredBriefV2);
  assert.equal(result.value.gates.redAlertPublication, api.GATE.redAlertPublication);
  assert.equal(result.value.gates.privatePortfolioOverlay, api.GATE.privatePortfolioOverlay);
  assert.equal(result.value.gates.authoredBriefV2, 'dependency-pending:feature-002');
  assert.equal(result.value.gates.privatePortfolioOverlay, 'dependency-pending:feature-008');
  assert.equal(result.value.views.brief.authorState, 'dependency-pending:feature-002');
  assert.equal(result.value.views.portfolio.privateOverlayState, 'dependency-pending:feature-008');
  assert.equal(result.value.views.portfolio.browserCapability.localPrivateOverlaySupported, false);
  assert.equal(result.value.views['red-alert'].publicationState, 'dependency-pending:feature-002');
});

test('claiming an authored/frozen-bundle Brief before Feature 002 is refused', () => {
  const api = loadProductionApi();
  const authored = api.composeCenterProjection(makeCenterInput({ brief: { window: '1100ET', coverageComplete: true, actions: [], authored: true } }));
  assert.equal(authored.ok, false);
  assert.equal(authored.error.code, 'RLMKT-GATE');
  const frozen = api.composeCenterProjection(makeCenterInput({ brief: { window: '1100ET', coverageComplete: true, actions: [], frozenBundle: true } }));
  assert.equal(frozen.ok, false);
  assert.equal(frozen.error.code, 'RLMKT-GATE');
});

test('claiming a live Red Alert publication before Feature 002 is refused', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput({ redAlert: { alertRefs: [], published: true } }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'RLMKT-GATE');
});

test('an empty Red Alert projection is an honest valid outcome', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput());
  assert.equal(result.ok, true);
  const redAlert = result.value.views['red-alert'];
  assert.deepEqual(redAlert.alertRefs, []);
  assert.notEqual(redAlert.emptyProjection, null, 'zero alerts must produce an explicit empty projection, not a hidden gap');
});

test('long-context Brief disclosures default closed while limitations stay visible', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput());
  assert.equal(result.ok, true);
  const brief = result.value.views.brief;
  assert.equal(brief.disclosures.length, 2);
  assert.equal(brief.disclosures.every((disclosure) => disclosure.open === false), true, 'every long-context disclosure must default closed');
  assert.equal(brief.visibleLimitations.length >= 1, true, 'blocking/limitation copy must remain visible, not tucked into a closed disclosure');
});

test('the four journey refs are exactly the committed global Market Action goals', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection(makeCenterInput());
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.views.journey.definitionRefs, JOURNEY_REFS);
  assert.equal(result.value.views.journey.portfolioStressPrerequisiteState, 'dependency-pending:feature-008');
  // adversarial: a Center exposing anything other than exactly four journey goals is rejected
  const three = api.composeCenterProjection(makeCenterInput({ journey: { definitionRefs: JOURNEY_REFS.slice(0, 3) } }));
  assert.equal(three.ok, false);
  assert.equal(three.error.code, 'RLMKT-PROJECTION');
});

test('validateCenterProjection round-trips a composed projection and reports three pending gates', () => {
  const api = loadProductionApi();
  const composed = api.composeCenterProjection(makeCenterInput());
  assert.equal(composed.ok, true);
  const validated = api.validateCenterProjection(composed.value);
  assert.equal(validated.ok, true, `validator rejected its own composed projection: ${JSON.stringify(validated.error || {})}`);
  assert.equal(validated.value.viewCount, 4);
  assert.equal(validated.value.gatesPending, 3);
  assert.equal(validated.value.activeView, 'brief');
});

test('validateCenterProjection rejects a tampered fifth view, gate downgrade, and fabricated no-action', () => {
  const api = loadProductionApi();
  const composed = api.composeCenterProjection(makeCenterInput());
  assert.equal(composed.ok, true);

  const fifthView = structuredClone(composed.value);
  fifthView.viewOrder = ['brief', 'portfolio', 'red-alert', 'journey', 'simple'];
  fifthView.views.simple = { viewId: 'simple' };
  const fifthResult = api.validateCenterProjection(fifthView);
  assert.equal(fifthResult.ok, false);
  assert.equal(fifthResult.error.code, 'RLMKT-VIEW');

  const downgraded = structuredClone(composed.value);
  downgraded.gates.privatePortfolioOverlay = 'implemented';
  const downgradedResult = api.validateCenterProjection(downgraded);
  assert.equal(downgradedResult.ok, false);
  assert.equal(downgradedResult.error.code, 'RLMKT-GATE');

  const fabricated = structuredClone(composed.value);
  fabricated.views.brief.noAction.fabricatedCatalyst = true;
  const fabricatedResult = api.validateCenterProjection(fabricated);
  assert.equal(fabricatedResult.ok, false);
  assert.equal(fabricatedResult.error.code, 'RLMKT-NOACTION');
});

test('refusal errors are closed and never echo the offending value', () => {
  const api = loadProductionApi();
  const result = api.composeCenterProjection({ projectionId: 42, secretSmuggled: 'do-not-echo-me' });
  assert.equal(result.ok, false);
  assert.equal(result.error.contractVersion, 'market-action-error/v1');
  assert.equal(api.REFUSAL_CODES.includes(result.error.code), true);
  assert.equal(result.error.valueEchoed, false);
  assert.equal(JSON.stringify(result.error).includes('do-not-echo-me'), false, 'a refusal must never echo the offending input value');
});
