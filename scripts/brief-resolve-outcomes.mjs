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

/* ── Increment 4: the four predicate evaluators ──────────────────────────────────────────────
 *
 * Increment 3 could BUILD a record but not DECIDE one: `resolutionFor` still takes
 * `closureEventType` and `reasonCode` from its caller. This part computes that verdict from the
 * claim's own frozen predicate, which is the last input the resolver was accepting on trust.
 *
 * NEITHER VOCABULARY IS RESTATED. `PREDICATE_KINDS` and `PREDICATE_COMPARATORS` are the shipped
 * frozen arrays, and `bindToVocabulary` asserts at LOAD that each table below covers its array
 * exactly — no missing member and no extra one. A fifth kind or a seventh comparator landing in
 * rlclaims.js therefore throws here instead of reaching a dispatch that silently treats it as a
 * default. Every dispatch is a lookup keyed by the claim's own value: this module contains no
 * `=== "threshold"` and no `=== "gte"` at any call site, which is what scope 01's DoD bans.
 * An unrecognised kind or comparator REFUSES; neither is ever coerced.
 *
 * THE FENCE IS THE ONLY READER. Every price consulted here arrives through `basisValueAt`, so a
 * predicate that reaches past `resolutionDate` refuses with the increment-2 `RTR-LOOKAHEAD` and
 * a missing endpoint closes `unresolved`/`session-absent` — both from the shipped reader rather
 * than from a second lookahead rule written here.
 *
 * POINT AND PATH ARE DIFFERENT MEASUREMENTS. A point comparator reads the two endpoint closes; a
 * path comparator reads an EXTREME on every session of `[entryDate, resolutionDate]`, and the
 * fixtures prove they disagree — DVG closes `+10%` but its high touches `+12%`, so `gte 11`
 * invalidates while `crosses-above 11` satisfies. A path evaluated over a partial window is a
 * DIFFERENT predicate, so a gap closes `unresolved`/`path-incomplete` rather than being scored.
 *
 * Arithmetic is EXACT throughout — the same `periodReturn` increment 2 uses, with no rounding,
 * clamping or epsilon anywhere. A comparison nudged by an epsilon would manufacture a verdict the
 * data does not support, which is the identical failure `classifyOutcome` refuses to make.
 */

/** Assert a dispatch table covers a shipped frozen vocabulary EXACTLY, then freeze it. */
function bindToVocabulary(vocabulary, table, label) {
  const declared = Object.keys(table).slice().sort();
  const shipped = vocabulary.slice().sort();
  if (declared.length !== shipped.length || declared.some((key, index) => key !== shipped[index])) {
    throw new Error(
      `brief-resolve-outcomes: ${label} table [${declared.join(',')}] does not cover the shipped vocabulary [${shipped.join(',')}]`
    );
  }
  return Object.freeze({ ...table });
}

/* The predicate verdict pair. The EVENTS are named and then asserted against the shipped table,
   in the idiom `SESSION_ABSENT_REASON` already holds; the REASONS are derived from it, so neither
   string is a second copy of a coded fact. `buildResolution` rejects either reason against any
   other closure event, so this scope adds no check of its own. */
export const PREDICATE_SATISFIED_EVENT = 'satisfied';
export const PREDICATE_INVALIDATED_EVENT = 'invalidated';

const PREDICATE_VERDICT_REASON = (() => {
  const named = [PREDICATE_SATISFIED_EVENT, PREDICATE_INVALIDATED_EVENT];
  /* Derived: the closure events whose reason set is about the predicate. Asserted to be exactly
     the two named above, so a third predicate verdict in rlclaims.js fails here rather than
     silently never being emitted. */
  const derived = Object.keys(claims.CLOSURE_REASON_CODES)
    .filter((event) => claims.CLOSURE_REASON_CODES[event].some((reason) => reason.startsWith('predicate-')))
    .sort();
  if (derived.join(',') !== named.slice().sort().join(',')) {
    throw new Error(`brief-resolve-outcomes: predicate verdict events [${derived.join(',')}] are not the shipped pair`);
  }
  return Object.freeze(Object.fromEntries(named.map((event) => {
    const reasons = claims.CLOSURE_REASON_CODES[event];
    if (reasons.length !== 1) {
      throw new Error(`brief-resolve-outcomes: closure event "${event}" carries ${reasons.length} reasons, not one`);
    }
    return [event, reasons[0]];
  })));
})();

/* Asserted against the shipped sets rather than trusted, exactly as the coverage reason is. */
export const PATH_INCOMPLETE_REASON = 'path-incomplete';
if (!claims.CLOSURE_REASON_CODES.unresolved.includes(PATH_INCOMPLETE_REASON)) {
  throw new Error(`brief-resolve-outcomes: "${PATH_INCOMPLETE_REASON}" is not a shipped unresolved reason`);
}
export const NO_COMMITTED_REFERENCE_REASON = 'no-committed-reference';
if (!claims.RESOLVER_NOT_EVALUABLE_REASONS.includes(NO_COMMITTED_REFERENCE_REASON)) {
  throw new Error(`brief-resolve-outcomes: "${NO_COMMITTED_REFERENCE_REASON}" is not a shipped resolver reason`);
}

export const POINT_COMPARATOR_MODE = 'point';
export const PATH_COMPARATOR_MODE = 'path';

/* The comparator table. `extreme` is the row field a path comparator walks; it is asserted to be
   a required bar field, so a typo cannot silently produce `undefined` and then `NaN`. */
const COMPARATORS = bindToVocabulary(claims.PREDICATE_COMPARATORS, {
  gte: { mode: POINT_COMPARATOR_MODE, extreme: null, test: (observed, bound) => observed >= bound },
  lte: { mode: POINT_COMPARATOR_MODE, extreme: null, test: (observed, bound) => observed <= bound },
  gt: { mode: POINT_COMPARATOR_MODE, extreme: null, test: (observed, bound) => observed > bound },
  lt: { mode: POINT_COMPARATOR_MODE, extreme: null, test: (observed, bound) => observed < bound },
  'crosses-above': { mode: PATH_COMPARATOR_MODE, extreme: 'h', test: (observed, bound) => observed >= bound },
  'crosses-below': { mode: PATH_COMPARATOR_MODE, extreme: 'l', test: (observed, bound) => observed <= bound }
}, 'predicate comparator');

for (const comparator of claims.PREDICATE_COMPARATORS) {
  const extreme = COMPARATORS[comparator].extreme;
  if (extreme !== null && !BAR_CORE_FIELDS.includes(extreme)) {
    throw new Error(`brief-resolve-outcomes: comparator "${comparator}" reads "${extreme}", which is not a required bar field`);
  }
}

/* The per-leg weight vector each shipped weighting implies, as a table rather than a branch. */
const SUBJECT_WEIGHTS = bindToVocabulary(claims.SUBJECT_WEIGHTINGS, {
  equal: (count) => Array.from({ length: count }, () => 1 / count),
  'primary-only': (count) => Array.from({ length: count }, (_unused, index) => (index === 0 ? 1 : 0))
}, 'subject weighting');

/**
 * A path comparator needs the session's EXTREME quoted on the claim's own basis, and the committed
 * rows carry `h`/`l` only alongside the OHLC close. So the basis supports a path exactly when its
 * row field IS an OHLC field — DERIVED from the shipped `PRICE_BASIS_ROW_FIELD` binding against
 * the OHLC set, never a second list of basis names here.
 *
 * Dividing a RAW high by an ADJUSTED entry close would mix two series into one number, which is
 * precisely the untraceable substitution Ruling R-04-01 exists to prevent, so it refuses instead.
 */
function basisCarriesPathExtremes(priceBasis) {
  return BAR_CORE_FIELDS.includes(claims.PRICE_BASIS_ROW_FIELD[priceBasis]);
}

/** One session's extreme, gated by the SAME fence reader the endpoint closes go through. */
function pathValueAt(fence, priceBasis, sessionDate, extremeField) {
  const gate = basisValueAt(fence, priceBasis, sessionDate);
  if (!gate.ok) return gate;
  const row = fence.observations.get(sessionDate);
  if (!Number.isFinite(row[extremeField])) {
    return {
      ok: false,
      error: {
        code: PRICE_BASIS_CODE,
        reason: 'path-extreme-absent-from-observation',
        field: `observations.${fence.symbol}.${sessionDate}.${extremeField}`,
        priceBasis
      }
    };
  }
  return { ok: true, sessionDate, priceBasis, value: row[extremeField] };
}

/** Every trading session in `[entryDate, resolutionDate]`, which a path predicate needs whole. */
function pathSessions(calendar, entryDate, resolutionDate) {
  if (entryDate > resolutionDate) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'entry-date-after-resolution-date', 'magnitude.entryDate');
  }
  if (entryDate < calendar.coverageStart || resolutionDate > calendar.coverageEnd) {
    return refusal(CALENDAR_COVERAGE_CODE, CALENDAR_COVERAGE_REASON, 'predicate.window');
  }
  const sessions = sessionsBy(calendar, SESSION_PREDICATE_KEY);
  if (!sessions.ok) return sessions;
  const window = sessions.tradingDates.filter((date) => date >= entryDate && date <= resolutionDate);
  if (window.length === 0) return closure('unresolved', PATH_INCOMPLETE_REASON, 'predicate.window');
  return { ok: true, sessions: Object.freeze(window) };
}

/** The `seriesRef` the predicate's frozen reference names, or `null` when none was authored. */
function referenceSeriesRef(claim) {
  const reference = claim?.predicate?.reference;
  if (typeof reference !== 'string' || reference.length === 0) return null;
  return claims.seriesRefFor(reference);
}

/**
 * The signed leg terms each kind sums. `weight` folds the subject weighting and the sign of the
 * reference side together, so the four kinds differ only in this table and never in the arithmetic
 * that consumes it.
 *
 * `relative` subtracts the reference from the WEIGHTED subject, per step 8's `ret(subject)`;
 * `spread` subtracts it from the subject's FIRST LEG alone, which is why the two are different
 * predicates rather than two spellings of one and why an equal-weighted basket scores them apart.
 */
function subjectTerms(claim) {
  const weighting = claim?.subject?.weighting;
  const vector = SUBJECT_WEIGHTS[weighting];
  if (vector === undefined) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'subject-weighting-not-allowed', 'subject.weighting');
  }
  const refs = claim?.subject?.seriesRefs ?? [];
  if (refs.length === 0) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'subject-carries-no-series', 'subject.seriesRefs');
  }
  const weights = vector(refs.length);
  return { ok: true, terms: refs.map((seriesRef, index) => ({ seriesRef, weight: weights[index] })).filter((term) => term.weight !== 0) };
}

function referenceTerm(claim) {
  const seriesRef = referenceSeriesRef(claim);
  if (seriesRef === null) {
    return closure('not-evaluable', NO_COMMITTED_REFERENCE_REASON, 'predicate.reference');
  }
  return { ok: true, terms: [{ seriesRef, weight: -1 }] };
}

function withReference(claim, base) {
  if (!base.ok) return base;
  const reference = referenceTerm(claim);
  if (!reference.ok) return reference;
  return { ok: true, terms: base.terms.concat(reference.terms) };
}

const KINDS = bindToVocabulary(claims.PREDICATE_KINDS, {
  threshold: {
    terms: (claim) => subjectTerms(claim),
    scale: () => ({ ok: true, factor: 1 }),
    bound: predicateBound,
    test: comparatorTest
  },
  relative: {
    terms: (claim) => withReference(claim, subjectTerms(claim)),
    scale: () => ({ ok: true, factor: 1 }),
    bound: predicateBound,
    test: comparatorTest
  },
  directional: {
    terms: (claim) => subjectTerms(claim),
    scale: (claim) => (Number.isFinite(claim?.direction) && claim.direction !== 0
      ? { ok: true, factor: claim.direction }
      : refusal(claims.CONTRACT_VIOLATION_CODE, 'direction-not-bound', 'direction')),
    /* Step 8 fixes this kind's bound to the claim's own frozen flat band and its test to strictly
       greater — `direction x ret(subject) > flatBandFor(claim)` — so `predicate.value` is not
       consulted. The comparator still selects point vs path and still refuses out of vocabulary. */
    bound: (claim) => {
      const band = claims.flatBandFor(claim);
      return band.ok ? { ok: true, bound: band.flatBand } : band;
    },
    test: () => (observed, bound) => observed > bound
  },
  spread: {
    terms: (claim) => withReference(claim, primaryLegTerm(claim)),
    scale: () => ({ ok: true, factor: 1 }),
    bound: predicateBound,
    test: comparatorTest
  }
}, 'predicate kind');

function primaryLegTerm(claim) {
  const refs = claim?.subject?.seriesRefs ?? [];
  if (refs.length === 0) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'subject-carries-no-series', 'subject.seriesRefs');
  }
  return { ok: true, terms: [{ seriesRef: refs[0], weight: 1 }] };
}

function predicateBound(claim) {
  const value = claim?.predicate?.value;
  if (!Number.isFinite(value)) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'predicate-value-not-finite', 'predicate.value');
  }
  return { ok: true, bound: value };
}

function comparatorTest(comparator) {
  return COMPARATORS[comparator].test;
}

/** Every term's entry-session basis value: the denominators the whole evaluation hangs off. */
function entryValuesFor(terms, fences, priceBasis, entryDate) {
  const entries = new Map();
  for (const term of terms) {
    if (entries.has(term.seriesRef)) continue;
    const fence = fences.get(term.seriesRef);
    if (fence === undefined) {
      return closure('not-evaluable', NO_COMMITTED_REFERENCE_REASON, `observations.${term.seriesRef}`);
    }
    const at = basisValueAt(fence, priceBasis, entryDate);
    if (!at.ok) return at;
    entries.set(term.seriesRef, at.value);
  }
  return { ok: true, entries };
}

/** `Σ weight × ret(leg)` at one session, reading either the close or a comparator's extreme. */
function observedAt(terms, fences, priceBasis, entries, sessionDate, extremeField) {
  let total = 0;
  const observations = [];
  for (const term of terms) {
    const fence = fences.get(term.seriesRef);
    const at = extremeField === null
      ? basisValueAt(fence, priceBasis, sessionDate)
      : pathValueAt(fence, priceBasis, sessionDate, extremeField);
    if (!at.ok) return at;
    total += term.weight * periodReturn(entries.get(term.seriesRef), at.value);
    observations.push({ seriesRef: term.seriesRef, sessionDate, field: extremeField, value: at.value });
  }
  return { ok: true, observed: total, observations };
}

/**
 * The claim's frozen predicate against the fenced slice, as a closure event and its shipped reason.
 *
 * The verdict is the LAST input `resolutionFor` was taking on trust, and it is decided here from
 * the claim alone: the kind, the comparator, the bound and the weighting are all hashed terms, so
 * two passes over unchanged bytes cannot disagree.
 */
export function evaluatePredicate(claim, fences, calendar) {
  if (claim?.notEvaluable != null) {
    return closure('not-evaluable', claim.notEvaluable.reason, claim.notEvaluable.field);
  }
  const predicate = claim?.predicate;
  if (predicate === null || predicate === undefined) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'no-authored-predicate', 'predicate');
  }
  /* Membership FIRST, dispatch second. An out-of-vocabulary kind or comparator can therefore
     never reach a table lookup that would resolve `undefined` through the prototype chain. */
  if (!claims.PREDICATE_KINDS.includes(predicate.kind)) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'predicate-kind-not-allowed', 'predicate.kind');
  }
  if (!claims.PREDICATE_COMPARATORS.includes(predicate.comparator)) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'predicate-comparator-not-allowed', 'predicate.comparator');
  }
  const kind = KINDS[predicate.kind];
  const comparator = COMPARATORS[predicate.comparator];

  const basis = claims.priceBasisFor(claim);
  if (!basis.ok) return basis;

  const terms = kind.terms(claim);
  if (!terms.ok) return terms;
  const scale = kind.scale(claim);
  if (!scale.ok) return scale;
  const bound = kind.bound(claim);
  if (!bound.ok) return bound;

  const entryDate = claim?.magnitude?.entryDate;
  const resolutionDate = claim?.horizon?.resolutionDate;
  if (!ISO_DATE.test(entryDate) || !ISO_DATE.test(resolutionDate)) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'no-authored-horizon', 'horizon.resolutionDate');
  }

  const entries = entryValuesFor(terms.terms, fences, basis.priceBasis, entryDate);
  if (!entries.ok) return entries;

  /* Point comparators evaluate ONCE at the resolution session; path comparators walk the complete
     window. Which one runs is the comparator's own mode, never a branch on the kind. */
  let sessions = [resolutionDate];
  if (comparator.mode === PATH_COMPARATOR_MODE) {
    if (!basisCarriesPathExtremes(basis.priceBasis)) {
      return {
        ok: false,
        error: {
          code: PRICE_BASIS_CODE,
          reason: 'path-extremes-absent-for-basis',
          field: 'predicate.comparator',
          priceBasis: basis.priceBasis
        }
      };
    }
    const window = pathSessions(calendar, entryDate, resolutionDate);
    if (!window.ok) return window;
    /* A path over a PARTIAL window is a different predicate, so a gap closes rather than scoring.
       The entry session is exempt: it is every term's denominator, so its absence is the
       single-session `session-absent` the endpoint reader above already returned.

       A session past the fence is asked of `basisValueAt` FIRST, so it comes back as the
       increment-2 `RTR-LOOKAHEAD` rather than being reported as a gap. The two are different
       facts: one is a window the observations do not yet reach, the other is a hole inside a
       window they do — and calling the first a gap would hide a fence violation as a data gap. */
    for (const sessionDate of window.sessions) {
      if (sessionDate === entryDate) continue;
      for (const term of terms.terms) {
        const fence = fences.get(term.seriesRef);
        if (sessionDate > fence.asOfDate) {
          const past = basisValueAt(fence, basis.priceBasis, sessionDate);
          if (!past.ok) return past;
        }
        if (!fence.observations.has(sessionDate)) {
          return closure('unresolved', PATH_INCOMPLETE_REASON, `observations.${term.seriesRef}.${sessionDate}`);
        }
      }
    }
    sessions = window.sessions;
  }

  const evaluated = [];
  let decided = null;
  for (const sessionDate of sessions) {
    const at = observedAt(terms.terms, fences, basis.priceBasis, entries.entries, sessionDate, comparator.extreme);
    if (!at.ok) return at;
    const observed = scale.factor * at.observed;
    evaluated.push({ sessionDate, observed, observations: Object.freeze(at.observations) });
    if (decided === null && kind.test(predicate.comparator)(observed, bound.bound)) {
      decided = { sessionDate, observed };
    }
  }

  const passed = decided !== null;
  const closureEventType = passed ? PREDICATE_SATISFIED_EVENT : PREDICATE_INVALIDATED_EVENT;
  return {
    ok: true,
    kind: predicate.kind,
    comparator: predicate.comparator,
    mode: comparator.mode,
    priceBasis: basis.priceBasis,
    closureEventType,
    reasonCode: PREDICATE_VERDICT_REASON[closureEventType],
    bound: bound.bound,
    /* The value that DECIDED it: the crossing session for a satisfied path, the last session
       otherwise. A verdict whose number cannot be pointed at is not auditable. */
    observed: passed ? decided.observed : evaluated[evaluated.length - 1].observed,
    decidedAt: passed ? decided.sessionDate : evaluated[evaluated.length - 1].sessionDate,
    sessionsEvaluated: Object.freeze(evaluated.map((entry) => entry.sessionDate))
  };
}

/* ── Increment 5: the reducer bridge ─────────────────────────────────────────────────────────
 *
 * Increment 4 decided a verdict; nothing yet turned one into a LIFECYCLE event. This part does,
 * and it does so THROUGH the shipped reducer rather than beside it.
 *
 * THE REDUCER IS THE ONLY CLOSURE PATH. `reduceRecommendationEvents` owns event identity,
 * ordering, dedupe and the `state` transition, so closures enter through `run.closures` — the
 * path its own contract documents — with `current: []`. A closing pass proposes nothing, and the
 * foundation says so itself: a key present in the same run's proposals refuses
 * `recommendation-closure-still-active`. Every refusal below is the reducer's own, returned
 * verbatim; nothing here re-implements one.
 *
 * THE KEY IS DERIVED, NEVER AUTHORED. `originRecommendationKey` comes from
 * `deriveRecommendationKeys` — "Authors never own identity" — over terms read from the claim's
 * HASHED fields. Every varying term is inside `claimHash`, so one claim object can only ever
 * derive one reducer key: the bridge is a refinement of the content address, not a second
 * identity that could drift from it.
 *
 * WHICH fields those are is MEASURED, not asserted. `ORIGIN_KEY_TERMS` is derived by perturbing
 * each field of a probe record and keeping the ones that MOVE the key. The remainder are the
 * fields the producer folds into a DIFFERENT key, and they are supplied as `null` sentinels —
 * `undefined` throws, so they cannot simply be omitted. `bindToVocabulary` then asserts the
 * claim-term table covers the measured set EXACTLY, so a foundation that started folding
 * `trigger` into the origin key fails at load here instead of letting a sentinel silently become
 * part of identity.
 *
 * THE PRODUCER DOES NOT GUARD ABSENCE, SO THIS MODULE MUST. Measured: `deriveRecommendationKeys`
 * throws only on `undefined`. A `null` `thesisFamily`, a `null` horizon band and an EMPTY subject
 * list each yield a perfectly well-formed key — for a recommendation `normalizeRecommendation`
 * would have refused outright. Such a key is a fabrication, and the claims that produce one are
 * exactly the claims that minted `not-evaluable`, so an absent term refuses here.
 *
 * IDEMPOTENCE IS UPSTREAM, BY STATE. The reducer does not self-enforce it, and each half of that
 * is measured rather than assumed: `lifecycleEventId` folds in `runId`, so one closure on two
 * days is two different events; the `seenEvent` dedupe is within-run only; and the closure block
 * checks for an ABSENT entry and a STILL-ACTIVE entry but never for an already-CLOSED one.
 * Re-closing a closed entry under a new `runId` is therefore ACCEPTED and appends a second event.
 * The due-set gate — an entry is closable only while the reducer still calls it live — runs
 * BEFORE the reducer is called at all, which is what makes a re-run append nothing.
 *
 * ONE MEASURED CORRECTION TO THE PLAN'S ORACLE. `indexFingerprint` covers `{ contractVersion,
 * entries }`, and a repeat closure carrying the SAME `eventType` leaves both `state` and
 * `lastEventType` where they already were — so the fingerprint is BYTE-IDENTICAL across a
 * duplicate append. It is an oracle for index STATE, not for event APPEND. The load-bearing
 * assertion for idempotence is therefore the appended-event count, with the fingerprint as the
 * corroborating second reading rather than the primary one.
 */

const foundation = require('../rlcontracts.js');

/* Asserted against the shipped field set rather than trusted, exactly as the calendar and
   unresolved reasons are: the derived key is recorded OUTSIDE the resolution's content address,
   so a term list that stopped saying so would start moving the address on every run. */
export const LIFECYCLE_BINDING_FIELD = 'lifecycleBinding';
if (!claims.RESOLUTION_UNHASHED_FIELDS.includes(LIFECYCLE_BINDING_FIELD)) {
  throw new Error(`brief-resolve-outcomes: "${LIFECYCLE_BINDING_FIELD}" is not a shipped unhashed resolution field`);
}

/* A synthetic record used ONLY to measure which fields the origin key depends on. Every value is
   distinct and obviously unreal, so no probe value can be mistaken for a claim's. */
const KEY_PROBE_RECORD = Object.freeze({
  originToolId: 'probe-origin-tool',
  thesisFamily: 'probe-thesis-family',
  subjects: ['PROBEONE'],
  actionFamily: 'probe-action-family',
  horizon: 'probe-horizon',
  trigger: 'probe-trigger',
  invalidation: 'probe-invalidation',
  rationaleEvidenceIds: ['probe-evidence'],
  confidenceBand: 'probe-band',
  confidenceScore: 0.25,
  applicability: 'probe-applicability'
});

function probeOriginKey(patch) {
  return foundation.deriveRecommendationKeys({ ...KEY_PROBE_RECORD, ...patch }).originRecommendationKey;
}

/* A field belongs to the origin key exactly when changing it moves the key. Nothing here restates
   the producer's term list; the list is read off the producer by perturbation. */
const ORIGIN_KEY_MEASUREMENT = (() => {
  const baseline = probeOriginKey({});
  const contributing = [];
  const ignored = [];
  for (const field of Object.keys(KEY_PROBE_RECORD)) {
    const value = KEY_PROBE_RECORD[field];
    const perturbed = Array.isArray(value)
      ? ['PROBETWO']
      : (typeof value === 'number' ? value + 1 : `${value}-perturbed`);
    (probeOriginKey({ [field]: perturbed }) === baseline ? ignored : contributing).push(field);
  }
  return { contributing: Object.freeze(contributing.sort()), ignored: Object.freeze(ignored.sort()) };
})();

/** The fields the shipped producer actually folds into `originRecommendationKey`. */
export const ORIGIN_KEY_TERMS = ORIGIN_KEY_MEASUREMENT.contributing;

/* The producer derives THREE fingerprints from one record, so the fields the origin key ignores
   must still be PRESENT. They are supplied as `null`, and the substitution the bridge actually
   performs is asserted here rather than reasoned about: an inert sentinel is the whole reason a
   claim that supplies none of these can still derive the reducer's own key. */
const ORIGIN_KEY_SENTINELS = Object.freeze(
  Object.fromEntries(ORIGIN_KEY_MEASUREMENT.ignored.map((field) => [field, null]))
);
if (probeOriginKey(ORIGIN_KEY_SENTINELS) !== probeOriginKey({})) {
  throw new Error('brief-resolve-outcomes: the observation-only sentinel moves originRecommendationKey');
}

/* One reducer term to the CLAIM field it is read from. Each source is a hashed claim term, which
   is what makes the bridge a refinement. `bindToVocabulary` asserts this table covers the
   MEASURED set exactly, so a producer that began folding in a new field fails at load rather than
   deriving a key from a term no claim ever supplied. */
const ORIGIN_KEY_SOURCES = bindToVocabulary(ORIGIN_KEY_TERMS, {
  originToolId: { read: (claim, originToolId) => originToolId, field: 'toolsRegistry' },
  thesisFamily: { read: (claim) => claim?.thesisFamily, field: 'thesisFamily' },
  subjects: { read: (claim) => claim?.subject?.resolvesTo, field: 'subject.resolvesTo' },
  actionFamily: { read: (claim) => claim?.actionFamily, field: 'actionFamily' },
  horizon: { read: (claim) => claim?.horizon?.authoredBand, field: 'horizon.authoredBand' }
}, 'origin-key term');

/**
 * The tool the pipeline publishes recommendations under, READ FROM THE REGISTRY.
 *
 * `tools.json` carries `experience.kind === "market-action-center"` on exactly one tool, so the
 * id is a measured property of the registry rather than a second copy of a string that could
 * later disagree with it. Zero or several is a substrate defect and refuses.
 *
 * The selected tool is cross-checked through the shipped `resolveCitedToolId`, which resolves a
 * registry FILE to its id: the experience-kind lookup and the shipped reader must name the same
 * tool, or the registry is inconsistent and no id here is trustworthy.
 */
export const ORIGIN_EXPERIENCE_KIND = 'market-action-center';

export function originToolIdFor(toolsRegistry) {
  const tools = Array.isArray(toolsRegistry?.tools)
    ? toolsRegistry.tools
    : (Array.isArray(toolsRegistry) ? toolsRegistry : null);
  if (tools === null) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'tools-registry-invalid', 'toolsRegistry');
  }
  const matched = tools.filter((tool) => tool?.experience?.kind === ORIGIN_EXPERIENCE_KIND);
  if (matched.length !== 1) {
    return refusal(
      claims.CONTRACT_VIOLATION_CODE,
      matched.length === 0 ? 'origin-experience-absent' : 'origin-experience-ambiguous',
      'toolsRegistry'
    );
  }
  const originToolId = matched[0].id;
  if (typeof originToolId !== 'string' || originToolId.length === 0) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'origin-tool-id-absent', 'toolsRegistry');
  }
  if (claims.resolveCitedToolId(matched[0].file, toolsRegistry) !== originToolId) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'origin-tool-registry-disagrees', 'toolsRegistry');
  }
  return { ok: true, originToolId };
}

/* Absent FOR IDENTITY. `undefined` is the only value the producer itself rejects, so every other
   shape of absence has to be caught before the call or it becomes a well-formed key naming a
   recommendation that could never have existed. */
function originTermAbsent(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) {
    return value.length === 0 || value.some((entry) => typeof entry !== 'string' || entry.length === 0);
  }
  return false;
}

/** The claim, read into the record shape `deriveRecommendationKeys` consumes. */
export function recommendationTermsFor(claim, originToolId) {
  const terms = { ...ORIGIN_KEY_SENTINELS };
  for (const term of ORIGIN_KEY_TERMS) {
    const source = ORIGIN_KEY_SOURCES[term];
    const value = source.read(claim, originToolId);
    if (originTermAbsent(value)) {
      return refusal(claims.CONTRACT_VIOLATION_CODE, 'origin-key-term-absent', source.field);
    }
    terms[term] = value;
  }
  return { ok: true, terms };
}

/** The reducer key this claim binds to, derived by the shipped producer and never authored here. */
export function originRecommendationKeyFor(claim, toolsRegistry) {
  const originTool = originToolIdFor(toolsRegistry);
  if (!originTool.ok) return originTool;
  const built = recommendationTermsFor(claim, originTool.originToolId);
  if (!built.ok) return built;
  const derived = foundation.deriveRecommendationKeys(built.terms);
  return { ok: true, originRecommendationKey: derived.originRecommendationKey, terms: built.terms };
}

/** The same key in the shape the resolution object records it, outside the content address. */
export function lifecycleBindingFor(claim, toolsRegistry) {
  const derived = originRecommendationKeyFor(claim, toolsRegistry);
  if (!derived.ok) return derived;
  return { ok: true, lifecycleBinding: { originRecommendationKey: derived.originRecommendationKey } };
}

/* The two entry states the bridge distinguishes. Declared once here and proven against the
   reducer by execution in T-04-I1, which closes an entry and reads both back off the shipped
   reduction rather than trusting either string. */
export const LIVE_ENTRY_STATE = 'active';
export const CLOSED_ENTRY_STATE = 'closed';

/** Why a derived key was left out of a closing pass. Not a refusal: a re-run is a normal event. */
export const NOT_DUE_REASON = 'entry-not-due';

/**
 * The due set: the keys the reducer still calls live.
 *
 * This IS the idempotence mechanism, not a check bolted on beside one. A claim is closable while
 * its lifecycle entry is live and at no other time, so a second pass over a reduction the first
 * pass produced has an empty due set and therefore nothing to hand the reducer.
 */
export function dueEntryKeys(index) {
  const entries = index?.entries;
  if (entries === null || typeof entries !== 'object' || Array.isArray(entries)) {
    return refusal(claims.CONTRACT_VIOLATION_CODE, 'lifecycle-index-invalid', 'index.entries');
  }
  const due = Object.keys(entries).filter((key) => entries[key]?.state === LIVE_ENTRY_STATE).sort();
  return { ok: true, dueEntryKeys: Object.freeze(due) };
}

/**
 * The single closing pass: `current: []` and the verdicts as `run.closures`.
 *
 * Empty `current` is the discipline, not an optimisation. A resolver that also proposed would hit
 * `recommendation-closure-still-active` on every key it was trying to close, because the
 * foundation refuses to close a key the same run re-proposes.
 */
export function applyClosures(index, closures, run) {
  const reduced = foundation.reduceRecommendationEvents(index ?? null, [], { ...run, closures });
  if (reduced.ok !== true) return { ok: false, error: reduced.error };
  return { ok: true, events: reduced.value.events, index: reduced.value.index };
}

/**
 * Verdicts to lifecycle events: derive each key, gate on the due set, then ONE reducer call.
 *
 * A key the ledger has never seen is deliberately NOT filtered out here — it is handed to the
 * reducer, which refuses it `recommendation-closure-key-absent`. The gate's only job is to
 * SUPPRESS an entry the reducer has already closed; letting it also swallow an unknown key would
 * turn a real mismatch between the claim store and the ledger into a silent skip.
 *
 * A key already scheduled by this pass refuses rather than closing twice. Two claims resolving to
 * one lifecycle entry is a genuine ambiguity — the closures carry different reason codes — and
 * appending both is the same duplicate the due-set gate exists to prevent, one run earlier.
 *
 * An underivable key refuses the WHOLE pass. Dropping the claim would leave it silently
 * unresolved and still counted as open, which is the accounting error the ledger exists to avoid.
 */
export function closeDueClaims(input) {
  const due = dueEntryKeys(input?.index);
  if (!due.ok) return due;
  const entries = input.index.entries;
  const dueSet = new Set(due.dueEntryKeys);

  const closures = [];
  const skipped = [];
  const scheduled = new Set();
  for (const verdict of input.verdicts) {
    const derived = originRecommendationKeyFor(verdict.claim, input.toolsRegistry);
    if (!derived.ok) return derived;
    const originRecommendationKey = derived.originRecommendationKey;

    if (scheduled.has(originRecommendationKey)) {
      return refusal(claims.CONTRACT_VIOLATION_CODE, 'duplicate-closure-key-in-pass', 'verdicts');
    }
    if (entries[originRecommendationKey] !== undefined && !dueSet.has(originRecommendationKey)) {
      skipped.push({
        originRecommendationKey,
        claimHash: verdict.claim?.claimHash ?? null,
        reason: NOT_DUE_REASON,
        state: entries[originRecommendationKey].state
      });
      continue;
    }
    scheduled.add(originRecommendationKey);
    closures.push({
      originRecommendationKey,
      eventType: verdict.closureEventType,
      reasonCode: verdict.reasonCode
    });
  }

  const applied = applyClosures(input.index, closures, input.run);
  if (!applied.ok) return applied;
  return {
    ok: true,
    closures: Object.freeze(closures),
    skipped: Object.freeze(skipped),
    events: applied.events,
    index: applied.index
  };
}
