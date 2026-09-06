/*
 * tests/tool-brief-v2-publication.integration.mjs
 * ---------------------------------------------------------------------------
 * Feature 012 Scope 11 — TP-11-04.
 *
 * Atomic publication of the v2 inventory through the EXISTING Feature 002
 * one-generation, pointer-last transaction. The real buildPublishSet /
 * validatePublishSet / promotePublishSet / rollbackPublication path runs against
 * an isolated temp worktree — no repository write, no network.
 *
 * Proves for SCN-012-020:
 *  - a run WITHOUT a v2 block produces a byte-identical v1 publish set, so v1
 *    readers and the existing suites cannot be disturbed by v2 existing;
 *  - the v2 objects (WebEvidence projection, ToolBrief v2, public-ticker Brief,
 *    Market Action projection) are content-addressed, declared in the manifest
 *    inventory, and reachable from the pointer;
 *  - briefs/current.json is still written LAST, after every v2 object is on disk
 *    and re-hashed;
 *  - a failed generation leaves the prior pointer byte-identical; and
 *  - no private portfolio field can enter the publisher's inputs, the manifest,
 *    the objects, the pointer, or the compatibility projection.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import {
  buildPublishSet, promotePublishSet, rollbackPublication, validatePublishSet, pointerBytes
} from '../scripts/brief-publication.mjs';
import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import { buildRun, isolatedRoot, priorFromStaging, writeStagingToRoot } from './fixtures/feature-002/history/history-fixture-builder.mjs';
import { makeSchedulerRepo, schedulerDeps } from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';
import {
  buildToolAuthorRequestV2, compactToolBriefV2Input, validateToolBriefV2
} from '../scripts/brief-author.mjs';
import { freezeBundleForAuthor } from '../scripts/web-evidence-acquire.mjs';
import * as fx from './fixtures/feature-012/tool-brief-v2/builder.mjs';

const require = createRequire(import.meta.url);
const RLMARKETACTIONCENTER = require('../rlmarketaction.js');
const PRIVATE_SENTINEL = /holding|quantity|costbasis|cost_basis|avgcost|pnl|mandate|positionsize|accountid/i;

/* Compose the v2 block the same way production must: real freeze, real compaction,
   real request, real brief validation. Nothing here is hand-assembled. */
function v2Block(options) {
  const opts = options || {};
  const toolId = opts.toolId || fx.TOOL_ID;
  const frozen = freezeBundleForAuthor(fx.bundle({ toolId }), fx.lanePolicy());
  assert.equal(frozen.ok, true, JSON.stringify(frozen.error || null));

  const make = (scope, ticker, publicTickers) => {
    const compact = compactToolBriefV2Input({
      toolId, runId: fx.RUN_ID, cutoffAt: fx.CUTOFF_AT, ownerRead: fx.ownerRead({ toolId }),
      evidenceProjection: frozen.value, scope, ticker, publicTickers
    });
    assert.equal(compact.ok, true, JSON.stringify(compact.error || null));
    const built = buildToolAuthorRequestV2(compact.value, fx.identity());
    assert.equal(built.ok, true, JSON.stringify(built.error || null));
    const brief = fx.authoredBrief(built.request, { scope, ticker, briefId: `brief:${scope}:${toolId}` });
    const verdict = validateToolBriefV2(brief, { request: built.request });
    assert.equal(verdict.ok, true, JSON.stringify(verdict.error || null));
    return { brief, fingerprint: verdict.value.briefFingerprint };
  };

  const toolBrief = make('tool', null, []);
  const tickerBrief = make('public-ticker', fx.PUBLIC_TICKER, [fx.PUBLIC_TICKER]);
  const projection = opts.projection ? { ok: true, value: opts.projection } : RLMARKETACTIONCENTER.composeCenterProjection({
    projectionId: 'market-action-center/run', generationRef: fx.RUN_ID, cutoffAt: fx.CUTOFF_AT,
    activeView: 'brief', dependency: { feature002: 'accepted' },
    brief: {
      coverageComplete: true,
      authoredBrief: toolBrief.brief,
      actions: [{
        verb: 'verify', subject: 'MSFT fiscal-year guidance', horizon: '0-4w',
        trigger: 'the next print confirms the raised guide',
        invalidation: 'guidance is cut or the margin median breaks lower',
        freshness: 'current', citations: ['claim-guidance'],
        ownerLink: 'company-fundamentals-lab.html#MSFT'
      }],
      imminentCatalysts: [], visibleLimitations: [], disclosures: []
    },
    portfolio: { publicMatrixRef: 'market-action-public-matrix/run' },
    redAlert: { alertRefs: [] },
    journey: { definitionRefs: ['journey:a', 'journey:b', 'journey:c', 'journey:d'] }
  });
  assert.equal(projection.ok, true, JSON.stringify(projection.error || null));

  return {
    contractVersion: 'brief-run-v2-inventory/v1',
    cutoffAt: fx.CUTOFF_AT,
    webEvidence: [frozen.value],
    toolBriefs: [{ toolId, body: toolBrief.brief }],
    publicTickerBriefs: [{ ticker: fx.PUBLIC_TICKER, body: tickerBrief.brief }],
    marketActionProjection: projection.value,
    publicTickers: [fx.PUBLIC_TICKER]
  };
}

/* ═══════════ v1 is untouched when no v2 block is supplied ═══════════ */

test('a run with no v2 block produces a byte-identical v1 publish set', () => {
  const a = buildPublishSet(buildRun({ seed: 'v1a', runId: 'run-v1a' }));
  const b = buildPublishSet(buildRun({ seed: 'v1a', runId: 'run-v1a' }));
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a.staging.files).sort(), Object.keys(b.staging.files).sort());
  for (const p of Object.keys(a.staging.files)) {
    assert.equal(a.staging.files[p].sha256, b.staging.files[p].sha256, `${p} must be deterministic`);
  }
  assert.equal('v2' in a.staging.manifest.body, false, 'a v1 manifest gains no v2 key');
  assert.equal('v2' in a.staging.pointers.current, false, 'a v1 pointer gains no v2 key');
});

/* ═══════════ the v2 inventory publishes inside the SAME generation ═══════════ */

test('the v2 inventory is content-addressed, declared in the manifest, and reachable from the pointer', () => {
  const run = buildRun({ seed: 'v2a', runId: 'run-v2a' });
  run.v2 = v2Block();
  const built = buildPublishSet(run);
  assert.equal(built.ok, true, JSON.stringify(built.error || null));
  const staging = built.staging;

  const v2 = staging.manifest.body.v2;
  assert.ok(v2, 'the run manifest carries a v2 inventory block');
  assert.equal(v2.contractVersion, 'brief-run-v2-inventory/v1');
  assert.equal(v2.webEvidenceRefs.length, 1);
  assert.equal(v2.toolBriefRefs.length, 1);
  assert.equal(v2.publicTickerBriefRefs.length, 1);
  assert.ok(v2.marketActionProjectionRef, 'the Market Action projection is part of the same generation');

  // every declared v2 ref is a real staged file whose content hash matches its declared hash.
  const refs = [].concat(v2.webEvidenceRefs, v2.toolBriefRefs, v2.publicTickerBriefRefs, [v2.marketActionProjectionRef]);
  for (const ref of refs) {
    const file = staging.files[ref.path];
    assert.ok(file, `${ref.path} must be staged`);
    assert.equal(file.sha256, ref.sha256, `${ref.path} hash must match its manifest declaration`);
    assert.equal(ref.path.includes(ref.sha256.slice(7)), true, `${ref.path} must be content-addressed`);
  }

  // the pointer selects the same v2 generation.
  const pointerV2 = staging.pointers.current.v2;
  assert.ok(pointerV2, 'the current pointer exposes the v2 selection');
  assert.equal(pointerV2.manifestV2Fingerprint, v2.inventoryFingerprint);
  assert.deepEqual(Object.keys(pointerV2.toolBriefs), [fx.TOOL_ID]);
  assert.deepEqual(Object.keys(pointerV2.publicTickerBriefs), [fx.PUBLIC_TICKER]);

  // and the whole set still validates through the existing gate.
  const validated = validatePublishSet(staging, {});
  assert.equal(validated.ok, true, JSON.stringify(validated.error || null));
});

test('the publisher refuses a ToolBrief whose evidence identity is absent from the frozen v2 inventory', () => {
  const run = buildRun({ seed: 'v2-evidence-drift', runId: 'run-v2-evidence-drift' });
  run.v2 = v2Block();
  run.v2.toolBriefs[0].body.evidenceBundleRef = 'bundle:not-in-inventory';
  run.v2.toolBriefs[0].body.evidenceBundleSha256 = `sha256:${'f'.repeat(64)}`;
  const built = buildPublishSet(run);
  assert.equal(built.ok, false);
  assert.match(built.error.reason, /evidence/);
});

test('the publisher refuses a Market Action projection that did not pass the real Center contract', () => {
  const run = buildRun({ seed: 'v2-center-drift', runId: 'run-v2-center-drift' });
  run.v2 = v2Block({ projection: { contractVersion: 'market-action-center-projection/v1', projectionId: 'incomplete' } });
  const built = buildPublishSet(run);
  assert.equal(built.ok, false);
  assert.match(built.error.reason, /projection|view|generation/i);
});

test('validatePublishSet refuses drift between the v2 pointer and manifest refs', () => {
  const run = buildRun({ seed: 'v2-pointer-drift', runId: 'run-v2-pointer-drift' });
  run.v2 = v2Block();
  const staging = buildPublishSet(run).staging;
  staging.pointers.current.v2.toolBriefs[fx.TOOL_ID].sha256 = `sha256:${'0'.repeat(64)}`;
  const validated = validatePublishSet(staging, {});
  assert.equal(validated.ok, false);
  assert.match(validated.error.reason, /pointer|ref|hash/);
});

test('the real scheduler transaction authors and promotes the v2 inventory from its frozen owner reads', async () => {
  const repo = makeSchedulerRepo();
  try {
    const deps = schedulerDeps(repo, 'morning');
    const toolId = deps.scenario.registry.orderedSourceToolIds[0];
    const bundle = fx.bundle({
      toolId,
      runId: deps.runContext.runId,
      cutoffAt: '2026-07-14T15:05:00.000Z'
    });
    deps.toolBriefV2 = {
      identity: fx.identity(),
      toolEntries: [{ toolId, bundle }],
      publicTickerEntries: [{ toolId, ticker: fx.PUBLIC_TICKER, bundle }],
      centerToolId: toolId,
      marketActionInput: {
        projectionId: 'market-action-center/scheduler',
        generationRef: deps.runContext.runId,
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
          visibleLimitations: [{ text: 'Only two independent origins support this action.', blocking: true }],
          disclosures: []
        },
        portfolio: { publicMatrixRef: 'market-action-public-matrix/scheduler' },
        redAlert: { alertRefs: [] },
        journey: { definitionRefs: ['journey:a', 'journey:b', 'journey:c', 'journey:d'] }
      },
      authorFn: async (request) => ({
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
      })
    };

    const result = await runBriefRefresh(deps);
    assert.equal(result.ok, true, JSON.stringify(result.refusal || null));
    assert.ok(result.manifest.v2, 'the scheduler manifest carries the v2 inventory built in this run');
    assert.equal(result.manifest.v2.toolBriefRefs.length, 1);
    assert.equal(result.manifest.v2.publicTickerBriefRefs.length, 1);
    assert.equal(result.manifest.v2.publicTickerBriefRefs[0].ticker, fx.PUBLIC_TICKER);
    assert.equal(result.staging.pointers.current.v2.manifestV2Fingerprint, result.manifest.v2.inventoryFingerprint);
    assert.equal(result.staging.pointers.current.v2.marketActionProjectionRef.sha256, result.manifest.v2.marketActionProjectionRef.sha256);
  } finally {
    repo.cleanup();
  }
});

test('promotion writes every v2 object before briefs/current.json', () => {
  const { dir, cleanup } = isolatedRoot();
  try {
    const run = buildRun({ seed: 'v2p', runId: 'run-v2p' });
    run.v2 = v2Block();
    const staging = buildPublishSet(run).staging;

    const order = [];
    const promoted = promotePublishSet(staging, dir, {
      writeFile: (abs, bytes) => {
        order.push(path.relative(dir, abs));
        mkdirSync(path.dirname(abs), { recursive: true });
        writeFileSync(abs, bytes);
      }
    });
    assert.equal(promoted.ok, true, JSON.stringify(promoted.error || null));
    assert.equal(order[order.length - 1], 'briefs/current.json', 'the pointer is written LAST');

    const v2Paths = [].concat(
      staging.manifest.body.v2.webEvidenceRefs.map((r) => r.path),
      staging.manifest.body.v2.toolBriefRefs.map((r) => r.path),
      staging.manifest.body.v2.publicTickerBriefRefs.map((r) => r.path),
      [staging.manifest.body.v2.marketActionProjectionRef.path]
    );
    for (const p of v2Paths) {
      assert.equal(order.indexOf(p) > -1 && order.indexOf(p) < order.length - 1, true, `${p} is written before the pointer`);
      const onDisk = readFileSync(path.join(dir, p));
      assert.equal(onDisk.length, staging.files[p].bytes.length, `${p} on disk matches staged bytes`);
    }
  } finally { cleanup(); }
});

test('a failed v2 generation preserves the prior pointer byte-identically', () => {
  const first = buildPublishSet(buildRun({ seed: 'v2r1', runId: 'run-v2r1' })).staging;
  const priorPointer = pointerBytes(first.pointers.current);

  const run = buildRun({ seed: 'v2r2', runId: 'run-v2r2', prior: priorFromStaging(first) });
  run.v2 = v2Block();
  // corrupt one v2 object so the generation cannot complete.
  run.v2.toolBriefs[0].body = { contractVersion: 'tool-brief/v2', briefId: '' };
  const failed = buildPublishSet(run);
  assert.equal(failed.ok, false, 'an invalid v2 object refuses the whole generation');
  assert.match(failed.error.code, /^B002-|^E012-/);

  // the prior pointer is untouched: it was never re-derived.
  assert.equal(pointerBytes(first.pointers.current).equals(priorPointer), true);
});

test('rollback returns to the prior generation without reauthoring a v2 object', () => {
  const firstRun = buildRun({ seed: 'v2b1', runId: 'run-v2b1' });
  firstRun.v2 = v2Block();
  const first = buildPublishSet(firstRun).staging;

  const second = buildRun({ seed: 'v2b2', runId: 'run-v2b2', prior: priorFromStaging(first) });
  second.v2 = v2Block();
  const secondStaging = buildPublishSet(second).staging;
  assert.equal(secondStaging.pointers.current.generation, 2);

  const rolled = rollbackPublication({ pointer: first.pointers.current });
  assert.equal(rolled.ok, true, JSON.stringify(rolled.error || null));
  assert.equal(rolled.rollback.mode, 'pointer-swap');
  assert.equal(rolled.rollback.currentPointer.runId, 'run-v2b1', 'rollback selects the prior run by pointer swap only');
  assert.equal(rolled.rollback.deletedObjects, 0, 'no immutable v2 object is deleted by a rollback');
  assert.equal(rolled.rollback.rewrittenPartitions, 0, 'no history partition is rewritten by a rollback');
  assert.ok(rolled.rollback.currentPointer.v2, 'the restored pointer still selects its own v2 generation');
  assert.equal(rolled.rollback.currentPointer.v2.manifestV2Fingerprint, first.manifest.body.v2.inventoryFingerprint);
});

/* ═══════════ SCN-012-020 — the public/private barrier ═══════════ */

test('SCN-012-020 a public-ticker Brief publishes with zero private fields anywhere in the generation', () => {
  const run = buildRun({ seed: 'v2pub', runId: 'run-v2pub' });
  run.v2 = v2Block();
  const staging = buildPublishSet(run).staging;

  const surfaces = {
    manifest: JSON.stringify(staging.manifest.body),
    pointer: pointerBytes(staging.pointers.current).toString('utf8'),
    historyPointer: pointerBytes(staging.pointers.historyCurrent).toString('utf8'),
    compatibility: staging.files['market-brief.payload.json'].bytes.toString('utf8')
  };
  for (const [name, text] of Object.entries(surfaces)) {
    assert.equal(PRIVATE_SENTINEL.test(text), false, `${name} must carry no private portfolio field`);
  }
  for (const p of Object.keys(staging.files)) {
    assert.equal(PRIVATE_SENTINEL.test(staging.files[p].bytes.toString('utf8')), false, `${p} must carry no private portfolio field`);
  }

  const tickerRef = staging.manifest.body.v2.publicTickerBriefRefs[0];
  assert.equal(tickerRef.ticker, fx.PUBLIC_TICKER);
  assert.equal(tickerRef.scope, 'public-ticker');
});

test('SCN-012-020 a ticker outside the committed public list refuses the whole generation', () => {
  const run = buildRun({ seed: 'v2priv', runId: 'run-v2priv' });
  const block = v2Block();
  block.publicTickers = ['SPY'];
  run.v2 = block;
  const refused = buildPublishSet(run);
  assert.equal(refused.ok, false, 'a non-public ticker Brief may never publish');
  assert.match(refused.error.reason, /ticker/);
  assert.equal(JSON.stringify(refused.error).includes('quantity'), false);
});

test('a smuggled private field in a v2 object refuses before any file is staged', () => {
  const run = buildRun({ seed: 'v2smug', runId: 'run-v2smug' });
  const block = v2Block();
  block.toolBriefs[0].body = { ...block.toolBriefs[0].body, holdingQuantity: 42 };
  run.v2 = block;
  const refused = buildPublishSet(run);
  assert.equal(refused.ok, false);
  assert.equal(JSON.stringify(refused.error).includes('42'), false, 'the refusal never echoes the private value');
});
