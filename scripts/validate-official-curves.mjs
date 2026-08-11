#!/usr/bin/env node

/**
 * Gate for `official-curve-artifact/v1` (spec 018 Scope 1).
 *
 * Runs OFFLINE against a committed artifact. It never fetches, so `contentSha256`
 * is an audit anchor rather than a verified digest, and check 11 says so.
 *
 * Provenance rules are NOT restated here — every envelope goes through
 * `validateSourceProvenance` in `rlcontracts.js`. The one rule this gate owns is
 * the source-id-to-query binding, which the frozen contract structurally cannot
 * express: both Treasury families share one host, one method and one path prefix,
 * so nothing in the shared validator can tell a nominal envelope from a real one.
 */

import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

export const OFFICIAL_CURVE_CONTRACT_VERSION = 'official-curve-artifact/v1';
export const OFFICIAL_CURVE_HOST = 'home.treasury.gov';

/** Mirrors the browser's own required column map at `bond-regime-lab.html:1529`. */
export const REQUIRED_MATURITIES = Object.freeze({
  'us-treasury-nominal': Object.freeze(['y3m', 'y2', 'y5', 'y10', 'y30']),
  'us-treasury-real': Object.freeze(['y5', 'y10', 'y20', 'y30'])
});

/** The binding the frozen provenance contract cannot express. */
export const REQUIRED_QUERY_TYPE = Object.freeze({
  'us-treasury-nominal': 'daily_treasury_yield_curve',
  'us-treasury-real': 'daily_treasury_real_yield_curve'
});

export const FAMILY_SOURCE_IDS = Object.freeze({
  nominal: 'us-treasury-nominal',
  real: 'us-treasury-real'
});

const UNIVERSE_POLICY_KEYS = Object.freeze({ nominal: 'nominalCurve', real: 'realCurve' });
const FAMILY_KEYS = Object.freeze(['nominal', 'real']);
const FAMILY_STATES = Object.freeze(['fresh', 'unavailable']);
const REQUIRED_FAMILY_FIELDS = Object.freeze([
  'sourceId', 'state', 'errorCode', 'coverageYears', 'observedAt',
  'declaredPolicy', 'persistence', 'rights', 'rows', 'provenance'
]);
const REQUIRED_FRESHNESS_FIELDS = Object.freeze([
  'policyId', 'cadenceWindowRows', 'minCadenceObservations', 'publicationLagDays'
]);

const CREDENTIAL_KEY = /(?:authorization|cookie|credential|key|password|secret|token)/i;
const RESTRICTED_RIGHTS = 'restricted-local-view';
const RESTRICTED_FAMILY_KEYS = Object.freeze(['oas', 'financialConditions']);
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Walks every key and string value EXACTLY once; used by the restriction and credential sweeps. */
function walkEntries(value, path, visit) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      const childPath = `${path}[${index}]`;
      // Scalars have no parent key of their own, so the array element visits them.
      if (isPlainObject(entry) || Array.isArray(entry)) walkEntries(entry, childPath, visit);
      else visit({ path: childPath, key: null, value: entry });
    });
    return;
  }
  if (!isPlainObject(value)) return;
  for (const key of Object.keys(value)) {
    const childPath = `${path}.${key}`;
    visit({ path: childPath, key, value: value[key] });
    walkEntries(value[key], childPath, visit);
  }
}

export function validateOfficialCurves(artifact, options = {}) {
  const errors = [];
  const universe = options.universe || null;
  const add = (code, where, detail) => {
    errors.push(`${code} at ${where}${detail ? ` — ${detail}` : ''}`);
  };

  // Check 1 — contract identity.
  if (!isPlainObject(artifact)) {
    add('artifact-not-an-object', 'artifact');
    return errors;
  }
  if (artifact.contractVersion !== OFFICIAL_CURVE_CONTRACT_VERSION) {
    add('contract-version-invalid', 'artifact.contractVersion',
      `expected ${OFFICIAL_CURVE_CONTRACT_VERSION}`);
  }

  // The artifact declares its own freshness window rather than leaving it to a consumer.
  const freshness = artifact.freshnessPolicy;
  if (!isPlainObject(freshness)) {
    add('freshness-policy-missing', 'artifact.freshnessPolicy');
  } else {
    for (const field of REQUIRED_FRESHNESS_FIELDS) {
      if (freshness[field] === undefined || freshness[field] === null) {
        add('freshness-policy-field-missing', `artifact.freshnessPolicy.${field}`);
      }
    }
  }

  // Check 2 — both families present with every required field.
  const families = artifact.families;
  if (!isPlainObject(families)) {
    add('families-missing', 'artifact.families');
    return errors;
  }

  for (const familyKey of FAMILY_KEYS) {
    const family = families[familyKey];
    const where = `artifact.families.${familyKey}`;
    if (!isPlainObject(family)) {
      add('family-missing', where);
      continue;
    }
    for (const field of REQUIRED_FAMILY_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(family, field)) {
        add('family-field-missing', `${where}.${field}`);
      }
    }

    const expectedSourceId = FAMILY_SOURCE_IDS[familyKey];
    if (family.sourceId !== expectedSourceId) {
      add('source-id-invalid', `${where}.sourceId`, `expected ${expectedSourceId}`);
    }

    // Check 3 — state is closed, and a non-fresh family must name its cause.
    if (!FAMILY_STATES.includes(family.state)) {
      add('family-state-invalid', `${where}.state`, `expected one of ${FAMILY_STATES.join(', ')}`);
    } else if (family.state !== 'fresh' && (family.errorCode === null || family.errorCode === undefined)) {
      add('family-error-code-missing', `${where}.errorCode`, 'a non-fresh family must name its cause');
    }

    // Check 6 — the copy states its own retention; the declared policy travels verbatim.
    if (family.persistence !== 'same-origin-artifact') {
      add('family-persistence-invalid', `${where}.persistence`,
        'a committed artifact is same-origin-artifact, not the browser policy value');
    }
    if (family.rights !== 'public-official') {
      add('family-rights-invalid', `${where}.rights`);
    }
    if (universe) {
      const declared = ((universe.sourcePolicies || {})[UNIVERSE_POLICY_KEYS[familyKey]]) || null;
      if (!declared) {
        add('universe-policy-missing', `universe.sourcePolicies.${UNIVERSE_POLICY_KEYS[familyKey]}`);
      } else {
        if (declared.id !== family.sourceId) {
          add('source-id-universe-mismatch', `${where}.sourceId`,
            `universe declares ${declared.id}`);
        }
        if (JSON.stringify(family.declaredPolicy) !== JSON.stringify(declared)) {
          add('declared-policy-mismatch', `${where}.declaredPolicy`,
            'must hold the committed policy block byte-for-byte');
        }
      }
    }

    // Check 7 — exactly two consecutive coverage years.
    const coverage = family.coverageYears;
    let coverageOk = false;
    if (!Array.isArray(coverage) || coverage.length !== 2
      || !coverage.every((year) => Number.isInteger(year))
      || coverage[1] - coverage[0] !== 1) {
      add('coverage-years-invalid', `${where}.coverageYears`,
        'expected exactly two consecutive years');
    } else {
      coverageOk = true;
    }

    // Checks 8 and 9 — row shape, ordering, completeness and the observedAt anchor.
    const rows = family.rows;
    const required = REQUIRED_MATURITIES[expectedSourceId] || [];
    if (!Array.isArray(rows)) {
      add('rows-invalid', `${where}.rows`);
    } else {
      const seen = new Set();
      let previous = null;
      rows.forEach((row, index) => {
        const rowWhere = `${where}.rows[${index}]`;
        if (!isPlainObject(row) || !DATE_PATTERN.test(row.date || '')) {
          add('row-date-invalid', rowWhere);
          return;
        }
        if (seen.has(row.date)) add('row-date-duplicate', rowWhere, row.date);
        seen.add(row.date);
        if (previous !== null && row.date <= previous) {
          add('rows-not-ascending', rowWhere, `${row.date} follows ${previous}`);
        }
        previous = row.date;
        if (coverageOk) {
          const year = Number(row.date.slice(0, 4));
          if (year !== coverage[0] && year !== coverage[1]) {
            add('row-date-out-of-coverage', rowWhere, row.date);
          }
        }
        for (const maturity of required) {
          if (typeof row[maturity] !== 'number' || !Number.isFinite(row[maturity])) {
            add('row-partial', `${rowWhere}.${maturity}`,
              'every row must carry the family\'s full required maturity set');
          }
        }
      });

      const newest = rows.length ? rows[rows.length - 1].date : null;
      const expectedObservedAt = rows.length ? newest : null;
      if ((family.observedAt || null) !== expectedObservedAt) {
        add('observed-at-mismatch', `${where}.observedAt`,
          `expected ${expectedObservedAt === null ? 'null' : expectedObservedAt}`);
      }
    }

    // Checks 4, 5 and 11 — provenance, query binding, and the audit anchor.
    const provenance = family.provenance;
    if (!Array.isArray(provenance) || provenance.length === 0) {
      add('provenance-missing', `${where}.provenance`);
      continue;
    }
    provenance.forEach((envelope, index) => {
      const envelopeWhere = `${where}.provenance[${index}]`;
      const result = RLCONTRACTS.validateSourceProvenance(envelope);
      if (result && result.ok === false) {
        const reason = (result.error && result.error.reason) || 'unknown';
        const field = (result.error && result.error.field) || 'source';
        add(`provenance-invalid:${reason}`, `${envelopeWhere}.${field}`);
        return;
      }
      if (envelope.sourceId !== expectedSourceId) {
        add('provenance-source-id-mismatch', `${envelopeWhere}.sourceId`);
      }
      const expectedType = REQUIRED_QUERY_TYPE[expectedSourceId];
      const actualType = ((envelope.requestDescriptor || {}).query || {}).type;
      if (actualType !== expectedType) {
        add('source-id-to-query-binding-invalid', `${envelopeWhere}.requestDescriptor.query.type`,
          `${expectedSourceId} requires type=${expectedType}, found ${actualType === undefined ? 'none' : actualType}`);
      }
      if (!HASH_PATTERN.test(envelope.contentSha256 || '')) {
        add('content-sha256-invalid', `${envelopeWhere}.contentSha256`,
          'audit anchor only — this gate runs offline and does not re-fetch to verify it');
      }
    });
  }

  // Check 10 — rights and restriction sweep over the WHOLE artifact.
  walkEntries(artifact, 'artifact', ({ path, key, value }) => {
    if (key && RESTRICTED_FAMILY_KEYS.includes(key)) {
      add('restricted-observation-present', path, `${key} is restricted-local-view and must never be published`);
    }
    if (key && CREDENTIAL_KEY.test(key)) {
      add('secret-shaped-field', path);
    }
    if (typeof value !== 'string') return;
    if (value === RESTRICTED_RIGHTS) {
      add('restricted-rights-present', path);
    }
    if (/^https?:\/\//i.test(value)) {
      let host = null;
      try {
        host = new URL(value).hostname;
      } catch {
        add('source-url-unparsable', path);
        return;
      }
      if (host !== OFFICIAL_CURVE_HOST) {
        add('off-host-source-url', path, `${host} is not ${OFFICIAL_CURVE_HOST}`);
      }
    }
  });

  return errors;
}

function readJson(path, errors) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`artifact-unparsable at ${relative(process.cwd(), path) || path} — ${error.message}`);
    return null;
  }
}

function main(argv) {
  const bypass = argv.find((arg) => /^--(skip|force|ignore|bypass|no-verify)/.test(arg));
  if (bypass) {
    console.error(`[official-curves] ${bypass} is not a flag on this gate and never will be.`);
    return 2;
  }
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  const artifactPath = resolve(process.cwd(), positional[0] || 'data/official-curves/official-curves.json');
  // Reported repo-relative: an absolute path would carry the operator's home
  // directory into any evidence block that quotes this output.
  const reportedPath = relative(process.cwd(), artifactPath) || artifactPath;
  const errors = [];

  if (!existsSync(artifactPath)) {
    console.error(`[official-curves] FAIL: artifact-missing at ${reportedPath}`);
    return 1;
  }
  const artifact = readJson(artifactPath, errors);
  let universe = null;
  const universePath = resolve(process.cwd(), 'bond-regime-universe.json');
  if (existsSync(universePath)) universe = readJson(universePath, errors);

  if (artifact) errors.push(...validateOfficialCurves(artifact, { universe }));

  if (errors.length) {
    console.error('[official-curves] FAIL');
    for (const error of errors) console.error('  - ' + error);
    return 1;
  }
  console.log(`[official-curves] PASS: ${reportedPath} satisfies ${OFFICIAL_CURVE_CONTRACT_VERSION}`);
  return 0;
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('validate-official-curves.mjs');
if (invokedDirectly) process.exit(main(process.argv.slice(2)));
