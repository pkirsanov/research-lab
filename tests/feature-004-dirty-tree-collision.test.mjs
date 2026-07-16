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
const TOOL_LOG_PATH = '.specify/runtime/tool-calls.jsonl';
const SCOPE_ONE_SHARED_PATHS = new Set(['rldata.js', 'scripts/selftest.mjs', 'scripts/fetch-bars.mjs']);
const BASELINE_BLOCK_SHA256 = '3cc8105ec0175bff8e3474c47fbb85a0388591e7274411b055951873493f02ad';
const SUPERSESSION_BLOCK_SHA256 = '251685583abe5891e36c58d5e2b6fcfee2ea82d2745a9b1721ecdd770c354b2d';
const DISPOSITION_BLOCK_SHA256 = '5008d1382f9283f1308697ad2037b662aa723a0d3d348884eded09282009310e';
const DELTA_BLOCK_SHA256 = '334cae6ba3d95ad3837971ee3a402a68ffb46df23f490a31104d94cd73ea0e4b';
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
  assert.equal(sha256(slice), markerBounds.currentSliceSha256, 'Feature 006 marker slice hash is exact');
  return {
    before: bytes.subarray(0, startByte).toString('utf8'),
    slice: slice.toString('utf8'),
    after: bytes.subarray(endByteExclusive).toString('utf8')
  };
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

function validateSettledCollisionDelta(deltaPaths, settled) {
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
  const currentMarkerSlice = featureSixMarkerSlice(owner.markerBounds, true);
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
  const currentPaths = validateSettledCollisionDelta(deltaPaths, settled);

  return { baseline, currentPaths, delta, deltaPaths, disposition, settled, supersession };
}

function indexOid(path) {
  const entry = git(['ls-files', '-s', '--', path]).trim();
  assert.ok(entry, `${path} remains tracked in the index`);
  return entry.split(/\s+/)[1];
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
  const diff = git(['diff', '--no-ext-diff', '--unified=0', '--', path]);
  const hunks = [];
  let changedLines = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('@@')) {
      if (changedLines) hunks.push(changedLines);
      changedLines = [];
      continue;
    }
    if (changedLines && (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---')) changedLines.push(line);
  }
  if (changedLines) hunks.push(changedLines);
  return hunks.map((lines) => sha256(lines.join('\n')));
}

function currentPathIdentity(path) {
  const status = shortStatus(path);
  const hashes = hunkHashes(path);
  return {
    path,
    status,
    staged: status[0] !== ' ',
    unstaged: status[1] !== ' ',
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

function lineChunks(bytes) {
  return bytes.toString('utf8').match(/[^\n]*\n|[^\n]+$/g) || [];
}

test('Feature 004 preserves every pre-existing dirty hunk', () => {
  const { baseline, currentPaths, disposition, supersession } = parseCollisionContracts();
  const results = [];
  currentPaths.forEach(assertCurrentPathIdentity);
  const dispositionPaths = new Set(currentPaths.map((record) => record.path));

  for (const record of baseline.tracked) {
    const status = shortStatus(record.path);
    const currentHashes = hunkHashes(record.path);
    const missingHashes = record.hunkBodySha256.filter((hash) => !currentHashes.includes(hash));
    assert.equal(indexOid(record.path), record.indexOid, `${record.path} index blob is unchanged`);
    assert.equal(status[0], ' ', `${record.path} has no staged change`);
    if (record.path === supersession.scopePath) {
      const checkpoint = supersession.currentRldata;
      assert.deepEqual(missingHashes, supersession.supersededHunkBodySha256, 'rldata.js is missing exactly the four reviewed original hunks');
      assert.equal(status, checkpoint.status, 'rldata.js remains unstaged with the reviewed worktree status');
      assert.equal(indexOid(record.path), checkpoint.indexOid, 'rldata.js index matches the reviewed checkpoint');
      assert.equal(sha256(readFileSync(resolve(ROOT, record.path))), checkpoint.worktreeSha256, 'rldata.js bytes match the reviewed checkpoint');
      assert.equal(worktreeGitOid(record.path), checkpoint.worktreeGitOid, 'rldata.js Git worktree identity matches the reviewed checkpoint');
      assert.equal(currentHashes.length, checkpoint.hunkCount, 'rldata.js hunk count matches the reviewed checkpoint');
      assert.deepEqual(currentHashes, checkpoint.hunkBodySha256, 'rldata.js complete ordered hunk-hash multiset matches the reviewed checkpoint');
    } else if (dispositionPaths.has(record.path)) {
      const acceptedHashes = disposition.acceptedOriginalHunks
        .filter((accepted) => accepted.path === record.path)
        .map((accepted) => accepted.originalHunkBodySha256);
      assert.deepEqual(missingHashes, acceptedHashes, `${record.path} is missing exactly its reviewed original hashes in baseline order`);
      const unreviewedMissingHashes = [...missingHashes];
      for (const acceptedHash of acceptedHashes) {
        const missingIndex = unreviewedMissingHashes.indexOf(acceptedHash);
        assert.notEqual(missingIndex, -1, `${record.path} reviewed original hash is absent before its exception is consumed`);
        unreviewedMissingHashes.splice(missingIndex, 1);
      }
      assert.deepEqual(unreviewedMissingHashes, [], `${record.path} has no unreviewed missing original hash`);
    } else {
      assert.deepEqual(missingHashes, [], `${record.path} preserves every recorded hunk body as a distinct hunk`);
    }
    if (!SCOPE_ONE_SHARED_PATHS.has(record.path) && !dispositionPaths.has(record.path)) {
      assert.equal(sha256(readFileSync(resolve(ROOT, record.path))), record.worktreeSha256, `${record.path} remains byte-identical outside Scope 1`);
    }
    results.push({ path: record.path, status, recordedHunks: record.hunkBodySha256.length, currentHunks: currentHashes.length });
  }

  assert.equal(results.length, baseline.tracked.length);
  console.log(JSON.stringify({ contractVersion: baseline.contractVersion, trackedPaths: results }, null, 2));
});

test('Feature 004 collision disposition parser fails closed on malformed records', () => {
  const { baseline, delta, deltaPaths, disposition, settled } = parseCollisionContracts();
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
  for (const marker of ['feature004-dirty-collision-delta-v1', 'feature004-dirty-collision-settled-delta-v1']) {
    const block = parseReportBlock(report, marker);
    assert.throws(() => parseReportBlock(`${report}\n${block.raw}`, marker), `${marker} duplicate marker fails closed in memory`);
    assert.throws(() => parseReportBlock(report.replace(block.raw, ''), marker), `${marker} missing marker fails closed in memory`);
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
    assert.throws(() => validateSettledCollisionDelta(deltaPaths, candidate), label);
  }
});

test('Feature 004 preserves the untracked validator prefix and volatile config boundary', () => {
  const { baseline } = parseCollisionContracts();
  const untracked = baseline.untracked;
  const validatorBytes = readFileSync(resolve(ROOT, untracked.path));
  const chunks = lineChunks(validatorBytes);
  const prefixBytes = Buffer.from(chunks.slice(0, untracked.lineChunkCount).join(''), 'utf8');
  assert.equal(shortStatus(untracked.path), '??', `${untracked.path} remains untracked and unstaged`);
  assert.ok(chunks.length >= untracked.lineChunkCount, `${untracked.path} retains at least ${untracked.lineChunkCount} line chunks`);
  assert.equal(sha256(prefixBytes), untracked.worktreeSha256, `${untracked.path} first ${untracked.lineChunkCount} line chunks remain byte-identical`);
  assert.match(untracked.orderedLineHashSha256, /^[a-f0-9]{64}$/, 'report retains the ordered-line digest record');

  const volatile = baseline.volatile;
  assert.equal(volatile.authoritativeForImplementation, false);
  assert.equal(volatile.requiredCheckpoint, 'feature004-jit-config-baseline/v1 immediately before edit');
  console.log(JSON.stringify({
    untrackedPath: untracked.path,
    prefixLineChunks: untracked.lineChunkCount,
    prefixSha256: sha256(prefixBytes),
    volatilePath: volatile.path,
    volatileEditAttemptedByScopeOne: false
  }, null, 2));
});