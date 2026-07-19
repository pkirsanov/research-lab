import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REPORT_PATH = 'specs/004-fx-regime-relative-value-lab/report.md';
const FEATURE_SIX_REPORT_PATH = 'specs/006-trend-dynamics-cycle-lab/report.md';
const FEATURE_SIX_STATE_PATH = 'specs/006-trend-dynamics-cycle-lab/state.json';
const FEATURE_TEN_REPORT_PATH = 'specs/010-company-fundamentals-and-brief-lab/scopes/01-contract-config-validator-publication-foundation/report.md';
const FEATURE_TEN_STATE_PATH = 'specs/010-company-fundamentals-and-brief-lab/state.json';
const TOOL_LOG_PATH = '.specify/runtime/tool-calls.jsonl';
const BASELINE_BLOCK_SHA256 = '3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad';
const SUPERSESSION_BLOCK_SHA256 = '251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d';
const DISPOSITION_BLOCK_SHA256 = '5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e';
const DELTA_BLOCK_SHA256 = '334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b';
const SETTLED_BLOCK_SHA256 = 'f3e631e3f10ea456685b749f24b4dcf58ea042d60f24b9de7a2fcd77f08864f0';
const SCRIPT_TRANSITIONS_BLOCK_SHA256 = '6939ebd01e0a1b89849b75c9b228e0957c285f8500c6191da5338a5ae58dad69';
const SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256 = '1df8a233ab8bf6daec8c8081fdb61176e113b5bf4436eb7e3904824265b4f592';
const OWNER_SETTLED_SELFTEST_BLOCK_SHA256 = 'a569a5eaa89ca2de4905167dd2bfe13c306e88fb8e11dd912efdaee86523cc07';
const SELFTEST_SUCCESSOR_V2_BLOCK_SHA256 = 'eef8aa415b739df80b1aab4046adbb64a39c87c6fb1b73ff0ac210b67870f32a';
const SELFTEST_SUCCESSOR_V2_BLOCK_BYTE_LENGTH = 35844;
const SELFTEST_SUCCESSOR_V3_BLOCK_SHA256 = '8427a99ae9cadd27e401a7a06bd2f0e707e3c5096508c4e7fe903db67f8f1995';
const SELFTEST_SUCCESSOR_V3_BLOCK_BYTE_LENGTH = 18606;
const EXPECTED_CHECKPOINT_PATHS = [
  'rldata.js',
  'scripts/selftest.mjs',
  'scripts/fetch-bars.mjs',
  'global-rotation-lab.html',
  'index.html',
  'rlnav.js',
  'tools.json',
  'market-brief.html',
  'notes/market-brief.md',
  'README.md',
  'notes/README.md',
  'scripts/validate-brief-payload.mjs',
  'market-brief.config.json'
];
const EXPECTED_SUPERSEDED_RLDATA_HUNKS = [
  'e8864cffc8ed788d0c462d63967bb0cf8c3cf0187b42c2a56fb1fec122e439b6',
  '685fef4c9a52fe92c9aeb613b0c8f145681ef5dbc15dcb3d81ca17eca913283c',
  '11621f8ac37c1e4d65a59b0578af9e475c201fc9d5b1beb8771760dcdbfa5908',
  'a37cdc31bec1b491768bf7376067665d15596fec966309203b515ffc73880f43'
];
const EXPECTED_DISPOSITION_HUNKS = [
  {
    path: 'scripts/selftest.mjs',
    originalHunkBodySha256: 'c412a7268a4ed3b6e9fe8aea49fd954e45ad2240d2c033daee9c2a0cc94961eb',
    baselineHunkIndex: 5,
    baselineHunkHeader: '@@ -674,0 +836,31 @@ try {',
    currentHunkIndex: 6,
    currentHunkBodySha256: 'b3bf06c127dad8e254c655628cb0396c318124c05f73f854e97d0e7456297794'
  },
  {
    path: 'scripts/selftest.mjs',
    originalHunkBodySha256: 'ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc',
    baselineHunkIndex: 6,
    baselineHunkHeader: '@@ -689,0 +882,143 @@ try {',
    currentHunkIndex: 7,
    currentHunkBodySha256: '0f9739b064bc90a02c3baf5a1014442b8f566ad9f88dd3528c1103a462c55e1b'
  },
  {
    path: 'index.html',
    originalHunkBodySha256: '631ba96d2e0e396b1e49cd7a9b288b6ada1464d889c9ff7fd62a38fda75fcbd0',
    baselineHunkIndex: 2,
    baselineHunkHeader: '@@ -107,0 +109,121 @@',
    currentHunkIndex: 2,
    currentHunkBodySha256: '4a16da9963c053126d42e4c9dd906ae9b6334700dc6e8b2e77c6041c6cc4f634'
  },
  {
    path: 'index.html',
    originalHunkBodySha256: '784e0fa7488dfea165fc6e4280cc93c2d1b4092582a8fbdf558d45a6712ee86b',
    baselineHunkIndex: 4,
    baselineHunkHeader: '@@ -273,2 +410,2 @@',
    currentHunkIndex: 4,
    currentHunkBodySha256: '81b692552dff1467ced513d166eff6b709e9ce3ba9d034d18afe30793959c0ec'
  },
  {
    path: 'index.html',
    originalHunkBodySha256: '5e7199274d025114bfb9a1b9ae1d63fae602e3381506341c63ca8e89a5c003c1',
    baselineHunkIndex: 6,
    baselineHunkHeader: '@@ -283,0 +421,2 @@',
    currentHunkIndex: 6,
    currentHunkBodySha256: '5bd7a10ad9f02cbf8dc0f19b51c733e259b20b16e87969723b4422e1899478c7'
  }
];
const EXPECTED_DISPOSITION_PATHS = ['scripts/selftest.mjs', 'index.html'];
const EXPECTED_DISPOSITION_HANDOFF = [
  'Keep the raw feature004-dirty-baseline-v1 and feature004-dirty-supersession-v1 block hashes unchanged.',
  'Parse exactly one feature004-dirty-collision-disposition-v1 block and reject any unknown or missing top-level, baseline-source, accepted-hunk, owner, current-path, preservation, or handoff key.',
  'Require exactly five unique accepted original records in the listed order and prove each hash belongs to the named original baseline path before removing it from that path\'s required multiset.',
  'Validate the existing four-hash rldata.js checkpoint independently; this checkpoint cannot widen or replace its path or hash set.',
  'Recompute status, staged and unstaged state, index OID, worktree SHA-256, Git worktree OID, hunk count, and complete ordered hunk hashes for both current paths and require exact equality.',
  'Require every original hash outside the existing rldata.js four-hash set and this five-hash set, plus every untracked and volatile contract, exactly as before.',
  'Reject duplicate, unknown, path-mismatched, ownerless, evidence-less, incomplete, identity-mismatched, added, removed, or reordered records and hunks.',
  'Do not add a skip, fallback, broad path exemption, subset comparison, or success-on-unknown branch.'
];
const EXPECTED_DELTA_HANDOFF = [
  'Require the feature004-dirty-baseline-v1 and feature004-dirty-supersession-v1 raw hashes unchanged, then require the feature004-dirty-collision-disposition-v1 raw hash to equal 5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e before applying this delta.',
  'Parse exactly one feature004-dirty-collision-delta-v1 block and reject a duplicate, missing marker, malformed JSON, or any unknown or missing top-level or nested field.',
  'Require contractVersion feature004-dirty-collision-delta/v1, findingId F004-IDENTITY-DRIFT-001, a UTC ISO-8601 capturedAt, and the exact extendsContract marker and raw hash.',
  'Require exactly one hunkTransition object: path scripts/selftest.mjs, hunkIndex 7, the exact previous and current hashes, and disposition owner-attributed-additive-delta.',
  'Validate the prior disposition, its five accepted original hunks, both prior currentPaths, the independent four-hash supersession, every other baseline hash, every untracked contract, and the volatile-path rule before overlaying the delta.',
  'Overlay only scripts/selftest.mjs in the prior currentPaths array; every non-target currentPaths record must still recompute to the inherited identity exactly.',
  'Before accepting the overlay, require path, status, staged, unstaged, indexOid, hunkCount, and ordered hashes 1 through 6 to equal the prior scripts/selftest.mjs record, and require only ordered hunk 7 to make the named old-to-current transition.',
  'Recompute scripts/selftest.mjs status, staged and unstaged state, index OID, Git worktree OID, worktree SHA-256, hunk count, and all seven ordered hunk hashes and require exact equality with currentPathIdentity.',
  'Require the Feature 006 start and Feature 007 end markers exactly once and in order, require the exact marker byte offsets and slice SHA-256, and require all eight ownedSymbols inside the slice and absent outside it.',
  'Require ownerAttribution to name only bubbles.implement, specs/006-trend-dynamics-cycle-lab, Scope 3, and phase implement; require the exact observedState, artifactRefs, and two append-only toolLogRefs with matching line metadata.',
  'Require aggregateObservation to remain exitCode 1 with 491 passed and 1 failed solely on the exact Market Brief nextSession.sessionDate message, and require all three completion/pass claim booleans to remain false.',
  'Reject any duplicate transition, second path, second hunk, path mismatch, owner mismatch, evidence mismatch, marker drift, symbol outside the owner slice, identity mismatch, hunk addition, hunk removal, or hunk reorder.',
  'Do not add a skip, fallback, broad path exemption, subset comparison, mutable owner inference, or success-on-unknown branch.'
];
const EXPECTED_SETTLED_HANDOFF = [
  'Require the feature004-dirty-collision-delta-v1 raw marker-inclusive no-trailing-newline SHA-256 to equal 334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b and preserve that prior block byte-for-byte as superseded-current-identity history.',
  'Parse exactly one feature004-dirty-collision-settled-delta-v1 block and reject a duplicate, missing marker, malformed JSON, or any unknown, missing, or reordered top-level or nested field.',
  'Require the exact top-level field order contractVersion, findingId, capturedAt, extendsContract, hunkTransition, ownerAttribution, currentPathIdentity, aggregateObservation, preservationContract, testOwnerHandoff.',
  'Require contractVersion feature004-dirty-collision-settled-delta/v1, findingId F004-POSTCHECKPOINT-DRIFT-001, a UTC ISO-8601 capturedAt, and the exact extendsContract marker, raw hash, history disposition, and byte-identity boolean.',
  'Require exactly one hunkTransition object naming only scripts/selftest.mjs hunkIndex 7, previous hash ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80, current hash 15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943, and disposition settled-owner-additive-delta.',
  'Apply the prior disposition and first delta in order, then overlay only scripts/selftest.mjs hunk 7; require inherited status, staging flags, index OID, hunk count, and ordered hashes 1 through 6 before accepting the transition.',
  'Recompute scripts/selftest.mjs status, staged and unstaged state, index OID, Git worktree OID, worktree SHA-256, hunk count, and all seven trimmed hunk-body hashes and require exact equality with currentPathIdentity.',
  'Require the Feature 006 start marker and Feature 007 exclusive end marker exactly once and in order; recompute byte range [117426,159494), byte length 42068, slice SHA-256 2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef, and the exact 65-entry symbol inventory under the declared regex rule.',
  'Require ownerAttribution to bind the exact Feature 006 Scope 3 executionHistory entry finished at 2026-07-15T22:48:39Z with outcome route_required, nine addressed findings, three unresolved findings, and evidenceRef report.md#scope-3-season-cycle-context-and-association-engine.',
  'Require the Feature 006 report anchor and tool-log lines 672, 690, 730, and 739 to resolve with exact session, agent, spec, scope, command or command class, exit code, stdout hash, and tags.',
  'Require aggregateObservation to remain exitCode 1 with 491 passed and 1 failed solely on Market Brief nextSession.sessionDate must match snapshot.nextSessionDate, classify the failure unrelated and unresolved for both features, and require all five pass, completion, and collision claim booleans false.',
  'Require every inherited baseline, independent rldata.js supersession, five-hash disposition, current index, non-target currentPaths, untracked, and volatile-path contract exactly as before; no inherited record may be rewritten or reinterpreted by this overlay.',
  'Reject any second path or hunk, duplicate transition, path mismatch, owner mismatch, evidence mismatch, marker or symbol drift, identity mismatch, hunk addition, hunk removal, hunk reorder, or byte change outside the named owner marker slice.',
  'Fail closed on every identity change after this capture; a later owner change requires another planning-owned additive checkpoint and cannot mutate this block or any prior block.',
  'Do not add a skip, fallback, broad path exemption, subset comparison, mutable owner inference, completion inference, or success-on-unknown branch.'
];
const EXPECTED_SETTLED_SYMBOLS = [
  'tdcAdjustPValues',
  'tdcApplyTransform',
  'tdcAssessDataQuality',
  'tdcAutocorrelation',
  'tdcBocpd',
  'tdcBuildAnalyticSeries',
  'tdcBuildChangeTimeline',
  'tdcBuildConsensus',
  'tdcClassifyDynamics',
  'tdcClassifyTrend',
  'tdcClusterFamilyVotes',
  'tdcConfig',
  'tdcCorrelation',
  'tdcCorrelationShift',
  'tdcCreateWorkPlan',
  'tdcCusum',
  'tdcDeepFreeze',
  'tdcDistributionShift',
  'tdcEndpointLocalQuadratic',
  'tdcError',
  'tdcEvaluateCycle',
  'tdcEventStudy',
  'tdcFiniteNumber',
  'tdcGaussianHmm2',
  'tdcGeneralizedLombScargle',
  'tdcHarmonicDecomposition',
  'tdcHasExactKeys',
  'tdcHouseholderSolve',
  'tdcIndexConfig',
  'tdcInfluenceDiagnostics',
  'tdcIsPlainObject',
  'tdcKahanSum',
  'tdcLeadLag',
  'tdcLinearFit',
  'tdcLjungBox',
  'tdcLocalLinearState',
  'tdcLogGamma',
  'tdcLogSumExp',
  'tdcMad',
  'tdcMeanVariance',
  'tdcMedian',
  'tdcMethodFailure',
  'tdcMethodSuccess',
  'tdcNames',
  'tdcNearbyStability',
  'tdcNormalCdf',
  'tdcPenalizedLinearSegments',
  'tdcProminentExtrema',
  'tdcQuantile',
  'tdcRegularizedBeta',
  'tdcResolveAsOfVintage',
  'tdcRollingOlsHac',
  'tdcRollingSpectrum',
  'tdcRunScope2Engine',
  'tdcRunScope3Engine',
  'tdcScaleShift',
  'tdcSource',
  'tdcStableDigest',
  'tdcStableSerialize',
  'tdcStudentTCdf',
  'tdcTheilSenKendall',
  'tdcValidateConfig',
  'tdcValidateNumericSeries',
  'tdcValidateSeriesEnvelope',
  'tdcWelchSpectrum'
];
const EXPECTED_V3_HANDOFF = [
  'Require the marker-inclusive no-trailing-newline v2 raw SHA-256 eef8aa415b739df80b1aab4046adbb64a39c87c6fb1b73ff0ac210b67870f32a and byte length 35844, validate v2 as a mandatory input, and preserve v2 plus every predecessor block byte-for-byte before parsing v3.',
  'Parse exactly one feature004-dirty-collision-selftest-successor-v3 block and reject duplicate markers, malformed JSON, or any unknown, missing, or reordered top-level or nested field.',
  'Require the exact top-level field order contractVersion, findingIds, capturedAt, extendsContract, settlementSource, identityContinuity, orderedDiffHunks, markerOwnership, provenanceCorrection, completionClaims, preservationContract, routing, implementationOwnerHandoff, testOwnerHandoff.',
  'Require the exact Feature 005 Scope 2 owner receipt section, interpreted claim source, nonterminal Scope 2 status, and existing semantic-fidelity implementation route; the receipt\'s 491/0 selftest observation is not planning test or completion evidence.',
  'Require current identity equality with v2 and current bytes: status, staging flags, HEAD/index OIDs, worktree Git OID, SHA-256, byte length, line-chunk count, six ordered hashes, and last commit.',
  'Recompute all six zero-context hunk headers, addition, deletion, and changed-line counts plus trimmed changed-body hashes in order.',
  'Require hunk 1\'s retained validateBriefPayload import to be classified only as header context from commit 943972e295b8fa93a19795e46015e5ae780b0350, and require the actual deleted buildCompanyFundamentalsOwnerRead import to resolve to Feature 010 Scope 6 commit a93076912aa1df17ca1e41ea929d37f1b8f40d51 with its exact subject while current deletion author remains unknown and no approval is inferred.',
  'Require hunk 2 to remain committed Feature 011 content with unknown current deletion author, hunks 3 through 5 to remain Feature 005 marker-bounded owner hunks, and hunk 6 to remain committed Feature 010 Scopes 2 through 7 content with unknown current deletion author.',
  'Require the Feature 005 slice [104099,108231) and SHA-256 84a6f11c4ba1ab0812187feeaf0bf8ac57f85beb23b1762ec9d55f82a9b77121 plus Feature 006 slice [108232,150300) and SHA-256 2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef exactly.',
  'Retain v2\'s complete 13-path matrix, tracked-clean validator identity, historical 137-line prefix contract, and just-in-time volatile-config rule without reinterpretation.',
  'Require every listed Feature 004, Feature 005, Feature 006, Feature 010, Feature 011 current-deletion, BUG-002, and BUG-003 pass, completion, acceptance, and certification claim to remain false as applicable.',
  'Reject adversarial mutations for every field, path, hunk, order, hash, marker, owner, producer commit, current deletion author, state, status, staging flag, completion flag, and extra or missing record.',
  'After TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01 closes, execute the direct Feature 004 collision canary under bubbles.test ownership; the expected red before v3 adoption is not a planning failure and a green canary is not Feature 004 completion.',
  'After a green direct canary, replay the unchanged BUG-002 focused and complete matrix under independent bubbles.test ownership without weakening rows, DoD, assertions, worker count, inventory, or lifecycle checks.',
  'Do not add a skip, fallback, broad path exemption, subset comparison, mutable inference, completion inference, or success-on-unknown branch.'
];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function parseReportBlock(report, marker) {
  const startMarker = `<!-- ${marker}:start -->`;
  const endMarker = `<!-- ${marker}:end -->`;
  assert.equal(report.split(startMarker).length - 1, 1, `report contains exactly one ${marker} start marker`);
  assert.equal(report.split(endMarker).length - 1, 1, `report contains exactly one ${marker} end marker`);
  const match = report.match(new RegExp(`${startMarker}\\n` + '```json\\n([\\s\\S]*?)\\n```\\n' + endMarker));
  assert.ok(match, `report contains exactly one well-formed ${marker} JSON block`);
  return { raw: match[0], value: JSON.parse(match[1]) };
}

function assertUniqueHashes(hashes, label) {
  assert.ok(Array.isArray(hashes), `${label} is an array`);
  hashes.forEach((hash) => assert.match(hash, /^[a-f0-9]{64}$/, `${label} contains only SHA-256 hashes`));
  assert.equal(new Set(hashes).size, hashes.length, `${label} contains no duplicate hashes`);
}

function assertExactKeys(value, keys, label) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label} is an object`);
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${label} has no unknown or missing fields`);
}

function assertExactOrderedKeys(value, keys, label) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label} is an object`);
  assert.deepEqual(Object.keys(value), keys, `${label} has the exact field order with no unknown or missing fields`);
}

function assertExactCanonicalContract(value, canonical, label) {
  assert.equal(JSON.stringify(value), JSON.stringify(canonical), `${label} matches the exact closed nested schema and field order`);
}

function valueAtPath(value, path) {
  return path.reduce((current, key) => current[key], value);
}

function replaceAtPath(value, path, replacement) {
  if (path.length === 0) return replacement;
  const parent = valueAtPath(value, path.slice(0, -1));
  parent[path.at(-1)] = replacement;
  return value;
}

function changedLeafValue(value) {
  if (typeof value === 'boolean') return !value;
  if (typeof value === 'number') return value + 1;
  if (typeof value === 'string') return `${value}__adversarial`;
  if (value === null) return false;
  throw new TypeError(`unsupported contract leaf type ${typeof value}`);
}

function assertEveryClosedSchemaMutationFails(canonical, validate, label) {
  function visit(node, path) {
    if (Array.isArray(node)) {
      const missing = structuredClone(canonical);
      if (node.length > 0) valueAtPath(missing, path).pop();
      else valueAtPath(missing, path).push('__adversarial');
      assert.throws(() => validate(missing), `${label} rejects changed array cardinality at ${path.join('.')}`);
      if (node.length > 0) {
        const extra = structuredClone(canonical);
        valueAtPath(extra, path).push(structuredClone(node[0]));
        assert.throws(() => validate(extra), `${label} rejects extra array record at ${path.join('.')}`);
        if (node.length > 1) {
          const reordered = structuredClone(canonical);
          valueAtPath(reordered, path).reverse();
          assert.throws(() => validate(reordered), `${label} rejects reordered array records at ${path.join('.')}`);
        }
      }
      node.forEach((entry, index) => visit(entry, [...path, index]));
      return;
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        const missing = structuredClone(canonical);
        delete valueAtPath(missing, path)[key];
        assert.throws(() => validate(missing), `${label} rejects missing field ${[...path, key].join('.')}`);
      }
      const unknown = structuredClone(canonical);
      valueAtPath(unknown, path).__unknown = true;
      assert.throws(() => validate(unknown), `${label} rejects unknown field at ${path.join('.') || '<root>'}`);
      if (Object.keys(node).length > 1) {
        const reordered = structuredClone(canonical);
        const reversed = Object.fromEntries(Object.entries(valueAtPath(reordered, path)).reverse());
        const candidate = replaceAtPath(reordered, path, reversed);
        assert.throws(() => validate(candidate), `${label} rejects reordered fields at ${path.join('.') || '<root>'}`);
      }
      for (const [key, child] of Object.entries(node)) visit(child, [...path, key]);
      return;
    }
    const changed = structuredClone(canonical);
    const candidate = replaceAtPath(changed, path, changedLeafValue(node));
    assert.throws(() => validate(candidate), `${label} rejects changed field ${path.join('.')}`);
  }
  visit(canonical, []);
}

function assertUtcTimestamp(value, label) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, `${label} is UTC ISO-8601`);
}

function assertNonemptyString(value, label) {
  assert.equal(typeof value, 'string', `${label} is a string`);
  assert.ok(value.length > 0, `${label} is nonempty`);
}

function toolLogRecord(lineNumber) {
  const lines = readFileSync(resolve(ROOT, TOOL_LOG_PATH), 'utf8').split(/\r?\n/);
  assert.ok(lineNumber > 0 && lineNumber <= lines.length, `tool-log line ${lineNumber} exists`);
  assert.ok(lines[lineNumber - 1], `tool-log line ${lineNumber} is nonempty`);
  return JSON.parse(lines[lineNumber - 1]);
}

function assertToolLogEvidence(expected, label) {
  const actual = toolLogRecord(expected.line);
  for (const [key, value] of Object.entries(expected)) {
    if (key === 'line') continue;
    const actualValue = key === 'command'
      ? actual.cmd
      : key === 'commandClass' && actual.tags?.includes(value)
        ? value
        : actual[key];
    assert.deepEqual(actualValue, value, `${label} resolves exact ${key}`);
  }
}

function parseToolLogReference(reference) {
  const [path, selector] = reference.split('::');
  assert.equal(path, '../../.specify/runtime/tool-calls.jsonl', 'tool-log reference uses the append-only repository log');
  const result = {};
  for (const item of selector.split(';')) {
    const [key, ...parts] = item.split('=');
    const value = parts.join('=');
    result[key] = key === 'line' || key === 'exitCode' ? Number(value) : key === 'tags' ? value.split(',') : value;
  }
  return result;
}

function assertToolLogReference(reference, label) {
  assertToolLogEvidence(parseToolLogReference(reference), label);
}

function markdownAnchorCount(markdown, anchor) {
  return markdown.split(/\r?\n/)
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, '').trim().toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s/g, '-'))
    .filter((candidate) => candidate === anchor).length;
}

function featureSixMarkerSlice(markerBounds, requireCurrentOffsets) {
  const bytes = readFileSync(resolve(ROOT, 'scripts/selftest.mjs'));
  const start = Buffer.from(markerBounds.startInclusive);
  const end = Buffer.from(markerBounds.endExclusive);
  const startByte = bytes.indexOf(start);
  const endByteExclusive = bytes.indexOf(end);
  assert.notEqual(startByte, -1, 'Feature 006 start marker exists');
  assert.notEqual(endByteExclusive, -1, 'Feature 007 end marker exists');
  assert.equal(bytes.indexOf(start, startByte + 1), -1, 'Feature 006 start marker is unique');
  assert.equal(bytes.indexOf(end, endByteExclusive + 1), -1, 'Feature 007 end marker is unique');
  assert.ok(startByte < endByteExclusive, 'Feature 006 marker bounds are ordered');
  if (requireCurrentOffsets) {
    assert.equal(startByte, markerBounds.startByte, 'Feature 006 current start byte is exact');
    assert.equal(endByteExclusive, markerBounds.endByteExclusive, 'Feature 006 current exclusive end byte is exact');
    assert.equal(endByteExclusive - startByte, markerBounds.byteLength, 'Feature 006 current byte length is exact');
  }
  const slice = bytes.subarray(startByte, endByteExclusive);
  if ('byteLength' in markerBounds) assert.equal(slice.length, markerBounds.byteLength, 'Feature 006 marker slice byte length is exact');
  assert.equal(sha256(slice), markerBounds.currentSliceSha256, 'Feature 006 marker slice hash is exact');
  return {
    before: bytes.subarray(0, startByte).toString('utf8'),
    slice: slice.toString('utf8'),
    after: bytes.subarray(endByteExclusive).toString('utf8')
  };
}

function featureTenMarkerSlice(markerBounds) {
  const bytes = readFileSync(resolve(ROOT, 'scripts/selftest.mjs'));
  const start = Buffer.from(markerBounds.startInclusive);
  const end = Buffer.from(markerBounds.endInclusive);
  const startByte = bytes.indexOf(start);
  const endMarkerStartByte = bytes.indexOf(end);
  assert.notEqual(startByte, -1, 'Feature 010 start marker exists');
  assert.notEqual(endMarkerStartByte, -1, 'Feature 010 end marker exists');
  assert.equal(bytes.indexOf(start, startByte + 1), -1, 'Feature 010 start marker is unique');
  assert.equal(bytes.indexOf(end, endMarkerStartByte + 1), -1, 'Feature 010 end marker is unique');
  assert.ok(startByte < endMarkerStartByte, 'Feature 010 marker bounds are ordered');
  const endByteExclusive = endMarkerStartByte + end.length;
  const slice = bytes.subarray(startByte, endByteExclusive);
  assert.deepEqual({
    startCount: 1,
    endCount: 1,
    ordered: true,
    startByte,
    endMarkerStartByte,
    endByteExclusive,
    byteLength: slice.length,
    sliceSha256: sha256(slice)
  }, {
    startCount: markerBounds.startCount,
    endCount: markerBounds.endCount,
    ordered: markerBounds.ordered,
    startByte: markerBounds.startByte,
    endMarkerStartByte: markerBounds.endMarkerStartByte,
    endByteExclusive: markerBounds.endByteExclusive,
    byteLength: markerBounds.byteLength,
    sliceSha256: markerBounds.sliceSha256
  }, 'Feature 010 current marker counts, order, bounds, length, and hash are exact');
}

function markerSlice(markerBounds, endIsInclusive, label) {
  const bytes = readFileSync(resolve(ROOT, 'scripts/selftest.mjs'));
  const start = Buffer.from(markerBounds.startInclusive);
  const end = Buffer.from(endIsInclusive ? markerBounds.endInclusive : markerBounds.endExclusive);
  const startByte = bytes.indexOf(start);
  const endMarkerStartByte = bytes.indexOf(end);
  assert.notEqual(startByte, -1, `${label} start marker exists`);
  assert.notEqual(endMarkerStartByte, -1, `${label} end marker exists`);
  assert.equal(bytes.indexOf(start, startByte + 1), -1, `${label} start marker is unique`);
  assert.equal(bytes.indexOf(end, endMarkerStartByte + 1), -1, `${label} end marker is unique`);
  assert.ok(startByte < endMarkerStartByte, `${label} markers are ordered`);
  const endByteExclusive = endIsInclusive ? endMarkerStartByte + end.length : endMarkerStartByte;
  const slice = bytes.subarray(startByte, endByteExclusive);
  assert.equal(startByte, markerBounds.startByte, `${label} start byte is exact`);
  if ('endMarkerStartByte' in markerBounds) assert.equal(endMarkerStartByte, markerBounds.endMarkerStartByte, `${label} end marker start byte is exact`);
  assert.equal(endByteExclusive, markerBounds.endByteExclusive, `${label} end byte is exact`);
  assert.equal(slice.length, markerBounds.byteLength, `${label} byte length is exact`);
  assert.equal(sha256(slice), markerBounds.sliceSha256, `${label} slice SHA-256 is exact`);
  return slice.toString('utf8');
}

function checkpointIdentityWithoutCommit(record) {
  const { headOid, lastCommit, ...identity } = record;
  assertNonemptyString(headOid, `${record.path}.headOid`);
  assertNonemptyString(lastCommit, `${record.path}.lastCommit`);
  return identity;
}

function validateScriptTransitions(settledPaths, baseline, transitions) {
  assertExactOrderedKeys(transitions, [
    'contractVersion',
    'findingIds',
    'capturedAt',
    'extendsContract',
    'inheritedRawBlocks',
    'commitCatalog',
    'pathTransitions',
    'currentCheckpointPaths',
    'volatileConfigPolicy',
    'preservationContract',
    'testOwnerHandoff'
  ], 'script transitions');
  assert.equal(transitions.contractVersion, 'feature004-dirty-collision-script-transitions/v1');
  assert.deepEqual(transitions.findingIds, [
    'F004-CURRENT-SCRIPT-IDENTITY-002',
    'BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY',
    'BUG003-FOREIGN-F004-UNTRACKED-BOUNDARY'
  ], 'script transitions finding set is exact and ordered');
  assertUtcTimestamp(transitions.capturedAt, 'script transitions capturedAt');
  assertExactOrderedKeys(transitions.extendsContract, [
    'marker',
    'rawBlockSha256',
    'priorBlockMustRemainByteIdentical'
  ], 'script transitions extendsContract');
  assert.deepEqual(transitions.extendsContract, {
    marker: 'feature004-dirty-collision-settled-delta-v1',
    rawBlockSha256: SETTLED_BLOCK_SHA256,
    priorBlockMustRemainByteIdentical: true
  }, 'script transitions extend the exact settled predecessor');
  const expectedInherited = [
    ['feature004-dirty-baseline-v1', BASELINE_BLOCK_SHA256],
    ['feature004-dirty-supersession-v1', SUPERSESSION_BLOCK_SHA256],
    ['feature004-dirty-collision-disposition-v1', DISPOSITION_BLOCK_SHA256],
    ['feature004-dirty-collision-delta-v1', DELTA_BLOCK_SHA256],
    ['feature004-dirty-collision-settled-delta-v1', SETTLED_BLOCK_SHA256]
  ].map(([marker, rawBlockSha256]) => ({ marker, rawBlockSha256 }));
  transitions.inheritedRawBlocks.forEach((record, index) => {
    assertExactOrderedKeys(record, ['marker', 'rawBlockSha256'], `script transitions inheritedRawBlocks[${index}]`);
  });
  assert.deepEqual(transitions.inheritedRawBlocks, expectedInherited, 'script transitions preserve all five inherited blocks in order');

  const expectedCommitCatalog = [
    ['943972e295b8fa93a19795e46015e5ae780b0350', 'Philippe Kirsanov', '2026-07-16T12:01:36-07:00', 'feat: expand research lab capabilities and automation'],
    ['609021dbe7475860df1b3c67ad6abef9d36dc3a0', 'Philippe Kirsanov', '2026-07-16T11:18:43-07:00', 'compact market brief lane inputs'],
    ['3b9be41aaf607aa933904b97ff92d9cd0861c821', 'Philippe Kirsanov', '2026-07-16T11:33:40-07:00', 'persist automatic ticker cache refreshes'],
    ['b11d9f0e41aeb74dc2825a99b7a2d086003dbab6', 'Philippe Kirsanov', '2026-07-16T09:35:08-07:00', 'fix market brief scheduled publication'],
    ['751b85d72dea16e790cd4e1281f3ed155bd06e60', 'Philippe Kirsanov', '2026-07-15T12:32:33-07:00', 'market-brief: Tier-A data-only refresh 2026-07-15 15:32 EDT (pre-close)']
  ].map(([commit, author, authoredAt, subject]) => ({ commit, author, authoredAt, subject }));
  transitions.commitCatalog.forEach((record, index) => {
    assertExactOrderedKeys(record, ['commit', 'author', 'authoredAt', 'subject'], `script transitions commitCatalog[${index}]`);
  });
  assert.deepEqual(transitions.commitCatalog, expectedCommitCatalog, 'script transitions commit catalog is closed and exact');
  transitions.commitCatalog.forEach((record, index) => {
    const actual = git(['show', '--no-patch', '--format=%H%x00%an%x00%aI%x00%s', record.commit]).trim().split('\0');
    assert.deepEqual(actual, [record.commit, record.author, record.authoredAt, record.subject], `script transitions commitCatalog[${index}] resolves exact Git metadata`);
  });

  assert.equal(transitions.pathTransitions.length, 2, 'script transitions contain exactly two path transitions');
  assert.deepEqual(transitions.pathTransitions.map((record) => record.path), [
    'scripts/selftest.mjs',
    'scripts/validate-brief-payload.mjs'
  ], 'script transitions preserve the exact two-path order');
  const [selftestTransition, validatorTransition] = transitions.pathTransitions;
  assertExactOrderedKeys(selftestTransition, [
    'path',
    'transition',
    'priorIdentityRef',
    'indexPromotion',
    'currentIdentity',
    'settledOwner'
  ], 'script transitions selftest path');
  assert.equal(selftestTransition.transition, 'prior-worktree-promoted-to-index-plus-owner-bounded-working-hunk');
  assertExactOrderedKeys(selftestTransition.priorIdentityRef, [
    'marker',
    'field',
    'status',
    'indexOid',
    'worktreeGitOid',
    'worktreeSha256',
    'hunkCount'
  ], 'script transitions selftest priorIdentityRef');
  const settledSelftest = settledPaths.filter((record) => record.path === 'scripts/selftest.mjs');
  assert.equal(settledSelftest.length, 1, 'script transitions resolve exactly one settled selftest predecessor');
  assert.deepEqual(selftestTransition.priorIdentityRef, {
    marker: 'feature004-dirty-collision-settled-delta-v1',
    field: 'currentPathIdentity',
    status: settledSelftest[0].status,
    indexOid: settledSelftest[0].indexOid,
    worktreeGitOid: settledSelftest[0].worktreeGitOid,
    worktreeSha256: settledSelftest[0].worktreeSha256,
    hunkCount: settledSelftest[0].hunkCount
  }, 'script transitions selftest predecessor is exact');
  assertExactOrderedKeys(selftestTransition.indexPromotion, [
    'commit',
    'authorName',
    'authorEmail',
    'committedAt',
    'subject',
    'blobOid',
    'matchesPriorWorktreeGitOid'
  ], 'script transitions selftest indexPromotion');
  assert.deepEqual(selftestTransition.indexPromotion, {
    commit: '943972e295b8fa93a19795e46015e5ae780b0350',
    authorName: 'Philippe Kirsanov',
    authorEmail: 'pkirsanov@gmail.com',
    committedAt: '2026-07-16T12:01:36-07:00',
    subject: 'feat: expand research lab capabilities and automation',
    blobOid: '484706d2f819971c298fd3dcef19e34915c4f052',
    matchesPriorWorktreeGitOid: true
  }, 'script transitions selftest promotion is exact');
  assert.equal(git(['rev-parse', `${selftestTransition.indexPromotion.commit}:scripts/selftest.mjs`]).trim(), selftestTransition.indexPromotion.blobOid,
    'script transitions selftest promotion resolves the exact committed blob');

  assertExactOrderedKeys(validatorTransition, [
    'path',
    'transition',
    'priorIdentityRef',
    'indexPromotion',
    'currentIdentity',
    'settledOwner'
  ], 'script transitions validator path');
  assert.equal(validatorTransition.transition, 'historical-untracked-blob-promoted-unchanged-to-clean-index');
  assertExactOrderedKeys(validatorTransition.priorIdentityRef, [
    'marker',
    'field',
    'status',
    'worktreeGitOid',
    'worktreeSha256',
    'lineChunkCount',
    'orderedLineHashSha256'
  ], 'script transitions validator priorIdentityRef');
  assert.deepEqual(validatorTransition.priorIdentityRef, {
    marker: 'feature004-dirty-baseline-v1',
    field: 'untracked',
    status: baseline.untracked.status,
    worktreeGitOid: baseline.untracked.worktreeGitOid,
    worktreeSha256: baseline.untracked.worktreeSha256,
    lineChunkCount: baseline.untracked.lineChunkCount,
    orderedLineHashSha256: baseline.untracked.orderedLineHashSha256
  }, 'script transitions validator predecessor is exact');
  assertExactOrderedKeys(validatorTransition.indexPromotion, [
    'commit',
    'authorName',
    'authorEmail',
    'committedAt',
    'subject',
    'change',
    'blobOid',
    'matchesPriorUntrackedGitOid'
  ], 'script transitions validator indexPromotion');
  assert.deepEqual(validatorTransition.indexPromotion, {
    commit: 'b11d9f0e41aeb74dc2825a99b7a2d086003dbab6',
    authorName: 'Philippe Kirsanov',
    authorEmail: 'pkirsanov@gmail.com',
    committedAt: '2026-07-16T09:35:08-07:00',
    subject: 'fix market brief scheduled publication',
    change: 'added',
    blobOid: '7bd6639ce774a6b2a04f5cebf5254684a9f3ba28',
    matchesPriorUntrackedGitOid: true
  }, 'script transitions validator promotion is exact');
  assert.equal(git(['rev-parse', `${validatorTransition.indexPromotion.commit}:scripts/validate-brief-payload.mjs`]).trim(), validatorTransition.indexPromotion.blobOid,
    'script transitions validator promotion resolves the exact committed blob');

  assert.equal(transitions.currentCheckpointPaths.length, 13, 'script transitions contain the complete 13-path matrix');
  assert.deepEqual(transitions.currentCheckpointPaths.map((record) => record.path), EXPECTED_CHECKPOINT_PATHS,
    'script transitions current path matrix has exact membership and order');
  transitions.currentCheckpointPaths.forEach((record, index) => {
    assertExactOrderedKeys(record, [
      'path',
      'status',
      'staged',
      'unstaged',
      'headOid',
      'indexOid',
      'worktreeGitOid',
      'worktreeSha256',
      'hunkCount',
      'hunkBodySha256',
      'lastCommit'
    ], `script transitions currentCheckpointPaths[${index}]`);
    assertUniqueHashes(record.hunkBodySha256, `script transitions currentCheckpointPaths[${index}].hunkBodySha256`);
    assert.equal(record.hunkCount, record.hunkBodySha256.length, `script transitions currentCheckpointPaths[${index}] hunk count is complete`);
    assert.ok(transitions.commitCatalog.some((commit) => commit.commit === record.lastCommit), `script transitions currentCheckpointPaths[${index}] last commit is catalogued`);
    if (record.path === 'scripts/selftest.mjs') {
      assert.deepEqual(checkpointIdentityWithoutCommit(record), { path: record.path, ...selftestTransition.currentIdentity },
        'script transitions selftest path and transition identity are identical');
    } else if (record.path === 'scripts/validate-brief-payload.mjs') {
      const { lineChunkCount, orderedLineHashSha256, ...validatorCurrentIdentity } = validatorTransition.currentIdentity;
      assert.deepEqual(checkpointIdentityWithoutCommit(record), { path: record.path, ...validatorCurrentIdentity },
        'script transitions validator path and transition identity are identical');
      assert.equal(lineChunkCount, baseline.untracked.lineChunkCount, 'script transitions validator retains the exact historical line count');
      assert.equal(orderedLineHashSha256, baseline.untracked.orderedLineHashSha256,
        'script transitions validator retains the exact historical ordered-line hash');
    } else {
      assert.equal(record.status, '', `script transitions ${record.path} is clean`);
      assert.equal(record.staged, false, `script transitions ${record.path} is unstaged`);
      assert.equal(record.unstaged, false, `script transitions ${record.path} has no worktree change`);
      assert.equal(record.headOid, record.indexOid, `script transitions ${record.path} HEAD and index are identical`);
      assert.equal(record.indexOid, record.worktreeGitOid, `script transitions ${record.path} index and worktree are identical`);
      assert.equal(record.hunkCount, 0, `script transitions ${record.path} has zero hunks`);
    }
  });
  assert.deepEqual(transitions.volatileConfigPolicy, {
    path: 'market-brief.config.json',
    currentIdentityRecorded: true,
    authoritativeForFutureScope4Edit: false,
    inheritedJustInTimeCheckpointRuleRemainsRequired: true
  }, 'script transitions preserve the volatile config rule');
  assertExactOrderedKeys(transitions.preservationContract, [
    'allInheritedRawBlocksRemainByteIdentical',
    'onlyTwoNamedPathTransitionsAreAccepted',
    'completeCurrentIdentityEqualityRequired',
    'completeThirteenPathMatrixRequired',
    'allCleanPathsMustMatchHeadIndexAndWorktree',
    'onlySelftestMayHaveOneCurrentWorktreeHunk',
    'everyPathLastCommitMustResolveThroughCommitCatalog',
    'selftestCurrentHunkMustRemainInsideUniqueOwnerMarkers',
    'validatorMustRemainByteIdenticalToItsHistoricalUntrackedBlob',
    'volatileConfigRuleRemainsNonAuthoritativeForFutureEdit',
    'unknownPathIdentityOwnerOrFieldFailsClosed',
    'testWeakeningBroadExemptionAndUnknownIdentityAcceptanceForbidden',
    'plannerCanaryPassClaim',
    'plannerTestPhaseCompletionClaim',
    'plannerScopeCompletionClaim',
    'plannerCertificationClaim'
  ], 'script transitions preservationContract');
  assert.ok(Object.entries(transitions.preservationContract).every(([key, value]) =>
    key.endsWith('Claim') ? value === false : value === true), 'script transitions preservation and false-claim booleans are exact');
  return transitions.currentCheckpointPaths;
}

function validateSupersededValidatorNote(note) {
  assertExactOrderedKeys(note, [
    'contractVersion',
    'active',
    'findingId',
    'capturedAt',
    'extendsContract',
    'acceptedTransition',
    'unacceptedTransition',
    'preservationContract',
    'planningValidation',
    'routing',
    'testOwnerHandoff'
  ], 'superseded validator note');
  assert.equal(note.contractVersion, 'feature004-superseded-validator-note/v1');
  assert.equal(note.active, false, 'superseded validator note is non-authoritative');
  assert.equal(note.findingId, 'F004-VALIDATOR-TRACKED-TRANSITION-001');
  assertUtcTimestamp(note.capturedAt, 'superseded validator note capturedAt');
  assert.equal(note.extendsContract.marker, 'feature004-dirty-collision-script-transitions-v1');
  assert.equal(note.extendsContract.historyDisposition, 'superseded-planning-disposition-history');
  assert.equal(note.extendsContract.priorBlockMustRemainByteIdentical, true);
  assert.equal(note.acceptedTransition.path, 'scripts/validate-brief-payload.mjs');
  assert.equal(note.unacceptedTransition.path, 'scripts/selftest.mjs');
  assert.equal(note.unacceptedTransition.identityAccepted, false);
  assert.equal(note.unacceptedTransition.canaryRequiredState, 'red');
  assert.ok(Object.entries(note.preservationContract).every(([key, value]) =>
    key.endsWith('Claim') ? value === false : value === true), 'superseded validator note preserves every historical assertion and false claim');
  assert.deepEqual(note.planningValidation, {
    command: 'node --test tests/feature-004-dirty-tree-collision.test.mjs',
    exitCode: 1,
    tests: 3,
    passed: 1,
    failed: 2,
    skipped: 0,
    failedAssertions: [
      'scripts/selftest.mjs complete current identity matches the reviewed disposition',
      'scripts/validate-brief-payload.mjs remains untracked and unstaged'
    ],
    classification: 'expected-pre-parser-red',
    claimSource: 'executed',
    testPhaseClaim: false
  }, 'superseded validator note keeps the exact historical red');
  assert.equal(note.routing.outcome, 'route_required');
  assert.equal(note.routing.nextRequiredOwner, 'bubbles.implement');
}

function validateOwnerSettledSuccessor(activePaths, transitions, note, successor, requireHistoricalMarkerOffsets = true) {
  assertExactOrderedKeys(successor, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContract',
    'activeContract',
    'inheritedRawBlocks',
    'selftestTransition',
    'retainedValidatorTransition',
    'ownerAttribution',
    'currentCheckpointPaths',
    'aggregateObservation',
    'completionClaims',
    'volatileConfigPolicy',
    'preservationContract',
    'routing',
    'testOwnerHandoff'
  ], 'owner-settled successor');
  assert.equal(successor.contractVersion, 'feature004-dirty-collision-owner-settled-selftest/v1');
  assert.equal(successor.findingId, 'F004-CURRENT-SCRIPT-IDENTITY-003');
  assertUtcTimestamp(successor.capturedAt, 'owner-settled successor capturedAt');
  assert.deepEqual(successor.extendsContract, {
    marker: 'feature004-superseded-validator-note-v1',
    rawBlockSha256: SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256,
    historyDisposition: 'immediate-superseded-validator-history',
    priorBlockMustRemainByteIdentical: true
  }, 'owner-settled successor hash-links the exact immediate predecessor');
  assert.deepEqual(successor.activeContract, {
    marker: 'feature004-dirty-collision-script-transitions-v1',
    rawBlockSha256: SCRIPT_TRANSITIONS_BLOCK_SHA256,
    historyDisposition: 'active-before-owner-settled-selftest-overlay',
    priorBlockMustRemainByteIdentical: true
  }, 'owner-settled successor names the exact active predecessor');
  assert.equal(note.active, false, 'owner-settled successor does not activate the superseded validator note');
  const expectedInherited = [
    ['feature004-dirty-baseline-v1', BASELINE_BLOCK_SHA256],
    ['feature004-dirty-supersession-v1', SUPERSESSION_BLOCK_SHA256],
    ['feature004-dirty-collision-disposition-v1', DISPOSITION_BLOCK_SHA256],
    ['feature004-dirty-collision-delta-v1', DELTA_BLOCK_SHA256],
    ['feature004-dirty-collision-settled-delta-v1', SETTLED_BLOCK_SHA256],
    ['feature004-dirty-collision-script-transitions-v1', SCRIPT_TRANSITIONS_BLOCK_SHA256],
    ['feature004-superseded-validator-note-v1', SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256]
  ].map(([marker, rawBlockSha256]) => ({ marker, rawBlockSha256 }));
  successor.inheritedRawBlocks.forEach((record, index) => {
    assertExactOrderedKeys(record, ['marker', 'rawBlockSha256'], `owner-settled successor inheritedRawBlocks[${index}]`);
  });
  assert.deepEqual(successor.inheritedRawBlocks, expectedInherited, 'owner-settled successor preserves all seven predecessor hashes in order');

  const selftest = successor.selftestTransition;
  assertExactOrderedKeys(selftest, [
    'path',
    'previousIdentityRef',
    'previousIdentity',
    'currentIdentity',
    'markerBounds',
    'disposition'
  ], 'owner-settled successor selftestTransition');
  assert.equal(selftest.path, 'scripts/selftest.mjs');
  assert.deepEqual(selftest.previousIdentityRef, {
    marker: 'feature004-dirty-collision-script-transitions-v1',
    field: 'currentCheckpointPaths[path=scripts/selftest.mjs]'
  }, 'owner-settled successor selftest predecessor reference is exact');
  const activeSelftest = activePaths.filter((record) => record.path === selftest.path);
  assert.equal(activeSelftest.length, 1, 'owner-settled successor resolves exactly one active selftest record');
  const { path: activeSelftestPath, ...activeSelftestIdentity } = activeSelftest[0];
  assert.equal(activeSelftestPath, selftest.path);
  assert.deepEqual(selftest.previousIdentity, activeSelftestIdentity, 'owner-settled successor embeds the complete active predecessor identity');
  assert.deepEqual(selftest.currentIdentity, {
    ...selftest.previousIdentity,
    worktreeGitOid: 'f1f5d4c604efd6a46b4183408fd397202e650b6f',
    worktreeSha256: '25ae7940719ca58dadae2a82b3ac323258d55f0a91b09589eb603a9b0c329a1b',
    hunkBodySha256: ['9af6f8a57dcd3041b2b67711cebdb2b373f72a134d8b480f773b69e38fec3bd0']
  }, 'owner-settled successor changes only the exact selftest worktree and one-hunk identity');
  assert.equal(selftest.disposition, 'owner-settled-marker-bounded-selftest-overlay');
  assertExactOrderedKeys(selftest.markerBounds, [
    'startInclusive',
    'endInclusive',
    'startCount',
    'endCount',
    'ordered',
    'startByte',
    'endMarkerStartByte',
    'endByteExclusive',
    'byteLength',
    'sliceSha256'
  ], 'owner-settled successor selftest markerBounds');
  assert.deepEqual(selftest.markerBounds, {
    startInclusive: '/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-BEGIN */',
    endInclusive: '/* FEATURE-010-COMPANY-FUNDAMENTALS-FOUNDATION-END */',
    startCount: 1,
    endCount: 1,
    ordered: true,
    startByte: 183893,
    endMarkerStartByte: 191689,
    endByteExclusive: 191742,
    byteLength: 7849,
    sliceSha256: '29598851a8c881ac3d9d311a4dbad152cdd5391fe473b689ec4812f4a66614c3'
  }, 'owner-settled successor retains the exact historical Feature 010 marker record');
  if (requireHistoricalMarkerOffsets) featureTenMarkerSlice(selftest.markerBounds);

  const validator = successor.retainedValidatorTransition;
  assertExactOrderedKeys(validator, [
    'path',
    'sourceRecordRef',
    'historicalStatus',
    'currentIdentity',
    'historicalPrefixContract',
    'introducingCommit',
    'unchangedByThisSuccessor'
  ], 'owner-settled successor retainedValidatorTransition');
  assert.equal(validator.path, 'scripts/validate-brief-payload.mjs');
  assert.deepEqual(validator.sourceRecordRef, {
    marker: 'feature004-dirty-collision-script-transitions-v1',
    field: 'pathTransitions[path=scripts/validate-brief-payload.mjs]'
  }, 'owner-settled successor validator source record is exact');
  const activeValidator = activePaths.filter((record) => record.path === validator.path);
  assert.equal(activeValidator.length, 1, 'owner-settled successor resolves exactly one active validator record');
  assert.equal(validator.historicalStatus, '??');
  const { path: activeValidatorPath, ...activeValidatorIdentity } = activeValidator[0];
  assert.equal(activeValidatorPath, validator.path);
  assert.deepEqual(validator.currentIdentity, activeValidatorIdentity, 'owner-settled successor retains the complete active validator identity');
  assert.deepEqual(validator.historicalPrefixContract, {
    lineChunkCount: 137,
    orderedLineHashSha256: '63117b5ef985a9d39726b9432f5c93e57621e6e2749838d30ca10969c2308c6e'
  }, 'owner-settled successor retains the validator prefix contract');
  assert.deepEqual(validator.introducingCommit, {
    commit: 'b11d9f0e41aeb74dc2825a99b7a2d086003dbab6',
    change: 'added',
    blobOid: '7bd6639ce774a6b2a04f5cebf5254684a9f3ba28',
    subject: 'fix market brief scheduled publication'
  }, 'owner-settled successor retains the exact validator introducing commit');
  assert.equal(validator.unchangedByThisSuccessor, true);

  const owner = successor.ownerAttribution;
  assertExactOrderedKeys(owner, [
    'owner',
    'packet',
    'scope',
    'phase',
    'executionHistorySelector',
    'scopeFindingDisposition',
    'testOwnershipRoute',
    'artifactRefs',
    'nonCompletionState'
  ], 'owner-settled successor ownerAttribution');
  assert.deepEqual({ owner: owner.owner, packet: owner.packet, scope: owner.scope, phase: owner.phase }, {
    owner: 'bubbles.implement',
    packet: 'specs/010-company-fundamentals-and-brief-lab',
    scope: 'Scope 01',
    phase: 'implement'
  }, 'owner-settled successor owner identity is exact');
  assertExactOrderedKeys(owner.executionHistorySelector, [
    'agent',
    'executionModel',
    'parentAgent',
    'startedAt',
    'finishedAt',
    'outcome',
    'evidenceRef'
  ], 'owner-settled successor executionHistorySelector');
  assert.deepEqual(owner.scopeFindingDisposition, {
    addressedFindingIds: ['SR010-001', 'SR010-002', 'SR010-003', 'SR010-004', 'SR010-005'],
    pendingTestFindingIds: ['F010-INDEPENDENT-VERIFICATION-001']
  }, 'owner-settled successor preserves the exact implementation/test finding split');
  assert.deepEqual(owner.testOwnershipRoute, {
    transitionRequestId: 'TR-F010-SCOPE01-TEST-OWNERSHIP-01',
    status: 'pending',
    routedTo: 'bubbles.test',
    findingIds: ['F010-INDEPENDENT-VERIFICATION-001'],
    evidenceRef: 'scopes/01-contract-config-validator-publication-foundation/report.md#final-current-session-supersession---2026-07-17t003401z'
  }, 'owner-settled successor preserves the historical pending test route exactly');
  assert.deepEqual(owner.nonCompletionState, {
    featureStatus: 'not_started',
    scopeStatus: 'not_started',
    certificationStatus: 'not_started',
    completedPhaseClaims: ['spec-review'],
    completedScopes: []
  }, 'owner-settled successor contains no Feature 010 completion inference');

  const featureTenState = JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8'));
  const executionMatches = featureTenState.executionHistory.filter((entry) =>
    Object.entries(owner.executionHistorySelector).every(([key, value]) => entry[key] === value));
  assert.equal(executionMatches.length, 1, 'owner-settled successor resolves exactly one Feature 010 owner-return execution');
  assert.deepEqual(executionMatches[0].addressedFindings, [
    'SR010-001',
    'SR010-002',
    'SR010-003',
    'SR010-004',
    'SR010-005',
    'BUG002-CONCURRENT-F010-FOUNDATION-FAILURE',
    'F004-CURRENT-SCRIPT-IDENTITY-002',
    'BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY',
    'TR-F004-CURRENT-SELFTEST-IDENTITY-002'
  ], 'Feature 010 owner-return addressed finding set is exact');
  assert.deepEqual(executionMatches[0].unresolvedFindings, [
    'F010-TEST-OWNER-ADOPTION-001',
    'F010-INDEPENDENT-VERIFICATION-001',
    'F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-001',
    'BUG003-INDEPENDENT-VERIFICATION',
    'BUG002-INDEPENDENT-VERIFICATION'
  ], 'Feature 010 owner-return unresolved finding set is exact');
  assert.deepEqual({
    status: executionMatches[0].exactEvidence.selftestStatus,
    staged: executionMatches[0].exactEvidence.selftestStaged,
    unstaged: executionMatches[0].exactEvidence.selftestUnstaged,
    indexOid: executionMatches[0].exactEvidence.selftestIndexOid,
    worktreeGitOid: executionMatches[0].exactEvidence.selftestWorktreeGitOid,
    worktreeSha256: executionMatches[0].exactEvidence.selftestWorktreeSha256,
    hunkCount: executionMatches[0].exactEvidence.selftestHunkCount,
    hunkBodySha256: executionMatches[0].exactEvidence.selftestHunkBodySha256,
    markerStartByte: executionMatches[0].exactEvidence.selftestMarkerStartByte,
    markerEndByteExclusive: executionMatches[0].exactEvidence.selftestMarkerEndByteExclusive,
    markerSliceSha256: executionMatches[0].exactEvidence.selftestMarkerSliceSha256
  }, {
    status: selftest.currentIdentity.status,
    staged: selftest.currentIdentity.staged,
    unstaged: selftest.currentIdentity.unstaged,
    indexOid: selftest.currentIdentity.indexOid,
    worktreeGitOid: selftest.currentIdentity.worktreeGitOid,
    worktreeSha256: selftest.currentIdentity.worktreeSha256,
    hunkCount: selftest.currentIdentity.hunkCount,
    hunkBodySha256: selftest.currentIdentity.hunkBodySha256,
    markerStartByte: selftest.markerBounds.startByte,
    markerEndByteExclusive: selftest.markerBounds.endByteExclusive,
    markerSliceSha256: selftest.markerBounds.sliceSha256
  }, 'Feature 010 owner-return exact evidence matches the successor identity');
  assert.deepEqual({
    scopeComplete: executionMatches[0].exactEvidence.scopeComplete,
    featureComplete: executionMatches[0].exactEvidence.featureComplete,
    bug003Complete: executionMatches[0].exactEvidence.bug003Complete,
    bug002Complete: executionMatches[0].exactEvidence.bug002Complete
  }, {
    scopeComplete: false,
    featureComplete: false,
    bug003Complete: false,
    bug002Complete: false
  }, 'Feature 010 owner-return exact evidence keeps all completion claims false');
  const testRouteMatches = featureTenState.transitionRequests.filter((request) => request.id === owner.testOwnershipRoute.transitionRequestId);
  assert.equal(testRouteMatches.length, 1, 'Feature 010 test ownership route resolves exactly once');
  assert.equal(testRouteMatches[0].status, 'resolved', 'Feature 010 independent replay is now resolved');
  assert.equal(testRouteMatches[0].routedTo, owner.testOwnershipRoute.routedTo);
  assert.deepEqual(testRouteMatches[0].findingIds, owner.testOwnershipRoute.findingIds);
  assert.equal(testRouteMatches[0].resolvedAt, '2026-07-17T02:07:35Z');
  assert.equal(testRouteMatches[0].resolvedBy, 'bubbles.test');
  assert.equal(testRouteMatches[0].outcome, 'route_required');
  assert.equal(featureTenState.status, owner.nonCompletionState.featureStatus);
  assert.equal(featureTenState.execution.scopeProgress[0].status, owner.nonCompletionState.scopeStatus);
  assert.equal(featureTenState.certification.status, owner.nonCompletionState.certificationStatus);
  assert.deepEqual(featureTenState.execution.completedPhaseClaims, owner.nonCompletionState.completedPhaseClaims);
  assert.deepEqual(featureTenState.certification.completedScopes, owner.nonCompletionState.completedScopes);

  const featureTenReport = readFileSync(resolve(ROOT, FEATURE_TEN_REPORT_PATH), 'utf8');
  assert.equal(markdownAnchorCount(featureTenReport, owner.executionHistorySelector.evidenceRef.split('#')[1]), 1,
    'Feature 010 owner-return evidence anchor resolves exactly once');
  for (const reference of owner.artifactRefs.filter((reference) => reference.includes('report.md#'))) {
    assert.equal(markdownAnchorCount(featureTenReport, reference.split('#')[1]), 1, `Feature 010 artifact ref ${reference} resolves exactly once`);
  }

  assert.equal(successor.currentCheckpointPaths.length, 13, 'owner-settled successor contains the complete 13-path matrix');
  assert.deepEqual(successor.currentCheckpointPaths.map((record) => record.path), EXPECTED_CHECKPOINT_PATHS,
    'owner-settled successor preserves exact path membership and order');
  successor.currentCheckpointPaths.forEach((record, index) => {
    assertExactOrderedKeys(record, [
      'path',
      'status',
      'staged',
      'unstaged',
      'headOid',
      'indexOid',
      'worktreeGitOid',
      'worktreeSha256',
      'hunkCount',
      'hunkBodySha256',
      'lastCommit'
    ], `owner-settled successor currentCheckpointPaths[${index}]`);
    if (record.path === selftest.path) {
      assert.deepEqual(record, { path: selftest.path, ...selftest.currentIdentity },
        'owner-settled successor selftest matrix record equals its exact overlay');
    } else {
      assert.deepEqual(record, activePaths[index], `owner-settled successor preserves active predecessor path ${record.path} byte-for-byte`);
    }
  });
  assert.deepEqual(successor.aggregateObservation, {
    command: 'node scripts/selftest.mjs',
    executedAt: '2026-07-17T02:06:35Z',
    exitCode: 0,
    passed: 508,
    failed: 0,
    worktreeGitOid: selftest.currentIdentity.worktreeGitOid,
    worktreeSha256: selftest.currentIdentity.worktreeSha256,
    classification: 'planning-observation-only',
    testEvidenceClaim: false,
    completionEvidenceClaim: false
  }, 'owner-settled successor aggregate remains a non-completion planning observation');
  assertExactOrderedKeys(successor.completionClaims, [
    'feature010ScopePassClaim',
    'feature010ScopeCompletionClaim',
    'feature010FeaturePassClaim',
    'feature010FeatureCompletionClaim',
    'feature010TestPassClaim',
    'feature010TestCompletionClaim',
    'feature010CertificationPassClaim',
    'feature010CertificationCompletionClaim',
    'feature004CanaryPassClaim',
    'feature004TestPhasePassClaim',
    'feature004TestPhaseCompletionClaim',
    'feature004ScopePassClaim',
    'feature004ScopeCompletionClaim',
    'feature004CertificationPassClaim',
    'feature004CertificationCompletionClaim',
    'bug003AcceptanceClaim',
    'bug002AcceptanceClaim'
  ], 'owner-settled successor completionClaims');
  assert.ok(Object.values(successor.completionClaims).every((value) => value === false), 'owner-settled successor keeps every completion and acceptance claim false');
  assertExactOrderedKeys(successor.volatileConfigPolicy, [
    'path',
    'currentIdentityRecorded',
    'authoritativeForScope4Edit',
    'inheritedJustInTimeCheckpointRuleRemainsRequired'
  ], 'owner-settled successor volatileConfigPolicy');
  assert.deepEqual(successor.volatileConfigPolicy, {
    path: transitions.volatileConfigPolicy.path,
    currentIdentityRecorded: transitions.volatileConfigPolicy.currentIdentityRecorded,
    authoritativeForScope4Edit: transitions.volatileConfigPolicy.authoritativeForFutureScope4Edit,
    inheritedJustInTimeCheckpointRuleRemainsRequired: transitions.volatileConfigPolicy.inheritedJustInTimeCheckpointRuleRemainsRequired
  }, 'owner-settled successor preserves the exact fail-closed volatile config rule');
  assert.ok(Object.values(successor.preservationContract).every((value) => value === true),
    'owner-settled successor preservation contract is entirely fail-closed');
  assert.equal(successor.routing.outcome, 'route_required');
  assert.deepEqual(successor.routing.addressedFindingIds, [
    'F004-CURRENT-SCRIPT-IDENTITY-003',
    'BUG003-FOREIGN-F004-DIRTY-HUNK-IDENTITY'
  ]);
  assert.deepEqual(successor.routing.unresolvedFindingIds, [
    'F004-COLLISION-SCRIPT-TRANSITIONS-PARSER-002',
    'BUG003-FULL-SUITE-NODE-FAILURE-PROPAGATION',
    'BUG003-INDEPENDENT-VERIFICATION',
    'BUG002-ACCEPTANCE-BLOCK'
  ]);
  assert.equal(successor.routing.nextRequiredOwner, 'bubbles.test');
  assert.equal(successor.routing.bug003StatusRequired, 'in_progress');
  assert.equal(successor.routing.bug002ResumeAllowed, false);
  assertExactOrderedKeys(successor.testOwnerHandoff, ['owner', 'path', 'nextPacket', 'requirements'], 'owner-settled successor testOwnerHandoff');
  assert.equal(successor.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(successor.testOwnerHandoff.path, 'tests/feature-004-dirty-tree-collision.test.mjs');
  assert.equal(successor.testOwnerHandoff.nextPacket, 'specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence');
  assert.equal(successor.testOwnerHandoff.requirements.length, 15, 'owner-settled successor retains all 15 handoff requirements');
  successor.testOwnerHandoff.requirements.forEach((requirement, index) => assertNonemptyString(requirement,
    `owner-settled successor testOwnerHandoff.requirements[${index}]`));
  assert.equal(new Set(successor.testOwnerHandoff.requirements).size, 15, 'owner-settled successor handoff requirements are unique');
  return successor.currentCheckpointPaths;
}

function currentDiffHunks(path) {
  const diff = git(['diff', '--no-ext-diff', '--unified=0', '--', path]);
  const hunks = [];
  let current = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('@@')) {
      if (current) hunks.push(current);
      current = { header: line, changedLines: [] };
      continue;
    }
    if (current && (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---')) {
      current.changedLines.push(line);
    }
  }
  if (current) hunks.push(current);
  return hunks.map((hunk, index) => ({
    hunkIndex: index + 1,
    header: hunk.header,
    additionCount: hunk.changedLines.filter((line) => line.startsWith('+')).length,
    deletionCount: hunk.changedLines.filter((line) => line.startsWith('-')).length,
    changedLineCount: hunk.changedLines.length,
    hunkBodySha256: sha256(hunk.changedLines.join('\n')),
    changedLines: hunk.changedLines
  }));
}

function fullCurrentSelftestIdentity() {
  const path = 'scripts/selftest.mjs';
  const bytes = readFileSync(resolve(ROOT, path));
  const hunks = currentDiffHunks(path);
  const status = shortStatus(path);
  return {
    path,
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(path),
    indexOid: indexOid(path),
    worktreeGitOid: worktreeGitOid(path),
    worktreeSha256: sha256(bytes),
    byteLength: bytes.length,
    lineCount: lineChunks(bytes).length,
    hunkCount: hunks.length,
    hunkBodySha256: hunks.map((hunk) => hunk.hunkBodySha256),
    lastCommit: lastCommit(path)
  };
}

function validateSelftestSuccessorV2(ownerSettledSelftest, successor, canonical) {
  assertExactCanonicalContract(successor, canonical, 'selftest successor v2');
  assertExactOrderedKeys(successor, [
    'contractVersion',
    'findingIds',
    'capturedAt',
    'extendsContract',
    'captureStability',
    'previousActiveIdentity',
    'committedIndexTransitions',
    'currentSelftestIdentity',
    'orderedDiffHunks',
    'markerOwnership',
    'ownerStateSnapshot',
    'protectedPathIdentities',
    'aggregateObservation',
    'completionClaims',
    'volatileConfigPolicy',
    'preservationContract',
    'routing',
    'implementationOwnerHandoff',
    'testOwnerHandoff'
  ], 'selftest successor v2');
  assert.equal(successor.contractVersion, 'feature004-dirty-collision-selftest-successor/v2');
  assertUtcTimestamp(successor.capturedAt, 'selftest successor v2 capturedAt');
  assert.equal(successor.extendsContract.marker, 'feature004-dirty-collision-owner-settled-selftest-v1');
  assert.equal(successor.extendsContract.rawBlockSha256, OWNER_SETTLED_SELFTEST_BLOCK_SHA256);
  assert.equal(successor.extendsContract.priorBlockMustRemainByteIdentical, true);
  assert.equal(successor.captureStability.raceDetected, false, 'selftest successor v2 records no capture race');
  assertExactOrderedKeys(successor.committedIndexTransitions, [
    'baseCommit',
    'currentHead',
    'currentIndexOid',
    'previousActiveWorktreeOidFoundInCommittedHistory',
    'currentWorktreeOidFoundInCommittedHistory',
    'currentIndexOidFoundAtCurrentHead',
    'records'
  ], 'selftest successor v2 committedIndexTransitions');
  assert.equal(successor.committedIndexTransitions.records.length, 8,
    'selftest successor v2 preserves all eight committed index transitions');
  successor.committedIndexTransitions.records.forEach((transition, index) => {
    assert.equal(git(['rev-parse', `${transition.commit}:scripts/selftest.mjs`]).trim(), transition.selftestBlobOid,
      `selftest successor v2 committedIndexTransitions[${index}] resolves its exact blob`);
  });
  assert.deepEqual(fullCurrentSelftestIdentity(), successor.currentSelftestIdentity, 'selftest successor v2 matches the complete live selftest identity');
  const currentHunks = currentDiffHunks('scripts/selftest.mjs');
  assert.equal(currentHunks.length, successor.orderedDiffHunks.length, 'selftest successor v2 has the complete ordered hunk inventory');
  successor.orderedDiffHunks.forEach((hunk, index) => {
    assert.deepEqual({
      hunkIndex: currentHunks[index].hunkIndex,
      header: currentHunks[index].header,
      additionCount: currentHunks[index].additionCount,
      deletionCount: currentHunks[index].deletionCount,
      changedLineCount: currentHunks[index].changedLineCount,
      hunkBodySha256: currentHunks[index].hunkBodySha256
    }, {
      hunkIndex: hunk.hunkIndex,
      header: hunk.header,
      additionCount: hunk.additionCount,
      deletionCount: hunk.deletionCount,
      changedLineCount: hunk.changedLineCount,
      hunkBodySha256: hunk.hunkBodySha256
    }, `selftest successor v2 orderedDiffHunks[${index}] recomputes exactly`);
  });
  markerSlice(successor.markerOwnership.feature005, true, 'Feature 005');
  const featureSixSlice = markerSlice({
    ...successor.markerOwnership.feature006,
    sliceSha256: successor.markerOwnership.feature006.currentSliceSha256
  }, false, 'Feature 006');
  assert.deepEqual([...new Set(featureSixSlice.match(/\btdc[A-Z][A-Za-z0-9_]*/g) || [])].sort(), EXPECTED_SETTLED_SYMBOLS,
    'selftest successor v2 recomputes the exact sorted 65-symbol Feature 006 inventory');
  featureTenMarkerSlice(successor.markerOwnership.feature010Foundation);
  assert.equal((readFileSync(resolve(ROOT, 'scripts/selftest.mjs'), 'utf8').match(/Feature 011 RLVOL foundation/g) || []).length,
    successor.markerOwnership.feature011.currentGroupTitleCount, 'selftest successor v2 recomputes the absent Feature 011 group title');
  assert.equal(successor.protectedPathIdentities.length, 13, 'selftest successor v2 contains exactly 13 protected paths');
  assert.deepEqual(successor.protectedPathIdentities.map((record) => record.path), EXPECTED_CHECKPOINT_PATHS,
    'selftest successor v2 preserves the exact protected path order');
  successor.protectedPathIdentities.forEach(assertCurrentCheckpointIdentity);
  assert.ok(Object.values(successor.completionClaims).every((value) => value === false), 'selftest successor v2 keeps every completion claim false');
  assert.ok(Object.values(successor.preservationContract).every((value) => value === true), 'selftest successor v2 keeps every preservation boundary fail-closed');
  assert.deepEqual(successor.volatileConfigPolicy, ownerSettledSelftest.volatileConfigPolicy,
    'selftest successor v2 preserves the exact volatile-config rule');
  assert.equal(successor.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(successor.testOwnerHandoff.path, 'tests/feature-004-dirty-tree-collision.test.mjs');
  assert.equal(successor.testOwnerHandoff.requirements.length, 18, 'selftest successor v2 retains all 18 parser requirements');
  assert.equal(new Set(successor.testOwnerHandoff.requirements).size, 18, 'selftest successor v2 parser requirements are unique');
  return successor.protectedPathIdentities;
}

function validateSelftestSuccessorV3(successorV2, successor, canonical) {
  assertExactCanonicalContract(successor, canonical, 'selftest successor v3');
  assertExactOrderedKeys(successor, [
    'contractVersion',
    'findingIds',
    'capturedAt',
    'extendsContract',
    'settlementSource',
    'identityContinuity',
    'orderedDiffHunks',
    'markerOwnership',
    'provenanceCorrection',
    'completionClaims',
    'preservationContract',
    'routing',
    'implementationOwnerHandoff',
    'testOwnerHandoff'
  ], 'selftest successor v3');
  assert.equal(successor.contractVersion, 'feature004-dirty-collision-selftest-successor/v3');
  assert.deepEqual(successor.findingIds, [
    'F005-IDENTITY-HUNK1-PRODUCER-CORRECTION',
    'BUG002-F004-SELFTEST-CHECKPOINT-DRIFT'
  ], 'selftest successor v3 finding set is exact and ordered');
  assertUtcTimestamp(successor.capturedAt, 'selftest successor v3 capturedAt');
  assert.deepEqual(successor.extendsContract, {
    marker: 'feature004-dirty-collision-selftest-successor-v2',
    rawBlockSha256: SELFTEST_SUCCESSOR_V2_BLOCK_SHA256,
    rawBlockByteLength: SELFTEST_SUCCESSOR_V2_BLOCK_BYTE_LENGTH,
    hashInput: 'marker-inclusive-no-trailing-newline',
    startCount: 1,
    endCount: 1,
    historyDisposition: 'mandatory-validated-history-superseded-only-as-active-provenance-interpretation',
    priorBlockMustRemainByteIdentical: true,
    priorBlockMustRemainParserValidated: true
  }, 'selftest successor v3 extends exact mandatory v2 bytes');
  assert.deepEqual(successor.settlementSource, {
    packet: 'specs/005-palm-springs-rental-market-lab',
    section: 'Scope 2 Selftest Identity Settlement And Current-Byte Replay - 2026-07-18T03:20:48.669Z',
    sectionCapturedAt: '2026-07-18T03:20:48.669Z',
    agent: 'bubbles.test',
    phase: 'test',
    claimSource: 'interpreted',
    identityReturnContractVersion: 'feature005-scope2-selftest-identity-return/v1',
    feature005Scope2Status: 'nonterminal',
    feature005ExistingOwnerRoute: 'TR-005-S02-E2E-FIDELITY-IMPLEMENT-20260718',
    ownerReceiptSelftestObservation: {
      command: 'node scripts/selftest.mjs',
      exitCode: 0,
      passed: 491,
      failed: 0,
      acceptedAsPlanningTestEvidence: false,
      acceptedAsCompletionEvidence: false
    }
  }, 'selftest successor v3 preserves the exact nonterminal Feature 005 owner receipt boundary');
  const { lineCount, ...v2Identity } = successorV2.currentSelftestIdentity;
  assert.deepEqual(successor.identityContinuity, {
    path: v2Identity.path,
    v2IdentityRef: 'feature004-dirty-collision-selftest-successor-v2::currentSelftestIdentity',
    status: v2Identity.status,
    staged: v2Identity.staged,
    unstaged: v2Identity.unstaged,
    headOid: v2Identity.headOid,
    indexOid: v2Identity.indexOid,
    worktreeGitOid: v2Identity.worktreeGitOid,
    worktreeSha256: v2Identity.worktreeSha256,
    byteLength: v2Identity.byteLength,
    lineChunkCount: lineCount,
    hunkCount: v2Identity.hunkCount,
    hunkBodySha256: v2Identity.hunkBodySha256,
    lastCommit: v2Identity.lastCommit,
    identityChangedSinceV2: false
  }, 'selftest successor v3 preserves the complete v2 identity without reinterpretation');
  const liveIdentity = fullCurrentSelftestIdentity();
  const { lineCount: liveLineCount, ...liveIdentityWithoutLineCount } = liveIdentity;
  const { v2IdentityRef, identityChangedSinceV2, ...continuityWithoutInterpretation } = successor.identityContinuity;
  assert.equal(v2IdentityRef, 'feature004-dirty-collision-selftest-successor-v2::currentSelftestIdentity');
  assert.equal(identityChangedSinceV2, false);
  assert.deepEqual({ ...liveIdentityWithoutLineCount, lineChunkCount: liveLineCount }, continuityWithoutInterpretation,
    'selftest successor v3 matches the complete live selftest identity');

  const liveHunks = currentDiffHunks('scripts/selftest.mjs');
  assert.equal(liveHunks.length, 6, 'selftest successor v3 recomputes exactly six hunks');
  successor.orderedDiffHunks.forEach((hunk, index) => {
    assert.deepEqual({
      hunkIndex: liveHunks[index].hunkIndex,
      header: liveHunks[index].header,
      additionCount: liveHunks[index].additionCount,
      deletionCount: liveHunks[index].deletionCount,
      changedLineCount: liveHunks[index].changedLineCount,
      hunkBodySha256: liveHunks[index].hunkBodySha256
    }, {
      hunkIndex: hunk.hunkIndex,
      header: hunk.header,
      additionCount: hunk.additionCount,
      deletionCount: hunk.deletionCount,
      changedLineCount: hunk.changedLineCount,
      hunkBodySha256: hunk.hunkBodySha256
    }, `selftest successor v3 orderedDiffHunks[${index}] recomputes exactly`);
  });
  const hunkOne = successor.orderedDiffHunks[0];
  assert.equal(hunkOne.hunkHeaderContextLine, "import { validateBriefPayload } from './validate-brief-payload.mjs';");
  assert.equal(hunkOne.hunkHeaderContextProducerCommit, '943972e295b8fa93a19795e46015e5ae780b0350');
  assert.equal(hunkOne.hunkHeaderContextRetained, true);
  assert.equal(hunkOne.deletedCommittedLine, "import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';");
  assert.deepEqual(liveHunks[0].changedLines, [`-${hunkOne.deletedCommittedLine}`], 'selftest successor v3 distinguishes the deleted body from retained header context');
  assert.ok(git(['show', `${hunkOne.hunkHeaderContextProducerCommit}:scripts/selftest.mjs`]).includes(hunkOne.hunkHeaderContextLine),
    'selftest successor v3 resolves retained header context in its named commit');
  assert.ok(git(['show', `${hunkOne.producerCommit}:scripts/selftest.mjs`]).includes(hunkOne.deletedCommittedLine),
    'selftest successor v3 resolves the deleted body line in the Feature 010 Scope 6 commit');
  assert.equal(git(['show', '--no-patch', '--format=%s', hunkOne.producerCommit]).trim(), hunkOne.producerCommitSubject,
    'selftest successor v3 resolves the exact deleted-line producer subject');
  assert.equal(hunkOne.currentDeletionAuthor, 'unknown');
  assert.deepEqual(successor.orderedDiffHunks.filter((hunk) => hunk.currentDeletionAuthor === 'unknown').map((hunk) => hunk.hunkIndex), [1, 2, 6],
    'selftest successor v3 leaves only hunks 1, 2, and 6 with unknown current deletion authors');
  assert.deepEqual(successor.orderedDiffHunks.filter((hunk) => hunk.owner?.includes('specs/005-')).map((hunk) => hunk.hunkIndex), [3, 4, 5],
    'selftest successor v3 attributes only hunks 3 through 5 to Feature 005');

  markerSlice(successor.markerOwnership.feature005, true, 'Feature 005 v3');
  const featureSixSlice = markerSlice(successor.markerOwnership.feature006, false, 'Feature 006 v3');
  assert.deepEqual([...new Set(featureSixSlice.match(/\btdc[A-Z][A-Za-z0-9_]*/g) || [])].sort(), EXPECTED_SETTLED_SYMBOLS,
    'selftest successor v3 retains the exact sorted 65-symbol Feature 006 inventory');
  assert.deepEqual(successor.provenanceCorrection, {
    correctedHunkIndex: 1,
    v2TargetOwner: 'specs/011-volatility-regime-and-sizing-lab',
    ownerReceiptDeletedLineClaim: "import { validateBriefPayload } from './validate-brief-payload.mjs';",
    ownerReceiptLineClaimDisposition: 'corrected-hunk-header-context-not-deleted-body',
    actualDeletedCommittedLine: "import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';",
    hunkHeaderContextProducerCommit: '943972e295b8fa93a19795e46015e5ae780b0350',
    correctedCommittedProducer: 'specs/010-company-fundamentals-and-brief-lab Scope 6',
    correctedProducerCommit: 'a93076912aa1df17ca1e41ea929d37f1b8f40d51',
    correctedProducerCommitSubject: 'feat(010): Feature 002 consume-once owner-read + registry discoverability (Increment B / Scope 6)',
    currentDeletionAuthor: 'unknown',
    currentDeletionSemanticApproval: false,
    otherHunkDispositionsRemainExact: true
  }, 'selftest successor v3 corrects only the hunk-one committed producer provenance');
  assert.ok(Object.values(successor.completionClaims).every((value) => value === false), 'selftest successor v3 keeps every completion inference false');
  assert.ok(Object.values(successor.preservationContract).every((value) => value === true), 'selftest successor v3 keeps every preservation boundary fail-closed');
  assert.equal(successor.routing.terminalStatusMutationAllowed, false);
  assert.equal(successor.implementationOwnerHandoff.selftestEditAllowed, false);
  assert.equal(successor.implementationOwnerHandoff.collisionTestEditAllowed, false);
  assert.equal(successor.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(successor.testOwnerHandoff.path, 'tests/feature-004-dirty-tree-collision.test.mjs');
  assert.deepEqual(successor.testOwnerHandoff.requirements, EXPECTED_V3_HANDOFF, 'selftest successor v3 retains every test-owner requirement exactly and in order');
  return successorV2.protectedPathIdentities;
}

function applyIdentityOverlay(priorPaths, overlay, expectedWorktree, label) {
  assert.ok(Array.isArray(priorPaths), `${label} prior currentPaths is an array`);
  const transition = overlay.hunkTransition;
  const matchingIndexes = priorPaths.flatMap((record, index) => record.path === transition.path ? [index] : []);
  assert.equal(matchingIndexes.length, 1, `${label} names exactly one inherited path`);
  const targetIndex = matchingIndexes[0];
  const prior = priorPaths[targetIndex];
  const current = overlay.currentPathIdentity;
  assertExactOrderedKeys(current, [
    'path',
    'status',
    'staged',
    'unstaged',
    'indexOid',
    'worktreeGitOid',
    'worktreeSha256',
    'hunkCount',
    'hunkBodySha256'
  ], `${label}.currentPathIdentity`);
  assert.equal(transition.hunkIndex, 7, `${label} overlays only hunk 7`);
  assert.equal(prior.hunkBodySha256[transition.hunkIndex - 1], transition.previousHunkBodySha256, `${label} previous hunk hash matches inherited hunk 7`);
  const expectedHashes = [...prior.hunkBodySha256];
  expectedHashes[transition.hunkIndex - 1] = transition.currentHunkBodySha256;
  assert.deepEqual(current, {
    ...prior,
    worktreeGitOid: expectedWorktree.worktreeGitOid,
    worktreeSha256: expectedWorktree.worktreeSha256,
    hunkBodySha256: expectedHashes
  }, `${label} changes only the named worktree identity and hunk 7`);
  assert.deepEqual(current.hunkBodySha256.slice(0, 6), prior.hunkBodySha256.slice(0, 6), `${label} inherits hunks 1 through 6 exactly`);
  assert.equal(current.hunkBodySha256[6], transition.currentHunkBodySha256, `${label} installs the exact new hunk 7`);
  const overlaid = structuredClone(priorPaths);
  overlaid[targetIndex] = structuredClone(current);
  overlaid.forEach((record, index) => {
    if (index !== targetIndex) assert.deepEqual(record, priorPaths[index], `${label} preserves non-target currentPaths[${index}] exactly`);
  });
  return overlaid;
}

function validateCollisionDisposition(baseline, disposition) {
  assertExactKeys(disposition, [
    'acceptedOriginalHunks',
    'baselineByteSources',
    'capturedAt',
    'contractVersion',
    'currentPaths',
    'extendsContracts',
    'preservationContract',
    'testOwnerHandoff'
  ], 'collision disposition');
  assert.equal(disposition.contractVersion, 'feature004-dirty-collision-disposition/v1');
  assert.match(disposition.capturedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, 'collision disposition capturedAt is UTC ISO-8601');

  const expectedExtensions = [
    { marker: 'feature004-dirty-baseline-v1', rawBlockSha256: BASELINE_BLOCK_SHA256 },
    { marker: 'feature004-dirty-supersession-v1', rawBlockSha256: SUPERSESSION_BLOCK_SHA256 }
  ];
  assert.ok(Array.isArray(disposition.extendsContracts), 'extendsContracts is an array');
  disposition.extendsContracts.forEach((record, index) => assertExactKeys(record, ['marker', 'rawBlockSha256'], `extendsContracts[${index}]`));
  assert.deepEqual(disposition.extendsContracts, expectedExtensions, 'extendsContracts names exactly the two byte-verified prior contracts in order');

  assert.ok(Array.isArray(disposition.baselineByteSources), 'baselineByteSources is an array');
  assert.equal(disposition.baselineByteSources.length, 2, 'baselineByteSources has exactly two records');
  const expectedSourceMetadata = [
    {
      path: 'scripts/selftest.mjs',
      sourceKind: 'vscode-local-history',
      sourceRef: 'User/History/-77703807/mijZ.mjs',
      sourceObservedAt: '2026-07-14T13:44:23.109Z'
    },
    {
      path: 'index.html',
      sourceKind: 'git-object',
      sourceRef: '32bbe36d6500fb402231c1db1bc2cbc45beb08d6',
      sourceObservedAt: '2026-07-14T16:43:33.000Z'
    }
  ];
  disposition.baselineByteSources.forEach((source, index) => {
    assertExactKeys(source, [
      'indexOid',
      'path',
      'sourceKind',
      'sourceObservedAt',
      'sourceRef',
      'worktreeGitOid',
      'worktreeSha256'
    ], `baselineByteSources[${index}]`);
    const baselineRecords = baseline.tracked.filter((record) => record.path === source.path);
    assert.equal(baselineRecords.length, 1, `${source.path} identifies exactly one original baseline record`);
    const baselineRecord = baselineRecords[0];
    assert.deepEqual(source, {
      ...expectedSourceMetadata[index],
      indexOid: baselineRecord.indexOid,
      worktreeGitOid: baselineRecord.worktreeGitOid,
      worktreeSha256: baselineRecord.worktreeSha256
    }, `baselineByteSources[${index}] exactly identifies the recovered original bytes`);
  });

  assert.ok(Array.isArray(disposition.currentPaths), 'currentPaths is an array');
  assert.equal(disposition.currentPaths.length, 2, 'currentPaths has exactly two records');
  assert.deepEqual(disposition.currentPaths.map((record) => record.path), EXPECTED_DISPOSITION_PATHS, 'currentPaths preserves the exact path order');
  disposition.currentPaths.forEach((record, index) => {
    assertExactKeys(record, [
      'hunkBodySha256',
      'hunkCount',
      'indexOid',
      'path',
      'staged',
      'status',
      'unstaged',
      'worktreeGitOid',
      'worktreeSha256'
    ], `currentPaths[${index}]`);
    assert.equal(record.status, ' M', `${record.path} checkpoint status is unstaged-only modified`);
    assert.equal(record.staged, false, `${record.path} checkpoint has no staged change`);
    assert.equal(record.unstaged, true, `${record.path} checkpoint has an unstaged change`);
    assert.match(record.indexOid, /^[a-f0-9]{40}$/, `${record.path} checkpoint indexOid is a Git object ID`);
    assert.match(record.worktreeGitOid, /^[a-f0-9]{40}$/, `${record.path} checkpoint worktreeGitOid is a Git object ID`);
    assert.match(record.worktreeSha256, /^[a-f0-9]{64}$/, `${record.path} checkpoint worktreeSha256 is a SHA-256 hash`);
    assertUniqueHashes(record.hunkBodySha256, `${record.path} checkpoint hunk hashes`);
    assert.equal(record.hunkCount, record.hunkBodySha256.length, `${record.path} checkpoint hunk count matches its complete ordered hash list`);
  });

  assert.ok(Array.isArray(disposition.acceptedOriginalHunks), 'acceptedOriginalHunks is an array');
  assert.equal(disposition.acceptedOriginalHunks.length, EXPECTED_DISPOSITION_HUNKS.length, 'acceptedOriginalHunks has exactly five records');
  assert.deepEqual(disposition.acceptedOriginalHunks.map(({ path, originalHunkBodySha256 }) => ({ path, originalHunkBodySha256 })),
    EXPECTED_DISPOSITION_HUNKS.map(({ path, originalHunkBodySha256 }) => ({ path, originalHunkBodySha256 })),
    'acceptedOriginalHunks contains only the five reviewed path/hash pairs in order');
  disposition.acceptedOriginalHunks.forEach((record, index) => {
    assertExactKeys(record, [
      'baselineHunkHeader',
      'baselineHunkIndex',
      'currentHunkBodySha256',
      'currentHunkIndex',
      'disposition',
      'originalHunkBodySha256',
      'owners',
      'path'
    ], `acceptedOriginalHunks[${index}]`);
    const expected = EXPECTED_DISPOSITION_HUNKS[index];
    assert.deepEqual({
      path: record.path,
      originalHunkBodySha256: record.originalHunkBodySha256,
      baselineHunkIndex: record.baselineHunkIndex,
      baselineHunkHeader: record.baselineHunkHeader,
      currentHunkIndex: record.currentHunkIndex,
      currentHunkBodySha256: record.currentHunkBodySha256
    }, expected, `acceptedOriginalHunks[${index}] preserves the exact original and replacement identity`);
    assert.equal(record.disposition, 'intentional-supersession', `acceptedOriginalHunks[${index}] has the reviewed disposition`);

    const baselineRecords = baseline.tracked.filter((candidate) => candidate.path === record.path);
    assert.equal(baselineRecords.length, 1, `${record.path} accepted hunk identifies exactly one baseline path`);
    assert.equal(baselineRecords[0].hunkBodySha256[record.baselineHunkIndex - 1], record.originalHunkBodySha256,
      `${record.path} accepted original hash occupies its exact baseline hunk index`);
    const currentRecords = disposition.currentPaths.filter((candidate) => candidate.path === record.path);
    assert.equal(currentRecords.length, 1, `${record.path} accepted hunk identifies exactly one current path`);
    assert.equal(currentRecords[0].hunkBodySha256[record.currentHunkIndex - 1], record.currentHunkBodySha256,
      `${record.path} replacement hash occupies its exact current hunk index`);
    assert.equal(currentRecords[0].hunkBodySha256.filter((hash) => hash === record.currentHunkBodySha256).length, 1,
      `${record.path} replacement hash identifies one unique current hunk`);

    assert.ok(Array.isArray(record.owners), `acceptedOriginalHunks[${index}].owners is an array`);
    assert.ok(record.owners.length > 0, `acceptedOriginalHunks[${index}] has at least one owner`);
    record.owners.forEach((owner, ownerIndex) => {
      assertExactKeys(owner, ['evidenceRefs', 'owner', 'packet'], `acceptedOriginalHunks[${index}].owners[${ownerIndex}]`);
      assertNonemptyString(owner.owner, `acceptedOriginalHunks[${index}].owners[${ownerIndex}].owner`);
      assertNonemptyString(owner.packet, `acceptedOriginalHunks[${index}].owners[${ownerIndex}].packet`);
      assert.ok(Array.isArray(owner.evidenceRefs), `acceptedOriginalHunks[${index}].owners[${ownerIndex}].evidenceRefs is an array`);
      assert.ok(owner.evidenceRefs.length > 0, `acceptedOriginalHunks[${index}].owners[${ownerIndex}] has evidence`);
      owner.evidenceRefs.forEach((reference, referenceIndex) => assertNonemptyString(reference,
        `acceptedOriginalHunks[${index}].owners[${ownerIndex}].evidenceRefs[${referenceIndex}]`));
    });
  });
  assert.equal(new Set(disposition.acceptedOriginalHunks.map((record) => `${record.path}\0${record.originalHunkBodySha256}`)).size,
    EXPECTED_DISPOSITION_HUNKS.length, 'acceptedOriginalHunks contains no duplicate original path/hash pair');
  assert.equal(new Set(disposition.acceptedOriginalHunks.map((record) => `${record.path}\0${record.currentHunkBodySha256}`)).size,
    EXPECTED_DISPOSITION_HUNKS.length, 'acceptedOriginalHunks maps to five unique replacement hunks');

  assertExactKeys(disposition.preservationContract, [
    'acceptedOriginalHashCount',
    'acceptedPathSet',
    'allOtherOriginalBaselineHashesRemainRequired',
    'allUnlistedPathsAndHashesFailClosed',
    'currentIdentityMismatchFailsClosed',
    'duplicateUnknownOrReorderedRecordFailsClosed',
    'rldataSupersessionRemainsIndependent',
    'subsequentHunkAdditionRemovalOrReorderFailsClosed'
  ], 'preservationContract');
  assert.deepEqual(disposition.preservationContract, {
    acceptedOriginalHashCount: 5,
    acceptedPathSet: EXPECTED_DISPOSITION_PATHS,
    rldataSupersessionRemainsIndependent: true,
    allOtherOriginalBaselineHashesRemainRequired: true,
    allUnlistedPathsAndHashesFailClosed: true,
    currentIdentityMismatchFailsClosed: true,
    duplicateUnknownOrReorderedRecordFailsClosed: true,
    subsequentHunkAdditionRemovalOrReorderFailsClosed: true
  }, 'preservationContract retains the complete fail-closed policy');

  assertExactKeys(disposition.testOwnerHandoff, ['owner', 'path', 'requirements'], 'testOwnerHandoff');
  assert.equal(disposition.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(disposition.testOwnerHandoff.path, 'tests/feature-004-dirty-tree-collision.test.mjs');
  assert.deepEqual(disposition.testOwnerHandoff.requirements, EXPECTED_DISPOSITION_HANDOFF, 'testOwnerHandoff retains every parser requirement in order');
}

function validateCollisionDelta(disposition, delta) {
  assertExactOrderedKeys(delta, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContract',
    'hunkTransition',
    'ownerAttribution',
    'currentPathIdentity',
    'aggregateObservation',
    'preservationContract',
    'testOwnerHandoff'
  ], 'collision delta');
  assert.equal(delta.contractVersion, 'feature004-dirty-collision-delta/v1');
  assert.equal(delta.findingId, 'F004-IDENTITY-DRIFT-001');
  assertUtcTimestamp(delta.capturedAt, 'collision delta capturedAt');
  assertExactOrderedKeys(delta.extendsContract, ['marker', 'rawBlockSha256'], 'collision delta extendsContract');
  assert.deepEqual(delta.extendsContract, {
    marker: 'feature004-dirty-collision-disposition-v1',
    rawBlockSha256: DISPOSITION_BLOCK_SHA256
  }, 'collision delta extends the exact reviewed disposition bytes');
  assertExactOrderedKeys(delta.hunkTransition, [
    'path',
    'hunkIndex',
    'previousHunkBodySha256',
    'currentHunkBodySha256',
    'disposition'
  ], 'collision delta hunkTransition');
  assert.deepEqual(delta.hunkTransition, {
    path: 'scripts/selftest.mjs',
    hunkIndex: 7,
    previousHunkBodySha256: '0f9739b064bc90a02c3baf5a1014442b8f566ad9f88dd3528c1103a462c55e1b',
    currentHunkBodySha256: 'ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80',
    disposition: 'owner-attributed-additive-delta'
  }, 'collision delta contains exactly one reviewed hunk transition');

  const owner = delta.ownerAttribution;
  assertExactOrderedKeys(owner, [
    'owner',
    'packet',
    'scope',
    'phase',
    'observedState',
    'markerBounds',
    'ownedSymbols',
    'artifactRefs',
    'toolLogRefs'
  ], 'collision delta ownerAttribution');
  assert.deepEqual({ owner: owner.owner, packet: owner.packet, scope: owner.scope, phase: owner.phase }, {
    owner: 'bubbles.implement',
    packet: 'specs/006-trend-dynamics-cycle-lab',
    scope: 'Scope 3',
    phase: 'implement'
  }, 'collision delta owner is exact');
  assertExactOrderedKeys(owner.observedState, ['activeAgent', 'currentScope', 'currentPhase', 'scopeStatus'], 'collision delta observedState');
  assert.deepEqual(owner.observedState, {
    activeAgent: 'bubbles.implement',
    currentScope: 'Scope 3',
    currentPhase: 'implement',
    scopeStatus: 'In Progress'
  }, 'collision delta observedState is exact historical evidence');
  assertExactOrderedKeys(owner.markerBounds, [
    'startInclusive',
    'endExclusive',
    'startByte',
    'endByte',
    'currentSliceSha256'
  ], 'collision delta markerBounds');
  assert.deepEqual(owner.markerBounds, {
    startInclusive: '/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */',
    endExclusive: '/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */',
    startByte: 117316,
    endByte: 159382,
    currentSliceSha256: '2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef'
  }, 'collision delta historical marker bounds are exact');
  const historicalMarkerSlice = featureSixMarkerSlice({
    startInclusive: owner.markerBounds.startInclusive,
    endExclusive: owner.markerBounds.endExclusive,
    currentSliceSha256: owner.markerBounds.currentSliceSha256
  }, false);
  assert.deepEqual(owner.ownedSymbols, [
    'tdcHarmonicDecomposition',
    'tdcWelchSpectrum',
    'tdcGeneralizedLombScargle',
    'tdcRollingSpectrum',
    'tdcLeadLag',
    'tdcEventStudy',
    'tdcEvaluateCycle',
    'tdcRunScope3Engine'
  ], 'collision delta names exactly eight owned symbols in order');
  for (const symbol of owner.ownedSymbols) {
    const pattern = new RegExp(`\\b${symbol}\\b`, 'g');
    assert.ok((historicalMarkerSlice.slice.match(pattern) || []).length > 0, `${symbol} exists inside the Feature 006 slice`);
    assert.equal((`${historicalMarkerSlice.before}\n${historicalMarkerSlice.after}`.match(pattern) || []).length, 0, `${symbol} is absent outside the Feature 006 slice`);
  }
  assert.deepEqual(owner.artifactRefs, [
    '../006-trend-dynamics-cycle-lab/scopes.md#scope-3-season-cycle-context-and-association-engine',
    '../006-trend-dynamics-cycle-lab/report.md#scope-3-season-cycle-context-and-association-engine',
    '../006-trend-dynamics-cycle-lab/state.json::execution.activeAgent=bubbles.implement;execution.currentPhase=implement;execution.currentScope=Scope 3'
  ], 'collision delta artifactRefs are exact and ordered');
  assert.equal(markdownAnchorCount(readFileSync(resolve(ROOT, FEATURE_SIX_REPORT_PATH), 'utf8'), 'scope-3-season-cycle-context-and-association-engine'), 1,
    'collision delta Feature 006 report anchor resolves exactly once');
  assert.deepEqual(owner.toolLogRefs, [
    '../../.specify/runtime/tool-calls.jsonl::line=652;sessionId=feature006-scope3-implement-current;agent=bubbles.implement;spec=006-trend-dynamics-cycle-lab;scope=Scope-3;exitCode=0;stdoutHash=546f242bf30e36ce4c15284992e6722238aa8b1b92238c6c3e93ac89038afa02;tags=consumer-sweep,stale-reference,containment,quality,rerun',
    '../../.specify/runtime/tool-calls.jsonl::line=730;sessionId=feature006-scope3-implement-current;agent=bubbles.implement;spec=006-trend-dynamics-cycle-lab;scope=Scope-3;command=node scripts/selftest.mjs;exitCode=1;stdoutHash=18aa519ae24fe1db442c97a5adaf4e4acb6a4fc4ac41e19964ede200357fded2;tags=final-determination,TP-03-01,repository-selftest'
  ], 'collision delta toolLogRefs are exact and ordered');
  owner.toolLogRefs.forEach((reference, index) => assertToolLogReference(reference, `collision delta toolLogRefs[${index}]`));

  const deltaPaths = applyIdentityOverlay(disposition.currentPaths, delta, {
    worktreeGitOid: '825ca9387c2557cc17a1590c02d65d61090b6180',
    worktreeSha256: '4740b0a3f063844cc04dd8793147788106f1af3b10e8e330b386cb7989369f6b'
  }, 'collision delta');
  assertExactOrderedKeys(delta.aggregateObservation, [
    'command',
    'toolLogRef',
    'exitCode',
    'passed',
    'failed',
    'failureOwner',
    'failure',
    'feature006Assertions',
    'feature006CompletionClaim',
    'feature004CompletionClaim',
    'collisionPassClaim'
  ], 'collision delta aggregateObservation');
  assert.deepEqual(delta.aggregateObservation, {
    command: 'node scripts/selftest.mjs',
    toolLogRef: '../../.specify/runtime/tool-calls.jsonl::line=703;sessionId=feature004-identity-drift-plan-current;agent=bubbles.plan;spec=004-fx-regime-relative-value-lab;scope=Scope-1;exitCode=1;stdoutHash=5676ab5c7b55b7bdc4bcb0edd9e97b7d90fbe8a951ccec030423b7ec79884f94;tags=F004-IDENTITY-DRIFT-001,owner-attribution,aggregate-red,feature006-scope3-current',
    exitCode: 1,
    passed: 491,
    failed: 1,
    failureOwner: 'Market Brief',
    failure: 'nextSession.sessionDate must match snapshot.nextSessionDate',
    feature006Assertions: 'M13-M18 and cycle assertions observed passing inside the failed aggregate',
    feature006CompletionClaim: false,
    feature004CompletionClaim: false,
    collisionPassClaim: false
  }, 'collision delta aggregate remains the exact unrelated red observation');
  assertToolLogReference(delta.aggregateObservation.toolLogRef, 'collision delta aggregate toolLogRef');
  assertExactOrderedKeys(delta.preservationContract, [
    'priorDispositionRemainsByteIdentical',
    'priorAcceptedOriginalHunksRemainExact',
    'originalBaselineRequirementsRemainExact',
    'independentSupersessionRequirementsRemainExact',
    'nonTargetCurrentPathsRemainInheritedAndExact',
    'onlyNamedPathMayOverlayPriorIdentity',
    'onlyNamedHunkMayTransition',
    'hunkCountAndOrderRemainExact',
    'subsequentIdentityOrHunkDriftFailsClosed'
  ], 'collision delta preservationContract');
  assert.ok(Object.values(delta.preservationContract).every((value) => value === true), 'collision delta preservationContract is entirely fail-closed');
  assertExactOrderedKeys(delta.testOwnerHandoff, ['owner', 'path', 'evidenceRefs', 'requirements'], 'collision delta testOwnerHandoff');
  assert.equal(delta.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(delta.testOwnerHandoff.path, 'tests/feature-004-dirty-tree-collision.test.mjs');
  assert.deepEqual(delta.testOwnerHandoff.evidenceRefs, [
    '../../.specify/runtime/tool-calls.jsonl::line=700;sessionId=feature004-identity-drift-plan-current;exitCode=1;stdoutHash=84d784f4f71620777702d8d2347bb7b764772f67a55f31c876eb83be892b1387',
    '../../.specify/runtime/tool-calls.jsonl::line=727;sessionId=feature004-identity-drift-plan-current;exitCode=0;stdoutHash=21afceb4701514668056ffd27dd7c13a90ad15fef5b4997028d3a9b7360736cd'
  ], 'collision delta test-owner evidence refs are exact');
  delta.testOwnerHandoff.evidenceRefs.forEach((reference, index) => assertToolLogReference(reference, `collision delta testOwnerHandoff.evidenceRefs[${index}]`));
  assert.deepEqual(delta.testOwnerHandoff.requirements, EXPECTED_DELTA_HANDOFF, 'collision delta retains every parser requirement in order');
  return deltaPaths;
}

function validateSettledCollisionDelta(deltaPaths, settled, requireHistoricalOffsets = true) {
  assertExactOrderedKeys(settled, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContract',
    'hunkTransition',
    'ownerAttribution',
    'currentPathIdentity',
    'aggregateObservation',
    'preservationContract',
    'testOwnerHandoff'
  ], 'settled collision delta');
  assert.equal(settled.contractVersion, 'feature004-dirty-collision-settled-delta/v1');
  assert.equal(settled.findingId, 'F004-POSTCHECKPOINT-DRIFT-001');
  assertUtcTimestamp(settled.capturedAt, 'settled collision delta capturedAt');
  assertExactOrderedKeys(settled.extendsContract, [
    'marker',
    'rawBlockSha256',
    'historyDisposition',
    'priorBlockMustRemainByteIdentical'
  ], 'settled collision delta extendsContract');
  assert.deepEqual(settled.extendsContract, {
    marker: 'feature004-dirty-collision-delta-v1',
    rawBlockSha256: DELTA_BLOCK_SHA256,
    historyDisposition: 'superseded-current-identity-history',
    priorBlockMustRemainByteIdentical: true
  }, 'settled collision delta extends the exact immutable historical delta');
  assertExactOrderedKeys(settled.hunkTransition, [
    'path',
    'hunkIndex',
    'previousHunkBodySha256',
    'currentHunkBodySha256',
    'disposition'
  ], 'settled collision delta hunkTransition');
  assert.deepEqual(settled.hunkTransition, {
    path: 'scripts/selftest.mjs',
    hunkIndex: 7,
    previousHunkBodySha256: 'ba4b911411a53fe83c6d9c99cce505f28b9cb0d38c88eae22eabb578f59e7c80',
    currentHunkBodySha256: '15ff8c7662995bbc7e977c2ea57bb95c5ac64d494a43f4bdc1d64ee81e42f943',
    disposition: 'settled-owner-additive-delta'
  }, 'settled collision delta contains exactly one reviewed hunk transition');

  const owner = settled.ownerAttribution;
  assertExactOrderedKeys(owner, [
    'owner',
    'packet',
    'scope',
    'phase',
    'scopeStatus',
    'executionHistoryEvidence',
    'markerBounds',
    'artifactRefs',
    'toolLogEvidence'
  ], 'settled collision delta ownerAttribution');
  assert.deepEqual({ owner: owner.owner, packet: owner.packet, scope: owner.scope, phase: owner.phase, scopeStatus: owner.scopeStatus }, {
    owner: 'bubbles.implement',
    packet: 'specs/006-trend-dynamics-cycle-lab',
    scope: 'Scope 3',
    phase: 'implement',
    scopeStatus: 'In Progress'
  }, 'settled collision delta owner is exact');
  assertExactOrderedKeys(owner.executionHistoryEvidence, [
    'agent',
    'phasesExecuted',
    'statusBefore',
    'statusAfter',
    'startedAt',
    'finishedAt',
    'outcome',
    'addressedFindings',
    'unresolvedFindings',
    'evidenceRef'
  ], 'settled collision delta executionHistoryEvidence');
  assert.deepEqual(owner.executionHistoryEvidence, {
    agent: 'bubbles.implement',
    phasesExecuted: ['implement'],
    statusBefore: 'not_started',
    statusAfter: 'not_started',
    startedAt: '2026-07-15T19:42:05Z',
    finishedAt: '2026-07-15T22:48:39Z',
    outcome: 'route_required',
    addressedFindings: [
      'F006-S3-M16-WINDOW-ELIGIBILITY-001',
      'F006-S3-ANALYTIC-ACTIVATION-POSTURE-001',
      'F006-S3-HELDOUT-CONFIG-KEY-001',
      'F006-S3-M13-RECONSTRUCTION-KEY-001',
      'F006-S3-CLIMATE-SOURCE-SPELLING-001',
      'F006-S3-CATALOG-REPETITION-OVERRIDE-001',
      'F006-S3-SELFVALIDATION-DATAFLOW-001',
      'F006-S3-CONSUMER-PROPERTY-SCOPE-001',
      'F006-EXT-SELFTEST-F009-001'
    ],
    unresolvedFindings: [
      'F006-FW-CHECK8-MJS-001',
      'F006-FW-G085-001',
      'F006-EXT-SELFTEST-MARKET-BRIEF-001'
    ],
    evidenceRef: 'report.md#scope-3-season-cycle-context-and-association-engine'
  }, 'settled collision delta execution history evidence is exact');
  const featureSixState = JSON.parse(readFileSync(resolve(ROOT, FEATURE_SIX_STATE_PATH), 'utf8'));
  const executionMatches = featureSixState.executionHistory.filter((entry) =>
    entry.agent === owner.executionHistoryEvidence.agent &&
    entry.finishedAt === owner.executionHistoryEvidence.finishedAt &&
    entry.outcome === owner.executionHistoryEvidence.outcome);
  assert.equal(executionMatches.length, 1, 'settled collision delta resolves exactly one Feature 006 executionHistory entry');
  for (const [key, value] of Object.entries(owner.executionHistoryEvidence)) {
    assert.deepEqual(executionMatches[0][key], value, `Feature 006 executionHistory resolves exact ${key}`);
  }

  assertExactOrderedKeys(owner.markerBounds, [
    'startInclusive',
    'endExclusive',
    'endBoundary',
    'startByte',
    'endByteExclusive',
    'byteLength',
    'currentSliceSha256',
    'symbolInventoryRule',
    'symbolInventory'
  ], 'settled collision delta markerBounds');
  assert.deepEqual({
    startInclusive: owner.markerBounds.startInclusive,
    endExclusive: owner.markerBounds.endExclusive,
    endBoundary: owner.markerBounds.endBoundary,
    startByte: owner.markerBounds.startByte,
    endByteExclusive: owner.markerBounds.endByteExclusive,
    byteLength: owner.markerBounds.byteLength,
    currentSliceSha256: owner.markerBounds.currentSliceSha256,
    symbolInventoryRule: owner.markerBounds.symbolInventoryRule
  }, {
    startInclusive: '/* ---------- Feature 006: Trend Dynamics deterministic capability foundation ---------- */',
    endExclusive: '/* ---------- Feature 007: Technical Analysis Decision foundation ---------- */',
    endBoundary: 'exclusive-before-feature-007-start-marker',
    startByte: 117426,
    endByteExclusive: 159494,
    byteLength: 42068,
    currentSliceSha256: '2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef',
    symbolInventoryRule: 'unique lexicographically sorted matches of /\\btdc[A-Z][A-Za-z0-9_]*/g inside the marker slice'
  }, 'settled collision delta marker metadata is exact');
  assert.deepEqual(owner.markerBounds.symbolInventory, EXPECTED_SETTLED_SYMBOLS, 'settled collision delta records the exact sorted 65-symbol inventory');
  const currentMarkerSlice = featureSixMarkerSlice(owner.markerBounds, requireHistoricalOffsets);
  const currentSymbols = [...new Set(currentMarkerSlice.slice.match(/\btdc[A-Z][A-Za-z0-9_]*/g) || [])].sort();
  assert.deepEqual(currentSymbols, EXPECTED_SETTLED_SYMBOLS, 'current Feature 006 slice recomputes the exact sorted 65-symbol inventory');

  assert.deepEqual(owner.artifactRefs, [
    '../006-trend-dynamics-cycle-lab/state.json::executionHistory[agent=bubbles.implement;finishedAt=2026-07-15T22:48:39Z;outcome=route_required;evidenceRef=report.md#scope-3-season-cycle-context-and-association-engine]',
    '../006-trend-dynamics-cycle-lab/report.md#scope-3-season-cycle-context-and-association-engine'
  ], 'settled collision delta artifactRefs are exact and ordered');
  assert.equal(markdownAnchorCount(readFileSync(resolve(ROOT, FEATURE_SIX_REPORT_PATH), 'utf8'), 'scope-3-season-cycle-context-and-association-engine'), 1,
    'settled collision delta Feature 006 report anchor resolves exactly once');
  const expectedToolLogEvidence = [
    {
      line: 672,
      sessionId: 'feature006-scope3-implement-current',
      agent: 'bubbles.implement',
      spec: '006-trend-dynamics-cycle-lab',
      scope: 'Scope-3',
      command: 'npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list',
      exitCode: 0,
      stdoutHash: '5e8ae44377294cf33c6fa8108290c803102ab02a56016ca8bb5b4fca50f291fc',
      tags: ['green', 'TP-03-09', 'Scope-1-3', 'e2e-ui', 'post-catalog-fix']
    },
    {
      line: 690,
      sessionId: 'feature006-scope3-implement-current',
      agent: 'bubbles.implement',
      spec: '006-trend-dynamics-cycle-lab',
      scope: 'Scope-3',
      command: 'node scripts/validate-trend-dynamics-cycle.mjs',
      exitCode: 0,
      stdoutHash: 'f2583980e8932b94e0a2d03ea75e403e0d30288628bc2f6ce1e89fa2f0546c48',
      tags: ['green', 'TP-03-02', 'consumer-sweep', 'post-evidence-edit']
    },
    {
      line: 730,
      sessionId: 'feature006-scope3-implement-current',
      agent: 'bubbles.implement',
      spec: '006-trend-dynamics-cycle-lab',
      scope: 'Scope-3',
      command: 'node scripts/selftest.mjs',
      exitCode: 1,
      stdoutHash: '18aa519ae24fe1db442c97a5adaf4e4acb6a4fc4ac41e19964ede200357fded2',
      tags: ['final-determination', 'TP-03-01', 'repository-selftest']
    },
    {
      line: 739,
      sessionId: 'feature006-scope3-implement-current',
      agent: 'bubbles.implement',
      spec: '006-trend-dynamics-cycle-lab',
      scope: 'Scope-3',
      commandClass: 'state-report-invariants',
      exitCode: 0,
      stdoutHash: 'a2b9a0187b7ea6b9dffb4700697422a0f438f5b8d2e0d457764cd711c8e8a906',
      tags: ['state-report-invariants', 'parent-routing', 'final-validation']
    }
  ];
  assert.deepEqual(owner.toolLogEvidence, expectedToolLogEvidence, 'settled collision delta toolLogEvidence is exact and ordered');
  owner.toolLogEvidence.forEach((record, index) => {
    assertExactOrderedKeys(record, Object.keys(expectedToolLogEvidence[index]), `settled collision delta toolLogEvidence[${index}]`);
    assertToolLogEvidence(record, `settled collision delta toolLogEvidence[${index}]`);
  });

  const currentPaths = applyIdentityOverlay(deltaPaths, settled, {
    worktreeGitOid: '484706d2f819971c298fd3dcef19e34915c4f052',
    worktreeSha256: 'f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8'
  }, 'settled collision delta');
  assertExactOrderedKeys(settled.aggregateObservation, [
    'command',
    'exitCode',
    'passed',
    'failed',
    'failureOwner',
    'failure',
    'feature006Assertions',
    'focusedValidator',
    'focusedBrowser',
    'relationshipToFeature006Scope3',
    'relationshipToFeature004',
    'feature006PassClaim',
    'feature006CompletionClaim',
    'feature004PassClaim',
    'feature004CompletionClaim',
    'collisionPassClaim'
  ], 'settled collision delta aggregateObservation');
  assert.deepEqual(settled.aggregateObservation, {
    command: 'node scripts/selftest.mjs',
    exitCode: 1,
    passed: 491,
    failed: 1,
    failureOwner: 'Market Brief',
    failure: 'nextSession.sessionDate must match snapshot.nextSessionDate',
    feature006Assertions: 'M13-M18 and all Feature 006 Scope 3 cycle assertions observed passing',
    focusedValidator: 'tool log line 690 exited 0',
    focusedBrowser: 'tool log line 672 exited 0',
    relationshipToFeature006Scope3: 'unrelated-unresolved-aggregate-failure',
    relationshipToFeature004: 'unrelated-unresolved-aggregate-failure',
    feature006PassClaim: false,
    feature006CompletionClaim: false,
    feature004PassClaim: false,
    feature004CompletionClaim: false,
    collisionPassClaim: false
  }, 'settled collision delta aggregate remains the exact unrelated red observation');
  assert.ok(Object.entries(settled.aggregateObservation)
    .filter(([key]) => key.endsWith('Claim'))
    .every(([, value]) => value === false), 'settled collision delta contains no inferred pass or completion claim');
  assertExactOrderedKeys(settled.preservationContract, [
    'priorDeltaRawHashRemainsExact',
    'priorDeltaRemainsByteIdentical',
    'priorDeltaIsSupersededCurrentIdentityHistory',
    'originalBaselineRequirementsRemainExact',
    'independentRldataSupersessionRequirementsRemainExact',
    'fiveHashDispositionRequirementsRemainExact',
    'currentIndexIdentityRemainsExact',
    'nonTargetCurrentPathsRemainInheritedAndExact',
    'hunksOneThroughSixRemainExact',
    'onlyNamedPathMayOverlayPriorIdentity',
    'onlyNamedHunkMayTransition',
    'hunkCountAndOrderRemainExact',
    'outsideOwnerMarkerDeltaFailsClosed',
    'subsequentIdentityHunkMarkerOrSymbolDriftFailsClosed'
  ], 'settled collision delta preservationContract');
  assert.ok(Object.values(settled.preservationContract).every((value) => value === true), 'settled collision delta preservationContract is entirely fail-closed');
  assertExactOrderedKeys(settled.testOwnerHandoff, ['owner', 'path', 'requirements'], 'settled collision delta testOwnerHandoff');
  assert.equal(settled.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(settled.testOwnerHandoff.path, 'tests/feature-004-dirty-tree-collision.test.mjs');
  assert.deepEqual(settled.testOwnerHandoff.requirements, EXPECTED_SETTLED_HANDOFF, 'settled collision delta retains every parser requirement in order');
  return currentPaths;
}

function parseCollisionContracts() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const baselineBlock = parseReportBlock(report, 'feature004-dirty-baseline-v1');
  const supersessionBlock = parseReportBlock(report, 'feature004-dirty-supersession-v1');
  const dispositionBlock = parseReportBlock(report, 'feature004-dirty-collision-disposition-v1');
  const deltaBlock = parseReportBlock(report, 'feature004-dirty-collision-delta-v1');
  const settledBlock = parseReportBlock(report, 'feature004-dirty-collision-settled-delta-v1');
  const scriptTransitionsBlock = parseReportBlock(report, 'feature004-dirty-collision-script-transitions-v1');
  const supersededValidatorNoteBlock = parseReportBlock(report, 'feature004-superseded-validator-note-v1');
  const ownerSettledSelftestBlock = parseReportBlock(report, 'feature004-dirty-collision-owner-settled-selftest-v1');
  const selftestSuccessorV2Block = parseReportBlock(report, 'feature004-dirty-collision-selftest-successor-v2');
  const selftestSuccessorV3Block = parseReportBlock(report, 'feature004-dirty-collision-selftest-successor-v3');
  assert.equal(sha256(selftestSuccessorV2Block.raw), SELFTEST_SUCCESSOR_V2_BLOCK_SHA256,
    'mandatory selftest successor v2 remains byte-identical before predecessor interpretation');
  assert.equal(Buffer.byteLength(selftestSuccessorV2Block.raw), SELFTEST_SUCCESSOR_V2_BLOCK_BYTE_LENGTH,
    'mandatory selftest successor v2 retains its exact marker-inclusive byte length before predecessor interpretation');
  assert.equal(sha256(baselineBlock.raw), BASELINE_BLOCK_SHA256, 'original feature004 dirty baseline block remains byte-identical');
  assert.equal(sha256(supersessionBlock.raw), SUPERSESSION_BLOCK_SHA256, 'reviewed feature004 rldata supersession block remains byte-identical');

  const baseline = baselineBlock.value;
  const supersession = supersessionBlock.value;
  const disposition = dispositionBlock.value;
  const delta = deltaBlock.value;
  const settled = settledBlock.value;
  assert.equal(baseline.contractVersion, 'feature004-dirty-baseline/v1');
  assert.deepEqual(Object.keys(supersession).sort(), [
    'capturedAt',
    'contractVersion',
    'currentRldata',
    'preservationContract',
    'scopePath',
    'securityRationale',
    'supersededHunkBodySha256',
    'supersedesContractVersion',
    'testOwnerHandoff'
  ].sort(), 'supersession record has no unknown or incomplete top-level fields');
  assert.equal(supersession.contractVersion, 'feature004-dirty-supersession/v1');
  assert.equal(supersession.supersedesContractVersion, baseline.contractVersion);
  assert.equal(supersession.scopePath, 'rldata.js');
  assert.deepEqual(supersession.supersededHunkBodySha256, EXPECTED_SUPERSEDED_RLDATA_HUNKS, 'supersession names exactly the four reviewed rldata.js hashes');
  assertUniqueHashes(supersession.supersededHunkBodySha256, 'superseded rldata.js hashes');

  const matchingBaselineRecords = baseline.tracked.filter((record) => record.path === supersession.scopePath);
  assert.equal(matchingBaselineRecords.length, 1, 'supersession path identifies exactly one original tracked record');
  const rldataBaseline = matchingBaselineRecords[0];
  supersession.supersededHunkBodySha256.forEach((hash) => {
    assert.ok(rldataBaseline.hunkBodySha256.includes(hash), `superseded hash ${hash} exists in the original rldata.js baseline`);
  });

  const currentRldata = supersession.currentRldata;
  assert.deepEqual(Object.keys(currentRldata).sort(), [
    'hunkBodySha256',
    'hunkCount',
    'indexOid',
    'staged',
    'status',
    'unstaged',
    'worktreeGitOid',
    'worktreeSha256'
  ].sort(), 'currentRldata record has no unknown or incomplete fields');
  assert.equal(currentRldata.status, ' M');
  assert.equal(currentRldata.staged, false);
  assert.equal(currentRldata.unstaged, true);
  assert.match(currentRldata.indexOid, /^[a-f0-9]{40}$/, 'currentRldata indexOid is a Git object ID');
  assert.match(currentRldata.worktreeGitOid, /^[a-f0-9]{40}$/, 'currentRldata worktreeGitOid is a Git object ID');
  assert.match(currentRldata.worktreeSha256, /^[a-f0-9]{64}$/, 'currentRldata worktreeSha256 is a SHA-256 hash');
  assertUniqueHashes(currentRldata.hunkBodySha256, 'currentRldata hunk hashes');
  assert.equal(currentRldata.hunkCount, currentRldata.hunkBodySha256.length, 'currentRldata hunk count matches its complete ordered hash list');
  validateCollisionDisposition(baseline, disposition);
  assert.equal(sha256(dispositionBlock.raw), DISPOSITION_BLOCK_SHA256, 'reviewed five-hash disposition block remains byte-identical before delta application');
  const deltaPaths = validateCollisionDelta(disposition, delta);
  assert.equal(sha256(deltaBlock.raw), DELTA_BLOCK_SHA256, 'historical collision delta block remains byte-identical before settled-delta application');
  const settledPaths = validateSettledCollisionDelta(deltaPaths, settled, false);
  assert.equal(sha256(settledBlock.raw), SETTLED_BLOCK_SHA256, 'settled collision delta block remains byte-identical before script-transition application');
  const activePaths = validateScriptTransitions(settledPaths, baseline, scriptTransitionsBlock.value);
  assert.equal(sha256(scriptTransitionsBlock.raw), SCRIPT_TRANSITIONS_BLOCK_SHA256, 'script transitions block remains byte-identical before owner-settled overlay');
  validateSupersededValidatorNote(supersededValidatorNoteBlock.value);
  assert.equal(sha256(supersededValidatorNoteBlock.raw), SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256, 'superseded validator note remains byte-identical and non-authoritative');
  const currentPaths = validateOwnerSettledSuccessor(activePaths, scriptTransitionsBlock.value,
    supersededValidatorNoteBlock.value, ownerSettledSelftestBlock.value, false);
  assert.equal(sha256(ownerSettledSelftestBlock.raw), OWNER_SETTLED_SELFTEST_BLOCK_SHA256, 'owner-settled selftest successor remains byte-identical');
  assert.equal(sha256(selftestSuccessorV2Block.raw), SELFTEST_SUCCESSOR_V2_BLOCK_SHA256,
    'mandatory selftest successor v2 remains byte-identical before v3 interpretation');
  assert.equal(Buffer.byteLength(selftestSuccessorV2Block.raw), SELFTEST_SUCCESSOR_V2_BLOCK_BYTE_LENGTH,
    'mandatory selftest successor v2 retains its exact marker-inclusive byte length');
  const successorV2Paths = validateSelftestSuccessorV2(ownerSettledSelftestBlock.value,
    selftestSuccessorV2Block.value, selftestSuccessorV2Block.value);
  assert.equal(sha256(selftestSuccessorV3Block.raw), SELFTEST_SUCCESSOR_V3_BLOCK_SHA256,
    'active selftest successor v3 remains byte-identical');
  assert.equal(Buffer.byteLength(selftestSuccessorV3Block.raw), SELFTEST_SUCCESSOR_V3_BLOCK_BYTE_LENGTH,
    'active selftest successor v3 retains its exact marker-inclusive byte length');
  const successorV3Paths = validateSelftestSuccessorV3(selftestSuccessorV2Block.value,
    selftestSuccessorV3Block.value, selftestSuccessorV3Block.value);

  return {
    activePaths,
    baseline,
    currentPaths: successorV3Paths,
    delta,
    deltaPaths,
    disposition,
    ownerSettledSelftest: ownerSettledSelftestBlock.value,
    ownerSettledPaths: currentPaths,
    scriptTransitions: scriptTransitionsBlock.value,
    settled,
    settledPaths,
    selftestSuccessorV2: selftestSuccessorV2Block.value,
    selftestSuccessorV3: selftestSuccessorV3Block.value,
    successorV2Paths,
    supersededValidatorNote: supersededValidatorNoteBlock.value,
    supersession
  };
}

function indexOid(path) {
  const entry = git(['ls-files', '-s', '--', path]).trim();
  assert.ok(entry, `${path} remains tracked in the index`);
  return entry.split(/\s+/)[1];
}

function headOid(path) {
  return git(['rev-parse', `HEAD:${path}`]).trim();
}

function lastCommit(path) {
  return git(['log', '-1', '--format=%H', '--', path]).trim();
}

function shortStatus(path) {
  const output = execFileSync('git', ['status', '--porcelain=v1', '-z', '--', path], { cwd: ROOT });
  return output.length ? output.subarray(0, 2).toString('utf8') : '';
}

function worktreeGitOid(path) {
  return execFileSync('git', ['hash-object', '--stdin'], {
    cwd: ROOT,
    encoding: 'utf8',
    input: readFileSync(resolve(ROOT, path))
  }).trim();
}

function hunkHashes(path) {
  return currentDiffHunks(path).map((hunk) => hunk.hunkBodySha256);
}

function currentPathIdentity(path) {
  const status = shortStatus(path);
  const hashes = hunkHashes(path);
  return {
    path,
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    indexOid: indexOid(path),
    worktreeGitOid: worktreeGitOid(path),
    worktreeSha256: sha256(readFileSync(resolve(ROOT, path))),
    hunkCount: hashes.length,
    hunkBodySha256: hashes
  };
}

function assertCurrentPathIdentity(checkpoint) {
  assert.deepEqual(currentPathIdentity(checkpoint.path), checkpoint, `${checkpoint.path} complete current identity matches the reviewed disposition`);
}

function assertCurrentCheckpointIdentity(checkpoint) {
  assert.deepEqual(currentPathIdentity(checkpoint.path), checkpointIdentityWithoutCommit(checkpoint),
    `${checkpoint.path} complete current worktree identity matches the owner-settled checkpoint`);
  assert.equal(headOid(checkpoint.path), checkpoint.headOid, `${checkpoint.path} current HEAD blob is exact`);
  assert.equal(lastCommit(checkpoint.path), checkpoint.lastCommit, `${checkpoint.path} current last commit is exact`);
}

function lineChunks(bytes) {
  return bytes.toString('utf8').match(/[^\n]*\n|[^\n]+$/g) || [];
}

test('Feature 004 preserves every pre-existing dirty hunk', () => {
  const { baseline, currentPaths } = parseCollisionContracts();
  assert.deepEqual(currentPaths.map((record) => record.path), [
    ...baseline.tracked.map((record) => record.path),
    baseline.untracked.path,
    baseline.volatile.path
  ], 'owner-settled matrix exactly promotes every inherited tracked, validator, and volatile path in order');
  currentPaths.forEach(assertCurrentCheckpointIdentity);
  console.log(JSON.stringify({
    contractVersion: 'feature004-dirty-collision-selftest-successor/v3',
    predecessorBlocksValidated: 9,
    currentCheckpointPaths: currentPaths.map((record) => ({
      path: record.path,
      status: record.status,
      currentHunks: record.hunkCount,
      lastCommit: record.lastCommit
    }))
  }, null, 2));
});

test('Feature 004 collision disposition parser fails closed on malformed records', () => {
  const {
    activePaths,
    baseline,
    delta,
    deltaPaths,
    disposition,
    ownerSettledSelftest,
    selftestSuccessorV2,
    selftestSuccessorV3,
    scriptTransitions,
    settled,
    supersededValidatorNote
  } = parseCollisionContracts();
  const cases = [
    ['unknown top-level field', (value) => { value.unknown = true; }],
    ['missing current-path field', (value) => { delete value.currentPaths[0].indexOid; }],
    ['duplicate accepted record', (value) => { value.acceptedOriginalHunks[1] = structuredClone(value.acceptedOriginalHunks[0]); }],
    ['additional accepted record', (value) => { value.acceptedOriginalHunks.push(structuredClone(value.acceptedOriginalHunks[0])); }],
    ['reordered accepted records', (value) => { [value.acceptedOriginalHunks[0], value.acceptedOriginalHunks[1]] = [value.acceptedOriginalHunks[1], value.acceptedOriginalHunks[0]]; }],
    ['path-mismatched accepted record', (value) => { value.acceptedOriginalHunks[0].path = 'index.html'; }],
    ['ownerless accepted record', (value) => { value.acceptedOriginalHunks[0].owners = []; }],
    ['evidence-less accepted owner', (value) => { value.acceptedOriginalHunks[0].owners[0].evidenceRefs = []; }],
    ['reordered current paths', (value) => { value.currentPaths.reverse(); }]
  ];
  for (const [label, mutate] of cases) {
    const malformed = structuredClone(disposition);
    mutate(malformed);
    assert.throws(() => validateCollisionDisposition(baseline, malformed), label);
  }

  const identityMismatch = structuredClone(disposition.currentPaths[0]);
  identityMismatch.worktreeSha256 = '0'.repeat(64);
  assert.throws(() => assertCurrentPathIdentity(identityMismatch), 'current path identity mismatch fails closed');
  const hunkOrderMismatch = structuredClone(disposition.currentPaths[1]);
  [hunkOrderMismatch.hunkBodySha256[0], hunkOrderMismatch.hunkBodySha256[1]] =
    [hunkOrderMismatch.hunkBodySha256[1], hunkOrderMismatch.hunkBodySha256[0]];
  assert.throws(() => assertCurrentPathIdentity(hunkOrderMismatch), 'current hunk reordering fails closed');

  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  for (const marker of [
    'feature004-dirty-collision-delta-v1',
    'feature004-dirty-collision-settled-delta-v1',
    'feature004-dirty-collision-script-transitions-v1',
    'feature004-superseded-validator-note-v1',
    'feature004-dirty-collision-owner-settled-selftest-v1',
    'feature004-dirty-collision-selftest-successor-v2',
    'feature004-dirty-collision-selftest-successor-v3'
  ]) {
    const block = parseReportBlock(report, marker);
    assert.throws(() => parseReportBlock(`${report}\n${block.raw}`, marker), `${marker} duplicate marker fails closed in memory`);
    assert.throws(() => parseReportBlock(report.replace(block.raw, ''), marker), `${marker} missing marker fails closed in memory`);
    const malformedRaw = block.raw.replace('```json\n{', '```json\n{ malformed');
    assert.throws(() => parseReportBlock(report.replace(block.raw, malformedRaw), marker), `${marker} malformed JSON fails closed in memory`);
  }

  const deltaCases = [
    ['delta wrong extends hash', (value) => { value.extendsContract.rawBlockSha256 = '0'.repeat(64); }],
    ['delta second path and hunk', (value) => { value.hunkTransition = [value.hunkTransition, { path: 'index.html', hunkIndex: 1 }]; }],
    ['delta marker drift', (value) => { value.ownerAttribution.markerBounds.startByte += 1; }],
    ['delta symbol drift', (value) => { value.ownerAttribution.ownedSymbols[0] = 'tdcUnknownOwnerSymbol'; }],
    ['delta current identity mismatch', (value) => { value.currentPathIdentity.worktreeSha256 = '0'.repeat(64); }],
    ['delta unknown field', (value) => { value.hunkTransition.extraPath = 'index.html'; }]
  ];
  for (const [label, mutate] of deltaCases) {
    const malformed = structuredClone(delta);
    mutate(malformed);
    assert.throws(() => validateCollisionDelta(disposition, malformed), label);
  }

  const settledCases = [
    ['settled wrong extends hash', (value) => { value.extendsContract.rawBlockSha256 = '0'.repeat(64); }],
    ['settled second path and hunk', (value) => { value.hunkTransition = [value.hunkTransition, { path: 'index.html', hunkIndex: 1 }]; }],
    ['settled marker drift', (value) => { value.ownerAttribution.markerBounds.endByteExclusive += 1; }],
    ['settled symbol drift', (value) => { value.ownerAttribution.markerBounds.symbolInventory[0] = 'tdcUnknownOwnerSymbol'; }],
    ['settled current identity mismatch', (value) => { value.currentPathIdentity.worktreeGitOid = '0'.repeat(40); }],
    ['settled reordered top-level fields', (value) => Object.fromEntries(Object.entries(value).reverse())],
    ['settled reordered evidence records', (value) => { value.ownerAttribution.toolLogEvidence.reverse(); }]
  ];
  for (const [label, mutate] of settledCases) {
    const malformed = structuredClone(settled);
    const candidate = mutate(malformed) || malformed;
    assert.throws(() => validateSettledCollisionDelta(deltaPaths, candidate, false), label);
  }

  const scriptTransitionCases = [
    ['script transitions unknown field', (value) => { value.unknown = true; }],
    ['script transitions reordered paths', (value) => { value.currentCheckpointPaths.reverse(); }],
    ['script transitions third transition', (value) => { value.pathTransitions.push(structuredClone(value.pathTransitions[0])); }],
    ['script transitions unknown commit', (value) => { value.currentCheckpointPaths[0].lastCommit = '0'.repeat(40); }],
    ['script transitions validator blob drift', (value) => { value.pathTransitions[1].indexPromotion.blobOid = '0'.repeat(40); }]
  ];
  for (const [label, mutate] of scriptTransitionCases) {
    const malformed = structuredClone(scriptTransitions);
    mutate(malformed);
    assert.throws(() => validateScriptTransitions(parseCollisionContracts().settledPaths, baseline, malformed), label);
  }

  const ownerSettledCases = [
    ['owner-settled unknown field', (value) => { value.unknown = true; }],
    ['owner-settled reordered fields', (value) => Object.fromEntries(Object.entries(value).reverse())],
    ['owner-settled missing nested field', (value) => { delete value.selftestTransition.currentIdentity.indexOid; }],
    ['owner-settled second path', (value) => { value.selftestTransition.path = 'index.html'; }],
    ['owner-settled marker drift', (value) => { value.selftestTransition.markerBounds.endByteExclusive += 1; }],
    ['owner-settled owner drift', (value) => { value.ownerAttribution.owner = 'bubbles.test'; }],
    ['owner-settled completion inference', (value) => { value.completionClaims.feature010TestPassClaim = true; }],
    ['owner-settled validator prefix drift', (value) => { value.retainedValidatorTransition.historicalPrefixContract.lineChunkCount += 1; }],
    ['owner-settled reordered paths', (value) => { value.currentCheckpointPaths.reverse(); }],
    ['owner-settled BUG-002 resume', (value) => { value.routing.bug002ResumeAllowed = true; }]
  ];
  for (const [label, mutate] of ownerSettledCases) {
    const malformed = structuredClone(ownerSettledSelftest);
    const candidate = mutate(malformed) || malformed;
    assert.throws(() => validateOwnerSettledSuccessor(activePaths, scriptTransitions, supersededValidatorNote, candidate, false), label);
  }
  const successorIdentityMismatch = structuredClone(ownerSettledSelftest.currentCheckpointPaths[1]);
  successorIdentityMismatch.worktreeSha256 = '0'.repeat(64);
  assert.throws(() => assertCurrentCheckpointIdentity(successorIdentityMismatch), 'owner-settled current path identity mismatch fails closed');

  assertEveryClosedSchemaMutationFails(selftestSuccessorV2,
    (candidate) => validateSelftestSuccessorV2(ownerSettledSelftest, candidate, selftestSuccessorV2), 'selftest successor v2');
  assertEveryClosedSchemaMutationFails(selftestSuccessorV3,
    (candidate) => validateSelftestSuccessorV3(selftestSuccessorV2, candidate, selftestSuccessorV3), 'selftest successor v3');

  const v3BoundaryCases = [
    ['v3 wrong predecessor hash', (value) => { value.extendsContract.rawBlockSha256 = '0'.repeat(64); }],
    ['v3 owner receipt promoted to planning evidence', (value) => { value.settlementSource.ownerReceiptSelftestObservation.acceptedAsPlanningTestEvidence = true; }],
    ['v3 owner receipt promoted to completion evidence', (value) => { value.settlementSource.ownerReceiptSelftestObservation.acceptedAsCompletionEvidence = true; }],
    ['v3 current status drift', (value) => { value.identityContinuity.status = ''; }],
    ['v3 staged identity inference', (value) => { value.identityContinuity.staged = true; }],
    ['v3 reordered hunk inventory', (value) => { value.orderedDiffHunks.reverse(); }],
    ['v3 hunk-one header/body confusion', (value) => { value.orderedDiffHunks[0].deletedCommittedLine = value.orderedDiffHunks[0].hunkHeaderContextLine; }],
    ['v3 hunk-one producer drift', (value) => { value.orderedDiffHunks[0].producerCommit = '943972e295b8fa93a19795e46015e5ae780b0350'; }],
    ['v3 hunk-one deletion author inference', (value) => { value.orderedDiffHunks[0].currentDeletionAuthor = 'bubbles.implement'; }],
    ['v3 hunk-two deletion author inference', (value) => { value.orderedDiffHunks[1].currentDeletionAuthor = 'bubbles.implement'; }],
    ['v3 Feature 005 owner broadening', (value) => { value.orderedDiffHunks[2].owner = 'specs/004-fx-regime-relative-value-lab'; }],
    ['v3 hunk-six deletion author inference', (value) => { value.orderedDiffHunks[5].currentDeletionAuthor = 'bubbles.implement'; }],
    ['v3 Feature 005 marker drift', (value) => { value.markerOwnership.feature005.startByte += 1; }],
    ['v3 Feature 006 hash drift', (value) => { value.markerOwnership.feature006.sliceSha256 = '0'.repeat(64); }],
    ['v3 semantic approval inference', (value) => { value.provenanceCorrection.currentDeletionSemanticApproval = true; }],
    ['v3 completion inference', (value) => { value.completionClaims.bug002TestPhasePassClaim = true; }],
    ['v3 preservation weakening', (value) => { value.preservationContract.v2RemainsMandatoryParserInput = false; }],
    ['v3 terminal mutation authorization', (value) => { value.routing.terminalStatusMutationAllowed = true; }],
    ['v3 selftest edit authorization', (value) => { value.implementationOwnerHandoff.selftestEditAllowed = true; }],
    ['v3 unknown nested field', (value) => { value.provenanceCorrection.allowUnknown = true; }]
  ];
  for (const [label, mutate] of v3BoundaryCases) {
    const malformed = structuredClone(selftestSuccessorV3);
    mutate(malformed);
    assert.throws(() => validateSelftestSuccessorV3(selftestSuccessorV2, malformed, selftestSuccessorV3), label);
  }
});

test('Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary', () => {
  const { baseline, ownerSettledSelftest } = parseCollisionContracts();
  const untracked = baseline.untracked;
  const validatorBytes = readFileSync(resolve(ROOT, untracked.path));
  const chunks = lineChunks(validatorBytes);
  const prefixBytes = Buffer.from(chunks.slice(0, untracked.lineChunkCount).join(''), 'utf8');
  const retainedValidator = ownerSettledSelftest.retainedValidatorTransition;
  assert.equal(retainedValidator.historicalStatus, untracked.status, `${untracked.path} retains its historical untracked status record`);
  assert.equal(shortStatus(untracked.path), retainedValidator.currentIdentity.status, `${untracked.path} has the exact approved tracked-clean status`);
  assertCurrentCheckpointIdentity({ path: retainedValidator.path, ...retainedValidator.currentIdentity });
  assert.ok(chunks.length >= untracked.lineChunkCount, `${untracked.path} retains at least ${untracked.lineChunkCount} line chunks`);
  assert.equal(sha256(prefixBytes), untracked.worktreeSha256, `${untracked.path} first ${untracked.lineChunkCount} line chunks remain byte-identical`);
  assert.equal(retainedValidator.historicalPrefixContract.orderedLineHashSha256, untracked.orderedLineHashSha256,
    'retained validator transition preserves the ordered-line digest record');

  const volatile = baseline.volatile;
  assert.equal(volatile.authoritativeForImplementation, false);
  assert.equal(volatile.requiredCheckpoint, 'feature004-jit-config-baseline/v1 immediately before edit');
  console.log(JSON.stringify({
    historicalUntrackedPath: untracked.path,
    currentStatus: retainedValidator.currentIdentity.status,
    currentBlobOid: retainedValidator.currentIdentity.worktreeGitOid,
    prefixLineChunks: untracked.lineChunkCount,
    prefixSha256: sha256(prefixBytes),
    volatilePath: volatile.path,
    volatileEditAttemptedByScopeOne: false
  }, null, 2));
});