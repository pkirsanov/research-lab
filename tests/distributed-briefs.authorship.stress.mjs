/*
 * tests/distributed-briefs.authorship.stress.mjs — Feature 002 Scope 06 (SCN-002-005).
 *
 * Stress the shared author pool over 22 changed sources: prove the initial attempt plus at most two
 * retries per source against identical frozen input, four-worker concurrency under load, run-level token
 * reservation, and the run attempt/token ceilings that refuse the whole run rather than omit a tool. Run
 * as a plain script (node tests/distributed-briefs.authorship.stress.mjs); exit 0 = all invariants hold.
 */
import { createRequire } from 'node:module';

import { runToolAuthorPool } from '../scripts/brief-refresh.mjs';
import { eligibleOwnerRead, profileBudgets, runBudget, authorIdentity, noRecommendationTransport, makeHash } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

let failures = 0;
let passes = 0;
function check(condition, message) {
  if (condition) { passes += 1; console.log('  \u2713 ' + message); }
  else { failures += 1; console.log('  \u2717 FAIL: ' + message); }
}

function stressReads(count) {
  const budgets = profileBudgets();
  const reads = [];
  for (let i = 0; i < count; i += 1) {
    const read = eligibleOwnerRead({ toolId: `stress-source-${i}`, fingerprint: makeHash(`stress-read-${i}`) });
    reads.push({ toolId: read.toolId, read, profile: 'live-market', profileBudget: budgets['live-market'] });
  }
  return reads;
}

async function main() {
  const SOURCES = 22;
  const identity = authorIdentity();
  const rawTransport = noRecommendationTransport();

  // Per-source reservation (uniform live-market reads) — used to size the token-ceiling cases exactly.
  const sampleReads = stressReads(SOURCES);
  const perSourceReserved = RLCONTRACTS.compactAuthorInput(sampleReads[0].read, sampleReads[0].profileBudget).value.reservedInputTokens;

  /* Case 1: a bounded subset of sources fails its first attempt and succeeds on one retry, staying inside
     the run token ceiling. Every source resolves; retried sources take two attempts, the rest take one;
     concurrency never exceeds four. */
  const RETRY_SUBSET = 5;
  const retrySet = new Set(Array.from({ length: RETRY_SUBSET }, (unused, i) => `stress-source-${i}`));
  let active1 = 0;
  let peak1 = 0;
  const subsetRetryAuthor = async (request, ctx) => {
    active1 += 1; peak1 = Math.max(peak1, active1);
    await new Promise((resolve) => setTimeout(resolve, 4));
    active1 -= 1;
    if (ctx.attempt === 0 && retrySet.has(ctx.toolId)) return { ok: false, error: { code: 'B002-TOOL-AUTHOR-MALFORMED', reason: 'first-attempt-fails' } };
    const raw = await rawTransport(JSON.stringify(request));
    return { ok: true, envelope: JSON.parse(raw) };
  };
  const subsetPool = await runToolAuthorPool({ reads: stressReads(SOURCES), identity, runBudget: runBudget(SOURCES), workers: 4, maxRetries: 2, authorFn: subsetRetryAuthor });
  check(subsetPool.ok === true, 'Case 1 pool resolves all sources with a bounded retry subset inside the ceiling');
  check(Object.keys(subsetPool.outcomes).length === SOURCES, `Case 1 resolves all ${SOURCES} sources with no omission`);
  check(retrySet.size === RETRY_SUBSET && [...retrySet].every((id) => subsetPool.outcomes[id].attempts === 2), 'Case 1 every retried source resolves in the initial attempt plus one retry');
  check(Object.values(subsetPool.outcomes).filter((outcome) => outcome.attempts === 1).length === SOURCES - RETRY_SUBSET, 'Case 1 every single-attempt source resolves without a retry');
  check(subsetPool.telemetry.retries === RETRY_SUBSET, `Case 1 telemetry records exactly ${RETRY_SUBSET} retries`);
  check(subsetPool.telemetry.calls === SOURCES + RETRY_SUBSET, 'Case 1 telemetry records one call per attempt (initial plus the retries)');
  check(peak1 <= 4 && peak1 >= 2, `Case 1 peak concurrency ${peak1} stays within the four-worker ceiling and overlaps`);
  check(subsetPool.telemetry.peakConcurrency <= 4, 'Case 1 pool telemetry peak concurrency never exceeds four');

  /* Case 2: when EVERY source needs a retry the run OUTPUT-token ceiling is exceeded before all retries
     complete; the run is refused with B002-BUDGET rather than omitting a tool. */
  const allRetryAuthor = async (request, ctx) => {
    await new Promise((resolve) => setTimeout(resolve, 2));
    if (ctx.attempt === 0) return { ok: false, error: { code: 'B002-TOOL-AUTHOR-MALFORMED', reason: 'first-attempt-fails' } };
    const raw = await rawTransport(JSON.stringify(request));
    return { ok: true, envelope: JSON.parse(raw) };
  };
  const outputCeilingPool = await runToolAuthorPool({ reads: stressReads(SOURCES), identity, runBudget: runBudget(SOURCES), workers: 4, maxRetries: 2, authorFn: allRetryAuthor });
  check(outputCeilingPool.ok === false, 'Case 2 an all-source retry exceeds the run output ceiling and refuses');
  check(outputCeilingPool.refusal.code === 'B002-BUDGET' && outputCeilingPool.refusal.reason === 'run-ceiling-exceeded', 'Case 2 the run output ceiling refuses with B002-BUDGET run-ceiling-exceeded');
  check(Object.keys(outputCeilingPool.outcomes).length === 0, 'Case 2 no accepted partial set is exposed on refusal');

  /* Case 3: an always-failing author under a tiny attempt ceiling refuses with B002-BUDGET on the attempt
     that would exceed the ceiling — it never omits a tool or exposes a partial set. */
  const alwaysFail = async () => ({ ok: false, error: { code: 'B002-TOOL-AUTHOR-MALFORMED', reason: 'always-fails' } });
  const attemptCeilingPool = await runToolAuthorPool({ reads: stressReads(SOURCES), identity, runBudget: { maxInputTokens: 200000, maxOutputTokens: 36000, maxAttempts: 2 }, workers: 4, maxRetries: 2, authorFn: alwaysFail });
  check(attemptCeilingPool.ok === false && attemptCeilingPool.refusal.code === 'B002-BUDGET' && attemptCeilingPool.refusal.reason === 'run-ceiling-exceeded', 'Case 3 the run attempt ceiling refuses with B002-BUDGET run-ceiling-exceeded');
  check(Object.keys(attemptCeilingPool.outcomes).length === 0, 'Case 3 no accepted partial outcome set is exposed on refusal');

  /* Case 4: the run INPUT-token ceiling admits only ten first-attempt reservations; the eleventh breaches
     it and refuses the run before omitting any tool. */
  const inputCeiling = perSourceReserved * 10 + Math.floor(perSourceReserved / 2);
  const succeedAuthor = async (request) => {
    const raw = await rawTransport(JSON.stringify(request));
    return { ok: true, envelope: JSON.parse(raw) };
  };
  const inputCeilingPool = await runToolAuthorPool({ reads: stressReads(SOURCES), identity, runBudget: { maxInputTokens: inputCeiling, maxOutputTokens: 36000, maxAttempts: 69 }, workers: 4, maxRetries: 2, authorFn: succeedAuthor });
  check(inputCeilingPool.ok === false && inputCeilingPool.refusal.code === 'B002-BUDGET', 'Case 4 an input-token ceiling below the run total refuses with B002-BUDGET');
  check(Object.keys(inputCeilingPool.outcomes).length === 0, 'Case 4 refusal exposes no accepted partial set');
  check(inputCeilingPool.telemetry.reservedInputTokens > inputCeiling, 'Case 4 the reservation accounting detects the breach before authoring past the ceiling');

  console.log('\n' + '='.repeat(48));
  console.log('Scope 06 author-pool stress: ' + passes + ' passed, ' + failures + ' failed');
  console.log('='.repeat(48));
  process.exit(failures ? 1 : 0);
}

main().catch((error) => { console.error('stress harness threw:', error); process.exit(1); });
