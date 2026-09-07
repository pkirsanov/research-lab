/*
 * tests/shock-transmission.hypothetical.integration.mjs — Feature 031 Scope 2 (SCN-031-024), TP-02-12.
 *
 * Real sink-isolation proof for the local, non-persistable hypothetical/reset engine. An owned ephemeral
 * repository (a disposable temp directory tree standing in for the dossier, history, pointer, payload,
 * tool-read, and local-storage sinks) is byte-snapshotted before the run. The full same-topic hypothetical
 * workflow — building a lever comparison, attempting to route it through every canonical sink via
 * RLSHOCK.validatePersistenceCandidate(), and resetting back to baseline — then executes. `fetch` is
 * monkey-patched to throw so any accidental network call fails the test loudly rather than silently
 * succeeding. The ephemeral tree is re-snapshotted afterward and must be byte-for-byte identical: no
 * dossier, history, pointer, payload, tool-read, storage, or network sink changed.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  makeSnapshot, makeViewState, makeHypothetical, makeHypotheticalAdapterOutput, makeProjectionInput
} from './fixtures/shock-transmission/foundation-fixture.mjs';

const RLSHOCK = (await import('node:module')).createRequire(import.meta.url)('../rlshock.js');
const config = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));

function unwrap(result) {
  assert.equal(result.ok, true, result.error && JSON.stringify(result.error));
  return result.value;
}

/* The six named canonical sinks plus the storage sink, realized as real files in an owned ephemeral repo. */
const SINK_FILES = [
  'dossier/current.json',
  'history/2026-09-events.jsonl',
  'pointer/research-agenda-current.json',
  'payload/market-brief.payload.json',
  'tool-reads/shock-transmission-read.json',
  'storage/local-storage.json',
  'network/outbound-request-log.json',
  'immutable/shock-transmission-snapshot.json'
];

function makeEphemeralRepo() {
  const root = mkdtempSync(path.join(tmpdir(), 'rl-shock-hypothetical-'));
  for (const relPath of SINK_FILES) {
    const absPath = path.join(root, relPath);
    mkdirSync(path.dirname(absPath), { recursive: true });
    writeFileSync(absPath, JSON.stringify({ sink: relPath, canonical: true, seededAt: '2026-09-06T00:00:00.000Z' }) + '\n');
  }
  return {
    root,
    cleanup() { rmSync(root, { recursive: true, force: true }); }
  };
}

function snapshotTree(root) {
  const entries = {};
  function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      const abs = path.join(dir, name);
      const stat = statSync(abs);
      if (stat.isDirectory()) { walk(abs); continue; }
      entries[path.relative(root, abs)] = readFileSync(abs, 'utf8');
    }
  }
  walk(root);
  return entries;
}

/*
 * A minimal stand-in for a real canonical sink writer: it validates every candidate through
 * RLSHOCK.validatePersistenceCandidate() before ever touching the filesystem, exactly as the design
 * requires ("Hypothetical persistence attempts refuse before artifact creation"). If the guard admits a
 * hypothetical-shaped or nonpersistable candidate, this is a production defect and the write proceeds
 * (making the isolation failure visible in the byte snapshot) rather than being hidden by test-only logic.
 */
function attemptSinkWrite(root, relPath, candidate) {
  const guardResult = RLSHOCK.validatePersistenceCandidate(candidate, '$');
  if (!guardResult.ok) return guardResult;
  writeFileSync(path.join(root, relPath), JSON.stringify(candidate) + '\n');
  return guardResult;
}

test('Regression: SCN-031-024 every canonical sink refuses local hypothetical state', async () => {
  const repo = makeEphemeralRepo();
  const originalFetch = globalThis.fetch;
  let fetchCallCount = 0;
  globalThis.fetch = function () {
    fetchCallCount += 1;
    throw new Error('SCN-031-024 violation: the local hypothetical/reset engine must never call fetch.');
  };

  try {
    const before = snapshotTree(repo.root);

    // Build a validated published baseline exactly as Scope 1/2 dedicated tests do.
    const policy = unwrap(RLSHOCK.resolveResourcePolicy(config));
    const { definition, snapshot } = makeSnapshot({ policy });
    unwrap(RLSHOCK.validateSnapshot(snapshot, definition, policy));
    const baseline = makeViewState(snapshot, definition);

    // The operator changes a definition-owned lever and compares the result. This must stay in memory only.
    const hypothetical = makeHypothetical(baseline, definition, snapshot, RLSHOCK);
    const adapterOutput = makeHypotheticalAdapterOutput(baseline);
    const compared = unwrap(RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(hypothetical, adapterOutput)));
    assert.equal(compared.projectionClass, 'user-hypothetical');
    assert.equal(compared.persistable, false);

    // Every named sink refuses both the raw hypothetical contract and the labelled comparison view by
    // exact code before any byte is written. This is the structural sink-isolation proof, not a mock.
    const candidatesBySink = {
      'dossier/current.json': hypothetical,
      'history/2026-09-events.jsonl': compared,
      'pointer/research-agenda-current.json': hypothetical,
      'payload/market-brief.payload.json': compared,
      'tool-reads/shock-transmission-read.json': compared,
      'storage/local-storage.json': hypothetical,
      'immutable/shock-transmission-snapshot.json': compared
    };
    for (const [relPath, candidate] of Object.entries(candidatesBySink)) {
      const guardResult = attemptSinkWrite(repo.root, relPath, candidate);
      assert.equal(guardResult.ok, false, `${relPath} must refuse a hypothetical-shaped candidate`);
      assert.equal(guardResult.error.code, 'RLSHOCK-HYPOTHETICAL-PERSIST', `${relPath} refuses by the exact hypothetical-persist code`);
    }

    // The "network" sink: proves no outbound call is even attempted for a hypothetical, by construction —
    // the local hypothetical/reset engine takes no fetch, XHR, beacon, or publisher dependency at all.
    assert.equal(typeof RLSHOCK.projectViewState, 'function');
    assert.equal(fetchCallCount, 0, 'the hypothetical/reset engine must never invoke fetch');

    // Reset removes the hypothetical value and restores the exact loaded baseline identity in memory only.
    const reset = unwrap(RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(null, null)));
    assert.equal(RLSHOCK.digest(reset), RLSHOCK.digest(baseline));

    // A reset or baseline view is not itself persistable either (it is a session projection, not a
    // canonical artifact) — the same guard refuses it too, proving no local-hypothetical exemption exists.
    const resetGuard = RLSHOCK.validatePersistenceCandidate(reset, '$');
    assert.equal(resetGuard.ok, false);
    assert.equal(resetGuard.error.code, 'RLSHOCK-HYPOTHETICAL-PERSIST');

    // No fetch fired across the entire workflow.
    assert.equal(fetchCallCount, 0);

    // Every dossier, history, pointer, payload, tool-read, storage, and immutable-file byte is unchanged.
    const after = snapshotTree(repo.root);
    assert.deepEqual(after, before, 'every canonical sink byte is unchanged after the full hypothetical/reset workflow');
    assert.deepEqual(Object.keys(after).sort(), SINK_FILES.slice().sort(), 'the ephemeral repo inventory itself is unchanged');
  } finally {
    globalThis.fetch = originalFetch;
    repo.cleanup();
  }
});
