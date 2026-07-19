#!/usr/bin/env node
/*
 * tests/fixtures/feature-002/final/final-author-echo.mjs
 *
 * A REAL child-process final-author fixture for the Scope 08 bounded-author boundary functional test. It
 * stands in for the true external final-aggregator process: it reads ONE final-author-request/v1 JSON on
 * stdin and writes ONE final-author-response/v1 on stdout, driven by argv[2] so the functional test can
 * drive every adversarial response class through the production invokeAuthor + validateAuthorEnvelope +
 * validateFinalBrief path. It is a fixture, not the production author (scripts/brief-author.mjs is what is
 * under test).
 *
 * Modes (argv[2]):
 *   valid      -> a well-formed, safe, request-matched final built from the frozen input
 *   timeout    -> never writes; stays alive so invokeAuthor's timeout fires
 *   oversize   -> a valid-JSON response far larger than the caller's stdout cap
 *   malformed  -> non-JSON bytes
 *   unsafe     -> a request-matched response whose final carries instruction/markup-shaped content
 *   mismatch   -> a well-formed response bound to the WRONG requestFingerprint
 */
import { createHash } from 'node:crypto';
import { buildFinalFromInput } from './final-fixture-builder.mjs';

const MODE = process.argv[2] || 'valid';

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', () => resolve(''));
  });
}

async function main() {
  if (MODE === 'timeout') {
    setTimeout(() => process.exit(0), 5000);
    return;
  }
  const raw = await readStdin();
  let request;
  try {
    request = JSON.parse(raw);
  } catch (error) {
    process.stdout.write('provider returned non-json');
    return;
  }
  const requestFingerprint = request && typeof request.requestFingerprint === 'string' ? request.requestFingerprint : 'sha256:' + '0'.repeat(64);

  if (MODE === 'malformed') {
    process.stdout.write('not-json{ this is not a valid final envelope');
    return;
  }
  if (MODE === 'oversize') {
    const filler = 'x'.repeat(200000);
    process.stdout.write(JSON.stringify({ contractVersion: 'final-author-response/v1', requestFingerprint, final: { contractVersion: 'final-brief/v1', filler } }));
    return;
  }
  if (MODE === 'unsafe') {
    const final = buildFinalFromInput(request.data.finalInput, { mode: 'unsafe-text' });
    process.stdout.write(JSON.stringify({ contractVersion: 'final-author-response/v1', requestFingerprint, final }));
    return;
  }
  if (MODE === 'mismatch') {
    const wrong = 'sha256:' + createHash('sha256').update('a-different-final-request').digest('hex');
    const final = buildFinalFromInput(request.data.finalInput, { mode: 'valid' });
    process.stdout.write(JSON.stringify({ contractVersion: 'final-author-response/v1', requestFingerprint: wrong, final }));
    return;
  }
  const final = buildFinalFromInput(request.data.finalInput, { mode: 'valid' });
  process.stdout.write(JSON.stringify({ contractVersion: 'final-author-response/v1', requestFingerprint, final }));
}

main();
