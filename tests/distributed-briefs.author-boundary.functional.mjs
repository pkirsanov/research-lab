/*
 * tests/distributed-briefs.author-boundary.functional.mjs — Feature 002 Scope 06 (SCN-002-004/005).
 *
 * Drives the PRODUCTION bounded-author boundary (scripts/brief-author.mjs invokeAuthor +
 * validateAuthorEnvelope) against a REAL external child process (the author-echo fixture) at the true
 * provider boundary. Every adversarial response class — timeout, oversize, malformed, unsafe, illegal
 * (request-identity mismatch), and duplicate — must be bounded, redacted, and rejected with a closed
 * sanitized code; a well-formed request-matched response passes the gate. This proves the external
 * boundary cannot escape policy; it is not self-validation (the child computes its own bytes).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { buildToolAuthorRequest, invokeAuthor, validateAuthorEnvelope, AUTHOR_ERRORS } from '../scripts/brief-author.mjs';
import { eligibleOwnerRead, profileBudgets, authorIdentity } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const AUTHOR_ECHO = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/feature-002/authorship/author-echo.mjs');

function builtRequest() {
  const compacted = RLCONTRACTS.compactAuthorInput(eligibleOwnerRead(), profileBudgets()['live-market']);
  assert.equal(compacted.ok, true, compacted.ok ? '' : JSON.stringify(compacted.error));
  const built = buildToolAuthorRequest(compacted.value, authorIdentity());
  assert.equal(built.ok, true, built.ok ? '' : JSON.stringify(built.error));
  return built.request;
}

function invokeMode(request, mode, extra = {}) {
  return invokeAuthor(request, { command: 'node', args: [AUTHOR_ECHO, mode], timeoutMs: 4000, maxStdoutBytes: 96 * 1024, ...extra });
}

test('External author timeout malformed unsafe illegal and duplicate responses are bounded redacted and rejected', async () => {
  const request = builtRequest();

  // A well-formed, request-matched, safe response passes the boundary gate.
  const seen = new Set();
  const valid = await invokeMode(request, 'valid');
  assert.equal(valid.ok, true, valid.ok ? '' : JSON.stringify(valid.error));
  const validGate = validateAuthorEnvelope(valid.envelope, request, { seen });
  assert.equal(validGate.ok, true, validGate.ok ? '' : JSON.stringify(validGate.error));

  // Timeout: the child never answers within the window; invokeAuthor bounds it and kills the process.
  const timedOut = await invokeMode(request, 'timeout', { timeoutMs: 400 });
  assert.equal(timedOut.ok, false);
  assert.equal(timedOut.error.code, AUTHOR_ERRORS.TIMEOUT);

  // Oversize: the child floods stdout past the caller's byte cap; invokeAuthor bounds and rejects it.
  const oversize = await invokeMode(request, 'oversize', { maxStdoutBytes: 4096 });
  assert.equal(oversize.ok, false);
  assert.equal(oversize.error.code, AUTHOR_ERRORS.OVERSIZE);

  // Malformed: non-JSON stdout is rejected before any content is trusted.
  const malformed = await invokeMode(request, 'malformed');
  assert.equal(malformed.ok, false);
  assert.equal(malformed.error.code, AUTHOR_ERRORS.MALFORMED);

  // Unsafe: valid JSON whose brief carries instruction/markup-shaped content is redacted-rejected at the
  // envelope gate.
  const unsafe = await invokeMode(request, 'unsafe');
  assert.equal(unsafe.ok, true, unsafe.ok ? '' : JSON.stringify(unsafe.error));
  const unsafeGate = validateAuthorEnvelope(unsafe.envelope, request, { seen: new Set() });
  assert.equal(unsafeGate.ok, false);
  assert.equal(unsafeGate.error.code, AUTHOR_ERRORS.UNSAFE);

  // Illegal binding: a response bound to a different request fingerprint is rejected as a mismatch.
  const mismatch = await invokeMode(request, 'mismatch');
  assert.equal(mismatch.ok, true, mismatch.ok ? '' : JSON.stringify(mismatch.error));
  const mismatchGate = validateAuthorEnvelope(mismatch.envelope, request, { seen: new Set() });
  assert.equal(mismatchGate.ok, false);
  assert.equal(mismatchGate.error.code, AUTHOR_ERRORS.MISMATCH);

  // Duplicate: a second identical valid response against the SAME seen-set is rejected as a duplicate, so
  // a retry can never create a second content object.
  const dupFirst = await invokeMode(request, 'duplicate');
  assert.equal(dupFirst.ok, true, dupFirst.ok ? '' : JSON.stringify(dupFirst.error));
  const dupGateFirst = validateAuthorEnvelope(dupFirst.envelope, request, { seen });
  assert.equal(dupGateFirst.ok, false);
  assert.equal(dupGateFirst.error.code, AUTHOR_ERRORS.DUPLICATE);

  // The sanitized error envelopes never carry prompt text, raw narrative, or private fields.
  for (const failed of [timedOut, oversize, malformed]) {
    assert.equal(Object.keys(failed.error).sort().join(','), 'code,contractVersion,field,reason');
  }
});
