/*
 * tests/distributed-briefs.distributed-publish.unit.mjs — Feature 002 distributed-briefs activation.
 *
 * Deterministic, hermetic coverage for scripts/brief-distributed-publish.mjs — the offline, no-LLM
 * publisher that materializes the briefs/ graph from a committed snapshot + payload + frozen registry.
 * A small SYNTHETIC registry/snapshot/payload (aggregator + 3 sources, 2 with reads, 1 coverage-only) is
 * written into an ISOLATED temp root; the real repository briefs/ / market-brief.* are never touched.
 *
 * Proves the six invariants the activation depends on:
 *   1. the publish set is SCHEMA-VALID (validatePublishSet + validateRunIdentity accept it);
 *   2. RICH vs COVERAGE authoring — the 2 tools with a snapshot read get a rich deterministic brief; the
 *      coverage-only tool gets an honest browser-or-agent-read brief with NO fabricated read;
 *   3. POINTER-LAST — briefs/current.json resolves a manifest + every object/read/brief ref on disk;
 *   4. APPEND-ONLY history — a second generation's monthly partition is a byte-superset (prefix-preserving)
 *      of the first;
 *   5. IDEMPOTENT re-run — republishing the same run identity writes nothing and keeps the generation;
 *   6. briefs/-ONLY writes — the publisher never mutates market-brief.* or data/.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  publishDistributedBriefs, buildDistributedRun, loadInputs, readPriorFromRoot
} from '../scripts/brief-distributed-publish.mjs';
import {
  buildPublishSet, validatePublishSet, validateRunIdentity, canonicalMonthFromEtRunDate
} from '../scripts/brief-publication.mjs';
import { validateCurrentGraph, validateHistoryGraph } from '../scripts/validate-distributed-briefs.mjs';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

function sha(bytes) { return `sha256:${createHash('sha256').update(bytes).digest('hex')}`; }

/** A briefing block that passes rlcontracts.validateRegistry for the given profile/role + unique adapter. */
function briefing(profile, role, adapter) {
  return {
    role, profile,
    readAdapter: adapter,
    readContractVersion: 'tool-model-read/v1',
    freshnessPolicy: 'freshness/v1',
    recommendationPolicy: 'recommendation/v1',
    budgetPolicy: 'budget/v1'
  };
}

/** Minimal, valid tools.json: 1 final-aggregator + 3 sources (src-alpha, src-bravo, src-charlie). */
function syntheticToolsJson() {
  return {
    tools: [
      { id: 'market-brief', file: 'market-brief.html', briefing: briefing('final-aggregator', 'final-aggregator', 'final-aggregator/v1') },
      { id: 'src-alpha', file: 'src-alpha.html', briefing: briefing('live-market', 'source', 'src-alpha-owner/v1') },
      { id: 'src-bravo', file: 'src-bravo.html', briefing: briefing('live-market', 'source', 'src-bravo-owner/v1') },
      { id: 'src-charlie', file: 'src-charlie.html', briefing: briefing('off-theme', 'source', 'src-charlie-owner/v1') }
    ]
  };
}

/** A snapshot with reads for src-alpha + src-bravo (rich) and coverage-only for src-charlie. */
function syntheticSnapshot(asOf) {
  return {
    asOf, generatedAt: asOf, window: 'morning', marketClosed: false, nextSessionDate: '2026-07-15',
    regime: { band: 'VIX 15', score: 0, vix: 15 },
    dataFreshness: { bars: { updated: asOf, count: 3 } },
    bench: { px: 100, maStack: 'bull-stack' },
    toolReads: {
      'src-alpha': { id: 'src-alpha', asOf, read: 'Alpha leads rotation.', metrics: { leader: 'AAA', signal: 12.3 }, deepLink: 'src-alpha.html', source: 'tier-a-alpha' },
      'src-bravo': { id: 'src-bravo', asOf, read: 'Bravo momentum steady.', metrics: { leader: 'BBB', signal: 7.7 }, deepLink: 'src-bravo.html', source: 'tier-a-bravo' }
    },
    toolCoverage: [
      { id: 'market-brief', deepLink: 'market-brief.html', status: 'browser-or-agent-read', reason: 'Aggregator.' },
      { id: 'src-alpha', deepLink: 'src-alpha.html', status: 'fresh-headless', reason: null },
      { id: 'src-bravo', deepLink: 'src-bravo.html', status: 'fresh-headless', reason: null },
      { id: 'src-charlie', deepLink: 'src-charlie.html', status: 'browser-or-agent-read', reason: 'No deterministic Tier-A adapter; consume its latest browser toolRead when present.' }
    ]
  };
}

function syntheticPayload(asOf) {
  return {
    toolId: 'market-brief', window: 'morning', asOf,
    nextSession: {
      sessionDate: '2026-07-15', thesis: 'Deterministic test thesis.',
      actions: [
        { action: 'hold', subject: 'Core longs' },
        { action: 'rotate', subject: 'Into energy' }
      ]
    }
  };
}

function makeFixtureRoot(asOf = '2026-07-14T15:05:00.000Z') {
  const root = mkdtempSync(path.join(tmpdir(), 'rl-distpub-'));
  writeFileSync(path.join(root, 'tools.json'), JSON.stringify(syntheticToolsJson(), null, 2) + '\n');
  writeFileSync(path.join(root, 'market-brief.snapshot.json'), JSON.stringify(syntheticSnapshot(asOf), null, 2) + '\n');
  writeFileSync(path.join(root, 'market-brief.payload.json'), JSON.stringify(syntheticPayload(asOf), null, 2) + '\n');
  return { root, cleanup: () => { try { rmSync(root, { recursive: true, force: true }); } catch (e) { /* best effort */ } } };
}

function readJson(root, rel) { return JSON.parse(readFileSync(path.join(root, rel), 'utf8')); }

test('distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly', () => {
  const fx = makeFixtureRoot();
  try {
    // (1) Schema validity — the same primitives the engine uses accept the run this publisher builds.
    const inputs = loadInputs(fx.root);
    assert.equal(inputs.ok, true, 'inputs load');
    const frozen = RLCONTRACTS.validateRegistry(inputs.toolsJson, null);
    assert.equal(frozen.ok, true, 'synthetic registry is valid');
    const runResult = buildDistributedRun({
      snapshot: inputs.snapshot, payload: inputs.payload, frozen: frozen.value,
      snapshotSha: inputs.snapshotSha, payloadSha: inputs.payloadSha, prior: null
    });
    assert.equal(runResult.ok, true, 'run built');
    assert.equal(runResult.richCount, 2, 'exactly 2 rich reads (src-alpha, src-bravo)');
    assert.equal(runResult.coverageCount, 1, 'exactly 1 coverage-only source (src-charlie)');
    const built = buildPublishSet(runResult.run);
    assert.equal(built.ok, true, 'buildPublishSet ok');
    assert.equal(validatePublishSet(built.staging, { priorStreams: {}, sealedMonths: [] }).ok, true, 'validatePublishSet ok');
    assert.equal(validateRunIdentity(built.staging, { priorGeneration: 0 }).ok, true, 'validateRunIdentity ok');

    // Promote for real into the isolated root.
    const published = publishDistributedBriefs({ root: fx.root });
    assert.equal(published.ok, true, 'publish ok');
    assert.equal(published.generation, 1, 'first publication is generation 1');
    assert.equal(published.richCount, 2);
    assert.equal(published.coverageCount, 1);

    // (2) Rich vs coverage authoring, read from the on-disk graph.
    const current = readJson(fx.root, 'briefs/current.json');
    assert.deepEqual(Object.keys(current.tools).sort(), ['src-alpha', 'src-bravo', 'src-charlie'], 'pointer covers exactly the 3 sources (aggregator excluded)');

    const alphaBrief = readJson(fx.root, current.tools['src-alpha'].briefPath);
    assert.equal(alphaBrief.outcome, 'newly-authored');
    assert.equal(alphaBrief.evidenceKind, 'deterministic-tier-a-read');
    assert.equal(alphaBrief.summary, 'Alpha leads rotation.', 'rich brief summary is the deterministic read text');
    const alphaRead = readJson(fx.root, current.tools['src-alpha'].readPath);
    assert.equal(alphaRead.status, 'fresh-headless');
    assert.deepEqual(alphaRead.metrics, { leader: 'AAA', signal: 12.3 }, 'rich read carries the real metrics');

    const charlieBrief = readJson(fx.root, current.tools['src-charlie'].briefPath);
    assert.equal(charlieBrief.outcome, 'coverage-only');
    assert.equal(charlieBrief.evidenceKind, 'coverage-only');
    assert.equal(charlieBrief.coverageStatus, 'browser-or-agent-read');
    const charlieRead = readJson(fx.root, current.tools['src-charlie'].readPath);
    assert.equal(charlieRead.status, 'browser-or-agent-read');
    assert.equal(charlieRead.metrics, null, 'coverage-only read fabricates NO metrics');
    assert.equal(charlieRead.summary, 'No deterministic Tier-A adapter; consume its latest browser toolRead when present.', 'coverage read carries the honest coverage reason');

    // (3) Pointer-last — current.json resolves a manifest + every object ref on disk.
    assert.equal(validateCurrentGraph(fx.root).ok, true, 'current graph coherent');
    assert.equal(validateHistoryGraph(fx.root).ok, true, 'history graph coherent');
    const manifestBytes = readFileSync(path.join(fx.root, current.manifestRef.path));
    assert.equal(sha(manifestBytes), current.manifestRef.sha256, 'current pointer references the manifest by exact hash');
  } finally { fx.cleanup(); }
});

test('distributed publisher appends history generation over generation and is idempotent on an unchanged run', () => {
  const fx = makeFixtureRoot('2026-07-14T15:05:00.000Z');
  try {
    const month = canonicalMonthFromEtRunDate('2026-07-14');
    const toolPartition = `briefs/history/tools/src-alpha/${month}.jsonl`;
    const runsPartition = `briefs/history/runs/${month}.jsonl`;

    const g1 = publishDistributedBriefs({ root: fx.root });
    assert.equal(g1.ok, true);
    assert.equal(g1.generation, 1);
    const gen1ToolBytes = readFileSync(path.join(fx.root, toolPartition));
    const gen1Runs = readFileSync(path.join(fx.root, toolPartition), 'utf8').split('\n').filter((l) => l.length > 0);
    assert.equal(gen1Runs.length, 1, 'generation 1 wrote one tool-history row');

    // Second generation — a later same-month snapshot changes the run identity.
    writeFileSync(path.join(fx.root, 'market-brief.snapshot.json'), JSON.stringify(syntheticSnapshot('2026-07-14T19:30:00.000Z'), null, 2) + '\n');
    const g2 = publishDistributedBriefs({ root: fx.root });
    assert.equal(g2.ok, true);
    assert.equal(g2.generation, 2, 'second publication is generation 2');

    // (4) Append-only: gen-1 partition bytes are an exact prefix of the gen-2 partition bytes.
    const gen2ToolBytes = readFileSync(path.join(fx.root, toolPartition));
    assert.ok(gen2ToolBytes.length > gen1ToolBytes.length, 'partition grew');
    assert.ok(gen2ToolBytes.subarray(0, gen1ToolBytes.length).equals(gen1ToolBytes), 'prior partition bytes are preserved as an exact prefix');
    const gen2Rows = gen2ToolBytes.toString('utf8').split('\n').filter((l) => l.length > 0);
    assert.equal(gen2Rows.length, 2, 'generation 2 appended a second row (append-only)');
    assert.equal(readFileSync(path.join(fx.root, runsPartition), 'utf8').split('\n').filter((l) => l.length > 0).length, 2, 'runs partition also appended');
    assert.equal(validateHistoryGraph(fx.root).ok, true, 'history graph still coherent after append');
    assert.equal(readJson(fx.root, 'briefs/current.json').generation, 2);

    // (5) Idempotent re-run — same run identity writes nothing, generation unchanged.
    const beforePointer = readFileSync(path.join(fx.root, 'briefs/current.json'));
    const beforePartition = readFileSync(path.join(fx.root, toolPartition));
    const g2b = publishDistributedBriefs({ root: fx.root });
    assert.equal(g2b.ok, true);
    assert.equal(g2b.skipped, 'idempotent', 'unchanged run identity is a no-op');
    assert.equal(g2b.generation, 2, 'generation unchanged on idempotent re-run');
    assert.ok(readFileSync(path.join(fx.root, 'briefs/current.json')).equals(beforePointer), 'pointer bytes unchanged');
    assert.ok(readFileSync(path.join(fx.root, toolPartition)).equals(beforePartition), 'no new history row on idempotent re-run');

    // readPriorFromRoot reflects the published generation for the next N+1 chain.
    const prior = readPriorFromRoot(fx.root, month);
    assert.equal(prior.generation, 2);
    assert.equal(prior.pointer.runId, g2.runId);
  } finally { fx.cleanup(); }
});

test('distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/', () => {
  const fx = makeFixtureRoot();
  try {
    const payloadBefore = sha(readFileSync(path.join(fx.root, 'market-brief.payload.json')));
    const toolsBefore = sha(readFileSync(path.join(fx.root, 'tools.json')));
    const snapBefore = sha(readFileSync(path.join(fx.root, 'market-brief.snapshot.json')));

    // A dry-run on the fresh fixture reports the would-write plan and mutates NOTHING (no briefs/ created).
    const dry = publishDistributedBriefs({ root: fx.root, dryRun: true });
    assert.equal(dry.ok, true);
    assert.equal(dry.skipped, undefined);
    assert.ok(Array.isArray(dry.wouldWrite) && dry.wouldWrite.length > 0, 'dry-run reports the would-write plan');
    assert.equal(existsSync(path.join(fx.root, 'briefs')), false, 'dry-run created no briefs/');

    const published = publishDistributedBriefs({ root: fx.root });
    assert.equal(published.ok, true);
    // The engine's market-brief.* compat projections are filtered OUT of promotion.
    assert.ok(Array.isArray(published.filteredCompat) && published.filteredCompat.includes('market-brief.payload.json') && published.filteredCompat.includes('market-brief.snapshot.json'), 'compat projections were filtered out of promotion');
    assert.ok(published.wrote.every((p) => p.startsWith('briefs/')), 'every promoted file is under briefs/');

    // The publisher touched NONE of the input files.
    assert.equal(sha(readFileSync(path.join(fx.root, 'market-brief.payload.json'))), payloadBefore, 'payload byte-identical');
    assert.equal(sha(readFileSync(path.join(fx.root, 'tools.json'))), toolsBefore, 'tools.json byte-identical');
    assert.equal(sha(readFileSync(path.join(fx.root, 'market-brief.snapshot.json'))), snapBefore, 'snapshot byte-identical — publisher never writes it');

    // No data/ directory was created; the only new top-level entry is briefs/.
    assert.equal(existsSync(path.join(fx.root, 'data')), false, 'no data/ created');
    assert.deepEqual(readdirSync(fx.root).sort(), ['briefs', 'market-brief.payload.json', 'market-brief.snapshot.json', 'tools.json'], 'briefs/ is the only new top-level entry');
  } finally { fx.cleanup(); }
});
