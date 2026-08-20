#!/usr/bin/env node
/**
 * build-attention-items.mjs — the publish-time attention build step (F-017-06).
 *
 * WHY THIS EXISTS. The authoring lane used to emit a `decision-attention/v1`
 * envelope directly, guided by a prose instruction that named every required
 * field. Three consecutive cron publishes emitted ZERO conforming items while
 * that instruction was intact and the publication gate was armed. A prose
 * instruction to a language model is advisory; it is not a mechanical
 * guarantee.
 *
 * So the lane no longer emits an envelope at all. It authors only judgement —
 * a headline, the falsifiability triple, and the four judgement enums — and
 * THIS step constructs the envelope by calling the certified composer
 * `RLATTN.buildAttentionItem(gateResult, authored, ctx)` once per candidate.
 * Compliance becomes structural rather than advisory: the lane cannot emit a
 * non-conforming envelope when it no longer emits the envelope.
 *
 * The three arguments have three different origins and this file keeps them
 * apart on purpose:
 *
 *   gateResult  observed      — the candidate's own market facts
 *   authored    judgement     — what the lane wrote, and nothing else
 *   ctx         deterministic — committed calendar, watchlist and vocabulary
 *
 * NO DEFAULTS. A candidate the composer refuses is EXCLUDED and its named
 * `RLATTN-*` reason is recorded. Nothing is substituted, softened or retried
 * with a filled-in field: a refusal is the answer, not a problem to route
 * around. Excluding a candidate is always safe — the tier is a ceiling, never
 * a quota, so publishing six items instead of seven is a correct outcome.
 *
 * The context is single-sourced from scripts/validate-brief-payload.mjs so the
 * step that BUILDS an item and the gate that REFUSES one cannot disagree about
 * the watchlist scope, the exchange calendar or the window vocabulary.
 */

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BRIEF_PAYLOAD_BUDGET_CONTRACT,
  WATCHLIST_SCOPE,
  XNYS_CALENDAR_SOURCE,
  windowVocabularyFrom
} from './validate-brief-payload.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* rlattention.js is a UMD dual module, not ESM — the same load the validator
   and the browser use, so all three hold the identical frozen composer. */
const RLATTN = createRequire(import.meta.url)(resolve(ROOT, 'rlattention.js'));

/* This step is the LAST writer of the payload on the publication path, and it
   mutates default-visible content, so it owes a fresh measurement. rlcockpit.js
   owns the one measurement the composer and the validator already share. */
const RLCOCKPIT = createRequire(import.meta.url)(resolve(ROOT, 'rlcockpit.js'));
const RLATTNGATE = createRequire(import.meta.url)(resolve(ROOT, 'rlattentiongate.js'));

/* The snapshot is read lazily and defensively: a missing or unreadable snapshot
   yields no observations rather than aborting the composer. */
function loadSnapshotForGate() {
  try {
    return loadJson('market-brief.snapshot.json');
  } catch {
    return null;
  }
}

/** The judgement fields the lane owns. Anything outside this list is not authored. */
export const AUTHORED_JUDGEMENT_KEYS = Object.freeze([
  'headline', 'escalationTrigger', 'invalidation', 'expiry',
  'verb', 'horizon', 'severity', 'imminence', 'rationale'
]);

/**
 * The verb sentence handed to the authoring lane, rendered from the SAME frozen
 * array `rlattention.js` refuses on.
 * `verb` is a closed vocabulary, and the lane was told the field existed but
 * never which values it admits. A run then authored two well-formed items about
 * real watchlist subjects (SOXX, FETH) and the gate refused both `RLATTN-VERB`.
 * Restating the six verbs here as prose would fix that run and reopen the gap
 * the first time the vocabulary changes: the gate would move, this sentence
 * would not, and the author would again be refused over a value nobody offered
 * them. Rendering keeps the ask and the refusal on one array. Same reasoning,
 * and the same shape, as briefEventContractInstruction().
 */
export function attentionVerbContractInstruction() {
  const verbs = RLATTN.RESEARCH_VERBS;
  if (!Array.isArray(verbs) || verbs.length === 0) {
    throw new Error('RLATTN-VERB-CONTRACT: the certified research-verb vocabulary is unreadable');
  }
  return `An attention item's verb must be exactly one of ${verbs.join(', ')}; `
    + 'the publication gate refuses any other value, including an execution command.';
}

/**
 * The verbs the gate refuses on that a given instruction does NOT offer.
 *
 * Whole values are matched, never substrings: `verify` appears inside no other
 * verb today, but a future `verify-flows` would make a substring test report an
 * instruction as complete while the author was never offered the longer value.
 */
export function findAttentionVerbInstructionGaps(instruction) {
  const text = typeof instruction === 'string' ? instruction : '';
  return RLATTN.RESEARCH_VERBS.filter(
    (verb) => !new RegExp(`(^|[^A-Za-z0-9-])${verb}([^A-Za-z0-9-]|$)`).test(text)
  );
}

/** The verb vocabulary the gate refuses on, re-exported so callers read one array. */
export const ATTENTION_RESEARCH_VERBS = Object.freeze(RLATTN.RESEARCH_VERBS.slice());

/**
 * The expiry format, taught by a worked example the gate itself accepts.
 *
 * `expiry` is checked with a strict UTC pattern - a date alone, or an offset
 * form like +00:00, is not resolvable. The 03:50 EDT run lost FETH to exactly
 * that: the item was otherwise complete and in budget. The instruction said
 * "an expiry instant" and never said what an instant had to look like. The
 * example below is proven against rlattention's own isIsoInstant in the
 * selftest, so the shape shown to the author cannot drift from the shape the
 * gate admits.
 */
export function attentionExpiryFormatInstruction() {
  return 'Write expiry as a UTC instant of the exact form 2026-01-31T20:00:00Z - four-digit year, T, '
    + 'twenty-four-hour time, and a trailing Z. A date on its own, a local time, or a +00:00 offset is '
    + 'refused as unresolvable, and the item is dropped whole.';
}

/**
 * The per-card character budget, rendered from the committed output-budget policy.
 *
 * The 03:30 EDT run composed TWO complete items from real lane judgement and
 * still published nothing: `attention[0]` measured 314 characters against a cap
 * of 300, the payload validator refused the whole narrative, and the publish
 * fell back to a Tier-A data-only refresh. Fourteen characters cost the entire
 * brief. The lane was told a headline limit and never the CARD limit, which sums
 * four fields — so it could satisfy every field individually and still breach.
 */
export function attentionCardBudgetInstruction() {
  const policy = loadJson('market-brief.config.json')['output-budget/v1'];
  const prefix = 'attention[].';
  const fields = (policy.defaultVisibleFields || [])
    .filter((field) => typeof field === 'string' && field.startsWith(prefix))
    .map((field) => field.slice(prefix.length));
  return `Across each attention item, ${fields.join(' plus ')} must total at most `
    + `${policy.decisionCardChars} characters COMBINED, not each. An item over that cap fails the payload `
    + 'budget and the whole narrative is discarded, so every other item is lost with it. Stay clearly under '
    + 'the cap rather than close to it.';
}

/**
 * The eligible subjects, rendered from the SAME watchlist scope the privacy
 * check refuses on.
 *
 * Telling the lane an attention subject "must be on the committed watchlist"
 * still leaves it to recall which tickers those are, and it does not reliably
 * guess: the 03:13 EDT publish put four of five candidates on subjects that
 * resolved to nothing, having spent the same budget writing about the benchmark
 * and macro. The composer knows the admissible set exactly. Handing it over
 * turns an act of recall into an act of selection, which is the difference
 * between an instruction that usually holds and one that can be satisfied.
 */
export function attentionSubjectMenuInstruction() {
  return 'Choose every attention subject from exactly this list, and write its ticker verbatim in the '
    + `headline: ${WATCHLIST_SCOPE.join(', ')}. `
    + 'A subject outside this list is refused whole, so an item about the benchmark, an index or a macro '
    + 'theme reaches no reader however well argued — put that read in recommendations instead. Prefer a '
    + 'subject no published action already covers, because a duplicate is refused too.';
}

/**
 * The exact authored KEYS handed to the lane, rendered from AUTHORED_JUDGEMENT_KEYS.
 *
 * Prose does not hold. Successive publishes described the same nine fields in
 * words and the author supplied a different subset each time: 02:26 EDT carried
 * `escalationTrigger` and dropped `rationale`; 02:54 EDT, after `rationale` was
 * added to the prose, carried it and dropped `escalationTrigger`. Neither run
 * was refused for writing a bad item - both were refused for writing an
 * incomplete one, because a sentence that DESCRIBES fields leaves the author to
 * guess which literal keys the composer reads. This is the same failure the
 * events keys already have a comment about, and it takes the same fix: name the
 * keys, and render them from the contract so the ask cannot drift from it.
 */
export function attentionAuthoredKeysInstruction() {
  return 'Every attention item must carry all of these keys and omit none of them: '
    + `${AUTHORED_JUDGEMENT_KEYS.join(', ')}. `
    + 'An item missing any one of them is refused whole by the publication gate, so a partial item costs '
    + 'an attention slot and reaches no reader.';
}

function loadJson(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), 'utf8'));
}

/**
 * The tickers a published action already covers.
 *
 * An action's `subject` is prose ("SPY / SPMO longer-term structural core -
 * HOLD..."), while an attention item's `subject` is a bare watchlist ticker,
 * and the composer compares them with an EXACT string match. Handing the raw
 * prose across would therefore never match anything: the duplicate-suppression
 * guard would still run and could never fire. Projecting the prose down onto
 * the watchlist tickers it actually names is what makes the guard real.
 *
 * Matched on a word boundary, so `XLE` does not match inside a longer token.
 */
export function actionSubjectTickers(actions, watchlistScope) {
  const covered = new Set();
  for (const action of Array.isArray(actions) ? actions : []) {
    const text = typeof action?.subject === 'string' ? action.subject : '';
    if (!text) continue;
    for (const ticker of watchlistScope) {
      if (new RegExp(`(^|[^A-Za-z0-9])${ticker}([^A-Za-z0-9]|$)`).test(text)) covered.add(ticker);
    }
  }
  return Object.freeze([...covered]);
}

/**
 * The deterministic half of the build. Every member comes from a committed
 * artifact or from the payload's own session; nothing is synthesized. A member
 * no artifact can supply is left ABSENT so the composer refuses the item by
 * name, which is the whole point of a hard cutover.
 */export function attentionBuildContext(payload, config) {
  return Object.freeze({
    watchlistScope: WATCHLIST_SCOPE,
    calendarSource: XNYS_CALENDAR_SOURCE,
    windowVocabulary: windowVocabularyFrom(config),
    tradingDateIso: payload?.nextSession?.sessionDate,
    /* FR-018 allowlist. Registry-derived from the same toolReads channel the
       tier already publishes, so an item can only link to a tool that actually
       filed a read this generation. */
    toolDeepLinks: toolDeepLinkValues(payload),
    /* the window this generation is FOR. The lane no longer authors it — an
       author asked for a window types whichever one sounds right, and three
       publishes proved that. It is the generation's own property, so the build
       step reads it off the payload and the composer resolves it against the
       committed calendar. */
    generationWindow: payload?.window,
    /* the reader must not be told the same thing twice in one brief: a ticker
       already carried by an action makes an attention card on it a duplicate. */
    publishedActionSubjects: actionSubjectTickers(payload?.nextSession?.actions, WATCHLIST_SCOPE)
  });
}

/** Every tool page an item may link to this generation, from the published reads. */
export function toolDeepLinkValues(payload) {
  const reads = payload && typeof payload.toolReads === 'object' && payload.toolReads ? payload.toolReads : {};
  const links = [];
  for (const id of Object.keys(reads)) {
    const link = reads[id] && reads[id].deepLink;
    if (typeof link === 'string' && link && !links.includes(link)) links.push(link);
  }
  return Object.freeze(links);
}

/* FR-018. Resolved from the tool that produced the item's first figure, never
   from the candidate: a lane that could name its own destination could point a
   reader at any page, exactly as it could once name its own decision window.
   Unresolvable stays ABSENT so the composer refuses by name. */
function resolvedDeepLink(gateResult, payload) {
  const figures = gateResult && Array.isArray(gateResult.figures) ? gateResult.figures : [];
  const reads = payload && typeof payload.toolReads === 'object' && payload.toolReads ? payload.toolReads : {};
  for (const figure of figures) {
    const sourceId = figure && figure.provenance && figure.provenance.sourceId;
    const link = sourceId && reads[sourceId] && reads[sourceId].deepLink;
    if (typeof link === 'string' && link) return link;
  }
  return undefined;
}

/** Keep only what the lane is allowed to author, so a stray envelope field cannot ride along. */
export function authoredJudgementOnly(candidate) {
  const authored = {};
  for (const key of AUTHORED_JUDGEMENT_KEYS) {
    if (candidate && Object.prototype.hasOwnProperty.call(candidate, key)) authored[key] = candidate[key];
  }
  return authored;
}

/* The one refusal whose own subject is the thing being protected.
 *
 * ANCHORED to the module's frozen REFUSAL_CODES rather than restated as a bare
 * literal. The redaction path below keys off this code, so if rlattention.js
 * ever renamed it, an unanchored copy would not merely mislabel an exclusion —
 * this composer would stop recognising privacy refusals and record the withheld
 * subject verbatim. A silent copy fails in the one direction that leaks, which
 * is why the drift is made loud here instead of being left to a reviewer. */
const PRIVACY_REFUSAL_CODE = RLATTN.REFUSAL_CODES.find((code) => code === 'RLATTN-PRIVACY');
if (!PRIVACY_REFUSAL_CODE) {
  throw new Error(
    'rlattention.js no longer declares RLATTN-PRIVACY in REFUSAL_CODES, so the composer cannot '
    + 'know which refusal must be redacted. Refusing to compose rather than publishing a subject '
    + 'that was withheld for privacy. Declared codes: ' + JSON.stringify(RLATTN.REFUSAL_CODES)
  );
}

/** Recorded in place of a withheld subject — never mistakable for a ticker. */
const REDACTED_SUBJECT = '[redacted: privacy refusal]';

/**
 * What an exclusion is allowed to record as the refused candidate's subject.
 *
 * A privacy refusal is raised BECAUSE the candidate names something outside the
 * public scope. Recording that name publishes the exact value the guard just
 * refused — into `market-brief.payload.json`, committed to a public repository,
 * permanently, in git history. A guard that refuses a value and then discloses
 * it is worse than no guard, so the value is withheld and a marked placeholder
 * takes its place. `index`, `code`, `field` and `reason` are untouched: the
 * refusal stays countable and actionable, only the offending value goes.
 *
 * Keyed on the CODE, not on one call site — `rlattention.js` raises
 * `RLATTN-PRIVACY` both for a subject outside the watchlist scope and for a
 * position field, and both must withhold.
 *
 * Deliberately scoped to that code alone. Every other refusal keeps naming its
 * subject: an overlap refusal is about a public watchlist ticker, so withholding
 * it would protect nothing and would remove the operator's only handle on the
 * refusal.
 */
function recordableSubject(code, subject) {
  if (typeof subject !== 'string') return null;
  return code === PRIVACY_REFUSAL_CODE ? REDACTED_SUBJECT : subject;
}

/**
 * Build every candidate through the certified composer.
 *
 * Returns `{ items, exclusions }`. `items` are conforming
 * `decision-attention/v1` envelopes in candidate order; `exclusions` carry the
 * composer's own `RLATTN-*` code, the offending field and the candidate's
 * identity, so a refusal can be acted on rather than merely counted — with the
 * offending value withheld when the refusal is itself a privacy refusal, per
 * `recordableSubject`.
 */
export function buildAttentionItems(candidates, payload, config) {
  const ctx = attentionBuildContext(payload, config);
  const items = [];
  const exclusions = [];

  (Array.isArray(candidates) ? candidates : []).forEach((candidate, index) => {
    const observed = candidate && typeof candidate === 'object' ? candidate.observed : null;

    /* The deep link is composer-resolved for the same reason the window is:
       both are properties of the generation, not judgements the lane may make. */
    const gateResult = observed && typeof observed === 'object'
      ? Object.assign({}, observed, { deepLink: resolvedDeepLink(observed, payload) })
      : observed;

    /* The authored judgement, plus the ONE window the lane is no longer allowed
       to pick. Merged after the strip, never before: a candidate that tried to
       author its own window still loses it, and what the composer resolves is
       always this generation's real window. */
    const authored = Object.assign(authoredJudgementOnly(candidate), { decisionWindow: ctx.generationWindow });
    const built = RLATTN.buildAttentionItem(gateResult, authored, ctx);

    if (built && built.ok === false) {
      /* the offending value is filtered HERE, at the only place it could enter
         the record, so no downstream reader of an exclusion can republish it. */
      exclusions.push(Object.freeze({
        index,
        subject: recordableSubject(built.code, gateResult ? gateResult.subject : null),
        code: built.code,
        field: built.field,
        reason: built.message
      }));
      return;
    }
    /* the composer answers with a { ok, item } result; what publishes is the
       envelope inside it, never the wrapper. */
    items.push(built && Object.prototype.hasOwnProperty.call(built, 'item') ? built.item : built);
  });

  return Object.freeze({ items: Object.freeze(items), exclusions: Object.freeze(exclusions) });
}

/** The gate half and the judgement half of a published envelope, so an already
    serialized item can be reduced back to the candidate that would produce it. */
const GATE_KEYS = Object.freeze(['gateId', 'disposition', 'subject', 'severity', 'imminence', 'observedAt',
  'transmissionPath', 'transmissionAbsenceNote', 'marketConfirmation', 'marketConfirmationNote', 'figures']);
const AUTHORED_KEYS = Object.freeze(['headline', 'rationale', 'verb', 'horizon', 'escalationTrigger', 'invalidation', 'expiry']);

/**
 * Reduce a published `decision-attention/v1` envelope back to the candidate the
 * lane would have handed over. Used to re-compose an existing payload through
 * the composer, which is how a payload authored before the cutover is checked
 * against the rules it never passed through.
 */
export function candidateFromPublishedItem(item) {
  const observed = {};
  for (const key of GATE_KEYS) if (item && item[key] !== undefined) observed[key] = item[key];
  const candidate = { observed };
  for (const key of AUTHORED_KEYS) if (item && item[key] !== undefined) candidate[key] = item[key];
  return candidate;
}

/**
 * Re-compose a payload's own attention items through the certified composer and
 * return the payload it SHOULD carry.
 *
 * Additive in both directions. The payload keeps every pre-existing top-level
 * key, and each surviving item keeps every field the composer does not own —
 * `title`, `what`, `why`, `structuralAnchor` and the rest belong to the older
 * catalyst contract, and a straight replace would silently delete them. The
 * composer's envelope is merged OVER the published item, so it wins on the
 * fields it owns and is silent on the fields it does not.
 *
 * An item the composer refuses is dropped from `attention` and recorded in
 * `attentionExclusions` with its named reason — never silently, never defaulted
 * back into shape.
 */
export function recomposePayloadAttention(payload, config) {
  const published = Array.isArray(payload?.attention) ? payload.attention : [];
  const rawCandidates = published.map((item) => item && item.contractVersion === 'decision-attention/v1'
    ? candidateFromPublishedItem(item)
    : item);
  /* BUG-009 R1. The lane authors judgement and never observes, so a candidate that
     reaches here without an `observed` half is refused RLATTN-PROVENANCE and the feed
     publishes nothing. Attach the observed half from committed Tier-A state, banded by
     the owner-declared attention-detection-policy/v1. With no policy declared this is
     a no-op and the prior refusal stands, which is the honest outcome. */
  const candidates = RLATTNGATE.attachObserved(
    rawCandidates,
    loadSnapshotForGate(),
    config && config['attention-detection-policy/v1']
  );
  const { items, exclusions } = buildAttentionItems(candidates, payload, config);

  if (items.length + exclusions.length !== candidates.length) {
    throw new Error(`recompose accounting failed: ${items.length} built + ${exclusions.length} excluded != ${candidates.length} declared`);
  }

  /* Pair each built envelope back to the item it came from BY CANDIDATE ORDER,
     not by id: the composer mints its own id, so an id-join silently matches
     nothing and merges nothing. Items come back in candidate order with the
     refused indices missing, so walking the sources and skipping the excluded
     ones lines them up exactly. */
  const excludedIndices = new Set(exclusions.map((exclusion) => exclusion.index));
  const sources = published.filter((item, index) => !excludedIndices.has(index));
  if (sources.length !== items.length) {
    throw new Error(`recompose pairing failed: ${sources.length} surviving source(s) against ${items.length} built item(s)`);
  }
  const merged = items.map((built, index) => sources[index]?.contractVersion === 'decision-attention/v1'
    ? Object.assign({}, sources[index], built)
    : built);

  /* Additive or nothing, applied to the RECORD and not only to the key set. A recompose with no
     candidates learned nothing about exclusions, so replacing the prior record with an empty list
     would erase a previous run's accounting and leave an empty tier that no longer says why it is
     empty. The freshly computed list is authoritative only when there were candidates to account
     for; otherwise the existing record stands. */
  const priorExclusions = Array.isArray(payload?.attentionExclusions) ? payload.attentionExclusions : [];
  const recordedExclusions = candidates.length > 0 ? exclusions : priorExclusions;

  return {
    payload: Object.assign({}, payload, { attention: merged, attentionExclusions: recordedExclusions }),
    items: merged,
    exclusions
  };
}

/**
 * CLI. Reads a candidate file, prints the built envelopes and every named
 * exclusion. Exit 0 means the build ran, NOT that every candidate survived —
 * refusing a candidate is a correct outcome, so it is reported, not fatal.
 *
 * `--recompose` re-composes the committed payload's own attention items instead
 * of reading a candidate file, and `--write` persists the result.
 */
function main(argv) {
  const payloadArg = argv.indexOf('--payload');
  if (payloadArg !== -1 && !argv[payloadArg + 1]) {
    console.error('build-attention-items: --payload requires a path');
    return 2;
  }
  const payloadPath = payloadArg === -1 ? resolve(ROOT, 'market-brief.payload.json') : resolve(ROOT, argv[payloadArg + 1]);
  const defaultPayloadPath = resolve(ROOT, 'market-brief.payload.json');
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  const config = loadJson('market-brief.config.json');

  if (argv.includes('--recompose')) {
    const before = Object.keys(payload);
    const result = recomposePayloadAttention(payload, config);
    console.log(`[build-attention-items] recomposed: ${result.items.length} built, ${result.exclusions.length} refused`);
    /* prints the RECORDED subject, already redacted for a privacy refusal. Never
       reach back to the candidate here: stdout reaches CI logs and transcripts
       that cannot be retracted. */
    for (const exclusion of result.exclusions) {
      console.log(`[build-attention-items] refused ${exclusion.subject || `candidate ${exclusion.index}`}`
        + ` — ${exclusion.code} on ${exclusion.field}: ${exclusion.reason}`);
    }
    /* additive or nothing: a recompose that dropped or renamed a pre-existing
       key would be a rewrite, and this step is not allowed to be one. */
    const after = Object.keys(result.payload);
    const lost = before.filter((key) => !after.includes(key));
    if (lost.length) {
      console.error(`[build-attention-items] refusing to write: recompose lost pre-existing key(s) ${lost.join(', ')}`);
      return 2;
    }
    /* Re-measure before the write. The composer measured a payload that still held
       the candidate cards; every card the gate above refused has since left the
       default-visible set, so the inherited figure describes a payload that was
       never published. Publishing a budget that contradicts its own content is the
       exact defect this feature exists to remove, so the last writer re-measures
       rather than inheriting. Recomposing without --write leaves the file alone,
       but the returned object is corrected either way so a caller reading it in
       memory sees the same numbers the file would carry. */
    const budgetPolicy = config['output-budget/v1'];
    if (result.payload.contractVersion === BRIEF_PAYLOAD_BUDGET_CONTRACT
      && budgetPolicy && typeof budgetPolicy === 'object' && !Array.isArray(budgetPolicy)) {
      /* Drop the inherited block BEFORE measuring, the same order the composer uses. Leaving it
         in place would count the previous measurement's own violation paths and cap names into
         disclosedTotal, so the figure would describe the metadata as well as the narrative and
         no later verification could reproduce it. */
      delete result.payload.budget;
      result.payload.budget = RLCOCKPIT.measureDefaultVisible(result.payload, budgetPolicy);
      console.log(`[build-attention-items] re-measured output budget: total=${result.payload.budget.total}`
        + ` disclosed=${result.payload.budget.disclosedTotal} violations=${result.payload.budget.violations.length}`);
    }
    if (argv.includes('--write')) {
      writeFileSync(payloadPath, `${JSON.stringify(result.payload, null, 2)}\n`);
      console.log(`[build-attention-items] wrote ${payloadPath === defaultPayloadPath ? 'market-brief.payload.json' : 'private payload candidate'}`);
    } else {
      console.log('[build-attention-items] --recompose without --write: nothing written');
    }
    return 0;
  }

  const candidatesArg = argv.indexOf('--candidates');
  if (candidatesArg === -1 || !argv[candidatesArg + 1]) {
    console.error('build-attention-items: --candidates <path-to-json> is required. '
      + 'The build step never invents candidates; it composes the ones the authoring lane produced.');
    return 2;
  }
  const rawCandidates = JSON.parse(readFileSync(resolve(ROOT, argv[candidatesArg + 1]), 'utf8'));
  /* BUG-009 R1. This is the PRIMARY path the scheduled publisher uses; --recompose only
     re-derives from an already-published feed. The observed half must be attached here
     too, or a lane candidate is refused RLATTN-PROVENANCE exactly as before and the fix
     is a no-op in production. */
  const candidates = RLATTNGATE.attachObserved(
    rawCandidates,
    loadSnapshotForGate(),
    config && config['attention-detection-policy/v1']
  );
  const { items, exclusions } = buildAttentionItems(candidates, payload, config);

  console.log(`[build-attention-items] ${items.length} built, ${exclusions.length} refused`);
  /* prints the RECORDED subject, already redacted for a privacy refusal. Never
     reach back to the candidate here: stdout reaches CI logs and transcripts
     that cannot be retracted. */
  for (const exclusion of exclusions) {
    console.log(`[build-attention-items] refused candidate ${exclusion.index}`
      + `${exclusion.subject ? ` (subject=${exclusion.subject})` : ''}`
      + ` — ${exclusion.code} on ${exclusion.field}: ${exclusion.reason}`);
  }
  console.log(JSON.stringify({ contractVersion: 'attention-build/v1', items, exclusions }, null, 2));
  return 0;
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exit(main(process.argv.slice(2)));
}
