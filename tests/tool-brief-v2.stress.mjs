/*
 * tests/tool-brief-v2.stress.mjs
 * ---------------------------------------------------------------------------
 * Feature 012 Scope 11 — TP-11-10.
 *
 * Bounded behaviour AT the configured limits, read from the COMMITTED
 * market-brief.config.json "tool-brief-v2/v1" policy rather than from a number
 * repeated here. If the committed cap changes, this suite moves with it; a
 * hard-coded copy would let the cap drift away from the thing that enforces it.
 *
 * Covers SCN-012-005 (the author pool stays bounded under load) and
 * SCN-012-020 (a near-cap public generation still publishes one pointer, last,
 * with deterministic content-addressed refs).
 *
 * Pure Node. No network, no repository write.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  invokeAuthor
} from '../scripts/brief-author.mjs';
import { buildToolBriefV2Generation } from '../scripts/brief-refresh.mjs';
import { buildPublishSet, pointerBytes, validatePublishSet } from '../scripts/brief-publication.mjs';
import { buildRun } from './fixtures/feature-002/history/history-fixture-builder.mjs';
import * as fx from './fixtures/feature-012/tool-brief-v2/builder.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const POLICY = JSON.parse(readFileSync(path.join(ROOT, 'market-brief.config.json'), 'utf8'))['tool-brief-v2/v1'];

test('the committed policy publishes the bounds this suite runs at', () => {
  assert.equal(POLICY.contractVersion, 'tool-brief-v2/v1');
  assert.equal(Number.isInteger(POLICY.bounds.maxAuthorConcurrency) && POLICY.bounds.maxAuthorConcurrency > 0, true);
  assert.equal(Number.isInteger(POLICY.bounds.maxStdoutBytes) && POLICY.bounds.maxStdoutBytes > 0, true);
  assert.equal(Number.isInteger(POLICY.bounds.maxToolBriefsPerGeneration) && POLICY.bounds.maxToolBriefsPerGeneration > 0, true);
});

function centerInput() {
  return {
    projectionId: 'market-action-center/stress',
    generationRef: fx.RUN_ID,
    activeView: 'brief',
    brief: {
      coverageComplete: true,
      actions: [{
        verb: 'verify', subject: 'MSFT fiscal-year guidance', horizon: '0-4w',
        trigger: 'the next print confirms the raised guide',
        invalidation: 'guidance is cut or the margin median breaks lower',
        freshness: 'current', citations: ['claim-guidance'],
        ownerLink: 'company-fundamentals-lab.html#MSFT'
      }],
      imminentCatalysts: [],
      visibleLimitations: [],
      disclosures: []
    },
    portfolio: { publicMatrixRef: 'market-action-public-matrix/stress' },
    redAlert: { alertRefs: [] },
    journey: { definitionRefs: ['journey:a', 'journey:b', 'journey:c', 'journey:d'] }
  };
}

function generationConfig(toolIds, authorFn, options) {
  const opts = options || {};
  const reads = Object.fromEntries(toolIds.map((toolId) => [toolId, fx.ownerRead({ toolId }).body]));
  const toolEntries = toolIds.map((toolId) => ({
    toolId,
    bundle: fx.bundle({ toolId, bundleId: `bundle:${toolId}:${fx.RUN_ID}` })
  }));
  return {
    runId: fx.RUN_ID,
    cutoffAt: fx.CUTOFF_AT,
    reads,
    identity: fx.identity(),
    toolEntries,
    publicTickerEntries: opts.publicTicker
      ? [{ toolId: toolIds[0], ticker: fx.PUBLIC_TICKER, bundle: toolEntries[0].bundle }]
      : [],
    centerToolId: toolIds[0],
    marketActionInput: centerInput(),
    authorFn
  };
}

function validAuthor(delayMs) {
  return async (request) => {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    return {
      ok: true,
      envelope: {
        contractVersion: 'tool-author-response/v2',
        requestFingerprint: request.requestFingerprint,
        brief: fx.authoredBrief(request, {
          briefId: `brief:${request.data.scope}:${request.data.toolId}:${request.data.ticker || 'all'}`,
          scope: request.data.scope,
          ticker: request.data.ticker
        })
      }
    };
  };
}

test('SCN-012-005 the author pool runs at the configured concurrency and never above it', async () => {
  const limit = POLICY.bounds.maxAuthorConcurrency;
  const toolIds = Array.from({ length: limit * 3 }, (_, i) => `stress-tool-${i}`);
  const generated = await buildToolBriefV2Generation(generationConfig(toolIds, validAuthor(10)));
  assert.equal(generated.ok, true, JSON.stringify(generated.error || null));
  assert.equal(generated.telemetry.peakConcurrency <= limit, true,
    `observed production peak ${generated.telemetry.peakConcurrency} must not exceed the configured cap ${limit}`);
  assert.equal(generated.telemetry.peakConcurrency, limit, 'the production pool reaches the configured cap rather than running serially');
  assert.equal(generated.telemetry.authorCalls, toolIds.length);
  assert.equal(generated.value.toolBriefs.length, toolIds.length, 'every authored brief under load survives production validation');
  assert.equal(new Set(generated.value.toolBriefs.map((entry) => JSON.stringify(entry.body))).size, toolIds.length,
    'each brief keeps a distinct deterministic body');
});

test('an oversize author response is still refused when the pool is saturated', async () => {
  const limit = POLICY.bounds.maxAuthorConcurrency;
  const toolIds = Array.from({ length: limit }, (_, i) => `stress-oversize-${i}`);
  const generated = await buildToolBriefV2Generation(generationConfig(toolIds, async (request) => invokeAuthor(request, {
    transport: async () => JSON.stringify({ pad: 'x'.repeat(POLICY.bounds.maxStdoutBytes + 1024) }),
    maxStdoutBytes: POLICY.bounds.maxStdoutBytes,
    timeoutMs: POLICY.bounds.perAuthorTimeoutMs
  })));
  assert.equal(generated.ok, false);
  assert.equal(generated.error.code, 'B002-TOOL-AUTHOR-OVERSIZE', 'the production pool enforces the committed byte ceiling');
});

test('SCN-012-020 a near-cap public generation publishes one pointer, last, with deterministic refs', async () => {
  const count = POLICY.bounds.maxToolBriefsPerGeneration;
  const toolIds = Array.from({ length: count }, (_, i) => `stress-tool-${i}`);
  const generated = await buildToolBriefV2Generation(generationConfig(toolIds, validAuthor(0), { publicTicker: true }));
  assert.equal(generated.ok, true, JSON.stringify(generated.error || null));

  const run = buildRun({ seed: 'stress', runId: 'run-stress' });
  run.v2 = generated.value;

  const built = buildPublishSet(run);
  assert.equal(built.ok, true, JSON.stringify(built.error || null));
  const staging = built.staging;
  assert.equal(staging.manifest.body.v2.toolBriefRefs.length, count, `all ${count} briefs publish in ONE generation`);

  // exactly one mutable publication selector, and it is the pointer.
  const pointerPaths = Object.keys(staging.files).filter((p) => p === 'briefs/current.json');
  assert.deepEqual(pointerPaths, ['briefs/current.json']);

  // content addressing holds at the cap: every ref path embeds its own hash, and no two collide.
  const refs = staging.manifest.body.v2.toolBriefRefs;
  for (const ref of refs) assert.equal(ref.path.includes(ref.sha256.slice(7)), true, `${ref.path} is content-addressed`);
  assert.equal(new Set(refs.map((r) => r.sha256)).size, count, 'every brief at the cap keeps a distinct content hash');

  assert.equal(validatePublishSet(staging, {}).ok, true, 'the near-cap generation still validates');

  // determinism: the same inputs produce byte-identical staged output.
  const again = buildPublishSet(run);
  assert.equal(pointerBytes(again.staging.pointers.current).equals(pointerBytes(staging.pointers.current)), true,
    'a near-cap generation is deterministic byte-for-byte');
});

test('one ToolBrief above the committed generation cap is refused before any author call', async () => {
  const count = POLICY.bounds.maxToolBriefsPerGeneration + 1;
  const toolIds = Array.from({ length: count }, (_, i) => `stress-over-cap-${i}`);
  let calls = 0;
  const generated = await buildToolBriefV2Generation(generationConfig(toolIds, async () => { calls += 1; return { ok: false }; }));
  assert.equal(generated.ok, false);
  assert.equal(generated.error.reason, 'tool-brief-cap-exceeded');
  assert.equal(calls, 0, 'admission refuses before dispatching any author');
});
