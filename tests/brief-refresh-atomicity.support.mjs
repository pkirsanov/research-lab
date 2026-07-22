import { execFileSync, spawnSync } from 'node:child_process';
import {
  createReadStream,
  chmodSync,
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
  copyFileSync(resolve(ROOT, 'scripts/validate-brief-cache.mjs'), resolve(repoRoot, 'scripts/validate-brief-cache.mjs'));
  if (options.validatorMode === 'fail-final') {
    copyFileSync(resolve(ROOT, 'scripts/validate-brief-payload.mjs'), resolve(repoRoot, 'scripts/validate-brief-payload.real.mjs'));
    writeFixtureScript(resolve(repoRoot, 'scripts/validate-brief-payload.mjs'), `#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const countPath = process.env.BUG002_VALIDATOR_COUNT_FILE;
const count = (existsSync(countPath) ? Number(readFileSync(countPath, 'utf8')) : 0) + 1;
writeFileSync(countPath, String(count));
const realValidator = fileURLToPath(new URL('./validate-brief-payload.real.mjs', import.meta.url));
const result = spawnSync(process.execPath, [realValidator, ...process.argv.slice(2)], { cwd: process.cwd(), env: process.env, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
if (count === 3) {
  console.error('[fixture-validator] forced final validation failure');
  process.exit(1);
}
`);
  } else {
    copyFileSync(resolve(ROOT, 'scripts/validate-brief-payload.mjs'), resolve(repoRoot, 'scripts/validate-brief-payload.mjs'));
  }
  copyFileSync(resolve(ROOT, 'market-brief.payload.json'), resolve(repoRoot, 'market-brief.payload.json'));
  const fixturePayloadPath = resolve(repoRoot, 'market-brief.payload.json');
  const fixturePayload = JSON.parse(readFileSync(fixturePayloadPath, 'utf8'));
  fixturePayload.window = 'pre-market';
  fixturePayload.asOf = `${baselineDate}T14:05:00.000Z`;
  fixturePayload.generatedAt = `${baselineDate}T14:05:00.000Z`;
  fixturePayload.nextSession.sessionDate = baselineDate;
  writeFileSync(fixturePayloadPath, JSON.stringify(fixturePayload, null, 2) + '\n');
  copyFileSync(resolve(ROOT, 'market-brief.config.json'), resolve(repoRoot, 'market-brief.config.json'));
  copyFileSync(resolve(ROOT, 'tools.json'), resolve(repoRoot, 'tools.json'));
  copyFileSync(resolve(ROOT, 'watchlist.json'), resolve(repoRoot, 'watchlist.json'));
  for (const webPath of ['market-brief.html', 'rlbrief.js', 'rlg.js', 'rlticker.js', 'rldata.js', 'rlapp.js', 'rlnav.js']) {
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
import { appendFileSync, writeFileSync } from 'node:fs';
if (process.env.BUG002_BOUNDARY_LOG) appendFileSync(process.env.BUG002_BOUNDARY_LOG, 'fetch-options\\n');
writeFileSync(new URL('../data/raw-refresh.json', import.meta.url), JSON.stringify({ refreshed: true }) + '\\n');
console.log('[fixture-fetch-options] wrote independent raw data');
`);
  writeFixtureScript(resolve(repoRoot, 'scripts/fetch-bars.mjs'), `
import { appendFileSync } from 'node:fs';
if (process.env.BUG002_BOUNDARY_LOG) appendFileSync(process.env.BUG002_BOUNDARY_LOG, 'fetch-bars\\n');
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
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const attempt = Number(process.env.BRIEF_NARRATIVE_ATTEMPT || 1);
const lane = process.env.BRIEF_LANE_ID;
const laneAttempt = Number(process.env.BRIEF_LANE_ATTEMPT || 1);
const keys = JSON.parse(process.env.BRIEF_LANE_KEYS || '[]');
const outputPath = process.env.BRIEF_LANE_OUTPUT;
if (lane === 'core') writeFileSync(process.env.BUG002_COPILOT_ATTEMPT_FILE, String(attempt));
const configPath = resolve('market-brief.config.json');
const payloadPath = resolve('market-brief.payload.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
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
const cleanConfigObserved = !Object.prototype.hasOwnProperty.call(config, 'failedAttemptLeak');
if (lane === 'core') {
  writeFileSync(process.env.BUG002_COPILOT_AUDIT_FILE, JSON.stringify({ attempt, cleanConfigObserved }) + '\\n');
  payload.nextSession.sessionDate = process.env.BUG002_CANDIDATE_DATE;
}
const fragment = Object.fromEntries(keys.map((key) => [key, payload[key]]));
writeFileSync(outputPath, JSON.stringify(fragment, null, 2) + '\\n');
console.log('[fixture-copilot] wrote lane=' + lane + ' attempt=' + attempt);
if (process.env.BUG002_NARRATIVE_MODE === 'post-write-hang' && lane === 'core') {
  console.error('[fixture-copilot] core lane intentionally remains alive after complete output');
  setInterval(() => {}, 1000);
}
`);
  }

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
