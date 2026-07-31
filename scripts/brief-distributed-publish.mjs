/*
 * scripts/brief-distributed-publish.mjs — Feature 002 distributed-briefs activation (deterministic).
 *
 * A DETERMINISTIC, OFFLINE (no network, no LLM) publisher that materializes the content-addressed
 * distributed brief graph under briefs/ from the CURRENT committed market-brief.snapshot.json +
 * market-brief.payload.json + the frozen tools.json briefing registry. It REUSES the shipped Scope 05
 * registry contract (rlcontracts.validateRegistry) and the Scope 07/09 pure staging primitives
 * (buildPublishSet / validatePublishSet / validateRunIdentity / promotePublishSet) — it hand-rolls no
 * publish-set shapes and forks no engine logic.
 *
 * Authorship is deterministic, never an LLM:
 *   - every tool that carries a server-side Tier-A read (snapshot.toolReads) gets a RICH read + a rich
 *     deterministic brief reduced from that read (evidenceKind: deterministic-tier-a-read);
 *   - a tool whose Tier-A adapter RAN but could not reach a read publishes that absence with its own
 *     reason, so an unavailable model is never narrated as an analysis;
 *   - the remaining source tools (browser-or-agent-read in snapshot.toolCoverage) get an HONEST
 *     coverage-only read + brief carrying their real coverage status + reason — never a fabricated read;
 *   - the final combined brief is derived deterministically from the snapshot + the already-authored
 *     narrative payload (referenced by hash), never re-authored by an LLM.
 *
 * SAFETY (non-negotiable):
 *   - it writes ONLY under briefs/. The engine also emits market-brief.payload.json / .snapshot.json
 *     compatibility projections; those are validated IN MEMORY but FILTERED OUT of promotion so the
 *     legacy market-brief.* narrative and data/ are never touched.
 *   - all schema/registry/hash/generation validation runs in memory BEFORE any disk write, so any
 *     validation failure exits non-zero with ZERO writes (fail-closed). Promotion is pointer-last, so a
 *     write failure leaves briefs/current.json un-advanced.
 *   - it is idempotent: if the published pointer already reflects this exact run identity it writes
 *     nothing and returns skipped.
 *
 *   publishDistributedBriefs({ root, dryRun, log }) -> { ok, ... }
 *   CLI: node scripts/brief-distributed-publish.mjs [--dry-run] [--root <path>]
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildPublishSet, validatePublishSet, validateRunIdentity, promotePublishSet,
  canonicalMonthFromEtRunDate
} from './brief-publication.mjs';
import { validateCurrentGraph, validateHistoryGraph } from './validate-distributed-briefs.mjs';
import { loadInstrumentUniverse, recommendationRowsFromPayload } from './recommendation-body.mjs';
import '../rldata.js';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const RLDATA = globalThis.RLDATA;

const FAIL_CODE = 'B002-DISTRIBUTED-PUBLISH';

function sha256Hex(buf) { return createHash('sha256').update(buf).digest('hex'); }

/** Deterministic, sorted-key JSON — the same canonicalization the publication engine uses. */
function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortValue(value[key]);
    return out;
  }
  return value;
}
function stableStringify(value) { return JSON.stringify(sortValue(value)); }
function stableSha(value) { return `sha256:${sha256Hex(Buffer.from(stableStringify(value), 'utf8'))}`; }

function fail(reason, detail) {
  return { ok: false, error: { code: FAIL_CODE, reason, detail: detail === undefined ? null : detail } };
}

/** `America/New_York` civil date (YYYY-MM-DD) for an ISO instant. */
function etCivilDate(iso) {
  const epoch = Date.parse(iso);
  if (!Number.isFinite(epoch)) throw new Error(`invalid ISO instant: ${iso}`);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(epoch));
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Load the snapshot + registry needed to generate every source-tool brief. */
export function loadToolInputs(root) {
  const snapshotPath = path.join(root, 'market-brief.snapshot.json');
  const toolsPath = path.join(root, 'tools.json');
  if (!existsSync(snapshotPath)) return fail('snapshot-missing', 'market-brief.snapshot.json');
  if (!existsSync(toolsPath)) return fail('registry-missing', 'tools.json');
  const snapshotBytes = readFileSync(snapshotPath);
  const toolsBytes = readFileSync(toolsPath);
  let snapshot;
  let toolsJson;
  try { snapshot = JSON.parse(snapshotBytes.toString('utf8')); } catch (e) { return fail('snapshot-parse', e.message); }
  try { toolsJson = JSON.parse(toolsBytes.toString('utf8')); } catch (e) { return fail('registry-parse', e.message); }
  return {
    ok: true, snapshot, toolsJson,
    snapshotSha: `sha256:${sha256Hex(snapshotBytes)}`
  };
}

/** Load the complete publisher inputs and their exact content hashes (offline, read-only). */
export function loadInputs(root) {
  const toolInputs = loadToolInputs(root);
  if (!toolInputs.ok) return toolInputs;
  const payloadPath = path.join(root, 'market-brief.payload.json');
  if (!existsSync(payloadPath)) return fail('payload-missing', 'market-brief.payload.json');
  const payloadBytes = readFileSync(payloadPath);
  let payload;
  try { payload = JSON.parse(payloadBytes.toString('utf8')); } catch (e) { return fail('payload-parse', e.message); }
  return { ...toolInputs, payload, payloadSha: `sha256:${sha256Hex(payloadBytes)}` };
}

/**
 * Reconstruct the prior briefs/ publication state from disk (the exact shape buildPublishSet consumes as
 * run.prior). Returns null when no pointer is published yet — that is generation 0, not an error.
 */
export function readPriorFromRoot(root, currentMonth) {
  const currentPath = path.join(root, 'briefs', 'current.json');
  if (!existsSync(currentPath)) return null;
  let pointer;
  try { pointer = JSON.parse(readFileSync(currentPath, 'utf8')); } catch (e) { return null; }
  const historyCurrentPath = path.join(root, 'briefs', 'history-current.json');
  let historyCurrent = null;
  if (existsSync(historyCurrentPath)) {
    try { historyCurrent = JSON.parse(readFileSync(historyCurrentPath, 'utf8')); } catch (e) { historyCurrent = null; }
  }
  const streams = {};
  const months = new Set();
  const historyRoot = path.join(root, 'briefs', 'history');
  if (existsSync(historyRoot)) {
    const walk = (absDir) => {
      for (const entry of readdirSync(absDir).sort()) {
        const abs = path.join(absDir, entry);
        if (statSync(abs).isDirectory()) { walk(abs); continue; }
        if (!entry.endsWith('.jsonl')) continue;
        const rel = path.relative(root, abs).split(path.sep).join('/');
        streams[rel] = readFileSync(abs, 'utf8');
        const monthMatch = /(\d{4}-\d{2})\.jsonl$/.exec(entry);
        if (monthMatch) months.add(monthMatch[1]);
      }
    };
    walk(historyRoot);
  }
  const sealedMonths = Array.from(months).filter((m) => m !== currentMonth).sort();
  const generation = Number.isInteger(pointer.generation) ? pointer.generation : 0;
  return { streams, generation, pointer, historyCurrent, sealedMonths };
}

/**
 * Construct the schema-valid `run` descriptor buildPublishSet consumes, deterministically, from the
 * snapshot + payload + frozen registry. No network, no LLM: the 5 rich reads come from snapshot.toolReads;
 * the ~17 coverage-only reads come from snapshot.toolCoverage; the final brief is derived from the
 * snapshot + the already-authored narrative payload (referenced, not re-authored).
 */
function toolBriefBundleFingerprint(bundle) {
  return stableSha({
    contractVersion: bundle.contractVersion,
    snapshotSha: bundle.snapshotSha,
    registryFingerprint: bundle.registryFingerprint,
    orderedSourceToolIds: bundle.orderedSourceToolIds,
    tools: bundle.tools
  });
}

/** Build one truthful brief outcome for every registry-discovered source before final authorship. */
export function buildToolBriefBundle(context) {
  const { snapshot, frozen, snapshotSha } = context;
  const window = typeof snapshot.window === 'string' && snapshot.window ? snapshot.window : 'pre-market';
  const asOf = typeof snapshot.asOf === 'string' && snapshot.asOf
    ? snapshot.asOf
    : (typeof snapshot.generatedAt === 'string' ? snapshot.generatedAt : null);
  if (!asOf) return fail('snapshot-asof-missing', 'snapshot.asOf');

  const toolReads = snapshot.toolReads && typeof snapshot.toolReads === 'object' ? snapshot.toolReads : {};
  const coverageById = {};
  for (const cov of Array.isArray(snapshot.toolCoverage) ? snapshot.toolCoverage : []) {
    if (cov && typeof cov.id === 'string') coverageById[cov.id] = cov;
  }

  let richCount = 0;
  let coverageCount = 0;
  const tools = [];
  for (const toolId of frozen.orderedSourceToolIds) {
    const entry = frozen.entries && frozen.entries[toolId] ? frozen.entries[toolId] : {};
    const profile = typeof entry.profile === 'string' ? entry.profile : 'unknown';
    const hasRead = Object.prototype.hasOwnProperty.call(toolReads, toolId);
    const coverage = coverageById[toolId] || {};
    let outcome;
    let summary;
    let readStatus;
    let applicabilityStatus;
    let applicabilityReason;
    let readAsOf = asOf;
    let metrics = null;
    let source = null;
    let limitation;
    if (hasRead) {
      richCount += 1;
      const tr = toolReads[toolId] || {};
      summary = typeof tr.read === 'string' && tr.read.trim() ? tr.read.trim() : '';
      if (!summary || (tr.metrics && typeof tr.metrics.error === 'string' && tr.metrics.error)) {
        return fail('tool-owner-read-invalid', toolId);
      }
      outcome = 'newly-authored';
      readStatus = 'fresh';
      applicabilityStatus = 'applicable';
      applicabilityReason = `${toolId} produced a current deterministic Tier-A owner read for this scheduled cutoff.`;
      readAsOf = typeof tr.asOf === 'string' && Number.isFinite(Date.parse(tr.asOf)) ? tr.asOf : asOf;
      metrics = tr.metrics === undefined ? null : tr.metrics;
      source = tr.source || null;
      limitation = 'Deterministic Tier-A owner read; the briefing layer adds no market recommendation.';
    } else {
      coverageCount += 1;
      outcome = 'coverage-only';
      readStatus = profile === 'live-market' ? 'not-run' : 'not-applicable';
      applicabilityStatus = profile === 'live-market' ? 'not-integrated' : 'not-applicable';
      summary = typeof coverage.reason === 'string' && coverage.reason
        ? coverage.reason
        : 'No deterministic Tier-A adapter exists for this source; the scheduled run records an explicit no-data state.';
      applicabilityReason = summary;
      limitation = 'Explicit coverage state only; no server-side owner read or recommendation is fabricated.';
    }

    const read = {
      contractVersion: 'tool-model-read/v1',
      toolId,
      role: 'source',
      profile,
      status: readStatus,
      adapter: {
        adapterId: entry.readAdapter,
        readContractVersion: entry.readContractVersion,
        owningModelVersion: `${entry.readAdapter}/scheduled-v1`
      },
      evaluatedAt: asOf,
      modelAsOf: readAsOf,
      sourceAsOf: readAsOf,
      evidenceCutoff: asOf,
      summary,
      metrics,
      source,
      marketSessionEvidenceRef: null,
      evidenceRefs: [],
      evidenceApplicability: { status: applicabilityStatus, reason: applicabilityReason },
      evidenceInterpretations: [],
      recommendationEligibility: {
        eligible: false,
        reasonCode: outcome === 'newly-authored' ? 'deterministic-context-only' : applicabilityStatus,
        permittedActionFamilies: [],
        permittedSubjectBoundary: toolId
      },
      facts: [],
      evidenceBoundary: [limitation],
      limitations: [limitation],
      deepLink: coverage.deepLink || (toolReads[toolId] && toolReads[toolId].deepLink) || `${toolId}.html`
    };
    read.fingerprint = RLCONTRACTS.fingerprint('tool-model-read', read);
    const readSha = stableSha(read);
    const inputFingerprint = RLCONTRACTS.fingerprint('tool-brief-input', {
      contractVersion: 'tool-brief-input/v1', readFingerprint: read.fingerprint, profile, snapshotSha, window
    });
    const brief = {
      contractVersion: 'tool-brief/v1',
      toolId,
      profile,
      runId: `bundle-${snapshotSha.slice(7, 19)}`,
      readRef: {
        path: `briefs/objects/reads/${toolId}/${readSha.slice(7)}.json`,
        sha256: readSha,
        fingerprint: read.fingerprint
      },
      inputFingerprint,
      contentFingerprint: RLCONTRACTS.fingerprint('tool-brief-content', {
        contractVersion: 'tool-brief-content/v1', toolId, inputFingerprint, outcome, summary
      }),
      outcome,
      status: 'validated',
      summary,
      decisionRationale: outcome === 'newly-authored'
        ? 'Current deterministic owner output is available as context; the briefing layer adds no recommendation.'
        : 'This source has no current server-side owner output, so the run preserves an explicit coverage state.',
      recommendations: [],
      nextSteps: [],
      marketSessionEvidenceRef: null,
      evidenceRefs: [],
      ownerInterpretationRefs: [],
      windowUse: outcome === 'newly-authored' ? 'context' : 'not-applicable',
      evidenceBoundary: [limitation],
      limitations: [limitation],
      authorship: {
        provider: 'deterministic-scheduler', model: 'none', promptPolicy: 'tool-brief-bundle/v1',
        authoredAt: asOf, attempts: 0
      },
      validation: { schema: 'tool-brief/v1', passed: ['shape', 'registry', 'profile', 'privacy'] }
    };
    const readValidation = RLDATA.validateToolModelRead(read);
    if (!readValidation.ok) return fail('tool-read-contract-invalid', `${toolId}:${readValidation.reason}`);
    const briefValidation = RLCONTRACTS.validateToolBrief(brief, read, profile);
    if (!briefValidation.ok) return fail('tool-brief-contract-invalid', `${toolId}:${briefValidation.error.reason}`);
    tools.push({ toolId, outcome, read: readValidation.value, brief: briefValidation.value });
  }

  const bundle = {
    contractVersion: 'brief-tool-bundle/v1',
    snapshotSha,
    registryFingerprint: frozen.registryFingerprint,
    window,
    asOf,
    orderedSourceToolIds: frozen.orderedSourceToolIds.slice(),
    richCount,
    coverageCount,
    tools
  };
  bundle.bundleFingerprint = toolBriefBundleFingerprint(bundle);
  return { ok: true, bundle, richCount, coverageCount };
}

/** Validate that a prepared bundle belongs to this exact snapshot and complete frozen registry. */
export function validateToolBriefBundle(bundle, context) {
  const frozen = context && context.frozen;
  const snapshotSha = context && context.snapshotSha;
  if (!bundle || bundle.contractVersion !== 'brief-tool-bundle/v1') return fail('tool-bundle-contract', 'brief-tool-bundle/v1');
  if (!frozen || !Array.isArray(frozen.orderedSourceToolIds)) return fail('tool-bundle-registry', 'frozen registry required');
  if (bundle.snapshotSha !== snapshotSha) return fail('tool-bundle-snapshot-mismatch', bundle.snapshotSha);
  if (bundle.registryFingerprint !== frozen.registryFingerprint) return fail('tool-bundle-registry-mismatch', bundle.registryFingerprint);
  if (bundle.bundleFingerprint !== toolBriefBundleFingerprint(bundle)) return fail('tool-bundle-fingerprint-mismatch', bundle.bundleFingerprint);
  if (JSON.stringify(bundle.orderedSourceToolIds) !== JSON.stringify(frozen.orderedSourceToolIds)) return fail('tool-bundle-source-order', 'orderedSourceToolIds');
  if (!Array.isArray(bundle.tools) || bundle.tools.length !== frozen.orderedSourceToolIds.length) return fail('tool-bundle-source-count', String(bundle.tools && bundle.tools.length));
  const seen = new Set();
  for (let index = 0; index < bundle.tools.length; index += 1) {
    const tool = bundle.tools[index];
    const expectedId = frozen.orderedSourceToolIds[index];
    if (!tool || tool.toolId !== expectedId || seen.has(tool.toolId)) return fail('tool-bundle-source-identity', expectedId);
    if (!tool.read || tool.read.toolId !== expectedId || !tool.brief || tool.brief.toolId !== expectedId) return fail('tool-bundle-outcome-incomplete', expectedId);
    if (tool.outcome !== tool.brief.outcome) return fail('tool-bundle-outcome-mismatch', expectedId);
    const readValidation = RLDATA.validateToolModelRead(tool.read);
    if (!readValidation.ok) return fail('tool-read-contract-invalid', `${expectedId}:${readValidation.reason}`);
    const briefValidation = RLCONTRACTS.validateToolBrief(tool.brief, tool.read, tool.read.profile);
    if (!briefValidation.ok) return fail('tool-brief-contract-invalid', `${expectedId}:${briefValidation.error.reason}`);
    seen.add(tool.toolId);
  }
  const richCount = bundle.tools.filter((tool) => tool.outcome === 'newly-authored').length;
  const coverageCount = bundle.tools.length - richCount;
  if (bundle.richCount !== richCount || bundle.coverageCount !== coverageCount) return fail('tool-bundle-count-mismatch', `${richCount}/${coverageCount}`);
  return { ok: true, bundle, richCount, coverageCount };
}

/** Materialize the validated pre-final bundle outside the tracked publication tree. */
export function prepareToolBriefBundle(options) {
  const opts = options || {};
  const root = opts.root ? path.resolve(opts.root) : process.cwd();
  if (typeof opts.output !== 'string' || !opts.output) return fail('tool-bundle-output-required', 'output');
  const inputs = loadToolInputs(root);
  if (!inputs.ok) return inputs;
  const registry = RLCONTRACTS.validateRegistry(inputs.toolsJson, null);
  if (!registry.ok) return fail('registry-invalid', registry.error && registry.error.reason);
  const built = buildToolBriefBundle({ snapshot: inputs.snapshot, frozen: registry.value, snapshotSha: inputs.snapshotSha });
  if (!built.ok) return built;
  const validated = validateToolBriefBundle(built.bundle, { frozen: registry.value, snapshotSha: inputs.snapshotSha });
  if (!validated.ok) return validated;
  const output = path.resolve(opts.output);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, stableStringify(validated.bundle) + '\n');
  return { ok: true, output, bundleFingerprint: validated.bundle.bundleFingerprint, sourceCount: validated.bundle.tools.length, richCount: validated.richCount, coverageCount: validated.coverageCount };
}

export function buildDistributedRun(context) {
  const { snapshot, payload, frozen, snapshotSha, payloadSha, prior } = context;
  const root = context.root || '.';
  const window = typeof snapshot.window === 'string' && snapshot.window ? snapshot.window : 'pre-market';
  const asOf = typeof snapshot.asOf === 'string' && snapshot.asOf
    ? snapshot.asOf
    : (typeof snapshot.generatedAt === 'string' ? snapshot.generatedAt : null);
  if (!asOf) return fail('snapshot-asof-missing', 'snapshot.asOf');
  let etRunDate;
  try { etRunDate = etCivilDate(asOf); } catch (e) { return fail('snapshot-asof-invalid', e.message); }

  const prepared = context.toolBriefBundle
    ? validateToolBriefBundle(context.toolBriefBundle, { frozen, snapshotSha })
    : buildToolBriefBundle({ snapshot, frozen, snapshotSha });
  if (!prepared.ok) return prepared;
  const { bundle, richCount, coverageCount } = prepared;
  const tools = bundle.tools;

  const runFingerprint = stableSha({
    contractVersion: 'brief-distributed-run-identity/v1',
    snapshotSha, payloadSha, toolBriefBundleFingerprint: bundle.bundleFingerprint,
    registryFingerprint: frozen.registryFingerprint, window, etRunDate
  });
  const runId = `dist-${etRunDate}-${window}-${runFingerprint.slice(7, 7 + 12)}`;

  const evidenceBody = {
    contractVersion: 'market-session-evidence/v1', cutoffAt: asOf, window,
    marketClosed: Boolean(snapshot.marketClosed),
    nextSessionDate: snapshot.nextSessionDate || null,
    regime: snapshot.regime || null, dataFreshness: snapshot.dataFreshness || null,
    sourceSnapshotSha: snapshotSha
  };

  // Recommendation lifecycle events derived deterministically from the already-authored narrative actions.
  // recommendationKey is STABLE across runs (subject+family) so history reads a coherent lifecycle; eventId
  // is unique per (run, key, index) so the append-only stream never collides.
  //
  // Each event carries its own DURABLE BODY (instrument, direction, levels, trigger, invalidation,
  // confidence). Without it the terms live only in market-brief.payload.json, which this same run
  // overwrites — which is how 215 published calls became permanently unscoreable.
  const recommendationEvents = recommendationRowsFromPayload(payload, {
    root,
    occurredAt: asOf,
    universe: loadInstrumentUniverse(root),
    eventIdFor: (recommendationKey, index) => stableSha({
      contractVersion: 'brief-distributed-eventid/v1', runFingerprint, recommendationKey, index
    })
  }).map((event) => ({ ...event, bodySource: 'next-session-action' }));

  const finalBody = {
    contractVersion: 'final-brief/v1', runId, window, asOf,
    nextSessionDate: snapshot.nextSessionDate || null,
    marketClosed: Boolean(snapshot.marketClosed),
    regime: snapshot.regime || null, bench: snapshot.bench || null,
    thesis: payload && payload.nextSession && typeof payload.nextSession.thesis === 'string'
      ? payload.nextSession.thesis : null,
    narrativeRef: {
      toolId: payload.toolId || null, window: payload.window || null,
      asOf: payload.asOf || null, payloadSha
    },
    toolBriefBundleRef: { fingerprint: bundle.bundleFingerprint, sourceCount: tools.length },
    sourceSummary: {
      participantCount: frozen.participantCount, sourceCount: frozen.sourceCount,
      richCount, coverageCount
    },
    derivation: 'deterministic-from-snapshot-and-payload-no-llm'
  };

  const run = {
    runId, runFingerprint, etRunDate, window,
    registry: {
      fingerprint: frozen.registryFingerprint,
      orderedSourceToolIds: frozen.orderedSourceToolIds.slice(),
      orderedParticipantIds: frozen.orderedParticipantIds.slice()
    },
    evidence: { state: 'available', cutoffAt: asOf, body: evidenceBody },
    tools,
    final: {
      body: finalBody,
      coverage: { included: tools.length, rich: richCount, coverageOnly: coverageCount, merged: 0, conflicted: 0, excluded: 0 }
    },
    recommendationEvents,
    prior: prior || null
  };
  return { ok: true, run, richCount, coverageCount, etRunDate, toolBriefBundleFingerprint: bundle.bundleFingerprint };
}

/**
 * publishDistributedBriefs: the deterministic activation. Build + validate the whole publish set in
 * memory, then promote ONLY the briefs/ files (compat market-brief.* projections filtered out) into root
 * pointer-last, and validate the on-disk current + history graph. Fail-closed; briefs/-only; idempotent.
 */
export function publishDistributedBriefs(options) {
  const opts = options || {};
  const root = opts.root ? path.resolve(opts.root) : process.cwd();
  const dryRun = Boolean(opts.dryRun);
  const log = typeof opts.log === 'function' ? opts.log : () => { };

  const inputs = loadInputs(root);
  if (!inputs.ok) return inputs;

  const validated = RLCONTRACTS.validateRegistry(inputs.toolsJson, null);
  if (!validated.ok) return fail('registry-invalid', validated.error && validated.error.reason);
  const frozen = validated.value;

  const window = typeof inputs.snapshot.window === 'string' && inputs.snapshot.window ? inputs.snapshot.window : 'pre-market';
  const asOf = typeof inputs.snapshot.asOf === 'string' && inputs.snapshot.asOf
    ? inputs.snapshot.asOf
    : inputs.snapshot.generatedAt;
  if (typeof asOf !== 'string' || !asOf) return fail('snapshot-asof-missing', 'snapshot.asOf');
  let currentMonth;
  try { currentMonth = canonicalMonthFromEtRunDate(etCivilDate(asOf)); } catch (e) { return fail('snapshot-asof-invalid', e.message); }

  const prior = readPriorFromRoot(root, currentMonth);
  let toolBriefBundle = null;
  if (opts.toolBundlePath) {
    try { toolBriefBundle = JSON.parse(readFileSync(path.resolve(opts.toolBundlePath), 'utf8')); }
    catch (error) { return fail('tool-bundle-read', error.message); }
  }

  const runResult = buildDistributedRun({
    snapshot: inputs.snapshot, payload: inputs.payload, frozen,
    snapshotSha: inputs.snapshotSha, payloadSha: inputs.payloadSha, prior, toolBriefBundle, root
  });
  if (!runResult.ok) return runResult;
  const { run, richCount, coverageCount } = runResult;

  // Idempotency: the published pointer already reflects this exact run identity -> no write.
  if (prior && prior.pointer && prior.pointer.runFingerprint === run.runFingerprint) {
    log(`[brief-distributed] idempotent: current pointer already at generation ${prior.generation} for this run identity — no write`);
    return { ok: true, skipped: 'idempotent', runId: prior.pointer.runId, runFingerprint: run.runFingerprint, generation: prior.generation, richCount, coverageCount };
  }

  const built = buildPublishSet(run);
  if (!built.ok) return fail('build-publish-set', built.error && built.error.reason);
  const staging = built.staging;

  const priorStreams = prior && prior.streams ? prior.streams : {};
  const priorGeneration = prior && Number.isInteger(prior.generation) ? prior.generation : 0;
  const sealedMonths = prior && prior.sealedMonths ? prior.sealedMonths : [];

  const setValidation = validatePublishSet(staging, { priorStreams, sealedMonths });
  if (!setValidation.ok) return fail('validate-publish-set', setValidation.error && setValidation.error.reason);
  const identityValidation = validateRunIdentity(staging, { priorGeneration });
  if (!identityValidation.ok) return fail('validate-run-identity', identityValidation.error && identityValidation.error.reason);

  // briefs/-ONLY promotion: the engine also stages market-brief.* compatibility projections; the
  // distributed activation deliberately preserves the legacy market-brief.* narrative, so filter them out.
  const briefsFiles = {};
  for (const rel of Object.keys(staging.files)) {
    if (rel.startsWith('briefs/')) briefsFiles[rel] = staging.files[rel];
  }
  const briefsPaths = Object.keys(briefsFiles).sort();
  const filteredCompat = Object.keys(staging.files).filter((rel) => !rel.startsWith('briefs/')).sort();

  if (dryRun) {
    log(`[brief-distributed] DRY-RUN — would publish generation ${staging.generation} run ${run.runId}`);
    log(`[brief-distributed]   window=${window} etRunDate=${runResult.etRunDate} month=${staging.canonicalMonth} sources=${frozen.sourceCount} (rich=${richCount}, coverage-only=${coverageCount})`);
    log(`[brief-distributed]   would write ${briefsPaths.length} briefs/ files (market-brief.* compat projections filtered out; legacy narrative + data/ untouched):`);
    for (const rel of briefsPaths) log(`[brief-distributed]     + ${rel}`);
    return { ok: true, dryRun: true, wouldWrite: briefsPaths, filteredCompat, generation: staging.generation, runId: run.runId, runFingerprint: run.runFingerprint, richCount, coverageCount };
  }

  const briefsStaging = { ...staging, files: briefsFiles };
  const promotion = promotePublishSet(briefsStaging, root);
  if (!promotion.ok) return fail('promote-publish-set', promotion.error && promotion.error.reason);

  // Validate the ON-DISK graph this publisher owns. The compatibility-projection check is intentionally
  // N/A here: market-brief.* remain the legacy narrative, not pointer-bound projections (see --graph-only).
  const currentGraph = validateCurrentGraph(root);
  if (!currentGraph.ok) return fail('current-graph-invalid', currentGraph.error && currentGraph.error.reason);
  const historyGraph = validateHistoryGraph(root);
  if (!historyGraph.ok) return fail('history-graph-invalid', historyGraph.error && historyGraph.error.reason);

  log(`[brief-distributed] published generation ${staging.generation} run ${run.runId} — ${briefsPaths.length} briefs/ files, ${frozen.sourceCount} sources (rich=${richCount}, coverage-only=${coverageCount})`);
  return {
    ok: true, generation: staging.generation, runId: run.runId, runFingerprint: run.runFingerprint,
    wrote: briefsPaths, filteredCompat, richCount, coverageCount,
    currentGraph, historyGraph
  };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const prepareTools = args.includes('--prepare-tools');
  let root = process.cwd();
  const eq = args.find((a) => a.startsWith('--root='));
  const idx = args.indexOf('--root');
  if (eq) root = eq.slice('--root='.length);
  else if (idx >= 0 && args[idx + 1]) root = args[idx + 1];
  const valueFor = (name) => {
    const direct = args.find((arg) => arg.startsWith(`${name}=`));
    if (direct) return direct.slice(name.length + 1);
    const at = args.indexOf(name);
    return at >= 0 ? args[at + 1] : null;
  };
  return { dryRun, prepareTools, root, output: valueFor('--output'), toolBundlePath: valueFor('--tool-bundle') };
}

function mainCli() {
  const { dryRun, prepareTools, root, output, toolBundlePath } = parseArgs(process.argv);
  const result = prepareTools
    ? prepareToolBriefBundle({ root, output })
    : publishDistributedBriefs({ root, dryRun, toolBundlePath, log: (m) => console.log(m) });
  if (!result.ok) {
    const detail = result.error && result.error.detail ? ` (${result.error.detail})` : '';
    console.error(`[brief-distributed] FAILED: ${result.error ? result.error.reason : 'unknown'}${detail}`);
    process.exit(1);
  }
  if (prepareTools) console.log(`[brief-distributed] tool brief barrier passed: sources=${result.sourceCount} rich=${result.richCount} explicit-state=${result.coverageCount} fingerprint=${result.bundleFingerprint}`);
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  mainCli();
}
