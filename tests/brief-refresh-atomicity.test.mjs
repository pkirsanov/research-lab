import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import {
  createBriefRefreshFixture,
  FIXTURE_ATTENTION_CANDIDATE,
  FIXTURE_PUBLICATION_SCRIPTS,
  gitFixture,
  readPublicationState,
  resolveModuleClosure,
  runBriefRefreshFixture,
  runFixtureValidator
} from './brief-refresh-atomicity.support.mjs';
import {
  buildResearchAgendaTransaction,
  composeResearchAgendaCandidate,
  computeResearchAgendaOutputs,
  promoteResearchAgendaTransaction,
  RESEARCH_AGENDA_CONTRACTS,
  validateResearchSituation
} from '../scripts/research-agenda-generation.mjs';
import { prepareResearchAgendaRuntime } from '../scripts/research-agenda-refresh.mjs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const RLAGENDA = require('../rlagenda.js');

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
  return new RegExp(`lane policy: ${schedulerDefault('BRIEF_LANE_CONCURRENCY')} concurrent, ${schedulerDefault('BRIEF_LANE_ATTEMPTS')} attempt\\(s\\) each, ${schedulerDefault('BRIEF_LANE_TRANSIENT_BACKOFF_SECONDS')}s transient-service backoff, ${schedulerDefault('BRIEF_LANE_EXIT_GRACE')}s post-write exit grace`);
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

/* The names brief-narrative-parallel.mjs imports from './brief-refresh.mjs', read from the
   statement itself. A restated list here would go stale the moment the import changes, which is
   the whole failure mode under guard. */
function namesImportedFromBriefRefresh() {
  const source = readFileSync(new URL('../scripts/brief-narrative-parallel.mjs', import.meta.url), 'utf8');
  const statement = source.match(/^[ \t]*import\s*\{([^}]*)\}\s*from\s*['"]\.\/brief-refresh\.mjs['"]/m);
  if (!statement) return [];
  return statement[1].split(',')
    .map((clause) => clause.trim().split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
}

/** Module-namespace keys of the fixture's scripts/brief-refresh.mjs, resolved the way an importer would. */
function fixtureBriefRefreshExports(fixture) {
  const moduleUrl = pathToFileURL(resolve(fixture.repoRoot, 'scripts/brief-refresh.mjs')).href;
  const probe = spawnSync(process.execPath, ['--input-type=module', '-e',
    `import * as m from ${JSON.stringify(moduleUrl)};\nprocess.stdout.write(JSON.stringify(Object.keys(m)));`
  ], { cwd: fixture.repoRoot, encoding: 'utf8' });
  assert.equal(probe.status, 0, `fixture scripts/brief-refresh.mjs is not importable\nstdout:\n${probe.stdout}\nstderr:\n${probe.stderr}`);
  return JSON.parse(probe.stdout);
}

if (process.env.NODE_TEST_CONTEXT) {
  const { default: test } = await import('node:test');

  /* Three fixture gaps have now shipped green in the same shape: a missing
     company-fundamentals.config.json, a missing rlcockpit.js, and a scripts/brief-refresh.mjs stub
     that modelled only the CLI half of a module whose LIBRARY half brief-narrative-parallel.mjs
     imports. None of them announced themselves as a fixture gap — the last one surfaced as
     "narrative attempt failed", the wrapper fell back to transaction=raw-data-only, and the suite
     went on asserting a publication branch the real path never takes. These two guards make the
     gap fail as a gap. */
  test('Guard: the fixture brief-refresh.mjs provides every export brief-narrative-parallel.mjs imports from it', (context) => {
    const required = namesImportedFromBriefRefresh();
    // Non-vacuity: if the import statement stops being readable there is nothing left to guard.
    assert.ok(required.length > 0, 'brief-narrative-parallel.mjs must import named bindings from ./brief-refresh.mjs');

    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const exported = new Set(fixtureBriefRefreshExports(fixture));

    for (const name of required) {
      assert.ok(exported.has(name), `fixture scripts/brief-refresh.mjs does not export ${name}, so brief-narrative-parallel.mjs cannot link against it`);
    }
    /* Adversarial: the membership check must be able to fail. A name no module exports proves the
       assertion above is reading a real namespace rather than passing on an empty or permissive set. */
    assert.equal(exported.has('__fixtureClosureGuardCanaryExport'), false,
      'the export check passes vacuously — it accepted a name the real module never exports');
  });

  test('Guard: the fixture contains the whole relative-import closure of every publication script', (context) => {
    const fixture = createBriefRefreshFixture({ agendaAssets: true });
    context.after(() => fixture.cleanup());

    const closure = new Set(FIXTURE_PUBLICATION_SCRIPTS.flatMap((entry) => resolveModuleClosure(entry)));
    assert.ok(closure.size > FIXTURE_PUBLICATION_SCRIPTS.length,
      'the closure must reach beyond the declared entry points, otherwise nothing transitive is being checked');
    for (const modulePath of closure) {
      assert.ok(existsSync(resolve(fixture.repoRoot, modulePath)),
        `${modulePath} is reachable from a publication script but is absent from the fixture`);
    }
    // The real brief-refresh.mjs travels under its *.real.mjs name so the stub can re-export it.
    for (const modulePath of resolveModuleClosure('scripts/brief-refresh.mjs').slice(1)) {
      assert.ok(existsSync(resolve(fixture.repoRoot, modulePath)),
        `${modulePath} is reachable from brief-refresh.mjs but is absent from the fixture`);
    }
    assert.ok(existsSync(resolve(fixture.repoRoot, 'scripts/brief-refresh.real.mjs')));

    /* Adversarial, twice: the presence check must be able to fail on a module the fixture does not
       carry, and the closure resolver must REFUSE a dangling specifier rather than skip it —
       silent skipping is precisely what let the three gaps above land green. */
    assert.equal(existsSync(resolve(fixture.repoRoot, 'scripts/__fixture-closure-guard-canary.mjs')), false,
      'the presence check passes vacuously — it accepted a module the fixture never copied');
    assert.throws(() => resolveModuleClosure('scripts/__fixture-closure-guard-canary.mjs'), /does not exist/);
  });

  /* That closure is only as complete as the specifier scan behind it, and createRequire() is this repo's
     normal way to load a UMD module from an .mjs script. A scan that followed only static `import` missed
     the whole class: the fixture shipped without rlclaims.js and rlattentiongate.js, both died
     MODULE_NOT_FOUND inside the transaction, the wrapper fell back to raw-data-only and still exited 0,
     and the payload silently kept its baseline date. The call sites are re-scanned below with an
     INDEPENDENT pattern on purpose: reusing the resolver's own regex would make this guard blind to
     exactly the regex regression it exists to catch. */
  const CREATE_REQUIRE_SITES = [
    'scripts/recommendation-claim-mint.mjs',
    'scripts/build-attention-items.mjs',
    'scripts/brief-narrative-parallel.mjs',
    'scripts/validate-brief-payload.mjs'
  ];
  const REQUIRE_CALL = '(?:createRequire\\s*\\([^()]*\\)|require)\\s*\\(';

  function createRequireTargets(repoRoot) {
    const targets = [];
    for (const site of CREATE_REQUIRE_SITES) {
      const source = readFileSync(new URL('../' + site, import.meta.url), 'utf8');
      for (const [, specifier] of source.matchAll(new RegExp(`${REQUIRE_CALL}\\s*['"](\\.{1,2}/[^'"]+)['"]\\s*\\)`, 'g'))) {
        targets.push([resolve(repoRoot, dirname(site), specifier), `${site} requires ${specifier}`]);
      }
      for (const [, name] of source.matchAll(new RegExp(`${REQUIRE_CALL}\\s*resolve\\s*\\(\\s*ROOT\\s*,\\s*['"]([^'"]+)['"]\\s*\\)\\s*\\)`, 'g'))) {
        targets.push([resolve(repoRoot, name), `${site} requires resolve(ROOT, '${name}')`]);
      }
    }
    return targets;
  }

  test('Guard: the fixture carries every module reachable only through a createRequire() specifier', (context) => {
    const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());

    const targets = createRequireTargets(fixture.repoRoot);
    // Non-vacuity: if the publication scripts stop reaching for UMD modules there is nothing left to guard.
    assert.ok(targets.length > 0, 'no createRequire() specifier was readable from the publication scripts');
    for (const [absolutePath, description] of targets) {
      assert.ok(existsSync(absolutePath), `${description}, but the fixture does not carry it`);
    }
    /* These two are reachable ONLY this way, so they are what a static-import scan cannot see; naming
       them keeps the guard anchored to the modules whose absence produced the silent green run. */
    for (const umd of ['rlclaims.js', 'rlattentiongate.js']) {
      assert.ok(existsSync(resolve(fixture.repoRoot, umd)),
        `${umd} is require()d on the publication path but is absent from the fixture`);
    }

    /* Adversarial: the new detection must be able to FAIL, and must fail by REFUSING rather than
       skipping — silent skipping is precisely what let this class ship green. The third canary is the
       other direction: a require named only in a comment or a string must not be followed. */
    const canaries = [
      ['tests/__require-closure-dangling-canary.mjs',
        "const missing = require('./__require-closure-canary-target.js');\n",
        /__require-closure-canary-target\.js does not exist but is imported by tests\/__require-closure-dangling-canary\.mjs/],
      ['tests/__require-closure-escape-canary.mjs',
        "const outside = require('../../__outside-the-repository.js');\n",
        /resolves outside the repository/]
    ];
    const precisionCanary = 'tests/__require-closure-precision-canary.mjs';
    context.after(() => {
      for (const [path] of canaries) rmSync(resolve(repoRoot, path), { force: true });
      rmSync(resolve(repoRoot, precisionCanary), { force: true });
    });

    for (const [path, body, expected] of canaries) {
      writeFileSync(resolve(repoRoot, path), body);
      assert.throws(() => resolveModuleClosure(path), expected,
        `${path} must make the closure resolver refuse rather than skip its require() target`);
    }
    writeFileSync(resolve(repoRoot, precisionCanary),
      "// const legacy = require('./__commented-out-target.js');\nconst probe = \"require('./__quoted-target.js')\";\nexport default probe;\n");
    assert.deepEqual(resolveModuleClosure(precisionCanary), [precisionCanary],
      'a require named only in a comment or a string literal was followed as if it were a real dependency');
  });

  test('Regression: agenda publication writes immutable files before ledger and moves current pointer last', (context) => {
    const root = mkdtempSync(resolve(tmpdir(), 'research-agenda-atomicity-'));
    context.after(() => rmSync(root, { recursive: true, force: true }));
    const registry = JSON.parse(readFileSync(new URL('../research-agenda.json', import.meta.url), 'utf8'));
    const topic = registry.topics[0];
    const definition = JSON.parse(readFileSync(new URL('../' + topic.definitionRef, import.meta.url), 'utf8'));
    const evidence = JSON.parse(readFileSync(new URL('../tests/fixtures/research-agenda/valid-evidence-record.json', import.meta.url), 'utf8'));
    const modelFixture = JSON.parse(readFileSync(new URL('../tests/fixtures/research-agenda/reversal-ui.json', import.meta.url), 'utf8'));
    const calibration = JSON.parse(readFileSync(new URL('../' + definition.calibrationRef, import.meta.url), 'utf8'));
    const barIds = [...new Set([
      ...definition.transmissionModels.map((model) => model.barId),
      ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
    ])];
    const currentBars = Object.fromEntries(barIds.map((barId) => [
      barId,
      JSON.parse(readFileSync(new URL(`../data/bars/${barId}.json`, import.meta.url), 'utf8'))
    ]));
    const historicalPath = 'research/agenda/dossiers/geopolitical-supply-shock/historical-2026-08-10-v1.json';
    const historical = JSON.parse(readFileSync(new URL('../' + historicalPath, import.meta.url), 'utf8'));
    const generation = RLAGENDA.deriveGenerationId({
      snapshotDigest: 'sha256:' + '6'.repeat(64),
      registryDigest: RLAGENDA.agendaDigest(registry),
      briefWindow: { start: '2026-08-13T07:30:00.000Z', end: '2026-08-13T12:00:00.000Z' },
      generationCutoff: '2026-08-13T12:00:00.000Z'
    });
    const oneTopicRegistry = { ...registry, topics: [topic] };
    const plan = {
      ok: true,
      refusals: [],
      selected: [{ topicId: topic.topicId, mode: topic.reviewPolicy.mode, reason: 'mode-required', sectionIds: definition.analyticalSections.map((section) => section.sectionId) }],
      classifications: [{ topicId: topic.topicId, lifecycleState: 'active', mode: topic.reviewPolicy.mode, status: 'selected', reason: 'mode-required' }]
    };
    const finding = {
      findingId: 'atomicity-finding',
      observedAt: evidence.observedAt,
      claim: evidence.claim,
      source: evidence.source,
      statedConfidence: evidence.confidence,
      provenanceClass: evidence.provenanceClass,
      evidenceRole: evidence.evidenceRole,
      causalPath: evidence.causalPath,
      refutedBy: evidence.refutedBy,
      limitations: ['Atomicity fixture.']
    };
    const situation = {
      contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
      generationId: generation.id,
      topicId: topic.topicId,
      authoredAt: '2026-08-13T12:00:00.000Z',
      completePass: true,
      evidenceRecords: [evidence],
      sectionInterpretations: definition.analyticalSections.map((section) => ({ sectionId: section.sectionId, status: 'changed', interpretation: 'Current fixture interpretation.', gaps: [] })),
      findings: [finding],
      sourceLedger: [evidence.source],
      newEvidenceIds: [evidence.evidenceId],
      modelInputs: {
        chokepointState: modelFixture.chokepointState,
        inventoryGapByChannel: modelFixture.inventoryGapByChannel,
        levers: modelFixture.levers
      }
    };
    const deterministicOutputs = computeResearchAgendaOutputs({
      definition,
      calibration,
      situation,
      currentBars,
      generationCutoff: '2026-08-13T12:00:00.000Z',
      declaredQuestion: topic.declaredQuestion,
      predecessorOutput: null
    });
    assert.equal(deterministicOutputs.ok, true, JSON.stringify(deterministicOutputs));
    const candidate = composeResearchAgendaCandidate({
      registry: oneTopicRegistry,
      plan,
      definitionsByTopicId: { [topic.topicId]: definition },
      generationId: generation.id,
      generationCutoff: '2026-08-13T12:00:00.000Z',
      situationsByTopicId: { [topic.topicId]: situation },
      deterministicOutputsByTopicId: { [topic.topicId]: deterministicOutputs.value },
      priorDossiersByTopicId: { [topic.topicId]: historical }
    });
    assert.equal(candidate.ok, true, JSON.stringify(candidate));
    const baselineHistory = readFileSync(new URL('../research/agenda/history.jsonl', import.meta.url), 'utf8');
    const baselineCurrent = readFileSync(new URL('../research/agenda/current.json', import.meta.url), 'utf8');
    const baselinePayload = readFileSync(new URL('../market-brief.payload.json', import.meta.url), 'utf8');
    const pageInputs = {
      config: JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8')),
      snapshot: JSON.parse(readFileSync(new URL('../market-brief.snapshot.json', import.meta.url), 'utf8')),
      tools: JSON.parse(readFileSync(new URL('../tools.json', import.meta.url), 'utf8'))
    };
    const transactionInput = {
      candidate: candidate.value,
      payload: JSON.parse(baselinePayload),
      historyText: baselineHistory,
      existingRecordsByPath: { [historicalPath]: historical },
      pageInputs
    };
    for (const invalidRegistry of [undefined, []]) {
      const invalidTransaction = buildResearchAgendaTransaction({ ...transactionInput, registry: invalidRegistry });
      assert.deepEqual(invalidTransaction, {
        ok: false,
        error: { code: 'E019-AGENDA-TRANSACTION', reason: 'transaction-input-invalid', field: 'registry', topicId: null }
      });
      assert.equal(readFileSync(new URL('../research/agenda/history.jsonl', import.meta.url), 'utf8'), baselineHistory);
      assert.equal(readFileSync(new URL('../research/agenda/current.json', import.meta.url), 'utf8'), baselineCurrent);
    }
    const transaction = buildResearchAgendaTransaction({ ...transactionInput, registry: oneTopicRegistry });
    assert.equal(transaction.ok, true, JSON.stringify(transaction));
    assert.equal(transaction.value.writeOrder.at(-1), 'research/agenda/current.json');
    const historyIndex = transaction.value.writeOrder.indexOf('research/agenda/history.jsonl');
    const payloadIndex = transaction.value.writeOrder.indexOf('market-brief.payload.json');
    assert.ok(Object.keys(transaction.value.immutableFiles).every((path) => transaction.value.writeOrder.indexOf(path) < historyIndex));
    assert.ok(historyIndex < payloadIndex && payloadIndex < transaction.value.writeOrder.length - 1);

    const writes = [];
    const full = (relativePath) => resolve(root, relativePath);
    cpSync(new URL('../research/agenda', import.meta.url), resolve(root, 'research/agenda'), { recursive: true });
    const io = {
      exists: (relativePath) => existsSync(full(relativePath)),
      read: (relativePath) => readFileSync(full(relativePath), 'utf8'),
      create: (relativePath, bytes) => { mkdirSync(resolve(full(relativePath), '..'), { recursive: true }); writeFileSync(full(relativePath), bytes, { flag: 'wx' }); },
      rename: (sourcePath, targetPath) => renameSync(full(sourcePath), full(targetPath)),
      remove: (relativePath) => rmSync(full(relativePath), { recursive: true, force: true }),
      afterStep: (step) => writes.push(step.path)
    };
    for (const [relativePath, bytes] of [[historicalPath, JSON.stringify(historical, null, 2) + '\n'], ['research/agenda/history.jsonl', baselineHistory], ['research/agenda/current.json', baselineCurrent], ['market-brief.payload.json', baselinePayload]]) {
      mkdirSync(resolve(full(relativePath), '..'), { recursive: true });
      writeFileSync(full(relativePath), bytes);
    }
    const promoted = promoteResearchAgendaTransaction(transaction.value, io);
    assert.equal(promoted.ok, true, JSON.stringify(promoted));
    assert.deepEqual(writes, transaction.value.writeOrder);
    assert.equal(writes.at(-1), 'research/agenda/current.json');
    const diskCurrent = JSON.parse(io.read('research/agenda/current.json'));
    const diskPayload = JSON.parse(io.read('market-brief.payload.json'));
    assert.equal(RLAGENDA.validateCurrentPointer(diskCurrent, transaction.value.recordsByPath).ok, true);
    assert.equal(diskPayload.researchAgenda.generationId, generation.id);

    const rollbackRoot = mkdtempSync(resolve(tmpdir(), 'research-agenda-rollback-'));
    context.after(() => rmSync(rollbackRoot, { recursive: true, force: true }));
    const rollbackFull = (relativePath) => resolve(rollbackRoot, relativePath);
    cpSync(new URL('../research/agenda', import.meta.url), resolve(rollbackRoot, 'research/agenda'), { recursive: true });
    const rollbackIo = {
      exists: (relativePath) => existsSync(rollbackFull(relativePath)),
      read: (relativePath) => readFileSync(rollbackFull(relativePath), 'utf8'),
      create: (relativePath, bytes) => { mkdirSync(resolve(rollbackFull(relativePath), '..'), { recursive: true }); writeFileSync(rollbackFull(relativePath), bytes, { flag: 'wx' }); },
      rename: (sourcePath, targetPath) => renameSync(rollbackFull(sourcePath), rollbackFull(targetPath)),
      remove: (relativePath) => rmSync(rollbackFull(relativePath), { recursive: true, force: true }),
      afterStep: (step) => {
        if (step.kind === 'mutable-rename' && step.path === 'market-brief.payload.json') {
          throw new Error('forced pre-pointer failure');
        }
      }
    };
    for (const [relativePath, bytes] of [['research/agenda/history.jsonl', baselineHistory], ['research/agenda/current.json', baselineCurrent], ['market-brief.payload.json', baselinePayload]]) {
      mkdirSync(resolve(rollbackFull(relativePath), '..'), { recursive: true });
      writeFileSync(rollbackFull(relativePath), bytes);
    }
    const refused = promoteResearchAgendaTransaction(transaction.value, rollbackIo);
    assert.equal(refused.ok, false);
    assert.equal(rollbackIo.read('research/agenda/history.jsonl'), baselineHistory);
    assert.equal(rollbackIo.read('research/agenda/current.json'), baselineCurrent);
    assert.equal(rollbackIo.read('market-brief.payload.json'), baselinePayload);
    for (const path of Object.keys(transaction.value.immutableFiles)) assert.equal(rollbackIo.exists(path), false, `${path} removed on rollback`);
  });

  test('Regression: whole agenda graph rollback restores every mutable baseline and moves current pointer only after all candidates validate', (context) => {
    const fixture = createBriefRefreshFixture({
      narrativeMode: 'success',
      agendaAssets: true,
      baselineDate: '2026-08-13',
      candidateDate: '2026-08-14'
    });
    context.after(() => fixture.cleanup());
    const readJson = (relativePath) => JSON.parse(readFileSync(resolve(fixture.repoRoot, relativePath), 'utf8'));
    const snapshot = readJson('market-brief.snapshot.json');
    const config = readJson('market-brief.config.json');
    const payload = readJson('market-brief.payload.json');
    const tools = readJson('tools.json');
    const preparation = prepareResearchAgendaRuntime({ root: fixture.repoRoot, snapshot, config, payload });
    const selected = preparation.plan.selected[0];
    assert.ok(selected, 'TP-04-15 requires at least one selected research topic');
    const topic = preparation.registry.topics.find((row) => row.topicId === selected.topicId);
    assert.ok(topic, 'TP-04-15 requires the selected topic contract');
    const definition = preparation.definitionsByTopicId[selected.topicId];
    const evidence = JSON.parse(readFileSync(new URL('../tests/fixtures/research-agenda/valid-evidence-record.json', import.meta.url), 'utf8'));
    evidence.observedAt = new Date(Date.parse(preparation.cutoffAt) - 2 * 3600000).toISOString();
    evidence.availableAt = new Date(Date.parse(preparation.cutoffAt) - 1.5 * 3600000).toISOString();
    const modelFixture = JSON.parse(readFileSync(new URL('../tests/fixtures/research-agenda/reversal-ui.json', import.meta.url), 'utf8'));
    const calibration = JSON.parse(readFileSync(new URL('../' + definition.calibrationRef, import.meta.url), 'utf8'));
    const barIds = [...new Set([
      ...definition.transmissionModels.map((model) => model.barId),
      ...definition.proxyDefinitions.map((proxy) => proxy.ticker)
    ])];
    const currentBars = Object.fromEntries(barIds.map((barId) => [
      barId,
      JSON.parse(readFileSync(new URL(`../data/bars/${barId}.json`, import.meta.url), 'utf8'))
    ]));
    const situation = {
      contractVersion: RESEARCH_AGENDA_CONTRACTS.situation,
      generationId: preparation.generationId,
      topicId: selected.topicId,
      authoredAt: preparation.cutoffAt,
      completePass: true,
      evidenceRecords: [evidence],
      sectionInterpretations: definition.analyticalSections.map((section) => ({
        sectionId: section.sectionId,
        status: 'changed',
        interpretation: 'Fresh TP-04-15 transaction evidence changes this section.',
        gaps: []
      })),
      findings: [{
        findingId: 'tp-04-15-fresh-finding',
        observedAt: evidence.observedAt,
        claim: evidence.claim,
        publicSubjects: [
          { kind: 'channel', value: topic.scopeBoundary.channels[0] },
          { kind: 'public-ticker', value: definition.proxyDefinitions[0].ticker }
        ],
        horizon: 'swing',
        source: { sourceIds: [evidence.source.sourceId] },
        statedConfidence: evidence.confidence,
        provenanceClass: evidence.provenanceClass,
        evidenceRole: evidence.evidenceRole,
        evidenceRefs: [evidence.evidenceId],
        triggerRefs: [definition.triggers[0].triggerId],
        invalidationRefs: [definition.invalidations[0].invalidationId],
        causalPath: evidence.causalPath,
        refutedBy: evidence.refutedBy,
        limitations: ['Atomicity fault-matrix fixture.']
      }],
      sourceLedger: [evidence.source],
      newEvidenceIds: [evidence.evidenceId],
      modelInputs: {
        chokepointState: modelFixture.chokepointState,
        inventoryGapByChannel: modelFixture.inventoryGapByChannel,
        levers: modelFixture.levers
      }
    };
    const missingPublicSubjectsSituation = structuredClone(situation);
    delete missingPublicSubjectsSituation.findings[0].publicSubjects;
    const missingPublicSubjectsRefusal = validateResearchSituation(missingPublicSubjectsSituation, {
      generationId: preparation.generationId,
      topic,
      definition
    });
    assert.equal(missingPublicSubjectsRefusal.ok, false, 'TP-04-15 missing publicSubjects refuses before the valid fixture proceeds');
    assert.deepEqual(missingPublicSubjectsRefusal.error, {
      code: 'RLAGENDA-CONTRACT-MISSING-MEMBER',
      reason: 'finding-shape-invalid',
      field: 'publicSubjects',
      topicId: selected.topicId
    });
    const validatedSituation = validateResearchSituation(situation, {
      generationId: preparation.generationId,
      topic,
      definition
    });
    assert.equal(validatedSituation.ok, true, JSON.stringify(validatedSituation));
    const deterministicOutputs = computeResearchAgendaOutputs({
      definition,
      calibration,
      situation: validatedSituation.value,
      currentBars,
      generationCutoff: preparation.cutoffAt,
      declaredQuestion: topic.declaredQuestion,
      predecessorOutput: null
    });
    assert.equal(deterministicOutputs.ok, true, JSON.stringify(deterministicOutputs));
    const failuresByTopicId = Object.fromEntries(preparation.plan.selected.slice(1)
      .map((row) => [row.topicId, 'tp-04-15-unavailable']));
    const candidate = composeResearchAgendaCandidate({
      registry: preparation.registry,
      plan: preparation.plan,
      definitionsByTopicId: preparation.definitionsByTopicId,
      generationId: preparation.generationId,
      generationCutoff: preparation.cutoffAt,
      situationsByTopicId: { [selected.topicId]: validatedSituation.value },
      failuresByTopicId,
      deterministicOutputsByTopicId: { [selected.topicId]: deterministicOutputs.value },
      priorDossiersByTopicId: preparation.priorDossiersByTopicId
    });
    assert.equal(candidate.ok, true, JSON.stringify(candidate));
    assert.ok(candidate.value.reviews.some((review) => review.topicId === selected.topicId), 'fresh situation produces a review');
    assert.ok(candidate.value.dossiers.some((dossier) => dossier.topicId === selected.topicId), 'fresh situation produces a dossier');
    const transaction = buildResearchAgendaTransaction({
      candidate: candidate.value,
      payload,
      historyText: preparation.historyText,
      registry: preparation.registry,
      existingRecordsByPath: preparation.existingRecordsByPath,
      pageInputs: { config, snapshot, tools }
    });
    assert.equal(transaction.ok, true, JSON.stringify(transaction));

    const designRequiredMutableOrder = [
      'research/agenda/history.jsonl',
      'market-brief.payload.json',
      'market-brief.page.json',
      'market-brief.config.page.json',
      'market-brief.snapshot.page.json',
      'market-brief.tools.page.json',
      'market-brief.experimental.json',
      'research/agenda/current.json'
    ];
    assert.deepEqual(transaction.value.mutableOrder, designRequiredMutableOrder);
    const mutableOrder = [...transaction.value.mutableOrder];
    assert.equal(transaction.value.immutableOrder.some((path) => path.startsWith('research/agenda/generations/')), true,
      'fault inventory includes the generated generation record');
    assert.equal(transaction.value.immutableOrder.some((path) => path.startsWith('research/agenda/reviews/')), true,
      'fault inventory includes at least one generated review');
    assert.equal(transaction.value.immutableOrder.some((path) => path.startsWith('research/agenda/dossiers/')), true,
      'fault inventory includes at least one generated dossier');
    assert.deepEqual(transaction.value.writeOrder, [...transaction.value.immutableOrder, ...mutableOrder]);
    assert.deepEqual(Object.keys(transaction.value.mutableFiles), mutableOrder);
    assert.deepEqual(Object.keys(transaction.value.candidatePaths), mutableOrder);
    assert.equal(transaction.value.pointerLast, mutableOrder.at(-1));
    for (const target of mutableOrder) {
      assert.equal(dirname(transaction.value.candidatePaths[target]), dirname(target), `${target} candidate is on the target filesystem`);
      assert.notEqual(transaction.value.candidatePaths[target], target);
      assert.equal(typeof transaction.value.mutableFiles[target], 'string', `${target} has candidate bytes`);
    }
    const payloadCandidate = JSON.parse(transaction.value.mutableFiles['market-brief.payload.json']);
    const pageCandidate = JSON.parse(transaction.value.mutableFiles['market-brief.page.json']);
    assert.equal(payloadCandidate.researchAgenda.generationId, candidate.value.generationId);
    assert.equal(payloadCandidate.toolReads['research-agenda-lab'].metrics.generationId, candidate.value.generationId);
    assert.deepEqual(pageCandidate.researchAgenda, payloadCandidate.researchAgenda);

    const unrelatedPath = 'tp-04-15-unrelated.txt';
    const unrelatedBytes = Buffer.from('pre-existing unrelated bytes\n');
    const makeRunRoot = () => {
      const root = mkdtempSync(resolve(tmpdir(), 'research-agenda-whole-graph-'));
      context.after(() => rmSync(root, { recursive: true, force: true }));
      cpSync(resolve(fixture.repoRoot, 'research'), resolve(root, 'research'), { recursive: true });
      for (const path of mutableOrder.filter((relativePath) => !relativePath.startsWith('research/'))) {
        if (existsSync(resolve(fixture.repoRoot, path))) {
          mkdirSync(dirname(resolve(root, path)), { recursive: true });
          copyFileSync(resolve(fixture.repoRoot, path), resolve(root, path));
        }
      }
      rmSync(resolve(root, 'market-brief.experimental.json'), { force: true });
      writeFileSync(resolve(root, unrelatedPath), unrelatedBytes);
      return root;
    };
    const baselineAt = (root) => Object.fromEntries(mutableOrder.map((path) => [path, {
      exists: existsSync(resolve(root, path)),
      bytes: existsSync(resolve(root, path)) ? readFileSync(resolve(root, path)) : null
    }]));
    const assertCurrentReachable = (root, bytes, label) => {
      const current = JSON.parse(Buffer.from(bytes).toString('utf8'));
      const refs = [current.generationRef, ...current.topicRefs.flatMap((row) => [row.reviewRef, row.dossierRef])].filter(Boolean);
      for (const ref of refs) assert.equal(existsSync(resolve(root, ref.path)), true, `${label}: ${ref.path}`);
    };
    const assertBaseline = (root, baseline) => {
      for (const path of mutableOrder) {
        assert.equal(existsSync(resolve(root, path)), baseline[path].exists, `${path} existence restored`);
        if (baseline[path].exists) assert.ok(readFileSync(resolve(root, path)).equals(baseline[path].bytes), `${path} exact bytes restored`);
      }
      assertCurrentReachable(root, baseline[transaction.value.pointerLast].bytes, 'old pointer ref remains reachable');
      assert.ok(readFileSync(resolve(root, unrelatedPath)).equals(unrelatedBytes), 'rollback preserves unrelated pre-existing bytes');
    };
    const assertOnlyTransactionFilesRemoved = (baseline, operations) => {
      const allowed = new Set([
        ...transaction.value.immutableOrder,
        ...Object.values(transaction.value.candidatePaths),
        ...Object.values(transaction.value.candidatePaths).map((path) => `${path}.rollback`),
        ...mutableOrder.filter((path) => !baseline[path].exists)
      ]);
      assert.deepEqual(operations.filter((step) => step.kind === 'remove' && !allowed.has(step.path)), [],
        'rollback removes only transaction-created paths');
    };
    const makeIo = (root, fault, operations, baseline, rollbackSabotageTarget = null) => {
      const full = (relativePath) => resolve(root, relativePath);
      return {
        exists: (relativePath) => existsSync(full(relativePath)),
        read: (relativePath) => readFileSync(full(relativePath)),
        create: (relativePath, bytes) => {
          mkdirSync(dirname(full(relativePath)), { recursive: true });
          writeFileSync(full(relativePath), bytes, { flag: 'wx' });
          operations.push({ kind: 'create', path: relativePath });
        },
        rename: (sourcePath, targetPath) => {
          if (targetPath === transaction.value.pointerLast && sourcePath === transaction.value.candidatePaths[targetPath]) {
            assert.ok(readFileSync(full(targetPath)).equals(baseline[targetPath].bytes), 'old current is exact before the final rename');
            assertCurrentReachable(root, baseline[targetPath].bytes, 'old current is reachable before the final rename');
          }
          if (targetPath === rollbackSabotageTarget && sourcePath === `${transaction.value.candidatePaths[targetPath]}.rollback`) {
            rmSync(full(sourcePath), { force: true });
            operations.push({ kind: 'rollback-sabotage', path: targetPath, sourcePath });
            return;
          }
          mkdirSync(dirname(full(targetPath)), { recursive: true });
          renameSync(full(sourcePath), full(targetPath));
          operations.push({ kind: 'rename', path: targetPath, sourcePath });
        },
        remove: (relativePath) => {
          operations.push({ kind: 'remove', path: relativePath });
          rmSync(full(relativePath), { recursive: true, force: true });
        },
        afterStep: (step) => {
          operations.push(step);
          if (fault && step.kind === fault.kind && step.path === fault.path) {
            throw Object.assign(new Error(`injected ${step.kind} failure at ${step.path}`), { code: 'tp-04-15-injected' });
          }
        }
      };
    };
    const faultInventory = [
      ...transaction.value.immutableOrder.map((path) => ({ kind: 'immutable-create', path })),
      ...mutableOrder.map((path) => ({ kind: 'mutable-rename', path }))
    ];
    console.log('[tp04-15] immutableOrder=' + JSON.stringify(transaction.value.immutableOrder));
    console.log('[tp04-15] mutableOrder=' + JSON.stringify(mutableOrder));
    console.log('[tp04-15] faultInventory=' + JSON.stringify(faultInventory));
    console.log('[tp04-15] candidatePaths=' + JSON.stringify(transaction.value.candidatePaths));
    console.log('[tp04-15] renameOrder=' + JSON.stringify(mutableOrder));
    for (const fault of faultInventory) {
      const root = makeRunRoot();
      const baseline = baselineAt(root);
      assert.ok(mutableOrder.some((path) => baseline[path].exists) && mutableOrder.some((path) => !baseline[path].exists),
        'fault matrix includes present and absent mutable baselines');
      const operations = [];
      const refused = promoteResearchAgendaTransaction(transaction.value, makeIo(root, fault, operations, baseline));
      assert.equal(refused.ok, false, `${fault.kind}:${fault.path} is refused`);
      assert.equal(refused.error.reason, 'tp-04-15-injected');
      const actualKind = fault.kind === 'immutable-create' ? 'create' : 'rename';
      assert.equal(operations.some((step) => step.kind === actualKind && step.path === fault.path), true,
        `${fault.kind}:${fault.path} is injected only after the actual filesystem operation`);
      assertBaseline(root, baseline);
      assertOnlyTransactionFilesRemoved(baseline, operations);
      for (const path of transaction.value.immutableOrder) assert.equal(existsSync(resolve(root, path)), false, `${path} transaction create removed`);
      for (const path of Object.values(transaction.value.candidatePaths)) assert.equal(existsSync(resolve(root, path)), false, `${path} private candidate removed`);
    }

    const existingRoot = makeRunRoot();
    const existingBaseline = baselineAt(existingRoot);
    const existingImmutable = transaction.value.immutableOrder[0];
    const sentinel = Buffer.from('pre-existing-immutable\n');
    mkdirSync(dirname(resolve(existingRoot, existingImmutable)), { recursive: true });
    writeFileSync(resolve(existingRoot, existingImmutable), sentinel, { flag: 'wx' });
    const existingOperations = [];
    const existingRefusal = promoteResearchAgendaTransaction(transaction.value,
      makeIo(existingRoot, null, existingOperations, existingBaseline));
    assert.equal(existingRefusal.ok, false);
    assert.equal(existingRefusal.error.reason, 'immutable-overwrite');
    assert.ok(readFileSync(resolve(existingRoot, existingImmutable)).equals(sentinel), 'pre-existing immutable is never removed');
    assertBaseline(existingRoot, existingBaseline);
    assertOnlyTransactionFilesRemoved(existingBaseline, existingOperations);

    for (const [label, mutate] of [
      ['missing candidate inventory', (value) => { delete value.candidatePaths['market-brief.page.json']; }],
      ['unknown candidate inventory', (value) => { value.candidatePaths['unknown-candidate.json'] = '.unknown-candidate.json'; }]
    ]) {
      const invalid = structuredClone(transaction.value);
      mutate(invalid);
      const root = makeRunRoot();
      const baseline = baselineAt(root);
      const operations = [];
      const refused = promoteResearchAgendaTransaction(invalid, makeIo(root, null, operations, baseline));
      assert.equal(refused.ok, false);
      assert.equal(refused.error.reason, 'transaction-inventory-invalid');
      assert.deepEqual(operations, [], `${label} is refused before side effects`);
      assertBaseline(root, baseline);
    }

    const sabotageRoot = makeRunRoot();
    const sabotageBaseline = baselineAt(sabotageRoot);
    const sabotageOperations = [];
    const sabotageTarget = 'market-brief.payload.json';
    const sabotageFault = { kind: 'mutable-rename', path: transaction.value.pointerLast };
    const sabotageRefusal = promoteResearchAgendaTransaction(transaction.value,
      makeIo(sabotageRoot, sabotageFault, sabotageOperations, sabotageBaseline, sabotageTarget));
    assert.notEqual(sabotageRefusal.ok, true, 'a failed rollback is never reported as success');
    assert.equal(sabotageRefusal.error.reason, 'rollback-verification-failed');
    assert.equal(sabotageOperations.some((step) => step.kind === 'rollback-sabotage' && step.path === sabotageTarget), true,
      'rollback restoration was intentionally prevented');
    assert.equal(readFileSync(resolve(sabotageRoot, sabotageTarget)).equals(sabotageBaseline[sabotageTarget].bytes), false,
      'sabotaged baseline remains detectably unrestored');
    assert.ok(readFileSync(resolve(sabotageRoot, unrelatedPath)).equals(unrelatedBytes), 'failed rollback preserves unrelated bytes');
    assertOnlyTransactionFilesRemoved(sabotageBaseline, sabotageOperations);

    const successRoot = makeRunRoot();
    const successBaseline = baselineAt(successRoot);
    const successOperations = [];
    const successIo = makeIo(successRoot, null, successOperations, successBaseline);
    assert.equal(Object.hasOwn(successIo, 'replace'), false, 'promotion IO exposes no in-place mutable replace operation');
    const promoted = promoteResearchAgendaTransaction(transaction.value, successIo);
    assert.equal(promoted.ok, true, JSON.stringify(promoted));
    const renameOrder = successOperations.filter((step) => step.kind === 'rename').map((step) => step.path);
    assert.deepEqual(renameOrder, mutableOrder);
    assert.equal(renameOrder.at(-1), 'research/agenda/current.json');
    assert.equal(successOperations.some((step) => step.kind === 'create' && mutableOrder.includes(step.path)), false,
      'mutable targets are never created or overwritten in place');
    const firstImmutableStep = successOperations.findIndex((step) => step.kind === 'immutable-create');
    assert.ok(firstImmutableStep >= 0, 'at least one immutable create is observed');
    assert.ok(Object.values(transaction.value.candidatePaths).every((path) => {
      const candidateCreate = successOperations.findIndex((step) => step.kind === 'create' && step.path === path);
      return candidateCreate >= 0 && candidateCreate < firstImmutableStep;
    }), 'all same-directory candidates are prepared before the first immutable create');
    for (const path of Object.values(transaction.value.candidatePaths)) assert.equal(existsSync(resolve(successRoot, path)), false, `${path} private candidate consumed`);
  });

  /* The fixture's authored attention tier must not be a function of the live brief.
     It was: every lane echoed the committed payload verbatim, so when the live 4x/day
     brief began legitimately publishing an empty tier, the stub handed the composer
     zero candidates and every narrative run in this file failed the publication gate
     on an empty tier that stated no reason. Nothing about the publication transaction
     had changed — only yesterday's market had. Pin the decoupling here so the next
     empty tier cannot take the suite down again. */
  test('the fixture signals lane accounts for its own tier when the live brief publishes none', async () => {
    const { recomposePayloadAttention } = await import('../scripts/build-attention-items.mjs');
    const config = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
    /* ADVERSARIAL: an empty live tier carrying no exclusions is exactly the committed
       state that made the old verbatim echo degenerate. */
    const emptyLive = Object.assign(
      JSON.parse(readFileSync(new URL('../market-brief.payload.json', import.meta.url), 'utf8')),
      { attention: [], attentionExclusions: [] }
    );

    const authored = recomposePayloadAttention(
      Object.assign({}, emptyLive, { attention: [FIXTURE_ATTENTION_CANDIDATE] }), config);
    assert.equal(authored.items.length + authored.exclusions.length, 1,
      'the lane-authored candidate is accounted for as a published item or a named refusal');
    assert.ok(authored.exclusions.every((exclusion) => /^RLATTN-/.test(exclusion.code)
      && typeof exclusion.field === 'string' && exclusion.field.length > 0
      && typeof exclusion.reason === 'string' && exclusion.reason.length > 0),
      `a refusal names a composer code, the field and the reason: ${JSON.stringify(authored.exclusions)}`);
    assert.ok(authored.payload.attention.length + authored.payload.attentionExclusions.length > 0,
      'the tier the fixture publishes states why it is empty rather than merely being empty');

    /* ADVERSARIAL: prove the guard can fail. A verbatim echo of the empty live tier
       really does account for nothing, so the assertions above are not tautological. */
    const echoed = recomposePayloadAttention(emptyLive, config);
    assert.equal(echoed.payload.attention.length + echoed.payload.attentionExclusions.length, 0,
      'an echo of an empty live tier accounts for nothing, which is the state this guard exists to keep out of the fixture');
  });

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
    assert.deepEqual(new Set(publication.lastCommitPaths), new Set(['brief-history.jsonl', 'brief-history.recent.jsonl', 'briefs/tier-a/2026-07.jsonl', 'causal-rotation.snapshot.json', 'data/raw-refresh.json', 'market-brief.attention-scorecard.json', 'market-brief.owner-reads.json', 'market-brief.scorecard.json', 'market-brief.snapshot.json', 'market-brief.snapshot.page.json']));
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

  test('distributed publication failure restores captured briefs without destructive Git cleanup', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const preservedPath = 'briefs/user-owned/staged-before-run.json';
    const preservedBytes = Buffer.from('{"owner":"developer"}\n');
    const partialPath = resolve(fixture.repoRoot, 'briefs/objects/generated/partial.json');
    mkdirSync(resolve(fixture.repoRoot, 'briefs/user-owned'), { recursive: true });
    writeFileSync(resolve(fixture.repoRoot, preservedPath), preservedBytes);
    gitFixture(fixture, ['add', '--', preservedPath]);
    writeFileSync(resolve(fixture.repoRoot, 'scripts/brief-distributed-publish.mjs'), `
import { mkdirSync, writeFileSync } from 'node:fs';
const partial = new URL('../briefs/objects/generated/partial.json', import.meta.url);
mkdirSync(new URL('../briefs/objects/generated/', import.meta.url), { recursive: true });
writeFileSync(partial, '{"partial":true}\\n');
console.error('[fixture-distributed] forced failure after partial write');
process.exit(1);
`);
    const beforeIndex = gitFixture(fixture, ['diff', '--cached', '--name-only', '--', 'briefs']);

    const result = runBriefRefreshFixture(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /distributed publisher failed — restoring captured briefs\/ baseline/);
    assert.ok(readFileSync(resolve(fixture.repoRoot, preservedPath)).equals(preservedBytes), 'pre-existing staged bytes survive');
    assert.equal(gitFixture(fixture, ['diff', '--cached', '--name-only', '--', 'briefs']), beforeIndex, 'pre-existing briefs index state survives');
    assert.equal(existsSync(partialPath), false, 'partial publisher output is removed by exact baseline restoration');
  });

  test('SCN-019-012 real generation publishes one atomic agenda and brief payload transaction', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success', agendaAssets: true });
    context.after(() => fixture.cleanup());
    const baselineHistory = readFileSync(resolve(fixture.repoRoot, 'research/agenda/history.jsonl'));
    const baselineCurrent = readFileSync(resolve(fixture.repoRoot, 'research/agenda/current.json'));
    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);
    const validator = runFixtureValidator(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    for (const lane of ['core', 'signals', 'groups', 'coverage', 'research-acquisition']) {
      assert.equal(result.stdout.match(new RegExp(`lane=${lane} started`, 'g'))?.length, 1,
        `${lane} must start exactly once\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    }
    const researchAuthorStarts = [...result.stdout.matchAll(/lane=(research-[a-z0-9-]+) started/g)]
      .map((match) => match[1])
      .filter((lane) => lane !== 'research-acquisition');
    assert.equal(researchAuthorStarts.length > 0, true, 'at least one selected topic must enter the author side pool');
    assert.equal(new Set(researchAuthorStarts).size, researchAuthorStarts.length, 'each selected topic author starts exactly once');
    assert.match(result.stdout, /collected final payload from 4 critical lanes plus the research side lane/);
    assert.match(result.stdout, /pointerLast=research\/agenda\/current\.json/);
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
    const payload = JSON.parse(publication.payloadBytes);
    const current = JSON.parse(readFileSync(resolve(fixture.repoRoot, 'research/agenda/current.json'), 'utf8'));
    const history = readFileSync(resolve(fixture.repoRoot, 'research/agenda/history.jsonl'));
    assert.ok(payload.researchAgenda && payload.researchAgenda.generationId === current.generationRef.generationId);
    assert.equal(payload.researchAgenda.topics.length, 3);
    assert.equal(payload.researchAgenda.topics.find((row) => row.topicId === 'geopolitical-supply-shock').outcome, 'unavailable');
    assert.ok(!history.equals(baselineHistory), 'agenda history advances in the selected transaction');
    assert.ok(!readFileSync(resolve(fixture.repoRoot, 'research/agenda/current.json')).equals(baselineCurrent), 'agenda current pointer advances');
    assert.equal(validator.status, 0, validator.stderr);
    assert.ok(publication.lastCommitPaths.includes('research/agenda/current.json'));
    assert.ok(publication.lastCommitPaths.includes('research/agenda/history.jsonl'));
  });

  test('REG-019-004 pre-projection defer ignores only stale disk page parity', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success', agendaAssets: true });
    context.after(() => fixture.cleanup());
    const pagePath = resolve(fixture.repoRoot, 'market-brief.page.json');
    const stalePageBytes = readFileSync(pagePath);
    const publicationResult = runBriefRefreshFixture(fixture);

    assert.equal(publicationResult.status, 0, `fixture publication failed\nstdout:\n${publicationResult.stdout}\nstderr:\n${publicationResult.stderr}`);
    assert.ok(!readFileSync(pagePath).equals(stalePageBytes), 'the fixture must produce a newer page before the stale-page probe');
    writeFileSync(pagePath, stalePageBytes);

    const validatorEnv = {
      ...process.env,
      BUG002_VALIDATOR_COUNT_FILE: resolve(fixture.fixtureRoot, 'adversarial-validator-count.txt')
    };
    const deferred = spawnSync(process.execPath, ['scripts/validate-brief-payload.mjs', '--defer-page-parity'], {
      cwd: fixture.repoRoot,
      encoding: 'utf8',
      env: validatorEnv
    });
    assert.equal(deferred.status, 0, `deferred validation failed\nstdout:\n${deferred.stdout}\nstderr:\n${deferred.stderr}`);
    assert.match(deferred.stdout, /payload and toolRead agree/);
    assert.match(deferred.stdout, /disk page parity DEFERRED until projection build/);
    assert.doesNotMatch(deferred.stdout, /payload toolRead and page read agree/);

    const defaultWithStalePage = runFixtureValidator(fixture);
    assert.equal(defaultWithStalePage.status, 1, 'default validation must reject the stale disk page');
    assert.match(defaultWithStalePage.stderr, /market-brief\.page\.json researchAgenda must equal payload\.researchAgenda/);

    const pageBuild = spawnSync(process.execPath, ['scripts/build-brief-page-artifacts.mjs'], {
      cwd: fixture.repoRoot,
      encoding: 'utf8',
      env: process.env
    });
    assert.equal(pageBuild.status, 0, pageBuild.stderr);
    const defaultAfterBuild = runFixtureValidator(fixture);
    assert.equal(defaultAfterBuild.status, 0, defaultAfterBuild.stderr);
    assert.doesNotMatch(JSON.stringify(JSON.parse(readFileSync(resolve(fixture.repoRoot, 'market-brief.payload.json'), 'utf8'))), /defer-page-parity/);
  });

  test('REG-019-004 no-agenda validation and unknown-flag refusal remain unchanged', (context) => {
    const fixture = createBriefRefreshFixture();
    context.after(() => fixture.cleanup());
    const defaultVerdict = runFixtureValidator(fixture);
    assert.equal(defaultVerdict.status, 0, defaultVerdict.stderr);

    const deferred = spawnSync(process.execPath, ['scripts/validate-brief-payload.mjs', '--defer-page-parity'], {
      cwd: fixture.repoRoot,
      encoding: 'utf8',
      env: process.env
    });
    assert.equal(deferred.status, 0, deferred.stderr);
    assert.doesNotMatch(deferred.stdout, /page parity DEFERRED/);

    const unknown = spawnSync(process.execPath, ['scripts/validate-brief-payload.mjs', '--defer-page-parity=1'], {
      cwd: fixture.repoRoot,
      encoding: 'utf8',
      env: process.env
    });
    assert.equal(unknown.status, 2, 'only the exact CLI flag is accepted');
    assert.match(unknown.stderr, /unknown flag\(s\): --defer-page-parity=1/);
  });

  test('REG-019-004 dry-run validates candidate page projections without claiming disk parity', (context) => {
    const fixture = createBriefRefreshFixture({ agendaAssets: true });
    context.after(() => fixture.cleanup());
    const protectedPaths = [
      'causal-rotation.snapshot.json',
      'market-brief.payload.json',
      'market-brief.page.json',
      'market-brief.snapshot.json',
      'research/agenda/current.json',
      'research/agenda/history.jsonl'
    ];
    const before = Object.fromEntries(protectedPaths.map((path) => [path, readFileSync(resolve(fixture.repoRoot, path))]));
    const beforeHead = gitFixture(fixture, ['rev-parse', 'HEAD']);
    const beforeStatus = gitFixture(fixture, ['status', '--porcelain=v1', '--untracked-files=all']);
    const result = spawnSync('bash', ['scripts/brief-refresh-and-push.sh', '--dry-run'], {
      cwd: fixture.repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_COPILOT_BIN: '',
        BRIEF_NARRATIVE_ATTEMPTS: '2',
        BRIEF_LANE_ATTEMPTS: '1',
        BRIEF_LANE_CONCURRENCY: '4',
        BRIEF_SKIP_NARRATIVE: '1',
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `dry-run failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /"contractVersion":"market-brief-page-build-result\/v1","dryRun":true/);
    assert.match(result.stdout, /compact page projection validation passed; disk page parity was not asserted/);
    assert.doesNotMatch(result.stdout, /post-build payload \+ disk page parity validation passed/);
    assert.match(result.stdout, /reverted working tree; no commit, no push/);
    for (const path of protectedPaths) assert.ok(readFileSync(resolve(fixture.repoRoot, path)).equals(before[path]), `${path} changed during dry-run`);
    assert.equal(gitFixture(fixture, ['rev-parse', 'HEAD']), beforeHead);
    assert.equal(gitFixture(fixture, ['status', '--porcelain=v1', '--untracked-files=all']), beforeStatus);
    assert.equal(gitFixture(fixture, ['diff', '--cached', '--name-only']), '');
  });

  test('Regression: outer narrative retry reuses one generation-bound research candidate', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'retry-config', agendaAssets: true });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.equal(result.stdout.match(/lane=core started/g)?.length, 2, 'critical core lane retries with the outer narrative');
    assert.equal(result.stdout.match(/lane=research-acquisition started/g)?.length, 1, 'research discovery runs once per generation');
    const researchAuthorStarts = [...result.stdout.matchAll(/lane=(research-[a-z0-9-]+) started/g)]
      .map((match) => match[1])
      .filter((lane) => lane !== 'research-acquisition');
    assert.equal(researchAuthorStarts.length > 0, true, 'selected topic authoring runs during the first outer attempt');
    assert.equal(new Set(researchAuthorStarts).size, researchAuthorStarts.length, 'each selected topic author runs once per generation and is reused by the outer retry');
    assert.match(result.stdout, /research cache stored generation=/);
    assert.match(result.stdout, /research cache reused generation=/);
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
    assert.doesNotMatch(result.stdout, /transient Copilot service failure/);
    assert.doesNotMatch(result.stdout, /narrative attempt 1 failed\/invalid/);
    for (const lane of ['core', 'signals', 'coverage']) {
      assert.equal(result.stdout.match(new RegExp(`lane=${lane} started`, 'g'))?.length, 1, `${lane} was rerun`);
    }
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
    assert.equal(publication.status, '', 'a successful publication leaves no generated artifact outside its commit');
  });

  test('transient Copilot authentication service failure backs off before retrying the failed lane', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'transient-auth' });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture, {
      BRIEF_NARRATIVE_ATTEMPTS: '1',
      BRIEF_LANE_ATTEMPTS: '2',
      BRIEF_LANE_CONCURRENCY: '2',
      BRIEF_LANE_TRANSIENT_BACKOFF_SECONDS: '1'
    });
    const publication = readPublicationState(fixture);
    const coreAttempts = readFileSync(fixture.copilotAttemptFile, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /lane=core attempt=1\/2 hit a transient Copilot service failure; waiting 1s before retrying only this lane/);
    assert.deepEqual(coreAttempts.map(({ laneAttempt }) => laneAttempt), [1, 2]);
    assert.ok(coreAttempts[1].startedAt - coreAttempts[0].startedAt >= 900,
      `core retry started without the configured backoff: ${JSON.stringify(coreAttempts)}`);
    assert.doesNotMatch(result.stdout, /narrative attempt 1 failed\/invalid/);
    assert.equal(publication.snapshotDate, fixture.candidateDate);
    assert.equal(publication.payloadDate, fixture.candidateDate);
  });

  test('publication withholds an ineligible causal elevation without discarding the brief', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'causal-elevation', agendaAssets: true });
    context.after(() => fixture.cleanup());
    const result = runBriefRefreshFixture(fixture, {
      BRIEF_NARRATIVE_ATTEMPTS: '1',
      BRIEF_LANE_ATTEMPTS: '1'
    });
    const publication = readPublicationState(fixture);

    assert.equal(result.status, 0, `wrapper failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stderr, /causal low-noise withheld recommendations\[\d+\] because causal-rotation-lab is not plan-eligible/);
    assert.equal(publication.payload.recommendations.some((row) => JSON.stringify(row).includes('causal-rotation-lab')), false);
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
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile,
        BRIEF_PUSH_RETRY_DELAY_SECONDS: '0'
      }
    });

    assert.equal(result.status, 1, `rejected push was not propagated\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /push failed after 5 bounded attempts — transaction remains unacknowledged/);
    assert.match(result.stdout, /publisher finished with exit=1/);
    gitFixture(fixture, ['fetch', 'origin']);
    assert.equal(gitFixture(fixture, ['rev-parse', 'origin/main']), fixture.initialHead, 'rejected final commit never reached origin');
    assert.equal(existsSync(lockDir), false, 'scheduler lock is released after push failure');
  });

  test('scheduled launcher converges after two transient push rejections', (context) => {
    const fixture = createBriefRefreshFixture({ narrativeMode: 'success' });
    context.after(() => fixture.cleanup());
    const hookCountPath = resolve(fixture.fixtureRoot, 'pre-receive-count.txt');
    const hookPath = resolve(fixture.remoteRoot, 'hooks', 'pre-receive');
    writeFileSync(hookPath, `#!/usr/bin/env node
const fs = require('node:fs');
const countPath = ${JSON.stringify(hookCountPath)};
const count = (fs.existsSync(countPath) ? Number(fs.readFileSync(countPath, 'utf8')) : 0) + 1;
fs.writeFileSync(countPath, String(count));
process.exit(count < 3 ? 1 : 0);
`);
    chmodSync(hookPath, 0o755);
    const lockDir = resolve(fixture.fixtureRoot, 'brief-scheduler-push-race.lock');
    const statusFile = resolve(fixture.fixtureRoot, 'brief-scheduler-push-race.status');

    const result = spawnSync('bash', [resolve(process.cwd(), 'scripts/brief-refresh-scheduled.sh')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BRIEF_SCHEDULE_SOURCE_ROOT: fixture.repoRoot,
        BRIEF_SCHEDULE_LOCK_DIR: lockDir,
        BRIEF_SCHEDULE_STATUS_FILE: statusFile,
        BRIEF_COPILOT_BIN: fixture.copilotPath,
        BRIEF_PUSH_RETRY_DELAY_SECONDS: '0',
        BUG002_BOUNDARY_LOG: fixture.boundaryLog,
        BUG002_CANDIDATE_DATE: fixture.candidateDate,
        BUG002_COPILOT_ATTEMPT_FILE: fixture.copilotAttemptFile,
        BUG002_COPILOT_AUDIT_FILE: fixture.copilotAuditFile,
        BUG002_NARRATIVE_MODE: fixture.narrativeMode,
        BUG002_VALIDATOR_COUNT_FILE: fixture.validatorCountFile
      }
    });

    assert.equal(result.status, 0, `bounded push recovery failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /push attempt 1\/5 rejected/);
    assert.match(result.stdout, /push attempt 2\/5 rejected/);
    assert.match(result.stdout, /pushed after bounded rebase attempt 3\/5/);
    assert.equal(readFileSync(hookCountPath, 'utf8'), '3');
    assert.equal(readSchedulerStatus(statusFile).state, 'success');
    gitFixture(fixture, ['fetch', 'origin']);
    assert.notEqual(gitFixture(fixture, ['rev-parse', 'origin/main']), fixture.initialHead);
    assert.equal(existsSync(lockDir), false, 'successful push recovery releases the scheduler lock');
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
    assert.deepEqual(publication.lastCommitPaths, ['causal-rotation.snapshot.json', 'data/raw-refresh.json', 'market-brief.attention-scorecard.json', 'market-brief.scorecard.json', 'market-brief.snapshot.page.json']);
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

  test('REG-019-004 corrupted post-build page blocks before staging and restores every owned baseline byte', (context) => {
    const fixture = createBriefRefreshFixture({ validatorMode: 'fail-final', narrativeMode: 'success', agendaAssets: true });
    context.after(() => fixture.cleanup());
    const baselineData = readFileSync(resolve(fixture.repoRoot, 'data/baseline.json'));
    const baselinePage = readFileSync(resolve(fixture.repoRoot, 'market-brief.page.json'));
    const baselineCurrent = readFileSync(resolve(fixture.repoRoot, 'research/agenda/current.json'));
    const baselineAgendaHistory = readFileSync(resolve(fixture.repoRoot, 'research/agenda/history.jsonl'));

    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /corrupted post-build page before default parity validation/);
    assert.match(result.stderr, /\[brief-page\] stale=market-brief\.page\.json/);
    assert.match(result.stdout, /agenda transaction page projection parity failed/, `unexpected failure phase\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.doesNotMatch(result.stdout, /post-build payload \+ disk page parity validation passed/);
    assert.equal(readFileSync(fixture.validatorCountFile, 'utf8'), '4', 'the injected corruption must target the fourth, post-build validator call');
    assert.ok(publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']));
    assert.ok(publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']));
    assert.ok(publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']));
    assert.ok(publication.configBytes.equals(fixture.baseline['market-brief.config.json']));
    assert.ok(readFileSync(resolve(fixture.repoRoot, 'market-brief.page.json')).equals(baselinePage));
    assert.ok(readFileSync(resolve(fixture.repoRoot, 'research/agenda/current.json')).equals(baselineCurrent));
    assert.ok(readFileSync(resolve(fixture.repoRoot, 'research/agenda/history.jsonl')).equals(baselineAgendaHistory));
    assert.ok(readFileSync(resolve(fixture.repoRoot, 'data/baseline.json')).equals(baselineData));
    assert.equal(existsSync(resolve(fixture.repoRoot, 'data/raw-refresh.json')), false);
    assert.equal(publication.staged, '');
    assert.equal(publication.status, '');
    assert.equal(publication.head, fixture.initialHead);
  });

  test('Regression canary: existing brief atomicity restores every prior owned path under coupled fault injection', (context) => {
    const fixture = createBriefRefreshFixture({
      validatorMode: 'fail-final',
      narrativeMode: 'success',
      agendaAssets: true,
      companyAssets: true
    });
    context.after(() => fixture.cleanup());
    const companyPointer = 'data/company-intelligence/company-msft/current.json';
    const companyVersion = 'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json';
    const unpublishedVersion = 'data/company-intelligence/company-msft/versions/scope03-unpublished.json';
    const beforePointer = readFileSync(resolve(fixture.repoRoot, companyPointer));
    const beforeVersion = readFileSync(resolve(fixture.repoRoot, companyVersion));
    const fetchScript = resolve(fixture.repoRoot, 'scripts/fetch-options.mjs');
    writeFileSync(fetchScript, `${readFileSync(fetchScript, 'utf8')}
import { mkdirSync as scope03Mkdir, writeFileSync as scope03Write } from 'node:fs';
const scope03Pointer = new URL('../${companyPointer}', import.meta.url);
const scope03Candidate = new URL('../${unpublishedVersion}', import.meta.url);
scope03Mkdir(new URL('../data/company-intelligence/company-msft/versions/', import.meta.url), { recursive: true });
scope03Write(scope03Pointer, '{"generationId":"scope03-failed","versionId":"scope03-unpublished"}\\n');
scope03Write(scope03Candidate, '{"generationId":"scope03-failed","versionId":"scope03-unpublished"}\\n');
console.log('[scope03-canary] mutated company pointer and unpublished candidate inside the worker transaction');
`);
    const harnessStatus = gitFixture(fixture, [
      'status', '--porcelain=v1', '--untracked-files=all', '--', 'scripts/fetch-options.mjs'
    ]);

    const result = runBriefRefreshFixture(fixture);
    const publication = readPublicationState(fixture);

    assert.equal(result.status, 1,
      `coupled fault unexpectedly succeeded\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /scope03-canary.*mutated company pointer and unpublished candidate/);
    assert.match(result.stdout, /agenda transaction page projection parity failed/);
    assert.ok(readFileSync(resolve(fixture.repoRoot, companyPointer)).equals(beforePointer),
      'the company pointer restores byte-for-byte with the brief baselines');
    assert.ok(readFileSync(resolve(fixture.repoRoot, companyVersion)).equals(beforeVersion),
      'the prior immutable company version remains byte-identical');
    assert.equal(existsSync(resolve(fixture.repoRoot, unpublishedVersion)), false,
      'the unpublished checkout candidate is removed during full owned-path restoration');
    assert.ok(publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json']));
    assert.ok(publication.historyBytes.equals(fixture.baseline['brief-history.jsonl']));
    assert.ok(publication.payloadBytes.equals(fixture.baseline['market-brief.payload.json']));
    assert.equal(publication.staged, '');
    assert.equal(publication.status, harnessStatus,
      'the worker restores every owned path without rewriting the test-owned fault injector');
    assert.equal(publication.head, fixture.initialHead);
  });
}