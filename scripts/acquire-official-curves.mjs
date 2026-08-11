#!/usr/bin/env node

/**
 * Tier-A official curve acquisition (spec 018 Scope 2).
 *
 * Fetches four responses — nominal and real daily Treasury yield-curve CSVs for
 * the current and prior UTC calendar years — from URLs derived from the
 * COMMITTED `urlTemplate` values. No Treasury URL literal exists in this file;
 * `bond-regime-universe.json` remains the single definition.
 *
 * Parsing is the page's own `parseTreasuryCurveCsv`, loaded by name. Nothing
 * about the CSV shape is re-implemented here, so the browser's whole-family
 * rejection is observed rather than restated.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { loadToolFunctions } from './brief-refresh.mjs';

export const ARTIFACT_RELATIVE_PATH = join('data', 'curves', 'us-treasury', 'curve.json');
export const CONTRACT_VERSION = 'official-curve-artifact/v1';
export const ADAPTER_ID = 'official-curve-acquisition';
export const ADAPTER_VERSION = 'official-curve-acquisition/v1';
export const FRESHNESS_POLICY_ID = 'observed-cadence/v1';
export const USER_AGENT = 'research-lab-official-curve-acquisition/1.0 (+https://github.com/pkirsanov/research-lab)';

const FAMILIES = Object.freeze([
  Object.freeze({ key: 'nominal', policyKey: 'nominalCurve', curveKind: 'nominal', absentCode: 'BRL-CURVE-NOMINAL-UNAVAILABLE' }),
  Object.freeze({ key: 'real', policyKey: 'realCurve', curveKind: 'real', absentCode: 'BRL-OPTIONAL-UNAVAILABLE' })
]);

export const FRESHNESS_POLICY = Object.freeze({
  policyId: FRESHNESS_POLICY_ID,
  cadenceWindowRows: 10,
  minCadenceObservations: 5,
  publicationLagDays: 1
});

/** `missingHeaders` values the parser uses for "no usable document at all". */
const STRUCTURAL_MISSING = Object.freeze(['Date', 'data rows']);

function sha256Hex(text) {
  return 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex');
}

function readJsonIfPresent(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function requestPathOf(url) {
  return new URL(url).pathname;
}

function queryOf(url) {
  const query = {};
  new URL(url).searchParams.forEach((value, key) => { query[key] = value; });
  return query;
}

function provenanceEnvelope(sourceId, url, body, retrievedAt) {
  return {
    contractVersion: 'source-provenance/v1',
    sourceId,
    sourceKind: 'official-report',
    accessClass: 'public-official',
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
    sourceUsePolicyId: 'us-treasury-public-official',
    sourceUseReviewRef: 'specs/018-headless-official-curve-publication',
    freshnessPolicy: FRESHNESS_POLICY_ID,
    sourceUrl: url,
    requestDescriptor: { method: 'GET', path: requestPathOf(url), query: queryOf(url) },
    // The publication instant is not in the response, and inventing one would
    // put a fabricated timestamp behind a provenance claim.
    sourcePublishedAt: null,
    retrievedAt,
    contentSha256: sha256Hex(body),
    retentionMode: 'normalized-facts-and-hash',
    freshnessState: 'current',
    diagnostics: []
  };
}

/**
 * Carries a prior family forward WITHOUT restamping it. `retrievedAt` keeps the
 * instant the data was actually retrieved; advancing it would make a stale
 * record claim to be fresh, which is the failure this rule exists to prevent.
 */
function carryForward(priorFamily) {
  const carried = JSON.parse(JSON.stringify(priorFamily));
  carried.carriedForward = true;
  const diagnostics = Array.isArray(carried.diagnostics) ? carried.diagnostics.slice() : [];
  if (!diagnostics.includes('carried-forward-from-prior-artifact')) {
    diagnostics.push('carried-forward-from-prior-artifact');
  }
  carried.diagnostics = diagnostics;
  return carried;
}

function unavailableFamily(spec, declaredPolicy, coverageYears, errorCode, diagnostics) {
  return {
    sourceId: declaredPolicy.id,
    state: 'unavailable',
    errorCode,
    coverageYears,
    observedAt: null,
    declaredPolicy,
    persistence: 'same-origin-artifact',
    rights: 'public-official',
    rows: [],
    provenance: [],
    carriedForward: false,
    diagnostics
  };
}

export async function acquireOfficialCurves(options = {}) {
  const root = options.root || process.cwd();
  const now = options.now instanceof Date ? options.now : new Date();
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const universe = JSON.parse(readFileSync(join(root, 'bond-regime-universe.json'), 'utf8'));

  const currentYear = now.getUTCFullYear();
  const coverageYears = [currentYear - 1, currentYear];

  // Loaded by name from the page. `finiteNumber` comes along because the parser
  // closes over it.
  const page = loadToolFunctions('bond-regime-lab.html', ['finiteNumber', 'parseTreasuryCurveCsv']);
  if (typeof page.parseTreasuryCurveCsv !== 'function' || typeof page.finiteNumber !== 'function') {
    throw new Error('bond-regime-lab.html did not yield finiteNumber and parseTreasuryCurveCsv');
  }

  const priorArtifact = Object.prototype.hasOwnProperty.call(options, 'priorArtifact')
    ? options.priorArtifact
    : readJsonIfPresent(join(root, ARTIFACT_RELATIVE_PATH));

  const requests = [];
  const families = {};

  for (const spec of FAMILIES) {
    const declaredPolicy = universe.sourcePolicies[spec.policyKey];
    const responses = [];

    for (const year of coverageYears) {
      const url = String(declaredPolicy.urlTemplate).split('{YEAR}').join(String(year));
      requests.push({ url, method: 'GET', headers: { 'User-Agent': USER_AGENT } });
      let body = null;
      try {
        const response = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!response || !response.ok) throw new Error('http ' + (response ? response.status : 'no-response'));
        body = await response.text();
      } catch {
        body = null;
      }
      responses.push({ url, body, retrievedAt: new Date(now.getTime()).toISOString() });
    }

    let rows = [];
    let parsedCount = 0;
    let maturityMissing = null;
    let sawParseFailure = false;
    const provenance = [];

    for (const response of responses) {
      if (response.body === null) continue;
      const parsed = page.parseTreasuryCurveCsv(response.body, spec.curveKind);
      if (parsed.ok) {
        rows = rows.concat(parsed.rows);
        parsedCount += 1;
        provenance.push(provenanceEnvelope(declaredPolicy.id, response.url, response.body, response.retrievedAt));
        continue;
      }
      const missing = (parsed.missingHeaders || []).filter((header) => !STRUCTURAL_MISSING.includes(header));
      if (missing.length) maturityMissing = missing;
      else sawParseFailure = true;
    }

    // The browser's own by-date collapse, so the two years merge identically.
    const byDate = {};
    rows.forEach((row) => { byDate[row.date] = row; });
    rows = Object.keys(byDate).sort().map((date) => byDate[date]);

    if (parsedCount && rows.length) {
      families[spec.key] = {
        sourceId: declaredPolicy.id,
        state: 'fresh',
        errorCode: null,
        coverageYears,
        observedAt: rows[rows.length - 1].date,
        declaredPolicy,
        persistence: 'same-origin-artifact',
        rights: 'public-official',
        rows,
        provenance,
        carriedForward: false,
        diagnostics: []
      };
      continue;
    }

    const priorFamily = priorArtifact && priorArtifact.families ? priorArtifact.families[spec.key] : null;
    if (priorFamily && priorFamily.state === 'fresh' && Array.isArray(priorFamily.rows) && priorFamily.rows.length) {
      families[spec.key] = carryForward(priorFamily);
      continue;
    }

    let errorCode = spec.absentCode;
    const diagnostics = [];
    if (maturityMissing) {
      errorCode = 'BRL-CURVE-MATURITY-MISSING';
      diagnostics.push('missing-headers:' + maturityMissing.join('|'));
    } else if (sawParseFailure) {
      errorCode = 'BRL-CURVE-PARSE-FAILED';
    } else {
      diagnostics.push('BRL-CURVE-FETCH-FAILED');
    }
    families[spec.key] = unavailableFamily(spec, declaredPolicy, coverageYears, errorCode, diagnostics);
  }

  const artifact = {
    contractVersion: CONTRACT_VERSION,
    generatedAt: new Date(now.getTime()).toISOString(),
    freshnessPolicy: { ...FRESHNESS_POLICY },
    families
  };

  return { artifact, requests };
}

export function writeOfficialCurveArtifact(artifact, options = {}) {
  const root = options.root || process.cwd();
  const target = join(root, ARTIFACT_RELATIVE_PATH);
  mkdirSync(dirname(target), { recursive: true });
  const body = JSON.stringify(artifact, null, 2) + '\n';
  // Written through a temp file so a reader never observes a half-written artifact.
  const temporary = target + '.tmp';
  writeFileSync(temporary, body, 'utf8');
  renameSync(temporary, target);
  return { path: ARTIFACT_RELATIVE_PATH, bytes: Buffer.byteLength(body, 'utf8') };
}

async function main(argv) {
  const dryRun = argv.includes('--dry-run');
  const { artifact } = await acquireOfficialCurves({ root: process.cwd() });
  const states = Object.entries(artifact.families)
    .map(([key, family]) => `${key}=${family.state}${family.carriedForward ? '(carried)' : ''}`)
    .join(' ');
  if (dryRun) {
    console.log(`[official-curves] DRY-RUN: ${states}; nothing written`);
    return 0;
  }
  const written = writeOfficialCurveArtifact(artifact, { root: process.cwd() });
  console.log(`[official-curves] wrote ${written.path} (${written.bytes} bytes): ${states}`);
  return 0;
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('acquire-official-curves.mjs');
if (invokedDirectly) main(process.argv.slice(2)).then((code) => process.exit(code));
