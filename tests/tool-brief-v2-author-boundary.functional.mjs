/*
 * tests/tool-brief-v2-author-boundary.functional.mjs
 * ---------------------------------------------------------------------------
 * Feature 012 Scope 11 — TP-11-03.
 *
 * The POWERLESS-AUTHOR proof for SCN-012-005, plus the SCN-012-006 / SCN-012-007
 * corroboration refusals carried forward from Scope 10.
 *
 * Two independent kinds of evidence are produced here, and neither is a claim:
 *
 *  (a) a SOURCE scan of scripts/brief-author.mjs — the author boundary's own
 *      file is read and its import list and capability surface are derived from
 *      the text. A declared ledger that says "web: false" proves nothing on its
 *      own; this proves the module could not reach the network even if the
 *      ledger lied.
 *
 *  (b) a REAL bounded child process. `invokeAuthor` spawns node with shell:false
 *      and a hard stdout/time ceiling, and the author script is handed the exact
 *      request JSON on stdin. What the process can see is exactly what the frozen
 *      envelope contains — asserted by having the author echo its own view back.
 *
 * No network, no repository write, no provider key anywhere in this file.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  AUTHOR_V2_CAPABILITIES,
  TOOL_BRIEF_V2_ERRORS,
  assertAuthorV2Capabilities,
  buildToolAuthorRequestV2,
  compactToolBriefV2Input,
  invokeAuthor,
  validateAuthorEnvelope,
  validateToolBriefV2
} from '../scripts/brief-author.mjs';
import { freezeBundleForAuthor } from '../scripts/web-evidence-acquire.mjs';
import * as fx from './fixtures/feature-012/tool-brief-v2/builder.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUTHOR_MODULE = path.join(HERE, '..', 'scripts', 'brief-author.mjs');
const NARRATIVE_MODULE = path.join(HERE, '..', 'scripts', 'brief-narrative-parallel.mjs');
const ECHO_AUTHOR = path.join(HERE, 'fixtures', 'feature-012', 'tool-brief-v2', 'echo-author.mjs');

function requestFor(options) {
  const opts = options || {};
  const frozen = freezeBundleForAuthor(opts.bundle || fx.bundle(), fx.lanePolicy());
  assert.equal(frozen.ok, true, JSON.stringify(frozen.error || null));
  const compact = compactToolBriefV2Input({
    toolId: fx.TOOL_ID, runId: fx.RUN_ID, cutoffAt: fx.CUTOFF_AT,
    ownerRead: fx.ownerRead(), evidenceProjection: frozen.value,
    scope: 'tool', ticker: null, publicTickers: []
  });
  assert.equal(compact.ok, true, JSON.stringify(compact.error || null));
  const built = buildToolAuthorRequestV2(compact.value, fx.identity());
  assert.equal(built.ok, true, JSON.stringify(built.error || null));
  return { frozen: frozen.value, request: built.request };
}

/* ═══════════ (a) the capability ledger, derived from the module source ═══════════ */

test('the author boundary module imports nothing that could reach the network, a shell, or the repository', () => {
  const raw = readFileSync(AUTHOR_MODULE, 'utf8');
  const imports = Array.from(raw.matchAll(/^import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"];?$/gm)).map((m) => m[1]).sort();
  assert.deepEqual(imports, ['node:child_process', 'node:crypto'],
    'the author boundary imports ONLY node:child_process and node:crypto');

  /* Scan EXECUTABLE source only. The module's own header prose names the capabilities it
     does not hold ("never imports ... fetch, a shell ... localStorage"), and matching that
     sentence would fail the module for describing its own boundary correctly. */
  const source = raw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

  const forbidden = [
    { name: 'network fetch', pattern: /\bfetch\s*\(/ },
    { name: 'node http/https client', pattern: /require\(['"]node:https?['"]\)|from ['"]node:https?['"]/ },
    { name: 'filesystem write', pattern: /\b(?:writeFileSync|appendFileSync|unlinkSync|rmSync|mkdirSync|createWriteStream)\s*\(/ },
    { name: 'filesystem read', pattern: /\b(?:readFileSync|createReadStream)\s*\(/ },
    { name: 'shell execution', pattern: /\b(?:exec|execSync|execFile|execFileSync)\s*\(/ },
    { name: 'shell:true spawn', pattern: /shell\s*:\s*true/ },
    { name: 'browser storage', pattern: /\b(?:localStorage|sessionStorage|indexedDB)\b/ },
    { name: 'provider credential read', pattern: /process\.env\.[A-Z_]*(?:KEY|TOKEN|SECRET|PASSWORD)/ }
  ];
  const found = forbidden.filter((entry) => entry.pattern.test(source)).map((entry) => entry.name);
  assert.deepEqual(found, [], `the author boundary must own zero forbidden capability, found: ${found.join(', ')}`);

  // spawn is present and is always shell:false — the ONE process capability it does hold, bounded.
  assert.equal(/spawn\(settings\.command, settings\.args, \{ shell: false/.test(source), true,
    'the only child process the boundary can start is spawned with shell:false');
});

test('the declared v2 capability ledger grants nothing and a granted capability is refused before dispatch', () => {
  assert.deepEqual(Object.values(AUTHOR_V2_CAPABILITIES), [false, false, false, false, false, false]);
  const { request } = requestFor();
  assert.equal(assertAuthorV2Capabilities(request).ok, true);

  for (const capability of Object.keys(AUTHOR_V2_CAPABILITIES)) {
    const granted = { ...request, capabilities: { ...AUTHOR_V2_CAPABILITIES, [capability]: true } };
    const verdict = assertAuthorV2Capabilities(granted);
    assert.equal(verdict.ok, false, `granting ${capability} must be refused`);
    assert.equal(verdict.error.code, TOOL_BRIEF_V2_ERRORS.AUTHORITY);
  }

  const reshaped = { ...request, capabilities: { web: false } };
  assert.equal(assertAuthorV2Capabilities(reshaped).error.code, TOOL_BRIEF_V2_ERRORS.AUTHORITY);
  const missing = { ...request };
  delete missing.capabilities;
  assert.equal(assertAuthorV2Capabilities(missing).error.code, TOOL_BRIEF_V2_ERRORS.AUTHORITY);
});

test('legacy narrative author lanes cannot browse after web evidence moves before authorship', () => {
  const raw = readFileSync(NARRATIVE_MODULE, 'utf8');
  const laneBlock = (laneId) => {
    const start = raw.indexOf(`id: '${laneId}'`);
    assert.notEqual(start, -1, `lane ${laneId} must remain declared`);
    const candidateEnds = [raw.indexOf('\n    },', start), raw.indexOf('\n};', start)].filter((value) => value !== -1);
    const end = candidateEnds.length ? Math.min(...candidateEnds) : -1;
    assert.notEqual(end, -1, `lane ${laneId} must have a bounded declaration`);
    return raw.slice(start, end);
  };

  for (const laneId of ['core', 'signals']) {
    const block = laneBlock(laneId);
    assert.match(block, /web:\s*false\b/, `${laneId} is an author lane and must receive frozen inputs without browsing`);
    assert.doesNotMatch(block, /web:\s*true\b/, `${laneId} must never receive a curated URL allowlist`);
  }

  const acquisition = laneBlock('research-acquisition');
  assert.match(acquisition, /web:\s*true\b/, 'the separately named acquisition lane retains the bounded web capability');
});

/* ═══════════ (b) the REAL bounded child process sees only the frozen envelope ═══════════ */

test('a real bounded author process receives exactly the frozen owner read and qualified evidence', async () => {
  const { request, frozen } = requestFor();
  const result = await invokeAuthor(request, {
    command: process.execPath, args: [ECHO_AUTHOR, '--mode=inventory'], timeoutMs: 20000
  });
  assert.equal(result.ok, true, `the bounded process must return one JSON envelope: ${JSON.stringify(result.error || null)}`);

  const seen = result.envelope.observed;
  assert.deepEqual(seen.topLevelKeys.sort(), [
    'capabilities', 'contractVersion', 'data', 'instructions', 'maxOutputTokens',
    'model', 'promptPolicy', 'provider', 'requestFingerprint', 'schema', 'validator'
  ], 'the author sees exactly the bounded request fields and nothing else');
  assert.equal(seen.ownerReadSha256, fx.ownerRead().sha256);
  assert.equal(seen.evidenceBundleSha256, frozen.bundleSha256);
  assert.deepEqual(seen.claimIds, ['claim-guidance', 'claim-margin']);
  assert.equal(seen.hasRawExcerptText, false, 'no raw source excerpt text is visible to the author');
  assert.equal(seen.capabilitiesGranted, 0, 'the process is handed a ledger granting nothing');

  // The process reports what it could observe of its own environment.
  assert.equal(seen.providerCredentialVisible, false, 'no provider credential is present in the request or the process environment');
});

test('the bounded process is closed against oversize, malformed, timeout, and duplicate responses', async () => {
  const { request } = requestFor();

  const oversize = await invokeAuthor(request, { command: process.execPath, args: [ECHO_AUTHOR, '--mode=oversize'], maxStdoutBytes: 2048, timeoutMs: 20000 });
  assert.equal(oversize.ok, false);
  assert.equal(oversize.error.code, 'B002-TOOL-AUTHOR-OVERSIZE');

  const malformed = await invokeAuthor(request, { command: process.execPath, args: [ECHO_AUTHOR, '--mode=malformed'], timeoutMs: 20000 });
  assert.equal(malformed.ok, false);
  assert.equal(malformed.error.code, 'B002-TOOL-AUTHOR-MALFORMED');

  const timedOut = await invokeAuthor(request, { command: process.execPath, args: [ECHO_AUTHOR, '--mode=hang'], timeoutMs: 400 });
  assert.equal(timedOut.ok, false);
  assert.equal(timedOut.error.code, 'B002-TOOL-AUTHOR-TIMEOUT');

  const seen = new Set();
  const brief = fx.authoredBrief(request);
  const first = validateAuthorEnvelope({ contractVersion: 'tool-author-response/v2', requestFingerprint: request.requestFingerprint, brief }, request, { seen });
  assert.equal(first.ok, true, JSON.stringify(first.error || null));
  const repeat = validateAuthorEnvelope({ contractVersion: 'tool-author-response/v2', requestFingerprint: request.requestFingerprint, brief }, request, { seen });
  assert.equal(repeat.ok, false);
  assert.equal(repeat.error.code, 'B002-TOOL-AUTHOR-DUPLICATE');
});

test('an envelope whose fingerprint does not match the dispatched request is refused', async () => {
  const { request } = requestFor();
  const brief = fx.authoredBrief(request);
  const forged = validateAuthorEnvelope({ contractVersion: 'tool-author-response/v2', requestFingerprint: `sha256:${'0'.repeat(64)}`, brief }, request, {});
  assert.equal(forged.ok, false);
  assert.equal(forged.error.code, 'B002-TOOL-AUTHOR-MISMATCH');
});

/* ═══════════ SCN-012-006 / SCN-012-007 — unsupported and syndicated claims ═══════════ */

test('SCN-012-006 a single-origin material claim never becomes authorable evidence', () => {
  const single = fx.bundle({
    claims: [fx.claim('claim-single', { independentOriginGroups: ['origin:a'], corroborationState: 'uncorroborated', authorable: false })]
  });
  const frozen = freezeBundleForAuthor(single, fx.lanePolicy());
  assert.equal(frozen.ok, true);
  assert.deepEqual(frozen.value.claims, [], 'a single-origin material claim is withheld from the author entirely');
  assert.deepEqual(frozen.value.omittedClaims, [{ claimId: 'claim-single', reason: 'not-authorable' }]);
});

test('SCN-012-007 a syndicated common-origin claim is refused at author time even if it reaches the brief', () => {
  const syndicated = fx.bundle({
    claims: [fx.claim('claim-syndicated', { independentOriginGroups: ['origin:wire'], authorable: true, corroborationState: 'corroborated' })]
  });
  const frozen = freezeBundleForAuthor(syndicated, fx.lanePolicy());
  assert.equal(frozen.ok, true, 'the acquisition stage already marked it authorable — the author validator is the second gate');
  const compact = compactToolBriefV2Input({
    toolId: fx.TOOL_ID, runId: fx.RUN_ID, cutoffAt: fx.CUTOFF_AT,
    ownerRead: fx.ownerRead(), evidenceProjection: frozen.value, scope: 'tool', ticker: null, publicTickers: []
  });
  const built = buildToolAuthorRequestV2(compact.value, fx.identity());
  const concise = fx.authoredBrief(built.request).concise;
  concise.action.citations = ['claim-syndicated'];
  concise.catalysts = [];
  const brief = fx.authoredBrief(built.request, {
    concise,
    claimMappings: [{ sentence: 'One wire says the guide moved.', claimId: 'claim-syndicated', materiality: 'material' }]
  });
  const verdict = validateToolBriefV2(brief, { request: built.request });
  assert.equal(verdict.ok, false, 'a material claim resting on ONE independent origin group is refused');
  assert.equal(verdict.error.code, TOOL_BRIEF_V2_ERRORS.CORROBORATION);
});

test('a market-state claim with no owner evidence is refused as ungrounded', () => {
  const ungrounded = fx.bundle({
    claims: [fx.claim('claim-market', { ownerEvidenceRefs: [] })]
  });
  const frozen = freezeBundleForAuthor(ungrounded, fx.lanePolicy());
  const compact = compactToolBriefV2Input({
    toolId: fx.TOOL_ID, runId: fx.RUN_ID, cutoffAt: fx.CUTOFF_AT,
    ownerRead: fx.ownerRead(), evidenceProjection: frozen.value, scope: 'tool', ticker: null, publicTickers: []
  });
  const built = buildToolAuthorRequestV2(compact.value, fx.identity());
  const concise = fx.authoredBrief(built.request).concise;
  concise.action.citations = ['claim-market'];
  concise.catalysts = [];
  const brief = fx.authoredBrief(built.request, {
    concise,
    claimMappings: [{ sentence: 'The market state moved.', claimId: 'claim-market', materiality: 'material' }]
  });
  const verdict = validateToolBriefV2(brief, { request: built.request });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.error.code, TOOL_BRIEF_V2_ERRORS.OWNER);
});
