/*
 * tests/distributed-briefs.history.e2e.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Persistent-scenario regression over real artifacts in an isolated filesystem: a single-tool agent
 * resolves current + focused history through the pointer, one object, and one partition WITHOUT
 * reading any unrelated narrative; and duplicate projection, index rebuild, and pointer-swap rollback
 * preserve append-only authority.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet, validatePublishSet, regenerateIndexes, rollbackPublication, pointerBytes, selectHistory } from '../scripts/brief-publication.mjs';
import { buildResearchAgendaTransaction, composeResearchAgendaCandidate, computeResearchAgendaOutputs, promoteResearchAgendaTransaction, RESEARCH_AGENDA_CONTRACTS, validateResearchSituation } from '../scripts/research-agenda-generation.mjs';
import { buildRun, priorFromStaging, isolatedRoot, writeStagingToRoot } from './fixtures/feature-002/history/history-fixture-builder.mjs';

const RLAGENDA = createRequire(import.meta.url)('../rlagenda.js');

function buildPublishedFinding({ findingId, evidence, topic, definition, limitation }) {
  const finding = {
    findingId,
    observedAt: evidence.observedAt,
    claim: evidence.claim,
    publicSubjects: [
      { kind: 'channel', value: topic.scopeBoundary.channels[0] },
      { kind: 'public-ticker', value: definition.proxyDefinitions[0].ticker }
    ],
    horizon: 'swing',
    source: { sourceIds: [evidence.source.sourceId] },
    statedConfidence: evidence.confidence,
    provenanceClass: evidence.provenanceClass,
    evidenceRole: evidence.evidenceRole,
    evidenceRefs: [evidence.evidenceId],
    triggerRefs: [definition.triggers[0].triggerId],
    invalidationRefs: [definition.invalidations[0].invalidationId],
    causalPath: evidence.causalPath,
    refutedBy: evidence.refutedBy,
    limitations: [limitation]
  };
  const validated = RLAGENDA.validatePublishedFinding(finding, topic, definition, [evidence], [evidence.source]);
  assert.equal(validated.ok, true, JSON.stringify(validated));
  return validated.value;
}

function assertMissingPublicSubjectsRefusal({ situation, generationId, topic, definition, label }) {
  const invalidSituation = JSON.parse(JSON.stringify(situation));
  delete invalidSituation.findings[0].publicSubjects;
  const refusal = validateResearchSituation(invalidSituation, { generationId, topic, definition });
  assert.equal(refusal.ok, false, `${label}: missing publicSubjects must refuse before publication`);
  assert.deepEqual(refusal.error, {
    code: 'RLAGENDA-CONTRACT-MISSING-MEMBER',
    reason: 'finding-shape-invalid',
    field: 'publicSubjects',
    topicId: topic.topicId
  }, `${label}: refusal must name the exact missing finding member`);
}

test('Regression: SCN-002-007 one tool current and monthly history resolve without unrelated narrative reads', () => {
  const { dir, cleanup } = isolatedRoot();
  try {
    const first = buildPublishSet(buildRun({ seed: 'e1', runId: 'run-e1' })).staging;
    writeStagingToRoot(dir, first);
    const prior = priorFromStaging(first);
    const second = buildPublishSet(buildRun({ seed: 'e2', runId: 'run-e2', prior })).staging;
    writeStagingToRoot(dir, second);

    // A single-tool agent reads ONLY the files it needs; record every path it touches.
    const readSet = [];
    const read = (rel) => { readSet.push(rel); return readFileSync(path.join(dir, rel)); };

    const current = JSON.parse(read('briefs/current.json').toString('utf8'));
    const toolId = current.orderedSourceToolIds[0];
    const toolRef = current.tools[toolId];
    read(toolRef.readPath); // one complete read object answers current state

    const historyCurrent = JSON.parse(read('briefs/history-current.json').toString('utf8'));
    const index = JSON.parse(read(historyCurrent.historyIndexRef.path).toString('utf8'));
    const selection = selectHistory(index, { toolId, month: '2026-07' });
    assert.equal(selection.ok, true);
    assert.equal(selection.partitions.length, 1, 'exactly one monthly partition answers recent history');
    read(selection.partitions[0]);

    // Nothing unrelated is required: no other tool object, no final narrative, no evidence bundle,
    // no unrelated partition, no other month.
    const otherToolIds = current.orderedSourceToolIds.slice(1);
    for (const rel of readSet) {
      assert.ok(!rel.includes('/final-briefs/'), `must not read final narrative: ${rel}`);
      assert.ok(!rel.includes('/evidence/'), `must not read evidence bundle: ${rel}`);
      for (const other of otherToolIds) assert.ok(!rel.includes(`/${other}/`), `must not read unrelated tool ${other}: ${rel}`);
    }
    // The tool partition read is the selected tool's own month only.
    assert.ok(readSet.some((rel) => rel === `briefs/history/tools/${toolId}/2026-07.jsonl`));
    assert.ok(!readSet.some((rel) => /history\/(runs|final|evidence|recommendations)\//.test(rel)), 'no global-history stream scanned');
  } finally {
    cleanup();
  }
});

test('Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority', () => {
  const { dir, cleanup } = isolatedRoot();
  try {
    const runsPath = 'briefs/history/runs/2026-07.jsonl';
    const first = buildPublishSet(buildRun({ seed: 'r1', runId: 'run-r1' })).staging;
    writeStagingToRoot(dir, first);
    const prior = priorFromStaging(first);
    const second = buildPublishSet(buildRun({ seed: 'r2', runId: 'run-r2', prior })).staging;
    assert.equal(validatePublishSet(second, { priorStreams: prior.streams }).ok, true);
    writeStagingToRoot(dir, second);

    // Duplicate projection: re-building run 2 from identical input yields byte-identical artifacts.
    const secondAgain = buildPublishSet(buildRun({ seed: 'r2', runId: 'run-r2', prior })).staging;
    for (const p of Object.keys(second.files)) {
      assert.equal(second.files[p].sha256, secondAgain.files[p].sha256, `duplicate projection is byte-identical for ${p}`);
    }

    // Index rebuild from the on-disk authoritative partition reproduces the declared fingerprint.
    const onDiskRuns = readFileSync(path.join(dir, runsPath)).toString('utf8').split('\n').filter((l) => l.length > 0).map((l) => JSON.parse(l));
    const rebuilt = regenerateIndexes({ [runsPath]: onDiskRuns });
    assert.equal(rebuilt.partitions[runsPath].rowCount, 2, 'append-only authority: run 1 + run 2 rows both present');
    assert.equal(rebuilt.partitions[runsPath].sha256, second.indexes.partitions[runsPath].sha256);

    // Pointer-swap rollback to run 1 preserves append-only authority: run 2 objects remain; history keeps both rows.
    const run2Manifest = path.join(dir, second.pointers.current.manifestRef.path);
    const rollback = rollbackPublication({ pointer: first.pointers.current });
    assert.equal(rollback.ok, true);
    writeFileSync(path.join(dir, 'briefs/current.json'), pointerBytes(rollback.rollback.currentPointer));
    assert.ok(existsSync(run2Manifest), 'rollback never deletes run 2 objects');
    const runsAfter = readFileSync(path.join(dir, runsPath)).toString('utf8').split('\n').filter((l) => l.length > 0);
    assert.equal(runsAfter.length, 2, 'history partition still holds both appended rows after rollback');
  } finally {
    cleanup();
  }
});

test('SCN-019-016 real history resolves current and predecessor records without rewriting either', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rlagenda-history-'));
  const writes = [];
  const full = (relativePath) => path.join(root, relativePath);
  const readBytes = (relativePath) => readFileSync(path.join(root, relativePath));
  const readCommittedJson = (relativePath) => JSON.parse(readFileSync(new URL('../' + relativePath, import.meta.url), 'utf8'));
  const sourceRegistry = readCommittedJson('research-agenda.json');
  const topic = sourceRegistry.topics.find((row) => row.topicId === 'geopolitical-supply-shock');
  const registry = { ...sourceRegistry, topics: [topic] };
  const definition = readCommittedJson(topic.definitionRef);
  const calibration = readCommittedJson(definition.calibrationRef);
  const evidence = readCommittedJson('tests/fixtures/research-agenda/valid-evidence-record.json');
  const modelFixture = readCommittedJson('tests/fixtures/research-agenda/reversal-ui.json');
  const barIds = [...new Set([
    ...definition.transmissionModels.map((model) => model.barId),
    ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
  ])];
  const currentBars = Object.fromEntries(barIds.map((barId) => [barId, readCommittedJson(`data/bars/${barId}.json`)]));
  const pageInputs = {
    config: readCommittedJson('market-brief.config.json'),
    snapshot: readCommittedJson('market-brief.snapshot.json'),
    tools: readCommittedJson('tools.json')
  };
  const io = {
    exists: (relativePath) => existsSync(full(relativePath)),
    read: (relativePath) => readBytes(relativePath),
    create: (relativePath, bytes) => {
      mkdirSync(path.dirname(full(relativePath)), { recursive: true });
      writeFileSync(full(relativePath), bytes, { flag: 'wx' });
    },
    rename: (sourcePath, targetPath) => renameSync(full(sourcePath), full(targetPath)),
    remove: (relativePath) => rmSync(full(relativePath), { recursive: true, force: true }),
    afterStep: (step) => writes.push(step.path)
  };

  const buildTransaction = ({ sequence, generationCutoff, historyText, payload, existingRecordsByPath, priorDossier }) => {
    const generation = RLAGENDA.deriveGenerationId({
      snapshotDigest: RLAGENDA.sha256Text(`scn-019-016-snapshot-${sequence}`),
      registryDigest: RLAGENDA.agendaDigest(registry),
      briefWindow: {
        start: new Date(Date.parse(generationCutoff) - 60 * 60 * 1000).toISOString(),
        end: generationCutoff
      },
      generationCutoff
    });
    assert.equal(generation.ok, true, JSON.stringify(generation));
    const plan = {
      ok: true,
      refusals: [],
      selected: [{ topicId: topic.topicId, mode: topic.reviewPolicy.mode, reason: 'mode-required' }],
      classifications: [{
        topicId: topic.topicId,
        lifecycleState: 'active',
        mode: topic.reviewPolicy.mode,
        status: 'selected',
        reason: 'mode-required'
      }]
    };
    const finding = buildPublishedFinding({
      findingId: `scn-019-016-finding-${sequence}`,
      evidence,
      topic,
      definition,
      limitation: 'SCN-019-016 deterministic publication fixture.'
    });
    const situation = {
      contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
      generationId: generation.id,
      topicId: topic.topicId,
      authoredAt: generationCutoff,
      completePass: true,
      evidenceRecords: [evidence],
      sectionInterpretations: definition.analyticalSections.map((section) => ({
        sectionId: section.sectionId,
        status: 'changed',
        interpretation: `SCN-019-016 production fixture ${sequence}.`,
        gaps: []
      })),
      findings: [finding],
      sourceLedger: [evidence.source],
      newEvidenceIds: [evidence.evidenceId],
      modelInputs: {
        chokepointState: modelFixture.chokepointState,
        inventoryGapByChannel: modelFixture.inventoryGapByChannel,
        levers: modelFixture.levers
      }
    };
    if (sequence === 1) {
      assertMissingPublicSubjectsRefusal({
        situation,
        generationId: generation.id,
        topic,
        definition,
        label: 'TP-02-07 history fixture'
      });
    }
    const deterministicOutputs = computeResearchAgendaOutputs({
      definition,
      calibration,
      situation,
      currentBars,
      generationCutoff,
      declaredQuestion: topic.declaredQuestion,
      predecessorOutput: null
    });
    assert.equal(deterministicOutputs.ok, true, JSON.stringify(deterministicOutputs));
    const candidate = composeResearchAgendaCandidate({
      registry,
      plan,
      definitionsByTopicId: { [topic.topicId]: definition },
      generationId: generation.id,
      generationCutoff,
      situationsByTopicId: { [topic.topicId]: situation },
      deterministicOutputsByTopicId: { [topic.topicId]: deterministicOutputs.value },
      priorDossiersByTopicId: priorDossier ? { [topic.topicId]: priorDossier } : {}
    });
    assert.equal(candidate.ok, true, JSON.stringify(candidate));
    const transaction = buildResearchAgendaTransaction({
      candidate: candidate.value,
      payload,
      historyText,
      registry,
      existingRecordsByPath,
      pageInputs
    });
    assert.equal(transaction.ok, true, JSON.stringify(transaction));
    return { candidate: candidate.value, transaction: transaction.value };
  };

  try {
    const predecessorRun = buildTransaction({
      sequence: 1,
      generationCutoff: '2026-08-13T12:00:00.000Z',
      historyText: '',
      payload: readCommittedJson('market-brief.payload.json'),
      existingRecordsByPath: {},
      priorDossier: null
    });
    const predecessor = predecessorRun.candidate.dossiers[0];
    assert.ok(predecessor, 'the production chain creates a non-historical active predecessor dossier');
    const predecessorPath = Object.keys(predecessorRun.transaction.immutableFiles)
      .find((relativePath) => relativePath.includes('/dossiers/'));
    const predecessorPromotion = promoteResearchAgendaTransaction(predecessorRun.transaction, io);
    assert.equal(predecessorPromotion.ok, true, JSON.stringify(predecessorPromotion));
    assert.deepEqual(writes, predecessorRun.transaction.writeOrder);
    assert.equal(predecessorPromotion.value.pointerLast, 'research/agenda/current.json');
    assert.equal(writes.at(-1), 'research/agenda/current.json', 'production promotion moves the current pointer last');
    const predecessorBytesBefore = readBytes(predecessorPath);
    const predecessorHistoryBytes = readBytes('research/agenda/history.jsonl');

    writes.length = 0;
    const currentRun = buildTransaction({
      sequence: 2,
      generationCutoff: '2026-08-13T12:10:00.000Z',
      historyText: predecessorRun.transaction.mutableFiles['research/agenda/history.jsonl'],
      payload: predecessorRun.transaction.payload,
      existingRecordsByPath: predecessorRun.transaction.recordsByPath,
      priorDossier: predecessor
    });
    const currentDossier = currentRun.candidate.dossiers[0];
    assert.ok(currentDossier, 'the second production transaction creates an updated active dossier');
    const currentDossierPath = Object.keys(currentRun.transaction.immutableFiles)
      .find((relativePath) => relativePath.includes('/dossiers/'));
    const currentPromotion = promoteResearchAgendaTransaction(currentRun.transaction, io);
    assert.equal(currentPromotion.ok, true, JSON.stringify(currentPromotion));
    assert.deepEqual(writes, currentRun.transaction.writeOrder);
    assert.equal(currentRun.transaction.writeOrder.at(-1), 'research/agenda/current.json');
    assert.equal(currentPromotion.value.pointerLast, 'research/agenda/current.json');
    assert.equal(writes.at(-1), 'research/agenda/current.json', 'the production transaction keeps the current pointer last');

    const diskPointer = JSON.parse(readBytes('research/agenda/current.json').toString('utf8'));
    const diskRecords = {};
    diskRecords[diskPointer.generationRef.path] = JSON.parse(readBytes(diskPointer.generationRef.path).toString('utf8'));
    const diskTopicRef = diskPointer.topicRefs[0];
    diskRecords[diskTopicRef.reviewRef.path] = JSON.parse(readBytes(diskTopicRef.reviewRef.path).toString('utf8'));
    diskRecords[diskTopicRef.dossierRef.path] = JSON.parse(readBytes(diskTopicRef.dossierRef.path).toString('utf8'));
    diskRecords[predecessorPath] = JSON.parse(readBytes(predecessorPath).toString('utf8'));
    const resolved = RLAGENDA.validateCurrentPointer(diskPointer, diskRecords);
    assert.equal(resolved.ok, true, 'the real pointer resolves through all immutable records');
    const diskDossier = diskRecords[currentDossierPath];
    const expectedPredecessorRef = RLAGENDA.buildArtifactRef(predecessorPath, diskRecords[predecessorPath]);
    assert.equal(expectedPredecessorRef.ok, true, JSON.stringify(expectedPredecessorRef));
    for (const field of ['predecessorDossierRef', 'supersedesDossierRef']) {
      assert.deepEqual(diskDossier[field], expectedPredecessorRef.ref, `${field} resolves to the prior active dossier`);
      assert.equal(diskRecords[diskDossier[field].path].dossierId, predecessor.dossierId);
      assert.equal(diskRecords[diskDossier[field].path].historicalOnly, false);
    }

    const currentBytesBefore = readBytes(currentDossierPath);
    const overwrite = RLAGENDA.prepareImmutableCreate(
      currentDossierPath,
      { ...diskDossier, attemptedMutation: true },
      currentRun.transaction.recordsByPath
    );
    assert.equal(overwrite.ok, false);
    assert.equal(overwrite.code, 'RLAGENDA-IMMUTABLE-OVERWRITE');
    assert.deepEqual(readBytes(predecessorPath), predecessorBytesBefore, 'predecessor bytes remain unchanged');
    assert.deepEqual(readBytes(currentDossierPath), currentBytesBefore, 'current dossier bytes remain unchanged');
    const currentHistoryBytes = readBytes('research/agenda/history.jsonl');
    assert.equal(
      currentHistoryBytes.subarray(0, predecessorHistoryBytes.length).equals(predecessorHistoryBytes),
      true,
      'append-only history preserves the complete predecessor byte prefix'
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event', () => {
  const sourceRegistry = JSON.parse(readFileSync(new URL('../research-agenda.json', import.meta.url), 'utf8'));
  const baseTopic = sourceRegistry.topics[0];
  const definition = JSON.parse(readFileSync(new URL('../' + baseTopic.definitionRef, import.meta.url), 'utf8'));
  const calibration = JSON.parse(readFileSync(new URL('../' + definition.calibrationRef, import.meta.url), 'utf8'));
  const evidence = JSON.parse(readFileSync(new URL('../tests/fixtures/research-agenda/valid-evidence-record.json', import.meta.url), 'utf8'));
  const modelFixture = JSON.parse(readFileSync(new URL('../tests/fixtures/research-agenda/reversal-ui.json', import.meta.url), 'utf8'));
  const barIds = [...new Set([
    ...definition.transmissionModels.map((model) => model.barId),
    ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
  ])];
  const currentBars = Object.fromEntries(barIds.map((barId) => [
    barId,
    JSON.parse(readFileSync(new URL(`../data/bars/${barId}.json`, import.meta.url), 'utf8'))
  ]));
  const historicalPath = 'research/agenda/dossiers/geopolitical-supply-shock/historical-2026-08-10-v1.json';
  const historicalBytes = readFileSync(new URL('../' + historicalPath, import.meta.url));
  const historical = JSON.parse(historicalBytes.toString('utf8'));
  const committedHistory = readFileSync(new URL('../research/agenda/history.jsonl', import.meta.url), 'utf8');
  const committedPayload = JSON.parse(readFileSync(new URL('../market-brief.payload.json', import.meta.url), 'utf8'));
  const pageInputs = {
    config: JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8')),
    snapshot: JSON.parse(readFileSync(new URL('../market-brief.snapshot.json', import.meta.url), 'utf8')),
    tools: JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'))
  };
  const cutoffs = [
    '2026-08-13T12:00:00.000Z', '2026-08-13T12:10:00.000Z',
    '2026-08-13T12:20:00.000Z', '2026-08-13T12:30:00.000Z',
    '2026-08-13T13:00:00.000Z', '2026-08-13T13:10:00.000Z',
    '2026-08-13T13:20:00.000Z', '2026-08-13T13:30:00.000Z'
  ];

  const historyEvents = (text, topicId) => text.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line))
    .filter((event) => event.eventType === 'lifecycle' && event.topicId === topicId);

  const buildCandidate = ({ lifecycleState, sequence, priorDossier }) => {
    const topic = { ...baseTopic, lifecycleState };
    const registry = { ...sourceRegistry, topics: [topic] };
    const generationCutoff = cutoffs[sequence];
    const generation = RLAGENDA.deriveGenerationId({
      snapshotDigest: 'sha256:' + String(sequence + 1).repeat(64),
      registryDigest: RLAGENDA.agendaDigest(registry),
      briefWindow: {
        start: new Date(Date.parse(generationCutoff) - 60 * 60 * 1000).toISOString(),
        end: generationCutoff
      },
      generationCutoff
    });
    const selected = lifecycleState === 'active';
    const reason = selected ? 'mode-required' : `lifecycle-${lifecycleState}`;
    const plan = {
      ok: true,
      refusals: [],
      selected: selected ? [{ topicId: topic.topicId, mode: topic.reviewPolicy.mode, reason }] : [],
      classifications: [{
        topicId: topic.topicId,
        lifecycleState,
        mode: topic.reviewPolicy.mode,
        status: selected ? 'selected' : lifecycleState,
        reason
      }]
    };
    const finding = buildPublishedFinding({
      findingId: `gap-08-finding-${sequence + 1}`,
      evidence,
      topic,
      definition,
      limitation: 'TP-02-08 lifecycle transaction fixture.'
    });
    const situation = {
      contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
      generationId: generation.id,
      topicId: topic.topicId,
      authoredAt: generationCutoff,
      completePass: true,
      evidenceRecords: [evidence],
      sectionInterpretations: definition.analyticalSections.map((section) => ({
        sectionId: section.sectionId,
        status: 'changed',
        interpretation: 'TP-02-08 current fixture interpretation.',
        gaps: []
      })),
      findings: [finding],
      sourceLedger: [evidence.source],
      newEvidenceIds: [evidence.evidenceId],
      modelInputs: {
        chokepointState: modelFixture.chokepointState,
        inventoryGapByChannel: modelFixture.inventoryGapByChannel,
        levers: modelFixture.levers
      }
    };
    if (selected && sequence % 4 === 0) {
      assertMissingPublicSubjectsRefusal({
        situation,
        generationId: generation.id,
        topic,
        definition,
        label: `TP-02-08 ${lifecycleState} fixture`
      });
    }
    const deterministicOutputs = selected ? computeResearchAgendaOutputs({
      definition,
      calibration,
      situation,
      currentBars,
      generationCutoff,
      declaredQuestion: topic.declaredQuestion,
      predecessorOutput: null
    }) : null;
    if (selected) assert.equal(deterministicOutputs.ok, true, JSON.stringify(deterministicOutputs));
    const candidate = composeResearchAgendaCandidate({
      registry,
      plan,
      definitionsByTopicId: { [topic.topicId]: definition },
      generationId: generation.id,
      generationCutoff,
      situationsByTopicId: selected ? { [topic.topicId]: situation } : {},
      deterministicOutputsByTopicId: selected ? { [topic.topicId]: deterministicOutputs.value } : {},
      priorDossiersByTopicId: priorDossier ? { [topic.topicId]: priorDossier } : {}
    });
    assert.equal(candidate.ok, true, JSON.stringify(candidate));
    return { candidate: candidate.value, registry };
  };

  for (const [caseIndex, terminalState] of ['paused', 'retired'].entries()) {
    let historyText = committedHistory;
    let payload = committedPayload;
    let recordsByPath = { [historicalPath]: historical };
    const lifecycleBefore = historyEvents(historyText, baseTopic.topicId).length;

    const transact = (lifecycleState, sequence, priorDossier) => {
      const input = buildCandidate({ lifecycleState, sequence, priorDossier });
      const transactionInput = {
        candidate: input.candidate,
        payload,
        historyText,
        registry: input.registry,
        existingRecordsByPath: recordsByPath,
        pageInputs
      };
      const transaction = buildResearchAgendaTransaction(transactionInput);
      assert.equal(transaction.ok, true, JSON.stringify(transaction));
      const replay = buildResearchAgendaTransaction(transactionInput);
      assert.equal(replay.ok, true, JSON.stringify(replay));
      assert.equal(replay.value.transactionFingerprint, transaction.value.transactionFingerprint, 'same transaction input preserves its deterministic fingerprint');
      assert.equal(replay.value.mutableFiles['research/agenda/history.jsonl'], transaction.value.mutableFiles['research/agenda/history.jsonl'], 'same transaction input preserves deterministic lifecycle bytes');
      return { ...input, transaction: transaction.value };
    };

    const initial = transact('active', caseIndex * 4, null);
    const initialLifecycle = historyEvents(initial.transaction.mutableFiles['research/agenda/history.jsonl'], baseTopic.topicId);
    assert.equal(initialLifecycle.length, lifecycleBefore, 'initial active generation does not duplicate the committed active lifecycle event');
    const baselineEvent = initialLifecycle.at(-1);
    assert.equal(baselineEvent.fromState, null);
    assert.equal(baselineEvent.toState, 'active');
    assert.equal(baselineEvent.supersedesEventId, null);
    assert.equal(baselineEvent.registryTopicSha256, RLAGENDA.agendaDigest(initial.registry.topics[0]));
    const priorDossier = initial.candidate.dossiers[0];
    assert.ok(priorDossier, 'initial active review creates the immutable predecessor dossier');
    const priorDossierPath = Object.keys(initial.transaction.immutableFiles).find((relativePath) => relativePath.includes('/dossiers/'));
    const priorDossierBytes = initial.transaction.immutableFiles[priorDossierPath];
    historyText = initial.transaction.mutableFiles['research/agenda/history.jsonl'];
    payload = initial.transaction.payload;
    recordsByPath = initial.transaction.recordsByPath;

    const beforeTransitionHistory = historyText;
    const transition = transact(terminalState, caseIndex * 4 + 1, priorDossier);
    const transitionHistory = transition.transaction.mutableFiles['research/agenda/history.jsonl'];
    const transitionEvents = historyEvents(transitionHistory, baseTopic.topicId);
    assert.equal(transitionEvents.length, lifecycleBefore + 1, `active to ${terminalState} emits one lifecycle event`);
    const terminalEvent = transitionEvents.at(-1);
    assert.equal(terminalEvent.fromState, 'active');
    assert.equal(terminalEvent.toState, terminalState);
    assert.equal(terminalEvent.supersedesEventId, baselineEvent.eventId);
    assert.equal(terminalEvent.registryTopicSha256, RLAGENDA.agendaDigest(transition.registry.topics[0]));
    assert.equal(transitionHistory.startsWith(beforeTransitionHistory), true, 'the transition preserves the prior history byte prefix');
    assert.equal(transition.transaction.current.topicRefs[0].state, terminalState);
    assert.equal(JSON.stringify(transition.transaction.recordsByPath[priorDossierPath], null, 2) + '\n', priorDossierBytes);
    assert.deepEqual(readFileSync(new URL('../' + historicalPath, import.meta.url)), historicalBytes);
    historyText = transitionHistory;
    payload = transition.transaction.payload;
    recordsByPath = transition.transaction.recordsByPath;

    const beforeRepeatHistory = historyText;
    const repeated = transact(terminalState, caseIndex * 4 + 2, priorDossier);
    const repeatedHistory = repeated.transaction.mutableFiles['research/agenda/history.jsonl'];
    assert.equal(historyEvents(repeatedHistory, baseTopic.topicId).length, lifecycleBefore + 1, `repeated ${terminalState} emits no duplicate lifecycle event`);
    assert.equal(repeatedHistory.startsWith(beforeRepeatHistory), true, 'the repeated generation preserves the prior history byte prefix');
    assert.equal(repeated.transaction.current.topicRefs[0].state, terminalState);
    historyText = repeatedHistory;
    payload = repeated.transaction.payload;
    recordsByPath = repeated.transaction.recordsByPath;

    const beforeReactivationHistory = historyText;
    const reactivated = transact('active', caseIndex * 4 + 3, priorDossier);
    const reactivatedHistory = reactivated.transaction.mutableFiles['research/agenda/history.jsonl'];
    const reactivatedEvents = historyEvents(reactivatedHistory, baseTopic.topicId);
    assert.equal(reactivatedEvents.length, lifecycleBefore + 2, `${terminalState} to active emits one lifecycle event`);
    const reactivationEvent = reactivatedEvents.at(-1);
    assert.equal(reactivationEvent.fromState, terminalState);
    assert.equal(reactivationEvent.toState, 'active');
    assert.equal(reactivationEvent.supersedesEventId, terminalEvent.eventId, 'reactivation links to the prior lifecycle event');
    assert.equal(reactivationEvent.registryTopicSha256, RLAGENDA.agendaDigest(reactivated.registry.topics[0]));
    assert.equal(reactivatedHistory.startsWith(beforeReactivationHistory), true, 'reactivation preserves the prior history byte prefix');
    assert.equal(reactivated.transaction.current.topicRefs[0].state, 'reviewed');
    assert.equal(JSON.stringify(reactivated.transaction.recordsByPath[priorDossierPath], null, 2) + '\n', priorDossierBytes);
    assert.deepEqual(readFileSync(new URL('../' + historicalPath, import.meta.url)), historicalBytes);
  }
});
