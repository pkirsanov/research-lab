/*
 * tests/distributed-briefs.final.integration.mjs — Feature 002 Scope 08 (SCN-002-025 / SCN-002-027).
 *
 * Integration coverage for the production final barrier + author + validator path (runFinalAuthor):
 *  - the complete live registry (currently 23 participants / 22 sources, DERIVED) must present every
 *    owner-read AND source-brief outcome before ONE final is authored, and the resulting FinalBrief covers
 *    all 23 participants exactly once with 22 source refs (SCN-002-025);
 *  - owner disputes, thin baselines, and shared source origins remain visible context or conflict — a
 *    shared evidence origin counts once and merged confidence is the minimum retained score, while a
 *    disputed/unusual observation stays bounded educational context that consumes no action slot (SCN-002-027).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { runFinalAuthor } from '../scripts/brief-refresh.mjs';
import {
  registryConfig, windowContext, finalBudget, authorIdentity, makeHash, envelopeFinalAuthorFn,
  mergedScenario, conflictScenario
} from './fixtures/feature-002/final/final-fixture-builder.mjs';
import { eligibleOwnerRead, ineligibleRead, recommendationBrief, noRecommendationBrief, recommendationRecord } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

function readRealRegistry() {
  return JSON.parse(require('node:fs').readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
}

test('complete 23-participant final input consumes all 22 owner-read and source-brief outcomes after the barrier', async () => {
  const frozen = RLCONTRACTS.validateRegistry(readRealRegistry(), registryConfig()).value;
  // Current-repository canary: derived, never a controlling literal.
  assert.equal(frozen.participantCount, 23);
  assert.equal(frozen.sourceCount, 22);

  const eligibleId = frozen.orderedSourceToolIds.find((toolId) => frozen.entries[toolId].profile === 'live-market');
  assert.ok(eligibleId, 'the live registry has at least one live-market source');

  const reads = {};
  const briefs = {};
  for (const sourceId of frozen.orderedSourceToolIds) {
    const profile = frozen.entries[sourceId].profile;
    if (sourceId === eligibleId) {
      const read = eligibleOwnerRead({ toolId: sourceId, fingerprint: makeHash(`read-${sourceId}`) });
      reads[sourceId] = read;
      briefs[sourceId] = recommendationBrief(read, { contentFingerprint: makeHash(`content-${sourceId}`) });
    } else {
      const read = ineligibleRead(sourceId, profile === 'final-aggregator' ? 'off-theme' : profile, { fingerprint: makeHash(`read-${sourceId}`) });
      reads[sourceId] = read;
      briefs[sourceId] = noRecommendationBrief(read, { contentFingerprint: makeHash(`content-${sourceId}`) });
    }
  }
  const groups = RLCONTRACTS.groupRecommendations([recommendationRecord({ originToolId: eligibleId })]).value;
  const runContext = {
    runId: 'run-final-integration', runFingerprint: makeHash('run-fp-integration'),
    marketSessionEvidenceRef: { evidenceType: 'market-session-evidence', fingerprint: makeHash('mse-bundle') },
    windowContext: windowContext('morning'), actionThresholds: { maxActions: 5, maxAttention: 8 },
    lowNoiseResults: [], lifecycle: { contractVersion: 'compact-lifecycle/v1', entries: {} }, registryConfig: registryConfig()
  };

  const result = await runFinalAuthor({ registry: frozen, reads, briefs, groups, runContext, finalBudget: finalBudget(), identity: authorIdentity(), authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.refusal));
  assert.equal(result.telemetry.participantCount, 23);
  assert.equal(result.telemetry.sourceCount, 22);
  assert.equal(result.final.coverage.length, 23);
  assert.equal(Object.keys(result.final.sourceRefs).length, 22);
  assert.equal(result.final.actions.length, 1);
  assert.equal(result.final.actions[0].originToolIds[0], eligibleId);

  // The barrier refuses BEFORE authoring if any owner-read or source-brief outcome is missing.
  const missingBrief = { ...briefs };
  delete missingBrief[frozen.orderedSourceToolIds[3]];
  const refusedBrief = await runFinalAuthor({ registry: frozen, reads, briefs: missingBrief, groups, runContext, finalBudget: finalBudget(), identity: authorIdentity(), authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(refusedBrief.ok, false);
  assert.equal(refusedBrief.refusal.reason, 'brief-barrier-incomplete');

  const missingRead = { ...reads };
  delete missingRead[frozen.orderedSourceToolIds[5]];
  const refusedRead = await runFinalAuthor({ registry: frozen, reads: missingRead, briefs, groups, runContext, finalBudget: finalBudget(), identity: authorIdentity(), authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(refusedRead.ok, false);
  assert.equal(refusedRead.refusal.reason, 'read-barrier-incomplete');

  // The final aggregator is never fed its own source brief.
  const selfConsumed = await runFinalAuthor({ registry: frozen, reads: { ...reads, 'market-brief': reads[eligibleId] }, briefs, groups, runContext, finalBudget: finalBudget(), identity: authorIdentity(), authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(selfConsumed.ok, false);
  assert.equal(selfConsumed.refusal.reason, 'aggregator-self-consumed');
});

test('owner disputes thin baselines and shared source origins remain context or conflict', async () => {
  // Shared source origins: two compatible origins citing the SAME evidence merge into ONE group counted
  // once, and the merged confidence is the MINIMUM retained origin score (never averaged or raised).
  const merged = mergedScenario('pre-close');
  assert.equal(merged.groups.groups.length, 1);
  assert.equal(merged.groups.groups[0].independentOriginCount, 1);
  assert.equal(merged.groups.groups[0].sharedEvidenceOrigin, true);
  assert.equal(merged.groups.groups[0].mergedConfidenceScore, 50);
  const mergedResult = await runFinalAuthor({ ...merged, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(mergedResult.ok, true, mergedResult.ok ? '' : JSON.stringify(mergedResult.refusal));
  assert.equal(mergedResult.final.actions.length, 1);
  assert.equal(mergedResult.final.actions[0].mergedConfidenceScore, 50);

  // A disputed/unusual observation stays bounded educational context; the genuine direction conflict stays
  // a visible conflict — neither consumes an action slot or is hidden.
  const conflict = conflictScenario('pre-close', { lowNoiseResults: [{ observationRef: 'obs-disputed-tape', destination: 'context', suppressionReason: 'provider-dispute', subjects: ['NVDA'] }] });
  assert.ok(conflict.groups.conflicts.length >= 1);
  const conflictResult = await runFinalAuthor({ ...conflict, authorFn: envelopeFinalAuthorFn('valid') });
  assert.equal(conflictResult.ok, true, conflictResult.ok ? '' : JSON.stringify(conflictResult.refusal));
  assert.equal(conflictResult.final.conflicts.length, conflict.groups.conflicts.length);
  assert.equal(conflictResult.final.attention.length, 1);
  assert.equal(conflictResult.final.attention[0].destination, 'context');
  // The disputed observation's subject is NOT promoted into any action slot.
  const actionSubjects = new Set(conflictResult.final.actions.flatMap((action) => action.subjects));
  assert.equal(actionSubjects.has('NVDA'), false);
});
