import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  brotliCompressSync,
  brotliDecompressSync,
  constants as zlibConstants
} from 'node:zlib';

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
const SCRIPT_TRANSITIONS_BLOCK_SHA256 = '0bb8cbcf0dbc40c028f99bcb5340f7438f6d175d83309b41bd2d7b3936f162d3';
const SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256 = '7beb0c5892b6f26b52f24c229f5b2bc340befb6141683ecc92756174f02f9870';
const OWNER_SETTLED_SELFTEST_BLOCK_SHA256 = '50f40dab7a9112bdfae30eddaa73f1bc6543383ea8dbce2b7920028ed2d32508';
const SELFTEST_SUCCESSOR_V2_BLOCK_SHA256 = '5484e14998c3cec0105f04413dc9f25a580658d272647e2e90b780b4d5e13ce4';
const SELFTEST_SUCCESSOR_V2_BLOCK_BYTE_LENGTH = 35844;
const SELFTEST_SUCCESSOR_V3_BLOCK_SHA256 = '6ebeebb0c28965925ff6a97310f380ccfce17f62e65e4794b383bf2eb2ad2f73';
const SELFTEST_SUCCESSOR_V3_BLOCK_BYTE_LENGTH = 18606;
const DURABLE_EVIDENCE_BLOCK_SHA256 = '3bf9798b5896bab9a71980db1d54a34873b4de69638e475310e5dc38c6f60bfd';
const CURRENT_IDENTITY_V4_BLOCK_SHA256 = '546554047d9c8170a746f86fbd4a46a008a9b99ed10b5aa2f1f0e6d6495542b6';
const CURRENT_IDENTITY_V5_BLOCK_SHA256 = '511bfd2386ea7cd76020e7d4c604e160e83f7d5843c0a4fc62f2c64750ce4cd6';
const FOREIGN_ROADMAP_V6_BLOCK_SHA256 = '287a11c37080dc52f1ed0cd01ce40cd09ff31957cf14df30a89de240eb78d740';
const FOREIGN_SET_V7_BLOCK_SHA256 = 'aec36d5c5287c4b84a81f56eff2d1e8ab6131ac699f048590bb63377009d7239';
const POST_COMMIT_V9_BLOCK_SHA256 = '8101b4b8f0c0c6da62d9c391c0e65e696294a3e90fd6e04b261c4647b31c6356';
const POST_COMMIT_V10_BLOCK_SHA256 = '109efb870bc5f352088bfaf4f8b3df1b54e9cea9ad36f97df7508feefe287497';
const POST_COMMIT_V11_BLOCK_SHA256 = '491a45cade63f7182f7f6381ed019906084efafc3a6ece1f4c077c27d5790c24';
const POST_COMMIT_V12_BLOCK_SHA256 = 'b0153c52a87b4a6b99166bf73e3353ae0e5aabc0b04246149255bb5d9b34333d';
const POST_COMMIT_V13_BLOCK_SHA256 = '2de13393faa01e6495430723333207cbdaa0b3a1ae9ef9acf67b6c1bc72a7a94';
const POST_COMMIT_V14_BLOCK_SHA256 = '980fb7b1fd3f47c8db2d82246d6b85e0bd389c0ed3816de2bf7f7738c4069b71';
const POST_COMMIT_V15_BLOCK_SHA256 = '21e2c072d4a46535dea264ff48f1449d16eb4d4958b489211354c1f321fcf70d';
const FOREIGN_SET_V7_BLOCK_BYTE_LENGTH = 15002;
const IMMUTABLE_PREDECESSOR_BLOCKS = [
  ['feature004-dirty-baseline-v1', BASELINE_BLOCK_SHA256],
  ['feature004-dirty-supersession-v1', SUPERSESSION_BLOCK_SHA256],
  ['feature004-dirty-collision-disposition-v1', DISPOSITION_BLOCK_SHA256],
  ['feature004-dirty-collision-delta-v1', DELTA_BLOCK_SHA256],
  ['feature004-dirty-collision-settled-delta-v1', SETTLED_BLOCK_SHA256],
  ['feature004-dirty-collision-script-transitions-v1', SCRIPT_TRANSITIONS_BLOCK_SHA256],
  ['feature004-superseded-validator-note-v1', SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256],
  ['feature004-dirty-collision-owner-settled-selftest-v1', OWNER_SETTLED_SELFTEST_BLOCK_SHA256],
  ['feature004-dirty-collision-selftest-successor-v2', SELFTEST_SUCCESSOR_V2_BLOCK_SHA256],
  ['feature004-dirty-collision-selftest-successor-v3', SELFTEST_SUCCESSOR_V3_BLOCK_SHA256]
].map(([marker, rawBlockSha256]) => ({ marker, rawBlockSha256 }));
const DURABLE_STABLE_KEY_FIELDS = [
  'sessionId',
  'agent',
  'spec',
  'scope',
  'cmd',
  'exitCode',
  'stdoutHash',
  'tags'
];
const DURABLE_RECEIPT_FIELDS = [
  ...DURABLE_STABLE_KEY_FIELDS,
  'rawOutputLines',
  'rawOutputSha256'
];
const REQUIRED_SCOPE_ONE_PATHS = [
  'rlfx.js',
  'fx-regime-universe.json',
  'fx-vehicle-universe.json',
  'rldata.js',
  'rlexperience.js',
  'rlviews.js',
  'rlbrief.js',
  'rljourney.js',
  'scripts/fetch-bars.mjs',
  'scripts/selftest.mjs',
  'tests/fx-regime-relative-value-lab.spec.mjs',
  'tests/feature-004-dirty-tree-collision.test.mjs',
  'tests/feature-004-vehicle-universe.test.mjs',
  'tests/feature-004-tool-control-binding.test.mjs',
  'tests/feature-004-brief-eligibility.test.mjs',
  'tests/feature-004-journey-evidence-refresh.test.mjs',
  'tests/fixtures/fx-regime/commonjs-determinism-input.json',
  'tests/fixtures/fx-regime/foundation-cases.json',
  'tests/fixtures/fx-regime/foundation-harness.html'
];
const COLLISION_PARSER_PATH = 'tests/feature-004-dirty-tree-collision.test.mjs';
const NORMALIZED_SELF_PIN_NAMES = [
  'DURABLE_EVIDENCE_BLOCK_SHA256',
  'CURRENT_IDENTITY_V4_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V2 = [
  ...NORMALIZED_SELF_PIN_NAMES,
  'CURRENT_IDENTITY_V5_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V3 = [
  ...NORMALIZED_SELF_PIN_NAMES_V2,
  'FOREIGN_ROADMAP_V6_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V4 = [
  ...NORMALIZED_SELF_PIN_NAMES_V3,
  'FOREIGN_SET_V7_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V5 = [
  ...NORMALIZED_SELF_PIN_NAMES_V4,
  'POST_COMMIT_V9_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V6 = [
  ...NORMALIZED_SELF_PIN_NAMES_V5,
  'POST_COMMIT_V10_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V7 = [
  ...NORMALIZED_SELF_PIN_NAMES_V6,
  'POST_COMMIT_V11_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V8 = [
  ...NORMALIZED_SELF_PIN_NAMES_V7,
  'POST_COMMIT_V12_BLOCK_SHA256'
];
const NORMALIZED_SELF_PIN_NAMES_V9 = [
  ...NORMALIZED_SELF_PIN_NAMES_V8,
  'POST_COMMIT_V13_BLOCK_SHA256'
];
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
  'Require hunk 1\'s retained validateBriefPayload import to be classified only as header context from commit db06c29650ba351770297acefa658f51cbc4ff00, and require the actual deleted buildCompanyFundamentalsOwnerRead import to resolve to Feature 010 Scope 6 commit 4c677c88b8d5f863f3409aa0e33133bc15fa25b6 with its exact subject while current deletion author remains unknown and no approval is inferred.',
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

function assertSha256(value, label) {
  assert.match(value, /^[a-f0-9]{64}$/, `${label} is a lowercase SHA-256 hash`);
}

function assertPinnedReportBlock(raw, expectedSha256, label) {
  assert.equal(sha256(raw), expectedSha256, `${label} matches its marker-inclusive no-trailing-newline pin`);
}

function durableStableKey(receipt) {
  return JSON.stringify(DURABLE_STABLE_KEY_FIELDS.map((field) => receipt[field]));
}

function assertDurableReceipt(receipt, index) {
  const label = `durable evidence receipts[${index}]`;
  assertExactOrderedKeys(receipt, DURABLE_RECEIPT_FIELDS, label);
  assertNonemptyString(receipt.sessionId, `${label}.sessionId`);
  assert.equal(receipt.agent, 'bubbles.test', `${label}.agent is test-owned`);
  assert.equal(receipt.spec, '004-fx-regime-relative-value-lab', `${label}.spec is exact`);
  assert.equal(receipt.scope, 'SCOPE-01', `${label}.scope is exact`);
  assertNonemptyString(receipt.cmd, `${label}.cmd`);
  assert.ok(Number.isInteger(receipt.exitCode), `${label}.exitCode is an integer`);
  assertSha256(receipt.stdoutHash, `${label}.stdoutHash`);
  assert.ok(Array.isArray(receipt.tags) && receipt.tags.length > 0, `${label}.tags is a nonempty ordered array`);
  receipt.tags.forEach((tag, tagIndex) => assertNonemptyString(tag, `${label}.tags[${tagIndex}]`));
  assert.equal(new Set(receipt.tags).size, receipt.tags.length, `${label}.tags contains no duplicate`);
  assert.ok(Array.isArray(receipt.rawOutputLines), `${label}.rawOutputLines is an array`);
  assert.ok(receipt.rawOutputLines.length >= 10, `${label}.rawOutputLines contains at least ten literal lines`);
  receipt.rawOutputLines.forEach((line, lineIndex) => {
    assert.equal(typeof line, 'string', `${label}.rawOutputLines[${lineIndex}] is a string`);
    assert.ok(!line.includes('\n') && !line.includes('\r'), `${label}.rawOutputLines[${lineIndex}] is exactly one literal line`);
  });
  assertSha256(receipt.rawOutputSha256, `${label}.rawOutputSha256`);
  assert.equal(sha256(receipt.rawOutputLines.join('\n')), receipt.rawOutputSha256,
    `${label}.rawOutputSha256 matches the exact LF-joined literal output`);
  assert.equal(receipt.rawOutputSha256, receipt.stdoutHash,
    `${label}.rawOutputSha256 equals the admitted tool-log stdoutHash`);
}

function validateDurableEvidenceBlock(durable, canonical = durable) {
  assertExactCanonicalContract(durable, canonical, 'durable evidence block');
  assertExactOrderedKeys(durable, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'immutablePredecessorBlocks',
    'sourceSelection',
    'receipts'
  ], 'durable evidence block');
  assert.equal(durable.contractVersion, 'feature004-durable-evidence-admission/v1');
  assert.equal(durable.findingId, 'F-004-EVIDENCE-DURABILITY');
  assertUtcTimestamp(durable.capturedAt, 'durable evidence capturedAt');
  assert.equal(durable.immutablePredecessorBlocks.length, IMMUTABLE_PREDECESSOR_BLOCKS.length,
    'durable evidence hash-links all ten immutable predecessors');
  durable.immutablePredecessorBlocks.forEach((record, index) => {
    assertExactOrderedKeys(record, ['marker', 'rawBlockSha256'], `durable evidence immutablePredecessorBlocks[${index}]`);
  });
  assert.deepEqual(durable.immutablePredecessorBlocks, IMMUTABLE_PREDECESSOR_BLOCKS,
    'durable evidence preserves all ten predecessor links in exact order');
  assertExactOrderedKeys(durable.sourceSelection, [
    'currentToolLogPath',
    'stableKeyFields',
    'tagComparison',
    'markdownEligibility',
    'minimumRawLinesPerReceipt',
    'rawOutputHashInput',
    'blockHashInput'
  ], 'durable evidence sourceSelection');
  assert.deepEqual(durable.sourceSelection, {
    currentToolLogPath: TOOL_LOG_PATH,
    stableKeyFields: DURABLE_STABLE_KEY_FIELDS,
    tagComparison: 'exact-ordered-equality',
    markdownEligibility: 'log-absent-or-zero-full-key-matches-across-entire-receipt-set',
    minimumRawLinesPerReceipt: 10,
    rawOutputHashInput: 'rawOutputLines-joined-with-lf',
    blockHashInput: 'marker-inclusive-no-trailing-newline'
  }, 'durable evidence source selection is exact and fail-closed');
  assert.ok(Array.isArray(durable.receipts) && durable.receipts.length > 0,
    'durable evidence declares at least one receipt');
  durable.receipts.forEach(assertDurableReceipt);
  assert.equal(new Set(durable.receipts.map(durableStableKey)).size, durable.receipts.length,
    'durable evidence receipt stable keys are unique');
}

function parseToolLogRows(toolLogText) {
  return toolLogText.split(/\r?\n/).flatMap((line, index) => {
    if (!line) return [];
    let value;
    assert.doesNotThrow(() => { value = JSON.parse(line); }, `tool-log row ${index + 1} is valid JSON`);
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), `tool-log row ${index + 1} is an object`);
    return [{ line: index + 1, raw: line, value }];
  });
}

function toolLogRowMatchesReceipt(row, receipt) {
  return DURABLE_STABLE_KEY_FIELDS.every((field) => field === 'tags'
    ? JSON.stringify(row[field]) === JSON.stringify(receipt[field])
    : row[field] === receipt[field]);
}

function resolveDurableEvidence(durable, options = {}) {
  validateDurableEvidenceBlock(durable);
  const toolLogExists = options.toolLogExists ?? existsSync(resolve(ROOT, TOOL_LOG_PATH));
  const toolLogText = options.toolLogText ?? (toolLogExists ? readFileSync(resolve(ROOT, TOOL_LOG_PATH), 'utf8') : '');
  const rows = toolLogExists ? parseToolLogRows(toolLogText) : [];
  const matchedRows = durable.receipts.map((receipt) => rows.filter(({ value }) => toolLogRowMatchesReceipt(value, receipt)));
  const matchedReceiptCount = matchedRows.filter((matches) => matches.length > 0).length;
  const duplicateReceiptCount = matchedRows.filter((matches) => matches.length > 1).length;
  assert.equal(duplicateReceiptCount, 0, 'current tool-log contains no duplicate complete stable key');
  assert.ok(matchedReceiptCount === 0 || matchedReceiptCount === durable.receipts.length,
    'current tool-log has either zero or all declared full-key receipt matches; a nonempty proper subset fails closed');

  let source;
  let selected;
  if (matchedReceiptCount === durable.receipts.length) {
    selected = matchedRows.map(([match], index) => {
      const declaration = durable.receipts[index];
      for (const field of DURABLE_STABLE_KEY_FIELDS) {
        assert.deepEqual(match.value[field], declaration[field], `current tool-log selected receipt ${index} matches exact ${field}`);
      }
      if ('rawOutputLines' in match.value || 'rawOutputSha256' in match.value) {
        assert.deepEqual(match.value.rawOutputLines, declaration.rawOutputLines,
          `current tool-log selected receipt ${index} does not contradict declared raw output`);
        assert.equal(match.value.rawOutputSha256, declaration.rawOutputSha256,
          `current tool-log selected receipt ${index} does not contradict declared raw output hash`);
      }
      return match.value;
    });
    source = 'current-tool-log';
  } else {
    selected = durable.receipts;
    source = 'committed-markdown';
  }
  const selectedByStableKey = new Map(selected.map((receipt) => [durableStableKey(receipt), receipt]));

  return {
    source,
    receipts: durable.receipts,
    assertHistorical(expected, label) {
      const historicalSelectorFields = new Set([
        'line', 'sessionId', 'agent', 'spec', 'scope', 'command', 'commandClass', 'exitCode', 'stdoutHash', 'tags'
      ]);
      assert.ok(Object.keys(expected).every((field) => historicalSelectorFields.has(field)),
        `${label} retains only the closed immutable historical selector fields`);
      assert.ok(Number.isInteger(expected.line) && expected.line > 0,
        `${label} retains its historical absolute line as immutable content only`);
      assert.equal(selectedByStableKey.size, durable.receipts.length,
        `${label} resolves through the complete admitted ${source} receipt set`);
      durable.receipts.forEach((declaration, index) => {
        const admitted = selectedByStableKey.get(durableStableKey(declaration));
        assert.ok(admitted, `${label} resolves durable declaration ${index} through ${source}`);
        for (const field of DURABLE_STABLE_KEY_FIELDS) {
          assert.deepEqual(admitted[field], declaration[field], `${label} durable declaration ${index} resolves exact ${field}`);
        }
      });
    }
  };
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

function * deepCloneClosedSchemaMutationCandidates(canonical, label) {
  function * visit(node, path) {
    if (Array.isArray(node)) {
      const missing = structuredClone(canonical);
      if (node.length > 0) valueAtPath(missing, path).pop();
      else valueAtPath(missing, path).push('__adversarial');
      yield {
        candidate: missing,
        label: `${label} rejects changed array cardinality at ${path.join('.')}`,
        mutationPath: path,
        operation: 'array-cardinality'
      };
      if (node.length > 0) {
        const extra = structuredClone(canonical);
        valueAtPath(extra, path).push(structuredClone(node[0]));
        yield {
          candidate: extra,
          label: `${label} rejects extra array record at ${path.join('.')}`,
          mutationPath: path,
          operation: 'array-extra'
        };
        if (node.length > 1) {
          const reordered = structuredClone(canonical);
          valueAtPath(reordered, path).reverse();
          yield {
            candidate: reordered,
            label: `${label} rejects reordered array records at ${path.join('.')}`,
            mutationPath: path,
            operation: 'array-reorder'
          };
        }
      }
      for (let index = 0; index < node.length; index += 1) {
        yield * visit(node[index], [...path, index]);
      }
      return;
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        const missing = structuredClone(canonical);
        delete valueAtPath(missing, path)[key];
        yield {
          candidate: missing,
          label: `${label} rejects missing field ${[...path, key].join('.')}`,
          mutationPath: path,
          operation: 'object-missing'
        };
      }
      const unknown = structuredClone(canonical);
      valueAtPath(unknown, path).__unknown = true;
      yield {
        candidate: unknown,
        label: `${label} rejects unknown field at ${path.join('.') || '<root>'}`,
        mutationPath: path,
        operation: 'object-unknown'
      };
      if (Object.keys(node).length > 1) {
        const reordered = structuredClone(canonical);
        const reversed = Object.fromEntries(Object.entries(valueAtPath(reordered, path)).reverse());
        const candidate = replaceAtPath(reordered, path, reversed);
        yield {
          candidate,
          label: `${label} rejects reordered fields at ${path.join('.') || '<root>'}`,
          mutationPath: path,
          operation: 'object-reorder'
        };
      }
      for (const [key, child] of Object.entries(node)) yield * visit(child, [...path, key]);
      return;
    }
    const changed = structuredClone(canonical);
    const candidate = replaceAtPath(changed, path, changedLeafValue(node));
    yield {
      candidate,
      label: `${label} rejects changed field ${path.join('.')}`,
      mutationPath: path,
      operation: 'leaf-change'
    };
  }
  yield * visit(canonical, []);
}

function cloneContainer(value) {
  if (Array.isArray(value)) return value.slice();
  assert.ok(value && typeof value === 'object', 'path-copy target is a container');
  return { ...value };
}

function copyMutationPath(value, path, mutateTarget, depth = 0) {
  if (depth === path.length) return mutateTarget(value);
  const copy = cloneContainer(value);
  const key = path[depth];
  copy[key] = copyMutationPath(value[key], path, mutateTarget, depth + 1);
  return copy;
}

function * pathCopyClosedSchemaMutationCandidates(canonical, label) {
  function candidate(path, operation, message, mutateTarget) {
    return {
      candidate: copyMutationPath(canonical, path, mutateTarget),
      label: message,
      mutationPath: path,
      operation
    };
  }

  function * visit(node, path) {
    if (Array.isArray(node)) {
      yield candidate(path, 'array-cardinality',
        `${label} rejects changed array cardinality at ${path.join('.')}`, (target) => {
          const copy = target.slice();
          if (copy.length > 0) copy.pop();
          else copy.push('__adversarial');
          return copy;
        });
      if (node.length > 0) {
        yield candidate(path, 'array-extra',
          `${label} rejects extra array record at ${path.join('.')}`, (target) => {
            const copy = target.slice();
            copy.push(target[0]);
            return copy;
          });
        if (node.length > 1) {
          yield candidate(path, 'array-reorder',
            `${label} rejects reordered array records at ${path.join('.')}`, (target) =>
              target.slice().reverse());
        }
      }
      for (let index = 0; index < node.length; index += 1) {
        yield * visit(node[index], [...path, index]);
      }
      return;
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        yield candidate(path, 'object-missing',
          `${label} rejects missing field ${[...path, key].join('.')}`, (target) => {
            const copy = { ...target };
            delete copy[key];
            return copy;
          });
      }
      yield candidate(path, 'object-unknown',
        `${label} rejects unknown field at ${path.join('.') || '<root>'}`, (target) => ({
          ...target,
          __unknown: true
        }));
      if (Object.keys(node).length > 1) {
        yield candidate(path, 'object-reorder',
          `${label} rejects reordered fields at ${path.join('.') || '<root>'}`, (target) =>
            Object.fromEntries(Object.entries(target).reverse()));
      }
      for (const [key, child] of Object.entries(node)) yield * visit(child, [...path, key]);
      return;
    }
    yield candidate(path, 'leaf-change', `${label} rejects changed field ${path.join('.')}`,
      (target) => changedLeafValue(target));
  }
  yield * visit(canonical, []);
}

let closedSchemaMutationGeneratorEquivalencePassed = false;

function assertClosedSchemaMutationGeneratorEquivalence() {
  if (closedSchemaMutationGeneratorEquivalencePassed) return;
  const fixture = {
    nested: {
      items: [
        { value: 'alpha', stable: { retained: true } },
        { value: 'beta', stable: { retained: false } }
      ],
      enabled: true
    },
    untouched: { identity: 'preserved' }
  };
  const digestBefore = sha256(JSON.stringify(fixture));
  const reference = [...deepCloneClosedSchemaMutationCandidates(fixture, 'equivalence fixture')];
  const optimized = [...pathCopyClosedSchemaMutationCandidates(fixture, 'equivalence fixture')];
  assert.deepEqual(optimized.map(({ label }) => label), reference.map(({ label }) => label),
    'path-copy generator preserves exact ordered labels');
  assert.equal(optimized.length, reference.length, 'path-copy generator preserves candidate count');
  assert.deepEqual(optimized.map(({ candidate }) => JSON.stringify(candidate)),
    reference.map(({ candidate }) => JSON.stringify(candidate)),
  'path-copy generator preserves byte-identical ordered candidate JSON');
  assert.equal(sha256(JSON.stringify(fixture)), digestBefore,
    'candidate generation preserves the canonical fixture digest');
  const leaf = optimized.find(({ operation, mutationPath }) => operation === 'leaf-change'
    && JSON.stringify(mutationPath) === JSON.stringify(['nested', 'items', 0, 'value']));
  assert.ok(leaf, 'equivalence fixture exposes the canonical deep leaf mutation');
  assert.notStrictEqual(leaf.candidate, fixture, 'path-copy mutation copies the root ancestor');
  assert.notStrictEqual(leaf.candidate.nested, fixture.nested,
    'path-copy mutation copies the nested object ancestor');
  assert.notStrictEqual(leaf.candidate.nested.items, fixture.nested.items,
    'path-copy mutation copies the array ancestor');
  assert.notStrictEqual(leaf.candidate.nested.items[0], fixture.nested.items[0],
    'path-copy mutation copies the changed record ancestor');
  assert.strictEqual(leaf.candidate.nested.items[0].stable, fixture.nested.items[0].stable,
    'path-copy mutation preserves an untouched child identity inside the changed record');
  assert.strictEqual(leaf.candidate.nested.items[1], fixture.nested.items[1],
    'path-copy mutation preserves an untouched array entry identity');
  assert.strictEqual(leaf.candidate.untouched, fixture.untouched,
    'path-copy mutation preserves the untouched top-level container identity');
  closedSchemaMutationGeneratorEquivalencePassed = true;
}

function assertEveryClosedSchemaMutationFails(canonical, validate, label) {
  assertClosedSchemaMutationGeneratorEquivalence();
  for (const { candidate, label: mutationLabel } of pathCopyClosedSchemaMutationCandidates(canonical, label)) {
    assert.throws(() => validate(candidate), mutationLabel);
  }
}

function assertUtcTimestamp(value, label) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, `${label} is UTC ISO-8601`);
}

function assertNonemptyString(value, label) {
  assert.equal(typeof value, 'string', `${label} is a string`);
  assert.ok(value.length > 0, `${label} is nonempty`);
}

function assertToolLogEvidence(expected, label, durableEvidence) {
  assert.ok(Number.isInteger(expected.line) && expected.line > 0,
    `${label} preserves its immutable historical absolute line selector`);
  durableEvidence.assertHistorical(expected, label);
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

function assertToolLogReference(reference, label, durableEvidence) {
  assertToolLogEvidence(parseToolLogReference(reference), label, durableEvidence);
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
    ['db06c29650ba351770297acefa658f51cbc4ff00', 'pkirsanov', '2026-07-16T12:01:36-07:00', 'feat: expand research lab capabilities and automation'],
    ['56bf73eefe1b8369dc3e0778cc7c4d9ba6f0a8a3', 'pkirsanov', '2026-07-16T11:18:43-07:00', 'compact market brief lane inputs'],
    ['d7fd1d02e99c748ab5366c5a8e6de1192b24b823', 'pkirsanov', '2026-07-16T11:33:40-07:00', 'persist automatic ticker cache refreshes'],
    ['932efdd9912bfc264ae96ded90f6410fe4cc5537', 'pkirsanov', '2026-07-16T09:35:08-07:00', 'fix market brief scheduled publication'],
    ['71e98b99e0dd9e3a9eec9be7cc6b6f87fe5c90ef', 'pkirsanov', '2026-07-15T12:32:33-07:00', 'market-brief: Tier-A data-only refresh 2026-07-15 15:32 EDT (pre-close)']
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
    commit: 'db06c29650ba351770297acefa658f51cbc4ff00',
    authorName: 'pkirsanov',
    authorEmail: 'pkirsanov@users.noreply.github.com',
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
    commit: '932efdd9912bfc264ae96ded90f6410fe4cc5537',
    authorName: 'pkirsanov',
    authorEmail: 'pkirsanov@users.noreply.github.com',
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
    commit: '932efdd9912bfc264ae96ded90f6410fe4cc5537',
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
  assert.deepEqual({
    agent: executionMatches[0].agent,
    startedAt: executionMatches[0].startedAt,
    finishedAt: executionMatches[0].finishedAt,
    statusBefore: executionMatches[0].statusBefore,
    statusAfter: executionMatches[0].statusAfter,
    scopesCompleted: executionMatches[0].scopesCompleted,
    completionClaims: {
      scopeComplete: executionMatches[0].exactEvidence.scopeComplete,
      featureComplete: executionMatches[0].exactEvidence.featureComplete,
      bug003Complete: executionMatches[0].exactEvidence.bug003Complete,
      bug002Complete: executionMatches[0].exactEvidence.bug002Complete
    }
  }, {
    agent: 'bubbles.implement',
    startedAt: '2026-07-17T00:14:13Z',
    finishedAt: '2026-07-17T00:34:15Z',
    statusBefore: 'not_started',
    statusAfter: 'not_started',
    scopesCompleted: [],
    completionClaims: {
      scopeComplete: false,
      featureComplete: false,
      bug003Complete: false,
      bug002Complete: false
    }
  }, 'Feature 010 historical owner-return entry remains exact after later certification');
  assert.equal(featureTenState.status, 'done', 'Feature 010 current status is the exact certified successor');
  assert.equal(featureTenState.certifiedAt, '2026-07-30T14:41:30Z', 'Feature 010 certification timestamp is exact');
  assert.equal(featureTenState.certification.status, 'done', 'Feature 010 current certification status is done');
  assert.deepEqual(featureTenState.execution.scopeProgress.map(({ scope, status }) => ({ scope, status })), [
    { scope: 1, status: 'done' },
    { scope: 2, status: 'done' },
    { scope: 3, status: 'done' },
    { scope: 4, status: 'done' },
    { scope: 5, status: 'done' },
    { scope: 6, status: 'done' },
    { scope: 7, status: 'done' },
    { scope: 8, status: 'done' }
  ], 'Feature 010 current execution has exactly eight ordered done scopes');
  assert.equal(featureTenState.certification.completedScopes.length, 8, 'Feature 010 current certification has exactly eight completed scopes');
  assert.equal(new Set(featureTenState.certification.completedScopes).size, 8, 'Feature 010 current certification completed scopes are unique');
  assert.deepEqual(featureTenState.certification.certifiedCompletedPhases, [
    'implement',
    'test',
    'regression',
    'simplify',
    'gaps',
    'harden',
    'stabilize',
    'security',
    'validate',
    'audit',
    'chaos',
    'docs',
    'spec-review'
  ], 'Feature 010 current certification phases are exact and ordered');

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

function parseDiffHunks(diff) {
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

function currentDiffHunks(path) {
  return parseDiffHunks(git(['diff', '--no-ext-diff', '--unified=0', '--', path]));
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
  assert.equal(hunkOne.hunkHeaderContextProducerCommit, 'db06c29650ba351770297acefa658f51cbc4ff00');
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
    hunkHeaderContextProducerCommit: 'db06c29650ba351770297acefa658f51cbc4ff00',
    correctedCommittedProducer: 'specs/010-company-fundamentals-and-brief-lab Scope 6',
    correctedProducerCommit: '4c677c88b8d5f863f3409aa0e33133bc15fa25b6',
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

function validateCollisionDelta(disposition, delta, durableEvidence) {
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
  owner.toolLogRefs.forEach((reference, index) => assertToolLogReference(reference,
    `collision delta toolLogRefs[${index}]`, durableEvidence));

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
  assertToolLogReference(delta.aggregateObservation.toolLogRef, 'collision delta aggregate toolLogRef', durableEvidence);
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
  delta.testOwnerHandoff.evidenceRefs.forEach((reference, index) => assertToolLogReference(reference,
    `collision delta testOwnerHandoff.evidenceRefs[${index}]`, durableEvidence));
  assert.deepEqual(delta.testOwnerHandoff.requirements, EXPECTED_DELTA_HANDOFF, 'collision delta retains every parser requirement in order');
  return deltaPaths;
}

function validateSettledCollisionDelta(deltaPaths, settled, durableEvidence, requireHistoricalOffsets = true) {
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
    assertToolLogEvidence(record, `settled collision delta toolLogEvidence[${index}]`, durableEvidence);
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
  normalizedCollisionParserIdentity();
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
  const durableEvidenceBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const currentIdentityV4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  assertPinnedReportBlock(durableEvidenceBlock.raw, DURABLE_EVIDENCE_BLOCK_SHA256, 'durable evidence block');
  validateDurableEvidenceBlock(durableEvidenceBlock.value);
  const durableEvidence = resolveDurableEvidence(durableEvidenceBlock.value);
  assertPinnedReportBlock(currentIdentityV4Block.raw, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block');
  validateCurrentIdentityV4(currentIdentityV4Block.value);
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
  const deltaPaths = validateCollisionDelta(disposition, delta, durableEvidence);
  assert.equal(sha256(deltaBlock.raw), DELTA_BLOCK_SHA256, 'historical collision delta block remains byte-identical before settled-delta application');
  const settledPaths = validateSettledCollisionDelta(deltaPaths, settled, durableEvidence, false);
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
    durableEvidence,
    durableEvidenceBlock: durableEvidenceBlock.value,
    durableEvidenceRaw: durableEvidenceBlock.raw,
    currentIdentityV4: currentIdentityV4Block.value,
    currentIdentityV4Raw: currentIdentityV4Block.raw,
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

function parseNormalizedSelfPins(source) {
  const familyAssignments = [...source.matchAll(/^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V4)[A-Z0-9_]*) = '([^']*)';$/gm)];
  assert.deepEqual(familyAssignments.map((match) => match[1]), NORMALIZED_SELF_PIN_NAMES,
    'normalized-self-pins/v1 contains exactly the two named pin constants in exact order');
  familyAssignments.forEach((match, index) => {
    assertSha256(match[2], `normalized-self-pins/v1 ${NORMALIZED_SELF_PIN_NAMES[index]}`);
  });
  return familyAssignments;
}

function normalizeSelfPinValues(value) {
  const pinPattern = new RegExp(`(const (?:${NORMALIZED_SELF_PIN_NAMES.join('|')}) = ')[^']*(';)$`, 'gm');
  return value.replace(pinPattern, `$1${'0'.repeat(64)}$2`);
}

function normalizedSelfSourceIdentity(source) {
  parseNormalizedSelfPins(source);
  const normalizedBytes = Buffer.from(normalizeSelfPinValues(source), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes)
  };
}

function normalizedCollisionParserIdentity() {
  const bytes = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH));
  const source = bytes.toString('utf8');
  const normalizedSource = normalizedSelfSourceIdentity(source);
  const normalizedDiff = normalizeSelfPinValues(git(['diff', '--no-ext-diff', '--unified=0', '--', COLLISION_PARSER_PATH]));
  const hunks = parseDiffHunks(normalizedDiff);
  return {
    path: COLLISION_PARSER_PATH,
    mode: 'normalized-self-pins/v1',
    pinLiterals: NORMALIZED_SELF_PIN_NAMES,
    normalizedPinValue: '0'.repeat(64),
    worktreeGitOid: normalizedSource.worktreeGitOid,
    worktreeSha256: normalizedSource.worktreeSha256,
    hunkCount: hunks.length,
    hunkBodySha256: hunks.map((hunk) => hunk.hunkBodySha256)
  };
}

function pathIsTracked(path) {
  return git(['ls-files', '--', path]).trim() === path;
}

function currentV4PathIdentity(path) {
  const normalizedSelf = path === COLLISION_PARSER_PATH ? normalizedCollisionParserIdentity() : null;
  const tracked = pathIsTracked(path);
  const status = shortStatus(path);
  const hunks = normalizedSelf ? normalizedSelf.hunkBodySha256 : hunkHashes(path);
  return {
    path,
    pathKind: tracked ? 'tracked' : 'untracked',
    status,
    staged: status === '??' ? false : status !== '' && status[0] !== ' ',
    unstaged: status === '??' ? true : status !== '' && status[1] !== ' ',
    headOid: tracked ? headOid(path) : null,
    indexOid: tracked ? indexOid(path) : null,
    worktreeGitOid: normalizedSelf?.worktreeGitOid ?? worktreeGitOid(path),
    worktreeSha256: normalizedSelf?.worktreeSha256 ?? sha256(readFileSync(resolve(ROOT, path))),
    hunkCount: hunks.length,
    hunkBodySha256: hunks,
    lastCommit: tracked ? lastCommit(path) : null
  };
}

function currentDirtyPathsOutsideScopeOne() {
  return git(['status', '--porcelain=v1', '--untracked-files=all'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3))
    .filter((path) => path !== REPORT_PATH && !REQUIRED_SCOPE_ONE_PATHS.includes(path));
}

function assertCurrentIdentityV4Record(record, classification) {
  const label = `current identity v4 ${record.path}`;
  assertExactOrderedKeys(record, [
    'path',
    'pathKind',
    'classification',
    'ownerAttribution',
    'feature004OwnershipClaim',
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
  ], label);
  assert.equal(record.classification, classification, `${label} classification is exact`);
  if (classification === 'scope1-required') {
    assert.equal(record.ownerAttribution, 'specs/004-fx-regime-relative-value-lab::SCOPE-01',
      `${label} retains exact Scope 1 attribution`);
    assert.equal(record.feature004OwnershipClaim, true, `${label} is an exact Scope 1 path`);
  } else {
    assertNonemptyString(record.ownerAttribution, `${label}.ownerAttribution`);
    assert.notEqual(record.ownerAttribution, 'specs/004-fx-regime-relative-value-lab::SCOPE-01',
      `${label} does not transfer foreign ownership to Feature 004`);
    assert.equal(record.feature004OwnershipClaim, false, `${label} grants no Feature 004 ownership`);
  }
  const {
    classification: ignoredClassification,
    ownerAttribution: ignoredOwnerAttribution,
    feature004OwnershipClaim: ignoredOwnershipClaim,
    ...identity
  } = record;
  assert.deepEqual(identity, currentV4PathIdentity(record.path),
    `${label} status, index, worktree, and ordered hunks are exact`);
  assert.equal(record.staged, false, `${label} has no staged state`);
  assert.equal(record.hunkCount, record.hunkBodySha256.length, `${label} hunk inventory is complete`);
  record.hunkBodySha256.forEach((hash, index) => assertSha256(hash, `${label}.hunkBodySha256[${index}]`));
}

function validateCurrentIdentityV4(identity, canonical = identity) {
  assertExactCanonicalContract(identity, canonical, 'current identity v4 block');
  assertExactOrderedKeys(identity, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContracts',
    'requiredScope1Paths',
    'foreignProtectedPaths',
    'collisionParserSelfIdentity',
    'preservationContract'
  ], 'current identity v4 block');
  assert.equal(identity.contractVersion, 'feature004-dirty-collision-current-identity/v4');
  assert.equal(identity.findingId, 'F-004-EVIDENCE-DURABILITY');
  assertUtcTimestamp(identity.capturedAt, 'current identity v4 capturedAt');
  const expectedExtensions = [
    ...IMMUTABLE_PREDECESSOR_BLOCKS,
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ];
  identity.extendsContracts.forEach((record, index) => {
    assertExactOrderedKeys(record, ['marker', 'rawBlockSha256'], `current identity v4 extendsContracts[${index}]`);
  });
  assert.deepEqual(identity.extendsContracts, expectedExtensions,
    'current identity v4 extends all ten immutable predecessors and the durable evidence block in order');
  assert.equal(identity.requiredScope1Paths.length, REQUIRED_SCOPE_ONE_PATHS.length,
    'current identity v4 contains exactly 19 Scope 1 path records');
  assert.deepEqual(identity.requiredScope1Paths.map((record) => record.path), REQUIRED_SCOPE_ONE_PATHS,
    'current identity v4 Scope 1 path membership and order are exact');
  identity.requiredScope1Paths.forEach((record) => assertCurrentIdentityV4Record(record, 'scope1-required'));
  assert.deepEqual(identity.foreignProtectedPaths.map((record) => record.path), currentDirtyPathsOutsideScopeOne(),
    'current identity v4 separately contains every and only protected foreign dirty or untracked path in Git order');
  identity.foreignProtectedPaths.forEach((record) => assertCurrentIdentityV4Record(record, 'foreign-unrelated'));
  const allPaths = [...identity.requiredScope1Paths, ...identity.foreignProtectedPaths].map((record) => record.path);
  assert.equal(new Set(allPaths).size, allPaths.length, 'current identity v4 contains no duplicate path');
  assert.deepEqual(identity.collisionParserSelfIdentity, normalizedCollisionParserIdentity(),
    'current identity v4 reproduces normalized-self-pins/v1 exactly');
  const parserRecords = identity.requiredScope1Paths.filter((record) => record.path === COLLISION_PARSER_PATH);
  assert.equal(parserRecords.length, 1, 'current identity v4 contains exactly one collision parser path');
  assert.deepEqual({
    path: parserRecords[0].path,
    worktreeGitOid: parserRecords[0].worktreeGitOid,
    worktreeSha256: parserRecords[0].worktreeSha256,
    hunkCount: parserRecords[0].hunkCount,
    hunkBodySha256: parserRecords[0].hunkBodySha256
  }, {
    path: identity.collisionParserSelfIdentity.path,
    worktreeGitOid: identity.collisionParserSelfIdentity.worktreeGitOid,
    worktreeSha256: identity.collisionParserSelfIdentity.worktreeSha256,
    hunkCount: identity.collisionParserSelfIdentity.hunkCount,
    hunkBodySha256: identity.collisionParserSelfIdentity.hunkBodySha256
  }, 'current identity v4 parser record uses only the normalized self identity');
  assertExactOrderedKeys(identity.preservationContract, [
    'allTenPredecessorBlocksRemainByteIdentical',
    'durableEvidenceBlockHashIsPinned',
    'exactNineteenScope1PathsRequired',
    'allForeignDirtyAndUntrackedPathsSeparatelyClassified',
    'foreignPathsGrantNoFeature004Ownership',
    'normalizedSelfPinsRequired',
    'missingExtraStagedOrDriftedIdentityFailsClosed',
    'reportPathIsProtectedByMarkerPinsInsteadOfRecursiveIdentity'
  ], 'current identity v4 preservationContract');
  assert.ok(Object.values(identity.preservationContract).every((value) => value === true),
    'current identity v4 preservation contract is entirely fail-closed');
}
/* FEATURE-004-COLLISION-CHAINED-SUCCESSORS-BEGIN */
const V5_CERTIFIED_PHASES = [
  'implement',
  'test',
  'regression',
  'simplify',
  'gaps',
  'harden',
  'stabilize',
  'security',
  'validate',
  'audit',
  'chaos',
  'docs',
  'spec-review'
];
const V5_SCOPE_PROGRESS = Array.from({ length: 8 }, (_value, index) => ({
  scope: index + 1,
  status: 'done'
}));
const V5_PLAN_PATHS = [
  'specs/004-fx-regime-relative-value-lab/scopes.md',
  'specs/004-fx-regime-relative-value-lab/test-plan.json',
  'specs/004-fx-regime-relative-value-lab/state.json'
];
const V6_ROADMAP_PATH = 'docs/Product-Review-and-Roadmap.md';
const CHAINED_SUCCESSOR_HELPER_BEGIN = '/* FEATURE-004-COLLISION-CHAINED-SUCCESSORS-BEGIN */';
const CHAINED_SUCCESSOR_HELPER_END = '/* FEATURE-004-COLLISION-CHAINED-SUCCESSORS-END */';
const CHAINED_SUCCESSOR_ADVERSARIAL_BEGIN = '/* FEATURE-004-COLLISION-CHAINED-ADVERSARIAL-BEGIN */';
const CHAINED_SUCCESSOR_ADVERSARIAL_END = '/* FEATURE-004-COLLISION-CHAINED-ADVERSARIAL-END */';

function parseNormalizedSelfPinFamily(source, names, matcher, mode) {
  const assignments = [...source.matchAll(matcher)];
  assert.deepEqual(assignments.map((match) => match[1]), names,
    `${mode} contains exactly its named pin constants in exact order`);
  assignments.forEach((match, index) => assertSha256(match[2], `${mode} ${names[index]}`));
  return assignments;
}

function parseNormalizedSelfPinsV2(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V2,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45])[A-Z0-9_]*) = '([^']*)';$/gm,
    'normalized-self-pins/v2');
}

function parseNormalizedSelfPinsV3(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V3,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6)[A-Z0-9_]*) = '([^']*)';$/gm,
    'normalized-self-pins/v3');
}

function normalizeSelfPinValuesForNames(value, names) {
  const pinPattern = new RegExp(`(const (?:${names.join('|')}) = ')[^']*(';)$`, 'gm');
  return value.replace(pinPattern, `$1${'0'.repeat(64)}$2`);
}

function normalizedSelfSourceIdentityV3(source) {
  parseNormalizedSelfPinsV2(source);
  parseNormalizedSelfPinsV3(source);
  const normalizedBytes = Buffer.from(normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V3), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes)
  };
}

function assertHistoricalV4Record(record, classification, label) {
  assertExactOrderedKeys(record, [
    'path',
    'pathKind',
    'classification',
    'ownerAttribution',
    'feature004OwnershipClaim',
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
  ], label);
  assert.equal(record.classification, classification, `${label} classification is exact`);
  assertNonemptyString(record.ownerAttribution, `${label}.ownerAttribution`);
  assert.equal(record.feature004OwnershipClaim, classification === 'scope1-required',
    `${label} ownership claim matches its historical classification`);
  assert.equal(record.staged, false, `${label} has no historical staged state`);
  assert.equal(record.hunkCount, record.hunkBodySha256.length, `${label} hunk inventory is complete`);
  record.hunkBodySha256.forEach((hash, index) => assertSha256(hash, `${label}.hunkBodySha256[${index}]`));
}

function validateCurrentIdentityV4Schema(identity, canonical = identity) {
  assertExactCanonicalContract(identity, canonical, 'current identity v4 block');
  assertExactOrderedKeys(identity, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContracts',
    'requiredScope1Paths',
    'foreignProtectedPaths',
    'collisionParserSelfIdentity',
    'preservationContract'
  ], 'current identity v4 block');
  assert.equal(identity.contractVersion, 'feature004-dirty-collision-current-identity/v4');
  assert.equal(identity.findingId, 'F-004-EVIDENCE-DURABILITY');
  assertUtcTimestamp(identity.capturedAt, 'current identity v4 capturedAt');
  assert.deepEqual(identity.extendsContracts, [
    ...IMMUTABLE_PREDECESSOR_BLOCKS,
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ], 'current identity v4 retains every predecessor link in order');
  assert.deepEqual(identity.requiredScope1Paths.map((record) => record.path), REQUIRED_SCOPE_ONE_PATHS,
    'current identity v4 retains exactly 19 Scope 1 paths in order');
  identity.requiredScope1Paths.forEach((record) => assertHistoricalV4Record(record, 'scope1-required',
    `current identity v4 ${record.path}`));
  identity.foreignProtectedPaths.forEach((record) => assertHistoricalV4Record(record, 'foreign-unrelated',
    `current identity v4 ${record.path}`));
  const paths = [...identity.requiredScope1Paths, ...identity.foreignProtectedPaths].map((record) => record.path);
  assert.equal(new Set(paths).size, paths.length, 'current identity v4 contains no duplicate path');
  assertExactOrderedKeys(identity.collisionParserSelfIdentity, [
    'path',
    'mode',
    'pinLiterals',
    'normalizedPinValue',
    'worktreeGitOid',
    'worktreeSha256',
    'hunkCount',
    'hunkBodySha256'
  ], 'current identity v4 collisionParserSelfIdentity');
  assert.equal(identity.collisionParserSelfIdentity.path, COLLISION_PARSER_PATH);
  assert.equal(identity.collisionParserSelfIdentity.mode, 'normalized-self-pins/v1');
  assert.deepEqual(identity.collisionParserSelfIdentity.pinLiterals, NORMALIZED_SELF_PIN_NAMES);
  assert.equal(identity.collisionParserSelfIdentity.normalizedPinValue, '0'.repeat(64));
  const parserRecord = identity.requiredScope1Paths.find((record) => record.path === COLLISION_PARSER_PATH);
  assert.deepEqual({
    path: parserRecord.path,
    worktreeGitOid: parserRecord.worktreeGitOid,
    worktreeSha256: parserRecord.worktreeSha256,
    hunkCount: parserRecord.hunkCount,
    hunkBodySha256: parserRecord.hunkBodySha256
  }, {
    path: identity.collisionParserSelfIdentity.path,
    worktreeGitOid: identity.collisionParserSelfIdentity.worktreeGitOid,
    worktreeSha256: identity.collisionParserSelfIdentity.worktreeSha256,
    hunkCount: identity.collisionParserSelfIdentity.hunkCount,
    hunkBodySha256: identity.collisionParserSelfIdentity.hunkBodySha256
  }, 'current identity v4 parser record retains the exact normalized self identity');
}

function standardIdentityKeys(label, identity) {
  assertExactOrderedKeys(identity, [
    'path',
    'pathKind',
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
  ], label);
  assert.equal(identity.staged, false, `${label} is unstaged`);
  assert.equal(identity.hunkCount, identity.hunkBodySha256.length, `${label} hunk inventory is complete`);
}

function validateCurrentIdentityV5(v5, v4, canonical = v5) {
  assertExactCanonicalContract(v5, canonical, 'current identity v5 block');
  assertExactOrderedKeys(v5, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContracts',
    'historicalOwnerReturn',
    'certifiedSuccessor',
    'resolvedTransition',
    'planOwnedPathTransitions',
    'parserBeforeSemanticEdit',
    'parserTransition',
    'normalizedSelfPins',
    'adversarialMutations',
    'preservationContract',
    'testOwnerHandoff'
  ], 'current identity v5 block');
  assert.equal(v5.contractVersion, 'feature004-dirty-collision-current-identity/v5');
  assert.equal(v5.findingId, 'F004-COLLISION-F010-LIFECYCLE-DRIFT-001');
  assertUtcTimestamp(v5.capturedAt, 'current identity v5 capturedAt');
  assert.deepEqual(v5.extendsContracts, [
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 },
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ], 'current identity v5 extends exact v4 and durable blocks');
  assert.deepEqual(v5.historicalOwnerReturn, {
    owner: 'bubbles.implement',
    packet: 'specs/010-company-fundamentals-and-brief-lab',
    scope: 'Scope 01',
    phase: 'implement',
    executionHistorySelector: {
      agent: 'bubbles.implement',
      executionModel: 'direct-authorized-runner',
      parentAgent: 'bubbles.goal',
      startedAt: '2026-07-17T00:14:13Z',
      finishedAt: '2026-07-17T00:34:15Z',
      outcome: 'route_required',
      evidenceRef: 'scopes/01-contract-config-validator-publication-foundation/report.md#final-concurrent-owner-reconciliation---2026-07-17t003415z'
    },
    statusBefore: 'not_started',
    statusAfter: 'not_started',
    scopesCompleted: [],
    exactEvidenceCompletionClaims: {
      scopeComplete: false,
      featureComplete: false,
      bug003Complete: false,
      bug002Complete: false
    },
    capturedNonCompletionState: {
      featureStatus: 'not_started',
      scopeStatus: 'not_started',
      certificationStatus: 'not_started',
      completedPhaseClaims: ['spec-review'],
      completedScopes: []
    }
  }, 'current identity v5 historical owner return remains exact noncompletion evidence');
  assert.deepEqual(v5.certifiedSuccessor, {
    status: 'done',
    certifiedAt: '2026-07-30T14:41:30Z',
    certificationStatus: 'done',
    executionScopeProgress: V5_SCOPE_PROGRESS,
    completedScopeCount: 8,
    uniqueCompletedScopeCount: 8,
    certifiedCompletedPhases: V5_CERTIFIED_PHASES
  }, 'current identity v5 certified successor is exact');
  assert.deepEqual(v5.resolvedTransition, {
    id: 'TR-F010-SCOPE01-TEST-OWNERSHIP-01',
    status: 'resolved',
    routedTo: 'bubbles.test',
    findingIds: ['F010-INDEPENDENT-VERIFICATION-001'],
    resolvedAt: '2026-07-17T02:07:35Z',
    resolvedBy: 'bubbles.test',
    outcome: 'route_required'
  }, 'current identity v5 resolved transition is exact');
  assert.deepEqual(v5.planOwnedPathTransitions.map((transition) => transition.path), V5_PLAN_PATHS,
    'current identity v5 contains exactly three plan-owned path transitions in order');
  v5.planOwnedPathTransitions.forEach((transition, index) => {
    assertExactOrderedKeys(transition, [
      'path',
      'previousIdentityRef',
      'previousWorktreeGitOid',
      'previousWorktreeSha256',
      'inheritedClassification',
      'inheritedOwnerAttribution',
      'inheritedFeature004OwnershipClaim',
      'currentIdentity',
      'disposition'
    ], `current identity v5 planOwnedPathTransitions[${index}]`);
    standardIdentityKeys(`current identity v5 ${transition.path}`, transition.currentIdentity);
    const prior = v4.foreignProtectedPaths.find((record) => record.path === transition.path);
    assert.ok(prior, `current identity v5 ${transition.path} resolves one v4 foreign record`);
    assert.equal(transition.previousWorktreeGitOid, prior.worktreeGitOid);
    assert.equal(transition.previousWorktreeSha256, prior.worktreeSha256);
    assert.equal(transition.inheritedClassification, prior.classification);
    assert.equal(transition.inheritedOwnerAttribution, prior.ownerAttribution);
    assert.equal(transition.inheritedFeature004OwnershipClaim, prior.feature004OwnershipClaim);
    assert.equal(transition.disposition, 'plan-owned-v5-lifecycle-successor');
  });
  assertExactOrderedKeys(v5.parserBeforeSemanticEdit, [
    'path',
    'rawWorktreeGitOid',
    'rawWorktreeSha256',
    'byteLength',
    'capturedOldLineRange',
    'normalizedV1Identity'
  ], 'current identity v5 parserBeforeSemanticEdit');
  assert.equal(v5.parserBeforeSemanticEdit.path, COLLISION_PARSER_PATH);
  assert.equal(v5.parserBeforeSemanticEdit.rawWorktreeGitOid, '50e367ed041b11f6dbfe0f8e1a907a1348b009f6');
  assert.equal(v5.parserBeforeSemanticEdit.rawWorktreeSha256, 'c524337816983f22675d5a7b024ea394d852c9f1273697d81dc48baf901c25dc');
  assert.equal(v5.parserBeforeSemanticEdit.byteLength, 164198);
  assert.deepEqual(v5.parserBeforeSemanticEdit.normalizedV1Identity, v4.collisionParserSelfIdentity,
    'current identity v5 starts from the exact v4 normalized parser identity');
  assertExactOrderedKeys(v5.parserTransition, [
    'path',
    'function',
    'semanticTransitionCount',
    'allowedHunk',
    'structuralAdditions'
  ], 'current identity v5 parserTransition');
  const allowed = v5.parserTransition.allowedHunk;
  assert.equal(v5.parserTransition.path, COLLISION_PARSER_PATH);
  assert.equal(v5.parserTransition.function, 'validateOwnerSettledSuccessor');
  assert.equal(v5.parserTransition.semanticTransitionCount, 1);
  assert.equal(sha256(allowed.oldLines.join('\n')), allowed.oldSha256,
    'current identity v5 old assertion hunk hash is exact');
  assert.equal(sha256(allowed.newLines.join('\n')), allowed.newSha256,
    'current identity v5 new assertion hunk hash is exact');
  assert.equal(allowed.oldSha256, 'c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848');
  assert.equal(allowed.newSha256, '56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae');
  assert.deepEqual(v5.normalizedSelfPins.pinLiterals, NORMALIZED_SELF_PIN_NAMES_V2,
    'current identity v5 normalized-self-pins/v2 family is exact');
  assert.equal(v5.normalizedSelfPins.mode, 'normalized-self-pins/v2');
  assert.equal(v5.preservationContract.planOwnedPathTransitionCount, 3);
  assert.equal(v5.preservationContract.scopeOneStatus, 'In Progress');
  assert.equal(v5.preservationContract.scopeTwoStatus, 'Not Started');
  assert.equal(v5.preservationContract.productEditsAllowed, false);
  assert.equal(v5.preservationContract.featureTenEditsAllowed, false);
  assert.equal(v5.preservationContract.gitStateMutationAllowed, false);
  assert.equal(v5.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v5.testOwnerHandoff.testEditBoundary, COLLISION_PARSER_PATH + ' only');
}

function currentRoadmapV6Identity() {
  const path = V6_ROADMAP_PATH;
  const current = currentV4PathIdentity(path);
  const [additions, deletions, numstatPath] = git(['diff', '--numstat', '--', path]).trim().split(/\s+/);
  assert.equal(numstatPath, path, 'foreign roadmap numstat resolves the exact path');
  return {
    path,
    pathKind: current.pathKind,
    classification: 'foreign-unrelated',
    ownerAttribution: 'owner: unknown',
    feature004OwnershipClaim: false,
    status: current.status,
    staged: current.staged,
    unstaged: current.unstaged,
    headOid: current.headOid,
    indexOid: current.indexOid,
    worktreeGitOid: current.worktreeGitOid,
    worktreeSha256: current.worktreeSha256,
    byteLength: readFileSync(resolve(ROOT, path)).length,
    additions: Number(additions),
    deletions: Number(deletions),
    hunkCount: current.hunkCount,
    hunkBodySha256: current.hunkBodySha256,
    lastCommit: current.lastCommit
  };
}

function validateForeignRoadmapV6(v6, v5, v4, canonical = v6, verifyCurrent = true) {
  assertExactCanonicalContract(v6, canonical, 'foreign roadmap v6 block');
  assertExactOrderedKeys(v6, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContracts',
    'previousRoadmapIdentity',
    'foreignRoadmapOverlay',
    'pendingV5SemanticTransition',
    'planningRoutingTransitions',
    'parserHandoff',
    'adversarialMutations',
    'preservationContract',
    'testOwnerHandoff'
  ], 'foreign roadmap v6 block');
  assert.equal(v6.contractVersion, 'feature004-dirty-collision-foreign-roadmap/v6');
  assert.equal(v6.findingId, 'F004-COLLISION-FOREIGN-ROADMAP-V6');
  assertUtcTimestamp(v6.capturedAt, 'foreign roadmap v6 capturedAt');
  assert.deepEqual(v6.extendsContracts, [
    { marker: 'feature004-dirty-collision-current-identity-v5', rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 }
  ], 'foreign roadmap v6 parents are exact and ordered');
  const v4Roadmap = v4.foreignProtectedPaths.find((record) => record.path === V6_ROADMAP_PATH);
  assert.ok(v4Roadmap, 'foreign roadmap v6 resolves exactly one v4 roadmap record');
  assert.deepEqual(v6.previousRoadmapIdentity, v4Roadmap,
    'foreign roadmap v6 previous identity is the exact v4 record');
  assertExactOrderedKeys(v6.foreignRoadmapOverlay, [
    'overlayCount',
    'path',
    'previousIdentityRef',
    'currentIdentity',
    'currentAuthor',
    'semanticApproval',
    'semanticAcceptance',
    'ownershipTransfer',
    'completionClaim',
    'certificationClaim',
    'disposition'
  ], 'foreign roadmap v6 overlay');
  assert.equal(v6.foreignRoadmapOverlay.overlayCount, 1);
  assert.equal(v6.foreignRoadmapOverlay.path, V6_ROADMAP_PATH);
  assert.deepEqual(v6.foreignRoadmapOverlay.previousIdentityRef, {
    marker: 'feature004-dirty-collision-current-identity-v4',
    field: 'foreignProtectedPaths[path=docs/Product-Review-and-Roadmap.md]'
  });
  assert.deepEqual({
    currentAuthor: v6.foreignRoadmapOverlay.currentAuthor,
    classification: v6.foreignRoadmapOverlay.currentIdentity.classification,
    ownerAttribution: v6.foreignRoadmapOverlay.currentIdentity.ownerAttribution,
    feature004OwnershipClaim: v6.foreignRoadmapOverlay.currentIdentity.feature004OwnershipClaim,
    semanticApproval: v6.foreignRoadmapOverlay.semanticApproval,
    semanticAcceptance: v6.foreignRoadmapOverlay.semanticAcceptance,
    ownershipTransfer: v6.foreignRoadmapOverlay.ownershipTransfer,
    completionClaim: v6.foreignRoadmapOverlay.completionClaim,
    certificationClaim: v6.foreignRoadmapOverlay.certificationClaim
  }, {
    currentAuthor: 'unknown',
    classification: 'foreign-unrelated',
    ownerAttribution: 'owner: unknown',
    feature004OwnershipClaim: false,
    semanticApproval: false,
    semanticAcceptance: false,
    ownershipTransfer: false,
    completionClaim: false,
    certificationClaim: false
  }, 'foreign roadmap v6 grants no approval, completion, certification, or ownership');
  assert.equal(v6.foreignRoadmapOverlay.disposition, 'foreign-unrelated-current-identity-only');
  assert.equal(v6.foreignRoadmapOverlay.currentIdentity.worktreeGitOid, '016656d4bc39799cb976e02208f8a3ec81bdabc6');
  assert.equal(v6.foreignRoadmapOverlay.currentIdentity.worktreeSha256, '8cb06fb713f25b52423604d7a0e196fa3017e685b756cfd5873604a588d068e6');
  assert.equal(v6.foreignRoadmapOverlay.currentIdentity.hunkCount, 25);
  assert.equal(v6.foreignRoadmapOverlay.currentIdentity.hunkBodySha256.length, 25);
  if (verifyCurrent) assert.deepEqual(currentRoadmapV6Identity(), v6.foreignRoadmapOverlay.currentIdentity,
    'foreign roadmap v6 current OID, SHA-256, byte counts, and 25 ordered hunks are exact');
  assert.deepEqual(v6.pendingV5SemanticTransition, {
    marker: 'feature004-dirty-collision-current-identity-v5',
    rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256,
    status: 'authorized-unapplied',
    path: COLLISION_PARSER_PATH,
    function: 'validateOwnerSettledSuccessor',
    oldHunkSha256: 'c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848',
    newHunkSha256: '56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae',
    semanticTransitionCount: 1,
    applicationOrder: 'after-foreign-roadmap-v6-overlay'
  }, 'foreign roadmap v6 retains the authorized but separately applied v5 transition');
  assert.deepEqual(v6.planningRoutingTransitions.map((transition) => transition.path), V5_PLAN_PATHS,
    'foreign roadmap v6 contains exactly three planning routing transitions in order');
  v6.planningRoutingTransitions.forEach((transition, index) => {
    assertExactOrderedKeys(transition, [
      'path',
      'previousIdentityRef',
      'previousWorktreeGitOid',
      'previousWorktreeSha256',
      'currentIdentity',
      'disposition'
    ], `foreign roadmap v6 planningRoutingTransitions[${index}]`);
    standardIdentityKeys(`foreign roadmap v6 ${transition.path}`, transition.currentIdentity);
    const prior = v5.planOwnedPathTransitions.find((candidate) => candidate.path === transition.path);
    assert.ok(prior, `foreign roadmap v6 ${transition.path} resolves one v5 transition`);
    assert.equal(transition.previousWorktreeGitOid, prior.currentIdentity.worktreeGitOid);
    assert.equal(transition.previousWorktreeSha256, prior.currentIdentity.worktreeSha256);
    assert.equal(transition.disposition, 'plan-owned-v6-routing-only');
    if (verifyCurrent) assert.deepEqual(currentV4PathIdentity(transition.path), transition.currentIdentity,
      `foreign roadmap v6 ${transition.path} current identity is exact`);
  });
  assert.equal(v6.parserHandoff.newPinLiteral, 'FOREIGN_ROADMAP_V6_BLOCK_SHA256');
  assert.equal(v6.parserHandoff.pinCountDelta, 1);
  assert.equal(v6.parserHandoff.normalizedMode, 'normalized-self-pins/v3');
  assert.deepEqual(v6.parserHandoff.retainedPinLiterals, NORMALIZED_SELF_PIN_NAMES_V2);
  assert.deepEqual(v6.parserHandoff.applicationOrder, [
    'validate every predecessor and exact v4/v5 marker-inclusive hash',
    'parse exactly one closed v6 block',
    'overlay only the roadmap old-v4 identity with the exact 25-hunk current identity',
    'apply the three planning-routing transitions separately from the one-path foreign overlay',
    'apply the already-authorized v5 five-assertion semantic transition',
    'recompute the complete current identity matrix and fail closed on any remaining drift'
  ], 'foreign roadmap v6 parser order is exact');
  assert.ok(Object.entries(v6.preservationContract).every(([key, value]) => {
    if (key.endsWith('Count')) return Number.isInteger(value) && value > 0;
    if (key.endsWith('Status')) return typeof value === 'string' && value.length > 0;
    if (key === 'feature004CompletedScopes') return Array.isArray(value) && value.length === 0;
    return typeof value === 'boolean';
  }), 'foreign roadmap v6 preservation contract uses only closed booleans, counts, statuses, and the empty completed-scope set');
  assert.equal(v6.preservationContract.onlyRoadmapV4IdentityMayOverlay, true);
  assert.equal(v6.preservationContract.v6OverlayMustPrecedeV5SemanticTransition, true);
  assert.equal(v6.preservationContract.roadmapFeature004OwnershipClaimRemainsFalse, true);
  assert.equal(v6.preservationContract.roadmapSemanticApprovalRemainsFalse, true);
  assert.equal(v6.preservationContract.gitStateMutationAllowed, false);
  assert.equal(v6.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v6.testOwnerHandoff.transitionRequestId, 'TR-F004-SCOPE01-FOREIGN-ROADMAP-V6-001');
}

function recordWithoutOwnership(record) {
  const {
    classification: ignoredClassification,
    ownerAttribution: ignoredOwnerAttribution,
    feature004OwnershipClaim: ignoredOwnership,
    ...identity
  } = record;
  return identity;
}

function mergeInheritedOwnership(prior, currentIdentity) {
  return {
    path: currentIdentity.path,
    pathKind: currentIdentity.pathKind,
    classification: prior.classification,
    ownerAttribution: prior.ownerAttribution,
    feature004OwnershipClaim: prior.feature004OwnershipClaim,
    status: currentIdentity.status,
    staged: currentIdentity.staged,
    unstaged: currentIdentity.unstaged,
    headOid: currentIdentity.headOid,
    indexOid: currentIdentity.indexOid,
    worktreeGitOid: currentIdentity.worktreeGitOid,
    worktreeSha256: currentIdentity.worktreeSha256,
    hunkCount: currentIdentity.hunkCount,
    hunkBodySha256: currentIdentity.hunkBodySha256,
    lastCommit: currentIdentity.lastCommit
  };
}

function replaceIdentityRecord(records, path, replace, label) {
  const indexes = records.flatMap((record, index) => record.path === path ? [index] : []);
  assert.equal(indexes.length, 1, `${label} resolves exactly one ${path} record`);
  records[indexes[0]] = replace(records[indexes[0]]);
}

function composeChainedIdentityMatrix(v4, v5, v6) {
  const matrix = {
    requiredScope1Paths: structuredClone(v4.requiredScope1Paths),
    foreignProtectedPaths: structuredClone(v4.foreignProtectedPaths)
  };
  const stage = { foreignRoadmapOverlayApplied: false, v5SemanticTransitionApplied: false };
  replaceIdentityRecord(matrix.foreignProtectedPaths, V6_ROADMAP_PATH, (prior) => {
    assert.deepEqual(prior, v6.previousRoadmapIdentity,
      'foreign roadmap v6 overlays the exact old v4 identity and no substitute');
    const {
      byteLength: ignoredByteLength,
      additions: ignoredAdditions,
      deletions: ignoredDeletions,
      ...current
    } = v6.foreignRoadmapOverlay.currentIdentity;
    return current;
  }, 'foreign roadmap v6 overlay');
  stage.foreignRoadmapOverlayApplied = true;

  v5.planOwnedPathTransitions.forEach((transition) => {
    replaceIdentityRecord(matrix.foreignProtectedPaths, transition.path, (prior) => {
      assert.equal(prior.worktreeGitOid, transition.previousWorktreeGitOid,
        `current identity v5 ${transition.path} starts from its exact v4 Git OID`);
      assert.equal(prior.worktreeSha256, transition.previousWorktreeSha256,
        `current identity v5 ${transition.path} starts from its exact v4 SHA-256`);
      return mergeInheritedOwnership(prior, transition.currentIdentity);
    }, 'current identity v5 planning overlay');
  });
  v6.planningRoutingTransitions.forEach((transition) => {
    replaceIdentityRecord(matrix.foreignProtectedPaths, transition.path, (prior) => {
      assert.equal(prior.worktreeGitOid, transition.previousWorktreeGitOid,
        `foreign roadmap v6 ${transition.path} starts from its exact v5 Git OID`);
      assert.equal(prior.worktreeSha256, transition.previousWorktreeSha256,
        `foreign roadmap v6 ${transition.path} starts from its exact v5 SHA-256`);
      return mergeInheritedOwnership(prior, transition.currentIdentity);
    }, 'foreign roadmap v6 planning overlay');
  });
  return { matrix, stage };
}

function countExact(source, needle) {
  return source.split(needle).length - 1;
}

function assertV5SemanticTransitionAppliedAfterRoadmap(v5, stage) {
  assert.equal(stage.foreignRoadmapOverlayApplied, true,
    'v5 semantic transition cannot apply before the foreign roadmap v6 overlay');
  assert.equal(stage.v5SemanticTransitionApplied, false,
    'v5 semantic transition applies exactly once');
  const source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const oldHunk = v5.parserTransition.allowedHunk.oldLines.join('\n');
  const newHunk = v5.parserTransition.allowedHunk.newLines.join('\n');
  assert.equal(countExact(source, oldHunk), 0, 'v5 old five-assertion hunk is fully replaced');
  assert.equal(countExact(source, newHunk), 1, 'v5 authorized successor hunk exists exactly once');
  assert.equal(sha256(newHunk), v5.parserTransition.allowedHunk.newSha256,
    'v5 applied successor hunk has the exact authorized SHA-256');
  stage.v5SemanticTransitionApplied = true;
}

function stripMarkerBoundedAddition(source, startMarker, endMarker, required) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (!required && start === -1 && end === -1) return source;
  assert.notEqual(start, -1, `${startMarker} exists exactly once`);
  assert.notEqual(end, -1, `${endMarker} exists exactly once`);
  assert.equal(source.indexOf(startMarker, start + startMarker.length), -1, `${startMarker} is unique`);
  assert.equal(source.indexOf(endMarker, end + endMarker.length), -1, `${endMarker} is unique`);
  assert.ok(start < end, `${startMarker} precedes ${endMarker}`);
  const endExclusive = end + endMarker.length + 1;
  assert.equal(source.slice(end + endMarker.length, endExclusive), '\n', `${endMarker} ends with LF`);
  return source.slice(0, start) + source.slice(endExclusive);
}

function removeExactSuccessorAddition(source, addition, label) {
  assert.equal(countExact(source, addition), 1, `${label} exists exactly once`);
  return source.replace(addition, '');
}

function reconstructParserBeforeChainedSuccessors(v5) {
  let source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const oldHunk = v5.parserTransition.allowedHunk.oldLines.join('\n');
  const newHunk = v5.parserTransition.allowedHunk.newLines.join('\n');
  assert.equal(countExact(source, newHunk), 1, 'parser reconstruction resolves exactly one authorized v5 hunk');
  source = source.replace(newHunk, oldHunk);
  source = stripMarkerBoundedAddition(source,
    '/* FEATURE-004-COLLISION-FOREIGN-SET-V7-BEGIN */',
    '/* FEATURE-004-COLLISION-FOREIGN-SET-V7-END */', false);
  source = stripMarkerBoundedAddition(source, CHAINED_SUCCESSOR_ADVERSARIAL_BEGIN,
    CHAINED_SUCCESSOR_ADVERSARIAL_END, false);
  source = stripMarkerBoundedAddition(source, CHAINED_SUCCESSOR_HELPER_BEGIN,
    CHAINED_SUCCESSOR_HELPER_END, true);
  source = removeExactSuccessorAddition(source,
    `const CURRENT_IDENTITY_V5_BLOCK_SHA256 = '${CURRENT_IDENTITY_V5_BLOCK_SHA256}';\n`,
    'v5 pin addition');
  source = removeExactSuccessorAddition(source,
    `const FOREIGN_ROADMAP_V6_BLOCK_SHA256 = '${FOREIGN_ROADMAP_V6_BLOCK_SHA256}';\n`,
    'v6 pin addition');
  source = removeExactSuccessorAddition(source,
    `const FOREIGN_SET_V7_BLOCK_SHA256 = '${FOREIGN_SET_V7_BLOCK_SHA256}';\n`,
    'v7 pin addition');
  source = removeExactSuccessorAddition(source,
    `const FOREIGN_SET_V7_BLOCK_BYTE_LENGTH = ${FOREIGN_SET_V7_BLOCK_BYTE_LENGTH};\n`,
    'v7 byte-length addition');
  source = removeExactSuccessorAddition(source,
    "const NORMALIZED_SELF_PIN_NAMES_V2 = [\n  ...NORMALIZED_SELF_PIN_NAMES,\n  'CURRENT_IDENTITY_V5_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v2 declaration');
  source = removeExactSuccessorAddition(source,
    "const NORMALIZED_SELF_PIN_NAMES_V3 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V2,\n  'FOREIGN_ROADMAP_V6_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v3 declaration');
  source = removeExactSuccessorAddition(source,
    "const NORMALIZED_SELF_PIN_NAMES_V4 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V3,\n  'FOREIGN_SET_V7_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v4 declaration');
  source = removeExactSuccessorAddition(source,
    '  runForeignSetV7AdversarialCases();\n',
    'v7 adversarial invocation');
  return source;
}

function validateChainedParserSource(v5) {
  const source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  parseNormalizedSelfPins(source);
  parseNormalizedSelfPinsV2(source);
  parseNormalizedSelfPinsV3(source);
  const reconstructed = reconstructParserBeforeChainedSuccessors(v5);
  const bytes = Buffer.from(reconstructed, 'utf8');
  const gitOid = execFileSync('git', ['hash-object', '--stdin'], {
    cwd: ROOT,
    encoding: 'utf8',
    input: bytes
  }).trim();
  assert.deepEqual({
    rawWorktreeGitOid: gitOid,
    rawWorktreeSha256: sha256(bytes),
    byteLength: bytes.length
  }, {
    rawWorktreeGitOid: v5.parserBeforeSemanticEdit.rawWorktreeGitOid,
    rawWorktreeSha256: v5.parserBeforeSemanticEdit.rawWorktreeSha256,
    byteLength: v5.parserBeforeSemanticEdit.byteLength
  }, 'removing only authorized v5/v6 additions and reversing the exact semantic hunk reconstructs the captured pre-edit parser');
}

function validateFeatureTenLifecycleState(featureTenState, v5) {
  const historical = v5.historicalOwnerReturn;
  const matches = featureTenState.executionHistory.filter((entry) =>
    Object.entries(historical.executionHistorySelector).every(([key, value]) => entry[key] === value));
  assert.equal(matches.length, 1, 'Feature 010 historical owner-return resolves exactly once');
  const entry = matches[0];
  assert.deepEqual({
    agent: entry.agent,
    startedAt: entry.startedAt,
    finishedAt: entry.finishedAt,
    statusBefore: entry.statusBefore,
    statusAfter: entry.statusAfter,
    scopesCompleted: entry.scopesCompleted,
    exactEvidenceCompletionClaims: {
      scopeComplete: entry.exactEvidence.scopeComplete,
      featureComplete: entry.exactEvidence.featureComplete,
      bug003Complete: entry.exactEvidence.bug003Complete,
      bug002Complete: entry.exactEvidence.bug002Complete
    }
  }, {
    agent: historical.owner,
    startedAt: historical.executionHistorySelector.startedAt,
    finishedAt: historical.executionHistorySelector.finishedAt,
    statusBefore: historical.statusBefore,
    statusAfter: historical.statusAfter,
    scopesCompleted: historical.scopesCompleted,
    exactEvidenceCompletionClaims: historical.exactEvidenceCompletionClaims
  }, 'Feature 010 historical owner-return status, scopes, and false claims remain exact');

  const certified = v5.certifiedSuccessor;
  assert.equal(featureTenState.status, certified.status, 'Feature 010 current status is exact certified done');
  assert.equal(featureTenState.certifiedAt, certified.certifiedAt, 'Feature 010 certifiedAt is exact');
  assert.equal(featureTenState.certification.status, certified.certificationStatus,
    'Feature 010 certification status is exact certified done');
  assert.deepEqual(featureTenState.execution.scopeProgress.map(({ scope, status }) => ({ scope, status })),
    certified.executionScopeProgress, 'Feature 010 has exactly eight ordered done scopeProgress records');
  assert.equal(featureTenState.certification.completedScopes.length, certified.completedScopeCount,
    'Feature 010 has exactly eight completed scopes');
  assert.equal(new Set(featureTenState.certification.completedScopes).size, certified.uniqueCompletedScopeCount,
    'Feature 010 completed scopes are unique');
  assert.deepEqual(featureTenState.certification.certifiedCompletedPhases, certified.certifiedCompletedPhases,
    'Feature 010 has exactly 13 certified phases in order');
  const transitions = featureTenState.transitionRequests.filter((request) => request.id === v5.resolvedTransition.id);
  assert.equal(transitions.length, 1, 'Feature 010 resolved test ownership transition exists exactly once');
  assert.deepEqual({
    id: transitions[0].id,
    status: transitions[0].status,
    routedTo: transitions[0].routedTo,
    findingIds: transitions[0].findingIds,
    resolvedAt: transitions[0].resolvedAt,
    resolvedBy: transitions[0].resolvedBy,
    outcome: transitions[0].outcome
  }, v5.resolvedTransition, 'Feature 010 resolved test ownership transition remains exact');
}

function assertAuthorizedCurrentIdentityMatrix(matrix) {
  assert.deepEqual(matrix.requiredScope1Paths.map((record) => record.path), REQUIRED_SCOPE_ONE_PATHS,
    'chained current identity retains all 19 Scope 1 paths in order');
  assert.deepEqual(matrix.foreignProtectedPaths.map((record) => record.path), currentDirtyPathsOutsideScopeOne(),
    'chained current identity retains every and only protected foreign dirty path in Git order');
  for (const record of [...matrix.requiredScope1Paths, ...matrix.foreignProtectedPaths]) {
    if (record.path === COLLISION_PARSER_PATH) continue;
    assert.deepEqual(currentV4PathIdentity(record.path), recordWithoutOwnership(record),
      `chained current identity ${record.path} status, index, worktree, and ordered hunks are exact`);
  }
  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  normalizedSelfSourceIdentityV3(parserSource);
}

let chainedSuccessorValidationLogged = false;
const parseCollisionContractsBeforeChainedSuccessors = parseCollisionContracts;
const validateCurrentIdentityV4BeforeChainedSuccessors = validateCurrentIdentityV4;

function parseCollisionContractsWithChainedSuccessors() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  assertPinnedReportBlock(v4Block.raw, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block');
  assertPinnedReportBlock(v5Block.raw, CURRENT_IDENTITY_V5_BLOCK_SHA256, 'current identity v5 block');
  assertPinnedReportBlock(v6Block.raw, FOREIGN_ROADMAP_V6_BLOCK_SHA256, 'foreign roadmap v6 block');
  validateCurrentIdentityV4Schema(v4Block.value);
  validateCurrentIdentityV5(v5Block.value, v4Block.value);
  validateForeignRoadmapV6(v6Block.value, v5Block.value, v4Block.value);
  const { matrix, stage } = composeChainedIdentityMatrix(v4Block.value, v5Block.value, v6Block.value);
  assertV5SemanticTransitionAppliedAfterRoadmap(v5Block.value, stage);
  validateChainedParserSource(v5Block.value);
  const featureTenState = JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8'));
  validateFeatureTenLifecycleState(featureTenState, v5Block.value);
  if (!chainedSuccessorValidationLogged) {
    console.log(`FEATURE004_V6_VALIDATED marker=feature004-dirty-collision-foreign-roadmap-v6 sha256=${FOREIGN_ROADMAP_V6_BLOCK_SHA256} path=${V6_ROADMAP_PATH} hunks=25 owner=unknown ownership=false`);
    console.log(`FEATURE004_V5_VALIDATED marker=feature004-dirty-collision-current-identity-v5 sha256=${CURRENT_IDENTITY_V5_BLOCK_SHA256} status=done scopeProgress=8 completedScopes=8 phases=13`);
    chainedSuccessorValidationLogged = true;
  }

  const activeValidator = validateCurrentIdentityV4;
  validateCurrentIdentityV4 = validateCurrentIdentityV4Schema;
  let inherited;
  try {
    inherited = parseCollisionContractsBeforeChainedSuccessors();
  } finally {
    validateCurrentIdentityV4 = activeValidator;
  }
  assertAuthorizedCurrentIdentityMatrix(matrix);
  return {
    ...inherited,
    currentIdentityV5: v5Block.value,
    currentIdentityV5Raw: v5Block.raw,
    foreignRoadmapV6: v6Block.value,
    foreignRoadmapV6Raw: v6Block.raw,
    chainedIdentityMatrix: matrix
  };
}

parseCollisionContracts = parseCollisionContractsWithChainedSuccessors;
assert.equal(validateCurrentIdentityV4, validateCurrentIdentityV4BeforeChainedSuccessors,
  'chained parser preserves the original live v4 validator outside its bounded historical parse');
/* FEATURE-004-COLLISION-CHAINED-SUCCESSORS-END */

/* FEATURE-004-COLLISION-FOREIGN-SET-V7-BEGIN */
const V7_ROADMAP_PATH = 'docs/Product-Review-and-Roadmap.md';
const V7_NEW_FOREIGN_PATHS = ['docs/Improvement-Plan.md', 'etf-momentum-lab.html'];
const V7_FOREIGN_PATH_ORDER = [V7_ROADMAP_PATH, ...V7_NEW_FOREIGN_PATHS];
const V7_REPORT_RECURSION_EXCLUSION = 'specs/004-fx-regime-relative-value-lab/report.md';
const V7_LOCK_FILE_EXCLUSION = '.specify/memory/bubbles.session.json.flock';
const V7_PLANNING_PATHS = [
  V7_REPORT_RECURSION_EXCLUSION,
  'specs/004-fx-regime-relative-value-lab/scopes.md',
  'specs/004-fx-regime-relative-value-lab/test-plan.json',
  'specs/004-fx-regime-relative-value-lab/state.json'
];

function parseNormalizedSelfPinsV4(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V4,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6|FOREIGN_SET_V7)[A-Z0-9_]*) = '([^']*)';$/gm,
    'normalized-self-pins/v4');
}

function normalizedSelfSourceIdentityV4(source) {
  parseNormalizedSelfPins(source);
  parseNormalizedSelfPinsV2(source);
  parseNormalizedSelfPinsV3(source);
  parseNormalizedSelfPinsV4(source);
  const normalizedBytes = Buffer.from(normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V4), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes)
  };
}

function currentIdentityWithNumstat(path) {
  const current = currentV4PathIdentity(path);
  const numstat = git(['diff', '--numstat', '--', path]).trim().split(/\s+/);
  assert.equal(numstat.length, 3, `v7 ${path} has one exact numstat record`);
  assert.equal(numstat[2], path, `v7 ${path} numstat resolves the exact path`);
  return {
    path,
    pathKind: current.pathKind,
    status: current.status,
    staged: current.staged,
    unstaged: current.unstaged,
    headOid: current.headOid,
    indexOid: current.indexOid,
    worktreeGitOid: current.worktreeGitOid,
    worktreeSha256: current.worktreeSha256,
    byteLength: readFileSync(resolve(ROOT, path)).length,
    additions: Number(numstat[0]),
    deletions: Number(numstat[1]),
    hunkCount: current.hunkCount,
    hunkBodySha256: current.hunkBodySha256,
    lastCommit: current.lastCommit
  };
}

function v7IdentityDynamicFields(record) {
  return {
    path: record.path,
    pathKind: record.pathKind,
    status: record.status,
    staged: record.staged,
    unstaged: record.unstaged,
    headOid: record.headOid,
    indexOid: record.indexOid,
    worktreeGitOid: record.worktreeGitOid,
    worktreeSha256: record.worktreeSha256,
    byteLength: record.byteLength,
    additions: record.additions,
    deletions: record.deletions,
    hunkCount: record.hunkCount,
    hunkBodySha256: record.hunkBodySha256,
    lastCommit: record.lastCommit
  };
}

function assertV7IdentityRecord(record, index, verifyCurrent) {
  const label = `foreign set v7 currentIdentities[${index}]`;
  const expectedKeys = index === 2 ? [
    'path', 'basePresence', 'previousIdentityRef', 'pathKind', 'classification',
    'ownerAttribution', 'possibleContext', 'possibleContextVerified',
    'feature004OwnershipClaim', 'status', 'staged', 'unstaged', 'headOid',
    'indexOid', 'worktreeGitOid', 'worktreeSha256', 'byteLength', 'additions',
    'deletions', 'hunkCount', 'hunkBodySha256', 'lastCommit'
  ] : [
    'path', 'basePresence', 'previousIdentityRef', 'pathKind', 'classification',
    'ownerAttribution', 'feature004OwnershipClaim', 'status', 'staged',
    'unstaged', 'headOid', 'indexOid', 'worktreeGitOid', 'worktreeSha256',
    'byteLength', 'additions', 'deletions', 'hunkCount', 'hunkBodySha256',
    'lastCommit'
  ];
  assertExactOrderedKeys(record, expectedKeys, label);
  assert.equal(record.path, V7_FOREIGN_PATH_ORDER[index], `${label}.path is exact and ordered`);
  assert.equal(record.pathKind, 'tracked', `${label}.pathKind is tracked`);
  assert.equal(record.classification, 'foreign-unrelated', `${label}.classification remains foreign`);
  assert.equal(record.ownerAttribution, 'owner: unknown', `${label}.owner remains unknown`);
  assert.equal(record.feature004OwnershipClaim, false, `${label} grants no Feature 004 ownership`);
  assert.equal(record.status, ' M', `${label}.status is exact`);
  assert.equal(record.staged, false, `${label} is not staged`);
  assert.equal(record.unstaged, true, `${label} is unstaged`);
  assert.equal(record.hunkCount, record.hunkBodySha256.length, `${label} has a complete hunk inventory`);
  record.hunkBodySha256.forEach((hash, hunkIndex) => assertSha256(hash, `${label}.hunkBodySha256[${hunkIndex}]`));
  if (index === 0) {
    assert.equal(record.basePresence, 'v4-v6-successor');
    assert.equal(record.previousIdentityRef,
      'feature004-dirty-collision-foreign-roadmap-v6.foreignRoadmapOverlay.currentIdentity');
  } else {
    assert.equal(record.basePresence, 'absent-from-v4');
    assert.equal(record.previousIdentityRef, null);
  }
  if (index === 2) {
    assert.equal(record.possibleContext, 'Feature 012 shared adapter context');
    assert.equal(record.possibleContextVerified, false);
  }
  if (verifyCurrent) {
    assert.deepEqual(v7IdentityDynamicFields(record), currentIdentityWithNumstat(record.path),
      `${label} matches current OID, SHA-256, byte counts, and ordered hunks`);
  }
}

function validateForeignSetV7(v7, v6, v5, v4, canonical = v7, verifyCurrent = true) {
  assertExactCanonicalContract(v7, canonical, 'foreign set v7 block');
  assertExactOrderedKeys(v7, [
    'contractVersion',
    'findingId',
    'capturedAt',
    'extendsContracts',
    'inventoryProof',
    'v6HistoricalContract',
    'foreignSetOverlay',
    'pendingV5SemanticTransition',
    'parserOrder',
    'parserHandoff',
    'adversarialMutations',
    'preservationContract',
    'planningRouting',
    'testOwnerHandoff'
  ], 'foreign set v7 block');
  assert.equal(v7.contractVersion, 'feature004-dirty-collision-foreign-set/v7');
  assert.equal(v7.findingId, 'F004-COLLISION-FOREIGN-SET-V7');
  assertUtcTimestamp(v7.capturedAt, 'foreign set v7 capturedAt');
  assert.deepEqual(v7.extendsContracts, [
    { marker: 'feature004-dirty-collision-foreign-roadmap-v6', rawBlockSha256: FOREIGN_ROADMAP_V6_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v5', rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 }
  ], 'foreign set v7 parents are exact and ordered');
  assert.deepEqual(v7.inventoryProof, {
    v4CapturedPathCount: 42,
    v4ExistingForeignPath: '.vscode/mcp.json',
    reportRecursionExclusion: V7_REPORT_RECURSION_EXCLUSION,
    lockFileExclusion: V7_LOCK_FILE_EXCLUSION,
    currentUncapturedPathCount: 2,
    currentUncapturedPaths: V7_NEW_FOREIGN_PATHS,
    roadmapAlreadyCapturedByV4: true,
    onlyDeclaredExclusionsAllowed: true,
    inventoryCommandMode: 'git status --porcelain=v1 -z --untracked-files=all'
  }, 'foreign set v7 inventory and exclusions are exact');
  assert.deepEqual(v7.v6HistoricalContract, {
    marker: 'feature004-dirty-collision-foreign-roadmap-v6',
    rawBlockSha256: FOREIGN_ROADMAP_V6_BLOCK_SHA256,
    schemaAndHashValidationRequired: true,
    historicalOverlayValidationRequired: true,
    liveCurrentComparisonWhenV7Present: false,
    disposition: 'mandatory-historical-input'
  }, 'foreign set v7 keeps v6 fully validated but historical');
  assertExactOrderedKeys(v7.foreignSetOverlay, [
    'overlayCount', 'roadmapSuccessorCount', 'newPathCount', 'pathOrder',
    'diffMode', 'hunkHashInput', 'currentIdentities', 'semanticApproval',
    'semanticAcceptance', 'ownershipTransfer', 'completionClaim',
    'certificationClaim'
  ], 'foreign set v7 overlay');
  assert.deepEqual({
    overlayCount: v7.foreignSetOverlay.overlayCount,
    roadmapSuccessorCount: v7.foreignSetOverlay.roadmapSuccessorCount,
    newPathCount: v7.foreignSetOverlay.newPathCount,
    pathOrder: v7.foreignSetOverlay.pathOrder,
    diffMode: v7.foreignSetOverlay.diffMode,
    hunkHashInput: v7.foreignSetOverlay.hunkHashInput
  }, {
    overlayCount: 3,
    roadmapSuccessorCount: 1,
    newPathCount: 2,
    pathOrder: V7_FOREIGN_PATH_ORDER,
    diffMode: 'git diff --no-ext-diff --unified=0',
    hunkHashInput: 'ordered changed lines with plus or minus prefix joined by LF with no trailing LF'
  }, 'foreign set v7 overlay cardinality, order, and hashing mode are exact');
  assert.equal(v7.foreignSetOverlay.currentIdentities.length, 3,
    'foreign set v7 contains exactly the roadmap successor and two additions');
  v7.foreignSetOverlay.currentIdentities.forEach((record, index) => assertV7IdentityRecord(record, index, verifyCurrent));
  assert.equal(v7.foreignSetOverlay.currentIdentities[0].worktreeGitOid,
    'f1286d2db719048541b5843040640126a68d74db');
  assert.equal(v7.foreignSetOverlay.currentIdentities[0].worktreeSha256,
    'ce3ce690906bbac5466ce0571d089557487559502f3ab15f9b5818db45798d2d');
  assert.equal(v7.foreignSetOverlay.currentIdentities[0].hunkCount, 25);
  assert.ok(['semanticApproval', 'semanticAcceptance', 'ownershipTransfer', 'completionClaim', 'certificationClaim']
    .every((field) => v7.foreignSetOverlay[field] === false),
  'foreign set v7 grants no semantic, ownership, completion, or certification claim');
  assert.deepEqual(v7.pendingV5SemanticTransition, {
    marker: 'feature004-dirty-collision-current-identity-v5',
    rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256,
    status: 'authorized-unapplied',
    path: COLLISION_PARSER_PATH,
    function: 'validateOwnerSettledSuccessor',
    oldHunkSha256: 'c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848',
    newHunkSha256: '56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae',
    semanticTransitionCount: 1,
    applicationOrder: 'after-foreign-set-v7-overlay'
  }, 'foreign set v7 retains the exact unapplied v5 semantic transition');
  assert.deepEqual(v7.parserOrder, [
    'validate exact v4 and construct its complete 42-path base inventory',
    'validate exact v6 schema, raw hash, parent hashes, and historical roadmap overlay without a live-current comparison',
    'parse exactly one closed v7 block, overlay the roadmap successor, and add exactly two foreign paths while preserving both exclusions',
    'apply the exact authorized v5 five-assertion semantic transition',
    'recompute the complete current matrix and reject every remaining, duplicate, missing, reordered, excluded, or newly introduced path'
  ], 'foreign set v7 parser order is exact');
  assertExactOrderedKeys(v7.parserHandoff, [
    'owner', 'path', 'newPinLiteral', 'pinCountDelta', 'normalizedMode',
    'retainedPinLiterals', 'applicationOrder', 'testEditBoundary',
    'productEditsAllowed'
  ], 'foreign set v7 parserHandoff');
  assert.equal(v7.parserHandoff.owner, 'bubbles.test');
  assert.equal(v7.parserHandoff.path, COLLISION_PARSER_PATH);
  assert.equal(v7.parserHandoff.newPinLiteral, 'FOREIGN_SET_V7_BLOCK_SHA256');
  assert.equal(v7.parserHandoff.pinCountDelta, 1);
  assert.equal(v7.parserHandoff.normalizedMode, 'normalized-self-pins/v4');
  assert.deepEqual(v7.parserHandoff.retainedPinLiterals, NORMALIZED_SELF_PIN_NAMES_V3);
  assert.equal(v7.parserHandoff.productEditsAllowed, false);
  assert.equal(v7.preservationContract.v4RemainsByteIdentical, true);
  assert.equal(v7.preservationContract.v5RemainsByteIdentical, true);
  assert.equal(v7.preservationContract.v6RemainsByteIdentical, true);
  assert.equal(v7.preservationContract.v7OverlayMustPrecedeV5SemanticTransition, true);
  assert.equal(v7.preservationContract.reportRecursionExclusionRemainsExact, true);
  assert.equal(v7.preservationContract.lockFileExclusionRemainsExact, true);
  assert.equal(v7.preservationContract.gitStateMutationAllowed, false);
  assert.deepEqual(v7.planningRouting.updatedPaths, V7_PLANNING_PATHS,
    'foreign set v7 planning paths are exact and ordered');
  assert.equal(v7.planningRouting.transitionRequestId, 'TR-F004-SCOPE01-FOREIGN-SET-V7-001');
  assert.equal(v7.planningRouting.nextRequiredOwner, 'bubbles.test');
  assert.ok(['scopeStatusChanged', 'checkboxChanged', 'featureStatusChanged', 'certificationChanged']
    .every((field) => v7.planningRouting[field] === false),
  'foreign set v7 planning routing changes no completion state');
  assert.equal(v7.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v7.testOwnerHandoff.transitionRequestId, 'TR-F004-SCOPE01-FOREIGN-SET-V7-001');
  assert.equal(v7.testOwnerHandoff.nextRequiredOwner, 'bubbles.test');
  assert.equal(v6.foreignRoadmapOverlay.currentIdentity.worktreeGitOid,
    '016656d4bc39799cb976e02208f8a3ec81bdabc6', 'v6 historical roadmap identity remains exact');
  assert.equal(v5.parserTransition.allowedHunk.newSha256,
    '56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae');
  assert.equal(v4.contractVersion, 'feature004-dirty-collision-current-identity/v4');
}

function v7RecordForMatrix(record) {
  const {
    basePresence: ignoredBasePresence,
    previousIdentityRef: ignoredPreviousIdentityRef,
    possibleContext: ignoredPossibleContext,
    possibleContextVerified: ignoredPossibleContextVerified,
    byteLength: ignoredByteLength,
    additions: ignoredAdditions,
    deletions: ignoredDeletions,
    ...identity
  } = record;
  return identity;
}

function v6RecordForMatrix(record) {
  const { byteLength: ignoredByteLength, additions: ignoredAdditions, deletions: ignoredDeletions, ...identity } = record;
  return identity;
}

function composeV4V6V7IdentityMatrix(v4, v6, v7) {
  const matrix = {
    requiredScope1Paths: structuredClone(v4.requiredScope1Paths),
    foreignProtectedPaths: structuredClone(v4.foreignProtectedPaths)
  };
  const stage = {
    v4Validated: true,
    v6HistoricalOverlayApplied: false,
    v7ForeignSetOverlayApplied: false,
    v5SemanticTransitionApplied: false
  };
  replaceIdentityRecord(matrix.foreignProtectedPaths, V7_ROADMAP_PATH, (prior) => {
    assert.deepEqual(prior, v6.previousRoadmapIdentity,
      'v6 historical overlay starts from the exact v4 roadmap record');
    return v6RecordForMatrix(v6.foreignRoadmapOverlay.currentIdentity);
  }, 'v6 historical roadmap overlay');
  stage.v6HistoricalOverlayApplied = true;

  const [roadmap, ...additions] = v7.foreignSetOverlay.currentIdentities;
  replaceIdentityRecord(matrix.foreignProtectedPaths, V7_ROADMAP_PATH, (prior) => {
    assert.deepEqual(prior, v6RecordForMatrix(v6.foreignRoadmapOverlay.currentIdentity),
      'v7 roadmap successor overlays the exact historical v6 roadmap identity');
    return v7RecordForMatrix(roadmap);
  }, 'v7 roadmap successor overlay');
  additions.forEach((record, index) => {
    assert.equal(matrix.foreignProtectedPaths.some((candidate) => candidate.path === record.path), false,
      `v7 addition ${record.path} was absent from v4`);
    assert.equal(record.path, V7_NEW_FOREIGN_PATHS[index], `v7 addition ${index} order is exact`);
    matrix.foreignProtectedPaths.push(v7RecordForMatrix(record));
  });
  stage.v7ForeignSetOverlayApplied = true;
  return { matrix, stage };
}

function currentDirtyPathsOutsideScopeOneV7() {
  return git(['status', '--porcelain=v1', '-z', '--untracked-files=all'])
    .split('\0')
    .filter(Boolean)
    .map((entry) => entry.slice(3))
    .filter((path) => path !== V7_REPORT_RECURSION_EXCLUSION && path !== V7_LOCK_FILE_EXCLUSION)
    .filter((path) => !REQUIRED_SCOPE_ONE_PATHS.includes(path));
}

function assertForeignSetV7CurrentMatrix(matrix, v7) {
  assert.deepEqual(matrix.requiredScope1Paths.map((record) => record.path), REQUIRED_SCOPE_ONE_PATHS,
    'v7 matrix retains all 19 v4 Scope 1 paths in order');
  const expectedForeignPaths = matrix.foreignProtectedPaths.map((record) => record.path);
  assert.equal(new Set(expectedForeignPaths).size, expectedForeignPaths.length,
    'v7 matrix contains no duplicate foreign path');
  assert.ok(expectedForeignPaths.includes('.vscode/mcp.json'),
    'v7 matrix retains the inherited .vscode/mcp.json record');
  assert.equal(expectedForeignPaths.includes(V7_REPORT_RECURSION_EXCLUSION), false,
    'v7 matrix excludes report recursion');
  assert.equal(expectedForeignPaths.includes(V7_LOCK_FILE_EXCLUSION), false,
    'v7 matrix excludes the session lock file');
  assert.deepEqual([...expectedForeignPaths].sort(), [...currentDirtyPathsOutsideScopeOneV7()].sort(),
    'v7 matrix contains every and only current foreign dirty path after the two exact exclusions');

  const planningIdentityPaths = new Set(v7.planningRouting.updatedPaths);
  for (const record of [...matrix.requiredScope1Paths, ...matrix.foreignProtectedPaths]) {
    if (record.path === COLLISION_PARSER_PATH || planningIdentityPaths.has(record.path)) continue;
    assert.deepEqual(currentV4PathIdentity(record.path), recordWithoutOwnership(record),
      `v7 matrix ${record.path} status, index, worktree, and ordered hunks are exact`);
  }
  normalizedSelfSourceIdentityV4(readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8'));
}

function assertV5SemanticTransitionAppliedAfterV7(v5, stage) {
  assert.equal(stage.v4Validated, true, 'v5 semantic transition follows v4 validation');
  assert.equal(stage.v6HistoricalOverlayApplied, true, 'v5 semantic transition follows historical v6 overlay validation');
  assert.equal(stage.v7ForeignSetOverlayApplied, true, 'v5 semantic transition follows v7 current identity equality');
  assert.equal(stage.v5SemanticTransitionApplied, false, 'v5 semantic transition applies exactly once after v7');
  const source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const oldHunk = v5.parserTransition.allowedHunk.oldLines.join('\n');
  const newHunk = v5.parserTransition.allowedHunk.newLines.join('\n');
  assert.equal(countExact(source, oldHunk), 0, 'v5 old five-assertion hunk is absent after v7');
  assert.equal(countExact(source, newHunk), 1, 'v5 authorized successor hunk exists exactly once after v7');
  assert.equal(sha256(newHunk), v5.parserTransition.allowedHunk.newSha256,
    'v5 authorized successor hunk retains its exact SHA-256');
  stage.v5SemanticTransitionApplied = true;
}

function assertV5LifecycleMutationFails(v5, label, mutate) {
  const state = JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8'));
  mutate(state, v5);
  assert.throws(() => validateFeatureTenLifecycleState(state, v5), label);
}

function runV5LifecycleAdversarialCases(v5) {
  const historicalIndex = (state) => state.executionHistory.findIndex((entry) =>
    Object.entries(v5.historicalOwnerReturn.executionHistorySelector).every(([key, value]) => entry[key] === value));
  const cases = [
    ['v5 mutated historical status', (state) => { state.executionHistory[historicalIndex(state)].statusAfter = 'done'; }],
    ['v5 mutated historical completed scopes', (state) => { state.executionHistory[historicalIndex(state)].scopesCompleted = ['SCOPE-01']; }],
    ['v5 mutated historical false completion claim', (state) => { state.executionHistory[historicalIndex(state)].exactEvidence.scopeComplete = true; }],
    ['v5 absent current status', (state) => { delete state.status; }],
    ['v5 not-started current status', (state) => { state.status = 'not_started'; }],
    ['v5 in-progress current status', (state) => { state.status = 'in_progress'; }],
    ['v5 blocked current status', (state) => { state.status = 'blocked'; }],
    ['v5 unknown current status', (state) => { state.status = 'unknown'; }],
    ['v5 wrong certifiedAt', (state) => { state.certifiedAt = '2026-07-30T14:41:31Z'; }],
    ['v5 missing scope progress', (state) => { state.execution.scopeProgress.pop(); }],
    ['v5 extra scope progress', (state) => { state.execution.scopeProgress.push({ scope: 9, status: 'done' }); }],
    ['v5 duplicate scope progress', (state) => { state.execution.scopeProgress[7] = structuredClone(state.execution.scopeProgress[6]); }],
    ['v5 reordered scope progress', (state) => { state.execution.scopeProgress.reverse(); }],
    ['v5 non-done scope progress', (state) => { state.execution.scopeProgress[0].status = 'in_progress'; }],
    ['v5 missing completed scope', (state) => { state.certification.completedScopes.pop(); }],
    ['v5 extra completed scope', (state) => { state.certification.completedScopes.push('SCOPE-09'); }],
    ['v5 duplicate completed scope', (state) => { state.certification.completedScopes[7] = state.certification.completedScopes[6]; }],
    ['v5 missing certified phase', (state) => { state.certification.certifiedCompletedPhases.pop(); }],
    ['v5 extra certified phase', (state) => { state.certification.certifiedCompletedPhases.push('unknown'); }],
    ['v5 duplicate certified phase', (state) => { state.certification.certifiedCompletedPhases[12] = state.certification.certifiedCompletedPhases[11]; }],
    ['v5 reordered certified phases', (state) => { state.certification.certifiedCompletedPhases.reverse(); }],
    ['v5 missing resolved transition', (state) => { state.transitionRequests = state.transitionRequests.filter((request) => request.id !== v5.resolvedTransition.id); }],
    ['v5 duplicate resolved transition', (state) => { const request = state.transitionRequests.find((entry) => entry.id === v5.resolvedTransition.id); state.transitionRequests.push(structuredClone(request)); }],
    ['v5 unresolved transition', (state) => { state.transitionRequests.find((request) => request.id === v5.resolvedTransition.id).status = 'open'; }],
    ['v5 mutated transition route', (state) => { state.transitionRequests.find((request) => request.id === v5.resolvedTransition.id).routedTo = 'bubbles.plan'; }]
  ];
  cases.forEach(([label, mutate]) => assertV5LifecycleMutationFails(v5, label, mutate));
}

function validateHistoricalChainedMatrixForV7(matrix, v4) {
  assert.deepEqual(matrix.requiredScope1Paths.map((record) => record.path), REQUIRED_SCOPE_ONE_PATHS,
    'historical v4/v6 matrix retains all Scope 1 paths');
  assert.deepEqual([...matrix.foreignProtectedPaths.map((record) => record.path)].sort(),
    [...v4.foreignProtectedPaths.map((record) => record.path)].sort(),
    'historical v4/v6 matrix retains the exact v4 foreign membership before v7');
}

function runForeignSetV7AdversarialCases() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  assert.throws(() => parseReportBlock(`${report}\n${v7Block.raw}`, 'feature004-dirty-collision-foreign-set-v7'),
    'duplicate v7 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v7Block.raw, ''), 'feature004-dirty-collision-foreign-set-v7'),
    'missing v7 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v7Block.raw,
    v7Block.raw.replace('```json\n{', '```json\n{ malformed')), 'feature004-dirty-collision-foreign-set-v7'),
  'malformed v7 report block fails closed');
  assert.throws(() => assertPinnedReportBlock(`${v7Block.raw} `, FOREIGN_SET_V7_BLOCK_SHA256,
    'mutated foreign set v7 block'), 'v7 marker-inclusive byte drift fails closed');
  assertEveryClosedSchemaMutationFails(v7Block.value,
    (candidate) => validateForeignSetV7(candidate, v6Block.value, v5Block.value, v4Block.value, v7Block.value, false),
    'foreign set v7 block');
  assertEveryClosedSchemaMutationFails(v6Block.value,
    (candidate) => validateForeignRoadmapV6(candidate, v5Block.value, v4Block.value, v6Block.value, false),
    'historical foreign roadmap v6 block under v7');

  const { matrix, stage } = composeV4V6V7IdentityMatrix(v4Block.value, v6Block.value, v7Block.value);
  const matrixCases = [
    ['v7 missing addition', (value) => { value.foreignProtectedPaths = value.foreignProtectedPaths.filter((record) => record.path !== V7_NEW_FOREIGN_PATHS[0]); }],
    ['v7 duplicate addition', (value) => { value.foreignProtectedPaths.push(structuredClone(value.foreignProtectedPaths.find((record) => record.path === V7_NEW_FOREIGN_PATHS[0]))); }],
    ['v7 extra addition', (value) => { value.foreignProtectedPaths.push({ ...structuredClone(value.foreignProtectedPaths[0]), path: 'docs/Unexpected.md' }); }],
    ['v7 reordered addition', (value) => { value.foreignProtectedPaths.reverse(); }],
    ['v7 missing inherited mcp identity', (value) => { value.foreignProtectedPaths = value.foreignProtectedPaths.filter((record) => record.path !== '.vscode/mcp.json'); }],
    ['v7 changed inherited mcp identity', (value) => { value.foreignProtectedPaths.find((record) => record.path === '.vscode/mcp.json').worktreeSha256 = '0'.repeat(64); }],
    ['v7 subset identity comparison', (value) => { value.foreignProtectedPaths = value.foreignProtectedPaths.slice(0, 1); }]
  ];
  matrixCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(matrix);
    mutate(candidate);
    assert.throws(() => assertForeignSetV7CurrentMatrix(candidate, v7Block.value), label);
  });
  const earlyStage = structuredClone(stage);
  earlyStage.v7ForeignSetOverlayApplied = false;
  assert.throws(() => assertV5SemanticTransitionAppliedAfterV7(v5Block.value, earlyStage),
    'v5 semantic transition before v7 fails closed');
  assert.throws(() => validateForeignRoadmapV6(v6Block.value, v5Block.value, v4Block.value,
    v6Block.value, true), 'v6 live-current comparison is forbidden when v7 exists');

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const normalized = normalizedSelfSourceIdentityV4(parserSource);
  const changedPins = parserSource
    .replace(DURABLE_EVIDENCE_BLOCK_SHA256, '1'.repeat(64))
    .replace(CURRENT_IDENTITY_V4_BLOCK_SHA256, '2'.repeat(64))
    .replace(CURRENT_IDENTITY_V5_BLOCK_SHA256, '3'.repeat(64))
    .replace(FOREIGN_ROADMAP_V6_BLOCK_SHA256, '4'.repeat(64))
    .replace(FOREIGN_SET_V7_BLOCK_SHA256, '5'.repeat(64));
  assert.deepEqual(normalizedSelfSourceIdentityV4(changedPins), normalized,
    'normalized-self-pins/v4 normalizes exactly all five valid pin values');
  const v7PinCases = [
    ['missing', (value) => value.replace(/^const FOREIGN_SET_V7_BLOCK_SHA256.*\n/m, '')],
    ['duplicate', (value) => value.replace(/^const FOREIGN_SET_V7_BLOCK_SHA256.*$/m, (line) => `${line}\n${line}`)],
    ['renamed', (value) => value.replace('FOREIGN_SET_V7_BLOCK_SHA256', 'FOREIGN_SET_CURRENT_BLOCK_SHA256')],
    ['nonhex', (value) => value.replace(FOREIGN_SET_V7_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered', (value) => {
      const lines = value.split('\n');
      const v6Index = lines.findIndex((line) => line.startsWith('const FOREIGN_ROADMAP_V6_BLOCK_SHA256'));
      const v7Index = lines.findIndex((line) => line.startsWith('const FOREIGN_SET_V7_BLOCK_SHA256'));
      [lines[v6Index], lines[v7Index]] = [lines[v7Index], lines[v6Index]];
      return lines.join('\n');
    }]
  ];
  v7PinCases.forEach(([label, mutate]) => {
    assert.throws(() => parseNormalizedSelfPinsV4(mutate(parserSource)),
      `normalized-self-pins/v4 rejects ${label} v7 pin`);
  });
  assert.notDeepEqual(normalizedSelfSourceIdentityV4(parserSource.replace(
    "const V7_ROADMAP_PATH = '", "const V7_ROADMAP_PATH = './")), normalized,
  'normalized-self-pins/v4 does not exempt non-pin parser drift');
  runV5LifecycleAdversarialCases(v5Block.value);
}

let foreignSetV7ValidationLogged = false;
const parseCollisionContractsBeforeForeignSetV7 = parseCollisionContracts;
const validateForeignRoadmapV6BeforeForeignSetV7 = validateForeignRoadmapV6;
const assertAuthorizedCurrentIdentityMatrixBeforeForeignSetV7 = assertAuthorizedCurrentIdentityMatrix;

function parseCollisionContractsWithForeignSetV7() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  assertPinnedReportBlock(v4Block.raw, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block');
  assertPinnedReportBlock(v5Block.raw, CURRENT_IDENTITY_V5_BLOCK_SHA256, 'current identity v5 block');
  assertPinnedReportBlock(v6Block.raw, FOREIGN_ROADMAP_V6_BLOCK_SHA256, 'foreign roadmap v6 block');
  assertPinnedReportBlock(v7Block.raw, FOREIGN_SET_V7_BLOCK_SHA256, 'foreign set v7 block');
  assert.equal(Buffer.byteLength(v7Block.raw), FOREIGN_SET_V7_BLOCK_BYTE_LENGTH,
    'foreign set v7 marker-inclusive byte length is exact');
  validateCurrentIdentityV4Schema(v4Block.value);
  validateCurrentIdentityV5(v5Block.value, v4Block.value);
  validateForeignRoadmapV6BeforeForeignSetV7(v6Block.value, v5Block.value, v4Block.value,
    v6Block.value, false);
  validateForeignSetV7(v7Block.value, v6Block.value, v5Block.value, v4Block.value);
  const { matrix, stage } = composeV4V6V7IdentityMatrix(v4Block.value, v6Block.value, v7Block.value);
  assertForeignSetV7CurrentMatrix(matrix, v7Block.value);
  assertV5SemanticTransitionAppliedAfterV7(v5Block.value, stage);
  validateFeatureTenLifecycleState(JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8')),
    v5Block.value);
  validateChainedParserSource(v5Block.value);
  normalizedSelfSourceIdentityV4(readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8'));

  const activeV6Validator = validateForeignRoadmapV6;
  const activeMatrixValidator = assertAuthorizedCurrentIdentityMatrix;
  const previousLogState = chainedSuccessorValidationLogged;
  validateForeignRoadmapV6 = (v6, v5, v4, canonical = v6) =>
    validateForeignRoadmapV6BeforeForeignSetV7(v6, v5, v4, canonical, false);
  assertAuthorizedCurrentIdentityMatrix = (historicalMatrix) =>
    validateHistoricalChainedMatrixForV7(historicalMatrix, v4Block.value);
  chainedSuccessorValidationLogged = true;
  let inherited;
  try {
    inherited = parseCollisionContractsBeforeForeignSetV7();
  } finally {
    validateForeignRoadmapV6 = activeV6Validator;
    assertAuthorizedCurrentIdentityMatrix = activeMatrixValidator;
    chainedSuccessorValidationLogged = previousLogState;
  }
  if (!foreignSetV7ValidationLogged) {
    console.log(`FEATURE004_V4_VALIDATED marker=feature004-dirty-collision-current-identity-v4 sha256=${CURRENT_IDENTITY_V4_BLOCK_SHA256} paths=42`);
    console.log(`FEATURE004_V6_VALIDATED marker=feature004-dirty-collision-foreign-roadmap-v6 sha256=${FOREIGN_ROADMAP_V6_BLOCK_SHA256} disposition=mandatory-historical-input liveComparison=false`);
    console.log(`FEATURE004_V7_VALIDATED marker=feature004-dirty-collision-foreign-set-v7 sha256=${FOREIGN_SET_V7_BLOCK_SHA256} roadmap=f1286d2db719048541b5843040640126a68d74db hunks=25 additions=2`);
    console.log(`FEATURE004_V5_VALIDATED marker=feature004-dirty-collision-current-identity-v5 sha256=${CURRENT_IDENTITY_V5_BLOCK_SHA256} status=done scopeProgress=8 completedScopes=8 phases=13`);
    foreignSetV7ValidationLogged = true;
  }
  return {
    ...inherited,
    currentIdentityV5: v5Block.value,
    currentIdentityV5Raw: v5Block.raw,
    foreignRoadmapV6: v6Block.value,
    foreignRoadmapV6Raw: v6Block.raw,
    foreignSetV7: v7Block.value,
    foreignSetV7Raw: v7Block.raw,
    chainedIdentityMatrix: matrix
  };
}

parseCollisionContracts = parseCollisionContractsWithForeignSetV7;
assert.equal(validateForeignRoadmapV6, validateForeignRoadmapV6BeforeForeignSetV7,
  'v7 parser preserves the active v6 validator outside its bounded historical parse');
assert.equal(assertAuthorizedCurrentIdentityMatrix, assertAuthorizedCurrentIdentityMatrixBeforeForeignSetV7,
  'v7 parser preserves the active matrix validator outside its bounded historical parse');
/* FEATURE-004-COLLISION-FOREIGN-SET-V7-END */

/* FEATURE-004-COLLISION-POST-COMMIT-V9-BEGIN */
const POST_COMMIT_V9_REQUIRED_HEAD = '62776e7e6102fa07019aa006cc0d7ff07085190e';
const POST_COMMIT_V9_MARKER = 'feature004-dirty-collision-post-commit-v9';
const POST_COMMIT_V9_HELPER_BEGIN = '/* FEATURE-004-COLLISION-POST-COMMIT-V9-BEGIN */';
const POST_COMMIT_V9_HELPER_END = '/* FEATURE-004-COLLISION-POST-COMMIT-V9-END */';
const POST_COMMIT_V9_REQUIRED_DIRTY_TRACKED_PATHS = [
  'rlfx.js',
  'rlexperience.js',
  'rlbrief.js',
  'rljourney.js',
  COLLISION_PARSER_PATH
];
const POST_COMMIT_V9_REQUIRED_UNTRACKED_PATHS = [
  'fx-vehicle-universe.json',
  'tests/feature-004-vehicle-universe.test.mjs',
  'tests/feature-004-tool-control-binding.test.mjs',
  'tests/feature-004-brief-eligibility.test.mjs',
  'tests/feature-004-journey-evidence-refresh.test.mjs'
];
const POST_COMMIT_V9_FOREIGN_CONTRACTS = [
  ['.vscode/mcp.json', 'foreign-workspace-config', 'workspace configuration owner'],
  ['specs/004-fx-regime-relative-value-lab/design.md', 'foreign-specialist-artifact', 'bubbles.design'],
  ['specs/004-fx-regime-relative-value-lab/scenario-manifest.json', 'foreign-planning-artifact', 'bubbles.plan'],
  ['specs/004-fx-regime-relative-value-lab/scopes.md', 'foreign-planning-artifact', 'bubbles.plan'],
  ['specs/004-fx-regime-relative-value-lab/spec.md', 'foreign-specialist-artifact', 'bubbles.analyst'],
  ['specs/004-fx-regime-relative-value-lab/state.json', 'foreign-planning-routing-artifact', 'bubbles.plan (execution routing only)'],
  ['specs/004-fx-regime-relative-value-lab/test-plan.json', 'foreign-planning-artifact', 'bubbles.plan'],
  ['specs/004-fx-regime-relative-value-lab/uservalidation.md', 'foreign-human-artifact', 'human owner'],
  ['specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md', 'foreign-feature-artifact', 'Feature 012 / bubbles.plan'],
  ['tests/simple-production-bridge.integration.mjs', 'foreign-feature-test', 'Feature 012 / bubbles.test'],
  ['tests/simple-production-bridge.unit.mjs', 'foreign-feature-test', 'Feature 012 / bubbles.test']
].map(([path, classification, ownerAttribution]) => ({ path, classification, ownerAttribution }));
const POST_COMMIT_V9_FOREIGN_PATHS = POST_COMMIT_V9_FOREIGN_CONTRACTS.map(({ path }) => path);
const POST_COMMIT_V9_EXCLUDED_PATHS = [REPORT_PATH, V7_LOCK_FILE_EXCLUSION];
const POST_COMMIT_V9_FULL_RECORD_FIELDS = [
  'path',
  'pathKind',
  'classification',
  'ownerAttribution',
  'feature004OwnershipClaim',
  'transitionClass',
  'status',
  'staged',
  'unstaged',
  'headOid',
  'indexOid',
  'worktreeGitOid',
  'worktreeSha256',
  'byteLength',
  'additions',
  'deletions',
  'hunkCount',
  'hunkBodySha256',
  'lastCommit'
];
const POST_COMMIT_V9_SUMMARY_FIELDS = [
  'path',
  'pathKind',
  'classification',
  'ownerAttribution',
  'feature004OwnershipClaim',
  'transitionClass',
  'status',
  'hunkCount',
  'hunkSequenceSha256',
  'identitySha256'
];
const POST_COMMIT_V9_ADVERSARIAL_MUTATIONS = [
  'wrong required HEAD before append, after append, or during parser adoption',
  'missing, extra, duplicate, or reordered required or foreign path',
  'clean historical foreign path retained or current dirty path omitted',
  'clean-promotion, still-dirty, or untracked transition mismatch',
  'wrong status, staging flags, HEAD/index/worktree OID, worktree SHA-256, byte length, numstat, hunk count, hunk order, hunk hash, last commit, hunk-sequence hash, identity hash, or complete matrix hash',
  'wrong classification, owner attribution, Feature 004 ownership flag, or ownership transfer',
  'changed, missing, extra, reordered, or matrix-included exclusion',
  'wrong, missing, duplicate, or reordered predecessor marker or hash',
  'v5 validation before v9 or v6/v7 live-current comparison when v9 exists',
  'semantic approval, acceptance, completion, checkbox, scope-status, top-level-status, or certification inference',
  'missing, duplicate, renamed, reordered, non-64-hex, or changed v9 pin',
  'parser mutation outside the additive v9 pin/version/schema/current-matrix/adversarial branch'
];

function parseNormalizedSelfPinsV5(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V5,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6|FOREIGN_SET_V7|POST_COMMIT_V9)[A-Z0-9_]*BLOCK_SHA256) = '([^']*)';$/gm,
    'normalized-self-pins/v5');
}

function normalizedSelfSourceIdentityV5(source) {
  parseNormalizedSelfPins(source);
  parseNormalizedSelfPinsV2(source);
  parseNormalizedSelfPinsV3(source);
  parseNormalizedSelfPinsV4(source);
  parseNormalizedSelfPinsV5(source);
  const normalizedBytes = Buffer.from(normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V5), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes)
  };
}

function assertPostCommitV9PinValue(source) {
  const assignments = parseNormalizedSelfPinsV5(source);
  assert.equal(assignments.at(-1)[1], 'POST_COMMIT_V9_BLOCK_SHA256',
    'normalized-self-pins/v5 ends with the v9 pin');
  assert.equal(assignments.at(-1)[2], POST_COMMIT_V9_BLOCK_SHA256,
    'the v9 pin retains the exact marker-inclusive report hash');
}

function stripPostCommitV9MarkerBranch(source) {
  const startNeedle = `${POST_COMMIT_V9_HELPER_BEGIN}\n`;
  const endNeedle = `${POST_COMMIT_V9_HELPER_END}\n`;
  assert.equal(source.split(startNeedle).length - 1, 1, 'the v9 parser branch has exactly one start marker line');
  assert.equal(source.split(endNeedle).length - 1, 1, 'the v9 parser branch has exactly one end marker line');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'the v9 parser branch marker order is exact');
  return source.slice(0, start) + source.slice(end + endNeedle.length);
}

function stripPostCommitV9Source(source) {
  let historical = stripPostCommitV9MarkerBranch(source);
  historical = removeExactSuccessorAddition(historical,
    `const POST_COMMIT_V9_BLOCK_SHA256 = '${POST_COMMIT_V9_BLOCK_SHA256}';\n`,
    'v9 pin addition');
  historical = removeExactSuccessorAddition(historical,
    "const NORMALIZED_SELF_PIN_NAMES_V5 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V4,\n  'POST_COMMIT_V9_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v5 declaration');
  return historical;
}

function stripPostCommitV9Diff(diff) {
  const normalizedV5Addition = [
    '+const NORMALIZED_SELF_PIN_NAMES_V5 = [',
    '+  ...NORMALIZED_SELF_PIN_NAMES_V4,',
    "+  'POST_COMMIT_V9_BLOCK_SHA256'",
    '+];'
  ].join('\n');
  assert.equal(diff.split(normalizedV5Addition).length - 1, 1,
    'the v9 diff contains exactly one normalized-self-pins/v5 declaration');
  const withoutNormalizedV5 = diff.replace(normalizedV5Addition, '');
  const exactAddedLines = new Set([
    `+const POST_COMMIT_V9_BLOCK_SHA256 = '${POST_COMMIT_V9_BLOCK_SHA256}';`
  ]);
  const seenExactLines = new Map([...exactAddedLines].map((line) => [line, 0]));
  const kept = [];
  let inBranch = false;
  let branchStarts = 0;
  let branchEnds = 0;
  for (const line of withoutNormalizedV5.split('\n')) {
    if (line === `+${POST_COMMIT_V9_HELPER_BEGIN}`) {
      inBranch = true;
      branchStarts += 1;
      continue;
    }
    if (inBranch) {
      if (line === `+${POST_COMMIT_V9_HELPER_END}`) {
        inBranch = false;
        branchEnds += 1;
      }
      continue;
    }
    if (exactAddedLines.has(line)) {
      seenExactLines.set(line, seenExactLines.get(line) + 1);
      continue;
    }
    kept.push(line);
  }
  assert.equal(inBranch, false, 'the v9 diff branch closes');
  assert.equal(branchStarts, 1, 'the v9 diff contains exactly one branch start');
  assert.equal(branchEnds, 1, 'the v9 diff contains exactly one branch end');
  seenExactLines.forEach((count, line) => assert.equal(count, 1, `the v9 diff contains exactly one ${line.slice(1)}`));
  return kept.join('\n');
}

function postCommitV9HistoricalParserIdentity() {
  const path = COLLISION_PARSER_PATH;
  const source = readFileSync(resolve(ROOT, path), 'utf8');
  const historicalSource = stripPostCommitV9Source(source);
  const historicalBytes = Buffer.from(historicalSource, 'utf8');
  const historicalHunks = parseDiffHunks(stripPostCommitV9Diff(
    git(['diff', '--no-ext-diff', '--unified=0', '--', path])))
    .filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(path);
  return {
    path,
    pathKind: 'tracked',
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(path),
    indexOid: indexOid(path),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: historicalBytes
    }).trim(),
    worktreeSha256: sha256(historicalBytes),
    byteLength: historicalBytes.length,
    additions: historicalHunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: historicalHunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: historicalHunks.length,
    hunkBodySha256: historicalHunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(path)
  };
}

function postCommitV9Numstat(path, current) {
  if (current.pathKind === 'untracked') return { additions: null, deletions: null };
  if (current.status === '') return { additions: 0, deletions: 0 };
  const fields = git(['diff', '--numstat', '--', path]).trim().split('\t');
  assert.equal(fields.length, 3, `v9 ${path} has one exact numstat record`);
  assert.equal(fields[2], path, `v9 ${path} numstat resolves the exact path`);
  assert.match(fields[0], /^\d+$/, `v9 ${path} additions are numeric`);
  assert.match(fields[1], /^\d+$/, `v9 ${path} deletions are numeric`);
  return { additions: Number(fields[0]), deletions: Number(fields[1]) };
}

function postCommitV9CurrentRecord(summary) {
  const current = summary.path === COLLISION_PARSER_PATH
    ? postCommitV9HistoricalParserIdentity()
    : currentV4PathIdentity(summary.path);
  const bytes = summary.path === COLLISION_PARSER_PATH
    ? null
    : readFileSync(resolve(ROOT, summary.path));
  const numstat = summary.path === COLLISION_PARSER_PATH
    ? { additions: current.additions, deletions: current.deletions }
    : postCommitV9Numstat(summary.path, current);
  return {
    path: summary.path,
    pathKind: current.pathKind,
    classification: summary.classification,
    ownerAttribution: summary.ownerAttribution,
    feature004OwnershipClaim: summary.feature004OwnershipClaim,
    transitionClass: summary.transitionClass,
    status: current.status,
    staged: current.staged,
    unstaged: current.unstaged,
    headOid: current.headOid,
    indexOid: current.indexOid,
    worktreeGitOid: current.worktreeGitOid,
    worktreeSha256: current.worktreeSha256,
    byteLength: bytes?.length ?? current.byteLength,
    additions: numstat.additions,
    deletions: numstat.deletions,
    hunkCount: current.hunkCount,
    hunkBodySha256: current.hunkBodySha256,
    lastCommit: current.lastCommit
  };
}

function postCommitV9RequiredTransition(path) {
  if (POST_COMMIT_V9_REQUIRED_DIRTY_TRACKED_PATHS.includes(path)) return 'still-dirty-exact-identity';
  if (POST_COMMIT_V9_REQUIRED_UNTRACKED_PATHS.includes(path)) return 'untracked-exact-identity';
  return 'clean-head-index-promotion';
}

function assertPostCommitV9Summary(summary, record, label) {
  assertExactOrderedKeys(summary, POST_COMMIT_V9_SUMMARY_FIELDS, label);
  assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS, `${label} full record`);
  assert.equal(summary.pathKind, record.pathKind, `${label}.pathKind is current`);
  assert.equal(summary.status, record.status, `${label}.status is current`);
  assert.equal(summary.hunkCount, record.hunkCount, `${label}.hunkCount is current`);
  record.hunkBodySha256.forEach((hash, index) => assertSha256(hash, `${label}.hunkBodySha256[${index}]`));
  assert.equal(summary.hunkSequenceSha256, sha256(JSON.stringify(record.hunkBodySha256)),
    `${label} commits the complete ordered hunk sequence`);
  assert.equal(summary.identitySha256, sha256(JSON.stringify(record)),
    `${label} commits the complete ordered full record`);
}

function postCommitV9PorcelainPaths() {
  return git(['status', '--porcelain=v1', '-z', '--untracked-files=all'])
    .split('\0')
    .filter(Boolean)
    .map((entry) => entry.slice(3));
}

function assertPostCommitV9RecordCommitments(v9, requiredRecords, foreignRecords,
  excludedPaths = POST_COMMIT_V9_EXCLUDED_PATHS, verifyInventory = true) {
  assert.deepEqual(requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'v9 full required records retain all 19 paths in exact order');
  assert.deepEqual(foreignRecords.map(({ path }) => path), POST_COMMIT_V9_FOREIGN_PATHS,
    'v9 full foreign records retain exactly 11 paths in exact order');
  assert.deepEqual(excludedPaths, POST_COMMIT_V9_EXCLUDED_PATHS,
    'v9 retains exactly report recursion and the session lock as exclusions');
  assert.equal(new Set([...requiredRecords, ...foreignRecords].map(({ path }) => path)).size, 30,
    'v9 matrix contains 30 unique non-excluded records');
  requiredRecords.forEach((record, index) =>
    assertPostCommitV9Summary(v9.postCommitMatrix.requiredRecords[index], record,
      `post-commit v9 requiredRecords[${index}]`));
  foreignRecords.forEach((record, index) =>
    assertPostCommitV9Summary(v9.postCommitMatrix.foreignRecords[index], record,
      `post-commit v9 foreignRecords[${index}]`));
  const matrix = {
    requiredHead: v9.requiredHead,
    requiredRecords,
    foreignRecords,
    excludedPaths
  };
  assert.equal(sha256(JSON.stringify(matrix)), v9.identityContract.matrixSha256,
    'v9 complete uncompressed matrix hash is exact');
  if (!verifyInventory) return;
  const porcelainPaths = postCommitV9PorcelainPaths();
  assert.equal(porcelainPaths.length, v9.inventoryProof.porcelainPathCount,
    'v9 NUL-safe porcelain inventory has exactly 23 paths');
  assert.deepEqual(POST_COMMIT_V9_EXCLUDED_PATHS.map((path) => shortStatus(path)), [' M', '??'],
    'v9 exclusions are present only as report recursion and the session flock');
  const currentNonExcluded = porcelainPaths.filter((path) => !POST_COMMIT_V9_EXCLUDED_PATHS.includes(path));
  const expectedDirty = [...requiredRecords, ...foreignRecords]
    .filter(({ status }) => status !== '')
    .map(({ path }) => path);
  assert.deepEqual([...currentNonExcluded].sort(), [...expectedDirty].sort(),
    'v9 matrix equals every and only current dirty path after the two exact exclusions');
  assert.equal(requiredRecords.filter(({ status }) => status !== '').length,
    v9.inventoryProof.dirtyRequiredPathCount, 'v9 has exactly ten dirty required paths');
  assert.equal(foreignRecords.filter(({ status }) => status !== '').length,
    v9.inventoryProof.foreignDirtyPathCount, 'v9 has exactly eleven dirty foreign paths');
}

function validatePostCommitV9(v9, v7, v6, v5, v4, durable, canonical = v9, verifyCurrent = true) {
  assertExactCanonicalContract(v9, canonical, 'post-commit v9 block');
  assertExactOrderedKeys(v9, [
    'contractVersion', 'findingId', 'capturedAt', 'requiredHead', 'extendsContracts',
    'historicalValidation', 'identityContract', 'inventoryProof', 'postCommitMatrix',
    'pendingV5SemanticTransition', 'parserOrder', 'parserHandoff',
    'adversarialMutations', 'captureStability', 'planningRouting', 'testOwnerHandoff'
  ], 'post-commit v9 block');
  assert.equal(v9.contractVersion, 'feature004-dirty-collision-post-commit/v9');
  assert.equal(v9.findingId, 'F004-COLLISION-POST-COMMIT-V9');
  assertUtcTimestamp(v9.capturedAt, 'post-commit v9 capturedAt');
  assert.equal(v9.requiredHead, POST_COMMIT_V9_REQUIRED_HEAD);
  assert.equal(git(['rev-parse', 'HEAD']).trim(), POST_COMMIT_V9_REQUIRED_HEAD,
    'v9 parser adoption occurs at the exact required HEAD');
  assert.deepEqual(v9.extendsContracts, [
    { marker: 'feature004-dirty-collision-foreign-set-v7', rawBlockSha256: FOREIGN_SET_V7_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-roadmap-v6', rawBlockSha256: FOREIGN_ROADMAP_V6_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v5', rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 },
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ], 'post-commit v9 predecessor markers and hashes are exact and ordered');
  assert.deepEqual(v9.historicalValidation, {
    v4SchemaAndHashRequired: true,
    durableEvidenceSchemaAndHashRequired: true,
    v6SchemaHashParentsAndOverlayRequired: true,
    v7SchemaHashParentsAndOverlayRequired: true,
    v6LiveCurrentComparisonWhenV9Present: false,
    v7LiveCurrentComparisonWhenV9Present: false,
    disposition: 'mandatory-history-before-v9'
  }, 'post-commit v9 keeps v4, durable evidence, v6, and v7 as mandatory history');
  assert.deepEqual(v9.identityContract.fullRecordOrderedFields, POST_COMMIT_V9_FULL_RECORD_FIELDS,
    'post-commit v9 full-record fields are exact and ordered');
  assert.equal(v9.identityContract.identitySha256Input,
    'JSON.stringify of the full record with the exact ordered fields above');
  assert.equal(v9.identityContract.hunkSequenceSha256Input,
    'JSON.stringify of the complete ordered hunkBodySha256 array');
  assert.equal(v9.identityContract.diffMode, 'git diff --no-ext-diff --unified=0');
  assert.equal(v9.identityContract.hunkHashInput,
    'ordered changed lines with plus or minus prefix joined by LF with no trailing LF');
  assert.equal(v9.identityContract.inventoryMode, 'git status --porcelain=v1 -z --untracked-files=all');
  assert.equal(v9.identityContract.matrixSha256Input,
    'JSON.stringify({requiredHead,requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records');
  assert.equal(v9.identityContract.matrixSha256,
    '93ce0cf879f994d7d2df0df3d00da21a6bd5e3c8324ca230e577cc93f459ff42');
  assert.deepEqual(v9.inventoryProof, {
    porcelainPathCount: 23,
    dirtyRequiredPathCount: 10,
    foreignDirtyPathCount: 11,
    excludedDirtyPathCount: 2,
    requiredPathCount: 19,
    requiredTransitionCounts: {
      'clean-head-index-promotion': 9,
      'still-dirty-exact-identity': 5,
      'untracked-exact-identity': 5
    },
    priorV7ForeignPathsNowClean: [
      'docs/Product-Review-and-Roadmap.md',
      'docs/Improvement-Plan.md',
      'etf-momentum-lab.html'
    ],
    cleanHistoricalForeignRecordsRetained: false,
    completionInferenceFromCommit: false
  }, 'post-commit v9 inventory and transition counts are exact');
  assertExactOrderedKeys(v9.postCommitMatrix, [
    'requiredRecords', 'foreignRecords', 'excludedPaths', 'ownershipTransfer',
    'semanticApproval', 'completionClaim', 'certificationClaim'
  ], 'post-commit v9 matrix');
  assert.deepEqual(v9.postCommitMatrix.requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'post-commit v9 contains all 19 required summaries in order');
  assert.deepEqual(v9.postCommitMatrix.foreignRecords.map(({ path }) => path), POST_COMMIT_V9_FOREIGN_PATHS,
    'post-commit v9 contains exactly 11 foreign summaries in order');
  v9.postCommitMatrix.requiredRecords.forEach((summary, index) => {
    assertExactOrderedKeys(summary, POST_COMMIT_V9_SUMMARY_FIELDS,
      `post-commit v9 requiredRecords[${index}]`);
    assert.equal(summary.classification, 'feature004-scope1-required');
    assert.equal(summary.ownerAttribution, 'Feature 004 Scope 1');
    assert.equal(summary.feature004OwnershipClaim, true);
    assert.equal(summary.transitionClass, postCommitV9RequiredTransition(summary.path));
    assert.equal(summary.pathKind,
      POST_COMMIT_V9_REQUIRED_UNTRACKED_PATHS.includes(summary.path) ? 'untracked' : 'tracked');
    assert.equal(summary.status,
      POST_COMMIT_V9_REQUIRED_UNTRACKED_PATHS.includes(summary.path) ? '??'
        : POST_COMMIT_V9_REQUIRED_DIRTY_TRACKED_PATHS.includes(summary.path) ? ' M' : '');
    assertSha256(summary.hunkSequenceSha256, `post-commit v9 requiredRecords[${index}].hunkSequenceSha256`);
    assertSha256(summary.identitySha256, `post-commit v9 requiredRecords[${index}].identitySha256`);
  });
  v9.postCommitMatrix.foreignRecords.forEach((summary, index) => {
    assertExactOrderedKeys(summary, POST_COMMIT_V9_SUMMARY_FIELDS,
      `post-commit v9 foreignRecords[${index}]`);
    assert.deepEqual({
      path: summary.path,
      classification: summary.classification,
      ownerAttribution: summary.ownerAttribution
    }, POST_COMMIT_V9_FOREIGN_CONTRACTS[index]);
    assert.equal(summary.pathKind, 'tracked');
    assert.equal(summary.feature004OwnershipClaim, false);
    assert.equal(summary.transitionClass, 'still-dirty-exact-identity');
    assert.equal(summary.status, ' M');
    assertSha256(summary.hunkSequenceSha256, `post-commit v9 foreignRecords[${index}].hunkSequenceSha256`);
    assertSha256(summary.identitySha256, `post-commit v9 foreignRecords[${index}].identitySha256`);
  });
  assert.deepEqual(v9.postCommitMatrix.excludedPaths, POST_COMMIT_V9_EXCLUDED_PATHS);
  assert.ok(['ownershipTransfer', 'semanticApproval', 'completionClaim', 'certificationClaim']
    .every((field) => v9.postCommitMatrix[field] === false),
  'post-commit v9 grants no ownership, semantic, completion, or certification claim');
  assert.deepEqual(v9.pendingV5SemanticTransition, {
    marker: 'feature004-dirty-collision-current-identity-v5',
    rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256,
    status: 'already-physical-requires-validation-after-v9',
    path: COLLISION_PARSER_PATH,
    function: 'validateOwnerSettledSuccessor',
    oldHunkSha256: 'c9f2fcf6cfe7782af378ed713ce424bc1d7075af29c296400eb9c3402568d848',
    newHunkSha256: '56f14a8579a6714ea5a83ac8185cd74d16c6543bc81e0a4ecc43d8d1797bbbae',
    semanticTransitionCount: 1,
    applicationOrder: 'after-post-commit-v9-matrix'
  }, 'post-commit v9 defers the exact physical v5 transition');
  assert.deepEqual(v9.parserOrder, [
    'validate exact v4 and durable-evidence schemas, hashes, and historical records without live-current comparison',
    'validate exact v6 and v7 schemas, hashes, parent links, and historical overlays without live-current comparison',
    'parse exactly one closed v9 block and apply the complete 19-required plus 11-foreign post-commit matrix at the exact required HEAD',
    'validate and apply the already-physical v5 five-assertion semantic transition only after v9',
    'recompute complete current dirty-path equality with exactly report recursion and the session flock excluded'
  ], 'post-commit v9 parser order is exact');
  assert.equal(v9.parserHandoff.owner, 'bubbles.test');
  assert.equal(v9.parserHandoff.path, COLLISION_PARSER_PATH);
  assert.equal(v9.parserHandoff.newPinLiteral, 'POST_COMMIT_V9_BLOCK_SHA256');
  assert.equal(v9.parserHandoff.pinCountDelta, 1);
  assert.equal(v9.parserHandoff.normalizedMode, 'normalized-self-pins/v5');
  assert.deepEqual(v9.parserHandoff.retainedPinLiterals, NORMALIZED_SELF_PIN_NAMES_V4);
  assert.equal(v9.parserHandoff.productEditsAllowed, false);
  assert.deepEqual(v9.adversarialMutations, POST_COMMIT_V9_ADVERSARIAL_MUTATIONS,
    'post-commit v9 adversarial mutation list is exact and complete');
  assert.deepEqual(v9.captureStability, {
    preAppendMatrixSha256: '93ce0cf879f994d7d2df0df3d00da21a6bd5e3c8324ca230e577cc93f459ff42',
    postAppendMustMatch: true,
    headMustRemainExact: true,
    rollbackBoundary: 'remove only incomplete v9 planning additions and return blocked',
    foreignOrProductRollbackAllowed: false
  }, 'post-commit v9 capture stability is exact');
  assert.deepEqual(v9.planningRouting.updatedPaths, [
    REPORT_PATH,
    'specs/004-fx-regime-relative-value-lab/scopes.md',
    'specs/004-fx-regime-relative-value-lab/test-plan.json',
    'specs/004-fx-regime-relative-value-lab/state.json'
  ], 'post-commit v9 planning paths are exact and ordered');
  assert.equal(v9.planningRouting.transitionRequestId, 'TR-F004-SCOPE01-POST-COMMIT-V9-001');
  assert.equal(v9.planningRouting.nextRequiredOwner, 'bubbles.test');
  assert.ok(['scopeStatusChanged', 'checkboxChanged', 'featureStatusChanged', 'certificationChanged']
    .every((field) => v9.planningRouting[field] === false),
  'post-commit v9 planning routing changes no completion state');
  assert.equal(v9.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v9.testOwnerHandoff.transitionRequestId, 'TR-F004-SCOPE01-POST-COMMIT-V9-001');
  assert.equal(v9.testOwnerHandoff.nextRequiredOwner, 'bubbles.test');
  assert.equal(v7.contractVersion, 'feature004-dirty-collision-foreign-set/v7');
  assert.equal(v6.contractVersion, 'feature004-dirty-collision-foreign-roadmap/v6');
  assert.equal(v5.contractVersion, 'feature004-dirty-collision-current-identity/v5');
  assert.equal(v4.contractVersion, 'feature004-dirty-collision-current-identity/v4');
  assert.equal(durable.contractVersion, 'feature004-durable-evidence-admission/v1');
  if (!verifyCurrent) return null;
  const requiredRecords = v9.postCommitMatrix.requiredRecords.map(postCommitV9CurrentRecord);
  const foreignRecords = v9.postCommitMatrix.foreignRecords.map(postCommitV9CurrentRecord);
  assertPostCommitV9RecordCommitments(v9, requiredRecords, foreignRecords);
  return { requiredRecords, foreignRecords };
}

function assertHistoricalPostCommitV9Stage(stage, label) {
  assert.equal(stage.v4Validated, true, `${label} follows v4 history`);
  assert.equal(stage.v6HistoricalOverlayApplied, true, `${label} follows v6 history`);
  assert.equal(stage.v7ForeignSetOverlayApplied, true, `${label} follows v7 history`);
  assert.equal(stage.v5SemanticTransitionApplied, false, `${label} defers v5 physical validation`);
}

function validateInheritedCollisionHistory(v4, v6, v7) {
  const historicalV7Matrix = composeV4V6V7IdentityMatrix(v4, v6, v7).matrix;
  const activeV5Validator = validateCurrentIdentityV5;
  const activeV7Validator = validateForeignSetV7;
  const activeV7MatrixValidator = assertForeignSetV7CurrentMatrix;
  const activeV5AfterV6 = assertV5SemanticTransitionAppliedAfterRoadmap;
  const activeV5AfterV7 = assertV5SemanticTransitionAppliedAfterV7;
  const activeLifecycleValidator = validateFeatureTenLifecycleState;
  const activeParserValidator = validateChainedParserSource;
  const previousV6LogState = chainedSuccessorValidationLogged;
  const previousV7LogState = foreignSetV7ValidationLogged;
  validateCurrentIdentityV5 = () => {};
  validateForeignSetV7 = (value, historicalV6, historicalV5, historicalV4, canonical = value) =>
    activeV7Validator(value, historicalV6, historicalV5, historicalV4, canonical, false);
  assertForeignSetV7CurrentMatrix = (candidate) => assert.deepEqual(candidate, historicalV7Matrix,
    'v7 matrix remains exact historical input while v9 owns live equality');
  assertV5SemanticTransitionAppliedAfterRoadmap = (_v5, stage) => {
    assert.equal(stage.foreignRoadmapOverlayApplied, true, 'historical v6 overlay precedes deferred v5');
    assert.equal(stage.v5SemanticTransitionApplied, false, 'historical v6 does not apply v5 under v9');
  };
  assertV5SemanticTransitionAppliedAfterV7 = (_v5, stage) =>
    assertHistoricalPostCommitV9Stage(stage, 'historical v7 validation');
  validateFeatureTenLifecycleState = () => {};
  validateChainedParserSource = () => {};
  chainedSuccessorValidationLogged = true;
  foreignSetV7ValidationLogged = true;
  try {
    return parseCollisionContractsBeforePostCommitV9();
  } finally {
    validateCurrentIdentityV5 = activeV5Validator;
    validateForeignSetV7 = activeV7Validator;
    assertForeignSetV7CurrentMatrix = activeV7MatrixValidator;
    assertV5SemanticTransitionAppliedAfterRoadmap = activeV5AfterV6;
    assertV5SemanticTransitionAppliedAfterV7 = activeV5AfterV7;
    validateFeatureTenLifecycleState = activeLifecycleValidator;
    validateChainedParserSource = activeParserValidator;
    chainedSuccessorValidationLogged = previousV6LogState;
    foreignSetV7ValidationLogged = previousV7LogState;
  }
}

const fullCurrentSelftestIdentityBeforePostCommitV9 = fullCurrentSelftestIdentity;
const currentDiffHunksBeforePostCommitV9 = currentDiffHunks;
const markerSliceBeforePostCommitV9 = markerSlice;
const featureTenMarkerSliceBeforePostCommitV9 = featureTenMarkerSlice;
const currentPathIdentityBeforePostCommitV9 = currentPathIdentity;
const headOidBeforePostCommitV9 = headOid;
const lastCommitBeforePostCommitV9 = lastCommit;
const validateSelftestSuccessorV2BeforePostCommitV9 = validateSelftestSuccessorV2;
const validateSelftestSuccessorV3BeforePostCommitV9 = validateSelftestSuccessorV3;

function historicalSelftestHunks(successorV2, successorV3) {
  return successorV2.orderedDiffHunks.map((hunk, index) => ({
    hunkIndex: hunk.hunkIndex,
    header: hunk.header,
    additionCount: hunk.additionCount,
    deletionCount: hunk.deletionCount,
    changedLineCount: hunk.changedLineCount,
    hunkBodySha256: hunk.hunkBodySha256,
    changedLines: index === 0 && successorV3
      ? [`-${successorV3.orderedDiffHunks[0].deletedCommittedLine}`]
      : []
  }));
}

function validateHistoricalSelftestSuccessor(ownerSettledSelftest, successorV2,
  successorV3, canonical, validate) {
  const checkpoints = new Map(successorV2.protectedPathIdentities.map((record) => [record.path, record]));
  const activeFullIdentity = fullCurrentSelftestIdentity;
  const activeDiffHunks = currentDiffHunks;
  const activeMarkerSlice = markerSlice;
  const activeFeatureTenMarkerSlice = featureTenMarkerSlice;
  const activeCurrentPathIdentity = currentPathIdentity;
  const activeHeadOid = headOid;
  const activeLastCommit = lastCommit;
  fullCurrentSelftestIdentity = () => structuredClone(successorV2.currentSelftestIdentity);
  currentDiffHunks = (path) => path === 'scripts/selftest.mjs'
    ? historicalSelftestHunks(successorV2, successorV3)
    : currentDiffHunksBeforePostCommitV9(path);
  markerSlice = () => EXPECTED_SETTLED_SYMBOLS.join(' ');
  featureTenMarkerSlice = () => '';
  currentPathIdentity = (path) => checkpointIdentityWithoutCommit(checkpoints.get(path));
  headOid = (path) => checkpoints.get(path).headOid;
  lastCommit = (path) => checkpoints.get(path).lastCommit;
  try {
    return validate(ownerSettledSelftest, successorV2, successorV3, canonical);
  } finally {
    fullCurrentSelftestIdentity = activeFullIdentity;
    currentDiffHunks = activeDiffHunks;
    markerSlice = activeMarkerSlice;
    featureTenMarkerSlice = activeFeatureTenMarkerSlice;
    currentPathIdentity = activeCurrentPathIdentity;
    headOid = activeHeadOid;
    lastCommit = activeLastCommit;
  }
}

function validateSelftestSuccessorV2AsPostCommitHistory(ownerSettledSelftest, successor, canonical) {
  assertExactCanonicalContract(successor, canonical, 'historical selftest successor v2');
  assert.equal(successor.markerOwnership.feature011.currentGroupTitleCount, 0,
    'historical selftest successor v2 retains the absent Feature 011 group title');
  const projectedSuccessor = structuredClone(successor);
  const projectedCanonical = structuredClone(canonical);
  const currentGroupTitleCount = (readFileSync(resolve(ROOT, 'scripts/selftest.mjs'), 'utf8')
    .match(/Feature 011 RLVOL foundation/g) || []).length;
  projectedSuccessor.markerOwnership.feature011.currentGroupTitleCount = currentGroupTitleCount;
  projectedCanonical.markerOwnership.feature011.currentGroupTitleCount = currentGroupTitleCount;
  return validateHistoricalSelftestSuccessor(ownerSettledSelftest, projectedSuccessor, null, projectedCanonical,
    (ownerSettled, historicalV2, _unusedV3, expected) =>
      validateSelftestSuccessorV2BeforePostCommitV9(ownerSettled, historicalV2, expected));
}

function validateSelftestSuccessorV3AsPostCommitHistory(successorV2, successor, canonical) {
  return validateHistoricalSelftestSuccessor(null, successorV2, successor, canonical,
    (_unusedOwnerSettled, historicalV2, historicalV3, expected) =>
      validateSelftestSuccessorV3BeforePostCommitV9(historicalV2, historicalV3, expected));
}

function assertV5SemanticTransitionAppliedAfterV9(v5, stage) {
  assert.equal(stage.postCommitV9MatrixApplied, true, 'v5 physical validation follows the complete v9 matrix');
  assert.equal(stage.v5SemanticTransitionApplied, false, 'v5 physical transition validates exactly once after v9');
  const source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const oldHunk = v5.parserTransition.allowedHunk.oldLines.join('\n');
  const newHunk = v5.parserTransition.allowedHunk.newLines.join('\n');
  assert.equal(v5.parserTransition.allowedHunk.newLines.length, 5,
    'v5 successor remains the exact five-assertion semantic transition');
  assert.equal(countExact(source, oldHunk), 0, 'v5 old five-assertion hunk remains absent after v9');
  assert.equal(countExact(source, newHunk), 1, 'v5 successor hunk exists exactly once after v9');
  assert.equal(sha256(newHunk), v5.parserTransition.allowedHunk.newSha256,
    'v5 successor hunk retains the exact authorized SHA-256 after v9');
  stage.v5SemanticTransitionApplied = true;
}

function assertHistoricalV6V7LiveComparisonForbidden(version, verifyCurrent) {
  assert.equal(verifyCurrent, false, `${version} live-current comparison is forbidden when v9 exists`);
}

function runInheritedV7AdversarialCasesAsHistory(v4, v6, v7) {
  const historicalMatrix = composeV4V6V7IdentityMatrix(v4, v6, v7).matrix;
  const activeV6Validator = validateForeignRoadmapV6;
  const activeV7MatrixValidator = assertForeignSetV7CurrentMatrix;
  validateForeignRoadmapV6 = (value, v5, historicalV4, canonical = value, verifyCurrent = false) => {
    assertHistoricalV6V7LiveComparisonForbidden('v6', verifyCurrent);
    return activeV6Validator(value, v5, historicalV4, canonical, false);
  };
  assertForeignSetV7CurrentMatrix = (candidate) => assert.deepEqual(candidate, historicalMatrix,
    'v7 adversarial matrix remains exact historical input under v9');
  try {
    runForeignSetV7AdversarialCasesBeforePostCommitV9();
  } finally {
    validateForeignRoadmapV6 = activeV6Validator;
    assertForeignSetV7CurrentMatrix = activeV7MatrixValidator;
  }
}

function assertPostCommitV9RecordMutationFails(v9, requiredRecords, foreignRecords, label, mutate) {
  const requiredCandidate = structuredClone(requiredRecords);
  const foreignCandidate = structuredClone(foreignRecords);
  mutate(requiredCandidate, foreignCandidate);
  assert.throws(() => assertPostCommitV9RecordCommitments(v9, requiredCandidate, foreignCandidate,
    POST_COMMIT_V9_EXCLUDED_PATHS, false), label);
}

function runPostCommitV9AdversarialCases() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  runInheritedV7AdversarialCasesAsHistory(v4Block.value, v6Block.value, v7Block.value);
  assert.throws(() => parseReportBlock(`${report}\n${v9Block.raw}`, POST_COMMIT_V9_MARKER),
    'duplicate v9 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v9Block.raw, ''), POST_COMMIT_V9_MARKER),
    'missing v9 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v9Block.raw,
    v9Block.raw.replace('```json\n{', '```json\n{ malformed')), POST_COMMIT_V9_MARKER),
  'malformed v9 report block fails closed');
  assert.throws(() => assertPinnedReportBlock(`${v9Block.raw} `, POST_COMMIT_V9_BLOCK_SHA256,
    'mutated post-commit v9 block'), 'v9 marker-inclusive byte drift fails closed');
  assertEveryClosedSchemaMutationFails(v9Block.value,
    (candidate) => validatePostCommitV9(candidate, v7Block.value, v6Block.value, v5Block.value,
      v4Block.value, durableBlock.value, v9Block.value, false), 'post-commit v9 block');

  const requiredRecords = v9Block.value.postCommitMatrix.requiredRecords.map(postCommitV9CurrentRecord);
  const foreignRecords = v9Block.value.postCommitMatrix.foreignRecords.map(postCommitV9CurrentRecord);
  const matrixCases = [
    ['v9 missing required path', (required) => { required.pop(); }],
    ['v9 extra required path', (required) => { required.push({ ...structuredClone(required[0]), path: 'unexpected-required' }); }],
    ['v9 duplicate required path', (required) => { required.push(structuredClone(required[0])); }],
    ['v9 reordered required paths', (required) => { required.reverse(); }],
    ['v9 missing foreign path', (_required, foreign) => { foreign.pop(); }],
    ['v9 extra foreign path', (_required, foreign) => { foreign.push({ ...structuredClone(foreign[0]), path: 'docs/Unexpected.md' }); }],
    ['v9 duplicate foreign path', (_required, foreign) => { foreign.push(structuredClone(foreign[0])); }],
    ['v9 reordered foreign paths', (_required, foreign) => { foreign.reverse(); }],
    ['v9 retains clean historical foreign path', (_required, foreign) => {
      foreign.push({ ...structuredClone(foreign[0]), path: 'docs/Product-Review-and-Roadmap.md', status: '' });
    }],
    ['v9 omits current dirty path', (_required, foreign) => { foreign.shift(); }],
    ['v9 transition class mismatch', (required) => { required[0].transitionClass = 'clean-head-index-promotion'; }],
    ['v9 classification mismatch', (_required, foreign) => { foreign[0].classification = 'feature004-scope1-required'; }],
    ['v9 owner mismatch', (_required, foreign) => { foreign[0].ownerAttribution = 'Feature 004 Scope 1'; }],
    ['v9 ownership transfer', (_required, foreign) => { foreign[0].feature004OwnershipClaim = true; }]
  ];
  matrixCases.forEach(([label, mutate]) =>
    assertPostCommitV9RecordMutationFails(v9Block.value, requiredRecords, foreignRecords, label, mutate));
  POST_COMMIT_V9_FULL_RECORD_FIELDS.forEach((field) => {
    assertPostCommitV9RecordMutationFails(v9Block.value, requiredRecords, foreignRecords,
      `v9 full record rejects changed ${field}`, (required) => {
        if (field === 'hunkBodySha256') required[0][field] = [...required[0][field]].reverse();
        else required[0][field] = changedLeafValue(required[0][field]);
      });
  });
  assert.throws(() => assertPostCommitV9RecordCommitments(v9Block.value, requiredRecords, foreignRecords,
    [V7_LOCK_FILE_EXCLUSION], false), 'v9 missing report exclusion fails closed');
  assert.throws(() => assertPostCommitV9RecordCommitments(v9Block.value, requiredRecords, foreignRecords,
    [...POST_COMMIT_V9_EXCLUDED_PATHS, 'docs/Unexpected.md'], false), 'v9 extra exclusion fails closed');
  assert.throws(() => assertPostCommitV9RecordCommitments(v9Block.value, requiredRecords, foreignRecords,
    [...POST_COMMIT_V9_EXCLUDED_PATHS].reverse(), false), 'v9 reordered exclusions fail closed');
  assert.throws(() => assertPostCommitV9RecordCommitments(v9Block.value, requiredRecords, foreignRecords,
    [REPORT_PATH, foreignRecords[0].path], false), 'v9 matrix-included exclusion fails closed');
  assert.throws(() => validatePostCommitV9({ ...structuredClone(v9Block.value), requiredHead: '0'.repeat(40) },
    v7Block.value, v6Block.value, v5Block.value, v4Block.value, durableBlock.value,
    v9Block.value, false), 'v9 wrong required HEAD fails closed');
  assert.throws(() => assertV5SemanticTransitionAppliedAfterV9(v5Block.value, {
    postCommitV9MatrixApplied: false,
    v5SemanticTransitionApplied: false
  }), 'v5 validation before v9 fails closed');
  assert.throws(() => assertHistoricalV6V7LiveComparisonForbidden('v6', true),
    'v6 live-current comparison under v9 fails closed');
  assert.throws(() => assertHistoricalV6V7LiveComparisonForbidden('v7', true),
    'v7 live-current comparison under v9 fails closed');

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const normalized = normalizedSelfSourceIdentityV5(parserSource);
  assertPostCommitV9PinValue(parserSource);
  const changedPins = parserSource
    .replace(DURABLE_EVIDENCE_BLOCK_SHA256, '1'.repeat(64))
    .replace(CURRENT_IDENTITY_V4_BLOCK_SHA256, '2'.repeat(64))
    .replace(CURRENT_IDENTITY_V5_BLOCK_SHA256, '3'.repeat(64))
    .replace(FOREIGN_ROADMAP_V6_BLOCK_SHA256, '4'.repeat(64))
    .replace(FOREIGN_SET_V7_BLOCK_SHA256, '5'.repeat(64))
    .replace(POST_COMMIT_V9_BLOCK_SHA256, '6'.repeat(64));
  assert.deepEqual(normalizedSelfSourceIdentityV5(changedPins), normalized,
    'normalized-self-pins/v5 normalizes exactly all six valid pin values');
  assert.throws(() => assertPostCommitV9PinValue(changedPins),
    'normalized-self-pins/v5 rejects a changed valid-hex v9 pin as report authority');
  const v9PinCases = [
    ['missing', (value) => value.replace(/^const POST_COMMIT_V9_BLOCK_SHA256.*\n/m, '')],
    ['duplicate', (value) => value.replace(/^const POST_COMMIT_V9_BLOCK_SHA256.*$/m, (line) => `${line}\n${line}`)],
    ['renamed', (value) => value.replace('POST_COMMIT_V9_BLOCK_SHA256', 'POST_COMMIT_CURRENT_BLOCK_SHA256')],
    ['nonhex', (value) => value.replace(POST_COMMIT_V9_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered', (value) => {
      const lines = value.split('\n');
      const v7Index = lines.findIndex((line) => line.startsWith('const FOREIGN_SET_V7_BLOCK_SHA256'));
      const v9Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V9_BLOCK_SHA256'));
      [lines[v7Index], lines[v9Index]] = [lines[v9Index], lines[v7Index]];
      return lines.join('\n');
    }],
    ['extra', (value) => value.replace(/^const POST_COMMIT_V9_BLOCK_SHA256.*$/m,
      (line) => `${line}\nconst POST_COMMIT_V9_EXTRA_BLOCK_SHA256 = '${'0'.repeat(64)}';`)]
  ];
  v9PinCases.forEach(([label, mutate]) => assert.throws(() => parseNormalizedSelfPinsV5(mutate(parserSource)),
    `normalized-self-pins/v5 rejects ${label} v9 pin`));
  assert.notDeepEqual(normalizedSelfSourceIdentityV5(parserSource.replace(
    "const POST_COMMIT_V9_REQUIRED_HEAD = '", "const POST_COMMIT_V9_REQUIRED_HEAD = './")), normalized,
  'normalized-self-pins/v5 does not exempt parser drift outside pin values');
  assert.throws(() => stripPostCommitV9Source(parserSource.replace(
    `\n${POST_COMMIT_V9_HELPER_END}\n`, `\n${POST_COMMIT_V9_HELPER_BEGIN}\n`)),
  'v9 parser branch marker mutation fails closed');
}

let postCommitV9ValidationLogged = false;
const parseCollisionContractsBeforePostCommitV9 = parseCollisionContracts;
const runForeignSetV7AdversarialCasesBeforePostCommitV9 = runForeignSetV7AdversarialCases;

function parseCollisionContractsWithPostCommitV9() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  assertPinnedReportBlock(durableBlock.raw, DURABLE_EVIDENCE_BLOCK_SHA256, 'durable evidence block');
  assertPinnedReportBlock(v4Block.raw, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block');
  assertPinnedReportBlock(v5Block.raw, CURRENT_IDENTITY_V5_BLOCK_SHA256, 'current identity v5 block');
  assertPinnedReportBlock(v6Block.raw, FOREIGN_ROADMAP_V6_BLOCK_SHA256, 'foreign roadmap v6 block');
  assertPinnedReportBlock(v7Block.raw, FOREIGN_SET_V7_BLOCK_SHA256, 'foreign set v7 block');
  assertPinnedReportBlock(v9Block.raw, POST_COMMIT_V9_BLOCK_SHA256, 'post-commit v9 block');
  assert.equal(Buffer.byteLength(v9Block.raw), 23091, 'post-commit v9 marker-inclusive byte length is exact');
  validateDurableEvidenceBlock(durableBlock.value);
  validateCurrentIdentityV4Schema(v4Block.value);
  validateForeignRoadmapV6BeforeForeignSetV7(v6Block.value, v5Block.value, v4Block.value,
    v6Block.value, false);
  validateForeignSetV7(v7Block.value, v6Block.value, v5Block.value, v4Block.value,
    v7Block.value, false);
  const inherited = validateInheritedCollisionHistory(v4Block.value, v6Block.value, v7Block.value);
  const matrix = validatePostCommitV9(v9Block.value, v7Block.value, v6Block.value,
    v5Block.value, v4Block.value, durableBlock.value);
  const stage = { postCommitV9MatrixApplied: true, v5SemanticTransitionApplied: false };
  validateCurrentIdentityV5(v5Block.value, v4Block.value);
  assertV5SemanticTransitionAppliedAfterV9(v5Block.value, stage);
  validateFeatureTenLifecycleState(JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8')),
    v5Block.value);
  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  assertPostCommitV9PinValue(parserSource);
  normalizedSelfSourceIdentityV5(parserSource);
  if (!postCommitV9ValidationLogged) {
    console.log(`FEATURE004_V4_DURABLE_VALIDATED v4=${CURRENT_IDENTITY_V4_BLOCK_SHA256} durable=${DURABLE_EVIDENCE_BLOCK_SHA256} liveComparison=false`);
    console.log(`FEATURE004_V6_V7_HISTORY_VALIDATED v6=${FOREIGN_ROADMAP_V6_BLOCK_SHA256} v7=${FOREIGN_SET_V7_BLOCK_SHA256} liveComparison=false`);
    console.log(`FEATURE004_V9_VALIDATED marker=${POST_COMMIT_V9_MARKER} sha256=${POST_COMMIT_V9_BLOCK_SHA256} schema=${v9Block.value.contractVersion} head=${POST_COMMIT_V9_REQUIRED_HEAD} required=${matrix.requiredRecords.length} foreign=${matrix.foreignRecords.length} exclusions=${POST_COMMIT_V9_EXCLUDED_PATHS.length} matrix=${v9Block.value.identityContract.matrixSha256}`);
    console.log(`FEATURE004_V5_VALIDATED marker=feature004-dirty-collision-current-identity-v5 sha256=${CURRENT_IDENTITY_V5_BLOCK_SHA256} after=v9 status=done scopeProgress=8 completedScopes=8 phases=13`);
    postCommitV9ValidationLogged = true;
  }
  return {
    ...inherited,
    currentIdentityV5: v5Block.value,
    currentIdentityV5Raw: v5Block.raw,
    foreignRoadmapV6: v6Block.value,
    foreignRoadmapV6Raw: v6Block.raw,
    foreignSetV7: v7Block.value,
    foreignSetV7Raw: v7Block.raw,
    postCommitV9: v9Block.value,
    postCommitV9Raw: v9Block.raw,
    postCommitV9Matrix: matrix
  };
}

parseCollisionContracts = parseCollisionContractsWithPostCommitV9;
runForeignSetV7AdversarialCases = runPostCommitV9AdversarialCases;
validateSelftestSuccessorV2 = validateSelftestSuccessorV2AsPostCommitHistory;
validateSelftestSuccessorV3 = validateSelftestSuccessorV3AsPostCommitHistory;
/* FEATURE-004-COLLISION-POST-COMMIT-V9-END */

/* FEATURE-004-COLLISION-POST-COMMIT-V10-BEGIN */
const { mkdtempSync, rmSync, writeFileSync } = await import('node:fs');
const { tmpdir } = await import('node:os');

function historicalValidatorPrefix(untracked, retainedValidator) {
  function readPrefix(candidateUntracked, candidateValidator) {
    const { commit, blobOid } = candidateValidator.introducingCommit;
    const validatorBytes = execFileSync('git', ['cat-file', 'blob', blobOid], { cwd: ROOT });
    assert.equal(git(['rev-parse', `${commit}:${candidateUntracked.path}`]).trim(), blobOid,
      'historical validator predecessor path resolves the pinned blob');
    const chunks = lineChunks(validatorBytes);
    assert.ok(chunks.length >= candidateUntracked.lineChunkCount,
      `${candidateUntracked.path} predecessor retains at least ${candidateUntracked.lineChunkCount} line chunks`);
    const prefixBytes = Buffer.from(chunks.slice(0, candidateUntracked.lineChunkCount).join(''), 'utf8');
    assert.equal(sha256(prefixBytes), candidateUntracked.worktreeSha256,
      `${candidateUntracked.path} predecessor first ${candidateUntracked.lineChunkCount} line chunks remain byte-identical`);
    return { chunks, prefixBytes };
  }

  const result = readPrefix(untracked, retainedValidator);
  const missingPredecessor = structuredClone(retainedValidator);
  missingPredecessor.introducingCommit.blobOid = '0'.repeat(40);
  assert.throws(() => readPrefix(untracked, missingPredecessor),
    'missing historical validator predecessor blob fails closed');

  const wrongPredecessor = structuredClone(retainedValidator);
  wrongPredecessor.introducingCommit.blobOid = git(['rev-parse', `HEAD:${untracked.path}`]).trim();
  assert.notEqual(wrongPredecessor.introducingCommit.blobOid, retainedValidator.introducingCommit.blobOid,
    'wrong-predecessor adversarial fixture resolves a distinct existing blob');
  assert.throws(() => readPrefix(untracked, wrongPredecessor),
    'wrong historical validator predecessor blob fails closed');

  const wrongPrefix = structuredClone(untracked);
  wrongPrefix.worktreeSha256 = '0'.repeat(64);
  assert.throws(() => readPrefix(wrongPrefix, retainedValidator),
    'wrong historical validator prefix hash fails closed');
  return result;
}

const POST_COMMIT_V10_REQUIRED_HEAD = '153a686c937017ae20a438f7a4a423cf76b019b3';
const POST_COMMIT_V10_MARKER = 'feature004-dirty-collision-post-commit-v10';
const POST_COMMIT_V10_HELPER_BEGIN = '/* FEATURE-004-COLLISION-POST-COMMIT-V10-BEGIN */';
const POST_COMMIT_V10_HELPER_END = '/* FEATURE-004-COLLISION-POST-COMMIT-V10-END */';
const POST_COMMIT_V10_PORCELAIN_PATHS = [
  '.vscode/mcp.json',
  'rlbrief.js',
  'rlexperience.js',
  'rlfx.js',
  'rljourney.js',
  'specs/004-fx-regime-relative-value-lab/design.md',
  'specs/004-fx-regime-relative-value-lab/report.md',
  'specs/004-fx-regime-relative-value-lab/scenario-manifest.json',
  'specs/004-fx-regime-relative-value-lab/scopes.md',
  'specs/004-fx-regime-relative-value-lab/spec.md',
  'specs/004-fx-regime-relative-value-lab/state.json',
  'specs/004-fx-regime-relative-value-lab/test-plan.json',
  'specs/004-fx-regime-relative-value-lab/uservalidation.md',
  'specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md',
  COLLISION_PARSER_PATH,
  'tests/simple-production-bridge.integration.mjs',
  'tests/simple-production-bridge.unit.mjs',
  V7_LOCK_FILE_EXCLUSION,
  'fx-vehicle-universe.json',
  'tests/feature-004-brief-eligibility.test.mjs',
  'tests/feature-004-journey-evidence-refresh.test.mjs',
  'tests/feature-004-tool-control-binding.test.mjs',
  'tests/feature-004-vehicle-universe.test.mjs'
];
const POST_COMMIT_V10_SCOPE_ONE_CURRENT_PATHS = [
  'rlbrief.js',
  'rlexperience.js',
  'rlfx.js',
  'rljourney.js',
  COLLISION_PARSER_PATH,
  'fx-vehicle-universe.json',
  'tests/feature-004-brief-eligibility.test.mjs',
  'tests/feature-004-journey-evidence-refresh.test.mjs',
  'tests/feature-004-tool-control-binding.test.mjs',
  'tests/feature-004-vehicle-universe.test.mjs'
];
const POST_COMMIT_V10_PLANNING_CURRENT_PATHS = [
  REPORT_PATH,
  'specs/004-fx-regime-relative-value-lab/scenario-manifest.json',
  'specs/004-fx-regime-relative-value-lab/scopes.md',
  'specs/004-fx-regime-relative-value-lab/state.json',
  'specs/004-fx-regime-relative-value-lab/test-plan.json',
  'specs/004-fx-regime-relative-value-lab/uservalidation.md'
];
const POST_COMMIT_V10_FEATURE_TWELVE_CURRENT_PATHS = [
  'specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md',
  'tests/simple-production-bridge.integration.mjs',
  'tests/simple-production-bridge.unit.mjs'
];
const POST_COMMIT_V10_FOREIGN_SPECIALIST_CURRENT_PATHS = [
  'specs/004-fx-regime-relative-value-lab/design.md',
  'specs/004-fx-regime-relative-value-lab/spec.md'
];
const POST_COMMIT_V10_EXCLUDED_PATHS = [REPORT_PATH, V7_LOCK_FILE_EXCLUSION];
const POST_COMMIT_V10_PARSER_ORDER = [
  'validate every predecessor marker-inclusive pin, closed schema, field order, parent link, and historical commitment through v9',
  "validate v9's exact required HEAD value and committed parser-self tuple as immutable history, then require the exact recorded v9 reconstruction mismatch tuple without substituting either tuple",
  'parse exactly one closed v10 block and require the exact current HEAD, 23-path porcelain order, classification groups, 30-record matrix, two exclusions, and zero-inference flags',
  'reconstruct the pre-v10 parser by removing only the exact v10 pin, normalized-family declaration, and closed v10 branch, then normalize the retained v5 pin family and compare the complete parser record',
  'recompute every complete required and foreign record, the matrix hash, and dirty-path equality while keeping both exclusions ineligible',
  'validate the already-physical v5 five-assertion semantic transition only after the v10 current matrix',
  'run all predecessor adversarial cases as mandatory history before the v10 adversarial cases'
];
const POST_COMMIT_V10_ADVERSARIAL_MUTATIONS = [
  'wrong current HEAD before append, after append, or during v10 parser adoption',
  'missing, duplicate, malformed, reordered, non-64-hex, or changed v10 marker or pin',
  'changed v9 marker-inclusive bytes, hash, byte length, schema, field order, required HEAD value, predecessor link, or committed self tuple',
  'missing, changed, or unexpectedly accepted v9 reconstruction mismatch tuple',
  'v9 committed self tuple replaced by the observed tuple or observed tuple replaced by the committed tuple',
  'v9 live HEAD or live matrix comparison executed as current when v10 exists',
  'any predecessor skipped because v10 exists',
  'missing, extra, duplicate, or reordered porcelain, required, foreign, classification-group, or excluded path',
  'wrong status, staging flags, HEAD/index/worktree OID, worktree SHA-256, byte length, numstat, hunk count, hunk order, hunk hash, last commit, hunk-sequence hash, identity hash, or complete matrix hash',
  'wrong Scope 1, planning-owned, Feature 012 bridge, workspace-config, foreign-specialist, or session-runtime classification',
  'ownership inferred from dirtiness, commit state, or history',
  'changed, missing, extra, reordered, matrix-included, or completion-inference-eligible exclusion',
  'wrong parser capture mode, retained pin family, v6 pin-family order, reconstruction order, or current-matrix selector',
  'semantic approval, acceptance, completion, checkbox, scope-status, top-level-status, or certification inference',
  'parser mutation outside the exact additive v10 pin, normalized-family, parser/adversarial branch, and current-selector boundary'
];
const POST_COMMIT_V10_ZERO_INFERENCE_FIELDS = [
  'semanticApproval',
  'semanticAcceptance',
  'completionClaim',
  'checkboxClaim',
  'scopeStatusClaim',
  'topLevelStatusClaim',
  'certificationClaim'
];

function parseNormalizedSelfPinsV6(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V6,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6|FOREIGN_SET_V7|POST_COMMIT_V9|POST_COMMIT_V10)[A-Z0-9_]*BLOCK_SHA256) = '([^']*)';$/gm,
    'normalized-self-pins/v6');
}

function normalizedSelfSourceIdentityV6(source) {
  parseNormalizedSelfPinsV5(source);
  parseNormalizedSelfPinsV6(source);
  const normalizedBytes = Buffer.from(normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V6), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes)
  };
}

function assertPostCommitV10PinValue(source) {
  const assignments = parseNormalizedSelfPinsV6(source);
  assert.equal(assignments.at(-1)[1], 'POST_COMMIT_V10_BLOCK_SHA256',
    'normalized-self-pins/v6 ends with the v10 pin');
  assert.equal(assignments.at(-1)[2], POST_COMMIT_V10_BLOCK_SHA256,
    'the v10 pin retains the exact marker-inclusive report hash');
}

function stripPostCommitV10MarkerBranch(source) {
  const startNeedle = `${POST_COMMIT_V10_HELPER_BEGIN}\n`;
  const endNeedle = `${POST_COMMIT_V10_HELPER_END}\n`;
  assert.equal(source.split(startNeedle).length - 1, 1, 'the v10 parser branch has exactly one start marker line');
  assert.equal(source.split(endNeedle).length - 1, 1, 'the v10 parser branch has exactly one end marker line');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'the v10 parser branch marker order is exact');
  const suffixStart = end + endNeedle.length;
  assert.equal(source[suffixStart], '\n', 'the v10 parser branch has exactly one additive trailing LF');
  return source.slice(0, start) + source.slice(suffixStart + 1);
}

function stripPostCommitV10Source(source) {
  let historical = stripPostCommitV10MarkerBranch(source);
  historical = removeExactSuccessorAddition(historical,
    `const POST_COMMIT_V10_BLOCK_SHA256 = '${POST_COMMIT_V10_BLOCK_SHA256}';\n`,
    'v10 pin addition');
  historical = removeExactSuccessorAddition(historical,
    "const NORMALIZED_SELF_PIN_NAMES_V6 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V5,\n  'POST_COMMIT_V10_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v6 declaration');
  const livePrefixRead = [
    '  const retainedValidator = ownerSettledSelftest.retainedValidatorTransition;',
    '  const { chunks, prefixBytes } = historicalValidatorPrefix(untracked, retainedValidator);'
  ].join('\n');
  const historicalPrefixRead = [
    '  const validatorBytes = readFileSync(resolve(ROOT, untracked.path));',
    '  const chunks = lineChunks(validatorBytes);',
    "  const prefixBytes = Buffer.from(chunks.slice(0, untracked.lineChunkCount).join(''), 'utf8');",
    '  const retainedValidator = ownerSettledSelftest.retainedValidatorTransition;'
  ].join('\n');
  assert.equal(countExact(historical, livePrefixRead), 1,
    'v10 historical validator prefix read transition exists exactly once');
  historical = historical.replace(livePrefixRead, historicalPrefixRead);
  return historical;
}

function stripPostCommitV10Diff(diff) {
  const normalizedV6Addition = [
    '+const NORMALIZED_SELF_PIN_NAMES_V6 = [',
    '+  ...NORMALIZED_SELF_PIN_NAMES_V5,',
    "+  'POST_COMMIT_V10_BLOCK_SHA256'",
    '+];'
  ].join('\n');
  assert.equal(diff.split(normalizedV6Addition).length - 1, 1,
    'the v10 diff contains exactly one normalized-self-pins/v6 declaration');
  const withoutNormalizedV6 = diff.replace(normalizedV6Addition, '');
  const exactPinLine = `+const POST_COMMIT_V10_BLOCK_SHA256 = '${POST_COMMIT_V10_BLOCK_SHA256}';`;
  let pinLineCount = 0;
  const kept = [];
  let inBranch = false;
  let branchStarts = 0;
  let branchEnds = 0;
  for (const line of withoutNormalizedV6.split('\n')) {
    if (line === `+${POST_COMMIT_V10_HELPER_BEGIN}`) {
      inBranch = true;
      branchStarts += 1;
      continue;
    }
    if (inBranch) {
      if (line === `+${POST_COMMIT_V10_HELPER_END}`) {
        inBranch = false;
        branchEnds += 1;
      }
      continue;
    }
    if (line === exactPinLine) {
      pinLineCount += 1;
      continue;
    }
    kept.push(line);
  }
  assert.equal(inBranch, false, 'the v10 diff branch closes');
  assert.equal(branchStarts, 1, 'the v10 diff contains exactly one branch start');
  assert.equal(branchEnds, 1, 'the v10 diff contains exactly one branch end');
  assert.equal(pinLineCount, 1, 'the v10 diff contains exactly one v10 pin addition');
  return kept.join('\n');
}

function postCommitV10DiffFromHeadSource(path, source) {
  const directory = mkdtempSync(resolve(tmpdir(), 'feature004-v10-'));
  const headPath = resolve(directory, 'head-source');
  const candidatePath = resolve(directory, 'candidate-source');
  try {
    writeFileSync(headPath, git(['show', `HEAD:${path}`]), 'utf8');
    writeFileSync(candidatePath, source, 'utf8');
    try {
      return execFileSync('git', [
        'diff', '--no-index', '--no-ext-diff', '--unified=0', '--', headPath, candidatePath
      ], { cwd: ROOT, encoding: 'utf8' });
    } catch (error) {
      assert.equal(error.status, 1, `Git recomputation for ${path} differs without an execution error`);
      return error.stdout;
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function postCommitV10ParserRecord(summary, source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  const preV10Source = stripPostCommitV10Source(source);
  parseNormalizedSelfPinsV5(preV10Source);
  const normalizedBytes = Buffer.from(
    normalizeSelfPinValuesForNames(preV10Source, NORMALIZED_SELF_PIN_NAMES_V5), 'utf8');
  stripPostCommitV10Diff(git(['diff', '--no-ext-diff', '--unified=0', '--', COLLISION_PARSER_PATH]));
  const hunks = parseDiffHunks(postCommitV10DiffFromHeadSource(
    COLLISION_PARSER_PATH, normalizedBytes)).filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(COLLISION_PARSER_PATH);
  return {
    path: COLLISION_PARSER_PATH,
    pathKind: 'tracked',
    classification: summary.classification,
    ownerAttribution: summary.ownerAttribution,
    feature004OwnershipClaim: summary.feature004OwnershipClaim,
    transitionClass: summary.transitionClass,
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(COLLISION_PARSER_PATH),
    indexOid: indexOid(COLLISION_PARSER_PATH),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes),
    byteLength: normalizedBytes.length,
    additions: hunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: hunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: hunks.length,
    hunkBodySha256: hunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(COLLISION_PARSER_PATH)
  };
}

function postCommitV10CurrentRecord(summary) {
  if (summary.path === COLLISION_PARSER_PATH) return postCommitV10ParserRecord(summary);
  const current = currentV4PathIdentity(summary.path);
  const bytes = readFileSync(resolve(ROOT, summary.path));
  const numstat = postCommitV9Numstat(summary.path, current);
  return {
    path: summary.path,
    pathKind: current.pathKind,
    classification: summary.classification,
    ownerAttribution: summary.ownerAttribution,
    feature004OwnershipClaim: summary.feature004OwnershipClaim,
    transitionClass: summary.transitionClass,
    status: current.status,
    staged: current.staged,
    unstaged: current.unstaged,
    headOid: current.headOid,
    indexOid: current.indexOid,
    worktreeGitOid: current.worktreeGitOid,
    worktreeSha256: current.worktreeSha256,
    byteLength: bytes.length,
    additions: numstat.additions,
    deletions: numstat.deletions,
    hunkCount: current.hunkCount,
    hunkBodySha256: current.hunkBodySha256,
    lastCommit: current.lastCommit
  };
}

function assertPostCommitV10Summary(summary, record, label) {
  assertExactOrderedKeys(summary, POST_COMMIT_V9_SUMMARY_FIELDS, label);
  assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS, `${label} full record`);
  for (const field of [
    'path', 'pathKind', 'classification', 'ownerAttribution', 'feature004OwnershipClaim',
    'transitionClass', 'status', 'hunkCount'
  ]) assert.equal(summary[field], record[field], `${label}.${field} is exact`);
  record.hunkBodySha256.forEach((hash, index) => assertSha256(hash, `${label}.hunkBodySha256[${index}]`));
  assert.equal(summary.hunkSequenceSha256, sha256(JSON.stringify(record.hunkBodySha256)),
    `${label} commits the complete ordered hunk sequence`);
  assert.equal(summary.identitySha256, sha256(JSON.stringify(record)),
    `${label} commits the complete ordered full record`);
}

function assertPostCommitV10RecordCommitments(v10, requiredRecords, foreignRecords,
  excludedPaths = POST_COMMIT_V10_EXCLUDED_PATHS, verifyInventory = true) {
  assert.deepEqual(requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'v10 full required records retain all 19 paths in exact order');
  assert.deepEqual(foreignRecords.map(({ path }) => path), POST_COMMIT_V9_FOREIGN_PATHS,
    'v10 full foreign records retain exactly 11 paths in exact order');
  assert.deepEqual(excludedPaths, POST_COMMIT_V10_EXCLUDED_PATHS,
    'v10 retains exactly report recursion and the session lock as exclusions');
  assert.equal(new Set([...requiredRecords, ...foreignRecords].map(({ path }) => path)).size, 30,
    'v10 matrix contains 30 unique non-excluded records');
  requiredRecords.forEach((record, index) =>
    assertPostCommitV10Summary(v10.currentMatrix.requiredRecords[index], record,
      `post-commit v10 requiredRecords[${index}]`));
  foreignRecords.forEach((record, index) =>
    assertPostCommitV10Summary(v10.currentMatrix.foreignRecords[index], record,
      `post-commit v10 foreignRecords[${index}]`));
  assert.equal(sha256(JSON.stringify({
    requiredHead: v10.requiredHead,
    requiredRecords,
    foreignRecords,
    excludedPaths
  })), v10.identityContract.matrixSha256, 'v10 complete uncompressed matrix hash is exact');
  if (!verifyInventory) return;
  const porcelainPaths = postCommitV9PorcelainPaths();
  assert.deepEqual(porcelainPaths, POST_COMMIT_V10_PORCELAIN_PATHS,
    'v10 NUL-safe porcelain inventory has the exact 23-path order');
  assert.deepEqual(POST_COMMIT_V10_EXCLUDED_PATHS.map((path) => shortStatus(path)), [' M', '??'],
    'v10 exclusions are present only as report recursion and the session flock');
  const currentNonExcluded = porcelainPaths.filter((path) => !POST_COMMIT_V10_EXCLUDED_PATHS.includes(path));
  const expectedDirty = [...requiredRecords, ...foreignRecords]
    .filter(({ status }) => status !== '')
    .map(({ path }) => path);
  assert.deepEqual([...currentNonExcluded].sort(), [...expectedDirty].sort(),
    'v10 matrix equals every and only current dirty path after the two exact exclusions');
  assert.equal(requiredRecords.filter(({ status }) => status !== '').length, 10,
    'v10 has exactly ten dirty required paths');
  assert.equal(foreignRecords.filter(({ status }) => status !== '').length, 11,
    'v10 has exactly eleven dirty foreign paths');
}

function postCommitV9ObservedIdentityFromV10Source() {
  const path = COLLISION_PARSER_PATH;
  const preV10Source = stripPostCommitV10Source(readFileSync(resolve(ROOT, path), 'utf8'));
  const historicalSource = stripPostCommitV9Source(preV10Source);
  const historicalBytes = Buffer.from(historicalSource, 'utf8');
  const historicalHunks = parseDiffHunks(postCommitV10DiffFromHeadSource(path, historicalBytes))
    .filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(path);
  return {
    path,
    pathKind: 'tracked',
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(path),
    indexOid: indexOid(path),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: historicalBytes
    }).trim(),
    worktreeSha256: sha256(historicalBytes),
    byteLength: historicalBytes.length,
    additions: historicalHunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: historicalHunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: historicalHunks.length,
    hunkBodySha256: historicalHunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(path)
  };
}

function withPostCommitV9HistoricalHead(run) {
  const activeGit = git;
  git = (args) => args.length === 2 && args[0] === 'rev-parse' && args[1] === 'HEAD'
    ? `${POST_COMMIT_V9_REQUIRED_HEAD}\n`
    : activeGit(args);
  try {
    return run();
  } finally {
    git = activeGit;
  }
}

function validatePostCommitV9AsV10History(v9, v7, v6, v5, v4, durable, canonical = v9) {
  return withPostCommitV9HistoricalHead(() =>
    validatePostCommitV9(v9, v7, v6, v5, v4, durable, canonical, false));
}

function postCommitV9ObservedFullRecord(v10, v9) {
  const summary = v9.postCommitMatrix.requiredRecords.find(({ path }) => path === COLLISION_PARSER_PATH);
  const observed = v10.v9SelfIdentityDisposition.observedUnderExactV9Reconstruction;
  const identity = postCommitV9ObservedIdentityFromV10Source();
  assertExactOrderedKeys(observed, [
    'function', 'repositoryHead', 'pathKind', 'status', 'staged', 'unstaged',
    'headOid', 'indexOid', 'worktreeGitOid', 'worktreeSha256', 'byteLength',
    'additions', 'deletions', 'hunkCount', 'hunkBodySha256', 'lastCommit',
    'hunkSequenceSha256', 'identitySha256'
  ], 'v9 observed reconstruction disposition');
  assert.equal(observed.function, 'postCommitV9HistoricalParserIdentity');
  assert.equal(observed.repositoryHead, POST_COMMIT_V10_REQUIRED_HEAD);
  assert.equal(identity.path, v10.v9SelfIdentityDisposition.path,
    'v9 observed reconstruction uses the disposition path');
  for (const field of [
    'pathKind', 'status', 'staged', 'unstaged', 'headOid', 'indexOid',
    'worktreeGitOid', 'worktreeSha256', 'byteLength', 'additions', 'deletions',
    'hunkCount', 'hunkBodySha256', 'lastCommit'
  ]) assert.deepEqual(identity[field], observed[field], `v9 observed reconstruction ${field} is exact`);
  const record = {
    path: v10.v9SelfIdentityDisposition.path,
    pathKind: identity.pathKind,
    classification: summary.classification,
    ownerAttribution: summary.ownerAttribution,
    feature004OwnershipClaim: summary.feature004OwnershipClaim,
    transitionClass: summary.transitionClass,
    status: identity.status,
    staged: identity.staged,
    unstaged: identity.unstaged,
    headOid: identity.headOid,
    indexOid: identity.indexOid,
    worktreeGitOid: identity.worktreeGitOid,
    worktreeSha256: identity.worktreeSha256,
    byteLength: identity.byteLength,
    additions: identity.additions,
    deletions: identity.deletions,
    hunkCount: identity.hunkCount,
    hunkBodySha256: identity.hunkBodySha256,
    lastCommit: identity.lastCommit
  };
  assert.equal(sha256(JSON.stringify(record.hunkBodySha256)), observed.hunkSequenceSha256,
    'v9 observed reconstruction hunk sequence is exact');
  assert.equal(sha256(JSON.stringify(record)), observed.identitySha256,
    'v9 observed reconstruction full-record identity is exact');
  return record;
}

function assertPostCommitV9Disposition(v10, v9) {
  const disposition = v10.v9SelfIdentityDisposition;
  assert.equal(disposition.path, COLLISION_PARSER_PATH);
  const committedSummary = v9.postCommitMatrix.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  assert.deepEqual({
    hunkCount: committedSummary.hunkCount,
    hunkSequenceSha256: committedSummary.hunkSequenceSha256,
    identitySha256: committedSummary.identitySha256
  }, disposition.v9CommittedRecord, 'v9 committed parser tuple remains exact immutable history');
  const observedRecord = postCommitV9ObservedFullRecord(v10, v9);
  assert.notEqual(disposition.v9CommittedRecord.hunkSequenceSha256,
    sha256(JSON.stringify(observedRecord.hunkBodySha256)),
    'v9 committed and observed hunk-sequence tuples remain distinct');
  assert.notEqual(disposition.v9CommittedRecord.identitySha256, sha256(JSON.stringify(observedRecord)),
    'v9 committed and observed full-record identities remain distinct');
  assert.deepEqual(disposition.discriminatingCheck, {
    source: 'reconstructed historical parser source with exact v9 additions removed',
    diff: 'Git recomputation of HEAD versus reconstructed source',
    result: 'same-observed-mismatch-tuple',
    hunkBoundaryFilterHypothesis: 'falsified',
    safeV9OnlyParserFixAvailable: false
  }, 'v9 non-reproducible self-identity disposition is exact');
  assert.equal(disposition.assertionRelaxationAllowed, false);
}

function assertPostCommitV9HistoricalRecordCommitments(v10, v9, requiredRecords, foreignRecords,
  excludedPaths = POST_COMMIT_V9_EXCLUDED_PATHS, verifyInventory = false) {
  assert.equal(verifyInventory, false, 'v9 live inventory comparison is forbidden under v10');
  assert.deepEqual(requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'historical v9 required path order remains exact');
  assert.deepEqual(foreignRecords.map(({ path }) => path), POST_COMMIT_V9_FOREIGN_PATHS,
    'historical v9 foreign path order remains exact');
  assert.deepEqual(excludedPaths, POST_COMMIT_V9_EXCLUDED_PATHS,
    'historical v9 exclusions remain exact');
  requiredRecords.forEach((record, index) => {
    if (record.path === COLLISION_PARSER_PATH) {
      assert.deepEqual(record, postCommitV9ObservedFullRecord(v10, v9),
        'historical v9 parser record is the exact observed mismatch, not the committed tuple');
      return;
    }
    assertPostCommitV9Summary(v9.postCommitMatrix.requiredRecords[index], record,
      `historical post-commit v9 requiredRecords[${index}]`);
  });
  foreignRecords.forEach((record, index) =>
    assertPostCommitV9Summary(v9.postCommitMatrix.foreignRecords[index], record,
      `historical post-commit v9 foreignRecords[${index}]`));
}

function runPostCommitV9AdversarialCasesAsV10History(v10) {
  const activeV9Validator = validatePostCommitV9;
  const activeV9HistoricalIdentity = postCommitV9HistoricalParserIdentity;
  const activeV9RecordCommitments = assertPostCommitV9RecordCommitments;
  validatePostCommitV9 = (v9, v7, v6, v5, v4, durable, canonical = v9) =>
    withPostCommitV9HistoricalHead(() =>
      activeV9Validator(v9, v7, v6, v5, v4, durable, canonical, false));
  postCommitV9HistoricalParserIdentity = postCommitV9ObservedIdentityFromV10Source;
  assertPostCommitV9RecordCommitments = (v9, requiredRecords, foreignRecords,
    excludedPaths = POST_COMMIT_V9_EXCLUDED_PATHS, verifyInventory = false) =>
    assertPostCommitV9HistoricalRecordCommitments(v10, v9, requiredRecords, foreignRecords,
      excludedPaths, verifyInventory);
  try {
    runPostCommitV9AdversarialCases();
  } finally {
    validatePostCommitV9 = activeV9Validator;
    postCommitV9HistoricalParserIdentity = activeV9HistoricalIdentity;
    assertPostCommitV9RecordCommitments = activeV9RecordCommitments;
  }
}

function assertV5SemanticTransitionAppliedAfterV10(v5, stage) {
  assert.equal(stage.postCommitV10MatrixApplied, true, 'v5 physical validation follows the complete v10 matrix');
  assert.equal(stage.v5SemanticTransitionApplied, false, 'v5 physical transition validates exactly once after v10');
  const source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const oldHunk = v5.parserTransition.allowedHunk.oldLines.join('\n');
  const newHunk = v5.parserTransition.allowedHunk.newLines.join('\n');
  assert.equal(v5.parserTransition.allowedHunk.oldAssertionCount, 5,
    'v5 transition replaces exactly five historical assertions under v10');
  assert.equal(v5.parserTransition.allowedHunk.oldLines.length, 5,
    'v5 transition retains exactly five historical assertion lines under v10');
  assert.equal(countExact(source, oldHunk), 0, 'v5 old five-assertion hunk remains absent after v10');
  assert.equal(countExact(source, newHunk), 1, 'v5 successor hunk exists exactly once after v10');
  assert.equal(sha256(newHunk), v5.parserTransition.allowedHunk.newSha256,
    'v5 successor hunk retains the exact authorized SHA-256 after v10');
  stage.v5SemanticTransitionApplied = true;
}

function validatePostCommitV10(v10, v9, v7, v6, v5, v4, durable,
  canonical = v10, verifyCurrent = true) {
  assertExactCanonicalContract(v10, canonical, 'post-commit v10 block');
  assertExactOrderedKeys(v10, [
    'contractVersion', 'findingId', 'successorRevision', 'capturedAt', 'requiredHead',
    'successorOf', 'extendsContracts', 'historicalValidation', 'v9SelfIdentityDisposition',
    'identityContract', 'inventoryProof', 'currentMatrix', 'inferenceContract',
    'parserOrder', 'parserHandoff', 'adversarialMutations', 'captureStability',
    'planningRouting', 'testOwnerHandoff'
  ], 'post-commit v10 block');
  assert.equal(v10.contractVersion, 'feature004-dirty-collision-post-commit/v10');
  assert.equal(v10.findingId, 'F004-COLLISION-POST-COMMIT-V9');
  assert.equal(v10.successorRevision, 'v10');
  assertUtcTimestamp(v10.capturedAt, 'post-commit v10 capturedAt');
  assert.equal(v10.requiredHead, POST_COMMIT_V10_REQUIRED_HEAD);
  assert.equal(git(['rev-parse', 'HEAD']).trim(), POST_COMMIT_V10_REQUIRED_HEAD,
    'v10 parser adoption occurs at the exact required HEAD');
  assert.deepEqual(v10.successorOf, {
    marker: POST_COMMIT_V9_MARKER,
    rawBlockSha256: POST_COMMIT_V9_BLOCK_SHA256,
    contractVersion: 'feature004-dirty-collision-post-commit/v9',
    requiredHead: POST_COMMIT_V9_REQUIRED_HEAD,
    relation: 'additive-current-matrix-successor',
    predecessorDisposition: 'mandatory-immutable-history',
    successorRequiredReasons: [
      'repository-head-advanced',
      'v9-parser-self-identity-non-reproducible-under-v9-reconstruction'
    ]
  }, 'v10 successor link is exact');
  assert.deepEqual(v10.extendsContracts, [
    { marker: POST_COMMIT_V9_MARKER, rawBlockSha256: POST_COMMIT_V9_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-set-v7', rawBlockSha256: FOREIGN_SET_V7_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-roadmap-v6', rawBlockSha256: FOREIGN_ROADMAP_V6_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v5', rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 },
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ], 'v10 predecessor markers and hashes are exact and ordered');
  assert.deepEqual(v10.historicalValidation, {
    allPredecessorMarkersHashesSchemasAndOrderRequired: true,
    v9MarkerInclusiveBytesRequired: true,
    v9MarkerInclusiveByteLength: 23091,
    v9RequiredHeadValueRequired: true,
    v9RequiredHeadComparedToLiveHeadWhenV10Present: false,
    v9LiveMatrixComparisonWhenV10Present: false,
    v9CommittedSelfIdentityValuesRequired: true,
    v9ObservedReconstructionMismatchRequired: true,
    v9EvidenceFalse: false,
    v9AssertionDeletionOrWeakeningAllowed: false,
    disposition: 'mandatory-history-before-v10-with-exact-self-identity-disposition'
  }, 'v10 historical validation contract is exact');
  assertPostCommitV9Disposition(v10, v9);
  assert.deepEqual(v10.identityContract.fullRecordOrderedFields, POST_COMMIT_V9_FULL_RECORD_FIELDS);
  assert.deepEqual(v10.identityContract.summaryOrderedFields, POST_COMMIT_V9_SUMMARY_FIELDS);
  assert.equal(v10.identityContract.identitySha256Input,
    'JSON.stringify of the complete full record with the exact ordered fields above');
  assert.equal(v10.identityContract.hunkSequenceSha256Input,
    'JSON.stringify of the complete ordered hunkBodySha256 array');
  assert.equal(v10.identityContract.diffMode, 'git diff --no-ext-diff --unified=0');
  assert.equal(v10.identityContract.hunkHashInput,
    'ordered changed lines with plus or minus prefix joined by LF with no trailing LF');
  assert.equal(v10.identityContract.inventoryMode, 'git status --porcelain=v1 -z --untracked-files=all');
  assert.equal(v10.identityContract.matrixSha256Input,
    'JSON.stringify({requiredHead,requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records');
  assert.equal(v10.identityContract.matrixSha256,
    '78e3199040d1ce2fcd46240e5b1433e4f5d35574306b7d64918b6cba538b7f2a');
  assert.equal(v10.identityContract.summariesAloneSatisfyMatrixValidation, false);
  assert.equal(v10.identityContract.parserSelfCapture.captureMode, 'normalized-self-pins/v5-pre-v10');
  assert.deepEqual(v10.identityContract.parserSelfCapture.retainedPinNames, NORMALIZED_SELF_PIN_NAMES_V5);
  assert.deepEqual(v10.inventoryProof.porcelainPathOrder, POST_COMMIT_V10_PORCELAIN_PATHS);
  assert.deepEqual({
    porcelainPathCount: v10.inventoryProof.porcelainPathCount,
    dirtyRequiredPathCount: v10.inventoryProof.dirtyRequiredPathCount,
    foreignDirtyPathCount: v10.inventoryProof.foreignDirtyPathCount,
    excludedDirtyPathCount: v10.inventoryProof.excludedDirtyPathCount,
    requiredPathCount: v10.inventoryProof.requiredPathCount,
    matrixRecordCount: v10.inventoryProof.matrixRecordCount
  }, {
    porcelainPathCount: 23,
    dirtyRequiredPathCount: 10,
    foreignDirtyPathCount: 11,
    excludedDirtyPathCount: 2,
    requiredPathCount: 19,
    matrixRecordCount: 30
  }, 'v10 inventory counts are exact');
  assert.deepEqual(v10.inventoryProof.requiredTransitionCounts, {
    'clean-head-index-promotion': 9,
    'still-dirty-exact-identity': 5,
    'untracked-exact-identity': 5
  });
  const classifications = v10.inventoryProof.pathClassification;
  assert.deepEqual(classifications.scope1CurrentPaths, POST_COMMIT_V10_SCOPE_ONE_CURRENT_PATHS);
  assert.deepEqual(classifications.planningOwnedCurrentPaths, POST_COMMIT_V10_PLANNING_CURRENT_PATHS);
  assert.deepEqual(classifications.feature012BridgeCurrentPaths, POST_COMMIT_V10_FEATURE_TWELVE_CURRENT_PATHS);
  assert.deepEqual(classifications.workspaceConfigCurrentPaths, ['.vscode/mcp.json']);
  assert.deepEqual(classifications.foreignSpecialistCurrentPaths,
    POST_COMMIT_V10_FOREIGN_SPECIALIST_CURRENT_PATHS);
  assert.deepEqual(classifications.sessionRuntimeExclusionPaths, [V7_LOCK_FILE_EXCLUSION]);
  assert.equal(classifications.ownershipInferredFromDirtiness, false);
  assert.equal(classifications.ownershipInferredFromCommit, false);
  assert.equal(classifications.ownershipInferredFromHistory, false);
  assert.equal(v10.inventoryProof.completionInferenceFromInventory, false);
  assertExactOrderedKeys(v10.currentMatrix, [
    'requiredRecords', 'foreignRecords', 'excludedPaths', 'excludedRecords',
    'ownershipTransfer', 'semanticApproval', 'semanticAcceptance', 'completionClaim',
    'checkboxClaim', 'scopeStatusClaim', 'topLevelStatusClaim', 'certificationClaim'
  ], 'post-commit v10 matrix');
  assert.deepEqual(v10.currentMatrix.requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS);
  assert.deepEqual(v10.currentMatrix.foreignRecords.map(({ path }) => path), POST_COMMIT_V9_FOREIGN_PATHS);
  assert.deepEqual(v10.currentMatrix.excludedPaths, POST_COMMIT_V10_EXCLUDED_PATHS);
  assert.deepEqual(v10.currentMatrix.excludedRecords, [
    {
      path: REPORT_PATH,
      status: ' M',
      classification: 'planning-owned-report-recursion-exclusion',
      ownerAttribution: 'bubbles.plan',
      matrixEligible: false,
      completionInferenceEligible: false
    },
    {
      path: V7_LOCK_FILE_EXCLUSION,
      status: '??',
      classification: 'session-runtime-lock-exclusion',
      ownerAttribution: 'session runtime',
      matrixEligible: false,
      completionInferenceEligible: false
    }
  ], 'v10 exclusions are exact and ineligible');
  assert.equal(v10.currentMatrix.ownershipTransfer, false);
  POST_COMMIT_V10_ZERO_INFERENCE_FIELDS.forEach((field) =>
    assert.equal(v10.currentMatrix[field], false, `v10 current matrix ${field} remains false`));
  Object.values(v10.inferenceContract).forEach((value) =>
    assert.equal(value, false, 'v10 inference contract contains only false values'));
  assert.deepEqual(v10.parserOrder, POST_COMMIT_V10_PARSER_ORDER);
  assert.equal(v10.parserHandoff.owner, 'bubbles.test');
  assert.equal(v10.parserHandoff.path, COLLISION_PARSER_PATH);
  assert.equal(v10.parserHandoff.newPinLiteral, 'POST_COMMIT_V10_BLOCK_SHA256');
  assert.equal(v10.parserHandoff.pinCountDelta, 1);
  assert.equal(v10.parserHandoff.captureMode, 'normalized-self-pins/v5-pre-v10');
  assert.equal(v10.parserHandoff.normalizedMode, 'normalized-self-pins/v6');
  assert.equal(v10.parserHandoff.normalizedPinFamilyName, 'NORMALIZED_SELF_PIN_NAMES_V6');
  assert.deepEqual(v10.parserHandoff.retainedPinLiterals, NORMALIZED_SELF_PIN_NAMES_V5);
  assert.deepEqual(v10.parserHandoff.normalizedPinFamilyOrder, NORMALIZED_SELF_PIN_NAMES_V6);
  assert.equal(v10.parserHandoff.currentMatrixSelector, 'v10-only');
  assert.equal(v10.parserHandoff.v9BranchEditAllowed, false);
  assert.equal(v10.parserHandoff.predecessorEditAllowed, false);
  assert.equal(v10.parserHandoff.productEditsAllowed, false);
  assert.equal(v10.parserHandoff.planningEditsAllowed, false);
  assert.equal(v10.parserHandoff.foreignEditsAllowed, false);
  assert.deepEqual(v10.adversarialMutations, POST_COMMIT_V10_ADVERSARIAL_MUTATIONS);
  assert.deepEqual(v10.captureStability, {
    preAppendMatrixSha256: '78e3199040d1ce2fcd46240e5b1433e4f5d35574306b7d64918b6cba538b7f2a',
    postAppendMustMatch: true,
    headMustRemainExact: true,
    porcelainOrderMustRemainExact: true,
    rollbackBoundary: 'remove only an incomplete v10 report append and return blocked',
    v9OrPredecessorRollbackAllowed: false,
    foreignOrProductRollbackAllowed: false
  });
  assert.equal(v10.planningRouting.transitionRequestId, 'TR-F004-SCOPE01-POST-COMMIT-V10-001');
  assert.equal(v10.planningRouting.nextRequiredOwner, 'bubbles.test');
  assert.deepEqual(v10.planningRouting.updatedPaths, [REPORT_PATH]);
  assert.ok(['scopeStatusChanged', 'checkboxChanged', 'featureStatusChanged', 'certificationChanged', 'scopeTwoStarted']
    .every((field) => v10.planningRouting[field] === false),
  'v10 planning routing changes no completion state');
  assert.equal(v10.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v10.testOwnerHandoff.transitionRequestId, 'TR-F004-SCOPE01-POST-COMMIT-V10-001');
  assert.equal(v10.testOwnerHandoff.nextRequiredOwner, 'bubbles.test');
  assert.equal(v9.contractVersion, 'feature004-dirty-collision-post-commit/v9');
  assert.equal(v7.contractVersion, 'feature004-dirty-collision-foreign-set/v7');
  assert.equal(v6.contractVersion, 'feature004-dirty-collision-foreign-roadmap/v6');
  assert.equal(v5.contractVersion, 'feature004-dirty-collision-current-identity/v5');
  assert.equal(v4.contractVersion, 'feature004-dirty-collision-current-identity/v4');
  assert.equal(durable.contractVersion, 'feature004-durable-evidence-admission/v1');
  if (!verifyCurrent) return null;
  const requiredRecords = v10.currentMatrix.requiredRecords.map(postCommitV10CurrentRecord);
  const foreignRecords = v10.currentMatrix.foreignRecords.map(postCommitV10CurrentRecord);
  assertPostCommitV10RecordCommitments(v10, requiredRecords, foreignRecords);
  const parserRecord = requiredRecords.find(({ path }) => path === COLLISION_PARSER_PATH);
  const parserCapture = v10.identityContract.parserSelfCapture;
  assertExactOrderedKeys(parserCapture, [
    'captureMode', 'retainedPinNames', ...POST_COMMIT_V9_FULL_RECORD_FIELDS,
    'hunkSequenceSha256', 'identitySha256'
  ], 'v10 parser self-capture');
  assert.deepEqual(Object.fromEntries(POST_COMMIT_V9_FULL_RECORD_FIELDS
    .map((field) => [field, parserCapture[field]])), parserRecord,
  'v10 parser self-capture contains the exact complete normalized pre-v10 record');
  assert.equal(parserCapture.hunkSequenceSha256, sha256(JSON.stringify(parserRecord.hunkBodySha256)),
    'v10 parser self-capture commits the complete normalized hunk sequence');
  assert.equal(parserCapture.identitySha256, sha256(JSON.stringify(parserRecord)),
    'v10 parser self-capture commits the complete normalized full record');
  return { requiredRecords, foreignRecords };
}

function assertPostCommitV10RecordMutationFails(v10, requiredRecords, foreignRecords, label, mutate) {
  const requiredCandidate = structuredClone(requiredRecords);
  const foreignCandidate = structuredClone(foreignRecords);
  mutate(requiredCandidate, foreignCandidate);
  assert.throws(() => assertPostCommitV10RecordCommitments(v10, requiredCandidate, foreignCandidate,
    POST_COMMIT_V10_EXCLUDED_PATHS, false), label);
}

function runPostCommitV10AdversarialCases() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  runPostCommitV9AdversarialCasesAsV10History(v10Block.value);
  assert.throws(() => parseReportBlock(`${report}\n${v10Block.raw}`, POST_COMMIT_V10_MARKER),
    'duplicate v10 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v10Block.raw, ''), POST_COMMIT_V10_MARKER),
    'missing v10 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v10Block.raw,
    v10Block.raw.replace('```json\n{', '```json\n{ malformed')), POST_COMMIT_V10_MARKER),
  'malformed v10 report block fails closed');
  assert.throws(() => assertPinnedReportBlock(`${v10Block.raw} `, POST_COMMIT_V10_BLOCK_SHA256,
    'mutated post-commit v10 block'), 'v10 marker-inclusive byte drift fails closed');
  assertEveryClosedSchemaMutationFails(v10Block.value,
    (candidate) => validatePostCommitV10(candidate, v9Block.value, v7Block.value, v6Block.value,
      v5Block.value, v4Block.value, durableBlock.value, v10Block.value, false), 'post-commit v10 block');

  const requiredRecords = v10Block.value.currentMatrix.requiredRecords.map(postCommitV10CurrentRecord);
  const foreignRecords = v10Block.value.currentMatrix.foreignRecords.map(postCommitV10CurrentRecord);
  const matrixCases = [
    ['v10 missing required path', (required) => { required.pop(); }],
    ['v10 extra required path', (required) => { required.push({ ...structuredClone(required[0]), path: 'unexpected-required' }); }],
    ['v10 duplicate required path', (required) => { required.push(structuredClone(required[0])); }],
    ['v10 reordered required paths', (required) => { required.reverse(); }],
    ['v10 missing foreign path', (_required, foreign) => { foreign.pop(); }],
    ['v10 extra foreign path', (_required, foreign) => { foreign.push({ ...structuredClone(foreign[0]), path: 'docs/Unexpected.md' }); }],
    ['v10 duplicate foreign path', (_required, foreign) => { foreign.push(structuredClone(foreign[0])); }],
    ['v10 reordered foreign paths', (_required, foreign) => { foreign.reverse(); }],
    ['v10 transition class mismatch', (required) => { required[0].transitionClass = 'clean-head-index-promotion'; }],
    ['v10 classification mismatch', (_required, foreign) => { foreign[0].classification = 'feature004-scope1-required'; }],
    ['v10 owner mismatch', (_required, foreign) => { foreign[0].ownerAttribution = 'Feature 004 Scope 1'; }],
    ['v10 ownership transfer', (_required, foreign) => { foreign[0].feature004OwnershipClaim = true; }]
  ];
  matrixCases.forEach(([label, mutate]) =>
    assertPostCommitV10RecordMutationFails(v10Block.value, requiredRecords, foreignRecords, label, mutate));
  POST_COMMIT_V9_FULL_RECORD_FIELDS.forEach((field) => {
    assertPostCommitV10RecordMutationFails(v10Block.value, requiredRecords, foreignRecords,
      `v10 full record rejects changed ${field}`, (required) => {
        if (field === 'hunkBodySha256') required[0][field] = [...required[0][field]].reverse();
        else required[0][field] = changedLeafValue(required[0][field]);
      });
  });
  assert.throws(() => assertPostCommitV10RecordCommitments(v10Block.value, requiredRecords, foreignRecords,
    [V7_LOCK_FILE_EXCLUSION], false), 'v10 missing report exclusion fails closed');
  assert.throws(() => assertPostCommitV10RecordCommitments(v10Block.value, requiredRecords, foreignRecords,
    [...POST_COMMIT_V10_EXCLUDED_PATHS, 'docs/Unexpected.md'], false), 'v10 extra exclusion fails closed');
  assert.throws(() => assertPostCommitV10RecordCommitments(v10Block.value, requiredRecords, foreignRecords,
    [...POST_COMMIT_V10_EXCLUDED_PATHS].reverse(), false), 'v10 reordered exclusions fail closed');
  assert.throws(() => assertPostCommitV10RecordCommitments(v10Block.value, requiredRecords, foreignRecords,
    [REPORT_PATH, foreignRecords[0].path], false), 'v10 matrix-included exclusion fails closed');

  const contractCases = [
    ['v10 wrong required HEAD', (value) => { value.requiredHead = '0'.repeat(40); }],
    ['v10 reordered porcelain paths', (value) => { value.inventoryProof.porcelainPathOrder.reverse(); }],
    ['v10 reordered Scope 1 classification', (value) => { value.inventoryProof.pathClassification.scope1CurrentPaths.reverse(); }],
    ['v10 wrong planning classification', (value) => { value.inventoryProof.pathClassification.planningOwnedCurrentPaths.pop(); }],
    ['v10 wrong Feature 012 classification', (value) => { value.inventoryProof.pathClassification.feature012BridgeCurrentPaths.reverse(); }],
    ['v10 ownership inferred from dirtiness', (value) => { value.inventoryProof.pathClassification.ownershipInferredFromDirtiness = true; }],
    ['v10 completion inferred from inventory', (value) => { value.inventoryProof.completionInferenceFromInventory = true; }],
    ['v10 exclusion becomes matrix eligible', (value) => { value.currentMatrix.excludedRecords[0].matrixEligible = true; }],
    ['v10 exclusion becomes completion eligible', (value) => { value.currentMatrix.excludedRecords[1].completionInferenceEligible = true; }],
    ['v10 semantic approval inferred', (value) => { value.currentMatrix.semanticApproval = true; }],
    ['v10 certification inferred', (value) => { value.inferenceContract.certification = true; }],
    ['v10 parser capture mode drift', (value) => { value.parserHandoff.captureMode = 'normalized-self-pins/v6'; }],
    ['v10 current selector drift', (value) => { value.parserHandoff.currentMatrixSelector = 'v9-and-v10'; }],
    ['v10 parser order drift', (value) => { value.parserOrder.reverse(); }]
  ];
  contractCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(v10Block.value);
    mutate(candidate);
    assert.throws(() => validatePostCommitV10(candidate, v9Block.value, v7Block.value, v6Block.value,
      v5Block.value, v4Block.value, durableBlock.value, v10Block.value, false), label);
  });

  const changedCommittedV9 = structuredClone(v9Block.value);
  const committedSelf = changedCommittedV9.postCommitMatrix.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  committedSelf.identitySha256 = v10Block.value.v9SelfIdentityDisposition
    .observedUnderExactV9Reconstruction.identitySha256;
  assert.throws(() => assertPostCommitV9Disposition(v10Block.value, changedCommittedV9),
    'v9 committed self tuple cannot be replaced by the observed tuple');
  const changedObservedV9 = structuredClone(v10Block.value);
  changedObservedV9.v9SelfIdentityDisposition.observedUnderExactV9Reconstruction.identitySha256 =
    changedObservedV9.v9SelfIdentityDisposition.v9CommittedRecord.identitySha256;
  assert.throws(() => validatePostCommitV10(changedObservedV9, v9Block.value, v7Block.value,
    v6Block.value, v5Block.value, v4Block.value, durableBlock.value, v10Block.value, false),
  'v9 observed tuple cannot be replaced by the committed tuple');
  assert.throws(() => validatePostCommitV9(v9Block.value, v7Block.value, v6Block.value,
    v5Block.value, v4Block.value, durableBlock.value, v9Block.value, false),
  'v9 live HEAD comparison is forbidden and fails when v10 owns current validation');

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const normalized = normalizedSelfSourceIdentityV6(parserSource);
  assertPostCommitV10PinValue(parserSource);
  const changedPins = parserSource
    .replace(DURABLE_EVIDENCE_BLOCK_SHA256, '1'.repeat(64))
    .replace(CURRENT_IDENTITY_V4_BLOCK_SHA256, '2'.repeat(64))
    .replace(CURRENT_IDENTITY_V5_BLOCK_SHA256, '3'.repeat(64))
    .replace(FOREIGN_ROADMAP_V6_BLOCK_SHA256, '4'.repeat(64))
    .replace(FOREIGN_SET_V7_BLOCK_SHA256, '5'.repeat(64))
    .replace(POST_COMMIT_V9_BLOCK_SHA256, '6'.repeat(64))
    .replace(POST_COMMIT_V10_BLOCK_SHA256, '7'.repeat(64));
  assert.deepEqual(normalizedSelfSourceIdentityV6(changedPins), normalized,
    'normalized-self-pins/v6 normalizes exactly all seven valid pin values');
  assert.throws(() => assertPostCommitV10PinValue(changedPins),
    'normalized-self-pins/v6 rejects a changed valid-hex v10 pin as report authority');
  const v10PinCases = [
    ['missing', (value) => value.replace(/^const POST_COMMIT_V10_BLOCK_SHA256.*\n/m, '')],
    ['duplicate', (value) => value.replace(/^const POST_COMMIT_V10_BLOCK_SHA256.*$/m, (line) => `${line}\n${line}`)],
    ['renamed', (value) => value.replace('POST_COMMIT_V10_BLOCK_SHA256', 'POST_COMMIT_CURRENT_BLOCK_SHA256')],
    ['nonhex', (value) => value.replace(POST_COMMIT_V10_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered', (value) => {
      const lines = value.split('\n');
      const v9Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V9_BLOCK_SHA256'));
      const v10Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V10_BLOCK_SHA256'));
      [lines[v9Index], lines[v10Index]] = [lines[v10Index], lines[v9Index]];
      return lines.join('\n');
    }],
    ['extra', (value) => value.replace(/^const POST_COMMIT_V10_BLOCK_SHA256.*$/m,
      (line) => `${line}\nconst POST_COMMIT_V10_EXTRA_BLOCK_SHA256 = '${'0'.repeat(64)}';`)]
  ];
  v10PinCases.forEach(([label, mutate]) => assert.throws(() => parseNormalizedSelfPinsV6(mutate(parserSource)),
    `normalized-self-pins/v6 rejects ${label} v10 pin`));
  assert.notDeepEqual(normalizedSelfSourceIdentityV6(parserSource.replace(
    "const POST_COMMIT_V10_REQUIRED_HEAD = '", "const POST_COMMIT_V10_REQUIRED_HEAD = './")), normalized,
  'normalized-self-pins/v6 does not exempt parser drift outside pin values');
  assert.throws(() => stripPostCommitV10Source(parserSource.replace(
    `\n${POST_COMMIT_V10_HELPER_END}\n`, `\n${POST_COMMIT_V10_HELPER_BEGIN}\n`)),
  'v10 parser branch marker mutation fails closed');
}

let postCommitV10ValidationLogged = false;
let postCommitV10HistoricalCheckpointMap = new Map();
const parseCollisionContractsBeforePostCommitV10 = parseCollisionContracts;
const runPostCommitV9AdversarialCasesBeforePostCommitV10 = runPostCommitV9AdversarialCases;

function parseCollisionContractsWithPostCommitV10() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  assertPinnedReportBlock(durableBlock.raw, DURABLE_EVIDENCE_BLOCK_SHA256, 'durable evidence block');
  assertPinnedReportBlock(v4Block.raw, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block');
  assertPinnedReportBlock(v5Block.raw, CURRENT_IDENTITY_V5_BLOCK_SHA256, 'current identity v5 block');
  assertPinnedReportBlock(v6Block.raw, FOREIGN_ROADMAP_V6_BLOCK_SHA256, 'foreign roadmap v6 block');
  assertPinnedReportBlock(v7Block.raw, FOREIGN_SET_V7_BLOCK_SHA256, 'foreign set v7 block');
  assertPinnedReportBlock(v9Block.raw, POST_COMMIT_V9_BLOCK_SHA256, 'post-commit v9 block');
  assert.equal(Buffer.byteLength(v9Block.raw), 23091, 'post-commit v9 marker-inclusive byte length is exact');
  assertPinnedReportBlock(v10Block.raw, POST_COMMIT_V10_BLOCK_SHA256, 'post-commit v10 block');
  validateDurableEvidenceBlock(durableBlock.value);
  validateCurrentIdentityV4Schema(v4Block.value);
  validateForeignRoadmapV6BeforeForeignSetV7(v6Block.value, v5Block.value, v4Block.value,
    v6Block.value, false);
  validateForeignSetV7(v7Block.value, v6Block.value, v5Block.value, v4Block.value,
    v7Block.value, false);
  const inherited = validateInheritedCollisionHistory(v4Block.value, v6Block.value, v7Block.value);
  postCommitV10HistoricalCheckpointMap = new Map(inherited.currentPaths
    .map((checkpoint) => [checkpoint.path, structuredClone(checkpoint)]));
  validatePostCommitV9AsV10History(v9Block.value, v7Block.value, v6Block.value, v5Block.value,
    v4Block.value, durableBlock.value);
  const matrix = validatePostCommitV10(v10Block.value, v9Block.value, v7Block.value,
    v6Block.value, v5Block.value, v4Block.value, durableBlock.value);
  const stage = { postCommitV10MatrixApplied: true, v5SemanticTransitionApplied: false };
  validateCurrentIdentityV5(v5Block.value, v4Block.value);
  assertV5SemanticTransitionAppliedAfterV10(v5Block.value, stage);
  validateFeatureTenLifecycleState(JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8')),
    v5Block.value);
  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  assertPostCommitV10PinValue(parserSource);
  normalizedSelfSourceIdentityV6(parserSource);
  if (!postCommitV10ValidationLogged) {
    console.log(`FEATURE004_V9_HISTORY_VALIDATED marker=${POST_COMMIT_V9_MARKER} sha256=${POST_COMMIT_V9_BLOCK_SHA256} requiredHead=${POST_COMMIT_V9_REQUIRED_HEAD} liveComparison=false disposition=non-reproducible-self-identity`);
    console.log(`FEATURE004_V10_VALIDATED marker=${POST_COMMIT_V10_MARKER} sha256=${POST_COMMIT_V10_BLOCK_SHA256} schema=${v10Block.value.contractVersion} head=${POST_COMMIT_V10_REQUIRED_HEAD} required=${matrix.requiredRecords.length} foreign=${matrix.foreignRecords.length} exclusions=${POST_COMMIT_V10_EXCLUDED_PATHS.length} matrix=${v10Block.value.identityContract.matrixSha256}`);
    console.log(`FEATURE004_V5_VALIDATED marker=feature004-dirty-collision-current-identity-v5 sha256=${CURRENT_IDENTITY_V5_BLOCK_SHA256} after=v10 status=done scopeProgress=8 completedScopes=8 phases=13`);
    postCommitV10ValidationLogged = true;
  }
  return {
    ...inherited,
    currentIdentityV5: v5Block.value,
    currentIdentityV5Raw: v5Block.raw,
    foreignRoadmapV6: v6Block.value,
    foreignRoadmapV6Raw: v6Block.raw,
    foreignSetV7: v7Block.value,
    foreignSetV7Raw: v7Block.raw,
    postCommitV9: v9Block.value,
    postCommitV9Raw: v9Block.raw,
    postCommitV10: v10Block.value,
    postCommitV10Raw: v10Block.raw,
    postCommitV10Matrix: matrix
  };
}

parseCollisionContracts = parseCollisionContractsWithPostCommitV10;
runForeignSetV7AdversarialCases = runPostCommitV10AdversarialCases;
assert.equal(parseCollisionContractsBeforePostCommitV10, parseCollisionContractsWithPostCommitV9,
  'v10 preserves the complete v9 parser branch as immutable historical input');
assert.equal(runPostCommitV9AdversarialCasesBeforePostCommitV10, runPostCommitV9AdversarialCases,
  'v10 preserves the complete v9 adversarial branch as immutable historical input');
const assertCurrentCheckpointIdentityBeforePostCommitV10 = assertCurrentCheckpointIdentity;
assertCurrentCheckpointIdentity = (checkpoint) => {
  const historical = postCommitV10HistoricalCheckpointMap.get(checkpoint.path);
  if (!historical) return assertCurrentCheckpointIdentityBeforePostCommitV10(checkpoint);
  assert.deepEqual(checkpoint, historical,
    `${checkpoint.path} complete predecessor checkpoint remains exact immutable history under v10`);
};
/* FEATURE-004-COLLISION-POST-COMMIT-V10-END */

/* FEATURE-004-COLLISION-POST-COMMIT-V11-BEGIN */
const POST_COMMIT_V11_REQUIRED_HEAD = '153a686c937017ae20a438f7a4a423cf76b019b3';
const POST_COMMIT_V11_MARKER = 'feature004-dirty-collision-post-commit-v11';
const POST_COMMIT_V11_HELPER_BEGIN = '/* FEATURE-004-COLLISION-POST-COMMIT-V11-BEGIN */';
const POST_COMMIT_V11_HELPER_END = '/* FEATURE-004-COLLISION-POST-COMMIT-V11-END */';
const POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS = [
  'specs/_bugs/BUG-002-market-brief-session-date-drift/report.md',
  'specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md',
  'specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json',
  'tests/playwright-runtime.foundation.functional.mjs'
];
const POST_COMMIT_V11_FOREIGN_PATHS = [
  ...POST_COMMIT_V9_FOREIGN_PATHS,
  ...POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS
];
const POST_COMMIT_V11_PORCELAIN_PATHS = [
  '.vscode/mcp.json',
  'rlbrief.js',
  'rlexperience.js',
  'rlfx.js',
  'rljourney.js',
  'specs/004-fx-regime-relative-value-lab/design.md',
  REPORT_PATH,
  'specs/004-fx-regime-relative-value-lab/scenario-manifest.json',
  'specs/004-fx-regime-relative-value-lab/scopes.md',
  'specs/004-fx-regime-relative-value-lab/spec.md',
  'specs/004-fx-regime-relative-value-lab/state.json',
  'specs/004-fx-regime-relative-value-lab/test-plan.json',
  'specs/004-fx-regime-relative-value-lab/uservalidation.md',
  'specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/scope.md',
  ...POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS.slice(0, 3),
  COLLISION_PARSER_PATH,
  POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS[3],
  'tests/simple-production-bridge.integration.mjs',
  'tests/simple-production-bridge.unit.mjs',
  V7_LOCK_FILE_EXCLUSION,
  'fx-vehicle-universe.json',
  'tests/feature-004-brief-eligibility.test.mjs',
  'tests/feature-004-journey-evidence-refresh.test.mjs',
  'tests/feature-004-tool-control-binding.test.mjs',
  'tests/feature-004-vehicle-universe.test.mjs'
];
const POST_COMMIT_V11_BUG002_PLANNING_PATHS = POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS.slice(0, 3);
const POST_COMMIT_V11_BUG002_TEST_PATHS = [POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS[3]];
const POST_COMMIT_V11_EXCLUDED_PATHS = [REPORT_PATH, V7_LOCK_FILE_EXCLUSION];
const POST_COMMIT_V11_TOP_LEVEL_FIELDS = [
  'contractVersion', 'findingId', 'successorRevision', 'capturedAt', 'requiredHead',
  'successorOf', 'extendsContracts', 'historicalValidation', 'v9SelfIdentityDisposition',
  'identityContract', 'inventoryProof', 'currentMatrix', 'inferenceContract',
  'parserOrder', 'parserHandoff', 'adversarialMutations', 'captureStability',
  'planningRouting', 'testOwnerHandoff'
];
const POST_COMMIT_V11_MATRIX_FIELDS = [
  'requiredRecords', 'foreignRecords', 'additiveForeignFullRecords',
  'excludedPaths', 'excludedRecords', 'ownershipTransfer', 'semanticApproval',
  'semanticAcceptance', 'completionClaim', 'checkboxClaim', 'scopeStatusClaim',
  'topLevelStatusClaim', 'certificationClaim'
];
const POST_COMMIT_V11_PARSER_ORDER = [
  'validate every predecessor marker-inclusive pin, closed schema, field order, parent link, and historical commitment through v10',
  "validate v10's exact marker-inclusive bytes, 39470-byte length, required HEAD, matrix hash, and historical 3-of-3 result without using v10 for current live comparison",
  "validate v9's exact non-reproducible-self-identity disposition and both immutable tuples through v10 without substitution or live-current comparison",
  'parse exactly one closed v11 block and require the exact current HEAD, 27-path porcelain order, classification groups, 34-record matrix, four additive full records, two exclusions, and zero-inference flags',
  'reconstruct the pre-v11 parser by removing only the exact v11 pin, normalized-family declaration, and closed v11 branch, then normalize the retained v6 pin family and compare the complete parser record',
  'recompute every complete required and foreign record, every summary, every additive full record, the matrix hash, and dirty-path equality while keeping both exclusions ineligible',
  'validate the already-physical v5 five-assertion semantic transition only after the v11 current matrix',
  'run all predecessor adversarial cases as mandatory history before the v11 adversarial cases'
];
const POST_COMMIT_V11_ADVERSARIAL_MUTATIONS = [
  'wrong current HEAD before append, after append, or during v11 parser adoption',
  'missing, duplicate, malformed, reordered, non-64-hex, or changed v11 marker or pin',
  'changed v10 marker-inclusive bytes, hash, byte length, schema, field order, required HEAD, matrix hash, predecessor link, parser-self record, or exact historical 3-of-3 result',
  'v10 historical 3-of-3 result used to satisfy the v11 current live comparison',
  'v10 23-path inventory accepted as current after v11 exists',
  'v10 live HEAD or live matrix comparison executed as current when v11 exists',
  'changed v9 committed tuple, changed v9 observed tuple, either tuple substituted for the other, or the non-reproducible disposition reopened',
  'any predecessor skipped because v11 exists',
  'missing, extra, duplicate, or reordered porcelain, required, foreign, additive, classification-group, or excluded path',
  'wrong status, staging flags, HEAD/index/worktree OID, worktree SHA-256, byte length, numstat, hunk count, hunk order, hunk hash, last commit, hunk-sequence hash, identity hash, or complete matrix hash',
  'wrong BUG-002 planning-evidence, planning-contract, or test classification or owner attribution',
  'foundation replay-local protected content-record digest substituted for its complete normal full record',
  'ownership inferred from dirtiness, commit state, or history',
  'changed, missing, extra, reordered, matrix-included, or completion-inference-eligible exclusion',
  'wrong parser capture mode, retained pin family, v7 pin-family order, reconstruction order, closed schema, field order, or current-matrix selector',
  'semantic approval, acceptance, completion, checkbox, scope-status, top-level-status, or certification inference',
  'parser mutation outside the exact additive v11 pin, normalized-family, parser/adversarial branch, and current-selector boundary'
];

function parseNormalizedSelfPinsV7(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V7,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6|FOREIGN_SET_V7|POST_COMMIT_V9|POST_COMMIT_V10|POST_COMMIT_V11)[A-Z0-9_]*BLOCK_SHA256) = '([^']*)';$/gm,
    'normalized-self-pins/v7');
}

function normalizedSelfSourceIdentityV7(source) {
  parseNormalizedSelfPinsV6(source);
  parseNormalizedSelfPinsV7(source);
  const normalizedBytes = Buffer.from(
    normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V7), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes)
  };
}

function assertPostCommitV11PinValue(source) {
  const assignments = parseNormalizedSelfPinsV7(source);
  assert.equal(assignments.at(-1)[1], 'POST_COMMIT_V11_BLOCK_SHA256',
    'normalized-self-pins/v7 ends with the v11 pin');
  assert.equal(assignments.at(-1)[2], POST_COMMIT_V11_BLOCK_SHA256,
    'the v11 pin retains the exact marker-inclusive report hash');
}

function stripPostCommitV11MarkerBranch(source) {
  const startNeedle = `${POST_COMMIT_V11_HELPER_BEGIN}\n`;
  const endNeedle = `${POST_COMMIT_V11_HELPER_END}\n`;
  assert.equal(source.split(startNeedle).length - 1, 1, 'the v11 parser branch has exactly one start marker line');
  assert.equal(source.split(endNeedle).length - 1, 1, 'the v11 parser branch has exactly one end marker line');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'the v11 parser branch marker order is exact');
  const suffixStart = end + endNeedle.length;
  assert.equal(source[suffixStart], '\n', 'the v11 parser branch has exactly one additive trailing LF');
  return source.slice(0, start) + source.slice(suffixStart + 1);
}

function stripPostCommitV11Source(source) {
  let historical = stripPostCommitV11MarkerBranch(source);
  historical = removeExactSuccessorAddition(historical,
    `const POST_COMMIT_V11_BLOCK_SHA256 = '${POST_COMMIT_V11_BLOCK_SHA256}';\n`,
    'v11 pin addition');
  historical = removeExactSuccessorAddition(historical,
    "const NORMALIZED_SELF_PIN_NAMES_V7 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V6,\n  'POST_COMMIT_V11_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v7 declaration');
  return historical;
}

function stripPostCommitV11Diff(diff) {
  const normalizedV7Addition = [
    '+const NORMALIZED_SELF_PIN_NAMES_V7 = [',
    '+  ...NORMALIZED_SELF_PIN_NAMES_V6,',
    "+  'POST_COMMIT_V11_BLOCK_SHA256'",
    '+];'
  ].join('\n');
  assert.equal(diff.split(normalizedV7Addition).length - 1, 1,
    'the v11 diff contains exactly one normalized-self-pins/v7 declaration');
  const withoutNormalizedV7 = diff.replace(normalizedV7Addition, '');
  const exactPinLine = `+const POST_COMMIT_V11_BLOCK_SHA256 = '${POST_COMMIT_V11_BLOCK_SHA256}';`;
  let pinLineCount = 0;
  let inBranch = false;
  let branchStarts = 0;
  let branchEnds = 0;
  for (const line of withoutNormalizedV7.split('\n')) {
    if (line === `+${POST_COMMIT_V11_HELPER_BEGIN}`) {
      inBranch = true;
      branchStarts += 1;
      continue;
    }
    if (inBranch) {
      if (line === `+${POST_COMMIT_V11_HELPER_END}`) {
        inBranch = false;
        branchEnds += 1;
      }
      continue;
    }
    if (line === exactPinLine) pinLineCount += 1;
  }
  assert.equal(inBranch, false, 'the v11 diff branch closes');
  assert.equal(branchStarts, 1, 'the v11 diff contains exactly one branch start');
  assert.equal(branchEnds, 1, 'the v11 diff contains exactly one branch end');
  assert.equal(pinLineCount, 1, 'the v11 diff contains exactly one v11 pin addition');
}

function postCommitV11ParserRecord(summary, source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  const preV11Source = stripPostCommitV11Source(source);
  parseNormalizedSelfPinsV6(preV11Source);
  const normalizedBytes = Buffer.from(
    normalizeSelfPinValuesForNames(preV11Source, NORMALIZED_SELF_PIN_NAMES_V6), 'utf8');
  stripPostCommitV11Diff(git(['diff', '--no-ext-diff', '--unified=0', '--', COLLISION_PARSER_PATH]));
  const hunks = parseDiffHunks(postCommitV10DiffFromHeadSource(
    COLLISION_PARSER_PATH, normalizedBytes)).filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(COLLISION_PARSER_PATH);
  return {
    path: COLLISION_PARSER_PATH,
    pathKind: 'tracked',
    classification: summary.classification,
    ownerAttribution: summary.ownerAttribution,
    feature004OwnershipClaim: summary.feature004OwnershipClaim,
    transitionClass: summary.transitionClass,
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(COLLISION_PARSER_PATH),
    indexOid: indexOid(COLLISION_PARSER_PATH),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes),
    byteLength: normalizedBytes.length,
    additions: hunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: hunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: hunks.length,
    hunkBodySha256: hunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(COLLISION_PARSER_PATH)
  };
}

function postCommitV11CurrentRecord(summary) {
  if (summary.path === COLLISION_PARSER_PATH) return postCommitV11ParserRecord(summary);
  return postCommitV10CurrentRecord(summary);
}

function assertPostCommitV11Summary(summary, record, label) {
  assertExactOrderedKeys(summary, POST_COMMIT_V9_SUMMARY_FIELDS, label);
  assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS, `${label} full record`);
  for (const field of [
    'path', 'pathKind', 'classification', 'ownerAttribution', 'feature004OwnershipClaim',
    'transitionClass', 'status', 'hunkCount'
  ]) assert.equal(summary[field], record[field], `${label}.${field} is exact`);
  record.hunkBodySha256.forEach((hash, index) =>
    assertSha256(hash, `${label}.hunkBodySha256[${index}]`));
  assert.equal(summary.hunkSequenceSha256, sha256(JSON.stringify(record.hunkBodySha256)),
    `${label} commits the complete ordered hunk sequence`);
  assert.equal(summary.identitySha256, sha256(JSON.stringify(record)),
    `${label} commits the complete ordered full record`);
}

function assertPostCommitV11RecordCommitments(v11, requiredRecords, foreignRecords,
  excludedPaths = POST_COMMIT_V11_EXCLUDED_PATHS, verifyInventory = true) {
  assert.deepEqual(requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'v11 full required records retain all 19 paths in exact order');
  assert.deepEqual(foreignRecords.map(({ path }) => path), POST_COMMIT_V11_FOREIGN_PATHS,
    'v11 full foreign records retain exactly 15 paths in exact order');
  assert.deepEqual(excludedPaths, POST_COMMIT_V11_EXCLUDED_PATHS,
    'v11 retains exactly report recursion and the session lock as exclusions');
  assert.equal(new Set([...requiredRecords, ...foreignRecords].map(({ path }) => path)).size, 34,
    'v11 matrix contains 34 unique non-excluded records');
  requiredRecords.forEach((record, index) =>
    assertPostCommitV11Summary(v11.currentMatrix.requiredRecords[index], record,
      `post-commit v11 requiredRecords[${index}]`));
  foreignRecords.forEach((record, index) =>
    assertPostCommitV11Summary(v11.currentMatrix.foreignRecords[index], record,
      `post-commit v11 foreignRecords[${index}]`));
  const additiveRecords = POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS.map((path) =>
    foreignRecords.find((record) => record.path === path));
  assert.deepEqual(v11.currentMatrix.additiveForeignFullRecords.map(({ path }) => path),
    POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS,
    'v11 additive full records retain the exact four-path order');
  v11.currentMatrix.additiveForeignFullRecords.forEach((record, index) =>
    assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS,
      `post-commit v11 additiveForeignFullRecords[${index}]`));
  assert.deepEqual(v11.currentMatrix.additiveForeignFullRecords, additiveRecords,
    'v11 additive foreign records are complete normal full records');
  assert.equal(sha256(JSON.stringify({
    requiredHead: v11.requiredHead,
    requiredRecords,
    foreignRecords,
    excludedPaths
  })), v11.identityContract.matrixSha256, 'v11 complete uncompressed matrix hash is exact');
  if (!verifyInventory) return;
  const porcelainPaths = postCommitV9PorcelainPaths();
  assert.deepEqual(porcelainPaths, POST_COMMIT_V11_PORCELAIN_PATHS,
    'v11 NUL-safe porcelain inventory has the exact 27-path order');
  assert.deepEqual(POST_COMMIT_V11_EXCLUDED_PATHS.map((path) => shortStatus(path)), [' M', '??'],
    'v11 exclusions are present only as report recursion and the session flock');
  const currentNonExcluded = porcelainPaths.filter((path) => !POST_COMMIT_V11_EXCLUDED_PATHS.includes(path));
  const expectedDirty = [...requiredRecords, ...foreignRecords]
    .filter(({ status }) => status !== '')
    .map(({ path }) => path);
  assert.deepEqual([...currentNonExcluded].sort(), [...expectedDirty].sort(),
    'v11 matrix equals every and only current dirty path after the two exact exclusions');
  assert.equal(requiredRecords.filter(({ status }) => status !== '').length, 10,
    'v11 has exactly ten dirty required paths');
  assert.equal(foreignRecords.filter(({ status }) => status !== '').length, 15,
    'v11 has exactly fifteen dirty foreign paths');
}

const postCommitV10CurrentRecordBeforePostCommitV11 = postCommitV10CurrentRecord;

function postCommitV10CurrentRecordAsV11History(summary) {
  if (summary.path !== COLLISION_PARSER_PATH) return postCommitV10CurrentRecordBeforePostCommitV11(summary);
  const source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  return postCommitV10ParserRecord(summary, stripPostCommitV11Source(source));
}

function postCommitV9ObservedIdentityFromV10SourceAsV11History() {
  const path = COLLISION_PARSER_PATH;
  const currentSource = readFileSync(resolve(ROOT, path), 'utf8');
  const preV10Source = stripPostCommitV10Source(stripPostCommitV11Source(currentSource));
  const historicalSource = stripPostCommitV9Source(preV10Source);
  const historicalBytes = Buffer.from(historicalSource, 'utf8');
  const historicalHunks = parseDiffHunks(postCommitV10DiffFromHeadSource(path, historicalBytes))
    .filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(path);
  return {
    path,
    pathKind: 'tracked',
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(path),
    indexOid: indexOid(path),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: historicalBytes
    }).trim(),
    worktreeSha256: sha256(historicalBytes),
    byteLength: historicalBytes.length,
    additions: historicalHunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: historicalHunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: historicalHunks.length,
    hunkBodySha256: historicalHunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(path)
  };
}

function withPostCommitV10HistoricalHead(run) {
  const activeGit = git;
  git = (args) => args.length === 2 && args[0] === 'rev-parse' && args[1] === 'HEAD'
    ? `${POST_COMMIT_V10_REQUIRED_HEAD}\n`
    : activeGit(args);
  try {
    return run();
  } finally {
    git = activeGit;
  }
}

function validatePostCommitV10AsV11History(v10, v9, v7, v6, v5, v4, durable) {
  const activeObservedV9 = postCommitV9ObservedIdentityFromV10Source;
  postCommitV9ObservedIdentityFromV10Source = postCommitV9ObservedIdentityFromV10SourceAsV11History;
  try {
    return withPostCommitV10HistoricalHead(() => {
      validatePostCommitV10(v10, v9, v7, v6, v5, v4, durable, v10, false);
      const requiredRecords = v10.currentMatrix.requiredRecords.map(postCommitV10CurrentRecordAsV11History);
      const foreignRecords = v10.currentMatrix.foreignRecords.map(postCommitV10CurrentRecordAsV11History);
      assertPostCommitV10RecordCommitments(v10, requiredRecords, foreignRecords,
        POST_COMMIT_V10_EXCLUDED_PATHS, false);
      const parserRecord = requiredRecords.find(({ path }) => path === COLLISION_PARSER_PATH);
      const parserCapture = v10.identityContract.parserSelfCapture;
      assertExactOrderedKeys(parserCapture, [
        'captureMode', 'retainedPinNames', ...POST_COMMIT_V9_FULL_RECORD_FIELDS,
        'hunkSequenceSha256', 'identitySha256'
      ], 'historical v10 parser self-capture');
      assert.deepEqual(Object.fromEntries(POST_COMMIT_V9_FULL_RECORD_FIELDS
        .map((field) => [field, parserCapture[field]])), parserRecord,
      'historical v10 parser self-capture remains the exact complete normalized pre-v10 record');
      assert.equal(parserCapture.hunkSequenceSha256, sha256(JSON.stringify(parserRecord.hunkBodySha256)),
        'historical v10 parser hunk sequence remains exact');
      assert.equal(parserCapture.identitySha256, sha256(JSON.stringify(parserRecord)),
        'historical v10 parser full-record identity remains exact');
      return { requiredRecords, foreignRecords };
    });
  } finally {
    postCommitV9ObservedIdentityFromV10Source = activeObservedV9;
  }
}

function runPostCommitV10AdversarialCasesAsV11History() {
  const activeCurrentRecord = postCommitV10CurrentRecord;
  const activeObservedV9 = postCommitV9ObservedIdentityFromV10Source;
  const activeRecordCommitments = assertPostCommitV10RecordCommitments;
  postCommitV10CurrentRecord = postCommitV10CurrentRecordAsV11History;
  postCommitV9ObservedIdentityFromV10Source = postCommitV9ObservedIdentityFromV10SourceAsV11History;
  assertPostCommitV10RecordCommitments = (v10, requiredRecords, foreignRecords,
    excludedPaths = POST_COMMIT_V10_EXCLUDED_PATHS, verifyInventory = false) => {
    assert.equal(verifyInventory, false, 'v10 live inventory comparison is forbidden under v11');
    return activeRecordCommitments(v10, requiredRecords, foreignRecords, excludedPaths, false);
  };
  try {
    withPostCommitV10HistoricalHead(() => runPostCommitV10AdversarialCases());
  } finally {
    postCommitV10CurrentRecord = activeCurrentRecord;
    postCommitV9ObservedIdentityFromV10Source = activeObservedV9;
    assertPostCommitV10RecordCommitments = activeRecordCommitments;
  }
}

function validatePostCommitV11(v11, v10, v9, v7, v6, v5, v4, durable,
  canonical = v11, verifyCurrent = true) {
  assertExactCanonicalContract(v11, canonical, 'post-commit v11 block');
  assertExactOrderedKeys(v11, POST_COMMIT_V11_TOP_LEVEL_FIELDS, 'post-commit v11 block');
  assert.equal(v11.contractVersion, 'feature004-dirty-collision-post-commit/v11');
  assert.equal(v11.findingId, 'F004-COLLISION-POST-COMMIT-V10');
  assert.equal(v11.successorRevision, 'v11');
  assertUtcTimestamp(v11.capturedAt, 'post-commit v11 capturedAt');
  assert.equal(v11.requiredHead, POST_COMMIT_V11_REQUIRED_HEAD);
  assert.equal(git(['rev-parse', 'HEAD']).trim(), POST_COMMIT_V11_REQUIRED_HEAD,
    'v11 parser adoption occurs at the exact required HEAD');
  assert.deepEqual(v11.successorOf, {
    marker: POST_COMMIT_V10_MARKER,
    rawBlockSha256: POST_COMMIT_V10_BLOCK_SHA256,
    markerInclusiveByteLength: 41318,
    contractVersion: 'feature004-dirty-collision-post-commit/v10',
    requiredHead: POST_COMMIT_V10_REQUIRED_HEAD,
    matrixSha256: '78e3199040d1ce2fcd46240e5b1433e4f5d35574306b7d64918b6cba538b7f2a',
    relation: 'additive-current-matrix-successor',
    predecessorDisposition: 'mandatory-immutable-history',
    historicalCollisionValidation: {
      result: 'green',
      testsPassed: 3,
      testsFailed: 0,
      source: 'operator-grounded continuation fact',
      satisfiesCurrentLiveComparison: false
    },
    successorRequiredReasons: [
      'dirty-inventory-expanded-after-v10',
      'v10-live-matrix-refuses-current-27-path-inventory'
    ]
  }, 'v11 successor link and historical v10 result are exact');
  assert.deepEqual(v11.extendsContracts, [
    { marker: POST_COMMIT_V10_MARKER, rawBlockSha256: POST_COMMIT_V10_BLOCK_SHA256 },
    { marker: POST_COMMIT_V9_MARKER, rawBlockSha256: POST_COMMIT_V9_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-set-v7', rawBlockSha256: FOREIGN_SET_V7_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-roadmap-v6', rawBlockSha256: FOREIGN_ROADMAP_V6_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v5', rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 },
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ], 'v11 predecessor markers and hashes are exact and ordered');
  assert.deepEqual(v11.historicalValidation, {
    allPredecessorMarkersHashesSchemasAndOrderThroughV10Required: true,
    v10MarkerInclusiveBytesRequired: true,
    v10MarkerInclusiveByteLength: 41318,
    v10RequiredHeadValueRequired: true,
    v10MatrixSha256Required: true,
    v10HistoricalCollisionResult: 'green-3-of-3-before-additive-inventory',
    v10HistoricalResultSatisfiesCurrentLiveComparison: false,
    v10RequiredHeadComparedToLiveHeadWhenV11Present: false,
    v10LiveMatrixComparisonWhenV11Present: false,
    v9NonReproducibleSelfIdentityDispositionRequired: true,
    v9CommittedAndObservedTuplesRequired: true,
    v9EvidenceFalse: false,
    predecessorAssertionDeletionOrWeakeningAllowed: false,
    disposition: 'mandatory-history-through-v10-before-v11'
  }, 'v11 historical preservation contract is exact');
  assert.deepEqual(v11.v9SelfIdentityDisposition, {
    sourceContractMarker: POST_COMMIT_V10_MARKER,
    sourceContractSha256: POST_COMMIT_V10_BLOCK_SHA256,
    path: COLLISION_PARSER_PATH,
    v9CommittedRecord: {
      hunkCount: 26,
      hunkSequenceSha256: '00d67d39086e104da50d3817a0b85f6979a1efecb293228e108c4ef268c9f7bf',
      identitySha256: '22547f9234d3f104c69f6eda5f853c9059ef26cfc2f2d77c8125f2d34c561eb4'
    },
    observedUnderExactV9Reconstruction: {
      hunkCount: 26,
      hunkSequenceSha256: '9d7c1bc3138b7e1cb1bb527bb676542fe51f5a354a63c443cee80884fd5392ed',
      identitySha256: 'e8b3ed9d39bf26126b5befdd25e1f96ac4bea360875b1b069ec1eed9117abd44'
    },
    disposition: 'non-reproducible-self-identity',
    committedTupleReopened: false,
    observedTupleReopened: false,
    tupleSubstitutionAllowed: false,
    validationRule: 'validate both exact tuples through the immutable v10 contract; never replace, overwrite, or compare either tuple as the v11 live-current parser identity'
  }, 'v11 preserves the exact v9 non-reproducible-self disposition');
  assert.deepEqual(v11.identityContract.fullRecordOrderedFields, POST_COMMIT_V9_FULL_RECORD_FIELDS);
  assert.deepEqual(v11.identityContract.summaryOrderedFields, POST_COMMIT_V9_SUMMARY_FIELDS);
  assert.equal(v11.identityContract.identitySha256Input,
    'JSON.stringify of the complete full record with the exact ordered fields above');
  assert.equal(v11.identityContract.hunkSequenceSha256Input,
    'JSON.stringify of the complete ordered hunkBodySha256 array');
  assert.equal(v11.identityContract.diffMode, 'git diff --no-ext-diff --unified=0');
  assert.equal(v11.identityContract.hunkHashInput,
    'ordered changed lines with plus or minus prefix joined by LF with no trailing LF');
  assert.equal(v11.identityContract.inventoryMode, 'git status --porcelain=v1 -z --untracked-files=all');
  assert.equal(v11.identityContract.matrixSha256Input,
    'JSON.stringify({requiredHead,requiredRecords,foreignRecords,excludedPaths}) using complete uncompressed full records');
  assert.equal(v11.identityContract.matrixSha256,
    '450f4110582ec2451438369ec8bb1e693815272dd93d6a975f5f1ea2a5ad5ba3');
  assert.equal(v11.identityContract.summariesAloneSatisfyMatrixValidation, false);
  assert.equal(v11.identityContract.additiveForeignFullRecordsRequired, true);
  assert.equal(v11.identityContract.parserSelfCapture.captureMode, 'normalized-self-pins/v6-pre-v11');
  assert.deepEqual(v11.identityContract.parserSelfCapture.retainedPinNames, NORMALIZED_SELF_PIN_NAMES_V6);
  assert.deepEqual(v11.inventoryProof.porcelainPathOrder, POST_COMMIT_V11_PORCELAIN_PATHS);
  assert.deepEqual({
    porcelainPathCount: v11.inventoryProof.porcelainPathCount,
    dirtyRequiredPathCount: v11.inventoryProof.dirtyRequiredPathCount,
    foreignDirtyPathCount: v11.inventoryProof.foreignDirtyPathCount,
    excludedDirtyPathCount: v11.inventoryProof.excludedDirtyPathCount,
    requiredPathCount: v11.inventoryProof.requiredPathCount,
    matrixRecordCount: v11.inventoryProof.matrixRecordCount
  }, {
    porcelainPathCount: 27,
    dirtyRequiredPathCount: 10,
    foreignDirtyPathCount: 15,
    excludedDirtyPathCount: 2,
    requiredPathCount: 19,
    matrixRecordCount: 34
  }, 'v11 inventory counts are exact');
  assert.deepEqual(v11.inventoryProof.requiredTransitionCounts, {
    'clean-head-index-promotion': 9,
    'still-dirty-exact-identity': 5,
    'untracked-exact-identity': 5
  });
  const classifications = v11.inventoryProof.pathClassification;
  assert.equal(classifications.classificationBasis,
    'canonical artifact ownership plus explicit Feature 004, Feature 012, BUG-002, and workspace context; never dirtiness, commit authorship, or path history');
  assert.equal(classifications.matrixForeignRecordSemantics,
    'foreignRecords means outside the Feature 004 Scope 1 required set; it does not override canonical artifact ownership');
  assert.equal(classifications.uservalidationOwnershipSemantics,
    'bubbles.plan owns the artifact structure and the human owner owns semantic acceptance; no acceptance is inferred');
  assert.deepEqual(classifications.scope1CurrentPaths, POST_COMMIT_V10_SCOPE_ONE_CURRENT_PATHS);
  assert.deepEqual(classifications.planningOwnedCurrentPaths, POST_COMMIT_V10_PLANNING_CURRENT_PATHS);
  assert.deepEqual(classifications.feature012BridgeCurrentPaths, POST_COMMIT_V10_FEATURE_TWELVE_CURRENT_PATHS);
  assert.deepEqual(classifications.bug002PlanningCurrentPaths, POST_COMMIT_V11_BUG002_PLANNING_PATHS);
  assert.deepEqual(classifications.bug002TestCurrentPaths, POST_COMMIT_V11_BUG002_TEST_PATHS);
  assert.deepEqual(classifications.additiveSinceV10Paths, POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS);
  assert.deepEqual(classifications.workspaceConfigCurrentPaths, ['.vscode/mcp.json']);
  assert.deepEqual(classifications.foreignSpecialistCurrentPaths,
    POST_COMMIT_V10_FOREIGN_SPECIALIST_CURRENT_PATHS);
  assert.deepEqual(classifications.sessionRuntimeExclusionPaths, [V7_LOCK_FILE_EXCLUSION]);
  assert.equal(classifications.ownershipInferredFromDirtiness, false);
  assert.equal(classifications.ownershipInferredFromCommit, false);
  assert.equal(classifications.ownershipInferredFromHistory, false);
  assert.equal(v11.inventoryProof.completionInferenceFromInventory, false);
  assertExactOrderedKeys(v11.currentMatrix, POST_COMMIT_V11_MATRIX_FIELDS, 'post-commit v11 matrix');
  assert.deepEqual(v11.currentMatrix.requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS);
  assert.deepEqual(v11.currentMatrix.foreignRecords.map(({ path }) => path), POST_COMMIT_V11_FOREIGN_PATHS);
  assert.deepEqual(v11.currentMatrix.additiveForeignFullRecords.map(({ path }) => path),
    POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS);
  assert.deepEqual(v11.currentMatrix.excludedPaths, POST_COMMIT_V11_EXCLUDED_PATHS);
  assert.deepEqual(v11.currentMatrix.excludedRecords, [
    {
      path: REPORT_PATH,
      status: ' M',
      classification: 'planning-owned-report-recursion-exclusion',
      ownerAttribution: 'bubbles.plan',
      matrixEligible: false,
      completionInferenceEligible: false
    },
    {
      path: V7_LOCK_FILE_EXCLUSION,
      status: '??',
      classification: 'session-runtime-lock-exclusion',
      ownerAttribution: 'session runtime',
      matrixEligible: false,
      completionInferenceEligible: false
    }
  ], 'v11 exclusions are exact and ineligible');
  assert.equal(v11.currentMatrix.ownershipTransfer, false);
  POST_COMMIT_V10_ZERO_INFERENCE_FIELDS.forEach((field) =>
    assert.equal(v11.currentMatrix[field], false, `v11 current matrix ${field} remains false`));
  Object.values(v11.inferenceContract).forEach((value) =>
    assert.equal(value, false, 'v11 inference contract contains only false values'));
  assert.deepEqual(v11.parserOrder, POST_COMMIT_V11_PARSER_ORDER);
  assert.deepEqual(v11.parserHandoff, {
    owner: 'bubbles.test',
    path: COLLISION_PARSER_PATH,
    newPinLiteral: 'POST_COMMIT_V11_BLOCK_SHA256',
    pinValueSource: 'marker-inclusive, no-trailing-newline SHA-256 of this v11 report block',
    pinCountDelta: 1,
    captureMode: 'normalized-self-pins/v6-pre-v11',
    normalizedMode: 'normalized-self-pins/v7',
    normalizedPinFamilyName: 'NORMALIZED_SELF_PIN_NAMES_V7',
    retainedPinLiterals: NORMALIZED_SELF_PIN_NAMES_V6,
    normalizedPinFamilyOrder: NORMALIZED_SELF_PIN_NAMES_V7,
    closedTopLevelFieldOrder: POST_COMMIT_V11_TOP_LEVEL_FIELDS,
    closedCurrentMatrixFieldOrder: POST_COMMIT_V11_MATRIX_FIELDS,
    reconstructionMode: 'strip the exact v11 pin, NORMALIZED_SELF_PIN_NAMES_V7 declaration, and closed v11 branch; then normalize exactly NORMALIZED_SELF_PIN_NAMES_V6',
    currentMatrixSelector: 'v11-only',
    predecessorValidationMode: 'v10-v9-and-all-predecessors-remain-mandatory-immutable-history',
    testEditBoundary: 'add exactly one v11 pin, one NORMALIZED_SELF_PIN_NAMES_V7 declaration, one closed FEATURE-004-COLLISION-POST-COMMIT-V11 parser/adversarial branch, and the minimum assignment that selects v11 as current; preserve every existing parser byte outside that additive boundary',
    onlyAllowedEditedPath: COLLISION_PARSER_PATH,
    v10BranchEditAllowed: false,
    v9BranchEditAllowed: false,
    predecessorEditAllowed: false,
    productEditsAllowed: false,
    planningEditsAllowed: false,
    bug002ArtifactEditsAllowed: false,
    foreignEditsAllowed: false,
    reportEditAllowed: false
  }, 'v11 parser handoff and preservation boundary are exact');
  assert.deepEqual(v11.adversarialMutations, POST_COMMIT_V11_ADVERSARIAL_MUTATIONS);
  assert.deepEqual(v11.captureStability, {
    preAppendMatrixSha256: '450f4110582ec2451438369ec8bb1e693815272dd93d6a975f5f1ea2a5ad5ba3',
    postAppendMustMatch: true,
    headMustRemainExact: true,
    porcelainOrderMustRemainExact: true,
    rollbackBoundary: 'remove only an incomplete v11 report append and return blocked',
    v10OrPredecessorRollbackAllowed: false,
    foreignOrProductRollbackAllowed: false
  }, 'v11 capture stability is exact');
  assert.deepEqual(v11.planningRouting, {
    updatedPaths: [REPORT_PATH],
    otherPlanningArtifactUpdateMechanicallyRequired: false,
    transitionRequestId: 'TR-F004-SCOPE01-POST-COMMIT-V11-001',
    nextRequiredOwner: 'bubbles.test',
    scopeStatusChanged: false,
    checkboxChanged: false,
    featureStatusChanged: false,
    certificationChanged: false,
    scopeTwoStarted: false
  }, 'v11 planning routing changes no completion state');
  assert.equal(v11.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v11.testOwnerHandoff.transitionRequestId, 'TR-F004-SCOPE01-POST-COMMIT-V11-001');
  assert.equal(v11.testOwnerHandoff.requiredActions.length, 9);
  assert.deepEqual(v11.testOwnerHandoff.historicalFoundationResult, {
    result: 'green',
    testsPassed: 5,
    testsFailed: 0,
    source: 'operator-grounded continuation fact',
    currentFileSha256: '649e534dcd83669f36620f3384db7e1938adf2db63c231694bb6f0ecc2cfa591',
    reEditRequired: false
  });
  assert.equal(v11.testOwnerHandoff.bug002ResumeGate, 2);
  assert.equal(v11.testOwnerHandoff.nextRequiredOwner, 'bubbles.test');
  assert.equal(v10.contractVersion, 'feature004-dirty-collision-post-commit/v10');
  assert.equal(v9.contractVersion, 'feature004-dirty-collision-post-commit/v9');
  assert.equal(v7.contractVersion, 'feature004-dirty-collision-foreign-set/v7');
  assert.equal(v6.contractVersion, 'feature004-dirty-collision-foreign-roadmap/v6');
  assert.equal(v5.contractVersion, 'feature004-dirty-collision-current-identity/v5');
  assert.equal(v4.contractVersion, 'feature004-dirty-collision-current-identity/v4');
  assert.equal(durable.contractVersion, 'feature004-durable-evidence-admission/v1');
  if (!verifyCurrent) return null;
  const requiredRecords = v11.currentMatrix.requiredRecords.map(postCommitV11CurrentRecord);
  const foreignRecords = v11.currentMatrix.foreignRecords.map(postCommitV11CurrentRecord);
  assertPostCommitV11RecordCommitments(v11, requiredRecords, foreignRecords);
  const parserRecord = requiredRecords.find(({ path }) => path === COLLISION_PARSER_PATH);
  const parserCapture = v11.identityContract.parserSelfCapture;
  assertExactOrderedKeys(parserCapture, [
    'captureMode', 'retainedPinNames', ...POST_COMMIT_V9_FULL_RECORD_FIELDS,
    'hunkSequenceSha256', 'identitySha256'
  ], 'v11 parser self-capture');
  assert.deepEqual(Object.fromEntries(POST_COMMIT_V9_FULL_RECORD_FIELDS
    .map((field) => [field, parserCapture[field]])), parserRecord,
  'v11 parser self-capture contains the exact complete normalized pre-v11 record');
  assert.equal(parserCapture.hunkSequenceSha256, sha256(JSON.stringify(parserRecord.hunkBodySha256)),
    'v11 parser self-capture commits the complete normalized hunk sequence');
  assert.equal(parserCapture.identitySha256, sha256(JSON.stringify(parserRecord)),
    'v11 parser self-capture commits the complete normalized full record');
  return { requiredRecords, foreignRecords };
}

function assertPostCommitV11RecordMutationFails(v11, requiredRecords, foreignRecords, label, mutate) {
  const requiredCandidate = structuredClone(requiredRecords);
  const foreignCandidate = structuredClone(foreignRecords);
  mutate(requiredCandidate, foreignCandidate);
  assert.throws(() => assertPostCommitV11RecordCommitments(v11, requiredCandidate, foreignCandidate,
    POST_COMMIT_V11_EXCLUDED_PATHS, false), label);
}

function runPostCommitV11AdversarialCases() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  const v11Block = parseReportBlock(report, POST_COMMIT_V11_MARKER);
  runPostCommitV10AdversarialCasesAsV11History();
  assert.throws(() => parseReportBlock(`${report}\n${v11Block.raw}`, POST_COMMIT_V11_MARKER),
    'duplicate v11 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v11Block.raw, ''), POST_COMMIT_V11_MARKER),
    'missing v11 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v11Block.raw,
    v11Block.raw.replace('```json\n{', '```json\n{ malformed')), POST_COMMIT_V11_MARKER),
  'malformed v11 report block fails closed');
  assert.throws(() => assertPinnedReportBlock(`${v11Block.raw} `, POST_COMMIT_V11_BLOCK_SHA256,
    'mutated post-commit v11 block'), 'v11 marker-inclusive byte drift fails closed');
  assertEveryClosedSchemaMutationFails(v11Block.value,
    (candidate) => validatePostCommitV11(candidate, v10Block.value, v9Block.value, v7Block.value,
      v6Block.value, v5Block.value, v4Block.value, durableBlock.value, v11Block.value, false),
    'post-commit v11 block');

  const requiredRecords = v11Block.value.currentMatrix.requiredRecords.map(postCommitV11CurrentRecord);
  const foreignRecords = v11Block.value.currentMatrix.foreignRecords.map(postCommitV11CurrentRecord);
  const matrixCases = [
    ['v11 missing required path', (required) => { required.pop(); }],
    ['v11 extra required path', (required) => { required.push({ ...structuredClone(required[0]), path: 'unexpected-required' }); }],
    ['v11 duplicate required path', (required) => { required.push(structuredClone(required[0])); }],
    ['v11 reordered required paths', (required) => { required.reverse(); }],
    ['v11 missing foreign path', (_required, foreign) => { foreign.pop(); }],
    ['v11 extra foreign path', (_required, foreign) => { foreign.push({ ...structuredClone(foreign[0]), path: 'docs/Unexpected.md' }); }],
    ['v11 duplicate foreign path', (_required, foreign) => { foreign.push(structuredClone(foreign[0])); }],
    ['v11 reordered foreign paths', (_required, foreign) => { foreign.reverse(); }],
    ['v11 BUG-002 classification mismatch', (_required, foreign) => {
      foreign.at(-1).classification = 'foreign-feature-test';
    }],
    ['v11 BUG-002 owner mismatch', (_required, foreign) => {
      foreign.at(-1).ownerAttribution = 'Feature 004 Scope 1';
    }],
    ['v11 ownership transfer', (_required, foreign) => { foreign[0].feature004OwnershipClaim = true; }]
  ];
  matrixCases.forEach(([label, mutate]) =>
    assertPostCommitV11RecordMutationFails(v11Block.value, requiredRecords, foreignRecords, label, mutate));
  POST_COMMIT_V9_FULL_RECORD_FIELDS.forEach((field) => {
    assertPostCommitV11RecordMutationFails(v11Block.value, requiredRecords, foreignRecords,
      `v11 full record rejects changed ${field}`, (required) => {
        if (field === 'hunkBodySha256') required[0][field] = [...required[0][field]].reverse();
        else required[0][field] = changedLeafValue(required[0][field]);
      });
  });
  assert.throws(() => assertPostCommitV11RecordCommitments(v11Block.value, requiredRecords, foreignRecords,
    [V7_LOCK_FILE_EXCLUSION], false), 'v11 missing report exclusion fails closed');
  assert.throws(() => assertPostCommitV11RecordCommitments(v11Block.value, requiredRecords, foreignRecords,
    [...POST_COMMIT_V11_EXCLUDED_PATHS, 'docs/Unexpected.md'], false), 'v11 extra exclusion fails closed');
  assert.throws(() => assertPostCommitV11RecordCommitments(v11Block.value, requiredRecords, foreignRecords,
    [...POST_COMMIT_V11_EXCLUDED_PATHS].reverse(), false), 'v11 reordered exclusions fail closed');
  assert.throws(() => assertPostCommitV11RecordCommitments(v11Block.value, requiredRecords, foreignRecords,
    [REPORT_PATH, foreignRecords[0].path], false), 'v11 matrix-included exclusion fails closed');

  const contractCases = [
    ['v11 wrong required HEAD', (value) => { value.requiredHead = '0'.repeat(40); }],
    ['v11 reordered porcelain paths', (value) => { value.inventoryProof.porcelainPathOrder.reverse(); }],
    ['v11 reordered Scope 1 classification', (value) => { value.inventoryProof.pathClassification.scope1CurrentPaths.reverse(); }],
    ['v11 wrong BUG-002 planning classification', (value) => { value.inventoryProof.pathClassification.bug002PlanningCurrentPaths.pop(); }],
    ['v11 wrong BUG-002 test classification', (value) => { value.inventoryProof.pathClassification.bug002TestCurrentPaths[0] = COLLISION_PARSER_PATH; }],
    ['v11 missing additive classification', (value) => { value.inventoryProof.pathClassification.additiveSinceV10Paths.pop(); }],
    ['v11 ownership inferred from dirtiness', (value) => { value.inventoryProof.pathClassification.ownershipInferredFromDirtiness = true; }],
    ['v11 completion inferred from inventory', (value) => { value.inventoryProof.completionInferenceFromInventory = true; }],
    ['v11 missing additive full record', (value) => { value.currentMatrix.additiveForeignFullRecords.pop(); }],
    ['v11 reordered additive full records', (value) => { value.currentMatrix.additiveForeignFullRecords.reverse(); }],
    ['v11 foundation content digest substitutes full record', (value) => {
      value.currentMatrix.additiveForeignFullRecords[3] = {
        path: POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS[3],
        replayLocalProtectedContentSha256: value.currentMatrix.additiveForeignFullRecords[3].worktreeSha256
      };
    }],
    ['v11 exclusion becomes matrix eligible', (value) => { value.currentMatrix.excludedRecords[0].matrixEligible = true; }],
    ['v11 exclusion becomes completion eligible', (value) => { value.currentMatrix.excludedRecords[1].completionInferenceEligible = true; }],
    ['v11 semantic approval inferred', (value) => { value.currentMatrix.semanticApproval = true; }],
    ['v11 certification inferred', (value) => { value.inferenceContract.certification = true; }],
    ['v11 parser capture mode drift', (value) => { value.parserHandoff.captureMode = 'normalized-self-pins/v7'; }],
    ['v11 normalized family order drift', (value) => { value.parserHandoff.normalizedPinFamilyOrder.reverse(); }],
    ['v11 closed top-level order drift', (value) => { value.parserHandoff.closedTopLevelFieldOrder.reverse(); }],
    ['v11 closed matrix order drift', (value) => { value.parserHandoff.closedCurrentMatrixFieldOrder.reverse(); }],
    ['v11 current selector drift', (value) => { value.parserHandoff.currentMatrixSelector = 'v10-and-v11'; }],
    ['v11 parser order drift', (value) => { value.parserOrder.reverse(); }]
  ];
  contractCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(v11Block.value);
    mutate(candidate);
    assert.throws(() => validatePostCommitV11(candidate, v10Block.value, v9Block.value, v7Block.value,
      v6Block.value, v5Block.value, v4Block.value, durableBlock.value, v11Block.value, false), label);
  });

  const v10Required = v10Block.value.currentMatrix.requiredRecords.map(postCommitV10CurrentRecordAsV11History);
  const v10Foreign = v10Block.value.currentMatrix.foreignRecords.map(postCommitV10CurrentRecordAsV11History);
  assert.throws(() => assertPostCommitV10RecordCommitments(v10Block.value, v10Required, v10Foreign,
    POST_COMMIT_V10_EXCLUDED_PATHS, true), 'v10 23-path inventory cannot satisfy v11 current comparison');
  assert.throws(() => validatePostCommitV10(v10Block.value, v9Block.value, v7Block.value,
    v6Block.value, v5Block.value, v4Block.value, durableBlock.value, v10Block.value, true),
  'v10 live matrix comparison is forbidden and fails when v11 owns current validation');
  const changedV9Disposition = structuredClone(v11Block.value);
  changedV9Disposition.v9SelfIdentityDisposition.v9CommittedRecord.identitySha256 =
    changedV9Disposition.v9SelfIdentityDisposition.observedUnderExactV9Reconstruction.identitySha256;
  assert.throws(() => validatePostCommitV11(changedV9Disposition, v10Block.value, v9Block.value,
    v7Block.value, v6Block.value, v5Block.value, v4Block.value, durableBlock.value,
    v11Block.value, false), 'v9 tuple substitution remains forbidden under v11');

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const normalized = normalizedSelfSourceIdentityV7(parserSource);
  assertPostCommitV11PinValue(parserSource);
  const changedPins = parserSource
    .replace(DURABLE_EVIDENCE_BLOCK_SHA256, '1'.repeat(64))
    .replace(CURRENT_IDENTITY_V4_BLOCK_SHA256, '2'.repeat(64))
    .replace(CURRENT_IDENTITY_V5_BLOCK_SHA256, '3'.repeat(64))
    .replace(FOREIGN_ROADMAP_V6_BLOCK_SHA256, '4'.repeat(64))
    .replace(FOREIGN_SET_V7_BLOCK_SHA256, '5'.repeat(64))
    .replace(POST_COMMIT_V9_BLOCK_SHA256, '6'.repeat(64))
    .replace(POST_COMMIT_V10_BLOCK_SHA256, '7'.repeat(64))
    .replace(POST_COMMIT_V11_BLOCK_SHA256, '8'.repeat(64));
  assert.deepEqual(normalizedSelfSourceIdentityV7(changedPins), normalized,
    'normalized-self-pins/v7 normalizes exactly all eight valid pin values');
  assert.throws(() => assertPostCommitV11PinValue(changedPins),
    'normalized-self-pins/v7 rejects a changed valid-hex v11 pin as report authority');
  const v11PinCases = [
    ['missing', (value) => value.replace(/^const POST_COMMIT_V11_BLOCK_SHA256.*\n/m, '')],
    ['duplicate', (value) => value.replace(/^const POST_COMMIT_V11_BLOCK_SHA256.*$/m,
      (line) => `${line}\n${line}`)],
    ['renamed', (value) => value.replace('POST_COMMIT_V11_BLOCK_SHA256', 'POST_COMMIT_CURRENT_BLOCK_SHA256')],
    ['nonhex', (value) => value.replace(POST_COMMIT_V11_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered', (value) => {
      const lines = value.split('\n');
      const v10Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V10_BLOCK_SHA256'));
      const v11Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V11_BLOCK_SHA256'));
      [lines[v10Index], lines[v11Index]] = [lines[v11Index], lines[v10Index]];
      return lines.join('\n');
    }],
    ['extra', (value) => value.replace(/^const POST_COMMIT_V11_BLOCK_SHA256.*$/m,
      (line) => `${line}\nconst POST_COMMIT_V11_EXTRA_BLOCK_SHA256 = '${'0'.repeat(64)}';`)]
  ];
  v11PinCases.forEach(([label, mutate]) => assert.throws(() => parseNormalizedSelfPinsV7(mutate(parserSource)),
    `normalized-self-pins/v7 rejects ${label} v11 pin`));
  assert.notDeepEqual(normalizedSelfSourceIdentityV7(parserSource.replace(
    "const POST_COMMIT_V11_REQUIRED_HEAD = '", "const POST_COMMIT_V11_REQUIRED_HEAD = './")), normalized,
  'normalized-self-pins/v7 does not exempt parser drift outside pin values');
  assert.throws(() => stripPostCommitV11Source(parserSource.replace(
    `\n${POST_COMMIT_V11_HELPER_END}\n`, `\n${POST_COMMIT_V11_HELPER_BEGIN}\n`)),
  'v11 parser branch marker mutation fails closed');
}

let postCommitV11ValidationLogged = false;
let postCommitV11HistoricalCheckpointMap = new Map();
const parseCollisionContractsBeforePostCommitV11 = parseCollisionContracts;
const runPostCommitV10AdversarialCasesBeforePostCommitV11 = runPostCommitV10AdversarialCases;

function parseCollisionContractsWithPostCommitV11() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  const v11Block = parseReportBlock(report, POST_COMMIT_V11_MARKER);
  assertPinnedReportBlock(durableBlock.raw, DURABLE_EVIDENCE_BLOCK_SHA256, 'durable evidence block');
  assertPinnedReportBlock(v4Block.raw, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block');
  assertPinnedReportBlock(v5Block.raw, CURRENT_IDENTITY_V5_BLOCK_SHA256, 'current identity v5 block');
  assertPinnedReportBlock(v6Block.raw, FOREIGN_ROADMAP_V6_BLOCK_SHA256, 'foreign roadmap v6 block');
  assertPinnedReportBlock(v7Block.raw, FOREIGN_SET_V7_BLOCK_SHA256, 'foreign set v7 block');
  assertPinnedReportBlock(v9Block.raw, POST_COMMIT_V9_BLOCK_SHA256, 'post-commit v9 block');
  assert.equal(Buffer.byteLength(v9Block.raw), 23091, 'post-commit v9 marker-inclusive byte length is exact');
  assertPinnedReportBlock(v10Block.raw, POST_COMMIT_V10_BLOCK_SHA256, 'post-commit v10 block');
  assert.equal(Buffer.byteLength(v10Block.raw), 41318, 'post-commit v10 marker-inclusive byte length is exact');
  assertPinnedReportBlock(v11Block.raw, POST_COMMIT_V11_BLOCK_SHA256, 'post-commit v11 block');
  assert.equal(Buffer.byteLength(v11Block.raw), 49810, 'post-commit v11 marker-inclusive byte length is exact');
  validateDurableEvidenceBlock(durableBlock.value);
  validateCurrentIdentityV4Schema(v4Block.value);
  validateForeignRoadmapV6BeforeForeignSetV7(v6Block.value, v5Block.value, v4Block.value,
    v6Block.value, false);
  validateForeignSetV7(v7Block.value, v6Block.value, v5Block.value, v4Block.value,
    v7Block.value, false);
  const inherited = validateInheritedCollisionHistory(v4Block.value, v6Block.value, v7Block.value);
  postCommitV11HistoricalCheckpointMap = new Map(inherited.currentPaths
    .map((checkpoint) => [checkpoint.path, structuredClone(checkpoint)]));
  validatePostCommitV9AsV10History(v9Block.value, v7Block.value, v6Block.value, v5Block.value,
    v4Block.value, durableBlock.value);
  validatePostCommitV10AsV11History(v10Block.value, v9Block.value, v7Block.value, v6Block.value,
    v5Block.value, v4Block.value, durableBlock.value);
  const matrix = validatePostCommitV11(v11Block.value, v10Block.value, v9Block.value,
    v7Block.value, v6Block.value, v5Block.value, v4Block.value, durableBlock.value);
  const stage = { postCommitV10MatrixApplied: true, v5SemanticTransitionApplied: false };
  validateCurrentIdentityV5(v5Block.value, v4Block.value);
  assertV5SemanticTransitionAppliedAfterV10(v5Block.value, stage);
  validateFeatureTenLifecycleState(JSON.parse(readFileSync(resolve(ROOT, FEATURE_TEN_STATE_PATH), 'utf8')),
    v5Block.value);
  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  assertPostCommitV11PinValue(parserSource);
  normalizedSelfSourceIdentityV7(parserSource);
  if (!postCommitV11ValidationLogged) {
    console.log(`FEATURE004_V10_HISTORY_VALIDATED marker=${POST_COMMIT_V10_MARKER} sha256=${POST_COMMIT_V10_BLOCK_SHA256} bytes=41318 requiredHead=${POST_COMMIT_V10_REQUIRED_HEAD} liveComparison=false historicalTests=3/3`);
    console.log(`FEATURE004_V11_VALIDATED marker=${POST_COMMIT_V11_MARKER} sha256=${POST_COMMIT_V11_BLOCK_SHA256} bytes=49810 schema=${v11Block.value.contractVersion} head=${POST_COMMIT_V11_REQUIRED_HEAD} required=${matrix.requiredRecords.length} foreign=${matrix.foreignRecords.length} additive=${POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS.length} exclusions=${POST_COMMIT_V11_EXCLUDED_PATHS.length} matrix=${v11Block.value.identityContract.matrixSha256}`);
    console.log(`FEATURE004_V5_VALIDATED marker=feature004-dirty-collision-current-identity-v5 sha256=${CURRENT_IDENTITY_V5_BLOCK_SHA256} after=v11 status=done scopeProgress=8 completedScopes=8 phases=13`);
    postCommitV11ValidationLogged = true;
  }
  return {
    ...inherited,
    currentIdentityV5: v5Block.value,
    currentIdentityV5Raw: v5Block.raw,
    foreignRoadmapV6: v6Block.value,
    foreignRoadmapV6Raw: v6Block.raw,
    foreignSetV7: v7Block.value,
    foreignSetV7Raw: v7Block.raw,
    postCommitV9: v9Block.value,
    postCommitV9Raw: v9Block.raw,
    postCommitV10: v10Block.value,
    postCommitV10Raw: v10Block.raw,
    postCommitV11: v11Block.value,
    postCommitV11Raw: v11Block.raw,
    postCommitV11Matrix: matrix
  };
}

parseCollisionContracts = parseCollisionContractsWithPostCommitV11;
runForeignSetV7AdversarialCases = runPostCommitV11AdversarialCases;
assert.equal(parseCollisionContractsBeforePostCommitV11, parseCollisionContractsWithPostCommitV10,
  'v11 preserves the complete v10 parser branch as immutable historical input');
assert.equal(runPostCommitV10AdversarialCasesBeforePostCommitV11, runPostCommitV10AdversarialCases,
  'v11 preserves the complete v10 adversarial branch as immutable historical input');
const assertCurrentCheckpointIdentityBeforePostCommitV11 = assertCurrentCheckpointIdentity;
assertCurrentCheckpointIdentity = (checkpoint) => {
  const historical = postCommitV11HistoricalCheckpointMap.get(checkpoint.path);
  if (!historical) return assertCurrentCheckpointIdentityBeforePostCommitV11(checkpoint);
  assert.deepEqual(checkpoint, historical,
    `${checkpoint.path} complete predecessor checkpoint remains exact immutable history under v11`);
};
/* FEATURE-004-COLLISION-POST-COMMIT-V11-END */

/* FEATURE-004-COLLISION-POST-COMMIT-V12-BEGIN */
const POST_COMMIT_V12_MARKER = 'feature004-dirty-collision-post-commit-v12';
const POST_COMMIT_V12_BLOCK_BYTE_LENGTH = 58978;
const POST_COMMIT_V12_REPORT_PREFIX_BYTE_LENGTH = 524389;
const POST_COMMIT_V12_REPORT_PREFIX_SHA256 = 'b5d25b5608da4e4d9cc64c4db6db805c5638471413b8644de1fbecebeff1835d';
const POST_COMMIT_V12_INVENTORY_SHA256 = '8241bc6b27eac0d0a2543142b3d5bb6883f727cc1920fd3f899989a73fc9d723';
const POST_COMMIT_V12_MATRIX_SHA256 = '3d680812db545c65f341ee3091a10c4211a5790fdc62ff9b34cbae5b7574ef62';
const POST_COMMIT_V12_CLOSURE_SHA256 = 'e61f3c52ebfea482d272075a4de9754acab20170700d0e618bb5c1ff64ce61b4';
const POST_COMMIT_V12_HELPER_BEGIN = '/* FEATURE-004-COLLISION-POST-COMMIT-V12-BEGIN */';
const POST_COMMIT_V12_HELPER_END = '/* FEATURE-004-COLLISION-POST-COMMIT-V12-END */';
const POST_COMMIT_V12_TOP_LEVEL_FIELDS = [
  'contractVersion', 'findingIds', 'successorRevision', 'capturedAt', 'capturedHead',
  'headPolicy', 'successorOf', 'extendsContracts', 'historicalValidation',
  'identityContract', 'inventoryProof', 'currentMatrix', 'protectedAuthorityClosure',
  'inferenceContract', 'parserOrder', 'parserHandoff', 'adversarialMutations',
  'captureStability', 'repositoryBinding', 'planningRouting', 'testOwnerHandoff'
];
const POST_COMMIT_V12_INVENTORY_FIELDS = [
  'porcelainPathCount', 'porcelainEntries', 'inventorySha256', 'requiredPathCount',
  'dirtyRequiredPathCount', 'cleanRequiredPathCount', 'foreignDirtyPathCount',
  'excludedDirtyPathCount', 'matrixRecordCount', 'requiredTransitionCounts',
  'classificationBasis', 'completionInferenceFromInventory',
  'ownershipInferredFromDirtiness', 'ownershipInferredFromCommit',
  'ownershipInferredFromHistory'
];
const POST_COMMIT_V12_MATRIX_FIELDS = [
  'requiredRecordSharedContract', 'requiredRecordCommitments', 'foreignRecordCommitments',
  'excludedPaths', 'excludedRecords', 'matrixSha256', 'fullRecordsMustBeRecomputed',
  'ownershipTransfer', 'semanticApproval', 'semanticAcceptance', 'completionClaim',
  'checkboxClaim', 'scopeStatusClaim', 'topLevelStatusClaim', 'certificationClaim'
];
const POST_COMMIT_V12_CLOSURE_FIELDS = [
  'derivedDirectCleanAuthorityPaths', 'orderedEntries', 'closureSha256Input',
  'closureSha256', 'orderedEntryCount', 'additionalCleanDirectAuthorityOmitted',
  'omissionOrReorderAllowed', 'cleanCurrentValidation', 'parserCurrentValidation',
  'reportCurrentValidation', 'selectorCurrentValidation'
];
const POST_COMMIT_V12_CLEAN_ENTRY_FIELDS = [
  'kind', 'path', 'authorityRole', 'capturedHead', 'treeMode', 'treeType', 'blobOid',
  'contentSha256', 'byteLength', 'lastCommit'
];
const POST_COMMIT_V12_PARSER_ENTRY_FIELDS = [
  'kind', 'path', 'authorityRole', 'capturedHead', 'treeMode', 'treeType', 'blobOid',
  'capturedHeadContentSha256', 'capturedHeadByteLength', 'capturedHeadLastCommit',
  'liveStatus', 'rawWorktreeGitOid', 'rawContentSha256', 'rawByteLength',
  'normalizedPinFamily', 'normalizedPinNames', 'normalizedWorktreeGitOid',
  'normalizedContentSha256', 'normalizedByteLength', 'pathLastCommit'
];
const POST_COMMIT_V12_PREFIX_ENTRY_FIELDS = [
  'kind', 'path', 'authorityRole', 'capturedHead', 'treeMode', 'treeType', 'blobOid',
  'capturedHeadContentSha256', 'capturedHeadByteLength', 'capturedHeadLastCommit',
  'prefixStartByte', 'prefixEndByteExclusive', 'prefixContentSha256',
  'prefixByteLength', 'pathLastCommit'
];
const POST_COMMIT_V12_LEDGER_ENTRY_FIELDS = [
  'kind', 'path', 'authorityRole', 'toolLogPath', 'stableKeyFields', 'receiptFields',
  'stableKeyEncoding', 'scalarComparison', 'tagComparison', 'rowParsing',
  'duplicatePolicy', 'matchCardinality', 'partialSetPolicy', 'allMatchSource',
  'zeroOrAbsentMatchSource', 'selectedRowContradictionPolicy',
  'appendOnlyGrowthAllowed', 'ledgerContentPinned', 'historicalAbsoluteLineAuthority',
  'receiptSelectors', 'semanticSelectorSha256'
];
const POST_COMMIT_V12_LEDGER_HASH_FIELDS = POST_COMMIT_V12_LEDGER_ENTRY_FIELDS.slice(3, -1);
const POST_COMMIT_V12_V10_DISCRIMINATOR = {
  requiredHead: POST_COMMIT_V10_REQUIRED_HEAD,
  path: 'scripts/selftest.mjs',
  treeRef: `${POST_COMMIT_V10_REQUIRED_HEAD}:scripts/selftest.mjs`,
  treeMode: '100644',
  treeType: 'blob',
  blobOid: 'd6e1602527b5cf2c9cefcff362d4e93908ecc635',
  expectedIdentitySha256: '874df4c56efa470155e06d55a9e937e7ce117abe9ab725304c94cf09a8a2a4a5',
  liveByteSubstitutionAllowed: false
};
const POST_COMMIT_V12_PARSER_ORDER = [
  'validate every predecessor marker-inclusive pin, closed schema, field order, parent link, and immutable requiredHead value through v11',
  'validate historical clean records only through <predecessor.requiredHead>:<path> and retain predecessor-captured authority for historical dirty or untracked records',
  'require the exact v10 scripts/selftest.mjs discriminator at requiredHead 153a686c937017ae20a438f7a4a423cf76b019b3',
  'parse exactly one closed v12 block and treat capturedHead as provenance rather than a global live-equality gate',
  'validate the exact 67-entry dirty inventory and its 19-required, 55-foreign, and two-exclusion partition',
  'recompute all 74 complete full records and require every aligned record identity plus matrix SHA-256',
  'validate all 16 protected authority entries in order, including every derived direct clean input, reconstructed parser source, report prefix, and ledger selector',
  'validate current v12 authority independently after historical validation; historical success cannot satisfy current validation',
  'run all predecessor and v12 adversarial branches before returning any test result'
];

function parseNormalizedSelfPinsV8(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V8,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6|FOREIGN_SET_V7|POST_COMMIT_V9|POST_COMMIT_V10|POST_COMMIT_V11|POST_COMMIT_V12)[A-Z0-9_]*BLOCK_SHA256) = '([^']*)';$/gm,
    'normalized-self-pins/v8');
}

function normalizedSelfSourceIdentityV8(source) {
  parseNormalizedSelfPinsV7(source);
  parseNormalizedSelfPinsV8(source);
  const bytes = Buffer.from(normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V8), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: bytes
    }).trim(),
    worktreeSha256: sha256(bytes),
    byteLength: bytes.length
  };
}

function assertPostCommitV12PinValue(source) {
  const assignments = parseNormalizedSelfPinsV8(source);
  assert.equal(assignments.at(-1)[1], 'POST_COMMIT_V12_BLOCK_SHA256',
    'normalized-self-pins/v8 ends with the v12 pin');
  assert.equal(assignments.at(-1)[2], POST_COMMIT_V12_BLOCK_SHA256,
    'the v12 pin retains the exact marker-inclusive report hash');
}

function stripPostCommitV12MarkerBranch(source) {
  const startNeedle = `${POST_COMMIT_V12_HELPER_BEGIN}\n`;
  const endNeedle = `${POST_COMMIT_V12_HELPER_END}\n`;
  assert.equal(source.split(startNeedle).length - 1, 1, 'the v12 parser branch has exactly one start marker line');
  assert.equal(source.split(endNeedle).length - 1, 1, 'the v12 parser branch has exactly one end marker line');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'the v12 parser branch marker order is exact');
  const suffixStart = end + endNeedle.length;
  assert.equal(source[suffixStart], '\n', 'the v12 parser branch has exactly one additive trailing LF');
  return source.slice(0, start) + source.slice(suffixStart + 1);
}

function stripPostCommitV12Source(source) {
  let historical = stripPostCommitV12MarkerBranch(source);
  historical = removeExactSuccessorAddition(historical,
    `const POST_COMMIT_V12_BLOCK_SHA256 = '${POST_COMMIT_V12_BLOCK_SHA256}';\n`,
    'v12 pin addition');
  historical = removeExactSuccessorAddition(historical,
    "const NORMALIZED_SELF_PIN_NAMES_V8 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V7,\n  'POST_COMMIT_V12_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v8 declaration');
  return historical;
}

function assertGitRevision(value, label) {
  assert.match(value, /^[a-f0-9]{40}$/, `${label} is a full Git revision`);
}

function resolveGitRevision(revision, label) {
  const resolved = git(['rev-parse', `${revision}^{commit}`]).trim();
  assertGitRevision(resolved, label);
  return resolved;
}

function parseGitTreeEntry(raw, path, label) {
  const entries = raw.split('\0').filter(Boolean);
  assert.equal(entries.length, 1, `${label} resolves exactly one tree entry`);
  const match = entries[0].match(/^([0-7]{6}) ([a-z]+) ([a-f0-9]{40})\t([\s\S]+)$/);
  assert.ok(match, `${label} is a canonical Git tree entry`);
  const [, mode, type, blobOid, resolvedPath] = match;
  assert.equal(resolvedPath, path, `${label} resolves the exact path`);
  assert.equal(mode, '100644', `${label} retains regular-file mode`);
  assert.equal(type, 'blob', `${label} resolves a blob`);
  return { mode, type, blobOid, path: resolvedPath };
}

function gitTreeEntryAt(revision, path) {
  const resolvedRevision = resolveGitRevision(revision, `${revision} tree revision`);
  const raw = execFileSync('git', ['ls-tree', '-z', resolvedRevision, '--', path], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  return { resolvedRevision, ...parseGitTreeEntry(raw, path, `${resolvedRevision}:${path}`) };
}

function gitBlobBytesAt(revision, path) {
  const resolvedRevision = resolveGitRevision(revision, `${revision} blob revision`);
  const bytes = execFileSync('git', ['show', `${resolvedRevision}:${path}`], { cwd: ROOT });
  assert.ok(Buffer.isBuffer(bytes), `${resolvedRevision}:${path} resolves binary-safe bytes`);
  return bytes;
}

function pathLastCommitAt(revision, path) {
  const resolvedRevision = resolveGitRevision(revision, `${revision} path-history revision`);
  const commit = git(['log', '-1', '--format=%H', resolvedRevision, '--', path]).trim();
  assertGitRevision(commit, `${resolvedRevision}:${path} lastCommit`);
  return commit;
}

function historicalCleanFullRecord(summary, requiredHead, options = {}) {
  const expectedRequiredHead = options.expectedRequiredHead ?? requiredHead;
  assert.equal(requiredHead, expectedRequiredHead, `${summary.path} uses the exact predecessor requiredHead`);
  assertGitRevision(requiredHead, `${summary.path} historical requiredHead`);
  assert.equal(summary.pathKind, 'tracked', `${summary.path} historical clean record remains tracked`);
  assert.equal(summary.status, '', `${summary.path} is eligible for Git-tree reconstruction only when historically clean`);
  assert.equal(summary.transitionClass, 'clean-head-index-promotion',
    `${summary.path} historical clean record retains its transition class`);
  const tree = options.treeEntry ?? gitTreeEntryAt(requiredHead, summary.path);
  assert.equal(tree.resolvedRevision, requiredHead, `${summary.path} tree entry is revision-bound`);
  assert.equal(tree.path, summary.path, `${summary.path} tree entry is path-bound`);
  assert.equal(tree.mode, '100644', `${summary.path} historical tree mode is exact`);
  assert.equal(tree.type, 'blob', `${summary.path} historical tree type is exact`);
  assert.match(tree.blobOid, /^[a-f0-9]{40}$/, `${summary.path} historical blob OID is exact-width`);
  const bytes = options.bytes ?? gitBlobBytesAt(requiredHead, summary.path);
  const computedBlobOid = execFileSync('git', ['hash-object', '--stdin'], {
    cwd: ROOT,
    encoding: 'utf8',
    input: bytes
  }).trim();
  assert.equal(computedBlobOid, tree.blobOid, `${summary.path} historical bytes match the selected tree blob`);
  const historicalLastCommit = options.lastCommit ?? pathLastCommitAt(requiredHead, summary.path);
  assertGitRevision(historicalLastCommit, `${summary.path} historical path lastCommit`);
  const record = {
    path: summary.path,
    pathKind: 'tracked',
    classification: summary.classification,
    ownerAttribution: summary.ownerAttribution,
    feature004OwnershipClaim: summary.feature004OwnershipClaim,
    transitionClass: summary.transitionClass,
    status: '',
    staged: false,
    unstaged: false,
    headOid: tree.blobOid,
    indexOid: tree.blobOid,
    worktreeGitOid: tree.blobOid,
    worktreeSha256: sha256(bytes),
    byteLength: bytes.length,
    additions: 0,
    deletions: 0,
    hunkCount: 0,
    hunkBodySha256: [],
    lastCommit: historicalLastCommit
  };
  assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS,
    `${summary.path} revision-bound historical clean full record`);
  assert.equal(summary.hunkCount, 0, `${summary.path} historical clean summary has zero hunks`);
  assert.equal(summary.hunkSequenceSha256, sha256(JSON.stringify([])),
    `${summary.path} historical clean summary commits the empty hunk sequence`);
  assert.equal(summary.identitySha256, sha256(JSON.stringify(record)),
    `${summary.path} historical clean summary commits the revision-bound full record`);
  return record;
}

function postCommitV10CurrentRecordAsV12History(summary) {
  if (summary.path === COLLISION_PARSER_PATH) {
    const source = stripPostCommitV12Source(readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8'));
    return postCommitV10ParserRecord(summary, stripPostCommitV11Source(source));
  }
  if (summary.status === '') {
    return historicalCleanFullRecord(summary, POST_COMMIT_V10_REQUIRED_HEAD, {
      expectedRequiredHead: POST_COMMIT_V10_REQUIRED_HEAD
    });
  }
  return postCommitV10CurrentRecordAsV11HistoryBeforePostCommitV12(summary);
}

function postCommitV9ObservedIdentityFromV10SourceAsV12History() {
  const path = COLLISION_PARSER_PATH;
  const currentSource = readFileSync(resolve(ROOT, path), 'utf8');
  const preV10Source = stripPostCommitV10Source(stripPostCommitV11Source(
    stripPostCommitV12Source(currentSource)));
  const historicalSource = stripPostCommitV9Source(preV10Source);
  const historicalBytes = Buffer.from(historicalSource, 'utf8');
  const historicalHunks = parseDiffHunks(postCommitV10DiffFromHeadSource(path, historicalBytes))
    .filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(path);
  return {
    path,
    pathKind: 'tracked',
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(path),
    indexOid: indexOid(path),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: historicalBytes
    }).trim(),
    worktreeSha256: sha256(historicalBytes),
    byteLength: historicalBytes.length,
    additions: historicalHunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: historicalHunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: historicalHunks.length,
    hunkBodySha256: historicalHunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(path)
  };
}

let postCommitV12HistoricalV11CapturedRecordMap = new Map();

function postCommitV11CurrentRecordAsV12History(summary) {
  if (summary.path === COLLISION_PARSER_PATH) {
    return postCommitV11ParserRecord(summary,
      stripPostCommitV12Source(readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')));
  }
  if (summary.status === '') {
    return historicalCleanFullRecord(summary, POST_COMMIT_V11_REQUIRED_HEAD, {
      expectedRequiredHead: POST_COMMIT_V11_REQUIRED_HEAD
    });
  }
  const captured = postCommitV12HistoricalV11CapturedRecordMap.get(summary.path);
  if (captured) {
    assertExactOrderedKeys(captured, POST_COMMIT_V9_FULL_RECORD_FIELDS,
      `${summary.path} captured v11 historical full record`);
    assert.equal(summary.identitySha256, sha256(JSON.stringify(captured)),
      `${summary.path} captured v11 historical record retains its complete identity`);
    return structuredClone(captured);
  }
  return postCommitV11CurrentRecordBeforePostCommitV12(summary);
}

function assertPostCommitV10Discriminator(v10) {
  assert.deepEqual(v10.currentMatrix.requiredRecords[9].path, POST_COMMIT_V12_V10_DISCRIMINATOR.path,
    'the v10 discriminator retains requiredRecords[9] as scripts/selftest.mjs');
  const summary = v10.currentMatrix.requiredRecords[9];
  const tree = gitTreeEntryAt(POST_COMMIT_V10_REQUIRED_HEAD, summary.path);
  assert.deepEqual({
    requiredHead: POST_COMMIT_V10_REQUIRED_HEAD,
    path: summary.path,
    treeRef: `${POST_COMMIT_V10_REQUIRED_HEAD}:${summary.path}`,
    treeMode: tree.mode,
    treeType: tree.type,
    blobOid: tree.blobOid,
    expectedIdentitySha256: summary.identitySha256,
    liveByteSubstitutionAllowed: false
  }, POST_COMMIT_V12_V10_DISCRIMINATOR, 'the v10 historical clean discriminator is exact');
  const record = historicalCleanFullRecord(summary, POST_COMMIT_V10_REQUIRED_HEAD, {
    expectedRequiredHead: POST_COMMIT_V10_REQUIRED_HEAD
  });
  assert.equal(sha256(JSON.stringify(record)), POST_COMMIT_V12_V10_DISCRIMINATOR.expectedIdentitySha256,
    'the v10 discriminator reconstructs the immutable full-record identity');
  return record;
}

function validatePostCommitV11AsV12History(v11, v10, v9, v7, v6, v5, v4, durable) {
  postCommitV12HistoricalV11CapturedRecordMap = new Map(
    v11.currentMatrix.additiveForeignFullRecords
      .map((record) => [record.path, structuredClone(record)]));
  validatePostCommitV10AsV11History(v10, v9, v7, v6, v5, v4, durable);
  return withPostCommitV10HistoricalHead(() => {
    validatePostCommitV11(v11, v10, v9, v7, v6, v5, v4, durable, v11, false);
    const requiredRecords = v11.currentMatrix.requiredRecords.map(postCommitV11CurrentRecordAsV12History);
    const foreignRecords = v11.currentMatrix.foreignRecords.map(postCommitV11CurrentRecordAsV12History);
    assertPostCommitV11RecordCommitments(v11, requiredRecords, foreignRecords,
      POST_COMMIT_V11_EXCLUDED_PATHS, false);
    const parserRecord = requiredRecords.find(({ path }) => path === COLLISION_PARSER_PATH);
    const parserCapture = v11.identityContract.parserSelfCapture;
    assert.deepEqual(Object.fromEntries(POST_COMMIT_V9_FULL_RECORD_FIELDS
      .map((field) => [field, parserCapture[field]])), parserRecord,
    'historical v11 parser self-capture remains the exact normalized pre-v11 record');
    assert.equal(parserCapture.identitySha256, sha256(JSON.stringify(parserRecord)),
      'historical v11 parser full-record identity remains exact');
    return { requiredRecords, foreignRecords };
  });
}

function runPostCommitV11AdversarialCasesAsV12History() {
  const activeCurrentRecord = postCommitV11CurrentRecord;
  postCommitV11CurrentRecord = postCommitV11CurrentRecordAsV12History;
  try {
    withPostCommitV10HistoricalHead(() => runPostCommitV11AdversarialCases());
  } finally {
    postCommitV11CurrentRecord = activeCurrentRecord;
  }
}

function postCommitV12ParserRecord(metadata, source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  const preV12Source = stripPostCommitV12Source(source);
  parseNormalizedSelfPinsV7(preV12Source);
  const normalizedBytes = Buffer.from(
    normalizeSelfPinValuesForNames(preV12Source, NORMALIZED_SELF_PIN_NAMES_V7), 'utf8');
  const hunks = parseDiffHunks(postCommitV10DiffFromHeadSource(
    COLLISION_PARSER_PATH, normalizedBytes)).filter(({ changedLines }) => changedLines.length > 0);
  const status = shortStatus(COLLISION_PARSER_PATH);
  return {
    path: COLLISION_PARSER_PATH,
    pathKind: 'tracked',
    classification: metadata.classification,
    ownerAttribution: metadata.ownerAttribution,
    feature004OwnershipClaim: metadata.feature004OwnershipClaim,
    transitionClass: metadata.transitionClass,
    status,
    staged: status !== '' && status[0] !== ' ',
    unstaged: status !== '' && status[1] !== ' ',
    headOid: headOid(COLLISION_PARSER_PATH),
    indexOid: indexOid(COLLISION_PARSER_PATH),
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: normalizedBytes
    }).trim(),
    worktreeSha256: sha256(normalizedBytes),
    byteLength: normalizedBytes.length,
    additions: hunks.reduce((total, hunk) => total + hunk.additionCount, 0),
    deletions: hunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
    hunkCount: hunks.length,
    hunkBodySha256: hunks.map(({ hunkBodySha256 }) => hunkBodySha256),
    lastCommit: lastCommit(COLLISION_PARSER_PATH)
  };
}

function postCommitV12FullRecord(path, classification, ownerAttribution, feature004OwnershipClaim) {
  const status = shortStatus(path);
  const transitionClass = status === '' ? 'clean-head-index-promotion'
    : status === '??' ? 'untracked-exact-identity' : 'still-dirty-exact-identity';
  const metadata = { path, classification, ownerAttribution, feature004OwnershipClaim, transitionClass };
  if (path === COLLISION_PARSER_PATH) return postCommitV12ParserRecord(metadata);
  return postCommitV10CurrentRecord(metadata);
}

function postCommitV12InventoryEntries() {
  return git(['status', '--porcelain=v1', '-z', '--untracked-files=all'])
    .split('\0')
    .filter(Boolean)
    .map((entry) => ({ status: entry.slice(0, 2), path: entry.slice(3) }));
}

function postCommitV12CurrentRecords(v12) {
  const required = v12.currentMatrix.requiredRecordSharedContract;
  const requiredRecords = v12.currentMatrix.requiredRecordCommitments.map(({ path }) =>
    postCommitV12FullRecord(path, required.classification, required.ownerAttribution,
      required.feature004OwnershipClaim));
  const foreignRecords = v12.currentMatrix.foreignRecordCommitments.map((commitment) =>
    postCommitV12FullRecord(commitment.path, commitment.classification,
      commitment.ownerAttribution, false));
  return { requiredRecords, foreignRecords };
}

function assertPostCommitV12RecordCommitments(v12, requiredRecords, foreignRecords,
  inventoryEntries = postCommitV12InventoryEntries()) {
  const matrix = v12.currentMatrix;
  const inventory = v12.inventoryProof;
  inventoryEntries.forEach((entry, index) => assertExactOrderedKeys(entry,
    ['status', 'path'], `v12 inventory entry ${index}`));
  matrix.excludedRecords.forEach((entry, index) => assertExactOrderedKeys(entry, [
    'path', 'status', 'classification', 'ownerAttribution',
    'matrixEligible', 'completionInferenceEligible'
  ], `v12 excluded record ${index}`));
  assert.deepEqual(requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'v12 retains all 19 required full records in exact order');
  assert.deepEqual(requiredRecords.map(({ path }) => path),
    matrix.requiredRecordCommitments.map(({ path }) => path),
  'v12 required commitments align one-for-one with complete records');
  assert.deepEqual(foreignRecords.map(({ path }) => path),
    matrix.foreignRecordCommitments.map(({ path }) => path),
  'v12 foreign commitments align one-for-one with complete records');
  assert.equal(foreignRecords.length, 55, 'v12 contains exactly 55 foreign full records');
  assert.equal(new Set([...requiredRecords, ...foreignRecords].map(({ path }) => path)).size, 74,
    'v12 contains exactly 74 unique non-excluded full records');
  requiredRecords.forEach((record, index) => {
    assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS,
      `post-commit v12 requiredRecords[${index}] full record`);
    assert.equal(record.classification, matrix.requiredRecordSharedContract.classification,
      `post-commit v12 requiredRecords[${index}] classification is exact`);
    assert.equal(record.ownerAttribution, matrix.requiredRecordSharedContract.ownerAttribution,
      `post-commit v12 requiredRecords[${index}] owner is exact`);
    assert.equal(record.feature004OwnershipClaim, true,
      `post-commit v12 requiredRecords[${index}] ownership claim is exact`);
    assert.equal(sha256(JSON.stringify(record)), matrix.requiredRecordCommitments[index].identitySha256,
      `post-commit v12 requiredRecords[${index}] commits the complete ordered full record`);
  });
  foreignRecords.forEach((record, index) => {
    const commitment = matrix.foreignRecordCommitments[index];
    assertExactOrderedKeys(record, POST_COMMIT_V9_FULL_RECORD_FIELDS,
      `post-commit v12 foreignRecords[${index}] full record`);
    assert.equal(record.classification, commitment.classification,
      `post-commit v12 foreignRecords[${index}] classification is exact`);
    assert.equal(record.ownerAttribution, commitment.ownerAttribution,
      `post-commit v12 foreignRecords[${index}] owner is exact`);
    assert.equal(record.feature004OwnershipClaim, false,
      `post-commit v12 foreignRecords[${index}] grants no Feature 004 ownership`);
    assert.equal(sha256(JSON.stringify(record)), commitment.identitySha256,
      `post-commit v12 foreignRecords[${index}] commits the complete ordered full record`);
  });
  assert.equal(sha256(JSON.stringify({
    requiredRecords,
    foreignRecords,
    excludedPaths: matrix.excludedPaths
  })), POST_COMMIT_V12_MATRIX_SHA256, 'v12 complete uncompressed matrix hash is exact');
  assert.equal(matrix.matrixSha256, POST_COMMIT_V12_MATRIX_SHA256,
    'v12 declared matrix hash is exact');
  assert.deepEqual(inventoryEntries, inventory.porcelainEntries,
    'v12 NUL-safe status inventory is exact and ordered');
  assert.equal(sha256(JSON.stringify(inventoryEntries)), POST_COMMIT_V12_INVENTORY_SHA256,
    'v12 status inventory hash is exact');
  assert.equal(inventory.inventorySha256, POST_COMMIT_V12_INVENTORY_SHA256,
    'v12 declared inventory hash is exact');
  assert.equal(inventoryEntries.length, 67, 'v12 inventory has exactly 67 entries');
  assert.deepEqual(matrix.excludedPaths, [REPORT_PATH, V7_LOCK_FILE_EXCLUSION],
    'v12 retains exactly two ordered exclusions');
  assert.deepEqual(matrix.excludedRecords.map(({ path, status }) => ({ path, status })), [
    { path: REPORT_PATH, status: ' M' },
    { path: V7_LOCK_FILE_EXCLUSION, status: '??' }
  ], 'v12 exclusions retain exact path and status');
  assert.equal(matrix.excludedRecords.every(({ matrixEligible, completionInferenceEligible }) =>
    matrixEligible === false && completionInferenceEligible === false), true,
  'v12 exclusions remain ineligible for matrix and completion inference');
  const nonExcludedInventory = inventoryEntries
    .filter(({ path }) => !matrix.excludedPaths.includes(path))
    .map(({ path }) => path);
  const dirtyMatrixPaths = [...requiredRecords, ...foreignRecords]
    .filter(({ status }) => status !== '')
    .map(({ path }) => path);
  assert.deepEqual([...nonExcludedInventory].sort(), [...dirtyMatrixPaths].sort(),
    'v12 matrix contains every and only current dirty non-excluded path');
  assert.equal(requiredRecords.filter(({ status }) => status === '').length, 9,
    'v12 has exactly nine clean required paths');
  assert.equal(requiredRecords.filter(({ status }) => status === ' M').length, 5,
    'v12 has exactly five dirty tracked required paths');
  assert.equal(requiredRecords.filter(({ status }) => status === '??').length, 5,
    'v12 has exactly five untracked required paths');
  assert.equal(foreignRecords.every(({ status }) => status !== ''), true,
    'v12 foreign matrix contains only current dirty records');
  return { requiredRecords, foreignRecords, inventoryEntries };
}

function currentHeadPathAuthority(path) {
  const tree = gitTreeEntryAt('HEAD', path);
  const bytes = gitBlobBytesAt(tree.resolvedRevision, path);
  const computedBlobOid = execFileSync('git', ['hash-object', '--stdin'], {
    cwd: ROOT,
    encoding: 'utf8',
    input: bytes
  }).trim();
  assert.equal(computedBlobOid, tree.blobOid, `${path} current HEAD bytes match the tree blob`);
  return {
    treeMode: tree.mode,
    treeType: tree.type,
    blobOid: tree.blobOid,
    contentSha256: sha256(bytes),
    byteLength: bytes.length,
    lastCommit: pathLastCommitAt(tree.resolvedRevision, path),
    status: shortStatus(path)
  };
}

function capturePostCommitV12AuthorityObservations(v12, parserSource = readFileSync(
  resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  const entries = v12.protectedAuthorityClosure.orderedEntries.map((entry) => {
    if (entry.kind === 'clean-git-tree') return currentHeadPathAuthority(entry.path);
    if (entry.kind === 'path-scoped-live-parser-source') {
      const head = currentHeadPathAuthority(entry.path);
      const historicalSource = stripPostCommitV12Source(parserSource);
      const rawBytes = Buffer.from(historicalSource, 'utf8');
      const normalizedBytes = Buffer.from(
        normalizeSelfPinValuesForNames(historicalSource, NORMALIZED_SELF_PIN_NAMES_V7), 'utf8');
      parseNormalizedSelfPinsV7(historicalSource);
      return {
        ...head,
        rawWorktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
          cwd: ROOT,
          encoding: 'utf8',
          input: rawBytes
        }).trim(),
        rawContentSha256: sha256(rawBytes),
        rawByteLength: rawBytes.length,
        normalizedWorktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
          cwd: ROOT,
          encoding: 'utf8',
          input: normalizedBytes
        }).trim(),
        normalizedContentSha256: sha256(normalizedBytes),
        normalizedByteLength: normalizedBytes.length
      };
    }
    if (entry.kind === 'append-prefix') {
      const head = currentHeadPathAuthority(entry.path);
      const reportBytes = readFileSync(resolve(ROOT, entry.path));
      const prefix = reportBytes.subarray(entry.prefixStartByte, entry.prefixEndByteExclusive);
      return {
        ...head,
        prefixContentSha256: sha256(prefix),
        prefixByteLength: prefix.length
      };
    }
    assert.equal(entry.kind, 'append-only-ledger-selector', 'v12 closure has only declared entry kinds');
    return { selectorValidated: true };
  });
  return {
    globalHead: git(['rev-parse', 'HEAD']).trim(),
    entries
  };
}

function validatePostCommitV12LedgerSelector(entry, durable, options = {}) {
  assertExactOrderedKeys(entry, POST_COMMIT_V12_LEDGER_ENTRY_FIELDS,
    'v12 append-only ledger selector entry');
  assert.equal(entry.toolLogPath, TOOL_LOG_PATH, 'v12 ledger path is exact');
  assert.deepEqual(entry.stableKeyFields, DURABLE_STABLE_KEY_FIELDS,
    'v12 stable-key field order is exact');
  assert.deepEqual(entry.receiptFields, DURABLE_RECEIPT_FIELDS,
    'v12 receipt field order is exact');
  assert.equal(entry.receiptSelectors.length, 2, 'v12 declares exactly two receipt selectors');
  const projectedReceipts = durable.receipts.map((receipt) =>
    Object.fromEntries(DURABLE_STABLE_KEY_FIELDS.map((field) => [field, receipt[field]])));
  assert.deepEqual(entry.receiptSelectors, projectedReceipts,
    'v12 selectors are the exact stable-key projections of both durable receipts');
  const semanticContract = Object.fromEntries(POST_COMMIT_V12_LEDGER_HASH_FIELDS
    .map((field) => [field, entry[field]]));
  assert.equal(sha256(JSON.stringify(semanticContract)), entry.semanticSelectorSha256,
    'v12 semantic selector hash commits every selector semantic field in order');
  assert.equal(entry.semanticSelectorSha256,
    '1ff127e5c3ed62153a94b06ffd78b071821ed6c21dcbc2bd344d3b3c148f7d7d',
  'v12 semantic selector hash is exact');
  assert.equal(entry.appendOnlyGrowthAllowed, true, 'v12 permits unrelated append-only ledger growth');
  assert.equal(entry.ledgerContentPinned, false, 'v12 does not pin the whole ledger');
  assert.equal(entry.historicalAbsoluteLineAuthority, false,
    'v12 selectors do not depend on historical absolute line numbers');
  return resolveDurableEvidence(durable, options);
}

function validatePostCommitV12ProtectedClosure(closure, durable, observations) {
  assertExactOrderedKeys(closure, POST_COMMIT_V12_CLOSURE_FIELDS, 'v12 protected authority closure');
  assert.equal(closure.closureSha256Input, 'JSON.stringify(orderedEntries)',
    'v12 closure hash input is exact');
  assert.equal(closure.orderedEntries.length, 16, 'v12 closure contains exactly 16 ordered entries');
  assert.equal(closure.orderedEntryCount, 16, 'v12 declared closure count is exact');
  assert.equal(new Set(closure.orderedEntries.map(({ path }) => path)).size, 16,
    'v12 closure contains no duplicate path');
  assert.deepEqual(closure.derivedDirectCleanAuthorityPaths,
    closure.orderedEntries.slice(0, 13).map(({ path }) => path),
  'v12 direct clean authority paths align with the first 13 closure entries');
  assert.equal(sha256(JSON.stringify(closure.orderedEntries)), POST_COMMIT_V12_CLOSURE_SHA256,
    'v12 ordered closure hash is exact');
  assert.equal(closure.closureSha256, POST_COMMIT_V12_CLOSURE_SHA256,
    'v12 declared closure hash is exact');
  assert.equal(closure.additionalCleanDirectAuthorityOmitted, false,
    'v12 closure omits no additional clean direct authority');
  assert.equal(closure.omissionOrReorderAllowed, false,
    'v12 closure omission or reorder is forbidden');
  assert.equal(closure.cleanCurrentValidation,
    'compare each protected path at current HEAD by mode, type, blob, content SHA-256, byte length, and path lastCommit without comparing global HEAD');
  assert.equal(closure.parserCurrentValidation,
    'strip only the v12 pin, NORMALIZED_SELF_PIN_NAMES_V8 declaration, and closed v12 branch; then compare raw pre-v12 source and normalized-self-pins/v7 identity');
  assert.equal(closure.reportCurrentValidation,
    'hash bytes [0,520131) and require the exact prefix length and SHA-256');
  assert.equal(closure.selectorCurrentValidation,
    'require the exact stable-key order, receipt-field order, two receipt selectors, and semantic selector SHA-256');
  assert.equal(observations.entries.length, closure.orderedEntries.length,
    'v12 observations align one-for-one with the closure');
  closure.orderedEntries.forEach((entry, index) => {
    const observed = observations.entries[index];
    if (entry.kind === 'clean-git-tree') {
      assertExactOrderedKeys(entry, POST_COMMIT_V12_CLEAN_ENTRY_FIELDS,
        `v12 closure clean entry ${index}`);
      assert.equal(observed.status, '', `${entry.path} remains clean in the current worktree`);
      assert.deepEqual({
        treeMode: observed.treeMode,
        treeType: observed.treeType,
        blobOid: observed.blobOid,
        contentSha256: observed.contentSha256,
        byteLength: observed.byteLength,
        lastCommit: observed.lastCommit
      }, {
        treeMode: entry.treeMode,
        treeType: entry.treeType,
        blobOid: entry.blobOid,
        contentSha256: entry.contentSha256,
        byteLength: entry.byteLength,
        lastCommit: entry.lastCommit
      }, `${entry.path} current HEAD path authority is exact without a global HEAD comparison`);
      return;
    }
    if (entry.kind === 'path-scoped-live-parser-source') {
      assertExactOrderedKeys(entry, POST_COMMIT_V12_PARSER_ENTRY_FIELDS,
        'v12 parser authority entry');
      assert.deepEqual({
        treeMode: observed.treeMode,
        treeType: observed.treeType,
        blobOid: observed.blobOid,
        contentSha256: observed.contentSha256,
        byteLength: observed.byteLength,
        lastCommit: observed.lastCommit
      }, {
        treeMode: entry.treeMode,
        treeType: entry.treeType,
        blobOid: entry.blobOid,
        contentSha256: entry.capturedHeadContentSha256,
        byteLength: entry.capturedHeadByteLength,
        lastCommit: entry.capturedHeadLastCommit
      }, 'v12 parser current HEAD path authority is exact');
      assert.equal(observed.status, entry.liveStatus, 'v12 parser retains its exact live status');
      assert.deepEqual({
        rawWorktreeGitOid: observed.rawWorktreeGitOid,
        rawContentSha256: observed.rawContentSha256,
        rawByteLength: observed.rawByteLength,
        normalizedWorktreeGitOid: observed.normalizedWorktreeGitOid,
        normalizedContentSha256: observed.normalizedContentSha256,
        normalizedByteLength: observed.normalizedByteLength,
        pathLastCommit: observed.lastCommit
      }, {
        rawWorktreeGitOid: entry.rawWorktreeGitOid,
        rawContentSha256: entry.rawContentSha256,
        rawByteLength: entry.rawByteLength,
        normalizedWorktreeGitOid: entry.normalizedWorktreeGitOid,
        normalizedContentSha256: entry.normalizedContentSha256,
        normalizedByteLength: entry.normalizedByteLength,
        pathLastCommit: entry.pathLastCommit
      }, 'v12 parser strips only its additive boundary and retains the exact pre-v12 identities');
      assert.equal(entry.normalizedPinFamily, 'normalized-self-pins/v7-pre-v12');
      assert.deepEqual(entry.normalizedPinNames, NORMALIZED_SELF_PIN_NAMES_V7);
      return;
    }
    if (entry.kind === 'append-prefix') {
      assertExactOrderedKeys(entry, POST_COMMIT_V12_PREFIX_ENTRY_FIELDS,
        'v12 report prefix authority entry');
      assert.deepEqual({
        treeMode: observed.treeMode,
        treeType: observed.treeType,
        blobOid: observed.blobOid,
        contentSha256: observed.contentSha256,
        byteLength: observed.byteLength,
        lastCommit: observed.lastCommit
      }, {
        treeMode: entry.treeMode,
        treeType: entry.treeType,
        blobOid: entry.blobOid,
        contentSha256: entry.capturedHeadContentSha256,
        byteLength: entry.capturedHeadByteLength,
        lastCommit: entry.capturedHeadLastCommit
      }, 'v12 report current HEAD path authority is exact');
      assert.equal(observed.status, ' M', 'v12 report remains the exact dirty append exclusion');
      assert.equal(entry.prefixStartByte, 0, 'v12 report prefix begins at byte zero');
      assert.equal(entry.prefixEndByteExclusive, POST_COMMIT_V12_REPORT_PREFIX_BYTE_LENGTH,
        'v12 report prefix end is exact');
      assert.equal(observed.prefixByteLength, POST_COMMIT_V12_REPORT_PREFIX_BYTE_LENGTH,
        'v12 report prefix byte length is exact');
      assert.equal(observed.prefixContentSha256, POST_COMMIT_V12_REPORT_PREFIX_SHA256,
        'v12 report prefix content hash is exact');
      return;
    }
    assert.equal(entry.kind, 'append-only-ledger-selector', 'v12 closure final entry is the ledger selector');
    validatePostCommitV12LedgerSelector(entry, durable);
  });
  return observations;
}

function validatePostCommitV12(v12, v11, v10, v9, v7, v6, v5, v4, durable,
  canonical = v12, verifyCurrent = true, observations = null) {
  assertExactCanonicalContract(v12, canonical, 'post-commit v12 block');
  assertExactOrderedKeys(v12, POST_COMMIT_V12_TOP_LEVEL_FIELDS, 'post-commit v12 block');
  assert.equal(v12.contractVersion, 'feature004-dirty-collision-post-commit/v12');
  assert.deepEqual(v12.findingIds, [
    'F004-V12-PLAN-001',
    'F004-COLLISION-HISTORICAL-CLEAN-RECORD-LIVE-BYTE-DRIFT'
  ]);
  assert.equal(v12.successorRevision, 'v12');
  assertUtcTimestamp(v12.capturedAt, 'post-commit v12 capturedAt');
  assertGitRevision(v12.capturedHead, 'post-commit v12 capturedHead provenance');
  assert.deepEqual(v12.headPolicy, {
    capturedHeadRole: 'provenance-only',
    liveHeadEqualityRequired: false,
    unrelatedHeadMovementPolicy: 'accepted-only-when-protected-closure-and-dirty-inventory-remain-exact',
    protectedPathContentModeOrLastCommitDriftAllowed: false,
    protectedTouchRevertAllowed: false
  }, 'v12 captured HEAD is provenance only');
  assert.deepEqual(v12.successorOf, {
    marker: POST_COMMIT_V11_MARKER,
    rawBlockSha256: POST_COMMIT_V11_BLOCK_SHA256,
    markerInclusiveByteLength: 49810,
    contractVersion: 'feature004-dirty-collision-post-commit/v11',
    requiredHead: POST_COMMIT_V11_REQUIRED_HEAD,
    relation: 'additive-path-scoped-authority-closure-successor',
    predecessorDisposition: 'mandatory-immutable-history',
    successorRequiredReasons: [
      'global-head-equality-confuses-provenance-with-live-authority',
      'historical-clean-record-validation-must-not-substitute-live-worktree-bytes',
      'current-dirty-inventory-expanded-after-v11'
    ]
  }, 'v12 successor link is exact');
  assert.deepEqual(v12.extendsContracts, [
    { marker: POST_COMMIT_V11_MARKER, rawBlockSha256: POST_COMMIT_V11_BLOCK_SHA256 },
    { marker: POST_COMMIT_V10_MARKER, rawBlockSha256: POST_COMMIT_V10_BLOCK_SHA256 },
    { marker: POST_COMMIT_V9_MARKER, rawBlockSha256: POST_COMMIT_V9_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-set-v7', rawBlockSha256: FOREIGN_SET_V7_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-foreign-roadmap-v6', rawBlockSha256: FOREIGN_ROADMAP_V6_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v5', rawBlockSha256: CURRENT_IDENTITY_V5_BLOCK_SHA256 },
    { marker: 'feature004-dirty-collision-current-identity-v4', rawBlockSha256: CURRENT_IDENTITY_V4_BLOCK_SHA256 },
    { marker: 'feature004-scope1-durable-evidence-v1', rawBlockSha256: DURABLE_EVIDENCE_BLOCK_SHA256 }
  ], 'v12 predecessor pins are exact and ordered');
  assert.deepEqual(v12.historicalValidation.v10Discriminator, POST_COMMIT_V12_V10_DISCRIMINATOR,
    'v12 historical discriminator contract is exact');
  assert.equal(v12.historicalValidation.predecessorRequiredHeadsComparedToLiveHead, false);
  assert.equal(v12.historicalValidation.historicalValidationSatisfiesV12CurrentValidation, false);
  assert.equal(v12.historicalValidation.predecessorAssertionDeletionOrWeakeningAllowed, false);
  assert.deepEqual(v12.identityContract.fullRecordOrderedFields, POST_COMMIT_V9_FULL_RECORD_FIELDS);
  assert.deepEqual(v12.identityContract.parserSelfCapture.retainedPinNames, NORMALIZED_SELF_PIN_NAMES_V7);
  assert.equal(v12.identityContract.inventorySha256, POST_COMMIT_V12_INVENTORY_SHA256);
  assert.equal(v12.identityContract.matrixSha256, POST_COMMIT_V12_MATRIX_SHA256);
  assertExactOrderedKeys(v12.inventoryProof, POST_COMMIT_V12_INVENTORY_FIELDS,
    'post-commit v12 inventory proof');
  v12.inventoryProof.porcelainEntries.forEach((entry, index) =>
    assertExactOrderedKeys(entry, ['status', 'path'], `post-commit v12 porcelainEntries[${index}]`));
  assert.deepEqual({
    porcelainPathCount: v12.inventoryProof.porcelainPathCount,
    requiredPathCount: v12.inventoryProof.requiredPathCount,
    dirtyRequiredPathCount: v12.inventoryProof.dirtyRequiredPathCount,
    cleanRequiredPathCount: v12.inventoryProof.cleanRequiredPathCount,
    foreignDirtyPathCount: v12.inventoryProof.foreignDirtyPathCount,
    excludedDirtyPathCount: v12.inventoryProof.excludedDirtyPathCount,
    matrixRecordCount: v12.inventoryProof.matrixRecordCount
  }, {
    porcelainPathCount: 67,
    requiredPathCount: 19,
    dirtyRequiredPathCount: 10,
    cleanRequiredPathCount: 9,
    foreignDirtyPathCount: 55,
    excludedDirtyPathCount: 2,
    matrixRecordCount: 74
  }, 'v12 inventory counts are exact');
  assertExactOrderedKeys(v12.currentMatrix, POST_COMMIT_V12_MATRIX_FIELDS,
    'post-commit v12 current matrix');
  assertExactOrderedKeys(v12.currentMatrix.requiredRecordSharedContract,
    ['classification', 'ownerAttribution', 'feature004OwnershipClaim'],
    'post-commit v12 required-record shared contract');
  assert.deepEqual(v12.currentMatrix.requiredRecordSharedContract, {
    classification: 'feature004-scope1-required',
    ownerAttribution: 'Feature 004 Scope 1',
    feature004OwnershipClaim: true
  });
  v12.currentMatrix.requiredRecordCommitments.forEach((commitment, index) => {
    assertExactOrderedKeys(commitment, ['path', 'identitySha256'],
      `v12 required commitment ${index}`);
    assertSha256(commitment.identitySha256, `v12 required commitment ${index}`);
  });
  v12.currentMatrix.foreignRecordCommitments.forEach((commitment, index) => {
    assertExactOrderedKeys(commitment,
      ['path', 'classification', 'ownerAttribution', 'identitySha256'],
      `v12 foreign commitment ${index}`);
    assertSha256(commitment.identitySha256, `v12 foreign commitment ${index}`);
  });
  v12.currentMatrix.excludedRecords.forEach((entry, index) =>
    assertExactOrderedKeys(entry, [
      'path', 'status', 'classification', 'ownerAttribution',
      'matrixEligible', 'completionInferenceEligible'
    ], `post-commit v12 excludedRecords[${index}]`));
  assert.equal(v12.currentMatrix.fullRecordsMustBeRecomputed, true);
  for (const field of [
    'ownershipTransfer', 'semanticApproval', 'semanticAcceptance', 'completionClaim',
    'checkboxClaim', 'scopeStatusClaim', 'topLevelStatusClaim', 'certificationClaim'
  ]) assert.equal(v12.currentMatrix[field], false, `v12 current matrix ${field} remains false`);
  assert.ok(Object.values(v12.inferenceContract).every((value) => value === false),
    'v12 inference contract contains only false values');
  assert.deepEqual(v12.parserOrder, POST_COMMIT_V12_PARSER_ORDER);
  assert.equal(v12.parserHandoff.owner, 'bubbles.test');
  assert.equal(v12.parserHandoff.path, COLLISION_PARSER_PATH);
  assert.equal(v12.parserHandoff.newPinLiteral, 'POST_COMMIT_V12_BLOCK_SHA256');
  assert.equal(v12.parserHandoff.normalizedPinFamilyName, 'NORMALIZED_SELF_PIN_NAMES_V8');
  assert.deepEqual(v12.parserHandoff.normalizedPinFamilyOrder, NORMALIZED_SELF_PIN_NAMES_V8);
  assert.equal(v12.parserHandoff.currentSelector, 'feature004-dirty-collision-post-commit-v12-only');
  assert.equal(v12.parserHandoff.existingV10V11AndPredecessorBytesEditable, false);
  assert.equal(v12.captureStability.preAppendInventorySha256, POST_COMMIT_V12_INVENTORY_SHA256);
  assert.equal(v12.captureStability.preAppendMatrixSha256, POST_COMMIT_V12_MATRIX_SHA256);
  assert.equal(v12.captureStability.preAppendClosureSha256, POST_COMMIT_V12_CLOSURE_SHA256);
  assert.equal(v12.captureStability.preAppendReportPrefixSha256, POST_COMMIT_V12_REPORT_PREFIX_SHA256);
  assert.equal(v12.captureStability.globalHeadMustRemainExact, false);
  assert.equal(v12.captureStability.unrelatedHeadMovementOutsideProtectedClosureAllowed, true);
  assert.deepEqual(v12.repositoryBinding, {
    repositoryRoot: '/home/redacted/research-lab',
    repositoryAlias: 'research-lab',
    repositoryResolution: {
      sessionId: 'vscode-e24db39cf992f7ccd8ec75209602db59',
      decisionId: 'rb:vscode-e24db39cf992f7ccd8ec75209602db59:46',
      controlRevision: 46,
      controlPathDigest: 'sha256:e6d858a6f9bc1824d3a2cea3746d741a5bad41016d613dc242312185af9761fa',
      authority: 'concrete-target',
      transition: 'confirmed',
      scopeKind: 'command',
      scopeId: null,
      targetKind: 'absolute-target',
      pathVisibility: 'local',
      actionable: true
    }
  }, 'v12 repository binding packet is exact');
  assert.equal(v12.planningRouting.scopeStatusChanged, false);
  assert.equal(v12.planningRouting.checkboxChanged, false);
  assert.equal(v12.planningRouting.featureStatusChanged, false);
  assert.equal(v12.planningRouting.certificationChanged, false);
  assert.equal(v12.planningRouting.scopeOneStatus, 'In Progress');
  assert.equal(v12.planningRouting.scopeTwoState, 'unavailable');
  assert.equal(v12.testOwnerHandoff.owner, 'bubbles.test');
  assert.equal(v12.testOwnerHandoff.onlyAllowedEditedPath, COLLISION_PARSER_PATH);
  assert.equal(v11.contractVersion, 'feature004-dirty-collision-post-commit/v11');
  assert.equal(v10.contractVersion, 'feature004-dirty-collision-post-commit/v10');
  assert.equal(v9.contractVersion, 'feature004-dirty-collision-post-commit/v9');
  assert.equal(v7.contractVersion, 'feature004-dirty-collision-foreign-set/v7');
  assert.equal(v6.contractVersion, 'feature004-dirty-collision-foreign-roadmap/v6');
  assert.equal(v5.contractVersion, 'feature004-dirty-collision-current-identity/v5');
  assert.equal(v4.contractVersion, 'feature004-dirty-collision-current-identity/v4');
  assert.equal(durable.contractVersion, 'feature004-durable-evidence-admission/v1');
  if (!verifyCurrent) return null;
  const current = postCommitV12CurrentRecords(v12);
  const matrix = assertPostCommitV12RecordCommitments(v12,
    current.requiredRecords, current.foreignRecords);
  const currentObservations = observations ?? capturePostCommitV12AuthorityObservations(v12);
  validatePostCommitV12ProtectedClosure(v12.protectedAuthorityClosure, durable, currentObservations);
  return { ...matrix, observations: currentObservations };
}

function runPostCommitV12AdversarialCases() {
  runPostCommitV11AdversarialCasesAsV12History();
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  const v11Block = parseReportBlock(report, POST_COMMIT_V11_MARKER);
  const v12Block = parseReportBlock(report, POST_COMMIT_V12_MARKER);
  assert.throws(() => parseReportBlock(`${report}\n${v12Block.raw}`, POST_COMMIT_V12_MARKER),
    'duplicate v12 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v12Block.raw, ''), POST_COMMIT_V12_MARKER),
    'missing v12 report block fails closed');
  assert.throws(() => parseReportBlock(report.replace(v12Block.raw,
    v12Block.raw.replace('```json\n{', '```json\n{ malformed')), POST_COMMIT_V12_MARKER),
  'malformed v12 report block fails closed');
  assert.throws(() => assertPinnedReportBlock(`${v12Block.raw} `, POST_COMMIT_V12_BLOCK_SHA256,
    'mutated v12 block'), 'v12 marker-inclusive byte drift fails closed');

  const historicalSelftest = v10Block.value.currentMatrix.requiredRecords[9];
  assertPostCommitV10Discriminator(v10Block.value);
  assert.throws(() => historicalCleanFullRecord(historicalSelftest, '0'.repeat(40), {
    expectedRequiredHead: POST_COMMIT_V10_REQUIRED_HEAD
  }), 'wrong historical revision fails closed');
  assert.throws(() => historicalCleanFullRecord({ ...historicalSelftest, path: 'scripts/missing-selftest.mjs' },
    POST_COMMIT_V10_REQUIRED_HEAD), 'wrong historical path fails closed');
  const historicalTree = gitTreeEntryAt(POST_COMMIT_V10_REQUIRED_HEAD, historicalSelftest.path);
  assert.throws(() => historicalCleanFullRecord(historicalSelftest, POST_COMMIT_V10_REQUIRED_HEAD, {
    treeEntry: { ...historicalTree, mode: '100755' }
  }), 'wrong historical tree mode fails closed');
  assert.throws(() => historicalCleanFullRecord(historicalSelftest, POST_COMMIT_V10_REQUIRED_HEAD, {
    treeEntry: { ...historicalTree, type: 'tree' }
  }), 'wrong historical tree type fails closed');
  assert.throws(() => historicalCleanFullRecord(historicalSelftest, POST_COMMIT_V10_REQUIRED_HEAD, {
    treeEntry: { ...historicalTree, blobOid: '0'.repeat(40) }
  }), 'wrong historical blob OID fails closed');
  assert.throws(() => historicalCleanFullRecord(historicalSelftest, POST_COMMIT_V10_REQUIRED_HEAD, {
    bytes: readFileSync(resolve(ROOT, historicalSelftest.path))
  }), 'live-byte substitution for historical clean content fails closed');
  assert.throws(() => historicalCleanFullRecord(historicalSelftest, POST_COMMIT_V10_REQUIRED_HEAD, {
    lastCommit: '0'.repeat(40)
  }), 'wrong historical lastCommit fails the full-record commitment');
  const dirtySummary = v10Block.value.currentMatrix.requiredRecords
    .find(({ status }) => status !== '');
  assert.throws(() => historicalCleanFullRecord(dirtySummary, POST_COMMIT_V10_REQUIRED_HEAD),
    'historical dirty or untracked record cannot be reconstructed as clean');

  const current = postCommitV12CurrentRecords(v12Block.value);
  const inventory = postCommitV12InventoryEntries();
  const matrixCases = [
    ['missing required record', (required) => { required.pop(); }],
    ['extra required record', (required) => { required.push(structuredClone(required[0])); }],
    ['duplicate required record', (required) => { required[1] = structuredClone(required[0]); }],
    ['reordered required record', (required) => { required.reverse(); }],
    ['missing foreign record', (_required, foreign) => { foreign.pop(); }],
    ['extra foreign record', (_required, foreign) => { foreign.push(structuredClone(foreign[0])); }],
    ['duplicate foreign record', (_required, foreign) => { foreign[1] = structuredClone(foreign[0]); }],
    ['reordered foreign record', (_required, foreign) => { foreign.reverse(); }],
    ['ownership drift', (_required, foreign) => { foreign[0].feature004OwnershipClaim = true; }],
    ['classification drift', (_required, foreign) => { foreign[0].classification = 'feature004-scope1-required'; }],
    ['owner attribution drift', (_required, foreign) => { foreign[0].ownerAttribution = 'Feature 004 Scope 1'; }]
  ];
  matrixCases.forEach(([label, mutate]) => {
    const required = structuredClone(current.requiredRecords);
    const foreign = structuredClone(current.foreignRecords);
    mutate(required, foreign);
    assert.throws(() => assertPostCommitV12RecordCommitments(v12Block.value, required, foreign, inventory),
      `v12 ${label} fails closed`);
  });
  const inventoryCases = [
    ['stale inventory status', (entries) => { entries[0].status = '??'; }],
    ['missing inventory entry', (entries) => { entries.pop(); }],
    ['extra inventory entry', (entries) => { entries.push({ status: '??', path: 'unexpected' }); }],
    ['duplicate inventory entry', (entries) => { entries.push(structuredClone(entries[0])); }],
    ['reordered inventory entry', (entries) => { entries.reverse(); }]
  ];
  inventoryCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(inventory);
    mutate(candidate);
    assert.throws(() => assertPostCommitV12RecordCommitments(v12Block.value,
      current.requiredRecords, current.foreignRecords, candidate), `v12 ${label} fails closed`);
  });
  const historicalV11 = validatePostCommitV11AsV12History(v11Block.value, v10Block.value,
    v9Block.value, v7Block.value, v6Block.value, v5Block.value, v4Block.value, durableBlock.value);
  assert.throws(() => assertPostCommitV12RecordCommitments(v12Block.value,
    historicalV11.requiredRecords, historicalV11.foreignRecords, inventory),
  'historical validation cannot substitute for v12 current validation');

  const observations = capturePostCommitV12AuthorityObservations(v12Block.value);
  const closure = v12Block.value.protectedAuthorityClosure;
  const closureCases = [
    ['closure omission', (value) => { value.orderedEntries.pop(); }],
    ['closure reorder', (value) => { value.orderedEntries.reverse(); }],
    ['closure hash drift', (value) => { value.closureSha256 = '0'.repeat(64); }],
    ['selector stable-key reorder', (value) => { value.orderedEntries.at(-1).stableKeyFields.reverse(); }],
    ['selector receipt-field reorder', (value) => { value.orderedEntries.at(-1).receiptFields.reverse(); }],
    ['selector duplicate receipt', (value) => {
      value.orderedEntries.at(-1).receiptSelectors.push(
        structuredClone(value.orderedEntries.at(-1).receiptSelectors[0]));
    }],
    ['exclusion eligibility drift', (value) => { value.omissionOrReorderAllowed = true; }]
  ];
  closureCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(closure);
    mutate(candidate);
    assert.throws(() => validatePostCommitV12ProtectedClosure(candidate, durableBlock.value, observations),
      `v12 ${label} fails closed`);
  });
  const cleanIndex = closure.orderedEntries.findIndex(({ kind }) => kind === 'clean-git-tree');
  const cleanObservationCases = [
    ['protected clean mode drift', (value) => { value.treeMode = '100755'; }],
    ['protected clean type drift', (value) => { value.treeType = 'tree'; }],
    ['protected clean blob drift', (value) => { value.blobOid = '0'.repeat(40); }],
    ['protected clean content drift', (value) => { value.contentSha256 = '0'.repeat(64); }],
    ['protected clean byte-length drift', (value) => { value.byteLength += 1; }],
    ['protected clean commit drift', (value) => { value.lastCommit = '0'.repeat(40); }],
    ['protected clean touch-revert drift', (value) => { value.lastCommit = 'f'.repeat(40); }]
  ];
  cleanObservationCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(observations);
    mutate(candidate.entries[cleanIndex]);
    assert.throws(() => validatePostCommitV12ProtectedClosure(closure, durableBlock.value, candidate),
      `v12 ${label} fails closed`);
  });
  const unrelatedHeadMovement = structuredClone(observations);
  unrelatedHeadMovement.globalHead = '0'.repeat(40);
  assert.doesNotThrow(() => validatePostCommitV12ProtectedClosure(
    closure, durableBlock.value, unrelatedHeadMovement),
  'unrelated global HEAD movement alone is accepted');
  const protectedMovement = structuredClone(unrelatedHeadMovement);
  protectedMovement.entries[cleanIndex].blobOid = '0'.repeat(40);
  assert.throws(() => validatePostCommitV12ProtectedClosure(
    closure, durableBlock.value, protectedMovement),
  'protected-path movement is rejected even when global HEAD equality is not required');

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const outOfBoundarySource = parserSource.replace("const REPORT_PATH = '", "const REPORT_PATH = './");
  const outOfBoundaryObservations = capturePostCommitV12AuthorityObservations(
    v12Block.value, outOfBoundarySource);
  assert.throws(() => validatePostCommitV12ProtectedClosure(
    closure, durableBlock.value, outOfBoundaryObservations),
  'parser edit outside the additive v12 boundary fails closed');

  const ledger = closure.orderedEntries.at(-1);
  const selectedRows = durableBlock.value.receipts.map((receipt) => JSON.stringify(receipt));
  assert.doesNotThrow(() => validatePostCommitV12LedgerSelector(ledger, durableBlock.value, {
    toolLogExists: true,
    toolLogText: [...selectedRows, JSON.stringify({ unrelatedAppendOnlyRow: true })].join('\n')
  }), 'unrelated append-only ledger growth is accepted');
  assert.throws(() => validatePostCommitV12LedgerSelector(ledger, durableBlock.value, {
    toolLogExists: true,
    toolLogText: selectedRows.slice(1).join('\n')
  }), 'partial selector cardinality fails closed');
  assert.throws(() => validatePostCommitV12LedgerSelector(ledger, durableBlock.value, {
    toolLogExists: true,
    toolLogText: [...selectedRows, selectedRows[0]].join('\n')
  }), 'duplicate selector cardinality fails closed');
  const contradictoryRows = structuredClone(durableBlock.value.receipts);
  contradictoryRows[0].rawOutputLines = ['contradiction'];
  contradictoryRows[0].rawOutputSha256 = '0'.repeat(64);
  assert.throws(() => validatePostCommitV12LedgerSelector(ledger, durableBlock.value, {
    toolLogExists: true,
    toolLogText: contradictoryRows.map((row) => JSON.stringify(row)).join('\n')
  }), 'selected-row contradiction fails closed');

  const contractCases = [
    ['v10 discriminator drift', (value) => { value.historicalValidation.v10Discriminator.blobOid = '0'.repeat(40); }],
    ['predecessor link substitution', (value) => { value.successorOf.rawBlockSha256 = POST_COMMIT_V10_BLOCK_SHA256; }],
    ['predecessor weakening', (value) => { value.historicalValidation.predecessorAssertionDeletionOrWeakeningAllowed = true; }],
    ['ownership inference drift', (value) => { value.inferenceContract.dirtyStateImpliesOwnership = true; }],
    ['current selector drift', (value) => { value.parserHandoff.currentSelector = 'v11-and-v12'; }],
    ['prefix identity drift', (value) => { value.captureStability.preAppendReportPrefixSha256 = '0'.repeat(64); }],
    ['matrix hash drift', (value) => { value.currentMatrix.matrixSha256 = '0'.repeat(64); }],
    ['inventory hash drift', (value) => { value.inventoryProof.inventorySha256 = '0'.repeat(64); }]
  ];
  contractCases.forEach(([label, mutate]) => {
    const candidate = structuredClone(v12Block.value);
    mutate(candidate);
    assert.throws(() => validatePostCommitV12(candidate, v11Block.value, v10Block.value,
      v9Block.value, v7Block.value, v6Block.value, v5Block.value, v4Block.value,
      durableBlock.value, v12Block.value, false), `v12 ${label} fails closed`);
  });

  const normalized = normalizedSelfSourceIdentityV8(parserSource);
  assertPostCommitV12PinValue(parserSource);
  const changedPins = parserSource
    .replace(DURABLE_EVIDENCE_BLOCK_SHA256, '1'.repeat(64))
    .replace(CURRENT_IDENTITY_V4_BLOCK_SHA256, '2'.repeat(64))
    .replace(CURRENT_IDENTITY_V5_BLOCK_SHA256, '3'.repeat(64))
    .replace(FOREIGN_ROADMAP_V6_BLOCK_SHA256, '4'.repeat(64))
    .replace(FOREIGN_SET_V7_BLOCK_SHA256, '5'.repeat(64))
    .replace(POST_COMMIT_V9_BLOCK_SHA256, '6'.repeat(64))
    .replace(POST_COMMIT_V10_BLOCK_SHA256, '7'.repeat(64))
    .replace(POST_COMMIT_V11_BLOCK_SHA256, '8'.repeat(64))
    .replace(POST_COMMIT_V12_BLOCK_SHA256, '9'.repeat(64));
  assert.deepEqual(normalizedSelfSourceIdentityV8(changedPins), normalized,
    'normalized-self-pins/v8 normalizes exactly all nine valid pin values');
  assert.throws(() => assertPostCommitV12PinValue(changedPins),
    'normalized-self-pins/v8 rejects changed v12 report authority');
  const v12PinCases = [
    ['missing', (value) => value.replace(/^const POST_COMMIT_V12_BLOCK_SHA256.*\n/m, '')],
    ['duplicate', (value) => value.replace(/^const POST_COMMIT_V12_BLOCK_SHA256.*$/m,
      (line) => `${line}\n${line}`)],
    ['renamed', (value) => value.replace('POST_COMMIT_V12_BLOCK_SHA256', 'POST_COMMIT_CURRENT_BLOCK_SHA256')],
    ['nonhex', (value) => value.replace(POST_COMMIT_V12_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered', (value) => {
      const lines = value.split('\n');
      const v11Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V11_BLOCK_SHA256'));
      const v12Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V12_BLOCK_SHA256'));
      [lines[v11Index], lines[v12Index]] = [lines[v12Index], lines[v11Index]];
      return lines.join('\n');
    }]
  ];
  v12PinCases.forEach(([label, mutate]) => assert.throws(() => parseNormalizedSelfPinsV8(mutate(parserSource)),
    `normalized-self-pins/v8 rejects ${label} v12 pin`));
}

let postCommitV12ValidationLogged = false;
let postCommitV12HistoricalCheckpointMap = new Map();
const parseCollisionContractsBeforePostCommitV12 = parseCollisionContracts;
const runPostCommitV11AdversarialCasesBeforePostCommitV12 = runPostCommitV11AdversarialCases;
const postCommitV10CurrentRecordAsV11HistoryBeforePostCommitV12 = postCommitV10CurrentRecordAsV11History;
const postCommitV9ObservedIdentityFromV10SourceAsV11HistoryBeforePostCommitV12 =
  postCommitV9ObservedIdentityFromV10SourceAsV11History;
const postCommitV11CurrentRecordBeforePostCommitV12 = postCommitV11CurrentRecord;
postCommitV10CurrentRecordAsV11History = postCommitV10CurrentRecordAsV12History;
postCommitV9ObservedIdentityFromV10SourceAsV11History = postCommitV9ObservedIdentityFromV10SourceAsV12History;

function parseCollisionContractsWithPostCommitV12() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  const v11Block = parseReportBlock(report, POST_COMMIT_V11_MARKER);
  const v12Block = parseReportBlock(report, POST_COMMIT_V12_MARKER);
  for (const [block, pin, label, byteLength] of [
    [durableBlock, DURABLE_EVIDENCE_BLOCK_SHA256, 'durable evidence block', null],
    [v4Block, CURRENT_IDENTITY_V4_BLOCK_SHA256, 'current identity v4 block', null],
    [v5Block, CURRENT_IDENTITY_V5_BLOCK_SHA256, 'current identity v5 block', null],
    [v6Block, FOREIGN_ROADMAP_V6_BLOCK_SHA256, 'foreign roadmap v6 block', null],
    [v7Block, FOREIGN_SET_V7_BLOCK_SHA256, 'foreign set v7 block', FOREIGN_SET_V7_BLOCK_BYTE_LENGTH],
    [v9Block, POST_COMMIT_V9_BLOCK_SHA256, 'post-commit v9 block', 23091],
    [v10Block, POST_COMMIT_V10_BLOCK_SHA256, 'post-commit v10 block', 41318],
    [v11Block, POST_COMMIT_V11_BLOCK_SHA256, 'post-commit v11 block', 49810],
    [v12Block, POST_COMMIT_V12_BLOCK_SHA256, 'post-commit v12 block', POST_COMMIT_V12_BLOCK_BYTE_LENGTH]
  ]) {
    assertPinnedReportBlock(block.raw, pin, label);
    if (byteLength !== null) assert.equal(Buffer.byteLength(block.raw), byteLength, `${label} byte length is exact`);
  }
  validateDurableEvidenceBlock(durableBlock.value);
  validateCurrentIdentityV4Schema(v4Block.value);
  validateForeignRoadmapV6BeforeForeignSetV7(v6Block.value, v5Block.value, v4Block.value,
    v6Block.value, false);
  validateForeignSetV7(v7Block.value, v6Block.value, v5Block.value, v4Block.value,
    v7Block.value, false);
  const inherited = validateInheritedCollisionHistory(v4Block.value, v6Block.value, v7Block.value);
  postCommitV12HistoricalCheckpointMap = new Map(inherited.currentPaths
    .map((checkpoint) => [checkpoint.path, structuredClone(checkpoint)]));
  validatePostCommitV9AsV10History(v9Block.value, v7Block.value, v6Block.value, v5Block.value,
    v4Block.value, durableBlock.value);
  validatePostCommitV10AsV11History(v10Block.value, v9Block.value, v7Block.value, v6Block.value,
    v5Block.value, v4Block.value, durableBlock.value);
  validatePostCommitV11AsV12History(v11Block.value, v10Block.value, v9Block.value,
    v7Block.value, v6Block.value, v5Block.value, v4Block.value, durableBlock.value);
  assertPostCommitV10Discriminator(v10Block.value);
  const current = validatePostCommitV12(v12Block.value, v11Block.value, v10Block.value,
    v9Block.value, v7Block.value, v6Block.value, v5Block.value, v4Block.value,
    durableBlock.value);
  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  assertPostCommitV12PinValue(parserSource);
  normalizedSelfSourceIdentityV8(parserSource);
  if (!postCommitV12ValidationLogged) {
    console.log(`FEATURE004_V10_DISCRIMINATOR_VALIDATED head=${POST_COMMIT_V10_REQUIRED_HEAD} path=scripts/selftest.mjs blob=${POST_COMMIT_V12_V10_DISCRIMINATOR.blobOid} identity=${POST_COMMIT_V12_V10_DISCRIMINATOR.expectedIdentitySha256} source=git-tree liveBytes=false`);
    console.log(`FEATURE004_V11_HISTORY_VALIDATED marker=${POST_COMMIT_V11_MARKER} sha256=${POST_COMMIT_V11_BLOCK_SHA256} bytes=49810 requiredHead=${POST_COMMIT_V11_REQUIRED_HEAD} liveComparison=false`);
    console.log(`FEATURE004_V12_VALIDATED marker=${POST_COMMIT_V12_MARKER} sha256=${POST_COMMIT_V12_BLOCK_SHA256} bytes=${POST_COMMIT_V12_BLOCK_BYTE_LENGTH} capturedHeadRole=provenance-only required=${current.requiredRecords.length} foreign=${current.foreignRecords.length} exclusions=2 inventory=${POST_COMMIT_V12_INVENTORY_SHA256} matrix=${POST_COMMIT_V12_MATRIX_SHA256} closure=${POST_COMMIT_V12_CLOSURE_SHA256}`);
    postCommitV12ValidationLogged = true;
  }
  return {
    ...inherited,
    currentIdentityV5: v5Block.value,
    currentIdentityV5Raw: v5Block.raw,
    foreignRoadmapV6: v6Block.value,
    foreignRoadmapV6Raw: v6Block.raw,
    foreignSetV7: v7Block.value,
    foreignSetV7Raw: v7Block.raw,
    postCommitV9: v9Block.value,
    postCommitV9Raw: v9Block.raw,
    postCommitV10: v10Block.value,
    postCommitV10Raw: v10Block.raw,
    postCommitV11: v11Block.value,
    postCommitV11Raw: v11Block.raw,
    postCommitV12: v12Block.value,
    postCommitV12Raw: v12Block.raw,
    postCommitV12Matrix: current
  };
}

parseCollisionContracts = parseCollisionContractsWithPostCommitV12;
runForeignSetV7AdversarialCases = runPostCommitV12AdversarialCases;
assert.equal(parseCollisionContractsBeforePostCommitV12, parseCollisionContractsWithPostCommitV11,
  'v12 preserves the complete v11 parser branch as immutable historical input');
assert.equal(runPostCommitV11AdversarialCasesBeforePostCommitV12, runPostCommitV11AdversarialCases,
  'v12 preserves the complete v11 adversarial branch as immutable historical input');
const assertCurrentCheckpointIdentityBeforePostCommitV12 = assertCurrentCheckpointIdentity;
assertCurrentCheckpointIdentity = (checkpoint) => {
  const historical = postCommitV12HistoricalCheckpointMap.get(checkpoint.path);
  if (!historical) return assertCurrentCheckpointIdentityBeforePostCommitV12(checkpoint);
  assert.deepEqual(checkpoint, historical,
    `${checkpoint.path} complete predecessor checkpoint remains exact immutable history under v12`);
};
/* FEATURE-004-COLLISION-POST-COMMIT-V12-END */

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

/* FEATURE-004-COLLISION-CAPTURE-V13-BEGIN */
const FEATURE004_CAPTURE_V13_MARKER = 'feature004-dirty-collision-post-commit-v13';
const FEATURE004_CAPTURE_V13_BEGIN = '/* FEATURE-004-COLLISION-CAPTURE-V13-BEGIN */';
const FEATURE004_CAPTURE_V13_END = '/* FEATURE-004-COLLISION-CAPTURE-V13-END */';
const FEATURE004_CAPTURE_V13_ENCODING = 'br-canonical-json-utf8-b64/v1';
const FEATURE004_CAPTURE_V13_BASE64_LINE_LENGTH = 56;
const FEATURE004_CAPTURE_V13_OUTER_FIELDS = [
  'schemaVersion',
  'marker',
  'encoding',
  'compressedPayloadSha256',
  'compressedPayloadByteLength',
  'payloadSha256',
  'payloadByteLength',
  'payloadBase64LineLength',
  'payloadBase64',
  'markerInclusiveByteLength',
  'normalizedSelfSha256'
];
const FEATURE004_CAPTURE_V13_EXCLUDED_PATHS = [REPORT_PATH, V7_LOCK_FILE_EXCLUSION];
const FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS = [
  'path',
  'pathKind',
  'classification',
  'ownerAttribution',
  'feature004OwnershipClaim',
  'transitionClass',
  'rawStatus',
  'staged',
  'unstaged',
  'headEntry',
  'indexEntry',
  'worktreeLstat',
  'worktreeGitBlobOid',
  'contentSha256',
  'byteLength',
  'stagedNumstat',
  'unstagedNumstat',
  'stagedHunks',
  'unstagedHunks',
  'indexFlags',
  'lastCommit',
  'promotionEligibility',
  'promotionEligibilityReason'
];
const FEATURE004_CAPTURE_V13_ADVERSARIAL_CASES = [
  { id: 1, case: 'captured untracked symlink becomes clean regular 100644 with the same dereferenced bytes', expected: 'reject' },
  { id: 2, case: 'captured untracked executable becomes clean regular 100644 with the same bytes', expected: 'reject' },
  { id: 3, case: 'captured tracked mixed or staged content becomes a clean commit of the worktree bytes', expected: 'reject' },
  { id: 4, case: 'exact eligible untracked regular file becomes an exact clean committed descendant', expected: 'accept only through the complete exact-clean-promotion branch' },
  { id: 5, case: 'exact eligible unstaged-only regular edit becomes an exact clean committed descendant', expected: 'accept only through the complete exact-clean-promotion branch' },
  { id: 6, case: 'current bytes match CAPTURE but exact-path lineage does not descend from C', expected: 'reject' },
  { id: 7, case: 'L is after C but L:path does not contain the captured worktree blob while H:path does', expected: 'reject' },
  { id: 8, case: 'an independent subset of eligible paths is exactly promoted while the remainder retain exact captured dirty records', expected: 'accept when every path independently satisfies one branch and all global checks remain exact' },
  { id: 9, case: 'any content, path, type, mode, index-flag, selector, authority, or new-inventory mutation', expected: 'reject' }
];
const FEATURE004_CAPTURE_V13_BINDING = {
  repositoryRoot: '/home/redacted/research-lab',
  repositoryAlias: 'research-lab',
  repositoryResolution: {
    sessionId: 'vscode-e24db39cf992f7ccd8ec75209602db59',
    decisionId: 'rb:vscode-e24db39cf992f7ccd8ec75209602db59:49',
    controlRevision: 49,
    controlPathDigest: 'sha256:e6d858a6f9bc1824d3a2cea3746d741a5bad41016d613dc242312185af9761fa',
    authority: 'concrete-target',
    transition: 'confirmed',
    scopeKind: 'command',
    scopeId: null,
    targetKind: 'absolute-target',
    pathVisibility: 'local',
    actionable: true
  }
};

function captureV13Git(args, options = {}) {
  return execFileSync('git', ['--no-optional-locks', '--no-replace-objects', ...args], {
    cwd: ROOT,
    env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1', GIT_OPTIONAL_LOCKS: '0' },
    ...options
  });
}

function captureV13GitText(args, options = {}) {
  return captureV13Git(args, { encoding: 'utf8', ...options });
}

function captureV13SplitNul(bytes, label) {
  assert.ok(Buffer.isBuffer(bytes), `${label} is binary-safe output`);
  if (bytes.length === 0) return [];
  assert.equal(bytes.at(-1), 0, `${label} has a terminal NUL`);
  const records = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] !== 0) continue;
    records.push(bytes.subarray(start, index));
    start = index + 1;
  }
  assert.equal(start, bytes.length, `${label} consumes every byte`);
  return records;
}

function captureV13DecodePath(bytes, label) {
  const path = bytes.toString('utf8');
  assert.deepEqual(Buffer.from(path, 'utf8'), bytes, `${label} is lossless UTF-8`);
  assert.ok(path.length > 0, `${label} is nonempty`);
  return path;
}

function captureV13Inventory() {
  const tokens = captureV13SplitNul(captureV13Git([
    'status', '--porcelain=v1', '-z', '--untracked-files=all'
  ]), 'v13 porcelain inventory');
  const entries = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    assert.ok(token.length >= 4, `v13 porcelain token ${index} is complete`);
    assert.equal(token[2], 0x20, `v13 porcelain token ${index} has the canonical status separator`);
    const rawStatus = token.subarray(0, 2).toString('ascii');
    const path = captureV13DecodePath(token.subarray(3), `v13 porcelain path ${index}`);
    let originalPath = null;
    const rawParts = [token, Buffer.from([0])];
    if (rawStatus.includes('R') || rawStatus.includes('C')) {
      index += 1;
      assert.ok(index < tokens.length, `${path} rename or copy record retains its source path`);
      originalPath = captureV13DecodePath(tokens[index], `${path} original path`);
      rawParts.push(tokens[index], Buffer.from([0]));
    }
    entries.push({
      rawStatus,
      path,
      originalPath,
      rawRecordBase64: Buffer.concat(rawParts).toString('base64')
    });
  }
  assert.equal(new Set(entries.map(({ path }) => path)).size, entries.length,
    'v13 porcelain inventory contains unique destination paths');
  return entries;
}

function captureV13ObjectTypeForMode(mode) {
  if (mode === '100644' || mode === '100755' || mode === '120000') return 'blob';
  if (mode === '160000') return 'commit';
  if (mode === '040000') return 'tree';
  return 'unknown';
}

function captureV13TreeEntry(revision, path) {
  const tokens = captureV13SplitNul(captureV13Git([
    'ls-tree', '--full-tree', '-z', revision, '--', path
  ]), `${revision}:${path} tree entry`);
  assert.ok(tokens.length <= 1, `${revision}:${path} resolves at most one exact tree entry`);
  if (tokens.length === 0) return { present: false, mode: null, type: null, oid: null };
  const tab = tokens[0].indexOf(0x09);
  assert.ok(tab > 0, `${revision}:${path} tree entry has metadata and path`);
  const metadata = tokens[0].subarray(0, tab).toString('ascii').split(' ');
  assert.equal(metadata.length, 3, `${revision}:${path} tree metadata is complete`);
  const resolvedPath = captureV13DecodePath(tokens[0].subarray(tab + 1), `${revision}:${path} tree path`);
  assert.equal(resolvedPath, path, `${revision}:${path} tree lookup is exact-path only`);
  const [mode, type, oid] = metadata;
  assert.match(mode, /^[0-7]{6}$/, `${revision}:${path} tree mode is canonical`);
  assert.match(type, /^(blob|tree|commit)$/, `${revision}:${path} tree type is canonical`);
  assert.match(oid, /^[a-f0-9]{40,64}$/, `${revision}:${path} tree OID is canonical`);
  return { present: true, mode, type, oid };
}

function captureV13IndexEntry(path) {
  const tokens = captureV13SplitNul(captureV13Git([
    'ls-files', '--stage', '-z', '--', path
  ]), `${path} index entries`);
  const entries = tokens.map((token, index) => {
    const tab = token.indexOf(0x09);
    assert.ok(tab > 0, `${path} index entry ${index} has metadata and path`);
    const metadata = token.subarray(0, tab).toString('ascii').split(' ');
    assert.equal(metadata.length, 3, `${path} index entry ${index} metadata is complete`);
    const [mode, oid, stageText] = metadata;
    const resolvedPath = captureV13DecodePath(token.subarray(tab + 1), `${path} index path ${index}`);
    assert.equal(resolvedPath, path, `${path} index entry ${index} is exact-path only`);
    assert.match(mode, /^[0-7]{6}$/, `${path} index entry ${index} mode is canonical`);
    assert.match(oid, /^[a-f0-9]{40,64}$/, `${path} index entry ${index} OID is canonical`);
    assert.match(stageText, /^[0-3]$/, `${path} index entry ${index} stage is canonical`);
    return {
      mode,
      type: captureV13ObjectTypeForMode(mode),
      oid,
      stage: Number(stageText),
      path: resolvedPath
    };
  });
  return { present: entries.length > 0, entries };
}

function captureV13IndexTags(path, option, label) {
  return captureV13SplitNul(captureV13Git(['ls-files', option, '-z', '--', path]), label)
    .map((token, index) => {
      assert.ok(token.length >= 3 && token[1] === 0x20, `${label} ${index} has a tag and path`);
      const resolvedPath = captureV13DecodePath(token.subarray(2), `${label} path ${index}`);
      assert.equal(resolvedPath, path, `${label} ${index} is exact-path only`);
      return token.subarray(0, 1).toString('ascii');
    });
}

function captureV13IndexFlags(path, indexEntry) {
  if (!indexEntry.present) {
    return {
      present: false,
      rawDebugFlags: [],
      lsFilesVTags: [],
      lsFilesTTags: [],
      assumeUnchanged: false,
      skipWorktree: false,
      intentToAdd: false,
      sparse: false,
      otherNonDefaultMasks: []
    };
  }
  const debug = captureV13Git(['ls-files', '--debug', '-z', '--', path]).toString('utf8');
  const rawDebugFlags = [...debug.matchAll(/flags:\s*([a-fA-F0-9]+)/g)]
    .map((match) => match[1].toLowerCase());
  const lsFilesVTags = captureV13IndexTags(path, '-v', `${path} ls-files -v tags`);
  const lsFilesTTags = captureV13IndexTags(path, '-t', `${path} ls-files -t tags`);
  const flagValues = rawDebugFlags.map((value) => BigInt(`0x${value}`));
  const knownMask = 0x6000f000n;
  const otherNonDefaultMasks = flagValues
    .map((value) => value & ~knownMask)
    .filter((value) => value !== 0n)
    .map((value) => `0x${value.toString(16)}`);
  if (rawDebugFlags.length !== indexEntry.entries.length) {
    otherNonDefaultMasks.push('missing-or-ambiguous-debug-flags');
  }
  return {
    present: true,
    rawDebugFlags,
    lsFilesVTags,
    lsFilesTTags,
    assumeUnchanged: lsFilesVTags.some((tag) => tag !== tag.toUpperCase())
      || flagValues.some((value) => (value & 0x8000n) !== 0n),
    skipWorktree: lsFilesTTags.includes('S')
      || flagValues.some((value) => (value & 0x40000000n) !== 0n),
    intentToAdd: flagValues.some((value) => (value & 0x20000000n) !== 0n),
    sparse: indexEntry.entries.some(({ mode }) => mode === '040000'),
    otherNonDefaultMasks
  };
}

function captureV13Lstat(path) {
  let stat;
  try {
    stat = lstatSync(resolve(ROOT, path));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { present: false, kind: null, mode: null, executable: false, symlink: false };
    }
    throw error;
  }
  const kind = stat.isFile() ? 'regular'
    : stat.isSymbolicLink() ? 'symlink'
      : stat.isDirectory() ? 'directory'
        : stat.isFIFO() ? 'fifo'
          : stat.isSocket() ? 'socket'
            : stat.isBlockDevice() ? 'block-device'
              : stat.isCharacterDevice() ? 'character-device' : 'unknown';
  return {
    present: true,
    kind,
    mode: (stat.mode & 0o177777).toString(8).padStart(6, '0'),
    executable: (stat.mode & 0o111) !== 0,
    symlink: stat.isSymbolicLink()
  };
}

function captureV13WorktreeBytes(path, lstat, overrideBytes = null) {
  if (overrideBytes !== null) {
    assert.ok(Buffer.isBuffer(overrideBytes), `${path} override is binary-safe`);
    return overrideBytes;
  }
  if (!lstat.present) return null;
  if (lstat.kind === 'regular') return readFileSync(resolve(ROOT, path));
  if (lstat.kind === 'symlink') return readlinkSync(resolve(ROOT, path), { encoding: 'buffer' });
  return null;
}

function captureV13GitBlobOid(bytes, label) {
  if (bytes === null) return null;
  const oid = captureV13GitText(['hash-object', '--stdin'], { input: bytes }).trim();
  assert.match(oid, /^[a-f0-9]{40,64}$/, `${label} Git blob OID is canonical`);
  return oid;
}

function captureV13Numstat(path, cached) {
  const args = ['diff', '--no-ext-diff', '--numstat', '-z'];
  if (cached) args.push('--cached');
  args.push('--', path);
  const tokens = captureV13SplitNul(captureV13Git(args), `${path} ${cached ? 'staged' : 'unstaged'} numstat`);
  if (tokens.length === 0) {
    return { present: true, additions: 0, deletions: 0, binary: false, path };
  }
  const records = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const firstTab = token.indexOf(0x09);
    const secondTab = token.indexOf(0x09, firstTab + 1);
    assert.ok(firstTab > 0 && secondTab > firstTab, `${path} numstat record ${index} is complete`);
    const additionsText = token.subarray(0, firstTab).toString('ascii');
    const deletionsText = token.subarray(firstTab + 1, secondTab).toString('ascii');
    const embeddedPath = token.subarray(secondTab + 1);
    let resolvedPath;
    if (embeddedPath.length > 0) {
      resolvedPath = captureV13DecodePath(embeddedPath, `${path} numstat path ${index}`);
    } else {
      assert.ok(index + 2 < tokens.length, `${path} rename numstat retains both path tokens`);
      const oldPath = captureV13DecodePath(tokens[index + 1], `${path} numstat old path`);
      const newPath = captureV13DecodePath(tokens[index + 2], `${path} numstat new path`);
      resolvedPath = `${oldPath}\0${newPath}`;
      index += 2;
    }
    const binary = additionsText === '-' && deletionsText === '-';
    assert.ok(binary || (/^\d+$/.test(additionsText) && /^\d+$/.test(deletionsText)),
      `${path} numstat counts are decimal or binary sentinels`);
    records.push({
      present: true,
      additions: binary ? null : Number(additionsText),
      deletions: binary ? null : Number(deletionsText),
      binary,
      path: resolvedPath
    });
  }
  assert.equal(records.length, 1, `${path} resolves exactly one scoped numstat record`);
  return records[0];
}

function captureV13Hunks(path, cached) {
  const args = ['diff', '--no-ext-diff', '--unified=0'];
  if (cached) args.push('--cached');
  args.push('--', path);
  return parseDiffHunks(captureV13GitText(args))
    .filter(({ changedLines }) => changedLines.length > 0)
    .map(({ header, additionCount, deletionCount, hunkBodySha256 }) => ({
      header,
      additionCount,
      deletionCount,
      bodySha256: hunkBodySha256
    }));
}

function captureV13SelfStrippedHunks(path, preEmitterSource) {
  const physicalSource = readFileSync(resolve(ROOT, path), 'utf8');
  const hasFinalAdoption = /^const POST_COMMIT_V13_BLOCK_SHA256\s*=/m.test(physicalSource);
  const preAdoptionSource = hasFinalAdoption
    ? stripPostCommitV13AdoptionSource(physicalSource) : physicalSource;
  const physicalDiff = hasFinalAdoption
    ? postCommitV10DiffFromHeadSource(path, preAdoptionSource)
    : captureV13GitText(['diff', '--no-ext-diff', '--unified=0', '--', path]);
  const physicalHunks = parseDiffHunks(physicalDiff)
    .filter(({ changedLines }) => changedLines.length > 0);
  const emitterIndexes = physicalHunks.flatMap((hunk, index) =>
    hunk.changedLines.includes(`+${FEATURE004_CAPTURE_V13_BEGIN}`) ? [index] : []);
  assert.deepEqual(emitterIndexes, [physicalHunks.findIndex(({ changedLines }) =>
    changedLines.includes(`+${FEATURE004_CAPTURE_V13_END}`))],
  'self-strip markers occur together in exactly one physical diff hunk');
  assert.equal(emitterIndexes.length, 1, 'the physical diff has exactly one emitter-only hunk');
  const emitterIndex = emitterIndexes[0];
  const emitterHunk = physicalHunks[emitterIndex];
  const branchStart = preAdoptionSource.indexOf(FEATURE004_CAPTURE_V13_BEGIN);
  const endLineStart = preAdoptionSource.indexOf(`\n${FEATURE004_CAPTURE_V13_END}\n`, branchStart);
  const branchEnd = endLineStart + 1 + FEATURE004_CAPTURE_V13_END.length;
  assert.ok(branchStart > 0 && branchEnd > branchStart, 'the physical emitter branch bounds are exact');
  const expectedEmitterLines = [
    '+',
    ...preAdoptionSource.slice(branchStart, branchEnd).split('\n').map((line) => `+${line}`)
  ];
  const markerLineIndex = emitterHunk.changedLines.indexOf(`+${FEATURE004_CAPTURE_V13_BEGIN}`);
  const removedStart = markerLineIndex - 1;
  const removedEnd = removedStart + expectedEmitterLines.length;
  assert.ok(removedStart >= 0, 'the emitter segment retains its additive separator line');
  assert.deepEqual(emitterHunk.changedLines.slice(removedStart, removedEnd), expectedEmitterLines,
    'the removed mixed-hunk segment is exactly the closed capture-emitter addition');
  assert.equal(stripFeature004CaptureV13Branch(preAdoptionSource),
    preEmitterSource, 'self-strip source argument is exact');
  const lineOffset = expectedEmitterLines.length;
  return physicalHunks.flatMap((hunk, index) => {
    let changedLines = hunk.changedLines;
    let header = hunk.header;
    const match = header.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/);
    assert.ok(match, `${path} self-strip hunk header is canonical`);
    let [, oldStart, oldCountText, newStart, newCountText, suffix] = match;
    const oldCount = oldCountText === undefined ? 1 : Number(oldCountText);
    let newCount = newCountText === undefined ? 1 : Number(newCountText);
    if (index === emitterIndex) {
      changedLines = [
        ...changedLines.slice(0, removedStart),
        ...changedLines.slice(removedEnd)
      ];
      newCount -= lineOffset;
    } else if (index > emitterIndex) {
      newStart = String(Number(newStart) - lineOffset);
    }
    assert.ok(Number(newStart) >= 0 && newCount >= 0,
      `${path} adjusted hunk coordinates are nonnegative`);
    if (changedLines.length === 0) return [];
    const formatRange = (start, count) => count === 1 ? start : `${start},${count}`;
    header = `@@ -${formatRange(oldStart, oldCount)} +${formatRange(newStart, newCount)} @@${suffix}`;
    return [{
      header,
      additionCount: changedLines.filter((line) => line.startsWith('+')).length,
      deletionCount: changedLines.filter((line) => line.startsWith('-')).length,
      bodySha256: sha256(changedLines.join('\n'))
    }];
  });
}

function captureV13PathLastCommit(capturedHead, path) {
  const commit = captureV13GitText([
    'log', '--no-renames', '-1', '--format=%H', capturedHead, '--', path
  ]).trim();
  if (commit === '') return null;
  assert.match(commit, /^[a-f0-9]{40,64}$/, `${capturedHead}:${path} last commit is canonical`);
  return commit;
}

function captureV13IndexFlagsAreDefault(indexEntry, indexFlags) {
  return indexEntry.present
    && indexEntry.entries.length === 1
    && indexEntry.entries[0].stage === 0
    && indexFlags.present
    && indexFlags.rawDebugFlags.length === 1
    && indexFlags.rawDebugFlags.every((value) => /^0+$/.test(value))
    && indexFlags.assumeUnchanged === false
    && indexFlags.skipWorktree === false
    && indexFlags.intentToAdd === false
    && indexFlags.sparse === false
    && indexFlags.otherNonDefaultMasks.length === 0;
}

function captureV13Promotion(record, promotionCandidate) {
  if (!promotionCandidate) {
    return {
      promotionEligibility: 'none',
      promotionEligibilityReason: 'required-or-authority-only-paths-have-no-promotion-tolerance'
    };
  }
  const regularWorktree = record.worktreeLstat.present
    && record.worktreeLstat.kind === 'regular'
    && record.worktreeLstat.symlink === false
    && record.worktreeLstat.executable === false;
  const completeContent = record.worktreeGitBlobOid !== null
    && record.contentSha256 !== null
    && Number.isInteger(record.byteLength);
  if (record.rawStatus === '??'
      && record.headEntry.present === false
      && record.indexEntry.present === false
      && record.indexFlags.present === false
      && regularWorktree
      && completeContent) {
    return {
      promotionEligibility: 'untracked-regular-100644',
      promotionEligibilityReason: 'exact-raw-??-absent-head-index-default-absent-index-flags-regular-nonsymlink-nonexecutable-complete-content'
    };
  }
  const index = record.indexEntry.entries[0];
  if (record.rawStatus === ' M'
      && record.headEntry.present
      && record.headEntry.mode === '100644'
      && record.headEntry.type === 'blob'
      && record.indexEntry.entries.length === 1
      && index?.mode === '100644'
      && index?.type === 'blob'
      && index?.stage === 0
      && index?.oid === record.headEntry.oid
      && captureV13IndexFlagsAreDefault(record.indexEntry, record.indexFlags)
      && regularWorktree
      && completeContent
      && record.worktreeGitBlobOid !== record.headEntry.oid) {
    return {
      promotionEligibility: 'unstaged-content-regular-100644',
      promotionEligibilityReason: 'exact-raw-space-M-identical-100644-head-index-distinct-regular-worktree-all-index-flags-default-complete-content'
    };
  }
  return {
    promotionEligibility: 'none',
    promotionEligibilityReason: 'captured-observations-do-not-satisfy-one-complete-eligible-class'
  };
}

function captureV13IndexBlobBytes(indexEntry, path) {
  const stageZero = indexEntry.entries.filter(({ stage }) => stage === 0);
  if (stageZero.length !== 1 || stageZero[0].type !== 'blob') return null;
  return captureV13Git(['cat-file', 'blob', stageZero[0].oid]);
}

function captureV13FullRecord({
  path,
  rawStatus,
  classification,
  ownerAttribution,
  feature004OwnershipClaim,
  promotionCandidate,
  capturedHead,
  worktreeBytesOverride = null
}) {
  const headEntry = captureV13TreeEntry(capturedHead, path);
  const indexEntry = captureV13IndexEntry(path);
  const worktreeLstat = captureV13Lstat(path);
  const worktreeBytes = captureV13WorktreeBytes(path, worktreeLstat, worktreeBytesOverride);
  const indexFlags = captureV13IndexFlags(path, indexEntry);
  const staged = rawStatus !== '' && rawStatus !== '??' && rawStatus[0] !== ' ';
  const unstaged = rawStatus === '??' || (rawStatus !== '' && rawStatus[1] !== ' ');
  const stagedHunks = captureV13Hunks(path, true);
  const stagedNumstat = captureV13Numstat(path, true);
  let unstagedHunks;
  let unstagedNumstat;
  if (worktreeBytesOverride === null) {
    unstagedHunks = captureV13Hunks(path, false);
    unstagedNumstat = captureV13Numstat(path, false);
  } else {
    const indexBytes = captureV13IndexBlobBytes(indexEntry, path);
    assert.ok(indexBytes, `${path} self-strip capture requires one stage-zero index blob`);
    assert.ok(indexBytes, `${path} self-strip capture requires one stage-zero index blob`);
    unstagedHunks = captureV13SelfStrippedHunks(path, worktreeBytes.toString('utf8'));
    unstagedNumstat = {
      present: true,
      additions: unstagedHunks.reduce((total, hunk) => total + hunk.additionCount, 0),
      deletions: unstagedHunks.reduce((total, hunk) => total + hunk.deletionCount, 0),
      binary: false,
      path
    };
  }
  const pathKind = headEntry.present || indexEntry.present ? 'tracked'
    : worktreeLstat.present ? 'untracked' : 'absent';
  const transitionClass = rawStatus === '' ? 'clean-head-index-promotion'
    : rawStatus === '??' ? 'untracked-exact-identity' : 'still-dirty-exact-identity';
  const record = {
    path,
    pathKind,
    classification,
    ownerAttribution,
    feature004OwnershipClaim,
    transitionClass,
    rawStatus,
    staged,
    unstaged,
    headEntry,
    indexEntry,
    worktreeLstat,
    worktreeGitBlobOid: captureV13GitBlobOid(worktreeBytes, path),
    contentSha256: worktreeBytes === null ? null : sha256(worktreeBytes),
    byteLength: worktreeBytes === null ? null : worktreeBytes.length,
    stagedNumstat,
    unstagedNumstat,
    stagedHunks,
    unstagedHunks,
    indexFlags,
    lastCommit: headEntry.present ? captureV13PathLastCommit(capturedHead, path) : null,
    promotionEligibility: null,
    promotionEligibilityReason: null
  };
  Object.assign(record, captureV13Promotion(record, promotionCandidate));
  assert.deepEqual(Object.keys(record), FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS,
    `${path} v13 full-record field order is exact`);
  return record;
}

function stripFeature004CaptureV13Branch(source) {
  const startNeedle = `\n${FEATURE004_CAPTURE_V13_BEGIN}\n`;
  const endNeedle = `${FEATURE004_CAPTURE_V13_END}\n`;
  assert.equal(source.split(startNeedle).length - 1, 1,
    'capture emitter source contains exactly one self-strip start marker line');
  assert.equal(source.split(endNeedle).length - 1, 1,
    'capture emitter source contains exactly one self-strip end marker line');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'capture emitter self-strip marker order is exact');
  return source.slice(0, start) + source.slice(end + endNeedle.length);
}

function captureV13ReportPrefix(reportBytes) {
  return {
    startByte: 0,
    endByteExclusive: reportBytes.length,
    byteLength: reportBytes.length,
    contentSha256: sha256(reportBytes),
    boundary: 'byte-immediately-before-v13-start-marker'
  };
}

function captureV13BufferOccurrenceCount(buffer, needle) {
  let count = 0;
  let offset = 0;
  for (;;) {
    const match = buffer.indexOf(needle, offset);
    if (match === -1) return count;
    count += 1;
    offset = match + needle.length;
  }
}

function captureV13ReportBlockContext(reportBytes) {
  assert.ok(Buffer.isBuffer(reportBytes), 'v13 report validation reads binary-safe bytes');
  const startMarker = Buffer.from(`<!-- ${FEATURE004_CAPTURE_V13_MARKER}:start -->`, 'utf8');
  const endMarker = Buffer.from(`<!-- ${FEATURE004_CAPTURE_V13_MARKER}:end -->`, 'utf8');
  const startCount = captureV13BufferOccurrenceCount(reportBytes, startMarker);
  const endCount = captureV13BufferOccurrenceCount(reportBytes, endMarker);
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(
      `FEATURE004_VALIDATE_V13_CAPTURE requires exactly one v13 start marker and one v13 end marker; found start=${startCount} end=${endCount}`
    );
  }
  const startByte = reportBytes.indexOf(startMarker);
  const endMarkerStartByte = reportBytes.indexOf(endMarker);
  assert.ok(startByte < endMarkerStartByte,
    'v13 report validation requires the unique start marker before the unique end marker');
  assert.ok(startByte === 0 || reportBytes[startByte - 1] === 0x0a,
    'v13 report start marker begins on an exact LF-delimited line');
  const endByteExclusive = endMarkerStartByte + endMarker.length;
  assert.deepEqual(reportBytes.subarray(endByteExclusive), Buffer.from('\n\n'),
    'v13 report block is final; validation and future normal parser adoption require exactly two LF bytes as the exact report separator/final suffix, both outside the marker-inclusive block');
  const blockBytes = reportBytes.subarray(startByte, endByteExclusive);
  const block = blockBytes.toString('utf8');
  assert.deepEqual(Buffer.from(block, 'utf8'), blockBytes,
    'v13 report block is lossless UTF-8');
  const prefixBytes = reportBytes.subarray(0, startByte);
  const prefix = prefixBytes.toString('utf8');
  assert.deepEqual(Buffer.from(prefix, 'utf8'), prefixBytes,
    'v13 report prefix is lossless UTF-8');
  assert.ok(prefix.trimEnd().endsWith(`<!-- ${POST_COMMIT_V12_MARKER}:end -->`),
    'v13 report prefix ends at the immutable v12 block');
  return {
    block,
    blockBytes,
    startByte,
    endMarkerStartByte,
    endByteExclusive,
    prefixBytes
  };
}

function captureV13ProtectedAuthorityClosure({
  v12,
  durable,
  capturedHead,
  inventoryByPath,
  recordByPath,
  reportBytes,
  preEmitterSource
}) {
  const ledgerDeclaration = v12.protectedAuthorityClosure.orderedEntries.at(-1);
  const ledgerResolution = validatePostCommitV12LedgerSelector(ledgerDeclaration, durable);
  const semanticLedgerSelectors = {
    selectorContract: structuredClone(ledgerDeclaration),
    resolvedSource: ledgerResolution.source,
    selectedReceiptCount: ledgerResolution.receipts.length,
    semanticSelectorSha256: ledgerDeclaration.semanticSelectorSha256
  };
  const orderedEntries = [];
  for (const entry of v12.protectedAuthorityClosure.orderedEntries) {
    if (entry.kind === 'clean-git-tree') {
      let fullRecord = recordByPath.get(entry.path);
      if (!fullRecord) {
        fullRecord = captureV13FullRecord({
          path: entry.path,
          rawStatus: inventoryByPath.get(entry.path)?.rawStatus ?? '',
          classification: 'protected-clean-authority',
          ownerAttribution: entry.authorityRole,
          feature004OwnershipClaim: false,
          promotionCandidate: false,
          capturedHead
        });
      }
      assert.equal(fullRecord.rawStatus, '', `${entry.path} protected clean authority remains clean`);
      orderedEntries.push({
        kind: entry.kind,
        path: entry.path,
        authorityRole: entry.authorityRole,
        fullRecord
      });
      continue;
    }
    if (entry.kind === 'path-scoped-live-parser-source') {
      const fullRecord = recordByPath.get(entry.path);
      assert.ok(fullRecord, 'v13 parser authority reuses the complete required-path record');
      parseNormalizedSelfPinsV8(preEmitterSource);
      const normalizedBytes = Buffer.from(
        normalizeSelfPinValuesForNames(preEmitterSource, NORMALIZED_SELF_PIN_NAMES_V8), 'utf8');
      orderedEntries.push({
        kind: entry.kind,
        path: entry.path,
        authorityRole: entry.authorityRole,
        fullRecord,
        selfCapture: {
          captureMode: 'closed-self-strip/v1-plus-normalized-self-pins/v8-pre-v13',
          selfStripStartMarker: FEATURE004_CAPTURE_V13_BEGIN,
          selfStripEndMarker: FEATURE004_CAPTURE_V13_END,
          preEmitterWorktreeGitBlobOid: fullRecord.worktreeGitBlobOid,
          preEmitterContentSha256: fullRecord.contentSha256,
          preEmitterByteLength: fullRecord.byteLength,
          retainedNormalizedPinFamily: 'normalized-self-pins/v8-pre-v13',
          retainedNormalizedPinNames: NORMALIZED_SELF_PIN_NAMES_V8,
          normalizedWorktreeGitBlobOid: captureV13GitBlobOid(normalizedBytes,
            'v13 normalized pre-emitter parser'),
          normalizedContentSha256: sha256(normalizedBytes),
          normalizedByteLength: normalizedBytes.length,
          futureNormalizedSelfPinsV9: {
            familyName: 'NORMALIZED_SELF_PIN_NAMES_V9',
            predecessorFamilyName: 'NORMALIZED_SELF_PIN_NAMES_V8',
            appendedPinLiteral: 'POST_COMMIT_V13_BLOCK_SHA256',
            adoptionState: 'declared-future-shape-not-implemented'
          }
        }
      });
      continue;
    }
    if (entry.kind === 'append-prefix') {
      orderedEntries.push({
        kind: entry.kind,
        path: entry.path,
        authorityRole: entry.authorityRole,
        capturedHeadEntry: captureV13TreeEntry(capturedHead, entry.path),
        rawStatus: inventoryByPath.get(entry.path)?.rawStatus ?? '',
        prefix: captureV13ReportPrefix(reportBytes)
      });
      continue;
    }
    assert.equal(entry.kind, 'append-only-ledger-selector',
      'v13 closure retains only the existing declared authority entry kinds');
    orderedEntries.push({
      kind: entry.kind,
      path: entry.path,
      authorityRole: entry.authorityRole,
      semanticLedgerSelectors
    });
  }
  return {
    derivedDirectCleanAuthorityPaths: v12.protectedAuthorityClosure.derivedDirectCleanAuthorityPaths,
    orderedEntries,
    orderedEntryCount: orderedEntries.length,
    closureSha256Input: 'JSON.stringify(orderedEntries)',
    closureSha256: sha256(JSON.stringify(orderedEntries)),
    additionalCleanDirectAuthorityOmitted: false,
    omissionOrReorderAllowed: false,
    semanticLedgerSelectors
  };
}

function captureV13Snapshot({ allowExistingV13 = false } = {}) {
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  let reportAuthorityBytes = reportBytes;
  if (allowExistingV13) {
    reportAuthorityBytes = captureV13ReportBlockContext(reportBytes).prefixBytes;
  } else {
    const currentReport = reportBytes.toString('utf8');
    assert.equal(currentReport.includes(`<!-- ${FEATURE004_CAPTURE_V13_MARKER}:start -->`), false,
      'the current report has no v13 start marker before capture');
    assert.equal(currentReport.includes(`<!-- ${FEATURE004_CAPTURE_V13_MARKER}:end -->`), false,
      'the current report has no v13 end marker before capture');
    assert.ok(currentReport.trimEnd().endsWith(`<!-- ${POST_COMMIT_V12_MARKER}:end -->`),
      'the current report ends at the immutable v12 block');
  }
  const report = reportAuthorityBytes.toString('utf8');
  const v12Block = parseReportBlock(report, POST_COMMIT_V12_MARKER);
  const durableBlock = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  assertPinnedReportBlock(v12Block.raw, POST_COMMIT_V12_BLOCK_SHA256, 'capture predecessor v12 block');
  validateDurableEvidenceBlock(durableBlock.value);
  const capturedHead = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
  assert.match(capturedHead, /^[a-f0-9]{40,64}$/, 'v13 captured HEAD is canonical');
  const firstInventoryEntries = captureV13Inventory();
  const inventoryByPath = new Map(firstInventoryEntries.map((entry) => [entry.path, entry]));
  assert.equal(inventoryByPath.size, firstInventoryEntries.length,
    'v13 inventory map preserves every exact path once');
  const currentSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const hasFinalPin = /^const POST_COMMIT_V13_BLOCK_SHA256\s*=/m.test(currentSource);
  const hasFinalPinFamily = /^const NORMALIZED_SELF_PIN_NAMES_V9\s*=/m.test(currentSource);
  assert.equal(hasFinalPin, hasFinalPinFamily,
    'v13 final pin and normalized pin family are adopted atomically');
  if (!allowExistingV13) {
    assert.equal(hasFinalPin, false,
      'capture-only source does not adopt the final v13 report pin');
    assert.equal(hasFinalPinFamily, false,
      'capture-only source does not adopt the final v9 normalized pin family');
  }
  const preAdoptionSource = hasFinalPin
    ? stripPostCommitV13AdoptionSource(currentSource) : currentSource;
  const preEmitterSource = stripFeature004CaptureV13Branch(preAdoptionSource);
  const preEmitterBytes = Buffer.from(preEmitterSource, 'utf8');
  const foreignMetadata = new Map(v12Block.value.currentMatrix.foreignRecordCommitments
    .map((commitment) => [commitment.path, {
      classification: commitment.classification,
      ownerAttribution: commitment.ownerAttribution
    }]));
  const requiredRecords = [];
  for (const path of REQUIRED_SCOPE_ONE_PATHS) {
    requiredRecords.push(captureV13FullRecord({
      path,
      rawStatus: inventoryByPath.get(path)?.rawStatus ?? '',
      classification: v12Block.value.currentMatrix.requiredRecordSharedContract.classification,
      ownerAttribution: v12Block.value.currentMatrix.requiredRecordSharedContract.ownerAttribution,
      feature004OwnershipClaim: true,
      promotionCandidate: false,
      capturedHead,
      worktreeBytesOverride: path === COLLISION_PARSER_PATH ? preEmitterBytes : null
    }));
  }
  assert.deepEqual(requiredRecords.map(({ path }) => path), REQUIRED_SCOPE_ONE_PATHS,
    'v13 captures all 19 required paths in exact current-parser order');
  const foreignPaths = firstInventoryEntries
    .map(({ path }) => path)
    .filter((path) => !FEATURE004_CAPTURE_V13_EXCLUDED_PATHS.includes(path)
      && !REQUIRED_SCOPE_ONE_PATHS.includes(path));
  const foreignRecords = [];
  for (const path of foreignPaths) {
    const metadata = foreignMetadata.get(path) ?? {
      classification: 'foreign-unrelated',
      ownerAttribution: 'unknown'
    };
    foreignRecords.push(captureV13FullRecord({
      path,
      rawStatus: inventoryByPath.get(path).rawStatus,
      classification: metadata.classification,
      ownerAttribution: metadata.ownerAttribution,
      feature004OwnershipClaim: false,
      promotionCandidate: true,
      capturedHead
    }));
  }
  assert.deepEqual(foreignRecords.map(({ path }) => path), foreignPaths,
    'v13 captures every non-excluded foreign dirty or untracked path in inventory order');
  const excludedRecords = FEATURE004_CAPTURE_V13_EXCLUDED_PATHS.map((path) => {
    const inventoryEntry = inventoryByPath.get(path);
    assert.ok(inventoryEntry, `${path} remains one of exactly two current dirty exclusions`);
    return {
      path,
      rawStatus: inventoryEntry.rawStatus,
      classification: path === REPORT_PATH ? 'append-only-report-recursion-exclusion'
        : 'session-runtime-lock-exclusion',
      ownerAttribution: path === REPORT_PATH ? 'bubbles.plan append-only report owner'
        : 'Bubbles session runtime',
      matrixEligible: false,
      promotionEligibilityEligible: false,
      completionInferenceEligible: false
    };
  });
  const matrixHashInput = {
    requiredRecords,
    foreignRecords,
    excludedPaths: FEATURE004_CAPTURE_V13_EXCLUDED_PATHS,
    excludedRecords
  };
  const currentMatrix = {
    fullRecordOrderedFields: FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS,
    requiredRecords,
    foreignRecords,
    excludedPaths: FEATURE004_CAPTURE_V13_EXCLUDED_PATHS,
    excludedRecords,
    requiredRecordsSha256: sha256(JSON.stringify(requiredRecords)),
    foreignRecordsSha256: sha256(JSON.stringify(foreignRecords)),
    matrixSha256Input: 'JSON.stringify({requiredRecords,foreignRecords,excludedPaths,excludedRecords})',
    matrixSha256: sha256(JSON.stringify(matrixHashInput)),
    fullRecordsMustBeRecomputed: true
  };
  const recordByPath = new Map([...requiredRecords, ...foreignRecords]
    .map((record) => [record.path, record]));
  const protectedAuthorityClosure = captureV13ProtectedAuthorityClosure({
    v12: v12Block.value,
    durable: durableBlock.value,
    capturedHead,
    inventoryByPath,
    recordByPath,
    reportBytes: reportAuthorityBytes,
    preEmitterSource
  });
  const finalInventoryEntries = captureV13Inventory();
  assert.deepEqual(finalInventoryEntries, firstInventoryEntries,
    'v13 inventory remains exact from first observation through completed capture');
  const inventoryProof = {
    command: 'git status --porcelain=v1 -z --untracked-files=all',
    encoding: 'NUL-delimited-lossless-UTF-8-paths-with-raw-record-base64',
    porcelainEntries: finalInventoryEntries,
    inventorySha256: sha256(JSON.stringify(finalInventoryEntries)),
    requiredPathCount: requiredRecords.length,
    foreignDirtyOrUntrackedPathCount: foreignRecords.length,
    excludedPathCount: excludedRecords.length,
    matrixRecordCount: requiredRecords.length + foreignRecords.length
  };
  return {
    capturedHead,
    inventoryProof,
    currentMatrix,
    protectedAuthorityClosure,
    reportPrefix: captureV13ReportPrefix(reportAuthorityBytes),
    semanticLedgerSelectors: protectedAuthorityClosure.semanticLedgerSelectors,
    foreignMetadata
  };
}

function captureV13Payload(snapshot) {
  return {
    contractVersion: 'feature004-dirty-collision-post-commit/v13',
    findingId: 'F004-V13-CAPTURE-SHAPE-001',
    successorRevision: 'v13',
    capturedAt: new Date().toISOString(),
    capturedHead: snapshot.capturedHead,
    headPolicy: {
      capturedHeadRole: 'provenance-only',
      globalHeadEqualityRequired: false,
      replacementObjectsDisabledForLineageAndTreeQueries: true,
      renameOrCopyLineageInferenceAllowed: false
    },
    successorOf: {
      marker: POST_COMMIT_V12_MARKER,
      rawBlockSha256: POST_COMMIT_V12_BLOCK_SHA256,
      disposition: 'mandatory-byte-identical-history'
    },
    captureSchema: {
      inventoryCommand: 'git status --porcelain=v1 -z --untracked-files=all',
      requiredScope1PathsRemainExact: true,
      requiredScope1PathsGainPromotionTolerance: false,
      foreignPathCoverage: 'every non-excluded current dirty or untracked path',
      excludedPaths: FEATURE004_CAPTURE_V13_EXCLUDED_PATHS,
      additionalExclusionsAllowed: false,
      fullRecordOrderedFields: FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS,
      treeEntryShape: ['present', 'mode', 'type', 'oid'],
      indexEntryShape: ['present', 'entries'],
      indexEntryRecordShape: ['mode', 'type', 'oid', 'stage', 'path'],
      worktreeLstatShape: ['present', 'kind', 'mode', 'executable', 'symlink'],
      numstatShape: ['present', 'additions', 'deletions', 'binary', 'path'],
      hunkShape: ['header', 'additionCount', 'deletionCount', 'bodySha256'],
      indexFlagsShape: [
        'present', 'rawDebugFlags', 'lsFilesVTags', 'lsFilesTTags', 'assumeUnchanged',
        'skipWorktree', 'intentToAdd', 'sparse', 'otherNonDefaultMasks'
      ],
      missingObservationPolicy: 'explicit absence; missing, ambiguous, contradictory, lossy, or unsupported capture forces promotionEligibility none'
    },
    inventoryProof: snapshot.inventoryProof,
    currentMatrix: snapshot.currentMatrix,
    protectedAuthorityClosure: snapshot.protectedAuthorityClosure,
    reportPrefix: snapshot.reportPrefix,
    semanticLedgerSelectors: snapshot.semanticLedgerSelectors,
    promotionContract: {
      closedEnum: [
        'untracked-regular-100644',
        'unstaged-content-regular-100644',
        'none'
      ],
      eligibilityDerivedOnlyFromCapturedObservations: true,
      equalBytesCannotPromoteNone: true,
      validationBranches: {
        perEligibleForeignPath: ['exact-captured-full-record', 'exact-clean-promotion'],
        promotionEligibilityNone: 'exact-captured-full-record only',
        branchSelectionIndependentPerPath: true,
        pairOrInventoryAtomicityRequired: false,
        exactCleanPromotion: {
          symbols: { C: 'captured HEAD', L: 'literal-path last commit from H', H: 'current HEAD' },
          replacementObjectsDisabled: true,
          renameOrCopyInferenceAllowed: false,
          porcelain: 'path absent and tracked',
          representations: 'H:path, current index, current worktree Git object, and lstat are exact regular non-symlink non-executable 100644 blob representations with captured worktree blob OID',
          rawBytes: 'content SHA-256 and byte length equal CAPTURE',
          indexFlags: 'all default',
          diffState: 'staged and unstaged numstat are zero; staged and unstaged hunk sets are empty',
          ancestry: 'C <= L <= H',
          treePredicates: 'L:path and H:path are exact 100644 blobs with the captured worktree Git blob OID',
          globalHEqualsCRequired: false,
          queryUnavailableAmbiguousOrContradictory: 'reject'
        }
      }
    },
    noInferenceRule: {
      promotionProvesOnly: 'captured bytes and regular-100644 representation reached an exact descendant path commit',
      ownership: false,
      approval: false,
      scopeMembership: false,
      semanticCoherence: false,
      completion: false,
      checkbox: false,
      scopeStatus: false,
      topLevelStatus: false,
      certification: false,
      authority: false
    },
    adversarialCases: FEATURE004_CAPTURE_V13_ADVERSARIAL_CASES,
    performanceHandoff: {
      optimizedHelper: 'pathCopyClosedSchemaMutationCandidates',
      referenceHelper: 'deepCloneClosedSchemaMutationCandidates',
      equivalenceFixtureCount: 1,
      requiredEqualOutputs: [
        'byte-identical ordered candidate JSON',
        'identical ordered labels',
        'identical candidate count'
      ],
      canonicalSourceDigestCheckedBeforeAndAfterCandidateGeneration: true,
      changedPathAncestorsCopied: true,
      untouchedContainerIdentityPreserved: true,
      exhaustiveValidationGenerator: 'pathCopyClosedSchemaMutationCandidates-after-equivalence',
      settledPathsReuse: 'one parseCollisionContracts result reused by all five scriptTransitionCases checks',
      additionalParserInvocationsForFiveTransitionChecks: 0,
      assertionCaseOrderOrFailureConditionRemovalAllowed: false
    },
    parserHandoff: {
      owner: 'bubbles.test',
      path: COLLISION_PARSER_PATH,
      futurePinLiteral: 'POST_COMMIT_V13_BLOCK_SHA256',
      futureNormalizedPinFamilyName: 'NORMALIZED_SELF_PIN_NAMES_V9',
      futureNormalizedPinFamilyOrder: [...NORMALIZED_SELF_PIN_NAMES_V8, 'POST_COMMIT_V13_BLOCK_SHA256'],
      currentImplementationState: 'capture-emitter-only-no-v13-parser-branch-or-final-pin',
      payloadEncoding: FEATURE004_CAPTURE_V13_ENCODING,
      canonicalDecodeReencodeIdentityRequired: true,
      futureParserChecksRequired: [
        'base64 alphabet and line lengths plus canonical base64 decode and re-encode identity',
        'compressed payload SHA-256 and byte length',
        'Brotli decompression to the exact decoded canonical payload bytes',
        'decoded payload SHA-256 and byte length',
        'JSON parse followed by JSON.stringify canonical equality',
        'marker cardinality and marker-inclusive byte length',
        'normalized outer self-hash'
      ],
      completeDecodedCanonicalPayloadIsAuthority: true,
      outerNormalizedSelfHash: 'replace-both-32-character-normalizedSelfSha256-chunks-with-64-ASCII-zeroes-before-marker-inclusive-hash'
    },
    repositoryBinding: FEATURE004_CAPTURE_V13_BINDING,
    planningRouting: {
      planningInputNotPassEvidence: true,
      reportEditedByCaptureEmitter: false,
      checkboxMutationAllowed: false,
      scopeStatusMutationAllowed: false,
      specStatusMutationAllowed: false,
      certificationMutationAllowed: false,
      scopeOneStatus: 'In Progress',
      scopeTwoLocked: true,
      nextRequiredOwner: 'bubbles.plan'
    },
    testOwnerHandoff: {
      owner: 'bubbles.test',
      onlyAllowedEditedPath: COLLISION_PARSER_PATH,
      exactCommand: 'node --test tests/feature-004-dirty-tree-collision.test.mjs',
      timeoutSeconds: 600,
      timeoutIncreaseAllowed: false,
      expectedTopLevelCaseCount: 3,
      topLevelCaseTitles: [
        'Feature 004 preserves every pre-existing dirty hunk',
        'Feature 004 collision disposition parser fails closed on malformed records',
        'Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary'
      ],
      caseAssertionOrderingOrFailureConditionRemovalAllowed: false,
      fullCollisionSuiteRunBeforeV13ReportAdoptionAllowed: false
    }
  };
}

function captureV13HashChunks(hash, label) {
  assert.match(hash, /^[a-f0-9]{64}$/, `${label} is a canonical SHA-256`);
  return [hash.slice(0, 32), hash.slice(32)];
}

function renderCaptureV13HashArray(field, chunks, trailingComma) {
  return [
    `"${field}":[`,
    ...chunks.map((chunk, index) =>
      `${JSON.stringify(chunk)}${index === chunks.length - 1 ? '' : ','}`),
    trailingComma ? '],' : ']'
  ];
}

function renderCaptureV13Outer(outer) {
  return [
    '{',
    `"schemaVersion":${JSON.stringify(outer.schemaVersion)},`,
    `"marker":${JSON.stringify(outer.marker)},`,
    `"encoding":${JSON.stringify(outer.encoding)},`,
    ...renderCaptureV13HashArray('compressedPayloadSha256', outer.compressedPayloadSha256, true),
    `"compressedPayloadByteLength":${outer.compressedPayloadByteLength},`,
    ...renderCaptureV13HashArray('payloadSha256', outer.payloadSha256, true),
    `"payloadByteLength":${outer.payloadByteLength},`,
    `"payloadBase64LineLength":${outer.payloadBase64LineLength},`,
    '"payloadBase64":[',
    ...outer.payloadBase64.map((line, index) =>
      `${JSON.stringify(line)}${index === outer.payloadBase64.length - 1 ? '' : ','}`),
    '],',
    `"markerInclusiveByteLength":${outer.markerInclusiveByteLength},`,
    ...renderCaptureV13HashArray('normalizedSelfSha256', outer.normalizedSelfSha256, false),
    '}'
  ].join('\n');
}

function renderCaptureV13Block(outer) {
  return [
    `<!-- ${FEATURE004_CAPTURE_V13_MARKER}:start -->`,
    '```json',
    renderCaptureV13Outer(outer),
    '```',
    `<!-- ${FEATURE004_CAPTURE_V13_MARKER}:end -->`
  ].join('\n');
}

function captureV13CompressPayload(payloadBytes) {
  return brotliCompressSync(payloadBytes, {
    params: {
      [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
      [zlibConstants.BROTLI_PARAM_LGWIN]: 22,
      [zlibConstants.BROTLI_PARAM_SIZE_HINT]: payloadBytes.length
    }
  });
}

function buildCaptureV13Block(payload) {
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = Buffer.from(payloadJson, 'utf8');
  const compressedPayloadBytes = captureV13CompressPayload(payloadBytes);
  const base64 = compressedPayloadBytes.toString('base64');
  const payloadBase64 = base64.match(/.{1,56}/g) ?? [];
  assert.ok(payloadBase64.length > 0, 'v13 payload produces at least one base64 line');
  const outer = {
    schemaVersion: 'feature004-post-commit-v13-capture-envelope/v1',
    marker: FEATURE004_CAPTURE_V13_MARKER,
    encoding: FEATURE004_CAPTURE_V13_ENCODING,
    compressedPayloadSha256: captureV13HashChunks(sha256(compressedPayloadBytes),
      'v13 compressed payload hash'),
    compressedPayloadByteLength: compressedPayloadBytes.length,
    payloadSha256: captureV13HashChunks(sha256(payloadBytes), 'v13 payload hash'),
    payloadByteLength: payloadBytes.length,
    payloadBase64LineLength: FEATURE004_CAPTURE_V13_BASE64_LINE_LENGTH,
    payloadBase64,
    markerInclusiveByteLength: 0,
    normalizedSelfSha256: ['0'.repeat(32), '0'.repeat(32)]
  };
  for (;;) {
    const byteLength = Buffer.byteLength(renderCaptureV13Block(outer));
    if (byteLength === outer.markerInclusiveByteLength) break;
    outer.markerInclusiveByteLength = byteLength;
  }
  const normalizedBlock = renderCaptureV13Block(outer);
  outer.normalizedSelfSha256 = captureV13HashChunks(sha256(normalizedBlock),
    'v13 normalized marker-inclusive hash');
  const block = renderCaptureV13Block(outer);
  assert.equal(Buffer.byteLength(block), outer.markerInclusiveByteLength,
    'v13 marker-inclusive byte length is stable after self-hash insertion');
  return { block, outer, compressedPayloadBytes, payloadBytes, payloadJson };
}

function captureV13AssertHashChunks(chunks, label) {
  assert.ok(Array.isArray(chunks), `${label} is an array`);
  assert.equal(chunks.length, 2, `${label} has exactly two chunks`);
  chunks.forEach((chunk, index) => {
    assert.match(chunk, /^[a-f0-9]{32}$/, `${label}[${index}] is exactly 32 lowercase hex characters`);
  });
}

function decodeCaptureV13Block(block) {
  assert.equal(typeof block, 'string', 'v13 marker-inclusive block is a string');
  const startMarker = `<!-- ${FEATURE004_CAPTURE_V13_MARKER}:start -->`;
  const endMarker = `<!-- ${FEATURE004_CAPTURE_V13_MARKER}:end -->`;
  assert.equal(block.split(startMarker).length - 1, 1, 'v13 output has exactly one start marker');
  assert.equal(block.split(endMarker).length - 1, 1, 'v13 output has exactly one end marker');
  block.split('\n').forEach((line, index) => {
    assert.ok(Buffer.byteLength(line, 'utf8') <= 72,
      `v13 output line ${index + 1} is at most 72 bytes`);
  });
  const match = block.match(new RegExp(`^${startMarker}\\n` + '```json\\n([\\s\\S]*?)\\n```\\n' + `${endMarker}$`));
  assert.ok(match, 'v13 output is one well-formed marker-delimited JSON block');
  const decodedOuter = JSON.parse(match[1]);
  assertExactOrderedKeys(decodedOuter, FEATURE004_CAPTURE_V13_OUTER_FIELDS,
    'v13 outer envelope');
  assert.equal(renderCaptureV13Block(decodedOuter), block,
    'v13 outer block is the exact canonical renderer identity');
  assert.equal(decodedOuter.schemaVersion, 'feature004-post-commit-v13-capture-envelope/v1',
    'v13 outer block declares the exact schema version');
  assert.equal(decodedOuter.marker, FEATURE004_CAPTURE_V13_MARKER,
    'v13 outer block declares the exact marker');
  assert.equal(decodedOuter.encoding, FEATURE004_CAPTURE_V13_ENCODING,
    'v13 outer block declares deterministic Brotli canonical JSON encoding');
  captureV13AssertHashChunks(decodedOuter.compressedPayloadSha256,
    'v13 compressed payload SHA-256 chunks');
  captureV13AssertHashChunks(decodedOuter.payloadSha256,
    'v13 decoded payload SHA-256 chunks');
  captureV13AssertHashChunks(decodedOuter.normalizedSelfSha256,
    'v13 normalized self SHA-256 chunks');
  for (const field of [
    'compressedPayloadByteLength',
    'payloadByteLength',
    'payloadBase64LineLength',
    'markerInclusiveByteLength'
  ]) {
    assert.ok(Number.isSafeInteger(decodedOuter[field]) && decodedOuter[field] > 0,
      `v13 outer ${field} is a positive safe integer`);
  }
  assert.equal(decodedOuter.payloadBase64LineLength, FEATURE004_CAPTURE_V13_BASE64_LINE_LENGTH,
    'v13 outer block declares the exact base64 line length');
  assert.ok(Array.isArray(decodedOuter.payloadBase64) && decodedOuter.payloadBase64.length > 0,
    'v13 outer payloadBase64 is a nonempty array');
  decodedOuter.payloadBase64.forEach((line, index) => {
    assert.match(line, /^[A-Za-z0-9+/]+={0,2}$/, `v13 base64 line ${index} uses only the canonical alphabet`);
    if (index < decodedOuter.payloadBase64.length - 1) {
      assert.equal(line.length, FEATURE004_CAPTURE_V13_BASE64_LINE_LENGTH,
        `v13 base64 line ${index} has the declared length`);
      assert.equal(line.includes('='), false, `v13 non-final base64 line ${index} has no padding`);
    } else {
      assert.ok(line.length > 0 && line.length <= FEATURE004_CAPTURE_V13_BASE64_LINE_LENGTH,
        'v13 final base64 line has 1..56 characters');
    }
  });
  const joinedBase64 = decodedOuter.payloadBase64.join('');
  const decodedCompressedPayload = Buffer.from(joinedBase64, 'base64');
  assert.equal(decodedCompressedPayload.toString('base64'), joinedBase64,
    'v13 payload base64 decode and canonical re-encode are identical');
  assert.equal(decodedCompressedPayload.length, decodedOuter.compressedPayloadByteLength,
    'v13 compressed payload byte length is exact');
  assert.equal(sha256(decodedCompressedPayload), decodedOuter.compressedPayloadSha256.join(''),
    'v13 compressed payload SHA-256 is exact');
  const decodedPayload = brotliDecompressSync(decodedCompressedPayload);
  assert.deepEqual(captureV13CompressPayload(decodedPayload), decodedCompressedPayload,
    'v13 decoded payload deterministically recompresses to the exact Brotli bytes');
  assert.equal(decodedPayload.length, decodedOuter.payloadByteLength,
    'v13 decoded payload byte length is exact');
  assert.equal(sha256(decodedPayload), decodedOuter.payloadSha256.join(''),
    'v13 decoded payload SHA-256 is exact');
  const decodedPayloadValue = JSON.parse(decodedPayload.toString('utf8'));
  const decodedPayloadJson = JSON.stringify(decodedPayloadValue);
  assert.deepEqual(Buffer.from(decodedPayloadJson, 'utf8'), decodedPayload,
    'v13 decoded payload retains canonical JSON.stringify identity');
  assert.equal(block.endsWith('\n'), false,
    'v13 marker-inclusive block excludes the transport LF');
  assert.equal(Buffer.byteLength(block), decodedOuter.markerInclusiveByteLength,
    'v13 outer byte-length field covers the complete marker-inclusive block');
  assert.equal(Buffer.byteLength(`${block}\n`), decodedOuter.markerInclusiveByteLength + 1,
    'v13 emitted transport LF is exactly one byte beyond the marker-inclusive block');
  const normalizedOuter = {
    ...decodedOuter,
    normalizedSelfSha256: ['0'.repeat(32), '0'.repeat(32)]
  };
  assert.equal(sha256(renderCaptureV13Block(normalizedOuter)), decodedOuter.normalizedSelfSha256.join(''),
    'v13 normalized outer self-hash covers the complete marker-inclusive block');
  return {
    outer: decodedOuter,
    compressedPayloadBytes: decodedCompressedPayload,
    payloadBytes: decodedPayload,
    payloadJson: decodedPayloadJson,
    payload: decodedPayloadValue
  };
}

function assertCaptureV13BlockSelfCheck({
  block,
  outer,
  compressedPayloadBytes,
  payloadBytes,
  payloadJson
}) {
  const decoded = decodeCaptureV13Block(block);
  assert.deepEqual(decoded.outer, outer,
    'v13 outer block parses to the exact rendered object');
  assert.deepEqual(decoded.compressedPayloadBytes, compressedPayloadBytes,
    'v13 decoded compressed payload bytes are exact');
  assert.deepEqual(decoded.payloadBytes, payloadBytes,
    'v13 decoded payload bytes are exact');
  assert.equal(decoded.payloadJson, payloadJson,
    'v13 decoded canonical payload JSON is exact');
}

function captureV13FirstDifference(actual, expected, path = []) {
  if (Object.is(actual, expected)) return null;
  if (actual === null || expected === null
      || typeof actual !== 'object' || typeof expected !== 'object') {
    return { path, actual, expected };
  }
  if (Array.isArray(actual) !== Array.isArray(expected)) return { path, actual, expected };
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    return { path, actualKeys, expectedKeys };
  }
  for (const key of actualKeys) {
    const difference = captureV13FirstDifference(actual[key], expected[key], [...path, key]);
    if (difference) return difference;
  }
  return null;
}

function captureV13DifferencePath(label, path) {
  return path.reduce((result, key) => Number.isInteger(key)
    ? `${result}[${key}]`
    : `${result}.${key}`, label);
}

function captureV13AssertExact(actual, expected, label) {
  const difference = captureV13FirstDifference(actual, expected);
  if (!difference) return;
  const path = captureV13DifferencePath(label, difference.path);
  const detail = 'actualKeys' in difference
    ? `actualKeys=${JSON.stringify(difference.actualKeys)} expectedKeys=${JSON.stringify(difference.expectedKeys)}`
    : `actual=${JSON.stringify(difference.actual)} expected=${JSON.stringify(difference.expected)}`;
  throw new Error(`${path} mismatch: ${detail}`);
}

function captureV13AssertAncestor(ancestor, descendant, label) {
  try {
    captureV13Git(['merge-base', '--is-ancestor', ancestor, descendant]);
  } catch (error) {
    if (error?.status === 1) throw new Error(`${label} mismatch: ${ancestor} is not an ancestor of ${descendant}`);
    throw error;
  }
}

function captureV13AssertMatrixIntegrity(matrix, label) {
  assertExactOrderedKeys(matrix, [
    'fullRecordOrderedFields',
    'requiredRecords',
    'foreignRecords',
    'excludedPaths',
    'excludedRecords',
    'requiredRecordsSha256',
    'foreignRecordsSha256',
    'matrixSha256Input',
    'matrixSha256',
    'fullRecordsMustBeRecomputed'
  ], label);
  captureV13AssertExact(matrix.fullRecordOrderedFields,
    FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS, `${label}.fullRecordOrderedFields`);
  for (const [collectionName, records] of [
    ['requiredRecords', matrix.requiredRecords],
    ['foreignRecords', matrix.foreignRecords]
  ]) {
    assert.ok(Array.isArray(records), `${label}.${collectionName} is an array`);
    records.forEach((record, index) => {
      captureV13AssertExact(Object.keys(record), FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS,
        `${label}.${collectionName}[${index}] field order`);
    });
    assert.equal(new Set(records.map(({ path }) => path)).size, records.length,
      `${label}.${collectionName} contains unique paths`);
  }
  captureV13AssertExact(matrix.excludedPaths, FEATURE004_CAPTURE_V13_EXCLUDED_PATHS,
    `${label}.excludedPaths`);
  assert.equal(matrix.excludedRecords.length, matrix.excludedPaths.length,
    `${label}.excludedRecords cardinality matches excludedPaths`);
  captureV13AssertExact(matrix.excludedRecords.map(({ path }) => path), matrix.excludedPaths,
    `${label}.excludedRecords paths`);
  assert.equal(matrix.requiredRecordsSha256, sha256(JSON.stringify(matrix.requiredRecords)),
    `${label}.requiredRecordsSha256 matches the complete ordered records`);
  assert.equal(matrix.foreignRecordsSha256, sha256(JSON.stringify(matrix.foreignRecords)),
    `${label}.foreignRecordsSha256 matches the complete ordered records`);
  assert.equal(matrix.matrixSha256Input,
    'JSON.stringify({requiredRecords,foreignRecords,excludedPaths,excludedRecords})',
    `${label}.matrixSha256Input is exact`);
  assert.equal(matrix.matrixSha256, sha256(JSON.stringify({
    requiredRecords: matrix.requiredRecords,
    foreignRecords: matrix.foreignRecords,
    excludedPaths: matrix.excludedPaths,
    excludedRecords: matrix.excludedRecords
  })), `${label}.matrixSha256 matches the complete matrix`);
  assert.equal(matrix.fullRecordsMustBeRecomputed, true,
    `${label}.fullRecordsMustBeRecomputed remains fail-closed`);
}

function captureV13AssertInventoryIntegrity(inventory, matrix, label) {
  assertExactOrderedKeys(inventory, [
    'command',
    'encoding',
    'porcelainEntries',
    'inventorySha256',
    'requiredPathCount',
    'foreignDirtyOrUntrackedPathCount',
    'excludedPathCount',
    'matrixRecordCount'
  ], label);
  assert.equal(inventory.command, 'git status --porcelain=v1 -z --untracked-files=all',
    `${label}.command is exact`);
  assert.equal(inventory.encoding,
    'NUL-delimited-lossless-UTF-8-paths-with-raw-record-base64',
    `${label}.encoding is exact`);
  assert.equal(new Set(inventory.porcelainEntries.map(({ path }) => path)).size,
    inventory.porcelainEntries.length, `${label}.porcelainEntries contains unique paths`);
  assert.equal(inventory.inventorySha256, sha256(JSON.stringify(inventory.porcelainEntries)),
    `${label}.inventorySha256 matches every ordered porcelain entry`);
  assert.equal(inventory.requiredPathCount, matrix.requiredRecords.length,
    `${label}.requiredPathCount is exact`);
  assert.equal(inventory.foreignDirtyOrUntrackedPathCount, matrix.foreignRecords.length,
    `${label}.foreignDirtyOrUntrackedPathCount is exact`);
  assert.equal(inventory.excludedPathCount, matrix.excludedRecords.length,
    `${label}.excludedPathCount is exact`);
  assert.equal(inventory.matrixRecordCount,
    matrix.requiredRecords.length + matrix.foreignRecords.length,
    `${label}.matrixRecordCount is exact`);
  const inventoryByPath = new Map(inventory.porcelainEntries.map((entry) => [entry.path, entry]));
  const dirtyMatrixRecords = [
    ...matrix.requiredRecords.filter(({ rawStatus }) => rawStatus !== ''),
    ...matrix.foreignRecords,
    ...matrix.excludedRecords
  ];
  assert.equal(new Set(dirtyMatrixRecords.map(({ path }) => path)).size,
    dirtyMatrixRecords.length, `${label} dirty matrix paths are unique across all branches`);
  dirtyMatrixRecords.forEach((record) => {
    const entry = inventoryByPath.get(record.path);
    assert.ok(entry, `${label}.porcelainEntries[path=${record.path}] exists`);
    assert.equal(entry.rawStatus, record.rawStatus,
      `${label}.porcelainEntries[path=${record.path}].rawStatus is exact`);
  });
  captureV13AssertExact(inventory.porcelainEntries.map(({ path }) => path).sort(),
    dirtyMatrixRecords.map(({ path }) => path).sort(), `${label} complete dirty path set`);
}

function captureV13AssertCapturedRecordProvenance(record, capturedHead,
  promotionCandidate, label) {
  const expectedPathKind = record.headEntry.present || record.indexEntry.present ? 'tracked'
    : record.worktreeLstat.present ? 'untracked' : 'absent';
  const expectedTransitionClass = record.rawStatus === '' ? 'clean-head-index-promotion'
    : record.rawStatus === '??' ? 'untracked-exact-identity' : 'still-dirty-exact-identity';
  const expectedStaged = record.rawStatus !== '' && record.rawStatus !== '??'
    && record.rawStatus[0] !== ' ';
  const expectedUnstaged = record.rawStatus === '??'
    || (record.rawStatus !== '' && record.rawStatus[1] !== ' ');
  captureV13AssertExact({
    pathKind: record.pathKind,
    transitionClass: record.transitionClass,
    staged: record.staged,
    unstaged: record.unstaged
  }, {
    pathKind: expectedPathKind,
    transitionClass: expectedTransitionClass,
    staged: expectedStaged,
    unstaged: expectedUnstaged
  }, `${label}.derivedStatus`);
  captureV13AssertExact(record.headEntry,
    captureV13TreeEntry(capturedHead, record.path), `${label}.headEntry`);
  const expectedLastCommit = record.headEntry.present
    ? captureV13PathLastCommit(capturedHead, record.path) : null;
  assert.equal(record.lastCommit, expectedLastCommit, `${label}.lastCommit is exact at capturedHead`);
  captureV13AssertExact({
    promotionEligibility: record.promotionEligibility,
    promotionEligibilityReason: record.promotionEligibilityReason
  }, captureV13Promotion(record, promotionCandidate), `${label}.promotionEligibility`);
}

function captureV13AssertExactCleanPromotion(captured, current, capturedHead,
  currentHead, label, operations = {}) {
  const assertAncestor = operations.assertAncestor ?? captureV13AssertAncestor;
  const treeEntry = operations.treeEntry ?? captureV13TreeEntry;
  assert.notEqual(captured.promotionEligibility, 'none',
    `${label}.promotionEligibility authorizes an exact clean promotion branch`);
  captureV13AssertExact({
    path: current.path,
    pathKind: current.pathKind,
    classification: current.classification,
    ownerAttribution: current.ownerAttribution,
    feature004OwnershipClaim: current.feature004OwnershipClaim,
    transitionClass: current.transitionClass,
    rawStatus: current.rawStatus,
    staged: current.staged,
    unstaged: current.unstaged
  }, {
    path: captured.path,
    pathKind: 'tracked',
    classification: captured.classification,
    ownerAttribution: captured.ownerAttribution,
    feature004OwnershipClaim: false,
    transitionClass: 'clean-head-index-promotion',
    rawStatus: '',
    staged: false,
    unstaged: false
  }, label);
  const promotedBlob = captured.worktreeGitBlobOid;
  assertNonemptyString(promotedBlob, `${label}.capturedWorktreeGitBlobOid`);
  const expectedTreeEntry = { present: true, mode: '100644', type: 'blob', oid: promotedBlob };
  captureV13AssertExact(current.headEntry, expectedTreeEntry, `${label}.headEntry`);
  captureV13AssertExact(current.indexEntry, {
    present: true,
    entries: [{ mode: '100644', type: 'blob', oid: promotedBlob, stage: 0, path: captured.path }]
  }, `${label}.indexEntry`);
  captureV13AssertExact(current.worktreeLstat, {
    present: true,
    kind: 'regular',
    mode: '100644',
    executable: false,
    symlink: false
  }, `${label}.worktreeLstat`);
  captureV13AssertExact({
    worktreeGitBlobOid: current.worktreeGitBlobOid,
    contentSha256: current.contentSha256,
    byteLength: current.byteLength
  }, {
    worktreeGitBlobOid: promotedBlob,
    contentSha256: captured.contentSha256,
    byteLength: captured.byteLength
  }, `${label}.content`);
  captureV13AssertExact(current.stagedNumstat,
    { present: true, additions: 0, deletions: 0, binary: false, path: captured.path },
    `${label}.stagedNumstat`);
  captureV13AssertExact(current.unstagedNumstat,
    { present: true, additions: 0, deletions: 0, binary: false, path: captured.path },
    `${label}.unstagedNumstat`);
  captureV13AssertExact(current.stagedHunks, [], `${label}.stagedHunks`);
  captureV13AssertExact(current.unstagedHunks, [], `${label}.unstagedHunks`);
  assert.equal(captureV13IndexFlagsAreDefault(current.indexEntry, current.indexFlags), true,
    `${label}.indexFlags are entirely default`);
  assertNonemptyString(current.lastCommit, `${label}.lastCommit`);
  assertAncestor(capturedHead, current.lastCommit,
    `${label}.ancestry capturedHead-to-lastCommit`);
  assertAncestor(current.lastCommit, currentHead,
    `${label}.ancestry lastCommit-to-currentHead`);
  captureV13AssertExact(treeEntry(current.lastCommit, captured.path),
    expectedTreeEntry, `${label}.lastCommitTreeEntry`);
  captureV13AssertExact(treeEntry(currentHead, captured.path),
    expectedTreeEntry, `${label}.currentHeadTreeEntry`);
}

function captureV13ValidateForeignRecordBranch(captured, current, capturedHead,
  currentHead, label, operations = {}) {
  if (!captureV13FirstDifference(current, captured)) return 'exact-captured-full-record';
  if (captured.promotionEligibility === 'none') {
    captureV13AssertExact(current, captured, label);
  }
  captureV13AssertExactCleanPromotion(captured, current, capturedHead,
    currentHead, label, operations);
  return 'exact-clean-promotion';
}

function captureV13AssertClosureIntegrity(closure, label) {
  assert.equal(closure.orderedEntryCount, closure.orderedEntries.length,
    `${label}.orderedEntryCount is exact`);
  assert.equal(closure.closureSha256Input, 'JSON.stringify(orderedEntries)',
    `${label}.closureSha256Input is exact`);
  assert.equal(closure.closureSha256, sha256(JSON.stringify(closure.orderedEntries)),
    `${label}.closureSha256 matches every ordered entry`);
  assert.equal(closure.additionalCleanDirectAuthorityOmitted, false,
    `${label}.additionalCleanDirectAuthorityOmitted remains false`);
  assert.equal(closure.omissionOrReorderAllowed, false,
    `${label}.omissionOrReorderAllowed remains false`);
}

function captureV13ValidateAuthorityClosure(captured, current,
  capturedPayload, currentPayload) {
  captureV13AssertClosureIntegrity(captured, 'payload.protectedAuthorityClosure');
  captureV13AssertClosureIntegrity(current, 'recapture.protectedAuthorityClosure');
  captureV13AssertExact(captured.derivedDirectCleanAuthorityPaths,
    current.derivedDirectCleanAuthorityPaths,
    'payload.protectedAuthorityClosure.derivedDirectCleanAuthorityPaths');
  captureV13AssertExact(captured.semanticLedgerSelectors, current.semanticLedgerSelectors,
    'payload.protectedAuthorityClosure.semanticLedgerSelectors');
  assert.equal(captured.orderedEntries.length, current.orderedEntries.length,
    'payload.protectedAuthorityClosure.orderedEntries length is exact');
  captured.orderedEntries.forEach((capturedEntry, index) => {
    const currentEntry = current.orderedEntries[index];
    const label = `payload.protectedAuthorityClosure.orderedEntries[${index}]`;
    captureV13AssertExact({
      kind: currentEntry.kind,
      path: currentEntry.path,
      authorityRole: currentEntry.authorityRole
    }, {
      kind: capturedEntry.kind,
      path: capturedEntry.path,
      authorityRole: capturedEntry.authorityRole
    }, label);
    if (capturedEntry.kind === 'clean-git-tree'
        || capturedEntry.kind === 'path-scoped-live-parser-source') {
      captureV13AssertExact(currentEntry, capturedEntry, label);
      return;
    }
    if (capturedEntry.kind === 'append-prefix') {
      captureV13AssertExact(capturedEntry.prefix, capturedPayload.reportPrefix,
        `${label}.capturedPrefix`);
      captureV13AssertExact(currentEntry.prefix, currentPayload.reportPrefix,
        `${label}.currentPrefix`);
      captureV13AssertExact(currentEntry.prefix, capturedEntry.prefix, `${label}.prefix`);
      captureV13AssertExact(capturedEntry.capturedHeadEntry,
        captureV13TreeEntry(capturedPayload.capturedHead, capturedEntry.path),
        `${label}.capturedHeadEntry`);
      captureV13AssertExact(currentEntry.capturedHeadEntry,
        captureV13TreeEntry(currentPayload.capturedHead, currentEntry.path),
        `${label}.currentHeadEntry`);
      assert.equal(currentEntry.rawStatus, capturedEntry.rawStatus,
        `${label}.rawStatus is exact`);
      return;
    }
    assert.equal(capturedEntry.kind, 'append-only-ledger-selector',
      `${label}.kind is one of the closed authority kinds`);
    captureV13AssertExact(currentEntry, capturedEntry, label);
  });
}

function captureV13ValidatePayloadAgainstRecapture(capturedPayload, currentSnapshot) {
  const currentPayload = captureV13Payload(currentSnapshot);
  captureV13AssertExact(Object.keys(capturedPayload), Object.keys(currentPayload),
    'payload top-level field order');
  assertUtcTimestamp(capturedPayload.capturedAt, 'payload.capturedAt');
  assert.ok(Date.parse(capturedPayload.capturedAt) <= Date.parse(currentPayload.capturedAt),
    'payload.capturedAt is not later than validation recapture time');
  assert.match(capturedPayload.capturedHead, /^[a-f0-9]{40,64}$/,
    'payload.capturedHead is canonical');
  captureV13Git(['cat-file', '-e', `${capturedPayload.capturedHead}^{commit}`]);
  captureV13AssertAncestor(capturedPayload.capturedHead, currentPayload.capturedHead,
    'payload.capturedHead provenance ancestry');

  const customFields = new Set([
    'capturedAt',
    'capturedHead',
    'inventoryProof',
    'currentMatrix',
    'protectedAuthorityClosure',
    'reportPrefix',
    'semanticLedgerSelectors'
  ]);
  for (const field of Object.keys(capturedPayload)) {
    if (customFields.has(field)) continue;
    captureV13AssertExact(capturedPayload[field], currentPayload[field], `payload.${field}`);
  }

  captureV13AssertMatrixIntegrity(capturedPayload.currentMatrix, 'payload.currentMatrix');
  captureV13AssertMatrixIntegrity(currentPayload.currentMatrix, 'recapture.currentMatrix');
  captureV13AssertInventoryIntegrity(capturedPayload.inventoryProof,
    capturedPayload.currentMatrix, 'payload.inventoryProof');
  captureV13AssertInventoryIntegrity(currentPayload.inventoryProof,
    currentPayload.currentMatrix, 'recapture.inventoryProof');
  captureV13AssertExact(capturedPayload.currentMatrix.requiredRecords,
    currentPayload.currentMatrix.requiredRecords, 'payload.currentMatrix.requiredRecords');
  captureV13AssertExact(capturedPayload.currentMatrix.excludedRecords,
    currentPayload.currentMatrix.excludedRecords, 'payload.currentMatrix.excludedRecords');
  captureV13AssertExact(capturedPayload.reportPrefix, currentPayload.reportPrefix,
    'payload.reportPrefix');
  captureV13AssertExact(capturedPayload.semanticLedgerSelectors,
    currentPayload.semanticLedgerSelectors, 'payload.semanticLedgerSelectors');

  capturedPayload.currentMatrix.requiredRecords.forEach((record, index) => {
    captureV13AssertCapturedRecordProvenance(record, capturedPayload.capturedHead, false,
      `payload.currentMatrix.requiredRecords[${index}]`);
  });
  const capturedForeign = capturedPayload.currentMatrix.foreignRecords;
  const capturedForeignByPath = new Map(capturedForeign.map((record) => [record.path, record]));
  assert.equal(capturedForeignByPath.size, capturedForeign.length,
    'payload.currentMatrix.foreignRecords paths are unique');
  for (const currentRecord of currentPayload.currentMatrix.foreignRecords) {
    assert.ok(capturedForeignByPath.has(currentRecord.path),
      `recapture.currentMatrix.foreignRecords[path=${currentRecord.path}] was present in the captured inventory`);
  }
  const currentForeignByPath = new Map(currentPayload.currentMatrix.foreignRecords
    .map((record) => [record.path, record]));
  const currentInventoryByPath = new Map(currentPayload.inventoryProof.porcelainEntries
    .map((entry) => [entry.path, entry]));
  const promotedPaths = new Set();
  let exactDirtyCount = 0;
  for (let index = 0; index < capturedForeign.length; index += 1) {
    const captured = capturedForeign[index];
    const label = `payload.currentMatrix.foreignRecords[${index} path=${captured.path}]`;
    captureV13AssertCapturedRecordProvenance(captured, capturedPayload.capturedHead, true, label);
    const expectedMetadata = currentSnapshot.foreignMetadata.get(captured.path) ?? {
      classification: 'foreign-unrelated',
      ownerAttribution: 'unknown'
    };
    captureV13AssertExact({
      classification: captured.classification,
      ownerAttribution: captured.ownerAttribution,
      feature004OwnershipClaim: captured.feature004OwnershipClaim
    }, {
      ...expectedMetadata,
      feature004OwnershipClaim: false
    }, `${label}.provenance`);
    let current = currentForeignByPath.get(captured.path);
    if (!current) {
      assert.equal(currentInventoryByPath.has(captured.path), false,
        `${label}.currentInventoryEntry is absent only for a clean candidate`);
      current = captureV13FullRecord({
        path: captured.path,
        rawStatus: '',
        classification: expectedMetadata.classification,
        ownerAttribution: expectedMetadata.ownerAttribution,
        feature004OwnershipClaim: false,
        promotionCandidate: true,
        capturedHead: currentPayload.capturedHead
      });
    }
    const branch = captureV13ValidateForeignRecordBranch(captured, current,
      capturedPayload.capturedHead, currentPayload.capturedHead, label);
    if (branch === 'exact-captured-full-record') {
      exactDirtyCount += 1;
      continue;
    }
    promotedPaths.add(captured.path);
  }

  const expectedCurrentInventory = capturedPayload.inventoryProof.porcelainEntries
    .filter(({ path }) => !promotedPaths.has(path));
  captureV13AssertExact(currentPayload.inventoryProof.porcelainEntries,
    expectedCurrentInventory, 'recapture.inventoryProof.porcelainEntries');
  const expectedCurrentForeign = capturedForeign.filter(({ path }) => !promotedPaths.has(path));
  captureV13AssertExact(currentPayload.currentMatrix.foreignRecords,
    expectedCurrentForeign, 'recapture.currentMatrix.foreignRecords');
  captureV13ValidateAuthorityClosure(capturedPayload.protectedAuthorityClosure,
    currentPayload.protectedAuthorityClosure, capturedPayload, currentPayload);

  const finalHead = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
  assert.equal(finalHead, currentPayload.capturedHead,
    'validation current HEAD remains exact through the complete recapture');
  return {
    currentPayload,
    exactDirtyCount,
    exactCleanPromotionCount: promotedPaths.size
  };
}

function validateFeature004CaptureV13() {
  assertClosedSchemaMutationGeneratorEquivalence();
  const initialReportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const reportContext = captureV13ReportBlockContext(initialReportBytes);
  const decoded = decodeCaptureV13Block(reportContext.block);
  const currentSnapshot = captureV13Snapshot({ allowExistingV13: true });
  const validation = captureV13ValidatePayloadAgainstRecapture(
    decoded.payload, currentSnapshot);
  captureV13AssertExact(readFileSync(resolve(ROOT, REPORT_PATH)), initialReportBytes,
    'report bytes through validation recapture');
  console.log([
    'FEATURE004_V13_CAPTURE_VALID',
    `markerInclusiveByteLength=${decoded.outer.markerInclusiveByteLength}`,
    `reportFinalSuffixBytes=${initialReportBytes.length - reportContext.endByteExclusive}`,
    `markerInclusiveExcludedReportFinalSuffixBytes=${initialReportBytes.length - reportContext.endByteExclusive}`,
    `compressedSha256=${decoded.outer.compressedPayloadSha256.join('')}`,
    `decodedSha256=${decoded.outer.payloadSha256.join('')}`,
    `inventoryCount=${validation.currentPayload.inventoryProof.porcelainEntries.length}`,
    `exactDirtyCount=${validation.exactDirtyCount}`,
    `exactCleanPromotionCount=${validation.exactCleanPromotionCount}`,
    `protectedClosureCount=${validation.currentPayload.protectedAuthorityClosure.orderedEntryCount}`
  ].join(' '));
}

function emitFeature004CaptureV13() {
  assertClosedSchemaMutationGeneratorEquivalence();
  const first = captureV13Snapshot();
  const payload = captureV13Payload(first);
  const rendered = buildCaptureV13Block(payload);
  assertCaptureV13BlockSelfCheck(rendered);
  const second = captureV13Snapshot();
  for (const field of [
    'capturedHead',
    'inventoryProof',
    'currentMatrix',
    'protectedAuthorityClosure',
    'reportPrefix',
    'semanticLedgerSelectors'
  ]) {
    const difference = captureV13FirstDifference(second[field], first[field]);
    if (difference) {
      throw new Error(`v13 ${field} recapture drift: ${JSON.stringify(difference)}`);
    }
  }
  process.stdout.write(`${rendered.block}\n`);
}

/* FEATURE-004-COLLISION-CAPTURE-V13-END */

/* FEATURE-004-COLLISION-POST-COMMIT-V13-BEGIN */
const POST_COMMIT_V13_BLOCK_BYTE_LENGTH = 51512;
const POST_COMMIT_V13_REPORT_PREFIX_BYTE_LENGTH = 583369;
const POST_COMMIT_V13_REPORT_PREFIX_SHA256 = '8f777d7320cbb6a61f4091607b4744135f0e06bce936e07f4b00511ee115c5e5';
const POST_COMMIT_V13_COMPRESSED_PAYLOAD_SHA256 = '02d2d6a5eae5949d7300afdcae032eabbc09b9d65c4d516cc8b725485cd8a502';
const POST_COMMIT_V13_COMPRESSED_PAYLOAD_BYTE_LENGTH = 35539;
const POST_COMMIT_V13_PAYLOAD_SHA256 = '0011fda7d1625e94717ac18aff344340afae44b1dfe4b818ddf83a5d87922287';
const POST_COMMIT_V13_PAYLOAD_BYTE_LENGTH = 263371;
const POST_COMMIT_V13_NORMALIZED_SELF_SHA256 = '70a3d917e176e40502cd7f336786aba2b619a68e3dc6385e9473ad733402024b';
const POST_COMMIT_V13_HELPER_BEGIN = '/* FEATURE-004-COLLISION-POST-COMMIT-V13-BEGIN */';
const POST_COMMIT_V13_HELPER_END = '/* FEATURE-004-COLLISION-POST-COMMIT-V13-END */';
const {
  chmodSync: postCommitV13ChmodSync,
  symlinkSync: postCommitV13SymlinkSync
} = await import('node:fs');

function parseNormalizedSelfPinsV9(source) {
  return parseNormalizedSelfPinFamily(source, NORMALIZED_SELF_PIN_NAMES_V9,
    /^const ([A-Z0-9_]*(?:DURABLE_EVIDENCE|CURRENT_IDENTITY_V[45]|FOREIGN_ROADMAP_V6|FOREIGN_SET_V7|POST_COMMIT_V9|POST_COMMIT_V10|POST_COMMIT_V11|POST_COMMIT_V12|POST_COMMIT_V13)[A-Z0-9_]*BLOCK_SHA256) = '([^']*)';$/gm,
    'normalized-self-pins/v9');
}

function normalizedSelfSourceIdentityV9(source) {
  parseNormalizedSelfPinsV8(source);
  parseNormalizedSelfPinsV9(source);
  const bytes = Buffer.from(
    normalizeSelfPinValuesForNames(source, NORMALIZED_SELF_PIN_NAMES_V9), 'utf8');
  return {
    worktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
      cwd: ROOT,
      encoding: 'utf8',
      input: bytes
    }).trim(),
    worktreeSha256: sha256(bytes),
    byteLength: bytes.length
  };
}

function assertPostCommitV13PinValue(source) {
  const assignments = parseNormalizedSelfPinsV9(source);
  assert.equal(assignments.at(-1)[1], 'POST_COMMIT_V13_BLOCK_SHA256',
    'normalized-self-pins/v9 ends with the v13 pin');
  assert.equal(assignments.at(-1)[2], POST_COMMIT_V13_BLOCK_SHA256,
    'the v13 pin retains the independently computed raw marker-inclusive report hash');
}

function stripPostCommitV13AdoptionSource(source) {
  const startNeedle = `${POST_COMMIT_V13_HELPER_BEGIN}\n`;
  const endNeedle = `${POST_COMMIT_V13_HELPER_END}\n\n`;
  assert.equal(source.split(startNeedle).length - 1, 1,
    'the final v13 parser branch has exactly one start marker line');
  assert.equal(source.split(endNeedle).length - 1, 1,
    'the final v13 parser branch has exactly one end marker line and trailing separator');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'the final v13 parser branch marker order is exact');
  let historical = source.slice(0, start) + source.slice(end + endNeedle.length);
  historical = removeExactSuccessorAddition(historical,
    `const POST_COMMIT_V13_BLOCK_SHA256 = '${POST_COMMIT_V13_BLOCK_SHA256}';\n`,
    'v13 pin addition');
  historical = removeExactSuccessorAddition(historical,
    "const NORMALIZED_SELF_PIN_NAMES_V9 = [\n  ...NORMALIZED_SELF_PIN_NAMES_V8,\n  'POST_COMMIT_V13_BLOCK_SHA256'\n];\n",
    'normalized-self-pins/v9 declaration');
  assert.equal(/^const POST_COMMIT_V13_BLOCK_SHA256\s*=/m.test(historical), false,
    'v13 historical parser source contains no final pin');
  assert.equal(/^const NORMALIZED_SELF_PIN_NAMES_V9\s*=/m.test(historical), false,
    'v13 historical parser source contains no final normalized pin family');
  return historical;
}

const POST_COMMIT_V13_PRE_PERFORMANCE_SCHEMA_HELPER = [
  "function assertEveryClosedSchemaMutationFails(canonical, validate, label) {",
  "  function visit(node, path) {",
  "    if (Array.isArray(node)) {",
  "      const missing = structuredClone(canonical);",
  "      if (node.length > 0) valueAtPath(missing, path).pop();",
  "      else valueAtPath(missing, path).push('__adversarial');",
  "      assert.throws(() => validate(missing), `${label} rejects changed array cardinality at ${path.join('.')}`);",
  "      if (node.length > 0) {",
  "        const extra = structuredClone(canonical);",
  "        valueAtPath(extra, path).push(structuredClone(node[0]));",
  "        assert.throws(() => validate(extra), `${label} rejects extra array record at ${path.join('.')}`);",
  "        if (node.length > 1) {",
  "          const reordered = structuredClone(canonical);",
  "          valueAtPath(reordered, path).reverse();",
  "          assert.throws(() => validate(reordered), `${label} rejects reordered array records at ${path.join('.')}`);",
  "        }",
  "      }",
  "      node.forEach((entry, index) => visit(entry, [...path, index]));",
  "      return;",
  "    }",
  "    if (node && typeof node === 'object') {",
  "      for (const key of Object.keys(node)) {",
  "        const missing = structuredClone(canonical);",
  "        delete valueAtPath(missing, path)[key];",
  "        assert.throws(() => validate(missing), `${label} rejects missing field ${[...path, key].join('.')}`);",
  "      }",
  "      const unknown = structuredClone(canonical);",
  "      valueAtPath(unknown, path).__unknown = true;",
  "      assert.throws(() => validate(unknown), `${label} rejects unknown field at ${path.join('.') || '<root>'}`);",
  "      if (Object.keys(node).length > 1) {",
  "        const reordered = structuredClone(canonical);",
  "        const reversed = Object.fromEntries(Object.entries(valueAtPath(reordered, path)).reverse());",
  "        const candidate = replaceAtPath(reordered, path, reversed);",
  "        assert.throws(() => validate(candidate), `${label} rejects reordered fields at ${path.join('.') || '<root>'}`);",
  "      }",
  "      for (const [key, child] of Object.entries(node)) visit(child, [...path, key]);",
  "      return;",
  "    }",
  "    const changed = structuredClone(canonical);",
  "    const candidate = replaceAtPath(changed, path, changedLeafValue(node));",
  "    assert.throws(() => validate(candidate), `${label} rejects changed field ${path.join('.')}`);",
  "  }",
  "  visit(canonical, []);",
  "}"
].join('\n');

function stripPostCommitV13PerformanceChanges(source) {
  const currentFsImport =
    "import { existsSync, lstatSync, readFileSync, readlinkSync } from 'node:fs';\n";
  const historicalFsImport =
    "import { existsSync, readFileSync } from 'node:fs';\n";
  assert.equal(countExact(source, currentFsImport), 1,
    'v13 representation capture has exactly one expanded filesystem import');
  let historical = source.replace(currentFsImport, historicalFsImport);
  const zlibImport = [
    "import {",
    "  brotliCompressSync,",
    "  brotliDecompressSync,",
    "  constants as zlibConstants",
    "} from 'node:zlib';",
    ""
  ].join('\n');
  assert.equal(countExact(historical, zlibImport), 1,
    'v13 envelope capture has exactly one Brotli import block');
  historical = historical.replace(zlibImport, '');
  const startNeedle = 'function * deepCloneClosedSchemaMutationCandidates(canonical, label) {';
  const endNeedle = 'function assertUtcTimestamp(value, label) {';
  assert.equal(historical.split(startNeedle).length - 1, 1,
    'v13 path-copy performance repair has exactly one start');
  assert.equal(historical.split(endNeedle).length - 1, 1,
    'v13 path-copy performance repair has exactly one successor boundary');
  const start = historical.indexOf(startNeedle);
  const end = historical.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0 && end > start, 'v13 path-copy performance repair bounds are exact');
  historical = historical.slice(0, start)
    + POST_COMMIT_V13_PRE_PERFORMANCE_SCHEMA_HELPER + '\n\n'
    + historical.slice(end);
  const optimizedTransition =
    '    assert.throws(() => validateScriptTransitions(settledPaths, baseline, malformed), label);';
  const historicalTransition =
    '    assert.throws(() => validateScriptTransitions(parseCollisionContracts().settledPaths, baseline, malformed), label);';
  assert.equal(countExact(historical, optimizedTransition), 1,
    'v13 single-parse performance repair has exactly one transition call site');
  historical = historical.replace(optimizedTransition, historicalTransition);
  const optimizedDestructuring =
    '    settled,\n    settledPaths,\n    supersededValidatorNote\n';
  const historicalDestructuring =
    '    settled,\n    supersededValidatorNote\n';
  assert.equal(countExact(historical, optimizedDestructuring), 1,
    'v13 single-parse performance repair has exactly one destructured settledPaths value');
  historical = historical.replace(optimizedDestructuring, historicalDestructuring);
  return historical;
}

const stripPostCommitV12SourceBeforePostCommitV13 = stripPostCommitV12Source;
stripPostCommitV12Source = (source) => stripPostCommitV12SourceBeforePostCommitV13(
  stripPostCommitV13PerformanceChanges(
    stripFeature004CaptureV13Branch(stripPostCommitV13AdoptionSource(source))));

let postCommitV13HistoricalBlockCache;

function postCommitV13HistoricalBlocks() {
  if (postCommitV13HistoricalBlockCache) return postCommitV13HistoricalBlockCache;
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const durable = parseReportBlock(report, 'feature004-scope1-durable-evidence-v1');
  const v4Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v4');
  const v5Block = parseReportBlock(report, 'feature004-dirty-collision-current-identity-v5');
  const v6Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-roadmap-v6');
  const v7Block = parseReportBlock(report, 'feature004-dirty-collision-foreign-set-v7');
  const v9Block = parseReportBlock(report, POST_COMMIT_V9_MARKER);
  const v10Block = parseReportBlock(report, POST_COMMIT_V10_MARKER);
  const v11Block = parseReportBlock(report, POST_COMMIT_V11_MARKER);
  const v12Block = parseReportBlock(report, POST_COMMIT_V12_MARKER);
  for (const [block, pin, label, byteLength] of [
    [v10Block, POST_COMMIT_V10_BLOCK_SHA256, 'historical v10 block', 41318],
    [v11Block, POST_COMMIT_V11_BLOCK_SHA256, 'historical v11 block', 49810],
    [v12Block, POST_COMMIT_V12_BLOCK_SHA256, 'historical v12 successor block',
      POST_COMMIT_V12_BLOCK_BYTE_LENGTH]
  ]) {
    assertPinnedReportBlock(block.raw, pin, label);
    assert.equal(Buffer.byteLength(block.raw), byteLength, `${label} byte length is exact`);
  }
  postCommitV13HistoricalBlockCache = {
    report,
    durable,
    v4Block,
    v5Block,
    v6Block,
    v7Block,
    v9Block,
    v10Block,
    v11Block,
    v12Block
  };
  return postCommitV13HistoricalBlockCache;
}

function assertPostCommitHistoricalSummarySyntax(summary, label) {
  assertExactOrderedKeys(summary, POST_COMMIT_V9_SUMMARY_FIELDS, label);
  assert.equal(typeof summary.path, 'string', `${label}.path is a string`);
  assert.ok(summary.path.length > 0, `${label}.path is non-empty`);
  assert.ok(summary.pathKind === 'tracked' || summary.pathKind === 'untracked',
    `${label}.pathKind is closed`);
  assert.equal(typeof summary.classification, 'string', `${label}.classification is a string`);
  assert.ok(summary.classification.length > 0, `${label}.classification is non-empty`);
  assert.equal(typeof summary.ownerAttribution, 'string', `${label}.ownerAttribution is a string`);
  assert.ok(summary.ownerAttribution.length > 0, `${label}.ownerAttribution is non-empty`);
  assert.equal(typeof summary.feature004OwnershipClaim, 'boolean',
    `${label}.feature004OwnershipClaim is boolean`);
  assert.ok(Number.isInteger(summary.hunkCount) && summary.hunkCount >= 0,
    `${label}.hunkCount is a non-negative integer`);
  assertSha256(summary.hunkSequenceSha256, `${label}.hunkSequenceSha256`);
  assertSha256(summary.identitySha256, `${label}.identitySha256`);
  if (summary.pathKind === 'untracked') {
    assert.equal(summary.status, '??', `${label}.status is exact for an untracked path`);
    assert.equal(summary.transitionClass, 'untracked-exact-identity',
      `${label}.transitionClass is exact for an untracked path`);
    return;
  }
  if (summary.status === '') {
    assert.equal(summary.transitionClass, 'clean-head-index-promotion',
      `${label}.transitionClass is exact for a historical clean path`);
    assert.equal(summary.hunkCount, 0, `${label}.hunkCount is zero for a historical clean path`);
    assert.equal(summary.hunkSequenceSha256, sha256(JSON.stringify([])),
      `${label}.hunkSequenceSha256 commits the empty historical sequence`);
    return;
  }
  assert.equal(summary.status, ' M', `${label}.status is exact for a dirty tracked path`);
  assert.equal(summary.transitionClass, 'still-dirty-exact-identity',
    `${label}.transitionClass is exact for a dirty tracked path`);
}

function validatePostCommitHistoricalOpaqueSummaryCollection({
  label,
  summaries,
  canonicalSummaries,
  expectedPaths,
  reconstructedPaths,
  successorSummaries = null,
  successorCommitments = null,
  successorRequiredMetadata = null,
  foreign = false
}) {
  assert.deepEqual(summaries.map(({ path }) => path), expectedPaths,
    `${label} path order and cardinality are exact`);
  assert.equal(new Set(summaries.map(({ path }) => path)).size, expectedPaths.length,
    `${label} paths are unique`);
  assert.deepEqual(canonicalSummaries.map(({ path }) => path), expectedPaths,
    `${label} canonical path order is exact`);
  summaries.forEach((summary, index) => {
    assertPostCommitHistoricalSummarySyntax(summary, `${label}[${index}]`);
    assert.deepEqual(summary, canonicalSummaries[index],
      `${label}[${index}] retains every immutable predecessor summary field`);
  });
  const reconstructed = new Set(reconstructedPaths);
  assert.equal(reconstructed.size, reconstructedPaths.length,
    `${label} reconstructed paths are unique`);
  reconstructed.forEach((path) => assert.ok(expectedPaths.includes(path),
    `${label} reconstructed path ${path} belongs to the predecessor collection`));
  const opaque = summaries.filter(({ path }) => !reconstructed.has(path));
  assert.deepEqual(opaque.map(({ path }) => path),
    expectedPaths.filter((path) => !reconstructed.has(path)),
  `${label} opaque path order is exact`);

  if (successorSummaries !== null) {
    const successorByPath = new Map(successorSummaries.map((summary) => [summary.path, summary]));
    assert.equal(successorByPath.size, successorSummaries.length,
      `${label} successor summary paths are unique`);
    opaque.forEach((summary) => {
      const successor = successorByPath.get(summary.path);
      assert.ok(successor, `${label} ${summary.path} has an immutable successor summary`);
      assertPostCommitHistoricalSummarySyntax(successor,
        `${label} successor summary ${summary.path}`);
      assert.deepEqual(successor, summary,
        `${label} ${summary.path} cross-links every immutable summary field to its successor`);
    });
  } else {
    assert.ok(successorCommitments !== null,
      `${label} declares summary or commitment successor authority`);
    const successorByPath = new Map(successorCommitments.map((commitment) =>
      [commitment.path, commitment]));
    assert.equal(successorByPath.size, successorCommitments.length,
      `${label} successor commitment paths are unique`);
    opaque.forEach((summary) => {
      const commitment = successorByPath.get(summary.path);
      assert.ok(commitment, `${label} ${summary.path} has an immutable successor commitment`);
      assertExactOrderedKeys(commitment, foreign
        ? ['path', 'classification', 'ownerAttribution', 'identitySha256']
        : ['path', 'identitySha256'], `${label} successor commitment ${summary.path}`);
      assert.equal(commitment.identitySha256, summary.identitySha256,
        `${label} ${summary.path} retains the exact successor identity commitment`);
      if (foreign) {
        assert.equal(commitment.classification, summary.classification,
          `${label} ${summary.path} retains its successor classification`);
        assert.equal(commitment.ownerAttribution, summary.ownerAttribution,
          `${label} ${summary.path} retains its successor owner`);
      } else {
        assert.deepEqual({
          classification: summary.classification,
          ownerAttribution: summary.ownerAttribution,
          feature004OwnershipClaim: summary.feature004OwnershipClaim
        }, successorRequiredMetadata,
        `${label} ${summary.path} retains the required shared metadata`);
      }
    });
  }
  return opaque.map((summary) => structuredClone(summary));
}

function postCommitV13HistoricalV10ParserRecord(summary,
  source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  const preV12Source = stripPostCommitV12Source(source);
  return postCommitV10ParserRecord(summary, stripPostCommitV11Source(preV12Source));
}

function postCommitV13HistoricalV11ParserRecord(summary,
  source = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  return postCommitV11ParserRecord(summary, stripPostCommitV12Source(source));
}

function postCommitV13ReconstructedV10Records(v10) {
  const reconstruct = (summary) => {
    if (summary.path === COLLISION_PARSER_PATH) {
      return postCommitV13HistoricalV10ParserRecord(summary);
    }
    if (summary.status === '') {
      return historicalCleanFullRecord(summary, POST_COMMIT_V10_REQUIRED_HEAD, {
        expectedRequiredHead: POST_COMMIT_V10_REQUIRED_HEAD
      });
    }
    return null;
  };
  const requiredRecords = v10.currentMatrix.requiredRecords.map(reconstruct).filter(Boolean);
  const foreignRecords = v10.currentMatrix.foreignRecords.map(reconstruct).filter(Boolean);
  for (const record of [...requiredRecords, ...foreignRecords]) {
    const collection = v10.currentMatrix.requiredRecords.some(({ path }) => path === record.path)
      ? v10.currentMatrix.requiredRecords : v10.currentMatrix.foreignRecords;
    const index = collection.findIndex(({ path }) => path === record.path);
    assertPostCommitV10Summary(collection[index], record,
      `historical v10 reconstructed record ${record.path}`);
  }
  return { requiredRecords, foreignRecords };
}

function postCommitV13ValidateV10OpaqueCollections(v10, v11, canonicalV10) {
  const reconstructedRequiredPaths = [
    COLLISION_PARSER_PATH,
    ...v10.currentMatrix.requiredRecords.filter(({ status }) => status === '').map(({ path }) => path)
  ];
  const reconstructedForeignPaths = v10.currentMatrix.foreignRecords
    .filter(({ status }) => status === '').map(({ path }) => path);
  const requiredSummaries = validatePostCommitHistoricalOpaqueSummaryCollection({
    label: 'historical v10 required summaries',
    summaries: v10.currentMatrix.requiredRecords,
    canonicalSummaries: canonicalV10.currentMatrix.requiredRecords,
    expectedPaths: REQUIRED_SCOPE_ONE_PATHS,
    reconstructedPaths: reconstructedRequiredPaths,
    successorSummaries: v11.currentMatrix.requiredRecords
  });
  const foreignSummaries = validatePostCommitHistoricalOpaqueSummaryCollection({
    label: 'historical v10 foreign summaries',
    summaries: v10.currentMatrix.foreignRecords,
    canonicalSummaries: canonicalV10.currentMatrix.foreignRecords,
    expectedPaths: POST_COMMIT_V9_FOREIGN_PATHS,
    reconstructedPaths: reconstructedForeignPaths,
    successorSummaries: v11.currentMatrix.foreignRecords
  });
  assert.deepEqual(v10.currentMatrix.excludedPaths, POST_COMMIT_V10_EXCLUDED_PATHS,
    'historical v10 excluded path order is exact without a current inventory comparison');
  return { requiredSummaries, foreignSummaries };
}

function postCommitV13ValidateV10HistoricalRecords(v10, v11, canonicalV10) {
  const reconstructedRecords = postCommitV13ReconstructedV10Records(v10);
  const opaqueCommitments = postCommitV13ValidateV10OpaqueCollections(v10, v11, canonicalV10);
  const parserRecord = reconstructedRecords.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  const parserCapture = v10.identityContract.parserSelfCapture;
  assertExactOrderedKeys(parserCapture, [
    'captureMode', 'retainedPinNames', ...POST_COMMIT_V9_FULL_RECORD_FIELDS,
    'hunkSequenceSha256', 'identitySha256'
  ], 'historical v10 parser self-capture');
  assert.deepEqual(Object.fromEntries(POST_COMMIT_V9_FULL_RECORD_FIELDS
    .map((field) => [field, parserCapture[field]])), parserRecord,
  'historical v10 parser self-capture remains the exact reconstructed record');
  assert.equal(parserCapture.hunkSequenceSha256, sha256(JSON.stringify(parserRecord.hunkBodySha256)),
    'historical v10 parser hunk sequence remains exact');
  assert.equal(parserCapture.identitySha256, sha256(JSON.stringify(parserRecord)),
    'historical v10 parser full-record identity remains exact');
  return { reconstructedRecords, opaqueCommitments };
}

function postCommitV13ReconstructedV11Records(v11) {
  const additiveByPath = new Map(v11.currentMatrix.additiveForeignFullRecords
    .map((record) => [record.path, record]));
  assert.equal(additiveByPath.size, POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS.length,
    'historical v11 additive full records have exact unique cardinality');
  assert.deepEqual(v11.currentMatrix.additiveForeignFullRecords.map(({ path }) => path),
    POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS,
  'historical v11 additive full-record order is exact');
  const reconstruct = (summary) => {
    if (summary.path === COLLISION_PARSER_PATH) {
      return postCommitV13HistoricalV11ParserRecord(summary);
    }
    if (summary.status === '') {
      return historicalCleanFullRecord(summary, POST_COMMIT_V11_REQUIRED_HEAD, {
        expectedRequiredHead: POST_COMMIT_V11_REQUIRED_HEAD
      });
    }
    const additive = additiveByPath.get(summary.path);
    if (!additive) return null;
    assertExactOrderedKeys(additive, POST_COMMIT_V9_FULL_RECORD_FIELDS,
      `historical v11 additive full record ${summary.path}`);
    assertPostCommitV11Summary(summary, additive,
      `historical v11 additive full record ${summary.path}`);
    return structuredClone(additive);
  };
  return {
    requiredRecords: v11.currentMatrix.requiredRecords.map(reconstruct).filter(Boolean),
    foreignRecords: v11.currentMatrix.foreignRecords.map(reconstruct).filter(Boolean)
  };
}

function postCommitV13ValidateV11OpaqueCollections(v11, v12, canonicalV11) {
  const reconstructedRequiredPaths = [
    COLLISION_PARSER_PATH,
    ...v11.currentMatrix.requiredRecords.filter(({ status }) => status === '').map(({ path }) => path)
  ];
  const reconstructedForeignPaths = [
    ...v11.currentMatrix.foreignRecords.filter(({ status }) => status === '').map(({ path }) => path),
    ...POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS
  ];
  const requiredSummaries = validatePostCommitHistoricalOpaqueSummaryCollection({
    label: 'historical v11 required summaries',
    summaries: v11.currentMatrix.requiredRecords,
    canonicalSummaries: canonicalV11.currentMatrix.requiredRecords,
    expectedPaths: REQUIRED_SCOPE_ONE_PATHS,
    reconstructedPaths: reconstructedRequiredPaths,
    successorCommitments: v12.currentMatrix.requiredRecordCommitments,
    successorRequiredMetadata: v12.currentMatrix.requiredRecordSharedContract
  });
  const foreignSummaries = validatePostCommitHistoricalOpaqueSummaryCollection({
    label: 'historical v11 foreign summaries',
    summaries: v11.currentMatrix.foreignRecords,
    canonicalSummaries: canonicalV11.currentMatrix.foreignRecords,
    expectedPaths: POST_COMMIT_V11_FOREIGN_PATHS,
    reconstructedPaths: reconstructedForeignPaths,
    successorCommitments: v12.currentMatrix.foreignRecordCommitments,
    foreign: true
  });
  assert.deepEqual(v11.currentMatrix.excludedPaths, POST_COMMIT_V11_EXCLUDED_PATHS,
    'historical v11 excluded path order is exact without a current inventory comparison');
  return { requiredSummaries, foreignSummaries };
}

function postCommitV13ValidateV11HistoricalRecords(v11, v12, canonicalV11) {
  const reconstructedRecords = postCommitV13ReconstructedV11Records(v11);
  const opaqueCommitments = postCommitV13ValidateV11OpaqueCollections(v11, v12, canonicalV11);
  for (const record of reconstructedRecords.requiredRecords) {
    const summary = v11.currentMatrix.requiredRecords.find(({ path }) => path === record.path);
    assertPostCommitV11Summary(summary, record,
      `historical v11 reconstructed required record ${record.path}`);
  }
  const parserRecord = reconstructedRecords.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  const parserCapture = v11.identityContract.parserSelfCapture;
  assert.deepEqual(Object.fromEntries(POST_COMMIT_V9_FULL_RECORD_FIELDS
    .map((field) => [field, parserCapture[field]])), parserRecord,
  'historical v11 parser self-capture remains the exact reconstructed record');
  assert.equal(parserCapture.hunkSequenceSha256, sha256(JSON.stringify(parserRecord.hunkBodySha256)),
    'historical v11 parser hunk sequence remains exact');
  assert.equal(parserCapture.identitySha256, sha256(JSON.stringify(parserRecord)),
    'historical v11 parser full-record identity remains exact');
  return { reconstructedRecords, opaqueCommitments };
}

validatePostCommitV10AsV11History = function (v10, v9, v7, v6, v5, v4, durable) {
  const { v10Block, v11Block } = postCommitV13HistoricalBlocks();
  const activeObservedV9 = postCommitV9ObservedIdentityFromV10Source;
  postCommitV9ObservedIdentityFromV10Source = postCommitV9ObservedIdentityFromV10SourceAsV12History;
  try {
    return withPostCommitV10HistoricalHead(() => {
      validatePostCommitV10(v10, v9, v7, v6, v5, v4, durable, v10Block.value, false);
      return postCommitV13ValidateV10HistoricalRecords(v10, v11Block.value, v10Block.value);
    });
  } finally {
    postCommitV9ObservedIdentityFromV10Source = activeObservedV9;
  }
};

validatePostCommitV11AsV12History = function (v11, v10, v9, v7, v6, v5, v4, durable) {
  const { v11Block, v12Block } = postCommitV13HistoricalBlocks();
  validatePostCommitV10AsV11History(v10, v9, v7, v6, v5, v4, durable);
  return withPostCommitV10HistoricalHead(() => {
    validatePostCommitV11(v11, v10, v9, v7, v6, v5, v4, durable, v11Block.value, false);
    return postCommitV13ValidateV11HistoricalRecords(v11, v12Block.value, v11Block.value);
  });
};

function postCommitV13HistoricalCapturedBytes(captured) {
  const bytes = execFileSync('git', ['cat-file', 'blob', captured.worktreeGitOid], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'ignore']
  });
  assert.ok(Buffer.isBuffer(bytes), `${captured.path} captured v10 bytes are binary-safe`);
  assert.equal(execFileSync('git', ['hash-object', '--stdin'], {
    cwd: ROOT,
    encoding: 'utf8',
    input: bytes
  }).trim(), captured.worktreeGitOid,
  `${captured.path} historical byte candidate matches the captured v10 Git OID`);
  assert.equal(sha256(bytes), captured.worktreeSha256,
    `${captured.path} historical byte candidate matches the captured v10 SHA-256`);
  return bytes;
}

  function assertPostCommitV13V10OpaqueMutationFails(label, mutate) {
    const { v10Block, v11Block } = postCommitV13HistoricalBlocks();
    const v10 = structuredClone(v10Block.value);
    const v11 = structuredClone(v11Block.value);
    mutate(v10, v11);
    assert.throws(() => postCommitV13ValidateV10OpaqueCollections(
      v10, v11, v10Block.value), label);
  }

  function assertPostCommitV13V11OpaqueMutationFails(label, mutate) {
    const { v11Block, v12Block } = postCommitV13HistoricalBlocks();
    const v11 = structuredClone(v11Block.value);
    const v12 = structuredClone(v12Block.value);
    mutate(v11, v12);
    assert.throws(() => postCommitV13ValidateV11OpaqueCollections(
      v11, v12, v11Block.value), label);
  }

  runPostCommitV10AdversarialCasesAsV11History = function () {
    const {
      report, durable, v4Block, v5Block, v6Block, v7Block, v9Block, v10Block, v11Block
    } = postCommitV13HistoricalBlocks();
    runPostCommitV9AdversarialCasesAsV10History(v10Block.value);
    assert.throws(() => parseReportBlock(`${report}\n${v10Block.raw}`, POST_COMMIT_V10_MARKER),
      'historical duplicate v10 report block fails closed');
    assert.throws(() => parseReportBlock(report.replace(v10Block.raw, ''), POST_COMMIT_V10_MARKER),
      'historical missing v10 report block fails closed');
    assert.throws(() => parseReportBlock(report.replace(v10Block.raw,
      v10Block.raw.replace('```json\n{', '```json\n{ malformed')), POST_COMMIT_V10_MARKER),
    'historical malformed v10 report block fails closed');
    assert.throws(() => assertPinnedReportBlock(`${v10Block.raw} `, POST_COMMIT_V10_BLOCK_SHA256,
      'historical mutated v10 block'), 'historical v10 raw pin drift fails closed');
    assertEveryClosedSchemaMutationFails(v10Block.value,
      (candidate) => validatePostCommitV10(candidate, v9Block.value, v7Block.value, v6Block.value,
        v5Block.value, v4Block.value, durable.value, v10Block.value, false),
      'historical post-commit v10 block');
    validatePostCommitV10AsV11History(v10Block.value, v9Block.value, v7Block.value,
      v6Block.value, v5Block.value, v4Block.value, durable.value);

    const requiredOpaqueIndex = v10Block.value.currentMatrix.requiredRecords.findIndex(
      ({ path, status }) => path !== COLLISION_PARSER_PATH && status !== '');
    const foreignOpaqueIndex = 0;
    const collectionCases = [
      ['historical v10 missing opaque required path', (v10) => { v10.currentMatrix.requiredRecords.pop(); }],
      ['historical v10 extra opaque required path', (v10) => {
        v10.currentMatrix.requiredRecords.push(structuredClone(v10.currentMatrix.requiredRecords[requiredOpaqueIndex]));
      }],
      ['historical v10 duplicate opaque required path', (v10) => {
        v10.currentMatrix.requiredRecords[requiredOpaqueIndex + 1] =
          structuredClone(v10.currentMatrix.requiredRecords[requiredOpaqueIndex]);
      }],
      ['historical v10 reordered required paths', (v10) => { v10.currentMatrix.requiredRecords.reverse(); }],
      ['historical v10 missing opaque foreign path', (v10) => { v10.currentMatrix.foreignRecords.pop(); }],
      ['historical v10 extra opaque foreign path', (v10) => {
        v10.currentMatrix.foreignRecords.push(structuredClone(v10.currentMatrix.foreignRecords[0]));
      }],
      ['historical v10 duplicate opaque foreign path', (v10) => {
        v10.currentMatrix.foreignRecords[1] = structuredClone(v10.currentMatrix.foreignRecords[0]);
      }],
      ['historical v10 reordered foreign paths', (v10) => { v10.currentMatrix.foreignRecords.reverse(); }]
    ];
    collectionCases.forEach(([label, mutate]) =>
      assertPostCommitV13V10OpaqueMutationFails(label, mutate));
    for (const field of [
      'path', 'pathKind', 'classification', 'ownerAttribution', 'feature004OwnershipClaim',
      'transitionClass', 'status', 'hunkCount', 'hunkSequenceSha256', 'identitySha256'
    ]) {
      assertPostCommitV13V10OpaqueMutationFails(`historical v10 opaque mutation ${field} fails closed`,
        (v10) => {
          const summary = field === 'classification' || field === 'ownerAttribution'
            || field === 'feature004OwnershipClaim'
            ? v10.currentMatrix.foreignRecords[foreignOpaqueIndex]
            : v10.currentMatrix.requiredRecords[requiredOpaqueIndex];
          summary[field] = changedLeafValue(summary[field]);
        });
    }
    assertPostCommitV13V10OpaqueMutationFails('historical v10 successor cross-link drift fails closed',
      (_v10, v11) => {
        const path = v10Block.value.currentMatrix.requiredRecords[requiredOpaqueIndex].path;
        v11.currentMatrix.requiredRecords.find((summary) => summary.path === path).identitySha256 =
          '0'.repeat(64);
      });
    for (const [label, mutate] of [
      ['historical v10 wrong required HEAD', (value) => { value.requiredHead = '0'.repeat(40); }],
      ['historical v10 reordered porcelain contract', (value) => {
        value.inventoryProof.porcelainPathOrder.reverse();
      }],
      ['historical v10 ownership inference', (value) => {
        value.inventoryProof.pathClassification.ownershipInferredFromDirtiness = true;
      }],
      ['historical v10 semantic inference', (value) => { value.currentMatrix.semanticApproval = true; }],
      ['historical v10 parser order drift', (value) => { value.parserOrder.reverse(); }]
    ]) {
      const candidate = structuredClone(v10Block.value);
      mutate(candidate);
      assert.throws(() => validatePostCommitV10(candidate, v9Block.value, v7Block.value,
        v6Block.value, v5Block.value, v4Block.value, durable.value, v10Block.value, false), label);
    }
    for (const excludedPaths of [
      [V7_LOCK_FILE_EXCLUSION],
      [...POST_COMMIT_V10_EXCLUDED_PATHS, 'docs/Unexpected.md'],
      [...POST_COMMIT_V10_EXCLUDED_PATHS].reverse(),
      [REPORT_PATH, v10Block.value.currentMatrix.foreignRecords[0].path]
    ]) {
      assertPostCommitV13V10OpaqueMutationFails('historical v10 exclusion mutation fails closed',
        (v10) => { v10.currentMatrix.excludedPaths = excludedPaths; });
    }
    const clean = v10Block.value.currentMatrix.requiredRecords[9];
    assert.throws(() => historicalCleanFullRecord(clean, POST_COMMIT_V10_REQUIRED_HEAD, {
      bytes: readFileSync(resolve(ROOT, clean.path))
    }), 'historical v10 clean record rejects live-byte substitution');
    const parserSummary = v10Block.value.currentMatrix.requiredRecords
      .find(({ path }) => path === COLLISION_PARSER_PATH);
    const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
    assert.throws(() => assertPostCommitV10Summary(parserSummary,
      postCommitV13HistoricalV10ParserRecord(parserSummary, parserSource.replace(
        "const REPORT_PATH = '", "const REPORT_PATH = './")),
    'historical v10 mutated parser reconstruction'),
    'historical v10 parser reconstruction rejects non-adoption source drift');
    assertPostCommitV10PinValue(parserSource);
    assert.throws(() => assertPostCommitV10PinValue(parserSource.replace(
      POST_COMMIT_V10_BLOCK_SHA256, '7'.repeat(64))),
    'historical v10 parser rejects changed pin authority');
    assert.throws(() => stripPostCommitV10Source(parserSource.replace(
      `\n${POST_COMMIT_V10_HELPER_END}\n`, `\n${POST_COMMIT_V10_HELPER_BEGIN}\n`)),
    'historical v10 parser branch mutation fails closed');
    assert.throws(() => postCommitV13HistoricalCapturedBytes({
      path: v10Block.value.currentMatrix.requiredRecords[requiredOpaqueIndex].path,
      worktreeGitOid: '0'.repeat(40),
      worktreeSha256: '0'.repeat(64)
    }), 'historical unavailable blob never falls back to live bytes');
  };

  runPostCommitV11AdversarialCasesAsV12History = function () {
    const {
      report, durable, v4Block, v5Block, v6Block, v7Block, v9Block,
      v10Block, v11Block, v12Block
    } = postCommitV13HistoricalBlocks();
    runPostCommitV10AdversarialCasesAsV11History();
    assert.throws(() => parseReportBlock(`${report}\n${v11Block.raw}`, POST_COMMIT_V11_MARKER),
      'historical duplicate v11 report block fails closed');
    assert.throws(() => parseReportBlock(report.replace(v11Block.raw, ''), POST_COMMIT_V11_MARKER),
      'historical missing v11 report block fails closed');
    assert.throws(() => parseReportBlock(report.replace(v11Block.raw,
      v11Block.raw.replace('```json\n{', '```json\n{ malformed')), POST_COMMIT_V11_MARKER),
    'historical malformed v11 report block fails closed');
    assert.throws(() => assertPinnedReportBlock(`${v11Block.raw} `, POST_COMMIT_V11_BLOCK_SHA256,
      'historical mutated v11 block'), 'historical v11 raw pin drift fails closed');
    assertEveryClosedSchemaMutationFails(v11Block.value,
      (candidate) => validatePostCommitV11(candidate, v10Block.value, v9Block.value,
        v7Block.value, v6Block.value, v5Block.value, v4Block.value, durable.value,
        v11Block.value, false), 'historical post-commit v11 block');
    validatePostCommitV11AsV12History(v11Block.value, v10Block.value, v9Block.value,
      v7Block.value, v6Block.value, v5Block.value, v4Block.value, durable.value);

    const requiredOpaqueIndex = v11Block.value.currentMatrix.requiredRecords.findIndex(
      ({ path, status }) => path !== COLLISION_PARSER_PATH && status !== '');
    const foreignOpaqueIndex = v11Block.value.currentMatrix.foreignRecords.findIndex(
      ({ path }) => !POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS.includes(path));
    for (const [label, mutate] of [
      ['historical v11 missing opaque required path', (v11) => { v11.currentMatrix.requiredRecords.pop(); }],
      ['historical v11 extra opaque required path', (v11) => {
        v11.currentMatrix.requiredRecords.push(structuredClone(v11.currentMatrix.requiredRecords[requiredOpaqueIndex]));
      }],
      ['historical v11 duplicate opaque required path', (v11) => {
        v11.currentMatrix.requiredRecords[requiredOpaqueIndex + 1] =
          structuredClone(v11.currentMatrix.requiredRecords[requiredOpaqueIndex]);
      }],
      ['historical v11 reordered required paths', (v11) => { v11.currentMatrix.requiredRecords.reverse(); }],
      ['historical v11 missing opaque foreign path', (v11) => { v11.currentMatrix.foreignRecords.pop(); }],
      ['historical v11 extra opaque foreign path', (v11) => {
        v11.currentMatrix.foreignRecords.push(structuredClone(v11.currentMatrix.foreignRecords[foreignOpaqueIndex]));
      }],
      ['historical v11 duplicate opaque foreign path', (v11) => {
        v11.currentMatrix.foreignRecords[foreignOpaqueIndex + 1] =
          structuredClone(v11.currentMatrix.foreignRecords[foreignOpaqueIndex]);
      }],
      ['historical v11 reordered foreign paths', (v11) => { v11.currentMatrix.foreignRecords.reverse(); }]
    ]) assertPostCommitV13V11OpaqueMutationFails(label, mutate);
    for (const field of [
      'path', 'pathKind', 'classification', 'ownerAttribution', 'feature004OwnershipClaim',
      'transitionClass', 'status', 'hunkCount', 'hunkSequenceSha256', 'identitySha256'
    ]) {
      assertPostCommitV13V11OpaqueMutationFails(`historical v11 opaque mutation ${field} fails closed`,
        (v11) => {
          const summary = field === 'classification' || field === 'ownerAttribution'
            || field === 'feature004OwnershipClaim'
            ? v11.currentMatrix.foreignRecords[foreignOpaqueIndex]
            : v11.currentMatrix.requiredRecords[requiredOpaqueIndex];
          summary[field] = changedLeafValue(summary[field]);
        });
    }
    assertPostCommitV13V11OpaqueMutationFails('historical v11 required successor cross-link fails closed',
      (_v11, v12) => {
        const path = v11Block.value.currentMatrix.requiredRecords[requiredOpaqueIndex].path;
        v12.currentMatrix.requiredRecordCommitments.find((entry) => entry.path === path).identitySha256 =
          '0'.repeat(64);
      });
    for (const [field, value] of [
      ['classification', 'changed-classification'],
      ['ownerAttribution', 'changed-owner'],
      ['identitySha256', '0'.repeat(64)]
    ]) {
      assertPostCommitV13V11OpaqueMutationFails(
        `historical v11 foreign successor ${field} cross-link fails closed`, (_v11, v12) => {
          const path = v11Block.value.currentMatrix.foreignRecords[foreignOpaqueIndex].path;
          v12.currentMatrix.foreignRecordCommitments.find((entry) => entry.path === path)[field] = value;
        });
    }
    for (const field of POST_COMMIT_V9_FULL_RECORD_FIELDS) {
      const summary = v11Block.value.currentMatrix.foreignRecords.find(({ path }) =>
        path === POST_COMMIT_V11_ADDITIVE_FOREIGN_PATHS[0]);
      const record = structuredClone(v11Block.value.currentMatrix.additiveForeignFullRecords[0]);
      if (field === 'hunkBodySha256') {
        record[field] = record[field].length === 0 ? ['0'.repeat(64)]
          : record[field].map((value, index) => index === 0 ? '0'.repeat(64) : value);
      } else {
        record[field] = changedLeafValue(record[field]);
      }
      assert.throws(() => assertPostCommitV11Summary(summary, record,
        `historical v11 additive full-record mutation ${field}`),
      `historical v11 additive full record rejects changed ${field}`);
    }
    for (const [label, mutate] of [
      ['historical v11 wrong required HEAD', (value) => { value.requiredHead = '0'.repeat(40); }],
      ['historical v11 reordered additive records', (value) => {
        value.currentMatrix.additiveForeignFullRecords.reverse();
      }],
      ['historical v11 ownership inference', (value) => {
        value.inventoryProof.pathClassification.ownershipInferredFromHistory = true;
      }],
      ['historical v11 certification inference', (value) => {
        value.inferenceContract.certification = true;
      }],
      ['historical v11 parser order drift', (value) => { value.parserOrder.reverse(); }]
    ]) {
      const candidate = structuredClone(v11Block.value);
      mutate(candidate);
      assert.throws(() => validatePostCommitV11(candidate, v10Block.value, v9Block.value,
        v7Block.value, v6Block.value, v5Block.value, v4Block.value, durable.value,
        v11Block.value, false), label);
    }
    for (const excludedPaths of [
      [V7_LOCK_FILE_EXCLUSION],
      [...POST_COMMIT_V11_EXCLUDED_PATHS, 'docs/Unexpected.md'],
      [...POST_COMMIT_V11_EXCLUDED_PATHS].reverse(),
      [REPORT_PATH, v11Block.value.currentMatrix.foreignRecords[0].path]
    ]) {
      assertPostCommitV13V11OpaqueMutationFails('historical v11 exclusion mutation fails closed',
        (v11) => { v11.currentMatrix.excludedPaths = excludedPaths; });
    }
    const clean = v11Block.value.currentMatrix.requiredRecords[9];
    assert.throws(() => historicalCleanFullRecord(clean, POST_COMMIT_V11_REQUIRED_HEAD, {
      bytes: readFileSync(resolve(ROOT, clean.path))
    }), 'historical v11 clean record rejects live-byte substitution');
    const parserSummary = v11Block.value.currentMatrix.requiredRecords
      .find(({ path }) => path === COLLISION_PARSER_PATH);
    const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
    assert.throws(() => assertPostCommitV11Summary(parserSummary,
      postCommitV13HistoricalV11ParserRecord(parserSummary, parserSource.replace(
        "const REPORT_PATH = '", "const REPORT_PATH = './")),
    'historical v11 mutated parser reconstruction'),
    'historical v11 parser reconstruction rejects non-adoption source drift');
    assertPostCommitV11PinValue(parserSource);
    assert.throws(() => assertPostCommitV11PinValue(parserSource.replace(
      POST_COMMIT_V11_BLOCK_SHA256, '8'.repeat(64))),
    'historical v11 parser rejects changed pin authority');
    assert.throws(() => stripPostCommitV11Source(parserSource.replace(
      `\n${POST_COMMIT_V11_HELPER_END}\n`, `\n${POST_COMMIT_V11_HELPER_BEGIN}\n`)),
    'historical v11 parser branch mutation fails closed');
    assert.deepEqual(v12Block.value.currentMatrix.requiredRecordCommitments.map(({ path }) => path),
      REQUIRED_SCOPE_ONE_PATHS, 'historical v11 required summaries retain exact v12 successor paths');
  };

const parseCollisionContractsBeforePostCommitV13 = parseCollisionContracts;
const runPostCommitV12AdversarialCasesBeforePostCommitV13 = runPostCommitV12AdversarialCases;

function parsePostCommitV12AsV13History() {
  const activeValidator = validatePostCommitV12;
  const previousLogged = postCommitV12ValidationLogged;
  validatePostCommitV12 = (...args) => {
    assert.equal(args.length, 9,
      'the inherited v12 parser invokes its validator with the exact predecessor argument set');
    return activeValidator(...args, args[0], false);
  };
  postCommitV12ValidationLogged = true;
  try {
    return parseCollisionContractsBeforePostCommitV13();
  } finally {
    validatePostCommitV12 = activeValidator;
    postCommitV12ValidationLogged = previousLogged;
  }
}

function parsePostCommitV13Authority() {
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const reportContext = captureV13ReportBlockContext(reportBytes);
  assert.equal(reportContext.startByte, POST_COMMIT_V13_REPORT_PREFIX_BYTE_LENGTH,
    'v13 report prefix byte length is exact');
  assert.equal(sha256(reportContext.prefixBytes), POST_COMMIT_V13_REPORT_PREFIX_SHA256,
    'v13 report prefix SHA-256 is exact');
  assert.equal(reportContext.blockBytes.length, POST_COMMIT_V13_BLOCK_BYTE_LENGTH,
    'v13 raw marker-inclusive block byte length is exact');
  assert.equal(sha256(reportContext.blockBytes), POST_COMMIT_V13_BLOCK_SHA256,
    'v13 raw marker-inclusive block SHA-256 is exact and independent of normalized self hashing');
  const decoded = decodeCaptureV13Block(reportContext.block);
  assert.equal(decoded.outer.markerInclusiveByteLength, POST_COMMIT_V13_BLOCK_BYTE_LENGTH,
    'v13 envelope marker-inclusive byte length is pinned');
  assert.equal(decoded.outer.compressedPayloadSha256.join(''),
    POST_COMMIT_V13_COMPRESSED_PAYLOAD_SHA256,
  'v13 compressed payload SHA-256 is pinned');
  assert.equal(decoded.outer.compressedPayloadByteLength,
    POST_COMMIT_V13_COMPRESSED_PAYLOAD_BYTE_LENGTH,
  'v13 compressed payload byte length is pinned');
  assert.equal(decoded.outer.payloadSha256.join(''), POST_COMMIT_V13_PAYLOAD_SHA256,
    'v13 decoded payload SHA-256 is pinned');
  assert.equal(decoded.outer.payloadByteLength, POST_COMMIT_V13_PAYLOAD_BYTE_LENGTH,
    'v13 decoded payload byte length is pinned');
  assert.equal(decoded.outer.normalizedSelfSha256.join(''),
    POST_COMMIT_V13_NORMALIZED_SELF_SHA256,
  'v13 normalized outer self SHA-256 is pinned independently of the raw block hash');
  captureV13AssertExact(decoded.payload.reportPrefix, {
    startByte: 0,
    endByteExclusive: POST_COMMIT_V13_REPORT_PREFIX_BYTE_LENGTH,
    byteLength: POST_COMMIT_V13_REPORT_PREFIX_BYTE_LENGTH,
    contentSha256: POST_COMMIT_V13_REPORT_PREFIX_SHA256,
    boundary: 'byte-immediately-before-v13-start-marker'
  }, 'payload.reportPrefix');
  return { reportContext, decoded };
}

function postCommitV13FixtureGit(directory, args, options = {}) {
  return execFileSync('git', ['--no-optional-locks', '--no-replace-objects', ...args], {
    cwd: directory,
    env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1', GIT_OPTIONAL_LOCKS: '0' },
    ...options
  });
}

function postCommitV13FixtureGitText(directory, args, options = {}) {
  return postCommitV13FixtureGit(directory, args, { encoding: 'utf8', ...options });
}

function postCommitV13WithFixture(run) {
  const directory = mkdtempSync(resolve(tmpdir(), 'feature004-v13-'));
  try {
    postCommitV13FixtureGit(directory, ['init', '--quiet']);
    postCommitV13FixtureGit(directory, ['config', 'user.name', 'Feature 004 V13 Fixture']);
    postCommitV13FixtureGit(directory, ['config', 'user.email', 'feature004-v13@example.invalid']);
    return run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function postCommitV13FixtureCommit(directory, message, paths = null) {
  const addArgs = paths === null ? ['add', '--all'] : ['add', '--', ...paths];
  postCommitV13FixtureGit(directory, addArgs);
  postCommitV13FixtureGit(directory, ['commit', '--quiet', '-m', message]);
  return postCommitV13FixtureGitText(directory, ['rev-parse', 'HEAD']).trim();
}

function postCommitV13FixtureTreeEntry(directory, revision, path) {
  const raw = postCommitV13FixtureGit(directory, [
    'ls-tree', '--full-tree', '-z', revision, '--', path
  ]);
  const tokens = captureV13SplitNul(raw, `${revision}:${path} fixture tree entry`);
  assert.ok(tokens.length <= 1, `${revision}:${path} fixture tree entry is unique`);
  if (tokens.length === 0) return { present: false, mode: null, type: null, oid: null };
  const tab = tokens[0].indexOf(0x09);
  assert.ok(tab > 0, `${revision}:${path} fixture tree entry is complete`);
  const [mode, type, oid] = tokens[0].subarray(0, tab).toString('ascii').split(' ');
  assert.equal(tokens[0].subarray(tab + 1).toString('utf8'), path,
    `${revision}:${path} fixture tree lookup is exact-path only`);
  return { present: true, mode, type, oid };
}

function postCommitV13FixtureIndexEntry(directory, path) {
  const tokens = captureV13SplitNul(postCommitV13FixtureGit(directory, [
    'ls-files', '--stage', '-z', '--', path
  ]), `${path} fixture index entry`);
  const entries = tokens.map((token) => {
    const tab = token.indexOf(0x09);
    const [mode, oid, stage] = token.subarray(0, tab).toString('ascii').split(' ');
    assert.equal(token.subarray(tab + 1).toString('utf8'), path,
      `${path} fixture index entry is exact-path only`);
    return { mode, type: captureV13ObjectTypeForMode(mode), oid, stage: Number(stage), path };
  });
  return { present: entries.length > 0, entries };
}

function postCommitV13FixtureLstat(directory, path) {
  const stat = lstatSync(resolve(directory, path));
  return {
    present: true,
    kind: stat.isFile() ? 'regular' : stat.isSymbolicLink() ? 'symlink' : 'unsupported',
    mode: (stat.mode & 0o177777).toString(8).padStart(6, '0'),
    executable: (stat.mode & 0o111) !== 0,
    symlink: stat.isSymbolicLink()
  };
}

function postCommitV13FixtureWorktreeBytes(directory, path, lstat) {
  if (lstat.kind === 'regular') return readFileSync(resolve(directory, path));
  if (lstat.kind === 'symlink') return readlinkSync(resolve(directory, path), { encoding: 'buffer' });
  throw new Error(`${path} fixture has unsupported worktree kind ${lstat.kind}`);
}

function postCommitV13FixtureBlobOid(directory, bytes) {
  return postCommitV13FixtureGitText(directory, ['hash-object', '--stdin'], { input: bytes }).trim();
}

function postCommitV13FixtureIndexFlags(indexEntry) {
  if (!indexEntry.present) {
    return {
      present: false,
      rawDebugFlags: [],
      lsFilesVTags: [],
      lsFilesTTags: [],
      assumeUnchanged: false,
      skipWorktree: false,
      intentToAdd: false,
      sparse: false,
      otherNonDefaultMasks: []
    };
  }
  return {
    present: true,
    rawDebugFlags: ['0'],
    lsFilesVTags: ['H'],
    lsFilesTTags: ['H'],
    assumeUnchanged: false,
    skipWorktree: false,
    intentToAdd: false,
    sparse: false,
    otherNonDefaultMasks: []
  };
}

function postCommitV13FixtureNumstat(path, additions = 0, deletions = 0) {
  return { present: true, additions, deletions, binary: false, path };
}

function postCommitV13FixtureCapturedRecord(directory, {
  path,
  rawStatus,
  capturedHead,
  promotionCandidate = true
}) {
  const headEntry = postCommitV13FixtureTreeEntry(directory, capturedHead, path);
  const indexEntry = postCommitV13FixtureIndexEntry(directory, path);
  const worktreeLstat = postCommitV13FixtureLstat(directory, path);
  const worktreeBytes = postCommitV13FixtureWorktreeBytes(directory, path, worktreeLstat);
  const staged = rawStatus !== '??' && rawStatus[0] !== ' ';
  const unstaged = rawStatus === '??' || rawStatus[1] !== ' ';
  const record = {
    path,
    pathKind: headEntry.present || indexEntry.present ? 'tracked' : 'untracked',
    classification: 'foreign-fixture',
    ownerAttribution: 'v13-adversarial-fixture',
    feature004OwnershipClaim: false,
    transitionClass: rawStatus === '??' ? 'untracked-exact-identity' : 'still-dirty-exact-identity',
    rawStatus,
    staged,
    unstaged,
    headEntry,
    indexEntry,
    worktreeLstat,
    worktreeGitBlobOid: postCommitV13FixtureBlobOid(directory, worktreeBytes),
    contentSha256: sha256(worktreeBytes),
    byteLength: worktreeBytes.length,
    stagedNumstat: postCommitV13FixtureNumstat(path, staged ? 1 : 0, staged ? 1 : 0),
    unstagedNumstat: postCommitV13FixtureNumstat(path, unstaged ? 1 : 0, unstaged ? 1 : 0),
    stagedHunks: staged ? [{ header: '@@ -1 +1 @@', additionCount: 1, deletionCount: 1, bodySha256: sha256('staged') }] : [],
    unstagedHunks: unstaged && rawStatus !== '??'
      ? [{ header: '@@ -1 +1 @@', additionCount: 1, deletionCount: 1, bodySha256: sha256('unstaged') }] : [],
    indexFlags: postCommitV13FixtureIndexFlags(indexEntry),
    lastCommit: headEntry.present
      ? postCommitV13FixtureGitText(directory, [
        'log', '--no-renames', '-1', '--format=%H', capturedHead, '--', path
      ]).trim() : null,
    promotionEligibility: null,
    promotionEligibilityReason: null
  };
  Object.assign(record, captureV13Promotion(record, promotionCandidate));
  captureV13AssertExact(Object.keys(record), FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS,
    `${path} fixture captured-record field order`);
  return record;
}

function postCommitV13FixtureCleanRecord(directory, captured, currentHead, lastCommit) {
  const headEntry = postCommitV13FixtureTreeEntry(directory, currentHead, captured.path);
  const indexEntry = postCommitV13FixtureIndexEntry(directory, captured.path);
  const worktreeLstat = postCommitV13FixtureLstat(directory, captured.path);
  const worktreeBytes = postCommitV13FixtureWorktreeBytes(
    directory, captured.path, worktreeLstat);
  const record = {
    path: captured.path,
    pathKind: 'tracked',
    classification: captured.classification,
    ownerAttribution: captured.ownerAttribution,
    feature004OwnershipClaim: false,
    transitionClass: 'clean-head-index-promotion',
    rawStatus: '',
    staged: false,
    unstaged: false,
    headEntry,
    indexEntry,
    worktreeLstat,
    worktreeGitBlobOid: postCommitV13FixtureBlobOid(directory, worktreeBytes),
    contentSha256: sha256(worktreeBytes),
    byteLength: worktreeBytes.length,
    stagedNumstat: postCommitV13FixtureNumstat(captured.path),
    unstagedNumstat: postCommitV13FixtureNumstat(captured.path),
    stagedHunks: [],
    unstagedHunks: [],
    indexFlags: postCommitV13FixtureIndexFlags(indexEntry),
    lastCommit,
    promotionEligibility: captured.promotionEligibility,
    promotionEligibilityReason: captured.promotionEligibilityReason
  };
  captureV13AssertExact(Object.keys(record), FEATURE004_CAPTURE_V13_FULL_RECORD_FIELDS,
    `${captured.path} fixture clean-record field order`);
  return record;
}

function postCommitV13FixtureOperations(directory) {
  return {
    assertAncestor(ancestor, descendant, label) {
      try {
        postCommitV13FixtureGit(directory, ['merge-base', '--is-ancestor', ancestor, descendant]);
      } catch (error) {
        if (error?.status === 1) {
          throw new Error(`${label} mismatch: ${ancestor} is not an ancestor of ${descendant}`);
        }
        throw error;
      }
    },
    treeEntry(revision, path) {
      return postCommitV13FixtureTreeEntry(directory, revision, path);
    }
  };
}

function postCommitV13CreateAnchor(directory) {
  writeFileSync(resolve(directory, 'anchor.txt'), 'anchor-0\n', 'utf8');
  return postCommitV13FixtureCommit(directory, 'capture anchor');
}

function postCommitV13AdvanceHead(directory, suffix) {
  writeFileSync(resolve(directory, 'anchor.txt'), `anchor-${suffix}\n`, 'utf8');
  return postCommitV13FixtureCommit(directory, `advance ${suffix}`, ['anchor.txt']);
}

function postCommitV13ExercisePromotionFixture(kind, run) {
  return postCommitV13WithFixture((directory) => {
    const path = `${kind}-candidate.txt`;
    let capturedHead;
    let captured;
    const promotedBytes = Buffer.from(`${kind}-promoted-bytes\n`, 'utf8');
    if (kind === 'untracked') {
      capturedHead = postCommitV13CreateAnchor(directory);
      writeFileSync(resolve(directory, path), promotedBytes);
      postCommitV13ChmodSync(resolve(directory, path), 0o644);
      captured = postCommitV13FixtureCapturedRecord(directory, {
        path, rawStatus: '??', capturedHead
      });
    } else {
      writeFileSync(resolve(directory, path), `${kind}-old-bytes\n`, 'utf8');
      capturedHead = postCommitV13FixtureCommit(directory, 'tracked capture base');
      writeFileSync(resolve(directory, path), promotedBytes);
      captured = postCommitV13FixtureCapturedRecord(directory, {
        path, rawStatus: ' M', capturedHead
      });
    }
    const lastCommit = postCommitV13FixtureCommit(directory, `promote ${kind}`, [path]);
    const currentHead = postCommitV13AdvanceHead(directory, kind);
    const current = postCommitV13FixtureCleanRecord(
      directory, captured, currentHead, lastCommit);
    return run({
      directory,
      captured,
      current,
      capturedHead,
      lastCommit,
      currentHead,
      operations: postCommitV13FixtureOperations(directory)
    });
  });
}

function runPostCommitV13PlannedAdversarialCases(decoded) {
  const outcomes = [];
  const reject = (id, label, run) => {
    assert.throws(run, label);
    outcomes.push({ id, outcome: 'reject' });
  };
  const accept = (id, label, run) => {
    assert.doesNotThrow(run, label);
    outcomes.push({ id, outcome: 'accept' });
  };

  postCommitV13WithFixture((directory) => {
    const capturedHead = postCommitV13CreateAnchor(directory);
    const path = 'symlink-candidate.txt';
    postCommitV13SymlinkSync('same-bytes', resolve(directory, path));
    const captured = postCommitV13FixtureCapturedRecord(directory, {
      path, rawStatus: '??', capturedHead
    });
    assert.equal(captured.promotionEligibility, 'none',
      'planned case 1 captures the symlink representation as ineligible');
    rmSync(resolve(directory, path));
    writeFileSync(resolve(directory, path), 'same-bytes', 'utf8');
    postCommitV13ChmodSync(resolve(directory, path), 0o644);
    const lastCommit = postCommitV13FixtureCommit(directory, 'symlink to regular', [path]);
    const current = postCommitV13FixtureCleanRecord(directory, captured, lastCommit, lastCommit);
    reject(1, 'planned case 1 rejects symlink-to-regular promotion with equal link-target bytes', () =>
      captureV13ValidateForeignRecordBranch(captured, current, capturedHead, lastCommit,
        'planned case 1', postCommitV13FixtureOperations(directory)));
  });

  postCommitV13WithFixture((directory) => {
    const capturedHead = postCommitV13CreateAnchor(directory);
    const path = 'executable-candidate.txt';
    writeFileSync(resolve(directory, path), 'same-executable-bytes\n', 'utf8');
    postCommitV13ChmodSync(resolve(directory, path), 0o755);
    const captured = postCommitV13FixtureCapturedRecord(directory, {
      path, rawStatus: '??', capturedHead
    });
    assert.equal(captured.promotionEligibility, 'none',
      'planned case 2 captures the executable representation as ineligible');
    postCommitV13ChmodSync(resolve(directory, path), 0o644);
    const lastCommit = postCommitV13FixtureCommit(directory, 'executable to regular', [path]);
    const current = postCommitV13FixtureCleanRecord(directory, captured, lastCommit, lastCommit);
    reject(2, 'planned case 2 rejects executable-to-regular promotion with equal bytes', () =>
      captureV13ValidateForeignRecordBranch(captured, current, capturedHead, lastCommit,
        'planned case 2', postCommitV13FixtureOperations(directory)));
  });

  postCommitV13WithFixture((directory) => {
    const path = 'mixed-candidate.txt';
    writeFileSync(resolve(directory, path), 'mixed-old\n', 'utf8');
    const capturedHead = postCommitV13FixtureCommit(directory, 'mixed base');
    writeFileSync(resolve(directory, path), 'mixed-staged\n', 'utf8');
    postCommitV13FixtureGit(directory, ['add', '--', path]);
    writeFileSync(resolve(directory, path), 'mixed-worktree\n', 'utf8');
    const captured = postCommitV13FixtureCapturedRecord(directory, {
      path, rawStatus: 'MM', capturedHead
    });
    assert.equal(captured.promotionEligibility, 'none',
      'planned case 3 captures staged and mixed state as ineligible');
    const lastCommit = postCommitV13FixtureCommit(directory, 'mixed to clean', [path]);
    const current = postCommitV13FixtureCleanRecord(directory, captured, lastCommit, lastCommit);
    reject(3, 'planned case 3 rejects staged or mixed promotion', () =>
      captureV13ValidateForeignRecordBranch(captured, current, capturedHead, lastCommit,
        'planned case 3', postCommitV13FixtureOperations(directory)));
  });

  postCommitV13ExercisePromotionFixture('untracked', (fixture) => {
    accept(4, 'planned case 4 accepts one exact eligible untracked promotion', () =>
      assert.equal(captureV13ValidateForeignRecordBranch(
        fixture.captured, fixture.current, fixture.capturedHead, fixture.currentHead,
        'planned case 4', fixture.operations), 'exact-clean-promotion'));
  });

  postCommitV13ExercisePromotionFixture('unstaged', (fixture) => {
    accept(5, 'planned case 5 accepts one exact eligible unstaged promotion', () =>
      assert.equal(captureV13ValidateForeignRecordBranch(
        fixture.captured, fixture.current, fixture.capturedHead, fixture.currentHead,
        'planned case 5', fixture.operations), 'exact-clean-promotion'));
  });

  postCommitV13ExercisePromotionFixture('no-lineage', (fixture) => {
    const emptyTree = postCommitV13FixtureGitText(fixture.directory, ['mktree'], { input: '' }).trim();
    const unrelatedCapture = postCommitV13FixtureGitText(fixture.directory, [
      'commit-tree', emptyTree, '-m', 'unrelated capture'
    ]).trim();
    reject(6, 'planned case 6 rejects equal bytes without C-to-L lineage', () =>
      captureV13ValidateForeignRecordBranch(
        fixture.captured, fixture.current, unrelatedCapture, fixture.currentHead,
        'planned case 6', fixture.operations));
  });

  postCommitV13WithFixture((directory) => {
    const capturedHead = postCommitV13CreateAnchor(directory);
    const path = 'wrong-last-commit-candidate.txt';
    const promotedBytes = Buffer.from('captured-promoted-bytes\n');
    writeFileSync(resolve(directory, path), promotedBytes);
    const captured = postCommitV13FixtureCapturedRecord(directory, {
      path, rawStatus: '??', capturedHead
    });
    writeFileSync(resolve(directory, path), 'wrong-last-commit-bytes\n', 'utf8');
    const wrongLastCommit = postCommitV13FixtureCommit(directory, 'wrong path blob', [path]);
    writeFileSync(resolve(directory, path), promotedBytes);
    const currentHead = postCommitV13FixtureCommit(directory, 'correct head blob', [path]);
    const current = postCommitV13FixtureCleanRecord(
      directory, captured, currentHead, wrongLastCommit);
    reject(7, 'planned case 7 rejects L:path when only H:path has the captured blob', () =>
      captureV13ValidateForeignRecordBranch(captured, current, capturedHead, currentHead,
        'planned case 7', postCommitV13FixtureOperations(directory)));
  });

  postCommitV13WithFixture((directory) => {
    const capturedHead = postCommitV13CreateAnchor(directory);
    const paths = ['subset-promoted.txt', 'subset-dirty.txt'];
    paths.forEach((path) => writeFileSync(resolve(directory, path), `${path}-bytes\n`, 'utf8'));
    const captured = paths.map((path) => postCommitV13FixtureCapturedRecord(directory, {
      path, rawStatus: '??', capturedHead
    }));
    const lastCommit = postCommitV13FixtureCommit(
      directory, 'promote independent subset', [paths[0]]);
    const promoted = postCommitV13FixtureCleanRecord(
      directory, captured[0], lastCommit, lastCommit);
    accept(8, 'planned case 8 independently accepts one promoted and one exact-dirty path', () => {
      assert.deepEqual([
        captureV13ValidateForeignRecordBranch(captured[0], promoted,
          capturedHead, lastCommit, 'planned case 8 promoted',
          postCommitV13FixtureOperations(directory)),
        captureV13ValidateForeignRecordBranch(captured[1], captured[1],
          capturedHead, lastCommit, 'planned case 8 dirty',
          postCommitV13FixtureOperations(directory))
      ], ['exact-clean-promotion', 'exact-captured-full-record']);
    });
  });

  postCommitV13ExercisePromotionFixture('mutation', (fixture) => {
    const inventory = structuredClone(decoded.payload.inventoryProof);
    inventory.porcelainEntries.push({
      rawStatus: '??',
      path: 'new-unrecorded-inventory-path',
      originalPath: null,
      rawRecordBase64: 'Pz8gbmV3LXVucmVjb3JkZWQtaW52ZW50b3J5LXBhdGgA'
    });
    assert.throws(() => captureV13AssertInventoryIntegrity(
      inventory, decoded.payload.currentMatrix, 'planned case 9 new inventory'),
    'planned case 9 rejects a new unrecorded inventory path');
    const indexFlagMutation = structuredClone(fixture.current);
    indexFlagMutation.indexFlags.skipWorktree = true;
    assert.throws(() => captureV13ValidateForeignRecordBranch(
      fixture.captured, indexFlagMutation, fixture.capturedHead, fixture.currentHead,
      'planned case 9 index flag', fixture.operations),
    'planned case 9 rejects representation or index-flag drift');
    const contentMutation = structuredClone(fixture.current);
    contentMutation.contentSha256 = '0'.repeat(64);
    assert.throws(() => captureV13ValidateForeignRecordBranch(
      fixture.captured, contentMutation, fixture.capturedHead, fixture.currentHead,
      'planned case 9 content', fixture.operations),
    'planned case 9 rejects content drift');
    const pathMutation = structuredClone(fixture.current);
    pathMutation.path = 'mutated-path.txt';
    assert.throws(() => captureV13ValidateForeignRecordBranch(
      fixture.captured, pathMutation, fixture.capturedHead, fixture.currentHead,
      'planned case 9 path', fixture.operations),
    'planned case 9 rejects path drift');
    outcomes.push({ id: 9, outcome: 'reject' });
  });

  captureV13AssertExact(outcomes, FEATURE004_CAPTURE_V13_ADVERSARIAL_CASES.map(({ id, expected }) => ({
    id,
    outcome: expected === 'reject' ? 'reject' : 'accept'
  })), 'v13 planned adversarial outcomes');
}

function runPostCommitV13AdversarialCases() {
  runPostCommitV12AdversarialCasesBeforePostCommitV13();
  const { reportContext, decoded } = parsePostCommitV13Authority();
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  assert.throws(() => captureV13ReportBlockContext(Buffer.from(
    `${report}\n${reportContext.block}\n\n`, 'utf8')),
  'duplicate v13 report block fails closed');
  assert.throws(() => captureV13ReportBlockContext(Buffer.from(
    report.replace(reportContext.block, ''), 'utf8')),
  'missing v13 report block fails closed');
  assert.throws(() => decodeCaptureV13Block(reportContext.block.replace(
    '```json\n{', '```json\n{ malformed')),
  'malformed v13 outer JSON fails closed');
  assert.throws(() => assertPinnedReportBlock(
    `${reportContext.block} `, POST_COMMIT_V13_BLOCK_SHA256, 'mutated v13 block'),
  'v13 raw marker-inclusive byte drift fails closed');
  assertEveryClosedSchemaMutationFails(decoded.payload,
    (candidate) => captureV13AssertExact(candidate, decoded.payload, 'v13 decoded canonical payload'),
    'v13 decoded canonical payload');
  runPostCommitV13PlannedAdversarialCases(decoded);

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const normalized = normalizedSelfSourceIdentityV9(parserSource);
  assertPostCommitV13PinValue(parserSource);
  const changedPins = NORMALIZED_SELF_PIN_NAMES_V9.reduce((source, name, index) => {
    const currentValue = parseNormalizedSelfPinsV9(source)
      .find((assignment) => assignment[1] === name)[2];
    return source.replace(currentValue, ((index + 1) % 10).toString().repeat(64));
  }, parserSource);
  assert.deepEqual(normalizedSelfSourceIdentityV9(changedPins), normalized,
    'normalized-self-pins/v9 normalizes exactly all ten valid pin values');
  assert.throws(() => assertPostCommitV13PinValue(changedPins),
    'normalized-self-pins/v9 rejects changed v13 report authority');
  const pinCases = [
    ['missing', (value) => value.replace(/^const POST_COMMIT_V13_BLOCK_SHA256.*\n/m, '')],
    ['duplicate', (value) => value.replace(/^const POST_COMMIT_V13_BLOCK_SHA256.*$/m,
      (line) => `${line}\n${line}`)],
    ['renamed', (value) => value.replace(
      'POST_COMMIT_V13_BLOCK_SHA256', 'POST_COMMIT_CURRENT_BLOCK_SHA256')],
    ['nonhex', (value) => value.replace(POST_COMMIT_V13_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered', (value) => {
      const lines = value.split('\n');
      const v12Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V12_BLOCK_SHA256'));
      const v13Index = lines.findIndex((line) => line.startsWith('const POST_COMMIT_V13_BLOCK_SHA256'));
      [lines[v12Index], lines[v13Index]] = [lines[v13Index], lines[v12Index]];
      return lines.join('\n');
    }],
    ['extra', (value) => value.replace(/^const POST_COMMIT_V13_BLOCK_SHA256.*$/m,
      (line) => `${line}\nconst POST_COMMIT_V13_EXTRA_BLOCK_SHA256 = '${'0'.repeat(64)}';`)]
  ];
  pinCases.forEach(([label, mutate]) => assert.throws(
    () => parseNormalizedSelfPinsV9(mutate(parserSource)),
    `normalized-self-pins/v9 rejects ${label} v13 pin`));
  assert.notDeepEqual(normalizedSelfSourceIdentityV9(parserSource.replace(
    "const REPORT_PATH = '", "const REPORT_PATH = './")), normalized,
  'normalized-self-pins/v9 does not exempt parser drift outside pin values');
}

let postCommitV13ValidationLogged = false;

function parseCollisionContractsWithPostCommitV13() {
  const inherited = parsePostCommitV12AsV13History();
  const { reportContext, decoded } = parsePostCommitV13Authority();
  const currentSnapshot = captureV13Snapshot({ allowExistingV13: true });
  const current = captureV13ValidatePayloadAgainstRecapture(decoded.payload, currentSnapshot);
  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  assertPostCommitV13PinValue(parserSource);
  const normalizedParserIdentity = normalizedSelfSourceIdentityV9(parserSource);
  if (!postCommitV13ValidationLogged) {
    console.log(`FEATURE004_V12_HISTORY_VALIDATED marker=${POST_COMMIT_V12_MARKER} sha256=${POST_COMMIT_V12_BLOCK_SHA256} bytes=${POST_COMMIT_V12_BLOCK_BYTE_LENGTH} liveComparison=false`);
    console.log(`FEATURE004_V13_VALIDATED marker=${FEATURE004_CAPTURE_V13_MARKER} sha256=${POST_COMMIT_V13_BLOCK_SHA256} bytes=${POST_COMMIT_V13_BLOCK_BYTE_LENGTH} compressedSha256=${POST_COMMIT_V13_COMPRESSED_PAYLOAD_SHA256} decodedSha256=${POST_COMMIT_V13_PAYLOAD_SHA256} required=${current.currentPayload.currentMatrix.requiredRecords.length} exactDirty=${current.exactDirtyCount} exactCleanPromotion=${current.exactCleanPromotionCount} exclusions=2 closure=${current.currentPayload.protectedAuthorityClosure.orderedEntryCount} globalHeadEquality=false`);
    console.log(`FEATURE004_V13_PARSER_IDENTITY normalizedPinFamily=normalized-self-pins/v9 worktreeGitOid=${normalizedParserIdentity.worktreeGitOid} worktreeSha256=${normalizedParserIdentity.worktreeSha256} bytes=${normalizedParserIdentity.byteLength}`);
    postCommitV13ValidationLogged = true;
  }
  return {
    ...inherited,
    postCommitV13: decoded.payload,
    postCommitV13Raw: reportContext.block,
    postCommitV13Outer: decoded.outer,
    postCommitV13Matrix: current,
    postCommitV13NormalizedParserIdentity: normalizedParserIdentity
  };
}

parseCollisionContracts = parseCollisionContractsWithPostCommitV13;
runForeignSetV7AdversarialCases = runPostCommitV13AdversarialCases;
assert.equal(parseCollisionContractsBeforePostCommitV13, parseCollisionContractsWithPostCommitV12,
  'v13 preserves the complete v12 parser branch as immutable historical input');
assert.equal(runPostCommitV12AdversarialCasesBeforePostCommitV13, runPostCommitV12AdversarialCases,
  'v13 preserves the complete v12 adversarial branch as immutable historical input');

if (process.env.FEATURE004_CAPTURE_V13 === '1') {
  emitFeature004CaptureV13();
  process.exit(0);
}

if (process.env.FEATURE004_VALIDATE_V13_CAPTURE === '1') {
  validateFeature004CaptureV13();
  process.exit(0);
}
/* FEATURE-004-COLLISION-POST-COMMIT-V13-END */

/* FEATURE-004-COLLISION-SCOPED-EVIDENCE-V14-BEGIN */
const POST_COMMIT_V14_BLOCK_BYTE_LENGTH = 14070;
const FEATURE004_V14_MARKER = 'feature004-dirty-collision-scoped-evidence-v14';
const FEATURE004_V14_ENCODING = 'br-canonical-json-utf8-b64/v1';
const FEATURE004_V14_BASE64_LINE_LENGTH = 56;
const FEATURE004_V14_BEGIN = '/* FEATURE-004-COLLISION-SCOPED-EVIDENCE-V14-BEGIN */';
const FEATURE004_V14_END = '/* FEATURE-004-COLLISION-SCOPED-EVIDENCE-V14-END */';
const FEATURE004_V14_OWNER_PATHS = [
  'specs/004-fx-regime-relative-value-lab/spec.md',
  'specs/004-fx-regime-relative-value-lab/design.md'
];
const FEATURE004_V14_PLAN_PATHS = [
  'specs/004-fx-regime-relative-value-lab/scopes.md',
  'specs/004-fx-regime-relative-value-lab/scenario-manifest.json',
  'specs/004-fx-regime-relative-value-lab/test-plan.json',
  'specs/004-fx-regime-relative-value-lab/state.json'
];
const FEATURE004_V14_COMMIT_PATHS = [REPORT_PATH, COLLISION_PARSER_PATH];
const FEATURE004_V14_AUTHORITY_PATHS = [
  ...FEATURE004_V14_OWNER_PATHS,
  ...FEATURE004_V14_PLAN_PATHS,
  REPORT_PATH,
  ...REQUIRED_SCOPE_ONE_PATHS
];
const FEATURE004_V14_OUTER_FIELDS = [
  'schemaVersion',
  'marker',
  'encoding',
  'compressedPayloadSha256',
  'compressedPayloadByteLength',
  'payloadSha256',
  'payloadByteLength',
  'payloadBase64LineLength',
  'payloadBase64',
  'markerInclusiveByteLength',
  'normalizedSelfSha256'
];
const FEATURE004_V14_PAYLOAD_FIELDS = [
  'contractVersion',
  'findingId',
  'capturedAt',
  'captureTransaction',
  'historicalReportAuthority',
  'planningAuthority',
  'scopedAuthority',
  'commitPolicy',
  'transitionPolicy',
  'repositoryBinding'
];
const FEATURE004_V14_AUTHORITY_RECORD_FIELDS = [
  'path',
  'authorityClass',
  'owner',
  'ownerTransition',
  'normalization',
  'capturedRawStatus',
  'capturedHeadEntry',
  'capturedLastCommit',
  'contentSha256',
  'byteLength'
];
const FEATURE004_V14_EXECUTION_RECORD_FIELDS = [
  'scopeId',
  'itemOrdinal',
  'uncheckedItemTextSha256',
  'checkboxState',
  'orderedEvidenceBlockSha256'
];
const FEATURE004_V14_EXPECTED_AUTHORITY_PREFIXES = {
  'specs/004-fx-regime-relative-value-lab/spec.md': 'd3a3e657',
  'specs/004-fx-regime-relative-value-lab/design.md': 'ba8758fa',
  'specs/004-fx-regime-relative-value-lab/scopes.md': 'e31f2e47',
  'specs/004-fx-regime-relative-value-lab/scenario-manifest.json': 'e31f2e47',
  'specs/004-fx-regime-relative-value-lab/test-plan.json': 'e31f2e47',
  'specs/004-fx-regime-relative-value-lab/state.json': 'e31f2e47'
};
const FEATURE004_V14_PHASES = new Set([
  'analyze', 'clarify', 'design', 'plan', 'implement', 'test', 'regression',
  'simplify', 'gaps', 'harden', 'stabilize', 'security', 'validate', 'audit',
  'chaos', 'docs', 'spec-review'
]);

function feature004V14HistoricalContext(reportBytes, requireV14) {
  assert.ok(Buffer.isBuffer(reportBytes), 'v14 historical report input is binary-safe');
  const v13EndMarker = Buffer.from(
    `<!-- ${FEATURE004_CAPTURE_V13_MARKER}:end -->`, 'utf8');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, v13EndMarker), 1,
    'v14 history contains exactly one v13 end marker');
  const v13EndMarkerStart = reportBytes.indexOf(v13EndMarker);
  const historyEnd = v13EndMarkerStart + v13EndMarker.length + 2;
  assert.deepEqual(reportBytes.subarray(historyEnd - 2, historyEnd), Buffer.from('\n\n'),
    'v14 history preserves the exact two-LF separator after v13');
  const v14StartMarker = Buffer.from(`<!-- ${FEATURE004_V14_MARKER}:start -->`, 'utf8');
  const v14StartCount = captureV13BufferOccurrenceCount(reportBytes, v14StartMarker);
  assert.equal(v14StartCount, requireV14 ? 1 : 0,
    `v14 start marker cardinality is ${requireV14 ? 'one' : 'zero'}`);
  if (requireV14) {
    assert.equal(reportBytes.indexOf(v14StartMarker), historyEnd,
      'v14 begins immediately after the immutable v13 two-LF separator');
  } else {
    assert.equal(reportBytes.length, historyEnd,
      'pre-v14 report ends exactly after the immutable v13 two-LF separator');
  }
  const historyBytes = reportBytes.subarray(0, historyEnd);
  const v13Context = captureV13ReportBlockContext(historyBytes);
  assert.equal(v13Context.blockBytes.length, POST_COMMIT_V13_BLOCK_BYTE_LENGTH,
    'bounded v13 history retains its exact marker-inclusive byte length');
  assert.equal(sha256(v13Context.blockBytes), POST_COMMIT_V13_BLOCK_SHA256,
    'bounded v13 history retains its exact raw hash');
  const history = historyBytes.toString('utf8');
  const v12 = parseReportBlock(history, POST_COMMIT_V12_MARKER);
  assertPinnedReportBlock(v12.raw, POST_COMMIT_V12_BLOCK_SHA256,
    'bounded historical v12 block');
  assert.equal(Buffer.byteLength(v12.raw), POST_COMMIT_V12_BLOCK_BYTE_LENGTH,
    'bounded historical v12 byte length is exact');
  return { historyBytes, historyEnd, v13Context, v12 };
}

function feature004V14SplitLines(text) {
  return text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
}

function feature004V14EvidenceAt(lines, start) {
  const phase = lines[start]?.match(/^ {4}\*\*Phase:\*\* ([a-z-]+)\n?$/);
  if (!phase) return null;
  const command = lines[start + 1]?.match(/^ {4}\*\*Command:\*\* `([^\n`]+)`\n?$/);
  const exitCode = lines[start + 2]?.match(/^ {4}\*\*Exit Code:\*\* (-?\d+)\n?$/);
  const claimSource = lines[start + 3]?.match(/^ {4}\*\*Claim Source:\*\* (executed|interpreted|not-run)\n?$/);
  const output = lines[start + 4]?.match(/^ {4}\*\*Output:\*\*\n?$/);
  const fence = lines[start + 5]?.match(/^ {4}```(?:text)?\n?$/);
  if (!command || !exitCode || !claimSource || !output || !fence) return null;
  let end = start + 6;
  while (end < lines.length && !/^ {4}```\n?$/.test(lines[end])) end += 1;
  if (end >= lines.length) return null;
  const rawOutputLines = lines.slice(start + 6, end).map((line) =>
    line.replace(/^ {4}/, '').replace(/\n$/, ''));
  const rawOutputBytes = Buffer.from(rawOutputLines.join('\n'), 'utf8');
  const blockBytes = Buffer.from(lines.slice(start, end + 1).join(''), 'utf8');
  return {
    start,
    end,
    phase: phase[1],
    command: command[1],
    exitCode: Number(exitCode[1]),
    claimSource: claimSource[1],
    rawOutputLines,
    rawOutputSha256: sha256(rawOutputBytes),
    blockSha256: sha256(blockBytes)
  };
}

function feature004V14ValidateEvidenceBlock(block, label) {
  assert.ok(FEATURE004_V14_PHASES.has(block.phase), `${label}.phase is closed`);
  assertNonemptyString(block.command, `${label}.command`);
  assert.equal(block.exitCode, 0, `${label}.exitCode is successful`);
  assert.equal(block.claimSource, 'executed', `${label}.claimSource is executed`);
  assert.ok(block.rawOutputLines.length >= 10,
    `${label}.rawOutputLines has at least ten literal lines`);
  assert.equal(block.rawOutputSha256,
    sha256(Buffer.from(block.rawOutputLines.join('\n'), 'utf8')),
  `${label}.rawOutputSha256 matches literal output`);
  assertSha256(block.blockSha256, `${label}.blockSha256`);
}

function feature004V14ScopesProjection(text) {
  const lines = feature004V14SplitLines(text);
  const projected = lines.slice();
  const records = [];
  const evidenceByHash = new Map();
  const ordinals = new Map();
  let scopeId = null;
  let inDefinitionOfDone = false;
  for (let index = 0; index < lines.length; index += 1) {
    const scope = lines[index].match(/^\*\*Scope ID:\*\* (SCOPE-\d+)[ \t]*\n?$/);
    if (scope) scopeId = scope[1];
    if (/^### Definition of Done\n?$/.test(lines[index])) {
      assert.ok(scopeId, 'every Definition of Done belongs to a declared scope ID');
      inDefinitionOfDone = true;
      continue;
    }
    if (/^## Scope \d+[: —]/.test(lines[index])) {
      inDefinitionOfDone = false;
      scopeId = null;
      continue;
    }
    if (!inDefinitionOfDone || scopeId === null) continue;
    const checkbox = lines[index].match(/^(- \[)([ xX])(\] [^\n]*)(\n?)$/);
    if (!checkbox) continue;
    const itemOrdinal = (ordinals.get(scopeId) ?? 0) + 1;
    ordinals.set(scopeId, itemOrdinal);
    const uncheckedItemText = `${checkbox[1]} ${checkbox[3]}${checkbox[4]}`;
    projected[index] = uncheckedItemText;
    const evidenceBlocks = [];
    let cursor = index + 1;
    while (cursor < lines.length
        && !/^- \[[ xX]\] /.test(lines[cursor])
        && !/^## Scope \d+[: —]/.test(lines[cursor])) {
      const evidence = feature004V14EvidenceAt(lines, cursor);
      if (!evidence) {
        cursor += 1;
        continue;
      }
      feature004V14ValidateEvidenceBlock(evidence,
        `${scopeId} item ${itemOrdinal} evidence ${evidenceBlocks.length + 1}`);
      evidenceBlocks.push(evidence);
      evidenceByHash.set(evidence.blockSha256, evidence);
      for (let remove = evidence.start; remove <= evidence.end; remove += 1) {
        projected[remove] = '';
      }
      cursor = evidence.end + 1;
    }
    records.push({
      scopeId,
      itemOrdinal,
      uncheckedItemTextSha256: sha256(Buffer.from(uncheckedItemText, 'utf8')),
      checkboxState: checkbox[2] === ' ' ? 'unchecked' : 'checked',
      orderedEvidenceBlockSha256: evidenceBlocks.map(({ blockSha256 }) => blockSha256)
    });
  }
  records.forEach((record, index) => captureV13AssertExact(
    Object.keys(record), FEATURE004_V14_EXECUTION_RECORD_FIELDS,
    `v14 execution projection record ${index} field order`));
  const keySet = new Set(records.map((record) => [
    record.scopeId, record.itemOrdinal, record.uncheckedItemTextSha256
  ].join('|')));
  assert.equal(keySet.size, records.length, 'v14 execution projection item keys are unique');
  const planningBytes = Buffer.from(projected.join(''), 'utf8');
  return {
    planningBytes,
    planningSha256: sha256(planningBytes),
    records,
    recordsSha256: sha256(Buffer.from(JSON.stringify(records), 'utf8')),
    evidenceByHash
  };
}

function feature004V14InventorySnapshot() {
  const records = captureV13Inventory().map((entry) => {
    const lstat = captureV13Lstat(entry.path);
    const bytes = captureV13WorktreeBytes(entry.path, lstat);
    return {
      rawStatus: entry.rawStatus,
      path: entry.path,
      originalPath: entry.originalPath,
      rawRecordBase64: entry.rawRecordBase64,
      worktreeLstat: lstat,
      worktreeContentSha256: bytes === null ? null : sha256(bytes),
      worktreeByteLength: bytes === null ? null : bytes.length,
      indexEntry: captureV13IndexEntry(entry.path)
    };
  });
  const bytes = Buffer.from(JSON.stringify(records), 'utf8');
  return {
    records,
    bytes,
    sha256: sha256(bytes),
    byteLength: bytes.length,
    entryCount: records.length
  };
}

function feature004V14AssertInventoryStable(start, end, label) {
  captureV13AssertExact(end.records, start.records, label);
  assert.equal(end.sha256, start.sha256, `${label}.sha256 is exact`);
  assert.equal(end.byteLength, start.byteLength, `${label}.byteLength is exact`);
  assert.equal(end.entryCount, start.entryCount, `${label}.entryCount is exact`);
}

function feature004V14StagedPaths() {
  return captureV13SplitNul(captureV13Git([
    'diff', '--cached', '--name-only', '-z', '--diff-filter=ACDMRTUXB'
  ]), 'v14 staged path inventory').map((bytes, index) =>
    captureV13DecodePath(bytes, `v14 staged path ${index}`));
}

function feature004V14AssertStagedPaths(paths, expected, label) {
  captureV13AssertExact(paths, expected, label);
  assert.equal(new Set(paths).size, paths.length, `${label} contains no duplicate path`);
}

function feature004V14NormalizedParserBytes(source) {
  const pattern = /^const POST_COMMIT_V14_BLOCK_SHA256 = '([a-f0-9]{64})';$/gm;
  const matches = [...source.matchAll(pattern)];
  assert.equal(matches.length, 1, 'v14 parser has exactly one canonical raw pin literal');
  return Buffer.from(source.replace(matches[0][0],
    `const POST_COMMIT_V14_BLOCK_SHA256 = '${'0'.repeat(64)}';`), 'utf8');
}

function feature004V14LastCommit(path) {
  const value = captureV13GitText([
    'log', '--no-renames', '-1', '--format=%H', 'HEAD', '--', path
  ]).trim();
  if (value === '') return null;
  assert.match(value, /^[a-f0-9]{40,64}$/, `${path} last commit is canonical`);
  return value;
}

function feature004V14OwnerTransition(path, lastCommit) {
  if (path === 'rlfx.js' || path === 'scripts/recommendation-body.mjs') {
    assert.ok(lastCommit?.startsWith('fc4c5d4c'), `${path} is owned by source commit fc4c5d4c`);
    return { owner: 'bubbles.implement', transition: 'committed', commit: lastCommit };
  }
  if ([
    'tests/feature-004-vehicle-universe.test.mjs',
    'tests/feature-004-tool-control-binding.test.mjs',
    'tests/feature-004-brief-eligibility.test.mjs',
    'tests/feature-004-journey-evidence-refresh.test.mjs'
  ].includes(path)) {
    assert.ok(lastCommit?.startsWith('e286712f'), `${path} is owned by test commit e286712f`);
    return { owner: 'bubbles.test', transition: 'committed', commit: lastCommit };
  }
  if (path === COLLISION_PARSER_PATH || path === REPORT_PATH) {
    return { owner: 'bubbles.test', transition: 'path-limited-v14-commit-pending', commit: null };
  }
  if (FEATURE004_V14_OWNER_PATHS.includes(path)) {
    return { owner: path.endsWith('/spec.md') ? 'bubbles.analyst' : 'bubbles.design', transition: 'committed-owner-authority', commit: lastCommit };
  }
  if (FEATURE004_V14_PLAN_PATHS.includes(path)) {
    return { owner: 'bubbles.plan', transition: 'committed-planning-authority', commit: lastCommit };
  }
  return { owner: 'declared-scope-1-owner', transition: 'retained-declared-authority', commit: lastCommit };
}

function feature004V14AuthorityRecord({
  path,
  inventoryByPath,
  historyBytes,
  scopesProjection
}) {
  let authorityClass;
  let owner;
  let normalization = 'raw-worktree-bytes/v1';
  let bytes;
  if (FEATURE004_V14_OWNER_PATHS.includes(path)) {
    authorityClass = 'read-only-owner-authority';
    owner = path.endsWith('/spec.md') ? 'bubbles.analyst' : 'bubbles.design';
    bytes = readFileSync(resolve(ROOT, path));
  } else if (FEATURE004_V14_PLAN_PATHS.includes(path)) {
    authorityClass = 'planning-authority';
    owner = 'bubbles.plan';
    if (path.endsWith('/scopes.md')) {
      normalization = 'scopes-planning-projection/v1';
      bytes = scopesProjection.planningBytes;
    } else {
      bytes = readFileSync(resolve(ROOT, path));
    }
  } else if (path === REPORT_PATH) {
    authorityClass = 'immutable-report-history';
    owner = 'bubbles.test';
    normalization = 'byte-zero-through-v13-two-lf/v1';
    bytes = historyBytes;
  } else {
    authorityClass = 'scope-1-source-or-test';
    owner = path === COLLISION_PARSER_PATH ? 'bubbles.test' : 'declared-scope-1-owner';
    if (path === COLLISION_PARSER_PATH) {
      normalization = 'v14-raw-pin-zeroed/v1';
      bytes = feature004V14NormalizedParserBytes(
        readFileSync(resolve(ROOT, path), 'utf8'));
    } else {
      const lstat = captureV13Lstat(path);
      assert.equal(lstat.present, true, `${path} declared authority exists`);
      assert.equal(lstat.kind, 'regular', `${path} declared authority is a regular file`);
      bytes = readFileSync(resolve(ROOT, path));
    }
  }
  const lastCommit = feature004V14LastCommit(path);
  const expectedPrefix = FEATURE004_V14_EXPECTED_AUTHORITY_PREFIXES[path];
  if (expectedPrefix) {
    assert.ok(lastCommit?.startsWith(expectedPrefix),
      `${path} retains committed authority ${expectedPrefix}`);
  }
  const record = {
    path,
    authorityClass,
    owner,
    ownerTransition: feature004V14OwnerTransition(path, lastCommit),
    normalization,
    capturedRawStatus: inventoryByPath.get(path)?.rawStatus ?? '',
    capturedHeadEntry: captureV13TreeEntry('HEAD', path),
    capturedLastCommit: lastCommit,
    contentSha256: sha256(bytes),
    byteLength: bytes.length
  };
  captureV13AssertExact(Object.keys(record), FEATURE004_V14_AUTHORITY_RECORD_FIELDS,
    `${path} v14 authority-record field order`);
  return record;
}

function feature004V14CapturedAt(reportBytes, hasExistingV14) {
  if (hasExistingV14) {
    const existing = feature004V14DecodeBlock(
      feature004V14ReportContext(reportBytes).block);
    assertUtcTimestamp(existing.payload.capturedAt,
      'existing v14 payload capturedAt');
    return existing.payload.capturedAt;
  }
  const headTimestamp = captureV13GitText([
    'show', '-s', '--format=%cI', 'HEAD'
  ]).trim();
  const capturedAt = new Date(headTimestamp).toISOString();
  assertUtcTimestamp(capturedAt, 'initial v14 payload capturedAt');
  return capturedAt;
}

function feature004V14CaptureOnce() {
  feature004V14AssertStagedPaths(feature004V14StagedPaths(), [],
    'v14 capture staged paths');
  const startHead = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
  const startInventory = feature004V14InventorySnapshot();
  const inventoryByPath = new Map(startInventory.records.map((entry) => [entry.path, entry]));
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const hasExistingV14 = captureV13BufferOccurrenceCount(reportBytes,
    Buffer.from(`<!-- ${FEATURE004_V14_MARKER}:start -->`, 'utf8')) === 1;
  const capturedAt = feature004V14CapturedAt(reportBytes, hasExistingV14);
  const historical = feature004V14HistoricalContext(reportBytes, hasExistingV14);
  const scopesText = readFileSync(resolve(ROOT,
    'specs/004-fx-regime-relative-value-lab/scopes.md'), 'utf8');
  const scopesProjection = feature004V14ScopesProjection(scopesText);
  const authorityRecords = FEATURE004_V14_AUTHORITY_PATHS.map((path) =>
    feature004V14AuthorityRecord({
      path,
      inventoryByPath,
      historyBytes: historical.historyBytes,
      scopesProjection
    }));
  assert.equal(new Set(authorityRecords.map(({ path }) => path)).size,
    FEATURE004_V14_AUTHORITY_PATHS.length,
  'v14 persists every declared authority path exactly once');
  assert.equal(authorityRecords.some(({ path }) => path.startsWith('specs/017-')), false,
    'v14 persists no Feature 017 path');
  const endInventory = feature004V14InventorySnapshot();
  const endHead = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
  assert.equal(endHead, startHead, 'v14 capture HEAD is stable from start to end');
  feature004V14AssertInventoryStable(startInventory, endInventory,
    'v14 bounded capture inventory');
  const payload = {
    contractVersion: 'feature004-dirty-collision-scoped-evidence/v14',
    findingId: 'F004-V14-SCOPED-EVIDENCE-AUTHORITY-001',
    capturedAt,
    captureTransaction: {
      startHead,
      endHead,
      inventorySha256: startInventory.sha256,
      inventoryByteLength: startInventory.byteLength,
      inventoryEntryCount: startInventory.entryCount,
      inventoryRecordsPersisted: false,
      foreignPathRecordsPersisted: false,
      feature017PersistedOrClassified: false,
      comparisonLifetime: 'bounded-in-memory-capture-only'
    },
    historicalReportAuthority: {
      v12: { marker: POST_COMMIT_V12_MARKER, rawBlockSha256: POST_COMMIT_V12_BLOCK_SHA256, markerInclusiveByteLength: POST_COMMIT_V12_BLOCK_BYTE_LENGTH },
      v13: { marker: FEATURE004_CAPTURE_V13_MARKER, rawBlockSha256: POST_COMMIT_V13_BLOCK_SHA256, markerInclusiveByteLength: POST_COMMIT_V13_BLOCK_BYTE_LENGTH },
      v13HistoricalSeparator: { byteLength: 2, base64: 'Cgo=', sha256: sha256(Buffer.from('\n\n')) },
      immutableHistoryByteLength: historical.historyBytes.length,
      immutableHistorySha256: sha256(historical.historyBytes),
      v13ValidatedThroughBoundedHistoricalAdapter: true,
      v13CurrentFileFinalPredicateAfterV14: false,
      v14FinalSuffix: { byteLength: 2, base64: 'Cgo=' }
    },
    planningAuthority: {
      planningProjection: {
        path: 'specs/004-fx-regime-relative-value-lab/scopes.md',
        checkboxNormalization: 'checked-and-unchecked-to-unchecked',
        removableSubtrees: 'syntactically-valid-inline-evidence-directly-attached-to-existing-dod-items-only',
        sha256: scopesProjection.planningSha256,
        byteLength: scopesProjection.planningBytes.length
      },
      executionProjection: {
        schemaVersion: 'feature004-inline-evidence-execution-projection/v1',
        itemKey: ['scopeId', 'itemOrdinal', 'sha256(exact-unchecked-item-text-with-line-ending)'],
        recordFields: FEATURE004_V14_EXECUTION_RECORD_FIELDS,
        records: scopesProjection.records,
        recordsSha256: scopesProjection.recordsSha256
      }
    },
    scopedAuthority: {
      orderedPaths: FEATURE004_V14_AUTHORITY_PATHS,
      authorityRecordFields: FEATURE004_V14_AUTHORITY_RECORD_FIELDS,
      records: authorityRecords,
      recordsSha256: sha256(Buffer.from(JSON.stringify(authorityRecords), 'utf8')),
      undeclaredPathOwnershipInferenceAllowed: false,
      foreignPathSerializationAllowed: false,
      postCommitForeignChangesInvalidateFeature004: false
    },
    commitPolicy: {
      captureAllowedStagedPaths: [],
      commitAllowedPaths: FEATURE004_V14_COMMIT_PATHS,
      exactPathLimitedCommitRequired: true,
      gitCommitOnlyRequired: true,
      forbiddenOperations: ['git add -A', 'stash', 'reset', 'checkout', 'clean', 'foreign-path staging']
    },
    transitionPolicy: {
      planningProjectionImmutable: true,
      executionItemKeyImmutable: true,
      priorEvidenceAppendOnly: true,
      allowedTransition: 'one-matching-unchecked-item-to-checked-with-correctly-phase-owned-executed-evidence',
      checkedWithoutValidEvidenceAllowed: false,
      itemTextEditThroughExecutionProjectionAllowed: false,
      certificationOwnedBy: 'bubbles.validate',
      scopeOneStatus: 'In Progress',
      scopeTwoPickupAllowed: false
    },
    repositoryBinding: {
      repositoryAlias: 'research-lab',
      sessionId: 'vscode-e24db39cf992f7ccd8ec75209602db59',
      decisionId: 'rb:vscode-e24db39cf992f7ccd8ec75209602db59:56',
      controlRevision: 56,
      controlPathDigest: 'sha256:e6d858a6f9bc1824d3a2cea3746d741a5bad41016d613dc242312185af9761fa',
      authority: 'concrete-target',
      transition: 'confirmed',
      scopeKind: 'command',
      actionable: true
    }
  };
  captureV13AssertExact(Object.keys(payload), FEATURE004_V14_PAYLOAD_FIELDS,
    'v14 payload top-level field order');
  return { payload, startInventory, endInventory };
}

function feature004V14HashChunks(hash, label) {
  assertSha256(hash, label);
  return [hash.slice(0, 32), hash.slice(32)];
}

function feature004V14RenderHashArray(field, chunks, trailingComma) {
  return [
    `"${field}":[`,
    ...chunks.map((chunk, index) =>
      `${JSON.stringify(chunk)}${index === chunks.length - 1 ? '' : ','}`),
    trailingComma ? '],' : ']'
  ];
}

function feature004V14RenderOuter(outer) {
  return [
    '{',
    `"schemaVersion":${JSON.stringify(outer.schemaVersion)},`,
    `"marker":${JSON.stringify(outer.marker)},`,
    `"encoding":${JSON.stringify(outer.encoding)},`,
    ...feature004V14RenderHashArray('compressedPayloadSha256', outer.compressedPayloadSha256, true),
    `"compressedPayloadByteLength":${outer.compressedPayloadByteLength},`,
    ...feature004V14RenderHashArray('payloadSha256', outer.payloadSha256, true),
    `"payloadByteLength":${outer.payloadByteLength},`,
    `"payloadBase64LineLength":${outer.payloadBase64LineLength},`,
    '"payloadBase64":[',
    ...outer.payloadBase64.map((line, index) =>
      `${JSON.stringify(line)}${index === outer.payloadBase64.length - 1 ? '' : ','}`),
    '],',
    `"markerInclusiveByteLength":${outer.markerInclusiveByteLength},`,
    ...feature004V14RenderHashArray('normalizedSelfSha256', outer.normalizedSelfSha256, false),
    '}'
  ].join('\n');
}

function feature004V14RenderBlock(outer) {
  return [
    `<!-- ${FEATURE004_V14_MARKER}:start -->`,
    '```json',
    feature004V14RenderOuter(outer),
    '```',
    `<!-- ${FEATURE004_V14_MARKER}:end -->`
  ].join('\n');
}

function feature004V14Compress(payloadBytes) {
  return brotliCompressSync(payloadBytes, {
    params: {
      [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
      [zlibConstants.BROTLI_PARAM_LGWIN]: 22,
      [zlibConstants.BROTLI_PARAM_SIZE_HINT]: payloadBytes.length
    }
  });
}

function feature004V14BuildBlock(payload) {
  const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');
  const compressedPayloadBytes = feature004V14Compress(payloadBytes);
  const payloadBase64 = compressedPayloadBytes.toString('base64').match(/.{1,56}/g) ?? [];
  assert.ok(payloadBase64.length > 0, 'v14 compressed payload has base64 lines');
  const outer = {
    schemaVersion: 'feature004-scoped-evidence-v14-capture-envelope/v1',
    marker: FEATURE004_V14_MARKER,
    encoding: FEATURE004_V14_ENCODING,
    compressedPayloadSha256: feature004V14HashChunks(sha256(compressedPayloadBytes), 'v14 compressed payload hash'),
    compressedPayloadByteLength: compressedPayloadBytes.length,
    payloadSha256: feature004V14HashChunks(sha256(payloadBytes), 'v14 payload hash'),
    payloadByteLength: payloadBytes.length,
    payloadBase64LineLength: FEATURE004_V14_BASE64_LINE_LENGTH,
    payloadBase64,
    markerInclusiveByteLength: 0,
    normalizedSelfSha256: ['0'.repeat(32), '0'.repeat(32)]
  };
  for (;;) {
    const byteLength = Buffer.byteLength(feature004V14RenderBlock(outer));
    if (byteLength === outer.markerInclusiveByteLength) break;
    outer.markerInclusiveByteLength = byteLength;
  }
  outer.normalizedSelfSha256 = feature004V14HashChunks(sha256(
    feature004V14RenderBlock(outer)), 'v14 normalized self hash');
  const block = feature004V14RenderBlock(outer);
  assert.equal(Buffer.byteLength(block), outer.markerInclusiveByteLength,
    'v14 marker-inclusive byte length is stable');
  return { block, outer, payloadBytes, compressedPayloadBytes };
}

function feature004V14DecodeBlock(block) {
  const start = `<!-- ${FEATURE004_V14_MARKER}:start -->`;
  const end = `<!-- ${FEATURE004_V14_MARKER}:end -->`;
  const match = block.match(new RegExp(`^${start}\\n` + '```json\\n([\\s\\S]*?)\\n```\\n' + `${end}$`));
  assert.ok(match, 'v14 block is one exact marker-delimited JSON envelope');
  const outer = JSON.parse(match[1]);
  captureV13AssertExact(Object.keys(outer), FEATURE004_V14_OUTER_FIELDS,
    'v14 outer field order');
  assert.equal(feature004V14RenderBlock(outer), block,
    'v14 outer canonical renderer is byte-identical');
  const compressed = Buffer.from(outer.payloadBase64.join(''), 'base64');
  assert.equal(compressed.toString('base64'), outer.payloadBase64.join(''),
    'v14 base64 decode and canonical re-encode are identical');
  assert.equal(compressed.length, outer.compressedPayloadByteLength,
    'v14 compressed byte length is exact');
  assert.equal(sha256(compressed), outer.compressedPayloadSha256.join(''),
    'v14 compressed payload hash is exact');
  const payloadBytes = brotliDecompressSync(compressed);
  assert.deepEqual(feature004V14Compress(payloadBytes), compressed,
    'v14 deterministic Brotli recompression is exact');
  assert.equal(payloadBytes.length, outer.payloadByteLength,
    'v14 payload byte length is exact');
  assert.equal(sha256(payloadBytes), outer.payloadSha256.join(''),
    'v14 payload hash is exact');
  const payload = JSON.parse(payloadBytes.toString('utf8'));
  assert.deepEqual(Buffer.from(JSON.stringify(payload), 'utf8'), payloadBytes,
    'v14 payload is canonical JSON.stringify bytes');
  assert.equal(Buffer.byteLength(block), outer.markerInclusiveByteLength,
    'v14 marker-inclusive length covers the exact block');
  const normalized = { ...outer, normalizedSelfSha256: ['0'.repeat(32), '0'.repeat(32)] };
  assert.equal(sha256(feature004V14RenderBlock(normalized)), outer.normalizedSelfSha256.join(''),
    'v14 normalized outer self hash is exact');
  return { outer, payload, payloadBytes, compressedPayloadBytes: compressed };
}

function feature004V14StableCapture() {
  let lastDrift = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const capture = feature004V14CaptureOnce();
      const rendered = feature004V14BuildBlock(capture.payload);
      const decoded = feature004V14DecodeBlock(rendered.block);
      captureV13AssertExact(decoded.payload, capture.payload,
        `v14 attempt ${attempt} decoded payload`);
      const finalHead = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
      const finalInventory = feature004V14InventorySnapshot();
      assert.equal(finalHead, capture.payload.captureTransaction.endHead,
        `v14 attempt ${attempt} HEAD remains stable through rendering`);
      feature004V14AssertInventoryStable(capture.endInventory, finalInventory,
        `v14 attempt ${attempt} final inventory`);
      return { ...capture, ...rendered, finalInventory };
    } catch (error) {
      lastDrift = error;
    }
  }
  throw new Error(`v14 capture was not stable after three bounded observations: ${lastDrift?.message}`);
}

function feature004V14CaptureCheck() {
  const capture = feature004V14StableCapture();
  console.log([
    'FEATURE004_V14_CAPTURE_CHECK',
    `rawSha256=${sha256(Buffer.from(capture.block, 'utf8'))}`,
    `rawBytes=${Buffer.byteLength(capture.block)}`,
    `payloadSha256=${capture.outer.payloadSha256.join('')}`,
    `authorityPaths=${capture.payload.scopedAuthority.orderedPaths.length}`,
    `executionItems=${capture.payload.planningAuthority.executionProjection.records.length}`,
    `inventoryEntries=${capture.payload.captureTransaction.inventoryEntryCount}`,
    'foreignRecordsPersisted=false',
    'feature017Persisted=false'
  ].join(' '));
  return capture;
}

function feature004V14ReportContext(reportBytes) {
  const historical = feature004V14HistoricalContext(reportBytes, true);
  const startMarker = Buffer.from(`<!-- ${FEATURE004_V14_MARKER}:start -->`, 'utf8');
  const endMarker = Buffer.from(`<!-- ${FEATURE004_V14_MARKER}:end -->`, 'utf8');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, startMarker), 1,
    'report contains exactly one v14 start marker');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, endMarker), 1,
    'report contains exactly one v14 end marker');
  const startByte = reportBytes.indexOf(startMarker);
  const endMarkerStartByte = reportBytes.indexOf(endMarker, startByte);
  assert.ok(endMarkerStartByte > startByte, 'v14 marker order is exact');
  const endByteExclusive = endMarkerStartByte + endMarker.length;
  assert.deepEqual(reportBytes.subarray(endByteExclusive), Buffer.from('\n\n'),
    'v14 is report-final with exactly two LF suffix bytes');
  const blockBytes = reportBytes.subarray(startByte, endByteExclusive);
  const block = blockBytes.toString('utf8');
  assert.deepEqual(Buffer.from(block, 'utf8'), blockBytes,
    'v14 marker-inclusive bytes are lossless UTF-8');
  return { ...historical, startByte, endMarkerStartByte, endByteExclusive, blockBytes, block };
}

function feature004V14HistoricalReportContext(reportBytes) {
  const historical = feature004V14HistoricalContext(reportBytes, true);
  const startMarker = Buffer.from(`<!-- ${FEATURE004_V14_MARKER}:start -->`, 'utf8');
  const endMarker = Buffer.from(`<!-- ${FEATURE004_V14_MARKER}:end -->`, 'utf8');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, startMarker), 1,
    'historical v14 report contains exactly one start marker');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, endMarker), 1,
    'historical v14 report contains exactly one end marker');
  const startByte = reportBytes.indexOf(startMarker);
  const endMarkerStartByte = reportBytes.indexOf(endMarker, startByte);
  assert.ok(endMarkerStartByte > startByte, 'historical v14 marker order is exact');
  const endByteExclusive = endMarkerStartByte + endMarker.length;
  assert.deepEqual(reportBytes.subarray(endByteExclusive, endByteExclusive + 2),
    Buffer.from('\n\n'), 'historical v14 retains its exact two-LF successor separator');
  const blockBytes = reportBytes.subarray(startByte, endByteExclusive);
  const block = blockBytes.toString('utf8');
  assert.deepEqual(Buffer.from(block, 'utf8'), blockBytes,
    'historical v14 marker-inclusive bytes are lossless UTF-8');
  return { ...historical, startByte, endMarkerStartByte, endByteExclusive, blockBytes, block };
}

function feature004V14ValidatePayloadSchema(payload) {
  captureV13AssertExact(Object.keys(payload), FEATURE004_V14_PAYLOAD_FIELDS,
    'v14 payload top-level field order');
  assert.equal(payload.contractVersion,
    'feature004-dirty-collision-scoped-evidence/v14');
  assert.equal(payload.findingId, 'F004-V14-SCOPED-EVIDENCE-AUTHORITY-001');
  assertUtcTimestamp(payload.capturedAt, 'v14 payload capturedAt');
  assertExactOrderedKeys(payload.captureTransaction, [
    'startHead', 'endHead', 'inventorySha256', 'inventoryByteLength',
    'inventoryEntryCount', 'inventoryRecordsPersisted',
    'foreignPathRecordsPersisted', 'feature017PersistedOrClassified',
    'comparisonLifetime'
  ], 'v14 captureTransaction');
  assert.equal(payload.captureTransaction.startHead,
    payload.captureTransaction.endHead, 'v14 capture HEAD is identical at both bounds');
  assertSha256(payload.captureTransaction.inventorySha256,
    'v14 capture inventory hash');
  assert.ok(Number.isSafeInteger(payload.captureTransaction.inventoryByteLength)
    && payload.captureTransaction.inventoryByteLength >= 0,
  'v14 capture inventory byte length is nonnegative');
  assert.ok(Number.isSafeInteger(payload.captureTransaction.inventoryEntryCount)
    && payload.captureTransaction.inventoryEntryCount >= 0,
  'v14 capture inventory entry count is nonnegative');
  assert.equal(payload.captureTransaction.inventoryRecordsPersisted, false);
  assert.equal(payload.captureTransaction.foreignPathRecordsPersisted, false);
  assert.equal(payload.captureTransaction.feature017PersistedOrClassified, false);
  assert.equal(payload.captureTransaction.comparisonLifetime,
    'bounded-in-memory-capture-only');

  const history = payload.historicalReportAuthority;
  assertExactOrderedKeys(history, [
    'v12', 'v13', 'v13HistoricalSeparator', 'immutableHistoryByteLength',
    'immutableHistorySha256', 'v13ValidatedThroughBoundedHistoricalAdapter',
    'v13CurrentFileFinalPredicateAfterV14', 'v14FinalSuffix'
  ], 'v14 historicalReportAuthority');
  captureV13AssertExact(history.v12, {
    marker: POST_COMMIT_V12_MARKER,
    rawBlockSha256: POST_COMMIT_V12_BLOCK_SHA256,
    markerInclusiveByteLength: POST_COMMIT_V12_BLOCK_BYTE_LENGTH
  }, 'v14 historical v12 authority');
  captureV13AssertExact(history.v13, {
    marker: FEATURE004_CAPTURE_V13_MARKER,
    rawBlockSha256: POST_COMMIT_V13_BLOCK_SHA256,
    markerInclusiveByteLength: POST_COMMIT_V13_BLOCK_BYTE_LENGTH
  }, 'v14 historical v13 authority');
  captureV13AssertExact(history.v13HistoricalSeparator, {
    byteLength: 2,
    base64: 'Cgo=',
    sha256: sha256(Buffer.from('\n\n'))
  }, 'v14 historical v13 separator');
  assertSha256(history.immutableHistorySha256, 'v14 immutable history hash');
  assert.equal(history.v13ValidatedThroughBoundedHistoricalAdapter, true);
  assert.equal(history.v13CurrentFileFinalPredicateAfterV14, false);
  captureV13AssertExact(history.v14FinalSuffix,
    { byteLength: 2, base64: 'Cgo=' }, 'v14 final suffix contract');

  const planning = payload.planningAuthority;
  assertExactOrderedKeys(planning, ['planningProjection', 'executionProjection'],
    'v14 planningAuthority');
  assertExactOrderedKeys(planning.planningProjection, [
    'path', 'checkboxNormalization', 'removableSubtrees', 'sha256', 'byteLength'
  ], 'v14 planningProjection');
  assert.equal(planning.planningProjection.path,
    'specs/004-fx-regime-relative-value-lab/scopes.md');
  assertSha256(planning.planningProjection.sha256, 'v14 planning projection hash');
  const execution = planning.executionProjection;
  assertExactOrderedKeys(execution, [
    'schemaVersion', 'itemKey', 'recordFields', 'records', 'recordsSha256'
  ], 'v14 executionProjection');
  assert.equal(execution.schemaVersion,
    'feature004-inline-evidence-execution-projection/v1');
  captureV13AssertExact(execution.recordFields,
    FEATURE004_V14_EXECUTION_RECORD_FIELDS,
    'v14 execution projection record fields');
  const itemKeys = new Set();
  execution.records.forEach((record, index) => {
    captureV13AssertExact(Object.keys(record), FEATURE004_V14_EXECUTION_RECORD_FIELDS,
      `v14 execution record ${index} field order`);
    assert.match(record.scopeId, /^SCOPE-\d+$/,
      `v14 execution record ${index} scope ID is canonical`);
    assert.ok(Number.isSafeInteger(record.itemOrdinal) && record.itemOrdinal > 0,
      `v14 execution record ${index} ordinal is positive`);
    assertSha256(record.uncheckedItemTextSha256,
      `v14 execution record ${index} item-text hash`);
    assert.ok(record.checkboxState === 'checked' || record.checkboxState === 'unchecked',
      `v14 execution record ${index} checkbox state is closed`);
    record.orderedEvidenceBlockSha256.forEach((value, evidenceIndex) =>
      assertSha256(value, `v14 execution record ${index} evidence hash ${evidenceIndex}`));
    const key = [record.scopeId, record.itemOrdinal,
      record.uncheckedItemTextSha256].join('|');
    assert.equal(itemKeys.has(key), false, `v14 execution record ${index} key is unique`);
    itemKeys.add(key);
  });
  assert.equal(execution.recordsSha256,
    sha256(Buffer.from(JSON.stringify(execution.records), 'utf8')),
  'v14 execution projection records hash is exact');

  const authority = payload.scopedAuthority;
  assertExactOrderedKeys(authority, [
    'orderedPaths', 'authorityRecordFields', 'records', 'recordsSha256',
    'undeclaredPathOwnershipInferenceAllowed', 'foreignPathSerializationAllowed',
    'postCommitForeignChangesInvalidateFeature004'
  ], 'v14 scopedAuthority');
  captureV13AssertExact(authority.orderedPaths, FEATURE004_V14_AUTHORITY_PATHS,
    'v14 scoped authority path order');
  captureV13AssertExact(authority.authorityRecordFields,
    FEATURE004_V14_AUTHORITY_RECORD_FIELDS,
    'v14 scoped authority record fields');
  assert.equal(authority.records.length, FEATURE004_V14_AUTHORITY_PATHS.length,
    'v14 scoped authority record count is exact');
  assert.equal(new Set(authority.records.map(({ path }) => path)).size,
    authority.records.length, 'v14 scoped authority paths are unique');
  authority.records.forEach((record, index) => {
    captureV13AssertExact(Object.keys(record), FEATURE004_V14_AUTHORITY_RECORD_FIELDS,
      `v14 authority record ${index} field order`);
    assert.equal(record.path, FEATURE004_V14_AUTHORITY_PATHS[index],
      `v14 authority record ${index} path is exact`);
    assert.equal(record.path.startsWith('specs/017-'), false,
      `v14 authority record ${index} is not Feature 017`);
    assertSha256(record.contentSha256,
      `v14 authority record ${index} content hash`);
    assert.ok(Number.isSafeInteger(record.byteLength) && record.byteLength >= 0,
      `v14 authority record ${index} byte length is nonnegative`);
  });
  const scopesAuthority = authority.records.find(({ path }) =>
    path === planning.planningProjection.path);
  assert.ok(scopesAuthority,
    'v14 planning projection resolves to one scoped authority record');
  assert.equal(scopesAuthority.normalization, 'scopes-planning-projection/v1',
    'v14 scopes authority uses the planning projection normalization');
  assert.equal(scopesAuthority.contentSha256,
    planning.planningProjection.sha256,
  'v14 planning projection hash matches scoped authority');
  assert.equal(scopesAuthority.byteLength,
    planning.planningProjection.byteLength,
  'v14 planning projection byte length matches scoped authority');
  assert.equal(authority.recordsSha256,
    sha256(Buffer.from(JSON.stringify(authority.records), 'utf8')),
  'v14 scoped authority records hash is exact');
  assert.equal(authority.undeclaredPathOwnershipInferenceAllowed, false);
  assert.equal(authority.foreignPathSerializationAllowed, false);
  assert.equal(authority.postCommitForeignChangesInvalidateFeature004, false);

  assertExactOrderedKeys(payload.commitPolicy, [
    'captureAllowedStagedPaths', 'commitAllowedPaths',
    'exactPathLimitedCommitRequired', 'gitCommitOnlyRequired', 'forbiddenOperations'
  ], 'v14 commitPolicy');
  captureV13AssertExact(payload.commitPolicy.captureAllowedStagedPaths, [],
    'v14 capture staged allowlist');
  captureV13AssertExact(payload.commitPolicy.commitAllowedPaths,
    FEATURE004_V14_COMMIT_PATHS, 'v14 commit path allowlist');
  assert.equal(payload.commitPolicy.exactPathLimitedCommitRequired, true);
  assert.equal(payload.commitPolicy.gitCommitOnlyRequired, true);
  assertExactOrderedKeys(payload.transitionPolicy, [
    'planningProjectionImmutable', 'executionItemKeyImmutable',
    'priorEvidenceAppendOnly', 'allowedTransition',
    'checkedWithoutValidEvidenceAllowed',
    'itemTextEditThroughExecutionProjectionAllowed', 'certificationOwnedBy',
    'scopeOneStatus', 'scopeTwoPickupAllowed'
  ], 'v14 transitionPolicy');
  assert.equal(payload.transitionPolicy.planningProjectionImmutable, true);
  assert.equal(payload.transitionPolicy.executionItemKeyImmutable, true);
  assert.equal(payload.transitionPolicy.priorEvidenceAppendOnly, true);
  assert.equal(payload.transitionPolicy.checkedWithoutValidEvidenceAllowed, false);
  assert.equal(payload.transitionPolicy.itemTextEditThroughExecutionProjectionAllowed, false);
  assert.equal(payload.transitionPolicy.certificationOwnedBy, 'bubbles.validate');
  assert.equal(payload.transitionPolicy.scopeOneStatus, 'In Progress');
  assert.equal(payload.transitionPolicy.scopeTwoPickupAllowed, false);
  assert.equal(payload.repositoryBinding.decisionId,
    'rb:vscode-e24db39cf992f7ccd8ec75209602db59:56');
  assert.equal(payload.repositoryBinding.controlRevision, 56);
  assert.equal(payload.repositoryBinding.actionable, true);
}

function feature004V14ValidateExecutionTransition(baseRecords, currentRecords,
  evidenceByHash, { allowNoTransition = false } = {}) {
  assert.equal(currentRecords.length, baseRecords.length,
    'v14 execution transition retains item cardinality');
  const currentKeys = new Set();
  let transitionCount = 0;
  baseRecords.forEach((base, index) => {
    const current = currentRecords[index];
    captureV13AssertExact({
      scopeId: current.scopeId,
      itemOrdinal: current.itemOrdinal,
      uncheckedItemTextSha256: current.uncheckedItemTextSha256
    }, {
      scopeId: base.scopeId,
      itemOrdinal: base.itemOrdinal,
      uncheckedItemTextSha256: base.uncheckedItemTextSha256
    }, `v14 execution transition item ${index} key`);
    const key = [current.scopeId, current.itemOrdinal,
      current.uncheckedItemTextSha256].join('|');
    assert.equal(currentKeys.has(key), false,
      `v14 execution transition item ${index} key is unique`);
    currentKeys.add(key);
    assert.deepEqual(current.orderedEvidenceBlockSha256.slice(
      0, base.orderedEvidenceBlockSha256.length),
    base.orderedEvidenceBlockSha256,
    `v14 execution transition item ${index} preserves prior evidence order`);
    if (base.checkboxState === 'checked') {
      assert.equal(current.checkboxState, 'checked',
        `v14 execution transition item ${index} cannot uncheck history`);
      assert.deepEqual(current.orderedEvidenceBlockSha256,
        base.orderedEvidenceBlockSha256,
      `v14 execution transition item ${index} cannot replace checked-item history`);
      return;
    }
    if (current.checkboxState === 'unchecked') {
      assert.deepEqual(current.orderedEvidenceBlockSha256,
        base.orderedEvidenceBlockSha256,
      `v14 execution transition item ${index} cannot add evidence while unchecked`);
      return;
    }
    assert.equal(current.checkboxState, 'checked',
      `v14 execution transition item ${index} checkbox state is closed`);
    const appended = current.orderedEvidenceBlockSha256.slice(
      base.orderedEvidenceBlockSha256.length);
    assert.ok(appended.length > 0,
      `v14 execution transition item ${index} has valid appended evidence`);
    appended.forEach((hash, evidenceIndex) => {
      const evidence = evidenceByHash.get(hash);
      assert.ok(evidence,
        `v14 execution transition item ${index} evidence ${evidenceIndex} resolves`);
      feature004V14ValidateEvidenceBlock(evidence,
        `v14 execution transition item ${index} evidence ${evidenceIndex}`);
    });
    transitionCount += 1;
  });
  assert.equal(transitionCount, allowNoTransition ? 0 : 1,
    `v14 execution transition count is ${allowNoTransition ? 'zero' : 'one'}`);
}

function feature004V14HistoricalV13Authority() {
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const historical = feature004V14HistoricalContext(reportBytes, true);
  const reportContext = historical.v13Context;
  assert.equal(reportContext.startByte, POST_COMMIT_V13_REPORT_PREFIX_BYTE_LENGTH,
    'historical v13 report prefix byte length is exact');
  assert.equal(sha256(reportContext.prefixBytes), POST_COMMIT_V13_REPORT_PREFIX_SHA256,
    'historical v13 report prefix hash is exact');
  assert.equal(reportContext.blockBytes.length, POST_COMMIT_V13_BLOCK_BYTE_LENGTH,
    'historical v13 raw marker-inclusive length is exact');
  assert.equal(sha256(reportContext.blockBytes), POST_COMMIT_V13_BLOCK_SHA256,
    'historical v13 raw marker-inclusive hash is exact');
  const decoded = decodeCaptureV13Block(reportContext.block);
  assert.equal(decoded.outer.compressedPayloadSha256.join(''),
    POST_COMMIT_V13_COMPRESSED_PAYLOAD_SHA256,
  'historical v13 compressed payload hash is exact');
  assert.equal(decoded.outer.payloadSha256.join(''), POST_COMMIT_V13_PAYLOAD_SHA256,
    'historical v13 decoded payload hash is exact');
  assert.equal(decoded.outer.normalizedSelfSha256.join(''),
    POST_COMMIT_V13_NORMALIZED_SELF_SHA256,
  'historical v13 normalized self hash is exact');
  return { reportContext, decoded };
}

function feature004V14CurrentAuthorityRecord(record, historical,
  scopesProjection, inventoryByPath) {
  return feature004V14AuthorityRecord({
    path: record.path,
    inventoryByPath,
    historyBytes: historical.historyBytes,
    scopesProjection
  });
}

function feature004V14ValidateCurrent(payload, reportContext) {
  feature004V14ValidatePayloadSchema(payload);
  assert.equal(reportContext.historyBytes.length,
    payload.historicalReportAuthority.immutableHistoryByteLength,
  'v14 immutable history byte length matches the payload');
  assert.equal(sha256(reportContext.historyBytes),
    payload.historicalReportAuthority.immutableHistorySha256,
  'v14 immutable history hash matches the payload');
  captureV13AssertAncestor(payload.captureTransaction.startHead,
    captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim(),
    'v14 captured HEAD to current HEAD');
  feature004V14AssertStagedPaths(feature004V14StagedPaths(), [],
    'v14 current staged paths');
  const scopesText = readFileSync(resolve(ROOT,
    'specs/004-fx-regime-relative-value-lab/scopes.md'), 'utf8');
  const scopesProjection = feature004V14ScopesProjection(scopesText);
  assert.equal(scopesProjection.planningSha256,
    payload.planningAuthority.planningProjection.sha256,
  'v14 current scopes planning projection is immutable');
  assert.equal(scopesProjection.planningBytes.length,
    payload.planningAuthority.planningProjection.byteLength,
  'v14 current scopes planning projection byte length is immutable');
  feature004V14ValidateExecutionTransition(
    payload.planningAuthority.executionProjection.records,
    scopesProjection.records,
    scopesProjection.evidenceByHash,
    { allowNoTransition: true }
  );
  const inventory = feature004V14InventorySnapshot();
  const inventoryByPath = new Map(inventory.records.map((entry) => [entry.path, entry]));
  const currentRecords = payload.scopedAuthority.records.map((record) =>
    feature004V14CurrentAuthorityRecord(record, reportContext,
      scopesProjection, inventoryByPath));
  currentRecords.forEach((current, index) => {
    const captured = payload.scopedAuthority.records[index];
    captureV13AssertExact({
      path: current.path,
      authorityClass: current.authorityClass,
      owner: current.owner,
      ownerTransition: current.ownerTransition,
      normalization: current.normalization,
      contentSha256: current.contentSha256,
      byteLength: current.byteLength
    }, {
      path: captured.path,
      authorityClass: captured.authorityClass,
      owner: captured.owner,
      ownerTransition: captured.ownerTransition,
      normalization: captured.normalization,
      contentSha256: captured.contentSha256,
      byteLength: captured.byteLength
    }, `v14 current authority record ${index}`);
  });
  assert.equal(POST_COMMIT_V14_BLOCK_SHA256,
    sha256(reportContext.blockBytes),
  'v14 parser pin equals the independently hashed raw marker-inclusive block');
  return { scopesProjection, currentRecords };
}

function feature004V14ParseAuthority() {
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const reportContext = feature004V14ReportContext(reportBytes);
  assert.equal(sha256(reportContext.blockBytes), POST_COMMIT_V14_BLOCK_SHA256,
    'v14 raw report block hash is independently pinned');
  const decoded = feature004V14DecodeBlock(reportContext.block);
  const current = feature004V14ValidateCurrent(decoded.payload, reportContext);
  assert.deepEqual(readFileSync(resolve(ROOT, REPORT_PATH)), reportBytes,
    'v14 validation leaves every report byte unchanged');
  return { reportContext, decoded, current };
}

function feature004V14ParseHistoricalAuthority() {
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const reportContext = feature004V14HistoricalReportContext(reportBytes);
  assert.equal(sha256(reportContext.blockBytes), POST_COMMIT_V14_BLOCK_SHA256,
    'historical v14 raw report block hash is independently pinned');
  assert.equal(reportContext.blockBytes.length, POST_COMMIT_V14_BLOCK_BYTE_LENGTH,
    'historical v14 raw report block byte length is independently pinned');
  const decoded = feature004V14DecodeBlock(reportContext.block);
  feature004V14ValidatePayloadSchema(decoded.payload);
  assert.equal(reportContext.historyBytes.length,
    decoded.payload.historicalReportAuthority.immutableHistoryByteLength,
  'historical v14 immutable history byte length matches the payload');
  assert.equal(sha256(reportContext.historyBytes),
    decoded.payload.historicalReportAuthority.immutableHistorySha256,
  'historical v14 immutable history hash matches the payload');
  assert.deepEqual(readFileSync(resolve(ROOT, REPORT_PATH)), reportBytes,
    'historical v14 validation leaves every report byte unchanged');
  return { reportContext, decoded };
}

function feature004V14ValidEvidenceFixture() {
  const rawOutputLines = Array.from({ length: 10 }, (_, index) =>
    `literal test output line ${index + 1}`);
  return {
    phase: 'test',
    command: 'timeout 600 node --test tests/feature-004-dirty-tree-collision.test.mjs',
    exitCode: 0,
    claimSource: 'executed',
    rawOutputLines,
    rawOutputSha256: sha256(Buffer.from(rawOutputLines.join('\n'), 'utf8')),
    blockSha256: sha256(Buffer.from('synthetic-valid-v14-evidence-block', 'utf8'))
  };
}

const capturePostCommitV12AuthorityObservationsBeforeV14 =
  capturePostCommitV12AuthorityObservations;

function feature004V14HistoricalV12Observations(v12, parserSource = readFileSync(
  resolve(ROOT, COLLISION_PARSER_PATH), 'utf8')) {
  const entries = v12.protectedAuthorityClosure.orderedEntries.map((entry) => {
    if (entry.kind === 'clean-git-tree') {
      return {
        treeMode: entry.treeMode,
        treeType: entry.treeType,
        blobOid: entry.blobOid,
        contentSha256: entry.contentSha256,
        byteLength: entry.byteLength,
        lastCommit: entry.lastCommit,
        status: ''
      };
    }
    if (entry.kind === 'path-scoped-live-parser-source') {
      assert.equal(entry.capturedHeadLastCommit, entry.pathLastCommit,
        'historical v12 parser path commit identity is internally exact');
      const historicalSource = stripPostCommitV12Source(parserSource);
      const rawBytes = Buffer.from(historicalSource, 'utf8');
      const normalizedBytes = Buffer.from(
        normalizeSelfPinValuesForNames(
          historicalSource, NORMALIZED_SELF_PIN_NAMES_V7), 'utf8');
      parseNormalizedSelfPinsV7(historicalSource);
      return {
        treeMode: entry.treeMode,
        treeType: entry.treeType,
        blobOid: entry.blobOid,
        contentSha256: entry.capturedHeadContentSha256,
        byteLength: entry.capturedHeadByteLength,
        lastCommit: entry.pathLastCommit,
        status: entry.liveStatus,
        rawWorktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
          cwd: ROOT,
          encoding: 'utf8',
          input: rawBytes
        }).trim(),
        rawContentSha256: sha256(rawBytes),
        rawByteLength: rawBytes.length,
        normalizedWorktreeGitOid: execFileSync('git', ['hash-object', '--stdin'], {
          cwd: ROOT,
          encoding: 'utf8',
          input: normalizedBytes
        }).trim(),
        normalizedContentSha256: sha256(normalizedBytes),
        normalizedByteLength: normalizedBytes.length
      };
    }
    if (entry.kind === 'append-prefix') {
      const reportBytes = readFileSync(resolve(ROOT, entry.path));
      const prefix = reportBytes.subarray(
        entry.prefixStartByte, entry.prefixEndByteExclusive);
      return {
        treeMode: entry.treeMode,
        treeType: entry.treeType,
        blobOid: entry.blobOid,
        contentSha256: entry.capturedHeadContentSha256,
        byteLength: entry.capturedHeadByteLength,
        lastCommit: entry.capturedHeadLastCommit,
        status: ' M',
        prefixContentSha256: sha256(prefix),
        prefixByteLength: prefix.length
      };
    }
    assert.equal(entry.kind, 'append-only-ledger-selector',
      'historical v12 closure has only declared entry kinds');
    return { selectorValidated: true };
  });
  return {
    globalHead: git(['rev-parse', 'HEAD']).trim(),
    entries
  };
}

function feature004V14RunInheritedV13AdversarialCases() {
  capturePostCommitV12AuthorityObservations =
    feature004V14HistoricalV12Observations;
  try {
    runPostCommitV13AdversarialCases();
  } finally {
    capturePostCommitV12AuthorityObservations =
      capturePostCommitV12AuthorityObservationsBeforeV14;
  }
  assert.equal(capturePostCommitV12AuthorityObservations,
    capturePostCommitV12AuthorityObservationsBeforeV14,
  'v14 restores the live v12 observation function after inherited adversaries');
}

function feature004V14RunAdversarialCases() {
  feature004V14RunInheritedV13AdversarialCases();
  const { reportContext, decoded } = feature004V14ParseHistoricalAuthority();
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const mutateHistory = (offset, label) => {
    const candidate = Buffer.from(reportBytes);
    candidate[offset] ^= 0x01;
    assert.throws(() => feature004V14HistoricalContext(candidate, true), label);
  };
  mutateHistory(reportContext.v12.raw.indexOf(POST_COMMIT_V12_MARKER)
    + reportContext.historyBytes.indexOf(Buffer.from(`<!-- ${POST_COMMIT_V12_MARKER}:start -->`)),
  'v14 rejects any v12 byte mutation');
  mutateHistory(reportContext.v13Context.startByte + 10,
    'v14 rejects any v13 byte mutation');
  const separatorMutation = Buffer.from(reportBytes);
  separatorMutation[reportContext.historyEnd - 1] = 0x20;
  assert.throws(() => feature004V14HistoricalContext(separatorMutation, true),
    'v14 rejects a changed historical two-LF separator');
  const boundedV14Report = reportBytes.subarray(0, reportContext.endByteExclusive + 2);
  assert.doesNotThrow(() => feature004V14ReportContext(boundedV14Report),
    'v14 bounded historical report retains its original report-final predicate');
  assert.throws(() => feature004V14ReportContext(Buffer.concat([
    boundedV14Report, Buffer.from('x', 'utf8')
  ])),
  'v14 rejects a non-two-LF final suffix');

  const evidence = feature004V14ValidEvidenceFixture();
  feature004V14ValidateEvidenceBlock(evidence, 'valid v14 evidence fixture');
  for (const [label, mutate] of [
    ['forged phase', (value) => { value.phase = 'foreign-phase'; }],
    ['forged claim source', (value) => { value.claimSource = 'interpreted'; }],
    ['forged command', (value) => { value.command = ''; }],
    ['forged exit', (value) => { value.exitCode = 1; }],
    ['forged raw output hash', (value) => { value.rawOutputSha256 = '0'.repeat(64); }]
  ]) {
    const candidate = structuredClone(evidence);
    mutate(candidate);
    assert.throws(() => feature004V14ValidateEvidenceBlock(candidate, label), label);
  }

  const base = [{
    scopeId: 'SCOPE-01',
    itemOrdinal: 1,
    uncheckedItemTextSha256: sha256(Buffer.from('- [ ] exact item\n')),
    checkboxState: 'unchecked',
    orderedEvidenceBlockSha256: []
  }];
  const checked = structuredClone(base);
  checked[0].checkboxState = 'checked';
  checked[0].orderedEvidenceBlockSha256 = [evidence.blockSha256];
  const evidenceByHash = new Map([[evidence.blockSha256, evidence]]);
  assert.doesNotThrow(() => feature004V14ValidateExecutionTransition(
    base, checked, evidenceByHash));
  const noEvidence = structuredClone(checked);
  noEvidence[0].orderedEvidenceBlockSha256 = [];
  assert.throws(() => feature004V14ValidateExecutionTransition(
    base, noEvidence, evidenceByHash),
  'v14 rejects a checked item without valid evidence');
  const changedText = structuredClone(checked);
  changedText[0].uncheckedItemTextSha256 = sha256(Buffer.from('- [ ] disguised edit\n'));
  assert.throws(() => feature004V14ValidateExecutionTransition(
    base, changedText, evidenceByHash),
  'v14 rejects item-text edits disguised as evidence');
  const duplicateKey = [...structuredClone(checked), structuredClone(checked[0])];
  assert.throws(() => feature004V14ValidateExecutionTransition(
    [...base, structuredClone(base[0])], duplicateKey, evidenceByHash),
  'v14 rejects a duplicate item key');
  const historicalBase = [{ ...base[0], checkboxState: 'checked',
    orderedEvidenceBlockSha256: [sha256(Buffer.from('first')), sha256(Buffer.from('second'))] }];
  for (const [label, hashes] of [
    ['removed prior evidence', historicalBase[0].orderedEvidenceBlockSha256.slice(1)],
    ['replaced prior evidence', [sha256(Buffer.from('replacement')), historicalBase[0].orderedEvidenceBlockSha256[1]]],
    ['reordered prior evidence', [...historicalBase[0].orderedEvidenceBlockSha256].reverse()]
  ]) {
    const candidate = structuredClone(historicalBase);
    candidate[0].orderedEvidenceBlockSha256 = hashes;
    assert.throws(() => feature004V14ValidateExecutionTransition(
      historicalBase, candidate, new Map(), { allowNoTransition: true }),
    `v14 rejects ${label}`);
  }

  const payloadMutations = [
    ['omitted protected path', (value) => {
      value.scopedAuthority.orderedPaths.pop();
      value.scopedAuthority.records.pop();
    }],
    ['serialized Feature 017', (value) => {
      value.scopedAuthority.orderedPaths[0] =
        'specs/017-decision-attention-and-developing-situations/spec.md';
      value.scopedAuthority.records[0].path = value.scopedAuthority.orderedPaths[0];
    }],
    ['path-limited commit list mismatch', (value) => {
      value.commitPolicy.commitAllowedPaths.reverse();
    }],
    ['planning edit through execution projection', (value) => {
      value.planningAuthority.planningProjection.sha256 = '0'.repeat(64);
    }]
  ];
  for (const [label, mutate] of payloadMutations) {
    const candidate = structuredClone(decoded.payload);
    mutate(candidate);
    assert.throws(() => feature004V14ValidatePayloadSchema(candidate),
      `v14 rejects ${label}`);
  }
  const startInventory = feature004V14InventorySnapshot();
  const changedInventory = {
    ...startInventory,
    records: structuredClone(startInventory.records)
  };
  changedInventory.records[0].rawStatus = changedLeafValue(
    changedInventory.records[0].rawStatus);
  assert.throws(() => feature004V14AssertInventoryStable(
    startInventory, changedInventory, 'v14 foreign inventory mutation'),
  'v14 rejects a foreign inventory status or byte mutation during capture');
  assert.throws(() => feature004V14AssertStagedPaths(
    [...FEATURE004_V14_COMMIT_PATHS, 'specs/017-decision-attention-and-developing-situations/spec.md'],
    FEATURE004_V14_COMMIT_PATHS, 'v14 staged paths exceed allowlist'),
  'v14 rejects staged paths beyond the exact allowlist');
  assert.throws(() => feature004V14AssertStagedPaths(
    [COLLISION_PARSER_PATH], FEATURE004_V14_COMMIT_PATHS,
    'v14 path-limited commit list is incomplete'),
  'v14 rejects a path-limited commit list mismatch');
}

function feature004V14StripSource(source) {
  const startNeedle = `\n${FEATURE004_V14_BEGIN}\n`;
  const endNeedle = `${FEATURE004_V14_END}\n\n`;
  assert.equal(source.split(startNeedle).length - 1, 1,
    'v14 source has exactly one additive branch start');
  assert.equal(source.split(endNeedle).length - 1, 1,
    'v14 source has exactly one additive branch end');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);
  let historical = source.slice(0, start) + '\n' + source.slice(end + endNeedle.length);
  const pinLine = `const POST_COMMIT_V14_BLOCK_SHA256 = '${POST_COMMIT_V14_BLOCK_SHA256}';\n`;
  assert.equal(countExact(historical, pinLine), 1,
    'v14 source has exactly one raw pin addition');
  historical = historical.replace(pinLine, '');
  return historical;
}

const stripPostCommitV13AdoptionSourceBeforeV14 = stripPostCommitV13AdoptionSource;
stripPostCommitV13AdoptionSource = (source) =>
  stripPostCommitV13AdoptionSourceBeforeV14(feature004V14StripSource(source));

parsePostCommitV13Authority = feature004V14HistoricalV13Authority;
const parseCollisionContractsBeforeV14 = parseCollisionContracts;
const runPostCommitV13AdversarialCasesBeforeV14 = runForeignSetV7AdversarialCases;
let feature004V14ValidationLogged = false;

function feature004V14ParseCollisionContracts() {
  const inherited = parsePostCommitV12AsV13History();
  const historicalV13 = feature004V14HistoricalV13Authority();
  const v14 = feature004V14ParseHistoricalAuthority();
  if (!feature004V14ValidationLogged) {
    console.log(`FEATURE004_V13_HISTORY_VALIDATED marker=${FEATURE004_CAPTURE_V13_MARKER} sha256=${POST_COMMIT_V13_BLOCK_SHA256} bytes=${POST_COMMIT_V13_BLOCK_BYTE_LENGTH} separatorBytes=2 liveComparison=false`);
    console.log(`FEATURE004_V14_VALIDATED marker=${FEATURE004_V14_MARKER} sha256=${POST_COMMIT_V14_BLOCK_SHA256} bytes=${v14.reportContext.blockBytes.length} authorityPaths=${v14.decoded.payload.scopedAuthority.orderedPaths.length} executionItems=${v14.decoded.payload.planningAuthority.executionProjection.records.length} foreignRecordsPersisted=false feature017Persisted=false`);
    feature004V14ValidationLogged = true;
  }
  return {
    ...inherited,
    postCommitV13: historicalV13.decoded.payload,
    postCommitV13Raw: historicalV13.reportContext.block,
    postCommitV14: v14.decoded.payload,
    postCommitV14Raw: v14.reportContext.block,
    postCommitV14Outer: v14.decoded.outer
  };
}

function feature004V14RunAllAdversarialCases() {
  assert.equal(runPostCommitV13AdversarialCasesBeforeV14,
    runPostCommitV13AdversarialCases,
  'v14 preserves the complete inherited v13 adversarial function identity');
  feature004V14RunAdversarialCases();
}

parseCollisionContracts = feature004V14ParseCollisionContracts;
runForeignSetV7AdversarialCases = feature004V14RunAllAdversarialCases;
assert.equal(parseCollisionContractsBeforeV14, parseCollisionContractsWithPostCommitV13,
  'v14 retains the v13 current parser as bounded historical implementation input');

if (process.env.FEATURE004_CAPTURE_V14_CHECK === '1') {
  feature004V14CaptureCheck();
  process.exit(0);
}

if (process.env.FEATURE004_CAPTURE_V14 === '1') {
  const capture = feature004V14CaptureCheck();
  process.stdout.write(`${capture.block}\n`);
  process.exit(0);
}

if (process.env.FEATURE004_VALIDATE_V14_CAPTURE === '1') {
  feature004V14ParseHistoricalAuthority();
  process.exit(0);
}
/* FEATURE-004-COLLISION-SCOPED-EVIDENCE-V14-END */

/* FEATURE-004-COLLISION-MULTI-ITEM-EVIDENCE-V15-BEGIN */
const FEATURE004_V15_MARKER = 'feature004-dirty-collision-multi-item-evidence-v15';
const FEATURE004_V15_ENCODING = 'br-canonical-json-utf8-b64/v1';
const FEATURE004_V15_BASE64_LINE_LENGTH = 56;
const FEATURE004_V15_BEGIN = '/* FEATURE-004-COLLISION-MULTI-ITEM-EVIDENCE-V15-BEGIN */';
const FEATURE004_V15_END = '/* FEATURE-004-COLLISION-MULTI-ITEM-EVIDENCE-V15-END */';
const FEATURE004_V15_FINDING = 'F004-V15-MULTI-ITEM-EVIDENCE-TRANSITION-001';
const FEATURE004_V15_PLAN_COMMIT = '38af035c6b25961646cdd342a2df60d4f9793406';
const FEATURE004_V15_SCOPES_PATH = 'specs/004-fx-regime-relative-value-lab/scopes.md';
const FEATURE004_V15_TEST_PLAN_PATH = 'specs/004-fx-regime-relative-value-lab/test-plan.json';
const FEATURE004_V15_STATE_PATH = 'specs/004-fx-regime-relative-value-lab/state.json';
const FEATURE004_V15_PLAN_PATHS = [
  FEATURE004_V15_SCOPES_PATH,
  FEATURE004_V15_TEST_PLAN_PATH,
  FEATURE004_V15_STATE_PATH
];
const FEATURE004_V15_IMPLEMENTATION_PATHS = [REPORT_PATH, COLLISION_PARSER_PATH];
const FEATURE004_V15_EVIDENCE_PATHS = [FEATURE004_V15_SCOPES_PATH];
const FEATURE004_V15_OUTER_FIELDS = [
  'schemaVersion',
  'marker',
  'encoding',
  'compressedPayloadSha256',
  'compressedPayloadByteLength',
  'payloadSha256',
  'payloadByteLength',
  'payloadBase64LineLength',
  'payloadBase64',
  'markerInclusiveByteLength',
  'normalizedSelfSha256'
];
const FEATURE004_V15_PAYLOAD_FIELDS = [
  'contractVersion',
  'findingId',
  'capturedAt',
  'predecessorAuthority',
  'planningBaseline',
  'implementationAuthority',
  'transitionPolicy',
  'evidencePolicy',
  'immutableTransitionSurface',
  'commitPolicy',
  'repositoryBindingReuse'
];
const FEATURE004_V15_ITEM_KEY_FIELDS = [
  'scopeId',
  'itemOrdinal',
  'uncheckedItemTextSha256'
];

function feature004V15ItemKey(record) {
  return {
    scopeId: record.scopeId,
    itemOrdinal: record.itemOrdinal,
    uncheckedItemTextSha256: record.uncheckedItemTextSha256
  };
}

function feature004V15ItemKeyString(record) {
  return FEATURE004_V15_ITEM_KEY_FIELDS.map((field) => record[field]).join('|');
}

function feature004V15EvidenceAt(lines, start) {
  const phase = lines[start]?.match(/^ {4}\*\*Phase:\*\* ([a-z-]+)\n?$/);
  if (!phase) return null;
  const command = lines[start + 1]?.match(/^ {4}\*\*Command:\*\* `([^\n`]+)`\n?$/);
  const exitCode = lines[start + 2]?.match(/^ {4}\*\*Exit Code:\*\* (-?\d+)\n?$/);
  const claimSource = lines[start + 3]?.match(/^ {4}\*\*Claim Source:\*\* (executed|interpreted|not-run)\n?$/);
  const output = lines[start + 4]?.match(/^ {4}\*\*Output:\*\*\n?$/);
  const fence = lines[start + 5]?.match(/^ {4}```(?:text)?\n?$/);
  if (!command || !exitCode || !claimSource || !output || !fence) return null;
  let end = start + 6;
  while (end < lines.length && !/^ {4}```\n?$/.test(lines[end])) end += 1;
  if (end >= lines.length) return null;
  const literalLines = lines.slice(start + 6, end);
  if (!literalLines.every((line) => /^ {4}/.test(line))) return null;
  const rawOutputLines = literalLines.map((line) =>
    line.slice(4).replace(/\n$/, ''));
  const rawOutputBytes = Buffer.from(rawOutputLines.join('\n'), 'utf8');
  const blockBytes = Buffer.from(lines.slice(start, end + 1).join(''), 'utf8');
  return {
    start,
    end,
    phase: phase[1],
    command: command[1],
    exitCode: Number(exitCode[1]),
    claimSource: claimSource[1],
    rawOutputLines,
    rawOutputBytes,
    rawOutputSha256: sha256(rawOutputBytes),
    blockBytes,
    blockSha256: sha256(blockBytes)
  };
}

function feature004V15ValidateEvidenceBlock(block, label) {
  assert.ok(FEATURE004_V14_PHASES.has(block.phase), `${label}.phase is closed`);
  assertNonemptyString(block.command, `${label}.command`);
  assert.equal(block.exitCode, 0, `${label}.exitCode is successful`);
  assert.equal(block.claimSource, 'executed', `${label}.claimSource is executed`);
  assert.ok(block.rawOutputLines.length >= 10,
    `${label}.rawOutputLines has at least ten literal lines`);
  assert.ok(Buffer.isBuffer(block.rawOutputBytes), `${label}.rawOutputBytes is binary-safe`);
  assert.deepEqual(block.rawOutputBytes,
    Buffer.from(block.rawOutputLines.join('\n'), 'utf8'),
  `${label}.rawOutputBytes matches literal output`);
  assert.equal(block.rawOutputSha256, sha256(block.rawOutputBytes),
    `${label}.rawOutputSha256 matches literal output`);
  assert.ok(Buffer.isBuffer(block.blockBytes), `${label}.blockBytes is binary-safe`);
  assert.equal(block.blockSha256, sha256(block.blockBytes),
    `${label}.blockSha256 matches the exact four-space block bytes`);
}

function feature004V15ScopesProjection(text) {
  const lines = feature004V14SplitLines(text);
  const projected = lines.slice();
  const records = [];
  const evidenceByHash = new Map();
  const ordinals = new Map();
  let scopeId = null;
  let inDefinitionOfDone = false;
  for (let index = 0; index < lines.length; index += 1) {
    const scope = lines[index].match(/^\*\*Scope ID:\*\* (SCOPE-\d+)[ \t]*\n?$/);
    if (scope) scopeId = scope[1];
    if (/^### Definition of Done\n?$/.test(lines[index])) {
      assert.ok(scopeId, 'every v15 Definition of Done belongs to a declared scope ID');
      inDefinitionOfDone = true;
      continue;
    }
    if (/^## Scope \d+[: —]/.test(lines[index])) {
      inDefinitionOfDone = false;
      scopeId = null;
      continue;
    }
    if (!inDefinitionOfDone || scopeId === null) continue;
    const checkbox = lines[index].match(/^(- \[)([ xX])(\] [^\n]*)(\n?)$/);
    if (!checkbox) continue;
    const itemOrdinal = (ordinals.get(scopeId) ?? 0) + 1;
    ordinals.set(scopeId, itemOrdinal);
    const uncheckedItemText = `${checkbox[1]} ${checkbox[3]}${checkbox[4]}`;
    projected[index] = uncheckedItemText;
    const evidenceBlocks = [];
    let cursor = index + 1;
    while (cursor < lines.length
        && !/^- \[[ xX]\] /.test(lines[cursor])
        && !/^## Scope \d+[: —]/.test(lines[cursor])) {
      const evidence = feature004V15EvidenceAt(lines, cursor);
      if (!evidence) {
        cursor += 1;
        continue;
      }
      feature004V15ValidateEvidenceBlock(evidence,
        `${scopeId} item ${itemOrdinal} evidence ${evidenceBlocks.length + 1}`);
      evidenceBlocks.push(evidence);
      evidenceByHash.set(evidence.blockSha256, evidence);
      for (let remove = evidence.start; remove <= evidence.end; remove += 1) {
        projected[remove] = '';
      }
      cursor = evidence.end + 1;
    }
    records.push({
      scopeId,
      itemOrdinal,
      uncheckedItemTextSha256: sha256(Buffer.from(uncheckedItemText, 'utf8')),
      checkboxState: checkbox[2] === ' ' ? 'unchecked' : 'checked',
      orderedEvidenceBlockSha256: evidenceBlocks.map(({ blockSha256 }) => blockSha256)
    });
  }
  records.forEach((record, index) => captureV13AssertExact(
    Object.keys(record), FEATURE004_V14_EXECUTION_RECORD_FIELDS,
    `v15 execution projection record ${index} field order`));
  const itemKeys = records.map(feature004V15ItemKeyString);
  assert.equal(new Set(itemKeys).size, records.length,
    'v15 execution projection item keys are unique');
  const planningBytes = Buffer.from(projected.join(''), 'utf8');
  return {
    planningBytes,
    planningSha256: sha256(planningBytes),
    records,
    recordsSha256: sha256(Buffer.from(JSON.stringify(records), 'utf8')),
    evidenceByHash
  };
}

function feature004V15ValidateExecutionTransition(baseRecords, currentRecords,
  evidenceByHash, { allowNoTransition = false } = {}) {
  assert.equal(currentRecords.length, baseRecords.length,
    'v15 execution transition retains item cardinality');
  const baseKeys = new Set();
  const currentKeys = new Set();
  const evidenceOwnerByHash = new Map();
  const transitionedItemKeys = [];
  baseRecords.forEach((base, index) => {
    const current = currentRecords[index];
    const baseKey = feature004V15ItemKeyString(base);
    const currentKey = feature004V15ItemKeyString(current);
    assert.equal(baseKeys.has(baseKey), false,
      `v15 base execution item ${index} key is unique`);
    assert.equal(currentKeys.has(currentKey), false,
      `v15 current execution item ${index} key is unique`);
    baseKeys.add(baseKey);
    currentKeys.add(currentKey);
    captureV13AssertExact(feature004V15ItemKey(current), feature004V15ItemKey(base),
      `v15 execution transition item ${index} key`);
    assert.deepEqual(current.orderedEvidenceBlockSha256.slice(
      0, base.orderedEvidenceBlockSha256.length),
    base.orderedEvidenceBlockSha256,
    `v15 execution transition item ${index} preserves prior evidence prefix`);
    for (const hash of base.orderedEvidenceBlockSha256) {
      if (!evidenceOwnerByHash.has(hash)) evidenceOwnerByHash.set(hash, baseKey);
    }
    if (base.checkboxState === 'checked') {
      assert.equal(current.checkboxState, 'checked',
        `v15 execution transition item ${index} cannot uncheck history`);
      assert.deepEqual(current.orderedEvidenceBlockSha256,
        base.orderedEvidenceBlockSha256,
      `v15 execution transition item ${index} cannot remove replace or reorder prior evidence`);
      return;
    }
    if (current.checkboxState === 'unchecked') {
      assert.deepEqual(current.orderedEvidenceBlockSha256,
        base.orderedEvidenceBlockSha256,
      `v15 execution transition item ${index} cannot add evidence while unchecked`);
      return;
    }
    assert.equal(current.checkboxState, 'checked',
      `v15 execution transition item ${index} checkbox state is closed`);
    const appended = current.orderedEvidenceBlockSha256.slice(
      base.orderedEvidenceBlockSha256.length);
    assert.ok(appended.length >= 1,
      `v15 execution transition item ${index} appends at least one evidence block`);
    appended.forEach((hash, evidenceIndex) => {
      const priorOwner = evidenceOwnerByHash.get(hash);
      assert.ok(priorOwner === undefined || priorOwner === currentKey,
        `v15 execution transition item ${index} evidence ${evidenceIndex} is not cloned across item keys`);
      evidenceOwnerByHash.set(hash, currentKey);
      const evidence = evidenceByHash.get(hash);
      assert.ok(evidence,
        `v15 execution transition item ${index} evidence ${evidenceIndex} resolves`);
      feature004V15ValidateEvidenceBlock(evidence,
        `v15 execution transition item ${index} evidence ${evidenceIndex}`);
    });
    transitionedItemKeys.push(feature004V15ItemKey(current));
  });
  if (allowNoTransition) {
    assert.equal(transitionedItemKeys.length, 0,
      'v15 allowNoTransition mode accepts exactly zero transitions');
  } else {
    assert.ok(transitionedItemKeys.length >= 1,
      'v15 required mode accepts one or more transitions');
  }
  return {
    transitionCount: transitionedItemKeys.length,
    transitionedItemKeys
  };
}

function feature004V15AssertStagedPaths(actual, expected, label) {
  feature004V14AssertStagedPaths(actual, expected, label);
}

function feature004V15AssertCaptureStagedPaths(paths, label) {
  const isExactImplementationStage = paths.length === FEATURE004_V15_IMPLEMENTATION_PATHS.length
    && paths.every((path, index) => path === FEATURE004_V15_IMPLEMENTATION_PATHS[index]);
  assert.ok(paths.length === 0 || isExactImplementationStage,
    `${label} are clean or the exact implementation allowlist`);
  assert.equal(new Set(paths).size, paths.length, `${label} contains no duplicate path`);
}

function feature004V15AssertNoForeignPersistence(paths, label) {
  assert.equal(paths.some((path) => path.startsWith('specs/017-')), false,
    `${label} persists no Feature 017 path`);
  assert.equal(paths.some((path) => ![
    ...FEATURE004_V15_PLAN_PATHS,
    ...FEATURE004_V15_IMPLEMENTATION_PATHS
  ].includes(path)), false, `${label} persists no foreign path`);
}

function feature004V15ValidateScopesTransition(baseText, currentText, {
  allowNoTransition = false,
  stagedPaths,
  expectedStagedPaths,
  baseStateText = '',
  currentStateText = baseStateText,
  baseTestPlanText = '',
  currentTestPlanText = baseTestPlanText
} = {}) {
  if (expectedStagedPaths !== undefined) {
    feature004V15AssertStagedPaths(stagedPaths, expectedStagedPaths,
      'v15 transition staged allowlist');
  }
  assert.equal(currentStateText, baseStateText,
    'v15 transition cannot edit status planning routing or certification');
  assert.equal(currentTestPlanText, baseTestPlanText,
    'v15 transition cannot edit the Test Plan projection');
  const base = feature004V15ScopesProjection(baseText);
  const current = feature004V15ScopesProjection(currentText);
  assert.equal(current.planningSha256, base.planningSha256,
    'v15 transition retains the exact planning projection');
  assert.equal(current.planningBytes.length, base.planningBytes.length,
    'v15 transition retains the exact planning projection byte length');
  return feature004V15ValidateExecutionTransition(
    base.records, current.records, current.evidenceByHash, { allowNoTransition });
}

function feature004V15NormalizedParserBytes(source) {
  const pattern = /^const POST_COMMIT_V15_BLOCK_SHA256 = '([a-f0-9]{64})';$/gm;
  const matches = [...source.matchAll(pattern)];
  assert.equal(matches.length, 1,
    'v15 parser has exactly one canonical raw pin literal');
  return Buffer.from(source.replace(matches[0][0],
    `const POST_COMMIT_V15_BLOCK_SHA256 = '${'0'.repeat(64)}';`), 'utf8');
}

function feature004V15TransitionPolicy() {
  return {
    supersedesOnly: 'post-v15-execution-transition-cardinality',
    historicalV14SingularPolicyImmutable: true,
    itemKey: FEATURE004_V15_ITEM_KEY_FIELDS,
    itemKeysUnique: true,
    requiredModeMinimumTransitionCount: 1,
    requiredModeMaximumTransitionCount: null,
    allowNoTransitionCount: 0,
    transitionCountEqualsNewlyCheckedItemCount: true,
    returnExactTransitionedItemKeys: true,
    transitionedItemKeyOrder: 'planning-order',
    mixedBatchDisposition: 'reject-entire-transition-and-return-no-accepted-key-list'
  };
}

function feature004V15EvidencePolicy() {
  return {
    minimumAppendedBlocksPerTransitionedItem: 1,
    validateEveryAppendedBlockIndependently: true,
    grammar: 'exact-v14-four-space-evidence-form-for-headers-fences-and-raw-output-lines',
    requiredPhaseSet: [...FEATURE004_V14_PHASES],
    requiredCommand: 'exact-nonempty',
    requiredExitCode: 0,
    requiredClaimSource: 'executed',
    minimumRawOutputLines: 10,
    rawOutputSha256Required: true,
    blockSha256Required: true,
    duplicateEvidenceHashAcrossDistinctItemKeys: 'reject',
    sharedEvidenceException: false
  };
}

function feature004V15ImmutableTransitionSurface() {
  return {
    priorCheckedItemsImmutable: true,
    priorEvidencePrefixPreserved: true,
    uncheckedItemEvidenceAllowed: false,
    itemTextOrderCardinalityOrdinalMutationAllowed: false,
    planningProjectionMutationAllowed: false,
    testPlanProjectionMutationAllowed: false,
    scopeOrTopLevelStatusMutationAllowed: false,
    planningRoutingMutationAllowed: false,
    certificationMutationAllowed: false,
    foreignPathPersistenceAllowed: false,
    scopeTwoPickupAllowed: false
  };
}

function feature004V15RepositoryBindingReuse(v14Binding) {
  return {
    source: 'immutable-v14-payload.repositoryBinding',
    repositoryRoot: '/home/redacted/research-lab',
    repositoryAlias: v14Binding.repositoryAlias,
    sessionId: v14Binding.sessionId,
    decisionId: v14Binding.decisionId,
    controlRevision: v14Binding.controlRevision,
    controlPathDigest: v14Binding.controlPathDigest,
    authority: v14Binding.authority,
    transition: v14Binding.transition,
    scopeKind: v14Binding.scopeKind,
    actionable: v14Binding.actionable,
    mirrorRevision: 56,
    recaptureAllowed: false
  };
}

function feature004V15CapturedAt() {
  const capturedAt = new Date(captureV13GitText([
    'show', '-s', '--format=%cI', FEATURE004_V15_PLAN_COMMIT
  ]).trim()).toISOString();
  assertUtcTimestamp(capturedAt, 'v15 payload capturedAt');
  return capturedAt;
}

function feature004V15CaptureOnce() {
  feature004V15AssertCaptureStagedPaths(feature004V14StagedPaths(),
    'v15 capture staged paths');
  const v14 = feature004V14ParseHistoricalAuthority();
  assert.equal(v14.reportContext.blockBytes.length, POST_COMMIT_V14_BLOCK_BYTE_LENGTH,
    'v15 capture reuses the exact v14 raw byte length');
  const head = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
  captureV13AssertAncestor(FEATURE004_V15_PLAN_COMMIT, head,
    'v15 planning baseline to capture HEAD');
  FEATURE004_V15_PLAN_PATHS.forEach((path) => {
    assert.equal(feature004V14LastCommit(path), FEATURE004_V15_PLAN_COMMIT,
      `${path} retains the v15 planning baseline commit`);
  });
  const parserBytes = feature004V15NormalizedParserBytes(
    readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8'));
  const payload = {
    contractVersion: 'feature004-dirty-collision-multi-item-evidence/v15',
    findingId: FEATURE004_V15_FINDING,
    capturedAt: feature004V15CapturedAt(),
    predecessorAuthority: {
      marker: FEATURE004_V14_MARKER,
      rawBlockSha256: POST_COMMIT_V14_BLOCK_SHA256,
      markerInclusiveByteLength: POST_COMMIT_V14_BLOCK_BYTE_LENGTH,
      successorSeparator: {
        byteLength: 2,
        base64: 'Cgo=',
        sha256: sha256(Buffer.from('\n\n'))
      },
      validatedThroughHistoricalAdapter: true,
      currentFileFinalPredicateAfterV15: false,
      historicalRequiredTransitionCount: 1,
      historicalAllowNoTransitionCount: 0
    },
    planningBaseline: {
      commit: FEATURE004_V15_PLAN_COMMIT,
      protectedPaths: FEATURE004_V15_PLAN_PATHS,
      scopesBaseline: 'exact-committed-HEAD-scopes-at-transaction-start',
      nextBatchBaseline: 'prior-evidence-commit-HEAD-scopes',
      replacementAuthoritySnapshotStored: false
    },
    implementationAuthority: {
      path: COLLISION_PARSER_PATH,
      normalization: 'v15-raw-pin-zeroed/v1',
      contentSha256: sha256(parserBytes),
      byteLength: parserBytes.length
    },
    transitionPolicy: feature004V15TransitionPolicy(),
    evidencePolicy: feature004V15EvidencePolicy(),
    immutableTransitionSurface: feature004V15ImmutableTransitionSurface(),
    commitPolicy: {
      implementationMode: 'allowNoTransition',
      implementationAllowedPaths: FEATURE004_V15_IMPLEMENTATION_PATHS,
      evidenceMode: 'required',
      evidenceAllowedPaths: FEATURE004_V15_EVIDENCE_PATHS,
      stateSharesEvidenceCommit: false,
      certificationSharesEvidenceCommit: false,
      exactPathLimitedCommitRequired: true,
      gitCommitOnlyRequired: true
    },
    repositoryBindingReuse: feature004V15RepositoryBindingReuse(
      v14.decoded.payload.repositoryBinding)
  };
  captureV13AssertExact(Object.keys(payload), FEATURE004_V15_PAYLOAD_FIELDS,
    'v15 payload top-level field order');
  return payload;
}

function feature004V15RenderOuter(outer) {
  return [
    '{',
    `"schemaVersion":${JSON.stringify(outer.schemaVersion)},`,
    `"marker":${JSON.stringify(outer.marker)},`,
    `"encoding":${JSON.stringify(outer.encoding)},`,
    ...feature004V14RenderHashArray('compressedPayloadSha256', outer.compressedPayloadSha256, true),
    `"compressedPayloadByteLength":${outer.compressedPayloadByteLength},`,
    ...feature004V14RenderHashArray('payloadSha256', outer.payloadSha256, true),
    `"payloadByteLength":${outer.payloadByteLength},`,
    `"payloadBase64LineLength":${outer.payloadBase64LineLength},`,
    '"payloadBase64":[',
    ...outer.payloadBase64.map((line, index) =>
      `${JSON.stringify(line)}${index === outer.payloadBase64.length - 1 ? '' : ','}`),
    '],',
    `"markerInclusiveByteLength":${outer.markerInclusiveByteLength},`,
    ...feature004V14RenderHashArray('normalizedSelfSha256', outer.normalizedSelfSha256, false),
    '}'
  ].join('\n');
}

function feature004V15RenderBlock(outer) {
  return [
    `<!-- ${FEATURE004_V15_MARKER}:start -->`,
    '```json',
    feature004V15RenderOuter(outer),
    '```',
    `<!-- ${FEATURE004_V15_MARKER}:end -->`
  ].join('\n');
}

function feature004V15Compress(payloadBytes) {
  return feature004V14Compress(payloadBytes);
}

function feature004V15BuildBlock(payload) {
  const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');
  const compressedPayloadBytes = feature004V15Compress(payloadBytes);
  const payloadBase64 = compressedPayloadBytes.toString('base64').match(/.{1,56}/g) ?? [];
  assert.ok(payloadBase64.length > 0, 'v15 compressed payload has base64 lines');
  const outer = {
    schemaVersion: 'feature004-multi-item-evidence-v15-capture-envelope/v1',
    marker: FEATURE004_V15_MARKER,
    encoding: FEATURE004_V15_ENCODING,
    compressedPayloadSha256: feature004V14HashChunks(
      sha256(compressedPayloadBytes), 'v15 compressed payload hash'),
    compressedPayloadByteLength: compressedPayloadBytes.length,
    payloadSha256: feature004V14HashChunks(sha256(payloadBytes), 'v15 payload hash'),
    payloadByteLength: payloadBytes.length,
    payloadBase64LineLength: FEATURE004_V15_BASE64_LINE_LENGTH,
    payloadBase64,
    markerInclusiveByteLength: 0,
    normalizedSelfSha256: ['0'.repeat(32), '0'.repeat(32)]
  };
  for (;;) {
    const byteLength = Buffer.byteLength(feature004V15RenderBlock(outer));
    if (byteLength === outer.markerInclusiveByteLength) break;
    outer.markerInclusiveByteLength = byteLength;
  }
  outer.normalizedSelfSha256 = feature004V14HashChunks(sha256(
    feature004V15RenderBlock(outer)), 'v15 normalized outer self hash');
  const block = feature004V15RenderBlock(outer);
  assert.equal(Buffer.byteLength(block), outer.markerInclusiveByteLength,
    'v15 marker-inclusive byte length is stable');
  return { block, outer, payloadBytes, compressedPayloadBytes };
}

function feature004V15DecodeBlock(block) {
  const start = `<!-- ${FEATURE004_V15_MARKER}:start -->`;
  const end = `<!-- ${FEATURE004_V15_MARKER}:end -->`;
  const match = block.match(new RegExp(`^${start}\\n` +
    '```json\\n([\\s\\S]*?)\\n```\\n' + `${end}$`));
  assert.ok(match, 'v15 block is one exact marker-delimited JSON envelope');
  const outer = JSON.parse(match[1]);
  captureV13AssertExact(Object.keys(outer), FEATURE004_V15_OUTER_FIELDS,
    'v15 outer field order');
  assert.equal(feature004V15RenderBlock(outer), block,
    'v15 outer canonical renderer is byte-identical');
  const compressed = Buffer.from(outer.payloadBase64.join(''), 'base64');
  assert.equal(compressed.toString('base64'), outer.payloadBase64.join(''),
    'v15 base64 decode and canonical re-encode are identical');
  assert.equal(compressed.length, outer.compressedPayloadByteLength,
    'v15 compressed byte length is exact');
  assert.equal(sha256(compressed), outer.compressedPayloadSha256.join(''),
    'v15 compressed payload hash is exact');
  const payloadBytes = brotliDecompressSync(compressed);
  assert.deepEqual(feature004V15Compress(payloadBytes), compressed,
    'v15 deterministic Brotli recompression is exact');
  assert.equal(payloadBytes.length, outer.payloadByteLength,
    'v15 payload byte length is exact');
  assert.equal(sha256(payloadBytes), outer.payloadSha256.join(''),
    'v15 payload hash is exact');
  const payload = JSON.parse(payloadBytes.toString('utf8'));
  assert.deepEqual(Buffer.from(JSON.stringify(payload), 'utf8'), payloadBytes,
    'v15 payload is canonical JSON.stringify bytes');
  assert.equal(Buffer.byteLength(block), outer.markerInclusiveByteLength,
    'v15 marker-inclusive length covers the exact block');
  const normalized = {
    ...outer,
    normalizedSelfSha256: ['0'.repeat(32), '0'.repeat(32)]
  };
  assert.equal(sha256(feature004V15RenderBlock(normalized)),
    outer.normalizedSelfSha256.join(''),
  'v15 normalized outer self hash is exact');
  return { outer, payload, payloadBytes, compressedPayloadBytes: compressed };
}

function feature004V15StableCapture() {
  const firstPayload = feature004V15CaptureOnce();
  const first = feature004V15BuildBlock(firstPayload);
  const firstDecoded = feature004V15DecodeBlock(first.block);
  captureV13AssertExact(firstDecoded.payload, firstPayload,
    'v15 first capture decoded payload');
  const secondPayload = feature004V15CaptureOnce();
  const second = feature004V15BuildBlock(secondPayload);
  captureV13AssertExact(secondPayload, firstPayload,
    'v15 stable double capture payload');
  assert.equal(second.block, first.block,
    'v15 stable double capture marker-inclusive bytes');
  return { ...first, payload: firstPayload };
}

function feature004V15CaptureCheck() {
  const capture = feature004V15StableCapture();
  console.log([
    'FEATURE004_V15_CAPTURE_CHECK',
    `rawSha256=${sha256(Buffer.from(capture.block, 'utf8'))}`,
    `rawBytes=${Buffer.byteLength(capture.block)}`,
    `payloadSha256=${capture.outer.payloadSha256.join('')}`,
    `compressedPayloadSha256=${capture.outer.compressedPayloadSha256.join('')}`,
    `planningBaseline=${capture.payload.planningBaseline.commit}`,
    'replacementAuthoritySnapshotStored=false',
    'feature017Persisted=false'
  ].join(' '));
  return capture;
}

function feature004V15ReportContext(reportBytes) {
  const v14 = feature004V14HistoricalReportContext(reportBytes);
  assert.equal(v14.blockBytes.length, POST_COMMIT_V14_BLOCK_BYTE_LENGTH,
    'v15 report retains exact v14 marker-inclusive bytes');
  assert.equal(sha256(v14.blockBytes), POST_COMMIT_V14_BLOCK_SHA256,
    'v15 report retains exact v14 raw hash');
  const startMarker = Buffer.from(`<!-- ${FEATURE004_V15_MARKER}:start -->`, 'utf8');
  const endMarker = Buffer.from(`<!-- ${FEATURE004_V15_MARKER}:end -->`, 'utf8');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, startMarker), 1,
    'report contains exactly one v15 start marker');
  assert.equal(captureV13BufferOccurrenceCount(reportBytes, endMarker), 1,
    'report contains exactly one v15 end marker');
  const startByte = reportBytes.indexOf(startMarker);
  assert.equal(startByte, v14.endByteExclusive + 2,
    'v15 begins immediately after the exact v14 two-LF separator');
  const endMarkerStartByte = reportBytes.indexOf(endMarker, startByte);
  assert.ok(endMarkerStartByte > startByte, 'v15 marker order is exact');
  const endByteExclusive = endMarkerStartByte + endMarker.length;
  assert.deepEqual(reportBytes.subarray(endByteExclusive), Buffer.from('\n\n'),
    'v15 is report-final with exactly two LF suffix bytes');
  const blockBytes = reportBytes.subarray(startByte, endByteExclusive);
  const block = blockBytes.toString('utf8');
  assert.deepEqual(Buffer.from(block, 'utf8'), blockBytes,
    'v15 marker-inclusive bytes are lossless UTF-8');
  return { v14, startByte, endMarkerStartByte, endByteExclusive, blockBytes, block };
}

function feature004V15ValidatePayloadSchema(payload) {
  captureV13AssertExact(Object.keys(payload), FEATURE004_V15_PAYLOAD_FIELDS,
    'v15 payload top-level field order');
  assert.equal(payload.contractVersion,
    'feature004-dirty-collision-multi-item-evidence/v15');
  assert.equal(payload.findingId, FEATURE004_V15_FINDING);
  assertUtcTimestamp(payload.capturedAt, 'v15 payload capturedAt');
  captureV13AssertExact(payload.predecessorAuthority, {
    marker: FEATURE004_V14_MARKER,
    rawBlockSha256: POST_COMMIT_V14_BLOCK_SHA256,
    markerInclusiveByteLength: POST_COMMIT_V14_BLOCK_BYTE_LENGTH,
    successorSeparator: {
      byteLength: 2,
      base64: 'Cgo=',
      sha256: sha256(Buffer.from('\n\n'))
    },
    validatedThroughHistoricalAdapter: true,
    currentFileFinalPredicateAfterV15: false,
    historicalRequiredTransitionCount: 1,
    historicalAllowNoTransitionCount: 0
  }, 'v15 predecessor authority');
  captureV13AssertExact(payload.planningBaseline, {
    commit: FEATURE004_V15_PLAN_COMMIT,
    protectedPaths: FEATURE004_V15_PLAN_PATHS,
    scopesBaseline: 'exact-committed-HEAD-scopes-at-transaction-start',
    nextBatchBaseline: 'prior-evidence-commit-HEAD-scopes',
    replacementAuthoritySnapshotStored: false
  }, 'v15 planning baseline');
  captureV13AssertExact(payload.transitionPolicy, feature004V15TransitionPolicy(),
    'v15 transition policy');
  captureV13AssertExact(payload.evidencePolicy, feature004V15EvidencePolicy(),
    'v15 evidence policy');
  captureV13AssertExact(payload.immutableTransitionSurface,
    feature004V15ImmutableTransitionSurface(), 'v15 immutable transition surface');
  captureV13AssertExact(payload.commitPolicy, {
    implementationMode: 'allowNoTransition',
    implementationAllowedPaths: FEATURE004_V15_IMPLEMENTATION_PATHS,
    evidenceMode: 'required',
    evidenceAllowedPaths: FEATURE004_V15_EVIDENCE_PATHS,
    stateSharesEvidenceCommit: false,
    certificationSharesEvidenceCommit: false,
    exactPathLimitedCommitRequired: true,
    gitCommitOnlyRequired: true
  }, 'v15 commit policy');
  captureV13AssertExact(payload.repositoryBindingReuse, {
    source: 'immutable-v14-payload.repositoryBinding',
    repositoryRoot: '/home/redacted/research-lab',
    repositoryAlias: 'research-lab',
    sessionId: 'vscode-e24db39cf992f7ccd8ec75209602db59',
    decisionId: 'rb:vscode-e24db39cf992f7ccd8ec75209602db59:56',
    controlRevision: 56,
    controlPathDigest: 'sha256:e6d858a6f9bc1824d3a2cea3746d741a5bad41016d613dc242312185af9761fa',
    authority: 'concrete-target',
    transition: 'confirmed',
    scopeKind: 'command',
    actionable: true,
    mirrorRevision: 56,
    recaptureAllowed: false
  }, 'v15 repository binding reuse');
  assert.equal(JSON.stringify(payload).includes('specs/017-'), false,
    'v15 payload persists no Feature 017 path');
  assertExactOrderedKeys(payload.implementationAuthority,
    ['path', 'normalization', 'contentSha256', 'byteLength'],
    'v15 implementation authority');
  assert.equal(payload.implementationAuthority.path, COLLISION_PARSER_PATH);
  assert.equal(payload.implementationAuthority.normalization,
    'v15-raw-pin-zeroed/v1');
  assertSha256(payload.implementationAuthority.contentSha256,
    'v15 normalized parser content hash');
  assert.ok(Number.isSafeInteger(payload.implementationAuthority.byteLength)
    && payload.implementationAuthority.byteLength > 0,
  'v15 normalized parser byte length is positive');
}

function feature004V15ParseAuthority({ requireImplementationStaging = false } = {}) {
  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const reportContext = feature004V15ReportContext(reportBytes);
  assert.equal(sha256(reportContext.blockBytes), POST_COMMIT_V15_BLOCK_SHA256,
    'v15 raw report block hash is independently pinned');
  const decoded = feature004V15DecodeBlock(reportContext.block);
  feature004V15ValidatePayloadSchema(decoded.payload);
  const parserBytes = feature004V15NormalizedParserBytes(
    readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8'));
  assert.equal(sha256(parserBytes),
    decoded.payload.implementationAuthority.contentSha256,
  'v15 normalized parser hash matches implementation authority');
  assert.equal(parserBytes.length,
    decoded.payload.implementationAuthority.byteLength,
  'v15 normalized parser byte length matches implementation authority');
  const head = captureV13GitText(['rev-parse', '--verify', 'HEAD^{commit}']).trim();
  captureV13AssertAncestor(FEATURE004_V15_PLAN_COMMIT, head,
    'v15 planning baseline to current HEAD');
  const stagedPaths = feature004V14StagedPaths();
  if (requireImplementationStaging) {
    feature004V15AssertStagedPaths(stagedPaths, FEATURE004_V15_IMPLEMENTATION_PATHS,
      'v15 focused implementation staged paths');
  } else {
    feature004V15AssertCaptureStagedPaths(stagedPaths, 'v15 current staged paths');
  }
  const baseScopes = captureV13GitText(['show', `HEAD:${FEATURE004_V15_SCOPES_PATH}`]);
  const currentScopes = readFileSync(resolve(ROOT, FEATURE004_V15_SCOPES_PATH), 'utf8');
  const baseState = captureV13GitText(['show', `HEAD:${FEATURE004_V15_STATE_PATH}`]);
  const currentState = readFileSync(resolve(ROOT, FEATURE004_V15_STATE_PATH), 'utf8');
  const baseTestPlan = captureV13GitText(['show', `HEAD:${FEATURE004_V15_TEST_PLAN_PATH}`]);
  const currentTestPlan = readFileSync(resolve(ROOT, FEATURE004_V15_TEST_PLAN_PATH), 'utf8');
  const transition = feature004V15ValidateScopesTransition(baseScopes, currentScopes, {
    allowNoTransition: true,
    stagedPaths,
    expectedStagedPaths: stagedPaths,
    baseStateText: baseState,
    currentStateText: currentState,
    baseTestPlanText: baseTestPlan,
    currentTestPlanText: currentTestPlan
  });
  assert.deepEqual(readFileSync(resolve(ROOT, REPORT_PATH)), reportBytes,
    'v15 validation leaves every report byte unchanged');
  return { reportContext, decoded, transition };
}

function feature004V15RenderEvidence({
  phase = 'test',
  command = 'node --test tests/feature-004-dirty-tree-collision.test.mjs',
  exitCode = 0,
  claimSource = 'executed',
  rawOutputLines = Array.from({ length: 10 }, (_, index) =>
    `literal v15 output line ${index + 1}`),
  indent = '    '
} = {}) {
  return [
    `${indent}**Phase:** ${phase}`,
    `${indent}**Command:** \`${command}\``,
    `${indent}**Exit Code:** ${exitCode}`,
    `${indent}**Claim Source:** ${claimSource}`,
    `${indent}**Output:**`,
    `${indent}\`\`\`text`,
    ...rawOutputLines.map((line) => `${indent}${line}`),
    `${indent}\`\`\``
  ].join('\n');
}

function feature004V15ScopesFixture(items, status = 'In Progress') {
  return [
    '## Scope 1 — V15 fixture',
    `Status: ${status}`,
    '**Scope ID:** SCOPE-01',
    '### Definition of Done',
    ...items.flatMap((item) => [
      `- [${item.checked ? 'x' : ' '}] ${item.text}`,
      ...(item.evidence ?? [])
    ]),
    ''
  ].join('\n');
}

function feature004V15CloneEvidence(evidence) {
  return {
    ...evidence,
    rawOutputLines: [...evidence.rawOutputLines],
    rawOutputBytes: Buffer.from(evidence.rawOutputBytes),
    blockBytes: Buffer.from(evidence.blockBytes)
  };
}

function feature004V15HistoricalParserAuthorities() {
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const v10 = parseReportBlock(report, POST_COMMIT_V10_MARKER).value;
  const v11 = parseReportBlock(report, POST_COMMIT_V11_MARKER).value;
  return {
    v9: v10.v9SelfIdentityDisposition.observedUnderExactV9Reconstruction,
    v10: v10.identityContract.parserSelfCapture,
    v11: v11.identityContract.parserSelfCapture
  };
}

function feature004V15DiffFromRevisionSource(revision, source) {
  const activeGit = git;
  git = (args) => args.length === 2
    && args[0] === 'show'
    && args[1] === `HEAD:${COLLISION_PARSER_PATH}`
    ? activeGit(['show', `${revision}:${COLLISION_PARSER_PATH}`])
    : activeGit(args);
  try {
    return postCommitV10DiffFromHeadSource(COLLISION_PARSER_PATH, source);
  } finally {
    git = activeGit;
  }
}

function feature004V15WithHistoricalParserMetadata(authority, label, historicalDiff,
  historicalRevision, run) {
  assert.ok(authority && typeof authority === 'object' && !Array.isArray(authority),
    `${label} is an immutable historical identity object`);
  if (Object.hasOwn(authority, 'path')) {
    assert.equal(authority.path, COLLISION_PARSER_PATH, `${label} path is exact`);
  }
  assert.equal(authority.pathKind, 'tracked', `${label} path kind is exact`);
  assert.equal(authority.status, ' M', `${label} status is the historical unstaged state`);
  assert.equal(authority.staged, false, `${label} historical index is unchanged`);
  assert.equal(authority.unstaged, true, `${label} historical worktree is dirty`);
  for (const field of ['headOid', 'indexOid', 'lastCommit']) {
    assert.match(authority[field], /^[a-f0-9]{40}$/, `${label}.${field} is an exact Git OID`);
  }
  const activeShortStatus = shortStatus;
  const activeHeadOid = headOid;
  const activeIndexOid = indexOid;
  const activeLastCommit = lastCommit;
  const activeGit = git;
  shortStatus = (path) => path === COLLISION_PARSER_PATH
    ? authority.status : activeShortStatus(path);
  headOid = (path) => path === COLLISION_PARSER_PATH
    ? authority.headOid : activeHeadOid(path);
  indexOid = (path) => path === COLLISION_PARSER_PATH
    ? authority.indexOid : activeIndexOid(path);
  lastCommit = (path) => path === COLLISION_PARSER_PATH
    ? authority.lastCommit : activeLastCommit(path);
  git = (args) => {
    if (historicalDiff !== null
        && args.length === 5
        && args[0] === 'diff'
        && args[1] === '--no-ext-diff'
        && args[2] === '--unified=0'
        && args[3] === '--'
        && args[4] === COLLISION_PARSER_PATH) {
      return historicalDiff;
    }
    if (historicalRevision !== null
        && args.length === 2
        && args[0] === 'show'
        && args[1] === `HEAD:${COLLISION_PARSER_PATH}`) {
      return activeGit(['show', `${historicalRevision}:${COLLISION_PARSER_PATH}`]);
    }
    return activeGit(args);
  };
  try {
    return run();
  } finally {
    shortStatus = activeShortStatus;
    headOid = activeHeadOid;
    indexOid = activeIndexOid;
    lastCommit = activeLastCommit;
    git = activeGit;
  }
}

function feature004V15HistoricalParserAdapter(original, authorityName, label,
  revision = null) {
  return (...args) => {
    const authority = feature004V15HistoricalParserAuthorities()[authorityName];
    const historicalRevision = revision ?? authority.repositoryHead;
    assert.match(historicalRevision, /^[a-f0-9]{40}$/,
      `${label} historical revision is an exact Git commit`);
    const source = args[1] ?? readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
    const historicalDiff = feature004V15DiffFromRevisionSource(historicalRevision, source);
    return feature004V15WithHistoricalParserMetadata(
      authority, label, historicalDiff, historicalRevision, () => original(...args));
  };
}

postCommitV9ObservedIdentityFromV10Source = feature004V15HistoricalParserAdapter(
  postCommitV9ObservedIdentityFromV10Source, 'v9', 'v9 observed parser metadata');
postCommitV9HistoricalParserIdentity = () => postCommitV9ObservedIdentityFromV10Source();
postCommitV9ObservedIdentityFromV10SourceAsV11History = feature004V15HistoricalParserAdapter(
  postCommitV9ObservedIdentityFromV10SourceAsV11History, 'v9',
  'v9 observed v11-history parser metadata');
postCommitV9ObservedIdentityFromV10SourceAsV12History = feature004V15HistoricalParserAdapter(
  postCommitV9ObservedIdentityFromV10SourceAsV12History, 'v9',
  'v9 observed v12-history parser metadata');
postCommitV10ParserRecord = feature004V15HistoricalParserAdapter(
  postCommitV10ParserRecord, 'v10', 'v10 historical parser metadata',
  POST_COMMIT_V10_REQUIRED_HEAD);
postCommitV11ParserRecord = feature004V15HistoricalParserAdapter(
  postCommitV11ParserRecord, 'v11', 'v11 historical parser metadata',
  POST_COMMIT_V11_REQUIRED_HEAD);

function feature004V15HistoricalReplayForCurrentStatus(currentStatus) {
  assert.ok([' M', 'M '].includes(currentStatus),
    'v15 historical replay fixture uses an exact unstaged or staged porcelain mode');
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const v10 = parseReportBlock(report, POST_COMMIT_V10_MARKER).value;
  const v11 = parseReportBlock(report, POST_COMMIT_V11_MARKER).value;
  const v10Summary = v10.currentMatrix.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  const v11Summary = v11.currentMatrix.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  const activeShortStatus = shortStatus;
  shortStatus = (path) => path === COLLISION_PARSER_PATH
    ? currentStatus : activeShortStatus(path);
  try {
    return {
      v9: postCommitV9ObservedIdentityFromV10SourceAsV12History(),
      v10: postCommitV13HistoricalV10ParserRecord(v10Summary),
      v11: postCommitV13HistoricalV11ParserRecord(v11Summary)
    };
  } finally {
    shortStatus = activeShortStatus;
  }
}

function feature004V15AssertHistoricalReplayStagingModes() {
  feature004V15AssertStagedPaths([], [], 'v15 ordinary parse unstaged paths');
  feature004V15AssertCaptureStagedPaths([], 'v15 capture clean staged paths');
  const unstagedReplay = feature004V15HistoricalReplayForCurrentStatus(' M');
  feature004V15AssertStagedPaths(FEATURE004_V15_IMPLEMENTATION_PATHS,
    FEATURE004_V15_IMPLEMENTATION_PATHS, 'v15 exact implementation staged paths');
  feature004V15AssertCaptureStagedPaths(FEATURE004_V15_IMPLEMENTATION_PATHS,
    'v15 capture exact implementation staged paths');
  const stagedReplay = feature004V15HistoricalReplayForCurrentStatus('M ');
  assert.deepEqual(stagedReplay, unstagedReplay,
    'v15 staged and unstaged current modes preserve identical historical records');
  for (const [version, record] of Object.entries(stagedReplay)) {
    assert.equal(record.status, ' M', `${version} retains historical unstaged status`);
    assert.equal(record.staged, false, `${version} retains historical staged=false`);
    assert.equal(record.unstaged, true, `${version} retains historical unstaged=true`);
  }
  assert.throws(() => feature004V15AssertStagedPaths([
    ...FEATURE004_V15_IMPLEMENTATION_PATHS,
    'specs/017-decision-attention-and-developing-situations/report.md'
  ], FEATURE004_V15_IMPLEMENTATION_PATHS, 'v15 foreign implementation stage'),
  'v15 rejects a foreign staged implementation path');
  assert.throws(() => feature004V15AssertCaptureStagedPaths([
    REPORT_PATH
  ], 'v15 capture partial implementation stage'),
  'v15 capture rejects a partial implementation staged set');
  assert.throws(() => feature004V15AssertCaptureStagedPaths([
    ...FEATURE004_V15_IMPLEMENTATION_PATHS,
    'specs/017-decision-attention-and-developing-situations/report.md'
  ], 'v15 capture foreign implementation stage'),
  'v15 capture rejects a foreign staged path');
  const report = readFileSync(resolve(ROOT, REPORT_PATH), 'utf8');
  const v10 = parseReportBlock(report, POST_COMMIT_V10_MARKER).value;
  const summary = v10.currentMatrix.requiredRecords
    .find(({ path }) => path === COLLISION_PARSER_PATH);
  const wrongHistoricalStatus = structuredClone(v10.identityContract.parserSelfCapture);
  wrongHistoricalStatus.status = 'M ';
  assert.throws(() => feature004V15WithHistoricalParserMetadata(
    wrongHistoricalStatus, 'v15 wrong historical parser status', null, null,
    () => postCommitV13HistoricalV10ParserRecord(summary)),
  'v15 rejects a wrong historical parser status');
  return stagedReplay;
}

function feature004V15RunAdversarialCases() {
  feature004V15AssertHistoricalReplayStagingModes();
  const evidenceA = feature004V15RenderEvidence({
    command: 'node --test tests/feature-004-dirty-tree-collision.test.mjs --test-name-pattern alpha',
    rawOutputLines: Array.from({ length: 10 }, (_, index) => `alpha output ${index + 1}`)
  });
  const evidenceB = feature004V15RenderEvidence({
    command: 'node --test tests/feature-004-dirty-tree-collision.test.mjs --test-name-pattern beta',
    rawOutputLines: Array.from({ length: 10 }, (_, index) => `beta output ${index + 1}`)
  });
  const base = feature004V15ScopesFixture([
    { checked: false, text: 'alpha requirement' },
    { checked: false, text: 'beta requirement' }
  ]);
  const twoValid = feature004V15ScopesFixture([
    { checked: true, text: 'alpha requirement', evidence: [evidenceA] },
    { checked: true, text: 'beta requirement', evidence: [evidenceB] }
  ]);
  const accepted = feature004V15ValidateScopesTransition(base, twoValid, {
    stagedPaths: FEATURE004_V15_EVIDENCE_PATHS,
    expectedStagedPaths: FEATURE004_V15_EVIDENCE_PATHS,
    baseStateText: 'state',
    currentStateText: 'state',
    baseTestPlanText: 'test-plan',
    currentTestPlanText: 'test-plan'
  });
  const acceptedProjection = feature004V15ScopesProjection(twoValid);
  assert.equal(accepted.transitionCount, 2,
    'v15 accepts two independently evidenced transitions');
  captureV13AssertExact(accepted.transitionedItemKeys,
    acceptedProjection.records.map(feature004V15ItemKey),
    'v15 returns both exact transitioned item keys in planning order');
  assert.throws(() => feature004V15ValidateScopesTransition(base, base),
    'v15 required mode rejects zero transitions');
  captureV13AssertExact(feature004V15ValidateScopesTransition(base, base, {
    allowNoTransition: true
  }), { transitionCount: 0, transitionedItemKeys: [] },
  'v15 allowNoTransition accepts exactly zero transitions');

  const mixedInvalid = feature004V15ScopesFixture([
    { checked: true, text: 'alpha requirement', evidence: [evidenceA] },
    { checked: true, text: 'beta requirement', evidence: [
      feature004V15RenderEvidence({ claimSource: 'interpreted' })
    ] }
  ]);
  assert.throws(() => feature004V15ValidateScopesTransition(base, mixedInvalid),
    'v15 rejects a mixed valid and invalid batch atomically');

  const projection = feature004V15ScopesProjection(twoValid);
  const duplicateBase = [projection.records[0], structuredClone(projection.records[0])];
  assert.throws(() => feature004V15ValidateExecutionTransition(
    duplicateBase, structuredClone(duplicateBase), projection.evidenceByHash,
    { allowNoTransition: true }), 'v15 rejects a duplicate item key');

  const duplicateEvidence = feature004V15ScopesFixture([
    { checked: true, text: 'alpha requirement', evidence: [evidenceA] },
    { checked: true, text: 'beta requirement', evidence: [evidenceA] }
  ]);
  assert.throws(() => feature004V15ValidateScopesTransition(base, duplicateEvidence),
    'v15 rejects a duplicate evidence hash across different item keys');
  const checkedWithoutEvidence = feature004V15ScopesFixture([
    { checked: true, text: 'alpha requirement' },
    { checked: false, text: 'beta requirement' }
  ]);
  assert.throws(() => feature004V15ValidateScopesTransition(base, checkedWithoutEvidence),
    'v15 rejects checked without evidence');
  const evidenceUnderUnchecked = feature004V15ScopesFixture([
    { checked: false, text: 'alpha requirement', evidence: [evidenceA] },
    { checked: false, text: 'beta requirement' }
  ]);
  assert.throws(() => feature004V15ValidateScopesTransition(base, evidenceUnderUnchecked,
    { allowNoTransition: true }), 'v15 rejects evidence under unchecked');

  for (const [label, indent] of [
    ['zero-space evidence indentation', ''],
    ['eight-space evidence indentation', '        ']
  ]) {
    const malformed = feature004V15ScopesFixture([
      { checked: true, text: 'alpha requirement', evidence: [
        feature004V15RenderEvidence({ indent })
      ] },
      { checked: false, text: 'beta requirement' }
    ]);
    assert.throws(() => feature004V15ValidateScopesTransition(base, malformed),
      `v15 rejects ${label}`);
  }

  const parsedEvidence = [...projection.evidenceByHash.values()][0];
  for (const [label, mutate] of [
    ['phase forgery', (value) => { value.phase = 'foreign-phase'; }],
    ['command forgery', (value) => { value.command = ''; }],
    ['exit forgery', (value) => { value.exitCode = 1; }],
    ['claim-source forgery', (value) => { value.claimSource = 'interpreted'; }],
    ['raw-output forgery', (value) => { value.rawOutputLines[0] = 'forged'; }],
    ['raw-output hash forgery', (value) => { value.rawOutputSha256 = '0'.repeat(64); }],
    ['block hash forgery', (value) => { value.blockSha256 = '0'.repeat(64); }]
  ]) {
    const candidate = feature004V15CloneEvidence(parsedEvidence);
    mutate(candidate);
    assert.throws(() => feature004V15ValidateEvidenceBlock(candidate, label),
      `v15 rejects ${label}`);
  }

  const historicalHashes = [sha256(Buffer.from('v15 first prior evidence')),
    sha256(Buffer.from('v15 second prior evidence'))];
  const historicalBase = [{
    scopeId: 'SCOPE-01',
    itemOrdinal: 1,
    uncheckedItemTextSha256: sha256(Buffer.from('- [ ] historical item\n')),
    checkboxState: 'checked',
    orderedEvidenceBlockSha256: historicalHashes
  }];
  for (const [label, hashes] of [
    ['prior evidence removal', historicalHashes.slice(1)],
    ['prior evidence replacement', [sha256(Buffer.from('replacement')), historicalHashes[1]]],
    ['prior evidence reorder', [...historicalHashes].reverse()]
  ]) {
    const candidate = structuredClone(historicalBase);
    candidate[0].orderedEvidenceBlockSha256 = hashes;
    assert.throws(() => feature004V15ValidateExecutionTransition(
      historicalBase, candidate, new Map(), { allowNoTransition: true }),
    `v15 rejects ${label}`);
  }

  for (const [label, candidate] of [
    ['item text mutation', twoValid.replace('alpha requirement', 'changed alpha requirement')],
    ['item order mutation', feature004V15ScopesFixture([
      { checked: true, text: 'beta requirement', evidence: [evidenceB] },
      { checked: true, text: 'alpha requirement', evidence: [evidenceA] }
    ])],
    ['item cardinality mutation', `${twoValid}- [ ] added requirement\n`],
    ['scope status mutation', twoValid.replace('Status: In Progress', 'Status: Done')],
    ['planning projection mutation', twoValid.replace('### Definition of Done',
      'Planning mutation\n### Definition of Done')]
  ]) {
    assert.throws(() => feature004V15ValidateScopesTransition(base, candidate),
      `v15 rejects ${label}`);
  }
  const ordinalMutation = structuredClone(projection.records);
  ordinalMutation[0].itemOrdinal += 1;
  assert.throws(() => feature004V15ValidateExecutionTransition(
    feature004V15ScopesProjection(base).records, ordinalMutation,
    projection.evidenceByHash), 'v15 rejects item ordinal mutation');
  assert.throws(() => feature004V15ValidateScopesTransition(base, twoValid, {
    baseStateText: '{"status":"in_progress","certification":{"status":"in_progress"}}',
    currentStateText: '{"status":"done","certification":{"status":"done"}}'
  }), 'v15 rejects status certification and planning-routing edits');
  assert.throws(() => feature004V15ValidateScopesTransition(base, twoValid, {
    baseTestPlanText: 'original test plan',
    currentTestPlanText: 'changed test plan'
  }), 'v15 rejects Test Plan edits');
  assert.throws(() => feature004V15AssertStagedPaths([], FEATURE004_V15_EVIDENCE_PATHS,
    'v15 incomplete evidence stage'), 'v15 rejects an incomplete staged allowlist');
  assert.throws(() => feature004V15AssertStagedPaths([
    ...FEATURE004_V15_EVIDENCE_PATHS,
    'specs/017-decision-attention-and-developing-situations/report.md'
  ], FEATURE004_V15_EVIDENCE_PATHS, 'v15 overbroad evidence stage'),
  'v15 rejects an overbroad staged allowlist');
  assert.throws(() => feature004V15AssertNoForeignPersistence([
    ...FEATURE004_V15_PLAN_PATHS,
    'specs/017-decision-attention-and-developing-situations/report.md'
  ], 'v15 persisted paths'), 'v15 rejects Feature 017 persistence');

  const reportBytes = readFileSync(resolve(ROOT, REPORT_PATH));
  const reportContext = feature004V15ReportContext(reportBytes);
  const v14Mutation = Buffer.from(reportBytes);
  v14Mutation[reportContext.v14.startByte + 10] ^= 0x01;
  assert.throws(() => feature004V15ReportContext(v14Mutation),
    'v15 rejects any v14 byte mutation');
  const separatorMutation = Buffer.from(reportBytes);
  separatorMutation[reportContext.v14.endByteExclusive] = 0x20;
  assert.throws(() => feature004V15ReportContext(separatorMutation),
    'v15 rejects a v14-to-v15 separator mutation');
  assert.throws(() => feature004V15ReportContext(Buffer.concat([
    reportBytes, Buffer.from('x', 'utf8')
  ])), 'v15 rejects a non-two-LF report-final suffix');
}

function feature004V15StripSource(source) {
  const startNeedle = `\n${FEATURE004_V15_BEGIN}\n`;
  const endNeedle = `${FEATURE004_V15_END}\n\n`;
  assert.equal(source.split(startNeedle).length - 1, 1,
    'v15 source has exactly one additive branch start');
  assert.equal(source.split(endNeedle).length - 1, 1,
    'v15 source has exactly one additive branch end');
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);
  let historical = source.slice(0, start) + '\n' + source.slice(end + endNeedle.length);
  const pinLine = `const POST_COMMIT_V15_BLOCK_SHA256 = '${POST_COMMIT_V15_BLOCK_SHA256}';\n`;
  assert.equal(countExact(historical, pinLine), 1,
    'v15 source has exactly one raw pin addition');
  historical = historical.replace(pinLine, '');
  return historical;
}

const stripPostCommitV13AdoptionSourceBeforeV15 = stripPostCommitV13AdoptionSource;
stripPostCommitV13AdoptionSource = (source) =>
  stripPostCommitV13AdoptionSourceBeforeV15(feature004V15StripSource(source));

const parseCollisionContractsBeforeV15 = parseCollisionContracts;
const runForeignSetV7AdversarialCasesBeforeV15 = runForeignSetV7AdversarialCases;
let feature004V15ValidationLogged = false;

function feature004V15ParseCollisionContracts() {
  const inherited = parseCollisionContractsBeforeV15();
  const v15 = feature004V15ParseAuthority();
  if (!feature004V15ValidationLogged) {
    console.log(`FEATURE004_V15_VALIDATED marker=${FEATURE004_V15_MARKER} sha256=${POST_COMMIT_V15_BLOCK_SHA256} bytes=${v15.reportContext.blockBytes.length} transitions=${v15.transition.transitionCount} planningBaseline=${FEATURE004_V15_PLAN_COMMIT} scopeTwoLocked=true`);
    feature004V15ValidationLogged = true;
  }
  return {
    ...inherited,
    postCommitV15: v15.decoded.payload,
    postCommitV15Raw: v15.reportContext.block,
    postCommitV15Outer: v15.decoded.outer,
    postCommitV15Transition: v15.transition
  };
}

function feature004V15RunAllAdversarialCases() {
  assert.equal(runForeignSetV7AdversarialCasesBeforeV15,
    feature004V14RunAllAdversarialCases,
  'v15 preserves the complete inherited v14 adversarial function identity');
  runForeignSetV7AdversarialCasesBeforeV15();
  feature004V15RunAdversarialCases();
}

parseCollisionContracts = feature004V15ParseCollisionContracts;
runForeignSetV7AdversarialCases = feature004V15RunAllAdversarialCases;
assert.equal(parseCollisionContractsBeforeV15, feature004V14ParseCollisionContracts,
  'v15 retains the v14 parser as bounded historical implementation input');

if (process.env.FEATURE004_CAPTURE_V15_CHECK === '1') {
  feature004V15CaptureCheck();
  process.exit(0);
}

if (process.env.FEATURE004_CAPTURE_V15 === '1') {
  const capture = feature004V15CaptureCheck();
  process.stdout.write(`${capture.block}\n`);
  process.exit(0);
}

if (process.env.FEATURE004_VALIDATE_V15_CAPTURE === '1') {
  feature004V15ParseAuthority({ requireImplementationStaging: true });
  process.exit(0);
}

if (process.env.FEATURE004_VALIDATE_V15_HISTORICAL_REPLAY === '1') {
  const replay = feature004V15AssertHistoricalReplayStagingModes();
  console.log(`FEATURE004_V15_HISTORICAL_REPLAY_VALIDATED versions=${Object.keys(replay).join(',')} currentModes=unstaged,staged foreignStageRejected=true wrongHistoricalStatusRejected=true`);
  process.exit(0);
}
/* FEATURE-004-COLLISION-MULTI-ITEM-EVIDENCE-V15-END */

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
  runForeignSetV7AdversarialCases();
  const {
    activePaths,
    baseline,
    delta,
    deltaPaths,
    disposition,
    durableEvidence,
    durableEvidenceBlock,
    durableEvidenceRaw,
    currentIdentityV4,
    currentIdentityV4Raw,
    ownerSettledSelftest,
    selftestSuccessorV2,
    selftestSuccessorV3,
    scriptTransitions,
    settled,
    settledPaths,
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
    'feature004-dirty-collision-selftest-successor-v3',
    'feature004-scope1-durable-evidence-v1',
    'feature004-dirty-collision-current-identity-v4'
  ]) {
    const block = parseReportBlock(report, marker);
    assert.throws(() => parseReportBlock(`${report}\n${block.raw}`, marker), `${marker} duplicate marker fails closed in memory`);
    assert.throws(() => parseReportBlock(report.replace(block.raw, ''), marker), `${marker} missing marker fails closed in memory`);
    const malformedRaw = block.raw.replace('```json\n{', '```json\n{ malformed');
    assert.throws(() => parseReportBlock(report.replace(block.raw, malformedRaw), marker), `${marker} malformed JSON fails closed in memory`);
  }

  assert.throws(() => assertPinnedReportBlock(`${durableEvidenceRaw} `, DURABLE_EVIDENCE_BLOCK_SHA256,
    'mutated durable evidence block'), 'durable evidence marker-inclusive byte drift fails closed');
  assert.throws(() => assertPinnedReportBlock(`${currentIdentityV4Raw} `, CURRENT_IDENTITY_V4_BLOCK_SHA256,
    'mutated current identity v4 block'), 'current identity v4 marker-inclusive byte drift fails closed');

  assertEveryClosedSchemaMutationFails(durableEvidenceBlock,
    (candidate) => validateDurableEvidenceBlock(candidate, durableEvidenceBlock), 'durable evidence block');
  assertEveryClosedSchemaMutationFails(currentIdentityV4,
    (candidate) => validateCurrentIdentityV4(candidate, currentIdentityV4), 'current identity v4 block');

  const toolLogText = readFileSync(resolve(ROOT, TOOL_LOG_PATH), 'utf8');
  const toolLogRows = parseToolLogRows(toolLogText);
  const selectedRows = durableEvidenceBlock.receipts.map((receipt, index) => {
    const matches = toolLogRows.filter(({ value }) => toolLogRowMatchesReceipt(value, receipt));
    assert.equal(matches.length, 1, `durable current-log fixture receipt ${index} resolves exactly once from actual rows`);
    return matches[0].value;
  });
  assert.ok(selectedRows.length > 1, 'durable current-log fixture has enough actual receipts to prove partial-set rejection');
  const encodeRows = (rows) => rows.map((row) => JSON.stringify(row)).join('\n');
  assert.equal(resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: encodeRows(selectedRows)
  }).source, 'current-tool-log', 'complete actual full-key set selects the current tool-log branch');
  assert.equal(resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: false,
    toolLogText: ''
  }).source, 'committed-markdown', 'absent tool-log selects the pinned Markdown fallback');
  assert.equal(resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: ''
  }).source, 'committed-markdown', 'zero full-key matches across the whole set selects the pinned Markdown fallback');
  assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: encodeRows(selectedRows.slice(1))
  }), 'one-or-more-but-not-all current-log matches fail closed without fallback');
  assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: encodeRows([...selectedRows, selectedRows[0]])
  }), 'duplicate complete stable key fails closed');

  for (const field of DURABLE_STABLE_KEY_FIELDS.filter((name) => name !== 'tags')) {
    const mismatched = structuredClone(selectedRows);
    mismatched[0][field] = changedLeafValue(mismatched[0][field]);
    assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
      toolLogExists: true,
      toolLogText: encodeRows(mismatched)
    }), `current tool-log mismatched ${field} fails as a partial set`);
  }
  const tagMutations = [
    ['missing required tag', (tags) => tags.slice(0, -1)],
    ['extra required tag', (tags) => [...tags, '__adversarial']],
    ['reordered required tags', (tags) => [...tags].reverse()]
  ];
  assert.ok(selectedRows[0].tags.length > 1, 'actual first durable receipt has ordered tags whose reorder is observable');
  for (const [label, mutate] of tagMutations) {
    const mismatched = structuredClone(selectedRows);
    mismatched[0].tags = mutate(mismatched[0].tags);
    assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
      toolLogExists: true,
      toolLogText: encodeRows(mismatched)
    }), `${label} fails closed`);
  }
  const broadenedCommand = structuredClone(selectedRows);
  broadenedCommand[0].cmd = `${broadenedCommand[0].cmd} --broadened`;
  assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: encodeRows(broadenedCommand)
  }), 'broadened command comparison cannot satisfy a full-key receipt');
  const earlierRed = structuredClone(selectedRows[0]);
  earlierRed.cwd = '/earlier/red';
  earlierRed.exitCode = earlierRed.exitCode === 0 ? 1 : 0;
  earlierRed.stdoutHash = '0'.repeat(64);
  assert.equal(resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: encodeRows([...selectedRows, earlierRed])
  }).source, 'current-tool-log', 'earlier RED with different cwd, exit, and hash remains distinct nonmatching history');
  const contradictory = structuredClone(selectedRows);
  contradictory[0].rawOutputLines = ['contradictory'];
  contradictory[0].rawOutputSha256 = '0'.repeat(64);
  assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: encodeRows(contradictory)
  }), 'contradictory selected source data fails closed');
  const malformedSelectedRows = selectedRows.map((row, index) => index === 0 ? '{malformed' : JSON.stringify(row)).join('\n');
  assert.throws(() => resolveDurableEvidence(durableEvidenceBlock, {
    toolLogExists: true,
    toolLogText: malformedSelectedRows
  }), 'malformed selected current-log row fails closed');

  const fallbackCases = [
    ['fallback fewer than ten raw lines', (value) => { value.receipts[0].rawOutputLines = value.receipts[0].rawOutputLines.slice(0, 9); }],
    ['fallback raw output hash drift', (value) => { value.receipts[0].rawOutputSha256 = '0'.repeat(64); }],
    ['fallback stdout hash contradiction', (value) => { value.receipts[0].stdoutHash = '0'.repeat(64); }],
    ['fallback predecessor link reorder', (value) => { value.immutablePredecessorBlocks.reverse(); }],
    ['fallback duplicate receipt', (value) => { value.receipts.push(structuredClone(value.receipts[0])); }],
    ['fallback synthetic undeclared receipt', (value) => {
      const synthetic = structuredClone(value.receipts[0]);
      synthetic.sessionId = `${synthetic.sessionId}__synthetic`;
      value.receipts.push(synthetic);
    }],
    ['fallback success on absence', (value) => { value.receipts = []; }]
  ];
  for (const [label, mutate] of fallbackCases) {
    const malformed = structuredClone(durableEvidenceBlock);
    mutate(malformed);
    assert.throws(() => validateDurableEvidenceBlock(malformed, durableEvidenceBlock), label);
  }

  const parserSource = readFileSync(resolve(ROOT, COLLISION_PARSER_PATH), 'utf8');
  const normalizedSourceIdentity = normalizedSelfSourceIdentity(parserSource);
  const filledPinsSource = parserSource
    .replace(DURABLE_EVIDENCE_BLOCK_SHA256, 'a'.repeat(64))
    .replace(CURRENT_IDENTITY_V4_BLOCK_SHA256, 'b'.repeat(64));
  assert.deepEqual(normalizedSelfSourceIdentity(filledPinsSource), normalizedSourceIdentity,
    'valid final pin values normalize to the zero-pin parser identity');
  const pinCases = [
    ['missing pin', (value) => value.replace(/^const DURABLE_EVIDENCE_BLOCK_SHA256.*\n/m, '')],
    ['duplicate pin', (value) => value.replace(/^const DURABLE_EVIDENCE_BLOCK_SHA256.*$/m, (line) => `${line}\n${line}`)],
    ['renamed pin', (value) => value.replace('DURABLE_EVIDENCE_BLOCK_SHA256', 'DURABLE_BLOCK_SHA256')],
    ['extra pin', (value) => value.replace(/^const CURRENT_IDENTITY_V4_BLOCK_SHA256.*$/m,
      (line) => `${line}\nconst CURRENT_IDENTITY_V4_EXTRA_BLOCK_SHA256 = '${'0'.repeat(64)}';`)],
    ['nonhex pin', (value) => value.replace(DURABLE_EVIDENCE_BLOCK_SHA256, 'g'.repeat(64))],
    ['reordered pins', (value) => {
      const lines = value.split('\n');
      const first = lines.findIndex((line) => line.startsWith('const DURABLE_EVIDENCE_BLOCK_SHA256'));
      const second = lines.findIndex((line) => line.startsWith('const CURRENT_IDENTITY_V4_BLOCK_SHA256'));
      [lines[first], lines[second]] = [lines[second], lines[first]];
      return lines.join('\n');
    }]
  ];
  for (const [label, mutate] of pinCases) {
    assert.throws(() => parseNormalizedSelfPins(mutate(parserSource)), `normalized-self-pins/v1 rejects ${label}`);
  }
  const nonPinDrift = parserSource.replace("const REPORT_PATH = '", "const REPORT_PATH = './");
  assert.notDeepEqual(normalizedSelfSourceIdentity(nonPinDrift), normalizedSourceIdentity,
    'normalized-self-pins/v1 does not normalize or exempt non-pin drift');

  const identityCases = [
    ['v4 missing Scope 1 path', (value) => { value.requiredScope1Paths.pop(); }],
    ['v4 extra Scope 1 path', (value) => { value.requiredScope1Paths.push(structuredClone(value.requiredScope1Paths[0])); }],
    ['v4 reordered Scope 1 paths', (value) => { value.requiredScope1Paths.reverse(); }],
    ['v4 staged Scope 1 path', (value) => { value.requiredScope1Paths[0].staged = true; }],
    ['v4 Scope 1 byte drift', (value) => { value.requiredScope1Paths[0].worktreeSha256 = '0'.repeat(64); }],
    ['v4 missing foreign path', (value) => { value.foreignProtectedPaths.pop(); }],
    ['v4 extra foreign path', (value) => { value.foreignProtectedPaths.push(structuredClone(value.requiredScope1Paths[0])); }],
    ['v4 reordered foreign paths', (value) => { value.foreignProtectedPaths.reverse(); }],
    ['v4 foreign ownership transfer', (value) => {
      value.foreignProtectedPaths[0].ownerAttribution = 'specs/004-fx-regime-relative-value-lab::SCOPE-01';
      value.foreignProtectedPaths[0].feature004OwnershipClaim = true;
    }],
    ['v4 self mode drift', (value) => { value.collisionParserSelfIdentity.mode = 'raw-self/v1'; }],
    ['v4 self pin reorder', (value) => { value.collisionParserSelfIdentity.pinLiterals.reverse(); }],
    ['v4 normalized self byte drift', (value) => { value.collisionParserSelfIdentity.worktreeSha256 = '0'.repeat(64); }]
  ];
  assert.ok(currentIdentityV4.foreignProtectedPaths.length > 1,
    'v4 fixture has separately ordered foreign protected paths for missing, reorder, and transfer mutations');
  for (const [label, mutate] of identityCases) {
    const malformed = structuredClone(currentIdentityV4);
    mutate(malformed);
    assert.throws(() => validateCurrentIdentityV4(malformed, currentIdentityV4), label);
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
    assert.throws(() => validateCollisionDelta(disposition, malformed, durableEvidence), label);
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
    assert.throws(() => validateSettledCollisionDelta(deltaPaths, candidate, durableEvidence, false), label);
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
    assert.throws(() => validateScriptTransitions(settledPaths, baseline, malformed), label);
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
    ['v3 hunk-one producer drift', (value) => { value.orderedDiffHunks[0].producerCommit = 'db06c29650ba351770297acefa658f51cbc4ff00'; }],
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
  const retainedValidator = ownerSettledSelftest.retainedValidatorTransition;
  const { chunks, prefixBytes } = historicalValidatorPrefix(untracked, retainedValidator);
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