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
 */
export function extractLevels(text, universe) {
  if (typeof text !== 'string' || !text) return [];
  const levels = [];
  const seen = new Set();
  // Split on sentence-ish boundaries so a relation word cannot leak across unrelated clauses.
  for (const clause of text.split(/(?<=[.;])\s+|\s+—\s+/)) {
    let current = null;
    let relation = null;
    for (const match of clause.matchAll(/\^?[A-Za-z][A-Za-z0-9.'-]{0,9}|~\d[\d,]*\.?\d*/g)) {
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
      const numeric = Number(token.slice(1).replace(/,/g, ''));
      if (!Number.isFinite(numeric) || numeric <= 0) continue;
      if (!current || !relation) continue;
      const key = `${current}|${relation}|${numeric}`;
      if (seen.has(key)) continue;
      seen.add(key);
      levels.push({ instrument: current, relation, value: numeric });
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
  const triggerLevels = extractLevels([subject, trigger].filter(Boolean).join(' \u2014 '), universe)
    .map((level) => ({ ...level, source: 'trigger' }));
  const invalidationLevels = extractLevels(invalidation || '', universe)
    .map((level) => ({ ...level, source: 'invalidation' }));
  const levels = triggerLevels.concat(invalidationLevels);

  let evaluability = 'machine-checkable';
  let evaluabilityReason = null;
  if (!instruments.length) {
    evaluability = 'not-evaluable';
    evaluabilityReason = 'no-instrument-in-committed-universe';
  } else if (!invalidationLevels.length && !triggerLevels.length) {
    evaluability = 'not-evaluable';
    evaluabilityReason = 'no-attributable-price-level';
  } else if (!invalidationLevels.length) {
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
