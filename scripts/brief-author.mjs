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
  // Scope 11 — a v2 tool request expects the v2 response contract. The payload key stays
  // `brief`, so a v2 envelope travels the byte-unchanged tool path from here down.
  const isToolV2 = request && typeof request === 'object' && request.contractVersion === TOOL_AUTHOR_REQUEST_V2_CONTRACT;
  const expectedResponse = isFinal ? FINAL_AUTHOR_RESPONSE_CONTRACT : (isToolV2 ? TOOL_AUTHOR_RESPONSE_V2_CONTRACT : AUTHOR_RESPONSE_CONTRACT);
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
  const dispatchable = [AUTHOR_REQUEST_CONTRACT, FINAL_AUTHOR_REQUEST_CONTRACT, TOOL_AUTHOR_REQUEST_V2_CONTRACT];
  if (!request || typeof request !== 'object' || dispatchable.indexOf(request.contractVersion) === -1 || typeof request.requestFingerprint !== 'string') {
    return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'request-invalid', 'request');
  }
  // A v2 request may not be dispatched at all unless its capability ledger grants nothing.
  if (request.contractVersion === TOOL_AUTHOR_REQUEST_V2_CONTRACT) {
    const ledger = assertAuthorV2Capabilities(request);
    if (!ledger.ok) return authorFailure(AUTHOR_ERRORS.REQUEST_INVALID, 'capability-ledger-invalid', 'request.capabilities');
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

/* ═══════════════════════════════════════════════════════════════════════════
   Feature 012 Scope 11 — ToolAuthorRequest/v2 and ToolBrief/v2.

   v2 is ADDITIVE. Every v1 export above is byte-unchanged, and a v1 request
   still produces a v1 response through the same powerless process boundary. v2
   adds exactly two things v1 could not express:

   1. a SECOND frozen input — the qualified WebEvidence author projection —
      pinned by ref + hash + cutoff alongside the owner read, so the authored
      brief can be re-tied to the exact evidence it was allowed to read; and
   2. claim-LEVEL accountability — every material sentence names the supplied
      claim it rests on, and a market-state claim must additionally be grounded
      in the tool's own owner evidence.

   The author remains powerless. `AUTHOR_V2_CAPABILITIES` is the declared ledger
   and every entry is false; a request that claims any capability is refused
   before dispatch. The ledger is a DECLARATION — the proof that this module
   cannot exercise those capabilities is the import/source scan in
   tests/tool-brief-v2-author-boundary.functional.mjs, which reads this file.
   ═══════════════════════════════════════════════════════════════════════════ */

export const TOOL_AUTHOR_REQUEST_V2_CONTRACT = 'tool-author-request/v2';
export const TOOL_AUTHOR_RESPONSE_V2_CONTRACT = 'tool-author-response/v2';
export const TOOL_BRIEF_V2_CONTRACT = 'tool-brief/v2';
export const TOOL_BRIEF_V2_COMPACT_CONTRACT = 'compact-tool-brief-v2-input/v1';
export const TOOL_BRIEF_V2_DATA_CONTRACT = 'tool-author-data/v2';
export const WEB_EVIDENCE_AUTHOR_PROJECTION_CONTRACT = 'web-evidence-author-projection/v1';

export const TOOL_BRIEF_V2_STATES = Object.freeze(['action', 'catalyst', 'no-action', 'carried', 'unavailable']);
export const TOOL_BRIEF_V2_SCOPES = Object.freeze(['tool', 'public-ticker']);
export const TOOL_BRIEF_V2_NO_ACTION_STATEMENT = 'No current action clears the bar for this window.';

/* Closed refusal taxonomy. A refusal carries a code, a closed reason token and a
   field path — never the rejected value, so a private or hostile payload can
   never be echoed back through an error. */
export const TOOL_BRIEF_V2_ERRORS = Object.freeze({
  VERSION: 'E012-BRIEF-VERSION',
  IDENTITY: 'E012-BRIEF-IDENTITY',
  DEPENDENCY: 'E012-BRIEF-DEPENDENCY',
  FROZEN: 'E012-BRIEF-FROZEN',
  CLAIM: 'E012-BRIEF-CLAIM',
  CORROBORATION: 'E012-BRIEF-CORROBORATION',
  OWNER: 'E012-BRIEF-OWNER',
  UNSAFE: 'E012-BRIEF-UNSAFE',
  CONCISE: 'E012-BRIEF-CONCISE',
  DISCLOSURE: 'E012-BRIEF-DISCLOSURE',
  PRIVACY: 'E012-BRIEF-PRIVACY',
  AUTHORITY: 'E012-BRIEF-AUTHORITY',
  STATE: 'E012-BRIEF-STATE'
});

/* The declared capability ledger for every v2 author process. All false, always. */
export const AUTHOR_V2_CAPABILITIES = Object.freeze({
  web: false,
  shell: false,
  repositoryWrite: false,
  modelRecompute: false,
  providerKey: false,
  privatePortfolio: false
});

const V2_INSTRUCTION_POLICY = [
  'You are a bounded tool-brief author. Read ONLY the frozen JSON data envelope.',
  'Return ONE JSON object matching tool-author-response/v2 with a validated tool-brief/v2 brief.',
  'You may cite ONLY claimIds present in data.evidence.claims, and every material sentence must name',
  'the claim it rests on. You may not browse, add evidence, recompute a model, run shell commands, or',
  'write files. An action requires a trigger, an invalidation, a horizon, a confidence basis, at least',
  'one citation and an owner link. When nothing clears the bar, return state no-action with the exact',
  'supplied statement and fabricate no action, catalyst or confidence.',
  'Output JSON only — no prose, no markdown, no code fences.'
].join(' ');

/* Private Feature-008 / credential field roots. Matched as a substring of a
   lower-cased key name, so `positionSize` and `accountId` are both caught while
   the v2 vocabulary (ticker, citations, horizon, confidenceBasis) stays clean. */
const V2_PRIVATE_FIELD_ROOTS = Object.freeze([
  'holding', 'quantity', 'sharecount', 'costbasis', 'avgcost', 'avgprice', 'lotsize',
  'pnl', 'pandl', 'profitloss', 'mandate', 'exposure', 'position', 'allocationsize',
  'privateticker', 'accountid', 'account', 'apikey', 'api_key', 'password', 'passphrase',
  'secret', 'credential', 'cookie', 'authorization', 'bearer'
]);

const SAFE_OWNER_LINK = /^(?:[a-z0-9][a-z0-9._-]*\.html(?:[#?][A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?|https:\/\/[^\s"'<>]+|#[A-Za-z0-9._-]+)$/;
const V2_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const V2_SHA256 = /^sha256:[0-9a-f]{64}$/;

function briefFailure(code, reason, field) {
  return { ok: false, error: { contractVersion: 'tool-brief-v2-error/v1', code, reason, field: field || null } };
}

/* Recursively refuse any private/credential-shaped KEY. Never returns the value. */
function scanPrivate(value, field) {
  if (value === null || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const found = scanPrivate(value[i], `${field}.${i}`);
      if (found) return found;
    }
    return null;
  }
  for (const key of Object.keys(value)) {
    const lowered = key.toLowerCase();
    if (V2_PRIVATE_FIELD_ROOTS.some((root) => lowered.includes(root))) return { field: `${field}.${key}` };
    const found = scanPrivate(value[key], `${field}.${key}`);
    if (found) return found;
  }
  return null;
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function deepFreezeV2(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreezeV2(value[key]);
  return Object.freeze(value);
}

/* Freeze the exact scheduler-owned read into the only owner-read envelope v2 accepts.
   The scheduler supplies the body; this helper clones, safety-checks and hashes it with
   the same canonicalizer compactToolBriefV2Input re-derives. */
export function freezeToolBriefV2OwnerRead(body, ref) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'owner-read-body-required', 'ownerRead.body');
  }
  if (!isNonEmptyText(ref) || !SAFE_ID.test(ref)) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'owner-read-ref-invalid', 'ownerRead.ref');
  }
  const privateField = scanPrivate(body, 'ownerRead.body');
  if (privateField) return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'private-field-present', privateField.field);
  const unsafe = scanUnsafe(body, 'ownerRead.body');
  if (unsafe) return briefFailure(TOOL_BRIEF_V2_ERRORS.UNSAFE, unsafe.reason, unsafe.field);
  const cloned = JSON.parse(stableStringify(body));
  return {
    ok: true,
    value: deepFreezeV2({ ref, sha256: `sha256:${sha256Hex(stableStringify(cloned))}`, body: cloned })
  };
}

/* compactToolBriefV2Input(input): bind ONE frozen owner read to ONE frozen
   WebEvidence author projection under one cutoff, and reduce them to the bounded
   envelope the author is allowed to see. The projection's declared fingerprint is
   re-derived here; a projection this module cannot re-hash is refused rather than
   trusted. */
export function compactToolBriefV2Input(input) {
  if (!input || typeof input !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'input-required', 'input');
  const { toolId, runId, cutoffAt, ownerRead, evidenceProjection } = input;
  if (!isNonEmptyText(toolId) || !SAFE_ID.test(toolId)) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'tool-id-invalid', 'input.toolId');
  if (!isNonEmptyText(runId) || !SAFE_ID.test(runId)) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'run-id-invalid', 'input.runId');
  if (!V2_ISO.test(cutoffAt || '')) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'cutoff-invalid', 'input.cutoffAt');

  const scope = isNonEmptyText(input.scope) ? input.scope : 'tool';
  if (TOOL_BRIEF_V2_SCOPES.indexOf(scope) === -1) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'scope-invalid', 'input.scope');
  const ticker = input.ticker === null || typeof input.ticker === 'undefined' ? null : input.ticker;
  if (scope === 'public-ticker') {
    const publicTickers = Array.isArray(input.publicTickers) ? input.publicTickers : [];
    if (!isNonEmptyText(ticker) || publicTickers.indexOf(ticker) === -1) {
      // A ticker outside the committed public watchlist is a PRIVACY refusal, not a
      // lookup miss: the only reason to author one is a private holding.
      return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'ticker-not-public', 'input.ticker');
    }
  } else if (ticker !== null) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'ticker-requires-public-scope', 'input.ticker');
  }

  if (!ownerRead || typeof ownerRead !== 'object' || !isNonEmptyText(ownerRead.ref) || !V2_SHA256.test(ownerRead.sha256 || '')) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'owner-read-identity-required', 'input.ownerRead');
  }
  if (!ownerRead.body || typeof ownerRead.body !== 'object') {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'owner-read-body-required', 'input.ownerRead.body');
  }
  if (`sha256:${sha256Hex(stableStringify(ownerRead.body))}` !== ownerRead.sha256) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'owner-read-hash-mismatch', 'input.ownerRead.sha256');
  }

  const projection = evidenceProjection;
  if (!projection || typeof projection !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-projection-required', 'input.evidenceProjection');
  if (projection.contractVersion !== WEB_EVIDENCE_AUTHOR_PROJECTION_CONTRACT) return briefFailure(TOOL_BRIEF_V2_ERRORS.VERSION, 'evidence-projection-version', 'input.evidenceProjection.contractVersion');
  const { projectionFingerprint, ...projectionBody } = projection;
  if (`sha256:${sha256Hex(stableStringify(projectionBody))}` !== projectionFingerprint) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-projection-hash-mismatch', 'input.evidenceProjection.projectionFingerprint');
  }
  if (projection.runId !== runId) return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-run-mismatch', 'input.evidenceProjection.runId');
  if (projection.cutoffAt !== cutoffAt) return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-cutoff-incompatible', 'input.evidenceProjection.cutoffAt');
  if (projection.toolId !== toolId) return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-tool-mismatch', 'input.evidenceProjection.toolId');

  const privateOwner = scanPrivate(ownerRead.body, 'input.ownerRead.body');
  if (privateOwner) return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'private-field-present', privateOwner.field);
  const privateEvidence = scanPrivate(projection, 'input.evidenceProjection');
  if (privateEvidence) return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'private-field-present', privateEvidence.field);

  const data = {
    contractVersion: TOOL_BRIEF_V2_DATA_CONTRACT,
    toolId,
    runId,
    cutoffAt,
    scope,
    ticker,
    ownerRead: { ref: ownerRead.ref, sha256: ownerRead.sha256, body: ownerRead.body },
    evidence: {
      bundleRef: projection.bundleRef,
      bundleSha256: projection.bundleSha256,
      projectionFingerprint,
      frozenAt: projection.frozenAt,
      cutoffAt: projection.cutoffAt,
      claims: projection.claims,
      omittedClaims: projection.omittedClaims,
      sources: projection.sources
    },
    noActionStatement: TOOL_BRIEF_V2_NO_ACTION_STATEMENT
  };

  const unsafe = scanUnsafe(data, 'data');
  if (unsafe) return briefFailure(TOOL_BRIEF_V2_ERRORS.UNSAFE, unsafe.reason, unsafe.field);

  return {
    ok: true,
    value: {
      contractVersion: TOOL_BRIEF_V2_COMPACT_CONTRACT,
      data,
      maxOutputTokens: Number.isInteger(input.maxOutputTokens) ? input.maxOutputTokens : null
    }
  };
}

/* buildToolAuthorRequestV2(compactInput, identity): assemble ONE bounded
   tool-author-request/v2. The instruction policy stays a separate top-level
   field, the frozen data envelope carries the exact refs/hashes/cutoff, and the
   capability ledger is stamped all-false. */
export function buildToolAuthorRequestV2(compactInput, identity) {
  if (!compactInput || typeof compactInput !== 'object' || compactInput.contractVersion !== TOOL_BRIEF_V2_COMPACT_CONTRACT) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'compact-input-required', 'compactInput');
  }
  if (!identity || typeof identity !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'identity-required', 'identity');
  for (const key of REQUIRED_IDENTITY) {
    if (typeof identity[key] !== 'string' || !SAFE_ID.test(identity[key])) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'identity-field-invalid', `identity.${key}`);
    }
  }
  for (const key of Object.keys(identity)) {
    if (SECRET_SHAPED_KEY.test(key)) return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'secret-shaped-identity', `identity.${key}`);
  }

  const request = {
    contractVersion: TOOL_AUTHOR_REQUEST_V2_CONTRACT,
    instructions: V2_INSTRUCTION_POLICY,
    capabilities: AUTHOR_V2_CAPABILITIES,
    data: compactInput.data,
    provider: identity.providerId,
    model: identity.modelId,
    promptPolicy: identity.promptPolicyVersion,
    schema: identity.schemaVersion,
    validator: identity.validatorVersion,
    maxOutputTokens: compactInput.maxOutputTokens
  };
  request.requestFingerprint = requestFingerprint(request);
  return { ok: true, request };
}

/* assertAuthorV2Capabilities(request): refuse to dispatch a v2 request whose
   ledger is absent, reshaped, or claims ANY authority. */
export function assertAuthorV2Capabilities(request) {
  if (!request || typeof request !== 'object' || request.contractVersion !== TOOL_AUTHOR_REQUEST_V2_CONTRACT) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.VERSION, 'v2-request-required', 'request.contractVersion');
  }
  const ledger = request.capabilities;
  if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.AUTHORITY, 'capability-ledger-required', 'request.capabilities');
  }
  const expected = Object.keys(AUTHOR_V2_CAPABILITIES).sort();
  if (JSON.stringify(Object.keys(ledger).sort()) !== JSON.stringify(expected)) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.AUTHORITY, 'capability-ledger-reshaped', 'request.capabilities');
  }
  for (const key of expected) {
    if (ledger[key] !== false) return briefFailure(TOOL_BRIEF_V2_ERRORS.AUTHORITY, 'capability-granted', `request.capabilities.${key}`);
  }
  return { ok: true, capabilities: ledger };
}

function validateConciseAction(action, path) {
  const required = ['verb', 'subject', 'trigger', 'invalidation', 'horizon', 'confidenceBasis', 'ownerLink'];
  for (const field of required) {
    if (!isNonEmptyText(action[field])) return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'concise-field-required', `${path}.${field}`);
  }
  if (!SAFE_OWNER_LINK.test(action.ownerLink)) return briefFailure(TOOL_BRIEF_V2_ERRORS.UNSAFE, 'owner-link-unsafe', `${path}.ownerLink`);
  if (!Array.isArray(action.citations) || action.citations.length === 0) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'citation-required', `${path}.citations`);
  }
  return { ok: true };
}

/* validateToolBriefV2(brief, context): the independent validator. It NEVER trusts
   the author's own claim of correctness.
   - with `context.request`, it additionally binds the brief to the exact frozen
     owner read, bundle and supplied claim set that were dispatched; and
   - without a request it performs every structural, safety, state and disclosure
     check, which is what the v1 compatibility projection needs. */
export function validateToolBriefV2(brief, context) {
  const ctx = context || {};
  const request = ctx.request && typeof ctx.request === 'object' ? ctx.request : null;
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'brief-not-object', 'brief');
  if (brief.contractVersion !== TOOL_BRIEF_V2_CONTRACT) return briefFailure(TOOL_BRIEF_V2_ERRORS.VERSION, 'brief-version-unsupported', 'brief.contractVersion');

  const privateField = scanPrivate(brief, 'brief');
  if (privateField) return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'private-field-present', privateField.field);
  const unsafe = scanUnsafe(brief, 'brief');
  if (unsafe) return briefFailure(TOOL_BRIEF_V2_ERRORS.UNSAFE, unsafe.reason, unsafe.field);

  for (const field of ['briefId', 'toolId', 'runId', 'ownerReadRef', 'evidenceBundleRef']) {
    if (!isNonEmptyText(brief[field])) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'identity-field-required', `brief.${field}`);
  }
  if (!V2_ISO.test(brief.cutoffAt || '')) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'cutoff-invalid', 'brief.cutoffAt');
  if (!V2_SHA256.test(brief.ownerReadSha256 || '')) return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'owner-read-hash-invalid', 'brief.ownerReadSha256');
  if (!V2_SHA256.test(brief.evidenceBundleSha256 || '')) return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-hash-invalid', 'brief.evidenceBundleSha256');
  if (TOOL_BRIEF_V2_SCOPES.indexOf(brief.scope) === -1) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'scope-invalid', 'brief.scope');
  if (TOOL_BRIEF_V2_STATES.indexOf(brief.state) === -1) return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'state-invalid', 'brief.state');

  /* frozen-input binding — only assertable when the dispatched request is supplied. */
  let suppliedClaims = null;
  if (request) {
    const data = request.data;
    if (!data || typeof data !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'request-data-required', 'request.data');
    if (brief.toolId !== data.toolId || brief.runId !== data.runId) return briefFailure(TOOL_BRIEF_V2_ERRORS.IDENTITY, 'run-identity-mismatch', 'brief.runId');
    if (brief.cutoffAt !== data.cutoffAt) return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'cutoff-mismatch', 'brief.cutoffAt');
    if (brief.ownerReadRef !== data.ownerRead.ref || brief.ownerReadSha256 !== data.ownerRead.sha256) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'owner-read-mismatch', 'brief.ownerReadSha256');
    }
    if (brief.evidenceBundleRef !== data.evidence.bundleRef || brief.evidenceBundleSha256 !== data.evidence.bundleSha256) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.FROZEN, 'evidence-mismatch', 'brief.evidenceBundleSha256');
    }
    if (brief.scope !== data.scope || brief.ticker !== data.ticker) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.PRIVACY, 'scope-mismatch', 'brief.scope');
    }
    suppliedClaims = new Map(data.evidence.claims.map((claim) => [claim.claimId, claim]));
  }

  const concise = brief.concise && typeof brief.concise === 'object' && !Array.isArray(brief.concise) ? brief.concise : null;
  if (!concise) return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'concise-required', 'brief.concise');
  const action = concise.action && typeof concise.action === 'object' ? concise.action : null;
  const catalysts = Array.isArray(concise.catalysts) ? concise.catalysts : [];

  if (brief.state === 'action') {
    if (!action) return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'action-required', 'brief.concise.action');
    const checked = validateConciseAction(action, 'brief.concise.action');
    if (!checked.ok) return checked;
  }
  if (brief.state === 'catalyst' && catalysts.length === 0) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'catalyst-required', 'brief.concise.catalysts');
  }
  if (action && brief.state !== 'action' && brief.state !== 'carried') {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'action-contradicts-state', 'brief.concise.action');
  }
  for (let i = 0; i < catalysts.length; i += 1) {
    const catalyst = catalysts[i];
    if (!catalyst || typeof catalyst !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'catalyst-not-object', `brief.concise.catalysts.${i}`);
    for (const field of ['subject', 'trigger', 'invalidation', 'horizon', 'ownerLink']) {
      if (!isNonEmptyText(catalyst[field])) return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'concise-field-required', `brief.concise.catalysts.${i}.${field}`);
    }
    if (!SAFE_OWNER_LINK.test(catalyst.ownerLink)) return briefFailure(TOOL_BRIEF_V2_ERRORS.UNSAFE, 'owner-link-unsafe', `brief.concise.catalysts.${i}.ownerLink`);
    if (!V2_ISO.test(catalyst.whenAt || '')) return briefFailure(TOOL_BRIEF_V2_ERRORS.CONCISE, 'catalyst-when-invalid', `brief.concise.catalysts.${i}.whenAt`);
  }

  /* claim-level accountability. */
  const mappings = Array.isArray(brief.claimMappings) ? brief.claimMappings : null;
  if (!mappings) return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'claim-mappings-required', 'brief.claimMappings');
  const cited = new Set();
  for (let i = 0; i < mappings.length; i += 1) {
    const mapping = mappings[i];
    if (!mapping || typeof mapping !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'mapping-not-object', `brief.claimMappings.${i}`);
    if (!isNonEmptyText(mapping.sentence)) return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'mapping-sentence-required', `brief.claimMappings.${i}.sentence`);
    if (!isNonEmptyText(mapping.claimId)) return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'mapping-claim-required', `brief.claimMappings.${i}.claimId`);
    cited.add(mapping.claimId);
    if (!suppliedClaims) continue;
    const claim = suppliedClaims.get(mapping.claimId);
    if (!claim) return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'claim-not-supplied', `brief.claimMappings.${i}.claimId`);
    if (claim.materiality === 'material') {
      if (claim.corroborationState !== 'corroborated' || claim.independentOriginGroups.length < 2) {
        return briefFailure(TOOL_BRIEF_V2_ERRORS.CORROBORATION, 'material-claim-uncorroborated', `brief.claimMappings.${i}.claimId`);
      }
      if (claim.claimKind === 'market-state' && claim.ownerEvidenceRefs.length === 0) {
        return briefFailure(TOOL_BRIEF_V2_ERRORS.OWNER, 'market-state-claim-ungrounded', `brief.claimMappings.${i}.claimId`);
      }
    }
  }

  const conciseCitations = []
    .concat(action && Array.isArray(action.citations) ? action.citations : [])
    .concat(catalysts.reduce((all, catalyst) => all.concat(Array.isArray(catalyst.citations) ? catalyst.citations : []), []));
  for (const citation of conciseCitations) {
    if (!isNonEmptyText(citation)) return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'citation-invalid', 'brief.concise.citations');
    cited.add(citation);
    if (suppliedClaims && !suppliedClaims.has(citation)) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.CLAIM, 'claim-not-supplied', 'brief.concise.citations');
    }
  }

  /* long detail is CLOSED by default — that is the whole of SCN-012-008's second half. */
  const detail = Array.isArray(brief.detail) ? brief.detail : null;
  if (!detail) return briefFailure(TOOL_BRIEF_V2_ERRORS.DISCLOSURE, 'detail-required', 'brief.detail');
  for (let i = 0; i < detail.length; i += 1) {
    const entry = detail[i];
    if (!entry || typeof entry !== 'object' || !isNonEmptyText(entry.id)) return briefFailure(TOOL_BRIEF_V2_ERRORS.DISCLOSURE, 'detail-id-required', `brief.detail.${i}.id`);
    if (entry.open === true) return briefFailure(TOOL_BRIEF_V2_ERRORS.DISCLOSURE, 'detail-open-by-default', `brief.detail.${i}.open`);
  }

  /* truth states. */
  if (brief.state === 'no-action') {
    const noAction = brief.noAction;
    if (!noAction || typeof noAction !== 'object') return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'no-action-required', 'brief.noAction');
    if (noAction.statement !== TOOL_BRIEF_V2_NO_ACTION_STATEMENT) return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'no-action-statement-mismatch', 'brief.noAction.statement');
    if (noAction.fabricatedAction !== false || noAction.fabricatedCatalyst !== false || noAction.fabricatedConfidence !== false) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'no-action-fabrication-flag', 'brief.noAction');
    }
    if (action || catalysts.length > 0) return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'no-action-carries-content', 'brief.concise');
  } else if (brief.noAction) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'no-action-contradicts-state', 'brief.noAction');
  }
  if (brief.state === 'carried') {
    const carried = brief.carriedFrom;
    if (!carried || typeof carried !== 'object' || !isNonEmptyText(carried.runId) || !isNonEmptyText(carried.briefRef) || !isNonEmptyText(carried.reason)) {
      return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'carried-provenance-required', 'brief.carriedFrom');
    }
  } else if (brief.carriedFrom) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'carried-contradicts-state', 'brief.carriedFrom');
  }
  if (brief.state === 'unavailable' && !isNonEmptyText(brief.unavailableReason)) {
    return briefFailure(TOOL_BRIEF_V2_ERRORS.STATE, 'unavailable-reason-required', 'brief.unavailableReason');
  }

  return {
    ok: true,
    value: {
      contractVersion: TOOL_BRIEF_V2_CONTRACT,
      briefId: brief.briefId,
      toolId: brief.toolId,
      runId: brief.runId,
      scope: brief.scope,
      ticker: brief.ticker ?? null,
      state: brief.state,
      conciseFieldsPresent: brief.state === 'no-action' ? action === null && catalysts.length === 0 : Boolean(action || catalysts.length > 0),
      detailClosedByDefault: detail.every((entry) => entry.open !== true),
      citationCount: cited.size,
      claimMappingCount: mappings.length,
      boundToRequest: Boolean(request),
      briefFingerprint: `sha256:${sha256Hex(stableStringify(brief))}`
    }
  };
}

/* compatibleToolBriefV1View(brief): project a validated v2 brief into the shape a
   v1 reader already understands. v1 gains nothing it must newly tolerate: the
   projection carries no v2-only field, so an unchanged v1 consumer keeps working
   while a v2-aware consumer reads the richer object directly. */
export function compatibleToolBriefV1View(brief) {
  const verdict = validateToolBriefV2(brief, {});
  if (!verdict.ok) return verdict;
  const action = brief.concise && brief.concise.action ? brief.concise.action : null;
  const summary = action
    ? `${action.verb} ${action.subject} — trigger: ${action.trigger}; invalidation: ${action.invalidation}; horizon: ${action.horizon}.`
    : (brief.state === 'no-action' ? TOOL_BRIEF_V2_NO_ACTION_STATEMENT : `No current action for ${brief.toolId} in this window (${brief.state}).`);
  return {
    ok: true,
    value: {
      contractVersion: 'tool-brief/v1',
      briefId: brief.briefId,
      toolId: brief.toolId,
      runId: brief.runId,
      cutoffAt: brief.cutoffAt,
      summary,
      citations: Array.from(new Set((brief.claimMappings || []).map((mapping) => mapping.claimId))),
      supersededBy: TOOL_BRIEF_V2_CONTRACT
    }
  };
}
