#!/usr/bin/env node
/*
 * scripts/brief-author.mjs — Feature 002 Scope 06 bounded external tool-brief author boundary.
 *
 * This module is the SOLE external author boundary. It is deliberately powerless: it imports ONLY
 * node:crypto and node:child_process, and it NEVER imports a filesystem WRITE (writeFileSync /
 * appendFileSync / unlinkSync), fetch, a shell (child_process is always spawned shell:false — never
 * exec/execSync), or any browser-state API (localStorage / document). It therefore has no
 * repository-write, no shell, no source-fetch, and no browser-state authority.
 *
 * The author receives ONE frozen JSON request on stdin and returns ONE JSON response on stdout.
 * Instructions (the fixed prompt policy) are held SEPARATELY from the frozen JSON data envelope, so a
 * hostile data payload can never inject instructions. Provider / model / prompt-policy / schema /
 * validator identity is required NON-SECRET provenance; provider credentials remain in the provider's
 * own credential store and never enter the request JSON, the response, or any log.
 *
 * Owner-model formulas are NEVER copied here. This boundary compacts nothing and reduces nothing; the
 * pure foundation (rlcontracts.js) owns compaction, validation, and reduction. This module only builds
 * a bounded request, invokes the configured author process under a hard byte/time ceiling, and gates
 * the returned envelope for size, JSON shape, request identity, safety, and duplication.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

export const AUTHOR_REQUEST_CONTRACT = 'tool-author-request/v1';
export const AUTHOR_RESPONSE_CONTRACT = 'tool-author-response/v1';
/* Scope 08 — the FinalBriefAuthor shares this SAME powerless process contract but carries a distinct
   request/response schema and permission surface. buildFinalAuthorRequest builds the final request and
   validateAuthorEnvelope is polymorphic on the request contract (a final request expects a final
   response); the tool-author path is byte-unchanged. */
export const FINAL_AUTHOR_REQUEST_CONTRACT = 'final-author-request/v1';
export const FINAL_AUTHOR_RESPONSE_CONTRACT = 'final-author-response/v1';

/* Closed, sanitized error taxonomy for the author boundary. No rejected narrative, prompt text,
   credential, or private field ever enters an error; only a code, a reason, and a field path. */
export const AUTHOR_ERRORS = Object.freeze({
  REQUEST_INVALID: 'B002-TOOL-AUTHOR-REQUEST',
  TIMEOUT: 'B002-TOOL-AUTHOR-TIMEOUT',
  OVERSIZE: 'B002-TOOL-AUTHOR-OVERSIZE',
  MALFORMED: 'B002-TOOL-AUTHOR-MALFORMED',
  UNSAFE: 'B002-TOOL-AUTHOR-UNSAFE',
  MISMATCH: 'B002-TOOL-AUTHOR-MISMATCH',
  DUPLICATE: 'B002-TOOL-AUTHOR-DUPLICATE',
  PROCESS: 'B002-TOOL-AUTHOR-PROCESS'
});

const REQUIRED_IDENTITY = Object.freeze(['providerId', 'modelId', 'promptPolicyVersion', 'schemaVersion', 'validatorVersion']);
const SECRET_SHAPED_KEY = /(?:authorization|cookie|credential|api[-_]?key|password|passphrase|secret|token|position|cost[-_]?basis|pnl|holding|account)/i;
const INSTRUCTION_OR_MARKUP = /<[a-z!/]|javascript:|data:text\/html|`{3}|\bignore (?:all |previous )/i;
const SAFE_ID = /^[a-z0-9][a-z0-9._:/-]*$/;
const DEFAULT_MAX_STDOUT_BYTES = 96 * 1024; // one ToolBrief object cap (design "Size and Cost Limits")

/* The fixed author instruction policy. Held separately from the frozen JSON data so that data can
   never carry instructions. This is provenance, not a secret. */
const INSTRUCTION_POLICY = [
  'You are a bounded market-brief author. Read ONLY the frozen JSON data envelope.',
  'Return ONE JSON object matching tool-author-response/v1 with a validated tool-brief/v1 brief.',
  'You may cite only evidence identities present in the data. You may not add evidence, browse, run',
  'shell commands, or write files. Recommendations are legal only when the read declares eligibility.',
  'Output JSON only — no prose, no markdown, no code fences.'
].join(' ');

/* The fixed FINAL author instruction policy. Held separately from the frozen final-author-input data so a
   hostile payload can never carry instructions. The final author receives the complete bounded registry
   coverage but no raw history and no recursive Market Brief source brief; it may only reflect the
   deterministic groups it is given and cannot invent a subject/action/evidence combination. */
const FINAL_INSTRUCTION_POLICY = [
  'You are the bounded final market-brief aggregator. Read ONLY the frozen final-author-input JSON.',
  'Return ONE JSON object matching final-author-response/v1 with a validated final-brief/v1 final.',
  'Cover every registry participant exactly once and reflect only the deterministic groups/conflicts',
  'supplied. You may not add a subject/action/evidence absent from those groups, raise a merged',
  'confidence above its minimum retained origin score, hide a conflict, or promote unsupported evidence.',
  'You may not browse, add evidence, run shell commands, or write files. Output JSON only — no prose.'
].join(' ');

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function requestFingerprint(request) {
  return `sha256:${sha256Hex(stableStringify({
    contractVersion: request.contractVersion,
    data: request.data,
    provider: request.provider,
    model: request.model,
    promptPolicy: request.promptPolicy,
    schema: request.schema,
    validator: request.validator,
    maxOutputTokens: request.maxOutputTokens
  }))}`;
}

/* Recursively scan a value for secret-shaped keys and instruction/markup-shaped strings. Returns a
   { reason, field } finding or null. Reused by both the request builder and the envelope gate. */
function scanUnsafe(value, field) {
  if (typeof value === 'string') {
    if (INSTRUCTION_OR_MARKUP.test(value)) return { reason: 'instruction-or-markup', field };
    return null;
  }
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const found = scanUnsafe(value[i], `${field}.${i}`);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== 'object') return { reason: 'value-type', field };
  for (const key of Object.keys(value)) {
    if (SECRET_SHAPED_KEY.test(key)) return { reason: 'secret-shaped-field', field: `${field}.${key}` };
    const found = scanUnsafe(value[key], `${field}.${key}`);
    if (found) return found;
  }
  return null;
}

function authorFailure(code, reason, field) {
  return { ok: false, error: { contractVersion: 'author-boundary-error/v1', code, reason, field: field || null } };
}

/* buildToolAuthorRequest(compactInput, identity): assemble one bounded tool-author-request/v1. The
   frozen compacted read is placed under `data`; the fixed instruction policy is a SEPARATE top-level
   field. Provider/model/prompt/schema/validator identity is required and must be safe non-secret IDs.
   The data envelope is scanned so a secret-shaped or instruction-shaped read can never be dispatched. */
export function buildToolAuthorRequest(compactInput, identity) {
  if (!compactInput || typeof compactInput !== 'object' || compactInput.contractVersion !== 'compact-author-input/v1') {
    return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'compact-input-required', 'compactInput');
  }
  if (!identity || typeof identity !== 'object') return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'identity-required', 'identity');
  for (const key of REQUIRED_IDENTITY) {
    if (typeof identity[key] !== 'string' || !SAFE_ID.test(identity[key])) {
      return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'identity-field-invalid', `identity.${key}`);
    }
  }
  for (const key of Object.keys(identity)) {
    if (SECRET_SHAPED_KEY.test(key)) return authorFailure(AUTHOR_ERRORS.UNSAFE, 'secret-shaped-identity', `identity.${key}`);
  }
  const data = {
    contractVersion: 'tool-author-data/v1',
    compactedRead: compactInput.compactedRead,
    includedFactIds: compactInput.includedFactIds,
    omittedFacts: compactInput.omittedFacts
  };
  const unsafe = scanUnsafe(data, 'data');
  if (unsafe) return authorFailure(AUTHOR_ERRORS.UNSAFE, unsafe.reason, unsafe.field);

  const request = {
    contractVersion: AUTHOR_REQUEST_CONTRACT,
    instructions: INSTRUCTION_POLICY,
    data,
    provider: identity.providerId,
    model: identity.modelId,
    promptPolicy: identity.promptPolicyVersion,
    schema: identity.schemaVersion,
    validator: identity.validatorVersion,
    maxOutputTokens: Number.isInteger(compactInput.maxOutputTokens) ? compactInput.maxOutputTokens : null
  };
  request.requestFingerprint = requestFingerprint(request);
  return { ok: true, request };
}

/* buildFinalAuthorRequest(compactFinalInput, identity): assemble one bounded final-author-request/v1 from
   the pure compactFinalAuthorInput output. The frozen registry-complete final input is placed under
   `data`; the fixed FINAL instruction policy is a SEPARATE top-level field so the data can never carry
   instructions. Provider/model/prompt/schema/validator identity is required non-secret provenance, and
   the data envelope is scanned so a secret-shaped or instruction-shaped final input can never be
   dispatched. Owner formulas are never present — only bounded source envelopes and deterministic groups. */
export function buildFinalAuthorRequest(compactFinalInput, identity) {
  if (!compactFinalInput || typeof compactFinalInput !== 'object' || compactFinalInput.contractVersion !== 'compact-final-author-input/v1') {
    return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'compact-final-input-required', 'compactFinalInput');
  }
  if (!identity || typeof identity !== 'object') return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'identity-required', 'identity');
  for (const key of REQUIRED_IDENTITY) {
    if (typeof identity[key] !== 'string' || !SAFE_ID.test(identity[key])) {
      return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'identity-field-invalid', `identity.${key}`);
    }
  }
  for (const key of Object.keys(identity)) {
    if (SECRET_SHAPED_KEY.test(key)) return authorFailure(AUTHOR_ERRORS.UNSAFE, 'secret-shaped-identity', `identity.${key}`);
  }
  const data = {
    contractVersion: 'final-author-data/v1',
    finalInput: compactFinalInput.finalInput,
    participantIds: compactFinalInput.participantIds,
    orderedSourceToolIds: compactFinalInput.orderedSourceToolIds,
    includedFactIds: compactFinalInput.includedFactIds,
    omittedFacts: compactFinalInput.omittedFacts
  };
  const unsafe = scanUnsafe(data, 'data');
  if (unsafe) return authorFailure(AUTHOR_ERRORS.UNSAFE, unsafe.reason, unsafe.field);

  const request = {
    contractVersion: FINAL_AUTHOR_REQUEST_CONTRACT,
    instructions: FINAL_INSTRUCTION_POLICY,
    data,
    provider: identity.providerId,
    model: identity.modelId,
    promptPolicy: identity.promptPolicyVersion,
    schema: identity.schemaVersion,
    validator: identity.validatorVersion,
    maxOutputTokens: Number.isInteger(compactFinalInput.maxOutputTokens) ? compactFinalInput.maxOutputTokens : null
  };
  request.requestFingerprint = requestFingerprint(request);
  return { ok: true, request };
}

/* validateAuthorEnvelope(envelope, request, options): gate one returned author envelope. It must be
   bounded (JSON byte length <= maxStdoutBytes), a well-formed tool-author-response/v1 whose
   requestFingerprint matches the dispatched request, safe (no secret-shaped keys or instruction/markup
   strings anywhere), and non-duplicate against an optional `seen` set of response fingerprints. It
   returns the extracted brief for the foundation validator; it never re-uses the supplied response as
   proof of correctness (the pure ToolBrief validator runs downstream). */
export function validateAuthorEnvelope(envelope, request, options) {
  const settings = options || {};
  const maxBytes = Number.isInteger(settings.maxStdoutBytes) ? settings.maxStdoutBytes : DEFAULT_MAX_STDOUT_BYTES;
  const seen = settings.seen instanceof Set ? settings.seen : null;
  // Polymorphic on the dispatched request contract: a final request expects a final response whose payload
  // lives under `final`; every other (tool) request keeps the byte-unchanged tool-author-response path.
  const isFinal = request && typeof request === 'object' && request.contractVersion === FINAL_AUTHOR_REQUEST_CONTRACT;
  const expectedResponse = isFinal ? FINAL_AUTHOR_RESPONSE_CONTRACT : AUTHOR_RESPONSE_CONTRACT;
  const payloadKey = isFinal ? 'final' : 'brief';
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) return authorFailure(AUTHOR_ERRORS.MALFORMED, 'envelope-not-object', 'envelope');
  const encoded = stableStringify(envelope);
  if (Buffer.byteLength(encoded, 'utf8') > maxBytes) return authorFailure(AUTHOR_ERRORS.OVERSIZE, 'envelope-exceeds-cap', 'envelope');
  if (envelope.contractVersion !== expectedResponse) return authorFailure(AUTHOR_ERRORS.MALFORMED, 'envelope-contract-invalid', 'envelope.contractVersion');
  if (!request || typeof request !== 'object' || typeof request.requestFingerprint !== 'string') return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'request-fingerprint-required', 'request.requestFingerprint');
  if (envelope.requestFingerprint !== request.requestFingerprint) return authorFailure(AUTHOR_ERRORS.MISMATCH, 'request-fingerprint-mismatch', 'envelope.requestFingerprint');
  if (!envelope[payloadKey] || typeof envelope[payloadKey] !== 'object' || Array.isArray(envelope[payloadKey])) return authorFailure(AUTHOR_ERRORS.MALFORMED, `${payloadKey}-not-object`, `envelope.${payloadKey}`);
  const unsafe = scanUnsafe(envelope, 'envelope');
  if (unsafe) return authorFailure(AUTHOR_ERRORS.UNSAFE, unsafe.reason, unsafe.field);
  const responseFingerprint = `sha256:${sha256Hex(stableStringify(envelope[payloadKey]))}`;
  if (seen) {
    if (seen.has(responseFingerprint)) return authorFailure(AUTHOR_ERRORS.DUPLICATE, 'duplicate-author-response', `envelope.${payloadKey}`);
    seen.add(responseFingerprint);
  }
  const result = { ok: true, responseFingerprint };
  result[payloadKey] = envelope[payloadKey];
  return result;
}

/* Parse and bound a raw author stdout buffer/string into a JSON envelope. */
function parseAuthorStdout(raw, maxBytes) {
  const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
  if (Buffer.byteLength(text, 'utf8') > maxBytes) return authorFailure(AUTHOR_ERRORS.OVERSIZE, 'stdout-exceeds-cap', 'stdout');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return authorFailure(AUTHOR_ERRORS.MALFORMED, 'stdout-not-json', 'stdout');
  }
  return { ok: true, envelope: parsed };
}

/* invokeAuthor(request, options): dispatch one request across the bounded process boundary and return
   one parsed envelope (unvalidated) or a sanitized closed error. Two transports are supported:
   - options.transport (async (requestJson: string) => stdout string): used by unit/pool/integration
     tests to exercise the production compaction/validation/retry path deterministically without a
     provider; and
   - options.command + options.args: the REAL bounded child process (spawn shell:false), used in
     production and in the functional boundary test that proves timeout/oversize/malformed/unsafe/
     duplicate responses are all bounded and rejected.
   Both enforce a hard per-call timeout and stdout byte ceiling. No source is fetched and nothing is
   written to the repository. */
export async function invokeAuthor(request, options) {
  const settings = options || {};
  const maxBytes = Number.isInteger(settings.maxStdoutBytes) ? settings.maxStdoutBytes : DEFAULT_MAX_STDOUT_BYTES;
  const timeoutMs = Number.isInteger(settings.timeoutMs) ? settings.timeoutMs : 180000;
  if (!request || typeof request !== 'object' || (request.contractVersion !== AUTHOR_REQUEST_CONTRACT && request.contractVersion !== FINAL_AUTHOR_REQUEST_CONTRACT) || typeof request.requestFingerprint !== 'string') {
    return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'request-invalid', 'request');
  }
  const requestJson = JSON.stringify(request);

  if (typeof settings.transport === 'function') {
    let timedOut = false;
    let timer = null;
    try {
      const raced = await Promise.race([
        Promise.resolve().then(() => settings.transport(requestJson)),
        new Promise((resolve) => {
          timer = setTimeout(() => { timedOut = true; resolve('__timeout__'); }, timeoutMs);
        })
      ]);
      if (timer) clearTimeout(timer);
      if (timedOut) return authorFailure(AUTHOR_ERRORS.TIMEOUT, 'transport-timeout', 'transport');
      return parseAuthorStdout(raced, maxBytes);
    } catch (error) {
      if (timer) clearTimeout(timer);
      return authorFailure(AUTHOR_ERRORS.PROCESS, 'transport-error', 'transport');
    }
  }

  if (typeof settings.command !== 'string' || !Array.isArray(settings.args)) {
    return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'author-command-required', 'options.command');
  }

  return await new Promise((resolve) => {
    let child;
    try {
      child = spawn(settings.command, settings.args, { shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (spawnError) {
      resolve(authorFailure(AUTHOR_ERRORS.PROCESS, 'spawn-failed', 'options.command'));
      return;
    }
    const chunks = [];
    let total = 0;
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child.kill('SIGKILL'); } catch (killError) { /* already exited */ }
      resolve(result);
    };
    const timer = setTimeout(() => finish(authorFailure(AUTHOR_ERRORS.TIMEOUT, 'process-timeout', 'process')), timeoutMs);
    child.stdout.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) { finish(authorFailure(AUTHOR_ERRORS.OVERSIZE, 'stdout-exceeds-cap', 'stdout')); return; }
      chunks.push(chunk);
    });
    child.on('error', () => finish(authorFailure(AUTHOR_ERRORS.PROCESS, 'process-error', 'process')));
    child.on('close', (code) => {
      if (settled) return;
      if (code !== 0) { finish(authorFailure(AUTHOR_ERRORS.PROCESS, 'process-nonzero-exit', 'process')); return; }
      finish(parseAuthorStdout(Buffer.concat(chunks), maxBytes));
    });
    try {
      child.stdin.write(requestJson);
      child.stdin.end();
    } catch (writeError) {
      finish(authorFailure(AUTHOR_ERRORS.PROCESS, 'stdin-write-failed', 'process'));
    }
  });
}
