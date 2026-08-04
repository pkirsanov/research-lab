#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBriefNarrativeVocabularyLeaks } from './reader-vocabulary.mjs';
import { ACTION_DIRECTION, buildRecommendationBody, loadInstrumentUniverse } from './recommendation-body.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNarrative(value) {
  return hasText(value) || (Array.isArray(value) && value.length > 0 && value.every(hasText));
}

function hasObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

/* ── D16 on the publish path ─────────────────────────────────────────────────────────────────────
   D16 (docs/Improvement-Plan.md): "No unscoreable tactical or swing call is published. If a level
   cannot be attributed, the claim is withheld rather than emitted as not-evaluable."

   Until BUG-006 that rule lived ONLY as a sentence in the author prompt
   (scripts/brief-narrative-parallel.mjs), and this file checked only that `invalidation` was
   non-empty TEXT. A hedge call whose invalidation clause carried four numerals therefore passed the
   gate and reached the append-only ledger as `not-evaluable` — permanently, because the ledger
   cannot be retro-scored.

   The rule the prompt did not state: which SIDE the level must land on. recommendation-body.mjs
   attributes every level against the call's OWN direction — a long-biased call (add/rotate/hold)
   breaks BELOW, a short-biased call (trim/hedge) breaks ABOVE — and re-attributes a level on the
   other side to the TRIGGER, because for a hedge a falling price means the hedge is WORKING. A
   short-biased call whose invalidation carries only `below` levels therefore ends with zero
   invalidation levels and can never be scored. That classifier is correct; the authoring was not. */
export const D16_SCORED_HORIZONS = Object.freeze(['tactical', 'swing']);

/** The relation an invalidation level MUST carry for a call of this action family to be scoreable. */
export function requiredInvalidationRelation(direction) {
  const sign = Object.prototype.hasOwnProperty.call(ACTION_DIRECTION, direction) ? ACTION_DIRECTION[direction] : 0;
  return sign >= 0 ? 'below' : 'above';
}

/**
 * findUnscoreableActions(payload, options) — every tactical/swing action whose own published prose
 * resolves to `not-evaluable` under the shipped body builder. Structural calls are out of scope:
 * D16 names tactical and swing only.
 */
export function findUnscoreableActions(payload, options) {
  const opts = options || {};
  const universe = opts.universe || loadInstrumentUniverse(opts.root || ROOT);
  const actions = Array.isArray(payload?.nextSession?.actions) ? payload.nextSession.actions : [];
  const findings = [];
  actions.forEach((action, index) => {
    if (!D16_SCORED_HORIZONS.includes(action?.horizon)) return;
    const subject = hasText(action?.subject) ? action.subject : `action-${index}`;
    const family = hasText(action?.action) ? action.action : 'note';
    const body = buildRecommendationBody({ ...action, subject, action: family }, { universe });
    if (body.evaluability !== 'not-evaluable') return;
    findings.push({
      index,
      action: family,
      subject,
      horizon: action.horizon,
      directionSign: body.directionSign,
      requiredInvalidationRelation: requiredInvalidationRelation(family),
      reasonCode: body.evaluabilityReason,
      invalidationLevels: body.levels.filter((level) => level.source === 'invalidation').length,
      triggerLevels: body.levels.filter((level) => level.source === 'trigger').length
    });
  });
  return findings;
}

/** One operator-legible line per refusal. It names the action, its subject, its direction and the reason. */
export function formatUnscoreableFinding(finding) {
  return `nextSession.actions[${finding.index}] action=${finding.action} horizon=${finding.horizon}`
    + ` directionSign=${finding.directionSign} must break ${finding.requiredInvalidationRelation.toUpperCase()}`
    + ` reason=${finding.reasonCode} invalidationLevels=${finding.invalidationLevels} triggerLevels=${finding.triggerLevels}`
    + ` subject="${String(finding.subject).slice(0, 120)}"`;
}

/** The repair: withhold the unscoreable CLAIM, keep every other call and the rest of the brief. */
export function dropUnscoreableActions(payload, findings) {
  if (!findings || !findings.length) return payload;
  const dropped = new Set(findings.map((finding) => finding.index));
  return {
    ...payload,
    nextSession: {
      ...payload.nextSession,
      actions: payload.nextSession.actions.filter((_, index) => !dropped.has(index))
    }
  };
}

export function validateBriefPayload(payload, registry, config, snapshot) {
  const errors = [];
  const thresholds = config?.thresholds || {};
  const minimumConfidence = Number.isFinite(thresholds.minimumActionConfidence) ? thresholds.minimumActionConfidence : 55;
  const tacticalCap = Number.isFinite(thresholds.tacticalConfidenceCap) ? thresholds.tacticalConfidenceCap : 55;
  const maxActions = Number.isFinite(thresholds.nextSessionMaxActions) ? thresholds.nextSessionMaxActions : 5;
  const allowedActions = new Set(['hold', 'trim', 'add', 'hedge', 'rotate']);
  const allowedHorizons = new Set(['structural', 'swing', 'tactical']);

  if (payload?.toolId !== 'market-brief') errors.push('toolId must be market-brief');
  if (!hasText(payload?.generatedAt) || !Number.isFinite(Date.parse(payload.generatedAt))) errors.push('generatedAt must be a valid ISO timestamp');
  if (!hasText(payload?.asOf) || !Number.isFinite(Date.parse(payload.asOf))) errors.push('asOf must be a valid timestamp');

  if (!hasObject(payload?.dataAsOf)) errors.push('dataAsOf must be a non-empty object');
  else {
    for (const field of ['bars', 'options', 'macro', 'events']) {
      if (!hasText(payload.dataAsOf[field])) errors.push(`dataAsOf.${field} is required`);
    }
  }

  if (!hasObject(payload?.regime)) errors.push('regime must be a non-empty object');
  else {
    if (!['bull', 'bear', 'neutral'].includes(payload.regime.bias)) errors.push('regime.bias must be bull|bear|neutral');
    if (!hasText(payload.regime.note)) errors.push('regime.note is required');
    if (!hasObject(payload.regime.vix) || !Number.isFinite(payload.regime.vix.level)) errors.push('regime.vix.level must be finite');
  }

  const backdrop = payload?.backdrop;
  if (!hasObject(backdrop)) errors.push('backdrop must be a non-empty object');
  else {
    for (const field of ['primaryTrend', 'macroCycle', 'pricedIn', 'asymmetry']) {
      if (!hasText(backdrop[field])) errors.push(`backdrop.${field} is required`);
    }
    for (const field of ['trendEvidence', 'globalBackdrop', 'whatWouldChangeIt']) {
      if (!hasNarrative(backdrop[field])) errors.push(`backdrop.${field} must be text or a non-empty text array`);
    }
    if (!hasObject(backdrop.structuralLevels)) errors.push('backdrop.structuralLevels must be a non-empty object');
  }

  const actions = payload?.nextSession?.actions;
  if (!hasObject(payload?.nextSession)) errors.push('nextSession must be a non-empty object');
  if (!hasText(payload?.nextSession?.sessionDate)) errors.push('nextSession.sessionDate is required');
  if (!hasText(payload?.nextSession?.thesis)) errors.push('nextSession.thesis is required');
  if (!Array.isArray(actions)) errors.push('nextSession.actions must be an array');
  else {
    if (actions.length > maxActions) errors.push(`nextSession.actions exceeds configured maximum ${maxActions}`);
    actions.forEach((action, index) => {
      const prefix = `nextSession.actions[${index}]`;
      if (!allowedActions.has(action?.action)) errors.push(`${prefix}.action must be hold|trim|add|hedge|rotate`);
      for (const field of ['subject', 'rationale', 'structuralAnchor', 'trigger', 'invalidation', 'deepLink']) {
        if (!hasText(action?.[field])) errors.push(`${prefix}.${field} is required`);
      }
      if (!allowedHorizons.has(action?.horizon)) errors.push(`${prefix}.horizon must be structural|swing|tactical`);
      if (!Number.isFinite(action?.confidence) || action.confidence < minimumConfidence) errors.push(`${prefix}.confidence must be at least ${minimumConfidence}`);
      if (action?.horizon === 'tactical' && Number.isFinite(action.confidence) && action.confidence > tacticalCap) errors.push(`${prefix}.confidence exceeds tactical cap ${tacticalCap}`);
    });
  }
  if (snapshot?.nextSessionDate && payload?.nextSession?.sessionDate !== snapshot.nextSessionDate) errors.push('nextSession.sessionDate must match snapshot.nextSessionDate');

  const expectedIds = (registry?.tools || []).map((tool) => tool.id).filter(Boolean);
  const coverage = Array.isArray(payload?.toolCoverage) ? payload.toolCoverage : [];
  const coverageIds = coverage.map((entry) => entry?.id).filter(Boolean);
  const duplicateIds = coverageIds.filter((id, index) => coverageIds.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`toolCoverage contains duplicate ids: ${[...new Set(duplicateIds)].join(', ')}`);
  const missingIds = expectedIds.filter((id) => !coverageIds.includes(id));
  const extraIds = coverageIds.filter((id) => !expectedIds.includes(id));
  if (missingIds.length) errors.push(`toolCoverage missing registered tools: ${missingIds.join(', ')}`);
  if (extraIds.length) errors.push(`toolCoverage contains unregistered tools: ${extraIds.join(', ')}`);
  coverage.forEach((entry, index) => {
    if (!hasText(entry?.reason)) errors.push(`toolCoverage[${index}].reason must state the analyzed read, staleness, or specific irrelevance`);
  });

  for (const id of ['sector-research-lab', 'etf-momentum-lab', 'global-rotation-lab', 'real-assets-lab']) {
    const read = payload?.toolReads?.[id];
    if (!read || !hasText(read.read) || !hasText(read.deepLink) || !read.metrics || typeof read.metrics !== 'object') errors.push(`toolReads.${id} must include read, metrics, and deepLink`);
  }
  const realAssets = JSON.stringify(payload?.toolReads?.['real-assets-lab']?.metrics || {}).toUpperCase();
  for (const token of ['GLD', 'SLV', 'BTC']) {
    if (!realAssets.includes(token)) errors.push(`real-assets tool read must include model-specific ${token} analysis`);
  }
  if (!/(DBC|PDBC|USO|BNO|COMMOD)/.test(realAssets)) errors.push('real-assets tool read must include broad-commodity or oil analysis');

  if (!Array.isArray(payload?.attention)) errors.push('attention must be an array');
  else if (payload.attention.length > (thresholds.attentionMaxCards || 7)) errors.push('attention exceeds configured card maximum');

  if (!Array.isArray(payload?.recommendations)) errors.push('recommendations must be an array');
  if (!Array.isArray(payload?.events) || payload.events.length === 0) errors.push('events must be a non-empty array');
  if (!Array.isArray(payload?.groups) || payload.groups.length === 0) errors.push('groups must be a non-empty array');
  if (!hasObject(payload?.watchlistNotes)) errors.push('watchlistNotes must be a non-empty object');
  if (!hasObject(payload?.toolReads)) errors.push('toolReads must be a non-empty object');
  if (!Array.isArray(payload?.experimental)) errors.push('experimental must be an array');

  /* D13 on the publish path. The rule used to live only in the author prompt and in a
     browser audit that the 4x/day cron never runs, so a status code could be re-emitted
     into reader prose within hours of being cleaned out. The leak table is shared with
     scripts/audit-reader-legibility.mjs; a code beside its own plain-word translation
     still fails, because the gloss is the form that actually shipped. */
  for (const leak of findBriefNarrativeVocabularyLeaks(payload)) {
    errors.push(`reader-vocabulary: ${leak.path} carries ${leak.label} "${leak.sample}" in reader prose — carry the state in plain words only, never the code (not even as a parenthetical gloss)`);
  }

  return errors;
}

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
}

const D16_FLAGS = new Set(['--enforce-d16', '--drop-unscoreable']);

/*
 * D16 enforcement mode is chosen by the CALLER, because refusing and repairing have very different
 * costs on different rungs of the publish path:
 *
 *   (default)            report every unscoreable call by name, exit on schema errors only.
 *                        brief-refresh-and-push.sh:95 validates the PREVIOUSLY published payload as
 *                        its transaction baseline and exits 1 when that payload is invalid. A
 *                        blocking D16 verdict there would refuse every future scheduled run before
 *                        it fetched anything — the brief would stop shipping until a human hand-edited
 *                        a committed artifact. D16 governs PUBLICATION, and a baseline is not being
 *                        published, so the baseline rung reports and continues.
 *
 *   --enforce-d16        strict, read-only verdict: an unscoreable call makes the payload
 *                        unpublishable. For humans, CI, and regression proof.
 *
 *   --drop-unscoreable   the repair the publish path uses: withhold the offending CLAIM and ship the
 *                        rest of the brief. One call the evaluator could never have scored is lost;
 *                        the window still publishes. Killing a whole brief over one call is a larger
 *                        harm than the defect it prevents.
 */
function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((arg) => arg.startsWith('--'));
  const unknown = flags.filter((flag) => !D16_FLAGS.has(flag));
  if (unknown.length) {
    console.error(`[brief-contract] unknown flag(s): ${unknown.join(', ')}`);
    process.exit(2);
  }
  const payloadPath = args.filter((arg) => !arg.startsWith('--'))[0] || 'market-brief.payload.json';
  const strict = flags.includes('--enforce-d16');
  const repair = flags.includes('--drop-unscoreable');

  let payload = loadJson(payloadPath);
  const unscoreable = findUnscoreableActions(payload, { root: ROOT });
  const verdict = strict || repair ? 'D16 REFUSED' : 'D16 WARNING';
  unscoreable.forEach((finding) => console.error(`[brief-contract] ${verdict} ${formatUnscoreableFinding(finding)}`));

  if (unscoreable.length && repair) {
    payload = dropUnscoreableActions(payload, unscoreable);
    writeFileSync(resolve(ROOT, payloadPath), JSON.stringify(payload, null, 2) + '\n');
    console.error(`[brief-contract] D16 withheld ${unscoreable.length} unscoreable call(s) from ${payloadPath} — the rest of the brief still publishes`);
  }

  const errors = validateBriefPayload(
    payload,
    loadJson('tools.json'),
    loadJson('market-brief.config.json'),
    loadJson('market-brief.snapshot.json')
  );
  if (errors.length) {
    console.error('[brief-contract] FAIL');
    errors.forEach((error) => console.error('  - ' + error));
    process.exit(1);
  }
  if (unscoreable.length && strict && !repair) {
    console.error(`[brief-contract] FAIL: ${unscoreable.length} unscoreable tactical/swing call(s) breach D16 — withhold them or give each one a direction-correct invalidation level`);
    process.exit(1);
  }
  console.log('[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid');
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
