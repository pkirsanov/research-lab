#!/usr/bin/env node
/*
 * scripts/validate-market-action.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 09 — production validator for the two public Market Action
 * Center contracts (mirrors scripts/validate-tool-experience.mjs structure).
 *
 * Drives the REAL rlmarketaction.js against the REAL watchlist.json and the REAL
 * registry-derived domain map from tools.json, and proves:
 *   - the PUBLIC PortfolioTickerMatrix/v1 composes for every watchlist ticker,
 *     labels every row `Public watchlist`, emits one explicit cell per domain
 *     (never neutral by omission), and validates round-trip;
 *   - the MarketActionCenterProjection/v1 composes EXACTLY four top-level views
 *     with the three exact dependency-pending gates and the truthful no-action
 *     Brief, and validates round-trip;
 *   - a forbidden-authority scan of the module source: rlmarketaction.js owns
 *     ZERO fetch/providerFetch/credential/storage-write/LLM/publisher capability;
 *   - the closed adversarial refusals (private field, private-workspace row,
 *     neutral-by-omission cell, fifth view, gate downgrade, fabricated no-action)
 *     all fail closed.
 *
 * Exit 0 = every contract and scan holds; exit 1 = a validation failed.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const require = createRequire(import.meta.url);
const RLMARKETACTION = require('../rlmarketaction.js');

/* forbidden capabilities the PURE public composer must never own (mirrors the
   validate-tool-experience.mjs forbidden-capability scan). */
const FORBIDDEN_MODULE_CAPABILITIES = [
  'fetch(',
  'providerFetch(',
  'localStorage.',
  'sessionStorage.',
  '.setItem(',
  'XMLHttpRequest',
  'WebSocket',
  'rlProviderConfig',
  'author(',
  'publish('
];

const JOURNEY_REFS = [
  'journey/market-action/prepare-session/v1',
  'journey/market-action/triage/v1',
  'journey/market-action/latent-risk/v1',
  'journey/market-action/portfolio-stress/v1'
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function readRequired(relativePath) {
  try {
    return readFileSync(resolve(ROOT, relativePath), 'utf8');
  } catch (error) {
    throw new Error(`required artifact unavailable: ${relativePath}`);
  }
}

/* Registry-derived domain -> owner precedence (precedence = registry order).
   Only EVIDENCE domains have owners; a derived domain is computed by the composer. */
function deriveDomainMap() {
  const registry = JSON.parse(readRequired('tools.json'));
  const ownerPrecedence = Object.create(null);
  for (const domain of RLMARKETACTION.EVIDENCE_DOMAINS) ownerPrecedence[domain] = [];
  for (const tool of registry.tools) {
    const domains = (tool.experience && tool.experience.matrixDomains) || [];
    for (const domain of domains) {
      if (ownerPrecedence[domain]) ownerPrecedence[domain].push(tool.id);
    }
  }
  return ownerPrecedence;
}

function deriveApplicability(items) {
  const applicability = Object.create(null);
  for (const domain of RLMARKETACTION.EVIDENCE_DOMAINS) applicability[domain] = Object.create(null);
  const etfApplicable = new Set(['technical', 'macro-rotation', 'options', 'volatility']);
  const stockApplicable = new Set(['fundamentals', 'technical', 'options', 'volatility', 'catalyst']);
  for (const item of items) {
    const isEtf = item.type === 'etf';
    for (const domain of RLMARKETACTION.EVIDENCE_DOMAINS) {
      applicability[domain][item.ticker] = (isEtf ? etfApplicable.has(domain) : stockApplicable.has(domain)) ? 'applicable' : 'not-applicable';
    }
  }
  return applicability;
}

function buildMatrixInput() {
  const watchlist = JSON.parse(readRequired('watchlist.json'));
  return {
    matrixId: 'validate/market-action',
    cutoffAt: '2026-07-26T15:00:00.000Z',
    generationRef: 'legacy:market-brief:validate',
    domainMapVersion: 'registry-derived/v1',
    watchlist,
    ownerPrecedence: deriveDomainMap(),
    applicability: deriveApplicability(watchlist.items),
    ownerReads: {
      'company-fundamentals-lab': { MSFT: { state: 'current', read: 'FY26 print', asOf: '2026-07-26T14:00:00.000Z', provenance: 'same-origin-snapshot' } },
      'market-heatmap-lab': { QQQ: { state: 'partial', read: 'breadth partial', asOf: '2026-07-26T14:00:00.000Z', provenance: 'same-origin-snapshot' } }
    }
  };
}

function buildCenterInput() {
  return {
    projectionId: 'validate/center',
    generationRef: 'legacy:market-brief:validate',
    cutoffAt: '2026-07-26T15:00:00.000Z',
    activeView: 'brief',
    brief: { window: '1100ET', coverageComplete: true, actions: [], visibleLimitations: ['Educational research only.'], disclosures: [{ id: 'backdrop', kind: 'methodology' }] },
    portfolio: { publicMatrixRef: 'matrix/validate/market-action' },
    redAlert: { alertRefs: [] },
    journey: { definitionRefs: [...JOURNEY_REFS] }
  };
}

function validateModuleAuthorityScan() {
  const source = readRequired('rlmarketaction.js');
  const findings = [];
  for (const capability of FORBIDDEN_MODULE_CAPABILITIES) {
    if (source.includes(capability)) findings.push(capability);
  }
  invariant(findings.length === 0, `rlmarketaction.js owns a forbidden capability: ${findings.join(', ')}`);
  return { forbiddenCapabilityCount: findings.length, scanned: FORBIDDEN_MODULE_CAPABILITIES.length };
}

function validatePublicMatrixContract() {
  const composed = RLMARKETACTION.composePublicMatrix(buildMatrixInput());
  invariant(composed.ok, `public matrix composer rejected valid input: ${JSON.stringify(composed.ok ? {} : composed.error)}`);
  const matrix = composed.value;
  invariant(matrix.contractVersion === 'portfolio-ticker-matrix/v1', 'public matrix carries the wrong contract version');
  invariant(matrix.rows.length > 0, 'public matrix produced no rows from watchlist.json');
  for (const row of matrix.rows) {
    invariant(row.scopeClass === 'public-watchlist' && row.scopeLabel === 'Public watchlist', 'a public row is not scope-labeled Public watchlist');
    invariant(row.cells.length === RLMARKETACTION.MATRIX_DOMAINS.length, 'a row does not carry exactly one cell per domain (neutral by omission)');
    for (const cell of row.cells) {
      invariant(RLMARKETACTION.APPLICABILITY.includes(cell.applicability), 'a cell lacks an explicit applicability');
      invariant(RLMARKETACTION.CELL_STATES.includes(cell.state), 'a cell lacks a closed state');
    }
  }
  const validated = RLMARKETACTION.validatePublicMatrix(matrix);
  invariant(validated.ok, `public matrix validator rejected its own matrix: ${JSON.stringify(validated.ok ? {} : validated.error)}`);
  invariant(validated.value.privateFieldsPresent === false, 'public matrix reported private fields present');
  return { rowCount: matrix.rows.length, coveredCells: matrix.scopeSummary.coveredCellCount, gapCount: matrix.scopeSummary.gapCount };
}

function validateCenterProjectionContract() {
  const composed = RLMARKETACTION.composeCenterProjection(buildCenterInput());
  invariant(composed.ok, `center projection composer rejected valid input: ${JSON.stringify(composed.ok ? {} : composed.error)}`);
  const projection = composed.value;
  invariant(JSON.stringify(projection.viewOrder) === JSON.stringify(['brief', 'portfolio', 'red-alert', 'journey']), 'center projection does not expose exactly the four top-level views');
  invariant(projection.gates.authoredBriefV2 === 'dependency-pending:feature-002', 'authored Brief v2 gate drifted');
  invariant(projection.gates.redAlertPublication === 'dependency-pending:feature-002', 'red alert publication gate drifted');
  invariant(projection.gates.privatePortfolioOverlay === 'dependency-pending:feature-008', 'private portfolio overlay gate drifted');
  invariant(projection.views.brief.noAction && projection.views.brief.noAction.statement === RLMARKETACTION.NO_ACTION_STATEMENT, 'no-action Brief statement missing');
  const validated = RLMARKETACTION.validateCenterProjection(projection);
  invariant(validated.ok, `center projection validator rejected its own projection: ${JSON.stringify(validated.ok ? {} : validated.error)}`);
  invariant(validated.value.viewCount === 4 && validated.value.gatesPending === 3, 'center projection validation summary drifted');
  return { viewCount: validated.value.viewCount, gatesPending: validated.value.gatesPending, activeView: validated.value.activeView };
}

function runAdversarialChecks() {
  const results = [];
  const expectRejected = (name, code, run) => {
    const result = run();
    invariant(result.ok === false, `adversarial case ${name} was unexpectedly accepted`);
    invariant(result.error.code === code, `adversarial case ${name} refused with ${result.error.code}, expected ${code}`);
    results.push({ name, code: result.error.code });
  };

  expectRejected('private-field-smuggle', 'RLMKT-PRIVACY', () => {
    const input = buildMatrixInput();
    input.watchlist = structuredClone(input.watchlist);
    input.watchlist.items[0].quantity = 100;
    return RLMARKETACTION.composePublicMatrix(input);
  });
  expectRejected('private-workspace-row', 'RLMKT-SCOPE', () => {
    const matrix = RLMARKETACTION.composePublicMatrix(buildMatrixInput()).value;
    const tampered = structuredClone(matrix);
    tampered.rows[0].scopeClass = 'private-workspace';
    tampered.rows[0].scopeLabel = 'Private workspace - local only';
    tampered.matrixFingerprint = RLMARKETACTION.fingerprint({ ...tampered, matrixFingerprint: null });
    return RLMARKETACTION.validatePublicMatrix(tampered);
  });
  expectRejected('neutral-by-omission-cell', 'RLMKT-CELL', () => {
    const matrix = RLMARKETACTION.composePublicMatrix(buildMatrixInput()).value;
    const tampered = structuredClone(matrix);
    delete tampered.rows[0].cells[0].state;
    return RLMARKETACTION.validatePublicMatrix(tampered);
  });
  expectRejected('fifth-top-level-view', 'RLMKT-VIEW', () => {
    return RLMARKETACTION.composeCenterProjection({ ...buildCenterInput(), activeView: 'simple' });
  });
  expectRejected('gate-downgrade', 'RLMKT-GATE', () => {
    const projection = RLMARKETACTION.composeCenterProjection(buildCenterInput()).value;
    const tampered = structuredClone(projection);
    tampered.gates.privatePortfolioOverlay = 'implemented';
    return RLMARKETACTION.validateCenterProjection(tampered);
  });
  expectRejected('fabricated-no-action', 'RLMKT-NOACTION', () => {
    const projection = RLMARKETACTION.composeCenterProjection(buildCenterInput()).value;
    const tampered = structuredClone(projection);
    tampered.views.brief.noAction.fabricatedCatalyst = true;
    return RLMARKETACTION.validateCenterProjection(tampered);
  });
  expectRejected('authored-brief-before-gate', 'RLMKT-GATE', () => {
    const input = buildCenterInput();
    input.brief = { ...input.brief, authored: true };
    return RLMARKETACTION.composeCenterProjection(input);
  });
  return results;
}

export function validateMarketAction() {
  return {
    authority: validateModuleAuthorityScan(),
    matrix: validatePublicMatrixContract(),
    center: validateCenterProjectionContract(),
    adversarial: runAdversarialChecks()
  };
}

function main() {
  try {
    const report = validateMarketAction();
    console.log(`[market-action] moduleAuthorityScan=PASS forbiddenCapabilities=${report.authority.forbiddenCapabilityCount} scanned=${report.authority.scanned}`);
    console.log(`[market-action] publicMatrix=PASS rows=${report.matrix.rowCount} coveredCells=${report.matrix.coveredCells} gaps=${report.matrix.gapCount} scopeLabel="Public watchlist"`);
    console.log(`[market-action] centerProjection=PASS views=${report.center.viewCount} gatesPending=${report.center.gatesPending} activeView=${report.center.activeView}`);
    for (const refusal of report.adversarial) {
      console.log(`[market-action] adversarial=${refusal.name} result=REJECTED code=${refusal.code}`);
    }
    console.log(`[market-action] OK adversarial=${report.adversarial.length} unexpectedAcceptances=0`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'market-action validator failed without an Error object';
    console.error(`[market-action] FAIL ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
