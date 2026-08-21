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
