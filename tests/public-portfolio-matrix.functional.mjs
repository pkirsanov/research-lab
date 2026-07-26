/*
 * tests/public-portfolio-matrix.functional.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 09 — TP-09-02 functional coverage for the PUBLIC
 * PortfolioTickerMatrix/v1 composer (rlmarketaction.js).
 *
 * Composes the ACTUAL public projection: the registry-derived domain/owner map
 * from the REAL tools.json, the REAL ticker-only watchlist.json, and a set of
 * existing public owner reads handed IN. Proves:
 *   - SCN-012-022: every row is scope-labeled `Public watchlist`, and no
 *     holding, quantity, cost, P&L, mandate, or personal-exposure field or copy
 *     exists anywhere in the matrix;
 *   - every cell carries an EXPLICIT applicability + state — a missing owner
 *     read is `unavailable` with a gap reason, never neutral by omission;
 *     not-applicable is explicit and is not counted as a coverage gap;
 *   - the composer REFUSES any input that carries a Feature 008 private field;
 *   - the PUBLIC validator refuses a private-workspace row;
 *   - the composer reads/creates NO Feature 008 key and performs ZERO
 *     fetch/providerFetch/storage access — proven with throwing storage/request
 *     sentinels — and writes nothing (watchlist.json bytes are unchanged).
 *
 * The first assertion is a production-artifact existence guard: an absent
 * rlmarketaction.js is the intended RED for this pure functional slice.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const productionUrl = new URL('../rlmarketaction.js', import.meta.url);
const watchlistUrl = new URL('../watchlist.json', import.meta.url);
const registryUrl = new URL('../tools.json', import.meta.url);
const require = createRequire(import.meta.url);

function loadProductionApi() {
  assert.equal(existsSync(productionUrl), true, 'production contract missing: rlmarketaction.js');
  delete require.cache[require.resolve(productionUrl.pathname)];
  return require(productionUrl.pathname);
}

function readWatchlist() {
  assert.equal(existsSync(watchlistUrl), true, 'public source missing: watchlist.json');
  return JSON.parse(readFileSync(watchlistUrl, 'utf8'));
}

/* Registry-derived domain -> owner precedence (precedence = tools.json registry order),
   exactly as the design mandates ("Matrix domains and owner precedence are registry
   metadata, not page code"). Built here from the REAL registry, not hardcoded. */
function deriveDomainMap(api) {
  const registry = JSON.parse(readFileSync(registryUrl, 'utf8'));
  const ownerPrecedence = Object.create(null);
  for (const domain of api.MATRIX_DOMAINS) ownerPrecedence[domain] = [];
  for (const tool of registry.tools) {
    const domains = (tool.experience && tool.experience.matrixDomains) || [];
    for (const domain of domains) {
      if (ownerPrecedence[domain]) ownerPrecedence[domain].push(tool.id);
    }
  }
  return ownerPrecedence;
}

/* Explicit per-ticker applicability, derived from a documented public rule:
   an ETF has no single-issuer fundamentals/catalyst/gaps; a single stock is not a
   macro/rotation owner domain. Every (domain, ticker) is EXPLICIT — never omitted. */
function deriveApplicability(api, items) {
  const applicability = Object.create(null);
  for (const domain of api.MATRIX_DOMAINS) applicability[domain] = Object.create(null);
  const etfApplicable = new Set(['technical', 'macro-rotation', 'options', 'volatility']);
  const stockApplicable = new Set(['fundamentals', 'technical', 'options', 'volatility', 'catalyst', 'gaps']);
  for (const item of items) {
    const isEtf = item.type === 'etf';
    for (const domain of api.MATRIX_DOMAINS) {
      const applies = isEtf ? etfApplicable.has(domain) : stockApplicable.has(domain);
      applicability[domain][item.ticker] = applies ? 'applicable' : 'not-applicable';
    }
  }
  return applicability;
}

function makeMatrixInput(api, overrides = {}) {
  const watchlist = readWatchlist();
  const ownerPrecedence = deriveDomainMap(api);
  const applicability = deriveApplicability(api, watchlist.items);
  const base = {
    matrixId: 'center/2026-07-26',
    cutoffAt: '2026-07-26T15:00:00.000Z',
    generationRef: 'legacy:market-brief:2026-07-26',
    domainMapVersion: 'registry-derived/v1',
    watchlist,
    ownerPrecedence,
    applicability,
    ownerReads: {
      'company-fundamentals-lab': {
        MSFT: { state: 'current', read: 'FY26 print modeled', asOf: '2026-07-26T14:00:00.000Z', provenance: 'same-origin-snapshot', ownerDeepLink: 'company-fundamentals-lab.html#power' }
      },
      'market-heatmap-lab': {
        QQQ: { state: 'partial', read: 'breadth partial coverage', asOf: '2026-07-26T14:00:00.000Z', provenance: 'same-origin-snapshot' }
      }
    }
  };
  return { ...base, ...overrides };
}

test('SCN-012-022 every composed public row is labeled Public watchlist', () => {
  const api = loadProductionApi();
  const watchlist = readWatchlist();
  const result = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(result.ok, true, `public matrix compose rejected valid input: ${JSON.stringify(result.error || {})}`);
  assert.equal(result.value.rows.length, watchlist.items.length);
  for (const row of result.value.rows) {
    assert.equal(row.scopeClass, 'public-watchlist');
    assert.equal(row.scopeLabel, 'Public watchlist');
    assert.equal(row.scopeLabel, api.PUBLIC_SCOPE_LABEL);
  }
  assert.equal(result.value.scopeSummary.scopeLabel, 'Public watchlist');
});

test('SCN-012-022 no holding/quantity/cost/P&L/mandate/exposure field or copy exists in the matrix', () => {
  const api = loadProductionApi();
  const result = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(result.ok, true);
  // no private FIELD survives the composer's private-field barrier
  const validated = api.validatePublicMatrix(result.value);
  assert.equal(validated.ok, true, `validator rejected its own public matrix: ${JSON.stringify(validated.error || {})}`);
  assert.equal(validated.value.privateFieldsPresent, false);
  assert.equal(result.value.privacyAssertion.publicOnly, true);
  assert.equal(result.value.privacyAssertion.feature008KeyRead, false);
  assert.equal(result.value.privacyAssertion.feature008KeyCreated, false);
  // The privacyAssertion legitimately NAMES the excluded concepts to deny them; the
  // ownership-implying-copy scan targets the per-ticker projection (rows + scope
  // summary), which is where inferred-ownership wording would leak.
  const projectionCopy = JSON.stringify({ rows: result.value.rows, scopeSummary: result.value.scopeSummary });
  const forbiddenCopy = /\b(shares?\s+held|you\s+own|your\s+position|cost\s+basis|unrealized|p&l|pnl|mandate|personal\s+exposure)\b/i;
  assert.equal(forbiddenCopy.test(projectionCopy), false, 'no ownership-implying copy may appear in a public matrix row or scope summary');
  // and the composer's own privacy assertion is the only place those denied words appear
  assert.equal(/holding|quantity|mandate|exposure/i.test(result.value.privacyAssertion.statement), true, 'the privacy assertion must explicitly deny the private concepts');
});

test('SCN-012-022 every cell carries an explicit applicability and closed state (never neutral by omission)', () => {
  const api = loadProductionApi();
  const result = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(result.ok, true);
  for (const row of result.value.rows) {
    assert.equal(row.cells.length, api.MATRIX_DOMAINS.length, `row ${row.ticker} must carry one cell per domain`);
    row.cells.forEach((cell, index) => {
      assert.equal(cell.domainId, api.MATRIX_DOMAINS[index]);
      assert.equal(api.APPLICABILITY.includes(cell.applicability), true, `cell ${row.ticker}/${cell.domainId} lacks an explicit applicability`);
      assert.equal(api.CELL_STATES.includes(cell.state), true, `cell ${row.ticker}/${cell.domainId} lacks a closed state`);
      if (cell.applicability === 'not-applicable') assert.equal(cell.state, 'not-applicable');
      if (cell.state !== 'current') assert.equal(typeof cell.gapReason === 'string' && cell.gapReason.length > 0, true, `non-current cell ${row.ticker}/${cell.domainId} must carry a gap reason`);
    });
    // not-applicable is explicit and is NOT counted as a coverage gap
    const notApplicableInGaps = row.gaps.some((gap) => gap.state === 'not-applicable');
    assert.equal(notApplicableInGaps, false, 'a not-applicable cell must never be counted as a coverage gap');
  }
});

test('an applicable domain with no owner read is explicitly unavailable with a gap reason', () => {
  const api = loadProductionApi();
  const result = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(result.ok, true);
  // VGT is an ETF: technical is applicable but no owner read was supplied -> unavailable, not neutral
  const vgt = result.value.rows.find((row) => row.ticker === 'VGT');
  const technical = vgt.cells.find((cell) => cell.domainId === 'technical');
  assert.equal(technical.applicability, 'applicable');
  assert.equal(technical.state, 'unavailable');
  assert.equal(technical.gapReason.length > 0, true);
  // MSFT fundamentals had a current read
  const msft = result.value.rows.find((row) => row.ticker === 'MSFT');
  const fundamentals = msft.cells.find((cell) => cell.domainId === 'fundamentals');
  assert.equal(fundamentals.state, 'current');
  assert.equal(fundamentals.gapReason, null);
});

test('scheduled public per-ticker Brief and private overlay remain dependency-pending gates', () => {
  const api = loadProductionApi();
  const result = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(result.ok, true);
  for (const row of result.value.rows) {
    assert.equal(row.publicBriefState, 'dependency-pending:feature-002');
    assert.equal(row.localOverlayState, 'dependency-pending:feature-008');
    assert.equal(row.catalyst.state, 'dependency-pending:feature-002');
    assert.equal(row.catalyst.ref, null, 'no catalyst may be fabricated before Feature 002 certification');
  }
});

test('SCN-012-022 the composer REFUSES any input carrying a Feature 008 private field', () => {
  const api = loadProductionApi();
  for (const field of ['quantity', 'holding', 'costBasis', 'pnl', 'mandate', 'personalExposure']) {
    const smuggled = makeMatrixInput(api);
    smuggled.watchlist = structuredClone(smuggled.watchlist);
    smuggled.watchlist.items[0][field] = 100;
    const result = api.composePublicMatrix(smuggled);
    assert.equal(result.ok, false, `a smuggled ${field} must be refused`);
    assert.equal(result.error.code, 'RLMKT-PRIVACY');
    assert.equal(JSON.stringify(result.error).includes('100'), false, 'a privacy refusal must never echo the private value');
  }
});

test('the PUBLIC validator refuses a private-workspace row', () => {
  const api = loadProductionApi();
  const composed = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(composed.ok, true);
  const tampered = structuredClone(composed.value);
  tampered.rows[0].scopeClass = 'private-workspace';
  tampered.rows[0].scopeLabel = 'Private workspace - local only';
  tampered.matrixFingerprint = api.fingerprint({ ...tampered, matrixFingerprint: null });
  const result = api.validatePublicMatrix(tampered);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'RLMKT-SCOPE');
});

test('the validator rejects a neutral-by-omission cell (absent state)', () => {
  const api = loadProductionApi();
  const composed = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(composed.ok, true);
  const tampered = structuredClone(composed.value);
  delete tampered.rows[0].cells[0].state;
  const result = api.validatePublicMatrix(tampered);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'RLMKT-CELL');
});

test('SCN-012-022 sentinel: compose+validate touches no fetch/providerFetch/storage and reads no Feature 008 key', () => {
  const calls = [];
  const throwOnUse = (name) => new Proxy(function () { calls.push(name); throw new Error(`sentinel: ${name} must not be called by rlmarketaction`); }, {
    get(_target, prop) { calls.push(`${name}.${String(prop)}`); throw new Error(`sentinel: ${name}.${String(prop)} accessed`); }
  });
  const saved = {};
  for (const key of ['fetch', 'localStorage', 'sessionStorage', 'XMLHttpRequest', 'RLDATA', 'RLAPP']) {
    saved[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value: throwOnUse(key), configurable: true, writable: true });
  }
  try {
    const api = loadProductionApi();
    const composed = api.composePublicMatrix(makeMatrixInput(api));
    assert.equal(composed.ok, true, 'compose must succeed under storage/request sentinels');
    const validated = api.validatePublicMatrix(composed.value);
    assert.equal(validated.ok, true, 'validate must succeed under storage/request sentinels');
    assert.deepEqual(calls, [], `pure composer touched a forbidden capability: ${calls.join(', ')}`);
  } finally {
    for (const key of Object.keys(saved)) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]);
      else delete globalThis[key];
    }
  }
});

test('storage-write sentinel: composing the matrix leaves watchlist.json byte-identical', () => {
  const api = loadProductionApi();
  const before = createHash('sha256').update(readFileSync(watchlistUrl)).digest('hex');
  const result = api.composePublicMatrix(makeMatrixInput(api));
  assert.equal(result.ok, true);
  const after = createHash('sha256').update(readFileSync(watchlistUrl)).digest('hex');
  assert.equal(after, before, 'the public matrix composer must never write watchlist.json');
});
