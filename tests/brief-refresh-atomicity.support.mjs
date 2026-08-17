import { execFileSync, spawnSync } from 'node:child_process';
import {
  createReadStream,
  chmodSync,
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { conformantNarrativePayload } from './required-narrative-fields.support.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PUBLICATION_PATHS = [
  'market-brief.snapshot.json',
  'brief-history.jsonl',
  'market-brief.payload.json',
  'market-brief.config.json'
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8'
};

function runGit(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

export function gitFixture(fixture, args) {
  return runGit(fixture.repoRoot, args);
}

function writeFixtureScript(path, source) {
  writeFileSync(path, source, 'utf8');
  chmodSync(path, 0o755);
}

function baselineSnapshot(sessionDate) {
  const snapshot = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));
  snapshot.asOf = `${sessionDate}T14:00:00.000Z`;
  snapshot.generatedAt = `${sessionDate}T14:00:00.000Z`;
  snapshot.window = 'pre-market';
  snapshot.marketClosed = false;
  snapshot.nextSessionDate = sessionDate;
  for (const [toolId, toolRead] of Object.entries(snapshot.toolReads || {})) {
    toolRead.asOf = `${sessionDate}T13:59:00.000Z`;
    if (toolRead.metrics && typeof toolRead.metrics === 'object' && typeof toolRead.metrics.error === 'string') {
      delete toolRead.metrics.error;
      toolRead.read = `${toolId} fixture owner read is current.`;
    }
  }
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

function fixtureHistory(sessionDate) {
  return `${JSON.stringify({
    ts: `${sessionDate}T14:00:00.000Z`,
    window: 'pre-market',
    marketClosed: false,
    nextSessionDate: sessionDate,
    source: 'bug-002-baseline'
  })}\n`;
}

/**
 * The one attention candidate the fixture's `signals` lane authors.
 *
 * The stub used to model every lane as a verbatim echo of the baseline payload
 * (`fragment[key] = payload[key]`). For `attention` that made this suite's
 * outcome a function of whatever the live 4x/day brief last published. Since the
 * F-017-06 build-step cutover landed on 2026-08-10 every real generation has
 * legitimately published an EMPTY tier, so the echo began handing the composer
 * ZERO candidates: `recomposePayloadAttention` accounted 0 built + 0 refused,
 * and the publication gate correctly refused an empty tier that states no reason.
 *
 * Both production halves are right. The gate is right that an empty tier must say
 * why it is empty, and recompose is right that its exclusion list is the complete
 * accounting of the candidates it was handed — preserving a previous generation's
 * reasons instead would let a generation that considered nothing publish behind
 * someone else's explanation, which is the OBS-007-02 silent drop. What was wrong
 * is a lane stub that authored nothing and therefore modelled nothing.
 *
 * So the lane authors a candidate of its own, on top of anything the baseline
 * carried. It supplies JUDGEMENT ONLY and no `observed` gate result, because a
 * fixture observes no market and must not assert a figure, a level or an instant
 * it cannot source. The certified composer refuses exactly that at its first
 * check, by name, so the tier's emptiness is explained by a real `RLATTN-*`
 * reason rather than by an invented observation — and the explanation no longer
 * depends on what the market did yesterday.
 */
export const FIXTURE_ATTENTION_CANDIDATE = Object.freeze({
  headline: 'fixture signals lane authored judgement with no observed gate result',
  rationale: 'the fixture lane observes no market, so it hands the composer judgement alone and expects a named refusal'
});

export function createBriefRefreshFixture(options = {}) {
  const baselineDate = options.baselineDate || '2026-07-15';
  const candidateDate = options.candidateDate || '2026-07-16';
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug002-'));
  const repoRoot = resolve(fixtureRoot, 'repo');
  const remoteRoot = resolve(fixtureRoot, 'remote.git');
  const boundaryLog = resolve(fixtureRoot, 'boundary.log');
  const copilotAttemptFile = resolve(fixtureRoot, 'copilot-attempt.txt');
  const copilotAuditFile = resolve(fixtureRoot, 'copilot-audit.json');
  const validatorCountFile = resolve(fixtureRoot, 'validator-count.txt');
  mkdirSync(resolve(repoRoot, 'scripts'), { recursive: true });
  mkdirSync(resolve(repoRoot, 'data'), { recursive: true });

  const wrapperPath = resolve(repoRoot, 'scripts/brief-refresh-and-push.sh');
  if (process.env.BUG002_WRAPPER_SOURCE === 'HEAD') {
    writeFileSync(wrapperPath, execFileSync('git', ['show', 'HEAD:scripts/brief-refresh-and-push.sh'], { cwd: ROOT }));
  } else {
    copyFileSync(resolve(ROOT, 'scripts/brief-refresh-and-push.sh'), wrapperPath);
  }
  chmodSync(wrapperPath, 0o755);
  copyFileSync(resolve(ROOT, 'scripts/brief-narrative-parallel.mjs'), resolve(repoRoot, 'scripts/brief-narrative-parallel.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/research-agenda-generation.mjs'), resolve(repoRoot, 'scripts/research-agenda-generation.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/web-evidence-acquire.mjs'), resolve(repoRoot, 'scripts/web-evidence-acquire.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/web-evidence-policy.mjs'), resolve(repoRoot, 'scripts/web-evidence-policy.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/brief-distributed-publish.mjs'), resolve(repoRoot, 'scripts/brief-distributed-publish.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/brief-publication.mjs'), resolve(repoRoot, 'scripts/brief-publication.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/recommendation-body.mjs'), resolve(repoRoot, 'scripts/recommendation-body.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/evaluate-recommendations.mjs'), resolve(repoRoot, 'scripts/evaluate-recommendations.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/shard-brief-history.mjs'), resolve(repoRoot, 'scripts/shard-brief-history.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/build-scorecard.mjs'), resolve(repoRoot, 'scripts/build-scorecard.mjs'));
  // The per-ticker owner-read producer. brief-refresh-and-push.sh runs it inside the transaction
  // right after the Tier-A refresh, so a fixture without it cannot reproduce the real publication
  // path — the wrapper aborts on a missing module before it ever reaches the steps under test.
  copyFileSync(resolve(ROOT, 'scripts/build-owner-reads.mjs'), resolve(repoRoot, 'scripts/build-owner-reads.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/build-brief-page-artifacts.mjs'), resolve(repoRoot, 'scripts/build-brief-page-artifacts.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/validate-distributed-briefs.mjs'), resolve(repoRoot, 'scripts/validate-distributed-briefs.mjs'));
  copyFileSync(resolve(ROOT, 'scripts/validate-brief-cache.mjs'), resolve(repoRoot, 'scripts/validate-brief-cache.mjs'));
  // validate-brief-payload.mjs imports this on both validator branches below.
  copyFileSync(resolve(ROOT, 'scripts/reader-vocabulary.mjs'), resolve(repoRoot, 'scripts/reader-vocabulary.mjs'));
  // The publish-time attention build step. brief-refresh-and-push.sh runs it
  // between the narrative lane and the payload gate (F-017-06), so a fixture
  // without it cannot reproduce the real publication path at all.
  copyFileSync(resolve(ROOT, 'scripts/build-attention-items.mjs'), resolve(repoRoot, 'scripts/build-attention-items.mjs'));
  copyFileSync(resolve(ROOT, 'rlcontracts.js'), resolve(repoRoot, 'rlcontracts.js'));
  copyFileSync(resolve(ROOT, 'rlagenda.js'), resolve(repoRoot, 'rlagenda.js'));
  if (options.agendaAssets) {
    copyFileSync(resolve(ROOT, 'research-agenda.json'), resolve(repoRoot, 'research-agenda.json'));
    copyFileSync(resolve(ROOT, 'scripts/research-agenda-refresh.mjs'), resolve(repoRoot, 'scripts/research-agenda-refresh.mjs'));
    copyFileSync(resolve(ROOT, 'research-agenda-lab.html'), resolve(repoRoot, 'research-agenda-lab.html'));
    mkdirSync(resolve(repoRoot, 'research'), { recursive: true });
    cpSync(resolve(ROOT, 'research/agenda'), resolve(repoRoot, 'research/agenda'), { recursive: true });
    mkdirSync(resolve(repoRoot, 'rlexperience-adapters'), { recursive: true });
    copyFileSync(resolve(ROOT, 'rlexperience-adapters/research-agenda.js'), resolve(repoRoot, 'rlexperience-adapters/research-agenda.js'));
    mkdirSync(resolve(repoRoot, 'notes'), { recursive: true });
    copyFileSync(resolve(ROOT, 'notes/research-agenda-lab.md'), resolve(repoRoot, 'notes/research-agenda-lab.md'));
  }
  // build-owner-reads.mjs requires this at MODULE LOAD, so without it the producer aborts before
  // running and the wrapper refuses the whole publication. It is also the single definition of the
  // metrics the reads are built from, so the fixture must use the real one rather than a stand-in.
  copyFileSync(resolve(ROOT, 'rlmetrics.js'), resolve(repoRoot, 'rlmetrics.js'));
  // rlattention.js is required on BOTH sides of the publication boundary, so the
  // fixture needs it regardless of which assets the caller asked for:
  //   - scripts/validate-brief-payload.mjs require()s it, deliberately, so the
  //     publication gate and the renderer share ONE definition of an attention
  //     item rather than two copies that happen to agree today; and
  //   - market-brief.html loads it as a browser asset to render the tier.
  // Omitting it made the validator die with MODULE_NOT_FOUND before it could
  // judge anything, which the refresh script correctly reported as an invalid
  // baseline — a fixture gap presenting as a publication refusal.
  copyFileSync(resolve(ROOT, 'rlattention.js'), resolve(repoRoot, 'rlattention.js'));
  // The XNYS session calendar is the other dependency validate-brief-payload.mjs
  // resolves at MODULE scope (it builds XNYS_CALENDAR_SOURCE before any payload
  // is read), so it is required for every fixture variant, not just the ones
  // that ask for browser assets. It is the committed calendar rather than a
  // synthetic one on purpose: the decision window a published attention item
  // declares is only meaningful against the real session boundaries.
  mkdirSync(resolve(repoRoot, 'data/calendars/xnys'), { recursive: true });
  copyFileSync(
    resolve(ROOT, 'data/calendars/xnys/calendar.json'),
    resolve(repoRoot, 'data/calendars/xnys/calendar.json')
  );
  if (options.validatorMode === 'fail-final') {
    copyFileSync(resolve(ROOT, 'scripts/validate-brief-payload.mjs'), resolve(repoRoot, 'scripts/validate-brief-payload.real.mjs'));
    writeFixtureScript(resolve(repoRoot, 'scripts/validate-brief-payload.mjs'), `#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
/* validate-brief-payload.mjs is BOTH a CLI and a library: brief-narrative-parallel.mjs
   imports briefEventContractInstruction from it, and build-attention-items.mjs imports
   the watchlist/calendar/window contracts. A stub that models only the CLI half breaks
   those imports with a SyntaxError, which surfaces as "narrative attempt failed/invalid"
   and silently changes which publication branch the fixture exercises. Re-exporting the
   real module keeps the library half intact. Safe because the real module guards its own
   CLI entry on process.argv[1], so importing it never runs main(). */
export * from './validate-brief-payload.real.mjs';

/* The counter MUST live behind the same CLI guard. Counting at module scope counts
   IMPORTS as well as invocations, so every library consumer inflates the tally and the
   "fail on the Nth validation" contract stops meaning validations at all. */
const SCRIPT_PATH = fileURLToPath(import.meta.url);
if (process.argv[1] && resolvePath(process.argv[1]) === SCRIPT_PATH) {
  const countPath = process.env.BUG002_VALIDATOR_COUNT_FILE;
  const count = (existsSync(countPath) ? Number(readFileSync(countPath, 'utf8')) : 0) + 1;
  writeFileSync(countPath, String(count));
  if (count === 4) {
    const pagePath = resolvePath('market-brief.page.json');
    const page = JSON.parse(readFileSync(pagePath, 'utf8'));
    page.researchAgenda = { contractVersion: 'corrupted-post-build-page/v1' };
    writeFileSync(pagePath, JSON.stringify(page) + '\\n');
    console.error('[fixture-validator] corrupted post-build page before default parity validation');
  }
  const realValidator = fileURLToPath(new URL('./validate-brief-payload.real.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [realValidator, ...process.argv.slice(2)], { cwd: process.cwd(), env: process.env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
`);
  } else {
    copyFileSync(resolve(ROOT, 'scripts/validate-brief-payload.mjs'), resolve(repoRoot, 'scripts/validate-brief-payload.mjs'));
  }
  copyFileSync(resolve(ROOT, 'market-brief.payload.json'), resolve(repoRoot, 'market-brief.payload.json'));
  const fixturePayloadPath = resolve(repoRoot, 'market-brief.payload.json');
  const fixturePayload = JSON.parse(readFileSync(fixturePayloadPath, 'utf8'));
  if (!options.agendaAssets) delete fixturePayload.researchAgenda;
  fixturePayload.window = 'pre-market';
  fixturePayload.asOf = `${baselineDate}T14:05:00.000Z`;
  fixturePayload.generatedAt = `${baselineDate}T14:05:00.000Z`;
  fixturePayload.nextSession.sessionDate = baselineDate;
  /* This suite tests publication ATOMICITY, not narrative completeness, and its stub lane echoes
     this baseline as the "generated" payload. The publish path now refuses a generated narrative
     that omits required reader copy, so a baseline copied from a live payload that happens to be
     missing one would fail the lane gate and silently reroute every test onto the degraded branch.
     Derived from the required list rather than naming a field, because which field is missing
     changes per publish. */
  const conformedPayload = conformantNarrativePayload(fixturePayload);
  writeFileSync(fixturePayloadPath, JSON.stringify(conformedPayload, null, 2) + '\n');
  copyFileSync(resolve(ROOT, 'market-brief.config.json'), resolve(repoRoot, 'market-brief.config.json'));
  copyFileSync(resolve(ROOT, 'market-brief.scorecard.json'), resolve(repoRoot, 'market-brief.scorecard.json'));
  copyFileSync(resolve(ROOT, 'tools.json'), resolve(repoRoot, 'tools.json'));
  copyFileSync(resolve(ROOT, 'watchlist.json'), resolve(repoRoot, 'watchlist.json'));
  // Serve the exact set of scripts market-brief.html declares via <script src> so the
  // fixture-served page hydrates identically to the committed site. rlexperience-adapters/
  // market-action.js defines the browser global RLMARKETACTION that rlbrief.js hard-delegates
  // to (normalizeRecommendation/nextSessionActions/…); omitting it throws inside renderAll()
  // and boot() never schedules refreshLive(), so #liveNote never reaches "live shared cache
  // refreshed". The dynamically-loaded four-view shell (rlexperience.js/rlviews.js + configs)
  // is progressive enhancement loaded by rlapp.js with its own error handling and is not
  // required for the brief's core render or the live-refresh path.
  mkdirSync(resolve(repoRoot, 'rlexperience-adapters'), { recursive: true });
  for (const webPath of ['market-brief.html', 'rlg.js', 'rldata.js', 'rlexperience-adapters/market-action.js', 'rlbrief.js', 'rlmarketaction.js', 'rlticker.js', 'rlapp.js', 'rlnav.js']) {
    copyFileSync(resolve(ROOT, webPath), resolve(repoRoot, webPath));
  }
  if (options.browserAssets) {
    const config = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.config.json'), 'utf8'));
    const symbols = new Set([
      ...config.track.indexes,
      ...config.track.sectors,
      ...config.track.globalMarkets,
      ...config.track.realAssets,
      ...config.track.groups.flatMap((group) => [group.etf, ...group.members])
    ]);
    mkdirSync(resolve(repoRoot, 'data/bars'), { recursive: true });
    for (const symbol of symbols) {
      copyFileSync(resolve(ROOT, 'data/bars', `${symbol}.json`), resolve(repoRoot, 'data/bars', `${symbol}.json`));
    }
  }
  writeFileSync(resolve(repoRoot, 'market-brief.snapshot.json'), baselineSnapshot(baselineDate), 'utf8');
  writeFileSync(resolve(repoRoot, 'brief-history.jsonl'), fixtureHistory(baselineDate), 'utf8');
  writeFileSync(resolve(repoRoot, 'data/baseline.json'), '{"state":"baseline"}\n', 'utf8');
  writeFileSync(resolve(repoRoot, 'unrelated.txt'), 'unrelated baseline\n', 'utf8');

  writeFixtureScript(resolve(repoRoot, 'scripts/fetch-options.mjs'), `
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
if (process.env.BUG002_BOUNDARY_LOG) appendFileSync(process.env.BUG002_BOUNDARY_LOG, 'fetch-options\\n');
writeFileSync(new URL('../data/raw-refresh.json', import.meta.url), JSON.stringify({ refreshed: true }) + '\\n');
if (process.env.BRIEF_REQUIRE_COMPLETE_RUN === '1') {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const incomplete = process.env.BUG002_INCOMPLETE_REFRESH === '1';
  mkdirSync(new URL('../data/options/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../data/options/FIXTURE.json', import.meta.url), JSON.stringify({ sym: 'FIXTURE', o: [{ e: 1 }] }) + '\\n');
  writeFileSync(new URL('../data/options/index.json', import.meta.url), JSON.stringify({ updated: new Date().toISOString(), refreshDate: date, refreshWindow: process.env.BRIEF_WINDOW, expected: 1, count: 1, freshCount: incomplete ? 0 : 1, carriedCount: incomplete ? 1 : 0, missing: [], tickers: [{ sym: 'FIXTURE', carried: incomplete }] }) + '\\n');
}
console.log('[fixture-fetch-options] wrote independent raw data');
`);
  writeFixtureScript(resolve(repoRoot, 'scripts/fetch-bars.mjs'), `
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
if (process.env.BUG002_BOUNDARY_LOG) appendFileSync(process.env.BUG002_BOUNDARY_LOG, 'fetch-bars\\n');
if (process.env.BRIEF_REQUIRE_COMPLETE_RUN === '1') {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const incomplete = process.env.BUG002_INCOMPLETE_REFRESH === '1';
  mkdirSync(new URL('../data/bars/', import.meta.url), { recursive: true });
  /* Derive the latest COMPLETED session from the committed calendar, the way
     validate-brief-cache.mjs does, instead of defaulting to today. Today is a
     completed session only after that session closes; on a weekend, a holiday or
     before the close the two differ, and the fixture then manufactures an index
     the validator is right to reject — which reads as a data outage rather than
     as the fixture bug it is.
     Derived here independently rather than shared through
     BAR_EXPECTED_SESSION_DATE: both sides read that variable, so setting it
     would make them agree by construction and the assertion vacuous. */
  let completedSession = null;
  try {
    const cal = JSON.parse(readFileSync(new URL('../data/calendars/xnys/calendar.json', import.meta.url), 'utf8'));
    const now = Date.now();
    const rows = (cal.rows || []).filter((r) => (r.dateState === 'regular' || r.dateState === 'early-close') && r.regular && Number.isFinite(Date.parse(r.regular.endUtc)) && Date.parse(r.regular.endUtc) <= now);
    completedSession = rows.length ? rows[rows.length - 1].tradingDate : null;
  } catch { completedSession = null; }
  const sessionDate = process.env.BAR_EXPECTED_SESSION_DATE || completedSession || date;
  writeFileSync(new URL('../data/bars/FIXTURE.json', import.meta.url), JSON.stringify({ sym: 'FIXTURE', asof: sessionDate, rows: [{ t: 1, c: 1 }] }) + '\\n');
  writeFileSync(new URL('../data/bars/index.json', import.meta.url), JSON.stringify({ updated: new Date().toISOString(), refreshDate: date, refreshWindow: process.env.BRIEF_WINDOW, expectedSessionDate: sessionDate, expected: 1, count: 1, freshCount: incomplete ? 0 : 1, carriedCount: incomplete ? 1 : 0, reconstructedCount: 0, sessionReuseCount: 0, zeroObservedCount: 0, thinObservedCount: 0, missing: [], tickers: [{ sym: 'FIXTURE', asof: sessionDate, sessionDate, sessionState: 'observed', zeroObserved: false, thinObserved: false, carried: incomplete, reconstructed: false, sessionCached: false }] }) + '\\n');
}
console.log('[fixture-fetch-bars] no external fetch required');
`);
  writeFixtureScript(resolve(repoRoot, 'scripts/brief-refresh.mjs'), `
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
if (process.env.BUG002_BOUNDARY_LOG) appendFileSync(process.env.BUG002_BOUNDARY_LOG, 'tier-a\\n');
const snapshotUrl = new URL('../market-brief.snapshot.json', import.meta.url);
const historyUrl = new URL('../brief-history.jsonl', import.meta.url);
const snapshot = JSON.parse(readFileSync(snapshotUrl, 'utf8'));
snapshot.asOf = process.env.BUG002_CANDIDATE_DATE + 'T14:00:00.000Z';
snapshot.generatedAt = process.env.BUG002_CANDIDATE_DATE + 'T14:00:00.000Z';
snapshot.nextSessionDate = process.env.BUG002_CANDIDATE_DATE;
snapshot.marketClosed = true;
writeFileSync(snapshotUrl, JSON.stringify(snapshot, null, 2) + '\\n');
appendFileSync(historyUrl, JSON.stringify({
  ts: process.env.BUG002_CANDIDATE_DATE + 'T14:00:00.000Z',
  window: 'pre-market',
  marketClosed: false,
  nextSessionDate: process.env.BUG002_CANDIDATE_DATE,
  source: 'bug-002-candidate'
}) + '\\n');
console.log('[fixture-tier-a] candidate nextSessionDate=' + process.env.BUG002_CANDIDATE_DATE);
`);

  let copilotPath = null;
  if (options.narrativeMode) {
    copilotPath = resolve(fixtureRoot, 'copilot-stub.mjs');
    writeFixtureScript(copilotPath, `#!/usr/bin/env node
  import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const attempt = Number(process.env.BRIEF_NARRATIVE_ATTEMPT || 1);
const lane = process.env.BRIEF_LANE_ID;
const researchTopicLane = typeof lane === 'string' && lane.startsWith('research-') && lane !== 'research-acquisition';
const laneAttempt = Number(process.env.BRIEF_LANE_ATTEMPT || 1);
const keys = JSON.parse(process.env.BRIEF_LANE_KEYS || '[]');
const outputPath = process.env.BRIEF_LANE_OUTPUT;
if (lane === 'core') appendFileSync(process.env.BUG002_COPILOT_ATTEMPT_FILE, JSON.stringify({ attempt, laneAttempt, startedAt: Date.now() }) + '\\n');
const configPath = resolve('market-brief.config.json');
const payloadPath = resolve('market-brief.payload.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
const laneInputPath = resolve('.brief-work', lane + '.input.json');
const laneInput = existsSync(laneInputPath) ? JSON.parse(readFileSync(laneInputPath, 'utf8')) : null;
const toolBundleCount = laneInput && laneInput.toolBriefBundle && Array.isArray(laneInput.toolBriefBundle.tools)
  ? laneInput.toolBriefBundle.tools.length : null;
if (process.env.BUG002_NARRATIVE_MODE === 'retry-config' && attempt === 1 && lane === 'core') {
  config.failedAttemptLeak = true;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\\n');
  console.error('[fixture-copilot] attempt one failed after mutating valid JSON config');
  process.exit(1);
}
if (process.env.BUG002_NARRATIVE_MODE === 'lane-retry' && lane === 'groups' && laneAttempt === 1) {
  console.error('[fixture-copilot] groups lane failed on its first lane attempt');
  process.exit(1);
}
if (process.env.BUG002_NARRATIVE_MODE === 'transient-auth' && lane === 'core' && laneAttempt === 1) {
  console.error('Error: Authentication token found but could not be validated.');
  console.error('Failed to fetch GitHub CLI user login (503): GitHub returned: No server is currently available to service your request.');
  process.exit(1);
}
const cleanConfigObserved = !Object.prototype.hasOwnProperty.call(config, 'failedAttemptLeak');
if (lane === 'core') {
  const audit = { attempt, cleanConfigObserved };
  if (toolBundleCount !== null) audit.toolBundleCount = toolBundleCount;
  writeFileSync(process.env.BUG002_COPILOT_AUDIT_FILE, JSON.stringify(audit) + '\\n');
  payload.nextSession.sessionDate = process.env.BUG002_CANDIDATE_DATE;
}
const fragment = lane === 'research-acquisition'
  ? {
      contractVersion: 'research-acquisition-search/v1',
      generationId: laneInput.generationId,
      queries: laneInput.queryPlan.queries.map((query) => ({ queryId: query.queryId, candidates: [] }))
    }
  : researchTopicLane
    ? { contractVersion: 'research-situation-set/v1', generationId: laneInput.generationId, situations: [] }
    : Object.fromEntries(keys.map((key) => [key, payload[key]]));
/* The signals lane AUTHORS its attention candidates; it does not inherit them.
   Echoing the baseline tier alone made this fixture degenerate the moment the
   live brief legitimately published an empty one — see FIXTURE_ATTENTION_CANDIDATE. */
if (lane === 'signals') {
  fragment.attention = (Array.isArray(payload.attention) ? payload.attention : [])
    .concat([${JSON.stringify(FIXTURE_ATTENTION_CANDIDATE)}]);
}
writeFileSync(outputPath, JSON.stringify(fragment, null, 2) + '\\n');
console.log('[fixture-copilot] wrote lane=' + lane + ' attempt=' + attempt);
if (process.env.BUG002_NARRATIVE_MODE === 'post-write-hang' && lane === 'core') {
  console.error('[fixture-copilot] core lane intentionally remains alive after complete output');
  setInterval(() => {}, 1000);
}
`);
  }

  // Build the same selected-history, scorecard, and compact projections the production transaction
  // owns before the baseline commit. Failed/retained runs can then prove byte-identity instead of
  // manufacturing first-run derived files that obscure atomicity.
  execFileSync(process.execPath, ['scripts/shard-brief-history.mjs'], { cwd: repoRoot, stdio: 'ignore' });
  execFileSync(process.execPath, ['scripts/build-scorecard.mjs'], { cwd: repoRoot, stdio: 'ignore' });
  execFileSync(process.execPath, ['scripts/build-brief-page-artifacts.mjs'], { cwd: repoRoot, stdio: 'ignore' });

  runGit(repoRoot, ['init']);
  runGit(repoRoot, ['checkout', '-b', 'main']);
  runGit(repoRoot, ['config', 'user.name', 'BUG-002 Fixture']);
  runGit(repoRoot, ['config', 'user.email', 'bug-002@invalid.example']);
  runGit(repoRoot, ['add', '--', '.']);
  runGit(repoRoot, ['commit', '-m', 'baseline coherent market brief']);
  runGit(fixtureRoot, ['init', '--bare', remoteRoot]);
  runGit(repoRoot, ['remote', 'add', 'origin', remoteRoot]);
  runGit(repoRoot, ['push', '-u', 'origin', 'main']);

  const baseline = Object.fromEntries(PUBLICATION_PATHS.map((path) => [path, readFileSync(resolve(repoRoot, path))]));
  return {
    baseline,
    baselineDate,
    boundaryLog,
    candidateDate,
    cleanup() {
      rmSync(fixtureRoot, { recursive: true, force: true });
    },
    copilotAttemptFile,
    copilotAuditFile,
    copilotPath,
    fixtureRoot,
    initialHead: runGit(repoRoot, ['rev-parse', 'HEAD']),
    narrativeMode: options.narrativeMode || null,
    remoteRoot,
    repoRoot,
    validatorCountFile
  };
}

export function runBriefRefreshFixture(fixture, env = {}) {
  return spawnSync('bash', ['scripts/brief-refresh-and-push.sh'], {
    cwd: fixture.repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      BRIEF_COPILOT_BIN: fixture.copilotPath || '',
      BRIEF_NARRATIVE_ATTEMPTS: '2',
      BRIEF_LANE_ATTEMPTS: '1',
      BRIEF_LANE_CONCURRENCY: '4',
      BRIEF_SKIP_NARRATIVE: fixture.copilotPath ? '0' : '1',
      BUG002_BOUNDARY_LOG: fixture.boundaryLog,
      BUG002_CANDIDATE_DATE: fixture.candidateDate,
      BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
      BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
      BUG002_NARRATIVE_MODE: fixture.narrativeMode || '',
      BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile,
      ...env
    }
  });
}

export function readPublicationState(fixture) {
  const snapshotBytes = readFileSync(resolve(fixture.repoRoot, 'market-brief.snapshot.json'));
  const historyBytes = readFileSync(resolve(fixture.repoRoot, 'brief-history.jsonl'));
  const payloadBytes = readFileSync(resolve(fixture.repoRoot, 'market-brief.payload.json'));
  const configBytes = readFileSync(resolve(fixture.repoRoot, 'market-brief.config.json'));
  const snapshot = JSON.parse(snapshotBytes.toString('utf8'));
  const payload = JSON.parse(payloadBytes.toString('utf8'));
  return {
    configBytes,
    head: runGit(fixture.repoRoot, ['rev-parse', 'HEAD']),
    historyBytes,
    lastCommitPaths: runGit(fixture.repoRoot, ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD']).split('\n').filter(Boolean),
    payload,
    payloadBytes,
    payloadDate: payload.nextSession.sessionDate,
    snapshotBytes,
    snapshotDate: snapshot.nextSessionDate,
    staged: runGit(fixture.repoRoot, ['diff', '--cached', '--name-only']),
    status: runGit(fixture.repoRoot, ['status', '--short', '--untracked-files=all'])
  };
}

export function runFixtureValidator(fixture) {
  return spawnSync(process.execPath, ['scripts/validate-brief-payload.mjs'], {
    cwd: fixture.repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      BUG002_VALIDATOR_COUNT_FILE: resolve(fixture.fixtureRoot, 'standalone-validator-count.txt')
    }
  });
}

export async function startBriefFixtureServer(fixture) {
  const server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'market-brief.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(fixture.repoRoot, relative);
    if ((filePath !== fixture.repoRoot && !filePath.startsWith(fixture.repoRoot + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': MIME[extname(filePath)] || 'application/octet-stream',
      'referrer-policy': 'no-referrer'
    });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolveClosed, rejectClosed) => {
      server.close((error) => error ? rejectClosed(error) : resolveClosed());
      server.closeAllConnections?.();
    })
  };
}
