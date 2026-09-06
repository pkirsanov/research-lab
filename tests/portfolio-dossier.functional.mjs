/* Feature 008 Scope 25 - decision-time dossier composition and durable local audit. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT, createStorage } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const api = require('../rlportfolio.js');
const analytics = require('../rlportfolioanalytics.js');
const policy = JSON.parse(readFileSync(resolve(ROOT, 'portfolio-survival-allocation.config.json'), 'utf8'));
const CREATED_AT = '2026-08-23T12:00:00.000Z';
const CORRECTED_AT = '2026-08-23T12:05:00.000Z';
const EXPORTED_AT = '2026-08-23T12:10:00.000Z';
const HASH = (character) => `sha256:${character.repeat(64)}`;

function decisionFold() {
  return analytics.evaluateDecisionFold({
    contractVersion: 'decision-fold-request/v1',
    trainingStart: '2026-01-02',
    trainingEnd: '2026-01-07',
    decisionCutoff: '2026-01-08T00:00:00.000Z',
    embargo: { contractVersion: 'decision-interval/v1', startDate: '2026-01-08', endDate: '2026-01-09' },
    purge: { contractVersion: 'decision-interval/v1', startDate: '2026-01-07', endDate: '2026-01-07' },
    rebalanceDate: '2026-01-12',
    applicationStart: '2026-01-12',
    applicationEnd: '2026-01-14',
    observations: [
      ['training-1', '2026-01-02', '2026-01-02T22:00:00.000Z', 0.01, false],
      ['training-2', '2026-01-05', '2026-01-05T22:00:00.000Z', -0.004, false],
      ['training-3', '2026-01-06', '2026-01-06T22:00:00.000Z', 0.008, false],
      ['purged', '2026-01-07', '2026-01-07T22:00:00.000Z', 0.30, false],
      ['application-1', '2026-01-12', '2026-01-12T22:00:00.000Z', 0.012, false],
      ['application-2', '2026-01-13', '2026-01-13T22:00:00.000Z', -0.009, true],
      ['application-3', '2026-01-14', '2026-01-14T22:00:00.000Z', 0.014, false]
    ].map(([observationId, date, availableAt, portfolioReturn, stress]) => ({
      contractVersion: 'decision-observation/v1', observationId, date, availableAt,
      portfolioReturn, sourceVintageId: HASH(stress ? 'b' : 'a'), stress
    })),
    sourceVintages: [
      { sourceId: 'fixture-bars', vintageId: HASH('a'), publishedAt: '2026-01-06T22:00:00.000Z' },
      { sourceId: 'fixture-stress', vintageId: HASH('b'), publishedAt: '2026-01-13T22:00:00.000Z' }
    ],
    fittedParameterIdentities: [HASH('c')],
    candidateIdentity: HASH('d'),
    costs: {
      contractVersion: 'decision-costs/v1', commissionFraction: 0.0004, spreadFraction: 0.0006,
      slippageFraction: 0.0005, turnoverFraction: 0.25, financingFraction: 0.0002,
      carryFraction: 0.0001, rebalanceTiming: 'application-start'
    }
  });
}

function append(apiResult, request) {
  assert.equal(apiResult.ok, true, JSON.stringify(apiResult.error || {}));
  const appended = api.appendDossierRecord(apiResult.value.dossier, request, policy);
  assert.equal(appended.ok, true, JSON.stringify(appended.error || {}));
  return appended;
}

test('BUG-008 dossier mapping: incomplete decision-fold request is request-invalid', () => {
  const complete = decisionFold();
  assert.equal(complete.state, 'ok');
  const incomplete = { ...complete.requestIdentityInput };
  delete incomplete.applicationEnd;

  const result = analytics.evaluateDecisionFold(incomplete);

  assert.equal(result.state, 'unavailable');
  assert.equal(result.reason, 'request-invalid');
});

test('TP-25-02 dossier reload corrections private export and clear preserve an immutable hash chain', () => {
  assert.equal(api.validatePolicy(policy).ok, true);
  const fold = decisionFold();
  assert.equal(fold.state, 'ok');
  const created = api.createResearchDossier({
    workspaceIdentity: HASH('e'),
    createdAt: CREATED_AT,
    policyFingerprints: [policy.solver.fingerprint, HASH('f')]
  }, policy);
  assert.equal(created.ok, true, JSON.stringify(created.error || {}));
  assert.equal(created.value.dossier.records.length, 1, 'creation itself is the first immutable record');

  let current = append(created, {
    recordType: 'decision-fold', createdAt: CREATED_AT,
    payloadIdentity: fold.foldId, payload: fold
  });
  current = append(current, {
    recordType: 'trial', createdAt: CREATED_AT,
    payloadIdentity: HASH('1'),
    payload: { contractVersion: 'TrialLedgerEntry/v1', sequence: 1, trialKind: 'method', trialIdentity: HASH('1'), selected: true }
  });
  const duplicateTrial = api.appendDossierRecord(current.value.dossier, {
    recordType: 'trial', createdAt: CREATED_AT,
    payloadIdentity: HASH('1'),
    payload: { contractVersion: 'TrialLedgerEntry/v1', sequence: 1, trialKind: 'method', trialIdentity: HASH('1'), selected: true }
  }, policy);
  assert.equal(duplicateTrial.ok, true);
  assert.equal(duplicateTrial.value.accepted, false);
  assert.equal(duplicateTrial.value.reason, 'duplicate-trial');
  assert.deepEqual(duplicateTrial.value.dossier, current.value.dossier);

  current = append(current, {
    recordType: 'claim', createdAt: CREATED_AT,
    payloadIdentity: HASH('2'),
    payload: {
      contractVersion: 'DossierClaim/v1',
      claim: 'Observed walk-forward evidence is descriptive and does not establish future superiority.',
      invalidationConditions: ['source-vintage-changed', 'decision-clock-changed']
    }
  });
  const claimRecord = current.value.record;
  const beforeCorrection = JSON.parse(JSON.stringify(current.value.dossier));
  const corrected = api.appendDossierCorrection(current.value.dossier, {
    correctsRecordId: claimRecord.recordId,
    reason: 'Clarify the evidence boundary without rewriting the original claim.',
    replacementPayloadIdentity: HASH('3'),
    invalidationEffect: 'supersedes-for-current-reading',
    createdAt: CORRECTED_AT
  }, policy);
  assert.equal(corrected.ok, true, JSON.stringify(corrected.error || {}));
  assert.deepEqual(corrected.value.dossier.records.slice(0, -1), beforeCorrection.records,
    'a correction appends and leaves every prior byte-addressed record unchanged');
  assert.equal(corrected.value.record.recordType, 'correction');
  assert.equal(corrected.value.record.payload.correctsRecordId, claimRecord.recordId);
  assert.equal(corrected.value.dossier.headRecordHash, corrected.value.record.contentSha256);
  assert.equal(api.validateResearchDossier(corrected.value.dossier, policy).ok, true);

  const localStorage = createStorage();
  const dossierStore = api.createDossierStore({ localStorage }, policy);
  const opened = dossierStore.openDossiers(CREATED_AT);
  assert.equal(opened.ok, true);
  assert.equal(opened.value.collection.generation, 0);
  const committed = dossierStore.commitDossier(corrected.value.dossier, 0, CORRECTED_AT);
  assert.equal(committed.ok, true, JSON.stringify(committed.error || {}));
  assert.equal(committed.value.collection.generation, 1);
  const reloaded = api.createDossierStore({ localStorage }, policy).openDossiers(EXPORTED_AT);
  assert.equal(reloaded.ok, true, JSON.stringify(reloaded.error || {}));
  assert.deepEqual(reloaded.value.collection.dossiers[0], corrected.value.dossier);
  assert.equal(api.validateResearchDossier(reloaded.value.collection.dossiers[0], policy).ok, true);

  const fields = ['header', 'records', 'corrections', 'provenance'];
  const preview = api.previewDossierExport({ dossier: corrected.value.dossier, fields }, policy);
  assert.equal(preview.ok, true, JSON.stringify(preview.error || {}));
  assert.deepEqual(preview.value.selectedFields, fields);
  assert.equal(preview.value.recordCount, corrected.value.dossier.records.length);
  assert.equal(preview.value.publicUrl, null);
  assert.equal(preview.value.personalValuesIncluded, true);
  const exported = api.exportDossierPrivate({
    dossier: corrected.value.dossier, fields, userGesture: true, exportedAt: EXPORTED_AT
  }, policy);
  assert.equal(exported.ok, true, JSON.stringify(exported.error || {}));
  assert.equal(exported.value.publicUrl, null);
  assert.equal(exported.value.networkRequest, null);
  assert.deepEqual(Object.keys(JSON.parse(exported.value.text)).sort(), fields.sort());

  const cleared = api.clearDossierStorage({ localStorage }, policy);
  assert.equal(cleared.ok, true, JSON.stringify(cleared.error || {}));
  assert.equal(cleared.value.verifiedEmpty, true);
  const afterClear = api.createDossierStore({ localStorage }, policy).openDossiers(EXPORTED_AT);
  assert.equal(afterClear.ok, true);
  assert.equal(afterClear.value.collection.dossiers.length, 0);
});

test('Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract', () => {
  const fold = decisionFold();
  assert.equal(fold.state, 'ok');
  const created = api.createResearchDossier({
    workspaceIdentity: HASH('e'), createdAt: CREATED_AT, policyFingerprints: [HASH('f')]
  }, policy);
  assert.equal(created.ok, true);
  const withClaim = append(created, {
    recordType: 'claim', createdAt: CREATED_AT, payloadIdentity: HASH('2'),
    payload: { contractVersion: 'DossierClaim/v1', claim: 'Bounded claim', invalidationConditions: ['vintage-changed'] }
  });

  const rewrotePrior = JSON.parse(JSON.stringify(withClaim.value.dossier));
  rewrotePrior.records[0].payload.createdAt = CORRECTED_AT;
  assert.equal(api.validateResearchDossier(rewrotePrior, policy).ok, false,
    'in-place history mutation must break the content-addressed chain');

  const missingTarget = api.appendDossierCorrection(withClaim.value.dossier, {
    correctsRecordId: HASH('9'), reason: 'Missing target must refuse.',
    replacementPayloadIdentity: HASH('3'), invalidationEffect: 'supersedes-for-current-reading', createdAt: CORRECTED_AT
  }, policy);
  assert.equal(missingTarget.ok, false);
  assert.equal(missingTarget.error.reason, 'correction-target-missing');

  const incompleteCostFold = analytics.evaluateDecisionFold({
    ...fold.requestIdentityInput,
    costs: { ...fold.costs, spreadFraction: null }
  });
  assert.equal(incompleteCostFold.results.net.state, 'unavailable');
  assert.equal(incompleteCostFold.results.gross.state, 'gross-only');

  const malicious = JSON.parse(JSON.stringify(withClaim.value.dossier));
  malicious.records[1].payload.apiToken = `sk-${'x'.repeat(30)}`;
  const secretPreview = api.previewDossierExport({ dossier: malicious, fields: ['records'] }, policy);
  assert.equal(secretPreview.ok, false);
  assert.equal(secretPreview.error.reason, 'secret-shaped-content');

  const noGesture = api.exportDossierPrivate({
    dossier: withClaim.value.dossier, fields: ['header'], userGesture: false, exportedAt: EXPORTED_AT
  }, policy);
  assert.equal(noGesture.ok, false);
  assert.equal(noGesture.error.reason, 'user-gesture-required');

  const localStorage = createStorage();
  const store = api.createDossierStore({ localStorage }, policy);
  const committed = store.commitDossier(withClaim.value.dossier, 0, CORRECTED_AT);
  assert.equal(committed.ok, true);
  const snapshot = localStorage.snapshot();
  const pointer = JSON.parse(snapshot[policy.storage.dossierPointerKey]);
  localStorage.setItem(`${policy.storage.dossierNamespace}.${pointer.activeSlot}`, JSON.stringify({ broken: true }));
  const broken = api.createDossierStore({ localStorage }, policy).openDossiers(EXPORTED_AT);
  assert.equal(broken.ok, false);
  assert.equal(broken.error.code, 'P008-DOSSIER');
  assert.deepEqual(localStorage.snapshot()[policy.storage.dossierPointerKey], snapshot[policy.storage.dossierPointerKey],
    'a broken chain is refused without rewriting the active pointer');
});
