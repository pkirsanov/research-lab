/*
 * BUG-006 Defect B — D16 is enforced on the publish path, and it is DIRECTION-AWARE.
 *
 * D16 (docs/Improvement-Plan.md): "No unscoreable tactical or swing call is published."
 *
 * The defect this pins: a published `hedge` (short-biased) call carried FOUR numerals in its
 * invalidation field and was still unscoreable, because every one of them was a `below` level.
 * recommendation-body.mjs re-attributes a `below` level on a short-biased call to the TRIGGER side —
 * correctly, because for a hedge a falling price means the hedge is WORKING — so zero invalidation
 * levels survived and the call resolved `not-evaluable`. The old gate only checked that the
 * invalidation field was non-empty TEXT, so it passed.
 *
 * Both directions are proved, in both outcomes. A one-sided test would not prove the rule:
 *   short-biased (hedge/trim) needs an ABOVE level   — a BELOW-only invalidation is refused
 *   long-biased  (add/rotate/hold) needs a BELOW level — an ABOVE-only invalidation is refused
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  D16_SCORED_HORIZONS,
  dropUnscoreableActions,
  findUnscoreableActions,
  requiredInvalidationRelation
} from '../scripts/validate-brief-payload.mjs';
import { buildRecommendationBody, loadInstrumentUniverse } from '../scripts/recommendation-body.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = resolve(ROOT, 'scripts/validate-brief-payload.mjs');
const UNIVERSE = loadInstrumentUniverse(ROOT);

/* A short-biased call. Its risk case is the market rallying AWAY from the hedge, so a scoreable
   invalidation level must be an ABOVE level. */
function hedgeAction(invalidation) {
  return {
    action: 'hedge',
    subject: 'Event-insurance residual carried into the next payroll print',
    rationale: 'A minimal residual keeps event risk covered without paying full carry.',
    structuralAnchor: 'The index remains on a rising long-term trend.',
    trigger: 'Run the residual off once SPY posts a completed daily close through the ~770.0 wall.',
    invalidation,
    horizon: 'tactical',
    confidence: 55,
    deepLink: 'gamma-trading-lab.html'
  };
}

/* A long-biased call. Its risk case is the market falling, so a scoreable invalidation level must
   be a BELOW level. */
function addAction(invalidation) {
  return {
    action: 'add',
    subject: 'Broad-momentum beta tranche taken on the confirmed breakout',
    rationale: 'The breakout is confirmed on closes and breadth, so the tranche is warranted.',
    structuralAnchor: 'The index holds its rising 200-day.',
    trigger: 'Add on a decisive SPY daily close reclaiming the ~758.0 shelf.',
    invalidation,
    horizon: 'swing',
    confidence: 60,
    deepLink: 'sector-research-lab.html'
  };
}

const HEDGE_WRONG_SIDE = 'A SPY daily close below the ~755.68 gamma flip argues to keep the residual on.';
const HEDGE_RIGHT_SIDE = 'A SPY daily close above the ~765.0 call wall means the residual was never needed; let it expire.';
const ADD_WRONG_SIDE = 'A SPY daily close above the ~790.0 extension marks the entry as chased.';
const ADD_RIGHT_SIDE = 'A SPY daily close below the ~745.0 fifty-day shelf breaks the tranche thesis.';

function payloadWith(actions) {
  const payload = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.payload.json'), 'utf8'));
  payload.nextSession = { ...payload.nextSession, actions };
  return payload;
}

function evaluabilityOf(action) {
  return buildRecommendationBody({ ...action }, { universe: UNIVERSE });
}

function runValidator(payload, flags) {
  const dir = mkdtempSync(join(tmpdir(), 'bug006-d16-'));
  const payloadPath = join(dir, 'market-brief.payload.json');
  writeFileSync(payloadPath, JSON.stringify(payload, null, 2) + '\n');
  const result = spawnSync(process.execPath, [VALIDATOR, payloadPath, ...flags], { cwd: ROOT, encoding: 'utf8' });
  return { ...result, payloadPath };
}

test('the shipped body builder really does refuse the wrong-side invalidation — the fixtures are not strawmen', () => {
  const hedgeWrong = evaluabilityOf(hedgeAction(HEDGE_WRONG_SIDE));
  assert.equal(hedgeWrong.evaluability, 'not-evaluable');
  assert.equal(hedgeWrong.evaluabilityReason, 'no-attributable-invalidation-level');
  assert.equal(hedgeWrong.levels.filter((level) => level.source === 'invalidation').length, 0,
    'a below level on a short-biased call is re-attributed to the trigger side');

  const hedgeRight = evaluabilityOf(hedgeAction(HEDGE_RIGHT_SIDE));
  assert.equal(hedgeRight.evaluability, 'machine-checkable');
  assert.ok(hedgeRight.levels.some((level) => level.source === 'invalidation' && level.relation === 'above'),
    'an above level on a short-biased call survives as the invalidation side');

  const addWrong = evaluabilityOf(addAction(ADD_WRONG_SIDE));
  assert.equal(addWrong.evaluability, 'not-evaluable');
  assert.equal(addWrong.evaluabilityReason, 'no-attributable-invalidation-level');

  const addRight = evaluabilityOf(addAction(ADD_RIGHT_SIDE));
  assert.equal(addRight.evaluability, 'machine-checkable');
  assert.ok(addRight.levels.some((level) => level.source === 'invalidation' && level.relation === 'below'),
    'a below level on a long-biased call survives as the invalidation side');
});

test('requiredInvalidationRelation states the side each action family must break on', () => {
  assert.equal(requiredInvalidationRelation('hedge'), 'above');
  assert.equal(requiredInvalidationRelation('trim'), 'above');
  assert.equal(requiredInvalidationRelation('add'), 'below');
  assert.equal(requiredInvalidationRelation('rotate'), 'below');
  assert.equal(requiredInvalidationRelation('hold'), 'below');
});

test('findUnscoreableActions refuses a wrong-side call and accepts the direction-correct one', () => {
  const refusedHedge = findUnscoreableActions(payloadWith([hedgeAction(HEDGE_WRONG_SIDE)]), { universe: UNIVERSE });
  assert.equal(refusedHedge.length, 1);
  assert.deepEqual(
    {
      index: refusedHedge[0].index,
      action: refusedHedge[0].action,
      horizon: refusedHedge[0].horizon,
      directionSign: refusedHedge[0].directionSign,
      requiredInvalidationRelation: refusedHedge[0].requiredInvalidationRelation,
      reasonCode: refusedHedge[0].reasonCode,
      invalidationLevels: refusedHedge[0].invalidationLevels
    },
    {
      index: 0,
      action: 'hedge',
      horizon: 'tactical',
      directionSign: -1,
      requiredInvalidationRelation: 'above',
      reasonCode: 'no-attributable-invalidation-level',
      invalidationLevels: 0
    },
    'the finding names the action, its direction, the side it needed, and the reason code');

  assert.equal(findUnscoreableActions(payloadWith([hedgeAction(HEDGE_RIGHT_SIDE)]), { universe: UNIVERSE }).length, 0,
    'the same hedge with an ABOVE invalidation level is accepted');

  const refusedAdd = findUnscoreableActions(payloadWith([addAction(ADD_WRONG_SIDE)]), { universe: UNIVERSE });
  assert.equal(refusedAdd.length, 1);
  assert.equal(refusedAdd[0].requiredInvalidationRelation, 'below');
  assert.equal(refusedAdd[0].directionSign, 1);

  assert.equal(findUnscoreableActions(payloadWith([addAction(ADD_RIGHT_SIDE)]), { universe: UNIVERSE }).length, 0,
    'the same add with a BELOW invalidation level is accepted');
});

test('D16 covers tactical and swing only — a structural call on the wrong side is not refused', () => {
  assert.deepEqual([...D16_SCORED_HORIZONS], ['tactical', 'swing']);
  const structural = { ...addAction(ADD_WRONG_SIDE), horizon: 'structural' };
  assert.equal(evaluabilityOf(structural).evaluability, 'not-evaluable',
    'the body is still unscoreable — only the D16 scope differs');
  assert.equal(findUnscoreableActions(payloadWith([structural]), { universe: UNIVERSE }).length, 0);
});

test('dropUnscoreableActions withholds exactly the refused call and keeps every other one', () => {
  const payload = payloadWith([addAction(ADD_RIGHT_SIDE), hedgeAction(HEDGE_WRONG_SIDE), hedgeAction(HEDGE_RIGHT_SIDE)]);
  const findings = findUnscoreableActions(payload, { universe: UNIVERSE });
  assert.deepEqual(findings.map((finding) => finding.index), [1]);
  const repaired = dropUnscoreableActions(payload, findings);
  assert.equal(repaired.nextSession.actions.length, 2);
  assert.deepEqual(repaired.nextSession.actions.map((action) => action.invalidation), [ADD_RIGHT_SIDE, HEDGE_RIGHT_SIDE]);
  assert.equal(payload.nextSession.actions.length, 3, 'the input payload is not mutated in place');
  assert.equal(findUnscoreableActions(repaired, { universe: UNIVERSE }).length, 0);
});

test('--enforce-d16 refuses the wrong-side hedge by name and passes the direction-correct one', () => {
  const refused = runValidator(payloadWith([hedgeAction(HEDGE_WRONG_SIDE)]), ['--enforce-d16']);
  assert.notEqual(refused.status, 0, 'an unscoreable tactical call makes the payload unpublishable');
  assert.match(refused.stderr, /D16 REFUSED nextSession\.actions\[0\] action=hedge horizon=tactical/);
  assert.match(refused.stderr, /directionSign=-1 must break ABOVE reason=no-attributable-invalidation-level/);
  assert.match(refused.stderr, /Event-insurance residual carried into the next payroll print/);

  const accepted = runValidator(payloadWith([hedgeAction(HEDGE_RIGHT_SIDE)]), ['--enforce-d16']);
  assert.equal(accepted.status, 0, 'the same call with an ABOVE invalidation level publishes');
  assert.doesNotMatch(accepted.stderr, /D16 REFUSED/);
  assert.match(accepted.stdout, /\[brief-contract\] PASS/);
});

test('--enforce-d16 refuses the wrong-side add and passes the direction-correct one', () => {
  const refused = runValidator(payloadWith([addAction(ADD_WRONG_SIDE)]), ['--enforce-d16']);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /D16 REFUSED nextSession\.actions\[0\] action=add horizon=swing/);
  assert.match(refused.stderr, /directionSign=1 must break BELOW reason=no-attributable-invalidation-level/);

  assert.equal(runValidator(payloadWith([addAction(ADD_RIGHT_SIDE)]), ['--enforce-d16']).status, 0);
});

test('--drop-unscoreable withholds the call and still publishes the brief', () => {
  const payload = payloadWith([addAction(ADD_RIGHT_SIDE), hedgeAction(HEDGE_WRONG_SIDE)]);
  const repaired = runValidator(payload, ['--drop-unscoreable']);
  assert.equal(repaired.status, 0, 'one unscoreable call must never cost us the whole brief');
  assert.match(repaired.stderr, /D16 REFUSED nextSession\.actions\[1\] action=hedge/);
  assert.match(repaired.stderr, /D16 withheld 1 unscoreable call\(s\)/);
  assert.match(repaired.stdout, /\[brief-contract\] PASS/);

  const written = JSON.parse(readFileSync(repaired.payloadPath, 'utf8'));
  assert.equal(written.nextSession.actions.length, 1);
  assert.equal(written.nextSession.actions[0].action, 'add', 'the scoreable call survives untouched');
  assert.equal(findUnscoreableActions(written, { universe: UNIVERSE }).length, 0);
});

test('the default mode reports without blocking, so a published baseline can never stall the scheduler', () => {
  const reported = runValidator(payloadWith([hedgeAction(HEDGE_WRONG_SIDE)]), []);
  assert.equal(reported.status, 0, 'the baseline rung of brief-refresh-and-push.sh must not exit 1 on history');
  assert.match(reported.stderr, /D16 WARNING nextSession\.actions\[0\] action=hedge/);

  const untouched = JSON.parse(readFileSync(reported.payloadPath, 'utf8'));
  assert.equal(untouched.nextSession.actions.length, 1, 'the default mode never rewrites the payload');
});

test('an unknown flag is refused rather than silently ignored — a typo must not disable the gate', () => {
  const typo = runValidator(payloadWith([hedgeAction(HEDGE_WRONG_SIDE)]), ['--enforce-D16']);
  assert.equal(typo.status, 2);
  assert.match(typo.stderr, /unknown flag\(s\): --enforce-D16/);
});
