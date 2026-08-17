/*
 * Feature 001 Scope 06 — SCN-001-F02 adversarial integrity.
 *
 * Every fixture below is REJECTION-ONLY: it mutates a deep copy of the committed inputs to
 * introduce exactly one integrity failure, and asserts the production validator refuses it with
 * its own structured code. No fixture asserts a favourable outcome, and none fabricates a
 * successful market history.
 *
 * The discipline that matters: a failure must never degrade into a neutral score, a current
 * stage, an action slot, or a recorded success. "Unavailable" and "excluded" are the only
 * acceptable shapes, and each must be reachable for its own distinct reason.
 */
import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8'
};

let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-store' });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  if (server) await new Promise((done) => server.close(done));
});

test('Regression: Multiple integrity failures are introduced independently', async ({ page }) => {
  await page.goto(`${baseUrl}/causal-rotation-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  const outcome = await page.evaluate(async () => {
    const config = await (await fetch('causal-rotation.config.json', { cache: 'no-store' })).json();
    const observations = await (await fetch('causal-rotation-observations.json', { cache: 'no-store' })).json();
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const codesOf = (errors) => Array.from(new Set((errors || []).map((entry) => entry.code)));
    const results = {};

    /* 1. CONTROL — the unmutated committed corpus must validate, otherwise every rejection
          below could be caused by the baseline rather than by the injected fault. */
    results.control = {
      configOk: window.RLCausal.validateConfig(config).ok,
      observationsOk: window.RLCausal.validateObservationSet(observations, config).ok
    };

    /* 2. Unknown observation-set contract version. */
    const unknownVersion = clone(observations);
    unknownVersion.contractVersion = 'causal-observation-set/v999';
    results.unknownVersion = codesOf(window.RLCausal.validateObservationSet(unknownVersion, config).errors);

    /* 3. Missing/incomplete source on a real observation. */
    const missingSource = clone(observations);
    delete missingSource.observations[0].source.publisher;
    results.missingSource = codesOf(window.RLCausal.validateObservationSet(missingSource, config).errors);

    /* 4. availableAt predating publication — the shape anti-hindsight exists to refuse. */
    const timeIneligible = clone(observations);
    timeIneligible.observations[0].availableAt = '1999-01-01T00:00:00Z';
    results.timeIneligible = codesOf(window.RLCausal.validateObservationSet(timeIneligible, config).errors);

    /* 5. Conflicting identity: same id+version, different content. */
    const conflicting = clone(observations);
    const duplicate = clone(conflicting.observations[0]);
    duplicate.summary = (duplicate.summary || '') + ' MUTATED';
    conflicting.observations.push(duplicate);
    results.conflictingIdentity = codesOf(window.RLCausal.validateObservationSet(conflicting, config).errors);

    /* 6. Unknown dependency reference. */
    const badDependency = clone(observations);
    badDependency.observations[0].dependencyIds = ['obs:does-not-exist'];
    results.badDependency = codesOf(window.RLCausal.validateObservationSet(badDependency, config).errors);

    /* 7. Unknown config contract. */
    const badConfig = clone(config);
    badConfig.schemaVersion = 'causal-config/v999';
    results.badConfig = codesOf(window.RLCausal.validateConfig(badConfig).errors);

    /* 8. Anti-hindsight at EVALUATION time: evidence that became available after the as-of
          instant must be excluded, not quietly counted. */
    const hypothesis = observations.hypotheses[0];
    const early = window.RLCausal.eligibleEvidence(hypothesis, '1999-01-01T00:00:00Z', observations);
    results.hindsight = {
      eligibleCount: (early.eligible || []).length,
      excludedCodes: Array.from(new Set((early.excluded || []).map((entry) => entry.code)))
    };

    /* 9. A stale/unavailable timing read must not manufacture a market state. */
    const unavailableTiming = window.RLCausal.evaluateAll({
      config, observationSet: observations, asOf: '2026-07-12T22:00:00Z',
      sensitivityPosture: 'discovery', riskOverlay: 'none', timingReads: []
    });
    results.timing = {
      candidateCount: (unavailableTiming.candidates || []).length,
      anyPlanEligible: (unavailableTiming.candidates || []).some((candidate) => candidate.planEligible === true)
    };

    /* 10. A ledger event whose bytes were rewritten in place must be refused. */
    const wrap = (eventType, eventId, recordedAt, payload) => {
      const event = { contractVersion: config.contracts.ledgerEvent, eventType, eventId, recordedAt, payload };
      event.contentDigest = window.RLCausal.digestRecord(event);
      return event;
    };
    const decisionEvent = wrap('decision', 'evt:adv:d', '2026-07-12T22:00:00Z', { decisionId: 'dec:adv' });
    const tampered = JSON.parse(JSON.stringify(decisionEvent));
    tampered.payload.decisionId = 'dec:adv-mutated';
    const ledger = window.RLCausal.parseLedger(JSON.stringify(tampered) + '\n', config);
    results.ledgerTamper = { ok: ledger.ok, codes: codesOf(ledger.errors) };

    return results;
  });

  /* The control proves the baseline is valid, so each rejection below is caused by its fault. */
  expect(outcome.control.configOk, 'committed config must validate unmutated').toBe(true);
  expect(outcome.control.observationsOk, 'committed observations must validate unmutated').toBe(true);

  /* Each independent failure carries its OWN structured code. */
  expect(outcome.unknownVersion).toContain('CR-SCHEMA-INVALID');
  expect(outcome.missingSource).toContain('CR-SOURCE-INCOMPLETE');
  expect(outcome.timeIneligible).toContain('CR-TIME-INELIGIBLE');
  expect(outcome.conflictingIdentity).toContain('CR-CONFLICTING-IDENTITY');
  expect(outcome.badDependency).toContain('CR-CLUSTER-INVALID');
  expect(outcome.badConfig).toContain('CR-CONFIG-INVALID');
  expect(outcome.ledgerTamper.ok).toBe(false);
  expect(outcome.ledgerTamper.codes).toContain('CR-CONFLICTING-IDENTITY');

  /* Anti-hindsight: nothing is eligible before it existed, and the exclusion is explicit. */
  expect(outcome.hindsight.eligibleCount).toBe(0);
  expect(outcome.hindsight.excludedCodes).toContain('CR-TIME-INELIGIBLE');

  /* Absent timing must never manufacture plan eligibility. */
  expect(outcome.timing.anyPlanEligible).toBe(false);

  /* Unrelated owner tools remain usable after every adversarial evaluation. */
  await page.goto(`${baseUrl}/sector-research-lab.html`);
  await expect(page.locator('#modeSeg, [data-rlview-mode]').first()).toBeAttached();
  const sectorErrors = [];
  page.on('pageerror', (error) => sectorErrors.push(error.message));
  await page.waitForTimeout(500);
  expect(sectorErrors).toEqual([]);
});
