/*
 * The publish path refuses a NEWLY GENERATED narrative that omits required reader copy.
 *
 * The defect this pins: `dataAsOf.labels` is declared in BRIEF_NARRATIVE_FIELDS_REQUIRED and was
 * present in thirteen consecutive payloads, then the 2026-08-15 after-hours publish dropped it and
 * nothing on the publish path noticed. The lane had never been INSTRUCTED to author it — it was
 * inferring the key from the previous payload, so the contract held by convention until it didn't.
 *
 * Three cases, because the gate is only correct if it is also silent in the right places:
 *
 *   with the flag,    labels present -> accepted
 *   with the flag,    labels missing -> REFUSED, and the message names the field
 *   WITHOUT the flag, labels missing -> accepted
 *
 * The third case carries the most weight. The currently published payload is the one missing the
 * field, and brief-refresh-and-push.sh validates that payload as its transaction BASELINE before
 * generating anything. A gate that fired there would refuse every future publish — locking the door
 * on the way out and trading a missing label for no brief at all. So the flag is caller-selected and
 * appears on exactly one call site: the post-lane validation of the payload the lane just produced,
 * which retries the lane and degrades to a data-only publish if it keeps failing.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BRIEF_NARRATIVE_FIELDS_REQUIRED } from '../scripts/reader-vocabulary.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = resolve(ROOT, 'scripts/validate-brief-payload.mjs');
const FLAG = '--require-narrative-fields';

function runValidator(payload, flags) {
  const dir = mkdtempSync(join(tmpdir(), 'brief-narrative-fields-'));
  const payloadPath = join(dir, 'market-brief.payload.json');
  writeFileSync(payloadPath, JSON.stringify(payload, null, 2) + '\n');
  return spawnSync(process.execPath, [VALIDATOR, payloadPath, ...flags], { cwd: ROOT, encoding: 'utf8' });
}

function committedPayload() {
  return JSON.parse(readFileSync(resolve(ROOT, 'market-brief.payload.json'), 'utf8'));
}

/* Condensed reader-facing versions of the four freshness narratives — the shape the thirteen
   payloads before the regression carried. Kept plain so the vocabulary leak gate is not the thing
   under test here. */
function withLabels(payload) {
  const next = JSON.parse(JSON.stringify(payload));
  next.dataAsOf.labels = {
    bars: 'Daily bars are fresh for this window, with the last completed session already closed.',
    events: 'The tracked calendar items are resolved and no scheduled release lands in this window.',
    macro: 'The volatility headline is calm and the sizing model agrees with it.',
    options: 'Option chains are fresh and the dealer map is unchanged from the last close.'
  };
  return next;
}

function withoutLabels(payload) {
  const next = JSON.parse(JSON.stringify(payload));
  delete next.dataAsOf.labels;
  return next;
}

test('the required-field list actually declares the field this gate exists to protect', () => {
  assert.ok(
    BRIEF_NARRATIVE_FIELDS_REQUIRED.includes('dataAsOf.labels.*'),
    'dataAsOf.labels.* must be declared required, or this gate is guarding nothing'
  );
});

test('a generated narrative carrying every required field is accepted', () => {
  const result = runValidator(withLabels(committedPayload()), [FLAG, '--defer-page-parity']);
  assert.equal(result.status, 0, `expected acceptance, got:\n${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /every required narrative field is present/);
});

test('a generated narrative that omits required reader copy is REFUSED and the field is named', () => {
  const result = runValidator(withoutLabels(committedPayload()), [FLAG, '--defer-page-parity']);
  assert.equal(result.status, 1, 'a narrative missing required reader copy must not publish');
  assert.match(result.stderr, /omits required reader copy/);
  assert.match(result.stderr, /dataAsOf\.labels\.\*/);
});

test('WITHOUT the flag the same payload is accepted, so the baseline check can never lock out a publish', () => {
  const result = runValidator(withoutLabels(committedPayload()), ['--defer-page-parity']);
  assert.equal(result.status, 0,
    `the unflagged path must stay unchanged or every future publish is refused:\n${result.stdout}\n${result.stderr}`);
});

test('the publish script arms the gate on the post-lane validation only', () => {
  const script = readFileSync(resolve(ROOT, 'scripts/brief-refresh-and-push.sh'), 'utf8');
  const invocations = script.split('\n').filter((line) => line.includes('validate-brief-payload.mjs'));
  const armed = invocations.filter((line) => line.includes(FLAG));
  assert.equal(armed.length, 1, `exactly one call site may arm ${FLAG}, found ${armed.length}`);
  assert.match(armed[0], /--drop-unscoreable/,
    'the armed call site must be the post-lane validation of the newly generated payload');
});
