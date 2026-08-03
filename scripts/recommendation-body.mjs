/*
 * scripts/recommendation-body.mjs — the ONE definition of a recommendation's persisted body.
 *
 * Why this exists: the append-only ledger under briefs/history/recommendations/<month>.jsonl used to
 * carry ONLY a hash pair (recommendationKey + eventId). The instrument, direction, levels, trigger and
 * invalidation lived exclusively in market-brief.payload.json, which is OVERWRITTEN every run — so every
 * published call became unscoreable the moment the next window ran. This module derives the durable body
 * that travels WITH the event, so a later evaluator can score a call against its own published terms.
 *
 * Consumed by:
 *   - scripts/brief-distributed-publish.mjs  (live publication, forward from now)
 *   - scripts/backfill-recommendations.mjs   (recovery of the pre-existing git history)
 *   - scripts/evaluate-recommendations.mjs   (scoring against data/bars)
 *
 * Contracts are ADDITIVE: v1 rows stay readable; v2 rows carry the same keys plus the body.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const BODY_CONTRACT = 'brief-recommendation-body/v1';
export const ROW_CONTRACT_V2 = 'brief-recommendation-history-row/v2';

/* The action families the brief publishes, and their directional sign. Mirrors rlcontracts
   ACTION_DIRECTION so a ledger row never invents a family the contract layer does not know. */
export const ACTION_DIRECTION = Object.freeze({ add: 1, rotate: 1, trim: -1, hedge: -1, hold: 0 });

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

export function stableSha(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(sortValue(value))).digest('hex')}`;
}

/**
 * recommendationKeyFor(subject, family) — STABLE across runs so the ledger reads one coherent lifecycle
 * per (subject, family). Byte-identical to the formula brief-distributed-publish.mjs already publishes;
 * changing it would fork the join key and orphan 215 existing rows.
 */
export function recommendationKeyFor(subject, family) {
  return stableSha({ contractVersion: 'brief-distributed-reckey/v1', subject, family });
}

/* ── instrument universe ─────────────────────────────────────────────────────────────────────────
   Grounded in what the repo actually holds: the committed same-origin bar/option snapshots plus the
   watchlist. An "instrument" is only recognised if we could actually evaluate it later. */

const UNIVERSE_CACHE = new Map();

export function loadInstrumentUniverse(root) {
  const resolved = path.resolve(root || '.');
  if (UNIVERSE_CACHE.has(resolved)) return UNIVERSE_CACHE.get(resolved);
  const symbols = new Set();
  for (const dir of ['data/bars', 'data/options']) {
    const abs = path.join(resolved, dir);
    if (!existsSync(abs)) continue;
    for (const file of readdirSync(abs)) {
      if (!file.endsWith('.json') || file === 'index.json') continue;
      const sym = file.slice(0, -'.json'.length);
      // FX pairs (AUDUSD=X) and index proxies are kept verbatim; prose never names them with "=X".
      if (/^[A-Z][A-Z0-9.\-^]{0,9}$/.test(sym)) symbols.add(sym);
    }
  }
  const watchlistPath = path.join(resolved, 'watchlist.json');
  if (existsSync(watchlistPath)) {
    try {
      const wl = JSON.parse(readFileSync(watchlistPath, 'utf8'));
      for (const item of wl.items || []) if (item && item.ticker) symbols.add(String(item.ticker).toUpperCase());
    } catch { /* a malformed watchlist must not sink publication */ }
  }
  const universe = Object.freeze(symbols);
  UNIVERSE_CACHE.set(resolved, universe);
  return universe;
}

/* Uppercase tokens that are English words or brief jargon, never instruments. Without this the
   extractor would "find" a ticker in every emphatic sentence the narrative writes. */
const NOT_A_TICKER = new Set([
  'A', 'ALL', 'AN', 'AND', 'ARE', 'AS', 'AT', 'BE', 'BUT', 'BY', 'CAN', 'DO', 'FOR', 'GO', 'HAS', 'IF',
  'IN', 'IS', 'IT', 'NO', 'NOT', 'OF', 'ON', 'OR', 'SO', 'THE', 'TO', 'UP', 'US', 'VS', 'WE',
  'ADD', 'BUY', 'CUT', 'HOLD', 'ONLY', 'OVER', 'RISK', 'SELL', 'TRIM', 'WATCH', 'CLOSE', 'OPEN',
  'HIGH', 'LOW', 'NEW', 'NOW', 'YES', 'ET', 'EOD', 'ATH', 'MA', 'RSI', 'OI', 'DTE', 'IV', 'GEX',
  'OOS', 'CAGR', 'NAV', 'PMI', 'CPI', 'GDP', 'FOMC', 'OPEX', 'VWAP', 'POC', 'HVN', 'LVN', 'ORB'
]);

/**
 * extractInstruments(text, universe) — tickers the call actually names, in first-appearance order.
 * Membership in the committed data universe is REQUIRED: a symbol we hold no bars for could never be
 * scored, so admitting it would manufacture a false promise of evaluability.
 */
export function extractInstruments(text, universe) {
  if (typeof text !== 'string' || !text) return [];
  const found = [];
  const seen = new Set();
  for (const match of text.matchAll(/\b\^?[A-Z][A-Z0-9.]{0,5}\b/g)) {
    const token = match[0];
    if (seen.has(token) || NOT_A_TICKER.has(token)) continue;
    if (!universe.has(token)) continue;
    seen.add(token);
    found.push(token);
  }
  return found;
}

/* Relation words that qualify a numeric level, mapped to the comparison a later evaluator runs.
   Anchored and case-insensitive because these are matched against single tokens, and the narrative
   capitalises them for emphasis. */
const ABOVE_WORDS = /^(?:above|over|reclaims?|reclaim(?:ing|ed)|retakes?|exceeds?|clears?|through|breakout)$/i;
const BELOW_WORDS = /^(?:below|under|beneath|loses?|losing|lost|breaks?|breakdown|fails?|failing|undercuts?)$/i;

/* The narrative routinely closes an invalidation with the UPSIDE case in the same field:
   "... keeps the core a hold-not-add. Upside: a confirmed close reclaiming the SPY 50-day ... turns
   the core into an add." Read literally, that upside gate would be scored as an invalidation — so a
   thesis that IMPROVED would be recorded as broken. These markers re-attribute such a clause to the
   trigger side, where it belongs. */
/* The improvement branch a narrative appends to an invalidation field ("... OR confirms a daily
   close holding above its 50-day and restacks"). A match flips the level from invalidation to
   trigger, so a FALSE match deletes the risk side of a call and makes it unscoreable.

   `re-?opens? the` used to be listed bare. Measured against every published brief, it matched
   26 times and was WRONG all 26: 25x "re-opens the structural DOWNSIDE" and 1x "re-open the
   crack" — invalidation language, not upside. It now requires an actual upside object. */
const UPSIDE_CLAUSE = /\b(?:upside|turns? (?:the )?(?:core|call|stance) into|opens? the (?:add[- ]?gate|gate)|would (?:turn|open)|re-?opens? the (?:add[- ]?gate|gate|upside|long))\b/i;

/**
 * extractLevels(text, universe) — machine-checkable {instrument, relation, value} triples parsed from a
 * call's OWN published prose. Attribution walks left-to-right holding the most recent named instrument,
 * which is how the narrative actually writes ("SPY 50-day ~744 ... QQQ 50-day ~715").
 *
 * A price GATE is recognised only by the brief's own "~" convention ("reclaims the SPY 50-day (~743.9)").
 * A bare number is deliberately NOT a level: "50-day", "20>50>200", "-0.31%" and "7/31" are all bare
 * numbers, and admitting them would fabricate gates the author never published. A number with no
 * instrument or no direction word in scope is likewise discarded rather than guessed — an unattributable
 * level is exactly the case that must later resolve `not-evaluable`.
 *
 * Each level carries `upside`, true when its clause reads as the improvement case rather than the
 * break case, so the caller can attribute it to the right side of the call.
 */
export function extractLevels(text, universe, options) {
  if (typeof text !== 'string' || !text) return [];
  const defaultInstrument = (options && options.defaultInstrument) || null;
  // Opt-in, invalidation-only. See the asymmetry note at the number pattern below.
  const allowBareDecimal = !!(options && options.allowBareDecimal);
  const levels = [];
  const seen = new Set();
  // Split on sentence-ish boundaries so a relation word cannot leak across unrelated clauses.
  for (const clause of text.split(/(?<=[.;])\s+|\s+—\s+/)) {
    const upside = UPSIDE_CLAUSE.test(clause);
    // A single-name call routinely drops the ticker after the first mention ("holding back above the
    // 50-day (~401.1)"). Seeding the clause with that one instrument recovers the gate; it is only
    // safe when the call names exactly one, which is why the caller decides.
    let current = defaultInstrument;
    let relation = null;
    // A level is normally a tilde-approximated number ("~432.3"). Requiring the tilde EVERYWHERE
    // lost every precisely-authored gate — "a break below the 740.09 flip" extracted nothing — which
    // was the largest single cause of unscoreable calls.
    //
    // But a bare decimal is ambiguous: "closes above 741.69 on 7/31" is a DESCRIPTION of a past
    // close, syntactically identical to a gate. So the widening is deliberately ASYMMETRIC and is
    // opted into only by the invalidation scan:
    //   - a missed level      -> the call is withheld from scoring. Honest, conservative.
    //   - a fabricated trigger -> a free "satisfied", which INFLATES the hit rate. Unacceptable.
    //   - a fabricated invalidation -> a "miss". Costs us, never flatters us.
    // Recovering the risk side is therefore safe; recovering the win side is not.
    // A bare INTEGER is still refused on both sides: in this corpus integers are periods and
    // thresholds ("the 50-day", "20>50>200", "rsMom >100"), not prices.
    const NUMBER = allowBareDecimal
      ? /\^?[A-Za-z][A-Za-z0-9.'-]{0,9}|~\d[\d,]*\.?\d*|\d[\d,]*\.\d+/g
      : /\^?[A-Za-z][A-Za-z0-9.'-]{0,9}|~\d[\d,]*\.?\d*/g;
    for (const match of clause.matchAll(NUMBER)) {
      const token = match[0];
      if (/[A-Za-z]/.test(token)) {
        // Relation words win over ticker membership: the narrative writes them in caps for emphasis
        // ("a CONFIRMED daily CLOSE that RECLAIMS the SPY 50-day (~743.9)"), so a case-sensitive
        // ticker test would silently swallow the very word that qualifies the level.
        if (ABOVE_WORDS.test(token)) { relation = 'above'; continue; }
        if (BELOW_WORDS.test(token)) { relation = 'below'; continue; }
        const upper = token.toUpperCase();
        if (token === upper && universe.has(upper) && !NOT_A_TICKER.has(upper)) current = upper;
        continue;
      }
      // Reject "~50-day", "~20%", "~7/31" — a suffix that turns the number into a period, a
      // percentage or a date, never a price gate.
      const trailing = clause.slice(match.index + token.length, match.index + token.length + 6);
      if (/^\s*(?:%|-?\s*(?:day|week|month|year|session|bar)|\/|>|<|x\b)/i.test(trailing)) continue;
      // Reject a number that is the TAIL of a date or a ratio ("7/31", "20>50>200"). The trailing
      // guard cannot see this because the disqualifier sits BEFORE the digits.
      const preceding = clause.slice(Math.max(0, match.index - 1), match.index);
      if (/[\/>>=<]/.test(preceding)) continue;
      const numeric = Number(token.replace(/^~/, '').replace(/,/g, ''));
      if (!Number.isFinite(numeric) || numeric <= 0) continue;
      if (!current || !relation) continue;
      const key = `${current}|${relation}|${numeric}`;
      if (seen.has(key)) continue;
      seen.add(key);
      levels.push({ instrument: current, relation, value: numeric, upside });
    }
  }
  return levels;
}

/**
 * buildRecommendationBody(action, options) — the durable, flat body persisted beside the hash.
 * Every field is either copied verbatim from what the brief PUBLISHED, or derived from that same text.
 * Nothing is inferred from a later observation; nothing is filled with a plausible placeholder.
 */
export function buildRecommendationBody(action, options) {
  const opts = options || {};
  const universe = opts.universe || loadInstrumentUniverse(opts.root || '.');
  const str = (value) => (typeof value === 'string' && value.trim() ? value : null);

  const subject = str(action.subject) || '';
  const direction = str(action.action);
  const trigger = str(action.trigger);
  const invalidation = str(action.invalidation);
  const structuralAnchor = str(action.structuralAnchor);
  const rationale = str(action.rationale);

  const scanned = [subject, structuralAnchor, trigger, invalidation].filter(Boolean).join(' \u2014 ');
  const instruments = extractInstruments(scanned, universe);
  const defaultInstrument = instruments.length === 1 ? instruments[0] : null;
  const levelOptions = { defaultInstrument };

  // Which side a level belongs to is decided by the call's OWN declared direction, not by keywords
  // alone. For a long-biased call (add/rotate/hold) the break case is a level given up on the
  // DOWNSIDE; an `above` level inside the invalidation field is the improvement branch the narrative
  // habitually appends ("... OR confirms a daily close holding above its 50-day and restacks"). Read
  // literally that would score a recovering thesis as broken. The mirror holds for a short-biased
  // call (trim/hedge). This matters: it is the difference between a hit and a miss.
  const sign = direction && Object.prototype.hasOwnProperty.call(ACTION_DIRECTION, direction) ? ACTION_DIRECTION[direction] : 0;
  const breakRelation = sign >= 0 ? 'below' : 'above';
  const classify = (level, defaultSource) => {
    const improvement = level.upside || (defaultSource === 'invalidation' && level.relation !== breakRelation);
    return { instrument: level.instrument, relation: level.relation, value: level.value, source: improvement ? 'trigger' : defaultSource };
  };
  const fromTrigger = extractLevels([subject, trigger].filter(Boolean).join(' \u2014 '), universe, levelOptions).map((level) => classify(level, 'trigger'));
  const fromInvalidation = extractLevels(invalidation || '', universe, { ...levelOptions, allowBareDecimal: true }).map((level) => classify(level, 'invalidation'));
  const levels = fromTrigger.concat(fromInvalidation);
  const invalidationLevels = levels.filter((level) => level.source === 'invalidation');
  const triggerLevels = levels.filter((level) => level.source === 'trigger');

  let evaluability = 'machine-checkable';
  let evaluabilityReason = null;
  if (!instruments.length) {
    evaluability = 'not-evaluable';
    evaluabilityReason = 'no-instrument-in-committed-universe';
  } else if (!invalidationLevels.length && !triggerLevels.length) {
    evaluability = 'not-evaluable';
    evaluabilityReason = 'no-attributable-price-level';
  } else if (!invalidationLevels.length) {
    // A call that can only be satisfied and never invalidated would inflate the hit rate, so it is
    // withheld from scoring rather than counted as a free win.
    evaluability = 'not-evaluable';
    evaluabilityReason = 'no-attributable-invalidation-level';
  }

  return {
    bodyContractVersion: BODY_CONTRACT,
    instrument: instruments.length ? instruments[0] : null,
    instruments,
    direction,
    directionSign: direction && Object.prototype.hasOwnProperty.call(ACTION_DIRECTION, direction)
      ? ACTION_DIRECTION[direction] : null,
    horizon: str(action.horizon),
    subject: subject || null,
    structuralAnchor,
    levels,
    levelsText: str(opts.levelsText),
    trigger,
    invalidation,
    rationale,
    confidence: Number.isFinite(action.confidence) ? action.confidence : null,
    deepLink: str(action.deepLink),
    evaluability,
    evaluabilityReason
  };
}

/**
 * pairLevelsText(action, recommendations) — the brief publishes standing `recommendations[]` alongside
 * next-session `actions[]`. When one recommendation unambiguously covers the same instrument and
 * horizon, its prose `levels` line is carried across as context. Ambiguity yields null rather than a
 * guess: a wrong level attached to a scoreable call is worse than an absent one.
 */
export function pairLevelsText(body, recommendations, universe) {
  if (!Array.isArray(recommendations) || !body.instrument) return null;
  const matches = recommendations.filter((rec) => {
    if (!rec || typeof rec.levels !== 'string' || !rec.levels.trim()) return false;
    if (body.horizon && rec.horizon && rec.horizon !== body.horizon) return false;
    return extractInstruments(String(rec.instrument || ''), universe).includes(body.instrument);
  });
  return matches.length === 1 ? matches[0].levels : null;
}

/**
 * recommendationRowsFromPayload(payload, options) — the full set of ledger rows one published payload
 * yields. `eventIdFor(recommendationKey, index)` is supplied by the caller so the live publisher keeps
 * its run-fingerprint namespace and the backfill uses its own, and the two can never collide.
 */
export function recommendationRowsFromPayload(payload, options) {
  const opts = options || {};
  const universe = opts.universe || loadInstrumentUniverse(opts.root || '.');
  const actions = payload && payload.nextSession && Array.isArray(payload.nextSession.actions)
    ? payload.nextSession.actions : [];
  const recommendations = payload && Array.isArray(payload.recommendations) ? payload.recommendations : [];

  return actions.map((action, index) => {
    const subject = typeof action.subject === 'string' ? action.subject : `action-${index}`;
    const family = typeof action.action === 'string' ? action.action : 'note';
    const recommendationKey = recommendationKeyFor(subject, family);
    const body = buildRecommendationBody({ ...action, subject, action: family }, { universe });
    body.levelsText = pairLevelsText(body, recommendations, universe);
    return {
      eventId: opts.eventIdFor(recommendationKey, index),
      eventType: 'proposed',
      recommendationKey,
      occurredAt: opts.occurredAt,
      ...body
    };
  });
}
