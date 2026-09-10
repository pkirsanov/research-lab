import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { resolveNarrativeModelConfig } from '../scripts/brief-narrative-model-config.mjs';
import { findFreshNarrativeBreaches } from '../scripts/validate-brief-payload.mjs';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const snapshot = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));

function freshPayload() {
  return {
    asOf: snapshot.asOf,
    regime: { vix: { level: snapshot.regime.vix } },
    nextSession: {
      sessionDate: snapshot.nextSessionDate,
      actions: [{
        subject: `SPY ${snapshot.bench.px} structural posture`,
        rationale: `SPY ${snapshot.bench.px} remains the current benchmark anchor.`,
        structuralAnchor: `SPY ${snapshot.bench.px}`,
        trigger: `SPY ${snapshot.bench.px}`,
        invalidation: `SPY ${snapshot.bench.px}`
      }]
    },
    events: [{ when: snapshot.nextSessionDate, event: 'Current-session catalyst' }]
  };
}

test('freshness guard accepts current deterministic identities and refuses copied market claims', () => {
  const current = freshPayload();
  assert.deepEqual(findFreshNarrativeBreaches(current, snapshot), []);

  const copied = structuredClone(current);
  copied.regime.vix.level = snapshot.regime.vix + 1;
  copied.events[0].when = '2000-01-01';
  copied.nextSession.actions[0] = {
    subject: 'SPY carried forward', rationale: 'SPY carried forward', structuralAnchor: 'SPY carried forward',
    trigger: 'SPY carried forward', invalidation: 'SPY carried forward'
  };
  const breaches = findFreshNarrativeBreaches(copied, snapshot);
  assert.ok(breaches.some((entry) => entry.startsWith('regime.vix.level')));
  assert.ok(breaches.some((entry) => entry.startsWith('events[0].when')));
  assert.ok(breaches.some((entry) => entry.startsWith('nextSession.actions[0] names SPY')));
});

test('model profile is repository-owned with explicit environment overrides', () => {
  const declared = resolveNarrativeModelConfig({ root: ROOT, env: {} });
  assert.equal(declared.profile, 'local-omlx');
  assert.equal(declared.provider, 'omlx');
  assert.equal(declared.model, 'Ternary-Bonsai-27B-mlx-2bit');

  const overridden = resolveNarrativeModelConfig({ root: ROOT, env: { BRIEF_MODEL: 'next-local-model' } });
  assert.equal(overridden.profile, 'local-omlx');
  assert.equal(overridden.model, 'next-local-model');
});
