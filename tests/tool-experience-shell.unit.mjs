import assert from 'node:assert/strict';
import test from 'node:test';
import {
  loadProductionApi,
  readJson,
  readProductionSource
} from './tool-experience.support.mjs';

function actualRegistry() {
  return readJson('tools.json');
}

function actualConfig() {
  return readJson('tool-experience.config.json');
}

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath}`);
  return result.value;
}

test('SCN-012-031 registry resolves exact ordinary and Market Action four-view shells', () => {
  const api = loadProductionApi();
  const config = actualConfig();
  const registry = actualRegistry();
  assert.deepEqual(config.migrationPolicy, {
    contractVersion: 'experience-migration-policy/v1',
    phase: 'shell-canary',
    shadowOnly: true,
    visibleModeCutover: false,
    panelBootstrap: true
  });
  const ordinary = requireValue(api.resolveShell(config, registry, 'market-heatmap-lab'));
  const center = requireValue(api.resolveShell(config, registry, 'market-brief'));

  assert.deepEqual(ordinary.viewIds, ['simple', 'power', 'brief', 'journey']);
  assert.deepEqual(ordinary.labels, ['Simple', 'Power', 'Brief', 'Journey']);
  assert.equal(ordinary.defaultViewId, 'simple');
  assert.equal(ordinary.kind, 'ordinary');
  assert.deepEqual(center.viewIds, ['brief', 'portfolio', 'red-alert', 'journey']);
  assert.deepEqual(center.labels, ['Brief', 'Portfolio', 'Red Alert', 'Journey']);
  assert.equal(center.defaultViewId, 'brief');
  assert.equal(center.kind, 'market-action-center');
  assert.equal(Object.isFrozen(ordinary), true);
  assert.equal(Object.isFrozen(center), true);

  const unknown = api.resolveShell(config, registry, 'not-a-registered-tool');
  assert.equal(unknown.ok, false);
  assert.equal(unknown.error.code, 'E012-REGISTRY');
});

test('SCN-012-031 route resolution keeps only public modes and allowlisted public targets', () => {
  const api = loadProductionApi();
  const shell = requireValue(api.resolveShell(actualConfig(), actualRegistry(), 'market-heatmap-lab'));

  assert.deepEqual(requireValue(api.resolveRoute(shell, '', { publicTargetIds: [] })), {
    contractVersion: 'experience-route/v1',
    mode: 'simple',
    targetId: null,
    canonicalHash: '#simple',
    source: 'default',
    historyAction: 'replace',
    focusPolicy: 'browser-default',
    recovery: null,
    noFetch: true
  });
  assert.deepEqual(requireValue(api.resolveRoute(shell, '#power/current-evidence', {
    publicTargetIds: ['current-evidence']
  })), {
    contractVersion: 'experience-route/v1',
    mode: 'power',
    targetId: 'current-evidence',
    canonicalHash: '#power/current-evidence',
    source: 'hash',
    historyAction: 'none',
    focusPolicy: 'target-after-render',
    recovery: null,
    noFetch: true
  });

  const invalidMode = requireValue(api.resolveRoute(shell, '#private-portfolio/account-7', {
    publicTargetIds: ['current-evidence']
  }));
  assert.equal(invalidMode.mode, 'simple');
  assert.equal(invalidMode.targetId, null);
  assert.equal(invalidMode.canonicalHash, '#simple');
  assert.equal(invalidMode.historyAction, 'replace');
  assert.equal(invalidMode.focusPolicy, 'mode-heading');
  assert.equal(invalidMode.recovery, 'view-link-not-available');

  const invalidTarget = requireValue(api.resolveRoute(shell, '#power/private-session-7', {
    publicTargetIds: ['current-evidence']
  }));
  assert.equal(invalidTarget.mode, 'power');
  assert.equal(invalidTarget.targetId, null);
  assert.equal(invalidTarget.canonicalHash, '#power');
  assert.equal(invalidTarget.historyAction, 'replace');
  assert.equal(invalidTarget.focusPolicy, 'mode-heading');
  assert.equal(invalidTarget.recovery, 'view-link-not-available');
});

test('SCN-012-031 explicit hash wins over valid versioned mode-only local state', () => {
  const api = loadProductionApi();
  const shell = requireValue(api.resolveShell(actualConfig(), actualRegistry(), 'market-heatmap-lab'));
  const record = requireValue(api.createModeRecord(shell, 'power', '2026-07-23T08:00:00Z'));

  assert.deepEqual(record, {
    contractVersion: 'experience-mode/v1',
    toolId: 'market-heatmap-lab',
    mode: 'power',
    savedAt: '2026-07-23T08:00:00Z'
  });
  assert.deepEqual(Object.keys(record), ['contractVersion', 'toolId', 'mode', 'savedAt']);

  const local = requireValue(api.resolveRoute(shell, '', { localModeRecord: record, publicTargetIds: [] }));
  assert.equal(local.mode, 'power');
  assert.equal(local.source, 'local');
  assert.equal(local.historyAction, 'replace');
  const explicit = requireValue(api.resolveRoute(shell, '#brief', { localModeRecord: record, publicTargetIds: [] }));
  assert.equal(explicit.mode, 'brief');
  assert.equal(explicit.source, 'hash');
  assert.equal(explicit.historyAction, 'none');

  assert.equal(requireValue(api.restoreModeRecord(shell, record)).mode, 'power');
  assert.equal(requireValue(api.restoreModeRecord(shell, { ...record, toolId: 'other-tool' })), null);
  assert.equal(requireValue(api.restoreModeRecord(shell, { ...record, privateTicker: 'SENTINEL' })), null);
  assert.equal(requireValue(api.restoreModeRecord(shell, { ...record, contractVersion: 'experience-mode/v2' })), null);
});

test('SCN-012-031 user transitions push once while Back and Forward restore without fetch', () => {
  const api = loadProductionApi();
  const shell = requireValue(api.resolveShell(actualConfig(), actualRegistry(), 'market-heatmap-lab'));
  const initial = requireValue(api.resolveRoute(shell, '#simple', { publicTargetIds: [] }));
  const selected = requireValue(api.transitionRoute(shell, initial, {
    type: 'select',
    mode: 'brief',
    savedAt: '2026-07-23T08:01:00Z'
  }));
  assert.equal(selected.route.mode, 'brief');
  assert.equal(selected.route.canonicalHash, '#brief');
  assert.equal(selected.historyAction, 'push');
  assert.equal(selected.focusPolicy, 'selected-tab');
  assert.equal(selected.noFetch, true);
  assert.equal(selected.recompute, false);
  assert.deepEqual(Object.keys(selected.modeRecord), ['contractVersion', 'toolId', 'mode', 'savedAt']);

  const unchanged = requireValue(api.transitionRoute(shell, selected.route, {
    type: 'select',
    mode: 'brief',
    savedAt: '2026-07-23T08:02:00Z'
  }));
  assert.equal(unchanged.historyAction, 'none');

  const restored = requireValue(api.transitionRoute(shell, selected.route, {
    type: 'popstate',
    hash: '#power',
    focusInsideControl: false
  }));
  assert.equal(restored.route.mode, 'power');
  assert.equal(restored.historyAction, 'none');
  assert.equal(restored.focusPolicy, 'preserve');
  assert.equal(restored.noFetch, true);
  assert.equal(restored.recompute, false);

  const restoredFromControl = requireValue(api.transitionRoute(shell, restored.route, {
    type: 'popstate',
    hash: '#journey',
    focusInsideControl: true
  }));
  assert.equal(restoredFromControl.focusPolicy, 'selected-tab');
});

test('SCN-012-028 dependency projection exposes the exact Brief gate with no bypass', () => {
  const api = loadProductionApi();
  const state = {
    FEATURE002: {
      status: 'not_started',
      certification: { status: 'not_started' },
      milestones: []
    }
  };
  const gate = requireValue(api.projectDependencyGate(actualConfig(), 'FEATURE002', state));

  assert.equal(gate.contractVersion, 'dependency-gate-panel/v1');
  assert.equal(gate.state, 'dependency-pending');
  assert.equal(gate.heading, 'Dependency pending: Feature 002');
  assert.equal(gate.gateCode, 'E012-DEPENDENCY:feature-002');
  assert.equal(gate.observed.status, 'not_started');
  assert.equal(gate.observed.certificationStatus, 'not_started');
  assert.equal(gate.observed.matchedRequirementCount, 0);
  assert.equal(gate.observed.requiredRequirementCount, 4);
  assert.deepEqual(gate.withheldCapabilities, ['dynamic-tool-brief-v2', 'live-web-evidence', 'public-alert-publication']);
  assert.deepEqual(gate.preservedCapabilities, ['simple', 'power', 'journey', 'deterministic-local-evidence']);
  assert.equal(gate.bypassAllowed, false);
  assert.equal(gate.acceptanceGate, 'status=done; certification=done; milestones=4/4');
});

test('SCN-012-029 dependency projection preserves public Portfolio and creates no private-store contract', () => {
  const api = loadProductionApi();
  const gate = requireValue(api.projectDependencyGate(actualConfig(), 'FEATURE008', {
    FEATURE008: {
      status: 'not_started',
      certification: { status: 'not_started' },
      milestones: []
    }
  }));

  assert.equal(gate.heading, 'Dependency pending: Feature 008');
  assert.equal(gate.gateCode, 'E012-DEPENDENCY:feature-008');
  assert.deepEqual(gate.withheldCapabilities, ['private-portfolio-overlay', 'portfolio-stress-journey']);
  assert.deepEqual(gate.preservedCapabilities, ['public-watchlist-matrix', 'public-scope-journeys']);
  assert.equal(gate.bypassAllowed, false);
  assert.equal(JSON.stringify(gate).includes('rlPortfolio'), false);
  assert.equal(JSON.stringify(gate).includes('privateTicker'), false);
});

test('Scope 02 shell state helpers remain pure and contain no registry tool-ID switch', () => {
  const source = readProductionSource();
  const registry = actualRegistry();
  for (const tool of registry.tools) {
    assert.equal(source.includes(`"${tool.id}"`), false, `shared runtime must not branch on ${tool.id}`);
  }
  for (const forbidden of ['fetch(', 'providerFetch(', 'localStorage.', 'sessionStorage.', '.setItem(', 'XMLHttpRequest', 'WebSocket']) {
    assert.equal(source.includes(forbidden), false, `pure shell runtime must not own ${forbidden}`);
  }
});