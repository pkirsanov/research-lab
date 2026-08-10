import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  createBriefRefreshFixture,
  gitFixture,
  readPublicationState,
  runBriefRefreshFixture,
  runFixtureValidator
} from './brief-refresh-atomicity.support.mjs';

/* One outcome per registered tool EXCEPT the brief itself, which consumes the
   bundle rather than contributing to it. Derived from the registry the fixture
   copies verbatim, because a literal here silently under-covers the barrier the
   moment a tool is registered — which is exactly how this drifted to 22. */
const EXPECTED_TOOL_BUNDLE_COUNT = (() => {
  const registry = JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'));
  const tools = Array.isArray(registry) ? registry : registry.tools;
  return tools.filter((tool) => tool && tool.id !== 'market-brief').length;
})();

/* The scheduler echoes the policy it will actually run with. The tests below pass
   no override, so they exercise its DECLARED DEFAULTS - and a restated default
   stops testing anything the moment it moves, which is exactly how the assertion
   for 1800s outlived the change to 2700s while still passing for weeks. Read from
   the declaration so the two cannot drift apart; a scheduler that echoes a value
   it was not configured with still fails. */
function schedulerDefault(name) {
  const source = readFileSync(new URL('../scripts/brief-refresh-scheduled.sh', import.meta.url), 'utf8');
  const declaration = source.match(new RegExp(`^export ${name}="\\$\\{${name}:-([^}]+)\\}"`, 'm'));
  if (!declaration) {
    throw new Error(`brief-refresh-scheduled.sh no longer declares a default for ${name}; the policy assertion cannot be derived`);
  }
  return declaration[1];
}

function narrativePolicyPattern() {
  return new RegExp(`narrative policy: ${schedulerDefault('BRIEF_NARRATIVE_ATTEMPTS')} attempt\\(s\\), ${schedulerDefault('BRIEF_NARRATIVE_TIMEOUT')}s each`);
}

function lanePolicyPattern() {
  return new RegExp(`lane policy: ${schedulerDefault('BRIEF_LANE_CONCURRENCY')} concurrent, ${schedulerDefault('BRIEF_LANE_ATTEMPTS')} attempt\\(s\\) each, ${schedulerDefault('BRIEF_LANE_EXIT_GRACE')}s post-write exit grace`);
}

function repairPolicyPattern() {
  return new RegExp(`invalid-baseline repair: ${schedulerDefault('BRIEF_REPAIR_INVALID_BASELINE')} \\(final validation remains mandatory\\)`);
}

function readSchedulerStatus(path) {
  return Object.fromEntries(readFileSync(path, 'utf8').trim().split('\n').map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
}

if (process.env.NODE_TEST_CONTEXT) {
  const { default: test } = await import('node:test');

  test('installed launchd template and scheduler share one 30-minute publication lead', () => {
    const scheduler = readFileSync(resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh'), 'utf8');
    const plist = readFileSync(resolve(process.cwd(), 'scripts/com.researchlab.brief-refresh.plist'), 'utf8');
    assert.match(scheduler, /PUBLICATION_LEAD_MINUTES="\$\{BRIEF_PUBLICATION_LEAD_MINUTES:-30\}"/);
    assert.match(plist, /<key>BRIEF_PUBLICATION_LEAD_MINUTES<\/key>\s*<string>30<\/string>/);
    for (const [hour, minute] of [[4, 0], [7, 30], [11, 30], [13, 30]]) {
      assert.match(plist, new RegExp(`<key>Hour<\\/key><integer>${hour}<\\/integer><key>Minute<\\/key><integer>${minute}<\\/integer>`));
    }
  });

  // Regression: specs/_bugs/BUG-002-market-brief-session-date-drift/
  test('Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());

    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);

    console.log('[bug002-atomicity] wrapperExit=' + result.status);
    console.log('[bug002-atomicity] baselineDate=' + fixture.baselineDate);
    console.log('[bug002-atomicity] candidateDate=' + fixture.candidateDate);
    console.log('[bug002-atomicity] payloadDate=' + publication.payloadDate);
    console.log('[bug002-atomicity] snapshotDate=' + publication.snapshotDate);
    console.log('[bug002-atomicity] snapshotRetained=' + publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']));
    console.log('[bug002-atomicity] historyRetained=' + publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']));
    console.log('[bug002-atomicity] payloadRetained=' + publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']));
    console.log('[bug002-atomicity] staged=' + JSON.stringify(publication.staged));
    console.log('[bug002-atomicity] status=' + JSON.stringify(publication.status));
    console.log('[bug002-atomicity] stdout=' + JSON.stringify(result.stdout.trim().split('\n')));
    console.log('[bug002-atomicity] stderr=' + JSON.stringify(result.stderr.trim().split('\n')));

    assert.equal(result.status, 0, 'the scheduled wrapper completes its soft-failure path');
    assert.equal(publication.payloadDate, fixture.baselineDate, 'failed Tier B retains the prior payload target');
    assert.equal(publication.snapshotDate, fixture.baselineDate, 'failed rollover retains the prior snapshot target');
    assert.ok(publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']), 'failed rollover retains exact snapshot bytes');
    assert.ok(publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']), 'failed rollover retains exact published history bytes');
    assert.ok(publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']), 'failed rollover retains exact payload bytes');
    assert.equal(publication.snapshotDate, publication.payloadDate, 'published pair remains coherent');
    assert.equal(publication.staged, '', 'wrapper leaves no owned staged paths');
  });

  test('same-target retained Tier B publishes candidate Tier A with visible payload staleness', (context) => {
    const fixture = createBriefRefreshFixture({ candidateDate: '2026-07-15' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /selected transaction=same-target-data-only/);
    assert.equal(publication.snapshotDate, fixture.baselineDate);
    assert.equal(publication.payloadDate, fixture.baselineDate);
    assert.ok(!publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']));
    assert.ok(!publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']));
    assert.ok(publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']));
    assert.deepEqual(new Set(publication.lastCommitPaths), new Set(['brief-history.jsonl', 'brief-history.recent.jsonl', 'briefs/tier-a/2026-07.jsonl', 'data/raw-refresh.json', 'market-brief.scorecard.json', 'market-brief.snapshot.json', 'market-brief.snapshot.page.json']));
  });

  test('matching generated Tier B advances snapshot payload and history together', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);
    const validator = runFixtureValidator(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /selected transaction=matching-pair/);
    for (const lane of ['core', 'signals', 'groups', 'coverage']) {
      assert.ok(result.stdout.indexOf(`lane=${lane} started`) >= 0, `missing ${lane} lane start`);
      assert.ok(result.stdout.indexOf(`lane=${lane} started`) < result.stdout.indexOf('lane=core complete'), `${lane} did not start before collection`);
    }
    assert.match(result.stdout, /collected final payload from 4 lanes/);
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
    assert.ok(!publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']));
    assert.ok(!publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']));
    assert.ok(!publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']));
    assert.equal(validator.status, 0, validator.stderr);
  });

  test('failed Copilot lane retries without rerunning successful lanes', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'lane-retry' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture, {
      BRIEF_NARRATIVE_ATTEMPTS: '1',
      BRIEF_LANE_ATTEMPTS: '2',
      BRIEF_LANE_CONCURRENCY: '2'
    });
    const publication = readPublicationState(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /lane=groups attempt=1\/2 failed; retrying only this lane/);
    assert.match(result.stdout, /lane=groups started attempt=2\/2/);
    assert.doesNotMatch(result.stdout, /narrative attempt 1 failed\/invalid/);
    for (const lane of ['core', 'signals', 'coverage']) {
      assert.equal(result.stdout.match(new RegExp(`lane=${lane} started`, 'g'))?.length, 1, `${lane} was rerun`);
    }
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
  });

  test('complete lane output survives a post-write Copilot process hang', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'post-write-hang' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture, {
      BRIEF_NARRATIVE_ATTEMPTS: '1',
      BRIEF_LANE_ATTEMPTS: '1',
      BRIEF_LANE_CONCURRENCY: '2',
      BRIEF_LANE_EXIT_GRACE: '1',
      BRIEF_LANE_TERMINATE_GRACE: '1'
    });
    const publication = readPublicationState(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /lane=core recovered complete fragment after post-write-grace/);
    assert.match(result.stdout, /selected transaction=matching-pair/);
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
  });

  test('lane concurrency cap queues excess workers without dropping a lane', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture, {
      BRIEF_NARRATIVE_ATTEMPTS: '1',
      BRIEF_LANE_CONCURRENCY: '2'
    });
    const events = result.stdout.split('\n').filter((line) => /lane=.+ (started|complete)/.test(line));
    let active = 0;
    let maxActive = 0;
    for (const event of events) {
      if (event.includes(' started ')) active += 1;
      if (event.includes(' complete ')) active -= 1;
      maxActive = Math.max(maxActive, active);
      assert.ok(active >= 0, `completion preceded start: ${event}`);
    }

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.equal(maxActive, 2, `expected two concurrent lanes\n${events.join('\n')}`);
    assert.equal(active, 0, 'all started lanes completed');
    assert.equal(events.filter((line) => line.includes(' started ')).length, 4);
  });

  test('failed narrative attempt restores config before a successful retry', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'retry-config' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);
    assert.ok(existsSync(fixture.copilotAuditFile), `Copilot audit missing\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    const audit = JSON.parse(readFileSync(fixture.copilotAuditFile, 'utf8'));

    assert.equal(result.status, 0);
    assert.match(result.stdout, /narrative attempt 1 failed\/invalid — restoring payload\/config before retry/);
    assert.deepEqual(audit, { attempt: 2, cleanConfigObserved: true });
    assert.ok(publication.configBytes.equals(fixture.baseline['market-brief.config.json']));
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
  });

  test('dirty owned publication path refuses before every external boundary', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const snapshotPath = resolve(fixture.repoRoot, 'market-brief.snapshot.json');
    const dirtyBytes = Buffer.concat([readFileSync(snapshotPath), Buffer.from('\n')]);
    writeFileSync(snapshotPath, dirtyBytes);

    const result = runBriefRefreshFixture(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /refusing: wrapper-owned publication paths are dirty/);
    assert.ok(readFileSync(snapshotPath).equals(dirtyBytes));
    assert.equal(gitFixture(fixture, ['rev-parse', 'HEAD']), fixture.initialHead);
    assert.equal(existsSync(fixture.boundaryLog), false);
  });

  test('scheduled launcher publishes from an isolated checkout while developer-owned output is dirty', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const snapshotPath = resolve(fixture.repoRoot, 'market-brief.snapshot.json');
    const dirtyBytes = Buffer.concat([readFileSync(snapshotPath), Buffer.from('\n')]);
    writeFileSync(snapshotPath, dirtyBytes);
    const workerPath = resolve(fixture.repoRoot, 'scripts/brief-refresh-and-push.sh');
    const workerSource = readFileSync(workerPath, 'utf8').replace(
      'set -uo pipefail',
      'set -uo pipefail\necho "[fixture-source-worker] local worker selected"'
    );
    writeFileSync(workerPath, workerSource);
    const validatorPath = resolve(fixture.repoRoot, 'scripts/validate-brief-payload.mjs');
    const validatorSource = readFileSync(validatorPath, 'utf8').replace(
      'function main() {',
      'function main() {\n  console.log("[fixture-source-validator] local validator selected");'
    );
    writeFileSync(validatorPath, validatorSource);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler.status');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_SCHEDULE_STATUS_FILE: statusFile,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `scheduler failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /publisher checkout ready; developer worktree remains untouched/);
    assert.match(result.stdout, narrativePolicyPattern());
    assert.match(result.stdout, lanePolicyPattern());
    assert.match(result.stdout, repairPolicyPattern());
    assert.doesNotMatch(result.stdout, /\[fixture-source-worker\] local worker selected/, 'dirty local worker must not execute');
    assert.doesNotMatch(result.stdout, /\[fixture-source-validator\] local validator selected/, 'dirty local validator must not execute');
    assert.match(result.stdout, /pulling latest origin\/main before tool updates/);
    assert.doesNotMatch(result.stdout, /does not satisfy pull-data-tools-final-ack-v2/);
    assert.match(result.stdout, /tool brief barrier passed/);
    assert.deepEqual(JSON.parse(readFileSync(fixture.copilotAuditFile, 'utf8')), {
      attempt: 1,
      cleanConfigObserved: true,
      toolBundleCount: EXPECTED_TOOL_BUNDLE_COUNT
    }, `the final-author lane consumes all ${EXPECTED_TOOL_BUNDLE_COUNT} prepared source-tool outcomes`);
    const orderedMarkers = [
      'pulling latest origin/main before tool updates',
      '[fixture-fetch-bars]',
      '[fixture-fetch-options]',
      '[fixture-tier-a]',
      'tool brief barrier passed',
      'lane=core started',
      'collected final payload from 4 lanes',
      '[brief-distributed] published generation',
      '[brief-timer] committed:'
    ];
    let priorIndex = -1;
    for (const marker of orderedMarkers) {
      const markerIndex = result.stdout.indexOf(marker);
      assert.ok(markerIndex > priorIndex, `${marker} must follow the prior scheduled stage`);
      priorIndex = markerIndex;
    }
    assert.match(result.stdout, /publisher finished with exit=0/);
    assert.ok(readFileSync(snapshotPath).equals(dirtyBytes), 'developer snapshot bytes remain untouched');
    assert.equal(gitFixture(fixture, ['status', '--porcelain=v1', '--', 'market-brief.snapshot.json']), 'M market-brief.snapshot.json');
    gitFixture(fixture, ['fetch', 'origin']);
    const publishedHead = gitFixture(fixture, ['rev-parse', 'origin/main']);
    assert.notEqual(publishedHead, fixture.initialHead, 'isolated publisher advances origin/main');
    const status = readSchedulerStatus(statusFile);
    assert.equal(status.state, 'success', 'durable scheduler receipt records success');
    assert.equal(status.exitCode, '0', 'durable scheduler receipt records the publisher exit');
    assert.equal(status.publishedCommit, publishedHead, 'durable scheduler receipt records the pushed commit');
    assert.equal(status.lastSuccessCommit, publishedHead, 'durable scheduler receipt preserves the last successful commit');
    assert.ok(Number(status.finishedEpoch) >= Number(status.startedEpoch), 'durable scheduler receipt records an ordered run interval');
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released');
  });

  test('scheduled launcher remains immutable while its long worker is active', async (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const workerPath = resolve(fixture.repoRoot, 'scripts/brief-refresh-and-push.sh');
    const workerSource = readFileSync(workerPath, 'utf8').replace(
      'set -uo pipefail',
      'set -uo pipefail\necho "[fixture-worker] scheduler child is blocked"\nsleep 2'
    );
    writeFileSync(workerPath, workerSource);
    gitFixture(fixture, ['add', '--', 'scripts/brief-refresh-and-push.sh']);
    gitFixture(fixture, ['commit', '-m', 'block fixture worker during launcher mutation']);
    gitFixture(fixture, ['push', 'origin', 'main']);

    const launcherPath = resolve(fixture.fixtureRoot, 'brief-refresh-scheduled.sh');
    copyFileSync(resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh'), launcherPath);
    chmodSync(launcherPath, 0o755);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-immutable.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-immutable.status');
    const originalRemoteHead = gitFixture(fixture, ['rev-parse', 'origin/main']);
    let stdout = '';
    let stderr = '';
    let launcherMutated = false;

    const result = await new Promise((resolveResult, rejectResult) => {
      const child = spawn('bash', [launcherPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
          BRIEF_SCHEDULE_LOCK_DIR: lockDir,
          BRIEF_SCHEDULE_STATUS_FILE: statusFile,
          BRIEF_COPILOT_BIN: fixture.copilotPath,
          BUG002_BOUNDARY_LOG: fixture.boundaryLog,
          BUG002_CANDIDATE_DATE: fixture.candidateDate,
          BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
          BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
          BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
        }
      });
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
        if (!launcherMutated && stdout.includes('[fixture-worker] scheduler child is blocked')) {
          launcherMutated = true;
          writeFileSync(launcherPath, '#!/usr/bin/env bash\nexit 99\n');
        }
      });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('error', rejectResult);
      child.on('close', (code, signal) => resolveResult({ code, signal }));
    });

    assert.equal(launcherMutated, true, 'the live launcher source is replaced only after the worker starts');
    assert.equal(result.signal, null, `scheduler was terminated by ${result.signal}`);
    assert.equal(result.code, 0, `scheduler failed after source replacement\nstdout:\n${stdout}\nstderr:\n${stderr}`);
    assert.match(stdout, /publisher finished with exit=0/);
    gitFixture(fixture, ['fetch', 'origin']);
    const publishedHead = gitFixture(fixture, ['rev-parse', 'origin/main']);
    assert.notEqual(publishedHead, originalRemoteHead, 'the isolated publisher still advances origin/main');
    const status = readSchedulerStatus(statusFile);
    assert.equal(status.state, 'success');
    assert.equal(status.exitCode, '0');
    assert.equal(status.publishedCommit, publishedHead);
    assert.equal(status.lastSuccessRunKey, status.runKey);
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released after the source is replaced');
  });

  test('scheduled catch-up is idempotent after the current run key succeeds', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-catch-up.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-catch-up.status');
    const runKey = '2026-07-27/pre-market';
    const env = {
      ...process.env,
      BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
      BRIEF_SCHEDULE_LOCK_DIR: lockDir,
      BRIEF_SCHEDULE_STATUS_FILE: statusFile,
      BRIEF_SCHEDULE_DUE_ONLY: '1',
      BRIEF_SCHEDULE_RUN_KEY: runKey,
      BRIEF_COPILOT_BIN: fixture.copilotPath,
      BUG002_BOUNDARY_LOG: fixture.boundaryLog,
      BUG002_CANDIDATE_DATE: fixture.candidateDate,
      BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
      BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
      BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
    };
    const first = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(), encoding: 'utf8', env
    });
    assert.equal(first.status, 0, `first catch-up failed\nstdout:\n${first.stdout}\nstderr:\n${first.stderr}`);
    assert.match(first.stdout, /publication due for 2026-07-27\/pre-market/);
    gitFixture(fixture, ['fetch', 'origin']);
    const publishedHead = gitFixture(fixture, ['rev-parse', 'origin/main']);
    const boundaryAfterFirst = readFileSync(fixture.boundaryLog, 'utf8');

    const second = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(), encoding: 'utf8', env
    });
    assert.equal(second.status, 0, `idempotent catch-up failed\nstdout:\n${second.stdout}\nstderr:\n${second.stderr}`);
    assert.match(second.stdout, /publication already succeeded for 2026-07-27\/pre-market — no catch-up needed/);
    assert.doesNotMatch(second.stdout, /cloning origin\/main/, 'idempotent catch-up stops before network and publication work');
    assert.equal(readFileSync(fixture.boundaryLog, 'utf8'), boundaryAfterFirst, 'idempotent catch-up crosses no external data or author boundary');
    gitFixture(fixture, ['fetch', 'origin']);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), publishedHead, 'idempotent catch-up creates no second publication commit');
    const status = readSchedulerStatus(statusFile);
    assert.equal(status.state, 'already-current');
    assert.equal(status.lastSuccessRunKey, runKey);
    assert.equal(status.lastSuccessCommit, publishedHead);
    assert.equal(existsSync(lockDir), false, 'idempotent catch-up releases the scheduler lock');
  });

  test('scheduler recovers its current receipt when the parent terminates after a confirmed push', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const workerPath = resolve(fixture.repoRoot, 'scripts/brief-refresh-and-push.sh');
    writeFileSync(workerPath, `${readFileSync(workerPath, 'utf8')}\nkill -TERM "$PPID"\n`);
    gitFixture(fixture, ['add', '--', 'scripts/brief-refresh-and-push.sh']);
    gitFixture(fixture, ['commit', '-m', 'terminate fixture parent after confirmed push']);
    gitFixture(fixture, ['push', 'origin', 'main']);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-current-ack.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-current-ack.status');
    const runKey = '2026-07-27/pre-market';

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_SCHEDULE_STATUS_FILE: statusFile,
        BRIEF_SCHEDULE_RUN_KEY: runKey,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `post-push recovery failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /recovered successful publication from the current post-push acknowledgment/);
    gitFixture(fixture, ['fetch', 'origin']);
    const publishedHead = gitFixture(fixture, ['rev-parse', 'origin/main']);
    const status = readSchedulerStatus(statusFile);
    assert.equal(status.state, 'success');
    assert.equal(status.exitCode, '0');
    assert.equal(status.publishedCommit, publishedHead);
    assert.equal(status.lastSuccessCommit, publishedHead);
    assert.equal(status.lastSuccessRunKey, runKey);
    assert.equal(existsSync(lockDir), false, 'trap-time acknowledgment recovery releases the scheduler lock');
  });

  test('scheduled catch-up reconciles a pushed window after its main receipt is lost', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-orphan-ack.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-orphan-ack.status');
    const runKey = '2026-07-27/pre-market';
    const env = {
      ...process.env,
      BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
      BRIEF_SCHEDULE_LOCK_DIR: lockDir,
      BRIEF_SCHEDULE_STATUS_FILE: statusFile,
      BRIEF_SCHEDULE_DUE_ONLY: '1',
      BRIEF_SCHEDULE_RUN_KEY: runKey,
      BRIEF_COPILOT_BIN: fixture.copilotPath,
      BUG002_BOUNDARY_LOG: fixture.boundaryLog,
      BUG002_CANDIDATE_DATE: fixture.candidateDate,
      BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
      BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
      BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
    };
    const first = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(), encoding: 'utf8', env
    });
    assert.equal(first.status, 0, `initial publication failed\nstdout:\n${first.stdout}\nstderr:\n${first.stderr}`);
    assert.match(readFileSync(`${statusFile}.publish-ack`, 'utf8'), /runKey=2026-07-27\/pre-market/);
    gitFixture(fixture, ['fetch', 'origin']);
    const publishedHead = gitFixture(fixture, ['rev-parse', 'origin/main']);
    const boundaryAfterFirst = readFileSync(fixture.boundaryLog, 'utf8');

    writeFileSync(statusFile, [
      'schemaVersion=1',
      'state=failed',
      'pid=99999999',
      'startedAt=2026-07-27T15:00:00Z',
      'startedEpoch=1785164400',
      'finishedAt=2026-07-27T15:30:00Z',
      'finishedEpoch=1785166200',
      'exitCode=2',
      'branch=main',
      'remote=origin',
      `runKey=${runKey}`,
      'window=pre-market',
      'publishedCommit=',
      'lastSuccessAt=',
      'lastSuccessEpoch=',
      'lastSuccessCommit=',
      'lastSuccessRunKey='
    ].join('\n') + '\n');

    const recovery = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(), encoding: 'utf8', env
    });
    assert.equal(recovery.status, 0, `ack recovery failed\nstdout:\n${recovery.stdout}\nstderr:\n${recovery.stderr}`);
    assert.match(recovery.stdout, /reconciled successful remote publication for 2026-07-27\/pre-market/);
    assert.doesNotMatch(recovery.stdout, /cloning origin\/main/, 'ack reconciliation stops before publication work');
    assert.equal(readFileSync(fixture.boundaryLog, 'utf8'), boundaryAfterFirst, 'reconciliation performs no data or author work');
    gitFixture(fixture, ['fetch', 'origin']);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), publishedHead, 'reconciliation creates no duplicate commit');
    const status = readSchedulerStatus(statusFile);
    assert.equal(status.state, 'success');
    assert.equal(status.exitCode, '0');
    assert.equal(status.publishedCommit, publishedHead);
    assert.equal(status.lastSuccessCommit, publishedHead);
    assert.equal(status.lastSuccessRunKey, runKey);
    assert.equal(existsSync(lockDir), false, 'ack reconciliation releases the scheduler lock');
  });

  test('scheduled launcher reclaims a dead stale lock before publication', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-dead.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-dead.status');
    mkdirSync(lockDir);
    writeFileSync(resolve(lockDir, 'pid'), '99999999\n');
    writeFileSync(resolve(lockDir, 'started-epoch'), '1\n');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_SCHEDULE_STATUS_FILE: statusFile,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `dead-lock recovery failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /reclaiming stale publication lock \(pid=99999999/);
    assert.match(result.stdout, /publisher finished with exit=0/);
    assert.equal(readSchedulerStatus(statusFile).state, 'success');
    assert.equal(existsSync(lockDir), false, 'recovered scheduler lock is released');
  });

  test('scheduled launcher refuses incomplete current-window data before tool and final briefs', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-incomplete.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-incomplete.status');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_SCHEDULE_STATUS_FILE: statusFile,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_NARRATIVE_MODE: fixture.narrativeMode,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile,
        BUG002_INCOMPLETE_REFRESH: '1'
      }
    });

    assert.equal(result.status, 1, `incomplete refresh unexpectedly succeeded\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /pulling latest origin\/main before tool updates/);
    assert.match(result.stdout, /current-window data refresh is incomplete — refusing before tool briefs/);
    assert.doesNotMatch(result.stdout, /tool brief barrier passed/);
    assert.doesNotMatch(result.stdout, /lane=core started/);
    assert.equal(existsSync(fixture.copilotAuditFile), false, 'final author was never invoked');
    gitFixture(fixture, ['fetch', 'origin']);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), fixture.initialHead, 'no incomplete run commit reached origin');
    const status = readSchedulerStatus(statusFile);
    assert.equal(status.state, 'failed', 'durable scheduler receipt records a refused run');
    assert.equal(status.exitCode, '1', 'durable scheduler receipt records the refusal exit');
    assert.equal(status.lastSuccessCommit, '', 'a failed first run cannot fabricate a successful commit');
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released after refusal');
  });

  test('scheduled launcher refuses a stale pulled worker before tool updates', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const workerPath = resolve(fixture.repoRoot, 'scripts/brief-refresh-and-push.sh');
    writeFileSync(workerPath, readFileSync(workerPath, 'utf8').replace(
      'export BRIEF_PIPELINE_CONTRACT="pull-data-tools-final-ack-v2"',
      'export BRIEF_PIPELINE_CONTRACT="legacy-v0"'
    ));
    gitFixture(fixture, ['add', '--', 'scripts/brief-refresh-and-push.sh']);
    gitFixture(fixture, ['commit', '-m', 'stale scheduler worker fixture']);
    gitFixture(fixture, ['push', 'origin', 'main']);
    const staleHead = gitFixture(fixture, ['rev-parse', 'HEAD']);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-stale-worker.lock');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog
      }
    });

    assert.equal(result.status, 1, `stale worker unexpectedly executed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /pulled worker does not satisfy pull-data-tools-final-ack-v2/);
    assert.equal(existsSync(fixture.boundaryLog), false, 'no data or author boundary executed');
    gitFixture(fixture, ['fetch', 'origin']);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), staleHead, 'scheduler did not mutate stale origin');
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released after stale-worker refusal');
  });

  test('scheduled launcher reports a rejected final push as a failed run', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const hookPath = resolve(fixture.remoteRoot, 'hooks', 'pre-receive');
    writeFileSync(hookPath, '#!/usr/bin/env bash\nexit 1\n');
    chmodSync(hookPath, 0o755);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-push-failure.lock');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_NARRATIVE_MODE: fixture.narrativeMode,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 1, `rejected push was not propagated\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /push still failing — commit left local for the next run to push/);
    assert.match(result.stdout, /publisher finished with exit=1/);
    gitFixture(fixture, ['fetch', 'origin']);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), fixture.initialHead, 'rejected final commit never reached origin');
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released after push failure');
  });

  test('staged owned publication path refuses without changing its index entry', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const configPath = resolve(fixture.repoRoot, 'market-brief.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    config.fixtureOwnedDirt = true;
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    gitFixture(fixture, ['add', '--', 'market-brief.config.json']);
    const indexBefore = gitFixture(fixture, ['ls-files', '-s', '--', 'market-brief.config.json']);

    const result = runBriefRefreshFixture(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /refusing: wrapper-owned publication paths are dirty/);
    assert.equal(gitFixture(fixture, ['ls-files', '-s', '--', 'market-brief.config.json']), indexBefore);
    assert.equal(gitFixture(fixture, ['rev-parse', 'HEAD']), fixture.initialHead);
    assert.equal(existsSync(fixture.boundaryLog), false);
  });

  test('untracked owned data path refuses before every external boundary', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const untrackedPath = resolve(fixture.repoRoot, 'data/owned-untracked.json');
    const untrackedBytes = Buffer.from('{"owned":"dirty"}\n');
    writeFileSync(untrackedPath, untrackedBytes);

    const result = runBriefRefreshFixture(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /refusing: wrapper-owned publication paths are dirty/);
    assert.ok(readFileSync(untrackedPath).equals(untrackedBytes));
    assert.equal(gitFixture(fixture, ['rev-parse', 'HEAD']), fixture.initialHead);
    assert.equal(existsSync(fixture.boundaryLog), false);
  });

  test('invalid clean baseline refuses before every external boundary', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const snapshotPath = resolve(fixture.repoRoot, 'market-brief.snapshot.json');
    const invalidSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    invalidSnapshot.nextSessionDate = fixture.candidateDate;
    writeFileSync(snapshotPath, JSON.stringify(invalidSnapshot, null, 2) + '\n');
    gitFixture(fixture, ['add', '--', 'market-brief.snapshot.json']);
    gitFixture(fixture, ['commit', '-m', 'invalid clean baseline']);
    gitFixture(fixture, ['push', 'origin', 'main']);
    const invalidHead = gitFixture(fixture, ['rev-parse', 'HEAD']);

    const result = runBriefRefreshFixture(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /refusing: published snapshot\/payload baseline is invalid/);
    assert.equal(gitFixture(fixture, ['rev-parse', 'HEAD']), invalidHead);
    assert.equal(existsSync(fixture.boundaryLog), false);
  });

  test('invalid brief baseline still publishes validated ticker cache when narrative cannot advance', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const snapshotPath = resolve(fixture.repoRoot, 'market-brief.snapshot.json');
    const invalidSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    invalidSnapshot.nextSessionDate = fixture.candidateDate;
    writeFileSync(snapshotPath, JSON.stringify(invalidSnapshot, null, 2) + '\n');
    gitFixture(fixture, ['add', '--', 'market-brief.snapshot.json']);
    gitFixture(fixture, ['commit', '-m', 'invalid baseline before cache refresh']);
    gitFixture(fixture, ['push', 'origin', 'main']);
    const invalidHead = gitFixture(fixture, ['rev-parse', 'HEAD']);
    const invalidSnapshotBytes = readFileSync(snapshotPath);
    const payloadBytes = readFileSync(resolve(fixture.repoRoot, 'market-brief.payload.json'));

    const result = runBriefRefreshFixture(fixture, {
      BRIEF_REPAIR_INVALID_BASELINE: '1',
      BRIEF_SKIP_NARRATIVE: '1'
    });
    const publication = readPublicationState(fixture);

    assert.equal(result.status, 0, `cache publication failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /selected transaction=raw-data-only; cache validation passed; published brief pair left unchanged/);
    assert.match(result.stdout, /committed: market-data: cache refresh/);
    assert.ok(publication.snapshotBytes.equals(invalidSnapshotBytes));
    assert.ok(publication.payloadBytes.equals(payloadBytes));
    assert.deepEqual(publication.lastCommitPaths, ['data/raw-refresh.json', 'market-brief.scorecard.json', 'market-brief.snapshot.page.json']);
    assert.notEqual(publication.head, invalidHead);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), publication.head);
  });

  test('explicit repair mode replaces an invalid baseline only with a final-valid matching pair', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const snapshotPath = resolve(fixture.repoRoot, 'market-brief.snapshot.json');
    const invalidSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    invalidSnapshot.nextSessionDate = fixture.candidateDate;
    writeFileSync(snapshotPath, JSON.stringify(invalidSnapshot, null, 2) + '\n');
    gitFixture(fixture, ['add', '--', 'market-brief.snapshot.json']);
    gitFixture(fixture, ['commit', '-m', 'invalid baseline requiring explicit repair']);
    gitFixture(fixture, ['push', 'origin', 'main']);

    const result = runBriefRefreshFixture(fixture, { BRIEF_REPAIR_INVALID_BASELINE: '1' });
    const publication = readPublicationState(fixture);
    const validator = runFixtureValidator(fixture);

    assert.equal(result.status, 0, `repair failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /explicit repair mode: invalid baseline may be replaced only by a final-valid matching pair/);
    assert.match(result.stdout, /selected transaction=matching-pair/);
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
    assert.equal(validator.status, 0, validator.stderr);
  });

  test('scheduled launcher automatically repairs an invalid baseline through a final-valid pair', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const snapshotPath = resolve(fixture.repoRoot, 'market-brief.snapshot.json');
    const invalidSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    invalidSnapshot.nextSessionDate = fixture.candidateDate;
    writeFileSync(snapshotPath, JSON.stringify(invalidSnapshot, null, 2) + '\n');
    gitFixture(fixture, ['add', '--', 'market-brief.snapshot.json']);
    gitFixture(fixture, ['commit', '-m', 'invalid scheduled baseline']);
    gitFixture(fixture, ['push', 'origin', 'main']);
    const invalidHead = gitFixture(fixture, ['rev-parse', 'HEAD']);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-repair.lock');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_NARRATIVE_MODE: fixture.narrativeMode,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `scheduled repair failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, repairPolicyPattern());
    assert.match(result.stdout, /explicit repair mode: invalid baseline may be replaced only by a final-valid matching pair/);
    assert.match(result.stdout, /selected transaction=matching-pair/);
    gitFixture(fixture, ['fetch', 'origin']);
    assert.notEqual(gitFixture(fixture, ['rev-parse', 'origin/main']), invalidHead);
    assert.equal(existsSync(lockDir), false);
  });

  test('unrelated staged and unstaged dirt remains byte and index identical', (context) => {
    const fixture = createBriefRefreshFixture({ candidateDate: '2026-07-15' });
    context.after(() => fixture.cleanup());
    const unrelatedPath = resolve(fixture.repoRoot, 'unrelated.txt');
    const untrackedPath = resolve(fixture.repoRoot, 'unrelated-untracked.txt');
    writeFileSync(unrelatedPath, 'unrelated staged\n');
    gitFixture(fixture, ['add', '--', 'unrelated.txt']);
    writeFileSync(unrelatedPath, 'unrelated worktree\n');
    writeFileSync(untrackedPath, 'unrelated untracked\n');
    const before = {
      bytes: readFileSync(unrelatedPath),
      untrackedBytes: readFileSync(untrackedPath),
      index: gitFixture(fixture, ['ls-files', '-s', '--', 'unrelated.txt']),
      status: gitFixture(fixture, ['status', '--porcelain=v1', '--', 'unrelated.txt', 'unrelated-untracked.txt'])
    };

    const result = runBriefRefreshFixture(fixture);
    assert.equal(result.status, 0);
    assert.ok(readFileSync(unrelatedPath).equals(before.bytes));
    assert.ok(readFileSync(untrackedPath).equals(before.untrackedBytes));
    assert.equal(gitFixture(fixture, ['ls-files', '-s', '--', 'unrelated.txt']), before.index);
    assert.equal(gitFixture(fixture, ['status', '--porcelain=v1', '--', 'unrelated.txt', 'unrelated-untracked.txt']), before.status);
  });

  test('forced final validation failure restores every owned baseline byte and index path', (context) => {
    const fixture = createBriefRefreshFixture({ validatorMode: 'fail-final', narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const baselineData = readFileSync(resolve(fixture.repoRoot, 'data/baseline.json'));

    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /selected publication pair failed final validation/, `unexpected failure phase\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.ok(publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']));
    assert.ok(publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']));
    assert.ok(publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']));
    assert.ok(publication.configBytes.equals(fixture.baseline['market-brief.config.json']));
    assert.ok(readFileSync(resolve(fixture.repoRoot, 'data/baseline.json')).equals(baselineData));
    assert.equal(existsSync(resolve(fixture.repoRoot, 'data/raw-refresh.json')), false);
    assert.equal(publication.staged, '');
    assert.equal(publication.status, '');
    assert.equal(publication.head, fixture.initialHead);
  });
}