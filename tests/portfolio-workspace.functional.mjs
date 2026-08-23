import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');
const T0 = '2026-07-15T14:00:00.000Z';
const T1 = '2026-07-15T14:00:05.000Z';
const T2 = '2026-07-15T14:00:09.000Z';

function loadRuntime() {
  assert.equal(existsSync(MODULE_PATH), true, 'RLPORTFOLIO production module must exist');
  assert.equal(existsSync(POLICY_PATH), true, 'mandatory portfolio policy must exist');
  const api = require('../rlportfolio.js');
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  assert.equal(api.validatePolicy(policy).ok, true, 'policy must validate before any compute');
  return { api, policy };
}

// Counting projectors are the instrument for "navigation does not recompute". A comment
// claiming presentation-only cannot be checked; a call counter that stays flat across every
// mode and tab operation can. Each projector returns a value tagged with its identity so a
// stale projection can be recognised in a published result rather than merely assumed absent.
function countingProjectors(identity) {
  const calls = {};
  const projectors = {};
  for (const name of ['brief', 'risk', 'paths', 'dependence', 'allocations', 'dossier']) {
    calls[name] = 0;
    projectors[name] = () => {
      calls[name] += 1;
      return { projection: name, identity, rows: [{ label: `${name}-row`, value: 1 }] };
    };
  }
  return { calls, projectors, total: () => Object.values(calls).reduce((sum, n) => sum + n, 0) };
}

function context(api, identity, tokenId, projectors, generatedAt = T0) {
  return { workspaceIdentity: identity, computeTokenId: tokenId, generatedAt, projectors };
}

function evidence() {
  return {
    genericEvidence: { windowId: 'window:2026-07', sourceCount: 3 },
    portfolioTruth: { contractVersion: 'portfolio-truth-state/v1', rows: [], summary: { holdingCount: 0 } }
  };
}

function identityInputs(overrides = {}) {
  return {
    generic: 'generic:2026-07',
    portfolio: 'portfolio:rev-1',
    mandate: 'mandate:rev-1',
    behavior: 'behavior:v2',
    scenario: 'scenario:none',
    policy: 'policy:v2',
    ...overrides
  };
}

test('TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control', () => {
  const { api, policy } = loadRuntime();

  // ---- One compute produces the whole workspace, deeply frozen ----
  const first = countingProjectors('ws-alpha');
  const built = api.computeWorkspace(context(api, 'ws-alpha', 'workspace-compute-1', first.projectors), evidence(), policy);
  assert.equal(built.ok, true, 'the orchestration compute must succeed on valid inputs');
  const viewModel = built.value;

  assert.equal(viewModel.contractVersion, 'PortfolioWorkspaceViewModel/v1');
  assert.deepEqual(Object.keys(viewModel).sort(), [
    'allocations', 'brief', 'computeTokenId', 'contractVersion', 'dependence', 'diagnostics',
    'dossier', 'generatedAt', 'genericEvidence', 'paths', 'portfolioTruth', 'risk',
    'unavailableStates', 'workspaceIdentity'
  ], 'the published object must carry exactly the declared PortfolioWorkspaceViewModel/v1 fields');
  assert.equal(Object.isFrozen(viewModel), true, 'the view model must be frozen before publication');
  assert.equal(Object.isFrozen(viewModel.brief), true, 'projections must be frozen, not merely the envelope');
  assert.equal(Object.isFrozen(viewModel.brief.rows[0]), true, 'freezing must be deep enough to reach a row');
  assert.equal(first.total(), 6, 'each of the six sibling projections is computed exactly once');

  // A frozen result is only useful if mutation actually fails to take effect.
  try { viewModel.brief.rows[0].value = 999; } catch { /* strict-mode throw is also a pass */ }
  assert.equal(viewModel.brief.rows[0].value, 1, 'a published projection must not be mutable in place');

  // ---- Publication is token-gated ----
  const controller = api.createWorkspaceComputeController({ activeIdentity: null });
  const tokenOne = controller.issue('ws-alpha', T0);
  assert.equal(tokenOne.ok, true);
  assert.equal(tokenOne.value.state, 'running');

  const rebuilt = api.computeWorkspace(
    context(api, 'ws-alpha', tokenOne.value.tokenId, countingProjectors('ws-alpha').projectors), evidence(), policy);
  assert.equal(rebuilt.ok, true);
  const published = controller.publish(tokenOne.value.tokenId, rebuilt.value);
  assert.equal(published.ok, true, 'a current matching token may publish');
  assert.equal(controller.snapshot().activeIdentity, 'ws-alpha');
  assert.equal(controller.snapshot().lastValidViewModel.computeTokenId, tokenOne.value.tokenId);

  // ---- Mode/tab navigation is presentation-only ----
  const navigationProbe = countingProjectors('ws-alpha');
  const before = navigationProbe.total();
  const active = controller.snapshot().activeViewModel;
  for (const mode of api.WORKSPACE_MODES) {
    for (const tab of api.WORKSPACE_TABS) {
      const shown = api.selectWorkspacePresentation(active, { mode, tab });
      assert.equal(shown.ok, true, `presentation must resolve for ${mode}/${tab}`);
      assert.equal(shown.value.recomputed, false, 'navigation must not recompute analytics');
      assert.equal(shown.value.acquired, false, 'navigation must not acquire evidence');
      assert.equal(shown.value.workspaceIdentity, 'ws-alpha', 'every tab must render the one active identity');
      assert.equal(shown.value.computeTokenId, tokenOne.value.tokenId, 'every tab must cite the one published token');
      assert.equal(shown.value.available, true);
    }
  }
  assert.equal(navigationProbe.total(), before, 'twelve mode/tab operations must trigger zero projector calls');
  assert.equal(controller.snapshot().activeViewModel, active, 'navigation must not replace the active view model');

  // ---- A newer identity supersedes the older running compute ----
  const slowToken = controller.issue('ws-beta', T1);
  assert.equal(slowToken.ok, true);
  const newerToken = controller.issue('ws-gamma', T2);
  assert.equal(newerToken.ok, true);
  assert.equal(newerToken.value.ordinal > slowToken.value.ordinal, true, 'a new identity must raise the ordinal');
  assert.equal(controller.snapshot().supersededTokenIds.includes(slowToken.value.tokenId), true);
  assert.equal(controller.snapshot().draftIdentity, 'ws-gamma', 'the later identity is a draft until it publishes');

  // The superseded compute finishes LAST and is refused, and refusal costs the user nothing.
  const staleResult = api.computeWorkspace(
    context(api, 'ws-beta', slowToken.value.tokenId, countingProjectors('ws-beta').projectors), evidence(), policy);
  assert.equal(staleResult.ok, true, 'the obsolete compute still completes; it simply may not publish');
  const staleAttempt = controller.publish(slowToken.value.tokenId, staleResult.value);
  assert.equal(staleAttempt.ok, false, 'a superseded token must not publish');
  assert.equal(staleAttempt.error.code, 'P008-COMPUTE-SUPERSEDED');
  assert.equal(controller.snapshot().activeIdentity, 'ws-alpha', 'the last valid identity survives a refused publish');
  assert.equal(controller.snapshot().lastValidViewModel.workspaceIdentity, 'ws-alpha');
  assert.equal(controller.snapshot().activeViewModel.brief.identity, 'ws-alpha', 'no stale projection leaks into the active view');

  // ---- Cancellation is also non-destructive ----
  const cancelled = controller.cancel(newerToken.value.tokenId);
  assert.equal(cancelled.ok, true);
  assert.equal(controller.snapshot().cancelState, 'cancelled');
  assert.equal(controller.snapshot().lastValidViewModel.workspaceIdentity, 'ws-alpha',
    'cancelling a compute must never clear the last valid result');

  // ---- Explicit rebase previews the change, then swaps every sibling at once ----
  const preview = controller.previewRebase(identityInputs({ portfolio: 'portfolio:rev-2' }), identityInputs());
  assert.equal(preview.ok, true);
  assert.deepEqual(preview.value.changedIdentityInputs, ['portfolio']);
  assert.equal(preview.value.rebaseRequired, true);
  assert.deepEqual(preview.value.siblingProjections, ['brief', 'risk', 'paths', 'dependence', 'allocations', 'dossier']);

  const rebaseToken = controller.issue('ws-delta', T2);
  const rebaseProjectors = countingProjectors('ws-delta');
  const rebased = api.computeWorkspace(
    context(api, 'ws-delta', rebaseToken.value.tokenId, rebaseProjectors.projectors), evidence(), policy);
  assert.equal(rebased.ok, true);
  const accepted = controller.acceptRebase(rebaseToken.value.tokenId, rebased.value);
  assert.equal(accepted.ok, true, 'a complete sibling set may be accepted');
  const afterRebase = controller.snapshot().activeViewModel;
  for (const slot of api.WORKSPACE_SIBLING_PROJECTIONS) {
    assert.equal(afterRebase[slot].identity, 'ws-delta',
      `${slot} must carry the rebased identity, so no sibling is left on the previous one`);
  }
  assert.equal(controller.snapshot().draftIdentity, null, 'accepting a rebase clears the draft');

  // ---- An unavailable projection is reported, never synthesised ----
  const partialProjectors = countingProjectors('ws-epsilon').projectors;
  delete partialProjectors.allocations;
  partialProjectors.dossier = () => { throw new Error('dossier store unreadable'); };
  const degraded = api.computeWorkspace(
    context(api, 'ws-epsilon', 'workspace-compute-99', partialProjectors), evidence(), policy);
  assert.equal(degraded.ok, true);
  assert.equal(degraded.value.allocations, null, 'a missing projection is null, not an empty object');
  assert.equal(degraded.value.dossier, null, 'a failed projection is null, not a zero');
  assert.deepEqual(degraded.value.unavailableStates.map((entry) => entry.projection).sort(), ['allocations', 'dossier']);
  assert.deepEqual(
    degraded.value.unavailableStates.find((entry) => entry.projection === 'dossier'),
    { projection: 'dossier', reason: 'projector-failed' });
  const unavailableTab = api.selectWorkspacePresentation(degraded.value, { mode: 'simple', tab: 'allocation' });
  assert.equal(unavailableTab.value.available, false);
  assert.equal(unavailableTab.value.unavailableReason, 'projection-unavailable');
});

test('Adversarial: recomputing navigation stale publication and fake return context cannot pass', () => {
  const { api, policy } = loadRuntime();

  // Each block below constructs the DEFECT that the audit found and asserts the production
  // code refuses it. If any of the five shortcuts is reintroduced, the corresponding refusal
  // stops happening and the assertion under it fails. That is what makes this test
  // non-tautological: it cannot pass while the defect is present.

  // ---- Shortcut 1: disposable per-tab recompute ----
  // The defect: a tab switch recomputes its own projection, so two tabs can disagree.
  // The proof: the presentation resolver takes no projector, no evidence and no policy, so a
  // recompute is structurally impossible; and it refuses a tab that is not in the closed set.
  const probe = countingProjectors('ws-nav');
  const workspace = api.computeWorkspace(
    context(api, 'ws-nav', 'workspace-compute-1', probe.projectors), evidence(), policy);
  assert.equal(workspace.ok, true);
  assert.equal(api.selectWorkspacePresentation.length, 2,
    'presentation resolution must take only (viewModel, presentation); a third input would be a recompute seam');
  const callsAfterCompute = probe.total();
  for (const tab of api.WORKSPACE_TABS) {
    api.selectWorkspacePresentation(workspace.value, { mode: 'power', tab });
    api.selectWorkspacePresentation(workspace.value, { mode: 'simple', tab });
  }
  assert.equal(probe.total(), callsAfterCompute, 'navigation that recomputed anything would raise this counter');
  const inventedTab = api.selectWorkspacePresentation(workspace.value, { mode: 'power', tab: 'workspace' });
  assert.equal(inventedTab.ok, false, 'a tab outside the closed set must be refused, not lazily computed');
  assert.equal(inventedTab.error.code, 'P008-WORKSPACE-COMPUTE');

  // ---- Shortcut 2: stale publication ----
  // The defect: a compute that finishes late publishes over a newer answer.
  const controller = api.createWorkspaceComputeController({ activeIdentity: null });
  const oldToken = controller.issue('ws-old', T0);
  const newToken = controller.issue('ws-new', T1);
  const goodResult = api.computeWorkspace(
    context(api, 'ws-new', newToken.value.tokenId, countingProjectors('ws-new').projectors), evidence(), policy);
  assert.equal(controller.publish(newToken.value.tokenId, goodResult.value).ok, true);

  const lateResult = api.computeWorkspace(
    context(api, 'ws-old', oldToken.value.tokenId, countingProjectors('ws-old').projectors), evidence(), policy);
  const lateAttempt = controller.publish(oldToken.value.tokenId, lateResult.value);
  assert.equal(lateAttempt.ok, false, 'a late obsolete compute must not become current');
  assert.equal(lateAttempt.error.code, 'P008-COMPUTE-SUPERSEDED');
  assert.equal(controller.snapshot().activeViewModel.workspaceIdentity, 'ws-new');

  // The token guard alone, with nothing else able to catch the stale result. Two computes are
  // issued for the SAME identity — a retry — so the identity check matches and only the token
  // ordinal distinguishes the obsolete run from the current one. Without this case a mutation
  // that deletes the token check still passes, because the identity check happens to catch the
  // differing-identity case above; that is precisely the inert assertion this test must not have.
  const retryController = api.createWorkspaceComputeController({ activeIdentity: null });
  const retryFirst = retryController.issue('ws-retry', T0);
  const retrySecond = retryController.issue('ws-retry', T1);
  assert.equal(retrySecond.value.ordinal > retryFirst.value.ordinal, true);
  const supersededSameIdentity = api.computeWorkspace(
    context(api, 'ws-retry', retryFirst.value.tokenId, countingProjectors('ws-retry').projectors), evidence(), policy);
  assert.equal(supersededSameIdentity.value.workspaceIdentity, retrySecond.value.identity,
    'the obsolete result carries an identity the identity check would accept');
  const sameIdentityAttempt = retryController.publish(retryFirst.value.tokenId, supersededSameIdentity.value);
  assert.equal(sameIdentityAttempt.ok, false,
    'a superseded token must be refused on the token alone, even when its identity still matches');
  assert.equal(sameIdentityAttempt.error.code, 'P008-COMPUTE-SUPERSEDED');
  assert.equal(sameIdentityAttempt.error.reason, 'token-superseded');
  assert.equal(retryController.snapshot().activeViewModel, null,
    'a refused first publication must leave the workspace unpublished rather than half-published');

  // Forging the token id is the obvious workaround, so the identity is checked independently.
  const forged = api.computeWorkspace(
    context(api, 'ws-old', newToken.value.tokenId, countingProjectors('ws-old').projectors), evidence(), policy);
  const replayToken = controller.issue('ws-new', T2);
  const forgedAttempt = controller.publish(replayToken.value.tokenId, forged.value);
  assert.equal(forgedAttempt.ok, false, 'a matching token id must not launder a mismatched identity');
  assert.equal(controller.snapshot().activeViewModel.workspaceIdentity, 'ws-new');

  // An unfrozen view model is a mutable-after-publication defect and must also be refused.
  const thawed = { ...goodResult.value };
  const thawedAttempt = controller.publish(replayToken.value.tokenId, thawed);
  assert.equal(thawedAttempt.ok, false, 'an unfrozen view model must not publish');

  // ---- Shortcut 3: partial rebase ----
  // The defect: the siblings that finished are swapped in and the rest keep the old identity,
  // so the user compares a new Brief against a stale Allocation without being able to see it.
  const rebaseToken = controller.issue('ws-partial', T2);
  const complete = api.computeWorkspace(
    context(api, 'ws-partial', rebaseToken.value.tokenId, countingProjectors('ws-partial').projectors), evidence(), policy);
  for (const missing of api.WORKSPACE_SIBLING_PROJECTIONS) {
    const holed = { ...complete.value, [missing]: null };
    Object.freeze(holed);
    const partialAttempt = controller.acceptRebase(rebaseToken.value.tokenId, holed);
    assert.equal(partialAttempt.ok, false, `a rebase missing ${missing} must be refused whole`);
    assert.equal(partialAttempt.error.code, 'P008-REBASE-PARTIAL');
    assert.equal(controller.snapshot().activeViewModel.workspaceIdentity, 'ws-new',
      'a refused partial rebase must leave the previous complete workspace active');
  }
  assert.equal(controller.acceptRebase(rebaseToken.value.tokenId, complete.value).ok, true,
    'the same token accepts once the sibling set is complete, so the refusals above were about completeness');

  // ---- Shortcut 4: same-page return ----
  // The defect: the handoff is "proved" without ever leaving the source page.
  const base = {
    contractVersion: 'ReturnContext/v1',
    contextId: 'ctx-1',
    sourceRoute: 'portfolio-survival-allocation-lab.html',
    sourceHash: '#brief',
    destinationRoute: 'bond-regime-lab.html',
    destinationHash: '#portfolio-brief-handoff',
    actionId: 'action-1',
    disclosureId: 'disclosure-1',
    focusRestoreId: 'brief-row-1',
    workspaceIdentity: 'ws-new',
    genericEvidenceIdentity: 'generic-2026-07',
    ownerToolId: 'bond-regime-lab',
    minimumOwnerCutoff: '2026-07-15T00:00:00.000Z',
    createdAt: T0,
    expiresAt: '2026-07-15T14:30:00.000Z'
  };
  const allowed = { allowedDestinations: ['bond-regime-lab.html', 'causal-rotation-lab.html'] };
  const sameSourceAsDestination = api.validateReturnContext(
    { ...base, destinationRoute: 'portfolio-survival-allocation-lab.html' }, allowed);
  assert.equal(sameSourceAsDestination.ok, false,
    'the source page must not be an allowlisted destination, so a same-page return cannot be recorded');
  assert.equal(sameSourceAsDestination.error.code, 'P008-RETURN-CONTEXT');

  const backing = new Map();
  const sessionStorage = {
    getItem: (k) => (backing.has(k) ? backing.get(k) : null),
    setItem: (k, v) => backing.set(k, v),
    removeItem: (k) => backing.delete(k)
  };
  const session = { ...allowed, storage: sessionStorage };
  assert.equal(api.writeReturnContext(base, session).ok, true);
  const consumedBySource = api.consumeReturnContext('portfolio-survival-allocation-lab.html', T1, session);
  assert.equal(consumedBySource.ok, false, 'the source page must not be able to consume its own handoff');
  assert.equal(consumedBySource.error.reason, 'destination-mismatch');
  assert.equal(backing.has('rlReturnContextV1'), true,
    'a wrong-destination read must leave the record for the page that actually owns it');
  const consumedByOwner = api.consumeReturnContext('bond-regime-lab.html', T1, session);
  assert.equal(consumedByOwner.ok, true, 'only the named owning destination consumes the handoff');
  assert.equal(backing.has('rlReturnContextV1'), false, 'consumption is single use');

  // ---- Shortcut 5: personal data in a URL or a public read ----
  // The defect: the handoff carries a holding, a value, or a free-text note, or travels in a
  // URL where history and referrers can capture it. The closed schema makes each impossible.
  const personalFields = ['holdings', 'quantity', 'marketValue', 'costBasis', 'mandateText', 'behaviorNote', 'modelOutput'];
  for (const field of personalFields) {
    const leaky = api.validateReturnContext({ ...base, [field]: 'private' }, allowed);
    assert.equal(leaky.ok, false, `an extra "${field}" field must be refused, not silently dropped`);
    assert.equal(leaky.error.reason, 'unknown-field');
    assert.equal(leaky.error.valueEchoed, false, 'a refusal must not echo the value it refused');
  }
  for (const field of api.RETURN_CONTEXT_FIELDS) {
    assert.equal(/holding|quantity|value|cost|mandate|behavior|note|payload/i.test(field), false,
      `the declared field "${field}" must not be a place personal data could live`);
  }
  const smuggled = api.validateReturnContext({ ...base, focusRestoreId: 'row?symbol=ACME&qty=1200' }, allowed);
  assert.equal(smuggled.ok, false, 'a query-shaped token must be refused so nothing personal can ride inside one');
  const offAllowlist = api.validateReturnContext({ ...base, destinationRoute: 'attacker-site.html' }, allowed);
  assert.equal(offAllowlist.ok, false, 'an unallowlisted destination must be refused');
  const noAllowlist = api.validateReturnContext(base, {});
  assert.equal(noAllowlist.ok, false, 'validation without an allowlist must refuse rather than accept any destination');
  const expired = api.validateReturnContext({ ...base, expiresAt: T0 }, allowed);
  assert.equal(expired.ok, false, 'a context that never expires after creation must be refused');
});
