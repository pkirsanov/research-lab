#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRIEF_NARRATIVE_FIELDS_REQUIRED, findBriefNarrativeVocabularyLeaks, matchesFieldPatterns, walkBriefStrings } from './reader-vocabulary.mjs';
import { ACTION_DIRECTION, buildRecommendationBody, loadInstrumentUniverse } from './recommendation-body.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');

/* rlattention.js is a UMD dual module, not ESM: createRequire takes the module.exports
   branch and the browser takes the globalThis.RLATTN branch, and both hand back the SAME
   frozen api object. Requiring it here is what makes the publication path and the render
   path one predicate instead of two copies that happen to agree today. */
const RLATTN = createRequire(import.meta.url)(resolve(ROOT, 'rlattention.js'));
const RLAGENDA = createRequire(import.meta.url)(resolve(ROOT, 'rlagenda.js'));

/**
 * The attention field predicate, re-exported so a caller can prove by identity that the
 * publication path runs the capability module's own function. This file restates NO
 * attention rule locally: the headline ceiling, the falsifiability triple, the window
 * vocabulary, the transmission channels and the provenance class all live in rlattention.js.
 */
export const validateAttentionItem = RLATTN.validateAttentionItem;

/*
 * The context `validateAttentionItem` resolves an item against. Every member is caller-supplied
 * BY CONTRACT, so that the public watchlist scope, the exchange calendar and the
 * generation-window vocabulary each keep exactly one definition and rlattention.js never
 * becomes a second one (design 017, `windowVocabulary`: "supplied by the caller from the
 * committed generation-window contract").
 *
 * The publication path hands over nothing it cannot READ from a committed artifact, and
 * synthesizes nothing: the scope is watchlist.json, the calendar is the committed
 * xnys-calendar/v1 artifact, the vocabulary is the caller's own generation-window contract and
 * the trading date is the payload's own session date. Hard cutover still applies in the other
 * direction — a member no committed artifact can supply is left ABSENT and the item is refused,
 * never resolved against a substituted default.
 */

/** The public watchlist scope: the tickers watchlist.json declares, and nothing else. */
export const WATCHLIST_SCOPE = Object.freeze(loadJson('watchlist.json').items.map((item) => item.ticker));

/*
 * The exchange calendar, projected from the committed xnys-calendar/v1 rows into the session
 * shape the shipped resolver reads (`sessions[].tradingDate/opensUtc/closesUtc`). A row is a
 * session exactly when it carries a regular trading period: `holiday` and `weekend` rows carry
 * `regular: null`, while `early-close` rows carry their OWN 13:00 ET close — so a close-anchored
 * window slides with the real half-day boundary instead of a nominal 16:00.
 */
export const XNYS_CALENDAR_SOURCE = Object.freeze({
  sessions: Object.freeze(
    loadJson('data/calendars/xnys/calendar.json').rows
      .filter((row) => row.regular)
      .map((row) => Object.freeze({
        tradingDate: row.tradingDate,
        opensUtc: row.regular.startUtc,
        closesUtc: row.regular.endUtc
      }))
  )
});

/**
 * The window vocabulary, keyed by window id, read from the caller's own generation-window
 * contract. A window that contract does not declare — or declares without a resolvable
 * `{ anchor, offsetMinutes }` pair — gets NO entry, and every item placed in it is refused by
 * name. That refusal is the point: it is what an absent anchor is supposed to cost.
 */
export function windowVocabularyFrom(config) {
  const declared = Array.isArray(config?.windows) ? config.windows : [];
  const vocabulary = {};
  for (const window of declared) {
    if (!hasText(window?.id) || !hasText(window?.anchor) || !Number.isFinite(window?.offsetMinutes)) continue;
    vocabulary[window.id] = { anchor: window.anchor, offsetMinutes: window.offsetMinutes };
  }
  return vocabulary;
}

/* The registry's own page files are the only legitimate deep-link targets. An
   allowlist derived from the registry cannot drift from it the way a restated
   literal list would. Absent or unregistered is refused, never defaulted. */
export function toolDeepLinksFrom(registry) {
  return (registry?.tools || []).map((tool) => tool?.file).filter(hasText);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNarrative(value) {
  return hasText(value) || (Array.isArray(value) && value.length > 0 && value.every(hasText));
}

function hasObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

/* A refusal has to say WHICH item, not just which slot. An index moves when the
   list is re-ranked between runs, so an operator reading "attention[3].headline"
   from yesterday's log cannot find that item today. The id is the stable handle
   and the subject is the human one; when the identity field is itself the thing
   that is missing, say so rather than printing "undefined". */
function attentionItemLabel(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return ' (item is not an object)';
  const parts = [];
  parts.push(hasText(item.id) ? `id=${item.id.trim()}` : 'id absent');
  if (hasText(item.subject)) parts.push(`subject=${item.subject.trim()}`);
  return ` (${parts.join(', ')})`;
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

/** Causal coverage belongs in toolReads/toolCoverage; these rows consume scarce action slots. */
export function findCausalElevations(payload) {
  const findings = [];
  for (const field of ['recommendations', 'attention']) {
    const rows = Array.isArray(payload?.[field]) ? payload[field] : [];
    rows.forEach((row, index) => {
      if (JSON.stringify(row).includes('causal-rotation-lab')) findings.push({ field, index });
    });
  }
  return findings;
}

/** Withhold only rows that elevate the ineligible causal read; preserve all other authored output. */
export function dropCausalElevations(payload, findings) {
  if (!findings || !findings.length) return payload;
  const droppedByField = new Map();
  for (const finding of findings) {
    if (!droppedByField.has(finding.field)) droppedByField.set(finding.field, new Set());
    droppedByField.get(finding.field).add(finding.index);
  }
  return Object.fromEntries(Object.entries(payload).map(([field, value]) => {
    const dropped = droppedByField.get(field);
    return [field, dropped && Array.isArray(value) ? value.filter((_, index) => !dropped.has(index)) : value];
  }));
}

/* ── The §9 events contract on the publish path ──────────────────────────────────────────────────
   notes/market-brief.md pins the events block at `{ event, when, type, consensus, impliedMovePct,
   scenarios:[{ name, prob, expectedEffect }], psychologyNote }`. Twenty-one payload revisions carry
   exactly those names. One run deviated: it emitted `probability` for `prob`, `detail` for
   `expectedEffect`, and no `psychologyNote` at all — and this gate exited 0 on it, because `events`
   was checked only for being a non-empty ARRAY. Nothing below the array was checked at all.

   The two renames were lossless. The absent `psychologyNote` was not: it is the paragraph that says
   WHY the odds are tilted the way they are, and no other key carried that content under a different
   name. So the same silent hole passed through a lossless defect and a content loss identically, and
   both reached the served payload. The selftest caught it, but only AFTER commit — the gate is the
   rung that runs at publish time, so the gate is where the rule has to live.

   The key list is DERIVED, not restated. Every `events.[]` leaf in the shared
   BRIEF_NARRATIVE_FIELDS_REQUIRED declaration is required here too, so this gate and the selftest's
   "the required list describes this payload" check cannot drift apart — adding a required events
   field in one place arms both. `prob` is the single addition, because it is numeric and a list of
   narrative-STRING paths cannot name it by construction. */
function contractLeafKeys(prefix) {
  return BRIEF_NARRATIVE_FIELDS_REQUIRED
    .filter((pattern) => pattern.startsWith(prefix))
    .map((pattern) => pattern.slice(prefix.length))
    .filter((leaf) => /^[A-Za-z][A-Za-z0-9]*$/.test(leaf));
}

export const BRIEF_EVENT_REQUIRED_KEYS = Object.freeze(contractLeafKeys('events.[].'));
export const BRIEF_EVENT_SCENARIO_REQUIRED_KEYS = Object.freeze([...contractLeafKeys('events.[].scenarios.[].'), 'prob']);

/* ── The same contract, stated to the AUTHOR ─────────────────────────────────────────────────────
   The check above is the LAST rung. The FIRST rung is the signals lane instruction in
   scripts/brief-narrative-parallel.mjs, and that is where this incident actually started: the
   instruction described the fields by MEANING ("every probability is an estimate") and never named
   one, so the lane was free to call `prob` "probability", `expectedEffect` "detail", and to skip
   `psychologyNote` altogether. A gate that refuses keys the instruction never mentions does not
   prevent the defect — it only reports it after the payload is already written.

   So the instruction is BUILT here, from the very constants the gate refuses on, and the lane
   interpolates it. One list, two rungs. Adding a required `events.[]` field to
   BRIEF_NARRATIVE_FIELDS_REQUIRED now arms the gate AND rewrites the authoring instruction in the
   same edit, because there is no second copy left to keep in sync.

   The ordered SHAPE lists carry the §9 keys this gate cannot derive: `when`, `type` and
   `impliedMovePct` are numeric/enum machine fields, absent from a narrative-STRING required list by
   construction, and `scenarios` is the container the per-scenario rule walks rather than a leaf.
   They are shown to the author but NOT enforced here. The selftest proves every ENFORCED key is a
   member of its shape list and that the shape matches the §9 template in notes/market-brief.md, so
   a required key cannot arm the gate while going unmentioned to the author. */
export const BRIEF_EVENT_SHAPE_KEYS = Object.freeze(['event', 'when', 'type', 'consensus', 'impliedMovePct', 'scenarios', 'psychologyNote']);
export const BRIEF_EVENT_SCENARIO_SHAPE_KEYS = Object.freeze(['name', 'prob', 'expectedEffect']);

/* The synonyms a real run actually emitted, and the one field whose absence is content loss rather
   than a rename. Declared as data keyed BY the contract key, so an entry for a key that leaves the
   required list stops being rendered instead of dangling as stale advice. */
const BRIEF_EVENT_OBSERVED_SYNONYMS = Object.freeze({ prob: 'probability', expectedEffect: 'detail' });
const BRIEF_EVENT_KEY_RATIONALE = Object.freeze({
  psychologyNote: 'the paragraph saying WHY the odds are tilted the way they are - no other key carries that content, so omitting it is lost reader content, not a rename'
});

/**
 * briefEventContractInstruction() — the §9 events contract as an authoring instruction, rendered
 * from the keys this gate enforces. Consumed by the signals lane in brief-narrative-parallel.mjs.
 */
export function briefEventContractInstruction() {
  const required = new Set([...BRIEF_EVENT_REQUIRED_KEYS, ...BRIEF_EVENT_SCENARIO_REQUIRED_KEYS]);
  const named = (map, render) => Object.entries(map).filter(([key]) => required.has(key)).map(render);
  const renames = named(BRIEF_EVENT_OBSERVED_SYNONYMS, ([key, synonym]) => `the key is "${key}", NOT "${synonym}"`);
  const rationale = named(BRIEF_EVENT_KEY_RATIONALE, ([key, why]) => `"${key}" is ${why}`);
  return `Use the exact section 9 key names and no synonyms:`
    + ` each event is { ${BRIEF_EVENT_SHAPE_KEYS.join(', ')} }`
    + ` and each scenario is { ${BRIEF_EVENT_SCENARIO_SHAPE_KEYS.join(', ')} }.`
    + ` The publish gate REFUSES a renamed or missing key by name, on every entry:`
    + ` event keys ${BRIEF_EVENT_REQUIRED_KEYS.join(', ')};`
    + ` scenario keys ${BRIEF_EVENT_SCENARIO_REQUIRED_KEYS.join(', ')}.`
    + (renames.length ? ` A previous run renamed keys and the payload shipped off-contract, so be exact: ${renames.join('; ')}.` : '')
    + (rationale.length ? ` ${rationale.join('. ')}.` : '');
}

/**
 * findEventContractInstructionGaps(instruction) — enforced keys the authoring instruction never
 * names. This is the lane-versus-gate agreement check: a non-empty result means the gate would
 * refuse a payload over a key the author was never asked to write, which is the exact shape of the
 * defect that produced the off-contract publish. Whole-key matching, because "probability" contains
 * "prob" and a substring test would have called the renamed instruction conforming.
 */
export function findEventContractInstructionGaps(instruction) {
  const text = String(instruction ?? '');
  return [...new Set([...BRIEF_EVENT_REQUIRED_KEYS, ...BRIEF_EVENT_SCENARIO_REQUIRED_KEYS])]
    .filter((key) => !new RegExp(`\\b${key}\\b`).test(text));
}

/**
 * findEventContractBreaches(payload) — every §9 events entry or scenario missing a contract key.
 * Presence only: this asks whether the reader's field is THERE, not whether its prose is good. A
 * rename and an omission both surface here, and the keys actually present are reported beside the
 * expected one so a rename reads as a rename rather than as an unexplained hole.
 */
export function findEventContractBreaches(payload) {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  const breaches = [];
  const objectKeys = (node) => (node && typeof node === 'object' && !Array.isArray(node) ? Object.keys(node) : []);
  const requireKeys = (node, required, path) => {
    const present = objectKeys(node);
    required.forEach((key) => {
      if (!present.includes(key)) breaches.push({ path, missingKey: key, presentKeys: present });
    });
  };
  events.forEach((event, index) => {
    const path = `events[${index}]`;
    requireKeys(event, BRIEF_EVENT_REQUIRED_KEYS, path);
    const scenarios = Array.isArray(event?.scenarios) ? event.scenarios : [];
    /* Without this an empty `scenarios` array would satisfy every per-scenario key check
       vacuously — the exact bypass the per-scenario rule exists to close. */
    if (!scenarios.length) breaches.push({ path: `${path}.scenarios`, missingKey: 'at least one scenario', presentKeys: [] });
    scenarios.forEach((scenario, scenarioIndex) => {
      requireKeys(scenario, BRIEF_EVENT_SCENARIO_REQUIRED_KEYS, `${path}.scenarios[${scenarioIndex}]`);
    });
  });
  return breaches;
}

/** One operator-legible line per breach: the offending path, the expected key, what is there instead. */
export function formatEventContractBreach(breach) {
  return `${breach.path} is missing required key "${breach.missingKey}"`
    + ` — keys present: ${breach.presentKeys.length ? breach.presentKeys.join(', ') : '(none)'}`;
}

export function validateBriefPayload(payload, registry, config, snapshot, agendaRegistry = null, pageArtifact = null) {
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
    /* NOT enforced here, deliberately, and the reason is worth keeping.
       `dataAsOf.labels` IS required reader copy — BRIEF_NARRATIVE_FIELDS_REQUIRED declares it, and
       the 2026-08-15 after-hours publish dropped it (present in the eight preceding payloads). The
       obvious move is to fail this gate on it. Measured, that costs more than it buys: this function
       is not only the publish CLI, it is a LIBRARY that the selftest, the rollover fixture and the
       brief-CLI suites call as a pure function on the COMMITTED artifact. Adding the check moved the
       node suite from 848 pass / 25 fail to 842 / 31 — six suites about module registration, refusal
       publishing and D16 hedge direction all began reporting a payload-content problem instead of
       their own subject.
       The loss is already reported, once, in the right voice: the selftest's "every REQUIRED
       narrative pattern matches a real field in the committed payload" names the exact missing
       field. One clear signal beats the same signal echoed through six unrelated suites. If this
       ever needs to fail closed at publish time, it belongs on the CLI branch validating a NEWLY
       GENERATED payload, not on the library path every consumer of the committed artifact shares. */
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

  /* Attention used to be checked by card count alone, so a 400-character headline with no
     invalidation, no expiry and no transmission path published cleanly four times a day into
     an append-only ledger. The cap still applies, and every item now clears the same
     decision-attention/v1 field contract the browser applies, named field by field the way
     nextSession.actions already is. Hard cutover: a missing required field is refused, never
     defaulted. */
  if (!Array.isArray(payload?.attention)) errors.push('attention must be an array');
  else {
    if (payload.attention.length > (thresholds.attentionMaxCards || 7)) errors.push('attention exceeds configured card maximum');
    /* Zero published is valid; zero published with zero recorded exclusions is not.
       The composer's accounting throw passes trivially at 0 + 0 === 0, so a generation
       that considered nothing silently ships an empty tier at exit 0 — the exact risk
       scope 06 named and left unenforced (OBS-007-02). An empty tier must say why.
       Self-contained on purpose: reading .length off a non-array yields undefined and
       would silently stop this firing, leaving the rule resting on the neighbouring
       type check rather than on itself. */
    const recordedExclusions = Array.isArray(payload.attentionExclusions) ? payload.attentionExclusions : [];
    if (payload.attention.length === 0 && recordedExclusions.length === 0) {
      errors.push('attention is empty with no recorded exclusions — an empty tier must state why it is empty, not merely be empty');
    }
    const attentionContext = {
      watchlistScope: WATCHLIST_SCOPE,
      calendarSource: XNYS_CALENDAR_SOURCE,
      windowVocabulary: windowVocabularyFrom(config),
      tradingDateIso: payload?.nextSession?.sessionDate,
      toolDeepLinks: toolDeepLinksFrom(registry)
    };
    payload.attention.forEach((item, index) => {
      for (const violation of validateAttentionItem(item, attentionContext).violations) {
        errors.push(`attention[${index}]${attentionItemLabel(item)}.${violation.field} ${violation.code}: ${violation.message}`);
      }
    });
  }

  /* Refused candidates (F-017-06). The build step excludes a candidate the
     composer refuses and records WHY, mirroring the toolCoverage[].reason
     contract where a registered tool that was not material must still say so.
     Validated when present rather than required: the key arrives with the build
     step's payload cutover, and refusing every brief until then would take the
     live 4x/day publication down for a key nothing writes yet. What is NOT
     optional is its shape — a reason that does not name a real refusal code is
     worse than no reason, because it reads as an explanation and explains
     nothing. */
  if (payload?.attentionExclusions !== undefined) {
    if (!Array.isArray(payload.attentionExclusions)) errors.push('attentionExclusions must be an array when present');
    else {
      payload.attentionExclusions.forEach((exclusion, index) => {
        const at = `attentionExclusions[${index}]`;
        if (!exclusion || typeof exclusion !== 'object' || Array.isArray(exclusion)) {
          errors.push(`${at} must be an object naming the refused candidate and its reason`);
          return;
        }
        if (!RLATTN.REFUSAL_CODES.includes(exclusion.code)) {
          errors.push(`${at}.code ${JSON.stringify(exclusion.code)} is not one of the composer's named refusal codes`);
        }
        if (!hasText(exclusion.field)) errors.push(`${at}.field must name the field the candidate was refused on`);
        if (!hasText(exclusion.reason)) errors.push(`${at}.reason must state why the candidate was refused`);
      });
    }
  }

  if (!Array.isArray(payload?.recommendations)) errors.push('recommendations must be an array');
  if (!Array.isArray(payload?.events) || payload.events.length === 0) errors.push('events must be a non-empty array');
  else findEventContractBreaches(payload).forEach((breach) => errors.push('events-contract: ' + formatEventContractBreach(breach)));
  if (!Array.isArray(payload?.groups) || payload.groups.length === 0) errors.push('groups must be a non-empty array');
  if (!hasObject(payload?.watchlistNotes)) errors.push('watchlistNotes must be a non-empty object');
  if (!hasObject(payload?.toolReads)) errors.push('toolReads must be a non-empty object');
  /* Feature 001 Scope 04 — causal brief gate. A causal read may be absent, but if it is present it
     either declares itself unavailable with NO stage and no plan eligibility, or it carries every
     field a reader needs to judge it: the cause, its stage, when the evidence was observed, the
     regime it assumes, what would confirm it, what would falsify it, an owner deep link, and
     reason keys that are actually independent of one another. */
  const causalRead = payload?.toolReads?.['causal-rotation-lab'];
  if (causalRead !== undefined) {
    const metrics = causalRead.metrics;
    if (!hasObject(metrics)) errors.push('toolReads.causal-rotation-lab must include metrics');
    else if (metrics.health === 'unavailable') {
      if (metrics.stage !== null || metrics.planEligible !== false) {
        errors.push('an unavailable causal read must carry no stage and no plan eligibility');
      }
    } else {
      const required = ['causeStatus', 'stage', 'evidenceAsOf', 'regimeVersionId', 'confirmation', 'invalidation'];
      for (const field of required) {
        if (metrics[field] === undefined || metrics[field] === null || metrics[field] === '') {
          errors.push(`causal brief item requires ${field}`);
        }
      }
      if (!hasText(causalRead.deepLink)) errors.push('causal brief item requires an owner deep link');
      const reasonKeys = Array.isArray(metrics.reasonKeys) ? metrics.reasonKeys : [];
      if (new Set(reasonKeys).size !== reasonKeys.length) {
        errors.push('causal brief item reason keys must be independent, not repeated from one origin');
      }
      if (metrics.planEligible === true && reasonKeys.length < 1) {
        errors.push('a plan-eligible causal item requires at least one independent reason key');
      }
    }
  }
  if (payload?.researchAgenda !== undefined) {
    if (!agendaRegistry) errors.push('researchAgenda requires the committed research-agenda.json registry');
    else {
      const agendaRead = RLAGENDA.validateAgendaRead(payload.researchAgenda, agendaRegistry);
      if (!agendaRead.ok) errors.push(`researchAgenda ${agendaRead.code}: ${agendaRead.field || 'invalid read'}`);
      const toolRead = payload?.toolReads?.['research-agenda-lab'];
      if (!toolRead || !hasText(toolRead.read) || !hasText(toolRead.deepLink) || !hasObject(toolRead.metrics)) {
        errors.push('toolReads.research-agenda-lab must include reader prose, deepLink, and metrics');
      } else {
        if (canonicalJson(toolRead.metrics.agendaRead) !== canonicalJson(payload.researchAgenda)) errors.push('toolReads.research-agenda-lab agendaRead must equal payload.researchAgenda');
        if (toolRead.metrics.readFingerprint !== payload.researchAgenda.readFingerprint || toolRead.metrics.generationId !== payload.researchAgenda.generationId) errors.push('toolReads.research-agenda-lab identity must equal payload.researchAgenda');
        const forbiddenRoutingKeys = new Set(['destination', 'eligibility', 'actionfamily', 'attentionenvelope', 'anomalyseed', 'alertcandidate', 'routingdecision', 'score']);
        const visit = (value, path = '$') => {
          if (Array.isArray(value)) return value.forEach((entry, index) => visit(entry, `${path}[${index}]`));
          if (!value || typeof value !== 'object') return;
          for (const [key, nested] of Object.entries(value)) {
            const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
            if (forbiddenRoutingKeys.has(normalized)) errors.push(`research agenda reader artifact carries Feature 020 routing field ${path}.${key}`);
            visit(nested, `${path}.${key}`);
          }
        };
        visit({ researchAgenda: payload.researchAgenda, toolRead });
      }
      if (pageArtifact !== null && canonicalJson(pageArtifact?.researchAgenda) !== canonicalJson(payload.researchAgenda)) errors.push('market-brief.page.json researchAgenda must equal payload.researchAgenda');
    }
  }
  if (!Array.isArray(payload?.experimental)) errors.push('experimental must be an array');
  else {
    const allowedExperimentalKeys = new Set(['id', 'pattern', 'title', 'note', 'method', 'inputs', 'hiddenByDefault']);
    payload.experimental.forEach((item, index) => {
      const at = `experimental[${index}]`;
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`${at} must be an object`);
        return;
      }
      const unknownKeys = Object.keys(item).filter((key) => !allowedExperimentalKeys.has(key));
      if (unknownKeys.length) errors.push(`${at} carries unknown keys: ${unknownKeys.join(', ')}`);
      const canonical = hasText(item.title) && hasText(item.note) && item.id === undefined && item.pattern === undefined;
      const legacy = hasText(item.id) && hasText(item.pattern) && item.title === undefined && item.note === undefined;
      if (!canonical && !legacy) errors.push(`${at} must use either title/note or legacy id/pattern, without mixing shapes`);
      if (!hasText(item.method)) errors.push(`${at}.method must be non-empty reader prose`);
      if (item.hiddenByDefault !== undefined && typeof item.hiddenByDefault !== 'boolean') errors.push(`${at}.hiddenByDefault must be boolean when present`);
      if (!Array.isArray(item.inputs) || item.inputs.length === 0 || item.inputs.some((input) => !hasText(input))) {
        errors.push(`${at}.inputs must be a non-empty string array`);
      }
    });
  }

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
const CLI_FLAGS = new Set([...D16_FLAGS, '--drop-ineligible-causal', '--defer-page-parity', '--require-narrative-fields']);

/*
 * `--require-narrative-fields` asserts every BRIEF_NARRATIVE_FIELDS_REQUIRED pattern resolves in the
 * payload. It is CALLER-SELECTED for the same reason the D16 flags are, and the asymmetry is the
 * whole point: the lane-authored fields are only the AUTHOR's obligation on a payload the lane just
 * produced. The 2026-08-15 after-hours publish dropped `dataAsOf.labels` — present in the eight
 * preceding payloads — and nothing on the publish path noticed.
 *
 * It must therefore run ONLY on a newly generated payload (brief-refresh-and-push.sh's post-lane
 * validation, which retries the lane and degrades to data-only if it keeps failing). Running it on
 * the baseline check would refuse EVERY future publish, because the currently published payload is
 * the one missing the field — a gate that locks the door on the way out. Running it on the final
 * selected-pair check would block the degraded publishes that deliberately retain the older
 * narrative. Both would trade a missing label for no brief at all.
 */
function findMissingRequiredNarrativeFields(payload) {
  const present = walkBriefStrings(payload);
  return BRIEF_NARRATIVE_FIELDS_REQUIRED.filter(
    (pattern) => !present.some((entry) => matchesFieldPatterns([pattern], entry.segments))
  );
}

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
 *
 *   --defer-page-parity  CLI-only ordering seam for a payload whose compact page has not been rebuilt
 *                        yet. It skips only the disk page comparison; every payload, agenda, toolRead,
 *                        D16, coverage, schema and generation-accounting check still runs.
 */
function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((arg) => arg.startsWith('--'));
  const unknown = flags.filter((flag) => !CLI_FLAGS.has(flag));
  if (unknown.length) {
    console.error(`[brief-contract] unknown flag(s): ${unknown.join(', ')}`);
    process.exit(2);
  }
  const payloadPath = args.filter((arg) => !arg.startsWith('--'))[0] || 'market-brief.payload.json';
  const strict = flags.includes('--enforce-d16');
  const repair = flags.includes('--drop-unscoreable');
  const repairCausal = flags.includes('--drop-ineligible-causal');
  const deferPageParity = flags.includes('--defer-page-parity');
  const requireNarrativeFields = flags.includes('--require-narrative-fields');

  let payload = loadJson(payloadPath);

  if (requireNarrativeFields) {
    const missing = findMissingRequiredNarrativeFields(payload);
    if (missing.length) {
      console.error(`[brief-contract] FAIL: the generated narrative omits required reader copy: ${missing.join(', ')}`);
      process.exit(1);
    }
    console.log('[brief-contract] every required narrative field is present in the generated payload: PASS');
  }

  const unscoreable = findUnscoreableActions(payload, { root: ROOT });
  const verdict = strict || repair ? 'D16 REFUSED' : 'D16 WARNING';
  unscoreable.forEach((finding) => console.error(`[brief-contract] ${verdict} ${formatUnscoreableFinding(finding)}`));

  if (unscoreable.length && repair) {
    payload = dropUnscoreableActions(payload, unscoreable);
    writeFileSync(resolve(ROOT, payloadPath), JSON.stringify(payload, null, 2) + '\n');
    console.error(`[brief-contract] D16 withheld ${unscoreable.length} unscoreable call(s) from ${payloadPath} — the rest of the brief still publishes`);
  }

  const causalSnapshot = loadJson('market-brief.snapshot.json');
  const causalPlanEligible = causalSnapshot?.toolReads?.['causal-rotation-lab']?.metrics?.planEligible === true;
  const ineligibleCausalElevations = causalPlanEligible ? [] : findCausalElevations(payload);
  if (ineligibleCausalElevations.length && repairCausal) {
    payload = dropCausalElevations(payload, ineligibleCausalElevations);
    writeFileSync(resolve(ROOT, payloadPath), JSON.stringify(payload, null, 2) + '\n');
    for (const finding of ineligibleCausalElevations) {
      console.error(`[brief-contract] causal low-noise withheld ${finding.field}[${finding.index}] because causal-rotation-lab is not plan-eligible`);
    }
  }

  const errors = validateBriefPayload(
    payload,
    loadJson('tools.json'),
    loadJson('market-brief.config.json'),
    loadJson('market-brief.snapshot.json'),
    payload.researchAgenda !== undefined ? loadJson('research-agenda.json') : null,
    payload.researchAgenda !== undefined && !deferPageParity ? loadJson('market-brief.page.json') : null
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
  if (payload.researchAgenda !== undefined) {
    if (deferPageParity) {
      console.log('[brief-contract] SCN-019-020 payload and toolRead agree and expose no destination routing fields: PASS; disk page parity DEFERRED until projection build');
    } else {
      console.log('[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS');
    }
    console.log('[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS');
  }
  console.log('[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: '
    + (payload?.toolReads?.['causal-rotation-lab'] === undefined ? 'PASS (no causal read published yet)' : 'PASS'));
  /* Feature 001 Scope 06 — the named low-noise assertion. A causal read may be COVERED without
     consuming an action or attention slot; elevating a non-plan-eligible cause would be exactly
     the noise this policy exists to refuse. */
  const causalCoverage = (causalSnapshot?.toolCoverage || []).filter((row) => row.id === 'causal-rotation-lab');
  const causalElevated = findCausalElevations(payload).length > 0;
  const lowNoiseOk = causalCoverage.length <= 1 && (!causalElevated || causalPlanEligible);
  if (!lowNoiseOk) {
    console.log('[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: FAIL');
    process.exitCode = 1;
  } else {
    console.log('[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS'
      + ' (coverageRows=' + causalCoverage.length + ' elevated=' + causalElevated + ' planEligible=' + causalPlanEligible + ')');
  }
  console.log('[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid');
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
