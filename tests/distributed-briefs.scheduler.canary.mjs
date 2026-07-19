/*
 * tests/distributed-briefs.scheduler.canary.mjs — Feature 002 Scope 09 (SCN-002-010).
 *
 * An INDEPENDENT barrier canary. It does not trust runBriefRefresh's own success flag: it wraps the
 * injected source acquirer and the tool/final author transports so each records its own call into a
 * separate trace, then proves from that trace that the immutable evidence/reads freeze happens before any
 * owner-read authorship and that the single final author is invoked ONLY after every source outcome. It
 * also proves the disposable root worktree bytes are unchanged.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { runBriefRefresh } from '../scripts/brief-refresh.mjs';
import {
  makeSchedulerRepo, schedulerDeps, snapshotTree, makeSourceAcquirer, scenarioToolAuthorFn, envelopeFinalAuthorFn
} from './fixtures/feature-002/scheduler/scheduler-fixture-builder.mjs';
import { singleSourceScenario } from './fixtures/feature-002/final/final-fixture-builder.mjs';

test('Canary: evidence freezes before owner reads and final author waits for all 22 source outcomes', async () => {
  const repo = makeSchedulerRepo();
  try {
    const scenario = singleSourceScenario('morning');
    const sourceCount = scenario.registry.orderedSourceToolIds.length;
    const trace = [];

    const baseAcquire = makeSourceAcquirer(scenario);
    const tracedAcquire = async (arg) => { trace.push({ kind: 'evidence-acquire' }); return baseAcquire(arg); };

    const baseAuthor = scenarioToolAuthorFn(scenario);
    const tracedAuthor = async (request, meta) => { trace.push({ kind: 'tool-author', toolId: request.data.compactedRead.toolId }); return baseAuthor(request, meta); };

    const baseFinal = envelopeFinalAuthorFn('valid');
    const tracedFinal = async (request, meta) => { trace.push({ kind: 'final-author' }); return baseFinal(request, meta); };

    const deps = schedulerDeps(repo, 'morning', { scenario, acquireOptions: {}, authorFn: tracedAuthor, finalAuthorFn: tracedFinal });
    deps.acquireSources = tracedAcquire;

    const rootBefore = snapshotTree(repo.root);
    const result = await runBriefRefresh(deps);
    assert.equal(result.ok, true);

    // Independent call-trace barrier proof (NOT the scheduler's success flag):
    const acquireIdx = trace.findIndex((e) => e.kind === 'evidence-acquire');
    const toolIdxs = trace.map((e, i) => (e.kind === 'tool-author' ? i : -1)).filter((i) => i >= 0);
    const finalIdxs = trace.map((e, i) => (e.kind === 'final-author' ? i : -1)).filter((i) => i >= 0);

    assert.equal(acquireIdx, 0, 'the immutable evidence/reads freeze is the FIRST external call');
    assert.equal(toolIdxs.length, sourceCount, 'exactly one owner-read authorship per frozen source');
    assert.equal(finalIdxs.length, 1, 'exactly one final author');
    assert.ok(toolIdxs.every((i) => i > acquireIdx), 'every owner read authored strictly AFTER evidence freeze');
    assert.ok(finalIdxs[0] > Math.max(...toolIdxs), 'final author waits for ALL source outcomes');

    // The independent phase-event trace agrees with the same ordering.
    const phases = deps.events.filter((e) => e.phase !== 'refusal').map((e) => e.phase);
    assert.ok(phases.indexOf('evidence-frozen') < phases.indexOf('source-briefs-authored'));
    assert.ok(phases.indexOf('source-barrier-passed') < phases.indexOf('final-authored'));

    // The disposable root bytes never moved during the canary run.
    assert.deepEqual(snapshotTree(repo.root), rootBefore, 'root bytes unchanged during canary');
  } finally {
    repo.cleanup();
  }
});
