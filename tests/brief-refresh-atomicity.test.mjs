import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  createBriefRefreshFixture,
  gitFixture,
  readPublicationState,
  runBriefRefreshFixture,
  runFixtureValidator
} from './brief-refresh-atomicity.support.mjs';

if (process.env.NODE_TEST_CONTEXT) {
  const { default: test } = await import('node:test');

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
    assert.deepEqual(new Set(publication.lastCommitPaths), new Set(['brief-history.jsonl', 'data/raw-refresh.json', 'market-brief.snapshot.json']));
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
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `scheduler failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /publisher checkout ready; developer worktree remains untouched/);
    assert.match(result.stdout, /narrative policy: 1 attempt\(s\), 1800s each/);
    assert.match(result.stdout, /lane policy: 2 concurrent, 2 attempt\(s\) each, 60s post-write exit grace/);
    assert.match(result.stdout, /invalid-baseline repair: 1 \(final validation remains mandatory\)/);
    assert.doesNotMatch(result.stdout, /\[fixture-source-worker\] local worker selected/, 'dirty local worker must not execute');
    assert.doesNotMatch(result.stdout, /\[fixture-source-validator\] local validator selected/, 'dirty local validator must not execute');
    assert.match(result.stdout, /pulling latest origin\/main before tool updates/);
    assert.doesNotMatch(result.stdout, /does not satisfy pull-data-tools-final-v1/);
    assert.match(result.stdout, /tool brief barrier passed/);
    assert.deepEqual(JSON.parse(readFileSync(fixture.copilotAuditFile, 'utf8')), {
      attempt: 1,
      cleanConfigObserved: true,
      toolBundleCount: 22
    }, 'the final-author lane consumes all 22 prepared source-tool outcomes');
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
    assert.notEqual(gitFixture(fixture, ['rev-parse', 'origin/main']), fixture.initialHead, 'isolated publisher advances origin/main');
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released');
  });

  test('scheduled launcher refuses incomplete current-window data before tool and final briefs', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-incomplete.lock');

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
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released after refusal');
  });

  test('scheduled launcher refuses a stale pulled worker before tool updates', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const workerPath = resolve(fixture.repoRoot, 'scripts/brief-refresh-and-push.sh');
    writeFileSync(workerPath, readFileSync(workerPath, 'utf8').replace(
      'export BRIEF_PIPELINE_CONTRACT="pull-data-tools-final-v1"',
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
    assert.match(result.stdout, /pulled worker does not satisfy pull-data-tools-final-v1/);
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
    assert.deepEqual(publication.lastCommitPaths, ['data/raw-refresh.json']);
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
    assert.match(result.stdout, /invalid-baseline repair: 1 \(final validation remains mandatory\)/);
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