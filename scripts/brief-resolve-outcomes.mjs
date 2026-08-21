/*
 * scripts/brief-resolve-outcomes.mjs — Feature 015 scope 04, increment 1.
 *
 * The calendar-session substrate every later part of the deterministic outcome resolver derives
 * a date from: which committed rows are trading sessions, which session a horizon expires on,
 * which session an observed bar belongs to, and which of those sessions closed early.
 *
 * Three properties are structural rather than conventional, and are what the rows assert.
 *
 * A trading session is a row with a NON-NULL `regular` block — never `dateState === "regular"`.
 * Keying on `dateState` silently drops the two genuine 09:30-13:00 ET sessions of 2026 and
 * yields 249 where the calendar carries 251; the resolver would then mark a claim expiring on
 * one of them `not-evaluable` for want of a bar that exists. That is the D4-owned
 * `RTR-SESSION-PREDICATE` refusal, so the predicate is a CLOSED one-member vocabulary and naming
 * any other key refuses rather than quietly selecting a second rule.
 *
 * Session arithmetic is COUNTING, never day addition. Adding calendar days resolves a Friday
 * `next-session` claim on a Saturday; counting sessions cannot make that mistake. Dates are
 * compared as ISO `YYYY-MM-DD` strings, whose lexicographic order IS their chronological order,
 * so no `Date` arithmetic and no timezone ever enters the comparison.
 *
 * And an early close is DERIVED from the row's own regular block — a session shorter than the
 * calendar's longest — not read off its `dateState` label. Measured on the committed calendar the
 * regular block takes exactly two lengths, 23,400,000 ms on 249 sessions and 12,600,000 ms on 2,
 * and the shorter set is exactly the two rows labelled `early-close`. Deriving it means a future
 * label this module has never heard of still resolves normally and is still flagged.
 *
 * A malformed calendar THROWS rather than refusing. A claim must never close `not-evaluable`
 * because the repository's own committed substrate is broken: that is a substrate defect and it
 * should stop the run loudly, in the same idiom `resolutionObjectPath` already throws on a
 * malformed hash. Refusals are reserved for facts about the CLAIM.
 *
 * Nothing here reads a clock, opens a socket, or consults a provider. Every date arrives from a
 * committed artifact or from the caller.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const claims = require('../rlclaims.js');

export const CALENDAR_SOURCE = 'data/calendars/xnys/calendar.json';
export const CALENDAR_CONTRACT = 'xnys-calendar/v1';

/* The session predicate as a closed ONE-member vocabulary, the same shape `SIGN_CONVENTIONS`
   already uses in rlclaims.js. A single permitted key is what makes the rejected alternative
   unreachable instead of merely unused: an internal caller cannot pick the other rule because
   there is no other member to pick. */
export const SESSION_PREDICATE_KEY = 'regular-block';
export const SESSION_PREDICATE_KEYS = Object.freeze([SESSION_PREDICATE_KEY]);

export const SESSION_PREDICATE_CODE = 'RTR-SESSION-PREDICATE';
export const CALENDAR_COVERAGE_CODE = 'RTR-CALENDAR-COVERAGE';

/* The reason a coverage refusal carries. Asserted at load against the shipped resolver set
   rather than trusted, so a rename in rlclaims.js fails here instead of producing a reason
   `buildResolution` would later reject against every closure event. */
export const CALENDAR_COVERAGE_REASON = 'calendar-coverage-exhausted';
if (!claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(CALENDAR_COVERAGE_REASON)) {
  throw new Error(`brief-resolve-outcomes: "${CALENDAR_COVERAGE_REASON}" is not a shipped resolver reason`);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function refusal(code, reason, field) {
  return { ok: false, error: { code, reason, field } };
}

/**
 * Parse and validate the committed exchange calendar.
 *
 * Ascending order is ASSERTED, not assumed: every function below walks `rows` once and stops at
 * the first match, which is only correct while the rows are sorted. A calendar that arrived out
 * of order would otherwise return a plausible wrong session rather than fail.
 */
export function readCalendar(text) {
  const calendar = JSON.parse(text);
  const bad = (message) => new Error(`brief-resolve-outcomes: calendar ${message}`);

  if (calendar === null || typeof calendar !== 'object' || Array.isArray(calendar)) throw bad('is not an object');
  if (calendar.contractVersion !== CALENDAR_CONTRACT) throw bad(`contractVersion is not ${CALENDAR_CONTRACT}`);
  if (!ISO_DATE.test(calendar.coverageStart) || !ISO_DATE.test(calendar.coverageEnd)) throw bad('coverage window is not ISO dates');
  if (calendar.coverageEnd < calendar.coverageStart) throw bad('coverage window ends before it starts');
  if (!Array.isArray(calendar.rows) || calendar.rows.length === 0) throw bad('carries no rows');

  let previous = '';
  for (const row of calendar.rows) {
    if (row === null || typeof row !== 'object') throw bad('carries a non-object row');
    if (!ISO_DATE.test(row.tradingDate)) throw bad(`carries a non-ISO tradingDate ${JSON.stringify(row.tradingDate)}`);
    if (row.tradingDate <= previous) throw bad(`rows are not strictly ascending at ${row.tradingDate}`);
    if (row.tradingDate < calendar.coverageStart || row.tradingDate > calendar.coverageEnd) {
      throw bad(`row ${row.tradingDate} lies outside its own declared coverage window`);
    }
    previous = row.tradingDate;
  }
  return calendar;
}

/** Read the committed calendar from a repository root. The only I/O in this module. */
export function loadCalendar(root) {
  const base = typeof root === 'string' && root ? root : '.';
  return readCalendar(readFileSync(path.join(base, CALENDAR_SOURCE), 'utf8'));
}

/**
 * The trading sessions the calendar carries, under the one permitted predicate.
 *
 * Every internal caller routes through here with `SESSION_PREDICATE_KEY`, so there is exactly one
 * implementation of "is this a session" in the resolver and the `dateState` rule is refusable
 * from outside rather than merely absent from inside.
 */
export function sessionsBy(calendar, predicateKey) {
  if (!SESSION_PREDICATE_KEYS.includes(predicateKey)) {
    return refusal(SESSION_PREDICATE_CODE, 'session-predicate-not-allowed', 'predicateKey');
  }
  const tradingDates = [];
  for (const row of calendar.rows) {
    if (row.regular !== null) tradingDates.push(row.tradingDate);
  }
  return { ok: true, predicateKey, tradingDates: Object.freeze(tradingDates) };
}

function sessionRows(calendar) {
  return calendar.rows.filter((row) => row.regular !== null);
}

/**
 * The `count`-th trading session STRICTLY AFTER `fromDate`.
 *
 * Strictly-after is what lets a non-session `fromDate` work without a special case: the first
 * session after a Saturday is Monday, and the first session after a holiday is the next open day,
 * with no branch distinguishing them. A horizon whose expiry falls past `coverageEnd` refuses;
 * extrapolating one would be fabricating a session the committed artifact does not record.
 */
export function advanceSessions(calendar, fromDate, count) {
  if (!ISO_DATE.test(fromDate)) throw new Error(`brief-resolve-outcomes: fromDate ${JSON.stringify(fromDate)} is not an ISO date`);
  if (!Number.isInteger(count) || count < 1) throw new Error(`brief-resolve-outcomes: count ${JSON.stringify(count)} is not a positive integer`);

  // Outside the window the sessions BETWEEN fromDate and the window are unknown, so even a
  // derivable-looking answer would be a guess. Distinguished from exhaustion by its field.
  if (fromDate < calendar.coverageStart || fromDate > calendar.coverageEnd) {
    return refusal(CALENDAR_COVERAGE_CODE, CALENDAR_COVERAGE_REASON, 'fromDate');
  }

  let seen = 0;
  for (const tradingDate of sessionsBy(calendar, SESSION_PREDICATE_KEY).tradingDates) {
    if (tradingDate <= fromDate) continue;
    seen += 1;
    if (seen === count) return { ok: true, tradingDate };
  }
  return refusal(CALENDAR_COVERAGE_CODE, CALENDAR_COVERAGE_REASON, 'resolutionDate');
}

/**
 * The trading session an observed bar belongs to.
 *
 * The regular open is 14:30Z or 13:30Z, both inside the same UTC calendar day as the ET session,
 * so the session date is the UTC date of `t`. That coincidence is load-bearing, so the derived
 * row's `regular.startUtc` is cross-checked against `t` for exact equality rather than assumed:
 * a bar stamped at any other instant is not a regular-session open and refuses instead of being
 * silently attributed to a session it did not come from.
 */
export function sessionDateForEpoch(calendar, epochMs) {
  if (!Number.isInteger(epochMs)) throw new Error(`brief-resolve-outcomes: epoch ${JSON.stringify(epochMs)} is not an integer`);
  const utcDate = new Date(epochMs).toISOString().slice(0, 10);

  if (utcDate < calendar.coverageStart || utcDate > calendar.coverageEnd) {
    return refusal(CALENDAR_COVERAGE_CODE, CALENDAR_COVERAGE_REASON, 'observation.t');
  }
  const row = calendar.rows.find((candidate) => candidate.tradingDate === utcDate);
  if (row === undefined || row.regular === null) {
    return refusal(SESSION_PREDICATE_CODE, 'not-a-trading-session', 'observation.t');
  }
  if (Date.parse(row.regular.startUtc) !== epochMs) {
    return refusal(SESSION_PREDICATE_CODE, 'session-open-mismatch', 'observation.t');
  }
  return { ok: true, tradingDate: utcDate };
}

/**
 * Which of the given dates are trading sessions that closed early, for the resolution's hashed
 * `provenance.earlyCloseSessions`.
 *
 * Derived from the regular block's own span against the calendar's longest session, so an
 * early close is a measured property of the row rather than a label this module has to recognise.
 * An early-close session RESOLVES NORMALLY and is flagged; excluding it would discard a real
 * session's real bars, which is the failure the session predicate above already exists to avoid.
 */
export function earlyCloseSessionsIn(calendar, dates) {
  const rows = sessionRows(calendar);
  const span = (row) => Date.parse(row.regular.endUtc) - Date.parse(row.regular.startUtc);
  const fullSession = Math.max(...rows.map(span));
  const wanted = new Set(dates);
  return Object.freeze(rows.filter((row) => wanted.has(row.tradingDate) && span(row) < fullSession).map((row) => row.tradingDate));
}

/* ── Increment 2: the observation slice, the frozen price basis, and the raw outcome value ──
 *
 * What increment 1 could not do was read a price. This part reads exactly the series the claim
 * FROZE at proposal and computes the unrounded return between its two authored session dates.
 *
 * The basis is never selected here. `priceBasisFor` (rlclaims.js) is the shipped reader for the
 * hashed `magnitude.priceBasis` term, and `PRICE_BASIS_ROW_FIELD` is the shipped binding from that
 * term to the row field, so the `c`/`ac` pair is never restated at this call site. When the named
 * field is absent from an observation the lookup REFUSES; falling back to the other series is the
 * untraceable choice `priceBasis` exists to prevent, and it is not hypothetical — 2,153 in-window
 * rows across 54 of 292 committed series carry no `ac` at all, `EA` for all 328 of its rows.
 *
 * Two result shapes, and the split is the contract rather than a convenience. An `RTR-*` refusal
 * (`{ ok: false, error })` is an invariant violation. A `{ ok: false, closure }` is an outcome the
 * claim contract already names — `unresolved`/`session-absent`, or a mint reason carried through —
 * so it needs no register code, and inventing one would put a second name on a coded fact.
 *
 * The fence is a SLICE, not a rule: rows dated after `resolutionDate` never enter the map handed
 * to a reader, so lookahead is prevented by the shape of the data rather than by remembering to
 * check. A lookup past the fence is `RTR-LOOKAHEAD`.
 */

/* D4-owned. An observation dated after the claim's frozen `resolutionDate` is consulted. */
export const LOOKAHEAD_CODE = 'RTR-LOOKAHEAD';

/* ROUTED, NOT OWNED — the same posture increment 1 holds `RTR-SESSION-PREDICATE` in. This is the
   code Ruling R-04-01 PROPOSED to `design.md` → D4; the closed register carries 16 members and
   this is not yet one of them. It is fired here rather than left unwired because the alternative
   is silently reading the other close, and a proposal that no code exercises never gets ratified. */
export const PRICE_BASIS_CODE = 'RTR-PRICE-BASIS';

/* Asserted against the shipped vocabulary rather than trusted, exactly as the coverage reason is:
   a rename in rlclaims.js must fail here, not produce a reason `buildResolution` later rejects. */
export const SESSION_ABSENT_REASON = 'session-absent';
if (!claims.CLOSURE_REASON_CODES.unresolved.includes(SESSION_ABSENT_REASON)) {
  throw new Error(`brief-resolve-outcomes: "${SESSION_ABSENT_REASON}" is not a shipped unresolved reason`);
}

function closure(closureEventType, reasonCode, field) {
  return { ok: false, closure: { closureEventType, reasonCode, field } };
}

/* The six fields all three measured row shapes share. `ac` is deliberately absent from this list. */
const BAR_CORE_FIELDS = Object.freeze(['o', 'h', 'l', 'c', 'v']);

/* Derived from the shipped `seriesRefFor`, never restated: `SERIES_INTERVAL` is private to
   rlclaims.js, and a second copy here would keep answering `1d` after the shipped one moved. */
const SERIES_INTERVAL = claims.seriesRefFor('X').split('/')[2];

/**
 * Parse and validate one committed bar file.
 *
 * The row shape is NOT closed at seven fields. Measured over all 292 committed series it takes
 * three forms — `{t,o,h,l,c,v,ac}` on 147,337 rows, `{t,o,h,l,c,v}` on 2,675, and a 12-key variant
 * carrying six `source*` provenance fields on 26 — so `ac` is validated as OPTIONAL and unknown
 * keys are accepted. Requiring `ac` would throw on 54 real series; requiring a closed key list
 * would throw on the provenance variant. The six fields all three forms share are required.
 *
 * A malformed file THROWS, in increment 1's idiom: a claim must never close `not-evaluable`
 * because our own committed substrate is broken. Refusals are reserved for facts about the CLAIM.
 */
export function readBars(text) {
  const bars = JSON.parse(text);
  const bad = (message) => new Error(`brief-resolve-outcomes: bars ${message}`);

  if (bars === null || typeof bars !== 'object' || Array.isArray(bars)) throw bad('is not an object');
  if (typeof bars.sym !== 'string' || bars.sym.length === 0) throw bad('carries no symbol');
  if (bars.interval !== SERIES_INTERVAL) throw bad(`interval is not ${SERIES_INTERVAL}`);
  if (!ISO_DATE.test(bars.asof)) throw bad(`asof ${JSON.stringify(bars.asof)} is not an ISO date`);
  if (!Array.isArray(bars.rows) || bars.rows.length === 0) throw bad(`${bars.sym} carries no rows`);

  let previous = -Infinity;
  for (const row of bars.rows) {
    if (row === null || typeof row !== 'object') throw bad(`${bars.sym} carries a non-object row`);
    if (!Number.isInteger(row.t)) throw bad(`${bars.sym} carries a non-integer t ${JSON.stringify(row.t)}`);
    // Ascending order is asserted because every reader below indexes by session and would
    // otherwise silently return whichever duplicate happened to be written last.
    if (row.t <= previous) throw bad(`${bars.sym} rows are not strictly ascending at ${row.t}`);
    for (const field of BAR_CORE_FIELDS) {
      if (!Number.isFinite(row[field])) throw bad(`${bars.sym} row ${row.t} has a non-finite ${field}`);
    }
    if ('ac' in row && !Number.isFinite(row.ac)) throw bad(`${bars.sym} row ${row.t} has a non-finite ac`);
    previous = row.t;
  }
  return bars;
}

/** Read one committed series by the symbol a `seriesRef` names. */
export function loadBars(root, symbol) {
  const base = typeof root === 'string' && root ? root : '.';
  return readBars(readFileSync(path.join(base, claims.BARS_DIR, `${symbol}.json`), 'utf8'));
}

/**
 * The observations a claim resolving on `resolutionDate` is allowed to see, indexed by session.
 *
 * Three exclusions, each counted rather than silent, because a reader that cannot tell "excluded"
 * from "never existed" cannot tell a fence from a data gap:
 *
 *  - `future`: the FENCE. Dated after `resolutionDate`, so it never enters the map at all.
 *  - `beyondCoverage`: outside the calendar window, so no session date is derivable for it.
 *  - `unmappable`: in window but not stamped at a regular-session open. This is 6,823 of 48,294
 *    in-window rows across 30 series — FX at 23:00Z, crypto at 00:00Z, plus crypto weekend rows —
 *    and dropping them is what stops a 24h market's off-session row being read as a session close.
 *
 * The fence compares UTC calendar dates while the map is keyed by derived session dates. Those are
 * the same value for every row that maps, which `sessionDateForEpoch` re-asserts per row against
 * `regular.startUtc`, so the fence is exact for everything retained and conservative for the rest.
 *
 * `resolvable` is the distinction between "the future has not happened" and "you tried to read the
 * future". A claim whose horizon post-dates `bars.asof` is simply not observable yet: the caller
 * SKIPS it and appends nothing. Conflating that with a refusal would fire `RTR-LOOKAHEAD` on every
 * routine run and train everyone to ignore it.
 */
export function fenceObservations(calendar, bars, resolutionDate) {
  if (!ISO_DATE.test(resolutionDate)) {
    throw new Error(`brief-resolve-outcomes: resolutionDate ${JSON.stringify(resolutionDate)} is not an ISO date`);
  }
  const observations = new Map();
  let future = 0;
  let beyondCoverage = 0;
  let unmappable = 0;

  for (const row of bars.rows) {
    const utcDate = new Date(row.t).toISOString().slice(0, 10);
    if (utcDate > resolutionDate) { future += 1; continue; }
    if (utcDate < calendar.coverageStart || utcDate > calendar.coverageEnd) { beyondCoverage += 1; continue; }
    const session = sessionDateForEpoch(calendar, row.t);
    if (!session.ok) { unmappable += 1; continue; }
    observations.set(session.tradingDate, row);
  }

  return {
    ok: true,
    symbol: bars.sym,
    asOfDate: resolutionDate,
    resolvable: bars.asof >= resolutionDate,
    observations,
    excluded: Object.freeze({ future, beyondCoverage, unmappable })
  };
}

/**
 * The value of the claim's FROZEN basis at one session.
 *
 * `PRICE_BASIS_ROW_FIELD` binds the hashed term to the row field, so neither `c` nor `ac` is named
 * here. An absent field refuses; it never falls back to the field that happens to be present.
 */
export function basisValueAt(fence, priceBasis, sessionDate) {
  const rowField = claims.PRICE_BASIS_ROW_FIELD[priceBasis];
  if (rowField === undefined) {
    throw new Error(`brief-resolve-outcomes: price basis ${JSON.stringify(priceBasis)} is outside the shipped vocabulary`);
  }
  if (!ISO_DATE.test(sessionDate)) {
    throw new Error(`brief-resolve-outcomes: sessionDate ${JSON.stringify(sessionDate)} is not an ISO date`);
  }
  if (sessionDate > fence.asOfDate) {
    return refusal(LOOKAHEAD_CODE, 'observation-past-resolution-date', 'sessionDate');
  }
  const row = fence.observations.get(sessionDate);
  if (row === undefined) {
    return closure('unresolved', SESSION_ABSENT_REASON, `observations.${fence.symbol}.${sessionDate}`);
  }
  if (!Number.isFinite(row[rowField])) {
    return {
      ok: false,
      error: {
        code: PRICE_BASIS_CODE,
        reason: 'basis-series-absent-from-observation',
        field: `observations.${fence.symbol}.${sessionDate}.${rowField}`,
        priceBasis
      }
    };
  }
  return { ok: true, sessionDate, priceBasis, value: row[rowField] };
}

/**
 * `(resolution / entry - 1) x 100` in `percent-return`, EXACT.
 *
 * No rounding, no clamping, no epsilon: a flat outcome nudged to +/-e would manufacture a
 * directional result the data does not support, and `classifyOutcome` already carries the value
 * through verbatim. A non-positive entry is `zeroObservedSessions` territory — the data-quality
 * gate the caller must apply first — so it is a caller error and throws rather than refusing.
 */
export function periodReturn(entryValue, resolutionValue) {
  if (!Number.isFinite(entryValue) || entryValue <= 0) {
    throw new Error(`brief-resolve-outcomes: entry value ${JSON.stringify(entryValue)} is not a positive price`);
  }
  if (!Number.isFinite(resolutionValue)) {
    throw new Error(`brief-resolve-outcomes: resolution value ${JSON.stringify(resolutionValue)} is not finite`);
  }
  return (resolutionValue / entryValue - 1) * 100;
}

/**
 * A digest of the exact basis values read, for the resolution's HASHED `provenance`.
 *
 * R-04-01 leaves this obligation with the resolver: freezing the basis makes the CHOICE
 * reproducible, but BUG-012 established that the refresh cron retroactively rewrites `ac`, so the
 * VALUES can move underneath a frozen choice. Fingerprinting them puts the observations inside
 * `resolutionHash`, which turns a later rewrite into an `RTR-RESOLUTION-CONFLICT` at the
 * content-addressed write instead of a silent re-score. Built with the shipped `stableSha` and
 * carrying no `RUN_SCOPED_KEYS` member, so the hashed block stays stable across passes.
 */
export function basisFingerprint(priceBasis, observations) {
  if (!claims.PRICE_BASES.includes(priceBasis)) {
    throw new Error(`brief-resolve-outcomes: price basis ${JSON.stringify(priceBasis)} is outside the shipped vocabulary`);
  }
  return claims.stableSha({ priceBasis, observations });
}

/**
 * The subject's return over `[entryDate, resolutionDate]` at the claim's frozen basis.
 *
 * `weighting` is a hashed term with two frozen members, and they are DIFFERENT MEASUREMENTS
 * rather than two renderings of one: `equal` is the mean of the leg returns, `primary-only` reads
 * the first leg alone. A weighting outside the shipped vocabulary refuses rather than defaulting.
 */
export function subjectReturn(claim, fences) {
  const basis = claims.priceBasisFor(claim);
  if (!basis.ok) return basis;

  const weighting = claim.subject.weighting;
  if (!claims.SUBJECT_WEIGHTINGS.includes(weighting)) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'subject-weighting-not-allowed', 'subject.weighting');
  }
  const refs = weighting === 'primary-only' ? claim.subject.seriesRefs.slice(0, 1) : claim.subject.seriesRefs;
  if (refs.length === 0) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'subject-carries-no-series', 'subject.seriesRefs');
  }

  const observations = [];
  const legReturns = [];
  for (const seriesRef of refs) {
    const fence = fences.get(seriesRef);
    if (fence === undefined) {
      throw new Error(`brief-resolve-outcomes: no fenced observations supplied for ${seriesRef}`);
    }
    const read = [];
    for (const [label, sessionDate] of [['entry', claim.magnitude.entryDate], ['resolution', claim.horizon.resolutionDate]]) {
      const at = basisValueAt(fence, basis.priceBasis, sessionDate);
      if (!at.ok) return at;
      read.push(at.value);
      observations.push({ seriesRef, leg: label, sessionDate, value: at.value });
    }
    legReturns.push(periodReturn(read[0], read[1]));
  }

  const total = legReturns.reduce((carry, value) => carry + value, 0);
  return {
    ok: true,
    priceBasis: basis.priceBasis,
    weighting,
    legReturns: Object.freeze(legReturns),
    observations: Object.freeze(observations),
    subjectReturn: weighting === 'primary-only' ? legReturns[0] : total / legReturns.length
  };
}

/**
 * `outcomeValue = direction x ret(subject)`, unrounded.
 *
 * Multiplying by the frozen direction is the adapter without which every CORRECT bearish call
 * would score as a loss: `rlvSummarizeOutcomes` counts wins with `value > 0` regardless of which
 * way the claim leaned. A claim already carrying a mint reason is carried through as a
 * `not-evaluable` closure rather than measured — which is also how `direction === 0` and an
 * unauthored basis arrive here, so neither is re-derived locally.
 */
export function outcomeValueFor(claim, fences) {
  if (claim.notEvaluable !== null) {
    return closure('not-evaluable', claim.notEvaluable.reason, claim.notEvaluable.field);
  }
  if (!Number.isFinite(claim.direction) || claim.direction === 0) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'direction-not-bound', 'direction');
  }
  const subject = subjectReturn(claim, fences);
  if (!subject.ok) return subject;

  return {
    ok: true,
    outcomeValue: claim.direction * subject.subjectReturn,
    priceBasis: subject.priceBasis,
    subjectReturn: subject.subjectReturn,
    // Carried through frozen: leg COUNT is what distinguishes `primary-only` from `equal`,
    // which the collapsed `subjectReturn` scalar can no longer tell apart.
    legReturns: subject.legReturns,
    observations: subject.observations,
    basisFingerprint: basisFingerprint(subject.priceBasis, subject.observations)
  };
}

/* ── Increment 3: the two axes, the hashed provenance, and the written record ────────────────
 *
 * Increments 1-2 produced a NUMBER. This part turns it into a RECORD in the content-addressed
 * store — the step at which an outcome stops being a computation and becomes a fact an auditor
 * can re-derive from its own address.
 *
 * Nothing here re-implements a shipped primitive. `classifyOutcome` assigns the class,
 * `buildResolution` validates the class/closure/reason triangle and computes `resolutionHash`,
 * and `writeResolutionObject` — which calls scope 02's `authorizeResolutionWrite` FIRST, before
 * inspecting the resolution at all — performs the write. What is genuinely unbuilt is the
 * JOINING: which of the two axes a given closure event decides, what belongs in the hashed
 * provenance, and the order the three calls run in.
 *
 * The closure-event -> class routing is DERIVED by inverting `OUTCOME_CLOSURE_EVENTS`, never
 * restated. A closure event admitted by exactly ONE class determines its class outright; one
 * admitted by SEVERAL cannot, and is decided by `classifyOutcome` against the claim's frozen
 * band. That split is asserted at load to coincide exactly with `MAGNITUDE_BEARING_OUTCOME_CLASSES`,
 * so "which closures carry a magnitude" is a measured property of the shipped table rather than a
 * second list here that could disagree with it.
 *
 * The index is STRICTLY NARROWER than the 002-owned `CLOSE_EVENT_TYPES`: it holds only the five
 * events some class admits. `withdrawn` is the residue no class admits, so it refuses BEFORE a
 * record exists and is unreachable from every resolver path — D4's "never resolver-emitted"
 * derived rather than restated. `RTR-CLOSURE-VOCAB` stays `buildResolution`'s to raise, for a
 * caller that supplies an outcome class of its own; it is not pre-empted here.
 */

/* Which outcome classes admit each closure event. The inverse of the shipped table. */
const CLASSES_ADMITTING_CLOSURE = (() => {
  const index = {};
  for (const outcomeClass of Object.keys(claims.OUTCOME_CLOSURE_EVENTS)) {
    for (const closureEventType of claims.OUTCOME_CLOSURE_EVENTS[outcomeClass]) {
      (index[closureEventType] ??= []).push(outcomeClass);
    }
  }
  return Object.freeze(Object.fromEntries(Object.entries(index).map(([k, v]) => [k, Object.freeze(v.slice().sort())])));
})();

/** Closure events whose class `classifyOutcome` must decide, because several admit them. */
export const MEASURED_CLOSURE_EVENTS = Object.freeze(
  Object.keys(CLASSES_ADMITTING_CLOSURE).filter((event) => CLASSES_ADMITTING_CLOSURE[event].length > 1).sort()
);

/** Closure events whose single admitting class IS their class, and which therefore carry no value. */
export const DETERMINED_CLOSURE_CLASS = Object.freeze(Object.fromEntries(
  Object.entries(CLASSES_ADMITTING_CLOSURE).filter(([, cs]) => cs.length === 1).map(([event, cs]) => [event, cs[0]])
));

/* The coincidence the split rests on, asserted rather than assumed: the ambiguous events are
   ambiguous over EXACTLY the magnitude-bearing classes, and every determined class is outside
   that set. A future table where they diverged would silently start recording a magnitude under
   a counted class, or dropping one from a directional class. */
const MAGNITUDE_BEARING = claims.MAGNITUDE_BEARING_OUTCOME_CLASSES.join(',');
for (const event of MEASURED_CLOSURE_EVENTS) {
  if (CLASSES_ADMITTING_CLOSURE[event].join(',') !== MAGNITUDE_BEARING) {
    throw new Error(`brief-resolve-outcomes: closure event "${event}" is ambiguous over a non-magnitude-bearing class set`);
  }
}
for (const [event, outcomeClass] of Object.entries(DETERMINED_CLOSURE_CLASS)) {
  if (claims.MAGNITUDE_BEARING_OUTCOME_CLASSES.includes(outcomeClass)) {
    throw new Error(`brief-resolve-outcomes: closure event "${event}" determines the magnitude-bearing class "${outcomeClass}"`);
  }
}

/**
 * The two INDEPENDENT axes a resolution records: which closure event fired, and which outcome
 * class the magnitude fell in.
 *
 * They do not derive each other. A `satisfied` claim whose direction-adjusted magnitude is
 * negative records `satisfied` AND `loss`, and both facts survive; collapsing them would
 * overwrite one with the other.
 *
 * `outcome` is an `outcomeValueFor` result. An `RTR-*` refusal in it is an invariant violation and
 * propagates unchanged — no record is ever built on one. A carried `{ closure }` IS the verdict,
 * so a caller supplying a different closure event is naming a second source for one decision and
 * refuses rather than having one silently win.
 */
export function resolutionAxesFor(claim, closureEventType, outcome) {
  if (outcome !== null && outcome !== undefined) {
    if (outcome.error !== undefined) return outcome;
    if (outcome.closure !== undefined && outcome.closure.closureEventType !== closureEventType) {
      return refusal(claims.CONTRACT_VIOLATION_CODE, 'closure-event-contradicts-carried-closure', 'closureEventType');
    }
  }

  if (MEASURED_CLOSURE_EVENTS.includes(closureEventType)) {
    if (outcome === null || outcome === undefined || outcome.ok !== true) {
      return refusal(claims.CONTRACT_VIOLATION_CODE, 'measured-closure-carries-no-outcome-value', 'outcomeValue');
    }
    // Verbatim into `classifyOutcome`, which carries it through unrounded against the frozen band.
    const classified = claims.classifyOutcome(outcome.outcomeValue, claim);
    if (!classified.ok) return classified;
    return {
      ok: true,
      closureEventType,
      outcomeClass: classified.outcomeClass,
      outcomeValue: classified.outcomeValue,
      unrecordedOutcomeValue: null
    };
  }

  const determined = DETERMINED_CLOSURE_CLASS[closureEventType];
  if (determined === undefined) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'closure-event-carries-no-outcome-class', 'closureEventType');
  }
  return {
    ok: true,
    closureEventType,
    outcomeClass: determined,
    outcomeValue: null,
    /* A measurable claim can still expire without its predicate resolving. The class cannot carry
       a magnitude, so the record stores `null` — but the number that was NOT recorded is reported
       here, because a value that vanished with no trace is indistinguishable from one never
       computed. */
    unrecordedOutcomeValue: outcome !== null && outcome !== undefined && outcome.ok === true ? outcome.outcomeValue : null
  };
}

/**
 * The HASHED provenance block.
 *
 * Assembled here rather than accepted from a caller, which is what makes the `RUN_SCOPED_KEYS`
 * rule structural instead of remembered: there is no path by which a `runId` or a wall clock can
 * reach the hashed block, so the content address cannot move between two passes over unchanged
 * inputs. Run-scoped facts belong in `lifecycleBinding`, which is deliberately outside the hash.
 *
 * `basisFingerprint` is REUSED from the outcome rather than recomputed, so the values the record
 * commits to are exactly the values the return was computed from.
 */
export function resolutionProvenanceFor(calendar, claim, outcome) {
  const sessions = [claim?.magnitude?.entryDate, claim?.horizon?.resolutionDate]
    .filter((date) => typeof date === 'string' && ISO_DATE.test(date));

  const provenance = { earlyCloseSessions: earlyCloseSessionsIn(calendar, sessions).slice() };
  if (outcome !== null && outcome !== undefined && outcome.ok === true) {
    provenance.priceBasis = outcome.priceBasis;
    provenance.basisFingerprint = outcome.basisFingerprint;
  }
  return { ok: true, provenance };
}

/**
 * One resolved claim to one `brief-recommendation-resolution/v1` record, unwritten.
 *
 * `eventId` and `lifecycleBinding` arrive from the caller because they are the LIFECYCLE side —
 * the reducer bridge that derives them is a later increment. Both are `RESOLUTION_UNHASHED_FIELDS`
 * members, so neither moves the content address; they do move the BYTES, which is why a re-emit
 * carrying a fresh `eventId` at an unchanged address is what `RTR-RESOLUTION-CONFLICT` catches.
 */
export function resolutionFor(input) {
  const axes = resolutionAxesFor(input.claim, input.closureEventType, input.outcome);
  if (!axes.ok) return axes;

  const provenance = resolutionProvenanceFor(input.calendar, input.claim, input.outcome);
  if (!provenance.ok) return provenance;

  const built = claims.buildResolution({
    closureVocabulary: input.closureVocabulary,
    claimHash: input.claim?.claimHash,
    eventId: input.eventId,
    resolutionDate: input.claim?.horizon?.resolutionDate ?? null,
    closureEventType: input.closureEventType,
    outcomeClass: axes.outcomeClass,
    outcomeValue: axes.outcomeValue,
    reasonCode: input.reasonCode,
    provenance: provenance.provenance,
    lifecycleBinding: input.lifecycleBinding
  });
  if (!built.ok) return built;
  return { ok: true, resolution: built.resolution, contribution: built.contribution, axes };
}

/**
 * Build the record and write it to the content-addressed store.
 *
 * The write is `writeResolutionObject` and nothing else. That is the only route to
 * `RESOLUTION_STORE_DIR`, and it runs scope 02's `authorizeResolutionWrite` BEFORE inspecting the
 * resolution, so a claimless ledger row refuses `RTR-LEGACY-BACKFILL` no matter how complete and
 * plausible the record handed to it is. Bypassing it — or checking the row here first — would put
 * a second answer over one question.
 *
 * Exactly-once has two halves and they are not the same test. Re-resolving an unchanged claim
 * recomputes one address AND one byte string, so the repeat is `reused: true, written: false`. A
 * write that would CHANGE the bytes at that address aborts with `RTR-RESOLUTION-CONFLICT` and
 * overwrites nothing. A change to a HASHED term — the basis fingerprint among them — moves the
 * address instead, so it lands as a SECOND object rather than as a conflict, which is how a
 * retroactive `ac` rewrite becomes visible without either record being destroyed.
 */
export function recordResolution(input, row, ports) {
  const built = resolutionFor(input);
  if (!built.ok) return built;

  const write = claims.writeResolutionObject(built.resolution, row, ports);
  if (!write.ok) return write;

  return {
    ok: true,
    resolution: built.resolution,
    contribution: built.contribution,
    axes: built.axes,
    path: write.path,
    written: write.written,
    reused: write.reused
  };
}
