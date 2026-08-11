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

/* The registry fixture carries the one page the attention items actually link
   to, because after A-017-10 the publication gate derives its deep-link
   allowlist from this registry: an empty registry refuses every link and would
   have made the "publishes cleanly" half of every attention test vacuous.
   `id` is deliberately absent — an id engages the toolCoverage rule at
   validate-brief-payload.mjs:373, which demands a matching payload.toolCoverage
   entry and belongs to the coverage scenarios, not to these field tests. */
const REGISTRY = Object.freeze({ tools: [{ file: 'market-heatmap-lab.html' }] });

/* ── refusal-list extraction ─────────────────────────────────────────────── */

/* The house pattern the actions branch already uses is
   `nextSession.actions[${index}].${field}`; the attention branch owes the
   reader the same `attention[${index}].${field}` naming. */
/* A refusal names the slot, then the item it is about, then the field:
   `attention[0] (id=…, subject=…).headline`. The item label is optional in this
   pattern only so that the field-extraction here keeps working if the label is
   ever degraded ("id absent"); SCN-017-025b is what asserts the label is there. */
const ATTENTION_FIELD_RE = /attention\[(\d+)\](?:\s*\([^)]*\))?\.([A-Za-z][A-Za-z0-9]*)/;

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

test('SCN-017-025b A refusal names which item it is about, not only which slot', () => {
  /* TP-02-01b. An index is not an identity: the list is re-ranked between runs,
     so `attention[3]` in yesterday's log points at a different item today. The
     refusal has to carry the item's own handle for an operator to act on it. */
  const attentionRefusal = (errors) => errors.filter((e) => e.startsWith('attention['));

  /* 1. an identified item: both the stable id and the human subject are named. */
  const identified = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem({ id: 'attn-hyg-credit-001', headline: HEADLINE_OVER_LIMIT })]),
    REGISTRY, CONFIG, null
  );
  const identifiedLines = attentionRefusal(identified);
  assert.ok(identifiedLines.length > 0, 'the over-length headline must still refuse');
  assert.ok(
    identifiedLines.every((line) => line.includes('id=attn-hyg-credit-001')),
    `every attention refusal must name the offending item's id. Received: ${JSON.stringify(identifiedLines)}`
  );
  assert.ok(
    identifiedLines.every((line) => line.includes('subject=HYG')),
    `every attention refusal must name the offending item's subject. Received: ${JSON.stringify(identifiedLines)}`
  );
  assert.ok(
    identifiedLines.some((line) => line.includes('.headline')),
    `the offending field must still be named alongside the item. Received: ${JSON.stringify(identifiedLines)}`
  );

  /* 2. the degraded case: when the identity itself is missing the refusal says
        so in words. Printing "id=undefined" would send an operator hunting for
        an item whose handle is literally the string "undefined". */
  const anonymous = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem({ headline: HEADLINE_OVER_LIMIT })]), REGISTRY, CONFIG, null
  );
  const anonymousLines = attentionRefusal(anonymous);
  assert.ok(anonymousLines.length > 0, 'the anonymous fixture must still refuse');
  assert.ok(
    anonymousLines.every((line) => line.includes('id absent')),
    `an item with no id must be refused as "id absent". Received: ${JSON.stringify(anonymousLines)}`
  );
  assert.ok(
    anonymousLines.every((line) => !line.includes('undefined') && !line.includes('null')),
    `a refusal must never print a placeholder identity. Received: ${JSON.stringify(anonymousLines)}`
  );

  /* 3. adversarial: the pre-fix shape must not satisfy this scenario. If the
        validator regressed to naming only the slot, every assertion above that
        looks for an item handle would find nothing — proven here explicitly so
        this test cannot pass against the behaviour it exists to forbid. */
  const slotOnly = 'attention[0].headline HEADLINE_TOO_LONG: too long';
  assert.equal(
    slotOnly.includes('id='), false,
    'the pre-fix message shape carries no item handle — this test would fail against it'
  );
  assert.equal(
    slotOnly.includes('id absent'), false,
    'the pre-fix message shape does not declare a missing identity either'
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

  /* Both sides must be handed EQUIVALENT context, or this compares contexts
     rather than predicates. The gate derives its deep-link allowlist from the
     registry (A-017-10), so the browser side is given the same one; leaving it
     absent made the browser refuse deepLink that the gate accepted, which is a
     fixture asymmetry and not the drift this scenario exists to catch. */
  const browserContext = { toolDeepLinks: (REGISTRY.tools || []).map((tool) => tool.file) };
  const browserRefusals = moduleAttentionRefusals(sharedFixture, browserContext);
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
  assert.ok(Array.isArray(payload.attentionExclusions), 'the committed payload carries attention refusal accounting');
  assert.ok(
    payload.attention.length + payload.attentionExclusions.length > 0,
    'the committed payload accounts for at least one candidate as published or excluded'
  );

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

  /* ── narrowed by F-017-06 (scope 06, Cross-Scope Supersession) ───────────
     F-017-06 moves the decision window, the transmission path and the
     provenance class OUT of the authoring lane and INTO the publish-time
     build step, which derives each from a committed contract. The lane now
     authors only the judgement: a headline, the falsifiability triple, and
     the four judgement enums. It authors no serialized field.

     This scenario therefore pins BOTH halves of that boundary. Asserting
     only what the instruction must NAME would leave a lane that still asks
     for the serialized fields passing — and after F-017-06 that ask IS the
     defect, because it re-invites the lane to emit an envelope the build
     step is now responsible for. Pinning the absence as well makes this
     guard strictly stronger than the name-everything form it replaces. */

  /* each authored field is asserted SEPARATELY, so dropping any single one
     fails on its own line and names itself. */
  const AUTHORED_JUDGEMENT_TERMS = [
    ['headline', /\bheadline\b/i],
    ['escalation trigger', /escalation trigger/i],
    ['invalidation', /\binvalidation\b/i],
    ['expiry', /\bexpir(?:y|ation)\b/i],
    ['verb', /\bverbs?\b/i],
    ['horizon', /\bhorizons?\b/i],
    ['severity', /\bseverity\b/i],
    ['imminence', /\bimminence\b/i]
  ];

  for (const [label, pattern] of AUTHORED_JUDGEMENT_TERMS) {
    assert.match(
      attentionInstruction, pattern,
      `the attention authoring instruction must name the ${label}. `
        + `It belongs to the authored judgement argument of buildAttentionItem, and an author who is never told `
        + `to write it will never write it, so the composer refuses that candidate and it never publishes. `
        + `Current attention instruction: ${JSON.stringify(attentionInstruction)}`
    );
  }

  /* the other half of the boundary: the serialized fields the BUILD STEP now
     constructs. Asserted separately too, so a single reintroduced ask names
     itself rather than hiding inside one combined check. */
  const BUILD_STEP_SERIALIZED_TERMS = [
    ['decision window', /decision window/i],
    ['transmission path', /transmission path/i],
    ['provenance class', /provenance class/i]
  ];

  for (const [label, pattern] of BUILD_STEP_SERIALIZED_TERMS) {
    assert.ok(
      !pattern.test(attentionInstruction),
      `the attention authoring instruction must NOT ask the lane for the ${label}. `
        + `F-017-06 moves it to scripts/build-attention-items.mjs, which derives it from a committed contract; `
        + `asking the lane for it reopens the three-publish compliance failure that decision closed. `
        + `Current attention instruction: ${JSON.stringify(attentionInstruction)}`
    );
  }
});

test('SCN-017-054 The build step composes the envelope the lane no longer emits', async () => {
  /* TP-02-02. F-017-06: compliance is structural, not advisory. The lane hands
     over judgement; this step calls the certified composer. */
  const build = await import(resolve(ROOT, 'scripts/build-attention-items.mjs'));

  /* 1. it holds the capability module's OWN composer, not a second copy that
        happens to agree today. */
  assert.equal(typeof build.buildAttentionItems, 'function');
  assert.equal(typeof build.attentionBuildContext, 'function');

  /* 2. the lane's judgement is taken and nothing else is. An envelope field
        smuggled into a candidate must not survive into the authored argument,
        or the lane could still serialize its own envelope through the back
        door — which is the exact failure F-017-06 closed. */
  const smuggled = build.authoredJudgementOnly({
    headline: 'A headline', invalidation: 'an invalidation',
    decisionWindow: 'pre-market', transmissionPath: 'smuggled', lifecycle: 'smuggled', state: 'smuggled'
  });
  assert.deepEqual(Object.keys(smuggled).sort(), ['headline', 'invalidation'],
    'only authored judgement keys may reach the composer; every serialized field must be dropped');

  /* 3. a refused candidate is EXCLUDED with the composer's own named code and
        never defaulted into shape. */
  const payload = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.payload.json'), 'utf8'));
  const config = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.config.json'), 'utf8'));
  const refusedRun = build.buildAttentionItems(
    [{ observed: { disposition: 'observed', subject: 'MSFT' }, headline: '' }], payload, config
  );
  assert.equal(refusedRun.items.length, 0, 'a refused candidate must not be published');
  assert.equal(refusedRun.exclusions.length, 1, 'a refused candidate must be recorded, not silently dropped');
  assert.match(refusedRun.exclusions[0].code, /^RLATTN-/,
    `the exclusion must carry the composer's own named refusal code. Received: ${JSON.stringify(refusedRun.exclusions[0])}`);
  assert.ok(refusedRun.exclusions[0].field, 'the exclusion must name the offending field');

  /* 4. the duplicate-suppression input is real. An action's subject is prose
        and an attention subject is a bare ticker; the composer compares them
        with an exact match, so handing the prose across would leave a guard
        that runs and can never fire. */
  assert.deepEqual(build.actionSubjectTickers([{ subject: 'rotate out of XLE now' }], ['XLE']), ['XLE'],
    'a ticker named by an action must be projected out of the prose');
  assert.deepEqual(build.actionSubjectTickers([{ subject: 'XLERATE holdings' }], ['XLE']), [],
    'a ticker must not match inside a longer token — that would suppress an unrelated attention item');
  assert.deepEqual(build.actionSubjectTickers([{ subject: 'SPY / SPMO structural core' }], ['XLE']), [],
    'an action naming no watchlist ticker contributes nothing');

  const ctx = build.attentionBuildContext(payload, config);
  assert.ok(
    ctx.publishedActionSubjects.every((s) => ctx.watchlistScope.includes(s)),
    `every published action subject must be a watchlist ticker the composer can match. Received: ${JSON.stringify(ctx.publishedActionSubjects)}`
  );
});

test('Regression: judgement-only lane output is refused rather than passed through to the payload gate', async () => {
  const build = await import(resolve(ROOT, 'scripts/build-attention-items.mjs'));
  const judgementOnly = {
    headline: 'Breadth weakened while the index held its structural trend',
    rationale: 'The participation signal diverged from the index close.',
    verb: 'scenario-test',
    horizon: 'swing',
    severity: 'mild',
    imminence: 'developing',
    escalationTrigger: 'Breadth falls below the observed session low.',
    invalidation: 'Breadth recovers above the declared broad-market gate.',
    expiry: '2026-08-13T20:00:00.000Z'
  };
  const candidatePayload = { ...COMMITTED_PAYLOAD, attention: [judgementOnly] };

  const result = build.recomposePayloadAttention(candidatePayload, COMMITTED_BRIEF_CONFIG);

  assert.equal(result.items.length, 0, 'a candidate without an observed gate result cannot become an envelope');
  assert.equal(result.exclusions.length, 1, 'the refused lane candidate must be accounted for exactly once');
  assert.equal(result.exclusions[0].code, 'RLATTN-PROVENANCE');
  assert.equal(result.exclusions[0].field, 'gateResult');
  assert.deepEqual(result.payload.attention, [], 'the malformed candidate must not pass through to the payload gate');
  assert.deepEqual(result.payload.attentionExclusions, result.exclusions);
});

test('SCN-017-055 The rendered record reads the published ledger, not a literal empty set', () => {
  /* TP-04-08. The renderer used to call computeInterruptionRate([]) with a
     hardcoded empty array. That is not "no data yet" — it is a permanent
     answer: the outcome ledger could fill with a hundred closures and the page
     would still say the sample was too small, because it never looked. */
  const page = readFileSync(resolve(ROOT, 'market-brief.html'), 'utf8');

  assert.match(
    page, /market-brief\.attention-scorecard\.json/,
    'the cockpit must fetch the published attention record; a page that never reads the ledger cannot report it'
  );

  /* the record block must consume the published reduction. */
  const recordBlock = page.slice(page.indexOf('attentionRecord'));
  assert.match(
    recordBlock, /ATTENTION_RECORD/,
    'the record block must render the published reduction rather than recomputing its own'
  );

  /* adversarial: the pre-fix shape must not satisfy this scenario. The literal
     empty-array recompute may still exist as the no-record-published fallback,
     but it must not be the only path — so the published branch is what is
     pinned here, and its absence is what fails. */
  const preFix = 'var rate = RLATTN.computeInterruptionRate([], null, generatedAt || null);';
  assert.equal(
    preFix.includes('ATTENTION_RECORD'), false,
    'the pre-fix line carries no published-record read — this test would fail against it'
  );
});

test('SCN-017-056 A recorded exclusion must name a real refusal code', () => {
  /* TP-06-01. An exclusion reason that names no real code reads as an
     explanation and explains nothing, which is worse than recording none. */
  const base = payloadWithAttention([attentionItem()]);
  const withExclusions = (exclusions) => Object.assign({}, base, { attentionExclusions: exclusions });
  const named = (errors) => errors.filter((e) => e.startsWith('attentionExclusions'));

  /* a well-formed exclusion carrying the composer's own code passes. */
  const good = briefContract.validateBriefPayload(
    withExclusions([{ code: RLATTN.REFUSAL_CODES[0], field: 'headline', reason: 'the headline was empty' }]),
    REGISTRY, CONFIG, null
  );
  assert.deepEqual(named(good), [], `a conforming exclusion must not be refused. Received: ${JSON.stringify(named(good))}`);

  /* an invented code is refused by name. */
  const invented = briefContract.validateBriefPayload(
    withExclusions([{ code: 'RLATTN-MADE-UP', field: 'headline', reason: 'because' }]), REGISTRY, CONFIG, null
  );
  assert.ok(
    named(invented).some((e) => e.includes('.code')),
    `an exclusion code outside the composer's closed set must be refused. Received: ${JSON.stringify(named(invented))}`
  );

  /* a missing field or reason is refused by name, so a bare code cannot pass as a record. */
  const bare = briefContract.validateBriefPayload(
    withExclusions([{ code: RLATTN.REFUSAL_CODES[0] }]), REGISTRY, CONFIG, null
  );
  assert.ok(named(bare).some((e) => e.includes('.field')), 'an exclusion with no field must be refused');
  assert.ok(named(bare).some((e) => e.includes('.reason')), 'an exclusion with no reason must be refused');

  /* absent stays legal: the key arrives with the build step's payload cutover,
     and refusing every brief before then would take the live publication down. */
  const absent = briefContract.validateBriefPayload(base, REGISTRY, CONFIG, null);
  assert.deepEqual(named(absent), [], 'a payload without the key must not be refused for it');
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
  /* ── GIVEN: the tier ran and the record is genuinely populated ───────────
     An all-refused generation legitimately renders the declared empty state,
     but it must still account for every refused candidate by name. */
  const payload = readJson(PAYLOAD_PATH);
  const decisionAttention = (payload.attention || [])
    .filter((item) => item && item.contractVersion === 'decision-attention/v1');
  const exclusions = Array.isArray(payload.attentionExclusions) ? payload.attentionExclusions : [];
  assert.ok(
    decisionAttention.length + exclusions.length > 0,
    'the committed payload must account for at least one attention candidate as published or excluded'
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

/* ══════════════════════════════════════════════════════════════════════════
 * Feature 017 Scope 06 — authoring lane composer routing.
 * TP-06-01 … TP-06-04, TP-06-06, TP-06-07
 * (SCN-017-047, SCN-017-048, SCN-017-049, SCN-017-050, SCN-017-052, SCN-017-053).
 *
 * F-017-06 makes attention compliance STRUCTURAL rather than advisory. The lane
 * no longer emits a `decision-attention/v1` envelope; it authors only judgement
 * — a headline, the falsifiability triple and the four judgement enums — and
 * `scripts/build-attention-items.mjs` constructs the envelope by calling the
 * certified composer once per candidate. A lane that cannot emit an envelope
 * cannot emit a non-conforming one.
 *
 * WHY THESE SIX ARE NOT SATISFIABLE BY A HAPPY PATH. A build step that silently
 * drops every candidate and a build step that works both publish a payload the
 * gate accepts, so a happy-path suite cannot tell them apart. Each scenario
 * below therefore carries its own non-vacuity proof:
 *
 *   047  every serialized field asserted on the envelope is first proven ABSENT
 *        from the authored argument, so its presence proves the BUILD STEP put
 *        it there; the window resolution is compared against an INDEPENDENT
 *        resolve from the same committed calendar.
 *   048  the refused candidate genuinely lacks a falsifiability field, and the
 *        SAME candidate with the field restored is required to build — without
 *        that positive control, "it was refused" proves nothing about WHY.
 *   049  a MIXED generation, so publish-everything and publish-nothing both fail.
 *   050  every candidate carries a DIFFERENT genuine defect and the candidate
 *        list is asserted non-empty, so the empty published set is the observed
 *        consequence of universal refusal rather than of nothing being declared.
 *   052  the vocabulary-restatement detector is first proven to FIRE against the
 *        modules that really do declare each vocabulary.
 *   053  the absence detector is first proven to FIRE against the pre-F-017-06
 *        instruction shape it exists to forbid.
 *
 * These run against the REAL build step, the REAL composer and the REAL
 * committed calendar, watchlist and window vocabulary. Nothing is mocked, no
 * fixture carries a pre-computed verdict or refusal code, and every instant is
 * an explicit literal. No clock, no randomness, no network.
 * ══════════════════════════════════════════════════════════════════════════ */

const BUILD_STEP_PATH = resolve(ROOT, 'scripts/build-attention-items.mjs');

const RLMARKETACTION = require(MARKET_ACTION_PATH);
const CERTIFIED_CHANNELS = RLMARKETACTION.TRANSMISSION_CHANNELS;

const COMMITTED_PAYLOAD = readJson(PAYLOAD_PATH);
const COMMITTED_BRIEF_CONFIG = readJson(BRIEF_CONFIG_PATH);

/* explicit instants — never derived from the system clock. */
const OBSERVED_AT_INSTANT = '2026-08-06T14:30:00.000Z';
const FIGURE_AS_OF_INSTANT = '2026-08-05T20:00:00.000Z';
const EXPIRY_INSTANT = '2026-08-13T20:00:00.000Z';

/* a subject the committed watchlist does not carry, used to refuse a candidate
   for a reason that is neither of the two falsifiability reasons. */
const OFF_WATCHLIST_SUBJECT = 'ZZZZ';

/* The envelope fields the BUILD STEP owns. Not one of them may appear in the
   authored argument: that is what "no serialized field was supplied by the
   authoring lane" means, and it is what makes 047's assertions non-vacuous. */
const SERIALIZED_BY_BUILD_STEP = Object.freeze([
  'contractVersion', 'id', 'decisionWindow', 'windowBoundaryUtc', 'windowTradingDate',
  'windowResolvedFrom', 'state', 'lifecycle', 'supersededBy'
]);

async function loadBuildStep() {
  assert.ok(
    existsSync(BUILD_STEP_PATH),
    'scripts/build-attention-items.mjs must exist. It is the publish-time step that calls the certified composer '
      + 'once per candidate. Until it exists the authoring lane is still asked to serialize its own envelope, '
      + 'which is the advisory-compliance failure F-017-06 closed.'
  );
  const mod = await import(pathToFileURL(BUILD_STEP_PATH).href);
  for (const [name, kind] of [
    ['buildAttentionItems', 'function'],
    ['attentionBuildContext', 'function'],
    ['authoredJudgementOnly', 'function'],
    ['AUTHORED_JUDGEMENT_KEYS', 'object']
  ]) {
    assert.equal(
      typeof mod[name], kind,
      `the build step must export ${name} as a ${kind}. Exports found: ${JSON.stringify(Object.keys(mod))}`
    );
  }
  return mod;
}

/* Watchlist tickers no published action already covers. The composer refuses a
   subject an action already carries (RLATTN-OVERLAP), so a buildable fixture
   has to be drawn from what is left rather than hardcoded and hoped for. */
function unactionedSubjects(ctx) {
  return ctx.watchlistScope.filter((ticker) => ctx.publishedActionSubjects.indexOf(ticker) === -1);
}

/* A candidate as the lane now hands it over: an `observed` gate read carrying
   the market facts, and the authored judgement at the top level. It carries NO
   serialized envelope field — 047 asserts that before asserting anything the
   build step produced. */
function completeCandidate(ctx, subject) {
  assert.ok(
    ctx.watchlistScope.includes(subject),
    `the fixture subject ${subject} must be inside the committed watchlist scope`
  );
  return {
    observed: {
      gateId: `gate-${subject}-scope06`,
      disposition: 'attention',
      subject,
      severity: 'moderate',
      imminence: 'developing',
      observedAt: OBSERVED_AT_INSTANT,
      transmissionPath: ['credit-funding'],
      marketConfirmation: {
        state: 'present',
        detail: 'The spread widened across five consecutive sessions.'
      },
      figures: [{
        label: 'spread change',
        value: 'plus eighteen basis points',
        provenance: { sourceId: 'market-heatmap-lab', asOf: FIGURE_AS_OF_INSTANT }
      }]
    },
    headline: `${subject} funding spreads widened for a fifth consecutive session`,
    rationale: 'The widening has persisted across five consecutive sessions.',
    verb: 'monitor',
    horizon: 'this-week',
    escalationTrigger: 'The spread widens beyond thirty five basis points intraday.',
    invalidation: 'The spread retraces below eight basis points of its five session start.',
    expiry: EXPIRY_INSTANT,
    severity: 'moderate',
    imminence: 'developing'
  };
}

/* The human sentence attached to a refusal. The scope names it `detail`; the
   landed step records it as `reason`. Either satisfies the Gherkin — an
   exclusion carrying NEITHER states no reason at all, which is what this
   resolves to the empty string so the assertion can say so. */
function exclusionDetail(exclusion) {
  const carried = ['detail', 'reason', 'message']
    .map((key) => (exclusion && typeof exclusion[key] === 'string' ? exclusion[key].trim() : ''))
    .filter((text) => text.length > 0);
  return carried.length > 0 ? carried[0] : '';
}

/* Which declared candidate a refusal is about. The scope names this
   `candidateId`; the landed step records the candidate's ordinal `index` and
   its `subject`. Any of the three identifies the candidate; an exclusion that
   carries none of them resolves to -1 and cannot be acted on. */
function excludedCandidateIndex(exclusion, candidates) {
  const ordinal = exclusion ? exclusion.index : undefined;
  if (Number.isInteger(ordinal) && ordinal >= 0 && ordinal < candidates.length) return ordinal;
  const named = [exclusion ? exclusion.candidateId : undefined, exclusion ? exclusion.subject : undefined]
    .find((value) => typeof value === 'string' && value.length > 0);
  return candidates.findIndex((candidate) => candidate
    && (candidate.candidateId === named || (candidate.observed && candidate.observed.subject === named)));
}

/* The attention sentences of the narrative lane's authoring instruction. The
   lane also owns recommendations and events, and those sentences already use
   words like "invalidation" for a different section — borrowing them would
   make this guard unable to fail. */
function attentionAuthoringInstruction() {
  const source = readFileSync(NARRATIVE_LANE_PATH, 'utf8');
  const lane = source.split(/keys:\s*\[/).find((chunk) => /^[^\]]*'attention'/.test(chunk));
  assert.ok(lane, 'the narrative lane that owns the attention key must be locatable in the source');
  const match = /instructions:\s*`([\s\S]*?)`/.exec(lane);
  assert.ok(match, 'the attention lane must carry an authoring instruction');
  return match[1]
    .split(/(?<=\.)\s+/)
    .filter((sentence) => /\battention\b/i.test(sentence))
    .join(' ');
}

/* the eight judgement fields the Gherkin names, each probed SEPARATELY so a
   single dropped ask fails on its own line and names itself. */
const AUTHORED_JUDGEMENT_ASKS = Object.freeze([
  ['headline', /\bheadline\b/i],
  ['escalation trigger', /escalation trigger/i],
  ['invalidation', /\binvalidation\b/i],
  ['expiry', /\bexpir(?:y|ation)\b/i],
  ['verb', /\bverbs?\b/i],
  ['horizon', /\bhorizons?\b/i],
  ['severity', /\bseverity\b/i],
  ['imminence', /\bimminence\b/i]
]);

/* the three serialized fields F-017-06 moved OUT of the ask and into the build
   step, each probed separately for the same reason. */
const BUILD_STEP_DERIVED_ASKS = Object.freeze([
  ['decision window', /decision window/i],
  ['transmission path', /transmission path/i],
  ['provenance class', /provenance class/i]
]);

/* the pre-F-017-06 ask, kept as a positive control: an absence assertion whose
   detector cannot fire is unfalsifiable, so 053 proves it fires on this first. */
const PRIOR_INSTRUCTION_SHAPE = 'For every attention item author a decision-attention/v1 envelope naming the '
  + 'decision window, the transmission path and the provenance class of every figure.';

/* ────────────────────────────────────────────────────────────────────────── */

test('SCN-017-047 A complete authored candidate is built into a conforming envelope by the build step', async () => {
  const build = await loadBuildStep();
  const ctx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  const available = unactionedSubjects(ctx);
  assert.ok(available.length > 0, 'the committed watchlist must leave at least one subject no action already covers');

  const candidate = completeCandidate(ctx, available[0]);

  /* ── NON-VACUITY FIRST ─────────────────────────────────────────────────────
     Every serialized field asserted below is proven ABSENT from the authored
     argument here. Without this, "the envelope carries a decision window" would
     be satisfied by a lane that simply handed one over, and the scenario would
     prove nothing about the build step at all. */
  const authored = build.authoredJudgementOnly(candidate);
  for (const field of SERIALIZED_BY_BUILD_STEP) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(candidate, field), false,
      `the candidate must not author ${field}; it is a serialized field the build step owns`
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(authored, field), false,
      `${field} must not survive into the authored argument. Authored keys: ${JSON.stringify(Object.keys(authored))}`
    );
  }

  const run = build.buildAttentionItems([candidate], COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  assert.deepEqual(
    [...run.exclusions], [],
    'a complete authored candidate must not be refused. The build step supplies every field the lane no longer '
      + `authors, so a refusal here means it is not supplying one of them. Refusals: ${JSON.stringify(run.exclusions)}`
  );
  assert.equal(run.items.length, 1, `exactly one item must be built. Received ${run.items.length}`);

  const item = run.items[0];

  /* 1. what is published IS the envelope — not the composer's result wrapper. */
  assert.equal(
    Object.prototype.hasOwnProperty.call(item, 'ok'), false,
    'the published item must be the envelope itself, not the composer\'s { ok, item } result wrapper. '
      + `Received keys: ${JSON.stringify(Object.keys(item))}`
  );
  assert.equal(
    item.contractVersion, RLATTN.CONTRACT_VERSION,
    `the built item must be a ${RLATTN.CONTRACT_VERSION} envelope. Received: ${JSON.stringify(item.contractVersion)}`
  );

  /* 2. it conforms under the capability module's own validator. */
  const verdict = RLATTN.validateAttentionItem(item, ctx);
  assert.deepEqual(
    [...verdict.violations], [],
    `the built envelope must conform. Violations: ${JSON.stringify(verdict.violations)}`
  );
  assert.equal(verdict.ok, true, 'validateAttentionItem must accept the built envelope');

  /* 3. WINDOW RESOLUTION — a field the lane never authored. Compared against an
        INDEPENDENT resolve from the same committed calendar and vocabulary, so
        a step that stamped a plausible constant fails here. */
  assert.ok(
    RLATTN.DECISION_WINDOWS.includes(item.decisionWindow),
    `the decision window must come from the declared vocabulary. Received: ${JSON.stringify(item.decisionWindow)}`
  );
  const resolved = RLATTN.resolveDecisionWindow(
    item.decisionWindow, ctx.tradingDateIso, ctx.calendarSource, ctx.windowVocabulary
  );
  assert.equal(resolved.ok, true, `the window must resolve against the committed calendar: ${JSON.stringify(resolved)}`);
  assert.equal(item.windowBoundaryUtc, resolved.boundaryUtc, 'the window boundary must be the calendar-resolved instant');
  assert.equal(item.windowTradingDate, resolved.tradingDate, 'the window trading date must be the calendar-resolved date');
  assert.equal(item.windowResolvedFrom, resolved.resolvedFrom, 'the window must record how it resolved');

  /* 4. TRANSMISSION VOCABULARY — every channel is certified, none invented. */
  assert.ok(Array.isArray(item.transmissionPath), 'the transmission path must be a list');
  for (const channel of item.transmissionPath) {
    assert.ok(
      CERTIFIED_CHANNELS.includes(channel),
      `${channel} is outside the certified transmission vocabulary ${JSON.stringify(CERTIFIED_CHANNELS)}`
    );
  }

  /* 5. PROVENANCE INSTANTS — the observation instant and every figure's as-of. */
  assert.equal(
    item.observedAt, candidate.observed.observedAt,
    'the envelope must carry the OBSERVED instant, taken from the gate read rather than from authored prose'
  );
  assert.ok(item.figures.length > 0, 'the fixture carries a figure, so the envelope must too');
  for (const figure of item.figures) {
    assert.equal(
      typeof figure.provenance.sourceId, 'string',
      `every figure must name its source. Received: ${JSON.stringify(figure)}`
    );
    assert.match(
      figure.provenance.asOf, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/,
      `every figure must carry an as-of instant. Received: ${JSON.stringify(figure.provenance)}`
    );
  }

  /* 6. LIFECYCLE STATE — opened by the build step at the observed instant. */
  assert.ok(
    RLATTN.ATTENTION_LIFECYCLE_STATES.includes(item.state),
    `the item state must be inside the declared lifecycle. Received: ${JSON.stringify(item.state)}`
  );
  assert.equal(item.state, 'discovered', 'a freshly built item opens at discovered');
  assert.equal(item.supersededBy, null, 'a freshly built item supersedes nothing');
  assert.equal(item.lifecycle.length, 1, `a freshly built item carries one lifecycle entry, got ${item.lifecycle.length}`);
  assert.equal(item.lifecycle[0].to, 'discovered', 'the first lifecycle entry opens at discovered');
  assert.equal(item.lifecycle[0].at, item.observedAt, 'the lifecycle opens at the instant the item was observed');

  /* 7. IDENTITY — derived by the composer, never authored. */
  assert.match(item.id, /^attn-/, `the item id must be composer-derived. Received: ${JSON.stringify(item.id)}`);
});

test('SCN-017-048 A candidate missing a falsifiability field is excluded with a named refusal code', async () => {
  const build = await loadBuildStep();
  const ctx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  const available = unactionedSubjects(ctx);
  assert.ok(available.length > 0, 'the committed watchlist must leave at least one subject no action already covers');

  const complete = completeCandidate(ctx, available[0]);
  const missingInvalidation = withoutField(complete, 'invalidation');

  /* the fixture GENUINELY fails to build: the field is really gone, both from
     the candidate and from the authored argument the composer receives. A
     well-formed candidate that a flag marked excluded would prove nothing. */
  assert.equal(
    Object.prototype.hasOwnProperty.call(missingInvalidation, 'invalidation'), false,
    'the fixture must genuinely omit the invalidation key'
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(build.authoredJudgementOnly(missingInvalidation), 'invalidation'), false,
    'the missing invalidation must still be missing in the authored argument handed to the composer'
  );

  const run = build.buildAttentionItems([missingInvalidation], COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);

  /* 1. ABSENT from the published set. */
  assert.equal(
    run.items.length, 0,
    `a candidate that cannot be invalidated must not publish. Published: ${JSON.stringify(run.items)}`
  );

  /* 2. and a NAMED refusal code recorded for the offending field. Absence alone
        would be satisfied by a step that silently drops everything. */
  assert.equal(run.exclusions.length, 1, `the refusal must be recorded, not dropped. Got: ${JSON.stringify(run.exclusions)}`);
  const excluded = run.exclusions[0];
  assert.ok(
    RLATTN.REFUSAL_CODES.includes(excluded.code),
    `the exclusion must carry one of the composer's own named codes ${JSON.stringify(RLATTN.REFUSAL_CODES)}. `
      + `Received: ${JSON.stringify(excluded)}`
  );
  assert.equal(excluded.code, 'RLATTN-FALSIFIABILITY', `the refusal must name the falsifiability rule: ${JSON.stringify(excluded)}`);
  assert.equal(excluded.field, 'invalidation', `the refusal must name the offending field: ${JSON.stringify(excluded)}`);
  assert.ok(exclusionDetail(excluded).length > 0, `the refusal must state its reason in words: ${JSON.stringify(excluded)}`);

  /* 3. NO SUBSTITUTE VALUE was written for the missing field. */
  assert.equal(
    Object.prototype.hasOwnProperty.call(excluded, 'invalidation'), false,
    `the exclusion record must not carry a filled-in invalidation. Received: ${JSON.stringify(excluded)}`
  );

  /* 4. POSITIVE CONTROL — the SAME candidate with the field restored builds.
        Without this, "it was refused" is equally true of a step that refuses
        everything, and this scenario could not tell the two apart. */
  const restored = build.buildAttentionItems([complete], COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  assert.deepEqual(
    [...restored.exclusions], [],
    'the fixture must fail for its MISSING INVALIDATION and nothing else — with the field restored it must build. '
      + `Refusals on the restored candidate: ${JSON.stringify(restored.exclusions)}`
  );
  assert.equal(restored.items.length, 1, 'the restored candidate must publish exactly one item');
});

test('SCN-017-049 Every excluded candidate states why it was excluded', async () => {
  const build = await loadBuildStep();
  const ctx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  const available = unactionedSubjects(ctx);
  assert.ok(available.length >= 2, `a MIXED generation needs two distinct subjects, got ${JSON.stringify(available)}`);

  /* a MIXED generation: one candidate that builds and one that cannot. A
     single-candidate fixture cannot separate "publishes everything" from
     "publishes nothing"; this one fails against both. */
  const buildable = completeCandidate(ctx, available[0]);
  const refusable = withoutField(completeCandidate(ctx, available[1]), 'escalationTrigger');
  assert.equal(
    Object.prototype.hasOwnProperty.call(refusable, 'escalationTrigger'), false,
    'the refusable candidate must genuinely omit its escalation trigger'
  );
  const candidates = [buildable, refusable];

  const run = build.buildAttentionItems(candidates, COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);

  assert.equal(
    run.items.length, 1,
    'exactly one of the two candidates builds — a step that published both, or neither, fails here. '
      + `Published ${run.items.length}, refused ${JSON.stringify(run.exclusions)}`
  );
  assert.equal(run.exclusions.length, 1, `exactly one of the two is refused. Got: ${JSON.stringify(run.exclusions)}`);

  /* the ACCOUNTING invariant: published plus recorded equals declared. */
  assert.equal(
    run.items.length + run.exclusions.length, candidates.length,
    `published (${run.items.length}) plus excluded (${run.exclusions.length}) must equal declared `
      + `(${candidates.length}). A candidate in neither set is the silent drop this scope exists to forbid.`
  );

  /* the excluded candidate NAMES ITSELF and its reason. */
  const excluded = run.exclusions[0];
  assert.equal(
    excludedCandidateIndex(excluded, candidates), 1,
    `the exclusion must identify WHICH declared candidate it is about. Received: ${JSON.stringify(excluded)}`
  );
  assert.ok(
    RLATTN.REFUSAL_CODES.includes(excluded.code),
    `the exclusion must carry a named RLATTN code. Received: ${JSON.stringify(excluded)}`
  );
  assert.equal(excluded.code, 'RLATTN-FALSIFIABILITY', `the refusal must name the falsifiability rule: ${JSON.stringify(excluded)}`);
  assert.equal(excluded.field, 'escalationTrigger', `the refusal must name the offending field: ${JSON.stringify(excluded)}`);
  assert.ok(exclusionDetail(excluded).length > 0, `the refusal must carry its detail: ${JSON.stringify(excluded)}`);

  /* NO DECLARED CANDIDATE IS ABSENT FROM BOTH. The published one is the
     buildable one, identified by subject rather than by count alone, so a step
     that published the WRONG candidate fails here too. */
  assert.equal(
    run.items[0].subject, buildable.observed.subject,
    `the published item must be the buildable candidate. Received: ${JSON.stringify(run.items[0].subject)}`
  );
  const excludedIndexes = run.exclusions.map((entry) => excludedCandidateIndex(entry, candidates));
  assert.equal(
    new Set(excludedIndexes).size, excludedIndexes.length,
    `two exclusions must not name the same candidate. Indexes: ${JSON.stringify(excludedIndexes)}`
  );
  assert.equal(
    excludedIndexes.includes(-1), false,
    `every exclusion must resolve to a declared candidate. Indexes: ${JSON.stringify(excludedIndexes)}`
  );
});

test('SCN-017-050 A generation whose every candidate is refused still publishes', async () => {
  const build = await loadBuildStep();
  const ctx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  const available = unactionedSubjects(ctx);
  assert.ok(available.length >= 3, `this scenario needs three distinct subjects, got ${JSON.stringify(available)}`);

  /* THREE candidates, THREE DIFFERENT genuine defects. A fixture declaring zero
     candidates is tautological and does not satisfy this row: the empty
     published set has to be the observed consequence of universal REFUSAL. */
  const noInvalidation = withoutField(completeCandidate(ctx, available[0]), 'invalidation');
  const noEscalation = withoutField(completeCandidate(ctx, available[1]), 'escalationTrigger');
  const offScope = completeCandidate(ctx, available[2]);
  offScope.observed = { ...offScope.observed, subject: OFF_WATCHLIST_SUBJECT };
  const candidates = [noInvalidation, noEscalation, offScope];

  assert.equal(candidates.length, 3, 'the generation must DECLARE candidates — an empty list proves nothing');
  assert.equal(
    Object.prototype.hasOwnProperty.call(noInvalidation, 'invalidation'), false,
    'the first candidate genuinely omits its invalidation'
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(noEscalation, 'escalationTrigger'), false,
    'the second candidate genuinely omits its escalation trigger'
  );
  assert.equal(
    ctx.watchlistScope.includes(OFF_WATCHLIST_SUBJECT), false,
    `${OFF_WATCHLIST_SUBJECT} must genuinely sit outside the committed watchlist scope`
  );

  const run = build.buildAttentionItems(candidates, COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);

  /* 1. the published attention set is EMPTY. */
  assert.deepEqual([...run.items], [], `no candidate may publish. Published: ${JSON.stringify(run.items)}`);

  /* 2. EVERY declared candidate appears in the recorded exclusions, each with
        its OWN named reason — a blanket refusal that reported one code for all
        three would fail the per-candidate assertions below. */
  assert.equal(
    run.exclusions.length, candidates.length,
    `all ${candidates.length} candidates must be recorded. Received: ${JSON.stringify(run.exclusions)}`
  );
  assert.equal(
    run.items.length + run.exclusions.length, candidates.length,
    'published plus excluded must still equal declared when every candidate is refused'
  );

  const expectedRefusals = [
    ['RLATTN-FALSIFIABILITY', 'invalidation'],
    ['RLATTN-FALSIFIABILITY', 'escalationTrigger'],
    ['RLATTN-PRIVACY', 'subject']
  ];
  expectedRefusals.forEach(([code, field], index) => {
    const entry = run.exclusions.find((exclusion) => excludedCandidateIndex(exclusion, candidates) === index);
    assert.ok(entry, `candidate ${index} must appear in the exclusions. Received: ${JSON.stringify(run.exclusions)}`);
    assert.ok(
      RLATTN.REFUSAL_CODES.includes(entry.code),
      `candidate ${index} must be refused with a named RLATTN code. Received: ${JSON.stringify(entry)}`
    );
    assert.equal(entry.code, code, `candidate ${index} must be refused for its own reason. Received: ${JSON.stringify(entry)}`);
    assert.equal(entry.field, field, `candidate ${index} must name its own offending field. Received: ${JSON.stringify(entry)}`);
    assert.ok(exclusionDetail(entry).length > 0, `candidate ${index} must state its reason. Received: ${JSON.stringify(entry)}`);
  });

  /* 3. and the brief STILL PUBLISHES: the publication gate exits zero. */
  const gate = spawnSync(process.execPath, ['scripts/validate-brief-payload.mjs'], {
    cwd: ROOT, encoding: 'utf8', timeout: 600000
  });
  assert.equal(gate.error, undefined, `the publication gate must run to completion: ${gate.error}`);
  assert.equal(
    gate.status, 0,
    'an all-refused generation must not block publication. The tier is a ceiling, never a quota, so an empty '
      + `attention set is a correct outcome. Gate exit ${gate.status}, signal ${gate.signal}. `
      + `stdout: ${String(gate.stdout).slice(-1500)} stderr: ${String(gate.stderr).slice(-1500)}`
  );
});

test('SCN-017-052 The build step derives its context from committed contracts and restates no module rule', async () => {
  const build = await loadBuildStep();
  const ctx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);

  /* 1. each context member IS the committed contract, not a second copy that
        happens to agree today. */
  assert.deepEqual(
    [...ctx.watchlistScope], [...briefContract.WATCHLIST_SCOPE],
    'the watchlist scope must be the committed watchlist.json scope the publication gate uses'
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(ctx.calendarSource)), JSON.parse(JSON.stringify(briefContract.XNYS_CALENDAR_SOURCE)),
    'the calendar must be the committed xnys-calendar/v1 artifact the publication gate uses'
  );
  assert.deepEqual(
    ctx.windowVocabulary, briefContract.windowVocabularyFrom(COMMITTED_BRIEF_CONFIG),
    'the window vocabulary must be the committed generation-window contract'
  );
  assert.equal(
    ctx.tradingDateIso, COMMITTED_PAYLOAD.nextSession.sessionDate,
    'the trading date must be the payload\'s own session date'
  );

  /* non-vacuity: an empty contract would satisfy every comparison above. */
  assert.ok(ctx.watchlistScope.length > 0, 'the committed watchlist scope must be non-empty');
  assert.ok(ctx.calendarSource.sessions.length > 0, 'the committed calendar must declare sessions');
  assert.ok(Object.keys(ctx.windowVocabulary).length > 0, 'the committed window vocabulary must declare windows');

  /* 2. the step CONSUMES the capability module rather than reimplementing it. */
  const source = readFileSync(BUILD_STEP_PATH, 'utf8');
  assert.match(source, /rlattention\.js/, 'the build step must load rlattention.js — the composer is not to be re-derived');
  assert.match(source, /buildAttentionItem\b/, 'the build step must call the certified composer by name');

  /* 3. it declares NO second copy of any certified vocabulary. */
  const vocabularies = [
    ['decision window', RLATTN.DECISION_WINDOWS, resolve(ROOT, 'rlattention.js')],
    ['lifecycle state', RLATTN.ATTENTION_LIFECYCLE_STATES, resolve(ROOT, 'rlattention.js')],
    ['transmission channel', CERTIFIED_CHANNELS, MARKET_ACTION_PATH],
    ['research verb', RLMARKETACTION.RESEARCH_VERBS, MARKET_ACTION_PATH]
  ];
  const restatedIn = (text, vocabulary) => vocabulary.filter(
    (term) => text.includes(`'${term}'`) || text.includes(`"${term}"`)
  );

  for (const [label, vocabulary, declaringModulePath] of vocabularies) {
    /* ADVERSARIAL FIRST: prove the detector FIRES against the module that
       really does declare this vocabulary. A restatement check that can never
       fire would make "the build step restates nothing" unfalsifiable. */
    const declaringSource = readFileSync(declaringModulePath, 'utf8');
    assert.equal(
      restatedIn(declaringSource, vocabulary).length, vocabulary.length,
      `the detector must find the whole ${label} vocabulary in the module that declares it, `
        + `otherwise the absence assertion below proves nothing. `
        + `Found ${restatedIn(declaringSource, vocabulary).length} of ${vocabulary.length}`
    );

    const restated = restatedIn(source, vocabulary);
    assert.notEqual(
      restated.length, vocabulary.length,
      `the build step must not restate the ${label} vocabulary. Each such rule must resolve to the module `
        + `rather than to a second copy that can drift. Restated terms: ${JSON.stringify(restated)}`
    );
  }

  /* 4. and the refusals it records are the MODULE's own codes, not locally
        invented strings. Non-vacuous: a refusal is produced first. */
  const available = unactionedSubjects(ctx);
  assert.ok(available.length > 0, 'the committed watchlist must leave at least one subject no action already covers');
  const refused = build.buildAttentionItems(
    [withoutField(completeCandidate(ctx, available[0]), 'invalidation')], COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG
  );
  assert.ok(refused.exclusions.length > 0, 'the probe must actually produce a refusal, or this assertion is vacuous');
  for (const exclusion of refused.exclusions) {
    assert.ok(
      RLATTN.REFUSAL_CODES.includes(exclusion.code),
      `every recorded code must belong to the module's closed set ${JSON.stringify(RLATTN.REFUSAL_CODES)}. `
        + `Received: ${JSON.stringify(exclusion)}`
    );
  }
});

test('SCN-017-053 The authoring instruction asks only for the authored judgement', () => {
  const instruction = attentionAuthoringInstruction();
  assert.ok(instruction.trim().length > 0, 'the attention lane must instruct the author about attention specifically');

  /* ADVERSARIAL FIRST: every absence probe below is proven to FIRE against the
     pre-F-017-06 ask it exists to forbid. An absence assertion whose detector
     cannot fire would pass against the exact instruction it is meant to reject. */
  for (const [label, pattern] of BUILD_STEP_DERIVED_ASKS) {
    assert.ok(
      pattern.test(PRIOR_INSTRUCTION_SHAPE),
      `the ${label} probe must fire against the pre-F-017-06 instruction shape, otherwise its absence `
        + 'assertion below is unfalsifiable'
    );
  }
  assert.ok(
    /decision-attention\/v1/i.test(PRIOR_INSTRUCTION_SHAPE),
    'the envelope probe must fire against the pre-F-017-06 instruction shape'
  );

  /* 1. it ASKS for each authored judgement field, separately, so a single
        dropped ask fails on its own line and names itself. An author never told
        to write a field will not write it, and the composer then refuses that
        candidate and it never publishes. */
  for (const [label, pattern] of AUTHORED_JUDGEMENT_ASKS) {
    assert.match(
      instruction, pattern,
      `the attention authoring instruction must ask for the ${label}. `
        + `Current attention instruction: ${JSON.stringify(instruction)}`
    );
  }

  /* 2. and it asks for NOTHING ELSE: the serialized fields belong to the build
        step, which derives each from a committed contract. Asking the lane for
        one reopens the three-publish compliance failure F-017-06 closed. */
  for (const [label, pattern] of BUILD_STEP_DERIVED_ASKS) {
    assert.equal(
      pattern.test(instruction), false,
      `the attention authoring instruction must NOT ask the lane for the ${label}. `
        + `Current attention instruction: ${JSON.stringify(instruction)}`
    );
  }
  assert.equal(
    /decision-attention\/v1/i.test(instruction), false,
    'the attention authoring instruction must not ask the lane to emit a decision-attention/v1 envelope at all. '
      + `Current attention instruction: ${JSON.stringify(instruction)}`
  );
});

/* ══════════════════════════════════════════════════════════════════════════
 * SCN-017-061 — the privacy refusal must not become the disclosure.
 *
 * `rlattention.js` raises RLATTN-PRIVACY when a candidate's subject sits
 * outside the public watchlist scope. The build step then records that refusal
 * with `subject: gateResult.subject` — the offending value, verbatim.
 *
 * The exclusion record is serialized into `market-brief.payload.json` and
 * committed to a PUBLIC repository. So a candidate refused BECAUSE it names
 * something private has that exact name published permanently, in git history,
 * by the very guard that refused it. That is worse than not checking at all:
 * the check creates a durable public record of precisely the values it
 * identified as out of scope.
 *
 * The fix is a redaction, not a deletion. An exclusion still has to be
 * actionable — an operator must be able to see WHICH candidate was refused and
 * WHY — so the second arm below asserts that a NON-privacy refusal keeps naming
 * its subject. That arm passes today and must keep passing, which is what makes
 * a blanket `subject: null` an over-correction rather than a fix.
 * ══════════════════════════════════════════════════════════════════════════ */

/* A subject the committed watchlist deliberately does not carry, shaped like a
   real private holding rather than a placeholder — this is exactly the value
   `checkSubject` refuses for being outside the public watchlist scope. It is a
   SENTINEL: distinctive enough that its presence anywhere in a serialized
   record is unambiguous, and never a substring of any committed ticker. */
const PRIVATE_SUBJECT_SENTINEL = 'PRIVATE-POSITION-NVDA-7f3c1a';

test('SCN-017-061 A candidate refused for privacy is recorded without leaking the offending value', async () => {
  const build = await loadBuildStep();

  /* ONE generation carrying TWO refusals for TWO DIFFERENT reasons, so a single
     run proves both that the private value is withheld and that a non-privacy
     refusal still names its subject. Split across two runs, a blanket
     `subject: null` would satisfy the first assertion and never meet the
     second. */
  const baseCtx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  assert.ok(baseCtx.watchlistScope.length > 0, 'the committed watchlist scope must be non-empty');
  const overlapSubject = baseCtx.watchlistScope[0];

  /* The overlap arm needs a subject a published action already covers. The
     action is declared here rather than borrowed from the committed payload so
     the fixture cannot quietly stop overlapping when the brief is regenerated
     four times a day. The step still derives the coverage itself, through the
     real `actionSubjectTickers`. */
  const payload = Object.assign({}, COMMITTED_PAYLOAD, {
    nextSession: Object.assign({}, COMMITTED_PAYLOAD.nextSession, {
      actions: [{ subject: `${overlapSubject} longer-term structural core - HOLD` }]
    })
  });
  const ctx = build.attentionBuildContext(payload, COMMITTED_BRIEF_CONFIG);
  assert.ok(
    ctx.publishedActionSubjects.includes(overlapSubject),
    `${overlapSubject} must genuinely be covered by a published action, or the overlap arm below refuses for some `
      + `other reason. Published action subjects: ${JSON.stringify(ctx.publishedActionSubjects)}`
  );

  const overlapping = completeCandidate(ctx, overlapSubject);

  const privateHolding = completeCandidate(ctx, overlapSubject);
  privateHolding.observed = Object.assign({}, privateHolding.observed, { subject: PRIVATE_SUBJECT_SENTINEL });

  /* ── NON-VACUITY ──────────────────────────────────────────────────────────
     The sentinel is a value the candidate GENUINELY carries, one the committed
     watchlist GENUINELY refuses, and one that IS findable in serialized JSON.
     Without all three, the absence assertion below would be searching for a
     string that was never there to leak, and would pass unfixed. */
  assert.equal(
    privateHolding.observed.subject, PRIVATE_SUBJECT_SENTINEL,
    'the refused candidate must actually carry the sentinel as its observed subject'
  );
  assert.equal(
    ctx.watchlistScope.includes(PRIVATE_SUBJECT_SENTINEL), false,
    `${PRIVATE_SUBJECT_SENTINEL} must genuinely sit outside the committed public watchlist scope. `
      + `Scope: ${JSON.stringify(ctx.watchlistScope)}`
  );
  assert.ok(
    JSON.stringify(privateHolding).includes(PRIVATE_SUBJECT_SENTINEL),
    'the sentinel must be findable in a serialized candidate, otherwise the absence assertion below cannot fire'
  );

  const candidates = [overlapping, privateHolding];
  const run = build.buildAttentionItems(candidates, payload, COMMITTED_BRIEF_CONFIG);

  /* 1. NEITHER candidate is silently dropped. Withholding a value must never
        cost the accounting: both refusals are still recorded, and published
        plus excluded still equals declared. */
  assert.deepEqual([...run.items], [], `neither candidate may publish. Published: ${JSON.stringify(run.items)}`);
  assert.equal(
    run.items.length + run.exclusions.length, candidates.length,
    `published plus excluded must equal declared. Received: ${JSON.stringify(run.exclusions)}`
  );

  const overlapEntry = run.exclusions.find((exclusion) => exclusion.index === 0);
  const privacyEntry = run.exclusions.find((exclusion) => exclusion.index === 1);

  assert.ok(
    privacyEntry,
    `the refused private candidate must remain identifiable by its index. Received: ${JSON.stringify(run.exclusions)}`
  );
  assert.equal(
    privacyEntry.code, 'RLATTN-PRIVACY',
    `the privacy refusal must carry the composer's own privacy code. Received: ${JSON.stringify(privacyEntry)}`
  );
  assert.ok(
    exclusionDetail(privacyEntry).length > 0,
    `the privacy refusal must still state why it was refused. Received: ${JSON.stringify(privacyEntry)}`
  );

  /* 2. SCOPED, NOT BLANKET. A non-privacy refusal still names its subject: an
        operator has to see WHICH watchlist ticker already carried an action.
        This arm passes today and must keep passing after the fix — deleting
        every subject would protect nothing here and destroy the diagnostic. */
  assert.ok(
    overlapEntry,
    `the overlapping candidate must remain identifiable by its index. Received: ${JSON.stringify(run.exclusions)}`
  );
  assert.equal(
    overlapEntry.code, 'RLATTN-OVERLAP',
    'the first refusal must be an overlap rather than a privacy refusal, or this arm proves nothing about '
      + `scoping. Received: ${JSON.stringify(overlapEntry)}`
  );
  assert.equal(
    overlapEntry.subject, overlapSubject,
    `a non-privacy refusal must keep naming its subject. ${overlapSubject} is a public watchlist ticker already `
      + 'published as an action, so withholding it protects nothing and removes the operator\'s only handle on '
      + `the refusal. Received: ${JSON.stringify(overlapEntry)}`
  );

  /* 3. THE DEFECT. Asserted on the SERIALIZED record, not on the `subject`
        field, so a fix that merely relocates the value into `field`, `reason`
        or a new key fails here exactly as loudly. */
  const serializedExclusions = JSON.stringify(run.exclusions);
  assert.equal(
    serializedExclusions.includes(PRIVATE_SUBJECT_SENTINEL), false,
    'a candidate refused BECAUSE its subject is outside the public watchlist scope must not have that subject '
      + 'written into the exclusion record. The record is serialized into market-brief.payload.json and committed '
      + 'to a public repository, so recording it publishes the exact value the guard identified as out of scope — '
      + 'permanently, in git history. A guard that refuses an item and then discloses it is worse than no guard. '
      + `Leaked value: ${JSON.stringify(PRIVATE_SUBJECT_SENTINEL)}. `
      + `Serialized exclusions: ${serializedExclusions}`
  );
  assert.equal(
    JSON.stringify(run).includes(PRIVATE_SUBJECT_SENTINEL), false,
    'the refused subject must appear nowhere in the build result — withholding it from the exclusions while '
      + `relocating it into the published items would disclose it just the same. Serialized run: ${JSON.stringify(run)}`
  );
});

/* ══════════════════════════════════════════════════════════════════════════
 * SCN-017-062 — the same refusal must not disclose on the OTHER sink.
 *
 * SCN-017-061 closes the RECORD sink: `attentionExclusions[].subject` no longer
 * carries the value the guard refused. STDOUT is a SECOND sink and it is not
 * the same sink. The build step's CLI prints one line per refusal, and that
 * line lands in terminal scrollback, in CI logs and in agent session
 * transcripts — none of which can be retracted afterwards. A redaction that
 * holds in the committed payload and leaks on the console has protected
 * nothing; it has only moved the disclosure somewhere harder to audit.
 *
 * Today the print site is safe for ONE reason: it reads `exclusion.subject`,
 * the value `recordableSubject` already filtered. The raw candidate list is in
 * scope at that very print site, so an edit that reaches back to
 * `observed.subject` to make the log "more useful" reopens the leak in full —
 * silently, with the committed record still looking clean and SCN-017-061 still
 * green. That is the regression this scenario exists to catch.
 *
 * So this runs the REAL script as a child process against a candidate file on
 * disk — the operator's own entry point — and asserts on the FULL captured
 * stream. `console.log` is not replaced, the build step is not re-implemented
 * and the composer is not mocked, so what is measured is the actual print path
 * rather than a proxy for it.
 *
 * Three arms, and the second and third are what make the first non-vacuous:
 *
 *   1. the refusal is still REPORTED, naming its candidate and its code, so a
 *      build step that simply fell silent fails here instead of passing arm 3
 *      for the uninteresting reason that it printed nothing at all;
 *   2. a NON-privacy refusal still prints its subject, which proves the printer
 *      prints subjects at all — without it, arm 3 would hold on a step that had
 *      stopped naming every subject, and the operator's diagnostic would be
 *      gone with no test objecting;
 *   3. the sentinel appears NOWHERE in the captured stream.
 * ══════════════════════════════════════════════════════════════════════════ */

/* Outside the committed watchlist and never a substring of any ticker in it, so
   finding it anywhere in captured output is unambiguous. Deliberately distinct
   from SCN-017-061's sentinel, so a leak names which sink it came out of. */
const STDOUT_SUBJECT_SENTINEL = 'PRIVATE-POSITION-ARKK-9d2e4b';

test('SCN-017-062 A privacy refusal never prints the offending value to stdout', async () => {
  const build = await loadBuildStep();

  /* The CLI reads the COMMITTED payload off disk — it takes no payload argument
     — so the non-privacy arm cannot inject its own action the way SCN-017-061
     does. Its subject is derived from the committed brief's own published
     actions, through the real `actionSubjectTickers`, rather than hardcoded. */
  const ctx = build.attentionBuildContext(COMMITTED_PAYLOAD, COMMITTED_BRIEF_CONFIG);
  assert.ok(
    ctx.publishedActionSubjects.length > 0,
    'the committed brief must name at least one watchlist ticker in its published actions, otherwise the '
      + 'non-privacy arm below cannot produce an overlap refusal and arm 2 would prove nothing. '
      + `Watchlist scope: ${JSON.stringify(ctx.watchlistScope)}. `
      + `Action subjects: ${JSON.stringify(ctx.publishedActionSubjects)}`
  );
  const overlapSubject = ctx.publishedActionSubjects[0];

  const overlapping = completeCandidate(ctx, overlapSubject);
  const privateHolding = completeCandidate(ctx, overlapSubject);
  privateHolding.observed = Object.assign({}, privateHolding.observed, { subject: STDOUT_SUBJECT_SENTINEL });
  const candidates = [overlapping, privateHolding];

  /* ── NON-VACUITY, established before the child runs ───────────────────────
     The sentinel is a value the candidate GENUINELY carries and one the
     committed watchlist GENUINELY refuses. Without both, arm 3 would be
     searching for a string that was never there to leak, and would pass on a
     build step that had never closed anything. */
  assert.equal(
    privateHolding.observed.subject, STDOUT_SUBJECT_SENTINEL,
    'the refused candidate must actually carry the sentinel as its observed subject'
  );
  assert.equal(
    ctx.watchlistScope.includes(STDOUT_SUBJECT_SENTINEL), false,
    `${STDOUT_SUBJECT_SENTINEL} must genuinely sit outside the committed public watchlist scope, or it is not `
      + `refused for privacy at all. Scope: ${JSON.stringify(ctx.watchlistScope)}`
  );

  const workdir = mkdtempSync(join(tmpdir(), 'rl-attn-stdout-'));
  let run;
  try {
    const candidatesPath = join(workdir, 'candidates.json');
    writeFileSync(candidatesPath, `${JSON.stringify(candidates, null, 2)}\n`);
    /* the build step is a separate process: proving the sentinel is in the file
       it reads is what proves the sentinel reached it. */
    assert.ok(
      readFileSync(candidatesPath, 'utf8').includes(STDOUT_SUBJECT_SENTINEL),
      'the candidate file handed to the child process must carry the sentinel, otherwise the absence assertion '
        + 'below is searching for a value the build step was never given'
    );
    run = spawnSync(process.execPath, ['scripts/build-attention-items.mjs', '--candidates', candidatesPath], {
      cwd: ROOT, encoding: 'utf8', timeout: 600000, maxBuffer: 32 * 1024 * 1024
    });
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }

  assert.equal(run.error, undefined, `the build step must run to completion: ${run.error && run.error.message}`);
  assert.equal(
    run.status, 0,
    'refusing a candidate is a correct outcome rather than a failure, so the build step must still exit 0. '
      + `Exit ${run.status}, signal ${run.signal}. stderr: ${String(run.stderr).slice(0, 2000)}`
  );

  const stdout = String(run.stdout || '');
  const stderr = String(run.stderr || '');

  /* the whole build report was printed, so "the sentinel is absent" below is a
     statement about a populated stream rather than an empty one. */
  assert.ok(
    stdout.includes('"contractVersion": "attention-build/v1"'),
    `the build step must have printed its full report, otherwise there is nothing to search. stdout: ${stdout}`
  );

  const refusalLines = stdout.split('\n').filter((line) => /refused candidate \d+/.test(line));
  const lineForCandidate = (index) => refusalLines.find(
    (line) => Number(/refused candidate (\d+)/.exec(line)[1]) === index
  );

  /* 1. REPORTED, NOT SILENCED. Withholding the value must not cost the report:
        both refusals are still announced, each against its own candidate. */
  assert.equal(
    refusalLines.length, candidates.length,
    'every refused candidate must still be announced on stdout — a build step that stopped printing refusals '
      + `would hide the leak rather than close it. Refusal lines: ${JSON.stringify(refusalLines)}`
  );

  const privacyLine = lineForCandidate(1);
  assert.ok(
    privacyLine,
    'the privacy refusal must still be announced against its own candidate index, so silence is never mistaken '
      + `for safety. Refusal lines: ${JSON.stringify(refusalLines)}`
  );
  assert.ok(
    privacyLine.includes('RLATTN-PRIVACY'),
    'the announced privacy refusal must name the composer\'s privacy code, so an operator can act on it without '
      + `being handed the withheld value. Received: ${JSON.stringify(privacyLine)}`
  );

  /* 2. SCOPED, NOT BLANKET — and the proof that this printer prints subjects at
        all. If this line did not name its subject, arm 3 would hold on a build
        step that had merely stopped printing subjects everywhere. */
  const overlapLine = lineForCandidate(0);
  assert.ok(
    overlapLine,
    `the non-privacy refusal must be announced against its own candidate index. Refusal lines: ${JSON.stringify(refusalLines)}`
  );
  assert.ok(
    overlapLine.includes('RLATTN-OVERLAP'),
    'the first candidate must be refused as an overlap rather than for privacy, or this arm proves nothing '
      + `about scoping. Received: ${JSON.stringify(overlapLine)}`
  );
  assert.ok(
    overlapLine.includes(`subject=${overlapSubject}`),
    `a non-privacy refusal must keep printing its subject. ${overlapSubject} is a public watchlist ticker the `
      + 'committed brief already publishes as an action, so withholding it protects nothing and removes the '
      + `operator's only handle on the refusal. Received: ${JSON.stringify(overlapLine)}`
  );

  /* 3. THE DEFECT. Asserted against the ENTIRE stream rather than one line or
        one field, so relocating the value into the summary line, into the
        serialized report or into any new field fails here exactly as loudly. */
  assert.equal(
    stdout.includes(STDOUT_SUBJECT_SENTINEL), false,
    'a candidate refused BECAUSE its subject sits outside the public watchlist scope must not have that subject '
      + 'printed to stdout. Console output reaches terminal scrollback, CI logs and agent session transcripts, '
      + 'none of which can be retracted, so printing it discloses the exact value the guard just refused — and '
      + 'discloses it somewhere no later commit can remove. '
      + `Leaked value: ${JSON.stringify(STDOUT_SUBJECT_SENTINEL)}. Full stdout: ${stdout}`
  );
  assert.equal(
    stderr.includes(STDOUT_SUBJECT_SENTINEL), false,
    `the refused subject must not reach stderr either — it is the same unretractable stream. Full stderr: ${stderr}`
  );
});

/* ── SCN-017-066 — A-017-10: FR-018 on the PUBLICATION path ──────────────────
   FR-018 is a rule about PUBLISHED items, and the composer is only one of the
   two ways an item reaches the payload. checkDeepLink shipped in the module's
   "shared field rules, expressed once and used by build and validate" section
   but was mirrored into buildAttentionItem only, so the gate accepted an
   unregistered link — and an item carrying no link at all — while the browser
   still rendered whatever shape passed its regex. Registry membership is the
   rule; a shape test is not a substitute for it. */
test('SCN-017-066 The publication gate refuses an absent or unregistered deep link', () => {
  const REGISTERED = 'market-heatmap-lab.html';
  const registryFiles = (REGISTRY?.tools || []).map((tool) => tool?.file).filter(Boolean);
  assert.ok(
    registryFiles.includes(REGISTERED),
    `the fixture's deep link must genuinely be a registered page, otherwise the passing half proves nothing. Registry files: ${JSON.stringify(registryFiles.slice(0, 5))}...`
  );

  /* the passing half: a registered page publishes and is not refused by name. */
  const registeredErrors = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem({ deepLink: REGISTERED })]), REGISTRY, CONFIG, null
  );
  assert.ok(
    !publishedFieldsNamed(registeredErrors).has('attention[0].deepLink'),
    'a deep link naming a registered tool page must publish. '
      + `Published errors naming an attention field: ${JSON.stringify(publishedAttentionRefusals(registeredErrors))}`
  );

  /* A SECTION of a registered page is still that page. `toolReads` carries
     `bond-regime-lab.html#simple` today and the browser's href guard admits a
     fragment, so a whole-string comparison would refuse a live link and put the
     gate and the render in disagreement. */
  const fragmentErrors = briefContract.validateBriefPayload(
    payloadWithAttention([attentionItem({ deepLink: `${REGISTERED}#simple` })]), REGISTRY, CONFIG, null
  );
  assert.ok(
    !publishedFieldsNamed(fragmentErrors).has('attention[0].deepLink'),
    'a fragment addressing a section of a REGISTERED page must publish. '
      + `Published errors naming an attention field: ${JSON.stringify(publishedAttentionRefusals(fragmentErrors))}`
  );

  /* ADVERSARIAL. Each of these published cleanly before A-017-10 was closed.
     The absent case is the one FR-018 names in as many words. */
  const HOSTILE = {
    'an unregistered but well-shaped page': 'attacker-controlled-page.html',
    'an unregistered page wearing a fragment': 'attacker-controlled-page.html#simple',
    'a javascript scheme': 'javascript:alert(1)',
    'a protocol-relative host escape': '//evil.example.com/x.html'
  };

  for (const [description, link] of Object.entries(HOSTILE)) {
    const errors = briefContract.validateBriefPayload(
      payloadWithAttention([attentionItem({ deepLink: link })]), REGISTRY, CONFIG, null
    );
    assert.ok(
      publishedFieldsNamed(errors).has('attention[0].deepLink'),
      `${description} must be refused BY NAME as attention[0].deepLink — the browser's href regex is a shape test and cannot reject a registered-looking page. `
        + `Refused: ${JSON.stringify(publishedAttentionRefusals(errors))}`
    );
    assert.ok(errors.length > 0, `the run for ${description} must exit non-zero`);
  }

  /* an item with NO deep link at all — the direct FR-018 violation. */
  const absent = withoutField(attentionItem(), 'deepLink');
  assert.equal(
    Object.prototype.hasOwnProperty.call(absent, 'deepLink'), false,
    'the fixture genuinely omits the deepLink key'
  );
  const absentErrors = briefContract.validateBriefPayload(
    payloadWithAttention([absent]), REGISTRY, CONFIG, null
  );
  assert.ok(
    publishedFieldsNamed(absentErrors).has('attention[0].deepLink'),
    'FR-018 says EVERY published item carries a deep link, so an item with none must be refused by name. '
      + `Refused: ${JSON.stringify(publishedAttentionRefusals(absentErrors))}`
  );
  assert.ok(absentErrors.length > 0, 'the absent-link run must exit non-zero');
});

/* ── SCN-017-067 — OBS-007-02: an empty tier must say why it is empty ────────
   Zero published is valid. Zero published with zero recorded exclusions is not:
   it is indistinguishable from a composer that silently dropped every candidate.
   The composer's own accounting check cannot catch it, because 0 built + 0
   excluded === 0 declared passes trivially when nothing was offered at all. */
test('SCN-017-067 An empty attention tier with no recorded exclusions is refused', () => {
  const FLOOR = 'empty with no recorded exclusions';
  const excluded = (reason) => ({ index: 0, code: 'RLATTN-HEADLINE', field: 'headline', reason });

  /* the gap: nothing published and nothing explained. */
  const silent = briefContract.validateBriefPayload(
    Object.assign(payloadWithAttention([]), { attentionExclusions: [] }), REGISTRY, CONFIG, null
  );
  assert.ok(
    silent.some((error) => String(error).includes(FLOOR)),
    'an empty tier carrying no exclusions must be refused — it cannot be told apart from a run that dropped every candidate. '
      + `Errors: ${JSON.stringify(silent)}`
  );
  assert.ok(silent.length > 0, 'the silent-empty run must exit non-zero');

  /* ADVERSARIAL, and the reason this is not just a non-empty check: an empty
     tier that DOES record why it is empty is legitimate and must still publish.
     A rule written as "attention must be non-empty" would fail this case. */
  const explained = briefContract.validateBriefPayload(
    Object.assign(payloadWithAttention([]), { attentionExclusions: [excluded('headline exceeded the ceiling')] }),
    REGISTRY, CONFIG, null
  );
  assert.ok(
    !explained.some((error) => String(error).includes(FLOOR)),
    'an empty tier WITH recorded exclusions is the declared empty state and must publish. '
      + `Errors: ${JSON.stringify(explained)}`
  );

  /* and a populated tier is unaffected either way. */
  const populated = briefContract.validateBriefPayload(
    Object.assign(payloadWithAttention([attentionItem()]), { attentionExclusions: [] }), REGISTRY, CONFIG, null
  );
  assert.ok(
    !populated.some((error) => String(error).includes(FLOOR)),
    'a populated tier must not be refused for carrying no exclusions. '
      + `Errors: ${JSON.stringify(populated)}`
  );
});

