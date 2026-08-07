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
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  WATCHLIST_SCOPE,
  XNYS_CALENDAR_SOURCE,
  windowVocabularyFrom
} from './validate-brief-payload.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* rlattention.js is a UMD dual module, not ESM — the same load the validator
   and the browser use, so all three hold the identical frozen composer. */
const RLATTN = createRequire(import.meta.url)(resolve(ROOT, 'rlattention.js'));

/** The judgement fields the lane owns. Anything outside this list is not authored. */
export const AUTHORED_JUDGEMENT_KEYS = Object.freeze([
  'headline', 'escalationTrigger', 'invalidation', 'expiry',
  'verb', 'horizon', 'severity', 'imminence', 'rationale'
]);

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
 */
export function attentionBuildContext(payload, config) {
  return Object.freeze({
    watchlistScope: WATCHLIST_SCOPE,
    calendarSource: XNYS_CALENDAR_SOURCE,
    windowVocabulary: windowVocabularyFrom(config),
    tradingDateIso: payload?.nextSession?.sessionDate,
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

/** Keep only what the lane is allowed to author, so a stray envelope field cannot ride along. */
export function authoredJudgementOnly(candidate) {
  const authored = {};
  for (const key of AUTHORED_JUDGEMENT_KEYS) {
    if (candidate && Object.prototype.hasOwnProperty.call(candidate, key)) authored[key] = candidate[key];
  }
  return authored;
}

/**
 * Build every candidate through the certified composer.
 *
 * Returns `{ items, exclusions }`. `items` are conforming
 * `decision-attention/v1` envelopes in candidate order; `exclusions` carry the
 * composer's own `RLATTN-*` code, the offending field and the candidate's
 * identity, so a refusal can be acted on rather than merely counted.
 */
export function buildAttentionItems(candidates, payload, config) {
  const ctx = attentionBuildContext(payload, config);
  const items = [];
  const exclusions = [];

  (Array.isArray(candidates) ? candidates : []).forEach((candidate, index) => {
    const gateResult = candidate && typeof candidate === 'object' ? candidate.observed : null;

    /* The authored judgement, plus the ONE window the lane is no longer allowed
       to pick. Merged after the strip, never before: a candidate that tried to
       author its own window still loses it, and what the composer resolves is
       always this generation's real window. */
    const authored = Object.assign(authoredJudgementOnly(candidate), { decisionWindow: ctx.generationWindow });
    const built = RLATTN.buildAttentionItem(gateResult, authored, ctx);

    if (built && built.ok === false) {
      exclusions.push(Object.freeze({
        index,
        subject: gateResult && typeof gateResult.subject === 'string' ? gateResult.subject : null,
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

/**
 * CLI. Reads a candidate file, prints the built envelopes and every named
 * exclusion. Exit 0 means the build ran, NOT that every candidate survived —
 * refusing a candidate is a correct outcome, so it is reported, not fatal.
 */
function main(argv) {
  const candidatesArg = argv.indexOf('--candidates');
  if (candidatesArg === -1 || !argv[candidatesArg + 1]) {
    console.error('build-attention-items: --candidates <path-to-json> is required. '
      + 'The build step never invents candidates; it composes the ones the authoring lane produced.');
    return 2;
  }
  const candidates = JSON.parse(readFileSync(resolve(ROOT, argv[candidatesArg + 1]), 'utf8'));
  const payload = loadJson('market-brief.payload.json');
  const config = loadJson('market-brief.config.json');
  const { items, exclusions } = buildAttentionItems(candidates, payload, config);

  console.log(`[build-attention-items] ${items.length} built, ${exclusions.length} refused`);
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
