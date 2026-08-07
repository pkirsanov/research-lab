/*
 * tests/attention-payload-contract.test.mjs
 * ------------------------------------------------------------------------
 * Feature 017 Scope 02 — publication-path enforcement of decision-attention/v1.
 * CONTRACT suite (SCN-017-025, SCN-017-026, SCN-017-027, SCN-017-045).
 *
 * Scope 01 shipped rlattention.js: one pure composer/validator that refuses an
 * attention claim which cannot be falsified, cannot be placed in a decision
 * window, cannot name its transmission path, or carries an unprovenanced
 * figure. Nothing on the PUBLICATION path consults it.
 *
 * scripts/validate-brief-payload.mjs validates every OTHER section field by
 * field — nextSession.actions names each missing field by name — but its
 * attention branch is a length cap and nothing else:
 *
 *     if (!Array.isArray(payload?.attention)) errors.push('attention must be an array');
 *     else if (payload.attention.length > (thresholds.attentionMaxCards || 7)) ...
 *
 * So an attention card with a 400-character headline, no invalidation, no
 * expiry and no transmission path publishes cleanly, four times a day, into an
 * append-only ledger. Closing that asymmetry is this scope.
 *
 * These are INTEGRATION tests against the real modules and the real committed
 * files on disk. Nothing is mocked, nothing is stubbed, no fixture carries a
 * pre-computed verdict or refusal code — the production modules derive every
 * one of them. No clock, no randomness, no network.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync
} from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import * as briefContract from '../scripts/validate-brief-payload.mjs';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* rlattention.js is a UMD dual module, not ESM: Node takes the module.exports
   branch, the browser takes the globalThis.RLATTN branch. Both branches hand
   back the SAME frozen api object built by the same factory call, so the
   function this test holds is byte-identical to the one a tool page calls. */
const RLATTN = require(resolve(ROOT, 'rlattention.js'));

const PAYLOAD_PATH = resolve(ROOT, 'market-brief.payload.json');
const NARRATIVE_LANE_PATH = resolve(ROOT, 'scripts/brief-narrative-parallel.mjs');

/* ── the nine keys every existing attention consumer already reads ───────── */

const LEGACY_ATTENTION_KEYS = Object.freeze([
  'rank', 'domain', 'horizon', 'title', 'structuralAnchor', 'what', 'why', 'confidence', 'deepLink'
]);

const LEGACY_ATTENTION_TYPES = Object.freeze({
  rank: 'number',
  domain: 'string',
  horizon: 'string',
  title: 'string',
  structuralAnchor: 'string',
  what: 'string',
  why: 'string',
  confidence: 'number',
  deepLink: 'string'
});

/* the pre-migration reader: it projects the nine keys it knows and nothing
   else. An additive migration must leave its output untouched. */
function legacyAttentionConsumer(item) {
  const parsed = {};
  for (const key of LEGACY_ATTENTION_KEYS) parsed[key] = item[key];
  return parsed;
}

/* ── fixtures: observations only, never a verdict ─────────────────────────── */

/* A headline that lands exactly ON the published ceiling, and one that lands
   exactly one character past it. Both lengths are asserted in the test rather
   than trusted, and the ceiling itself is re-derived from the production
   module rather than hardcoded as a magic number. */
const HEADLINE_AT_LIMIT = 'High yield credit spreads widened for a fifth session'.padEnd(120, '.');
const HEADLINE_OVER_LIMIT = `${HEADLINE_AT_LIMIT}!`;

function attentionItem(overrides) {
  return Object.assign({
    contractVersion: 'decision-attention/v1',
    rank: 1,
    domain: 'credit / funding',
    horizon: 'this-week',
    title: 'High yield credit spreads widened for a fifth straight session',
    headline: 'High yield credit spreads widened for a fifth straight session',
    structuralAnchor: 'The high yield minus treasury spread, measured over five sessions.',
    what: 'The spread widened by eighteen basis points over five sessions.',
    why: 'A wider spread raises the refinancing cost for leveraged issuers.',
    confidence: 57,
    deepLink: 'market-heatmap-lab.html',
    subject: 'HYG',
    disposition: 'attention',
    severity: 'moderate',
    imminence: 'imminent',
    verb: 'monitor',
    rationale: 'The widening has persisted across five consecutive sessions.',
    invalidation: 'The spread retraces below eight basis points of its five session start.',
    escalationTrigger: 'The spread widens beyond thirty five basis points intraday.',
    expiry: '2026-08-13T20:00:00.000Z',
    decisionWindow: 'pre-close',
    transmissionPath: ['credit-funding'],
    transmissionAbsenceNote: null,
    marketConfirmation: { state: 'present', detail: 'The spread widened over five sessions.' },
    marketConfirmationNote: null,
    figures: [{
      label: 'spread change',
      value: 'plus eighteen basis points',
      provenance: { sourceId: 'market-heatmap-lab', asOf: '2026-08-05T20:00:00.000Z' }
    }],
    observedAt: '2026-08-06T14:30:00.000Z',
    state: 'qualified'
  }, overrides || {});
}

function withoutField(item, field) {
  const copy = { ...item };
  delete copy[field];
  return copy;
}

/* A payload shaped well enough that the OTHER section gates are not the
   subject of these assertions. Every assertion below filters down to the
   attention branch, so unrelated errors from other sections are harmless. */
function payloadWithAttention(attention) {
  return {
    toolId: 'market-brief',
    generatedAt: '2026-08-06T14:30:00.000Z',
    asOf: '2026-08-06T14:30:00.000Z',
    dataAsOf: {
      bars: '2026-08-06T14:30:00.000Z',
      options: '2026-08-06T14:14:00.000Z',
      macro: '2026-08-06T12:00:00.000Z',
      events: '2026-08-06T12:00:00.000Z'
    },
    regime: { bias: 'neutral', note: 'Calm tape, narrow participation.', vix: { level: 15.85 } },
    backdrop: {
      primaryTrend: 'Bull stacked averages.',
      macroCycle: 'Late cycle, easing bias.',
      pricedIn: 'A soft landing is largely priced.',
      asymmetry: 'Downside is cheaper than upside here.',
      trendEvidence: 'Twenty over fifty over two hundred.',
      globalBackdrop: 'Developed markets are broadly aligned.',
      whatWouldChangeIt: 'A close below the fifty day average.',
      structuralLevels: { fiftyDay: 745.6, twoHundredDay: 699 }
    },
    nextSession: { sessionDate: '2026-08-07', thesis: 'Hold the core into the jobs report.', actions: [] },
    toolCoverage: [],
    toolReads: {},
    attention,
    recommendations: [],
    events: [{ title: 'Jobs report', when: '2026-08-07' }],
    groups: [{ id: 'core', label: 'Core' }],
    watchlistNotes: { SPY: 'Hold.' },
    experimental: []
  };
}

const CONFIG = Object.freeze({ thresholds: { attentionMaxCards: 7 } });
const REGISTRY = Object.freeze({ tools: [] });

/* ── refusal-list extraction ─────────────────────────────────────────────── */

/* The house pattern the actions branch already uses is
   `nextSession.actions[${index}].${field}`; the attention branch owes the
   reader the same `attention[${index}].${field}` naming. */
const ATTENTION_FIELD_RE = /attention\[(\d+)\]\.([A-Za-z][A-Za-z0-9]*)/;

/* reader-vocabulary leaks are a DIFFERENT gate with a different owner; they
   are excluded so this suite compares the attention predicate against the
   attention predicate and nothing else. */
function publishedAttentionRefusals(errors) {
  return errors
    .filter((error) => !error.startsWith('reader-vocabulary:'))
    .map((error) => ATTENTION_FIELD_RE.exec(error))
    .filter((match) => match !== null)
    .map((match) => `attention[${match[1]}].${match[2]}`);
}

function publishedFieldsNamed(errors) {
  return new Set(publishedAttentionRefusals(errors));
}

function moduleAttentionRefusals(items, context) {
  const refusals = [];
  items.forEach((item, index) => {
    const verdict = RLATTN.validateAttentionItem(item, context);
    verdict.violations.forEach((violation) => {
      refusals.push(`attention[${index}].${violation.field}`);
    });
  });
  return refusals;
}

function violationFields(verdict) {
  return verdict.violations.map((violation) => violation.field);
}

/* ────────────────────────────────────────────────────────────────────────── */

test('SCN-017-025 The publication path refuses an over-length headline and a missing invalidation', () => {
  /* the ceiling is the production module's, re-derived here rather than
     asserted as a constant: 120 characters passes, 121 refuses. */
  assert.equal(HEADLINE_AT_LIMIT.length, 120, 'the boundary fixture must be exactly at the ceiling');
  assert.equal(HEADLINE_OVER_LIMIT.length, 121, 'the over-limit fixture must be exactly one past the ceiling');

  const moduleAtLimit = RLATTN.validateAttentionItem(attentionItem({ headline: HEADLINE_AT_LIMIT }), {});
  const moduleOverLimit = RLATTN.validateAttentionItem(attentionItem({ headline: HEADLINE_OVER_LIMIT }), {});
  assert.ok(
    !violationFields(moduleAtLimit).includes('headline'),
    'the capability module accepts a headline of exactly 120 characters — the fixture boundary is real'
  );
  assert.ok(
    violationFields(moduleOverLimit).includes('headline'),
    'the capability module refuses a headline of 121 characters — the fixture boundary is real'
  );

  /* 1. an over-length headline on the publication path. */
  const overLimitErrors = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem({ headline: HEADLINE_OVER_LIMIT })]), REGISTRY, CONFIG, null
  );
  assert.ok(
    publishedFieldsNamed(overLimitErrors).has('attention[0].headline'),
    'a 121-character headline must be refused by name as attention[0].headline, not merely counted against a card cap. '
      + `Published errors naming an attention field: ${JSON.stringify(publishedAttentionRefusals(overLimitErrors))}`
  );
  assert.ok(overLimitErrors.length > 0, 'the over-length run must exit non-zero');

  /* the boundary holds on the publication path too: 120 characters publishes. */
  const atLimitErrors = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem({ headline: HEADLINE_AT_LIMIT })]), REGISTRY, CONFIG, null
  );
  assert.ok(
    !publishedFieldsNamed(atLimitErrors).has('attention[0].headline'),
    'a headline of exactly 120 characters is inside the ceiling and must not be refused'
  );

  /* 2. a missing invalidation on the publication path. */
  const noInvalidation = withoutField(attentionItem(), 'invalidation');
  assert.equal(
    Object.prototype.hasOwnProperty.call(noInvalidation, 'invalidation'), false,
    'the fixture genuinely omits the invalidation key'
  );
  const missingErrors = briefContract.validateBriefPayload(
    payloadWithAttention([noInvalidation]), REGISTRY, CONFIG, null
  );
  assert.ok(
    publishedFieldsNamed(missingErrors).has('attention[0].invalidation'),
    'a claim that cannot be invalidated must be refused by name as attention[0].invalidation. '
      + `Published errors naming an attention field: ${JSON.stringify(publishedAttentionRefusals(missingErrors))}`
  );
  assert.ok(missingErrors.length > 0, 'the missing-invalidation run must exit non-zero');

  /* and the other side of that boundary: a present invalidation is not refused. */
  const presentErrors = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem()]), REGISTRY, CONFIG, null
  );
  assert.ok(
    !publishedFieldsNamed(presentErrors).has('attention[0].invalidation'),
    'an item that carries an invalidation must not be refused for its invalidation'
  );
});

test('SCN-017-026 The validator and the browser apply the identical predicate on one fixture', () => {
  /* the browser predicate: exactly what a tool page reaches through the
     RLATTN global, because both UMD branches expose the same frozen api. */
  const browserPredicate = RLATTN.validateAttentionItem;
  assert.equal(typeof browserPredicate, 'function');

  /* FUNCTION IDENTITY, not merely equal verdicts. The publication path must
     hold a reference to the capability module's own function; a second
     hand-written copy that happens to agree today is exactly the drift this
     scenario exists to forbid, so nothing short of === is accepted. */
  const identityExports = Object.entries(briefContract)
    .filter(([, value]) => value === browserPredicate)
    .map(([name]) => name);
  assert.ok(
    identityExports.length >= 1,
    'scripts/validate-brief-payload.mjs must expose the attention predicate it uses, and that predicate must BE '
      + 'RLATTN.validateAttentionItem (===), not a re-implementation. '
      + `Exports of the brief contract module: ${JSON.stringify(Object.keys(briefContract))}`
  );
  const validatorPredicate = briefContract[identityExports[0]];
  assert.strictEqual(
    validatorPredicate, browserPredicate,
    'the validator predicate and the browser predicate must resolve to one module function, not two copies'
  );

  /* one shared fixture, two ordered defects across two cards. */
  const sharedFixture = Object.freeze([
    attentionItem({ headline: HEADLINE_OVER_LIMIT }),
    withoutField(attentionItem({ rank: 2, subject: 'TLT', title: 'Long duration liquidity thins' }), 'invalidation')
  ]);

  const browserRefusals = moduleAttentionRefusals(sharedFixture, {});
  assert.ok(
    browserRefusals.length > 0,
    'the shared fixture must actually be refused, otherwise the comparison below is vacuous'
  );

  const publishedErrors = briefContract.validateBriefPayload(
    payloadWithAttention(sharedFixture.map((item) => ({ ...item }))), REGISTRY, CONFIG, null
  );
  const publishedRefusals = publishedAttentionRefusals(publishedErrors);

  /* same verdict … */
  assert.equal(
    publishedRefusals.length > 0, browserRefusals.length > 0,
    'the publication path and the browser path must reach the same verdict on one shared fixture'
  );

  /* … and the same ordered refusal list, element by element. */
  browserRefusals.forEach((expected, index) => {
    assert.equal(
      publishedRefusals[index], expected,
      `refusal ${index} must match element-by-element. `
        + `Published: ${JSON.stringify(publishedRefusals)} Browser: ${JSON.stringify(browserRefusals)}`
    );
  });
  assert.deepStrictEqual(
    publishedRefusals, browserRefusals,
    'the two paths must produce one identical ordered refusal list, in the module\'s own order'
  );
});

test('SCN-017-027 Existing attention consumers still parse the payload unchanged', () => {
  /* the REAL committed artifact, read from disk. */
  const payload = JSON.parse(readFileSync(PAYLOAD_PATH, 'utf8'));
  assert.ok(Array.isArray(payload.attention), 'the committed payload carries an attention array');
  assert.ok(payload.attention.length > 0, 'the committed payload carries at least one attention card');

  payload.attention.forEach((item, index) => {
    /* HALF ONE — every pre-existing key survives the migration, by name, by
       type and by value. A rename of `title` to `headline` breaks here. */
    const legacyRecord = legacyAttentionConsumer(item);
    for (const key of LEGACY_ATTENTION_KEYS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(item, key),
        `attention[${index}].${key} is a pre-existing consumer key and must survive the migration`
      );
      assert.equal(
        typeof item[key], LEGACY_ATTENTION_TYPES[key],
        `attention[${index}].${key} must keep its original ${LEGACY_ATTENTION_TYPES[key]} type`
      );
      assert.equal(
        legacyRecord[key], item[key],
        `attention[${index}].${key} must keep its original value when read by a pre-existing consumer`
      );
    }
    assert.ok(Number.isInteger(item.rank) && item.rank > 0, `attention[${index}].rank stays a positive integer rank`);
    assert.ok(Number.isFinite(item.confidence), `attention[${index}].confidence stays a finite number`);
    assert.ok(item.deepLink.trim().length > 0, `attention[${index}].deepLink stays a non-empty link`);

    /* the pre-migration reader sees an identical record whether it is handed
       the nine-key projection or the full item: the new keys are additive and
       invisible to it. */
    assert.deepStrictEqual(
      legacyAttentionConsumer(legacyRecord), legacyAttentionConsumer(item),
      `attention[${index}] must parse identically before and after the attention keys were added`
    );

    /* HALF TWO — the card now carries the decision-attention/v1 field set. */
    assert.equal(
      item.contractVersion, RLATTN.CONTRACT_VERSION,
      `attention[${index}].contractVersion must declare ${RLATTN.CONTRACT_VERSION}`
    );
    for (const key of ['escalationTrigger', 'invalidation', 'expiry', 'decisionWindow']) {
      assert.equal(
        typeof item[key], 'string',
        `attention[${index}].${key} is required by ${RLATTN.CONTRACT_VERSION}`
      );
      assert.ok(
        item[key].trim().length > 0,
        `attention[${index}].${key} must carry text, not an empty marker`
      );
    }
    assert.ok(
      RLATTN.DECISION_WINDOWS.includes(item.decisionWindow),
      `attention[${index}].decisionWindow must be one of ${JSON.stringify(RLATTN.DECISION_WINDOWS)}`
    );
    assert.ok(
      Array.isArray(item.transmissionPath),
      `attention[${index}].transmissionPath is required by ${RLATTN.CONTRACT_VERSION}`
    );
    assert.ok(
      Array.isArray(item.figures),
      `attention[${index}].figures is required by ${RLATTN.CONTRACT_VERSION}`
    );
    item.figures.forEach((figure, figureIndex) => {
      assert.ok(
        figure.provenance && typeof figure.provenance.sourceId === 'string' && figure.provenance.sourceId.trim().length > 0,
        `attention[${index}].figures[${figureIndex}] must name its provenance class — an unprovenanced figure does not render`
      );
    });
  });
});

test('SCN-017-045 The authoring instruction names every required attention field', () => {
  const source = readFileSync(NARRATIVE_LANE_PATH, 'utf8');

  /* the lane that OWNS attention, located by its declared keys. */
  const laneChunks = source.split(/keys:\s*\[/);
  const attentionLane = laneChunks.find((chunk) => /^[^\]]*'attention'/.test(chunk));
  assert.ok(attentionLane, 'the narrative lane that owns the attention key must be locatable in the source');

  const instructionMatch = /instructions:\s*`([\s\S]*?)`/.exec(attentionLane);
  assert.ok(instructionMatch, 'the attention lane must carry an authoring instruction');
  const instruction = instructionMatch[1];

  /* only the sentences that instruct the author about ATTENTION count. The
     lane also owns recommendations and events, and those sentences already
     say words like "invalidation" for a different section — borrowing them
     would make this guard unable to fail. */
  const attentionInstruction = instruction
    .split(/(?<=\.)\s+/)
    .filter((sentence) => /\battention\b/i.test(sentence))
    .join(' ');
  assert.ok(
    attentionInstruction.trim().length > 0,
    'the attention lane must instruct the author about attention specifically'
  );

  /* each required field is asserted SEPARATELY, so dropping any single one
     fails on its own line and names itself. */
  const REQUIRED_INSTRUCTION_TERMS = [
    ['escalation trigger', /escalation trigger/i],
    ['invalidation', /\binvalidation\b/i],
    ['expiry', /\bexpir(?:y|ation)\b/i],
    ['decision window', /decision window/i],
    ['transmission path', /transmission path/i],
    ['provenance class', /provenance class/i]
  ];

  for (const [label, pattern] of REQUIRED_INSTRUCTION_TERMS) {
    assert.match(
      attentionInstruction, pattern,
      `the attention authoring instruction must name the ${label}. `
        + `An author who is never told to write it will never write it, and the publication gate will refuse every card. `
        + `Current attention instruction: ${JSON.stringify(attentionInstruction)}`
    );
  }
});

/* ══════════════════════════════════════════════════════════════════════════
 * Feature 017 Scope 04 — outcome record and interruption rate.
 * TP-04-01 … TP-04-07 (SCN-017-033 … SCN-017-039).
 *
 * Scope 01 shipped the pure lifecycle: rlattention.js can escalate an item,
 * derive its outcome record, and compute an interruption rate. Nothing PERSISTS
 * any of it. There is no append-only outcome ledger, no reducer, and therefore
 * no published answer to the only question that keeps an interruption feed
 * honest: of the times this tier stopped the reader, how often was it right?
 *
 * A tier that interrupts four times a day and never counts its own false alarms
 * is a notification channel wearing a research badge. FR-025 to FR-029 make the
 * count exist; FR-027 keeps it strictly disjoint from the recommendation record,
 * because merging the two would corrupt the one number this project already
 * publishes about itself.
 *
 * These seven tests are written RED, against the contract the scope declares:
 *
 *   market-brief.attention-outcomes.jsonl   append-only, one record per
 *                                           terminated item, corrections append
 *                                           with `correctionOf`
 *   scripts/build-attention-scorecard.mjs   the reducer, mirroring the export
 *                                           shape of scripts/build-scorecard.mjs
 *   market-brief.attention-scorecard.json   the reduced record
 *
 * Every fixture record below is derived by the REAL frozen module — the item is
 * walked through real lifecycle edges and closed by deriveOutcomeRecord. No
 * fixture carries a hand-written verdict, an outcome class the module did not
 * accept, or a state the module did not reach. Nothing is mocked. No clock, no
 * randomness, no network.
 * ══════════════════════════════════════════════════════════════════════════ */

const ATTENTION_BUILDER_PATH = resolve(ROOT, 'scripts/build-attention-scorecard.mjs');
const RECOMMENDATION_LEDGER_DIR = 'briefs/history/recommendations';
const RECOMMENDATION_SCORECARD = 'market-brief.scorecard.json';

/* both derived from the frozen module rather than restated as magic numbers,
   so a change to the published limits moves these fixtures with it. */
const MIN_CLOSED_SAMPLE = RLATTN.computeInterruptionRate([], null, null).minClosedSample;
const ATTENTION_CAP = RLATTN.selectAttentionItems([], null).cap;

const ASOF = '2026-08-06T20:00:00.000Z';

async function loadAttentionBuilder() {
  assert.ok(
    existsSync(ATTENTION_BUILDER_PATH),
    'scripts/build-attention-scorecard.mjs must exist. It is the reducer that turns the append-only attention '
      + 'outcome ledger into market-brief.attention-scorecard.json. Until it exists this tier publishes '
      + 'interruptions that it never has to answer for, which is the one thing FR-025 to FR-029 forbid.'
  );
  const mod = await import(pathToFileURL(ATTENTION_BUILDER_PATH).href);
  for (const [name, kind] of [
    ['ATTENTION_LEDGER_PATH', 'string'],
    ['ATTENTION_SCORECARD_PATH', 'string'],
    ['readAttentionLedger', 'function'],
    ['appendOutcomeRecord', 'function'],
    ['buildAttentionScorecard', 'function'],
    ['runBuildAttentionScorecard', 'function']
  ]) {
    assert.equal(
      typeof mod[name], kind,
      `the attention reducer must export ${name} as a ${kind}, mirroring scripts/build-scorecard.mjs. `
        + `Exports found: ${JSON.stringify(Object.keys(mod))}`
    );
  }
  assert.equal(mod.ATTENTION_LEDGER_PATH, 'market-brief.attention-outcomes.jsonl');
  assert.equal(mod.ATTENTION_SCORECARD_PATH, 'market-brief.attention-scorecard.json');
  return mod;
}

/* ── fixture construction through the real lifecycle ─────────────────────── */

/* every route is a sequence of edges the frozen module actually declares; a
   route the module refuses fails the fixture builder rather than the assertion,
   so a broken fixture can never be mistaken for a broken implementation. */
const LIFECYCLE_ROUTES = Object.freeze({
  resolved: Object.freeze(['acknowledged', 'monitoring', 'resolved']),
  escalated: Object.freeze(['escalated']),
  stale: Object.freeze(['stale']),
  superseded: Object.freeze(['superseded'])
});

/* the terminal state each outcome class is reached through. `confirmed` and
   `resolved` both settle a live development; `expired-without-effect` is the
   item that went stale having never mattered. */
const OUTCOME_TERMINAL_STATE = Object.freeze({
  confirmed: 'resolved',
  resolved: 'resolved',
  escalated: 'escalated',
  'expired-without-effect': 'stale'
});

/* deterministic cycle: three of every four closures were effective, so a full
   bucket rates 0.75 — neither a degenerate 0 nor a degenerate 1. */
const OUTCOME_CYCLE = Object.freeze(['confirmed', 'resolved', 'escalated', 'expired-without-effect']);

function walkToTerminal(item, terminalState, successorRef) {
  const route = LIFECYCLE_ROUTES[terminalState];
  assert.ok(route, `the fixture builder has no declared route to ${terminalState}`);
  let current = item;
  route.forEach((to, hop) => {
    const event = {
      to,
      at: `2026-07-02T${String(10 + hop).padStart(2, '0')}:00:00.000Z`,
      condition: `The declared condition for the ${to} edge was observed.`
    };
    if (to === 'superseded') event.ref = successorRef;
    const applied = RLATTN.applyAttentionLifecycleEvent(current, event);
    assert.equal(
      applied.ok, true,
      `the fixture must reach ${terminalState} through real declared edges. Refused at hop ${hop} (${to}): `
        + `${JSON.stringify(applied)}`
    );
    current = applied.item;
  });
  assert.equal(current.state, terminalState, 'the fixture item must actually be in its terminal state');
  return current;
}

function ledgerLine(spec) {
  const terminalState = spec.superseded ? 'superseded' : OUTCOME_TERMINAL_STATE[spec.outcomeClass];
  const item = attentionItem({
    id: spec.id,
    subject: spec.subject,
    decisionWindow: spec.decisionWindow,
    transmissionPath: [spec.channel],
    observedAt: '2026-07-01T13:00:00.000Z',
    state: 'qualified'
  });
  const terminated = walkToTerminal(item, terminalState, spec.superseded ? `${spec.id}-successor` : null);
  const derived = RLATTN.deriveOutcomeRecord(terminated, {
    closedAt: '2026-07-03T13:00:00.000Z',
    outcomeClass: spec.outcomeClass,
    note: `The item closed as ${spec.outcomeClass}.`
  });
  assert.equal(derived.ok, true, `the frozen module must derive this outcome record: ${JSON.stringify(derived)}`);
  /* the ledger line is the derived record plus the transmission channel the
     byChannel breakdown groups on; the derived record does not carry it. */
  return { ...derived.record, channel: spec.channel };
}

function ledgerRows(count, shape) {
  return Array.from({ length: count }, (_, index) => ledgerLine({
    id: `${shape.idPrefix}-${String(index + 1).padStart(3, '0')}`,
    subject: shape.subject,
    decisionWindow: shape.decisionWindow,
    channel: shape.channel,
    superseded: shape.superseded === true,
    outcomeClass: shape.superseded === true ? 'resolved' : OUTCOME_CYCLE[index % OUTCOME_CYCLE.length]
  }));
}

function effectiveCountOf(rows) {
  return rows.filter((row) => row.outcomeClass !== 'expired-without-effect').length;
}

/* ── staged roots: a faithful miniature of the repository ────────────────── */

function stageRoot(t, label) {
  const root = mkdtempSync(join(tmpdir(), `research-lab-scn017-${label}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  mkdirSync(join(root, RECOMMENDATION_LEDGER_DIR), { recursive: true });
  const shards = readdirSync(join(ROOT, RECOMMENDATION_LEDGER_DIR));
  assert.ok(shards.length > 0, 'the real recommendation ledger must have shards to copy, otherwise 038 proves nothing');
  for (const shard of shards) {
    copyFileSync(join(ROOT, RECOMMENDATION_LEDGER_DIR, shard), join(root, RECOMMENDATION_LEDGER_DIR, shard));
  }
  for (const file of [RECOMMENDATION_SCORECARD, 'market-brief.config.json', 'market-brief.payload.json']) {
    copyFileSync(join(ROOT, file), join(root, file));
  }
  return root;
}

function writeAttentionLedger(root, ledgerPath, rows) {
  writeFileSync(join(root, ledgerPath), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, 'utf8');
}

function digestOf(absolutePath) {
  return createHash('sha256').update(readFileSync(absolutePath)).digest('hex');
}

function snapshotTree(root) {
  const digests = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      if (statSync(abs).isDirectory()) walk(abs);
      else digests.set(relative(root, abs), digestOf(abs));
    }
  };
  walk(root);
  return digests;
}

/* every path whose bytes differ between the two snapshots, in either direction:
   created, rewritten or deleted. That is the enumeration of writes. */
function writesBetween(before, after) {
  const written = new Set();
  for (const [path, digest] of after) {
    if (!before.has(path) || before.get(path) !== digest) written.add(path);
  }
  for (const path of before.keys()) if (!after.has(path)) written.add(path);
  return [...written].sort();
}

function overallOf(card) {
  assert.ok(
    card && typeof card === 'object' && card.overall && typeof card.overall === 'object',
    `the attention scorecard must carry an overall record. Received: ${JSON.stringify(card)}`
  );
  return card.overall;
}

/* ────────────────────────────────────────────────────────────────────────── */

test('SCN-017-033 Escalation produces one live surface rather than two', () => {
  const published = attentionItem({ id: 'AT-017-033', subject: 'HYG', state: 'qualified' });

  /* the item is genuinely live on the attention surface BEFORE the transition.
     Without this, the assertion after the transition could be satisfied by an
     item that was never published at all. */
  const beforeEscalation = RLATTN.selectAttentionItems([published], ATTENTION_CAP).published
    .filter((item) => item.id === 'AT-017-033');
  assert.equal(
    beforeEscalation.length, 1,
    'the fixture must be live on the attention surface before it is escalated, otherwise this scenario is vacuous'
  );

  /* a REAL transition through the frozen module, not a hand-set state field. */
  const transition = RLATTN.applyAttentionLifecycleEvent(published, {
    to: 'escalated',
    at: '2026-08-06T15:00:00.000Z',
    condition: 'The declared escalation trigger was met and the alert admission bar cleared.'
  });
  assert.equal(transition.ok, true, `escalation is a declared edge from qualified: ${JSON.stringify(transition)}`);
  assert.equal(transition.item.state, 'escalated', 'the transition must land the item in the escalated state');
  assert.deepStrictEqual(
    RLATTN.ATTENTION_LIFECYCLE_TRANSITIONS.escalated, [],
    'escalated is terminal — nothing leaves it, so the attention tier has no further live role for the item'
  );
  const history = transition.item.lifecycle;
  assert.equal(
    history[history.length - 1].to, 'escalated',
    'the escalation must be recorded in the append-only lifecycle history'
  );

  /* GIVEN, per UC-017-007 step 2: the Red Alert view publishes the alert under
     its own unchanged gates. That is this scenario's precondition, not its
     assertion — the assertion below is about the tier that must now stand down. */
  const redAlertLiveCount = 1;

  /* WHEN the surfaces are enumerated. A surface is live if it would RENDER the
     situation to a reader, and for this tier that is exactly what
     selectAttentionItems publishes. Defining "live" as "published AND not in a
     terminal state" would define the duplicate away instead of detecting it. */
  const attentionLive = RLATTN.selectAttentionItems([transition.item], ATTENTION_CAP).published
    .filter((item) => item.id === 'AT-017-033');

  const liveSurfaces = [['decision-attention', attentionLive.length], ['red-alert', redAlertLiveCount]]
    .filter(([, count]) => count > 0)
    .map(([surface]) => surface);

  assert.deepStrictEqual(
    liveSurfaces, ['red-alert'],
    'exactly one live surface may represent one situation. An escalated item that the attention tier still '
      + 'publishes is the same development counted twice — the reader is interrupted for it on the alert surface '
      + 'and again on the attention surface. '
      + `Live surfaces after the transition: ${JSON.stringify(liveSurfaces)}`
  );
  assert.equal(
    attentionLive.length, 0,
    'the escalated item must no longer be presented as separately live on the attention surface. '
      + `selectAttentionItems still publishes it: ${JSON.stringify(attentionLive.map((item) => item.id))}`
  );
});

test('SCN-017-034 Exactly one outcome record exists per terminated item', async (t) => {
  const mod = await loadAttentionBuilder();
  const root = stageRoot(t, '034');

  const record = ledgerLine({
    id: 'AT-017-034',
    subject: 'HYG',
    decisionWindow: 'pre-close',
    channel: 'credit-funding',
    outcomeClass: 'confirmed'
  });
  assert.equal(record.itemId, 'AT-017-034', 'the derived record must identify its item');
  assert.equal(record.state, 'resolved', 'the fixture item genuinely reached a terminal state');

  const first = mod.appendOutcomeRecord(root, record);
  assert.equal(first.ok, true, `the first append of a terminated item must succeed: ${JSON.stringify(first)}`);
  assert.equal(
    typeof first.record.recordId, 'string',
    'a stored ledger record must carry its own identity, otherwise a correction has nothing to reference'
  );
  assert.ok(first.record.recordId.length > 0, 'the stored record identity must not be empty');

  const afterFirst = mod.readAttentionLedger(root).filter((row) => row.itemId === 'AT-017-034');
  assert.equal(
    afterFirst.length, 1,
    `exactly one record exists for a terminated item. Found ${afterFirst.length}: ${JSON.stringify(afterFirst)}`
  );

  /* a second append of the SAME terminated item is a duplicate, not a
     correction: it must be refused at write time and must not reach the file. */
  const duplicate = mod.appendOutcomeRecord(root, record);
  assert.equal(
    duplicate.ok, false,
    'a second outcome record for the same terminated item must be refused at write time — "exactly one" is the '
      + `invariant, not "at least one". Received: ${JSON.stringify(duplicate)}`
  );
  const afterDuplicate = mod.readAttentionLedger(root).filter((row) => row.itemId === 'AT-017-034');
  assert.equal(
    afterDuplicate.length, 1,
    `the refused duplicate must not have been written. Ledger now: ${JSON.stringify(afterDuplicate)}`
  );

  /* a CORRECTION is a new line referencing the line it corrects. It never
     rewrites the original, so both survive and the original is unchanged. */
  const correction = mod.appendOutcomeRecord(root, {
    ...record,
    outcomeClass: 'expired-without-effect',
    note: 'On review the widening never transmitted; the original class was wrong.',
    correctionOf: first.record.recordId
  });
  assert.equal(correction.ok, true, `a correction that references its original must append: ${JSON.stringify(correction)}`);

  const afterCorrection = mod.readAttentionLedger(root).filter((row) => row.itemId === 'AT-017-034');
  assert.equal(
    afterCorrection.length, 2,
    `a correction appends a second line rather than replacing the first. Ledger: ${JSON.stringify(afterCorrection)}`
  );

  const corrections = afterCorrection.filter((row) => row.correctionOf === first.record.recordId);
  assert.equal(
    corrections.length, 1,
    'the correction must carry a reference to the record it corrects, by that record\'s identity. '
      + `Rows carrying correctionOf === ${JSON.stringify(first.record.recordId)}: ${JSON.stringify(corrections)}`
  );
  assert.equal(corrections[0].outcomeClass, 'expired-without-effect', 'the correction carries the corrected class');

  const originals = afterCorrection.filter((row) => row.recordId === first.record.recordId);
  assert.equal(originals.length, 1, 'the original line must still be present after the correction');
  assert.deepStrictEqual(
    originals[0], first.record,
    'the original line must be byte-for-byte the record that was stored — an append-only ledger never edits a '
      + `prior line. Stored: ${JSON.stringify(first.record)} Read back: ${JSON.stringify(originals[0])}`
  );
});

test('SCN-017-035 Superseded items are excluded from the evaluable denominator', async (t) => {
  const mod = await loadAttentionBuilder();
  const root = stageRoot(t, '035');

  /* BOTH kinds are present. A fixture with zero superseded items would pass
     against an implementation that never excludes anything. */
  const evaluable = ledgerRows(22, {
    idPrefix: 'AT-035-EVAL', subject: 'HYG', decisionWindow: 'pre-close', channel: 'credit-funding'
  });
  const superseded = ledgerRows(4, {
    idPrefix: 'AT-035-SUP', subject: 'TLT', decisionWindow: 'pre-close', channel: 'credit-funding', superseded: true
  });
  assert.equal(evaluable.length, 22);
  assert.equal(superseded.length, 4);
  assert.ok(
    superseded.every((row) => row.state === 'superseded' && typeof row.supersededBy === 'string'),
    'the superseded fixtures must genuinely be closed by a named successor, as the module records it'
  );
  assert.ok(
    evaluable.every((row) => row.state !== 'superseded'),
    'the evaluable fixtures must genuinely not be superseded'
  );

  writeAttentionLedger(root, mod.ATTENTION_LEDGER_PATH, [...evaluable, ...superseded]);
  const overall = overallOf(mod.buildAttentionScorecard(root, { asOf: ASOF }));

  assert.equal(
    overall.closedSample, 22,
    'the superseded items must be absent from the evaluable denominator. A supersession is a bookkeeping close, '
      + 'not evidence that the interruption was warranted, and counting it inflates the rate. '
      + `Denominator: ${overall.closedSample}, expected 22 of the 26 ledger rows.`
  );
  assert.equal(
    overall.supersededCount, 4,
    `the superseded items must be reported separately as their own count. Received: ${JSON.stringify(overall)}`
  );
  assert.ok(overall.supersededCount > 0, 'the separate count must be non-zero, otherwise this fixture proves nothing');
  assert.equal(
    overall.closedSample + overall.supersededCount, 26,
    'every ledger row is either evaluable or reported as superseded; none may be silently dropped'
  );

  const expectedEffective = effectiveCountOf(evaluable);
  assert.equal(expectedEffective, 17, 'the deterministic outcome cycle yields 17 effective closures in 22 rows');
  assert.equal(overall.effectiveCount, 17, `the effective count must exclude superseded rows: ${JSON.stringify(overall)}`);
  assert.equal(overall.rate, 17 / 22, `the rate is computed on the evaluable denominator only: ${overall.rate}`);
});

test('SCN-017-036 Below the minimum closed sample the rate is withheld', async (t) => {
  const mod = await loadAttentionBuilder();
  assert.equal(MIN_CLOSED_SAMPLE, 20, 'the published minimum closed sample is twenty');

  const shape = {
    idPrefix: 'AT-036', subject: 'HYG', decisionWindow: 'pre-close', channel: 'credit-funding'
  };

  /* BELOW the boundary: exactly one short of the minimum. */
  const belowRoot = stageRoot(t, '036-below');
  const belowRows = ledgerRows(MIN_CLOSED_SAMPLE - 1, shape);
  assert.equal(belowRows.length, 19);
  writeAttentionLedger(belowRoot, mod.ATTENTION_LEDGER_PATH, belowRows);
  const below = overallOf(mod.buildAttentionScorecard(belowRoot, { asOf: ASOF }));

  assert.equal(
    below.rate, null,
    'below the minimum closed sample the rate is withheld as null. A hit rate over nineteen closures is noise '
      + `dressed as evidence, and a flattering zero would be worse. Received: ${JSON.stringify(below)}`
  );
  assert.equal(below.insufficientSample, true, `the insufficient-sample marker must be true: ${JSON.stringify(below)}`);
  assert.equal(below.closedSample, 19, 'the sample size is shown in place of the withheld rate');
  assert.equal(below.minClosedSample, MIN_CLOSED_SAMPLE, 'the record states the minimum it was measured against');

  /* AT the boundary: exactly the minimum publishes. Without this half an
     implementation that withholds unconditionally would pass. */
  const atRoot = stageRoot(t, '036-at');
  const atRows = ledgerRows(MIN_CLOSED_SAMPLE, shape);
  assert.equal(atRows.length, 20);
  writeAttentionLedger(atRoot, mod.ATTENTION_LEDGER_PATH, atRows);
  const atBoundary = overallOf(mod.buildAttentionScorecard(atRoot, { asOf: ASOF }));

  assert.equal(
    atBoundary.insufficientSample, false,
    `at exactly the minimum the sample is sufficient: ${JSON.stringify(atBoundary)}`
  );
  assert.equal(atBoundary.closedSample, 20, 'the boundary sample size is twenty');
  assert.equal(
    atBoundary.rate, 15 / 20,
    'at exactly the minimum the rate is published. The deterministic outcome cycle makes fifteen of twenty '
      + `closures effective, so the rate is 0.75. Received: ${atBoundary.rate}`
  );
});

test('SCN-017-037 The two breakdowns withhold independently', async (t) => {
  const mod = await loadAttentionBuilder();
  const root = stageRoot(t, '037');

  /* ONE record, two breakdown families, and in each family one bucket above the
     minimum and one below. The overall sample is 25 — comfortably sufficient —
     so a thin bucket that borrows the parent sample publishes a rate it has not
     earned, and fails here. */
  const fat = ledgerRows(MIN_CLOSED_SAMPLE, {
    idPrefix: 'AT-037-FAT', subject: 'HYG', decisionWindow: 'pre-close', channel: 'credit-funding'
  });
  const thin = ledgerRows(5, {
    idPrefix: 'AT-037-THIN', subject: 'DXY', decisionWindow: 'morning', channel: 'fx-carry'
  });
  assert.equal(fat.length, 20);
  assert.equal(thin.length, 5);
  writeAttentionLedger(root, mod.ATTENTION_LEDGER_PATH, [...fat, ...thin]);

  const card = mod.buildAttentionScorecard(root, { asOf: ASOF });
  const overall = overallOf(card);
  assert.equal(overall.closedSample, 25, 'the parent sample is sufficient — that is what makes this scenario bite');
  assert.equal(overall.insufficientSample, false, 'the parent publishes, so any bucket withholding does so on its own');

  for (const [family, sufficientKey, insufficientKey] of [
    ['byDecisionWindow', 'pre-close', 'morning'],
    ['byChannel', 'credit-funding', 'fx-carry']
  ]) {
    const breakdown = card[family];
    assert.ok(
      breakdown && typeof breakdown === 'object',
      `the record must carry a ${family} breakdown. Received: ${JSON.stringify(Object.keys(card || {}))}`
    );

    const sufficient = breakdown[sufficientKey];
    assert.ok(sufficient, `${family}.${sufficientKey} must be present: ${JSON.stringify(breakdown)}`);
    assert.equal(sufficient.closedSample, 20, `${family}.${sufficientKey} holds twenty closures`);
    assert.equal(
      sufficient.insufficientSample, false,
      `${family}.${sufficientKey} meets the minimum on its own: ${JSON.stringify(sufficient)}`
    );
    assert.equal(
      sufficient.rate, 15 / 20,
      `${family}.${sufficientKey} publishes its own rate. A blanket withhold fails here. Received: ${sufficient.rate}`
    );

    const insufficient = breakdown[insufficientKey];
    assert.ok(insufficient, `${family}.${insufficientKey} must be present: ${JSON.stringify(breakdown)}`);
    assert.equal(insufficient.closedSample, 5, `${family}.${insufficientKey} holds five closures`);
    assert.equal(
      insufficient.insufficientSample, true,
      `${family}.${insufficientKey} is below the minimum on its own: ${JSON.stringify(insufficient)}`
    );
    assert.equal(
      insufficient.rate, null,
      `${family}.${insufficientKey} withholds. A thin bucket must not borrow the parent's sufficient sample. `
        + `Received: ${insufficient.rate}`
    );
  }
});

test('SCN-017-038 There is no write path to the recommendation ledger or the recommendation scorecard', async (t) => {
  const mod = await loadAttentionBuilder();
  const root = stageRoot(t, '038');

  writeAttentionLedger(root, mod.ATTENTION_LEDGER_PATH, ledgerRows(MIN_CLOSED_SAMPLE, {
    idPrefix: 'AT-038', subject: 'HYG', decisionWindow: 'pre-close', channel: 'credit-funding'
  }));

  /* the real repository copy is fingerprinted too: a builder that resolves the
     recommendation scorecard against the process cwd rather than its root would
     escape the staged tree entirely, and the staged comparison alone would miss it. */
  const realScorecardBefore = digestOf(join(ROOT, RECOMMENDATION_SCORECARD));

  const before = snapshotTree(root);
  const result = mod.runBuildAttentionScorecard(root, { asOf: ASOF, log: () => {} });
  assert.equal(result.ok, true, `the generation must actually run: ${JSON.stringify(result)}`);
  const after = snapshotTree(root);

  const writes = writesBetween(before, after);

  /* a builder that writes NOTHING would satisfy "no write targets the
     recommendation ledger" trivially. Prove the run did real work first. */
  assert.ok(
    writes.includes(mod.ATTENTION_SCORECARD_PATH),
    `the generation must have written ${mod.ATTENTION_SCORECARD_PATH}; otherwise this scenario passes vacuously. `
      + `Writes enumerated: ${JSON.stringify(writes)}`
  );

  const ledgerWrites = writes.filter((path) => path.startsWith(`${RECOMMENDATION_LEDGER_DIR}/`));
  assert.deepStrictEqual(
    ledgerWrites, [],
    'no write performed by an attention generation may target the recommendation ledger. The two records are '
      + 'disjoint by construction (FR-027); a single line appended into the recommendation history would corrupt '
      + `the one accuracy number this project already publishes. Writes observed: ${JSON.stringify(writes)}`
  );
  assert.equal(
    writes.includes(RECOMMENDATION_SCORECARD), false,
    `no write may target ${RECOMMENDATION_SCORECARD}. Writes observed: ${JSON.stringify(writes)}`
  );
  assert.equal(
    digestOf(join(ROOT, RECOMMENDATION_SCORECARD)), realScorecardBefore,
    'the generation must not reach outside the root it was given and touch the repository scorecard'
  );

  /* supplementary only — the enumeration above is the evidence. A source that
     never names the file cannot open it by that name either. */
  const builderSource = readFileSync(ATTENTION_BUILDER_PATH, 'utf8');
  assert.equal(
    builderSource.includes(RECOMMENDATION_SCORECARD), false,
    `the attention reducer must not reference ${RECOMMENDATION_SCORECARD} at all`
  );
  assert.equal(
    builderSource.includes(RECOMMENDATION_LEDGER_DIR), false,
    `the attention reducer must not reference ${RECOMMENDATION_LEDGER_DIR} at all`
  );
});

test('SCN-017-039 The recommendation scorecard is byte-identical across a full attention generation', async (t) => {
  const mod = await loadAttentionBuilder();
  const root = stageRoot(t, '039');

  writeAttentionLedger(root, mod.ATTENTION_LEDGER_PATH, ledgerRows(MIN_CLOSED_SAMPLE, {
    idPrefix: 'AT-039', subject: 'HYG', decisionWindow: 'pre-close', channel: 'credit-funding'
  }));

  const stagedScorecard = join(root, RECOMMENDATION_SCORECARD);
  const realScorecard = join(ROOT, RECOMMENDATION_SCORECARD);
  const stagedBefore = digestOf(stagedScorecard);
  const realBefore = digestOf(realScorecard);
  const stagedBytesBefore = readFileSync(stagedScorecard);

  const result = mod.runBuildAttentionScorecard(root, { asOf: ASOF, log: () => {} });
  assert.equal(result.ok, true, `the generation must complete: ${JSON.stringify(result)}`);

  /* the generation genuinely produced its own record — otherwise "unchanged"
     would be the trivially true statement that nothing happened at all. */
  assert.ok(
    existsSync(join(root, mod.ATTENTION_SCORECARD_PATH)),
    `a full generation must produce ${mod.ATTENTION_SCORECARD_PATH}`
  );

  assert.equal(
    digestOf(stagedScorecard), stagedBefore,
    'the recommendation scorecard must be byte-identical after a full attention generation. The two records are '
      + 'presented separately and are never summed or merged; a single byte of drift here means the attention tier '
      + 'has acquired a write path into the recommendation record.'
  );
  assert.ok(
    readFileSync(stagedScorecard).equals(stagedBytesBefore),
    'the recommendation scorecard bytes must compare equal, not merely hash equal'
  );
  assert.equal(
    digestOf(realScorecard), realBefore,
    'the repository recommendation scorecard must also be untouched by a generation run against another root'
  );
});

/* ══════════════════════════════════════════════════════════════════════════
 * Feature 017 Scope 05 — legacy-feed reconciliation and acceptance.
 * ACCEPTANCE suite (SCN-017-040, SCN-017-041, SCN-017-042, SCN-017-044).
 *
 * Three of these four are INVARIANT tests, and an invariant test is the easiest
 * kind to write so that it cannot fail. Each one below therefore carries an
 * explicit non-vacuity proof alongside the invariant it guards:
 *
 *   SCN-017-040  runs the REAL audit as a child process and first proves the
 *                detector FIRES on all four named leak classes, so "zero leaks"
 *                is a measurement and not the silence of a detector that never
 *                looked. It also asserts the audit read a non-trivial amount of
 *                text off the Brief view, so an audit of a blank page cannot
 *                pass as clean.
 *   SCN-017-041  enumerates the view ids from THREE independent shipped sources
 *                and additionally proves the runtime REJECTS a fifth view with
 *                a view-specific refusal code, contrasted against a legal view
 *                id that gets past the same gate and fails on a different code.
 *   SCN-017-042  compares the committed policy against explicit literals
 *                recorded here — never config against itself — and additionally
 *                reads the runtime guard in rlexperience.js, because a
 *                config-only comparison cannot see a loosened enforcement.
 *   SCN-017-044  runs the REAL selftest and carries a positive control: a module
 *                already registered must be found by the same inventory scan
 *                that looks for the new one, so a broken scan fails loudly
 *                instead of reporting a false absence.
 *
 * Nothing here is mocked, stubbed, routed or replayed. Every child process is
 * the real committed script executed against the real committed tree.
 * ══════════════════════════════════════════════════════════════════════════ */

const { spawnSync } = require('node:child_process');

const EXPERIENCE_CONFIG_PATH = resolve(ROOT, 'tool-experience.config.json');
const BRIEF_CONFIG_PATH = resolve(ROOT, 'market-brief.config.json');
const TOOLS_REGISTRY_PATH = resolve(ROOT, 'tools.json');
const MARKET_BRIEF_PAGE_PATH = resolve(ROOT, 'market-brief.html');
const READER_VOCABULARY_PATH = resolve(ROOT, 'scripts/reader-vocabulary.mjs');
const MARKET_ACTION_PATH = resolve(ROOT, 'rlmarketaction.js');
const EXPERIENCE_RUNTIME_PATH = resolve(ROOT, 'rlexperience.js');

function readJson(absolutePath) {
  return JSON.parse(readFileSync(absolutePath, 'utf8'));
}

/* ═══════════════ TP-05-02 — SCN-017-040 reader legibility, zero leaks ═══════════════ */

/* One hostile sentence per leak class the scenario names. These exist to prove the
   DETECTOR fires; they are never published anywhere. If a regex here stopped
   matching, "zero leaks on the real pages" would become an unfalsifiable claim,
   so the capability proof runs FIRST and gates the measurement. */
const READER_LEAK_PROBES = Object.freeze([
  { id: 'contract-version', what: 'contract id',
    text: 'Every item in this tier declares decision-attention/v1 in its header.' },
  { id: 'gate-code', what: 'gate code',
    text: 'The record refused with E012-REGISTRY before it rendered anything.' },
  { id: 'scope-number', what: 'scope number',
    text: 'This tier was delivered in Scope 5 of the attention feature.' },
  { id: 'compute-digest', what: 'digest prefix',
    text: 'The tier fingerprint for this window is sha256:0badc0ffee1234567890.' }
]);

test('SCN-017-040 Reader legibility reports zero leaks across the tier and the record', async () => {
  /* ── GIVEN: the tier and the record are genuinely populated ──────────────
     Asserted, never assumed. A page with no tier would audit clean for the
     uninteresting reason that there was nothing on it to leak. */
  const payload = readJson(PAYLOAD_PATH);
  const decisionAttention = (payload.attention || [])
    .filter((item) => item && item.contractVersion === 'decision-attention/v1');
  assert.ok(
    decisionAttention.length > 0,
    'the committed payload must carry at least one decision-attention/v1 item, otherwise a clean audit proves nothing'
  );

  const pageSource = readFileSync(MARKET_BRIEF_PAGE_PATH, 'utf8');
  assert.ok(
    pageSource.includes('id="decisionAttention"'),
    'market-brief.html must host the decision attention tier, otherwise the audit cannot have read it'
  );
  assert.ok(
    pageSource.includes('id="attentionRecord"'),
    'market-brief.html must host the attention record, otherwise the audit cannot have read it'
  );

  /* ── NON-VACUITY: the detector fires on all four named classes ───────────── */
  const vocabulary = await import(pathToFileURL(READER_VOCABULARY_PATH).href);
  const findLeaks = vocabulary.findReaderVocabularyLeaks;
  assert.equal(
    typeof findLeaks, 'function',
    'the shared reader-vocabulary detector must be importable, otherwise the audit result cannot be interpreted'
  );

  for (const probe of READER_LEAK_PROBES) {
    const found = findLeaks(probe.text, 'Brief').map((leak) => leak.id);
    assert.ok(
      found.includes(probe.id),
      `the detector must catch a ${probe.what} in reader copy (class "${probe.id}"). `
        + `A "zero leaks" result is only meaningful if this class can be detected at all. `
        + `Probe text: ${probe.text} — classes found: ${JSON.stringify(found)}`
    );
  }

  /* clean reader copy must NOT trip any of the four — a detector that flagged
     everything would make the zero-leak result unreachable rather than earned. */
  const cleanCopy = 'High yield credit spreads widened for a fifth straight session, '
    + 'which raises the refinancing cost for leveraged issuers before today\'s close.';
  const cleanFindings = findLeaks(cleanCopy, 'Brief').map((leak) => leak.id);
  for (const probe of READER_LEAK_PROBES) {
    assert.equal(
      cleanFindings.includes(probe.id), false,
      `plain reader copy must not trip the "${probe.id}" class, otherwise the audit could never report zero. `
        + `Classes found: ${JSON.stringify(cleanFindings)}`
    );
  }

  /* ── WHEN: the real audit runs ───────────────────────────────────────────
     --json is the machine-readable surface of the same run; the process exit
     code is identical in both modes. 23 real pages in a real browser is slow
     by construction, hence the generous ceiling. */
  const audit = spawnSync(process.execPath, ['scripts/audit-reader-legibility.mjs', '--json'], {
    cwd: ROOT, encoding: 'utf8', timeout: 900_000, maxBuffer: 96 * 1024 * 1024
  });

  assert.equal(
    audit.error, undefined,
    `the reader legibility audit must run to completion: ${audit.error && audit.error.message}`
  );
  assert.equal(
    audit.status, 0,
    `the reader legibility audit must exit 0. Exit ${audit.status}. stderr: ${(audit.stderr || '').slice(0, 2000)}`
  );

  let report;
  assert.doesNotThrow(() => { report = JSON.parse(audit.stdout); },
    `the audit must emit parseable JSON. First 500 bytes: ${(audit.stdout || '').slice(0, 500)}`);
  assert.equal(
    report.contractVersion, 'reader-legibility-audit/v1',
    'the audit must publish under its declared contract version'
  );

  /* ── THEN: it audited something, and it audited the brief ────────────────── */
  assert.ok(
    Array.isArray(report.report) && report.report.length > 0,
    'the audit must have audited at least one page. An audit that visited nothing reports zero leaks trivially.'
  );

  const brief = report.report.find((entry) => entry.id === 'market-brief');
  assert.ok(
    brief,
    'the audit must have covered market-brief, the page that carries the tier and the record. '
      + `Audited: ${report.report.map((entry) => entry.id).join(', ')}`
  );
  assert.equal(brief.error, null, `market-brief must have audited without error: ${brief.error}`);

  const briefView = brief.views && brief.views.Brief;
  assert.ok(
    briefView,
    `the Brief view carries the tier and the record and must have been reached. Views seen: ${Object.keys(brief.views || {}).join('|')}`
  );
  assert.ok(
    briefView.chars > 1000,
    `the audit must have read substantive reader text off the Brief view, not an empty shell. Read ${briefView.chars} characters.`
  );

  /* ── THEN: zero leaks, and nothing was skipped by erroring out ───────────── */
  const errored = report.report.filter((entry) => entry.error);
  assert.deepStrictEqual(
    errored.map((entry) => `${entry.id}: ${entry.error}`), [],
    'no page may error out of the audit — an errored page contributes zero leaks without having been read'
  );

  const leaksByPage = report.report
    .map((entry) => ({
      id: entry.id,
      leaks: Object.entries(entry.views)
        .flatMap(([view, data]) => data.leaks.map((leak) => `${view}: ${leak.id} -> ${leak.sample}`))
    }))
    .filter((entry) => entry.leaks.length > 0);
  assert.deepStrictEqual(
    leaksByPage, [],
    'the reader legibility audit must report zero leaks: no contract id, gate code, scope number or digest prefix '
      + 'may appear in reader copy anywhere across the tier and the record'
  );

  const totalLeaks = report.report.reduce(
    (total, entry) => total + Object.values(entry.views).reduce((sum, view) => sum + view.leaks.length, 0), 0
  );
  assert.equal(totalLeaks, 0, `total leak count across every audited page and view must be zero, got ${totalLeaks}`);
});

/* ═══════════════ TP-05-03 — SCN-017-041 the view ids remain the existing four ═══════════════ */

/* The four ids, written out here rather than read from the thing under test.
   Every source below is compared against THIS literal, so a fifth view added to
   any one of them fails, and a fifth view added to all of them still fails. */
const EXPECTED_VIEW_IDS = Object.freeze(['brief', 'portfolio', 'red-alert', 'journey']);
const MARKET_ACTION_VIEW_SET_ID = 'market-action-center-four-view/v1';

test('SCN-017-041 The view ids remain the existing four', () => {
  const RLMKT = require(MARKET_ACTION_PATH);
  const experienceConfig = readJson(EXPERIENCE_CONFIG_PATH);
  const registry = readJson(TOOLS_REGISTRY_PATH);

  const viewSet = experienceConfig.viewSets && experienceConfig.viewSets[MARKET_ACTION_VIEW_SET_ID];
  assert.ok(viewSet, `the shipped experience config must declare ${MARKET_ACTION_VIEW_SET_ID}`);

  const marketBrief = (registry.tools || []).find((tool) => tool.id === 'market-brief');
  assert.ok(marketBrief && marketBrief.experience, 'the shipped tool registry must carry the market-brief experience');

  /* THREE independent shipped declarations of the same closed set. They are
     compared against the literal above AND against each other, so a fifth view
     cannot hide by being added consistently in only some of them. */
  const sources = [
    { name: 'tool-experience.config.json viewSets[market-action-center-four-view/v1].viewIds', ids: viewSet.viewIds },
    { name: 'rlmarketaction.js CENTER_VIEW_IDS', ids: RLMKT.CENTER_VIEW_IDS },
    { name: 'tools.json market-brief.experience.viewIds', ids: marketBrief.experience.viewIds }
  ];

  for (const source of sources) {
    assert.ok(Array.isArray(source.ids), `${source.name} must be an array of view ids`);

    /* the COUNT is asserted separately from the membership so an added fifth
       view fails on its own terms and names itself in the message. */
    assert.equal(
      source.ids.length, 4,
      `${source.name} must declare exactly four top-level views and no fifth. Found ${source.ids.length}: ${JSON.stringify(source.ids)}`
    );
    assert.deepStrictEqual(
      source.ids.slice(), EXPECTED_VIEW_IDS.slice(),
      `${source.name} must be exactly brief, portfolio, red-alert, journey in that order`
    );
    assert.deepStrictEqual(
      [...new Set(source.ids)].sort(), EXPECTED_VIEW_IDS.slice().sort(),
      `${source.name} must contain exactly the four ids as a set, with no duplicate standing in for a fifth`
    );
  }

  assert.equal(
    viewSet.defaultViewId, 'brief',
    'the decision attention tier lives inside the Brief view, which must remain the default'
  );

  /* the shared shell derives its modes FROM the declared set rather than
     carrying its own list, so there is no fourth place a fifth view could
     appear. Source text, because this is a structural claim about the shell. */
  const shellSource = readFileSync(resolve(ROOT, 'rlviews.js'), 'utf8');
  assert.ok(
    /var\s+MODES\s*=\s*SHELL\.viewIds\.slice\(\)/.test(shellSource),
    'rlviews.js must keep deriving its modes from the declared view set rather than hardcoding its own list'
  );

  /* ── NON-VACUITY: the runtime REJECTS a fifth view ────────────────────────
     A declaration can be correct while the enforcement has been removed. The
     adversarial pair below sends the SAME call shape twice: once with an
     invented fifth view, once with a legal one. The fifth view must be refused
     by the view gate specifically (RLMKT-VIEW); the legal one must get PAST
     that gate and fail somewhere else. A blanket refusal would fail this. */
  const commonInput = { projectionId: 'p-041', generationRef: 'g-041', cutoffAt: '2026-08-06T18:00:00.000Z' };

  const fifthView = RLMKT.composeCenterProjection(Object.assign({ activeView: 'attention' }, commonInput));
  assert.equal(fifthView.ok, false, 'a fifth top-level view must be refused');
  assert.equal(
    fifthView.error.code, 'RLMKT-VIEW',
    `a fifth view must be refused by the view gate itself, got ${JSON.stringify(fifthView.error)}`
  );
  assert.equal(fifthView.error.fieldPath, '$.activeView', 'the refusal must name the view field');

  const legalView = RLMKT.composeCenterProjection(Object.assign({ activeView: 'brief' }, commonInput));
  assert.notEqual(
    legalView.error && legalView.error.code, 'RLMKT-VIEW',
    'a legal view id must pass the view gate — otherwise the refusal above proves nothing about views'
  );
});

/* ═══════════════ TP-05-03 — SCN-017-042 red alert thresholds and hard gates ═══════════════ */

/* The pre-feature Red Alert contract, transcribed here as explicit literals.
   Nothing below compares the committed configuration against itself.

   NOTE ON LOCATION — the two halves live in two different committed files:
     tool-experience.config.json  .redAlertPolicy       the six-key admission POLICY
                                                        (rlexperience.js pins this key set)
     market-brief.config.json     ['red-alert-policy/v1'] the numeric THRESHOLDS the
                                                        seven gates read
   Both are asserted, because the scenario covers thresholds AND gates. */
const EXPECTED_RED_ALERT_POLICY = Object.freeze({
  contractVersion: 'red-alert-policy/v1',
  hardGate: 'current-corroborated-observable-falsifiable',
  minimumIndependentOrigins: 2,
  minimumObservableMarketEvidence: 1,
  minimumVisibleCount: 0,
  noTopicSeedList: true
});

const EXPECTED_RED_ALERT_THRESHOLDS = Object.freeze({
  contractVersion: 'red-alert-policy/v1',
  policyId: 'red-alert-policy/v1',
  scoreThreshold: 75,
  visibleCap: 5,
  minSeverity: 4,
  minIndependentOrigins: 2,
  minOwnerEvidence: 1,
  components: {
    severity: { weight: 25 },
    likelihood: { weight: 15 },
    observableTransmission: { weight: 20, cap: 3 },
    evidenceStrength: { weight: 20, cap: 3 },
    imminence: { weight: 10 },
    falsifiabilityActionability: { weight: 10 }
  },
  horizonBands: [
    { id: '0-2w', maxDays: 14, bandScore: 1 },
    { id: '2-8w', maxDays: 56, bandScore: 0.7 },
    { id: '2-6m', maxDays: 180, bandScore: 0.4 },
    { id: '>6m', maxDays: null, bandScore: 0.2 }
  ],
  severityLabels: { 1: 'informational', 2: 'low', 3: 'elevated', 4: 'high', 5: 'severe' },
  stalenessWindowDays: { source: 45, ownerEvidence: 21 }
});

/* The seven hard gates, observable as the closed rejection vocabulary each one
   emits. Order is part of the identity: this is the array shipped in
   rlmarketaction.js REJECTION_REASON_CLASSES.
     gate 1 origins + freshness -> insufficient-corroboration / stale-or-cutoff-mismatch
     gate 2 owner evidence      -> no-observable-market-evidence
     gate 3 minimum severity    -> low-severity
     gate 4 falsifiable fields  -> incomplete-fields
     gate 5 source conflict     -> source-conflict
     gate 6 cutoff compatibility (enforced at assembly; stale path shared with gate 1)
     gate 7 admission score     -> score-below-threshold */
const EXPECTED_HARD_GATE_REASONS = Object.freeze([
  'insufficient-corroboration', 'no-observable-market-evidence', 'incomplete-fields',
  'source-conflict', 'stale-or-cutoff-mismatch', 'score-below-threshold', 'low-severity'
]);

/* Canonical-serialisation digests of the three blocks above, recorded from the
   pre-feature tree. A reordered key changes these even when a deep comparison
   would still pass, which is what "byte-identical" is asking for. */
const RED_ALERT_POLICY_DIGEST = '82e0fd9e206fedeea4a2831cd0d0b0cc79f10049693e67e21885807839bc6962';
const RED_ALERT_THRESHOLD_DIGEST = 'c755fc06122c8903968bdcaa6a95d6e387a261856c1c0cf6bb3e63928552a74d';
const HARD_GATE_REASON_DIGEST = '56b7b458c1ee1fc80428be69c8b0ab5f227730816d15a55536b1d80cee10cb46';

function canonicalDigest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

test('SCN-017-042 Red alert thresholds and hard gates are byte-identical', () => {
  const RLMKT = require(MARKET_ACTION_PATH);
  const experienceConfig = readJson(EXPERIENCE_CONFIG_PATH);
  const briefConfig = readJson(BRIEF_CONFIG_PATH);

  /* ── the six-key admission policy ────────────────────────────────────────── */
  const policy = experienceConfig.redAlertPolicy;
  assert.ok(policy, 'tool-experience.config.json must still declare redAlertPolicy');

  assert.deepStrictEqual(
    Object.keys(policy).slice().sort(), Object.keys(EXPECTED_RED_ALERT_POLICY).slice().sort(),
    'the Red Alert policy key set must be exactly the six committed keys — a silently added or removed key moves the bar'
  );
  assert.deepStrictEqual(
    policy, EXPECTED_RED_ALERT_POLICY,
    'every Red Alert policy value must be byte-identical to its pre-feature value'
  );
  assert.equal(
    policy.hardGate, 'current-corroborated-observable-falsifiable',
    'the hard gate predicate must be unchanged'
  );
  assert.equal(policy.minimumIndependentOrigins, 2, 'the minimum independent origin count must remain 2');
  assert.equal(
    JSON.stringify(policy), JSON.stringify(EXPECTED_RED_ALERT_POLICY),
    'the Red Alert policy must serialise identically, key order included'
  );
  assert.equal(
    canonicalDigest(policy), RED_ALERT_POLICY_DIGEST,
    'the Red Alert policy canonical digest must be unchanged'
  );

  /* ── the numeric thresholds the seven gates read ─────────────────────────── */
  const thresholds = briefConfig['red-alert-policy/v1'];
  assert.ok(thresholds, 'market-brief.config.json must still declare red-alert-policy/v1');

  assert.deepStrictEqual(
    Object.keys(thresholds).slice().sort(), Object.keys(EXPECTED_RED_ALERT_THRESHOLDS).slice().sort(),
    'the Red Alert threshold key set must be exactly the committed keys'
  );
  assert.deepStrictEqual(
    thresholds, EXPECTED_RED_ALERT_THRESHOLDS,
    'every Red Alert threshold must be byte-identical to its pre-feature value'
  );

  /* asserted individually so a single moved threshold names itself rather than
     hiding inside a whole-object diff. */
  const namedThresholds = [
    ['scoreThreshold', 75], ['visibleCap', 5], ['minSeverity', 4],
    ['minIndependentOrigins', 2], ['minOwnerEvidence', 1]
  ];
  for (const [key, expected] of namedThresholds) {
    assert.equal(
      thresholds[key], expected,
      `the Red Alert ${key} must remain ${expected}; the attention tier is adjacent to Red Alert and never lowers its bar`
    );
  }
  assert.equal(
    JSON.stringify(thresholds), JSON.stringify(EXPECTED_RED_ALERT_THRESHOLDS),
    'the Red Alert thresholds must serialise identically, key order included'
  );
  assert.equal(
    canonicalDigest(thresholds), RED_ALERT_THRESHOLD_DIGEST,
    'the Red Alert threshold canonical digest must be unchanged'
  );

  /* the engine default MIRRORS the committed thresholds. If the two ever drift,
     the qualification path silently scores against a different bar than the one
     published in the config. */
  assert.deepStrictEqual(
    RLMKT.DEFAULT_RED_ALERT_POLICY, EXPECTED_RED_ALERT_THRESHOLDS,
    'the embedded rlmarketaction.js default policy must still mirror the committed thresholds'
  );

  /* ── the seven hard gates ────────────────────────────────────────────────── */
  assert.equal(
    RLMKT.REJECTION_REASON_CLASSES.length, 7,
    `the Red Alert admission path must retain exactly seven hard gates, found ${RLMKT.REJECTION_REASON_CLASSES.length}`
  );
  assert.deepStrictEqual(
    RLMKT.REJECTION_REASON_CLASSES.slice(), EXPECTED_HARD_GATE_REASONS.slice(),
    'every hard gate must be byte-identical, in order, to its pre-feature reason class'
  );
  assert.equal(
    canonicalDigest(RLMKT.REJECTION_REASON_CLASSES), HARD_GATE_REASON_DIGEST,
    'the hard gate vocabulary canonical digest must be unchanged'
  );

  /* ── NON-VACUITY: the runtime still ENFORCES the policy ───────────────────
     A configuration file can carry the right numbers while the code that reads
     it has stopped checking them. rlexperience.js is the enforcement point;
     these are read-only structural assertions against its committed source. */
  const experienceSource = readFileSync(EXPERIENCE_RUNTIME_PATH, 'utf8');
  assert.ok(
    experienceSource.includes('config.redAlertPolicy.hardGate !== "current-corroborated-observable-falsifiable"'),
    'rlexperience.js must still refuse a changed hard gate predicate'
  );
  assert.ok(
    experienceSource.includes('config.redAlertPolicy.minimumIndependentOrigins !== 2'),
    'rlexperience.js must still refuse a minimum independent origin count other than 2'
  );
  assert.ok(
    experienceSource.includes('"minimumObservableMarketEvidence", "minimumVisibleCount", "noTopicSeedList"'),
    'rlexperience.js must still pin the exact Red Alert policy key set'
  );
});

/* ═══════════════ TP-05-05 — SCN-017-044 the project selftest with the new module ═══════════════ */

const ATTENTION_MODULE_FILENAME = 'rlattention.js';

/* Positive control. This module IS registered with the selftest today, so the
   same inventory scan that looks for rlattention.js must find it. If the scan
   itself were broken, this control fails first and the absence of the new
   module is never reported as a false negative. */
const ALREADY_REGISTERED_MODULE = 'rlchart.js';

test('SCN-017-044 The project selftest passes with the new module registered', () => {
  /* the module exists on disk and is loaded by the page — so its absence from
     the selftest inventory is a REGISTRATION gap, not a missing file. */
  assert.ok(
    existsSync(resolve(ROOT, ATTENTION_MODULE_FILENAME)),
    `${ATTENTION_MODULE_FILENAME} must exist before it can be registered with the project selftest`
  );
  assert.ok(
    readFileSync(MARKET_BRIEF_PAGE_PATH, 'utf8').includes(`src="${ATTENTION_MODULE_FILENAME}"`),
    `market-brief.html must load ${ATTENTION_MODULE_FILENAME}, so the selftest is obliged to cover it`
  );

  const selftest = spawnSync(process.execPath, ['scripts/selftest.mjs'], {
    cwd: ROOT, encoding: 'utf8', timeout: 900_000, maxBuffer: 96 * 1024 * 1024
  });

  assert.equal(
    selftest.error, undefined,
    `the project selftest must run to completion: ${selftest.error && selftest.error.message}`
  );

  const output = `${selftest.stdout || ''}${selftest.stderr || ''}`;

  /* the run genuinely happened and genuinely reported. Without this, a crashed
     run producing no output would satisfy an "output does not contain a failure"
     style assertion for the wrong reason. */
  const summary = /Research-Lab self-test: (\d+) passed, (\d+) failed/.exec(output);
  assert.ok(
    summary,
    `the project selftest must publish its summary line. Last 1000 bytes: ${output.slice(-1000)}`
  );
  assert.ok(
    Number(summary[1]) > 0,
    `the project selftest must have asserted something, reported ${summary[1]} passing assertions`
  );
  assert.equal(Number(summary[2]), 0, `the project selftest must report zero failures, reported ${summary[2]}`);
  assert.equal(
    selftest.status, 0,
    `the project selftest must exit 0. Exit ${selftest.status}. Last 2000 bytes: ${output.slice(-2000)}`
  );

  /* ── POSITIVE CONTROL: the inventory scan works ──────────────────────────── */
  assert.ok(
    output.includes(ALREADY_REGISTERED_MODULE),
    `the inventory scan must find ${ALREADY_REGISTERED_MODULE}, which is already registered. `
      + 'If this fails, the scan is broken and any report about another module is meaningless.'
  );

  /* ── THEN: the new module appears in the registered inventory ─────────────
     RED until scripts/selftest.mjs registers rlattention.js. */
  assert.ok(
    output.includes(ATTENTION_MODULE_FILENAME),
    `${ATTENTION_MODULE_FILENAME} must appear in the project selftest's registered inventory. `
      + `It is shipped and loaded by market-brief.html but scripts/selftest.mjs never names it, `
      + `so every invariant it owns is currently unguarded by the project selftest.`
  );
});

